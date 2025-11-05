import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Shield, Zap, Target, CheckCircle, PlayCircle } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-gray-800 bg-black/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <h1 
              className="text-2xl md:text-3xl font-bold cursor-pointer hover-elevate active-elevate-2 px-4 py-2 rounded-md transition-all"
              style={{
                color: '#ff0000',
                textShadow: '0 0 10px #ff0000',
                fontFamily: 'Orbitron, monospace'
              }}
              data-testid="link-logo"
            >
              ROBÔ CYBER HACKER
            </h1>
          </Link>

          <div className="flex gap-3">
            <Link href="/login">
              <Button 
                variant="outline" 
                className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
                data-testid="button-login"
              >
                ENTRAR
              </Button>
            </Link>
            <Link href="/signup">
              <Button 
                className="bg-red-600 hover:bg-red-700 text-white"
                data-testid="button-signup"
              >
                CRIAR CONTA
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h2 
            className="text-5xl md:text-7xl font-bold mb-6"
            style={{
              color: '#ff0000',
              textShadow: '0 0 20px #ff0000',
              fontFamily: 'Orbitron, monospace'
            }}
            data-testid="text-hero-title"
          >
            DOMINE O AVIATOR
          </h2>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto" data-testid="text-hero-subtitle">
            Sistema de análise em tempo real com inteligência artificial para maximizar seus ganhos no jogo Aviator
          </p>
          <Link href="/signup">
            <Button 
              size="lg" 
              className="bg-red-600 hover:bg-red-700 text-white text-lg px-8 py-6"
              data-testid="button-start"
            >
              COMEÇAR AGORA
            </Button>
          </Link>
        </div>
      </section>

      {/* O que é o Robô */}
      <section className="py-16 px-4 bg-gray-900/50">
        <div className="container mx-auto">
          <h3 
            className="text-4xl font-bold text-center mb-12"
            style={{ color: '#ff0000', fontFamily: 'Orbitron, monospace' }}
            data-testid="text-about-title"
          >
            O QUE É O ROBÔ CYBER HACKER?
          </h3>
          <div className="max-w-4xl mx-auto">
            <Card className="bg-black border-gray-800">
              <CardContent className="p-8">
                <p className="text-lg text-gray-300 leading-relaxed mb-4" data-testid="text-about-description">
                  O <span className="text-red-500 font-bold">ROBÔ CYBER HACKER</span> é um sistema avançado de análise preditiva 
                  desenvolvido especificamente para o jogo <span className="text-purple-400 font-bold">Aviator</span>. 
                  Utilizando algoritmos de machine learning e análise de padrões em tempo real, nosso robô identifica 
                  as melhores oportunidades de entrada e os momentos ideais para sacar seus ganhos.
                </p>
                <p className="text-lg text-gray-300 leading-relaxed" data-testid="text-about-features">
                  Com uma interface cyberpunk intuitiva e atualização a cada segundo, você recebe sinais precisos sobre 
                  QUANDO entrar e ONDE sacar, baseado em análise de mais de 20 velas, médias móveis, volatilidade e 
                  detecção de padrões favoráveis.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefícios */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h3 
            className="text-4xl font-bold text-center mb-12"
            style={{ color: '#ff0000', fontFamily: 'Orbitron, monospace' }}
            data-testid="text-benefits-title"
          >
            BENEFÍCIOS DO APLICATIVO
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <Card className="bg-black border-gray-800 hover-elevate" data-testid="card-benefit-1">
              <CardHeader>
                <TrendingUp className="w-12 h-12 text-red-500 mb-2" />
                <CardTitle className="text-red-500">Análise em Tempo Real</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-400">
                  Sistema atualiza a cada 1 segundo com os últimos multiplicadores e padrões detectados
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-black border-gray-800 hover-elevate" data-testid="card-benefit-2">
              <CardHeader>
                <Shield className="w-12 h-12 text-purple-500 mb-2" />
                <CardTitle className="text-purple-500">Algoritmo ML Avançado</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-400">
                  Inteligência artificial analisa 5 padrões favoráveis para identificar oportunidades
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-black border-gray-800 hover-elevate" data-testid="card-benefit-3">
              <CardHeader>
                <Zap className="w-12 h-12 text-cyan-500 mb-2" />
                <CardTitle className="text-cyan-500">Sinais Precisos</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-400">
                  Receba indicações exatas de APÓS qual vela entrar e em qual multiplicador SACAR
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-black border-gray-800 hover-elevate" data-testid="card-benefit-4">
              <CardHeader>
                <Target className="w-12 h-12 text-pink-500 mb-2" />
                <CardTitle className="text-pink-500">Detecção de Padrões</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-400">
                  Identifica sequências de baixos, tendências de recuperação e volatilidade controlada
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-black border-gray-800 hover-elevate" data-testid="card-benefit-5">
              <CardHeader>
                <CheckCircle className="w-12 h-12 text-green-500 mb-2" />
                <CardTitle className="text-green-500">Sistema de Confiança</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-400">
                  Cada sinal vem com nível de confiança (Alta, Média, Baixa) baseado em pontos de análise
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-black border-gray-800 hover-elevate" data-testid="card-benefit-6">
              <CardHeader>
                <PlayCircle className="w-12 h-12 text-red-500 mb-2" />
                <CardTitle className="text-red-500">Interface Cyberpunk</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-400">
                  Design futurista com cores dinâmicas por multiplicador e efeitos visuais de pulso
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Como Funciona */}
      <section className="py-16 px-4 bg-gray-900/50">
        <div className="container mx-auto">
          <h3 
            className="text-4xl font-bold text-center mb-12"
            style={{ color: '#ff0000', fontFamily: 'Orbitron, monospace' }}
            data-testid="text-how-title"
          >
            COMO FUNCIONA
          </h3>
          <div className="max-w-4xl mx-auto space-y-6">
            <Card className="bg-black border-gray-800">
              <CardHeader>
                <CardTitle className="text-2xl text-red-500">1. Captura Automática</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300" data-testid="text-step-1">
                  Nosso script (fornecido após cadastro) captura automaticamente cada multiplicador do jogo Aviator 
                  e envia para nossos servidores em tempo real.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-black border-gray-800">
              <CardHeader>
                <CardTitle className="text-2xl text-purple-500">2. Análise Inteligente</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300" data-testid="text-step-2">
                  O algoritmo de machine learning analisa as últimas 20 velas, calcula médias móveis (MA5, MA10, MA20), 
                  detecta tendências, mede volatilidade e identifica 5 padrões favoráveis diferentes.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-black border-gray-800">
              <CardHeader>
                <CardTitle className="text-2xl text-cyan-500">3. Sinais Inteligentes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300" data-testid="text-step-3">
                  Quando o sistema detecta uma oportunidade (pontuação ≥6), exibe o sinal: "APÓS: [última vela]" e 
                  "SACAR: [multiplicador recomendado]" com cores dinâmicas baseadas no valor.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-black border-gray-800">
              <CardHeader>
                <CardTitle className="text-2xl text-pink-500">4. Tome Decisões</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300" data-testid="text-step-4">
                  Siga os sinais do robô ou use as estatísticas avançadas (gráfico, tendências, padrões) para 
                  tomar suas próprias decisões informadas.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Vídeos Demonstrativos */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h3 
            className="text-4xl font-bold text-center mb-12"
            style={{ color: '#ff0000', fontFamily: 'Orbitron, monospace' }}
            data-testid="text-videos-title"
          >
            VÍDEOS DEMONSTRATIVOS
          </h3>
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <Card className="bg-black border-gray-800" data-testid="card-video-1">
              <CardHeader>
                <CardTitle className="text-red-500">Como Usar o Robô</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center border border-gray-700">
                  <PlayCircle className="w-20 h-20 text-red-500" />
                </div>
                <p className="text-gray-400 mt-4" data-testid="text-video-1-desc">
                  Tutorial completo mostrando como configurar e usar o sistema passo a passo
                </p>
              </CardContent>
            </Card>

            <Card className="bg-black border-gray-800" data-testid="card-video-2">
              <CardHeader>
                <CardTitle className="text-purple-500">Resultados Reais</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center border border-gray-700">
                  <PlayCircle className="w-20 h-20 text-purple-500" />
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
      <section className="py-20 px-4 bg-gradient-to-b from-black to-gray-900">
        <div className="container mx-auto text-center">
          <h3 
            className="text-5xl font-bold mb-6"
            style={{
              color: '#ff0000',
              textShadow: '0 0 20px #ff0000',
              fontFamily: 'Orbitron, monospace'
            }}
            data-testid="text-cta-title"
          >
            PRONTO PARA COMEÇAR?
          </h3>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto" data-testid="text-cta-subtitle">
            Junte-se a centenas de jogadores que já estão maximizando seus ganhos no Aviator
          </p>
          <Link href="/signup">
            <Button 
              size="lg" 
              className="bg-red-600 hover:bg-red-700 text-white text-lg px-12 py-6"
              data-testid="button-cta-signup"
            >
              CRIAR CONTA GRÁTIS
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-gray-800">
        <div className="container mx-auto text-center text-gray-500">
          <p data-testid="text-footer">© 2025 ROBÔ CYBER HACKER - Todos os direitos reservados</p>
        </div>
      </footer>
    </div>
  );
}
