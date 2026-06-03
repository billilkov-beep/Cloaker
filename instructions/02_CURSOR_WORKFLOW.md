# 02 — Cursor Workflow

Use Cursor as a coding assistant, not as an unsupervised production deployer.

## Rules

- Work in feature branches only.
- Keep Cursor tasks small.
- Ask Cursor to list files before editing.
- Review every diff.
- Require tests for every feature.
- Do not let Cursor invent crypto.
- Do not let Cursor add public search.
- Do not merge code that logs/stores plaintext app-to-app messages.

## Safe workflow

```text
1. Ask Cursor to restate requirement.
2. Ask Cursor to propose files to change.
3. Approve plan.
4. Let Cursor implement.
5. Review diffs.
6. Run lint/typecheck/tests.
7. Manually test.
8. Commit.
9. Open PR.
```

## Good prompt style

```text
Implement the private discovery token endpoint only. Follow docs/05_API_CONTRACTS.md. Use exact-token lookup only, generic errors, hashed token storage, a 5-minute max expiration, and unit tests. Do not log raw tokens. Do not modify unrelated files.
```

## Bad prompt style

```text
Build the whole app.
Make the security work.
Add encryption.
Fix everything.
```

## Required Cursor summary after each task

Cursor must return:

- changed files
- what changed
- tests added
- security/privacy impact
- manual test steps
- limitations
