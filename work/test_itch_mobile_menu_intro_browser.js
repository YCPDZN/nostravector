// Mobile itch.io regressions: the Milky Way intro never waits forever on narration, and the
// whole main menu stays reachable by touch inside an embed that blocks frame scrolling.
// Run from the repo root: node work/test_itch_mobile_menu_intro_browser.js (NV_ITCH_ROOT picks another release folder).
// The game is served by Python's http.server, which handles the large index.html more reliably than an in-process server.
const path=require('node:path'),net=require('node:net'),assert=require('node:assert/strict');
const {spawn}=require('node:child_process');
const {chromium,devices}=require('playwright');
const root=path.resolve(process.env.NV_ITCH_ROOT||'.');
const EMBED='<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><style>html,body{margin:0;height:100%;overflow:hidden}iframe{border:0;width:100%;height:100%;display:block}</style><iframe src="/index.html" scrolling="no" allow="autoplay; fullscreen *" allowfullscreen></iframe>';
const freePort=()=>new Promise(r=>{const s=net.createServer().listen(0,'127.0.0.1',()=>{const {port}=s.address();s.close(()=>r(port));});});
async function waitForServer(port){for(let i=0;i<100;i++){try{if((await fetch(`http://127.0.0.1:${port}/release-manifest.json`,{method:'HEAD'})).ok)return;}catch{}await new Promise(r=>setTimeout(r,100));}throw Error('Local server did not start');}
async function swipeUp(page,cdp,times=4){const {width,height}=page.viewportSize(),x=Math.round(width*.2),y=Math.round(height*.85);
 for(let k=0;k<times;k++){await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});for(let i=1;i<=12;i++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y:y-i*Math.round(height*.05)}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await page.waitForTimeout(200);}}
async function embedded(ctx,base){await ctx.route('**/embed.html',r=>r.fulfill({contentType:'text/html',body:EMBED}));const top=await ctx.newPage();await top.goto(base+'/embed.html',{waitUntil:'load',timeout:180000});const f=top.frames().find(f=>f.url().endsWith('/index.html'));assert(f);return {top,f};}
(async()=>{const port=await freePort(),base='http://127.0.0.1:'+port;
 const server=spawn('python3',['-m','http.server',String(port),'--bind','127.0.0.1','--directory',root],{stdio:'ignore'});
 let browser;
 try{
  await waitForServer(port);browser=await chromium.launch();
  for(const name of ['iPhone 13','iPhone 13 landscape','Pixel 7']){
   const ctx=await browser.newContext({...devices[name]}),errors=[];const {top,f}=await embedded(ctx,base);top.on('pageerror',e=>errors.push(e.message));
   await top.waitForTimeout(1000);await swipeUp(top,await ctx.newCDPSession(top));
   const footer=await f.evaluate(()=>{const r=document.querySelector('#fullToggle').getBoundingClientRect();return r.bottom<=innerHeight&&r.top>=0;});
   assert(footer,name+': menu footer cannot be reached by touch');assert.deepEqual(errors,[]);await ctx.close();
  }
  // Narration that fails or never loads must not hold the intro on its first line.
  for(const mode of ['abort','stall']){
   const ctx=await browser.newContext({...devices['iPhone 13']});let stall=false;
   await ctx.route('**/*.mp3',r=>mode==='abort'?r.abort():stall?undefined:r.continue()); // A stalled request is never answered.
   const {f:page}=await embedded(ctx,base);
   await page.waitForFunction(()=>typeof beginQuote==='function'&&typeof NVTouch==='object',null,{timeout:120000,polling:500});
   stall=true; // Narration is only requested once the intro starts.
   await page.evaluate(()=>{document.querySelector('#newGame').click();beginQuote(0);});
   // Drive the intro clock directly so slow software WebGL cannot make the check flaky.
   const quote=await page.evaluate(()=>{cancelAnimationFrame(introFrame);for(let t=0;t<=30000;t+=100)introTick(performance.now()+t);return [currentQuote,introActive];});
   assert(quote[0]>=2||!quote[1],mode+': intro stalled on quote '+(quote[0]+1));await ctx.close();
  }
  console.log('Passed mobile menu scrolling in a no-scroll iframe (portrait, landscape, Android) and intro progress without narration audio.');
 }finally{if(browser)await browser.close();server.kill();}
})().catch(e=>{console.error(e);process.exitCode=1;});
