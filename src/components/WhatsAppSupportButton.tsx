'use client';

import React from 'react';
import { MessageCircle } from 'lucide-react';

interface WhatsAppSupportButtonProps {
  phoneNumber?: string;
  defaultMessage?: string;
}

export default function WhatsAppSupportButton({
  phoneNumber = '573215526201', // Mode Agency Oficial
  defaultMessage = '¡Hola ConfirmaYa! Necesito ayuda con mi suscripción o activación de caja.'
}: WhatsAppSupportButtonProps) {
  const handleClick = () => {
    const encoded = encodeURIComponent(defaultMessage);
    const url = `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encoded}`;
    window.open(url, '_blank');
  };

  return (
    <button
      onClick={handleClick}
      aria-label="Soporte por WhatsApp"
      className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-2xl shadow-emerald-500/30 transition-all hover:scale-105 active:scale-95 group"
    >
      <div className="w-5 h-5 rounded-full bg-slate-950 text-emerald-400 flex items-center justify-center shrink-0">
        <MessageCircle className="w-3.5 h-3.5 fill-current" />
      </div>
      <span className="hidden sm:inline">¿Ayuda? WhatsApp</span>
    </button>
  );
}
