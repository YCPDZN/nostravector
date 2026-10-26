const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const c=vm.createContext({Math});vm.runInContext(fs.readFileSync(__dirname+'/render_math.js','utf8'),c);
const R=vm.runInContext('NVRenderMath',c),near=(a,b)=>assert.ok(Math.abs(a-b)<1e-9,`${a} differs from ${b}`),dot=(a,b)=>a.reduce((n,v,i)=>n+v*b[i],0);
// Compare the sky ray against the actual view/projection transform across a full turn.
for(const aspect of [.55,1,16/9,2.4])for(const pitch of [-1.5,-.7,0,.7,1.5])for(let yaw=-Math.PI;yaw<=Math.PI;yaw+=.13){
  const eye=[14,6,-22],forward=[Math.sin(yaw)*Math.cos(pitch),-Math.sin(pitch),Math.cos(yaw)*Math.cos(pitch)],target=eye.map((v,i)=>v+forward[i]),f=R.cameraFrame(eye,target),view=R.view(eye,target);
  near(dot(f.right,f.up),0);near(dot(f.right,f.forward),0);near(Math.hypot(...f.right),1);
  for(const [u,v] of [[.05,.1],[.5,.5],[.9,.8]]){const ray=R.skyRay(f,u,v,aspect),point=eye.map((n,i)=>n+ray[i]*25),viewed=Array.from({length:3},(_,row)=>view[row]*point[0]+view[4+row]*point[1]+view[8+row]*point[2]+view[12+row]),t=Math.tan(Math.PI/3.05/2);near(viewed[0]/(-viewed[2]*t*aspect),2*u-1);near(viewed[1]/(-viewed[2]*t),2*v-1);}
}
const front=R.cameraFrame([0,0,0],[0,0,1]);assert.ok(R.skyRay(front,1,.5,1)[0]<0,'Sky right must match lookAt, rather than mirror the ground.');
const a=R.skyRay(R.cameraFrame([0,0,0],[1e-8,.2,-1]),.5,.5,1),b=R.skyRay(R.cameraFrame([0,0,0],[-1e-8,.2,-1]),.5,.5,1);assert.ok(Math.hypot(...a.map((v,i)=>v-b[i]))<3e-8,'Sky direction stays continuous across +/-180 degrees.');
for(const target of [[0,1,0],[0,-1,0]]){const f=R.cameraFrame([0,0,0],target);assert.ok([...f.forward,...f.right,...f.up].every(Number.isFinite));near(Math.hypot(...f.right),1);}
assert.equal(R.textureSize(8192),2048);assert.equal(R.textureSize(1024),1024);assert.equal(R.textureSize(1500),1024);
console.log('Passed: sky rays match view/projection for 4 aspect ratios, 5 pitches and full yaw turns; correct horizontal direction, 180-degree continuity, vertical views and texture size limits.');
