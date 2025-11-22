
import { drizzle } from "drizzle-orm/node-postgres";
import pkg from "pg";
const { Pool } = pkg;
import { eq, desc, sql, and, lt } from "drizzle-orm";
import { velas, usuarios, feedbacks, resultadosClientes, type InsertVela, type Vela, type InsertFeedback, type Feedback, type InsertResultadoCliente, type ResultadoCliente } from "../shared/schema";
import type { ManutencaoStatus, SinaisManual, PrevisaoResponse, UltimaVelaResponse } from "../shared/schema";
import bcrypt from "bcryptjs";

if (!process.env.DATABASE_URL) {
  console.error('[DB] DATABASE_URL não configurada. Defina a variável de ambiente.');
}

const needsSSL = /\bsslmode=require\b/i.test(process.env.DATABASE_URL || '') || /render\.com|neon\.tech/i.test(process.env.DATABASE_URL || '');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: needsSSL ? { rejectUnauthorized: false } : undefined,
});

const db = drizzle(pool);

// Storage principal de velas
class DbStorage {
  private lastMultiplicador: number | null = null;
  
  // Cache de análise em tempo real
  private cachedAnalysis: PrevisaoResponse | null = null;
  private cachedAnalysisTimestamp: number = 0;
  private cachedVela: Vela | null = null;

  async addVela(data: InsertVela) {
    if (data.multiplicador !== -1 && data.multiplicador === this.lastMultiplicador) {
      console.log('[STORAGE] Ignorando multiplicador duplicado:', data.multiplicador);
      const ultimaVela = await this.getUltimaVela();
      return ultimaVela!;
    }

    this.lastMultiplicador = data.multiplicador;

    const [vela] = await db.insert(velas).values({
      multiplicador: data.multiplicador,
    }).returning();

    console.log('[STORAGE] Nova vela inserida:', {
      id: vela.id,
      multiplicador: vela.multiplicador,
      timestamp: vela.timestamp,
    });

    return vela;
  }

  async getUltimaVela() {
    const [vela] = await db
      .select()
      .from(velas)
      .orderBy(desc(velas.timestamp))
      .limit(1);

    console.log('[STORAGE] Última vela recuperada:', vela ? {
      id: vela.id,
      multiplicador: vela.multiplicador,
      timestamp: vela.timestamp,
    } : 'nenhuma');

    return vela;
  }

  async getHistorico(limit: number = 100) {
    const historico = await db
      .select()
      .from(velas)
      .orderBy(desc(velas.timestamp))
      .limit(limit);

    return historico;
  }

  private manutencaoStatus: ManutencaoStatus = {
    ativo: false,
    mensagem: "",
    motivo: "",
  };

  async getManutencaoStatus(): Promise<ManutencaoStatus> {
    return this.manutencaoStatus;
  }

  async setManutencaoStatus(status: ManutencaoStatus): Promise<ManutencaoStatus> {
    this.manutencaoStatus = status;
    return this.manutencaoStatus;
  }

  private sinaisManual: SinaisManual = {
    ativo: false,
    apos: null,
    sacar: null,
  };

  async getSinaisManual(): Promise<SinaisManual> {
    return this.sinaisManual;
  }

  async setSinaisManual(sinais: SinaisManual): Promise<SinaisManual> {
    this.sinaisManual = sinais;
    return this.sinaisManual;
  }

  // Cache de análise - armazena o resultado da última análise ML
  getCachedAnalysis(): { analysis: PrevisaoResponse | null; timestamp: number } {
    return {
      analysis: this.cachedAnalysis,
      timestamp: this.cachedAnalysisTimestamp
    };
  }

  setCachedAnalysis(analysis: PrevisaoResponse): void {
    this.cachedAnalysis = analysis;
    this.cachedAnalysisTimestamp = Date.now();
    console.log('[STORAGE] Análise atualizada no cache:', {
      multiplicador: analysis.multiplicador,
      sinal: analysis.sinal,
      confianca: analysis.confianca,
      timestamp: new Date(this.cachedAnalysisTimestamp).toISOString()
    });
  }

  // Cache de vela - armazena a última vela para evitar queries repetidas
  getCachedVela(): Vela | null {
    return this.cachedVela;
  }

  setCachedVela(vela: Vela): void {
    this.cachedVela = vela;
    console.log('[STORAGE] Vela atualizada no cache:', {
      id: vela.id,
      multiplicador: vela.multiplicador,
      timestamp: vela.timestamp
    });
  }

  // Limpar cache (útil para resetar estado)
  clearCache(): void {
    this.cachedAnalysis = null;
    this.cachedAnalysisTimestamp = 0;
    this.cachedVela = null;
    console.log('[STORAGE] Cache limpo');
  }

