// Deterministic native ecosystems for the generated cluster; authored habitats stay intact.
const NVAlienEcology=(()=>{
 const habitats=new Map();
 function seed(id,saveSeed=0){let n=(saveSeed^0x6d2b79f5)>>>0;for(const c of id)n=Math.imul(n^c.charCodeAt(0),16777619)>>>0;return n;}
 function rng(n){return()=>{n=(Math.imul(n,1664525)+1013904223)>>>0;return n/4294967296;};}
 const pick=(r,a)=>a[Math.floor(r()*a.length)];
 function eligible(b){return !!b&&(/^cluster-\d+$/.test(b.system||'')||['andromeda','cyrannus','triangulum','chimaera'].includes(b.galaxy))&&!!b.atmosphere&&!b.stellar&&!b.giant&&/^(Paradise|Frozen|Terrestrial) (?:fortress )?(planet|moon|world)$/i.test(b.category);}
 function habitat(id){const b=NVSol.byId[id];if(!eligible(b))return null;if(habitats.has(id))return habitats.get(id);const frozen=/frozen/i.test(b.category),r=rng(seed(id));
  const h={title:frozen?pick(r,['Frostveil colonies','Glacial twilight gardens','Insulated tundra nests']):pick(r,['Prismatic wildlands','Resonant canopy basins','Luminous meadow colonies']),world:b.name,density:frozen?6:12,plants:['alien-flora','alien-flora','alien-flora'],animals:['alien-fauna','alien-fauna','alien-fauna'],colors:[[.45,.34,.6],[.3,.7,.5]],ocean:false,procedural:true,frozen};habitats.set(id,h);return h;
 }
 function validScan(id){const m=/^((?:cluster|andromeda|cyrannus|triangulum|chimaera)-\d+-p\d+|anaxa):([0-5])$/.exec(id);return !!m&&!!habitat(m[1]);}
 function colour(r,frozen){const h=r()*6,s=.35+r()*.4,v=(frozen?.55:.38)+r()*.35,c=v*s,x=c*(1-Math.abs(h%2-1)),m=v-c;return [[c,x,0],[x,c,0],[0,c,x],[0,x,c],[x,0,c],[c,0,x]][Math.floor(h)].map(v=>v+m);}
 function species(id,saveSeed){const h=habitat(id);if(!h)return[];const b=NVSol.byId[id],r=rng(seed(id,saveSeed)),syll=['ae','vha','ix','qor','shu','nye','kha','oru','vex','thra','uun','zai','esh','dru','phi','syl','mor','kyr','ith','sha','vek','lu','zhe','nox'],word=()=>{const t=pick(r,syll)+pick(r,syll)+pick(r,syll)+pick(r,syll);return t[0].toUpperCase()+t.slice(1);};
  const lineage=word(),list=[];
  for(let i=0;i<6;i++){
   const plant=i<3,predator=i===4,flying=i===5&&!h.frozen&&r()>.4,behavior=plant?'flora':predator?'predator':i===5&&!flying?'neutral':'peaceful',color=colour(r,h.frozen),accent=colour(r,h.frozen);
   const morph={type:Math.floor(r()*4),segments:2+Math.floor(r()*3),limbs:3+Math.floor(r()*5),eyes:1+Math.floor(r()*5),horns:Math.floor(r()*4),tail:2+Math.floor(r()*4),width:.3+r()*.55,length:.7+r()*.8,height:.55+r()*.7,crest:r()>.45,branches:3+Math.floor(r()*5),crown:3+Math.floor(r()*6),curl:r()*2,seed:seed(id+':'+i,saveSeed)};
   const role=plant?['Crown','Spire','Veil'][i]:predator?['Ambusher','Stalker','Ripper','Needlejaw'][morph.type]:flying?'Skyveil':i===5?'Sentinel':['Grazer','Drifter','Forager','Strider'][morph.type],name=lineage+' '+word()+' '+role;
   const anatomy=plant?`${morph.branches} branching stalks carrying ${morph.crown}-fold ${['mineral fans','hollow seed cups','spiral fronds','ribbon leaves'][morph.type]}`:`${morph.limbs} jointed limbs, ${morph.segments} body plates and ${morph.eyes} luminous sensory organs${flying?', with paired ribbed flight membranes':''}`;
   const diet=plant?(h.frozen?'traps light and chemical nutrients inside insulating translucent growths':'stores starlight in layered photosynthetic tissues'):predator?'detects the tremor of moving prey before lunging from cover':behavior==='neutral'?'guards its feeding patch and withdraws when approached':'browses native growths and flees approaching hunters';
   list.push({id:id+':'+i,world:id,index:i,name,form:plant?'alien-flora':'alien-fauna',plant,procedural:true,behavior,anatomy,description:`Native to ${b.name}, ${name} has ${anatomy}. It ${diet}. ${h.frozen?'Dense insulating plates and slow metabolism suit this atmospheric frozen world.':'Its body plan evolved within this world’s distinct atmospheric ecosystem.'} ${predator?'Keep your distance; the suit repellent interrupts its pursuit.':plant?'Its colonies shelter native grazers.':'It follows sheltered feeding routes rather than other worlds’ migration patterns.'}`,color,accent,size:(plant?.8:predator?1.35:1)*(.8+r()*.65),flying,swimming:false,morph});
  }return list;
 }
 return{seed,eligible,habitat,validScan,species};
})();
