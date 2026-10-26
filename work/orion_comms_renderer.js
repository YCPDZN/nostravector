function createOrionCommsRenderer(canvas){
  const options={camera:[0,-1.48,-1.1]},model={meshes:ORION_IMPERIAL_PARTS.map(p=>({...p,p:p.p.flat(),n:p.n.flat(),indices:p.f||p.indices,color:p.c||p.color,bone:'body'}))};
  const mouthPositions=[],n=[],indices=[],rows=12,cols=24;
  for(let i=0;i<=rows;i++)for(let j=0;j<=cols;j++){const t=i/rows*Math.PI,a=j/cols*2*Math.PI,v=[Math.sin(t)*Math.cos(a),Math.cos(t),Math.sin(t)*Math.sin(a)];mouthPositions.push(...v);n.push(...v);}
  for(let i=0;i<rows;i++)for(let j=0;j<cols;j++){const a=i*(cols+1)+j,b=a+cols+1;indices.push(a,a+1,b,a+1,b+1,b);}
  model.meshes.push({name:'comms-speaking-mouth',p:mouthPositions,n,indices,color:[.12,.055,.047],bone:'body'});

  const gl=canvas.getContext('webgl',{alpha:true,antialias:true,premultipliedAlpha:false});if(!gl)throw Error('WebGL is unavailable.');
  const M={identity:()=>[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],mul:(a,b)=>{const r=Array(16).fill(0);for(let c=0;c<4;c++)for(let i=0;i<4;i++)for(let k=0;k<4;k++)r[c*4+i]+=a[k*4+i]*b[c*4+k];return r;},t:(x,y,z)=>[1,0,0,0,0,1,0,0,0,0,1,0,x,y,z,1],s:(x,y,z)=>[x,0,0,0,0,y,0,0,0,0,z,0,0,0,0,1],ry:a=>[Math.cos(a),0,-Math.sin(a),0,0,1,0,0,Math.sin(a),0,Math.cos(a),0,0,0,0,1],rx:a=>[1,0,0,0,0,Math.cos(a),Math.sin(a),0,0,-Math.sin(a),Math.cos(a),0,0,0,0,1]};
  const p=gl.createProgram();for(const [type,source]of[[gl.VERTEX_SHADER,'attribute vec3 position,normal;uniform mat4 vp,model;varying vec3 N,W;void main(){vec4 w=model*vec4(position,1.);W=w.xyz;N=normalize((model*vec4(normal,0.)).xyz);gl_Position=vp*w;}'],[gl.FRAGMENT_SHADER,'precision highp float;varying vec3 N,W;uniform vec3 color;uniform float glow;void main(){vec3 n=normalize(N),v=normalize(vec3(0.,3.2,7.)-W);float key=max(dot(n,normalize(vec3(-.8,1.,1.5))),0.);float fill=max(dot(n,normalize(vec3(1.,.2,.3))),0.);float rim=pow(1.-max(dot(n,v),0.),3.);float spec=pow(max(dot(reflect(-normalize(vec3(-.8,1.,1.5)),n),v),0.),32.);vec3 light=vec3(.29,.32,.40)+vec3(.94,.79,.61)*key*.8+vec3(.28,.38,.67)*fill*.4;gl_FragColor=vec4(color*light+vec3(.30,.16,.47)*rim+vec3(.26)*spec+color*glow,1.);}']]){const sh=gl.createShader(type);gl.shaderSource(sh,source);gl.compileShader(sh);if(!gl.getShaderParameter(sh,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(sh));gl.attachShader(p,sh);}gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(p));
  const loc={position:gl.getAttribLocation(p,'position'),normal:gl.getAttribLocation(p,'normal'),vp:gl.getUniformLocation(p,'vp'),model:gl.getUniformLocation(p,'model'),color:gl.getUniformLocation(p,'color'),glow:gl.getUniformLocation(p,'glow')};
  const meshes=model.meshes.map(m=>{const buffers={};for(const [key,array]of[['position',m.p],['normal',m.n],['indices',m.indices]]){buffers[key]=gl.createBuffer();gl.bindBuffer(key==='indices'?gl.ELEMENT_ARRAY_BUFFER:gl.ARRAY_BUFFER,buffers[key]);gl.bufferData(key==='indices'?gl.ELEMENT_ARRAY_BUFFER:gl.ARRAY_BUFFER,key==='indices'?new Uint16Array(array):new Float32Array(array),gl.STATIC_DRAW);}return{...m,buffers};});
  function pivot(transform,point){return M.mul(M.t(...point),M.mul(transform,M.t(...point.map(v=>-v))));}
  const render=(time,pose={},paused=false)=>{
    const bounds=canvas.getBoundingClientRect(),w=Math.max(1,Math.round(bounds.width*Math.min(window.devicePixelRatio||1,2))),h=Math.max(1,Math.round(bounds.height*Math.min(window.devicePixelRatio||1,2)));if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}gl.viewport(0,0,w,h);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.enable(gl.DEPTH_TEST);gl.useProgram(p);
    const f=1/Math.tan(.67/2),aspect=w/h,projection=[f/aspect,0,0,0,0,f,0,0,0,0,-1.002,-1,0,0,-.2002,0];
    const view=M.t(...(options.camera||[0,-2.85,-6.9])),vp=M.mul(projection,view);gl.uniformMatrix4fv(loc.vp,false,vp);
    const body=M.mul(M.ry(.10+Math.sin(time*.29)*.045),M.t(0,Math.sin(time*1.4)*.016,0));
    const head=M.mul(body,pivot(M.mul(M.ry(Math.sin(time*.41)*.035),M.rx(Math.sin(time*.62)*.018)),model.headPivot||[0,3.12,0]));
    const opening=paused?0:Math.max(0,Math.min(1,pose.open||0)),round=paused?0:Math.max(0,Math.min(1,pose.round||0));
    const jaw=M.mul(head,pivot(M.rx(opening*.29),(model.jawPivot||[0,3.25,.4])));
    const blink=Math.pow(Math.max(0,Math.cos(time*1.17)),80),eye=M.mul(head,pivot(M.s(1,1-blink*.96,1),model.eyePivot||[0,3.66,0]));
    const transforms={body,head,jaw,eyes:eye,upperLip:M.mul(head,pivot(M.s(1-round*.20,1+round*.25,1+round*.25),model.upperLipPivot||[0,3.40,.57])),lowerLip:M.mul(jaw,pivot(M.s(1-round*.20,1+round*.25,1+round*.25),model.lowerLipPivot||[0,3.27,.57]))};
    transforms.teeth=M.mul(head,pivot(M.s(1,Math.max(.01,opening),1),model.teethPivot||[0,3.40,.57]));
    const lip={jaw:paused?0:Math.max(0,Math.min(1,pose.jaw||0)),width:pose.width||1,round:pose.round||0,teeth:pose.teeth||0};
    const drawPart=(m,transform,color=m.color)=>{for(const key of ['position','normal']){gl.bindBuffer(gl.ARRAY_BUFFER,m.buffers[key]);gl.enableVertexAttribArray(loc[key]);gl.vertexAttribPointer(loc[key],3,gl.FLOAT,false,0,0);}gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,m.buffers.indices);gl.uniformMatrix4fv(loc.model,false,transform);gl.uniform3fv(loc.color,color);gl.uniform1f(loc.glow,m.name.startsWith('eye ')? .23:0);gl.drawElements(gl.TRIANGLES,m.indices.length,gl.UNSIGNED_SHORT,0);};
    const mouth=meshes.find(m=>m.name==='comms-speaking-mouth');
    for(const m of meshes){
      if(m===mouth)continue;
      if(m.name==='Mouth neutral'&&lip.jaw>.025){
        const width=.056*lip.width,height=.003+.026*lip.jaw,y=1.551-.016*lip.jaw;
        const oval=(x,y,z,w,h,d,color)=>drawPart(mouth,M.mul(body,M.mul(M.t(x,y,z),M.s(w,h,d))),color);
        oval(0,y,.191,width,height,.010,[.12,.055,.047]);
        oval(0,y+height,.198,width,.0035,.004,[.56,.29,.19]);
        oval(0,y-height,.199,width*.95,.004,.004,[.65,.35,.24]);
        if(lip.jaw>.11){oval(0,y+height*.55,.201,width*.78,.0035*lip.teeth+.001,.002,[.91,.88,.80]);oval(0,y-height*.58,.201,width*.55,height*.22,.002,[.66,.27,.27]);}
        continue;
      }
      let transform=body;
      if(m.name==='Jaw'||/beard|strand/i.test(m.name))transform=M.mul(body,M.t(0,-.024*lip.jaw,.003*lip.round));
      if(m.name==='Face'){
        const positions=m.p.map((v,i)=>i%3===1?v-.023*lip.jaw*Math.max(0,Math.min(1,(1.57-v)/.14)):v);
        gl.bindBuffer(gl.ARRAY_BUFFER,m.buffers.position);gl.bufferSubData(gl.ARRAY_BUFFER,0,new Float32Array(positions));
      }
      drawPart(m,transform);
    }
    canvas.dataset.jaw=String(lip.jaw);canvas.dataset.mouthMode=lip.jaw>.025?'shaped':'neutral';canvas.dataset.width=String(lip.width);

  };
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();canvas.dataset.renderStatus='context-lost';});
  return render;
}
