const NVPlanetRender=(()=>{
  function texture(gl,width,height){
    const pot=n=>n>0&&(n&(n-1))===0;
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
    if(pot(width)&&pot(height)){gl.generateMipmap(gl.TEXTURE_2D);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);}
    else gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
    const ext=gl.getExtension('EXT_texture_filter_anisotropic')||gl.getExtension('WEBKIT_EXT_texture_filter_anisotropic');
    if(ext)gl.texParameterf(gl.TEXTURE_2D,ext.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(8,gl.getParameter(ext.MAX_TEXTURE_MAX_ANISOTROPY_EXT)));
  }
  function near(position,worlds){
    let clearance=Infinity;
    for(const b of worlds){const extent=b.radius*Math.max(...(b.shape||[1,1,1]))*(b.rings?2.4:1.06),d=Math.hypot(...b.position.map((v,i)=>v-position[i]))-extent;
      if(d>0)clearance=Math.min(clearance,d);else return .05;
    }
    return Math.max(.05,Math.min(2,clearance*.02));
  }
  function terrainKey(s,africa,surface,ocean){
    const p=s.space||{},g=p.geo||{},v=s.eris?.vengefulMascar;
    const arena=surface&&typeof NVKarribassaBosses!=='undefined'?NVKarribassaBosses.arena(s):null;
    const mascar=surface&&['hunt','complete'].includes(v?.stage)&&typeof NVVengefulMascar!=='undefined'?NVVengefulMascar.anchor(s):null;
    return JSON.stringify([s.seed,!!africa,surface||'',!!ocean,p.landingX||0,p.landingZ||0,p.landingElevation||0,!!g.global,g.global?g.lat:null,g.global?g.lon:null,!!s.aerialView,arena?.x,arena?.z,mascar?.x,mascar?.z]);
  }
  return{texture,near,terrainKey};
})();
