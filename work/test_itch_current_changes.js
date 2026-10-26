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
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
 try{
  for(const file of ['test_reset_disabled_browser.js','test_nightmare_main_game_browser.js']){
   let script=fs.readFileSync(path.join('work',file),'utf8').replace("pathToFileURL(path.resolve('outputs/NOSTRAVECTOR_Main_Menu.html')).href",JSON.stringify(base+'/itch-preview/index.html'));
   script=script.replaceAll("path:'outputs/","path:'outputs/itch-html5-qa/");
   try{const r=await promisify(execFile)(process.execPath,['-e',script],{cwd:process.cwd(),maxBuffer:2*1024*1024,timeout:180000});process.stdout.write(r.stdout);if(r.stderr)process.stderr.write(r.stderr);}
   catch(error){throw Error(file+': '+(error.stderr||error.message).slice(-6000));}
  }
  assert.deepEqual(failures,[]);console.log('Current release galaxy and faction-name regressions passed over HTTP with no missing files.');
 }finally{await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});

