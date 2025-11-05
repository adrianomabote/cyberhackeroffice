# Sistema de Análise Aviator - CYBER HACKER

## Visão Geral
Sistema completo de análise e previsão em tempo real do jogo Aviator com interface cyberpunk profissional. Inclui landing page, sistema de login/cadastro, frontend React com sinais em tempo real, backend Node.js com API RESTful, PostgreSQL para persistência, algoritmo ML avançado, sistema de notificações e script de captura automática.

## Estrutura do Projeto

### Frontend (`client/`)

#### **Sistema de Navegação**
1. **Splash Screen** (`client/src/pages/splash.tsx`):
   - Tela inicial com "ROBÔ CYBERHACKER" em vermelho neon (fonte normal)
   - Animação de "processando sistema"
   - Barra de loading animada
   - Duração: 3 segundos
   - Armazenamento: sessionStorage (mostra apenas uma vez por sessão)

2. **Landing Page** (`client/src/pages/landing.tsx`):
   - **Design**: Cyberpunk profissional com paleta verde neon/cyan/azul/roxo/rosa
   - **Header sticky**: 
     - Imagem hacker profissional (esquerda)
     - Logo "CyberHacker" (sem espaço) gradiente emerald-to-cyan, fonte normal (centro-esquerda)
     - Botões "ENTRAR" e "REGISTRE-SE" (direita)
   - **Hero Section**: 
     - Badge com ícone Brain (IA Avançada)
     - Título "Domine o Aviator" gradiente emerald/cyan/blue
     - Subtítulo com destaque em verde para "IA avançada"
     - CTAs "Começar Agora" e "Ver Demonstração"
   - **Stats**: 3 cards (98.5% Precisão, 1s Atualização, 24/7 Disponibilidade)
   - **Seção "O que é"**: Explicação do robô e algoritmo ML
   - **Benefícios**: 6 cards com vantagens (Análise Real-Time, ML, Sinais, Padrões, Confiança, Interface)
   - **Como Funciona**: 4 passos (Captura → Análise → Sinais → Decisões)
   - **Vídeos Demonstrativos**: 2 placeholders para vídeos (Como Usar + Resultados)
   - **CTA Final**: "PRONTO PARA COMEÇAR?" + botão "Criar Conta Grátis"
   - **Footer**: Copyright
   - **Asset**: attached_assets/stock_images/hacker_cyberpunk_neo_193d439f.jpg

3. **Login** (`client/src/pages/login.tsx`):
   - Design matching landing (gradientes emerald/cyan)
   - Header com imagem hacker + logo "CyberHacker" (fonte normal)
   - Botão voltar (ghost) para landing page
   - Formulário de login (email + senha)
   - Link para criar conta
   - Redireciona para `/app` após login (TODO: autenticação real)

4. **Cadastro** (`client/src/pages/signup.tsx`):
   - Design matching landing (gradientes emerald/cyan)
   - Header com imagem hacker + logo "CyberHacker" (fonte normal)
   - Botão voltar (ghost) para landing page
   - Formulário de cadastro (nome + email + senha + confirmar senha)
   - Validação de senhas
   - Link para login
   - Redireciona para `/app` após cadastro (TODO: registro real)

