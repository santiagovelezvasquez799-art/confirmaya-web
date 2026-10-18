import React from 'react';
import Link from 'next/link';
import { ShieldCheck, ArrowLeft, Lock, FileText, CheckCircle2 } from 'lucide-react';

export const metadata = {
  title: 'Política de Tratamiento de Datos Personales | ConfirmaYa Colombia',
  description: 'Conoce cómo ConfirmaYa protege la privacidad de tu comercio y cumple estrictamente con la Ley 1581 de 2012 de Habeas Data en Colombia.',
};

export default function PrivacidadPage() {
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
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span className="font-bold text-white text-sm">ConfirmaYa Legal</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-12 flex-1">
        <div className="mb-10 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-3">
            <Lock className="w-3.5 h-3.5" />
            Cumplimiento Ley 1581 de 2012 (Colombia)
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Política de Tratamiento de Datos Personales y Privacidad
          </h1>
          <p className="text-sm text-slate-400 mt-2">
            Última actualización: Octubre de 2026 • ConfirmaYa S.A.S. (En constitución)
          </p>
        </div>

        {/* Banner de Garantía Bancaria */}
        <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-2xl p-6 mb-8 text-emerald-200">
          <div className="flex items-start gap-4">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="font-bold text-white text-base">Declaración Expresa de Seguridad Bancaria</h3>
              <p className="text-xs sm:text-sm text-emerald-200/90 leading-relaxed">
                <strong>ConfirmaYa NO es una entidad financiera ni vigilada por la Superfinanciera, NO solicita claves de acceso, contraseñas, tokens dinámicos ni credenciales bancarias, y NO tiene la capacidad de debitar fondos de ninguna cuenta.</strong> Nuestra tecnología opera de manera 100% pasiva leyendo exclusivamente el texto de las notificaciones públicas visualizadas en la barra de estado del dispositivo móvil Android bajo autorización expresa del titular.
              </p>
            </div>
          </div>
        </div>

        {/* Secciones Legales */}
        <div className="space-y-8 text-sm text-slate-300 leading-relaxed">
          
          <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-400" />
              1. Identificación del Responsable del Tratamiento
            </h2>
            <p>
              <strong>CONFIRMAYA</strong>, plataforma de software operando en el territorio de la República de Colombia, accesible mediante el dominio oficial <code>https://www.confirmaya.lat</code>, actúa como Responsable y Encargado del Tratamiento de los datos personales recolectados a través de su infraestructura de software, en estricto cumplimiento de la Ley Estatutaria 1581 de 2012, el Decreto Reglamentario 1377 de 2013 y demás normas que los modifiquen o adicionen.
            </p>
            <p className="mt-2 text-xs text-slate-400">
              Canal oficial de atención al titular para peticiones, quejas y reclamos (Habeas Data): <strong>soporte@confirmaya.lat</strong>.
            </p>
          </section>

          <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white mb-3">
              2. Datos Recolectados y Finalidad del Tratamiento
            </h2>
            <p>
              ConfirmaYa recolecta únicamente los datos estrictamente necesarios para prestar el servicio de verificación auditiva y visual en puntos de venta (POS) físicos:
            </p>
            <ul className="list-disc list-inside space-y-2 mt-3 text-slate-300">
              <li><strong>Datos del Comercio Titular:</strong> Nombre o Razón Social, correo electrónico de administración, número de teléfono de contacto y ciudad de operación.</li>
              <li><strong>Datos Transaccionales Operativos:</strong> Nombre del remitente que figura públicamente en la notificación (ej. &ldquo;SIMON VELEZ&rdquo;), monto recibido en pesos colombianos (COP), fecha y hora exacta, billetera origen (Nequi, Daviplata, Bancolombia, etc.) y código de referencia o comprobante.</li>
              <li><strong>Datos de Telemetría del Dispositivo Sensor:</strong> Porcentaje de batería del teléfono celular y estado de conectividad a internet, utilizados exclusivamente para alertar al comerciante en caso de riesgo de desconexión del punto de cobro.</li>
            </ul>
            <p className="mt-3">
              <strong>Finalidad Exclusiva:</strong> La información capturada tiene como único propósito notificar en tiempo real en la pantalla de la caja del establecimiento el ingreso verídico de fondos para mitigar el fraude mediante comprobantes falsificados. En ningún caso comercializamos, cedemos ni compartimos bases de datos con terceros para pautas publicitarias o monetización de datos.
            </p>
          </section>

          <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white mb-3">
              3. Permiso de Acceso a Notificaciones en Android
            </h2>
            <p>
              La aplicación complementaria <em>ConfirmaYa Agente</em> requiere la autorización del permiso de accesibilidad a notificaciones de Android (<code>NotificationListenerService</code>). 
            </p>
            <p className="mt-2">
              Dicho permiso es activado voluntariamente por el usuario en los ajustes de su sistema operativo. El agente descarta en el dispositivo local cualquier notificación que no provenga explícitamente de billeteras electrónicas o canales de pago registrados, ignorando mensajes personales, chats de mensajería privada, llamadas o correos electrónicos.
            </p>
          </section>

          <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white mb-3">
              4. Derechos de los Titulares (Habeas Data)
            </h2>
            <p>
              De conformidad con el artículo 8 de la Ley 1581 de 2012, los titulares de datos personales tienen derecho a:
            </p>
            <ol className="list-decimal list-inside space-y-2 mt-3 text-slate-300">
              <li>Conocer, actualizar y rectificar sus datos personales frente a ConfirmaYa.</li>
              <li>Solicitar prueba de la autorización otorgada para el tratamiento.</li>
              <li>Ser informado, previa solicitud, respecto del uso que se le ha dado a sus datos personales.</li>
              <li>Presentar ante la Superintendencia de Industria y Comercio (SIC) quejas por infracciones a lo dispuesto en la ley.</li>
              <li>Revocar la autorización y/o solicitar la supresión del dato cuando en el tratamiento no se respeten los principios, derechos y garantías constitucionales y legales.</li>
            </ol>
          </section>

          <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white mb-3">
              5. Medidas de Seguridad y Cifrado
            </h2>
            <p>
              Todas las comunicaciones entre el dispositivo sensor Android, la nube de procesamiento y las pantallas de los cajeros se ejecutan bajo protocolos cifrados TLS 1.3 / SSL con certificados de alta seguridad. Los tokens de autenticación de los dispositivos utilizan firmas criptográficas de un solo uso para prevenir accesos no autorizados.
            </p>
          </section>

        </div>

        {/* Footer info */}
        <div className="mt-12 pt-6 border-t border-slate-800 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} ConfirmaYa.lat • Todos los derechos reservados • Desarrollado para el comercio seguro en Colombia.
        </div>
      </main>
    </div>
  );
}
