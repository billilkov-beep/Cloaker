# Infrastructure and Server IP Protection

## Goal

The public internet should never connect directly to the real app server or database.

## Recommended MVP topology

```text
Mobile app
  -> api.example.com / ws.example.com
  -> Cloudflare edge/WAF/rate limits
  -> Cloudflare Tunnel
  -> private backend container/server
  -> private PostgreSQL
```

## Cloudflare Tunnel approach

- Run `cloudflared` near the backend service.
- Backend listens on private localhost/container network only.
- Public DNS points to Cloudflare proxy, not origin IP.
- Firewall blocks inbound 80/443/22 from public internet.
- Admin access goes through Cloudflare Access, Tailscale, WireGuard, or equivalent.

## Do not use rotating DNS as primary protection

Rotating DNS is weaker because:

- IPs can leak from DNS history.
- Clients/cache may hold old values.
- Attackers can scan ranges.
- Debugging becomes harder.
- It does not remove the origin from the public internet.

Use private origin/tunnel instead.

## Required network rules

Allowed:

```text
Cloudflare Tunnel outbound from server
Backend -> PostgreSQL private network
Backend -> Twilio outbound HTTPS optional
Backend -> APNs/FCM outbound HTTPS
Admin -> Zero Trust/VPN -> internal services
```

Blocked:

```text
Internet -> backend direct IP
Internet -> PostgreSQL
Internet -> Redis
Internet -> SSH
Internet -> admin dashboards
Internet -> monitoring tools
```

## Domain plan

```text
api.example.com      Backend API via tunnel
ws.example.com       WebSocket realtime via tunnel
admin.example.com    Zero Trust protected admin only
app.example.com      Landing page, optional
```

## Secrets management

- Use environment variables only for local dev.
- Use secrets manager in staging/production.
- Never commit `.env`.
- Rotate secrets after any exposure.
- Keep Twilio credentials backend-only.
- Keep Apple/Android signing assets outside repo.

## Logging/monitoring

- Structured logs.
- No plaintext content.
- No private keys.
- No raw discovery tokens.
- No full phone numbers unless redacted.
- Store audit events without message content.

## Rate limiting

Rate-limit by:

- IP/network
- user id
- device id
- endpoint
- discovery token hash
- failed attempts
- account age/risk score

## Deployment checklist

- [ ] Backend has no public inbound ports.
- [ ] Database has no public IP.
- [ ] Cloudflare Tunnel configured.
- [ ] WAF/rate limiting enabled.
- [ ] Admin route protected by Zero Trust/MFA/passkey.
- [ ] WebSockets tested through edge/tunnel.
- [ ] Twilio webhooks point to protected domain.
- [ ] Twilio signatures validated server-side.
- [ ] Logs verified free of message content.
