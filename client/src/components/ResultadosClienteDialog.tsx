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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md mx-4 bg-black border rounded-lg" style={{ borderColor: '#333333', borderWidth: '1px' }}>
        <DialogHeader>
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
              className="bg-gray-800 border-gray-700 text-white focus:ring-0 focus:border-gray-700"
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
              className="bg-gray-800 border-gray-700 text-white focus:ring-0 focus:border-gray-700"
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
