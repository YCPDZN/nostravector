from pathlib import Path
f=Path(__file__).resolve().parent/'antarctica_renderer.js';s=f.read_text(encoding='utf-8')
s=s.replace('uniform float yaw,pitch,time;uniform vec3 fog;', 'uniform float yaw,pitch,time,severity;uniform vec3 fog;')
s=s.replace('vec3 cloud=mix(tex,fog,.65+front*.12);', 'vec3 cloud=mix(tex,fog,mix(.65+front*.12,.98,severity));')
s=s.replace("['sky','yaw','pitch','time','fog']", "['sky','yaw','pitch','time','fog','severity']")
s=s.replace('uniform float dpr;varying mediump float opacity;', 'uniform float dpr,severity;varying mediump float opacity;')
s=s.replace('clamp(42./max(.2,gl_Position.w),1.1,6.)*dpr;opacity=clamp(1.-gl_Position.w/45.,.08,.60);', 'clamp(mix(42.,65.,severity)/max(.2,gl_Position.w),1.3,9.)*dpr;opacity=clamp(1.-gl_Position.w/32.,.12,mix(.60,.86,severity));')
s=s.replace('length(q*vec2(1.8,.8))', 'length(vec2(q.x*.84+q.y*.55,-q.x*.55+q.y*.84)*vec2(.65,2.1))')
s=s.replace("dpr:c.getUniformLocation(flakeProgram,'dpr')", "dpr:c.getUniformLocation(flakeProgram,'dpr'),severity:c.getUniformLocation(flakeProgram,'severity')")
marker='  function buffer(target,data,usage=c.STATIC_DRAW)'
insert='''  const whiteoutProgram=program(`attribute vec2 p;varying vec2 uv;void main(){uv=p*.5+.5;gl_Position=vec4(p,0.,1.);}`,`precision mediump float;varying vec2 uv;uniform float time,severity;uniform vec3 fog;void main(){float drift=sin(uv.y*31.+uv.x*9.+time*5.7)*.5+.5;float curl=sin(uv.y*13.-uv.x*7.-time*2.1)*.5+.5;float gust=.5+.5*sin(time*1.4);float a=severity*(.055+.09*drift+.07*curl+.07*gust);gl_FragColor=vec4(fog,a);}`);
  const whiteoutLoc={p:c.getAttribLocation(whiteoutProgram,'p'),time:c.getUniformLocation(whiteoutProgram,'time'),severity:c.getUniformLocation(whiteoutProgram,'severity'),fog:c.getUniformLocation(whiteoutProgram,'fog')};
'''
assert marker in s;s=s.replace(marker,insert+marker)
s=s.replace('const flakeCount=2300,', 'const flakeCount=8000,')
old='const severity=s.superBlizzard?1:0;const vp=M.mul(M.perspective(Math.PI/3.05,w/h,.12,1300),lookAt(eye,target)),storm=.5+.5*Math.sin(time*.031),fog=[.53+storm*.035,.65+storm*.027,.73+storm*.024],inside=Math.abs(s.x-A.STATION.x)<5.6&&Math.abs(s.z-A.STATION.z)<5.0;'
new='const inside=A.inShelter(s),severity=inside?0:s.superBlizzard?1:.45,gust=.5+.5*Math.sin(time*1.4)+.15*Math.sin(time*3.7);const vp=M.mul(M.perspective(Math.PI/3.05,w/h,.12,1300),lookAt(eye,target)),storm=.5+.5*Math.sin(time*.031),fog=s.superBlizzard?[.77+gust*.025,.82+gust*.02,.85+gust*.018]:[.65+storm*.035,.73+storm*.027,.79+storm*.024],fogRange=inside?140:s.superBlizzard?12-gust*3.5:38-storm*12;'
assert old in s;s=s.replace(old,new)
s=s.replace('c.uniform1f(skyLoc.u.time,time);', 'c.uniform1f(skyLoc.u.time,time);c.uniform1f(skyLoc.u.severity,severity);')
s=s.replace('190-storm*50-severity*100', 'fogRange')
start=s.index('    if(!inside){for(let i=0;i<flakeCount;i++)');end=s.index('    if(++cachedFrame',start)
s=s[:start]+'''    if(!inside){
      const count=s.superBlizzard?flakeCount:3200,span=s.superBlizzard?36:52;
      for(let i=0;i<count;i++){const hx=A.hash(i,17,s.seed),hz=A.hash(i,31,s.seed),hy=A.hash(i,47,s.seed),wrap=(x,n)=>(x%n+n)%n;flakeData[i*3]=eye[0]+wrap(hx*span-time*(12+hx*8+severity*18),span)-span/2;flakeData[i*3+1]=eye[1]+wrap(hy*15-time*(5+hz*5),15)-5;flakeData[i*3+2]=eye[2]+wrap(hz*span+time*(5+severity*10),span)-span/2;}
      c.useProgram(flakeProgram);c.uniformMatrix4fv(flakeLoc.vp,false,vp);c.uniform1f(flakeLoc.dpr,dpr);c.uniform1f(flakeLoc.severity,severity);c.bindBuffer(c.ARRAY_BUFFER,flakeBuffer);c.bufferSubData(c.ARRAY_BUFFER,0,flakeData.subarray(0,count*3));c.enableVertexAttribArray(flakeLoc.p);c.vertexAttribPointer(flakeLoc.p,3,c.FLOAT,false,0,0);c.enable(c.BLEND);c.blendFunc(c.SRC_ALPHA,c.ONE_MINUS_SRC_ALPHA);c.depthMask(false);c.drawArrays(c.POINTS,0,count);
      c.disable(c.DEPTH_TEST);c.useProgram(whiteoutProgram);c.bindBuffer(c.ARRAY_BUFFER,quad);c.enableVertexAttribArray(whiteoutLoc.p);c.vertexAttribPointer(whiteoutLoc.p,2,c.FLOAT,false,0,0);c.uniform1f(whiteoutLoc.time,time);c.uniform1f(whiteoutLoc.severity,severity);c.uniform3fv(whiteoutLoc.fog,fog);c.drawArrays(c.TRIANGLES,0,6);c.depthMask(true);c.disable(c.BLEND);
    }
'''+s[end:]
f.write_text(s,encoding='utf-8')
