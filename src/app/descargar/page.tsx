'use client';

import React from 'react';
import Link from 'next/link';
import { Download, ShieldCheck, CheckCircle2, ArrowLeft, Smartphone, AlertCircle } from 'lucide-react';

export default function DescargarPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-6 flex flex-col justify-between">
      <div className="max-w-3xl mx-auto w-full pt-10 pb-16">
        
        {/* BOTÓN VOLVER */}
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Volver a Inicio
        </Link>

        {/* ENCABEZADO */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-6 border border-emerald-500/30 shadow-lg shadow-emerald-500/10">
            <Smartphone className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight mb-3">
            Descargar ConfirmaYa para Android
          </h1>
          <p className="text-slate-400 text-base max-w-lg mx-auto">
            Instala la aplicación en el celular donde tienes tu cuenta de <strong>Nequi</strong> o <strong>Daviplata</strong>.
          </p>
        </div>

        {/* BOTÓN PRINCIPAL DE DESCARGA */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center shadow-2xl mb-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 blur-3xl rounded-full pointer-events-none"></div>

          <p className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-2">Versión 1.0.0 Oficial</p>
          <h2 className="text-2xl font-black text-white mb-6">ConfirmaYa Agente (.APK)</h2>

          {/* Enlace de descarga que apunta a /downloads/ConfirmaYa.apk */}
          <a
            href="/downloads/ConfirmaYa.apk"
            download
            className="inline-flex items-center justify-center gap-3 px-8 py-5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-lg shadow-xl shadow-emerald-500/30 transition-all hover:scale-105 active:scale-95 w-full sm:w-auto"
          >
            <Download className="w-6 h-6" />
            <span>Descargar Instalador (.APK)</span>
          </a>

          <p className="text-xs text-slate-500 mt-4">Compatible con Android 8.0 hasta Android 15 (Xiaomi, Samsung, Motorola, etc.)</p>
        </div>

        {/* PASO A PASO DE INSTALACIÓN EN ANDROID */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white mb-4">Instrucciones de Instalación en 3 Pasos:</h3>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex items-start gap-4">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0">1</div>
            <div>
              <p className="text-sm font-bold text-white">Toca el botón "Descargar"</p>
              <p className="text-xs text-slate-400 mt-1">Si Chrome o tu navegador te muestra el aviso estándar de Android: <em>"Este archivo puede ser dañino"</em>, selecciona <strong>"Descargar de todos modos"</strong>.</p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex items-start gap-4">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0">2</div>
            <div>
              <p className="text-sm font-bold text-white">Abre el archivo e instala</p>
              <p className="text-xs text-slate-400 mt-1">Toca el archivo descargado y presiona <strong>"Instalar"</strong>. Si es necesario, autoriza instalar apps desde el navegador.</p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex items-start gap-4">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0">3</div>
            <div>
              <p className="text-sm font-bold text-white">Concede los permisos al abrir la app</p>
              <p className="text-xs text-slate-400 mt-1">Presiona los dos botones en verde: <strong>"Acceso a Notificaciones"</strong> y <strong>"Desactivar Ahorro de Batería"</strong> para que funcione 24/7 de forma silenciosa.</p>
            </div>
          </div>
        </div>

      </div>

      <footer className="text-center text-xs text-slate-500 py-6 border-t border-slate-900">
        ConfirmaYa.lat — Soporte en Colombia vía WhatsApp
      </footer>
    </div>
  );
}
