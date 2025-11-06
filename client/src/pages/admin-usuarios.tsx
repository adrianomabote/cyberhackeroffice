
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useProtection } from "@/hooks/use-protection";
import { ArrowLeft } from "lucide-react";

export default function AdminUsuarios() {
  useProtection();
  const [, setLocation] = useLocation();
  const [usuarios, setUsuarios] = useState<any[]>([]);

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
                  borderColor: usuario.aprovado ? '#00ff00' : '#ff0000',
                  borderWidth: '2px',
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                }}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-white text-lg">{usuario.nome}</h3>
                    <p className="text-gray-400">{usuario.email}</p>
                    <p className="text-sm text-gray-500">
                      Compartilhamentos: {usuario.compartilhamentos}
                    </p>
                    <p className="text-sm" style={{ color: usuario.aprovado ? '#00ff00' : '#ff0000' }}>
                      {usuario.aprovado ? '✅ Aprovado' : '⏳ Pendente'}
                    </p>
                  </div>
                  {!usuario.aprovado && (
                    <button
                      onClick={() => aprovarUsuario(usuario.id)}
                      className="px-6 py-3 rounded font-bold hover:opacity-80"
                      style={{
                        backgroundColor: '#00ff00',
                        color: '#000000',
                      }}
                    >
                      Aprovar
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
