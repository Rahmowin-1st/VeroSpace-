(() => {
  'use strict';

  const q = (s, root = document) => root.querySelector(s);
  const qa = (s, root = document) => [...root.querySelectorAll(s)];

  const setText = (selector, value) => {
    const el = q(selector);
    if (el) el.textContent = value;
  };

  const addHeroReassurance = () => {
    const actions = q('.hero-actions');
    if (!actions || q('.hero-reassurance')) return;
    const note = document.createElement('p');
    note.className = 'hero-reassurance';
    note.innerHTML = '<span aria-hidden="true">✓</span> No polished brief needed.';
    actions.insertAdjacentElement('afterend', note);
  };

  const tightenCopy = () => {
    const services = qa('.service-feature');
    const serviceCopy = [
      ['Interior design', 'Layout, light, materials and furniture.'],
      ['Renovation planning', 'Scope and decisions before work starts.'],
      ['Space planning', 'Flow, storage and usable space.'],
      ['Project coordination', 'Specifications, reviews and handover.']
    ];
    services.forEach((card, i) => {
      const [title, body] = serviceCopy[i] || [];
      if (title) setTextIn(card, 'h3', title);
      if (body) setTextIn(card, 'p', body);
    });

    const processCopy = [
      ['Consult', 'Goals, budget, constraints.'],
      ['Plan', 'Flow, zones, storage.'],
      ['Design', 'Light, materials, details.'],
      ['Coordinate', 'Specs, reviews, decisions.'],
      ['Finish', 'Checks, styling, handover.']
    ];
    qa('.process-list > li').forEach((item, i) => {
      const [title, body] = processCopy[i] || [];
      if (title) setTextIn(item, 'h3', title);
      if (body) setTextIn(item, 'p', body);
    });

    setText('.principles > div:nth-child(1) p', 'Flow and storage come first.');
    setText('.principles > div:nth-child(2) p', 'Daylight carries the room.');
    setText('.principles > div:nth-child(3) p', 'Beauty has to survive daily use.');

    const bridge = q('.cta-bridge');
    if (bridge) {
      setTextIn(bridge, '.eyebrow', 'Ready for a clearer plan?');
      setTextIn(bridge, 'h2', 'Start with the space you have.');
      const primary = q('.cta-bridge-actions [data-scroll="#contact"]', bridge);
      const secondary = q('.cta-bridge-actions [data-scroll="#process"]', bridge);
      if (primary) primary.textContent = 'Book a consultation';
      if (secondary) secondary.textContent = 'Review the process';
    }

    const formTrust = q('.form-trust-note');
    if (formTrust) {
      const strong = q('b', formTrust);
      const span = q('span', formTrust);
      if (strong) strong.textContent = 'Bring four things';
      if (span) span.textContent = 'The space, what needs to change, budget range and timing.';
    }
  };

  function setTextIn(root, selector, value) {
    const el = q(selector, root);
    if (el) el.textContent = value;
  }

  const extraReferences = [
    {
      src: 'https://images.unsplash.com/photo-1623286728232-9107cb8f6b11?auto=format&fit=crop&w=1600&q=84',
      alt: 'Tiny-home loft interior with white walls, warm timber and built-in storage',
      title: 'Vertical space',
      tag: 'Loft + storage'
    },
    {
      src: 'https://images.unsplash.com/photo-1623286728208-672dcecba73a?auto=format&fit=crop&w=1600&q=84',
      alt: 'Compact tiny-home interior with loft, crafted timber and a white shell',
      title: 'Compact living',
      tag: 'Built-in utility'
    },
    {
      src: 'https://images.unsplash.com/photo-1768413292067-fd4c2bdd64c5?auto=format&fit=crop&w=1600&q=84',
      alt: 'Modern timber mezzanine interior with warm natural material and daylight',
      title: 'Warm volume',
      tag: 'Mezzanine'
    }
  ];

  const expandReferenceGallery = () => {
    const grid = q('.reference-grid');
    if (!grid || grid.dataset.expanded === 'true') return;
    const start = qa('.reference-tile', grid).length;
    extraReferences.forEach((item, offset) => {
      const figure = document.createElement('figure');
      figure.className = 'reference-tile reference-tile-extra';
      figure.dataset.referenceIndex = String(start + offset);
      figure.innerHTML = `
        <img src="${item.src}" alt="${item.alt}" loading="lazy" decoding="async" width="1600" height="1200">
        <figcaption class="reference-caption"><strong>${item.title}</strong><span>${item.tag}</span></figcaption>
      `;
      grid.appendChild(figure);
    });
    grid.dataset.expanded = 'true';
  };

  const reorderForDecisionFlow = () => {
    const main = q('main');
    const hero = q('#home');
    const trust = q('.trust-band');
    const projects = q('#projects');
    const services = q('#services');
    const gallery = q('.reference-gallery');
    const story = q('.visual-story');
    const process = q('#process');
    const principles = q('.principles');
    const bridge = q('.cta-bridge');
    const contact = q('#contact');
    if (!main || !hero || !projects || !services || !process || !contact) return;

    const ordered = [hero, trust, projects, services, gallery, story, process, principles, bridge, contact].filter(Boolean);
    ordered.forEach(node => main.appendChild(node));
    main.dataset.conversionOrder = 'outcome-trust-proof-offer-taste-certainty-decision';
  };

  const markTrust = () => {
    const items = qa('.trust-item');
    const copy = [
      ['Scope first', 'Decide what changes before styling it.'],
      ['One direction', 'Layout, materials and renovation stay connected.'],
      ['Daily use', 'Storage, flow and light earn their place.'],
      ['Transparent proof', 'Concept work is labeled as concept work.']
    ];
    items.forEach((item, i) => {
      const [title, body] = copy[i] || [];
      if (title) setTextIn(item, 'strong', title);
      if (body) setTextIn(item, 'span', body);
    });
  };

  const addMotionHooks = () => {
    qa('.trust-item, .project-card, .service-feature, .reference-tile, .process-list > li, .principles > div').forEach((el, i) => {
      el.dataset.motionIndex = String(i);
    });
    document.documentElement.classList.add('conversion-flow-ready');
  };

  const boot = () => {
    addHeroReassurance();
    expandReferenceGallery();
    markTrust();
    tightenCopy();
    reorderForDecisionFlow();
    addMotionHooks();
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, {once: true});
  else boot();
})();
