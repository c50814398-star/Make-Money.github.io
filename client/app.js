const API = 'http://localhost:4000/api'; // change to your deploy URL
let token = localStorage.getItem('token');

function setUserUI(user){
  const info = document.getElementById('user-info');
  if(user){
    info.innerHTML = `${user.email} • $${(user.balance||0).toFixed(2)} <button id="btn-logout">Logout</button>`;
    document.getElementById('btn-show-login').style.display='none';
    document.getElementById('btn-show-register').style.display='none';
    document.getElementById('btn-logout').addEventListener('click', ()=> {
      token = null; localStorage.removeItem('token'); window.location.reload();
    });
  } else {
    info.innerHTML = '';
    document.getElementById('btn-show-login').style.display='';
    document.getElementById('btn-show-register').style.display='';
  }
}

async function fetchVideos(){
  const res = await fetch(`${API}/videos`);
  const videos = await res.json();
  const container = document.getElementById('videos');
  container.innerHTML = '';
  videos.forEach(v => container.appendChild(createVideoCard(v)));
}

function createVideoCard(v){
  const el = document.createElement('div');
  el.className = 'card';
  el.innerHTML = `
    <h3>${v.title || 'TikTok video'}</h3>
    <div class="tok-embed">
      <blockquote class="tiktok-embed" cite="${v.url}" data-video-id="">
        <a href="${v.url}">Watch on TikTok</a>
      </blockquote>
    </div>
    <div class="actions">
      <button class="action-btn" data-action="watched" data-video="${v._id}">I Watched</button>
      <button class="action-btn" data-action="liked" data-video="${v._id}">I Liked</button>
      <button class="action-btn" data-action="commented" data-video="${v._id}">I Commented</button>
      <button class="action-btn" data-action="shared" data-video="${v._id}">I Shared</button>
    </div>
    <small>Click the action and attach proof if required.</small>
  `;
  // Attach button listeners
  el.querySelectorAll('.action-btn').forEach(btn => {
    btn.addEventListener('click', ()=> openActionModal(btn.dataset.video, btn.dataset.action));
  });
  return el;
}

function openActionModal(videoId, type){
  showModal(`<h3>Submit ${type}</h3>
    <p>Attach a link or screenshot as proof (required for likes/comments/shares). After submission the admin will review it.</p>
    <input type="text" id="proofUrl" placeholder="Proof URL (link to share or comment)" />
    <input type="file" id="proofFile" />
    <button id="submitAction">Submit</button>
  `);
  document.getElementById('submitAction').addEventListener('click', async ()=>{
    const proofUrl = document.getElementById('proofUrl').value;
    const fileEl = document.getElementById('proofFile');
    const fd = new FormData();
    fd.append('videoId', videoId);
    fd.append('type', type);
    if(proofUrl) fd.append('proofUrl', proofUrl);
    if(fileEl.files[0]) fd.append('proofImg', fileEl.files[0]);
    const res = await fetch(`${API}/actions/submit`, {
      method: 'POST',
      headers: token ? { 'Authorization': 'Bearer ' + token } : {},
      body: fd
    });
    const j = await res.json();
    alert(j.message || 'submitted');
    hideModal();
  });
}

function showModal(html){
  const m = document.getElementById('modal');
  document.getElementById('modal-content').innerHTML = html;
  m.classList.remove('hidden');
  document.getElementById('modal-close').onclick = hideModal;
}
function hideModal(){ document.getElementById('modal').classList.add('hidden'); }

async function showLogin(){
  showModal(`<h3>Login</h3>
    <input id="loginEmail" placeholder="email" />
    <input id="loginPass" placeholder="password" type="password" />
    <button id="doLogin">Login</button>
  `);
  document.getElementById('doLogin').addEventListener('click', async ()=>{
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPass').value;
    const res = await fetch(API + '/auth/login', { method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({email,password})});
    const j = await res.json();
    if(j.token){ token = j.token; localStorage.setItem('token', token); alert('Logged in'); hideModal(); location.reload(); } else alert('Login failed');
  });
}

async function showRegister(){
  showModal(`<h3>Register</h3>
    <input id="regEmail" placeholder="email" />
    <input id="regName" placeholder="display name" />
    <input id="regPass" placeholder="password" type="password" />
    <button id="doReg">Register</button>
  `);
  document.getElementById('doReg').addEventListener('click', async ()=>{
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPass').value;
    const displayName = document.getElementById('regName').value;
    const res = await fetch(API + '/auth/register', { method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({email,password,displayName})});
    const j = await res.json();
    if(j.token){ token = j.token; localStorage.setItem('token', token); alert('Registered'); hideModal(); location.reload(); } else alert('Registration failed: ' + (j.message || JSON.stringify(j)) );
  });
}

document.getElementById('btn-show-login').addEventListener('click', showLogin);
document.getElementById('btn-show-register').addEventListener('click', showRegister);
document.getElementById('modal-close').addEventListener('click', hideModal);

(async function init(){
  if(token){
    // fetch user info quickly by decoding token or calling protected endpoint (not implemented) — we stored minimal user on login response
    // For simplicity: request one protected route to ensure token is valid.
    try{
      const res = await fetch(API + '/videos', { headers: { 'Authorization': 'Bearer ' + token }});
      setUserUI({ email: 'You', balance: 0 });
    }catch(e){}
  }
  await fetchVideos();
})();
