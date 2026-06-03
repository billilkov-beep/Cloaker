# Employee Daily Checklist

## Before work

- [ ] Pull latest main.
- [ ] Create/switch to feature branch.
- [ ] Review manager comments.
- [ ] Confirm no production secrets in local files.

## During work

- [ ] Keep Cursor task small.
- [ ] Review every diff.
- [ ] Add/update tests.
- [ ] Do not log message bodies.
- [ ] Do not add public user search.
- [ ] Do not add plaintext server message fields.
- [ ] Do not paste secrets into AI prompts.

## Before commit

- [ ] Run lint.
- [ ] Run typecheck.
- [ ] Run tests.
- [ ] Search for forbidden plaintext fields.
- [ ] Confirm no `.env` or secrets are staged.
