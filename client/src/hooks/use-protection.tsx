import { useEffect } from 'react';

export function useProtection() {
  useEffect(() => {
    // Desabilitar clique direito
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
        return false;
      }
      
      // Ctrl+Shift+I (DevTools)
      if (e.ctrlKey && e.shiftKey && e.key === 'I') {
        e.preventDefault();
        return false;
      }
      
      // Ctrl+Shift+J (Console)
      if (e.ctrlKey && e.shiftKey && e.key === 'J') {
        e.preventDefault();
        return false;
      }
      
      // Ctrl+Shift+C (Inspect)
      if (e.ctrlKey && e.shiftKey && e.key === 'C') {
        e.preventDefault();
        return false;
      }
      
      // Ctrl+U (View Source)
      if (e.ctrlKey && e.key === 'u') {
        e.preventDefault();
        return false;
      }
      
      // Ctrl+S (Save)
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        return false;
      }
      
      // Ctrl+A (Select All)
      if (e.ctrlKey && e.key === 'a') {
        e.preventDefault();
        return false;
      }
      
      // Ctrl+C (Copy)
      if (e.ctrlKey && e.key === 'c') {
        e.preventDefault();
        return false;
      }
      
      // Ctrl+X (Cut)
      if (e.ctrlKey && e.key === 'x') {
        e.preventDefault();
        return false;
      }
      
      // Ctrl+P (Print)
      if (e.ctrlKey && e.key === 'p') {
        e.preventDefault();
        return false;
      }
    };

    // Desabilitar drag de imagens
    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
      return false;
    };

    // Detectar DevTools aberto
    const detectDevTools = () => {
      const threshold = 160;
      const widthThreshold = window.outerWidth - window.innerWidth > threshold;
      const heightThreshold = window.outerHeight - window.innerHeight > threshold;
      
      if (widthThreshold || heightThreshold) {
        document.body.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; height: 100vh; background: #000; color: #ff0000; font-size: 2rem; font-family: monospace;">ACESSO NEGADO</div>';
      }
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
          // Silently fail
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
    
    // Verificar DevTools periodicamente
    const interval = setInterval(detectDevTools, 1000);

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
      clearInterval(interval);
      if (style.parentNode) {
        style.parentNode.removeChild(style);
      }
    };
  }, []);
}
