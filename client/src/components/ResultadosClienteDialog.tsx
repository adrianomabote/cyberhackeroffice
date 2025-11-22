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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

// Estilo para remover o focus ring
const inputStyle = `
  .resultado-input:focus {
    outline: none !important;
    ring: 0 !important;
    box-shadow: none !important;
  }
`;

const DIALOG_INTERVAL_MS = 2 * 60 * 1000; // 2 minutos

export function ResultadosClienteDialog() {
  const [open, setOpen] = useState(false);
  const [valorApos, setValorApos] = useState("");
  const [valorSacar, setValorSacar] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Abrir diálogo a cada 2 minutos (independente da interação do usuário)
  useEffect(() => {
    const timer = setInterval(() => {
      setOpen(true);
    }, DIALOG_INTERVAL_MS);

    return () => clearInterval(timer);
  }, []);

  const enviarMutation = useMutation({
    mutationFn: async (data: { apos: number; sacar: string }) => {
      const res = await apiRequest("POST", "/api/resultados-clientes", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/resultados-clientes/lista"] });
      toast({
        title: "✅ Enviado com sucesso!",
        description: "Seu resultado foi registrado e enviado para o suporte.",
        variant: "default",
      });
      setOpen(false);
      setValorApos("");
      setValorSacar("");
    },
    onError: () => {
      toast({
        title: "❌ Erro",
        description: "Não foi possível enviar o resultado. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const enviarResultado = () => {
    // Validar campos
    const apos = parseFloat(valorApos);

    if (isNaN(apos) || apos <= 0) {
      toast({
        title: "⚠️ Valor inválido",
        description: "Digite um valor válido para APOS",
        variant: "destructive",
      });
      return;
    }

    if (!valorSacar.trim()) {
      toast({
        title: "⚠️ Campo vazio",
        description: "Digite um valor para SACAR",
        variant: "destructive",
      });
      return;
    }

    enviarMutation.mutate({ apos, sacar: valorSacar });
  };

  return (
    <>
      <style>{inputStyle}</style>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm mx-auto bg-black border rounded-lg" style={{ borderColor: '#333333', borderWidth: '1px', position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
        <div className="flex items-start gap-2 mb-2">
          <button
            onClick={() => setOpen(false)}
            className="text-gray-300 hover:text-white hover:bg-gray-800 rounded p-1 transition-colors flex-shrink-0"
            data-testid="button-close-resultado"
            title="Fechar"
          >
            <span className="text-xl font-bold">✕</span>
          </button>
          <div className="text-yellow-600 text-sm text-center flex-1" style={{ color: '#FFD700' }}>
            ⚠️ Atenção caro apostador
          </div>
        </div>

        <DialogHeader className="pb-2">
          <DialogTitle className="text-base text-white">Nos diz: qual é a última entrada que pegou?</DialogTitle>
          <DialogDescription className="sr-only">
            Informe a última entrada vencedora
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Apos:</label>
            <Input
              type="number"
              step="0.01"
              placeholder="Ex: 2.50"
              value={valorApos}
              onChange={(e) => setValorApos(e.target.value)}
              data-testid="input-apos-resultado"
              disabled={enviarMutation.isPending}
              className="resultado-input bg-gray-800 border-gray-700 text-white"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Sacar:</label>
            <Input
              type="text"
              placeholder="Ex: 3.20 ou 3.20L"
              value={valorSacar}
              onChange={(e) => setValorSacar(e.target.value)}
              data-testid="input-sacar-resultado"
              disabled={enviarMutation.isPending}
              className="resultado-input bg-gray-800 border-gray-700 text-white"
            />
          </div>

          <Button
            onClick={enviarResultado}
            disabled={enviarMutation.isPending || !valorApos || !valorSacar}
            className="w-full"
            data-testid="button-enviar-resultado"
          >
            {enviarMutation.isPending ? "Enviando..." : "Enviar para o Suporte"}
          </Button>

          <Button
            onClick={() => setOpen(false)}
            variant="ghost"
            className="w-full text-gray-400 hover:text-white"
            data-testid="button-enviar-depois"
          >
            Enviar depois
          </Button>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}
