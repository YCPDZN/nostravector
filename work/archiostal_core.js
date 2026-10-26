// An authored neighbour of Sol and Janira; existing systems and saves keep their IDs.
const NVArchiostal=(()=>{
 const SYSTEM='malana',POSITION=[840,160,620],RADIUS=160;
 const WARDS=[
  {id:'central',name:'Central Hub',x:0,z:0,r:55,color:[.77,.65,.38],note:'The Aureate Concourse · arrival hall, fountains and ward transit.'},
  {id:'nexus',name:'Nexus-Alpha',x:0,z:-160,r:42,color:[.26,.65,.88],note:'Diplomatic terraces, Grek embassies and a view of the great ring.'},
  {id:'gardens',name:'Verdant Ward',x:113,z:-113,r:42,color:[.36,.65,.39],note:'Living gardens beneath the habitat domes, pools and shaded walks.'},
  {id:'market',name:'Lantern Exchange',x:160,z:0,r:42,color:[.88,.57,.27],note:'A warm market promenade with arcades and merchant pavilions.'},
  {id:'habitation',name:'Aurora Heights',x:113,z:113,r:42,color:[.62,.55,.86],note:'Residential towers and quiet sky terraces overlooking Malana.'},
  {id:'science',name:'Prism Institute',x:0,z:160,r:42,color:[.24,.75,.77],note:'Research courts, crystal galleries and the observatory.'},
  {id:'docks',name:'Starlight Docks',x:-113,z:113,r:42,color:[.35,.57,.78],note:'Your docking cradle, ship services and departures.'},
  {id:'culture',name:'Silverlight Forum',x:-160,z:0,r:42,color:[.82,.49,.64],note:'Sculpture gardens and a performance pavilion beneath the stars.'},
  {id:'outer',name:'Outer Spiral Echo',x:-113,z:-113,r:42,color:[.35,.78,.72],note:'The outer promenade, biospheres and a panoramic viewing lounge.'}
 ];
 const chapter=s=>s?.featureChapter|| (NVChapter4.started(s)?4:NVChapter3Access.allowed(s)?3:2);
 const available=s=>!!s?.space&&chapter(s)>=3;
 const fresh=()=>({active:false,chapter4Arrived:false,visited:[],x:-113,z:113,yaw:0,pitch:.25,clock:0,speed:0,gaitPhase:0,movementYaw:0,tracked:false,returnPosition:null});
 const safe=(x,z)=>Math.hypot(x,z)<53||WARDS.slice(1).some(w=>Math.hypot(x-w.x,z-w.z)<40)||Math.abs(Math.hypot(x,z)-160)<9||WARDS.slice(1).some(w=>{const d=Math.hypot(w.x,w.z),u=(x*w.x+z*w.z)/d;return u>=0&&u<=d&&Math.abs(x*w.z-z*w.x)/d<8;});
 function restore(raw){const q=fresh();if(!raw)return q;for(const k of ['x','z','yaw','pitch','clock'])if(Number.isFinite(raw[k]))q[k]=raw[k];q.pitch=Math.max(.08,Math.min(.8,q.pitch));if(!safe(q.x,q.z)){q.x=-113;q.z=113;}q.active=raw.active===true;q.chapter4Arrived=raw.chapter4Arrived===true;q.tracked=raw.tracked===true;q.visited=[...new Set((raw.visited||[]).filter(id=>WARDS.some(w=>w.id===id)))];if(raw.returnPosition?.length===3&&raw.returnPosition.every(Number.isFinite))q.returnPosition=raw.returnPosition.slice();return q;}
 const ensure=s=>NVEris.ensure(s).archiostal||(NVEris.ensure(s).archiostal=fresh());
 const active=s=>!!s?.eris?.archiostal?.active&&NVGalaxy.system(s)===SYSTEM;
 const ward=s=>WARDS.reduce((a,b)=>Math.hypot(ensure(s).x-a.x,ensure(s).z-a.z)<Math.hypot(ensure(s).x-b.x,ensure(s).z-b.z)?a:b);
 const distance=s=>NVGalaxy.system(s)===SYSTEM?NVSpace.distance(s.space.position,POSITION):Infinity;
 const canDock=s=>available(s)&&NVGalaxy.system(s)===SYSTEM&&s.space.phase==='flight'&&!s.space.warp&&!s.space.interior?.active&&s.space.hull>0&&distance(s)<360;
 function visit(s){const q=ensure(s),w=ward(s);if(!q.visited.includes(w.id))q.visited.push(w.id);return w;}
 function chapter4Arrived(s){const q=ensure(s);if(NVChapter4.raw(s)?.stage!=='awake'||!NVCapital.ensure(s).claimed)return false;if(active(s))q.chapter4Arrived=true;return q.chapter4Arrived;}
 function dock(s){if(!canDock(s))return false;const p=s.space,q=ensure(s);q.active=true;q.tracked=false;q.returnPosition=p.position.slice();p.speed=0;p.throttle=0;p.autopilot=false;p.combatActive=false;q.x=-113;q.z=113;q.yaw=-.78;q.movementYaw=q.yaw;q.speed=0;q.pitch=.27;visit(s);chapter4Arrived(s);NVQuests.update(s);return true;}
 function depart(s){if(!active(s))return false;const q=ensure(s),p=s.space;q.active=false;p.position=POSITION.map((n,i)=>n+(i===2?240:i===1?25:0));p.phase='flight';p.speed=0;p.throttle=0;p.autopilot=false;NVSpace.pointAt(p,POSITION);NVSpace.notice(p,'ARCHIOSTAL / DEPARTURE CLEARED · MALANA SYSTEM');return true;}
 function transit(s,id){if(!active(s))return false;const w=WARDS.find(w=>w.id===id);if(!w)return false;const q=ensure(s);q.x=w.x;q.z=w.z+10;q.yaw=id==='central'?0:Math.atan2(-w.x,-w.z);q.movementYaw=q.yaw;q.speed=0;NVArchiostalPeople.state(s).last=null;visit(s);NVQuests.update(s);return true;}
 function obstacle(x,z){if(typeof NVArchamus!=='undefined'&&NVArchamus.blocks(x,z))return true;return WARDS.some(w=>{if(w.id==='central')return Math.hypot(x-w.x,z-w.z)<5;return[-1,1].some(side=>Math.abs(x-(w.x+side*25))<7&&Math.abs(z-(w.z-8))<11);});}
 function move(s,dt,forward,right,sprint=false,turn=0){if(!active(s)||!Number.isFinite(dt))return;const q=ensure(s);dt=Math.max(0,Math.min(.1,dt));q.clock+=dt;q.yaw+=turn*dt*1.5;const ox=q.x,oz=q.z,length=Math.max(1,Math.hypot(forward,right)),speed=NVAntarctica.staminaStep(s,sprint,Math.hypot(forward,right)>0,dt),dx=(Math.sin(q.yaw)*forward+Math.cos(q.yaw)*right)*speed*dt/length,dz=(Math.cos(q.yaw)*forward-Math.sin(q.yaw)*right)*speed*dt/length;if(safe(q.x+dx,q.z)&&!obstacle(q.x+dx,q.z))q.x+=dx;if(safe(q.x,q.z+dz)&&!obstacle(q.x,q.z+dz))q.z+=dz;q.speed=dt>0?Math.hypot(q.x-ox,q.z-oz)/dt:0;if(q.speed>.01)q.movementYaw=Math.atan2(q.x-ox,q.z-oz);q.gaitPhase+=NVAntarctica.gaitAdvance(q.speed,dt);NVArchiostalPeople.step(s,dt);visit(s);}
 function waypoint(s){if(!ensure(s).tracked)return null;if(NVGalaxy.system(s)!==SYSTEM)return{galaxy:true,system:SYSTEM,label:'Malana · Archiostal / Grek Empire'};if(NVEris.groundPlay(s))return{x:s.space.landingX||0,z:s.space.landingZ||0,label:'Return to ship · Archiostal'};return{space:true,position:POSITION.slice(),radius:110,label:'Archiostal · Dock with F within 360 FU'};}
 return{SYSTEM,POSITION,RADIUS,WARDS,chapter,available,fresh,restore,ensure,safe,active,ward,distance,canDock,visit,chapter4Arrived,dock,depart,transit,obstacle,move,waypoint};
})();
(()=>{
 const id='malana',system={id,name:'Malana',star:'F6V / Ivory-white',note:'An old Grek Empire sanctuary beside Sol and Janira Proxima. Archiostal, the ring city, welcomes travellers across nine wards.',generated:false};
 NVGalaxy.systems.push(system);const sol=NVCluster.meta.sol.coords,janira=NVCluster.meta['janira-proxima'].coords;
 NVCluster.meta[id]={id,name:'Malana',spectral:'F6V',colorName:'Ivory-white',starClass:'Main-sequence star',starRadius:66,starColor:[1,.91,.73],coords:sol.map((v,i)=>(v+janira[i])/2+(i===1?7:0)),chart:[.555,.665],economy:'Culture / Trade',wealth:'Prosperous',conflict:'Low',station:true,stationName:'ARCHIOSTAL',stationPosition:NVArchiostal.POSITION.slice(),aliases:['archiostal']};
 const template=NVCluster.bodyLists['cluster-01'];NVCluster.bodyLists[id]=[];
 for(const [i,name]of ['Malana Prime','Irielle'].entries()){
  const source=template[i+1],b={...source,id:'malana-p'+(i+1),name,system:id,parent:null,position:i?[2100,70,-800]:[1350,-60,900],category:i?'Frozen planet':'Paradise planet',note:i?'Glacial valleys and ivory ridges beneath Malana’s white star.':'A turquoise ocean world watched over by Archiostal, the Grek Empire’s ring city.'};NVSol.byId[b.id]=b;NVCluster.bodyLists[id].push(b);NVLandscapes.profiles[b.id]={...NVLandscapes.profiles[source.id],id:b.id,title:name.toUpperCase()+' / GREK EMPIRE'};SOL_MAPS[b.id]=SOL_MAPS[source.id];
 }
 const star={...NVCluster.anchors['cluster-01'],id:'malana-star',name:'Malana',system:id,radius:66,color:[1,.91,.73]};NVCluster.anchors[id]=star;NVSol.byId[star.id]=star;
})();
const archiostalRestore=NVEris.restore;NVEris.restore=r=>({...archiostalRestore(r),archiostal:NVArchiostal.restore(r?.archiostal)});
const archiostalFaction=NVEris.faction;NVEris.faction=(s,id)=>NVSol.byId[id]?.system==='malana'&&!NVSol.byId[id]?.stellar?'GREK':archiostalFaction(s,id);
const archiostalDiplomacy=NVDiplomacy.system;NVDiplomacy.system=(s,id)=>id==='malana'?{status:NVGrekEmpire.revealed(s)?'ALLIED':'NEUTRAL',color:NVGrekEmpire.revealed(s)?NVDiplomacy.COLORS.ALLIED:NVDiplomacy.COLORS.NEUTRAL,war:false,allied:NVGrekEmpire.revealed(s),factions:['GREK']}:archiostalDiplomacy(s,id);
const archiostalClaim=NVEris.claim;NVEris.claim=(s,id)=>NVSol.byId[id]?.system==='malana'?false:archiostalClaim(s,id);
const archiostalOrionCapture=NVOrionEmpire.capture;NVOrionEmpire.capture=(s,id)=>NVSol.byId[id]?.system==='malana'?false:archiostalOrionCapture(s,id);
const archiostalWarp=NVGalaxy.canWarp;NVGalaxy.canWarp=(s,id)=>!NVArchiostal.active(s)&&(id!=='malana'||NVArchiostal.available(s))&&archiostalWarp(s,id);
const archiostalWarpStart=NVGalaxy.warp;NVGalaxy.warp=(s,id)=>!NVArchiostal.active(s)&&(id!=='malana'||NVArchiostal.available(s))&&archiostalWarpStart(s,id);
const archiostalSpaceStep=NVSpace.step;NVSpace.step=(s,dt,input)=>{if(!NVArchiostal.active(s))return archiostalSpaceStep(s,dt,input);if(archiostalControlsBlocked())return{player:0,friend:0};NVArchiostal.move(s,dt,input.forward||polarAutoWalk?input.forward||1:0,input.right||0,!!input.boost||polarSprint,input.turn||0);return{player:NVArchiostal.ensure(s).speed,friend:0};};
const archiostalWeaponStep=NVShipReward.step;NVShipReward.step=(s,dt)=>{if(!NVArchiostal.active(s))return archiostalWeaponStep(s,dt);};
NVQuests.definitions.push({id:'chapter4-archiostal',chapter:4,title:'The city among the stars',description:'After accepting the Grek Horizon, warp to Malana and dock at Archiostal.',available:s=>NVChapter4.raw(s)?.stage==='awake'&&NVCapital.ensure(s).claimed,done:s=>NVArchiostal.chapter4Arrived(s)});
const archiostalQuestRestore=NVQuests.restore;NVQuests.restore=r=>{const q=archiostalQuestRestore(r);if(r?.completed?.includes('chapter4-archiostal')&&!q.completed.includes('chapter4-archiostal'))q.completed.push('chapter4-archiostal');return q;};
