'use client';

import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Smartphone, Check } from 'lucide-react';

interface PairingModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  endpointUrl: string;
  storeName: string;
}

export default function PairingModal({ isOpen, onClose, apiKey, endpointUrl, storeName }: PairingModalProps) {
  if (!isOpen) return null;

  const pairingPayload = JSON.stringify({
    apiKey,
    endpointUrl,
    storeName,
  });

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 text-center relative shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-4">
          <Smartphone className="w-6 h-6" />
        </div>

        <h3 className="text-xl font-bold text-white mb-1">Vincular Celular con Nequi</h3>
        <p className="text-xs text-slate-400 mb-6">
          Abre la app <strong>ConfirmaYa Agente</strong> en el teléfono donde recibes los pagos y escanea este código.
        </p>

        {/* CÓDIGO QR GENERADO */}
        <div className="bg-white p-4 rounded-2xl inline-block shadow-inner mb-6">
          <QRCodeSVG value={pairingPayload} size={200} level="M" />
        </div>

        <div className="space-y-2 text-left bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Sin claves bancarias ni contraseñas.</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Sincronización instantánea con esta caja.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
