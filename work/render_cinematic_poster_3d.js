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
text('THE STARS REMEMBER.',900,100,31,'#b7d4df');
const s={eris:NVEris.fresh(),space:{body:'earth',phase:'landed'}};
const list=[{id:'wanderer',name:'THE WANDERER',role:'CAPTAIN'},
{id:'orion',name:'ORION MASCAR',role:'COMPANION'},{id:'khazglar',name:'KHAZGLAR',role:'COMPANION'},
{id:'nyrexia',name:'NYREXIA ERISCONOS',role:'COMPANION'},{id:'james',name:'JAMES BROWN',role:'COMPANION'},
{id:'croxian',name:'CROXIAN MASCAR',role:'COMPANION'},{id:'malia',name:'MALIA DE TORO',role:'COMPANION'},
{id:'williams',name:'JOSIAH WILLIAMS II',role:'COMPANION'},{id:'charon',name:'CHARON',role:'COMPANION'},
{id:'kizna',name:'KIZNA',role:'COMPANION'},{id:'custom',name:'CUSTOM SPECIES',role:'YOUR CREATION'},
{id:'pontifex',name:'PONTIFEX MAXIMUS',role:'RECRUITABLE COMPANION'}];
const manifest=[],renders={};
for(let i=0;i<list.length;i++){
const q=list[i];
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
const snap=document.createElement('canvas');snap.width=canvas.width;snap.height=canvas.height;const sc=snap.getContext('2d');sc.drawImage(canvas,0,0);
const pixels=sc.getImageData(0,0,snap.width,snap.height);let left=snap.width,right=0,top=snap.height,bottom=0;
for(let yy=0;yy<snap.height;yy++)for(let xx=0;xx<snap.width;xx++)if(pixels.data[(yy*snap.width+xx)*4+3]>20){left=Math.min(left,xx);right=Math.max(right,xx);top=Math.min(top,yy);bottom=Math.max(bottom,yy)}
renders[q.id]={canvas:snap,left,top,width:right-left+1,height:bottom-top+1};canvas.getContext('webgl').getExtension('WEBGL_lose_context')?.loseContext();canvas.remove();
manifest.push({id:q.id,name:q.name,meshCount:mesh.length,triangles:mesh.reduce((n,m)=>n+m.indices.length/3,0)});
}
const placements=[['orion',-30,330,580,1050,.78],['nyrexia',1310,340,550,1050,.8],['khazglar',460,180,870,1220,.94],['williams',1030,870,550,1030,.92],['malia',285,990,470,1000,.94],['james',-40,1080,600,1050,1],['croxian',1270,1040,600,1130,1],['charon',-65,1790,470,640,1],['kizna',1420,1800,440,630,1],['custom',300,1750,400,710,1],['pontifex',1090,1660,530,790,1],['wanderer',640,1420,530,1030,1]];
for(const [id,x,y,w,h,alpha]of placements){const r=renders[id],layer=document.createElement('canvas');layer.width=w;layer.height=h;const d=layer.getContext('2d');const fit=Math.min(w/r.width,h/r.height),dw=r.width*fit,dh=r.height*fit;d.drawImage(r.canvas,r.left,r.top,r.width,r.height,(w-dw)/2,0,dw,dh);d.globalCompositeOperation='destination-in';const fade=d.createLinearGradient(0,0,0,h);fade.addColorStop(0,'#fff');fade.addColorStop(.64,'#fff');fade.addColorStop(1,'#ffffff00');d.fillStyle=fade;d.fillRect(0,0,w,h);c.globalAlpha=alpha;c.shadowColor='#000a';c.shadowBlur=35;c.shadowOffsetY=12;c.drawImage(layer,x,y);c.shadowBlur=0;c.shadowOffsetY=0;c.globalAlpha=1;}
const fog=c.createLinearGradient(0,2080,0,2600);fog.addColorStop(0,'#03081400');fog.addColorStop(.45,'#030814d0');fog.addColorStop(1,'#030814');c.fillStyle=fog;c.fillRect(0,2080,W,620);
c.save();c.beginPath();c.ellipse(900,2820,1500,570,0,Math.PI,2*Math.PI);c.shadowColor='#69d9ff';c.shadowBlur=40;c.strokeStyle='#7acfeaa0';c.lineWidth=3;c.stroke();c.restore();
text('BEYOND THE FAMILIAR',900,2260,30,'#a1cddc');c.textAlign='center';c.font='bold 154px Arial';c.fillStyle='#e9f5f8';c.shadowBlur=28;c.shadowColor='#3684a0';c.fillText('NOSTRAVECTOR',900,2440);c.shadowBlur=0;
text('ONE GALAXY. MANY WORLDS. YOUR CREW.',900,2505,23,'#8bb5c5');
text('ORION MASCAR  /  KHAZGLAR  /  NYREXIA ERISCONOS  /  JAMES BROWN',900,2578,17,'#8d9eaa');text('CHARON  /  KIZNA  /  MALIA DE TORO  /  CROXIAN MASCAR  /  JOSIAH WILLIAMS II',900,2607,17,'#8d9eaa');text('AND THE COMPANIONS YOU DISCOVER AMONG THE STARS',900,2645,14,'#6a8796');
return {png:out.toDataURL('image/png').split(',')[1],manifest};
});
fs.writeFileSync('outputs/NOSTRAVECTOR_Cinematic_Poster_3D.png',Buffer.from(result.png,'base64'));
fs.writeFileSync('outputs/NOSTRAVECTOR_Cinematic_Poster_3D_Assets.json',JSON.stringify(result.manifest,null,2));
console.log(JSON.stringify(result.manifest));
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
