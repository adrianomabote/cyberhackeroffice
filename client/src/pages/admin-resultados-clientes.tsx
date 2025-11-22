import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useProtection } from "@/hooks/use-protection";
import { ArrowLeft } from "lucide-react";
import type { ResultadoCliente } from "@shared/schema";

export default function AdminResultadosClientes() {
  useProtection();
  const [, setLocation] = useLocation();

  // Verificar autenticação
  useEffect(() => {
    const isAuthenticated = sessionStorage.getItem('admin_authenticated');
    if (!isAuthenticated) {
      setLocation('/admin/login');
    }
  }, [setLocation]);

  // Buscar resultados dos clientes
  const { data: resultadosData, isLoading } = useQuery<{ success: boolean; data: ResultadoCliente[]; total: number }>({
    queryKey: ['/api/resultados-clientes/lista'],
    refetchInterval: 5000,
  });

  const resultados = resultadosData?.data || [];

  // Agrupar por usuário
  const resultadosPorUsuario = resultados.reduce((acc, resultado) => {
    const usuarioId = resultado.usuario_id || 'Anônimo';
    if (!acc[usuarioId]) {
      acc[usuarioId] = [];
    }
    acc[usuarioId].push(resultado);
    return acc;
  }, {} as Record<string, ResultadoCliente[]>);

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Background effects */}
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
        <div className="mb-8">
          <button
            onClick={() => setLocation('/admin')}
            className="flex items-center gap-2 mb-4 text-purple-400 hover:text-purple-300 transition-colors"
            data-testid="button-voltar-admin"
          >
            <ArrowLeft className="w-5 h-5" />
            Voltar para Admin
          </button>

          <div
            className="rounded-xl border py-6"
            style={{
              borderColor: '#9d4edd',
              borderWidth: '2px',
              backgroundColor: 'transparent',
            }}
          >
            <h1 className="text-center font-display font-bold tracking-wide"
              style={{
                color: '#9d4edd',
                fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
                textShadow: '0 0 20px rgba(157, 78, 221, 0.5)',
              }}
            >
              📊 RESULTADOS DOS CLIENTES
            </h1>
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="text-center py-8">
            <p style={{ color: '#9d4edd' }}>Carregando resultados...</p>
          </div>
        )}

        {/* Resultados por usuário */}
        {!isLoading && Object.keys(resultadosPorUsuario).length === 0 && (
          <div className="text-center py-8">
            <p style={{ color: '#888888' }}>Nenhum resultado enviado ainda.</p>
          </div>
        )}

        {!isLoading && Object.keys(resultadosPorUsuario).length > 0 && (
          <div className="space-y-6">
            {Object.entries(resultadosPorUsuario).map(([usuarioId, resultadosUsuario]) => (
              <div
                key={usuarioId}
                className="rounded-xl border p-6"
                style={{
                  borderColor: '#444444',
                  borderWidth: '1px',
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                }}
              >
                {/* Cabeçalho do usuário */}
                <div className="mb-4 pb-4 border-b border-purple-500/30">
                  <h2 className="font-bold text-lg" style={{ color: '#9d4edd' }}>
                    {usuarioId === 'Anônimo' ? '👤 Usuário Anônimo' : `👤 Usuário ID: ${usuarioId}`}
                  </h2>
                  <p className="text-sm" style={{ color: '#888888' }}>
                    {resultadosUsuario.length} resultado(s) enviado(s)
                  </p>
                </div>

                {/* Lista de resultados */}
                <div className="space-y-3">
                  {resultadosUsuario.map((resultado) => (
                    <div
                      key={resultado.id}
                      className="flex items-center justify-between p-3 rounded-lg"
                      style={{
                        backgroundColor: 'rgba(157, 78, 221, 0.1)',
                        borderLeft: '3px solid #9d4edd',
                      }}
                      data-testid={`resultado-${resultado.id}`}
                    >
                      <div className="flex gap-6">
                        <div>
                          <span className="text-sm" style={{ color: '#888888' }}>Apos:</span>
                          <span className="ml-2 font-bold" style={{ color: '#00ff00' }}>
                            {resultado.apos.toFixed(2)}X
                          </span>
                        </div>
                        <div>
                          <span className="text-sm" style={{ color: '#888888' }}>Sacar:</span>
                          <span className="ml-2 font-bold" style={{ color: '#00d9ff' }}>
                            {resultado.sacar.toFixed(2)}X
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs" style={{ color: '#666666' }}>
                          {new Date(resultado.timestamp).toLocaleString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
