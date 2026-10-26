const HAWTHORNE_VOICES=__HAWTHORNE_VOICES__;
const hawthorneClips=HAWTHORNE_VOICES.map(q=>{const a=new Audio(q.source);a.preload='none';a.volume=.95;return a;});
const hawthorneVoice={index:-1,token:0,blocked:false,error:false,muted:false,pending:false,seek:null,endedAt:null};
const hawthorneVoicePaused=()=>!gameActive||gamePaused||document.hidden||cleanHUDRoot.hidden;
function captureHawthorneVoice(){const g=hawthorneVoice,a=hawthorneClips[g.index];if(!gameActive||!polarState||!a||g.seek!==null)return;const q=NVHawthorneTransmission.ensure(polarState);if(q.line===g.index&&Number.isFinite(a.currentTime))q.voiceTime=Math.max(0,a.currentTime);}
function stopHawthorneVoice(){const g=hawthorneVoice;g.token++;hawthorneClips.forEach(a=>a.pause());g.index=-1;g.pending=false;g.seek=null;g.endedAt=null;g.blocked=false;g.error=false;}
function seekHawthorneVoice(){const g=hawthorneVoice,a=hawthorneClips[g.index];if(!a||g.seek===null||a.readyState===0)return;try{a.currentTime=Math.min(g.seek,Number.isFinite(a.duration)?Math.max(0,a.duration-.01):g.seek);g.seek=null;}catch{}}
function playHawthorneVoice(){const g=hawthorneVoice,a=hawthorneClips[g.index],token=g.token;if(!a||g.pending||g.error||hawthorneVoicePaused()||!polarState)return;const q=NVHawthorneTransmission.ensure(polarState);if(!q.started||q.finished)return;seekHawthorneVoice();prepareJamesAcoustics(a);resumeJamesAcoustics();a.volume=g.muted?0:.95;g.pending=true;
 const accepted=()=>{if(token!==g.token){if(hawthorneClips[g.index]!==a)a.pause();return;}g.pending=false;g.blocked=false;if(hawthorneVoicePaused())a.pause();};
 const rejected=()=>{if(token===g.token){g.pending=false;g.blocked=true;}};
 try{const result=a.play();if(result?.then)result.then(accepted).catch(rejected);else accepted();}catch{rejected();}
}
function startHawthorneVoice(q){stopHawthorneVoice();const g=hawthorneVoice,a=hawthorneClips[q.line];g.index=q.line;g.seek=q.voiceTime||0;const token=g.token;a.onerror=()=>{if(token===g.token){a.pause();g.error=true;g.pending=false;}};a.onloadedmetadata=()=>{if(token===g.token)seekHawthorneVoice();};seekHawthorneVoice();playHawthorneVoice();}
function updateHawthorneVoice(){if(!gameActive||!polarState){stopHawthorneVoice();return;}const q=NVHawthorneTransmission.ensure(polarState),g=hawthorneVoice;if(!q.started||q.finished){if(g.index!==-1)stopHawthorneVoice();return;}if(g.index!==q.line)startHawthorneVoice(q);const a=hawthorneClips[g.index];captureHawthorneVoice();
 if(hawthorneVoicePaused()){a.pause();g.endedAt=null;return;}
 if(a.ended&&!g.error){if(g.endedAt===null)g.endedAt=performance.now();else if(performance.now()-g.endedAt>=900){NVHawthorneTransmission.next(polarState);if(q.finished)stopHawthorneVoice();else startHawthorneVoice(q);return;}}
 else{g.endedAt=null;if(a.paused&&!g.pending&&!g.blocked&&!g.error)playHawthorneVoice();}
}
function hawthorneLipPose(){const g=hawthorneVoice,a=hawthorneClips[g.index],closed={open:0,round:0};if(!a||a.paused||a.ended||g.muted||g.error||g.blocked||g.seek!==null||hawthorneVoicePaused())return closed;const entry=prepareJamesAcoustics(a),duration=Number.isFinite(a.duration)&&a.duration>0?a.duration:HAWTHORNE_VOICES[g.index].duration;let progress=a.currentTime/duration,energy=.45+.20*Math.sin(a.currentTime*23);
 if(entry.envelope){const i=Math.min(entry.envelope.rms.length-1,Math.floor(a.currentTime/entry.envelope.hopSeconds));energy=entry.envelope.rms[i];progress=entry.envelope.spoken[i];}else if(entry.analyser){entry.analyser.getByteTimeDomainData(entry.samples);let sum=0;for(const v of entry.samples)sum+=((v-128)/128)**2;energy=Math.min(1,Math.sqrt(sum/entry.samples.length)*7);}
 if(energy<.075)return closed;const pose=calculateJamesViseme(NVHawthorneTransmission.QUOTES[g.index],progress,energy);return{open:pose.jaw,round:pose.round};
}
const hawthorneCaptureSave=savePolarWorld;savePolarWorld=(...args)=>{captureHawthorneVoice();return hawthorneCaptureSave(...args);};
document.addEventListener('visibilitychange',()=>{if(document.hidden){captureHawthorneVoice();hawthorneClips.forEach(a=>a.pause());hawthorneVoice.endedAt=null;}else updateHawthorneVoice();});
