import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useProtection } from "@/hooks/use-protection";
import type { UltimaVelaResponse, PrevisaoResponse, ManutencaoStatus, SinaisManual } from "@shared/schema";
import { api } from "@/lib/api";

export default function Home() {
  useProtection();
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
    queryFn: () => api.get<ManutencaoStatus>('/api/manutencao/cyber'),
    refetchInterval: 5000, // Verifica a cada 5 segundos
    staleTime: 0,
  });

  // Buscar sinais manuais
  const { data: sinaisManualData } = useQuery<SinaisManual>({
    queryKey: ['/api/sinais-manual/cyber'],
    queryFn: () => api.get<SinaisManual>('/api/sinais-manual/cyber'),
    refetchInterval: 1000,
    staleTime: 0,
  });

  // Buscar última vela (APÓS:)
  const { data: aposData } = useQuery<UltimaVelaResponse>({
    queryKey: ['/api/apos/cyber'],
    queryFn: () => api.get<UltimaVelaResponse>('/api/apos/cyber'),
    refetchInterval: 2000, // Atualiza a cada 2 segundos
    staleTime: 1000,
  });

  // Buscar previsão (SACAR:)
  const { data: sacarData } = useQuery<PrevisaoResponse>({
    queryKey: ['/api/sacar/cyber'],
    queryFn: () => api.get<PrevisaoResponse>('/api/sacar/cyber'),
    refetchInterval: 2000, // Atualiza a cada 2 segundos
    staleTime: 1000,
  });

  // Função para retornar cor baseada no multiplicador (cores da foto)
  const getMultiplicadorColor = (valor: number): string => {
    if (valor >= 10.0) return '#ff1493'; // Rosa vibrante (10.00x+) - como na foto
    if (valor >= 2.0) return '#9d4edd';  // Roxo (2.00x - 9.99x)
    return '#00bfff';                     // Azul cyan (1.00x - 1.99x)
  };

  // Verificar se é hora de entrar
  const isHoraDeEntrar = sacarData?.sinal === 'ENTRAR';

  // Determinar se devemos usar sinais manuais
  const usarSinaisManual = sinaisManualData?.ativo === true;
  
  // Determinar valores a exibir baseado na prioridade
  let valorAposExibir = null;
  let valorSacarExibir = null;
  let mostrarTresPontos = true; // Por padrão, mostra os três pontos

  // Verificar se há sinal manual ativo e com valores válidos
  const temSinalManualValido = usarSinaisManual && 
    (sinaisManualData?.apos !== null && sinaisManualData?.apos !== undefined) && 
    (sinaisManualData?.sacar !== null && sinaisManualData?.sacar !== undefined);

  if (temSinalManualValido) {
    // Prioridade 1: Sinais manuais - SEMPRE exibir quando ativo (independente do script)
    valorAposExibir = sinaisManualData.apos;
    valorSacarExibir = sinaisManualData.sacar;
    mostrarTresPontos = false; // Não mostrar os três pontos quando houver sinal manual
    
    // Atualizar o estado para mostrar a entrada
    if (!mostrandoEntrada) {
      setMostrandoEntrada(true);
    }
    
    // Atualizar a última entrada mostrada para os valores manuais
    if (ultimaEntradaMostrada?.multiplicadorApos !== valorAposExibir || 
        ultimaEntradaMostrada?.multiplicadorSacar !== valorSacarExibir) {
      setUltimaEntradaMostrada({
        multiplicadorApos: valorAposExibir,
        multiplicadorSacar: valorSacarExibir
      });
    }
  } else if (mostrandoEntrada && ultimaEntradaMostrada) {
    // Prioridade 2: Sistema automático: manter último sinal mostrado
    valorAposExibir = ultimaEntradaMostrada.multiplicadorApos;
    valorSacarExibir = ultimaEntradaMostrada.multiplicadorSacar;
    mostrarTresPontos = false; // Não mostrar os três pontos quando houver entrada válida
  }

  // Estado para controlar o último multiplicador processado
  const [ultimoMultiplicador, setUltimoMultiplicador] = useState<number | null>(null);

  // Lógica: mostrar entrada até receber nova vela
  useEffect(() => {
    // Se houver sinal manual ativo, não atualizar com dados automáticos
    if (temSinalManualValido) {
      // Garantir que estamos mostrando a entrada para sinais manuais
      if (!mostrandoEntrada) {
        setMostrandoEntrada(true);
      }
      return;
    }

    // Se não houver sinal manual ativo, verificar se há sinal automático
    if (isHoraDeEntrar && aposData?.multiplicador && sacarData?.multiplicador) {
      // Verificar se é uma entrada NOVA (diferente da última mostrada)
      const isNovaEntrada = !ultimaEntradaMostrada || 
        ultimaEntradaMostrada.multiplicadorApos !== aposData.multiplicador;

      if (isNovaEntrada) {
        setMostrandoEntrada(true);
        setUltimaEntradaMostrada({
          multiplicadorApos: aposData.multiplicador,
          multiplicadorSacar: sacarData.multiplicador,
        });
      }
    }
  }, [isHoraDeEntrar, aposData?.multiplicador, sacarData?.multiplicador]);

  // Limpar apenas quando receber -1 (sinal de três pontinhos)
  useEffect(() => {
    if (aposData?.multiplicador === -1) {
      setMostrandoEntrada(false);
    }
  }, [aposData?.multiplicador]);

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
                      color: mostrandoEntrada && valorAposExibir ? getMultiplicadorColor(valorAposExibir) : '#888888',
                      fontSize: 'clamp(1rem, 3vw, 2.25rem)',
                    }}
                    data-testid="text-apos-value"
                  >
                    {mostrandoEntrada && valorAposExibir && !mostrarTresPontos ? `${valorAposExibir.toFixed(2)}X` : '...'}
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
                      color: mostrandoEntrada && valorSacarExibir ? getMultiplicadorColor(valorSacarExibir) : '#888888',
                      fontSize: 'clamp(1rem, 3vw, 2.25rem)',
                    }}
                    data-testid="text-sacar-value"
                  >
                    {mostrandoEntrada && valorSacarExibir && !mostrarTresPontos ? `${valorSacarExibir.toFixed(2)}X` : '...'}
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