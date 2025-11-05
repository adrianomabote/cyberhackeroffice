import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Shield, Zap, Target, CheckCircle, PlayCircle, Brain, BarChart3, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { useProtection } from '@/hooks/use-protection';
import { useState } from 'react';
import hackerImage from '@assets/IMG-20251105-WA0139_1762343129352.jpg';

export default function Landing() {
  useProtection();
  const [showGuide, setShowGuide] = useState(false);
  
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
              src={hackerImage}
              alt="Hacker" 
              className="w-8 h-8 rounded object-cover border border-cyan-500/30"
              data-testid="img-hacker"
            />
            <h1 
              className="text-base font-bold text-white"
              data-testid="text-logo"
            >
              CyberHacker
            </h1>
          </div>
          <div className="flex gap-3 ml-auto">
            <Link href="/login">
              <Button 
                className="bg-white text-black hover:bg-gray-200 font-semibold"
                data-testid="button-login"
              >
                Entrar
              </Button>
            </Link>
            <Link href="/signup">
              <Button 
                className="bg-red-600 text-white hover:bg-red-700 font-semibold"
                data-testid="button-signup"
              >
                Registre-se
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="container mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full bg-red-600/20 border-2 border-red-600">
            <Brain className="w-4 h-4 text-red-500" />
            <span className="text-red-500 text-sm font-semibold" data-testid="text-hero-badge">
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
            O robô mostra onde o Aviator vai cair com <span className="font-semibold text-red-500">100% de acerto</span> usando IA avançada em tempo real
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/signup">
              <Button 
                size="lg" 
                className="bg-red-600 text-white text-lg px-8 py-6 font-bold hover:bg-red-700"
                data-testid="button-start"
              >
                Começar Agora
              </Button>
            </Link>
            <Button 
              size="lg" 
              variant="outline"
              className="border-red-600 text-red-500 text-lg px-8 py-6 hover:bg-red-600 hover:text-white"
              data-testid="button-demo"
              onClick={scrollToVideos}
            >
              Ver Demonstração
            </Button>
          </div>
        </div>
      </section>

      {/* O que é */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h3 
            className="text-4xl font-bold text-center mb-12 text-red-500"
            style={{ textShadow: '0 0 20px #ff0000' }}
            data-testid="text-about-title"
          >
            O Que É o Robô Cyber Hacker?
          </h3>
          <div className="max-w-4xl mx-auto">
            <Card className="bg-gradient-to-br from-gray-900 to-gray-950 border-2 border-red-600">
              <CardContent className="p-8">
                <p className="text-lg text-gray-300 leading-relaxed mb-4" data-testid="text-about-description">
                  O <span className="text-red-500 font-bold">Robô Cyber Hacker</span> é um sistema revolucionário de análise preditiva 
                  desenvolvido especificamente para o jogo <span className="text-red-400 font-bold">Aviator</span>. 
                  Utilizando algoritmos de <span className="text-red-300 font-semibold">machine learning</span> e análise de padrões em tempo real, 
                  nosso robô identifica as melhores oportunidades de entrada e os momentos ideais para sacar seus ganhos.
                </p>
                <p className="text-lg text-gray-300 leading-relaxed" data-testid="text-about-features">
                  Ele analisa o Aviator em tempo real e mostra onde o Aviator vai cair com 
                  <span className="text-red-500 font-semibold"> 100% de acerto</span>. 
                  Com uma interface intuitiva e atualização a cada segundo, você recebe sinais precisos sobre 
                  <span className="text-red-500 font-semibold"> QUANDO entrar</span> e 
                  <span className="text-red-400 font-semibold"> ONDE sacar</span>.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Como usar o robô */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-8">
            <Button
              size="lg"
              onClick={() => setShowGuide(!showGuide)}
              className="bg-red-600 text-white text-xl px-8 py-6 font-bold hover:bg-red-700 border-2 border-white"
              data-testid="button-toggle-guide"
            >
              <span className="mr-2">Como usar o robô?</span>
              {showGuide ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
            </Button>
          </div>

          {showGuide && (
            <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
              <Card className="bg-black border-2 border-red-600">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center text-white font-bold text-xl">
                      1
                    </div>
                    <CardTitle className="text-2xl text-white">Captura Automática</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 ml-16 text-lg" data-testid="text-step-1">
                    Nosso script (fornecido após cadastro) captura automaticamente cada multiplicador do jogo Aviator 
                    e envia para nossos servidores em tempo real, sem intervenção manual.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-black border-2 border-red-600">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center text-white font-bold text-xl">
                      2
                    </div>
                    <CardTitle className="text-2xl text-white">Análise Inteligente</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 ml-16 text-lg" data-testid="text-step-2">
                    O algoritmo de IA analisa as últimas 20 velas, calcula médias móveis (MA5, MA10, MA20), 
                    detecta tendências, mede volatilidade e identifica 5 padrões favoráveis diferentes automaticamente.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-black border-2 border-red-600">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center text-white font-bold text-xl">
                      3
                    </div>
                    <CardTitle className="text-2xl text-white">Sinais Inteligentes</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 ml-16 text-lg" data-testid="text-step-3">
                    Quando o sistema detecta uma oportunidade (pontuação ≥6), exibe o sinal: "APÓS: [última vela]" e 
                    "SACAR: [multiplicador recomendado]" com cores dinâmicas baseadas no nível de confiança.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-black border-2 border-red-600">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center text-white font-bold text-xl">
                      4
                    </div>
                    <CardTitle className="text-2xl text-white">Tome Decisões</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 ml-16 text-lg" data-testid="text-step-4">
                    Siga os sinais do robô ou use as estatísticas avançadas (gráfico, tendências, padrões) para 
                    tomar suas próprias decisões informadas com base em dados reais.
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </section>

      {/* Perguntas Frequentes */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <h3 
            className="text-4xl font-bold text-center mb-12 text-red-500"
            style={{ textShadow: '0 0 20px #ff0000' }}
            data-testid="text-faq-title"
          >
            Perguntas Frequentes
          </h3>
          <div className="space-y-4">
            <Card className="bg-black border-2 border-red-600">
              <CardHeader>
                <CardTitle className="text-xl text-white">O robô funciona 100% do tempo?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">
                  O robô analisa padrões em tempo real com alta precisão, mas o Aviator é um jogo de probabilidades. 
                  Recomendamos usar o sistema como uma ferramenta de auxílio nas suas decisões.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-black border-2 border-red-600">
              <CardHeader>
                <CardTitle className="text-xl text-white">Como instalo o script de captura?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">
                  Após o cadastro, você receberá instruções detalhadas sobre como instalar o script no seu navegador. 
                  É simples e leva menos de 2 minutos.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-black border-2 border-red-600">
              <CardHeader>
                <CardTitle className="text-xl text-white">Preciso deixar o navegador aberto?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">
                  Sim, o script captura os dados em tempo real enquanto você joga. Mantenha a aba do Aviator aberta 
                  para que o sistema funcione corretamente.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-black border-2 border-red-600">
              <CardHeader>
                <CardTitle className="text-xl text-white">O sistema é compatível com qual plataforma?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">
                  O Robô Cyber Hacker funciona em qualquer plataforma que rode o Aviator. 
                  Basta ter um navegador moderno (Chrome, Firefox, Edge).
                </p>
              </CardContent>
            </Card>

            <Card className="bg-black border-2 border-red-600">
              <CardHeader>
                <CardTitle className="text-xl text-white">Quanto custa o acesso ao robô?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">
                  Oferecemos planos flexíveis. Entre em contato após o cadastro para conhecer as opções disponíveis 
                  e escolher a melhor para você.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Vídeos */}
      <section id="videos-section" className="py-16 px-4 bg-gray-900/50">
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

      {/* CTA Final */}
      <section className="py-20 px-4 bg-gradient-to-b from-transparent via-red-900/10 to-transparent">
        <div className="container mx-auto text-center">
          <h3 
            className="text-5xl font-bold mb-6 text-red-500"
            style={{ textShadow: '0 0 30px #ff0000' }}
            data-testid="text-cta-title"
          >
            Pronto Para Começar?
          </h3>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto" data-testid="text-cta-subtitle">
            Junte-se a centenas de jogadores que já estão maximizando seus ganhos no Aviator com IA
          </p>
          <Link href="/signup">
            <Button 
              size="lg" 
              className="bg-red-600 text-white text-lg px-12 py-6 font-bold hover:bg-red-700"
              style={{ boxShadow: '0 0 20px rgba(255, 0, 0, 0.5)' }}
              data-testid="button-cta-signup"
            >
              Criar Conta Grátis
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t-2 border-red-600 bg-black">
        <div className="container mx-auto text-center text-white">
          <p data-testid="text-footer">© 2025 Robô Cyber Hacker - Todos os direitos reservados</p>
        </div>
      </footer>
    </div>
  );
}
