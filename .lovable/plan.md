

## Audit and Fix: Authentication Flow

Three files to modify: `AuthCallback.tsx`, `Login.tsx`, `Onboarding.tsx`. No other files need changes.

### Audit findings

**AuthContext.tsx** — Correct. Uses `onAuthStateChange` with `setTimeout` for DB queries. No changes needed.

**ProtectedRoute.tsx** — Correct. Uses `useAuth()` properly. No changes needed.

**Signup.tsx** — Has the same redundant DB query pattern as Login.tsx (line 45-49), but since the user said not to change it, leaving it. The `user` object from `useAuth()` is already the profile, so the query is redundant but not broken since `user` being non-null already means `hasProfile` is true.

**App.tsx routes** — Correct. `/onboarding` is not behind `ProtectedRoute` (intentional — user has session but no profile yet). `/auth/callback` is public. No issues.

No additional bugs found beyond the three described.

---

### Change 1 — `src/pages/AuthCallback.tsx` (Bug 1 — CRITICAL)

**Problem:** `getSession()` called immediately on mount. When arriving from email confirmation or OAuth redirect, the code exchange hasn't completed yet, so `getSession()` returns null and the user is redirected to `/login`.

**Fix:** Replace the entire `useEffect` logic. Use `onAuthStateChange` to wait for `SIGNED_IN` event. DB query for profile check goes inside `setTimeout` to avoid Supabase lock deadlock. Cleanup subscription on unmount. Handle `SIGNED_OUT` by redirecting to `/login`.

```ts
useEffect(() => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    if (event === "SIGNED_IN" && session) {
      setTimeout(async () => {
        const pendingSlug = localStorage.getItem("pending_slug");
        const pendingRedirect = localStorage.getItem("pending_redirect");
        localStorage.removeItem("pending_slug");
        localStorage.removeItem("pending_redirect");

        const { data: profile } = await supabase
          .from("users").select("id").eq("id", session.user.id).maybeSingle();

        if (profile) {
          navigate(pendingRedirect || "/dashboard", { replace: true });
        } else {
          const params = new URLSearchParams();
          if (pendingSlug) params.set("slug", pendingSlug);
          if (pendingRedirect) params.set("redirect", pendingRedirect);
          const qs = params.toString();
          navigate(qs ? `/onboarding?${qs}` : "/onboarding", { replace: true });
        }
      }, 0);
    } else if (event === "SIGNED_OUT") {
      navigate("/login", { replace: true });
    }
  });

  return () => subscription.unsubscribe();
}, [navigate]);
```

### Change 2 — `src/pages/Login.tsx` (Bug 2)

**Problem:** Redundant DB query after login, and `useEffect` depends on `user` (profile) instead of `session`, causing spinner to hang when session exists but profile hasn't loaded yet.

**Fix:**
- Import `session` and `hasProfile` from `useAuth()` instead of relying on `user`
- In the redirect `useEffect`: check `session` instead of `user`. If `session` exists and `hasProfile` is true → dashboard. If `session` exists and `hasProfile` is false and `!isLoading` → onboarding. Remove the DB query.
- In `handleEmailLogin`: after successful `signInWithPassword`, simply navigate to `redirect || "/dashboard"`. The `ProtectedRoute` handles the rest. Remove the DB query.

### Change 3 — `src/pages/Onboarding.tsx` (Bug 3)

**Problem:** Has its own `getSession()` + `onAuthStateChange` that conflict with `AuthContext`. The `getSession()` can return null before session is ready, redirecting to `/login`. The internal listener redirects on any `session === null` event.

**Fix:**
- Remove `isAuthChecking`, `userEmail`, `userId` states
- Remove the auth-checking `useEffect` entirely (lines 42-68)
- Use `const { session, isLoading: authLoading } = useAuth()`
- Add simple guard `useEffect`: if `!authLoading && !session` → navigate to `/login`
- Loading guard: show spinner while `authLoading || !session`
- In `handleSubmit`: use `session.user.id` and `session.user.email` instead of removed states
- All form logic, validation, username availability stays identical

### Files NOT changed
- `AuthContext.tsx`, `ProtectedRoute.tsx`, `Signup.tsx`, `App.tsx`
- No DB/RLS changes
- No visual changes

