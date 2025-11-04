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
  multiplicador: z.number().positive().min(1),
});

export type InsertVela = z.infer<typeof insertVelaSchema>;
export type Vela = typeof velas.$inferSelect;

// Resposta da API para última vela
export interface UltimaVelaResponse {
  multiplicador: number | null;
  timestamp?: string;
}

// Resposta da API para previsão
export interface PrevisaoResponse {
  multiplicador: number | null;
  confianca?: string;
}
