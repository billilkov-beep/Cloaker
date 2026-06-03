# API Contracts Draft

Base URL: `https://api.example.com`

All endpoints require HTTPS. Authenticated endpoints require a short-lived access token. WebSocket events use WSS only.

## Important API rule

For app-to-app messaging, the client must never send a plaintext `body` field to the backend. The backend only accepts encrypted envelopes.

## Auth/device setup

### POST /auth/passkey/register/options

Starts passkey registration.

### POST /auth/passkey/register/verify

Verifies passkey registration and creates account/device session.

### POST /auth/passkey/login/options

Starts passkey login.

### POST /auth/passkey/login/verify

Verifies passkey login and returns app access token.

### POST /devices/register-crypto-bundle

Registers device public keys/prekeys.

Request:

```json
{
  "deviceId": "dev_123",
  "identityPublicKey": "base64",
  "signedPrekeyPublic": "base64",
  "signedPrekeySignature": "base64",
  "oneTimePrekeys": [
    { "prekeyId": "1", "publicKey": "base64" }
  ]
}
```

## Timed private discovery

### POST /discovery/windows

Creates a 5-minute discovery window for the authenticated user.

Request:

```json
{ "ttlSeconds": 300, "mode": "quick" }
```

Response:

```json
{
  "discoveryWindowId": "dw_123",
  "expiresAt": "2026-06-02T18:05:00Z",
  "shortCode": "8KQ7-MP42-LZ9A",
  "qrPayload": "app://discover/..."
}
```

Server storage: store only token hash, not raw token.

### DELETE /discovery/windows/:id

Cancels user's active discovery window.

### POST /discovery/resolve

Resolves an exact discovery token.

Request:

```json
{ "token": "8KQ7-MP42-LZ9A" }
```

Success response:

```json
{
  "status": "requestable",
  "discoveryWindowId": "dw_123",
  "displayNamePreview": "John",
  "safetyCodePreview": "optional-short-fingerprint"
}
```

Generic failure response for all failure modes:

```json
{ "status": "not_found" }
```

Do not distinguish expired, cancelled, not found, inactive, or rate limited in normal client response.

## Contact requests

### POST /contact-requests

Creates request after valid discovery resolve.

Request:

```json
{ "discoveryWindowId": "dw_123" }
```

### POST /contact-requests/:id/accept

Target user accepts. Creates contact pair and discussion.

### POST /contact-requests/:id/reject

Target user rejects. No discussion created.

## Discussions and secure sessions

### POST /discussions/:discussionId/secure-sessions

Starts live secure session if both participants are allowed.

Response:

```json
{
  "secureSessionId": "sess_123",
  "status": "ACTIVE",
  "heartbeatIntervalSeconds": 5,
  "heartbeatTimeoutSeconds": 20
}
```

### POST /secure-sessions/:id/heartbeat

Updates participant presence.

### POST /secure-sessions/:id/end

Ends session and triggers purge.

Request:

```json
{ "reason": "user_disconnected" }
```

## Encrypted messages

### POST /discussions/:discussionId/messages

Sends encrypted envelope only.

Request:

```json
{
  "secureSessionId": "sess_123",
  "clientMessageId": "client_msg_123",
  "recipientUserId": "usr_paul",
  "recipientDeviceIds": ["dev_paul_1"],
  "encryptedEnvelope": {
    "protocol": "signal-or-selected-protocol",
    "version": 1,
    "ratchetHeader": "base64-or-object",
    "ciphertext": "base64",
    "aad": {
      "discussionId": "disc_123",
      "secureSessionId": "sess_123",
      "senderUserId": "usr_john",
      "recipientUserId": "usr_paul",
      "clientMessageId": "client_msg_123"
    }
  },
  "expiresAt": "2026-06-02T18:10:00Z"
}
```

Forbidden request field:

```json
{ "body": "plaintext" }
```

### POST /messages/:id/delivered

Marks delivered. Server may delete ciphertext immediately or after short grace window.

### POST /messages/:id/read

Marks read. Server should delete ciphertext if read-delete policy enabled.

## Secure control events

### POST /secure-sessions/:id/control-events

For screenshot, screen recording, key change, purge, device revoke.

Request:

```json
{
  "eventType": "SCREENSHOT_TAKEN",
  "clientEventId": "evt_123",
  "metadata": {
    "platform": "ios",
    "detectedAt": "2026-06-02T18:03:00Z"
  },
  "signature": "base64"
}
```

No message content is allowed.

## WebSocket events

Client connects to `wss://ws.example.com/realtime`.

Events:

```text
contact_request_pending
discovery_window_expired
secure_session_started
encrypted_message_available
secure_control_event
purge_session
secure_session_ended
key_changed_warning
device_revoked
```

## Optional Twilio endpoints

Keep Twilio disabled for MVP app-to-app messaging. If used later:

- `/twilio/voice/token` vends Twilio Voice Access Token.
- `/webhooks/twilio/voice` handles Twilio callbacks.
- `/webhooks/twilio/sms` handles SMS fallback callbacks.

Twilio credentials must stay server-side.
