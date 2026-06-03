# 07 — Command Cheat Sheet

## Import Stage 1 pack

```bash
cp -R /path/to/privacy_app_employee_handoff/stage1_cursor_pack/. /path/to/privacy-secure-chat-app/
cd /path/to/privacy-secure-chat-app
git add .
git commit -m "chore: import stage 1 Cursor pack"
git push origin main
```

## Feature branch

```bash
git checkout -b feature/reuse-decisions
```

## Search for plaintext-risk fields

```bash
grep -R "message_text\|plaintext\|decrypted_body\|notification_body" . \
  --exclude-dir=node_modules \
  --exclude-dir=.git \
  --exclude-dir=ios/Pods
```

## Check for accidentally staged secret files

```bash
git status --short | grep -E "\.env|\.p8|\.p12|\.pem|\.key" && echo "STOP: possible secret file staged"
```

## Typical commands after scaffold

```bash
pnpm install
pnpm lint
pnpm typecheck
pnpm test
docker compose up -d
pnpm db:migrate
```

## iOS after scaffold

```bash
cd apps/mobile
pnpm install
cd ios && pod install && cd ..
pnpm ios
```

## Open in Cursor

```bash
cursor .
```
