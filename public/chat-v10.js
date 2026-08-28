const params = new URLSearchParams(location.search);
const sessionId = params.get('sessionId') || params.get('s') || '';
const urlToken = params.get('token') || '';
let token = urlToken || sessionStorage.getItem('cloakr_v10_token') || localStorage.getItem('cloakr_v10_token') || localStorage.getItem('cloakr_token') || '';
if(urlToken){
  sessionStorage.setItem('cloakr_v10_token', urlToken);
  // Important: keep chat tab independent from later logins in the same browser.
  history.replaceState({}, '', `/chat.html?sessionId=${encodeURIComponent(sessionId)}&v=10200&newUi=V10_2`);
}

const $ = id => document.getElementById(id);
let me = null;
let peer = null;
let messages = [];
let es = null;
let pollTimer = null;
let typingTimeout = null;
let lastTyping = 0;
let mediaRecorder = null;
let recordChunks = [];
let recordTimer = null;
let recordStartedAt = 0;
const notified = new Set();

function setAppHeight(){
  const h = (window.visualViewport && window.visualViewport.height) ? window.visualViewport.height : window.innerHeight;
  document.documentElement.style.setProperty('--app-height', `${Math.max(420, Math.floor(h))}px`);
}
function isCompactLayout(){ return window.matchMedia('(max-width: 1180px)').matches; }
function closeSidebar(){ document.body.classList.remove('sidebar-open'); }
function toggleSidebar(){
  if(isCompactLayout()) document.body.classList.toggle('sidebar-open');
  else document.body.classList.toggle('sidebar-collapsed');
}
function setupLayout(){
  setAppHeight();
  if(isCompactLayout()) document.body.classList.remove('sidebar-open');
  window.addEventListener('resize', setAppHeight);
  window.addEventListener('orientationchange', () => setTimeout(setAppHeight, 250));
  if(window.visualViewport) window.visualViewport.addEventListener('resize', setAppHeight);
}


