/**
 * Database migration untuk WhatsApp Notification Logs
 * 
 * Jalankan query ini di Supabase SQL Editor untuk membuat tabel
 * Atau bisa di-import langsung jika sudah ada migration system
 */

export const whatsappNotificationLogsSQL = `
-- Buat enum type untuk message_type
CREATE TYPE whatsapp_message_type AS ENUM ('TAGIHAN', 'PAYMENT_SUCCESS', 'PAYMENT_FAILED');

-- Buat enum type untuk delivery_status
CREATE TYPE whatsapp_delivery_status AS ENUM ('PENDING', 'SENT', 'DELIVERED', 'FAILED');

-- Buat tabel whatsapp_notification_logs
CREATE TABLE IF NOT EXISTS whatsapp_notification_logs (
  id SERIAL PRIMARY KEY,
  recipient_phone VARCHAR NOT NULL,
  message_type whatsapp_message_type NOT NULL,
  target_id INTEGER,
  message_content TEXT,
  delivery_status whatsapp_delivery_status DEFAULT 'PENDING',
  fonnte_message_id VARCHAR,
  fonnte_response JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  delivered_at TIMESTAMP WITH TIME ZONE,
  
  -- Indexes untuk query optimization
  CONSTRAINT whatsapp_logs_tagihan_fk 
    FOREIGN KEY (target_id) 
    REFERENCES tagihan_siswa(idtagihansiswa) 
    ON DELETE SET NULL
);

-- Buat indexes
CREATE INDEX idx_whatsapp_logs_recipient ON whatsapp_notification_logs(recipient_phone);
CREATE INDEX idx_whatsapp_logs_message_type ON whatsapp_notification_logs(message_type);
CREATE INDEX idx_whatsapp_logs_status ON whatsapp_notification_logs(delivery_status);
CREATE INDEX idx_whatsapp_logs_created ON whatsapp_notification_logs(created_at DESC);
CREATE INDEX idx_whatsapp_logs_fonnte_id ON whatsapp_notification_logs(fonnte_message_id);

-- Tambahkan kolom ke tabel tagihan_siswa untuk tracking
ALTER TABLE tagihan_siswa 
ADD COLUMN IF NOT EXISTS whatsapp_notified_at TIMESTAMP WITH TIME ZONE;

-- Tambahkan kolom ke tabel pembayaran untuk tracking
ALTER TABLE pembayaran 
ADD COLUMN IF NOT EXISTS whatsapp_status_notified_at TIMESTAMP WITH TIME ZONE;

-- Enable RLS jika diperlukan
ALTER TABLE whatsapp_notification_logs ENABLE ROW LEVEL SECURITY;

-- Policy untuk allow insert (server-side only)
CREATE POLICY "Allow insert from server" ON whatsapp_notification_logs
  FOR INSERT TO service_role
  WITH CHECK (true);

-- Policy untuk allow read (server-side only)
CREATE POLICY "Allow read from server" ON whatsapp_notification_logs
  FOR SELECT TO service_role
  USING (true);
`;

/**
 * Instruction untuk menjalankan migration:
 * 
 * 1. Buka dashboard Supabase
 * 2. Pergi ke SQL Editor
 * 3. Buat query baru
 * 4. Copy paste kode SQL di atas
 * 5. Klik "Run"
 * 
 * Atau jika menggunakan Supabase migration:
 * 1. Buat file migration: supabase/migrations/[timestamp]_add_whatsapp_notifications.sql
 * 2. Copy SQL code ke file tersebut
 * 3. Run: npx supabase migration up
 */
