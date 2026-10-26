// The original Project BC files are embedded by build_menu.py for offline use.
const NVProjectBC=(()=>{
 const models=__PROJECT_BC_MODELS__;
 const byAsset=id=>models.find(model=>model.asset===id)||null;
 const byId=id=>models.find(model=>model.id===id)||null;
 function bytes(model){const binary=atob(model.source),array=new Uint8Array(binary.length);for(let i=0;i<binary.length;i++)array[i]=binary.charCodeAt(i);return array.buffer;}
 const metadata=model=>NVGLB.metadata({type:'glb',id:model.asset,file:model.file,triangles:model.triangles,height:model.height,yaw:0});
 return{models,byAsset,byId,bytes,metadata};
})();
