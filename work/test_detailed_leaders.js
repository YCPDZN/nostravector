const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const c=vm.createContext({Math,Float32Array,Uint16Array});const run=s=>vm.runInContext(s,c);
for(const f of ['human_leaders.js','hak_model.js'])run(fs.readFileSync(__dirname+'/'+f,'utf8'));
const models=['ThomasModel','DariusModel','HakModel'].map(name=>run(name));
for(const model of models){
 const cast=model.meshes.filter(q=>!q.name.includes('grass')&&!q.name.includes('meadow'));
 assert.ok(cast.length>=140,model.name+' needs detailed character geometry.');
 for(const q of model.meshes){assert.equal(q.p.length,q.n.length);assert.equal(q.p.length%3,0);assert.equal(q.indices.length%3,0);assert.ok(q.p.every(Number.isFinite));assert.ok(q.n.every(Number.isFinite));assert.ok(q.indices.every(i=>Number.isInteger(i)&&i>=0&&i<q.p.length/3&&i<65536));assert.ok(q.color.every(v=>v>=0&&v<=1));assert.ok(['body','head','jaw','eyes','upperLip','lowerLip','teeth'].includes(q.bone));for(let i=0;i<q.n.length;i+=3)assert.ok(Math.abs(Math.hypot(...q.n.slice(i,i+3))-1)<.001);}
 for(const bone of ['head','jaw','upperLip','lowerLip'])assert.ok(cast.some(q=>q.bone===bone));
 const vertices=cast.flatMap(q=>q.p);assert.ok(Math.max(...cast.flatMap(q=>q.p.filter((_,i)=>i%3===1)))<4.4,'Keep the existing full-body scale.');
 assert.ok(cast.some(q=>q.name.startsWith('Finger')));assert.ok(cast.some(q=>q.name.includes('Boot')));
}
assert.ok(models[0].meshes.some(q=>q.name.includes('Beard strand')));assert.ok(!models[1].meshes.some(q=>q.name.includes('Beard')));assert.ok(models[2].meshes.some(q=>q.name.includes('Glasses frame')));assert.ok(models[2].meshes.some(q=>q.name.includes('Long hair layered strand')));
let matrices=[];
const gl=new Proxy({createProgram:()=>({}),createShader:()=>({}),getShaderParameter:()=>true,getProgramParameter:()=>true,createBuffer:()=>({}),getUniformLocation:(_,n)=>n,getAttribLocation:()=>0,uniformMatrix4fv:(name,_,m)=>{assert.ok(m.every(Number.isFinite));if(name==='model')matrices.push(m.slice());},bufferData:(_,values)=>assert.ok(Array.from(values).every(Number.isFinite))},{get:(o,k)=>k in o?o[k]:k===k.toUpperCase()?k:()=>{}});
c.window={devicePixelRatio:1};c.$=()=>({});run(fs.readFileSync(__dirname+'/grek_renderer.js','utf8'));
for(const model of models){const canvas={getContext:()=>gl,getBoundingClientRect:()=>({width:360,height:620}),addEventListener(){}};const render=run('createGrekRenderer')(canvas,model);matrices=[];render(1,{open:0,round:0},false);const idle=matrices;matrices=[];render(1,{open:1,round:1},false);const speaking=matrices;const jaw=model.meshes.findIndex(q=>q.bone==='jaw'),lip=model.meshes.findIndex(q=>q.bone==='lowerLip');assert.notDeepEqual(idle[jaw],speaking[jaw]);assert.notDeepEqual(idle[lip],speaking[lip]);matrices=[];render(1,{open:1,round:1},true);assert.deepEqual(matrices[jaw],idle[jaw],'Pausing closes the mouth.');}
for(const name of ['Thomas_Hawthorne','Darius_Ancin','Hak_Chompjak']){const b=fs.readFileSync(__dirname+'/../outputs/NOSTRAVECTOR_'+name+'.glb');assert.equal(b.readUInt32LE(0),0x46546c67);assert.equal(b.readUInt32LE(8),b.length);const json=JSON.parse(b.subarray(20,20+b.readUInt32LE(12)).toString());assert.ok(json.meshes.length>=140);assert.ok(json.nodes.some(n=>n.name==='jaw'));}
console.log('Passed detailed distinct silhouettes, finite unit normals, Uint16 indices, fingers, face/lip rigs, closed paused mouths, and three articulated GLB exports.');
