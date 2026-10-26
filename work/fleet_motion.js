// Continuous fleet motion and small, softly faded projectiles; no screen-wide battle flashes.
const NVFleetMotion=(()=>{
 const turn=(from,to,rate,dt)=>{const a=Math.atan2(Math.sin(to-from),Math.cos(to-from));return from+Math.max(-rate*dt,Math.min(rate*dt,a));};
 function move(v,target,dt,speed=90){const delta=target.map((n,i)=>n-v.position[i]),d=Math.hypot(...delta),step=Math.min(d,speed*dt);if(d>.01){v.position=v.position.map((n,i)=>n+delta[i]/d*step);v.yaw=turn(v.yaw||0,Math.atan2(delta[0],delta[2]),.7,dt);const pitch=Math.atan2(delta[1],Math.hypot(delta[0],delta[2]));v.pitch=(v.pitch||0)+Math.max(-.4*dt,Math.min(.4*dt,pitch-(v.pitch||0)));}return d;}
 function orbit(body,index,time,count=64,faction=0){const layer=Math.floor(index/24),a=(index%24)/24*Math.PI*2+layer*.17+faction*.23+time*.035,r=body.radius*3+100+layer*55+faction*32;return[body.position[0]+Math.cos(a)*r,body.position[1]+body.radius+65+layer*38+faction*34+Math.sin(a*1.3)*12,body.position[2]+Math.sin(a)*r];}
 function bolt(from,to,color,time,key=0){const d=to.map((n,i)=>n-from[i]),length=Math.hypot(...d);if(!Number.isFinite(length)||length<1)return null;const phase=((time*.28+key*.61803398875)%1+1)%1,light=Math.sin(Math.PI*phase)**2*.55,tail=Math.min(.045,22/length);return{from:from.map((n,i)=>n+d[i]*Math.max(0,phase-tail)),to:from.map((n,i)=>n+d[i]*phase),color:color.map(n=>n*light)};}
 return{turn,move,orbit,bolt};
})();
