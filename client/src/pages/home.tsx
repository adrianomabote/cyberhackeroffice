import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useProtection } from "@/hooks/use-protection";
import { useAuth, logout } from "@/hooks/use-auth";
import { LogOut } from "lucide-react";
import type { UltimaVelaResponse, PrevisaoResponse, ManutencaoStatus, SinaisManual } from "@shared/schema";
import { ResultadosClienteDialog } from "@/components/ResultadosClienteDialog";

export default function Home() {
  useProtection(); // Proteção de código
  useAuth(); // Proteção de autenticação - REDIRECIONA SE NÃO LOGADO
  const [, setLocation] = useLocation();

  // Verificar se já viu a mensagem de boas-vindas
  useEffect(() => {
    const hasSeenWelcome = sessionStorage.getItem('hasSeenWelcome');
    if (!hasSeenWelcome) {
      setLocation('/welcome');
    }
  }, [setLocation]);
  const [pulseApos, setPulseApos] = useState(false);
  const [pulseSacar, setPulseSacar] = useState(false);
  const [ultimaEntradaMostrada, setUltimaEntradaMostrada] = useState<{
    multiplicadorApos: number;
    multiplicadorSacar: number;
  } | null>(null);
  const [mostrandoEntrada, setMostrandoEntrada] = useState(false);

  // Verificar status de manutenção
  const { data: manutencaoData } = useQuery<ManutencaoStatus>({
    queryKey: ['/api/manutencao/cyber'],
    refetchInterval: 5000, // Verifica a cada 5 segundos
    staleTime: 0,
  });

  // Buscar sinais manuais
  const { data: sinaisManualData } = useQuery<SinaisManual>({
    queryKey: ['/api/sinais-manual/cyber'],
    refetchInterval: 1000,
    staleTime: 0,
  });

  // Buscar última vela (APÓS:) - sempre dados frescos sem cache
  const { data: aposData } = useQuery<UltimaVelaResponse>({
    queryKey: ['/api/apos/cyber'],
    queryFn: async () => {
      const res = await fetch('/api/apos/cyber', {
        cache: 'no-store', // Força buscar sem cache
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
        },
      });
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      console.log('[FRONTEND APÓS] Dados recebidos:', data);
      return data;
    },
    refetchInterval: 1000,
    staleTime: 0,
    gcTime: 0, // Não manter em cache
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

  // Buscar análise automática de velas (últimas 10)
  interface AnalisadorResponse {
    apos: number | null;
    sacar: number | null;
    sinal: string;
    confianca: string;
    motivo: string;
    pontos: number;
    velas_analisadas: number;
    media10?: number;
  }

  const { data: analisadorData } = useQuery<AnalisadorResponse>({
    queryKey: ['/api/analisar-velas-cyber'],
    queryFn: async () => {
      const res = await fetch('/api/analisar-velas-cyber');
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

  // Verificar se é hora de entrar (do sistema antigo OU novo analisador)
  const isHoraDeEntrar = sacarData?.sinal === 'ENTRAR' || analisadorData?.sinal === 'ENTRAR';

  // Usar sinais manuais se estiverem ativos, senão usar automáticos
  const usarSinaisManual = sinaisManualData?.ativo === true;

  // Determinar valores a exibir baseado na prioridade
  let valorAposExibir = null;
  let valorSacarExibir = null;
  let deveMostrarValores = false;
  let infoAnalise = '';

  if (usarSinaisManual) {
    // Prioridade 1: Sinais manuais - SEMPRE exibir quando ativo (independente do script)
    valorAposExibir = sinaisManualData?.apos ?? null;
    valorSacarExibir = sinaisManualData?.sacar ?? null;
    deveMostrarValores = valorAposExibir !== null && valorSacarExibir !== null;
  } else {
    // Prioridade 2: Sistema automático com NOVO ANALISADOR (últimas 10 velas)
    if (analisadorData?.sinal === 'ENTRAR' && analisadorData?.apos && analisadorData?.sacar) {
      valorAposExibir = analisadorData.apos;
      valorSacarExibir = analisadorData.sacar;
      deveMostrarValores = true;
      infoAnalise = `${analisadorData.pontos}pts | ${analisadorData.confianca}`;
    }
    // Fallback: Sistema antigo se novo analisador não tiver oportunidade
    else if (isHoraDeEntrar && mostrandoEntrada && aposData?.multiplicador && aposData.multiplicador !== -1 && sacarData?.multiplicador) {
      valorAposExibir = aposData.multiplicador;
      valorSacarExibir = sacarData.multiplicador;
      deveMostrarValores = true;
    } else {
      // Em todos os outros casos, mostrar "..."
      deveMostrarValores = false;
    }
  }

  // Lógica: ENTRAR apenas quando recebemos sinal ENTRAR COM DADOS VÁLIDOS
  useEffect(() => {
    // SÓ ATIVA quando: isHoraDeEntrar + dados válidos + não está já mostrando entrada
    if (isHoraDeEntrar && aposData?.multiplicador && aposData.multiplicador !== -1 && sacarData?.multiplicador && !mostrandoEntrada) {
      // Verificar se é uma entrada NOVA (diferente da última mostrada)
      const isNovaEntrada = !ultimaEntradaMostrada || 
        ultimaEntradaMostrada.multiplicadorApos !== aposData.multiplicador ||
        ultimaEntradaMostrada.multiplicadorSacar !== sacarData.multiplicador;

      if (isNovaEntrada) {
        console.log('[HOME] Ativando mostrandoEntrada para nova entrada');
        // Mostrar entrada e salvar valores
        setMostrandoEntrada(true);
        setUltimaEntradaMostrada({
          multiplicadorApos: aposData.multiplicador,
          multiplicadorSacar: sacarData.multiplicador,
        });
      }
    }
  }, [isHoraDeEntrar, aposData?.multiplicador, sacarData?.multiplicador, mostrandoEntrada, ultimaEntradaMostrada]);

  // Resetar quando nova vela chegar (IMPORTANTE: mostrar ... após vela cair)
  useEffect(() => {
    if (mostrandoEntrada && ultimaEntradaMostrada && aposData?.multiplicador && aposData.multiplicador !== -1) {
      if (ultimaEntradaMostrada.multiplicadorApos !== aposData.multiplicador) {
        // Nova vela chegou - limpar e mostrar pontinhos
        console.log('[HOME] Nova vela detectada, resetando mostrandoEntrada');
        setMostrandoEntrada(false);
        setUltimaEntradaMostrada(null);
      }
    }
  }, [aposData?.multiplicador, mostrandoEntrada, ultimaEntradaMostrada]);

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

  // Se sistema em manutenção, mostrar tela de manutenção
  if (manutencaoData?.ativo) {
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

        <div className="relative z-20 w-full max-w-3xl mx-auto p-8">
          {/* Header MANUTENÇÃO */}
          <div
            className="rounded-xl border py-8 mb-6"
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

          {/* Card com informações */}
          <div
            className="rounded-xl border p-8 mb-6"
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
        {/* Header CYBER HACKER com Botão Sair */}
        <div className="w-full px-4 pt-4 pb-2">
          <div
            className="rounded-xl border py-4 w-full relative"
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
            
            {/* Botão Sair - Canto superior direito */}
            <button
              onClick={logout}
              className="absolute top-2 right-2 p-2 rounded-lg transition-colors"
              style={{
                backgroundColor: 'rgba(255, 0, 0, 0.1)',
                borderColor: '#ff0000',
                borderWidth: '1px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 0, 0, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 0, 0, 0.1)';
              }}
              title="Sair"
              data-testid="button-logout"
            >
              <LogOut className="w-4 h-4" style={{ color: '#ff0000' }} />
            </button>
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
              {/* APÓS: mostra apenas quando é hora de entrar E está mostrandoEntrada */}
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
                      color: deveMostrarValores && valorAposExibir ? getMultiplicadorColor(valorAposExibir) : '#888888',
                      fontSize: 'clamp(1rem, 3vw, 2.25rem)',
                    }}
                    data-testid="text-apos-value"
                  >
                    {deveMostrarValores && valorAposExibir ? `${valorAposExibir.toFixed(2)}X` : '...'}
                  </span>
                </div>
              </div>

              {/* SACAR: mostra apenas quando é hora de entrar E está mostrandoEntrada */}
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
                      color: deveMostrarValores && valorSacarExibir ? getMultiplicadorColor(valorSacarExibir) : '#888888',
                      fontSize: 'clamp(1rem, 3vw, 2.25rem)',
                    }}
                    data-testid="text-sacar-value"
                  >
                    {deveMostrarValores && valorSacarExibir ? `${valorSacarExibir.toFixed(2)}X` : '...'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Iframe Casa de Apostas */}
        <div className="w-full px-4 py-2">
          <div className="w-full rounded-[8px] overflow-hidden border-0" style={{ borderColor: '#444444' }}>
            <iframe
              src="https://go.aff.oddsbest.co/3iaj17cv"
              className="w-full min-w-[350px]"
              style={{ height: '800px', border: 'none' }}
              title="Casa de Apostas"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
            />
          </div>
        </div>
      </div>

      {/* Diálogo de Resultados dos Clientes */}
      <ResultadosClienteDialog />
    </div>
  );
}