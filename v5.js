(() => {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');

  const projectDetails = {
    'compact-oak': {
      meta: ['Compact full-home', 'Small-footprint residential', 'Typical study: 3–5 weeks', 'Concept study'],
      sections: [
        {label:'Goal',title:'Make every edge earn its place.',body:'Increase storage and improve movement without making a compact home feel tighter. The priority is <strong>usable volume, clear circulation and preserved daylight</strong>.'},
        {label:'Space',title:'Living + kitchen + loft + storage.',body:'A small-footprint residential interior where sleeping, cooking, seating and storage share one visual field. The design treats vertical volume as useful floor area rather than empty height.'},
        {label:'Design',title:'One continuous spatial language.',body:'Built-ins align with circulation, timber repeats across storage and stair elements, and visual clutter is kept low. The loft reads as part of the room—not an object dropped into it.'},
        {label:'Material direction',title:'Warm timber. Quiet shell. Dark accents.',list:['Oak / pine-toned joinery for built-ins and stair elements','Soft white or warm-neutral wall finish to return daylight','Dark metal details only where contrast improves readability','Natural woven or low-texture fabrics for visual softness','Warm 2700–3000K lighting for evening balance']},
        {label:'Key decisions',title:'Decisions that protect space.',list:['Keep the main walking line free of storage projections','Move storage upward before adding freestanding furniture','Use one timber family instead of multiple competing wood tones','Keep high-contrast details small and functional']},
        {label:'Timeline',title:'Typical design-study cadence.',body:'Illustrative planning window: <strong>Week 1</strong> brief + constraints · <strong>Week 2</strong> layout · <strong>Week 3</strong> material direction · <strong>Week 4</strong> approval/specification · optional coordination buffer after approval.'},
        {label:'Approval path',title:'Pause before irreversible choices.',body:'Scope → layout direction → material language → build-ready decision set. Each gate exists so a later stage does not quietly rewrite an earlier one.'},
        {label:'Concept result',title:'A compact home that reads as one room.',body:'The intended result is more usable storage, fewer circulation conflicts and a calmer visual field. This is a <strong>design-study outcome</strong>, not a claim of completed client work.'},
        {label:'Support + handover',title:'Keep decisions usable after design.',body:'Decision log, selected material summary, open-item list and handover notes stay grouped so follow-up questions have context.'}
      ]
    },
    'brass-bath': {
      meta: ['Bathroom', 'Compact renovation', 'Typical study: 2–4 weeks', 'Concept study'],
      sections: [
        {label:'Goal',title:'Character without visual noise.',body:'Create a small bathroom that feels considered and durable, using <strong>proportion and material restraint</strong> instead of decorative density.'},
        {label:'Space',title:'A small, high-contact room.',body:'Sink, bathing, storage and circulation compete for a limited footprint. Every surface is close to the user, so hardware scale, edge details and maintenance matter.'},
        {label:'Design',title:'Let a few materials do the work.',body:'The shell stays bright and quiet. Warm timber gives softness; brass becomes the controlled accent; fixtures stay visually simple so the room does not fragment.'},
        {label:'Material direction',title:'White shell + timber + brass.',list:['Soft white wall / panel finish','Natural timber vanity or shelf elements','Brushed or aged brass hardware language','Warm off-white stone / porcelain surface','Clear or lightly textured glass where enclosure is needed']},
        {label:'Key decisions',title:'Small details carry the room.',list:['Repeat one metal finish across visible hardware','Keep storage edges aligned with mirror / fixture geometry','Prioritize cleanable surfaces around water zones','Avoid extra decorative materials that compete with brass and timber']},
        {label:'Timeline',title:'Typical design-study cadence.',body:'Illustrative window: brief + existing constraints → fixture layout → finish palette → lighting/hardware → approval set. Usually <strong>2–4 weeks</strong> before coordination, depending on sourcing.'},
        {label:'Approval path',title:'Approve what changes cost or permanence.',body:'Fixture placement → storage strategy → primary finishes → hardware / lighting → final specification set.'},
        {label:'Concept result',title:'A quieter room with clearer hierarchy.',body:'The intended outcome is a bathroom that feels richer because fewer elements compete for attention. Conceptual design result only.'},
        {label:'Support + handover',title:'Make maintenance part of the decision.',body:'Material notes include finish consistency, wet-zone practicality and open sourcing questions—not just visual references.'}
      ]
    },
    'liberty-hearth': {
      meta: ['Living room', 'Architectural focal space', 'Typical study: 3–5 weeks', 'Concept study'],
      sections: [
        {label:'Goal',title:'Let the architecture lead.',body:'Build a warm gathering room without crowding the hearth, ceiling structure or long sightlines. Furniture should <strong>support the room—not compete with it</strong>.'},
        {label:'Space',title:'Hearth + seating + circulation.',body:'A living room with a strong architectural anchor. Seating must create conversation while keeping routes, views and the fireplace legible.'},
        {label:'Design',title:'Low furniture. Strong center. Open edges.',body:'The hearth defines the center of gravity. Furniture stays visually lower, contrast is restrained and negative space around structural elements is protected.'},
        {label:'Material direction',title:'Stone, timber and quiet textiles.',list:['Existing / natural stone as primary visual anchor','Warm timber ceiling or architectural details','Neutral upholstery with tactile texture','Muted rug to define seating without overpowering floor','Low-glare layered lighting around—not on—the focal point']},
        {label:'Key decisions',title:'Protect the focal hierarchy.',list:['Keep tall furniture away from the hearth axis','Use seating scale that preserves ceiling height visually','Place rug and table as one conversation zone','Limit strong patterns to one controlled layer']},
        {label:'Timeline',title:'Typical design-study cadence.',body:'Illustrative window: furniture plan → sightline checks → material / textile direction → lighting → approval and sourcing notes. Usually <strong>3–5 weeks</strong>.'},
        {label:'Approval path',title:'Approve the room in layers.',body:'Seating plan → focal hierarchy → material balance → lighting → final furniture/specification direction.'},
        {label:'Concept result',title:'A room that feels grounded from every angle.',body:'The intended outcome is a clear gathering zone with a visible architectural hierarchy, not a single staged “hero” viewpoint.'},
        {label:'Support + handover',title:'Keep sourcing choices connected.',body:'Furniture, textile and lighting notes are documented with the reason behind each choice, so substitutions can be judged against the design logic.'}
      ]
    },
    'accord-living': {
      meta: ['Living room', 'Open architectural volume', 'Typical study: 3–5 weeks', 'Concept study'],
      sections: [
        {label:'Goal',title:'Warmth without visual heaviness.',body:'Balance exposed timber, large openings and comfortable seating so the room feels <strong>generous, calm and usable every day</strong>.'},
        {label:'Space',title:'Large openings + strong structure.',body:'The architecture already carries weight through beams and windows. The interior layer must provide comfort without adding another heavy visual system.'},
        {label:'Design',title:'Give heavy elements breathing room.',body:'Neutral seating stays quiet, the floor plane remains readable and lighting is layered around the architecture instead of decorating every surface.'},
        {label:'Material direction',title:'Timber + mineral neutrals + soft textile.',list:['Existing timber kept visually dominant','Warm stone / plaster / mineral neutral surfaces','Low-contrast upholstery with tactile depth','Dark metal only for small functional accents','Warm indirect and task lighting rather than decorative overload']},
        {label:'Key decisions',title:'Balance mass with emptiness.',list:['Avoid tall furniture under dominant beams','Keep large windows visually unobstructed','Use one main seating group rather than scattered pieces','Maintain enough negative space around structural elements']},
        {label:'Timeline',title:'Typical design-study cadence.',body:'Illustrative 3–5 week window: spatial plan → furniture scale → material balance → lighting → approval/specification.'},
        {label:'Approval path',title:'Lock scale before styling.',body:'Furniture footprint → circulation → palette → lighting → final sourcing direction.'},
        {label:'Concept result',title:'Architecture stays visible; comfort improves.',body:'The intended result is a room where timber and daylight remain legible while seating and daily use feel more resolved.'},
        {label:'Support + handover',title:'Substitutions stay within the system.',body:'If a piece changes, the replacement is checked against scale, color temperature and visual weight—not chosen in isolation.'}
      ]
    },
    'cabin-table': {
      meta: ['Dining zone', 'Compact timber interior', 'Typical study: 2–4 weeks', 'Concept study'],
      sections: [
        {label:'Goal',title:'Give dining a real place.',body:'Create a useful gathering zone without blocking circulation, stair access or the strongest view. The table should feel <strong>intentional but light</strong>.'},
        {label:'Space',title:'Dining inside a shared compact room.',body:'Dining shares volume with circulation and other daily functions. Position and furniture footprint matter more than adding visual separation.'},
        {label:'Design',title:'Define the zone without building a wall.',body:'The table aligns with daylight and the main architectural axis. Furniture stays visually light so the zone is distinct without becoming an obstacle.'},
        {label:'Material direction',title:'Timber continuity with lighter contrast.',list:['Existing timber kept as the dominant envelope','Table tone related—but not identical—to surrounding timber','Light-profile chairs to preserve visual openness','Simple pendant / focused light to mark the dining zone','Minimal textile or tabletop layer to avoid clutter']},
        {label:'Key decisions',title:'Circulation first.',list:['Keep chair pull-back out of the main walking path','Preserve the window / view axis','Use lighting to define dining rather than extra furniture','Keep the table footprint proportional to actual daily use']},
        {label:'Timeline',title:'Typical design-study cadence.',body:'Illustrative 2–4 week window: use-case brief → furniture footprint → lighting / material → approval / sourcing notes.'},
        {label:'Approval path',title:'Confirm function before finish.',body:'Table size → circulation → chair profile → lighting → final material direction.'},
        {label:'Concept result',title:'A distinct gathering zone without blockage.',body:'The intended outcome is a dining area that reads clearly, works daily and still belongs to the larger timber room.'},
        {label:'Support + handover',title:'Keep practical clearances documented.',body:'Final notes preserve circulation assumptions, lighting location and sizing logic so later substitutions do not erase the reason the layout works.'}
      ]
    }
  };

  const scrollToTarget = selector => {
    const target = $(selector);
    if (!target) return;
    target.scrollIntoView({behavior: reduced.matches ? 'auto' : 'smooth', block:'start'});
  };

  const menu = $('#siteMenu');
  const menuButton = $('.menu-button');
  const curtain = $('.menu-curtain');
  let menuRestore = null;
  const openMenu = () => {
    if (!menu || !menuButton || !curtain) return;
    menuRestore = document.activeElement;
    menu.inert = false;
    menu.classList.add('open');
    curtain.classList.add('open');
    menu.setAttribute('aria-hidden','false');
    menuButton.setAttribute('aria-expanded','true');
    document.body.style.overflow='hidden';
    $('.menu-close',menu)?.focus({preventScroll:true});
  };
  const closeMenu = () => {
    if (!menu || !menuButton || !curtain) return;
    menu.classList.remove('open');
    curtain.classList.remove('open');
    menu.setAttribute('aria-hidden','true');
    menuButton.setAttribute('aria-expanded','false');
    menu.inert = true;
    document.body.style.overflow='';
    if (menuRestore instanceof HTMLElement) menuRestore.focus({preventScroll:true});
  };
  menuButton?.addEventListener('click',()=>menu?.classList.contains('open')?closeMenu():openMenu());
  $$('[data-menu-close]').forEach(el=>el.addEventListener('click',closeMenu));
  $$('.menu-list a').forEach(link=>link.addEventListener('click',closeMenu));

  const projectDialog = $('#projectDialog');
  const closeDialog = () => {if(projectDialog?.open) projectDialog.close();};
  $$('[data-scroll]').forEach(button=>button.addEventListener('click',()=>{
    const target=button.dataset.scroll;
    closeMenu(); closeDialog();
    setTimeout(()=>scrollToTarget(target),10);
  }));

  document.addEventListener('keydown',event=>{
    if(event.key==='Escape'){
      if(projectDialog?.open) closeDialog(); else closeMenu();
    }
    if(event.key!=='Tab'||!menu?.classList.contains('open')) return;
    const focusable=$$('a[href],button:not([disabled])',menu);
    if(!focusable.length) return;
    const first=focusable[0],last=focusable.at(-1);
    if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
    else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
  });

  let lastY=0,headerTicking=false;
  const header=$('.site-header');
  addEventListener('scroll',()=>{
    if(headerTicking)return;
    headerTicking=true;
    requestAnimationFrame(()=>{
      const y=scrollY,down=y>lastY+8,up=y<lastY-8;
      if(y<120||menu?.classList.contains('open')||projectDialog?.open) header?.classList.remove('is-hidden');
      else if(down) header?.classList.add('is-hidden');
      else if(up) header?.classList.remove('is-hidden');
      lastY=y;headerTicking=false;
    });
  },{passive:true});

  const pressables=$$('.pressable');
  pressables.forEach(el=>{
    const on=()=>el.classList.add('is-pressing');
    const off=()=>el.classList.remove('is-pressing');
    el.addEventListener('pointerdown',on,{passive:true});
    ['pointerup','pointercancel','pointerleave'].forEach(type=>el.addEventListener(type,off,{passive:true}));
  });

  const selectableGroups=['.trust-card','.service-card','.process-list>li'];
  selectableGroups.forEach(selector=>{
    const nodes=$$(selector);
    nodes.forEach(node=>{
      node.tabIndex=0;
      const select=()=>nodes.forEach(other=>other.classList.toggle('is-selected',other===node));
      node.addEventListener('click',select);
      node.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();select();}});
    });
  });

  const counterTimers=new WeakMap();
  const showCounter=(counter,index,total)=>{
    if(!counter)return;
    counter.textContent=`${String(index+1).padStart(2,'0')} / ${String(total).padStart(2,'0')}`;
    counter.classList.add('show');
    clearTimeout(counterTimers.get(counter));
    const timer=setTimeout(()=>counter.classList.remove('show'),1450);
    counterTimers.set(counter,timer);
  };

  const carouselState=new WeakMap();
  const updateCardCarousel=(stage,index,{announce=true}={})=>{
    const track=$('.project-track',stage),slides=$$('figure',track);
    if(!track||!slides.length)return;
    index=Math.max(0,Math.min(slides.length-1,index));
    carouselState.set(stage,index);
    track.scrollTo({left:index*track.clientWidth,behavior:reduced.matches?'auto':'smooth'});
    if(announce) showCounter($('.swipe-counter',stage),index,slides.length);
  };

  $$('[data-carousel]').forEach(stage=>{
    const track=$('.project-track',stage);
    carouselState.set(stage,0);
    $('[data-prev]',stage)?.addEventListener('click',event=>{event.stopPropagation();updateCardCarousel(stage,(carouselState.get(stage)||0)-1);});
    $('[data-next]',stage)?.addEventListener('click',event=>{event.stopPropagation();updateCardCarousel(stage,(carouselState.get(stage)||0)+1);});
    let raf=0,lastIndex=0;
    track?.addEventListener('scroll',()=>{
      cancelAnimationFrame(raf);
      raf=requestAnimationFrame(()=>{
        const index=Math.max(0,Math.min($$('figure',track).length-1,Math.round(track.scrollLeft/Math.max(1,track.clientWidth))));
        if(index!==lastIndex){lastIndex=index;carouselState.set(stage,index);showCounter($('.swipe-counter',stage),index,$$('figure',track).length);}
      });
    },{passive:true});
  });

  const projectCards=$$('.project-card');
  projectCards.forEach(card=>{
    let start=null,moved=false;
    card.addEventListener('pointerdown',event=>{
      if(event.target.closest('button,a,input,select,textarea'))return;
      start={x:event.clientX,y:event.clientY};moved=false;
    },{passive:true});
    card.addEventListener('pointermove',event=>{
      if(!start)return;
      if(Math.hypot(event.clientX-start.x,event.clientY-start.y)>8)moved=true;
    },{passive:true});
    card.addEventListener('pointerup',()=>{
      if(start&&!moved)projectCards.forEach(other=>other.classList.toggle('is-selected',other===card));
      start=null;moved=false;
    },{passive:true});
  });

  const projectData=new Map();
  projectCards.forEach(card=>{
    const key=card.dataset.project;
    const images=$$('.project-track img',card).map(img=>({src:img.currentSrc||img.src,alt:img.alt}));
    projectData.set(key,{
      title:$('h3',card)?.textContent?.trim()||'Project',
      kicker:$('.project-kicker span',card)?.textContent?.trim()||'Concept study',
      summary:$('.project-summary',card)?.innerHTML||'',
      images,
      extra:projectDetails[key]
    });
    $('.project-open',card)?.addEventListener('click',event=>{event.stopPropagation();openProject(key);});
  });

  let modalIndex=0,modalRaf=0,modalLastIndex=0;
  const modalTrack=$('.modal-track');
  const syncModal=(announce=true)=>{
    const slides=$$('figure',modalTrack);
    if(!modalTrack||!slides.length)return;
    modalIndex=Math.max(0,Math.min(slides.length-1,modalIndex));
    modalTrack.scrollTo({left:modalIndex*modalTrack.clientWidth,behavior:reduced.matches?'auto':'smooth'});
    if(announce)showCounter($('.modal-counter'),modalIndex,slides.length);
  };

  function openProject(key){
    const data=projectData.get(key);
    if(!data||!projectDialog)return;
    $('#modalKicker').textContent=`${data.kicker} · full design breakdown`;
    $('#modalTitle').textContent=data.title;
    $('#modalSummary').innerHTML=data.summary;
    $('#modalMeta').innerHTML=(data.extra?.meta||[]).map(item=>`<span>${item}</span>`).join('');
    $('#modalSections').innerHTML=(data.extra?.sections||[]).map((section,index)=>{
      const list=section.list?`<ul>${section.list.map(item=>`<li>${item}</li>`).join('')}</ul>`:'';
      return `<article class="detail-card ${index===8?'wide':''}"><span>${section.label}</span><h3>${section.title}</h3>${section.body?`<p>${section.body}</p>`:''}${list}</article>`;
    }).join('');
    modalTrack.innerHTML=data.images.map(image=>`<figure><img src="${image.src}" alt="${image.alt}" decoding="async"></figure>`).join('');
    modalIndex=0;modalLastIndex=0;
    projectDialog.showModal();
    document.body.style.overflow='hidden';
    requestAnimationFrame(()=>{
      modalTrack.scrollLeft=0;
      $('.modal-close')?.focus({preventScroll:true});
      if(!reduced.matches){
        $('.modal-shell')?.animate([{opacity:.2,transform:'translateY(20px) scale(.985)'},{opacity:1,transform:'translateY(0) scale(1)'}],{duration:380,easing:'cubic-bezier(.16,1,.3,1)'});
      }
    });
  }

  $('.modal-close')?.addEventListener('click',closeDialog);
  projectDialog?.addEventListener('close',()=>{document.body.style.overflow='';$('.modal-counter')?.classList.remove('show');});
  projectDialog?.addEventListener('click',event=>{if(event.target===projectDialog)closeDialog();});
  $('[data-modal-prev]')?.addEventListener('click',()=>{modalIndex--;syncModal(true);});
  $('[data-modal-next]')?.addEventListener('click',()=>{modalIndex++;syncModal(true);});
  modalTrack?.addEventListener('scroll',()=>{
    cancelAnimationFrame(modalRaf);
    modalRaf=requestAnimationFrame(()=>{
      const slides=$$('figure',modalTrack);
      const index=Math.max(0,Math.min(slides.length-1,Math.round(modalTrack.scrollLeft/Math.max(1,modalTrack.clientWidth))));
      if(index!==modalLastIndex){modalLastIndex=index;modalIndex=index;showCounter($('.modal-counter'),index,slides.length);}
    });
  },{passive:true});

  const preloadCache=window.__verospaceProjectImageCache=new Map();
  const preloadUrls=[...new Set($$('.project-track img').map(img=>img.src))];
  let preloadIndex=0,preloadRunning=0,userScrolling=false,resumeTimer=0;
  const maxConcurrent=innerWidth<=768?1:2;
  const idle=cb=>'requestIdleCallback'in window?requestIdleCallback(cb,{timeout:1400}):setTimeout(()=>cb({didTimeout:true,timeRemaining:()=>8}),100);
  addEventListener('scroll',()=>{userScrolling=true;clearTimeout(resumeTimer);resumeTimer=setTimeout(()=>{userScrolling=false;schedulePreload();},300);},{passive:true});
  const preloadOne=url=>new Promise(resolve=>{
    if(preloadCache.has(url))return resolve();
    const image=new Image();image.decoding='async';image.fetchPriority='low';
    image.onload=()=>{preloadCache.set(url,image);resolve();};
    image.onerror=()=>{preloadCache.set(url,{failed:true});resolve();};
    image.src=url;
  });
  const pumpPreload=deadline=>{
    if(userScrolling)return schedulePreload();
    while(preloadIndex<preloadUrls.length&&preloadRunning<maxConcurrent&&(deadline.didTimeout||deadline.timeRemaining()>4)){
      const url=preloadUrls[preloadIndex++];preloadRunning++;
      preloadOne(url).finally(()=>{preloadRunning--;root.dataset.projectPreloadCached=String(preloadCache.size);schedulePreload();});
    }
    if(preloadIndex<preloadUrls.length)schedulePreload();
    else if(!preloadRunning)root.dataset.projectPreload='complete';
  };
  const schedulePreload=()=>idle(pumpPreload);
  root.dataset.projectPreloadTarget=String(preloadUrls.length);
  if(document.readyState==='complete')setTimeout(schedulePreload,850);else addEventListener('load',()=>setTimeout(schedulePreload,850),{once:true});

  const form=$('#consultationForm'),status=$('#formStatus'),emailRe=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const showError=(field,message)=>{
    const label=field.closest('label');label?.classList.toggle('error',Boolean(message));
    const error=$(`[data-error="${field.name}"]`,form);if(error)error.textContent=message||'';
    field.setAttribute('aria-invalid',message?'true':'false');
  };
  const validate=()=>{
    let first=null;
    const rules={name:v=>v.trim()?'':'Enter your name.',email:v=>emailRe.test(v.trim())?'':'Enter a valid email.',project:v=>v?'':'Choose a project type.',budget:v=>v?'':'Choose a budget range.',message:v=>v.trim().length>=3?'':'Tell us a little about the space.'};
    Object.entries(rules).forEach(([name,rule])=>{const field=form.elements[name],message=rule(field.value||'');showError(field,message);if(message&&!first)first=field;});
    if(first){first.focus();return false;}return true;
  };
  ['input','change'].forEach(type=>form?.addEventListener(type,event=>{const field=event.target;if(field?.name&&$(`[data-error="${field.name}"]`,form))showError(field,'');}));
  form?.addEventListener('submit',async event=>{
    event.preventDefault();
    if(form.elements.website?.value)return;
    if(!validate()){if(status)status.textContent='Check the highlighted fields.';return;}
    const submit=$('button[type="submit"]',form);submit.disabled=true;submit.textContent='Sending…';if(status)status.textContent='Sending your request securely…';
    const payload=Object.fromEntries(new FormData(form).entries());delete payload.website;payload.requestId=crypto?.randomUUID?.()||`${Date.now()}-${Math.random()}`;
    try{const response=await fetch('/api/consultation',{method:'POST',headers:{'Content-Type':'application/json','X-Request-Id':payload.requestId},body:JSON.stringify(payload)});if(!response.ok)throw new Error(`HTTP ${response.status}`);form.reset();if(status)status.textContent='Request sent. VeroSpace can now review the essentials.';}
    catch(error){console.error('Consultation request failed',error);if(status)status.textContent='Could not send right now. Please try again.';}
    finally{submit.disabled=false;submit.textContent='Request consultation';}
  });

  const loadScript=src=>new Promise((resolve,reject)=>{const script=document.createElement('script');script.src=src;script.async=true;script.crossOrigin='anonymous';script.onload=resolve;script.onerror=reject;document.head.appendChild(script);});
  const initMotion=async()=>{
    if(reduced.matches){root.dataset.motion='reduced';return;}
    try{
      await loadScript('https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js');
      await loadScript('https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/ScrollTrigger.min.js');
      const {gsap,ScrollTrigger}=window;if(!gsap||!ScrollTrigger)throw new Error('GSAP unavailable');
      gsap.registerPlugin(ScrollTrigger);root.dataset.motion='gsap';

      const intro=gsap.timeline({defaults:{ease:'power3.out'}});
      intro.from('.site-header',{y:-34,opacity:0,scale:.975,duration:.72})
        .from('.hero-image',{scale:1.09,duration:1.28,ease:'power2.out'},0)
        .from('.hero-copy .eyebrow',{x:-30,opacity:0,duration:.5},.18)
        .from('.hero h1 span',{x:-48,opacity:0,duration:.78},.28)
        .from('.hero h1 em',{x:52,opacity:0,duration:.82},.34)
        .from('.hero-copy>p:not(.eyebrow)',{y:22,opacity:0,duration:.55},.5)
        .from('.hero-actions>*',{y:20,opacity:0,scale:.98,stagger:.08,duration:.45},.62)
        .from('.hero-reassurance',{x:-18,opacity:0,duration:.4},.78);

      gsap.to('.hero-image',{scale:1.045,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:.9}});

      $$('.trust-card').forEach((card,index)=>gsap.from(card,{x:index%2?-32:32,y:24,rotation:index%2?-.8:.8,opacity:0,duration:.7,ease:'power3.out',scrollTrigger:{trigger:card,start:'top 88%',once:true}}));
      $$('.service-card').forEach((card,index)=>gsap.from(card,{y:38,rotationX:8,opacity:0,duration:.72,delay:(index%2)*.04,ease:'power3.out',scrollTrigger:{trigger:card,start:'top 88%',once:true}}));
      $$('.process-list>li').forEach((item,index)=>gsap.from(item,{x:index%2?-42:42,scale:.985,opacity:0,duration:.68,ease:'power3.out',scrollTrigger:{trigger:item,start:'top 90%',once:true}}));
      $$('.reveal').filter(el=>!el.matches('.trust-card,.service-card,.process-list>li,.project-card')).forEach((el,index)=>{
        const variants=[{x:-34,y:8},{x:34,y:4},{y:32,scale:.988},{x:-18,y:22,rotation:-.5}];
        gsap.from(el,{...variants[index%variants.length],opacity:0,duration:.72,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 88%',once:true}});
      });

      projectCards.forEach((card,index)=>{
        const stage=$('.project-stage',card),preview=$('.project-preview',card),children=$$('.project-kicker,.project-preview h3,.project-summary,.project-teaser,.project-open',preview);
        gsap.from(card,{y:48,opacity:0,scale:.985,rotation:index%2?-.5:.5,duration:.82,ease:'power3.out',scrollTrigger:{trigger:card,start:'top 90%',once:true}});
        gsap.from(children,{x:index%2?28:-28,opacity:0,stagger:.055,duration:.58,ease:'power3.out',scrollTrigger:{trigger:card,start:'top 82%',once:true}});
        gsap.fromTo(stage,{scale:.96},{scale:1.035,ease:'none',scrollTrigger:{trigger:card,start:'top bottom',end:'bottom top',scrub:.8}});
      });
    }catch(error){root.dataset.motion='static';console.warn('VeroSpace motion fallback',error);}
  };
  initMotion();
})();
