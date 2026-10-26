const hawthorneComms=document.createElement('aside');hawthorneComms.id='hawthorneComms';hawthorneComms.hidden=true;hawthorneComms.setAttribute('aria-label','Incoming transmission from Thomas Hawthorne');
hawthorneComms.innerHTML='<header><span>TERRA IMPERIA / LIVE TRANSMISSION</span><button id="hawthorneCollapse" class="polar-button" aria-expanded="true">MINIMISE</button></header><div id="hawthorneCommsBody"><canvas id="hawthornePortrait" aria-label="Thomas Hawthorne portrait"></canvas><div><strong>THOMAS HAWTHORNE</strong><small id="hawthorneParagraphNumber"></small><small id="hawthorneVoiceStatus"></small><p id="hawthorneParagraph" aria-live="polite"></p></div></div><footer><small>NEXT QUEST / HEAD TO MARS</small><button id="hawthornePlay" class="polar-button" hidden>PLAY VOICE</button><button id="hawthorneMute" class="polar-button">VOICE ON</button><button id="hawthorneNext" class="polar-button">NEXT</button></footer>';
$('#hudRightDock').append(hawthorneComms);let hawthornePortraitRenderer=null,hawthorneCommsCollapsed=false;
$('#hawthorneNext').onclick=()=>{if(!gameActive||gamePaused||!polarState)return;NVHawthorneTransmission.next(polarState);updatePolarHUD();polarCanvas.focus();};
$('#hawthorneCollapse').onclick=()=>{hawthorneCommsCollapsed=!hawthorneCommsCollapsed;updateHawthorneComms();polarCanvas.focus();};
$('#hawthornePlay').onclick=()=>{playHawthorneVoice();polarCanvas.focus();};$('#hawthorneMute').onclick=()=>{hawthorneVoice.muted=!hawthorneVoice.muted;const a=hawthorneClips[hawthorneVoice.index];if(a)a.volume=hawthorneVoice.muted?0:.95;updatePolarHUD();polarCanvas.focus();};
function updateHawthorneComms(){
 updateHawthorneVoice();
 if(!gameActive||!polarState){hawthorneComms.hidden=true;return;}
 const q=NVHawthorneTransmission.observe(polarState),blocked=gamePaused||document.hidden||cleanHUDRoot.hidden||spaceChartOpen||typeof surfaceAtlasOpen!=='undefined'&&surfaceAtlasOpen||typeof hudToolsOpen!=='undefined'&&hudToolsOpen;
 hawthorneComms.hidden=!q.started||q.finished||blocked;if(hawthorneComms.hidden)return;
 $('#hawthorneCommsBody').hidden=hawthorneCommsCollapsed;hawthorneComms.querySelector('footer').hidden=hawthorneCommsCollapsed;$('#hawthorneCollapse').textContent=hawthorneCommsCollapsed?'RESUME TRANSMISSION':'MINIMISE';$('#hawthorneCollapse').setAttribute('aria-expanded',String(!hawthorneCommsCollapsed));$('#hawthorneParagraphNumber').textContent=(q.line+1)+' / 10';$('#hawthorneParagraph').textContent=NVHawthorneTransmission.QUOTES[q.line];$('#hawthorneNext').textContent=q.line===9?'END TRANSMISSION':'NEXT';
 $('#hawthornePlay').hidden=!hawthorneVoice.blocked||hawthorneVoice.error;$('#hawthorneMute').textContent=hawthorneVoice.muted?'VOICE OFF':'VOICE ON';$('#hawthorneVoiceStatus').textContent=hawthorneVoice.error?'VOICE UNAVAILABLE / NEXT TO CONTINUE':hawthorneVoice.blocked?'CLICK PLAY VOICE':'RECORDED TRANSMISSION';
 if(!hawthorneCommsCollapsed){if(!hawthornePortraitRenderer)try{hawthornePortraitRenderer=createGrekRenderer($('#hawthornePortrait'),ThomasModel,{camera:[0,-3.5,-2.2]});}catch(error){console.error('Hawthorne portrait:',error);}
  hawthornePortraitRenderer?.(performance.now()/1000,hawthorneLipPose(),false);
 }
}
const hawthorneHUD=updatePolarHUD;updatePolarHUD=()=>{if(gameActive&&polarState)NVHawthorneTransmission.observe(polarState);hawthorneHUD();updateHawthorneComms();};
const hawthorneExit=exitPolar;exitPolar=()=>{captureHawthorneVoice();stopHawthorneVoice();hawthorneComms.hidden=true;hawthorneCommsCollapsed=false;hawthorneExit();};
