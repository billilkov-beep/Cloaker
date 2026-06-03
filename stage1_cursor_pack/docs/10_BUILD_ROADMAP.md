# Build Roadmap

## Stage 1 — planning package

Status: this package.

Deliverables:

- PRD
- architecture
- threat model
- data model
- API contracts
- GitHub reuse research
- infrastructure plan
- beta plan
- Cursor prompt/rules

## Stage 2 — repo skeleton

Cursor tasks:

1. Create monorepo layout.
2. Add TypeScript, linting, formatting, test runner.
3. Add Prisma schema.
4. Add shared zod/type schemas.
5. Add backend modules without business logic.
6. Add mobile app navigation screens as empty screens.
7. Add CryptoEngine interface and dev fake engine with production guard.
8. Add tests that fail on plaintext server message fields.

Acceptance:

- `pnpm test` passes.
- backend compiles.
- mobile compiles.
- DB schema validates.

## Stage 3 — identity and discovery

Cursor tasks:

1. Passkey-ready auth skeleton.
2. Device registration.
3. Timed discovery windows.
4. Exact token resolve.
5. Contact requests.
6. Pairwise contacts.
7. Generic failure responses and rate limits.

Acceptance:

- User can enable discovery for 5 minutes.
- Token can be resolved only exact-match.
- Wrong/expired/cancelled returns same response.
- Contact must be accepted.
- No public user search endpoints exist.

## Stage 4 — secure sessions and websocket

Cursor tasks:

1. Authenticated WebSocket connection.
2. Secure session start.
3. Heartbeat.
4. Disconnect detection.
5. Session end state machine.
6. Purge command.
7. Purge receipts.

Acceptance:

- Both users online can join session.
- Manual disconnect purges both sides.
- Heartbeat timeout purges session.
- Messages rejected after session ends.

## Stage 5 — E2EE integration

Cursor tasks:

1. Choose crypto library after license/security review.
2. Implement client-only encrypt/decrypt adapter.
3. Upload public prekeys.
4. Fetch recipient prekey bundle.
5. Send encrypted envelope.
6. Decrypt locally.
7. Safety-code display.
8. Key-change warning.

Acceptance:

- Server never sees plaintext.
- Backend cannot decrypt.
- Safety code shown.
- Key change freezes session.

## Stage 6 — screenshot/capture controls

Cursor tasks:

1. iOS screenshot notification native module.
2. iOS screen capture state native module.
3. Android screenshot detection for API 34+.
4. Android FLAG_SECURE strict mode.
5. Control events to both users.
6. Strict-mode purge on detection.

Acceptance:

- Supported screenshot events notify both users.
- Strict mode ends/purges session.
- Limitations are clearly documented in UI.

## Stage 7 — infrastructure hardening

Cursor tasks:

1. Docker Compose dev env.
2. Cloudflare Tunnel docs/scripts.
3. Private database config.
4. API rate limits.
5. WAF notes.
6. Redacted logging.
7. CI checks.

Acceptance:

- No public DB.
- No public backend IP in app config.
- Logs have no content.
- CI blocks fake crypto in production.

## Stage 8 — TestFlight beta

Cursor tasks:

1. iOS build configs.
2. Privacy-safe crash reporting setup.
3. TestFlight checklist.
4. Beta tester instructions.
5. Feature flags.
6. Admin invite/tester controls.

Acceptance:

- Under-100 private beta ready.
- Email invite only.
- Testers warned not to use real sensitive messages until security review.
