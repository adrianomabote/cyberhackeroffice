# Sistema de Análise Aviator - CYBER HACKER

## Overview
This project is a comprehensive, real-time analysis and prediction system for the Aviator game, featuring a professional cyberpunk interface. It includes a landing page, user authentication (login/signup), a React-based frontend displaying real-time signals, a Node.js API, PostgreSQL for data persistence, an advanced machine learning algorithm for predictions, a notification system, and an automatic data capture script. The vision is to provide a tool that helps users dominate the Aviator game with high accuracy, targeting a wide market with its advanced AI capabilities.

## User Preferences
Not specified in the original document. The AI should infer these preferences based on the content provided: The user values a professional, high-tech aesthetic, real-time performance, and a robust system with advanced analytical capabilities. The user also prioritizes code protection and a seamless user experience.

## System Architecture

### UI/UX Decisions
- **Overall Aesthetic**: Cyberpunk theme with a focus on dark backgrounds and neon accents (red, cyan, purple, pink).
- **Landing Page**: Professional dark red theme (red-700/800/900) without glow effects, featuring a sticky header, hero section with AI badge, statistics, "What it is" explanation, benefits, "How it Works" section with demonstrative videos, and a final CTA.
- **Splash Screen**: "ROBÔ CYBERHACKER" in red neon, processing animation, animated loading bar (3 seconds duration, shown once per session).
- **Login/Signup Pages**: Design consistent with the landing page's dark red theme, including a hacker image and "CyberHacker" logo.
- **Dashboard**: Minimalist cyberpunk interface with dynamic colors for multipliers (cyan for 1.00x-1.99x, purple for 2.00x-9.99x, vibrant pink for 10.00x+). Features a intelligent card system with cooldown, showing "APÓS" (after) and "SACAR" (cash out) values simultaneously only when an opportunity is detected. Visual pulse effect on value updates.
- **Maintenance Screen**: Cyberpunk design matching the app, displaying a custom message and fixed reason during maintenance.
- **Asset Management**: Optimized video delivery from the `public` folder to reduce bundle size.
- **Design System**: Distinct color palettes for the dashboard (cyber hacker colors) and landing/auth pages (professional dark red without glow).
- **Client Results Dialog**: Appears every 2 minutes asking "Nos diz: qual é a última entrada que pegou?" with Apos/Sacar input fields. Preto com borda cinza 1px, arredondado, sem highlighting roxo ao focar, centralizado no meio da tela.
- **Admin Results Panel**: Shows Apos (branco), Sacar (vermelho), botões para copiar cada valor, botão de deletar resultado, data/hora do registro.

### Technical Implementations
- **Frontend**: React, TypeScript, Tailwind CSS, TanStack Query, Recharts for graphs, Shadcn UI for components (Toast, Cards).
- **Backend**: Express.js, Node.js, running on port 5000.
- **Database**: PostgreSQL with Drizzle ORM for data persistence (tables: 'velas', 'resultados_clientes').
- **Real-time Updates**: Active polling every 1 second for `/api/apos/cyber` and `/api/sacar/cyber`.
- **Authentication**: Session-based authentication protecting routes like `/app` and `/welcome`, with `isAuthenticated()`, `getUser()`, and `logout()` utilities.
- **Code Protection**: 12 layers of security including disabling right-click, text selection, DevTools keys, view source, save/print, copy/cut, anti-selection CSS, and meta tags (`noindex`, `no-cache`). Production builds are minified and obfuscated.
- **Error Handling**: Guards against crashes using optional chaining and handling empty arrays.
- **Client Results System**: 
  - **Dialog Timing Logic** (UPDATED Nov 2025):
    - **First appearance**: 15 minutes after page load
    - **If user clicks "Depois" (dismiss)**: Re-appears every 10 minutes
    - **If user submits result**: Re-appears after 7 hours
    - **After reload**: Calculates remaining time based on localStorage timestamps
    - Implementation uses `useRef` for stable timer management with explicit cleanup
  - Accepts numeric Apos (min 9 digits) and text Sacar (exactly 4 characters, letters allowed)
  - Stores data in `resultados_clientes` table with user_id (nullable for anonymous users)
  - Admin panel at `/admin/resultados-clientes` shows results grouped by user with copy/delete functionality
  - API endpoints: POST/GET/DELETE at `/api/resultados-clientes` and `/api/resultados-clientes/lista`
  - Duplicate detection system shows visual badges for repeated entries

