// Verify acoustic silence, seek timing, viseme shapes, and optional system voice lifecycle.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const elements=new Map(),el=key=>{if(!elements.has(key))elements.set(key,{hidden:false,textContent:'',setAttribute(){}});return elements.get(key);};
let sourceCount=0,resumes=0,cancels=0,lastRecording=null;
class AudioContextStub{
  constructor(){this.state='suspended';this.destination={};}
  createMediaElementSource(){sourceCount++;return{connect(){}};}
  createAnalyser(){return{fftSize:1024,connect(){},getByteTimeDomainData(data){data.fill(128);}};}
  resume(){resumes++;this.state='running';return Promise.resolve();}
  decodeAudioData(){const samples=new Float32Array(1000);for(let i=200;i<800;i++)samples[i]=Math.sin(i*2)*.4;return Promise.resolve({sampleRate:1000,length:1000,numberOfChannels:1,getChannelData:()=>samples});}
}
const synth={cancel(){cancels++;},pause(){},resume(){},getVoices:()=>[{lang:'en-GB'}],speak(){throw Error('James must use the supplied recording, not a system voice.');}};
const audio={src:'data:audio/mpeg;base64,AA==',duration:1,currentTime:0,paused:false,ended:false,volume:.85};
const ctx=vm.createContext({console,Math,Number,WeakMap,Float32Array,Uint8Array,atob,SpeechSynthesisUtterance:class{constructor(text){this.text=text;}},window:{AudioContext:AudioContextStub,speechSynthesis:synth},document:{hidden:false},$:el,gameActive:true,gamePaused:false,betrayalActive:()=>false,jamesVoiceError:false,jamesVoiceKind:'intro',jamesVoiceIndex:0,JAMES_QUOTES:['aaaaaaaaaa'],JAMES_CAR_QUOTE:'aaaa',JAMES_VOICES:Array.from({length:31},()=>({duration:1})),jamesVoiceClips:[audio],currentJamesVoice:()=>audio,polarState:{introIndex:0},startJamesVoice:(kind,time,index)=>lastRecording={kind,time,index},stopJamesVoice(){},captureJamesVoice(){},hazardModalActive:()=>false,savePolarWorld(){},updatePolarHUD(){},polarCanvas:{focus(){}},polarKeys:new Set()});
vm.runInContext(fs.readFileSync(__dirname+'/antarctica_speech.js','utf8'),ctx);
const run=s=>vm.runInContext(s,ctx);
(async()=>{
  assert.equal(run("calculateJamesViseme('aaaa',.2,0).jaw"),0);
  assert.equal(run("calculateJamesViseme('mmmm',.2,1).jaw"),0);
  assert.ok(run("calculateJamesViseme('aaaa',.2,1).jaw")>.8);
  assert.ok(run("calculateJamesViseme('oooo',.2,1).width")<run("calculateJamesViseme('eeee',.2,1).width"));
  run('prepareJamesAcoustics(currentJamesVoice());prepareJamesAcoustics(currentJamesVoice());resumeJamesAcoustics();');
  await Promise.resolve();assert.equal(sourceCount,1,'Reuse one audio source after save/continue.');assert.equal(resumes,1);
  audio.currentTime=.05;assert.equal(run('updateJamesLipPose(.1).jaw'),0,'Recording silence closes the mouth.');
  audio.currentTime=.4;assert.ok(run('updateJamesLipPose(.1).jaw')>.5,'Decoded recording energy opens the jaw.');
  audio.currentTime=.94;assert.equal(run('updateJamesLipPose(.1).jaw'),0,'Seeking into silence immediately resets the jaw.');
  audio.currentTime=.4;run('updateJamesLipPose(.1);gamePaused=true;');assert.equal(run('updateJamesLipPose(.016).jaw'),0,'Pause closes the mouth.');
  run('gamePaused=false;jamesConversation.active=true;jamesConversation.kind="station";');
  for(let i=0;i<10;i++){run(`jamesConversation.index=${i};showJamesConversationLine(0.25);`);assert.deepEqual(lastRecording,{kind:'station',time:.25,index:6+i});assert.equal(el('#systemJamesVoice').hidden,true);assert.ok(el('#conversationVoiceLabel').textContent.includes('JBPA'+(i+1)));}
  run('jamesConversation.kind="supplies";');
  for(let i=0;i<10;i++){run(`jamesConversation.index=${i};showJamesConversationLine(0.25);`);assert.deepEqual(lastRecording,{kind:'supplies',time:.25,index:16+i});assert.equal(el('#systemJamesVoice').hidden,true);assert.equal(el('#conversationVoiceLabel').textContent,'RECORDED VOICE / '+(i===0?'JBW':'JBW'+i));}
  run('jamesVoiceKind="supplies";jamesVoiceIndex=16;');audio.currentTime=.4;
  assert.deepEqual(JSON.parse(JSON.stringify(run('updateJamesLipPose(.1)'))),JSON.parse(JSON.stringify(run('calculateJamesViseme(JAMES_SUPPLY_QUOTES[0],jamesAcoustics.get(currentJamesVoice()).envelope.spoken[40],jamesAcoustics.get(currentJamesVoice()).envelope.rms[40])'))),'Supply recording lip sync must use its matching transcript.');
  run('jamesConversation.kind="ferry";');
  for(let i=0;i<5;i++){run(`jamesConversation.index=${i};showJamesConversationLine(.25);`);assert.deepEqual(lastRecording,{kind:'ferry',time:.25,index:26+i});assert.equal(el('#conversationVoiceLabel').textContent,'RECORDED VOICE / JBAA'+(i+1));}
  run('jamesVoiceKind="ferry";jamesVoiceIndex=26;');audio.currentTime=.4;
  assert.deepEqual(JSON.parse(JSON.stringify(run('updateJamesLipPose(.1)'))),JSON.parse(JSON.stringify(run('calculateJamesViseme(JAMES_FERRY_QUOTES[0],jamesAcoustics.get(currentJamesVoice()).envelope.spoken[40],jamesAcoustics.get(currentJamesVoice()).envelope.rms[40])'))),'JBAA lip sync uses its departure transcript.');
  audio.ended=true;run('tickJamesConversation(.05);');assert.equal(run('jamesConversation.speechDone'),true);
  audio.ended=false;run('showJamesConversationLine();jamesVoiceError=true;tickJamesConversation(60);');assert.equal(run('jamesConversation.speechDone'),true,'Captions still work if a recording cannot load.');
  assert.ok(cancels>=10);assert.equal(run('JAMES_STATION_QUOTES.length'),10);
  console.log('Passed: acoustic silence/seek/pause, source reuse, station/supply/ferry recordings, correct JBW and JBAA ordering, matching visemes, saved seek and caption fallback.');
})().catch(e=>{console.error(e);process.exitCode=1;});
