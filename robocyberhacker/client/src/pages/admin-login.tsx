
import { useState } from 'react';
import { useLocation } from 'wouter';
import { useProtection } from '@/hooks/use-protection';
import { useToast } from '@/hooks/use-toast';
import { Shield } from 'lucide-react';

const ADMIN_PASSWORD = '00220022aA1';

export default function AdminLogin() {
  useProtection();
  const [, setLocation] = useLocation();
  const [password, setPassword] = useState('');
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password === ADMIN_PASSWORD) {
      // Salvar token de autenticação
      sessionStorage.setItem('admin_authenticated', 'true');
      setLocation('/admin/cyber');
    } else {
      toast({
        title: "❌ Acesso Negado",
        description: "Senha incorreta",
        variant: "destructive",
      });
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none z-10 opacity-5"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255, 255, 255, 0.03) 2px, rgba(255, 255, 255, 0.03) 4px)',
        }}
      />
      <div className="fixed inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at center, rgba(157, 78, 221, 0.05) 0%, rgba(0, 0, 0, 1) 70%)',
        }}
      />

      <div className="relative z-20 w-full max-w-md mx-auto p-8 min-h-screen flex flex-col justify-center">
        {/* Header */}
        <div
          className="rounded-xl border py-8 mb-8 text-center"
          style={{
            borderColor: '#ff0000',
            borderWidth: '2px',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
          }}
        >
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ backgroundColor: '#ff0000' }}>
              <Shield className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="font-display font-bold tracking-wide mb-2"
            style={{
              color: '#ff0000',
              fontSize: 'clamp(1.5rem, 4vw, 2rem)',
              textShadow: '0 0 20px rgba(255, 0, 0, 0.5)',
            }}
          >
            ACESSO RESTRITO
          </h1>
          <p className="font-sans text-gray-400">
            Painel Administrativo
          </p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit}>
          <div
            className="rounded-xl border p-8 mb-6"
            style={{
              borderColor: '#444444',
              borderWidth: '1px',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
            }}
          >
            <label className="block font-sans font-normal mb-3" style={{ color: '#ffffff', fontSize: '1rem' }}>
              Senha de Administrador
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite a senha"
              className="w-full px-4 py-3 rounded border font-mono mb-6"
              style={{
                backgroundColor: '#000000',
                borderColor: '#333333',
                color: '#ffffff',
                fontSize: '1.25rem',
              }}
              autoFocus
            />

            <button
              type="submit"
              className="w-full py-4 rounded font-sans font-bold transition-all hover:opacity-80"
              style={{
                backgroundColor: '#ff0000',
                color: '#ffffff',
                fontSize: '1.25rem',
                border: 'none',
              }}
            >
              ENTRAR
            </button>
          </div>
        </form>

        <p className="text-center font-sans text-gray-500 text-sm">
          Sistema protegido - Apenas administradores autorizados
        </p>
      </div>
    </div>
  );
}
