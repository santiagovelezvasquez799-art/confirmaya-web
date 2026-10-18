'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Download, 
  QrCode, 
  Volume2, 
  CheckCircle2, 
  ArrowRight, 
  Smartphone, 
  Sparkles, 
  ChevronRight,
  ShieldCheck,
  X
} from 'lucide-react';

interface OnboardingWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPairing: () => void;
  storeName?: string;
}

export default function OnboardingWizard({
  isOpen,
  onClose,
  onOpenPairing,
  storeName = 'Tu Comercio'
}: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Glow de fondo */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Encabezado */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Activación en 3 Minutos
          </div>
          <h2 className="text-2xl font-black text-white">
            Bienvenido a ConfirmaYa
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Configura {storeName} para recibir pagos por Nequi y Daviplata sin fraudes ni demoras.
          </p>
        </div>

        {/* Indicador de pasos */}
        <div className="flex items-center justify-between mb-8 px-4 relative">
          <div className="absolute left-10 right-10 top-1/2 -translate-y-1/2 h-0.5 bg-slate-800 -z-0" />
          
          {[1, 2, 3].map((step) => {
            const isCompleted = currentStep > step;
            const isCurrent = currentStep === step;
            return (
              <button
                key={step}
                onClick={() => setCurrentStep(step as 1 | 2 | 3)}
                className={`relative z-10 w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  isCompleted
                    ? 'bg-emerald-500 text-slate-950 font-black ring-4 ring-slate-900'
                    : isCurrent
                    ? 'bg-emerald-500 text-slate-950 font-black ring-4 ring-emerald-500/30'
                    : 'bg-slate-800 text-slate-400 ring-4 ring-slate-900'
                }`}
              >
                {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : step}
              </button>
            );
          })}
        </div>

        {/* CONTENIDO DE CADA PASO */}
        <div className="min-h-[220px] flex flex-col justify-between">
          {currentStep === 1 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Smartphone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Paso 1: Descarga la App en el Celular de Caja</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Instala el sensor de <strong className="text-slate-200">ConfirmaYa Agente</strong> en el teléfono donde tienes abierta tu cuenta de Nequi o Daviplata en el negocio.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href="/api/download"
                  className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 transition-all"
                >
                  <Download className="w-4 h-4 text-emerald-400" />
                  Descargar APK Directa
                </a>
                <Link
                  href="/descargar"
                  target="_blank"
                  className="py-3 px-4 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 font-semibold text-xs text-center border border-slate-800 transition-all"
                >
                  Ver Guía de Instalación →
                </Link>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <QrCode className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Paso 2: Vincula con Código QR</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Abre la app en el celular y dale los permisos de lectura de notificaciones. La conexión se sincroniza al instante con tu pantalla de caja.
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  onClose();
                  onOpenPairing();
                }}
                className="w-full py-3.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all"
              >
                <QrCode className="w-4 h-4" />
                Mostrar Código QR de Vinculación
              </button>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Volume2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Paso 3: Realiza una Transferencia de Prueba</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Pídele a alguien que te transfiera $500 o $1.000 COP a tu Nequi o Daviplata. En menos de un segundo, la pantalla cantará por altavoz el monto y el nombre exacto.
                  </p>
                </div>
              </div>

              <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-xl p-3 flex items-center gap-2 text-xs text-emerald-300">
                <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>¡Cero capturas falsas! Tu dinero confirmado con total tranquilidad.</span>
              </div>
            </div>
          )}

          {/* BOTONES DE NAVEGACIÓN */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-800/80 mt-6">
            {currentStep > 1 ? (
              <button
                onClick={() => setCurrentStep((currentStep - 1) as 1 | 2 | 3)}
                className="text-xs font-semibold text-slate-400 hover:text-white transition-colors"
              >
                ← Anterior
              </button>
            ) : (
              <span />
            )}

            {currentStep < 3 ? (
              <button
                onClick={() => setCurrentStep((currentStep + 1) as 1 | 2 | 3)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-2 transition-all"
              >
                Siguiente Paso <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20"
              >
                ¡Listo para Facturar! <CheckCircle2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
