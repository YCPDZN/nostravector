// Mobile itch.io regressions: the Milky Way intro never waits forever on narration, and the
// whole main menu stays reachable by touch inside an embed that blocks frame scrolling.
// Run from the repo root: node work/test_itch_mobile_menu_intro_browser.js (NV_ITCH_ROOT picks another release folder).
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium,devices}=require('playwright');
const root=path.resolve(process.env.NV_ITCH_ROOT||'.');
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.mp3':'audio/mpeg','.json':'application/json'};
let stallAudio=false;
const server=http.createServer((req,res)=>{
 const url=decodeURIComponent(req.url.split('?')[0]);
 if(stallAudio&&url.endsWith('.mp3'))return; // A stuck mobile connection: the request never answers.
 if(url==='/embed.html'){res.setHeader('Content-Type','text/html');res.end('<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><style>html,body{margin:0;height:100%;overflow:hidden}iframe{border:0;width:100%;height:100%;display:block}</style><iframe src="/game/index.html" scrolling="no" allow="autoplay; fullscreen *" allowfullscreen></iframe>');return;}
 const file=path.resolve(root,url.replace(/^\/game\//,''));
 if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end();return;}
 res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');fs.createReadStream(file).pipe(res);
});
async function swipeUp(page,cdp,times=4){const {width,height}=page.viewportSize(),x=Math.round(width*.2),y=Math.round(height*.85);
 for(let k=0;k<times;k++){await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});for(let i=1;i<=12;i++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y:y-i*Math.round(height*.05)}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await page.waitForTimeout(200);}}
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;const browser=await chromium.launch();
 try{
  for(const name of ['iPhone 13','iPhone 13 landscape','Pixel 7']){
   const ctx=await browser.newContext({...devices[name]}),page=await ctx.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto(base+'/embed.html',{waitUntil:'load',timeout:120000});const f=page.frames().find(f=>f.url().endsWith('/game/index.html'));assert(f);
   await page.waitForTimeout(1000);await swipeUp(page,await ctx.newCDPSession(page));
   const footer=await f.evaluate(()=>{const r=document.querySelector('#fullToggle').getBoundingClientRect();return r.bottom<=innerHeight&&r.top>=0;});
   assert(footer,name+': menu footer cannot be reached by touch');assert.deepEqual(errors,[]);await ctx.close();
  }
  // Narration that fails or never loads must not hold the intro on its first line.
  for(const mode of ['abort','stall']){
   const ctx=await browser.newContext({...devices['iPhone 13']});stallAudio=false;if(mode==='abort')await ctx.route('**/*.mp3',r=>r.abort());
   const page=await ctx.newPage();await page.goto(base+'/game/index.html',{waitUntil:'load',timeout:180000});await page.waitForFunction(()=>typeof beginQuote==='function'&&typeof NVTouch==='object',null,{timeout:120000,polling:500}).catch(async e=>{throw Error(mode+': page never finished loading '+JSON.stringify(await page.evaluate(()=>[document.readyState,typeof beginQuote,typeof NVTouch,performance.getEntriesByType('resource').filter(r=>!r.responseEnd).map(r=>r.name)]).catch(x=>x.message)))});
   stallAudio=mode==='stall'; // Narration is only requested once the intro starts.
   await page.evaluate(()=>{document.querySelector('#newGame').click();beginQuote(0);});
   // Drive the intro clock directly so slow software WebGL cannot make the check flaky.
   const quote=await page.evaluate(()=>{cancelAnimationFrame(introFrame);for(let t=0;t<=30000;t+=100)introTick(performance.now()+t);return [currentQuote,introActive,!document.querySelector('#intro').hidden];});
   assert(quote[0]>=2||!quote[1],mode+': intro stalled on quote '+(quote[0]+1));await ctx.close();
  }
  console.log('Passed mobile menu scrolling in a no-scroll iframe (portrait, landscape, Android) and intro progress without narration audio.');
 }finally{await browser.close();server.closeAllConnections();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
