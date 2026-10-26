// Unit integration tests with mocked DOM/WebGL; these do not replace visual QA.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=__dirname,custom=fs.readFileSync(root+'/customizer.js','utf8');
const profile=custom.slice(custom.indexOf('const DEFAULT_WANDERER='),custom.indexOf('__SAVED_GAME__'));
const elements=new Map(),storage=new Map(),listeners={};
const mapContext=new Proxy({createImageData:(w,h)=>({data:new Uint8Array(w*h*4)})},{get:(o,k)=>k in o?o[k]:()=>{}});
function element(key){if(!elements.has(key))elements.set(key,{textContent:'',dataset:{},style:{},hidden:false,clientWidth:1280,clientHeight:720,width:0,height:0,inert:false,classList:{toggle(){}},attrs:{},setAttribute(k,v){this.attrs[k]=v;},removeAttribute(k){delete this.attrs[k];},getBoundingClientRect(){return{width:880,height:720};},focus(){},close(){},value:.85,addEventListener(){},getContext(kind){return kind==='2d'?mapContext:gl;}});return elements.get(key);}
let sequence=0,frames=0,matrixCount=0,drawCount=0,bufferCount=0,recordModels=false,recordedModels=[];
function finite(data){assert.ok(Array.from(data).every(Number.isFinite),'Renderer data must contain finite values.');}
const gl=new Proxy({createProgram:()=>({}),createShader:()=>({}),createBuffer:()=>({id:++bufferCount}),createTexture:()=>({}),getShaderParameter:()=>true,getProgramParameter:()=>true,getAttribLocation:(_,n)=>({p:0,n:1}[n]||0),getUniformLocation:(_,n)=>n,getExtension:()=>null,bufferData:(_,data)=>finite(data),bufferSubData:(_,__,data)=>finite(data),uniformMatrix4fv:(name,__,data)=>{if(recordModels&&name==='model')recordedModels.push(Array.from(data));finite(data);assert.equal(data.length,16);matrixCount++;},uniform3fv:(_,data)=>finite(data),drawElements:()=>drawCount++,drawArrays:()=>drawCount++},{get(target,key){if(key in target)return target[key];if(typeof key==='string'&&key===key.toUpperCase())return key;return()=>{};}});
class ImageStub{set src(value){assert.ok(value.startsWith('data:image/jpeg;base64,'));}}
const audioMeta=JSON.parse(fs.readFileSync(root+'/james_audio.json','utf8'));let audioSequence=0,failPlayback=false;
class AudioStub{constructor(source){assert.ok(source.startsWith('data:audio/mpeg;base64,'));this.duration=audioMeta[audioSequence++%audioMeta.length].duration;this.time=0;this.ended=false;this.paused=true;}get currentTime(){return this.time;}set currentTime(t){this.time=t;this.ended=false;}play(){if(failPlayback){this.paused=true;return Promise.reject(Error('Autoplay blocked'));}this.paused=false;return Promise.resolve();}pause(){this.paused=true;}tick(dt){if(this.paused||this.ended)return;this.time+=dt;if(this.time>=this.duration){this.time=this.duration;this.ended=true;this.paused=true;}}}
const context=vm.createContext({console,Date,Math,JSON,Number,Set,Map,Float32Array,Uint16Array,Uint8Array,Audio:AudioStub,Image:ImageStub,devicePixelRatio:1,crypto:{randomUUID:()=>`slot-${++sequence}`},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},$:element,document:{createElement:()=>({getContext:()=>mapContext}),hidden:false,querySelectorAll:()=>[],addEventListener:(type,callback)=>listeners[type]=callback},window:{addEventListener(){}},requestAnimationFrame:()=>++frames,cancelAnimationFrame(){},newGame:element('#newGame'),syncMenuWanderer(){},chime(){},stopNarration(){},earthSource:'data:image/jpeg;base64,AA==',introActive:false,intro:element('#intro'),customActive:false,customScreen:element('#customizer')});
const game=fs.readFileSync(root+'/antarctica_game.js','utf8').replace('__JAMES_PARTS__',fs.readFileSync(root+'/james_parts.json','utf8')).replace('__POLAR_SKY__','AA==').replace('__POLAR_SNOW__','AA==');
const voice=fs.readFileSync(root+'/antarctica_voice.js','utf8').replace('__JAMES_VOICES__',JSON.stringify(audioMeta.map(q=>({...q,source:'data:audio/mpeg;base64,AA=='}))));
const hazardVoice=fs.readFileSync(root+'/antarctica_hazard_voice.js','utf8').replace('__HAZARD_VOICES__',JSON.stringify(JSON.parse(fs.readFileSync(root+'/hazard_audio.json','utf8')).map(q=>({...q,source:'data:audio/mpeg;base64,AA=='}))));
vm.runInContext(fs.readFileSync(root+'/menu_party.js','utf8')+'\n'+profile+'\n'+fs.readFileSync(root+'/saved_game.js','utf8')+'\nlet savedWanderer={...DEFAULT_WANDERER};\n'+fs.readFileSync(root+'/antarctica_core.js','utf8')+'\n'+fs.readFileSync(root+'/antarctica_betrayal_core.js','utf8')+'\n'+fs.readFileSync(root+'/africa_core.js','utf8')+'\n'+fs.readFileSync(root+'/sol_catalog.js','utf8')+'\n'+fs.readFileSync(root+'/planet_landscapes.js','utf8')+'\n'+fs.readFileSync(root+'/menu_location.js','utf8')+'\n'+fs.readFileSync(root+'/space_core.js','utf8')+'\n'+fs.readFileSync(root+'/ecology_core.js','utf8')+'\n'+fs.readFileSync(root+'/antarctica_speech.js','utf8')+'\n'+voice+'\n'+game+'\n'+fs.readFileSync(root+'/antarctica_vehicle.js','utf8')+'\n'+hazardVoice+'\n'+fs.readFileSync(root+'/antarctica_hazards.js','utf8')+'\n'+fs.readFileSync(root+'/antarctica_navigation.js','utf8')+'\n'+fs.readFileSync(root+'/antarctica_bed.js','utf8')+'\n'+fs.readFileSync(root+'/antarctica_expedition.js','utf8')+'\n'+fs.readFileSync(root+'/grek_model.js','utf8')+'\n'+fs.readFileSync(root+'/grek_renderer.js','utf8')+'\n'+fs.readFileSync(root+'/grek_dialogue.js','utf8').replace('__GREK_VOICES__',JSON.stringify(JSON.parse(fs.readFileSync(root+'/grek_audio.json','utf8')).map(q=>({...q,source:'data:audio/mpeg;base64,AA=='}))))+'\n'+fs.readFileSync(root+'/betrayal_recordings.js','utf8').replace('__BETRAYAL_VOICES__',JSON.stringify(JSON.parse(fs.readFileSync(root+'/betrayal_audio.json','utf8')).map(q=>({...q,source:'data:audio/mpeg;base64,AA=='}))))+'\n'+fs.readFileSync(root+'/antarctica_betrayal.js','utf8')+'\n'+fs.readFileSync(root+'/orion_recordings.js','utf8').replace('__ORION_VOICES__',JSON.stringify(JSON.parse(fs.readFileSync(root+'/orion_audio.json','utf8')).map(q=>({...q,source:'data:audio/mpeg;base64,AA=='}))))+'\n'+fs.readFileSync(root+'/africa_game.js','utf8')+'\nfunction createPolarRenderer(){return()=>{};}\nconst rawPolarTick=polarTick;polarTick=function(now){const dt=polarLast?Math.max(0,Math.min((now-polarLast)/1000,.05)):0;for(const a of [...jamesVoiceClips,...grekVoiceClips,...betrayalVoiceClips,...orionVoiceClips])a.tick(dt);rawPolarTick(now);};',context);
const run=code=>vm.runInContext(code,context);
run("creatingCharacter=true;writeGameSave({...DEFAULT_WANDERER,name:'Alpha'});creatingCharacter=false;savedWanderer=savedGame.wanderer;startAntarctica();");
// Automatic transitions must never change either persistent or in-memory saved progress.
const initialSavedProgress=run('JSON.stringify(savedGame.progress)'),initialStoredRoster=storage.get('nostravector.saves.v2');
run("for(let i=0;i<5;i++)advanceJames();polarKeys.add('KeyW');polarTick(1000);for(let i=1;i<=1300;i++)polarTick(1000+i*50);pausePolar(true);pausePolar(false);openFieldMap();$('#closePolarMap').onclick();interactWithCar();switchPolarDriver();polarState.stationFound=true;polarState.car.driving=false;beginJamesConversation();for(let i=0;i<10;i++)advanceJamesConversation();for(let i=0;i<6;i++)advanceHazardLesson();polarState.x=40;polarState.z=1682;polarState.suitHeat=1;stepPolarHazards(3);pausePolar(true);savePolarWorld();exitPolar();");
assert.equal(storage.get('nostravector.saves.v2'),initialStoredRoster,'Timers, pauses, map, checkpoint, driver changes, dialogue, recovery and menu exit must not persist progress.');
assert.equal(run('JSON.stringify(savedGame.progress)'),initialSavedProgress,'Automatic transitions must not silently update the last manual save in memory.');
run('continueSavedGame();');assert.equal(run('polarState.jamesIntroductionDone'),false,'Continue must restore the last manual save, discarding unsaved progress.');
run('advanceJames();');element('#saveWorld').onclick();const explicitSavedProgress=run('JSON.stringify(savedGame.progress)');
assert.notEqual(explicitSavedProgress,initialSavedProgress,'The SAVE GAME control must persist current progress.');
run('advanceJames();pausePolar(true);exitPolar();continueSavedGame();');assert.equal(run('polarState.introIndex'),1,'Continue loads the manual checkpoint instead of subsequent unsaved changes.');
run('polarState.introIndex=0;showJamesQuote();');
const first=run('savedGame.id');assert.equal(element('#antarctica').dataset.mode,'james-introduction');
// The input event gate must prevent movement during all five lines.
for(let i=0;i<5;i++){
  assert.equal(element('#antarctica').dataset.dialogue,String(i+1));
  listeners.keydown({code:'KeyW',repeat:false,preventDefault(){}});
  assert.equal(run('polarKeys.size'),0);
  run('advanceJames();');
}
assert.equal(element('#antarctica').dataset.mode,'free-roam');assert.equal(element('#wakeupShade').style.opacity,'0');assert.equal(element('#expeditionHUD').hidden,false);
run("polarKeys.add('KeyW');for(let i=0;i<200;i++)polarMove(.05);updatePolarHUD();");
assert.ok(Math.abs(run('polarState.z')-14)<.01);assert.ok(run('polarState.james.z')>7);assert.ok(+element('#antarctica').dataset.jamesDistance<5);
run("polarKeys.add('ShiftLeft');for(let i=0;i<600;i++)polarMove(.05);savePolarWorld(true);");
assert.equal(run('polarState.exhausted'),true);assert.ok(run('polarState.stamina')<.01);
const position=run('polarState.z');run('savePolarWorld(true);exitPolar();continueSavedGame();');
assert.equal(run('polarState.z'),position);assert.equal(element('#jamesDialogue').hidden,true);assert.equal(run('polarState.exhausted'),true);
// A resumed loop starts with dt=0. It must not replay the wake-up blackout.
for(let cycle=0;cycle<3;cycle++){
  if(cycle)run('savePolarWorld(true);exitPolar();continueSavedGame();');
  const resumedPosition=run('polarState.z');
  run('polarTick(2000);');
  assert.equal(element('#wakeupShade').style.opacity,'0','Continue must keep the blackout transparent on its first frame.');
  run('polarTick(2016);polarTick(2032);');
  assert.equal(element('#wakeupShade').style.opacity,'0','Continue must remain visible on later frames.');
  assert.equal(run('polarState.z'),resumedPosition);
  assert.equal(element('#jamesDialogue').hidden,true);
}
run('pausePolar(true);');const clock=run('polarState.playTime');run('polarTick(1000);polarTick(1500);');assert.equal(run('polarState.playTime'),clock);let blockedButton=false;listeners.keydown({code:'Enter',repeat:false,preventDefault(){blockedButton=true;}});assert.equal(blockedButton,false,'Paused buttons must retain native keyboard activation.');run('pausePolar(false);');
run("polarState.x=0;polarState.z=1679.99;polarState.yaw=0;polarState.cameraYaw=0;polarKeys.clear();polarKeys.add('KeyW');polarMove(.05);savePolarWorld(true);");
assert.equal(run('polarState.stationFound'),true);assert.equal(run('savedGame.progress.checkpoint'),'antarctica-station');
run('savePolarWorld(true);exitPolar();');const alpha=run('JSON.stringify(savedGame.progress)');
run("creatingCharacter=true;writeGameSave({...DEFAULT_WANDERER,name:'Beta'});creatingCharacter=false;savedWanderer=savedGame.wanderer;startAntarctica();");
assert.equal(run('polarState.z'),0);assert.equal(run('polarState.jamesIntroductionDone'),false);assert.equal(run('polarState.stationFound'),false);assert.notEqual(run('polarState.seed'),run('characterSaves[0].progress.antarctica.seed'));
run('savePolarWorld(true);exitPolar();switchCharacter('+JSON.stringify(first)+');continueSavedGame();');
assert.equal(run('JSON.stringify(savedGame.progress)'),alpha);assert.equal(run('polarState.stationFound'),true);
// The follow-up is timed from free-roam play, survives saves, and keeps control.
run("savePolarWorld(true);exitPolar();creatingCharacter=true;writeGameSave({...DEFAULT_WANDERER,name:'Gamma'});creatingCharacter=false;savedWanderer=savedGame.wanderer;startAntarctica();");
assert.equal(element('#jamesCarDialogue').hidden,true);
assert.equal(run('polarState.playTime'),0);
run('for(let i=0;i<5;i++)advanceJames();polarTick(1000);for(let i=1;i<=1199;i++)polarTick(1000+i*50);');
assert.equal(run('polarState.jamesCarQuoteShown'),false);
run('pausePolar(true);polarTick(100000);');
assert.equal(run('polarState.jamesCarQuoteShown'),false,'Paused time must not trigger the follow-up.');
run('savePolarWorld(true);exitPolar();continueSavedGame();polarTick(200000);polarTick(200050);');
assert.equal(run('polarState.jamesCarQuoteShown'),true);
assert.equal(element('#jamesCarDialogue').hidden,false);
assert.equal(run('jamesVoiceIndex'),5,'The car idea uses JBIMPATIENT.');
assert.ok(run('polarState.car'),'The car unlocks with the recorded suggestion.');
assert.equal(element('#jamesCarLine').textContent,'I do have a car we can use.');
assert.equal(element('#antarctica').dataset.mode,'free-roam');
run("savePolarWorld(true);");assert.equal(run('savedGame.progress.antarctica.jamesCarQuoteShown'),true);
run('savePolarWorld(true);exitPolar();continueSavedGame();polarTick(300000);');
assert.equal(element('#jamesCarDialogue').hidden,false,'An unfinished subtitle should resume.');
run("polarKeys.add('KeyW');for(let i=1;i<=200;i++)polarTick(300000+i*50);");
assert.ok(run('polarState.z')>10,'Players retain movement during the subtitle.');
assert.equal(element('#jamesCarDialogue').hidden,true);
// Natural intro playback waits for recorded clips, with pause and seek on Continue.
run("savePolarWorld(true);exitPolar();creatingCharacter=true;writeGameSave({...DEFAULT_WANDERER,name:'Delta'});creatingCharacter=false;savedWanderer=savedGame.wanderer;startAntarctica();polarTick(500000);for(let i=1;i<=60;i++)polarTick(500000+i*50);");
assert.equal(run('polarState.introIndex'),0);assert.equal(run('jamesVoiceIndex'),0);
const voiceTime=run('currentJamesVoice().currentTime');run('pausePolar(true);polarTick(505000);');
assert.equal(run('currentJamesVoice().currentTime'),voiceTime);assert.equal(run('currentJamesVoice().paused'),true);
run('savePolarWorld(true);exitPolar();continueSavedGame();');assert.ok(Math.abs(run('currentJamesVoice().currentTime')-voiceTime)<.001);
run('polarTick(600000);for(let i=1;i<=900;i++)polarTick(600000+i*50);');
assert.equal(run('polarState.jamesIntroductionDone'),true);assert.equal(element('#jamesDialogue').hidden,true);
run('polarState.jamesCarQuoteShown=true;NVAntarctica.unlockCar(polarState);interactWithCar();');
assert.equal(run('polarState.car.driving'),true);assert.equal(element('#antarctica').dataset.vehicle,'driving');
run('NVAntarctica.carStep(polarState,120);savePolarWorld(true);pausePolar(true);polarTick(700000);');
assert.equal(run('polarState.car.elapsed'),120,'Paused trips must not advance.');
run('savePolarWorld(true);exitPolar();continueSavedGame();polarTick(800000);');
assert.equal(run('polarState.car.elapsed'),120);assert.equal(element('#wakeupShade').style.opacity,'0');
run('NVAntarctica.carStep(polarState,180);savePolarWorld(true);updatePolarHUD();');
assert.equal(run('polarState.car.arrived'),true);assert.equal(run('polarState.stationFound'),true);
assert.equal(run('savedGame.progress.checkpoint'),'antarctica-station');
assert.equal(element('#antarctica').dataset.vehicle,'arrived');
// Exercise manual driving through the actual UI handlers and save/continue flow.
run("savePolarWorld(true);exitPolar();creatingCharacter=true;writeGameSave({...DEFAULT_WANDERER,name:'Driver'});creatingCharacter=false;savedWanderer=savedGame.wanderer;startAntarctica();for(let i=0;i<5;i++)advanceJames();polarState.jamesCarQuoteShown=true;NVAntarctica.unlockCar(polarState);interactWithCar();");
listeners.keydown({code:'KeyX',repeat:false,preventDefault(){}});
assert.equal(run('polarState.car.driver'),'player');assert.equal(element('#switchCarDriver').textContent,'LET JAMES DRIVE / X');assert.equal(element('#vehicleControls').hidden,false);
listeners.keydown({code:'KeyW',repeat:false,preventDefault(){}});
run('for(let i=0;i<200;i++)drivePolarCar(.05);updatePolarHUD();savePolarWorld(true);');
assert.equal(element('#vehicleSpeed').textContent,'200');assert.equal(element('#jamesStatus').textContent,'PASSENGER / WITH YOU');
const manualPosition=run('JSON.stringify({x:polarState.car.x,z:polarState.car.z,speed:polarState.car.speed})');
run('savePolarWorld(true);exitPolar();continueSavedGame();polarTick(900000);');
assert.equal(run('polarState.car.driver'),'player');assert.equal(run('JSON.stringify({x:polarState.car.x,z:polarState.car.z,speed:polarState.car.speed})'),manualPosition);assert.equal(element('#wakeupShade').style.opacity,'0');
let brakeDefault=false;listeners.keydown({code:'Space',target:{tagName:'CANVAS'},repeat:false,preventDefault(){brakeDefault=true;}});assert.equal(brakeDefault,true);run('for(let i=0;i<50;i++)drivePolarCar(.05);');assert.equal(run('polarState.car.speed'),0);
listeners.keyup({code:'Space'});listeners.keydown({code:'KeyX',repeat:false,preventDefault(){}});assert.equal(run('polarState.car.driver'),'james');assert.equal(element('#vehicleControls').hidden,true);run("savePolarWorld(true);");assert.equal(run('savedGame.progress.antarctica.car.driver'),'james');
run('savePolarWorld(true);exitPolar();continueSavedGame();polarTick(400000);polarTick(400050);');
assert.equal(element('#jamesCarDialogue').hidden,true,'The follow-up must not repeat after loading.');
run('savePolarWorld(true);exitPolar();switchCharacter('+JSON.stringify(first)+');continueSavedGame();');
assert.equal(run('polarState.jamesCarQuoteShown'),false,'Each Wanderer keeps separate dialogue progress.');
assert.equal(element('#jamesCarDialogue').hidden,true);
// Station dialogue freezes movement, saves the current line, and only triggers once.
run('polarTick(1000000);polarTick(1000050);');
assert.equal(run('jamesConversation.active'),true);assert.equal(element('#antarctica').dataset.mode,'james-conversation');
assert.equal(element('#conversationNumber').textContent,'01 / 10');
assert.equal(run('jamesVoiceIndex'),6);assert.equal(run('jamesVoiceKind'),'station');assert.equal(element('#systemJamesVoice').hidden,true);
const conversationPosition=run('JSON.stringify({x:polarState.x,z:polarState.z})');
listeners.keydown({code:'KeyW',repeat:false,preventDefault(){}});run('polarTick(1000100);');
assert.equal(run('JSON.stringify({x:polarState.x,z:polarState.z})'),conversationPosition);assert.equal(run('polarKeys.size'),0);
for(let i=0;i<3;i++)listeners.keydown({code:'Enter',repeat:false,preventDefault(){}});
assert.equal(run('polarState.stationDialogueIndex'),3);
assert.equal(run('jamesVoiceIndex'),9);run('currentJamesVoice().currentTime=2.1;captureJamesVoice();');
run('pausePolar(true);');const conversationClock=run('jamesConversation.clock');run('polarTick(1000200);');assert.equal(run('jamesConversation.clock'),conversationClock);
run('savePolarWorld(true);exitPolar();continueSavedGame();');assert.equal(run('jamesConversation.active'),true);assert.equal(element('#conversationNumber').textContent,'04 / 10');assert.ok(Math.abs(run('currentJamesVoice().currentTime')-2.1)<.01);assert.equal(element('#wakeupShade').style.opacity,'0');
run('for(let i=0;i<7;i++)advanceJamesConversation();polarTick(1100000);polarTick(1100050);');
assert.equal(run('polarState.stationDialogueDone'),true);assert.equal(run('jamesConversation.active'),false);assert.equal(element('#antarctica').dataset.mode,'hazard-tutorial');assert.equal(run('polarState.hazardStage'),'warning');assert.equal(element('#hazardTitle').textContent,'WEATHER WARNING! SUPER BLIZZARD INCOMING!');run('for(let i=0;i<6;i++)advanceHazardLesson();');assert.equal(element('#antarctica').dataset.mode,'free-roam');assert.equal(run('polarState.hazardStage'),'complete');
run("savePolarWorld(true);");assert.equal(run('savedGame.progress.antarctica.stationDialogueDone'),true);
run('savePolarWorld(true);exitPolar();continueSavedGame();polarTick(1200000);polarTick(1200050);');assert.equal(run('jamesConversation.active'),false,'Completed station dialogue must not repeat automatically.');
run('polarState.james.x=polarState.x+2;polarState.james.z=polarState.z;talkToJames();');assert.equal(run('jamesConversation.kind'),'revisit');assert.equal(element('#conversationNumber').textContent,'01 / 10');
assert.equal(run('jamesVoiceIndex'),6);assert.equal(run('jamesVoiceKind'),'station');assert.equal(element('#systemJamesVoice').hidden,true);
run('for(let i=0;i<10;i++)advanceJamesConversation();polarState.stationFound=false;talkToJames();');assert.equal(run('jamesVoiceKind'),'talk');assert.equal(run('jamesVoiceIndex'),4,'Travel conversations replay the supplied reassurance recording.');
run('finishJamesConversation();');
// Weather expiry triggers the new ten-line briefing without saving progress.
const beforeBriefing=run('JSON.stringify(savedGame.progress)');
run("polarState=NVAntarctica.fresh(123);Object.assign(polarState,{x:0,z:1698,jamesIntroductionDone:true,stationFound:true,stationDialogueDone:true,hazardStage:'complete',superBlizzard:true,stormRemaining:.05,jamesCarQuoteShown:true});polarState.james={x:1.7,z:1699.5,yaw:Math.PI};stepPolarHazards(.05);polarLast=0;polarTick(1300000);polarTick(1300050);");
assert.equal(run('jamesConversation.kind'),'supplies');assert.equal(element('#conversationNumber').textContent,'01 / 10');assert.match(element('#conversationLine').textContent,/gathering some supplies/);assert.equal(run('jamesVoiceIndex'),16);assert.equal(element('#conversationVoiceLabel').textContent,'RECORDED VOICE / JBW');assert.equal(run('JSON.stringify(savedGame.progress)'),beforeBriefing);
run('advanceJamesConversation();advanceJamesConversation();advanceJamesConversation();currentJamesVoice().currentTime=2.3;pausePolar(true);savePolarWorld(true);pausePolar(false);');const savedSupplyProgress=run('JSON.stringify(savedGame.progress)');run('advanceJamesConversation();exitPolar();continueSavedGame();');assert.equal(element('#conversationNumber').textContent,'04 / 10');assert.equal(run('jamesConversation.kind'),'supplies');assert.equal(run('jamesVoiceIndex'),19);assert.equal(element('#conversationVoiceLabel').textContent,'RECORDED VOICE / JBW3');assert.equal(run('currentJamesVoice().currentTime'),2.3,'A manual save resumes the correct supply recording and offset.');assert.equal(run('JSON.stringify(savedGame.progress)'),savedSupplyProgress);
run('for(let i=0;i<7;i++)advanceJamesConversation();');assert.equal(run('polarState.suppliesPlanKnown'),true);assert.equal(run('jamesConversation.active'),false);assert.match(element('#worldObjective').textContent,/coastal depot/);
run('polarState.x=NVAntarctica.DEPOT.x;polarState.z=NVAntarctica.DEPOT.z;');element('#collectSupplies').onclick();assert.equal(run('polarState.suppliesCollected'),true);assert.equal(element('#supplyInventory').hidden,false);assert.match(element('#worldObjective').textContent,/Return to the station/);assert.equal(run('JSON.stringify(savedGame.progress)'),savedSupplyProgress,'Gathering supplies must remain unsaved until SAVE GAME.');
run('stepPolarHazards(300);updatePolarHUD();');assert.equal(run('polarState.superBlizzard'),true);assert.equal(run('hazardVoiceIndex'),0);assert.equal(element('#stormAlert').hidden,false);assert.match(element('#weatherStatus').textContent,/SUPER BLIZZARD/);
const pausedStormTime=run('polarState.stormRemaining');run('pausePolar(true);polarTick(1400000);polarTick(1400050);');assert.equal(run('polarState.stormRemaining'),pausedStormTime);run('pausePolar(false);');
// The second blizzard waits for the suit warning, then delivers five ferry-plan lines.
const beforeFerry=run('JSON.stringify(savedGame.progress)');
run("jamesConversation.active=false;polarState=NVAntarctica.fresh(123);Object.assign(polarState,{x:0,z:1698,james:{x:1.7,z:1699.5,yaw:Math.PI},jamesIntroductionDone:true,stationFound:true,stationDialogueDone:true,hazardStage:'complete',superBlizzard:false,nextBlizzardRemaining:.02,jamesCarQuoteShown:true,supplyDialogueDone:true,suppliesPlanKnown:true});gamePaused=false;polarLast=0;polarTick(1490000);polarTick(1490050);polarTick(1490100);");
assert.equal(run('polarState.blizzardCycle'),1);assert.equal(run('polarState.ferryDialoguePending'),true);assert.equal(run('jamesConversation.active'),false,'James waits while the suit warning plays.');
run('currentHazardVoice().ended=true;polarTick(1490150);');
assert.equal(run('jamesConversation.kind'),'ferry');assert.equal(element('#conversationNumber').textContent,'01 / 05');assert.match(element('#conversationLine').textContent,/I want out of Antarctica/);assert.equal(run('jamesVoiceIndex'),26);assert.equal(run('JSON.stringify(savedGame.progress)'),beforeFerry,'The new story trigger must not autosave.');
const frozenFerryEarth=run('polarState.earthTime'),frozenFerryStorm=run('polarState.stormRemaining');run('polarTick(1490200);pausePolar(true);polarTick(1490250);pausePolar(false);');assert.equal(run('polarState.earthTime'),frozenFerryEarth);assert.equal(run('polarState.stormRemaining'),frozenFerryStorm);
run('advanceJamesConversation();advanceJamesConversation();currentJamesVoice().currentTime=2.1;savePolarWorld(true);advanceJamesConversation();exitPolar();continueSavedGame();');assert.equal(run('jamesConversation.kind'),'ferry');assert.equal(element('#conversationNumber').textContent,'03 / 05');assert.equal(run('polarState.ferryDialogueIndex'),2);assert.equal(run('jamesVoiceIndex'),28);assert.equal(run('currentJamesVoice().currentTime'),2.1);
run('advanceJamesConversation();advanceJamesConversation();advanceJamesConversation();savePolarWorld(true);');assert.equal(run('polarState.ferryPlanKnown'),true);assert.equal(run('polarState.ferryDialogueDone'),true);assert.match(element('#worldObjective').textContent,/Construct a bed/);
assert.equal(run('polarDestination(polarState)===NVAntarctica.STATION'),true,'The shelter objective must point to the station during the storm.');
run('stepPolarHazards(600);');assert.equal(run('polarState.ferryDialoguePending'),false,'Later storms do not repeat the completed departure dialogue.');

