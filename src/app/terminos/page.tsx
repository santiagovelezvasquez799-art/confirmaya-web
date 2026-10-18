import React from 'react';
import Link from 'next/link';
import { ArrowLeft, FileCheck, AlertTriangle } from 'lucide-react';

export const metadata = {
  title: 'Términos y Condiciones del Servicio | ConfirmaYa Colombia',
  description: 'Condiciones de uso, modelo de suscripción mensual y alcance técnico de la plataforma ConfirmaYa.',
};

export default function TerminosPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-black">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-emerald-400 font-bold hover:text-emerald-300 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al inicio</span>
          </Link>
          <div className="flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-emerald-400" />
            <span className="font-bold text-white text-sm">ConfirmaYa Legal</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-12 flex-1">
        <div className="mb-10 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-3">
            <FileCheck className="w-3.5 h-3.5" />
            Acuerdo de Licencia de Software B2B
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Términos y Condiciones de Uso del Servicio
          </h1>
          <p className="text-sm text-slate-400 mt-2">
            Vigente a partir de Octubre de 2026 • Aplica para toda Colombia
          </p>
        </div>

        {/* Advertencia de Alcance */}
        <div className="bg-amber-950/30 border border-amber-500/30 rounded-2xl p-6 mb-8 text-amber-200">
          <div className="flex items-start gap-4">
            <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs sm:text-sm leading-relaxed">
              <h3 className="font-bold text-white text-base">Naturaleza del Servicio de Software</h3>
              <p>
                ConfirmaYa es una herramienta tecnológica independiente diseñada para asistir visual y auditivamente en la recepción de pagos digitales en puntos de venta físicos. ConfirmaYa no garantiza la disponibilidad ni la infalibilidad de redes de telecomunicaciones de terceros, operadores móviles ni de las plataformas bancarias emisoras (Nequi, Daviplata, Bancolombia, etc.).
              </p>
            </div>
          </div>
        </div>

        {/* Secciones Legales */}
        <div className="space-y-8 text-sm text-slate-300 leading-relaxed">
          
          <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white mb-3">
              1. Aceptación de los Términos
            </h2>
            <p>
              Al registrarse, descargar la aplicación Android complementaria o acceder al panel de caja (POS) en <code>https://www.confirmaya.lat</code>, el usuario (en adelante &ldquo;El Comercio&rdquo; o &ldquo;El Suscriptor&rdquo;) manifiesta que ha leído, comprendido y aceptado en su totalidad el presente acuerdo.
            </p>
          </section>

          <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white mb-3">
              2. Modelo de Suscripción y Precios
            </h2>
            <p>
              ConfirmaYa se comercializa bajo la modalidad Software como Servicio (SaaS):
            </p>
            <ul className="list-disc list-inside space-y-2 mt-3 text-slate-300">
              <li><strong>Periodo de Prueba Gratuito:</strong> Todo nuevo comercio registrado cuenta con un periodo de evaluación sin costo (24 horas) para verificar la compatibilidad en sus dispositivos sin necesidad de registrar tarjetas de crédito.</li>
              <li><strong>Tarifa Plana Mensual:</strong> El costo del servicio es de <strong>$30.000 COP mensuales</strong> por sede comercial, con transferencias y notificaciones ilimitadas.</li>
              <li><strong>Sin Cláusulas de Permanencia:</strong> El comercio puede cancelar o no renovar la suscripción en cualquier momento sin penalidades ni cobros adicionales.</li>
            </ul>
          </section>

          <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white mb-3">
              3. Obligaciones y Responsabilidades del Comercio
            </h2>
            <p>
              Para garantizar el óptimo funcionamiento del sistema, el comercio se compromete a:
            </p>
            <ol className="list-decimal list-inside space-y-2 mt-3 text-slate-300">
              <li>Mantener el dispositivo celular receptor encendido, con batería suficiente y conectado a una red de datos móviles o WiFi estable.</li>
              <li>Otorgar y mantener activos los permisos del sistema operativo Android requeridos por <em>ConfirmaYa Agente</em> (Acceso a notificaciones y exclusión de optimización de batería agresiva).</li>
              <li>Instruir a sus cajeros y dependientes a utilizar el módulo de <strong>Verificación Manual</strong> ante cualquier duda o falla en la recepción de notificaciones del operador móvil.</li>
              <li>No utilizar el servicio para fines ilícitos, lavado de activos o violación de la legislación colombiana vigente.</li>
            </ol>
          </section>

          <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white mb-3">
              4. Limitación de Responsabilidad
            </h2>
            <p>
              ConfirmaYa implementa los más altos estándares técnicos para la captura y sincronización en tiempo real. No obstante, en la máxima medida permitida por la ley colombiana, ConfirmaYa no será responsable por:
            </p>
            <ul className="list-disc list-inside space-y-2 mt-3 text-slate-300">
              <li>Retrasos o caídas masivas en los servicios de notificación push de las entidades bancarias ajenas a nuestra infraestructura.</li>
              <li>Pérdidas comerciales derivadas de entregas de mercancía realizadas por el cajero sin verificar la confirmación sonora, visual o manual del sistema.</li>
              <li>Interrupción del servicio ocasionada por fallas generales en proveedores globales de hosting o infraestructura de telecomunicaciones.</li>
            </ul>
          </section>

          <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white mb-3">
              5. Ley Aplicable y Jurisdicción
            </h2>
            <p>
              Este acuerdo se rige e interpreta conforme a las leyes de la República de Colombia. Cualquier controversia que no pueda ser resuelta de común acuerdo entre las partes será sometida a la jurisdicción ordinaria de los jueces de la República de Colombia.
            </p>
          </section>

        </div>

        {/* Footer info */}
        <div className="mt-12 pt-6 border-t border-slate-800 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} ConfirmaYa.lat • Plataforma SaaS de confirmación sonora y visual de pagos en tiempo real.
        </div>
      </main>
    </div>
  );
}
