
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useProtection } from "@/hooks/use-protection";
import { ArrowLeft, Plus, Trash2, UserX, UserCheck } from "lucide-react";

interface Usuario {
  id: string;
  nome: string;
  email: string;
  aprovado: boolean;
  ativo: boolean;
  compartilhamentos: number;
}

export default function AdminUsuarios() {
  useProtection();
  const [, setLocation] = useLocation();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [novoUsuario, setNovoUsuario] = useState({
    nome: '',
    email: '',
    senha: '',
  });

  useEffect(() => {
    const isAuthenticated = sessionStorage.getItem('admin_authenticated');
    if (!isAuthenticated) {
      setLocation('/admin/login');
    }
    carregarUsuarios();
  }, [setLocation]);

  const carregarUsuarios = async () => {
    try {
      const response = await fetch('/api/usuarios/admin');
      const data = await response.json();
      if (data.success) {
        setUsuarios(data.data);
      }
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    }
  };

  const criarUsuario = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/usuarios/admin/criar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novoUsuario),
      });
      const data = await response.json();
      if (data.success) {
        alert('Usuário criado com sucesso!');
        setNovoUsuario({ nome: '', email: '', senha: '' });
        setMostrarFormulario(false);
        carregarUsuarios();
      } else {
        alert(data.error || 'Erro ao criar usuário');
      }
    } catch (error) {
      alert('Erro ao criar usuário');
    }
  };

  const aprovarUsuario = async (id: string) => {
    try {
      const response = await fetch(`/api/usuarios/aprovar/${id}`, {
        method: 'POST',
      });
      const data = await response.json();
      if (data.success) {
        alert('Usuário aprovado com sucesso!');
        carregarUsuarios();
      }
    } catch (error) {
      alert('Erro ao aprovar usuário');
    }
  };

  const desativarUsuario = async (id: string) => {
    if (!confirm('Deseja desativar este usuário?')) return;
    try {
      const response = await fetch(`/api/usuarios/desativar/${id}`, {
        method: 'POST',
      });
      const data = await response.json();
      if (data.success) {
        alert('Usuário desativado com sucesso!');
        carregarUsuarios();
      }
    } catch (error) {
      alert('Erro ao desativar usuário');
    }
  };

  const ativarUsuario = async (id: string) => {
    try {
      const response = await fetch(`/api/usuarios/ativar/${id}`, {
        method: 'POST',
      });
      const data = await response.json();
      if (data.success) {
        alert('Usuário ativado com sucesso!');
        carregarUsuarios();
      }
    } catch (error) {
      alert('Erro ao ativar usuário');
    }
  };

  const eliminarUsuario = async (id: string) => {
    if (!confirm('ATENÇÃO: Deseja eliminar permanentemente este usuário? Esta ação não pode ser desfeita!')) return;
    try {
      const response = await fetch(`/api/usuarios/eliminar/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        alert('Usuário eliminado com sucesso!');
        carregarUsuarios();
      }
    } catch (error) {
      alert('Erro ao eliminar usuário');
    }
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none z-10 opacity-5"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255, 255, 255, 0.03) 2px, rgba(255, 255, 255, 0.03) 4px)',
        }}
      />
      <div className="fixed inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at center, rgba(157, 78, 221, 0.05) 0%, rgba(0, 0, 0, 1) 70%)',
        }}
      />

      <div className="relative z-20 w-full max-w-4xl mx-auto p-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => setLocation('/admin')}
            className="p-2 rounded hover:bg-gray-800"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <div
            className="flex-1 rounded-xl border py-6"
            style={{
              borderColor: '#ff0000',
              borderWidth: '2px',
              backgroundColor: 'transparent',
            }}
          >
            <h1 className="text-center font-display font-bold tracking-wide"
              style={{
                color: '#ff0000',
                fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
                textShadow: '0 0 20px rgba(255, 0, 0, 0.5)',
              }}
            >
              GERENCIAR USUÁRIOS
            </h1>
          </div>
        </div>

        {/* Botão Criar Novo Usuário */}
        <div className="mb-6">
          <button
            onClick={() => setMostrarFormulario(!mostrarFormulario)}
            className="w-full px-6 py-4 rounded font-bold hover:opacity-80 flex items-center justify-center gap-2"
            style={{
              backgroundColor: '#00ff00',
              color: '#000000',
            }}
          >
            <Plus className="w-5 h-5" />
            {mostrarFormulario ? 'Cancelar' : 'Criar Novo Usuário'}
          </button>
        </div>

        {/* Formulário de Criação */}
        {mostrarFormulario && (
          <div className="mb-6 rounded-xl border p-6"
            style={{
              borderColor: '#00ff00',
              borderWidth: '2px',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
            }}
          >
            <h2 className="font-bold text-white text-xl mb-4">Criar Novo Usuário</h2>
            <form onSubmit={criarUsuario} className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-2">Nome</label>
                <input
                  type="text"
                  value={novoUsuario.nome}
                  onChange={(e) => setNovoUsuario({ ...novoUsuario, nome: e.target.value })}
                  required
                  className="w-full px-4 py-2 rounded bg-gray-800 border border-gray-700 text-white"
                  placeholder="Nome completo"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  value={novoUsuario.email}
                  onChange={(e) => setNovoUsuario({ ...novoUsuario, email: e.target.value })}
                  required
                  className="w-full px-4 py-2 rounded bg-gray-800 border border-gray-700 text-white"
                  placeholder="email@exemplo.com"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Senha</label>
                <input
                  type="password"
                  value={novoUsuario.senha}
                  onChange={(e) => setNovoUsuario({ ...novoUsuario, senha: e.target.value })}
                  required
                  className="w-full px-4 py-2 rounded bg-gray-800 border border-gray-700 text-white"
                  placeholder="••••••••"
                />
              </div>
              <button
                type="submit"
                className="w-full px-6 py-3 rounded font-bold hover:opacity-80"
                style={{
                  backgroundColor: '#00ff00',
                  color: '#000000',
                }}
              >
                Criar Usuário
              </button>
            </form>
          </div>
        )}

        {/* Lista de Usuários */}
        <div className="space-y-4">
          {usuarios.length === 0 ? (
            <p className="text-center text-gray-400">Nenhum usuário cadastrado</p>
          ) : (
            usuarios.map((usuario) => (
              <div
                key={usuario.id}
                className="rounded-xl border p-6"
                style={{
                  borderColor: usuario.ativo ? (usuario.aprovado ? '#00ff00' : '#ff0000') : '#666666',
                  borderWidth: '2px',
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                }}
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-white text-lg">{usuario.nome}</h3>
                    <p className="text-gray-400">{usuario.email}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Compartilhamentos: {usuario.compartilhamentos}
                    </p>
                    <div className="flex gap-2 mt-2">
                      <p className="text-sm" style={{ color: usuario.aprovado ? '#00ff00' : '#ff0000' }}>
                        {usuario.aprovado ? '✅ Aprovado' : '⏳ Pendente'}
                      </p>
                      <p className="text-sm" style={{ color: usuario.ativo ? '#00ff00' : '#666666' }}>
                        {usuario.ativo ? '🟢 Ativo' : '⚫ Desativado'}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    {!usuario.aprovado && (
                      <button
                        onClick={() => aprovarUsuario(usuario.id)}
                        className="px-4 py-2 rounded font-bold hover:opacity-80 flex items-center gap-2"
                        style={{
                          backgroundColor: '#00ff00',
                          color: '#000000',
                        }}
                      >
                        <UserCheck className="w-4 h-4" />
                        Aprovar
                      </button>
                    )}
                    {usuario.ativo ? (
                      <button
                        onClick={() => desativarUsuario(usuario.id)}
                        className="px-4 py-2 rounded font-bold hover:opacity-80 flex items-center gap-2"
                        style={{
                          backgroundColor: '#ff9900',
                          color: '#000000',
                        }}
                      >
                        <UserX className="w-4 h-4" />
                        Desativar
                      </button>
                    ) : (
                      <button
                        onClick={() => ativarUsuario(usuario.id)}
                        className="px-4 py-2 rounded font-bold hover:opacity-80 flex items-center gap-2"
                        style={{
                          backgroundColor: '#00ff00',
                          color: '#000000',
                        }}
                      >
                        <UserCheck className="w-4 h-4" />
                        Ativar
                      </button>
                    )}
                    <button
                      onClick={() => eliminarUsuario(usuario.id)}
                      className="px-4 py-2 rounded font-bold hover:opacity-80 flex items-center gap-2"
                      style={{
                        backgroundColor: '#ff0000',
                        color: '#ffffff',
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
