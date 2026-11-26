'use strict';
const api = 'https://backend-for-getxh-automation.onrender.com';
const el = id => document.getElementById(id);
const statuses = ['New', 'Contacted', 'Closed'];
let session = '', challenge = '', rows = [];
function notify(message) { el('state').textContent = message; }
function signIn() {
  session = challenge = '';
  rows = [];
  el('list').replaceChildren();
  el('count').textContent = '';
  el('search').value = '';
  el('filter').selectedIndex = 0;
  el('inbox').hidden = true;
  el('postForm').reset(); el('postForm').hidden=true; el('postLibrary').replaceChildren(); el('postSearch').value=''; selectDesk(false);
  el('login').hidden = false;
  authStep(false);
}
function authStep(code) {
  const input = el('credential');
  input.value = '';
  input.type = code ? 'text' : 'password';
  input.inputMode = code ? 'numeric' : 'text';
  input.autocomplete = code ? 'one-time-code' : 'current-password';
  if (code) input.pattern = '[0-9]{6}'; else input.removeAttribute('pattern');
  el('title').textContent = code ? 'Check your email' : 'Admin sign in';
  el('hint').textContent = code ? 'Enter the six-digit code sent to the admin inbox. It expires in five minutes.' : '';
  el('caption').textContent = code ? 'Verification code' : 'Password';
  el('submit').textContent = code ? 'Verify code' : 'Continue';
  el('hint').hidden = !code;

  el('restart').hidden = !code;
  input.focus();
}
async function request(path, body) {
  const headers = {};
  if (session) headers.Authorization = 'Bearer ' + session;
  if (body) headers['Content-Type'] = 'application/json';
  const response = await fetch(api + '/api/' + path, {
    headers, method: body ? 'POST' : 'GET', body: body && JSON.stringify(body), cache:'no-store'
  });
  const data = await response.json();
  if (response.status === 401 && path.startsWith('admin/')) {
    signIn();
    throw Error('Your session expired. Sign in again.');
  }
  if (!response.ok) throw Error(typeof data === 'string' ? data : 'Request failed. Please try again.');
  return data;
}
el('signin').onsubmit = async event => {
  event.preventDefault();
  el('submit').disabled = el('restart').disabled = true;
  notify(challenge ? 'Verifying code…' : 'Checking password…');
  try {
    if (!challenge) {
      challenge = (await request('auth/login', {password:el('credential').value})).challenge;
      authStep(true);
      notify('');
    } else {
      session = (await request('auth/verify', {challenge, code:el('credential').value.trim()})).session;
      el('credential').value = challenge = '';
      el('login').hidden = true;
      el('inbox').hidden = false;
      el('search').focus();
      await load();
    }
  } catch (error) {
    if (error.message === 'Request a new code.') signIn();
    notify(error.message);
  } finally { el('submit').disabled = el('restart').disabled = false; }
};
el('restart').onclick = () => { signIn(); notify(''); };
function node(tag, text, cls) {
  const item = document.createElement(tag);
  item.textContent = text;
  if (cls) item.className = cls;
  return item;
}
function render() {
  const query = el('search').value.trim().toLowerCase();
  const filter = el('filter').value;
  const matches = rows.filter(row => (!el('filter').selectedIndex || row.status === filter) &&
    [row.name,row.business,row.phone,row.email,row.plan].some(value => String(value || '').toLowerCase().includes(query)));
  el('count').textContent = matches.length + ' of ' + rows.length + ' enquiries';
  el('list').replaceChildren();
  if (!matches.length) el('list').append(node('p',rows.length ? 'No matches. Change your search or status filter.' : 'New website enquiries will appear here.'));
  for (const row of matches) {
    const entry = node('details','','entry'), summary = node('summary',''), who = node('span','','who');
    const date = new Date(row.created);
    who.append(node('strong',row.name),node('span',[row.business,row.plan,Number.isNaN(+date) ? '' : date.toLocaleString()].filter(Boolean).join(' · '),'meta'));
    summary.append(who,node('span',row.status,'status'));
    const detail = node('div','','detail');
    detail.append(node('strong',row.phone));
    if (row.email) detail.append(node('p',row.email));
    detail.append(node('p',row.message || 'No message supplied.'));
    const label = node('label','Enquiry status'), select = node('select','');
    for (const status of statuses) select.add(new Option(status,status,false,status===row.status));
    select.onchange = async () => {
      select.disabled = true;
      try {
        await request('admin/status',{id:row.id,status:select.value});
        row.status = select.value;
        summary.querySelector('.status').textContent = row.status;
        if (el('filter').selectedIndex) { render(); el('filter').focus(); }
        notify('Status saved.');
      } catch (error) { select.value = row.status; notify(error.message); }
      finally { select.disabled = false; }
    };
    label.append(select); detail.append(label); entry.append(summary,detail); el('list').append(entry);
  }
}
async function load() {
  const current = session;
  el('refresh').disabled = true;
  notify('Loading enquiries…');
  try {
    const result = await request('admin/enquiries');
    if (!current || current !== session) return;
    rows = result; render(); notify('');
  } catch(error) { notify(error.message); }
  finally { el('refresh').disabled = false; }
}
el('refresh').onclick = load;
el('search').oninput = el('filter').onchange = render;
el('logout').onclick = async () => {
  try { await request('auth/logout',{}); signIn(); notify('Signed out.'); }
  catch { signIn(); notify('Signed out on this device. Server sign-out could not be confirmed.'); }
};
signIn();

