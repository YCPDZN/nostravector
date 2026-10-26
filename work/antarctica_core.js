const NVAntarctica=(()=>{
  const WALK=1.4,SPRINT=7,STATION={x:0,z:1698,radius:18},STRIDE_WALK=1.2,STRIDE_RUN=3.2,DEPOT={x:40,z:2058},CAR_TRIP_SECONDS=300,MPH_TO_MPS=.44704,CAR_MAX_SPEED=200*MPH_TO_MPS,CAR_REVERSE_SPEED=20*MPH_TO_MPS;
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  function gaitSettings(speed,phase=0){
    const run=clamp((speed-WALK)/(SPRINT-WALK),0,1),moving=clamp(speed/.7,0,1);
    return{run,moving,stride:STRIDE_WALK+(STRIDE_RUN-STRIDE_WALK)*run,
      duty:.60-.32*run,lean:(.035+.435*run)*moving,
      bob:((-.10-.025*run)+Math.cos(phase*2)*(.018+.045*run))*moving,
      roll:Math.sin(phase)*.038*run*moving,armSwing:(.11+.39*run)*moving};
  }
  function gaitAdvance(speed,dt){const g=gaitSettings(speed);return Math.max(0,speed)*Math.max(0,dt)/g.stride*2*Math.PI*(1+.25*g.run);}
  function gaitFoot(phase,g){
    const u=((phase/(2*Math.PI))%1+1)%1,amp=(.36+.065*g.run)*g.moving;
    if(u<g.duty){const contact=u/g.duty;return{z:amp*(1-2*contact),lift:0,pitch:-Math.sin(Math.PI*Math.max(0,(contact-.65)/.35))*(.125+.35*g.run)};}
    const v=(u-g.duty)/(1-g.duty),swing=Math.sin(v*Math.PI);
    // Recover the heel early, then drive the knee through before extending to land.
    const recovery=Math.pow(Math.max(0,swing),1-.25*g.run)*(1+.20*g.run*Math.sin(v*2*Math.PI));
    return{z:-amp+2*amp*(v*v*(3-2*v)),lift:recovery*(.10+.40*g.run)*g.moving,pitch:swing*(.15+.65*g.run)};
  }
  function sprintArm(shoulderRest,elbowRest,wristRest,side,phase,g,bob){
    const upperLength=Math.hypot(...elbowRest.map((v,i)=>v-shoulderRest[i])),foreLength=Math.hypot(...wristRest.map((v,i)=>v-elbowRest[i]));
    // Attach the shoulders to the forward-leaning torso, then drive bent arms
    // from the shoulder. Both limb segments keep their original mesh lengths.
    const h=shoulderRest[1]-.84,shoulder=[shoulderRest[0],.84+bob+h*Math.cos(g.lean),h*Math.sin(g.lean)],angle=.12+Math.cos(phase)*.95*g.moving,flex=1.45;
    const elbow=[shoulder[0]+side*.025,shoulder[1]-Math.cos(angle)*Math.sqrt(upperLength**2-.025**2),shoulder[2]-Math.sin(angle)*Math.sqrt(upperLength**2-.025**2)];
    const wrist=[elbow[0],elbow[1]-Math.cos(angle-flex)*foreLength,elbow[2]-Math.sin(angle-flex)*foreLength];
    return{shoulder,elbow,wrist};
  }
  const BED={x:-3.5,z:STATION.z-1.5},BED_SLEEP_SECONDS=8,FERRY={x:BED.x+1.25,z:BED.z+5000},COAST_Z=FERRY.z-140,DREAM_SECONDS=12;
  const EARTH_DAY_SECONDS=1200,EARTH_NIGHT_SECONDS=600,EARTH_CYCLE_SECONDS=1800;
  function earthStep(s,dt){if(Number.isFinite(dt)&&dt>0)s.earthTime=(Number.isFinite(s.earthTime)?s.earthTime:0)+dt;}
  function earthLighting(s){
    const elapsed=Math.max(0,Number.isFinite(s.earthTime)?s.earthTime:0),seconds=elapsed%EARTH_CYCLE_SECONDS,isDay=seconds<EARTH_DAY_SECONDS;
    const phaseTime=isDay?seconds:seconds-EARTH_DAY_SECONDS,duration=isDay?EARTH_DAY_SECONDS:EARTH_NIGHT_SECONDS;
    const smooth=t=>{t=clamp(t,0,1);return t*t*(3-2*t);};
    const daylight=isDay?smooth(Math.min(phaseTime,duration-phaseTime)/90):0;
    const twilight=isDay?1-daylight:1-smooth(Math.min(phaseTime,duration-phaseTime)/45);
    const angle=phaseTime/duration*Math.PI,direction=[Math.cos(angle),Math.sin(angle),.4],length=Math.hypot(...direction);
    const hours=(isDay?6+phaseTime/duration*12:18+phaseTime/duration*12)%24;
    const minutes=Math.floor(hours*60+1e-7),clock=String(Math.floor(minutes/60)).padStart(2,'0')+':'+String(minutes%60).padStart(2,'0');
    return{seconds,isDay,day:Math.floor(elapsed/EARTH_CYCLE_SECONDS)+1,daylight,twilight,direction:direction.map(n=>n/length),
      phase:isDay?(phaseTime<90?'DAWN':phaseTime>=duration-90?'DUSK':'DAYLIGHT'):'NIGHT',clock,remaining:duration-phaseTime};
  }
  const hash=(x,z,seed)=>{let n=Math.imul(x^seed,374761393)^Math.imul(z,668265263);n=Math.imul(n^(n>>>13),1274126177);return ((n^(n>>>16))>>>0)/4294967295;};
  function noise(x,z,seed){const a=Math.floor(x),b=Math.floor(z),u=x-a,v=z-b,s=u*u*(3-2*u),t=v*v*(3-2*v),mix=(a,b,q)=>a+(b-a)*q;return mix(mix(hash(a,b,seed),hash(a+1,b,seed),s),mix(hash(a,b+1,seed),hash(a+1,b+1,seed),s),t)*2-1;}
  function height(x,z,seed){const raw=noise(x/480,z/480,seed)*13+noise(x/120,z/120,seed+1)*2.8+noise(x/30,z/30,seed+2)*.62+noise(x/6,z/6,seed+3)*.075+Math.sin(x*.17+z*.07)*.055;const shore=clamp((z-(COAST_Z-200))/200,0,1),land=raw*(1-shore)+3*shore;return z>COAST_Z?3-12*clamp((z-COAST_Z)/40,0,1):land;}
  function chunkProps(cx,cz,seed){const props=[];if(cz*128>COAST_Z-128)return props;for(let i=0;i<3;i++){const x=(cx+hash(cx+i*23,cz,seed+21))*128,z=(cz+hash(cx,cz+i*17,seed+42))*128;if(Math.abs(x)<10&&z>-25&&z<1740)continue;const r=hash(cx+i,cz,seed+62)*1.8+.65;props.push({x,z,r,y:height(x,z,seed),type:hash(cx-i,cz+i,seed+6)>.45?'ice':'rock'});}return props;}
  function staminaStep(state,wantsSprint,moving,dt){
    if(state.exhausted&&state.stamina>=1-1e-8)state.exhausted=false;
    if(state.exhausted){state.stamina=Math.min(100,state.stamina+100/60*dt);if(state.stamina>=1-1e-8)state.exhausted=false;return WALK;}
    if(wantsSprint&&moving&&state.stamina>0){state.stamina=Math.max(0,state.stamina-100/30*dt);if(state.stamina<=1e-8){state.stamina=0;state.exhausted=true;}return SPRINT;}
    state.stamina=Math.min(100,state.stamina+100/60*dt);return WALK;
  }
  function seedFromId(id){let n=2166136261;for(const c of id)n=Math.imul(n^c.charCodeAt(0),16777619);return n>>>0;}
  function fresh(seed){return{eris:null,ecology:null,seed,x:0,z:0,yaw:0,stamina:100,exhausted:false,playTime:0,earthTime:0,james:{x:0,z:2.8,yaw:Math.PI},jamesIntroductionDone:false,introIndex:0,jamesIntroVoiceTime:0,jamesCarVoiceTime:0,jamesCarQuoteShown:false,jamesCarQuoteRemaining:0,car:null,stationFound:false,stationDialogueDone:false,stationDialogueActive:false,stationDialogueIndex:0,jamesStationVoiceTime:0,jamesSupplyVoiceTime:0,jamesFerryVoiceTime:0,bedMaterialsCollected:false,bedBuilt:false,bedRested:false,bedSleeping:false,bedSleepProgress:0,dreamActive:false,dreamDone:false,dreamTime:0,dreamIndex:0,dreamChar:0,dreamVoiceTime:0,betrayalStage:'unseen',betrayalIndex:0,betrayalLineTime:0,betrayalSpeechChar:0,betrayalVoiceTime:0,betrayalTime:0,africaStage:'unseen',africaTime:0,africaStarted:false,friendQuest:'available',friendDialogueActive:false,friendDialogueDone:false,friendDialogueIndex:0,friendDialogueTime:0,friendVoiceTime:0,friend:{x:80,z:180,yaw:3.141592653589793},spaceshipFound:false,space:null,ferryVoyageTime:0,jamesGone:false,ferryEscaped:false,inventoryUnlocked:false,inventory:emptyInventory(),stationSalvaged:false,depotSalvaged:false,suitInsulated:false,ferryFound:false,hazardStage:'unseen',hazardLessonIndex:0,hazardVoiceTime:0,superBlizzard:false,stormRemaining:300,nextBlizzardRemaining:300,blizzardCycle:0,stormClearCount:0,ferryDialoguePending:false,ferryDialogueActive:false,ferryDialogueIndex:0,ferryDialogueDone:false,ferryPlanKnown:false,supplyDialoguePending:false,supplyDialogueActive:false,supplyDialogueIndex:0,supplyDialogueDone:false,suppliesPlanKnown:false,suppliesCollected:false,suitHeat:100,cameraYaw:0,cameraPitch:.30};}
  function restored(progress,id){
    const s=fresh(seedFromId(id)),w=progress?.antarctica;if(!w||typeof w!=='object')return s;
    const numeric=(k,a,b)=>{if(Number.isFinite(w[k]))s[k]=clamp(w[k],a,b);};
    for(const k of ['x','z'])numeric(k,-1e7,1e7);for(const k of ['yaw','cameraYaw'])numeric(k,-1e6,1e6);
    s.earthTime=Number.isFinite(w.earthTime)?clamp(w.earthTime,0,1e10):Number.isFinite(w.playTime)?clamp(w.playTime,0,1e10):0;numeric('cameraPitch',.08,.9);numeric('stamina',0,100);numeric('playTime',0,1e10);numeric('jamesCarQuoteRemaining',0,120);numeric('jamesIntroVoiceTime',0,120);numeric('jamesCarVoiceTime',0,120);numeric('jamesStationVoiceTime',0,120);numeric('jamesSupplyVoiceTime',0,120);numeric('jamesFerryVoiceTime',0,120);numeric('bedSleepProgress',0,BED_SLEEP_SECONDS);for(const key of ['bedMaterialsCollected','bedBuilt','bedRested'])s[key]=!!w[key];if(s.bedRested)s.bedBuilt=true;if(s.bedBuilt)s.bedMaterialsCollected=true;numeric('hazardVoiceTime',0,120);numeric('hazardLessonIndex',0,4);s.hazardLessonIndex=Math.floor(s.hazardLessonIndex);s.hazardStage=['warning','lesson','complete'].includes(w.hazardStage)?w.hazardStage:'unseen';s.superBlizzard=!!w.superBlizzard;numeric('stormRemaining',0,300);numeric('nextBlizzardRemaining',0,300);numeric('blizzardCycle',0,1e7);numeric('stormClearCount',0,1e7);numeric('supplyDialogueIndex',0,9);s.supplyDialogueIndex=Math.floor(s.supplyDialogueIndex);for(const key of ['supplyDialoguePending','supplyDialogueActive','supplyDialogueDone','suppliesPlanKnown','suppliesCollected'])s[key]=!!w[key];if(s.hazardStage==='complete'&&!s.superBlizzard&&!s.supplyDialogueDone&&!s.suppliesPlanKnown&&!('supplyDialoguePending' in w))s.supplyDialoguePending=true;numeric('ferryDialogueIndex',0,4);s.ferryDialogueIndex=Math.floor(s.ferryDialogueIndex);for(const key of ['ferryDialoguePending','ferryDialogueActive','ferryDialogueDone','ferryPlanKnown'])s[key]=!!w[key];if(s.ferryDialogueDone){s.ferryDialoguePending=false;}else if(s.blizzardCycle>=1&&s.superBlizzard&&!('ferryDialoguePending' in w))s.ferryDialoguePending=true;numeric('suitHeat',0,100);numeric('introIndex',0,4);s.introIndex=Math.floor(s.introIndex);
    if(Number.isSafeInteger(w.seed))s.seed=w.seed>>>0;s.exhausted=!!w.exhausted;s.jamesIntroductionDone=!!w.jamesIntroductionDone;s.stationFound=!!w.stationFound;s.stationDialogueDone=!!w.stationDialogueDone;s.stationDialogueActive=s.stationFound&&!s.stationDialogueDone&&!!w.stationDialogueActive;numeric('stationDialogueIndex',0,9);s.stationDialogueIndex=Math.floor(s.stationDialogueIndex);s.jamesCarQuoteShown=!!w.jamesCarQuoteShown;if(!s.jamesCarQuoteShown)s.jamesCarQuoteRemaining=0;
    if(Number.isFinite(w.james?.x)&&Number.isFinite(w.james?.z))s.james={x:clamp(w.james.x,-1e7,1e7),z:clamp(w.james.z,-1e7,1e7),yaw:Number.isFinite(w.james.yaw)?w.james.yaw:Math.PI};
    const car=w.car;
    if(car&&['x','z','yaw','startX','startZ','elapsed'].every(k=>Number.isFinite(car[k]))){
      const number=(key,fallback,low,high)=>Number.isFinite(car[key])?clamp(car[key],low,high):fallback;
      s.car={x:clamp(car.x,-1e7,1e7),z:clamp(car.z,-1e7,1e7),yaw:clamp(car.yaw,-1e6,1e6),startX:clamp(car.startX,-1e7,1e7),startZ:clamp(car.startZ,-1e7,1e7),elapsed:clamp(car.elapsed,0,1e7),driving:!!car.driving&&s.jamesIntroductionDone,arrived:!!car.arrived,driver:car.driver==='player'?'player':'james',speed:number('speed',0,-CAR_REVERSE_SPEED,CAR_MAX_SPEED),steer:number('steer',0,-1,1),odometer:number('odometer',0,0,1e10),routeStartElapsed:number('routeStartElapsed',0,0,1e7),routeDuration:number('routeDuration',CAR_TRIP_SECONDS,.01,1e7)};
      if(s.car.arrived||(s.car.driver==='james'&&s.car.elapsed>=s.car.routeStartElapsed+s.car.routeDuration))s.car.driving=false;
      const goal=carDestination(s),routeDistance=Math.hypot(s.car.startX-goal.x,s.car.startZ-goal.z);
      if(s.car.driving&&s.car.driver==='james'&&routeDistance/s.car.routeDuration>CAR_MAX_SPEED){const remaining=Math.max(.01,s.car.routeStartElapsed+s.car.routeDuration-s.car.elapsed);s.car.startX=s.car.x;s.car.startZ=s.car.z;s.car.routeStartElapsed=s.car.elapsed;s.car.routeDuration=Math.max(remaining,Math.hypot(s.car.x-goal.x,s.car.z-goal.z)/CAR_MAX_SPEED);}
      if(!s.car.driving)s.car.speed=0;
    }
    for(const key of ['dreamDone','stationSalvaged','depotSalvaged','suitInsulated','ferryFound'])s[key]=!!w[key];numeric('dreamTime',0,60);numeric('dreamIndex',0,4);numeric('dreamChar',0,1000);numeric('dreamVoiceTime',0,300);s.dreamIndex=Math.floor(s.dreamIndex);s.dreamChar=Math.floor(s.dreamChar);
    if(s.bedRested)s.dreamDone=true;
    s.inventoryUnlocked=s.bedRested;
    if(w.inventory&&typeof w.inventory==='object'){for(const key of Object.keys(s.inventory))s.inventory[key]=Number.isFinite(w.inventory[key])?Math.floor(clamp(w.inventory[key],0,999)):0;}else if(s.inventoryUnlocked){s.inventoryUnlocked=false;grantWakeInventory(s);}
    s.bedSleeping=!!w.bedSleeping&&s.bedBuilt&&s.ferryDialogueDone&&inShelter(s)&&!s.car?.driving;
    s.dreamActive=s.bedSleeping&&!s.dreamDone&&!!w.dreamActive;if(!s.dreamActive)s.dreamTime=0;
    if(!s.bedSleeping)s.bedSleepProgress=0;
    s.betrayalStage=s.bedRested&&['dialogue','action','complete'].includes(w.betrayalStage)?w.betrayalStage:'unseen';numeric('betrayalIndex',0,14);s.betrayalIndex=Math.floor(s.betrayalIndex);numeric('betrayalLineTime',0,1e5);numeric('betrayalSpeechChar',0,10000);s.betrayalSpeechChar=Math.floor(s.betrayalSpeechChar);numeric('betrayalTime',0,27);numeric('ferryVoyageTime',0,1e7);s.ferryEscaped=s.betrayalStage==='complete';s.jamesGone=s.ferryEscaped||(s.betrayalStage==='action'&&s.betrayalTime>=8.5);if(s.betrayalStage!=='unseen'){s.ferryFound=true;s.bedSleeping=false;s.dreamActive=false;if(s.car)s.car.driving=false;}
    numeric('betrayalVoiceTime',0,300);s.africaStage=s.ferryEscaped&&['voyage','visitor','title','briefing','complete'].includes(w.africaStage)?w.africaStage:'unseen';numeric('africaTime',0,s.africaStage==='voyage'?7:6);s.africaStarted=s.ferryEscaped&&['title','briefing','complete'].includes(s.africaStage);s.friendQuest=s.africaStarted&&['accepted','recruited','defected'].includes(w.friendQuest)?w.friendQuest:'available';s.friendDialogueDone=s.africaStarted&&(!!w.friendDialogueDone||s.friendQuest==='recruited');s.friendDialogueActive=s.africaStarted&&s.africaStage==='complete'&&!!w.friendDialogueActive;numeric('friendDialogueIndex',0,4);s.friendDialogueIndex=Math.floor(s.friendDialogueIndex);numeric('friendDialogueTime',0,1e5);numeric('friendVoiceTime',0,300);s.spaceshipFound=s.africaStarted&&!!w.spaceshipFound;if(s.africaStarted&&w.friend&&Number.isFinite(w.friend.x)&&Number.isFinite(w.friend.z))s.friend={x:clamp(w.friend.x,-1e7,1e7),z:clamp(w.friend.z,-1e7,1e7),yaw:Number.isFinite(w.friend.yaw)?clamp(w.friend.yaw,-1e6,1e6):Math.PI};
    if(typeof NVSpace!=='undefined')s.space=NVSpace.restore(w.space,s);
    if(typeof NVEcology!=='undefined')s.ecology=NVEcology.restore(w.ecology);
    if(typeof NVEris!=='undefined')s.eris=NVEris.restore(w.eris);
    return s;
  }
  function snapshot(s){return{eris:typeof NVEris!=='undefined'?NVEris.snapshot(s):s.eris,ecology:typeof NVEcology!=='undefined'?NVEcology.snapshot(s):s.ecology,seed:s.seed,x:s.x,z:s.z,yaw:s.yaw,stamina:s.stamina,exhausted:s.exhausted,playTime:s.playTime,earthTime:s.earthTime,james:{...s.james},jamesIntroductionDone:s.jamesIntroductionDone,introIndex:s.introIndex,jamesIntroVoiceTime:s.jamesIntroVoiceTime,jamesCarVoiceTime:s.jamesCarVoiceTime,jamesCarQuoteShown:s.jamesCarQuoteShown,jamesCarQuoteRemaining:s.jamesCarQuoteRemaining,car:s.car?{...s.car}:null,stationFound:s.stationFound,stationDialogueDone:s.stationDialogueDone,stationDialogueActive:s.stationDialogueActive,stationDialogueIndex:s.stationDialogueIndex,jamesStationVoiceTime:s.jamesStationVoiceTime,jamesSupplyVoiceTime:s.jamesSupplyVoiceTime,jamesFerryVoiceTime:s.jamesFerryVoiceTime,bedMaterialsCollected:s.bedMaterialsCollected,bedBuilt:s.bedBuilt,bedRested:s.bedRested,bedSleeping:s.bedSleeping,bedSleepProgress:s.bedSleepProgress,dreamActive:s.dreamActive,dreamDone:s.dreamDone,dreamTime:s.dreamTime,dreamIndex:s.dreamIndex,dreamChar:s.dreamChar,dreamVoiceTime:s.dreamVoiceTime,betrayalStage:s.betrayalStage,betrayalIndex:s.betrayalIndex,betrayalLineTime:s.betrayalLineTime,betrayalSpeechChar:s.betrayalSpeechChar,betrayalVoiceTime:s.betrayalVoiceTime,africaStage:s.africaStage,africaTime:s.africaTime,africaStarted:s.africaStarted,friendQuest:s.friendQuest,friendDialogueActive:s.friendDialogueActive,friendDialogueDone:s.friendDialogueDone,friendDialogueIndex:s.friendDialogueIndex,friendDialogueTime:s.friendDialogueTime,friendVoiceTime:s.friendVoiceTime,friend:{...s.friend},spaceshipFound:s.spaceshipFound,space:s.space?JSON.parse(JSON.stringify(s.space)):null,betrayalTime:s.betrayalTime,ferryVoyageTime:s.ferryVoyageTime,jamesGone:s.jamesGone,ferryEscaped:s.ferryEscaped,inventoryUnlocked:s.inventoryUnlocked,inventory:{...s.inventory},stationSalvaged:s.stationSalvaged,depotSalvaged:s.depotSalvaged,suitInsulated:s.suitInsulated,ferryFound:s.ferryFound,hazardStage:s.hazardStage,hazardLessonIndex:s.hazardLessonIndex,hazardVoiceTime:s.hazardVoiceTime,superBlizzard:s.superBlizzard,stormRemaining:s.stormRemaining,nextBlizzardRemaining:s.nextBlizzardRemaining,blizzardCycle:s.blizzardCycle,stormClearCount:s.stormClearCount,ferryDialoguePending:s.ferryDialoguePending,ferryDialogueActive:s.ferryDialogueActive,ferryDialogueIndex:s.ferryDialogueIndex,ferryDialogueDone:s.ferryDialogueDone,ferryPlanKnown:s.ferryPlanKnown,supplyDialoguePending:s.supplyDialoguePending,supplyDialogueActive:s.supplyDialogueActive,supplyDialogueIndex:s.supplyDialogueIndex,supplyDialogueDone:s.supplyDialogueDone,suppliesPlanKnown:s.suppliesPlanKnown,suppliesCollected:s.suppliesCollected,suitHeat:s.suitHeat,cameraYaw:s.cameraYaw,cameraPitch:s.cameraPitch};}
  function inShelter(s){return !s.africaStarted&&Math.abs(s.x-STATION.x)<5.6&&Math.abs(s.z-STATION.z)<5.0;}
  function hazardStep(s,dt){
    if(s.africaStarted||s.hazardStage!=='complete'||dt<=0)return false;
    let left=dt,recovered=false;
    while(left>1e-8){
      const storm=s.superBlizzard,timer=storm?s.stormRemaining:s.nextBlizzardRemaining,step=Math.min(left,Math.max(0,timer));
      const exposed=storm&&!inShelter(s)&&!s.car?.driving;
      s.suitHeat=clamp(s.suitHeat+(exposed?-100/180*(s.suitInsulated?.7:1):inShelter(s)?1.2:s.car?.driving?0.6:0)*step,0,100);
      left-=step;
      if(storm){s.stormRemaining=Math.max(0,timer-step);if(s.stormRemaining<=1e-8){s.stormRemaining=0;s.superBlizzard=false;s.nextBlizzardRemaining=300;s.stormClearCount++;if(!s.supplyDialogueDone&&!s.suppliesPlanKnown)s.supplyDialoguePending=true;}}
      else{s.nextBlizzardRemaining=Math.max(0,timer-step);if(s.nextBlizzardRemaining<=1e-8){s.nextBlizzardRemaining=0;s.superBlizzard=true;s.stormRemaining=300;s.blizzardCycle++;if(s.blizzardCycle>=1&&!s.ferryDialogueDone&&!s.ferryDialogueActive)s.ferryDialoguePending=true;}}
      if(s.suitHeat<=0){s.x=STATION.x;s.z=STATION.z;s.yaw=0;s.james={x:s.x+1.7,z:s.z+1.5,yaw:Math.PI};s.suitHeat=35;recovered=true;}
    }
    return recovered;
  }
  function bedAvailable(s){return s.ferryDialogueDone&&inShelter(s)&&!s.car?.driving&&!s.bedSleeping;}
  function collectBedMaterials(s){if(!bedAvailable(s)||s.bedMaterialsCollected)return false;s.bedMaterialsCollected=true;return true;}
  function constructBed(s){if(!bedAvailable(s)||!s.bedMaterialsCollected||s.bedBuilt)return false;s.bedBuilt=true;return true;}
  function beginBedSleep(s){if(!bedAvailable(s)||!s.bedBuilt||Math.hypot(s.x-BED.x,s.z-BED.z)>1.8)return false;s.bedSleeping=true;s.bedSleepProgress=0;return true;}
  function bedSleepStep(s,dt){
    if(!s.bedSleeping||s.dreamActive||!Number.isFinite(dt)||dt<=0)return false;
    if(!s.dreamDone&&s.bedSleepProgress<3){const step=Math.min(dt,3-s.bedSleepProgress);s.bedSleepProgress+=step;s.playTime+=step;if(s.bedSleepProgress>=3-1e-8){s.dreamActive=true;s.dreamTime=0;}return false;}
    if(!s.dreamDone){s.dreamActive=true;s.dreamTime=0;return false;}
    const elapsed=Math.min(dt,Math.max(0,BED_SLEEP_SECONDS-s.bedSleepProgress));s.bedSleepProgress+=elapsed;s.playTime+=elapsed;
    if(s.bedSleepProgress<BED_SLEEP_SECONDS-1e-8)return false;
    // Rest passes world time to the next dawn; Antarctic weather keeps its schedule.
    const skip=EARTH_CYCLE_SECONDS-(s.earthTime%EARTH_CYCLE_SECONDS);earthStep(s,skip);hazardStep(s,skip);
    s.bedSleeping=false;s.bedSleepProgress=0;s.bedRested=true;grantWakeInventory(s);s.stamina=100;s.exhausted=false;s.suitHeat=100;
    s.x=BED.x+1.25;s.z=BED.z;s.yaw=0;s.james={x:s.x+1.4,z:s.z+1.5,yaw:Math.PI};return true;
  }
  function emptyInventory(){return{ration:0,water:0,powerCell:0,scrap:0,fabric:0,heatPack:0,repairKit:0};}
  function grantWakeInventory(s){if(s.inventoryUnlocked)return;s.inventoryUnlocked=true;Object.assign(s.inventory,{ration:3,water:3,powerCell:2,scrap:6,fabric:4});}
  const RECIPES={heatPack:{cost:{fabric:1,powerCell:1},item:'heatPack'},repairKit:{cost:{scrap:2,fabric:1},item:'repairKit'},insulatedSuit:{cost:{scrap:2,fabric:2},upgrade:true}};
  function craftItem(s,key){const r=RECIPES[key];if(!s.inventoryUnlocked||s.bedSleeping||s.car?.driving||!r||(r.upgrade&&s.suitInsulated)||Object.entries(r.cost).some(([k,n])=>s.inventory[k]<n))return false;for(const [k,n] of Object.entries(r.cost))s.inventory[k]-=n;if(r.upgrade)s.suitInsulated=true;else s.inventory[r.item]++;return true;}
  function useItem(s,key){if(!s.inventoryUnlocked||s.bedSleeping||s.inventory[key]<=0)return false;const energy=key==='ration'?35:key==='water'?20:0,heat=key==='powerCell'?40:key==='heatPack'?65:key==='repairKit'?100:0;if(!(energy||heat)||(energy&&s.stamina>=100)||(heat&&s.suitHeat>=100))return false;s.inventory[key]--;s.stamina=clamp(s.stamina+energy,0,100);s.suitHeat=clamp(s.suitHeat+heat,0,100);if(s.stamina>=100)s.exhausted=false;return true;}
  function salvageMaterials(s){if(s.africaStarted||!s.inventoryUnlocked||s.bedSleeping||s.car?.driving)return false;const station=inShelter(s),depot=Math.hypot(s.x-DEPOT.x,s.z-DEPOT.z)<9;if(station&&!s.stationSalvaged){s.stationSalvaged=true;s.inventory.scrap+=4;s.inventory.fabric+=3;return true;}if(depot&&!s.depotSalvaged){s.depotSalvaged=true;s.inventory.scrap+=6;s.inventory.fabric+=3;s.inventory.powerCell+=2;s.inventory.ration+=3;s.inventory.water+=3;return true;}return false;}
  function finishDream(s){if(!s.dreamActive)return false;s.dreamActive=false;s.dreamDone=true;s.dreamTime=0;s.dreamVoiceTime=0;return true;}
  function advanceDream(s){if(!s.dreamActive)return false;if(s.dreamIndex>=4)return finishDream(s);s.dreamIndex++;s.dreamTime=0;s.dreamChar=0;s.dreamVoiceTime=0;return false;}
  function dreamStep(s,dt,auto=true){if(!s.dreamActive||!Number.isFinite(dt)||dt<=0)return false;const step=auto?Math.min(dt,DREAM_SECONDS-s.dreamTime):dt;s.dreamTime+=Math.max(0,step);s.playTime+=Math.max(0,step);if(auto&&s.dreamTime>=DREAM_SECONDS)return advanceDream(s);return false;}
  function routeDistance(s){return Math.max(0,Math.hypot(s.x-STATION.x,s.z-STATION.z)-STATION.radius);}
  function onPier(x,z){return (Math.abs(x-FERRY.x)<4&&z>=COAST_Z-15&&z<=FERRY.z+16)||(x>=FERRY.x-4&&x<=FERRY.x+32&&Math.abs(z-FERRY.z)<5);}
  function waterAt(x,z){return z>COAST_Z+12&&!onPier(x,z);}
  function ground(x,z,seed){if(onPier(x,z))return 3.15;const base=height(STATION.x,STATION.z,seed),dx=x-STATION.x,dz=z-STATION.z;if(Math.abs(dx)<6&&Math.abs(dz)<5.5)return base+.85;if(Math.abs(dx)<1.3&&dz>=-11&&dz<=-5.5)return base+.85*(1-(Math.abs(dz)-5.5)/5.5);return height(x,z,seed);}
  function avoid(x,z,seed,radius=.32){if(waterAt(x,z))z=COAST_Z+8;const cx=Math.floor(x/128),cz=Math.floor(z/128);for(let a=cx-1;a<=cx+1;a++)for(let b=cz-1;b<=cz+1;b++)for(const p of chunkProps(a,b,seed)){let dx=x-p.x,dz=z-p.z,d=Math.hypot(dx,dz),r=p.r*.75+radius;if(d<r){if(d<1e-5){dx=1;dz=0;d=1;}x=p.x+dx/d*r;z=p.z+dz/d*r;}}const dx=x-STATION.x,dz=z-STATION.z;if(Math.abs(dx)<6.3&&Math.abs(dz)<5.8&&!(Math.abs(dx)<.85&&dz<0)&&!(Math.abs(dx)<5.7&&Math.abs(dz)<5.1)){if(Math.abs(dx)/6.3>Math.abs(dz)/5.8)x=STATION.x+Math.sign(dx)*6.32;else z=STATION.z+Math.sign(dz)*5.82;}return{x,z};}
  function knee(hip,ankle,l1,l2){const dx=ankle[0]-hip[0],dy=ankle[1]-hip[1],dz=ankle[2]-hip[2],raw=Math.hypot(dx,dy,dz),d=clamp(raw,.02,l1+l2-.001),u=[dx/raw,dy/raw,dz/raw],along=(l1*l1-l2*l2+d*d)/(2*d),bend=Math.sqrt(Math.max(0,l1*l1-along*along)),v=[0,-u[2],u[1]],vn=Math.hypot(...v)||1;return hip.map((h,i)=>h+u[i]*along-v[i]/vn*bend);}
  function unlockCar(s){if(s.africaStarted||s.car||!s.jamesCarQuoteShown)return;const p=avoid(s.x+Math.cos(s.yaw)*3.5+Math.sin(s.yaw)*2,s.z-Math.sin(s.yaw)*3.5+Math.cos(s.yaw)*2,s.seed,2.5);s.car={x:p.x,z:p.z,yaw:0,startX:p.x,startZ:p.z,elapsed:0,driving:false,arrived:false,driver:'james',speed:0,steer:0,odometer:0,routeStartElapsed:0,routeDuration:Math.max(CAR_TRIP_SECONDS,Math.hypot(p.x-STATION.x,p.z-(STATION.z-16))/CAR_MAX_SPEED)};}
  function carDestination(s){return s.bedRested?{x:FERRY.x,z:FERRY.z-15}:{x:STATION.x,z:STATION.z-16};}
  function syncCarPassengers(s){const car=s.car;s.x=car.x;s.z=car.z;s.yaw=car.yaw;s.james={x:car.x,z:car.z,yaw:car.yaw};}
  function boardCar(s){const car=s.car;if(!s.jamesIntroductionDone||!car||car.driving||Math.hypot(s.x-car.x,s.z-car.z)>6)return false;if(car.arrived){car.driver='player';car.arrived=false;}car.driving=true;syncCarPassengers(s);return true;}
  function leaveCar(s){const car=s.car;if(!car)return;car.driving=false;car.speed=0;car.steer=0;s.x=car.x+Math.cos(car.yaw)*2.8;s.z=car.z-Math.sin(car.yaw)*2.8;s.yaw=car.yaw;s.james={x:car.x-Math.cos(car.yaw)*2.8,z:car.z+Math.sin(car.yaw)*2.8,yaw:car.yaw};}
  function switchCarDriver(s){const car=s.car;if(!car?.driving)return false;car.driver=car.driver==='player'?'james':'player';car.steer=0;if(car.driver==='james'){car.startX=car.x;car.startZ=car.z;car.routeStartElapsed=car.elapsed;const goal=carDestination(s),distance=Math.hypot(car.x-goal.x,car.z-goal.z);car.routeDuration=Math.max(1,CAR_TRIP_SECONDS-car.elapsed,distance/CAR_MAX_SPEED);car.arrived=false;}return true;}
  function finishCarArrival(s){s.car.arrived=true;if(s.bedRested)s.ferryFound=true;else s.stationFound=true;leaveCar(s);return true;}
  function carStep(s,dt){
    const car=s.car;if(!car?.driving||car.driver==='player')return false;
    const goal=carDestination(s);if(Math.hypot(s.x-goal.x,s.z-goal.z)<=.1)return finishCarArrival(s);
    const end=car.routeStartElapsed+car.routeDuration;car.elapsed=Math.min(end,car.elapsed+dt);const t=clamp((car.elapsed-car.routeStartElapsed)/car.routeDuration,0,1),tx=goal.x,tz=goal.z,oldX=car.x,oldZ=car.z;
    car.x=car.startX+(tx-car.startX)*t;car.z=car.startZ+(tz-car.startZ)*t;car.yaw=Math.atan2(tx-car.startX,tz-car.startZ);const moved=Math.hypot(car.x-oldX,car.z-oldZ);car.speed=dt>0?Math.min(CAR_MAX_SPEED,moved/dt):0;car.odometer+=moved;
    syncCarPassengers(s);staminaStep(s,false,false,dt);s.playTime+=dt;if(car.elapsed>=end-1e-8){car.elapsed=end;return finishCarArrival(s);}return false;
  }
  function stationEntry(x,z,nx,nz){const dx=nx-x,dz=nz-z,ox=x-STATION.x,oz=z-STATION.z,r=STATION.radius-2,a=dx*dx+dz*dz,b=2*(ox*dx+oz*dz),c=ox*ox+oz*oz-r*r;if(c<=0)return 0;if(a<1e-10)return null;const disc=b*b-4*a*c;if(disc<0)return null;const t=(-b-Math.sqrt(disc))/(2*a);return t>=0&&t<=1?t:null;}
  function manualCarStep(s,dt,input={}){
    const car=s.car;if(!car?.driving||car.driver!=='player'||dt<=0)return false;
    const approach=(v,target,amount)=>v<target?Math.min(target,v+amount):Math.max(target,v-amount),steer=clamp(Number(input.steer)||0,-1,1);
    let left=dt;while(left>1e-8){const step=Math.min(.02,left);left-=step;
      if(input.handbrake)car.speed=approach(car.speed,0,40*step);
      else if(input.brake)car.speed=car.speed>.1?approach(car.speed,0,24*step):Math.max(-CAR_REVERSE_SPEED,car.speed-5*step);
      else if(input.throttle)car.speed=car.speed<-.1?approach(car.speed,0,24*step):Math.min(CAR_MAX_SPEED,car.speed+12*step);
      else car.speed=approach(car.speed,0,2.2*step);
      car.speed=clamp(car.speed,-CAR_REVERSE_SPEED,CAR_MAX_SPEED);car.steer+= (steer-car.steer)*Math.min(1,step*8);
      car.yaw+=car.speed/3.2*Math.tan(car.steer*.48)/(1+Math.abs(car.speed)*.17)*step;
      const nx=car.x+Math.sin(car.yaw)*car.speed*step,nz=car.z+Math.cos(car.yaw)*car.speed*step;
      const entry=s.stationFound?null:stationEntry(car.x,car.z,nx,nz);
      if(entry!==null){car.odometer+=Math.hypot(nx-car.x,nz-car.z)*entry;car.x+=(nx-car.x)*entry;car.z+=(nz-car.z)*entry;syncCarPassengers(s);s.playTime+=dt;staminaStep(s,false,false,dt);return finishCarArrival(s);}
      const allowed=avoid(nx,nz,s.seed,2.5),collision=Math.hypot(allowed.x-nx,allowed.z-nz)>.001;car.odometer+=Math.hypot(allowed.x-car.x,allowed.z-car.z);car.x=allowed.x;car.z=allowed.z;if(collision)car.speed=0;
    }
    syncCarPassengers(s);staminaStep(s,false,false,dt);s.playTime+=dt;return false;
  }
  return{sprintArm,gaitSettings,gaitAdvance,gaitFoot,FERRY,COAST_Z,DREAM_SECONDS,onPier,waterAt,emptyInventory,grantWakeInventory,RECIPES,craftItem,useItem,salvageMaterials,dreamStep,advanceDream,finishDream,BED,BED_SLEEP_SECONDS,collectBedMaterials,constructBed,beginBedSleep,bedSleepStep,EARTH_DAY_SECONDS,EARTH_NIGHT_SECONDS,EARTH_CYCLE_SECONDS,earthStep,earthLighting,WALK,SPRINT,STATION,DEPOT,STRIDE_WALK,STRIDE_RUN,CAR_TRIP_SECONDS,MPH_TO_MPS,CAR_MAX_SPEED,CAR_REVERSE_SPEED,clamp,hash,height,noise,chunkProps,staminaStep,seedFromId,fresh,restored,snapshot,inShelter,hazardStep,routeDistance,ground,avoid,knee,unlockCar,boardCar,leaveCar,carStep,switchCarDriver,manualCarStep,stationEntry};
})();
if(typeof module!=='undefined'&&module.exports)module.exports=NVAntarctica;

