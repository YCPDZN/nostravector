const NVAlphinos=(()=>{
 const LINES=[
  'Welcome to Alphinos, Wanderer. This is Aridaxx, the first capital of the Chompy Empire. Janira Prime is our second capital. Karribassa has a place in my heart, but this city is four times its scale.',
  'Steca is the blue world beside us, with red water beneath its skies. It remains unclaimed. If you need a home from which to prepare, you may build there. Aridaxx I is the moon above our own world.',
  'Archamus, Vishara and Darius have come to stand with us. The leaders of the peoples you brought into the universe are welcome here too. We have much to protect, and little room for division.',
  'Tyrotaronus has told you what waits at Sagittarius A*. Do not mistake knowing the way for being ready to take it. Gather your crew, repair your ship and make whatever preparations you need.',
  'When you leave this city, remember the people living beneath these lights. The Catharsis would leave no one to remember them. Go when you are ready, Wanderer. Our hopes travel with you.'
 ];
 const present=s=>NVChapter3Access.chapter(s)>=4&&NVCatharsisRoute.ensure(s).briefed&&s.space?.body==='aridaxx'&&NVEris.groundPlay(s)&&!s.space.ecologyOcean&&!NVShipInterior.active(s)&&NVDiplomacy.relation(s,'CHOMPY')!=='WAR';
 function attendees(s){if(!present(s))return[];const c=NVCatharsisRoute.city(s),list=[{id:'hak',name:'HAK CHOMPJAK',kind:'hak',x:c.x,z:c.z-35,yaw:Math.PI},{id:'archamus',name:'ARCHAMUS',x:c.x-6,z:c.z-31,yaw:Math.PI},{id:'vishara',name:'VISHARA ERISCONOS',x:c.x+6,z:c.z-31,yaw:Math.PI},{id:'darius',name:'DARIUS ANCIN',x:c.x-12,z:c.z-27,yaw:Math.PI}];
  for(const [i,n]of NVCustomCrew.empires(s).entries()){const row=Math.floor(i/12),col=i%12;list.push({id:n.id,custom:n,name:NVCustomCrew.government(n).headOfState,x:c.x+(col-5.5)*4,z:c.z-18+row*4,yaw:Math.PI});}return list;
 }
 const hak=s=>attendees(s).find(n=>n.id==='hak')||null;
 const context=()=>gameActive&&erisConversation?.npc.alphinos===true;
 function buildings(){const out=[];for(let ring=0;ring<8;ring++)for(let j=0;j<32;j++){const a=j*Math.PI/16+(ring%2)*Math.PI/32,r=110+ring*76,x=Math.sin(a)*r,z=Math.cos(a)*r;out.push({x,z,h:24+(ring*19+j*17)%78,w:18+ring*1.3,yaw:a});}return out;}
 return{LINES,present,attendees,hak,context,buildings};
})();
const alphinosNearest=NVEris.nearest;NVEris.nearest=s=>{const h=NVAlphinos.hak(s);return h?{...h,alphinos:true}:alphinosNearest(s);};
const alphinosLines=NVEris.lines;NVEris.lines=(s,n)=>n.alphinos?NVAlphinos.LINES.slice():alphinosLines(s,n);
const alphinosVoice=startCourtVoice;startCourtVoice=()=>{if(!NVAlphinos.context())return alphinosVoice();stopCourtVoice();$('#retryCourtVoice').hidden=true;$('#courtVoiceStatus').textContent='CAPTIONS';};
const alphinosLip=courtRecordedLipPose;courtRecordedLipPose=kind=>{if(kind!=='hak'||!NVAlphinos.context())return alphinosLip(kind);const c=erisConversation,line=c.lines[c.index]||'',elapsed=Math.max(0,(Date.now()-c.lineStarted)/1000),duration=Math.max(3,line.length/14);return elapsed<duration?calculateJamesViseme(line,elapsed/duration,.4):{jaw:0,round:0};};
const alphinosShow=showErisLine;showErisLine=()=>{alphinosShow();if(NVAlphinos.context())$('#erisSpeakerRole').textContent='CHOMPY EMPIRE / PRIMARY CAPITAL · ALPHINOS';};
const alphinosLeave=leaveErisDialogue;leaveErisDialogue=(...args)=>{if(NVAlphinos.context()&&erisConversation.index>=erisConversation.lines.length-1)NVCatharsisRoute.ensure(polarState).alphinosMet=true;const r=alphinosLeave(...args);if(gameActive)updatePolarHUD();return r;};$('#leaveErisDialogue').onclick=leaveErisDialogue;
const alphinosHUD=updatePolarHUD;updatePolarHUD=()=>{alphinosHUD();if(!gameActive||gamePaused||!polarState||tyroScene||polarState.eris?.quests?.tracked==='vengeful-mascar')return;const s=polarState,q=NVCatharsisRoute.ensure(s);if(q.briefed&&q.aridaxxReached&&!q.alphinosMet&&!q.coreReached){$('#hudMissionTitle').textContent='SPEAK TO HAK IN ALPHINOS';$('#hudMissionText').textContent='Meet Hak Chompjak at Aridaxx’s primary capital. Archamus, Vishara, Darius and your custom empire leaders are gathered in the central plaza. Steca, the blue world with red water beside Aridaxx, remains unclaimed.';$('#hudMissionMeta').textContent='ARIDAXX / ALPHINOS · CHOMPY PRIMARY CAPITAL';}};
