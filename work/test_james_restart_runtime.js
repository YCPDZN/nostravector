// Exercise the production galaxy HUD with the existing audio/DOM runtime harness.
const fs=require('node:fs');
const source=fs.readFileSync(__dirname+'/test_antarctica_runtime.js','utf8');
const harness=source.slice(0,source.indexOf('run("creatingCharacter=true;'));
const checks=String.raw`
context.$=key=>{const n=element(key);n.firstChild={textContent:''};n.append=()=>{};n.querySelector=s=>context.$(key+' '+s);n.style.setProperty=()=>{};n.toDataURL=()=> 'data:image/png;base64,AA==';n.showModal=()=>n.open=true;n.replaceChildren=()=>{};return n;};
context.document.createElement=()=>context.$('generated-'+elements.size);
for(const f of ['world_flight.js','galaxy_core.js','cluster_core.js','eris_core.js','sol_war_core.js','trade_core.js','construction_core.js','quests_core.js','chapter_restart.js','save_management.js'])run(fs.readFileSync(root+'/'+f,'utf8'));
run('function spaceActive(){return NVSpace.active(polarState);}function populateSolChart(){}function drawSolChart(){}function refreshSolChart(){}function toggleSolChart(){}function spaceInput(){return false;}function missionWaypointTarget(){return null;}const SOL_MAPS={};');
run(fs.readFileSync(root+'/galaxy_game.js','utf8'));run(fs.readFileSync(root+'/trade_game.js','utf8'));
run('let renderedIntroFrames=0;createPolarRenderer=()=>()=>renderedIntroFrames++;');
run("creatingCharacter=true;writeGameSave({...DEFAULT_WANDERER,name:'Restart test'});creatingCharacter=false;savedWanderer=savedGame.wanderer;resetCharacterProgress(savedGame.id,3);startAntarctica();exitPolar();resetCharacterProgress(savedGame.id,1);startAntarctica();");
const initialStored=storage.get('nostravector.saves.v2');
assert.equal(run('polarState.space'),null);assert.equal(run('jamesVoiceIndex'),0);assert.equal(run('polarState.jamesIntroductionDone'),false);assert.equal(element('#jamesDialogue').hidden,false);assert.ok(frames>0);
run('polarTick(1000);polarTick(1050);');assert.ok(run('renderedIntroFrames')>=2);assert.ok(+element('#wakeupShade').style.opacity<1,'The wake-up blackout fades.');
run('pausePolar(true);');const time=run('currentJamesVoice().currentTime');run('polarTick(6000)');assert.equal(run('currentJamesVoice().currentTime'),time);run('pausePolar(false)');
for(let i=0;i<5;i++){
 assert.equal(run('polarState.introIndex'),i);assert.equal(run('jamesVoiceIndex'),i);assert.equal(element('#jamesLine').textContent,run('JAMES_QUOTES['+i+']'));
 const x=run('polarState.x'),z=run('polarState.z');run("polarKeys.add('KeyW');polarTick(6100+polarState.introIndex*100);polarTick(6150+polarState.introIndex*100);polarKeys.clear();");assert.equal(run('polarState.x'),x);assert.equal(run('polarState.z'),z);
 run('advanceJames()');
}
assert.equal(run('polarState.jamesIntroductionDone'),true);assert.equal(element('#jamesDialogue').hidden,true);assert.equal(element('#wakeupShade').style.opacity,'0');assert.equal(run('jamesVoiceIndex'),-1);run('polarKeys.add("KeyW");polarTick(6700);polarTick(6750);');assert.ok(run('polarState.z')>0);assert.equal(storage.get('nostravector.saves.v2'),initialStored,'The intro never autosaves.');
run('exitPolar();resetCharacterProgress(savedGame.id,1);startAntarctica();advanceJames();advanceJames();currentJamesVoice().currentTime=1.5;savePolarWorld(true);exitPolar();continueSavedGame();');assert.equal(run('polarState.introIndex'),2);assert.equal(run('jamesVoiceIndex'),2);assert.equal(run('currentJamesVoice().currentTime'),1.5);run('polarTick(7000);polarTick(7050)');assert.equal(element('#jamesDialogue').hidden,false);
run("exitPolar();creatingCharacter=true;writeGameSave({...DEFAULT_WANDERER,name:'New intro'});creatingCharacter=false;savedWanderer=savedGame.wanderer;startAntarctica();polarTick(8000);polarTick(8050);");assert.equal(run('jamesVoiceIndex'),0);assert.equal(run('polarState.space'),null);
const freshStored=storage.get('nostravector.saves.v2');run('let autoIntroNow=8050;');
for(let i=0;i<5;i++){assert.equal(run('jamesVoiceIndex'),i);run('currentJamesVoice().tick(1000);for(let frame=0;frame<31;frame++)polarTick(autoIntroNow+=50);');}
assert.equal(run('polarState.jamesIntroductionDone'),true);assert.equal(element('#wakeupShade').style.opacity,'0');assert.equal(storage.get('nostravector.saves.v2'),freshStored);
console.log('Passed Chapter 3 to Chapter 1 restart, production galaxy HUD, intro frames, fade, five clips/captions, pause, manual and automatic handoff, mid-line resume and fresh-character intro.');
`;
new Function('require','__dirname',harness+'\n'+checks)(require,__dirname);
