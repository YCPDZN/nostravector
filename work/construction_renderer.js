function createConstructionScenery({object,rock,sphere,ground}){
 return s=>{if(!NVConstruction.groundPlay(s))return;const C=NVConstruction;
  const crate=C.toolCrate(s);if(crate){const y=ground(crate.x,crate.z,s.seed);object(crate.x,y+.6,crate.z,1.7,1.2,1.2,[.90,.63,.15]);object(crate.x,y+2.7,crate.z,.08,4,.08,[.4,.9,1],0,.6);}
  for(const n of C.nodes(s)){if(Math.hypot(n.x-s.x,n.z-s.z)>65)continue;const y=ground(n.x,n.z,s.seed);
   if(n.kind==='wood'){const living=s.africaStarted&&NVEris.world(s)==='earth'||NVEris.world(s)==='titan';if(living){object(n.x,y+1.4,n.z,.35,2.8,.35,[.35,.20,.09],0,0,sphere);for(let i=0;i<3;i++)object(n.x+Math.sin(i*2)*.45,y+2.4+i*.4,n.z+Math.cos(i*2)*.4,1.6,1.5,1.6,[.19,.37,.16],i,0,sphere);}else{for(let i=0;i<3;i++)object(n.x+i*.25,y+.25+i*.1,n.z,1.6,.22,.3,[.40,.25,.13],.3+i*.2,0,rock);}}
   else if(n.kind==='solarCell'){object(n.x,y+.25,n.z,1.5,.18,.9,[.09,.24,.47],.25);for(let i=0;i<4;i++)object(n.x-.55+i*.35,y+.35,n.z,.025,.015,.85,[.5,.8,.95],.25,.15);}
   else{object(n.x,y+.6,n.z,1.6,1.3,1.4,n.kind==='stone'?[.45,.46,.48]:[.26,.33,.36],.6,0,rock);if(n.kind==='metal')for(let i=0;i<4;i++)object(n.x+Math.sin(i*2)*.5,y+.9+(i%2)*.15,n.z+Math.cos(i*2)*.45,.3,.22,.3,[.38,.68,.71],i,.12,rock);}
  }
  function piece(q,ghost=false){const col=ghost?[.2,.75,.7]:C.materials[q.material].color,draw=(x,y,z,w,h,d,color=col)=>{const co=Math.cos(q.yaw),si=Math.sin(q.yaw);object(q.x+x*co+z*si,q.y+y,q.z-x*si+z*co,w,h,d,color,q.yaw,ghost?.25:0);};
   if(q.type==='foundation')draw(0,.15,0,4,.3,4);
   if(q.type==='wall')draw(0,1.5,-2,4,3,.2);
   if(q.type==='door'){draw(-1.4,1.5,-2,1.2,3,.2);draw(1.4,1.5,-2,1.2,3,.2);draw(0,2.75,-2,1.6,.5,.2);if(!q.open)draw(0,1.25,-2,1.5,2.5,.12,[.32,.47,.51]);}
   if(q.type==='roof')draw(0,3,0,4.2,.2,4.2);
   if(q.type==='stairs')for(let i=0;i<10;i++)draw(0,(i+1)*.15,-1.8+i*.4,4,(i+1)*.3,.4);
   if(q.type==='solar'){draw(0,.8,0,.15,1.6,.15,[.5,.6,.65]);draw(0,1.65,0,3,.15,2.5);for(let i=0;i<4;i++)draw(-1.1+i*.73,1.74,0,.04,.02,2.4,[.3,.8,1]);draw(1,.35,1,1,.7,1,[.15,.35,.4]);}
  }
  for(const q of C.localPieces(s))if(Math.hypot(q.x-s.x,q.z-s.z)<250)piece(q);
  if(typeof constructionOpen!=='undefined'&&constructionOpen)piece(C.preview(s,$('#constructionPiece').value,$('#constructionMaterial').value,constructionYaw,constructionPlacement()),true);
 };
}