### Feature Specifications
- **Real-time Signals Dashboard**: Displays predicted "APÓS" and "SACAR" values based on an advanced pattern detection system.
- **Advanced Pattern Detection System** (UPDATED): Sistema de análise em duas camadas:
  
  **Camada 1 - Padrões Pré-Definidos (9 padrões com tolerância)**:
  - **Padrões 2x** (2 padrões): "Alternância Leve" [1.5, 2.1, 1.6, 2.5], "Subida Lenta" [1.1, 1.3, 1.6, 2.0]
  - **Padrões 3x** (3 padrões): "Pré-Pico Médio" [1.3, 1.4, 1.6, 3.2], "Ciclo Médio" [2.0, 1.8, 2.5, 1.4], "Repetição Média" [2.2, 1.5, 2.0, 1.4]
  - **Padrões 10x** (4 padrões): "Sequência Fria Longa" [1.2, 1.4, 1.05, 1.7, 1.3], "Frio Longo" [1.1, 1.3, 1.2, 1.4, 1.5], "Aquecimento Alto" [1.5, 2.0, 2.8, 1.9]
  - Cada padrão tem tolerância configurável (0.3-0.5) para flexibilidade na detecção
  - Sistema compara últimas N velas com sequências pré-definidas usando matching com tolerância
  
  **Camada 2 - Análise Estatística Fallback (6 padrões)**:
  Quando nenhum padrão pré-definido é detectado, usa análise estatística:
  - **Padrão 1**: 10.00x - 4 velas altas (≥4.0x) + crescente forte + média ≥5.0x + sem baixas
  - **Padrão 2**: 3.00x - Alta volatilidade (>3.0) + velas médio-altas + média 2.5-5.0x
  - **Padrão 3**: 2.00x - 3+ velas baixas + média <2.0x (recuperação esperada)
  - **Padrão 4**: 2.00x - Média baixa <2.0x + 2+ velas baixas
  - **Padrão 5**: 3.00x - Sequência crescente + média 2.5-5.0x + sem baixas
  - **Padrão 6**: 2.00x - Recuperação após período baixo
  
  **Proteções**:
  - Bloqueio automático quando 5+ velas baixas consecutivas (aguarda recuperação)
  - Logs detalhados de cada padrão detectado no console do servidor
  - Retorna apenas 2.00x, 3.00x ou 10.00x (sem valores intermediários)
  - Endpoint: `/api/sacar/cyber` analisa últimas 20 velas
  - Returns: multiplicador, sinal (ENTRAR/POSSÍVEL/AGUARDAR), confianca (alta/média/baixa), motivo
- **Statistics System**: Provides moving averages (MA5, MA10, MA20), trend analysis, volatility assessment, and extreme values.
- **Notification System**: Detects 4 types of patterns (Low Sequence, High Volatility, Strong Trend, Opportunity) and provides toast notifications with deduplication.
- **Manual Maintenance System**: Admin panel (`/admin/cyber`) to activate/deactivate maintenance mode with custom messages and enable/disable manual signal inputs.
- **Automatic Capture Script**: `aviator-script.js` captures multipliers every second and sends them to the backend, with protection against consecutive duplicates.
- **Schema Validation**: Zod schemas for all data inputs and outputs, defining models like Vela, HistoricoResponse, EstatisticasResponse, and PadroesResponse.
- **Client Results Collection**: Dialog timing: 15min (first), 10min (dismissed), 7hr (after submit). Asks for last winning trade (Apos + Sacar values). Data stored and displayable in admin panel with copy/delete functionality (with duplicate detection and visual badges).

### Signal Protection System (UPDATED Nov 2025 - PROTEÇÃO CRÍTICA REFORÇADA)
- **🔒 PROTEÇÃO ABSOLUTA contra Entradas Consecutivas**: Sistema NUNCA permite dois sinais "ENTRAR" seguidos
  - **Persistência em banco de dados**: Estado salvo na tabela `sinais_protecao` (sobrevive restarts do servidor)
  - **Transações com lock**: Usa `FOR UPDATE` lock para prevenir race conditions em requisições simultâneas
  - **Validação de vela**: Rejeita registro se não houver vela válida (previne proteção desabilitada por null)
  - **Mínimo de 2 velas**: Sistema só permite novo "ENTRAR" após pelo menos 2 velas novas serem registradas
  - **Conversão automática**: Sinais "ENTRAR" bloqueados são convertidos para "AGUARDAR" com motivo explicativo
  - **Independente do diálogo**: Proteção funciona de forma automática, SEM dependência do diálogo de resultados
- **Implementação robusta em 3 camadas**:
  1. Tabela `sinais_protecao` - armazena timestamp da vela do último ENTRAR (singleton: 1 registro com id='ultima_entrada')
  2. `registerEntraSignal()` - valida vela existe, faz UPSERT no banco com timestamp
  3. `canSendEntraSignal()` - transação com lock, conta velas novas, mínimo 2 velas
  4. GET `/api/sacar/cyber` - verifica antes de retornar "ENTRAR", bloqueia e converte se necessário
- **Proteção contra falhas críticas**:
  - ✅ Servidor restart não perde estado (salvo no banco)
  - ✅ Race conditions bloqueadas (transação + row lock)
  - ✅ Null timestamp não desabilita proteção (validação obrigatória)
- **Logs detalhados**: Todos os bloqueios, registros e liberações são logados no console do servidor com contagem de velas

## External Dependencies
- **PostgreSQL**: Relational database for data persistence.
- **Drizzle ORM**: Object-Relational Mapper for interacting with PostgreSQL.
- **Recharts**: JavaScript charting library for displaying graphs in the frontend.
- **Shadcn UI**: UI component library (e.g., Toast, Cards).
- **Lucide React**: Icon library for UI elements (Copy, Trash2, etc).
