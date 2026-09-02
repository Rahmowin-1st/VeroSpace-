(() => {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const root = document.documentElement;

  const scrollToTarget = selector => {
    const target = $(selector);
    if (!target) return;
    target.scrollIntoView({behavior: reduced.matches ? 'auto' : 'smooth', block:'start'});
  };

  $$('[data-scroll]').forEach(button => button.addEventListener('click', () => {
    closeMenu();
    const dialog = $('#projectDialog');
    if (dialog?.open) dialog.close();
    scrollToTarget(button.dataset.scroll);
  }));

  const menu = $('#siteMenu');
  const menuButton = $('.menu-button');
  const curtain = $('.menu-curtain');
  let menuRestore = null;

  function openMenu(){
    if (!menu || !menuButton || !curtain) return;
    menuRestore = document.activeElement;
    menu.inert = false;
    menu.classList.add('open');
    curtain.classList.add('open');
    menu.setAttribute('aria-hidden','false');
    menuButton.setAttribute('aria-expanded','true');
    document.body.style.overflow = 'hidden';
    $('.menu-close', menu)?.focus({preventScroll:true});
  }
  function closeMenu(){
    if (!menu || !menuButton || !curtain) return;
    menu.classList.remove('open');
    curtain.classList.remove('open');
    menu.setAttribute('aria-hidden','true');
    menuButton.setAttribute('aria-expanded','false');
    menu.inert = true;
    document.body.style.overflow = '';
    if (menuRestore instanceof HTMLElement) menuRestore.focus({preventScroll:true});
  }
  menuButton?.addEventListener('click', () => menu?.classList.contains('open') ? closeMenu() : openMenu());
  $$('[data-menu-close]').forEach(el => el.addEventListener('click', closeMenu));
  $$('.menu-grid a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      if ($('#projectDialog')?.open) $('#projectDialog').close();
      else closeMenu();
    }
    if (event.key !== 'Tab' || !menu?.classList.contains('open')) return;
    const focusable = $$('a[href],button:not([disabled])', menu);
    if (!focusable.length) return;
    const first = focusable[0], last = focusable.at(-1);
    if (event.shiftKey && document.activeElement === first) {event.preventDefault(); last.focus();}
    else if (!event.shiftKey && document.activeElement === last) {event.preventDefault(); first.focus();}
  });

  let lastY = 0, headerTicking = false;
  const header = $('.site-header');
  addEventListener('scroll', () => {
    if (headerTicking) return;
    headerTicking = true;
    requestAnimationFrame(() => {
      const y = scrollY;
      const down = y > lastY + 8;
      const up = y < lastY - 8;
      if (y < 120 || menu?.classList.contains('open')) header?.classList.remove('is-hidden');
      else if (down) header?.classList.add('is-hidden');
      else if (up) header?.classList.remove('is-hidden');
      lastY = y;
      headerTicking = false;
    });
  }, {passive:true});

  const carouselState = new WeakMap();
  const updateCarousel = (carousel, index) => {
    const track = $('.project-track', carousel);
    const slides = $$('figure', track);
    if (!track || !slides.length) return;
    index = Math.max(0, Math.min(slides.length - 1, index));
    carouselState.set(carousel, index);
    track.scrollTo({left:index * track.clientWidth, behavior:reduced.matches ? 'auto' : 'smooth'});
    const count = $('.media-count', carousel);
    if (count) count.textContent = `${String(index+1).padStart(2,'0')} / ${String(slides.length).padStart(2,'0')}`;
    $$('.media-dots i', carousel).forEach((dot, i) => dot.classList.toggle('active', i === index));
  };

  $$('[data-carousel]').forEach(carousel => {
    const track = $('.project-track', carousel);
    carouselState.set(carousel, 0);
    $('[data-prev]', carousel)?.addEventListener('click', event => {event.stopPropagation(); updateCarousel(carousel, (carouselState.get(carousel)||0)-1);});
    $('[data-next]', carousel)?.addEventListener('click', event => {event.stopPropagation(); updateCarousel(carousel, (carouselState.get(carousel)||0)+1);});
    let timer = 0;
    track?.addEventListener('scroll', () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        const index = Math.round(track.scrollLeft / Math.max(1, track.clientWidth));
        carouselState.set(carousel,index);
        const slides = $$('figure', track);
        const count = $('.media-count', carousel);
        if (count) count.textContent = `${String(index+1).padStart(2,'0')} / ${String(slides.length).padStart(2,'0')}`;
        $$('.media-dots i', carousel).forEach((dot,i)=>dot.classList.toggle('active',i===index));
      },80);
    }, {passive:true});
  });

  const selectedGroups = ['.trust-card','.service-card','.process-list>li'];
  selectedGroups.forEach(selector => {
    const nodes = $$(selector);
    nodes.forEach(node => {
      node.classList.add('selectable');
      node.tabIndex = 0;
      const select = () => nodes.forEach(other => other.classList.toggle('is-selected', other === node));
      node.addEventListener('click', select);
      node.addEventListener('keydown', event => {if(event.key==='Enter'||event.key===' '){event.preventDefault();select();}});
    });
  });

  const projectDialog = $('#projectDialog');
  const projectData = new Map();
  $$('.project-card').forEach(card => {
    const key = card.dataset.project;
    const images = $$('.project-track img', card).map(img => ({src:img.currentSrc || img.src, alt:img.alt}));
    const facts = $$('.project-copy dl div', card);
    projectData.set(key, {
      title: $('h3', card)?.textContent?.trim() || 'Project',
      kicker: $('.project-kicker span', card)?.textContent?.trim() || 'Concept study',
      summary: $('.project-summary', card)?.textContent?.trim() || '',
      goal: $('dd', facts[0])?.textContent?.trim() || '',
      decisions: $('dd', facts[1])?.textContent?.trim() || '',
      result: $('dd', facts[2])?.textContent?.trim() || '',
      images
    });
    $('.project-open', card)?.addEventListener('click', () => openProject(key));
  });

  let modalIndex = 0;
  const syncModal = () => {
    const track = $('.modal-track');
    const slides = $$('figure', track);
    if (!track || !slides.length) return;
    modalIndex = Math.max(0, Math.min(slides.length-1, modalIndex));
    track.scrollTo({left:modalIndex*track.clientWidth, behavior:reduced.matches?'auto':'smooth'});
    const count = $('.modal-count');
    if (count) count.textContent = `${String(modalIndex+1).padStart(2,'0')} / ${String(slides.length).padStart(2,'0')}`;
    $$('.modal-dots i').forEach((dot,i)=>dot.classList.toggle('active',i===modalIndex));
  };
  function openProject(key){
    const data = projectData.get(key);
    if (!data || !projectDialog) return;
    $('#modalKicker').textContent = `${data.kicker} · visual reference series`;
    $('#modalTitle').textContent = data.title;
    $('#modalSummary').textContent = data.summary;
    $('#modalGoal').textContent = data.goal;
    $('#modalDecisions').textContent = data.decisions;
    $('#modalResult').textContent = data.result;
    const track = $('.modal-track');
    track.innerHTML = data.images.map(image => `<figure><img src="${image.src}" alt="${image.alt}" decoding="async"></figure>`).join('');
    modalIndex = 0;
    projectDialog.showModal();
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(syncModal);
    $('.modal-close')?.focus({preventScroll:true});
  }
  $('.modal-close')?.addEventListener('click',()=>projectDialog?.close());
  projectDialog?.addEventListener('close',()=>{document.body.style.overflow='';});
  projectDialog?.addEventListener('click',event=>{if(event.target===projectDialog)projectDialog.close();});
  $('[data-modal-prev]')?.addEventListener('click',()=>{modalIndex--;syncModal();});
  $('[data-modal-next]')?.addEventListener('click',()=>{modalIndex++;syncModal();});
  let modalTimer=0;
  $('.modal-track')?.addEventListener('scroll',()=>{clearTimeout(modalTimer);modalTimer=setTimeout(()=>{const track=$('.modal-track');modalIndex=Math.round(track.scrollLeft/Math.max(1,track.clientWidth));syncModal();},90);},{passive:true});

  const preloadCache = window.__verospaceProjectImageCache = new Map();
  const preloadUrls = [...new Set($$('.project-track img').map(img => img.src))];
  let preloadIndex = 0, preloadRunning = 0, scrolling = false, resumeTimer = 0;
  const maxConcurrent = innerWidth <= 768 ? 1 : 2;
  const idle = cb => 'requestIdleCallback' in window ? requestIdleCallback(cb,{timeout:1500}) : setTimeout(()=>cb({didTimeout:true,timeRemaining:()=>8}),100);
  addEventListener('scroll',()=>{scrolling=true;clearTimeout(resumeTimer);resumeTimer=setTimeout(()=>{scrolling=false;schedulePreload();},280);},{passive:true});
  const preloadOne = url => new Promise(resolve => {
    if (preloadCache.has(url)) return resolve();
    const image = new Image();
    image.decoding='async'; image.fetchPriority='low';
    image.onload = () => {preloadCache.set(url,image);resolve();};
    image.onerror = () => {preloadCache.set(url,{failed:true});resolve();};
    image.src=url;
  });
  const pumpPreload = deadline => {
    if (scrolling) return schedulePreload();
    while (preloadIndex < preloadUrls.length && preloadRunning < maxConcurrent && (deadline.didTimeout || deadline.timeRemaining()>4)) {
      const url = preloadUrls[preloadIndex++]; preloadRunning++;
      preloadOne(url).finally(()=>{preloadRunning--;root.dataset.projectPreloadCached=String(preloadCache.size);schedulePreload();});
    }
    if (preloadIndex < preloadUrls.length) schedulePreload();
    else if (!preloadRunning) root.dataset.projectPreload='complete';
  };
  const schedulePreload = () => idle(pumpPreload);
  const beginPreload = () => setTimeout(schedulePreload,800);
  if (document.readyState === 'complete') beginPreload(); else addEventListener('load',beginPreload,{once:true});
  root.dataset.projectPreloadTarget=String(preloadUrls.length);

  const form = $('#consultationForm');
  const status = $('#formStatus');
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const showError = (field, message) => {
    const label = field.closest('label');
    label?.classList.toggle('error', Boolean(message));
    const error = $(`[data-error="${field.name}"]`, form);
    if (error) error.textContent = message || '';
    field.setAttribute('aria-invalid', message ? 'true':'false');
  };
  const validate = () => {
    let first = null;
    const rules = {
      name:v=>v.trim()?'' :'Enter your name.',
      email:v=>emailRe.test(v.trim())?'':'Enter a valid email.',
      project:v=>v?'':'Choose a project type.',
      budget:v=>v?'':'Choose a budget range.',
      message:v=>v.trim().length>=3?'':'Tell us a little about the space.'
    };
    Object.entries(rules).forEach(([name,rule])=>{const field=form.elements[name];const message=rule(field.value||'');showError(field,message);if(message&&!first)first=field;});
    if(first){first.focus();return false;} return true;
  };
  ['input','change'].forEach(type=>form?.addEventListener(type,event=>{const field=event.target;if(field?.name&&$(`[data-error="${field.name}"]`,form))showError(field,'');}));
  form?.addEventListener('submit', async event => {
    event.preventDefault();
    if (form.elements.website?.value) return;
    if (!validate()) {if(status) status.textContent='Check the highlighted fields.'; return;}
    const submit = $('button[type="submit"]', form);
    submit.disabled=true; submit.textContent='Sending…'; if(status) status.textContent='Sending your request securely…';
    const payload = Object.fromEntries(new FormData(form).entries()); delete payload.website; payload.requestId = crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`;
    try{
      const response = await fetch('/api/consultation',{method:'POST',headers:{'Content-Type':'application/json','X-Request-Id':payload.requestId},body:JSON.stringify(payload)});
      if(!response.ok) throw new Error(`HTTP ${response.status}`);
      form.reset(); if(status) status.textContent='Request sent. VeroSpace can now review the essentials.';
    }catch(error){
      console.error('Consultation request failed',error); if(status) status.textContent='Could not send right now. Please try again.';
    }finally{submit.disabled=false;submit.textContent='Request consultation';}
  });

  const loadScript = src => new Promise((resolve,reject)=>{
    const script=document.createElement('script');script.src=src;script.async=true;script.crossOrigin='anonymous';script.onload=resolve;script.onerror=reject;document.head.appendChild(script);
  });
  const initMotion = async () => {
    if (reduced.matches) {root.dataset.motion='reduced'; return;}
    try{
      await loadScript('https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js');
      await loadScript('https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/ScrollTrigger.min.js');
      const {gsap,ScrollTrigger}=window; if(!gsap||!ScrollTrigger) throw new Error('GSAP unavailable');
      gsap.registerPlugin(ScrollTrigger); root.dataset.motion='gsap';
      const tl=gsap.timeline({defaults:{ease:'power3.out'}});
      tl.from('.site-header',{y:-30,opacity:0,scale:.98,duration:.7})
        .from('.hero-image',{scale:1.06,duration:1.2},0)
        .from('.hero-copy .eyebrow',{x:-26,opacity:0,duration:.55},.18)
        .from('.hero h1 span',{x:-42,opacity:0,duration:.8},.28)
        .from('.hero h1 em',{x:48,opacity:0,duration:.82},.36)
        .from('.hero-copy>p:not(.eyebrow)',{y:22,opacity:0,duration:.55},.5)
        .from('.hero-actions>*',{y:18,opacity:0,stagger:.08,duration:.45},.6)
        .from('.hero-reassurance',{scale:.94,opacity:0,duration:.4},.75);
      $$('.reveal').forEach((el,index)=>{
        const variants=[{x:-36,y:8,rotation:-1.2},{x:36,y:4,rotation:1.1},{y:34,scale:.985},{x:-18,y:24,scale:.99}];
        const from=variants[index%variants.length];
        gsap.from(el,{...from,opacity:0,duration:.72,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 88%',once:true}});
      });
      $$('.project-card').forEach((card,index)=>{
        const media=$('.project-media',card), copy=$('.project-copy',card);
        gsap.from(media,{x:index%2?-38:38,scale:.985,opacity:0,duration:.75,scrollTrigger:{trigger:card,start:'top 84%',once:true}});
        gsap.from(copy,{x:index%2?28:-28,opacity:0,duration:.72,delay:.05,scrollTrigger:{trigger:card,start:'top 84%',once:true}});
      });
    }catch(error){root.dataset.motion='static';console.warn('VeroSpace motion fallback',error);}
  };
  initMotion();
})();
