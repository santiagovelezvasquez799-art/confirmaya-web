import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.confirmaya.lat'),
  title: 'ConfirmaYa.lat - Alertas de Pago en Tiempo Real | Anti-Estafas para Negocios',
  description: 'Blindaje contra comprobantes falsos de Nequi, Daviplata y Bancolombia. Notificaciones de voz en vivo, pantalla POS para cajeros y panel para el dueño.',
  manifest: '/manifest.json',
  icons: {
    icon: '/icon-192.png',
    apple: '/icon-192.png',
  },
  openGraph: {
    title: 'ConfirmaYa.lat - Verificación de Pagos en Tiempo Real',
    description: 'Evita estafas con comprobantes falsos de Nequi y Daviplata en tu negocio. Tu caja canta el pago en menos de 1 segundo.',
    url: 'https://www.confirmaya.lat',
    siteName: 'ConfirmaYa',
    images: [
      {
        url: '/wompi-product.png',
        width: 800,
        height: 800,
        alt: 'ConfirmaYa - Protección Total para Negocios',
      },
    ],
    locale: 'es_CO',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ConfirmaYa.lat - Alertas por Voz de Nequi y Daviplata',
    description: 'Blindaje anti-fraude para negocios físicos en Colombia. Cero comprobantes falsos.',
    images: ['/wompi-product.png'],
  },
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
