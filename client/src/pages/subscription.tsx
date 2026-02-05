import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowLeft, Check } from 'lucide-react';
import { useProtection } from '@/hooks/use-protection';

export default function Subscription() {
  useProtection(); // Proteção de código
  const [, setLocation] = useLocation();
  const [showDialog, setShowDialog] = useState(false);

  const handlePurchase = () => {
    setShowDialog(true);
  };

  const handleProceed = () => {
    setShowDialog(false);
    window.open('https://wa.me/258869635446?text=Saudações!%20Quero%20fazer%20o%20pagamento', '_blank');
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 gap-6">
      <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-cyan-500/5"></div>

      <Card className="w-full max-w-sm bg-gradient-to-br from-gray-900 to-gray-950 border-2 border-red-800 relative z-10">
        <CardHeader className="space-y-1 pb-3">
          <div className="flex items-center mb-2">
            <Link href="/">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                data-testid="button-back"
              >
                <ArrowLeft className="w-4 h-4 text-gray-400" />
              </Button>
            </Link>
          </div>
          <CardTitle className="text-lg text-white font-bold text-center" data-testid="text-subscription-title">
            Plano de Assinatura
          </CardTitle>
          <CardDescription className="text-gray-400 text-xs text-center" data-testid="text-subscription-subtitle">
            Acesso Cyber Hacker Premium
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 pt-0">
          {/* Preço */}
          <div className="border-2 border-red-800 rounded-lg p-4 text-center bg-black/30">
            <div className="text-3xl font-bold text-white mb-1">
              450<span className="text-lg">MT</span>
            </div>
            <div className="text-gray-400 text-xs">por 2 dias de uso (48 horas)</div>
          </div>

          {/* Benefícios */}
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <Check className="w-4 h-4 text-red-700 mt-0.5 flex-shrink-0" />
              <p className="text-white text-xs">
                Acesso funcionando por <span className="font-bold text-red-700">48 horas (2 dias)</span>
              </p>
            </div>
            <div className="flex items-start gap-2">
              <Check className="w-4 h-4 text-red-700 mt-0.5 flex-shrink-0" />
              <p className="text-white text-xs">
                Sinais em tempo real com <span className="font-bold text-red-700">100% de acerto</span>
              </p>
            </div>
            <div className="flex items-start gap-2">
              <Check className="w-4 h-4 text-red-700 mt-0.5 flex-shrink-0" />
              <p className="text-white text-xs">
                Suporte <span className="font-bold text-red-700">24/24</span>
              </p>
            </div>
            <div className="flex items-start gap-2">
              <Check className="w-4 h-4 text-red-700 mt-0.5 flex-shrink-0" />
              <p className="text-white text-xs">
                Análise de padrões avançada com <span className="font-bold text-red-700">IA</span>
              </p>
            </div>
          </div>

          {/* Informação adicional */}
          <div className="bg-gray-900 p-3 rounded-lg border border-gray-700">
            <p className="text-[10px] text-gray-300 text-center leading-relaxed">
              Após o pagamento, você receberá o acesso imediatamente. 
              O período de 48 horas (2 dias) começa a contar a partir do momento da confirmação do pagamento.
            </p>
          </div>

          {/* Botão de Compra */}
          <Button 
            onClick={handlePurchase}
            className="w-full bg-red-800 hover:bg-red-900 text-white"
            size="default"
            data-testid="button-purchase"
          >
            Comprar Agora
          </Button>

          {/* Link para voltar */}
          <p className="text-xs text-center" data-testid="text-back-link">
            <Link href="/" className="text-red-700 hover:text-red-600 underline font-semibold">
              Voltar para a página inicial
            </Link>
          </p>
        </CardContent>
      </Card>

      {/* Botão Obter Acesso Gratuito - Fora do Card */}
      <Link href="/bot-gratuito" className="w-full max-w-sm relative z-10">
        <button className="w-full bg-green-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-green-700 transition-colors animate-heartbeat flex items-center justify-center gap-2">
          🎁 Obter Acesso Gratuito
        </button>
      </Link>

      {/* Diálogo de Confirmação */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="bg-gray-900 border-2 border-red-800 text-white max-w-[90%] sm:max-w-md rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-center mb-2">
              Redirecionamento para Pagamento
            </DialogTitle>
            <DialogDescription className="text-gray-300 text-sm leading-relaxed space-y-3">
              <p>
                Você será redirecionado para a tela do pagamento para efetuar o pagamento.
              </p>
              <p>
                Lá será <span className="font-bold text-white">obrigatório escrever o seu número do WhatsApp</span>.
              </p>
              <p>
                Após o pagamento, você receberá o teu acesso diretamente no teu WhatsApp em <span className="font-bold text-green-400">menos de 1 minutos</span>.
              </p>
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => setShowDialog(false)}
              className="flex-1 border-gray-600 text-white hover:bg-gray-800"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleProceed}
              className="flex-1 bg-red-800 hover:bg-red-900 text-white"
            >
              Prosseguir
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
