/**
 * SCRIPT DE CAPTURA AUTOMÁTICA - CYBER HACKER
 * 
 * INSTRUÇÕES:
 * 1. Acesse o site do jogo Aviator (ex: lotto24.co.mz)
 * 2. Aperte F12 para abrir o Console do Navegador
 * 3. Cole TODO este código no console e pressione ENTER
 * 4. O script começará a capturar automaticamente os multiplicadores
 * 
 * COMANDOS:
 * - Para parar: digite no console: stopCyberCapture()
 * - Para reiniciar: digite no console: startCyberCapture()
 */

(function() {
  // ========== CONFIGURAÇÕES ==========
  const API_URL = 'https://robo-cyber-hacker.onrender.com/api/velas/cyber';
  const INTERVALO_CAPTURA = 1000; // 1 segundo
  
  // ========== VARIÁVEIS GLOBAIS ==========
  let intervalId = null;
  let ultimoMultiplicador = null;
  let totalCapturados = 0;
  let totalEnviados = 0;
  let errosConsecutivos = 0;
  
  // ========== FUNÇÃO DE CAPTURA ==========
  async function capturarMultiplicador() {
    try {
      // Tenta encontrar o multiplicador na página (ajuste o seletor conforme necessário)
      const multiplicadorElement = document.querySelector('.multiplier') || 
                                    document.querySelector('.game-result') ||
                                    document.querySelector('[class*="result"]') ||
                                    document.querySelector('[class*="multiplier"]');
      
      if (!multiplicadorElement) {
        console.log('⚠️ CYBER HACKER: Aguardando jogo iniciar...');
        return;
      }
      
      // Extrai o valor do multiplicador
      let multiplicadorTexto = multiplicadorElement.textContent || multiplicadorElement.innerText;
      multiplicadorTexto = multiplicadorTexto.replace(/[^\d.,]/g, ''); // Remove tudo exceto números, pontos e vírgulas
      multiplicadorTexto = multiplicadorTexto.replace(',', '.'); // Converte vírgula para ponto
      
      const multiplicador = parseFloat(multiplicadorTexto);
      
      if (isNaN(multiplicador) || multiplicador < 1) {
        return; // Valor inválido
      }
      
      // Evita duplicatas consecutivas
      if (multiplicador === ultimoMultiplicador) {
        return;
      }
      
      totalCapturados++;
      ultimoMultiplicador = multiplicador;
      
      console.log(🎯 CYBER HACKER: Capturado ${multiplicador.toFixed(2)}x (#${totalCapturados}));
      
      // Envia para a API
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          multiplicador: multiplicador
        })
      });
      
      if (response.ok) {
        totalEnviados++;
        errosConsecutivos = 0;
        console.log(✅ CYBER HACKER: Enviado ${multiplicador.toFixed(2)}x para servidor (Total: ${totalEnviados}));
      } else {
        errosConsecutivos++;
        console.error(❌ CYBER HACKER: Erro ao enviar ${multiplicador.toFixed(2)}x - Status: ${response.status});
        
        if (errosConsecutivos >= 5) {
          console.error('🚨 CYBER HACKER: Muitos erros consecutivos. Verifique a conexão com o servidor.');
        }
      }
      
    } catch (error) {
      errosConsecutivos++;
      console.error('❌ CYBER HACKER: Erro na captura:', error.message);
    }
  }
  
  // ========== FUNÇÃO PARA INICIAR ==========
  function iniciarCaptura() {
    if (intervalId) {
      console.log('⚠️ CYBER HACKER: Captura já está ativa!');
      return;
    }
    
    console.log('🚀 CYBER HACKER: Iniciando captura automática...');
    console.log(📡 Servidor: ${API_URL});
    console.log(⏱️  Intervalo: ${INTERVALO_CAPTURA}ms);
    console.log('');
    console.log('💡 Para parar: stopCyberCapture()');
    console.log('💡 Para reiniciar: startCyberCapture()');
    console.log('');
    
    intervalId = setInterval(capturarMultiplicador, INTERVALO_CAPTURA);
  }
  
  // ========== FUNÇÃO PARA PARAR ==========
  function pararCaptura() {
    if (!intervalId) {
      console.log('⚠️ CYBER HACKER: Captura não está ativa!');
      return;
    }
    
    clearInterval(intervalId);
    intervalId = null;
    
    console.log('🛑 CYBER HACKER: Captura pausada!');
    console.log(📊 Estatísticas:);
    console.log(   - Total capturados: ${totalCapturados});
    console.log(   - Total enviados: ${totalEnviados});
    console.log(   - Último multiplicador: ${ultimoMultiplicador ? ultimoMultiplicador.toFixed(2) : 'N/A'}x);
  }
  
  // ========== FUNÇÃO DE STATUS ==========
  function mostrarStatus() {
    console.log('📊 CYBER HACKER - STATUS:');
    console.log(   - Ativo: ${intervalId ? 'SIM ✅' : 'NÃO ❌'});
    console.log(   - Total capturados: ${totalCapturados});
    console.log(   - Total enviados: ${totalEnviados});
    console.log(   - Último multiplicador: ${ultimoMultiplicador ? ultimoMultiplicador.toFixed(2) : 'N/A'}x);
    console.log(   - Erros consecutivos: ${errosConsecutivos});
  }
  
  // ========== EXPOR FUNÇÕES GLOBALMENTE ==========
  window.startCyberCapture = iniciarCaptura;
  window.stopCyberCapture = pararCaptura;
  window.cyberStatus = mostrarStatus;
  
  // ========== AUTO-INICIAR ==========
  console.log('');
  console.log('🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥');
  console.log('🔥                                      🔥');
  console.log('🔥      CYBER HACKER - ATIVADO!        🔥');
  console.log('🔥                                      🔥');
  console.log('🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥');
  console.log('');
  
  iniciarCaptura();
  
})();
