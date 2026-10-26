const NVAfrica=(()=>{
  const A=typeof NVAntarctica!=='undefined'?NVAntarctica:require('./antarctica_core.js');
  const SHIP={x:0,z:A.WALK*600+8},CAMP={x:80,z:180},ARRIVAL_SECONDS=7,TITLE_SECONDS=6;
  function modal(s){return s.ferryEscaped&&s.africaStage!=='complete';}
  function ensureJourney(s){if(!s.ferryEscaped||s.africaStage!=='unseen')return false;s.africaStage='voyage';s.africaTime=0;return true;}
  function arrive(s){s.africaStarted=true;s.africaStage='title';s.africaTime=0;s.x=0;s.z=0;s.yaw=0;s.cameraYaw=0;s.cameraPitch=.32;s.earthTime=Math.ceil(s.earthTime/A.EARTH_CYCLE_SECONDS)*A.EARTH_CYCLE_SECONDS+300;s.stamina=100;s.exhausted=false;s.suitHeat=100;s.superBlizzard=false;s.jamesGone=true;if(s.car)s.car.driving=false;}
  function transitionStep(s,dt){if(!Number.isFinite(dt)||dt<=0)return false;ensureJourney(s);if(s.africaStage==='voyage'){s.africaTime=Math.min(ARRIVAL_SECONDS,s.africaTime+dt);if(s.africaTime>=ARRIVAL_SECONDS){s.africaStage='visitor';s.africaTime=0;return true;}}else if(s.africaStage==='title'){s.africaTime=Math.min(TITLE_SECONDS,s.africaTime+dt);s.playTime+=dt;if(s.africaTime>=TITLE_SECONDS){s.africaStage='briefing';s.africaTime=0;}}return false;}
  function choose(s,friend){if(s.africaStage!=='briefing')return false;s.friendQuest=friend?'accepted':'available';s.africaStage='complete';s.africaTime=0;return true;}
  function acceptFriend(s){if(!s.africaStarted||s.africaStage!=='complete'||s.friendQuest==='recruited')return false;s.friendQuest='accepted';return true;}
  const ORION_QUOTES=[
    "Well, look who made it to the coast! Orion Mascar. Most people call me Orion. You look like someone who could use a friend.",
    "This armour makes me look serious, I know. But I would rather help a stranger than stand around waiting for someone to give me permission.",
    "There is a spaceship up ahead. I have been keeping an eye on it, and I was just wondering who might be brave enough to take it beyond Earth.",
    "If you are asking me to come along, my answer is yes. Gladly! I will watch your back, share what I have, and probably get us into a little trouble.",
    "Then it is settled, my friend. Orion Mascar, at your side. Let us find that ship and give the stars a story worth telling."
  ];
  function beginFriendDialogue(s,replay=false){if(!s.africaStarted||s.africaStage!=='complete'||s.friendDialogueActive||(!replay&&s.friendDialogueDone)||Math.hypot(s.x-s.friend.x,s.z-s.friend.z)>6)return false;s.friendDialogueActive=true;s.friendDialogueIndex=0;s.friendDialogueTime=0;s.friendVoiceTime=0;s.friend.yaw=Math.atan2(s.x-s.friend.x,s.z-s.friend.z);return true;}
  function friendDialogueStep(s,dt){if(s.friendDialogueActive&&Number.isFinite(dt)&&dt>0){s.friendDialogueTime+=dt;s.playTime+=dt;}}
  function advanceFriendDialogue(s){if(!s.friendDialogueActive||s.friendDialogueTime<.5)return false;if(s.friendDialogueIndex<4){s.friendDialogueIndex++;s.friendDialogueTime=0;s.friendVoiceTime=0;}else{s.friendDialogueActive=false;s.friendDialogueDone=true;if(s.friendQuest!=='recruited')recruit(s);}return true;}
  function recruit(s){if(!s.africaStarted||s.africaStage!=='complete'||!s.friendDialogueDone||s.friendQuest==='recruited'||Math.hypot(s.x-CAMP.x,s.z-CAMP.z)>6)return false;s.friendQuest='recruited';return true;}
  function destination(s){return s.friendQuest==='accepted'?CAMP:SHIP;}
  function distance(s){const p=destination(s);return Math.max(0,Math.hypot(s.x-p.x,s.z-p.z)-(p===SHIP?8:6));}
  function height(x,z,seed){if(z<-45)return -5;const shore=A.clamp((z+45)/30,0,1),raw=A.noise(x/160,z/160,seed+311)*3.5+A.noise(x/48,z/48,seed+701)*.55;return 1+shore*(1.2+raw)*A.clamp(Math.abs(x)/45,0,1);}
  function props(cx,cz,seed){const out=[];for(let i=0;i<5;i++){const x=(cx+A.hash(cx+i*21,cz,seed+121))*128,z=(cz+A.hash(cx,cz+i*37,seed+331))*128;if(z<-18||Math.abs(x)<16||Math.hypot(x-CAMP.x,z-CAMP.z)<22||Math.hypot(x-SHIP.x,z-SHIP.z)<24)continue;out.push({x,z,y:height(x,z,seed),r:1+A.hash(cx+i,cz,seed)*1.4,type:i%2?'tree':'rock'});}return out;}
  function move(s,dt,forward,right,sprint){if(!s.africaStarted||s.africaStage!=='complete'||s.friendDialogueActive||!Number.isFinite(dt)||dt<=0)return{player:0,friend:0};const length=Math.hypot(forward,right),speed=A.staminaStep(s,sprint,length>0,dt),x=s.x,z=s.z;if(length){const dx=(Math.sin(s.cameraYaw)*forward+Math.cos(s.cameraYaw)*right)/length,dz=(Math.cos(s.cameraYaw)*forward-Math.sin(s.cameraYaw)*right)/length;s.x+=dx*speed*dt;s.z=Math.max(-30,s.z+dz*speed*dt);s.yaw=Math.atan2(dx,dz);}let friendMoved=0;if(s.friendQuest==='recruited'){const f=s.friend,fx=f.x,fz=f.z,dist=Math.hypot(s.x-f.x,s.z-f.z);if(dist>2.5){const amount=Math.min(dist-2.5,Math.max(A.WALK,speed)*1.25*dt);f.x+=(s.x-f.x)/dist*amount;f.z+=(s.z-f.z)/dist*amount;f.yaw=Math.atan2(s.x-f.x,s.z-f.z);}friendMoved=Math.hypot(f.x-fx,f.z-fz);}s.playTime+=dt;A.earthStep(s,dt);if(Math.hypot(s.x-SHIP.x,s.z-SHIP.z)<=8+1e-7)s.spaceshipFound=true;return{player:Math.hypot(s.x-x,s.z-z)/dt,friend:friendMoved/dt};}
  return{SHIP,CAMP,ORION_QUOTES,ARRIVAL_SECONDS,TITLE_SECONDS,modal,ensureJourney,arrive,transitionStep,choose,acceptFriend,beginFriendDialogue,friendDialogueStep,advanceFriendDialogue,recruit,destination,distance,height,props,move};
})();
if(typeof module!=='undefined'&&module.exports)module.exports=NVAfrica;