run("beginJamesConversation('ferry');for(let i=0;i<5;i++){currentJamesVoice().currentTime=currentJamesVoice().duration;currentJamesVoice().ended=true;tickJamesConversation(1.2);}");
assert.equal(run('jamesConversation.active'),false,'The fifth completed JBAA recording automatically returns control.');assert.match(element('#worldObjective').textContent,/Construct a bed/);
// Bed actions, pause and manual checkpoints must never introduce an autosave or a permanent blackout.
run('polarState.x=NVAntarctica.BED.x+1.25;polarState.z=NVAntarctica.BED.z;polarState.earthTime=1500;updatePolarHUD();');
const bedStored=storage.get('nostravector.saves.v2'),bedSaved=run('JSON.stringify(savedGame.progress)');
assert.equal(element('#bedWorkshop').hidden,false);element('#bedAction').onclick();assert.equal(run('polarState.bedMaterialsCollected'),true);
element('#bedAction').onclick();assert.equal(run('polarState.bedBuilt'),true);assert.match(element('#worldObjective').textContent,/Sleep in your bed/);
element('#bedAction').onclick();assert.equal(run('polarState.bedSleeping'),true);assert.equal(element('#bedSleepOverlay').hidden,false);
assert.equal(run('polarAutoWalk'),false);listeners.keydown({code:'KeyW',repeat:false,preventDefault(){}});assert.equal(run('polarKeys.size'),0);
run('tickBedSleep(3);pausePolar(true);polarTick(1490300);');assert.equal(run('polarState.bedSleepProgress'),3,'Pause freezes rest.');
assert.equal(storage.get('nostravector.saves.v2'),bedStored);assert.equal(run('JSON.stringify(savedGame.progress)'),bedSaved,'Crafting and resting remain unsaved until manual Save Game.');
element('#saveWorld').onclick();let bedManual=storage.get('nostravector.saves.v2');run('exitPolar();continueSavedGame();');
assert.equal(run('polarState.bedSleeping'),true);assert.equal(run('polarState.bedSleepProgress'),3);assert.equal(element('#dreamScene').hidden,false,'Continue resumes a manually saved dream before dawn.');
run('currentGrekVoice().currentTime=2.25;pausePolar(true);');element('#saveWorld').onclick();bedManual=storage.get('nostravector.saves.v2');assert.equal(run('savedGame.progress.antarctica.dreamVoiceTime'),2.25,'Manual Save Game captures the Grek recording position.');run('exitPolar();continueSavedGame();');assert.equal(run('currentGrekVoice().currentTime'),2.25,'Continue seeks to the exact saved Grek recording position.');
assert.equal(run('polarState.dreamActive'),true);assert.equal(element('#dreamScene').hidden,false);assert.equal(run('polarState.bedRested'),false);listeners.keydown({code:'Enter',repeat:false,preventDefault(){}});assert.equal(run('polarState.dreamActive'),true,'The warning cannot be dismissed before its reading window.');run('pausePolar(true);polarTick(1490400);');assert.equal(run('polarState.dreamTime'),0,'Pause freezes the dream.');run('pausePolar(false);NVAntarctica.dreamStep(polarState,4);');listeners.keydown({code:'Enter',repeat:false,preventDefault(){}});assert.equal(run('polarState.dreamIndex'),1,'Enter advances one of the five lines.');run('for(let i=0;i<4;i++){NVAntarctica.dreamStep(polarState,4,false);advanceGrekLine();}');assert.equal(run('polarState.dreamDone'),true,'Dawn waits for all five lines.');run('tickBedSleep(5);updatePolarHUD();');assert.equal(run('polarState.bedRested'),true);assert.equal(element('#bedSleepOverlay').hidden,true);assert.equal(element('#wakeupShade').style.opacity,'0');assert.equal(element('#antarctica').dataset.mode,'free-roam');assert.equal(run('polarState.earthTime'),1800);
assert.equal(storage.get('nostravector.saves.v2'),bedManual,'Waking does not autosave.');
run('savePolarWorld(true);exitPolar();continueSavedGame();');assert.equal(element('#bedSleepOverlay').hidden,true);assert.equal(run('polarState.bedBuilt'),true);assert.equal(run('polarState.bedRested'),true);

