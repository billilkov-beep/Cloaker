# Agent Instructions

This repository is for a privacy-first secure communications app. Follow these rules in every change.

- Do not add server-side plaintext message storage.
- Do not implement searchable user directory features.
- Do not create endpoints that reveal whether a private user exists unless an active discovery token authorizes it.
- Do not write custom cryptography. Use proven libraries only after license/security review.
- Do not expose Twilio credentials, Apple signing secrets, passkey secrets, JWT signing keys, or private device keys.
- Keep Twilio usage server-side only.
- Prefer small PRs and tests.
- Any security-sensitive change must include a test and a threat-model note.
