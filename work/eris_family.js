// Court relatives use separate identities and character-scoped manual saves.
const NVErisFamily=(()=>{
  const quotes={nyrexia:[
    'I am Nyrexia Erisconos. If you have come looking for my sister Vishara, you have found the right family.',
    'People see her crown before they see her heart. I adore her, even when duty makes her seem distant.',
    'She made this citadel a home in a place the Sun has almost forgotten. I think that is worth protecting.',
    'Still, I would like to see those distant worlds for myself. A window is a poor substitute for a journey.',
    'If you would have me, Wanderer, I will travel with you. There is so much beyond Eris that I want to see.'
  ],alexia:[
    'Alexia Erisconos. Spare me the bow; I have seen enough people bend themselves for this family.',
    'My sister Vishara mistakes obedience for affection. I despise the empire she has wrapped around herself.',
    'Nyrexia adores her. She sees a loving sister where I see a crown that never stops asking for more.',
    'Look at this citadel: beautiful walls, polished silver, and so many things nobody is permitted to question.',
    'Trust whom you choose, Wanderer. But never let a royal name make that choice for you.'
  ]};
  const fresh=()=>({recruited:false,x:-7,z:63,yaw:Math.PI,body:'eris',phase:0,speed:0});
  function restore(raw){const n=fresh();if(!raw)return n;n.recruited=raw.recruited===true;for(const k of ['x','z','yaw','phase'])if(Number.isFinite(raw[k]))n[k]=raw[k];if(NVSol.byId[raw.body])n.body=raw.body;return n;}
  function ensure(s){const e=NVEris.ensure(s);return e.nyrexia||(e.nyrexia=fresh());}
  const exiled=s=>{const q=s?.eris?.solWar?.solFall;return q?.settled===true||q?.stage==='done';};
  const canRecruit=s=>!ensure(s).recruited&&!exiled(s);
  function npcs(s){if(!NVEris.sandbox(s)||!NVEris.groundPlay(s))return[];const n=ensure(s),id=NVEris.world(s),out=[];
    if(n.recruited)out.push({...n,name:'Nyrexia Erisconos',kind:'nyrexia'});
    else if(id==='eris'&&!exiled(s))out.push({x:-7,z:63,yaw:Math.PI,name:'Nyrexia Erisconos',kind:'nyrexia',speed:0,phase:0});
    if(id==='eris')out.push({x:9,z:67,yaw:Math.PI,name:'Alexia Erisconos',kind:'alexia',speed:0,phase:0});return out;
  }
  function follow(s,dt){const n=ensure(s);if(!n.recruited||!NVEris.groundPlay(s))return;const id=NVEris.world(s);if(n.body!==id){n.body=id;n.x=s.x-2;n.z=s.z-2;}
    const old={x:n.x,z:n.z},dx=s.x-n.x,dz=s.z-n.z,d=Math.hypot(dx,dz),amount=Math.min(Math.max(0,d-2.8),NVAntarctica.SPRINT*1.2*dt);
    if(amount>0){n.x+=dx/d*amount;n.z+=dz/d*amount;n.yaw=Math.atan2(dx,dz);}
    if(id==='eris'&&typeof NVCitadel!=='undefined')NVCitadel.resolve(n,old,(x,z)=>NVLandscapes.height(x,z,s.seed,'eris'));
    n.speed=dt>0?Math.hypot(n.x-old.x,n.z-old.z)/dt:0;n.phase+=NVAntarctica.gaitAdvance(n.speed,dt);
  }
  function recruit(s){const n=ensure(s);if(!canRecruit(s))return false;n.recruited=true;n.body=NVEris.world(s);return true;}
  return{quotes,fresh,restore,ensure,exiled,canRecruit,npcs,follow,recruit};
})();
function erisFamilyPart(q,kind){
  const clothes=/gown|bodice|sleeve|cuff|mantle|ermine|girdle|clasp|filigree|petal|vine|slipper|necklace|earring/i.test(q.name);
  const c=clothes?(kind==='alexia'?[.025,.022,.034]:[.60,.67,.85]):q.name.startsWith('Iris')?(kind==='alexia'?[.25,.65,.39]:[.33,.58,.86]):q.c;
  return {...q,c};
}
