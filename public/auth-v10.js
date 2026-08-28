const $ = id => document.getElementById(id);
let token = sessionStorage.getItem('cloakr_v10_token') || localStorage.getItem('cloakr_v10_token') || localStorage.getItem('cloakr_token') || '';
let selectedContactId = '';
let cachedContacts = [];

function setMsg(text, ok=false){ const el=$('loginMsg'); if(el){ el.textContent=text||''; el.style.color=ok?'#027a48':'#ef4444'; } }
function setConnectMsg(text, ok=false){ const el=$('connectMsg'); if(el){ el.textContent=text||''; el.style.color=ok?'#027a48':'#ef4444'; } }
function saveAuth(data){
  token = data.token;
  localStorage.setItem('cloakr_v10_token', data.token);
  localStorage.setItem('cloakr_v10_user', JSON.stringify(data.user));
  localStorage.setItem('cloakr_token', data.token);
  localStorage.setItem('cloakr_user', JSON.stringify(data.user));
  sessionStorage.setItem('cloakr_v10_token', data.token);
  sessionStorage.setItem('cloakr_v10_user', JSON.stringify(data.user));
}
async function api(path, opts={}){
  const r = await fetch(path, {...opts, headers:{'Content-Type':'application/json', Authorization:'Bearer '+token, ...(opts.headers||{})}});
  const d = await r.json();
  if(!d.ok) throw new Error(d.error || 'Request failed');
  return d;
}
function initials(name){ return String(name||'C').trim().split(/\s+/).slice(0,2).map(x=>x[0]).join('').toUpperCase() || 'C'; }
function openModal(){ $('connectionModal').classList.remove('hidden'); $('connectionModal').setAttribute('aria-hidden','false'); loadContactsForModal().catch(err=>setConnectMsg(err.message)); }
function closeModal(){ $('connectionModal').classList.add('hidden'); $('connectionModal').setAttribute('aria-hidden','true'); }
function renderConnectContacts(){
  const box = $('connectContacts');
  if(!cachedContacts.length){ box.innerHTML = '<span>No contacts found. Run the Supabase SQL seed first.</span>'; return; }
  if(!selectedContactId) selectedContactId = cachedContacts[0].id;
  box.innerHTML = cachedContacts.map(c => `
    <button type="button" class="connect-option ${c.id===selectedContactId?'active':''}" data-id="${c.id}">
      <div class="avatar">${initials(c.name)}</div><div><b>${c.name}</b><span>${c.email}</span></div>
    </button>`).join('');
  box.querySelectorAll('.connect-option').forEach(btn => btn.onclick = () => { selectedContactId = btn.dataset.id; renderConnectContacts(); });
}
async function loadContactsForModal(){
  setConnectMsg('Loading contacts…', true);
  const d = await api('/api/contacts?v='+Date.now());
  cachedContacts = d.contacts || [];
  selectedContactId = cachedContacts[0]?.id || '';
  renderConnectContacts();
  setConnectMsg('', true);
}
async function startConnection(){
  if(!selectedContactId) return setConnectMsg('Please select a contact first.');
  setConnectMsg('Starting secure connection…', true);
  const d = await api('/api/sessions/open', {method:'POST', body:JSON.stringify({otherUserId:selectedContactId})});
  const url = d.chatUrl + '&newUi=V10';
  const opened = window.open(url, '_blank', 'noopener,noreferrer');
  setConnectMsg(opened ? 'Chat opened in new tab.' : 'Popup blocked. Opening in this tab…', true);
  if(!opened) location.href = url;
}

$('demoJohn')?.addEventListener('click',()=>{ $('email').value='john@securesession.test'; $('password').value='John@123456'; });
$('demoPaul')?.addEventListener('click',()=>{ $('email').value='paul@securesession.test'; $('password').value='Paul@123456'; });
$('closeConnect')?.addEventListener('click', closeModal);
$('openDashboard')?.addEventListener('click',()=>{ location.href='/dashboard?v=10000'; });
$('startFirstConnection')?.addEventListener('click', startConnection);

$('loginForm')?.addEventListener('submit', async e => {
  e.preventDefault();
  setMsg('Logging in…', true);
  try{
    const r = await fetch('/api/login?v='+Date.now(), {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({email:$('email').value.trim(), password:$('password').value})});
    const data = await r.json();
    if(!data.ok) throw new Error(data.error || 'Login failed');
    saveAuth(data);
    setMsg('Login successful. Opening connection popup…', true);
    openModal();
  }catch(err){ setMsg(err.message); }
});

(async()=>{
  if(!token) return;
  try{
    const r = await fetch('/api/me?v='+Date.now(), {headers:{Authorization:'Bearer '+token}});
    if(r.ok){ const d=await r.json(); if(d.ok){ sessionStorage.setItem('cloakr_v10_user', JSON.stringify(d.user)); } }
  }catch{}
})();
