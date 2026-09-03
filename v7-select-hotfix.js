(() => {
  'use strict';
  const $=(s,r=document)=>r.querySelector(s);
  const $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const OPTIONS={
    project:[['','Choose one'],['Full-home interior design','Full-home interior design'],['Renovation','Renovation'],['Kitchen / bathroom','Kitchen / bathroom'],['Single-room design','Single-room design']],
    budget:[['','Choose one'],['$25k–$50k','$25k–$50k'],['$50k–$100k','$50k–$100k'],['$100k–$250k','$100k–$250k'],['$250k+','$250k+']]
  };

  let openShell=null;
  const close=shell=>{
    if(!shell)return;
    shell.classList.remove('open','open-up');
    $('.vs-select-trigger',shell)?.setAttribute('aria-expanded','false');
    if(openShell===shell)openShell=null;
  };

  const nativeFocus=HTMLElement.prototype.focus;
  if(!HTMLElement.prototype.__vsFocusProxy){
    Object.defineProperty(HTMLElement.prototype,'__vsFocusProxy',{value:true,configurable:true});
    HTMLElement.prototype.focus=function(options){
      if(!this.isConnected&&this.classList?.contains('vs-select-trigger')){
        const proxy=document.querySelector(`[data-vs-proxy-id="${CSS.escape(this.id||'')}"]`);
        if(proxy)return nativeFocus.call(proxy,options);
      }
      return nativeFocus.call(this,options);
    };
  }

  $$('.vs-select-shell[data-name]').forEach((shell,index)=>{
    if($('.vs-select-trigger',shell))return;
    const name=shell.dataset.name;
    const hidden=shell.previousElementSibling?.matches(`input[type="hidden"][name="${name}"]`)?shell.previousElementSibling:document.querySelector(`input[type="hidden"][name="${name}"]`);
    if(!hidden||!OPTIONS[name])return;

    const trigger=document.createElement('button');
    trigger.type='button';trigger.className='vs-select-trigger pressable';trigger.id=`vsProxyTrigger${index}`;trigger.dataset.vsProxyId=`vsSelectTrigger${index}`;
    trigger.setAttribute('aria-haspopup','listbox');trigger.setAttribute('aria-expanded','false');
    const list=document.createElement('div');
    list.className='vs-select-list';list.id=`vsProxyList${index}`;list.setAttribute('role','listbox');trigger.setAttribute('aria-controls',list.id);

    const render=()=>{
      const pair=OPTIONS[name].find(([value])=>value===hidden.value)||OPTIONS[name][0];
      trigger.textContent=pair[1];
      shell.classList.toggle('has-value',Boolean(hidden.value));
      $$('.vs-select-option',list).forEach(button=>button.setAttribute('aria-selected',String(button.dataset.value===hidden.value)));
    };
    const choose=value=>{
      hidden.value=value;
      hidden.dispatchEvent(new Event('change',{bubbles:true}));
      render();close(shell);trigger.focus({preventScroll:true});
    };

    OPTIONS[name].forEach(([value,label])=>{
      const button=document.createElement('button');button.type='button';button.className='vs-select-option';button.dataset.value=value;button.setAttribute('role','option');button.textContent=label;
      button.addEventListener('click',event=>{event.preventDefault();choose(value)});
      list.appendChild(button);
    });
    shell.append(trigger,list);
    render();

    const open=()=>{
      if(openShell&&openShell!==shell)close(openShell);
      shell.classList.add('open');trigger.setAttribute('aria-expanded','true');openShell=shell;
      requestAnimationFrame(()=>{
        const rect=list.getBoundingClientRect();const tr=trigger.getBoundingClientRect();
        shell.classList.toggle('open-up',rect.bottom>innerHeight-12&&tr.top>rect.height+24);
        ($('.vs-select-option[aria-selected="true"]',list)||$('.vs-select-option',list))?.focus({preventScroll:true});
      });
    };
    trigger.addEventListener('click',event=>{event.preventDefault();shell.classList.contains('open')?close(shell):open()});
    trigger.addEventListener('keydown',event=>{if(event.key==='ArrowDown'||event.key==='ArrowUp'){event.preventDefault();if(!shell.classList.contains('open'))open()}});
    list.addEventListener('keydown',event=>{
      const items=$$('.vs-select-option',list),active=document.activeElement,current=Math.max(0,items.indexOf(active));
      if(event.key==='ArrowDown'){event.preventDefault();items[(current+1)%items.length]?.focus()}
      else if(event.key==='ArrowUp'){event.preventDefault();items[(current-1+items.length)%items.length]?.focus()}
      else if(event.key==='Home'){event.preventDefault();items[0]?.focus()}
      else if(event.key==='End'){event.preventDefault();items.at(-1)?.focus()}
      else if(event.key==='Escape'){event.preventDefault();close(shell);trigger.focus({preventScroll:true})}
      else if((event.key==='Enter'||event.key===' ')&&active?.classList.contains('vs-select-option')){event.preventDefault();choose(active.dataset.value)}
    });

    shell.closest('form')?.addEventListener('reset',()=>setTimeout(()=>{hidden.value='';render()},0));
  });

  document.addEventListener('pointerdown',event=>{if(openShell&&!openShell.contains(event.target))close(openShell)},{capture:true,passive:true});
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&openShell){const trigger=$('.vs-select-trigger',openShell);close(openShell);trigger?.focus({preventScroll:true})}},{capture:true});
})();
