// Josiah Williams II is an authored Earth contact, separate from Project BC crew.
const NVJosiahWilliams=(()=>{
 const SITE={lat:51.5,lon:-.12},LABEL='Josiah Williams II · Europe / Britain';
 const CHAPTER3="I don't know who sent you, and I don't want to know. I've nothing to offer you. Go away. Leave me alone.";
 const REFLECTION="I wish to think about what I can do.";
 const RICHARDS=[
   "Two Cabinet Secretaries in the family, and somehow the backbone skipped a generation. Stand up straight, Williams. Your surname isn't doing the heavy lifting for you.",
   "You keep introducing yourself through dead men. I'm Josiah Richards. I came back from the grave, and even I don't spend all day hiding behind it.",
   "Look at that armour. Enough plating to stop a firing squad, and you still fold when somebody asks how you're doing. Did the spine come as an optional extra?",
   "No, spare me the speech. I'm not here to audition for a portrait on your wall. Put the family name down for five minutes and do one useful thing that's yours.",
   "There. You're looking at us instead of the floor. Keep that up. You don't need to be another grand old statesman, Williams. Just find a backbone and help the Wanderer."
 ];
 const RICHARDS_SILENCE="Williams gives Richards a small, reluctant nod. He seems ready to hear what the Wanderer needs.";
 const GARETH=[
  {speaker:'gareth',text:"Cheer up, mate. You've got the Uxbridge Top Shotter on your doorstep. Usually that means somebody else is having a worse day."},
  {speaker:'josiah',text:"My family advised governments. I can barely answer the door. Is this supposed to help?"},
  {speaker:'gareth',text:"I'm a Williams too. Far as I'm concerned, that makes this a family visit. No speeches, no portraits judging us. We'll start with a cup of tea."},
  {speaker:'josiah',text:"Sharing a surname doesn't make us related. And mind that step."},
  {speaker:'gareth',text:"OW! I'M OKAY! ... Right. Excellent step. Very patriotic. Tried to finish me off on British soil."},
  {speaker:'josiah',text:"You called yourself the Top Shotter and lost a fight with my doorstep."},
  {speaker:'gareth',text:"Top Shotter, not Top Walker. Different qualifications. Listen, mate: I fall over and get back up. You can have a bad century and still start with tomorrow."},
  {speaker:'josiah',text:"My grandfather used to do that. Fall over, insist he was fine, then try to make everyone else laugh."},
  {speaker:'gareth',text:"If I ever meet your grandad, tell him I said hi. Sounds like a proper Williams."},
  {speaker:'josiah',text:"That is the worst pep talk I've ever heard. ... It's also the first time I've laughed in months."},
  {speaker:'gareth',text:"Then we're making progress. You don't owe those portraits a cabinet position. Sit with us. Make the tea terrible if you like. We'll survive."},
  {speaker:'josiah',text:"All right. I'll put the kettle on. Thank you, Gareth. And you, Wanderer. Perhaps I don't have to have all the answers before I let someone help."}
 ];
 const LINES=[
   "Josiah Williams II. Yes, that is me. Archamus sent you? I wondered whether he still remembered this place. Forgive the state of it. I stopped preparing the house for visitors a long time ago.",
   "I am the last of a British dynasty. My great-grandfather and my grandfather both served as British Cabinet Secretaries, advising the British government. People listened when they spoke. I grew up beneath their portraits, hearing how steady they had been when everyone around them was afraid.",
   "And now look at me. I'm a weakling who doesn't deserve anyone. They helped guide a country, and I cannot even face the next morning without wanting to hide from it. I used to imagine what I would say if I ever stood beside them. Now I cannot bear to look at their faces on the wall.",
   "I wish for my clan to die with me. No heir raised beneath those portraits, wondering why they cannot be enough. No child carrying my shame along with the family name. Let it end here. I have spent so long measuring myself against the dead that I no longer know what is left of me.",
   "Archamus remembers someone who still believed he could make something of himself. I don't know what he expects you to find here. If you have questions, ask them. Just... don't tell me my family would be proud. You didn't know them. And you don't know what it feels like to be all that remains."
 ];
 const CHOICES=[
  {id:'rude',tone:'RUDE',text:'Maybe they were right about you.'},
  {id:'sarcastic',tone:'SARCASTIC',text:'Want fries with that?'},
  {id:'sympathetic',tone:'SYMPATHETIC',text:"I'm really sorry to hear that, I want to help you."},
  {id:'ignorant',tone:'IGNORANT',text:"I'm sorry? what?"}
 ];
 const REACTIONS={
   "rude": [
     "I should have known better than to speak so freely. If you've come here to tell me I'm worthless, you've made your point. Leave me alone. This conversation is over."
   ],
   "sarcastic": [
     "Was that supposed to be funny? I tell you what's left of my family, and you turn it into a joke. I haven't the strength to be your entertainment. Go. We're done here."
   ],
   "sympathetic": [
     "You... want to help me? Not the family name. Not those two men in their portraits. Me? I'm sorry. It's been a long time since someone made that distinction.",
     "I keep talking as if their lives were a verdict on mine. As if every day I struggle is another way of disappointing them. I don't know how to stop doing that. But you stayed and listened. That means more than I know how to say.",
     "I can't promise I will suddenly become the man Archamus remembers. But if you mean what you said, then... stay a moment. Let me tell you what I can still do. Perhaps we can start there."
   ],
   "ignorant": [
     "You weren't listening, were you? I can't say all of that again just to have it pass straight through you. Please go. I need to be alone."
   ]
 };
 const active=s=>!!s&&NVArchamus.earthContact(s);
 const onEarth=s=>!!s?.space&&NVGalaxy.system(s)==='sol'&&s.space.body==='earth'&&s.space.phase==='landed'&&!s.space.interior?.active&&!NVArchiostal.active(s);
 function local(s){if(!onEarth(s)||!s.space.geo?.global)return null;const p=s.space,g=p.geo;return{x:(p.landingX||0)+NVWorldFlight.wrap(SITE.lon-g.lon)*24000*Math.max(.05,Math.cos(g.lat*Math.PI/180)),z:(p.landingZ||0)+(SITE.lat-g.lat)*24000};}
 const early=s=>NVArchamus.chapter(s)===3;
 const present=s=>(early(s)||NVChapter4.started(s)&&NVArchamus.ensure(s).contactBriefed)&&!!local(s);
 const distance=s=>{const n=local(s);return n?Math.hypot(n.x-s.x,n.z-s.z):Infinity;};
 const canTalk=s=>present(s)&&distance(s)<6;
 const gareth=s=>NVCustomCrew.followers(s).find(n=>NVBCCombat.kind(n)==='gareth')||null;
 const richards=s=>NVCustomCrew.followers(s).find(n=>NVBCCombat.kind(n)==='josiah')||null;
 const crewHeard=(s,kind)=>NVArchamus.ensure(s).williamsCrewHeard?.includes(kind)||NVArchamus.ensure(s).williamsChoice===kind&&NVArchamus.ensure(s).williamsReactionHeard;
 function heardCrew(s,kind){const memory=NVArchamus.ensure(s);memory.williamsCrewHeard=[...new Set([...(memory.williamsCrewHeard||[]),kind])];}
 function waypoint(s){if(!active(s))return null;const p=s.space;if(NVArchiostal.active(s))return{x:-113,z:113,label:'Board ship · '+LABEL};if(NVGalaxy.system(s)!=='sol')return ['landed','cockpit','off'].includes(p.phase)?{x:p.landingX||0,z:p.landingZ||0,label:'Return to ship · '+LABEL}:{galaxy:true,system:'sol',label:'Sol · '+LABEL};if(p.body==='earth'){if(p.phase==='landed'){const n=local(s);if(n)return{...n,label:LABEL};}if(['atmosphere','ascent','descent'].includes(p.phase))return{geo:{...SITE},label:LABEL};}if(['landed','cockpit','off'].includes(p.phase))return{x:p.landingX||0,z:p.landingZ||0,label:'Return to ship · '+LABEL};const b=NVSol.byId.earth;return{space:true,position:b.position,radius:b.radius,label:LABEL};}
 function complete(s){if(!NVChapter4.started(s))return false;NVArchamus.ensure(s).contactMet=true;NVQuests.update(s);return true;}
 return{SITE,LABEL,CHAPTER3,REFLECTION,RICHARDS,RICHARDS_SILENCE,GARETH,LINES,CHOICES,REACTIONS,gareth,richards,crewHeard,heardCrew,early,active,onEarth,local,present,distance,canTalk,waypoint,complete};
})();
let williamsConversation=null,williamsFrame=0;
function williamsCamera(s){if(!williamsConversation||williamsConversation.world!==s)return null;const n=NVJosiahWilliams.local(s),y=NVEcology.ground(s,n.x,n.z),banter=['gareth','richards'].includes(williamsConversation.phase),distance=banter?(innerWidth<650?3.6:3.4):innerWidth<650?4.5:3.4,centre=banter?-.65:0,x=n.x+(banter?-.65:.55),z=n.z-distance;return{eye:[x,Math.max(y+1.85,NVEcology.ground(s,x,z)+.7),z],target:[n.x+centre,y+1.27,n.z],fov:banter&&innerWidth<650?1.55:Math.PI/3.05};}
function williamsGarethPose(s,id,time){const q=williamsConversation;if(!q||q.world!==s)return null;const richards=q.phase==='richards',actor=richards?q.richardsId:q.garethId,member=richards?NVJosiahWilliams.richards:NVJosiahWilliams.gareth;if(!['gareth','richards'].includes(q.phase)||actor!==id||member(s)?.id!==id)return null;const n=NVJosiahWilliams.local(s);return{x:n.x-1.4,z:n.z-.35,yaw:2.5,speed:0,phase:0,animation:!richards&&q.index===4?{mode:'trip',elapsed:Math.min(2.1,Math.max(0,time-q.lineStarted))}:{mode:'idle'}};}
function createWilliamsScenery({M,draw,mesh,object,facePart}){
 const model=WilliamsModel.meshes.map(p=>({...mesh({p:p.p,n:p.n,f:p.indices}),color:p.color,bone:p.bone,name:p.name}));
 // Reuse Chapter 1's single mouth, including its lips, teeth and tongue, in this face's coordinates.
 const faceSpace=M.mul(M.t(0,3.584-1.551*1.7,.295-.191*1.7),M.scale(1.7,1.7,1.7));
 return(s,time)=>{
  const distance=NVJosiahWilliams.distance(s);if(!NVJosiahWilliams.present(s)||distance>1200){delete polarCanvas.dataset.williamsModel;return;}
  const n=NVJosiahWilliams.local(s),y=NVEcology.ground(s,n.x,n.z),root=M.mul(M.t(n.x,y+.008*Math.sin(time*.8),n.z),M.mul(M.ry(Math.PI),M.scale(.46,.46,.46))),lip=NVWilliamsVoice.pose(),pivot=WilliamsModel.headPivot;
  const head=M.mul(root,M.mul(M.t(...pivot),M.mul(M.rx(-.055+Math.sin(time*.5)*.012),M.t(...pivot.map(v=>-v))))),mouthOpen=!!facePart&&lip.jaw>.025;
  const jaw=M.mul(head,M.t(0,-.024*1.7*lip.jaw,.003*1.7*lip.round));
  for(const p of model){
   if(distance>65&&/stubble|stitch|chip|scrape|text|recessed|seam|nostril|pupil|wrinkle/i.test(p.name))continue;
   if(mouthOpen&&(p.name==='Closed upper lip'||p.name==='Closed lower lip'))continue;
   let pose=p.bone==='jaw'?jaw:p.bone==='head'?head:root;
   if(p.bone==='cape'){const pivot=WilliamsModel.pivots.cape;pose=M.mul(root,M.mul(M.t(...pivot),M.mul(M.rx(Math.sin(time*.65)*.008),M.t(...pivot.map(v=>-v)))));}
   draw(p,pose,p.color);
  }
  if(mouthOpen)facePart({name:'Mouth neutral'},M.mul(head,faceSpace),lip);
  const stone=[.31,.31,.30];object(n.x,y-.05,n.z+1,11,.1,9,stone);for(const side of [-1,1]){object(n.x+side*5,y+.5,n.z+2,.5,1,7,stone);object(n.x+side*4.7,y+1.7,n.z+4,.5,3.4,.5,stone);}object(n.x,y+1.1,n.z+5,10,2.2,.5,stone);object(n.x+2,y+.45,n.z+2,2,.8,.65,[.17,.13,.10]);polarCanvas.dataset.williamsModel='hooded-armoured-human';
 };
}
const williamsScenery=createSolScenery;createSolScenery=options=>{const original=williamsScenery(options),npc=createWilliamsScenery(options);return(s,time,animation)=>{original(s,time,animation);npc(s,time);};};
const williamsWaypoint=missionWaypointTarget;missionWaypointTarget=s=>s.eris?.quests?.tracked==='vengeful-mascar'?williamsWaypoint(s):NVJosiahWilliams.waypoint(s)||williamsWaypoint(s);
const williamsSites=NVSurfaceNavigation.sites;NVSurfaceNavigation.sites=s=>{const sites=williamsSites(s);if(NVGalaxy.system(s)==='sol'&&(NVJosiahWilliams.early(s)||NVChapter4.started(s)&&NVArchamus.ensure(s).contactBriefed))sites.push({id:'josiah-williams-ii',body:'earth',label:NVJosiahWilliams.LABEL,geo:{...NVJosiahWilliams.SITE},approach:{lat:NVJosiahWilliams.SITE.lat-.001,lon:NVJosiahWilliams.SITE.lon},color:[.83,.69,.43]});return sites;};
const williamsButton=document.createElement('button');williamsButton.id='speakJosiahWilliams';williamsButton.className='polar-button';williamsButton.textContent='SPEAK TO JOSIAH WILLIAMS II / T';williamsButton.hidden=true;$('#hudContextDock').append(williamsButton);
const williamsSheet=document.createElement('section');williamsSheet.id='williamsDialogue';williamsSheet.hidden=true;williamsSheet.setAttribute('role','dialog');williamsSheet.setAttribute('aria-modal','true');williamsSheet.setAttribute('aria-labelledby','williamsSpeaker');williamsSheet.innerHTML='<div class="archamus-cinematic-bars"></div><article class="archamus-scene-caption"><header><div><small>EARTH / EUROPE · BRITAIN</small><h2 id="williamsSpeaker">JOSIAH WILLIAMS II</h2><small id="williamsSpeakerDetail">THE LAST OF HIS DYNASTY</small></div><span id="williamsCount"></span></header><p id="williamsLine"></p><footer><small id="williamsVoiceStatus" aria-live="polite">CAPTIONS</small><div><button id="williamsVoice" class="polar-button" hidden>VOICE ON</button><button id="williamsNext" class="polar-button">NEXT / ENTER</button><button id="williamsLeave" class="polar-button">LEAVE / ESC</button></div></footer></article>';$('#antarctica').append(williamsSheet);
const williamsStyle=document.createElement('style');williamsStyle.textContent='#williamsDialogue[hidden]{display:none!important}#williamsDialogue{position:absolute;inset:0;z-index:291;pointer-events:none;color:#ede9df;font:12px/1.7 Consolas,monospace}#williamsCount{font-size:9px}#williamsVoice[hidden]{display:none!important}#williamsVoiceStatus{max-width:220px}#williamsLine{font-size:14px;line-height:1.7;max-height:30vh;overflow:auto}@media(max-width:650px){#williamsLine{font-size:11px}.archamus-scene-caption #williamsSpeaker{font-size:16px}}';document.head.append(williamsStyle);
function showWilliamsLine(){
 const q=williamsConversation,guest=q.phase==='gareth'&&NVJosiahWilliams.GARETH[q.index].speaker==='gareth',richards=q.phase==='richards',narration=q.phase==='narration';q.lineStarted=performance.now()/1000;
 $('#williamsWheel').hidden=true;williamsSheet.querySelector('article').classList.remove('williams-wheel-active');$('#williamsLine').hidden=false;$('#williamsNext').hidden=false;
 $('#williamsSpeaker').textContent=richards?'JOSIAH RICHARDS':narration?'NARRATION':guest?'GARETH WILLIAMS':'JOSIAH WILLIAMS II';$('#williamsSpeakerDetail').textContent=richards?'PROJECT BC':narration?'EARTH / EUROPE':guest?'PROJECT BC / UXBRIDGE TOP SHOTTER':'THE LAST OF HIS DYNASTY';
 $('#williamsLine').textContent=q.lines[q.index];$('#williamsCount').textContent=(q.index+1)+' / '+q.lines.length;$('#williamsNext').textContent=q.index===q.lines.length-1?(richards?'END CONVERSATION / ENTER':q.phase==='gareth'?'CONTINUE / ENTER':q.phase==='reaction'?(q.branch==='sympathetic'?'FINISH / ENTER':'END CONVERSATION / ENTER'):q.needsChoice?(q.chapter===4&&NVJosiahWilliams.gareth(q.world)?'CONTINUE / ENTER':'CHOOSE RESPONSE / ENTER'):'FINISH / ENTER'):'NEXT / ENTER';
}
function renderWilliamsScene(now){if(!williamsConversation)return;NVWilliamsVoice.frame(now);if(!williamsConversation)return;const q=williamsConversation;if(!document.hidden){cleanHUDRoot.hidden=true;$('#worldPauseSheet').hidden=true;renderSpaceWorld(q.world,now/1000,{playerPhase:0,jamesPhase:0,playerSpeed:0,jamesSpeed:0});}williamsFrame=requestAnimationFrame(renderWilliamsScene);}
function speakWilliams(){
 if(!gameActive||gamePaused||!NVJosiahWilliams.canTalk(polarState)||archiostalControlsBlocked())return false;
 const memory=NVArchamus.ensure(polarState),early=NVJosiahWilliams.early(polarState),pending=!early&&!!NVJosiahWilliams.REACTIONS[memory.williamsChoice]&&!memory.williamsReactionHeard,richards=!early&&NVJosiahWilliams.richards(polarState),resumeGareth=!early&&!pending&&(memory.contactMet||memory.williamsChoice==='gareth')&&!NVJosiahWilliams.crewHeard(polarState,'gareth')&&!!NVJosiahWilliams.gareth(polarState),refused=['rude','sarcastic','ignorant'].includes(memory.williamsChoice);
 williamsConversation={world:polarState,chapter:early?3:4,index:0,phase:pending?'reaction':'speech',intro:!early&&!pending&&!memory.contactMet,branch:pending?memory.williamsChoice:null,needsChoice:!early&&(!memory.williamsChoice||refused||['gareth','richards'].includes(memory.williamsChoice)&&!memory.williamsHelpAccepted),lines:early?[NVJosiahWilliams.CHAPTER3]:pending?NVJosiahWilliams.REACTIONS[memory.williamsChoice].slice():memory.contactMet?[memory.williamsHelpAccepted?NVJosiahWilliams.REFLECTION:refused?"Have you come back to listen this time? I will not be made into a joke.":"The house is still quiet. If you have something to ask, I am listening."]:NVJosiahWilliams.LINES.slice()};
 polarKeys.clear();polarAutoWalk=false;pausePolar(true);$('#worldPauseSheet').hidden=true;cleanHUDRoot.hidden=true;williamsSheet.hidden=false;
 if(richards){if(!beginWilliamsRichards()){Object.assign(williamsConversation,{phase:'narration',intro:false,needsChoice:false,lines:[NVJosiahWilliams.RICHARDS_SILENCE]});showWilliamsLine();}}
 else if(!resumeGareth||!beginWilliamsGareth())showWilliamsLine();renderWilliamsScene(performance.now());$('#williamsNext').focus();return true;
}
function beginWilliamsRichards(){const q=williamsConversation,n=q&&NVJosiahWilliams.richards(q.world);if(!q||q.world!==polarState||q.chapter!==4||!n||NVJosiahWilliams.crewHeard(q.world,'richards'))return false;Object.assign(q,{phase:'richards',intro:false,branch:'richards',richardsId:n.id,index:0,needsChoice:false,lines:NVJosiahWilliams.RICHARDS.slice()});Object.assign(NVArchamus.ensure(q.world),{williamsChoice:'richards',williamsReactionHeard:false});showWilliamsLine();return true;}
function beginWilliamsGareth(){const q=williamsConversation,n=q&&NVJosiahWilliams.gareth(q.world),memory=q&&NVArchamus.ensure(q.world);if(!q||q.world!==polarState||q.chapter!==4||!n||NVJosiahWilliams.crewHeard(q.world,'gareth'))return false;Object.assign(q,{phase:'gareth',intro:false,branch:'gareth',garethId:n.id,index:0,needsChoice:false,lines:NVJosiahWilliams.GARETH.map(line=>line.text)});Object.assign(memory,{williamsChoice:'gareth',williamsReactionHeard:false});showWilliamsLine();return true;}
function closeWilliams(completed=false,resume=true){const q=williamsConversation;if(completed&&q&&q.chapter>=4&&q.world===polarState)NVJosiahWilliams.complete(q.world);williamsConversation=null;cancelAnimationFrame(williamsFrame);williamsSheet.hidden=true;$('#williamsWheel').hidden=true;williamsSheet.querySelector('article').classList.remove('williams-wheel-active');if(resume&&gameActive){pausePolar(false);updatePolarHUD();polarCanvas.focus();}}
function nextWilliams(){
 const q=williamsConversation;if(!q||q.phase==='wheel')return;
 if(q.phase==='richards'){
  if(q.world!==polarState||NVJosiahWilliams.richards(q.world)?.id!==q.richardsId){closeWilliams(false);return;}
  if(++q.index<q.lines.length){showWilliamsLine();return;}
  NVJosiahWilliams.heardCrew(q.world,'richards');Object.assign(NVArchamus.ensure(q.world),{williamsChoice:'richards',williamsReactionHeard:true,williamsHelpAccepted:true});closeWilliams(true);return;
 }
 if(q.phase==='gareth'){
  if(q.world!==polarState||NVJosiahWilliams.gareth(q.world)?.id!==q.garethId){closeWilliams(false);return;}
  if(++q.index<q.lines.length){showWilliamsLine();return;}
  NVJosiahWilliams.heardCrew(q.world,'gareth');Object.assign(NVArchamus.ensure(q.world),{williamsChoice:'gareth',williamsReactionHeard:true,williamsHelpAccepted:true});NVJosiahWilliams.complete(q.world);
  Object.assign(q,{phase:'reflection',lines:[NVJosiahWilliams.REFLECTION],index:0,intro:false,needsChoice:false});showWilliamsLine();return;
 }
 if(q.phase==='reply'){q.phase='reaction';q.lines=NVJosiahWilliams.REACTIONS[q.branch].slice();q.index=0;showWilliamsLine();return;}
 if(q.phase==='reaction'){
  if(++q.index<q.lines.length){showWilliamsLine();return;}
  if(q.world===polarState)Object.assign(NVArchamus.ensure(q.world),{williamsReactionHeard:true,williamsHelpAccepted:q.branch==='sympathetic'});
  if(q.branch==='sympathetic'){q.phase='reflection';q.lines=[NVJosiahWilliams.REFLECTION];q.index=0;q.intro=false;q.needsChoice=false;showWilliamsLine();return;}
  closeWilliams(true);return;
 }
 if(++q.index>=q.lines.length){if(q.needsChoice){if(!beginWilliamsGareth())showWilliamsWheel();}else closeWilliams(true);}else showWilliamsLine();
}
williamsButton.onclick=speakWilliams;$('#williamsNext').onclick=nextWilliams;$('#williamsLeave').onclick=()=>closeWilliams(false);
document.addEventListener('keydown',e=>{const q=williamsConversation;if(!q)return;e.stopImmediatePropagation();const wheel=q.phase==='wheel',buttons=wheel?[...$('#williamsWheel').querySelectorAll('button'),$('#williamsLeave')]:[$('#williamsVoice'),$('#williamsNext'),$('#williamsLeave')].filter(b=>!b.hidden);if(e.code==='Tab'){const i=buttons.indexOf(document.activeElement);e.preventDefault();buttons[i<0?(e.shiftKey?buttons.length-1:0):(i+(e.shiftKey?-1:1)+buttons.length)%buttons.length].focus();return;}if(e.repeat)return;if(e.code==='Escape'){e.preventDefault();closeWilliams(false);return;}if(wheel){const numeric=['Digit1','Digit2','Digit3','Digit4'].indexOf(e.code);if(numeric>=0){e.preventDefault();chooseWilliamsResponse(NVJosiahWilliams.CHOICES[numeric].id);return;}const direction={ArrowUp:0,ArrowRight:1,ArrowDown:2,ArrowLeft:3}[e.code];if(direction!==undefined){e.preventDefault();buttons[direction].focus();return;}if(['Enter','Space'].includes(e.code)&&e.target?.tagName!=='BUTTON')e.preventDefault();return;}if(['Enter','Space'].includes(e.code)&&e.target?.tagName!=='BUTTON'){e.preventDefault();nextWilliams();}},true);
const williamsCandidates=hudInteractionCandidates;hudInteractionCandidates=s=>[...williamsCandidates(s),'speakJosiahWilliams'];
const williamsInput=spaceInput;spaceInput=e=>{if(e.code==='KeyT'&&!e.repeat&&!gamePaused&&!['INPUT','TEXTAREA','SELECT'].includes(e.target?.tagName)&&NVJosiahWilliams.canTalk(polarState)){e.preventDefault();return speakWilliams();}return williamsInput(e);};
const williamsHUD=updatePolarHUD;updatePolarHUD=()=>{williamsHUD();williamsButton.hidden=!gameActive||gamePaused||!NVJosiahWilliams.canTalk(polarState)||archiostalControlsBlocked();if(williamsConversation){cleanHUDRoot.hidden=true;$('#worldPauseSheet').hidden=true;}else if(gameActive&&!gamePaused&&NVJosiahWilliams.active(polarState)&&polarState.eris?.quests?.tracked!=='vengeful-mascar'){$('#hudMissionTitle').textContent='FIND JOSIAH WILLIAMS II';$('#hudMissionText').textContent='Find Archamus’s contact at the old Williams family home in Britain, Europe. Select his marker on Earth’s surface atlas and speak to him.';$('#hudMissionMeta').textContent='EARTH / EUROPE · 51.50° N, 0.12° W';}};
const williamsExit=exitPolar;exitPolar=()=>{closeWilliams(false,false);williamsButton.hidden=true;return williamsExit();};
const williamsStart=startAntarctica;startAntarctica=()=>{closeWilliams(false,false);return williamsStart();};

