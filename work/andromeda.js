// A seeded second galaxy. Catalogue IDs are stable; ownership and discoveries belong to each save.
const NVAndromeda=(()=>{
 const GALAXY='andromeda',CORE='m31-core',GATE='sagittarius-a',SEED=312127;
 const region=id=>NVCluster.meta[id]?.galaxy||'milky-way';
 const local=s=>region(NVGalaxy.system(s))===GALAXY;
 const unlocked=chapter5Unlocked;
 const random=seed=>{let n=seed>>>0;return()=>((n=(Math.imul(n,1664525)+1013904223)>>>0)/4294967296);};
 const entryReason=s=>unlocked(s)?'':'Complete Chapter 4 before crossing to Andromeda.';
 const names=['Vaer','Ish','Oru','Thal','Xe','Kyr','Lume','Sora'],ends=['neth','vessa','kora','dion','thara','myr','syl'];
 const systems=[],SYSTEM_COUNT=100,MAX_PLANETS=5,roman=['I','II','III','IV','V','VI','VII','VIII','IX','X'];
 const legacy=[];for(let i=1;i<=5;i++)for(let j=4;j<=20;j++)legacy.push('andromeda-'+String(i).padStart(2,'0')+'-p'+j);
 const types=[
  {category:'Terrestrial planet',kind:'ridge',style:'earth',atmosphere:true,feature:'boulder',code:7},
  {category:'Frozen planet',kind:'glacier',style:'ice',atmosphere:true,feature:'ice',code:9},
  {category:'Rocky planet',kind:'craters',style:'rock',atmosphere:false,feature:'crater',code:1},
  {category:'Scorched planet',kind:'volcano',style:'rock',atmosphere:true,feature:'volcano',code:5},
  {category:'Ravaged planet',kind:'canyon',style:'rock',atmosphere:true,feature:'mesa',code:4}
 ];
 function texture(b,seed){const c=document.createElement('canvas');c.width=256;c.height=128;const ctx=c.getContext('2d'),im=ctx.createImageData(c.width,c.height),wet=/Paradise|Terrestrial/.test(b.category);for(let y=0;y<128;y++)for(let x=0;x<256;x++){const a=x/256*Math.PI*2,lat=y/128*Math.PI,n=NVAntarctica.noise(Math.cos(a)*Math.sin(lat)*3+seed%31,Math.sin(a)*Math.sin(lat)*3+Math.cos(lat)*2,seed),tone=wet&&n<.44?b.waterColor:b.color,k=(y*256+x)*4;for(let j=0;j<3;j++)im.data[k+j]=Math.min(255,Math.round(tone[j]*255*(.72+n*.5)));im.data[k+3]=255;}ctx.putImageData(im,0,0);return c.toDataURL('image/png');}
 const charted=[[.5,.51]];
 for(let i=0;i<SYSTEM_COUNT;i++){
  const r=random(SEED+i*8191),id='andromeda-'+String(i+1).padStart(2,'0'),word=names[Math.floor(r()*names.length)]+ends[Math.floor(r()*ends.length)],name=word+' '+(i<5?roman[i]:String(i+1).padStart(3,'0')),coords=i<5?[100000+i*15-30,0,(i%2)*20-10]:[100000+(i%10-4.5)*18,0,(Math.floor(i/10)-4.5)*18],color=[.40+r()*.6,.55+r()*.4,.70+r()*.3],paradise=i%8===0,count=i<5?2+((Math.imul(i+1,2654435761)>>>0)%4):1+((Math.imul(i+1,2654435761)>>>0)%MAX_PLANETS);
  let chart=i<5?[[.23,.66],[.38,.48],[.65,.42],[.77,.29],[.60,.65]][i]:null;
  if(!chart){const radius=Math.sqrt((i-4.5)/95)*.45;for(let n=0;n<64;n++){const a=i*2.399963+n*.39;chart=[.5+Math.cos(a)*radius,.51+Math.sin(a)*radius*.62-Math.cos(a)*radius*.23];if(charted.every(p=>Math.hypot(p[0]-chart[0],p[1]-chart[1])>.027))break;}}
  charted.push(chart);systems.push(id);NVGalaxy.systems.push({id,name,generated:true,star:'ANDROMEDA GALAXY / '+['F6V','K3V','B9V','G4V','A3V'][i%5],note:'Procedural Andromeda system with '+count+' planets'+(i<5?' and one airless moon':'')+'. '+(paradise?'One rare paradise planet. ':'')+'Initially unclaimed.'});
  NVCluster.meta[id]={id,name,galaxy:GALAXY,spectral:['F6V','K3V','B9V','G4V','A3V'][i%5],colorName:['Pale gold','Amber','Blue-white','Yellow','White'][i%5],starClass:'Main-sequence star',starColor:color,starRadius:62,coords,chart,economy:['Research','Mining','Energy','Trade','Biotechnology'][i%5],wealth:'Unsurveyed',conflict:'Unknown',station:false,entryReason,paradiseSystem:paradise,planetCount:count};NVCluster.bodyLists[id]=[];
  function world(j,moon=false){
   const base=moon?{category:'Airless moon',kind:'craters',style:'rock',atmosphere:false,feature:'crater',code:1}:paradise&&j===0?{...types[0],category:'Paradise planet'}:types[Math.floor(r()*types.length)],old=i>=5&&i<90&&j===0?legacy[i-5]:null,bodyId=moon?id+'-p3':old||(id+'-p'+(i<5&&j>=2?j+19:j+1)),angle=.7+i*.4+(moon?2:j)*1.7,orbit=1100+(moon?2:j)*950,land=[.12+r()*.5,.16+r()*.5,.2+r()*.55],water=[.10+r()*.25,.12+r()*.4,.3+r()*.4],source=NVSol.byId['cluster-01-p2'];
   if(base.category==='Frozen planet')land.splice(0,3,.58+r()*.2,.68+r()*.2,.78+r()*.2);if(base.category==='Scorched planet')land.splice(0,3,.58,.20,.11);
   const b={...structuredClone(source),id:bodyId,name:(i<5?word:name)+' '+(moon?'II-a':roman[j]),system:id,galaxy:GALAXY,category:base.category,parent:moon?id+'-p2':null,position:[Math.cos(angle)*orbit,(moon?2:j)*35,Math.sin(angle)*orbit],radius:moon?29:61+r()*23,km:moon?1800:5400+Math.floor(r()*2900),color:land,terrain:land.slice(),waterColor:water,sky:!base.atmosphere?[.002,.003,.01]:[.18+r()*.2,.20+r()*.2,.3+r()*.2],style:base.style,atmosphere:base.atmosphere,giant:false,rings:false,gravity:moon?.28:.8+r()*.3,note:/Paradise|Terrestrial|Frozen/.test(base.category)?'A remote Andromeda ecosystem. Scan its unique native flora, grazers and predators.':'A hostile or airless landscape with no native biosphere.'};
   NVSol.byId[bodyId]=b;NVCluster.bodyLists[id].push(b);NVLandscapes.profiles[bodyId]={id:bodyId,title:b.name.toUpperCase()+' / '+b.category.toUpperCase(),kind:base.kind,height:moon?32:35+r()*35,scale:180+r()*110,accent:land.map(v=>Math.min(1,v+.18)),feature:base.feature,code:base.code,angle:r()*6.28};Object.defineProperty(SOL_MAPS,bodyId,{enumerable:true,configurable:true,get(){const image=texture(b,SEED+i*57+j*19+(moon?7:0));Object.defineProperty(SOL_MAPS,bodyId,{value:image,writable:true,enumerable:true,configurable:true});return image;}});
  }
  for(let j=0;j<count;j++)world(j);if(i<5)world(1,true);
  const anchor={...structuredClone(NVCluster.anchors['cluster-01']),id:id+'-star',name,system:id,galaxy:GALAXY,position:[0,0,0],radius:62,color,terrain:color.slice()};NVCluster.anchors[id]=anchor;NVSol.byId[anchor.id]=anchor;
 }
 const anchor={...structuredClone(NVCluster.anchors[GATE]),id:CORE+'-black-hole',name:'M31*',system:CORE,galaxy:GALAXY,note:'Andromeda’s central black hole. A stable passage leads back to Sagittarius A* in the Milky Way.'};NVSol.byId[anchor.id]=anchor;NVCluster.anchors[CORE]=anchor;NVCluster.bodyLists[CORE]=[];
 NVGalaxy.systems.push({id:CORE,name:'M31*',star:'Supermassive black hole',generated:false,note:anchor.note});NVCluster.meta[CORE]={...NVCluster.meta[GATE],id:CORE,name:'M31*',galaxy:GALAXY,coords:[100000,0,0],chart:[.50,.51],station:false,stationName:'',aliases:['m31','m31*','andromeda'],economy:'Intergalactic passage',conflict:'Unknown',entryReason};
 const canConquer=(s,f,id)=>NVSol.byId[id]?.galaxy!==GALAXY||(unlocked(s)&&NVEris.faction(s,'carax')===f);
 function evacuate(s){if(!(unlocked(s)||NVCatharsisRoute.peaceful(s))||!NVCarax.local(s))return false;const q=NVCarax.ensure(s),p=s.space;q.deck=0;q.rover.driving=false;q.rover.speed=0;if(s.car)s.car.driving=false;p.interior&&(p.interior.active=false);const e=NVCapital.owned(s)?NVCapital.entry(s):{x:p.landingX||0,z:p.landingZ||0};Object.assign(s,{x:e.x,z:e.z,yaw:0,jumpOffset:0,aerialView:false});s.friend={x:s.x+2,z:s.z-2,yaw:0};NVSpace.notice(p,'RETURNED TO SHIP / BOARD AT THE AIRLOCK TO LEAVE CARAX.');return true;}
 return{GALAXY,CORE,GATE,SEED,SYSTEM_COUNT,MAX_PLANETS,systems,region,local,unlocked,entryReason,canConquer,evacuate};
})();

