---
name: Never Sign Out the User
description: Never implement auto-logout, idle timeout, session expiry, or forced sign-out flows; sessions must persist indefinitely
type: preference
---
The user must NEVER be signed out automatically. Hard rules:

- Do NOT add idle/inactivity timeouts that call `supabase.auth.signOut()`
- Do NOT add session expiry checks that force logout
- Do NOT call `supabase.auth.signOut()` anywhere except from an explicit user-clicked "Sign out" button
- Do NOT clear auth tokens from localStorage programmatically
- Keep `persistSession: true` and `autoRefreshToken: true` in the Supabase client (already set in `src/integrations/supabase/client.ts` — never change)
- Auth errors (e.g. failed refresh) should be retried/logged, never resolved by signing the user out
- Route guards may redirect unauthenticated users to `/auth`, but must never trigger a sign-out

**Why:** The user explicitly stated "never sign me out!" — being signed out mid-task (especially during long Ask readings) is a critical UX failure.
