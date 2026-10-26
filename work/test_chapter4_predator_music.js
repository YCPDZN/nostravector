const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const {createNVMusicPlayer}=require('./music_player.js');
const tracks=require('./music_audio.json').map(t=>({...t,source:t.file})),audio=[];
class Audio{constructor(){this.paused=true;this.currentTime=0;this.ended=false;audio.push(this);}pause(){this.paused=true;}play(){this.paused=false;return Promise.resolve();}}
const choices=[0,0,.3,.6,.99];let status,calls=0;
const soundtrack=createNVMusicPlayer({tracks,AudioClass:Audio,onStatus:s=>status=s,random:()=>choices[calls++%5]});
const c={gameActive:true,gamePaused:false,polarState:{x:0,z:0,jamesIntroductionDone:true,space:{phase:'landed'},eris:{chapter4:{stage:'awake'}}},animals:[],document:{hidden:false},soundtrack,ecologyPlayable:()=>c.polarState.space.phase==='landed',NVEcology:{populate:()=>({animals:c.animals})},NVChapter4:{raw:s=>s.eris.chapter4},chapter4Aftermath:q=>q?.stage==='awake',chapter4Open:false,chapter4Paused:false,chapter4MenuActive:()=>true,orionActive:()=>false,betrayalActive:()=>false,jamesConversation:{active:false},hazardModalActive:()=>false,currentJamesVoice:()=>null,currentHazardVoice:()=>null,introActive:false,customActive:false,Math};
vm.createContext(c);const source=fs.readFileSync('work/music_game.js','utf8');vm.runInContext(source.slice(source.indexOf('function syncSoundtrack()'),source.indexOf('function toggleMusic()')),c);
const sync=async()=>{c.syncSoundtrack();await Promise.resolve();await Promise.resolve();};
(async()=>{
await sync();assert.equal(status.scene,'roam-chapter4');assert.equal(status.title,'IS THERE MORE OUT THERE?');
for(const title of ['RUN!','AMBUSH','DANGER IS COMING!','UNDER FIRE']){
 c.animals=[{mode:'hunting',x:3,z:0}];await sync();assert.equal(status.scene,'predator');assert.equal(status.title,title);assert(audio.some(a=>!a.paused));const count=calls;
 c.gamePaused=true;await sync();assert(audio.every(a=>a.paused));c.gamePaused=false;await sync();assert.equal(calls,count);assert.equal(status.title,title);
 c.animals=[];await sync();assert.equal(status.scene,'roam-chapter4');assert.equal(status.title,'IS THERE MORE OUT THERE?');
}
assert.equal(calls,5);c.animals=[{mode:'hunting',x:30,z:0}];await sync();assert.equal(status.scene,'roam-chapter4');
c.polarState.space.phase='flight';c.polarState.space.combatActive=true;await sync();assert.equal(status.scene,'chapter4-silence');
c.polarState.space.phase='landed';c.animals=[{mode:'hunting',x:2,z:0}];c.chapter4Open=true;await sync();assert.equal(status.scene,'chapter4-silence');
c.gameActive=false;c.chapter4Open=false;await sync();assert.equal(status.scene,'menu-chapter4');assert.equal(status.title,'CATHARSIS');
console.log('Passed all four Chapter 4 predator themes, random encounter selection, pause/resume stability, return to Chapter 4 exploration, range gate, silent space combat/cutscenes, and CATHARSIS menu.');
})().catch(e=>{console.error(e);process.exitCode=1;});
