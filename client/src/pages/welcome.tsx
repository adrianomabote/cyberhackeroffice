
import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { useProtection } from '@/hooks/use-protection';
import { Sparkles, TrendingUp, Shield } from 'lucide-react';

export default function Welcome() {
  useProtection();
  const [, setLocation] = useLocation();

  const handleContinuar = () => {
    // Marcar como já viu a mensagem de boas-vindas nesta sessão
    sessionStorage.setItem('hasSeenWelcome', 'true');
    setLocation('/app');
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center">
      {/* Background effects */}
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

      <div className="relative z-20 w-full max-w-2xl mx-auto p-8">
        {/* Header */}
        <div
          className="rounded-xl border py-6 mb-8"
          style={{
            borderColor: '#ff0000',
            borderWidth: '2px',
            backgroundColor: 'transparent',
          }}
        >
          <h1 className="text-center font-display font-bold tracking-wide mb-3"
            style={{
              color: '#ff0000',
              fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
              textShadow: '0 0 30px rgba(255, 0, 0, 0.7)',
            }}
          >
            BEM-VINDO!
          </h1>
          <p className="text-center font-sans font-normal"
            style={{
              color: '#ffffff',
              fontSize: 'clamp(0.9rem, 2vw, 1.2rem)',
            }}
          >
            Sistema Cyber Hacker Ativado
          </p>
        </div>

        {/* Informações */}
        <div
          className="rounded-xl border p-6 mb-8"
          style={{
            borderColor: '#444444',
            borderWidth: '1px',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          }}
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: '#ff0000' }}>
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-sans font-bold text-white text-lg mb-2">
                Sinais em Tempo Real
              </h3>
              <p className="font-sans text-gray-300">
                Receba alertas precisos sobre <span className="text-red-700 font-bold">QUANDO entrar</span> e <span className="text-red-700 font-bold">ONDE sacar</span> no Aviator
              </p>
            </div>
          </div>
        </div>

        {/* Instruções */}
        <div
          className="rounded-xl border p-6 mb-8"
          style={{
            borderColor: '#444444',
            borderWidth: '1px',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          }}
        >
          <h3 className="font-sans font-bold text-white text-lg mb-4 text-center">
            Como Usar
          </h3>
          <div className="space-y-3 text-gray-300 font-sans">
            <p>
              <span className="text-red-700 font-bold">1.</span> Aguarde o sistema mostrar os valores de APÓS e SACAR
            </p>
            <p>
              <span className="text-red-700 font-bold">2.</span> Quando aparecer, entre no jogo após o multiplicador indicado
            </p>
            <p>
              <span className="text-red-700 font-bold">3.</span> Saque no multiplicador recomendado
            </p>
            <p>
              <span className="text-red-700 font-bold">4.</span> Aguarde o próximo sinal
            </p>
          </div>
        </div>

        {/* Botão Continuar */}
        <button
          onClick={handleContinuar}
          className="w-full py-3 rounded-xl font-sans font-bold text-lg transition-all hover:opacity-80"
          style={{
            backgroundColor: '#00bfff',
            color: '#000000',
            border: 'none',
          }}
        >
          CONTINUAR PARA SINAIS
        </button>
      </div>
    </div>
  );
}
