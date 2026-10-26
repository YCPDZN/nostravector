const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),crypto=require('node:crypto'),path=require('node:path');
const records=JSON.parse(fs.readFileSync('work/project_bc_combat_audio.json','utf8'));
assert.equal(records.length,17);assert.equal(new Set(records.map(r=>r.key)).size,17);
for(const r of records){const bytes=fs.readFileSync('work/'+r.file),original=fs.readFileSync('C:/Users/HOME/Documents/NOSTRAVECTOR/giving orders - voice lines/combat quotes/'+path.basename(r.file));assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),r.sha256);assert(bytes.equals(original));assert(r.duration>1&&r.duration<10);}
const events={},c=vm.createContext({Map,Math,Promise,console,blockedTest:false,gameActive:true,gamePaused:false,document:{hidden:false,addEventListener:(key,fn)=>events[key]=fn}});
vm.runInContext(`
let caption={npcId:'custom-1',voiceKey:'josiah:0',time:4.527};
const polarState={};const NVBCCombat={playable:()=>true,state:()=>({caption})};
const NVCustomCrew={followers:()=>[{id:'custom-1'}]};
function ecologyPlayable(){return true;}function khazglarCutsceneActive(){return false;}function imperiaArrivalActive(){return false;}
let updatePolarHUD=()=>{},pausePolar=on=>{gamePaused=on;},exitPolar=()=>{gameActive=false;};
class Audio{constructor(src){this.src=src;this.currentTime=0;this.paused=true;this.ended=false;this.plays=0;}play(){this.plays++;if(blockedTest)return Promise.reject(Error('Autoplay blocked'));this.paused=false;return Promise.resolve();}pause(){this.paused=true;}}
`,c);
vm.runInContext(fs.readFileSync('work/project_bc_combat_recordings.js','utf8').replace('__BC_COMBAT_RECORDINGS__',JSON.stringify(records.map(r=>({...r,source:r.file})))),c);
const run=code=>vm.runInContext(code,c),settle=()=>new Promise(resolve=>setImmediate(resolve));
(async()=>{
 for(const r of records){run(`caption={npcId:'custom-1',voiceKey:${JSON.stringify(r.key)},time:1};NVBCVoice.sync()`);await settle();assert.equal(run('NVBCVoice.status().key'),r.key);assert(run('NVBCVoice.speaking()'));assert(run('caption.time')>=r.duration+.39);assert.equal(run('[...NVBCVoice.clips.values()].filter(r=>!r.a.paused).length'),1);}
 run("let interrupted=caption;NVBCVoice.clips.get(caption.voiceKey).a.currentTime=.8;caption={npcId:'custom-1',voiceKey:'josiah:heaven',time:3};NVBCVoice.sync()");await settle();assert.equal(run('interrupted.voiceTime'),.8);assert.equal(run('NVBCVoice.status().key'),'josiah:heaven');
 run('caption=interrupted;NVBCVoice.sync()');await settle();assert.equal(run('NVBCVoice.status().time'),.8);
 run('pausePolar(true)');assert(run('NVBCVoice.status().paused'));assert(!run('NVBCVoice.speaking()'));run('pausePolar(false)');await settle();assert(!run('NVBCVoice.status().paused'));assert.equal(run('NVBCVoice.status().time'),.8);
 c.document.hidden=true;events.visibilitychange();assert(run('NVBCVoice.status().paused'));c.document.hidden=false;events.visibilitychange();await settle();assert(!run('NVBCVoice.status().paused'));
 run("blockedTest=true;caption={npcId:'custom-1',voiceKey:'peter:0',time:4};NVBCVoice.sync()");await settle();assert(run('NVBCVoice.status().blocked'));run('blockedTest=false');events.pointerdown();await settle();assert(!run('NVBCVoice.status().blocked'));assert(run('NVBCVoice.speaking()'));
 run("NVBCVoice.clips.get('peter:0').a.onended()");assert(run('caption.time<=.4'));
 run('exitPolar()');assert.equal(run('NVBCVoice.status().key'),'');assert(run('[...NVBCVoice.clips.values()].every(r=>r.a.paused)'));
 console.log('Passed exact source checksums and all 17 mappings, duration-aware captions, one voice at a time, interrupted-line playhead, pause/resume, hidden tabs, blocked-playback retry, natural end and menu cleanup.');
})().catch(e=>{console.error(e);process.exit(1);});
