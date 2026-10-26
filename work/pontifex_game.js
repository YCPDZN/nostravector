const pontifexIntel=document.createElement('details');pontifexIntel.id='pontifexIntel';
pontifexIntel.innerHTML='<summary>TERRA IMPERIA / NEMESIS</summary><div><strong>IMPERIA PONTIFEX MAXIMUS</strong><p id="pontifexOrigin"></p><p id="pontifexSignal"></p><small>One living Pontifex. Only your weapons can kill it. Its exposed heart is vulnerable after an attack.</small><button id="trackPontifex" class="polar-button" aria-pressed="false">TRACK SIGNAL</button></div>';
$('#hudTools').append(pontifexIntel);
const pontifexCombat=document.createElement('section');pontifexCombat.id='pontifexCombat';pontifexCombat.hidden=true;
pontifexCombat.innerHTML='<small>TERRA IMPERIA / <span id="pontifexPhase"></span></small><strong>IMPERIA PONTIFEX MAXIMUS</strong><progress id="pontifexHealth" max="24000" value="24000" aria-label="Pontifex health"></progress><div><span id="pontifexHP"></span><span id="pontifexAttackHint"></span></div><button id="firePontifex" class="polar-button">SUIT DISRUPTOR / Z</button><small>Click the boss or press Z · Sprint aside from red attack markers · Jump over the sweep</small>';
$('#hudContextDock').prepend(pontifexCombat);
const pontifexNotice=document.createElement('div');pontifexNotice.id='pontifexNotice';pontifexNotice.hidden=true;$('#hudAlerts').append(pontifexNotice);
function pontifexPlayable(){return gameActive&&!gamePaused&&!!polarState&&erisPlayable()&&!erisConversation&&!empireOpen&&!constructionOpen&&!questJournalOpen&&$('#inventorySheet').hidden;}
function firePontifex(){if(!pontifexPlayable())return false;const result=NVPontifex.strike(polarState,'player');updatePolarHUD();polarCanvas.focus();return result;}
$('#firePontifex').onclick=firePontifex;
$('#trackPontifex').onclick=()=>{if(!gameActive||!polarState)return;const q=NVPontifex.ensure(polarState);q.track=!q.track;if(q.track&&NVSpace.active(polarState)&&NVGalaxy.system(polarState)===(NVSol.byId[q.body].system||'sol'))NVSpace.select(polarState,q.body);updatePolarHUD();};
const pontifexWaypoint=missionWaypointTarget;missionWaypointTarget=s=>{
 const q=NVPontifex.ensure(s),c=NVConstruction.ensure(s);if(!q.alive||!q.track||typeof NVPontifexHunt!=='undefined'&&q.identity!=='james-brown'&&NVChapter3Access.chapter(s)===4&&!NVPontifexHunt.allowed(s)||c.started&&c.stage<9&&!NVQuests.list(s).some(k=>k.id==='base'&&k.status==='completed'))return pontifexWaypoint(s);
 const system=NVSol.byId[q.body].system||'sol';if(NVGalaxy.system(s)!==system)return['landed','off','cockpit'].includes(s.space.phase)?{x:s.space.landingX,z:s.space.landingZ,label:'Return to ship / Pontifex signal'}:{galaxy:true,system,label:'Pontifex signal / '+NVSol.byId[q.body].name};
 const n=NVPontifex.local(s);if(n)return{x:n.x,z:n.z,label:'Pontifex / '+NVSol.byId[q.body].name};
 const p=s.space;if(p?.phase==='flight'){const b=NVSol.byId[q.body];return{label:'Pontifex signal / '+b.name,position:b.position,radius:b.radius,space:true};}
 if(p?.phase==='landed')return{x:p.landingX,z:p.landingZ,label:'Return to ship / Pontifex on '+NVSol.byId[q.body].name};
 return pontifexWaypoint(s);
};
const pontifexHUD=updatePolarHUD;updatePolarHUD=()=>{
 pontifexHUD();pontifexCombat.hidden=true;pontifexNotice.hidden=true;pontifexIntel.hidden=true;if(!gameActive||!polarState)return;
 const q=NVPontifex.ensure(polarState),w=NVSolWar.ensure(polarState),n=NVPontifex.local(polarState);pontifexIntel.hidden=q.generation===0;
 pontifexIntel.querySelector('strong').textContent=q.name.toUpperCase();pontifexCombat.querySelector('strong').textContent=q.name.toUpperCase();if(q.generation){$('#pontifexOrigin').textContent='FALLEN SOLDIER / '+q.sourceCaptain+' · INCARNATION '+q.generation;$('#pontifexSignal').textContent=q.alive?'SIGNAL / '+NVSol.byId[q.body].name.toUpperCase()+(q.site?' · '+q.site.lat.toFixed(2)+'° / '+q.site.lon.toFixed(2)+'°':' · LAND TO LOCATE'):'DEFEATED BY YOU / '+q.kills+' TOTAL';$('#trackPontifex').disabled=!q.alive;$('#trackPontifex').textContent=q.track?'SIGNAL TRACKED':'TRACK SIGNAL';$('#trackPontifex').setAttribute('aria-pressed',String(q.track));}
 pontifexNotice.hidden=gamePaused||q.noticeTime<=0||w.noticeTime>0&&w.notice.includes('PONTIFEX');pontifexNotice.textContent=q.notice;
 if(!n||n.distance>65||!pontifexPlayable())return;pontifexCombat.hidden=false;pontifexCombat.dataset.mode=q.mode;$('#pontifexHealth').max=q.maxHp;$('#pontifexHealth').value=q.hp;$('#pontifexHP').textContent=Math.ceil(q.hp).toLocaleString()+' / '+q.maxHp.toLocaleString()+' HP';$('#pontifexPhase').textContent='PHASE '+NVPontifex.phase(q);
 $('#pontifexAttackHint').textContent=q.mode==='windup'?'INCOMING '+q.action.toUpperCase():q.mode==='recovery'?'HEART EXPOSED':n.distance>NVPontifex.RANGE?'CLOSE TO 32 M':'ARMOUR ACTIVE';$('#firePontifex').disabled=n.distance>NVPontifex.RANGE||q.weaponCooldown>0||!NVPontifex.lineOfSight(polarState,polarState,n);
};
let pontifexPointer=null;
polarCanvas.addEventListener('pointerdown',e=>{pontifexPointer=e.button===0?{x:e.clientX,y:e.clientY}:null;},true);
polarCanvas.addEventListener('pointercancel',()=>pontifexPointer=null,true);
polarCanvas.addEventListener('pointerup',e=>{
 const start=pontifexPointer;pontifexPointer=null;if(e.button!==0||!start||Math.hypot(e.clientX-start.x,e.clientY-start.y)>6||!pontifexPlayable()||!resourcePickView)return;
 const n=NVPontifex.local(polarState);if(!n||n.distance>NVPontifex.RANGE)return;
 const {vp:m,origin,height}=resourcePickView,b=polarCanvas.getBoundingClientRect();
 const project=(x,y,z)=>{const v=[x-origin[0],y-origin[1],z-origin[2],1],r=[0,0,0,0];for(let i=0;i<4;i++)for(let j=0;j<4;j++)r[i]+=m[j*4+i]*v[j];return r[3]>.01?{x:b.left+(r[0]/r[3]+1)*b.width/2,y:b.top+(1-r[1]/r[3])*b.height/2}:null;};
 const y=height(n.x,n.z),foot=project(n.x,y,n.z),head=project(n.x,y+2.8,n.z);if(!foot||!head)return;const size=Math.abs(foot.y-head.y),cx=(foot.x+head.x)/2;
 if(Math.abs(e.clientX-cx)>Math.max(16,size*.40)||e.clientY<Math.min(foot.y,head.y)-12||e.clientY>Math.max(foot.y,head.y)+12)return;
 e.preventDefault();polarCameraDrag=false;polarPointer=null;e.stopImmediatePropagation();resourcePointerStart=null;firePontifex();
},true);
document.addEventListener('keydown',e=>{if(e.code!=='KeyZ'||!pontifexPlayable()||!NVPontifex.local(polarState)||['INPUT','TEXTAREA','SELECT'].includes(e.target?.tagName))return;e.preventDefault();e.stopImmediatePropagation();if(!e.repeat)firePontifex();},true);
const pontifexExit=exitPolar;exitPolar=()=>{pontifexPointer=null;pontifexCombat.hidden=true;pontifexNotice.hidden=true;pontifexExit();};
