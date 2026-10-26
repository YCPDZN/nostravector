// Independent surface identities. Only five-floor navigation is shared with Carax.
const NVFortressAppearance=(()=>{
 const IDS=['carax','alt-zerry','obra-spira'],UNIQUE=['alt-zerry','obra-spira'];
 const styles={
  carax:{id:'carax',steel:[.065,.065,.085],edge:[.25,.22,.28],light:[.80,.07,.14],floor:[.16,.15,.19]},
  'alt-zerry':{id:'alt-zerry',steel:[.48,.55,.59],edge:[.72,.77,.74],light:[.08,.75,.82],floor:[.32,.40,.43]},
  'obra-spira':{id:'obra-spira',steel:[.055,.07,.075],edge:[.24,.21,.15],light:[1,.49,.075],floor:[.14,.16,.16]}
 };
 Object.assign(NVSol.byId['alt-zerry'],{color:[.51,.61,.65],terrain:[.39,.49,.53],sky:[.002,.006,.012],style:'rock',atmosphere:false,gravity:.58,note:'Airless fortress world. Silver terraces and pale mineral ridges surround an ivory orbital citadel, teal beacon towers and concentric habitation districts. Five floors and three governor slots.'});
 Object.assign(NVSol.byId['obra-spira'],{color:[.16,.19,.17],terrain:[.13,.16,.15],sky:[.003,.002,.001],style:'rock',atmosphere:false,gravity:.82,note:'Airless fortress world. Black basalt spires rise above deep fault valleys. An amber-lit bastion and terraced industrial strongholds guard its five-floor fortress. Three governor slots.'});
 NVLandscapes.profiles['alt-zerry']={id:'alt-zerry',title:'ALT-ZERRY / SILVER TERRACE CITADEL',kind:'ridge',height:48,scale:310,accent:[.58,.77,.81],feature:'boulder',code:7,angle:.22};
 NVLandscapes.profiles['obra-spira']={id:'obra-spira',title:'OBRA-SPIRA / BASALT SPIRE BASTION',kind:'canyon',height:72,scale:245,accent:[.50,.36,.15],feature:'boulder',code:4,angle:1.15};
 const canonical=id=>id,style=id=>styles[id]||styles.carax;
 const surface=s=>UNIQUE.includes(s?.space?.body)&&['landed','cockpit'].includes(s.space.phase)&&!s.space.interior?.active;
 const smooth=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);};
 // Keep terrain below floor slabs. The pre-Carax sampler preserves saved landing pads.
 function terrain(s,x,z){const c=NVCarax.center(s),dz=z-c.z,d=Math.max(Math.abs(x-c.x)-76,dz>0?dz-84:-dz-174,0),t=smooth(d/125);return 13.65*(1-t)+caraxTerrain(s,x,z)*t;}
 function props(s,cx,cz){const c=NVCarax.center(s);return NVLandscapes.props(cx,cz,s.seed,s.space.body).filter(p=>Math.max(Math.abs(p.x-c.x)-95,Math.abs(p.z-c.z)-105)>0&&!(Math.abs(p.x-c.x)<12&&p.z<c.z-23&&p.z>c.z-180)&&Math.hypot(p.x-s.space.landingX,p.z-s.space.landingZ)>26).map(p=>({...p,y:terrain(s,p.x,p.z)}));}
 const textures=new Map();
 function texture(id='carax'){
  if(textures.has(id))return textures.get(id);const b=NVSol.byId[id],seed=NVAntarctica.seedFromId(id)+7331,canvas=document.createElement('canvas');canvas.width=512;canvas.height=256;const c=canvas.getContext('2d'),im=c.createImageData(512,256);
  for(let y=0;y<256;y++)for(let x=0;x<512;x++){const a=x/512*Math.PI*2,lat=y/256*Math.PI,n=NVAntarctica.noise(Math.cos(a)*Math.sin(lat)*5+17,Math.sin(a)*Math.sin(lat)*5+Math.cos(lat)*3,seed),vein=Math.sin(a*9+Math.cos(lat)*14+n*5),k=(y*512+x)*4;let tone=b.color.map(v=>v*(.65+n*.7));if(id==='alt-zerry')tone=tone.map(v=>v*(.88+Math.floor(n*7)/35));if(id==='obra-spira'&&vein>.97)tone=[.48,.27,.075];for(let j=0;j<3;j++)im.data[k+j]=Math.min(255,Math.round(tone[j]*255));im.data[k+3]=255;}c.putImageData(im,0,0);
  let rseed=seed;const r=()=>((rseed=(Math.imul(rseed,1664525)+1013904223)>>>0)/4294967296);
  for(let i=0;i<70;i++){const x=r()*512,y=r()*256,radius=2+r()*14;c.strokeStyle=id==='alt-zerry'?'#d3e6ea30':id==='obra-spira'?'#0b1118a0':'#9d899030';c.lineWidth=id==='obra-spira'?2:1;c.beginPath();if(id==='obra-spira'){c.moveTo(x,y);c.lineTo(x+radius*2,y-radius);c.lineTo(x+radius*3,y+radius*.5);}else c.ellipse(x,y,radius,radius*.58,0,0,6.283);c.stroke();}
  const light=style(id).light.map(v=>Math.round(v*255));c.strokeStyle='rgba('+light.join(',')+',.65)';c.lineWidth=.8;for(let i=0;i<16;i++){const a=i/16*6.283,x=246+Math.cos(a)*17,y=128+Math.sin(a)*7;c.beginPath();c.moveTo(246,128);c.lineTo(x,y);c.stroke();c.fillStyle=c.strokeStyle;c.fillRect(x,y,2,1);}
  const result=canvas.toDataURL('image/png');textures.set(id,result);return result;
 }
 for(const id of IDS)Object.defineProperty(SOL_MAPS,id,{enumerable:true,configurable:true,get:()=>texture(id)});
 function districts(object,s,c){const id=s.space.body,p=style(id),height=(x,z)=>terrain(s,x,z);
  if(id==='alt-zerry'){
   // Concentric civic terraces, low ivory habitats and teal signal pylons.
   for(let i=0;i<36;i++){const a=i/12*6.283,r=150+Math.floor(i/12)*92,x=c.x+Math.sin(a)*r,z=c.z+Math.cos(a)*r;if(Math.abs(x-c.x)<50&&z<c.z)continue;const y=height(x,z),h=12+i%5*5;object(x,y+1,z,30,2,25,p.edge,a);object(x,y+2+h/2,z,24,h,18,p.steel,a);object(x,y+h+3,z,27,2,21,p.edge,a);object(x,y+h+5,z,15,2,12,p.steel,a);for(const side of [-1,1])object(x+side*9,y+h*.7,z-9.2,.6,h*.35,.3,p.light,0,.15);}
   for(const side of [-1,1]){const x=c.x+side*40,z=c.z-35;object(x,24,z,10,20,12,p.steel);object(x,35,z,14,2,16,p.edge);object(x,41,z,1,11,1,p.light,0,.18);const px=c.x+side*95,pz=c.z-83,y=height(px,pz);object(px,y+.2,pz,32,.4,26,p.edge);object(px,y+.44,pz,25,.08,1,p.light,0,.1);object(px,y+.44,pz,1,.08,20,p.light,0,.1);}
   for(const side of [-1,1])for(const back of [-1,1]){object(c.x+side*34,30,c.z+back*31,8,32,8,p.steel);object(c.x+side*34,47,c.z+back*31,11,2,11,p.edge);object(c.x+side*34,51,c.z+back*31,.8,6,.8,p.light,0,.18);}
  }else if(id==='obra-spira'){
   // Offset basalt keep districts replace Carax's radial city skyline.
   for(const side of [-1,1])for(let i=0;i<18;i++){const x=c.x+side*(105+i%3*70),z=c.z-160+Math.floor(i/3)*66,y=height(x,z),h=26+(i*23)%80;object(x,y+h/2,z,30,h,27,p.steel);object(x,y+h*.75,z,23,h*.5,20,p.edge);object(x,y+h+7,z,12,14,10,p.steel);object(x,y+h+19,z,4,14,4,p.steel);object(x,y+h+27,z,.8,3,.8,p.light,0,.18);object(x,y+5,z-13.7,19,.65,.3,p.light,0,.12);}
   for(const side of [-1,1])for(const back of [-1,0,1]){const x=c.x+side*38,z=c.z+back*29;object(x,29,z,13,30,11,p.steel);object(x,47,z,9,14,8,p.edge);object(x,60,z,3,15,3,p.steel);object(x,68,z,.7,2,.7,p.light,0,.18);}
   for(const side of [-1,1])for(let i=0;i<8;i++){const x=c.x+side*61,z=c.z-80+i*24,y=height(x,z);object(x,y+.5,z,3,1,16,p.edge);object(x,y+1.08,z,.7,.1,12,p.light,0,.12);}
  }
 }
 return{IDS,UNIQUE,styles,canonical,style,surface,terrain,props,texture,districts};
})();
const fortressGround=NVWorldFlight.ground;NVWorldFlight.ground=(s,x,z)=>NVFortressAppearance.surface(s)?NVCarax.local(s)&&(NVCarax.inside(s,x,z)||NVCarax.ramp(s,x,z))?NVCarax.height(s,x,z):NVFortressAppearance.terrain(s,x,z):fortressGround(s,x,z);
const fortressTerrain=constructionWorldGround;constructionWorldGround=(s,x,z)=>NVFortressAppearance.surface(s)?NVFortressAppearance.terrain(s,x,z):fortressTerrain(s,x,z);
const fortressProps=NVWorldFlight.props;NVWorldFlight.props=(s,cx,cz)=>NVFortressAppearance.surface(s)?NVFortressAppearance.props(s,cx,cz):fortressProps(s,cx,cz);
const fortressVisualWaypoint=missionWaypointTarget;missionWaypointTarget=s=>{if(NVFrontierFortresses.local(s)&&!NVCarax.inside(s)&&!NVCarax.ramp(s)){const c=NVCarax.center(s);return{x:c.x,z:c.z-23,label:NVSol.byId[s.space.body].name+' · Five-floor fortress entrance'};}return fortressVisualWaypoint(s);};
const fortressVisualRender=renderSpaceWorld;renderSpaceWorld=(s,...args)=>{const result=fortressVisualRender(s,...args);if(s?.space&&NVFortressAppearance.IDS.includes(s.space.body)){polarCanvas.dataset.fortressStyle=s.space.body;polarCanvas.dataset.fortressWorld=s.space.body;}else{delete polarCanvas.dataset.fortressStyle;delete polarCanvas.dataset.fortressWorld;}return result;};
