'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const RELEASE = 'CLOAKR_V10_2_FULL_REAL_APP_MOBILE_CHAT_FIXED_2026_06_05';
const VERSION = '10.2.0';
const PORT = Number(process.env.PORT || 3000);
const PUBLIC_DIR = path.join(__dirname, 'public');
const DATA_DIR = path.join(__dirname, 'data');
const LOCAL_DB = path.join(DATA_DIR, 'local-db.json');
const MAX_BODY = 22 * 1024 * 1024;

const liveClients = new Map(); // sessionId -> Set<{res,userId,id}>

function nowIso(){ return new Date().toISOString(); }
function uid(prefix='id'){ return `${prefix}_${crypto.randomUUID().replace(/-/g,'')}`; }
function safeJsonString(value){ try { return JSON.stringify(value); } catch { return '{}'; } }
function json(res, status, payload){
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
    'X-Cloakr-Release': RELEASE,
    'X-Cloakr-Version': VERSION
  });
  res.end(JSON.stringify(payload));
}
function text(res, status, body, type='text/plain; charset=utf-8'){
  res.writeHead(status, {
    'Content-Type': type,
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
    'X-Cloakr-Release': RELEASE,
    'X-Cloakr-Version': VERSION
  });
  res.end(body);
}
function parseCookies(req){
  const out = {};
  const raw = req.headers.cookie || '';
  for(const p of raw.split(';')){
    const i = p.indexOf('=');
    if(i > 0) out[p.slice(0,i).trim()] = decodeURIComponent(p.slice(i+1).trim());
  }
  return out;
}
function getToken(req, urlObj){
  const auth = req.headers.authorization || '';
  if(auth.startsWith('Bearer ')) return auth.slice(7).trim();
  const q = urlObj.searchParams.get('token');
  if(q) return q;
  return parseCookies(req).cloakr_token || '';
}
async function readBody(req){
  return new Promise((resolve, reject)=>{
    let data = '';
    req.on('data', chunk=>{
      data += chunk;
      if(data.length > MAX_BODY){ reject(new Error('Payload too large. Keep media under 8 MB.')); req.destroy(); }
    });
    req.on('end', ()=>{
      if(!data) return resolve({});
      try { resolve(JSON.parse(data)); } catch { reject(new Error('Invalid JSON body')); }
    });
    req.on('error', reject);
  });
}
function mime(file){
  const ext = path.extname(file).toLowerCase();
  return ({
    '.html':'text/html; charset=utf-8', '.css':'text/css; charset=utf-8', '.js':'application/javascript; charset=utf-8',
    '.json':'application/json; charset=utf-8', '.svg':'image/svg+xml', '.png':'image/png', '.jpg':'image/jpeg',
    '.jpeg':'image/jpeg', '.webp':'image/webp', '.ico':'image/x-icon', '.bin':'application/octet-stream', '.sql':'text/plain; charset=utf-8'
  })[ext] || 'application/octet-stream';
}
function serveFile(res, filePath){
  const full = path.normalize(filePath);
  if(!full.startsWith(PUBLIC_DIR)) return text(res, 403, 'Forbidden');
  fs.stat(full, (err, st)=>{
    if(err || !st.isFile()) return text(res, 404, 'Not found');
    res.writeHead(200, {
      'Content-Type': mime(full),
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'X-Cloakr-Release': RELEASE,
      'X-Cloakr-Version': VERSION
    });
    fs.createReadStream(full).pipe(res);
  });
}

