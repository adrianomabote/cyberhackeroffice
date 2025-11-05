import { useEffect } from 'react';
import { useLocation } from 'wouter';

export default function Splash() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    const timer = setTimeout(() => {
      setLocation('/');
    }, 3000);

    return () => clearTimeout(timer);
  }, [setLocation]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center overflow-hidden">
      <div className="text-center">
        <div className="mb-8 animate-pulse">
          <h1 
            className="text-6xl md:text-8xl font-bold tracking-wider"
            style={{
              color: '#ff0000',
              textShadow: '0 0 30px #ff0000, 0 0 60px #ff0000, 0 0 90px #ff0000',
              fontFamily: 'Orbitron, monospace'
            }}
            data-testid="text-splash-title"
          >
            ROBÔ CYBER HACKER
          </h1>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-3 h-3 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-3 h-3 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>

          <p 
            className="text-xl md:text-2xl font-mono text-white animate-pulse"
            data-testid="text-processing"
          >
            PROCESSANDO SISTEMA...
          </p>

          <div className="mt-8 w-64 h-2 bg-gray-800 rounded-full overflow-hidden mx-auto">
            <div 
              className="h-full bg-gradient-to-r from-red-600 to-red-400 animate-[loading_2s_ease-in-out_infinite]"
              style={{
                animation: 'loading 2s ease-in-out infinite'
              }}
            ></div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes loading {
          0% { width: 0%; }
          50% { width: 100%; }
          100% { width: 0%; }
        }
      `}</style>
    </div>
  );
}
