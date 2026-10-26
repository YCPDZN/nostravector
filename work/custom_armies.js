// A founder's appearance and the soldiers serving their faction are separate choices.
const NVCustomArmies=(()=>{
 const TYPES=[['own-armoured','ARMOURED OWN SPECIES'],['human','HUMAN SOLDIERS'],['chompy','CHOMPY SOLDIERS'],['erisian','ERISIAN SOLDIERS'],['grek','GREK SOLDIERS'],['leader','COPIES OF THE LEADER']];
 const valid=value=>TYPES.some(([id])=>id===value)?value:'leader';
 const type=n=>valid(n?.armyType);
 const key=n=>JSON.stringify({type:type(n),species:n.species,suit:n.suit,trim:n.trim,accent:n.accent,model:n.model});
 const locked=(s,n)=>n?.status==='uplifted'&&typeof NVGalacticDiplomacy!=='undefined'&&!!NVGalacticDiplomacy.overlord(s,NVCustomCrew.faction(n));
 function set(s,id,value){const n=NVCustomCrew.record(s,id);if(!n||n.model)return{ok:false,text:'Choose a custom species faction.'};if(!TYPES.some(([id])=>id===value))return{ok:false,text:'Choose an army type.'};if(locked(s,n)&&type(n)!==value)return{ok:false,text:'Puppet states retain their existing troops. Their overlord cannot replace them.'};n.armyType=value;return{ok:true,text:'ARMY UPDATED / '+TYPES.find(([id])=>id===value)[1]};}
 const rgb=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)/255);
 function parts(n,distant=false){
  const choice=type(n),profile=choice==='leader'?NVCustomCrew.profile(n):{...NVCustomCrew.profile(n),model:null,species:choice==='own-armoured'?NVSpecies.valid({...n.species,enabled:true}):NVSpecies.preset(choice),suit:n.species.secondary,trim:n.trim,accent:n.species.eyes};
  profile.skin=profile.species.skin;profile.hairColor=profile.species.secondary;profile.eyeColor=profile.species.eyes;
  let list=(choice==='leader'?NVCustomCrew.parts(n):NVSpecies.parts(profile)).map(p=>({...p,c:getWandererColor(p,profile)}));
  if(choice==='own-armoured'){
   const q=profile.species,colour=rgb(n.species.secondary),metal=[.26,.30,.36],h=q.height,w=q.width;
   function plate(name,x,y,z,sx,sy,sz,bone='body',c=colour){const p=[],normal=[],f=[];for(const [axis,sign,u,v]of [[0,-1,1,2],[0,1,1,2],[1,-1,2,0],[1,1,2,0],[2,-1,0,1],[2,1,0,1]]){const start=p.length;for(const [a,b]of [[-1,-1],[1,-1],[1,1],[-1,1]]){const at=[x,y*h,z],size=[sx,sy*h,sz],point=[...at],n=[0,0,0];point[axis]+=sign*size[axis]/2;point[u]+=a*size[u]/2;point[v]+=b*size[v]/2;n[axis]=sign;p.push(point);normal.push(n);}if(sign>0)f.push(start,start+1,start+2,start,start+2,start+3);else f.push(start,start+2,start+1,start,start+3,start+2);}list.push({name:'Army uniform / '+name,p,n:normal,f,c,bone});}
   plate('Chest plate',0,1.20,.235,.48*w,.34,.09);
   plate('Gorget',0,1.43,.13,.35*w,.12,.22,'body',metal);
   plate('Unit insignia',.12*w,1.25,.291,.055,.075,.012,'body',[.83,.89,.95]);
   for(const side of [-1,1]){const prefix=side<0?'R':'L';plate('Shoulder '+side,side*.33*w,1.39,.03,.23,.16,.34,prefix+'-upperArm');plate('Shin '+side,side*.15*w,.36,.105,.16*q.legWidth,.29,.09,prefix+'-shin',metal);}
  }
  if(distant)list=list.filter(p=>!/finger|knuckle|strand|tread|pouch|buckle/i.test(p.name));
  return list;
 }
 return{TYPES,valid,type,key,locked,set,parts};
})();
