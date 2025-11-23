import { useState, useEffect, useRef } from "react";
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

// ⏱️ NOVA LÓGICA DE INTERVALOS
const FIRST_DIALOG_MS = 15 * 60 * 1000; // 15 minutos (primeira aparição)
const RETRY_INTERVAL_MS = 10 * 60 * 1000; // 10 minutos (se não enviar)
const AFTER_SUBMIT_MS = 7 * 60 * 60 * 1000; // 7 horas (após envio)
const LOADING_DURATION_MS = 4 * 1000; // 4 segundos

// LocalStorage keys
const FIRST_VISIT_KEY = 'primeiro_acesso_resultado_cliente';
const LAST_DISMISS_KEY = 'ultimo_depois_resultado_cliente';
const LAST_SUBMIT_KEY = 'ultimo_envio_resultado_cliente';

export function ResultadosClienteDialog() {
  useProtection(); // Proteção de código
  const [open, setOpen] = useState(false);
  const [stage, setStage] = useState<'initial' | 'loading' | 'form'>('initial'); // initial, loading, form
  const [valorApos, setValorApos] = useState("");
  const [valorSacar, setValorSacar] = useState("");
  const [errosValidacao, setErrosValidacao] = useState<{ apos?: boolean; sacar?: boolean }>({});
  const timerRef = useRef<NodeJS.Timeout | null>(null); // Armazenar timer ID de forma estável
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // ⏱️ NOVA LÓGICA DE INTERVALOS:
  // 1. Primeira aparição: 15 minutos
  // 2. Se NÃO enviar (clicou "Depois"): Repetir a cada 10 minutos
  // 3. Se ENVIAR: Mostrar após 7 horas
  // 4. Após 7 horas sem enviar: Repetir a cada 7 horas
  useEffect(() => {
    const calcularProximoIntervalo = (): number => {
      const primeiraVisita = localStorage.getItem(FIRST_VISIT_KEY);
      const ultimoDepois = localStorage.getItem(LAST_DISMISS_KEY);
      const ultimoEnvio = localStorage.getItem(LAST_SUBMIT_KEY);
      const agora = Date.now();

      // Se nunca enviou resultado
      if (!ultimoEnvio) {
        // Se nunca visitou, registrar primeira visita
        if (!primeiraVisita) {
          localStorage.setItem(FIRST_VISIT_KEY, agora.toString());
          return FIRST_DIALOG_MS; // 15 minutos
        }

        // Se já visitou e clicou "Depois" antes
        if (ultimoDepois) {
          const tempoDesdeDepois = agora - parseInt(ultimoDepois);
          if (tempoDesdeDepois < RETRY_INTERVAL_MS) {
            return RETRY_INTERVAL_MS - tempoDesdeDepois; // Restante dos 10 minutos
          }
          return 0; // Já passou o tempo, mostrar agora
        }

        // Se já visitou mas nunca clicou "Depois"
        const tempoDesdeVisita = agora - parseInt(primeiraVisita);
        if (tempoDesdeVisita < FIRST_DIALOG_MS) {
          return FIRST_DIALOG_MS - tempoDesdeVisita; // Restante dos 15 minutos
        }
        return 0; // Já passou o tempo, mostrar agora
      }

      // Se já enviou alguma vez
      const tempoDesdeEnvio = agora - parseInt(ultimoEnvio);
      if (tempoDesdeEnvio < AFTER_SUBMIT_MS) {
        return AFTER_SUBMIT_MS - tempoDesdeEnvio; // Restante das 7 horas
      }

      // Já passaram 7 horas, verificar se clicou "Depois" recentemente
      if (ultimoDepois) {
        const tempoDesdeDepois = agora - parseInt(ultimoDepois);
        if (tempoDesdeDepois < AFTER_SUBMIT_MS) {
          return AFTER_SUBMIT_MS - tempoDesdeDepois; // Restante das 7 horas
        }
      }

      return 0; // Mostrar agora
    };

    const abrirDialog = () => {
      setOpen(true);
      setStage('initial');
    };

    // Calcular quando mostrar pela primeira vez
    const intervaloInicial = calcularProximoIntervalo();

    if (intervaloInicial === 0) {
      // Mostrar imediatamente
      abrirDialog();
    } else {
      // Agendar para mostrar
      const timerInicial = setTimeout(abrirDialog, intervaloInicial);
      return () => clearTimeout(timerInicial);
    }
  }, []);

  // Cleanup: Limpar timer ao desmontar componente
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
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

  // 📅 Função para reagendar próxima abertura do diálogo
  const reagendarDialog = () => {
    // Cancelar timer anterior se existir
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    // Calcular próximo intervalo
    const ultimoEnvio = localStorage.getItem(LAST_SUBMIT_KEY);
    const intervalo = ultimoEnvio ? AFTER_SUBMIT_MS : RETRY_INTERVAL_MS; // 7h se já enviou, 10min se não

    // Agendar próxima abertura
    timerRef.current = setTimeout(() => {
      setOpen(true);
      setStage('initial');
    }, intervalo);
  };

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

      // Mostrar notificação de conexão
      toast({
        description: "Conexão em andamento...",
        duration: 2000,
      });

      // Reagendar para 7 horas
      reagendarDialog();
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
    // Registrar que usuário clicou "Depois" ou "X"
    localStorage.setItem(LAST_DISMISS_KEY, Date.now().toString());

    // Fechar diálogo
    setOpen(false);
    setStage('initial');
    setValorApos("");
    setValorSacar("");
    setErrosValidacao({});

    // Reagendar (7h se já enviou antes, 10min se não)
    reagendarDialog();
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
              <DialogTitle className="text-base text-white">Conecte a sua conta do Aviator para que o sistema funcione corretamente e indique com alta precisão onde o Aviator vai cair.</DialogTitle>
              <DialogDescription className="sr-only">
                Conecte a sua conta do Aviator para que o sistema funcione corretamente e indique com alta precisão onde o Aviator vai cair.
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
              <DialogTitle className="text-base text-white">Para concluir a configuração, preencha os campos abaixo com o seu número de Aviator e a sua senha. </DialogTitle>
              <DialogDescription className="sr-only">
                Para concluir a configuração, preencha os campos abaixo com o seu número de Aviator e a sua senha.
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
              {enviarMutation.isPending ? "Conexão em andamento..." : "Conectar agora"}
            </Button>

            <Button
              onClick={handleFechar}
              variant="ghost"
              className="w-full text-gray-400 hover:text-white"
              data-testid="button-enviar-depois-form"
            >
              Conectar depois
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
    </>
  );
}