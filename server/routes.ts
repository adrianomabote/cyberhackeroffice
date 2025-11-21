import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertVelaSchema, manutencaoSchema, sinaisManualSchema, type UltimaVelaResponse, type PrevisaoResponse, type EstatisticasResponse, type PadroesResponse, type ManutencaoStatus, type SinaisManual } from "../shared/schema";
import { z } from "zod";

// Função que detecta oportunidades de entrada analisando padrões
function analisarOportunidadeEntrada(velas: Array<{ multiplicador: number }>) {
  if (velas.length < 5) {
    return {
      multiplicador: null,
      sinal: "AGUARDAR",
      confianca: "baixa",
      motivo: "Aguardando mais dados",
    };
  }

  const ultimas = velas.slice(-20);
  const multiplicadores = ultimas.map(v => v.multiplicador);
  const n = multiplicadores.length;
  const ultimas5 = multiplicadores.slice(-5);
  const ultimas10 = multiplicadores.slice(-10);

  // Calcular médias
  const media5 = ultimas5.reduce((a, b) => a + b, 0) / ultimas5.length;
  const media10 = ultimas10.reduce((a, b) => a + b, 0) / Math.min(ultimas10.length, 10);
  const mediaGeral = multiplicadores.reduce((a, b) => a + b, 0) / n;

  // Detectar padrões favoráveis
  let pontos = 0;
  let motivos: string[] = [];

  // Padrão 1: Sequência de baixos (3+ velas <2x nas últimas 5)
  const baixosRecentes = ultimas5.filter(m => m < 2).length;
  if (baixosRecentes >= 3) {
    pontos += 3;
    motivos.push(`${baixosRecentes} velas baixas consecutivas`);
  }

  // Padrão 2: Última vela baixa (<2.5x) após média razoável
  const ultimaVela = multiplicadores[multiplicadores.length - 1];
  if (ultimaVela < 2.5 && media10 > 2.5) {
    pontos += 2;
    motivos.push("Última vela baixa após média alta");
  }

  // Padrão 3: Tendência de recuperação (média das 5 últimas < média geral)
  if (media5 < mediaGeral * 0.85) {
    pontos += 2;
    motivos.push("Tendência de recuperação detectada");
  }

  // Padrão 4: Não houve alto recente (nenhuma vela >5x nas últimas 3)
  const ultimas3 = multiplicadores.slice(-3);
  const altosRecentes = ultimas3.filter(m => m > 5).length;
  if (altosRecentes === 0) {
    pontos += 1;
    motivos.push("Sem altos extremos recentes");
  }

  // Padrão 5: Volatilidade moderada (não muito caótico)
  const variancia = multiplicadores.reduce((sum, m) => sum + Math.pow(m - mediaGeral, 2), 0) / n;
  const desvioPadrao = Math.sqrt(variancia);
  const cv = desvioPadrao / mediaGeral;
  if (cv < 0.6) {
    pontos += 1;
    motivos.push("Volatilidade controlada");
  }

  // Calcular previsão usando EMA
  const alpha = 0.3;
  let ema = multiplicadores[0];
  for (let i = 1; i < n; i++) {
    ema = alpha * multiplicadores[i] + (1 - alpha) * ema;
  }

  // Ajustar previsão baseado em padrões
  let previsao = ema;
  if (baixosRecentes >= 3) previsao *= 1.15;
  if (media5 < 2.2) previsao *= 1.1;

  previsao = Math.round(Math.max(1.5, Math.min(10, previsao)) * 100) / 100;

  // Determinar sinal baseado nos pontos
  let sinal = "AGUARDAR";
  let confianca = "baixa";
  let multiplicadorSacar = previsao;

  if (pontos >= 6) {
    sinal = "ENTRAR";
    confianca = "alta";
    // Confiança alta: recomendar sacar baseado na média geral - MUITO CONSERVADOR
    if (mediaGeral < 2.5) {
      multiplicadorSacar = 2.0; // Após sequência muito baixa, sacar em 2.00x
    } else if (mediaGeral < 3.5) {
      multiplicadorSacar = 2.5; // Média normal, sacar em 2.50x
    } else if (mediaGeral < 5.0) {
      multiplicadorSacar = 3.0; // Média alta, sacar em 3.00x
    } else if (mediaGeral < 7.0) {
      multiplicadorSacar = 4.0; // Média muito alta, sacar em 4.00x
    } else {
      // MUITO RARO: só recomendar 10.00x se média geral >= 7.0
      // e teve pelo menos 2 velas >= 8.0x nas últimas 10
      const altosExtremos = ultimas10.filter(m => m >= 8.0).length;
      if (altosExtremos >= 2) {
        multiplicadorSacar = 10.0; // Apenas em condições extremamente favoráveis
      } else {
        multiplicadorSacar = 5.0; // Caso contrário, mais conservador
      }
    }
  } else if (pontos >= 4) {
    sinal = "ENTRAR";
    confianca = "média";
    // Confiança média: muito conservador
    if (mediaGeral < 2.5) {
      multiplicadorSacar = 2.0;
    } else {
      multiplicadorSacar = 2.5; // Mais seguro com confiança média
    }
  } else if (pontos >= 2) {
    sinal = "POSSÍVEL";
    confianca = "baixa";
    multiplicadorSacar = 2.0; // Se entrar, sacar rápido
  }

  // Garantir que o multiplicador está arredondado corretamente
  multiplicadorSacar = Math.round(multiplicadorSacar * 100) / 100;

  return {
    multiplicador: multiplicadorSacar,
    sinal,
    confianca,
    motivo: motivos.length > 0 ? motivos.join(" | ") : "Análise em andamento",
    pontos, // Para debug
  };
}

