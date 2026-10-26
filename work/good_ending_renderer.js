// Batched game models and a bounded set of steady beams; no flashing overlays.
function createGoodEndingScenery({M,draw,actor,between,beam,orb,player,canvas}){
 const models=new Map(),smooth=NVGoodEnding.smooth;
 function model(s,id){
  if(models.has(id))return models.get(id);let row;
  if(id==='williams')row={parts:WilliamsModel.meshes,scale:.5};
  else if(id==='tyrotaronus')row={parts:TyrotaronusModel.meshes,scale:.5};
  else row=NVCombatCrew.model(id,s);
  const parts=row.parts.filter(p=>!/finger|knuckle|tread|buckle|cable|pouch|strand/i.test(p.name));
  row={...row,parts};models.set(id,row);return row;
 }
 function line(a,b,color,width=.06,energy=.18){if(Math.hypot(...b.map((v,i)=>v-a[i]))<.001)return;draw(beam.geometry,M.mul(between([0,0,-.5],[0,0,.5],a,b),M.scale(width,width,1)),color,energy);}
 function box(at,size,color,energy=0){draw(beam.geometry,M.mul(M.t(...at),M.scale(...size)),color,energy);}
 function ball(at,r,color,energy=.15){draw(orb,M.mul(M.t(...at),M.scale(r,r,r)),color,energy);}
 function rifle(at,yaw=0){const root=M.mul(M.t(...at),M.ry(yaw)),piece=(p,size,c)=>draw(beam.geometry,M.mul(root,M.mul(M.t(...p),M.scale(...size))),c);
  piece([0,0,.30],[.15,.15,.52],[.11,.15,.18]);piece([0,-.09,.51],[.13,.23,.2],[.18,.22,.25]);piece([0,.02,-.08],[.09,.09,.47],[.23,.3,.33]);piece([0,.13,.23],[.08,.09,.22],[.12,.8,.95]);
 }
 function arc(a,b,color,height,width=.055){let start=a;for(let i=1;i<=10;i++){const k=i/10,end=a.map((v,j)=>v+(b[j]-v)*k+(j===1?Math.sin(Math.PI*k)*height:0));line(start,end,color,width);start=end;}}
 return(s,q,b)=>{
  const t=q.time,epilogue=b.phase==='epilogue',collapse=b.phase==='collapse',combined=b.phase==='combined-rifle';
  const zarkLip=NVCaraxEndingVoice.lip('zark');
  if(!epilogue){actor('good-zark',LordZarkModel.meshes,[0,-b.collapse*.95,b.zarkZ],.78,0,t,{fall:b.collapse*1.18,execution:{grip:b.reach,strike:0,phase:'rescue'},nativeLip:zarkLip});}
  actor('good-wanderer',player(),[0,b.phase==='failure'?-.6*smooth(t/2):0,2.5],1,Math.PI,t,{human:true,fall:b.phase==='failure'?1.2*smooth(t/2):0,hero:{id:'wanderer',combat:{companion:true,mode:epilogue?'idle':'rifle',elapsed:.45,duration:1}}});
  rifle([0,1.4,1.55]);
  let channels=0;const names=[];
  for(const [i,h]of NVGoodEnding.HEROES.entries()){
   const current=b.active===i,joined=i<b.joined,charge=(joined?(current?b.charge:1):0)*(b.phase==='failure'?1-smooth(t):1),p=[h.position[0],0,h.position[2]];
   const yaw=epilogue?0:Math.atan2(b.impact[0]-p[0],b.impact[2]-p[2]),m=model(s,h.id),mode=epilogue||!joined?'idle':h.mode;
   actor('good-'+h.id,m.parts,p,m.scale||1,yaw,t,{human:true,nativeLip:NVCaraxEndingVoice.lip(h.id),hero:{id:h.id,combat:{companion:true,mode,elapsed:current?Math.min(.55,t*.24):.55,duration:1}},aim:joined&&h.id==='orion'});
   names.push(h.id);
   if(!charge||epilogue||collapse)continue;
   const height=h.weapon.includes('scythe')?2.15:1.45,start=[p[0]+Math.sin(yaw)*.38,height,p[2]+Math.cos(yaw)*.38],end=NVGoodEnding.mix(start,b.impact,charge);
   if(h.id==='james'||h.id==='croxian')arc(start,end,h.color,h.id==='james'?.65:.95,.05);
   else if(h.id==='orion')for(const side of [-1,1])line([start[0]+Math.cos(yaw)*side*.2,start[1],start[2]-Math.sin(yaw)*side*.2],end,h.color,.045);
   else line(start,end,h.color,h.id==='tyrotaronus'?.11:.07);
   if(h.id==='nyrexia')for(let j=0;j<6;j++){const k=(j+1)/7,at=NVGoodEnding.mix(start,end,k);box([at[0]+Math.sin(j*1.4+t*.5)*.08,at[1]+Math.cos(j*1.4+t*.5)*.08,at[2]],[.07,.17,.07],h.color,.12);}
   if(h.id==='tyrotaronus')ball(start,.16,h.color,.3);
   channels++;
  }
  if(!epilogue&&!collapse&&b.phase!=='failure'&&b.joined){
   const strength=(b.joined+b.charge)/8;ball(b.impact,.10+strength*.10,[.45,.85,1],.35);
   for(let i=0;i<12;i++){const angle=i/12*Math.PI*2+t*.25,r=.28+strength*.12;ball([b.impact[0]+Math.cos(angle)*r,b.impact[1]+Math.sin(angle)*r,b.impact[2]],.022,NVGoodEnding.HEROES[i%7].color,.15);}
  }
  if(combined&&b.blast){
   const end=NVGoodEnding.mix(b.rifle,b.impact,b.blast);line(b.rifle,end,[.24,.68,1],.30*b.blast,.28);line(b.rifle,end,[.84,.95,1],.12*b.blast,.35);
   for(const [i,h]of NVGoodEnding.HEROES.entries()){const angle=i/7*Math.PI*2,r=.16*b.blast;line([b.rifle[0]+Math.cos(angle)*r,b.rifle[1]+Math.sin(angle)*r,b.rifle[2]],[end[0]+Math.cos(angle)*r,end[1]+Math.sin(angle)*r,end[2]],h.color,.032,.2);}
   ball(end,.32*b.blast,[.65,.86,1],.35);
   for(let i=0;i<16;i++){const angle=i*2.399,r=.5+b.blast*(.3+i%4*.2);box([Math.cos(angle)*r,2.8+Math.sin(angle)*r,-5.1],[.07,.09,.07],i%2?[.4,.7,1]:[.25,.18,.2],.1);}
  }
  if(collapse)for(let i=0;i<12;i++){const angle=i/12*Math.PI*2,r=1+b.collapse*2;line([Math.cos(angle)*r,.08, b.zarkZ+Math.sin(angle)*r],[Math.cos(angle+.15)*r,.08,b.zarkZ+Math.sin(angle+.15)*r],[.15,.55,.7],.04,.1);}
  if(epilogue)actor('archamus',ArchamusUnhoodedModel.meshes,[-1.6,0,1.2],.67,.2,t);
  canvas.dataset.goodBeat=b.phase;canvas.dataset.goodActive=b.active<0?'':NVGoodEnding.HEROES[b.active].id;canvas.dataset.goodCompanions=names.join(',');canvas.dataset.goodChannels=String(channels);canvas.dataset.goodRifle=String(combined?b.blast:0);canvas.dataset.goodBeamTarget='zark';
 };
}
