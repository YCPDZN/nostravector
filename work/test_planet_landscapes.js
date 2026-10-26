const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const elements=new Map(),storage=new Map();const ctx=new Proxy({createImageData:(w,h)=>({data:new Uint8Array(w*h*4)})},{get:(o,k)=>k in o?o[k]:()=>{}});
const el=id=>{if(!elements.has(id))elements.set(id,{hidden:false,textContent:'',dataset:{},firstChild:{textContent:''},width:80,height:80,setAttribute(k,v){this[k]=v;},getContext:()=>ctx});return elements.get(id);};
const c=vm.createContext({console,Math,JSON,Number,Map,Set,Uint8Array,$:el,document:{createElement:()=>({getContext:()=>ctx})}});
for(const file of ['antarctica_core.js','africa_core.js','sol_catalog.js','planet_landscapes.js','space_core.js','menu_location.js','planet_map.js'])vm.runInContext(fs.readFileSync(__dirname+'/'+file,'utf8'),c);
const run=x=>vm.runInContext(x,c),data=x=>JSON.parse(run('JSON.stringify('+x+')'));
run("let savedGame={id:'alpha',progress:{antarctica:{space:{body:'mars',phase:'landed'}}}},polarState=NVAntarctica.fresh(11);polarState.space=NVSpace.fresh();let menuHasOrion=()=>false;");
assert.equal(run('Object.keys(NVLandscapes.profiles).length'),50);
const signatures=new Set();
for(const b of data('NVSol.worlds')){
  const sample=data(`Array.from({length:80},(_,i)=>NVLandscapes.height(Math.sin(i*3)*480,Math.cos(i*4)*520,11,'${b.id}'))`);assert.ok(sample.every(Number.isFinite));
  assert.deepEqual(sample,data(`Array.from({length:80},(_,i)=>NVLandscapes.height(Math.sin(i*3)*480,Math.cos(i*4)*520,11,'${b.id}'))`),b.id+' terrain is deterministic');
  if(!b.giant){const sig=sample.map(v=>v.toFixed(3)).join(',');assert.ok(!signatures.has(sig),b.id+' must have distinct topography');signatures.add(sig);if(b.id!=='earth')assert.equal(run(`NVLandscapes.height(0,0,11,'${b.id}')`),0,'Safe level landing area');}
  run(`polarState.space.body='${b.id}';polarState.space.phase='landed';polarState.space.time+=1;updatePlanetMap();`);assert.equal(el('#planetMinimap').hidden,b.id==='earth');if(b.id!=='earth')assert.equal(el('#planetMapTitle').textContent,b.name.toUpperCase());
  run(`savedGame.progress.antarctica.space.body='${b.id}';updateMenuLocation();`);assert.equal(el('#menu').dataset.location,b.id);assert.equal(el('.earth-label h2').textContent,b.name.toUpperCase());
}
run("polarState.space.body='jupiter';rememberMenuLocation();updateMenuLocation();");assert.equal(el('.earth-label h2').textContent,'JUPITER','Menu tracks unsaved live location without changing the manual checkpoint');
assert.equal(run('savedGame.progress.antarctica.space.body'),data('NVSol.worlds.at(-1).id'));
run("savedGame={id:'beta',progress:{antarctica:{space:{body:'europa',phase:'landed'}}}};updateMenuLocation();");assert.equal(el('.earth-label h2').textContent,'EUROPA','Switching characters selects their own location');
run("savedGame={id:'alpha',progress:{antarctica:{space:{body:'mars',phase:'landed'}}}};updateMenuLocation();");assert.equal(el('.earth-label h2').textContent,'MARS','Changed checkpoint invalidates stale session location');
run("savedGame=null;updateMenuLocation();");assert.equal(el('.earth-label h2').textContent,'EARTH');
assert.equal(run("NVSpace.surfaceGround(24,25,11,'charon')"),.6);
assert.equal(run('new Set(Object.values(NVLandscapes.profiles).map(p=>p.title)).size'),50);
// Exercise the menu's NASA atlas geometry, sphere fallback, rings and embedded image uploads.
c.GL=new Proxy({createBuffer:()=>({}),createTexture:()=>({}),bufferData:(target,v)=>assert.ok(Array.from(v).every(Number.isFinite)),drawElements:(mode,n)=>assert.ok(n>0)},{get:(o,k)=>k in o?o[k]:()=>{}});
c.Image=class{set src(value){assert.ok(value.startsWith('data:image/'));this.onload?.();}};
c.geometry=Object.fromEntries(['mercury','jupiter','saturn'].map(id=>[id,JSON.parse(fs.readFileSync(__dirname+'/sol-assets/'+id+'-mesh.json','utf8'))]));
run("const gl=GL,SOL_GEOMETRY=geometry,SOL_MAPS=Object.fromEntries([...NVSol.worlds.map(b=>b.id),'saturn-ring'].map(id=>[id,'data:image/jpeg;base64,AA==']));const texture={},eb={},ub={},ib={},ei=Array(12).fill(0),el={a:{p:0,uv:1},u:{atmosphere:0,rot:1,matrix:2}};function buffer(t,data){gl.bufferData(t,data);return{};}function attribute(){}function rot(){return Array(9).fill(0);}function matrix(){return Array(16).fill(0);}");
vm.runInContext(fs.readFileSync(__dirname+'/planet_menu_renderer.js','utf8'),c);
run('for(const b of NVSol.worlds){const a=menuWorldAsset(b);if(a.texture!==menuWorldAsset(b).texture)throw Error("Menu texture cache changed");drawMenuRing(b,[],.5,.5,.5,1200,720);}');
run("menuWorldAssets.delete('sedna');delete SOL_MAPS.sedna;menuWorldAsset(NVSol.byId.sedna);");
console.log('Passed: 50 world profiles, distinct deterministic solid terrain, landing/station safety, minimaps, live/menu save isolation, character switching, menu planet geometry/textures/rings and artistic fallback.');
