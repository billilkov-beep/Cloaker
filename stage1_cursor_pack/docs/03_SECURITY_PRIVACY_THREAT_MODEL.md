# Security and Privacy Threat Model

## Primary privacy promises

1. The server cannot read app-to-app message content.
2. Users are not publicly searchable.
3. Discovery requires intentional opt-in and expires after 5 minutes.
4. Messages are temporary and purge on disconnect.
5. Screenshot/screen-capture events are visible to both participants where OS support allows.
6. Origin server IP is not directly reachable by the public internet.

## Assets to protect

- Message plaintext
- Attachment plaintext
- Device private keys
- Session/message keys
- User social graph
- Discovery tokens
- Push notification content
- Server origin IP
- Twilio credentials
- Passkey/account recovery credentials

## Adversaries

- Random internet scanner
- Abusive user trying to enumerate accounts
- Abusive user trying to screenshot/save messages
- Attacker with stolen account session token
- Attacker with database read access
- Attacker with backend log access
- Compromised or rooted/jailbroken device
- Insider with infrastructure access
- Network attacker
- Bot attempting token guessing

## Threats and controls

| Threat | Control |
|---|---|
| User enumeration by name | No public search, exact token only, generic errors |
| Discovery token guessing | High entropy tokens, hashing, rate limits, 5-minute TTL, one-time use |
| Server reads messages | E2EE; backend receives ciphertext only; no decrypt functions server-side |
| DB leak reveals messages | Store ciphertext only; no keys in DB that allow server decryption |
| Logs leak private content | Logging denylist; tests; redaction; no message content in crash/analytics |
| Push notifications leak messages | Generic push only, local decrypt if notification shown |
| Screenshot without warning | iOS/Android capture hooks where available; notify both users |
| Screenshot prevention bypass | State limitation clearly; strict mode purges on detection; device integrity checks |
| Late message after disconnect | Server session state machine rejects new messages; purge commands |
| Origin IP attack | Cloudflare Tunnel/private origin; block direct public inbound access |
| Twilio credential exposure | Use twilio-node only backend; env vars/secrets manager |
| New device impersonation | safety codes/QR verification; key-change warnings; device list/revocation |
| Malicious client sends to non-participant | Server validates discussion/contact/session authorization every request |
| Contact scraping | No contact book upload by default; no phone/email lookup |

## Security invariants

The following must be enforced by tests:

- `EncryptedMessage` server-side model has no plaintext fields.
- Message send endpoint rejects if recipient is not an active participant.
- Discovery resolve endpoint returns generic error for not found/expired/cancelled/wrong token.
- Discovery windows expire after 5 minutes or earlier if cancelled/backgrounded/disconnected.
- Secure session rejects new messages after ending/ended/purged.
- Purge event is sent to both participants on disconnect.
- Screenshot/screen capture event sends control event only, no message content.

## Crypto approach

Do not implement custom cryptography. The build should begin with interfaces and test stubs, then integrate a proven protocol/library after license and security review.

Candidate protocols/libraries are described in `docs/07_GITHUB_REUSE_RESEARCH.md`.

## Screenshot limitations

- iOS screenshot notification fires after the screenshot is taken.
- Android screenshot detection is Android 14+ and limited to specific screenshot methods.
- Android FLAG_SECURE can help block screenshots but may prevent screenshot callbacks from firing.
- No app can prevent a second device from photographing the screen.
- Rooted/jailbroken/compromised devices can bypass app-level protections.

## Key-change policy

If a user's identity key changes:

- Freeze affected discussions.
- Notify contact(s).
- Require re-verification before new secure sessions.
- Do not deliver old messages to new device automatically.
- Delete active live-session content.

## Purge policy

When purge is triggered:

- Server marks secure session ending.
- Server deletes pending ciphertext/encrypted attachments.
- Server sends `purge_session` to both devices.
- Devices wipe decrypted message memory, local encrypted cache, attachment cache, and session keys.
- Devices return signed purge receipt.
- Server keeps only non-content audit metadata.
