#!/bin/bash

# Script to add Supabase environment variables to .env.local
# Usage: ./scripts/add-supabase-env.sh

ENV_FILE=".env.local"

# Project reference from the dashboard URL
PROJECT_REF="xwfyycspigomivevvnqw"

# Construct the API URL (not dashboard URL)
SUPABASE_URL="https://${PROJECT_REF}.supabase.co"

# Anon key provided by user
ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3Znl5Y3NwaWdvbWl2ZXZ2bnF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzODM3OTMsImV4cCI6MjA3Nzk1OTc5M30.7oHPEypbJtt7UKY1T0V7uvfrmT1_4J2-rQmbfhm--xA"

# Service role key (NOTE: This looks short - might need to verify)
SERVICE_ROLE_KEY="Ssuuppaabbaassee036973"

echo "🔧 Adding Supabase environment variables to .env.local..."
echo ""

# Check if .env.local exists
if [ ! -f "$ENV_FILE" ]; then
    echo "❌ .env.local not found. Creating it..."
    touch "$ENV_FILE"
fi

# Remove existing Supabase variables if they exist
sed -i.bak '/^NEXT_PUBLIC_SUPABASE_URL=/d' "$ENV_FILE"
sed -i.bak '/^NEXT_PUBLIC_SUPABASE_ANON_KEY=/d' "$ENV_FILE"
sed -i.bak '/^SUPABASE_SERVICE_ROLE_KEY=/d' "$ENV_FILE"
rm -f "${ENV_FILE}.bak"

# Add Supabase variables
echo "" >> "$ENV_FILE"
echo "# --- Supabase Storage (for recordings) ---" >> "$ENV_FILE"
echo "# Get these from Supabase Dashboard > Settings > API" >> "$ENV_FILE"
echo "NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL" >> "$ENV_FILE"
echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=$ANON_KEY" >> "$ENV_FILE"
echo "SUPABASE_SERVICE_ROLE_KEY=$SERVICE_ROLE_KEY" >> "$ENV_FILE"
echo "# Note: Service role key is needed for server-side uploads/deletes" >> "$ENV_FILE"

echo "✅ Added Supabase environment variables to .env.local"
echo ""
echo "📋 Added values:"
echo "   NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL"
echo "   NEXT_PUBLIC_SUPABASE_ANON_KEY=${ANON_KEY:0:50}..."
echo "   SUPABASE_SERVICE_ROLE_KEY=$SERVICE_ROLE_KEY"
echo ""
echo "⚠️  WARNING: The service role key looks short. Supabase service role keys are typically"
echo "   long JWT tokens (like the anon key). If uploads fail, verify the service role key"
echo "   in Supabase Dashboard > Settings > API > service_role key"
echo ""
echo "✅ Next steps:"
echo "   1. Verify the service role key is correct"
echo "   2. Restart your development server: npm run dev"
echo "   3. Test recording upload"

