import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import type { UltimaVelaResponse, PrevisaoResponse } from "@shared/schema";

export default function Home() {
  const [pulseApos, setPulseApos] = useState(false);
  const [pulseSacar, setPulseSacar] = useState(false);

  // Buscar última vela (APÓS:)
  const { data: aposData } = useQuery<UltimaVelaResponse>({
    queryKey: ['/api/apos/cyber'],
    queryFn: async () => {
      const res = await fetch('/api/apos/cyber');
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    },
    refetchInterval: 1000,
    staleTime: 0,
  });

  // Buscar previsão (SACAR:)
  const { data: sacarData } = useQuery<PrevisaoResponse>({
    queryKey: ['/api/sacar/cyber'],
    queryFn: async () => {
      const res = await fetch('/api/sacar/cyber');
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    },
    refetchInterval: 1000,
    staleTime: 0,
  });

  // Função para retornar cor baseada no multiplicador (cores da foto)
  const getMultiplicadorColor = (valor: number): string => {
    if (valor >= 10.0) return '#ff1493'; // Rosa vibrante (10.00x+) - como na foto
    if (valor >= 2.0) return '#9d4edd';  // Roxo (2.00x - 9.99x)
    return '#00bfff';                     // Azul cyan (1.00x - 1.99x)
  };

  // Verificar se é hora de entrar
  const isHoraDeEntrar = sacarData?.sinal === 'ENTRAR';

  // Efeito de pulso quando valores mudam
  useEffect(() => {
    setPulseApos(true);
    const timer = setTimeout(() => setPulseApos(false), 300);
    return () => clearTimeout(timer);
  }, [aposData?.multiplicador]);

  useEffect(() => {
    setPulseSacar(true);
    const timer = setTimeout(() => setPulseSacar(false), 300);
    return () => clearTimeout(timer);
  }, [sacarData?.multiplicador]);

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
              {/* APÓS: sempre mostra o último multiplicador da API */}
              <div className="flex items-center gap-2">
                <span className="font-sans font-normal" style={{ 
                  color: '#ffffff',
                  fontSize: 'clamp(0.875rem, 2.5vw, 1.5rem)' 
                }}>APÓS:</span>
                <div
                  className="px-3 py-1 rounded border"
                  style={{
                    borderColor: '#333333',
                    borderWidth: '1px',
                    backgroundColor: '#000000',
                  }}
                >
                  <span
                    className="font-sans font-semibold"
                    style={{
                      color: aposData?.multiplicador ? getMultiplicadorColor(aposData.multiplicador) : '#888888',
                      fontSize: 'clamp(1rem, 3vw, 2.25rem)',
                    }}
                    data-testid="text-apos-value"
                  >
                    {aposData?.multiplicador ? `${aposData.multiplicador.toFixed(2)}X` : '...'}
                  </span>
                </div>
              </div>

              {/* SACAR: mostra recomendação apenas quando é hora de entrar */}
              <div className="flex items-center gap-2">
                <span className="font-sans font-normal" style={{ 
                  color: '#ffffff',
                  fontSize: 'clamp(0.875rem, 2.5vw, 1.5rem)' 
                }}>SACAR:</span>
                <div
                  className="px-3 py-1 rounded border"
                  style={{
                    borderColor: '#333333',
                    borderWidth: '1px',
                    backgroundColor: '#000000',
                  }}
                >
                  <span
                    className="font-sans font-semibold"
                    style={{
                      color: isHoraDeEntrar && sacarData?.multiplicador ? getMultiplicadorColor(sacarData.multiplicador) : '#888888',
                      fontSize: 'clamp(1rem, 3vw, 2.25rem)',
                    }}
                    data-testid="text-sacar-value"
                  >
                    {isHoraDeEntrar && sacarData?.multiplicador ? `${sacarData.multiplicador.toFixed(2)}X` : '...'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Iframe Lotto24 */}
        <div className="w-full px-4 py-2">
          <div className="w-full rounded-xl overflow-hidden border" style={{ borderColor: '#444444', borderWidth: '1px' }}>
            <iframe
              src="https://lotto24.co.mz/"
              className="w-full"
              style={{ height: '800px', minHeight: '600px' }}
              title="Lotto24"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
