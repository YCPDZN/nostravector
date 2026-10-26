function NVGroundPlayerBone(q){const name=q.name.toLowerCase();const side=name.startsWith('left')?'L':name.startsWith('right')?'R':name.startsWith('wrist')?'R':name==='mission badge'?'R':null;if(!side||name.includes('shoulder strap')||name.includes('helmet')||name.includes('oxygen'))return'body';if(/boot|ankle/.test(name))return side+'-foot';if(/shin|leg fold|knee/.test(name))return side+'-shin';if(name.includes('thigh'))return side+'-thigh';if(/forearm|sleeve|elbow|wrist|glove|thumb/.test(name))return side+'-lowerArm';if(/upper arm|shoulder|mission badge/.test(name))return side+'-upperArm';return'body';}
// Shared with the main on-foot renderer: planted legs, sprint IK and two-handed aim.
function createNVGroundPlayerRig({A=NVAntarctica,M,terrainGround=()=>0}){
 const norm=v=>{const l=Math.hypot(...v)||1;return v.map(n=>n/l);};
 function rotationBetween(a,b){a=norm(a);b=norm(b);const v=[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],w=1+a.reduce((n,x,i)=>n+x*b[i],0),l=Math.hypot(...v,w)||1,x=v[0]/l,y=v[1]/l,z=v[2]/l,q=w/l;return[1-2*y*y-2*z*z,2*x*y+2*z*q,2*x*z-2*y*q,0,2*x*y-2*z*q,1-2*x*x-2*z*z,2*y*z+2*x*q,0,2*x*z+2*y*q,2*y*z-2*x*q,1-2*x*x-2*y*y,0,0,0,0,1];}
 const bone=(a,b,ta,tb)=>M.mul(M.t(...ta),M.mul(rotationBetween(b.map((n,i)=>n-a[i]),tb.map((n,i)=>n-ta[i])),M.t(...a.map(n=>-n))));
function rig(entity,gaitPhase,speed,seed,isJames=false,crouch=0){
    const phase=gaitPhase%(2*Math.PI),gait=A.gaitSettings(speed,phase),{run,moving,lean}=gait,rootY=(Number.isFinite(entity.y)?entity.y:terrainGround(entity.x,entity.z,seed))+(entity.jumpOffset||0);
    let bob=gait.bob-crouch;
    // Lower the hips through the extended sprint contact rather than pulling
    // the shin away from the foot when the stride exceeds the leg's reach.
    if(run>.5)for(const [side,offset] of [[1,0],[-1,Math.PI]]){
      const foot=A.gaitFoot(phase+offset,gait),hipY=isJames?.83:.84,kneeY=isJames?.47:.535,ankleY=isJames?.14:.18;
      const reach=Math.hypot(.017,kneeY-hipY)+Math.hypot(.012,ankleY-kneeY,.013)-.003;
      const fx=entity.x+Math.cos(entity.yaw)*side*.14+Math.sin(entity.yaw)*foot.z,fz=entity.z-Math.sin(entity.yaw)*side*.14+Math.cos(entity.yaw)*foot.z,groundOffset=(Number.isFinite(entity.y)||entity.jumpOffset>0)?0:terrainGround(fx,fz,seed)-rootY;
      bob=Math.min(bob,ankleY+foot.lift+groundOffset+Math.sqrt(Math.max(.001,reach*reach-.027**2-(foot.z+.013)**2))-hipY);
    }
    const hands={},bones={body:M.mul(M.t(0,bob,0),M.mul(M.t(0,.84,0),M.mul(M.rz(gait.roll),M.mul(M.rx(lean),M.t(0,-.84,0)))))};
    for(const [side,s,offset] of [['L',1,0],['R',-1,Math.PI]]){
      const p=(phase+offset)%(2*Math.PI),{z:footZ,lift,pitch}=A.gaitFoot(p,gait);
      const fx=entity.x+Math.cos(entity.yaw)*s*.14+Math.sin(entity.yaw)*footZ,fz=entity.z-Math.sin(entity.yaw)*s*.14+Math.cos(entity.yaw)*footZ,groundOffset=(Number.isFinite(entity.y)||entity.jumpOffset>0)?0:terrainGround(fx,fz,seed)-rootY;
      const hipRest=[s*(isJames?.112:.113),isJames?.83:.84,0],kneeRest=[s*(isJames?.129:.128),isJames?.47:.535,0],ankleRest=[s*.14,isJames?.14:.18,.013];
      const hip=[hipRest[0],hipRest[1]+bob,0],ankle=[s*.14,ankleRest[1]+lift+groundOffset,footZ+.013],l1=Math.hypot(...kneeRest.map((n,i)=>n-hipRest[i])),l2=Math.hypot(...ankleRest.map((n,i)=>n-kneeRest[i])),knee=A.knee(hip,ankle,l1,l2);
      bones[side+'-thigh']=bone(hipRest,kneeRest,hip,knee);bones[side+'-shin']=bone(kneeRest,ankleRest,knee,ankle);bones[side+'-foot']=M.mul(M.t(...ankle),M.mul(M.rx(pitch),M.t(...ankleRest.map(n=>-n))));
      const shoulderRest=isJames?[s*.27,1.34,0]:[s*.28,1.32,0],elbowRest=isJames?[s*.313,1.075,0]:[s*.443,1.093,0],wristRest=isJames?[s*.326,.826,.012]:[s*.577,.88,.016],swing=-Math.sin(p)*gait.armSwing;
      const shoulder=[s*.27,shoulderRest[1]+bob,-lean*.42],elbow=[s*(.315+.025*run),1.07+bob-.05*run,swing-.015],wrist=[s*(.334-.045*run),.82+bob+.30*run,swing*(1.35-.25*run)+.07+.13*run+(crouch>.1?.15:0)];
      const sprint=A.sprintArm(shoulderRest,elbowRest,wristRest,s,p,gait,bob);
      for(const [point,target] of [[shoulder,sprint.shoulder],[elbow,sprint.elbow],[wrist,sprint.wrist]])for(let k=0;k<3;k++)point[k]+=(target[k]-point[k])*run;
      const aim=entity.aim||0,push=entity.push||0,amount=Math.max(aim,push);if(amount>0){const targetW=push>.01?[s*.27,1.24,.48]:[s*(s<0?.10:entity.rifle?.05:.16),1.25+bob-((entity.recoil||0)*.012),s<0?.48:entity.rifle?.76:.43],targetE=[s*.29,1.12+bob,.25];for(let k=0;k<3;k++){wrist[k]+=(targetW[k]-wrist[k])*amount;elbow[k]+=(targetE[k]-elbow[k])*amount;}}
      hands[side]=wrist;
      bones[side+'-upperArm']=bone(shoulderRest,elbowRest,shoulder,elbow);bones[side+'-lowerArm']=bone(elbowRest,wristRest,elbow,wrist);
    }
    return{root:M.mul(M.t(entity.x,rootY,entity.z),M.mul(M.ry(entity.yaw),M.mul(M.t(0,.8,0),M.mul(M.rz(entity.tilt||0),M.t(0,-.8,0))))),bones,hands};
  }

 return rig;
}
