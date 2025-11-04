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
        <header className="w-full py-6 px-4 border-b-2 border-[#ff0000]"
          style={{
            background: 'linear-gradient(180deg, rgba(10, 10, 10, 0.95) 0%, rgba(0, 0, 0, 0.98) 100%)',
            boxShadow: '0 0 30px rgba(255, 0, 0, 0.3)',
          }}
        >
          <h1 className="text-center font-display text-4xl md:text-5xl font-bold tracking-widest"
            style={{
              color: '#ff0000',
              textShadow: '0 0 20px rgba(255, 0, 0, 0.8), 0 0 40px rgba(255, 0, 0, 0.4), 0 2px 4px rgba(0, 0, 0, 0.8)',
              WebkitTextStroke: '2px #ff0000',
              paintOrder: 'stroke fill',
            }}
          >
            CYBER HACKER
          </h1>
        </header>

        {/* Card único com ambos valores */}
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div
            className="relative bg-black/90 backdrop-blur-sm rounded-2xl p-6 border-2"
            style={{
              borderColor: '#9d4edd',
              boxShadow: '0 0 20px rgba(157, 78, 221, 0.4)',
            }}
            data-testid="card-multipliers"
          >
            <div className="flex items-center justify-around gap-8">
              {/* APÓS: */}
              <div className="flex items-center gap-3">
                <span className="font-mono text-base text-gray-400 uppercase">APÓS:</span>
                <span
                  className="font-mono text-4xl font-bold"
                  style={{
                    color: '#9d4edd',
                    textShadow: '0 0 10px rgba(157, 78, 221, 0.6)',
                  }}
                  data-testid="text-apos-value"
                >
                  {aposData?.multiplicador ? `${aposData.multiplicador.toFixed(2)}X` : '--'}
                </span>
              </div>

              {/* SACAR: */}
              <div className="flex items-center gap-3">
                <span className="font-mono text-base text-gray-400 uppercase">SACAR:</span>
                <span
                  className="font-mono text-4xl font-bold"
                  style={{
                    color: '#9d4edd',
                    textShadow: '0 0 10px rgba(157, 78, 221, 0.6)',
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
  );
}
