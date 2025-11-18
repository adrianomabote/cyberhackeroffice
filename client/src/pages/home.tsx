import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useProtection } from "@/hooks/use-protection";
import type { UltimaVelaResponse, PrevisaoResponse, ManutencaoStatus, SinaisManual } from "@shared/schema";
import { api } from "@/lib/api";

export default function Home() {
  useProtection();
  const [, setLocation] = useLocation();
  const [ultimaEntrada, setUltimaEntrada] = useState<{ 
    apos: number; 
    sacar: number;
    isManual: boolean;
  } | null>(null);
  const [pulseApos, setPulseApos] = useState(false);
  const [pulseSacar, setPulseSacar] = useState(false);

  // Buscar dados da API
  const { data: manutencaoData } = useQuery<ManutencaoStatus>({
    queryKey: ["manutencao"],
    queryFn: () => api.get("/api/manutencao/cyber").then(res => res.data),
    refetchInterval: 10000,
  });

  const { data: sinaisManualData } = useQuery<SinaisManual>({
    queryKey: ["sinais-manual"],
    queryFn: () => api.get("/api/sinais-manual/cyber").then(res => res.data),
    refetchInterval: 1000,
  });

  const { data: aposData } = useQuery<UltimaVelaResponse>({
    queryKey: ["apos"],
    queryFn: () => api.get("/api/apos/cyber").then(res => res.data),
    refetchInterval: 1000,
    enabled: !sinaisManualData?.ativo, // Só busca se não houver sinal manual ativo
  });

  const { data: sacarData } = useQuery<PrevisaoResponse>({
    queryKey: ["sacar"],
    queryFn: () => api.get("/api/sacar/cyber").then(res => res.data),
    refetchInterval: 1000,
    enabled: !sinaisManualData?.ativo, // Só busca se não houver sinal manual ativo
  });

  // Função para arredondar valores para os mais próximos (2, 3, 4, 7, 10)
  const arredondarValor = (valor: number): number => {
    const valoresPossiveis = [2, 3, 4, 7, 10];
    return valoresPossiveis.reduce((prev, curr) => 
      Math.abs(curr - valor) < Math.abs(prev - valor) ? curr : prev
    );
  };

  // Função para obter a cor com base no valor do multiplicador
  const getMultiplicadorColor = (valor: number): string => {
  if (valor >= 10) return '#ff1493';  // Rosa para 10.00x ou mais
  if (valor >= 2) return '#9d4edd';   // Roxo para 2.00x a 9.99x
  if (valor >= 1) return '#00bfff';   // Azul para 1.00x a 1.99x
  return '#ff0000';                   // Vermelho para menos de 1.00x (caso ocorra)
};

  // Efeito para controlar a exibição dos valores
  useEffect(() => {
    // Se houver sinal manual ativo
    if (sinaisManualData?.ativo && sinaisManualData.apos && sinaisManualData.sacar) {
      const novoApos = arredondarValor(sinaisManualData.apos);
      const novoSacar = arredondarValor(sinaisManualData.sacar);
      
      setUltimaEntrada({ 
        apos: novoApos, 
        sacar: novoSacar,
        isManual: true 
      });
      
      setPulseApos(true);
      setPulseSacar(true);
      
      const timer = setTimeout(() => {
        setPulseApos(false);
        setPulseSacar(false);
      }, 300);
      
      return () => clearTimeout(timer);
    } 
    // Se não houver sinal manual, verificar sinal automático
    else if (sacarData?.sinal === 'ENTRAR' && aposData?.multiplicador && sacarData?.multiplicador) {
      const novoApos = arredondarValor(aposData.multiplicador);
      const novoSacar = arredondarValor(sacarData.multiplicador);
      
      setUltimaEntrada({ 
        apos: novoApos, 
        sacar: novoSacar,
        isManual: false
      });
      
      setPulseApos(true);
      setPulseSacar(true);
      
      const timer = setTimeout(() => {
        setPulseApos(false);
        setPulseSacar(false);
      }, 300);
      
      return () => clearTimeout(timer);
    }
    // Se desativou o sinal manual ou não há sinal automático
    else if (!sinaisManualData?.ativo) {
      setUltimaEntrada(null);
    }
  }, [sinaisManualData, sacarData, aposData]);

  // Se estiver em manutenção, mostrar aviso
  if (manutencaoData?.manutencao) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
        <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full text-center">
          <h2 className="text-2xl font-bold mb-4">🔧 Em Manutenção</h2>
          <p className="mb-4">Estamos realizando manutenções para melhorar nosso serviço.</p>
          <p className="text-sm text-gray-400">Voltaremos em breve!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-6xl mx-auto">
        {/* Cabeçalho */}
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">CyberHacker</h1>
          <button 
            onClick={() => {
              localStorage.removeItem("token");
              setLocation("/login");
            }}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
          >
            Sair
          </button>
        </header>

        {/* Card Principal */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Coluna Esquerda */}
            <div className="space-y-6">
              <div className="bg-gray-900 p-6 rounded-lg">
                <h2 className="text-xl font-semibold mb-4">Sinais</h2>
                
                <div className="space-y-4">
                  {/* APÓS */}
                  <div className="flex items-center gap-2">
                    <span className="font-sans font-normal" style={{ 
                      color: '#ffffff',
                      fontSize: 'clamp(0.875rem, 2.5vw, 1.5rem)' 
                    }}>APÓS:</span>
                    <div
                      className={`px-3 py-1 rounded border ${pulseApos ? 'animate-pulse' : ''}`}
                      style={{
                        borderColor: '#333333',
                        borderWidth: '1px',
                        backgroundColor: '#000000',
                        minWidth: '100px',
                        textAlign: 'center'
                      }}
                    >
                      <span
                        className="font-sans font-semibold"
                        style={{
                          color: ultimaEntrada ? getMultiplicadorColor(ultimaEntrada.apos) : '#888888',
                          fontSize: 'clamp(1rem, 3vw, 2.25rem)',
                        }}
                        data-testid="text-apos-value"
                      >
                        {ultimaEntrada ? `${ultimaEntrada.apos.toFixed(2)}X` : '...'}
                      </span>
                    </div>
                  </div>

                  {/* SACAR */}
                  <div className="flex items-center gap-2">
                    <span className="font-sans font-normal" style={{ 
                      color: '#ffffff',
                      fontSize: 'clamp(0.875rem, 2.5vw, 1.5rem)' 
                    }}>SACAR:</span>
                    <div
                      className={`px-3 py-1 rounded border ${pulseSacar ? 'animate-pulse' : ''}`}
                      style={{
                        borderColor: '#333333',
                        borderWidth: '1px',
                        backgroundColor: '#000000',
                        minWidth: '100px',
                        textAlign: 'center'
                      }}
                    >
                      <span
                        className="font-sans font-semibold"
                        style={{
                          color: ultimaEntrada ? getMultiplicadorColor(ultimaEntrada.sacar) : '#888888',
                          fontSize: 'clamp(1rem, 3vw, 2.25rem)',
                        }}
                        data-testid="text-sacar-value"
                      >
                        {ultimaEntrada ? `${ultimaEntrada.sacar.toFixed(2)}X` : '...'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Coluna Direita */}
            <div className="bg-gray-900 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Aviator</h2>
              <div className="aspect-video bg-black rounded-lg overflow-hidden">
                <iframe
                  src="https://www.aviator.bet"
                  className="w-full h-full"
                  title="Aviator Game"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          </div>
        </div>

        {/* Rodapé */}
        <footer className="text-center text-sm text-gray-500 mt-8">
          <p>© {new Date().getFullYear()} CyberHacker. Todos os direitos reservados.</p>
        </footer>
      </div>
    </div>
  );
}