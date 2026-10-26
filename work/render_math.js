// Shared camera basis for the view matrix and the direction-anchored sky.
const NVRenderMath=(()=>{
  const normalize=v=>{const l=Math.hypot(...v)||1;return v.map(n=>n/l);};
  const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
  function cameraFrame(eye,target){const forward=normalize(target.map((v,i)=>v-eye[i])),reference=Math.abs(forward[1])>.999?[0,0,1]:[0,1,0],right=normalize(cross(forward,reference)),up=cross(right,forward);return{forward,right,up};}
  function skyRay(frame,u,v,aspect,fov=Math.PI/3.05){const t=Math.tan(fov/2);return normalize(frame.forward.map((n,i)=>n+frame.right[i]*(2*u-1)*aspect*t+frame.up[i]*(2*v-1)*t));}
  function view(eye,target){const f=cameraFrame(eye,target),z=f.forward.map(n=>-n),x=f.right,y=f.up,dot=(a,b)=>a.reduce((n,v,i)=>n+v*b[i],0);return[x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,-dot(x,eye),-dot(y,eye),-dot(z,eye),1];}
  function textureSize(maximum){return Math.min(2048,2**Math.floor(Math.log2(Math.max(1,maximum||2048))));}
  // Keep millimetre-sized character layers precise even at global landing coordinates.
  function relativePoint(point,origin){return point.map((v,i)=>v-origin[i]);}
  function relativeModel(model,origin){const result=model.slice();for(let i=0;i<3;i++)result[12+i]-=origin[i];return result;}
  function normalMatrix(m){
    const a=[m[0],m[1],m[2]],b=[m[4],m[5],m[6]],c=[m[8],m[9],m[10]],bc=cross(b,c),ca=cross(c,a),ab=cross(a,b),det=a.reduce((sum,v,i)=>sum+v*bc[i],0);
    return Math.abs(det)<1e-12?[1,0,0,0,1,0,0,0,1]:[...bc,...ca,...ab].map(v=>v/det);
  }
  return{cameraFrame,skyRay,view,textureSize,relativePoint,relativeModel,normalMatrix};
})();
