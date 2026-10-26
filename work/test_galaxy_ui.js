const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const elements=new Map(),listeners=[];
const canvas=new Proxy({canvas:{width:900,height:650},createRadialGradient:()=>({addColorStop(){}}),createImageData:(w,h)=>({data:new Uint8Array(w*h*4)})},{get:(o,k)=>o[k]||(()=>{})});
function el(id){if(!elements.has(id))elements.set(id,{id,hidden:true,style:{setProperty(){}},textContent:'',dataset:{},append(){},setAttribute(){},focus(){},getContext:()=>canvas,toDataURL:()=> 'data:image/png;base64,AA==',querySelector:q=>el(id+' '+q)});return elements.get(id);}
const c=vm.createContext({console,Math,Number,JSON,Map,Set,Uint8Array,$:el,document:{createElement:()=>el('new-'+elements.size),querySelectorAll:()=>[],addEventListener:(k,f)=>listeners.push(f)}}),run=s=>vm.runInContext(s,c);
for(const f of ['antarctica_core.js','antarctica_betrayal_core.js','africa_core.js','sol_catalog.js','planet_landscapes.js','space_core.js','world_flight.js','galaxy_core.js','cluster_core.js','hak_model.js'])run(fs.readFileSync(__dirname+'/'+f,'utf8'));
run(`let gameActive=true,gamePaused=false,spaceChartOpen=false,polarState=NVAntarctica.fresh(124),polarKeys=new Set(),polarCanvas=$('#polarWorld');polarState.africaStarted=true;polarState.africaStage='complete';polarState.space=NVSpace.fresh();polarState.space.phase='flight';NVSpace.orbit(polarState);
function spaceActive(){return NVSpace.active(polarState);}function pausePolar(v){gamePaused=v;}function toggleSolChart(v){spaceChartOpen=v;}function updatePolarHUD(){}function populateSolChart(){}function drawSolChart(){}function refreshSolChart(){}function updateMenuLocation(){return NVSol.byId[polarState.space.body];}function exitPolar(){gameActive=false;}function spaceInput(){return false;}function missionWaypointTarget(){return null;}const SOL_MAPS={};`);
run(fs.readFileSync(__dirname+'/galaxy_game.js','utf8'));
run('function closeCustomizer(){}function openCustomizer(){}function writeGameSave(){}');el('#milkyMap').width=1000;el('#milkyMap').height=650;
run(fs.readFileSync(__dirname+'/cluster_game.js','utf8').replace('__CLUSTER_MAPS__','{}'));
run("galaxyButton.onclick();clusterSelect(\'janira-proxima\')");assert.equal(run('gamePaused'),true);assert.equal(run('galaxySheet.hidden'),false);assert.equal(el('#galaxyName').textContent,'JANIRA PROXIMA');assert.equal(el('#galaxyWarp').disabled,false);
el('#galaxyWarp').onclick();assert.equal(run('gamePaused'),false);assert.equal(run('galaxySheet.hidden'),true);run('updatePolarHUD()');assert.equal(run('warpView.hidden'),false);
for(let i=0;i<81;i++)run('NVSpace.step(polarState,.1,{})');run('updatePolarHUD()');assert.equal(run('warpView.hidden'),true);assert.equal(el('#solChart h2').textContent,'THE JANIRA ATLAS.');assert.ok(el('#solDestinations').innerHTML.includes('JANIRA I'));assert.ok(!el('#solDestinations').innerHTML.includes('MARS'));
run("NVWorldFlight.enter(polarState);NVWorldFlight.ensure(polarState).altitude=70;NVWorldFlight.land(polarState)");for(let i=0;i<10;i++)run('NVSpace.step(polarState,.1,{})');run('const figure=NVGalaxy.figure(polarState);polarState.x=figure.x;polarState.z=figure.z-3;updatePolarHUD();speakJanira()');assert.equal(run('gamePaused'),true);assert.equal(run('janiraDialogue.hidden'),false);assert.equal(run('janiraDialogue.querySelector("p").textContent'),run('JANIRA_DIALOGUE[0]'));
for(let i=0;i<5;i++)el('#janiraNext').onclick();assert.equal(run('gamePaused'),false);assert.equal(run('NVGalaxy.ensure(polarState).metFigure'),true);assert.equal(run('janiraDialogue.hidden'),true);
run("polarState.space.phase='flight';NVGalaxy.warp(polarState,'sol')");for(let i=0;i<81;i++)run('NVSpace.step(polarState,.1,{})');run('updatePolarHUD()');assert.equal(el('#solChart h2').textContent,'THE SOL ATLAS.');
run(fs.readFileSync(__dirname+'/galaxy_scenery.js','utf8'));
let grass=0,parts=0;const renderer=run('createJaniraScenery')({object:()=>grass++,ground:()=>0,mesh:q=>{assert.ok(q.p.flat().every(Number.isFinite));assert.ok(q.f.every(i=>i>=0&&i<q.p.flat().length/3));return q;},M:{mul:(a,b)=>a,t:(...a)=>a,scale:(...a)=>a},draw:()=>parts++});
run("polarState.space.system='janira-proxima';polarState.space.body='janira-prime';polarState.space.phase='landed'");renderer(run('polarState'),1);assert.ok(grass>0);assert.ok(parts>20);
// A new or restarted Chapter 1 has no space state yet. The galaxy HUD must
// leave the intro render loop running instead of dereferencing a null ship.
run('polarState=NVAntarctica.fresh(125);updatePolarHUD()');
assert.equal(run('galaxyButton.hidden'),true);assert.equal(run('warpView.hidden'),true);assert.equal(run('janiraTalk.hidden'),true);assert.equal(run('polarState.space'),null);
console.log('Passed galaxy map controls, encounter, geometry and fresh Chapter 1 with no ship state.');