// The dawn objective and actual inventory actions use the active character’s manual checkpoint.
assert.match(element('#worldObjective').textContent,/Find the ferry/);assert.equal(element('#openInventory').hidden,false);assert.equal(run('polarDestination(polarState)===NVAntarctica.FERRY'),true);assert.equal(element('#stationDistance').textContent,'5.00 KM');
const beforeCraft=storage.get('nostravector.saves.v2');run('openInventory();polarState.stamina=40;useInventoryItem("ration");craftInventoryItem("heatPack");salvageInventory();');assert.equal(run('gamePaused'),true);assert.equal(run('polarState.inventory.heatPack'),1);assert.equal(run('polarState.stamina'),75);assert.equal(storage.get('nostravector.saves.v2'),beforeCraft,'Inventory use, crafting and salvage never autosave.');
run('closeInventory();savePolarWorld(true);');const savedInventory=run('JSON.stringify(polarState.inventory)');run('polarState.inventory.ration=0;exitPolar();continueSavedGame();');assert.equal(run('JSON.stringify(polarState.inventory)'),savedInventory);assert.equal(element('#dreamScene').hidden,true);assert.match(element('#worldObjective').textContent,/Find the ferry/);
run('polarState.x=NVAntarctica.FERRY.x;polarState.z=NVAntarctica.FERRY.z;checkFerryArrival();updatePolarHUD();');assert.equal(run('polarState.ferryFound'),true);assert.equal(element('#ferryArrival').hidden,true);assert.equal(element('#ferryBetrayal').hidden,false);assert.equal(run('polarState.betrayalStage'),'dialogue');
const betrayalStored=storage.get('nostravector.saves.v2');run('openInventory();');assert.equal(element('#inventorySheet').hidden,true,'Inventory cannot interrupt the confrontation.');listeners.keydown({code:'KeyW',repeat:false,preventDefault(){}});assert.equal(run('polarKeys.size'),0,'The confrontation holds player movement.');
for(let i=0;i<15;i++){assert.equal(run('polarState.betrayalIndex'),i);run('polarState.betrayalLineTime=2;');listeners.keydown({code:'Enter',repeat:false,preventDefault(){}});}assert.equal(run('polarState.betrayalStage'),'action');assert.equal(storage.get('nostravector.saves.v2'),betrayalStored,'The fifteen paragraphs do not autosave.');
run('tickFerryBetrayal(7.25);pausePolar(true);');const betrayalTime=run('polarState.betrayalTime');run('polarTick(1491000);');assert.equal(run('polarState.betrayalTime'),betrayalTime,'Pause freezes the action.');element('#saveWorld').onclick();const actionStored=storage.get('nostravector.saves.v2');run('exitPolar();continueSavedGame();');assert.equal(run('polarState.betrayalTime'),7.25);assert.equal(run('polarState.betrayalStage'),'action');run('tickFerryBetrayal(19.75);updatePolarHUD();');assert.equal(run('polarState.ferryEscaped'),true);assert.equal(run('polarState.jamesGone'),true);assert.equal(element('#talkJames').hidden,true);assert.equal(element('#ferryBetrayal').hidden,true);assert.equal(storage.get('nostravector.saves.v2'),actionStored,'Escaping does not autosave.');run('tickFerryVoyage(10);savePolarWorld(true);exitPolar();continueSavedGame();');assert.equal(run('polarState.ferryVoyageTime'),10);assert.equal(run('polarState.betrayalStage'),'complete');assert.match(element('#worldObjective').textContent,/Africa/);run('talkToJames();');assert.equal(run('jamesConversation.active'),false,'James cannot follow or talk after falling into the sea.');

