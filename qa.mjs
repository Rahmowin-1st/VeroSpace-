import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

const base=process.env.BASE_URL||'http://127.0.0.1:4173';
const cases=[['m320',320,700,true],['m360',360,800,true],['m390',390,844,true],['m430',430,932,true],['tablet',768,1024,true],['d1366',1366,768,false],['d1440',1440,900,false],['d1920',1920,1080,false]];
await fs.mkdir('qa-artifacts',{recursive:true});
const browser=await chromium.launch({headless:true});
const failures=[];
for(const [name,width,height,mobile] of cases){
  const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:1});
  const page=await context.newPage();
  const pageErrors=[];
  page.on('pageerror',e=>pageErrors.push(String(e)));
  page.on('console',m=>{if(m.type()==='error')pageErrors.push(`console: ${m.text()}`)});
  try{
    await page.goto(base,{waitUntil:'networkidle',timeout:60000});
    await page.evaluate(()=>{document.documentElement.style.scrollBehavior='auto'});
    await page.evaluate(()=>document.fonts?.ready);
    await page.waitForTimeout(180);
    const facts=await page.evaluate(()=>{
      const rect=s=>document.querySelector(s)?.getBoundingClientRect();
      const style=s=>{const e=document.querySelector(s);return e?getComputedStyle(e):null};
      return{sw:document.documentElement.scrollWidth,iw:innerWidth,ih:innerHeight,heroCopy:rect('.hero-copy'),heroTitle:rect('.hero h1'),heroMedia:rect('.hero-media'),promise:rect('.promise'),menuBtnDisplay:style('.menu-button')?.display,desktopNavDisplay:style('.desktop-nav')?.display,bottomDock:!!document.querySelector('.mobile-journey-dock'),projectCount:document.querySelectorAll('.project-card').length,logoRadius:style('.brand')?.borderRadius};
    });
    assert.ok(facts.sw<=facts.iw+1,`${name}: horizontal overflow ${facts.sw-facts.iw}px`);
    assert.equal(facts.bottomDock,false,`${name}: forbidden bottom dock exists`);
    assert.equal(facts.projectCount,5,`${name}: expected 5 projects`);
    assert.ok(parseFloat(facts.logoRadius)>=25,`${name}: logo container is not circular enough`);
    assert.ok(facts.promise.top>=facts.ih*.96,`${name}: next section leaks into initial hero`);
    if(mobile){
      assert.notEqual(facts.menuBtnDisplay,'none',`${name}: menu button hidden`);
      assert.ok(facts.heroCopy.top>=70&&facts.heroCopy.bottom<=facts.ih-8,`${name}: hero copy outside viewport`);
      assert.ok(facts.heroTitle.left>=10&&facts.heroTitle.right<=facts.iw-10,`${name}: hero title clipped horizontally`);
    }else{
      assert.equal(facts.menuBtnDisplay,'none',`${name}: mobile menu button leaked to desktop`);
      assert.notEqual(facts.desktopNavDisplay,'none',`${name}: desktop nav hidden`);
      assert.ok(facts.heroCopy.top>=80&&facts.heroCopy.bottom<=facts.ih-20,`${name}: desktop hero copy outside viewport`);
      assert.ok(facts.heroMedia.top>=70&&facts.heroMedia.bottom<=facts.ih-30,`${name}: desktop hero media outside viewport`);
    }
    await page.screenshot({path:`qa-artifacts/${name}-home.png`,fullPage:false});

    if(mobile){
      await page.click('.menu-button');await page.waitForTimeout(260);
      const menu=await page.evaluate(()=>{const e=document.querySelector('.mobile-menu'),r=e.getBoundingClientRect(),s=getComputedStyle(e),h=document.querySelector('.site-header').getBoundingClientRect();return{top:r.top,bottom:r.bottom,left:r.left,right:r.right,opacity:Number(s.opacity),backdrop:s.backdropFilter||s.webkitBackdropFilter,headerBottom:h.bottom}});
      assert.ok(menu.top>=menu.headerBottom-1,`${name}: menu overlaps header`);
      assert.ok(menu.left>=0&&menu.right<=width+1&&menu.bottom<=height+1,`${name}: menu escapes viewport`);
      assert.ok(menu.backdrop==='none'||menu.backdrop==='',`${name}: menu is still glass/blurred`);
      assert.ok(menu.opacity>.9,`${name}: menu not visible`);
      await page.screenshot({path:`qa-artifacts/${name}-menu.png`,fullPage:false});
      await page.click('.menu-button');
    }else{
      const heroHeight=await page.locator('.hero').evaluate(e=>e.offsetHeight);
      const target=Math.max(1,(heroHeight-height)*.7);
      await page.evaluate(y=>window.scrollTo(0,y),target);await page.waitForTimeout(180);
      const immersed=await page.locator('.hero-media').evaluate(e=>{const r=e.getBoundingClientRect();return{w:r.width,h:r.height,left:r.left,top:r.top}});
      assert.ok(immersed.w>=width*.82,`${name}: hero scroll transformation too weak (${Math.round(immersed.w)}px)`);
      await page.screenshot({path:`qa-artifacts/${name}-hero-scroll.png`,fullPage:false});
      const projectHeight=await page.locator('#projects').evaluate(e=>e.offsetHeight),projectTop=await page.locator('#projects').evaluate(e=>e.offsetTop);
      await page.evaluate(y=>window.scrollTo(0,y),projectTop+Math.max(1,(projectHeight-height)*.45));await page.waitForTimeout(180);
      const tr=await page.locator('.project-track').evaluate(e=>getComputedStyle(e).transform);
      assert.notEqual(tr,'none',`${name}: desktop project scroll track not moving`);
      await page.screenshot({path:`qa-artifacts/${name}-projects-scroll.png`,fullPage:false});
    }

    let modalButton;
    if(mobile){
      const firstProject=page.locator('.project-card').first();
      await firstProject.scrollIntoViewIfNeeded();
      await page.waitForTimeout(80);
      modalButton=firstProject.locator('button');
    }else{
      modalButton=page.locator('.project-card.focus .project-open').first();
      await modalButton.waitFor({state:'visible',timeout:5000});
    }
    await modalButton.click({timeout:5000});
    await page.waitForTimeout(120);
    const modal=await page.evaluate(()=>{const d=document.querySelector('dialog'),img=d?.querySelector('img'),r=d?.getBoundingClientRect();return{open:!!d?.open,img:!!img,nw:img?.naturalWidth||0,top:r?.top||0,bottom:r?.bottom||0}});
    assert.ok(modal.open,`${name}: project modal did not open`);assert.ok(modal.img&&modal.nw>0,`${name}: project image missing in modal`);assert.ok(modal.top>=0&&modal.bottom<=height+2,`${name}: modal exceeds viewport`);
    await page.screenshot({path:`qa-artifacts/${name}-modal.png`,fullPage:false});await page.keyboard.press('Escape');
    console.log(`PASS ${name}`);
  }catch(e){failures.push(`${name}: ${e.message}`);await page.screenshot({path:`qa-artifacts/${name}-FAIL.png`,fullPage:false}).catch(()=>{});console.error(`FAIL ${name}: ${e.message}`)}finally{if(pageErrors.length)failures.push(`${name}: runtime errors: ${pageErrors.join(' | ')}`);await context.close()}
}
await browser.close();
if(failures.length){console.error('\nFINAL QA FAILED\n'+failures.join('\n'));process.exit(1)}
console.log('\nFINAL QA GREEN — all responsive acceptance gates passed.');
