
import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield } from "lucide-react";
import { useProtection } from "@/hooks/use-protection";

export default function RevendedorLogin() {
  useProtection();
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/revendedores/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha }),
      });

      const data = await response.json();

      if (data.success) {
        sessionStorage.setItem('revendedor_data', JSON.stringify(data.data));
        setLocation('/painel-revendedor');
      } else {
        alert(data.error || 'Credenciais inválidas');
      }
    } catch (error) {
      alert('Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gray-900" style={{ borderColor: '#cc0000', borderWidth: '1px' }}>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: '#cc0000' }}>
              <Shield className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl" style={{ color: '#cc0000' }}>
            PAINEL REVENDEDOR
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label className="text-gray-300">Email</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-gray-800 border-gray-700 text-white"
                placeholder="seu@email.com"
              />
            </div>
            <div>
              <Label className="text-gray-300">Senha</Label>
              <Input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
                className="bg-gray-800 border-gray-700 text-white"
                placeholder="••••••••"
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              style={{
                backgroundColor: '#cc0000',
                width: '100%'
              }}
            >
              {loading ? "ENTRANDO..." : "ENTRAR"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
