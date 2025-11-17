// Serviço de API para fazer requisições autenticadas
export const api = {
  async get<T>(url: string, options: RequestInit = {}): Promise<T> {
    const user = sessionStorage.getItem('user');
    const token = user ? JSON.parse(user).token : null;
    
    const headers = new Headers(options.headers);
    headers.set('Content-Type', 'application/json');
    
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    
    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include', // Importante para cookies de autenticação
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        // Token expirado ou inválido, redirecionar para o login
        sessionStorage.removeItem('user');
        window.location.href = '/login';
      }
      
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Erro na requisição');
    }
    
    return response.json();
  },
  
  async post<T>(url: string, data: any, options: RequestInit = {}): Promise<T> {
    return this.get<T>(url, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  async put<T>(url: string, data: any, options: RequestInit = {}): Promise<T> {
    return this.get<T>(url, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  
  async delete<T>(url: string, options: RequestInit = {}): Promise<T> {
    return this.get<T>(url, {
      ...options,
      method: 'DELETE',
    });
  },
};
