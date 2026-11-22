'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
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
  Sunset,
  ArrowUpRight,
  PieChart,
  SlidersHorizontal,
  Bell,
  CalendarDays,
  Users
} from 'lucide-react';

interface Organization {
  id: string;
  name: string;
  subscription_status: 'trial' | 'active' | 'past_due' | 'canceled';
  trial_ends_at: string;
  current_period_end: string | null;
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
  const [activeTab, setActiveTab] = useState<'live' | 'analytics' | 'settings'>('live');
  const [org, setOrg] = useState<Organization | null>(null);
  const [device, setDevice] = useState<Device | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  // Filtros de analítica avanzada
  const [timeFilter, setTimeFilter] = useState<'today' | 'yesterday' | 'week' | 'month' | 'custom'>('today');
  const [bankFilter, setBankFilter] = useState<'all' | 'nequi' | 'daviplata' | 'bancolombia' | 'transfiya'>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modales
  const [showPairingModal, setShowPairingModal] = useState(false);
  const [showWompiModal, setShowWompiModal] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  // Cierre automático configurable por el dueño (Hora por defecto: 21:00 / 9:00 PM)
  const [autoCloseHour, setAutoCloseHour] = useState('21:00');
  const [autoCloseEnabled, setAutoCloseEnabled] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    loadDashboardData();
    const savedHour = localStorage.getItem('confirmaya_autoclose_hour');
    if (savedHour) setAutoCloseHour(savedHour);
    const savedEnabled = localStorage.getItem('confirmaya_autoclose_enabled');
    if (savedEnabled !== null) setAutoCloseEnabled(savedEnabled === 'true');
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

      // Transacciones históricas (Traemos histórico amplio para análisis a voluntad)
      const { data: txData } = await supabase
        .from('transactions')
        .select('*')
        .eq('organization_id', orgId)
        .order('created_at', { ascending: false })
        .limit(500);

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
    if (!org?.id) return;

    const channel = supabase
      .channel('owner-dashboard-realtime')
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

