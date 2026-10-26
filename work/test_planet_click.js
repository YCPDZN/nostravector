const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const elements=new Map(),handlers=new Map();
function $(id){if(!elements.has(id))elements.set(id,{hidden:true,style:{},dataset:{},textContent:'',setAttribute(){},focus(){},getBoundingClientRect:()=>({left:80,top:40,width:1200,height:700}),addEventListener(type,fn){handlers.set(type,fn);}});return elements.get(id);}
const context=vm.createContext({console,Math,Number,JSON,Set,Map,$,document:{querySelectorAll:()=>[]}}),run=code=>vm.runInContext(code,context);
for(const f of ['antarctica_core.js','antarctica_betrayal_core.js','africa_core.js','sol_catalog.js','planet_landscapes.js','space_core.js','world_flight.js','galaxy_core.js','cluster_core.js'])run(fs.readFileSync(__dirname+'/'+f,'utf8'));
run(`let gameActive=true,gamePaused=false,polarState=NVAntarctica.fresh(125),polarCanvas=$('#worldCanvas'),hudUpdates=0;function updatePolarHUD(){hudUpdates++;}polarState.space=NVSpace.fresh();polarState.space.phase='flight';`);
run(fs.readFileSync(__dirname+'/space_game.js','utf8'));
const pointAt=id=>run(`polarState.space.position=NVSol.byId['${id}'].position.map((v,i)=>v+[0,0,600][i]);NVSpace.pointAt(polarState.space,NVSol.byId['${id}'].position);`);
for(const [system,id] of [['sol','earth'],['sol','moon'],['janira-proxima','janira-prime'],['cluster-01',run('NVCluster.first("cluster-01").id')]]){
  run(`polarState.space.system='${system}';`);pointAt(id);assert.equal(run('NVSpace.pickWorld(polarState,0,0,1200/700).id'),id);
}
run(`polarState.space.system='sol';polarState.space.position=[0,15000,0];polarState.space.yaw=.8;polarState.space.pitch=.2;`);
// Projection and picking agree for an off-centre planet with nonzero yaw/pitch.
run(`const p=polarState.space,b=NVSol.byId.earth,original=b.position.slice(),sy=Math.sin(p.yaw),cy=Math.cos(p.yaw),sp=Math.sin(p.pitch),cp=Math.cos(p.pitch),dir=[sy*cp,sp,cy*cp],right=[-cy,0,sy],up=[-sy*sp,cp,-cy*sp];b.position=p.position.map((v,i)=>v+1000*(dir[i]+right[i]*.3*Math.tan(Math.PI/6)*1200/700+up[i]*.2*Math.tan(Math.PI/6)));`);
assert.equal(run('NVSpace.pickWorld(polarState,.3,.2,1200/700).id'),'earth');
function click(x=860,y=320,extras={}){let event={button:0,pointerId:1,clientX:x,clientY:y,preventDefault(){this.prevented=true;},...extras};handlers.get('pointerdown')(event);handlers.get('pointerup')(event);return event;}
assert.equal(click().prevented,true);assert.equal(run('polarState.space.target'),'earth');assert.equal(run('polarState.space.autopilot'),true);
run('polarState.space.speed=12;');const position=run('JSON.stringify(polarState.space.position)'),yaw=run('polarState.space.yaw');$('#spaceTargetMarker').hidden=false;
assert.equal(click(80,40).prevented,true);assert.equal(run('polarState.space.autopilot'),false);assert.equal(run('polarState.space.focusReleased'),true);assert.equal($('#spaceTargetMarker').hidden,true);
assert.equal(run('JSON.stringify(polarState.space.position)'),position,'Releasing cannot teleport the ship.');assert.equal(run('polarState.space.yaw'),yaw);assert.equal(run('polarState.space.speed'),12);assert.ok(run('polarState.space.throttle')>0,'Flight momentum transfers to manual throttle.');
click();assert.equal(run('polarState.space.autopilot'),true);assert.equal(run('polarState.space.focusReleased'),false,'A new planet click restores focus.');click(80,40);
run('polarState.africaStarted=true;polarState.africaStage="complete";const resumed=NVSpace.restore(NVSpace.clone(polarState.space),polarState);');assert.equal(run('resumed.focusReleased'),true);assert.equal(run('resumed.autopilot'),false);
run('NVSpace.step(polarState,.1,{yaw:1,accel:-1});');assert.ok(run('polarState.space.yaw')>yaw,'Manual steering works after releasing.');assert.notEqual(run('JSON.stringify(polarState.space.position)'),position);assert.equal(run('polarState.space.autopilot'),false);
for(const gate of ['gamePaused=true','spaceChartOpen=true','polarState.space.phase="landed"','polarState.space.warp={to:"cluster-01"}','polarState.space.hull=0']){
  run(gate);const snap=run('JSON.stringify(polarState.space)');click();assert.equal(run('JSON.stringify(polarState.space)'),snap,gate);run('gamePaused=false;spaceChartOpen=false;polarState.space.phase="flight";polarState.space.warp=null;polarState.space.hull=100;');
}
const updates=run('hudUpdates');click(860,320,{button:2});assert.equal(run('hudUpdates'),updates);
handlers.get('pointerdown')({button:0,pointerId:1,clientX:830,clientY:320});handlers.get('pointerup')({button:0,pointerId:1,clientX:860,clientY:320});assert.equal(run('hudUpdates'),updates,'Dragging cannot lock a planet.');
handlers.get('pointerdown')({button:0,pointerId:1,clientX:860,clientY:320});handlers.get('pointercancel')();handlers.get('pointerup')({button:0,pointerId:1,clientX:860,clientY:320});assert.equal(run('hudUpdates'),updates);
// Foreground worlds occlude worlds behind them, including when the rear globe is larger.
run(`b.position=original;polarState.space.position=[0,15000,0];polarState.space.yaw=0;polarState.space.pitch=0;const moon=NVSol.byId.moon,earth=NVSol.byId.earth;moon.position=[0,15000,300];earth.position=[0,15000,600];`);
assert.equal(run('NVSpace.pickWorld(polarState).id'),'moon');assert.equal(run('NVSpace.pickWorld(polarState,1.1,0)'),null);
run('polarState.space.position=[0,0,-1000];earth.position=[0,0,300];moon.position=[1000,0,300];');assert.equal(run('NVSpace.pickWorld(polarState)'),null,'The star blocks a world behind it.');
console.log('Passed click course lock across all system types, camera projection, occlusion, empty sky, flight/modal gates, right-click, drag and pointer cancellation.');
