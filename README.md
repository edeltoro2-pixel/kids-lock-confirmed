# Learning Break website

Public pages for the Learning Break app by PrintForge Studios, served by GitHub Pages.

- `index.html`: the page parents see after tapping the confirmation link in the sign-up
  email. It says the account is confirmed (or that an old link no longer works) and points
  them back to the app. Supabase adds sign-in tokens to the address when it sends people
  here; the page removes them straight away and needs no other data.
- `privacy/`: the privacy policy. The app links to it, and Google Play needs its address.
- `delete-account/`: lets a parent sign in and delete their account and all of its
  children's data, which Google Play requires on the web as well as in the app. It calls the
  same database function as the app (`delete_my_account`).
  - `config.js` holds the Supabase project address and its publishable key. Both are public
    by design; the app carries the same ones. Never put a secret or `service_role` key here.
  - The sign-in stays in the page's memory only; nothing is saved in the browser.

No tracking, cookies or analytics, and nothing loads from other companies:
- the Andika font is served from `assets/fonts/` (SIL Open Font License, `OFL.txt`);
- the Supabase browser library is `assets/vendor/supabase-js-2.118.0.js` (MIT,
  `supabase-js-LICENSE.txt`), the same version as the app.

© 2026 PrintForge Studios. All rights reserved.
