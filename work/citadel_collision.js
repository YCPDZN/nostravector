const NVCitadel=(()=>{
  const TOP=15.5,PAD={x:-44,z:64};
  const inside=(x,z,a,b,c,d)=>x>=a&&x<=b&&z>=c&&z<=d;
  function height(x,z,base=0){
    if(inside(x,z,-4,4,30,58))return TOP*(z-30)/28;
    if(inside(x,z,-13,13,58,72)||inside(x,z,-32,-13,61.5,66.5)||inside(x,z,-56,-32,52,76))return TOP;
    return base;
  }
  function blocked(x,z,y){
    if(inside(x,z,-12.9,12.9,68,92)&&y<15.3)return true;
    for(const side of [-1,1]){
      if(inside(x*side,z,13.6,26.4,58,88)&&y<10.4)return true;
      for(const tz of [56,91])if(inside(x*side,z,23.1,30.9,tz-3.9,tz+3.9)&&y<23.5)return true;
    }
    if(y>=15&&Math.hypot(x,z-80)<10.4)return true;
    return false;
  }
  function resolve(entity,old,base){
    const test=(x,z)=>{const h=height(x,z,base(x,z)),previous=height(old.x,old.z,base(old.x,old.z));return !blocked(x,z,h+(entity.jumpOffset||0))&&Math.abs(h-previous)<.65;};
    const x=entity.x,z=entity.z;if(test(x,z))return;
    if(test(x,old.z)){entity.z=old.z;return;}if(test(old.x,z)){entity.x=old.x;return;}entity.x=old.x;entity.z=old.z;
  }
  return{TOP,PAD,height,blocked,resolve};
})();
