import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import type { UltimaVelaResponse, PrevisaoResponse } from "@shared/schema";

export default function Home() {
  const [pulseApos, setPulseApos] = useState(false);
  const [pulseSacar, setPulseSacar] = useState(false);

  // Buscar última vela (APÓS:)
  const { data: aposData } = useQuery<UltimaVelaResponse>({
    queryKey: ['/api/apos'],
    queryFn: async () => {
      const res = await fetch('/api/apos');
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    },
    refetchInterval: 1000,
    staleTime: 0,
  });

  // Buscar previsão (SACAR:)
  const { data: sacarData } = useQuery<PrevisaoResponse>({
    queryKey: ['/api/sacar'],
    queryFn: async () => {
      const res = await fetch('/api/sacar');
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    },
    refetchInterval: 1000,
    staleTime: 0,
  });

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

      <div className="relative z-20">
        {/* Header CYBER HACKER */}
        <div className="max-w-md mx-auto px-4 pt-6 pb-4">
          <div
            className="rounded-2xl border-2 py-4"
            style={{
              borderColor: '#ff0000',
              backgroundColor: '#000000',
            }}
          >
            <h1 className="text-center font-display text-2xl font-bold tracking-widest"
              style={{
                color: '#ff0000',
                textShadow: '0 0 10px rgba(255, 0, 0, 0.6)',
              }}
            >
              CYBER HACKER
            </h1>
          </div>
        </div>

        {/* Card único com ambos valores */}
        <div className="max-w-md mx-auto px-4 py-4">
          <div
            className="relative rounded-2xl p-4 border-2"
            style={{
              borderColor: '#9d4edd',
              backgroundColor: '#000000',
            }}
            data-testid="card-multipliers"
          >
            <div className="flex items-center justify-around">
              {/* APÓS: */}
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm text-gray-400">APÓS:</span>
                <div
                  className="px-3 py-1 rounded-md border"
                  style={{
                    borderColor: '#1a1a1a',
                    backgroundColor: '#000000',
                  }}
                >
                  <span
                    className="font-mono text-xl font-bold"
                    style={{
                      color: '#9d4edd',
                    }}
                    data-testid="text-apos-value"
                  >
                    {aposData?.multiplicador ? `${aposData.multiplicador.toFixed(2)}X` : '--'}
                  </span>
                </div>
              </div>

              {/* SACAR: */}
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm text-gray-400">SACAR:</span>
                <div
                  className="px-3 py-1 rounded-md border"
                  style={{
                    borderColor: '#1a1a1a',
                    backgroundColor: '#000000',
                  }}
                >
                  <span
                    className="font-mono text-xl font-bold"
                    style={{
                      color: '#9d4edd',
                    }}
                    data-testid="text-sacar-value"
                  >
                    {sacarData?.multiplicador ? `${sacarData.multiplicador.toFixed(2)}X` : '--'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
