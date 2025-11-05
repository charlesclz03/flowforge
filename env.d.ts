declare namespace NodeJS {
  interface ProcessEnv {
    // Database
    DATABASE_URL: string
    DIRECT_URL?: string

    // Supabase
    NEXT_PUBLIC_SUPABASE_URL?: string
    NEXT_PUBLIC_SUPABASE_ANON_KEY?: string
    SUPABASE_SERVICE_ROLE_KEY?: string

    // Google OAuth
    GOOGLE_CLIENT_ID?: string
    GOOGLE_CLIENT_SECRET?: string

    // NextAuth
    NEXTAUTH_URL?: string
    NEXTAUTH_SECRET?: string

    // Google Cloud Storage
    GCS_BUCKET_NAME?: string
    GCS_PROJECT_ID?: string
    GOOGLE_APPLICATION_CREDENTIALS?: string

    // Stripe
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?: string
    STRIPE_SECRET_KEY?: string
    STRIPE_WEBHOOK_SECRET?: string

    // Google AdSense
    NEXT_PUBLIC_ADSENSE_CLIENT_ID?: string

    // App Configuration
    NEXT_PUBLIC_APP_URL: string
    NEXT_PUBLIC_FREE_RECORDING_LIMIT_SECONDS: string
  }
}

