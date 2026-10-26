const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const context={console};vm.createContext(context);
for(const f of ['companion_motion.js','carax_geometry.js','chapter4_intruder_model.js','hak_model.js'])vm.runInContext(fs.readFileSync('work/'+f,'utf8'),context);
vm.runInContext(fs.readFileSync('work/companion_combat_core.js','utf8').split('const companionCombatTick=')[0],context);
vm.runInContext(`
globalThis.results=[];
for(const model of [Chapter4IntruderModel,HakModel]){
 const parts=model.meshes.map(p=>({...p,f:p.f||p.indices,color:p.color||p.c})),batches=NVCaraxGeometry.animated(parts,q=>q);
 for(const mode of [null,'rifle','sweep','ice','hammer1'])for(const speed of [0,4])for(const time of [0,.6,2.4]){
  const pose=NVCompanionMotion.pose(parts,'test',time,speed,time*2,mode?{companion:true,mode,elapsed:.6,duration:1.4}:null);
  for(const batch of batches)for(const part of batch.members){const a=NVCompanionMotion.part(pose,part),b=NVCompanionMotion.part(pose,batch.representative);if(a.some((v,i)=>Math.abs(v-b[i])>1e-9))throw Error('Animation transform changed: '+part.name);}
 }
 for(const batch of batches){if(batch.p.length/3>60000||Math.max(...batch.f)>=batch.p.length/3)throw Error('Invalid merged indices');}
 results.push({parts:parts.length,batches:batches.length});
}
globalThis.boxes=NVCaraxGeometry.boxes(object=>{for(let i=0;i<160;i++)object(1+i,2,3,4,5,6,[.2,.3,.4],Math.PI/2);},q=>q);
`,context);
assert.equal(context.boxes.length,1);assert.equal(context.boxes[0].f.length,160*36);assert(context.results.every(r=>r.batches<r.parts*.65),JSON.stringify(context.results));
console.log('Passed exact idle/walking animation transforms, preserved triangles, valid 16-bit indices and 160 stair pieces in one draw batch:',JSON.stringify(context.results));
