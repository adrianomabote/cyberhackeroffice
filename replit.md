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
  - Dialog appears every 2 minutes via `setInterval` (independent of user interaction)
  - Accepts numeric Apos and text Sacar (with letters allowed for marks like "L", "P", etc)
  - Stores data in `resultados_clientes` table with user_id (nullable for anonymous users)
  - Admin panel at `/admin/resultados-clientes` shows results grouped by user
  - API endpoints: POST/GET/DELETE at `/api/resultados-clientes` and `/api/resultados-clientes/lista`

### Feature Specifications
- **Real-time Signals Dashboard**: Displays predicted "APÓS" and "SACAR" values based on an advanced ML algorithm.
- **Opportunity Detection Algorithm**: Analyzes the last 50 candles for 10 favorable patterns, scoring them to recommend entry multipliers (2.00x, 3.00x, 4.00x, 6.00x, 10.00x).
- **Advanced Vela Analyzer** (NEW): Endpoint `/api/analisar-velas-cyber` analyzes the latest 10 velas automatically:
  - Detects 5 pattern types: Sequência de baixos, Última vela baixa, Tendência de recuperação, Sem altos extremos, Volatilidade controlada
  - Scores patterns with point-based system (0-9 points)
  - Returns entry opportunities with APENAS 2.00x, 4.00x, or 10.00x multipliers
  - Continuous polling at 1 second intervals from frontend
  - Returns: apos (last vela), sacar (recommended multiplier), sinal (ENTRAR/POSSÍVEL/AGUARDAR), confianca (alta/média/baixa), pontos, motivo
- **Statistics System**: Provides moving averages (MA5, MA10, MA20), trend analysis, volatility assessment, and extreme values.
- **Notification System**: Detects 4 types of patterns (Low Sequence, High Volatility, Strong Trend, Opportunity) and provides toast notifications with deduplication.
- **Manual Maintenance System**: Admin panel (`/admin/cyber`) to activate/deactivate maintenance mode with custom messages and enable/disable manual signal inputs.
- **Automatic Capture Script**: `aviator-script.js` captures multipliers every second and sends them to the backend, with protection against consecutive duplicates.
- **Schema Validation**: Zod schemas for all data inputs and outputs, defining models like Vela, HistoricoResponse, EstatisticasResponse, and PadroesResponse.
- **Client Results Collection**: Every 2 minutes, dialog asks for last winning trade (Apos + Sacar values). Data stored and displayable in admin panel with copy/delete functionality (with duplicate detection and visual badges).

## External Dependencies
- **PostgreSQL**: Relational database for data persistence.
- **Drizzle ORM**: Object-Relational Mapper for interacting with PostgreSQL.
- **Recharts**: JavaScript charting library for displaying graphs in the frontend.
- **Shadcn UI**: UI component library (e.g., Toast, Cards).
- **Lucide React**: Icon library for UI elements (Copy, Trash2, etc).
