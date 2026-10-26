const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const custom=fs.readFileSync(__dirname+'/customizer.js','utf8');
const profile=custom.slice(custom.indexOf('const DEFAULT_WANDERER='),custom.indexOf('__SAVED_GAME__'));
const party=fs.readFileSync(__dirname+'/menu_party.js','utf8');
const saves=fs.readFileSync(__dirname+'/saved_game.js','utf8');
for(const existing of [false,true]){
  const roster={version:2,activeId:'original',saves:[{id:'original',wanderer:{name:'Original Wanderer'},progress:{chapter:3,checkpoint:'eris-arrival',antarctica:{africaStage:'complete',friendQuest:'recruited',eris:{nyrexia:{recruited:true}}}}}]};
  const storage=new Map(existing?[['nostravector.saves.v2',JSON.stringify(roster)]]:[]),before=JSON.stringify([...storage]);
  const elements=new Map(),$=s=>{if(!elements.has(s))elements.set(s,{dataset:{},setAttribute(){},textContent:''});return elements.get(s);};
  const ctx=vm.createContext({console,Date,Math,JSON,Number,Set,Map,crypto:{randomUUID:()=> 'test'},$,newGame:$('#newGame'),localStorage:{getItem:k=>storage.get(k)||null,setItem(){throw Error('Startup must not write saves');}}});
  // Reproduce build order: party code, save load and customizer menu sync BEFORE
  // the planet catalogue/location cache initialize. A call to menuLocation fails.
  vm.runInContext(party+'\n'+profile+'\n'+saves+`\nsavedGame=readGameSave();let savedWanderer=savedGame?savedGame.wanderer:DEFAULT_WANDERER;
    syncMenuCompanion();syncSavedGameMenu();
    const menuLocationSession=new Map();const NVSol={};
    function menuLocation(){return menuLocationSession.get(savedGame?.id)||NVSol.byId.earth;}`,ctx);
  assert.equal($('#primaryGameLabel').textContent,existing?'CONTINUE':'NEW GAME');
  assert.equal($('#menu').dataset.hasParty,String(existing));
  assert.equal(JSON.stringify([...storage]),before);
  if(existing)assert.equal(vm.runInContext('savedGame.progress.checkpoint',ctx),'eris-arrival');
}
console.log('Passed fresh and existing-save startup before planet initialization; Continue and saved progress preserved without storage writes.');
