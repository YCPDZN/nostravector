const COURT_VOICES=__COURT_VOICES__;
const courtClips=COURT_VOICES.map(q=>{const a=new Audio(q.source);a.preload='none';a.volume=.95;return a;});
let courtVoiceIndex=-1,courtVoiceToken=0;
function stopCourtVoice(){courtVoiceToken++;courtClips.forEach(a=>a.pause());courtVoiceIndex=-1;}
function startCourtVoice(){
  stopCourtVoice();const c=erisConversation;if(!c)return;
  $('#retryCourtVoice').hidden=true;$('#courtVoiceStatus').textContent='';
  if(!['queen','assistant','nyrexia','alexia','hak'].includes(c.npc.kind))return;
  const janira=typeof NVSolFall!=='undefined'&&typeof polarState!=='undefined'&&NVSolFall.active(polarState)&&polarState.space?.body==='janira-prime'&&['queen','hak'].includes(c.npc.kind);
  const expansion=janira&&c.npc.kind==='hak'&&typeof NVJaniraExpedition!=='undefined'&&c.lines[0]===NVJaniraExpedition.BRIEFING[0];
  const group=expansion?'janira-expansion':janira?'janira-'+c.npc.kind:c.npc.kind==='assistant'?(c.lines.length===2?'present':'away'):c.npc.kind;
  courtVoiceIndex=COURT_VOICES.findIndex(q=>q.group===group&&q.index===c.index);
  const a=courtClips[courtVoiceIndex],token=courtVoiceToken;if(!a)return;
  a.currentTime=0;prepareJamesAcoustics(a);resumeJamesAcoustics();
  const retry=$('#retryCourtVoice');retry.hidden=true;
  a.onerror=()=>{if(token===courtVoiceToken){retry.hidden=true;$('#courtVoiceStatus').textContent='Voice unavailable / captions active';}};
  $('#courtVoiceStatus').textContent='';
  try{a.play()?.then(()=>{if(token!==courtVoiceToken)a.pause();}).catch(()=>{if(token===courtVoiceToken){retry.hidden=false;$('#courtVoiceStatus').textContent='Enable voice to hear this line';}});}catch(e){retry.hidden=false;}
}
function courtRecordedLipPose(kind){
  const c=erisConversation,a=courtClips[courtVoiceIndex],closed={jaw:0,width:1,round:0,teeth:0};
  if(!gameActive||document.hidden||!c||c.npc.kind!==kind||!a||a.paused||a.ended)return closed;
  const entry=prepareJamesAcoustics(a);let energy=0,progress=Number.isFinite(a.duration)&&a.duration>0?a.currentTime/a.duration:0;
  if(entry.envelope){const i=Math.min(entry.envelope.rms.length-1,Math.floor(a.currentTime/entry.envelope.hopSeconds));energy=entry.envelope.rms[i];progress=entry.envelope.spoken[i];}
  else if(entry.analyser){entry.analyser.getByteTimeDomainData(entry.samples);let sum=0;for(const v of entry.samples)sum+=((v-128)/128)**2;energy=Math.min(1,Math.sqrt(sum/entry.samples.length)*7);}
  return energy<.075?closed:calculateJamesViseme(c.lines[c.index],progress,energy);
}
$('#retryCourtVoice').onclick=startCourtVoice;
document.addEventListener('visibilitychange',()=>{const a=courtClips[courtVoiceIndex];if(!a||!erisConversation)return;if(document.hidden)a.pause();else{resumeJamesAcoustics();a.play()?.catch(()=>{$('#retryCourtVoice').hidden=false;});}});
