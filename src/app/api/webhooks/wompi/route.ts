import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// En Wompi, el secret del webhook (events secret) se configura en la consola de Wompi.
const WOMPI_EVENTS_SECRET = process.env.WOMPI_EVENTS_SECRET || "";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const body = JSON.parse(rawBody);

    // 1. Validar firma criptográfica si WOMPI_EVENTS_SECRET está configurado
    if (WOMPI_EVENTS_SECRET && body.signature && body.signature.properties && body.signature.checksum) {
      const properties: string[] = body.signature.properties;
      let concatenatedString = "";

      for (const prop of properties) {
        const keys = prop.split(".");
        let value: any = body.data;
        for (const k of keys) {
          if (value) value = value[k];
        }
        concatenatedString += value ?? "";
      }

      const timestamp = body.timestamp ?? "";
      concatenatedString += timestamp;
      concatenatedString += WOMPI_EVENTS_SECRET;

      const calculatedHash = crypto.createHash("sha256").update(concatenatedString).digest("hex");

      if (calculatedHash !== body.signature.checksum) {
        console.warn("[WOMPI WEBHOOK] Firma inválida:", { calculatedHash, checksum: body.signature.checksum });
        return NextResponse.json({ error: "Firma inválida" }, { status: 401 });
      }
    }

    const { event, data } = body;
    console.log(`[WOMPI WEBHOOK] Evento recibido: ${event}`);

    // Procesamos únicamente transacciones actualizadas
    if (event === "transaction.updated" && data && data.transaction) {
      const tx = data.transaction;
      const status = tx.status; // 'APPROVED', 'DECLINED', 'VOIDED', 'ERROR'
      const amountInCents = tx.amount_in_cents || 0;
      const reference = tx.reference || "";
      const customerEmail = tx.customer_email || "";
      const paymentMethod = tx.payment_method_type || "UNKNOWN";
      const wompiTxId = tx.id;

      // DISCRIMINADOR MULTI-SISTEMA:
      // Si el pago no pertenece a ConfirmaYa (por referencia o por monto de $30.000 COP = 3000000 centavos),
      // respondemos 200 OK amigablemente para que Wompi no reintente, y no alteramos nada.
      const isConfirmaYaPayment = 
        reference.toLowerCase().includes("confirmaya") || 
        reference.includes("RJ26Ay") ||
        amountInCents === 3000000;

      if (!isConfirmaYaPayment) {
        console.log(`[WOMPI WEBHOOK] Transacción ${wompiTxId} ($${amountInCents/100} COP) pertenece a otro sistema de Mode Agency. Ignorando.`);
        return NextResponse.json({ received: true, ignored: true, reason: "different_system" }, { status: 200 });
      }

      console.log(`[WOMPI WEBHOOK] Transacción ConfirmaYa ${wompiTxId} - Estado: ${status} - Ref: ${reference} - Email: ${customerEmail}`);

      if (status === "APPROVED") {
        // Renovar suscripción por 30 días
        const now = new Date();
        const newPeriodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // +30 días

        let targetOrgId: string | null = null;

        // Estrategia A: Si la referencia trae el orgId (ej: CONFIRMAYA_ORG_<UUID>_<TIMESTAMP>)
        if (reference.includes("CONFIRMAYA_ORG_")) {
          const parts = reference.split("_");
          targetOrgId = parts[2] || null;
        }

        // Estrategia B: Buscar por el email del usuario en auth.users o en organizaciones
        if (!targetOrgId && customerEmail) {
          const { data: userProfile } = await supabase
            .from("organizations")
            .select("id")
            .ilike("contact_email", customerEmail)
            .limit(1)
            .single();

          if (userProfile?.id) {
            targetOrgId = userProfile.id;
          }
        }

        // Estrategia C: Fallback para el demo o comercio predeterminado
        if (!targetOrgId) {
          targetOrgId = "a0000000-0000-0000-0000-000000000001";
        }

        // Actualizar la organización a 'active' por 30 días
        const { error: updateError } = await supabase
          .from("organizations")
          .update({
            subscription_status: "active",
            current_period_end: newPeriodEnd.toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", targetOrgId);

        if (updateError) {
          console.error("[WOMPI WEBHOOK] Error actualizando suscripción:", updateError);
        } else {
          console.log(`[WOMPI WEBHOOK] ¡Suscripción extendida 30 días para org ${targetOrgId}! Hasta: ${newPeriodEnd.toISOString()}`);
        }
      }
    }

    return NextResponse.json({ received: true, status: "processed" }, { status: 200 });
  } catch (err: any) {
    console.error("[WOMPI WEBHOOK] Error procesando webhook:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
