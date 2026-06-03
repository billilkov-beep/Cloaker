# Cursor Agent Prompt — Build From Stage 1 Pack

You are building a privacy-first secure communications app from the documents in this repository.

## Non-negotiable requirements

1. The server must never receive plaintext message bodies.
2. App-to-app messaging must be E2EE. Server stores/routes ciphertext only.
3. Do not create any backend column named `body`, `plaintext`, `message_text`, or similar for app-to-app messages.
4. No public user search. No `GET /users/search?name=` endpoint.
5. Discovery is off by default and only active for 5 minutes when the discovered user intentionally enables it.
6. Discovery requires exact temporary token/QR. Wrong, expired, inactive, or non-existent tokens return the same generic response.
7. Both participants must approve/accept before a secure discussion can start.
8. If either participant disconnects, secure session ends and both devices receive purge instructions.
9. Screenshot/screen-recording events must be secure control events. They must not include message content.
10. Twilio credentials are server-side only. Never include Twilio Account SID/Auth Token/API Secret in mobile code.
11. The origin server must be private behind Cloudflare Tunnel or equivalent private origin architecture.
12. Do not invent custom cryptography. Use interfaces first, then integrate proven audited libraries after license review.
13. Do not log message ciphertext unnecessarily; never log plaintext or decrypted content.
14. Push notifications must be generic: “New message” only.

## Build sequence

Start with a monorepo:

```text
apps/mobile          React Native app
apps/api             Node/NestJS or Fastify backend
packages/shared      shared TypeScript types and validation schemas
packages/crypto      crypto interfaces and adapters
packages/db          Prisma schema and database migrations
infra                Docker Compose, Cloudflare Tunnel notes, deployment docs
docs                 architecture/spec/test docs
```

Recommended stack:

- React Native with TypeScript for mobile.
- Node.js 22+ with TypeScript for backend.
- PostgreSQL for persistence.
- Prisma for data modeling.
- WebSocket layer for live secure sessions and heartbeats.
- Passkey/WebAuthn or passkey-ready auth path.
- React Native Keychain / iOS Keychain / Android Keystore for device-private keys.

## First implementation checkpoint

Create code skeleton only:

- Mobile navigation screens:
  - Welcome/Auth
  - Device setup
  - Private discovery
  - Contact request
  - Secure session room
  - Settings/devices
- Backend modules:
  - auth
  - devices/prekeys
  - discovery
  - contacts
  - discussions
  - secure sessions
  - encrypted messages
  - control events
  - webhooks/twilio optional
- Shared types:
  - UserId, DeviceId, DiscussionId, SecureSessionId
  - EncryptedEnvelope
  - DiscoveryWindow
  - SecureControlEvent
- Database schema from `docs/04_DATA_MODEL_PRISMA.prisma`.
- Tests that fail if a plaintext message body field is added to server-side message types.

## Important implementation instruction

For encryption, create the interfaces and tests first:

```ts
interface CryptoEngine {
  generateDeviceIdentity(): Promise<DeviceIdentityPublicBundle>;
  createOutboundSession(input: OutboundSessionInput): Promise<OutboundSession>;
  encryptMessage(input: EncryptMessageInput): Promise<EncryptedEnvelope>;
  decryptMessage(input: DecryptMessageInput): Promise<PlaintextForLocalDeviceOnly>;
}
```

The backend must never import decrypt functions for app-to-app messages.

Use `FakeCryptoEngine` only in local UI tests, with loud warnings. Production builds must fail if fake crypto is enabled.

## After skeleton

Work checkpoint by checkpoint from `docs/10_BUILD_ROADMAP.md`.
