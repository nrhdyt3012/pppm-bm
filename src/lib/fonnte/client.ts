/**
 * Fonnte API Client
 * Handles communication with Fonnte WhatsApp API
 */

import {
  FontneConfig,
  FontneSendMessageRequest,
  FontneSendMessageResponse,
  FontneCheckStatusRequest,
  FontneCheckStatusResponse,
} from '@/types/fonnte';

class FontteClient {
  private apiKey: string;
  private baseUrl: string = 'https://api.fonnte.com';

  constructor(config: FontteConfig) {
    this.apiKey = config.apiKey;
    if (config.baseUrl) {
      this.baseUrl = config.baseUrl;
    }
  }

  /**
   * Send WhatsApp message via Fonnte API
   */
  async sendMessage(
    payload: FontneSendMessageRequest
  ): Promise<FontneSendMessageResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          target: payload.target,
          message: payload.message,
          countryCode: payload.countryCode || '62',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Fonnte API Error: ${response.status} - ${JSON.stringify(errorData)}`
        );
      }

      const data: FontneSendMessageResponse = await response.json();
      return data;
    } catch (error) {
      console.error('[FontteClient] Send message error:', error);
      throw error;
    }
  }

  /**
   * Check message delivery status
   */
  async checkStatus(
    payload: FontneCheckStatusRequest
  ): Promise<FontneCheckStatusResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/message/check`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: payload.id }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Fonnte API Error: ${response.status} - ${JSON.stringify(errorData)}`
        );
      }

      const data: FontneCheckStatusResponse = await response.json();
      return data;
    } catch (error) {
      console.error('[FontteClient] Check status error:', error);
      throw error;
    }
  }

  /**
   * Format phone number to international format (628xxxxxxxxx)
   */
  static formatPhoneNumber(phone: string): string {
    // Remove spaces and special characters
    const cleaned = phone.replace(/\D/g, '');

    // If starts with 62, keep it
    if (cleaned.startsWith('62')) {
      return cleaned;
    }

    // If starts with 0, replace with 62
    if (cleaned.startsWith('0')) {
      return '62' + cleaned.slice(1);
    }

    // Otherwise prepend 62
    return '62' + cleaned;
  }

  /**
   * Validate phone number format
   */
  static isValidPhoneNumber(phone: string): boolean {
    const formatted = this.formatPhoneNumber(phone);
    // Indonesian phone should be 628xxxxxxxxx (62 + 8-12 digits)
    return /^62[0-9]{8,12}$/.test(formatted);
  }
}

export default FontteClient;
