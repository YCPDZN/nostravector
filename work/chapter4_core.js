function chapter5Unlocked(s){const q=s?.eris?.catharsisCoreRoute;return q?.finalStage==='complete'&&q.ending?.stage==='done'&&['good','neutral'].includes(q.ending.route);}
// Story history persists while Chapter 5 restores the original palette.
function chapter5RedMode(s){return chapter5Unlocked(s)&&typeof savedGame!=='undefined'&&savedGame?.chapter5RedMode===true;}
function chapter4VisualMood(s){return !!s&&(chapter5Unlocked(s)?chapter5RedMode(s):chapter4Aftermath(s.eris?.chapter4));}
function chapter4Aftermath(q){return !!q&&(q.flagshipDestroyed===true||['destruction','narration','timeskip','reclaim','awake'].includes(q.stage));}
const NVChapter4=(()=>{
 const STAGES=['waiting','travel','ambush','destruction','narration','timeskip','reclaim','awake'];
 const NARRATION=[
  'They tell us that space is an empty void. A silent, unfeeling canvas where empires rise and fall like dust motes in a beam of light. But they are wrong. Space remembers.',
  'It remembers the heat of the fire when your flagship split in two. It remembers the exact trajectory of your escape pod, launched into the freezing dark by hands that refused to let you burn. For a moment, the Wanderer from Earth... became just another piece of cosmic wreckage drifting among the stars.',
  'You thought the war ended at Mercury. You thought Hawthorne’s defeat bought peace for the Sol System. But peace is a fragile thing, easily shattered by forces we were never meant to understand. The stars grew darker. Cold. Quiet.',
  'Yet, deep in the shadows of Triton, the factories never stopped. In the quiet dark, your governors kept the ledger. They guarded your name. They hid your people. And for seven hundred and thirty nights, they watched a frozen medical pod, waiting for the spark to return.'
 ];
 const LAST_LINE="...and now, it's time to take it back.";
 const fresh=()=>({stage:'waiting',departure:'sol',target:'cluster-01',encounterSystem:'',elapsed:0,line:0,health:100,enemyHealth:2500,strikes:0,shots:0,shot:0,attackCooldown:0,dodge:0,dodgeTime:0,year:2125,flagshipDestroyed:false,stasisDays:0,crewManifest:[],previousShip:'',governorsAdvanced:false,amGrekMet:false,amGrekGiftHeard:false,amGrekGiftStarted:false,amGrekLine:0,amGrekWorld:'',amGrekVoiceTime:0});
 const raw=s=>s?.eris?.chapter4;
 const aftermathState=chapter4Aftermath;
 const aftermath=s=>aftermathState(raw(s));
 const ensure=s=>NVEris.ensure(s).chapter4||(NVEris.ensure(s).chapter4=fresh());
 const started=s=>!!raw(s)&&raw(s).stage!=='waiting';
 const cinematic=s=>!!raw(s)&&['ambush','destruction','narration','timeskip','reclaim'].includes(raw(s).stage);
 const hiddenCrew=s=>raw(s)?.stage==='ambush';
 function restore(r){const q=fresh();if(!r)return q;q.stage=STAGES.includes(r.stage)?r.stage:'waiting';for(const k of ['departure','target','encounterSystem'])if(NVCluster.meta[r[k]])q[k]=r[k];for(const k of ['elapsed','line','health','enemyHealth','strikes','shots','shot','attackCooldown','dodgeTime'])if(Number.isFinite(r[k]))q[k]=Math.max(0,Math.min(k==='health'?100:k==='enemyHealth'?2500:k==='line'?3:1e6,r[k]));q.line=Math.floor(q.line);q.dodge=[-1,0,1].includes(r.dodge)?r.dodge:0;q.year=r.year===2127?2127:2125;q.stasisDays=r.stasisDays===730?730:0;for(const k of ['flagshipDestroyed','governorsAdvanced'])q[k]=r[k]===true;q.crewManifest=Array.isArray(r.crewManifest)?r.crewManifest.filter(v=>typeof v.id==='string'&&typeof v.name==='string').slice(0,100).map(v=>({id:v.id.slice(0,100),name:v.name.slice(0,100)})):[];q.previousShip=typeof r.previousShip==='string'?r.previousShip.slice(0,100):'';q.amGrekVoiceTime=Number.isFinite(r.amGrekVoiceTime)?Math.max(0,Math.min(600,r.amGrekVoiceTime)):0;q.amGrekMet=r.amGrekMet===true;q.amGrekGiftHeard=r.amGrekGiftHeard===true;q.amGrekGiftStarted=r.amGrekGiftStarted===true;q.amGrekLine=Number.isInteger(r.amGrekLine)?Math.max(0,Math.min(4,r.amGrekLine)):0;q.amGrekWorld=typeof r.amGrekWorld==='string'&&NVSol.byId[r.amGrekWorld]?r.amGrekWorld:'';return q;}
 function assign(s){const q=ensure(s);if(q.stage!=='waiting'||NVSiegeOfSol.raw(s)?.stage!=='complete'||!NVGrekEmpire.revealed(s))return false;q.stage='travel';q.departure=NVGalaxy.system(s);q.target=q.departure==='cluster-01'?'cluster-02':'cluster-01';return true;}
 function begin(s){const q=ensure(s),p=s.space;if(q.stage!=='travel'||p?.phase!=='flight'||p.warp||NVGalaxy.system(s)===q.departure||p.hull<=0)return false;q.crewManifest=NVShipInterior.crew(s).map(n=>({id:n.id,name:n.name}));q.previousShip=p.shipId||'starter';q.stage='ambush';q.elapsed=0;q.encounterSystem=NVGalaxy.system(s);q.health=100;q.enemyHealth=2500;q.strikes=0;p.speed=0;p.throttle=0;p.autopilot=false;p.combatActive=false;NVShipInterior.ensure(s).active=false;return true;}
 function fire(s){const q=ensure(s);if(q.stage!=='ambush'||q.attackCooldown>0||q.health<=0)return false;q.attackCooldown=.22;q.shot=.14;q.shots++;q.enemyHealth=Math.max(500,q.enemyHealth-85);return true;}
 function dodge(s,side){const q=ensure(s);if(q.stage!=='ambush'||q.dodgeTime>0)return false;q.dodge=side<0?-1:1;q.dodgeTime=.65;return true;}
 function defeat(s){const q=ensure(s);if(q.stage!=='ambush')return false;q.health=0;q.stage='destruction';q.elapsed=0;q.flagshipDestroyed=true;s.space.hull=0;s.space.speed=0;s.space.throttle=0;s.space.autopilot=false;return true;}
 function next(s){const q=ensure(s);if(q.stage==='narration'){q.elapsed=0;if(q.line<3)q.line++;else{q.stage='timeskip';q.year=2127;q.stasisDays=730;}return true;}if(q.stage==='timeskip'&&q.elapsed>=2){q.stage='reclaim';q.elapsed=0;return true;}if(q.stage==='reclaim')return wake(s);return false;}
 function tick(s,dt){if(!cinematic(s)||!Number.isFinite(dt)||dt<=0)return;const q=ensure(s);dt=Math.min(.1,dt);q.elapsed+=dt;q.attackCooldown=Math.max(0,q.attackCooldown-dt);q.shot=Math.max(0,q.shot-dt);q.dodgeTime=Math.max(0,q.dodgeTime-dt);if(!q.dodgeTime)q.dodge=0;
  if(q.stage==='ambush'){while(q.elapsed>=2+q.strikes*2.7){q.strikes++;q.health=Math.max(0,q.health-(q.dodgeTime>0?12:26));}if(q.health<=0||q.elapsed>=18)defeat(s);}
  else if(q.stage==='destruction'&&q.elapsed>=10){q.stage='narration';q.line=0;q.elapsed=0;}
  else if(q.stage==='timeskip'&&q.elapsed>=6)next(s);
 }
 function wake(s){const q=ensure(s);if(q.stage!=='reclaim')return false;q.stage='awake';q.year=2127;q.stasisDays=730;q.elapsed=0;const p=s.space,b=NVSol.byId.triton;
  Object.assign(p,{system:'sol',body:'triton',target:'triton',phase:'landed',warp:null,position:NVSpace.routeEnd(b),geo:{global:false,lat:0,lon:0,altitude:0},landingX:60,landingZ:-40,landingElevation:0,shipId:'triton-rescue-skiff',driveLevel:0,hull:100,damageFlash:0,combatActive:false,speed:0,throttle:0,autopilot:false,interior:NVShipInterior.fresh()});
  s.x=90;s.z=-90;s.yaw=0;s.cameraYaw=0;s.stamina=100;s.exhausted=false;NVEcology.ensure(s).health=100;if(!p.visited.includes('triton'))p.visited.push('triton');NVGalaxy.ensure(s);if(!q.governorsAdvanced){for(const c of Object.values(NVGovernance.ensure(s).colonies))if(c.governor&&!c.captured)c.age=86400;q.governorsAdvanced=true;}NVSpace.notice(p,'2127 AD / TRITON / THE SPARK RETURNS');NVQuests.update(s);return true;
 }
 function waypoint(s){if(raw(s)?.stage!=='travel')return null;const q=raw(s),p=s.space,label='Chapter 4 · Jump to another star system';return ['landed','off','cockpit'].includes(p.phase)?{x:p.landingX||0,z:p.landingZ||0,label:'Return to ship · Survey beyond Sol'}:{galaxy:true,system:q.target,label};}
 return{STAGES,NARRATION,LAST_LINE,fresh,raw,ensure,started,aftermathState,aftermath,cinematic,hiddenCrew,restore,assign,begin,fire,dodge,defeat,next,tick,wake,waypoint};
})();
const chapter4Restore=NVEris.restore;NVEris.restore=r=>({...chapter4Restore(r),chapter4:NVChapter4.restore(r?.chapter4)});
const chapter4Crew=NVShipInterior.crew;NVShipInterior.crew=s=>NVChapter4.hiddenCrew(s)?[]:chapter4Crew(s);
const chapter4Restored=NVAntarctica.restored;NVAntarctica.restored=(...args)=>{const s=chapter4Restored(...args);if(NVChapter4.raw(s)?.stage==='awake'&&NVChapter4.raw(s).flagshipDestroyed){s.space.shipId='triton-rescue-skiff';s.space.driveLevel=Number(args[0]?.antarctica?.space?.driveLevel)||0;}return s;};
const chapter4Access=NVChapter3Access.chapter;NVChapter3Access.chapter=s=>chapter5Unlocked(s)?5:NVChapter4.started(s)?4:chapter4Access(s);
NVQuests.definitions.push({id:'chapter4-ambush',chapter:4,title:'Space remembers',description:'With Hawthorne defeated, launch and jump to another star system. Investigate the silent contact aboard your ship.',available:s=>NVChapter4.started(s),done:s=>['destruction','narration','timeskip','reclaim','awake'].includes(NVChapter4.raw(s)?.stage)},{id:'chapter4-awakening',chapter:4,title:'Seven hundred and thirty nights',description:'Survive the loss of your flagship and awaken in the hidden medical refuge on Triton.',available:s=>['destruction','narration','timeskip','reclaim','awake'].includes(NVChapter4.raw(s)?.stage),done:s=>NVChapter4.raw(s)?.stage==='awake'});
const chapter4QuestRestore=NVQuests.restore;NVQuests.restore=r=>{const q=chapter4QuestRestore(r);for(const id of ['chapter4-ambush','chapter4-awakening'])if(r?.completed?.includes(id)&&!q.completed.includes(id))q.completed.push(id);return q;};
