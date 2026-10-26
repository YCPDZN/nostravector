// Intelligence is derived from this character's story state, without creating or saving records.
const NVImperiaInnerCircle=(()=>{
 const available=s=>NVChapter3Access.allowed(s)&&['war','expansion'].includes(s?.eris?.solWar?.stage);
 function roster(s){
  if(!available(s))return[];
  const w=s.eris.solWar,choices=w.solFall?.expedition?.blockade?.siege?.commanders?.resolution?.choices||{};
  const members=[
   {id:'thomas',name:'THOMAS HAWTHORNE',rank:'GRAND IMPERARCH',alignment:'LAWFUL EVIL',deceased:w.thomasAlive===false},
   {id:'croxian',name:'CROXIAN MASCAR',rank:'CO-GRAND GENERAL',alignment:'LAWFUL EVIL',deceased:choices.croxian==='kill'},
   {id:'malia',name:'MALIA DE TORO',rank:'CO-GRAND GENERAL',alignment:'LAWFUL EVIL',deceased:choices.malia==='kill'}
  ];
  if(choices.croxian==='kill')members.push({id:'orion',name:'ORION MASCAR',rank:'VENGEFUL',alignment:s.eris.chapter4?.year===2127&&s.eris.vengefulMascar?.stage!=='complete'?'LAWFUL EVIL':'CHAOTIC EVIL',deceased:false});
  return members;
 }
 return{available,roster};
})();
// Keep faction intelligence together in the existing scrollable sheet.
$('#empireSheet .empire-card h2').textContent='FACTIONS & TERRITORY';
$('#empireSheet .empire-card').append(fleetRoster);
const innerCircleButton=document.createElement('button');innerCircleButton.id='openInnerCircle';innerCircleButton.className='polar-button';innerCircleButton.hidden=true;
innerCircleButton.textContent="TERRA IMPERIA - HAWTHORNE'S INNER CIRCLE";
innerCircleButton.setAttribute('aria-controls','imperiaInnerCircle');innerCircleButton.setAttribute('aria-expanded','false');
const innerCirclePanel=document.createElement('section');innerCirclePanel.id='imperiaInnerCircle';innerCirclePanel.hidden=true;innerCirclePanel.setAttribute('aria-labelledby','innerCircleTitle');
innerCirclePanel.innerHTML='<span class="inner-circle-kicker">TERRA IMPERIA / COMMAND HIERARCHY</span><h3 id="innerCircleTitle">HAWTHORNE’S INNER CIRCLE</h3><div id="innerCircleLeader"></div><h4>SUBORDINATES</h4><div id="innerCircleSubordinates"></div><p>Personnel status reflects events in your current save.</p>';
$('#closeEmpire').after(innerCircleButton,innerCirclePanel);
const innerCircleTool=document.createElement('button');innerCircleTool.id='innerCircleTool';innerCircleTool.className='polar-button';innerCircleTool.textContent=innerCircleButton.textContent;innerCircleTool.hidden=true;hudFactions.lastElementChild.append(innerCircleTool);
let innerCircleSignature='';
function refreshInnerCircle(){
 const allowed=gameActive&&NVImperiaInnerCircle.available(polarState);
 innerCircleButton.hidden=innerCircleTool.hidden=!allowed;
 innerCircleButton.disabled=innerCircleTool.disabled=!allowed;
 if(!allowed){innerCirclePanel.hidden=true;innerCircleButton.setAttribute('aria-expanded','false');return;}
 const members=NVImperiaInnerCircle.roster(polarState),signature=JSON.stringify(members);
 if(signature===innerCircleSignature)return;innerCircleSignature=signature;
 $('#innerCircleLeader').replaceChildren();$('#innerCircleSubordinates').replaceChildren();
 for(const m of members){
  const row=document.createElement('article');row.className='inner-circle-member';row.dataset.member=m.id;row.dataset.deceased=String(m.deceased);
  const name=document.createElement('strong'),rank=document.createElement('span');name.textContent=m.name;rank.textContent=m.rank;row.append(name,rank);const alignment=document.createElement('small');alignment.className='inner-circle-alignment';alignment.textContent=m.alignment;row.append(alignment);
  if(m.deceased){const status=document.createElement('b');status.className='inner-circle-status';status.textContent='DECEASED';row.append(status);}
  else if(m.status){const status=document.createElement('b');status.className='inner-circle-status';status.textContent=m.status;row.append(status);}
  $((m.leader||m.id==='thomas'&&!members.some(v=>v.leader))?'#innerCircleLeader':'#innerCircleSubordinates').append(row);
 }
}
function showInnerCircle(on){
 refreshInnerCircle();if(!gameActive||!NVImperiaInnerCircle.available(polarState)||!empireOpen)return false;
 innerCirclePanel.hidden=!on;innerCircleButton.setAttribute('aria-expanded',String(!!on));return true;
}
innerCircleButton.onclick=()=>showInnerCircle(innerCirclePanel.hidden);
innerCircleTool.onclick=()=>{if(gamePaused||!gameActive||!NVImperiaInnerCircle.available(polarState))return;setHUDTools(false);toggleEmpire(true);if(showInnerCircle(true))innerCircleButton.focus();};
const innerCircleEmpireRefresh=refreshEmpire;refreshEmpire=()=>{innerCircleEmpireRefresh();refreshInnerCircle();};
const innerCircleEmpireToggle=toggleEmpire;toggleEmpire=on=>{if(on){innerCirclePanel.hidden=true;innerCircleButton.setAttribute('aria-expanded','false');}return innerCircleEmpireToggle(on);};
const innerCircleHUD=updatePolarHUD;updatePolarHUD=()=>{innerCircleHUD();refreshInnerCircle();};
const innerCircleExit=exitPolar;exitPolar=()=>{innerCirclePanel.hidden=true;innerCircleButton.setAttribute('aria-expanded','false');innerCircleButton.hidden=innerCircleTool.hidden=true;innerCircleExit();};$('#worldToMenu').onclick=()=>exitPolar();
