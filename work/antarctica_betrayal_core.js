const NVBetrayal=(()=>{
  const A=typeof NVAntarctica!=='undefined'?NVAntarctica:require('./antarctica_core.js'),DURATION=27;
  const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)),mix=(a,b,t)=>a+(b-a)*clamp(t),smooth=t=>{t=clamp(t);return t*t*(3-2*t);};
  function active(s){return s.betrayalStage==='dialogue'||s.betrayalStage==='action';}
  function ship(s){const depart=s.betrayalStage==='action'?smooth((s.betrayalTime-17.5)/9.5):s.ferryEscaped?1:0;return{x:A.FERRY.x+30+depart*35,z:A.FERRY.z+4+depart*90+(s.ferryEscaped?s.ferryVoyageTime*3:0),y:2.78};}
  function begin(s){if(!s.bedRested||s.betrayalStage!=='unseen'||Math.hypot(s.x-A.FERRY.x,s.z-A.FERRY.z)>26)return false;if(s.car?.driving)A.leaveCar(s);s.ferryFound=true;s.betrayalStage='dialogue';s.betrayalIndex=0;s.betrayalLineTime=0;s.betrayalSpeechChar=0;s.betrayalTime=0;s.x=A.FERRY.x+.1;s.z=A.FERRY.z-9;s.yaw=.44;s.james={x:A.FERRY.x+1.15,z:A.FERRY.z-6.5,yaw:Math.PI+.40};return true;}
  function next(s){if(s.betrayalStage!=='dialogue')return false;if(s.betrayalIndex<14)s.betrayalIndex++;else{s.betrayalStage='action';s.betrayalTime=0;}s.betrayalLineTime=0;s.betrayalSpeechChar=0;s.betrayalVoiceTime=0;return true;}
  function pose(s){
    const f=A.FERRY,t=s.betrayalStage==='action'?s.betrayalTime:0,boat=ship(s),p={x:f.x+.1,z:f.z-9,yaw:.44,y:3.15,tilt:0,aim:0,push:0,duck:0,speed:0,phase:0},j={x:f.x+1.15,z:f.z-6.5,yaw:Math.PI+.40,y:3.15,tilt:0,aim:0,push:0,duck:0,speed:0,phase:0};
    if(s.betrayalStage==='dialogue')return{player:p,james:j,ship:boat,flash:false,splash:0,camera:{eye:[j.x+Math.sin(j.yaw)*1.7,j.y+1.75,j.z+Math.cos(j.yaw)*1.7],target:[j.x,j.y+1.55,j.z]}};
    const draw=smooth(t/2.4);j.aim=draw;
    if(t>=3){const dodge=smooth((t-3)/.65);p.x=mix(f.x+.1,f.x-.6,dodge);p.duck=.45*Math.sin(clamp((t-3)/1.3)*Math.PI);}
    if(t>=3.7){const lunge=smooth((t-3.7)/1.6);p.x=mix(f.x-.6,f.x+1,lunge);p.z=mix(f.z-9,f.z-7,lunge);p.push=Math.sin(clamp((t-4.6)/1.9)*Math.PI);j.x=mix(f.x+1.15,f.x+3.45,smooth((t-5)/1.2));j.aim=1-smooth((t-4.8)/1.4);}
    if(t>=6){const fall=clamp((t-6)/2.5);j.x=mix(f.x+3.45,f.x+6.3,fall);j.z=f.z-6.5;j.y=3.15+Math.sin(fall*Math.PI)*.9-4.6*fall*fall;j.tilt=-fall*1.6;j.aim=0;}
    if(t>=8.5){j.x=f.x+6.3;j.y=-1.35+Math.sin(t*2)*.05;j.tilt=-.2;}
    if(t>=8.5&&t<17.5){const run=clamp((t-8.5)/9);p.x=mix(f.x+1,f.x+23,run);p.z=mix(f.z-7,f.z,Math.min(1,run*2));p.yaw=run<.5?1.26:Math.PI/2;p.speed=2.8;p.phase=(t-8.5)*12;p.push=0;}
    if(t>=17.5){const cross=clamp((t-17.5)/6.5);p.x=boat.x+mix(-7,0,cross);p.z=boat.z+mix(-4,-19,cross);p.y=boat.y;p.yaw=Math.PI;p.speed=cross<1?2.8:0;p.phase=(t-8.5)*12;p.push=0;}
    let camera={eye:[f.x+7,7.2,f.z-14],target:[f.x+1,4.5,f.z-6.8]};
    if(t>=6&&t<8.5)camera={eye:[f.x+11,5.3,f.z-12],target:[j.x,j.y+.9,j.z]};
    else if(t>=8.5&&t<17.5)camera={eye:[p.x-6,7,p.z-10],target:[p.x,p.y+1,p.z]};
    else if(t>=17.5)camera={eye:[boat.x+35,18,boat.z-49],target:[boat.x,4.6,boat.z]};
    return{player:p,james:j,ship:boat,flash:t>=3.13&&t<3.24,splash:t>=8.15&&t<10.2?Math.sin(clamp((t-8.15)/2.05)*Math.PI):0,camera};
  }
  function actionStep(s,dt){if(s.betrayalStage!=='action'||!Number.isFinite(dt)||dt<=0)return false;const step=Math.min(dt,DURATION-s.betrayalTime);s.betrayalTime+=step;s.playTime+=step;const q=pose(s);Object.assign(s,{x:q.player.x,z:q.player.z,yaw:q.player.yaw});s.james={x:q.james.x,z:q.james.z,yaw:q.james.yaw};if(s.betrayalTime>=8.5)s.jamesGone=true;if(s.betrayalTime>=DURATION){s.betrayalStage='complete';s.ferryEscaped=true;s.ferryVoyageTime=0;s.cameraYaw=0;s.cameraPitch=.40;s.stamina=100;s.suitHeat=100;return true;}return false;}
  function voyageStep(s,dt,forward=0,right=0,sprint=false){if(!s.ferryEscaped||!Number.isFinite(dt)||dt<=0)return 0;const before=ship(s),localX=s.x-before.x,localZ=s.z-before.z;s.ferryVoyageTime+=dt;const after=ship(s),length=Math.hypot(forward,right),speed=A.staminaStep(s,sprint,length>0,dt),dx=length?(Math.sin(s.cameraYaw)*forward+Math.cos(s.cameraYaw)*right)/length*speed*dt:0,dz=length?(Math.cos(s.cameraYaw)*forward-Math.sin(s.cameraYaw)*right)/length*speed*dt:0,nx=clamp(localX+dx,-7,7),nz=clamp(localZ+dz,-24,-8),moved=Math.hypot(nx-localX,nz-localZ);s.x=after.x+nx;s.z=after.z+nz;if(moved>.00001)s.yaw=Math.atan2(dx,dz);s.playTime+=dt;A.earthStep(s,dt);return moved/dt;}
  return{DURATION,active,begin,next,pose,ship,actionStep,voyageStep};
})();
if(typeof module!=='undefined'&&module.exports)module.exports=NVBetrayal;
