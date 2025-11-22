import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertVelaSchema, manutencaoSchema, sinaisManualSchema, type UltimaVelaResponse, type PrevisaoResponse, type EstatisticasResponse, type PadroesResponse, type ManutencaoStatus, type SinaisManual } from "../shared/schema";
import { z } from "zod";

// Estado global para controlar segunda tentativa
const entradasConsecutivas = {
  ultimaVelaId: null as string | null,
  multiplicadorRecomendado: null as number | null,
  tentativaNumero: 0, // 0 = normal, 1 = 1ª entrada, 2 = 2ª tentativa
  velaAnteriorId: null as string | null, // ID da vela anterior para confirmar finalização
  contadorVelaNovaDeteccao: 0, // Contador para confirmar que vela nova realmente chegou
  ultimoMultiplicadorEntregue: null as number | null, // Manter último multiplicador até nova vela
  estadoLimpeza: 'AGUARDANDO' as 'AGUARDANDO' | 'VELA_ENTREGUE' | 'AGUARDANDO_NOVA', // Controlar quando limpar
  jaEntregouMultiplicador: false, // Flag para enviar multiplicador UMA VEZ só
  
  // ===== PROTEÇÕES ANTI-ERRO =====
  contadorEntradasTotais: 0, // PROTEÇÃO: Conta total de entradas (máximo 2)
  timestampUltimaEntrada: null as Date | null, // PROTEÇÃO: Timestamp da última entrada
  velaIdUltimaLimpeza: null as string | null, // PROTEÇÃO: ID da última vela onde limpou estado
  bloqueioLimpeza: false, // PROTEÇÃO: Bloqueia limpeza prematura até nova vela confirmar
};

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

  // Determinar sinal e multiplicador APENAS: 2.00x, 4.00x, 10.00x
  let sinal = "AGUARDAR";
  let confianca = "baixa";
  let multiplicadorSacar: number | null = null;

  if (pontos >= 8) {
    // Grande oportunidade = 10.00x
    sinal = "ENTRAR";
    confianca = "alta";
    multiplicadorSacar = 10.0;
    motivos.push("GRANDE OPORTUNIDADE - 10.00x");
  } else if (pontos >= 6) {
    // Boa oportunidade = 4.00x
    sinal = "ENTRAR";
    confianca = "alta";
    multiplicadorSacar = 4.0;
    motivos.push("BOA OPORTUNIDADE - 4.00x");
  } else if (pontos >= 4) {
    // Oportunidade normal = 2.00x
    sinal = "ENTRAR";
    confianca = "média";
    multiplicadorSacar = 2.0;
    motivos.push("OPORTUNIDADE - 2.00x");
  } else if (pontos >= 2) {
    // Possível = 2.00x
    sinal = "POSSÍVEL";
    confianca = "baixa";
    multiplicadorSacar = 2.0;
  }

  return {
    multiplicador: multiplicadorSacar,
    sinal,
    confianca,
    motivo: motivos.length > 0 ? motivos.join(" | ") : "Análise em andamento",
    pontos,
  };
}

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

  // GET /api/sacar/cyber - Retorna análise de oportunidade de entrada (1 entrada por vela + 2ª tentativa automática)
  app.get("/api/sacar/cyber", async (req, res) => {
    try {
      // Buscar histórico para análise
      const historico = await storage.getHistorico(20);
      if (!historico || historico.length === 0) {
        return res.json({ multiplicador: null, sinal: "AGUARDAR", confianca: "baixa", motivo: "Sem dados" });
      }

      const velaAtual = historico[0]; // Mais recente
      const velaIdAtual = String(velaAtual.id);
      const analise = analisarOportunidadeEntrada(historico);

      // Log de segurança: Estado atual do sistema
      console.log(`[PROTEÇÃO] 📋 Estado: tentativa=${entradasConsecutivas.tentativaNumero}, contador=${entradasConsecutivas.contadorEntradasTotais}, bloqueio=${entradasConsecutivas.bloqueioLimpeza}`);

      // ============ PROTEÇÃO ANTI-ERRO: Verificar anomalias ============
      if (entradasConsecutivas.contadorEntradasTotais > 2) {
        console.error(`[PROTEÇÃO] ⛔ BLOQUEIO: Contador de entradas excedeu máximo (${entradasConsecutivas.contadorEntradasTotais}). Resetando sistema!`);
        // RESETAR TUDO por segurança
        entradasConsecutivas.tentativaNumero = 0;
        entradasConsecutivas.multiplicadorRecomendado = null;
        entradasConsecutivas.ultimoMultiplicadorEntregue = null;
        entradasConsecutivas.jaEntregouMultiplicador = false;
        entradasConsecutivas.contadorEntradasTotais = 0;
        entradasConsecutivas.bloqueioLimpeza = false;
        return res.json({ multiplicador: null, sinal: "AGUARDAR", confianca: "baixa", motivo: "Sistema resetado por segurança" });
      }

      // ============ ETAPA 1: Detectar mudança de vela ============
      const mudouDeVela = entradasConsecutivas.ultimaVelaId !== null && entradasConsecutivas.ultimaVelaId !== velaIdAtual;

      if (mudouDeVela) {
        console.log(`[ENTRADAS] 🆕 Nova vela detectada (${velaIdAtual})`);
        
        // Processar resultado da vela ANTERIOR se havia entrada ativa
        const tentativaAnterior = entradasConsecutivas.tentativaNumero;
        const multiplicadorEsperado = entradasConsecutivas.multiplicadorRecomendado;
        
        // Buscar vela anterior do histórico PELA ID que estava gravada
        const velaAnterior = historico.find(v => String(v.id) === entradasConsecutivas.ultimaVelaId);
        
        // PROTEÇÃO CRÍTICA: Só processar se encontrou vela anterior (evita race condition)
        if (!velaAnterior && tentativaAnterior > 0) {
          console.error(`[PROTEÇÃO] ⚠️ RACE CONDITION: Nova vela detectada mas vela anterior não encontrada no histórico!`);
          console.error(`[PROTEÇÃO] - Mantendo estado ativo até vela anterior ser confirmada.`);
          console.error(`[PROTEÇÃO] - Vela anterior ID: ${entradasConsecutivas.ultimaVelaId}`);
          // NÃO atualizar ultimaVelaId - aguardar próxima chamada
          return res.json({
            multiplicador: entradasConsecutivas.ultimoMultiplicadorEntregue,
            sinal: "ENTRAR",
            confianca: "alta",
            motivo: "Aguardando confirmação de resultado",
          });
        }
        
        if (tentativaAnterior === 1 && multiplicadorEsperado && velaAnterior) {
          // Verificar se a entrada da 1ª tentativa atingiu o objetivo
          const atingiu = velaAnterior.multiplicador >= multiplicadorEsperado;
          console.log(`[ENTRADAS] ${atingiu ? '✓' : '❌'} Vela anterior (${velaAnterior.multiplicador}x) ${atingiu ? 'atingiu' : 'não atingiu'} ${multiplicadorEsperado}x`);
          
          if (atingiu) {
            // SUCESSO - limpar tudo COM PROTEÇÃO
            console.log(`[PROTEÇÃO] ✅ Limpeza autorizada: Meta atingida em tentativa ${tentativaAnterior}`);
            entradasConsecutivas.tentativaNumero = 0;
            entradasConsecutivas.multiplicadorRecomendado = null;
            entradasConsecutivas.ultimoMultiplicadorEntregue = null;
            entradasConsecutivas.jaEntregouMultiplicador = false;
            entradasConsecutivas.contadorEntradasTotais = 0; // RESETAR contador
            entradasConsecutivas.bloqueioLimpeza = false; // Desbloquear limpeza APÓS processar
            entradasConsecutivas.velaIdUltimaLimpeza = entradasConsecutivas.ultimaVelaId; // Vela que acabou de processar
          } else {
            // FALHOU - ativar 2ª tentativa com 2.00x COM PROTEÇÃO
            if (entradasConsecutivas.contadorEntradasTotais >= 2) {
              console.error(`[PROTEÇÃO] ⛔ BLOQUEIO: Não pode ativar 3ª tentativa! Limpando.`);
              entradasConsecutivas.tentativaNumero = 0;
              entradasConsecutivas.multiplicadorRecomendado = null;
              entradasConsecutivas.ultimoMultiplicadorEntregue = null;
              entradasConsecutivas.jaEntregouMultiplicador = false;
              entradasConsecutivas.contadorEntradasTotais = 0;
              entradasConsecutivas.bloqueioLimpeza = false;
              entradasConsecutivas.velaIdUltimaLimpeza = entradasConsecutivas.ultimaVelaId; // Vela que acabou de processar
            } else {
              console.log(`[ENTRADAS] 🔄 Ativando 2ª tentativa com 2.00x`);
              console.log(`[PROTEÇÃO] 📊 Contador de entradas: ${entradasConsecutivas.contadorEntradasTotais} → ${entradasConsecutivas.contadorEntradasTotais + 1}`);
              entradasConsecutivas.tentativaNumero = 2;
              entradasConsecutivas.multiplicadorRecomendado = 2.0;
              entradasConsecutivas.ultimoMultiplicadorEntregue = 2.0;
              entradasConsecutivas.jaEntregouMultiplicador = false; // Permitir enviar de novo
              entradasConsecutivas.contadorEntradasTotais++; // INCREMENTAR contador (2ª entrada)
              entradasConsecutivas.bloqueioLimpeza = true; // BLOQUEAR limpeza até nova vela
            }
          }
        } else if (tentativaAnterior === 2 && velaAnterior) {
          // Fim da 2ª tentativa - sempre limpar após processar COM PROTEÇÃO
          const atingiu = velaAnterior.multiplicador >= 2.0;
          console.log(`[ENTRADAS] 🔄 2ª tentativa finalizada. Vela ${atingiu ? 'atingiu' : 'não atingiu'} 2.00x. Limpando.`);
          console.log(`[PROTEÇÃO] ✅ Limpeza autorizada: Fim de ciclo completo (2 tentativas)`);
          entradasConsecutivas.tentativaNumero = 0;
          entradasConsecutivas.multiplicadorRecomendado = null;
          entradasConsecutivas.ultimoMultiplicadorEntregue = null;
          entradasConsecutivas.jaEntregouMultiplicador = false;
          entradasConsecutivas.contadorEntradasTotais = 0; // RESETAR contador
          entradasConsecutivas.bloqueioLimpeza = false; // Desbloquear limpeza APÓS processar
          entradasConsecutivas.velaIdUltimaLimpeza = entradasConsecutivas.ultimaVelaId; // Vela que acabou de processar
        } else if (tentativaAnterior === 0) {
          // Não havia entrada ativa - só desbloquear limpeza
          entradasConsecutivas.bloqueioLimpeza = false;
        }
        
        // Atualizar para nova vela SOMENTE SE processou resultado com sucesso
        entradasConsecutivas.ultimaVelaId = velaIdAtual;
        entradasConsecutivas.jaEntregouMultiplicador = false; // Resetar flag para nova vela
      } else if (entradasConsecutivas.ultimaVelaId === null) {
        // Primeira vela do sistema
        entradasConsecutivas.ultimaVelaId = velaIdAtual;
        entradasConsecutivas.bloqueioLimpeza = false;
      }

      // ============ ETAPA 2: Determinar resposta ============
      let podeEntrar = false;
      let multiplicadorFinal = null;
      let confiancaFinal = analise.confianca;
      let motivoFinal = analise.motivo;

      if (entradasConsecutivas.tentativaNumero > 0) {
        // Há entrada ativa - SEMPRE retornar o multiplicador (mesmo se já enviou)
        
        // PROTEÇÃO: Verificar se mesma vela (anti enviar múltiplas vezes)
        if (entradasConsecutivas.ultimaVelaId === velaIdAtual) {
          podeEntrar = true;
          multiplicadorFinal = entradasConsecutivas.ultimoMultiplicadorEntregue;
          confiancaFinal = "alta";
          motivoFinal = `Tentativa ${entradasConsecutivas.tentativaNumero} - Aguardando nova vela`;
          
          if (!entradasConsecutivas.jaEntregouMultiplicador) {
            // Primeira vez retornando nesta vela - marcar como enviado
            console.log(`[ENTRADAS] ✅ ENVIANDO tentativa ${entradasConsecutivas.tentativaNumero}: ${multiplicadorFinal}x`);
            console.log(`[PROTEÇÃO] 📝 Timestamp da entrada: ${new Date().toISOString()}`);
            entradasConsecutivas.jaEntregouMultiplicador = true;
            entradasConsecutivas.timestampUltimaEntrada = new Date();
          } else {
            // Já enviou, mas continua retornando o multiplicador (para persistir na UI)
            console.log(`[ENTRADAS] 🔁 MANTENDO tentativa ${entradasConsecutivas.tentativaNumero}: ${multiplicadorFinal}x`);
          }
        } else {
          // PROTEÇÃO: Vela mudou mas estado ainda ativo (anomalia)
          console.warn(`[PROTEÇÃO] ⚠️ ANOMALIA DETECTADA: Estado ativo mas vela diferente. Corrigindo...`);
          console.warn(`[PROTEÇÃO] - Última vela registrada: ${entradasConsecutivas.ultimaVelaId}`);
          console.warn(`[PROTEÇÃO] - Vela atual: ${velaIdAtual}`);
          console.warn(`[PROTEÇÃO] - Tentativa ativa: ${entradasConsecutivas.tentativaNumero}`);
          // Processar como se fosse mudança de vela
          entradasConsecutivas.ultimaVelaId = velaIdAtual;
        }
      } else if (analise.sinal === "ENTRAR" && entradasConsecutivas.tentativaNumero === 0) {
        // Nova entrada recomendada pela análise
        
        // PROTEÇÃO CRÍTICA: Não permitir nova entrada se já tem contador > 0 (ciclo ainda não terminou)
        if (entradasConsecutivas.contadorEntradasTotais > 0) {
          console.error(`[PROTEÇÃO] ⛔ BLOQUEIO CRÍTICO: Contador > 0 mas tentativa=0 (estado inconsistente)!`);
          console.error(`[PROTEÇÃO] - Contador: ${entradasConsecutivas.contadorEntradasTotais}`);
          console.error(`[PROTEÇÃO] - Vela atual: ${velaIdAtual}`);
          console.error(`[PROTEÇÃO] - Última limpeza: ${entradasConsecutivas.velaIdUltimaLimpeza}`);
          console.error(`[PROTEÇÃO] - Aguardando limpeza completa antes de nova entrada.`);
          podeEntrar = false;
        }
        // PROTEÇÃO: Verificar se já limpou nesta vela (anti enviar logo após limpar)
        else if (entradasConsecutivas.velaIdUltimaLimpeza === velaIdAtual) {
          console.warn(`[PROTEÇÃO] ⚠️ BLOQUEIO: Não pode enviar nova entrada na mesma vela que acabou de limpar!`);
          console.warn(`[PROTEÇÃO] - Aguardando próxima vela para nova entrada.`);
          podeEntrar = false;
        }
        // PROTEÇÃO: Verificar se limpeza ainda está bloqueada
        else if (entradasConsecutivas.bloqueioLimpeza) {
          console.error(`[PROTEÇÃO] ⛔ BLOQUEIO: Limpeza ainda bloqueada! Não pode enviar nova entrada.`);
          console.error(`[PROTEÇÃO] - Aguardando nova vela para processar resultado anterior.`);
          podeEntrar = false;
        }
        // Tudo ok - pode enviar nova entrada
        else {
          console.log(`[ENTRADAS] ➡️ Iniciando 1ª entrada com ${analise.multiplicador}x`);
          console.log(`[PROTEÇÃO] 📊 Contador de entradas: ${entradasConsecutivas.contadorEntradasTotais} → ${entradasConsecutivas.contadorEntradasTotais + 1}`);
          podeEntrar = true;
          multiplicadorFinal = analise.multiplicador;
          entradasConsecutivas.tentativaNumero = 1;
          entradasConsecutivas.multiplicadorRecomendado = analise.multiplicador;
          entradasConsecutivas.ultimoMultiplicadorEntregue = analise.multiplicador;
          entradasConsecutivas.jaEntregouMultiplicador = true;
          entradasConsecutivas.contadorEntradasTotais++; // INCREMENTAR contador
          entradasConsecutivas.timestampUltimaEntrada = new Date();
          entradasConsecutivas.bloqueioLimpeza = true; // BLOQUEAR limpeza até nova vela
          confiancaFinal = "alta";
          motivoFinal = "1ª entrada";
        }
      }

      // Retornar resposta
      res.json({
        multiplicador: podeEntrar ? multiplicadorFinal : null,
        sinal: podeEntrar ? "ENTRAR" : analise.sinal,
        confianca: podeEntrar ? confiancaFinal : analise.confianca,
        motivo: podeEntrar ? motivoFinal : analise.motivo,
      });
    } catch (error) {
      console.error(`[ENTRADAS] Erro:`, error);
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