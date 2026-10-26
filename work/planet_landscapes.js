// Deterministic imagined landing regions. Orbit appearances keep the existing NASA maps.
const NVLandscapes=(()=>{
  const A=NVAntarctica,clamp=A.clamp,profiles={};
  const add=(id,title,kind,height,scale,accent,feature)=>profiles[id]={id,title,kind,height,scale,accent,feature};
  add('mercury','CALORIS ESCARPMENTS','craters',48,210,[.66,.60,.48],'crater');
  add('venus','EMBER CROWN VOLCANIC RANGE','volcano',94,185,[.93,.34,.08],'volcano');
  add('earth','AFRICAN DUNE SEA','dunes',30,220,[.81,.65,.33],'dune');
  add('mars','RED CANYON HIGHLANDS','canyon',78,245,[.83,.43,.23],'mesa');
  add('moon','SILVER MARE HIGHLANDS','craters',35,280,[.72,.73,.73],'crater');
  add('phobos','STICKNEY RUBBLE BASIN','rubble',28,110,[.50,.42,.32],'boulder');
  add('deimos','DUST VEIL RIDGES','dunes',19,155,[.69,.59,.46],'boulder');
  add('ceres','SALT CROWN BASINS','craters',39,175,[.92,.92,.81],'salt');
  add('io','SULFUR FIRE CALDERAS','volcano',68,150,[1,.32,.035],'volcano');
  add('europa','RUSTLINE ICE FRACTURES','fractures',17,180,[.47,.24,.15],'ice');
  add('callisto','ANCIENT IMPACT WILDERNESS','craters',53,145,[.77,.79,.73],'crater');
  add('ganymede','FROST GROOVE MOUNTAINS','ridge',72,230,[.69,.77,.82],'ice');
  add('titan','AMBER DUNES AND METHANE LAKES','dunes',32,190,[.13,.15,.12],'lake');
  add('enceladus','TIGER STRIPE GEYSER FIELDS','fractures',23,155,[.45,.73,.80],'geyser');
  add('miranda','BROKEN CORONA CLIFFS','canyon',90,135,[.82,.84,.86],'ice');
  add('ariel','BRIGHT RIFT VALLEYS','fractures',42,160,[.85,.88,.89],'ice');
  add('umbriel','SHADOW CRATER HIGHLANDS','craters',43,205,[.55,.57,.62],'crater');
  add('titania','SILVER FAULT MOUNTAINS','ridge',67,270,[.77,.75,.73],'ice');
  add('oberon','RUST CAPPED IMPACT PEAKS','craters',59,235,[.65,.43,.31],'crater');
  add('triton','NITROGEN FROST GEYSER PLAINS','frost',26,235,[.86,.72,.76],'geyser');
  add('pluto','HEARTLAND GLACIER MOUNTAINS','glacier',86,265,[.89,.90,.85],'ice');
  add('charon','RIFT STATION HIGHLANDS','canyon',52,220,[.76,.67,.61],'ice');
  add('styx','SHATTERED ICE SPURS','rubble',23,98,[.74,.80,.87],'ice');
  add('nix','PALE RUBBLE FIELDS','rubble',30,130,[.86,.84,.78],'boulder');
  add('kerberos','TWIN RIDGE ICE FIELDS','ridge',31,165,[.64,.70,.79],'ice');
  add('hydra','BRIGHT FROST DUNES','frost',37,195,[.93,.95,.93],'ice');
  add('haumea','SPUN ICE MOUNTAIN CHAINS','ridge',75,180,[.84,.92,.94],'ice');
  add('makemake','COPPER FROST PLATEAUS','glacier',49,230,[.81,.55,.33],'ice');
  add('eris','WHITE SILENCE GLACIERS','glacier',62,310,[.91,.96,1],'ice');
  add('dysnomia','ASHEN CROWN CRATERFIELDS','craters',44,195,[.59,.64,.74],'crater');
  add('sedna','CRIMSON FROZEN BADLANDS','canyon',64,190,[.76,.34,.22],'boulder');
  add('jupiter','GREAT RED STORM OBSERVATORY','cloud',0,185,[.89,.36,.18],'storm');
  add('saturn','GOLDEN RING CLOUD HAVEN','cloud',0,265,[.92,.81,.52],'ring');
  add('uranus','CYAN AURORA CLOUD DECK','cloud',0,345,[.48,.94,.91],'aurora');
  add('neptune','AZURE TEMPEST PLATFORM','cloud',0,130,[.28,.52,.94],'storm');
  // Small Neptunian moons have individual seeded forms and local survey names.
  for(const b of NVSol.worlds)if(!profiles[b.id]){const n=A.seedFromId(b.id),k=['rubble','craters','ridge','frost'][n%4];add(b.id,b.name.toUpperCase()+' / '+['SPLINTER FIELDS','IMPACT HIGHLANDS','KNIFE RIDGES','FROST BASINS'][n%4],k,20+n%45,100+n%190,b.color.map(v=>clamp(v+.16,0,1)),k==='frost'?'ice':k==='craters'?'crater':'boulder');}
  for(const p of Object.values(profiles)){p.code={craters:1,rubble:2,dunes:3,canyon:4,volcano:5,fractures:6,ridge:7,frost:8,glacier:9,cloud:10}[p.kind];p.angle=(A.seedFromId(p.id)%628)/100;}
  const profile=id=>profiles[id]||profiles.moon;
  const landmarkCache=new Map();
  function landmarks(seed,id){const key=seed+':'+id;if(landmarkCache.has(key))return landmarkCache.get(key);const p=profile(id),n=seed+A.seedFromId(id),list=Array.from({length:6},(_,i)=>({x:i===0?70:(A.hash(i,41,n)-.5)*920,z:i===0?145:70+A.hash(i,42,n)*760,r:24+A.hash(i,43,n)*35,h:p.height*(.65+A.hash(i,44,n)*.65),type:p.feature,label:(i===0?p.title.split(' ').slice(0,2).join(' '):p.feature.toUpperCase())}));if(landmarkCache.size>100)landmarkCache.clear();landmarkCache.set(key,list);return list;}
  function rawHeight(x,z,seed,id){const p=profile(id);if(p.kind==='cloud')return 0;const n=seed+A.seedFromId(id),c=Math.cos(p.angle),s=Math.sin(p.angle),u=x*c+z*s,v=z*c-x*s,S=p.scale,N=(x,z,k=0)=>A.noise(x,z,n+k),base=N(x/S,z/S)*p.height*.19,grain=N(x/18,z/18,2)*1.3;let h=base;
    if(p.kind==='ridge'||p.kind==='glacier'){const ridge=1-Math.abs(N(u/S,v/(S*.43),3));h+=Math.pow(ridge,3)*p.height;h+=N(x/70,z/70,4)*8;if(p.kind==='glacier')h-=p.height*.6*Math.exp(-Math.pow((v-Math.sin(u/150)*38)/65,2));}
    if(p.kind==='canyon'){const channel=v-Math.sin(u/170)*50;h+=p.height*(.5+.30*Math.tanh((N(x/S,z/S,3)-.5)*7));h-=p.height*.85*Math.exp(-Math.pow(channel/40,2));h+=Math.sin(h*.8)*.7;}
    if(p.kind==='dunes'){h+=Math.pow(.5+.5*Math.sin(u/22+N(x/130,z/130,3)*3),2)*p.height*.65;h+=N(x/350,z/350,4)*p.height*.6;}
    if(p.kind==='fractures'){h+=Math.sin(u/70)*p.height*.2;for(const offset of [-115,80,240])h-=p.height*.45*Math.exp(-Math.pow((v-offset-Math.sin(u/120)*15)/5,2));}
    if(p.kind==='frost')h+=N(x/80,z/80,3)*p.height*.35+Math.pow(.5+.5*Math.sin(u/45+v/130),4)*p.height*.3;
    if(p.kind==='rubble')h+=Math.abs(N(x/35,z/35,3)-.5)*p.height*1.1+N(x/140,z/140,4)*p.height*.7;
    if(p.kind==='craters'){const gx=Math.floor(x/S),gz=Math.floor(z/S);for(let a=gx-1;a<=gx+1;a++)for(let b=gz-1;b<=gz+1;b++){const px=(a+A.hash(a,b,n+5))*S,pz=(b+A.hash(a,b,n+6))*S,r=S*(.16+A.hash(a,b,n+7)*.2),t=Math.hypot(x-px,z-pz)/r;if(t<1.8)h+=p.height*(-.40*Math.exp(-t*t*3)+.25*Math.exp(-Math.pow((t-1)*5,2)));}}
    if(p.kind==='volcano'){h+=N(x/80,z/80,3)*8;for(const f of landmarks(seed,id)){const d=Math.hypot(x-f.x,z-f.z),r=f.r*2.3;h+=f.h*Math.max(0,1-d/r)**1.4-f.h*.43*Math.exp(-Math.pow(d/(f.r*.33),2));}}
    const citadel=id==='eris'?clamp(Math.max(Math.abs(x)-60,Math.abs(z-65)-41)/24,0,1):1;return (h+grain)*citadel;
  }
  function height(x,z,seed,id){if(id==='earth')return NVAfrica.height(x,z,seed);const flat=clamp((Math.hypot(x,z)-24)/34,0,1),station=id==='charon'?clamp(Math.max(Math.abs(x-24)-12,Math.abs(z-25)-16)/15,0,1):1;return flat&&station?rawHeight(x,z,seed,id)*flat*station:0;}
  function props(cx,cz,seed,id){if(NVSol.byId[id].giant)return[];const p=profile(id),n=seed+A.seedFromId(id),out=[];for(let i=0;i<8;i++){const x=(cx+A.hash(cx+i,cz,n+8))*128,z=(cz+A.hash(cx,cz+i,n+9))*128;if((id==='eris'&&Math.abs(x)<62&&Math.abs(z-65)<43)||Math.hypot(x,z)<27||(id==='charon'&&Math.abs(x-24)<15&&Math.abs(z-25)<20))continue;out.push({x,z,y:height(x,z,seed,id),r:.7+A.hash(cx+i,cz,n+10)*3,type:p.feature==='ice'?'ice-spire':p.feature==='salt'?'salt':'rock'});}return out;}
  function mapColor(id,h,slope,x,z){const b=NVSol.byId[id],p=profile(id),base=b.terrain||b.color,t=clamp(.28+h/(Math.max(20,p.height)*1.6),0,1);let col=base.map((v,i)=>clamp(v*(.50+t*.7)+p.accent[i]*Math.min(.30,slope*.015),0,1));if(p.kind==='fractures'&&slope>2)col=p.accent;if(p.kind==='glacier'&&h<10)col=p.accent;if(p.kind==='dunes'&&p.feature==='lake'&&Math.sin(x/100)*Math.cos(z/90)>.8)col=p.accent;return col;}
  function material(id){const b=NVSol.byId[id],p=profile(id),n=A.seedFromId(id);return{ice:['fractures','glacier','frost'].includes(p.kind)?.96:b.style==='ice'?.74:.08,scale:.09+n%8*.007,shift:(n%997)/31};}
  return{material,profiles,profile,height,rawHeight,props,landmarks,mapColor};
})();
