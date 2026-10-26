function createBrownBastionScenery({object,ground}){
 return(s,time)=>{const n=NVBrownBastion.local(s);if(!n||Math.hypot(s.x-n.x,s.z-n.z)>2600)return;const dark=[.075,.10,.12],steel=[.19,.24,.28],cyan=[.08,.85,.95],snow=[.68,.77,.82];
 const box=(x,h,z,w,height,d,c=dark,emissive=0)=>object(n.x+x,ground(n.x+x,n.z+z,s.seed)+h,n.z+z,w,height,d,c,0,emissive);
 for(const [x,z,w,d]of NVBrownBastion.solids){const tower=w===27,h=tower?65:w===48?34:z===130?48:22;box(x,h/2,z,w,h,d);box(x,h+1,z,w+2,2,d+2,steel);if(tower){for(let y=10;y<65;y+=12){box(x,y,z-13.6,19,1,.12,cyan,.7);box(x+13.6,y,z,.12,1,19,cyan,.7);}box(x,73,z,1,16,1,steel);box(x,81,z,2,1,2,cyan,1);box(x,68,z,14,4,14,steel);box(x,70,z-8,2,2,19,steel);}else if(w===8||d===8){const horizontal=d===8,len=horizontal?w:d;for(let a=-len/2+10;a<len/2;a+=20)box(x+(horizontal?a:0),24,z+(horizontal?0:a),horizontal?7:3,4,horizontal?3:7,steel);}}
 // Monumental gate: clear passage at ground level, no invisible door collider.
 box(0,32,-180,48,8,10,steel);box(0,32,-185.1,32,1.5,.2,cyan,1);
 for(const x of [-23,23]){box(x,15,-180,3,30,12,steel);box(x,15,-186.1,.6,24,.15,cyan,.8);}
 // The original research module remains visible inside its expanded command compound.
 box(0,2,0,12,4,11,snow);box(0,4.2,0,13,.4,12,[.4,.07,.1]);
 for(const x of [-3.7,3.7])box(x,2.6,-5.6,2,1,.1,[.55,.8,.88],.4);
 box(0,2,-5.7,1.8,3,.1,steel);
 // Reinforced command wings, landing deck, floodlights and faction standards.
 for(const x of [-85,85]){for(let y=6;y<=30;y+=6)box(x,y,54.8,38,1,.1,cyan,.55);box(x,36,85,52,3,64,steel);}
 box(0,50,130,64,3,40,steel);box(0,54,130,3,8,3,cyan,.8);
 box(94,.08,-90,74,.16,64,steel);for(const x of [64,124])box(x,.2,-90,1,.2,52,cyan,.5);for(const z of [-116,-64])box(94,.2,z,60,.2,1,cyan,.5);
 for(const x of [-42,42])for(const z of [-135,20,140]){box(x,11,z,.4,22,.4,steel);box(x,22,z,6,.7,2,[.8,.96,1],1);}
 for(const x of [-30,30]){box(x,17,-155,.3,34,.3,steel);for(let i=0;i<10;i++)box(x+1+i*.8,30,-155+Math.sin(time*2+i*.4)*.45,.85,7,.15,i<3?cyan:dark);}
 };
}
