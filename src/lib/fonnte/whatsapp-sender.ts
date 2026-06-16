/**
 * WhatsApp Notification Service
 * Business logic untuk mengirim dan track notifikasi WhatsApp
 */

import FontteClient from './client';
import { whatsappTemplates } from './templates';
import { createClient } from '@/lib/supabase/server';
import {
  NotificationPayload,
  FontneSendMessageResponse,
  WhatsAppNotificationLog,
} from '@/types/fonnte';

interface SendNotificationOptions {
  retries?: number;
  retryDelay?: number;
}

class WhatsAppNotificationService {
  private fontteClient: FontteClient;
  private maxRetries: number = 3;
  private retryDelay: number = 1000; // 1 second

  constructor(apiKey: string) {
    this.fontteClient = new FontteClient({ apiKey });
  }

  /**
   * Send notification with retry logic
   */
  async sendNotification(
    payload: NotificationPayload,
    options?: SendNotificationOptions
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const maxRetries = options?.retries ?? this.maxRetries;
    const retryDelay = options?.retryDelay ?? this.retryDelay;

    // Validate phone number
    if (!FontteClient.isValidPhoneNumber(payload.recipientPhone)) {
      const error = `Invalid phone number: ${payload.recipientPhone}`;
      console.error('[WhatsAppService]', error);
      await this.logNotification(payload, 'FAILED', null, { error });
      return { success: false, error };
    }

    // Generate message based on type
    let message: string;
    try {
      switch (payload.messageType) {
        case 'TAGIHAN':
          message = whatsappTemplates.notifikasiTagihan({
            recipientName: payload.recipientName,
            studentName: payload.studentName,
            periode: payload.data.periode || '-',
            namaTagihan: payload.data.namaTagihan || '-',
            nominal: payload.data.nominal?.toString() || '0',
            linkPembayaran: payload.data.linkPembayaran || '#',
            batasPembayaran: payload.data.batasPembayaran,
          });
          break;

        case 'PAYMENT_SUCCESS':
          message = whatsappTemplates.notifikasiPembayaranBerhasil({
            recipientName: payload.recipientName,
            studentName: payload.studentName,
            namaTagihan: payload.data.namaTagihan || '-',
            nominalBayar: payload.data.nominalBayar?.toString() || '0',
            tanggalPembayaran: payload.data.tanggalPembayaran || '-',
            linkKwitansi: payload.data.linkKwitansi || '#',
          });
          break;

        case 'PAYMENT_FAILED':
          message = whatsappTemplates.notifikasiPembayaranGagal({
            recipientName: payload.recipientName,
            studentName: payload.studentName,
            namaTagihan: payload.data.namaTagihan || '-',
            nominalBayar: payload.data.nominalBayar?.toString() || '0',
            alasan: payload.data.alasan,
            nomorAdmin: payload.data.nomorAdmin,
          });
          break;

        default:
          const _exhaustive: never = payload.messageType;
          throw new Error(`Unknown message type: ${_exhaustive}`);
      }
    } catch (error) {
      console.error('[WhatsAppService] Template generation error:', error);
      await this.logNotification(payload, 'FAILED', null, { error: String(error) });
      return { success: false, error: 'Failed to generate message' };
    }

    // Send with retry
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const formattedPhone = FontteClient.formatPhoneNumber(
          payload.recipientPhone
        );

        const response = await this.fontteClient.sendMessage({
          target: formattedPhone,
          message,
        });

        // ─── DEBUG LOG — lihat response asli dari Fonnte ──────────────────
        console.log(
          `[WhatsAppService] Fonnte response (attempt ${attempt}):`,
          JSON.stringify(response)
        );
        // ────────────────────────────────────────────────────────────────

        // FIX: Fonnte mengembalikan id sebagai array di response.id,
        // bukan di response.data.id. Cukup cek response.status === true
        // untuk menentukan sukses.
        if (response.status) {
          const messageId = Array.isArray(response.id)
            ? String(response.id[0])
            : response.data?.id || String(response.requestid || '');

          console.log(
            `[WhatsAppService] Message sent successfully (attempt ${attempt}):`,
            messageId
          );

          await this.logNotification(
            payload,
            'SENT',
            messageId,
            response
          );

          return {
            success: true,
            messageId,
          };
        }

        // ─── tampilkan alasan kegagalan sesungguhnya dari Fonnte ─────
        const fonnteReason =
          response.reason ||
          response.message ||
          JSON.stringify(response) ||
          'Unknown error';
        throw new Error(fonnteReason);
        // ────────────────────────────────────────────────────────────────
      } catch (error) {
        console.error(
          `[WhatsAppService] Attempt ${attempt}/${maxRetries} failed:`,
          error
        );

        if (attempt === maxRetries) {
          await this.logNotification(
            payload,
            'FAILED',
            null,
            {
              error: String(error),
              lastAttempt: attempt,
            }
          );
          return {
            success: false,
            error: String(error),
          };
        }

        // Wait before retry
        await this.delay(retryDelay);
      }
    }

    return {
      success: false,
      error: 'Max retries exceeded',
    };
  }

  /**
   * Check message delivery status
   */
  async checkDeliveryStatus(
    messageId: string
  ): Promise<{
    status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
    timestamp?: string;
  }> {
    try {
      const response = await this.fontteClient.checkStatus({ id: messageId });

      if (response.status && response.data) {
        return {
          status: response.data.status,
          timestamp: response.data.timestamp,
        };
      }

      throw new Error(response.message || 'Failed to check status');
    } catch (error) {
      console.error('[WhatsAppService] Check status error:', error);
      return { status: 'failed' };
    }
  }

  /**
   * Log notification to database
   * FIX: pakai isAdmin: true karena method ini dipanggil dari context
   * server-to-server (API route tanpa session user) — ANON key akan
   * selalu kena RLS block untuk tabel whatsapp_notification_logs.
   */
  private async logNotification(
    payload: NotificationPayload,
    status: 'PENDING' | 'SENT' | 'DELIVERED' | 'FAILED',
    messageId: string | null,
    response: any
  ): Promise<void> {
    try {
      const supabase = await createClient({ isAdmin: true });

      const logEntry: Omit<WhatsAppNotificationLog, 'id' | 'created_at'> = {
        recipient_phone: payload.recipientPhone,
        message_type: payload.messageType,
        target_id: payload.targetId || null,
        message_content: '', // Store actual message if needed
        delivery_status: status,
        fonnte_message_id: messageId,
        fonnte_response: response,
        delivered_at: status === 'DELIVERED' ? new Date().toISOString() : null,
      };

      const { error } = await supabase
        .from('whatsapp_notification_logs')
        .insert([logEntry]);

      if (error) {
        console.error('[WhatsAppService] Failed to log notification:', error);
      }
    } catch (error) {
      console.error('[WhatsAppService] Logging error:', error);
    }
  }

  /**
   * Helper: delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Export singleton instance
let instance: WhatsAppNotificationService | null = null;

export function getWhatsAppNotificationService(): WhatsAppNotificationService {
  const apiKey = process.env.FONNTE_API_KEY;

  if (!apiKey) {
    throw new Error('FONNTE_API_KEY environment variable is not set');
  }

  if (!instance) {
    instance = new WhatsAppNotificationService(apiKey);
  }

  return instance;
}

export default WhatsAppNotificationService;