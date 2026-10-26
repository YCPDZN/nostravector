const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const custom=fs.readFileSync(__dirname+'/customizer.js','utf8');
const profileCode=custom.slice(custom.indexOf('const DEFAULT_WANDERER='),custom.indexOf('__SAVED_GAME__'));
const saveCode=fs.readFileSync(__dirname+'/saved_game.js','utf8');
function runtime(storage=new Map(),failWrites=false){
  let sequence=0;const elements=new Map();
  const node=()=>({textContent:'',dataset:{},children:[],attrs:{},events:{},style:{setProperty(){}},focus(){this.focused=true;},close(){this.open=false;this.events.close?.();},showModal(){this.open=true;},setAttribute(k,v){this.attrs[k]=v;},append(...children){this.children.push(...children);},replaceChildren(...children){this.children=[...children];},addEventListener(k,handler){this.events[k]=handler;}});
  const element=s=>{if(!elements.has(s))elements.set(s,node());return elements.get(s);};
  const context=vm.createContext({Date,Math,JSON,Number,Set,gameActive:false,storageBlocked:failWrites,cleanupBlocked:false,crypto:{randomUUID:()=>`slot-${++sequence}`},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>{if(context.storageBlocked)throw Error('Unavailable storage');storage.set(k,v);},removeItem:k=>{if(context.cleanupBlocked)throw Error('Unavailable cleanup');storage.delete(k);}},document:{createElement:node},$:element,newGame:element('#newGame'),syncMenuWanderer(){},chime(){}});
  vm.runInContext(profileCode+'\n'+saveCode+'\nlet savedWanderer={...DEFAULT_WANDERER};\n'+fs.readFileSync(__dirname+'/chapter_restart.js','utf8')+'\n'+fs.readFileSync(__dirname+'/save_management.js','utf8'),context);
  return code=>vm.runInContext(code,context);
}
const storage=new Map(),run=runtime(storage);
assert.equal(run('readGameSave()'),null);
run("creatingCharacter=true;writeGameSave({...DEFAULT_WANDERER,name:'Alpha',suit:'#aa3322'});creatingCharacter=false;savedWanderer=savedGame.wanderer;");
const first=run('savedGame.id');
run("updateGameProgress({chapter:2,checkpoint:'orbital-launch',playTimeSeconds:123,world:{location:'orbit'},inventory:['beacon']});writeGameSave({...savedGame.wanderer,hair:'curly'});");
const beforeSecond=run('JSON.stringify(characterSaves[0])');
run("creatingCharacter=true;writeGameSave({...DEFAULT_WANDERER,name:'Beta',suit:'#3344aa'});creatingCharacter=false;savedWanderer=savedGame.wanderer;");
assert.equal(run('characterSaves.length'),2);
assert.notEqual(run('savedGame.id'),first);
assert.equal(run('savedGame.progress.chapter'),1);
assert.equal(run('JSON.stringify(characterSaves[0])'),beforeSecond);
run("updateGameProgress({chapter:3,checkpoint:'lunar-landing',playTimeSeconds:456,inventory:['scanner']});");
run(`switchCharacter(${JSON.stringify(first)});`);
assert.equal(run('savedGame.wanderer.name'),'Alpha');
assert.equal(run('savedGame.wanderer.hair'),'curly');
assert.equal(run('savedGame.progress.chapter'),2);
assert.equal(run('JSON.stringify(savedGame.progress.inventory)'),JSON.stringify(['beacon']));
assert.equal(run('characterSaves[1].progress.chapter'),3);
const reload=runtime(storage);reload('savedGame=readGameSave();');
assert.equal(reload('savedGame.id'),first);
assert.equal(reload('characterSaves.length'),2);
assert.equal(reload('savedGame.progress.world.location'),'orbit');
const legacyStore=new Map([['nostravector.save.v1',JSON.stringify({version:1,checkpoint:'character-created',createdAt:'2026-10-01T00:00:00Z',wanderer:{name:'CHEAF',suit:'#0070cc'}})]]);
const legacy=runtime(legacyStore);legacy('savedGame=readGameSave();');
assert.equal(legacy('savedGame.wanderer.name'),'CHEAF');
assert.equal(legacy('savedGame.createdAt'),'2026-10-01T00:00:00Z');
legacy('savedGame=readGameSave();');assert.equal(legacy('characterSaves.length'),1);
const unavailable=runtime(new Map(),true);unavailable("creatingCharacter=true;writeGameSave({...DEFAULT_WANDERER,name:'Session'});");
assert.equal(unavailable('savePersisted'),false);
assert.equal(unavailable('characterSaves[0].wanderer.name'),'Session');
console.log('Passed: independent character progress, editing preservation, switching, reload, migration and session saves.');

