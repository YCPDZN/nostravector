// Exercise the actual boss UI with capture/bubble input and the manual-save UI.
const fs=require('node:fs');
const source=fs.readFileSync(__dirname+'/test_antarctica_runtime.js','utf8');
let harness=source.slice(0,source.indexOf('run("creatingCharacter=true;'));
harness=harness.replace('const elements=new Map(),storage=new Map(),listeners={};',`const elements=new Map(),storage=new Map(),listeners={};
const eventHandlers=new WeakMap();
function addHandler(node,type,callback,capture=false){let map=eventHandlers.get(node);if(!map){map=new Map();eventHandlers.set(node,map);}const list=map.get(type)||[];list.push({callback,capture:typeof capture==='object'?!!capture.capture:!!capture});map.set(type,list);}
function dispatch(node,type,data={}){const event={button:0,clientX:0,clientY:0,pointerId:1,repeat:false,target:{tagName:'CANVAS'},...data,defaultPrevented:false,stopped:false,preventDefault(){this.defaultPrevented=true;},stopImmediatePropagation(){this.stopped=true;}};const list=eventHandlers.get(node)?.get(type)||[];for(const capture of [true,false])for(const handler of list){if(handler.capture!==capture)continue;if(event.stopped)return event;handler.callback(event);}return event;}
`);
harness=harness.replace('addEventListener(){},getContext(kind)','addEventListener(type,callback,capture){addHandler(this,type,callback,capture);},getContext(kind)');
harness=harness.replace('getBoundingClientRect(){return{width:880,height:720};}','getBoundingClientRect(){return{left:0,top:0,width:880,height:720};}');
harness=harness.replace('addEventListener:(type,callback)=>listeners[type]=callback','addEventListener:(type,callback,capture)=>{listeners[type]=callback;addHandler(context.document,type,callback,capture);}');
const checks=String.raw`
context.performance={now:()=>0};
context.$=key=>{const n=element(key);n.firstChild={textContent:''};n.children=n.children||[];n.append=(...children)=>{n.children.push(...children);n.lastElementChild=children.at(-1);};n.prepend=(...children)=>n.children.unshift(...children);n.querySelector=s=>context.$(key+' '+s);n.style.setProperty=()=>{};n.toDataURL=()=> 'data:image/png;base64,AA==';n.showModal=()=>n.open=true;n.replaceChildren=(...children)=>{n.children=children;n.lastElementChild=children.at(-1);};n.setPointerCapture=()=>{};n.requestSubmit=()=>{};n.click=()=>n.onclick?.();return n;};
context.document.createElement=()=>context.$('generated-'+elements.size);
context.$('#worldCanvas');
context.$('#surfaceAtlasCanvas').width=1024;context.$('#surfaceAtlasCanvas').height=512;
for(const f of ['world_flight.js','galaxy_core.js','cluster_core.js','eris_core.js','sol_war_core.js','pontifex_core.js','construction_core.js','quests_core.js'])run(fs.readFileSync(root+'/'+f,'utf8'));
run('let spaceChartOpen=false;function spaceActive(){return NVSpace.active(polarState);}function populateSolChart(){}function drawSolChart(){}function refreshSolChart(){}function toggleSolChart(v){spaceChartOpen=!!v;}function spaceInput(){return false;}function tickSpace(){}function updateSpaceHUD(){}function renderSpaceWorld(){}function ecologyPlayable(){return erisPlayable();}const SOL_MAPS={};');
for(const f of ['world_flight_game.js','eris_game.js','construction_game.js','quests_game.js','clean_hud.js','pontifex_game.js'])run(fs.readFileSync(root+'/'+f,'utf8'));

// A fresh character still has a null ship during James's introduction.
run("creatingCharacter=true;writeGameSave({...DEFAULT_WANDERER,name:'Boss Alpha'});creatingCharacter=false;savedWanderer=savedGame.wanderer;startAntarctica();updatePolarHUD();");
assert.equal(run('polarState.space'),null);assert.equal(run('pontifexCombat.hidden'),true);assert.equal(run('pontifexIntel.hidden'),true);assert.equal(run('pontifexNotice.hidden'),true);
const introStored=storage.get('nostravector.saves.v2');
dispatch(context.document,'keydown',{code:'KeyZ'});
assert.equal(run('NVPontifex.ensure(polarState).generation'),0);assert.equal(storage.get('nostravector.saves.v2'),introStored);

run(" Object.assign(polarState,{jamesIntroductionDone:true,jamesGone:true,africaStarted:true,africaStage:'complete',ferryEscaped:true,bedRested:true,bedBuilt:true,betrayalStage:'complete',dreamDone:true});\n polarState.space=NVSpace.fresh();polarState.space.phase='landed';polarState.space.body='mercury';\n let war=NVSolWar.ensure(polarState);war.stage='war';NVSolWar.ships(polarState);NVSolWar.damage(polarState,0,1e9);\n let boss=NVPontifex.ensure(polarState),near=NVPontifex.local(polarState);polarState.x=near.x;polarState.z=near.z+3;\n let construction=NVConstruction.ensure(polarState);construction.started=true;construction.tools=true;construction.stage=9;\n gamePaused=false;jamesConversation.active=false;$('#inventorySheet').hidden=true;updatePolarHUD();\n const actualStrike=NVPontifex.strike,actualDamage=NVPontifex.damage;let strikes=[],directDamages=0;\n NVPontifex.strike=(s,source)=>{strikes.push(source);return actualStrike(s,source);};NVPontifex.damage=(...args)=>{directDamages++;return actualDamage(...args);};\n");
assert.equal(run('pontifexCombat.hidden'),false);assert.equal(run('pontifexIntel.hidden'),false);assert.equal(element('#pontifexHealth').value,24000);assert.equal(run('boss.track'),false,'A new optional nemesis does not steal the current route.');
const baseline=storage.get('nostravector.saves.v2');
let event=dispatch(context.document,'keydown',{code:'KeyZ'});
assert.equal(event.defaultPrevented,true);assert.equal(event.stopped,true);assert.equal(run('strikes.length'),1);assert.equal(run('strikes[0]'),'player');assert.equal(run('boss.hp'),24000-540);
dispatch(context.document,'keydown',{code:'KeyZ',repeat:true});assert.equal(run('strikes.length'),1,'Keyboard repeats cannot fire again.');
for(const setup of ['gamePaused=true','erisConversation={}','empireOpen=true','constructionOpen=true','questJournalOpen=true',"$('#inventorySheet').hidden=false"]){
 run(setup);dispatch(context.document,'keydown',{code:'KeyZ'});element('#firePontifex').onclick();assert.equal(run('strikes.length'),1,'Modal or paused controls cannot attack: '+setup);
 run('gamePaused=false;erisConversation=null;empireOpen=false;constructionOpen=false;questJournalOpen=false;$("#inventorySheet").hidden=true;factionNaming.hidden=true;');
}
for(const tagName of ['INPUT','TEXTAREA','SELECT'])dispatch(context.document,'keydown',{code:'KeyZ',target:{tagName}});
assert.equal(run('strikes.length'),1,'Typing in a field cannot attack.');

// The existing faction and globe shortcuts remain available.
dispatch(context.document,'keydown',{code:'KeyK'});assert.equal(run('empireOpen'),true);run('toggleEmpire(false);');
dispatch(context.document,'keydown',{code:'KeyH'});assert.equal(run('surfaceAtlasOpen'),true);dispatch(context.document,'keydown',{code:'KeyH'});assert.equal(run('surfaceAtlasOpen'),false);
assert.equal(run('strikes.length'),1);

// A short click hits the projected boss before the resource harvesting handler.
run(" boss.weaponCooldown=0;near=NVPontifex.local(polarState);\n resourcePickView={vp:[.1,0,0,0,0,.1,0,0,0,0,.1,0,0,0,0,1],origin:[near.x,0,near.z],height:()=>0};\n let harvests=0;const actualNodes=NVConstruction.nodes,actualHarvest=NVConstruction.strike;\n NVConstruction.nodes=()=>[{x:near.x+2,z:near.z,kind:'stone',key:'test-resource',name:'Test mineral'}];\n NVConstruction.strike=()=>{harvests++;return{message:'Test harvested',collected:true};};\n");
dispatch(element('#worldCanvas'),'pointerdown',{clientX:440,clientY:310});
assert.equal(run('polarCameraDrag'),true);
event=dispatch(element('#worldCanvas'),'pointerup',{clientX:440,clientY:310});
assert.equal(event.stopped,true);assert.equal(run('strikes.length'),2);assert.equal(run('harvests'),0);assert.equal(run('resourcePointerStart'),null);assert.equal(run('polarCameraDrag'),false,'An intercepted boss click must release camera dragging.');assert.equal(run('polarPointer'),null);
run('boss.weaponCooldown=0;');
dispatch(element('#worldCanvas'),'pointerdown',{clientX:440,clientY:310});dispatch(element('#worldCanvas'),'pointerup',{clientX:460,clientY:310});
assert.equal(run('strikes.length'),2,'Dragging the camera cannot fire.');assert.equal(run('polarCameraDrag'),false);assert.equal(run('harvests'),0);
dispatch(element('#worldCanvas'),'pointerdown',{clientX:528,clientY:330});dispatch(element('#worldCanvas'),'pointerup',{clientX:528,clientY:330});
assert.equal(run('harvests'),1,'Clicking a separate resource still reaches the real harvesting control.');assert.equal(run('strikes.length'),2);
run('NVConstruction.nodes=actualNodes;NVConstruction.strike=actualHarvest;');

// Tracking selects a course and a waypoint; the mandatory Moon lesson wins.
run('polarState.space.phase="flight";polarState.space.target="earth";');element('#trackPontifex').onclick();
assert.equal(run('boss.track'),true);assert.equal(run('polarState.space.target'),run('boss.body'));assert.ok(run('missionWaypointTarget(polarState).label').includes('Pontifex'));assert.equal(run('missionWaypointTarget(polarState).space'),true);
run('construction.stage=0;construction.tools=false;polarState.eris.quests={completed:[]};construction.built=[];');
assert.equal(run('missionWaypointTarget(polarState).label'),'The Moon','Tracking cannot override an unfinished Moon tutorial.');
run('polarState.space.phase="landed";polarState.space.body="moon";');
assert.equal(run('missionWaypointTarget(polarState).label'),'Construction tools');
run('construction.stage=9;construction.tools=true;polarState.space.body=boss.body;polarState.x=near.x;polarState.z=near.z+3;updatePolarHUD();');
assert.ok(run('missionWaypointTarget(polarState).label').includes('Pontifex'));assert.equal(run('missionWaypointTarget(polarState).space'),undefined);
assert.equal(run('directDamages'),0,'The UI uses the range/cooldown checked strike API exclusively.');assert.equal(storage.get('nostravector.saves.v2'),baseline,'Combat, navigation and resource clicks never autosave.');

// Menu exit drops unsaved damage; switching characters cannot reuse its HUD.
run('savePolarWorld(true);let alphaID=savedGame.id;let savedHP=boss.hp;boss.hp-=1000;exitPolar();');
assert.equal(run('pontifexCombat.hidden'),true);assert.equal(run('pontifexNotice.hidden'),true);assert.equal(run('pontifexPointer'),null);
run('continueSavedGame();boss=NVPontifex.ensure(polarState);updatePolarHUD();');assert.equal(run('boss.hp'),run('savedHP'));assert.equal(run('pontifexCombat.hidden'),false);
run("exitPolar();creatingCharacter=true;writeGameSave({...DEFAULT_WANDERER,name:'Boss Beta'});creatingCharacter=false;savedWanderer=savedGame.wanderer;startAntarctica();updatePolarHUD();");
assert.equal(run('polarState.space'),null);assert.equal(run('pontifexCombat.hidden'),true);assert.equal(run('pontifexIntel.hidden'),true);assert.equal(run('NVPontifex.ensure(polarState).alive'),false);
run('exitPolar();switchCharacter(alphaID);continueSavedGame();updatePolarHUD();');assert.equal(run('NVPontifex.ensure(polarState).hp'),run('savedHP'));assert.equal(run('pontifexCombat.hidden'),false);
console.log('Passed production boss UI, null-ship intro, Z/button modal gates, repeat prevention, K/H shortcuts, boss click capture and camera release, camera dragging/resource harvesting, tracking and Moon priority, manual resume and character HUD isolation.');
`;
new Function('require','__dirname',harness+'\n'+checks)(require,__dirname);
