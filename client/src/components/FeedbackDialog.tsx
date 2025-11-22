import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Smile, Meh, FlaskConical, ThumbsDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const FEEDBACK_INTERVAL_MS = 2 * 60 * 1000; // 2 minutos

interface FeedbackOption {
  value: "excelente" | "bom" | "testando" | "precisa_melhorar";
  label: string;
  icon: typeof Smile;
  color: string;
}

const feedbackOptions: FeedbackOption[] = [
  {
    value: "excelente",
    label: "Excelente! 🎯",
    icon: Smile,
    color: "text-green-500 dark:text-green-400",
  },
  {
    value: "bom",
    label: "Bom 👍",
    icon: Smile,
    color: "text-cyan-500 dark:text-cyan-400",
  },
  {
    value: "testando",
    label: "Ainda estou testando 🔬",
    icon: FlaskConical,
    color: "text-purple-500 dark:text-purple-400",
  },
  {
    value: "precisa_melhorar",
    label: "Precisa melhorar 💭",
    icon: ThumbsDown,
    color: "text-orange-500 dark:text-orange-400",
  },
];

export function FeedbackDialog() {
  const [open, setOpen] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Mostrar diálogo após 2 minutos
    const timer = setTimeout(() => {
      setOpen(true);
    }, FEEDBACK_INTERVAL_MS);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Reabrir diálogo a cada 2 minutos após fechar
    if (!open) {
      const timer = setTimeout(() => {
        setOpen(true);
      }, FEEDBACK_INTERVAL_MS);

      return () => clearTimeout(timer);
    }
  }, [open]);

  const enviarFeedback = async (resposta: string) => {
    try {
      setEnviando(true);

      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resposta }),
      });

      if (!res.ok) {
        throw new Error("Falha ao enviar feedback");
      }

      toast({
        title: "✅ Feedback enviado!",
        description: "Obrigado por compartilhar sua experiência conosco.",
        variant: "default",
      });

      setOpen(false);
    } catch (error) {
      console.error("Erro ao enviar feedback:", error);
      toast({
        title: "❌ Erro",
        description: "Não foi possível enviar o feedback. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold">
            💬 Como foi sua experiência?
          </DialogTitle>
          <DialogDescription className="text-center">
            Queremos saber como está sendo sua experiência com nosso sistema de
            análise CYBER HACKER!
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 py-4">
          {feedbackOptions.map((option) => {
            const Icon = option.icon;
            return (
              <Button
                key={option.value}
                data-testid={`button-feedback-${option.value}`}
                variant="outline"
                size="lg"
                className="justify-start gap-3 h-auto py-3"
                onClick={() => enviarFeedback(option.value)}
                disabled={enviando}
              >
                <Icon className={`h-5 w-5 ${option.color}`} />
                <span className="flex-1 text-left">{option.label}</span>
              </Button>
            );
          })}
        </div>

        <div className="text-center text-sm text-muted-foreground">
          Seu feedback nos ajuda a melhorar! 🚀
        </div>
      </DialogContent>
    </Dialog>
  );
}
