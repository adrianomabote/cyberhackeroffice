
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, UserPlus, Users } from "lucide-react";
import { useProtection } from "@/hooks/use-protection";

export default function PainelRevendedor() {
  useProtection();
  const [, setLocation] = useLocation();
  const [revendedor, setRevendedor] = useState<any>(null);
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [carregandoUsuarios, setCarregandoUsuarios] = useState(false);
  const [novoUsuario, setNovoUsuario] = useState({
    nome: '',
    email: '',
    senha: '',
  });

  useEffect(() => {
    const revendedorData = sessionStorage.getItem('revendedor_data');
    if (!revendedorData) {
      setLocation('/revendedor/login');
      return;
    }
    const parsedRevendedor = JSON.parse(revendedorData);
    setRevendedor(parsedRevendedor);
    
    // Carregar usuários ao entrar
    carregarUsuarios(parsedRevendedor.id);
  }, [setLocation]);

  const carregarUsuarios = async (revendedorId: string) => {
    setCarregandoUsuarios(true);
    try {
      const response = await fetch(`/api/revendedores/listar-usuarios?revendedor_id=${revendedorId}`);
      const data = await response.json();
      if (data.success) {
        setUsuarios(data.data);
      }
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    } finally {
      setCarregandoUsuarios(false);
    }
  };

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
          dias_acesso: 2, // Sempre 2 dias
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('Usuário criado com sucesso!');
        setNovoUsuario({ nome: '', email: '', senha: '' });
        
        // Atualizar créditos
        const updatedRevendedor = { ...revendedor, creditos: revendedor.creditos - 1 };
        setRevendedor(updatedRevendedor);
        sessionStorage.setItem('revendedor_data', JSON.stringify(updatedRevendedor));
        
        // Recarregar usuários
        carregarUsuarios(revendedor.id);
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
              borderColor: '#cc0000',
              borderWidth: '2px',
              backgroundColor: 'transparent',
            }}
          >
            <h1 className="text-center font-display font-bold tracking-wide"
              style={{
                color: '#cc0000',
                fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
                textShadow: '0 0 20px rgba(204, 0, 0, 0.8)',
              }}
            >
              PAINEL REVENDEDOR
            </h1>
          </div>
        </div>

        {/* Info do Revendedor */}
        <Card className="mb-6 bg-gray-900" style={{ borderColor: '#cc0000', borderWidth: '1px' }}>
          <CardHeader>
            <CardTitle className="text-white">Suas Informações</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300">Nome: {revendedor.nome}</p>
            <p className="text-gray-300">Email: {revendedor.email}</p>
            <p 
              className="font-bold text-xl mt-2 select-none" 
              style={{ 
                color: '#cc0000',
                userSelect: 'none',
                WebkitUserSelect: 'none',
                MozUserSelect: 'none',
                msUserSelect: 'none',
              }}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onContextMenu={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onDoubleClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onCut={(e) => e.preventDefault()}
              onCopy={(e) => e.preventDefault()}
              onPaste={(e) => e.preventDefault()}
            >
              Créditos Disponíveis: {revendedor.creditos}
            </p>
          </CardContent>
        </Card>

        {/* Formulário Criar Usuário */}
        <Card className="bg-gray-900" style={{ borderColor: '#cc0000', borderWidth: '1px' }}>
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
                <Label className="text-gray-300">Acesso</Label>
                <p className="px-4 py-2 rounded bg-gray-800 border border-gray-700 text-white">
                  2 dias de acesso
                </p>
              </div>
              <Button
                type="submit"
                disabled={revendedor.creditos <= 0}
                style={{
                  backgroundColor: '#cc0000',
                  width: '100%'
                }}
              >
                {revendedor.creditos > 0 ? 'Criar Usuário' : 'Sem Créditos Disponíveis'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Usuários Criados */}
        <Card className="bg-gray-900" style={{ borderColor: '#cc0000', borderWidth: '1px' }}>
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Users className="w-5 h-5" />
              Usuários Criados ({usuarios.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {carregandoUsuarios ? (
              <p className="text-gray-400">Carregando...</p>
            ) : usuarios.length === 0 ? (
              <p className="text-gray-400">Nenhum usuário criado ainda</p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {usuarios.map((usuario) => (
                  <div 
                    key={usuario.id} 
                    className="p-3 bg-gray-800 rounded border border-gray-700"
                  >
                    <p className="text-gray-100 font-semibold">{usuario.nome}</p>
                    <p className="text-gray-400 text-sm">{usuario.email}</p>
                    <div className="text-gray-400 text-xs mt-1">
                      {usuario.tempoRestante ? (
                        usuario.tempoRestante.expirado ? (
                          <span style={{ color: '#cc0000' }}>Expirado</span>
                        ) : (
                          <span>
                            Vence em: {usuario.tempoRestante.dias}d {usuario.tempoRestante.horas}h
                          </span>
                        )
                      ) : (
                        <span>Sem validade definida</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
