const $ = id => document.getElementById(id);
let token = sessionStorage.getItem('cloakr_v10_token') || localStorage.getItem('cloakr_v10_token') || localStorage.getItem('cloakr_token') || '';
let user = JSON.parse(sessionStorage.getItem('cloakr_v10_user') || localStorage.getItem('cloakr_v10_user') || localStorage.getItem('cloakr_user') || 'null');
let contacts = [];
let selectedContactId = '';
if(!token) location.href = '/?v=10000';

function initials(name){ return String(name||'C').trim().split(/\s+/).slice(0,2).map(x=>x[0]).join('').toUpperCase() || 'C'; }
function setConnectMsg(text, ok=false){ const el=$('connectMsg'); if(el){ el.textContent=text||''; el.style.color=ok?'#027a48':'#ef4444'; } }
function authHeaders(){ return {'Content-Type':'application/json', Authorization:'Bearer '+token}; }
async function api(path, opts={}){
  const r = await fetch(path, {...opts, headers:{...authHeaders(), ...(opts.headers||{})}});
  const d = await r.json();
  if(!d.ok) throw new Error(d.error || 'Request failed');
  return d;
}
async function initMe(){
  const d = await api('/api/me?v='+Date.now());
  user = d.user;
  sessionStorage.setItem('cloakr_v10_user', JSON.stringify(user));
  $('welcomeTitle').textContent = `Welcome, ${user.name}`;
}
async function dbStatus(){
  try{
    const d = await (await fetch('/api/db-status?v='+Date.now())).json();
    const badge = $('dbBadge');
    if(d.ok){ badge.textContent = 'Supabase connected • V10'; badge.className='status-pill ok'; }
    else { badge.textContent = 'Local fallback • V10'; badge.className='status-pill warning'; }
  }catch{ $('dbBadge').textContent='Storage check failed'; $('dbBadge').className='status-pill warning'; }
}
function renderContacts(){
  const grid = $('contactsGrid');
  if(!contacts.length){ grid.innerHTML='<p>No contacts found. Run the V10 Supabase SQL first.</p>'; return; }
  grid.innerHTML = contacts.map(c => `
    <article class="contact-card">
      <div style="display:flex;align-items:center;gap:12px"><div class="avatar">${initials(c.name)}</div><div><b>${c.name}</b><span>${c.email}</span></div></div>
      <button class="btn primary" data-open="${c.id}">Start chat</button>
    </article>`).join('');
  grid.querySelectorAll('[data-open]').forEach(btn => btn.onclick = () => openChat(btn.dataset.open, btn));
}
function renderConnectContacts(){
  const box = $('connectContacts');
  if(!contacts.length){ box.innerHTML='<span>No contacts found. Run SQL seed first.</span>'; return; }
  if(!selectedContactId) selectedContactId = contacts[0].id;
  box.innerHTML = contacts.map(c => `
    <button type="button" class="connect-option ${c.id===selectedContactId?'active':''}" data-id="${c.id}">
      <div class="avatar">${initials(c.name)}</div><div><b>${c.name}</b><span>${c.email}</span></div>
    </button>`).join('');
  box.querySelectorAll('.connect-option').forEach(btn => btn.onclick = () => { selectedContactId = btn.dataset.id; renderConnectContacts(); });
}
async function loadContacts(){
  $('contactsGrid').innerHTML='<p>Loading contacts…</p>';
  const d = await api('/api/contacts?v='+Date.now());
  contacts = d.contacts || [];
  selectedContactId = contacts[0]?.id || '';
  renderContacts(); renderConnectContacts();
}
async function openChat(otherUserId, btn){
  const old = btn?.textContent;
  if(btn) btn.textContent = 'Opening…';
  try{
    const d = await api('/api/sessions/open', {method:'POST', body:JSON.stringify({otherUserId})});
    const url = d.chatUrl + '&newUi=V10';
    const opened = window.open(url, '_blank', 'noopener,noreferrer');
    if(!opened) location.href = url;
    if(btn) btn.textContent = 'Opened';
    setConnectMsg('Chat opened in new tab.', true);
  }catch(err){ setConnectMsg(err.message); if(btn) btn.textContent=old||'Start chat'; }
}
$('logoutBtn')?.addEventListener('click', async()=>{ try{ await fetch('/api/logout',{method:'POST'}); }catch{} localStorage.removeItem('cloakr_v10_token'); localStorage.removeItem('cloakr_v10_user'); sessionStorage.clear(); location.href='/?v=10000'; });
$('refreshBtn')?.addEventListener('click',()=>loadContacts().catch(err=>{ $('contactsGrid').innerHTML=`<p style="color:#ef4444;font-weight:900">${err.message}</p>`; }));
$('openConnectModal')?.addEventListener('click',()=>{ $('connectionModal').classList.remove('hidden'); renderConnectContacts(); });
$('closeConnect')?.addEventListener('click',()=>$('connectionModal').classList.add('hidden'));
$('cancelConnect')?.addEventListener('click',()=>$('connectionModal').classList.add('hidden'));
$('startFirstConnection')?.addEventListener('click',()=>{ if(selectedContactId) openChat(selectedContactId); else setConnectMsg('Please select a contact.'); });

(async()=>{ try{ await initMe(); await dbStatus(); await loadContacts(); }catch(err){ alert(err.message); location.href='/?v=10000'; } })();
