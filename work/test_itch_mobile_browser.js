const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {execFile}=require('node:child_process'),{promisify}=require('node:util');
const {chromium}=require('C:/Users/HOME/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=path.resolve(process.env.NV_ITCH_ROOT||'outputs/NOSTRAVECTOR_ITCH_MOBILE'),qa=path.resolve('outputs/itch-mobile-qa');fs.mkdirSync(qa,{recursive:true});
const manifest=JSON.parse(fs.readFileSync(path.join(root,'release-manifest.json'),'utf8')),failures=[];
const server=http.createServer((req,res)=>{
 if(req.url==='/favicon.ico'){res.writeHead(204);res.end();return;}
 if(req.url==='/embed.html'){res.setHeader('Content-Type','text/html');res.end('<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><style>html,body{margin:0;width:100%;height:100%;overflow:hidden}iframe{border:0;width:100%;height:100%}</style><iframe src="/itch-preview/index.html" allow="autoplay; fullscreen; gamepad" allowfullscreen sandbox="allow-scripts allow-same-origin allow-pointer-lock allow-forms allow-modals allow-downloads"></iframe>');return;}
 const relative=decodeURIComponent(req.url.split('?')[0]).replace(/^\/itch-preview\//,'');
 const file=path.resolve(root,relative);
 if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){failures.push(req.url);res.writeHead(404);res.end();return;}
 const stat=fs.statSync(file),range=/^bytes=(\d+)-(\d*)$/.exec(req.headers.range||'');let start=0,end=stat.size-1;
 res.setHeader('Content-Type',file.endsWith('.html')?'text/html; charset=utf-8':file.endsWith('.mp3')?'audio/mpeg':file.endsWith('.json')?'application/json':file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':'text/plain');res.setHeader('Accept-Ranges','bytes');
 if(range){start=Number(range[1]);end=range[2]?Math.min(end,Number(range[2])):end;if(start>end){res.writeHead(416);res.end();return;}res.statusCode=206;res.setHeader('Content-Range',`bytes ${start}-${end}/${stat.size}`);}
 res.setHeader('Content-Length',end-start+1);if(req.method==='HEAD'){res.end();return;}fs.createReadStream(file,{start,end}).pipe(res);
});
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));let b;
try{
 b=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--mute-audio']});
 const p=await b.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:1}),errors=[];p.on('pageerror',e=>errors.push(e.stack));await p.addInitScript(()=>{requestAnimationFrame=()=>0;setInterval=()=>0;});
 await p.goto('http://127.0.0.1:'+server.address().port+'/embed.html',{waitUntil:'load',timeout:120000});const f=p.frames().find(f=>f.url().endsWith('/itch-preview/index.html'));assert(f);assert.deepEqual(errors,[]);
 await p.screenshot({path:path.join(qa,'menu-portrait.png')});assert(await f.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 await f.evaluate(()=>{creatingCharacter=true;writeGameSave({...DEFAULT_WANDERER,name:'Mobile QA'});creatingCharacter=false;startAntarctica();polarTick(1000);for(let i=0;i<5;i++){advanceJames();polarTick(1050+i*50);}updatePolarHUD();NVTouch.refresh(true);});
 console.log('Ground state',await f.evaluate(()=>({context:NVTouch.context(),blocked:NVTouch.blocked(),hidden:document.getElementById('nvMobileControls').hidden})));
 assert(await f.locator('#nvMobileStick').isVisible());
 await f.evaluate(()=>{window.touchlog=[];for(const t of ['pointerdown','pointerup','pointercancel'])document.addEventListener(t,e=>touchlog.push([t,e.pointerId,e.target.id]),true);});const cdp=await p.context().newCDPSession(p),points=new Map();async function touch(type,id,x,y){if(type==='touchStart'||type==='touchMove')points.set(id,{id,x,y,radiusX:5,radiusY:5,force:1});else points.delete(id);await cdp.send('Input.dispatchTouchEvent',{type,touchPoints:[...points.values()]});}
 const stick=await f.locator('#nvMobileStick').boundingBox(),fire=await f.locator('#nvMobileFire').boundingBox(),sx=stick.x+stick.width/2,sy=stick.y+stick.height/2;
 await touch('touchStart',1,sx,sy-35);assert(await f.evaluate(()=>polarKeys.has('KeyW')));
 await touch('touchStart',2,fire.x+fire.width/2,fire.y+fire.height/2);assert(await f.evaluate(()=>NVTouch.held.includes('KeyZ')));
 await touch('touchEnd',2);console.log('After fire release',await f.evaluate(()=>({keys:[...polarKeys],held:NVTouch.held,blocked:NVTouch.blocked(),log:touchlog})));assert(await f.evaluate(()=>!polarKeys.has('KeyW')&&NVTouch.held.includes('KeyZ')));await touch('touchEnd',1);await touch('touchStart',1,sx,sy-35);
 const moved=await f.evaluate(()=>{const a={x:polarState.x,z:polarState.z};for(let i=0;i<5;i++)polarTick(1600+i*50);return Math.hypot(polarState.x-a.x,polarState.z-a.z);});assert(moved>.1);
 await touch('touchEnd',1);assert.deepEqual(await f.evaluate(()=>NVTouch.held),[]);
 await p.screenshot({path:path.join(qa,'ground-portrait.png')});
 await f.locator('#nvMobilePause').tap();assert(await f.evaluate(()=>gamePaused&&NVTouch.held.length===0));await f.evaluate(()=>pausePolar(false));
 await p.setViewportSize({width:844,height:390});await f.evaluate(()=>NVTouch.refresh(true));await p.screenshot({path:path.join(qa,'ground-landscape.png')});
 for(const id of ['nvMobileStick','nvMobileFire','nvMobilePause']){const r=await f.locator('#'+id).boundingBox();assert(r&&r.x>=0&&r.y>=0&&r.x+r.width<=845&&r.y+r.height<=391,id);}
 await f.evaluate(()=>{exitPolar();savedGame.progress=chapterRestartProgress(savedGame,4,{orion:true,nyrexia:true,james:'spare',malia:'spare',croxian:'spare'});startAntarctica();polarTick(3000);NVTouch.refresh(true);});
 console.log('Flight state',await f.evaluate(()=>({context:NVTouch.context(),blocked:NVTouch.blocked(),phase:polarState.space.phase})));
 assert.equal(await f.evaluate(()=>NVTouch.context()),'flight');assert(await f.locator('#nvMobileStick').isVisible());
 const oldYaw=await f.evaluate(()=>polarState.space.yaw);await touch('touchStart',3,400,180);await touch('touchMove',3,470,190);await touch('touchEnd',3);assert.notEqual(await f.evaluate(()=>polarState.space.yaw),oldYaw);
 await p.screenshot({path:path.join(qa,'flight-landscape.png')});
 await f.evaluate(()=>{exitPolar();savedGame.progress=chapterRestartProgress(savedGame,41,{orion:true,nyrexia:true,james:'spare',malia:'spare',croxian:'spare'});startAntarctica();Object.assign(polarState.space,{phase:'flight',combatActive:false,warp:null});openShipInterior();NVTouch.refresh(true);});
 assert.equal(await f.evaluate(()=>NVTouch.context()),'interior');assert(await f.locator('#nvMobileStick').isVisible());assert(!(await f.locator('#nvMobileFire').isVisible()));
 await p.screenshot({path:path.join(qa,'interior-landscape.png')});
 assert.deepEqual(errors,[]);assert.deepEqual(failures,[]);console.log('Passed mobile portrait/landscape, real multitouch movement/fire, release, pause, flight swipe and interior controls.');
}finally{if(b)await b.close();await new Promise(r=>server.close(r));}})().catch(e=>{console.error(e);process.exitCode=1;});
