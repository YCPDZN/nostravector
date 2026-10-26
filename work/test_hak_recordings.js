const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const elements=new Map();function element(){return{hidden:false,textContent:'',append(){},setAttribute(){},innerHTML:''};}const $=id=>{if(!elements.has(id))elements.set(id,element());return elements.get(id);};
class Clip{constructor(source){this.source=source;this.paused=true;this.ended=false;this.currentTime=0;this.duration=8;}play(){this.paused=false;}pause(){this.paused=true;}}
const clips=JSON.parse(fs.readFileSync(__dirname+'/hak_audio.json','utf8')).map(q=>({...q,source:q.file}));
const ctx=vm.createContext({Audio:Clip,document:{hidden:false,createElement:element,addEventListener(){}},$,gameActive:true,gamePaused:false,polarState:{africaStage:'visitor',africaTime:0},polarKeys:{clear(){}},polarAutoWalk:false,polarSprint:false,polarCanvas:{focus(){}},updatePolarHUD(){},tickAfricaJourney(){},exitPolar(){},NVAfrica:{arrive(s){s.africaStage='title';s.africaStarted=true;}},prepareJamesAcoustics(){return{envelope:{rms:[0],spoken:[0],hopSeconds:1}};},resumeJamesAcoustics(){},calculateJamesViseme(){return{jaw:.5,round:.2};},createGrekRenderer:()=>()=>{},HakModel:{},performance:{now:()=>0},console});
vm.runInContext(fs.readFileSync(__dirname+'/hak_game.js','utf8').replace('__HAK_VOICES__',JSON.stringify(clips)),ctx);
const run=s=>vm.runInContext(s,ctx);
run('updatePolarHUD()');assert.equal(run('hakVoice.index'),0);assert.equal(run('hakClips[0].paused'),false);assert.equal(run('hakLipPose().open'),0);
run('gamePaused=true;updatePolarHUD()');assert.equal(run('hakClips[0].paused'),true);
run('gamePaused=false;updatePolarHUD()');assert.equal(run('hakClips[0].paused'),false);
run('advanceHak()');assert.equal(run('hakVoice.index'),1);assert.equal(run('hakClips[0].paused'),true);
for(let i=1;i<5;i++){assert.equal(run('hakVoice.index'),i);assert.equal(run('hakClips[hakVoice.index].source'),`audio/hak/HAK${i+1}.mp3`);run('hakClips[hakVoice.index].ended=true;tickAfricaJourney(1.2)');}
assert.equal(ctx.polarState.africaStage,'title');assert.equal(run('hakVoice.index'),-1);
run('polarState.africaStage="visitor";polarState.africaTime=0;updatePolarHUD();exitPolar()');assert.equal(run('hakClips.every(a=>a.paused)'),true);
console.log('Passed Hak voice ordering, silent mouth pose, pause/resume, skip, end-of-recording progression, tutorial handoff and exit cleanup.');
