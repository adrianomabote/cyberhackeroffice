import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';
import { useProtection } from '@/hooks/use-protection';
import robotImage from '@assets/file_00000000de3471fbba06676b1bf33e8f_1762368543414.png';

export default function Login() {
  useProtection();
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/usuarios/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha: password }),
      });

      const data = await response.json();

      if (data.success) {
        sessionStorage.setItem('user', JSON.stringify(data.data));
        setLocation('/welcome');
      } else {
        alert(data.error || 'Credenciais inválidas ou conta não aprovada');
      }
    } catch (error) {
      alert('Erro ao fazer login. Tente novamente.');
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-black border relative z-10" style={{ borderColor: '#333333' }}>
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-3 mb-4">
            <Link href="/">
              <Button 
                variant="ghost" 
                size="icon"
                data-testid="button-back"
              >
                <ArrowLeft className="w-5 h-5 text-gray-400" />
              </Button>
            </Link>
            <div className="flex items-center gap-3 ml-2">
              <img 
                src={robotImage}
                alt="Robô CyberHacker" 
                className="w-10 h-10 rounded-lg object-cover"
              />
              <h1 className="text-base font-bold text-white">
                ROBÔ CYBER HACKER
              </h1>
            </div>
          </div>
          <CardTitle className="text-2xl text-white" data-testid="text-login-title">Entrar</CardTitle>
          <CardDescription className="text-gray-400" data-testid="text-login-subtitle">
            Entre com suas credenciais para acessar o sistema
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-gray-800 border-gray-700 text-white"
                style={{
                  '--tw-ring-color': '#ff0000'
                } as React.CSSProperties}
                data-testid="input-email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-gray-800 border-gray-700 text-white"
                style={{
                  '--tw-ring-color': '#ff0000'
                } as React.CSSProperties}
                data-testid="input-password"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button 
              type="submit" 
              className="w-full text-white font-semibold px-8"
              style={{
                backgroundColor: '#ff0000',
                boxShadow: '0 0 20px rgba(255, 0, 0, 0.3)',
                minHeight: '44px'
              }}
              data-testid="button-submit"
            >
              Entrar
            </Button>
            <p className="text-sm text-gray-400 text-center" data-testid="text-signup-link">
              Não tem uma conta?{' '}
              <Link href="/signup" className="underline font-semibold" style={{ color: '#ff0000' }}>
                Registre-se
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}