

## Fix: Onboarding not redirecting to dashboard after profile creation

### Root cause
Race condition: after inserting into `users`, `navigate('/dashboard')` runs but `ProtectedRoute` checks `hasProfile` which is still `false` (no auth event triggers a re-fetch), so the user gets bounced back to `/onboarding`.

### Change 1 — `src/contexts/AuthContext.tsx`

Add `refreshProfile` async function to the provider:
- Calls `supabase.auth.getSession()` directly (not the state variable) to get the current user ID
- Queries `users` table for `nome_completo, avatar_url` with `.maybeSingle()`
- Updates `user` and `hasProfile` state accordingly
- Expose in `AuthContextType` interface and context default value and provider value

### Change 2 — `src/pages/Onboarding.tsx`

In `handleSubmit`, after the successful insert (after line 171, before line 173):
- Import `useAuth` and destructure `refreshProfile`
- Call `await refreshProfile()` before `navigate()`
- Move `setIsLoading(false)` after the navigate (or leave it — component unmounts anyway)

No other files touched.