  // Filtrado de transacciones según período seleccionado, banco y búsqueda
  const filteredTransactions = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfYesterday = new Date(startOfToday.getTime() - 86400000);
    const startOfWeek = new Date(now.getTime() - 7 * 86400000);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    return transactions.filter((t) => {
      const tDate = new Date(t.created_at);

      // 1. Filtro temporal
      if (timeFilter === 'today' && tDate < startOfToday) return false;
      if (timeFilter === 'yesterday' && (tDate < startOfYesterday || tDate >= startOfToday)) return false;
      if (timeFilter === 'week' && tDate < startOfWeek) return false;
      if (timeFilter === 'month' && tDate < startOfMonth) return false;
      if (timeFilter === 'custom') {
        if (startDate && tDate < new Date(startDate + 'T00:00:00')) return false;
        if (endDate && tDate > new Date(endDate + 'T23:59:59')) return false;
      }

      // 2. Filtro por Banco
      if (bankFilter !== 'all' && t.source.toLowerCase() !== bankFilter.toLowerCase()) {
        return false;
      }

      // 3. Búsqueda por texto (nombre, monto, referencia)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = t.sender_name?.toLowerCase().includes(q);
        const matchAmount = t.amount?.toString().includes(q);
        const matchRef = t.reference_code?.toLowerCase().includes(q);
        return matchName || matchAmount || matchRef;
      }

      return true;
    });
  }, [transactions, timeFilter, bankFilter, startDate, endDate, searchQuery]);

  // Métricas calculadas
  const totalAmount = useMemo(() => filteredTransactions.reduce((acc, t) => acc + (t.amount || 0), 0), [filteredTransactions]);
  const totalCount = filteredTransactions.length;
  const averageTicket = totalCount > 0 ? Math.round(totalAmount / totalCount) : 0;
  const highestTx = useMemo(() => {
    if (filteredTransactions.length === 0) return 0;
    return Math.max(...filteredTransactions.map(t => t.amount));
  }, [filteredTransactions]);

  // Desglose por billetera
  const nequiTotal = useMemo(() => filteredTransactions.filter((t) => t.source.toLowerCase() === 'nequi').reduce((acc, t) => acc + t.amount, 0), [filteredTransactions]);
  const daviplataTotal = useMemo(() => filteredTransactions.filter((t) => t.source.toLowerCase() === 'daviplata').reduce((acc, t) => acc + t.amount, 0), [filteredTransactions]);
  const bancolombiaTotal = useMemo(() => filteredTransactions.filter((t) => t.source.toLowerCase() === 'bancolombia').reduce((acc, t) => acc + t.amount, 0), [filteredTransactions]);

  // Participación porcentual por banco
  const nequiPct = totalAmount > 0 ? Math.round((nequiTotal / totalAmount) * 100) : 0;
  const daviplataPct = totalAmount > 0 ? Math.round((daviplataTotal / totalAmount) * 100) : 0;
  const bancolombiaPct = totalAmount > 0 ? Math.round((bancolombiaTotal / totalAmount) * 100) : 0;

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

  // Top Clientes Frecuentes
  const topCustomers = useMemo(() => {
    const map = new Map<string, { total: number; count: number }>();
    filteredTransactions.forEach(t => {
      const name = t.sender_name && t.sender_name !== 'Remitente no especificado' ? t.sender_name : 'Cliente Anónimo';
      const current = map.get(name) || { total: 0, count: 0 };
      map.set(name, { total: current.total + t.amount, count: current.count + 1 });
    });

    return Array.from(map.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [filteredTransactions]);

  // Agrupación por días para Gráfica de Tendencia (Últimos 7 días)
  const dailyTrend = useMemo(() => {
    const daysMap = new Map<string, number>();
    // Inicializar últimos 7 días con 0
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      const key = d.toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric' });
      daysMap.set(key, 0);
    }

    filteredTransactions.forEach(t => {
      const key = new Date(t.created_at).toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric' });
      if (daysMap.has(key)) {
        daysMap.set(key, (daysMap.get(key) || 0) + t.amount);
      }
    });

    return Array.from(daysMap.entries()).map(([label, value]) => ({ label, value }));
  }, [filteredTransactions]);

  const maxDailyValue = Math.max(...dailyTrend.map(d => d.value), 1);

  const formatCOP = (val: number) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val);

  // Compartir Cierre o Balance por WhatsApp
  const handleShareWhatsApp = () => {
    const dateStr = new Date().toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
    const text = `📊 *REPORTE CONFIRMAYA - ${org?.name || 'Mi Comercio'}*
📅 *Fecha:* ${dateStr}
🎯 *Filtro:* ${timeFilter.toUpperCase()} • ${bankFilter === 'all' ? 'Todos los Bancos' : bankFilter.toUpperCase()}
💰 *Total Recaudado:* ${formatCOP(totalAmount)}
🧾 *Transacciones:* ${totalCount} pagos
🎯 *Ticket Promedio:* ${formatCOP(averageTicket)}
🔥 *Venta Más Alta:* ${formatCOP(highestTx)}
--------------------------------
🟣 *Nequi:* ${formatCOP(nequiTotal)} (${nequiPct}%)
🔴 *Daviplata:* ${formatCOP(daviplataTotal)} (${daviplataPct}%)
🟡 *Bancolombia:* ${formatCOP(bancolombiaTotal)} (${bancolombiaPct}%)
--------------------------------
✅ *Verificado 100% Anti-Fraude con ConfirmaYa.lat*`;

    const encoded = encodeURIComponent(text);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  // Exportar histórico a CSV (Excel)
  const handleExportCSV = () => {
    if (filteredTransactions.length === 0) {
      alert('No hay transacciones para exportar en este período.');
      return;
    }

    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'ID,Fecha,Hora,Banco,Cliente,Monto,Referencia\n';

    filteredTransactions.forEach((t) => {
      const date = new Date(t.created_at).toLocaleDateString('es-CO');
      const time = new Date(t.created_at).toLocaleTimeString('es-CO');
      const cleanName = (t.sender_name || 'Desconocido').replace(/,/g, '');
      csvContent += `${t.id},${date},${time},${t.source},${cleanName},${t.amount},${t.reference_code || ''}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ConfirmaYa_Reporte_${timeFilter}_${bankFilter}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveSettings = () => {
    localStorage.setItem('confirmaya_autoclose_hour', autoCloseHour);
    localStorage.setItem('confirmaya_autoclose_enabled', autoCloseEnabled.toString());
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
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
            href={`/pos?org=${org?.id || ''}`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 transition-all shadow-sm"
            title="Abrir Pantalla de Caja"
          >
            <Laptop className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Caja POS</span>
          </Link>

          <Link
            href={`/pantalla-cliente?org=${org?.id || ''}`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 transition-all shadow-sm"
            title="Abrir Pantalla para Clientes"
          >
            <Monitor className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">Pantalla Clientes</span>
          </Link>

          <button
            onClick={async () => {
              if (confirm('¿Deseas cerrar tu sesión?')) {
                await supabase.auth.signOut();
                router.push('/login');
              }
            }}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-rose-950 text-slate-400 hover:text-rose-400 border border-slate-700 hover:border-rose-800 transition-all"
            title="Cerrar Sesión"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* NAVEGACIÓN POR PESTAÑAS (VISTA EN VIVO vs INTELIGENCIA FINANCIERA vs CONFIGURACIÓN) */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 sm:px-8">
        <div className="max-w-5xl mx-auto flex items-center gap-2 sm:gap-6">
          <button
            onClick={() => setActiveTab('live')}
            className={`py-3.5 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'live'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Monitoreo en Vivo</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`py-3.5 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'analytics'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Analítica por Banco y Fechas</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`py-3.5 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'settings'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Cierre Automático & Ajustes</span>
          </button>
        </div>
      </div>

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
                  {device?.is_online ? '● Monitoreo Activo (Push + SMS)' : '○ Desconectado'}
                </span>
                <span>•</span>
                <span>Doble Sensor 24/7</span>
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
              <span>Ver QR de Conexión</span>
            </button>
          </div>
        </div>

        {/* PESTAÑA 1: VISTA EN VIVO & MONITOREO */}
        {activeTab === 'live' && (
          <div className="space-y-6">
            
            {/* SELECTOR DE PERÍODO RÁPIDO */}
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
                  <span>Enviar Cierre por WhatsApp</span>
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

            {/* TARJETAS DE MÉTRICAS */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 relative overflow-hidden shadow-xl">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-2xl rounded-full pointer-events-none"></div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  {timeFilter === 'today' ? 'Ventas de Hoy' : 'Total Recaudado'}
                </span>
                <div className="text-3xl sm:text-4xl font-black text-emerald-400 tracking-tight">
                  {formatCOP(totalAmount)}
                </div>
                <p className="text-xs text-slate-500 mt-2 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>{totalCount} pagos confirmados</span>
                </p>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Ticket Promedio
                </span>
                <div className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                  {formatCOP(averageTicket)}
                </div>
                <p className="text-xs text-slate-500 mt-2">Venta más alta: <strong className="text-emerald-400">{formatCOP(highestTx)}</strong></p>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Billeteras
                </span>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-purple-400 font-bold">🟣 Nequi:</span>
                    <span className="font-bold text-white">{formatCOP(nequiTotal)} ({nequiPct}%)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-red-400 font-bold">🔴 Daviplata:</span>
                    <span className="font-bold text-white">{formatCOP(daviplataTotal)} ({daviplataPct}%)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-amber-400 font-bold">🟡 Bancolombia:</span>
                    <span className="font-bold text-white">{formatCOP(bancolombiaTotal)} ({bancolombiaPct}%)</span>
                  </div>
                </div>
              </div>

            </div>

            {/* HORAS PICO */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-5 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider">Flujo de Ventas por Franja Horaria</h2>
                </div>
                <span className="text-xs text-slate-400">Horas Pico</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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

            {/* TABLA HISTORIAL RÁPIDO */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-bold text-white">Últimas Transferencias</h2>
                  <p className="text-xs text-slate-400">Notificaciones automáticas en tiempo real</p>
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
                  {filteredTransactions.slice(0, 15).map((t) => (
                    <div
                      key={t.id}
                      className="bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 rounded-2xl p-4 flex items-center justify-between transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl font-bold flex items-center justify-center text-xs uppercase border ${
                          t.source === 'nequi' 
                            ? 'bg-purple-950/40 border-purple-500/40 text-purple-400' 
                            : t.source === 'daviplata' 
                            ? 'bg-red-950/40 border-red-500/40 text-red-400' 
                            : 'bg-amber-950/40 border-amber-500/40 text-amber-400'
                        }`}>
                          {t.source.slice(0, 3)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white truncate max-w-[200px] sm:max-w-none">
                            {t.sender_name}
                          </p>
                          <p className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                            <span>{new Date(t.created_at).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}</span>
                            <span>•</span>
                            <span className="font-mono text-slate-300">Ref: {t.reference_code || 'Directo'}</span>
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-base font-black text-emerald-400">
                          {formatCOP(t.amount)}
                        </span>
                        <span className="text-[10px] text-slate-500 block uppercase font-bold">
                          {t.source}
                        </span>
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

          </div>
        )}

        {/* PESTAÑA 2: INTELIGENCIA FINANCIERA & ANALÍTICA A VOLUNTAD */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">

            {/* BARRA DE FILTROS A VOLUNTAD */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Filtros de Análisis Libre</h3>
                </div>
                <button
                  onClick={() => {
                    setBankFilter('all');
                    setTimeFilter('today');
                    setStartDate('');
                    setEndDate('');
                  }}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" /> Restablecer
                </button>
              </div>

              {/* Selector de Banco */}
              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-2">Filtrar por Entidad Financiera:</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'all', label: 'Todos los Bancos', color: 'bg-slate-800 text-white' },
                    { id: 'nequi', label: '🟣 Solo Nequi', color: 'bg-purple-950/60 text-purple-300 border-purple-700/60' },
                    { id: 'daviplata', label: '🔴 Solo Daviplata', color: 'bg-red-950/60 text-red-300 border-red-700/60' },
                    { id: 'bancolombia', label: '🟡 Solo Bancolombia', color: 'bg-amber-950/60 text-amber-300 border-amber-700/60' }
                  ].map(b => (
                    <button
                      key={b.id}
                      onClick={() => setBankFilter(b.id as any)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                        bankFilter === b.id
                          ? 'bg-emerald-500 border-emerald-400 text-slate-950 shadow-md scale-105'
                          : `${b.color} border-slate-800 hover:border-slate-700`
                      }`}
                    >
                      {b.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Selector de Rango de Fechas */}
              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-2">Período de Tiempo:</label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {[
                    { id: 'today', label: 'Hoy' },
                    { id: 'yesterday', label: 'Ayer' },
                    { id: 'week', label: 'Últimos 7 días' },
                    { id: 'month', label: 'Este Mes' },
                    { id: 'custom', label: 'Rango Libre' }
                  ].map(p => (
                    <button
                      key={p.id}
                      onClick={() => setTimeFilter(p.id as any)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                        timeFilter === p.id
                          ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                {/* Inputs de fecha si seleccionó Rango Libre */}
                {timeFilter === 'custom' && (
                  <div className="mt-3 p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-center gap-3 animate-in fade-in">
                    <div className="w-full sm:w-1/2">
                      <span className="text-[11px] text-slate-400 block mb-1">Fecha Inicial:</span>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>
                    <div className="w-full sm:w-1/2">
                      <span className="text-[11px] text-slate-400 block mb-1">Fecha Final:</span>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* TARJETAS RESUMEN DE LA CONSULTA */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                <span className="text-[11px] text-slate-400 font-bold uppercase block">Recaudo Total</span>
                <span className="text-2xl font-black text-emerald-400 mt-1 block">{formatCOP(totalAmount)}</span>
                <span className="text-[10px] text-slate-500">{totalCount} transacciones</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                <span className="text-[11px] text-slate-400 font-bold uppercase block">Ticket Promedio</span>
                <span className="text-2xl font-black text-white mt-1 block">{formatCOP(averageTicket)}</span>
                <span className="text-[10px] text-slate-500">por cliente</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                <span className="text-[11px] text-slate-400 font-bold uppercase block">Venta Más Alta</span>
                <span className="text-2xl font-black text-amber-400 mt-1 block">{formatCOP(highestTx)}</span>
                <span className="text-[10px] text-slate-500">en este rango</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                <span className="text-[11px] text-slate-400 font-bold uppercase block">Banco Líder</span>
                <span className="text-2xl font-black text-purple-400 mt-1 block">
                  {nequiTotal >= daviplataTotal && nequiTotal >= bancolombiaTotal ? 'Nequi' : daviplataTotal >= bancolombiaTotal ? 'Daviplata' : 'Bancolombia'}
                </span>
                <span className="text-[10px] text-slate-500">mayor volumen</span>
              </div>
            </div>

            {/* GRÁFICA DE EVOLUCIÓN EN EL TIEMPO */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Tendencia de Recaudo Diario</h3>
                </div>
                <span className="text-xs text-slate-400">Últimos días</span>
              </div>

              {/* Gráfica de Barras con Tailwind y SVG */}
              <div className="h-44 flex items-end gap-2 pt-6 pb-2 px-2 border-b border-slate-800">
                {dailyTrend.map((d, idx) => {
                  const heightPct = Math.max(Math.round((d.value / maxDailyValue) * 100), 8);
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                      <div className="text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity font-bold">
                        {formatCOP(d.value)}
                      </div>
                      <div
                        style={{ height: `${heightPct}%` }}
                        className="w-full max-w-[48px] rounded-t-xl bg-gradient-to-t from-emerald-600 to-emerald-400 group-hover:from-emerald-500 group-hover:to-teal-300 transition-all shadow-lg shadow-emerald-950"
                      />
                      <span className="text-[11px] font-bold text-slate-400 truncate w-full text-center">
                        {d.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* PARTICIPACIÓN POR BANCOS Y TOP CLIENTES */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Distribución Porcentual */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
                <div className="flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Participación por Billetera</h3>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span className="text-purple-400">🟣 Nequi</span>
                      <span className="text-white">{formatCOP(nequiTotal)} ({nequiPct}%)</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden">
                      <div style={{ width: `${nequiPct}%` }} className="h-full bg-purple-500 rounded-full" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span className="text-red-400">🔴 Daviplata</span>
                      <span className="text-white">{formatCOP(daviplataTotal)} ({daviplataPct}%)</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden">
                      <div style={{ width: `${daviplataPct}%` }} className="h-full bg-red-500 rounded-full" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span className="text-amber-400">🟡 Bancolombia</span>
                      <span className="text-white">{formatCOP(bancolombiaTotal)} ({bancolombiaPct}%)</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden">
                      <div style={{ width: `${bancolombiaPct}%` }} className="h-full bg-amber-500 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Top Clientes Compradores */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Clientes Más Frecuentes</h3>
                </div>

                {topCustomers.length > 0 ? (
                  <div className="space-y-2">
                    {topCustomers.map((c, i) => (
                      <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs">
                        <div className="flex items-center gap-2.5">
                          <span className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-[10px]">
                            #{i + 1}
                          </span>
                          <span className="font-bold text-slate-200">{c.name}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-black text-emerald-400 block">{formatCOP(c.total)}</span>
                          <span className="text-[10px] text-slate-500">{c.count} compras</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 py-6 text-center">No hay registros suficientes.</p>
                )}
              </div>

            </div>

            {/* BOTÓN EXPORTAR EXCEL DE ESTA CONSULTA */}
            <div className="flex justify-end">
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 shadow-lg transition-all"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span>Exportar Consulta a Excel (CSV)</span>
              </button>
            </div>

          </div>
        )}

        {/* PESTAÑA 3: CONFIGURACIÓN, CIERRE AUTOMÁTICO & SUSCRIPCIÓN */}
        {activeTab === 'settings' && (
          <div className="space-y-6">

            {/* CIERRE AUTOMÁTICO CONFIGURABLE */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Bell className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Cierre Diario Automático</h3>
                  <p className="text-xs text-slate-400">Envía un resumen de caja al WhatsApp del dueño a la hora que elijas.</p>
                </div>
              </div>

              {saveSuccess && (
                <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>¡Horario de cierre automático guardado con éxito!</span>
                </div>
              )}

              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-950 border border-slate-800">
                  <div>
                    <span className="text-xs font-bold text-white block">Activar Cierre Automático</span>
                    <span className="text-[11px] text-slate-400">Genera el balance listo cada noche</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={autoCloseEnabled}
                    onChange={(e) => setAutoCloseEnabled(e.target.checked)}
                    className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
                  />
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                  <label className="text-xs font-bold text-white block mb-1">Hora de Cierre Deseada:</label>
                  <p className="text-[11px] text-slate-400 mb-3">Elige la hora exacta en la que tu negocio finaliza turno.</p>
                  <input
                    type="time"
                    value={autoCloseHour}
                    onChange={(e) => setAutoCloseHour(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm font-bold text-emerald-400 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <button
                  onClick={handleSaveSettings}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all"
                >
                  Guardar Preferencia de Cierre
                </button>
              </div>
            </div>

            {/* ACCESOS SEGUROS PARA EMPLEADOS (SIN CLAVES) */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <Laptop className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Enlaces de Mostrador (Para Empleados)</h3>
                  <p className="text-xs text-slate-400">Tus cajeros NO necesitan tu correo ni contraseña. Solo abre estos enlaces en el mostrador.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div>
                    <span className="text-xs font-bold text-white block">Pantalla de Caja POS</span>
                    <span className="text-[11px] text-slate-400">Canta los pagos con voz y hace el cierre</span>
                  </div>
                  <button
                    onClick={() => {
                      const url = `${window.location.origin}/pos?org=${org?.id || ''}`;
                      navigator.clipboard.writeText(url);
                      alert('¡Enlace de Caja copiado al portapapeles! Guárdalo en favoritos en la computadora de tu cajero.');
                    }}
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 transition-all"
                  >
                    <Copy className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copiar Enlace de Caja</span>
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div>
                    <span className="text-xs font-bold text-white block">Pantalla de Clientes</span>
                    <span className="text-[11px] text-slate-400">Muestra el QR y confeti en una tablet</span>
                  </div>
                  <button
                    onClick={() => {
                      const url = `${window.location.origin}/pantalla-cliente?org=${org?.id || ''}`;
                      navigator.clipboard.writeText(url);
                      alert('¡Enlace de Clientes copiado al portapapeles! Ábrelo en la tablet frente al cliente.');
                    }}
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 transition-all"
                  >
                    <Copy className="w-3.5 h-3.5 text-blue-400" />
                    <span>Copiar Enlace de Clientes</span>
                  </button>
                </div>
              </div>
            </div>

            {/* GESTIÓN DE SUSCRIPCIÓN WOMPI */}
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

          </div>
        )}

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