// Crossing, tutorial completion, Africa choices and recruitment never autosave.
const beforeAfrica=storage.get('nostravector.saves.v2');run('tickAfricaJourney(3);pausePolar(true);');const crossingTime=run('polarState.africaTime');run('polarTick(1492000);');assert.equal(run('polarState.africaTime'),crossingTime);element('#saveWorld').onclick();run('exitPolar();continueSavedGame();');assert.equal(run('polarState.africaTime'),3);assert.equal(run('polarState.africaStage'),'voyage');const crossingStored=storage.get('nostravector.saves.v2');run('tickAfricaJourney(4);updatePolarHUD();');assert.equal(run('polarState.africaStarted'),true);assert.equal(element('#africaTransition').dataset.stage,'title');run('tickAfricaJourney(6);updatePolarHUD();');assert.equal(element('#africaTransition').dataset.stage,'briefing');assert.equal(storage.get('nostravector.saves.v2'),crossingStored,'Arrival and the title never autosave.');run('openInventory();');assert.equal(element('#inventorySheet').hidden,true);listeners.keydown({code:'KeyW',repeat:false,preventDefault(){}});assert.equal(run('polarKeys.size'),0);
element('#chooseFriend').onclick();assert.equal(run('polarState.friendQuest'),'accepted');assert.equal(run('polarState.africaStage'),'complete');assert.equal(element('#africaTransition').hidden,true);assert.equal(element('#polarRegion').textContent,'AFRICA');assert.match(element('#worldObjective').textContent,/Orion Mascar/);assert.equal(storage.get('nostravector.saves.v2'),crossingStored,'Quest choices never autosave.');run('polarState.x=NVAfrica.CAMP.x;polarState.z=NVAfrica.CAMP.z;updatePolarHUD();');assert.equal(element('#recruitFriend').hidden,false);element('#recruitFriend').onclick();assert.equal(run('polarState.friendDialogueActive'),true);const dialogueStored=storage.get('nostravector.saves.v2');listeners.keydown({code:'KeyW',repeat:false,preventDefault(){}});assert.equal(run('polarKeys.size'),0);run('tickAfricaJourney(1);savePolarWorld(true);exitPolar();continueSavedGame();');assert.equal(run('polarState.friendDialogueActive'),true);assert.equal(run('polarState.friendDialogueIndex'),0);const savedOrion=storage.get('nostravector.saves.v2');for(let i=0;i<5;i++){assert.equal(run('polarState.friendDialogueIndex'),i);run('tickAfricaJourney(1);advanceOrionDialogue();');}assert.equal(storage.get('nostravector.saves.v2'),savedOrion,'Orion conversation and recruitment do not autosave.');assert.equal(run('polarState.friendQuest'),'recruited');run('polarKeys.add("KeyW");tickAfricaRoam(4);polarKeys.clear();savePolarWorld(true);');assert.equal(run('savedGame.progress.chapter'),2);assert.equal(run('savedGame.progress.checkpoint'),'africa-coast');const friendSave=run('JSON.stringify(polarState.friend)');run('polarState.friendQuest="available";exitPolar();continueSavedGame();');assert.equal(run('polarState.friendQuest'),'recruited');assert.equal(run('JSON.stringify(polarState.friend)'),friendSave);assert.equal(element('#companionName').textContent,'ORION MASCAR');assert.equal(run('polarState.jamesGone'),true);run('openFieldMap();');assert.equal(run('gamePaused'),true);assert.equal(element('#earthLocation').textContent,'YOU / AFRICA · SOUTHERN COAST');run('selectPolarMap("local");');assert.equal(element('#polarMapTitle').textContent,'AFRICA / COASTAL SECTOR');run("$('#closePolarMap').onclick();openInventory();");assert.equal(element('#inventorySheet').hidden,false);run('closeInventory();');

