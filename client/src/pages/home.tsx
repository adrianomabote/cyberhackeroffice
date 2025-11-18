import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useProtection } from "@/hooks/use-protection";
import type { UltimaVelaResponse, PrevisaoResponse, ManutencaoStatus, SinaisManual } from "@shared/schema";
import { api } from "@/lib/api";

export default function Home() {
  useProtection();
  const [, setLocation] = useLocation();
  const [mostrandoEntrada, setMostrandoEntrada] = useState(false);
  const [ultimaEntrada, setUltimaEntrada] = useState<{ apos: number; sacar: number } | null>(null);
  const [pulseApos, setPulseApos] = useState(false);
  const [pulseSacar, setPulseSacar] = useState(false);

  // Verificar se já viu a mensagem de boas-vindas
  useEffect(() => {
    const hasSeenWelcome = sessionStorage.getItem('hasSeenWelcome');
    if (!hasSeenWelcome) {
      setLocation('/welcome');
    }
  }, [setLocation]);

  // Verificar status de manutenção
  const { data: manutencaoData } = useQuery<ManutencaoStatus>({
    queryKey: ['/api/manutencao/cyber'],
    queryFn: () => api.get<ManutencaoStatus>('/api/manutencao/cyber'),
    refetchInterval: 5000,
  });

  // Buscar sinais manuais
  const { data: sinaisManualData } = useQuery<SinaisManual>({
    queryKey: ['/api/sinais-manual/cyber'],
    queryFn: () => api.get<SinaisManual>('/api/sinais-manual/cyber'),
    refetchInterval: 1000,
  });

  // Buscar última vela (APÓS:)
  const { data: aposData } = useQuery<UltimaVelaResponse>({
    queryKey: ['/api/apos/cyber'],
    queryFn: () => api.get<UltimaVelaResponse>('/api/apos/cyber'),
    refetchInterval: 2000,
  });

  // Buscar previsão (SACAR:)
  const { data: sacarData } = useQuery<PrevisaoResponse>({
    queryKey: ['/api/sacar/cyber'],
    queryFn: () => api.get<PrevisaoResponse>('/api/sacar/cyber'),
    refetchInterval: 2000,
  });

  // Função para arredondar para os valores específicos
  const arredondarValor = (valor: number): number => {
    const valoresPossiveis = [2, 3, 4, 7, 10];
    return valoresPossiveis.reduce((prev, curr) => 
      Math.abs(curr - valor) < Math.abs(prev - valor) ? curr : prev
    );
  };

  // Determinar o que mostrar
  useEffect(() => {
    // Se houver sinal manual ativo
    if (sinaisManualData?.ativo && sinaisManualData.apos && sinaisManualData.sacar) {
      const novoApos = arredondarValor(sinaisManualData.apos);
      const novoSacar = arredondarValor(sinaisManualData.sacar);
      
      setUltimaEntrada({ apos: novoApos, sacar: novoSacar });
      setMostrandoEntrada(true);
      setPulseApos(true);
      setPulseSacar(true);
      
      const timer = setTimeout(() => {
        setPulseApos(false);
        setPulseSacar(false);
      }, 300);
      
      return () => clearTimeout(timer);
    }

    // Se for hora de entrar e tivermos dados válidos
    if (sacarData?.sinal === 'ENTRAR' && aposData?.multiplicador && sacarData?.multiplicador) {
      const novoApos = arredondarValor(aposData.multiplicador);
      const novoSacar = arredondarValor(sacarData.multiplicador);
      
      setUltimaEntrada({ apos: novoApos, sacar: novoSacar });
      setMostrandoEntrada(true);
      setPulseApos(true);
      setPulseSacar(true);
      
      const timer = setTimeout(() => {
        setPulseApos(false);
        setPulseSacar(false);
      }, 300);
      
      return () => clearTimeout(timer);
    } else {
      // Se não for hora de entrar, mostrar os três pontos
      setMostrandoEntrada(false);
    }
  }, [sinaisManualData, sacarData, aposData]);

  // Função para retornar cor baseada no multiplicador
  const getMultiplicadorColor = (valor: number): string => {
    if (valor >= 10) return '#ff1493';  // Rosa
    if (valor >= 7) return '#9d4edd';   // Roxo
    if (valor >= 4) return '#00bfff';   // Azul
    if (valor >= 3) return '#00ff00';   // Verde
    return '#ff0000';                   // Vermelho
  };

  // Se sistema em manutenção, mostrar tela de manutenção
  if (manutencaoData?.ativo) {
    return (
      <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center">
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

        <div className="relative z-20 w-full max-w-3xl mx-auto p-8">
          <div className="rounded-xl border py-8 mb-6"
            style={{
              borderColor: '#ff0000',
              borderWidth: '2px',
              backgroundColor: 'transparent',
            }}
          >
            <h1 className="text-center font-display font-bold tracking-wide mb-4"
              style={{
                color: '#ff0000',
                fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                textShadow: '0 0 30px rgba(255, 0, 0, 0.7)',
              }}
            >
              MANUTENÇÃO
            </h1>
            <p className="text-center font-sans font-normal"
              style={{
                color: '#ffffff',
                fontSize: 'clamp(1rem, 2.5vw, 1.5rem)',
              }}
            >
              Sistema temporariamente indisponível
            </p>
          </div>

          <div className="rounded-xl border p-8 mb-6"
            style={{
              borderColor: '#444444',
              borderWidth: '1px',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
            }}
          >
            <div className="text-center space-y-6">
              <div>
                <p className="font-sans font-normal mb-2" style={{ color: '#888888', fontSize: '1rem' }}>
                  Horário de Retorno
                </p>
                <p className="font-mono font-bold"
                  style={{
                    color: '#ff0000',
                    fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
                  }}
                  data-testid="text-mensagem-manutencao"
                >
                  {manutencaoData.mensagem}
                </p>
              </div>

              <div className="border-t pt-6" style={{ borderColor: '#333333' }}>
                <p className="font-sans font-normal mb-2" style={{ color: '#888888', fontSize: '1rem' }}>
                  Motivo
                </p>
                <p className="font-sans font-normal"
                  style={{
                    color: '#ffffff',
                    fontSize: 'clamp(1rem, 2.5vw, 1.5rem)',
                  }}
                  data-testid="text-motivo-manutencao"
                >
                  {manutencaoData.motivo}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Tela normal
  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Scanline effect overlay */}
      <div className="fixed inset-0 pointer-events-none z-10 opacity-5"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255, 255, 255, 0.03) 2px, rgba(255, 255, 255, 0.03) 4px)',
        }}
      />

      {/* Radial gradient background */}
      <div className="fixed inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at center, rgba(157, 78, 221, 0.05) 0%, rgba(0, 0, 0, 1) 70%)',
        }}
      />

      <div className="relative z-20 w-full">
        {/* Header CYBER HACKER */}
        <div className="w-full px-4 pt-4 pb-2">
          <div
            className="rounded-xl border py-4 w-full"
            style={{
              borderColor: '#ff0000',
              borderWidth: '1px',
              backgroundColor: 'transparent',
            }}
          >
            <h1 className="text-center font-display font-bold tracking-wide"
              style={{
                color: '#ff0000',
                fontSize: 'clamp(1rem, 3vw, 2rem)',
              }}
            >
              CYBER HACKER
            </h1>
          </div>
        </div>

        {/* Card único com ambos valores */}
        <div className="w-full px-4 py-2">
          <div
            className="relative rounded-xl p-6 border w-full"
            style={{
              borderColor: '#444444',
              borderWidth: '1px',
              backgroundColor: 'transparent',
            }}
            data-testid="card-multipliers"
          >
            <div className="flex items-center justify-around gap-4">
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
                      color: mostrandoEntrada && ultimaEntrada ? 
                        getMultiplicadorColor(ultimaEntrada.apos) : '#888888',
                      fontSize: 'clamp(1rem, 3vw, 2.25rem)',
                    }}
                    data-testid="text-apos-value"
                  >
                    {mostrandoEntrada && ultimaEntrada ? 
                      `${ultimaEntrada.apos.toFixed(2)}X` : '...'}
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
                      color: mostrandoEntrada && ultimaEntrada ? 
                        getMultiplicadorColor(ultimaEntrada.sacar) : '#888888',
                      fontSize: 'clamp(1rem, 3vw, 2.25rem)',
                    }}
                    data-testid="text-sacar-value"
                  >
                    {mostrandoEntrada && ultimaEntrada ? 
                      `${ultimaEntrada.sacar.toFixed(2)}X` : '...'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Iframe Casa de Apostas */}
        <div className="w-full px-4 py-2">
          <div className="w-full rounded-xl overflow-hidden border" style={{ borderColor: '#444444', borderWidth: '1px' }}>
            <iframe
              src="https://go.aff.betvivo.partners/epkorle4"
              className="w-full"
              style={{ height: '800px', minHeight: '600px' }}
              title="Casa de Apostas"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
            />
          </div>
        </div>
      </div>
    </div>
  );
}