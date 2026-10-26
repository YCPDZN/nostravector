// Reuse the real pause sheet and its handlers; never unpause the story world behind a nightmare.
var NVNightmarePause=(()=>{
 const sheet=$('#worldPauseSheet'),heading=sheet.querySelector('h2'),kicker=sheet.querySelector('.polar-kicker'),copy=sheet.querySelector('.world-sheet-card>p');
 let mounted=false,home=null,next=null,original=null;
 const active=()=>{const s=caraxEndingScene;if(!s||!gameActive||!caraxEndingPaused)return false;const q=NVCaraxEndings.ensure(s);return q.route==='good'&&q.stage==='cinematic'&&['battle','interlude'].includes(q.beam?.stage);};
 function close(){if(!mounted)return;sheet.hidden=true;delete sheet.dataset.nightmare;heading.textContent=original.heading;kicker.textContent=original.kicker;copy.textContent=original.copy;if(next?.parentNode===home)home.insertBefore(sheet,next);else home.append(sheet);mounted=false;original=null;}
 function sync(){if(!active()){if(mounted){close();syncSoundtrack();}return;}
  if(!mounted){home=sheet.parentNode;next=sheet.nextSibling;original={heading:heading.textContent,kicker:kicker.textContent,copy:copy.textContent};caraxEndingSheet.append(sheet);mounted=true;sheet.dataset.nightmare='true';sheet.hidden=false;$('#resumeWorld').focus();syncSoundtrack();}
  const q=NVCaraxEndings.ensure(caraxEndingScene),id=NVBeamStruggle.definition(q).id,title=MUSIC_TRACKS.find(t=>t.role==='nightmare-'+id)?.title||'';
  heading.textContent="DON'T TAKE TOO LONG";kicker.textContent='NIGHTMARE / PAUSED';copy.textContent='SOUNDTRACK / '+title;sheet.hidden=false;
 }
 const resume=$('#resumeWorld').onclick;$('#resumeWorld').onclick=e=>{if(active()){NVBeamStruggleUI.pause();$('#caraxEndingCanvas').focus();}else resume?.(e);};
 const save=savePolarWorld;savePolarWorld=(...args)=>{if(active())NVBeamStruggleUI.voice.remember();return save(...args);};
 function passKey(e){if(!active())return false;
  // The existing Save As dialog keeps its native keyboard and dismissal behaviour.
  if($('#saveAsDialog')?.open)return true;
  if(e.code==='Escape'){e.preventDefault();e.stopImmediatePropagation();NVBeamStruggleUI.pause();$('#caraxEndingCanvas').focus();return true;}
  if(e.code==='Tab'){e.preventDefault();e.stopImmediatePropagation();const controls=[...sheet.querySelectorAll('button,input,select,a[href]')].filter(el=>!el.disabled&&el.getClientRects().length),index=controls.indexOf(document.activeElement);controls[(index+(e.shiftKey?-1:1)+controls.length)%controls.length]?.focus();return true;}
  if(sheet.contains(e.target))return true;e.preventDefault();e.stopImmediatePropagation();return true;
 }
 const css=document.createElement('style');css.textContent=`
 #caraxEndingScene #worldPauseSheet[data-nightmare=true]{position:absolute;inset:0;z-index:60;display:grid;place-items:center;box-sizing:border-box;padding:18px;background:#08040ce8;overflow:auto;color:#eddee5}
 #caraxEndingScene #worldPauseSheet[hidden]{display:none!important}
 #worldPauseSheet[data-nightmare=true] .world-sheet-card{width:min(600px,100%);box-sizing:border-box;max-height:calc(100dvh - 36px);overflow:auto;background:linear-gradient(135deg,#1b0e18fa,#09090ffa);border:1px solid #97506577;box-shadow:0 18px 75px #0009;padding:26px}
 #worldPauseSheet[data-nightmare=true] h2{font-size:clamp(22px,4vw,34px);color:#ed9ead;letter-spacing:.08em}
 #worldPauseSheet[data-nightmare=true] .polar-kicker,#worldPauseSheet[data-nightmare=true] .music-status{color:#be9eae}
 #worldPauseSheet[data-nightmare=true] p{color:#eddee5;font:13px/1.7 Consolas;overflow-wrap:anywhere}
 #worldPauseSheet[data-nightmare=true] button{background:#27121fe8;border-color:#a1657877;color:#f0d4df;white-space:normal}
 #worldPauseSheet[data-nightmare=true] button:hover{background:#512336;border-color:#e78ca1}
 #worldPauseSheet[data-nightmare=true] input[type=range]{accent-color:#ed9ead;max-width:100%}
 @media(max-width:600px){#worldPauseSheet[data-nightmare=true] .world-sheet-card{padding:18px}#worldPauseSheet[data-nightmare=true] .world-music-controls{display:flex;flex-wrap:wrap;gap:9px;align-items:center}#worldPauseSheet[data-nightmare=true] button{min-height:42px}#worldPauseSheet[data-nightmare=true] h2{font-size:23px}}
 `;document.head.append(css);
 return{active,sync,close,passKey};
})();
