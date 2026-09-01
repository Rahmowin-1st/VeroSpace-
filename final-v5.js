(()=>{
  'use strict';
  const $=(s,c=document)=>c.querySelector(s);
  const $$=(s,c=document)=>[...c.querySelectorAll(s)];

  /* Remove UI that was explicitly rejected. */
  $('.mobile-journey-dock')?.remove();
  $('.mobile-section-status')?.remove();
  $('.hero-dock')?.remove();
  $('.hero-rail')?.remove();
  $('.more-projects')?.remove();

  /* First-screen message: clear offer, fewer words, one decisive action. */
  const hero=$('#home');
  if(hero){
    const eye=$('.eyebrow',hero);
    const title=$('#hero-title');
    const lede=$('.hero-lede',hero);
    const primary=$('.hero-actions .primary',hero);
    const secondary=$('.hero-actions .secondary',hero);
    eye && (eye.textContent='Interior design · renovation · coordination');
    title && (title.innerHTML='Your home. <em>One complete vision.</em>');
    lede && (lede.textContent='VeroSpace designs, plans and coordinates the transformation — from first layout to final handover.');
    primary && (primary.textContent='Start your project');
    secondary && (secondary.textContent='See 5 projects');
    $('.hero-intent',hero)?.remove();
    $('.hero-trust',hero)?.remove();

    const immersive=$('.hero-immersive-copy',hero);
    if(immersive){
      const mini=$('.mini',immersive),h=$('h2',immersive),p=$('p',immersive);
      mini && (mini.textContent='One direction · start to finish');
      h && (h.textContent='Every decision belongs to the same vision.');
      p && (p.textContent='Layout, materials, lighting and build decisions stay connected all the way through.');
    }
    const signal=$('.hero-scroll-signal span',hero);
    signal && (signal.textContent='Scroll to enter');
  }

  /* Tight, trust-led value bridge. */
  const bridge=$('.value-bridge');
  if(bridge){
    const eye=$('.value-bridge-copy .eyebrow',bridge);
    const h=$('.value-bridge-copy h2',bridge);
    const p=$('.value-bridge-copy>p:last-child',bridge);
    eye && (eye.textContent='Why VeroSpace');
    h && (h.textContent='One team. One direction. Fewer costly disconnects.');
    p && (p.textContent='Design and renovation decisions stay joined, so the finished home feels intentional — not assembled.');
  }

  /* Portfolio copy: five projects, zero filler. */
  const projects=$('#projects');
  if(projects){
    const eye=$('.section-heading .eyebrow',projects);
    const h=$('#projects-title');
    const p=$('.section-heading>p:last-child',projects);
    eye && (eye.textContent='Five selected transformations');
    h && (h.textContent='See what a complete vision looks like.');
    p && (p.textContent='Five different homes. The same discipline: flow, material, light and finish working together.');
  }

  /* Services and process: direct language. */
  const services=$('#services');
  if(services){
    $('.section-heading .eyebrow',services) && ($('.section-heading .eyebrow',services).textContent='What we handle');
    $('#services-title') && ($('#services-title').textContent='From layout to handover.');
    $('.section-heading>p:last-child',services) && ($('.section-heading>p:last-child',services).textContent='Interior design, renovation planning, materials, lighting and coordination — under one direction.');
  }
  const process=$('#process');
  if(process){
    $('.section-heading .eyebrow',process) && ($('.section-heading .eyebrow',process).textContent='A clear path');
    $('#process-title') && ($('#process-title').textContent='You always know what happens next.');
    $('.section-heading>p:last-child',process) && ($('.section-heading>p:last-child',process).textContent='Five steps from first conversation to finished home.');
  }

  /* Trust without fake social proof. */
  const proof=$('.proof-band');
  if(proof){
    const items=$$(':scope>div',proof);
    const copy=[
      ['Decisions stay connected.','Layout, materials and execution follow one direction.'],
      ['Scope stays visible.','You know what is decided, what is next and what still needs approval.'],
      ['The finish stays intentional.','Fewer late reversals. More control before work begins.']
    ];
    items.forEach((item,i)=>{
      const strong=$('strong',item),span=$('span',item);
      if(copy[i]){strong && (strong.textContent=copy[i][0]);span && (span.textContent=copy[i][1]);}
    });
  }

  const testimonials=$('.testimonials');
  if(testimonials){
    const eye=$('.section-heading .eyebrow',testimonials);
    const title=$('#testimonials-title');
    const p=$('.section-heading>p:last-child',testimonials);
    eye && (eye.textContent='What you can expect');
    title && (title.textContent='Clarity before construction.');
    p && (p.textContent='A professional process should reduce uncertainty, not add to it.');
    const cards=$$('.quote-card',testimonials);
    const cardCopy=[
      ['Know what comes next.','A defined sequence keeps decisions and responsibilities visible.','Process · visibility · control'],
      ['One design language.','Rooms, materials and details are judged against the same direction.','Continuity · proportion · finish'],
      ['Fewer expensive reversals.','More thinking happens before trades need an answer on site.','Planning · timing · confidence']
    ];
    cards.forEach((card,i)=>{
      const data=cardCopy[i];if(!data)return;
      $('h3',card) && ($('h3',card).textContent=data[0]);
      $('p',card) && ($('p',card).textContent=data[1]);
      const tags=$$('.quote-tags span',card);
      data[2].split(' · ').forEach((t,idx)=>{if(tags[idx])tags[idx].textContent=t;});
      $('footer',card) && ($('footer',card).textContent='VeroSpace working principle');
    });
  }

  /* Contact copy: client immediately understands the next move. */
  const contact=$('#contact');
  if(contact){
    $('#contact-title') && ($('#contact-title').textContent='Tell us what needs to change.');
    $('.contact-copy>p:last-child',contact) && ($('.contact-copy>p:last-child',contact).textContent='Share the space, the problem and the result you want. We will start from there.');
  }

  /* Menu: solid, simple, no competing mini-brochure. */
  const menu=$('#siteMenu');
  if(menu){
    $('.menu-kicker',menu) && ($('.menu-kicker',menu).textContent='Navigate');
    $('.menu-card-eyebrow',menu) && ($('.menu-card-eyebrow',menu).textContent='Ready to begin?');
    $('.menu-project-card h2',menu) && ($('.menu-project-card h2',menu).textContent='Start with the space you want to change.');
    $('.menu-consultation span',menu) && ($('.menu-consultation span',menu).textContent='Start a project');
  }

  /* Make all project imagery resilient. */
  $$('.project-image img,.cinematic-dialog-media img,.showcase-image img').forEach(img=>{
    img.loading=img.closest('#home')?'eager':'lazy';
    img.decoding='async';
    img.addEventListener('error',()=>{
      if(img.dataset.v5Fallback)return;
      img.dataset.v5Fallback='1';
      img.src='assets/verospace-featured-home.jpg';
    });
  });

  /* Keep the menu completely isolated from the page while open. */
  const menuBtn=$('.menu-button');
  menuBtn?.addEventListener('click',()=>requestAnimationFrame(()=>{
    const open=menu?.classList.contains('open');
    document.body.setAttribute('data-menu-open',open?'true':'false');
  }));

  /* Small premium cursor/tilt response only where a precise pointer exists. */
  if(window.matchMedia('(hover:hover) and (pointer:fine)').matches){
    $$('.cinematic-projects .project-card,.value-bridge-grid article').forEach(card=>{
      card.addEventListener('pointermove',e=>{
        const r=card.getBoundingClientRect();
        const x=(e.clientX-r.left)/r.width-.5;
        const y=(e.clientY-r.top)/r.height-.5;
        card.style.setProperty('--v5-tilt-x',`${(-y*1.2).toFixed(2)}deg`);
        card.style.setProperty('--v5-tilt-y',`${(x*1.2).toFixed(2)}deg`);
      },{passive:true});
      card.addEventListener('pointerleave',()=>{
        card.style.removeProperty('--v5-tilt-x');
        card.style.removeProperty('--v5-tilt-y');
      });
    });
  }
})();
