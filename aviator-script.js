(function() {
  'use strict';

  const API_URL = 'https://robo-cyber-hacker.replit.app';
  const CAPTURE_INTERVAL = 1000;

  let captureInterval = null;
  let ultimoMultiplicador = null;
  let tentativasErro = 0;
  const MAX_TENTATIVAS_ERRO = 5;

  console.log('%c🚀 CYBER HACKER - Aviator Script Iniciado', 'color: #9d4edd; font-size: 16px; font-weight: bold;');
  console.log('%cAPI URL:', 'color: #ff0000; font-weight: bold;', API_URL);
  console.log('%cIntervalo de captura:', 'color: #ff0000; font-weight: bold;', CAPTURE_INTERVAL + 'ms');
  console.log('');

  function capturarMultiplicador() {
    try {
      let elementoMultiplicador = document.querySelector('.game-multiplier');

      if (!elementoMultiplicador) {
        elementoMultiplicador = document.querySelector('#multiplier');
      }

      if (!elementoMultiplicador) {
        elementoMultiplicador = document.querySelector('[data-multiplier]');
      }

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
        tentativasErro = 0;
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

  function executarCaptura() {
    const multiplicador = capturarMultiplicador();

    if (multiplicador !== null) {
      if (multiplicador !== ultimoMultiplicador) {
        enviarMultiplicador(multiplicador);
        ultimoMultiplicador = multiplicador;
      }
    } else {
      if (Math.random() < 0.1) {
        console.log('%c⏳ Aguardando multiplicador visível...', 'color: #9d4edd;');
      }
    }
  }

  function iniciarCaptura() {
    if (captureInterval) {
      console.warn('⚠ Captura já está em execução');
      return;
    }

    console.log('%c▶ Iniciando captura automática...', 'color: #00ff00; font-size: 14px;');
    executarCaptura();
    captureInterval = setInterval(executarCaptura, CAPTURE_INTERVAL);
    console.log('%c✓ Captura ativa! Para parar, execute: stopAviatorCapture()', 'color: #00ff00;');
  }

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

  window.restartAviatorCapture = function() {
    stopAviatorCapture();
    setTimeout(iniciarCaptura, 1000);
  };
  
  iniciarCaptura();

  console.log('');
  console.log('%c═══════════════════════════════════════', 'color: #9d4edd;');
  console.log('%cCOMANDOS DISPONÍVEIS:', 'color: #9d4edd; font-weight: bold;');
  console.log('%c  stopAviatorCapture()', 'color: #ffffff;', '- Para a captura');
  console.log('%c  restartAviatorCapture()', 'color: #ffffff;', '- Reinicia a captura');
  console.log('%c═══════════════════════════════════════', 'color: #9d4edd;');
  console.log('');

})();