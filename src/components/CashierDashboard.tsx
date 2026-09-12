'use client';

import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import { useSoundAlert } from '@/hooks/useSoundAlert';
import confetti from 'canvas-confetti';
import { 
  CheckCircle2, 
  Volume2, 
  VolumeX, 
  Smartphone, 
  Battery, 
  BatteryCharging, 
  Clock, 
  ShieldCheck,
  RotateCw,
  Sparkles
} from 'lucide-react';

interface Transaction {
  id: string;
  source: 'nequi' | 'daviplata' | 'bancolombia' | 'transfiya' | 'otro';
  amount: number;
  sender_name: string;
  reference_code?: string;
  status: 'unclaimed' | 'claimed';
  created_at: string;
}

interface SensorDevice {
  device_name: string;
  is_online: boolean;
  battery_level: number;
  is_charging: boolean;
  last_heartbeat_at: string;
}

const INITIAL_DEMO_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-1',
    source: 'nequi',
    amount: 35000,
    sender_name: 'Carlos Mario Ospina',
    reference_code: 'M884679',
    status: 'unclaimed',
    created_at: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
  },
  {
    id: 'tx-2',
    source: 'daviplata',
    amount: 82000,
    sender_name: 'Andrea Gómez Restrepo',
    reference_code: 'D901243',
    status: 'claimed',
    created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
];

