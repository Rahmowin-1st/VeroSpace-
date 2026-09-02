(() => {
  'use strict';

  const PRESSABLE = [
    'button:not([disabled])',
    'a[href]',
    'summary',
    '.project-card',
    '.process-list li',
    '.service-feature',
    '.principles > div',
    '[role="button"]'
  ].join(',');

  const activePresses = new Set();
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  const closestPressable = target => {
    const el = target instanceof Element ? target : target?.parentElement;
    return el?.closest(PRESSABLE) || null;
  };

  const endPress = (el, delay = 0) => {
    if (!el) return;
    const clear = () => {
      el.classList.remove('is-pressing');
      activePresses.delete(el);
    };
    if (delay && !reducedMotion.matches) window.setTimeout(clear, delay);
    else clear();
  };

  document.addEventListener('pointerdown', event => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    const el = closestPressable(event.target);
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const x = rect.width ? ((event.clientX - rect.left) / rect.width) * 100 : 50;
    const y = rect.height ? ((event.clientY - rect.top) / rect.height) * 100 : 50;
    el.style.setProperty('--press-x', `${Math.max(0, Math.min(100, x))}%`);
    el.style.setProperty('--press-y', `${Math.max(0, Math.min(100, y))}%`);
    el.classList.add('is-pressing');
    activePresses.add(el);
  }, {passive: true});

  document.addEventListener('pointerup', event => {
    endPress(closestPressable(event.target), 90);
  }, {passive: true});

  document.addEventListener('pointercancel', event => {
    endPress(closestPressable(event.target));
  }, {passive: true});

  window.addEventListener('blur', () => {
    activePresses.forEach(el => endPress(el));
  });

  document.querySelectorAll('.project-card').forEach(card => {
    if (!card.hasAttribute('tabindex')) card.tabIndex = 0;
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', `Open ${card.querySelector('h3')?.textContent?.trim() || 'project'}`);

    const open = () => card.querySelector('.project-open')?.click();

    card.addEventListener('click', event => {
      if (event.target.closest('button,a,input,select,textarea,summary')) return;
      open();
    });

    card.addEventListener('keydown', event => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      open();
    });
  });

  const dialog = document.querySelector('#projectDialog');
  if (dialog) {
    const observer = new MutationObserver(() => {
      if (!dialog.open) return;
      const copy = dialog.querySelector('.dialog-copy');
      if (copy) copy.scrollTop = 0;
      document.documentElement.classList.add('project-is-open');
    });
    observer.observe(dialog, {attributes: true, attributeFilter: ['open']});
    dialog.addEventListener('close', () => {
      document.documentElement.classList.remove('project-is-open');
    });
  }

  const menu = document.querySelector('#siteMenu');
  const menuButton = document.querySelector('.menu-button');
  if (menu && menuButton) {
    const syncMenuRoot = () => {
      document.documentElement.classList.toggle('ultra-menu-open', menu.classList.contains('open'));
    };
    const menuObserver = new MutationObserver(syncMenuRoot);
    menuObserver.observe(menu, {attributes: true, attributeFilter: ['class']});
    syncMenuRoot();
  }
})();

/* Code-only conversion round. Load in strict order; production is untouched. */
(() => {
  if (document.querySelector('script[data-verospace-conversion]')) return;

  const appendScript = (src, marker) => new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.async = false;
    script.dataset[marker] = 'true';
    script.addEventListener('load', resolve, {once: true});
    script.addEventListener('error', reject, {once: true});
    document.head.appendChild(script);
  });

  appendScript('conversion-motion.js?v=20260902c2', 'verospaceConversion')
    .then(() => appendScript('conversion-flow.js?v=20260902c2', 'verospaceConversionFlow'))
    .catch(error => {
      console.warn('VeroSpace conversion layer unavailable; base experience preserved.', error);
      document.documentElement.dataset.conversion = 'static-fallback';
    });
})();
