// Visual weather is independent of exposure damage: shelter blocks precipitation,
// not the storm outside its doors and windows. All coordinates remain save-local.
const NVStormVisuals=(()=>{
 function view(s){
  const weather=NVFrozenWeather.view(s);if(weather)return{...weather,active:weather.storm,fog:weather.type==='firestorm'?[.54,.20,.06]:weather.type==='duststorm'?[.58,.34,.19]:[.77,.82,.86]};
  if(!s.africaStarted&&(!s.space||s.space.phase==='off'))return{active:!!s.superBlizzard,type:'blizzard',safe:NVAntarctica.inShelter(s),fog:[.77,.82,.86]};
  return null;
 }
 function box(x,z,y,hx,hz,height,yaw=0){return{x,z,y:y+height/2,hx,hz,hy:height/2,c:Math.cos(yaw),s:Math.sin(yaw)};}
 function covers(b,x,y,z){const dx=x-b.x,dz=z-b.z;return Math.abs(dx*b.c-dz*b.s)<b.hx&&Math.abs(dx*b.s+dz*b.c)<b.hz&&Math.abs(y-b.y)<b.hy;}
 function shelters(s,ground){
  const out=[],surface=NVSpace.surface(s),id=surface?s.space.body:'';
  if(!s.africaStarted&&!surface){const p=NVAntarctica.STATION;out.push(box(p.x,p.z,NVAntarctica.height(p.x,p.z,s.seed)+.75,5.8,5.3,3.55));}
  if(id==='mars'){const p=NVKhazglar.location(s);out.push(box(p.x,p.z,ground(p.x,p.z,s.seed),3.55,3.55,4.5));}
  if(id==='charon'&&!s.space.geo?.global)out.push(box(24,25,ground(24,25,s.seed),8,9,6));
  if(id==='eris')out.push(box(0,59,ground(0,59,s.seed),10,8,9));
  if(surface)for(const p of NVConstruction.localPieces(s))if(p.type==='roof'&&Math.hypot(p.x-s.x,p.z-s.z)<65)out.push(box(p.x,p.z,p.y-.1,2.1,2.1,3.2,p.yaw));
  return out.sort((a,b)=>Math.hypot(a.x-s.x,a.z-s.z)-Math.hypot(b.x-s.x,b.z-s.z)).slice(0,32);
 }
 const covered=(boxes,x,y,z)=>boxes.some(b=>covers(b,x,y,z));
 const GLSL=`uniform float weatherTime,weatherType;uniform vec3 weatherFog;
 float nvWeatherHash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
 vec3 nvStormWindow(vec2 uv){
  float t=weatherTime,fire=step(2.5,weatherType),dust=step(1.5,weatherType)*(1.-fire);
  vec2 wind=vec2(uv.x+t*(2.1+fire),uv.y+t*(1.2-fire*2.));
  float veil=.5+.5*sin(uv.y*3.1+uv.x*1.8+t*1.3+sin(uv.x*2.-t*.6));
  vec2 cell=floor(wind*7.),local=fract(wind*7.)-.5;
  float speck=(1.-smoothstep(.05,.24,length(local*vec2(.55,2.2))))*step(.78,nvWeatherHash(cell));
  vec3 particle=mix(vec3(.96,.98,1.),vec3(.78,.51,.27),dust);particle=mix(particle,vec3(1.,.45,.06),fire);
  return mix(weatherFog*(.75+veil*.24),particle,speck*(.7-fire*.18));
 }`;
 return{view,box,covers,shelters,covered,GLSL};
})();
