# Sistema de Análise Aviator - CYBER HACKER

## Visão Geral
Sistema completo de análise e previsão em tempo real do jogo Aviator com interface cyberpunk. Inclui frontend React, backend Node.js com API RESTful, PostgreSQL para persistência, algoritmo ML avançado, sistema de notificações e script de captura automática.

## Estrutura do Projeto

### Frontend (`client/`)
- **Página Principal** (`client/src/pages/home.tsx`): 
  - Interface cyberpunk minimalista - 100% conforme foto de referência
  - Header: "CYBER HACKER" em vermelho (#ff0000) com glow effect
  - 2 cards principais lado a lado:
    - **APÓS:** - Última vela capturada (roxo #9d4edd)
    - **SACAR:** - Previsão ML em tempo real (roxo #9d4edd)
  - Fundo preto (#000000) forçado no body
  - Efeito de pulso visual quando valores atualizam
- **Design System**: Cores cyber hacker (preto #000000, vermelho #ff0000, roxo #9d4edd)
- **Polling Ativo**: 
  - /api/apos e /api/sacar: 1s (atualização em tempo real)

### Backend (`server/`)
- **API Routes** (`server/routes.ts`): 
  - POST /api/vela - Recebe multiplicadores
  - GET /api/apos - Retorna última vela
  - GET /api/sacar - Previsão com algoritmo ML avançado
  - GET /api/historico - Últimas 50+ velas para gráfico
  - GET /api/estatisticas - Médias móveis, tendência, volatilidade, extremos
  - GET /api/padroes - Detecta 4 tipos de padrões favoráveis
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

## Algoritmo ML de Previsão Avançado

### Técnicas Implementadas (calcularPrevisao):
1. **Regressão Linear** (y = ax + b)
   - Calcula slope e intercept para detectar tendência linear
   - Fórmulas estatísticas: slope = (n×ΣXY - ΣX×ΣY) / (n×ΣX² - (ΣX)²)

2. **Média Móvel Exponencial (EMA)**
   - α = 0.3 (fator de suavização)
   - EMA[i] = α×valor[i] + (1-α)×EMA[i-1]
   - Maior peso para valores recentes

3. **Detecção de Volatilidade**
   - Calcula coeficiente de variação (CV = desvio_padrão / média)
   - Ajusta pesos dinamicamente baseado em volatilidade

4. **Ponderação Adaptativa**
   - Alta volatilidade (CV > 0.5): 30% linear + 70% EMA
   - Baixa volatilidade (CV < 0.2): 60% linear + 40% EMA
   - Volatilidade média: 40% linear + 60% EMA

5. **Ajustes por Padrões Recentes**
   - ≥3 velas baixas (<2x): +10% (espera recuperação)
   - ≥3 velas altas (>3x): -10% (espera correção)

6. **Limitação**: 1.2x a 10x, arredondado para 2 casas

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

1. **Usuário acessa** → Interface cyberpunk carrega
2. **Script no console** → Captura multiplicadores a cada 1s
3. **POST /api/vela** → Backend armazena no PostgreSQL
4. **Frontend polling** → Atualiza cards, gráfico e estatísticas
5. **Detecção de padrões** → Sistema monitora e notifica via toasts
6. **Algoritmo ML** → Calcula previsão usando regressão + EMA + padrões

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

## Estado Atual - COMPLETO
✅ PostgreSQL com Drizzle ORM (persistência)
✅ Frontend cyberpunk com 6 cards + gráfico
✅ Backend com 6 endpoints RESTful
✅ Algoritmo ML avançado (regressão + EMA + volatilidade)
✅ Sistema de estatísticas (médias móveis, tendência, volatilidade)
✅ Sistema de notificações (4 detectores de padrões)
✅ Script de captura automática
✅ Testes E2E validados
✅ Guards contra crashes (optional chaining, arrays vazios)
✅ CORS habilitado
