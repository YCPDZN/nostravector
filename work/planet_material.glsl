// Original Antarctica snow and African sand, recolored without inherited blue/brown.
vec3 triSample(sampler2D source,vec3 p,vec3 weights){return texture2D(source,p.yz).rgb*weights.x+texture2D(source,p.xz).rgb*weights.y+texture2D(source,p.xy).rgb*weights.z;}
float luminance(vec3 c){return dot(c,vec3(.2126,.7152,.0722));}
vec3 planetMaterial(vec3 base,vec3 normal){
  vec3 weights=pow(abs(normal),vec3(4.));weights/=max(.001,weights.x+weights.y+weights.z);
  vec3 p=surfaceWorld*terrainScale+vec3(terrainShift,terrainShift*.7,-terrainShift*.4);
  float sandValue=luminance(triSample(sand,p,weights)),snowValue=luminance(triSample(snow,p*.79,weights));
  float broad=mix(sandValue/.58,snowValue/.82,terrainIce);
  vec2 detailUV=surfaceWorld.xz*terrainScale*5.7+vec2(terrainShift);
  float detail=mix(luminance(texture2D(sand,detailUV).rgb)/.58,luminance(texture2D(snow,detailUV*.91).rgb)/.82,terrainIce);
  vec3 col=base*clamp(.65+broad*.34+(detail-1.)*.14,.42,1.40);
  // Small luminance gradients create relief lighting without terrain geometry noise.
  float delta=1./2048.;float gx=luminance(texture2D(sand,detailUV+vec2(delta,0.)).rgb)-luminance(texture2D(sand,detailUV-vec2(delta,0.)).rgb);
  float gz=luminance(texture2D(snow,detailUV+vec2(0.,delta)).rgb)-luminance(texture2D(snow,detailUV-vec2(0.,delta)).rgb);
  col*=clamp(1.+(gx*lightDirection.x+gz*lightDirection.z)*.6,.85,1.15);
  float slope=1.-abs(normal.y),strata=.5+.5*sin(surfaceWorld.y*1.5);col*=.9+strata*.1;
  if(terrainKind>5.5&&terrainKind<6.5){float crack=pow(1.-abs(sin(surfaceWorld.x*.014+sin(surfaceWorld.z*.016))),35.);col=mix(col,terrainAccent,crack*.7);}
  if(terrainKind>6.5)col=mix(col,terrainAccent,smoothstep(24.,85.,surfaceWorld.y)*.55);
  if(terrainKind>4.5&&terrainKind<5.5){float lava=pow(.5+.5*sin(surfaceWorld.x*.08+sin(surfaceWorld.z*.09)),18.)*smoothstep(.6,.95,normal.y);col=mix(col,terrainAccent,lava*.5);}
  return mix(col,base*.65,slope*.25);
}
