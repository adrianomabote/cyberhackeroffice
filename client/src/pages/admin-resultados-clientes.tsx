import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useProtection } from "@/hooks/use-protection";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Copy, Trash2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { ResultadoCliente } from "@shared/schema";

export default function AdminResultadosClientes() {
  useProtection();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  // Mutation para deletar resultado
  const deletarMutation = useMutation({
    mutationFn: async (resultadoId: string) => {
      const res = await apiRequest("DELETE", `/api/resultados-clientes/${resultadoId}`, null);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/resultados-clientes/lista'] });
      toast({
        title: "✅ Resultado removido",
        description: "O resultado foi deletado com sucesso.",
        variant: "default",
      });
    },
    onError: () => {
      toast({
        title: "❌ Erro",
        description: "Não foi possível deletar o resultado.",
        variant: "destructive",
      });
    },
  });

  // Copiar para clipboard
  const copiarParaClipboard = (valor: string | number, tipo: string) => {
    navigator.clipboard.writeText(String(valor));
    toast({
      title: `✅ ${tipo} copiado!`,
      description: `Valor: ${valor}`,
      variant: "default",
    });
  };

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
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm" style={{ color: '#888888' }}>Apos:</span>
                          <span className="font-bold" style={{ color: '#ffffff' }}>
                            {resultado.apos}
                          </span>
                          <button
                            onClick={() => copiarParaClipboard(resultado.apos, 'Apos')}
                            className="p-1 hover:bg-gray-700 rounded transition-colors"
                            data-testid={`button-copy-apos-${resultado.id}`}
                            title="Copiar Apos"
                          >
                            <Copy className="w-3 h-3" style={{ color: '#888888' }} />
                          </button>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm" style={{ color: '#888888' }}>Sacar:</span>
                          <span className="font-bold" style={{ color: '#ff0000' }}>
                            {resultado.sacar}
                          </span>
                          <button
                            onClick={() => copiarParaClipboard(resultado.sacar, 'Sacar')}
                            className="p-1 hover:bg-gray-700 rounded transition-colors"
                            data-testid={`button-copy-sacar-${resultado.id}`}
                            title="Copiar Sacar"
                          >
                            <Copy className="w-3 h-3" style={{ color: '#888888' }} />
                          </button>
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end gap-2">
                        <p className="text-xs" style={{ color: '#666666' }}>
                          {new Date(resultado.timestamp).toLocaleString('pt-BR')}
                        </p>
                        <button
                          onClick={() => deletarMutation.mutate(resultado.id)}
                          disabled={deletarMutation.isPending}
                          className="p-1 hover:bg-red-900 rounded transition-colors"
                          data-testid={`button-delete-${resultado.id}`}
                          title="Deletar resultado"
                        >
                          <Trash2 className="w-4 h-4" style={{ color: '#ff0000' }} />
                        </button>
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
