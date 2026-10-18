'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import PairingModal from '@/components/PairingModal';
import OnboardingWizard from '@/components/OnboardingWizard';
import WhatsAppSupportButton from '@/components/WhatsAppSupportButton';
import { 
  Store, 
  Smartphone, 
  CreditCard, 
  Clock, 
  Copy, 
  Check, 
  ExternalLink, 
  ShieldCheck, 
  LogOut, 
  Sparkles, 
  Battery, 
  BatteryCharging, 
  CheckCircle2, 
  AlertTriangle,
  QrCode,
  Laptop,
  TrendingUp,
  Search,
  Calendar,
  Share2,
  Download,
  Filter,
  BarChart3,
  Monitor,
  RefreshCw,
  Sun,
  Moon,
  Sunset
} from 'lucide-react';

interface Organization {
  id: string;
  name: string;
  subscription_status: 'trial' | 'active' | 'past_due' | 'canceled';
  trial_ends_at: string;
  current_period_end: string | null;
}

interface Branch {
  id: string;
  name: string;
}

interface Device {
  id: string;
  device_name: string;
  device_api_key: string;
  is_online: boolean;
  battery_level: number;
  is_charging: boolean;
  last_heartbeat_at?: string;
}

interface Transaction {
  id: string;
  amount: number;
  sender_name: string;
  source: string;
  reference_code?: string;
  created_at: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [org, setOrg] = useState<Organization | null>(null);
  const [branch, setBranch] = useState<Branch | null>(null);
  const [device, setDevice] = useState<Device | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [timeFilter, setTimeFilter] = useState<'today' | 'yesterday' | 'week' | 'month'>('today');
  const [searchQuery, setSearchQuery] = useState('');
  const [showPairingModal, setShowPairingModal] = useState(false);
  const [showWompiModal, setShowWompiModal] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      let orgId = '';
      if (user) {
        const { data: orgData } = await supabase
          .from('organizations')
          .select('*')
          .eq('owner_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        if (orgData) {
          setOrg(orgData);
          orgId = orgData.id;
        }
      }

      // Si es modo demo o fallback
      if (!orgId) {
        orgId = 'a0000000-0000-0000-0000-000000000001';
        setOrg({
          id: orgId,
          name: 'Mi Negocio Oficial',
          subscription_status: 'trial',
          trial_ends_at: new Date(Date.now() + 86400000).toISOString(),
          current_period_end: null,
        });
      }

      // Dispositivo sensor
      const { data: devData } = await supabase
        .from('sensor_devices')
        .select('*')
        .eq('organization_id', orgId)
        .limit(1)
        .single();

      if (devData) {
        setDevice(devData);
      } else {
        setDevice({
          id: 'dev-1',
          device_name: 'Celular Mostrador (Nequi)',
          device_api_key: 'key_confirmaya_demo_dispositivo_123',
          is_online: true,
          battery_level: 100,
          is_charging: true,
          last_heartbeat_at: new Date().toISOString(),
        });
      }

      // Transacciones históricas
      const { data: txData } = await supabase
        .from('transactions')
        .select('*')
        .eq('organization_id', orgId)
        .order('created_at', { ascending: false })
        .limit(100);

