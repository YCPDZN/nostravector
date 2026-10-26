const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const c=vm.createContext({Math});const run=s=>vm.runInContext(s,c);
for(const f of ['pontifex_model.js','render_math.js','pontifex_renderer.js'])run(fs.readFileSync(__dirname+'/'+f,'utf8'));
const model=run('PontifexModel');
const M={
 identity:()=>[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],
 mul:(a,b)=>{const r=new Array(16).fill(0);for(let col=0;col<4;col++)for(let row=0;row<4;row++)for(let k=0;k<4;k++)r[col*4+row]+=a[k*4+row]*b[col*4+k];return r;},
 t:(x,y,z)=>[1,0,0,0,0,1,0,0,0,0,1,0,x,y,z,1],
 scale:(x,y,z)=>[x,0,0,0,0,y,0,0,0,0,z,0,0,0,0,1],
 ry:a=>[Math.cos(a),0,-Math.sin(a),0,0,1,0,0,Math.sin(a),0,Math.cos(a),0,0,0,0,1],
 rx:a=>[1,0,0,0,0,Math.cos(a),Math.sin(a),0,0,-Math.sin(a),Math.cos(a),0,0,0,0,1],
 rz:a=>[Math.cos(a),Math.sin(a),0,0,-Math.sin(a),Math.cos(a),0,0,0,0,1,0,0,0,0,1]
};
let uploads=0,draws=[],objects=[],current;
const sourceIndex=new Map(model.meshes.map((q,i)=>[q.p,i]));
const floor=(x,z)=>Math.sin(x*.035)*.25+Math.cos(z*.025)*.3;
c.NVPontifex={local:()=>current};c.rendererAPI={M,ground:floor,
 mesh:q=>{uploads++;assert.ok(q.p.flat().every(Number.isFinite));assert.ok(q.n.flat().every(Number.isFinite));assert.ok(q.f.every(Number.isInteger));return{sourceIndex:sourceIndex.get(q.p)};},
 draw:(geometry,matrix,color,material=0,emission=0)=>{assert.equal(matrix.length,16);assert.ok(matrix.every(Number.isFinite),'All animated models and beams need finite transforms.');assert.ok(color.every(v=>Number.isFinite(v)&&v>=0&&v<=1));assert.ok(emission>=0&&emission<=1);assert.ok(run('NVRenderMath.normalMatrix')(matrix).every(Number.isFinite));draws.push({geometry,matrix,color,material,emission});},
 object:(...args)=>{assert.ok(args.slice(0,6).every(Number.isFinite));assert.ok(args.slice(3,6).every(n=>n>0));objects.push(args);}
};
const renderer=run('createPontifexScenery(rendererAPI)'),s={x:100,z:200,seed:7,jumpOffset:0};
const fresh=()=>({alive:true,hp:24000,maxHp:24000,yaw:0,mode:'dormant',action:'sweep',timer:0,gait:0,speed:0,hitFlash:0,shotFlash:0,deathTime:0,aim:{x:2,z:3}});
const render=(change={},distance=5,time=1)=>{draws=[];objects=[];current={boss:{...fresh(),...change},x:104,z:202,homeX:103,homeZ:201,distance};renderer(s,time);return draws.filter(q=>q.geometry.sourceIndex!==undefined);};
render({},451);assert.equal(uploads,0,'A distant boss must not allocate model buffers.');assert.equal(draws.length,0);
const idle=render();assert.equal(idle.length,model.meshes.length);assert.equal(uploads,model.meshes.length);
render();assert.equal(uploads,model.meshes.length,'Mesh buffers are reused across frames.');
const stride=render({speed:4.4,gait:Math.PI/2,mode:'pursuit'});
const named=bone=>model.meshes.findIndex(q=>q.bone===bone);
for(const bone of ['leftArm','rightArm','leftLeg','rightLeg','cape'])assert.notDeepEqual(idle[named(bone)].matrix,stride[named(bone)].matrix,bone+' should articulate while pursuing.');
const far=render({},150);assert.ok(far.length>8&&far.length<idle.length/2,'Distant silhouette uses fewer model parts.');assert.equal(uploads,model.meshes.length);
for(const action of ['sweep','slam','lance']){
 const windup=render({mode:'windup',action,timer:.1});
 assert.notDeepEqual(windup[named('weapon')].matrix,idle[named('weapon')].matrix,'The polearm telegraphs '+action+'.');
 assert.ok(objects.some(q=>q[4]===.075),'Windups draw grounded hazard markers.');
 for(const q of objects.filter(q=>q[4]===.075))assert.ok(Math.abs(q[1]-floor(q[0],q[2])-.06)<1e-7,'Telegraphs follow terrain.');
 const released=render({mode:'release',action,timer:.05});
 assert.notDeepEqual(windup[named('weapon')].matrix,released[named('weapon')].matrix,'The '+action+' release follows its windup.');
 if(action==='lance'){
  assert.ok(draws.some(q=>q.geometry.sourceIndex===undefined),'A lance reaches its locked world-space target.');
  const hazards=objects.filter(q=>q[4]===.075);assert.ok(hazards.some(q=>Math.hypot(q[0]-105,q[2]-204)<3.2),'Lance marker uses home plus locked aim offsets.');
 }
 render({mode:'recovery',action,timer:1.2});
}
render({shotFlash:.12,hitFlash:.18});
assert.ok(draws.some(q=>q.geometry.sourceIndex===undefined),'Player suit disruptor draws a finite cyan bolt.');
assert.equal(uploads,model.meshes.length+1,'The beam geometry is cached too.');
assert.ok(draws.filter(q=>q.geometry.sourceIndex!==undefined).some(q=>q.color[2]>.4),'Boss hit feedback changes armour colour.');
const fallen=render({alive:false,mode:'dead',deathTime:4});assert.notDeepEqual(fallen[0].matrix,idle[0].matrix,'Death collapses the full rig.');
assert.equal(objects.length,0,'A dead boss no longer signals hazards.');
current=null;draws=[];renderer(s,5);assert.equal(draws.length,0,'No model remains after the corpse expires.');
for(const origin of [[1e8,0,-1e8],[-9e7,0,8e7]]){current={boss:fresh(),x:origin[0],z:origin[2],homeX:origin[0],homeZ:origin[2],distance:5};renderer({...s,x:origin[0]+3,z:origin[2]+2},6);for(const q of draws){const relative=run('NVRenderMath.relativeModel')(q.matrix,origin);assert.ok(relative.every(Number.isFinite));}}
console.log('Passed detailed boss mesh caching, articulated pursuit and attacks, grounded locked-target telegraphs, suit bolt, hit response, death collapse, distance detail/culling, and finite rebased transforms.');
