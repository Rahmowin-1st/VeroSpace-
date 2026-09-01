(()=>{
  'use strict';
  const $=(s,c=document)=>c.querySelector(s);
  const $$=(s,c=document)=>[...c.querySelectorAll(s)];
  const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
  const mix=(a,b,t)=>a+(b-a)*t;
  const smooth=t=>t*t*(3-2*t);
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
  const mobile=window.matchMedia('(max-width: 900px)');
  const root=document.documentElement;

  const projectData={
    ridge:{title:'Ridge House',image:'assets/verospace-featured-home.jpg',alt:'Refined open-plan VeroSpace residential interior',text:'A whole-home transformation built around better movement, warmer light and a calmer relationship between rooms.',scope:'Whole-home interior + renovation planning',focus:'Flow · lighting · furnishings'},
    walnut:{title:'Walnut Kitchen',image:'https://images.unsplash.com/photo-1782898622998-899bb7183a12?auto=format&fit=crop&w=1800&q=84',alt:'Warm timber and stone kitchen',text:'A kitchen renovation where joinery, stone, lighting and circulation are treated as one architectural system.',scope:'Kitchen renovation',focus:'Joinery · stone · lighting'},
    suite:{title:'Quiet Suite',image:'https://images.unsplash.com/photo-1760072513376-67a46aab0fd1?auto=format&fit=crop&w=1800&q=84',alt:'Quiet neutral bedroom suite',text:'A primary suite designed around calm materials, hidden storage and softer transitions between sleeping, dressing and working.',scope:'Primary suite',focus:'Storage · textiles · atmosphere'},
    stone:{title:'Stone & Light House',image:'https://images.unsplash.com/photo-1771371428960-35a50c2d4e7c?auto=format&fit=crop&w=1800&q=84',alt:'Warm modern living room with fireplace',text:'A material-led residence where stone, timber and controlled daylight create depth without visual noise.',scope:'Residential interior',focus:'Material palette · proportion · light'},
    courtyard:{title:'Courtyard Residence',image:'https://images.unsplash.com/photo-1780257562925-d78de6cb6612?auto=format&fit=crop&w=1800&q=84',alt:'Warm bespoke library interior',text:'A joined design direction that keeps architecture, bespoke joinery, furniture and final styling speaking one language.',scope:'Design coordination',focus:'Continuity · joinery · detailing'}
  };

  /* ---------------- HOME: make the first screen answer why the client is here. ---------------- */
  const hero=$('#home');
  if(hero){
    hero.classList.add('cinematic-hero');
    const copy=$('.hero-copy',hero),media=$('.hero-media',hero);
    if(copy&&media&&!$('.hero-stage',hero)){
      const stage=document.createElement('div');
      stage.className='hero-stage';
      hero.insertBefore(stage,copy);
      stage.append(copy,media);

      const immersive=document.createElement('div');
      immersive.className='hero-immersive-copy';
      immersive.innerHTML=`<span class="mini">VeroSpace · complete home transformation</span><h2>One vision, carried all the way through.</h2><p>Layout, materials, lighting, renovation decisions and final coordination move together — so the finished home feels intentional rather than assembled.</p>`;
      stage.append(immersive);

      const chapter=document.createElement('div');
      chapter.className='hero-chapter';
      chapter.innerHTML='<span>Scroll to enter</span><i></i><span>01 · Home</span>';
      stage.append(chapter);

      const signal=document.createElement('div');
      signal.className='hero-scroll-signal';
      signal.innerHTML='<span>Scroll to enter the space</span><i></i>';
      stage.append(signal);

      const caption=document.createElement('div');
      caption.className='hero-media-caption';
      caption.innerHTML='<strong>Ridge House</strong><span>Residential transformation · VeroSpace</span>';
      media.append(caption);
    }

    const eyebrow=$('.hero .eyebrow');
    if(eyebrow)eyebrow.textContent='Premium interior design · renovation · coordination';
    const title=$('#hero-title');
    if(title)title.innerHTML='Your home should feel <em>impossible to forget.</em>';
    const lede=$('.hero-lede');
    if(lede)lede.textContent='VeroSpace designs and coordinates complete home transformations — from the first layout to the final handover.';
    const actions=$('.hero-actions');
    if(actions){
      const primary=$('.primary',actions),secondary=$('.secondary',actions);
      if(primary)primary.textContent='Plan my transformation';
      if(secondary){secondary.textContent='See the work';secondary.dataset.scroll='#projects';}
      if(!$('.hero-intent',copy)){
        const intent=document.createElement('p');
        intent.className='hero-intent';
        intent.textContent='For homeowners who want a finished result — not a folder of disconnected ideas.';
        actions.insertAdjacentElement('beforebegin',intent);
      }
    }
    const trust=$('.hero-trust');
    if(trust)trust.innerHTML='<span>Whole-home interiors</span><span>Renovation strategy</span><span>Materials + lighting</span><span>Project coordination</span>';
  }

  /* Conversion bridge: direct value proposition before the portfolio starts. */
  const projects=$('#projects');
  if(hero&&projects&&!$('.value-bridge')){
    const bridge=document.createElement('section');
    bridge.className='value-bridge section-shell reveal';
    bridge.setAttribute('aria-label','Why VeroSpace');
    bridge.innerHTML=`
      <div class="value-bridge-copy">
        <p class="eyebrow">Why VeroSpace</p>
        <h2>You do not need more inspiration. You need one clear vision carried to the finish.</h2>
        <p>We connect the decisions that usually get split between moodboards, contractors, suppliers and furniture — then turn them into one coherent home.</p>
      </div>
      <div class="value-bridge-grid">
        <article><span>01</span><h3>Design</h3><p>Layout, proportion, storage and atmosphere.</p></article>
        <article><span>02</span><h3>Renovate</h3><p>Scope, materials, lighting and build-ready decisions.</p></article>
        <article><span>03</span><h3>Coordinate</h3><p>One direction from concept through handover.</p></article>
      </div>`;
    projects.before(bridge);
  }

  /* ---------------- PORTFOLIO: five projects + desktop scroll storytelling. ---------------- */
  const grid=$('.project-grid',projects||document);
  if(grid){
    const existingIds=new Set($$('[data-project]',grid).map(card=>card.dataset.project));
    const extras=[projectData.stone,projectData.courtyard];
    const ids=['stone','courtyard'];
    extras.forEach((p,i)=>{
      const id=ids[i];
      if(existingIds.has(id))return;
      const article=document.createElement('article');
      article.className='project-card reveal visible';
      article.dataset.project=id;
      article.innerHTML=`<div class="project-image"><img src="${p.image}" alt="${p.alt}" loading="lazy" decoding="async" /></div><div class="project-meta"><div><span>${String(grid.children.length+1).padStart(2,'0')}</span><h3>${p.title}</h3></div><p>${p.scope}</p><button class="text-link project-open" type="button">View project ↗</button></div>`;
      grid.append(article);
    });

    const cards=$$('.project-card',grid);
    cards.forEach((card,i)=>{
      const id=card.dataset.project;
      const data=projectData[id];
      const number=$('.project-meta>div>span',card);
      if(number)number.textContent=String(i+1).padStart(2,'0');
      const img=$('.project-image img',card);
      img?.addEventListener('error',()=>{if(!img.dataset.vsFallback){img.dataset.vsFallback='1';img.src='assets/verospace-featured-home.jpg';}});
      if(data){
        const h=$('.project-meta h3',card);if(h)h.textContent=data.title;
        const p=$('.project-meta p',card);if(p)p.textContent=data.scope;
      }
    });

    if(projects){
      projects.classList.add('cinematic-projects');
      const heading=$('.section-heading',projects);
      const pTitle=$('#projects-title');if(pTitle)pTitle.textContent='Five transformations. One design language.';
      const pCopy=heading?.querySelector(':scope > p:last-child');if(pCopy)pCopy.textContent='Scroll through the work — from planning and materials to the atmosphere that makes a room memorable.';
      const eye=$('.eyebrow',heading);if(eye)eye.textContent='Selected transformations';

      if(heading&&!$('.projects-sticky-shell',projects)){
        const sticky=document.createElement('div');
        sticky.className='projects-sticky-shell';
        projects.insertBefore(sticky,heading);
        sticky.append(heading,grid);
        const ui=document.createElement('div');
        ui.className='project-scroll-ui';
        ui.innerHTML='<span>Scroll through projects</span><div class="bar"><i></i></div><strong>01 / 05</strong>';
        sticky.append(ui);
      }
    }
  }

  /* Image-first modal for all five projects. Capture phase replaces the older text-only handler. */
  const dialog=$('#projectDialog');
  if(dialog&&!$('.cinematic-dialog-media',dialog)){
    const media=document.createElement('div');
    media.className='cinematic-dialog-media';
    media.innerHTML='<img src="assets/verospace-featured-home.jpg" alt="VeroSpace project preview" />';
    dialog.insertBefore(media,$('.eyebrow',dialog));
  }
  document.addEventListener('click',event=>{
    const button=event.target.closest?.('.project-open');
    if(!button)return;
    const card=button.closest('[data-project]');
    const data=projectData[card?.dataset.project];
    if(!data||!dialog)return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const img=$('.cinematic-dialog-media img',dialog);if(img){img.src=data.image;img.alt=data.alt;}
    const title=$('#dialogTitle');if(title)title.textContent=data.title;
    const text=$('#dialogText');if(text)text.textContent=data.text;
    const scope=$('#dialogScope');if(scope)scope.textContent=data.scope;
    const focus=$('#dialogFocus');if(focus)focus.textContent=data.focus;
    const eye=$('.eyebrow',dialog);if(eye)eye.textContent='VeroSpace project study';
    if(!dialog.open)dialog.showModal();
  },true);

  /* ---------------- COPY: explain the offer instead of sounding generic. ---------------- */
  const services=$('#services');
  if(services){
    const eye=$('.section-heading .eyebrow',services);if(eye)eye.textContent='One studio · five disciplines';
    const h=$('#services-title');if(h)h.textContent='From layout to handover, nothing is left floating.';
    const p=$('.section-heading>p:last-child',services);if(p)p.textContent='Interior design, renovation planning, space planning, materials + lighting, and project coordination — held under one direction.';
  }
  const process=$('#process');
  if(process){
    const eye=$('.section-heading .eyebrow',process);if(eye)eye.textContent='How it becomes real';
    const h=$('#process-title');if(h)h.textContent='From first conversation to finished home.';
    const p=$('.section-heading>p:last-child',process);if(p)p.textContent='A clear sequence keeps the project moving and the decisions connected.';
  }
  const contact=$('#contact');
  if(contact){
    const h=$('#contact-title');if(h)h.textContent='What do you want your home to become?';
    const p=$('.contact-copy>p:last-child',contact);if(p)p.textContent='Tell us what feels wrong today, what you want to change, and where you want the finished space to land.';
  }
  const footerText=$('.footer>p');if(footerText)footerText.textContent='VeroSpace · Interior design, renovation planning & project coordination';

  /* ---------------- SCROLL ENGINE ---------------- */
  let raf=0;
  const heroMedia=hero?$('.hero-media',hero):null;
  const heroImage=heroMedia?$('img',heroMedia):null;
  const immersive=hero?$('.hero-immersive-copy',hero):null;
  const chapter=hero?$('.hero-chapter',hero):null;
  const sticky=projects?$('.projects-sticky-shell',projects):null;
  const projectGrid=projects?$('.project-grid',projects):null;
  const projectCards=projectGrid?$$('.project-card',projectGrid):[];
  const projectUI=projects?$('.project-scroll-ui strong',projects):null;
  const showcase=$('.showcase');
  const showcaseImage=showcase?$('.showcase-image img',showcase):null;
  const processSteps=process?$('.process-steps',process):null;

  function updateHero(){
    if(!hero||!heroMedia)return;
    const range=Math.max(1,hero.offsetHeight-window.innerHeight);
    const p=clamp((window.scrollY-hero.offsetTop)/range);
    root.style.setProperty('--hero-p',p.toFixed(4));
    const heroRect=hero.getBoundingClientRect();
    const inHero=heroRect.bottom>window.innerHeight*.12&&heroRect.top<window.innerHeight*.35;
    root.classList.toggle('hero-immersed',inHero&&p>.52);

    if(!mobile.matches&&!reduced.matches){
      const t=smooth(clamp(p/.82));
      heroMedia.style.left=`${mix(48,0,t)}%`;
      heroMedia.style.top=`${mix(13,0,t)}%`;
      heroMedia.style.width=`${mix(48,100,t)}%`;
      heroMedia.style.height=`${mix(74,100,t)}%`;
      heroMedia.style.borderRadius=`${mix(46,0,t)}px`;
      if(heroImage)heroImage.style.filter=`saturate(.92) contrast(1.04) brightness(${mix(.98,.74,t)})`;
    }else if(!mobile.matches){
      heroMedia.style.left='48%';heroMedia.style.top='13%';heroMedia.style.width='48%';heroMedia.style.height='74%';heroMedia.style.borderRadius='46px';
    }
    const show=smooth(clamp((p-.48)/.30));
    if(immersive){immersive.style.opacity=String(show);immersive.style.transform=`translateY(${mix(30,0,show)}px)`;}
    if(chapter)chapter.style.opacity=String(show*.85);
  }

  function updateProjects(){
    if(!projects||!sticky||!projectGrid)return;
    if(mobile.matches||reduced.matches){
      projectGrid.style.transform='none';
      root.style.setProperty('--project-p','0');
      projectCards.forEach(c=>c.classList.add('is-focus'));
      return;
    }
    const range=Math.max(1,projects.offsetHeight-window.innerHeight);
    const p=clamp((window.scrollY-projects.offsetTop)/range);
    root.style.setProperty('--project-p',p.toFixed(4));
    const available=Math.max(1,sticky.clientWidth-80);
    const maxX=Math.max(0,projectGrid.scrollWidth-available);
    projectGrid.style.transform=`translate3d(${-maxX*p}px,0,0)`;
    const index=Math.min(projectCards.length-1,Math.round(p*(projectCards.length-1)));
    projectCards.forEach((card,i)=>card.classList.toggle('is-focus',i===index));
    if(projectUI)projectUI.textContent=`${String(index+1).padStart(2,'0')} / ${String(projectCards.length).padStart(2,'0')}`;
  }

  function updateShowcase(){
    if(!showcase||!showcaseImage||reduced.matches)return;
    const r=showcase.getBoundingClientRect();
    const p=clamp((window.innerHeight-r.top)/(window.innerHeight+r.height));
    showcaseImage.style.setProperty('--showcase-y',`${mix(28,-28,p)}px`);
  }

  function updateProcess(){
    if(!process||!processSteps)return;
    const r=process.getBoundingClientRect();
    const p=clamp((window.innerHeight*.78-r.top)/(Math.max(1,r.height*.72)));
    processSteps.style.setProperty('--process-p',p.toFixed(4));
  }

  function frame(){
    raf=0;
    updateHero();
    updateProjects();
    updateShowcase();
    updateProcess();
  }
  const queue=()=>{if(!raf)raf=requestAnimationFrame(frame);};
  window.addEventListener('scroll',queue,{passive:true});
  window.addEventListener('resize',queue,{passive:true});
  mobile.addEventListener?.('change',()=>{if(heroMedia&&!mobile.matches){heroMedia.removeAttribute('style');}queue();});
  frame();

  /* Reveal anything added after the original script initialized. */
  if('IntersectionObserver' in window){
    const io=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');io.unobserve(entry.target);}}),{threshold:.12,rootMargin:'0px 0px -7% 0px'});
    $$('.value-bridge.reveal,.project-card.reveal').forEach(el=>{if(!el.classList.contains('visible'))io.observe(el);});
  }
})();
