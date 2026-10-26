// Infantry use the same species anatomy as their faction's established characters.
const NVArmyModels=(()=>{
 const cache=new Map();
 const flat=p=>({...p,p:p.p.flat(),n:p.n.flat(),f:p.f||p.indices,indices:p.f||p.indices,color:p.color||p.c});
 function normalized(parts,height=4.3){let lo=Infinity,hi=-Infinity;for(const p of parts){const v=p.p.flat();for(let i=1;i<v.length;i+=3){lo=Math.min(lo,v[i]);hi=Math.max(hi,v[i]);}}const scale=height/(hi-lo);return parts.map(p=>({...flat(p),p:p.p.flat().map((v,i)=>(i%3===1?v-lo:v)*scale)}));}
 function model(faction){const f=faction==='RESISTANCE'?'ERISIAN':faction;if(cache.has(f))return cache.get(f);let m;
  if(f==='CHIMAERA_SCOURGE'){
   const species={...NVSpecies.preset('reptillian2'),secondary:'#692130',eyes:'#ffb45e'},officer={name:'Scourge infantry',species,armyType:'own-armoured',suit:'#692130',trim:'#25232c',accent:'#b6874d'},bones={'R-upperArm':'leftArm','L-upperArm':'rightArm','R-shin':'leftLeg','L-shin':'rightLeg'};
   const meshes=normalized(NVCustomArmies.parts(officer).map(p=>({...p,bone:bones[p.bone]||p.bone})));
   m={name:'Chimaera Scourge / Armoured Reptillian 2 infantry',species:'reptillian2',armoured:true,meshes,pivots:{...FactionInfantryModels.HUMAN.pivots,tail:[0,1.9,-.16]},height:4.3};
  }else if(f==='CHOMPY'){
   const armour=FactionInfantryModels.HUMAN.meshes.filter(p=>!['head','jaw','eyes'].includes(p.bone)).map(p=>({...flat(p),color:p.color[2]>p.color[0]*1.4?[.32,.10,.56]:p.color[0]>.4?[.14,.48,.82]:p.color}));
   const head=normalized(HakModel.meshes).filter(p=>['head','jaw','eyes'].includes(p.bone)&&!/glass|lens|glint/i.test(p.name));
   m={name:'Chompy assault infantry',meshes:[...armour,...head],pivots:FactionInfantryModels.HUMAN.pivots,height:4.3};
  }else if(f==='GREK')m={name:'Grek assault infantry',meshes:normalized(GrekModel.meshes.filter(p=>!/plinth|pedestal|grass|meadow/i.test(p.name))),pivots:FactionInfantryModels.HUMAN.pivots,height:4.3};
  else m=FactionInfantryModels[f]||null;
  if(m)cache.set(f,m);return m;
 }
 function parts(faction,distant=false){const m=model(faction);if(!m)return null;return m.meshes.filter(p=>!(/Finger|Knuckle|vent|tread|buckle|cable|piping|carved strand|layered strand|Front hair/i.test(p.name))&&(!distant||!/pouch|harness|clasp|pack battery|rim|segment|sensor|braid|furrow/i.test(p.name))).map(flat);}
 return{model,parts};
})();
