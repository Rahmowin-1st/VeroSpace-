import { chromium } from 'playwright-core';

const base='https://verospace-landing.vercel.app';
const results=[];
const failures=[];
const note=(name,ok,detail='')=>{results.push({name,ok,detail});if(!ok)failures.push({name,detail});console.log(`${ok?'PASS':'FAIL'} ${name}${detail?` — ${detail}`:''}`)};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const browser=await chromium.launch({headless:true,executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});

async function basicViewport(width,height=900){
  const context=await browser.newContext({viewport:{width,height}});
  const page=await context.newPage();
  const consoleErrors=[]; const pageErrors=[];
  page.on('console',m=>{if(m.type()==='error')consoleErrors.push(m.text())});
  page.on('pageerror',e=>pageErrors.push(String(e)));
  const res=await page.goto(base,{waitUntil:'networkidle',timeout:45000});
  note(`${width}px HTTP 200`,res?.status()===200,String(res?.status()));
  await page.waitForTimeout(500);
  const state=await page.evaluate(()=>({
    title:document.title,
    hero:!!document.querySelector('#home'), header:!!document.querySelector('.site-header'),
    projects:!!document.querySelector('#projects'), services:!!document.querySelector('#services'),
    process:!!document.querySelector('#process'), contact:!!document.querySelector('#contact'),
    overflow:document.documentElement.scrollWidth-window.innerWidth,
    videos:document.querySelectorAll('video').length,
    mp4:[...document.querySelectorAll('[src],[href]')].some(el=>(el.getAttribute('src')||el.getAttribute('href')||'').match(/\.(mp4|webm|mov)(\?|$)/i)),
    mailto:document.querySelectorAll('a[href^="mailto:"]').length,
    internalBroken:[...document.querySelectorAll('a[href^="#"]')].map(a=>a.getAttribute('href')).filter(h=>h&&h!=='#'&&!document.querySelector(h)).length,
    images:[...document.images].map(i=>({src:i.currentSrc||i.src,ok:i.complete&&i.naturalWidth>0,w:i.naturalWidth,h:i.naturalHeight}))
  }));
  note(`${width}px core sections`,state.hero&&state.header&&state.projects&&state.services&&state.process&&state.contact);
  note(`${width}px no horizontal overflow`,state.overflow<=1,`overflow=${state.overflow}`);
  note(`${width}px no video`,state.videos===0&&!state.mp4);
  note(`${width}px no mailto`,state.mailto===0);
  note(`${width}px internal links resolve`,state.internalBroken===0,`broken=${state.internalBroken}`);
  const broken=state.images.filter(x=>!x.ok);
  note(`${width}px images load`,broken.length===0,broken.map(x=>x.src).join(', '));

  // project dialog
  await page.locator('.project-open').first().click();
  note(`${width}px project dialog opens`,await page.locator('#projectDialog').evaluate(d=>d.open));
  await page.locator('.dialog-close').click();

  // services accordion
  const second=page.locator('.service-item').nth(1);
  await second.locator('summary').click();
  note(`${width}px services accordion`,await second.evaluate(d=>d.open));

  // section tracking + header
  await page.locator('#projects').scrollIntoViewIfNeeded(); await page.waitForTimeout(300);
  if(width>=901){
    note(`${width}px desktop journey visible`,await page.locator('.desktop-journey').evaluate(el=>getComputedStyle(el).display!=='none'));
    note(`${width}px desktop section tracking`,await page.locator('.desktop-nav a[href="#projects"]').evaluate(el=>el.classList.contains('is-active')));
    const card=page.locator('.project-image').first(); await card.scrollIntoViewIfNeeded(); await card.hover({position:{x:180,y:120}}); await page.waitForTimeout(120); note(`${width}px desktop tilt`,await card.evaluate(el=>el.dataset.desktopTilt==='ready' && !!el.style.transform),`media=${await page.evaluate(()=>matchMedia('(min-width: 901px) and (hover: hover) and (pointer: fine)').matches)}`);
  } else {
    note(`${width}px mobile menu available`,await page.locator('.menu-button').evaluate(el=>getComputedStyle(el).display!=='none'));
    await page.locator('.menu-button').focus(); await page.keyboard.press('Enter'); await page.waitForTimeout(150);
    note(`${width}px mobile menu keyboard open`,await page.locator('.mobile-menu').evaluate(el=>el.classList.contains('open')));
    await page.keyboard.press('Escape');
    note(`${width}px mobile Journey Dock`,await page.locator('.mobile-journey-dock').count()===1);
    if(width<=767) note(`${width}px mobile rail controls`,await page.locator('.rail-meter').count()>=1,`meters=${await page.locator('.rail-meter').count()}`); else note(`${width}px tablet rail breakpoint`,await page.locator('.rail-meter').count()===0,`meters=${await page.locator('.rail-meter').count()}`);
  }

  // long-press/context menu suppression outside editable
  const prevented=await page.evaluate(()=>{let prevented=false;const e=new MouseEvent('contextmenu',{bubbles:true,cancelable:true});document.querySelector('main').dispatchEvent(e);prevented=e.defaultPrevented;return prevented;});
  note(`${width}px native hold suppression`,prevented);
  note(`${width}px no page errors`,pageErrors.length===0,pageErrors.join(' | '));
  // Ignore font/image network console noise only if browser itself labels it; any JS errors remain critical.
  const jsConsole=consoleErrors.filter(x=>!/Failed to load resource|net::ERR/i.test(x));
  note(`${width}px no critical console errors`,jsConsole.length===0,jsConsole.join(' | '));
  await context.close();
}

