# Product Requirements Document

## Working product name

PrivateComms MVP

## Primary goal

Create a private mobile communications app for a small private beta under 100 testers. The app enables intentionally discovered, approved users to communicate inside live, end-to-end encrypted sessions. The server routes encrypted data only and cannot read messages.

## Target users for MVP

- Internal owner/founder
- Developer/test team
- Under 100 trusted beta users via TestFlight and Android internal/closed testing

## Core MVP features

### 1. Account/device setup

- User can create an account with a private display name.
- User identity is not globally searchable.
- Device creates and stores local encryption private keys.
- Server receives public identity/prekey material only.
- User can see linked devices.
- User can revoke a device.

### 2. Timed private discovery

- Discovery is off by default.
- User manually enables discovery for 5 minutes.
- App displays temporary QR code and short code.
- Another user can scan/enter the exact token.
- Server returns no public search results.
- Wrong/expired/inactive tokens receive generic responses.
- Discovered user must approve connection before any discussion is created.
- Discovery token expires early if used, cancelled, backgrounded, logged out, or heartbeat expires.

### 3. Contact request and approval

- Discoverer sends connection request.
- Discovered user accepts/rejects.
- Only accepted connections can start secure sessions.
- Pairwise internal contact IDs are created after acceptance.
- Display name can be shown after approval.

### 4. End-to-end encrypted messaging

- App-to-app messages are not SMS.
- Sender app encrypts locally.
- Server stores/routes ciphertext only.
- Recipient app decrypts locally.
- Server cannot decrypt messages.
- Message keys rotate per message/session depending on chosen crypto protocol.
- Server must not have a plaintext message field.

### 5. Live secure sessions

- A secure session requires both users online.
- Messages only exist while the session is active.
- Heartbeats maintain presence.
- If either user disconnects, app backgrounds, logs out, or heartbeat expires, the session ends.
- Server deletes pending ciphertext and sends purge commands to both devices.
- Devices delete local message cache and session keys.

### 6. Screenshot/screen recording controls

- If screenshot is detected, both users are notified.
- If screen recording/capture is detected where supported, both users are notified.
- Strict mode can end and purge the session on screenshot/capture.
- App must clearly state limitations: detection is OS-dependent and cannot prevent external-camera photos.

### 7. Twilio optional/fallback

- Twilio may be used for phone verification, app-to-phone voice, or SMS fallback to non-app users later.
- Twilio is not used for app-to-app encrypted messages.
- Twilio credentials are server-side only.
- Do not implement SMS fallback until core E2EE app messaging is stable.

### 8. Server IP protection

- Mobile app calls only domain names such as `api.example.com` and `wss.example.com`.
- Backend origin must not expose public inbound ports.
- Use Cloudflare Tunnel or equivalent private origin.
- Database is private network only.
- Admin access requires Zero Trust/VPN/MFA.

## Explicit non-goals for MVP

- No public user directory.
- No search by name, phone number, or email.
- No “people nearby.”
- No contact-book upload.
- No group chat.
- No cloud message backup.
- No unreviewed production crypto.
- No real sensitive user conversations during early TestFlight beta.

## MVP success criteria

- Two testers can intentionally discover each other using a 5-minute QR/token flow.
- Both users approve the connection.
- Both enter a live secure session.
- Server receives ciphertext only.
- Either disconnect triggers purge on both devices.
- Screenshot event notifies both users.
- Backend tests prove no plaintext message body storage exists.
- All logs are free of plaintext messages and private keys.
