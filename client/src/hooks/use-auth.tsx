import { useEffect } from 'react';
import { useLocation } from 'wouter';

/**
 * Hook de autenticação - Protege rotas privadas
 * Redireciona para landing page se usuário não estiver logado
 */
export function useAuth() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Verificar se usuário está logado
    const user = sessionStorage.getItem('user');
    
    if (!user) {
      // Não está logado - redirecionar para landing page
      console.log('[AUTH] Usuário não autenticado - redirecionando para /');
      setLocation('/');
      return;
    }

    try {
      // Validar se os dados do usuário são válidos
      const userData = JSON.parse(user);
      
      if (!userData || !userData.id || !userData.email) {
        // Dados inválidos - limpar e redirecionar
        console.log('[AUTH] Dados de usuário inválidos - redirecionando para /');
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('hasSeenWelcome');
        setLocation('/');
        return;
      }

      console.log('[AUTH] Usuário autenticado:', userData.email);
    } catch (error) {
      // Erro ao parsear dados - limpar e redirecionar
      console.error('[AUTH] Erro ao validar sessão:', error);
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('hasSeenWelcome');
      setLocation('/');
    }
  }, [setLocation]);
}

/**
 * Função para fazer logout
 */
export function logout() {
  sessionStorage.removeItem('user');
  sessionStorage.removeItem('hasSeenWelcome');
  window.location.href = '/';
}

/**
 * Função para verificar se está logado
 */
export function isAuthenticated(): boolean {
  const user = sessionStorage.getItem('user');
  if (!user) return false;
  
  try {
    const userData = JSON.parse(user);
    return !!(userData && userData.id && userData.email);
  } catch {
    return false;
  }
}

/**
 * Função para obter dados do usuário logado
 */
export function getUser() {
  const user = sessionStorage.getItem('user');
  if (!user) return null;
  
  try {
    return JSON.parse(user);
  } catch {
    return null;
  }
}
