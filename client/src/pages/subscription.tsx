
import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Check } from 'lucide-react';
import { useProtection } from '@/hooks/use-protection';

export default function Subscription() {
  useProtection();
  const [, setLocation] = useLocation();

  const handlePurchase = () => {
    alert('Funcionalidade de pagamento será implementada em breve!');
    setLocation('/app');
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
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
            Acesso completo ao Robô Cyber Hacker
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 pt-0">
          {/* Preço */}
          <div className="border-2 border-red-800 rounded-lg p-4 text-center bg-black/30">
            <div className="text-3xl font-bold text-white mb-1">
              450<span className="text-lg">MT</span>
            </div>
            <div className="text-gray-400 text-xs">por 1 dia de acesso</div>
          </div>

          {/* Benefícios */}
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <Check className="w-4 h-4 text-red-700 mt-0.5 flex-shrink-0" />
              <p className="text-white text-xs">
                Acesso completo ao sistema por <span className="font-bold text-red-700">24 horas</span>
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
              Após o pagamento, você terá acesso imediato ao sistema. 
              O período de 24 horas começa a contar a partir do momento da confirmação do pagamento.
            </p>
          </div>

          {/* Botão de Compra */}
          <Button 
            onClick={handlePurchase}
            className="w-full text-sm py-5 font-bold bg-red-600 hover:bg-red-700 text-white"
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
    </div>
  );
}
