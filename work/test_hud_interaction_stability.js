const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync(__dirname+'/clean_hud.js','utf8'),validation=source.slice(source.indexOf('function validateHUDInteraction()'),source.indexOf('function hudInteractionCandidates'));
const prompt={hidden:false},action={hidden:false,disabled:false,isConnected:true,click(){this.clicks=(this.clicks||0)+1;}};
const c=vm.createContext({$:()=>prompt,hudInteractionSource:action,updatePolarHUD:()=>{action.hidden=true;}});
vm.runInContext(validation+'\n'+fs.readFileSync(__dirname+'/hud_interaction_stability.js','utf8'),c);
prompt.onclick();assert.equal(action.clicks,1);vm.runInContext('updatePolarHUD()',c);assert(prompt.hidden);assert.equal(c.hudInteractionSource,null);prompt.onclick();assert.equal(action.clicks,1);
for(const [key,value]of [['hidden',true],['disabled',true],['isConnected',false]]){Object.assign(action,{hidden:false,disabled:false,isConnected:true,[key]:value});c.hudInteractionSource=action;prompt.hidden=false;prompt.onclick();assert(prompt.hidden);assert.equal(action.clicks,1);}
console.log('Passed same-update stale action removal and click-time rejection of hidden, disabled and detached interactions.');
