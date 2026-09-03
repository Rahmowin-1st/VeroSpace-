(() => {
  'use strict';

  const $=(s,r=document)=>r.querySelector(s);
  const $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');

  /* Consultation: restore the earlier approved Sending → Succeeded / Could not send state flow. */
  const form=$('#consultationForm');
  if(form){
    const status=$('#formStatus');
    const overlay=document.createElement('div');
    overlay.className='send-overlay';
    overlay.id='sendOverlay';
    overlay.setAttribute('aria-hidden','true');
    overlay.innerHTML='<div class="send-card" role="status" aria-live="polite"><div class="send-mark" id="sendMark">V</div><h2 id="sendTitle">Sending…</h2><p id="sendText">Your request is being sent securely.</p></div>';
    document.body.appendChild(overlay);

    const mark=$('#sendMark',overlay),title=$('#sendTitle',overlay),text=$('#sendText',overlay);
    let closeTimer=0;
    const sendState=state=>{
      clearTimeout(closeTimer);
      overlay.classList.add('open');
      overlay.setAttribute('aria-hidden','false');
      mark.textContent=state==='sending'?'V':state==='success'?'✓':'!';
      title.textContent=state==='sending'?'Sending…':state==='success'?'Succeeded':'Could not send';
      text.textContent=state==='sending'?'Your request is being sent securely.':state==='success'?'Your consultation request was sent successfully.':'Your form has been kept. Try again.';
    };
    const closeSend=()=>{
      overlay.classList.remove('open');
      overlay.setAttribute('aria-hidden','true');
    };

    const setError=(field,message='')=>{
      const label=field.closest('label');
      label?.classList.toggle('error',Boolean(message));
      const error=$(`[data-error="${field.name}"]`,form)||$(`[data-error-for="${field.name}"]`,form);
      if(error)error.textContent=message;
      field.setAttribute('aria-invalid',message?'true':'false');
      return !message;
    };
    const validate=()=>{
      let first=null;
      const emailRe=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const rules={
        name:v=>v.trim()?'':'Enter your name.',
        email:v=>emailRe.test(v.trim())?'':'Enter a valid email.',
        project:v=>v?'':'Choose a project type.',
        budget:v=>v?'':'Choose a budget range.',
        message:v=>v.trim().length>=3?'':'Tell us a little about the space.'
      };
      Object.entries(rules).forEach(([name,rule])=>{
        const field=form.elements[name];
        if(!field)return;
        const message=rule(String(field.value||''));
        setError(field,message);
        if(message&&!first)first=field;
      });
      if(first){first.focus();return false;}
      return true;
    };

    form.addEventListener('submit',async event=>{
      event.preventDefault();
      event.stopImmediatePropagation();
      if(form.elements.website?.value)return;
      if(!validate()){
        if(status)status.textContent='Please complete the required fields.';
        return;
      }

      const submit=$('button[type="submit"]',form);
      if(submit)submit.disabled=true;
      if(status)status.textContent='';
      sendState('sending');

      const fd=new FormData(form);
      const payload={
        name:String(fd.get('name')||'').trim(),
        email:String(fd.get('email')||'').trim(),
        project:String(fd.get('project')||'').trim(),
        budget:String(fd.get('budget')||'').trim(),
        message:String(fd.get('message')||'').trim(),
        requestId:crypto?.randomUUID?.()||`${Date.now()}-${Math.random()}`
      };

      try{
        const response=await fetch('/api/consultation',{
          method:'POST',
          headers:{'Content-Type':'application/json','X-Request-Id':payload.requestId},
          body:JSON.stringify(payload)
        });
        const data=await response.json().catch(()=>({}));
        if(!response.ok||!data.ok)throw new Error(`HTTP ${response.status}`);
        sendState('success');
        form.reset();
        $$('label.error',form).forEach(label=>label.classList.remove('error'));
        $$('[aria-invalid="true"]',form).forEach(field=>field.setAttribute('aria-invalid','false'));
        $$('[data-error],[data-error-for]',form).forEach(el=>el.textContent='');
        if(status)status.textContent='Request sent.';
        closeTimer=setTimeout(closeSend,1800);
      }catch(error){
        console.error('Consultation request failed',error);
        sendState('error');
        if(status)status.textContent='Send failed — your details are still here.';
        closeTimer=setTimeout(closeSend,2600);
      }finally{
        if(submit)submit.disabled=false;
      }
    },true);
  }

  /* Project imagery: one discrete image per swipe. No partial two-image drag state. */
  const controllers=new WeakMap();
  const counterTimers=new WeakMap();

  const showCounter=(counter,index,total)=>{
    if(!counter)return;
    counter.textContent=`${String(index+1).padStart(2,'0')}/${String(total).padStart(2,'0')}`;
    counter.classList.add('v6-counter-visible');
    clearTimeout(counterTimers.get(counter));
    counterTimers.set(counter,setTimeout(()=>counter.classList.remove('v6-counter-visible'),1500));
  };

  const animateImage=figure=>{
    const image=$('img',figure);
    if(!image||reduced.matches)return;
    image.getAnimations?.().forEach(animation=>animation.cancel());
    image.animate([
      {transform:'scale(1.015)'},
      {transform:'scale(1.075)',offset:.62},
      {transform:'scale(1.045)'}
    ],{
      duration:820,
      easing:'cubic-bezier(.16,1,.3,1)',
      fill:'forwards'
    });
  };

  const bindCarousel=(track,counter)=>{
    if(!track)return null;
    if(controllers.has(track))return controllers.get(track);

    let slides=[];
    let index=0;
    let start=null;
    let wheelLockedUntil=0;

    const refresh=()=>{
      slides=$$('figure',track);
      index=Math.max(0,Math.min(index,Math.max(0,slides.length-1)));
      slides.forEach((slide,i)=>slide.classList.toggle('v6-active',i===index));
      track.dataset.v6Index=String(index);
    };

    const moveTo=(next,{announce=true,zoom=true}={})=>{
      refresh();
      if(!slides.length)return;
      const target=Math.max(0,Math.min(slides.length-1,next));
      const changed=target!==index;
      index=target;
      slides.forEach((slide,i)=>slide.classList.toggle('v6-active',i===index));
      track.dataset.v6Index=String(index);
      if(zoom&&(changed||announce))animateImage(slides[index]);
      if(announce)showCounter(counter,index,slides.length);
    };

    track.tabIndex=0;
    track.setAttribute('role','group');
    track.setAttribute('aria-label','Swipe project images');

    track.addEventListener('pointerdown',event=>{
      if(event.pointerType==='mouse'&&event.button!==0)return;
      start={x:event.clientX,y:event.clientY,t:performance.now()};
    },{passive:true});
    track.addEventListener('pointerup',event=>{
      if(!start)return;
      const dx=event.clientX-start.x;
      const dy=event.clientY-start.y;
      const dt=Math.max(1,performance.now()-start.t);
      start=null;
      const horizontal=Math.abs(dx)>Math.abs(dy)*1.1;
      const committed=horizontal&&(Math.abs(dx)>=42||Math.abs(dx)/dt>.45);
      if(committed)moveTo(index+(dx<0?1:-1),{announce:true,zoom:true});
    },{passive:true});
    track.addEventListener('pointercancel',()=>{start=null;},{passive:true});

    track.addEventListener('wheel',event=>{
      const horizontal=Math.abs(event.deltaX)>Math.max(24,Math.abs(event.deltaY)*1.2);
      if(!horizontal)return;
      event.preventDefault();
      const now=performance.now();
      if(now<wheelLockedUntil)return;
      wheelLockedUntil=now+520;
      moveTo(index+(event.deltaX>0?1:-1),{announce:true,zoom:true});
    },{passive:false});

    track.addEventListener('keydown',event=>{
      if(event.key==='ArrowRight'){event.preventDefault();moveTo(index+1,{announce:true,zoom:true});}
      if(event.key==='ArrowLeft'){event.preventDefault();moveTo(index-1,{announce:true,zoom:true});}
    });

    const controller={refresh,moveTo,get index(){return index;}};
    controllers.set(track,controller);
    refresh();
    return controller;
  };

  $$('.project-stage').forEach(stage=>{
    const track=$('.project-track',stage);
    const counter=$('.swipe-counter',stage);
    bindCarousel(track,counter);
    $$('.project-arrow-group button',stage).forEach(button=>{button.tabIndex=-1;button.setAttribute('aria-hidden','true');});
  });

  const modalTrack=$('.modal-track');
  if(modalTrack){
    const modalController=bindCarousel(modalTrack,$('.modal-counter'));
    const observer=new MutationObserver(()=>{
      modalController?.moveTo(0,{announce:false,zoom:false});
      modalController?.refresh();
    });
    observer.observe(modalTrack,{childList:true});
    $$('.modal-arrow-group button').forEach(button=>{button.tabIndex=-1;button.setAttribute('aria-hidden','true');});
  }
})();