// The bridge is the only edge between the two galaxy graphs; ordinary jumps retain their fuel rules.
const andromedaCanWarp=NVGalaxy.canWarp;NVGalaxy.canWarp=(s,id)=>NVAndromeda.region(id)==='andromeda'&&!NVAndromeda.unlocked(s)?false:andromedaCanWarp(s,id);
const andromedaWarp=NVGalaxy.warp;NVGalaxy.warp=(s,id)=>NVAndromeda.region(id)==='andromeda'&&!NVAndromeda.unlocked(s)?false:andromedaWarp(s,id);

// Carax is a normal contested world after liberation, rather than permanently forcing player ownership.
const andromedaFaction=NVEris.faction,andromedaOwner=NVGalacticDiplomacy.owner;
NVEris.faction=(s,id)=>{if(id==='carax'){if(chapter5Unlocked(s))return caraxGalacticOwner(s,id);if(s?.eris?.galacticDiplomacy&&Object.hasOwn(s.eris.galacticDiplomacy.owners,id))return s.eris.galacticDiplomacy.owners[id];}const f=andromedaFaction(s,id);return chapter5Unlocked(s)&&f==='CATHARSIS'?'UNCLAIMED':f;};
NVGalacticDiplomacy.owner=(s,id)=>id==='carax'?NVEris.faction(s,id):andromedaOwner(s,id);
const andromedaTransfer=NVFrontlineCampaign.transfer;NVFrontlineCampaign.transfer=(s,id,f)=>NVAndromeda.canConquer(s,f,id)&&andromedaTransfer(s,id,f);
const andromedaCapture=NVGalacticDiplomacy.capture;NVGalacticDiplomacy.capture=(s,warId,id)=>{const w=NVGalacticDiplomacy.ensure(s).wars.find(w=>w.id===warId);return !!w&&NVAndromeda.canConquer(s,w.aggressor,id)&&andromedaCapture(s,warId,id);};
const andromedaClaim=NVEris.claim;NVEris.claim=(s,id)=>NVAndromeda.canConquer(s,'CUSTOM',id)&&andromedaClaim(s,id);
const andromedaAssaultStatus=NVBaseAssault.status;NVBaseAssault.status=s=>{const r=andromedaAssaultStatus(s);return r&&!NVAndromeda.canConquer(s,'CUSTOM',r.base.body)?{...r,ready:false,locked:'Control Carax before capturing worlds in Andromeda.'}:r;};
const andromedaAssaultCapture=NVBaseAssault.capture;NVBaseAssault.capture=s=>NVAndromeda.canConquer(s,'CUSTOM',s.space?.body)?andromedaAssaultCapture(s):{ok:false,text:'Control Carax before capturing worlds in Andromeda.'};
const andromedaBaseTravel=NVBaseTravel.travel;NVBaseTravel.travel=(s,id)=>{const b=NVBaseTravel.list(s).find(b=>b.id===id);if(b&&NVAndromeda.region(NVSol.byId[b.body]?.system||'sol')!==NVAndromeda.region(NVGalaxy.system(s))){NVSpace.notice(s.space,'CROSS THROUGH YOUR GALAXY’S BLACK HOLE EVENT HORIZON BEFORE FAST TRAVELLING TO THIS BASE.');return false;}return andromedaBaseTravel(s,id);};
const andromedaDiplomacyRestore=NVGalacticDiplomacy.restore;NVGalacticDiplomacy.restore=r=>({...andromedaDiplomacyRestore(r),andromedaExpansionClock:Math.max(0,Math.min(420,Number(r?.andromedaExpansionClock)||0))});
const andromedaAdvance=NVGalacticDiplomacy.advance;NVGalacticDiplomacy.advance=(s,seconds)=>{
 andromedaAdvance(s,seconds);if(!NVAndromeda.unlocked(s)||!Number.isFinite(seconds)||seconds<=0)return;const q=NVGalacticDiplomacy.ensure(s),f=NVEris.faction(s,'carax');
 if(['CUSTOM','UNCLAIMED'].includes(f)||!q.wars.some(w=>w.stage==='active'&&[w.aggressor,w.defender].includes(f)))return;
 q.andromedaExpansionClock=(q.andromedaExpansionClock||0)+Math.min(seconds,420);const interval=240+NVFrontlineCampaign.hash(f)%181;if(q.andromedaExpansionClock<interval)return;q.andromedaExpansionClock%=interval;
 const b=NVAndromeda.systems.flatMap(id=>NVCluster.bodyLists[id]).find(b=>!b.parent&&NVEris.faction(s,b.id)==='UNCLAIMED'&&!(s.space?.phase==='landed'&&s.space.body===b.id));
 if(b&&NVFrontlineCampaign.transfer(s,b.id,f)){q.history.unshift(NVDiplomacy.name(s,f)+' ESTABLISHED AN ANDROMEDA FOOTHOLD ON '+b.name.toUpperCase());q.history=q.history.slice(0,80);NVSpace.notice(s.space,NVDiplomacy.name(s,f)+' EXPANDED THROUGH CARAX INTO ANDROMEDA GALAXY / '+b.name.toUpperCase());}
};

