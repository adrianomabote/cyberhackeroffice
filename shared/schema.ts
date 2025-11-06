import { sql } from "drizzle-orm";
import { pgTable, text, varchar, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Vela (multiplicador) do jogo Aviator
export const velas = pgTable("velas", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  multiplicador: real("multiplicador").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const insertVelaSchema = createInsertSchema(velas).pick({
  multiplicador: true,
}).extend({
  multiplicador: z.number().refine(
    (val) => val === -1 || val >= 1,
    { message: "Multiplicador deve ser -1 (três pontinhos) ou >= 1" }
  ),
});

export type InsertVela = z.infer<typeof insertVelaSchema>;
export type Vela = typeof velas.$inferSelect;

// Resposta da API para última vela
export interface UltimaVelaResponse {
  multiplicador: number | null;
  timestamp?: string;
}

// Resposta da API para previsão e análise de entrada
export interface PrevisaoResponse {
  multiplicador: number | null;
  sinal?: string; // "ENTRAR", "AGUARDAR", "POSSÍVEL"
  confianca?: string; // "alta", "média", "baixa"
  motivo?: string; // Descrição dos padrões detectados
}

// Resposta da API para histórico
export interface HistoricoResponse {
  velas: Vela[];
  total: number;
}

// Resposta da API para estatísticas
export interface EstatisticasResponse {
  mediasMoveis: {
    media5: number | null;
    media10: number | null;
    media20: number | null;
  };
  tendencia: {
    tipo: 'alta' | 'baixa' | 'estável';
    percentual: number;
  };
  volatilidade: {
    valor: number;
    nivel: 'baixa' | 'média' | 'alta';
  };
  extremos: {
    maximo: number;
    minimo: number;
    amplitude: number;
  };
}

// Resposta da API para padrões detectados
export interface PadroesResponse {
  padroes: Array<{
    tipo: 'sequencia_baixa' | 'alta_volatilidade' | 'tendencia_forte' | 'oportunidade';
    mensagem: string;
    severidade: 'info' | 'warning' | 'success';
  }>;
}

// Manutenção do sistema
export interface ManutencaoStatus {
  ativo: boolean;
  mensagem: string; // Ex: "VOLTE ÀS 15:30"
  motivo: string; // Ex: "O robô está atualizando"
}

export const manutencaoSchema = z.object({
  ativo: z.boolean(),
  mensagem: z.string(),
  motivo: z.string(),
}).refine(
  (data) => {
    // Se ativo = true, mensagem e motivo são obrigatórios
    if (data.ativo) {
      return data.mensagem.trim().length > 0 && data.motivo.trim().length > 0;
    }
    // Se ativo = false, não precisa validar
    return true;
  },
  {
    message: "Mensagem e motivo são obrigatórios quando ativo = true",
  }
);

export type ManutencaoInput = z.infer<typeof manutencaoSchema>;

// Sinais manuais do admin
export interface SinaisManual {
  ativo: boolean; // Se os sinais manuais estão ativos
  apos: number | null; // Multiplicador manual para APÓS
  sacar: number | null; // Multiplicador manual para SACAR
}

export const sinaisManualSchema = z.object({
  ativo: z.boolean(),
  apos: z.number().min(0.01).nullable(),
  sacar: z.number().min(0.01).nullable(),
});

export type SinaisManualInput = z.infer<typeof sinaisManualSchema>;