function authHeaders(){ return {'Content-Type':'application/json', Authorization:'Bearer '+token}; }
async function api(path, opts={}){
  const r = await fetch(path, {...opts, headers:{...authHeaders(), ...(opts.headers||{})}});
  const d = await r.json();
  if(!d.ok) throw new Error(d.error || 'Request failed');
  return d;
}
function initials(name){ return String(name||'C').trim().split(/\s+/).slice(0,2).map(x=>x[0]).join('').toUpperCase() || 'C'; }
function escapeHtml(s){ return String(s||'').replace(/[<>&"']/g, c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&#039;'}[c])); }
function b64(str){ return btoa(unescape(encodeURIComponent(str))); }
function unb64(str){ try { return decodeURIComponent(escape(atob(str))); } catch { return ''; } }
function envelope(kind, payload){ return { v:10, app:'Cloakr', kind, ciphertext:b64(JSON.stringify(payload)), createdAt:new Date().toISOString() }; }
function openEnvelope(env){ try { return JSON.parse(unb64(env.ciphertext)); } catch { return { text:'[Encrypted message]' }; } }
function time(t){ try { return new Date(t).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}); } catch { return ''; } }
function tick(m){ if(!me || m.senderUserId !== me.id) return ''; if(m.readAt) return '✓✓ read'; if(m.deliveredAt) return '✓✓ delivered'; return '✓ sent'; }
function mediaHtml(m, p){
  if(m.kind === 'voice') return `<audio controls src="${p.dataUrl || ''}"></audio>`;
  if(m.kind === 'image') return `<img src="${p.dataUrl || ''}" alt="${escapeHtml(p.name || 'image')}" />`;
  if(m.kind === 'video') return `<video controls src="${p.dataUrl || ''}"></video>`;
  if(m.kind === 'document') return `<div class="file-tile"><span>📎</span><div><b>${escapeHtml(p.name || 'Document')}</b><small>${escapeHtml(p.size || '')}</small></div></div>`;
  return escapeHtml(p.text || '');
}
function render(){
  const list = $('messageList');
  if(!messages.length){
    list.innerHTML = `<div class="empty-state"><b>Start the secure conversation</b><span>Send a message, voice note, photo, video or document. Incoming messages will appear live.</span></div>`;
    return;
  }
  list.innerHTML = messages.map(m => {
    const own = me && m.senderUserId === me.id;
    const p = openEnvelope(m.encryptedEnvelope || {});
    return `<div class="message ${own?'out':'in'}"><div class="msg-body">${mediaHtml(m,p)}</div><div class="msg-meta"><span>${time(m.createdAt)}</span><span>${tick(m)}</span></div></div>`;
  }).join('');
  list.scrollTop = list.scrollHeight;
}
function notify(m){
  if(!me || m.senderUserId === me.id || notified.has(m.id)) return;
  notified.add(m.id);
  try{ if(Notification.permission === 'granted' && document.hidden) new Notification('New Cloakr message', { body:'New secure message received' }); }catch{}
  try{
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if(!Ctx) return;
    const ctx = new Ctx(); const osc = ctx.createOscillator(); const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination); osc.frequency.value = 740; gain.gain.value = .025; osc.start();
    setTimeout(()=>{ try{ osc.stop(); ctx.close(); }catch{} }, 140);
  }catch{}
}
function merge(incoming){
  let changed = false;
  for(const m of incoming || []){
    const idx = messages.findIndex(x => x.id === m.id);
    if(idx >= 0) messages[idx] = {...messages[idx], ...m};
    else { messages.push(m); changed = true; notify(m); }
  }
  messages.sort((a,b)=>String(a.createdAt).localeCompare(String(b.createdAt)));
  render();
  return changed;
}
async function loadSession(){
  const d = await api('/api/session?sessionId='+encodeURIComponent(sessionId)+'&v='+Date.now());
  me = d.me; peer = d.peer;
  sessionStorage.setItem('cloakr_v10_user', JSON.stringify(me));
  $('chatTitle').textContent = peer ? peer.name : 'Secure chat';
  $('chatSub').textContent = peer ? `${peer.email} • live session` : 'Live session';
  $('threadName').textContent = peer ? peer.name : 'Secure contact';
  $('threadPreview').textContent = 'Live chat ready';
  $('peerAvatar').textContent = initials(peer?.name || 'C');
  $('sideAvatar').textContent = initials(peer?.name || 'C');
}
async function loadMessages(){
  const d = await api('/api/messages?sessionId='+encodeURIComponent(sessionId)+'&v='+Date.now());
  merge(d.messages || []);
  $('chatSub').textContent = peer ? `${peer.email} • synced ${new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}` : 'Messages synced';
}
function connectLive(){
  if(es) es.close();
  $('liveBadge').textContent = 'Connecting live'; $('liveBadge').className = 'status-pill warning';
  es = new EventSource(`/api/live?sessionId=${encodeURIComponent(sessionId)}&token=${encodeURIComponent(token)}&v=${Date.now()}`);
  es.addEventListener('ready', () => { $('liveBadge').textContent = 'Live connected'; $('liveBadge').className = 'status-pill ok'; });
  es.addEventListener('message', ev => { try { const d = JSON.parse(ev.data); if(d.message) merge([d.message]); } catch {} });
  es.addEventListener('status', () => { loadMessages().catch(()=>{}); });
  es.addEventListener('typing', ev => { try { showTyping(JSON.parse(ev.data)); } catch {} });
  es.onerror = () => { $('liveBadge').textContent = 'Live retry + polling'; $('liveBadge').className = 'status-pill warning'; };
}
function showTyping(d){
  if(!d || !me || d.userId === me.id) return;
  const line = $('typingLine');
  $('typingName').textContent = `${d.name || 'Contact'} is typing…`;
  if(d.isTyping){
    lastTyping = Date.now();
    line.classList.remove('hidden');
    setTimeout(()=>{ if(Date.now() - lastTyping > 1800) line.classList.add('hidden'); }, 2200);
  } else line.classList.add('hidden');
}
function sendTyping(){
  api('/api/typing', {method:'POST', body:JSON.stringify({sessionId, isTyping:true})}).catch(()=>{});
  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(()=>api('/api/typing', {method:'POST', body:JSON.stringify({sessionId, isTyping:false})}).catch(()=>{}), 800);
}
async function send(kind, payload){
  const d = await api('/api/messages', {method:'POST', body:JSON.stringify({sessionId, kind, encryptedEnvelope:envelope(kind, payload)})});
  merge([d.message]);
}
function fileToDataUrl(fileOrBlob){ return new Promise((resolve,reject)=>{ const reader = new FileReader(); reader.onload=()=>resolve(reader.result); reader.onerror=reject; reader.readAsDataURL(fileOrBlob); }); }
async function pickFile(accept, kind){
  const input = $('fileInput');
  input.accept = accept || '';
  input.onchange = async () => {
    const f = input.files && input.files[0];
    if(!f) return;
    if(f.size > 8 * 1024 * 1024){ alert('Keep media under 8 MB for this public release.'); input.value=''; return; }
    try{
      const dataUrl = await fileToDataUrl(f);
      await send(kind, { name:f.name, size:Math.round(f.size/1024)+' KB', type:f.type || 'application/octet-stream', dataUrl });
    }catch(err){ alert(err.message); }
    input.value = '';
  };
  input.click();
}
function startRecordTimer(){
  recordStartedAt = Date.now();
  clearInterval(recordTimer);
  recordTimer = setInterval(()=>{
    const sec = Math.floor((Date.now() - recordStartedAt)/1000);
    $('recordTimer').textContent = `${String(Math.floor(sec/60)).padStart(2,'0')}:${String(sec%60).padStart(2,'0')}`;
  }, 250);
}
function stopRecordTimer(){ clearInterval(recordTimer); $('recordTimer').textContent = '00:00'; }
async function toggleVoice(){
  if(mediaRecorder && mediaRecorder.state === 'recording'){
    mediaRecorder.stop();
    return;
  }
  try{
    const stream = await navigator.mediaDevices.getUserMedia({audio:true});
    recordChunks = [];
    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.ondataavailable = e => { if(e.data && e.data.size) recordChunks.push(e.data); };
    mediaRecorder.onstop = async () => {
      $('recordingBar').classList.add('hidden'); $('voiceBtn').textContent = '🎙'; stopRecordTimer();
      stream.getTracks().forEach(t => t.stop());
      if(!recordChunks.length) return;
      const blob = new Blob(recordChunks, {type:'audio/webm'});
      const dataUrl = await fileToDataUrl(blob);
      await send('voice', { name:'Voice note', size:Math.round(blob.size/1024)+' KB', type:'audio/webm', dataUrl });
    };
    $('recordingBar').classList.remove('hidden'); $('voiceBtn').textContent = '■'; startRecordTimer();
    mediaRecorder.start();
    setTimeout(()=>{ if(mediaRecorder && mediaRecorder.state === 'recording') mediaRecorder.stop(); }, 60000);
  }catch{ alert('Microphone permission is required for voice notes.'); }
}
async function init(){
  setupLayout();
  if(!token || !sessionId){ location.href='/?v=10200'; return; }
  try{ if(Notification.permission === 'default') Notification.requestPermission(); }catch{}
  await loadSession();
  await loadMessages();
  connectLive();
  pollTimer = setInterval(()=>loadMessages().catch(()=>{}), 800);
}

