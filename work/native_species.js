// Existing species remain ordinary, save-local custom characters and factions.
const NVNativeSpecies=(()=>{
 const factions={human:'HUMAN',chompy:'CHOMPY',grek:'GREK',erisian:'ERISIAN'};
 const rgb=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)/255);
 const triplets=a=>Array.from({length:a.length/3},(_,i)=>a.slice(i*3,i*3+3));
 let reptillianModel=null;
 function model(base){if(base!=='reptillian2')return NVArmyModels.model(factions[base]);if(!reptillianModel){let lo=Infinity,hi=-Infinity;for(const part of Reptillian2Model.meshes){const a=part.p.flat();for(let i=1;i<a.length;i+=3){lo=Math.min(lo,a[i]);hi=Math.max(hi,a[i]);}}const scale=4.3/(hi-lo);reptillianModel={meshes:Reptillian2Model.meshes.map(part=>({...part,p:part.p.flat().map((v,i)=>(i%3===1?v-lo:v)*scale)}))};}return reptillianModel;}
 function parts(profile,q){const source=model(q.base);if(!source)return[];const skin=rgb(q.skin),secondary=rgb(q.secondary),eyes=rgb(q.eyes);
  return source.meshes.map(raw=>{const pos=triplets(raw.p.flat()).map(v=>v.map(n=>n/2.15)),normal=triplets(raw.n.flat()),label=raw.name||'',bone=raw.bone||'body',head=['head','eyes','jaw'].includes(bone),arm=/arm/i.test(bone),leg=/leg/i.test(bone),sx=q.width*(head?q.headSize:leg?q.legWidth:1),sy=q.height*(head?q.headSize:arm?q.armLength:1),sz=head?q.headSize:1,pivot=head?1.61:arm?1.45:0;
   const p=pos.map(v=>[v[0]*sx,(v[1]-pivot)*(sy/q.height)*q.height+pivot*q.height,v[2]*sz]);const n=normal.map(v=>{const t=[v[0]/sx,v[1]/sy,v[2]/sz],length=Math.hypot(...t)||1;return t.map(x=>x/length);});
   let c=raw.color||raw.c,mat;
   if(/hair|beard|braid/i.test(label))c=secondary;
   else if(/iris|^eye [+-]?\d|^eye -?\d/i.test(label)&&!/socket|white|glint/i.test(label))c=eyes;
   else if(/face|jaw|nose|ear|forehead|hand|finger|thumb|neck/i.test(label)&&!/armour|armor|plate|glove|comms|helmet|cable/i.test(label))c=skin;
   else if(/armour|armor|breastplate|shoulder|torso|trouser|sleeve|cloak|undersuit|backpack/i.test(label))mat='suit';
   // Model builders use mixed triangle winding; the editor's outline pass needs
   // every visible surface to face in the same direction as its outward normal.
   const f=[...(raw.indices||raw.f)];for(let i=0;i<f.length;i+=3){const a=p[f[i]],b=p[f[i+1]],d=p[f[i+2]],u=b.map((v,k)=>v-a[k]),w=d.map((v,k)=>v-a[k]),cross=[u[1]*w[2]-u[2]*w[1],u[2]*w[0]-u[0]*w[2],u[0]*w[1]-u[1]*w[0]];if(cross.reduce((sum,v,k)=>sum+v*n[f[i]][k],0)<0)[f[i+1],f[i+2]]=[f[i+2],f[i+1]];}
   return{name:'Species / '+q.base+' / '+label,p,n,f,c,bone,...(mat?{mat}:{})};
  });
 }
 return{parts};
})();