// The Earth clock advances once in free roam, including either driver, and never autosaves.
run("jamesConversation.active=false;polarState=NVAntarctica.fresh(99);Object.assign(polarState,{jamesIntroductionDone:true,stationFound:true,stationDialogueDone:true,hazardStage:'complete',supplyDialogueDone:true,suppliesPlanKnown:true,jamesCarQuoteShown:true,earthTime:1199.98});gamePaused=false;polarLast=0;polarTick(1500000);polarTick(1500050);");
assert.ok(Math.abs(run('polarState.earthTime')-1200.03)<.001);assert.equal(element('#antarctica').dataset.dayPhase,'NIGHT');assert.match(element('#earthPhaseRemaining').textContent,/SUNRISE IN 10:00/);
const nightClock=run('polarState.earthTime');run('pausePolar(true);polarTick(1500100);pausePolar(false);openFieldMap();polarTick(1500150);');assert.equal(run('polarState.earthTime'),nightClock);
run("$('#closePolarMap').onclick();jamesConversation.active=true;polarTick(1500200);jamesConversation.active=false;document.hidden=true;polarTick(1500250);document.hidden=false;");assert.equal(run('polarState.earthTime'),nightClock,'Map, pause, dialogue and hidden tabs freeze the Earth clock.');
run('savePolarWorld(true);polarState.earthTime+=123;exitPolar();continueSavedGame();');assert.equal(run('polarState.earthTime'),nightClock,'Continue restores the manually saved time, discarding unsaved clock changes.');
const savedClockProgress=run('JSON.stringify(savedGame.progress)');
run('NVAntarctica.unlockCar(polarState);NVAntarctica.boardCar(polarState);polarLast=0;polarTick(1600000);polarTick(1600050);NVAntarctica.switchCarDriver(polarState);polarTick(1600100);');
assert.ok(Math.abs(run('polarState.earthTime')-nightClock-.1)<.001,'Rover travel advances the clock once per frame with either driver.');assert.equal(run('JSON.stringify(savedGame.progress)'),savedClockProgress,'Day/night progression must not update saved data.');