5. **Dashboard de Sinais** (`client/src/pages/home.tsx`): 
  - Interface cyberpunk minimalista - 100% conforme foto de referência
  - Header: "CYBER HACKER" em vermelho (#ff0000) com glow effect
  - Card inteligente com sistema de cooldown:
    - **Prioridade de exibição**:
      1. Sinais manuais (se ativos) - Ignora sistema automático
      2. Sistema automático - Detecta oportunidades via algoritmo ML
    - **Quando NÃO é hora de entrar**: APÓS: ... e SACAR: ... (pontinhos cinzas)
    - **Quando É hora de entrar**: APÓS mostra última vela da API + SACAR mostra multiplicador recomendado
    - Ambos aparecem **ao mesmo tempo** apenas quando detecta oportunidade
    - **Sistema de reset**: Mostra entrada até receber NOVA vela da API, então volta aos pontinhos e aguarda próxima oportunidade
    - Só mostra novamente quando detectar entrada com valores diferentes
  - Cores dinâmicas por multiplicador (conforme foto de referência):
    - 1.00x - 1.99x: Azul cyan (#00bfff)
    - 2.00x - 9.99x: Roxo (#9d4edd)
    - 10.00x+: Rosa vibrante (#ff1493)
  - Fundo preto (#000000) forçado no body
  - Efeito de pulso visual quando valores atualizam
- **Design System**: 
  - Dashboard: Cores cyber hacker (preto #000000, vermelho #ff0000, roxo #9d4edd)
  - Landing/Login/Signup: Verde neon (#00ff88), cyan (#00bfff), emerald (#10b981), gradientes modernos
- **Polling Ativo**: 
  - /api/apos/cyber e /api/sacar/cyber: 1s (atualização em tempo real)

### Backend (`server/`)
- **API Routes** (`server/routes.ts`): 
  - GET /api/cyber - Lista todos os endpoints disponíveis
  - POST /api/velas/cyber - Recebe multiplicadores
  - GET /api/velas/cyber - Retorna histórico de velas
  - GET /api/apos/cyber - Retorna última vela
  - GET /api/sacar/cyber - Previsão com algoritmo ML avançado
  - GET /api/historico/cyber - Últimas 50+ velas para gráfico
  - GET /api/estatisticas/cyber - Médias móveis, tendência, volatilidade, extremos
  - GET /api/padroes/cyber - Detecta 4 tipos de padrões favoráveis
  - GET /api/manutencao/cyber - Retorna status de manutenção
  - POST /api/manutencao/cyber - Ativa/desativa manutenção
- **Storage** (`server/storage.ts`): 
  - PostgreSQL com Drizzle ORM
  - DbStorage class com proteção contra duplicatas
  - Tabela 'velas' (id, multiplicador, timestamp)
- **CORS**: Habilitado para chamadas cross-origin

### Script de Captura
- **aviator-script.js**: Script standalone para console do navegador
- **Funcionalidades**: 
  - Captura automática a cada 1 segundo
  - API_URL configurável
  - Proteção contra duplicatas consecutivas
  - Comandos de controle (stop/restart)

### Schema (`shared/schema.ts`)
- **Modelos**: Vela, HistoricoResponse, EstatisticasResponse, PadroesResponse
- **Tipos**: InsertVela, UltimaVelaResponse, PrevisaoResponse
- **Validação**: Zod schemas para todas as entradas

## Algoritmo de Detecção de Oportunidades de Entrada

### Sistema de Análise (analisarOportunidadeEntrada):
Analisa constantemente as últimas 20 velas e detecta **5 padrões favoráveis**:

#### 1. **Sequência de Baixos** (3 pontos)
- Detecta 3+ velas <2x nas últimas 5
- Indica probabilidade de recuperação

#### 2. **Última Vela Baixa** (2 pontos)
- Última vela <2.5x após média >2.5x
- Ponto de entrada após queda

#### 3. **Tendência de Recuperação** (2 pontos)
- Média das 5 últimas < 85% da média geral
- Ciclo de baixa prestes a reverter

#### 4. **Sem Altos Extremos** (1 ponto)
- Nenhuma vela >5x nas últimas 3
- Evita entrar após pico

#### 5. **Volatilidade Controlada** (1 ponto)
- Coeficiente de variação < 0.6
- Maior previsibilidade

### Sistema de Sinais:
| Pontos | Sinal | Confiança | Multiplicador Recomendado |
|--------|-------|-----------|---------------------------|
| 6+ | ENTRAR | Alta | 2.00x / 3.00x / 4.00x |
| 4-5 | ENTRAR | Média | 2.00x / 2.50x |
| 2-3 | POSSÍVEL | Baixa | 2.00x |
| 0-1 | AGUARDAR | Baixa | Análise |

### Lógica de Multiplicador de Saída:
- **Média Geral <2.5**: Sacar em 2.00x (conservador)
- **Média Geral 2.5-3.5**: Sacar em 3.00x (moderado)
- **Média Geral 3.5-5.0**: Sacar em 4.00x (arriscado)
- **Média Geral ≥5.0**: Sacar em 10.00x (muito arriscado)

## Sistema de Estatísticas

### GET /api/estatisticas
- **Médias Móveis**: MA5, MA10, MA20
- **Tendência**: Tipo (alta/baixa/estável) + percentual
  - Usa últimas 10 velas para capturar comportamento recente
  - Alta: variação > 5%
  - Baixa: variação < -5%
- **Volatilidade**: Valor + nível (baixa/média/alta)
- **Extremos**: Máximo, mínimo, amplitude

## Sistema de Notificações

### GET /api/padroes - 4 Detectores:
1. **Sequência Baixa**: ≥3 multiplicadores <2x nas últimas 5 velas (warning)
2. **Alta Volatilidade**: Amplitude >3x nas últimas 5 velas (info)
3. **Tendência Forte**: Variação >15% entre metades das últimas 10 velas (success/warning)
4. **Oportunidade**: ≥2 baixos E última <2.5x (success)

### Frontend:
- Toasts automáticos via useToast
- Deduplicação com timeout de 10s
- Duration: 5 segundos
- Ícones: AlertTriangle, CheckCircle, Info

## Como Funciona

### Fluxo de Navegação:
1. **Primeira visita** → Splash screen (3s) → Landing page
2. **Landing page** → Usuário lê sobre o robô → Clica "CRIAR CONTA"
3. **Cadastro** → Preenche dados → Redireciona para `/app`
4. **Dashboard `/app`** → Interface cyberpunk com sinais em tempo real

### Fluxo de Dados:
1. **Usuário acessa `/app`** → Dashboard de sinais carrega
2. **Script no console** → Captura multiplicadores a cada 1s
3. **POST /api/velas/cyber** → Backend armazena no PostgreSQL
4. **Frontend polling** → Atualiza cards, gráfico e estatísticas
5. **Detecção de padrões** → Sistema monitora e notifica via toasts
6. **Algoritmo ML** → Calcula previsão usando regressão + EMA + padrões

### Rotas Disponíveis:
- `/` - Landing page
- `/login` - Tela de login
- `/signup` - Tela de cadastro
- `/app` - Dashboard de sinais (ex-home)
- `/admin/cyber` - Painel administrativo

## Tecnologias
- React + TypeScript + Tailwind CSS
- Express.js + Node.js
- PostgreSQL + Drizzle ORM
- TanStack Query (React Query)
- Recharts para gráficos
- Shadcn UI (Toast, Cards)
- Fonts: Orbitron (display), Rajdhani (cyber), Roboto Mono (code)

## Porta
Servidor roda na porta 5000.

## Sistema de Manutenção Manual

### Página Admin (`/admin/cyber`)
- **Acesso**: Via URL `/admin/cyber`
- **Funcionalidades**:
  - **Manutenção Manual**:
    - Ativar manutenção: Define mensagem de retorno (ex: "VOLTE ÀS 15:30")
    - Motivo fixo: "O ROBÔ ESTÁ ATUALIZANDO. ENTRE NO HORÁRIO INDICADO PARA CONTINUAR USANDO O SISTEMA."
    - Desativar manutenção: Retorna sistema ao normal
  - **Sinais Manuais**:
    - Ativar sinais: Define multiplicadores manualmente para APÓS e SACAR
    - Desativar sinais: Volta a usar sistema automático
    - Status visível: Mostra se está ativo e valores definidos
- **Armazenamento**: In-memory (temporário)

### Tela de Manutenção
- **Ativação**: Quando `manutencao.ativo === true`
- **Display**: Mostra mensagem de retorno e motivo fixo
- **Atualização**: Polling automático a cada 5 segundos
- **Design**: Cyberpunk matching com resto do app
- **Texto removido**: "Atualizando a cada 5 segundos" foi removido da interface

### API Endpoints
- GET /api/manutencao/cyber - Verifica status de manutenção
- POST /api/manutencao/cyber - Ativa/desativa com { ativo, mensagem, motivo }
- GET /api/sinais-manual/cyber - Retorna sinais manuais
- POST /api/sinais-manual/cyber - Define sinais com { ativo, apos, sacar }

## Sistema de Proteção de Código

### Proteções Implementadas (SEM BLOQUEIO DE USUÁRIOS):

1. **Desabilitar clique direito** - Previne "Inspecionar elemento"
2. **Desabilitar seleção de texto** - Impede copiar conteúdo
3. **Bloqueio de teclas DevTools** - Desabilita F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C
4. **Bloqueio de View Source** - Desabilita Ctrl+U
5. **Bloqueio de Save/Print** - Desabilita Ctrl+S, Ctrl+P
6. **Bloqueio de Copy/Cut** - Desabilita Ctrl+C, Ctrl+X, Ctrl+A
7. **CSS anti-seleção** - Força user-select: none em todos elementos
8. **Meta tags de proteção** - noindex, no-cache, pragma
9. **Proteção de imagens** - Impede drag de imagens
10. **Ofuscação em produção** - Código minificado e ofuscado no build

**Nota**: Sistema ajustado para NÃO bloquear usuários permanentemente. Apenas dificulta acesso ao código sem banir ninguém.

## Estado Atual - COMPLETO
✅ PostgreSQL com Drizzle ORM (persistência)
✅ Frontend cyberpunk com 6 cards + gráfico
✅ Backend com 10 endpoints RESTful
✅ Algoritmo ML avançado (regressão + EMA + volatilidade)
✅ Sistema de estatísticas (médias móveis, tendência, volatilidade)
✅ Sistema de notificações (4 detectores de padrões)
✅ Sistema de manutenção manual (página admin + tela de manutenção)
✅ Sistema de sinais manuais (envio manual de APÓS e SACAR)
✅ Script de captura automática
✅ Proteção de código fonte (12 camadas de segurança)
✅ Testes E2E validados
✅ Guards contra crashes (optional chaining, arrays vazios)
✅ CORS habilitado
