const CREW_POSTING_AUDIO=__CREW_POSTING_AUDIO__;
const NVCrewPostingVoice=(()=>{
 const clips=CREW_POSTING_AUDIO.map(r=>Object.assign(new Audio(r.source),{preload:'none',volume:.9}));
 let index=-1,token=0,muted=false,suspended=false;
 const context=()=>!!crewTransferPreview&&!crewFarewell.hidden&&galacticPanelOpen&&!!galacticWorld;
 const status=text=>{$('#crewFarewellVoiceStatus').textContent=text;};
 function stop(){token++;for(const a of clips){a.pause();a.onerror=null;a.onended=null;}index=-1;suspended=false;}
 function play(){const a=clips[index],t=token;if(!a||!context()||muted||suspended||document.hidden)return;
  status('RECORDED VOICE');
  Promise.resolve().then(()=>{if(t===token&&context()&&!muted&&!suspended&&!document.hidden)return a.play();}).then(()=>{
   if(t!==token){if(clips[index]!==a||!context()||muted||suspended||document.hidden)a.pause();return;}
   if(!context()||muted||suspended||document.hidden)a.pause();
  }).catch(()=>{if(t===token&&context())status('VOICE PAUSED / SELECT REPLAY VOICE');});
 }
 function begin(){stop();if(!context())return;const p=crewTransferPreview,key=NVCrewDiplomacy.voiceKey(galacticWorld,p.id);
  index=CREW_POSTING_AUDIO.findIndex(r=>r.profile===key&&r.line===p.line);const a=clips[index],t=token;
  if(!a){status('CAPTIONS / NO RECORDING');return;}a.currentTime=0;
  a.onerror=()=>{if(t===token&&context())status('VOICE UNAVAILABLE / SELECT REPLAY VOICE');};
  a.onended=()=>{if(t===token&&context())status('VOICE COMPLETE');};
  suspended=document.hidden;status(muted?'VOICE MUTED':suspended?'VOICE PAUSED':'RECORDED VOICE');play();
 }
 function pause(){if(!context())return;suspended=true;clips[index]?.pause();if(!muted)status('VOICE PAUSED');}
 function resume(){if(!context()||document.hidden)return;suspended=false;if(!clips[index]?.ended)play();}
 $('#crewFarewellReplay').onclick=begin;
 $('#crewFarewellMute').onclick=()=>{muted=!muted;$('#crewFarewellMute').textContent=muted?'UNMUTE VOICE':'MUTE VOICE';$('#crewFarewellMute').setAttribute('aria-pressed',String(muted));if(muted){clips[index]?.pause();status('VOICE MUTED');}else if(clips[index]?.ended)begin();else play();};
 document.addEventListener('visibilitychange',()=>document.hidden?pause():resume());
 window.addEventListener('blur',pause);window.addEventListener('focus',resume);window.addEventListener('pagehide',stop);
 return{clips,begin,stop,pause,resume,index:()=>index,muted:()=>muted};
})();
const postingCloseDiplomacy=closeGalacticDiplomacy;closeGalacticDiplomacy=()=>{NVCrewPostingVoice.stop();if(crewTransferPreview)cancelCrewFarewell();return postingCloseDiplomacy();};
