# Private Beta and TestFlight Plan

## Target

Under 100 testers for first iPhone beta.

## iPhone testing path

Use TestFlight external testing by email invite only. Avoid public TestFlight links for the first beta.

## Beta phases

### Phase A — developer devices only

- Local iOS build on developer/founder phones.
- Test login/device setup.
- Test timed discovery.
- Test encrypted-envelope flow with fake/dev crypto only.
- Test purge-on-disconnect.
- Test screenshot event hooks.

### Phase B — internal TestFlight

- 5-10 trusted internal testers.
- Validate install/update flow.
- Validate crash-free basic use.
- Confirm no message content in logs or push notifications.

### Phase C — private external TestFlight

- 20-100 invited testers by email.
- Use fake/non-sensitive conversations initially.
- Collect bug reports.
- Do not promise production privacy guarantees until security review is done.

## Tester instructions

- Do not use real sensitive messages in early beta.
- Report screenshot/screen-recording behavior per device.
- Report disconnect/purge behavior.
- Report any message that persists after disconnect.
- Report any notification that displays message content.

## Pre-beta checklist

- [ ] No plaintext message body fields in backend schema.
- [ ] No message content in logs.
- [ ] No message content in crash reporting.
- [ ] No message content in push notifications.
- [ ] Discovery expires after 5 minutes.
- [ ] Generic errors for discovery token failures.
- [ ] Delete-on-disconnect works for manual and heartbeat timeout.
- [ ] Screenshot event works on supported OS versions.
- [ ] Session purges local cache.
- [ ] Origin IP not public.
- [ ] Twilio credentials not in mobile app.
