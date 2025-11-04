# 🎮 CYBER HACKER - Sistema de Análise Aviator

Sistema de análise e previsão em tempo real do jogo Aviator com interface cyberpunk.

## 📋 Características

- **Interface Cyberpunk**: Design preto com elementos neon em vermelho e roxo (#9d4edd)
- **Análise em Tempo Real**: Monitora multiplicadores automaticamente a cada segundo
- **Sistema de Previsão**: Calcula próximo multiplicador baseado nas últimas 10 velas
- **Captura Automática**: Script JavaScript para colar no console e capturar dados automaticamente
- **API RESTful**: Endpoints para receber e consultar multiplicadores

## 🚀 Como Usar

### 1. Iniciar o Servidor

O servidor roda automaticamente na porta 5000:

```bash
npm run dev
```

### 2. Acessar a Interface

Abra o navegador e acesse:
```
http://localhost:5000
```

### 3. Configurar Captura Automática

1. Abra o jogo Aviator no iframe da aplicação ou em outra aba
2. Abra o console do navegador (F12 ou Ctrl+Shift+J)
3. Copie todo o conteúdo do arquivo `aviator-script.js`
4. Cole no console e pressione Enter
5. O script começará a capturar multiplicadores automaticamente

#### Comandos do Console:

- `stopAviatorCapture()` - Para a captura
- `restartAviatorCapture()` - Reinicia a captura

## 📡 API Endpoints

### POST /api/vela
Recebe um novo multiplicador do Aviator.

**Request Body:**
```json
{
  "multiplicador": 2.45
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "multiplicador": 2.45,
    "timestamp": "2025-01-04T12:00:00.000Z"
  }
}
```

### GET /api/apos
Retorna a última vela registrada (usado para "DEPOIS DE:").

**Response:**
```json
{
  "multiplicador": 2.45,
  "timestamp": "2025-01-04T12:00:00.000Z"
}
```

### GET /api/sacar
Retorna a previsão do próximo multiplicador baseada nas últimas 10 velas (usado para "TIRAR NO:").

**Response:**
```json
{
  "multiplicador": 3.20,
  "confianca": "alta"
}
```

Níveis de confiança:
- `alta`: 10 ou mais velas analisadas
- `média`: 5 a 9 velas analisadas
- `baixa`: menos de 5 velas analisadas

## 🧠 Como Funciona a Previsão

O sistema analisa as últimas 10 velas e calcula:

1. **Média dos multiplicadores**: Valor médio das últimas rodadas
2. **Tendência**: Compara primeira metade vs segunda metade das velas
3. **Ajuste inteligente**:
   - Se tendência de alta: média + 20%
   - Se tendência de baixa: média - 10%
4. **Limites**: Mantém previsão entre 1.2x e 10x

## 🔧 Tecnologias

- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express
- **Armazenamento**: In-memory (últimas 100 velas)
- **Fonts**: Orbitron, Rajdhani, Roboto Mono
- **Design**: Cyberpunk/Hacker aesthetic

## ⚙️ Configuração do Script

Para alterar a URL da API no script de captura, edite a linha no `aviator-script.js`:

```javascript
const API_URL = window.location.origin; // Altere conforme necessário
```

Para alterar o intervalo de captura (padrão 1 segundo):

```javascript
const CAPTURE_INTERVAL = 1000; // Em milissegundos
```

## 🔒 CORS

O servidor já está configurado com CORS habilitado para aceitar requisições de qualquer origem, permitindo que o script funcione mesmo quando executado em páginas externas.

## 📝 Proteção contra Duplicatas

O sistema automaticamente evita registrar multiplicadores duplicados consecutivos, tanto no backend quanto no script de captura.

## 🎨 Paleta de Cores

- **Fundo**: `#000000` (Preto)
- **Header/Destaque**: `#ff0000` (Vermelho)
- **Multiplicadores**: `#9d4edd` (Roxo)
- **Texto**: `#ffffff` (Branco)
- **Containers**: `#1a1a1a/80` (Cinza escuro semi-transparente)

## 📱 Responsivo

A interface é totalmente responsiva e funciona em desktop, tablet e mobile.

## 🐛 Solução de Problemas

### Multiplicadores não aparecem:
1. Verifique se o servidor está rodando
2. Abra o console para ver mensagens de erro
3. Verifique se o script foi colado corretamente

### Script não captura multiplicadores:
O script tenta vários seletores diferentes. Se não funcionar, você pode precisar:
1. Inspecionar o HTML do jogo Aviator
2. Ajustar os seletores no `aviator-script.js`
3. Modificar a função `capturarMultiplicador()`

### Erro de CORS:
Se houver erros de CORS, verifique que o servidor está rodando e acessível na URL configurada no script.

## 📄 Licença

Este projeto é fornecido como está, para fins educacionais.
