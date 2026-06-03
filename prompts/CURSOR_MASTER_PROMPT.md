# Cursor Master Prompt

Paste into Cursor Agent after importing Stage 1.

```text
You are building a privacy-first encrypted mobile communication app.

Before editing files, read the entire repo, especially README/START files, docs/*, AGENTS.md, and .cursor/rules/*.

Non-negotiable rules:
1. Server must never read app-to-app message plaintext.
2. App-to-app messages must be end-to-end encrypted.
3. No SMS for normal app-to-app messaging.
4. Discovery is off by default.
5. Discovery is intentionally enabled by the user for max 5 minutes.
6. Discovery requires exact private token or QR code.
7. No public user search, no name search, no phone lookup, no email lookup, no partial matches.
8. Valid discovery token only creates a request; discovered user must approve.
9. Messages are live-session based.
10. If either user disconnects, both sides purge session and server deletes pending ciphertext.
11. Screenshot/screen-recording events notify both users where OS APIs allow.
12. No plaintext message body in DB, logs, analytics, crash reports, push payloads, or fixtures.
13. Private keys stay on device.
14. Do not invent a custom crypto protocol.
15. Inspect GitHub repositories/libraries before building custom versions.
16. Protect backend origin behind Cloudflare Tunnel/private origin instead of rotating DNS.

First task:
Read and summarize the repo. Do not modify files yet. Return product summary, architecture summary, security rules, GitHub reuse-first plan, missing decisions, and suggested first branch. Then wait for approval.
```
