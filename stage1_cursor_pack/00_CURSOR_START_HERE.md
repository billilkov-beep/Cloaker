# Cursor Start Here — Privacy-First Secure Communications App

Generated: 2026-06-02

This is the Stage 1 planning/build package for a private, end-to-end encrypted mobile communications app. The goal of this package is to give Cursor enough structure to begin implementation without re-asking the same architecture questions.

## Product direction

Build a private iPhone/Android app where:

- App-to-app messages are **not SMS**.
- The server **must never receive plaintext message bodies**.
- Users are **not publicly searchable**.
- Discovery is **off by default** and can be enabled intentionally for **5 minutes**.
- Discovery uses an exact temporary token or QR code, not a public name search.
- Secure chat sessions are live-session based.
- If either participant disconnects, both sides purge the session.
- Screenshot and screen-recording events notify both users and can optionally end/purge the session.
- Twilio is optional/fallback for voice or external phone/SMS use only; Twilio credentials never go in the mobile app.
- Real server origin IP is hidden behind a protected edge/private tunnel.

## How to use this pack in Cursor

1. Create a new private GitHub repository.
2. Unzip this pack into the repository root.
3. Open the repo in Cursor.
4. Confirm `.cursor/rules/*.mdc` appears in the repo.
5. Open `99_CURSOR_BUILD_PROMPT.md`.
6. Paste that file into Cursor Agent and run it.
7. Do **not** let Cursor build crypto from scratch. It must choose audited/proven libraries and leave hard blockers where a security review is required.

## Recommended first Cursor task

Ask Cursor:

> Read `00_CURSOR_START_HERE.md`, `docs/01_PRODUCT_REQUIREMENTS.md`, `docs/02_ARCHITECTURE.md`, `docs/03_SECURITY_PRIVACY_THREAT_MODEL.md`, and `docs/07_GITHUB_REUSE_RESEARCH.md`. Then create a monorepo skeleton with mobile, backend, shared types, database schema, tests, and placeholder crypto interfaces. Do not implement real cryptography yet. Do not add any plaintext message body server fields.

## Stage 1 output definition

Stage 1 is complete when the repo contains:

- Product requirements
- Architecture design
- Security/privacy threat model
- E2EE strategy
- API contracts
- Database schema draft
- GitHub reuse research
- Infrastructure/security plan
- TestFlight/private beta plan
- Build roadmap
- Cursor rules

This package includes all of those.
