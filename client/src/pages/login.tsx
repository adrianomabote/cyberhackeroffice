import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';
import { useProtection } from '@/hooks/use-protection';

export default function Login() {
  useProtection();
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Por enquanto, apenas redireciona para a página principal
    // TODO: Implementar autenticação real
    setLocation('/app');
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gray-900 border-gray-800">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2 mb-4">
            <Link href="/">
              <Button variant="ghost" size="icon" data-testid="button-back">
                <ArrowLeft className="w-5 h-5 text-gray-400" />
              </Button>
            </Link>
            <h1 
              className="text-2xl font-bold"
              style={{
                color: '#ff0000',
                textShadow: '0 0 10px #ff0000',
                fontFamily: 'Orbitron, monospace'
              }}
              data-testid="text-title"
            >
              ROBÔ CYBER HACKER
            </h1>
          </div>
          <CardTitle className="text-2xl text-white" data-testid="text-login-title">Entrar</CardTitle>
          <CardDescription className="text-gray-400" data-testid="text-login-subtitle">
            Entre com suas credenciais para acessar o sistema
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-gray-800 border-gray-700 text-white"
                data-testid="input-email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-gray-800 border-gray-700 text-white"
                data-testid="input-password"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button 
              type="submit" 
              className="w-full bg-red-600 hover:bg-red-700 text-white"
              data-testid="button-submit"
            >
              ENTRAR
            </Button>
            <p className="text-sm text-gray-400 text-center" data-testid="text-signup-link">
              Não tem uma conta?{' '}
              <Link href="/signup" className="text-red-500 hover:text-red-400 underline">
                Criar conta
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
