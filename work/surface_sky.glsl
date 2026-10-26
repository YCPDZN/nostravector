precision highp float;
varying vec2 uv;
uniform sampler2D sky;
uniform vec3 cameraForward,cameraRight,cameraUp,fog,lightDirection;
uniform float tanHalfFov,aspect,time,severity,daylight,twilight,dayMode,surfaceMode,cloudKind;
float random(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}
// Triplanar sampling uses direction in the world, with no longitude wrap seam.
vec3 cloudPhoto(vec3 ray){vec3 w=pow(abs(ray),vec3(4.));w/=max(.001,w.x+w.y+w.z);float drift=time*.0007;return texture2D(sky,ray.yz*.8+vec2(.4+drift,.3)).rgb*w.x+texture2D(sky,ray.xz*.8+vec2(.5+drift,.6)).rgb*w.y+texture2D(sky,ray.xy*.8+vec2(.7+drift,.4)).rgb*w.z;}
void main(){
  vec3 ray=normalize(cameraForward+cameraRight*(uv.x*2.-1.)*aspect*tanHalfFov+cameraUp*(uv.y*2.-1.)*tanHalfFov);
  vec3 tex=cloudPhoto(ray),day=mix(tex,fog,.52);
  vec3 night=mix(vec3(.025,.045,.08),vec3(.004,.009,.025),smoothstep(0.,1.,ray.y));
  vec3 starCoord=ray*420.,cell=floor(starCoord),local=fract(starCoord)-.5;
  float seed=random(cell),star=step(.9965,seed)*(1.-smoothstep(.07,.26,length(local)));
  star*=smoothstep(0.,.12,ray.y)*(.82+.18*sin(time*.3+seed*87.));
  night+=vec3(.68,.80,1.)*star;
  vec3 clear=mix(night,day,daylight);
  clear+=vec3(.30,.09,.025)*twilight*exp(-abs(ray.y)*7.);
  float alignment=dot(ray,normalize(lightDirection)),disk=smoothstep(cos(.038),cos(.029),alignment)*step(0.,ray.y),glow=pow(max(0.,alignment),180.)*step(0.,ray.y);
  clear+=mix(vec3(.035,.065,.12),vec3(.20,.095,.025),dayMode)*glow;
  clear=mix(clear,mix(vec3(.72,.81,.97),vec3(1.,.78,.40),dayMode),disk*.95);
  vec3 cloud=mix(clear,fog,mix(.025,.985,severity));cloud=mix(fog,cloud,smoothstep(0.,.18,ray.y));
  if(surfaceMode>.5){
    if(surfaceMode>1.5){cloud=vec3(.002,.004,.010)+vec3(.75,.83,.95)*star;cloud+=vec3(1.,.94,.82)*pow(max(0.,alignment),1800.);}
    else{float haze=dot(tex,vec3(.2126,.7152,.0722));cloud=mix(fog*.28,fog,1.-smoothstep(-.10,.8,ray.y));cloud*=.89+haze*.18;cloud+=vec3(.7,.5,.25)*glow*.5;}
  }
  if(cloudKind>.5){
    // Use continuous sphere coordinates rather than moving screen stripes.
    float polarFade=smoothstep(0.,.35,length(ray.xz));float longitude=atan(ray.x,ray.z),bands=.5+.5*sin(ray.y*(cloudKind<1.5?35.:cloudKind<2.5?20.:12.)+sin(longitude*4.+time*.03)*2.*polarFade);
    cloud=mix(fog*.38,fog*1.2,bands);float vortex=sin(longitude*3.+ray.y*20.-time*.045)*sin(ray.y*28.+time*.03)*polarFade;
    if(cloudKind<1.5)cloud=mix(cloud,vec3(.64,.21,.12),smoothstep(.6,.95,vortex)*.45);
    if(cloudKind>2.5&&cloudKind<3.5)cloud+=vec3(.03,.25,.19)*pow(max(0.,sin(longitude*8.+ray.y*15.+time*.12)),8.)*.5*polarFade;
    if(cloudKind>3.5){cloud*=.7;cloud+=vec3(.2,.3,.5)*pow(max(0.,sin(time*.8+longitude*12.)),60.)*polarFade;}
  }
  if(surfaceMode>2.5){float rays=pow(max(0.,dot(ray,normalize(vec3(.25,1.,.35)))),8.);cloud=fog*(.35+.5*max(0.,ray.y))+vec3(.04,.16,.18)*rays;cloud+=vec3(.012,.025,.02)*sin(ray.x*11.+ray.z*9.+time*.22);}
  gl_FragColor=vec4(cloud,1.);
}
