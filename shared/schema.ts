import { sql } from "drizzle-orm";
import { pgTable, text, varchar, real, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import * as crypto from "crypto";

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
  id: text("id").primaryKey().notNull().$defaultFn(() => crypto.randomUUID()),
  email: text("email").notNull().unique(),
  nome: text("nome").notNull(),
  senha: text("senha").notNull(),
  aprovado: text("aprovado").notNull().default('false'),
  ativo: text("ativo").notNull().default('true'),
  tipo: text("tipo").notNull().default('cliente'), // 'cliente' ou 'revendedor'
  creditos: integer("creditos").notNull().default(0),
  dias_validade: integer("dias_validade").notNull().default(30),
  compartilhamentos: integer("compartilhamentos").notNull().default(0),
  dias_acesso: integer("dias_acesso").notNull().default(2),
  data_expiracao: timestamp("data_expiracao"),
  criado_em: timestamp("criado_em").defaultNow().notNull(),
  revenda_id: text("revenda_id"),
});

// Revendedores
export const revendedores = pgTable("revendedores", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email", { length: 255 }).notNull().unique(),
  nome: varchar("nome", { length: 255 }).notNull(),
  senha: varchar("senha", { length: 255 }).notNull(),
  creditos: real("creditos").notNull().default(0), // Número de contas que pode criar
  ativo: varchar("ativo", { length: 10 }).notNull().default('true'),
  data_criacao: timestamp("data_criacao").notNull().defaultNow(),
  data_expiracao: timestamp("data_expiracao"), // Validade da conta do revendedor
});

// Sessões de dispositivos (para controle de 1 dispositivo por conta)
export const sessoes = pgTable("sessoes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  usuario_id: varchar("usuario_id").notNull().references(() => usuarios.id),
  device_id: varchar("device_id", { length: 255 }).notNull(),
  criado_em: timestamp("criado_em").notNull().defaultNow(),
  ultimo_acesso: timestamp("ultimo_acesso").notNull().defaultNow(),
});

export const insertUsuarioSchema = z.object({
  email: z.string().email(),
  nome: z.string().min(1),
  senha: z.string().min(6),
  dias_acesso: z.number().min(1).optional().default(2),
});

export const insertRevendedorSchema = z.object({
  email: z.string().email(),
  nome: z.string().min(1),
  senha: z.string().min(6),
  creditos: z.number().min(0).default(0),
  dias_validade: z.number().min(1).default(30), // Dias de validade da conta do revendedor
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
  apos: z.number().min(0.01).refine(
    (val) => {
      // Validar que tem pelo menos 9 dígitos (removendo caracteres não-numéricos)
      const digits = String(val).replace(/\D/g, '');
      return digits.length >= 9;
    },
    { message: "Apos deve ter no mínimo 9 dígitos" }
  ),
  sacar: z.string().length(4, { message: "Sacar deve ter exatamente 4 caracteres" }),
});

export type InsertResultadoCliente = z.infer<typeof insertResultadoClienteSchema>;
export type ResultadoCliente = typeof resultadosClientes.$inferSelect;

// Proteção contra entradas consecutivas - persistente no banco
export const sinaisProtecao = pgTable("sinais_protecao", {
  id: varchar("id").primaryKey().default('ultima_entrada'), // Singleton: sempre 1 registro
  vela_timestamp: timestamp("vela_timestamp").notNull(), // Timestamp da vela quando último ENTRAR foi enviado
  registrado_em: timestamp("registrado_em").notNull().defaultNow(), // Quando foi registrado
});

export type SinalProtecao = typeof sinaisProtecao.$inferSelect;