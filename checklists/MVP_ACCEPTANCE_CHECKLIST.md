# MVP Acceptance Checklist

## Identity/discovery

- [ ] No search by display name.
- [ ] No search by phone/email.
- [ ] Discovery off by default.
- [ ] Discovery manually enabled.
- [ ] Discovery expires after 5 minutes or less.
- [ ] Exact token/QR only.
- [ ] Token stored hashed server-side.
- [ ] Wrong/expired token gives generic error.
- [ ] User approval required.

## Messaging privacy

- [ ] Server receives encrypted envelopes only.
- [ ] Database contains no plaintext message body.
- [ ] Logs contain no plaintext message body.
- [ ] Push notifications contain no message body.
- [ ] Private keys stay on device.

## Live sessions/deletion

- [ ] Both users connected for active session.
- [ ] Heartbeat/presence implemented.
- [ ] Either user disconnects → session ends.
- [ ] Server ciphertext deleted/nulled after session end.
- [ ] Apps purge local decrypted messages.
- [ ] Session keys destroyed.

## Screenshot/capture

- [ ] Screenshot event notifies both users where supported.
- [ ] Screenshot image is not uploaded.
- [ ] Screen capture detection documented.
- [ ] Strict mode can purge session.

## Infrastructure

- [ ] Backend origin not directly exposed in staging plan.
- [ ] Database/Redis not public.
- [ ] Admin behind Zero Trust/VPN/MFA.
- [ ] No production secrets committed.
- [ ] Twilio credentials server-side only.
