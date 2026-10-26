// Empire state is part of the character snapshot. Nothing in this module writes saves.

const NVEris=(()=>{

  const INTERVAL=1800,CONQUEST=['haumea','makemake','sedna'],HOME=['eris','dysnomia'],CYCLE=720;

  const CITADEL={x:0,z:70},EARTH={x:32,z:NVAntarctica.STATION.z+36};

  const fresh=()=>({clock:0,conquestInterval:INTERVAL,campaignIndex:0,playerFaction:{name:"",claims:[],allies:["HUMAN","ERISIAN"]},conquered:[],travel:0,cameo:{seen:false,flee:false,boarded:false,done:false,x:EARTH.x,z:EARTH.z,yaw:Math.PI,time:0},bases:[],notice:'',noticeTime:0});

  const finite=(n,d=0,max=1e8)=>Number.isFinite(n)?Math.max(0,Math.min(max,n)):d;

  function restore(raw){const e=fresh();if(!raw||typeof raw!=='object')return e;let count=0;while(count<CONQUEST.length&&Array.isArray(raw.conquered)&&raw.conquered.includes(CONQUEST[count]))count++;e.conquered=Number.isInteger(raw.campaignIndex)?CONQUEST.slice(0,Math.max(0,Math.min(CONQUEST.length,raw.campaignIndex))).filter(id=>raw.conquered?.includes(id)):CONQUEST.slice(0,count);count=Math.max(e.conquered.length,Math.min(CONQUEST.length,Math.floor(finite(raw.campaignIndex))));e.campaignIndex=count;e.playerFaction={name:typeof raw.playerFaction?.name==='string'?raw.playerFaction.name.trim().slice(0,40):'',claims:Array.isArray(raw.playerFaction?.claims)?[...new Set(raw.playerFaction.claims.filter(id=>NVSol.byId[id]))]:[],allies:['HUMAN','ERISIAN']};e.clock=count===CONQUEST.length?INTERVAL*count:Math.max(INTERVAL*count,finite(raw.clock*(INTERVAL/(Number.isFinite(raw.conquestInterval)&&raw.conquestInterval>0?raw.conquestInterval:1800)),0,INTERVAL*(count+1)-.001));e.travel=finite(raw.travel)%CYCLE;

    if(typeof NVErisFamily!=='undefined')e.nyrexia=NVErisFamily.restore(raw.nyrexia);const c=raw.cameo;if(c&&typeof c==='object'){e.cameo={seen:!!c.seen,flee:!!c.flee,boarded:!!c.boarded,done:!!c.done,x:Number.isFinite(c.x)?Math.max(-10000,Math.min(10000,c.x)):EARTH.x,z:Number.isFinite(c.z)?Math.max(-10000,Math.min(10000,c.z)):EARTH.z,yaw:Number.isFinite(c.yaw)?c.yaw:Math.PI,time:finite(c.time,0,60)};}

    if(Array.isArray(raw.bases))e.bases=raw.bases.slice(0,32).filter(b=>NVSol.byId[b.body]&&Number.isFinite(b.x)&&Number.isFinite(b.z)&&Math.abs(b.x)<=180000&&Math.abs(b.z)<=90000).map(b=>({body:b.body,x:b.x,z:b.z}));return e;

  }

  function ensure(s){return s.eris||(s.eris=fresh());}

  function snapshot(s){return JSON.parse(JSON.stringify(ensure(s)));}

  function faction(s,id){if(ensure(s).playerFaction?.claims.includes(id))return 'CUSTOM';if(NVSol.byId[id]?.system==='janira-proxima')return 'CHOMPY';if(id==='earth')return 'HUMAN';return HOME.includes(id)||ensure(s).conquered.includes(id)?'ERISIAN':'UNCLAIMED';}

  function sandbox(s){return !!s.africaStarted&&s.africaStage==='complete'&&!!s.space&&(s.space.phase!=='off'||s.space.time>0||s.space.visited?.length>1);}

  function route(s){if(typeof NVSolWar!=='undefined'){const w=NVSolWar.ensure(s);if(NVSolWar.active(w))return{at:w.visharaLocation==='battle'?'battle':'eris',left:0};}const t=ensure(s).travel%CYCLE;return t<300?{at:'eris',left:300-t}:t<360?{at:'outbound',from:'eris',to:'earth',fraction:(t-300)/60,left:360-t}:t<660?{at:'earth',left:660-t}:{at:'returning',from:'earth',to:'eris',fraction:(t-660)/60,left:720-t};}

  function world(s){return s.space&&s.space.phase!=='off'?s.space.body:'earth';}

  function groundPlay(s){return !s.space||s.space.phase==='off'||s.space.phase==='landed';}

  function polarSite(s){if(world(s)!=='earth'||!groundPlay(s))return false;if(!s.africaStarted)return true;if(!s.space?.geo?.global)return false;return NVWorldFlight.region(s).id==='antarctica'&&!s.space.ecologyOcean;}

  function npc(s){if(!groundPlay(s)||s.space?.ecologyOcean)return null;const e=ensure(s);if(!sandbox(s)){const c=e.cameo;return polarSite(s)&&c.seen&&!c.done&&!c.boarded?{...c,name:'????',kind:'cameo',speed:c.flee?6.4:0}:null;}const r=route(s);if(r.at==='eris'&&world(s)==='eris')return{x:0,z:63,yaw:Math.PI,name:'Vishara Erisconos',kind:'queen'};if(r.at==='earth'&&polarSite(s))return{...EARTH,yaw:Math.PI,name:'Vishara Erisconos',kind:'queen'};return null;}

  function assistant(s){return sandbox(s)&&groundPlay(s)&&world(s)==='eris'&&!s.space?.ecologyOcean?{x:7,z:63,yaw:Math.PI,name:'Vishara’s Assistant',kind:'assistant'}:null;}

  function nearest(s){return[npc(s),assistant(s),...(typeof NVErisFamily!=='undefined'?NVErisFamily.npcs(s):[])].filter(n=>n&&n.kind!=='cameo'&&(n.kind!=='nyrexia'||NVErisFamily.canRecruit(s))).sort((a,b)=>Math.hypot(a.x-s.x,a.z-s.z)-Math.hypot(b.x-s.x,b.z-s.z))[0]||null;}

  function step(s,dt){if(!Number.isFinite(dt)||dt<=0)return[];const e=ensure(s),events=[];e.noticeTime=Math.max(0,e.noticeTime-dt);if(e.campaignIndex<CONQUEST.length&&!(typeof NVSolWar!=="undefined"&&NVSolWar.active(NVSolWar.ensure(s)))){e.clock=Math.min(INTERVAL*CONQUEST.length,e.clock+dt);while(e.campaignIndex<CONQUEST.length&&e.clock>=(e.campaignIndex+1)*INTERVAL){const id=CONQUEST[e.campaignIndex++];if(faction(s,id)==='CUSTOM')continue;e.conquered.push(id);events.push('The Erisian Empire conquered '+NVSol.byId[id].name);}if(events.length){e.notice=events.join(' · ');e.noticeTime=14;}}

    if(typeof NVErisFamily!=='undefined')NVErisFamily.follow(s,dt);if(sandbox(s))e.travel=(e.travel+dt)%CYCLE;

    else if(polarSite(s)&&s.jamesIntroductionDone){const c=e.cameo;if(!c.done){if(Math.hypot(s.x-EARTH.x,s.z-EARTH.z)<220)c.seen=true;if(c.seen&&Math.hypot(s.x-c.x,s.z-c.z)<24)c.flee=true;if(c.flee){if(c.boarded){c.time+=dt;if(c.time>=11)c.done=true;}else{const dx=EARTH.x+18-c.x,dz=EARTH.z+13-c.z,d=Math.hypot(dx,dz),amount=Math.min(d,6.4*dt);c.time+=dt;if(d>.001){c.x+=dx/d*amount;c.z+=dz/d*amount;c.yaw=Math.atan2(dx,dz);}if(d<=6.4*dt+.001){c.boarded=true;c.time=Math.max(0,dt-d/6.4);if(c.time>=11)c.done=true;}}}}}return events;

  }

  function claim(s,id){const e=ensure(s);if(!NVSol.byId[id]||['ERISIAN','CHOMPY'].includes(faction(s,id)))return false;if(!e.playerFaction.claims.includes(id))e.playerFaction.claims.push(id);return true;}

  function nameFaction(s,name){const text=String(name||'').trim().replace(/\s+/g,' ').slice(0,40);if(!text)return false;ensure(s).playerFaction.name=text;return true;}

  function canBuild(s){return sandbox(s)&&groundPlay(s)&&!s.space?.ecologyOcean&&['UNCLAIMED','HUMAN','CUSTOM'].includes(faction(s,world(s)))&&ensure(s).bases.length<32&&!ensure(s).bases.some(b=>b.body===world(s)&&Math.hypot(b.x-s.x,b.z-s.z)<22);}

  function build(s){const e=ensure(s);if(!NVEris.canBuild(s))return{ok:false,text:faction(s,world(s))==='ERISIAN'?'Imperial territory. New player bases are not permitted.':'Find open ground at least 22 m from another base.'};if((s.inventory?.scrap||0)<6||(s.inventory?.fabric||0)<4)return{ok:false,text:'A field base requires 6 scrap and 4 fabric.'};s.inventory.scrap-=6;s.inventory.fabric-=4;e.bases.push({body:world(s),x:s.x+Math.sin(s.cameraYaw)*7,z:s.z+Math.cos(s.cameraYaw)*7});NVEris.claim(s,world(s));return{ok:true,text:'Field base constructed. Use SAVE GAME to preserve it.'};}

  function lines(s,n){if(typeof NVErisFamily!=='undefined'&&NVErisFamily.quotes[n.kind])return NVErisFamily.quotes[n.kind];if(n.kind==='assistant')return route(s).at==='eris'?['Welcome to Citadel el Erisconos. Her Majesty is holding court on the forecourt.','Eris and Dysnomia answer to the Erisian Empire. Our claim over the distant worlds continues.']:['Her Majesty Vishara Erisconos is away. Her ship makes regular journeys between Eris and Earth.','If she has reached Earth, you will find her near the Antarctic research shelter. She cannot be in two places at once.','You may wait here for her return. The citadel remains under my care.'];return['I am Vishara Erisconos, sovereign of Eris and guardian of Dysnomia. You stand before the Erisian Empire.','You saw me once beyond your Antarctic shelter. I was not ready to be found.','Citadel el Erisconos is my home: a light carved into the ice at the edge of the Sun’s dominion.','I travel between Eris and Earth. When I am away, my assistant speaks in my stead.','Build where the stars remain unclaimed, Wanderer. The worlds beneath my banner belong to the Empire.'];}

  return{INTERVAL,CONQUEST,HOME,CYCLE,CITADEL,EARTH,fresh,restore,ensure,snapshot,faction,sandbox,route,world,groundPlay,polarSite,npc,assistant,nearest,step,claim,nameFaction,canBuild,build,lines};

})();

