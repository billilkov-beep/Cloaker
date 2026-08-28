Cloakr V10.2 Full Real App Public Release
=======================================

IMPORTANT: If your browser still shows the old dark SecureSession dashboard, the old Node process is still running or old files are still in the app folder. Extract this ZIP into the Node app root, overwrite old files, then STOP/START or RESTART the Hostinger Node app.

Hostinger environment variables:
SUPABASE_URL=https://YOUR-PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR-SERVICE-ROLE-KEY

Install/start:
npm install
npm start

Hostinger settings:
Framework: Node.js or Next.js is OK only if entry points to server.js.
Preferred entry file: server.js
Build command: npm run build
Start command: npm start

If your Hostinger app is set to .next/server.js, this ZIP also includes .next/server.js after build.

Test users:
john@securesession.test / John@123456
paul@securesession.test / Paul@123456

Testing live chat:
1. Login John in Chrome normal window.
2. Login Paul in Incognito or another browser.
3. Click Start secure connection.
4. Chat opens in a new tab.
5. Messages should receive both ways through SSE + 800ms polling fallback.

Verify deployed version:
Open /api/health and it must show:
version: 10.2.0
ui: V10.2 NEW LIGHT MESSENGER UI
