const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const core=fs.readFileSync(__dirname+'/galactic_diplomacy_core.js','utf8');
const history=fs.readFileSync(__dirname+'/catharsis_history.js','utf8');
const declaration=history.match(/^(?:const|let|var) NVCatharsisHistory=/m)[0];
const owner=core.split('\n').find(s=>s.trim().startsWith('const owner='));
const overlord=core.split('\n').find(s=>s.trim().startsWith('function overlord('));
const relation=core.split('\n').find(s=>s.trim().startsWith('function relation('));
const context=vm.createContext({assert});
vm.runInContext(`
const NVCatharsisRoute={CORE:'core'},NVSol={byId:{earth:{system:'sol'}}};
const chapter5Unlocked=()=>false,baseOwner=()=> 'HUMAN',baseRelation=()=> 'NEUTRAL';
const ensure=s=>s.eris.galacticDiplomacy,NVGalaxy={discovered:()=>false};
const key=(a,b)=>[a,b].sort().join('|');
function root(s,f){const seen=new Set();while(overlord(s,f)&&!seen.has(f)){seen.add(f);f=overlord(s,f);}return f;}
const s={eris:{galacticDiplomacy:{owners:{},subjects:{},eliminated:{},wars:[],relations:{},factions:{}}}};
${owner}\n${overlord}\n${relation}
assert.equal(owner(s,'earth'),'HUMAN');
assert.equal(overlord(s,'CATHARSIS'),'');
assert.equal(relation(s,'CUSTOM','CATHARSIS'),'NEUTRAL');
${declaration}{early:()=>true,world:()=>({id:'earth'})};
assert.equal(owner(s,'earth'),'CATHARSIS');
assert.equal(overlord(s,'CATHARSIS'),'GREK');
assert.equal(relation(s,'CUSTOM','CATHARSIS'),'NEUTRAL');
assert.equal(relation(s,'GREK','CATHARSIS'),'ALLIED');
`,context);
console.log('Passed diplomacy queries before and after Catharsis history initialization; no temporal-dead-zone startup failure.');
