#!/bin/bash

# Setup script untuk Fontte WhatsApp Integration
# Jalankan: bash scripts/setup-fontte.sh

set -e

echo "🚀 Setup Fontte WhatsApp Integration untuk PPPM-BM"
echo "======================================================"
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ File .env.local tidak ditemukan!"
    echo "📝 Buat file .env.local terlebih dahulu dengan:"
    echo "   cp .env.example .env.local"
    exit 1
fi

# Check if FONNTE_API_KEY is set
if ! grep -q "FONNTE_API_KEY" .env.local; then
    echo "⚠️  FONNTE_API_KEY tidak ada di .env.local"
    echo "   Tambahkan: FONNTE_API_KEY=your_api_key"
    exit 1
fi

echo "✅ Konfigurasi ditemukan"
echo ""

# Check Node.js version
NODE_VERSION=$(node -v | cut -d 'v' -f 2 | cut -d '.' -f 1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js 18+ diperlukan (Anda punya v$NODE_VERSION)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"
echo ""

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

echo "✅ Dependencies ready"
echo ""

# Check Supabase connection
echo "🔍 Checking Supabase connection..."
if ! grep -q "NEXT_PUBLIC_SUPABASE_URL" .env.local; then
    echo "⚠️  Supabase not configured"
else
    echo "✅ Supabase configured"
fi

echo ""
echo "✅ Setup selesai!"
echo ""
echo "🎯 Langkah berikutnya:"
echo "   1. Jalankan database migration (lihat KONFIGURASI_FONNTE.md)"
echo "   2. Jalankan: npm run dev"
echo "   3. Test API endpoints"
echo ""
echo "📚 Dokumentasi lengkap di: KONFIGURASI_FONTTE.md"
