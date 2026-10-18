'use client';

import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import { useSoundAlert } from '@/hooks/useSoundAlert';
import confetti from 'canvas-confetti';
import { QRCodeSVG } from 'qrcode.react';
import { 
  CheckCircle2, 
  Smartphone, 
  ShieldCheck, 
  Sparkles, 
  Clock, 
  Maximize2, 
  Volume2, 
  VolumeX,
  Store,
  ArrowRight
} from 'lucide-react';

interface Transaction {
  id: string;
  source: string;
  amount: number;
  sender_name: string;
  reference_code?: string;
  created_at: string;
}

export default function PantallaClientePage() {
  const [activePayment, setActivePayment] = useState<Transaction | null>(null);
  const [storeName, setStoreName] = useState('Mi Comercio');
  const [organizationId, setOrganizationId] = useState('a0000000-0000-0000-0000-000000000001');
  const [currentTime, setCurrentTime] = useState('');
  const { audioEnabled, enableAudio, triggerAlert } = useSoundAlert();

  // Reloj en tiempo real
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Suscripción Realtime a pagos entrantes
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const channel = supabase
      .channel('customer-display')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'transactions',
        },
        (payload) => {
          const newTx = payload.new as Transaction;
          showPaymentCelebration(newTx);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const showPaymentCelebration = (tx: Transaction) => {
    setActivePayment(tx);
    triggerAlert(tx.amount, tx.sender_name, tx.source.toUpperCase(), 'comercial');

    try {
      confetti({
        particleCount: 80,
        spread: 90,
        origin: { y: 0.6 },
        colors: ['#10B981', '#34D399', '#6EE7B7', '#F59E0B'],
      });
    } catch (e) {}

    // Volver a la pantalla de espera tras 8 segundos
    setTimeout(() => {
      setActivePayment((curr) => (curr?.id === tx.id ? null : curr));
    }, 8000);
  };

  const handleTestSimulation = () => {
    enableAudio();
    const mockTx: Transaction = {
      id: 'demo-' + Date.now(),
      source: 'nequi',
      amount: 25000,
      sender_name: 'Santiago Vélez',
      reference_code: 'M' + Math.floor(100000 + Math.random() * 900000),
      created_at: new Date().toISOString(),
    };
    showPaymentCelebration(mockTx);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const formatCOP = (val: number) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-black overflow-hidden font-sans">
      
      {/* BARRA SUPERIOR DE LA PANTALLA CLIENTE */}
      <header className="px-8 py-5 border-b border-slate-800/80 bg-slate-900/40 backdrop-blur flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-black text-xl shadow-inner">
            ✓
          </div>
          <div>
            <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
              {storeName}
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Punto de Pago Seguro
              </span>
            </h1>
            <p className="text-xs text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Verificación Auditiva y Visual en Vivo por ConfirmaYa
            </p>
          </div>
        </div>

        {/* Reloj y Controles */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-xs font-mono font-bold shadow-inner">
            <Clock className="w-4 h-4 text-emerald-400" />
            <span>{currentTime || '12:00:00'}</span>
          </div>

          <button
            onClick={enableAudio}
            className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
              audioEnabled 
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' 
                : 'bg-amber-500/20 border-amber-500/40 text-amber-300 animate-pulse'
            }`}
            title={audioEnabled ? 'Sonido Activo' : 'Activar Sonido'}
          >
            {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-all"
            title="Pantalla Completa (F11)"
          >
            <Maximize2 className="w-4 h-4" />
          </button>

          <button
            onClick={handleTestSimulation}
            className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Simular Pago</span>
          </button>
        </div>
      </header>

      {/* ÁREA CENTRAL INTERACTIVA */}
      <main className="flex-1 flex items-center justify-center p-6 relative">
        {activePayment ? (
          /* PANTALLA GIGANTE DE CELEBRACIÓN DE PAGO CONFIRMADO */
          <div className="max-w-2xl w-full bg-gradient-to-b from-emerald-950/60 to-slate-900 border-2 border-emerald-500 rounded-3xl p-8 sm:p-12 text-center shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 blur-3xl rounded-full pointer-events-none"></div>

            <div className="w-24 h-24 rounded-full bg-emerald-500/20 border-2 border-emerald-400 text-emerald-400 flex items-center justify-center mx-auto mb-6 shadow-xl animate-bounce">
              <CheckCircle2 className="w-14 h-14" />
            </div>

            <span className="text-xs sm:text-sm font-black uppercase tracking-widest text-emerald-400 mb-2 block">
              ¡Transferencia Verificada y Aprobada!
            </span>

            {/* Monto Gigante */}
            <h2 className="text-5xl sm:text-7xl font-black text-white tracking-tight drop-shadow-md mb-4">
              {formatCOP(activePayment.amount)}
            </h2>

            {/* Detalles del Cliente */}
            <div className="bg-slate-950/60 border border-emerald-500/30 rounded-2xl p-4 sm:p-6 mb-6 flex flex-col sm:flex-row justify-around items-center gap-4">
              <div>
                <span className="text-xs text-slate-400 uppercase font-semibold">Cliente</span>
                <p className="text-xl font-bold text-white">{activePayment.sender_name}</p>
              </div>
              <div className="h-8 w-px bg-slate-800 hidden sm:block"></div>
              <div>
                <span className="text-xs text-slate-400 uppercase font-semibold">Canal de Pago</span>
                <p className="text-xl font-black uppercase text-purple-400">{activePayment.source}</p>
              </div>
              {activePayment.reference_code && (
                <>
                  <div className="h-8 w-px bg-slate-800 hidden sm:block"></div>
                  <div>
                    <span className="text-xs text-slate-400 uppercase font-semibold">Referencia</span>
                    <p className="text-lg font-mono text-slate-300">{activePayment.reference_code}</p>
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center justify-center gap-2 text-emerald-300 text-sm font-bold">
              <span>¡Muchas gracias por tu compra! Tu pago ya fue registrado en la caja.</span>
            </div>
          </div>
        ) : (
          /* PANTALLA EN REPOSO: CÓDIGO QR PARA QUE EL CLIENTE PAGUE */
          <div className="max-w-xl w-full text-center flex flex-col items-center">
            
            <div className="mb-6">
              <span className="text-xs uppercase tracking-widest font-bold text-emerald-400 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 inline-block mb-3">
                Pagos Digitales al Instante
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                Escanea y Paga con tu Billetera
              </h2>
              <p className="text-sm text-slate-400 mt-2">
                Aceptamos <strong>Nequi</strong>, <strong>Daviplata</strong>, <strong>Bancolombia</strong> y <strong>Transfiya</strong>.
              </p>
            </div>

            {/* TARJETA CON CÓDIGO QR */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-2xl border-4 border-emerald-500/40 relative group mb-6">
              <QRCodeSVG 
                value={`https://recargas.nequi.com.co`}
                size={220}
                level="H"
                includeMargin={false}
              />
              <div className="mt-3 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                Código QR Oficial del Comercio
              </div>
            </div>

            {/* BADGES DE BILLETERAS COMPATIBLES */}
            <div className="flex items-center flex-wrap gap-2.5 justify-center text-xs">
              <span className="px-3.5 py-1.5 rounded-full bg-purple-950/60 border border-purple-500/40 text-purple-300 font-bold">
                🟣 Nequi
              </span>
              <span className="px-3.5 py-1.5 rounded-full bg-red-950/60 border border-red-500/40 text-red-300 font-bold">
                🔴 Daviplata
              </span>
              <span className="px-3.5 py-1.5 rounded-full bg-amber-950/60 border border-amber-500/40 text-amber-300 font-bold">
                🟡 Bancolombia
              </span>
              <span className="px-3.5 py-1.5 rounded-full bg-blue-950/60 border border-blue-500/40 text-blue-300 font-bold">
                🔵 Transfiya
              </span>
            </div>

            <p className="text-xs text-slate-500 mt-6 max-w-sm">
              💡 No necesitas mostrar tu pantalla al cajero. El sistema confirma y anuncia tu pago automáticamente por voz en segundos.
            </p>

          </div>
        )}
      </main>

      {/* PIE DE PÁGINA */}
      <footer className="px-8 py-4 border-t border-slate-900 bg-slate-950 text-center text-xs text-slate-500 flex justify-between items-center">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          Protegido por ConfirmaYa.lat • Tecnología Anti-Fraude
        </span>
        <span className="hidden sm:inline">Punto de Cobro #1 • Sede Principal</span>
      </footer>

    </div>
  );
}
