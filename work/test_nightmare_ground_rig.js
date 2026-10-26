const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),A=require('./antarctica_core.js');
const c={NVAntarctica:A};vm.createContext(c);vm.runInContext(fs.readFileSync('work/companion_motion.js','utf8')+'\n'+fs.readFileSync('work/ground_player_rig.js','utf8')+'\nglobalThis.M=NVCompanionMotion;',c);const rig=c.createNVGroundPlayerRig({A,M:c.M});
const apply=(m,p)=>[0,1,2].map(i=>m[i]*p[0]+m[i+4]*p[1]+m[i+8]*p[2]+m[i+12]);
for(const speed of [0,A.WALK,A.SPRINT])for(let phase=0;phase<7;phase+=.17)for(const aim of [0,.65,1]){const p=rig({x:0,y:0,z:0,yaw:0,aim,rifle:true},phase,speed,0);for(const matrix of Object.values(p.bones)){assert.equal(matrix.length,16);assert(matrix.every(Number.isFinite));}for(const [side,sign]of [['L',1],['R',-1]]){const wrist=apply(p.bones[side+'-lowerArm'],[sign*.577,.88,.016]);assert(wrist.every(Number.isFinite));if(speed===0&&aim===0){assert(Math.abs(wrist[0])<.4,'resting arms lowered from the source A-pose');assert(wrist[1]<1);}}}
assert.equal(c.NVGroundPlayerBone({name:'left upper arm'}),'L-upperArm');assert.equal(c.NVGroundPlayerBone({name:'right boot'}),'R-foot');
console.log('Passed shared walk/run/aim skeletal matrices, lowered resting arms and player limb assignments.');

