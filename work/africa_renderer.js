const AFRICA_SAND='data:image/jpeg;base64,__AFRICA_SAND__';
const ORION_PARTS=__ORION_PARTS__;
// Separate Imperial finish: keep the original companion mesh, face and animation rig intact.
const ORION_IMPERIAL_PARTS=ORION_PARTS.map(p=>{
 const name=p.name||'';
 const color=/reactor vent|chest amber insignia/i.test(name)?[.08,.72,.8]:/dark rim|rivet|clasp/i.test(name)?[.10,.13,.16]:/cape russet lining/i.test(name)?[.025,.07,.08]:/puffer|collar|pants|upperArm|lowerArm|thigh|shin|foot|armour|plate|spike|torn cape|utility pouch/i.test(name)?[.025,.032,.042]:null;
 return color?{...p,c:color,color}:p;
});
function orionSpaceParts(list=ORION_PARTS){return list;}
function createAfricaScenery({A,M,cube,rock,sphere,draw,object,character,mesh}){
 const rewardShipDraw=typeof createRewardShipDraw==='function'?createRewardShipDraw({mesh,M,draw}):null;
  const friendParts=ORION_PARTS.map(mesh);
  function oval(x,y,z,sx,sy,sz,color,emission=0){draw(sphere,M.mul(M.t(x,y,z),M.scale(sx,sy,sz)),color,0,emission);}
  function tree(p){object(p.x,p.y+2.1*p.r,p.z,.20*p.r,4.2*p.r,.20*p.r,[.32,.22,.13]);oval(p.x,p.y+4.4*p.r,p.z,2.5*p.r,.7*p.r,2*p.r,[.23,.35,.17]);oval(p.x+.8*p.r,p.y+4.9*p.r,p.z,1.5*p.r,.5*p.r,1.7*p.r,[.28,.39,.18]);}
  function scenery(s,time,animation){
    const F=NVAfrica,ship=F.SHIP,shipY=F.height(ship.x,ship.z,s.seed),camp=F.CAMP,cy=F.height(camp.x,camp.z,s.seed),white=[.78,.83,.80],steel=[.16,.25,.28],cyan=[.31,.88,.92];
    draw(cube,M.mul(M.t(s.x,-.04,-1045),M.scale(3000,.08,2000)),[.035,.16,.24],2,.08);
    // The ship is a real 3D hull, cockpit, wings, engines and landing gear.
    if(s.space?.shipId==='olympus-vanguard'){if(rewardShipDraw&&s.space.body==='earth'&&['landed','cockpit'].includes(s.space.phase))rewardShipDraw(s,s.space.landingX,F.height(s.space.landingX,s.space.landingZ,s.seed),s.space.landingZ,time);}else{object(ship.x,shipY+.05,ship.z,24,.1,28,[.25,.30,.26]);
    for(const x of [-10,10])for(const z of [-12,12])object(ship.x+x,shipY+.20,ship.z+z,.45,.10,.45,cyan,0,.8);
    oval(ship.x,shipY+3.1,ship.z,2.5,1.35,6.5,white);
    oval(ship.x,shipY+4,ship.z-2.3,1.55,.7,2.6,[.08,.25,.34]);
    for(const side of [-1,1]){
      object(ship.x+side*4.5,shipY+2.8,ship.z+1,7,.26,5.5,white,side*.28);
      object(ship.x+side*2.1,shipY+2.75,ship.z+4.2,1.15,1.1,3.2,steel);
      oval(ship.x+side*2.1,shipY+2.75,ship.z+5.85,.43,.43,.1,cyan,.8);
      for(const z of [-3.8,3.8]){object(ship.x+side*1.5,shipY+1.2,ship.z+z,.15,2.4,.15,steel);object(ship.x+side*1.5,shipY+.12,ship.z+z,.9,.2,1.2,steel);}
      object(ship.x+side*4.9,shipY+2.94,ship.z,4.6,.08,.22,cyan,side*.28,.65);
    }
    object(ship.x,shipY+4.2,ship.z+4.7,.20,2.4,2.3,white);
    object(ship.x,shipY+1.5,ship.z-6.8,1.8,.15,2.3,steel);
    object(ship.x-10,shipY+10,ship.z, .12,20,.12,cyan,0,.9);
    oval(ship.x-10,shipY+20.2,ship.z,.33,.33,.33,cyan,.9);}
    // Coastal camp and a distinct, recruitable 3D traveller.
    object(camp.x+5,cy+.15,camp.z+5,10,.2,9,[.38,.31,.21]);
    object(camp.x+5,cy+1.9,camp.z+5,7,3.5,5,[.59,.35,.15]);
    object(camp.x+5,cy+3.7,camp.z+5,8,.25,6,[.73,.51,.24]);
    object(camp.x+5,cy+1.2,camp.z+2.45,1.8,2.4,.10,[.13,.20,.21]);
    object(camp.x-4,cy+3.5,camp.z+4,.11,7,.11,steel);
    object(camp.x-4,cy+6.1,camp.z+4,2.2,.12,.12,steel);
    oval(camp.x-4,cy+7.1,camp.z+4,.20,.20,.20,[1,.70,.31],.8);
    for(let i=0;i<7;i++){const angle=i/7*Math.PI*2;object(camp.x-2+Math.cos(angle),cy+.18,camp.z+3+Math.sin(angle),.40,.35,.40,[.29,.28,.22],angle,0,rock);}
    object(camp.x-2,cy+.27,camp.z+3,1.2,.17,.4,[.27,.16,.07]);oval(camp.x-2,cy+.50+.05*Math.sin(time*7),camp.z+3,.35,.48,.35,[1,.53,.13],.85);
    const friend=s.friend;if(!(s.friendQuest==='recruited'&&typeof NVCompanionCombat!=='undefined')&&s.friendQuest!=='defected'&&(s.friendQuest!=='recruited'||typeof NVGovernance==='undefined'||NVGovernance.follows(s,'orion')))character(friend,friendParts,s.friendQuest==='recruited'?animation.jamesPhase:0,s.friendQuest==='recruited'?animation.jamesSpeed:0,s.seed,true,0,orionLipPose());
    if(s.z<100){
      // Harbour left behind: moored ferry, quayside and shipping containers.
      object(0,1.1,-24,13,.5,25,[.37,.40,.37]);object(-30,.8,-58,18,2.6,50,steel);object(-30,2.8,-55,13,3.2,26,white);object(-30,4.5,-55,14,.2,27,steel);
      for(let i=0;i<3;i++){object(-24-i*12,3,-8,8,5,10,[.37+i*.06,.43,.39]);object(-24-i*12,5.6,-8,8.3,.20,10.3,[.57,.61,.53]);}
    }
    const near=Math.floor(s.z/90);for(let i=Math.max(0,near-2);i<=Math.min(9,near+3);i++){const z=i*90;object(9,F.height(9,z,s.seed)+.8,z,.11,1.6,.11,steel);object(9,F.height(9,z,s.seed)+1.6,z,.27,.12,.27,cyan,0,.7);}
  }
  return{scenery,tree};
}
