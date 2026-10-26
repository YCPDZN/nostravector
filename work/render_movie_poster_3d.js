// Reproducible poster made from the game's actual mesh geometry; no painted stand-ins.
const fs=require('node:fs'),path=require('node:path'),{pathToFileURL}=require('node:url');
const {chromium}=require('C:/Users/HOME/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--mute-audio']});try{
const p=await browser.newPage({viewport:{width:1800,height:2700},deviceScaleFactor:1});
await p.addInitScript(()=>{requestAnimationFrame=()=>0;setInterval=()=>0;const A=Audio;window.Audio=function(src){const a=new A(src);Object.defineProperty(a,'preload',{set:()=>a.setAttribute('preload','none')});return a;};});
await p.goto(pathToFileURL(path.resolve('outputs/NOSTRAVECTOR_Main_Menu.html')).href,{waitUntil:'domcontentloaded',timeout:120000});
await p.addScriptTag({content:fs.readFileSync('work/grek_renderer.js','utf8')});
await p.evaluate(async()=>{await NVGLB.load(NVWilliamsExpedition.MODEL)});
const result=await p.evaluate(()=>{
const W=1800,H=2700,out=document.createElement('canvas');out.width=W;out.height=H;const c=out.getContext('2d');
let seed=7381;const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
c.fillStyle='#030814';c.fillRect(0,0,W,H);
for(const [x,y,r,color]of [[130,400,1050,'#193f63'],[1700,1050,1100,'#352645'],[700,2100,1000,'#0c343e']]){const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,color);g.addColorStop(1,'#03081400');c.fillStyle=g;c.fillRect(0,0,W,H);}
for(let i=0;i<2600;i++){c.globalAlpha=.15+rnd()*.65;c.fillStyle=rnd()>.8?'#b1e8ff':'#fff';const r=rnd()*1.5;c.fillRect(rnd()*W,rnd()*H,r,r)}c.globalAlpha=1;
const text=(t,x,y,size,color='#e4edf1',font='Arial',align='center')=>{c.textAlign=align;c.font=`${size}px ${font}`;c.fillStyle=color;c.fillText(t,x,y)};
text('BEYOND THE FAMILIAR',W/2,108,25,'#93c4d1');
c.font='bold 148px Arial';c.textAlign='center';c.fillStyle='#ecf7f9';c.shadowBlur=35;c.shadowColor='#488eac';c.fillText('NOSTRAVECTOR',W/2,280);c.shadowBlur=0;
text('ONE GALAXY. MANY WORLDS. YOUR CREW.',W/2,350,23,'#8aa8b7');
const s={eris:NVEris.fresh(),space:{body:'earth',phase:'landed'}};
const list=[{id:'wanderer',name:'THE WANDERER',role:'CAPTAIN'},
{id:'orion',name:'ORION MASCAR',role:'COMPANION'},{id:'khazglar',name:'KHAZGLAR',role:'COMPANION'},
{id:'nyrexia',name:'NYREXIA ERISCONOS',role:'COMPANION'},{id:'james',name:'JAMES BROWN',role:'COMPANION'},
{id:'croxian',name:'CROXIAN MASCAR',role:'COMPANION'},{id:'malia',name:'MALIA DE TORO',role:'COMPANION'},
{id:'williams',name:'JOSIAH WILLIAMS II',role:'COMPANION'},{id:'charon',name:'CHARON',role:'COMPANION'},
{id:'kizna',name:'KIZNA',role:'COMPANION'},{id:'custom',name:'CUSTOM SPECIES',role:'YOUR CREATION'},
{id:'pontifex',name:'PONTIFEX MAXIMUS',role:'RECRUITABLE COMPANION'}];
const manifest=[];
for(let i=0;i<list.length;i++){
const q=list[i],col=i%4,row=Math.floor(i/4),x=65+col*425,y=440+row*675,bw=395,bh=640;
const g=c.createLinearGradient(x,y,x,y+bh);g.addColorStop(0,'#24404e30');g.addColorStop(.7,'#09131f85');g.addColorStop(1,'#040911ef');c.fillStyle=g;c.fillRect(x,y,bw,bh);
c.strokeStyle='#80b4c62b';c.lineWidth=1;c.strokeRect(x+.5,y+.5,bw-1,bh-1);
c.fillStyle='#73d3de';c.fillRect(x,y,40,2);c.fillStyle='#476a7c';c.fillRect(x+bw-40,y+bh-2,40,2);
let raw;
if(q.id==='wanderer')raw=parts.map(m=>({...m,color:getWandererColor(m)}));
else if(q.id==='custom'){const profile={...DEFAULT_WANDERER,species:NVSpecies.preset('reptilian')};raw=NVSpecies.parts(profile);}
else if(q.id==='williams'){raw=NVGLB.parts({name:q.name,model:NVGLB.metadata({type:'glb',id:NVWilliamsExpedition.MODEL,file:'Josiah Williams II.glb',height:1.92,triangles:43000,yaw:0})});}
else raw=NVCombatCrew.model(q.id,s).parts;
if(!raw?.length)throw Error('No meshes: '+q.id);
const mesh=raw.map(m=>({name:m.name||'',p:m.p.flat(),n:m.n.flat(),indices:m.f||m.indices,color:m.c||m.color||[.4,.5,.6],bone:'body'}));
const lo=[Infinity,Infinity,Infinity],hi=[-Infinity,-Infinity,-Infinity];for(const m of mesh)for(let j=0;j<m.p.length;j++){const a=j%3;lo[a]=Math.min(lo[a],m.p[j]);hi[a]=Math.max(hi[a],m.p[j]);}
const scale=Math.min(4.7/(hi[1]-lo[1]),3.05/(hi[0]-lo[0]));
for(const m of mesh)m.p=m.p.map((v,j)=>(v-(j%3===1?lo[1]:(lo[j%3]+hi[j%3])/2))*scale);
const canvas=document.createElement('canvas');canvas.style.cssText='position:fixed;left:0;top:0;width:600px;height:810px';document.body.append(canvas);
const draw=createGrekRenderer(canvas,{meshes:mesh},{camera:[0,-2.25,-7.65]});draw(2,{},true);
c.drawImage(canvas,x-12,y+12,bw+24,565);
canvas.getContext('webgl').getExtension('WEBGL_lose_context')?.loseContext();canvas.remove();
const shade=c.createLinearGradient(0,y+505,0,y+bh);shade.addColorStop(0,'#04091100');shade.addColorStop(.65,'#040911');c.fillStyle=shade;c.fillRect(x,y+505,bw,135);
text(q.name,x+bw/2,y+590,q.name.length>19?21:25,'#eff6f8');text(q.role,x+bw/2,y+618,13,'#77a9b9');
manifest.push({id:q.id,name:q.name,meshCount:mesh.length,triangles:mesh.reduce((n,m)=>n+m.indices.length/3,0)});
}
c.strokeStyle='#79bcc765';c.beginPath();c.moveTo(400,2520);c.lineTo(1400,2520);c.stroke();
text('THE STARS REMEMBER.',W/2,2582,31,'#d5e9ed');
text('AN ENSEMBLE OF THE WANDERER AND RECRUITABLE COMPANIONS',W/2,2635,17,'#779aa8');
return {png:out.toDataURL('image/png').split(',')[1],manifest};
});
fs.writeFileSync('outputs/NOSTRAVECTOR_Movie_Poster_3D.png',Buffer.from(result.png,'base64'));
fs.writeFileSync('outputs/NOSTRAVECTOR_Movie_Poster_3D_Assets.json',JSON.stringify(result.manifest,null,2));
console.log(JSON.stringify(result.manifest));
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
