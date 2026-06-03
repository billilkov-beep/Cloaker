# Employee Handoff: Privacy App Stage 1 → Cursor Build

Start here.

This package gives you everything needed to begin building the privacy-first mobile app in Cursor. Do **not** start coding until you have read the setup steps, security rules, and GitHub reuse-first instructions.

## Core product rules

- Server must never read app-to-app message text.
- Server stores encrypted message envelopes only.
- No SMS for app-to-app messaging.
- Discovery is off by default.
- A user must intentionally enable discovery.
- Discovery is active for a maximum of 5 minutes.
- Discovery requires an exact private token or QR code.
- No public user search, name search, phone lookup, email lookup, or partial matches.
- A valid discovery token only allows a request; the discovered user must approve.
- If either person disconnects, the secure session ends and messages are purged from both sides.
- Screenshot/screen-recording events notify both users where the operating system allows.
- Backend origin IP should be protected behind Cloudflare Tunnel/private origin, not rotating DNS.
- Existing GitHub repositories must be evaluated before recreating major pieces.

## What is in this ZIP

```text
START_HERE_EMPLOYEE.md
MANAGER_NOTE.md
instructions/01_STEP_BY_STEP_SETUP.md
instructions/02_CURSOR_WORKFLOW.md
instructions/03_SECURITY_RULES.md
instructions/04_GITHUB_REUSE_FIRST.md
instructions/05_BUILD_PHASES.md
instructions/06_MANAGER_REVIEW_CHECKPOINTS.md
instructions/07_COMMAND_CHEATSHEET.md
prompts/CURSOR_MASTER_PROMPT.md
prompts/CURSOR_REPO_RESEARCH_PROMPT.md
prompts/CURSOR_FIRST_BUILD_PROMPT.md
templates/.env.example
templates/PR_TEMPLATE.md
templates/SECURITY_REVIEW_TEMPLATE.md
checklists/EMPLOYEE_DAILY_CHECKLIST.md
checklists/MVP_ACCEPTANCE_CHECKLIST.md
stage1_cursor_pack/
stage1_cursor_pack.zip
```

## First task

1. Create a private GitHub repo.
2. Copy `stage1_cursor_pack/` into the repo root.
3. Open the repo in Cursor.
4. Paste `prompts/CURSOR_MASTER_PROMPT.md` into Cursor Agent.
5. Do not code until Cursor summarizes the project and you have created `docs/REUSE_DECISIONS.md`.

## Critical warning

Never paste real secrets, production keys, Apple certificates, Twilio Auth Tokens, private keys, real user phone numbers, or real user messages into Cursor, ChatGPT, Claude, or any AI tool.
