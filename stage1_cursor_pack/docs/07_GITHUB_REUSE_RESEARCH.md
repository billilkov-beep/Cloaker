# GitHub Reuse Research

Before building new code, inspect and reuse proven libraries where appropriate. Do not copy code blindly. Verify license, maintenance, security issues, and production suitability.

## Reuse decision matrix

| Area | Repository / package | Current note | License concern | Recommendation |
|---|---|---|---|---|
| Signal Protocol / E2EE | `signalapp/libsignal` | Official Signal protocol implementation with Rust core and Java/Swift/TypeScript APIs. It implements the Signal protocol and Double Ratchet. Outside use is unsupported and APIs can change. | AGPL-3.0 | Strong crypto candidate only if license/legal path works. Do not copy into closed source without legal review. |
| Matrix E2EE ratchets | `matrix-org/vodozemac` | Pure Rust implementation of Olm/Megolm ratchets; README notes Least Authority audit with no significant findings. | Apache-2.0 | Good candidate for research/prototype if native/Rust bridge is acceptable. Needs architecture review. |
| Passkeys/WebAuthn | `MasterKale/SimpleWebAuthn` | TypeScript-first server/browser WebAuthn libraries. | MIT | Recommended for backend passkey flows if using Node. |
| Twilio Voice RN | `twilio/twilio-voice-react-native` | Official Twilio React Native Voice SDK. | Twilio SDK terms/license review | Use for Twilio voice only. Not for E2EE app messaging. |
| Twilio server SDK | `twilio/twilio-node` | Official Node helper library. README warns not to use in frontend because credentials can be exposed. | MIT | Use backend only. |
| Private origin / tunnel | `cloudflare/cloudflared` | Cloudflare Tunnel daemon proxies Cloudflare traffic to origins without opening firewall holes. | Apache-2.0 | Recommended for MVP IP protection. |
| React Native secure storage | `oblador/react-native-keychain` | Provides access to iOS Keychain and Android Keystore for credentials/tokens/sensitive info. | MIT | Recommended for device-local secrets, subject to mobile security review. |
| App-to-app WebRTC calls | `react-native-webrtc/react-native-webrtc` | React Native WebRTC module with iOS/Android audio/video/data channel support. | MIT | Candidate for future app-to-app calling, separate from Twilio phone network. |
| ORM | `prisma/prisma` | TypeScript ORM. | Apache-2.0 | Recommended for MVP database modeling. |
| Backend framework | `nestjs/nest` or Fastify | Mature TypeScript backend options. | MIT | Choose one; keep small. |

## Source notes to verify in Cursor/browser

- `signalapp/libsignal`: README says libsignal contains platform-agnostic APIs used by Signal clients and servers, exposed as Java, Swift, or TypeScript libraries with Rust implementations, including Signal protocol/Double Ratchet. It also states use outside Signal is unsupported and APIs may change.
- `matrix-org/vodozemac`: README says it is a pure Rust implementation of Olm/Megolm ratchets and has had a Least Authority audit with no significant findings.
- `twilio/twilio-node`: README warns not to use the Node library in frontend apps because doing so can expose Twilio credentials.
- `cloudflare/cloudflared`: README says Cloudflare Tunnel proxies traffic from Cloudflare to origins without requiring firewall holes, allowing origin to remain as closed as possible.
- `oblador/react-native-keychain`: README says it provides access to iOS Keychain and Android Keystore for storing credentials/tokens/sensitive information.
- `twilio/twilio-voice-react-native`: Official Twilio docs and repo provide React Native voice SDK and reference app.

## Crypto decision warning

Do not choose a crypto dependency based only on convenience. The selected library must pass:

- license review
- security review
- mobile compatibility review
- maintenance review
- proof that server cannot decrypt

## Repositories to avoid initially

- Random “Signal Protocol clone” repositories without audits.
- Screenshot-prevention libraries with low maintenance unless source is reviewed.
- Any dependency that requires plaintext messages on the server.
- Any dependency that sends private user data to third-party analytics by default.

## Screenshot/capture implementation recommendation

Prefer native platform implementation:

- iOS: `UIApplication.userDidTakeScreenshotNotification` and `UIScreen.capturedDidChangeNotification`.
- Android: Android 14 `Activity.ScreenCaptureCallback`; Android `FLAG_SECURE` for strict mode.

Use a React Native native module if needed. Do not rely entirely on an unreviewed third-party screenshot library.
