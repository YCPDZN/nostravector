function createAmGrekScenery({M,draw,mesh,object,ground}){
 const parts=GrekModel.meshes.map(m=>({...mesh({p:m.p,n:m.n,f:m.indices}),color:m.color,bone:m.bone,name:m.name}));
 return(s,time)=>{const n=NVAmGrek.npc(s);if(!n||Math.hypot(s.x-n.x,s.z-n.z)>240)return;const y=ground(n.x,n.z),root=M.mul(M.t(n.x,y+Math.sin(time*1.2)*.012,n.z),M.mul(M.ry(n.yaw+Math.sin(time*.3)*.035),M.scale(.74,.74,.74)));
  for(const m of parts){let pose=root;if(n.speed>0&&/thigh|knee|shin|boot|upper arm|elbow|gauntlet|hand|finger|thumb/.test(m.name)){const side=m.name.includes(' -1')?-1:1,stride=Math.sin(n.phase+(side<0?Math.PI:0))*.28;pose=M.mul(root,M.t(0,/thigh|knee|shin|boot/.test(m.name)?Math.max(0,stride)*.18:0,stride));}draw(m,pose,m.color,0,m.name.startsWith('eye')?.18:0);}
  const green=[.30,.90,.57],dark=[.09,.13,.16];object(n.x+3,y+1.8,n.z,.10,3.6,.10,dark);object(n.x+3.7,y+2.7,n.z,1.5,.9,.05,green,0,.2);object(n.x+3.7,y+2.7,n.z-.04,.16,.6,.06,[.88,.75,.39],0,.2);
 };
}
const amGrekSolScenery=createSolScenery;createSolScenery=options=>{let amGrekWorldState=null;const previous=amGrekSolScenery(options),leader=createAmGrekScenery({...options,ground:(x,z)=>NVEcology.ground(amGrekWorldState,x,z)});return(s,time,animation)=>{previous(s,time,animation);amGrekWorldState=s;leader(s,time);};};
