import { useQuery } from "@tanstack/react-query";
import { useEffect, useState, useRef } from "react";
import type { UltimaVelaResponse, PrevisaoResponse, HistoricoResponse, EstatisticasResponse, PadroesResponse } from "@shared/schema";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { TrendingUp, TrendingDown, Activity, BarChart3, AlertTriangle, Info, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [pulseApos, setPulseApos] = useState(false);
  const [pulseSacar, setPulseSacar] = useState(false);
  const { toast } = useToast();
  const padroesNotificadosRef = useRef<Set<string>>(new Set());

  // Buscar última vela (DEPOIS DE:)
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

  // Buscar previsão (TIRAR NO:)
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

  // Buscar histórico completo
  const { data: historicoData } = useQuery<HistoricoResponse>({
    queryKey: ['/api/historico'],
    queryFn: async () => {
      const res = await fetch('/api/historico?limit=50');
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    },
    refetchInterval: 2000,
    staleTime: 0,
  });

  // Buscar estatísticas
  const { data: statsData } = useQuery<EstatisticasResponse>({
    queryKey: ['/api/estatisticas'],
    queryFn: async () => {
      const res = await fetch('/api/estatisticas');
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    },
    refetchInterval: 2000,
    staleTime: 0,
  });

  // Buscar padrões detectados
  const { data: padroesData } = useQuery<PadroesResponse>({
    queryKey: ['/api/padroes'],
    queryFn: async () => {
      const res = await fetch('/api/padroes');
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    },
    refetchInterval: 3000,
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

  // Notificar quando padrões forem detectados
  useEffect(() => {
    if (padroesData?.padroes && padroesData.padroes.length > 0) {
      padroesData.padroes.forEach(padrao => {
        const padraoKey = `${padrao.tipo}-${padrao.mensagem}`;
        
        if (!padroesNotificadosRef.current.has(padraoKey)) {
          padroesNotificadosRef.current.add(padraoKey);

          const IconComponent = 
            padrao.severidade === 'warning' ? AlertTriangle :
            padrao.severidade === 'success' ? CheckCircle :
            Info;

          toast({
            title: padrao.tipo.replace(/_/g, ' ').toUpperCase(),
            description: padrao.mensagem,
            variant: padrao.severidade === 'warning' ? 'destructive' : 'default',
            duration: 5000,
          });

          setTimeout(() => {
            padroesNotificadosRef.current.delete(padraoKey);
          }, 10000);
        }
      });
    }
  }, [padroesData, toast]);

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
            {/* DEPOIS DE: Card */}
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
                  DEPOIS DE:
                </p>
                <div
                  className="font-mono text-5xl md:text-6xl font-bold tracking-tight"
                  style={{
                    color: '#9d4edd',
                    textShadow: '0 0 10px rgba(157, 78, 221, 0.5)',
                  }}
                  data-testid="text-apos-value"
                >
                  {aposData?.multiplicador ? `${aposData.multiplicador.toFixed(2)}x` : '--'}
                </div>
              </div>
            </div>

            {/* TIRAR NO: Card */}
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
                  TIRAR NO:
                </p>
                <div
                  className="font-mono text-5xl md:text-6xl font-bold tracking-tight"
                  style={{
                    color: '#9d4edd',
                    textShadow: '0 0 10px rgba(157, 78, 221, 0.5)',
                  }}
                  data-testid="text-sacar-value"
                >
                  {sacarData?.multiplicador ? `${sacarData.multiplicador.toFixed(2)}x` : '--'}
                </div>
              </div>
            </div>
          </div>

          {/* Estatísticas Avançadas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {/* Tendência */}
            <div
              className="bg-[#1a1a1a]/80 backdrop-blur-sm rounded-lg p-4 border"
              style={{
                borderColor: '#9d4edd',
                boxShadow: '0 0 10px rgba(157, 78, 221, 0.2)',
              }}
              data-testid="card-tendencia"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs text-gray-400 uppercase">Tendência</span>
                {statsData?.tendencia?.tipo === 'alta' ? (
                  <TrendingUp className="w-4 h-4 text-green-500" />
                ) : statsData?.tendencia?.tipo === 'baixa' ? (
                  <TrendingDown className="w-4 h-4 text-red-500" />
                ) : (
                  <Activity className="w-4 h-4 text-gray-400" />
                )}
              </div>
              <div className="text-2xl font-bold" style={{ color: '#9d4edd' }}>
                {statsData?.tendencia?.tipo?.toUpperCase() || '--'}
              </div>
              <div className="text-xs font-mono text-gray-500 mt-1">
                {statsData?.tendencia?.percentual !== undefined ? 
                  `${statsData.tendencia.percentual > 0 ? '+' : ''}${statsData.tendencia.percentual}%` : 
                  '--'}
              </div>
            </div>

            {/* Volatilidade */}
            <div
              className="bg-[#1a1a1a]/80 backdrop-blur-sm rounded-lg p-4 border"
              style={{
                borderColor: '#9d4edd',
                boxShadow: '0 0 10px rgba(157, 78, 221, 0.2)',
              }}
              data-testid="card-volatilidade"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs text-gray-400 uppercase">Volatilidade</span>
                <BarChart3 className="w-4 h-4" style={{ color: '#9d4edd' }} />
              </div>
              <div className="text-2xl font-bold" style={{ color: '#9d4edd' }}>
                {statsData?.volatilidade?.nivel?.toUpperCase() || '--'}
              </div>
              <div className="text-xs font-mono text-gray-500 mt-1">
                {statsData?.volatilidade?.valor ? `${statsData.volatilidade.valor}%` : '--'}
              </div>
            </div>

            {/* Média Móvel 5 */}
            <div
              className="bg-[#1a1a1a]/80 backdrop-blur-sm rounded-lg p-4 border"
              style={{
                borderColor: '#9d4edd',
                boxShadow: '0 0 10px rgba(157, 78, 221, 0.2)',
              }}
              data-testid="card-mm5"
            >
              <div className="mb-2">
                <span className="font-mono text-xs text-gray-400 uppercase">Média 5</span>
              </div>
              <div className="text-2xl font-bold font-mono" style={{ color: '#9d4edd' }}>
                {statsData?.mediasMoveis?.media5 ? `${statsData.mediasMoveis.media5.toFixed(2)}x` : '--'}
              </div>
              <div className="text-xs font-mono text-gray-500 mt-1">
                últimas 5 velas
              </div>
            </div>

            {/* Média Móvel 10 */}
            <div
              className="bg-[#1a1a1a]/80 backdrop-blur-sm rounded-lg p-4 border"
              style={{
                borderColor: '#9d4edd',
                boxShadow: '0 0 10px rgba(157, 78, 221, 0.2)',
              }}
              data-testid="card-mm10"
            >
              <div className="mb-2">
                <span className="font-mono text-xs text-gray-400 uppercase">Média 10</span>
              </div>
              <div className="text-2xl font-bold font-mono" style={{ color: '#9d4edd' }}>
                {statsData?.mediasMoveis?.media10 ? `${statsData.mediasMoveis.media10.toFixed(2)}x` : '--'}
              </div>
              <div className="text-xs font-mono text-gray-500 mt-1">
                últimas 10 velas
              </div>
            </div>
          </div>

          {/* Gráfico de Histórico */}
          <div
            className="mb-8 bg-[#1a1a1a]/80 backdrop-blur-sm rounded-lg p-6 border-2"
            style={{
              borderColor: '#9d4edd',
              boxShadow: '0 0 15px rgba(157, 78, 221, 0.3)',
            }}
            data-testid="card-historico"
          >
            <h2 className="font-cyber text-xl md:text-2xl font-bold mb-6 text-center" style={{ color: '#9d4edd' }}>
              HISTÓRICO DE MULTIPLICADORES
            </h2>
            {historicoData && historicoData.velas.length > 0 ? (
              <div className="h-64 md:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={historicoData.velas.map((vela, index) => ({
                      index: index + 1,
                      multiplicador: vela.multiplicador,
                      time: new Date(vela.timestamp).toLocaleTimeString(),
                    }))}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(157, 78, 221, 0.1)" />
                    <XAxis 
                      dataKey="index" 
                      stroke="#9d4edd" 
                      tick={{ fill: '#9d4edd' }}
                      label={{ value: 'Velas', position: 'insideBottom', offset: -5, fill: '#9d4edd' }}
                    />
                    <YAxis 
                      stroke="#9d4edd" 
                      tick={{ fill: '#9d4edd' }}
                      label={{ value: 'Multiplicador', angle: -90, position: 'insideLeft', fill: '#9d4edd' }}
                      domain={[0, 'auto']}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#1a1a1a',
                        border: '2px solid #9d4edd',
                        borderRadius: '8px',
                        boxShadow: '0 0 15px rgba(157, 78, 221, 0.5)',
                      }}
                      labelStyle={{ color: '#9d4edd' }}
                      itemStyle={{ color: '#9d4edd' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="multiplicador" 
                      stroke="#9d4edd" 
                      strokeWidth={2}
                      dot={{ fill: '#9d4edd', r: 3 }}
                      activeDot={{ r: 6, fill: '#ff0000' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center">
                <p className="text-gray-400 font-mono">Aguardando dados...</p>
              </div>
            )}
            <div className="mt-4 text-center text-sm font-mono text-gray-400">
              Total de velas: <span className="text-[#9d4edd]">{historicoData?.total || 0}</span>
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
