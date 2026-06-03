# Pull Request Template

## Summary

## Security/privacy impact

- [ ] Touches message content handling
- [ ] Touches encryption/key handling
- [ ] Touches discovery/contact lookup
- [ ] Touches logs/analytics/crash reporting
- [ ] Touches push notifications
- [ ] Touches Twilio/phone numbers
- [ ] Touches server/network exposure

## Privacy checks

- [ ] No plaintext app-to-app message body stored server-side.
- [ ] No plaintext app-to-app message body logged.
- [ ] No message text in push payloads.
- [ ] No raw discovery tokens logged.
- [ ] No secrets committed.
- [ ] No public user search added.

## Tests run

```bash
pnpm lint
pnpm typecheck
pnpm test
```

## Manual test steps

## Known limitations
