# Actionora production checklist

## Required secrets
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
- SUPABASE_SECRET_KEY
- AI_PROVIDER_URL
- AI_API_KEY
- NEXT_PUBLIC_SITE_URL

## Required external configuration
- Supabase Auth providers: Google and Apple
- Private Storage bucket and authenticated upload policies
- Production AI provider credentials
- Billing provider and webhook secret before enabling paid checkout
- Google OAuth credentials before Gmail/Calendar connections
- Staging and production deployment environments

## Verification gates
- npm run typecheck
- npm run lint
- npm run build
- RLS negative tests
- authentication callback tests
- trial abuse/rate-limit tests
- payment state transition tests
- AI output validation tests
- mobile smoke tests

Do not advertise compliance certifications unless they have actually been obtained.