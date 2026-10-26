// Interior gunfire must not share the clips stopped by the outdoor pistol loop.
const NVCatharsisBoardingAudio=(()=>{
 const LIMIT=4,VOLUME=.16;
 const voices=Array.from({length:LIMIT},()=>({clip:Object.assign(new Audio(NVPlayerPistol.sounds[0].src),{preload:'none',volume:VOLUME}),pending:false,ticket:0}));
 let owner=null;
 function stop(){owner=null;for(const v of voices){v.ticket++;v.pending=false;v.clip.pause();try{v.clip.currentTime=0;}catch{}}}
 function play(s){if(!NVCatharsisBoarding.playable(s)||NVCatharsisBoarding.ensure(s).stage!=='fighting')return false;if(owner!==s){stop();owner=s;}const v=voices.find(v=>!v.pending&&v.clip.paused);if(!v)return false;const ticket=++v.ticket;v.pending=true;v.clip.volume=VOLUME;try{v.clip.currentTime=0;Promise.resolve(v.clip.play()).then(()=>{if(v.ticket!==ticket)return;v.pending=false;if(owner!==s||!NVCatharsisBoarding.playable(s))v.clip.pause();}).catch(()=>{if(v.ticket===ticket)v.pending=false;});}catch{v.pending=false;return false;}return true;}
 return{LIMIT,VOLUME,voices,play,stop};
})();
