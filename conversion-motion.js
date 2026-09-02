(() => {
  'use strict';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const root = document.documentElement;
  const GSAP_VERSION = '3.15.0';

  const qs = (selector, scope = document) => scope.querySelector(selector);
  const qsa = (selector, scope = document) => [...scope.querySelectorAll(selector)];

  const addStylesheet = href => {
    if (qsa('link[rel="stylesheet"]').some(link => link.href.includes(href.split('?')[0]))) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  };

  const loadScript = src => new Promise((resolve, reject) => {
    const existing = qsa('script[src]').find(script => script.src === src);
    if (existing) {
      if (existing.dataset.loaded === 'true') resolve();
      else existing.addEventListener('load', resolve, {once: true});
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.addEventListener('load', () => {
      script.dataset.loaded = 'true';
      resolve();
    }, {once: true});
    script.addEventListener('error', reject, {once: true});
    document.head.appendChild(script);
  });

  const setText = (selector, text) => {
    const el = qs(selector);
    if (el) el.textContent = text;
  };

  const rewriteCopy = () => {
    setText('.menu-kicker', 'VeroSpace · studio');
    setText('.menu-title-block strong', 'Find the proof. Then start.');
    setText('.menu-project-head span', 'Start a project');
    setText('.menu-project-head b', 'Focused consultation');
    setText('.menu-project-card h2', 'A clear first conversation.');
    setText('.menu-project-card p', 'Tell us what needs to change. We’ll shape the next design step.');

    setText('.hero-copy .eyebrow', 'Residential interiors · renovation · coordination');
    const heroTitle = qs('#hero-title');
    if (heroTitle) {
      heroTitle.innerHTML = '<span class="hero-line"><span>A calmer home.</span></span><span class="hero-line"><em>Built around how you live.</em></span>';
    }
    setText('.hero-lede', 'VeroSpace turns layout, materials and renovation into one clear design direction.');

    const projectHead = qs('#projects .section-head');
    if (projectHead) {
      const eyebrow = qs('.eyebrow', projectHead);
      const title = qs('h2', projectHead);
      const body = projectHead.lastElementChild;
      if (eyebrow) eyebrow.textContent = 'Selected transformations';
      if (title) title.textContent = 'See the problem. See the design response.';
      if (body?.tagName === 'P') body.textContent = 'Five concept studies showing how daylight, flow and storage can change a home.';
    }

    const servicesHead = qs('#services .section-head');
    if (servicesHead) {
      const title = qs('h2', servicesHead);
      const body = servicesHead.lastElementChild;
      if (title) title.textContent = 'One direction from first plan to final detail.';
      if (body?.tagName === 'P') body.textContent = 'Design, renovation planning and coordination stay connected.';
    }

    const story = qs('.story-copy');
    if (story) {
      setText('.story-copy h2', 'Warmth without clutter.');
      const body = qsa('p', story).find(p => !p.classList.contains('eyebrow'));
      if (body) body.textContent = 'Daylight, proportion and built-in storage do more work than decoration.';
    }

    const processHead = qs('#process .section-head');
    if (processHead) {
      const title = qs('h2', processHead);
      const body = processHead.lastElementChild;
      if (title) title.textContent = 'Know what happens next.';
      if (body?.tagName === 'P') body.textContent = 'Five clear stages. One accountable design direction.';
    }

    setText('#contact-title', 'Tell us what needs to change.');
    const contactBody = qsa('.contact-copy > p').find(p => !p.classList.contains('eyebrow'));
    if (contactBody) contactBody.textContent = 'Send the space, goal, budget and timing. We’ll start from there.';
  };

  const injectTrustBand = () => {
    if (qs('.trust-band')) return;
    const hero = qs('.hero');
    if (!hero) return;
    const band = document.createElement('section');
    band.className = 'trust-band';
    band.setAttribute('aria-label', 'How VeroSpace works');
    band.innerHTML = `
      <article class="trust-item"><b>01</b><div><strong>Scope first</strong><span>Decisions before decoration.</span></div></article>
      <article class="trust-item"><b>02</b><div><strong>One direction</strong><span>Layout, materials and renovation stay connected.</span></div></article>
      <article class="trust-item"><b>03</b><div><strong>Clear handover</strong><span>Design decisions carry into the build.</span></div></article>
      <article class="trust-item"><b>04</b><div><strong>Transparent work</strong><span>Concept studies are clearly labeled.</span></div></article>
    `;
    hero.insertAdjacentElement('afterend', band);
  };

  const injectProjectOutcomes = () => {
    const outcomes = {
      daylight: 'Clearer shared living + stronger daylight',
      oakline: 'More worktop + quieter storage',
      windowroom: 'Brighter layout + calmer edges',
      garden: 'Dining, circulation + view aligned',
      quietoak: 'Integrated storage + softer visual rhythm'
    };
    qsa('.project-card').forEach(card => {
      if (qs('.project-outcome', card)) return;
      const meta = qs('.project-meta', card);
      const button = qs('.project-open', card);
      if (!meta || !button) return;
      const line = document.createElement('p');
      line.className = 'project-outcome';
      line.innerHTML = `<b>Design result</b>${outcomes[card.dataset.project] || 'A clearer, more useful room'}`;
      meta.insertBefore(line, button);
    });
  };

  const referenceImages = [
    {
      src: 'https://images.unsplash.com/photo-1674217444141-d8ca3bc66584?auto=format&fit=crop&w=1600&q=84',
      alt: 'Minimal white kitchen with warm timber floor and clean natural light',
      title: 'White shell', tag: 'Timber floor'
    },
    {
      src: 'https://images.unsplash.com/photo-1782862965003-86af93ef9cf8?auto=format&fit=crop&w=1600&q=84',
      alt: 'Warm modern room with long timber furniture and sunlight',
      title: 'Long grain', tag: 'Sunlight'
    },
    {
      src: 'https://images.unsplash.com/photo-1625585598750-3535fe40efb3?auto=format&fit=crop&w=1600&q=84',
      alt: 'Bright white room with simple timber details and natural light',
      title: 'Quiet white', tag: 'Natural oak'
    },
    {
      src: 'https://images.unsplash.com/photo-1771371428960-35a50c2d4e7c?auto=format&fit=crop&w=1600&q=84',
      alt: 'Bright contemporary residential interior with natural materials',
      title: 'Open volume', tag: 'Warm modern'
    },
    {
      src: 'https://images.unsplash.com/photo-1784550283676-dba14673cfe7?auto=format&fit=crop&w=1600&q=84',
      alt: 'Sunlight crossing a warm timber interior surface',
      title: 'Light first', tag: 'Shadow + wood'
    },
    {
      src: 'https://images.unsplash.com/photo-1785706313842-541f09684d5f?auto=format&fit=crop&w=1600&q=84',
      alt: 'Bright crafted room with timber floor and calm material palette',
      title: 'Crafted calm', tag: 'Bright room'
    }
  ];

  const injectReferenceGallery = () => {
    if (qs('.reference-gallery')) return;
    const projects = qs('#projects');
    if (!projects) return;
    const section = document.createElement('section');
    section.className = 'reference-gallery';
    section.setAttribute('aria-labelledby', 'reference-title');
    section.innerHTML = `
      <div class="reference-head">
        <div><p class="eyebrow">Material direction</p><h2 id="reference-title">Bright shell. Warm timber. Useful space.</h2></div>
        <p>Reference imagery for the VeroSpace visual direction—not claimed project work.</p>
      </div>
      <div class="reference-grid">
        ${referenceImages.map((item, index) => `
          <figure class="reference-tile" data-reference-index="${index}">
            <img src="${item.src}" alt="${item.alt}" loading="lazy" decoding="async" width="1600" height="1200">
            <figcaption class="reference-caption"><strong>${item.title}</strong><span>${item.tag}</span></figcaption>
          </figure>
        `).join('')}
      </div>
    `;
    projects.insertAdjacentElement('afterend', section);
  };

  const wireScrollButton = button => {
    const target = button?.dataset.scroll;
    if (!button || !target || button.dataset.conversionScrollBound === 'true') return;
    button.dataset.conversionScrollBound = 'true';
    button.addEventListener('click', () => {
      const destination = qs(target);
      if (!destination) return;
      destination.scrollIntoView({behavior: reducedMotion.matches ? 'auto' : 'smooth', block: 'start'});
    });
  };

  const injectCtaBridge = () => {
    if (qs('.cta-bridge')) return;
    const gallery = qs('.reference-gallery');
    if (!gallery) return;
    const bridge = document.createElement('section');
    bridge.className = 'cta-bridge';
    bridge.setAttribute('aria-label', 'Start a VeroSpace project');
    bridge.innerHTML = `
      <div class="cta-bridge-copy">
        <p class="eyebrow">Planning a serious change?</p>
        <h2>Start with the space you have.</h2>
      </div>
      <div class="cta-bridge-actions">
        <button class="pill-button primary" type="button" data-scroll="#contact">Book a consultation</button>
        <button class="pill-button hero-secondary" type="button" data-scroll="#process">See the process</button>
      </div>
    `;
    gallery.insertAdjacentElement('afterend', bridge);
    qsa('[data-scroll]', bridge).forEach(wireScrollButton);
  };

  const injectProcessRail = () => {
    const list = qs('.process-list');
    if (!list || qs('.process-rail', list)) return;
    const rail = document.createElement('span');
    rail.className = 'process-rail';
    rail.setAttribute('aria-hidden', 'true');
    list.prepend(rail);
  };

  const injectFormTrust = () => {
    const form = qs('#consultationForm');
    if (!form || qs('.form-trust-note', form)) return;
    const note = document.createElement('div');
    note.className = 'form-trust-note';
    note.innerHTML = '<b>What to send</b><span>Property or room, what needs to change, budget range and timing. No polished brief required.</span>';
    const footer = qs('.form-footer', form);
    if (footer) form.insertBefore(note, footer);
    else form.append(note);
  };

  const prepareStructure = () => {
    addStylesheet('conversion.css?v=20260902c1');
    rewriteCopy();
    injectTrustBand();
    injectProjectOutcomes();
    injectReferenceGallery();
    injectCtaBridge();
    injectProcessRail();
    injectFormTrust();
    root.classList.add('conversion-structure-ready');
  };

  const animateMenu = gsap => {
    const menu = qs('#siteMenu');
    if (!menu) return;
    const observer = new MutationObserver(() => {
      if (!menu.classList.contains('open')) return;
      const links = qsa('.menu-links a', menu);
      const card = qs('.menu-project-card', menu);
      const title = qs('.menu-title-block', menu);
      gsap.killTweensOf([...links, card, title].filter(Boolean));
      const tl = gsap.timeline({defaults: {ease: 'power3.out'}});
      if (title) tl.fromTo(title, {x: -18, opacity: 0}, {x: 0, opacity: 1, duration: .42}, 0);
      tl.fromTo(links, {y: 18, opacity: 0, scale: .98}, {y: 0, opacity: 1, scale: 1, duration: .48, stagger: .055}, .05);
      if (card) tl.fromTo(card, {x: 24, opacity: 0, scale: .98}, {x: 0, opacity: 1, scale: 1, duration: .52}, .14);
    });
    observer.observe(menu, {attributes: true, attributeFilter: ['class']});
  };

  const animateDialog = gsap => {
    const dialog = qs('#projectDialog');
    if (!dialog) return;
    const observer = new MutationObserver(() => {
      if (!dialog.open) return;
      const media = qs('.dialog-media', dialog);
      const image = qs('.dialog-media img', dialog);
      const copy = qs('.dialog-copy', dialog);
      const facts = qsa('.dialog-facts > div', dialog);
      const tl = gsap.timeline({defaults: {ease: 'power3.out'}});
      if (media) tl.fromTo(media, {clipPath: 'inset(0 100% 0 0 round 28px)'}, {clipPath: 'inset(0 0% 0 0 round 28px)', duration: .66}, 0);
      if (image) tl.fromTo(image, {scale: 1.08}, {scale: 1, duration: .8, ease: 'power2.out'}, 0);
      if (copy) tl.fromTo(copy.children, {x: 24, opacity: 0}, {x: 0, opacity: 1, duration: .46, stagger: .055}, .1);
      if (facts.length) tl.fromTo(facts, {y: 16, opacity: 0, scale: .985}, {y: 0, opacity: 1, scale: 1, duration: .38, stagger: .05}, .18);
    });
    observer.observe(dialog, {attributes: true, attributeFilter: ['open']});
  };

  const initGsap = async () => {
    if (reducedMotion.matches) {
      root.dataset.motion = 'reduced';
      return;
    }

    try {
      if (!window.gsap) await loadScript(`https://cdn.jsdelivr.net/npm/gsap@${GSAP_VERSION}/dist/gsap.min.js`);
      if (!window.ScrollTrigger) await loadScript(`https://cdn.jsdelivr.net/npm/gsap@${GSAP_VERSION}/dist/ScrollTrigger.min.js`);
    } catch (error) {
      console.warn('VeroSpace motion library unavailable; static experience preserved.', error);
      root.dataset.motion = 'static-fallback';
      return;
    }

    const {gsap, ScrollTrigger} = window;
    if (!gsap || !ScrollTrigger) {
      root.dataset.motion = 'static-fallback';
      return;
    }

    gsap.registerPlugin(ScrollTrigger);
    root.classList.add('conversion-motion-ready');
    root.dataset.motion = 'gsap';

    gsap.defaults({force3D: true});

    /* Page-load sequence: composed like a slide deck, but never controls scroll. */
    const loadTl = gsap.timeline({defaults: {ease: 'power3.out'}});
    loadTl
      .fromTo('.site-header', {y: -72, opacity: 0, scale: .97}, {y: 0, opacity: 1, scale: 1, duration: .78}, 0)
      .fromTo('.hero-image', {scale: 1.12, clipPath: 'inset(4% 5% 6% 5% round 42px)'}, {scale: 1, clipPath: 'inset(0% 0% 0% 0% round 0px)', duration: 1.25, ease: 'power4.out'}, .02)
      .fromTo('.hero-shade', {opacity: 0}, {opacity: 1, duration: .72}, .14)
      .fromTo('.hero-copy .eyebrow', {x: -26, opacity: 0, letterSpacing: '.28em'}, {x: 0, opacity: 1, letterSpacing: '.18em', duration: .55}, .22)
      .fromTo('.hero-line > span, .hero-line > em', {yPercent: 115, rotateX: -12, opacity: 0}, {yPercent: 0, rotateX: 0, opacity: 1, duration: .82, stagger: .12, ease: 'power4.out'}, .28)
      .fromTo('.hero-lede', {x: 28, opacity: 0}, {x: 0, opacity: 1, duration: .58}, .52)
      .fromTo('.hero-primary', {y: 24, opacity: 0, scale: .96}, {y: 0, opacity: 1, scale: 1, duration: .5}, .62)
      .fromTo('.hero-secondary', {x: 26, opacity: 0}, {x: 0, opacity: 1, duration: .5}, .68);

    qsa('.trust-item').forEach((item, index) => {
      gsap.fromTo(item,
        {y: 34 + index * 4, opacity: 0, rotate: index % 2 ? 1.2 : -1.2, scale: .97},
        {y: 0, opacity: 1, rotate: 0, scale: 1, duration: .66, ease: 'power3.out', scrollTrigger: {trigger: item, start: 'top 94%', once: true}}
      );
    });

    qsa('.section-head').forEach((head, index) => {
      const children = [...head.children];
      gsap.fromTo(children,
        {x: (_, i) => i % 2 ? 34 : -34, y: index % 2 ? 12 : 0, opacity: 0},
        {x: 0, y: 0, opacity: 1, duration: .68, stagger: .08, ease: 'power3.out', scrollTrigger: {trigger: head, start: 'top 86%', once: true}}
      );
    });

    const projectVectors = [
      {x: -58, y: 22, rotate: -1.6},
      {x: 58, y: -8, rotate: 1.4},
      {x: -28, y: 46, rotate: -.8},
      {x: 42, y: 32, rotate: 1.2},
      {x: 0, y: 54, rotate: 0}
    ];
    qsa('.project-card').forEach((card, index) => {
      const vector = projectVectors[index % projectVectors.length];
      const image = qs('.project-image img', card);
      gsap.fromTo(card,
        {...vector, opacity: 0, scale: .975},
        {x: 0, y: 0, rotate: 0, opacity: 1, scale: 1, duration: .82, ease: 'power3.out', scrollTrigger: {trigger: card, start: 'top 87%', once: true}}
      );
      if (image) gsap.fromTo(image, {scale: 1.09}, {scale: 1, duration: 1.1, ease: 'power2.out', scrollTrigger: {trigger: card, start: 'top 88%', once: true}});
    });

    const serviceVectors = [
      {x: -44, y: 16, rotationY: 8},
      {x: 0, y: 40, rotationX: 7},
      {x: 34, y: -10, rotationY: -8},
      {x: 42, y: 28, rotation: 1.8}
    ];
    qsa('.service-feature').forEach((card, index) => {
      gsap.fromTo(card,
        {...serviceVectors[index % serviceVectors.length], opacity: 0, scale: .97, transformPerspective: 900},
        {x: 0, y: 0, rotationX: 0, rotationY: 0, rotation: 0, opacity: 1, scale: 1, duration: .72, ease: 'power3.out', scrollTrigger: {trigger: card, start: 'top 88%', once: true}}
      );
    });

    const storyImage = qs('.story-image');
    const storyCopy = qs('.story-copy');
    if (storyImage) gsap.fromTo(storyImage, {clipPath: 'polygon(0 0, 100% 9%, 82% 100%, 0 88%)', opacity: .35, scale: .96}, {clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)', opacity: 1, scale: 1, duration: 1, ease: 'power3.out', scrollTrigger: {trigger: storyImage, start: 'top 82%', once: true}});
    if (storyCopy) gsap.fromTo(storyCopy.children, {x: 42, opacity: 0}, {x: 0, opacity: 1, duration: .62, stagger: .075, ease: 'power3.out', scrollTrigger: {trigger: storyCopy, start: 'top 84%', once: true}});

    const tileVectors = [
      {x: -44, y: 14, rotate: -1.6, scale: .96},
      {x: 20, y: 42, rotate: 1.2, scale: .97},
      {x: 46, y: -14, rotate: 1.8, scale: .95},
      {x: -22, y: 36, rotate: -.8, scale: .97},
      {x: 36, y: 30, rotate: 1.2, scale: .96},
      {x: 0, y: 48, rotate: 0, scale: .95}
    ];
    qsa('.reference-tile').forEach((tile, index) => {
      const image = qs('img', tile);
      gsap.fromTo(tile,
        {...tileVectors[index % tileVectors.length], opacity: 0, clipPath: index % 2 ? 'inset(0 0 100% 0 round 28px)' : 'inset(100% 0 0 0 round 28px)'},
        {x: 0, y: 0, rotate: 0, scale: 1, opacity: 1, clipPath: 'inset(0% 0 0 0 round 28px)', duration: .88, ease: 'power3.out', scrollTrigger: {trigger: tile, start: 'top 90%', once: true}}
      );
      if (image) gsap.fromTo(image, {scale: 1.1}, {scale: 1, duration: 1.1, ease: 'power2.out', scrollTrigger: {trigger: tile, start: 'top 90%', once: true}});
    });

    const bridge = qs('.cta-bridge');
    if (bridge) {
      gsap.fromTo(bridge, {y: 38, opacity: 0, scale: .98}, {y: 0, opacity: 1, scale: 1, duration: .76, ease: 'power3.out', scrollTrigger: {trigger: bridge, start: 'top 88%', once: true}});
      gsap.fromTo('.cta-bridge-copy > *, .cta-bridge-actions > *', {y: 18, opacity: 0}, {y: 0, opacity: 1, duration: .5, stagger: .07, ease: 'power3.out', scrollTrigger: {trigger: bridge, start: 'top 86%', once: true}});
      gsap.to(bridge, {'--bridge-shift': '1', duration: 1});
    }

    const processItems = qsa('.process-list > li');
    const processVectors = [
      {x: -72, y: 0, rotate: -1.4},
      {x: 58, y: 18, rotate: 1.2},
      {x: -36, y: 44, rotate: -.8},
      {x: 52, y: -18, rotate: 1.1},
      {x: 0, y: 58, rotate: 0}
    ];
    processItems.forEach((item, index) => {
      gsap.fromTo(item,
        {...processVectors[index % processVectors.length], opacity: 0, scale: .975},
        {x: 0, y: 0, rotate: 0, opacity: 1, scale: 1, duration: .68, ease: 'power3.out', scrollTrigger: {trigger: item, start: 'top 91%', once: true}}
      );
    });

    qsa('.principles > div').forEach((card, index) => {
      gsap.fromTo(card,
        {y: 34, x: index === 0 ? -20 : index === 2 ? 20 : 0, opacity: 0, scale: .94, rotate: index === 0 ? -1.2 : index === 2 ? 1.2 : 0},
        {x: 0, y: 0, opacity: 1, scale: 1, rotate: 0, duration: .7, ease: 'back.out(1.35)', scrollTrigger: {trigger: card, start: 'top 90%', once: true}}
      );
    });

    const contactCopy = qs('.contact-copy');
    const contactForm = qs('.contact-form');
    if (contactCopy) gsap.fromTo(contactCopy.children, {x: -44, opacity: 0}, {x: 0, opacity: 1, duration: .62, stagger: .075, ease: 'power3.out', scrollTrigger: {trigger: contactCopy, start: 'top 84%', once: true}});
    if (contactForm) gsap.fromTo(contactForm, {x: 58, y: 18, opacity: 0, scale: .985}, {x: 0, y: 0, opacity: 1, scale: 1, duration: .78, ease: 'power3.out', scrollTrigger: {trigger: contactForm, start: 'top 86%', once: true}});

    const mm = gsap.matchMedia();
    mm.add('(min-width: 769px)', () => {
      qsa('.project-image img').forEach((image, index) => {
        gsap.to(image, {yPercent: index % 2 ? 4 : -4, ease: 'none', scrollTrigger: {trigger: image.closest('.project-card'), start: 'top bottom', end: 'bottom top', scrub: .7}});
      });
      qsa('.reference-tile img').forEach((image, index) => {
        gsap.to(image, {yPercent: index % 2 ? 5 : -5, scale: 1.035, ease: 'none', scrollTrigger: {trigger: image.closest('.reference-tile'), start: 'top bottom', end: 'bottom top', scrub: .8}});
      });
      if (storyImage) {
        const image = qs('img', storyImage);
        if (image) gsap.to(image, {yPercent: 5, scale: 1.035, ease: 'none', scrollTrigger: {trigger: storyImage, start: 'top bottom', end: 'bottom top', scrub: .8}});
      }
    });

    mm.add('(min-width: 769px)', () => {
      const rail = qs('.process-rail');
      if (rail) gsap.fromTo(rail, {scaleX: 0}, {scaleX: 1, ease: 'none', scrollTrigger: {trigger: '.process-list', start: 'top 78%', end: 'bottom 58%', scrub: .55}});
    });
    mm.add('(max-width: 768px)', () => {
      const rail = qs('.process-rail');
      if (rail) gsap.fromTo(rail, {scaleY: 0}, {scaleY: 1, ease: 'none', scrollTrigger: {trigger: '.process-list', start: 'top 82%', end: 'bottom 72%', scrub: .55}});
    });

    animateMenu(gsap);
    animateDialog(gsap);

    window.addEventListener('load', () => ScrollTrigger.refresh(), {once: true});
  };

  const boot = () => {
    prepareStructure();
    initGsap();
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, {once: true});
  else boot();
})();
