// Cached native meshes: a summoned orb and a spatial, star-by-star hologram.
// Static light and deterministic positions avoid flashes or regenerated noise.
function createArchamusOrb(M,upload,draw,canvas){
 const build=fn=>{const b=M.builder();fn(b);return b.parts().map(upload);},cyan=[.27,.76,.83],dark=[.055,.16,.22];
 const orb=build(b=>{b.sphere(0,0,0,.19,dark,24,12);b.sphere(0,.025,-.07,.145,cyan,20,10);b.ring(0,0,0,.235,.018,[.69,.58,.32],64);b.ring(0,.095,0,.17,.012,cyan,48);});
 const noise=n=>{const v=Math.sin(n*127.1+311.7)*43758.5453;return v-Math.floor(v);};
 const galaxy=build(b=>{for(let arm=0;arm<4;arm++)for(let i=0;i<220;i++){const u=(i+1)/221,r=Math.sqrt(u)*1.12,a=u*5.9+arm*Math.PI/2+(noise(i+arm*1000)-.5)*.33,x=Math.cos(a)*r+(noise(i*3+arm)-.5)*.065,z=Math.sin(a)*r+(noise(i*5+arm)-.5)*.065,y=(noise(i+arm*17)-.5)*.055,w=.007+noise(i+arm*99)*.012;b.box(x,y,z,w,w,w,i%5?[.28,.55,.72]:[.85,.77,.59]);}b.sphere(0,0,0,.10,[.94,.84,.64],20,10);for(const r of [.4,.74,1.16])b.ring(0,-.04,0,r,.004,[.09,.25,.32],96);});
 const rays=build(b=>{for(let i=0;i<6;i++){const a=i/6*Math.PI*2;b.beam([Math.cos(a)*.09,.13,Math.sin(a)*.09],[Math.cos(a)*.8,.86,Math.sin(a)*.8],.006,[.1,.29,.34]);}});
 const lost=Array.from({length:14},(_,i)=>build(b=>{const a=i*2.399+.6,r=.43+noise(i+44)*.45,x=Math.cos(a)*1.12*r,z=Math.sin(a)*1.12*r;b.sphere(x,.05,z,.028,[.035,.045,.06],8,4);b.beam([x-.025,.075,z-.025],[x+.025,.075,z+.025],.007,[.69,.24,.3]);b.beam([x-.025,.075,z+.025],[x+.025,.075,z-.025],.007,[.69,.24,.3]);}));
 return q=>{const active=!!q?.briefing;canvas.dataset.archamusOrb=active?'summoned':'';canvas.dataset.archamusGalaxy=active&&q.index>=4?'projected':'';canvas.dataset.lostBeacons=active&&q.index>=4?String(8+Math.min(6,Math.floor((q.index-4)/2))):'0';if(!active)return;
  const u=Math.min(1,Math.max(0,q.elapsed/1.2)),size=u*u*(3-2*u),root=M.mul(M.t(-.95,1.55,17.35),M.scale(Math.max(.001,size),Math.max(.001,size),Math.max(.001,size)));canvas.dataset.orbSummon=size.toFixed(3);for(const p of orb)draw(p,root,1);
  if(q.index<4)return;for(const p of rays)draw(p,root,1);const projection=M.mul(root,M.mul(M.t(0,.92,0),M.rx(.48)));for(const p of galaxy)draw(p,projection,1);for(let i=0;i<Number(canvas.dataset.lostBeacons);i++)for(const p of lost[i])draw(p,projection,1);
 };
}
