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

        {/* Multiplier Cards */}
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* APÓS: Card */}
            <div
              className={`relative bg-[#1a1a1a]/80 backdrop-blur-sm rounded-lg p-6 border-2 transition-all duration-300 ${
                pulseApos ? 'scale-105' : 'scale-100'
              }`}
              style={{
                borderColor: '#9d4edd',
                boxShadow: pulseApos
                  ? '0 0 30px rgba(157, 78, 221, 0.6), 0 0 60px rgba(157, 78, 221, 0.3)'
                  : '0 0 15px rgba(157, 78, 221, 0.3)',
              }}
              data-testid="card-apos"
            >
              <div className="text-center">
                <p className="font-mono text-sm md:text-base text-gray-400 mb-4 tracking-wider uppercase">
                  APÓS:
                </p>
                <div
                  className="font-mono text-5xl md:text-6xl font-bold tracking-tight"
                  style={{
                    color: '#9d4edd',
                    textShadow: '0 0 10px rgba(157, 78, 221, 0.5)',
                  }}
                  data-testid="text-apos-value"
                >
                  {aposData?.multiplicador ? `${aposData.multiplicador.toFixed(2)}X` : '--'}
                </div>
              </div>
            </div>

            {/* SACAR: Card */}
            <div
              className={`relative bg-[#1a1a1a]/80 backdrop-blur-sm rounded-lg p-6 border-2 transition-all duration-300 ${
                pulseSacar ? 'scale-105' : 'scale-100'
              }`}
              style={{
                borderColor: '#9d4edd',
                boxShadow: pulseSacar
                  ? '0 0 30px rgba(157, 78, 221, 0.6), 0 0 60px rgba(157, 78, 221, 0.3)'
                  : '0 0 15px rgba(157, 78, 221, 0.3)',
              }}
              data-testid="card-sacar"
            >
              <div className="text-center">
                <p className="font-mono text-sm md:text-base text-gray-400 mb-4 tracking-wider uppercase">
                  SACAR:
                </p>
                <div
                  className="font-mono text-5xl md:text-6xl font-bold tracking-tight"
                  style={{
                    color: '#9d4edd',
                    textShadow: '0 0 10px rgba(157, 78, 221, 0.5)',
                  }}
                  data-testid="text-sacar-value"
                >
                  {sacarData?.multiplicador ? `${sacarData.multiplicador.toFixed(2)}X` : '--'}
                </div>
              </div>
            </div>
          </div>

          {/* Iframe Container */}
          <div
            className="relative rounded-lg overflow-hidden border"
            style={{
              borderColor: 'rgba(157, 78, 221, 0.3)',
              boxShadow: '0 0 20px rgba(157, 78, 221, 0.2)',
            }}
          >
            <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
              <iframe
                src="https://www.txunabet.co.mz/"
                className="absolute inset-0 w-full h-full"
                title="Aviator Game"
                data-testid="iframe-aviator"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
              />
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-8 p-6 bg-[#1a1a1a]/60 backdrop-blur-sm rounded-lg border border-[#9d4edd]/20">
            <h2 className="font-cyber text-xl md:text-2xl font-bold mb-4" style={{ color: '#9d4edd' }}>
              Como usar:
            </h2>
            <ol className="space-y-3 text-gray-300 font-mono text-sm md:text-base">
              <li className="flex items-start">
                <span className="text-[#9d4edd] mr-3 font-bold">1.</span>
                <span>Abra o console do navegador (F12 ou Ctrl+Shift+J)</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#9d4edd] mr-3 font-bold">2.</span>
                <span>Cole o script aviator-script.js disponível no projeto</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#9d4edd] mr-3 font-bold">3.</span>
                <span>Configure a variável API_URL se necessário</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#9d4edd] mr-3 font-bold">4.</span>
                <span>Os multiplicadores serão capturados e analisados automaticamente</span>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
