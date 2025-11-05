import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Shield, Zap, Target, CheckCircle, PlayCircle, Brain, BarChart3, Clock } from 'lucide-react';
import { useProtection } from '@/hooks/use-protection';
import hackerImage from '@assets/IMG-20251105-WA0139_1762343129352.jpg';

export default function Landing() {
  useProtection();
  
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
              Robô Cyber Hacker
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

      {/* Benefícios */}
      <section className="py-16 px-4 bg-gradient-to-b from-transparent to-gray-900/50">
        <div className="container mx-auto">
          <h3 
            className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent"
            data-testid="text-benefits-title"
          >
            Por Que Escolher o Robô Cyber Hacker?
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <Card className="bg-gradient-to-br from-gray-900 to-gray-950 border-emerald-500/30 hover-elevate" data-testid="card-benefit-1">
              <CardHeader>
                <Clock className="w-12 h-12 text-emerald-400 mb-2" />
                <CardTitle className="text-emerald-400">Análise em Tempo Real</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-400">
                  Sistema atualiza a cada 1 segundo com os últimos multiplicadores e padrões detectados automaticamente
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-gray-900 to-gray-950 border-cyan-500/30 hover-elevate" data-testid="card-benefit-2">
              <CardHeader>
                <Brain className="w-12 h-12 text-cyan-400 mb-2" />
                <CardTitle className="text-cyan-400">Inteligência Artificial</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-400">
                  Algoritmo ML avançado analisa 5 padrões favoráveis para identificar as melhores oportunidades
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-gray-900 to-gray-950 border-blue-500/30 hover-elevate" data-testid="card-benefit-3">
              <CardHeader>
                <Target className="w-12 h-12 text-blue-400 mb-2" />
                <CardTitle className="text-blue-400">Sinais Precisos</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-400">
                  Receba indicações exatas de quando entrar e em qual multiplicador sacar com alta precisão
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-gray-900 to-gray-950 border-purple-500/30 hover-elevate" data-testid="card-benefit-4">
              <CardHeader>
                <BarChart3 className="w-12 h-12 text-purple-400 mb-2" />
                <CardTitle className="text-purple-400">Detecção de Padrões</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-400">
                  Identifica sequências de baixos, tendências de recuperação e volatilidade controlada em tempo real
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-gray-900 to-gray-950 border-green-500/30 hover-elevate" data-testid="card-benefit-5">
              <CardHeader>
                <CheckCircle className="w-12 h-12 text-green-400 mb-2" />
                <CardTitle className="text-green-400">Sistema de Confiança</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-400">
                  Cada sinal vem com nível de confiança (Alta, Média, Baixa) baseado em análise de múltiplos fatores
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-gray-900 to-gray-950 border-pink-500/30 hover-elevate" data-testid="card-benefit-6">
              <CardHeader>
                <Zap className="w-12 h-12 text-pink-400 mb-2" />
                <CardTitle className="text-pink-400">Interface Moderna</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-400">
                  Design futurista com cores dinâmicas, efeitos visuais e navegação intuitiva para todos
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Como Funciona */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h3 
            className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent"
            data-testid="text-how-title"
          >
            Como Funciona
          </h3>
          <div className="max-w-4xl mx-auto space-y-6">
            <Card className="bg-gradient-to-r from-emerald-900/20 to-transparent border-emerald-500/30">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 flex items-center justify-center text-black font-bold text-xl">
                    1
                  </div>
                  <CardTitle className="text-2xl text-emerald-400">Captura Automática</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-white ml-16 text-lg" data-testid="text-step-1">
                  Nosso script (fornecido após cadastro) captura automaticamente cada multiplicador do jogo Aviator 
                  e envia para nossos servidores em tempo real, sem intervenção manual.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-cyan-900/20 to-transparent border-cyan-500/30">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center text-black font-bold text-xl">
                    2
                  </div>
                  <CardTitle className="text-2xl text-cyan-400">Análise Inteligente</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-white ml-16 text-lg" data-testid="text-step-2">
                  O algoritmo de IA analisa as últimas 20 velas, calcula médias móveis (MA5, MA10, MA20), 
                  detecta tendências, mede volatilidade e identifica 5 padrões favoráveis diferentes automaticamente.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-blue-900/20 to-transparent border-blue-500/30">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-black font-bold text-xl">
                    3
                  </div>
                  <CardTitle className="text-2xl text-blue-400">Sinais Inteligentes</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-white ml-16 text-lg" data-testid="text-step-3">
                  Quando o sistema detecta uma oportunidade (pontuação ≥6), exibe o sinal: "APÓS: [última vela]" e 
                  "SACAR: [multiplicador recomendado]" com cores dinâmicas baseadas no nível de confiança.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-900/20 to-transparent border-purple-500/30">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-black font-bold text-xl">
                    4
                  </div>
                  <CardTitle className="text-2xl text-purple-400">Tome Decisões</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-white ml-16 text-lg" data-testid="text-step-4">
                  Siga os sinais do robô ou use as estatísticas avançadas (gráfico, tendências, padrões) para 
                  tomar suas próprias decisões informadas com base em dados reais.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Vídeos */}
      <section className="py-16 px-4 bg-gray-900/50">
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
