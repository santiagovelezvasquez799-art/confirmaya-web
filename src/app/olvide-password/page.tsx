'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { Mail, ArrowRight, CheckCircle2, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';

export default function OlvidePasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg(false);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/actualizar-password`,
      });

      if (error) throw error;

      setSuccessMsg(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al enviar el enlace de recuperación.';
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
          <h1 className="text-2xl font-black text-white mt-2">Recuperar Contraseña</h1>
          <p className="text-xs text-slate-400 mt-1">
            Ingresa tu correo y te enviaremos un enlace seguro para restablecer tu acceso.
          </p>
        </div>

        {/* TARJETA */}
        <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl relative">
          {errorMsg && (
            <div className="mb-6 p-4 rounded-xl bg-red-950/40 border border-red-800/60 text-red-300 text-xs flex items-center gap-3">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-lg font-bold text-white">¡Correo de recuperación enviado!</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Hemos enviado un enlace a <strong className="text-emerald-400">{email}</strong>. Revisa tu bandeja de entrada o spam para crear una nueva contraseña.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-xs font-bold text-emerald-400 hover:text-emerald-300 mt-4 underline"
              >
                Volver a Iniciar Sesión
              </Link>
            </div>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Correo Electrónico Registrado</label>
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

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-base shadow-xl shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 mt-6 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Enviando enlace...</span>
                  </>
                ) : (
                  <>
                    <span>Enviar Enlace de Recuperación</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          <div className="mt-6 pt-5 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <Link href="/login" className="flex items-center gap-1 hover:text-white transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" /> Volver al Login
            </Link>
            <Link href="/registro" className="text-emerald-400 font-bold hover:underline">
              Crear Cuenta
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
