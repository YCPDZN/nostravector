const fs=require('fs'),vm=require('vm'),assert=require('assert');
const metadata=JSON.parse(fs.readFileSync(__dirname+'/court_audio.json'));
for(const q of metadata)assert(fs.statSync(__dirname+'/'+q.file).size>1000);
class Audio{constructor(src){this.src=src;this.paused=true;this.ended=false;this.currentTime=0;this.duration=8;}pause(){this.paused=true;}play(){this.paused=false;return Promise.resolve();}}
const elements=new Map(),el=id=>{if(!elements.has(id))elements.set(id,{});return elements.get(id);};
const ctx=vm.createContext({Audio,document:{hidden:false,addEventListener(){}},$:el,prepareJamesAcoustics:()=>({envelope:{rms:[.8],spoken:[0],hopSeconds:.01}}),resumeJamesAcoustics(){},calculateJamesViseme:()=>({jaw:.8,width:1,round:0,teeth:0})});
const run=s=>vm.runInContext(s,ctx);
run('const NVJaniraExpedition={BRIEFING:["Explore new worlds"]};let gameActive=true,erisConversation=null,NVSolFall={active:()=>false},polarState={space:{body: "eris"}};'+fs.readFileSync(__dirname+'/court_recordings.js','utf8').replace('__COURT_VOICES__',JSON.stringify(metadata.map(q=>({...q,source:q.file})))));
for(const [kind,length,group] of [['queen',5,'queen'],['assistant',2,'present'],['assistant',3,'away'],['nyrexia',5,'nyrexia'],['alexia',5,'alexia']]){
  for(let i=0;i<length;i++){
    run(`erisConversation={npc:{kind:'${kind}'},lines:Array(${length}).fill('Hello'),index:${i}};startCourtVoice();`);
    assert.equal(run('COURT_VOICES[courtVoiceIndex].group'),group);assert.equal(run('COURT_VOICES[courtVoiceIndex].index'),i);
    assert.equal(run('courtClips.filter(a=>!a.paused).length'),1);
    assert(run(`courtRecordedLipPose('${kind}').jaw`)>0);
    assert.equal(run(`courtRecordedLipPose('${kind==='queen'?'assistant':'queen'}').jaw`),0);
  }
}
run('courtClips[courtVoiceIndex].ended=true');assert.equal(run("courtRecordedLipPose('assistant').jaw"),0);
run('stopCourtVoice()');assert.equal(run('courtClips.filter(a=>!a.paused).length'),0);
run("NVSolFall={active:()=>true};polarState={space:{body:'janira-prime'}};");for(const kind of ['hak','queen'])for(let i=0;i<5;i++){run(`erisConversation={npc:{kind:'${kind}'},lines:Array(5).fill('Welcome to Karribassa'),index:${i}};startCourtVoice();`);assert.equal(run('COURT_VOICES[courtVoiceIndex].group'),'janira-'+kind);assert.equal(run('COURT_VOICES[courtVoiceIndex].index'),i);assert.equal(run('courtClips.filter(a=>!a.paused).length'),1);assert(run(`courtRecordedLipPose('${kind}').jaw`)>0);}run('stopCourtVoice()');assert.equal(run('courtClips.filter(a=>!a.paused).length'),0);
for(let i=0;i<5;i++){run(`erisConversation={npc:{kind:'hak'},lines:NVJaniraExpedition.BRIEFING,index:${i}};startCourtVoice();`);assert.equal(run('COURT_VOICES[courtVoiceIndex].group'),'janira-expansion');assert.equal(run('COURT_VOICES[courtVoiceIndex].index'),i);assert.equal(run('courtClips.filter(a=>!a.paused).length'),1);assert(run("courtRecordedLipPose('hak').jaw")>0);}run('stopCourtVoice()');
const renderer=fs.readFileSync(__dirname+'/eris_renderer.js','utf8');run(renderer.slice(renderer.indexOf('function attendantPart'),renderer.indexOf('function createErisScenery')));
assert.deepEqual(Array.from(run("attendantPart({mat:'hair',name:'Hair'}).c")),[.94,.95,.97]);
assert.equal(run("attendantPart({mat:'hair'}).mat"),undefined);
assert(run("attendantPart({name:'Puffer body'}).c.every(v=>v<.04)"));
console.log('Passed all 35 recording routes, single voice, acoustic mouth poses, cleanup, white hair and black clothes.');
