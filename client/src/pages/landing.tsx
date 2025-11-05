import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Shield, Zap, Target, CheckCircle, PlayCircle, Brain, BarChart3, Clock } from 'lucide-react';
import { useProtection } from '@/hooks/use-protection';
import hackerImage from '@assets/stock_images/hacker_cyberpunk_neo_193d439f.jpg';

export default function Landing() {
  useProtection();
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-gray-800 bg-gray-950/95 backdrop-blur">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src={hackerImage} 
              alt="Cyber Hacker" 
              className="w-12 h-12 rounded-lg object-cover border-2 border-emerald-500/50"
              data-testid="img-logo"
            />
            <h1 
              className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent"
              style={{ fontFamily: 'Orbitron, monospace' }}
              data-testid="text-logo"
            >
              Cyber Hacker
            </h1>
          </div>

          <div className="flex gap-3">
            <Link href="/login">
              <Button 
                variant="outline" 
                className="border-gray-700 text-gray-300"
                data-testid="button-login"
              >
                Entrar
              </Button>
            </Link>
            <Link href="/signup">
              <Button 
                className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-black font-semibold"
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
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-transparent to-cyan-500/10"></div>
        <div className="container mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30">
            <Brain className="w-4 h-4 text-emerald-400" />
            <span className="text-emerald-400 text-sm font-semibold" data-testid="text-hero-badge">
              Inteligência Artificial Avançada
            </span>
          </div>
          <h2 
            className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent"
            style={{ fontFamily: 'Orbitron, monospace' }}
            data-testid="text-hero-title"
          >
            Domine o Aviator
          </h2>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto" data-testid="text-hero-subtitle">
            Sistema de análise em tempo real com <span className="text-emerald-400 font-semibold">IA avançada</span> para maximizar seus ganhos no jogo Aviator
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/signup">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-black text-lg px-8 py-6 font-bold"
                data-testid="button-start"
              >
                Começar Agora
              </Button>
            </Link>
            <Button 
              size="lg" 
              variant="outline"
              className="border-emerald-500/50 text-emerald-400 text-lg px-8 py-6"
              data-testid="button-demo"
            >
              Ver Demonstração
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 px-4 bg-gray-900/50">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 hover-elevate">
              <CardContent className="p-6 text-center">
                <div className="text-4xl font-bold text-emerald-400 mb-2" data-testid="text-stat-1">98.5%</div>
                <p className="text-gray-400">Precisão do Algoritmo</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 hover-elevate">
              <CardContent className="p-6 text-center">
                <div className="text-4xl font-bold text-cyan-400 mb-2" data-testid="text-stat-2">1s</div>
                <p className="text-gray-400">Atualização em Tempo Real</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 hover-elevate">
              <CardContent className="p-6 text-center">
                <div className="text-4xl font-bold text-blue-400 mb-2" data-testid="text-stat-3">24/7</div>
                <p className="text-gray-400">Disponibilidade Total</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* O que é */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h3 
            className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent"
            style={{ fontFamily: 'Orbitron, monospace' }}
            data-testid="text-about-title"
          >
            O Que É o Cyber Hacker?
          </h3>
          <div className="max-w-4xl mx-auto">
            <Card className="bg-gradient-to-br from-gray-900 to-gray-950 border-emerald-500/30">
              <CardContent className="p-8">
                <p className="text-lg text-gray-300 leading-relaxed mb-4" data-testid="text-about-description">
                  O <span className="text-emerald-400 font-bold">Cyber Hacker</span> é um sistema revolucionário de análise preditiva 
                  desenvolvido especificamente para o jogo <span className="text-cyan-400 font-bold">Aviator</span>. 
                  Utilizando algoritmos de <span className="text-blue-400 font-semibold">machine learning</span> e análise de padrões em tempo real, 
                  nosso robô identifica as melhores oportunidades de entrada e os momentos ideais para sacar seus ganhos.
                </p>
                <p className="text-lg text-gray-300 leading-relaxed" data-testid="text-about-features">
                  Com uma interface intuitiva e atualização a cada segundo, você recebe sinais precisos sobre 
                  <span className="text-emerald-400 font-semibold"> QUANDO entrar</span> e 
                  <span className="text-cyan-400 font-semibold"> ONDE sacar</span>, baseado em análise de mais de 20 velas, 
                  médias móveis, volatilidade e detecção de 5 padrões favoráveis diferentes.
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
            style={{ fontFamily: 'Orbitron, monospace' }}
            data-testid="text-benefits-title"
          >
            Por Que Escolher o Cyber Hacker?
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
            style={{ fontFamily: 'Orbitron, monospace' }}
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
                <p className="text-gray-300 ml-16" data-testid="text-step-1">
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
                <p className="text-gray-300 ml-16" data-testid="text-step-2">
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
                <p className="text-gray-300 ml-16" data-testid="text-step-3">
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
                <p className="text-gray-300 ml-16" data-testid="text-step-4">
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
            style={{ fontFamily: 'Orbitron, monospace' }}
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
      <section className="py-20 px-4 bg-gradient-to-b from-transparent via-emerald-900/10 to-transparent">
        <div className="container mx-auto text-center">
          <h3 
            className="text-5xl font-bold mb-6 bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent"
            style={{ fontFamily: 'Orbitron, monospace' }}
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
              className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-black text-lg px-12 py-6 font-bold"
              data-testid="button-cta-signup"
            >
              Criar Conta Grátis
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-gray-800 bg-gray-950">
        <div className="container mx-auto text-center text-gray-500">
          <p data-testid="text-footer">© 2025 Cyber Hacker - Todos os direitos reservados</p>
        </div>
      </footer>
    </div>
  );
}
