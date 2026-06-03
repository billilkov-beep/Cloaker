# 01 — Step-by-Step Setup Instructions

## Goal

Turn the Stage 1 planning package into a Cursor-ready private GitHub repository and begin the MVP build safely.

## Required tools/accounts

- GitHub account with access to private repo
- Cursor installed and signed in
- Git
- Node.js LTS
- pnpm
- Docker Desktop
- PostgreSQL locally or through Docker
- Xcode for iPhone/iOS testing
- Apple Developer access for TestFlight later
- Android Studio only if Android testing is included
- Twilio account only for verification/voice/SMS fallback testing
- Cloudflare account only for protected API ingress testing

## Step 1 — Create private GitHub repo

Create a **private** GitHub repository, for example:

```text
privacy-secure-chat-app
```

Enable branch protection for `main`. Require pull requests before merge. Enable secret scanning if available.

Recommended branches:

```text
main
staging
feature/*
security/*
infra/*
```

## Step 2 — Import Stage 1 pack

Copy the contents of this folder into the repo root:

```text
stage1_cursor_pack/
```

After copying, the repo root should include:

```text
00_CURSOR_START_HERE.md
99_CURSOR_BUILD_PROMPT.md
AGENTS.md
STAGE1_MASTER_CURSOR_IMPORT.md
docs/
.cursor/rules/
```

Commit:

```bash
git add .
git commit -m "chore: import stage 1 Cursor pack"
git push origin main
```

## Step 3 — Open in Cursor

Open the private repo folder in Cursor. Confirm `.cursor/rules/` exists.

Paste the contents of:

```text
prompts/CURSOR_MASTER_PROMPT.md
```

into Cursor Agent.

Cursor must first read and summarize the repo. It should not modify files yet.

## Step 4 — Require GitHub reuse research before building

Paste:

```text
prompts/CURSOR_REPO_RESEARCH_PROMPT.md
```

Cursor must create:

```text
docs/REUSE_DECISIONS.md
```

Do not start major implementation until this exists and is reviewed.

## Step 5 — Scaffold only after reuse decisions

After manager approval, paste:

```text
prompts/CURSOR_FIRST_BUILD_PROMPT.md
```

Expected monorepo structure:

```text
apps/mobile/       React Native app
apps/api/          TypeScript backend
packages/shared/   shared types/validation
packages/db/       Prisma/schema/client
packages/crypto/   crypto interfaces/wrappers only
infra/             Docker and deployment notes
docs/              decisions and architecture
```

## Step 6 — First vertical slice goal

Build only this first:

```text
User A and User B can use test accounts.
User A enables 5-minute private discovery.
User B enters/scans exact token.
User A approves request.
Secure session opens.
User A sends encrypted envelope.
Server stores ciphertext only.
User B receives/decrypts locally.
Either user disconnects.
Both devices purge session.
```

## Step 7 — Stop for review

Stop and request manager review after:

- Repo scaffold exists.
- `REUSE_DECISIONS.md` exists.
- Private discovery works in test mode.
- Encrypted envelope flow works in test mode.
- Logs/database have been checked for plaintext leakage.
