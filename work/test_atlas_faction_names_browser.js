const assert=require('node:assert/strict'),path=require('node:path'),{pathToFileURL}=require('node:url');
const {chromium}=require('C:/Users/HOME/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{const b=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--mute-audio']});try{
 const p=await b.newPage({viewport:{width:1440,height:1000}}),errors=[];p.on('pageerror',e=>errors.push(e.stack));await p.addInitScript(()=>{requestAnimationFrame=()=>0;setInterval=()=>0;});await p.goto(pathToFileURL(path.resolve('outputs/NOSTRAVECTOR_Main_Menu.html')).href,{waitUntil:'domcontentloaded',timeout:180000});assert.deepEqual(errors,[]);
 const info=await p.evaluate(()=>{
  creatingCharacter=true;writeGameSave({...DEFAULT_WANDERER,name:'Atlas faction QA'});creatingCharacter=false;savedGame.progress=chapterRestartProgress(savedGame,31,{orion:true,nyrexia:true,james:'spare'});startAntarctica();const s=polarState;
  const sys=NVGalaxy.systems.find(v=>NVCustomCrew.eligible(s,v.id)&&NVCluster.bodyLists[v.id].some(b=>!b.giant)),body=NVCluster.bodyLists[sys.id].find(b=>!b.giant),npc=NVCustomCrew.create(s,{name:'Governor Iona',species:NVSpecies.preset('avian')}).npc;
  NVGalacticDiplomacy.ensure(s).owners[body.id]='CUSTOM';s.eris.playerFaction.claims.push(body.id);NVGovernance.ensure(s).colonies[body.id]={body:body.id,system:sys.id,x:22,z:66,lat:0,lon:0,landingX:0,landingZ:0,governor:npc.id,extraGovernors:[],age:0,exposure:0,captured:''};NVGovernance.ensure(s).roles[npc.id]='governor';
  const r=NVPlanetEmpires.declare(s,body.id,'Iona Protectorate');if(!r.ok)throw Error(r.text);
  Object.assign(s.space,{system:sys.id,body:body.id,target:body.id,phase:'flight',landingX:0,landingZ:0,geo:{global:true,lat:0,lon:0,altitude:0,heading:0,look:0},warp:null,position:NVSpace.routeEnd(body)});NVShipInterior.ensure(s).active=false;gamePaused=false;populateSolChart();toggleSolChart(true);return{body:body.id,faction:r.faction};
 });
 const storage=await p.evaluate(()=>JSON.stringify({...localStorage}));
 assert((await p.locator('#solChartCategory').textContent()).includes('Iona Protectorate'));assert((await p.locator('.sol-destination[data-id="'+info.body+'"] small').textContent()).includes('Iona Protectorate'));assert.equal(await p.locator('#galacticTreatyAtlas strong').textContent(),'Iona Protectorate');
 const inspect=async()=>p.evaluate(()=>{
  const s=polarState,sites=NVSurfaceNavigation.sites(s).filter(q=>q.id==='base:'+s.space.body),text=[];
  const capture=(id,draw)=>{const c=document.querySelector(id).getContext('2d'),original=c.fillText;c.fillText=function(value,...args){text.push(String(value));return original.call(this,value,...args);};try{draw();}finally{c.fillText=original;}};
  toggleSolChart(false);s.space.phase='atmosphere';s.space.geo.altitude=1000;toggleSurfaceAtlas(true);capture('#surfaceAtlasCanvas',drawSurfaceAtlas);
  const buttons=[...document.querySelectorAll('[data-navigation-site="base:'+s.space.body+'"]')].map(e=>e.textContent),surface=text.slice();text.length=0;
  toggleSurfaceAtlas(false);s.space.phase='landed';s.space.geo.altitude=0;s.x=90;s.z=-90;capture('#planetMapCanvas',updatePlanetMap);updatePolarHUD();
  return{sites:sites.map(q=>q.label),buttons,surface,minimap:text,options:[...document.querySelector('#surfaceNavDestination').options].map(q=>q.textContent)};
 });
 const check=(r,name)=>{for(const field of ['sites','buttons','surface','minimap','options']){assert(r[field].some(text=>text.toLowerCase().includes(name.toLowerCase())),field+': '+JSON.stringify(r[field]));assert(!r[field].some(text=>/PLANET_\d+|FACTION 1/i.test(text)),field+' leaked an internal ID');}};
 check(await inspect(),'Iona Protectorate');assert.equal(await p.evaluate(()=>JSON.stringify({...localStorage})),storage);
 await p.evaluate(f=>{const s=polarState;if(!NVFactionAdministration.rename(s,f,'Iona Realm').ok)throw Error('Rename failed');refreshSolChart();},info.faction);check(await inspect(),'Iona Realm');assert((await p.locator('#solChartCategory').textContent()).includes('Iona Realm'));
 // A saved planet empire keeps its atlas name after the whole game is reloaded.
 await p.evaluate(()=>{savePolarWorld(true);exitPolar();});await p.reload({waitUntil:'domcontentloaded',timeout:180000});await p.evaluate(()=>{startAntarctica();gamePaused=false;populateSolChart();toggleSolChart(true);});assert((await p.locator('#solChartCategory').textContent()).includes('Iona Realm'));check(await inspect(),'Iona Realm');
 // Existing uplifted empires use their current name, even if an older registry row remains.
 await p.evaluate(()=>{const s=polarState,sys=NVGalaxy.systems.find(v=>NVCustomCrew.eligible(s,v.id)),n=NVCustomCrew.create(s,{name:'Envoy Sera',species:NVSpecies.preset('avian')}).npc,r=NVCustomCrew.uplift(s,n.id,sys.id,{factionName:'Old Assembly',headOfState:'Sera',headOfGovernment:'Sera'});if(!r.ok)throw Error(r.text);NVCustomCrew.setGovernment(s,n.id,{factionName:'New Assembly',headOfState:'Sera',headOfGovernment:'Sera'});const body=NVCustomCrew.capital(n);Object.assign(s.space,{system:sys.id,body:body.id,target:body.id,phase:'flight',warp:null});populateSolChart();refreshSolChart();});assert((await p.locator('#solChartCategory').textContent()).includes('New Assembly'));check(await inspect(),'New Assembly');assert.deepEqual(errors,[]);
 console.log('Passed faction names in atlas details/world lists/treaty boxes, drawn surface and minimap markers, navigation choices, live renames, cold save reload and existing uplifted empires; label reads do not write saves.');
 }finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
