const qs=(s,c=document)=>c.querySelector(s);
const qsa=(s,c=document)=>[...c.querySelectorAll(s)];
const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');

// Accessible liquid-glass navigation. The panel lives outside the transformed header,
// so fixed positioning is always anchored to the viewport.
const menuBtn=qs('.menu-button');
const menu=qs('#siteMenu');
const backdrop=qs('.menu-backdrop');
let menuReturnFocus=null;

function menuFocusable(){
  return menu?qsa('a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"])',menu):[];
}
function setMenu(open,{restoreFocus=true}={}){
  if(!menu)return;
  if(open){
    menuReturnFocus=document.activeElement;
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
    if(restoreFocus&&menuReturnFocus instanceof HTMLElement)menuReturnFocus.focus({preventScroll:true});
  }
}
menuBtn?.addEventListener('click',()=>setMenu(!menu?.classList.contains('open')));
qsa('[data-menu-close]').forEach(el=>el.addEventListener('click',()=>setMenu(false)));
qsa('a',menu).forEach(a=>a.addEventListener('click',()=>setMenu(false,{restoreFocus:false})));

document.addEventListener('keydown',event=>{
  if(event.key==='Escape'){
    if(menu?.classList.contains('open'))setMenu(false);
    else if(qs('#projectDialog')?.open)qs('#projectDialog').close();
    return;
  }
  if(event.key==='Tab'&&menu?.classList.contains('open')){
    const focusable=menuFocusable();
    if(!focusable.length)return;
    const first=focusable[0],last=focusable[focusable.length-1];
    if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
    else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
  }
});

// Native document scrolling is preserved. Smooth motion is only requested after an explicit CTA.
qsa('[data-scroll]').forEach(button=>button.addEventListener('click',()=>{
  const target=qs(button.dataset.scroll);
  if(menu?.classList.contains('open'))setMenu(false,{restoreFocus:false});
  const dialog=qs('#projectDialog');
  if(dialog?.open)dialog.close();
  target?.scrollIntoView({behavior:reducedMotion.matches?'auto':'smooth',block:'start'});
}));

