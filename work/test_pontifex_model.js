const assert=require('assert'),fs=require('fs'),path=require('path'),vm=require('vm');
const context=vm.createContext({});
vm.runInContext(fs.readFileSync(path.join(__dirname,'pontifex_model.js'),'utf8')+';globalThis.model=PontifexModel;',context);
const model=context.model;
assert.equal(model.name,'Imperia Pontifex Maximus');
assert.equal(model.faction,'TERRA');
assert(model.meshes.length>=350);
const bones=new Set(Object.keys(model.pivots));
const used=new Set();let vertices=0,triangles=0;
for(const part of model.meshes){
  assert(bones.has(part.bone),part.name+' has unknown bone');used.add(part.bone);
  assert(part.p.length===part.n.length&&part.p.length%3===0,part.name+' vertex/normal mismatch');
  assert(part.p.every(Number.isFinite)&&part.n.every(Number.isFinite),part.name+' has non-finite geometry');
  assert(part.indices.length%3===0,part.name+' has incomplete triangles');
  assert(part.indices.every(i=>Number.isInteger(i)&&i>=0&&i<part.p.length/3&&i<65536),part.name+' invalid index');
  for(let j=0;j<part.indices.length;j+=3){
    const ids=part.indices.slice(j,j+3),p=ids.map(i=>part.p.slice(i*3,i*3+3));
    const a=p[1].map((v,k)=>v-p[0][k]),b=p[2].map((v,k)=>v-p[0][k]);
    const cross=[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
    assert(cross.reduce((v,n)=>v+n*n,0)>=1e-20,part.name+' contains a degenerate triangle');
    const normal=[0,1,2].map(k=>ids.reduce((sum,i)=>sum+part.n[i*3+k],0));
    assert(cross.reduce((v,n,k)=>v+n*normal[k],0)>0,part.name+' triangle '+j/3+' is not outward CCW');
  }
  for(let i=0;i<part.n.length;i+=3)assert(Math.abs(Math.hypot(...part.n.slice(i,i+3))-1)<2e-6,part.name+' non-unit normal');
  assert(part.color.every(v=>v>=0&&v<=1));assert(part.emission>=0&&part.emission<=1);
  assert.equal(typeof part.lod,'boolean');
  vertices+=part.p.length/3;triangles+=part.indices.length/3;
}
assert.equal(used.size,bones.size,'Every animated bone must contain geometry');
assert(model.meshes.filter(p=>p.lod).length>=50&&model.meshes.filter(p=>p.lod).length<=120);
for(const name of ['Grand swept helmet horn -1','Heart reactor luminous inner facet','Torn ceremonial cloak','Crescent blade forged edge','Terra Imperia cyan chevron'])assert(model.meshes.some(p=>p.name===name));
const glb=fs.readFileSync(path.join(__dirname,'../outputs/NOSTRAVECTOR_Imperia_Pontifex_Maximus.glb'));
assert.equal(glb.readUInt32LE(0),0x46546c67);assert.equal(glb.readUInt32LE(4),2);assert.equal(glb.readUInt32LE(8),glb.length);
const len=glb.readUInt32LE(12);const data=JSON.parse(glb.subarray(20,20+len).toString('utf8'));
assert.equal(data.meshes.length,model.meshes.length);assert.equal(data.materials.length,model.meshes.length);
const groups=new Map(data.nodes.map((n,i)=>[n.name,{n,i}]));
assert(groups.get('rightArm').n.children.includes(groups.get('weapon').i));
for(const [name,pivot] of Object.entries(model.pivots))assert(groups.has(name)&&pivot.length===3&&pivot.every(Number.isFinite));
assert(data.materials.some(m=>m.emissiveFactor?.[0]>0));
assert(data.accessors.every(a=>a.count>0));
const binOffset=28+len;
for(const view of data.bufferViews)assert(view.byteOffset>=0&&view.byteOffset+view.byteLength<=data.buffers[0].byteLength);
assert.equal(glb.length-binOffset,data.buffers[0].byteLength);
console.log('Pontifex model: '+model.meshes.length+' parts, '+vertices+' vertices, '+triangles+' triangles; '+model.meshes.filter(p=>p.lod).length+' silhouette parts. GLB hierarchy and geometry validated.');
