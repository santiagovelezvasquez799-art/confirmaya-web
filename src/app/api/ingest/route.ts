import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: NextRequest) {
  try {
    const deviceApiKey = req.headers.get("x-device-api-key");
    if (!deviceApiKey) {
      return NextResponse.json({ error: "Falta header x-device-api-key" }, { status: 401 });
    }

    // 1. Identificar el dispositivo y su organizacion
    const { data: device, error: deviceError } = await supabase
      .from("sensor_devices")
      .select("id, organization_id, branch_id, organizations(id, subscription_status, trial_ends_at)")
      .eq("device_api_key", deviceApiKey)
      .single();

    if (deviceError || !device) {
      return NextResponse.json({ error: "Dispositivo no reconocido o API Key invalida" }, { status: 403 });
    }

    const org = device.organizations as unknown as {
      id: string;
      subscription_status: string;
      trial_ends_at: string;
    };

    const isTrialValid =
      org.subscription_status === "trial" && new Date(org.trial_ends_at) > new Date();
    const isActive = org.subscription_status === "active";

    if (!isActive && !isTrialValid) {
      return NextResponse.json(
        { error: "Suscripcion vencida. Renueva tu plan para procesar pagos." },
        { status: 402 }
      );
    }

    const body = await req.json();
    if (!body.amount || body.amount <= 0) {
      return NextResponse.json({ error: "Monto invalido" }, { status: 400 });
    }

    // 2. Hash Anti-duplicados (ventana de 5 min)
    const fiveMinuteBucket = Math.floor((body.timestamp_unix || Date.now()) / (1000 * 60 * 5));
    const normalizedSender = (body.sender_name || "ANON").trim().toUpperCase();
    const hashData = org.id + "_" + (body.source || "nequi") + "_" + body.amount + "_" + normalizedSender + "_" + (body.reference_code || "") + "_" + fiveMinuteBucket;
    const deduplicationHash = crypto.createHash("sha256").update(hashData).digest("hex");

    // 3. Registrar transaccion
    const { data: transaction, error: insertError } = await supabase
      .from("transactions")
      .insert({
        organization_id: org.id,
        branch_id: device.branch_id,
        sensor_device_id: device.id,
        source: body.source || "nequi",
        amount: body.amount,
        sender_name: body.sender_name || "Remitente no especificado",
        sender_phone_tail: body.sender_phone_tail,
        reference_code: body.reference_code,
        raw_payload: body.raw_payload || "",
        deduplication_hash: deduplicationHash,
        status: "unclaimed",
      })
      .select("id, amount, sender_name, source, created_at")
      .single();

    if (insertError) {
      if (insertError.code === "23505") {
        return NextResponse.json({
          status: "ignored_duplicate",
          message: "Transferencia ya procesada previamente.",
        });
      }
      throw insertError;
    }

    // 4. Heartbeat
    await supabase
      .from("sensor_devices")
      .update({
        is_online: true,
        last_heartbeat_at: new Date().toISOString(),
        battery_level: body.battery_level ?? 100,
        is_charging: body.is_charging ?? false,
      })
      .eq("id", device.id);

    return NextResponse.json({
      status: "success",
      message: "Transferencia confirmada y retransmitida en tiempo real",
      transaction,
    }, { status: 201 });
  } catch (err: any) {
    console.error("Error en ingest:", err);
    return NextResponse.json({ error: err.message || "Error interno" }, { status: 500 });
  }
}