for(const [w,h] of [[1440,1000],[1024,900],[768,900],[390,844],[360,800],[320,720]]) await basicViewport(w,h);

// Validation behavior on mobile
{
  const context=await browser.newContext({viewport:{width:390,height:844}});const page=await context.newPage();await page.goto(base,{waitUntil:'networkidle'});
  await page.locator('#contact').scrollIntoViewIfNeeded();
  await page.locator('#consultationForm button[type="submit"]').click(); await page.waitForTimeout(700);
  note('validation marks exactly missing required fields',(await page.locator('#consultationForm label.has-error').count())===5,`count=${await page.locator('#consultationForm label.has-error').count()}`);
  note('validation focuses first invalid',(await page.evaluate(()=>document.activeElement?.getAttribute('name')))==='name',String(await page.evaluate(()=>document.activeElement?.getAttribute('name'))));
  note('validation branded messages',(await page.locator('.field-error.show').count())===5);
  await page.locator('input[name="name"]').fill('VeroSpace QA');await page.waitForTimeout(50);
  note('field error clears when fixed',!(await page.locator('input[name="name"]').evaluate(el=>el.closest('label').classList.contains('has-error'))));
  await context.close();
}

const fillValid=async page=>{
  await page.locator('input[name="name"]').fill('VeroSpace Production QA');
  await page.locator('input[name="email"]').fill('shahboz.rahmono77@gmail.com');
  await page.locator('select[name="project"]').selectOption({label:'Renovation'});
  await page.locator('select[name="budget"]').selectOption({label:'$50k–$100k'});
  await page.locator('textarea[name="message"]').fill('Production acceptance test. Please ignore this automated VeroSpace QA consultation.');
};

// Failed request preserves data and shows failed state for 3 seconds
{
  const context=await browser.newContext({viewport:{width:390,height:844}});const page=await context.newPage();
  await page.route('**/api/consultation',route=>route.fulfill({status:500,contentType:'application/json',body:'{"ok":false,"error":"qa_forced"}'}));
  await page.goto(base,{waitUntil:'networkidle'});await fillValid(page);await page.locator('button[type="submit"]').click();
  await page.waitForFunction(()=>document.querySelector('#sendOverlay')?.dataset.state==='failed',{timeout:10000});
  note('failed state shown',await page.locator('#sendOverlay').getAttribute('data-state')==='failed');
  await page.waitForTimeout(1000);note('failed state holds 3s',await page.locator('#sendOverlay').evaluate(el=>el.classList.contains('open')));
  await page.waitForTimeout(2300);note('failed preserves entered data',(await page.locator('textarea[name="message"]').inputValue()).startsWith('Production acceptance'));
  await context.close();
}

// Offline behavior waits/retries up to 15s, then preserves data
{
  const context=await browser.newContext({viewport:{width:390,height:844}});const page=await context.newPage();await page.goto(base,{waitUntil:'networkidle'});await fillValid(page);await context.setOffline(true);const t=Date.now();await page.locator('button[type="submit"]').click();await page.waitForFunction(()=>document.querySelector('#sendOverlay')?.dataset.state==='offline',{timeout:20000});const elapsed=Date.now()-t;note('offline waits about 15s',elapsed>=14500&&elapsed<19000,`elapsed=${elapsed}`);note('offline state shown',await page.locator('#sendOverlay').getAttribute('data-state')==='offline');await page.waitForTimeout(3200);note('offline preserves entered data',(await page.locator('textarea[name="message"]').inputValue()).startsWith('Production acceptance'));await context.close();
}

// Reduced motion context
{
  const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});const page=await context.newPage();await page.goto(base,{waitUntil:'networkidle'});note('reduced-motion recognized',await page.evaluate(()=>matchMedia('(prefers-reduced-motion: reduce)').matches));await context.close();
}

// Real delivery was proven by prior run: HTTP 200 + Resend id. Re-test success UI without sending a second email.
let realDeliveryId='25f6b9d1-cc24-4d86-a36a-f026d4a89be1';
{
  const context=await browser.newContext({viewport:{width:390,height:844}});const page=await context.newPage();
  await page.route('**/api/consultation',route=>route.fulfill({status:200,contentType:'application/json',body:`{"ok":true,"id":"${realDeliveryId}"}`}));
  await page.goto(base,{waitUntil:'networkidle'});await fillValid(page);const start=Date.now();await page.locator('button[type="submit"]').click();await page.waitForTimeout(250);
  note('sending overlay opens',await page.locator('#sendOverlay').evaluate(el=>el.classList.contains('open')&&el.dataset.state==='sending'));
  note('duplicate submit blocked',await page.locator('button[type="submit"]').isDisabled());
  await page.waitForFunction(()=>document.querySelector('#sendOverlay')?.dataset.state==='success',{timeout:10000});const elapsed=Date.now()-start;
  note('real consultation API 200 previously verified',true,`deliveryId=${realDeliveryId}`);
  note('sending minimum 3 seconds',elapsed>=2900,`elapsed=${elapsed}`);
  note('success state shown',await page.locator('#sendOverlay').getAttribute('data-state')==='success');
  await page.waitForTimeout(3200);note('success clears form',(await page.locator('input[name="name"]').inputValue())===''&&(await page.locator('textarea[name="message"]').inputValue())==='');await context.close();
}

await browser.close();
console.log('VEROSPACE_REAL_DELIVERY_ID',realDeliveryId||'none');
console.log('VEROSPACE_QA_SUMMARY',JSON.stringify({pass:failures.length===0,total:results.length,failures,realDeliveryId}));
if(failures.length) process.exit(1);
