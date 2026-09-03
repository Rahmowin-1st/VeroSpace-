(() => {
  'use strict';

  const $=(s,r=document)=>r.querySelector(s);
  const $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');

  /* -------------------------------------------------------------
     Blur-free optical Liquid Glass interaction
  ------------------------------------------------------------- */
  const glass=$('.site-header.liquid-glass');
  if(glass){
    const move=event=>{
      const rect=glass.getBoundingClientRect();
      const x=Math.max(0,Math.min(100,((event.clientX-rect.left)/Math.max(1,rect.width))*100));
      const y=Math.max(0,Math.min(100,((event.clientY-rect.top)/Math.max(1,rect.height))*100));
      glass.style.setProperty('--glass-x',`${x}%`);
      glass.style.setProperty('--glass-y',`${y}%`);
      glass.style.setProperty('--glass-shift',`${(x-50)*.22}%`);
    };
    glass.addEventListener('pointermove',move,{passive:true});
    glass.addEventListener('pointerleave',()=>{
      glass.style.setProperty('--glass-x','50%');
      glass.style.setProperty('--glass-y','0%');
      glass.style.setProperty('--glass-shift','-14%');
    },{passive:true});
  }

  /* -------------------------------------------------------------
     Canonical custom VeroSpace listbox — native select removed.
  ------------------------------------------------------------- */
  const customSelects=new Map();
  let openSelect=null;

  const closeSelect=(shell,{restore=false}={})=>{
    if(!shell)return;
    shell.classList.remove('open','open-up');
    const trigger=$('.vs-select-trigger',shell);
    trigger?.setAttribute('aria-expanded','false');
    if(restore)trigger?.focus({preventScroll:true});
    if(openSelect===shell)openSelect=null;
  };

  const closeAllSelects=()=>{if(openSelect)closeSelect(openSelect)};

  $$('select[name]',document).forEach((select,selectIndex)=>{
    const label=select.closest('label');
    if(!label)return;
    const name=select.name;
    const options=[...select.options].map(option=>({value:option.value,label:option.textContent.trim()}));
    const initial=select.value;

    const hidden=document.createElement('input');
    hidden.type='hidden';
    hidden.name=name;
    hidden.value=initial;
    hidden.dataset.vsNativeReplacement='true';

    const shell=document.createElement('div');
    shell.className='vs-select-shell';
    shell.dataset.name=name;

    const trigger=document.createElement('button');
    trigger.type='button';
    trigger.className='vs-select-trigger pressable';
    trigger.id=`vsSelectTrigger${selectIndex}`;
    trigger.setAttribute('aria-haspopup','listbox');
    trigger.setAttribute('aria-expanded','false');

    const list=document.createElement('div');
    list.className='vs-select-list';
    list.id=`vsSelectList${selectIndex}`;
    list.setAttribute('role','listbox');
    list.setAttribute('aria-labelledby',trigger.id);
    trigger.setAttribute('aria-controls',list.id);

    const labelFor=value=>options.find(option=>option.value===value)?.label||options[0]?.label||'Choose one';
    const render=()=>{
      trigger.textContent=labelFor(hidden.value);
      shell.classList.toggle('has-value',Boolean(hidden.value));
      $$('.vs-select-option',list).forEach(option=>option.setAttribute('aria-selected',String(option.dataset.value===hidden.value)));
    };

    const choose=value=>{
      hidden.value=value;
      hidden.dispatchEvent(new Event('change',{bubbles:true}));
      render();
      closeSelect(shell,{restore:true});
    };

    options.forEach((option,optionIndex)=>{
      const button=document.createElement('button');
      button.type='button';
      button.className='vs-select-option';
      button.setAttribute('role','option');
      button.dataset.value=option.value;
      button.dataset.index=String(optionIndex);
      button.textContent=option.label;
      button.addEventListener('click',event=>{event.preventDefault();choose(option.value)});
      list.appendChild(button);
    });

    const open=()=>{
      if(openSelect&&openSelect!==shell)closeSelect(openSelect);
      shell.classList.add('open');
      trigger.setAttribute('aria-expanded','true');
      openSelect=shell;
      requestAnimationFrame(()=>{
        const rect=list.getBoundingClientRect();
        shell.classList.toggle('open-up',rect.bottom>innerHeight-12&&trigger.getBoundingClientRect().top>rect.height+24);
        const selected=$('.vs-select-option[aria-selected="true"]',list)||$('.vs-select-option',list);
        selected?.focus({preventScroll:true});
      });
    };

    trigger.addEventListener('click',event=>{
      event.preventDefault();
      shell.classList.contains('open')?closeSelect(shell):open();
    });
    trigger.addEventListener('keydown',event=>{
      if(event.key==='ArrowDown'||event.key==='ArrowUp'){
        event.preventDefault();
        if(!shell.classList.contains('open'))open();
      }
    });
    list.addEventListener('keydown',event=>{
      const items=$$('.vs-select-option',list);
      const active=document.activeElement;
      const current=Math.max(0,items.indexOf(active));
      if(event.key==='ArrowDown'){event.preventDefault();items[(current+1)%items.length]?.focus()}
      else if(event.key==='ArrowUp'){event.preventDefault();items[(current-1+items.length)%items.length]?.focus()}
      else if(event.key==='Home'){event.preventDefault();items[0]?.focus()}
      else if(event.key==='End'){event.preventDefault();items.at(-1)?.focus()}
      else if(event.key==='Escape'){event.preventDefault();closeSelect(shell,{restore:true})}
      else if(event.key==='Enter'||event.key===' '){if(active?.classList.contains('vs-select-option')){event.preventDefault();choose(active.dataset.value)}}
    });

    select.replaceWith(hidden,shell);
    render();
    customSelects.set(name,{hidden,shell,trigger,list,choose,render});
  });

  document.addEventListener('pointerdown',event=>{
    if(openSelect&&!openSelect.contains(event.target))closeSelect(openSelect);
  },{capture:true,passive:true});
  document.addEventListener('keydown',event=>{
    if(event.key==='Escape'&&openSelect)closeSelect(openSelect,{restore:true});
  },{capture:true});

  /* -------------------------------------------------------------
     Consultation canonical validation + send state machine.
  ------------------------------------------------------------- */
  const form=$('#consultationForm');
  if(form){
    const status=$('#formStatus');
    const submit=$('button[type="submit"]',form);
    const emailRe=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let submitLocked=false;

    const overlay=document.createElement('div');
    overlay.className='vs-send-layer';
    overlay.setAttribute('aria-hidden','true');
    overlay.dataset.state='sending';
    overlay.innerHTML=`<div class="vs-send-edge" aria-hidden="true"></div><div class="vs-send-card" role="status" aria-live="assertive"><div class="vs-send-core"><span class="vs-send-symbol">V</span></div><h2 class="vs-send-title">Sending…</h2><p class="vs-send-text">Your consultation request is being sent securely inside VeroSpace.</p></div>`;
    document.body.appendChild(overlay);
    const sendSymbol=$('.vs-send-symbol',overlay);
    const sendTitle=$('.vs-send-title',overlay);
    const sendText=$('.vs-send-text',overlay);

    const stateCopy={
      sending:{symbol:'V',title:'Sending…',text:'Your consultation request is being sent securely inside VeroSpace.'},
      success:{symbol:'✓',title:'Succeeded',text:'Your consultation request was sent successfully.'},
      failed:{symbol:'×',title:'Failed',text:'The server could not complete the request. Your form has been kept.'},
      offline:{symbol:'—',title:'Offline',text:'The network did not return within 15 seconds. Your form has been kept.'}
    };

    const showSendState=state=>{
      const copy=stateCopy[state];
      overlay.dataset.state=state;
      sendSymbol.textContent=copy.symbol;
      sendTitle.textContent=copy.title;
      sendText.textContent=copy.text;
      overlay.classList.add('open');
      overlay.setAttribute('aria-hidden','false');
    };
    const hideSendState=()=>{
      overlay.classList.remove('open');
      overlay.setAttribute('aria-hidden','true');
    };

    const visualFor=name=>customSelects.get(name)?.trigger||form.elements[name];
    const errorFor=name=>$(`[data-error="${name}"]`,form);
    const labelFor=name=>(customSelects.get(name)?.shell||form.elements[name])?.closest('label');
    const valueFor=name=>String((customSelects.get(name)?.hidden||form.elements[name])?.value||'');

    const errorMessage=name=>{
      const value=valueFor(name).trim();
      if(!value)return name==='project'||name==='budget'?'Please choose an option.':'Please fill this required field.';
      if(name==='email'&&!emailRe.test(value))return 'Please enter a valid email address.';
      if(name==='message'&&value.length<3)return 'Please fill this required field.';
      return '';
    };

    const setFieldError=(name,message)=>{
      const field=customSelects.get(name)?.hidden||form.elements[name];
      const label=labelFor(name);
      label?.classList.toggle('error',Boolean(message));
      if(field)field.setAttribute('aria-invalid',message?'true':'false');
      const error=errorFor(name);if(error)error.textContent=message;
    };

    const validateField=name=>{
      const message=errorMessage(name);
      setFieldError(name,message);
      return !message;
    };

    const requiredNames=['name','email','project','budget','message'];
    const validateAll=()=>{
      let firstBad=null;
      requiredNames.forEach(name=>{if(!validateField(name)&&!firstBad)firstBad=name});
      return firstBad;
    };

    ['name','email','message'].forEach(name=>{
      const field=form.elements[name];
      field?.addEventListener('input',()=>{if(labelFor(name)?.classList.contains('error'))validateField(name)});
      field?.addEventListener('blur',()=>{if(labelFor(name)?.classList.contains('error'))validateField(name)});
    });
    ['project','budget'].forEach(name=>customSelects.get(name)?.hidden.addEventListener('change',()=>validateField(name)));

    const waitForOnline=ms=>new Promise(resolve=>{
      if(navigator.onLine){resolve(true);return;}
      let done=false;
      const finish=value=>{if(done)return;done=true;clearTimeout(timer);removeEventListener('online',onOnline);resolve(value)};
      const onOnline=()=>finish(true);
      addEventListener('online',onOnline,{once:true});
      const timer=setTimeout(()=>finish(navigator.onLine),ms);
    });

    const sendWithinNetworkWindow=async(payload,requestId)=>{
      const deadline=Date.now()+15000;
      while(Date.now()<deadline){
        const remaining=deadline-Date.now();
        if(!navigator.onLine){
          await waitForOnline(Math.min(1100,remaining));
          continue;
        }
        const controller=new AbortController();
        const attemptTimeout=Math.max(800,Math.min(5000,remaining));
        const timer=setTimeout(()=>controller.abort(),attemptTimeout);
        try{
          const response=await fetch('/api/consultation',{
            method:'POST',
            headers:{'Content-Type':'application/json','X-Request-Id':requestId},
            body:JSON.stringify(payload),
            signal:controller.signal
          });
          clearTimeout(timer);
          const data=await response.json().catch(()=>({}));
          if(response.ok&&data.ok)return {kind:'success'};
          return {kind:'failed',status:response.status,error:data.error||'send_failed'};
        }catch(error){
          clearTimeout(timer);
          if(Date.now()>=deadline)return {kind:'offline'};
          await wait(Math.min(850,Math.max(100,deadline-Date.now())));
        }
      }
      return {kind:'offline'};
    };

    form.addEventListener('submit',async event=>{
      event.preventDefault();
      event.stopImmediatePropagation();
      if(submitLocked)return;

      const firstBad=validateAll();
      if(firstBad){
        if(status)status.textContent='Please correct the highlighted field.';
        form.scrollIntoView({behavior:reduced.matches?'auto':'smooth',block:'center'});
        setTimeout(()=>visualFor(firstBad)?.focus({preventScroll:true}),reduced.matches?0:320);
        return;
      }

      const honeypot=String(form.elements.website?.value||'');
      if(honeypot)return;

      submitLocked=true;
      if(submit)submit.disabled=true;
      if(status)status.textContent='';
      const requestId=crypto?.randomUUID?.()||`${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const payload={
        name:valueFor('name').trim(),
        email:valueFor('email').trim(),
        project:valueFor('project').trim(),
        budget:valueFor('budget').trim(),
        message:valueFor('message').trim(),
        website:honeypot,
        requestId
      };

      showSendState('sending');
      const [result]=await Promise.all([sendWithinNetworkWindow(payload,requestId),wait(3000)]);

      if(result.kind==='success'){
        showSendState('success');
        await wait(3000);
        form.reset();
        customSelects.forEach(({hidden,render})=>{hidden.value='';render()});
        requiredNames.forEach(name=>setFieldError(name,''));
        if(status)status.textContent='Request sent.';
        hideSendState();
      }else if(result.kind==='offline'){
        showSendState('offline');
        await wait(3000);
        if(status)status.textContent='Offline — your details are still here.';
        hideSendState();
      }else{
        showSendState('failed');
        await wait(3000);
        if(status)status.textContent='Send failed — your details are still here.';
        hideSendState();
      }

      submitLocked=false;
      if(submit)submit.disabled=false;
    },true);
  }

  /* -------------------------------------------------------------
     Project carousel: finger-follow drag, forward-only settle,
     5s autoplay, hold pause, one-time swipe hint, transient counter.
  ------------------------------------------------------------- */
  const counterTimers=new WeakMap();
  const carouselControllers=new WeakMap();

  const showCounter=(counter,index,total)=>{
    if(!counter)return;
    counter.textContent=`${String(index+1).padStart(2,'0')} / ${String(total).padStart(2,'0')}`;
    counter.classList.add('v7-show');
    clearTimeout(counterTimers.get(counter));
    counterTimers.set(counter,setTimeout(()=>counter.classList.remove('v7-show'),1500));
  };

  const setSlideTransition=(slide,value)=>{if(slide)slide.style.transition=value};
  const setSlideX=(slide,x)=>{if(slide)slide.style.transform=`translate3d(${x}px,0,0)`};
  const setImageScale=(slide,scale)=>{const image=$('img',slide);if(image)image.style.transform=`scale(${scale})`};

  const createCarousel=(track,counter,{isModal=false}={})=>{
    if(!track)return null;
    if(carouselControllers.has(track))return carouselControllers.get(track);

    let slides=[];
    let index=0;
    let nextIndex=0;
    let holding=false;
    let dragging=false;
    let directionLocked=false;
    let verticalGesture=false;
    let startX=0,startY=0,lastX=0,lastT=0,velocity=0;
    let autoTimer=0;
    let inView=isModal;
    let hintDone=false;
    let hinting=false;
    let hintTimers=[];

    const width=()=>Math.max(1,track.clientWidth);
    const current=()=>slides[index];
    const next=()=>slides[nextIndex];

    const clearHint=()=>{hintTimers.forEach(clearTimeout);hintTimers=[];hinting=false};
    const clearAuto=()=>{clearTimeout(autoTimer);autoTimer=0};
    const scheduleAuto=()=>{
      clearAuto();
      if(holding||dragging||hinting||document.hidden||!inView||slides.length<2)return;
      autoTimer=setTimeout(()=>advance({announce:false,source:'auto'}),5000);
    };

    const prime=()=>{
      slides=$$('figure',track);
      if(!slides.length)return;
      index=Math.max(0,Math.min(index,slides.length-1));
      nextIndex=(index+1)%slides.length;
      slides.forEach((slide,i)=>{
        slide.classList.toggle('v7-current',i===index);
        slide.classList.toggle('v7-next',i===nextIndex);
        setSlideTransition(slide,'none');
        setSlideX(slide,i===index?0:width());
        setImageScale(slide,i===index?1.018:1.038);
      });
      track.dataset.v7Index=String(index);
    };

    const zoomActive=slide=>{
      const image=$('img',slide);
      if(!image||reduced.matches)return;
      image.getAnimations?.().forEach(animation=>animation.cancel());
      image.animate([
        {transform:'scale(1.075)'},
        {transform:'scale(1.032)',offset:.62},
        {transform:'scale(1.018)'}
      ],{duration:920,easing:'cubic-bezier(.16,1,.3,1)',fill:'forwards'});
    };

    const settle=(commit,{announce=true,source='user'}={})=>new Promise(resolve=>{
      if(!slides.length){resolve();return}
      const w=width();
      const a=current(),b=next();
      setSlideTransition(a,reduced.matches?'none':'transform 430ms cubic-bezier(.16,1,.3,1)');
      setSlideTransition(b,reduced.matches?'none':'transform 430ms cubic-bezier(.16,1,.3,1)');
      requestAnimationFrame(()=>{
        setSlideX(a,commit?-w:0);
        setSlideX(b,commit?0:w);
        setImageScale(a,commit?1.045:1.018);
        setImageScale(b,commit?1.018:1.038);
      });
      const finish=()=>{
        if(commit){index=nextIndex;nextIndex=(index+1)%slides.length}
        slides.forEach((slide,i)=>{
          slide.classList.toggle('v7-current',i===index);
          slide.classList.toggle('v7-next',i===nextIndex);
          setSlideTransition(slide,'none');
          setSlideX(slide,i===index?0:width());
          setImageScale(slide,i===index?1.018:1.038);
        });
        track.dataset.v7Index=String(index);
        if(commit)zoomActive(current());
        if(announce)showCounter(counter,index,slides.length);
        scheduleAuto();
        resolve();
      };
      setTimeout(finish,reduced.matches?20:455);
    });

    const advance=async({announce=false,source='auto'}={})=>{
      if(holding||dragging||hinting||slides.length<2)return;
      clearAuto();
      nextIndex=(index+1)%slides.length;
      await settle(true,{announce,source});
    };

    const showHint=()=>{
      if(hintDone||hinting||holding||dragging||reduced.matches||slides.length<2)return;
      hintDone=true;hinting=true;clearAuto();
      const a=current(),b=next(),w=width();
      setSlideTransition(a,'transform 330ms cubic-bezier(.16,1,.3,1)');
      setSlideTransition(b,'transform 330ms cubic-bezier(.16,1,.3,1)');
      requestAnimationFrame(()=>{setSlideX(a,-w*.17);setSlideX(b,w*.83)});
      hintTimers.push(setTimeout(()=>{
        setSlideX(a,0);setSlideX(b,w);
        hintTimers.push(setTimeout(()=>{hinting=false;prime();scheduleAuto()},370));
      },430));
    };

    const pointerDown=event=>{
      if(event.pointerType==='mouse'&&event.button!==0)return;
      clearHint();clearAuto();holding=true;dragging=false;directionLocked=false;verticalGesture=false;
      startX=lastX=event.clientX;startY=event.clientY;lastT=performance.now();velocity=0;
      track.setPointerCapture?.(event.pointerId);
      track.closest('.project-stage,.modal-hero')?.classList.add('v7-dragging');
    };
    const pointerMove=event=>{
      if(!holding)return;
      const dx=event.clientX-startX,dy=event.clientY-startY;
      if(!directionLocked&&Math.hypot(dx,dy)>7){directionLocked=true;verticalGesture=Math.abs(dy)>Math.abs(dx)*1.12}
      if(verticalGesture)return;
      const now=performance.now();const dt=Math.max(1,now-lastT);velocity=(event.clientX-lastX)/dt;lastX=event.clientX;lastT=now;
      const w=width();
      const raw=Math.min(0,dx);
      const limited=Math.max(-w*.92,raw);
      if(Math.abs(limited)>4){dragging=true;event.preventDefault();showCounter(counter,nextIndex,slides.length)}
      setSlideTransition(current(),'none');setSlideTransition(next(),'none');
      setSlideX(current(),limited);setSlideX(next(),w+limited);
      const progress=Math.min(1,Math.abs(limited)/w);
      setImageScale(current(),1.018+progress*.022);setImageScale(next(),1.04-progress*.022);
    };
    const pointerEnd=async event=>{
      if(!holding)return;
      holding=false;
      track.releasePointerCapture?.(event.pointerId);
      track.closest('.project-stage,.modal-hero')?.classList.remove('v7-dragging');
      if(verticalGesture||!dragging){dragging=false;prime();scheduleAuto();return}
      const dx=event.clientX-startX;
      const commit=dx<-width()*.20||velocity<-.43;
      dragging=false;
      await settle(commit,{announce:true,source:'user'});
    };

    track.addEventListener('pointerdown',pointerDown,{passive:true});
    track.addEventListener('pointermove',pointerMove,{passive:false});
    track.addEventListener('pointerup',pointerEnd,{passive:true});
    track.addEventListener('pointercancel',pointerEnd,{passive:true});
    track.addEventListener('keydown',event=>{
      if(event.key==='ArrowRight'){event.preventDefault();advance({announce:true,source:'keyboard'})}
    });
    track.tabIndex=0;
    track.setAttribute('aria-label','Swipe forward to view project images');

    const controller={
      refresh(){prime();scheduleAuto()},
      pause(){holding=true;clearAuto()},
      resume(){holding=false;scheduleAuto()},
      setInView(value){inView=value;if(value)scheduleAuto();else clearAuto()},
      hint:showHint,
      reset(){index=0;nextIndex=slides.length>1?1:0;prime();scheduleAuto()},
      destroy(){clearAuto();clearHint()}
    };
    carouselControllers.set(track,controller);
    prime();

    if(!isModal){
      const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
        if(entry.target!==track)return;
        controller.setInView(entry.isIntersecting&&entry.intersectionRatio>=.32);
        if(entry.isIntersecting&&entry.intersectionRatio>=.48&&!hintDone)setTimeout(showHint,520);
      }),{threshold:[0,.32,.48,.7]});
      observer.observe(track);
    }
    return controller;
  };

  $$('.project-stage').forEach(stage=>createCarousel($('.project-track',stage),$('.swipe-counter',stage)));

  const modalTrack=$('.modal-track');
  const modalDialog=$('#projectDialog');
  let modalController=modalTrack?createCarousel(modalTrack,$('.modal-counter'),{isModal:true}):null;
  if(modalTrack){
    new MutationObserver(()=>{modalController?.refresh();modalController?.reset()}).observe(modalTrack,{childList:true});
  }
  if(modalDialog){
    new MutationObserver(()=>{
      if(modalDialog.open){modalController?.reset();modalController?.setInView(true)}
      else modalController?.setInView(false);
    }).observe(modalDialog,{attributes:true,attributeFilter:['open']});
  }

  document.addEventListener('visibilitychange',()=>{
    carouselControllers.forEach?.(()=>{});
    $$('.project-track,.modal-track').forEach(track=>{
      const controller=carouselControllers.get(track);
      if(document.hidden)controller?.pause();else controller?.resume();
    });
  });

  /* Project tactile selection: gold edge + lift remains after the press. */
  const projectCards=$$('.project-card');
  projectCards.forEach(card=>{
    $('.project-open',card)?.addEventListener('pointerdown',()=>{
      projectCards.forEach(other=>other.classList.toggle('v7-selected',other===card));
    },{passive:true});
  });
})();
