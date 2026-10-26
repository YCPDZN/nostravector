const fs=require('fs'),vm=require('vm'),assert=require('assert');const c=vm.createContext({});vm.runInContext(fs.readFileSync(__dirname+'/citadel_collision.js','utf8'),c);const C=vm.runInContext('NVCitadel',c),base=()=>0;
assert.equal(C.height(0,63),15.5);assert.equal(C.height(7,63),15.5);assert.equal(C.height(-44,64),15.5);assert.equal(C.height(-24,64),15.5);
let p={x:0,z:29.9};for(let i=0;i<95;i++){const old={...p};p.z+=.35;C.resolve(p,old,base);}assert(p.z>62,'Stairs must reach the court.');
p={x:12,z:63};for(let i=0;i<20;i++){const old={...p};p.x+=.35;C.resolve(p,old,base);}assert(p.x<=13,'Terrace edge must stop walking through the floor.');
p={x:13,z:73};p.x=14;C.resolve(p,{x:13,z:73},base);assert.equal(p.x,13,'Wing wall must block ground movement.');
p={x:0,z:66.5};p.z=70;C.resolve(p,{x:0,z:66.5},base);assert.equal(p.z,66.5,'Dome must block terrace movement.');
p={x:-12,z:64};for(let i=0;i<90;i++){const old={...p};p.x-=.35;C.resolve(p,old,base);}assert(p.x<-40,'Bridge must reach the launchpad.');
console.log('Passed upper court/pad heights, stair ascent, terrace edges, wing walls, dome and bridge traversal.');