const andromedaImage=new Image();andromedaImage.src='__ANDROMEDA_MAP__';andromedaImage.onload=()=>{if(galaxyOpen&&NVAndromeda.local(polarState))drawMilkyWay();};
const andromedaDraw=drawMilkyWay;drawMilkyWay=()=>{
 if(!NVAndromeda.local(polarState))return andromedaDraw();const c=$('#milkyMap').getContext('2d'),w=c.canvas.width,h=c.canvas.height,current=NVGalaxy.system(polarState);c.fillStyle='#020611';c.fillRect(0,0,w,h);
 if(andromedaImage.complete&&andromedaImage.naturalWidth)c.drawImage(andromedaImage,0,0,w,h);c.fillStyle=chapter4VisualMood(polarState)?'#23000c75':'#0208174d';c.fillRect(0,0,w,h);
 const here=clusterProjection(NVCluster.meta[current],w,h);for(const sys of clusterVisibleSystems()){
  const m=NVCluster.meta[sys.id],p=clusterProjection(m,w,h),selected=sys.id===galaxySelected,diplomacy=NVDiplomacy.system(polarState,sys.id);if(sys.id!==current&&NVCluster.distance(current,sys.id)<=NVCluster.RANGE){c.strokeStyle='#92e8f087';c.beginPath();c.moveTo(here.x,here.y);c.lineTo(p.x,p.y);c.stroke();}c.fillStyle=sys.id===current?'#7cf8ef':selected?'#ffe0a8':'#f2f2ff';c.beginPath();c.arc(p.x,p.y,m.blackHole?7:4,0,Math.PI*2);c.fill();c.strokeStyle=diplomacy.color||'#b1bfce';c.lineWidth=2;c.beginPath();c.arc(p.x,p.y,selected?15:10,0,Math.PI*2);c.stroke();
 }
 c.font='14px Consolas';c.fillStyle='#f0f6ff';c.fillText('ANDROMEDA GALAXY / M31',22,28);
};
const andromedaGateButton=document.createElement('button');andromedaGateButton.id='andromedaGateway';andromedaGateButton.className='polar-button';andromedaGateButton.hidden=true;$('#galaxyWarp').after(andromedaGateButton);
andromedaGateButton.onclick=()=>{const s=polarState;if(!gameActive||!NVAndromeda.unlocked(s))return;const id=NVGalaxy.system(s)===NVAndromeda.GATE?NVAndromeda.CORE:NVAndromeda.GATE;if(NVGalaxy.warp(s,id)){toggleGalaxy(false);updatePolarHUD();}else{$('#galaxyStatus').textContent=NVCluster.reason(s,id);}};
const andromedaRefresh=refreshGalaxy;refreshGalaxy=()=>{
 if(!polarState?.space)return;const local=NVAndromeda.local(polarState),current=NVGalaxy.system(polarState);if(NVAndromeda.region(galaxySelected)!==NVAndromeda.region(current))galaxySelected=current;andromedaRefresh();
 $('#galaxySheet header span').textContent=(NVAndromeda.unlocked(polarState)?'2127':'2125')+' AD / '+(local?'ANDROMEDA GALAXY':'MILKY WAY');$('#galaxySheet header h2').textContent=local?'ANDROMEDA GALAXY MAP':'GALAXY MAP';$('#milkyMap').setAttribute('aria-label',local?'Andromeda galaxy with one hundred star systems and the M31* gateway':'Milky Way galaxy map');
 if(local){$('#clusterCoordinates').textContent=NVCluster.meta[current].coords.map((v,i)=>(i===0?v-100000:v).toFixed(2)).join(' / ')+' LY';coreMapButtons.hidden=true;tyroRoute.hidden=true;}
 $('.cluster-directory label').textContent='SYSTEM DIRECTORY / '+clusterVisibleSystems().length;$('.cluster-map-key').textContent=local?'ANDROMEDA · 100 SYSTEMS + M31* · 1–5 PLANETS PER SYSTEM\n72 LY RANGE · RETURN THROUGH M31*':clusterVisibleSystems().length+' CHARTED SYSTEMS · 72 LY RANGE';
 andromedaGateButton.hidden=!NVAndromeda.unlocked(polarState)||![NVAndromeda.GATE,NVAndromeda.CORE].includes(current);andromedaGateButton.textContent=local?'RETURN TO MILKY WAY / SAGITTARIUS A*':'TRAVEL TO ANDROMEDA GALAXY / M31*';andromedaGateButton.disabled=!NVGalaxy.canWarp(polarState,local?NVAndromeda.GATE:NVAndromeda.CORE);
 if(galaxySelected===NVAndromeda.CORE){$('#galaxyBodies').textContent='M31* / BLACK HOLE · NO PLANETARY LANDING\nRETURN GATEWAY TO THE MILKY WAY';$('#galaxyFaction').textContent='INTERGALACTIC PASSAGE / UNCLAIMED';}
 if(galaxySelected===NVAndromeda.GATE&&NVAndromeda.unlocked(polarState)){$('#galaxyBodies').textContent='CARAX / AIRLESS FORTRESS PLANET\nINTERGALACTIC PASSAGE TO M31*';$('#galaxyFaction').textContent='CARAX / '+NVDiplomacy.name(polarState,NVEris.faction(polarState,'carax'));$('#galaxyNote').textContent='Carax has been liberated. Fly to Sagittarius A* and use TRAVEL TO ANDROMEDA GALAXY / M31* to cross galaxies.';}
 if(local)$('#galaxyNote').textContent+=' Factions must control Carax to conquer Andromeda worlds.';
};
const andromedaExitButton=document.createElement('button');andromedaExitButton.id='leaveCarax';andromedaExitButton.className='polar-button';andromedaExitButton.hidden=true;andromedaExitButton.textContent='RETURN TO SHIP / LEAVE CARAX';$('#hudContextDock').append(andromedaExitButton);
andromedaExitButton.onclick=()=>{if(!gameActive||gamePaused)return;if(NVAndromeda.evacuate(polarState)){polarKeys.clear();updatePolarHUD();polarCanvas.focus();}};
const andromedaHUD=updatePolarHUD;updatePolarHUD=()=>{andromedaHUD();andromedaExitButton.hidden=!gameActive||gamePaused||!NVAndromeda.unlocked(polarState)||!NVCarax.local(polarState);if(gameActive&&NVAndromeda.local(polarState)&&polarState.space?.body===NVCluster.anchors[NVAndromeda.CORE].id)$('#spaceHint').textContent='M31* / OPEN THE GALAXY MAP TO EXPLORE ANDROMEDA OR RETURN TO SAGITTARIUS A*.';};
const andromedaCandidates=hudInteractionCandidates;hudInteractionCandidates=s=>['leaveCarax',...andromedaCandidates(s)];
const andromedaExit=exitPolar;exitPolar=()=>{andromedaExitButton.hidden=true;return andromedaExit();};$('#worldToMenu').onclick=()=>exitPolar();

