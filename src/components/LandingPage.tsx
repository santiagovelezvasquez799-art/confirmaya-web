'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSoundAlert } from '@/hooks/useSoundAlert';
import { 
  ShieldCheck, 
  Volume2, 
  Smartphone, 
  Zap, 
  CheckCircle2, 
  XCircle, 
  Download, 
  ArrowRight, 
  Sparkles, 
  Lock, 
  CreditCard,
  Building2,
  PhoneCall,
  Laptop
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function LandingPage() {
  const { audioEnabled, enableAudio, triggerAlert } = useSoundAlert();
  const [demoAmount, setDemoAmount] = useState('35.000');
  const [demoSender, setDemoSender] = useState('Carlos Mario');

  const handleTestVoice = () => {
    enableAudio();
    const amountNum = parseInt(demoAmount.replace('.', ''), 10) || 35000;
    triggerAlert(amountNum, demoSender, 'Nequi');
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#10B981', '#059669', '#34D399']
      });
    } catch (e) {}
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500 selection:text-black">
      
      {/* 1. NAVBAR */}
      <nav className="border-b border-slate-800/80 bg-slate-900/70 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-black text-2xl shadow-lg shadow-emerald-500/20">
              ✓
            </div>
            <div>
              <span className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
                ConfirmaYa<span className="text-emerald-400">.lat</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400 block -mt-1">
                Anti-Estafas en Tiempo Real
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-300">
            <a href="#como-funciona" className="hover:text-emerald-400 transition-colors">¿Cómo Funciona?</a>
            <a href="#demo-interactiva" className="hover:text-emerald-400 transition-colors">Probar Sonido</a>
            <a href="#precios" className="hover:text-emerald-400 transition-colors">Planes</a>
            <Link href="/descargar" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
              <Download className="w-4 h-4 text-emerald-400" />
              Descargar App
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/pos"
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm border border-slate-700 transition-all flex items-center gap-2 shadow-sm"
            >
              <Laptop className="w-4 h-4 text-emerald-400" />
              <span>Abrir Caja (POS)</span>
            </Link>
            <Link
              href="/descargar"
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm shadow-lg shadow-emerald-500/25 transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              <span>Instalar Gratis</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* 2. HERO SECTION */}
      <header className="relative pt-20 pb-28 px-6 overflow-hidden">
        {/* Glow de fondo */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-emerald-500/15 blur-[140px] rounded-full pointer-events-none"></div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-8 shadow-inner">
            <ShieldCheck className="w-4 h-4" />
            Protección Total contra "Pantallazos Falsos" de Nequi y Daviplata
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-white tracking-tight leading-[1.1] mb-6">
            Tus transferencias cantadas <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              en voz alta en tu caja.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto mb-10 leading-relaxed">
            Evita que estafen a tus empleados con capturas editadas o apps clonadas. 
            <strong> ConfirmaYa</strong> avisa por altavoz en tu negocio en menos de 1 segundo 
            cuando el dinero <strong>realmente ha ingresado a tu cuenta</strong>.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              href="/descargar"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-base shadow-xl shadow-emerald-500/30 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3"
            >
              <Download className="w-5 h-5" />
              <span>Descargar App Android (.APK)</span>
            </Link>

            <Link
              href="/pos"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-white font-bold text-base border border-slate-700/80 transition-all flex items-center justify-center gap-2"
            >
              <Laptop className="w-5 h-5 text-emerald-400" />
              <span>Ver Pantalla de Caja en Vivo</span>
            </Link>
          </div>

          {/* Badges de confianza */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-8 border-t border-slate-800/80 text-left">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/50 border border-slate-800/60">
              <Zap className="w-5 h-5 text-emerald-400 shrink-0" />
              <span className="text-xs font-semibold text-slate-300">Latencia Sub-Segundo (&lt;0.5s)</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/50 border border-slate-800/60">
              <Lock className="w-5 h-5 text-emerald-400 shrink-0" />
              <span className="text-xs font-semibold text-slate-300">Cero Contraseñas Bancarias</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/50 border border-slate-800/60">
              <Smartphone className="w-5 h-5 text-emerald-400 shrink-0" />
              <span className="text-xs font-semibold text-slate-300">Nequi + Daviplata + Bancolombia</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/50 border border-slate-800/60">
              <CreditCard className="w-5 h-5 text-emerald-400 shrink-0" />
              <span className="text-xs font-semibold text-slate-300">0% Comisiones por Venta</span>
            </div>
          </div>

        </div>
      </header>

      {/* 3. SIMULADOR INTERACTIVO DE VOZ EN VIVO */}
      <section id="demo-interactiva" className="py-20 px-6 bg-slate-900/50 border-y border-slate-800/80">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">Pruébalo ahora mismo</span>
            <h2 className="text-3xl sm:text-4xl font-black text-white mt-1">Escucha cómo sonará en tu negocio</h2>
            <p className="text-slate-400 text-sm mt-2">Haz clic en el botón para escuchar la voz en vivo tal como la escucharán tus cajeros.</p>
          </div>

          <div className="p-8 rounded-3xl bg-slate-900 border border-emerald-500/40 shadow-2xl shadow-emerald-950/60 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase">Monto a Probar</label>
              <div className="text-2xl font-black text-emerald-400 mt-1">$ 35.000 COP</div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 uppercase">Nombre del Cliente</label>
              <div className="text-lg font-bold text-white mt-1">Carlos Mario Ospina</div>
            </div>

            <div>
              <button
                onClick={handleTestVoice}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-base shadow-xl shadow-emerald-500/30 transition-all active:scale-95 flex items-center justify-center gap-3"
              >
                <Volume2 className="w-6 h-6 animate-pulse" />
                <span>🔊 Cantar Pago de Prueba</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4. ¿CÓMO FUNCIONA? */}
      <section id="como-funciona" className="py-24 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">Simplicidad Total</span>
          <h2 className="text-3xl sm:text-4xl font-black text-white mt-1">Listo para operar en 3 pasos</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 relative">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 font-black text-xl flex items-center justify-center mb-6">
              1
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Descarga la App en tu Celular</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Instalas <strong>ConfirmaYa Agente</strong> en el teléfono donde tienes Nequi o Daviplata. No requiere usuario ni contraseñas bancarias.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 relative">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 font-black text-xl flex items-center justify-center mb-6">
              2
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Abre la Caja en tu Computador</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Tus cajeros abren <strong>confirmaya.lat/pos</strong> en su pantalla o tablet. No tienen que instalar ningún programa extra.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 relative">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 font-black text-xl flex items-center justify-center mb-6">
              3
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Blindaje Automático 24/7</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Cuando un cliente paga, el altavoz de tu negocio canta el monto y la pantalla se ilumina en verde. ¡Cero estafas!
            </p>
          </div>
        </div>
      </section>

      {/* 5. TABLA COMPARATIVA: CON vs SIN */}
      <section className="py-20 px-6 bg-slate-900/30 border-t border-slate-800/80">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-white">¿Por qué lo necesitan tus clientes?</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* SIN CONFIRMAYA */}
            <div className="p-8 rounded-3xl bg-red-950/20 border border-red-900/40">
              <h3 className="text-xl font-black text-red-400 flex items-center gap-2 mb-6">
                <XCircle className="w-6 h-6" /> Sin ConfirmaYa
              </h3>
              <ul className="space-y-4 text-sm text-slate-300">
                <li className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <span>Los cajeros confían en capturas editadas o apps clonadas tipo "Nequi Glitch".</span>
                </li>
                <li className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <span>El cajero debe llamar al dueño a cada rato para preguntar: *"¿ya le entró la plata?"*.</span>
                </li>
                <li className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <span>Fila y demoras en caja mientras verifican la transferencia.</span>
                </li>
              </ul>
            </div>

            {/* CON CONFIRMAYA */}
            <div className="p-8 rounded-3xl bg-emerald-950/20 border border-emerald-500/40 shadow-xl shadow-emerald-950/40">
              <h3 className="text-xl font-black text-emerald-400 flex items-center gap-2 mb-6">
                <CheckCircle2 className="w-6 h-6" /> Con ConfirmaYa
              </h3>
              <ul className="space-y-4 text-sm text-slate-200">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Confirmación en altavoz solo cuando el dinero entra de verdad a la cuenta.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>El dueño no necesita compartir sus claves bancarias con los empleados.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Despacho inmediato de clientes en menos de 1 segundo.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 6. PLANES Y PRECIOS (WOMPI RECURRENTE) */}
      <section id="precios" className="py-24 px-6 max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">Precios Transparentes</span>
          <h2 className="text-4xl font-black text-white mt-1">Planes para tu Negocio</h2>
          <p className="text-slate-400 text-sm mt-2">Paga mensualmente con cualquier tarjeta o PSE a través de Wompi. Cancela cuando quieras.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          
          {/* PLAN MENSUAL */}
          <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Plan Mensual Flexible</h3>
              <p className="text-xs text-slate-400 mb-6">Ideal para empezar y probar en tu tienda.</p>
              
              <div className="mb-6">
                <span className="text-5xl font-black text-white">$29.900</span>
                <span className="text-slate-400 text-sm"> COP / mes</span>
              </div>

              <ul className="space-y-3 text-sm text-slate-300 mb-8">
                <li className="flex items-center gap-2">✓ 1 Teléfono Receptor (Nequi / Daviplata)</li>
                <li className="flex items-center gap-2">✓ Pantalla de Caja POS Ilimitada</li>
                <li className="flex items-center gap-2">✓ Alertas de Voz en Español en Alta Fidelidad</li>
                <li className="flex items-center gap-2">✓ Soporte por WhatsApp en Colombia</li>
              </ul>
            </div>

            <Link
              href="/descargar"
              className="w-full py-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-center block transition-all"
            >
              Comenzar Prueba Gratis (7 Días)
            </Link>
          </div>

          {/* PLAN ANUAL */}
          <div className="p-8 rounded-3xl bg-gradient-to-b from-slate-900 to-emerald-950/40 border-2 border-emerald-500 flex flex-col justify-between relative shadow-2xl shadow-emerald-950/80">
            <div className="absolute -top-3.5 right-6 px-3 py-1 rounded-full bg-emerald-500 text-slate-950 font-black text-xs uppercase tracking-wider">
              Ahorra 30%
            </div>

            <div>
              <h3 className="text-xl font-bold text-white mb-2">Plan Anual Blindado</h3>
              <p className="text-xs text-slate-400 mb-6">Tranquilidad todo el año para tu negocio.</p>
              
              <div className="mb-6">
                <span className="text-5xl font-black text-emerald-400">$249.000</span>
                <span className="text-slate-400 text-sm"> COP / año</span>
              </div>

              <ul className="space-y-3 text-sm text-slate-200 mb-8">
                <li className="flex items-center gap-2">✓ Todo lo del plan mensual</li>
                <li className="flex items-center gap-2">✓ Multi-Caja (Hasta 3 cajas simultáneas)</li>
                <li className="flex items-center gap-2">✓ Soporte VIP prioritario</li>
                <li className="flex items-center gap-2">✓ Actualizaciones automáticas de por vida</li>
              </ul>
            </div>

            <Link
              href="/descargar"
              className="w-full py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-center block transition-all shadow-lg shadow-emerald-500/25"
            >
              Activar Plan Anual
            </Link>
          </div>

        </div>
      </section>

      {/* 7. FOOTER */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-12 px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">ConfirmaYa.lat</span>
            <span>— Hecho en Colombia con tecnología en la nube.</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/pos" className="hover:text-slate-300">Pantalla de Caja</Link>
            <Link href="/descargar" className="hover:text-slate-300">Descargar APK</Link>
            <a href="https://wompi.co" target="_blank" rel="noopener noreferrer" className="hover:text-slate-300">Pagos Seguros con Wompi</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
