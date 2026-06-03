# Privacy Policy Notes Draft — Not Legal Advice

This is not a final privacy policy. A lawyer should review before public launch.

## Product privacy promise

- App-to-app messages are end-to-end encrypted.
- The server cannot read app-to-app message content.
- Messages are temporary and purged from the server based on secure session rules.
- Users are not publicly searchable.
- Discovery must be intentionally enabled and expires after 5 minutes.

## Data collected for operation

Potential operational metadata:

- account id
- device id
- public encryption keys
- contact relationship metadata
- discovery window state
- secure session state
- message delivery metadata
- generic audit events
- crash diagnostics without message content
- IP/rate-limit data for abuse prevention

## Data not collected/stored

- plaintext app-to-app messages
- plaintext app-to-app attachments
- private encryption keys
- searchable public directory of users
- phone contact book by default

## User safety disclosure

The app can detect or block some screenshots/screen recordings depending on platform support, but cannot prevent:

- taking a photo with another device
- copying information by memory/manual transcription
- compromised/rooted/jailbroken devices
- screenshots that the OS does not report

## Beta wording

During early private beta, testers should not use real sensitive messages until security review is complete.