  // Feedback de experiência do usuário
  async adicionarFeedback(usuarioId: string | null, resposta: string): Promise<Feedback> {
    try {
      const [feedback] = await db.insert(feedbacks).values({
        usuario_id: usuarioId,
        resposta: resposta,
      }).returning();

      console.log('[STORAGE] Feedback registrado:', {
        id: feedback.id,
        usuario_id: feedback.usuario_id,
        resposta: feedback.resposta,
        timestamp: feedback.timestamp,
      });

      return feedback;
    } catch (error) {
      console.error('[STORAGE] Erro ao registrar feedback:', error);
      throw error;
    }
  }

  async listarFeedbacks(limit: number = 100): Promise<Feedback[]> {
    const feedbackList = await db
      .select()
      .from(feedbacks)
      .orderBy(desc(feedbacks.timestamp))
      .limit(limit);

    return feedbackList;
  }

  async contarFeedbacksPorResposta(): Promise<{ resposta: string; total: number }[]> {
    const result = await db
      .select({
        resposta: feedbacks.resposta,
        total: sql<number>`count(*)`,
      })
      .from(feedbacks)
      .groupBy(feedbacks.resposta);

    return result.map(r => ({
      resposta: r.resposta,
      total: Number(r.total),
    }));
  }

  // Métodos para resultados dos clientes
  async adicionarResultadoCliente(usuarioId: string | null, apos: number, sacar: number): Promise<ResultadoCliente> {
    try {
      const [resultado] = await db.insert(resultadosClientes).values({
        usuario_id: usuarioId,
        apos,
        sacar,
      }).returning();

      console.log('[STORAGE] Resultado do cliente registrado:', {
        id: resultado.id,
        usuario_id: resultado.usuario_id,
        apos: resultado.apos,
        sacar: resultado.sacar,
        timestamp: resultado.timestamp,
      });

      return resultado;
    } catch (error) {
      console.error('[STORAGE] Erro ao registrar resultado do cliente:', error);
      throw error;
    }
  }

  async listarResultadosClientes(limit: number = 100): Promise<ResultadoCliente[]> {
    const resultados = await db
      .select()
      .from(resultadosClientes)
      .orderBy(desc(resultadosClientes.timestamp))
      .limit(limit);

    return resultados;
  }
}

// Storage de usuários com sistema de expiração
class StorageUsuarios {
  async criarUsuario(data: { email: string; nome: string; senha: string; dias_acesso?: number }) {
    try {
      console.log('[STORAGE] Criando usuário:', data.email);
      const senhaHash = await bcrypt.hash(data.senha, 10);
      const diasAcesso = data.dias_acesso || 2;
      const dataExpiracao = new Date();
      dataExpiracao.setDate(dataExpiracao.getDate() + diasAcesso);

      const [usuario] = await db.insert(usuarios).values({
        email: data.email,
        nome: data.nome,
        senha: senhaHash,
        aprovado: 'false',
        ativo: 'true',
        dias_acesso: diasAcesso,
        data_expiracao: dataExpiracao,
      }).returning();

      console.log('[STORAGE] Usuário criado:', usuario.id);
      return usuario;
    } catch (error) {
      console.error('[STORAGE] Erro ao criar usuário:', error);
      throw error;
    }
  }

  async criarUsuarioAprovado(data: { email: string; nome: string; senha: string; dias_acesso?: number }) {
    const senhaHash = await bcrypt.hash(data.senha, 10);
    const diasAcesso = data.dias_acesso || 2;
    const dataExpiracao = new Date();
    dataExpiracao.setDate(dataExpiracao.getDate() + diasAcesso);

    const [usuario] = await db.insert(usuarios).values({
      email: data.email,
      nome: data.nome,
      senha: senhaHash,
      aprovado: 'true',
      ativo: 'true',
      dias_acesso: diasAcesso,
      data_expiracao: dataExpiracao,
    }).returning();

    return usuario;
  }

  async obterUsuarioPorEmail(email: string) {
    const [usuario] = await db
      .select()
      .from(usuarios)
      .where(eq(usuarios.email, email));

    return usuario;
  }

