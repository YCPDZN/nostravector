// Combat recruitment and loadouts are scoped to the current character save.
const NVCombatCrew=(()=>{
 const TYPES=['laser','ice','scythe','hammer','grinder','rifle','unarmed'];
 const fresh=()=>({recruited:[],pontifex:[],pending:''});
 function restore(raw){const q=fresh();if(!raw)return q;q.pontifex=(Array.isArray(raw.pontifex)?raw.pontifex:[]).filter(n=>/^pm-\d+$/.test(n.id)).map(n=>({id:n.id,name:String(n.customName?n.name:NVPontifex.maleName(n.name||'Pontifex Maximus',Number(n.id.slice(3)))).slice(0,70),gender:'male',customName:n.customName===true,choice:['spare','kill'].includes(n.choice)?n.choice:''}));q.recruited=[...new Set((raw.recruited||[]).filter(id=>['malia','croxian',...q.pontifex.filter(n=>n.choice==='spare').map(n=>n.id)].includes(id)))];q.pending=q.pontifex.some(n=>n.id===raw.pending&&!n.choice)?raw.pending:'';return q;}
 const ensure=s=>{const e=s.eris||(s.eris=NVEris.fresh());return e.combatCrew||(e.combatCrew=fresh());};
 function register(q){for(const n of q.pontifex){const old=NVParty.members.find(m=>m.id===n.id);if(old){old.name=n.name;old.gender='male';}else NVParty.members.push({id:n.id,name:n.name,detail:'RECRUITED PONTIFEX',pontifex:true,gender:'male'});}}
 function available(s,id){const q=ensure(s);if(id==='malia'||id==='croxian')return NVKarribassaBosses.ensure(s).resolution.choices[id]==='spare';return q.pontifex.some(n=>n.id===id&&n.choice==='spare');}
 function recruit(s,id){const q=ensure(s);if(!available(s,id)||q.recruited.includes(id)||NVParty.list(s).length+NVCustomCrew.crew(s).length>=NVParty.capacity(s))return false;q.recruited.push(id);NVGovernance.ensure(s).roles[id]='ship';register(q);return true;}
 function offer(s){const b=NVPontifex.ensure(s),q=ensure(s);if(q.pending||b.alive||b.hp>0||b.generation<1||b.identity==='james-brown')return false;const id='pm-'+b.generation;if(q.pontifex.some(n=>n.id===id))return false;q.pontifex.push({id,gender:'male',customName:false,name:b.sourceCaptain?b.sourceCaptain+' / Pontifex':'Pontifex Maximus '+b.generation,choice:''});q.pending=id;register(q);return true;}
 function choose(s,choice){const q=ensure(s),n=q.pontifex.find(n=>n.id===q.pending);if(!n||!['spare','kill'].includes(choice))return false;n.choice=choice;q.pending='';NVPontifex.ensure(s).deathTime=choice==='spare'?0:7;return true;}
 function renamePontifex(s,id,name){if(!/^pm-\d+$/.test(id))return false;const q=ensure(s),n=q.pontifex.find(n=>n.id===id&&n.choice==='spare');if(!n||!q.recruited.includes(id))return false;const text=String(name||'').trim().replace(/\s+/g,' ').slice(0,48);if(!text)return false;n.name=text;n.customName=true;n.gender='male';register(q);return true;}
 function weapon(s,n){const value=n?.combat?.weapon;return TYPES.includes(value)?value:'laser';}
 function configure(s,id,weapon,pattern){const n=NVCustomCrew.record(s,id);if(!n||NVBCCombat.kind(n)||!TYPES.includes(weapon))return false;n.combat={weapon,pattern:['balanced','rapid','heavy'].includes(pattern)?pattern:'balanced'};return true;}
 const helmet=s=>s.space?.body!=='earth'&&(['flight','cockpit','ascent','descent','atmosphere'].includes(s.space?.phase)||NVSol.byId[s.space?.body]?.atmosphere===false);
 const caches=new Map();
 function model(id,s){const key=id+':'+(id==='croxian'?helmet(s):'');if(caches.has(key))return caches.get(key);let raw,scale=1;
  if(id==='orion')raw=ORION_PARTS;
  else if(id==='nyrexia')raw=MENU_NYREXIA_PARTS;
  else if(id==='khazglar'){raw=KhazglarModel.meshes;scale=.42;}
  else if(id==='kizna'||id==='charon'){raw=CharonRobotModel.meshes;scale=.43;}
  else if(id==='malia'||id==='croxian'){raw=KarribassaBossModels[id].meshes;scale=.54;if(id==='croxian'&&!helmet(s)){
   raw=raw.filter(p=>p.bone!=='head');const head=ORION_PARTS.filter(p=>/^(Face|Jaw|Hair|Eyebrow|Eye|Iris|Pupil|Nose|Ear|Mouth)/i.test(p.name)&&!/Beard|Goggle|Cybernetic/i.test(p.name)).map(p=>({...p,p:p.p.flat().map((v,i)=>i%3===0?v*1.85:i%3===1?(v-1.55)*1.85+3.67:v*1.85),n:p.n.flat(),indices:p.f||p.indices,color:/Hair|Eyebrow/.test(p.name)?[.10,.065,.045]:p.c||p.color,bone:'head'}));raw=[...raw,...head];
  }}else{raw=(id==='james'?BrownCompanionArmour:PontifexModel).meshes.filter(p=>!/heart/i.test(p.name));if(id==='james')raw=[...raw,...PontifexModel.meshes.filter(p=>p.bone==='weapon')];scale=.48;}
  const parts=raw.map(p=>({...p,p:p.p.flat(),n:p.n.flat(),f:p.f||p.indices,c:p.c||p.color}));const result={parts,scale};caches.set(key,result);return result;
 }
 return{TYPES,fresh,restore,ensure,register,available,recruit,offer,choose,renamePontifex,configure,weapon,helmet,model};
})();
for(const m of [{id:'malia',name:'Malia de Toro',detail:'RECRUITED COMMANDER'},{id:'croxian',name:'Croxian Mascar',detail:'RECRUITED COMMANDER'}])NVParty.members.push(m);
const combatPartyList=NVParty.list;NVParty.list=function(s){if(!s)return[];const q=s.eris?.combatCrew||NVCombatCrew.fresh();NVCombatCrew.register(q);return[...combatPartyList.call(this,s).filter(n=>!['malia','croxian'].includes(n.id)&&!n.id.startsWith('pm-')),...NVParty.members.filter(n=>q.recruited.includes(n.id))].slice(0,NVParty.capacity(s));};
const combatCrewRestore=NVEris.restore;NVEris.restore=r=>{const q=NVCombatCrew.restore(r?.combatCrew);NVCombatCrew.register(q);const e=combatCrewRestore(r);e.combatCrew=q;return e;};
const combatCustomRestore=NVCustomCrew.restore;NVCustomCrew.restore=r=>{const q=combatCustomRestore(r);for(const n of q.characters){const c=r?.characters?.find(v=>v.id===n.id)?.combat;if(c)n.combat={weapon:NVCombatCrew.TYPES.includes(c.weapon)?c.weapon:'laser',pattern:['balanced','rapid','heavy'].includes(c.pattern)?c.pattern:'balanced'};}return q;};
const combatInteriorCrew=NVShipInterior.crew;NVShipInterior.crew=s=>{const list=combatInteriorCrew(s),q=NVCombatCrew.ensure(s);for(const [i,id]of q.recruited.entries())if(NVGovernance.role(s,id)!=='governor'&&!list.some(n=>n.id===id)){const n=NVParty.members.find(n=>n.id===id),t=(s.space.time||0)*.12+i;list.push({id,name:n.name,deck:1,x:(i%2?-1:1)*(2.7+Math.sin(t)*.4),z:-8+i*3+Math.cos(t)*.8,yaw:Math.sin(t)*.4,model:'combat',speed:.2,phase:t});}return list;};
const combatPMStrike=NVPontifex.strike;NVPontifex.strike=(s,source)=>{const result=combatPMStrike(s,source);if(result)NVCombatCrew.offer(s);return result;};
const combatPMDamage=NVPontifex.damage;NVPontifex.damage=(s,n,source)=>{const result=combatPMDamage(s,n,source);if(result)NVCombatCrew.offer(s);return result;};
