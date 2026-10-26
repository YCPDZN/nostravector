// Game classifications are the requested labels; surface notes describe the real worlds.
const NVSol=(()=>{
  const worlds=[];
  function body(id,name,category,km,au,angle,color,style,extra={}){
    const radius=18+Math.sqrt(km)*.72,orbit=200+Math.log(1+au)*2600;
    worlds.push({id,name,category,km,au,radius,position:[Math.sin(angle)*orbit,0,Math.cos(angle)*orbit],color,style,parent:null,atmosphere:false,gravity:1,...extra});
  }
  body('mercury','Mercury','Scorched planet',2440,.387,.15,[.47,.45,.42],'rock',{terrain:[.37,.35,.32],note:'Gray, cratered rock; no substantial atmosphere. Scorching sunlight, cold shadows.'});
  body('venus','Venus','Ravaged planet',6052,.723,1.25,[.84,.74,.53],'cloud',{atmosphere:true,sky:[.48,.31,.12],terrain:[.48,.32,.16],note:'Cream-colored clouds conceal a rocky surface beneath a dense, hot atmosphere.'});
  body('earth','Earth','Paradise planet',6371,1,2.3,[.13,.39,.65],'earth',{atmosphere:true,sky:[.30,.55,.78],terrain:[.29,.40,.20],note:'Blue oceans, seven continents, white clouds and polar ice. Fly between continents and choose your own landing coordinates.'});
  body('mars','Mars','Rocky planet',3390,1.524,3.4,[.71,.34,.20],'rock',{atmosphere:true,sky:[.46,.30,.23],terrain:[.57,.28,.15],note:'Rust-colored plains, dark volcanic regions and bright polar ice caps.'});
  body('ceres','Ceres','Airless dwarf planet',473,2.77,4.0,[.39,.39,.38],'rock',{terrain:[.34,.33,.31],note:'A cratered dwarf planet in the main asteroid belt, with bright salt deposits.'});
  body('jupiter','Jupiter','Gas giant',69911,5.2,.6,[.78,.63,.48],'gas',{giant:true,atmosphere:true,sky:[.54,.38,.24],terrain:[.59,.48,.35],note:'Cream and brown cloud bands and the Great Red Spot. Land on a floating cloud platform; there is no solid surface.'});
  body('saturn','Saturn','Gas giant',58232,9.58,1.8,[.84,.76,.56],'gas',{giant:true,rings:true,tilt:.47,atmosphere:true,sky:[.64,.52,.30],terrain:[.64,.56,.39],note:'Pale golden cloud bands, broad icy rings and the Cassini Division. Cloud platform landing.'});
  body('uranus','Uranus','Ice giant',25362,19.2,3.05,[.49,.77,.79],'icegiant',{giant:true,rings:true,tilt:1.706,atmosphere:true,sky:[.24,.54,.57],terrain:[.37,.62,.65],note:'Pale cyan atmosphere; the rotation axis is tipped almost onto its side. Cloud platform landing.'});
  body('neptune','Neptune','Ice giant',24622,30.1,4.35,[.34,.61,.73],'icegiant',{giant:true,rings:true,tilt:.494,atmosphere:true,sky:[.15,.31,.46],terrain:[.28,.46,.60],note:'Blue-cyan atmosphere and bright cloud streaks. Historical Voyager imagery exaggerates the blue. Cloud platform landing.'});
  body('pluto','Pluto','Dwarf planet',1188,39.48,5.4,[.68,.57,.47],'ice',{terrain:[.59,.50,.43],note:'Tan and reddish terrain around a bright heart-shaped nitrogen-ice region.'});
  body('haumea','Haumea','Dwarf planet',780,43.2,.95,[.75,.76,.74],'ice',{shape:[1.6,.65,.8],terrain:[.68,.70,.68],interpretation:true,note:'An elongated, rapidly rotating icy world. Close-up terrain is an artistic interpretation.'});
  body('makemake','Makemake','Dwarf planet',715,45.8,2.2,[.60,.38,.26],'ice',{terrain:[.55,.36,.25],interpretation:true,note:'A reddish icy dwarf planet. No resolved spacecraft surface map exists; terrain is interpreted.'});
  body('eris','Eris','Dwarf planet',1163,67.8,3.4,[.83,.84,.83],'ice',{terrain:[.74,.76,.77],interpretation:true,note:'A bright, very cold dwarf planet beyond the main Kuiper belt. Terrain is interpreted.'});
  body('sedna','Sedna','Dwarf planet',500,86,4.65,[.59,.27,.20],'ice',{terrain:[.50,.25,.21],interpretation:true,note:'A distant reddish object on a detached orbit; dwarf planet is its game category. Terrain is interpreted.'});
  function moon(id,name,parent,category,km,index,color,style='ice',extra={}){
    const p=worlds.find(b=>b.id===parent),r=km>=200?18+Math.sqrt(km)*.72:5+Math.sqrt(km||0)*.6,orbit=p.radius*3.4+index*40+40,a=.4+index*1.7;
    worlds.push({id,name,parent,category,km,au:p.au,radius:r,position:[p.position[0]+Math.sin(a)*orbit,Math.sin(index*1.3)*orbit*.08,p.position[2]+Math.cos(a)*orbit],color,style,atmosphere:false,gravity:.3,terrain:color.map(v=>v*.8),note:'An airless, cold moon with ice and impact terrain.',...extra});
  }
  moon('moon','The Moon','earth','Airless moon',1737,0,[.58,.57,.54],'rock',{note:'Dark basalt maria and pale, densely cratered highlands.'});
  moon('phobos','Phobos','mars','Airless moon',11,0,[.35,.32,.28],'rock',{shape:[1.3,.9,1.0],note:'An irregular dark moon, with the large Stickney crater.'});
  moon('deimos','Deimos','mars','Airless moon',6,1,[.49,.45,.40],'rock',{shape:[1.2,.8,1],note:'A small, irregular moon with a smoother dusty surface.'});
  moon('callisto','Callisto','jupiter','Ice moon',2410,3,[.39,.37,.33],'ice',{note:'A dark, heavily cratered icy moon with bright impact scars.'});
  moon('europa','Europa','jupiter','Frozen moon',1561,1,[.90,.86,.74],'ice',{terrain:[.84,.85,.83],note:'Bright water ice crossed by reddish-brown fractures.'});
  moon('io','Io','jupiter','Volcanic moon',1822,0,[.88,.75,.31],'volcanic',{terrain:[.67,.52,.19],note:'Yellow sulfur terrain, dark volcanic centers and orange-red deposits.'});
  moon('ganymede','Ganymede','jupiter','Frozen moon',2634,2,[.52,.48,.42],'ice',{note:'The largest moon, slightly larger than Mercury; dark old terrain and brighter icy grooves.'});
  moon('titan','Titan','saturn','Paradise moon',2575,0,[.81,.56,.22],'cloud',{atmosphere:true,sky:[.50,.31,.09],terrain:[.43,.31,.15],note:'The paradise label is a game category. Titan is cold, with orange haze, methane lakes and dark dunes.'});
  moon('enceladus','Enceladus','saturn','Frozen moon',250,1,[.94,.96,.97],'ice',{terrain:[.86,.91,.94],interpretation:true,note:'Bright white fractured ice, geysers and a subsurface ocean. The ocean ecosystem and landing terrain are fictional.'});
  ['Miranda','Ariel','Umbriel','Titania','Oberon'].forEach((n,i)=>moon(n.toLowerCase(),n,'uranus',i===0?'Frozen moon':'Ice moon',[236,579,585,789,761][i],i,[[.64,.64,.63],[.68,.68,.66],[.36,.36,.35],[.57,.56,.54],[.48,.46,.43]][i]));
  moon('triton','Triton','neptune','Frozen moon',1353,6,[.77,.74,.70],'ice',{terrain:[.73,.74,.75],note:'Pale nitrogen frost, pinkish terrain and dark geyser streaks; retrograde orbit.'});
  [['Naiad',33],['Thalassa',41],['Despina',75],['Galatea',88],['Larissa',97],['Proteus',210],['Nereid',170],['Halimede',31],['Psamathe',20],['Sao',22],['Laomedeia',21],['Neso',30],['Hippocamp',17]].forEach(([n,r],i)=>moon(n.toLowerCase(),n,'neptune',i>=6?'Ice moon':'Airless moon',r,i>=6?i+1:i,[.36,.36,.35],'rock',{shape:r<230?[1.15,.86,1]:[1,1,1],interpretation:true,note:n==='Proteus'?'A dark, irregular, heavily cratered moon.':'A small Neptunian moon. Detailed surface terrain is an artistic interpretation.'}));
  moon('s2002n5','S/2002 N5','neptune','Ice moon',null,14,[.36,.36,.35],'ice',{interpretation:true,note:'A provisionally named outer moon of Neptune. Its display size and terrain are artistic approximations.'});
  moon('s2021n1','S/2021 N1','neptune','Ice moon',null,15,[.36,.36,.35],'ice',{interpretation:true,note:'A provisionally named outer moon of Neptune. Its display size and terrain are artistic approximations.'});
  moon('charon','Charon','pluto','Ice moon',606,0,[.59,.57,.55],'ice',{station:true,note:'Gray icy plains, chasms and a reddish north polar region. A fictional space station awaits on the surface.'});
  ['Styx','Nix','Kerberos','Hydra'].forEach((n,i)=>moon(n.toLowerCase(),n,'pluto','Ice moon',[5,25,10,26][i],i+1,[.70,.70,.69],'ice',{shape:[1.4,.8,1],note:'A small, irregular icy moon of Pluto.'}));
  moon('dysnomia','Dysnomia','eris','Ice moon',350,0,[.39,.41,.44],'ice',{interpretation:true,terrain:[.36,.38,.42],note:'Eris’s moon, under Erisian control. Dark, cratered ice; surface appearance and gameplay scale are artistic interpretations.'});
  const byId=Object.fromEntries(worlds.map(w=>[w.id,w]));
  const belts=[{id:'asteroid',name:'ASTEROID BELT',inner:3550,outer:4210,count:900,color:[.36,.32,.28]},{id:'kuiper',name:'KUIPER BELT',inner:9450,outer:11200,count:1350,color:[.53,.55,.57]}];
  return{worlds,byId,belts};
})();
