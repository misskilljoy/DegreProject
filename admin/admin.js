const config = window.DEGRE_CMS_CONFIG || {};
const isLocalHost = ['localhost', '127.0.0.1'].includes(location.hostname);
const remoteEnabled = Boolean(config.supabaseUrl && config.anonKey && window.supabase);
const client = remoteEnabled ? window.supabase.createClient(config.supabaseUrl, config.anonKey) : null;
const localKey = 'degre-admin-projects-v1';
const adminUsername = 'zhenijoy';
const localPasswordHash = '35ead48abb54165d64d166a77eb573be1a948cc1848642316906e21e99554960';
const allowedImageTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);
const maxImageSize = 15 * 1024 * 1024;
const loginView = document.querySelector('#login-view');
const dashboard = document.querySelector('#dashboard');
const form = document.querySelector('#project-form');
const projectList = document.querySelector('#project-list');
const galleryEditor = document.querySelector('#gallery-editor');
const saveStatus = document.querySelector('#save-status');
let projects = [];
let current = null;
let gallery = [];
let coverUrl = '';
let planUrl = '';
let draggedIndex = null;

const fallbackRows = () => Object.entries(window.PROJECT_DATA || {}).map(([slug, p], index) => ({
  slug, title:p.title, type:p.type, lead:p.lead, project_date:p.date, category:p.category,
  area:p.area, rooms:p.rooms, team:p.team, docs:p.docs, visual:p.visual, cover_url:p.cover,
  plan_url:p.plan || '', plan_note:p.planNote || '', show_plan:p.showPlan !== false,
  gallery:p.gallery || [], city:'', published:true, sort_order:index,
}));

const localLoad = () => {
  try { return JSON.parse(localStorage.getItem(localKey)) || fallbackRows(); }
  catch { return fallbackRows(); }
};
const localSave = rows => localStorage.setItem(localKey, JSON.stringify(rows));
const setStatus = (element, message, error=false) => { element.textContent=message; element.style.color=error?'#8a3028':''; };
const fileToDataUrl = file => new Promise((resolve,reject) => { const r=new FileReader(); r.onload=()=>resolve(r.result); r.onerror=reject; r.readAsDataURL(file); });
const hashPassword = async value => {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return [...new Uint8Array(bytes)].map(byte => byte.toString(16).padStart(2, '0')).join('');
};

async function upload(file, kind) {
  if (!file) throw new Error('Файл не выбран.');
  if (!allowedImageTypes.has(file.type)) throw new Error('Разрешены только JPG, PNG и WebP.');
  if (file.size > maxImageSize) throw new Error('Размер изображения не должен превышать 15 МБ.');
  if (!remoteEnabled) return fileToDataUrl(file);
  const safe = file.name.toLowerCase().replace(/[^a-z0-9._-]+/g,'-');
  const path = `${current?.slug || form.slug.value || 'new'}/${kind}/${crypto.randomUUID()}-${safe}`;
  const { error } = await client.storage.from(config.bucket).upload(path, file, { cacheControl:'31536000', contentType:file.type, upsert:false });
  if (error) throw error;
  return client.storage.from(config.bucket).getPublicUrl(path).data.publicUrl;
}

async function loadProjects() {
  if (remoteEnabled) {
    const { data, error } = await client.from('projects').select('*').order('sort_order');
    if (error) throw error;
    projects = data;
  } else projects = localLoad();
  renderList();
}

function renderList() {
  projectList.replaceChildren(...projects.map(project => {
    const button=document.createElement('button'); button.type='button';
    button.textContent=`${project.published===false?'○':'●'} ${project.title}`;
    button.classList.toggle('is-active', current?.slug===project.slug);
    button.onclick=()=>editProject(project);
    return button;
  }));
}

function preview(target, url, alt) {
  target.replaceChildren();
  if (!url) { target.textContent=alt; return; }
  const image=new Image(); image.src=url; image.alt=''; target.append(image);
}

function editProject(project={}) {
  current = project.slug ? structuredClone(project) : null;
  gallery = [...(project.gallery || [])]; coverUrl=project.cover_url || ''; planUrl=project.plan_url || '';
  form.reset();
  [...form.elements].forEach(el => { if (el.name && project[el.name] !== undefined && el.type!=='checkbox') el.value=project[el.name] ?? ''; });
  form.published.checked=project.published !== false; form.show_plan.checked=project.show_plan !== false;
  document.querySelector('#editor-title').textContent=project.title || 'Новый проект';
  document.querySelector('#delete-project').hidden=!current;
  preview(document.querySelector('#cover-preview'),coverUrl,'Нет обложки');
  preview(document.querySelector('#plan-preview'),planUrl,'Нет планировки');
  renderGallery(); form.hidden=false; renderList(); form.scrollIntoView({block:'start'});
}

function movePhoto(from,to) {
  if (to<0 || to>=gallery.length || from===to) return;
  const [item]=gallery.splice(from,1); gallery.splice(to,0,item); renderGallery();
}

