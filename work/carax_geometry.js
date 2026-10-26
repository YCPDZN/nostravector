// Merge only pieces sharing the exact material and animation transform.
const NVCaraxGeometry=(()=>{
 function merge(parts,mesh,key=()=>'',limit=60000){
  const buckets=new Map(),out=[];
  for(const part of parts){const p=part.p.flat(),n=part.n.flat(),f=part.f||part.indices,color=part.color||part.c,motionKey=key(part),tag=motionKey+'|'+color.join(',')+'|'+(part.emission||0);let row=buckets.get(tag);if(!row||row.p.length/3+p.length/3>limit){row={p:[],n:[],f:[],color,motionKey,emission:part.emission||0,representative:part,members:[]};buckets.set(tag,row);out.push(row);}const offset=row.p.length/3;for(const v of p)row.p.push(v);for(const v of n)row.n.push(v);for(const i of f)row.f.push(i+offset);row.members.push(part);}
  return out.map(row=>({...row,geometry:mesh({p:row.p,n:row.n,f:row.f})}));
 }
 function animated(parts,mesh){const rig=NVCompanionMotion.rig(parts),indices=new Map(parts.map((p,i)=>[p,i]));return merge(parts,mesh,p=>{const g=rig.groups.get(p);if(!g)return'body';if(g.attachedArm)return'arm:'+indices.get(g.attachedArm);return JSON.stringify([g.kind,g.side,g.lower,g.pivot||null]);});}
 const faces=[[[1,0,0],[[.5,-.5,-.5],[.5,.5,-.5],[.5,.5,.5],[.5,-.5,.5]]],[[-1,0,0],[[-.5,-.5,.5],[-.5,.5,.5],[-.5,.5,-.5],[-.5,-.5,-.5]]],[[0,1,0],[[-.5,.5,-.5],[-.5,.5,.5],[.5,.5,.5],[.5,.5,-.5]]],[[0,-1,0],[[-.5,-.5,.5],[-.5,-.5,-.5],[.5,-.5,-.5],[.5,-.5,.5]]],[[0,0,1],[[.5,-.5,.5],[.5,.5,.5],[-.5,.5,.5],[-.5,-.5,.5]]],[[0,0,-1],[[-.5,-.5,-.5],[-.5,.5,-.5],[.5,.5,-.5],[.5,-.5,-.5]]]];
 function boxes(build,mesh){const parts=[],object=(x,y,z,sx,sy,sz,color,yaw=0,emission=0)=>{const p=[],n=[],f=[],c=Math.cos(yaw),s=Math.sin(yaw);for(const [normal,vertices]of faces){const start=p.length/3;for(const v of vertices){const xx=v[0]*sx,zz=v[2]*sz;p.push(x+xx*c+zz*s,y+v[1]*sy,z-xx*s+zz*c);n.push(normal[0]*c+normal[2]*s,normal[1],-normal[0]*s+normal[2]*c);}f.push(start,start+1,start+2,start,start+2,start+3);}parts.push({p,n,f,color,emission});};build(object);return merge(parts,mesh);}
 return{merge,animated,boxes};
})();
