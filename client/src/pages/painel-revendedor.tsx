
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, UserPlus } from "lucide-react";

export default function PainelRevendedor() {
  const [, setLocation] = useLocation();
  const [revendedor, setRevendedor] = useState<any>(null);
  const [novoUsuario, setNovoUsuario] = useState({
    nome: '',
    email: '',
    senha: '',
    dias_acesso: 2,
  });

  useEffect(() => {
    const revendedorData = sessionStorage.getItem('revendedor_data');
    if (!revendedorData) {
      setLocation('/revendedor/login');
      return;
    }
    setRevendedor(JSON.parse(revendedorData));
  }, [setLocation]);

  const criarUsuario = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!revendedor) return;

    try {
      const response = await fetch('/api/revendedores/criar-usuario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          revendedor_id: revendedor.id,
          ...novoUsuario,
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('Usuário criado com sucesso!');
        setNovoUsuario({ nome: '', email: '', senha: '', dias_acesso: 2 });
        
        // Atualizar créditos
        const updatedRevendedor = { ...revendedor, creditos: revendedor.creditos - 1 };
        setRevendedor(updatedRevendedor);
        sessionStorage.setItem('revendedor_data', JSON.stringify(updatedRevendedor));
      } else {
        alert(data.error || 'Erro ao criar usuário');
      }
    } catch (error) {
      alert('Erro ao criar usuário');
    }
  };

  if (!revendedor) return null;

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none z-10 opacity-5"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255, 255, 255, 0.03) 2px, rgba(255, 255, 255, 0.03) 4px)',
        }}
      />

      <div className="relative z-20 w-full max-w-2xl mx-auto p-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => {
              sessionStorage.removeItem('revendedor_data');
              setLocation('/revendedor/login');
            }}
            className="p-2 rounded hover:bg-gray-800"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <div
            className="flex-1 rounded-xl border py-6"
            style={{
              borderColor: '#00ff00',
              borderWidth: '2px',
              backgroundColor: 'transparent',
            }}
          >
            <h1 className="text-center font-display font-bold tracking-wide"
              style={{
                color: '#00ff00',
                fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
                textShadow: '0 0 20px rgba(0, 255, 0, 0.5)',
              }}
            >
              PAINEL REVENDEDOR
            </h1>
          </div>
        </div>

        {/* Info do Revendedor */}
        <Card className="mb-6 bg-gray-900 border-green-600">
          <CardHeader>
            <CardTitle className="text-white">Suas Informações</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300">Nome: {revendedor.nome}</p>
            <p className="text-gray-300">Email: {revendedor.email}</p>
            <p className="text-green-500 font-bold text-xl mt-2">
              Créditos Disponíveis: {revendedor.creditos}
            </p>
          </CardContent>
        </Card>

        {/* Formulário Criar Usuário */}
        <Card className="bg-gray-900 border-green-600">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              Criar Novo Usuário
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={criarUsuario} className="space-y-4">
              <div>
                <Label className="text-gray-300">Nome</Label>
                <Input
                  type="text"
                  value={novoUsuario.nome}
                  onChange={(e) => setNovoUsuario({ ...novoUsuario, nome: e.target.value })}
                  required
                  className="bg-gray-800 border-gray-700 text-white"
                  placeholder="Nome completo"
                />
              </div>
              <div>
                <Label className="text-gray-300">Email</Label>
                <Input
                  type="email"
                  value={novoUsuario.email}
                  onChange={(e) => setNovoUsuario({ ...novoUsuario, email: e.target.value })}
                  required
                  className="bg-gray-800 border-gray-700 text-white"
                  placeholder="email@exemplo.com"
                />
              </div>
              <div>
                <Label className="text-gray-300">Senha</Label>
                <Input
                  type="password"
                  value={novoUsuario.senha}
                  onChange={(e) => setNovoUsuario({ ...novoUsuario, senha: e.target.value })}
                  required
                  className="bg-gray-800 border-gray-700 text-white"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <Label className="text-gray-300">Dias de Acesso</Label>
                <select
                  value={novoUsuario.dias_acesso}
                  onChange={(e) => setNovoUsuario({ ...novoUsuario, dias_acesso: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 rounded bg-gray-800 border border-gray-700 text-white"
                >
                  <option value={1}>1 dia</option>
                  <option value={2}>2 dias</option>
                  <option value={3}>3 dias</option>
                  <option value={7}>7 dias</option>
                  <option value={15}>15 dias</option>
                  <option value={30}>30 dias</option>
                </select>
              </div>
              <Button
                type="submit"
                disabled={revendedor.creditos <= 0}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {revendedor.creditos > 0 ? 'Criar Usuário' : 'Sem Créditos Disponíveis'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
