(() => {
  'use strict';

  const timers=new WeakMap();
  const gestures=new WeakMap();

  const clearTimer=track=>{
    const timer=timers.get(track);
    if(timer)clearTimeout(timer);
    timers.delete(track);
  };

  const sufficientlyVisible=track=>{
    const rect=track.getBoundingClientRect();
    if(rect.width<=0||rect.height<=0)return false;
    const visible=Math.max(0,Math.min(rect.bottom,innerHeight)-Math.max(rect.top,0));
    return visible>=rect.height*.32;
  };

  document.querySelectorAll('.project-track').forEach(track=>{
    track.addEventListener('pointerdown',event=>{
      clearTimer(track);
      gestures.set(track,{pointerId:event.pointerId,startX:event.clientX,startY:event.clientY,moved:false});
    },{passive:true});

    track.addEventListener('pointermove',event=>{
      const state=gestures.get(track);
      if(!state||state.pointerId!==event.pointerId)return;
      const dx=event.clientX-state.startX;
      const dy=event.clientY-state.startY;
      if(Math.hypot(dx,dy)>8)state.moved=true;
    },{passive:true});

    const finish=event=>{
      const state=gestures.get(track);
      if(!state||state.pointerId!==event.pointerId)return;
      gestures.delete(track);
      if(state.moved)return;

      // The canonical carousel begins its autoplay transition at exactly 5s.
      // Mirror that moment in the logical index while its 430ms visual settle runs.
      const timer=setTimeout(()=>{
        timers.delete(track);
        if(document.hidden||!sufficientlyVisible(track))return;
        const slides=[...track.querySelectorAll('figure')];
        if(slides.length<2)return;
        const current=Math.max(0,Math.min(slides.length-1,Number(track.dataset.v7Index||0)));
        track.dataset.v7Index=String((current+1)%slides.length);
      },5000);
      timers.set(track,timer);
    };

    track.addEventListener('pointerup',finish,{passive:true});
    track.addEventListener('pointercancel',event=>{
      gestures.delete(track);
      clearTimer(track);
    },{passive:true});
  });

  document.addEventListener('visibilitychange',()=>{
    if(document.hidden)document.querySelectorAll('.project-track').forEach(clearTimer);
  });
})();
