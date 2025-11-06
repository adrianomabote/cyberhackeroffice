import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { TrendingUp, Shield, Zap, Target, CheckCircle, PlayCircle, Brain, BarChart3, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { useProtection } from '@/hooks/use-protection';
import { useState } from 'react';
import robotImage from '@assets/file_00000000de3471fbba06676b1bf33e8f_1762368543414.png';

export default function Landing() {
  useProtection();

  const scrollToVideos = () => {
    const videosSection = document.getElementById('videos-section');
    if (videosSection) {
      videosSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black backdrop-blur border-b border-white/20">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={robotImage}
              alt="Robô CyberHacker"
              className="w-10 h-10 rounded-lg object-cover"
              data-testid="img-robot"
            />
            <h1
              className="text-base font-bold text-white"
              data-testid="text-logo"
            >
              CyberHacker
            </h1>
          </div>
          <div className="flex gap-3 ml-auto flex-shrink-0" style={{ marginLeft: '3rem' }}>
            <Link href="/login" className="flex-shrink-0">
              <Button
                className="bg-white text-black hover:bg-gray-200 font-semibold whitespace-nowrap"
                data-testid="button-login"
              >
                Entrar
              </Button>
            </Link>
            <Link href="/signup" className="flex-shrink-0">
              <Button
                className="bg-red-800 text-white hover:bg-red-900 font-semibold whitespace-nowrap"
                data-testid="button-signup"
              >
                Registre-se
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-10 px-4 overflow-hidden">
        <div className="container mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full bg-red-900/30 border-2 border-red-800">
            <Brain className="w-4 h-4 text-red-700" />
            <span className="text-red-700 text-sm font-semibold" data-testid="text-hero-badge">
              Inteligência Artificial Avançada
            </span>
          </div>
          <h2
            className="text-5xl md:text-7xl font-bold mb-6 text-white"
            data-testid="text-hero-title"
          >
            Domine o Aviator
          </h2>
          <p className="text-xl md:text-2xl text-white mb-8 max-w-3xl mx-auto" data-testid="text-hero-subtitle">
            O robô mostra onde o Aviator vai cair com <span className="font-semibold text-red-700">100% de acerto</span> usando IA avançada em tempo real
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/signup">
              <Button
                size="lg"
                className="bg-red-800 text-white text-lg px-8 py-3 font-bold hover:bg-red-900 h-auto min-h-0"
                data-testid="button-start"
              >
                Começar Agora
              </Button>
            </Link>
            <Button
              size="lg"
              variant="ghost"
              className="bg-gray-700 text-white text-lg px-8 py-3 hover:bg-gray-800 border-0 h-auto min-h-0"
              data-testid="button-demo"
              onClick={scrollToVideos}
            >
              Ver como funciona
            </Button>
          </div>
        </div>
      </section>

      {/* Separador */}
      <div className="container mx-auto px-4 py-2">
        <div className="h-px bg-gradient-to-r from-transparent via-gray-500/50 to-transparent"></div>
      </div>

      {/* O que é */}
      <section className="py-4 px-4">
        <div className="container mx-auto">
          <h3
            className="text-4xl font-bold text-center mb-12 text-white"
            data-testid="text-about-title"
          >
            O Que É o Robô Cyber Hacker?
          </h3>
          <div className="max-w-4xl mx-auto">
            <Card className="bg-gradient-to-br from-gray-900 to-gray-950 border-2 border-red-800">
              <CardContent className="p-8">
                <p className="text-lg text-gray-300 leading-relaxed mb-4" data-testid="text-about-description">
                  O <span className="text-red-700 font-bold">Robô Cyber Hacker</span> é um sistema revolucionário de análise preditiva
                  desenvolvido especificamente para o jogo <span className="text-red-700 font-bold">Aviator</span>.
                  Utilizando algoritmos de <span className="text-red-700 font-semibold">machine learning</span> e análise de padrões em tempo real,
                  nosso robô identifica as melhores oportunidades de entrada e os momentos ideais para sacar seus ganhos.
                </p>
                <p className="text-lg text-gray-300 leading-relaxed" data-testid="text-about-features">
                  Ele analisa o Aviator em tempo real e mostra onde o Aviator vai cair com
                  <span className="text-red-700 font-semibold"> 100% de acerto</span>.
                  Com uma interface intuitiva e atualização a cada segundo, você recebe sinais precisos sobre
                  <span className="text-red-700 font-semibold"> QUANDO entrar</span> e
                  <span className="text-red-700 font-semibold"> ONDE sacar</span>.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Separador */}
      <div className="container mx-auto px-4 py-4">
        <div className="h-px bg-gradient-to-r from-transparent via-gray-500/50 to-transparent"></div>
      </div>

      {/* Por que escolher o Robô Cyber Hacker */}
      <section className="py-6 px-4 bg-gradient-to-b from-transparent via-red-900/10 to-transparent">
        <div className="container mx-auto">
          <h3
            className="text-3xl font-bold text-center mb-8 text-white"
            data-testid="text-why-title"
          >
            Por que escolher o Robô Cyber Hacker?
          </h3>
          <div className="max-w-4xl mx-auto">
            <Card className="bg-black border-2 border-red-800">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-red-700 mt-1 flex-shrink-0" />
                    <p className="text-base text-white">
                      <span className="font-bold text-red-700">Mais de 10.000 moçambicanos</span> já estão faturando todos os dias usando o Robô Cyber Hacker
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-red-700 mt-1 flex-shrink-0" />
                    <p className="text-base text-white">
                      Sistema de <span className="font-bold text-red-700">Inteligência Artificial</span> que analisa o Aviator em tempo real
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-red-700 mt-1 flex-shrink-0" />
                    <p className="text-base text-white">
                      <span className="font-bold text-red-700">100% de acerto</span> - o robô mostra exatamente onde o Aviator vai cair
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-red-700 mt-1 flex-shrink-0" />
                    <p className="text-base text-white">
                      Suporte <span className="font-bold text-red-700">24/24</span> para todos os usuários
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Separador */}
      <div className="container mx-auto px-4 py-4">
        <div className="h-px bg-gradient-to-r from-transparent via-gray-500/50 to-transparent"></div>
      </div>

      {/* Perguntas Frequentes */}
      <section className="py-6 px-4">
        <div className="container mx-auto max-w-4xl">
          <h3
            className="text-4xl font-bold text-center mb-12 text-white"
            data-testid="text-faq-title"
          >
            Perguntas Mais Frequentes
          </h3>
          <Accordion type="single" collapsible className="space-y-4">
            <AccordionItem value="item-1" className="bg-black border-2 border-red-800 rounded-lg px-4">
              <AccordionTrigger className="text-base text-white hover:text-red-700 hover:no-underline py-3">
                Como funciona o robô?
              </AccordionTrigger>
              <AccordionContent className="text-gray-300 text-lg">
                O Robô Cyber Hacker usa um sistema de Inteligência Artificial avançado que analisa o Aviator em tempo real.
                Nosso algoritmo processa milhares de dados por segundo para identificar padrões e prever com precisão onde o multiplicador vai cair,
                garantindo que você receba sinais precisos no momento certo.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2" className="bg-black border-2 border-red-800 rounded-lg px-4">
              <AccordionTrigger className="text-base text-white hover:text-red-700 hover:no-underline py-3">
                O Robô é confiável?
              </AccordionTrigger>
              <AccordionContent className="text-gray-300 text-lg">
                Sim! O robô mostra onde o Aviator vai cair com <span className="font-bold text-red-700">100% de acerto</span>,
                garantindo que você sai lucrando. Mais de 10.000 moçambicanos já confiam no nosso sistema e faturam todos os dias.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3" className="bg-black border-2 border-red-800 rounded-lg px-4">
              <AccordionTrigger className="text-base text-white hover:text-red-700 hover:no-underline py-3">
                Quanto custa o acesso ao robô?
              </AccordionTrigger>
              <AccordionContent className="text-gray-300 text-lg">
                O acesso ao Robô Cyber Hacker custa <span className="font-bold text-red-700">450MT por 1 dia</span>.
                Ou seja, se você pagar agora, terá acesso completo até amanhã na mesma hora que pagou.
                É um investimento que se paga rapidamente com os lucros que você vai obter!
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4" className="bg-black border-2 border-red-800 rounded-lg px-4">
              <AccordionTrigger className="text-base text-white hover:text-red-700 hover:no-underline py-3">
                O sistema é compatível com qual casa de apostas?
              </AccordionTrigger>
              <AccordionContent className="text-gray-300 text-base">
                <p className="mb-4">
                  O sistema é compatível com uma casa de apostas. Para ter conta nessa casa de apostas,
                  basta clicar no botão abaixo:
                </p>
                <a
                  href="https://tracking.olabet.co.mz/C.ashx?btag=a_314b_7c_&affid=309&siteid=314&adid=7&c="
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button className="bg-red-800 text-white hover:bg-red-900 font-semibold">
                    Acessar a Plataforma
                  </Button>
                </a>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Separador */}
      <div className="container mx-auto px-4 py-4">
        <div className="h-px bg-gradient-to-r from-transparent via-gray-500/50 to-transparent"></div>
      </div>

      {/* Vídeos */}
      <section id="videos-section" className="py-6 px-4 bg-gray-900/50">
        <div className="container mx-auto">
          <h3
            className="text-4xl font-bold text-center mb-12 text-white"
            data-testid="text-videos-title"
          >
            Veja o Sistema em Ação
          </h3>
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <Card className="bg-gradient-to-br from-gray-900 to-gray-950 border-transparent" data-testid="card-video-1">
              <CardHeader>
                <CardTitle className="text-red-700">Veja como o sistema funciona</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <div className="rounded-lg overflow-hidden border border-gray-800/30">
                  <video
                    controls
                    className="block"
                    style={{ maxHeight: '600px', width: 'auto', height: 'auto', display: 'block' }}
                  >
                    <source src="/VídeoDeComoFunciona_1762400296019.mp4" type="video/mp4" />
                    Seu navegador não suporta vídeos.
                  </video>
                </div>
                <p className="text-gray-400 mt-4 text-center" data-testid="text-video-1-desc">
                  Veja como o robô analisa o Aviator em tempo real e mostra onde vai cair
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-gray-900 to-gray-950 border-red-800 border-2" data-testid="card-video-2">
              <CardHeader>
                <CardTitle className="text-white">Como Entrar no Sistema</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-gradient-to-br from-red-900/20 to-gray-900 rounded-lg flex items-center justify-center border border-red-800">
                  <PlayCircle className="w-20 h-20 text-red-700" />
                </div>
                <p className="text-gray-400 mt-4" data-testid="text-video-2-desc">
                  Tutorial passo a passo de como criar sua conta e começar a usar
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Separador */}
      <div className="container mx-auto px-4 py-4">
        <div className="h-px bg-gradient-to-r from-transparent via-gray-500/50 to-transparent"></div>
      </div>

      {/* CTA Final */}
      <section className="py-12 px-4 bg-gradient-to-b from-transparent via-red-900/10 to-transparent">
        <div className="container mx-auto text-center">
          <h3
            className="text-5xl font-bold mb-6 text-red-700"
            data-testid="text-cta-title"
          >
            Pronto Para Começar?
          </h3>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto" data-testid="text-cta-subtitle">
            Junte-se a centenas de jogadores que já estão maximizando seus ganhos no Aviator com IA
          </p>
          <Link href="/signup">
            <Button
              size="default"
              className="bg-red-800 text-white text-base px-6 py-2 font-bold hover:bg-red-900"
              data-testid="button-cta-signup"
            >
              Começar Agora
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t-2 border-red-800 bg-black">
        <div className="container mx-auto">
          <div className="text-center mb-6">
            <a
              href="https://chat.whatsapp.com/GoJBrv28CRjEmPsdX5n8ey?mode=wwt"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block"
            >
              <button className="bg-green-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-green-700 transition-colors animate-heartbeat flex items-center gap-2 mx-auto text-base">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                Entrar no grupo oficial
              </button>
            </a>
          </div>
          <p className="text-center text-white text-sm" data-testid="text-footer">
            © 2025 Robô Cyber Hacker - Todos os direitos reservados
          </p>
        </div>
      </footer>
    </div>
  );
}