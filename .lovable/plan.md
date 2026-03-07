

## Fix: Accept Invite Flow — Auth Timing + Cache Invalidation

Single file: `src/pages/AcceptInvite.tsx`. Three changes.

### Change 1 — Auth timing (Bug 1)

Add `onAuthStateChange` listener inside the existing `useEffect` (Effect 1). After `getSession()` and invite fetch complete, register a listener that catches late-arriving sessions:

```ts
const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN' && session?.user && !userId) {
    setUserEmail(session.user.email ?? null);
    setUserId(session.user.id);
  }
});

return () => { subscription.unsubscribe(); };
```

The existing `getSession()` call stays. The listener is a complement for the redirect-from-login scenario where the session arrives after the initial tick.

### Change 2 — Cache invalidation (Bug 2)

Import `useQueryClient` from `@tanstack/react-query`. In `acceptInvite`, before the success navigate calls, add:

```ts
queryClient.invalidateQueries({ queryKey: ["studio-memberships"] });
```

This applies to both the success path and the `already_accepted` redirect path.

### Change 3 — Wrap `acceptInvite` in `useCallback`

Wrap the function with `useCallback` with deps `[token, invite, queryClient, navigate]`. Add `acceptInvite` to Effect 2's dependency array.

### Not touched
All error screens, login/signup redirects, handleLogout, processedRef, UI/layout.

