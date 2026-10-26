// Shared instanced hull geometry: 1,500 vessels use four faction draw batches.
function createJaniraArmadaRenderer(gl){
 const inst=gl.getExtension('ANGLE_instanced_arrays');
 function program(v,f){const p=gl.createProgram();for(const [type,source]of [[gl.VERTEX_SHADER,v],[gl.FRAGMENT_SHADER,f]]){const sh=gl.createShader(type);gl.shaderSource(sh,source);gl.compileShader(sh);if(!gl.getShaderParameter(sh,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(sh));gl.attachShader(p,sh);}gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(p));return p;}
 const hullProgram=program('attribute vec3 p,n,offset,orient;attribute float zone;uniform mat4 vp;uniform float style;varying vec3 N;varying float Z;void main(){vec3 q=p;q.x*=style==1.?1.18:style==2.?.85:1.;q.z*=style==3.?1.18:1.;q*=orient.z;float c=cos(orient.x),s=sin(orient.x);q=vec3(q.x*c+q.z*s,q.y,-q.x*s+q.z*c);vec3 nn=vec3(n.x*c+n.z*s,n.y,-n.x*s+n.z*c);N=nn;Z=zone;gl_Position=vp*vec4(q+offset,1.);}',
 'precision mediump float;uniform vec3 hull,accent;varying vec3 N;varying float Z;void main(){vec3 color=Z<.5?hull:Z<1.5?accent:Z<2.5?vec3(.1,.35,.5):accent*1.6+vec3(.15);float l=.38+.62*max(0.,dot(normalize(N),normalize(vec3(-.3,.8,.5))));gl_FragColor=vec4(color*(Z>2.5?1.:l),1.);}');
 const loc=Object.fromEntries(['p','n','zone','offset','orient'].map(k=>[k,gl.getAttribLocation(hullProgram,k)])),u=Object.fromEntries(['vp','hull','accent','style'].map(k=>[k,gl.getUniformLocation(hullProgram,k)]));
 const verts=[];
 function box(x,y,z,w,h,d,zone){for(const [normal,axis]of [[[1,0,0],0],[[-1,0,0],0],[[0,1,0],1],[[0,-1,0],1],[[0,0,1],2],[[0,0,-1],2]]){const other=[0,1,2].filter(i=>i!==axis),points=[[-1,-1],[1,-1],[1,1],[-1,1]].map(([a,b])=>{const v=[0,0,0];v[axis]=normal[axis];v[other[0]]=a;v[other[1]]=b;return[x+v[0]*w/2,y+v[1]*h/2,z+v[2]*d/2];});for(const i of [0,1,2,0,2,3])verts.push(...points[i],...normal,zone);}}
 box(0,0,0,5,2.3,19,0);box(0,.5,8.8,3,1.6,5,0);box(0,1.65,4,3.5,1.2,3,2);box(0,2,-2,3,.8,4,0);box(0,2.6,-3,.5,.4,.7,1);
 for(const side of [-1,1]){box(side*5,-.3,-1,6,.7,7,0);box(side*6.8,.1,-2,1.7,1.2,3.8,1);box(side*1.8,0,-10,1.3,1.3,1.8,0);box(side*1.8,0,-11,1,1,.15,3);box(side*2.8,.7,0,.22,.3,13,1);box(side*2.4,1.35,2,.45,.5,1.8,0);}
 const geometry=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,geometry);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(verts),gl.STATIC_DRAW);const instances=gl.createBuffer();
 const lineProgram=program('attribute vec3 p,color;uniform mat4 vp;varying vec3 C;void main(){C=color;gl_Position=vp*vec4(p,1.);}','precision mediump float;varying vec3 C;void main(){gl_FragColor=vec4(C,1.);}'),lineP=gl.getAttribLocation(lineProgram,'p'),lineColor=gl.getAttribLocation(lineProgram,'color'),lineVP=gl.getUniformLocation(lineProgram,'vp'),lineBuffer=gl.createBuffer();
 function draw(ships,vp,origin,palettes,shots=[]){
  const previous=gl.getParameter(gl.CURRENT_PROGRAM);let count=0,batches=0;
  gl.useProgram(hullProgram);gl.enable(gl.DEPTH_TEST);gl.disable(gl.CULL_FACE);gl.uniformMatrix4fv(u.vp,false,vp);
  for(const faction of [...new Set(ships.map(v=>v.faction))]){const style=({CUSTOM:0,CHOMPY:1,HUMAN:2,RESISTANCE:3,ERISIAN:3,TERRA:2,GREK:0,CATHARSIS:2})[faction]??0;
   const list=ships.filter(v=>v.faction===faction&&v.hp>0&&Math.hypot(...v.position.map((p,i)=>p-origin[i]))<14000);if(!list.length)continue;
   const color=palettes[faction]||{hull:[.02,.04,.06],accent:[.05,.95,1]};gl.uniform3fv(u.hull,color.hull);gl.uniform3fv(u.accent,color.accent);gl.uniform1f(u.style,style);
   gl.bindBuffer(gl.ARRAY_BUFFER,geometry);for(const [name,size,offset]of [['p',3,0],['n',3,12],['zone',1,24]]){gl.enableVertexAttribArray(loc[name]);gl.vertexAttribPointer(loc[name],size,gl.FLOAT,false,28,offset);if(inst)inst.vertexAttribDivisorANGLE(loc[name],0);}
   if(inst){const data=new Float32Array(list.length*6);for(let i=0;i<list.length;i++){const v=list[i];data.set([...v.position.map((p,j)=>p-origin[j]),v.yaw||0,v.pitch||0,v.size||1],i*6);}gl.bindBuffer(gl.ARRAY_BUFFER,instances);gl.bufferData(gl.ARRAY_BUFFER,data,gl.DYNAMIC_DRAW);for(const [name,offset]of [['offset',0],['orient',12]]){gl.enableVertexAttribArray(loc[name]);gl.vertexAttribPointer(loc[name],3,gl.FLOAT,false,24,offset);inst.vertexAttribDivisorANGLE(loc[name],1);}inst.drawArraysInstancedANGLE(gl.TRIANGLES,0,verts.length/7,list.length);for(const name of ['offset','orient']){inst.vertexAttribDivisorANGLE(loc[name],0);gl.disableVertexAttribArray(loc[name]);}batches++;}
   else{gl.disableVertexAttribArray(loc.offset);gl.disableVertexAttribArray(loc.orient);for(const v of list){gl.vertexAttrib3fv(loc.offset,v.position.map((p,i)=>p-origin[i]));gl.vertexAttrib3f(loc.orient,v.yaw||0,v.pitch||0,v.size||1);gl.drawArrays(gl.TRIANGLES,0,verts.length/7);batches++;}}
   count+=list.length;
  }
  if(shots.length){const data=[];for(const shot of shots)for(const point of [shot.from,shot.to])data.push(...point.map((p,i)=>p-origin[i]),...shot.color);gl.useProgram(lineProgram);gl.uniformMatrix4fv(lineVP,false,vp);gl.bindBuffer(gl.ARRAY_BUFFER,lineBuffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(data),gl.DYNAMIC_DRAW);for(const [attr,offset]of [[lineP,0],[lineColor,12]]){gl.enableVertexAttribArray(attr);gl.vertexAttribPointer(attr,3,gl.FLOAT,false,24,offset);}gl.drawArrays(gl.LINES,0,data.length/6);}
  for(const attr of Object.values(loc))gl.disableVertexAttribArray(attr);gl.disableVertexAttribArray(lineP);gl.disableVertexAttribArray(lineColor);gl.useProgram(previous);return{count,batches,instanced:!!inst};
 }
 return draw;
}