const williamsCollision=NVConstruction.resolve;NVConstruction.resolve=(s,old)=>{williamsCollision(s,old);if(!NVJosiahWilliams.present(s)||s.aerialView)return;const n=NVJosiahWilliams.local(s);if(Math.hypot(s.x-n.x,s.z-n.z)<.65){s.x=old.x;s.z=old.z;}};
const williamsEcology=NVEcology.visible;NVEcology.visible=s=>{const visible=williamsEcology(s);if(!NVJosiahWilliams.present(s))return visible;const n=NVJosiahWilliams.local(s);return{...visible,plants:visible.plants.filter(p=>Math.hypot(p.x-n.x,p.z-n.z)>8),animals:visible.animals.filter(p=>Math.hypot(p.x-n.x,p.z-n.z)>8)};};

const williamsWheel=document.createElement('section');williamsWheel.id='williamsWheel';williamsWheel.hidden=true;williamsWheel.tabIndex=-1;williamsWheel.setAttribute('role','group');williamsWheel.setAttribute('aria-label','Choose your response to Josiah');const wheelCentre=document.createElement('div');wheelCentre.className='williams-wheel-centre';wheelCentre.innerHTML='<strong>YOUR RESPONSE</strong><small>CLICK / TAP · 1–4<br>ARROWS + ENTER</small>';williamsWheel.append(wheelCentre);
for(const [i,choice]of NVJosiahWilliams.CHOICES.entries()){const button=document.createElement('button');button.className='williams-choice';button.dataset.choice=choice.id;button.setAttribute('aria-label',choice.tone+': '+choice.text);const label=document.createElement('strong');label.textContent=(i+1)+' / '+choice.tone;const text=document.createElement('span');text.textContent=choice.text;button.append(label,text);button.onclick=()=>chooseWilliamsResponse(choice.id);williamsWheel.append(button);}
$('#williamsLine').after(williamsWheel);
const wheelStyles=document.createElement('style');wheelStyles.textContent=`#williamsWheel[hidden]{display:none!important}#williamsWheel{position:relative;width:min(720px,100%);height:350px;margin:12px auto 16px;outline:none;background:radial-gradient(circle at center,#25313a88 0 17%,transparent 18% 34%,#aa956a25 34.2% 34.6%,transparent 35%)}.williams-wheel-centre{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);text-align:center;pointer-events:none}.williams-wheel-centre strong{display:block;font:10px Consolas;letter-spacing:1.6px;color:#dcc8a2}.williams-wheel-centre small{display:block;margin-top:8px;font:8px/1.7 Consolas;color:#98acb7}.williams-choice{position:absolute;box-sizing:border-box;min-height:96px;width:230px;padding:13px 15px;border:1px solid #778690;background:linear-gradient(135deg,#14222cf5,#0a131bf5);border-radius:9px;color:#ede8df;text-align:left;cursor:pointer;white-space:normal;box-shadow:0 5px 18px #0005}.williams-choice strong{display:block;font:9px Consolas;letter-spacing:1.4px;margin-bottom:8px;color:var(--tone)}.williams-choice span{display:block;font:12px/1.55 Consolas}.williams-choice:hover,.williams-choice:focus-visible{border-color:var(--tone);outline:2px solid var(--tone);outline-offset:3px;background:#23323d}.williams-choice[data-choice=rude]{--tone:#dba2a0;top:0;left:50%;transform:translateX(-50%);width:280px}.williams-choice[data-choice=sarcastic]{--tone:#d9bd87;right:0;top:50%;transform:translateY(-50%)}.williams-choice[data-choice=sympathetic]{--tone:#99c9c0;bottom:0;left:50%;transform:translateX(-50%);width:300px}.williams-choice[data-choice=ignorant]{--tone:#a5b6d2;left:0;top:50%;transform:translateY(-50%)}.williams-wheel-active{max-height:calc(100dvh - 64px);overflow:auto}.williams-wheel-active #williamsLine{display:none}#williamsLine[hidden]{display:none!important}@media(max-width:760px){#williamsWheel{height:auto;display:grid;grid-template-columns:1fr 1fr;gap:12px;background:none}.williams-wheel-centre{position:static;transform:none;grid-column:1/-1;padding:3px 0 8px}.williams-wheel-centre small{margin-top:4px}.williams-choice,.williams-choice[data-choice]{position:static;transform:none;width:100%;min-height:112px;padding:11px}.williams-choice span{font-size:11px}.williams-choice strong{font-size:8px;letter-spacing:.8px}.williams-wheel-active #williamsSpeaker{font-size:17px}}`;document.head.append(wheelStyles);
function showWilliamsWheel(){const q=williamsConversation;if(!q)return;q.phase='wheel';$('#williamsLine').hidden=true;$('#williamsNext').hidden=true;$('#williamsSpeaker').textContent='YOUR RESPONSE';$('#williamsSpeakerDetail').textContent='REPLY TO JOSIAH WILLIAMS II';$('#williamsCount').textContent='CHOOSE ONE';williamsSheet.querySelector('article').classList.add('williams-wheel-active');williamsWheel.hidden=false;williamsWheel.focus();}
function chooseWilliamsResponse(id){const q=williamsConversation,choice=NVJosiahWilliams.CHOICES.find(c=>c.id===id);if(!q||q.phase!=='wheel'||!choice||q.world!==polarState)return false;q.phase='reply';q.branch=choice.id;Object.assign(NVArchamus.ensure(q.world),{williamsChoice:choice.id,williamsReactionHeard:false,williamsHelpAccepted:false});NVJosiahWilliams.complete(q.world);williamsWheel.hidden=true;williamsSheet.querySelector('article').classList.remove('williams-wheel-active');$('#williamsSpeaker').textContent='YOU';$('#williamsSpeakerDetail').textContent='PLAYER RESPONSE';$('#williamsCount').textContent=choice.tone;$('#williamsLine').hidden=false;$('#williamsLine').textContent=choice.text;$('#williamsNext').hidden=false;$('#williamsNext').textContent='HEAR JOSIAH / ENTER';$('#williamsNext').focus();return true;}
