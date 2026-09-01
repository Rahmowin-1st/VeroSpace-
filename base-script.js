const qs=(s,c=document)=>c.querySelector(s);const qsa=(s,c=document)=>[...c.querySelectorAll(s)];

// Premium responsive navigation panel — desktop and mobile are intentionally different.
const menuBtn=qs('.menu-button'),mobileMenu=qs('.mobile-menu'),menuBackdrop=qs('.menu-backdrop');
function setMenu(open,{restoreFocus=false}={}){
  if(!menuBtn||!mobileMenu)return;
  mobileMenu.classList.toggle('open',open);
  menuBackdrop?.classList.toggle('open',open);
  menuBtn.classList.toggle('is-open',open);
  menuBtn.setAttribute('aria-expanded',String(open));
  menuBtn.setAttribute('aria-label',open?'Close menu':'Open menu');
  mobileMenu.setAttribute('aria-hidden',String(!open));
  document.documentElement.classList.toggle('menu-is-open',open);
  if(!open&&restoreFocus)menuBtn.focus({preventScroll:true});
}
menuBtn?.addEventListener('click',()=>setMenu(!mobileMenu.classList.contains('open')));
menuBackdrop?.addEventListener('click',()=>setMenu(false,{restoreFocus:true}));
qsa('a',mobileMenu).forEach(a=>a.addEventListener('click',()=>setMenu(false)));
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&mobileMenu?.classList.contains('open'))setMenu(false,{restoreFocus:true});});
document.addEventListener('pointerdown',e=>{
  if(!mobileMenu?.classList.contains('open'))return;
  if(mobileMenu.contains(e.target)||menuBtn?.contains(e.target))return;
  setMenu(false);
});

// Smooth purposeful navigation
qsa('[data-scroll]').forEach(btn=>btn.addEventListener('click',()=>{const t=qs(btn.dataset.scroll);if(t){setMenu(false);t.scrollIntoView({behavior:'smooth',block:'start'});}}));

// Scroll reveal
const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');io.unobserve(e.target);}}),{threshold:.12,rootMargin:'0px 0px -6% 0px'});qsa('.reveal').forEach(el=>io.observe(el));


// Project modal — every project link has a real action.
const projectData={
  ridge:{title:'Ridge House',text:'A fictional full-home refresh built around better circulation, warmer lighting and a more connected open-plan living zone.',scope:'Whole-home refresh',focus:'Flow · lighting · furnishings'},
  walnut:{title:'Walnut Kitchen',text:'A fictional kitchen renovation using warm timber, stone and integrated lighting to make the room feel architectural rather than purely functional.',scope:'Kitchen renovation',focus:'Joinery · stone · lighting'},
  suite:{title:'Quiet Suite',text:'A fictional primary suite designed around calm materials, hidden storage and softer transitions between sleeping, dressing and working zones.',scope:'Primary suite',focus:'Storage · textiles · styling'}
};
const dialog=qs('#projectDialog');
qsa('.project-open').forEach(btn=>btn.addEventListener('click',()=>{const card=btn.closest('[data-project]');const d=projectData[card.dataset.project];if(!dialog||!d)return;qs('#dialogTitle').textContent=d.title;qs('#dialogText').textContent=d.text;qs('#dialogScope').textContent=d.scope;qs('#dialogFocus').textContent=d.focus;dialog.showModal();}));
qs('.dialog-close')?.addEventListener('click',()=>dialog.close());dialog?.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});
qsa('[data-scroll]',dialog).forEach(btn=>btn.addEventListener('click',()=>{dialog.close();qs(btn.dataset.scroll)?.scrollIntoView({behavior:'smooth'});}));

// Consultation form — secure same-site delivery through /api/consultation.
const form=qs('#consultationForm'),status=qs('#formStatus');
const sendOverlay=qs('#sendOverlay'),sendSymbol=qs('#sendSymbol'),sendStatus=qs('#sendStatus'),sendNote=qs('#sendNote');
const SEND_MIN_MS=3000, NETWORK_MAX_MS=15000, RESULT_HOLD_MS=3000;
let consultationSending=false;
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));

