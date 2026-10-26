const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const code=fs.readFileSync('work/capital_interior_core.js','utf8');
const q={active:true,deck:6,x:0,z:10,y:0,yaw:0,steps:0};
const s={space:{phase:'cockpit'}};
const c={NVCapital:{owned:()=>true,deckY:d=>(6-d)*4.5},NVSpace:{disembark:()=>true},NVShipInterior:{enter(){},canEnter:()=>true,ensure:()=>q,active:()=>true,interaction(){},pilot(){},leave(){},blocked(){},step(){},crew:()=>[]},Math,Number,Array};vm.createContext(c);vm.runInContext(code,c);
for(let d=5;d>=0;d--){Object.assign(q,{deck:d+1,x:d%2===0?10.5:-10.5,z:40.1,y:(5-d)*4.5,stair:null,yaw:0});let y=q.y;for(let i=0;i<71;i++){c.NVShipInterior.step(s,.05,{forward:1});assert(q.y>=y-.001);assert(q.y-y<.08);y=q.y;}assert.equal(q.deck,d);assert.equal(q.stair,null);assert.equal(q.y,(6-d)*4.5);}
for(let d=0;d<6;d++){Object.assign(q,{deck:d,x:d%2===0?10.5:-10.5,z:29.9,y:(6-d)*4.5,stair:null,yaw:0});let y=q.y;for(let i=0;i<71;i++){c.NVShipInterior.step(s,.05,{forward:-1});assert(q.y<=y+.001);assert(y-q.y<.08);y=q.y;}assert.equal(q.deck,d+1);assert.equal(q.stair,null);}
Object.assign(q,{deck:1,x:10.5,z:35,y:24.75,stair:0});assert.equal(c.NVShipInterior.blocked(s,12.5,35),true);assert.equal(c.NVShipInterior.blocked(s,-10.5,35),true);assert.equal(c.NVShipInterior.blocked(s,10.5,34.9),false);
c.saved=JSON.parse(JSON.stringify(q));assert.equal(vm.runInContext('capitalInteriorRestore(saved).y',c),24.75);assert.equal(vm.runInContext('capitalInteriorRestore(saved).stair',c),0);
console.log('Passed all six stair flights in both directions, smooth elevation, rail/void collision and mid-stair restoration.');
