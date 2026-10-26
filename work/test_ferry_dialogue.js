const A=require('./antarctica_core.js'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const s=A.fresh(123);Object.assign(s,{hazardStage:'complete',superBlizzard:true,x:0,z:A.STATION.z});
A.hazardStep(s,299);assert.equal(s.ferryDialoguePending,false,'The first blizzard does not trigger the Africa briefing.');
A.hazardStep(s,1);assert.equal(s.ferryDialoguePending,false);
A.hazardStep(s,300);assert.equal(s.blizzardCycle,1);assert.equal(s.superBlizzard,true);assert.equal(s.ferryDialoguePending,true,'The first recurrence is the second blizzard.');
const pending=A.snapshot(s);assert.deepEqual(A.snapshot(A.restored({antarctica:pending},'pending')),pending);
const legacy=A.restored({antarctica:{hazardStage:'complete',superBlizzard:true,blizzardCycle:2}},'legacy');assert.equal(legacy.ferryDialoguePending,true);
Object.assign(s,{ferryDialogueDone:true,ferryPlanKnown:true,ferryDialoguePending:false});A.hazardStep(s,600);assert.equal(s.ferryDialoguePending,false,'Completed dialogue does not retrigger on later blizzards.');
const elements=new Map();function $(key){if(!elements.has(key))elements.set(key,{textContent:'',hidden:false,focus(){}});return elements.get(key);}
const recordings=[];
const context=vm.createContext({console,Math,JSON,Number,Set,WeakMap,window:{},document:{hidden:false},$: $,gameActive:true,gamePaused:false,betrayalActive:()=>false,polarState:s,
  polarKeys:new Set(),polarAutoWalk:false,polarSprint:false,polarCameraDrag:false,polarPoseSpeed:0,jamesPoseSpeed:0,polarTrail:[],polarCanvas:{focus(){}},
  currentJamesVoice:()=>null,captureJamesVoice(){},stopJamesVoice(){},startJamesVoice(kind,time,index){recordings.push({kind,time,index});},stopHazardNarration(){},updatePolarHUD(){},hazardModalActive:()=>false,beginHazardTutorial(){}});
Object.assign(s,{jamesIntroductionDone:true,car:{driving:true},ferryDialogueActive:false,ferryDialogueDone:false,ferryDialoguePending:true});
vm.runInContext(fs.readFileSync(__dirname+'/antarctica_speech.js','utf8'),context);
const run=code=>vm.runInContext(code,context);
run("beginJamesConversation('ferry');");assert.equal(run('jamesConversation.active'),true,'The briefing can happen while riding in the rover.');
const script=require('./james_ferry_quotes.json');assert.equal(script.length,5);
for(let i=0;i<5;i++){
  assert.equal($('#conversationNumber').textContent,String(i+1).padStart(2,'0')+' / 05');assert.equal($('#conversationLine').textContent,script[i]);
  assert.equal($('#conversationVoiceLabel').textContent,'RECORDED VOICE / JBAA'+(i+1));assert.equal($('#systemJamesVoice').hidden,true);
  if(i===2){const checkpoint=A.snapshot(s);assert.equal(checkpoint.ferryDialogueIndex,2);assert.equal(A.restored({antarctica:checkpoint},'line-three').ferryDialogueIndex,2);}
  run('advanceJamesConversation();');
}
assert.deepEqual(recordings,Array.from({length:5},(_,i)=>({kind:'ferry',time:0,index:26+i})),'Each caption plays its matching JBAA clip.');
assert.equal(s.ferryDialogueDone,true);assert.equal(s.ferryPlanKnown,true);assert.equal(s.ferryDialogueActive,false);
run("beginJamesConversation('ferry');jamesVoiceError=true;");
for(let i=0;i<5;i++)run('tickJamesConversation(60);');
assert.equal(run('jamesConversation.active'),false,'The five lines flow automatically to free roam when playback finishes or captions finish their fallback timing.');
console.log('Passed: second-blizzard trigger, five ordered JBAA recordings, rover conversation, saved line, legacy saves, one-time completion and automatic release after line five.');
