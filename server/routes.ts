import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertVelaSchema, type UltimaVelaResponse, type PrevisaoResponse, type EstatisticasResponse, type PadroesResponse } from "@shared/schema";
import { z } from "zod";

// Função avançada usando Regressão Linear + Média Exponencial + Detecção de Padrões
function calcularPrevisao(velas: Array<{ multiplicador: number }>): number | null {
  if (velas.length === 0) {
    return null;
  }

  // Se temos menos de 3 velas, retornar uma previsão conservadora
  if (velas.length < 3) {
    return 1.5;
  }

  // Pegar últimas 20 velas (ou todas se houver menos)
  const ultimas = velas.slice(-20);
  const multiplicadores = ultimas.map(v => v.multiplicador);
  const n = multiplicadores.length;

  // 1. Regressão Linear Simples (y = ax + b)
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
  for (let i = 0; i < n; i++) {
    const x = i;
    const y = multiplicadores[i];
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumX2 += x * x;
  }

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  const previsaoLinear = slope * n + intercept;

  // 2. Média Móvel Exponencial (EMA) com α = 0.3
  const alpha = 0.3;
  let ema = multiplicadores[0];
  for (let i = 1; i < n; i++) {
    ema = alpha * multiplicadores[i] + (1 - alpha) * ema;
  }

  // 3. Detecção de Volatilidade
  const media = multiplicadores.reduce((sum, m) => sum + m, 0) / n;
  const variancia = multiplicadores.reduce((sum, m) => sum + Math.pow(m - media, 2), 0) / n;
  const desvioPadrao = Math.sqrt(variancia);
  const coeficienteVariacao = desvioPadrao / media;

  // 4. Ponderação baseada em volatilidade
  let peso_linear = 0.4;
  let peso_ema = 0.6;
  if (coeficienteVariacao > 0.5) {
    peso_linear = 0.3;
    peso_ema = 0.7;
  } else if (coeficienteVariacao < 0.2) {
    peso_linear = 0.6;
    peso_ema = 0.4;
  }

  // 5. Combinação ponderada
  let previsao = peso_linear * previsaoLinear + peso_ema * ema;

  // 6. Ajuste baseado em padrões recentes
  if (n >= 5) {
    const ultimas5 = multiplicadores.slice(-5);
    const baixosRecentes = ultimas5.filter(m => m < 2).length;
    const altosRecentes = ultimas5.filter(m => m > 3).length;
    
    if (baixosRecentes >= 3) previsao *= 1.1;
    if (altosRecentes >= 3) previsao *= 0.9;
  }

  // 7. Limitar e arredondar
  return Math.round(Math.max(1.2, Math.min(10, previsao)) * 100) / 100;
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

  // GET /api/velas/cyber - Retorna histórico de todas as velas
  app.get("/api/velas/cyber", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
      const historico = await storage.getHistorico(limit);
      
      res.json({
        success: true,
        total: historico.length,
        velas: historico,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        velas: [],
        total: 0,
        error: "Erro ao buscar velas",
      });
    }
  });

  // POST /api/velas/cyber - Recebe multiplicadores do Aviator
  app.post("/api/velas/cyber", async (req, res) => {
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

  // GET /api/apos/cyber - Retorna última vela registrada
  app.get("/api/apos/cyber", async (req, res) => {
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

  // GET /api/sacar/cyber - Retorna previsão da próxima vela baseada nas últimas 10
  app.get("/api/sacar/cyber", async (req, res) => {
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

  const httpServer = createServer(app);

  return httpServer;
}
