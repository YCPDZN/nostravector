// Procedural geometry only: no portrait, billboard, or texture is used for the visitor.
const GrekModel=(()=>{
  const meshes=[],skin=[.48,.46,.38],ridge=[.37,.36,.30],metal=[.20,.31,.39],trim=[.56,.39,.20],dark=[.045,.065,.08],beard=[.16,.12,.085],ivory=[.78,.70,.51];
  function ellipsoid(name,center,size,color,bone='body',segments=20,rings=14){
    const p=[],n=[],indices=[];
    for(let j=0;j<=rings;j++)for(let i=0;i<=segments;i++){
      const a=i/segments*Math.PI*2,b=j/rings*Math.PI,q=[Math.sin(b)*Math.cos(a),Math.cos(b),Math.sin(b)*Math.sin(a)];
      p.push(...q.map((v,k)=>center[k]+v*size[k]));const normal=q.map((v,k)=>v/size[k]),l=Math.hypot(...normal);n.push(...normal.map(v=>v/l));
    }
    for(let j=0;j<rings;j++)for(let i=0;i<segments;i++){const a=j*(segments+1)+i,b=a+segments+1;indices.push(a,b,a+1,a+1,b,b+1);}
    meshes.push({name,p,n,indices,color,bone});
  }
  function tube(name,points,radii,color,bone='body',sides=12){
    const p=[],n=[],indices=[];
    for(let j=0;j<points.length;j++){
      const before=points[Math.max(0,j-1)],after=points[Math.min(points.length-1,j+1)],v=after.map((x,k)=>x-before[k]),l=Math.hypot(...v),t=v.map(x=>x/l);
      let u=Math.abs(t[1])<.9?[-t[2],0,t[0]]:[1,0,0];const ul=Math.hypot(...u);u=u.map(x=>x/ul);
      const w=[t[1]*u[2]-t[2]*u[1],t[2]*u[0]-t[0]*u[2],t[0]*u[1]-t[1]*u[0]];
      for(let i=0;i<=sides;i++){const a=i/sides*Math.PI*2,q=u.map((x,k)=>x*Math.cos(a)+w[k]*Math.sin(a));p.push(...q.map((x,k)=>points[j][k]+x*radii[j]));n.push(...q);}
    }
    for(let j=0;j<points.length-1;j++)for(let i=0;i<sides;i++){const a=j*(sides+1)+i,b=a+sides+1;indices.push(a,b,a+1,a+1,b,b+1);}
    meshes.push({name,p,n,indices,color,bone});
  }
  // Broad armoured body, jointed limbs and articulated fingers.
  ellipsoid('undersuit',[0,2.08,0],[.69,.96,.39],dark);
  ellipsoid('breastplate rim',[0,2.55,.04],[.88,.73,.47],trim);
  ellipsoid('breastplate',[0,2.55,.26],[.81,.65,.40],metal);
  ellipsoid('belly armour',[0,1.94,.12],[.61,.33,.36],metal);
  for(let s of [-1,1]){
    ellipsoid('shoulder rim '+s,[s*.99,2.84,0],[.55,.47,.49],trim);
    ellipsoid('shoulder plate '+s,[s*.99,2.84,.23],[.484,.414,.431],metal);
    ellipsoid('upper arm '+s,[s*1.19,2.38,0],[.31,.43,.30],dark);
    ellipsoid('elbow '+s,[s*1.26,2.08,.06],[.31,.24,.32],trim);
    ellipsoid('gauntlet '+s,[s*1.30,1.80,.15],[.34,.43,.35],metal);
    ellipsoid('hand '+s,[s*1.33,1.40,.22],[.28,.28,.21],skin);
    for(let f=0;f<4;f++)ellipsoid('finger '+s+' '+f,[s*(1.14+f*.12),1.17,.26],[.073,.20,.075],skin);
    ellipsoid('thumb '+s,[s*1.04,1.43,.29],[.10,.20,.11],skin);
    ellipsoid('thigh '+s,[s*.40,1.35,0],[.35,.53,.31],dark);
    ellipsoid('knee rim '+s,[s*.43,.96,.10],[.35,.27,.36],trim);
    ellipsoid('knee plate '+s,[s*.43,.99,.20],[.28,.21,.30],metal);
    ellipsoid('shin '+s,[s*.46,.56,.02],[.29,.40,.28],metal);
    ellipsoid('boot '+s,[s*.47,.17,.22],[.36,.19,.48],dark);
    ellipsoid('boot toe '+s,[s*.47,.22,.42],[.34,.13,.30],metal);
    for(let k=0;k<3;k++)ellipsoid('shoulder rivet '+s+' '+k,[s*(.77+k*.15),3.06,.58],[.044,.044,.035],ivory);
    for(let k=0;k<2;k++)ellipsoid('chest bolt '+s+' '+k,[s*.57,2.6-k*.32,.56],[.043,.043,.026],trim);
    tube('strap '+s,[[s*.65,3.03,.55],[s*.57,2.76,.65],[s*.37,2.25,.67]],[.07,.07,.07],beard);
  }
  ellipsoid('belt',[0,1.74,.06],[.70,.16,.40],beard);
  ellipsoid('belt buckle',[0,1.74,.46],[.17,.115,.04],trim);
  ellipsoid('neck',[0,3.12,.03],[.40,.36,.33],skin,'head');
  ellipsoid('cranium',[0,3.77,0],[.57,.65,.43],skin,'head',32,24);
  ellipsoid('forehead',[0,4.03,.24],[.50,.28,.28],skin,'head');
  for(let s of [-1,1]){
    tube('pointed ear '+s,[[s*.46,3.78,.01],[s*.68,3.88,0],[s*.83,4.07,-.03]],[.20,.13,.003],skin,'head');
    tube('ear fold '+s,[[s*.53,3.81,.16],[s*.68,3.91,.11],[s*.80,4.04,.01]],[.045,.038,.002],ridge,'head');
    ellipsoid('cheek '+s,[s*.37,3.51,.27],[.23,.27,.27],skin,'head');
    ellipsoid('cheek ridge '+s,[s*.36,3.61,.43],[.22,.075,.09],ridge,'head');
    for(let row=0;row<2;row++){
      const y=3.77-row*.20,x=s*(.23+row*.02),z=.40+row*.07;
      ellipsoid('eye socket '+s+' '+row,[x,y,z],[.19,.105,.07],ridge,'head');
      ellipsoid('eye '+s+' '+row,[x,y,z+.044],[.115,.054,.038],[.90,.59,.13],'eyes');
      ellipsoid('pupil '+s+' '+row,[x-s*.012,y,z+.080],[.018,.044,.010],dark,'eyes');
      ellipsoid('eye glint '+s+' '+row,[x-.025,y+.017,z+.088],[.009,.009,.006],[1,.91,.61],'eyes');
      tube('brow '+s+' '+row,[[s*.09,y+.09,z+.04],[x,y+.10,z+.08],[s*.40,y+.06,z]],[.045,.064,.03],skin,'head');
    }
  }
  ellipsoid('nose bridge',[0,3.70,.43],[.14,.25,.16],skin,'head');
  ellipsoid('nose',[0,3.48,.58],[.19,.115,.13],skin,'head');
  for(let s of [-1,1])ellipsoid('nostril '+s,[s*.115,3.46,.685],[.043,.025,.017],dark,'head');
  // The cavity stays behind independent upper/lower lips; jaw, lower teeth and tusks move together.
  ellipsoid('mouth cavity',[0,3.30,.48],[.32,.19,.085],[.055,.025,.027],'head');
  ellipsoid('upper lip',[0,3.40,.57],[.29,.054,.055],ridge,'upperLip');
  ellipsoid('lower jaw',[0,3.21,.21],[.44,.22,.38],skin,'jaw');
  ellipsoid('lower lip',[0,3.27,.57],[.29,.058,.055],ridge,'lowerLip');
  for(let i=0;i<7;i++){
    ellipsoid('upper tooth '+i,[(i-3)*.067,3.355,.574],[.029,.035,.026],ivory,'head');
    ellipsoid('lower tooth '+i,[(i-3)*.065,3.295,.574],[.028,.026,.026],ivory,'jaw');
  }
  for(let s of [-1,1])tube('curved tusk '+s,[[s*.29,3.22,.53],[s*.45,3.26,.66],[s*.62,3.37,.68],[s*.73,3.55,.62],[s*.76,3.70,.56]],[.115,.105,.075,.035,.002],ivory,'jaw',16);
  for(let k=0;k<3;k++)tube('forehead furrow '+k,[[-.30,3.97+k*.07,.43],[-.16,3.95+k*.07,.50],[0,3.98+k*.07,.52],[.16,3.95+k*.07,.50],[.30,3.97+k*.07,.43]],[.012,.012,.016,.012,.012],ridge,'head');
  for(let b=-2;b<=2;b++){
    const x=b*.135,len=.63-Math.abs(b)*.12;
    tube('beard braid '+b,[[x,3.19,.60],[x*1.15,2.99,.72],[x*.88,3.19-len,.72]],[.092,.075,.018],beard,'jaw');
    for(let j=0;j<6;j++)ellipsoid('braid weave '+b+' '+j,[x+Math.sin(j*2.8)*.026,3.13-j*len/6,.67+j*.02],[.07,.062,.033],j%2?[.20,.15,.10]:beard,'jaw',12,8);
    ellipsoid('braid clasp '+b,[x*.88,3.21-len,.72],[.046,.053,.049],trim,'jaw');
  }
  return {meshes,jawPivot:[0,3.32,.19]};
})();
