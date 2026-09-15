# Security review notes

A static-analysis security pass was done on this codebase. Summary:

## Fixed
- **CSV export / formula injection**: values starting with `=`, `+`, `-`, `@`, tab, or CR are
  now prefixed with a single quote before export, preventing formula injection if a CSV is
  opened in Excel/Sheets (a real, common vulnerability class for admin data-export features).
- **Photo upload limits**: uploads are now restricted to image MIME types and capped at 5MB
  each, preventing oversized payloads from degrading the app or being used to smuggle
  non-image files through an "image" upload field.
- **No plaintext password storage**: in demo/local-fallback mode, passwords are captured by
  the form but never stored or checked — only used when real Supabase auth is connected,
  where Supabase itself handles hashing. No password ever touches your own storage.
- **No browser storage of secrets**: the app doesn't use localStorage/sessionStorage itself
  (Supabase's own SDK manages its session token storage, which is standard practice).

## Verified safe
- **XSS**: all user-generated content (task titles, descriptions, locations, usernames) is
  rendered through React's default text interpretation, which auto-escapes HTML — there is no
  `dangerouslySetInnerHTML` usage on any user-supplied data. The only `dangerouslySetInnerHTML`
  calls are for the hand-authored, static icon SVGs (no user input reaches them).
- **Supabase anon key**: the key that goes in `config.js` is meant to be public — Supabase's
  security model relies on Row Level Security (RLS) policies, not on hiding this key. The
  provided `supabase-schema.sql` sets up baseline RLS so users can only edit their own profile.

## Recommendations for a production launch (not implemented here, since they require
## infrastructure decisions only you can make)
- **Tighten the `profiles` SELECT policy**: it currently lets any authenticated user read
  every profile's phone/email. Consider a Postgres view that only exposes name + rating
  publicly, keeping phone/email restricted to the two parties on an active task.
- **Server-side admin enforcement**: admin status is currently derived client-side from the
  email address. For real money movement, enforce this again server-side (e.g. a Supabase
  Edge Function or RLS policy keyed on a `role` column) before trusting any admin action.
- **Real payment processing**: payment method selection is UI-only; integrating an actual
  Saudi PSP (Moyasar, HyperPay, PayTabs, or a bank) requires server-side webhook handling
  that isn't present in a static site and needs to be added when you're ready to take real
  payments.
- **Rate limiting / abuse prevention**: task posting and bidding have no rate limits; add
  these at the Supabase Edge Function or API gateway layer before public launch.

This review was done by reading the code, not by running an automated scanner or penetration
test — for a production launch handling real payments, a professional security audit is
strongly recommended.
