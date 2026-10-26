const NVBrownBastion=(()=>{
 const INTRO=[
  'Remember this station, Wanderer? You crawled through its doors looking for shelter. Now its walls answer to Terra Imperia—and so do I.',
  'You pushed me into that water and sailed away. I remember the cold. I remember the silence. Hawthorne made certain I would remember you.',
  'Look around. Your little refuge has become an Imperial bastion. Every tower, every gun, every locked gate was built to make hope feel very small.',
  'They call me Pontifex Maximus now. Beneath this armour, James Brown is still here—and he has been waiting a very long time to finish our conversation.',
  'There is no ferry this time. No bridge to throw me from. Come on, Wanderer. Let us find out which of us leaves Antarctica alive.'
 ];
 const BARKS=[
  'I pulled you out of the snow. I can put you back beneath it!',
  'Run if you like. These walls were built to keep you here!',
  'Hawthorne gave me a second life. I intend to spend it ending yours!',
  'You hear that machinery? That is what your mercy left behind!',
  'Your friends cannot drag you out of this one, Wanderer!',
  'You cracked the armour. You have not broken me!',
  'The sea could not keep me. Neither will you!',
  'Every step you take brings you closer to the grave I escaped!',
  'No! I will not die in this frozen wasteland twice!',
  'Look at me when you strike! Remember who you left in the water!'
 ];
 const site=()=>({x:0,z:NVAntarctica.STATION.z-65,lat:-78,lon:20,global:true});
 const fresh=()=>({version:1,line:0,started:false,done:false,barkIndex:0,barkTime:0,barkCooldown:0,lastAttack:0});
 function restore(raw){const q=fresh();if(!raw)return q;for(const k of ['started','done'])q[k]=raw[k]===true;for(const [k,max]of [['line',4],['barkIndex',10],['barkTime',8],['barkCooldown',12],['lastAttack',1e9]])q[k]=Math.max(0,Math.min(max,Number(raw[k])||0));q.line=Math.floor(q.line);q.barkIndex=Math.floor(q.barkIndex);return q;}
 function ensure(s){const story=NVBrownStory.ensure(s);return story.encounter||(story.encounter=fresh());}
 function active(s){return NVBrownStory.ensure(s).earthTaken&&NVEris.world(s)==='earth'&&NVEris.groundPlay(s)&&!s.space?.ecologyOcean;}
 function local(s){if(!active(s))return null;const p=s.space,g=p?.geo,a=site();let x=a.x,z=a.z+65;if(g?.global){x+=(p.landingX||0)+NVWorldFlight.wrap(a.lon-g.lon)*24000*Math.max(.05,Math.cos(g.lat*Math.PI/180));z+=(p.landingZ||0)+(a.lat-g.lat)*24000;}return{x,z};}
 function contains(s,x,z){const n=local(s);return !!n&&Math.abs(x-n.x)<174&&Math.abs(z-n.z)<194;}
 function migrate(s){const boss=NVPontifex.ensure(s),q=ensure(s);if(boss.identity==='james-brown'&&!q.siteVersion){boss.site=site();boss.offset={x:0,z:0};q.siteVersion=1;}return q;}
 function begin(s){const q=migrate(s),n=NVPontifex.local(s);if(q.done||!n||!n.boss.alive||n.distance>55)return false;q.started=true;n.boss.yaw=Math.atan2(s.x-n.x,s.z-n.z);return true;}
 function next(s){const q=ensure(s);if(!q.started||q.done)return false;if(q.line<4)q.line++;else{q.done=true;q.barkCooldown=5;}return true;}
 function step(s,dt){const q=migrate(s),boss=NVPontifex.ensure(s);if(!Number.isFinite(dt)||dt<=0||!q.done||boss.identity!=='james-brown')return;dt=Math.min(dt,.1);q.barkTime=Math.max(0,q.barkTime-dt);q.barkCooldown=Math.max(0,q.barkCooldown-dt);const n=NVPontifex.local(s);if(!n||!boss.alive){q.barkTime=0;return;}if(n.distance<=65&&boss.attackCount>q.lastAttack&&q.barkCooldown===0&&q.barkIndex<10){q.lastAttack=boss.attackCount;q.barkIndex++;q.barkTime=6;q.barkCooldown=8;}}
 // Bounds include solid corner towers and a wide, open southern gate.
 const solids=[[-160,0,8,360],[160,0,8,360],[0,180,320,8],[-91,-180,138,8],[91,-180,138,8],[-160,-180,27,27],[160,-180,27,27],[-160,180,27,27],[160,180,27,27],[-85,85,48,60],[85,85,48,60],[0,130,60,35]];
 return{INTRO,BARKS,site,fresh,restore,ensure,active,local,contains,migrate,begin,next,step,solids};
})();
const bastionStoryRestore=NVBrownStory.restore;NVBrownStory.restore=raw=>{const q=bastionStoryRestore(raw);q.encounter=NVBrownBastion.restore(raw?.encounter);q.encounter.siteVersion=raw?.encounter?.siteVersion===1?1:0;return q;};
const bastionBossStep=NVPontifex.step;NVPontifex.step=(s,dt)=>{const q=NVPontifex.ensure(s);if(q.identity==='james-brown'){const e=NVBrownBastion.migrate(s);if(!e.done){q.mode='dormant';q.speed=0;return;}}bastionBossStep(s,dt);NVBrownBastion.step(s,dt);};
const bastionDamage=NVPontifex.damage;NVPontifex.damage=(s,n,source)=>{if(NVPontifex.ensure(s).identity==='james-brown'&&!NVBrownBastion.ensure(s).done)return false;return bastionDamage(s,n,source);};
const bastionStrike=NVPontifex.strike;NVPontifex.strike=(s,source)=>{if(NVPontifex.ensure(s).identity==='james-brown'&&!NVBrownBastion.ensure(s).done)return false;return bastionStrike(s,source);};
const bastionCollision=NVConstruction.resolve;NVConstruction.resolve=(s,old)=>{bastionCollision(s,old);const n=NVBrownBastion.local(s);if(!n||s.aerialView)return;for(const [x,z,w,d]of NVBrownBastion.solids){const cx=n.x+x,cz=n.z+z,inside=(px,pz)=>Math.abs(px-cx)<w/2+.5&&Math.abs(pz-cz)<d/2+.5;if(inside(s.x,s.z)||!inside(old.x,old.z)&&((old.x<cx-w/2&&s.x>cx+w/2||s.x<cx-w/2&&old.x>cx+w/2)&&Math.abs(s.z-cz)<d/2||(old.z<cz-d/2&&s.z>cz+d/2||s.z<cz-d/2&&old.z>cz+d/2)&&Math.abs(s.x-cx)<w/2)){s.x=old.x;s.z=old.z;break;}}};

const bastionEcology=NVEcology.visible;NVEcology.visible=s=>{const r=bastionEcology(s);return {...r,plants:r.plants.filter(e=>!NVBrownBastion.contains(s,e.x,e.z)),animals:r.animals.filter(e=>e.species.flying||!NVBrownBastion.contains(s,e.x,e.z))};};
