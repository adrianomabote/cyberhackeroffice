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
            className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent"
            data-testid="text-videos-title"
          >
            Veja o Sistema em Ação
          </h3>
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <Card className="bg-gradient-to-br from-gray-900 to-gray-950 border-emerald-500/30 hover-elevate" data-testid="card-video-1">
              <CardHeader>
                <CardTitle className="text-emerald-400">Como Usar o Sistema</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-gradient-to-br from-emerald-900/20 to-gray-900 rounded-lg flex items-center justify-center border border-emerald-500/30 hover:border-emerald-500/50 transition-colors">
                  <PlayCircle className="w-20 h-20 text-emerald-400" />
                </div>
                <p className="text-gray-400 mt-4" data-testid="text-video-1-desc">
                  Tutorial completo mostrando como configurar e usar o sistema passo a passo
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-gray-900 to-gray-950 border-cyan-500/30 hover-elevate" data-testid="card-video-2">
              <CardHeader>
                <CardTitle className="text-cyan-400">Resultados Reais</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-gradient-to-br from-cyan-900/20 to-gray-900 rounded-lg flex items-center justify-center border border-cyan-500/30 hover:border-cyan-500/50 transition-colors">
                  <PlayCircle className="w-20 h-20 text-cyan-400" />
                </div>
                <p className="text-gray-400 mt-4" data-testid="text-video-2-desc">
                  Demonstração ao vivo dos sinais do robô e resultados obtidos em sessões reais
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
              <button className="bg-green-600 text-white text-lg px-8 py-4 rounded-lg font-bold hover:bg-green-700 transition-all">
                📱 Entrar no Grupo Oficial do WhatsApp
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