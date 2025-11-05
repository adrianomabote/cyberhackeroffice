import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';
import { useProtection } from '@/hooks/use-protection';
import hackerImage from '@assets/IMG-20251105-WA0139_1762343129352.jpg';

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
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-cyan-500/5"></div>
      
      <Card className="w-full max-w-md bg-gradient-to-br from-gray-900 to-gray-950 border-emerald-500/30 relative z-10">
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
            <div className="flex items-center gap-2">
              <img 
                src={hackerImage} 
                alt="CyberHacker" 
                className="w-10 h-10 rounded-lg object-cover border-2 border-emerald-500/50"
              />
              <h1 
                className="text-lg font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent"
                data-testid="text-title"
              >
                CyberHacker
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
                className="bg-gray-800 border-gray-700 text-white focus:border-emerald-500 focus:ring-emerald-500"
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
                className="bg-gray-800 border-gray-700 text-white focus:border-emerald-500 focus:ring-emerald-500"
                data-testid="input-password"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-black font-semibold"
              data-testid="button-submit"
            >
              Entrar
            </Button>
            <p className="text-sm text-gray-400 text-center" data-testid="text-signup-link">
              Não tem uma conta?{' '}
              <Link href="/signup" className="text-emerald-400 hover:text-emerald-300 underline font-semibold">
                Registre-se
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
