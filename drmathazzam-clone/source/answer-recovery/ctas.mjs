import { chromium } from 'playwright-core';
import fs from 'fs';
const bank=JSON.parse(fs.readFileSync('/tmp/question-bank.json','utf8'));
const routes=JSON.parse(fs.readFileSync('/tmp/guided-routes.json','utf8'));
const b=await chromium.launch({executablePath:'/tmp/tools/pw-browsers/chromium-1248/chrome-linux64/chrome',args:['--no-sandbox','--disable-dev-shm-usage']});
const out={};
for(const route of routes){
  const ctx=await b.newContext({viewport:{width:1440,height:900}});
  const p=await ctx.newPage();
  await p.goto('https://drmathazzam.app'+route,{waitUntil:'networkidle',timeout:90000});
  await p.evaluate(()=>document.fonts.ready); await p.waitForTimeout(1400);
  const n=await p.evaluate(()=>document.querySelectorAll('[data-guided-question]').length);
  for(let i=0;i<n;i++){
    const id=await p.evaluate(i=>{const el=document.querySelectorAll('[data-guided-question]')[i];el.setAttribute('data-t','1');el.scrollIntoView({block:'center'});return el.getAttribute('data-guided-question');},i);
    const q=bank[id]; if(!q||q.correctIndex==null||out[id]) continue;
    await p.evaluate(t=>{const el=document.querySelector('[data-t]');const ls=el.querySelectorAll('label');if(ls[t])ls[t].click();},q.correctIndex);
    await p.waitForTimeout(200);
    await p.evaluate(()=>{const el=document.querySelector('[data-t]');const c=[...el.querySelectorAll('button')].find(x=>/check answer/i.test(x.textContent||''));if(c&&!c.disabled)c.click();});
    await p.waitForTimeout(400);
    const cta=await p.evaluate(()=>{
      const el=document.querySelector('[data-t]');
      const a=[...el.querySelectorAll('a')].pop();
      return a?{href:a.getAttribute('href'),text:(a.textContent||'').trim().replace(/\s+/g,' '),cls:a.className.slice(0,60)}:null;
    });
    out[id]=cta;
    await p.evaluate(()=>{const el=document.querySelector('[data-t]');const t=[...el.querySelectorAll('button')].find(x=>/try again/i.test(x.textContent||''));if(t)t.click();});
    await p.waitForTimeout(200);
    await p.evaluate(()=>{const el=document.querySelector('[data-t]');el&&el.removeAttribute('data-t');});
  }
  await ctx.close();
}
console.log(JSON.stringify(out,null,1).slice(0,2000));
fs.writeFileSync('/tmp/ctas.json',JSON.stringify(out,null,1));
await b.close();
