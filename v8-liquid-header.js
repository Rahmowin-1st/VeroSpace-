(() => {
  'use strict';

  const header=document.querySelector('.site-header.liquid-glass');
  if(!header||header.dataset.vsLiquidHeader==='ready')return;
  header.dataset.vsLiquidHeader='ready';
  header.classList.add('vs-lg-ready');

  const ua=navigator.userAgent||'';
  const isChromium=/Chrome|Chromium|CriOS|Edg|OPR|SamsungBrowser/i.test(ua)&&!/Firefox|FxiOS/i.test(ua);
  document.documentElement.classList.add(isChromium?'vs-lg-svg-engine':'vs-lg-fallback');

  const clamp=(v,min,max)=>Math.min(max,Math.max(min,v));
  const svgNS='http://www.w3.org/2000/svg';
  let displacement=null,feImage=null,filter=null,baseScale=0;

  const roundedBoxSd=(x,y,halfW,halfH,radius)=>{
    const qx=Math.abs(x)-halfW+radius;
    const qy=Math.abs(y)-halfH+radius;
    const ox=Math.max(qx,0),oy=Math.max(qy,0);
    return Math.min(Math.max(qx,qy),0)+Math.hypot(ox,oy)-radius;
  };

  const makeLensMap=(width,height)=>{
    const map=document.createElement('canvas');
    const mapW=width>700?512:320;
    const mapH=96;
    map.width=mapW;map.height=mapH;
    const ctx=map.getContext('2d',{alpha:false});
    if(!ctx)return '';
    const image=ctx.createImageData(mapW,mapH);
    const data=image.data;
    const halfW=Math.max(2,width*.5-1.5),halfH=Math.max(2,height*.5-1.5);
    const radius=Math.max(2,halfH-1.5);
    const refractionHeight=Math.max(12,height*.34);
    const depthEffect=.58;
    const eps=1.15;

    for(let py=0;py<mapH;py++){
      const y=(py+.5)/mapH*height-height*.5;
      for(let px=0;px<mapW;px++){
        const x=(px+.5)/mapW*width-width*.5;
        const sd=roundedBoxSd(x,y,halfW,halfH,radius);
        let dx=0,dy=0;
        const edgeDepth=Math.max(-sd,0);
        if(sd<=1.5&&edgeDepth<refractionHeight){
          const sx1=roundedBoxSd(x+eps,y,halfW,halfH,radius);
          const sx0=roundedBoxSd(x-eps,y,halfW,halfH,radius);
          const sy1=roundedBoxSd(x,y+eps,halfW,halfH,radius);
          const sy0=roundedBoxSd(x,y-eps,halfW,halfH,radius);
          let nx=sx1-sx0,ny=sy1-sy0;
          const nlen=Math.hypot(nx,ny)||1;nx/=nlen;ny/=nlen;
          const clen=Math.hypot(x,y)||1;
          nx+=depthEffect*x/clen;ny+=depthEffect*y/clen;
          const glen=Math.hypot(nx,ny)||1;nx/=glen;ny/=glen;
          const t=clamp(1-edgeDepth/refractionHeight,0,1);
          const lens=1-Math.sqrt(Math.max(0,1-t*t));
          dx=-nx*lens;dy=-ny*lens;
        }
        const i=(py*mapW+px)*4;
        data[i]=Math.round(255*clamp(.5+dx*.5,0,1));
        data[i+1]=Math.round(255*clamp(.5+dy*.5,0,1));
        data[i+2]=128;data[i+3]=255;
      }
    }
    ctx.putImageData(image,0,0);
    return map.toDataURL('image/png');
  };

  const installSvgFilter=()=>{
    if(!isChromium)return;
    const svg=document.createElementNS(svgNS,'svg');
    svg.classList.add('vs-liquid-header-defs');
    svg.setAttribute('aria-hidden','true');
    svg.innerHTML='<defs><filter id="vs-liquid-header-filter" color-interpolation-filters="sRGB"><feGaussianBlur in="SourceGraphic" stdDeviation="0.72" result="vsPrepBlur"/><feColorMatrix in="vsPrepBlur" type="saturate" values="1.08" result="vsPrep"/><feImage id="vs-liquid-header-map" preserveAspectRatio="none" result="vsMap"/><feDisplacementMap id="vs-liquid-header-displace" in="vsPrep" in2="vsMap" scale="50" xChannelSelector="R" yChannelSelector="G" result="vsRefract"/></filter></defs>';
    document.body.appendChild(svg);
    filter=svg.querySelector('#vs-liquid-header-filter');
    feImage=svg.querySelector('#vs-liquid-header-map');
    displacement=svg.querySelector('#vs-liquid-header-displace');
  };

  installSvgFilter();

  const rebuildLens=()=>{
    if(!isChromium||!filter||!feImage||!displacement)return;
    const rect=header.getBoundingClientRect();
    const width=Math.max(1,rect.width),height=Math.max(1,rect.height);
    const pad=Math.max(36,height*.65);
    filter.setAttribute('filterUnits','userSpaceOnUse');
    filter.setAttribute('primitiveUnits','userSpaceOnUse');
    filter.setAttribute('x',String(-pad));
    filter.setAttribute('y',String(-pad));
    filter.setAttribute('width',String(width+pad*2));
    filter.setAttribute('height',String(height+pad*2));
    feImage.setAttribute('x','0');feImage.setAttribute('y','0');
    feImage.setAttribute('width',String(width));feImage.setAttribute('height',String(height));
    const uri=makeLensMap(width,height);
    feImage.setAttribute('href',uri);
    feImage.setAttributeNS('http://www.w3.org/1999/xlink','href',uri);
    baseScale=Math.min(width,height)*.86;
    displacement.setAttribute('scale',String(baseScale));
  };

  let resizeTimer=0;
  const scheduleRebuild=()=>{
    clearTimeout(resizeTimer);
    resizeTimer=setTimeout(rebuildLens,80);
  };
  addEventListener('resize',scheduleRebuild,{passive:true});
  if('ResizeObserver' in window)new ResizeObserver(scheduleRebuild).observe(header);
  rebuildLens();

  const updatePointer=e=>{
    const rect=header.getBoundingClientRect();
    const x=clamp((e.clientX-rect.left)/Math.max(1,rect.width),0,1);
    const y=clamp((e.clientY-rect.top)/Math.max(1,rect.height),0,1);
    header.style.setProperty('--lg-x',`${(x*100).toFixed(2)}%`);
    header.style.setProperty('--lg-y',`${(y*100).toFixed(2)}%`);
    header.style.setProperty('--lg-x-num',(x*100).toFixed(2));
  };
  header.addEventListener('pointermove',updatePointer,{passive:true});
  header.addEventListener('pointerleave',()=>{
    header.style.setProperty('--lg-x','50%');
    header.style.setProperty('--lg-y','18%');
    header.style.setProperty('--lg-x-num','50');
  },{passive:true});

  let press=0,velocity=0,target=0,raf=0,last=performance.now();
  const animatePress=now=>{
    const dt=Math.min(.034,(now-last)/1000);last=now;
    const stiffness=150,damping=21;
    const acceleration=(target-press)*stiffness-velocity*damping;
    velocity+=acceleration*dt;press+=velocity*dt;
    press=clamp(press,0,1.14);
    header.style.setProperty('--lg-press',press.toFixed(3));
    header.classList.toggle('vs-lg-pressed',press>.08);
    if(displacement)displacement.setAttribute('scale',String(baseScale*(1+press*.17)));
    if(Math.abs(target-press)>.002||Math.abs(velocity)>.008){raf=requestAnimationFrame(animatePress)}else{press=target;velocity=0;raf=0}
  };
  const setPress=value=>{
    target=value;last=performance.now();
    if(!raf)raf=requestAnimationFrame(animatePress);
  };
  header.addEventListener('pointerdown',e=>{updatePointer(e);setPress(1)},{passive:true});
  addEventListener('pointerup',()=>setPress(0),{passive:true});
  addEventListener('pointercancel',()=>setPress(0),{passive:true});

  const hero=document.querySelector('.hero');
  const curtain=document.querySelector('.menu-curtain');
  const updateTone=()=>{
    let dark=false;
    if(hero){
      const h=hero.getBoundingClientRect();
      const r=header.getBoundingClientRect();
      dark=h.bottom>r.top+r.height*.58;
    }
    if(curtain?.classList.contains('open'))dark=true;
    header.dataset.lgTone=dark?'dark':'light';
  };
  addEventListener('scroll',updateTone,{passive:true});
  if(curtain&&'MutationObserver' in window)new MutationObserver(updateTone).observe(curtain,{attributes:true,attributeFilter:['class']});
  updateTone();
})();