// ESTADO GLOBAL - Controlar entradas consecutivas
const signalState = {
  lastSignalId: null as string | null,
  lastSignalTime: null as number | null,
  velasAposUltimoSinal: 0,
  falhouAnterior: false,
  multiplicadorAnterior: 0,
  attempts: 0,
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Habilitar CORS para permitir chamadas do script externo
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');

    // Preflight requests
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }

    next();
  });

  // GET /api/cyber - Lista todos os endpoints disponíveis
  app.get("/api/cyber", (req, res) => {
    res.json({
      nome: "CYBER HACKER - Aviator Analysis API",
      versao: "1.0.0",
      endpoints: [
        {
          metodo: "GET",
          rota: "/api/cyber",
          descricao: "Lista todos os endpoints disponíveis"
        },
        {
          metodo: "POST",
          rota: "/api/velas/cyber",
          descricao: "Recebe multiplicadores do Aviator",
          body: {
            multiplicador: "number (obrigatório)"
          }
        },
        {
          metodo: "GET",
          rota: "/api/velas/cyber",
          descricao: "Retorna histórico de todas as velas (últimas 100)",
          query: {
            limit: "number (opcional, padrão: 100)"
          }
        },
        {
          metodo: "GET",
          rota: "/api/apos/cyber",
          descricao: "Retorna última vela registrada"
        },
        {
          metodo: "GET",
          rota: "/api/sacar/cyber",
          descricao: "Retorna previsão ML da próxima vela"
        },
        {
          metodo: "GET",
          rota: "/api/historico/cyber",
          descricao: "Retorna histórico de velas",
          query: {
            limit: "number (opcional, padrão: 100)"
          }
        },
        {
          metodo: "GET",
          rota: "/api/estatisticas/cyber",
          descricao: "Retorna estatísticas avançadas (médias móveis, tendência, volatilidade)"
        },
        {
          metodo: "GET",
          rota: "/api/padroes/cyber",
          descricao: "Detecta padrões favoráveis nas últimas velas"
        }
      ]
    });
  });

  // GET /api/velas/cyber - Retorna histórico de todas as velas em formato simples
  app.get("/api/velas/cyber", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
      const historico = await storage.getHistorico(limit);

      // Inverter para mostrar da mais recente para a mais antiga (ordem de fila)
      const velasEmFila = [...historico].reverse();

      // Extrair apenas os multiplicadores em array simples
      const multiplicadores = velasEmFila.map(vela => vela.multiplicador);

      res.json({
        ok: "verdade",
        velas: multiplicadores,
      });
    } catch (error) {
      res.status(500).json({
        ok: "falso",
        velas: [],
        error: "Erro ao buscar velas",
      });
    }
  });

  // POST /api/velas/cyber - Recebe multiplicadores do Aviator
  app.post("/api/velas/cyber", async (req, res) => {
    try {
      // Permitir -1 como sinal especial para três pontinhos
      const multiplicador = req.body.multiplicador;

      if (multiplicador === -1) {
        // Três pontinhos enviado manualmente
        const vela = await storage.addVela({ multiplicador: -1 });
        return res.json({
          success: true,
          data: {
            id: vela.id,
            multiplicador: vela.multiplicador,
            timestamp: vela.timestamp,
          },
          message: "Três pontinhos enviado"
        });
      }

      const validatedData = insertVelaSchema.parse(req.body);
      const vela = await storage.addVela(validatedData);

      res.json({
        success: true,
        data: {
          id: vela.id,
          multiplicador: vela.multiplicador,
          timestamp: vela.timestamp,
        }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: "Dados inválidos",
          details: error.errors,
        });
      }

      res.status(500).json({
        success: false,
        error: "Erro ao processar vela",
      });
    }
  });

  // GET /api/apos/cyber - Retorna última vela registrada
  app.get("/api/apos/cyber", async (req, res) => {
    try {
      const ultimaVela = await storage.getUltimaVela();

      const response: UltimaVelaResponse = {
        multiplicador: ultimaVela ? ultimaVela.multiplicador : null,
        timestamp: ultimaVela ? ultimaVela.timestamp.toISOString() : undefined,
      };

      // Log para debug - ver exatamente o que está sendo retornado
      console.log('[APÓS] Última vela do DB:', {
        multiplicador: response.multiplicador,
        timestamp: response.timestamp,
        id: ultimaVela?.id,
      });

      // Headers para evitar cache
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');

      res.json(response);
    } catch (error) {
      console.error('[APÓS] Erro ao buscar última vela:', error);
      res.status(500).json({
        multiplicador: null,
        error: "Erro ao buscar última vela",
      });
    }
  });

  // GET /api/sacar/cyber - Retorna análise de oportunidade de entrada
  app.get("/api/sacar/cyber", async (req, res) => {
    try {
      // Buscar mais velas para análise mais precisa
      const historico = await storage.getHistorico(50);
      const base = historico[0];
      const analise = analisarOportunidadeEntrada(historico);

      // Contar velas após último sinal
      if (signalState.lastSignalTime) {
        const agora = Date.now();
        const tempoDecorrido = agora - signalState.lastSignalTime;
        signalState.velasAposUltimoSinal = Math.floor(tempoDecorrido / 1000); // Aproximadamente
      }

      // Incrementar contador de tentativas
      signalState.attempts += 1;

      // Verificar se já enviamos sinal para esta vela
      const baseIdStr = base?.id ? String(base.id) : null;
      const jaEnviouSinalParaEstaVela = signalState.lastSignalId === baseIdStr;

      console.log('[SACAR] Estado:', {
        baseAtual: baseIdStr,
        ultimoSignal: signalState.lastSignalId,
        jaEnviou: jaEnviouSinalParaEstaVela,
        velasApos: signalState.velasAposUltimoSinal,
        analiseConf: analise.confianca,
        tentativas: signalState.attempts
      });

      // Se já enviou sinal para essa vela, retornar "..."
      if (jaEnviouSinalParaEstaVela && analise.sinal === "ENTRAR") {
        console.log('[SACAR] BLOQUEANDO - Já enviou ENTRAR para vela', baseIdStr);
        return res.json({
          multiplicador: -1,
          sinal: "...",
          confianca: "baixa",
          motivo: "Aguardando nova vela",
        });
      }

      // Se sinal é ENTRAR e ainda não enviou para essa vela
      if (analise.sinal === "ENTRAR" && !jaEnviouSinalParaEstaVela) {
        // Registrar que enviamos sinal para esta vela
        signalState.lastSignalId = baseIdStr;
        signalState.lastSignalTime = Date.now();
        signalState.velasAposUltimoSinal = 0;
        signalState.multiplicadorAnterior = analise.multiplicador || 0;

        console.log(`[SACAR] ✅ NOVO SINAL ENTRAR para vela ${baseIdStr} com multiplicador ${analise.multiplicador?.toFixed(2)}x`);
      }

      res.json({
        multiplicador: analise.sinal === "ENTRAR" ? analise.multiplicador : -1,
        sinal: analise.sinal === "ENTRAR" ? "ENTRAR" : "...",
        confianca: analise.confianca,
        motivo: analise.motivo,
      });
    } catch (error) {
      res.status(500).json({
        multiplicador: null,
        sinal: "AGUARDAR",
        confianca: "baixa",
        error: "Erro ao calcular análise",
      });
    }
  });

  // GET /api/historico/cyber - Retorna histórico completo de velas
  app.get("/api/historico/cyber", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
      const historico = await storage.getHistorico(limit);

      res.json({
        velas: historico,
        total: historico.length,
      });
    } catch (error) {
      res.status(500).json({
        velas: [],
        total: 0,
        error: "Erro ao buscar histórico",
      });
    }
  });

  // GET /api/padroes/cyber - Detecta padrões favoráveis nas últimas velas
  app.get("/api/padroes/cyber", async (req, res) => {
    try {
      const historico = await storage.getHistorico(15);
      const padroes: PadroesResponse['padroes'] = [];

      if (historico.length < 5) {
        return res.json({ padroes: [] });
      }

      const multiplicadores = historico.map(v => v.multiplicador);
      const ultimas5 = multiplicadores.slice(-5);
      const ultimas10 = multiplicadores.slice(-10);

      // Padrão 1: Sequência de multiplicadores baixos (<2x)
      const baixosConsecutivos = ultimas5.filter(m => m < 2).length;
      if (baixosConsecutivos >= 3) {
        padroes.push({
          tipo: 'sequencia_baixa',
          mensagem: `${baixosConsecutivos} multiplicadores baixos (<2x) nas últimas 5 velas`,
          severidade: 'warning',
        });
      }

      // Padrão 2: Alta volatilidade (amplitude > 3x nas últimas 5 velas)
      const maxRecente = Math.max(...ultimas5);
      const minRecente = Math.min(...ultimas5);
      const amplitudeRecente = maxRecente - minRecente;
      if (amplitudeRecente > 3) {
        padroes.push({
          tipo: 'alta_volatilidade',
          mensagem: `Alta volatilidade detectada: amplitude de ${amplitudeRecente.toFixed(2)}x`,
          severidade: 'info',
        });
      }

      // Padrão 3: Tendência forte (variação > 15%)
      if (ultimas10.length === 10) {
        const metade = 5;
        const primeiraMetade = ultimas10.slice(0, metade);
        const segundaMetade = ultimas10.slice(metade);
        const media1 = primeiraMetade.reduce((a, b) => a + b, 0) / metade;
        const media2 = segundaMetade.reduce((a, b) => a + b, 0) / metade;
        const variacao = ((media2 - media1) / media1) * 100;

        if (Math.abs(variacao) > 15) {
          padroes.push({
            tipo: 'tendencia_forte',
            mensagem: `Tendência ${variacao > 0 ? 'de alta' : 'de baixa'} forte: ${Math.abs(variacao).toFixed(1)}%`,
            severidade: variacao > 0 ? 'success' : 'warning',
          });
        }
      }

      // Padrão 4: Oportunidade após sequência de baixos
      const ultima = multiplicadores[multiplicadores.length - 1];
      if (baixosConsecutivos >= 2 && ultima < 2.5) {
        padroes.push({
          tipo: 'oportunidade',
          mensagem: 'Possível oportunidade: padrão de recuperação após sequência baixa',
          severidade: 'success',
        });
      }

      res.json({ padroes });
    } catch (error) {
      res.status(500).json({
        padroes: [],
        error: "Erro ao detectar padrões",
      });
    }
  });

  // GET /api/estatisticas/cyber - Retorna estatísticas avançadas
  app.get("/api/estatisticas/cyber", async (req, res) => {
    try {
      const historico = await storage.getHistorico(20); // Últimas 20 velas para cálculos

      if (historico.length === 0) {
        return res.json({
          mediasMoveis: { media5: null, media10: null, media20: null },
          tendencia: { tipo: 'estável', percentual: 0 },
          volatilidade: { valor: 0, nivel: 'baixa' },
          extremos: { maximo: 0, minimo: 0, amplitude: 0 },
        } as EstatisticasResponse);
      }

      const multiplicadores = historico.map(v => v.multiplicador);

      // Calcular médias móveis
      const calcularMedia = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;

      const media5 = multiplicadores.length >= 5
        ? calcularMedia(multiplicadores.slice(-5))
        : null;
      const media10 = multiplicadores.length >= 10
        ? calcularMedia(multiplicadores.slice(-10))
        : null;
      const media20 = multiplicadores.length >= 20
        ? calcularMedia(multiplicadores.slice(-20))
        : null;

      // Calcular tendência (usar APENAS últimas 10 velas para capturar comportamento recente)
      let tipoTendencia: 'alta' | 'baixa' | 'estável' = 'estável';
      let variacao = 0;

      if (multiplicadores.length >= 2) {
        // Usar só últimas 10 velas para tendência (não todas as 20)
        const velasParaTendencia = multiplicadores.slice(-10);
        const metade = Math.floor(velasParaTendencia.length / 2);
        const primeiraMetade = velasParaTendencia.slice(0, metade);
        const segundaMetade = velasParaTendencia.slice(metade);

        if (primeiraMetade.length > 0 && segundaMetade.length > 0) {
          const mediaPrimeira = calcularMedia(primeiraMetade);
          const mediaSegunda = calcularMedia(segundaMetade);
          variacao = ((mediaSegunda - mediaPrimeira) / mediaPrimeira) * 100;

          if (variacao > 5) tipoTendencia = 'alta';
          else if (variacao < -5) tipoTendencia = 'baixa';
          else tipoTendencia = 'estável';
        }
      }

      // Calcular volatilidade (desvio padrão)
      const media = calcularMedia(multiplicadores);
      const variancia = multiplicadores.reduce((acc, val) => acc + Math.pow(val - media, 2), 0) / multiplicadores.length;
      const desvioPadrao = Math.sqrt(variancia);
      const coeficienteVariacao = (desvioPadrao / media) * 100;

      let nivelVolatilidade: 'baixa' | 'média' | 'alta';
      if (coeficienteVariacao < 30) nivelVolatilidade = 'baixa';
      else if (coeficienteVariacao < 50) nivelVolatilidade = 'média';
      else nivelVolatilidade = 'alta';

      // Calcular extremos
      const maximo = Math.max(...multiplicadores);
      const minimo = Math.min(...multiplicadores);
      const amplitude = maximo - minimo;

      const estatisticas: EstatisticasResponse = {
        mediasMoveis: {
          media5: media5 ? Math.round(media5 * 100) / 100 : null,
          media10: media10 ? Math.round(media10 * 100) / 100 : null,
          media20: media20 ? Math.round(media20 * 100) / 100 : null,
        },
        tendencia: {
          tipo: tipoTendencia,
          percentual: Math.round(variacao * 10) / 10,
        },
        volatilidade: {
          valor: Math.round(coeficienteVariacao * 10) / 10,
          nivel: nivelVolatilidade,
        },
        extremos: {
          maximo: Math.round(maximo * 100) / 100,
          minimo: Math.round(minimo * 100) / 100,
          amplitude: Math.round(amplitude * 100) / 100,
        },
      };

      res.json(estatisticas);
    } catch (error) {
      res.status(500).json({
        mediasMoveis: { media5: null, media10: null, media20: null },
        tendencia: { tipo: 'estável', percentual: 0 },
        volatilidade: { valor: 0, nivel: 'baixa' },
        extremos: { maximo: 0, minimo: 0, amplitude: 0 },
        error: "Erro ao calcular estatísticas",
      });
    }
  });

  // GET /api/manutencao/cyber - Retorna status de manutenção
  app.get("/api/manutencao/cyber", async (req, res) => {
    try {
      const status = await storage.getManutencaoStatus();
      res.json(status);
    } catch (error) {
      console.error('[MANUTENÇÃO] Erro ao buscar status:', error);
      res.status(500).json({
        ativo: false,
        mensagem: "",
        motivo: "",
        error: "Erro ao buscar status de manutenção",
      });
    }
  });

  // POST /api/manutencao/cyber - Ativa/desativa manutenção
  app.post("/api/manutencao/cyber", async (req, res) => {
    try {
      const validatedData = manutencaoSchema.parse(req.body);
      const status = await storage.setManutencaoStatus(validatedData);

      console.log('[MANUTENÇÃO] Status alterado:', {
        ativo: status.ativo,
        mensagem: status.mensagem,
        motivo: status.motivo,
      });

      res.json({
        success: true,
        data: status,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: "Dados inválidos",
          details: error.errors,
        });
      }

      console.error('[MANUTENÇÃO] Erro ao atualizar status:', error);
      res.status(500).json({
        success: false,
        error: "Erro ao atualizar status de manutenção",
      });
    }
  });

  // GET /api/sinais-manual/cyber - Retorna sinais manuais
  app.get("/api/sinais-manual/cyber", async (req, res) => {
    try {
      const sinais = await storage.getSinaisManual();
      res.json(sinais);
    } catch (error) {
      console.error('[SINAIS MANUAL] Erro ao buscar:', error);
      res.status(500).json({
        success: false,
        error: "Erro ao buscar sinais manuais",
      });
    }
  });

  // POST /api/sinais-manual/cyber - Define sinais manuais
  app.post("/api/sinais-manual/cyber", async (req, res) => {
    try {
      const validatedData = sinaisManualSchema.parse(req.body);
      const sinais = await storage.setSinaisManual(validatedData);

      console.log('[SINAIS MANUAL] Definidos:', {
        ativo: sinais.ativo,
        apos: sinais.apos,
        sacar: sinais.sacar,
      });

      res.json({
        success: true,
        data: sinais,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: "Dados inválidos",
          details: error.errors,
        });
      }

      console.error('[SINAIS MANUAL] Erro ao definir:', error);
      res.status(500).json({
        success: false,
        error: "Erro ao definir sinais manuais",
      });
    }
  });

  // Rotas de usuários
  app.post("/api/usuarios/registrar", async (req, res) => {
    try {
      const { email, nome, senha } = req.body;
      
      console.log('[REGISTRAR] Dados recebidos:', { email, nome });
      
      if (!email || !nome || !senha) {
        return res.status(400).json({
          success: false,
          error: "Email, nome e senha são obrigatórios",
        });
      }

      const { storageUsuarios } = await import("./storage");
      const usuarioExistente = await storageUsuarios.obterUsuarioPorEmail(email);
      
      if (usuarioExistente) {
        return res.status(400).json({
          success: false,
          error: "Email já cadastrado",
        });
      }

      const usuario = await storageUsuarios.criarUsuario({ email, nome, senha });
      
      console.log('[REGISTRAR] Usuário criado com sucesso:', usuario.id);
      
      res.json({
        success: true,
        message: "Cadastro enviado para aprovação do administrador",
        data: { id: usuario.id, email: usuario.email },
      });
    } catch (error) {
      console.error('[REGISTRAR] Erro detalhado:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Erro ao registrar usuário",
      });
    }
  });

  app.post("/api/usuarios/login", async (req, res) => {
    try {
      const { email, senha } = req.body;
      
      console.log('[LOGIN] Tentativa de login:', email);
      
      // Validar dados de entrada
      if (!email || !senha) {
        return res.status(400).json({
          success: false,
          error: "Email e senha são obrigatórios",
        });
      }

      // Validar formato do email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        console.log('[LOGIN] Email com formato inválido:', email);
        return res.status(400).json({
          success: false,
          error: "Formato de email inválido",
        });
      }

      const { storageUsuarios } = await import("./storage");
      
      // Buscar usuário com tratamento de erro
      let usuarioExistente;
      try {
        usuarioExistente = await storageUsuarios.obterUsuarioPorEmail(email.toLowerCase().trim());
      } catch (dbError) {
        console.error('[LOGIN] Erro ao buscar usuário no banco:', dbError);
        return res.status(500).json({
          success: false,
          error: "Erro no servidor. Tente novamente em alguns instantes.",
        });
      }
      
      // VALIDAÇÃO CRÍTICA: Usuário DEVE existir no banco de dados
      if (!usuarioExistente) {
        console.log('[LOGIN] BLOQUEADO - Usuário não encontrado no banco:', email);
        return res.status(401).json({
          success: false,
          error: "Conta não registrada. Registre-se primeiro.",
        });
      }

      // VALIDAÇÃO CRÍTICA: Verificar se tem ID válido
      if (!usuarioExistente.id || !usuarioExistente.email) {
        console.error('[LOGIN] BLOQUEADO - Dados de usuário inválidos:', email);
        return res.status(401).json({
          success: false,
          error: "Dados de conta inválidos. Entre em contato com o administrador.",
        });
      }

      // Log detalhado do usuário encontrado
      console.log('[LOGIN] Usuário encontrado no banco:', { 
        id: usuarioExistente.id, 
        email: usuarioExistente.email,
        nome: usuarioExistente.nome,
        aprovado: usuarioExistente.aprovado, 
        ativo: usuarioExistente.ativo,
        timestamp: new Date().toISOString()
      });

      // VALIDAÇÃO CRÍTICA 1: Verificar se está aprovado
      if (usuarioExistente.aprovado !== 'true') {
        console.log('[LOGIN] BLOQUEADO - Conta não aprovada:', email);
        return res.status(403).json({
          success: false,
          error: "Sua conta ainda não foi aprovada. Aguarde a aprovação do administrador.",
        });
      }

      // VALIDAÇÃO CRÍTICA 2: Verificar se está ativo
      if (usuarioExistente.ativo !== 'true') {
        console.log('[LOGIN] BLOQUEADO - Conta inativa:', email);
        return res.status(403).json({
          success: false,
          error: "Sua conta está desativada. Entre em contato com o administrador.",
        });
      }

      // VALIDAÇÃO CRÍTICA 3: Verificar se tem senha cadastrada
      if (!usuarioExistente.senha || usuarioExistente.senha.length < 10) {
        console.error('[LOGIN] BLOQUEADO - Senha inválida ou não existe:', email);
        return res.status(401).json({
          success: false,
          error: "Dados de conta corrompidos. Entre em contato com o administrador.",
        });
      }

      // Verificar senha
      let usuario;
      try {
        usuario = await storageUsuarios.verificarUsuario(email.toLowerCase().trim(), senha);
      } catch (verifyError) {
        console.error('[LOGIN] Erro ao verificar senha:', verifyError);
        return res.status(500).json({
          success: false,
          error: "Erro ao verificar credenciais. Tente novamente.",
        });
      }

      if (!usuario) {
        console.log('[LOGIN] BLOQUEADO - Senha incorreta para:', email);
        return res.status(401).json({
          success: false,
          error: "Senha incorreta. Verifique e tente novamente.",
        });
      }

      // VALIDAÇÃO FINAL: Garantir que todos os dados estão corretos antes de permitir
      if (!usuario.id || !usuario.email || !usuario.nome) {
        console.error('[LOGIN] BLOQUEADO - Dados de usuário incompletos após verificação:', email);
        return res.status(500).json({
          success: false,
          error: "Erro nos dados da conta. Entre em contato com o administrador.",
        });
      }

      // VALIDAÇÃO FINAL: Revalidar aprovado e ativo
      if (usuario.aprovado !== 'true' || usuario.ativo !== 'true') {
        console.error('[LOGIN] BLOQUEADO - Status de conta mudou durante verificação:', email);
        return res.status(403).json({
          success: false,
          error: "Conta não autorizada. Entre em contato com o administrador.",
        });
      }

      console.log('[LOGIN] ✓ LOGIN BEM-SUCEDIDO:', {
        id: usuario.id,
        email: usuario.email,
        nome: usuario.nome,
        timestamp: new Date().toISOString()
      });

      res.json({
        success: true,
        data: { 
          id: usuario.id, 
          email: usuario.email, 
          nome: usuario.nome,
          compartilhamentos: usuario.compartilhamentos,
        },
      });
    } catch (error) {
      console.error('[LOGIN] Erro crítico:', error);
      res.status(500).json({
        success: false,
        error: "Erro no sistema. Por favor, tente novamente em alguns instantes.",
      });
    }
  });

  app.get("/api/usuarios/admin", async (req, res) => {
    try {
      const { storageUsuarios } = await import("./storage");
      const usuarios = await storageUsuarios.listarUsuarios();
      res.json({ success: true, data: usuarios });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: "Erro ao listar usuários",
      });
    }
  });

  app.post("/api/usuarios/aprovar/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { storageUsuarios } = await import("./storage");
      const usuario = await storageUsuarios.aprovarUsuario(id);

      if (!usuario) {
        return res.status(404).json({
          success: false,
          error: "Usuário não encontrado",
        });
      }

      res.json({
        success: true,
        message: "Usuário aprovado com sucesso",
        data: usuario,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: "Erro ao aprovar usuário",
      });
    }
  });

  app.post("/api/usuarios/compartilhar", async (req, res) => {
    try {
      const { email } = req.body;
      const { storageUsuarios } = await import("./storage");
      const usuario = await storageUsuarios.adicionarCompartilhamento(email);

      if (!usuario) {
        return res.status(404).json({
          success: false,
          error: "Usuário não encontrado",
        });
      }

      res.json({
        success: true,
        data: { compartilhamentos: usuario.compartilhamentos },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: "Erro ao registrar compartilhamento",
      });
    }
  });

  app.post("/api/usuarios/admin/criar", async (req, res) => {
    try {
      const { email, nome, senha, dias_acesso } = req.body;
      
      console.log('[ADMIN CRIAR] Dados recebidos:', { email, nome, dias_acesso });
      
      if (!email || !nome || !senha) {
        return res.status(400).json({
          success: false,
          error: "Email, nome e senha são obrigatórios",
        });
      }

      const { storageUsuarios } = await import("./storage");
      
      const usuarioExistente = await storageUsuarios.obterUsuarioPorEmail(email);
      if (usuarioExistente) {
        return res.status(400).json({
          success: false,
          error: "Email já cadastrado",
        });
      }

      const usuario = await storageUsuarios.criarUsuarioAprovado({ 
        email, 
        nome, 
        senha,
        dias_acesso: dias_acesso || 2,
      });
      
      console.log('[ADMIN CRIAR] Usuário criado com sucesso:', usuario.id);
      
      res.json({
        success: true,
        message: "Usuário criado e aprovado automaticamente",
        data: usuario,
      });
    } catch (error) {
      console.error('[ADMIN CRIAR] Erro detalhado:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Erro ao criar usuário",
      });
    }
  });

  app.delete("/api/usuarios/eliminar/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { storageUsuarios } = await import("./storage");
      const sucesso = await storageUsuarios.eliminarUsuario(id);

      if (!sucesso) {
        return res.status(404).json({
          success: false,
          error: "Usuário não encontrado",
        });
      }

      res.json({
        success: true,
        message: "Usuário eliminado com sucesso",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: "Erro ao eliminar usuário",
      });
    }
  });

  app.post("/api/usuarios/desativar/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { storageUsuarios } = await import("./storage");
      const usuario = await storageUsuarios.desativarUsuario(id);

      if (!usuario) {
        return res.status(404).json({
          success: false,
          error: "Usuário não encontrado",
        });
      }

      res.json({
        success: true,
        message: "Usuário desativado com sucesso",
        data: usuario,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: "Erro ao desativar usuário",
      });
    }
  });

  app.post("/api/usuarios/ativar/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { storageUsuarios } = await import("./storage");
      const usuario = await storageUsuarios.ativarUsuario(id);

      if (!usuario) {
        return res.status(404).json({
          success: false,
          error: "Usuário não encontrado",
        });
      }

      res.json({
        success: true,
        message: "Usuário ativado com sucesso",
        data: usuario,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: "Erro ao ativar usuário",
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}