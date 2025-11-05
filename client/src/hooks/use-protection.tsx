import { useEffect } from 'react';

const BLOCKED_KEY = 'cyber_blocked';
const BLOCKED_TIMESTAMP = 'cyber_blocked_time';

export function useProtection() {
  useEffect(() => {
    // Verificar se já está bloqueado
    const checkIfBlocked = () => {
      try {
        const isBlocked = localStorage.getItem(BLOCKED_KEY);
        const blockedTime = localStorage.getItem(BLOCKED_TIMESTAMP);
        
        if (isBlocked === 'true') {
          showBlockedScreen(blockedTime);
          return true;
        }
      } catch (e) {
        // Se não conseguir acessar localStorage (navegação privada), PERMITE acesso
        // mas continua com proteções ativas
        return false;
      }
      return false;
    };

    // Mostrar tela de bloqueio permanente
    const showBlockedScreen = (timestamp: string | null) => {
      const time = timestamp ? new Date(timestamp).toLocaleString('pt-BR') : 'Desconhecido';
      document.body.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; background: #000; color: #ff0000; font-family: monospace; padding: 2rem; text-align: center;">
          <div style="font-size: 3rem; font-weight: bold; margin-bottom: 2rem; text-shadow: 0 0 20px #ff0000;">
            🚫 ACESSO BLOQUEADO PERMANENTEMENTE 🚫
          </div>
          <div style="font-size: 1.5rem; margin-bottom: 1rem; color: #ffffff;">
            Uso de ferramentas de hacking detectado
          </div>
          <div style="font-size: 1rem; color: #888888;">
            Bloqueado em: ${time}
          </div>
          <div style="font-size: 1rem; margin-top: 2rem; color: #888888;">
            Este dispositivo foi marcado como suspeito
          </div>
          <div style="font-size: 0.875rem; margin-top: 1rem; color: #444444;">
            ID: ${Math.random().toString(36).substring(7).toUpperCase()}
          </div>
        </div>
      `;
    };

    // Bloquear usuário permanentemente
    const blockUser = (reason: string) => {
      try {
        const timestamp = new Date().toISOString();
        localStorage.setItem(BLOCKED_KEY, 'true');
        localStorage.setItem(BLOCKED_TIMESTAMP, timestamp);
        localStorage.setItem('cyber_block_reason', reason);
        
        // Tenta enviar alerta ao servidor (opcional)
        fetch('/api/security-alert', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            reason, 
            timestamp,
            userAgent: navigator.userAgent 
          })
        }).catch(() => {});
        
      } catch (e) {
        // Continua bloqueio mesmo se falhar
      }
      
      showBlockedScreen(new Date().toISOString());
    };

    // Verificar se já está bloqueado antes de tudo
    if (checkIfBlocked()) {
      return; // Para aqui se já bloqueado
    }

    // 1. Debugger Trap - Detecta debugger ativo
    const debuggerTrap = () => {
      const start = performance.now();
      debugger; // Se debugger estiver aberto, vai pausar aqui
      const end = performance.now();
      
      // Se demorou mais de 100ms, debugger estava aberto
      if (end - start > 100) {
        blockUser('Debugger detectado');
      }
    };

    // 2. Timing Attack - Detecta se código está sendo desacelerado
    let lastTime = Date.now();
    const timingCheck = () => {
      const currentTime = Date.now();
      const diff = currentTime - lastTime;
      
      // Se passou MUITO tempo (mais de 5 segundos), algo está errado
      // Aumentado para evitar falsos positivos (usuário mudou de aba, etc)
      if (diff > 5000) {
        blockUser('Timing anormal detectado - possível debugging');
      }
      
      lastTime = currentTime;
    };

    // 3. Console Access Detection
    const detectConsoleAccess = () => {
      const devtools = /./;
      devtools.toString = function() {
        blockUser('Acesso ao console detectado');
        return '';
      };
      console.log('%c', devtools);
    };

    // 4. Detect DevTools by size
    const detectDevTools = () => {
      const threshold = 160;
      const widthThreshold = window.outerWidth - window.innerWidth > threshold;
      const heightThreshold = window.outerHeight - window.innerHeight > threshold;
      
      if (widthThreshold || heightThreshold) {
        blockUser('DevTools aberto detectado');
      }
    };

    // 5. Detect Firebug
    const detectFirebug = () => {
      if ((window as any).console && (window as any).console.firebug) {
        blockUser('Firebug detectado');
      }
    };

    // 6. Detect Chrome DevTools
    const detectChromeDevTools = () => {
      if ((window as any).chrome && (window as any).chrome.runtime) {
        const element = new Image();
        Object.defineProperty(element, 'id', {
          get: function() {
            blockUser('Chrome DevTools detectado');
          }
        });
        console.log(element);
      }
    };

    // 7. Function tampering detection
    const originalStringify = JSON.stringify;
    const originalParse = JSON.parse;
    
    const checkTampering = () => {
      if (JSON.stringify !== originalStringify || JSON.parse !== originalParse) {
        blockUser('Modificação de código detectada');
      }
    };

    // Desabilitar clique direito (SEM bloquear permanentemente)
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // Desabilitar seleção de texto
    const handleSelectStart = (e: Event) => {
      e.preventDefault();
      return false;
    };

    // Desabilitar teclas de atalho do DevTools
    const handleKeyDown = (e: KeyboardEvent) => {
      // F12
      if (e.key === 'F12') {
        e.preventDefault();
        blockUser('Tentativa de abrir DevTools (F12)');
        return false;
      }
      
      // Ctrl+Shift+I (DevTools)
      if (e.ctrlKey && e.shiftKey && e.key === 'I') {
        e.preventDefault();
        blockUser('Tentativa de abrir DevTools (Ctrl+Shift+I)');
        return false;
      }
      
      // Ctrl+Shift+J (Console)
      if (e.ctrlKey && e.shiftKey && e.key === 'J') {
        e.preventDefault();
        blockUser('Tentativa de abrir Console (Ctrl+Shift+J)');
        return false;
      }
      
      // Ctrl+Shift+C (Inspect)
      if (e.ctrlKey && e.shiftKey && e.key === 'C') {
        e.preventDefault();
        blockUser('Tentativa de Inspecionar (Ctrl+Shift+C)');
        return false;
      }
      
      // Ctrl+U (View Source)
      if (e.ctrlKey && e.key === 'u') {
        e.preventDefault();
        blockUser('Tentativa de ver código fonte (Ctrl+U)');
        return false;
      }
      
      // Outras teclas bloqueadas
      if (e.ctrlKey && ['s', 'a', 'c', 'x', 'p'].includes(e.key)) {
        e.preventDefault();
        return false;
      }
    };

    // Desabilitar drag de imagens
    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
      return false;
    };

    // Desabilitar console
    const disableConsole = () => {
      (function() {
        try {
          const noop = () => {};
          const methods = ['log', 'debug', 'info', 'warn', 'error', 'assert', 'dir', 'clear', 'trace'];
          methods.forEach(method => {
            (console as any)[method] = noop;
          });
        } catch (e) {
          blockUser('Tentativa de acessar console');
        }
      })();
    };

    // Adicionar listeners
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('selectstart', handleSelectStart);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('dragstart', handleDragStart);
    
    // Desabilitar console
    disableConsole();
    
    // Executar verificações periódicas (intervalos otimizados para performance)
    const intervals: NodeJS.Timeout[] = [];
    intervals.push(setInterval(debuggerTrap, 3000));      // Reduzido de 2s para 3s
    intervals.push(setInterval(timingCheck, 2000));       // Reduzido de 1s para 2s
    intervals.push(setInterval(detectDevTools, 2000));    // Reduzido de 1s para 2s
    intervals.push(setInterval(detectFirebug, 5000));     // Reduzido de 3s para 5s
    intervals.push(setInterval(detectChromeDevTools, 5000)); // Reduzido de 3s para 5s
    intervals.push(setInterval(checkTampering, 4000));    // Reduzido de 2s para 4s
    intervals.push(setInterval(detectConsoleAccess, 10000)); // Reduzido de 5s para 10s

    // Adicionar CSS para prevenir seleção
    const style = document.createElement('style');
    style.textContent = `
      * {
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
        user-select: none !important;
        -webkit-touch-callout: none !important;
      }
      
      input, textarea {
        -webkit-user-select: text !important;
        -moz-user-select: text !important;
        -ms-user-select: text !important;
        user-select: text !important;
      }
      
      img {
        pointer-events: none !important;
        -webkit-user-drag: none !important;
        -moz-user-drag: none !important;
        user-drag: none !important;
      }
    `;
    document.head.appendChild(style);

    // Limpar listeners ao desmontar
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('selectstart', handleSelectStart);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('dragstart', handleDragStart);
      intervals.forEach(interval => clearInterval(interval));
      if (style.parentNode) {
        style.parentNode.removeChild(style);
      }
    };
  }, []);
}
