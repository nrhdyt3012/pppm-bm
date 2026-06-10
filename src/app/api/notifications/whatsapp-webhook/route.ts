/**
 * API Endpoint: POST /api/notifications/whatsapp-webhook
 * Webhook dari Fonnte untuk menerima delivery status dan message callbacks
 * Konfigurasi di Fonnte Dashboard → Settings → Webhook
 */

export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { FontneWebhookPayload } from "@/types/fonnte";

export async function POST(request: NextRequest) {
  try {
    const body: FontneWebhookPayload = await request.json();

    console.log(
      "[WHATSAPP-WEBHOOK] Received webhook:",
      JSON.stringify(body, null, 2)
    );

    const { event, data } = body;

    // Handle different event types
    if (event === "status") {
      // Delivery status update
      const { id, status, target, timestamp } = data;

      console.log(
        `[WHATSAPP-WEBHOOK] Status update - ID: ${id}, Status: ${status}, Target: ${target}`
      );

      const supabase = await createClient({ isAdmin: true });

      // Update delivery status di database
      const { error } = await supabase
        .from("whatsapp_notification_logs")
        .update({
          delivery_status: status.toUpperCase() as
            | "PENDING"
            | "SENT"
            | "DELIVERED"
            | "FAILED",
          delivered_at:
            status === "delivered" || status === "read"
              ? new Date().toISOString()
              : null,
          fonnte_response: { ...data, timestamp },
        })
        .eq("fonnte_message_id", id);

      if (error) {
        console.error("[WHATSAPP-WEBHOOK] Error updating log:", error);
      } else {
        console.log(`✅ [WHATSAPP-WEBHOOK] Updated delivery status for ${id}`);
      }

      return NextResponse.json({
        success: true,
        message: "Delivery status updated",
      });
    } else if (event === "message") {
      // Incoming message from user (optional)
      const { id, target, message, timestamp } = data;

      console.log(
        `[WHATSAPP-WEBHOOK] Incoming message from ${target}: ${message}`
      );

      // Bisa digunakan untuk handle incoming messages dari wali
      // Contoh: menerima pertanyaan, komplain, dll
      // Implementasi sesuai kebutuhan bisnis Anda

      return NextResponse.json({
        success: true,
        message: "Message received",
      });
    } else if (event === "device") {
      // Device status update
      const { target, status, timestamp } = data;

      console.log(
        `[WHATSAPP-WEBHOOK] Device status - Target: ${target}, Status: ${status}`
      );

      // Log device status jika perlu monitoring

      return NextResponse.json({
        success: true,
        message: "Device status received",
      });
    } else {
      console.warn(`[WHATSAPP-WEBHOOK] Unknown event type: ${event}`);
      return NextResponse.json(
        { warning: "Unknown event type" },
        { status: 200 }
      );
    }
  } catch (error: any) {
    console.error("[WHATSAPP-WEBHOOK] Error:", error);

    // Always return 200 OK to avoid Fonnte retries
    // But log the error for debugging
    return NextResponse.json(
      { error: error.message },
      { status: 200 }
    );
  }
}

// Optional: GET handler untuk testing
export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: "WhatsApp Webhook endpoint is active",
    documentation:
      "POST requests dari Fonnte akan diproses di sini",
  });
}
