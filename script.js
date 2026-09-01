const qs=(s,c=document)=>c.querySelector(s);
const qsa=(s,c=document)=>[...c.querySelectorAll(s)];
const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;

const menuBtn=qs('.menu-button');
const menu=qs('.site-menu');
const backdrop=qs('.menu-backdrop');
let lastFocus=null;

function menuFocusable(){
  return menu?qsa('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])',menu):[];
}
function setMenu(open){
  if(!menu)return;
  if(open){
    lastFocus=document.activeElement;
    menu.inert=false;
  }
  menu.classList.toggle('open',open);
  backdrop?.classList.toggle('open',open);
  menuBtn?.classList.toggle('is-open',open);
  menuBtn?.setAttribute('aria-expanded',String(open));
  menuBtn?.setAttribute('aria-label',open?'Close menu':'Open menu');
  menu.setAttribute('aria-hidden',String(!open));
  document.body.classList.toggle('menu-open',open);
  if(open){
    qs('.menu-close',menu)?.focus({preventScroll:true});
  }else{
    menu.inert=true;
    if(lastFocus instanceof HTMLElement)lastFocus.focus({preventScroll:true});
  }
}
menuBtn?.addEventListener('click',()=>setMenu(!menu.classList.contains('open')));
qsa('[data-menu-close]').forEach(el=>el.addEventListener('click',()=>setMenu(false)));
qsa('a',menu).forEach(a=>a.addEventListener('click',()=>setMenu(false)));

document.addEventListener('keydown',e=>{
  if(e.key==='Escape'){
    if(menu?.classList.contains('open'))setMenu(false);
    if(qs('#projectDialog')?.open)qs('#projectDialog').close();
    return;
  }
  if(e.key==='Tab'&&menu?.classList.contains('open')){
    const focusable=menuFocusable();
    if(!focusable.length)return;
    const first=focusable[0],last=focusable[focusable.length-1];
    if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
    else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
  }
});

qsa('[data-scroll]').forEach(btn=>btn.addEventListener('click',()=>{
  const target=qs(btn.dataset.scroll);
  setMenu(false);
  const dialog=qs('#projectDialog');
  if(dialog?.open)dialog.close();
  target?.scrollIntoView({behavior:reduceMotion?'auto':'smooth',block:'start'});
}));

if(reduceMotion){
  qsa('.reveal').forEach(el=>el.classList.add('visible'));
}else if('IntersectionObserver' in window){
  const io=new IntersectionObserver(entries=>entries.forEach(entry=>{
    if(entry.isIntersecting){entry.target.classList.add('visible');io.unobserve(entry.target);}
  }),{threshold:.1,rootMargin:'0px 0px -6%'});
  qsa('.reveal').forEach(el=>io.observe(el));
}else{
  qsa('.reveal').forEach(el=>el.classList.add('visible'));
}

const projectData={
  daylight:{type:'Whole-home transformation',title:'Daylight House',image:'https://images.unsplash.com/photo-1749704647804-81338ade5546?auto=format&fit=crop&w=1800&q=84',alt:'Bright open kitchen and living area with natural light',text:'A whole-home concept that opens the social spaces while keeping cooking, dining and storage visually ordered.',scope:'Ground floor + shared living zones',focus:'Flow · daylight · integrated storage',result:'A fragmented plan becomes one connected sequence without turning the home into a single undefined room.'},
  oakline:{type:'Kitchen renovation',title:'Oakline Kitchen',image:'https://images.unsplash.com/photo-1771371854543-bb274762389e?auto=format&fit=crop&w=1800&q=84',alt:'Bright white kitchen with warm wood accents and large window',text:'A kitchen renewal built around a clearer work triangle, full-height storage and a restrained white-and-oak palette.',scope:'Kitchen layout + finishes + lighting',focus:'Work surface · storage · warm material balance',result:'Crowded work zones and scattered storage are consolidated into a calmer, more efficient kitchen.'},
  windowroom:{type:'Living-space renewal',title:'Window Room',image:'https://images.unsplash.com/photo-1771371097061-3befd4b71b59?auto=format&fit=crop&w=1800&q=84',alt:'Bright modern living room with white seating, wood floor and large windows',text:'A living-room concept that treats the windows as the main architectural feature and keeps furniture low, light and deliberate.',scope:'Living room + lighting + furniture plan',focus:'Natural light · proportion · circulation',result:'The room stops fighting its strongest asset: daylight becomes the visual anchor while circulation stays clear.'},
  garden:{type:'Ground-floor replan',title:'Garden Dining',image:'https://images.unsplash.com/photo-1771372578232-7c20a006f7b4?auto=format&fit=crop&w=1800&q=84',alt:'Bright dining room with large windows, white walls and warm timber beams',text:'A dining-led concept that aligns movement, table placement and garden views instead of treating them as separate zones.',scope:'Dining + circulation + openings',focus:'Garden connection · dining flow · timber warmth',result:'An awkward pass-through becomes a purposeful dining room with a direct visual and physical relationship to the garden.'},
  quietoak:{type:'Primary-suite redesign',title:'Quiet Oak Suite',image:'https://images.unsplash.com/photo-1765547090903-348b711f0eee?auto=format&fit=crop&w=1800&q=84',alt:'Bright modern bedroom with warm wood accents and natural light',text:'A quieter suite concept using built-in storage, warm timber and controlled contrast to reduce visual noise.',scope:'Bedroom + storage + lighting',focus:'Calm storage · natural materials · soft light',result:'Loose furniture and visual clutter are replaced by built-in function and a more restful room hierarchy.'}
};