// Relocate older excess worlds without dropping their IDs, claims, governors, bases or current landing.
const andromedaSpaceRestore=NVSpace.restore;NVSpace.restore=(raw,s)=>{const body=NVSol.byId[raw?.body];if(body?.galaxy==='andromeda'&&raw.system!==body.system)raw={...raw,system:body.system,target:body.id,position:raw.phase==='landed'||raw.phase==='cockpit'?raw.position:NVSpace.routeEnd(body),warp:null,autopilot:false};return andromedaSpaceRestore(raw,s);};
const andromedaWorldRestore=NVAntarctica.restored;NVAntarctica.restored=(...args)=>{const s=andromedaWorldRestore(...args);if(s.eris){for(const c of Object.values(s.eris.governance?.colonies||{}))if(NVSol.byId[c.body]?.galaxy==='andromeda')c.system=NVSol.byId[c.body].system;for(const a of Object.values(s.eris.crewDiplomacy?.assignments||{}))if(NVSol.byId[a.body]?.galaxy==='andromeda')a.system=NVSol.byId[a.body].system;if(s.space)for(const b of NVBaseTravel.list(s)){const a=s.eris.baseTravel?.[b.id];if(a&&NVSol.byId[b.body]?.galaxy==='andromeda')a.system=NVSol.byId[b.body].system;}}return s;};
