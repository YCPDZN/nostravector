const VISHARA_PARTS=__VISHARA_PARTS__;
function attendantPart(q){
  const {mat,...part}=q;
  const palette={hair:[.94,.95,.97],skin:[.85,.70,.60],white:[.95,.95,.94],black:[.025,.027,.035],iris:[.44,.59,.67],ear_inner:[.67,.45,.39]};
  return {...part,c:mat?(palette[mat]||q.c):(q.name==='Coat zip'?[.27,.29,.32]:[.025,.028,.038])};
}
function createErisScenery({M,draw,object,character,mesh,sphere,ground,facePart}){
  const courtLip=kind=>typeof erisLipPose==='function'?erisLipPose(kind):{jaw:0,width:1,round:0,teeth:0};
  const family=Object.fromEntries(['nyrexia','alexia'].map(kind=>[kind,VISHARA_PARTS.filter(q=>!/Crown circlet|Crown sapphire|Sceptre/i.test(q.name)).map(q=>mesh(typeof erisFamilyPart==='function'?erisFamilyPart(q,kind):q))]));
  const queen=VISHARA_PARTS.map(mesh),aide=JAMES_PARTS.filter(q=>!q.name.includes('quilt')&&!q.name.includes('Quilt')).map(q=>mesh(attendantPart(q))),ivory=[.84,.89,.94],silver=[.49,.61,.73],dark=[.075,.12,.22],ice=[.32,.72,.85],gold=[.73,.66,.47];
  const oval=(x,y,z,a,b,c,col,e=0)=>draw(sphere,M.mul(M.t(x,y,z),M.scale(a,b,c)),col,0,e);
  function royalShip(x,y,z,time,yaw=0){const root=M.mul(M.t(x,y,z),M.ry(yaw)),part=(x,y,z,a,b,c,col,e=0)=>draw(sphere,M.mul(root,M.mul(M.t(x,y,z),M.scale(a,b,c))),col,0,e);part(0,1,0,2.1,.65,5.8,ivory);part(0,1.45,-2,1.1,.38,1.6,dark);for(const side of [-1,1]){part(side*3.4,.7,1,3.0,.18,2.4,silver);part(side*2.0,.9,4,.55,.55,1.7,dark);part(side*2,.9,5.5,.37,.37,.14,ice,.9);part(side*3.6,.95,1,2.5,.045,.20,ice,.55);}part(0,1.05,5,.18,1.3,1.3,ivory);}
  function citadel(time){const x=0,z=70,y=0;
    // The court terrace, continuous access stair and separate royal launchpad.
    object(0,15.35,65,26,.3,14,ivory);
    for(let i=0;i<56;i++){const zz=30+(i+.5)*.5,top=15.5*(i+1)/56;object(0,top/2,zz,8,top,.5,ivory);for(const side of [-1,1])object(side*4,top+.5,zz,.16,1,.5,silver);}
    object(-22.5,15.35,64,19,.3,5,silver);
    object(-44,15.25,64,24,.5,24,dark);oval(-44,15.53,64,10,.025,10,ivory);oval(-44,15.56,64,8,.028,8,dark);
    for(const side of [-1,1]){object(-44+side*9,7.6,64,1,15.2,18,silver);object(-44+side*11.6,16.15,64,.15,1.2,23,silver);object(-22.5,16.05,64+side*2.4,19,1,.15,silver);}
    for(let i=0;i<16;i++){const a=i/16*Math.PI*2;oval(-44+Math.cos(a)*9,15.62,64+Math.sin(a)*9,.18,.08,.18,ice,.7);}
    object(x,y-.20,z,68,.4,70,dark);object(x,y-.04,z,64,.10,66,silver);object(x,y+.02,z-20,29,.08,23,ivory);
    // Open ceremonial forecourt; the architecture rises behind the queen.
    for(const side of [-1,1]){object(side*20,5,z+3,12,10,30,ivory);object(side*20,10.15,z+3,13,.3,31,silver);for(let k=0;k<6;k++){const wz=z-9+k*4.8;object(side*20,7.5,wz,12.12,.10,.15,gold);object(side*26.1,6,wz,.12,4,1.8,dark);object(side*26.18,6,wz,.08,3.5,1.4,ice,0,.25);}for(const zz of [z-14,z+21]){const xx=side*27;object(xx,9,zz,7,18,7,ivory);object(xx,18,zz,8,.5,8,silver);oval(xx,20,zz,4,3.5,4,silver);object(xx,25,zz,1.4,8,1.4,ice,0,.30);object(xx,30,zz,.3,3,.3,gold);for(const sy of [4,9,14]){object(xx,sy,zz-3.55,1.8,3,.1,dark);object(xx,sy,zz-3.62,1.4,2.5,.08,ice,0,.35);}}}
    object(0,7.5,z+10,25,15,24,ivory);object(0,15.2,z+10,27,.5,26,silver);oval(0,17.2,z+10,10,6,10,silver);oval(0,17.8,z+10,8.8,5.6,8.8,ice,.1);object(0,26,z+10,.6,7,.6,gold);oval(0,30,z+10,.8,1.4,.8,ice,.5);
    // Entrance arch, illuminated ribs and slender paired columns.
    object(0,4.5,z-2.2,7,9,.22,dark);for(const side of [-1,1]){object(side*4.8,5,z-3,.75,10,.75,silver);object(side*6.3,5,z-3,.42,10,.42,gold);object(side*4.8,.4,z-3,1.4,.8,1.4,ivory);object(side*4.8,10.2,z-3,1.4,.5,1.4,ivory);}
    for(let k=0;k<13;k++){const a=k/12*Math.PI;oval(Math.cos(a)*4.8,9+Math.sin(a)*3.8,z-3,.40,.42,.45,silver);oval(Math.cos(a)*3.4,7.3+Math.sin(a)*3.0,z-2.38,.14,.15,.10,ice,.6);}object(0,3.5,z-2.45,.18,7,.08,gold);
    for(let k=0;k<8;k++){const zz=z-18+k*2.0;for(const side of [-1,1]){object(side*9,.1,zz,.18,.15,1.4,gold);object(side*11,1.3,zz,.4,2.6,.4,silver);oval(side*11,2.9,zz,.30,.45,.30,ice,.7);}}
    for(const side of [-1,1])for(let k=0;k<4;k++){const xx=side*(12+k*3),zz=z-27;object(xx,1.5,zz,.16,3,.16,silver);oval(xx,3.2,zz,.14,.3,.14,ice,.5);}
    // Orbit sculpture: crystal satellites around a small stylised Eris.
    oval(-12,3.0,z-23,1.4,1.4,1.4,ivory);oval(-12+Math.sin(time*.13)*2.7,3.5,z-23+Math.cos(time*.13)*2.7,.40,.40,.40,ice,.25);
  }
  return(s,time)=>{if(typeof NVEris==='undefined')return;
    if(typeof NVErisFamily!=='undefined')for(const n of NVErisFamily.npcs(s)){if(n.kind==='nyrexia'&&s.eris?.nyrexia?.recruited&&typeof NVCompanionCombat!=='undefined')continue;if(Math.hypot(n.x-s.x,n.z-s.z)>280)continue;const moving=n.speed>.1,base=M.mul(M.t(n.x,ground(n.x,n.z,s.seed)+(moving?.025*Math.abs(Math.sin(n.phase)):0),n.z),(n.aftermath?M.mul(M.ry(n.yaw+Math.sin(time*9)*.018),M.rx(.05+Math.sin(time*2)*.02)):M.ry(n.yaw))),lip=courtLip(n.kind),motion=NVCompanionMotion.pose(family[n.kind],n.kind,time,n.speed||0,n.phase);for(const q of family[n.kind]){let model=M.mul(base,NVCompanionMotion.part(motion,q));if(facePart)facePart(q,q.name==='Mouth neutral'?M.mul(model,M.scale(.88,1,1)):model,lip);else draw(q,model,q.c);}}
    if(s.space?.ecologyOcean)return;const id=NVEris.world(s),e=NVEris.ensure(s),r=NVEris.route(s),npc=NVEris.npc(s);
    if(id==='eris'&&Math.hypot(s.x,s.z-70)<620)citadel(time);
    if(npc&&Math.hypot(npc.x-s.x,npc.z-s.z)<280){const flee=npc.speed>0,phase=npc.time*13,base=M.mul(M.t(npc.x,ground(npc.x,npc.z,s.seed)+(flee?.06*Math.abs(Math.sin(phase)):0),npc.z),M.mul(M.ry(npc.yaw),M.rx(flee?.20:0))),lip=courtLip(npc.kind);for(const q of queen){let model=base;if(flee&&q.name==='Silver slipper'){const stride=Math.sin(phase+(q.p[0][0]>0?0:Math.PI));model=M.mul(base,M.t(0,Math.max(0,stride)*.15,stride*.22));}if(flee&&q.name==='Trailing winter mantle')model=M.mul(base,M.rx(Math.sin(phase)*.035));if(facePart)facePart(q,q.name==='Mouth neutral'?M.mul(model,M.scale(.88,1,1)):model,lip);else draw(q,model,q.c);}}
    const assistant=NVEris.assistant(s);if(assistant&&Math.hypot(assistant.x-s.x,assistant.z-s.z)<260)character(assistant,aide,0,0,s.seed,true,0,courtLip('assistant'));
    const earth=NVEris.polarSite(s),site=id==='eris'?{x:-44,z:64}:earth?{x:NVEris.EARTH.x+16,z:NVEris.EARTH.z+15}:null;
    if(site&&Math.hypot(site.x-s.x,site.z-s.z)<500){let visible=false,lift=0;if(NVEris.sandbox(s)&&!r.exiled){visible=r.at===id;if(r.from===id){visible=true;lift=r.fraction*240;}if(r.to===id){visible=true;lift=(1-r.fraction)*240;}}else if(earth&&e.cameo.seen&&!e.cameo.done){visible=true;lift=e.cameo.boarded?Math.max(0,e.cameo.time-1.5)*26:0;}if(visible)royalShip(site.x,ground(site.x,site.z,s.seed)+1+lift,site.z,time);}
    for(const savedBase of e.bases){if(NVEris.faction(s,savedBase.body)!=='CUSTOM')continue;const colony=savedBase.capturedFromBase&&NVGovernance.ensure(s).colonies[savedBase.body],b=colony?{...savedBase,...NVGovernance.location(s,colony)}:savedBase;if(b.body!==id||Math.hypot(b.x-s.x,b.z-s.z)>350)continue;const y=ground(b.x,b.z,s.seed);object(b.x,y+.04,b.z,12,.08,12,silver);for(const side of [-1,1]){object(b.x+side*4,y+1.7,b.z,.15,3.4,8,ivory);object(b.x+side*2.8,y+1.7,b.z-4,2.4,3.4,.16,ivory);}object(b.x,y+1.7,b.z+4,8,3.4,.16,ivory);object(b.x,y+3.5,b.z,8.5,.25,8.5,dark);object(b.x,y+3.67,b.z,8,.05,.18,ice,0,.6);object(b.x,y+1.8,b.z+3.8,2,1,.12,ice,0,.5);}
  };
}
