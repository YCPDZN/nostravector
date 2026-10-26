const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {execFile}=require('node:child_process'),{promisify}=require('node:util');
const {chromium}=require('C:/Users/HOME/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=path.resolve(process.env.NV_ITCH_ROOT||'outputs/NOSTRAVECTOR_ITCH_HTML5'),qa=path.resolve('outputs/itch-html5-qa');fs.mkdirSync(qa,{recursive:true});
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
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;let browser;
 try{
  // Every recording has a valid case-sensitive relative URL and its original length.
  let next=0;await Promise.all(Array.from({length:8},async()=>{while(next<manifest.audio.length){const clip=manifest.audio[next++],r=await fetch(base+'/itch-preview/'+clip.path,{method:'HEAD'});assert.equal(r.status,200);assert.equal(Number(r.headers.get('content-length')),clip.bytes);}}));
  browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--mute-audio']});
  const p=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];p.on('pageerror',e=>errors.push(e.stack));p.on('requestfailed',r=>{if(!r.failure().errorText.includes('ERR_ABORTED'))errors.push(r.url()+' '+r.failure().errorText);});
  await p.addInitScript(()=>{requestAnimationFrame=()=>0;setInterval=()=>0;});
  await p.goto(base+'/embed.html',{waitUntil:'load',timeout:120000});const f=p.frames().find(f=>f.url().endsWith('/itch-preview/index.html'));assert(f);
  assert.deepEqual(errors,[]);await f.locator('#newGame').click();await f.evaluate(()=>beginQuote(0));
  await f.waitForFunction(()=>voiceClips[0].currentTime>.05&&!voiceClips[0].paused,null,{timeout:20000,polling:50});
  assert(await f.evaluate(()=>voiceClips[0].src.includes('/assets/audio/')&&Number.isFinite(voiceClips[0].duration)));
  await f.evaluate(async()=>{closeIntro();const a=jamesVoiceClips[0];prepareJamesAcoustics(a);resumeJamesAcoustics();await a.play();});
  await f.waitForFunction(()=>jamesAcoustics.get(jamesVoiceClips[0])?.envelope?.rms.length>0,null,{timeout:20000,polling:50});
  assert(await f.evaluate(()=>jamesAcoustics.get(jamesVoiceClips[0]).envelope.rms.some(v=>v>.05)));await f.evaluate(()=>jamesVoiceClips[0].pause());
  for(const i of [0,200,400,manifest.audio.length-1]){const clip=manifest.audio[i];assert(await f.evaluate(async url=>{const a=new Audio(url);a.preload='metadata';return await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('Audio metadata timeout')),15000);a.onloadedmetadata=()=>{clearTimeout(timer);resolve(Number.isFinite(a.duration)&&a.duration>0);};a.onerror=()=>{clearTimeout(timer);reject(Error('Audio failed: '+url));};});},clip.path));}
  await f.evaluate(()=>{creatingCharacter=true;writeGameSave({...DEFAULT_WANDERER,name:'Itch Browser QA'});creatingCharacter=false;});
  for(const chapter of [2,3,4]){const r=await f.evaluate(chapter=>{if(gameActive)exitPolar();savedGame.progress=chapterRestartProgress(savedGame,chapter,{orion:true,nyrexia:true,james:'spare',malia:'spare',croxian:'spare'});startAntarctica();polarTick(1000+chapter*100);return{chapter:NVChapter3Access.chapter(polarState),gl:polarCanvas.getContext('webgl').getError(),error:$('#worldError').textContent};},chapter);assert.equal(r.chapter,chapter);assert.equal(r.gl,0);assert.equal(r.error,'');}
  await p.screenshot({path:path.join(qa,'itch-iframe-chapter4.png')});assert.deepEqual(errors,[]);await browser.close();browser=null;
  console.log('Passed sandboxed iframe, native narration/music URLs, fetched lip-sync envelope, metadata decoding, all '+manifest.audio.length+' audio URLs and Chapter 2/3/4 starts.');
  // Reuse the existing gameplay regressions over HTTP, with screenshots kept outside the release.
  for(const file of ['test_chapter1_carax_recovery_browser.js','test_chimaera_browser.js']){
   let script=fs.readFileSync(path.join('work',file),'utf8');script=script.replace("pathToFileURL(path.resolve('outputs/NOSTRAVECTOR_Main_Menu.html')).href",JSON.stringify(base+'/itch-preview/index.html'));
   script=script.replaceAll("path:'outputs/","path:'outputs/itch-html5-qa/");
   const r=await promisify(execFile)(process.execPath,['-e',script],{cwd:process.cwd(),maxBuffer:2*1024*1024,timeout:180000});process.stdout.write(r.stdout);if(r.stderr)process.stderr.write(r.stderr);
  }
  assert.deepEqual(failures,[]);console.log('HTML5 export passed HTTP gameplay/save/galaxy regressions with no missing files.');
 }finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