const pointerMotion = matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
document.addEventListener('pointermove', event => {
  if (!pointerMotion.matches || el('login').hidden) return;
  const style = document.body.style;
  style.setProperty('--drift-x', ((event.clientX / innerWidth - 0.5) * 16) + 'px');
  style.setProperty('--drift-y', ((event.clientY / innerHeight - 0.5) * 12) + 'px');
}, {passive:true});


let posts = [], editingId;
function selectDesk(blog) {
  el('tabInbox').setAttribute('aria-pressed',String(!blog));
  el('tabBlog').setAttribute('aria-pressed',String(blog));
  el('blogWorkspace').hidden=!blog;
  el('enquiryWorkspace').hidden=blog;
  el('deskTitle').textContent=blog?'Blog posts':'Enquiry inbox';
  el('refresh').onclick=blog?loadPosts:load;
}
function displayPosts(){
  const filter=el('postSearch').value.trim().toLowerCase();
  const list=el('postLibrary');
  list.replaceChildren();
  for(const post of posts.filter(p=>(p.title+' '+p.category).toLowerCase().includes(filter))){
    const row=node('article','','post-row');
    const info=node('div','');
    info.append(node('strong',post.title),node('small',[post.category,post.status==='draft'?'Draft':'Published'].filter(Boolean).join(' � '),'meta'));
    const edit=node('button','Edit');
    edit.onclick=async()=>{try{const record=await request('admin/blog?id='+encodeURIComponent(post.id));if(session && !el('blogWorkspace').hidden)openEditor(record);}catch(e){notify(e.message)}};
    const actions=node('div','','post-actions');
    const remove=node('button','Delete');
    remove.onclick=async()=>{
      if(!confirm('Permanently delete '+post.title+'?'))return;
      try{await request('admin/blog/delete',{id:post.id});await loadPosts();notify('Post deleted.');}catch(e){notify(e.message)}
    };
    actions.append(edit,remove);row.append(info,actions);list.append(row);
  }
  if(!list.children.length) list.append(node('p',filter?'No matching posts.':'Your saved posts will appear here.'));
}
async function loadPosts(){
  const current=session;
  try{const records=await request('admin/blog');if(!current || session!==current || el('blogWorkspace').hidden)return;posts=records;displayPosts();notify('');}
  catch(e){notify(e.message);}
}
function openEditor(post={}){
  const form=el('postForm');
  editingId=post.id || crypto.randomUUID();
  for(const field of ['title','category','cover','excerpt','body']) form.elements[field].value=post[field]||'';
  el('editorHeading').textContent=post.id?'Edit post':'New post';
  form.hidden=false;form.elements.title.focus();
}
el('tabBlog').onclick=()=>{selectDesk(true);loadPosts()};
el('tabInbox').onclick=()=>{selectDesk(false);load()};
el('newPost').onclick=()=>openEditor();
el('cancelPost').onclick=()=>{el('postForm').hidden=true};
el('postSearch').oninput=displayPosts;
el('postForm').onsubmit=async event=>{
  event.preventDefault();
  const form=event.currentTarget;
  if(form.getAttribute('aria-busy')==='true')return;
  form.setAttribute('aria-busy','true');
  const status=event.submitter?.value||'draft';
  try{
    await request('admin/blog',{...Object.fromEntries(new FormData(form)),id:editingId,status});
    form.hidden=true;await loadPosts();notify(status==='draft'?'Draft saved.':'Article published.');
  }catch(e){notify(e.message)}finally{form.removeAttribute('aria-busy')}
};

function refreshPreview(){
 const form=el('postForm');
 el('articlePreview').replaceChildren(node('h2',form.elements.title.value),articleBody(form.elements.body.value));
}
el('preview').ontoggle=refreshPreview;
el('postForm').addEventListener('input',()=>{if(el('preview').open)refreshPreview()});
