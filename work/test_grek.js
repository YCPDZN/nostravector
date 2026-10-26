const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),A=require('./antarctica_core.js');
const metadata=JSON.parse(fs.readFileSync(__dirname+'/grek_audio.json','utf8'));
const elements=new Map(),matrices=[],clips=[],entries=new WeakMap();let draws=0,blockPlayback=false,pendingPlay=null;
const gl=new Proxy({createProgram:()=>({}),createShader:()=>({}),createBuffer:()=>({}),getShaderParameter:()=>true,getProgramParameter:()=>true,getUniformLocation:(_,n)=>n,getAttribLocation:()=>0,bufferData:(_,d)=>assert.ok(Array.from(d).every(Number.isFinite)),uniformMatrix4fv:(loc,_,d)=>{assert.ok(d.every(Number.isFinite));if(loc==='model')matrices.push(Array.from(d));},drawElements:()=>draws++},{get:(o,k)=>k in o?o[k]:k===String(k).toUpperCase()?k:()=>{}});
function element(id){if(!elements.has(id))elements.set(id,{style:{},dataset:{},textContent:'',disabled:false,focus(){},getContext:()=>gl,addEventListener(){},getBoundingClientRect:()=>({width:880,height:720})});return elements.get(id);}
class Clip{
 constructor(source){this.src=source;this.duration=metadata[clips.length].duration;this.paused=true;this.ended=false;this.time=0;this.playCount=0;clips.push(this);}
 get currentTime(){return this.time;}set currentTime(t){this.time=t;this.ended=false;}
 play(){this.playCount++;if(blockPlayback){this.paused=true;return Promise.reject(Error('Autoplay blocked'));}this.paused=false;if(pendingPlay)return pendingPlay;return Promise.resolve();}
 pause(){this.paused=true;}tick(dt){if(this.paused||this.ended)return;this.time=Math.min(this.duration,this.time+dt);if(this.time>=this.duration){this.ended=true;this.paused=true;}}
}
function acoustics(a){if(!entries.has(a))entries.set(a,{envelope:{rms:Float32Array.from([0,.9,0]),spoken:Float32Array.from([0,.04,1]),hopSeconds:.2}});return entries.get(a);}
const ctx=vm.createContext({console,Math,Number,Array,Float32Array,Uint16Array,NVAntarctica:A,Audio:Clip,document:{hidden:false},window:{devicePixelRatio:1},$:element,prepareJamesAcoustics:acoustics,resumeJamesAcoustics(){}});
vm.runInContext('let gameActive=true,gamePaused=false,polarState=NVAntarctica.fresh(123),polarClock=1;const polarCanvas={focus(){}};function updatePolarHUD(){updateGrekDream();}',ctx);
const speechSource=fs.readFileSync(__dirname+'/antarctica_speech.js','utf8'),viseme=speechSource.slice(speechSource.indexOf('function calculateJamesViseme'),speechSource.indexOf('let jamesLipPose'));
vm.runInContext(viseme,ctx);
for(const source of ['grek_model.js','grek_renderer.js','grek_dialogue.js'])vm.runInContext(fs.readFileSync(__dirname+'/'+source,'utf8').replace('__GREK_VOICES__',JSON.stringify(metadata.map(q=>({...q,source:'data:audio/mpeg;base64,'+fs.readFileSync(__dirname+'/'+q.file).toString('base64')})))),ctx);
const run=s=>vm.runInContext(s,ctx),meshes=run('GrekModel.meshes');
async function settle(){await Promise.resolve();await Promise.resolve();}
(async()=>{
assert.equal(clips.length,5);metadata.forEach((q,i)=>{assert.equal(q.file,'audio/grek/GREK'+(i+1)+'.mp3');assert.ok(q.duration>4);assert.equal(clips[i].src,'data:audio/mpeg;base64,'+fs.readFileSync(__dirname+'/'+q.file).toString('base64'));});
assert.ok(meshes.length>=100);for(const m of meshes){assert.equal(m.p.length,m.n.length);assert.equal(m.indices.length%3,0);assert.ok(m.p.every(Number.isFinite));assert.ok(m.n.every(Number.isFinite));assert.ok(m.indices.every(i=>Number.isInteger(i)&&i>=0&&i<m.p.length/3));}
assert.equal(run('GREK_QUOTES.length'),5);assert.match(run('GREK_QUOTES[0]'),/James Brown is not trustworthy/);
run('polarState.dreamActive=true;polarState.bedSleeping=true;startGrekLine();');await settle();assert.equal(clips[0].paused,false);assert.equal(run('grekSpeech.index'),0);
clips[0].tick(.25);run('tickGrekDialogue(.25);');assert.ok(run('grekLipPose().open')>0,'Recorded energy opens the mouth.');
clips[0].currentTime=.45;assert.equal(run('grekLipPose().open'),0,'Recorded silence closes the mouth.');
run('updateGrekDream();');assert.ok(draws>=meshes.length);const closedStart=matrices.length;run('grekSpeech.render(1,{open:0,round:0});');const closed=matrices.slice(closedStart),openStart=matrices.length;run('grekSpeech.render(1,{open:.9,round:.8});');const open=matrices.slice(openStart);
const jawIndex=meshes.findIndex(m=>m.bone==='jaw'),headIndex=meshes.findIndex(m=>m.name==='cranium');assert.notDeepEqual(open[jawIndex],closed[jawIndex]);assert.deepEqual(open[headIndex],closed[headIndex]);
clips[0].currentTime=2.2;run('gamePaused=true;pauseGrekVoice(true);');assert.equal(clips[0].paused,true);assert.equal(run('grekLipPose().open'),0);assert.equal(run('polarState.dreamVoiceTime'),2.2);
const saved=run('NVAntarctica.snapshot(polarState)');saved.bedBuilt=true;saved.ferryDialogueDone=true;saved.x=A.BED.x;saved.z=A.BED.z;
const restored=A.restored({antarctica:saved},'dream');assert.equal(restored.dreamVoiceTime,2.2);assert.equal(restored.dreamIndex,0);assert.equal(restored.dreamActive,true);
ctx.restoredState=restored;run('stopGrekVoice();polarState=restoredState;gamePaused=false;startGrekLine();');await settle();assert.equal(clips[0].currentTime,2.2,'Continue seeks to the saved recording position.');
run('polarState.dreamTime=4;');clips[0].tick(.2);run('tickGrekDialogue(.2);');assert.equal(run('polarState.dreamIndex'),0,'The recording remains active beyond the reading window.');
run('grekSpeech.muted=true;currentGrekVoice().volume=0;');assert.equal(run('grekLipPose().open'),0);run('grekSpeech.muted=false;currentGrekVoice().volume=.95;');
clips[0].tick(10);run('tickGrekDialogue(.05);');assert.equal(run('polarState.dreamIndex'),0);run('tickGrekDialogue(1.3);');await settle();assert.equal(run('polarState.dreamIndex'),1);assert.equal(element('#dreamNumber').textContent,'02 / 05 · THE STRANGER’S WARNING');
for(let i=1;i<5;i++){assert.equal(run('grekSpeech.index'),i);assert.equal(clips[i].paused,false);run('polarState.dreamTime=4;');clips[i].tick(metadata[i].duration+.1);run('tickGrekDialogue(.05);tickGrekDialogue(1.3);');await settle();}
assert.equal(run('polarState.dreamDone'),true);assert.equal(run('polarState.dreamActive'),false);assert.ok(clips.every(a=>a.paused));
blockPlayback=true;run('polarState=NVAntarctica.fresh(2);polarState.dreamActive=true;stopGrekVoice();startGrekLine();');await settle();run('tickGrekDialogue(30);updateGrekDream();');assert.equal(run('polarState.dreamIndex'),0);assert.equal(element('#grekVoice').textContent,'PLAY VOICE');assert.equal(run('grekLipPose().open'),0);
blockPlayback=false;element('#grekVoice').onclick();await settle();assert.equal(clips[0].paused,false);assert.equal(run('grekSpeech.blocked'),false);
clips[0].onerror();run('tickGrekDialogue(12);');await settle();assert.equal(run('polarState.dreamIndex'),1,'A missing recording has a caption fallback.');
let resolvePending;pendingPlay=new Promise(resolve=>resolvePending=resolve);run('polarState=NVAntarctica.fresh(3);polarState.dreamActive=true;stopGrekVoice();startGrekLine();stopGrekVoice();gameActive=false;');resolvePending();await settle();assert.ok(clips.every(a=>a.paused));assert.equal(run('grekLipPose().open'),0);
const malformed=A.restored({antarctica:{dreamIndex:2.9,dreamVoiceTime:Infinity}},'bad');assert.equal(malformed.dreamIndex,2);assert.equal(malformed.dreamVoiceTime,0);
const glb=fs.readFileSync(__dirname+'/../outputs/NOSTRAVECTOR_Grek.glb');assert.equal(glb.readUInt32LE(0),0x46546c67);assert.equal(glb.readUInt32LE(4),2);assert.equal(glb.readUInt32LE(8),glb.length);
const jsonLength=glb.readUInt32LE(12),gltf=JSON.parse(glb.subarray(20,20+jsonLength).toString()),binaryStart=28+jsonLength;
assert.equal(gltf.meshes.length,meshes.length);assert.equal(gltf.nodes[3].name,'Jaw');assert.equal(gltf.animations[0].channels[0].target.node,3);
for(const view of gltf.bufferViews)assert.ok(view.byteOffset>=0&&view.byteOffset+view.byteLength<=gltf.buffers[0].byteLength);
for(const accessor of gltf.accessors){const view=gltf.bufferViews[accessor.bufferView],components={SCALAR:1,VEC3:3,VEC4:4}[accessor.type],bytes=accessor.componentType===5123?2:4;assert.ok(accessor.count*components*bytes<=view.byteLength);if(accessor.componentType===5126)for(let i=0;i<accessor.count*components;i++)assert.ok(Number.isFinite(glb.readFloatLE(binaryStart+view.byteOffset+i*4)));}
console.log('Passed: supplied GREK1–5 order and bytes, recording-driven mouth/silence, clip-end timing, pause/seek/manual checkpoints, autoplay recovery, mute/error fallback, stale playback and GLB integrity.');
})().catch(e=>{console.error(e);process.exitCode=1;});