export default function CashierDashboard({ organizationId = 'org-demo' }: { organizationId?: string }) {
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_DEMO_TRANSACTIONS);
  const [latestTx, setLatestTx] = useState<Transaction | null>(INITIAL_DEMO_TRANSACTIONS[0]);
  const [device, setDevice] = useState<SensorDevice>({
    device_name: 'Celular Mostrador (Nequi)',
    is_online: true,
    battery_level: 86,
    is_charging: true,
    last_heartbeat_at: new Date().toISOString(),
  });

  const { audioEnabled, enableAudio, triggerAlert } = useSoundAlert();

  // Suscripción Realtime solo si Supabase está configurado con claves reales
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const fetchTransactions = async () => {
      try {
        const { data } = await supabase
          .from('transactions')
          .select('*')
          .eq('organization_id', organizationId)
          .order('created_at', { ascending: false })
          .limit(20);

        if (data && data.length > 0) {
          setTransactions(data);
          setLatestTx(data[0]);
        }
      } catch (e) {}
    };

    fetchTransactions();

    const channel = supabase
      .channel(`pos:${organizationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'transactions',
          filter: `organization_id=eq.${organizationId}`,
        },
        (payload) => {
          const newTx = payload.new as Transaction;
          setTransactions((prev) => [newTx, ...prev]);
          setLatestTx(newTx);

          triggerAlert(newTx.amount, newTx.sender_name, newTx.source.toUpperCase());

          try {
            confetti({
              particleCount: 50,
              spread: 60,
              origin: { y: 0.7 },
              colors: ['#10B981', '#059669', '#34D399'],
            });
          } catch (e) {}
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [organizationId, triggerAlert]);

  // Simulación de prueba instantánea
  const handleTestAlert = () => {
    enableAudio();
    const mockNames = ['Carlos Mario Ospina', 'Andrea Gómez', 'Juan Pablo Montoya', 'Valentina Ríos'];
    const mockAmounts = [25000, 45000, 80000, 120000, 15500];
    const chosenName = mockNames[Math.floor(Math.random() * mockNames.length)];
    const chosenAmount = mockAmounts[Math.floor(Math.random() * mockAmounts.length)];

    const mockTx: Transaction = {
      id: 'demo-' + Date.now(),
      source: 'nequi',
      amount: chosenAmount,
      sender_name: chosenName,
      reference_code: 'M' + Math.floor(100000 + Math.random() * 900000),
      status: 'unclaimed',
      created_at: new Date().toISOString(),
    };

    setTransactions((prev) => [mockTx, ...prev]);
    setLatestTx(mockTx);
    triggerAlert(mockTx.amount, mockTx.sender_name, 'Nequi');

    try {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10B981', '#3B82F6', '#8B5CF6'],
      });
    } catch (e) {}
  };

  const markAsClaimed = (id: string) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: 'claimed' } : t))
    );
    if (latestTx?.id === id) {
      setLatestTx((prev) => (prev ? { ...prev, status: 'claimed' } : null));
    }
  };

  const formatCOP = (val: number) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* BARRA SUPERIOR DE ESTADO */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-black text-xl shadow-inner">
            ✓
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
              ConfirmaYa <span className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-semibold">Caja 1</span>
            </h1>
            <p className="text-xs text-slate-400">Protección Anti-Estafas en Tiempo Real</p>
          </div>
        </div>

        {/* ESTADO DEL CELULAR RECEPTOR & ACCIONES */}
        <div className="flex items-center flex-wrap gap-3">
          {/* Indicador de Teléfono */}
          <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs text-slate-300">
            <Smartphone className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline font-medium">{device.device_name}</span>
            <div className="flex items-center gap-1 font-bold text-emerald-400">
              {device.is_charging ? <BatteryCharging className="w-4 h-4" /> : <Battery className="w-4 h-4" />}
              {device.battery_level}%
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
          </div>

          {/* Botón de Sonido */}
          <button
            onClick={enableAudio}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
              audioEnabled 
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 shadow-sm' 
                : 'bg-amber-500/20 border-amber-500/40 text-amber-300 animate-pulse'
            }`}
          >
            {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span>{audioEnabled ? 'Voz Activa' : 'Activar Sonido'}</span>
          </button>

          {/* Botón Simular Prueba */}
          <button
            onClick={handleTestAlert}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-xs font-bold text-white shadow-lg shadow-emerald-900/30 transition-all active:scale-95"
          >
            <Sparkles className="w-4 h-4" />
            <span>Probar Pago en Vivo</span>
          </button>
        </div>
      </header>

      {/* ÁREA PRINCIPAL */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* COLUMNA IZQUIERDA (2 COLS): PAGO EN GRANDE */}
        <section className="lg:col-span-2 flex flex-col">
          {latestTx ? (
            <div className={`p-8 rounded-3xl border transition-all duration-500 relative overflow-hidden flex flex-col justify-between flex-1 ${
              latestTx.status === 'unclaimed'
                ? 'bg-gradient-to-br from-emerald-950/80 via-slate-900 to-slate-900 border-emerald-500/50 shadow-2xl shadow-emerald-950/60'
                : 'bg-slate-900/90 border-slate-800 opacity-90'
            }`}>
              
              {/* Encabezado de la Tarjeta */}
              <div className="flex items-center justify-between mb-4">
                <span className="flex items-center gap-2 text-xs font-black uppercase tracking-wider px-3.5 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Transferencia 100% Confirmada en Cuenta
                </span>

                <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                  <Clock className="w-3.5 h-3.5" />
                  {new Date(latestTx.created_at).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>

              {/* MONTO GIGANTE */}
              <div className="my-8">
                <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Monto Real Recibido</p>
                <div className="text-6xl sm:text-7xl lg:text-8xl font-black tracking-tight text-emerald-400 drop-shadow-sm mt-2">
                  {formatCOP(latestTx.amount)}
                </div>
              </div>

              {/* DETALLES DEL EMISOR */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 py-6 border-t border-slate-800/80 bg-slate-950/30 rounded-2xl px-6 mb-6">
                <div>
                  <p className="text-xs font-medium text-slate-400 uppercase">Enviado por</p>
                  <p className="text-xl font-bold text-white truncate mt-0.5">{latestTx.sender_name}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-400 uppercase">Billetera / Canal</p>
                  <p className="text-xl font-black uppercase text-purple-400 mt-0.5">{latestTx.source}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-400 uppercase">Referencia / M10</p>
                  <p className="text-xl font-mono font-semibold text-slate-200 mt-0.5">{latestTx.reference_code || 'N/A'}</p>
                </div>
              </div>

              {/* BOTÓN DE ACCIÓN EN CAJA */}
              <div>
                {latestTx.status === 'unclaimed' ? (
                  <button
                    onClick={() => markAsClaimed(latestTx.id)}
                    className="w-full py-5 bg-emerald-500 hover:bg-emerald-400 active:scale-[0.99] text-slate-950 font-black text-xl rounded-2xl transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-3"
                  >
                    <CheckCircle2 className="w-7 h-7" />
                    Entregar Pedido / Asociar a Factura
                  </button>
                ) : (
                  <div className="w-full py-4 bg-slate-800/60 text-slate-300 font-bold text-base text-center rounded-2xl border border-slate-700/60 flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    Pago ya entregado y despachado por el cajero
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-96 rounded-3xl border border-dashed border-slate-800 bg-slate-900/30 flex flex-col items-center justify-center text-slate-500 gap-3">
              <RotateCw className="w-8 h-8 animate-spin text-slate-600" />
              <p className="text-sm">Esperando transferencias en vivo de Nequi o Daviplata...</p>
            </div>
          )}
        </section>

        {/* COLUMNA DERECHA: HISTORIAL RECIENTE DEL TURNO */}
        <section className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-black text-white">Cobros del Turno</h2>
            <span className="text-xs text-slate-300 bg-slate-800 border border-slate-700/80 px-3 py-1 rounded-full font-bold">
              {transactions.length} pagos
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[600px]">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                onClick={() => setLatestTx(tx)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  latestTx?.id === tx.id
                    ? 'bg-slate-800/90 border-emerald-500/60 shadow-lg'
                    : 'bg-slate-900/40 border-slate-800/80 hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-black uppercase tracking-wider text-purple-400">
                    {tx.source}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">
                    {new Date(tx.created_at).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-slate-200 truncate max-w-[160px]">{tx.sender_name}</p>
                  <p className="text-lg font-black text-emerald-400">{formatCOP(tx.amount)}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
}
