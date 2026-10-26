// Articulated surface rendering; all combat and persistence live in NVPontifex.
function createPontifexScenery({object,ground,mesh,M,draw,facePart}){
 const SCALE=.55,RED=[1,.055,.035],CYAN=[.08,.91,1];
 let cached=null,farParts=null,beamMesh=null,cachedIdentity='';
 const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,n));
 const pivot=(v,r)=>M.mul(M.t(...v),M.mul(r,M.t(...v.map(n=>-n))));
 const point=(m,v)=>[m[0]*v[0]+m[4]*v[1]+m[8]*v[2]+m[12],m[1]*v[0]+m[5]*v[1]+m[9]*v[2]+m[13],m[2]*v[0]+m[6]*v[1]+m[10]*v[2]+m[14]];
 function prepare(s){
  const identity=NVPontifex.ensure(s).identity||'';if(cached&&cachedIdentity===identity||typeof PontifexModel==='undefined')return;cachedIdentity=identity;const source=identity==='james-brown'?BrownPontifexModel:PontifexModel;
  cached=source.meshes.map(q=>{const chapterFace=identity==='james-brown'&&q.name.startsWith('Brown / ')&&facePart?mesh({name:q.name.slice(8),p:Array.from({length:q.p.length/3},(_,i)=>[q.p[i*3]/1.5,(q.p[i*3+1]-3.45)/1.5+1.415,(q.p[i*3+2]-.03)/1.5]),n:Array.from({length:q.n.length/3},(_,i)=>q.n.slice(i*3,i*3+3)),f:q.indices,c:q.color}):null;return{geometry:chapterFace?null:mesh({p:q.p,n:q.n,f:q.indices}),chapterFace,color:q.color,bone:q.bone||'body',emission:q.emission||0,name:q.name,lod:q.lod};});
  farParts=cached.filter(q=>q.lod===true);
  if(!farParts.length)farParts=cached.filter(q=>/helmet|horn|heart core|chest|cuirass|under.?suit|thigh armour|shin armour|boot shell|pauldron|cape panel|polearm shaft|crescent blade/i.test(q.name)).slice(0,72);
  if(!farParts.length)farParts=cached.filter((q,i)=>i%4===0).slice(0,72);
  if(identity==='james-brown')farParts=[...new Set([...farParts,...cached.filter(q=>q.chapterFace)])];
 }
 function beam(from,to,color,width=.055){
  const d=to.map((n,i)=>n-from[i]),length=Math.hypot(...d);if(length<.001)return;
  if(!beamMesh){
   const p=[],n=[],f=[];
   for(const [normal,vertices] of [[[1,0,0],[[.5,-.5,-.5],[.5,.5,-.5],[.5,.5,.5],[.5,-.5,.5]]],[[-1,0,0],[[-.5,-.5,.5],[-.5,.5,.5],[-.5,.5,-.5],[-.5,-.5,-.5]]],[[0,1,0],[[-.5,.5,-.5],[-.5,.5,.5],[.5,.5,.5],[.5,.5,-.5]]],[[0,-1,0],[[-.5,-.5,.5],[-.5,-.5,-.5],[.5,-.5,-.5],[.5,-.5,.5]]],[[0,0,1],[[.5,-.5,.5],[.5,.5,.5],[-.5,.5,.5],[-.5,-.5,.5]]],[[0,0,-1],[[-.5,-.5,-.5],[-.5,.5,-.5],[.5,.5,-.5],[.5,-.5,-.5]]]]){
    const start=p.length;p.push(...vertices);n.push(...vertices.map(()=>normal));f.push(start,start+1,start+2,start,start+2,start+3);
   }
   beamMesh=mesh({p,n,f});
  }
  const z=d.map(n=>n/length),reference=Math.abs(z[1])>.97?[1,0,0]:[0,1,0];
  let x=[reference[1]*z[2]-reference[2]*z[1],reference[2]*z[0]-reference[0]*z[2],reference[0]*z[1]-reference[1]*z[0]],l=Math.hypot(...x);x=x.map(n=>n/l);
  const y=[z[1]*x[2]-z[2]*x[1],z[2]*x[0]-z[0]*x[2],z[0]*x[1]-z[1]*x[0]],center=from.map((n,i)=>(n+to[i])*.5);
  draw(beamMesh,[x[0]*width,x[1]*width,x[2]*width,0,y[0]*width,y[1]*width,y[2]*width,0,z[0]*length,z[1]*length,z[2]*length,0,...center,1],color,0,1);
 }
 function line(s,x1,z1,x2,z2,color,width=.12){
  const dx=x2-x1,dz=z2-z1,length=Math.hypot(dx,dz);if(length<.001)return;
  // Short segments follow real terrain instead of hovering over a hillside.
  const count=Math.max(1,Math.ceil(length/1.8));
  for(let i=0;i<count;i++){
   const t=(i+.5)/count,x=x1+dx*t,z=z1+dz*t;
   object(x,ground(x,z,s.seed)+.06,z,width,.075,length/count+.035,color,Math.atan2(dx,dz),.85);
  }
 }
 function ring(s,x,z,radius,color,segments=24,start=0,end=Math.PI*2){
  for(let i=0;i<segments;i++){
   const a=start+(end-start)*i/segments,b=start+(end-start)*(i+1)/segments;
   line(s,x+Math.sin(a)*radius,z+Math.cos(a)*radius,x+Math.sin(b)*radius,z+Math.cos(b)*radius,color,.14);
  }
 }
 function telegraph(s,n,time){
  const q=n.boss;if(q.mode!=='windup'&&q.mode!=='release')return;
  const release=q.mode==='release',pulse=.7+.3*Math.sin(time*17),color=RED.map(v=>v*pulse);
  if(q.action==='lance'&&q.aim){
   const x=n.homeX+q.aim.x,z=n.homeZ+q.aim.z;
   ring(s,x,z,3.1,color,24);line(s,x-1.7,z,x+1.7,z,color);line(s,x,z-1.7,x,z+1.7,color);
   if(release){const y=ground(x,z,s.seed)+.15;beam([n.x,ground(n.x,n.z,s.seed)+1.9,n.z],[x,y,z],RED,.13);ring(s,x,z,3.1+(.28-q.timer)*4,RED,24);}
  }else if(q.action==='slam'){
   ring(s,n.x,n.z,7,color,32);ring(s,n.x,n.z,Math.max(.45,7*(1-clamp(q.timer/1.5))),color,24);
   if(release)for(let i=0;i<8;i++){const a=i*Math.PI/4;line(s,n.x,n.z,n.x+Math.sin(a)*7,n.z+Math.cos(a)*7,RED,.19);}
  }else{
   const start=q.yaw-1.5,end=q.yaw+1.5;ring(s,n.x,n.z,6,color,24,start,end);
   for(let i=0;i<7;i++){const a=start+(end-start)*i/6;line(s,n.x,n.z,n.x+Math.sin(a)*6,n.z+Math.cos(a)*6,color,.075);}
   if(release){const a=start+(end-start)*clamp(1-q.timer/.28);line(s,n.x,n.z,n.x+Math.sin(a)*6,n.z+Math.cos(a)*6,RED,.25);}
  }
 }
 return(s,time=0)=>{
  const n=NVPontifex.local(s,true);if(!n||n.distance>450)return;
  prepare(s);if(!cached)return;
  const q=n.boss,p=PontifexModel.pivots||{},moving=clamp((q.speed||0)/3.5),stride=Math.sin(q.gait||0)*moving;
  const winding=q.mode==='windup',release=q.mode==='release',recover=q.mode==='recovery',dead=!q.alive&&!(typeof NVBrownResolution!=='undefined'&&NVBrownResolution.ensure(s).pending);
  const duration=q.action==='slam'?1.5:q.action==='lance'?1.35:1,charge=winding?clamp(1-q.timer/duration):0,swing=release?clamp(1-q.timer/.28):0,settle=recover?clamp(q.timer/1.5):0;
  const fall=dead?clamp((7-q.deathTime)/1.3):0;
  let torsoX=.045+moving*.10,torsoY=0,rightX=stride*.10-.06,rightZ=-.06,leftX=-stride*.21,leftZ=.06,weaponY=0,weaponZ=0;
  if(q.action==='sweep'){
   torsoY=winding?-.58*(.35+.65*charge):release?-.58+swing*1.2:recover?.28*settle:0;
   rightX+=winding?-.25*charge:release?.2*Math.sin(swing*Math.PI):0;
   rightZ+=winding?-.42*(.4+.6*charge):release?-.42+swing*.66:recover?.18*settle:0;
   weaponY=winding?-.65*charge:release?-.65+swing*1.5:recover?.22*settle:0;
   leftX+=winding?-.32*charge:release?.2*swing:0;
  }else if(q.action==='slam'){
   rightX+=winding?-1.55*(.3+.7*charge):release?-1.55+2.25*swing:recover?.52*settle:0;
   leftX+=winding?-1.25*charge:release?.38*swing:recover?.27*settle:0;
   torsoX+=winding?-.25*charge:release?.48*swing:recover?.25*settle:0;
   weaponZ=winding?-.24*charge:release?.15*swing:0;
  }else{
   rightX+=winding?-.86*(.5+.5*charge):release?-.86+.33*swing:recover?-.28*settle:0;
   leftX+=winding?-.5*charge:release?-.32:recover?-.16*settle:0;
   torsoY=winding?-.14*charge:release?.12:0;weaponY=winding?-.13*charge:0;
  }
  if(dead){torsoX=.22;torsoY=0;leftX=.24;rightX=.28;rightZ=.14;leftZ=-.1;weaponY=.35;weaponZ=.3;}
  const bob=dead?0:Math.sin(time*2.3)*.014+Math.abs(stride)*.035;
  const root=M.mul(M.t(n.x+Math.cos(q.yaw)*fall*.55,ground(n.x,n.z,s.seed)+bob+fall*.52,n.z-Math.sin(q.yaw)*fall*.55),M.mul(M.ry(q.yaw),M.mul(M.rz(-1.4*fall),M.scale(SCALE,SCALE,SCALE))));
  const body=pivot(p.body||[0,2.35,0],M.mul(M.ry(torsoY),M.rx(torsoX)));
  const rightArm=M.mul(body,pivot(p.rightArm||[.72,3.14,0],M.mul(M.rz(rightZ),M.rx(rightX))));
  const bones={
   body,
   head:M.mul(body,pivot(p.head||[0,3.38,0],M.mul(M.ry(-torsoY*.55),M.rx(winding?-.05*charge:.018*Math.sin(time*1.7))))),
   leftArm:M.mul(body,pivot(p.leftArm||[-.72,3.14,0],M.mul(M.rz(leftZ),M.rx(leftX)))),rightArm,
   leftLeg:pivot(p.leftLeg||[-.35,1.83,0],M.rx(stride*.40-fall*.13)),
   rightLeg:pivot(p.rightLeg||[.35,1.83,0],M.rx(-stride*.40+fall*.18)),
   weapon:M.mul(rightArm,pivot(p.weapon||[.10,2.67,.66],M.mul(M.ry(weaponY),M.rz(weaponZ)))),
   cape:M.mul(body,pivot(p.cape||[0,3.15,-.25],M.mul(M.rx(-.025-moving*.12+Math.sin(time*2.1)*.025),M.rz(Math.sin(time*1.4)*.035))))
  };
  const list=n.distance>110?farParts:cached,lip=q.identity==='james-brown'&&typeof brownReturnLipPose==='function'?brownReturnLipPose():{jaw:0,width:1,round:0,teeth:0};
  const faceSpace=M.mul(M.t(0,3.45,.03),M.mul(M.scale(1.5,1.5,1.5),M.t(0,-1.415,0)));
  for(const part of list){
   const hit=clamp((q.hitFlash||0)/.18),glow=clamp((part.emission||0)+(winding?.12*charge:0));
   const color=part.color.map((v,i)=>v*(1-hit*.35)+CYAN[i]*hit*.35);
   let bone=bones[part.bone]||body;
   if(part.chapterFace){facePart(part.chapterFace,M.mul(root,M.mul(bone,faceSpace)),lip);continue;}
   if(q.identity==='james-brown'&&part.name==='Cybernetic lower jaw plate')bone=M.mul(bone,M.t(0,-.036*lip.jaw,.0045*lip.round));
   draw(part.geometry,M.mul(root,bone),color,0,glow);
  }
  if(!dead&&n.distance<85){
   telegraph(s,n,time);
   if(q.shotFlash>0){const chest=point(M.mul(root,body),[0,2.86,.51]),player=[s.x,ground(s.x,s.z,s.seed)+1.3+(s.jumpOffset||0),s.z];beam(player,chest,CYAN,.055);object(...chest,.12,.12,.12,CYAN,0,1);}
   if(winding){const core=point(M.mul(root,body),[0,2.86,.51]),r=.11+.055*Math.sin(time*25);object(...core,r,r,r,RED,0,1);}
  }
 };
}
