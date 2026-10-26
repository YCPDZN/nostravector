// Provoking Arjaximon permanently ends this save's isolationist policy. Actual
// invasions use the existing paced war fronts, capture rules and galaxy gates.
const NVChimaeraOffensive=(()=>{
 const FACTION='CHIMAERA_SCOURGE';
 const ensure=s=>NVEris.ensure(s).chimaeraOffensive||(NVEris.ensure(s).chimaeraOffensive={provoked:false});
 const playerWar=q=>!!q?.wars?.some(w=>w.aggressor==='CUSTOM'&&w.defender===FACTION&&['active','won','ended'].includes(w.stage));
 const mobilised=s=>chapter5Unlocked(s)&&(ensure(s).provoked||playerWar(s.eris?.galacticDiplomacy));
 function awaken(s){if(!chapter5Unlocked(s)||ensure(s).provoked)return false;ensure(s).provoked=true;const text='ARJAXIMON HAS ENDED HIS ISOLATIONISM / THE CHIMAERA SCOURGE IS MOBILISING FOR INTERGALACTIC WAR';const q=NVGalacticDiplomacy.ensure(s);q.history.unshift(text);q.history=q.history.slice(0,80);NVSpace.notice(s.space,text);return true;}
 const restore=(raw,diplomacy)=>({provoked:raw?.provoked===true||playerWar(diplomacy)});
 return{FACTION,ensure,playerWar,mobilised,awaken,restore};
})();
const chimaeraOffensiveRestore=NVEris.restore;NVEris.restore=raw=>{const e=chimaeraOffensiveRestore(raw);e.chimaeraOffensive=NVChimaeraOffensive.restore(raw?.chimaeraOffensive,e.galacticDiplomacy);return e;};
const chimaeraWarDeclaration=NVGalacticDiplomacy.declare;NVGalacticDiplomacy.declare=(s,a,b,...args)=>{const result=chimaeraWarDeclaration(s,a,b,...args);if(result.ok&&a==='CUSTOM'&&b===NVChimaeraOffensive.FACTION)NVChimaeraOffensive.awaken(s);return result;};
