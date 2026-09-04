(() => {
  'use strict';
  const controls=[...document.querySelectorAll('.menu-button,.menu-close,.modal-close')];
  if(!controls.length)return;
  controls.forEach(el=>el.classList.add('vs-screen-glass'));
  const ua=navigator.userAgent||'';
  const isChromium=/Chrome|Chromium|CriOS|Edg|OPR|SamsungBrowser/i.test(ua)&&!/Firefox|FxiOS/i.test(ua);
  document.documentElement.classList.add(isChromium?'vs-fg-svg':'vs-fg-fallback');
  const clamp=(v,min,max)=>Math.min(max,Math.max(min,v));
  let displacement=null,baseScale=18;
  if(isChromium){
    const size=128,canvas=document.createElement('canvas');canvas.width=size;canvas.height=size;
    const ctx=canvas.getContext('2d',{alpha:false});
    if(ctx){
      const image=ctx.createImageData(size,size),data=image.data;
      for(let y=0;y<size;y++)for(let x=0;x<size;x++){
        const nx=((x+.5)/size)*2-1,ny=((y+.5)/size)*2-1,r=Math.hypot(nx,ny);
        let dx=0,dy=0;
        if(r<=1){
          const edge=1-r;
          if(edge<.52){
            const t=clamp(1-edge/.52,0,1);
            const lens=1-Math.sqrt(Math.max(0,1-t*t));
            const inv=r>1e-4?1/r:0;
            dx=-nx*inv*lens;dy=-ny*inv*lens;
          }
        }
        const i=(y*size+x)*4;
        data[i]=Math.round(255*clamp(.5+dx*.5,0,1));
        data[i+1]=Math.round(255*clamp(.5+dy*.5,0,1));
        data[i+2]=128;data[i+3]=255;
      }
      ctx.putImageData(image,0,0);
      const uri=canvas.toDataURL('image/png');
      const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
      svg.classList.add('vs-floating-glass-defs');svg.setAttribute('aria-hidden','true');
      svg.innerHTML=`<defs><filter id="vs-floating-glass-filter" x="-45%" y="-45%" width="190%" height="190%" color-interpolation-filters="sRGB"><feGaussianBlur in="SourceGraphic" stdDeviation="0.35" result="prepBlur"/><feColorMatrix in="prepBlur" type="saturate" values="1.08" result="prep"/><feImage href="${uri}" x="0" y="0" width="100%" height="100%" preserveAspectRatio="none" result="map"/><feDisplacementMap id="vs-floating-glass-displace" in="prep" in2="map" scale="18" xChannelSelector="R" yChannelSelector="G"/></filter></defs>`;
      document.body.appendChild(svg);
      displacement=svg.querySelector('#vs-floating-glass-displace');
    }
  }
  controls.forEach(control=>{
    let press=0,velocity=0,target=0,raf=0,last=performance.now();
    const updatePoint=e=>{
      const r=control.getBoundingClientRect();
      const x=clamp((e.clientX-r.left)/Math.max(1,r.width),0,1);
      const y=clamp((e.clientY-r.top)/Math.max(1,r.height),0,1);
      control.style.setProperty('--fg-x',`${(x*100).toFixed(1)}%`);
      control.style.setProperty('--fg-y',`${(y*100).toFixed(1)}%`);
    };
    const animate=now=>{
      const dt=Math.min(.034,(now-last)/1000);last=now;
      const acceleration=(target-press)*165-velocity*23;
      velocity+=acceleration*dt;press=clamp(press+velocity*dt,0,1.12);
      control.style.setProperty('--fg-press',press.toFixed(3));
      control.classList.toggle('vs-fg-pressed',press>.08);
      if(displacement)displacement.setAttribute('scale',String(baseScale*(1+press*.18)));
      if(Math.abs(target-press)>.002||Math.abs(velocity)>.008)raf=requestAnimationFrame(animate);else{press=target;velocity=0;raf=0}
    };
    const setPress=value=>{target=value;last=performance.now();if(!raf)raf=requestAnimationFrame(animate)};
    control.addEventListener('pointermove',updatePoint,{passive:true});
    control.addEventListener('pointerdown',e=>{updatePoint(e);setPress(1)},{passive:true});
    control.addEventListener('pointerleave',()=>{control.style.setProperty('--fg-x','50%');control.style.setProperty('--fg-y','20%')},{passive:true});
    control.addEventListener('pointerup',()=>setPress(0),{passive:true});
    control.addEventListener('pointercancel',()=>setPress(0),{passive:true});
  });
})();
