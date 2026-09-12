import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ConfirmaYa POS - Verificación de Pagos en Tiempo Real',
  description: 'Confirma transferencias de Nequi y Daviplata al instante con alertas audibles y evita fraudes.',
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="antialiased bg-slate-950 text-slate-100">{children}</body>
    </html>
  );
}
