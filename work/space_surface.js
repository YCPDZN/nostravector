function createSolScenery({A,M,cube,rock,sphere,draw,object,character,mesh}){
  const replacementBaseDraw=createReplacementBaseDraw({object});
  const charonRobotDraw=createCharonRobotDraw({mesh,M,draw});
  const rewardShipDraw=typeof createRewardShipDraw==='function'?createRewardShipDraw({mesh,M,draw}):null;
  const capitalShipDraw=createCapitalShipDraw({mesh,M,draw});
  const crew=orionSpaceParts().map(mesh),steel=[.14,.22,.28],white=[.76,.82,.83],cyan=[.23,.83,.94];
  function oval(x,y,z,sx,sy,sz,color,e=0){draw(sphere,M.mul(M.t(x,y,z),M.scale(sx,sy,sz)),color,0,e);}
  return(s,time,anim)=>{if(typeof NVEcology!=='undefined'&&NVEcology.ocean(s)){if(s.space.crew&&(typeof NVGovernance==='undefined'||NVGovernance.follows(s,'orion')))character(s.friend,crew,anim.jamesPhase,anim.jamesSpeed,s.seed,true,0,{jaw:0,width:1,round:0,teeth:0});return;}const p=s.space,b=NVSol.byId[p.body],sx=p.landingX,sz=p.landingZ,ground=(x,z)=>p.geo?.global?NVWorldFlight.ground(s,x,z):NVSpace.surfaceHeight(x,z,s.seed,b.id),y=ground(sx,sz);
    replacementBaseDraw(s,time,ground);
    if(b.id==='charon'){const r=NVCharonStation.robot(s);if(Math.hypot(r.x-s.x,r.z-s.z)<1200)charonRobotDraw(s,r.x,ground(r.x,r.z),r.z,time);}
    if(b.giant||(p.geo?.global&&NVWorldFlight.region(s).id==='ocean')){object(sx,y-.35,sz+6,100,.6,102,steel);for(const x of [-49,49]){object(sx+x,y+1.1,sz+6,.15,2,100,cyan,0,.3);for(let z=-40;z<55;z+=10)object(sx+x,y+1.1,sz+z,.6,2,.6,white);}for(const z of [-43,56])object(sx,y+1.1,sz+z,99,2,.2,white);for(let x=-35;x<=35;x+=10)object(sx+x,y-.02,sz+5,.14,.04,95,[.47,.54,.58]);for(let i=0;i<28;i++){const a=i/28*6.28,r=85+i%5*20;oval(sx+Math.cos(a)*r,y-8-Math.sin(time*.1+i)*4,sz+Math.sin(a)*r,22,5,17,b.color);}}
    object(sx,y+.06,sz,p.shipId==='olympus-vanguard'?36:23,.12,p.shipId==='olympus-vanguard'?52:27,steel);for(const x of [-10,10])for(const z of [-12,12])object(sx+x,y+.23,sz+z,.5,.12,.5,cyan,0,.9);
    if(p.shipId==='grek-horizon'){capitalShipDraw(s,sx,y+12,sz,time);const e=NVCapital.entry(s),h=ground(e.x,e.z);object(e.x,h+.08,e.z,7,.16,8,steel);for(const dz of [-4,4])object(e.x,h+.2,e.z+dz,7,.15,.15,cyan,0,.8);object(e.x-3,h+1.5,e.z,.16,3,.16,cyan,0,.8);}else if(p.shipId==='olympus-vanguard'&&rewardShipDraw)rewardShipDraw(s,sx,y+.1,sz,time);else{oval(sx,y+3.1,sz,2.5,1.35,6.5,white);oval(sx,y+4,sz-2.3,1.55,.7,2.6,[.06,.22,.31]);
    for(const side of [-1,1]){object(sx+side*4.5,y+2.8,sz+1,7,.26,5.5,white,side*.28);object(sx+side*2.1,y+2.75,sz+4.2,1.15,1.1,3.2,steel);oval(sx+side*2.1,y+2.75,sz+5.85,.43,.43,.1,cyan,.8);for(const z of [-3.8,3.8]){object(sx+side*1.5,y+1.2,sz+z,.15,2.4,.15,steel);object(sx+side*1.5,y+.12,sz+z,.9,.2,1.2,steel);}object(sx+side*4.9,y+2.94,sz,4.6,.08,.22,cyan,side*.28,.7);}
    object(sx,y+4.2,sz+4.7,.2,2.4,2.3,white);object(sx,y+1.5,sz-6.8,1.8,.15,2.3,steel);}
    if(p.crew&&typeof NVCompanionCombat==='undefined'&&(typeof NVGovernance==='undefined'||NVGovernance.follows(s,'orion')))character(s.friend,crew,anim.jamesPhase,anim.jamesSpeed,s.seed,true,0,{jaw:0,width:1,round:0,teeth:0});
    const profile=NVLandscapes.profile(b.id);
    if(!b.giant)for(const f of NVLandscapes.landmarks(s.seed,b.id)){if(Math.hypot(f.x-s.x,f.z-s.z)>420)continue;const h=ground(f.x,f.z),col=profile.accent;
      if(f.type==='volcano'){oval(f.x,h+.15,f.z,f.r*.28,.22,f.r*.28,col,.85);for(let k=0;k<5;k++){const rise=(time*5+k*10)%54;oval(f.x+Math.sin(time*.4+k)*rise*.14,h+3+rise,f.z,2+rise*.14,3+rise*.11,2+rise*.14,b.id==='io'?[.55,.27,.11]:[.38,.32,.24]);}}
      if(f.type==='geyser')for(let k=0;k<5;k++){const rise=(time*4+k*8)%40;oval(f.x+rise*.09,h+rise,f.z,1+rise*.04,3,1+rise*.04,[.40,.44,.47]);}
      if(f.type==='ice')for(let k=0;k<5;k++)object(f.x+k*4,h+4+k%3*2,f.z+Math.sin(k)*6,3,8+k%3*4,2.5,col,k*.25,.08,rock);
      if(f.type==='salt')oval(f.x,h+.08,f.z,f.r,.15,f.r*.65,col);
      if(f.type==='lake')oval(f.x,h+.05,f.z,f.r,.06,f.r*.7,col);
      if(f.type==='mesa')object(f.x,h+6,f.z,13,12,11,col,0,0,rock);
    }
    if(b.id==='io'){for(let i=0;i<7;i++){const x=Math.sin(i*4)*180,z=70+i*45,h=ground(x,z);oval(x,h+2,z,12,3,12,[.19,.12,.045]);oval(x,h+4,z,6,.2,6,[1,.27,.015],.85);for(let n=0;n<4;n++)oval(x+Math.sin(time+n)*2,h+8+(time*3+n*6)%24,z,1.6,2.3,1.6,[.88,.34,.04],.6);}}
    if(b.id==='europa'){for(let i=0;i<10;i++){const x=-210+i*42,z=90+Math.sin(i)*60;object(x,ground(x,z)+.08,z,40,.15,.8,[.39,.24,.16],.2);}}
    if(b.id==='titan'){for(let i=0;i<3;i++){const x=90+i*95,z=60+i*70;oval(x,ground(x,z)+.04,z,40,.035,27,[.13,.12,.08]);}}
    if(b.station&&Math.hypot(s.x-NVCharonStation.local(s).x,s.z-NVCharonStation.local(s).z)<1200){const {x,z}=NVCharonStation.local(s),h=ground(x,z);object(x,h+.3,z,19,.6,20,steel);object(x-7.9,h+3,z+4,.2,5.4,11,white);object(x+7.9,h+3,z+4,.2,5.4,11,white);object(x,h+3,z+9.4,16,5.4,.2,white);for(const a of [-4.6,4.6])object(x+a,h+3,z-1.6,6.8,5.4,.2,white);object(x,h+5.9,z+4,17,.5,12,steel);if(!p.stationVisited)object(x,h+2,z-1.6,2.4,3.4,.15,[.77,.40,.16],0,.4);object(x,h+.16,z-5,3,.3,7,[.43,.51,.55]);for(const a of [-5,5])object(x+a,h+3.1,z-1.75,3,1.3,.16,[.075,.29,.39],0,.3);object(x+6,h+9,z+5,.1,9,.1,steel);oval(x+6,h+12,z+5,2,.2,2,white);for(const a of [-9,9])object(x+a,h+1,z-6,.15,2,.15,cyan,0,.8);if(p.stationVisited){object(x,h+.7,z-5,3,.08,7,cyan,0,.4);object(x,h+1.5,z+5,4,.9,1.4,[.17,.39,.46]);object(x,h+2.4,z+5.5,4,1.1,.1,cyan,0,.6);}}
  };
}
