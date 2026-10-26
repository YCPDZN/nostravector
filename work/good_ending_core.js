// The rescue precedes the original recorded epilogue. No recruitment/save flags change.
const NVGoodEnding=(()=>{
 const OFFSET=NVCaraxEndings.GOOD_INTRO.length;
 const HEROES=[
  {id:'james',name:'JAMES BROWN',position:[-5.2,0,1.4],color:[1,.68,.22],mode:'cleave',weapon:'scythe'},
  {id:'croxian',name:'CROXIAN MASCAR',position:[-4,0,-.8],color:[.16,.95,.96],mode:'sweep',weapon:'tri-scythe'},
  {id:'malia',name:'MALIA DE TORO',position:[-2.1,0,-1.9],color:[.25,.65,1],mode:'lance',weapon:'plasma'},
  {id:'orion',name:'ORION MASCAR',position:[2.1,0,-1.9],color:[1,.3,.17],mode:'laser',weapon:'dual-pistols'},
  {id:'nyrexia',name:'NYREXIA ERISCONOS',position:[4,0,-.8],color:[.55,.9,1],mode:'ice',weapon:'ice'},
  {id:'williams',name:'JOSIAH WILLIAMS II',position:[5.2,0,1.4],color:[.74,.88,1],mode:'rifle',weapon:'rifle'},
  {id:'tyrotaronus',name:'TYROTARONUS',position:[-6.4,0,4.2],color:[.3,1,.56],mode:'orb',weapon:'balance'}
 ];
 const smooth=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x);};
 const mix=(a,b,k)=>a.map((v,i)=>v+(b[i]-v)*k);
 const intro=q=>q?.route==='good'&&q.stage==='cinematic'&&q.shot<OFFSET;
 function beat(q,mobile=false){
  const shot=q.shot,t=Math.max(0,q.time||0),u=smooth(t/2.4),old=shot-OFFSET,offer=q.stage==='offer'||q.stage==='done',beam=NVBeamStruggle.ensure(q),trial=NVBeamStruggle.active(q);
  const phase=trial?['battle','interlude'].includes(beam.stage)?'nightmare':beam.stage==='firing'?'combined-rifle':beam.stage==='qte'?'beam-qte':'failure':offer||old>0?'epilogue':old===0?'collapse':shot===0?'last-grasp':'companion';
  const active=phase==='companion'?shot-1:-1,joined=trial?7:shot<OFFSET?Math.min(7,Math.max(0,shot)):7;
  let eye=mobile?[0,5.6,24]:[8.5,4.6,14],target=[0,2,-1];
  if(phase==='last-grasp'){eye=mix([2.4,1.7,5.8],[1.9,1.5,5.2],u);target=[0,3.1,-1.5];}
  if(active>=0){const p=HEROES[active].position;eye=active===6?[p[0]+(mobile?4.5:3),3,p[2]-(mobile?6.5:3.4)]:[p[0]*.55,3,p[2]+(mobile?7.5:4.8)];target=[p[0],1.3,p[2]];eye[0]+=.18*smooth(t/5);}
  if(['combined-rifle','beam-qte','failure'].includes(phase)){eye=mobile?[7,7,33]:[8,6,16];target=[0,1.9,-1];}
  if(phase==='collapse'){eye=mobile?[0,4.6,23]:[4,3.8,12];target=[0,2,-3];}
  if(phase==='nightmare'){const camera=NVBeamStruggle.camera(q,mobile);eye=camera.eye;target=camera.target;}
  if(phase==='epilogue'){eye=mobile?[0,5.2,34]:[0,3.6,13.5];target=[0,1.7,1];}
  const charge=trial?1:smooth((t-.5)/1.5),blast=phase==='combined-rifle'?smooth((t-.3)/1.2):0,zarkZ=phase==='last-grasp'?-6+5*u:phase==='companion'?-1-.55*Math.max(0,joined-1):phase==='failure'?-5.3+3*smooth(t/3):-5.3;
  return{phase,active,joined,eye,target,charge,blast,collapse:phase==='collapse'?smooth(t/4):0,
   zarkZ,
   reach:phase==='last-grasp'?u:phase==='companion'?1-joined*.095:phase==='failure'?1:0,
   rifle:[0,1.4,1.15],impact:[0,2.8,zarkZ+.15],old};
 }
 const originalDuration=NVCaraxEndings.duration,originalMinimum=NVCaraxEndings.minimumTime;
 NVCaraxEndings.duration=q=>intro(q)?q.shot===0?6:Math.max(6,NVCaraxEndings.LINES.good[q.shot][1].length/17):originalDuration(q);
 NVCaraxEndings.minimumTime=q=>intro(q)?3.2:originalMinimum(q);
 return{OFFSET,HEROES,smooth,mix,intro,beat};
})();
