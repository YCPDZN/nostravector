const NVJaniraVictory=(()=>{
 const QUOTES=[
  'Janira Prime once again belongs to the Chompy Empire.',
  'The guns above Karribassa have fallen silent. Terra Imperia’s blockade is broken, and our people can finally look to the sky without fear.',
  'You stood with us when Hawthorne believed this world was already his. His commanders are defeated, his occupation is over, and our home is free.',
  'To the Federation, the Erisian Resistance, and every crew that answered our signal: this victory belongs to all of us. Now we must shelter the wounded and rebuild what was taken.',
  'Today, we reclaim our home. Rest now, Wanderer, and let the people of Janira Prime see the dawn they fought to reach. When the time comes, we will face what lies beyond it together.'
 ];
 const raw=s=>s?.eris?.solWar?.solFall?.expedition?.blockade;
 const liberated=s=>raw(s)?.liberated===true;
 const fresh=()=>({stage:'waiting',line:0,elapsed:0,voiceTime:0});
 function restore(r){return{stage:['waiting','speech','done'].includes(r?.stage)?r.stage:'waiting',line:Math.max(0,Math.min(4,Math.floor(Number(r?.line)||0))),elapsed:Math.max(0,Math.min(300,Number(r?.elapsed)||0)),voiceTime:Math.max(0,Math.min(300,Number(r?.voiceTime)||0))};}
 const ensure=s=>{const siege=NVJaniraSiege.ensure(s);return siege.victory||(siege.victory=fresh());};
 function eligible(s){const siege=raw(s)?.siege,r=siege?.commanders?.resolution;return siege?.stage==='arrived'&&siege.commanders?.completed===true&&r?.stage==='done'&&['malia','croxian'].every(id=>['spare','kill'].includes(r.choices?.[id]));}
 function settle(s){
  if(!eligible(s)&&!liberated(s))return false;
  const b=NVJaniraBlockade.ensure(s),v=ensure(s);if(b.liberated)return false;
  b.liberated=true;b.active=false;b.metHak=true;b.hull=[];
  const q=NVJaniraSiege.ensure(s);q.musicEnded=true;q.musicTime=0;
  if(q.armada){q.armada.hull=[];q.armada.roster=[];}
  v.stage='speech';v.line=0;v.elapsed=0;
  const w=NVSolWar.ensure(s);w.owners['janira-prime']='CHOMPY';delete w.sieges['janira-prime'];
  NVJaniraExpedition.ensure(s).returned=true;
  // Clear transient combat locks without altering normal traffic or other systems' wars.
  if((s.space?.system||'sol')==='janira-proxima'){s.space.combatActive=false;s.space.combatTimer=0;s.space.autopilot=false;}
  NVSurfaceNavigation.clear(s);NVQuests.update(s);return true;
 }
 function next(s){const v=ensure(s);if(!liberated(s)||v.stage!=='speech')return false;v.elapsed=0;v.voiceTime=0;if(v.line<4)v.line++;else{v.stage='done';NVQuests.update(s);}return true;}
 return{QUOTES,raw,liberated,fresh,restore,ensure,eligible,settle,next};
})();
const victorySiegeRestore=NVJaniraSiege.restore;NVJaniraSiege.restore=raw=>({...victorySiegeRestore(raw),victory:NVJaniraVictory.restore(raw?.victory)});
const victoryBlockadeRestore=NVJaniraBlockade.restore;NVJaniraBlockade.restore=raw=>{const b=victoryBlockadeRestore(raw);b.liberated=raw?.liberated===true;if(b.liberated){b.active=false;b.hull=[];}return b;};
const victoryBlockadeStep=NVJaniraBlockade.step;NVJaniraBlockade.step=s=>{if(NVJaniraVictory.liberated(s)||NVJaniraVictory.settle(s))return;return victoryBlockadeStep(s);};
const victoryChoose=NVKarribassaBosses.choose;NVKarribassaBosses.choose=(s,...args)=>{const ok=victoryChoose(s,...args);if(ok)NVJaniraVictory.settle(s);return ok;};
const victoryFaction=NVEris.faction;NVEris.faction=(s,id)=>id==='janira-prime'&&NVJaniraVictory.liberated(s)?'CHOMPY':victoryFaction(s,id);
const victoryConquer=NVSolWar.canConquer;NVSolWar.canConquer=(s,f,id)=>id==='janira-prime'&&NVJaniraVictory.liberated(s)?false:victoryConquer(s,f,id);
const victoryShips=NVSolWar.ships;NVSolWar.ships=s=>{const list=victoryShips(s);return NVJaniraVictory.liberated(s)?list.filter(v=>!v.blockade&&!v.siegeEscort&&!v.janiraInstanced&&!(v.system==='janira-proxima'&&(v.faction==='TERRA'||v.faction?.startsWith('TERRA_')))):list;};
// The optional grief scene follows Hak's victory speech rather than interrupting it.
const victoryMascarTrigger=NVVengefulMascar.trigger;NVVengefulMascar.trigger=s=>NVJaniraVictory.eligible(s)&&NVJaniraVictory.ensure(s).stage!=='done'?false:victoryMascarTrigger(s);
const victoryPatrolPalette=NVOccupation.palette;NVOccupation.palette=(s,f)=>f==='CHOMPY'?[[.36,.12,.60],[.18,.52,1]]:victoryPatrolPalette(s,f);
NVQuests.definitions.push({id:'janira-liberation',chapter:3,title:'Janira Prime liberated',description:'Resolve the fate of both Imperial commanders and hear Hak Chompjak reclaim Janira Prime for the Chompy Empire.',available:s=>NVJaniraVictory.liberated(s),done:s=>NVJaniraVictory.raw(s)?.siege?.victory?.stage==='done'});
// The quest registry was created before this entry; explicitly retain its completion on restore.
const victoryQuestRestore=NVQuests.restore;NVQuests.restore=raw=>{const q=victoryQuestRestore(raw);if(raw?.completed?.includes('janira-liberation'))q.completed.push('janira-liberation');return q;};
