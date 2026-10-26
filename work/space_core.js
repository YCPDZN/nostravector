const NVSpace=(()=>{
  const A=NVAntarctica,Sol=NVSol,clamp=A.clamp;
  const distance=(a,b)=>Math.hypot(...a.map((v,i)=>v-b[i]));
  // Twelve real minutes from Mercury to Sedna at the starter drive's maximum.
  const BASE_DRIVE_SPEED=distance(Sol.byId.mercury.position,Sol.byId.sedna.position)/720;
  const DRIVE_MULTIPLIERS=[1,2,4,8],DRIVE_COSTS=[8,16,32];
  const TRANSIT_SECONDS={ascent:2,descent:2};
  const transitionDuration=p=>p.phase==='descent'?TRANSIT_SECONDS.descent:TRANSIT_SECONDS.ascent;
  function canApproach(s){const p=s?.space,b=Sol.byId[p?.target];return !!b&&!b.stellar&&p.phase==='flight'&&!p.warp&&p.hull>0&&(typeof NVGalaxy==='undefined'||(b.system||'sol')===NVGalaxy.system(s))&&Math.max(0,distance(p.position,b.position)-b.radius)<=Math.max(250,b.radius*5+160);}
  const driveLevel=p=>Number.isInteger(p.driveLevel)?clamp(p.driveLevel,0,3):0;
  const maxHull=p=>p?.shipId==='grek-horizon'?10000:p?.shipId==='olympus-vanguard'?3000:100;
  const driveSpeed=p=>BASE_DRIVE_SPEED*(p.shipId==='grek-horizon'?12:DRIVE_MULTIPLIERS[driveLevel(p)]);
  const routeEnd=b=>[b.position[0]+b.radius*.4,b.position[1]+b.radius*.7+30,b.position[2]+b.radius*3.2+40];
  const routeSeconds=(p,end)=>Math.max(2,(distance(p.position,end)+700)/driveSpeed(p));
  function upgradeDrive(s){const p=ensure(s),level=driveLevel(p),near=Math.hypot(s.x-p.landingX,s.z-p.landingZ)<=15;
    if(level===3||p.shipId==='grek-horizon'){notice(p,'ENGINE / MAXIMUM UPGRADE');return false;}
    if(!['cockpit','landed'].includes(p.phase)||p.phase==='landed'&&!near){notice(p,'UPGRADE / BOARD YOUR SHIP OR STAND BESIDE IT');return false;}
    const cost=DRIVE_COSTS[level];if((s.inventory?.scrap||0)<cost){notice(p,'ENGINE UPGRADE / NEEDS '+cost+' SCRAP');return false;}
    s.inventory.scrap-=cost;p.driveLevel=level+1;notice(p,'ENGINE MK '+(p.driveLevel+1)+' / '+DRIVE_MULTIPLIERS[p.driveLevel]+'× SPEED · MANUAL SAVE TO KEEP');return true;
  }
  const active=s=>!!s?.space&&s.space.phase!=='off';
  const surface=s=>active(s)&&['landed','cockpit'].includes(s.space.phase)&&s.space.body!=='earth';
  const clone=o=>JSON.parse(JSON.stringify(o));
  function fresh(){return{ecologyOcean:false,version:1,phase:'off',body:'earth',target:'moon',position:[0,0,0],yaw:0,pitch:0,speed:0,throttle:0,hull:100,crew:false,elapsed:0,transitionDuration:2,time:0,autopilot:false,focusReleased:false,flightStart:[0,0,0],flightEnd:[0,0,0],flightDuration:0,landingX:0,landingZ:848,visited:['earth'],collisionCooldown:0,damageFlash:0,stationVisited:false,stationSupplies:false,message:'',messageTime:0};}
  function restore(raw,s){const p=fresh();if(!raw||!s.africaStarted||s.africaStage!=='complete')return p;
    p.phase=['cockpit','launch','flight','descent','landed','ascent','disabled'].includes(raw.phase)?raw.phase:'off';
    for(const k of ['body','target'])if(Sol.byId[raw[k]])p[k]=raw[k];
    for(const k of ['position','flightStart','flightEnd'])if(Array.isArray(raw[k])&&raw[k].length===3&&raw[k].every(Number.isFinite))p[k]=raw[k].map(v=>clamp(v,-1e6,1e6));
    for(const [k,min,max] of [['yaw',-1e6,1e6],['pitch',-1.35,1.35],['speed',0,1500],['throttle',0,1],['hull',0,maxHull(raw)],['elapsed',0,1e6],['time',0,1e9],['flightDuration',0,1e7],['landingX',-1e7,1e7],['landingZ',-1e7,1e7],['collisionCooldown',0,2],['damageFlash',0,1],['messageTime',0,10]])if(Number.isFinite(raw[k]))p[k]=clamp(raw[k],min,max);
    if(['launch','ascent','descent'].includes(p.phase)){const previousDuration=Number.isFinite(raw.transitionDuration)&&raw.transitionDuration>0?raw.transitionDuration:p.phase==='descent'?12:9;p.elapsed=Math.min(transitionDuration(p),p.elapsed/previousDuration*transitionDuration(p));}p.transitionDuration=transitionDuration(p);p.driveLevel=driveLevel(raw);p.driveVersion=1;
    p.ecologyOcean=!!raw.ecologyOcean&&['europa','enceladus'].includes(p.body)&&p.phase==='landed';
    p.crew=s.friendQuest==='recruited';p.autopilot=!!raw.autopilot&&p.phase==='flight'&&p.flightDuration>0;p.focusReleased=raw.focusReleased===true&&!p.autopilot;
    if(p.autopilot&&raw.driveVersion!==1){p.flightStart=p.position.slice();p.flightDuration=routeSeconds(p,p.flightEnd);p.elapsed=0;}
    p.visited=Array.isArray(raw.visited)?[...new Set(raw.visited.filter(id=>Sol.byId[id]))]:['earth'];
    p.stationVisited=!!raw.stationVisited;p.stationSupplies=!!raw.stationSupplies;p.salvaged=Array.isArray(raw.salvaged)?raw.salvaged.filter(v=>typeof v==='string'&&v.length<100).slice(-500):[];
    if(p.hull<=0&&p.phase==='flight')p.phase='disabled';return p;
  }
  function ensure(s){if(!s.space)s.space=fresh();return s.space;}
  function notice(p,message){p.message=message;p.messageTime=5;}
  function board(s){const p=ensure(s);if(!s.africaStarted||s.africaStage!=='complete'||s.friendDialogueActive)return false;
    if(p.phase==='off'){if(!s.spaceshipFound||Math.hypot(s.x-NVAfrica.SHIP.x,s.z-NVAfrica.SHIP.z)>16)return false;p.body='earth';p.landingX=NVAfrica.SHIP.x;p.landingZ=NVAfrica.SHIP.z;}
    else if(p.phase==='landed'){if(p.ecologyOcean)return false;if(Math.hypot(s.x-p.landingX,s.z-p.landingZ)>15)return false;}else return false;
    p.phase='cockpit';p.elapsed=0;p.crew=s.friendQuest==='recruited';p.autopilot=false;p.speed=0;notice(p,p.crew?'ORION MASCAR / ABOARD':'SOLO FLIGHT / READY');return true;
  }
  function disembark(s){const p=ensure(s);if(p.phase!=='cockpit'&&p.phase!=='landed')return false;p.phase=p.body==='earth'?'off':'landed';s.x=p.landingX;s.z=p.landingZ-10;s.cameraYaw=0;s.cameraPitch=.3;s.yaw=0;s.friend={x:s.x+2,z:s.z-2,yaw:0};return true;}
  function launch(s){const p=ensure(s);if(p.phase!=='cockpit'||p.hull<=0||p.ecologyOcean)return false;const b=Sol.byId[p.body];p.phase=p.visited.length===1&&p.body==='earth'?'launch':'ascent';p.elapsed=0;p.autopilot=false;p.speed=0;p.throttle=0;p.position=[b.position[0],b.position[1]+b.radius+3,b.position[2]];return true;}
  function orbit(s){const p=s.space,b=Sol.byId[p.body];p.phase='flight';p.elapsed=0;p.position=[b.position[0]+b.radius*.8,b.radius*1.4,b.position[2]+b.radius*2.8];pointAt(p,b.position);p.speed=0;p.throttle=0;notice(p,'ORBIT ACHIEVED / OPEN SOL CHART');}
  function pointAt(p,t){const d=t.map((v,i)=>v-p.position[i]);p.yaw=Math.atan2(d[0],d[2]);p.pitch=Math.atan2(d[1],Math.hypot(d[0],d[2]));}
  function select(s,id){if(Sol.byId[id]?.stellar)return false;if(!Sol.byId[id])return false;const p=ensure(s);p.target=id;p.focusReleased=false;return true;}
  function releaseCourse(s){const p=s?.space;if(!p||p.phase!=='flight'||p.warp||p.hull<=0)return false;if(p.autopilot)p.throttle=clamp(p.speed/(driveSpeed(p)*.65),0,1);p.autopilot=false;p.focusReleased=true;notice(p,'FREE FLIGHT / COURSE RELEASED');return true;}
  // Match the flight renderer's 60-degree camera and choose the nearest visible globe.
  function pickWorld(s,nx=0,ny=0,aspect=1){
    const p=s?.space;if(!p||p.phase!=='flight'||p.warp||p.hull<=0||![nx,ny,aspect].every(Number.isFinite)||Math.abs(nx)>1||Math.abs(ny)>1||aspect<=0)return null;
    const sy=Math.sin(p.yaw),cy=Math.cos(p.yaw),sp=Math.sin(p.pitch),cp=Math.cos(p.pitch),f=Math.tan(Math.PI/6);
    const forward=[sy*cp,sp,cy*cp],right=[-cy,0,sy],up=[-sy*sp,cp,-cy*sp];
    let ray=forward.map((v,i)=>v+right[i]*nx*f*aspect+up[i]*ny*f);const length=Math.hypot(...ray);ray=ray.map(v=>v/length);
    const hit=(position,radius)=>{const offset=position.map((v,i)=>v-p.position[i]),along=offset.reduce((n,v,i)=>n+v*ray[i],0),disc=radius*radius-offset.reduce((n,v)=>n+v*v,0)+along*along;if(disc<0)return Infinity;const near=along-Math.sqrt(disc),far=along+Math.sqrt(disc);return near>.05?near:far>.05?far:Infinity;};
    let nearest=hit([0,0,0],typeof NVCluster!=='undefined'?NVCluster.meta[p.system]?.starRadius||62:62),chosen=null;
    for(const body of (typeof NVGalaxy==='undefined'?Sol.worlds:NVGalaxy.worlds(s))){const t=hit(body.position,body.radius);if(t<nearest){nearest=t;chosen=body;}}
    return chosen;
  }
  function cruise(s){if(Sol.byId[s?.space?.target]?.stellar)return false;const p=ensure(s),b=Sol.byId[p.target];if(p.phase!=='flight'||p.hull<=0)return false;
    p.focusReleased=false;p.flightStart=p.position.slice();p.flightEnd=routeEnd(b);p.flightDuration=routeSeconds(p,p.flightEnd);p.driveVersion=1;p.elapsed=0;p.autopilot=true;notice(p,'GUIDED FLIGHT / '+b.name.toUpperCase());return true;
  }
  function approach(s){const p=ensure(s),b=Sol.byId[p.target];if(!canApproach(s))return false;
    p.body=p.target;p.phase='descent';p.elapsed=0;p.autopilot=false;p.flightStart=p.position.slice();p.speed=0;p.throttle=0;notice(p,b.giant?'CLOUD PLATFORM / APPROACH':b.atmosphere?'ATMOSPHERIC ENTRY':'AIRLESS APPROACH');return true;
  }
  function touchDown(s){const p=s.space,b=Sol.byId[p.body];p.ecologyOcean=false;p.phase=b.id==='earth'?'off':'landed';p.elapsed=0;p.autopilot=false;p.speed=0;p.throttle=0;
    p.landingX=b.id==='earth'?NVAfrica.SHIP.x:0;p.landingZ=b.id==='earth'?NVAfrica.SHIP.z:0;s.x=p.landingX;s.z=p.landingZ-11;s.yaw=0;s.cameraYaw=0;s.cameraPitch=.3;s.friend={x:s.x+2,z:s.z-2,yaw:0};if(!p.visited.includes(b.id))p.visited.push(b.id);notice(p,b.station?'CHARON / REACH THE STATION AIRLOCK':b.giant?'CLOUD PLATFORM / DECK SECURED':'LANDED / '+b.name.toUpperCase());
  }
  const rocks=Sol.belts.flatMap((belt,bi)=>Array.from({length:belt.count},(_,i)=>{const a=A.hash(i,bi,4291)*Math.PI*2,r=belt.inner+A.hash(i,bi,4292)*(belt.outer-belt.inner);return{position:[Math.sin(a)*r,(A.hash(i,bi,4293)-.5)*120,Math.cos(a)*r],radius:3+A.hash(i,bi,4294)*13,belt:bi,rotation:A.hash(i,bi,4295)*6.28};}));
  function segmentDistance(a,b,q){const d=b.map((n,i)=>n-a[i]),len=d.reduce((n,v)=>n+v*v,0),t=len?clamp(q.reduce((n,v,i)=>n+(v-a[i])*d[i],0)/len,0,1):0;return distance(q,a.map((v,i)=>v+d[i]*t));}
  function damage(p,amount,message){if(p.collisionCooldown>0)return false;p.hull=Math.max(0,p.hull-amount);p.collisionCooldown=1.2;p.damageFlash=1;notice(p,message);if(p.hull===0){p.phase='disabled';p.autopilot=false;p.speed=0;p.throttle=0;}return true;}
  function solarHeat(p,previous){if(p.phase==='flight'&&segmentDistance(previous,p.position,[0,0,0])<100)damage(p,24,'SOLAR HEAT / RETREAT');}
  function collisions(p,previous,obstacles=rocks){if(p.phase!=='flight'||p.collisionCooldown>0)return;for(const r of (p.system&&p.system!=='sol'?[]:obstacles)){if(segmentDistance(previous,p.position,r.position)<r.radius+2.5){damage(p,18,'IMPACT / HULL DAMAGED');break;}}
    if(distance(p.position,[0,0,0])<(typeof NVCluster!=='undefined'?Math.max(100,(NVCluster.meta[p.system]?.starRadius||62)+38):100))damage(p,24,typeof NVCluster!=='undefined'&&NVCluster.meta[p.system]?.blackHole?'EVENT HORIZON / RETREAT':'SOLAR HEAT / RETREAT');
    for(const b of (typeof NVGalaxy!=='undefined'?NVGalaxy.worlds({space:p}):Sol.worlds)){const d=distance(p.position,b.position),safe=b.radius+5;if(d<safe){const v=p.position.map((n,i)=>n-b.position[i]),l=Math.hypot(...v)||1;p.position=b.position.map((n,i)=>n+(l===1&&v.every(n=>n===0)?[0,1,0][i]:v[i]/l)*safe);damage(p,12,'TERRAIN PROXIMITY / USE LANDING APPROACH');p.speed=0;p.throttle=0;p.autopilot=false;}}
  }
  function repair(s){const p=ensure(s);if(p.hull>=maxHull(p))return false;if(s.inventory.repairKit>0){s.inventory.repairKit--;p.hull=clamp(p.hull+maxHull(p)*.6,0,maxHull(p));}else if(s.inventory.scrap>=2){s.inventory.scrap-=2;p.hull=clamp(p.hull+maxHull(p)*.35,0,maxHull(p));}else{notice(p,'REPAIR NEEDS 1 KIT OR 2 SCRAP / EMERGENCY TOW AVAILABLE');return false;}if(p.phase==='disabled')p.phase='flight';notice(p,'HULL REPAIRED');return true;}
  function recover(s){const p=ensure(s);if(p.phase!=='disabled')return false;p.body='earth';p.hull=maxHull(p)*.35;orbit(s);notice(p,'EMERGENCY TOW / EARTH ORBIT · HULL 35%');return true;}
  function station(s){const p=ensure(s),dock=typeof NVCharonStation!=='undefined'?NVCharonStation.local(s):{x:24,z:25};if(p.phase!=='landed'||p.body!=='charon'||Math.hypot(s.x-dock.x,s.z-dock.z)>9)return false;p.stationVisited=true;if(!p.stationSupplies){s.inventory.scrap+=10;s.inventory.repairKit+=2;s.inventory.powerCell+=4;p.stationSupplies=true;}p.hull=maxHull(p);notice(p,'CHARON STATION / AIRLOCK OPEN · HULL SERVICED');return true;}
  function collect(s){const p=ensure(s);if(p.phase!=='landed')return false;const gx=Math.floor(s.x/40),gz=Math.floor(s.z/40),key=p.body+':'+gx+','+gz;p.salvaged=p.salvaged||[];if(p.salvaged.includes(key)){notice(p,'THIS SECTOR HAS BEEN SALVAGED');return false;}p.salvaged.push(key);if(p.salvaged.length>500)p.salvaged.shift();s.inventory.scrap+=2;notice(p,'COLLECTED / 2 SCRAP · CRAFT REPAIR KITS');return true;}
  function surfaceHeight(x,z,seed,id){return NVLandscapes.height(x,z,seed,id);}
  function surfaceProps(cx,cz,seed,id){return NVLandscapes.props(cx,cz,seed,id);}
  function surfaceGround(x,z,seed,id){if(id==='eris'&&typeof NVCitadel!=='undefined')return NVCitadel.height(x,z,surfaceHeight(x,z,seed,id));if(id==='charon'&&Math.abs(x-24)<9&&Math.abs(z-25)<10)return surfaceHeight(24,25,seed,id)+.6;return surfaceHeight(x,z,seed,id);}
  function walk(s,dt,input){const p=s.space,b=Sol.byId[p.body],oldFriend={x:s.friend.x,z:s.friend.z};let f=input.forward||0,r=input.right||0;if(input.turn)s.cameraYaw+=input.turn*dt*1.5;const len=Math.hypot(f,r),speed=A.staminaStep(s,!!input.boost,len>0,dt),oldx=s.x,oldz=s.z;if(len){f/=len;r/=len;const dx=Math.sin(s.cameraYaw)*f+Math.cos(s.cameraYaw)*r,dz=Math.cos(s.cameraYaw)*f-Math.sin(s.cameraYaw)*r;s.x+=dx*speed*dt;s.z+=dz*speed*dt;s.yaw=Math.atan2(dx,dz);if(b.giant&&!p.geo?.global){s.x=clamp(s.x,-47,47);s.z=clamp(s.z,-42,55);}}if(b.id==='eris'&&typeof NVCitadel!=='undefined')NVCitadel.resolve(s,{x:oldx,z:oldz},(x,z)=>surfaceHeight(x,z,s.seed,b.id));let friend=0;if(p.crew&&(typeof NVGovernance==='undefined'||NVGovernance.follows(s,'orion'))){const t=[s.x-2,s.z-2],dx=t[0]-s.friend.x,dz=t[1]-s.friend.z,d=Math.hypot(dx,dz),step=Math.min(Math.max(0,d-.3),Math.max(speed,2)*dt);if(step&&d){s.friend.x+=dx/d*step;s.friend.z+=dz/d*step;s.friend.yaw=Math.atan2(dx,dz);friend=step/dt;}}if(p.crew&&b.id==='eris'&&typeof NVCitadel!=='undefined')NVCitadel.resolve(s.friend,oldFriend,(x,z)=>surfaceHeight(x,z,s.seed,b.id));return{player:Math.hypot(s.x-oldx,s.z-oldz)/dt,friend};}
  function step(s,dt,input={}){const p=ensure(s);if(!active(s)||!Number.isFinite(dt)||dt<=0)return{player:0,friend:0};dt=Math.min(dt,.1);p.time+=dt;s.playTime+=dt;A.earthStep(s,dt);p.collisionCooldown=Math.max(0,p.collisionCooldown-dt);p.damageFlash=Math.max(0,p.damageFlash-dt*2);p.messageTime=Math.max(0,p.messageTime-dt);
    if(['launch','ascent'].includes(p.phase)){p.elapsed+=dt;const b=Sol.byId[p.body],t=clamp(p.elapsed/transitionDuration(p),0,1);p.position=[b.position[0]+b.radius*.8*t,b.radius*(1+3*t),b.position[2]+b.radius*2.8*t];pointAt(p,b.position);if(t===1)orbit(s);}
    else if(p.phase==='descent'){p.elapsed+=dt;const b=Sol.byId[p.body],t=clamp(p.elapsed/transitionDuration(p),0,1),goal=[b.position[0],b.position[1]+b.radius+.5,b.position[2]];p.position=p.flightStart.map((v,i)=>v+(goal[i]-v)*t);pointAt(p,b.position);if(t===1)touchDown(s);}
    else if(p.phase==='landed')return walk(s,dt,input);
    else if(p.phase==='flight'){const previous=p.position.slice();if(p.autopilot){p.elapsed+=dt;const t=clamp(p.elapsed/p.flightDuration,0,1);p.position=p.flightStart.map((v,i)=>v+(p.flightEnd[i]-v)*t);p.position[1]+=Math.sin(t*Math.PI)*350;p.speed=distance(p.position,previous)/dt;pointAt(p,Sol.byId[p.target].position);if(t===1){p.autopilot=false;p.speed=0;p.throttle=0;notice(p,'APPROACH READY / L TO LAND');}}
      else{p.yaw+=(input.yaw||0)*dt*1.0;p.pitch=clamp(p.pitch+(input.pitch||0)*dt*.8,-1.35,1.35);p.throttle=clamp(p.throttle+(input.accel||0)*dt*.3,0,1);if(input.brake)p.throttle=0;const goal=p.throttle*driveSpeed(p)*(input.boost?1:.65);p.speed+=(goal-p.speed)*Math.min(1,dt*2);const dir=[Math.sin(p.yaw)*Math.cos(p.pitch),Math.sin(p.pitch),Math.cos(p.yaw)*Math.cos(p.pitch)];p.position=p.position.map((v,i)=>v+dir[i]*p.speed*dt);p.position[1]+=(input.lift||0)*dt*driveSpeed(p)*.25;}
      if(typeof NVBlackHoleGates!=='undefined'&&NVBlackHoleGates.crossed(s,previous,p.position)){NVBlackHoleGates.begin(s,previous);return{player:0,friend:0};}
      if(typeof NVBlackHoleGates!=='undefined'&&NVBlackHoleGates.reject(s,previous,p.position))return{player:0,friend:0};
      solarHeat(p,previous);
      if(typeof NVWorldFlight!=='undefined'&&NVWorldFlight.autoEntry(s,previous))return{player:0,friend:0};
      collisions(p,previous);
    }return{player:0,friend:0};
  }
  function beltAt(p){const r=Math.hypot(p.position[0],p.position[2]);return Sol.belts.find(b=>r>b.inner&&r<b.outer&&Math.abs(p.position[1])<120);}
  return{maxHull,TRANSIT_SECONDS,transitionDuration,canApproach,driveLevel,driveSpeed,upgradeDrive,routeEnd,routeSeconds,DRIVE_MULTIPLIERS,DRIVE_COSTS,notice,active,surface,fresh,restore,ensure,clone,board,disembark,launch,orbit,select,pickWorld,releaseCourse,cruise,approach,touchDown,pointAt,step,distance,rocks,collisions,segmentDistance,repair,recover,station,collect,surfaceHeight,surfaceGround,surfaceProps,beltAt};
})();