  async verificarUsuario(email: string, senha: string) {
    try {
      console.log('[STORAGE] Verificando usuário:', email);
      
      // Buscar usuário COM todas as validações
      const [usuario] = await db
        .select()
        .from(usuarios)
        .where(and(
          eq(usuarios.email, email),
          eq(usuarios.aprovado, 'true'),
          eq(usuarios.ativo, 'true')
        ));

      // VALIDAÇÃO 1: Usuário DEVE existir e estar aprovado/ativo
      if (!usuario) {
        console.log('[STORAGE] BLOQUEADO - Usuário não encontrado ou não aprovado/ativo:', email);
        return null;
      }

      // VALIDAÇÃO 2: Verificar dados essenciais
      if (!usuario.id || !usuario.email || !usuario.nome || !usuario.senha) {
        console.error('[STORAGE] BLOQUEADO - Dados de usuário incompletos:', email);
        return null;
      }

      // VALIDAÇÃO 3: Verificar expiração
      if (usuario.data_expiracao && new Date() > new Date(usuario.data_expiracao)) {
        console.log('[STORAGE] BLOQUEADO - Conta expirada:', email);
        // Desativar automaticamente se expirou
        await this.desativarUsuario(usuario.id);
        return null;
      }

      // VALIDAÇÃO 4: Verificar hash de senha
      if (usuario.senha.length < 10) {
        console.error('[STORAGE] BLOQUEADO - Hash de senha inválido:', email);
        return null;
      }

      // VALIDAÇÃO 5: Comparar senha
      const senhaValida = await bcrypt.compare(senha, usuario.senha);
      if (!senhaValida) {
        console.log('[STORAGE] BLOQUEADO - Senha incorreta:', email);
        return null;
      }

      // VALIDAÇÃO 6: Revalidar status antes de retornar
      if (usuario.aprovado !== 'true' || usuario.ativo !== 'true') {
        console.error('[STORAGE] BLOQUEADO - Status inválido:', email);
        return null;
      }

      console.log('[STORAGE] ✓ Verificação bem-sucedida:', {
        id: usuario.id,
        email: usuario.email,
        aprovado: usuario.aprovado,
        ativo: usuario.ativo
      });
      
      return usuario;
    } catch (error) {
      console.error('[STORAGE] Erro crítico ao verificar usuário:', error);
      throw error;
    }
  }

  async listarUsuarios() {
    const todosUsuarios = await db.select().from(usuarios);
    
    // Calcular tempo restante para cada usuário
    const usuariosComTempo = todosUsuarios.map(user => {
      let tempoRestante = null;
      if (user.data_expiracao) {
        const agora = new Date();
        const expiracao = new Date(user.data_expiracao);
        const diff = expiracao.getTime() - agora.getTime();
        
        if (diff > 0) {
          const dias = Math.floor(diff / (1000 * 60 * 60 * 24));
          const horas = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          tempoRestante = { dias, horas, expirado: false };
        } else {
          tempoRestante = { dias: 0, horas: 0, expirado: true };
        }
      }
      
      return {
        ...user,
        tempoRestante,
      };
    });

    return usuariosComTempo;
  }

  async aprovarUsuario(id: string) {
    // Ao aprovar, recalcular data de expiração a partir de agora
    const [usuario] = await db
      .select()
      .from(usuarios)
      .where(eq(usuarios.id, id));

    if (!usuario) return null;

    const dataExpiracao = new Date();
    dataExpiracao.setDate(dataExpiracao.getDate() + usuario.dias_acesso);

    const [atualizado] = await db
      .update(usuarios)
      .set({ 
        aprovado: 'true',
        data_expiracao: dataExpiracao,
      })
      .where(eq(usuarios.id, id))
      .returning();

    return atualizado;
  }

  async desativarUsuario(id: string) {
    const [usuario] = await db
      .update(usuarios)
      .set({ ativo: 'false' })
      .where(eq(usuarios.id, id))
      .returning();

    return usuario;
  }

  async ativarUsuario(id: string) {
    const [usuario] = await db
      .update(usuarios)
      .set({ ativo: 'true' })
      .where(eq(usuarios.id, id))
      .returning();

    return usuario;
  }

  async eliminarUsuario(id: string) {
    await db.delete(usuarios).where(eq(usuarios.id, id));
    return true;
  }

  async adicionarCompartilhamento(email: string) {
    const [usuario] = await db
      .update(usuarios)
      .set({ 
        compartilhamentos: sql`${usuarios.compartilhamentos} + 1`,
      })
      .where(eq(usuarios.email, email))
      .returning();

    return usuario;
  }

  // Tarefa automática para desativar contas expiradas
  async desativarContasExpiradas() {
    const agora = new Date();
    await db
      .update(usuarios)
      .set({ ativo: 'false' })
      .where(and(
        lt(usuarios.data_expiracao, agora),
        eq(usuarios.ativo, 'true')
      ));
  }
}

export const storage = new DbStorage();
export const storageUsuarios = new StorageUsuarios();

// Executar verificação de expiração a cada hora
setInterval(() => {
  storageUsuarios.desativarContasExpiradas();
}, 60 * 60 * 1000);
