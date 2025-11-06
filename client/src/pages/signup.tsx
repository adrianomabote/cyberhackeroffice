import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';
import { useProtection } from '@/hooks/use-protection';
import hackerImage from '@assets/IMG-20251105-WA0139_1762343129352.jpg';

export default function Signup() {
  useProtection();
  const [, setLocation] = useLocation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert('As senhas não coincidem!');
      return;
    }

    try {
      const response = await fetch('/api/usuarios/registrar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, nome: name, senha: password }),
      });

      const data = await response.json();

      if (data.success) {
        alert('Cadastro enviado! Aguarde aprovação do administrador.');
        setLocation('/login');
      } else {
        alert(data.error || 'Erro ao registrar');
      }
    } catch (error) {
      alert('Erro ao registrar. Tente novamente.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-cyan-500/5"></div>

      <Card className="w-full max-w-lg bg-gradient-to-br from-gray-900 to-gray-950 border-2 border-red-600 relative z-10">
        <CardHeader className="space-y-2 pb-4">
          <div className="flex items-center gap-3 mb-2">
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
                className="w-12 h-12 rounded-lg object-cover border-2 border-red-600"
              />
              <h1
                className="text-xl font-bold text-red-500"
                style={{ textShadow: '0 0 10px #ff0000' }}
                data-testid="text-title"
              >
                Robô Cyber Hacker
              </h1>
            </div>
          </div>
          <CardTitle className="text-3xl text-white font-bold" data-testid="text-signup-title">Registre-se</CardTitle>
          <CardDescription className="text-gray-400 text-base" data-testid="text-signup-subtitle">
            Preencha os dados abaixo para criar sua conta
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSignup}>
          <CardContent className="space-y-5 py-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-300 text-base">Nome</Label>
              <Input
                id="name"
                type="text"
                placeholder="Seu nome completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="bg-gray-800 border-gray-700 text-white focus:border-emerald-500 focus:ring-emerald-500 h-12 text-base"
                data-testid="input-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300 text-base">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-gray-800 border-gray-700 text-white focus:border-emerald-500 focus:ring-emerald-500 h-12 text-base"
                data-testid="input-email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300 text-base">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-gray-800 border-gray-700 text-white focus:border-emerald-500 focus:ring-emerald-500 h-12 text-base"
                data-testid="input-password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-gray-300 text-base">Confirmar Senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="bg-gray-800 border-gray-700 text-white focus:border-emerald-500 focus:ring-emerald-500 h-12 text-base"
                data-testid="input-confirm-password"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 pt-2">
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-black font-semibold h-12 text-base"
              data-testid="button-submit"
            >
              Criar Conta
            </Button>

            <p className="text-base text-gray-400 text-center" data-testid="text-login-link">
              Já tem uma conta?{' '}
              <Link href="/login" className="text-emerald-400 hover:text-emerald-300 underline font-semibold">
                Entrar
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}