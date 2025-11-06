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



// Gerenciamento de usuários
interface Usuario {
  id: string;
  email: string;
  nome: string;
  senha: string;
  aprovado: boolean;
  ativo: boolean;
  compartilhamentos: number;
  createdAt: Date;
}

const usuarios: Usuario[] = [];

export const storageUsuarios = {
  async criarUsuario(data: { email: string; nome: string; senha: string }) {
    const usuario: Usuario = {
      id: Math.random().toString(36).substring(7),
      email: data.email,
      nome: data.nome,
      senha: data.senha,
      aprovado: false,
      ativo: true,
      compartilhamentos: 0,
      createdAt: new Date(),
    };
    usuarios.push(usuario);
    return usuario;
  },

  async criarUsuarioAprovado(data: { email: string; nome: string; senha: string }) {
    const usuario: Usuario = {
      id: Math.random().toString(36).substring(7),
      email: data.email,
      nome: data.nome,
      senha: data.senha,
      aprovado: true,
      ativo: true,
      compartilhamentos: 0,
      createdAt: new Date(),
    };
    usuarios.push(usuario);
    return usuario;
  },

  async listarUsuarios() {
    return usuarios;
  },

  async aprovarUsuario(id: string) {
    const usuario = usuarios.find(u => u.id === id);
    if (usuario) {
      usuario.aprovado = true;
    }
    return usuario;
  },

  async desativarUsuario(id: string) {
    const usuario = usuarios.find(u => u.id === id);
    if (usuario) {
      usuario.ativo = false;
    }
    return usuario;
  },

  async ativarUsuario(id: string) {
    const usuario = usuarios.find(u => u.id === id);
    if (usuario) {
      usuario.ativo = true;
    }
    return usuario;
  },

  async eliminarUsuario(id: string) {
    const index = usuarios.findIndex(u => u.id === id);
    if (index !== -1) {
      usuarios.splice(index, 1);
      return true;
    }
    return false;
  },

  async verificarUsuario(email: string, senha: string) {
    return usuarios.find(u => u.email === email && u.senha === senha && u.aprovado && u.ativo);
  },

  async adicionarCompartilhamento(email: string) {
    const usuario = usuarios.find(u => u.email === email);
    if (usuario) {
      usuario.compartilhamentos += 1;
    }
    return usuario;
  },

  async obterUsuarioPorEmail(email: string) {
    return usuarios.find(u => u.email === email);
  },
};
