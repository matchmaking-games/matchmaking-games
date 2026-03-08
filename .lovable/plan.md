

## Plan: Extract Footer Component and Apply to All Public Pages

### Change 1 — Create `src/components/layout/Footer.tsx`

Extract the footer from `Index.tsx` (lines 722-760) into a standalone component. It includes the logo, social icons (using `SocialIcon`), tagline, and legal links. No props needed. The `socials` array moves into this file.

### Change 2 — `src/pages/Index.tsx`

- Import `Footer` from `@/components/layout/Footer`
- Replace lines 721-760 (the inline footer block) with `<Footer />`
- Remove `SocialIcon` import and `socials` array if no longer used elsewhere in the file
- Keep `matchmakingLogo` import only if used elsewhere in the file

### Change 3 — `src/pages/Terms.tsx`

- Import `Footer`, replace inline footer block (lines 261-298) with `<Footer />`
- Remove unused imports (`SocialIcon`, `matchmakingLogo`, `socials` array) if they become orphaned

### Change 4 — Add `<Footer />` import + element to these pages (no other changes):

- `src/pages/Login.tsx` — before closing `</>`
- `src/pages/Signup.tsx` — before closing `</>`
- `src/pages/Jobs.tsx` — before closing `</div>`
- `src/pages/ProjectDetail.tsx` — at end
- `src/pages/JobDetail.tsx` — at end
- `src/pages/PublicProfile.tsx` — at end
- `src/pages/StudioPublicProfile.tsx` — at end
- `src/pages/Support.tsx` — at end

### Change 5 — Add both `<Header />` and `<Footer />` to:

- `src/pages/NotFound.tsx` — add Header + pt-16 + Footer
- `src/pages/ResetPassword.tsx` — add Header + pt-16 + Footer
- `src/pages/AcceptInvite.tsx` — add Header + pt-16 + Footer

Total: 1 new file, ~14 files edited. No logic changes anywhere.