// One-shot reveals: no scroll hijack, no parallax, no scroll position writes.
if(reducedMotion.matches){
  qsa('.reveal').forEach(el=>el.classList.add('visible'));
}else if('IntersectionObserver' in window){
  const revealObserver=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },{threshold:.1,rootMargin:'0px 0px -7% 0px'});
  qsa('.reveal').forEach(el=>revealObserver.observe(el));
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
qsa('.project-open').forEach(button=>button.addEventListener('click',()=>{
  const card=button.closest('[data-project]');
  const data=projectData[card?.dataset.project];
  if(!dialog||!data)return;
  dialogOpener=button;
  const image=qs('#dialogImage');
  image.src=data.image;
  image.alt=data.alt;
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
dialog?.addEventListener('click',event=>{
  const rect=dialog.getBoundingClientRect();
  if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)dialog.close();
});
dialog?.addEventListener('close',()=>{
  if(dialogOpener instanceof HTMLElement)dialogOpener.focus({preventScroll:true});
});

// Consultation flow restored from the selected VeroSpace project.
const form=qs('#consultationForm');
const formStatus=qs('#formStatus');
const sendOverlay=qs('#sendOverlay');
const sendSymbol=qs('#sendSymbol');
const sendStatus=qs('#sendStatus');
const sendNote=qs('#sendNote');
const SEND_MIN_MS=3000;
const NETWORK_MAX_MS=15000;
const RESULT_HOLD_MS=3000;
let consultationSending=false;
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const requiredFields=form?qsa('[required]',form):[];

function fieldErrorElement(field){
  return form?.querySelector(`[data-error-for="${field.name}"]`);
}
function validateConsultationField(field){
  let message='';
  if(field.validity.valueMissing)message='Please fill this required field.';
  else if(field.type==='email'&&field.validity.typeMismatch)message='Please enter a valid email address.';
  else if(field.validity.tooShort)message='Please enter at least 3 characters.';
  const errorEl=fieldErrorElement(field);
  const label=field.closest('label');
  const invalid=Boolean(message);
  field.setAttribute('aria-invalid',String(invalid));
  label?.classList.toggle('has-error',invalid);
  if(errorEl){
    errorEl.textContent=message;
    errorEl.classList.toggle('show',invalid);
  }
  return !invalid;
}
function validateConsultationForm(){
  let firstInvalid=null;
  requiredFields.forEach(field=>{
    if(!validateConsultationField(field)&&!firstInvalid)firstInvalid=field;
  });
  return firstInvalid;
}
requiredFields.forEach(field=>{
  const refresh=()=>{
    if(field.closest('label')?.classList.contains('has-error'))validateConsultationField(field);
  };
  field.addEventListener('input',refresh);
  field.addEventListener('change',refresh);
});

function setSendState(state){
  if(!sendOverlay||!sendSymbol||!sendStatus)return;
  sendOverlay.dataset.state=state;
  sendSymbol.className=`send-symbol is-${state}`;
  const copy={
    sending:['Sending…','Your request stays inside VeroSpace.'],
    success:['Succeeded','Your consultation request was sent successfully.'],
    failed:['Failed','We could not send the request. Your form has been kept.'],
    offline:['Offline','No connection was found. Your form has been kept.']
  }[state];
  sendStatus.textContent=copy[0];
  if(sendNote)sendNote.textContent=copy[1];
}
function openSendOverlay(){
  if(!sendOverlay)return;
  document.documentElement.classList.add('send-lock');
  sendOverlay.classList.add('open');
  sendOverlay.setAttribute('aria-hidden','false');
}
function closeSendOverlay(){
  if(!sendOverlay)return;
  sendOverlay.classList.remove('open');
  sendOverlay.setAttribute('aria-hidden','true');
  document.documentElement.classList.remove('send-lock');
}
async function holdUntil(startedAt,minMs){
  const remaining=minMs-(performance.now()-startedAt);
  if(remaining>0)await wait(remaining);
}
async function sendAttempt(payload,requestId,timeoutMs){
  const controller=new AbortController();
  const timeout=setTimeout(()=>controller.abort(),timeoutMs);
  try{
    const response=await fetch('/api/consultation',{
      method:'POST',
      headers:{'Content-Type':'application/json','X-Request-Id':requestId},
      body:JSON.stringify({...payload,requestId}),
      signal:controller.signal,
      cache:'no-store'
    });
    const data=await response.json().catch(()=>({}));
    if(response.ok&&data.ok)return {ok:true};
    return {ok:false,network:false,status:response.status};
  }catch(error){
    return {ok:false,network:true,error};
  }finally{
    clearTimeout(timeout);
  }
}
async function sendWithNetworkWindow(payload,requestId,startedAt){
  while(performance.now()-startedAt<NETWORK_MAX_MS){
    if(!navigator.onLine){
      await Promise.race([
        new Promise(resolve=>window.addEventListener('online',resolve,{once:true})),
        wait(900)
      ]);
      continue;
    }
    const remaining=Math.max(1000,NETWORK_MAX_MS-(performance.now()-startedAt));
    const attempt=await sendAttempt(payload,requestId,Math.min(5000,remaining));
    if(attempt.ok)return 'success';
    if(!attempt.network)return 'failed';
    await wait(700);
  }
  return 'offline';
}

form?.addEventListener('submit',async event=>{
  event.preventDefault();
  if(consultationSending)return;
  const firstInvalid=validateConsultationForm();
  if(firstInvalid){
    if(formStatus)formStatus.textContent='Please fill the highlighted required fields.';
    qs('#contact')?.scrollIntoView({behavior:reducedMotion.matches?'auto':'smooth',block:'center'});
    window.setTimeout(()=>firstInvalid.focus({preventScroll:true}),reducedMotion.matches?0:520);
    return;
  }

  const fd=new FormData(form);
  if(fd.get('website'))return;
  consultationSending=true;
  const submitButton=form.querySelector('[type="submit"]');
  if(submitButton)submitButton.disabled=true;
  if(formStatus)formStatus.textContent='';

  const payload={
    name:String(fd.get('name')||'').trim(),
    email:String(fd.get('email')||'').trim(),
    project:String(fd.get('project')||'').trim(),
    budget:String(fd.get('budget')||'').trim(),
    message:String(fd.get('message')||'').trim()
  };
  const requestId=(crypto.randomUUID?.()||`${Date.now()}-${Math.random().toString(16).slice(2)}`).slice(0,72);
  const startedAt=performance.now();
  setSendState('sending');
  openSendOverlay();

  const result=await sendWithNetworkWindow(payload,requestId,startedAt);
  await holdUntil(startedAt,SEND_MIN_MS);
  setSendState(result);
  await wait(RESULT_HOLD_MS);
  closeSendOverlay();

  if(result==='success'){
    form.reset();
    requiredFields.forEach(field=>validateConsultationField(field));
    if(formStatus)formStatus.textContent='Request sent.';
  }else if(formStatus){
    formStatus.textContent=result==='offline'?'Offline — your details are still here.':'Send failed — your details are still here.';
  }
  consultationSending=false;
  if(submitButton)submitButton.disabled=false;
});