// Branded required-field validation: only fields that need attention are marked.
const requiredFields=form?qsa('[required]',form):[];
function fieldErrorElement(field){return form?.querySelector(`[data-error-for="${field.name}"]`);}
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
  requiredFields.forEach(field=>{if(!validateConsultationField(field)&&!firstInvalid)firstInvalid=field;});
  return firstInvalid;
}
requiredFields.forEach(field=>{
  const refresh=()=>{if(field.closest('label')?.classList.contains('has-error'))validateConsultationField(field);};
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
  }finally{clearTimeout(timeout);}
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

form?.addEventListener('submit',async e=>{
  e.preventDefault();
  if(consultationSending)return;
  const firstInvalid=validateConsultationForm();
  if(firstInvalid){
    if(status)status.textContent='Please fill the highlighted required fields.';
    qs('#contact')?.scrollIntoView({behavior:'smooth',block:'center'});
    window.setTimeout(()=>firstInvalid.focus({preventScroll:true}),520);
    return;
  }
  const fd=new FormData(form);
  if(fd.get('website'))return; // silent honeypot
  consultationSending=true;
  const submitButton=form.querySelector('[type="submit"]');
  if(submitButton)submitButton.disabled=true;
  if(status)status.textContent='';
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

  let result=await sendWithNetworkWindow(payload,requestId,startedAt);
  await holdUntil(startedAt,SEND_MIN_MS);
  setSendState(result);
  await wait(RESULT_HOLD_MS);
  closeSendOverlay();

  if(result==='success'){
    form.reset();
    if(status)status.textContent='Request sent.';
  }else if(status){
    status.textContent=result==='offline'?'Offline — your details are still here.':'Send failed — your details are still here.';
  }
  consultationSending=false;
  if(submitButton)submitButton.disabled=false;
});


// ---------------------------------------------------------
// VeroSpace owns long-press behavior.
// Suppress browser/OS selection, dictionary, share, image and
// context-menu overlays outside visitor-editable fields.
// Add data-allow-select="true" later to any intentional copy area.
// ---------------------------------------------------------
const isVeroNativeEditable = target => {
  const el = target instanceof Element ? target : target?.parentElement;
  return Boolean(el?.closest('input, textarea, [contenteditable="true"], [data-allow-select="true"]'));
};

document.addEventListener('contextmenu', event => {
  if (!isVeroNativeEditable(event.target)) event.preventDefault();
}, { capture: true });

document.addEventListener('selectstart', event => {
  if (!isVeroNativeEditable(event.target)) event.preventDefault();
}, { capture: true });

document.addEventListener('dragstart', event => {
  const el = event.target instanceof Element ? event.target : event.target?.parentElement;
  if (el?.closest('img, svg')) event.preventDefault();
}, { capture: true });

document.addEventListener('selectionchange', () => {
  const selection = window.getSelection?.();
  if (!selection || selection.isCollapsed || !selection.rangeCount) return;
  const anchor = selection.anchorNode instanceof Element
    ? selection.anchorNode
    : selection.anchorNode?.parentElement;
  if (!isVeroNativeEditable(anchor)) selection.removeAllRanges();
});

// Mobile-only refinement: compact the floating header after the first scroll,
// and keep the service accordion focused to one open item at a time.
const mobileViewport=window.matchMedia('(max-width: 767px)');
const siteHeader=qs('.site-header');
let mobileHeaderTick=false;
function syncMobileHeader(){
  mobileHeaderTick=false;
  if(!siteHeader)return;
  siteHeader.classList.toggle('mobile-scrolled',mobileViewport.matches&&window.scrollY>72&&!mobileMenu?.classList.contains('open'));
}
window.addEventListener('scroll',()=>{
  if(mobileHeaderTick)return;
  mobileHeaderTick=true;
  requestAnimationFrame(syncMobileHeader);
},{passive:true});
mobileViewport.addEventListener?.('change',syncMobileHeader);
menuBtn?.addEventListener('click',()=>requestAnimationFrame(syncMobileHeader));
syncMobileHeader();

qsa('.service-item').forEach(item=>item.addEventListener('toggle',()=>{
  if(!mobileViewport.matches||!item.open)return;
  qsa('.service-item').forEach(other=>{if(other!==item&&other.open)other.open=false;});
}));

// ---------------------------------------------------------
// VeroSpace Mobile Scroll Master
// Premium staying + scrolling behavior: progress, active section,
// smart persistent navigation, visual rail controls and subtle depth.
// ---------------------------------------------------------
const vsPageProgress=qs('.vs-page-progress i');
const vsJourneyDock=qs('.mobile-journey-dock');
const vsSectionStatus=qs('.mobile-section-status');
const vsSectionStatusLabel=qs('.mobile-section-status-label');
const vsJourneyLinks=qsa('[data-section-link]');
const vsHero=qs('#home');
const vsHeroImage=qs('#home .hero-media img');
const vsReducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');

const vsMilestones=[
  {id:'home',label:'Home',dock:'home'},
  {id:'projects',label:'Projects',dock:'projects'},
  {id:'services',label:'Services',dock:'services'},
  {id:'process',label:'Process',dock:'process'},
  {id:'contact',label:'Start a project',dock:'contact'}
].map(item=>({...item,el:qs(`#${item.id}`)})).filter(item=>item.el);

let vsLastY=window.scrollY;
let vsScrollRAF=0;
let vsScrollStopTimer=0;
let vsStatusTimer=0;
let vsCurrentSection='home';
let vsFormFocused=false;

function vsSetSectionStatus(label){
  if(!vsSectionStatus||!vsSectionStatusLabel)return;
  vsSectionStatusLabel.textContent=label;
  vsSectionStatus.classList.add('is-visible');
  clearTimeout(vsStatusTimer);
  vsStatusTimer=setTimeout(()=>vsSectionStatus.classList.remove('is-visible'),900);
}

function vsResolveSection(){
  if(!vsMilestones.length)return null;
  const probe=window.scrollY+Math.min(window.innerHeight*.38,320);
  let current=vsMilestones[0];
  for(const item of vsMilestones){
    const top=item.el.getBoundingClientRect().top+window.scrollY;
    if(top<=probe)current=item;
    else break;
  }
  return current;
}

function vsSyncDock(active){
  vsJourneyLinks.forEach(link=>{
    const selected=link.dataset.sectionLink===active?.dock;
    link.classList.toggle('is-active',selected);
    if(selected)link.setAttribute('aria-current','location');
    else link.removeAttribute('aria-current');
  });
  if(!vsJourneyDock)return;
  const pastHero=window.scrollY>Math.min(window.innerHeight*.52,520);
  const atContact=active?.id==='contact';
  const suppressed=vsFormFocused||atContact||mobileMenu?.classList.contains('open')||document.documentElement.classList.contains('send-lock');
  vsJourneyDock.classList.toggle('is-suppressed',suppressed);
  vsJourneyDock.classList.toggle('is-visible',mobileViewport.matches&&pastHero&&!suppressed);
}

function vsUpdateScrollMaster(){
  vsScrollRAF=0;
  if(!mobileViewport.matches){
    document.documentElement.classList.remove('mobile-is-scrolling');
    siteHeader?.classList.remove('mobile-scroll-moving');
    vsJourneyDock?.classList.remove('is-visible','is-suppressed');
    vsSectionStatus?.classList.remove('is-visible');
    if(vsPageProgress)vsPageProgress.style.transform='scaleX(0)';
    return;
  }

  const y=Math.max(0,window.scrollY);
  const max=Math.max(1,document.documentElement.scrollHeight-window.innerHeight);
  const progress=Math.min(1,y/max);
  if(vsPageProgress)vsPageProgress.style.transform=`scaleX(${progress})`;

  const active=vsResolveSection();
  if(active&&active.id!==vsCurrentSection){
    vsCurrentSection=active.id;
    vsMilestones.forEach(item=>item.el.classList.toggle('is-active-section',item.id===active.id));
    vsSetSectionStatus(active.label);
  }
  vsSyncDock(active);

  const delta=y-vsLastY;
  if(Math.abs(delta)>1){
    document.documentElement.classList.add('mobile-is-scrolling');
    siteHeader?.classList.add('mobile-scroll-moving');
    if(vsSectionStatus&&!vsSectionStatus.classList.contains('is-visible'))vsSetSectionStatus(active?.label||'VeroSpace');
  }

  if(vsHero&&vsHeroImage&&!vsReducedMotion.matches){
    const heroRect=vsHero.getBoundingClientRect();
    if(heroRect.bottom>0&&heroRect.top<window.innerHeight){
      const shift=Math.max(-2,Math.min(22,y*.035));
      vsHeroImage.style.setProperty('--hero-shift',`${shift}px`);
    }
  }

  clearTimeout(vsScrollStopTimer);
  vsScrollStopTimer=setTimeout(()=>{
    document.documentElement.classList.remove('mobile-is-scrolling');
    siteHeader?.classList.remove('mobile-scroll-moving');
    vsSectionStatus?.classList.remove('is-visible');
  },150);
  vsLastY=y;
}

function vsQueueScrollMaster(){
  if(vsScrollRAF)return;
  vsScrollRAF=requestAnimationFrame(vsUpdateScrollMaster);
}
window.addEventListener('scroll',vsQueueScrollMaster,{passive:true});
window.addEventListener('resize',vsQueueScrollMaster,{passive:true});
mobileViewport.addEventListener?.('change',vsQueueScrollMaster);
menuBtn?.addEventListener('click',()=>requestAnimationFrame(vsUpdateScrollMaster));
menuBackdrop?.addEventListener('click',()=>requestAnimationFrame(vsUpdateScrollMaster));

// Dock links use VeroSpace's own smooth in-page motion with header-safe targets.
vsJourneyLinks.forEach(link=>link.addEventListener('click',event=>{
  if(!mobileViewport.matches)return;
  const target=qs(link.getAttribute('href'));
  if(!target)return;
  event.preventDefault();
  target.scrollIntoView({behavior:vsReducedMotion.matches?'auto':'smooth',block:'start'});
  vsSetSectionStatus(link.querySelector('small')?.textContent||'VeroSpace');
}));

// Give every horizontal mobile story surface a functional position control.
const vsRailConfigs=[
  ['.project-grid','.project-card','Project'],
  ['.proof-band',':scope > div','Principle'],
  ['.quote-grid-modern','.quote-card','Perspective'],
  ['.reel','figure','Space']
];
const vsRailInstances=[];
function vsNearestRailIndex(scroller,items){
  const center=scroller.scrollLeft+scroller.clientWidth/2;
  let best=0,bestDistance=Infinity;
  items.forEach((item,index)=>{
    const itemCenter=item.offsetLeft+item.offsetWidth/2;
    const distance=Math.abs(itemCenter-center);
    if(distance<bestDistance){best=index;bestDistance=distance;}
  });
  return best;
}
function vsSyncRail(instance){
  const index=vsNearestRailIndex(instance.scroller,instance.items);
  instance.items.forEach((item,i)=>item.classList.toggle('rail-active',i===index));
  instance.buttons.forEach((button,i)=>{
    button.classList.toggle('is-active',i===index);
    button.setAttribute('aria-current',i===index?'true':'false');
  });
}
function vsEnhanceRails(){
  if(!mobileViewport.matches)return;
  vsRailConfigs.forEach(([scrollerSelector,itemSelector,label])=>{
    const scroller=qs(scrollerSelector);
    if(!scroller||scroller.dataset.vsRail==='ready')return;
    const items=itemSelector.startsWith(':scope')?[...scroller.querySelectorAll(itemSelector)]:qsa(itemSelector,scroller);
    if(items.length<2)return;
    scroller.dataset.vsRail='ready';
    const meter=document.createElement('div');
    meter.className='rail-meter';
    meter.setAttribute('aria-label',`${label} position`);
    const buttons=items.map((item,index)=>{
      const button=document.createElement('button');
      button.type='button';
      button.setAttribute('aria-label',`Go to ${label.toLowerCase()} ${index+1}`);
      button.addEventListener('click',()=>{
        const left=item.offsetLeft-(scroller.clientWidth-item.clientWidth)/2;
        scroller.scrollTo({left:Math.max(0,left),behavior:vsReducedMotion.matches?'auto':'smooth'});
      });
      meter.appendChild(button);
      return button;
    });
    scroller.insertAdjacentElement('afterend',meter);
    const instance={scroller,items,buttons,ticking:false};
    scroller.addEventListener('scroll',()=>{
      if(instance.ticking)return;
      instance.ticking=true;
      requestAnimationFrame(()=>{instance.ticking=false;vsSyncRail(instance);});
    },{passive:true});
    vsRailInstances.push(instance);
    requestAnimationFrame(()=>vsSyncRail(instance));
  });
}
vsEnhanceRails();
mobileViewport.addEventListener?.('change',()=>{vsEnhanceRails();vsRailInstances.forEach(vsSyncRail);});

// Keep the floating dock away from the keyboard and editable form surface.
form?.addEventListener('focusin',()=>{vsFormFocused=true;vsUpdateScrollMaster();});
form?.addEventListener('focusout',()=>{
  requestAnimationFrame(()=>{
    vsFormFocused=Boolean(form.contains(document.activeElement));
    vsUpdateScrollMaster();
  });
});

// When a mobile service expands, settle it into a comfortable reading position
// only when it would otherwise sit under the header or below the viewport.
qsa('.service-item').forEach(item=>item.addEventListener('toggle',()=>{
  if(!mobileViewport.matches||!item.open)return;
  setTimeout(()=>{
    const summary=item.querySelector('summary');
    if(!summary)return;
    const rect=summary.getBoundingClientRect();
    if(rect.top<86||rect.bottom>window.innerHeight-110){
      const targetY=window.scrollY+rect.top-112;
      window.scrollTo({top:Math.max(0,targetY),behavior:vsReducedMotion.matches?'auto':'smooth'});
    }
  },120);
}));

vsUpdateScrollMaster();

// ---------------------------------------------------------
// VeroSpace Desktop Master
// Spatial gravity + scroll choreography. Desktop precise-pointer only.
// It never replaces native wheel/touch scrolling; it enriches it.
// ---------------------------------------------------------
const desktopViewport=window.matchMedia('(min-width: 901px) and (hover: hover) and (pointer: fine)');
const desktopJourney=qs('.desktop-journey');
const desktopJourneyProgress=qs('.desktop-journey-track i');
const desktopJourneyCount=qs('.desktop-journey-count');
const desktopJourneyLabel=qs('.desktop-journey-label');
const desktopJourneyLinks=qsa('[data-desktop-section]');
const desktopBackTop=qs('.desktop-back-top');
const desktopPointerLight=qs('.desktop-pointer-light');
const desktopNavLinks=qsa('.desktop-nav a');
const desktopReduced=window.matchMedia('(prefers-reduced-motion: reduce)');

const desktopMilestones=[
  {id:'home',label:'Home',number:'01'},
  {id:'projects',label:'Selected work',number:'02'},
  {id:'services',label:'Services',number:'03'},
  {id:'process',label:'Process',number:'04'},
  {id:'contact',label:'Start a project',number:'05'}
].map(item=>({...item,el:qs(`#${item.id}`)})).filter(item=>item.el);

let desktopScrollRAF=0;
let desktopLastY=window.scrollY;
let desktopScrollTimer=0;
let desktopCurrent='home';
let pointerRAF=0;
let pointerX=-999,pointerY=-999;

function desktopResolveSection(){
  if(!desktopMilestones.length)return null;
  const probe=window.scrollY+Math.min(window.innerHeight*.42,390);
  let current=desktopMilestones[0];
  for(const item of desktopMilestones){
    const top=item.el.getBoundingClientRect().top+window.scrollY;
    if(top<=probe)current=item;else break;
  }
  return current;
}

function desktopSyncNavigation(active){
  if(!active)return;
  desktopJourneyLinks.forEach(link=>{
    const on=link.dataset.desktopSection===active.id;
    link.classList.toggle('is-active',on);
    if(on)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');
  });
  desktopNavLinks.forEach(link=>{
    const href=link.getAttribute('href');
    const on=(active.id==='home'&&href==='#top')||href===`#${active.id}`;
    link.classList.toggle('is-active',on);
  });
  if(desktopJourneyCount)desktopJourneyCount.textContent=active.number;
  if(desktopJourneyLabel)desktopJourneyLabel.textContent=active.label;
}

function desktopUpdateParallax(){
  if(desktopReduced.matches)return;
  const hero=qs('#home');
  const copy=qs('#home .hero-copy');
  const media=qs('#home .hero-media');
  if(hero&&copy&&media){
    const rect=hero.getBoundingClientRect();
    if(rect.bottom>0&&rect.top<window.innerHeight){
      const ratio=Math.max(0,Math.min(1,-rect.top/Math.max(1,rect.height)));
      copy.style.translate=`0 ${Math.round(ratio*28)}px`;
      media.style.translate=`0 ${Math.round(ratio*14)}px`;
    }else if(rect.top>=window.innerHeight){copy.style.translate='';media.style.translate='';}
  }
  qsa('.section-heading').forEach(heading=>{
    const rect=heading.getBoundingClientRect();
    if(rect.bottom<0||rect.top>window.innerHeight)return;
    const center=(rect.top+rect.height/2)-window.innerHeight/2;
    const shift=Math.max(-10,Math.min(10,-center*.018));
    heading.style.translate=`0 ${shift.toFixed(1)}px`;
  });
}

function desktopUpdateScroll(){
  desktopScrollRAF=0;
  if(!desktopViewport.matches){
    desktopJourney?.classList.remove('is-visible');
    siteHeader?.classList.remove('desktop-scrolled');
    document.documentElement.classList.remove('desktop-is-scrolling');
    return;
  }
  const y=Math.max(0,window.scrollY);
  const max=Math.max(1,document.documentElement.scrollHeight-window.innerHeight);
  const progress=Math.min(1,y/max);
  if(desktopJourneyProgress)desktopJourneyProgress.style.transform=`scaleY(${progress})`;
  desktopJourney?.classList.toggle('is-visible',y>Math.min(window.innerHeight*.42,430));
  siteHeader?.classList.toggle('desktop-scrolled',y>118&&!mobileMenu?.classList.contains('open'));

  const active=desktopResolveSection();
  if(active&&active.id!==desktopCurrent){desktopCurrent=active.id;desktopSyncNavigation(active);}
  else if(active)desktopSyncNavigation(active);

  const delta=y-desktopLastY;
  if(Math.abs(delta)>1){
    document.documentElement.classList.add('desktop-is-scrolling');
    clearTimeout(desktopScrollTimer);
    desktopScrollTimer=setTimeout(()=>document.documentElement.classList.remove('desktop-is-scrolling'),150);
  }
  desktopUpdateParallax();
  desktopLastY=y;
}
function desktopQueueScroll(){if(!desktopScrollRAF)desktopScrollRAF=requestAnimationFrame(desktopUpdateScroll);}
window.addEventListener('scroll',desktopQueueScroll,{passive:true});
window.addEventListener('resize',desktopQueueScroll,{passive:true});
desktopViewport.addEventListener?.('change',desktopQueueScroll);
menuBtn?.addEventListener('click',()=>requestAnimationFrame(desktopUpdateScroll));

// Section rail uses native smooth scrolling and respects reduced motion.
desktopJourneyLinks.forEach(link=>link.addEventListener('click',event=>{
  if(!desktopViewport.matches)return;
  const target=qs(link.getAttribute('href'));
  if(!target)return;
  event.preventDefault();
  target.scrollIntoView({behavior:desktopReduced.matches?'auto':'smooth',block:'start'});
}));
desktopBackTop?.addEventListener('click',()=>window.scrollTo({top:0,behavior:desktopReduced.matches?'auto':'smooth'}));

// Pointer-light follows with one RAF and never captures input.
document.addEventListener('pointermove',event=>{
  if(!desktopViewport.matches||desktopReduced.matches)return;
  pointerX=event.clientX;pointerY=event.clientY;
  document.body.classList.add('desktop-pointer-active');
  if(pointerRAF)return;
  pointerRAF=requestAnimationFrame(()=>{
    pointerRAF=0;
    desktopPointerLight?.style.setProperty('--pointer-x',`${pointerX}px`);
    desktopPointerLight?.style.setProperty('--pointer-y',`${pointerY}px`);
  });
},{passive:true});
document.documentElement.addEventListener('mouseleave',()=>document.body.classList.remove('desktop-pointer-active'));

// Magnetic controls: tiny attraction, clamped so layout never jumps.
function desktopMagnetize(el,strength=7){
  if(el.dataset.desktopMagnet==='ready')return;
  el.dataset.desktopMagnet='ready';
  el.addEventListener('pointermove',event=>{
    if(!desktopViewport.matches||desktopReduced.matches)return;
    const r=el.getBoundingClientRect();
    const x=((event.clientX-r.left)/r.width-.5)*2;
    const y=((event.clientY-r.top)/r.height-.5)*2;
    el.style.translate=`${(x*strength).toFixed(1)}px ${(y*strength).toFixed(1)}px`;
  });
  el.addEventListener('pointerleave',()=>{el.style.translate='';});
}
qsa('.pill-button,.hero-dock a,.hero-orb,.desktop-journey-links a,.desktop-back-top,.material-chips span,.material-facts>div,.service-item summary b').forEach(el=>desktopMagnetize(el,el.matches('.pill-button,.hero-orb')?8:5));

// Cursor-aware project and perspective tilt. Decorative only; click/tap behavior stays normal.
function desktopTilt(el,max=4){
  if(el.dataset.desktopTilt==='ready')return;
  el.dataset.desktopTilt='ready';
  el.addEventListener('pointermove',event=>{
    if(!desktopViewport.matches||desktopReduced.matches)return;
    const r=el.getBoundingClientRect();
    const px=(event.clientX-r.left)/r.width;
    const py=(event.clientY-r.top)/r.height;
    const rx=(.5-py)*max*2;
    const ry=(px-.5)*max*2;
    el.style.transform=`perspective(1200px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`;
    el.style.setProperty('--tilt-x',`${(px*100).toFixed(1)}%`);
    el.style.setProperty('--tilt-y',`${(py*100).toFixed(1)}%`);
  });
  el.addEventListener('pointerleave',()=>{el.style.transform='';el.style.removeProperty('--tilt-x');el.style.removeProperty('--tilt-y');});
}
qsa('.project-image').forEach(el=>desktopTilt(el,3.2));
qsa('.quote-card').forEach(el=>desktopTilt(el,2.1));

// Native mouse drag for the project reel. Vertical page scroll remains untouched.
const desktopReel=qs('.reel');
if(desktopReel){
  let drag=false,startX=0,startScroll=0,moved=false;
  desktopReel.addEventListener('pointerdown',event=>{
    if(!desktopViewport.matches||event.button!==0)return;
    drag=true;moved=false;startX=event.clientX;startScroll=desktopReel.scrollLeft;
    desktopReel.setPointerCapture?.(event.pointerId);
  });
  desktopReel.addEventListener('pointermove',event=>{
    if(!drag)return;
    const dx=event.clientX-startX;
    if(Math.abs(dx)>4)moved=true;
    desktopReel.scrollLeft=startScroll-dx*1.08;
  });
  const endDrag=event=>{if(!drag)return;drag=false;desktopReel.releasePointerCapture?.(event.pointerId);};
  desktopReel.addEventListener('pointerup',endDrag);desktopReel.addEventListener('pointercancel',endDrag);
  desktopReel.addEventListener('click',event=>{if(moved){event.preventDefault();event.stopPropagation();moved=false;}},true);
}

// Stagger related reveal groups on desktop; mobile keeps its own faster rhythm.
[
  '.project-grid .reveal','.service-list .reveal','.process-steps .reveal','.quote-grid-modern .reveal'
].forEach(selector=>qsa(selector).forEach((el,index)=>el.style.setProperty('--reveal-delay',`${Math.min(index*80,240)}ms`)));

desktopUpdateScroll();
