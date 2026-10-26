// Additive, deterministic cluster. The two authored systems and Sol catalogue
// keep their existing identities, bodies, terrain, quests and faction rules.
const NVCluster=(()=>{
 const SEED=21251013,RANGE=72,CAPACITY=5,START='cluster-01';
 const rng=seed=>{let n=seed>>>0;return()=>{n=(Math.imul(n,1664525)+1013904223)>>>0;return n/4294967296;};};
 const pick=(r,a)=>a[Math.floor(r()*a.length)],roman=['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII','XIII'];
 const stars=[['F7V','Yellow-white',[1,.87,.66]],['G3V','Yellow',[1,.79,.42]],['K4V','Orange',[1,.57,.30]],['M2V','Red',[1,.29,.22]],['A5V','White',[.83,.90,1]],['B8V','Blue-white',[.57,.75,1]]];
 const TYPES=[
  {category:'Paradise planet',kind:'ridge',style:'earth',color:[.23,.50,.30],accent:[.42,.73,.40],sky:[.32,.53,.73],atmosphere:true,gravity:.92,feature:'boulder'},
  {category:'Scorched planet',kind:'volcano',style:'rock',color:[.65,.25,.13],accent:[1,.46,.10],sky:[.40,.17,.09],atmosphere:true,gravity:.85,feature:'volcano'},
  {category:'Frozen planet',kind:'glacier',style:'ice',color:[.64,.78,.88],accent:[.76,.93,1],sky:[.21,.34,.48],atmosphere:true,gravity:.71,feature:'ice'},
  {category:'Ravaged planet',kind:'canyon',style:'rock',color:[.49,.42,.12],accent:[.84,.69,.24],sky:[.42,.34,.13],atmosphere:true,gravity:1.09,feature:'mesa'},
  {category:'Rocky planet',kind:'craters',style:'rock',color:[.47,.34,.29],accent:[.71,.49,.30],sky:[.015,.012,.025],atmosphere:false,gravity:.48,feature:'crater'},
  {category:'Gas giant',kind:'cloud',style:'gas',color:[.56,.49,.70],accent:[.77,.62,.91],sky:[.33,.25,.47],atmosphere:true,giant:true,gravity:1.9,feature:'storm'},
  {category:'Airless planet',kind:'rubble',style:'rock',color:[.33,.40,.47],accent:[.58,.66,.75],sky:[.002,.004,.014],atmosphere:false,gravity:.26,feature:'boulder'}
 ];
 const CORE_START=88,EXTRA_COUNT=98;
 const namedStars=[
  {name:'Betelgeuse',spectral:'M2Iab',colorName:'Red',starColor:[1,.32,.12],starClass:'Red supergiant',starRadius:130,aliases:['beutelguese','betelguese'],note:'A red supergiant in Orion. Its explorable planets are fictional.'},
  {name:'Alpha Centauri',spectral:'G2V + K1V',colorName:'Yellow / orange',starColor:[1,.84,.50],starClass:'Binary main-sequence stars',starRadius:62,aliases:['alpha centuari'],note:'The Alpha Centauri A/B pair; Proxima is charted as a separate destination. These planetary landscapes are fictional.'},
  {name:'Proxima Centauri',spectral:'M5.5V',colorName:'Red',starColor:[1,.23,.13],starClass:'Red dwarf',starRadius:32,aliases:['proxima centuari'],note:'The red dwarf companion of Alpha Centauri. Fictional worlds for free exploration.'},
  {name:'VY Canis Majoris',spectral:'M4Ia+',colorName:'Red',starColor:[1,.22,.08],starClass:'Red hypergiant',starRadius:180,aliases:[],note:'A red hypergiant surrounded by material shed from its atmosphere. Its planetary system is fictional.'},
  {name:'UY Scuti',spectral:'M2Ia',colorName:'Red',starColor:[1,.28,.10],starClass:'Red supergiant',starRadius:155,aliases:['uy scoti'],note:'A vast red supergiant in Scutum. Its explorable planetary system is fictional.'},
  {name:'Arcturus',spectral:'K1.5III',colorName:'Orange',starColor:[1,.58,.24],starClass:'Orange giant',starRadius:95,aliases:[],note:'An orange giant in Boötes. Fictional planets orbit this charted star.'},
  {name:'Rigel',spectral:'B8Ia',colorName:'Blue-white',starColor:[.43,.70,1],starClass:'Blue supergiant',starRadius:125,aliases:[],note:'A blue supergiant in Orion. Its explorable worlds are fictional.'}
 ];
 const evolvedStars=[
  {spectral:'B1Ia',colorName:'Blue',starColor:[.35,.60,1],starClass:'Blue supergiant',starRadius:120},
  {spectral:'M2Iab',colorName:'Red',starColor:[1,.30,.12],starClass:'Red supergiant',starRadius:140},
  {spectral:'M4Ia+',colorName:'Red',starColor:[1,.20,.08],starClass:'Red hypergiant',starRadius:180},
  {spectral:'K2III',colorName:'Orange',starColor:[1,.57,.24],starClass:'Orange giant',starRadius:90}
 ];
 const numeral=n=>{let text='';for(const [value,symbol] of [[100,'C'],[90,'XC'],[50,'L'],[40,'XL'],[10,'X'],[9,'IX'],[5,'V'],[4,'IV'],[1,'I']])while(n>=value){text+=symbol;n-=value;}return text;};
 const generated=[],bodyLists={},meta={},anchors={};
 for(let i=0;i<EXTRA_COUNT;i++){
  const r=rng(SEED+i*8191),id='cluster-'+String(i+1).padStart(2,'0');
  const named=namedStars[i-10];
  const name=named?named.name:i===0?'Vaelith-Rhûn IX':pick(r,['Othes','Aural','Teyra','Neth','Voss','Ilyon','Zereth','Caldris','Elyth','Orvek'])+'-'+pick(r,['Rika','Vey','Thalen','Kor','Syle','Nara','Iska','Ruun','Mora','Aeth'])+' '+(roman[i+2]||numeral(i+3));
  const spectral=i===0?stars[0]:pick(r,stars),evolved=named||(i<CORE_START&&i>=17&&i%3===0?evolvedStars[Math.floor(i/3)%evolvedStars.length]:null),count=i===0?4:3+Math.floor(r()*3),economy=pick(r,['Mining','Technology','Trade','Research','Manufacturing','Energy']),wealth=pick(r,['Destitute','Developing','Stable','Prosperous','Booming']);
  const station=i===0||r()>.28,q={id,name,star:spectral[0]+' / '+spectral[1],note:'A seeded '+economy.toLowerCase()+' system with '+count+' unexplored worlds.',generated:true};generated.push(q);bodyLists[id]=[];
  meta[id]={id,name,spectral:spectral[0],colorName:spectral[1],starColor:spectral[2].slice(),starClass:'Main-sequence star',starRadius:62,economy,wealth,conflict:pick(r,['Low','Medium','High']),station};
  if(evolved){Object.assign(meta[id],evolved,{id,name});q.star=meta[id].spectral+' / '+meta[id].starClass;q.note=(named?named.note:'An unexplored '+meta[id].starClass.toLowerCase()+' system with '+count+' fictional worlds.')+' Neutral relations. Chart distances are compressed for gameplay.';}
  for(let j=0;j<count;j++){
   const base=TYPES[i===0?[4,0,2,5][j]:(i+j*3+Math.floor(r()*7))%TYPES.length],tone=(r()-.5)*.20,color=base.color.map((v,k)=>Math.max(.05,Math.min(.95,v+tone+(k===i%3?.07:0)))),bodyId=id+'-p'+(j+1),angle=.55+j*1.42+i*.28,orbit=900+j*800;
   const b={id:bodyId,name:name.split(' ')[0]+' '+roman[j],system:id,category:base.category,km:base.giant?24000:2200+Math.floor(r()*7400),au:.45+j*.7,radius:base.giant?110:45+r()*36,position:[Math.cos(angle)*orbit,(r()-.5)*140,Math.sin(angle)*orbit],color,terrain:color.slice(),sky:base.sky.map(v=>Math.min(.9,v+(r()-.5)*.05)),style:base.style,parent:null,atmosphere:base.atmosphere,giant:!!base.giant,gravity:base.gravity*(.8+r()*.4),rings:base.giant&&(i+j)%2===1,tilt:r()*.35,note:base.category+' / '+pick(r,['towering mountain chains','fractured highlands','deep basin networks','wind-carved ranges'])+' beneath the '+spectral[1].toLowerCase()+' star of '+name+'.'};
   if(i>=10)b.note=b.category+' / '+meta[id].starClass+' host: '+name+'. Fictional explorable landscape.';if(i===0&&j===1)b.sky=[.41,.26,.51];NVSol.byId[bodyId]=b;bodyLists[id].push(b);
   NVLandscapes.profiles[bodyId]={id:bodyId,title:b.name.toUpperCase()+' / '+base.category.toUpperCase(),kind:base.kind,height:base.giant?0:25+r()*75,scale:130+r()*260,accent:base.accent.map((v,k)=>Math.min(1,Math.max(.03,v+tone*(k===0?-1:1)))),feature:base.feature,code:{craters:1,rubble:2,dunes:3,canyon:4,volcano:5,fractures:6,ridge:7,frost:8,glacier:9,cloud:10}[base.kind],angle:r()*Math.PI*2};
  }
  const star=meta[id],hyper=star.starClass.includes('hypergiant'),supergiant=star.starClass.includes('supergiant');
  if(supergiant||hyper){
   star.starRadius=hyper?7200:star.starClass==='Red supergiant'?Math.round(star.starRadius*14):Math.round(star.starRadius*8);
   const keep=hyper?0:1+(i%2),old=bodyLists[id];
   for(const b of old.slice(keep)){delete NVSol.byId[b.id];delete NVLandscapes.profiles[b.id];}
   bodyLists[id]=old.slice(0,keep);
   for(const [j,b]of bodyLists[id].entries()){
    const base=TYPES[1],a=.6+j*2.1+i*.28,orbit=star.starRadius*(2.8+j*1.6);
    Object.assign(b,{category:'Scorched planet',position:[Math.cos(a)*orbit,(j-.5)*160,Math.sin(a)*orbit],color:base.color.slice(),terrain:base.color.slice(),sky:base.sky.slice(),style:base.style,atmosphere:true,giant:false,rings:false,parent:null,gravity:.85,note:'A scorched volcanic world beneath the immense '+star.starClass.toLowerCase()+' '+name+'.'});
    Object.assign(NVLandscapes.profiles[b.id],{title:b.name.toUpperCase()+' / SCORCHED VOLCANIC WASTELAND',kind:'volcano',height:85,scale:260,accent:base.accent.slice(),feature:'volcano',code:5});
   }
   q.note=star.starClass+' / '+(hyper?'No planets. An immense, isolated star surrounded by lethal stellar heat.':keep+' scorched '+(keep===1?'planet':'planets')+' orbit beyond its expanded stellar envelope.')+' Neutral relations. Chart distances are compressed for gameplay.';
  }
  const anchor={id:id+'-star',name,system:id,category:star.starClass,stellar:true,radius:star.starRadius,km:star.starRadius*1000,position:[0,0,0],color:star.starColor.slice(),terrain:star.starColor.slice(),sky:[.002,.004,.012],style:'star',parent:null,atmosphere:false,gravity:0,tilt:0,note:'Stellar surface / cannot land. Stay outside the heat exclusion zone.'};
  anchors[id]=anchor;NVSol.byId[anchor.id]=anchor;NVLandscapes.profiles[anchor.id]={id:anchor.id,title:'STELLAR SPACE / '+name.toUpperCase(),kind:'cloud',height:0,scale:260,accent:star.starColor.slice(),feature:'none',code:10,angle:0};
  if(hyper)star.station=false;
  const b=bodyLists[id][0];star.stationPosition=b?[b.position[0]+260,b.position[1]+210,b.position[2]+240]:[star.starRadius*3,0,0];
 }
 NVGalaxy.systems.push(...generated);
 // Preserve legacy navigation coordinates; the added connected survey grid uses compressed warp distances.
 NVGalaxy.systems.forEach((q,i)=>{const angle=i/12*Math.PI*2,coords=[Math.round((Math.cos(angle)-1)*6500)/100,Math.round(Math.sin(angle*2)*300)/100,Math.round(Math.sin(angle)*6500)/100];
  if(!meta[q.id])meta[q.id]={id:q.id,name:q.name,spectral:q.id==='sol'?'G2V':'K4V',colorName:q.id==='sol'?'Yellow':'Orange',starColor:q.id==='sol'?[1,.83,.48]:[1,.56,.28],economy:q.id==='sol'?'Mixed':'Research',wealth:q.id==='sol'?'Prosperous':'Stable',conflict:q.id==='sol'?'High':'Low',station:q.id==='sol'};
  meta[q.id].coords=i<12?coords:[-280+(i-12)%13*36,Math.round(Math.sin(i)*250)/100,-90+Math.floor((i-12)/13)*36];
  const arm=i%4,t=.18+(Math.floor(i/4)/22)*.78,chartAngle=t*5.2+arm*Math.PI/2;
  meta[q.id].chart=q.id==='sol'?[.53,.66]:q.id==='janira-proxima'?[.57,.63]:[.49+Math.cos(chartAngle)*t*.45,.48+Math.sin(chartAngle)*t*.44];
  const coreIndex=generated.findIndex(v=>v.id===q.id)-CORE_START;if(coreIndex>=0){const angle=coreIndex/10*Math.PI*2;meta[q.id].grekCore=true;meta[q.id].coords=[-64+Math.cos(angle)*28,Math.sin(angle*2)*3,36+Math.sin(angle)*28];meta[q.id].chart=[.49+Math.cos(angle)*.115,.48+Math.sin(angle)*.115];}
 });
 const authoredWorlds=NVGalaxy.worlds;NVGalaxy.worlds=s=>bodyLists[NVGalaxy.system(s)]||authoredWorlds(s);
 const distance=(a,b)=>{if(!meta[a]||!meta[b])return Infinity;if(a===b)return 0;if([a,b].includes('sagittarius-a')&&[a,b].includes('m31-core'))return 50;if((meta[a].galaxy||'milky-way')!==(meta[b].galaxy||'milky-way'))return Infinity;return Math.hypot(...meta[a].coords.map((n,i)=>n-meta[b].coords[i]));};
 function nearby(s){const here=NVGalaxy.system(s);return NVGalaxy.systems.filter(q=>q.id!==here&&distance(here,q.id)<=RANGE).map(q=>({...meta[q.id],distance:distance(here,q.id)})).sort((a,b)=>a.distance-b.distance||a.id.localeCompare(b.id)).slice(0,5);}
 const baseEnsure=NVGalaxy.ensure;
 function ensure(s){const g=baseEnsure(s);g.fuel=Number.isFinite(g.fuel)?Math.max(0,Math.min(CAPACITY,Math.floor(g.fuel))):CAPACITY;if(!Array.isArray(g.scanned))g.scanned=[];if(!Array.isArray(g.log))g.log=[];g.coords=meta[NVGalaxy.system(s)].coords.slice();return g;}
 const norm=s=>s.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase();
 const find=name=>NVGalaxy.systems.find(q=>norm(q.name)===norm(name)||q.id===norm(name)||meta[q.id].aliases?.some(a=>norm(a)===norm(name)));
 function route(from,to){if(!meta[from]||!meta[to])return[];const queue=[[from]],seen=new Set([from]);for(let n=0;n<queue.length;n++){const path=queue[n],last=path.at(-1);if(last===to)return path;for(const q of NVGalaxy.systems)if(!seen.has(q.id)&&distance(last,q.id)<=RANGE){seen.add(q.id);queue.push([...path,q.id]);}}return[];}
 function reason(s,id){const p=s?.space;if(!meta[id])return 'Unknown star system.';const entryBlock=meta[id].entryReason?.(s);if(entryBlock)return entryBlock;if(id===NVGalaxy.system(s))return 'You are already in this system.';if(p?.warp)return 'A warp is already in progress.';if(p?.phase!=='flight')return 'Launch into space before warping.';if(p.hull<=0)return 'Repair your ship before warping.';if(p.autopilot)return 'Disengage guided flight with P before warping.';if(distance(NVGalaxy.system(s),id)>RANGE)return 'Outside the '+RANGE+' LY hyperdrive range. Choose an intermediate system.';if(ensure(s).fuel===0)return 'No Warp Cells. Land and gather resources, then Craft Fuel.';return '';}
 function warp(s,id){if(reason(s,id))return false;const p=s.space,g=ensure(s);g.returns[p.system]={body:p.body,target:p.target,position:p.position.slice(),yaw:p.yaw,pitch:p.pitch};g.fuel--;p.warp={from:p.system,to:id,elapsed:0,duration:8};p.speed=0;p.throttle=0;p.geo=null;p.ecologyOcean=false;record(s,'Space stretches into brilliant filaments. Hyperspace opens toward '+meta[id].name+'. Warp Cells: '+g.fuel+'/'+CAPACITY+'.');return true;}
 function first(id){return id==='sol'?NVSol.byId.earth:id==='janira-proxima'?NVGalaxy.prime:bodyLists[id][0]||anchors[id];}
 function validBody(id,body){const b=NVSol.byId[body];return !!b&&(b.system||'sol')===id&&(!b.stellar||!bodyLists[id]?.length);}
 function arrival(p,id,saved){const b=validBody(id,saved?.body)?NVSol.byId[saved.body]:first(id),target=validBody(id,saved?.target)?saved.target:b.id,r=meta[id].starRadius||62,safe=saved?.position?.length===3&&saved.position.every(Number.isFinite)&&Math.hypot(...saved.position)>r+160;
  p.system=id;p.body=b.id;p.target=target;p.position=safe?saved.position.slice():NVSpace.routeEnd(b);p.yaw=safe?saved.yaw||0:0;p.pitch=safe?saved.pitch||0:0;if(!safe)NVSpace.pointAt(p,b.position);p.phase=p.hull<=0?'disabled':'flight';p.autopilot=false;p.focusReleased=!!b.stellar;p.speed=0;p.throttle=0;p.geo=null;p.ecologyOcean=false;
 }

 function describe(s){const id=NVGalaxy.system(s),q=meta[id],b=NVGalaxy.worlds(s),primary=b.filter(v=>!v.parent);return q.name+' / '+q.spectral+' '+q.colorName+'\nCOORDINATES: '+q.coords.map(v=>v.toFixed(2)).join(', ')+' LY · WARP CELLS '+ensure(s).fuel+'/'+CAPACITY+'\nFrom the cockpit, '+(q.blackHole?(q.galaxy==='andromeda'?'a dark event horizon is framed by a glowing accretion disc. The M31* passage leads back to Sagittarius A* in the Milky Way.':'a dark event horizon is framed by a glowing accretion disc. Carax lies outside the black hole.'):id===START?'four unexplored worlds hang beneath a pale golden star. A silver-ringed giant turns beyond a world with violet clouds.':primary.length?primary.length+' planetary signatures circle a '+q.colorName.toLowerCase()+' star.':'An immense '+q.starClass.toLowerCase()+' fills the cockpit view. No planets orbit this star; keep clear of its heat exclusion zone.')+' '+(q.station?'An orbital station transmits a docking beacon.':'No orbital station beacon is detected.')+'\nEnter View Map to chart your next jump, or Scan System to survey the worlds.';}
 function record(s,text){const g=ensure(s);g.log.push(String(text).slice(0,1400));g.log=g.log.slice(-20);return text;}
 function step(s,dt){const p=s.space,q=p?.warp;if(!q||!Number.isFinite(dt)||dt<=0)return false;q.elapsed=Math.min(8,q.elapsed+dt);p.time+=dt;s.playTime+=dt;if(q.elapsed<8)return true;const g=ensure(s),saved=g.returns[q.to];arrival(p,q.to,saved);p.warp=null;if(!g.visited.includes(p.system))g.visited.push(p.system);g.coords=meta[p.system].coords.slice();NVSpace.notice(p,'WARP COMPLETE / '+meta[p.system].name.toUpperCase()+(p.system==='janira-proxima'?' / FACTION: CHOMPY EMPIRE · OVERLORD OF THE ERISIAN EMPIRE':''));record(s,describe(s));return true;}
 function scan(s){if(s.space?.warp)return 'Scanning is unavailable during warp.';const g=ensure(s),id=NVGalaxy.system(s),b=NVGalaxy.worlds(s),counts={};for(const v of b)counts[v.category]=(counts[v.category]||0)+1;if(!g.scanned.includes(id))g.scanned.push(id);return meta[id].name+' / SYSTEM SCAN\n'+b.filter(v=>!v.parent).length+' primary worlds'+(b.some(v=>v.parent)?' + '+b.filter(v=>v.parent).length+' moons':'')+'\n'+(b.length?Object.entries(counts).map(([k,n])=>n+' × '+k).join(' · '):(meta[id].blackHole?'NO PLANETS / EVENT HORIZON · INTERGALACTIC PASSAGE':'NO PLANETS / STELLAR HEAT EXCLUSION ZONE'))+'\n'+(meta[id].station?'ORBITAL STATION SIGNAL PRESENT':'NO ORBITAL STATION SIGNAL');}
 function canCraft(s){return !s.space?.warp&&ensure(s).fuel<CAPACITY&&((s.inventory?.scrap||0)>=4||((s.eris?.construction?.stock?.metal||0)>=2&&(s.eris?.construction?.stock?.solarCell||0)>=1));}
 function craft(s){const g=ensure(s);if(s.space?.warp)return 'Fuel crafting is unavailable during warp.';if(g.fuel>=CAPACITY)return 'Hyperdrive Fuel is already 5/5.';if(!canCraft(s))return 'Craft Fuel needs 4 scrap, or 2 metal + 1 solar cell. Gather salvage or harvest minerals on a planet.';if((s.inventory?.scrap||0)>=4)s.inventory.scrap-=4;else{s.eris.construction.stock.metal-=2;s.eris.construction.stock.solarCell--;}g.fuel++;return 'Crafted 1 Warp Cell. Hyperdrive Fuel: '+g.fuel+'/'+CAPACITY+'. Manual save to keep your supplies and fuel.';}
 function command(s,input){const text=String(input).trim(),key=norm(text);let response,type='message';if(key==='view map'){type='map';response=nearby(s).map(q=>q.name+' / '+q.spectral+' '+q.colorName+' / '+q.distance.toFixed(1)+' LY / '+q.economy+' // '+q.wealth+' / CONFLICT '+q.conflict).join('\n');}else if(key==='scan system'){type='scan';response=scan(s);}else if(key==='craft fuel'){type='fuel';response=craft(s);}else if(/^warp to\s+/i.test(text)){const target=find(text.replace(/^warp to\s+/i,''));response=target?reason(s,target.id):'Unknown system. Use View Map for nearby destinations.';if(target&&!response){warp(s,target.id);return{type:'warp',ok:true,text:ensure(s).log.at(-1)};}}else response='Commands: View Map · Warp to [System Name] · Scan System · Craft Fuel.';record(s,response);return{type,ok:type!=='message',text:response};}
 function restore(p,raw){let id=meta[raw?.system]?raw.system:NVSol.byId[p.body]?.system||'sol';if(!meta[id])id='sol';p.system=id;if(!validBody(id,p.body)||bodyLists[id]&&(!validBody(id,raw?.body)||Math.hypot(...p.position)<(meta[id].starRadius||62)+160)){arrival(p,id,null);}if(!validBody(id,p.target))p.target=p.body;if(NVSol.byId[p.body].stellar){p.phase=p.hull<=0?'disabled':'flight';p.autopilot=false;p.focusReleased=true;p.geo=null;p.ecologyOcean=false;}const r=raw?.galaxy||{},returns={};for(const key of Object.keys(meta)){const v=r.returns?.[key];if(v&&NVSol.byId[v.body]&&NVSol.byId[v.target]&&(NVSol.byId[v.body].system||'sol')===key&&(NVSol.byId[v.target].system||'sol')===key&&v.position?.length===3&&v.position.every(n=>Number.isFinite(n)&&Math.abs(n)<2e6))returns[key]={body:v.body,target:v.target,position:v.position.slice(),yaw:Number(v.yaw)||0,pitch:Number(v.pitch)||0};}p.galaxy={visited:[...new Set([...(Array.isArray(r.visited)?r.visited.filter(v=>meta[v]):[]),id])],returns,metFigure:r.metFigure===true,expedition:r.expedition===true,fuel:Number.isFinite(r.fuel)?Math.max(0,Math.min(5,Math.floor(r.fuel))):5,scanned:Array.isArray(r.scanned)?[...new Set(r.scanned.filter(v=>meta[v]))]:[],log:Array.isArray(r.log)?r.log.filter(v=>typeof v==='string').map(v=>v.slice(0,1400)).slice(-20):[],coords:meta[id].coords.slice()};const q=raw?.warp;p.warp=null;if(q&&p.phase==='flight'&&q.from===id&&meta[q.to]&&q.to!==id&&distance(id,q.to)<=RANGE&&Number.isFinite(q.elapsed))p.warp={from:id,to:q.to,elapsed:Math.max(0,Math.min(8,q.elapsed)),duration:8};return p;}
 NVGalaxy.ensure=ensure;NVGalaxy.canWarp=(s,id)=>!reason(s,id);NVGalaxy.warp=warp;NVGalaxy.step=step;NVGalaxy.restore=restore;
 const recover=NVSpace.recover;NVSpace.recover=s=>{const id=NVGalaxy.system(s);if(!bodyLists[id])return recover(s);const p=s.space;if(p.phase!=='disabled')return false;p.hull=35;arrival(p,id,null);NVSpace.notice(p,'EMERGENCY TOW / '+meta[id].name.toUpperCase()+' SAFE SPACE');return true;};
 return{SEED,RANGE,CAPACITY,START,CORE_START,EXTRA_COUNT,namedStars,route,generated,meta,bodyLists,anchors,nearby,distance,ensure,find,reason,first,describe,scan,canCraft,craft,command,record};
})();
