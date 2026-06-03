# 03 — Non-Negotiable Security and Privacy Rules

## Server cannot read app-to-app messages

Allowed server fields:

```text
message_id
discussion_id
sender_user_id
recipient_user_id
ciphertext
ratchet/header metadata
created_at
expires_at
status
```

Forbidden fields:

```text
body
plaintext
message_text
decrypted_body
preview_text
notification_body
```

## No app-to-app SMS

Twilio may be used for verification, fallback to non-app users, or optional voice. It is not used for normal app-user-to-app-user encrypted messaging.

## Private discovery only

- Discovery off by default.
- User manually turns on discovery.
- Discovery expires after 5 minutes or less.
- Exact token/QR only.
- No global user listing.
- No search by name, phone, or email.
- Generic error responses only.

## Approval required

A valid token only permits a request. The discovered user must approve.

## Delete on disconnect

If either user disconnects:

- end session
- stop accepting messages
- purge server ciphertext
- send purge to both devices
- delete local decrypted messages
- destroy local session/message keys

## Screenshot/capture

Where supported:

- screenshot → notify both users
- screen recording/mirroring → notify both users
- strict mode → purge session

Do not promise perfect prevention. Someone can photograph a screen with another device.

## No plaintext logs

Never log message body, raw discovery token, private keys, session keys, Twilio Auth Token, Apple signing secrets, or real user messages.

## Push notifications

Allowed: `New message`.

Forbidden: `John: meet me at 5`.

## Crypto

Do not create a custom cryptographic protocol. Use vetted libraries/protocols when possible and require review.

## Keys

Private keys stay on device. Use iOS Keychain/Secure Enclave where appropriate and Android Keystore.

## Infrastructure

Origin server should not be public. Prefer Cloudflare Tunnel/private origin, WAF/rate limits, admin behind Zero Trust/VPN, no public DB/Redis/SSH.
