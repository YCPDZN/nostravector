from pathlib import Path
w=Path('work');s=(w/'grek_renderer.js').read_text(encoding='utf-8')
s=s.replace('function createGrekRenderer(canvas,model=GrekModel,options={}){', '''function createOrionCommsRenderer(canvas){
  const options={camera:[0,-1.48,-1.1]},model={meshes:ORION_PARTS.map(p=>({...p,p:p.p.flat(),n:p.n.flat(),indices:p.f||p.indices,color:p.c||p.color,bone:'body'}))};
  const p=[],n=[],indices=[],rows=12,cols=24;
  for(let i=0;i<=rows;i++)for(let j=0;j<=cols;j++){const t=i/rows*Math.PI,a=j/cols*2*Math.PI,v=[Math.sin(t)*Math.cos(a),Math.cos(t),Math.sin(t)*Math.sin(a)];p.push(...v);n.push(...v);}
  for(let i=0;i<rows;i++)for(let j=0;j<cols;j++){const a=i*(cols+1)+j,b=a+cols+1;indices.push(a,a+1,b,a+1,b+1,b);}
  model.meshes.push({name:'comms-speaking-mouth',p,n,indices,color:[.12,.055,.047],bone:'body'});
''')
s=s.replace("    for(const m of meshes){for(const key", """    const lip={jaw:paused?0:Math.max(0,Math.min(1,pose.jaw||0)),width:pose.width||1,round:pose.round||0,teeth:pose.teeth||0};
    const drawPart=(m,transform,color=m.color)=>{for(const key""")
s=s.replace('gl.uniformMatrix4fv(loc.model,false,transforms[m.bone]||body);gl.uniform3fv(loc.color,m.color);','gl.uniformMatrix4fv(loc.model,false,transform);gl.uniform3fv(loc.color,color);')
s=s.replace('gl.drawElements(gl.TRIANGLES,m.indices.length,gl.UNSIGNED_SHORT,0);}', '''gl.drawElements(gl.TRIANGLES,m.indices.length,gl.UNSIGNED_SHORT,0);};
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
''')
s=s.replace("$('#grekRenderStatus').textContent='3D preview interrupted. Dialogue remains available.';", "canvas.dataset.renderStatus='context-lost';")
(w/'orion_comms_renderer.js').write_text(s,encoding='utf-8')
p=w/'mascar_combat_ui.js';s=p.read_text(encoding='utf-8').replace("createOrionReliefPortrait($('#mascarOrbitalPortrait'),{camera:[0,-1.48,-1.1]})", "createOrionCommsRenderer($('#mascarOrbitalPortrait'))").replace('{open:pose.jaw||0,round:pose.round||0},false','pose,false');p.write_text(s,encoding='utf-8')
p=w/'orion_boss_recordings.js';s=p.read_text(encoding='utf-8');s=s.replace(' function lip(){if(!speaking())return{jaw:0,width:1,round:0,teeth:0};', " let lipPose={jaw:0,width:1,round:0,teeth:0},lipClock=performance.now(),lipKey='';\n function lip(){const now=performance.now(),dt=Math.max(0,Math.min(.1,(now-lipClock)/1000));lipClock=now;if(!speaking()){lipKey='';return lipPose={jaw:0,width:1,round:0,teeth:0};}")
s=s.replace('return janiraRallyRecordedViseme(r.a,prepareJamesAcoustics(r.a),text);}', "const target=janiraRallyRecordedViseme(r.a,prepareJamesAcoustics(r.a),text);if(lipKey!==state.key){lipPose={jaw:0,width:1,round:0,teeth:0};lipKey=state.key;}const mix=Math.min(1,dt*20);for(const key of Object.keys(target))lipPose[key]+=(target[key]-lipPose[key])*mix;return lipPose;}")
p.write_text(s,encoding='utf-8')
p=w/'build_menu.py';s=p.read_text(encoding='utf-8').replace("js+='\\n'+(work/'mascar_combat_ui.js')", "js+='\\n'+(work/'orion_comms_renderer.js').read_text(encoding='utf-8')\njs+='\\n'+(work/'mascar_combat_ui.js')");p.write_text(s,encoding='utf-8')
p=w/'package_menu.py';s=p.read_text(encoding='utf-8').replace("'mascar_combat_ui.js']", "'mascar_combat_ui.js','orion_comms_renderer.js']");p.write_text(s,encoding='utf-8')
