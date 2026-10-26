// m/s². Major-world values follow NASA fact sheets. Lesser icy bodies use
// a uniform-density estimate (1500 kg/m³); these are not measured values.
const NVJump=(()=>{
  const known={earth:9.81,moon:1.62,mercury:3.70,venus:8.87,mars:3.73,jupiter:23.1,saturn:9.0,uranus:8.7,neptune:11.0,pluto:.62,ceres:.27,eris:.82,haumea:.40,makemake:.50,sedna:.32,phobos:.0057,deimos:.003,io:1.796,europa:1.315,ganymede:1.428,callisto:1.236,titan:1.352,enceladus:.113,miranda:.079,ariel:.269,umbriel:.20,titania:.379,oberon:.346,triton:.779,charon:.288};
  function gravity(body){return known[body.id]??(4*Math.PI/3*6.6743e-11*1500*(body.km||15)*1000);}
  function start(body){const g=gravity(body);return{body:body.id,height:0,velocity:Math.min(4.5,Math.sqrt(2*g*8)),active:true};}
  function step(j,body,dt){if(!j||!j.active||dt<=0)return j;if(j.body!==body.id)return{...j,height:0,velocity:0,active:false};const g=gravity(body);j.height+=j.velocity*dt-.5*g*dt*dt;j.velocity-=g*dt;if(j.height<=0&&j.velocity<0){j.height=0;j.velocity=0;j.active=false;}return j;}
  return{gravity,start,step};
})();
let playerJump=null;
function jumpWorld(){return NVSol.byId[polarState?.space?.phase&&polarState.space.phase!=='off'?polarState.space.body:'earth'];}
function canPlayerJump(){return gameActive&&!gamePaused&&polarState?.jamesIntroductionDone&&!polarState.car?.driving&&!polarState.bedSleeping&&!polarState.dreamActive&&!(polarState.ferryEscaped&&!polarState.africaStarted)&&!betrayalActive()&&!africaModal()&&!jamesConversation.active&&!hazardModalActive()&&!erisConversation&&!empireOpen&&(!polarState.space||['off','landed'].includes(polarState.space.phase));}
function startPlayerJump(){if(!canPlayerJump()||playerJump?.active)return;playerJump=NVJump.start(jumpWorld());}
function stepPlayerJump(dt){
  if(!polarState)return;const b=jumpWorld(),allowed=canPlayerJump();
  if(playerJump&&playerJump.body!==b.id)playerJump=null;
  if(!gameActive||!polarState.jamesIntroductionDone||polarState.car?.driving||polarState.space&&!['off','landed'].includes(polarState.space.phase))playerJump=null;
  if(allowed&&!document.hidden)NVJump.step(playerJump,b,dt);
  if(polarState.bedSleeping||polarState.dreamActive||betrayalActive()||africaModal()||jamesConversation.active||hazardModalActive()||erisConversation)playerJump=null;
  if(playerJump&&b.id==='earth'&&!polarState.africaStarted&&NVAntarctica.inShelter(polarState)&&playerJump.height>.8){playerJump.height=.8;playerJump.velocity=Math.min(0,playerJump.velocity);}
  polarState.jumpOffset=playerJump?.height||0;
  const button=$('#jumpButton');button.hidden=!allowed;button.disabled=!!playerJump?.active;
  // The physics loop and shared HUD must use the same label, including between HUD ticks.
  if(button.textContent!=='JUMP')button.textContent='JUMP';
  const hint='JUMP / SPACE · '+(NVJump.gravity(b)/9.81).toFixed(3)+' G';
  if(button.title!==hint)button.title=hint;
}
$('#jumpButton').onclick=startPlayerJump;
document.addEventListener('keydown',e=>{if(!['Space','KeyJ'].includes(e.code)||['INPUT','TEXTAREA','SELECT','BUTTON'].includes(e.target?.tagName)||!canPlayerJump())return;e.preventDefault();e.stopImmediatePropagation();if(!e.repeat)startPlayerJump();},true);
const jumpStartWorld=startAntarctica;startAntarctica=()=>{playerJump=null;jumpStartWorld();if(polarState)polarState.jumpOffset=0;};
