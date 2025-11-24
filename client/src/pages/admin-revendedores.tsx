
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useProtection } from "@/hooks/use-protection";
import { ArrowLeft, Plus, Trash2, Users, X } from "lucide-react";

interface Revendedor {
  id: string;
  nome: string;
  email: string;
  creditos: number;
  ativo: string;
  data_expiracao: string;
}

interface Usuario {
  id: string;
  nome: string;
  email: string;
  ativo: string;
  data_criacao: string;
  data_expiracao: string;
  tempoRestante?: {
    dias: number;
    horas: number;
    expirado: boolean;
  };
}

export default function AdminRevendedores() {
  useProtection();
  const [, setLocation] = useLocation();
  const [revendedores, setRevendedores] = useState<Revendedor[]>([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [novoRevendedor, setNovoRevendedor] = useState({
    nome: '',
    email: '',
    senha: '',
    creditos: 10,
    dias_validade: 30,
  });
  const [usuariosModal, setUsuariosModal] = useState<{
    aberto: boolean;
    revendedorId: string;
    revendedorNome: string;
    usuarios: Usuario[];
    carregando: boolean;
  }>({
    aberto: false,
    revendedorId: '',
    revendedorNome: '',
    usuarios: [],
    carregando: false,
  });

  useEffect(() => {
    const isAuthenticated = sessionStorage.getItem('admin_authenticated');
    if (!isAuthenticated) {
      setLocation('/admin/login');
    }
    carregarRevendedores();
  }, [setLocation]);

  const carregarRevendedores = async () => {
    try {
      const response = await fetch('/api/revendedores/admin');
      const data = await response.json();
      if (data.success) {
        setRevendedores(data.data);
      }
    } catch (error) {
      console.error('Erro ao carregar revendedores:', error);
    }
  };

  const criarRevendedor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/revendedores/admin/criar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novoRevendedor),
      });
      const data = await response.json();
      if (data.success) {
        alert('Revendedor criado com sucesso!');
        setNovoRevendedor({ nome: '', email: '', senha: '', creditos: 10, dias_validade: 30 });
        setMostrarFormulario(false);
        carregarRevendedores();
      } else {
        alert(data.error || 'Erro ao criar revendedor');
      }
    } catch (error) {
      alert('Erro ao criar revendedor');
    }
  };

  const eliminarRevendedor = async (id: string) => {
    if (!confirm('ATENÇÃO: Deseja eliminar permanentemente este revendedor?')) return;
    try {
      const response = await fetch(`/api/revendedores/eliminar/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        alert('Revendedor eliminado com sucesso!');
        carregarRevendedores();
      }
    } catch (error) {
      alert('Erro ao eliminar revendedor');
    }
  };

  const atualizarCreditos = async (id: string, creditos: number) => {
    try {
      const response = await fetch(`/api/revendedores/atualizar-creditos/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creditos }),
      });
      const data = await response.json();
      if (data.success) {
        alert('Créditos atualizados com sucesso!');
        carregarRevendedores();
      }
    } catch (error) {
      alert('Erro ao atualizar créditos');
    }
  };

  const abrirUsuariosModal = async (revendedorId: string, revendedorNome: string) => {
    setUsuariosModal({
      aberto: true,
      revendedorId,
      revendedorNome,
      usuarios: [],
      carregando: true,
    });

    try {
      const response = await fetch(`/api/revendedores/listar-usuarios?revendedor_id=${revendedorId}`);
      const data = await response.json();
      if (data.success) {
        setUsuariosModal((prev) => ({
          ...prev,
          usuarios: data.data,
          carregando: false,
        }));
      }
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      setUsuariosModal((prev) => ({
        ...prev,
        carregando: false,
      }));
    }
  };

  const fecharUsuariosModal = () => {
    setUsuariosModal({
      aberto: false,
      revendedorId: '',
      revendedorNome: '',
      usuarios: [],
      carregando: false,
    });
  };

  const desativarUsuarioModal = async (usuarioId: string, nomeUsuario: string) => {
    if (!confirm(`Deseja desativar ${nomeUsuario}?`)) return;
    
    try {
      const response = await fetch(`/api/usuarios/desativar/${usuarioId}`, {
        method: 'POST',
      });
      const data = await response.json();
      if (data.success) {
        alert('Usuário desativado com sucesso!');
        abrirUsuariosModal(usuariosModal.revendedorId, usuariosModal.revendedorNome);
      }
    } catch (error) {
      alert('Erro ao desativar usuário');
    }
  };

  const deletarUsuarioModal = async (usuarioId: string, nomeUsuario: string) => {
    if (!confirm(`ATENÇÃO: Deseja eliminar permanentemente ${nomeUsuario}? Esta ação não pode ser desfeita!`)) return;
    
    try {
      const response = await fetch(`/api/usuarios/eliminar/${usuarioId}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        alert('Usuário eliminado com sucesso!');
        abrirUsuariosModal(usuariosModal.revendedorId, usuariosModal.revendedorNome);
      }
    } catch (error) {
      alert('Erro ao eliminar usuário');
    }
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
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
              borderColor: '#ffaa00',
              borderWidth: '2px',
              backgroundColor: 'transparent',
            }}
          >
            <h1 className="text-center font-display font-bold tracking-wide"
              style={{
                color: '#ffaa00',
                fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
                textShadow: '0 0 20px rgba(255, 170, 0, 0.5)',
              }}
            >
              GERENCIAR REVENDEDORES
            </h1>
          </div>
        </div>

        {/* Botão Criar Novo Revendedor */}
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
            {mostrarFormulario ? 'Cancelar' : 'Criar Novo Revendedor'}
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
            <h2 className="font-bold text-white text-xl mb-4">Criar Novo Revendedor</h2>
            <form onSubmit={criarRevendedor} className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-2">Nome</label>
                <input
                  type="text"
                  value={novoRevendedor.nome}
                  onChange={(e) => setNovoRevendedor({ ...novoRevendedor, nome: e.target.value })}
                  required
                  className="w-full px-4 py-2 rounded bg-gray-800 border border-gray-700 text-white"
                  placeholder="Nome completo"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  value={novoRevendedor.email}
                  onChange={(e) => setNovoRevendedor({ ...novoRevendedor, email: e.target.value })}
                  required
                  className="w-full px-4 py-2 rounded bg-gray-800 border border-gray-700 text-white"
                  placeholder="email@exemplo.com"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Senha</label>
                <input
                  type="password"
                  value={novoRevendedor.senha}
                  onChange={(e) => setNovoRevendedor({ ...novoRevendedor, senha: e.target.value })}
                  required
                  className="w-full px-4 py-2 rounded bg-gray-800 border border-gray-700 text-white"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Créditos Iniciais</label>
                <input
                  type="number"
                  value={novoRevendedor.creditos}
                  onChange={(e) => setNovoRevendedor({ ...novoRevendedor, creditos: parseInt(e.target.value) })}
                  required
                  min="0"
                  className="w-full px-4 py-2 rounded bg-gray-800 border border-gray-700 text-white"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Dias de Validade</label>
                <select
                  value={novoRevendedor.dias_validade}
                  onChange={(e) => setNovoRevendedor({ ...novoRevendedor, dias_validade: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 rounded bg-gray-800 border border-gray-700 text-white"
                >
                  <option value={7}>7 dias</option>
                  <option value={15}>15 dias</option>
                  <option value={30}>30 dias</option>
                  <option value={60}>60 dias</option>
                  <option value={90}>90 dias</option>
                  <option value={365}>1 ano</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full px-6 py-3 rounded font-bold hover:opacity-80"
                style={{
                  backgroundColor: '#00ff00',
                  color: '#000000',
                }}
              >
                Criar Revendedor
              </button>
            </form>
          </div>
        )}

        {/* Lista de Revendedores */}
        <div className="space-y-4">
          {revendedores.length === 0 ? (
            <p className="text-center text-gray-400">Nenhum revendedor cadastrado</p>
          ) : (
            revendedores.map((revendedor) => (
              <div
                key={revendedor.id}
                className="rounded-xl border p-6"
                style={{
                  borderColor: '#ffaa00',
                  borderWidth: '2px',
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                }}
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-white text-lg">{revendedor.nome}</h3>
                    <p className="text-gray-400">{revendedor.email}</p>
                    <p className="text-green-500 font-bold text-xl mt-2">
                      Créditos: {revendedor.creditos}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Validade: {new Date(revendedor.data_expiracao).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => {
                        const novosCreditos = prompt('Digite a quantidade de créditos:', String(revendedor.creditos));
                        if (novosCreditos !== null) {
                          atualizarCreditos(revendedor.id, parseInt(novosCreditos));
                        }
                      }}
                      className="px-4 py-2 rounded font-bold hover:opacity-80"
                      style={{
                        backgroundColor: '#00bfff',
                        color: '#000000',
                      }}
                      data-testid="button-edit-credits"
                    >
                      Editar Créditos
                    </button>
                    <button
                      onClick={() => eliminarRevendedor(revendedor.id)}
                      className="px-4 py-2 rounded font-bold hover:opacity-80 flex items-center gap-2"
                      style={{
                        backgroundColor: '#ff0000',
                        color: '#ffffff',
                      }}
                      data-testid="button-delete-reseller"
                    >
                      <Trash2 className="w-4 h-4" />
                      Eliminar
                    </button>
                    <button
                      onClick={() => abrirUsuariosModal(revendedor.id, revendedor.nome)}
                      className="px-4 py-2 rounded font-bold hover:opacity-80 flex items-center justify-center gap-2"
                      style={{
                        backgroundColor: '#9933ff',
                        color: '#ffffff',
                      }}
                      data-testid="button-view-users"
                    >
                      <Users className="w-4 h-4" />
                      Ver Usuários
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal de Usuários */}
        {usuariosModal.aberto && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div
              className="rounded-xl border p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto"
              style={{
                borderColor: '#9933ff',
                borderWidth: '2px',
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-white text-2xl">
                  Usuários de {usuariosModal.revendedorNome}
                </h2>
                <button
                  onClick={fecharUsuariosModal}
                  className="p-2 hover:bg-gray-800 rounded"
                  data-testid="button-close-users-modal"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>

              {usuariosModal.carregando ? (
                <div className="text-center text-gray-400 py-8">
                  <p>Carregando usuários...</p>
                </div>
              ) : usuariosModal.usuarios.length === 0 ? (
                <div className="text-center text-gray-400 py-8">
                  <p>Nenhum usuário registrado por este revendedor</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {usuariosModal.usuarios.map((usuario) => (
                    <div
                      key={usuario.id}
                      className="rounded-lg border p-4"
                      style={{
                        borderColor: '#666666',
                        backgroundColor: 'rgba(50, 50, 50, 0.5)',
                      }}
                      data-testid={`user-item-${usuario.id}`}
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <p className="font-bold text-white">{usuario.nome}</p>
                          <p className="text-gray-400 text-sm">{usuario.email}</p>
                          <p className={`text-xs font-bold mt-2 ${usuario.ativo === 'true' ? 'text-green-500' : 'text-red-500'}`}>
                            Status: {usuario.ativo === 'true' ? 'Ativo' : 'Desativado'}
                          </p>
                          <p className="text-gray-500 text-xs mt-2">
                            Criado: {new Date(usuario.data_criacao).toLocaleDateString('pt-BR')}
                          </p>
                          <p
                            className={`text-xs mt-1 font-bold ${
                              usuario.tempoRestante?.expirado
                                ? 'text-red-500'
                                : 'text-green-500'
                            }`}
                          >
                            {usuario.tempoRestante?.expirado
                              ? 'Expirado'
                              : `Tempo restante: ${usuario.tempoRestante?.dias}d ${usuario.tempoRestante?.horas}h`}
                          </p>
                        </div>
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => desativarUsuarioModal(usuario.id, usuario.nome)}
                            className="px-3 py-1 rounded text-xs font-bold hover:opacity-80"
                            style={{
                              backgroundColor: '#ff9900',
                              color: '#000000',
                            }}
                            data-testid="button-deactivate-user"
                          >
                            Desativar
                          </button>
                          <button
                            onClick={() => deletarUsuarioModal(usuario.id, usuario.nome)}
                            className="px-3 py-1 rounded text-xs font-bold hover:opacity-80 flex items-center justify-center gap-1"
                            style={{
                              backgroundColor: '#ff0000',
                              color: '#ffffff',
                            }}
                            data-testid="button-delete-user"
                          >
                            <Trash2 className="w-3 h-3" />
                            Deletar
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={fecharUsuariosModal}
                className="w-full mt-4 px-4 py-2 rounded font-bold hover:opacity-80"
                style={{
                  backgroundColor: '#666666',
                  color: '#ffffff',
                }}
                data-testid="button-close-modal"
              >
                Fechar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
