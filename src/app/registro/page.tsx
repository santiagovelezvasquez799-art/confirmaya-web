'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { ShieldCheck, ArrowRight, Store, Mail, Lock, Phone, AlertCircle, Loader2 } from 'lucide-react';

export default function RegistroPage() {
  const router = useRouter();
  const [storeName, setStoreName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      // 1. Crear usuario en Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });

      if (authError) throw authError;

      const userId = authData.user?.id;
      if (!userId) {
        throw new Error('No se pudo obtener el identificador de usuario.');
      }

      // 2. Crear Organización con 24 Horas de Prueba (Trial)
      const trialEnds = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name: storeName.trim(),
          owner_id: userId,
          phone: phone.trim() || null,
          subscription_status: 'trial',
          trial_ends_at: trialEnds,
        })
        .select()
        .single();

      if (orgError) throw orgError;

      // 3. Crear Caja Principal para el negocio
      const { data: branch, error: branchError } = await supabase
        .from('branches')
        .insert({
          organization_id: org.id,
          name: 'Caja Principal - Mostrador',
        })
        .select()
        .single();

      if (branchError) throw branchError;

      // 4. Crear Dispositivo Sensor con API Key única
      const randomKey = 'key_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
      const randomFingerprint = 'fp_' + Math.random().toString(36).substring(2);

      await supabase.from('sensor_devices').insert({
        organization_id: org.id,
        branch_id: branch.id,
        device_name: 'Celular ' + storeName.trim(),
        device_api_key: randomKey,
        device_fingerprint: randomFingerprint,
        is_online: true,
        battery_level: 100,
      });

      // Redirigir al panel de administración del dueño
      router.push('/dashboard');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al registrar la cuenta.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col justify-center py-12 px-6">
      <div className="max-w-md w-full mx-auto">
        
        {/* LOGO */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black text-xl">
              ✓
            </div>
            <span className="text-2xl font-black text-white">ConfirmaYa<span className="text-emerald-400">.lat</span></span>
          </Link>
          <h1 className="text-2xl font-black text-white mt-2">Activa tu Turno de Prueba Gratis</h1>
          <p className="text-xs text-slate-400 mt-1">24 horas completas para blindar tu negocio contra comprobantes falsos.</p>
        </div>

        {/* TARJETA DE FORMULARIO */}
        <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl relative">
          {errorMsg && (
            <div className="mb-6 p-4 rounded-xl bg-red-950/40 border border-red-800/60 text-red-300 text-xs flex items-center gap-3">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Nombre de tu Negocio / Tienda</label>
              <div className="relative">
                <Store className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  placeholder="Ej: Panadería El Trigal, Bar Central"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Correo Electrónico</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  placeholder="tu@correo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Contraseña</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">WhatsApp de Contacto (Opcional)</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="tel"
                  placeholder="310 123 4567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-base shadow-xl shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 mt-6 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Creando tu tienda...</span>
                </>
              ) : (
                <>
                  <span>Comenzar Prueba Gratis (24h)</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-400">
            ¿Ya tienes una cuenta?{' '}
            <Link href="/login" className="text-emerald-400 font-bold hover:underline">
              Inicia sesión aquí
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
