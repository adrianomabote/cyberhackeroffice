import { useEffect, useState } from 'react';

export function useProtection() {
  const [devToolsOpen, setDevToolsOpen] = useState(false);

  useEffect(() => {
    // Detectar se DevTools está aberto
    const detectDevTools = () => {
      const threshold = 160;
      const widthThreshold = window.outerWidth - window.innerWidth > threshold;
      const heightThreshold = window.outerHeight - window.innerHeight > threshold;
      
      const isOpen = widthThreshold || heightThreshold;
      setDevToolsOpen(isOpen);
      
      // Ocultar conteúdo se DevTools estiver aberto
      if (isOpen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = 'auto';
      }
    };

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

    // Desabilitar teclas de atalho do DevTools (sem bloquear usuário)
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
      
      // Outras teclas bloqueadas (sem bloquear usuário)
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

    // Adicionar listeners (SOMENTE proteções passivas, SEM bloqueios)
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('selectstart', handleSelectStart);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('dragstart', handleDragStart);
    
    // Verificar DevTools a cada 1 segundo
    const devToolsInterval = setInterval(detectDevTools, 1000);
    detectDevTools(); // Verificar imediatamente

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

    // Criar overlay de bloqueio de DevTools
    const overlay = document.createElement('div');
    overlay.id = 'devtools-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: #000000;
      color: #ff0000;
      display: none;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 999999;
      font-family: monospace;
      text-align: center;
      padding: 2rem;
    `;
    overlay.innerHTML = `
      <div style="font-size: 3rem; font-weight: bold; margin-bottom: 2rem; text-shadow: 0 0 20px #ff0000;">
        ⚠️ DEVTOOLS DETECTADO ⚠️
      </div>
      <div style="font-size: 1.5rem; margin-bottom: 1rem; color: #ffffff;">
        Feche as ferramentas de desenvolvedor para continuar
      </div>
      <div style="font-size: 1rem; color: #888888; margin-top: 2rem;">
        Pressione F12 ou Ctrl+Shift+I para fechar
      </div>
      <div style="font-size: 0.875rem; color: #444444; margin-top: 1rem;">
        A página voltará automaticamente quando você fechar
      </div>
    `;
    document.body.appendChild(overlay);

    // Atualizar visibilidade do overlay
    const updateOverlay = () => {
      const overlayElement = document.getElementById('devtools-overlay');
      if (overlayElement) {
        overlayElement.style.display = devToolsOpen ? 'flex' : 'none';
      }
    };

    // Limpar listeners ao desmontar
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('selectstart', handleSelectStart);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('dragstart', handleDragStart);
      clearInterval(devToolsInterval);
      if (style.parentNode) {
        style.parentNode.removeChild(style);
      }
      if (overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
      }
    };
  }, []);

  // Atualizar overlay quando devToolsOpen mudar
  useEffect(() => {
    const overlayElement = document.getElementById('devtools-overlay');
    if (overlayElement) {
      overlayElement.style.display = devToolsOpen ? 'flex' : 'none';
    }
  }, [devToolsOpen]);
}
