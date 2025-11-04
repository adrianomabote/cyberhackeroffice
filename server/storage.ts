import { type Vela, type InsertVela } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  addVela(vela: InsertVela): Promise<Vela>;
  getUltimaVela(): Promise<Vela | null>;
  getUltimas10Velas(): Promise<Vela[]>;
}

export class MemStorage implements IStorage {
  private velas: Vela[];
  private ultimoMultiplicador: number | null;

  constructor() {
    this.velas = [];
    this.ultimoMultiplicador = null;
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
}

export const storage = new MemStorage();