function createJaniraMontageRenderer(canvas){
 const gl=canvas.getContext('webgl',{alpha:false,antialias:true});if(!gl)throw Error('WebGL unavailable');const fleet=createJaniraArmadaRenderer(gl);
 const mul=(a,b)=>{const r=Array(16).fill(0);for(let c=0;c<4;c++)for(let i=0;i<4;i++)for(let k=0;k<4;k++)r[c*4+i]+=a[k*4+i]*b[c*4+k];return r;};
 const starProgram=gl.createProgram();for(const [type,source]of [[gl.VERTEX_SHADER,'attribute vec3 p;uniform mat4 vp;void main(){gl_Position=vp*vec4(p,1.);gl_PointSize=1.8;}'],[gl.FRAGMENT_SHADER,'precision mediump float;void main(){gl_FragColor=vec4(.5,.65,1.,1.);}']]){const sh=gl.createShader(type);gl.shaderSource(sh,source);gl.compileShader(sh);gl.attachShader(starProgram,sh);}gl.linkProgram(starProgram);const attr=gl.getAttribLocation(starProgram,'p'),vpLoc=gl.getUniformLocation(starProgram,'vp'),stars=gl.createBuffer(),points=[];for(let i=0;i<1500;i++){const a=i*2.39996,z=(i/1500*2-1)*11000,r=Math.sqrt(11000**2-z*z);points.push(Math.cos(a)*r,z,Math.sin(a)*r);}gl.bindBuffer(gl.ARRAY_BUFFER,stars);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(points),gl.STATIC_DRAW);
 return(s,t)=>{
  const w=Math.max(1,Math.round(canvas.clientWidth*Math.min(devicePixelRatio,1.5))),h=Math.max(1,Math.round(canvas.clientHeight*Math.min(devicePixelRatio,1.5)));if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}gl.viewport(0,0,w,h);gl.clearColor(.003,.005,.023,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.enable(gl.DEPTH_TEST);
  const shot=Math.min(2,Math.floor(t/6)),u=t%6,eye=[130+Math.sin(t*.08)*40,80,-360+t*7],target=[0,30,-100+t*10],f=1/Math.tan(.88/2),projection=[f*h/w,0,0,0,0,f,0,0,0,0,-1.00002,-1,0,0,-2,0],vp=mul(projection,NVRenderMath.view(eye,target));
  gl.useProgram(starProgram);gl.uniformMatrix4fv(vpLoc,false,vp);gl.bindBuffer(gl.ARRAY_BUFFER,stars);gl.enableVertexAttribArray(attr);gl.vertexAttribPointer(attr,3,gl.FLOAT,false,0,0);gl.drawArrays(gl.POINTS,0,points.length/3);gl.disableVertexAttribArray(attr);
  const ships=NVJaniraArmada.montageShips(s,t),palettes=Object.fromEntries(NVJaniraArmada.GROUPS.map(g=>[g.faction,NVJaniraArmada.palette(s,g.faction)]));
  const stats=fleet(ships,vp,[0,0,0],palettes,[]);canvas.dataset.stage='montage';canvas.dataset.ships=String(stats.count);canvas.dataset.batches=String(stats.batches);canvas.dataset.montageShot=String(shot);
 };
}
