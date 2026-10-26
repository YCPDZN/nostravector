function createAlienEcologyScenery({part,stem,eye,cube,rock}){
 function plant(e,s,time){const sp=e.species,m=sp.morph,c=sp.color,a=sp.accent,sway=Math.sin(time*.65+e.phase)*.10;
  if(m.type===0){for(let j=0;j<m.branches;j++){const angle=j/m.branches*Math.PI*2,h=.8+j%3*.45,x=Math.sin(angle)*.55,z=Math.cos(angle)*.55;stem([x*.4,0,z*.4],[x+sway,h,z],.07,c);for(let k=0;k<m.crown;k++){const q=k/m.crown*Math.PI*2;part(x+sway+Math.sin(q)*.3,h+.1,z+Math.cos(q)*.3,.12,.35,.10,a,rock,Math.cos(q)*.6,Math.sin(q)*.6);}part(x+sway,h,.13+z,.12,.12,.12,c);}}
  else if(m.type===1){for(let j=0;j<m.branches;j++){const q=j*2.4,h=1.2+j*.17;stem([0,0,0],[Math.sin(q)*.4+sway,h,Math.cos(q)*.4],.085,c);part(Math.sin(q)*.4+sway,h,Math.cos(q)*.4,.35,.16,.35,a);part(Math.sin(q)*.4+sway,h+.09,Math.cos(q)*.4,.22,.035,.22,[.10,.07,.14],rock,0,0,.1);} }
  else if(m.type===2){for(let j=0;j<m.branches;j++){let last=[0,0,0];for(let k=1;k<=4;k++){const q=j/m.branches*Math.PI*2+k*.3+m.curl,next=[Math.sin(q)*k*.2+sway*k/4,k*.48,Math.cos(q)*k*.2];stem(last,next,.075-k*.009,k%2?a:c);last=next;}part(...last,.12,.22,.12,a,rock,0,0,.15);}}
  else{stem([0,0,0],[sway,2.3,0],.12,c);for(let j=0;j<m.crown;j++){const q=j*2.4,y=.5+j*.22;part(Math.sin(q)*.5+sway,y,Math.cos(q)*.5,.62,.045,.25,j%2?c:a,rock,Math.cos(q)*.28,Math.sin(q)*.28);}part(sway,2.45,0,.24,.3,.24,a,rock);}
 }
 function animal(e,s,time){const sp=e.species,m=sp.morph,c=sp.color,a=sp.accent,pace=Math.min(1,e.speed/2),phase=e.phase,bob=Math.sin(phase*2)*.035*pace,h=m.height+(sp.flying?.1:0),w=m.width,len=m.length;
  for(let j=0;j<m.segments;j++){const z=-j*len*.42,size=1-j/(m.segments*2),side=m.type===3?Math.sin(phase-j*.7)*.13:0;part(side,h+bob,z,w*size,m.type===2?.50:.27,len*.40,c,m.type===1?rock:undefined);part(side,h+.20+bob,z,w*.82*size,.11,len*.32,a,rock);}
  for(let j=0;j<m.limbs;j++){const q=m.type===1?j/m.limbs*Math.PI*2:Math.PI/2+(j%2)*Math.PI,fore=m.type===1?Math.cos(q)*len*.65:(Math.floor(j/2)/Math.max(1,Math.ceil(m.limbs/2)-1)-.5)*len*1.3,side=Math.sin(q),stride=Math.sin(phase+j*2.4)*.24*pace,lift=Math.max(0,Math.cos(phase+j*2.4))*.16*pace,knee=[side*(w+.28),h*.55+bob,fore+stride*.5],foot=[side*(w+.50),.07+lift,fore+stride];stem([side*w*.7,h,fore],knee,.065,a);stem(knee,foot,.045,c);part(...foot,.11,.055,.15,a,rock);}
  const head=[0,h+.18+bob,len*.53];part(...head,w*.65,.27,.32,a,m.type===2?rock:undefined);
  for(let j=0;j<m.eyes;j++){const q=(j-(m.eyes-1)/2)*.18;eye(q,head[1]+.12,head[2]+.26,.045+(sp.behavior==='predator'?.012:0),sp.behavior==='predator'?[1,.29,.20]:[.7,.94,.85]);}
  if(sp.behavior==='predator'){const open=e.mode==='hunting'?.10+Math.sin(time*5)*.04:.035;part(0,head[1]-.14-open,head[2]+.14,w*.55,.07,.28,c,rock);for(const side of [-1,1])stem([side*w*.4,head[1]-.1,head[2]+.32],[side*w*.33,head[1]-.27-open,head[2]+.38],.04,[.86,.82,.65]);}
  for(let j=0;j<m.horns;j++){const x=(j-(m.horns-1)/2)*.22;stem([x,head[1]+.16,head[2]],[x*1.5,head[1]+.55,head[2]-.15],.045,c);}
  if(m.crest)for(let j=0;j<m.segments;j++)part(0,h+.4,-j*len*.42,.065,.30-j*.035,.15,a,rock,0,0,.12);
  let last=[0,h,-(m.segments-.7)*len*.42];for(let j=0;j<m.tail;j++){const next=[Math.sin(time*1.5+e.phase+j*.4)*(.07+j*.03),h-.04*j,last[2]-.25];stem(last,next,Math.max(.025,.065-j*.008),j%2?c:a);last=next;}
  if(sp.flying){for(const side of [-1,1]){const flap=Math.sin(time*2.4+e.phase)*.28;part(side*(w+.65),h+.15,0,.85,.045,len*.8,a,rock,0,side*flap);for(let j=0;j<3;j++)stem([side*w,h,0],[side*(w+1.2),h+flap,(-.5+j*.5)*len],.035,c);}}
 }
 return{plant,animal};
}
