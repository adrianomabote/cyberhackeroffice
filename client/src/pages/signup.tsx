import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';
import { useProtection } from '@/hooks/use-protection';

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

      <Card className="w-full max-w-sm bg-gradient-to-br from-gray-900 to-gray-950 border-2 border-red-600 relative z-10">
        <CardHeader className="space-y-0.5 pb-1.5">
          <div className="flex items-center gap-1.5 mb-0.5">
            <Link href="/">
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5"
                data-testid="button-back"
              >
                <ArrowLeft className="w-3 h-3 text-gray-400" />
              </Button>
            </Link>
            <div className="flex items-center gap-1.5">
              <img
                src={"/favicon.png"}
                alt="CyberHacker"
                className="w-5 h-5 rounded-lg object-cover border-2 border-red-600"
              />
              <h1
                className="text-[10px] font-bold text-red-500"
                style={{ textShadow: '0 0 10px #ff0000' }}
                data-testid="text-title"
              >
                Robô Cyber Hacker
              </h1>
            </div>
          </div>
          <CardTitle className="text-base text-white font-bold" data-testid="text-signup-title">Registre-se</CardTitle>
          <CardDescription className="text-gray-400 text-[10px]" data-testid="text-signup-subtitle">
            Preencha os dados abaixo
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSignup}>
          <CardContent className="space-y-1.5 py-2">
            <div className="space-y-0.5">
              <Label htmlFor="name" className="text-gray-300 text-[10px]">Nome</Label>
              <Input
                id="name"
                type="text"
                placeholder="Seu nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="bg-gray-800 border-gray-700 text-white focus:border-emerald-500 focus:ring-emerald-500 h-7 text-xs"
                data-testid="input-name"
              />
            </div>
            <div className="space-y-0.5">
              <Label htmlFor="email" className="text-gray-300 text-[10px]">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-gray-800 border-gray-700 text-white focus:border-emerald-500 focus:ring-emerald-500 h-7 text-xs"
                data-testid="input-email"
              />
            </div>
            <div className="space-y-0.5">
              <Label htmlFor="password" className="text-gray-300 text-[10px]">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-gray-800 border-gray-700 text-white focus:border-emerald-500 focus:ring-emerald-500 h-7 text-xs"
                data-testid="input-password"
              />
            </div>
            <div className="space-y-0.5">
              <Label htmlFor="confirmPassword" className="text-gray-300 text-[10px]">Confirmar Senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="bg-gray-800 border-gray-700 text-white focus:border-emerald-500 focus:ring-emerald-500 h-7 text-xs"
                data-testid="input-confirm-password"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-1.5 pt-0.5">
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-black font-semibold h-7 text-xs"
              data-testid="button-submit"
            >
              Criar Conta
            </Button>

            <p className="text-[10px] text-gray-400 text-center" data-testid="text-login-link">
              Já tem uma conta?{' '}
              <Link href="/login" className="text-emerald-400 hover:text-emerald-300 underline font-semibold">
                Entrar
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
      
      {/* Botão Obter bot gratuito - abaixo do card */}
      <div className="mt-4 w-full max-w-sm">
        <Link href="/bot-gratuito">
          <button className="w-full bg-green-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-green-700 transition-colors animate-heartbeat">
            🎁 Obter Bot Gratuito
          </button>
        </Link>
      </div>
    </div>
  );
}