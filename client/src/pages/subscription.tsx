
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Check } from 'lucide-react';
import { useProtection } from '@/hooks/use-protection';

export default function Subscription() {
  useProtection();

  const handlePurchase = () => {
    // TODO: Implementar integração de pagamento
    alert('Funcionalidade de pagamento será implementada em breve!');
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-black border relative z-10" style={{ borderColor: '#333333' }}>
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
          <CardTitle className="text-3xl text-center text-white" data-testid="text-subscription-title">
            Plano de Assinatura
          </CardTitle>
          <CardDescription className="text-gray-400 text-center" data-testid="text-subscription-subtitle">
            Acesso completo ao Robô Cyber Hacker
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Preço */}
          <div className="text-center py-6 border-2 rounded-lg" style={{ borderColor: '#ff0000' }}>
            <div className="text-5xl font-bold text-white mb-2">
              450<span className="text-2xl">MT</span>
            </div>
            <div className="text-gray-400">por 1 dia de acesso</div>
          </div>

          {/* Benefícios */}
          <div className="space-y-3 py-4">
            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-red-700 mt-0.5 flex-shrink-0" />
              <p className="text-white">
                Acesso completo ao sistema por <span className="font-bold text-red-700">24 horas</span>
              </p>
            </div>
            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-red-700 mt-0.5 flex-shrink-0" />
              <p className="text-white">
                Sinais em tempo real com <span className="font-bold text-red-700">100% de acerto</span>
              </p>
            </div>
            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-red-700 mt-0.5 flex-shrink-0" />
              <p className="text-white">
                Suporte <span className="font-bold text-red-700">24/7</span>
              </p>
            </div>
            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-red-700 mt-0.5 flex-shrink-0" />
              <p className="text-white">
                Análise de padrões avançada com <span className="font-bold text-red-700">IA</span>
              </p>
            </div>
          </div>

          {/* Informação adicional */}
          <div className="bg-gray-900 p-4 rounded-lg border" style={{ borderColor: '#333333' }}>
            <p className="text-sm text-gray-300 text-center">
              Após o pagamento, você terá acesso imediato ao sistema. 
              O período de 24 horas começa a contar a partir do momento da confirmação do pagamento.
            </p>
          </div>

          {/* Botão de Compra */}
          <Button 
            onClick={handlePurchase}
            className="w-full text-lg py-6 font-bold"
            style={{ 
              backgroundColor: '#ff0000',
              color: 'white'
            }}
            data-testid="button-purchase"
          >
            Comprar Agora
          </Button>

          {/* Link para voltar */}
          <p className="text-sm text-gray-400 text-center" data-testid="text-back-link">
            <Link href="/" className="text-red-700 hover:text-red-600 underline font-semibold">
              Voltar para a página inicial
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
