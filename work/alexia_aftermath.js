// The sisters confront one another in the actual Eris courtyard after Alexia falls.
let alexiaAftermathSuspending=false;
var NVAlexiaAftermath=(()=>{
 const LINES=[
  ['ALEXIA ERISCONOS','NO! DO NOT LOOK AT ME LIKE THAT, VISHARA! NOT YOU! NOT AFTER EVERYTHING I DID TO ESCAPE THAT LOOK!'],
  ['ALEXIA ERISCONOS','I HAD THE THRONE! I HAD THE FLEETS! FOR ONCE, THEY SPOKE MY NAME WITHOUT ASKING WHERE MY SISTER WAS! AND NOW YOU HAVE COME TO TAKE EVEN THAT FROM ME!'],
  ['ALEXIA ERISCONOS','HAWTHORNE PROMISED ME I WOULD NEVER HAVE TO STAND IN YOUR SHADOW AGAIN! I GAVE HIM OUR WORLDS! I GAVE HIM EVERYTHING, AND HE LEFT ME HERE TO LOSE IT ALONE!'],
  ['ALEXIA ERISCONOS','SAY SOMETHING! SCREAM AT ME! TELL ME YOU HATE ME! I CANNOT BEAR YOU STANDING THERE AS THOUGH I AM ALREADY NOTHING TO YOU!'],
  ['ALEXIA ERISCONOS','I AM YOUR SISTER! YOU CANNOT JUST CUT ME OUT OF YOUR LIFE! PLEASE, VISHARA! PLEASE! DO NOT LET THIS BE ALL THAT IS LEFT OF ME!'],
  ['VISHARA ERISCONOS','YOU SOLD OUR PEOPLE TO HAWTHORNE, YOU SELFISH BITCH! YOU TURNED OUR HOME INTO HIS PRISON AND EXPECT ME TO COMFORT YOU BECAUSE YOU LOST YOUR THRONE? I DISOWN YOU, ALEXIA! YOU ARE NO SISTER OF MINE! GUARDS, TAKE HER AWAY! GET OUT OF MY SIGHT!'],
  ['VISHARA ERISCONOS','DO NOT DARE ASK ME TO REMEMBER THAT WE ARE FAMILY! OUR PEOPLE HAD FAMILIES TOO! THE GUARDS WHO REFUSED YOUR ORDERS! THE PRISONERS WHO NEVER CAME HOME! DID YOU REMEMBER THEM WHEN YOU HANDED HAWTHORNE THE KEYS?'],
  ['VISHARA ERISCONOS','I WOULD HAVE LISTENED TO YOUR ANGER! I WOULD HAVE FACED WHAT I DID WRONG! BUT YOU DID NOT COME TO ME AS A SISTER! YOU CAME WITH A BEAM AT MY BACK AND AN EMPIRE READY TO PUT CHAINS AROUND OUR WORLD!'],
  ['VISHARA ERISCONOS','YOU WILL LIVE, ALEXIA! YOU WILL SIT IN YOUR CELL WHILE THE PEOPLE YOU BETRAYED REBUILD WHAT YOU HELPED DESTROY! THERE WILL BE NO THRONE, NO PARDON, AND NO HAWTHORNE COMING TO SAVE YOU!'],
  ['VISHARA ERISCONOS','TAKE HER OUT OF THIS COURT! I WILL NOT HEAR ANOTHER EXCUSE! WANDERER, ERIS WILL STAND WITH YOU AGAIN. NOW GO TO MERCURY, AND MAKE SURE HAWTHORNE NEVER DOES THIS TO ANOTHER WORLD!']
 ];
 const ensure=s=>NVEris.ensure(s).alexiaAftermath||(NVEris.ensure(s).alexiaAftermath={stage:'waiting',line:0,voiceLine:0,voiceTime:0});
 const restore=r=>({stage:['active','done'].includes(r?.stage)?r.stage:'waiting',line:Math.max(0,Math.min(LINES.length-1,Math.floor(Number(r?.line)||0))),voiceLine:Math.max(0,Math.min(LINES.length-1,Math.floor(Number(r?.voiceLine??r?.line)||0))),voiceTime:Math.max(0,Math.min(180,Number(r?.voiceTime)||0))});
 const pending=s=>s?.eris?.alexiaAftermath?.stage==='active';
 const viewing=()=>erisConversation?.scene==='alexia-aftermath';
 const pose=kind=>kind==='alexia'?{x:9,z:67,yaw:Math.PI,name:'Alexia Erisconos',kind:'alexia',aftermath:true,speed:0,phase:0}:{x:9,z:63.5,yaw:0,name:'Vishara Erisconos',kind:'queen'};
 function begin(s){Object.assign(ensure(s),{stage:'active',line:0,voiceLine:0,voiceTime:0});NVAlexiaBossVoice.stop();}
 function open(){if(alexiaAftermathSuspending||!gameActive||!polarState||gamePaused||erisConversation||!pending(polarState)||polarState.space?.body!=='eris'||polarState.space?.phase!=='landed')return;const q=ensure(polarState);erisConversation={scene:'alexia-aftermath',npc:pose(q.line>=5?'queen':'alexia'),lines:LINES.map(r=>r[1]),index:q.line};polarScreen.dataset.erisConversation='true';polarKeys.clear();polarAutoWalk=false;pausePolar(true);$('#worldPauseSheet').hidden=true;$('#erisDialogue').hidden=false;showErisLine();$('#nextErisLine').focus();}
 function next(){if(!viewing())return;const q=ensure(polarState);if(q.line<LINES.length-1){q.line++;erisConversation.index=q.line;showErisLine();return;}q.stage='done';NVSiegeOfSol.ensure(polarState).alexiaImprisoned=true;NVQuests.update(polarState);leaveErisDialogue();NVSpace.notice(polarState.space,'ALEXIA DISOWNED / ESCORTED TO IMPRISONMENT · NEXT: CONFRONT HAWTHORNE ON MERCURY.');updatePolarHUD();}
 return{LINES,ensure,restore,pending,viewing,pose,begin,open,next};
})();
const alexiaAfterRestore=NVEris.restore;NVEris.restore=r=>({...alexiaAfterRestore(r),alexiaAftermath:NVAlexiaAftermath.restore(r?.alexiaAftermath)});
const alexiaAfterDefeat=NVAlexiaGate.defeat;NVAlexiaGate.defeat=s=>{alexiaAfterDefeat(s);NVAlexiaAftermath.begin(s);};
const alexiaBeforeAfterPending=NVAlexiaGate.pending;NVAlexiaGate.pending=s=>alexiaBeforeAfterPending(s)||NVAlexiaAftermath.pending(s);
alexiaMission.done=s=>(s.eris?.leaderBosses?.alexia?.stage==='defeated'&&!NVAlexiaAftermath.pending(s))||NVSiegeOfSol.raw(s)?.confronted===true;
const alexiaAfterCourtVoice=startCourtVoice;startCourtVoice=()=>{if(NVAlexiaAftermath.viewing()){stopCourtVoice();$('#retryCourtVoice').hidden=true;$('#courtVoiceStatus').textContent='CAPTIONS / AFTER THE BATTLE';return;}return alexiaAfterCourtVoice();};
const alexiaAfterShow=showErisLine;showErisLine=()=>{if(NVAlexiaAftermath.viewing()){const q=NVAlexiaAftermath.ensure(polarState);erisConversation.index=q.line;erisConversation.npc=NVAlexiaAftermath.pose(q.line>=5?'queen':'alexia');}alexiaAfterShow();if(NVAlexiaAftermath.viewing()){$('#erisSpeakerRole').textContent=NVAlexiaAftermath.ensure(polarState).line>=5?'VISHARA / THE SISTERS’ RECKONING':'ALEXIA / THE SISTERS’ RECKONING';$('#nextErisLine').textContent=NVAlexiaAftermath.ensure(polarState).line===NVAlexiaAftermath.LINES.length-1?'CONTINUE TO MERCURY / ENTER':'NEXT / ENTER';}};
const alexiaAfterNext=$('#nextErisLine').onclick;$('#nextErisLine').onclick=()=>NVAlexiaAftermath.viewing()?NVAlexiaAftermath.next():alexiaAfterNext();
const alexiaAfterLeave=leaveErisDialogue;leaveErisDialogue=()=>{const suspend=NVAlexiaAftermath.viewing()&&NVAlexiaAftermath.pending(polarState);if(suspend)alexiaAftermathSuspending=true;try{alexiaAfterLeave();}finally{alexiaAftermathSuspending=false;}if(suspend){pausePolar(true);$('#worldPauseSheet').hidden=false;}};$('#leaveErisDialogue').onclick=leaveErisDialogue;
// Render both sisters with the existing court models. Alexia faces Vishara; the camera
// switches naturally to the current speaker through the normal planetary dialogue view.
const alexiaAfterFamily=NVErisFamily.npcs;NVErisFamily.npcs=s=>NVAlexiaAftermath.viewing()&&s===polarState?[...alexiaAfterFamily(s).filter(n=>n.kind!=='alexia'),NVAlexiaAftermath.pose('alexia')]:alexiaAfterFamily(s);
const alexiaAfterQueen=NVEris.npc;NVEris.npc=s=>NVAlexiaAftermath.viewing()&&s===polarState?NVAlexiaAftermath.pose('queen'):alexiaAfterQueen(s);
const alexiaAfterHUD=updatePolarHUD;updatePolarHUD=()=>{alexiaAfterHUD();if(!gameActive||!polarState)return;if(NVAlexiaBossVoice.context()||NVAlexiaAftermath.pending(polarState))alexiaSpeech.hidden=true;NVAlexiaAftermath.open();};

const alexiaAfterLip=courtRecordedLipPose;courtRecordedLipPose=kind=>{if(!NVAlexiaAftermath.viewing())return alexiaAfterLip(kind);const c=erisConversation,closed={jaw:0,width:1,round:0,teeth:0};if(document.hidden||c.npc.kind!==kind)return closed;const elapsed=Math.max(0,(Date.now()-c.lineStarted)/1000),text=c.lines[c.index],duration=Math.max(3,text.length/14);return elapsed>=duration?closed:calculateJamesViseme(text,elapsed/duration,.35+.2*Math.sin(elapsed*19));};
