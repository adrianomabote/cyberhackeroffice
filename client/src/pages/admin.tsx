import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { ManutencaoStatus, SinaisManual } from "@shared/schema";

export default function Admin() {
  const [mensagem, setMensagem] = useState("");
  const [valorApos, setValorApos] = useState("");
  const [valorSacar, setValorSacar] = useState("");
  const motivo = "O ROBÔ ESTÁ ATUALIZANDO. ENTRE NO HORÁRIO INDICADO PARA CONTINUAR USANDO O SISTEMA.";
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar status atual de manutenção
  const { data: statusData } = useQuery<ManutencaoStatus>({
    queryKey: ['/api/manutencao/cyber'],
    refetchInterval: 2000,
  });

  // Buscar sinais manuais
  const { data: sinaisData } = useQuery<SinaisManual>({
    queryKey: ['/api/sinais-manual/cyber'],
    refetchInterval: 2000,
  });

  const ativarManutencao = useMutation({
    mutationFn: async (data: ManutencaoStatus) => {
      const res = await apiRequest("POST", "/api/manutencao/cyber", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/manutencao/cyber"] });
      toast({
        title: "✅ Manutenção Ativada",
        description: "Sistema entrará em manutenção imediatamente",
      });
      setMensagem("");
    },
    onError: () => {
      toast({
        title: "❌ Erro",
        description: "Não foi possível ativar a manutenção",
        variant: "destructive",
      });
    },
  });

  const desativarManutencao = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/manutencao/cyber", {
        ativo: false,
        mensagem: "",
        motivo,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/manutencao/cyber"] });
      toast({
        title: "✅ Manutenção Desativada",
        description: "Sistema voltou ao normal",
      });
    },
    onError: () => {
      toast({
        title: "❌ Erro",
        description: "Não foi possível desativar a manutenção",
        variant: "destructive",
      });
    },
  });

  const handleAtivar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mensagem.trim()) {
      toast({
        title: "⚠️ Campo obrigatório",
        description: "Preencha a mensagem de retorno",
        variant: "destructive",
      });
      return;
    }
    ativarManutencao.mutate({
      ativo: true,
      mensagem: mensagem.trim(),
      motivo: motivo,
    });
  };

  const handleDesativar = () => {
    desativarManutencao.mutate();
  };

  const ativarSinaisManual = useMutation({
    mutationFn: async (data: SinaisManual) => {
      const res = await apiRequest("POST", "/api/sinais-manual/cyber", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sinais-manual/cyber"] });
      toast({
        title: "✅ Sinais Manuais Ativados",
        description: "Valores APÓS e SACAR definidos manualmente",
      });
      setValorApos("");
      setValorSacar("");
    },
    onError: () => {
      toast({
        title: "❌ Erro",
        description: "Não foi possível ativar sinais manuais",
        variant: "destructive",
      });
    },
  });

  const desativarSinaisManual = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/sinais-manual/cyber", {
        ativo: false,
        apos: null,
        sacar: null,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sinais-manual/cyber"] });
      toast({
        title: "✅ Sinais Manuais Desativados",
        description: "Sistema volta a usar valores automáticos",
      });
    },
    onError: () => {
      toast({
        title: "❌ Erro",
        description: "Não foi possível desativar sinais manuais",
        variant: "destructive",
      });
    },
  });

  const handleAtivarSinais = (e: React.FormEvent) => {
    e.preventDefault();
    
    const apos = parseFloat(valorApos);
    const sacar = parseFloat(valorSacar);
    
    if (isNaN(apos) || apos < 1) {
      toast({
        title: "⚠️ Valor inválido",
        description: "APÓS deve ser um número maior ou igual a 1",
        variant: "destructive",
      });
      return;
    }
    
    if (isNaN(sacar) || sacar < 1) {
      toast({
        title: "⚠️ Valor inválido",
        description: "SACAR deve ser um número maior ou igual a 1",
        variant: "destructive",
      });
      return;
    }
    
    ativarSinaisManual.mutate({
      ativo: true,
      apos,
      sacar,
    });
  };

  const handleDesativarSinais = () => {
    desativarSinaisManual.mutate();
  };

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

      <div className="relative z-20 w-full max-w-2xl mx-auto p-8">
        {/* Header */}
        <div
          className="rounded-xl border py-6 mb-8"
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
            ADMIN - MANUTENÇÃO
          </h1>
        </div>

        {/* Status Atual */}
        <div
          className="rounded-xl border p-6 mb-8 text-center"
          style={{
            borderColor: '#444444',
            borderWidth: '1px',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          }}
        >
          <p className="font-sans font-normal mb-2" style={{ color: '#888888', fontSize: '0.875rem' }}>
            Status do Sistema
          </p>
          <p 
            className="font-mono font-bold"
            style={{
              color: statusData?.ativo ? '#ff0000' : '#00ff00',
              fontSize: '1.5rem',
            }}
            data-testid="text-status"
          >
            {statusData?.ativo ? 'ATIVO' : 'INATIVO'}
          </p>
          {statusData?.ativo && statusData.mensagem && (
            <p className="font-sans mt-2" style={{ color: '#ffffff', fontSize: '1rem' }}>
              {statusData.mensagem} - {statusData.motivo}
            </p>
          )}
        </div>

        {/* Formulário Ativar Manutenção */}
        <div
          className="rounded-xl border p-8 mb-6"
          style={{
            borderColor: '#444444',
            borderWidth: '1px',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          }}
        >
          <h2 className="font-sans font-bold mb-6" style={{ color: '#ffffff', fontSize: '1.5rem' }}>
            Ativar Manutenção
          </h2>

          <form onSubmit={handleAtivar} className="space-y-6">
            <div>
              <label className="block font-sans font-normal mb-2" style={{ color: '#ffffff', fontSize: '1rem' }}>
                Mensagem de Retorno
              </label>
              <input
                type="text"
                value={mensagem}
                onChange={(e) => setMensagem(e.target.value)}
                placeholder="VOLTE ÀS 15:30"
                className="w-full px-4 py-3 rounded border font-mono"
                style={{
                  backgroundColor: '#000000',
                  borderColor: '#333333',
                  color: '#ffffff',
                  fontSize: '1.25rem',
                }}
                data-testid="input-mensagem"
              />
            </div>

            <div>
              <label className="block font-sans font-normal mb-2" style={{ color: '#888888', fontSize: '0.875rem' }}>
                Motivo (fixo)
              </label>
              <div
                className="w-full px-4 py-3 rounded border font-mono"
                style={{
                  backgroundColor: '#111111',
                  borderColor: '#333333',
                  color: '#666666',
                  fontSize: '1rem',
                }}
              >
                {motivo}
              </div>
            </div>

            <button
              type="submit"
              disabled={ativarManutencao.isPending}
              className="w-full py-4 rounded font-sans font-bold transition-all hover:opacity-80"
              style={{
                backgroundColor: '#ff0000',
                color: '#ffffff',
                fontSize: '1.25rem',
                border: 'none',
              }}
              data-testid="button-ativar"
            >
              {ativarManutencao.isPending ? "ATIVANDO..." : "ATIVAR MANUTENÇÃO"}
            </button>
          </form>
        </div>

        {/* Botão Desativar */}
        <div
          className="rounded-xl border p-8 mb-6"
          style={{
            borderColor: '#444444',
            borderWidth: '1px',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          }}
        >
          <h2 className="font-sans font-bold mb-4" style={{ color: '#ffffff', fontSize: '1.5rem' }}>
            Desativar Manutenção
          </h2>
          <button
            onClick={handleDesativar}
            disabled={desativarManutencao.isPending}
            className="w-full py-4 rounded font-sans font-bold transition-all hover:opacity-80"
            style={{
              backgroundColor: '#9d4edd',
              color: '#ffffff',
              fontSize: '1.25rem',
              border: 'none',
            }}
            data-testid="button-desativar"
          >
            {desativarManutencao.isPending ? "DESATIVANDO..." : "DESATIVAR MANUTENÇÃO"}
          </button>
        </div>

        {/* Sinais Manuais */}
        <div
          className="rounded-xl border p-8 mb-6"
          style={{
            borderColor: '#444444',
            borderWidth: '1px',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          }}
        >
          <h2 className="font-sans font-bold mb-6" style={{ color: '#ffffff', fontSize: '1.5rem' }}>
            Sinais Manuais
          </h2>

          {/* Status dos sinais manuais */}
          <div className="mb-6 p-4 rounded border" style={{ borderColor: '#333333', backgroundColor: '#000000' }}>
            <p className="font-sans font-normal mb-2" style={{ color: '#888888', fontSize: '0.875rem' }}>
              Status
            </p>
            <p 
              className="font-mono font-bold"
              style={{
                color: sinaisData?.ativo ? '#00ff00' : '#888888',
                fontSize: '1.25rem',
              }}
              data-testid="text-sinais-status"
            >
              {sinaisData?.ativo ? 'ATIVO' : 'INATIVO'}
            </p>
            {sinaisData?.ativo && (
              <p className="font-sans mt-2" style={{ color: '#ffffff', fontSize: '1rem' }}>
                APÓS: {sinaisData.apos?.toFixed(2)}X | SACAR: {sinaisData.sacar?.toFixed(2)}X
              </p>
            )}
          </div>

          <form onSubmit={handleAtivarSinais} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-sans font-normal mb-2" style={{ color: '#ffffff', fontSize: '1rem' }}>
                  APÓS (multiplicador)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  value={valorApos}
                  onChange={(e) => setValorApos(e.target.value)}
                  placeholder="2.45"
                  className="w-full px-4 py-3 rounded border font-mono"
                  style={{
                    backgroundColor: '#000000',
                    borderColor: '#333333',
                    color: '#ffffff',
                    fontSize: '1.25rem',
                  }}
                  data-testid="input-apos"
                />
              </div>

              <div>
                <label className="block font-sans font-normal mb-2" style={{ color: '#ffffff', fontSize: '1rem' }}>
                  SACAR (multiplicador)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  value={valorSacar}
                  onChange={(e) => setValorSacar(e.target.value)}
                  placeholder="3.00"
                  className="w-full px-4 py-3 rounded border font-mono"
                  style={{
                    backgroundColor: '#000000',
                    borderColor: '#333333',
                    color: '#ffffff',
                    fontSize: '1.25rem',
                  }}
                  data-testid="input-sacar"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={ativarSinaisManual.isPending}
              className="w-full py-4 rounded font-sans font-bold transition-all hover:opacity-80"
              style={{
                backgroundColor: '#00ff00',
                color: '#000000',
                fontSize: '1.25rem',
                border: 'none',
              }}
              data-testid="button-ativar-sinais"
            >
              {ativarSinaisManual.isPending ? "ATIVANDO..." : "ATIVAR SINAIS MANUAIS"}
            </button>
          </form>
        </div>

        {/* Desativar Sinais Manuais */}
        <div
          className="rounded-xl border p-8 mb-6"
          style={{
            borderColor: '#444444',
            borderWidth: '1px',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          }}
        >
          <h2 className="font-sans font-bold mb-4" style={{ color: '#ffffff', fontSize: '1.5rem' }}>
            Desativar Sinais Manuais
          </h2>
          <button
            onClick={handleDesativarSinais}
            disabled={desativarSinaisManual.isPending}
            className="w-full py-4 rounded font-sans font-bold transition-all hover:opacity-80"
            style={{
              backgroundColor: '#ff6600',
              color: '#ffffff',
              fontSize: '1.25rem',
              border: 'none',
            }}
            data-testid="button-desativar-sinais"
          >
            {desativarSinaisManual.isPending ? "DESATIVANDO..." : "DESATIVAR SINAIS MANUAIS"}
          </button>
        </div>

        {/* Enviar Três Pontinhos Manualmente */}
        <div
          className="rounded-xl border p-8"
          style={{
            borderColor: '#444444',
            borderWidth: '1px',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          }}
        >
          <h2 className="font-sans font-bold mb-4" style={{ color: '#ffffff', fontSize: '1.5rem' }}>
            Enviar Três Pontinhos Manualmente
          </h2>
          <p className="font-sans mb-4" style={{ color: '#888888', fontSize: '0.875rem' }}>
            Enviar sinal de "⁙" (três pontinhos) para ocultar os valores no sistema
          </p>
          <button
            onClick={async () => {
              try {
                const res = await apiRequest("POST", "/api/velas/cyber", {
                  multiplicador: -1,
                });
                if (res.ok) {
                  toast({
                    title: "✅ Três Pontinhos Enviado",
                    description: "Sinal de espera enviado com sucesso",
                  });
                } else {
                  throw new Error("Erro ao enviar");
                }
              } catch (error) {
                toast({
                  title: "❌ Erro",
                  description: "Não foi possível enviar os três pontinhos",
                  variant: "destructive",
                });
              }
            }}
            className="w-full py-4 rounded font-sans font-bold transition-all hover:opacity-80"
            style={{
              backgroundColor: '#00bfff',
              color: '#000000',
              fontSize: '1.25rem',
              border: 'none',
            }}
            data-testid="button-enviar-pontinhos"
          >
            ENVIAR ⁙
          </button>
        </div>
      </div>
    </div>
  );
}
