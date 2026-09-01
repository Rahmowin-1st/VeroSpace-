import {chromium} from 'playwright';
import fs from 'node:fs';
const url=process.env.VEROSPACE_URL||'https://verospace-landing.vercel.app';
const cases=[['mobile-320',320,700],['mobile-390',390,844],['tablet-768',768,1024],['desktop-1366',1366,768],['desktop-1440',1440,900],['desktop-1920',1920,1080]];
const browser=await chromium.launch({headless:true});
fs.mkdirSync('.qa/live-screenshots',{recursive:true});
let failed=false;const gate=(ok,msg)=>{console.log(`${ok?'PASS':'FAIL'} ${msg}`);if(!ok)failed=true};
for(const [name,width,height] of cases){
 const page=await browser.newPage({viewport:{width,height}});const errors=[];page.on('pageerror',e=>errors.push(String(e)));
 const response=await page.goto(url,{waitUntil:'domcontentloaded'});gate(response?.status()===200,`${name}: production HTTP 200`);await page.waitForTimeout(1200);
 gate((await page.locator('#hero-title').textContent())?.includes('Design that feels right.'),`${name}: upgraded hero copy live`);
 gate(await page.locator('.project-card').count()===5,`${name}: five projects live`);
 gate(await page.locator('.mobile-journey-dock').count()===0,`${name}: old bottom dock removed live`);
 gate(await page.locator('.hero-dock').count()===0,`${name}: old hero dock removed live`);
 gate((await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth))<=1,`${name}: no horizontal overflow`);
 if(width<=900){
   gate(await page.locator('.menu-button').isVisible(),`${name}: menu control visible`);
   const top=await page.locator('#projects').evaluate(el=>Math.round(el.getBoundingClientRect().top));gate(top>=height-12,`${name}: home owns first viewport`);
   await page.locator('.menu-button').click();await page.waitForTimeout(250);
   gate(await page.locator('.mobile-menu.open').isVisible(),`${name}: menu opens`);
   gate(await page.locator('.upgrade-menu-links a').count()===4,`${name}: menu simplified`);
   const s=await page.locator('.mobile-menu').evaluate(el=>({bg:getComputedStyle(el).backgroundImage,filter:getComputedStyle(el).backdropFilter}));gate(s.bg.includes('linear-gradient'),`${name}: colored menu shell`);gate(s.filter==='none'||s.filter==='',`${name}: menu shell opaque/non-glass`);
   await page.locator('.menu-button').click();
 }else{
   gate(!(await page.locator('.menu-button').isVisible()),`${name}: desktop hamburger hidden`);
   gate(await page.locator('.desktop-nav').isVisible(),`${name}: desktop nav visible`);
   const bottom=await page.locator('#home').evaluate(el=>Math.round(el.getBoundingClientRect().bottom));gate(bottom<=height+12,`${name}: hero fits viewport`);
 }
 if(name==='mobile-390'||name==='desktop-1366'){
   const imgs=page.locator('.project-card .project-image img');for(let i=0;i<await imgs.count();i++){const img=imgs.nth(i);await img.scrollIntoViewIfNeeded();await page.waitForTimeout(180);gate(await img.evaluate(el=>el.complete&&el.naturalWidth>0),`${name}: project image ${i+1} loaded`);}
 }
 await page.locator('#projects').scrollIntoViewIfNeeded();await page.locator('.project-open').first().click();await page.waitForTimeout(180);gate(await page.locator('#projectDialog[open]').isVisible(),`${name}: project modal opens`);gate(await page.locator('.upgrade-dialog-media img').isVisible(),`${name}: modal image visible`);await page.locator('.dialog-close').click();
 gate(errors.length===0,`${name}: no page errors`);
 if(name==='mobile-390'||name==='desktop-1366'||name==='desktop-1920')await page.screenshot({path:`.qa/live-screenshots/${name}.png`,fullPage:false});await page.close();
}
const api=await fetch(url+'/api/consultation');gate(api.status===405,`production consultation API responds 405 to GET`);
await browser.close();if(failed)process.exit(1);console.log('VEROSPACE_LIVE_PRODUCTION_QA_GREEN');
