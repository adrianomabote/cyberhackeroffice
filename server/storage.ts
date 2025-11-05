import { type Vela, type InsertVela, velas, type ManutencaoStatus, type SinaisManual } from "@shared/schema";
import { randomUUID } from "crypto";
import { drizzle } from "drizzle-orm/neon-serverless";
import { desc } from "drizzle-orm";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";

neonConfig.webSocketConstructor = ws;

export interface IStorage {
  addVela(vela: InsertVela): Promise<Vela>;
  getUltimaVela(): Promise<Vela | null>;
  getUltimas10Velas(): Promise<Vela[]>;
  getHistorico(limit?: number): Promise<Vela[]>;
  getManutencaoStatus(): Promise<ManutencaoStatus>;
  setManutencaoStatus(status: ManutencaoStatus): Promise<ManutencaoStatus>;
  getSinaisManual(): Promise<SinaisManual>;
  setSinaisManual(sinais: SinaisManual): Promise<SinaisManual>;
}

export class MemStorage implements IStorage {
  private velas: Vela[];
  private ultimoMultiplicador: number | null;
  private manutencao: ManutencaoStatus;
  private sinaisManual: SinaisManual;

  constructor() {
    this.velas = [];
    this.ultimoMultiplicador = null;
    this.manutencao = {
      ativo: false,
      mensagem: "",
      motivo: "",
    };
    this.sinaisManual = {
      ativo: false,
      apos: null,
      sacar: null,
    };
  }

  async addVela(insertVela: InsertVela): Promise<Vela> {
    // Evitar duplicatas consecutivas
    if (this.ultimoMultiplicador === insertVela.multiplicador && this.velas.length > 0) {
      // Retornar a última vela sem adicionar duplicata
      return this.velas[this.velas.length - 1];
    }

    const id = randomUUID();
    const vela: Vela = {
      ...insertVela,
      id,
      timestamp: new Date(),
    };

    this.velas.push(vela);
    this.ultimoMultiplicador = insertVela.multiplicador;

    // Manter apenas as últimas 100 velas para não crescer indefinidamente
    if (this.velas.length > 100) {
      this.velas = this.velas.slice(-100);
    }

    return vela;
  }

  async getUltimaVela(): Promise<Vela | null> {
    if (this.velas.length === 0) {
      return null;
    }
    return this.velas[this.velas.length - 1];
  }

  async getUltimas10Velas(): Promise<Vela[]> {
    return this.velas.slice(-10);
  }

  async getHistorico(limit: number = 100): Promise<Vela[]> {
    return this.velas.slice(-limit);
  }

  async getManutencaoStatus(): Promise<ManutencaoStatus> {
    return this.manutencao;
  }

  async setManutencaoStatus(status: ManutencaoStatus): Promise<ManutencaoStatus> {
    this.manutencao = status;
    return this.manutencao;
  }

  async getSinaisManual(): Promise<SinaisManual> {
    return this.sinaisManual;
  }

  async setSinaisManual(sinais: SinaisManual): Promise<SinaisManual> {
    this.sinaisManual = sinais;
    return this.sinaisManual;
  }
}

export class DbStorage implements IStorage {
  private db;
  private manutencao: ManutencaoStatus;
  private sinaisManual: SinaisManual;

  constructor() {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    this.db = drizzle(pool);
    this.manutencao = {
      ativo: false,
      mensagem: "",
      motivo: "",
    };
    this.sinaisManual = {
      ativo: false,
      apos: null,
      sacar: null,
    };
  }

  async addVela(insertVela: InsertVela): Promise<Vela> {
    // Evitar duplicatas consecutivas - verificar última vela
    const ultimaVela = await this.getUltimaVela();
    
    if (ultimaVela && ultimaVela.multiplicador === insertVela.multiplicador) {
      // Retornar a última vela sem adicionar duplicata
      return ultimaVela;
    }

    const [novaVela] = await this.db
      .insert(velas)
      .values(insertVela)
      .returning();

    return novaVela;
  }

  async getUltimaVela(): Promise<Vela | null> {
    const result = await this.db
      .select()
      .from(velas)
      .orderBy(desc(velas.timestamp))
      .limit(1);

    return result[0] || null;
  }

  async getUltimas10Velas(): Promise<Vela[]> {
    const result = await this.db
      .select()
      .from(velas)
      .orderBy(desc(velas.timestamp))
      .limit(10);

    // Retornar em ordem cronológica (mais antiga primeira)
    return result.reverse();
  }

  async getHistorico(limit: number = 100): Promise<Vela[]> {
    const result = await this.db
      .select()
      .from(velas)
      .orderBy(desc(velas.timestamp))
      .limit(limit);

    // Retornar em ordem cronológica (mais antiga primeira)
    return result.reverse();
  }

  async getManutencaoStatus(): Promise<ManutencaoStatus> {
    return this.manutencao;
  }

  async setManutencaoStatus(status: ManutencaoStatus): Promise<ManutencaoStatus> {
    this.manutencao = status;
    console.log('[MANUTENÇÃO] Status atualizado:', status);
    return this.manutencao;
  }

  async getSinaisManual(): Promise<SinaisManual> {
    return this.sinaisManual;
  }

  async setSinaisManual(sinais: SinaisManual): Promise<SinaisManual> {
    this.sinaisManual = sinais;
    console.log('[SINAIS MANUAL] Atualizados:', sinais);
    return this.sinaisManual;
  }
}

// Usar DbStorage em produção
export const storage = new DbStorage();
