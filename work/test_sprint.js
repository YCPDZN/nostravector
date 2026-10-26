const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),c=vm.createContext({Math,Number,JSON});vm.runInContext(fs.readFileSync(__dirname+'/antarctica_core.js','utf8'),c);const A=vm.runInContext('NVAntarctica',c);
const walk=A.gaitSettings(A.WALK),run=A.gaitSettings(A.SPRINT);
assert.ok(A.gaitAdvance(A.SPRINT,1)>A.SPRINT/A.STRIDE_RUN*2*Math.PI*1.24,'Sprint cadence speeds up by 25%.');
assert.ok(A.gaitAdvance(A.SPRINT,1)>A.gaitAdvance(A.WALK,1)*1.7,'Running steps are noticeably faster than walking.');
assert.ok(run.lean>.45);assert.ok(run.armSwing>walk.armSwing*4);
let walkAir=0,runAir=0,walkLift=0,runLift=0;
for(let i=0;i<600;i++){
 const phase=i/600*2*Math.PI;
 for(const [g,isRun] of [[walk,false],[run,true]]){
  const l=A.gaitFoot(phase,g),r=A.gaitFoot(phase+Math.PI,g);assert.ok([l.z,l.lift,l.pitch,r.z,r.lift,r.pitch].every(Number.isFinite));
  if(l.lift>.001&&r.lift>.001){if(isRun)runAir++;else walkAir++;}
  if(isRun)runLift=Math.max(runLift,l.lift);else walkLift=Math.max(walkLift,l.lift);
 }
}
assert.equal(walkAir,0,'Walking always has a grounded foot.');assert.ok(runAir>240,'Sprint has an extended airborne phase.');assert.ok(runLift>walkLift*4.8,'Sprint heels recover close to hip height.');
for(const speed of [0,.01,.7,1.4,1.41,2,2.79,2.8,3.4]){
 const g=A.gaitSettings(speed,1.2);assert.ok(Object.values(g).every(Number.isFinite));
 if(speed===0){assert.equal(Math.abs(g.lean),0);assert.equal(Math.abs(g.bob),0);assert.equal(A.gaitAdvance(speed,1),0);}
 const eps=1e-7,a=A.gaitFoot(g.duty*2*Math.PI-eps,g),b=A.gaitFoot(g.duty*2*Math.PI+eps,g);assert.ok(Math.abs(a.z-b.z)<1e-5,'Foot swing transition cannot snap.');
 assert.ok(Math.abs(a.pitch-b.pitch)<1e-5,'Toe-off rotation must stay continuous.');
}
for(const [shoulder,elbow,wrist] of [[[.28,1.32,0],[.443,1.093,0],[.577,.88,.016]],[[.27,1.34,0],[.313,1.075,0],[.326,.826,.012]]]){
 const distance=(a,b)=>Math.hypot(...a.map((v,i)=>v-b[i]));
 for(let phase=0;phase<Math.PI*2;phase+=.08){const g=A.gaitSettings(A.SPRINT,phase),arm=A.sprintArm(shoulder,elbow,wrist,1,phase,g,g.bob);
  assert.ok(Math.abs(distance(arm.shoulder,arm.elbow)-distance(shoulder,elbow))<1e-9,'Upper arms must not stretch while pumping.');
  assert.ok(Math.abs(distance(arm.elbow,arm.wrist)-distance(elbow,wrist))<1e-9,'Forearms must not stretch while pumping.');
  assert.ok(arm.shoulder[2]>.19,'Shoulders must follow the torso forward, not detach behind it.');
 }
 const back=A.sprintArm(shoulder,elbow,wrist,1,0,run,0),front=A.sprintArm(shoulder,elbow,wrist,1,Math.PI,run,0);
 assert.ok(front.wrist[2]-back.wrist[2]>.45,'Sprint arms drive strongly opposite the forward leg.');
}
assert.equal(A.SPRINT,2.8*2.5);assert.equal(A.WALK,1.4);
console.log('Passed: sprint cadence, 27-degree forward lean, high heel recovery, extended flight phase, opposite bent-arm drive without stretched limbs, smooth toe-off and unchanged travel speeds.');
