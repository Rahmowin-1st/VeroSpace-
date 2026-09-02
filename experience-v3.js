(() => {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');

  const photo = (id, title, tag, alt) => ({
    id, title, tag, alt,
    src: `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&fm=jpg&q=76&w=1000`
  });

  /* 23 curated free-use Unsplash references matching the VeroSpace white-shell / warm-timber direction. */
  const library = [
    photo('1674217444141-d8ca3bc66584','White shell','Timber floor','Bright white residential interior with warm timber floor'),
    photo('1782862965003-86af93ef9cf8','Long grain','Sunlight','Warm modern room with long timber furniture and sunlight'),
    photo('1625585598750-3535fe40efb3','Quiet white','Natural oak','Bright white room with simple timber details and daylight'),
    photo('1771371428960-35a50c2d4e7c','Open volume','Warm modern','Bright contemporary interior with open volume and natural materials'),
    photo('1784550283676-dba14673cfe7','Light first','Shadow + wood','Sunlight crossing a warm timber interior'),
    photo('1785706313842-541f09684d5f','Crafted calm','Bright room','Crafted bright room with timber floor and calm palette'),
    photo('1623286728232-9107cb8f6b11','Vertical space','Loft + storage','Tiny-home loft with white walls, warm timber and built-in storage'),
    photo('1588621356760-480a27a2d105','Compact living','Kitchen + loft','Compact tiny-home kitchen with white shell and loft ladder'),
    photo('1673246469598-6a73637fd6a8','Warm loft','Timber + light','Tiny-home loft bedroom with timber ceiling and daylight'),
    photo('1623286728208-672dcecba73a','Loft detail','Built-in shelf','White tiny-home loft bed with integrated timber shelf'),
    photo('1777613359406-d6bbc5b086c8','Slatted loft','Wood screen','Modern loft detail with warm timber slats and controlled light'),
    photo('1689688896639-1e9b7254c5ea','Forest kitchen','Small footprint','Compact wooden-house kitchen designed for a small footprint'),
    photo('1722650363591-312df029305a','Clean attic','White + oak','White attic room with oak floor and useful built-in shelving'),
    photo('1780427670049-43aa7921e3f0','Built-in living','Storage wall','Living room and kitchen with extensive timber built-in storage'),
    photo('1586425834670-d26c0f578af7','Cabin ladder','Vertical plan','Tiny cabin interior using a ladder to unlock vertical space'),
    photo('1723810737026-afbee93dd5a5','Loft room','Soft daylight','Bright loft room with white walls and warm timber floor'),
    photo('1727456171142-23e2b4afb84a','Timber cabin','Kitchen + stair','Wood-lined cabin interior with kitchen, dining and stair volume'),
    photo('1723468356954-8ed18cc926b1','Narrow kitchen','Warm cabinets','Narrow kitchen with timber cabinets and a bright white shell'),
    photo('1721739495881-a0d80c2ab7b3','White kitchen','Oak floor','White kitchen with warm wood floor and clean daylight'),
    photo('1723640584255-0a2850f65583','Attic kitchen','Dark timber top','Compact attic kitchen with white cabinetry and dark timber worktop'),
    photo('1642195582910-6d3dec42a142','Loft stair','Compact rise','Loft interior using a compact stair and warm timber'),
    photo('1771871799459-595aa9c68ef1','Skylight timber','Natural light','Warm wooden interior focused on skylight and natural light'),
    photo('1723468356954-8ed18cc926b1','Kitchen rhythm','Cabinet lines','Compact kitchen rhythm with warm cabinet fronts and white walls')
  ];

  /* Remove accidental duplicate while keeping the library stable. */
  const references = library.filter((item, index, arr) => arr.findIndex(x => x.id === item.id) === index);

  const rebuildGallery = () => {
    const grid = $('.reference-grid');
    const gallery = $('.reference-gallery');
    if (!grid || !gallery || grid.dataset.experienceV3 === 'true') return false;

    grid.innerHTML = references.map((item, index) => `
      <figure class="reference-tile" data-reference-index="${index}" tabindex="0" aria-label="Highlight reference ${index + 1}: ${item.title}">
        <img src="${item.src}" alt="${item.alt}" loading="lazy" decoding="async" fetchpriority="low" width="1000" height="750">
        <figcaption class="reference-caption"><strong>${item.title}</strong><span>${item.tag}</span></figcaption>
      </figure>
    `).join('');
    grid.dataset.experienceV3 = 'true';
    grid.dataset.expanded = 'true'; // prevent the legacy conversion layer from appending extra tiles after v3 owns the rail

    let controls = $('.reference-controls', gallery);
    if (!controls) {
      controls = document.createElement('div');
      controls.className = 'reference-controls';
      controls.innerHTML = `
        <span class="reference-count">01 / ${String(references.length).padStart(2,'0')}</span>
        <span class="reference-progress" aria-hidden="true"><i></i></span>
        <button class="reference-control" type="button" data-reference-prev aria-label="Previous references">←</button>
        <button class="reference-control" type="button" data-reference-next aria-label="Next references">→</button>
      `;
      const head = $('.reference-head', gallery);
      (head || gallery).appendChild(controls);
    }

    const step = () => Math.max(260, Math.min(grid.clientWidth * .76, 720));
    $('[data-reference-prev]', controls)?.addEventListener('click', () => grid.scrollBy({left:-step(), behavior: reduced.matches ? 'auto' : 'smooth'}));
    $('[data-reference-next]', controls)?.addEventListener('click', () => grid.scrollBy({left:step(), behavior: reduced.matches ? 'auto' : 'smooth'}));

    const updateProgress = () => {
      const max = Math.max(1, grid.scrollWidth - grid.clientWidth);
      const p = Math.min(1, Math.max(0, grid.scrollLeft / max));
      const progress = $('.reference-progress>i', controls);
      if (progress) progress.style.width = `${Math.max(5,p*100)}%`;
      const count = $('.reference-count', controls);
      if (count) {
        const approximate = Math.min(references.length, Math.max(1, Math.round(p * (references.length - 1)) + 1));
        count.textContent = `${String(approximate).padStart(2,'0')} / ${String(references.length).padStart(2,'0')}`;
      }
    };
    grid.addEventListener('scroll', updateProgress, {passive:true});
    addEventListener('resize', updateProgress, {passive:true});
    updateProgress();

    wireSelectable('.reference-tile', grid);
    animateNewReferences(grid);
    startIdlePreload(grid);
    return true;
  };

  const wireSelectable = (selector, scope = document) => {
    const nodes = $$(selector, scope);
    nodes.forEach(node => {
      if (node.dataset.selectableBound === 'true') return;
      node.dataset.selectableBound = 'true';
      let startX = 0, startY = 0, moved = false;
      const press = event => {
        const p = event.touches?.[0] || event;
        startX = p.clientX || 0; startY = p.clientY || 0; moved = false;
        const rect = node.getBoundingClientRect();
        node.style.setProperty('--press-x', `${(startX - rect.left)}px`);
        node.style.setProperty('--press-y', `${(startY - rect.top)}px`);
        node.classList.add('is-pressing');
      };
      const move = event => {
        const p = event.touches?.[0] || event;
        if (Math.hypot((p.clientX||0)-startX,(p.clientY||0)-startY) > 9) moved = true;
      };
      const release = () => {
        node.classList.remove('is-pressing');
        if (moved) return;
        nodes.forEach(other => {
          const selected = other === node;
          other.classList.toggle('is-selected', selected);
          other.setAttribute('aria-current', selected ? 'true' : 'false');
        });
      };
      node.addEventListener('pointerdown', press, {passive:true});
      node.addEventListener('pointermove', move, {passive:true});
      node.addEventListener('pointerup', release, {passive:true});
      node.addEventListener('pointercancel', () => node.classList.remove('is-pressing'), {passive:true});
      node.addEventListener('keydown', event => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault(); moved = false; release();
      });
    });
  };

  const animateNewReferences = grid => {
    const cards = $$('.reference-tile', grid);
    if (!window.gsap || reduced.matches) return;
    window.gsap.set(cards, {opacity:0, y:18, scale:.985});
    const reveal = () => window.gsap.to(cards, {opacity:1,y:0,scale:1,duration:.58,stagger:.035,ease:'power3.out',clearProps:'transform,opacity'});
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(entries => {
        if (!entries.some(e => e.isIntersecting)) return;
        io.disconnect(); reveal();
      }, {rootMargin:'160px'});
      io.observe(grid);
    } else reveal();
  };

  /* Idle preloading keeps compressed image data alive in object URLs without doing work during scroll. */
  const startIdlePreload = grid => {
    if (window.__verospaceImageCacheV3) return;
    const cache = window.__verospaceImageCacheV3 = new Map();
    const imgs = $$('.reference-tile img', grid);
    document.documentElement.dataset.referencePreloadTarget = String(imgs.length);
    let index = 0, scrolling = false, resumeTimer = 0, running = 0;
    const maxConcurrent = innerWidth <= 768 ? 1 : 2;

    addEventListener('scroll', () => {
      scrolling = true;
      clearTimeout(resumeTimer);
      resumeTimer = setTimeout(() => {scrolling = false; schedule();}, 260);
    }, {passive:true});

    const idle = cb => 'requestIdleCallback' in window ? requestIdleCallback(cb,{timeout:1200}) : setTimeout(() => cb({timeRemaining:()=>8,didTimeout:true}),80);

    const loadOne = async img => {
      const url = img.currentSrc || img.src;
      if (!url || cache.has(url)) return;
      try {
        const response = await fetch(url, {mode:'cors', cache:'force-cache', priority:'low'});
        if (!response.ok) throw new Error(String(response.status));
        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        cache.set(url, {blob, objectUrl});
        if (!img.complete || img.naturalWidth === 0) img.src = objectUrl;
      } catch {
        const preload = new Image();
        preload.decoding = 'async'; preload.fetchPriority = 'low'; preload.src = url;
        cache.set(url, {image:preload});
      }
    };

    const pump = deadline => {
      if (scrolling) return schedule();
      while (index < imgs.length && running < maxConcurrent && (deadline.didTimeout || deadline.timeRemaining() > 4)) {
        const img = imgs[index++]; running++;
        loadOne(img).finally(() => {running--; document.documentElement.dataset.referencePreloadCached = String(cache.size); schedule();});
      }
      if (index < imgs.length) schedule();
    };
    const schedule = () => {
      if (index >= imgs.length && running === 0) {
        document.documentElement.dataset.referencePreload = 'complete';
        return;
      }
      idle(pump);
    };

    const begin = () => setTimeout(schedule, 550);
    if (document.readyState === 'complete') begin(); else addEventListener('load', begin, {once:true});
  };

  const wireMainSelections = () => {
    wireSelectable('.process-list>li');
    wireSelectable('.service-feature');
    wireSelectable('.principles>div');
    wireSelectable('.trust-item');
  };

  const boot = () => {
    wireMainSelections();
    if (rebuildGallery()) return;
    const observer = new MutationObserver(() => {
      if (rebuildGallery()) observer.disconnect();
    });
    observer.observe(document.body,{childList:true,subtree:true});
    setTimeout(() => observer.disconnect(),8000);
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, {once:true});
  else boot();
})();
