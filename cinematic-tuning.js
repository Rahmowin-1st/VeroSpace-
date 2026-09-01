(()=>{
  'use strict';
  const hero=document.querySelector('#home');
  const media=hero?.querySelector('.hero-media');
  const image=media?.querySelector('img');
  const immersive=hero?.querySelector('.hero-immersive-copy');
  const chapter=hero?.querySelector('.hero-chapter');
  if(!hero||!media)return;
  const root=document.documentElement;
  const mobile=window.matchMedia('(max-width: 900px)');
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
  const clamp=v=>Math.min(1,Math.max(0,v));
  const mix=(a,b,t)=>a+(b-a)*t;
  const smooth=t=>t*t*(3-2*t);
  let raf=0;
  function frame(){
    raf=0;
    const range=Math.max(1,hero.offsetHeight-window.innerHeight);
    const p=clamp((window.scrollY-hero.offsetTop)/range);
    root.style.setProperty('--hero-p',p.toFixed(4));
    const rect=hero.getBoundingClientRect();
    const inHero=rect.bottom>window.innerHeight*.1&&rect.top<window.innerHeight*.4;
    root.classList.toggle('hero-immersed',inHero&&p>.34);
    if(!mobile.matches&&!reduced.matches){
      const t=smooth(clamp(p/.56));
      media.style.left=`${mix(48,0,t)}%`;
      media.style.top=`${mix(13,0,t)}%`;
      media.style.width=`${mix(48,100,t)}%`;
      media.style.height=`${mix(74,100,t)}%`;
      media.style.borderRadius=`${mix(46,0,t)}px`;
      if(image)image.style.filter=`saturate(.92) contrast(1.04) brightness(${mix(.98,.72,t)})`;
    }
    const show=smooth(clamp((p-.22)/.26));
    if(immersive){immersive.style.opacity=String(show);immersive.style.transform=`translateY(${mix(30,0,show)}px)`;}
    if(chapter)chapter.style.opacity=String(show*.9);
  }
  const queue=()=>{if(!raf)raf=requestAnimationFrame(frame);};
  window.addEventListener('scroll',queue,{passive:true});
  window.addEventListener('resize',queue,{passive:true});
  mobile.addEventListener?.('change',queue);
  frame();
})();
