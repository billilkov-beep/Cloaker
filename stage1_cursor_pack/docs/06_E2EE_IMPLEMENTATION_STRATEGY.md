# E2EE Implementation Strategy

## Non-negotiable rule

The backend must never receive app-to-app plaintext. It only routes encrypted envelopes.

## Do not invent crypto

This app should use a proven protocol/library. Cursor may create abstractions and tests, but production crypto integration needs a security review.

## MVP architecture for crypto

Create a shared crypto package:

```text
packages/crypto/
  CryptoEngine.ts
  types.ts
  adapters/
    SignalCryptoEngine.ts      future
    MatrixOlmCryptoEngine.ts   future
    FakeCryptoEngine.dev.ts    development only
```

Backend must only import public envelope types, never decrypt functions.

## Candidate protocols

### Signal-style one-to-one messaging

Best for one-to-one private messaging with per-message ratcheting, forward secrecy, and post-compromise recovery. Use if compatible library/license is selected.

### Matrix Olm/Megolm style

Potentially useful if using Matrix-style E2EE libraries and future group support. Requires careful mobile integration.

### MLS for future groups

Do not include in MVP unless group chat becomes a near-term requirement.

## Device key lifecycle

1. On first launch/auth, device generates identity key pair locally.
2. Private key remains in secure storage.
3. Public identity key and prekeys are uploaded to server.
4. Other users fetch public bundles to establish sessions.
5. If a device is revoked, future sessions must not include that device.

## Server-side prekey duties

Server may store:

- identity public key
- signed prekey public key
- signed prekey signature
- one-time public prekeys

Server must not store:

- identity private key
- session key
- message key
- plaintext message
- attachment key in plaintext

## Safety codes

Each pair of users/devices should derive a safety number/fingerprint from public identity keys. Users can verify via QR code or compare short code.

If safety code changes:

- warn both users
- freeze active secure session
- require manual approval/re-verification before sending

## Development/test mode

`FakeCryptoEngine` may be used only to test UI and API flow. It must be impossible to ship with fake crypto enabled:

- production build check fails
- CI fails if fake crypto is imported by production entrypoints
- runtime refuses startup if `CRYPTO_ENGINE=fake` in non-dev environment

## Attachment encryption

For attachments:

1. Generate file key on sender device.
2. Encrypt file locally.
3. Upload encrypted bytes only.
4. Put file key inside encrypted message envelope.
5. Recipient decrypts file locally.
6. Server deletes encrypted file when session purges/expires.

## Message envelope shape

```ts
type EncryptedEnvelope = {
  protocol: 'signal' | 'matrix-olm' | 'dev-fake';
  version: number;
  senderDeviceId: string;
  recipientDeviceId: string;
  ratchetHeader?: string | Record<string, unknown>;
  ciphertext: string;
  aad: {
    discussionId: string;
    secureSessionId: string;
    senderUserId: string;
    recipientUserId: string;
    clientMessageId: string;
    timestamp: string;
  };
};
```

## Security review gates before real user production

- Confirm chosen crypto library license.
- Confirm mobile private key storage implementation.
- Confirm no decrypt code is reachable server-side.
- Confirm no logs or crashes include plaintext.
- Confirm key-change behavior.
- Confirm replay/duplicate message handling.
- Confirm deleted sessions cannot receive late messages.
