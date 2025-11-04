import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertVelaSchema, type UltimaVelaResponse, type PrevisaoResponse, type EstatisticasResponse, type PadroesResponse } from "@shared/schema";
import { z } from "zod";

// Função para calcular previsão baseada nas últimas 10 velas
function calcularPrevisao(velas: Array<{ multiplicador: number }>): number | null {
  if (velas.length === 0) {
    return null;
  }

  // Se temos menos de 3 velas, retornar uma previsão conservadora
  if (velas.length < 3) {
    return 1.5;
  }

  // Análise simples: calcular média e tendência
  const multiplicadores = velas.map(v => v.multiplicador);
  const soma = multiplicadores.reduce((acc, val) => acc + val, 0);
  const media = soma / multiplicadores.length;

  // Calcular tendência (últimas 5 vs primeiras 5)
  const metade = Math.floor(multiplicadores.length / 2);
  const primeiraMetade = multiplicadores.slice(0, metade);
  const segundaMetade = multiplicadores.slice(metade);

  const mediaPrimeira = primeiraMetade.reduce((a, b) => a + b, 0) / primeiraMetade.length;
  const mediaSegunda = segundaMetade.reduce((a, b) => a + b, 0) / segundaMetade.length;

  // Se a tendência está subindo, sugerir um valor um pouco acima da média
  // Se está descendo, sugerir um valor mais conservador
  let previsao: number;
  if (mediaSegunda > mediaPrimeira) {
    // Tendência de alta - sugerir média + 20%
    previsao = media * 1.2;
  } else {
    // Tendência de baixa ou estável - sugerir média - 10%
    previsao = media * 0.9;
  }

  // Limitar entre 1.2x e 10x para ser realista
  previsao = Math.max(1.2, Math.min(10, previsao));

  // Arredondar para 2 casas decimais
  return Math.round(previsao * 100) / 100;
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

  // POST /api/vela - Recebe multiplicadores do Aviator
  app.post("/api/vela", async (req, res) => {
    try {
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

  // GET /api/apos - Retorna última vela registrada
  app.get("/api/apos", async (req, res) => {
    try {
      const ultimaVela = await storage.getUltimaVela();
      
      const response: UltimaVelaResponse = {
        multiplicador: ultimaVela ? ultimaVela.multiplicador : null,
        timestamp: ultimaVela ? ultimaVela.timestamp.toISOString() : undefined,
      };
      
      res.json(response);
    } catch (error) {
      res.status(500).json({
        multiplicador: null,
        error: "Erro ao buscar última vela",
      });
    }
  });

  // GET /api/sacar - Retorna previsão da próxima vela baseada nas últimas 10
  app.get("/api/sacar", async (req, res) => {
    try {
      const ultimas10 = await storage.getUltimas10Velas();
      const previsao = calcularPrevisao(ultimas10);
      
      const response: PrevisaoResponse = {
        multiplicador: previsao,
        confianca: ultimas10.length >= 10 ? "alta" : ultimas10.length >= 5 ? "média" : "baixa",
      };
      
      res.json(response);
    } catch (error) {
      res.status(500).json({
        multiplicador: null,
        error: "Erro ao calcular previsão",
      });
    }
  });

  // GET /api/historico - Retorna histórico completo de velas
  app.get("/api/historico", async (req, res) => {
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

  // GET /api/padroes - Detecta padrões favoráveis nas últimas velas
  app.get("/api/padroes", async (req, res) => {
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

  // GET /api/estatisticas - Retorna estatísticas avançadas
  app.get("/api/estatisticas", async (req, res) => {
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

      // Calcular tendência (comparar primeira e segunda metade)
      let tipoTendencia: 'alta' | 'baixa' | 'estável' = 'estável';
      let variacao = 0;
      
      if (multiplicadores.length >= 2) {
        const metade = Math.floor(multiplicadores.length / 2);
        const primeiraMetade = multiplicadores.slice(0, metade);
        const segundaMetade = multiplicadores.slice(metade);
        
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

  const httpServer = createServer(app);

  return httpServer;
}