function supabaseConfig(){
  const url = String(process.env.SUPABASE_URL || '').replace(/\/$/, '');
  const key = String(process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  return { url, key, ok: !!(url && key && /^https:\/\/.+\.supabase\.co$/i.test(url)) };
}
async function sb(table, query='', options={}){
  const cfg = supabaseConfig();
  if(!cfg.ok) throw new Error('Supabase REST env missing. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
  const method = options.method || 'GET';
  const headers = {
    'apikey': cfg.key,
    'Authorization': `Bearer ${cfg.key}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };
  if(options.prefer) headers.Prefer = options.prefer;
  const url = `${cfg.url}/rest/v1/${table}${query ? (query.startsWith('?') ? query : '?' + query) : ''}`;
  const resp = await fetch(url, { method, headers, body: options.body !== undefined ? JSON.stringify(options.body) : undefined });
  const raw = await resp.text();
  let data = null;
  if(raw){ try { data = JSON.parse(raw); } catch { data = raw; } }
  if(!resp.ok){
    const msg = data && typeof data === 'object' ? [data.message, data.details, data.hint].filter(Boolean).join(' ') : raw;
    throw new Error(`Supabase ${method} ${table} failed (${resp.status}): ${msg || resp.statusText}`);
  }
  return data;
}
function useSupabase(){ return supabaseConfig().ok; }

function ensureLocal(){
  fs.mkdirSync(DATA_DIR, { recursive: true });
  if(!fs.existsSync(LOCAL_DB)){
    fs.writeFileSync(LOCAL_DB, JSON.stringify({
      users: [
        { id:'11111111-1111-4111-8111-111111111111', name:'John Secure', email:'john@securesession.test', password_plain:'John@123456', created_at: nowIso() },
        { id:'22222222-2222-4222-8222-222222222222', name:'Paul Private', email:'paul@securesession.test', password_plain:'Paul@123456', created_at: nowIso() }
      ],
      tokens: [],
      sessions: [],
      messages: []
    }, null, 2));
  }
}
function localRead(){ ensureLocal(); return JSON.parse(fs.readFileSync(LOCAL_DB, 'utf8')); }
function localWrite(db){ ensureLocal(); fs.writeFileSync(LOCAL_DB, JSON.stringify(db, null, 2)); }
function publicUser(u){ return u ? { id:u.id, name:u.name, email:u.email, created_at:u.created_at } : null; }

async function findUserByEmail(email){
  const e = String(email || '').trim().toLowerCase();
  if(useSupabase()){
    const rows = await sb('ss_users', `?email=eq.${encodeURIComponent(e)}&select=*`);
    return rows[0] || null;
  }
  return localRead().users.find(u => String(u.email).toLowerCase() === e) || null;
}
async function getUserById(id){
  if(useSupabase()){
    const rows = await sb('ss_users', `?id=eq.${encodeURIComponent(id)}&select=*`);
    return rows[0] || null;
  }
  return localRead().users.find(u => u.id === id) || null;
}
async function createToken(userId){
  const token = uid('tok');
  const expires_at = new Date(Date.now() + 1000*60*60*24*7).toISOString();
  if(useSupabase()) await sb('ss_auth_tokens', '', { method:'POST', prefer:'return=representation', body:[{ token, user_id:userId, expires_at }] });
  else { const db = localRead(); db.tokens.push({ token, user_id:userId, expires_at, created_at:nowIso() }); localWrite(db); }
  return token;
}
async function authUser(token){
  if(!token) return null;
  if(useSupabase()){
    const rows = await sb('ss_auth_tokens', `?token=eq.${encodeURIComponent(token)}&expires_at=gt.${encodeURIComponent(nowIso())}&select=user_id`);
    return rows[0] ? await getUserById(rows[0].user_id) : null;
  }
  const db = localRead();
  const t = db.tokens.find(x => x.token === token && new Date(x.expires_at) > new Date());
  return t ? db.users.find(u => u.id === t.user_id) || null : null;
}
async function listContacts(meId){
  if(useSupabase()){
    const rows = await sb('ss_users', `?id=neq.${encodeURIComponent(meId)}&select=id,name,email,created_at&order=name.asc`);
    return rows.map(publicUser);
  }
  return localRead().users.filter(u => u.id !== meId).map(publicUser);
}
function pairKey(a,b){ return [a,b].sort().join('__'); }
async function openSession(meId, otherId){
  if(!otherId) throw new Error('Contact required');
  if(meId === otherId) throw new Error('Cannot open a session with yourself');
  const other = await getUserById(otherId);
  if(!other) throw new Error('Contact not found');
  const pk = pairKey(meId, otherId);
  if(useSupabase()){
    let rows = await sb('ss_sessions', `?pair_key=eq.${encodeURIComponent(pk)}&select=*`);
    if(rows[0]) return rows[0];
    const sorted = [meId, otherId].sort();
    const session = { id: uid('sess'), pair_key: pk, user_a_id: sorted[0], user_b_id: sorted[1], status:'active', updated_at: nowIso() };
    try {
      rows = await sb('ss_sessions', '', { method:'POST', prefer:'return=representation', body:[session] });
      return rows[0];
    } catch(e){
      rows = await sb('ss_sessions', `?pair_key=eq.${encodeURIComponent(pk)}&select=*`);
      if(rows[0]) return rows[0];
      throw e;
    }
  }
  const db = localRead();
  let s = db.sessions.find(x => x.pair_key === pk);
  if(!s){ const sorted = [meId, otherId].sort(); s = { id:uid('sess'), pair_key:pk, user_a_id:sorted[0], user_b_id:sorted[1], status:'active', created_at:nowIso(), updated_at:nowIso() }; db.sessions.push(s); localWrite(db); }
  return s;
}
async function getSession(sessionId){
  if(useSupabase()){
    const rows = await sb('ss_sessions', `?id=eq.${encodeURIComponent(sessionId)}&select=*`);
    return rows[0] || null;
  }
  return localRead().sessions.find(s => s.id === sessionId) || null;
}
function isParticipant(session, userId){ return !!session && (session.user_a_id === userId || session.user_b_id === userId); }
async function getPeer(session, userId){
  if(!session) return null;
  const peerId = session.user_a_id === userId ? session.user_b_id : session.user_a_id;
  return await getUserById(peerId);
}
async function listMessages(sessionId){
  if(useSupabase()) return await sb('ss_messages', `?session_id=eq.${encodeURIComponent(sessionId)}&select=*&order=created_at.asc`);
  return localRead().messages.filter(m => m.session_id === sessionId).sort((a,b)=>String(a.created_at).localeCompare(String(b.created_at)));
}
async function touchSession(sessionId){
  const updated_at = nowIso();
  if(useSupabase()) await sb('ss_sessions', `?id=eq.${encodeURIComponent(sessionId)}`, { method:'PATCH', prefer:'return=minimal', body:{ updated_at } });
  else { const db = localRead(); const s = db.sessions.find(x => x.id === sessionId); if(s){ s.updated_at = updated_at; localWrite(db); } }
}
async function insertMessage(sessionId, senderId, kind, encryptedEnvelope){
  const allowed = new Set(['text','voice','image','video','document']);
  const finalKind = allowed.has(kind) ? kind : 'text';
  const message = { id: uid('msg'), session_id:sessionId, sender_user_id:senderId, kind:finalKind, encrypted_envelope:encryptedEnvelope, delivered_at:null, read_at:null, created_at:nowIso() };
  let saved = message;
  if(useSupabase()){
    const rows = await sb('ss_messages', '', { method:'POST', prefer:'return=representation', body:[message] });
    saved = rows[0];
  } else {
    const db = localRead(); db.messages.push(message); localWrite(db);
  }
  await touchSession(sessionId).catch(()=>{});
  return saved;
}
async function markRead(sessionId, userId){
  const at = nowIso();
  if(useSupabase()){
    await sb('ss_messages', `?session_id=eq.${encodeURIComponent(sessionId)}&sender_user_id=neq.${encodeURIComponent(userId)}`, { method:'PATCH', prefer:'return=minimal', body:{ delivered_at:at, read_at:at } });
    return;
  }
  const db = localRead();
  let changed = false;
  for(const m of db.messages){
    if(m.session_id === sessionId && m.sender_user_id !== userId){
      if(!m.delivered_at) m.delivered_at = at;
      if(!m.read_at) m.read_at = at;
      changed = true;
    }
  }
  if(changed) localWrite(db);
}
function publicMessage(m){
  return { id:m.id, sessionId:m.session_id, senderUserId:m.sender_user_id, kind:m.kind, encryptedEnvelope:m.encrypted_envelope, deliveredAt:m.delivered_at, readAt:m.read_at, createdAt:m.created_at };
}
function publicSession(session){
  return session ? { id:session.id, pairKey:session.pair_key, userAId:session.user_a_id, userBId:session.user_b_id, status:session.status, createdAt:session.created_at, updatedAt:session.updated_at } : null;
}
function broadcast(sessionId, event, payload, exceptUserId=null){
  const set = liveClients.get(sessionId);
  if(!set) return;
  const dead = [];
  for(const c of set){
    if(exceptUserId && c.userId === exceptUserId) continue;
    try { c.res.write(`event: ${event}\ndata: ${safeJsonString(payload)}\n\n`); }
    catch { dead.push(c); }
  }
  for(const c of dead) set.delete(c);
}

async function handleApi(req, res, urlObj){
  try {
    const p = urlObj.pathname;
    if(req.method === 'OPTIONS'){
      res.writeHead(204, { 'Access-Control-Allow-Origin':'*', 'Access-Control-Allow-Headers':'Content-Type, Authorization', 'Access-Control-Allow-Methods':'GET,POST,PATCH,OPTIONS' });
      return res.end();
    }
    if(req.method === 'GET' && p === '/api/health'){
      return json(res, 200, { ok:true, app:'Cloakr', version:VERSION, release:RELEASE, ui:'V10.2 MOBILE FIXED LIGHT MESSENGER UI WITH COMPOSER + HIDE SIDEBAR', live:'SSE + 800ms polling fallback', storage:useSupabase() ? 'supabase-rest' : 'local-json-fallback' });
    }
    if(req.method === 'GET' && p === '/api/db-status'){
      const cfg = supabaseConfig();
      if(!cfg.ok) return json(res, 200, { ok:false, mode:'local-json-fallback', version:VERSION, release:RELEASE, message:'Supabase env not set on this Node app. Local testing mode is active.' });
      try {
        const rows = await sb('ss_users', '?select=id,email&limit=2');
        return json(res, 200, { ok:true, mode:'supabase-rest', version:VERSION, release:RELEASE, sampleUsers:rows.length });
      } catch(e){
        return json(res, 200, { ok:false, mode:'supabase-rest-error', version:VERSION, release:RELEASE, error:e.message });
      }
    }
    if(req.method === 'GET' && p === '/api/version') return json(res, 200, { ok:true, version:VERSION, release:RELEASE });

    if(req.method === 'POST' && p === '/api/login'){
      const body = await readBody(req);
      const email = String(body.email || '').trim().toLowerCase();
      const password = String(body.password || '');
      const user = await findUserByEmail(email);
      if(!user || String(user.password_plain) !== password) return json(res, 401, { ok:false, error:'Invalid email or password' });
      const token = await createToken(user.id);
      res.setHeader('Set-Cookie', `cloakr_token=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`);
      return json(res, 200, { ok:true, token, user:publicUser(user), version:VERSION, release:RELEASE });
    }
    if(req.method === 'POST' && p === '/api/logout'){
      res.setHeader('Set-Cookie', 'cloakr_token=; Path=/; Max-Age=0; SameSite=Lax');
      return json(res, 200, { ok:true });
    }

    const user = await authUser(getToken(req, urlObj));
    if(!user) return json(res, 401, { ok:false, error:'Unauthorized. Login again.' });

    if(req.method === 'GET' && p === '/api/me') return json(res, 200, { ok:true, user:publicUser(user), version:VERSION, release:RELEASE });
    if(req.method === 'GET' && p === '/api/contacts') return json(res, 200, { ok:true, contacts:await listContacts(user.id), version:VERSION, release:RELEASE });

    if(req.method === 'POST' && p === '/api/sessions/open'){
      const body = await readBody(req);
      const session = await openSession(user.id, String(body.otherUserId || ''));
      const peer = await getPeer(session, user.id);
      const token = getToken(req, urlObj);
      return json(res, 200, { ok:true, session:publicSession(session), peer:publicUser(peer), chatUrl:`/chat.html?sessionId=${encodeURIComponent(session.id)}&token=${encodeURIComponent(token)}&v=10200`, version:VERSION, release:RELEASE });
    }
    if(req.method === 'GET' && p === '/api/session'){
      const sessionId = urlObj.searchParams.get('sessionId') || '';
      const session = await getSession(sessionId);
      if(!isParticipant(session, user.id)) return json(res, 403, { ok:false, error:'Not a participant' });
      const peer = await getPeer(session, user.id);
      return json(res, 200, { ok:true, session:publicSession(session), peer:publicUser(peer), me:publicUser(user), version:VERSION, release:RELEASE });
    }
    if(req.method === 'GET' && p === '/api/messages'){
      const sessionId = urlObj.searchParams.get('sessionId') || '';
      const session = await getSession(sessionId);
      if(!isParticipant(session, user.id)) return json(res, 403, { ok:false, error:'Not a participant' });
      await markRead(sessionId, user.id);
      const messages = (await listMessages(sessionId)).map(publicMessage);
      broadcast(sessionId, 'status', { type:'read', readerUserId:user.id, at:nowIso(), version:VERSION });
      return json(res, 200, { ok:true, messages, session:publicSession(session), version:VERSION, release:RELEASE });
    }
    if(req.method === 'POST' && p === '/api/messages'){
      const body = await readBody(req);
      if(Object.prototype.hasOwnProperty.call(body, 'body') || Object.prototype.hasOwnProperty.call(body, 'text') || Object.prototype.hasOwnProperty.call(body, 'plaintext')){
        return json(res, 400, { ok:false, error:'Plaintext rejected. Send encryptedEnvelope only.' });
      }
      const sessionId = String(body.sessionId || '');
      const session = await getSession(sessionId);
      if(!isParticipant(session, user.id)) return json(res, 403, { ok:false, error:'Not a participant' });
      const env = body.encryptedEnvelope;
      if(!env || typeof env !== 'object' || !env.ciphertext) return json(res, 400, { ok:false, error:'encryptedEnvelope.ciphertext required' });
      const kind = String(body.kind || env.kind || 'text');
      const saved = await insertMessage(sessionId, user.id, kind, env);
      const pub = publicMessage(saved);
      broadcast(sessionId, 'message', { message:pub, version:VERSION, release:RELEASE });
      return json(res, 200, { ok:true, message:pub, version:VERSION, release:RELEASE });
    }
    if(req.method === 'POST' && p === '/api/typing'){
      const body = await readBody(req);
      const sessionId = String(body.sessionId || '');
      const session = await getSession(sessionId);
      if(!isParticipant(session, user.id)) return json(res, 403, { ok:false, error:'Not a participant' });
      broadcast(sessionId, 'typing', { sessionId, userId:user.id, name:user.name, isTyping:!!body.isTyping, at:Date.now(), version:VERSION }, user.id);
      return json(res, 200, { ok:true });
    }
    if(req.method === 'GET' && p === '/api/live'){
      const sessionId = urlObj.searchParams.get('sessionId') || '';
      const session = await getSession(sessionId);
      if(!isParticipant(session, user.id)) return json(res, 403, { ok:false, error:'Not a participant' });
      res.writeHead(200, {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
        'Access-Control-Allow-Origin': '*',
        'X-Cloakr-Release': RELEASE,
        'X-Cloakr-Version': VERSION
      });
      const client = { res, userId:user.id, id:uid('live') };
      if(!liveClients.has(sessionId)) liveClients.set(sessionId, new Set());
      liveClients.get(sessionId).add(client);
      res.write(`event: ready\ndata: ${safeJsonString({ ok:true, sessionId, userId:user.id, version:VERSION, release:RELEASE })}\n\n`);
      const hb = setInterval(()=>{ try { res.write(`event: ping\ndata: ${safeJsonString({ t:Date.now(), version:VERSION })}\n\n`); } catch {} }, 12000);
      req.on('close', ()=>{
        clearInterval(hb);
        const set = liveClients.get(sessionId);
        if(set){ set.delete(client); if(!set.size) liveClients.delete(sessionId); }
      });
      return;
    }

    return json(res, 404, { ok:false, error:'API route not found', path:p, version:VERSION, release:RELEASE });
  } catch(e){
    console.error('API error:', e);
    return json(res, 500, { ok:false, error:e.message, version:VERSION, release:RELEASE });
  }
}

const server = http.createServer((req, res)=>{
  const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  if(urlObj.pathname.startsWith('/api/')) return handleApi(req, res, urlObj);
  let pathname = decodeURIComponent(urlObj.pathname);
  if(pathname === '/' || pathname === '/login' || pathname === '/index-v9.html' || pathname === '/index-v10.html') pathname = '/index.html';
  if(pathname === '/dashboard' || pathname === '/app' || pathname === '/dashboard-v9.html' || pathname === '/dashboard-v10.html') pathname = '/dashboard.html';
  if(pathname === '/chat' || pathname === '/chat-v9.html' || pathname === '/chat-v10.html') pathname = '/chat.html';
  const file = path.normalize(path.join(PUBLIC_DIR, pathname));
  serveFile(res, file);
});

server.listen(PORT, '0.0.0.0', ()=>{
  ensureLocal();
  console.log(`${RELEASE} running on port ${PORT}`);
  console.log(`Storage mode: ${useSupabase() ? 'Supabase REST' : 'Local JSON fallback'}`);
});

process.on('uncaughtException', err => { console.error('Uncaught exception kept alive:', err); });
process.on('unhandledRejection', err => { console.error('Unhandled rejection kept alive:', err); });
