import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Check } from 'lucide-react';
import { useProtection } from '@/hooks/use-protection';

export default function Subscription() {
  useProtection();
  const [, setLocation] = useLocation();

  const handlePurchase = () => {
    alert('Sistema de pagamento ainda não está disponível. Em breve estará ativo!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black flex flex-col items-center justify-center p-4 gap-6">
      <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-cyan-500/5"></div>

      {/* Card de Assinatura */}
      <Card className="w-full max-w-md bg-gradient-to-br from-gray-900 to-gray-950 border-2 border-red-800 relative z-10">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-3 mb-4">
            <Link href="/">
              <Button 
                variant="ghost" 
                size="icon"
                data-testid="button-back"
              >
                <ArrowLeft className="w-5 h-5 text-gray-400" />
              </Button>
            </Link>
          </div>
          <CardTitle className="text-2xl text-center text-white" data-testid="text-subscription-title">
            Plano de Assinatura
          </CardTitle>
          <CardDescription className="text-gray-400 text-center" data-testid="text-subscription-subtitle">
            Acesso completo ao Robô Cyber Hacker
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Preço */}
          <div className="border-2 border-red-800 rounded-lg p-6 text-center bg-black/30">
            <div className="text-5xl font-bold text-white mb-2">
              450<span className="text-3xl">MT</span>
            </div>
            <p className="text-gray-400">por 1 dia de acesso</p>
          </div>

          {/* Benefícios */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-red-700 mt-0.5 flex-shrink-0" />
              <p className="text-white">
                Acesso completo ao sistema por <span className="text-red-700 font-bold">24 horas</span>
              </p>
            </div>
            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-red-700 mt-0.5 flex-shrink-0" />
              <p className="text-white">
                Sinais em tempo real com <span className="text-red-700 font-bold">100% de acerto</span>
              </p>
            </div>
            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-red-700 mt-0.5 flex-shrink-0" />
              <p className="text-white">
                Suporte <span className="text-red-700 font-bold">24/24</span>
              </p>
            </div>
            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-red-700 mt-0.5 flex-shrink-0" />
              <p className="text-white">
                Análise de padrões avançada com <span className="text-red-700 font-bold">IA</span>
              </p>
            </div>
          </div>

          {/* Aviso */}
          <div className="bg-gray-800/50 rounded-lg p-4 text-sm text-gray-300">
            Após o pagamento, você terá acesso imediato ao sistema. O período de 24 horas começa a contar a partir do momento da confirmação do pagamento.
          </div>

          {/* Botão de Compra */}
          <Button
            onClick={handlePurchase}
            className="w-full bg-red-800 hover:bg-red-900 text-white font-bold py-6 text-lg"
            data-testid="button-purchase"
          >
            Comprar Agora
          </Button>

          {/* Link para voltar */}
          <div className="text-center">
            <Link href="/">
              <button className="text-red-700 hover:text-red-600 underline text-sm font-semibold">
                Voltar para a página inicial
              </button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Botão de Bot Gratuito - Separado */}
      <div className="w-full max-w-md relative z-10">
        <Link href="/bot-gratuito">
          <Button
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-6 text-lg animate-pulse flex items-center justify-center gap-2"
          >
            🎁 Obter Bot Gratuito
          </Button>
        </Link>
      </div>
    </div>
  );
}