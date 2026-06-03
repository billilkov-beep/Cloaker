# 04 — GitHub Reuse-First Instructions

Before writing custom implementations, inspect existing repositories/libraries. Create `docs/REUSE_DECISIONS.md` before major implementation.

For each repo, document:

- URL
- purpose
- license
- maintenance status
- platform fit
- security concerns
- integration complexity
- decision: use / research only / reject
- reason
- manager/legal/security approval needed

## Repositories to inspect

### E2EE / messaging research

```text
signalapp/libsignal
https://github.com/signalapp/libsignal
Purpose: Signal Protocol, Double Ratchet, crypto primitives.
Warning: AGPL-3.0 and outside use is unsupported by upstream; legal/security review required before use.
```

```text
matrix-org/vodozemac
https://github.com/matrix-org/vodozemac
Purpose: Matrix Olm/Megolm ratchets in Rust. Evaluate as research/possible crypto component.
```

```text
matrix-org/matrix-rust-sdk
https://github.com/matrix-org/matrix-rust-sdk
Purpose: mature Matrix client architecture, device identity, E2EE patterns.
```

```text
matrix-org/matrix-js-sdk
https://github.com/matrix-org/matrix-js-sdk
Purpose: Matrix JavaScript SDK and E2EE patterns.
```

```text
simplex-chat/simplex-chat
https://github.com/simplex-chat/simplex-chat
Purpose: metadata-minimizing private messaging architecture. Likely research only unless license/product fit is approved.
```

### Twilio

```text
twilio/twilio-voice-react-native
https://github.com/twilio/twilio-voice-react-native
Purpose: optional Twilio voice in React Native.
```

```text
twilio/twilio-node
https://github.com/twilio/twilio-node
Purpose: backend-only Twilio API usage. Never use in mobile frontend.
```

### Infrastructure

```text
cloudflare/cloudflared
https://github.com/cloudflare/cloudflared
Purpose: Cloudflare Tunnel client for hiding/protecting backend origin.
```

### Mobile security / app platform

```text
oblador/react-native-keychain
https://github.com/oblador/react-native-keychain
Purpose: React Native access to iOS Keychain and Android Keystore.
```

```text
MasterKale/SimpleWebAuthn
https://github.com/MasterKale/SimpleWebAuthn
Purpose: passkeys/WebAuthn helpers for server/web/admin flows.
```

```text
Expensify/react-native-qrcode-svg
https://github.com/Expensify/react-native-qrcode-svg
Purpose: QR code generation for private discovery.
```

```text
mrousavy/react-native-vision-camera
https://github.com/mrousavy/react-native-vision-camera
Purpose: camera/scanner for QR discovery.
```

```text
wn-na/react-native-capture-protection
https://github.com/wn-na/react-native-capture-protection
Purpose: screenshot/screen-recording detection/protection.
```

```text
gbumps/react-native-screenguard
https://github.com/gbumps/react-native-screenguard
Purpose: screenshot/screen-recording prevention/detection.
```

```text
recepkocur/react-native-screen-capture
https://github.com/recepkocur/react-native-screen-capture
Purpose: screen capture protection/detection. Evaluate freshness before use.
```

```text
react-native-webrtc/react-native-webrtc
https://github.com/react-native-webrtc/react-native-webrtc
Purpose: future app-to-app voice/video/data channel exploration.
```

## Hard rule

Do not copy code from any repository unless license, security, and manager approval are complete.
