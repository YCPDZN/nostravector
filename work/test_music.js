const assert = require('node:assert/strict');
const {createNVMusicPlayer} = require('./music_player.js');
const tracks = require('./music_audio.json').map(q => ({...q, source:q.file}));
let instances = [], blocked = false, hold = null, last;
class FakeAudio {
  constructor(source) { this.source=source;this.paused=true;this.ended=false;this.currentTime=0;this.calls=0;instances.push(this); }
  pause() { this.paused=true; }
  play() {
    this.calls++;
    if (hold) return new Promise(resolve => {hold.resolve=()=>{this.paused=false;resolve();};});
    if (blocked) return Promise.reject(Object.assign(new Error('Gesture required'),{name:'NotAllowedError'}));
    this.paused=false;this.ended=false;return Promise.resolve();
  }
}
const flush = async()=>{await Promise.resolve();await Promise.resolve();};
(async()=>{
  const choices=[0,0,.3,.6,.99];let randomCalls=0;
  const player=createNVMusicPlayer({tracks,AudioClass:FakeAudio,onStatus:s=>last=s,random:()=>{randomCalls++;return choices.shift();}});
  assert.equal(instances[0].loop,true);
  player.setContext({scene:'menu'});await flush();player.tick(1);
  assert.equal(instances[0].paused,false);assert.equal(instances[0].volume,.3);
  player.setContext({scene:'silent'});assert.ok(instances.every(a=>a.paused));
  player.setContext({scene:'roam'});await flush();player.tick(1);
  assert.equal(last.title,'WONDERS OF LANIAKEA');assert.equal(instances[0].paused,true);
  player.setContext({scene:'roam',duck:true});player.tick(1);
  assert.equal(instances[1].volume,.06,'Voice ducking reduces music to 20%.');
  player.setContext({scene:'roam'});player.tick(1);assert.equal(instances[1].volume,.3);
  for(const [index,next] of [[1,2],[2,3],[3,1]]) {
    instances[index].paused=true;instances[index].ended=true;instances[index].onended();await flush();
    assert.equal(last.title,tracks[next].title);assert.equal(instances[next].paused,false);
    player.setContext({scene:'roam',duck:true});player.tick(1);assert.equal(instances[next].volume,.06,'All three free-roam songs duck during dialogue.');player.setContext({scene:'roam'});player.tick(1);assert.equal(instances[next].volume,.3);
    assert.equal(instances.filter(a=>!a.paused).length,1);
  }
  instances[1].currentTime=88;
  for(const [index,title] of [[5,'RUN!'],[6,'AMBUSH'],[7,'DANGER IS COMING!'],[8,'UNDER FIRE']]){
    player.setContext({scene:'predator'});await flush();assert.equal(last.title,title);assert.equal(instances[index].loop,true);
    const calls=randomCalls;instances[index].currentTime=12;
    player.setContext({scene:'predator',paused:true});assert.ok(instances.every(a=>a.paused));
    player.setContext({scene:'predator'});await flush();assert.equal(randomCalls,calls);assert.equal(instances[index].currentTime,12);
    player.setContext({scene:'roam'});await flush();assert.equal(instances[index].paused,true);assert.equal(instances[1].currentTime,88);
  }
  assert.equal(randomCalls,5,'The initial roam choice and each new predator encounter choose once; pause/resume keeps their choices.');
  player.setContext({scene:'combat'});await flush();player.tick(1);
  assert.equal(last.title,'WONDERS OF LANIAKEA (COMBAT VERSION)');assert.equal(instances[4].loop,true);
  assert.equal(instances[1].paused,true);assert.equal(instances[4].paused,false);
  player.setContext({scene:'combat',paused:true});assert.ok(instances.every(a=>a.paused));
  player.setContext({scene:'combat'});await flush();assert.equal(instances[4].paused,false);
  player.setContext({scene:'roam'});await flush();assert.equal(instances[4].paused,true);assert.equal(instances[1].currentTime,88);
  player.setContext({scene:'roam',paused:true});assert.ok(instances.every(a=>a.paused));
  player.setContext({scene:'roam'});await flush();assert.equal(instances[1].currentTime,88);
  player.setContext({scene:'roam',hidden:true});assert.ok(instances.every(a=>a.paused));
  player.setContext({scene:'roam'});await flush();assert.equal(instances[1].currentTime,88);
  player.setEnabled(false);player.unlock();assert.ok(instances.every(a=>a.paused));assert.equal(last.enabled,false);
  player.setEnabled(true);await flush();player.setVolume(.7);player.tick(2);assert.equal(instances[1].volume,.7);
  player.setContext({scene:'menu'});await flush();assert.equal(instances[1].paused,true);assert.equal(instances[0].paused,false);
  player.setContext({scene:'silent'});blocked=true;player.setContext({scene:'menu'});await flush();assert.equal(last.blocked,true);
  const calls=instances[0].calls;
  for(let i=0;i<20;i++)player.setContext({scene:'menu'});
  assert.equal(instances[0].calls,calls,'Autoplay rejection does not cause repeated playback attempts.');
  blocked=false;player.unlock();await flush();assert.equal(last.blocked,false);assert.equal(instances[0].paused,false);
  player.setContext({scene:'silent'});hold={};player.setContext({scene:'menu'});player.setContext({scene:'silent'});
  hold.resolve();await flush();assert.ok(instances.every(a=>a.paused),'Late play resolution cannot leak music into another scene.');
  hold=null;
  const chapter4Index=tracks.findIndex(q=>q.role==='menu-chapter4');
  player.setContext({scene:'menu-chapter4'});await flush();player.tick(1);
  assert.equal(last.title,'CATHARSIS');assert(instances[chapter4Index].loop);assert(instances[0].paused);
  instances[chapter4Index].currentTime=25;
  player.setEnabled(false);assert(instances[chapter4Index].paused);
  player.setEnabled(true);await flush();assert.equal(instances[chapter4Index].currentTime,25);
  player.setContext({scene:'menu-chapter4',paused:true});assert(instances[chapter4Index].paused);
  player.setContext({scene:'menu'});await flush();assert(instances[chapter4Index].paused);assert(!instances[0].paused);
  player.setContext({scene:'silent'});
  player.setContext({scene:'roam'});await flush();
  player.setContext({scene:'chapter4-silence'});await flush();
  assert(instances.every(a=>a.paused),'Post-attack silence stops every music track.');assert.equal(last.title,'');
  player.setEnabled(false);player.setEnabled(true);player.unlock();player.tick(1);await flush();
  assert(instances.every(a=>a.paused),'Music toggle/unlock cannot restart songs in the silent chapter.');
  player.setContext({scene:'menu-chapter4'});await flush();assert(!instances[chapter4Index].paused,'The new menu theme still plays.');
  player.setContext({scene:'silent'});
  const selection=[0,.5,.999,0];let selectionCalls=0;
  const randomPlayer=createNVMusicPlayer({tracks,AudioClass:FakeAudio,onStatus:s=>last=s,random:()=>{selectionCalls++;return selection.shift();}});
  randomPlayer.setContext({scene:'menu'});await flush();assert.equal(selectionCalls,0);
  for(const title of ['WONDERS OF LANIAKEA','SOL','COSMOS','WONDERS OF LANIAKEA']){
    randomPlayer.startSession();randomPlayer.setContext({scene:'roam'});await flush();
    assert.equal(last.title,title);
    const calls=selectionCalls;
    for(const context of [{scene:'roam',paused:true},{scene:'roam',hidden:true},{scene:'roam',duck:true},{scene:'combat'},{scene:'roam'}])randomPlayer.setContext(context);
    await flush();assert.equal(selectionCalls,calls,'Pause, visibility and combat changes keep the current free-roam selection.');assert.equal(last.title,title);
    randomPlayer.setContext({scene:'menu'});await flush();assert.equal(last.title,'NOSTRAVECTOR MAIN MENU THEME');
  }
  assert.equal(selectionCalls,4,'Each gameplay load makes one new random choice across all three free-roam tracks.');
  let ch4Calls=0;const ch4Choices=[0,0,.25,0,.5,0,.99,0];
  const ch4Player=createNVMusicPlayer({tracks,AudioClass:FakeAudio,onStatus:s=>last=s,random:()=>ch4Choices[ch4Calls++%8]});
  const ch4Start=instances.length-tracks.length,ch4Titles=tracks.filter(t=>t.role==='roam-chapter4').map(t=>t.title);
  assert.equal(ch4Titles.length,4);assert(!ch4Titles.includes('HAVE I HEARD THIS BEFORE?'));assert.equal(tracks.find(t=>t.title==='HAVE I HEARD THIS BEFORE?').role,'mascar-piano');
  for(const title of ch4Titles){ch4Player.startSession();ch4Player.setContext({scene:'roam-chapter4'});await flush();assert.equal(last.title,title);const a=instances[ch4Start+tracks.findIndex(t=>t.title===title)];a.currentTime=17;const count=ch4Calls;for(const context of [{scene:'roam-chapter4',paused:true},{scene:'roam-chapter4',hidden:true},{scene:'predator'},{scene:'roam-chapter4'}])ch4Player.setContext(context);await flush();assert.equal(last.title,title);assert.equal(a.currentTime,17);assert.equal(ch4Calls,count+1);}
  ch4Player.setContext({scene:'roam-chapter4'});for(let n=0;n<4;n++){const index=tracks.findIndex(t=>t.title===last.title);instances[ch4Start+index].onended();await flush();assert.equal(last.title,ch4Titles[(index-tracks.findIndex(t=>t.role==='roam-chapter4')+1)%4]);}
  const pianoIndex=tracks.findIndex(t=>t.role==='mascar-piano');
  ch4Player.setContext({scene:'mascar-piano'});await flush();assert.equal(last.title,'HAVE I HEARD THIS BEFORE?');assert(instances[ch4Start+pianoIndex].loop);
  ch4Player.seek('mascar-piano',18);ch4Player.setContext({scene:'mascar-piano',paused:true});assert(instances[ch4Start+pianoIndex].paused);assert.equal(ch4Player.trackTime('mascar-piano'),18);
  ch4Player.setContext({scene:'mascar-piano',duck:true});await flush();ch4Player.tick(1);assert(!instances[ch4Start+pianoIndex].paused);assert(instances[ch4Start+pianoIndex].volume<.3);
  ch4Player.setContext({scene:'roam-chapter4'});await flush();assert(instances[ch4Start+pianoIndex].paused);assert(ch4Titles.includes(last.title));
  let endedTrack;
  const siegePlayer=createNVMusicPlayer({tracks,AudioClass:FakeAudio,onStatus:s=>last=s,onTrackEnded:t=>endedTrack=t});
  const siegeAudio=instances[instances.length-tracks.length+tracks.findIndex(q=>q.role==='siege')];
  siegePlayer.setContext({scene:'siege'});await flush();assert.equal(last.title,'SIEGE OF JANIRA PRIME');assert(siegeAudio.loop);
  siegePlayer.seek('siege',42);siegePlayer.setContext({scene:'siege',paused:true});assert(siegeAudio.paused);assert.equal(siegePlayer.trackTime('siege'),42);
  siegePlayer.setContext({scene:'siege'});await flush();assert(!siegeAudio.paused);assert.equal(siegePlayer.trackTime('siege'),42);
  siegeAudio.onended();assert.equal(endedTrack.role,'siege');
  const leaderPlayer=createNVMusicPlayer({tracks,AudioClass:FakeAudio,onStatus:s=>last=s});
  const leaderStart=instances.length-tracks.length;
  for(const role of ['leader-darius','leader-vishara','leader-hak','leader-grek','leader-archamus-light-egg']){
    const i=tracks.findIndex(t=>t.role===role),a=instances[leaderStart+i];
    leaderPlayer.setContext({scene:role});await flush();assert.equal(last.title,tracks[i].title);assert(a.loop&&!a.paused);
    a.currentTime=12;leaderPlayer.setContext({scene:role,paused:true});assert(a.paused);
    leaderPlayer.setContext({scene:role});await flush();assert(!a.paused);assert.equal(a.currentTime,12);
    leaderPlayer.setContext({scene:role,hidden:true});assert(a.paused);
    leaderPlayer.setContext({scene:'roam-chapter4'});await flush();assert(a.paused);
  }
  console.log('Passed: random starting choice on each gameplay load, playlist cycling, stable combat/pause/visibility resume, dialogue ducking, mute, volume, autoplay recovery and stale playback cancellation.');
})().catch(e=>{console.error(e);process.exitCode=1;});
