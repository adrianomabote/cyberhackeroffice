
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useProtection } from "@/hooks/use-protection";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";

interface Revendedor {
  id: string;
  nome: string;
  email: string;
  creditos: number;
  ativo: string;
  data_expiracao: string;
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