      if (txData) {
        setTransactions(txData);
        if (txData.length === 0) {
          const hasSeen = localStorage.getItem('confirmaya_seen_onboarding');
          if (!hasSeen) {
            setShowOnboarding(true);
            localStorage.setItem('confirmaya_seen_onboarding', 'true');
          }
        }
      }
    } catch (e) {
      console.error('Error cargando dashboard:', e);
    } finally {
      setLoading(false);
    }
  };

  // Suscripción Realtime para actualizar ventas y batería en vivo
  useEffect(() => {
    if (!isSupabaseConfigured || !org?.id) return;

    const channel = supabase
      .channel(`owner-dashboard:${org.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'transactions',
          filter: `organization_id=eq.${org.id}`,
        },
        (payload) => {
          const newTx = payload.new as Transaction;
          setTransactions((prev) => [newTx, ...prev]);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'sensor_devices',
          filter: `organization_id=eq.${org.id}`,
        },
        (payload) => {
          const updated = payload.new as Device;
          if (updated) setDevice(updated);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [org?.id]);

  // Filtrado de transacciones según período seleccionado
  const filteredTransactions = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfYesterday = new Date(startOfToday.getTime() - 86400000);
    const startOfWeek = new Date(now.getTime() - 7 * 86400000);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    return transactions.filter((t) => {
      const tDate = new Date(t.created_at);

      if (timeFilter === 'today' && tDate < startOfToday) return false;
      if (timeFilter === 'yesterday' && (tDate < startOfYesterday || tDate >= startOfToday)) return false;
      if (timeFilter === 'week' && tDate < startOfWeek) return false;
      if (timeFilter === 'month' && tDate < startOfMonth) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = t.sender_name?.toLowerCase().includes(q);
        const matchAmount = t.amount?.toString().includes(q);
        const matchRef = t.reference_code?.toLowerCase().includes(q);
        return matchName || matchAmount || matchRef;
      }

      return true;
    });
  }, [transactions, timeFilter, searchQuery]);

  // Métricas calculadas
  const totalAmount = useMemo(() => filteredTransactions.reduce((acc, t) => acc + (t.amount || 0), 0), [filteredTransactions]);
  const totalCount = filteredTransactions.length;
  const averageTicket = totalCount > 0 ? Math.round(totalAmount / totalCount) : 0;

  // Desglose por billetera
  const nequiTotal = useMemo(() => filteredTransactions.filter((t) => t.source === 'nequi').reduce((acc, t) => acc + t.amount, 0), [filteredTransactions]);
  const daviplataTotal = useMemo(() => filteredTransactions.filter((t) => t.source === 'daviplata').reduce((acc, t) => acc + t.amount, 0), [filteredTransactions]);
  const bancolombiaTotal = useMemo(() => filteredTransactions.filter((t) => t.source === 'bancolombia').reduce((acc, t) => acc + t.amount, 0), [filteredTransactions]);

  // Horas pico (Mañana, Tarde, Noche)
  const peakStats = useMemo(() => {
    let morning = 0; // 6am - 12pm
    let afternoon = 0; // 12pm - 6pm
    let night = 0; // 6pm - 12am

    filteredTransactions.forEach((t) => {
      const hour = new Date(t.created_at).getHours();
      if (hour >= 6 && hour < 12) morning += t.amount;
      else if (hour >= 12 && hour < 18) afternoon += t.amount;
      else night += t.amount;
    });

    return { morning, afternoon, night };
  }, [filteredTransactions]);

  const formatCOP = (val: number) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val);

  const handleShareWhatsApp = () => {
    const text = `📊 *REPORTE CONFIRMAYA PARA EL DUEÑO*
🏪 *${org?.name || 'Mi Comercio'}*
📅 *Período:* ${timeFilter.toUpperCase()}
💰 *Total Recaudado:* ${formatCOP(totalAmount)}
🧾 *Total Ventas:* ${totalCount} pagos
🎯 *Ticket Promedio:* ${formatCOP(averageTicket)}
---------------------------
🟣 Nequi: ${formatCOP(nequiTotal)}
🔴 Daviplata: ${formatCOP(daviplataTotal)}
🟡 Bancolombia: ${formatCOP(bancolombiaTotal)}
---------------------------
✅ *Plataforma Anti-Fraude ConfirmaYa.lat*`;

    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleExportCSV = () => {
    const headers = 'ID,Fecha,Hora,Canal,Monto,Remitente,Referencia\n';
    const rows = filteredTransactions.map((t) => {
      const d = new Date(t.created_at);
      return `"${t.id}","${d.toLocaleDateString('es-CO')}","${d.toLocaleTimeString('es-CO')}","${t.source}","${t.amount}","${t.sender_name}","${t.reference_code || ''}"`;
    }).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `reporte_ventas_${timeFilter}.csv`;
    link.click();
  };

  const handleCopyKey = () => {
    if (device?.device_api_key) {
      navigator.clipboard.writeText(device.device_api_key);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-black">
      
      {/* 1. HEADER MÓVIL OPTIMIZADO PARA EL DUEÑO */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur sticky top-0 z-40 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-slate-950 font-black text-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
            ✓
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              {org?.name || 'Mi Negocio'}
              <span className="text-[10px] uppercase tracking-wider bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 px-2 py-0.5 rounded-full font-bold">
                Dueño
              </span>
            </h1>
            <p className="text-[11px] text-slate-400">Portal de Control en Tiempo Real</p>
          </div>
        </div>

        {/* Acciones Rápidas */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowOnboarding(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-xs font-bold text-emerald-400 border border-emerald-500/30 transition-all shadow-sm"
            title="Guía de Activación en 3 Pasos"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Guía 3 Pasos</span>
          </button>

          <Link
            href="/pos"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 transition-all shadow-sm"
            title="Abrir Pantalla de Caja"
          >
            <Laptop className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Caja POS</span>
          </Link>

          <Link
            href="/pantalla-cliente"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 transition-all shadow-sm"
            title="Abrir Pantalla para Clientes"
          >
            <Monitor className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">Pantalla Clientes</span>
          </Link>
        </div>
      </header>

      {/* 2. CONTENIDO PRINCIPAL */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 space-y-6">

        {/* 2.1 ESTADO REMOTO DEL CELULAR SENSOR DE LA TIENDA */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-2xl ${device?.is_online ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-sm sm:text-base">{device?.device_name || 'Celular de la Tienda'}</span>
                <span className={`w-2.5 h-2.5 rounded-full ${device?.is_online ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`}></span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                <span className={device?.is_online ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>
                  {device?.is_online ? '● Monitoreo Activo' : '○ Desconectado'}
                </span>
                <span>•</span>
                <span>Último reporte: Hace momentos</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Batería */}
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold ${
              (device?.battery_level || 100) <= 20 && !device?.is_charging
                ? 'bg-rose-950/60 border-rose-500 text-rose-300 animate-pulse'
                : 'bg-slate-950/80 border-slate-800 text-emerald-400'
            }`}>
              {device?.is_charging ? <BatteryCharging className="w-4 h-4 text-emerald-400" /> : <Battery className="w-4 h-4 text-emerald-400" />}
              <span>{device?.battery_level || 100}%</span>
            </div>

            {/* Botón QR */}
            <button
              onClick={() => setShowPairingModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 transition-all"
            >
              <QrCode className="w-4 h-4 text-emerald-400" />
              <span>Vincular por QR</span>
            </button>
          </div>
        </div>

        {/* 2.2 SELECTOR DE PERÍODO (HOY / AYER / 7 DÍAS / MES) */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex bg-slate-900 p-1.5 rounded-2xl border border-slate-800 text-xs w-full sm:w-auto">
            <button
              onClick={() => setTimeFilter('today')}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl font-bold transition-all ${
                timeFilter === 'today' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              Hoy (En Vivo)
            </button>
            <button
              onClick={() => setTimeFilter('yesterday')}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl font-bold transition-all ${
                timeFilter === 'yesterday' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              Ayer
            </button>
            <button
              onClick={() => setTimeFilter('week')}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl font-bold transition-all ${
                timeFilter === 'week' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              Últimos 7 días
            </button>
            <button
              onClick={() => setTimeFilter('month')}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl font-bold transition-all ${
                timeFilter === 'month' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              Este Mes
            </button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleShareWhatsApp}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-lg shadow-emerald-950 transition-all"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Enviar WhatsApp</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-all"
              title="Descargar Excel CSV"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 2.3 TARJETAS DE MÉTRICAS CLAVE (VENTAS, TICKETS, PROMEDIO) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          {/* Total Recaudado */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-2xl rounded-full pointer-events-none"></div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
              {timeFilter === 'today' ? 'Ventas de Hoy' : 'Total en Período'}
            </span>
            <div className="text-3xl sm:text-4xl font-black text-emerald-400 tracking-tight">
              {formatCOP(totalAmount)}
            </div>
            <p className="text-xs text-slate-500 mt-2 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>{totalCount} pagos confirmados</span>
            </p>
          </div>

          {/* Ticket Promedio */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Ticket Promedio
            </span>
            <div className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              {formatCOP(averageTicket)}
            </div>
            <p className="text-xs text-slate-500 mt-2">Promedio por cada cliente</p>
          </div>

          {/* Desglose Rápido de Billeteras */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Billeteras Populares
            </span>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-purple-400 font-bold">🟣 Nequi:</span>
                <span className="font-bold text-white">{formatCOP(nequiTotal)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-red-400 font-bold">🔴 Daviplata:</span>
                <span className="font-bold text-white">{formatCOP(daviplataTotal)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-amber-400 font-bold">🟡 Bancolombia:</span>
                <span className="font-bold text-white">{formatCOP(bancolombiaTotal)}</span>
              </div>
            </div>
          </div>

        </div>

        {/* 2.4 VISUALIZADOR DE HORAS PICO (¿A qué hora se vende más?) */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Flujo de Ventas por Franja Horaria</h2>
            </div>
            <span className="text-xs text-slate-400">Horas Pico</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Mañana */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Sun className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-300 block">Mañana (6am - 12pm)</span>
                  <span className="text-base font-black text-white">{formatCOP(peakStats.morning)}</span>
                </div>
              </div>
            </div>

            {/* Tarde */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
                  <Sunset className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-300 block">Tarde (12pm - 6pm)</span>
                  <span className="text-base font-black text-white">{formatCOP(peakStats.afternoon)}</span>
                </div>
              </div>
            </div>

            {/* Noche */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <Moon className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-300 block">Noche (6pm - 12am)</span>
                  <span className="text-base font-black text-white">{formatCOP(peakStats.night)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2.5 HISTORIAL DE VENTAS CON BÚSQUEDA RÁPIDA */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-white">Historial de Transferencias</h2>
              <p className="text-xs text-slate-400">Auditoría completa con nombres y comprobantes</p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar cliente, monto..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {filteredTransactions.length > 0 ? (
            <div className="space-y-2.5">
              {filteredTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 rounded-2xl p-4 flex items-center justify-between transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-xs uppercase">
                      {tx.source.slice(0, 3)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white truncate max-w-[200px] sm:max-w-none">{tx.sender_name}</p>
                      <p className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                        <span>{new Date(tx.created_at).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}</span>
                        <span>•</span>
                        <span className="font-mono text-slate-300">Ref: {tx.reference_code || 'Directo'}</span>
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-base font-black text-emerald-400">{formatCOP(tx.amount)}</span>
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">{tx.source}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-slate-500 text-xs">
              No se encontraron pagos en este período de tiempo.
            </div>
          )}
        </div>

        {/* 2.6 PLAN Y SUSCRIPCIÓN ($30.000 COP/mes) */}
        <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
          <div>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest block mb-1">
              Plan ConfirmaYa Protección Total
            </span>
            <h3 className="text-xl font-black text-white">Suscripción Ilimitada • $30.000 COP / mes</h3>
            <p className="text-xs text-slate-400 mt-1">
              Transferencias ilimitadas, anuncios de voz en vivo y soporte para todas tus cajas.
            </p>
          </div>

          <button
            onClick={() => setShowWompiModal(true)}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95"
          >
            Renovar / Pagar con Wompi
          </button>
        </div>

      </main>

      {/* MODAL DE EMPAREJAMIENTO QR */}
      <PairingModal
        isOpen={showPairingModal}
        onClose={() => setShowPairingModal(false)}
        apiKey={device?.device_api_key || 'key_confirmaya_demo_dispositivo_123'}
        endpointUrl="https://www.confirmaya.lat/api/ingest"
        storeName={org?.name || 'Mi Comercio'}
      />

      {/* ASISTENTE ONBOARDING EN 3 PASOS */}
      <OnboardingWizard
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onOpenPairing={() => setShowPairingModal(true)}
        storeName={org?.name || 'Mi Comercio'}
      />

      {/* BOTÓN FLOTANTE DE SOPORTE WHATSAPP */}
      <WhatsAppSupportButton />

      {/* MODAL DE PAGO WOMPI */}
      {showWompiModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-md w-full p-6 text-center shadow-2xl space-y-5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <CreditCard className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-white">Suscripción ConfirmaYa</h3>
              <p className="text-xs text-slate-400 mt-1">
                Paga de forma 100% segura mediante Wompi (Bancolombia)
              </p>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-left space-y-2 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Plan Mensual:</span>
                <span className="font-bold text-white">$30.000 COP</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Duración:</span>
                <span className="font-bold text-emerald-400">30 Días Ilimitados</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Medios de Pago:</span>
                <span>Nequi, PSE, Tarjetas, Bancolombia</span>
              </div>
            </div>

            <a
              href="https://checkout.wompi.co/l/RJ26Ay"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setShowWompiModal(false)}
              className="w-full py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/25 block text-center"
            >
              Proceder al Pago Seguro ($30.000 COP)
            </a>

            <button
              onClick={() => setShowWompiModal(false)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="border-t border-slate-900 py-6 px-4 text-center text-xs text-slate-500">
        ConfirmaYa.lat • Plataforma de Protección Anti-Estafas en Tiempo Real • Colombia
      </footer>

    </div>
  );
}
