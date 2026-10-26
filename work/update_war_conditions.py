from pathlib import Path
root=Path(__file__).parent
def edit(file,old,new):
 p=root/file;s=p.read_text(encoding='utf-8');assert old in s,(file,old[:100]);p.write_text(s.replace(old,new),encoding='utf-8')
edit('galactic_diplomacy_core.js',"VASSALAGE:'Defeat the faction and make it a puppet of the aggressor. It keeps its identity and worlds.'","VASSALAGE:'Defeat the faction leader to make their empire a puppet. It keeps its identity, troops and worlds.'")
edit('galactic_diplomacy_core.js',"ANNIHILATION:'Destroy the faction permanently. It returns only through a successful Restoration war.'","ANNIHILATION:'Capture every planet and moon controlled by the faction to destroy it permanently. Defeating its leader alone is not enough.'")
edit('galactic_diplomacy_core.js',"RESTORATION:'Fight the current occupier to restore a faction previously destroyed by Annihilation.'","RESTORATION:'Restore a faction destroyed by Annihilation by defeating the occupying puppet ruler or their overlord’s leader.'")
edit('galactic_diplomacy_core.js',"automatic:w.automatic===true","automatic:w.automatic===true,leaderDefeated:w.leaderDefeated===true")
edit('galactic_diplomacy_core.js',"if(w.stage!=='active'||w.original.some(id=>owner(s,id)===w.defender))return false;","if(!NVWarOutcomes.ready(s,w))return false;")
edit('galactic_diplomacy_core.js',"if(owner(s,id)===w.aggressor&&!NVGovernance.protectedWorld(s,id))q.owners[id]=w.restore;","if([w.aggressor,w.defender].includes(owner(s,id)))q.owners[id]=w.restore;")
edit('frontline_campaign.js',"function canEnforce(s,w){NVGalacticDiplomacy.targets(s,w);return w.stage==='active'&&w.aggressor==='CUSTOM'&&w.original.length>0&&w.original.every(id=>NVEris.faction(s,id)==='CUSTOM');}","function canEnforce(s,w){NVGalacticDiplomacy.targets(s,w);return w.aggressor==='CUSTOM'&&NVWarOutcomes.ready(s,w);}")
# The closure-local settlement function also uses the same rule; UI and AI cannot bypass it.
edit('frontline_campaign.js',"function advance(s,w,seconds){const q=", "function advance(s,w,seconds){if(NVWarOutcomes.ready(s,w)){NVGalacticDiplomacy.settle(s,w);return;}const q=")
edit('frontline_campaign.js',"NVSpace.notice(p,text);NVQuests.update(s);return{ok:true,text};}","NVSpace.notice(p,text);for(const w of NVGalacticDiplomacy.ensure(s).wars)if(w.stage==='active')NVGalacticDiplomacy.settle(s,w);NVQuests.update(s);return{ok:true,text};}")
edit('field_command.js',"const filtered=roster.filter(n=>", "const filtered=roster.filter(n=>!NVGovernorReturns.active(s,n.sourceId)&&")
edit('field_command.js',"NVFieldCommand.hurt(polarState,t.id,damage);", "NVFieldCommand.hurt(polarState,t.id,damage,args[2]||'wanderer');")
edit('field_command.js',"NVSol.byId[c.body].name.toUpperCase());}","NVSol.byId[c.body].name.toUpperCase());NVGalacticDiplomacy.settle(s,c.war);}")
edit('faction_leader_bosses.js',"function defeat(s,t){", "function defeat(s,t,source='wanderer'){")
edit('faction_leader_bosses.js',"NVSpace.notice(s.space,t.name+' DEFEATED / CAPITAL DEFENDER NEUTRALISED');}","NVSpace.notice(s.space,t.name+' DEFEATED / CAPITAL DEFENDER NEUTRALISED');if(DEFINITIONS.filter(d=>d.faction===t.faction&&home(s,d)===body(s)).every(d=>ensure(s)[d.id]?.stage==='defeated'))NVWarOutcomes.leaderDefeated(s,t.faction,NVWarOutcomes.sourceFaction(s,source));}")
edit('faction_leader_bosses.js',"defeat(s,t);}\n function step", "defeat(s,t,source);}\n function step")
edit('crew_diplomacy_core.js',"if(t.type==='foreign-governor'&&t.enemy.hp<=0&&typeof polarState!=='undefined'&&polarState&&NVCrewDiplomacy.ensure(polarState).assignments[t.enemy.id]===t.enemy)NVCrewDiplomacy.recall(polarState,t.enemy.id,true);", "if(t.type==='foreign-governor'&&t.enemy.hp<=0&&typeof polarState!=='undefined'&&polarState&&NVCrewDiplomacy.ensure(polarState).assignments[t.enemy.id]===t.enemy){const s=polarState,a=t.enemy,by=NVWarOutcomes.sourceFaction(s,args[3]||'wanderer');if(NVFactionAdministration.leader(s,a.faction)===a.id)NVWarOutcomes.leaderDefeated(s,a.faction,by);if(by==='CUSTOM')NVCrewDiplomacy.recall(s,a.id,true);else NVGovernorReturns.retreat(s,{...a,name:NVCrewDiplomacy.member(s,a.id)?.name});}")
edit('governor_tracker_core.js',"for(const r of Object.values(report)){", "for(const r of Object.values(report)){\n   if(NVGovernorReturns.active(s,r.id))continue;")
edit('sol_fall_game.js',"scene?.[2]||'';$('#solFallCount')", "(scene?.[2]||'')+(['beam','crawl','escape'].includes(q.stage)&&!NVErisFamily.ensure(polarState).recruited?' Nyrexia has gone into hiding.':'');$('#solFallCount')")
print('Updated war conditions, governor defeat attribution, and coup notice.')
