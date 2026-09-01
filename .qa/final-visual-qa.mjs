import {chromium} from 'playwright';
import fs from 'node:fs';
const browser=await chromium.launch({headless:true});
fs.mkdirSync('.qa/final-screenshots',{recursive:true});
const cases=[['mobile-390',390,844],['desktop-1366',1366,768],['desktop-1920',1920,1080]];
let failed=false;
const gate=(ok,msg)=>{console.log(`${ok?'PASS':'FAIL'} ${msg}`);if(!ok)failed=true};
for(const [name,width,height] of cases){
 const page=await browser.newPage({viewport:{width,height}}); const errors=[]; page.on('pageerror',e=>errors.push(String(e)));
 await page.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded'}); await page.waitForTimeout(800);
 gate(await page.locator('.project-card').count()===5,`${name}: five projects`);
 gate((await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth))<=1,`${name}: no horizontal overflow`);
 if(width<=900){
   gate(await page.locator('.menu-button').isVisible(),`${name}: mobile menu control visible`);
   gate((await page.locator('#projects').evaluate(el=>Math.round(el.getBoundingClientRect().top)))>=height-12,`${name}: home owns first viewport`);
 }else{
   gate(!(await page.locator('.menu-button').isVisible()),`${name}: desktop hamburger hidden`);
   gate(await page.locator('.desktop-nav').isVisible(),`${name}: desktop navigation visible`);
   const h=await page.locator('#home').evaluate(el=>Math.round(el.getBoundingClientRect().bottom));
   gate(h<=height+12,`${name}: hero fits first viewport`);
 }
 await page.screenshot({path:`.qa/final-screenshots/${name}.png`,fullPage:false});
 gate(errors.length===0,`${name}: no page errors`);
 await page.close();
}
await browser.close();
if(failed)process.exit(1);
console.log('VEROSPACE_FINAL_VISUAL_QA_GREEN');