// Reusing a starting template cannot share nested empire/territory objects.
const isolated=runtime();
isolated("let template={chapter:3,antarctica:{eris:{customCrew:{characters:[]},playerFaction:{claims:[]}}}};creatingCharacter=true;writeGameSave({...DEFAULT_WANDERER,name:'First'},template);writeGameSave({...DEFAULT_WANDERER,name:'Second'},template);creatingCharacter=false;savedGame.progress.antarctica.eris.customCrew.characters.push({id:'custom-1',system:'cluster-03'});savedGame.progress.antarctica.eris.playerFaction.claims.push('cluster-03-p1');");
assert.equal(isolated('characterSaves[0].progress.antarctica.eris.customCrew.characters.length'),0);
assert.equal(isolated('characterSaves[0].progress.antarctica.eris.playerFaction.claims.length'),0);
assert.equal(isolated('template.antarctica.eris.customCrew.characters.length'),0);
console.log('Passed nested empire and territory isolation when reusing a starting template.');

// Release builds block reset without changing progress or other character saves.
const manageStorage=new Map([['unrelated.preference','keep me']]),manage=runtime(manageStorage);
manage("creatingCharacter=true;writeGameSave({...DEFAULT_WANDERER,name:'One',hair:'curly'});creatingCharacter=false;savedWanderer=savedGame.wanderer;updateGameProgress({chapter:3,checkpoint:'antarctica-station',playTimeSeconds:42,antarctica:{stationFound:true},inventory:['supplies']});");
const one=manage('savedGame.id'),appearance=manage('JSON.stringify(savedGame.wanderer)'),createdAt=manage('savedGame.createdAt');
manage("creatingCharacter=true;writeGameSave({...DEFAULT_WANDERER,name:'Two'});creatingCharacter=false;savedWanderer=savedGame.wanderer;updateGameProgress({chapter:2,checkpoint:'mars',playTimeSeconds:99});");
const two=manage('savedGame.id'),twoBefore=manage('JSON.stringify(savedGame)');
const oneBefore=manage(`JSON.stringify(characterSaves.find(s=>s.id===${JSON.stringify(one)}))`);
assert.equal(manage(`resetCharacterProgress(${JSON.stringify(one)}).ok`),false);
assert.equal(manage('JSON.stringify(savedGame)'),twoBefore,'A blocked reset leaves the active save untouched.');
assert.equal(manage(`JSON.stringify(characterSaves.find(s=>s.id===${JSON.stringify(one)}))`),oneBefore);
manage(`switchCharacter(${JSON.stringify(one)});`);
assert.equal(manage('JSON.stringify(savedGame.wanderer)'),appearance);assert.equal(manage('savedGame.createdAt'),createdAt);
assert.equal(manage('savedGame.progress.chapter'),3);assert.equal(manage('savedGame.progress.antarctica.stationFound'),true);
assert.equal(manage("$('#primaryGameLabel').textContent"),'CONTINUE');
const countBeforeCancel=manageStorage.get('nostravector.saves.v2');
manage("openCharacterSelect();requestSaveChange('remove',savedGame.id);");
assert.equal(manage("$('#saveManagement').open"),true);assert.equal(manage("$('#cancelSaveChange').focused"),true);
assert.ok(manage("$('#saveManagementCopy').textContent").includes('One'));
manage("$('#cancelSaveChange').onclick();");assert.equal(manage('pendingSaveChange'),null);assert.equal(manageStorage.get('nostravector.saves.v2'),countBeforeCancel);
// A rejected storage write keeps both memory and persisted progress unchanged.
manage("storageBlocked=true;requestSaveChange('remove',savedGame.id);confirmSaveChange();");
assert.equal(manage('characterSaves.length'),2);assert.equal(manage('savedGame.id'),one);assert.equal(manageStorage.get('nostravector.saves.v2'),countBeforeCancel);assert.equal(manage("$('#saveManagement').open"),true);assert.ok(manage("$('#saveManagementError').textContent").includes('have not changed'));
manage("storageBlocked=false;confirmSaveChange();");assert.equal(manage('savedGame.id'),two);assert.equal(manage('characterSaves.length'),1);assert.equal(manage('JSON.stringify(savedGame)'),twoBefore);
const afterRemoval=runtime(manageStorage);afterRemoval('savedGame=readGameSave();');assert.equal(afterRemoval('savedGame.id'),two);assert.equal(afterRemoval('characterSaves.length'),1);
manage(`requestSaveChange('remove',${JSON.stringify(two)});confirmSaveChange();`);
assert.equal(manage('savedGame'),null);assert.equal(manage('activeCharacterId'),null);assert.equal(manage('savedWanderer.name'),'The Wanderer');assert.equal(manage("$('#primaryGameLabel').textContent"),'NEW GAME');assert.equal(manage("$('#noCharacters').hidden"),false);
const emptyReload=runtime(manageStorage);assert.equal(emptyReload('readGameSave()'),null);
// Erase all clears this game's migration data without clearing unrelated browser data.
manageStorage.set('nostravector.save.v1',JSON.stringify({version:1,wanderer:{name:'Legacy'}}));manageStorage.set('nostravector.wanderer.v1',JSON.stringify({name:'Legacy Profile'}));
manage("creatingCharacter=true;writeGameSave({...DEFAULT_WANDERER,name:'Three'});creatingCharacter=false;savedWanderer=savedGame.wanderer;requestSaveChange('erase-all');");
assert.ok(manage("$('#saveManagementCopy').textContent").includes('all 1 saved Wanderer'));
manage('confirmSaveChange();');assert.equal(manage('characterSaves.length'),0);assert.equal(manageStorage.has('nostravector.save.v1'),false);assert.equal(manageStorage.has('nostravector.wanderer.v1'),false);assert.equal(manageStorage.get('unrelated.preference'),'keep me');
const erased=runtime(manageStorage);assert.equal(erased('readGameSave()'),null);
// A legacy-cleanup failure cannot resurrect deleted characters through migration.
manageStorage.set('nostravector.save.v1',JSON.stringify({version:1,wanderer:{name:'Legacy'}}));
manage('cleanupBlocked=true;eraseAllGameSaves();');const tombstone=runtime(manageStorage);assert.equal(tombstone('readGameSave()'),null);
manage('cleanupBlocked=false;eraseAllGameSaves();');assert.equal(manageStorage.has('nostravector.save.v1'),false);
manage("creatingCharacter=true;writeGameSave({...DEFAULT_WANDERER,name:'In expedition'});creatingCharacter=false;gameActive=true;");
assert.equal(manage('eraseAllGameSaves().ok'),false);assert.equal(manage('characterSaves.length'),1,'Live autosaves cannot recreate deleted saves: management is restricted to the menu.');
console.log('Passed: blocked reset, confirmed/cancelled removal, independent progress, active/last character removal, storage failure, full erase, legacy cleanup and no save resurrection.');
