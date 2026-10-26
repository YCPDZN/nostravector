const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const ctx=vm.createContext({Math});vm.runInContext(fs.readFileSync(__dirname+'/render_math.js','utf8'),ctx);const R=vm.runInContext('NVRenderMath',ctx);
const identity=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],f=Math.fround;
const gpuTransform=(m,p)=>Array.from({length:3},(_,r)=>f(f(f(f(m[r])*f(p[0]))+f(f(m[4+r])*f(p[1])))+f(f(f(m[8+r])*f(p[2]))+f(m[12+r]))));
// Facial/armour layers 3mm apart must stay distinct anywhere a ship can land.
for(const [x,z] of [[0,0],[15000,50000],[121250,-34500],[-180000,90000],[180000,-90000]]){
 const origin=[x,0,z],m=identity.slice();m[12]=x+.23;m[13]=1.4;m[14]=z+.2;
 const original=m.slice(),relative=R.relativeModel(m,origin),a=gpuTransform(relative,[0,0,.003]),b=gpuTransform(relative,[0,0,0]);
 assert.ok(Math.abs(a[2]-b[2]-.003)<2e-7,`3mm layer lost at ${x},${z}`);assert.deepEqual(m,original,'Rendering cannot change saved world coordinates.');
 for(const point of [[x+1,2,z-5],[x-.9,1.2,z+.1]])assert.ok(R.relativePoint(point,origin).every((v,i)=>Math.abs(v-(point[i]-origin[i]))<1e-10));
}
const bad=identity.slice();bad[14]=180000;assert.equal(gpuTransform(bad,[0,0,.003])[2],gpuTransform(bad,[0,0,0])[2],'Reproduce the original precision loss.');
// Inverse-transpose normals remain perpendicular to transformed surface tangents.
for(const yaw of [0,.8,2.3])for(const scale of [[2,.4,1],[.04,.08,.012],[1,1,1]]){
 const [sx,sy,sz]=scale,c=Math.cos(yaw),s=Math.sin(yaw),m=[c*sx,0,-s*sx,0,0,sy,0,0,s*sz,0,c*sz,0,0,0,0,1],n=R.normalMatrix(m),transform=(m,v)=>[0,1,2].map(r=>m[r]*v[0]+m[3+r]*v[1]+m[6+r]*v[2]),normal=transform(n,[1,1,1]);
 for(const tangent of [[1,-1,0],[0,1,-1]]){const t=gpuTransform(m,tangent),dot=normal.reduce((a,v,i)=>a+v*t[i],0);assert.ok(Math.abs(dot)<1e-5,'Ellipsoid highlights must follow the surface.');}
}
console.log('Passed: original 3mm detail collapse reproduced; facial and suit layers preserved at global coordinate limits; save coordinates untouched; scaled normals perpendicular to surfaces.');
