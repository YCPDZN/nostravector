// Fit the Chapter 1 mouth renderer to the original Project BC head; keep GLB data intact.
function createWilliamsGarethSpeech({M,draw,facePart,mesh}){
 const cache=new WeakMap(),neutral={jaw:0,width:1,round:0,teeth:0};
 function prepare(n,parts){
  const kind=NVBCCombat.kind(n);if(!['gareth','josiah'].includes(kind)||!facePart)return null;
  if(cache.has(parts))return cache.get(parts);
  // Both supplied Gareth models use this distinct lip material on the Head attachment.
  const mouth=parts.find(p=>p.rig?.kind==='head'&&(kind==='josiah'?p.c.every(v=>v<.01):Math.abs(p.c[0]-.125)<.025&&Math.abs(p.c[1]-.0625)<.025&&Math.abs(p.c[2]-.0625)<.025));
  if(!mouth){cache.set(parts,null);return null;}
  // Richards shares one black material across lips and eyes. Isolate only the lip
  // triangles; keep his eyes and brows visible when replacing the neutral mouth.
  let restGeometry=null,mouthPoints=mouth.p;
  if(kind==='josiah'){
   if(!mesh)return null;
   const cutoff=.78*(n.model?.height||1.85),lipFaces=[],restFaces=[];
   for(let i=0;i<mouth.f.length;i+=3){const tri=mouth.f.slice(i,i+3);(tri.every(j=>mouth.p[j][1]<cutoff)?lipFaces:restFaces).push(...tri);}
   mouthPoints=lipFaces.map(i=>mouth.p[i]);if(!mouthPoints.length)return null;
   restGeometry=mesh({...mouth,f:restFaces});
  }
  const lo=[Infinity,Infinity,Infinity],hi=[-Infinity,-Infinity,-Infinity];for(const v of mouthPoints)for(let k=0;k<3;k++){lo[k]=Math.min(lo[k],v[k]);hi[k]=Math.max(hi[k],v[k]);}
  const centre=lo.map((v,k)=>(v+hi[k])/2),scale=(hi[0]-lo[0])/(.056*2),front=hi[2]+.001;
  const faceSpace=M.mul(M.t(centre[0],centre[1]-1.551*scale,front-.191*scale),M.scale(scale,scale,scale));
  const deform=parts.filter(p=>p!==mouth&&p.rig?.kind==='head').map(p=>{
   const weights=p.p.map(v=>{const x=Math.max(0,1-Math.abs(v[0]-centre[0])/(.15*scale)),z=Math.max(0,Math.min(1,(v[2]-centre[2]+.08*scale)/(.08*scale))),y=Math.max(0,Math.min(1,(centre[1]+.015*scale-v[1])/(.09*scale)));return v[1]<centre[1]-.19*scale?0:x*z*y;});
   return weights.some(w=>w>0)?{part:p,weights,buffer:new Float32Array(p.p.flat())}:null;
  }).filter(Boolean);
  const result={mouth,centre,scale,faceSpace,deform,restGeometry,speaker:kind==='josiah'?'richards':'gareth',jaw:0,round:0};cache.set(parts,result);return result;
 }
 function render(s,n,parts,root,motion,staged){
  const q=prepare(n,parts);if(!q)return false;
  const lip=staged?NVWilliamsVoice.pose(q.speaker):neutral,gl=polarCanvas.getContext('webgl');
  if(Math.abs(q.jaw-lip.jaw)>.00001||Math.abs(q.round-lip.round)>.00001){
   for(const d of q.deform){for(let i=0;i<d.part.p.length;i++){const v=d.part.p[i],w=d.weights[i];d.buffer[i*3]=v[0];d.buffer[i*3+1]=v[1]-.024*q.scale*lip.jaw*w;d.buffer[i*3+2]=v[2]+.003*q.scale*lip.round*w;}gl.bindBuffer(gl.ARRAY_BUFFER,d.part.geometry.pb);gl.bufferSubData(gl.ARRAY_BUFFER,0,d.buffer);}
   q.jaw=lip.jaw;q.round=lip.round;
  }
  for(const part of parts){const transform=M.mul(root,NVCompanionMotion.part(motion,part));if(part===q.mouth&&lip.jaw>.025){if(q.restGeometry)draw(q.restGeometry,transform,part.c);facePart({name:'Mouth neutral'},M.mul(transform,q.faceSpace),lip);}else draw(part.geometry,transform,part.c);}
  return true;
 }
 return{prepare,render};
}
