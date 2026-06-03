# 05 — Ordered Build Phases

## Phase 0 — Repo and research setup

Deliverables: private repo, Stage 1 imported, Cursor rules active, `REUSE_DECISIONS.md`, local dev setup.

## Phase 1 — Backend scaffold

Deliverables: TypeScript API, PostgreSQL/Prisma, users/devices/discussions schema, redacted logging, health endpoint, tests.

## Phase 2 — Mobile scaffold

Deliverables: React Native app, test login, discovery screen, QR placeholder, secure session screen, secure storage abstraction.

## Phase 3 — Private discovery

Deliverables: 5-minute discovery window, hashed token storage, QR/code, exact lookup, generic errors, approval flow.

## Phase 4 — E2EE envelope MVP

Deliverables: device public key registration, private keys device-only, encrypted envelope send/receive, server ciphertext only.

## Phase 5 — Live secure sessions

Deliverables: WebSocket/presence heartbeat, disconnect detection, session end, purge command, local/server cleanup.

## Phase 6 — Screenshot/capture events

Deliverables: platform detection where supported, route event to both users, strict-mode purge.

## Phase 7 — Infrastructure hardening

Deliverables: Cloudflare Tunnel/private origin plan, admin Zero Trust/VPN, no public DB/Redis/SSH, secrets plan.

## Phase 8 — TestFlight beta

Deliverables: Apple setup, internal TestFlight build, under-100 tester plan, no real sensitive data in beta.
