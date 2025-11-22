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
  sinal?: string; // "ENTRAR", "AGUARDAR", "POSSÍVEL", "..."
  confianca?: string; // "alta", "média", "baixa", "manual"
  motivo?: string; // Descrição dos padrões detectados
  pontos?: number; // Pontuação da análise
  baseVelaId?: string; // ID da vela base usada na análise
  baseTimestamp?: string | Date; // Timestamp da vela base
  expiresAt?: number; // Timestamp de expiração do sinal
  fromCache?: boolean; // Se veio do cache
  cacheAge?: number; // Idade do cache em milissegundos
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

// Usuários
export const usuarios = pgTable("usuarios", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email", { length: 255 }).notNull().unique(),
  nome: varchar("nome", { length: 255 }).notNull(),
  senha: varchar("senha", { length: 255 }).notNull(),
  aprovado: varchar("aprovado", { length: 10 }).notNull().default('false'),
  ativo: varchar("ativo", { length: 10 }).notNull().default('true'),
  compartilhamentos: real("compartilhamentos").notNull().default(0),
  dias_acesso: real("dias_acesso").notNull().default(2), // Dias de acesso (pode ser 1, 2, 3, etc)
  data_criacao: timestamp("data_criacao").notNull().defaultNow(),
  data_expiracao: timestamp("data_expiracao"), // Calculado baseado em data_criacao + dias_acesso
});

export const insertUsuarioSchema = z.object({
  email: z.string().email(),
  nome: z.string().min(1),
  senha: z.string().min(6),
  dias_acesso: z.number().min(1).optional().default(2),
});

// Feedback de experiência do usuário
export const feedbacks = pgTable("feedbacks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  usuario_id: varchar("usuario_id").references(() => usuarios.id),
  resposta: varchar("resposta", { length: 50 }).notNull(), // "excelente", "bom", "testando", "precisa_melhorar"
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const insertFeedbackSchema = createInsertSchema(feedbacks).pick({
  resposta: true,
}).extend({
  resposta: z.enum(["excelente", "bom", "testando", "precisa_melhorar"]),
});

export type InsertFeedback = z.infer<typeof insertFeedbackSchema>;
export type Feedback = typeof feedbacks.$inferSelect;

// Resultados enviados pelos clientes
export const resultadosClientes = pgTable("resultados_clientes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  usuario_id: varchar("usuario_id").references(() => usuarios.id),
  apos: real("apos").notNull(),
  sacar: varchar("sacar").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const insertResultadoClienteSchema = createInsertSchema(resultadosClientes).pick({
  apos: true,
  sacar: true,
}).extend({
  apos: z.number().min(0.01),
  sacar: z.string().min(1),
});

export type InsertResultadoCliente = z.infer<typeof insertResultadoClienteSchema>;
export type ResultadoCliente = typeof resultadosClientes.$inferSelect;