// Execute actual renderer paths against a WebGL mock to catch frame exceptions,
// non-finite transforms, missing mesh data, and chunk resource churn.
const viewer=fs.readFileSync(root+'/../outputs/NOSTRAVECTOR_3D_Viewer.html','utf8');
const parts=JSON.parse(viewer.match(/const parts=(.*?);\r?\nconst canvas/s)[1]);
context.parts=parts;
vm.runInContext(custom.slice(custom.indexOf('const originalColors='),custom.indexOf('function syncMenuWanderer()')),context);
vm.runInContext(fs.readFileSync(root+'/africa_renderer.js','utf8').replace('__ORION_PARTS__',fs.readFileSync(root+'/orion_parts.json','utf8')).replace('__AFRICA_SAND__','AA==')+'\n'+fs.readFileSync(root+'/space_surface.js','utf8')+'\n'+fs.readFileSync(root+'/render_math.js','utf8')+'\n'+fs.readFileSync(root+'/ecology_renderer.js','utf8')+'\n'+fs.readFileSync(root+'/ground_player_rig.js','utf8')+'\n'+fs.readFileSync(root+'/antarctica_renderer.js','utf8').replace('__SURFACE_SKY__',fs.readFileSync(root+'/surface_sky.glsl','utf8')).replace('__PLANET_MATERIAL__',fs.readFileSync(root+'/planet_material.glsl','utf8'))+'\npolarRenderer=createPolarRenderer();',context);
run('polarState=NVAntarctica.fresh(77);polarRenderer(polarState,0,{playerPhase:0,jamesPhase:0,playerSpeed:0,jamesSpeed:0});');
run('polarState.jamesIntroductionDone=true;for(let i=0;i<65;i++)polarRenderer(polarState,i/20,{playerPhase:i*.14,jamesPhase:i*.16,playerSpeed:1.4,jamesSpeed:2.8});');
assert.equal(element('#antarctica').dataset.terrainChunks,'25');
run('polarState.x=350;polarState.z=1698;polarRenderer(polarState,20,{playerPhase:2,jamesPhase:3,playerSpeed:2.8,jamesSpeed:2.8});polarState.x=0;polarRenderer(polarState,21,{playerPhase:2,jamesPhase:3,playerSpeed:0,jamesSpeed:0});');
run('polarState=NVAntarctica.fresh(88);polarState.jamesIntroductionDone=true;polarState.jamesCarQuoteShown=true;NVAntarctica.unlockCar(polarState);polarRenderer(polarState,22,{playerPhase:0,jamesPhase:0,playerSpeed:0,jamesSpeed:0});NVAntarctica.boardCar(polarState);NVAntarctica.carStep(polarState,150);polarRenderer(polarState,23,{playerPhase:0,jamesPhase:0,playerSpeed:0,jamesSpeed:0});');
run('NVAntarctica.switchCarDriver(polarState);polarState.car.speed=NVAntarctica.CAR_MAX_SPEED;polarRenderer(polarState,24,{playerPhase:0,jamesPhase:0,playerSpeed:0,jamesSpeed:0});');
run('jamesLipPose={jaw:.8,width:.7,round:1,teeth:1};polarRenderer(polarState,25,{playerPhase:0,jamesPhase:0,playerSpeed:0,jamesSpeed:0});NVAntarctica.leaveCar(polarState);jamesConversation.active=true;polarRenderer(polarState,26,{playerPhase:0,jamesPhase:0,playerSpeed:0,jamesSpeed:0});jamesConversation.active=false;');
run('polarState.superBlizzard=true;polarRenderer(polarState,27,{playerPhase:0,jamesPhase:0,playerSpeed:0,jamesSpeed:0});polarState.x=0;polarState.z=1698;polarRenderer(polarState,28,{playerPhase:0,jamesPhase:0,playerSpeed:0,jamesSpeed:0});');
run('polarState.x=25;polarState.z=1670;polarState.superBlizzard=false;for(const clock of [0,600,1190,1200,1500,1799,1800]){polarState.earthTime=clock;polarRenderer(polarState,29,{playerPhase:0,jamesPhase:0,playerSpeed:0,jamesSpeed:0});}');
run('polarState.x=NVAntarctica.BED.x+1.25;polarState.z=NVAntarctica.BED.z;polarState.bedBuilt=true;polarRenderer(polarState,30,{playerPhase:0,jamesPhase:0,playerSpeed:0,jamesSpeed:0});polarState.bedSleeping=true;polarRenderer(polarState,31,{playerPhase:0,jamesPhase:0,playerSpeed:0,jamesSpeed:0});');
run('polarState.bedSleeping=false;polarState.x=NVAntarctica.FERRY.x;polarState.z=NVAntarctica.FERRY.z-30;polarState.earthTime=300;polarRenderer(polarState,32,{playerPhase:0,jamesPhase:0,playerSpeed:0,jamesSpeed:0});');
run('Object.assign(polarState,{bedRested:true,betrayalStage:"action"});for(const t of [0,3.18,5.4,7.8,8.7,13,23,27]){polarState.betrayalTime=t;const pose=NVBetrayal.pose(polarState);polarState.x=pose.player.x;polarState.z=pose.player.z;polarRenderer(polarState,40+t,{playerPhase:0,jamesPhase:0,playerSpeed:0,jamesSpeed:0});}polarState.betrayalStage="complete";polarState.ferryEscaped=true;polarState.jamesGone=true;polarRenderer(polarState,70,{playerPhase:3,jamesPhase:0,playerSpeed:1.4,jamesSpeed:0});');
assert.ok(matrixCount>1000);assert.ok(drawCount>1000);
// Autoplay failures expose an explicit recovery control without skipping lines.


