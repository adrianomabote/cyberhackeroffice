import { useState } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Share2 } from 'lucide-react';

export default function BotGratuito() {
  const [compartilhamentos, setCompartilhamentos] = useState(0);
  const compartilhamentosNecessarios = 15;
  const gruposNecessarios = 5;

  const handleCompartilhar = async () => {
    const texto = encodeURIComponent(
      '🤖 *ROBÔ CYBER HACKER - AVIATOR*\n\n' +
      '✅ Análise com IA avançada\n' +
      '✅ 100% de precisão nos sinais\n' +
      '✅ Mais de 10.000 moçambicanos faturando!\n\n' +
      'Junte-se agora: ' + window.location.origin
    );

    const urlWhatsApp = `https://wa.me/?text=${texto}`;

    window.open(urlWhatsApp, '_blank');

    // Registrar compartilhamento
    setCompartilhamentos(prev => prev + 1);
  };

  const progressoPercentual = Math.min((compartilhamentos / compartilhamentosNecessarios) * 100, 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-cyan-500/5"></div>

      <Card className="w-full max-w-md bg-gradient-to-br from-gray-900 to-gray-950 border-2 border-green-600 relative z-10">
        <CardHeader>
          <div className="flex items-center gap-3 mb-4">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5 text-gray-400" />
              </Button>
            </Link>
            <CardTitle className="text-2xl text-white">
              🎁 Obter Bot Gratuito
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <h3 className="text-xl font-bold text-green-400 mb-2">
              Como Conseguir o Bot Gratuito?
            </h3>
            <p className="text-gray-300 mb-4">
              Compartilhe este bot com:
            </p>
            <div className="space-y-2 text-left bg-gray-800/50 p-4 rounded-lg">
              <p className="text-white">✅ <strong>15 pessoas</strong> no WhatsApp</p>
              <p className="text-white">OU</p>
              <p className="text-white">✅ <strong>5 grupos</strong> no WhatsApp</p>
            </div>
          </div>

          {/* Barra de Progresso */}
          <div>
            <p className="text-sm text-gray-400 mb-2">
              Progresso: {compartilhamentos}/{compartilhamentosNecessarios} compartilhamentos
            </p>
            <div className="w-full bg-gray-700 rounded-full h-6 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-green-400 to-green-600 h-full flex items-center justify-center text-xs font-bold text-white transition-all duration-500"
                style={{ width: `${progressoPercentual}%` }}
              >
                {Math.round(progressoPercentual)}%
              </div>
            </div>
          </div>

          {compartilhamentos < compartilhamentosNecessarios ? (
            <Button
              onClick={handleCompartilhar}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-6 text-lg flex items-center justify-center gap-2"
            >
              <Share2 className="w-5 h-5" />
              Compartilhar no WhatsApp
            </Button>
          ) : (
            <div className="text-center space-y-4">
              <p className="text-green-400 font-bold text-xl">
                ✅ Parabéns! Bot Gratuito Liberado!
              </p>
              <a
                href="https://bot-aviator-cashout.onrender.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-bold py-6 text-lg">
                  🤖 Usar Meu Bot Gratuito
                </Button>
              </a>
            </div>
          )}

          <div className="text-center">
            <Link href="/signup">
              <Button variant="outline" className="text-white border-white/20">
                Ou criar conta premium
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}