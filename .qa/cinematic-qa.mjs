import { chromium } from 'playwright';

const base=process.env.VEROSPACE_URL||'http://127.0.0.1:4173';
const cases=[
  ['mobile-320',320,700],
  ['mobile-390',390,844],
  ['tablet-768',768,1024],
  ['desktop-1366',1366,768],
  ['desktop-1440',1440,900],
  ['desktop-1920',1920,1080],
];
let failures=0;
const pass=(label,ok,detail='')=>{console.log(`${ok?'PASS':'FAIL'} ${label}${detail?` — ${detail}`:''}`);if(!ok)failures++;};
const browser=await chromium.launch({headless:true});

for(const [name,width,height] of cases){
  const page=await browser.newPage({viewport:{width,height}});
  const errors=[];
  page.on('pageerror',e=>errors.push(String(e)));
  const response=await page.goto(base,{waitUntil:'networkidle',timeout:60000});
  pass(`${name}: HTTP 200`,response?.status()===200,String(response?.status()));
  await page.waitForTimeout(500);

  const title=page.locator('#hero-title');
  pass(`${name}: explicit client hook visible`,await title.isVisible());
  pass(`${name}: hook explains memorable home`,(await title.textContent()||'').toLowerCase().includes('impossible to forget'));
  pass(`${name}: clear transformation CTA`,(await page.locator('.hero-actions .primary').textContent()||'').includes('transformation'));
  pass(`${name}: why-VeroSpace bridge exists`,await page.locator('.value-bridge').isVisible());
  pass(`${name}: five projects`,await page.locator('.project-card').count()===5,String(await page.locator('.project-card').count()));

  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
  pass(`${name}: no horizontal overflow`,overflow<=1,`${overflow}px`);

  if(width<=900){
    pass(`${name}: menu control visible`,await page.locator('.menu-button').isVisible());
    if(width<=767)pass(`${name}: original mobile journey preserved`,await page.locator('.mobile-journey-dock').count()===1);
    await page.locator('.menu-button').click();
    await page.waitForTimeout(200);
    pass(`${name}: premium menu opens`,await page.locator('.mobile-menu').evaluate(el=>el.classList.contains('open')));
    await page.keyboard.press('Escape');
  }else{
    pass(`${name}: original desktop journey preserved`,await page.locator('.desktop-journey').count()===1);
    pass(`${name}: desktop nav visible`,await page.locator('.desktop-nav').isVisible());
    pass(`${name}: desktop hamburger hidden`,!(await page.locator('.menu-button').isVisible()));
    const heroMetrics=await page.locator('#home').evaluate(el=>({top:el.offsetTop,height:el.offsetHeight}));
    const y=Math.round(heroMetrics.top+(heroMetrics.height-height)*.65);
    await page.evaluate(v=>scrollTo(0,v),y);
    await page.waitForTimeout(500);
    const media=await page.locator('.hero-media').boundingBox();
    pass(`${name}: hero morphs toward full-bleed`,Boolean(media&&media.width>width*.92),media?`${Math.round(media.width)}px`:'no box');
    const immersiveOpacity=await page.locator('.hero-immersive-copy').evaluate(el=>Number(getComputedStyle(el).opacity));
    pass(`${name}: scroll reveals second hook`,immersiveOpacity>.72,String(immersiveOpacity));
  }

  const projectTop=await page.locator('#projects').evaluate(el=>el.offsetTop);
  await page.evaluate(v=>scrollTo(0,v+18),projectTop);
  await page.waitForTimeout(450);
  const first=page.locator('.project-card').first().locator('.project-open');
  await first.click({timeout:10000});
  await page.waitForTimeout(200);
  pass(`${name}: project modal opens`,await page.locator('#projectDialog').evaluate(el=>el.open));
  pass(`${name}: modal has full visual`,await page.locator('.cinematic-dialog-media img').isVisible());
  await page.locator('.dialog-close').click();

  if(width>900){
    const projectHeight=await page.locator('#projects').evaluate(el=>el.offsetHeight);
    await page.evaluate(v=>scrollTo(0,v),Math.round(projectTop+(projectHeight-height)*.55));
    await page.waitForTimeout(400);
    const transform=await page.locator('.project-grid').evaluate(el=>getComputedStyle(el).transform);
    pass(`${name}: projects use scroll-driven horizontal movement`,transform!=='none'&&!transform.includes('1, 0, 0, 1, 0, 0'),transform);
  }

  pass(`${name}: no page errors`,errors.length===0,errors.join(' | '));
  if(['mobile-390','desktop-1440','desktop-1920'].includes(name)){
    await page.goto(base,{waitUntil:'networkidle'});
    await page.screenshot({path:`.qa/screenshots/${name}-home.png`,fullPage:false});
    if(width>900){
      const heroMetrics=await page.locator('#home').evaluate(el=>({top:el.offsetTop,height:el.offsetHeight}));
      await page.evaluate(v=>scrollTo(0,v),Math.round(heroMetrics.top+(heroMetrics.height-height)*.65));
      await page.waitForTimeout(350);
      await page.screenshot({path:`.qa/screenshots/${name}-hero-immersed.png`,fullPage:false});
    }
  }
  await page.close();
}

await browser.close();
if(failures){console.error(`VEROSPACE_CINEMATIC_QA_RED failures=${failures}`);process.exit(1);}
console.log('VEROSPACE_CINEMATIC_QA_GREEN');