run('polarState=NVAntarctica.fresh(123);Object.assign(polarState,{bedBuilt:true,bedRested:true,jamesIntroductionDone:true,betrayalStage:"complete",ferryEscaped:true,jamesGone:true});NVAfrica.arrive(polarState);polarState.africaStage="complete";for(const z of [0,180,848]){polarState.z=z;polarRenderer(polarState,50,{playerPhase:3,jamesPhase:1,playerSpeed:1.4,jamesSpeed:0});}polarState.friendQuest="recruited";polarRenderer(polarState,55,{playerPhase:4,jamesPhase:3,playerSpeed:2.8,jamesSpeed:2.8});');

vm.runInContext(fs.readFileSync(root+'/world_flight.js','utf8'),context);
// Space controller uses the same single frame loop and explicit save path.
vm.runInContext(fs.readFileSync(root+'/planet_map.js','utf8')+'\n'+fs.readFileSync(root+'/space_game.js','utf8'),context);
const maps=Object.fromEntries(['mercury','venus','earth','mars','jupiter','saturn','uranus','neptune','moon'].map(id=>[id,'data:image/jpeg;base64,AA==']));
const geo=Object.fromEntries(['mercury','jupiter','saturn'].map(id=>[id,JSON.parse(fs.readFileSync(root+'/sol-assets/'+id+'-mesh.json','utf8'))]));
vm.runInContext(fs.readFileSync(root+'/space_renderer.js','utf8').replace('__SOL_MAPS__',JSON.stringify(maps)).replace('__SOL_GEOMETRY__',JSON.stringify(geo)),context);
vm.runInContext(fs.readFileSync(root+'/world_flight_game.js','utf8'),context);
run("polarState=NVAntarctica.fresh(91);Object.assign(polarState,{jamesIntroductionDone:true,stationFound:true,stationDialogueDone:true,hazardStage:'complete',bedBuilt:true,bedRested:true,dreamDone:true,betrayalStage:'complete',ferryEscaped:true,jamesGone:true});NVAfrica.arrive(polarState);polarState.africaStage='complete';polarState.friendQuest='recruited';polarState.spaceshipFound=true;polarState.friendDialogueDone=true;polarState.x=NVAfrica.SHIP.x;polarState.z=NVAfrica.SHIP.z-10;gameActive=true;gamePaused=false;");
const beforeSol=storage.get('nostravector.saves.v2');
run('boardingSpaceship();launchSpaceship();NVWorldFlight.toOrbit(polarState);polarLast=0;polarTick(1800000);for(let i=1;i<=400;i++)polarTick(1800000+i*50);');
assert.equal(run('polarState.space.phase'),'flight');assert.equal(run('polarState.space.crew'),true);assert.equal(storage.get('nostravector.saves.v2'),beforeSol,'Boarding and launch cannot autosave.');
run('savePolarWorld(true);');const solManual=storage.get('nostravector.saves.v2');
run("polarState.space.body='mars';NVSpace.touchDown(polarState);tickSpace(.05);exitPolar();continueSavedGame();");
assert.equal(run('polarState.space.phase'),'flight');assert.equal(run('polarState.space.body'),'earth');assert.equal(run('polarState.space.crew'),true);assert.equal(storage.get('nostravector.saves.v2'),solManual,'Landing and menu exit cannot autosave.');
for(const phase of ['cockpit','launch','flight','descent','landed','ascent','disabled','atmosphere']){
 run(`polarState.space.phase='${phase}';polarState.space.body='charon';polarState.space.elapsed=3.5;polarState.space.hull=74;savePolarWorld(true);exitPolar();continueSavedGame();polarLast=0;polarTick(1900000);`);
 assert.equal(run('polarState.space.phase'),phase);assert.equal(run('polarState.space.body'),'charon');assert.equal(element('#wakeupShade').style.opacity,'0');assert.equal(element('#worldError').textContent,'');
}
run("gamePaused=false;polarState.space.phase='landed';for(const id of ['mars','mercury','venus','io','europa','titan','triton','pluto','miranda','jupiter','saturn','uranus','neptune','charon']){polarState.space.body=id;NVSpace.touchDown(polarState);polarRenderer(polarState,80,{playerPhase:1,jamesPhase:2,playerSpeed:1.4,jamesSpeed:1.4});}polarState.space.body='saturn';NVSpace.orbit(polarState);renderSpaceWorld(polarState,88,{playerPhase:0,jamesPhase:0,playerSpeed:0,jamesSpeed:0});");
assert.equal(element('#antarctica').dataset.spaceRendered,'flight');
run("gamePaused=false;for(const id of ['titan','europa','enceladus']){polarState.space.body=id;NVSpace.touchDown(polarState);if(id!=='titan'){polarState.x=20;polarState.z=-12;NVEcology.toggleOcean(polarState);}NVEcology.step(polarState,.1);polarRenderer(polarState,90,{playerPhase:0,jamesPhase:0,playerSpeed:0,jamesSpeed:0});}");
assert.ok(+element('#antarctica').dataset.faunaCount>0);assert.ok(+element('#antarctica').dataset.floraCount>0);

