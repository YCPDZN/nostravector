let janiraVictoryOpen=false,janiraVictoryPaused=false,janiraVictoryRenderer=null,janiraVictoryClock=performance.now();
const janiraVictoryPanel=document.createElement('section');janiraVictoryPanel.id='janiraVictory';janiraVictoryPanel.hidden=true;janiraVictoryPanel.setAttribute('role','dialog');janiraVictoryPanel.setAttribute('aria-modal','true');janiraVictoryPanel.setAttribute('aria-labelledby','janiraVictoryTitle');
janiraVictoryPanel.innerHTML='<canvas id="janiraVictoryCanvas" aria-label="Hak Chompjak in liberated Karribassa"></canvas><div class="janira-victory-location">JANIRA PRIME / KARRIBASSA<strong>THE SIEGE IS OVER</strong></div><section class="janira-rally-caption"><header><div><small>VICTORY / THE CHOMPY EMPIRE</small><h2 id="janiraVictoryTitle">HAK CHOMPJAK</h2></div><span id="janiraVictoryCount"></span></header><p id="janiraVictoryLine" aria-live="polite"></p><footer><small>CAPTIONS / ENTER TO CONTINUE</small><div><button id="janiraVictoryPause" class="polar-button">PAUSE / SAVE</button><button id="janiraVictoryNext" class="polar-button">NEXT / ENTER</button></div></footer></section>';$('#antarctica').append(janiraVictoryPanel);
function drawJaniraVictory(){const v=NVJaniraVictory.ensure(polarState);$('#janiraVictoryLine').textContent=NVJaniraVictory.QUOTES[v.line];$('#janiraVictoryCount').textContent=(v.line+1)+' / 5';$('#janiraVictoryNext').textContent=v.line===4?'RETURN TO KARRIBASSA / ENTER':'NEXT / ENTER';}
const janiraVictoryPauseBase=pausePolar;
function beginJaniraVictory(){if(janiraVictoryOpen||!gameActive||gamePaused||polarState.space?.phase!=='landed'||polarState.space.interior?.active||erisConversation||karribassaFateOpen||mascarSceneOpen||NVJaniraVictory.ensure(polarState).stage!=='speech')return false;
 stopCourtVoice();stopSolWarVoice();NVCroxianVoice.stop();polarKeys.clear();polarAutoWalk=false;polarSprint=false;polarPoseSpeed=0;setHUDTools(false);
 janiraVictoryOpen=true;janiraVictoryPaused=false;janiraVictoryClock=performance.now();janiraVictoryPauseBase(true);$('#worldPauseSheet').hidden=true;janiraVictoryPanel.hidden=false;drawJaniraVictory();$('#janiraVictoryNext').focus();syncSoundtrack();return true;
}
pausePolar=on=>{if(!janiraVictoryOpen){janiraVictoryPauseBase(on);return;}janiraVictoryPaused=!!on;janiraVictoryPanel.hidden=!!on;janiraVictoryPauseBase(true);janiraVictoryClock=performance.now();if(!on){$('#worldPauseSheet').hidden=true;drawJaniraVictory();$('#janiraVictoryNext').focus();}syncSoundtrack();};
function nextJaniraVictory(){if(!janiraVictoryOpen||janiraVictoryPaused)return;NVJaniraVictory.next(polarState);if(NVJaniraVictory.ensure(polarState).stage==='done'){janiraVictoryOpen=false;janiraVictoryPanel.hidden=true;janiraVictoryPauseBase(false);polarKeys.clear();polarCanvas.focus();syncSoundtrack();updatePolarHUD();}else drawJaniraVictory();}
$('#janiraVictoryNext').onclick=nextJaniraVictory;$('#janiraVictoryPause').onclick=()=>pausePolar(true);
const janiraVictoryHUD=updatePolarHUD;updatePolarHUD=()=>{
 if(gameActive&&polarState)NVJaniraVictory.settle(polarState);
 janiraVictoryHUD();if(!gameActive||!polarState)return;
 if(NVJaniraVictory.liberated(polarState)&&!janiraVictoryOpen)beginJaniraVictory();
 if(janiraVictoryOpen){cleanHUDRoot.hidden=true;karribassaPanel.hidden=true;mascarCombatPanel.hidden=true;if(janiraVictoryPaused)return;
  const now=performance.now(),v=NVJaniraVictory.ensure(polarState);if(!document.hidden)v.elapsed+=Math.min(.1,Math.max(0,(now-janiraVictoryClock)/1000));janiraVictoryClock=now;
  $('#worldPauseSheet').hidden=true;janiraVictoryPanel.hidden=false;drawJaniraVictory();
  try{if(!janiraVictoryRenderer)janiraVictoryRenderer=createJaniraRallyRenderer($('#janiraVictoryCanvas'),{victory:true});janiraVictoryRenderer({...v,stage:'speech'},NVJaniraVictory.QUOTES,typeof NVJaniraVictoryVoice==='undefined'?undefined:NVJaniraVictoryVoice.lip());}catch(e){console.error('Janira victory scene:',e);}return;
 }
 if(NVJaniraVictory.liberated(polarState)&&!gamePaused&&NVVengefulMascar.ensure(polarState).stage!=='hunt'){
  $('#hudMissionKicker').textContent='CHAPTER 3 / JANIRA PRIME LIBERATED';$('#hudMissionTitle').textContent='KARRIBASSA IS FREE';$('#hudMissionText').textContent='Janira Prime belongs to the Chompy Empire. The blockade has withdrawn and the allied relief fleets have dispersed. Explore at your own pace.';$('#hudMissionMeta').textContent='SIEGE COMPLETE / CHOMPY EMPIRE';
 }
};
const janiraVictoryRender=renderSpaceWorld;renderSpaceWorld=(s,...args)=>{if(janiraVictoryOpen&&gameActive)return;if(NVJaniraVictory.liberated(s)){polarCanvas.dataset.armadaShips='0';polarCanvas.dataset.armadaBatches='0';}return janiraVictoryRender(s,...args);};
const janiraVictoryExit=exitPolar;exitPolar=()=>{janiraVictoryOpen=false;janiraVictoryPaused=false;janiraVictoryPanel.hidden=true;janiraVictoryExit();};$('#worldToMenu').onclick=()=>exitPolar();
document.addEventListener('keydown',e=>{if(!janiraVictoryOpen||janiraVictoryPaused||e.code==='Tab')return;if(e.target?.tagName==='BUTTON'&&['Enter','Space'].includes(e.code))return;e.preventDefault();e.stopImmediatePropagation();if(e.repeat)return;if(e.code==='Escape')pausePolar(true);else if(['Enter','Space'].includes(e.code))nextJaniraVictory();},true);
document.addEventListener('visibilitychange',()=>{if(document.hidden&&janiraVictoryOpen&&!janiraVictoryPaused)pausePolar(true);});
const janiraVictoryGalaxy=refreshGalaxy;refreshGalaxy=()=>{janiraVictoryGalaxy();if(gameActive&&NVJaniraVictory.liberated(polarState)&&galaxySelected==='janira-proxima'){$('#galaxyFaction').textContent='CHOMPY EMPIRE / JANIRA PRIME · HFOS / JANIRA I · ERISIAN RESISTANCE / ALLIED';$('#galaxyNote').textContent='JANIRA PRIME LIBERATED / The siege is over. Karribassa is once again under Chompy control.';$('#galaxyBodies').textContent='JANIRA PRIME / CHOMPY EMPIRE · KARRIBASSA LIBERATED\nJANIRA I / HUMAN FEDERATION REFUGE';}};
