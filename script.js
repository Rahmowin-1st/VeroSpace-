const qs=(s,c=document)=>c.querySelector(s);const qsa=(s,c=document)=>[...c.querySelectorAll(s)];

// Smooth purposeful navigation
qsa('[data-scroll]').forEach(btn=>btn.addEventListener('click',()=>{const t=qs(btn.dataset.scroll);if(t){t.scrollIntoView({behavior:'smooth',block:'start'});qs('.mobile-menu')?.classList.remove('open');}}));

// Mobile menu
const menuBtn=qs('.menu-button'),mobileMenu=qs('.mobile-menu');
if(menuBtn&&mobileMenu){menuBtn.addEventListener('click',()=>{const open=mobileMenu.classList.toggle('open');menuBtn.setAttribute('aria-expanded',String(open));mobileMenu.setAttribute('aria-hidden',String(!open));});qsa('a',mobileMenu).forEach(a=>a.addEventListener('click',()=>mobileMenu.classList.remove('open')));}

// Scroll reveal
const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');io.unobserve(e.target);}}),{threshold:.12,rootMargin:'0px 0px -6% 0px'});qsa('.reveal').forEach(el=>io.observe(el));

// Scroll-scrubbed video: forward on scroll down, backward on scroll up.
const story=qs('.scroll-story'),video=qs('#scrollVideo'),progressBar=qs('#storyProgress'),chapters=qsa('.chapter');
let duration=0,raf=false;
function setStory(){if(!story||!video||!duration)return;const r=story.getBoundingClientRect();const max=story.offsetHeight-innerHeight;const passed=Math.min(Math.max(-r.top,0),max);const p=max>0?passed/max:0;video.currentTime=p*duration;if(progressBar)progressBar.style.width=`${p*100}%`;const idx=Math.min(3,Math.floor(Math.min(.999,p)*4));chapters.forEach((c,i)=>c.classList.toggle('active',i===idx));raf=false;}
if(video){video.addEventListener('loadedmetadata',()=>{duration=video.duration||2.2;setStory();});window.addEventListener('scroll',()=>{if(!raf){raf=true;requestAnimationFrame(setStory);}},{passive:true});window.addEventListener('resize',setStory);}

// Project modal — every project link has a real action.
const projectData={
  ridge:{title:'Ridge House',text:'A fictional full-home refresh built around better circulation, warmer lighting and a more connected open-plan living zone.',scope:'Whole-home refresh',focus:'Flow · lighting · furnishings'},
  walnut:{title:'Walnut Kitchen',text:'A fictional kitchen renovation using warm timber, stone and integrated lighting to make the room feel architectural rather than purely functional.',scope:'Kitchen renovation',focus:'Joinery · stone · lighting'},
  suite:{title:'Quiet Suite',text:'A fictional primary suite designed around calm materials, hidden storage and softer transitions between sleeping, dressing and working zones.',scope:'Primary suite',focus:'Storage · textiles · styling'}
};
const dialog=qs('#projectDialog');
qsa('.project-open').forEach(btn=>btn.addEventListener('click',()=>{const card=btn.closest('[data-project]');const d=projectData[card.dataset.project];if(!dialog||!d)return;qs('#dialogTitle').textContent=d.title;qs('#dialogText').textContent=d.text;qs('#dialogScope').textContent=d.scope;qs('#dialogFocus').textContent=d.focus;dialog.showModal();}));
qs('.dialog-close')?.addEventListener('click',()=>dialog.close());dialog?.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});
qsa('[data-scroll]',dialog).forEach(btn=>btn.addEventListener('click',()=>{dialog.close();qs(btn.dataset.scroll)?.scrollIntoView({behavior:'smooth'});}));

// Consultation form — validates and opens a pre-filled email draft as a no-backend working route.
const form=qs('#consultationForm'),status=qs('#formStatus');
form?.addEventListener('submit',e=>{e.preventDefault();if(!form.checkValidity()){form.reportValidity();return;}const fd=new FormData(form);const subject=encodeURIComponent(`VeroSpace consultation — ${fd.get('project')}`);const body=encodeURIComponent(`Name: ${fd.get('name')}\nEmail: ${fd.get('email')}\nProject: ${fd.get('project')}\nBudget: ${fd.get('budget')}\n\n${fd.get('message')}`);if(status)status.textContent='Opening your email app…';window.location.href=`mailto:hello@verospace.studio?subject=${subject}&body=${body}`;});
