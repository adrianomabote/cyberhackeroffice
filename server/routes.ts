import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertVelaSchema, type UltimaVelaResponse, type PrevisaoResponse } from "@shared/schema";
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

  const httpServer = createServer(app);

  return httpServer;
}
