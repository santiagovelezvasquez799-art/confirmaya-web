'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import PairingModal from '@/components/PairingModal';
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
  Laptop
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
}

interface Transaction {
  id: string;
  amount: number;
  sender_name: string;
  source: string;
  created_at: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [org, setOrg] = useState<Organization | null>(null);
  const [branch, setBranch] = useState<Branch | null>(null);
  const [device, setDevice] = useState<Device | null>(null);
  const [recentTx, setRecentTx] = useState<Transaction[]>([]);
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      // 1. Obtener organización del dueño
      const { data: orgData } = await supabase
        .from('organizations')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (orgData) {
        setOrg(orgData);

        // 2. Obtener caja
        const { data: branchData } = await supabase
          .from('branches')
          .select('*')
          .eq('organization_id', orgData.id)
          .limit(1)
          .single();
        if (branchData) setBranch(branchData);

        // 3. Obtener dispositivo
        const { data: devData } = await supabase
          .from('sensor_devices')
          .select('*')
          .eq('organization_id', orgData.id)
          .limit(1)
          .single();
        if (devData) setDevice(devData);

        // 4. Obtener últimas transacciones
        const { data: txData } = await supabase
          .from('transactions')
          .select('id, amount, sender_name, source, created_at')
          .eq('organization_id', orgData.id)
          .order('created_at', { ascending: false })
          .limit(10);
        if (txData) setRecentTx(txData);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const cashierUrl = branch
    ? `https://www.confirmaya.lat/pos?branch=${branch.id}`
    : 'https://www.confirmaya.lat/pos';

  const copyCashierUrl = () => {
    navigator.clipboard.writeText(cashierUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Calcular horas restantes de prueba
  const getTrialHoursRemaining = () => {
    if (!org?.trial_ends_at) return 0;
    const diff = new Date(org.trial_ends_at).getTime() - Date.now();
    const hours = Math.ceil(diff / (1000 * 60 * 60));
    return hours > 0 ? hours : 0;
  };

  const formatCOP = (val: number) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <p className="text-sm font-semibold animate-pulse text-emerald-400">Cargando panel de tu negocio...</p>
      </div>
    );
  }

  const hoursLeft = getTrialHoursRemaining();
  const isTrialActive = org?.subscription_status === 'trial' && hoursLeft > 0;
  const isSubscriptionActive = org?.subscription_status === 'active';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      
      {/* NAVBAR */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 text-slate-950 font-black text-lg flex items-center justify-center">
              ✓
            </div>
            <span className="text-xl font-black text-white">ConfirmaYa<span className="text-emerald-400">.lat</span></span>
          </Link>
          <span className="hidden sm:inline text-xs text-slate-500">•</span>
          <span className="hidden sm:inline text-xs font-bold text-slate-300">{org?.name || 'Mi Negocio'}</span>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-red-400 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="max-w-6xl mx-auto p-6 space-y-8">
        
        {/* 1. BANNER DE ESTADO DE SUSCRIPCIÓN */}
        {isTrialActive ? (
          <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-900 border border-emerald-500/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                Prueba Gratuita de 24 Horas Activa
              </div>
              <h2 className="text-2xl font-black text-white">
                Te quedan {hoursLeft} horas de prueba completa
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Tus cajeros pueden cantar pagos en vivo. Activa tu suscripción para continuar sin interrupciones.
              </p>
            </div>

            <a
              href="https://checkout.wompi.co/l/demo-link"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/25 transition-all shrink-0 hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              <CreditCard className="w-4 h-4" />
              <span>Activar Plan Mensual ($30.000 COP)</span>
            </a>
          </div>
        ) : isSubscriptionActive ? (
          <div className="p-6 rounded-3xl bg-slate-900 border border-emerald-500/40 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              <div>
                <h2 className="text-lg font-bold text-white">Suscripción Comercial Activa</h2>
                <p className="text-xs text-slate-400">Protección ilimitada contra estafas habilitada.</p>
              </div>
            </div>
            <span className="text-xs font-bold bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full border border-emerald-500/30">
              Al Día ($30.000 COP / mes)
            </span>
          </div>
        ) : (
          <div className="p-6 rounded-3xl bg-amber-950/40 border border-amber-500/50 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-8 h-8 text-amber-400 shrink-0" />
              <div>
                <h2 className="text-lg font-black text-white">Tu período de prueba ha finalizado</h2>
                <p className="text-xs text-slate-300 mt-0.5">
                  Renueva tu mes por solo <strong>$30.000 COP</strong> ($1.000 al día) para reactivar las alertas en vivo.
                </p>
              </div>
            </div>

            <a
              href="https://checkout.wompi.co/l/demo-link"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm transition-all shrink-0 shadow-lg shadow-amber-500/25"
            >
              Pagar $30.000 con Wompi (PSE / Tarjeta)
            </a>
          </div>
        )}

        {/* 2. GRID DE ACCIÓN: CAJA Y DISPOSITIVO */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* TARJETA DE PANTALLA DE CAJA */}
          <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-6">
                <Laptop className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Pantalla de Caja (Para tus Cajeros)</h3>
              <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                Comparte este enlace a la computadora de cobro o tablet de tu negocio. Tus empleados no necesitan clave ni usuario.
              </p>

              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between gap-2 mb-4">
                <span className="text-xs font-mono text-slate-300 truncate">{cashierUrl}</span>
                <button
                  onClick={copyCashierUrl}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white flex items-center gap-1.5 shrink-0 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copiado' : 'Copiar'}</span>
                </button>
              </div>
            </div>

            <Link
              href={`/pos?branch=${branch?.id || ''}`}
              target="_blank"
              className="w-full py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm text-center transition-all flex items-center justify-center gap-2"
            >
              <span>Abrir Pantalla de Caja Aquí</span>
              <ExternalLink className="w-4 h-4" />
            </Link>
          </div>

          {/* TARJETA DE CELULAR RECEPTOR */}
          <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-6">
                <Smartphone className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Celular Receptor (Nequi / Daviplata)</h3>
              <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                El teléfono del negocio donde caen las transferencias reales.
              </p>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Estado:</span>
                  <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    {device?.is_online ? 'En Línea' : 'Esperando Conexión'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Batería del Teléfono:</span>
                  <span className="font-bold text-slate-200 flex items-center gap-1">
                    {device?.is_charging ? <BatteryCharging className="w-4 h-4 text-emerald-400" /> : <Battery className="w-4 h-4" />}
                    {device?.battery_level || 100}%
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowQr(true)}
              className="w-full py-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm transition-all flex items-center justify-center gap-2 border border-slate-700"
            >
              <QrCode className="w-4 h-4 text-emerald-400" />
              <span>Ver Código QR de Vinculación</span>
            </button>
          </div>

        </div>

        {/* 3. HISTORIAL DE PAGOS CONFIRMADOS */}
        <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white">Últimos Pagos Confirmados</h3>
            <span className="text-xs text-slate-400 bg-slate-800 px-3 py-1 rounded-full">
              {recentTx.length} registros
            </span>
          </div>

          {recentTx.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase">
                    <th className="pb-3">Hora</th>
                    <th className="pb-3">Canal</th>
                    <th className="pb-3">Remitente</th>
                    <th className="pb-3 text-right">Monto</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {recentTx.map((tx) => (
                    <tr key={tx.id} className="text-slate-200">
                      <td className="py-3 font-mono text-slate-400">
                        {new Date(tx.created_at).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-3 uppercase font-bold text-purple-400">{tx.source}</td>
                      <td className="py-3 font-semibold">{tx.sender_name}</td>
                      <td className="py-3 text-right font-black text-emerald-400 text-sm">{formatCOP(tx.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-10 text-slate-500 text-xs">
              Aún no hay transferencias registradas hoy. Cuando tus clientes paguen, aparecerán aquí.
            </div>
          )}
        </div>

      </main>

      {/* MODAL QR DE VINCULACIÓN */}
      <PairingModal
        isOpen={showQr}
        onClose={() => setShowQr(false)}
        apiKey={device?.device_api_key || 'key_demo'}
        endpointUrl="https://xxmvyhqoyqybrcuytmcb.supabase.co/functions/v1/ingest-transfer"
        storeName={org?.name || 'Mi Negocio'}
      />

    </div>
  );
}
