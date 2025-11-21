import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertVelaSchema, manutencaoSchema, sinaisManualSchema, type UltimaVelaResponse, type PrevisaoResponse, type EstatisticasResponse, type PadroesResponse, type ManutencaoStatus, type SinaisManual } from "../shared/schema";
import { z } from "zod";

// Função que detecta oportunidades de entrada analisando padrões
function analisarOportunidadeEntrada(velas: Array<{ multiplicador: number }>) {
  if (velas.length < 15) {
    return {
      multiplicador: 2.00,
      sinal: "AGUARDAR",
      confianca: "baixa",
      motivo: "Aguardando mais dados (mínimo 15 velas)",
      alvos: [2.00, 3.00, 4.00, 7.00, 10.00]
    };
  }

  // Pegar as últimas 50 velas para análise
  const ultimas = velas.slice(-50);
  const multiplicadores = ultimas.map(v => v.multiplicador);
  
  // Diferentes janelas de análise
  const ultimas3 = multiplicadores.slice(-3);
  const ultimas5 = multiplicadores.slice(-5);
  const ultimas10 = multiplicadores.slice(-10);
  const ultimas20 = multiplicadores.slice(-20);
  const ultimas30 = multiplicadores.slice(-30);

  // Cálculo de médias
  const media3 = ultimas3.reduce((a, b) => a + b, 0) / ultimas3.length;
  const media5 = ultimas5.reduce((a, b) => a + b, 0) / ultimas5.length;
  const media10 = ultimas10.reduce((a, b) => a + b, 0) / ultimas10.length;
  const media20 = ultimas20.reduce((a, b) => a + b, 0) / ultimas20.length;
  const media30 = ultimas30.reduce((a, b) => a + b, 0) / ultimas30.length;
  const mediaGeral = multiplicadores.reduce((a, b) => a + b, 0) / multiplicadores.length;

  // Detecção de padrões
  let pontos = 0;
  let motivos: string[] = [];
  const ultimaVela = multiplicadores[multiplicadores.length - 1];
  const penultimaVela = multiplicadores[multiplicadores.length - 2] || 0;
  const antepenultimaVela = multiplicadores[multiplicadores.length - 3] || 0;

  // 1. Análise de sequência de baixos
  const sequenciaBaixas = ultimas5.filter(m => m < 1.8).length;
  if (sequenciaBaixas >= 3) {
    pontos += 4;
    motivos.push(`Sequência de ${sequenciaBaixas} velas baixas < 1.8x`);
  }

  // 2. Tendência de baixa nas médias móveis
  if (media3 < media5 && media5 < media10 && media10 < media20) {
    pontos += 3;
    motivos.push("Tendência de baixa nas médias móveis");
  }

  // 3. Volatilidade recente
  const altosExtremos = ultimas10.filter(m => m > 5).length;
  if (altosExtremos === 0) {
    pontos += 2;
    motivos.push("Sem altos extremos recentes (>5x)");
  }

  // 4. Análise de variação percentual
  const variacao1 = Math.abs((ultimaVela - penultimaVela) / (penultimaVela || 1) * 100) || 0;
  const variacao2 = Math.abs((penultimaVela - antepenultimaVela) / (antepenultimaVela || 1) * 100) || 0;
  
  if (variacao1 < variacao2) {
    pontos += 2;
    motivos.push(`Variação diminuindo (${variacao1.toFixed(1)}% < ${variacao2.toFixed(1)}%)`);
  }

  // 5. Análise de suporte e resistência
  const abaixoDaMedia10 = ultimas3.filter(m => m < media10).length;
  if (abaixoDaMedia10 >= 2) {
    pontos += 2;
    motivos.push(`${abaixoDaMedia10}/3 velas abaixo da média 10`);
  }

  // 6. Análise de força da tendência
  if (media5 < media20) {
    pontos += 1;
    motivos.push(`Média 5 (${media5.toFixed(2)}x) < Média 20 (${media20.toFixed(2)}x)`);
  }

  // 7. Análise de reversão
  if (ultimaVela < 1.5) {
    pontos += 2;
    motivos.push(`Última vela baixa (${ultimaVela.toFixed(2)}x)`);
  }

  // 8. Sequência de baixas
  if (ultimaVela < penultimaVela && penultimaVela < antepenultimaVela) {
    pontos += 2;
    motivos.push("Sequência de 3 velas de baixa");
  }

  // 9. Análise de tendência de longo prazo
  if (media10 < media30) {
    pontos += 1;
    motivos.push(`Tendência de baixa no longo prazo (M10 < M30)`);
  }

  // 10. Análise de distância da média móvel
  const distanciaMedia = Math.abs(ultimaVela - media10) / media10 * 100;
  if (distanciaMedia > 30) {
    pontos += 2;
    motivos.push(`Grande distância da média (${distanciaMedia.toFixed(1)}%)`);
  }

  // Determinar os alvos de saque baseado nos pontos
  const alvos = [2.00, 3.00, 4.00, 6.00, 10.00];
  let alvoRecomendado = 2.00; // Alvo padrão conservador
  let sinal = "AGUARDAR";
  let confianca = "baixa";
  
  // Ajustar estratégia baseado nos pontos
  if (pontos >= 15) {
    sinal = "ENTRAR";
    confianca = "alta";
    alvoRecomendado = 10.00; // Alvo mais alto para sinais fortes
    motivos.push("Sinal forte para alvos altos");
  } 
  else if (pontos >= 12) {
    sinal = "ENTRAR";
    confianca = "média-alta";
    alvoRecomendado = 6.00;
    motivos.push("Bom sinal para alvo médio-alto");
  }
  else if (pontos >= 9) {
    sinal = "ENTRAR";
    confianca = "média";
    alvoRecomendado = 4.00;
    motivos.push("Sinal moderado para alvo médio");
  }
  else if (pontos >= 6) {
    sinal = "ENTRAR";
    confianca = "baixa";
    alvoRecomendado = 3.00;
    motivos.push("Sinal fraco, alvo baixo");
  }
  else if (pontos >= 3) {
    sinal = "AGUARDAR";
    confianca = "muito baixa";
    alvoRecomendado = 2.00;
    motivos.push("Sinal muito fraco, aguardando melhores condições");
  } else {
    sinal = "AGUARDAR";
    confianca = "nenhuma";
    alvoRecomendado = 2.00;
    motivos.push("Sem sinais claros");
  }

  // Ajustar alvo com base na volatilidade recente
  const volatilidade = Math.max(...ultimas10) / Math.min(...ultimas10.filter(x => x > 0));
  if (volatilidade > 3 && alvoRecomendado > 3.00) {
    alvoRecomendado = Math.min(alvoRecomendado * 1.3, 10.00);
    motivos.push(`Ajuste para cima devido à alta volatilidade (${volatilidade.toFixed(2)})`);
  } else if (volatilidade < 1.5 && alvoRecomendado > 2.00) {
    alvoRecomendado = Math.max(alvoRecomendado * 0.8, 2.00);
    motivos.push(`Ajuste para baixo devido à baixa volatilidade (${volatilidade.toFixed(2)})`);
  }

  // Arredondar para o alvo mais próximo
  alvoRecomendado = alvos.reduce((prev, curr) => 
    Math.abs(curr - alvoRecomendado) < Math.abs(prev - alvoRecomendado) ? curr : prev
  );

  return {
    multiplicador: alvoRecomendado,
    sinal,
    confianca,
    motivo: motivos.length > 0 ? motivos.join(" | ") : "Análise em andamento",
    alvos: alvos,
    pontos,
    media10: parseFloat(media10.toFixed(2)),
    media20: parseFloat(media20.toFixed(2)),
    media30: parseFloat(media30.toFixed(2)),
    volatilidade: parseFloat(volatilidade.toFixed(2))
  };
}

