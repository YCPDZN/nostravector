function createRewardShipDraw({mesh,M,draw}){
 let parts=null;return(s,x,y,z,time=0)=>{if(!parts)parts=RewardShipModel.meshes.map(p=>({...p,geometry:mesh({p:p.p,n:p.n,f:p.indices})}));const root=M.t(x,y,z);for(const p of parts){const pivot=RewardShipModel.pivots[p.bone];let bone=M.t(0,0,0);if(p.bone.startsWith('turret')&&pivot){const angle=Math.sin(time*.35+(+p.bone.slice(-1)))*.18;bone=M.mul(M.t(...pivot),M.mul(M.ry(angle),M.t(...pivot.map(v=>-v))));}draw(p.geometry,M.mul(root,bone),p.color,0,p.emission||0);}};
}
function createRewardCave({object,ground,mesh,M,draw,rock}){
 let vault=null;const ship=createRewardShipDraw({mesh,M,draw});
 function arch(){if(vault)return;const p=[],n=[],f=[],face=(pts,normal)=>{const a=pts[1].map((v,i)=>v-pts[0][i]),b=pts[2].map((v,i)=>v-pts[0][i]),cross=[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];if(cross.reduce((sum,v,i)=>sum+v*normal[i],0)<0)pts=pts.slice().reverse();const start=p.length;p.push(...pts);n.push(...pts.map(()=>normal));f.push(start,start+1,start+2,start,start+2,start+3);};for(let i=0;i<28;i++){const a=i/28*Math.PI,b=(i+1)/28*Math.PI,outer=t=>[Math.cos(t)*27,Math.sin(t)*29],inner=t=>[Math.cos(t)*18,Math.sin(t)*22];for(const z of [0,54]){const A=outer(a),B=outer(b),C=inner(b),D=inner(a);face([[...A,z],[...B,z],[...C,z],[...D,z]],[0,0,z===0?-1:1]);}for(const [fn,sign]of [[outer,1],[inner,-1]]){const A=fn(a),B=fn(b);face([[...A,0],[...B,0],[...B,54],[...A,54]],[Math.cos((a+b)/2)*sign,Math.sin((a+b)/2)*sign,0]);}}vault=mesh({p,n,f});}
 return(s,time)=>{if(!NVKhazglar.onMars(s)||!['landed','cockpit'].includes(s.space.phase))return;const c=NVShipReward.cave(s);if(Math.hypot(s.x-c.x,s.z-c.z)>700)return;arch();const y=ground(c.x,c.z,s.seed);draw(vault,M.t(c.x,y,c.z),[.31,.19,.14]);object(c.x,y+12,c.z+55,53,25,3,[.25,.15,.12]);object(c.x,y+.04,c.z+25,36,.08,50,[.16,.19,.21]);
  for(const side of [-1,1]){for(let i=0;i<7;i++){const z=c.z+4+i*7;object(c.x+side*24,y+6+(i%3)*2,z,9,13+(i%3)*3,10,[.34,.21,.16],i*.31,0,rock);object(c.x+side*17,y+.15,z,.16,.12,4,[.32,.83,1],0,.8);}object(c.x+side*16.5,y+7,c.z+12,.25,1.1,.3,[.55,.88,1],0,.8);}
  object(c.x,y+.13,c.z+2,28,.10,.2,[.30,.77,.95],0,.5);for(let z=8;z<49;z+=6)object(c.x,y+.12,c.z+z,.18,.05,2,[.67,.73,.66]);
  if(!NVShipReward.ensure(s).claimed){const b=NVShipReward.berth(s);ship(s,b.x,y+.1,b.z,time);}
 };
}
