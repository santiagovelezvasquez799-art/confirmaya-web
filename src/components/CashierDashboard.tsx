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
  Sparkles, 
  Search, 
  AlertCircle, 
  X,
  QrCode,
  Printer,
  Download,
  BarChart3
} from 'lucide-react';
import PairingModal from '@/components/PairingModal';

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
  const [showManualModal, setShowManualModal] = useState(false);
  const [showPairingModal, setShowPairingModal] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [manualSearchResult, setManualSearchResult] = useState<{ found: boolean; tx?: Transaction } | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Estadísticas del día
  const totalToday = transactions.reduce((sum, tx) => sum + (tx.amount || 0), 0);
  const countToday = transactions.length;
  const nequiTotal = transactions.filter(t => t.source === 'nequi').reduce((sum, t) => sum + t.amount, 0);
  const daviplataTotal = transactions.filter(t => t.source === 'daviplata').reduce((sum, t) => sum + t.amount, 0);
  const bancolombiaTotal = transactions.filter(t => t.source === 'bancolombia').reduce((sum, t) => sum + t.amount, 0);

  const formatCOP = (val: number) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val);

  const handlePrintSummary = () => {
    const printWindow = window.open('', '', 'width=400,height=600');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Cierre de Caja - ConfirmaYa</title>
          <style>
            body { font-family: monospace; font-size: 13px; width: 280px; margin: 0 auto; padding: 12px; color: #000; }
            .center { text-align: center; }
            .bold { font-weight: bold; }
            .line { border-top: 1px dashed #000; margin: 8px 0; }
            .row { display: flex; justify-content: space-between; margin: 4px 0; }
          </style>
        </head>
        <body>
          <div class="center bold" style="font-size: 16px;">CONFIRMAYA</div>
          <div class="center">CIERRE DIARIO DE CAJA</div>
          <div class="center">${new Date().toLocaleDateString('es-CO')} - ${new Date().toLocaleTimeString('es-CO')}</div>
          <div class="line"></div>
          <div class="row"><span>TOTAL DEL DÍA:</span><span class="bold">${formatCOP(totalToday)}</span></div>
          <div class="row"><span>PAGOS RECIBIDOS:</span><span class="bold">${countToday}</span></div>
          <div class="line"></div>
          <div class="row"><span>Nequi:</span><span>${formatCOP(nequiTotal)}</span></div>
          <div class="row"><span>Daviplata:</span><span>${formatCOP(daviplataTotal)}</span></div>
          <div class="row"><span>Bancolombia:</span><span>${formatCOP(bancolombiaTotal)}</span></div>
          <div class="line"></div>
          <div class="center" style="font-size: 10px; margin-top: 15px;">✓ Pagos verificados en tiempo real</div>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleExportCSV = () => {
    const headers = "ID,Fecha,Hora,Billetera,Monto,Remitente,Referencia,Estado\n";
    const rows = transactions.map(t => {
      const date = new Date(t.created_at);
      return `"${t.id}","${date.toLocaleDateString('es-CO')}","${date.toLocaleTimeString('es-CO')}","${t.source}","${t.amount}","${t.sender_name}","${t.reference_code || ''}","${t.status}"`;
    }).join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `cierre_caja_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleManualSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const q = searchQuery.trim().toLowerCase();
    if (!q) return;

    setIsSearching(true);
    const numericQ = q.replace(/[^0-9]/g, '');
    const searchAmount = numericQ ? parseInt(numericQ, 10) : null;

    // 1. Buscar primero en transacciones en memoria
    let match = transactions.find((tx) => {
      const matchRef = tx.reference_code && tx.reference_code.toLowerCase().includes(q);
      const matchSender = tx.sender_name && tx.sender_name.toLowerCase().includes(q);
      const matchAmount = searchAmount !== null && tx.amount === searchAmount;
      return matchRef || matchSender || matchAmount;
    });

    // 2. Si no está en memoria y Supabase está configurado, consultar Supabase
    if (!match && isSupabaseConfigured) {
      try {
        const { data } = await supabase
          .from('transactions')
          .select('*')
          .eq('organization_id', organizationId)
          .order('created_at', { ascending: false })
          .limit(50);

        if (data) {
          match = data.find((tx: Transaction) => {
            const matchRef = tx.reference_code && tx.reference_code.toLowerCase().includes(q);
            const matchSender = tx.sender_name && tx.sender_name.toLowerCase().includes(q);
            const matchAmount = searchAmount !== null && tx.amount === searchAmount;
            return matchRef || matchSender || matchAmount;
          });
        }
      } catch (err) {
        console.error('Error buscando transacción:', err);
      }
    }

    setIsSearching(false);
    if (match) {
      setManualSearchResult({ found: true, tx: match });
    } else {
      setManualSearchResult({ found: false });
    }
  };

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

    // Consultar estado inicial del dispositivo
    const fetchDevice = async () => {
      try {
        const { data } = await supabase
          .from('sensor_devices')
          .select('*')
          .limit(1)
          .single();
        if (data) {
          setDevice({
            device_name: data.device_name || 'Celular Mostrador',
            is_online: data.is_online ?? true,
            battery_level: data.battery_level ?? 100,
            is_charging: data.is_charging ?? false,
            last_heartbeat_at: data.last_heartbeat_at || new Date().toISOString(),
          });
        }
      } catch (e) {}
    };
    fetchDevice();

    // Escuchar actualizaciones de batería y heartbeat en tiempo real
    const deviceChannel = supabase
      .channel('sensor_devices_live')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'sensor_devices',
        },
        (payload) => {
          const updated = payload.new as any;
          if (updated) {
            setDevice({
              device_name: updated.device_name || 'Celular Mostrador',
              is_online: updated.is_online ?? true,
              battery_level: updated.battery_level ?? 100,
              is_charging: updated.is_charging ?? false,
              last_heartbeat_at: updated.last_heartbeat_at || new Date().toISOString(),
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(deviceChannel);
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
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Indicador de Teléfono con Alerta de Batería Baja */}
          <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs ${
            device.battery_level <= 20 && !device.is_charging
              ? 'bg-rose-950/60 border-rose-500/60 text-rose-300 animate-pulse'
              : 'bg-slate-800/80 border-slate-700/80 text-slate-300'
          }`}>
            <Smartphone className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline font-medium">{device.device_name}</span>
            <div className={`flex items-center gap-1 font-bold ${device.battery_level <= 20 && !device.is_charging ? 'text-rose-400' : 'text-emerald-400'}`}>
              {device.is_charging ? <BatteryCharging className="w-4 h-4" /> : <Battery className="w-4 h-4" />}
              {device.battery_level}%
            </div>
            <span className={`w-2 h-2 rounded-full ${device.is_online ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`}></span>
          </div>

          {/* Botón Vincular Celular por QR */}
          <button
            onClick={() => setShowPairingModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 transition-all"
            title="Escanear código QR para conectar el teléfono receptor"
          >
            <QrCode className="w-4 h-4 text-emerald-400" />
            <span className="hidden md:inline">Vincular Celular</span>
          </button>

          {/* Botón Cierre de Caja del Día */}
          <button
            onClick={() => setShowSummaryModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 transition-all"
            title="Ver total recaudado hoy y ticket de cierre"
          >
            <BarChart3 className="w-4 h-4 text-blue-400" />
            <span className="hidden md:inline">Cierre de Caja</span>
          </button>

          {/* Botón de Sonido */}
          <button
            onClick={enableAudio}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
              audioEnabled 
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 shadow-sm' 
                : 'bg-amber-500/20 border-amber-500/40 text-amber-300 animate-pulse'
            }`}
          >
            {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span>{audioEnabled ? 'Voz Activa' : 'Activar Voz'}</span>
          </button>

          {/* Botón Verificar Comprobante Manual */}
          <button
            onClick={() => {
              setSearchQuery('');
              setManualSearchResult(null);
              setShowManualModal(true);
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 transition-all"
          >
            <Search className="w-4 h-4 text-emerald-400" />
            <span>Verificar Manual</span>
          </button>

          {/* Botón Simular Prueba */}
          <button
            onClick={handleTestAlert}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-xs font-bold text-white shadow-lg shadow-emerald-900/30 transition-all active:scale-95"
          >
            <Sparkles className="w-4 h-4" />
            <span className="hidden sm:inline">Probar Pago</span>
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

      {/* MODAL DE VERIFICACIÓN MANUAL DE COMPROBANTES */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative overflow-hidden flex flex-col gap-5 animate-in fade-in zoom-in-95 duration-200">
            
            {/* Header del Modal */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <Search className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">Verificar Comprobante</h3>
                  <p className="text-xs text-slate-400">Confirmación manual anti-estafas</p>
                </div>
              </div>
              <button
                onClick={() => setShowManualModal(false)}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Formulario de búsqueda */}
            <form onSubmit={handleManualSearch} className="flex flex-col gap-3">
              <label className="text-xs font-semibold text-slate-300">
                Ingresa el Monto, Referencia o Nombre del Remitente:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Ej: 15000, STIVEN o M123456"
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={isSearching || !searchQuery.trim()}
                  className="px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 font-bold text-sm text-slate-950 shadow-lg shadow-emerald-500/20 transition-all"
                >
                  {isSearching ? 'Buscando...' : 'Buscar'}
                </button>
              </div>
            </form>

            {/* Resultados de la búsqueda */}
            {manualSearchResult && (
              <div className="pt-2">
                {manualSearchResult.found && manualSearchResult.tx ? (
                  <div className="bg-emerald-950/40 border-2 border-emerald-500/50 rounded-2xl p-4 flex flex-col gap-3">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      <span>¡PAGO AUTÉNTICO CONFIRMADO!</span>
                    </div>

                    <div className="bg-slate-900/90 rounded-xl p-3 border border-emerald-900/50 flex flex-col gap-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-400">Monto verificado:</span>
                        <span className="text-xl font-black text-emerald-400">
                          {formatCOP(manualSearchResult.tx.amount)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400">Remitente:</span>
                        <span className="font-bold text-white">{manualSearchResult.tx.sender_name}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400">Billetera / Banco:</span>
                        <span className="font-bold uppercase text-emerald-300">
                          {manualSearchResult.tx.source}
                        </span>
                      </div>
                      {manualSearchResult.tx.reference_code && (
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-400">Comprobante / Ref:</span>
                          <span className="font-mono text-slate-300">
                            {manualSearchResult.tx.reference_code}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400">Hora recibida:</span>
                        <span className="text-slate-300">
                          {new Date(manualSearchResult.tx.created_at).toLocaleTimeString('es-CO')}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        if (manualSearchResult.tx) {
                          setLatestTx(manualSearchResult.tx);
                          triggerAlert(manualSearchResult.tx.amount, manualSearchResult.tx.sender_name, manualSearchResult.tx.source.toUpperCase());
                          setShowManualModal(false);
                        }
                      }}
                      className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all"
                    >
                      Mostrar y Vocear en Pantalla
                    </button>
                  </div>
                ) : (
                  <div className="bg-rose-950/30 border-2 border-rose-500/50 rounded-2xl p-4 flex flex-col gap-3">
                    <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                      <AlertCircle className="w-5 h-5 text-rose-400" />
                      <span>NO SE ENCONTRÓ NINGÚN PAGO</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      No hay ningún registro con el término &ldquo;<strong className="text-rose-300">{searchQuery}</strong>&rdquo; recibido en las cuentas vinculadas.
                    </p>
                    <div className="bg-rose-900/30 rounded-xl p-3 border border-rose-800/40 text-xs text-rose-200">
                      🚨 <strong>Alerta de Seguridad:</strong> Si el cliente afirma que ya pagó y muestra una captura o comprobante en su pantalla, pídele amablemente que te muestre los <strong>Movimientos dentro de la app</strong>. Cuidado con capturas falsas o editadas.
                    </div>
                  </div>
                )}
              </div>
            )}

            {!manualSearchResult && (
              <div className="text-xs text-slate-400 bg-slate-950/50 rounded-2xl p-4 border border-slate-800/60 flex flex-col gap-2">
                <span className="font-semibold text-slate-300">💡 ¿Cuándo usar la verificación manual?</span>
                <p>
                  Si la notificación automática se retrasa por la señal del celular, puedes digitar aquí los últimos dígitos de la referencia o el monto exacto para confirmar si el dinero ya impactó en el sistema.
                </p>
              </div>
            )}

          </div>
        </div>
      )}

      {/* MODAL DE EMPAREJAMIENTO POR CÓDIGO QR */}
      <PairingModal
        isOpen={showPairingModal}
        onClose={() => setShowPairingModal(false)}
        apiKey="key_confirmaya_demo_dispositivo_123"
        endpointUrl="https://www.confirmaya.lat/api/ingest"
        storeName="Mi Comercio"
      />

      {/* MODAL DE CIERRE DE CAJA DEL DÍA */}
      {showSummaryModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-md w-full p-6 shadow-2xl relative overflow-hidden flex flex-col gap-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">Cierre Diario de Caja</h3>
                  <p className="text-xs text-slate-400">{new Date().toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
              </div>
              <button
                onClick={() => setShowSummaryModal(false)}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Total General */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-5 text-center">
              <span className="text-xs uppercase tracking-wider text-slate-400 font-bold">Total Recaudado Hoy</span>
              <p className="text-3xl font-black text-emerald-400 mt-1">{formatCOP(totalToday)}</p>
              <span className="text-xs text-slate-500 mt-1 block">{countToday} transferencias confirmadas</span>
            </div>

            {/* Desglose por Billetera */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Desglose por Billetera</span>
              <div className="bg-slate-950/50 rounded-xl p-3 border border-slate-800/80 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-300 font-semibold">Nequi:</span>
                  <span className="font-bold text-emerald-400">{formatCOP(nequiTotal)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300 font-semibold">Daviplata:</span>
                  <span className="font-bold text-emerald-400">{formatCOP(daviplataTotal)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300 font-semibold">Bancolombia:</span>
                  <span className="font-bold text-emerald-400">{formatCOP(bancolombiaTotal)}</span>
                </div>
              </div>
            </div>

            {/* Acciones: Imprimir Ticket o Exportar CSV */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={handlePrintSummary}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all shadow-sm"
              >
                <Printer className="w-4 h-4 text-emerald-400" />
                <span>Ticket Térmico</span>
              </button>
              <button
                onClick={handleExportCSV}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all shadow-sm"
              >
                <Download className="w-4 h-4 text-blue-400" />
                <span>Exportar CSV</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
