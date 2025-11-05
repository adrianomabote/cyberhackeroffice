/**
 * AVIATOR SCRIPT - Captura automática de multiplicadores
 * 
 * INSTRUÇÕES DE USO:
 * 1. Abra o jogo Aviator no navegador
 * 2. Abra o console do navegador (F12 ou Ctrl+Shift+J)
 * 3. Cole este script completo no console
 * 4. Pressione Enter para executar
 * 5. O script começará a capturar multiplicadores automaticamente
 * 
 * Para parar o script: Execute stopAviatorCapture() no console
 */

(function() {
  'use strict';

  // ============ CONFIGURAÇÃO ============
  // URL do servidor CYBER HACKER
  const API_URL = 'https://robo-cyber-hacker.replit.app';
  
  // Intervalo de captura em milissegundos (1000ms = 1 segundo)
  const CAPTURE_INTERVAL = 1000;
  
  // ======================================

  let captureInterval = null;
  let ultimoMultiplicador = null;
  let tentativasErro = 0;
  const MAX_TENTATIVAS_ERRO = 5;

  console.log('%c🚀 CYBER HACKER - Aviator Script Iniciado', 'color: #9d4edd; font-size: 16px; font-weight: bold;');
  console.log('%cAPI URL:', 'color: #ff0000; font-weight: bold;', API_URL);
  console.log('%cIntervalo de captura:', 'color: #ff0000; font-weight: bold;', CAPTURE_INTERVAL + 'ms');
  console.log('');

  /**
   * Função para tentar capturar o multiplicador atual do jogo
   * Esta função precisa ser adaptada para o seletor correto do site do Aviator
   */
  function capturarMultiplicador() {
    try {
      // MÉTODO 1: Tentar encontrar por seletores comuns do Aviator
      // Adapte estes seletores conforme necessário para o site específico
      
      // Tentativa 1: Procurar por classe comum de multiplicador
      let elementoMultiplicador = document.querySelector('.game-multiplier');
      
      // Tentativa 2: Procurar por ID
      if (!elementoMultiplicador) {
        elementoMultiplicador = document.querySelector('#multiplier');
      }
      
      // Tentativa 3: Procurar por data-attribute
      if (!elementoMultiplicador) {
        elementoMultiplicador = document.querySelector('[data-multiplier]');
      }
      
      // Tentativa 4: Procurar por texto que contenha "x"
      if (!elementoMultiplicador) {
        const elementos = document.querySelectorAll('div, span, p');
        for (let el of elementos) {
          const texto = el.textContent?.trim() || '';
          if (/^\d+\.\d+x$/.test(texto)) {
            elementoMultiplicador = el;
            break;
          }
        }
      }

      if (elementoMultiplicador) {
        const texto = elementoMultiplicador.textContent?.trim() || '';
        
        // Extrair número do formato "X.XXx"
        const match = texto.match(/(\d+\.?\d*)/);
        if (match) {
          const multiplicador = parseFloat(match[1]);
          
          if (multiplicador && multiplicador >= 1) {
            return multiplicador;
          }
        }
      }
      
      return null;
    } catch (error) {
      console.error('Erro ao capturar multiplicador:', error);
      return null;
    }
  }

  /**
   * Envia o multiplicador para a API
   */
  async function enviarMultiplicador(multiplicador) {
    try {
      const response = await fetch(`${API_URL}/api/velas/cyber`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          multiplicador: multiplicador
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        console.log('%c✓ Multiplicador enviado:', 'color: #00ff00;', multiplicador + 'x');
        tentativasErro = 0; // Resetar contador de erros
        return true;
      } else {
        console.warn('⚠ Resposta da API indica falha:', data);
        return false;
      }
    } catch (error) {
      tentativasErro++;
      console.error(`❌ Erro ao enviar para API (${tentativasErro}/${MAX_TENTATIVAS_ERRO}):`, error);
      
      if (tentativasErro >= MAX_TENTATIVAS_ERRO) {
        console.error('%c🛑 Muitos erros consecutivos. Parando captura.', 'color: red; font-size: 14px;');
        console.error('%cVerifique se o servidor está rodando em:', 'color: red;', API_URL);
        stopAviatorCapture();
      }
      
      return false;
    }
  }

  /**
   * Função principal de captura
   */
  function executarCaptura() {
    const multiplicador = capturarMultiplicador();
    
    if (multiplicador !== null) {
      // Evitar duplicatas consecutivas
      if (multiplicador !== ultimoMultiplicador) {
        enviarMultiplicador(multiplicador);
        ultimoMultiplicador = multiplicador;
      }
    } else {
      // Só mostrar mensagem a cada 10 tentativas para não poluir o console
      if (Math.random() < 0.1) {
        console.log('%c⏳ Aguardando multiplicador visível...', 'color: #9d4edd;');
      }
    }
  }

  /**
   * Inicia a captura automática
   */
  function iniciarCaptura() {
    if (captureInterval) {
      console.warn('⚠ Captura já está em execução');
      return;
    }

    console.log('%c▶ Iniciando captura automática...', 'color: #00ff00; font-size: 14px;');
    
    // Executar imediatamente
    executarCaptura();
    
    // Continuar executando no intervalo definido
    captureInterval = setInterval(executarCaptura, CAPTURE_INTERVAL);
    
    console.log('%c✓ Captura ativa! Para parar, execute: stopAviatorCapture()', 'color: #00ff00;');
  }

  /**
   * Para a captura automática
   */
  window.stopAviatorCapture = function() {
    if (captureInterval) {
      clearInterval(captureInterval);
      captureInterval = null;
      ultimoMultiplicador = null;
      tentativasErro = 0;
      console.log('%c⏸ Captura parada', 'color: #ff0000; font-size: 14px;');
    } else {
      console.log('%c⚠ Captura não está em execução', 'color: #ffaa00;');
    }
  };

  /**
   * Função para reiniciar a captura
   */
  window.restartAviatorCapture = function() {
    stopAviatorCapture();
    setTimeout(iniciarCaptura, 1000);
  };

  // Iniciar automaticamente
  iniciarCaptura();

  // Instruções no console
  console.log('');
  console.log('%c═══════════════════════════════════════', 'color: #9d4edd;');
  console.log('%cCOMANDOS DISPONÍVEIS:', 'color: #9d4edd; font-weight: bold;');
  console.log('%c  stopAviatorCapture()', 'color: #ffffff;', '- Para a captura');
  console.log('%c  restartAviatorCapture()', 'color: #ffffff;', '- Reinicia a captura');
  console.log('%c═══════════════════════════════════════', 'color: #9d4edd;');
  console.log('');

  // Adicionar aviso sobre seletores
  console.log('%c⚠ IMPORTANTE:', 'color: #ff0000; font-weight: bold;');
  console.log('%cSe os multiplicadores não estão sendo capturados,', 'color: #ffaa00;');
  console.log('%cvocê pode precisar ajustar os seletores no script', 'color: #ffaa00;');
  console.log('%cpara corresponder à estrutura HTML do site do Aviator.', 'color: #ffaa00;');
  console.log('');

})();
