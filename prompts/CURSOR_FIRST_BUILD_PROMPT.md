# Cursor First Build Prompt

```text
Create the initial monorepo scaffold for the privacy app.

Do not implement full encryption yet. Create clean interfaces/placeholders where specialist review is needed.

Structure:
apps/mobile/
apps/api/
packages/shared/
packages/db/
packages/crypto/
infra/
docs/

Backend:
- TypeScript API scaffold
- PostgreSQL/Prisma setup
- health endpoint
- users/devices/discussions/discovery/session/message-envelope schema
- redacted logging helpers
- no plaintext message body fields
- tests

Mobile:
- React Native scaffold or documented creation steps
- login/test account placeholder
- private discovery screen placeholder
- QR display/scanner placeholder
- secure session screen placeholder
- local secure storage abstraction
- screenshot/capture abstraction with platform placeholders

Shared:
- API request/response types
- validation schemas
- event types

Crypto:
- interfaces only unless vetted library decision is approved
- explicit TODOs for security review
- no homemade crypto protocol

Infra:
- docker-compose for local PostgreSQL/Redis if needed
- Cloudflare Tunnel notes without credentials

Testing:
- unit tests for discovery rules and no-plaintext guard where possible
- lint/typecheck/test scripts

Return changed files, install/run/test commands, risks, limitations, and next branch.
```
