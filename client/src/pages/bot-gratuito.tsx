import { useState } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Share2, Gift, Users, MessageCircle, CheckCircle2 } from 'lucide-react';

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
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-emerald-500/5"></div>

      <Card className="w-full max-w-lg bg-gradient-to-br from-gray-900 to-black border-2 border-green-600 shadow-2xl shadow-green-600/20 relative z-10">
        <CardHeader className="space-y-2">
          <div className="flex items-center mb-2">
            <Link href="/">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                data-testid="button-back"
              >
                <ArrowLeft className="w-4 h-4 text-gray-400" />
              </Button>
            </Link>
          </div>
          <div className="flex items-center gap-3 justify-center">
            <Gift className="w-7 h-7 text-green-500" />
            <CardTitle className="text-2xl text-white font-bold" data-testid="text-page-title">
              Acesso Gratuito ao Bot
            </CardTitle>
          </div>
          <CardDescription className="text-center text-gray-400 text-sm" data-testid="text-page-subtitle">
            Compartilhe e ganhe acesso ilimitado gratuitamente
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Benefícios do Bot Gratuito */}
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-5 rounded-xl border border-green-600/30">
            <h3 className="text-lg font-bold text-green-400 mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              O que você ganha gratuitamente:
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-white text-sm">
                  Sinais em tempo real com <span className="font-bold text-green-400">análise por IA</span>
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-white text-sm">
                  Recomendações de entrada e saída <span className="font-bold text-green-400">automáticas</span>
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-white text-sm">
                  Acesso <span className="font-bold text-green-400">ilimitado</span> sem custo mensal
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-white text-sm">
                  Mesma tecnologia usada por <span className="font-bold text-green-400">milhares de usuários</span>
                </p>
              </div>
            </div>
          </div>

          {/* Requisitos */}
          <div>
            <h3 className="text-base font-semibold text-white mb-4 text-center">
              Como desbloquear o acesso gratuito?
            </h3>
            <p className="text-gray-400 text-sm text-center mb-4">
              Compartilhe o CyberHacker com sua rede e ajude mais pessoas a lucrar:
            </p>
            
            <div className="grid grid-cols-1 gap-3">
              <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700 hover:border-green-600/50 transition-colors">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <div>
                    <p className="text-white font-semibold text-sm">15 contatos no WhatsApp</p>
                    <p className="text-gray-400 text-xs mt-0.5">Compartilhe com amigos e familiares</p>
                  </div>
                </div>
              </div>
              
              <div className="text-center text-gray-500 text-sm font-bold">OU</div>
              
              <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700 hover:border-green-600/50 transition-colors">
                <div className="flex items-center gap-3">
                  <MessageCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <div>
                    <p className="text-white font-semibold text-sm">5 grupos no WhatsApp</p>
                    <p className="text-gray-400 text-xs mt-0.5">Compartilhe em grupos relevantes</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Barra de Progresso */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm text-gray-400">
                Seu progresso
              </p>
              <p className="text-sm font-bold text-green-400">
                {compartilhamentos}/{compartilhamentosNecessarios}
              </p>
            </div>
            <div className="w-full bg-gray-700/50 rounded-full h-3 overflow-hidden border border-gray-600">
              <div 
                className="bg-gradient-to-r from-green-500 to-emerald-500 h-full flex items-center justify-end pr-2 transition-all duration-500"
                style={{ width: `${progressoPercentual}%` }}
              >
                {progressoPercentual > 15 && (
                  <span className="text-[10px] font-bold text-white">
                    {Math.round(progressoPercentual)}%
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Botão de Ação */}
          {compartilhamentos < compartilhamentosNecessarios ? (
            <Button
              onClick={handleCompartilhar}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-6 text-base shadow-lg shadow-green-600/30 transition-all hover:shadow-green-600/50"
              data-testid="button-share"
            >
              <Share2 className="w-5 h-5 mr-2" />
              Compartilhar no WhatsApp
            </Button>
          ) : (
            <div className="text-center space-y-4">
              <div className="bg-green-900/30 border-2 border-green-500 rounded-lg p-4">
                <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-2" />
                <p className="text-green-400 font-bold text-lg">
                  Parabéns! Acesso Liberado!
                </p>
                <p className="text-gray-300 text-sm mt-1">
                  Você desbloqueou o bot gratuito
                </p>
              </div>
              <a
                href="https://bot-aviator-cashout.onrender.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button 
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-6 text-base shadow-lg shadow-green-500/40"
                  data-testid="button-access-bot"
                >
                  Acessar Meu Bot Gratuito
                </Button>
              </a>
            </div>
          )}

          {/* Divisor */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-gradient-to-br from-gray-900 to-black px-3 text-gray-500">ou</span>
            </div>
          </div>

          {/* Link Premium */}
          <div className="text-center">
            <p className="text-gray-400 text-xs mb-3">
              Prefere acesso imediato sem compartilhar?
            </p>
            <Link href="/signup">
              <Button 
                variant="outline" 
                className="w-full text-white border-gray-600 hover:border-green-600 hover:bg-green-600/10"
                data-testid="button-premium"
              >
                Criar Conta Premium
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