const dialog=qs('#projectDialog');
let dialogOpener=null;
qsa('.project-open').forEach(btn=>btn.addEventListener('click',()=>{
  const card=btn.closest('[data-project]');
  const data=projectData[card?.dataset.project];
  if(!dialog||!data)return;
  dialogOpener=btn;
  const image=qs('#dialogImage');
  image.src=data.image;image.alt=data.alt;
  qs('#dialogType').textContent=`VeroSpace concept · ${data.type}`;
  qs('#dialogTitle').textContent=data.title;
  qs('#dialogText').textContent=data.text;
  qs('#dialogScope').textContent=data.scope;
  qs('#dialogFocus').textContent=data.focus;
  qs('#dialogResult').textContent=data.result;
  dialog.showModal();
  qs('.dialog-close',dialog)?.focus({preventScroll:true});
}));
qs('.dialog-close')?.addEventListener('click',()=>dialog.close());
dialog?.addEventListener('click',e=>{
  const r=dialog.getBoundingClientRect();
  if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();
});
dialog?.addEventListener('close',()=>{if(dialogOpener instanceof HTMLElement)dialogOpener.focus({preventScroll:true});});

const form=qs('#consultationForm');
const status=qs('#formStatus');
const overlay=qs('#sendOverlay');
const mark=qs('#sendMark');
const sendTitle=qs('#sendTitle');
const sendText=qs('#sendText');
function fieldError(field,message=''){
  const el=qs(`[data-error-for="${field.name}"]`,form);
  if(el)el.textContent=message;
  field.setAttribute('aria-invalid',String(Boolean(message)));
  return !message;
}
function valid(field){
  let message='';
  if(field.validity.valueMissing)message='Required.';
  else if(field.type==='email'&&field.validity.typeMismatch)message='Enter a valid email.';
  else if(field.validity.tooShort)message='Enter at least 3 characters.';
  return fieldError(field,message);
}
qsa('[required]',form).forEach(field=>['input','change','blur'].forEach(event=>field.addEventListener(event,()=>valid(field))));
function sendState(state){
  if(!overlay)return;
  overlay.classList.add('open');overlay.setAttribute('aria-hidden','false');
  mark.textContent=state==='sending'?'V':state==='success'?'✓':'!';
  sendTitle.textContent=state==='sending'?'Sending…':state==='success'?'Succeeded':'Could not send';
  sendText.textContent=state==='sending'?'Your request is being sent securely.':state==='success'?'Your consultation request was sent successfully.':'Your form has been kept. Try again.';
}
function closeSend(){overlay?.classList.remove('open');overlay?.setAttribute('aria-hidden','true');}
form?.addEventListener('submit',async e=>{
  e.preventDefault();
  const required=qsa('[required]',form);
  const bad=required.find(field=>!valid(field));
  if(bad){bad.focus();status.textContent='Please complete the required fields.';return;}
  const fd=new FormData(form);
  if(fd.get('website'))return;
  const submit=qs('[type="submit"]',form);
  submit.disabled=true;status.textContent='';sendState('sending');
  const payload={
    name:String(fd.get('name')||'').trim(),email:String(fd.get('email')||'').trim(),project:String(fd.get('project')||'').trim(),budget:String(fd.get('budget')||'').trim(),message:String(fd.get('message')||'').trim(),requestId:crypto.randomUUID?.()||String(Date.now())
  };
  try{
    const res=await fetch('/api/consultation',{method:'POST',headers:{'Content-Type':'application/json','X-Request-Id':payload.requestId},body:JSON.stringify(payload)});
    const data=await res.json().catch(()=>({}));
    if(!res.ok||!data.ok)throw new Error('send');
    sendState('success');form.reset();status.textContent='Request sent.';setTimeout(closeSend,1800);
  }catch{
    sendState('error');status.textContent='Send failed — your details are still here.';setTimeout(closeSend,2600);
  }finally{submit.disabled=false;}
});
