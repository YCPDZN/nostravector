// The original station has a fixed geographic anchor, independent of where you land.
const NVCharonStation=(()=>{
 const geo={lat:25/24000,lon:24/24000},approach={lat:0,lon:24/24000};
 function local(s){const p=s.space,g=p?.geo;return g?.global?{x:(p.landingX||0)+NVWorldFlight.wrap(-g.lon)*24000*Math.max(.05,Math.cos(g.lat*Math.PI/180))+24,z:(p.landingZ||0)-g.lat*24000+25}:{x:24,z:25};}
 const robot=s=>{const q=local(s);return{x:q.x+4,z:q.z-6};};
 function waypoint(s){const p=s.space;if((p.system||'sol')!=='sol')return null;if(p.body==='charon'&&['landed','off'].includes(p.phase)){const q=local(s);return{x:q.x,z:q.z-6,label:'Charon Space Station'};}if(p.body==='charon'&&['atmosphere','ascent','descent'].includes(p.phase))return{geo,label:'Charon Space Station'};if(['landed','cockpit','off'].includes(p.phase))return{x:p.landingX,z:p.landingZ,label:'Return to ship · Charon Space Station'};const b=NVSol.byId.charon;return{space:true,position:b.position,radius:b.radius,label:'Charon Space Station'};}
 return{geo,approach,local,robot,waypoint};
})();
