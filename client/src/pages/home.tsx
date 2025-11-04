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
        <div className="max-w-lg mx-auto px-3 pt-4 pb-3">
          <div
            className="rounded-xl border py-3 md:py-6"
            style={{
              borderColor: '#ff0000',
              borderWidth: '1px',
              backgroundColor: 'transparent',
            }}
          >
            <h1 className="text-center font-display text-xl md:text-4xl font-bold tracking-wide"
              style={{
                color: '#ff0000',
              }}
            >
              CYBER HACKER
            </h1>
          </div>
        </div>

        {/* Card único com ambos valores */}
        <div className="max-w-lg mx-auto px-3 py-2">
          <div
            className="relative rounded-xl p-3 md:p-6 border"
            style={{
              borderColor: '#444444',
              borderWidth: '1px',
              backgroundColor: 'transparent',
            }}
            data-testid="card-multipliers"
          >
            <div className="flex items-center justify-around gap-4 md:gap-8">
              {/* APÓS: */}
              <div className="flex items-center gap-2 md:gap-3">
                <span className="font-sans text-xs md:text-lg text-gray-300 font-normal">APÓS:</span>
                <div
                  className="px-2.5 py-0.5 md:px-5 md:py-2 rounded border"
                  style={{
                    borderColor: '#333333',
                    borderWidth: '1px',
                    backgroundColor: '#000000',
                  }}
                >
                  <span
                    className="font-sans text-base md:text-4xl font-semibold"
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
              <div className="flex items-center gap-2 md:gap-3">
                <span className="font-sans text-xs md:text-lg text-gray-300 font-normal">SACAR:</span>
                <div
                  className="px-2.5 py-0.5 md:px-5 md:py-2 rounded border"
                  style={{
                    borderColor: '#333333',
                    borderWidth: '1px',
                    backgroundColor: '#000000',
                  }}
                >
                  <span
                    className="font-sans text-base md:text-4xl font-semibold"
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