// Estado para controlar o envio de sinais
const signalState: { 
  lastSignalId: string | null;    // ID da última vela que gerou sinal
  baseId: string | null;          // ID da base atual
  attempts: number;               // Tentativas atuais
  expiresAt: number;              // Timestamp de expiração
  lastSignalTime: number | null;  // Timestamp do último sinal ENTRAR
  velasAposUltimoSinal: number;   // Contador de velas após o último sinal
  falhouAnterior: boolean;        // Indica se entrada anterior falhou (não atingiu 2.00x)
  multiplicadorAnterior: number | null; // Multiplicador recomendado na entrada anterior
} = {
  lastSignalId: null,
  baseId: null,
  attempts: 0,
  expiresAt: 0,
  lastSignalTime: null,
  velasAposUltimoSinal: 0,
  falhouAnterior: false,
  multiplicadorAnterior: null
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

  // POST /api/velas/cyber - Recebe multiplicadores do Aviator e executa análise automática
  app.post("/api/velas/cyber", async (req, res) => {
    try {
      // Permitir -1 como sinal especial para três pontinhos
      const multiplicador = req.body.multiplicador;

      if (multiplicador === -1) {
        // Três pontinhos enviado manualmente
        const vela = await storage.addVela({ multiplicador: -1 });
        
        // Atualizar cache de vela
        storage.setCachedVela(vela);
        
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

      // Atualizar cache de vela
      storage.setCachedVela(vela);

      // Executar análise automática (apenas se sinais manuais não estiverem ativos)
      const sinaisManual = await storage.getSinaisManual();
      if (!sinaisManual.ativo) {
        try {
          // Buscar histórico para análise
          const historico = await storage.getHistorico(50);
          
          if (historico && historico.length >= 15) {
            // Executar análise ML
            const analise = analisarOportunidadeEntrada(historico);
            
            // Armazenar resultado no cache
            storage.setCachedAnalysis(analise);
            
            console.log('[POST VELAS] Análise automática executada:', {
              velaId: vela.id,
              multiplicador: vela.multiplicador,
              resultado: {
                sinal: analise.sinal,
                multiplicador: analise.multiplicador,
                confianca: analise.confianca,
                pontos: analise.pontos
              }
            });
          } else {
            console.log('[POST VELAS] Histórico insuficiente para análise (mínimo 15 velas)');
          }
        } catch (analysisError) {
          console.error('[POST VELAS] Erro ao executar análise automática:', analysisError);
          // Não falhar o request se a análise falhar
        }
      } else {
        console.log('[POST VELAS] Sinais manuais ativos, análise automática ignorada');
      }

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

  // GET /api/apos/cyber - Retorna última vela registrada (com cache)
  app.get("/api/apos/cyber", async (req, res) => {
    try {
      // Tentar usar cache primeiro
      let ultimaVela = storage.getCachedVela();
      let fromCache = false;

      // Se não houver cache, buscar do banco
      if (!ultimaVela) {
        ultimaVela = await storage.getUltimaVela();
        if (ultimaVela) {
          storage.setCachedVela(ultimaVela);
        }
      } else {
        fromCache = true;
      }

      const response: UltimaVelaResponse = {
        multiplicador: ultimaVela ? ultimaVela.multiplicador : null,
        timestamp: ultimaVela ? ultimaVela.timestamp.toISOString() : undefined,
      };

      // Log para debug - ver exatamente o que está sendo retornado
      console.log('[APÓS] Última vela:', {
        multiplicador: response.multiplicador,
        timestamp: response.timestamp,
        id: ultimaVela?.id,
        fromCache
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

  // GET /api/sacar/cyber - Retorna análise em tempo real (com cache)
  app.get("/api/sacar/cyber", async (req, res) => {
    try {
      // Verificar se sinais manuais estão ativos
      const sinaisManual = await storage.getSinaisManual();
      if (sinaisManual.ativo && sinaisManual.sacar !== null) {
        console.log('[SACAR] Retornando sinal manual:', sinaisManual.sacar);
        return res.json({
          multiplicador: sinaisManual.sacar,
          sinal: "ENTRAR",
          confianca: "manual",
          motivo: "Sinal manual do administrador"
        });
      }

      // Tentar usar cache se disponível e fresco (menos de 10 segundos)
      const { analysis: cachedAnalysis, timestamp: cacheTimestamp } = storage.getCachedAnalysis();
      const agora = Date.now();
      const cacheFreshMs = 10000; // 10 segundos de validade do cache

      if (cachedAnalysis && (agora - cacheTimestamp) < cacheFreshMs) {
        console.log('[SACAR] Retornando análise do cache:', {
          idade: agora - cacheTimestamp,
          sinal: cachedAnalysis.sinal,
          multiplicador: cachedAnalysis.multiplicador
        });
        
        return res.json({
          ...cachedAnalysis,
          fromCache: true,
          cacheAge: agora - cacheTimestamp
        });
      }

      // Cache não disponível ou expirado - calcular ao vivo
      console.log('[SACAR] Cache indisponível ou expirado, calculando ao vivo');
      
      const historico = await storage.getHistorico(20);
      if (!historico || historico.length === 0) {
        return res.json({ 
          multiplicador: 2.0, 
          sinal: "AGUARDAR", 
          confianca: "baixa",
          motivo: "Aguardando histórico de velas"
        });
      }

      // Base sempre é a vela mais recente (analisar para a PRÓXIMA rodada)
      const base = historico[0]; // getHistorico retorna em ordem desc
      // Reutilizar variável agora já definida acima
      const janelaMs = 6000; // 6 segundos de janela para cada sinal

      // VERIFICAR SE ENTRADA ANTERIOR FALHOU (não atingiu 2.00x)
      // Só verifica se uma vela NOVA chegou após a entrada anterior
      if (signalState.lastSignalId !== null && signalState.lastSignalId !== base.id && signalState.multiplicadorAnterior !== null && base.multiplicador < 2.00) {
        console.log(`[SACAR] Entrada anterior falhou! Vela caiu para ${base.multiplicador.toFixed(2)}x (recomendava ${signalState.multiplicadorAnterior.toFixed(2)}x). SEGUNDA TENTATIVA: Próxima entrada usará 2.00x`);
        signalState.falhouAnterior = true;
        signalState.multiplicadorAnterior = null;
      }

      // Se já passou mais de 6 segundos desde o último sinal, resetar estado
      if (agora > signalState.expiresAt) {
        signalState.baseId = null;
        signalState.attempts = 0;
      }

      // Se já tentamos 2 vezes com esta base, aguardar próxima vela
      if (signalState.baseId === String(base.id) && signalState.attempts >= 2) {
        return res.json({
          multiplicador: 2.0,
          sinal: "AGUARDAR",
          confianca: "baixa",
          motivo: "Máximo de tentativas para esta vela"
        });
      }

      // Se é uma nova base, atualizar estado
      if (signalState.baseId !== String(base.id)) {
        signalState.baseId = String(base.id);
        signalState.attempts = 0;
        signalState.expiresAt = agora + janelaMs;
        // Incrementar contador de velas após o último sinal
        if (signalState.lastSignalTime !== null) {
          signalState.velasAposUltimoSinal += 1;
        }
      }

      const ultimas = historico.map(v => v.multiplicador).slice(0, 20);

      // Análise existente (conservadora)
      const analise = analisarOportunidadeEntrada(historico);

      // Ajuste adaptativo: cenário "pagando" (muitas >= 2.0x) e últimas 3 fortes
      const acima2 = ultimas.filter(x => x >= 2.0).length;
      const proporcao2 = acima2 / Math.max(ultimas.length, 1);
      const last3 = ultimas.slice(0, 3);
      const last5 = ultimas.slice(0, 5);
      let bonus = 0;
      
      // Apenas aplicar bônus se a análise já for de média para cima
      if (analise.confianca === 'média' || analise.confianca === 'média-alta' || analise.confianca === 'alta') {
        // Proporção de velas positivas
        if (proporcao2 >= 0.6) bonus += 2; // muito forte
        else if (proporcao2 >= 0.45) bonus += 1; // forte
        
        // Últimas 3 todas positivas
        if (last3.length === 3 && last3.every(x => x >= 2.0)) bonus += 2;
        
        // Tendência curtíssima em alta
        if (last3.length === 3 && last3[0] >= last3[1] && last3[1] >= last3[2]) bonus += 1;
      }

      // Incrementar contador de tentativas
      signalState.attempts += 1;

      // Converter confiança em pontos aproximados para reclassificação leve
      const conf2pts: Record<string, number> = { "alta": 12, "média-alta": 10, "média": 8, "baixa": 6, "muito baixa": 4, "nenhuma": 2 };
      const pontosAjustados = (conf2pts[analise.confianca] || 4) + bonus;

      // Mapeamento final de decisão - apenas ENTRAR para sinais fortes
      let sinalFinal: "ENTRAR" | "..." = "...";
      let confiancaFinal = "baixa";
      let multiplicadorFinal = analise.multiplicador;
      
      // Verificar se já se passaram pelo menos 3 velas desde o último sinal
      const minimoVelasAposSinal = 3;
      const podeEnviarSinal = signalState.lastSignalTime === null || 
                             signalState.velasAposUltimoSinal >= minimoVelasAposSinal;
      
      // SE FALHOU NA ENTRADA ANTERIOR, USAR 2.00x NA SEGUNDA TENTATIVA
      if (signalState.falhouAnterior) {
        console.log('[SACAR] SEGUNDA TENTATIVA ATIVADA - Forçando 2.00x como multiplicador de segurança');
        multiplicadorFinal = 2.00;
        analise.motivo = "Segunda tentativa com multiplicador de segurança (2.00x)";
      }
      
      // Apenas considerar ENTRAR se a análise for de média para cima, pontos ajustados forem altos
      // E já tiver se passado o número mínimo de velas desde o último sinal
      if ((analise.confianca === 'média' || analise.confianca === 'média-alta' || analise.confianca === 'alta') && 
          pontosAjustados >= 10 && podeEnviarSinal) {
        sinalFinal = "ENTRAR";
        confiancaFinal = analise.confianca;
      }
      
      // Se não for para ENTRAR, sempre retornar "..."
      if (sinalFinal !== "ENTRAR") {
        sinalFinal = "...";
        confiancaFinal = "baixa";
        analise.motivo = podeEnviarSinal 
          ? "Aguardando próxima oportunidade" 
          : `Aguardando ${minimoVelasAposSinal - signalState.velasAposUltimoSinal} velas após o último sinal`;
      }
      
      // Evitar sinal duplicado para a mesma vela
      if (sinalFinal === "ENTRAR") {
        if (signalState.lastSignalId === base.id) {
          sinalFinal = "...";
          confiancaFinal = "baixa";
          analise.motivo = "Aguardando próxima oportunidade";
        } else {
          // Registrar que enviamos um sinal para esta vela
          signalState.lastSignalId = base.id;
          signalState.lastSignalTime = agora;
          signalState.velasAposUltimoSinal = 0;
          signalState.attempts = 0; // Resetar tentativas ao enviar um sinal
          
          // GUARDAR MULTIPLICADOR PARA VERIFICAR SE FALHOU DEPOIS
          signalState.multiplicadorAnterior = multiplicadorFinal;
          
          // Limpar flag de falha após usar segunda tentativa
          if (signalState.falhouAnterior) {
            signalState.falhouAnterior = false;
            console.log('[SACAR] Limpando flag de falha - segunda tentativa enviada');
          }
        }
      }

      // Preparar resultado final
      const resultado: PrevisaoResponse = {
        multiplicador: multiplicadorFinal,
        sinal: sinalFinal,
        confianca: confiancaFinal,
        motivo: analise.motivo,
        pontos: pontosAjustados,
        baseVelaId: base.id,
        baseTimestamp: base.timestamp?.toISOString?.() ?? base.timestamp,
        expiresAt: signalState.expiresAt,
      };

      // Armazenar resultado no cache para futuras requisições
      storage.setCachedAnalysis(resultado);

      return res.json(resultado);
    } catch (error) {
      return res.status(500).json({
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