$('sidebarToggle')?.addEventListener('click', toggleSidebar);
$('closeSidebar')?.addEventListener('click', closeSidebar);
$('threadName')?.closest?.('.thread-card')?.addEventListener('click', closeSidebar);
$('backBtn')?.addEventListener('click',()=>{ location.href='/dashboard?v=10200'; });
$('dashboardBtn')?.addEventListener('click',()=>{ location.href='/dashboard?v=10200'; });
$('messageInput')?.addEventListener('input', sendTyping);
$('messageInput')?.addEventListener('keydown', e => { if(e.key === 'Enter' && !e.shiftKey){ e.preventDefault(); $('sendBtn').click(); } });
$('sendBtn')?.addEventListener('click', async()=>{ const input=$('messageInput'); const text=input.value.trim(); if(!text) return; input.value=''; try{ await send('text',{text}); }catch(err){ alert(err.message); } });
$('attachBtn')?.addEventListener('click',()=>pickFile('', 'document'));
$('imageBtn')?.addEventListener('click',()=>pickFile('image/*', 'image'));
$('videoBtn')?.addEventListener('click',()=>pickFile('video/*', 'video'));
$('voiceBtn')?.addEventListener('click', toggleVoice);
$('cancelRecord')?.addEventListener('click',()=>{ if(mediaRecorder && mediaRecorder.state === 'recording'){ mediaRecorder.onstop = () => { $('recordingBar').classList.add('hidden'); $('voiceBtn').textContent='🎙'; stopRecordTimer(); }; mediaRecorder.stop(); } });
window.addEventListener('beforeunload',()=>{ try{ if(es) es.close(); clearInterval(pollTimer); }catch{} });

init().catch(err => { $('chatSub').textContent = err.message; alert(err.message); });
