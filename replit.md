# Sistema de Análise Aviator - CYBER HACKER

## Visão Geral
Sistema completo de análise e previsão em tempo real do jogo Aviator com interface cyberpunk. Inclui frontend React, backend Node.js com API RESTful e script de captura automática para console do navegador.

## Estrutura do Projeto

### Frontend (`client/`)
- **Página Principal** (`client/src/pages/home.tsx`): Interface com design cyberpunk mostrando multiplicadores em tempo real
- **Design System**: Cores cyber hacker (preto, vermelho #ff0000, roxo #9d4edd)
- **Componentes**: Cards de multiplicadores com efeitos neon glow, iframe do jogo
- **Atualização**: Polling a cada 1 segundo para obter dados da API

### Backend (`server/`)
- **API Routes** (`server/routes.ts`): 
  - POST /api/vela - Recebe multiplicadores
  - GET /api/apos - Retorna última vela
  - GET /api/sacar - Retorna previsão baseada em análise
- **Storage** (`server/storage.ts`): In-memory storage com proteção contra duplicatas
- **CORS**: Habilitado para permitir chamadas cross-origin

### Script de Captura
- **aviator-script.js**: Script standalone para colar no console do Aviator
- **Funcionalidades**: 
  - Captura automática a cada 1 segundo
  - API_URL configurável
  - Proteção contra duplicatas consecutivas
  - Comandos de controle (stop/restart)

### Schema (`shared/schema.ts`)
- **Vela**: Modelo de dados para multiplicadores
- **Tipos**: InsertVela, Vela, UltimaVelaResponse, PrevisaoResponse
- **Validação**: Zod schemas para validação de entrada

## Sistema de Previsão
Analisa últimas 10 velas para calcular próximo multiplicador:
1. Calcula média dos multiplicadores
2. Detecta tendência (alta/baixa)
3. Ajusta previsão baseado na tendência
4. Limita valores entre 1.2x e 10x

## Como Funciona

1. **Usuário acessa a interface** → Vê cabeçalho CYBER HACKER e dois cards de multiplicadores
2. **Script de captura rodando no console** → Captura multiplicadores do jogo a cada segundo
3. **Script envia para API** → POST /api/vela com multiplicador
4. **Backend armazena** → Mantém últimas 100 velas em memória
5. **Frontend consulta** → GET /api/apos e /api/sacar a cada segundo
6. **Interface atualiza** → Mostra "DEPOIS DE:" (última vela) e "TIRAR NO:" (previsão)

## Tecnologias
- React + TypeScript + Tailwind CSS
- Express.js + Node.js
- TanStack Query (React Query)
- In-memory storage (MemStorage)
- Fonts: Orbitron (display), Rajdhani (cyber), Roboto Mono (code)

## Porta
Servidor roda na porta 5000 conforme requisito do usuário.

## Estado Atual
✅ Schema definido
✅ Frontend implementado com design cyberpunk
✅ Backend API completo com 3 endpoints
✅ Sistema de previsão implementado
✅ Script de captura automática criado
✅ CORS habilitado
✅ Documentação completa (README.md)
