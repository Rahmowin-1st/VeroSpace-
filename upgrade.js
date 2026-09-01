(()=>{
  'use strict';
  const $=(s,c=document)=>c.querySelector(s);
  const $$=(s,c=document)=>[...c.querySelectorAll(s)];

  const projects=[
    {
      id:'ridge',n:'01',title:'Ridge House',meta:'Full-home renovation · flow + light',
      image:'assets/verospace-featured-home.jpg',alt:'Refined open-plan residential interior',
      text:'A whole-home reset built around better movement, warmer light and rooms that work together.',
      scope:'Whole-home renovation',focus:'Flow · lighting · furnishings'
    },
    {
      id:'oak',n:'02',title:'Oak Residence',meta:'Family interior · warm minimalism',
      image:'https://images.unsplash.com/photo-1771371428960-35a50c2d4e7c?auto=format&fit=crop&w=1800&q=84',alt:'Warm modern living room with fireplace',
      text:'A calm family interior where warm timber, soft contrast and practical storage do the heavy lifting.',
      scope:'Residential interior',focus:'Warmth · storage · everyday use'
    },
    {
      id:'northline',n:'03',title:'Northline Apartment',meta:'Apartment redesign · storage + calm',
      image:'https://images.unsplash.com/photo-1782898622998-899bb7183a12?auto=format&fit=crop&w=1800&q=84',alt:'Warm timber and stone kitchen interior',
      text:'A compact redesign that turns limited space into a cleaner, quieter and more useful home.',
      scope:'Apartment redesign',focus:'Planning · joinery · lighting'
    },
    {
      id:'stone',n:'04',title:'Stone & Light House',meta:'Material-led renovation · stone + light',
      image:'https://images.unsplash.com/photo-1760072513376-67a46aab0fd1?auto=format&fit=crop&w=1800&q=84',alt:'Quiet neutral bedroom suite',
      text:'A material-led renovation shaped by natural texture, controlled light and fewer, stronger decisions.',
      scope:'Interior renovation',focus:'Stone · textiles · atmosphere'
    },
    {
      id:'courtyard',n:'05',title:'Courtyard Residence',meta:'Interior coordination · inside + out',
      image:'https://images.unsplash.com/photo-1780257562925-d78de6cb6612?auto=format&fit=crop&w=1800&q=84',alt:'Warm bespoke library interior',
      text:'A joined interior direction that keeps architecture, joinery, furniture and finishing details speaking one language.',
      scope:'Design coordination',focus:'Continuity · joinery · detailing'
    }
  ];
  const byId=Object.fromEntries(projects.map(p=>[p.id,p]));

  // Home: keep one message and one action. Remove duplicate navigation and decorative controls.
  $$('.mobile-journey-dock,.mobile-section-status,.desktop-journey,.vs-page-progress,.hero-dock,.hero-rail,.hero-trust,.hero-media-badge').forEach(el=>el.remove());
  $('.hero-actions .secondary')?.remove();
  $('.more-projects')?.remove();
  const heroEyebrow=$('.hero .eyebrow'); if(heroEyebrow) heroEyebrow.textContent='Interior design · renovation';
  const heroTitle=$('#hero-title'); if(heroTitle) heroTitle.innerHTML='Design that feels right. <em>Built to last.</em>';
  const heroLede=$('.hero-lede'); if(heroLede) heroLede.textContent='One team from first plan to final detail.';
  const heroCTA=$('.hero-actions .primary'); if(heroCTA) heroCTA.textContent='Start your project';

  // Circular logo space; the source logo itself stays untouched.
  $('.brand')?.setAttribute('data-upgraded-logo','true');

  // Simpler, solid-color navigation panel with strong contrast.
  const menu=$('.mobile-menu');
  const menuBtn=$('.menu-button');
  if(menu){
    menu.innerHTML=`
      <div class="upgrade-menu-intro">
        <span>VEROSPACE</span>
        <small>Interior design · renovation</small>
      </div>
      <nav class="upgrade-menu-links" aria-label="Expanded navigation">
        <a href="#top"><span>Home</span><i>01</i></a>
        <a href="#projects"><span>Projects</span><i>02</i></a>
        <a href="#services"><span>Services</span><i>03</i></a>
        <a href="#process"><span>Process</span><i>04</i></a>
      </nav>
      <button class="pill-button upgrade-menu-cta" type="button"><span>Start a project</span><i>↗</i></button>`;
    const closeMenu=()=>{if(menu.classList.contains('open'))menuBtn?.click();};
    $$('.upgrade-menu-links a',menu).forEach(a=>a.addEventListener('click',closeMenu));
    $('.upgrade-menu-cta',menu)?.addEventListener('click',()=>{closeMenu();$('#contact')?.scrollIntoView({behavior:'smooth',block:'start'});});
  }

  // Five-project portfolio. Every card has its own image and concise story.
  const grid=$('.project-grid');
  if(grid){
    grid.innerHTML=projects.map(p=>`
      <article class="project-card reveal visible" data-project="${p.id}">
        <div class="project-image"><img src="${p.image}" alt="${p.alt}" loading="lazy" decoding="async" /></div>
        <div class="project-meta">
          <div><span>${p.n}</span><h3>${p.title}</h3></div>
          <p>${p.meta}</p>
          <button class="text-link project-open" type="button">View project <span aria-hidden="true">↗</span></button>
        </div>
      </article>`).join('');
  }
  const projectHeading=$('#projects-title'); if(projectHeading) projectHeading.textContent='Five spaces. One standard.';
  const projectSection=$('#projects');
  if(projectSection){
    const p=$('.section-heading>p:last-child',projectSection); if(p)p.textContent='Clear thinking. Refined detail. Built around real life.';
  }

  // Project modal becomes a visual case-study preview.
  const dialog=$('#projectDialog');
  if(dialog&&!$('.upgrade-dialog-media',dialog)){
    const media=document.createElement('div');
    media.className='upgrade-dialog-media';
    media.innerHTML='<img src="assets/verospace-featured-home.jpg" alt="VeroSpace project preview" />';
    dialog.insertBefore(media,dialog.querySelector('.eyebrow'));
  }
  document.addEventListener('click',event=>{
    const btn=event.target.closest?.('.project-open');
    if(!btn)return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const card=btn.closest('[data-project]');
    const data=byId[card?.dataset.project];
    if(!dialog||!data)return;
    const img=$('.upgrade-dialog-media img',dialog); if(img){img.src=data.image;img.alt=data.alt;}
    $('#dialogTitle').textContent=data.title;
    $('#dialogText').textContent=data.text;
    $('#dialogScope').textContent=data.scope;
    $('#dialogFocus').textContent=data.focus;
    const eyebrow=$('.eyebrow',dialog); if(eyebrow)eyebrow.textContent='VeroSpace concept project';
    if(!dialog.open)dialog.showModal();
  },true);

  // Copy pass: shorter, clearer, trust-led.
  const services=$('#services');
  if(services){
    const h=$('#services-title'); if(h)h.textContent='One team. Every detail.';
    const p=$('.section-heading>p:last-child',services); if(p)p.textContent='Plan. Refine. Deliver.';
  }
  const showcase=$('.showcase');
  if(showcase){
    const h=$('h2',showcase); if(h)h.textContent='Materials that earn their place.';
    const p=$('.showcase-copy>p:not(.eyebrow)',showcase); if(p)p.textContent='Fewer finishes. Better light. Stronger rooms.';
  }
  const process=$('#process');
  if(process){
    const h=$('#process-title'); if(h)h.textContent='Clear steps. No guesswork.';
    const p=$('.section-heading>p:last-child',process); if(p)p.textContent='You always know what happens next.';
  }
  const testimonials=$('.testimonials');
  if(testimonials){
    const eye=$('.section-heading .eyebrow',testimonials); if(eye)eye.textContent='VeroSpace standard';
    const h=$('#testimonials-title'); if(h)h.textContent='Confidence comes from clarity.';
    const p=$('.section-heading>p:last-child',testimonials); if(p)p.textContent='Clear scope. Clear decisions. Clear handover.';
    const cards=$$('.quote-card',testimonials);
    const copy=[
      ['Useful before impressive.','Every choice has a job.','Function · Ease · Warmth'],
      ['Fewer, better decisions.','Clarity protects the project.','Clarity · Control · Calm'],
      ['Refined without the noise.','The result should feel effortless.','Detail · Balance · Longevity']
    ];
    cards.forEach((card,i)=>{
      const c=copy[i]; if(!c)return;
      $('h3',card).textContent=c[0]; $('p',card).textContent=c[1];
      const tags=$('.quote-tags',card); if(tags)tags.innerHTML=c[2].split(' · ').map(t=>`<span>${t}</span>`).join('');
      const footer=$('footer',card); if(footer)footer.textContent='VeroSpace principle';
    });
  }
  const contact=$('#contact');
  if(contact){
    const h=$('#contact-title'); if(h)h.textContent='Tell us what needs to change.';
    const p=$('.contact-copy>p:last-child',contact); if(p)p.textContent='A few details are enough. Your request stays inside VeroSpace.';
  }
  const footerText=$('.footer>p'); if(footerText)footerText.textContent='VeroSpace · Interior design & renovation';

  // Image failure is never allowed to leave a broken card.
  $$('.project-image img,.upgrade-dialog-media img').forEach(img=>img.addEventListener('error',()=>{
    if(!img.dataset.fallback){img.dataset.fallback='1';img.src='assets/verospace-featured-home.jpg';}
  }));
})();