function renderGallery() {
  galleryEditor.replaceChildren(...gallery.map((url,index) => {
    const card=document.createElement('article'); card.className='media-card'; card.draggable=true; card.classList.toggle('is-cover',url===coverUrl);
    const img=new Image(); img.src=url; img.alt=`Фото ${index+1}`; img.loading='lazy';
    const actions=document.createElement('div'); actions.className='media-card__actions';
    const left=document.createElement('button'); left.type='button'; left.textContent='←'; left.title='Переместить влево'; left.onclick=()=>movePhoto(index,index-1);
    const right=document.createElement('button'); right.type='button'; right.textContent='→'; right.title='Переместить вправо'; right.onclick=()=>movePhoto(index,index+1);
    const remove=document.createElement('button'); remove.type='button'; remove.textContent='×'; remove.title='Удалить из галереи'; remove.onclick=()=>{gallery.splice(index,1); if(coverUrl===url)coverUrl=''; renderGallery();};
    const cover=document.createElement('button'); cover.type='button'; cover.className='make-cover'; cover.textContent=url===coverUrl?'Обложка проекта':'Сделать обложкой'; cover.onclick=()=>{coverUrl=url; preview(document.querySelector('#cover-preview'),coverUrl,'Нет обложки'); renderGallery();};
    actions.append(left,right,remove,cover); card.append(img,actions);
    card.ondragstart=()=>{draggedIndex=index}; card.ondragover=e=>e.preventDefault(); card.ondrop=e=>{e.preventDefault();movePhoto(draggedIndex,index)};
    return card;
  }));
}

function formRow() {
  const data=Object.fromEntries(new FormData(form));
  return {...data, slug:data.slug.trim(), sort_order:Number(data.sort_order)||0, published:form.published.checked,
    show_plan:form.show_plan.checked, cover_url:coverUrl, plan_url:planUrl, gallery};
}

document.querySelector('#login-form').onsubmit=async event => {
  event.preventDefault(); const status=document.querySelector('#login-status'); const data=new FormData(event.currentTarget);
  try {
    const username=String(data.get('username')).trim().toLowerCase();
    if (username !== adminUsername) throw new Error('Неверный логин или пароль.');
    if (remoteEnabled) {
      const email=username.includes('@')?username:`${username}@degre.local`;
      const {error}=await client.auth.signInWithPassword({email,password:data.get('password')}); if(error)throw error;
    } else if (!(isLocalHost && await hashPassword(data.get('password'))===localPasswordHash)) {
      throw new Error('Неверный логин или пароль.');
    }
    loginView.hidden=true; dashboard.hidden=false; await loadProjects();
  } catch(error) { setStatus(status,error.message,true); }
};

form.onsubmit=async event => {
  event.preventDefault(); const row=formRow();
  if (!coverUrl) return setStatus(saveStatus,'Выберите обложку проекта.',true);
  try {
    if (remoteEnabled) { const {error}=await client.from('projects').upsert(row,{onConflict:'slug'}); if(error)throw error; }
    else { const oldSlug=current?.slug; projects=projects.filter(p=>p.slug!==oldSlug && p.slug!==row.slug); projects.push(row); projects.sort((a,b)=>a.sort_order-b.sort_order); localSave(projects); }
    current=row; await loadProjects(); editProject(row); setStatus(saveStatus,'Сохранено. Изменения появятся на сайте после обновления страницы.');
  } catch(error) { setStatus(saveStatus,error.message,true); }
};

document.querySelector('#new-project').onclick=()=>editProject({sort_order:projects.length,published:true,show_plan:true,gallery:[]});
document.querySelector('#import-projects').onclick=async()=>{
  if(!confirm('Добавить или обновить в админке все проекты, которые сейчас зашиты в сайт?'))return;
  try{const rows=fallbackRows();if(remoteEnabled){const{error}=await client.from('projects').upsert(rows,{onConflict:'slug'});if(error)throw error}else{projects=rows;localSave(projects)}await loadProjects();alert('Текущие проекты импортированы.')}catch(error){alert(error.message)}
};
document.querySelector('#delete-project').onclick=async()=>{ if(!current||!confirm(`Удалить проект «${current.title}»?`))return; if(remoteEnabled){const{error}=await client.from('projects').delete().eq('slug',current.slug);if(error)return setStatus(saveStatus,error.message,true)}else{projects=projects.filter(p=>p.slug!==current.slug);localSave(projects)}form.hidden=true;current=null;await loadProjects() };
document.querySelector('#logout').onclick=async()=>{if(remoteEnabled)await client.auth.signOut();location.reload()};
document.querySelector('#remove-plan').onclick=()=>{planUrl='';preview(document.querySelector('#plan-preview'),'','Нет планировки')};
document.querySelector('#cover-upload').onchange=async e=>{try{coverUrl=await upload(e.target.files[0],'cover');preview(document.querySelector('#cover-preview'),coverUrl,'Нет обложки')}catch(error){setStatus(saveStatus,error.message,true)}};
document.querySelector('#plan-upload').onchange=async e=>{try{planUrl=await upload(e.target.files[0],'plan');preview(document.querySelector('#plan-preview'),planUrl,'Нет планировки')}catch(error){setStatus(saveStatus,error.message,true)}};
document.querySelector('#gallery-upload').onchange=async e=>{try{setStatus(saveStatus,'Загрузка фотографий…');for(const file of e.target.files)gallery.push(await upload(file,'gallery'));renderGallery();setStatus(saveStatus,`Загружено: ${e.target.files.length}`)}catch(error){setStatus(saveStatus,error.message,true)}};

(async()=>{
  document.querySelector('#demo-note').hidden=remoteEnabled||!isLocalHost;
  document.querySelector('#mode-notice').textContent=remoteEnabled?'Подключено защищённое хранилище Supabase.':'Локальный деморежим: изменения сохраняются только в этом браузере.';
  if(remoteEnabled){const{data}=await client.auth.getSession();if(data.session){loginView.hidden=true;dashboard.hidden=false;await loadProjects()}}
})();
