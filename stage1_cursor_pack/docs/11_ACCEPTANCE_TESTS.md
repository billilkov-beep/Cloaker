# Acceptance Tests

## Required automated tests

### No plaintext message storage

- Fail if `EncryptedMessage` schema has fields matching `/body|plaintext|cleartext|messageText|text/i` except in client-local-only test types.
- Fail if backend message send DTO accepts `body`.
- Fail if backend imports client decrypt function.

### Discovery privacy

- Discovery defaults off.
- Discovery expires after 5 minutes.
- Discovery cancelled when owner cancels.
- Discovery cancelled when owner disconnects/backgrounds.
- Token can be used once.
- Wrong token returns generic `not_found`.
- Expired token returns same generic `not_found`.
- Cancelled token returns same generic `not_found`.
- Rate-limited token returns client-safe generic response.

### Authorization

- User cannot send to non-contact.
- User cannot send to non-participant.
- User cannot use another user's discovery window.
- User cannot end another user's session unless participant.
- Server ignores client-supplied sender user id and uses auth token identity.

### Secure session lifecycle

- Both participants online can start session.
- Message accepted only when session active.
- Manual disconnect ends session.
- Heartbeat timeout ends session.
- Session end triggers purge to both devices.
- Purge receipts are recorded.
- Ended session rejects new messages.

### Screenshot/capture events

- Screenshot control event routes to both participants.
- Event contains no message content.
- Strict mode triggers purge.
- Android FLAG_SECURE mode is mutually understood with screenshot callback limitations.

### Logging

- Message plaintext never appears in logs.
- Raw discovery token never appears in logs.
- Twilio credentials never appear in logs.
- Push payloads contain no message text.

## Manual test scenarios

1. John enables discovery; Paul scans within 5 minutes; John accepts; secure session starts.
2. John enables discovery; Paul scans after 5 minutes; generic not found.
3. John enables discovery; cancels; Paul scans; generic not found.
4. Paul tries to type “John” in discovery; no search results.
5. John sends encrypted message; server DB has ciphertext only.
6. John backgrounds app; Paul receives purge event.
7. Paul takes screenshot; both see screenshot notification.
8. Strict mode screenshot; session purges.
9. Push notification arrives; lock screen shows no message content.
10. Backend direct IP is unreachable.