run("polarState.space.body='earth';polarState.space.phase='atmosphere';Object.assign(polarState.space.geo,{lat:51.4,lon:12.7,global:true});NVWorldFlight.touchdown(polarState);savePolarWorld(true);exitPolar();continueSavedGame();polarLast=0;polarTick(2000000);");assert.equal(run('polarState.space.phase'),'landed');assert.equal(run('polarState.space.geo.lat'),51.4);assert.ok(Math.abs(run('polarState.space.geo.lon')-12.7)<1e-8);assert.equal(run('polarState.space.crew'),true);assert.equal(element('#worldError').textContent,'');

// The production renderer must upload small local transforms at distant globe sites.
run("polarState.space.body='mars';polarState.space.phase='atmosphere';Object.assign(polarState.space.geo,{lat:-34.5,lon:121.25,global:true});NVWorldFlight.touchdown(polarState);polarState.z-=25;");
const distantCoordinates=run('JSON.stringify(NVAntarctica.snapshot(polarState))');recordModels=true;recordedModels=[];
run("polarRenderer(polarState,92,{playerPhase:2.3,jamesPhase:2.7,playerSpeed:2.8,jamesSpeed:2.8});");recordModels=false;
assert.ok(recordedModels.length>150,'Exercise both detailed characters and streamed terrain.');
assert.ok(recordedModels.every(m=>Math.abs(m[12])<450&&Math.abs(m[14])<450),'GPU model positions must stay local, including terrain, player and Orion.');
assert.equal(run('JSON.stringify(NVAntarctica.snapshot(polarState))'),distantCoordinates,'Drawing must never rebase saved coordinates.');
console.log('Passed: production character and terrain transforms remain local at a distant Mars landing; rendering leaves manual save coordinates intact.');
console.log('Passed: space frame loop, all save phases, Orion crew retention, manual-only rollback, real ground/flight renderer paths and no black screen on Continue.');

(async()=>{failPlayback=true;run("startJamesVoice('intro');");await Promise.resolve();await Promise.resolve();assert.equal(element('#enableJamesVoice').hidden,false);failPlayback=false;run('playJamesVoice();');await Promise.resolve();assert.equal(element('#enableJamesVoice').hidden,true);console.log('Passed: manual-only saves, unsaved rollback, intro audio timing, pause/seek, autoplay recovery, timed car voice, boarding, saved five-minute trips, black-screen regression, independent saves, and mocked renderer paths.');})().catch(e=>{console.error(e);process.exitCode=1;});
