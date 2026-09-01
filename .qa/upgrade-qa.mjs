import { chromium } from 'playwright';
import fs from 'node:fs';

const sizes=[
  {name:'mobile-320',width:320,height:700},
  {name:'mobile-390',width:390,height:844},
  {name:'tablet-768',width:768,height:1024},
  {name:'desktop-1366',width:1366,height:768},
  {name:'desktop-1440',width:1440,height:900},
  {name:'desktop-1920',width:1920,height:1080}
];
const browser=await chromium.launch({headless:true});
fs.mkdirSync('.qa/screenshots',{recursive:true});
const failures=[];
const check=(ok,msg)=>{if(!ok)failures.push(msg);console.log(`${ok?'PASS':'FAIL'} ${msg}`)};

for(const size of sizes){
  const page=await browser.newPage({viewport:{width:size.width,height:size.height}});
  const pageErrors=[];
  page.on('pageerror',e=>pageErrors.push(String(e)));
  await page.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(900);

  check(await page.locator('#hero-title').isVisible(),`${size.name}: hero title visible`);
  check(await page.locator('.hero-actions .primary').isVisible(),`${size.name}: primary CTA visible`);
  check(await page.locator('.project-card').count()===5,`${size.name}: exactly five projects`);
  check(await page.locator('.mobile-journey-dock').count()===0,`${size.name}: old bottom dock removed`);
  check(await page.locator('.hero-dock').count()===0,`${size.name}: old hero dock removed`);
  check(await page.locator('.hero-trust').count()===0,`${size.name}: duplicate hero trust chips removed`);
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
  check(overflow<=1,`${size.name}: no horizontal overflow (${overflow}px)`);

  if(['mobile-390','desktop-1366','desktop-1920'].includes(size.name)){
    await page.screenshot({path:`.qa/screenshots/${size.name}-initial.png`,fullPage:false});
  }

  if(size.width<=900){
    const nextTop=await page.locator('#projects').evaluate(el=>el.getBoundingClientRect().top);
    check(nextTop>=size.height-12,`${size.name}: home owns first viewport (${Math.round(nextTop)} >= ${size.height-12})`);
    const menuButton=page.locator('.menu-button');
    check(await menuButton.isVisible(),`${size.name}: menu button visible`);
    await menuButton.click();
    await page.waitForTimeout(250);
    check(await page.locator('.mobile-menu.open').isVisible(),`${size.name}: menu opens`);
    const menuStyle=await page.locator('.mobile-menu').evaluate(el=>({bg:getComputedStyle(el).backgroundImage,filter:getComputedStyle(el).backdropFilter}));
    check(menuStyle.bg.includes('linear-gradient'),`${size.name}: colored menu background`);
    check(menuStyle.filter==='none'||menuStyle.filter==='',`${size.name}: menu shell is not transparent glass`);
    check(await page.locator('.upgrade-menu-links a').count()===4,`${size.name}: simplified four-link menu`);
    if(size.name==='mobile-390')await page.screenshot({path:'.qa/screenshots/mobile-390-menu.png',fullPage:false});
    await menuButton.click();
  }else{
    const heroBottom=await page.locator('#home').evaluate(el=>el.getBoundingClientRect().bottom);
    check(heroBottom<=size.height+12,`${size.name}: complete home fits viewport (${Math.round(heroBottom)} <= ${size.height+12})`);
    const layout=await page.evaluate(()=>{
      const c=document.querySelector('.hero-copy').getBoundingClientRect();
      const m=document.querySelector('.hero-media').getBoundingClientRect();
      const h=document.querySelector('.hero').getBoundingClientRect();
      return {copyRight:c.right,mediaLeft:m.left,mediaWidth:m.width,heroWidth:h.width,mediaPosition:getComputedStyle(document.querySelector('.hero-media')).position};
    });
    check(layout.mediaLeft>=layout.copyRight-8,`${size.name}: desktop hero is side-by-side`);
    check(layout.mediaWidth<layout.heroWidth*.68,`${size.name}: desktop image does not swallow hero`);
    check(layout.mediaPosition==='relative',`${size.name}: desktop media stays in grid flow`);
  }

  if(['mobile-390','desktop-1366'].includes(size.name)){
    const imgs=page.locator('.project-card .project-image img');
    for(let i=0;i<await imgs.count();i++){
      const img=imgs.nth(i);
      await img.scrollIntoViewIfNeeded();
      await page.waitForTimeout(180);
      const loaded=await img.evaluate(el=>el.complete&&el.naturalWidth>0);
      check(loaded,`${size.name}: project image ${i+1} loaded`);
    }
  }

  await page.locator('#projects').scrollIntoViewIfNeeded();
  await page.locator('.project-card').first().locator('.project-open').click();
  await page.waitForTimeout(200);
  check(await page.locator('#projectDialog[open]').isVisible(),`${size.name}: project modal opens`);
  check(await page.locator('.upgrade-dialog-media img').isVisible(),`${size.name}: project modal shows image`);
  if(size.name==='mobile-390')await page.screenshot({path:'.qa/screenshots/mobile-390-project.png',fullPage:false});
  if(size.name==='desktop-1366')await page.screenshot({path:'.qa/screenshots/desktop-1366-project.png',fullPage:false});
  await page.locator('.dialog-close').click();

  check(pageErrors.length===0,`${size.name}: no page errors${pageErrors.length?` — ${pageErrors.join(' | ')}`:''}`);
  await page.close();
}
await browser.close();
if(failures.length){
  console.error(`VEROSPACE_UPGRADE_QA_FAIL ${JSON.stringify(failures)}`);
  process.exit(1);
}
console.log('VEROSPACE_UPGRADE_QA_GREEN');
