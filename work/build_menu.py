from pathlib import Path
import base64,json,re,zipfile,ast
root=Path(__file__).resolve().parents[1]
out=root/'outputs';work=root/'work'
reward_quotes=ast.literal_eval(re.search(r'const QUOTES=(\[.*?\n \]);',(work/'khazglar_reward_core.js').read_text(encoding='utf-8'),re.S).group(1))
(out/'NOSTRAVECTOR_Khazglar_Post_Battle.txt').write_text('KHAZGLAR / AFTER THE MARS BATTLE\n\n'+'\n\n'.join(str(i+1)+'. '+q for i,q in enumerate(reward_quotes))+'\n',encoding='utf-8')
dialogue_sections=[]
for filename,heading,constant in [('charon_crew_game.js','KHAZGLAR / MISSION BRIEFING','CHARON_CREW_QUOTES'),('charon_robot_game.js','CHARON / STATION INTRODUCTION','CHARON_ROBOT_QUOTES')]:
    dialogue=ast.literal_eval(re.search(r'const '+constant+r'=(\[.*?\n\]);',(work/filename).read_text(encoding='utf-8'),re.S).group(1))
    dialogue_sections.append(heading+'\n\n'+'\n\n'.join(str(i+1)+'. '+q for i,q in enumerate(dialogue)))
(out/'NOSTRAVECTOR_Charon_Dialogue.txt').write_text('\n\n'.join(dialogue_sections)+'\n',encoding='utf-8')
old=(out/'NOSTRAVECTOR_3D_Viewer.html').read_text(encoding='utf-8')
parts=json.loads(re.search(r'const parts=(.*?);\nconst canvas',old,re.S).group(1))
quotes=json.loads((work/'intro_quotes.json').read_text(encoding='utf-8'))
voice_quotes=[{**q,'audio_source':'data:audio/mpeg;base64,'+base64.b64encode((work/q['audio_file']).read_bytes()).decode()} for q in quotes]
def menu_model(filename):
    source=(work/filename).read_text(encoding='utf-8');model=json.loads(source[source.index('=')+1:source.rindex(';')]);lo=min(p['p'][i] for p in model['meshes'] for i in range(1,len(p['p']),3));hi=max(p['p'][i] for p in model['meshes'] for i in range(1,len(p['p']),3));scale=2/(hi-lo)
    return json.dumps([{'name':p['name'],'bone':p.get('bone','body'),'p':[[p['p'][i]*scale,(p['p'][i+1]-lo)*scale,p['p'][i+2]*scale] for i in range(0,len(p['p']),3)],'n':[p['n'][i:i+3] for i in range(0,len(p['n']),3)],'f':p['indices'],'c':p['color']} for p in model['meshes']],separators=(',',':'))
js=(work/'companion_motion.js').read_text(encoding='utf-8')+'\n'+(work/'planet_render_stability.js').read_text(encoding='utf-8')+'\n'+(work/'menu_party.js').read_text(encoding='utf-8')+'\n'+(work/'menu_scene.js').read_text(encoding='utf-8').replace('__MENU_KHAZGLAR_PARTS__',menu_model('khazglar_model.js')).replace('__MENU_CHARON_PARTS__',menu_model('charon_robot_model.js')).replace('__MENU_JAMES_SERVICE__',menu_model('brown_companion_service.js')).replace('__MENU_JAMES_ARMOUR__',menu_model('brown_companion_armour.js')).replace('__PARTS__',json.dumps(parts,separators=(',',':'))).replace('__ORION_PARTS__',(work/'orion_parts.json').read_text(encoding='utf-8')).replace('__ORION_HELMET_PARTS__',(work/'orion_helmet_parts.json').read_text(encoding='utf-8')).replace('__MENU_WORLD_RENDERER__',(work/'planet_menu_renderer.js').read_text(encoding='utf-8')).replace('__NYREXIA_PARTS__',(work/'nyrexia_parts.json').read_text(encoding='utf-8')).replace('__EARTH__',base64.b64encode((work/'earth-map.jpg').read_bytes()).decode())
intro_renderer=(work/'intro.js').read_text(encoding='utf-8').split('function createGalaxyRenderer()',1)[1]
js+='\n'+(work/'intro_playback.js').read_text(encoding='utf-8').replace('__QUOTES__',json.dumps(voice_quotes,separators=(',',':')))+'\nfunction createGalaxyRenderer()'+intro_renderer
js+='\n'+(work/'species_core.js').read_text(encoding='utf-8')+'\n'+(work/'customizer.js').read_text(encoding='utf-8').replace('__FACE_ASSETS__',(work/'face_parts.json').read_text(encoding='utf-8')).replace('__SAVED_GAME__',(work/'saved_game.js').read_text(encoding='utf-8'))
js+='\n'+(work/'save_management.js').read_text(encoding='utf-8')
js+='\n'+(work/'antarctica_core.js').read_text(encoding='utf-8')+'\n'+(work/'antarctica_betrayal_core.js').read_text(encoding='utf-8')
js+='\n'+(work/'africa_core.js').read_text(encoding='utf-8')+'\n'+(work/'sol_catalog.js').read_text(encoding='utf-8')+'\n'+(work/'planet_landscapes.js').read_text(encoding='utf-8')+'\n'+(work/'menu_location.js').read_text(encoding='utf-8')+'\n'+(work/'space_core.js').read_text(encoding='utf-8')
js+='\n'+(work/'charon_station_core.js').read_text(encoding='utf-8')
js+='\n'+(work/'world_flight.js').read_text(encoding='utf-8')+'\n'+(work/'galaxy_core.js').read_text(encoding='utf-8')
js+='\n'+(work/'cluster_core.js').read_text(encoding='utf-8')
js+='\n'+(work/'cluster_ecology.js').read_text(encoding='utf-8')+'\n'+(work/'ecology_core.js').read_text(encoding='utf-8')
js+='\n'+(work/'eris_core.js').read_text(encoding='utf-8')+'\n'+(work/'sol_war_core.js').read_text(encoding='utf-8')
hawthorne_quotes=json.loads((work/'hawthorne_quotes.json').read_text(encoding='utf-8'))
js+='\n'+(work/'hawthorne_transmission_core.js').read_text(encoding='utf-8').replace('__HAWTHORNE_QUOTES__',json.dumps(hawthorne_quotes,separators=(',',':')))
js+='\n'+(work/'pontifex_core.js').read_text(encoding='utf-8')+'\n'+(work/'pontifex_model.js').read_text(encoding='utf-8')+'\n'+(work/'pontifex_renderer.js').read_text(encoding='utf-8')
js+='\n'+(work/'citadel_collision.js').read_text(encoding='utf-8')
js+='\n'+(work/'eris_family.js').read_text(encoding='utf-8')
js+='\n'+(work/'faction_infantry_models.js').read_text(encoding='utf-8')+'\n'+(work/'faction_infantry_renderer.js').read_text(encoding='utf-8')
js+='\n'+(work/'construction_core.js').read_text(encoding='utf-8')+'\n'+(work/'occupation_bases.js').read_text(encoding='utf-8')
js+='\n'+(work/'trade_core.js').read_text(encoding='utf-8')
js+='\n'+(work/'khazglar_core.js').read_text(encoding='utf-8')+'\n'+(work/'khazglar_model.js').read_text(encoding='utf-8')+'\n'+(work/'khazglar_renderer.js').read_text(encoding='utf-8')
js+='\n'+(work/'frozen_weather_core.js').read_text(encoding='utf-8')+'\n'+(work/'storm_visuals.js').read_text(encoding='utf-8')
js+='\n'+(work/'quests_core.js').read_text(encoding='utf-8')+'\n'+(work/'chapter_restart.js').read_text(encoding='utf-8')
js+='\n'+(work/'khazglar_reward_core.js').read_text(encoding='utf-8')+'\n'+(work/'reward_ship_model.js').read_text(encoding='utf-8')+'\n'+(work/'reward_ship_renderer.js').read_text(encoding='utf-8')
js+='\n'+(work/'charon_robot_model.js').read_text(encoding='utf-8')+'\n'+(work/'charon_robot_renderer.js').read_text(encoding='utf-8')
js+='\n'+(work/'moon_loss_core.js').read_text(encoding='utf-8')+'\n'+(work/'brown_story_core.js').read_text(encoding='utf-8')+'\n'+(work/'brown_mission_core.js').read_text(encoding='utf-8')+'\n'+(work/'brown_pontifex_model.js').read_text(encoding='utf-8')+'\n'+(work/'brown_story_renderer.js').read_text(encoding='utf-8')
js+='\n'+(work/'brown_bastion_core.js').read_text(encoding='utf-8')+'\n'+(work/'brown_bastion_renderer.js').read_text(encoding='utf-8')
js+='\n'+(work/'governance_core.js').read_text(encoding='utf-8')+'\n'+(work/'governance_renderer.js').read_text(encoding='utf-8')
js+='\n'+(work/'brown_companion_service.js').read_text(encoding='utf-8')+'\n'+(work/'brown_companion_armour.js').read_text(encoding='utf-8')
js+='\n'+(work/'ship_interior_core.js').read_text(encoding='utf-8')+'\n'+(work/'brown_resolution_core.js').read_text(encoding='utf-8')+'\n'+(work/'ship_interior_model.js').read_text(encoding='utf-8')+'\n'+(work/'ship_interior_renderer.js').read_text(encoding='utf-8')
james_audio=json.loads((work/'james_audio.json').read_text(encoding='utf-8'))
james_voices=[{**q,'source':'data:audio/mpeg;base64,'+base64.b64encode((work/q['file']).read_bytes()).decode()} for q in james_audio]
js+='\n'+(work/'antarctica_speech.js').read_text(encoding='utf-8')
js+='\n'+(work/'antarctica_voice.js').read_text(encoding='utf-8').replace('__JAMES_VOICES__',json.dumps(james_voices,separators=(',',':')))
js+='\n'+(work/'antarctica_game.js').read_text(encoding='utf-8').replace('__JAMES_PARTS__',(work/'james_parts.json').read_text(encoding='utf-8')).replace('__POLAR_SKY__',base64.b64encode((work/'antarctica-assets/sky.jpg').read_bytes()).decode()).replace('__POLAR_SNOW__',base64.b64encode((work/'antarctica-assets/snow.jpg').read_bytes()).decode())
js+='\n'+(work/'africa_renderer.js').read_text(encoding='utf-8').replace('__ORION_PARTS__',(work/'orion_parts.json').read_text(encoding='utf-8')).replace('__ORION_HELMET_PARTS__',(work/'orion_helmet_parts.json').read_text(encoding='utf-8')).replace('__AFRICA_SAND__',base64.b64encode((work/'africa-assets/sand.jpg').read_bytes()).decode())
js+='\n'+(work/'eris_renderer.js').read_text(encoding='utf-8').replace('__VISHARA_PARTS__',(work/'vishara_parts.json').read_text(encoding='utf-8'))
js+='\n'+(work/'space_surface.js').read_text(encoding='utf-8')+'\n'+(work/'render_math.js').read_text(encoding='utf-8')+'\n'+(work/'cluster_ecology_renderer.js').read_text(encoding='utf-8')+'\n'+(work/'ecology_renderer.js').read_text(encoding='utf-8')+'\n'+(work/'ground_player_rig.js').read_text(encoding='utf-8')+'\n'+(work/'antarctica_renderer.js').read_text(encoding='utf-8').replace('__SURFACE_SKY__',(work/'surface_sky.glsl').read_text(encoding='utf-8')).replace('__PLANET_MATERIAL__',(work/'planet_material.glsl').read_text(encoding='utf-8'))
sol_meta=json.loads((work/'sol-assets/sources.json').read_text())
sol_maps={name:'data:image/jpeg;base64,'+base64.b64encode((work/'sol-assets'/f'{name}-web.jpg').read_bytes()).decode() for name,item in sol_meta.items() if item.get('images')}
for name in list(sol_maps):
    globe=work/'sol-assets'/f'{name}-globe.jpg'
    if globe.exists() and name not in ['mercury','jupiter','saturn']:sol_maps[name]='data:image/jpeg;base64,'+base64.b64encode(globe.read_bytes()).decode()
sol_maps.pop('earth',None)
sol_maps['saturn-ring']='data:image/png;base64,'+base64.b64encode((work/'sol-assets/saturn-1.png').read_bytes()).decode()
sol_geometry={name:json.loads((work/'sol-assets'/f'{name}-mesh.json').read_text()) for name in ['mercury','jupiter','saturn']}
js+='\n'+(work/'space_renderer.js').read_text(encoding='utf-8').replace('__SOL_MAPS__',json.dumps(sol_maps,separators=(',',':'))).replace('__SOL_GEOMETRY__',json.dumps(sol_geometry,separators=(',',':')))
js+='\n'+(work/'antarctica_vehicle.js').read_text(encoding='utf-8')
hazard_audio=json.loads((work/'hazard_audio.json').read_text(encoding='utf-8'))
hazard_voices=[{**q,'source':'data:audio/mpeg;base64,'+base64.b64encode((work/q['file']).read_bytes()).decode()} for q in hazard_audio]
js+='\n'+(work/'antarctica_hazard_voice.js').read_text(encoding='utf-8').replace('__HAZARD_VOICES__',json.dumps(hazard_voices,separators=(',',':')))
js+='\n'+(work/'antarctica_hazards.js').read_text(encoding='utf-8')
js+='\n'+(work/'antarctica_navigation.js').read_text(encoding='utf-8')
js+='\n'+(work/'antarctica_bed.js').read_text(encoding='utf-8')
js+='\n'+(work/'antarctica_expedition.js').read_text(encoding='utf-8')
grek_audio=json.loads((work/'grek_audio.json').read_text(encoding='utf-8'))
grek_voices=[{**q,'source':'data:audio/mpeg;base64,'+base64.b64encode((work/q['file']).read_bytes()).decode()} for q in grek_audio]
for source in ['grek_model.js','grek_renderer.js','grek_dialogue.js']:js+='\n'+(work/source).read_text(encoding='utf-8').replace('__GREK_VOICES__',json.dumps(grek_voices,separators=(',',':')))
betrayal_audio=json.loads((work/'betrayal_audio.json').read_text(encoding='utf-8'))
betrayal_voices=[{**q,'source':'data:audio/mpeg;base64,'+base64.b64encode((work/q['file']).read_bytes()).decode()} for q in betrayal_audio]
js+='\n'+(work/'betrayal_recordings.js').read_text(encoding='utf-8').replace('__BETRAYAL_VOICES__',json.dumps(betrayal_voices,separators=(',',':')))
orion_audio=json.loads((work/'orion_audio.json').read_text(encoding='utf-8'))
orion_voices=[{**q,'source':'data:audio/mpeg;base64,'+base64.b64encode((work/q['file']).read_bytes()).decode()} for q in orion_audio]
js+='\n'+(work/'orion_recordings.js').read_text(encoding='utf-8').replace('__ORION_VOICES__',json.dumps(orion_voices,separators=(',',':')))
js+='\n'+(work/'antarctica_betrayal.js').read_text(encoding='utf-8')+'\n'+(work/'africa_game.js').read_text(encoding='utf-8')+'\n'+(work/'planet_map.js').read_text(encoding='utf-8')+'\n'+(work/'space_game.js').read_text(encoding='utf-8')
js+='\n'+(work/'world_flight_game.js').read_text(encoding='utf-8')
js+='\n'+(work/'ecology_game.js').read_text(encoding='utf-8')
court_audio=json.loads((work/'court_audio.json').read_text(encoding='utf-8'))
court_voices=[{**q,'source':'data:audio/mpeg;base64,'+base64.b64encode((work/q['file']).read_bytes()).decode()} for q in court_audio]
js+='\n'+(work/'court_recordings.js').read_text(encoding='utf-8').replace('__COURT_VOICES__',json.dumps(court_voices,separators=(',',':')))
js+='\n'+(work/'eris_game.js').read_text(encoding='utf-8')
js+='\n'+(work/'fleet_motion.js').read_text(encoding='utf-8')
js+='\n'+(work/'jump.js').read_text(encoding='utf-8')
js+='\n'+(work/'construction_renderer.js').read_text(encoding='utf-8')+'\n'+(work/'construction_game.js').read_text(encoding='utf-8')
js+='\n'+(work/'quests_game.js').read_text(encoding='utf-8')
js+='\n'+(work/'clean_hud.js').read_text(encoding='utf-8')
hak_audio=json.loads((work/'hak_audio.json').read_text(encoding='utf-8'))
hak_voices=[{**q,'source':'data:audio/mpeg;base64,'+base64.b64encode((work/q['file']).read_bytes()).decode()} for q in hak_audio]
js+='\n'+(work/'hak_model.js').read_text(encoding='utf-8')+'\n'+(work/'hak_game.js').read_text(encoding='utf-8').replace('__HAK_VOICES__',json.dumps(hak_voices,separators=(',',':')))
alert_audio=json.loads((work/'sol_alert_audio.json').read_text(encoding='utf-8'))
alert_voices=[{**q,'source':'data:audio/mpeg;base64,'+base64.b64encode((work/q['file']).read_bytes()).decode()} for q in alert_audio]
war_audio=json.loads((work/'sol_war_audio.json').read_text(encoding='utf-8'))
war_voices=[{**q,'source':'data:audio/mpeg;base64,'+base64.b64encode((work/q['file']).read_bytes()).decode()} for q in war_audio]
js+='\n'+(work/'human_leaders.js').read_text(encoding='utf-8')+'\n'+(work/'sol_war_game.js').read_text(encoding='utf-8').replace('__SOL_WAR_VOICES__',json.dumps(war_voices,separators=(',',':')))
player_war_voice=json.loads((work/'player_war_audio.json').read_text(encoding='utf-8'))
player_war_voice['source']='data:audio/mpeg;base64,'+base64.b64encode((work/player_war_voice['file']).read_bytes()).decode()
js+='\n'+(work/'sol_alert_recordings.js').read_text(encoding='utf-8').replace('__SOL_ALERT_VOICES__',json.dumps(alert_voices,separators=(',',':'))).replace('__PLAYER_WAR_VOICE__',json.dumps(player_war_voice,separators=(',',':')))
music_audio=json.loads((work/'music_audio.json').read_text(encoding='utf-8'))
music_tracks=[{**q,'source':'data:audio/mpeg;base64,'+base64.b64encode((work/q['file']).read_bytes()).decode()} for q in music_audio]
js+='\n'+(work/'galaxy_scenery.js').read_text(encoding='utf-8')+'\n'+(work/'galaxy_game.js').read_text(encoding='utf-8')+'\n'+(work/'trade_game.js').read_text(encoding='utf-8')
cluster_maps={p.stem:'data:image/jpeg;base64,'+base64.b64encode(p.read_bytes()).decode() for p in (work/'cluster-assets').glob('*.jpg')}
js+='\n'+(work/'cluster_game.js').read_text(encoding='utf-8').replace('__CLUSTER_MAPS__',json.dumps(cluster_maps,separators=(',',':')))
js+='\n'+(work/'pontifex_game.js').read_text(encoding='utf-8')
hawthorne_audio=json.loads((work/'hawthorne_audio.json').read_text(encoding='utf-8'))
hawthorne_voices=[{**q,'source':'data:audio/mpeg;base64,'+base64.b64encode((work/q['file']).read_bytes()).decode()} for q in hawthorne_audio]
js+='\n'+(work/'hawthorne_recordings.js').read_text(encoding='utf-8').replace('__HAWTHORNE_VOICES__',json.dumps(hawthorne_voices,separators=(',',':')))
js+='\n'+(work/'khazglar_game.js').read_text(encoding='utf-8')
js+='\n'+(work/'hawthorne_transmission_game.js').read_text(encoding='utf-8')
weather_audio=json.loads((work/'weather_audio.json').read_text(encoding='utf-8'))
weather_voices=[{**q,'source':'data:audio/mpeg;base64,'+base64.b64encode((work/q['file']).read_bytes()).decode()} for q in weather_audio]
js+='\n'+(work/'frozen_weather_game.js').read_text(encoding='utf-8').replace('__WEATHER_WARNING_RECORDINGS__',json.dumps(weather_voices,separators=(',',':')))
khazglar_quotes=json.loads((work/'khazglar_quotes.json').read_text(encoding='utf-8'))
js+='\n'+(work/'khazglar_cutscene.js').read_text(encoding='utf-8').replace('__KHAZGLAR_QUOTES__',json.dumps(khazglar_quotes,separators=(',',':')))
khazglar_audio=json.loads((work/'khazglar_audio.json').read_text(encoding='utf-8'))
khazglar_voices=[{**q,'source':'data:audio/mpeg;base64,'+base64.b64encode((work/q['file']).read_bytes()).decode()} for q in khazglar_audio]
js+='\n'+(work/'khazglar_recordings.js').read_text(encoding='utf-8').replace('__KHAZGLAR_VOICES__',json.dumps(khazglar_voices,separators=(',',':')))
hawthorne_mars_quotes=json.loads((work/'hawthorne_mars_quotes.json').read_text(encoding='utf-8'))
js+='\n'+(work/'imperia_infantry_model.js').read_text(encoding='utf-8')+'\n'+(work/'imperia_arrival_renderer.js').read_text(encoding='utf-8')+'\n'+(work/'imperia_arrival_game.js').read_text(encoding='utf-8').replace('__HAWTHORNE_MARS_QUOTES__',json.dumps(hawthorne_mars_quotes,separators=(',',':')))
imperia_orders_audio=json.loads((work/'imperia_orders_audio.json').read_text(encoding='utf-8'))
imperia_orders_voices=[{**q,'source':'data:audio/mpeg;base64,'+base64.b64encode((work/q['file']).read_bytes()).decode()} for q in imperia_orders_audio]
js+='\n'+(work/'imperia_arrival_recordings.js').read_text(encoding='utf-8').replace('__IMPERIA_ORDER_VOICES__',json.dumps(imperia_orders_voices,separators=(',',':')))
guard_audio=json.loads((work/'khazglar_guard_audio.json').read_text(encoding='utf-8'))
guard_audio['source']='data:audio/mpeg;base64,'+base64.b64encode((work/guard_audio['file']).read_bytes()).decode()
js+='\n'+(work/'khazglar_guard_recording.js').read_text(encoding='utf-8').replace('__KHAZGLAR_GUARD_AUDIO__',json.dumps(guard_audio,separators=(',',':')))
js+='\n'+(work/'surface_navigation_core.js').read_text(encoding='utf-8')+'\n'+(work/'surface_navigation_game.js').read_text(encoding='utf-8')
js+='\n'+(work/'player_base_travel.js').read_text(encoding='utf-8')
js+='\n'+(work/'faction_diplomacy_core.js').read_text(encoding='utf-8')+'\n'+(work/'faction_diplomacy_game.js').read_text(encoding='utf-8')
js+='\n'+(work/'khazglar_reward_game.js').read_text(encoding='utf-8')
post_audio=json.loads((work/'khazglar_post_audio.json').read_text(encoding='utf-8'))
post_voices=[{**q,'source':'data:audio/mpeg;base64,'+base64.b64encode((work/q['file']).read_bytes()).decode()} for q in post_audio]
js+='\n'+(work/'khazglar_post_recordings.js').read_text(encoding='utf-8').replace('__KHAZGLAR_POST_VOICES__',json.dumps(post_voices,separators=(',',':')))
js+='\n'+(work/'ship_interior_game.js').read_text(encoding='utf-8')+'\n'+(work/'charon_crew_game.js').read_text(encoding='utf-8')+'\n'+(work/'charon_robot_game.js').read_text(encoding='utf-8')
charon_audio=json.loads((work/'charon_audio.json').read_text(encoding='utf-8'))
charon_voices=[{**q,'source':'data:audio/mpeg;base64,'+base64.b64encode((work/q['file']).read_bytes()).decode()} for q in charon_audio]
js+='\n'+(work/'charon_choice.js').read_text(encoding='utf-8')+'\n'+(work/'charon_recordings.js').read_text(encoding='utf-8').replace('__CHARON_RECORDINGS__',json.dumps(charon_voices,separators=(',',':')))
js+='\n'+(work/'moon_loss_game.js').read_text(encoding='utf-8')+'\n'+(work/'brown_story_game.js').read_text(encoding='utf-8')+'\n'+(work/'charon_station_game.js').read_text(encoding='utf-8')+'\n'+(work/'ship_crew_game.js').read_text(encoding='utf-8')+'\n'+(work/'brown_mission_game.js').read_text(encoding='utf-8')+'\n'+(work/'governance_game.js').read_text(encoding='utf-8')+'\n'+(work/'brown_bastion_game.js').read_text(encoding='utf-8')
brown_return_audio=json.loads((work/'brown_return_audio.json').read_text(encoding='utf-8'))
brown_return_voices=[{**q,'source':'data:audio/mpeg;base64,'+base64.b64encode((work/q['file']).read_bytes()).decode()} for q in brown_return_audio]
js+='\n'+(work/'brown_return_recordings.js').read_text(encoding='utf-8').replace('__BROWN_RETURN_RECORDINGS__',json.dumps(brown_return_voices,separators=(',',':')))+'\n'+(work/'brown_resolution_game.js').read_text(encoding='utf-8')
js+='\n'+(work/'sol_fall_core.js').read_text(encoding='utf-8')+'\n'+(work/'sol_fall_renderer.js').read_text(encoding='utf-8')+'\n'+(work/'exile_scenery.js').read_text(encoding='utf-8')+'\n'+(work/'sol_fall_game.js').read_text(encoding='utf-8').replace('__FALL_ALERT_AUDIO__',json.dumps('data:audio/mpeg;base64,'+base64.b64encode((work/'audio/brown-return/ALERT1.mp3').read_bytes()).decode()))
fall_hak_audio=json.loads((work/'hak_sol_fall_audio.json').read_text(encoding='utf-8'))
fall_hak_voices=[{**q,'source':'data:audio/mpeg;base64,'+base64.b64encode((work/q['file']).read_bytes()).decode()} for q in fall_hak_audio]
js+='\n'+(work/'hak_sol_fall_recordings.js').read_text(encoding='utf-8').replace('__HAK_SOL_FALL_VOICES__',json.dumps(fall_hak_voices,separators=(',',':')))
project_bc_models=[{**q,'source':base64.b64encode((work/q['path']).read_bytes()).decode()} for q in json.loads((work/'project_bc_models.json').read_text(encoding='utf-8'))]
js+='\n'+(work/'janira_expedition_core.js').read_text(encoding='utf-8')+'\n'+(work/'janira_expedition_game.js').read_text(encoding='utf-8')+'\n'+(work/'atlas_ownership_game.js').read_text(encoding='utf-8')+'\n'+(work/'glb_companions.js').read_text(encoding='utf-8')+'\n'+(work/'project_bc_catalog.js').read_text(encoding='utf-8').replace('__PROJECT_BC_MODELS__',json.dumps(project_bc_models,separators=(',',':')))+'\n'+(work/'custom_armies.js').read_text(encoding='utf-8')+'\n'+(work/'custom_crew_core.js').read_text(encoding='utf-8')+'\n'+(work/'species_creator.js').read_text(encoding='utf-8')+'\n'+(work/'custom_crew_game.js').read_text(encoding='utf-8')+'\n'+(work/'custom_armies_game.js').read_text(encoding='utf-8')+'\n'+(work/'custom_civilization_renderer.js').read_text(encoding='utf-8')+'\n'+(work/'glb_companion_game.js').read_text(encoding='utf-8')+'\n'+(work/'project_bc_library_game.js').read_text(encoding='utf-8')
js+='\n'+(work/'music_player.js').read_text(encoding='utf-8')+'\n'+(work/'music_game.js').read_text(encoding='utf-8').replace('__MUSIC_TRACKS__',json.dumps(music_tracks,separators=(',',':')))
js+='\n'+(work/'chapter3_feature_access.js').read_text(encoding='utf-8')
js+='\n'+(work/'project_bc_combat.js').read_text(encoding='utf-8')+'\n'+(work/'project_bc_combat_renderer.js').read_text(encoding='utf-8')+'\n'+(work/'project_bc_combat_game.js').read_text(encoding='utf-8')
bc_combat_recordings=[{**q,'source':'data:audio/mpeg;base64,'+base64.b64encode((work/q['file']).read_bytes()).decode()} for q in json.loads((work/'project_bc_combat_audio.json').read_text(encoding='utf-8'))]
js+='\n'+(work/'project_bc_combat_recordings.js').read_text(encoding='utf-8').replace('__BC_COMBAT_RECORDINGS__',json.dumps(bc_combat_recordings,separators=(',',':')))
governor_quotes=json.loads((work/'governor_quotes.json').read_text(encoding='utf-8'))
js+='\n'+(work/'governor_dialogue_core.js').read_text(encoding='utf-8').replace('__GOVERNOR_QUOTES__',json.dumps(governor_quotes,separators=(',',':'))).replace('__GOVERNOR_PROFILES__',json.dumps(json.loads((work/'governor_personalities.json').read_text(encoding='utf-8')),separators=(',',':')))+'\n'+(work/'governor_dialogue_game.js').read_text(encoding='utf-8')
governor_recordings=[{**q,'source':'data:audio/mpeg;base64,'+base64.b64encode((work/q['file']).read_bytes()).decode()} for q in json.loads((work/'governor_audio.json').read_text(encoding='utf-8'))]
js+='\n'+(work/'governor_recordings.js').read_text(encoding='utf-8').replace('__GOVERNOR_RECORDINGS__',json.dumps(governor_recordings,separators=(',',':')))
js+='\n'+(work/'janira_blockade_core.js').read_text(encoding='utf-8')+'\n'+(work/'janira_blockade_game.js').read_text(encoding='utf-8')
janira_rally_quotes=json.loads((work/'janira_rally_quotes.json').read_text(encoding='utf-8'))
assert len(janira_rally_quotes)==15
janira_rally_audio=json.loads((work/'janira_rally_audio.json').read_text(encoding='utf-8'))
assert len(janira_rally_audio)==15 and [r['line'] for r in janira_rally_audio]==list(range(15))
janira_rally_voices=[{**r,'source':'data:audio/mpeg;base64,'+base64.b64encode((work/r['file']).read_bytes()).decode()} for r in janira_rally_audio]
js+='\n'+(work/'janira_siege_core.js').read_text(encoding='utf-8')+'\n'+(work/'janira_armada_core.js').read_text(encoding='utf-8')+'\n'+(work/'janira_armada_renderer.js').read_text(encoding='utf-8')+'\n'+(work/'janira_siege_renderer.js').read_text(encoding='utf-8')+'\n'+(work/'janira_siege_game.js').read_text(encoding='utf-8').replace('__JANIRA_RALLY_QUOTES__',json.dumps(janira_rally_quotes,separators=(',',':')))+'\n'+(work/'janira_rally_recordings.js').read_text(encoding='utf-8').replace('__JANIRA_RALLY_AUDIO__',json.dumps(janira_rally_voices,separators=(',',':')))
(out/'NOSTRAVECTOR_Hak_Janira_Rally.txt').write_text('HAK CHOMPJAK / THE SIEGE OF JANIRA PRIME\n\n'+'\n\n'.join(str(i+1)+'. '+q for i,q in enumerate(janira_rally_quotes))+'\n',encoding='utf-8')
croxian_taunts=ast.literal_eval(re.search(r'const TAUNTS=(\[.*?\n \]);',(work/'karribassa_boss_core.js').read_text(encoding='utf-8'),re.S).group(1))
(out/'NOSTRAVECTOR_Croxian_Post_Battle_Quotes.txt').write_text('CROXIAN MASCAR / BEFORE THE SPARE OR KILL CHOICES\n\n'+'\n\n'.join(str(i+1)+'. '+q for i,q in enumerate(croxian_taunts))+'\n',encoding='utf-8')
js+='\n'+(work/'karribassa_boss_models.js').read_text(encoding='utf-8')+'\n'+(work/'karribassa_boss_core.js').read_text(encoding='utf-8')+'\n'+(work/'karribassa_boss_renderer.js').read_text(encoding='utf-8')+'\n'+(work/'karribassa_boss_game.js').read_text(encoding='utf-8')
croxian_audio=json.loads((work/'croxian_audio.json').read_text(encoding='utf-8'))
assert [r['line'] for r in croxian_audio]==list(range(5))
croxian_voices=[{**r,'source':'data:audio/mpeg;base64,'+base64.b64encode((work/r['file']).read_bytes()).decode()} for r in croxian_audio]
js+='\n'+(work/'croxian_recordings.js').read_text(encoding='utf-8').replace('__CROXIAN_AUDIO__',json.dumps(croxian_voices,separators=(',',':')))+'\n'+(work/'vengeful_mascar_core.js').read_text(encoding='utf-8')+'\n'+(work/'mascar_frame_core.js').read_text(encoding='utf-8')+'\n'+(work/'mascar_rampage_core.js').read_text(encoding='utf-8')+'\n'+(work/'mascar_frame_model.js').read_text(encoding='utf-8')+'\n'+(work/'mascar_frame_renderer.js').read_text(encoding='utf-8')+'\n'+(work/'vengeful_mascar_renderer.js').read_text(encoding='utf-8')+'\n'+(work/'vengeful_mascar_game.js').read_text(encoding='utf-8')
mascar_grief_audio=json.loads((work/'mascar_grief_audio.json').read_text(encoding='utf-8'))
assert [r['line'] for r in mascar_grief_audio]==list(range(10))
mascar_grief_voices=[{**r,'source':'data:audio/mpeg;base64,'+base64.b64encode((work/r['file']).read_bytes()).decode()} for r in mascar_grief_audio]
js+='\n'+(work/'mascar_grief_recordings.js').read_text(encoding='utf-8').replace('__MASCAR_GRIEF_AUDIO__',json.dumps(mascar_grief_voices,separators=(',',':')))
js+='\n'+(work/'imperia_inner_circle.js').read_text(encoding='utf-8')
js+='\n'+(work/'janira_victory_core.js').read_text(encoding='utf-8')+'\n'+(work/'janira_victory_game.js').read_text(encoding='utf-8')
victory_audio=json.loads((work/'janira_victory_audio.json').read_text(encoding='utf-8'))
victory_voices=[{**r,'source':'data:audio/mpeg;base64,'+base64.b64encode((work/r['file']).read_bytes()).decode()} for r in victory_audio]
js+='\n'+(work/'janira_victory_recordings.js').read_text(encoding='utf-8').replace('__JANIRA_VICTORY_AUDIO__',json.dumps(victory_voices,separators=(',',':')))
js+='\n'+(work/'siege_sol_core.js').read_text(encoding='utf-8')+'\n'+(work/'siege_sol_renderer.js').read_text(encoding='utf-8')+'\n'+(work/'siege_sol_game.js').read_text(encoding='utf-8')
rage_audio=json.loads((work/'hawthorne_rage_audio.json').read_text(encoding='utf-8'))
assert [r['line'] for r in rage_audio]==list(range(10))
rage_voices=[{**r,'source':'data:audio/mpeg;base64,'+base64.b64encode((work/r['file']).read_bytes()).decode()} for r in rage_audio]
js+='\n'+(work/'hawthorne_rage_recordings.js').read_text(encoding='utf-8').replace('__HAWTHORNE_RAGE_AUDIO__',json.dumps(rage_voices,separators=(',',':')))+'\n'+(work/'mercury_finale.js').read_text(encoding='utf-8')
js+='\n'+(work/'sol_epilogue_core.js').read_text(encoding='utf-8')+'\n'+(work/'sol_epilogue_renderer.js').read_text(encoding='utf-8')+'\n'+(work/'sol_epilogue_game.js').read_text(encoding='utf-8')
epilogue_audio=json.loads((work/'sol_epilogue_audio.json').read_text(encoding='utf-8'))
epilogue_voices=[{**r,'source':'data:audio/mpeg;base64,'+base64.b64encode((work/r['file']).read_bytes()).decode()} for r in epilogue_audio]
js+='\n'+(work/'sol_epilogue_recordings.js').read_text(encoding='utf-8').replace('__SOL_EPILOGUE_AUDIO__',json.dumps(epilogue_voices,separators=(',',':')))+'\n'+(work/'grek_empire.js').read_text(encoding='utf-8')
js+='\n'+(work/'chapter4_intruder_model.js').read_text(encoding='utf-8')+'\n'+(work/'chapter4_core.js').read_text(encoding='utf-8')+'\n'+(work/'chapter4_renderer.js').read_text(encoding='utf-8')+'\n'+(work/'chapter4_game.js').read_text(encoding='utf-8')
js+='\n'+(work/'chapter4_menu.js').read_text(encoding='utf-8')
js+='\n'+(work/'chapter4_space_mood.js').read_text(encoding='utf-8')
js+='\n'+(work/'am_grek_core.js').read_text(encoding='utf-8')+'\n'+(work/'am_grek_renderer.js').read_text(encoding='utf-8')+'\n'+(work/'am_grek_game.js').read_text(encoding='utf-8')
js+='\n'+(work/'CapitalShipModel.js').read_text(encoding='utf-8')+'\n'+(work/'CapitalInteriorModel.js').read_text(encoding='utf-8')
for source in ['capital_ship_core.js','capital_interior_core.js','capital_ship_renderer.js','capital_ship_game.js']:js+='\n'+(work/source).read_text(encoding='utf-8')
js+='\n'+(work/'story_checkpoints.js').read_text(encoding='utf-8')+'\n'+(work/'orion_mercury_relief.js').read_text(encoding='utf-8')
amg_audio=json.loads((work/'am_grek_audio.json').read_text(encoding='utf-8'))
amg_voices=[{**q,'source':'data:audio/mpeg;base64,'+base64.b64encode((work/q['file']).read_bytes()).decode()} for q in amg_audio]
js+='\n'+(work/'am_grek_recordings.js').read_text(encoding='utf-8').replace('__AM_G_AUDIO__',json.dumps(amg_voices,separators=(',',':')))
orion_relief_audio=json.loads((work/'orion_relief_audio.json').read_text(encoding='utf-8'))
orion_relief_voices=[{**q,'source':'data:audio/mpeg;base64,'+base64.b64encode((work/q['file']).read_bytes()).decode()} for q in orion_relief_audio]
js+='\n'+(work/'orion_relief_recordings.js').read_text(encoding='utf-8').replace('__ORION_RELIEF_AUDIO__',json.dumps(orion_relief_voices,separators=(',',':')))+'\n'+(work/'orion_empire.js').read_text(encoding='utf-8')
orion_relief_quotes=ast.literal_eval(re.search(r'const QUOTES=(\[.*?\n \]);',(work/'orion_mercury_relief.js').read_text(encoding='utf-8'),re.S).group(1))
(out/'NOSTRAVECTOR_Orion_Mercury_Quotes.txt').write_text('ORION MASCAR / MERCURY REINFORCEMENTS\nFive recorded lines: OMTH1.mp3 through OMTH5.mp3.\n\n'+'\n\n'.join(str(i+1)+'. '+q for i,q in enumerate(orion_relief_quotes))+'\n',encoding='utf-8')
frame_quotes=ast.literal_eval(re.search(r'const QUOTES=(\[.*?\n \]);',(work/'mascar_frame_core.js').read_text(encoding='utf-8'),re.S).group(1))
(out/'NOSTRAVECTOR_Mascar_Frame_Quotes.txt').write_text('ORION MASCAR / MASCAR FRAME / PHASE 2 / 1,000,000 HP / 10 DAMAGE PER HIT\n\n'+'\n\n'.join(str(i+1)+'. '+q for i,q in enumerate(frame_quotes))+'\n',encoding='utf-8')
orion_combat=ast.literal_eval(re.search(r'const COMBAT_QUOTES=(\[.*?\n \]);',(work/'vengeful_mascar_core.js').read_text(encoding='utf-8'),re.S).group(1))
(out/'NOSTRAVECTOR_Orion_Boss_Quotes.txt').write_text('ORION MASCAR / BOSS COMBAT / 750,000 HP\n\n'+'\n\n'.join(str(i+1)+'. '+q for i,q in enumerate(orion_combat))+'\n',encoding='utf-8')
js+='\n'+(work/'mascar_rampage_model.js').read_text(encoding='utf-8')+'\n'+(work/'mascar_rampage_renderer.js').read_text(encoding='utf-8')+'\n'+(work/'mascar_rampage_game.js').read_text(encoding='utf-8')
orion_boss_audio=json.loads((work/'orion_boss_audio.json').read_text(encoding='utf-8'))
orion_boss_voices=[{**q,'source':'data:audio/mpeg;base64,'+base64.b64encode((work/q['file']).read_bytes()).decode()} for q in orion_boss_audio]
js+='\n'+(work/'orion_boss_recordings.js').read_text(encoding='utf-8').replace('__ORION_BOSS_AUDIO__',json.dumps(orion_boss_voices,separators=(',',':')))
js+='\n'+(work/'orion_quest_tracking.js').read_text(encoding='utf-8')
js+='\n'+(work/'battle_performance.js').read_text(encoding='utf-8')
js+='\n'+(work/'combat_crew_core.js').read_text(encoding='utf-8')+'\n'+(work/'squad_combat.js').read_text(encoding='utf-8')+'\n'+(work/'companion_combat_core.js').read_text(encoding='utf-8')+'\n'+(work/'companion_combat_renderer.js').read_text(encoding='utf-8')+'\n'+(work/'companion_combat_game.js').read_text(encoding='utf-8')
js+='\n'+(work/'player_laser_pistol.js').read_text(encoding='utf-8').replace('__PLAYER_LASER_SOUND__',json.dumps('data:audio/mpeg;base64,'+base64.b64encode((work/'audio/player-laser.mp3').read_bytes()).decode()))
js+='\n'+(work/'orion_comms_renderer.js').read_text(encoding='utf-8')
js+='\n'+(work/'mascar_combat_ui.js').read_text(encoding='utf-8')
js+='\n'+(work/'archiostal_core.js').read_text(encoding='utf-8')+'\n'+(work/'archiostal_characters.js').read_text(encoding='utf-8')+'\n'+(work/'archiostal_player_rig.js').read_text(encoding='utf-8')+'\n'+(work/'archamus_unhooded_model.js').read_text(encoding='utf-8')+'\n'+(work/'archamus_hooded_model.js').read_text(encoding='utf-8')+'\n'+(work/'archamus_core.js').read_text(encoding='utf-8')+'\n'+(work/'archamus_orb.js').read_text(encoding='utf-8')+'\n'+(work/'archiostal_renderer.js').read_text(encoding='utf-8')+'\n'+(work/'archiostal_game.js').read_text(encoding='utf-8')+'\n'+(work/'archiostal_shared_hud.js').read_text(encoding='utf-8')+'\n'+(work/'archamus_game.js').read_text(encoding='utf-8')+'\n'+(work/'archamus_comms.js').read_text(encoding='utf-8')
archamus_source=(work/'archamus_core.js').read_text(encoding='utf-8')
archamus_ch3=json.loads(re.search(r'const CHAPTER3=(".*?");',archamus_source).group(1))
archamus_ch4=json.loads(re.search(r'const CHAPTER4=(\[.*?\n \]);',archamus_source,re.S).group(1))
archamus_secret=json.loads(re.search(r'const JOSIAH=(\[.*?\n \]);',archamus_source,re.S).group(1))
(out/'NOSTRAVECTOR_Archamus_Dialogue.txt').write_text('ARCHAMUS / ORIGINS UNKNOWN\nARCHIOSTAL / CENTRAL HUB / HOODED APPEARANCE ONLY\n\nCHAPTER 3\n'+archamus_ch3+'\n\nCHAPTER 4 / FIRST MEETING\n\n'+'\n\n'.join(str(i+1)+'. '+q for i,q in enumerate(archamus_ch4))+'\n\nHIDDEN ENCOUNTER / JOSIAH FOLLOWING / RECORDED VOICES\n\n'+'\n\n'.join(q['speaker']+': '+q['text'] for q in archamus_secret)+'\n',encoding='utf-8')
archamus_catharsis=json.loads(re.search(r'const CATHARSIS=(\[.*?\n \]);',archamus_source,re.S).group(1))
assert len(archamus_catharsis)==20
(out/'NOSTRAVECTOR_Archamus_Catharsis_Dialogue.txt').write_text('ARCHAMUS / CHAPTER 4 / THE WORLDS THAT WENT DARK\n20 PARAGRAPHS / FOLLOW-UP AFTER THE FIRST MEETING\nMILKY WAY COMMS PROJECTION / ATTACKER VISUAL WITHHELD\n\n'+'\n\n'.join(str(i+1)+'. '+q for i,q in enumerate(archamus_catharsis))+'\n',encoding='utf-8')
(out/'NOSTRAVECTOR_Archamus_Earth_Contact.txt').write_text('ARCHAMUS / AFTER THE CATHARSIS BRIEFING\n\n'+json.loads(re.search(r'const CONTACT=(".*?");',archamus_source).group(1))+'\n',encoding='utf-8')
archamus_audio=json.loads((work/'archamus_audio.json').read_text(encoding='utf-8'))
assert [(r['chapter'],r['line']) for r in archamus_audio]==[(3,0)]+[(4,i) for i in range(10)]+[(0,i) for i in range(10)]+[(4,i) for i in range(20)]+[(4,0)]
assert all(r.get('scene')=='catharsis' for r in archamus_audio[21:41])
assert archamus_audio[41]['scene']=='earth-contact'
archamus_voices=[{**r,'source':'data:audio/mpeg;base64,'+base64.b64encode((work/r['file']).read_bytes()).decode()} for r in archamus_audio]
js+='\n'+(work/'archamus_recordings.js').read_text(encoding='utf-8').replace('__ARCHAMUS_AUDIO__',json.dumps(archamus_voices,separators=(',',':')))
js+='\n'+(work/'williams_model.js').read_text(encoding='utf-8')
js+='\n'+(work/'josiah_williams.js').read_text(encoding='utf-8')
williams_audio=json.loads((work/'williams_audio.json').read_text(encoding='utf-8'))
assert [(r['branch'],r['line']) for r in williams_audio]==[('rude',0),('sarcastic',0),('sympathetic',0),('sympathetic',1),('sympathetic',2),('ignorant',0)]+[('intro',i) for i in range(5)]+[('chapter3',0)]+[('gareth',i) for i in range(12)]+[('richards',i) for i in range(5)]+[('enlistment',i) for i in range(2)]
assert [r['speaker'] for r in williams_audio if r['branch']=='gareth']==['gareth','josiah']*6
assert [r['speaker'] for r in williams_audio if r['branch']=='richards']==['richards']*5
williams_voices=[{**r,'source':'data:audio/mpeg;base64,'+base64.b64encode((work/r['file']).read_bytes()).decode()} for r in williams_audio]
js+='\n'+(work/'williams_recordings.js').read_text(encoding='utf-8').replace('__WILLIAMS_AUDIO__',json.dumps(williams_voices,separators=(',',':')))
js+='\n'+(work/'williams_expedition.js').read_text(encoding='utf-8').replace('__WILLIAMS_STORY_GLB__',json.dumps(base64.b64encode((out/'NOSTRAVECTOR_Josiah_Williams_II.glb').read_bytes()).decode()))
js+='\n'+(work/'catharsis_field_renderer.js').read_text(encoding='utf-8')+'\n'+(work/'catharsis_field.js').read_text(encoding='utf-8')
catharsis_transmission_source=(work/'catharsis_transmission.js').read_text(encoding='utf-8')
js+='\n'+catharsis_transmission_source
catharsis_audio=json.loads((work/'catharsis_transmission_audio.json').read_text(encoding='utf-8'))
assert [(r['language'],r['line']) for r in catharsis_audio]==[(language,i) for language in ['alien','english'] for i in range(10)]
catharsis_voices=[{**r,'source':'data:audio/mpeg;base64,'+base64.b64encode((work/r['file']).read_bytes()).decode()} for r in catharsis_audio]
js+='\n'+(work/'catharsis_transmission_recordings.js').read_text(encoding='utf-8').replace('__CATHARSIS_TRANSMISSION_AUDIO__',json.dumps(catharsis_voices,separators=(',',':')))
js+='\n'+(work/'catharsis_boarding_audio.js').read_text(encoding='utf-8')+'\n'+(work/'catharsis_boarding_renderer.js').read_text(encoding='utf-8')+'\n'+(work/'catharsis_boarding.js').read_text(encoding='utf-8')
js+='\n'+(work/'catharsis_aftermath.js').read_text(encoding='utf-8')
catharsis_aftermath_audio=json.loads((work/'catharsis_aftermath_audio.json').read_text(encoding='utf-8'))
assert [r['line'] for r in catharsis_aftermath_audio]==list(range(10))
catharsis_aftermath_voices=[{**r,'source':'data:audio/mpeg;base64,'+base64.b64encode((work/r['file']).read_bytes()).decode()} for r in catharsis_aftermath_audio]
js+='\n'+(work/'catharsis_aftermath_recordings.js').read_text(encoding='utf-8').replace('__CATHARSIS_AFTERMATH_AUDIO__',json.dumps(catharsis_aftermath_voices,separators=(',',':')))
js+='\n'+(work/'catharsis_return_hak.js').read_text(encoding='utf-8')
hak_chapter4_audio=json.loads((work/'hak_chapter4_audio.json').read_text(encoding='utf-8'))
assert [r['line'] for r in hak_chapter4_audio]==list(range(10))
hak_chapter4_voices=[{**r,'source':'data:audio/mpeg;base64,'+base64.b64encode((work/r['file']).read_bytes()).decode()} for r in hak_chapter4_audio]
js+='\n'+(work/'hak_chapter4_recordings.js').read_text(encoding='utf-8').replace('__HAK_CHAPTER4_AUDIO__',json.dumps(hak_chapter4_voices,separators=(',',':')))
js+='\n'+(work/'catharsis_core_route.js').read_text(encoding='utf-8')
js+='\n'+(work/'galactic_diplomacy_core.js').read_text(encoding='utf-8')+'\n'+(work/'galactic_diplomacy_game.js').read_text(encoding='utf-8')
js+='\n'+(work/'crew_diplomacy_core.js').read_text(encoding='utf-8')+'\n'+(work/'crew_diplomacy_renderer.js').read_text(encoding='utf-8')+'\n'+(work/'crew_diplomacy_game.js').read_text(encoding='utf-8')+'\n'+(work/'pontifex_repeatable.js').read_text(encoding='utf-8')
crew_posting_audio=json.loads((work/'crew_posting_audio.json').read_text(encoding='utf-8'))
assert len(crew_posting_audio)==30 and len({(r['profile'],r['line']) for r in crew_posting_audio})==30
crew_posting_voices=[{**r,'source':'data:audio/mpeg;base64,'+base64.b64encode((work/r['file']).read_bytes()).decode()} for r in crew_posting_audio]
js+='\n'+(work/'crew_posting_recordings.js').read_text(encoding='utf-8').replace('__CREW_POSTING_AUDIO__',json.dumps(crew_posting_voices,separators=(',',':')))
crew_enemy_source=(work/'crew_enemy_encounters.js').read_text(encoding='utf-8')
js+='\n'+crew_enemy_source
crew_enemy_audio=json.loads((work/'crew_enemy_audio.json').read_text(encoding='utf-8'))
assert len(crew_enemy_audio)==30 and len({(r['profile'],r['line']) for r in crew_enemy_audio})==30
crew_enemy_voices=[{**r,'source':'data:audio/mpeg;base64,'+base64.b64encode((work/r['file']).read_bytes()).decode()} for r in crew_enemy_audio]
js+='\n'+(work/'crew_enemy_recordings.js').read_text(encoding='utf-8').replace('__CREW_ENEMY_AUDIO__',json.dumps(crew_enemy_voices,separators=(',',':')))
croxian_relief_source=(work/'orion_croxian_relief.js').read_text(encoding='utf-8')
js+='\n'+croxian_relief_source
orion_croxian_audio=json.loads((work/'orion_croxian_audio.json').read_text(encoding='utf-8'))
assert [(r['stage'],r['line']) for r in orion_croxian_audio]==[(stage,i) for stage in ['arrival','frame'] for i in range(10)]
orion_croxian_voices=[{**r,'source':'data:audio/mpeg;base64,'+base64.b64encode((work/r['file']).read_bytes()).decode()} for r in orion_croxian_audio]
js+='\n'+(work/'orion_croxian_recordings.js').read_text(encoding='utf-8').replace('__ORION_CROXIAN_AUDIO__',json.dumps(orion_croxian_voices,separators=(',',':')))
js+='\n'+(work/'frontline_campaign.js').read_text(encoding='utf-8')
js+='\n'+(work/'overlord_war_support.js').read_text(encoding='utf-8')
js+='\n'+(work/'faction_leader_bosses.js').read_text(encoding='utf-8')
archamus_boss_audio=json.loads((work/'archamus_boss_audio.json').read_text(encoding='utf-8'))
assert [r['line'] for r in archamus_boss_audio]==list(range(20))
archamus_boss_voices=[{**r,'source':'data:audio/mpeg;base64,'+base64.b64encode((work/r['file']).read_bytes()).decode()} for r in archamus_boss_audio]
js+='\n'+(work/'archamus_boss_recordings.js').read_text(encoding='utf-8').replace('__ARCHAMUS_BOSS_AUDIO__',json.dumps(archamus_boss_voices,separators=(',',':')))
(out/'NOSTRAVECTOR_Archamus_Boss_Quotes.txt').write_text('ARCHAMUS / TWENTY BOSS FIGHT QUOTES\n\n'+'\n\n'.join(str(r['line']+1)+'. '+r['text'] for r in archamus_boss_audio)+'\n',encoding='utf-8')
hak_boss_audio=json.loads((work/'hak_boss_audio.json').read_text(encoding='utf-8'))
assert [r['line'] for r in hak_boss_audio]==list(range(20))
hak_boss_voices=[{**r,'source':'data:audio/mpeg;base64,'+base64.b64encode((work/r['file']).read_bytes()).decode()} for r in hak_boss_audio]
js+='\n'+(work/'hak_boss_recordings.js').read_text(encoding='utf-8').replace('__HAK_BOSS_AUDIO__',json.dumps(hak_boss_voices,separators=(',',':')))
darius_vishara_rows=json.loads((work/'darius_vishara_boss_audio.json').read_text(encoding='utf-8'))
darius_vishara_script=(work/'darius_vishara_boss_recordings.js').read_text(encoding='utf-8')
for leader in ['darius','vishara']:
    records=[r for r in darius_vishara_rows if r['leader']==leader]
    assert [r['line'] for r in records]==list(range(10))
    voices=[{**r,'source':'data:audio/mpeg;base64,'+base64.b64encode((work/r['file']).read_bytes()).decode()} for r in records]
    darius_vishara_script=darius_vishara_script.replace('__'+leader.upper()+'_BOSS_AUDIO__',json.dumps(voices,separators=(',',':')))
js+='\n'+darius_vishara_script

(out/'NOSTRAVECTOR_Hak_Boss_Quotes.txt').write_text('HAK CHOMPJAK / TWENTY BOSS FIGHT QUOTES\n\n'+'\n\n'.join(str(r['line']+1)+'. '+r['text'] for r in hak_boss_audio)+'\n',encoding='utf-8')
phase2_audio=json.loads((work/'archamus_phase2_audio.json').read_text(encoding='utf-8'))
assert [r['line'] for r in phase2_audio]==list(range(10))
phase2_voices=[{**r,'source':'data:audio/mpeg;base64,'+base64.b64encode((work/r['file']).read_bytes()).decode()} for r in phase2_audio]
js+='\n'+(work/'archamus_phase2_dialogue.js').read_text(encoding='utf-8').replace('__ARCHAMUS_PHASE2_AUDIO__',json.dumps(phase2_voices,separators=(',',':')))
phase2_lines=[r['text'] for r in phase2_audio]
(out/'NOSTRAVECTOR_Archamus_Phase2_Quotes.txt').write_text('ARCHAMUS / PHASE 2 / TEN LINES\n\n'+'\n\n'.join(str(i+1)+'. '+line for i,line in enumerate(phase2_lines))+'\n',encoding='utf-8')
js+='\n'+(work/'chapter4_create_species.js').read_text(encoding='utf-8')
js+='\n'+(work/'tyrotaronus_model.js').read_text(encoding='utf-8')+'\n'+(work/'tyrotaronus_core.js').read_text(encoding='utf-8')+'\n'+(work/'tyrotaronus_game.js').read_text(encoding='utf-8')
tyro_audio=json.loads((work/'tyrotaronus_audio.json').read_text(encoding='utf-8'))
assert [r['line'] for r in tyro_audio]==list(range(10))
tyro_voices=[{**r,'source':'data:audio/mpeg;base64,'+base64.b64encode((work/r['file']).read_bytes()).decode()} for r in tyro_audio]
tamaz_audio=json.loads((work/'tamaz_audio.json').read_text(encoding='utf-8'))
assert [r['line'] for r in tamaz_audio]==list(range(5))
tamaz_voices=[{**r,'source':'data:audio/mpeg;base64,'+base64.b64encode((work/r['file']).read_bytes()).decode()} for r in tamaz_audio]
js+='\n'+(work/'tyrotaronus_recordings.js').read_text(encoding='utf-8').replace('__TYROTARONUS_AUDIO__',json.dumps(tyro_voices,separators=(',',':'))).replace('__TAMAZ_TYROTARONUS_AUDIO__',json.dumps(tamaz_voices,separators=(',',':')))
hak_post_species_audio=json.loads((work/'hak_post_species_audio.json').read_text(encoding='utf-8'))
assert [r['line'] for r in hak_post_species_audio]==list(range(3))
hak_post_species_voices=[{**r,'source':'data:audio/mpeg;base64,'+base64.b64encode((work/r['file']).read_bytes()).decode()} for r in hak_post_species_audio]
js+='\n'+(work/'hak_post_species_recordings.js').read_text(encoding='utf-8').replace('__HAK_POST_SPECIES_AUDIO__',json.dumps(hak_post_species_voices,separators=(',',':')))
js+='\n'+(work/'catharsis_core_route_game.js').read_text(encoding='utf-8')
js+='\n'+(work/'tyrotaronus_companion.js').read_text(encoding='utf-8').replace('__TYROTARONUS_COMPANION_GLB__',json.dumps(base64.b64encode((out/'NOSTRAVECTOR_Tyrotaronus.glb').read_bytes()).decode()))
js+='\n'+(work/'alphinos_meeting.js').read_text(encoding='utf-8')+'\n'+(work/'aridaxx_scenery.js').read_text(encoding='utf-8-sig')
hak_aridaxx_audio=json.loads((work/'hak_aridaxx_audio.json').read_text(encoding='utf-8'))
assert [r['line'] for r in hak_aridaxx_audio]==list(range(5))
hak_aridaxx_voices=[{**r,'source':'data:audio/mpeg;base64,'+base64.b64encode((work/r['file']).read_bytes()).decode()} for r in hak_aridaxx_audio]
js+='\n'+(work/'hak_aridaxx_recordings.js').read_text(encoding='utf-8').replace('__HAK_ARIDAXX_AUDIO__',json.dumps(hak_aridaxx_voices,separators=(',',':')))
js+='\n'+(work/'reptillian2_model.js').read_text(encoding='utf-8')
js+='\n'+(work/'army_species_models.js').read_text(encoding='utf-8')+'\n'+(work/'native_species.js').read_text(encoding='utf-8')
js+='\n'+(work/'catharsis_final_gate.js').read_text(encoding='utf-8')+'\n'+(work/'carax_assault.js').read_text(encoding='utf-8')+'\n'+(work/'carax_geometry.js').read_text(encoding='utf-8')+'\n'+(work/'carax_scenery.js').read_text(encoding='utf-8')

js+='\n'+(work/'lord_zark_model.js').read_text(encoding='utf-8')+'\n'+(work/'lord_zark_renderer.js').read_text(encoding='utf-8')+'\n'+(work/'lord_zark_arrival.js').read_text(encoding='utf-8')
zark_audio=json.loads((work/'lord_zark_audio.json').read_text(encoding='utf-8'))
assert [r['line'] for r in zark_audio]==list(range(10))
zark_voices=[{**r,'source':'data:audio/mpeg;base64,'+base64.b64encode((work/r['file']).read_bytes()).decode()} for r in zark_audio]
js+='\n'+(work/'lord_zark_recordings.js').read_text(encoding='utf-8').replace('__LORD_ZARK_AUDIO__',json.dumps(zark_voices,separators=(',',':')))
zark_lines=ast.literal_eval(re.search(r'const LINES=(\[.*?\n \]);',(work/'lord_zark_arrival.js').read_text(encoding='utf-8'),re.S).group(1))
assert len(zark_lines)==10
js+='\n'+(work/'oilkoumeneus_models.js').read_text(encoding='utf-8')
js+='\n'+(work/'carax_endings_core.js').read_text(encoding='utf-8')+'\n'+(work/'beam_struggle_core.js').read_text(encoding='utf-8')+'\n'+(work/'good_ending_core.js').read_text(encoding='utf-8')+'\n'+(work/'beam_nightmares_renderer.js').read_text(encoding='utf-8')+'\n'+(work/'good_ending_renderer.js').read_text(encoding='utf-8')+'\n'+(work/'carax_endings_renderer.js').read_text(encoding='utf-8')
tyro_source=(work/'carax_endings_core.js').read_text(encoding='utf-8')
tyro_ending_lines=json.loads(re.search(r'const TYROTARONUS_TAUNTS=(\[.*?\n\]);',tyro_source,re.S).group(1))
assert len(tyro_ending_lines)==20
(out/'NOSTRAVECTOR_Tyrotaronus_Fourth_Bad_Ending_Lines.txt').write_text('TYROTARONUS / THE OILKOUMENEUS\nLINES 1–15: QUIET, CONTROLLING; 16–20: ALL CAPS\n\n'+'\n\n'.join(str(i+1)+'. '+line for i,line in enumerate(tyro_ending_lines)),encoding='utf-8')
zark_ending_lines=ast.literal_eval(re.search(r'const ZARK_TAUNTS=(\[.*?\n \]);',(work/'carax_endings_core.js').read_text(encoding='utf-8'),re.S).group(1))
assert len(zark_ending_lines)==10
(out/'NOSTRAVECTOR_Zark_Second_Bad_Ending_Lines.txt').write_text('\n\n'.join(str(i+1)+'. '+line for i,line in enumerate(zark_ending_lines)),encoding='utf-8')
josiah_ending_lines=ast.literal_eval(re.search(r'const JOSIAH_TAUNTS=(\[.*?\n \]);',(work/'carax_endings_core.js').read_text(encoding='utf-8'),re.S).group(1))
assert len(josiah_ending_lines)==10
(out/'NOSTRAVECTOR_Josiah_Third_Bad_Ending_Lines.txt').write_text('JOSIAH RICHARDS / CALM, QUIET, SADISTIC DELIVERY\n\n'+'\n\n'.join(str(i+1)+'. '+line for i,line in enumerate(josiah_ending_lines)),encoding='utf-8')
js+='\n'+(work/'carax_bosses_core.js').read_text(encoding='utf-8')+'\n'+(work/'catharsis_hawthorne_model.js').read_text(encoding='utf-8')+'\n'+(work/'carax_bosses_renderer.js').read_text(encoding='utf-8')+'\n'+(work/'carax_bosses_game.js').read_text(encoding='utf-8')
zark_boss_lines=ast.literal_eval(re.search(r'const ZARK_QUOTES=(\[.*?\n \]);',(work/'carax_bosses_core.js').read_text(encoding='utf-8'),re.S).group(1))
assert len(zark_boss_lines)==5
zark_boss_audio=json.loads((work/'zark_boss_audio.json').read_text(encoding='utf-8'))
assert [r['line'] for r in zark_boss_audio]==list(range(5))
zark_boss_voices=[{**r,'source':'data:audio/mpeg;base64,'+base64.b64encode((work/r['file']).read_bytes()).decode()} for r in zark_boss_audio]
js+='\n'+(work/'zark_boss_recordings.js').read_text(encoding='utf-8').replace('__ZARK_BOSS_AUDIO__',json.dumps(zark_boss_voices,separators=(',',':')))

js+='\n'+(work/'carax_endings_game.js').read_text(encoding='utf-8')+'\n'+(work/'chapter4_final_checkpoint.js').read_text(encoding='utf-8')
ending_audio=json.loads((work/'carax_ending_audio.json').read_text(encoding='utf-8'))
assert len(ending_audio)==60
good_intro=json.loads(re.search(r'const GOOD_INTRO=(\[.*?\n\]);',(work/'carax_endings_core.js').read_text(encoding='utf-8'),re.S).group(1))
assert len(good_intro)==8
nightmare_rants=json.loads(re.search(r'const RANTS=(\{.*?\n \});',(work/'beam_struggle_core.js').read_text(encoding='utf-8'),re.S).group(1))
nightmare_rants['zark']=zark_boss_lines
(out/'NOSTRAVECTOR_Good_Ending_Nightmare_Quotes.txt').write_text('NIGHTMARES / OTHER TIMELINES\nOrion, Tyrotaronus and Josiah use FINALBOSS recordings 1–5. Lord Zark reuses ZARKBOSSFIGHT1–5.\n\n'+'\n\n'.join(name.upper()+'\n'+'\n'.join(str(i+1)+'. '+line for i,line in enumerate(lines)) for name,lines in nightmare_rants.items())+'\n\nLORD ZARK / QTE FAILURE\nHAHAHAHA! ALL THAT POWER, AND YOU STILL FAILED! YOUR FRIENDS CANNOT SAVE YOU FROM EVERY WORLD YOU LEFT BEHIND!\n',encoding='utf-8')
(out/'NOSTRAVECTOR_Good_Ending_Remaster_Recording_Script.txt').write_text('GOOD ENDING / THE PEOPLE YOU SAVED\nFINALBOSSPREBEAM1–8 are recorded in this order. Original good-ending audio follows this sequence.\n\n'+'\n\n'.join(str(i+1)+'. '+name+'\n'+line for i,(name,line) in enumerate(good_intro))+'\n',encoding='utf-8')
assert [r['shot'] for r in ending_audio if r['route']=='bad-zark']==list(range(10))
assert [r['shot'] for r in ending_audio if r['route']=='bad-josiah']==list(range(2,12))
assert [r['shot'] for r in ending_audio if r['route']=='bad-tyrotaronus']==list(range(1,21))
ending_voices=[{**r,'shot':r['shot']+len(good_intro) if r['route']=='good' else r['shot'],'text':('Carax is free. Your ship and surviving companions are ready for you. Do you want to go to Andromeda?' if r['route']=='shared' else None),'source':'data:audio/mpeg;base64,'+base64.b64encode((work/r['file']).read_bytes()).decode()} for r in ending_audio]
pre_beam_audio=json.loads((work/'pre_beam_audio.json').read_text(encoding='utf-8'))
assert len(pre_beam_audio)==9
ending_voices.extend({**r,'source':'data:audio/mpeg;base64,'+base64.b64encode((work/r['file']).read_bytes()).decode()} for r in pre_beam_audio)
js+='\n'+(work/'carax_ending_recordings.js').read_text(encoding='utf-8').replace('__CARAX_ENDING_AUDIO__',json.dumps(ending_voices,separators=(',',':')))
js+='\n'+(work/'carax_orion_ending_fx.js').read_text(encoding='utf-8')
js+='\n'+(work/'chapter5_sandbox.js').read_text(encoding='utf-8')
js+='\n'+(work/'andromeda.js').read_text(encoding='utf-8').replace('__ANDROMEDA_MAP__','data:image/jpeg;base64,'+base64.b64encode((work/'andromeda_map.jpg').read_bytes()).decode())
js+='\n'+(work/'cyrannus_catalogue.js').read_text(encoding='utf-8')+'\n'+(work/'triangulum_catalogue.js').read_text(encoding='utf-8')+'\n'+(work/'chimaera_catalogue.js').read_text(encoding='utf-8')
js+='\n'+(work/'black_hole_gates.js').read_text(encoding='utf-8')+'\n'+(work/'black_hole_gate_renderer.js').read_text(encoding='utf-8')
js+='\n'+(work/'fortress_campaign.js').read_text(encoding='utf-8')
js+='\n'+(work/'ship_governor_controls.js').read_text(encoding='utf-8')
js+='\n'+(work/'cyrannus_game.js').read_text(encoding='utf-8').replace('__CYRANNUS_MAP__','data:image/jpeg;base64,'+base64.b64encode((work/'cyrannus_map.jpg').read_bytes()).decode())
js+='\n'+(work/'triangulum_game.js').read_text(encoding='utf-8').replace('__TRIANGULUM_MAP__','data:image/jpeg;base64,'+base64.b64encode((work/'triangulum_map.jpg').read_bytes()).decode())
js+='\n'+(work/'frontier_fortresses.js').read_text(encoding='utf-8')
js+='\n'+(work/'fortress_appearance.js').read_text(encoding='utf-8')
js+='\n'+(work/'faction_administration.js').read_text(encoding='utf-8')+'\n'+(work/'faction_administration_game.js').read_text(encoding='utf-8')
js+='\n'+(work/'chimaera_lord_model.js').read_text(encoding='utf-8')+'\n'+(work/'chimaera_offensive.js').read_text(encoding='utf-8')+'\n'+(work/'chimaera_game.js').read_text(encoding='utf-8').replace('__CHIMAERA_MAP__','data:image/jpeg;base64,'+base64.b64encode((work/'chimaera_map.jpg').read_bytes()).decode())
js+='\n'+(work/'save_as.js').read_text(encoding='utf-8')
js+='\n'+(work/'subject_governments.js').read_text(encoding='utf-8')
js+='\n'+(work/'mars_crew_capacity.js').read_text(encoding='utf-8')
js+='\n'+(work/'imperia_starting_governors.js').read_text(encoding='utf-8')+'\n'+(work/'field_command.js').read_text(encoding='utf-8')+'\n'+(work/'field_command_game.js').read_text(encoding='utf-8')+'\n'+(work/'command_travel.js').read_text(encoding='utf-8')
js+='\n'+(work/'governor_tracker_core.js').read_text(encoding='utf-8')+'\n'+(work/'governor_tracker_game.js').read_text(encoding='utf-8')
js+='\n'+(work/'war_outcomes.js').read_text(encoding='utf-8')
js+='\n'+(work/'core_history.js').read_text(encoding='utf-8')
js+='\n'+(work/'catharsis_history.js').read_text(encoding='utf-8')
js+='\n'+(work/'alexia_gate.js').read_text(encoding='utf-8')
alexia_audio=json.loads((work/'alexia_boss_audio.json').read_text(encoding='utf-8'))
alexia_voices=[{**r,'source':'data:audio/mpeg;base64,'+base64.b64encode((work/r['file']).read_bytes()).decode()} for r in alexia_audio]
js+='\n'+(work/'alexia_boss_recordings.js').read_text(encoding='utf-8').replace('__ALEXIA_BOSS_AUDIO__',json.dumps(alexia_voices,separators=(',',':')))
js+='\n'+(work/'alexia_aftermath.js').read_text(encoding='utf-8')
alexia_aftermath_audio=json.loads((work/'alexia_aftermath_audio.json').read_text(encoding='utf-8'))
alexia_aftermath_voices=[{**r,'source':'data:audio/mpeg;base64,'+base64.b64encode((work/r['file']).read_bytes()).decode()} for r in alexia_aftermath_audio]
js+='\n'+(work/'alexia_aftermath_recordings.js').read_text(encoding='utf-8').replace('__ALEXIA_AFTERMATH_AUDIO__',json.dumps(alexia_aftermath_voices,separators=(',',':')))
js+='\n'+(work/'sol_hunt_patrols.js').read_text(encoding='utf-8')
js+='\n'+(work/'pontifex_names.js').read_text(encoding='utf-8')
js+='\n'+(work/'nox_alliance.js').read_text(encoding='utf-8')
js+='\n'+(work/'court_combat_lips.js').read_text(encoding='utf-8')
js+='\n'+(work/'uplift_map.js').read_text(encoding='utf-8')
js+='\n'+(work/'planet_empires.js').read_text(encoding='utf-8')
js+='\n'+(work/'menu_faction_names.js').read_text(encoding='utf-8')
js+='\n'+(work/'atlas_faction_names.js').read_text(encoding='utf-8')
js+='\n'+(work/'reset_progress.js').read_text(encoding='utf-8')
nightmare_audio=json.loads((work/'nightmare_combat_audio.json').read_text(encoding='utf-8'))
assert len(nightmare_audio)==15
nightmare_voices=[{**r,'source':'data:audio/mpeg;base64,'+base64.b64encode((work/r['file']).read_bytes()).decode()} for r in nightmare_audio]
js+='\n'+(work/'beam_struggle_game.js').read_text(encoding='utf-8').replace('__NIGHTMARE_COMBAT_AUDIO__',json.dumps(nightmare_voices,separators=(',',':')))
js+='\n'+(work/'nightmare_pause.js').read_text(encoding='utf-8')
js+='\n'+(work/'base_teleport.js').read_text(encoding='utf-8')
js+='\n'+(work/'hud_interaction_stability.js').read_text(encoding='utf-8')
(out/'NOSTRAVECTOR_Lord_Zark_Boss_Quotes.txt').write_text('LORD ZARK / COMBAT QUOTES\n\n'+'\n\n'.join(str(i+1)+'. '+line for i,line in enumerate(zark_boss_lines))+'\n',encoding='utf-8')

(out/'NOSTRAVECTOR_Lord_Zark_Dialogue.txt').write_text('LORD ZARK / THE PRIME EVIL / ARRIVAL FROM SAGITTARIUS A*\n\n'+'\n\n'.join(str(i+1)+'. '+line for i,line in enumerate(zark_lines))+'\n',encoding='utf-8')

tamaz_briefing=json.loads(re.search(r'const TAMAZ_LINES=(\[.*?\n \]);',(work/'catharsis_core_route.js').read_text(encoding='utf-8'),re.S).group(1))
(out/'NOSTRAVECTOR_Tyrotaronus_Tamaz_Briefing.txt').write_text('Tyrotaronus / TAMAZ PRIME / THE ROAD TO SAGITTARIUS A*\n\n'+'\n\n'.join(str(i+1)+'. '+q for i,q in enumerate(tamaz_briefing))+'\n\nWARNING\nTHE CATHARSIS ARE WAITING AT SAGITTARIUS A*.\n',encoding='utf-8')
hak_empire_lines=json.loads(re.search(r'const HAK_LINES=(\[.*?\n \]);',(work/'tyrotaronus_core.js').read_text(encoding='utf-8'),re.S).group(1))
(out/'NOSTRAVECTOR_Hak_After_Creation.txt').write_text('HAK CHOMPJAK / AFTER FOUNDING YOUR NEW EMPIRE\n\n'+'\n\n'.join(str(i+1)+'. '+q for i,q in enumerate(hak_empire_lines))+'\n',encoding='utf-8')
tyro_lines=json.loads(re.search(r'const LINES=(\[.*?\n \]);',(work/'tyrotaronus_core.js').read_text(encoding='utf-8'),re.S).group(1))
(out/'NOSTRAVECTOR_Tyrotaronus_Dialogue.txt').write_text('Tyrotaronus / VECTOR OF NEUTRALITY\nTRANSMISSION AFTER CREATING A SPECIES\n\n'+'\n\n'.join(str(i+1)+'. '+q for i,q in enumerate(tyro_lines))+'\n',encoding='utf-8')
croxian_relief_lines={name:json.loads(re.search(r'const '+name+r'=(\[.*?\n \]);',croxian_relief_source,re.S).group(1)) for name in ['ARRIVAL','FRAME']}
assert all(len(lines)==10 for lines in croxian_relief_lines.values())
(out/'NOSTRAVECTOR_Orion_Defends_Croxian_Quotes.txt').write_text('ORION MASCAR / DEFENDING CROXIAN / LIVING SON ROUTE\n\n'+'\n\n'.join(name+'\n'+'\n\n'.join(str(i+1)+'. '+line for i,line in enumerate(lines)) for name,lines in croxian_relief_lines.items())+'\n',encoding='utf-8')
crew_enemy_quotes=json.loads(re.sub(r'(?m)^(\s*)(\w+):',r'\1"\2":',re.search(r'const quotes=(\{.*?\n \});',crew_enemy_source,re.S).group(1)))
assert len(crew_enemy_quotes)==15 and all(len(lines)==2 for lines in crew_enemy_quotes.values())
(out/'NOSTRAVECTOR_Enemy_Companion_Quotes.txt').write_text('NOSTRAVECTOR / ENEMY GOVERNOR ENCOUNTER REACTIONS\nTwo combat lines per companion profile. All profiles include matching recordings. Boss theme: THE WRONG ENEMY.\n\n'+'\n\n'.join(name.upper()+'\n'+'\n'.join(str(i+1)+'. '+line for i,line in enumerate(lines)) for name,lines in crew_enemy_quotes.items())+'\n',encoding='utf-8')
hak_new_life=json.loads(re.search(r'const LINES=(\[.*?\n \]);',(work/'catharsis_return_hak.js').read_text(encoding='utf-8'),re.S).group(1))
(out/'NOSTRAVECTOR_Hak_New_Life_Dialogue.txt').write_text('HAK CHOMPJAK / CHAPTER 4 / RETURN AFTER THE CATHARSIS BOARDING\n\n'+'\n\n'.join(str(i+1)+'. '+line for i,line in enumerate(hak_new_life))+'\n',encoding='utf-8')
catharsis_aftermath=json.loads(re.search(r'const LINES=(\[.*?\n \]);',(work/'catharsis_aftermath.js').read_text(encoding='utf-8'),re.S).group(1))
assert len(catharsis_aftermath)==10
(out/'NOSTRAVECTOR_Catharsis_Aftermath_Dialogue.txt').write_text('CATHARSIS / AFTER THE FINAL BOARDING WAVE\nENGLISH ONLY\n\n'+'\n\n'.join(str(i+1)+'. '+line for i,line in enumerate(catharsis_aftermath))+'\n',encoding='utf-8')
catharsis_quotes=[(json.loads(alien),json.loads(meaning)) for alien,meaning in re.findall(r'\{alien:(".*?"),meaning:(".*?")\}',catharsis_transmission_source)]
assert len(catharsis_quotes)==10
(out/'NOSTRAVECTOR_Catharsis_Transmission.txt').write_text('CATHARSIS / AFTER RECOVERING THE RIFLE\nAlien audio/captions by default. The LANGUAGE button switches the current line to English audio/captions without restarting the sequence.\n\n'+'\n\n'.join(str(i+1)+'. '+alien+'\nEnglish: '+meaning for i,(alien,meaning) in enumerate(catharsis_quotes))+'\n\nNEXT OBJECTIVE: THEY HAVE INVADED THE SHIP!!\n',encoding='utf-8')
williams_offer=json.loads(re.search(r'const OFFER=(\[.*?\n \]);',(work/'williams_expedition.js').read_text(encoding='utf-8'),re.S).group(1))
(out/'NOSTRAVECTOR_Williams_Recruitment_Dialogue.txt').write_text('JOSIAH WILLIAMS II / AFTER DE-ESCALATION\nAll three successful routes share this conversation. Speak to Williams again.\n\n'+'\n\n'.join(str(i+1)+'. '+line for i,line in enumerate(williams_offer))+'\n\nWELCOME ABOARD / INVESTIGATE A CATHARSIS WORLD\n',encoding='utf-8')
js+='\n'+(work/'williams_gareth_speech.js').read_text(encoding='utf-8')
(out/'NOSTRAVECTOR_Josiah_Williams_II_Responses.txt').write_text('PLAYER RESPONSE WHEEL / AFTER JOSIAH SPEAKS\n\n'+
 'RUDE: Maybe they were right about you.\nSARCASTIC: Want fries with that?\nSYMPATHETIC: I\'m really sorry to hear that, I want to help you.\nIGNORANT: I\'m sorry? what?\n',encoding='utf-8')
williams_reactions=json.loads(re.search(r'const REACTIONS=(\{.*?\n \});',(work/'josiah_williams.js').read_text(encoding='utf-8'),re.S).group(1))
(out/'NOSTRAVECTOR_Josiah_Williams_II_Reactions.txt').write_text('JOSIAH WILLIAMS II / ANSWERS TO THE DIALOGUE WHEEL\n\n'+'\n\n'.join(tone.upper()+' / '+('CONTINUES THE CONVERSATION' if tone=='sympathetic' else 'ENDS THE CONVERSATION')+'\n'+'\n\n'.join(str(i+1)+'. '+line for i,line in enumerate(lines)) for tone,lines in williams_reactions.items())+'\n',encoding='utf-8')
rampage_quotes=ast.literal_eval(re.search(r'const QUOTES=(\[.*?\n \]);',(work/'mascar_rampage_core.js').read_text(encoding='utf-8'),re.S).group(1))
rampage_defeat=re.search(r"const DEFEAT='(.*?)';",(work/'mascar_rampage_core.js').read_text(encoding='utf-8')).group(1)
(out/'NOSTRAVECTOR_Mascar_Phase3_Quotes.txt').write_text('ORION MASCAR / ORBITAL RAMPAGE / PHASE 3 / 3,000,000 HP\n\n'+'\n\n'.join(str(i+1)+'. '+q for i,q in enumerate(rampage_quotes))+'\n\nDEFEAT\n'+rampage_defeat+'\n',encoding='utf-8')
williams_lines=json.loads(re.search(r'const LINES=(\[.*?\n \]);',(work/'josiah_williams.js').read_text(encoding='utf-8'),re.S).group(1))
williams_source=(work/'josiah_williams.js').read_text(encoding='utf-8')
williams_early=json.loads(re.search(r'const CHAPTER3=(".*?");',williams_source).group(1))
williams_reflection=json.loads(re.search(r'const REFLECTION=(".*?");',williams_source).group(1))
williams_richards=json.loads(re.search(r'const RICHARDS=(\[.*?\n \]);',williams_source,re.S).group(1))
assert len(williams_richards)==5
(out/'NOSTRAVECTOR_Richards_Williams_Encounter.txt').write_text('JOSIAH RICHARDS / JOSIAH WILLIAMS II\nCHAPTER 4 / EARTH / EUROPE\nBring the Project BC Josiah Richards as an active follower. Only Richards speaks. Completing all five lines de-escalates without the dialogue wheel.\n\n'+'\n\n'.join(str(i+1)+'. JOSIAH RICHARDS\n'+line for i,line in enumerate(williams_richards))+'\n',encoding='utf-8')
williams_gareth=[{'speaker':speaker,'text':json.loads(line)} for speaker,line in re.findall(r"\{speaker:'(gareth|josiah)',text:(\".*?\")\}",williams_source)]
assert len(williams_gareth)==12 and [line['speaker'] for line in williams_gareth]==['gareth','josiah']*6
(out/'NOSTRAVECTOR_Gareth_Josiah_Encounter.txt').write_text('GARETH WILLIAMS / JOSIAH WILLIAMS II\nCHAPTER 4 / EARTH / EUROPE\nBring either Project BC Gareth model as a following companion. Finish this exchange to de-escalate without the dialogue wheel.\n\n'+'\n\n'.join(str(i+1)+'. '+('GARETH WILLIAMS' if line['speaker']=='gareth' else 'JOSIAH WILLIAMS II')+'\n'+line['text'] for i,line in enumerate(williams_gareth))+'\n\nJOSIAH / AFTER THE CONVERSATION\n'+williams_reflection+'\n',encoding='utf-8')
(out/'NOSTRAVECTOR_Josiah_Williams_II_Dialogue.txt').write_text('JOSIAH WILLIAMS II / EUROPE / THE LAST OF HIS DYNASTY\n\nHIDDEN CHAPTER 3 ENCOUNTER\n'+williams_early+'\n\nCHAPTER 4 / FIRST MEETING\n\n'+'\n\n'.join(str(i+1)+'. '+q for i,q in enumerate(williams_lines))+'\n\nAFTER THE SYMPATHETIC RESPONSE / RETURN VISITS\n'+williams_reflection+'\n',encoding='utf-8')
chapter4_narration=ast.literal_eval(re.search(r'const NARRATION=(\[.*?\n \]);',(work/'chapter4_core.js').read_text(encoding='utf-8'),re.S).group(1))
(out/'NOSTRAVECTOR_Chapter4_Narration.txt').write_text('CHAPTER 4 / SPACE REMEMBERS\n\n'+'\n\n'.join(str(i+1)+'. '+q for i,q in enumerate(chapter4_narration))+'\n\n2 YEARS LATER - 2127 AD\n\n...and now, it’s time to take it back.\n',encoding='utf-8')
epilogue_quotes=ast.literal_eval(re.search(r'const HAWTHORNE=(\[.*?\n \]);',(work/'sol_epilogue_core.js').read_text(encoding='utf-8'),re.S).group(1))
stranger_quotes=ast.literal_eval(re.search(r'const STRANGER=(\[.*?\n \]);',(work/'sol_epilogue_core.js').read_text(encoding='utf-8'),re.S).group(1))
(out/'NOSTRAVECTOR_Sol_Final_Cutscene.txt').write_text('THOMAS HAWTHORNE / FINAL WORDS\n\n'+'\n\n'.join(str(i+1)+'. '+q for i,q in enumerate(epilogue_quotes))+'\n\n???? / AFTER THE FINAL BLOW\n\n'+'\n\n'.join(str(i+1)+'. '+q for i,q in enumerate(stranger_quotes))+'\n',encoding='utf-8')
rage_quotes=ast.literal_eval(re.search(r'const QUOTES=(\[.*?\n \]);',(work/'siege_sol_core.js').read_text(encoding='utf-8'),re.S).group(1))
(out/'NOSTRAVECTOR_Hawthorne_Rage.txt').write_text('THOMAS HAWTHORNE / THE FRACTURE / TEN PARAGRAPHS\n\n'+'\n\n'.join(str(i+1)+'. '+q for i,q in enumerate(rage_quotes))+'\n',encoding='utf-8')
victory_quotes=ast.literal_eval(re.search(r'const QUOTES=(\[.*?\n \]);',(work/'janira_victory_core.js').read_text(encoding='utf-8'),re.S).group(1))
(out/'NOSTRAVECTOR_Hak_Janira_Victory.txt').write_text('HAK CHOMPJAK / JANIRA PRIME LIBERATED\n\n'+'\n\n'.join(str(i+1)+'. '+q for i,q in enumerate(victory_quotes))+'\n',encoding='utf-8')
moon_argument=ast.literal_eval(re.search(r'const QUOTES=(\[.*?\n \]);',(work/'sol_war_core.js').read_text(encoding='utf-8'),re.S).group(1))
(out/'NOSTRAVECTOR_Moon_Argument_Dialogue.txt').write_text('MOON TRANSMISSION / DARIUS ANCIN AND THOMAS HAWTHORNE\n\n'+'\n\n'.join(str(i+1)+'. '+name+': '+line for i,(name,line) in enumerate(moon_argument))+'\n',encoding='utf-8')
orion_grief=ast.literal_eval(re.search(r'const QUOTES=(\[.*?\n \]);',(work/'vengeful_mascar_core.js').read_text(encoding='utf-8'),re.S).group(1))
(out/'NOSTRAVECTOR_Orion_Vengeful_Mascar_Quotes.txt').write_text('ORION MASCAR / A FATHER’S GRIEF\n\n'+'\n\n'.join(str(i+1)+'. '+q for i,q in enumerate(orion_grief))+'\n',encoding='utf-8')
html=(work/'menu_shell.html').read_text(encoding='utf-8').replace('<script>__SCRIPT__',(work/'customizer.html').read_text(encoding='utf-8')+'\n'+(work/'character_select.html').read_text(encoding='utf-8')+'\n'+((work/'antarctica.html').read_text(encoding='utf-8')+(work/'africa.html').read_text(encoding='utf-8')+(work/'space.html').read_text(encoding='utf-8')+(work/'world_flight.html').read_text(encoding='utf-8')+(work/'ecology.html').read_text(encoding='utf-8')+(work/'eris.html').read_text(encoding='utf-8')).replace('</section>', '', 1)+'</section>'+'\n<script>__SCRIPT__').replace('__INTRO_CSS__',(work/'intro.css').read_text(encoding='utf-8')+'\n'+(work/'customizer.css').read_text(encoding='utf-8')+'\n'+(work/'character_select.css').read_text(encoding='utf-8')+'\n'+(work/'antarctica.css').read_text(encoding='utf-8')+'\n'+(work/'hazard.css').read_text(encoding='utf-8')+'\n'+(work/'earth_navigation.css').read_text(encoding='utf-8')+'\n'+(work/'expedition.css').read_text(encoding='utf-8')+'\n'+(work/'betrayal.css').read_text(encoding='utf-8')+'\n'+(work/'africa.css').read_text(encoding='utf-8')+'\n'+(work/'space.css').read_text(encoding='utf-8')+'\n'+(work/'world_flight.css').read_text(encoding='utf-8')+(work/'ecology.css').read_text(encoding='utf-8')+(work/'eris.css').read_text(encoding='utf-8')).replace('__SCRIPT__',js+'\nwindow.NVStartup?.ready();')
html=html.replace('</style>',(work/'construction.css').read_text(encoding='utf-8')+'</style>',1).replace('<script>',(work/'construction.html').read_text(encoding='utf-8')+'<script>',1)
html=html.replace('</style>',(work/'quests.css').read_text(encoding='utf-8')+'</style>',1).replace('<script>',(work/'quests.html').read_text(encoding='utf-8')+'<script>',1)
html=html.replace('</style>',(work/'janira_siege.css').read_text(encoding='utf-8')+(work/'janira_victory.css').read_text(encoding='utf-8')+(work/'siege_sol.css').read_text(encoding='utf-8')+(work/'chapter4.css').read_text(encoding='utf-8')+(work/'chapter4_menu.css').read_text(encoding='utf-8')+(work/'chapter4_space_mood.css').read_text(encoding='utf-8')+(work/'am_grek.css').read_text(encoding='utf-8')+(work/'capital_ship.css').read_text(encoding='utf-8')+(work/'story_checkpoints.css').read_text(encoding='utf-8')+'</style>',1)
html=html.replace('</style>',(work/'archiostal.css').read_text(encoding='utf-8')+(work/'archamus.css').read_text(encoding='utf-8')+'</style>',1)
html=html.replace('</style>',(work/'mascar_rampage.css').read_text(encoding='utf-8')+(work/'vengeful_mascar.css').read_text(encoding='utf-8')+(work/'imperia_inner_circle.css').read_text(encoding='utf-8')+'</style>',1)
html=html.replace('</style>',(work/'karribassa_boss.css').read_text(encoding='utf-8')+'</style>',1)
html=html.replace('</style>',(work/'clean_hud.css').read_text(encoding='utf-8')+(work/'hak.css').read_text(encoding='utf-8')+(work/'sol_war.css').read_text(encoding='utf-8')+(work/'galaxy.css').read_text(encoding='utf-8')+(work/'pontifex.css').read_text(encoding='utf-8')+(work/'hawthorne_transmission.css').read_text(encoding='utf-8')+(work/'hud_layout.css').read_text(encoding='utf-8')+(work/'khazglar_cutscene.css').read_text(encoding='utf-8')+(work/'imperia_arrival.css').read_text(encoding='utf-8')+(work/'khazglar_reward.css').read_text(encoding='utf-8')+(work/'ship_interior.css').read_text(encoding='utf-8')+(work/'charon_robot.css').read_text(encoding='utf-8')+(work/'brown_story.css').read_text(encoding='utf-8')+(work/'menu_crew.css').read_text(encoding='utf-8')+(work/'governance.css').read_text(encoding='utf-8')+(work/'brown_bastion.css').read_text(encoding='utf-8')+(work/'brown_resolution.css').read_text(encoding='utf-8')+(work/'sol_fall.css').read_text(encoding='utf-8')+'</style>',1)
html=html.replace('</style>',(work/'combat_alerts.css').read_text(encoding='utf-8')+'</style>',1)
html=html.replace('<script>', '<script>'+(work/'startup_guard.js').read_text(encoding='utf-8')+'</script>\n<script>',1)
# Publish only a complete file; a refresh during a rebuild must never read half a script.
main_target=out/'NOSTRAVECTOR_Main_Menu.html'
main_staging=out/'NOSTRAVECTOR_Main_Menu.building'
main_staging.write_text(html,encoding='utf-8')
main_staging.replace(main_target)
(work/'menu-check.js').write_text(js,encoding='utf-8')
(out/'NOSTRAVECTOR_Intro_Quotes.json').write_text(json.dumps(quotes,indent=2),encoding='utf-8')
(out/'NOSTRAVECTOR_Hawthorne_Moon_Transmission.txt').write_text('THOMAS HAWTHORNE â€” MOON DEPARTURE TRANSMISSION\nNEXT QUEST: HEAD TO MARS\n\n'+'\n\n'.join(str(i+1)+'. '+q for i,q in enumerate(hawthorne_quotes))+'\n',encoding='utf-8')
(out/'NOSTRAVECTOR_Menu_README.txt').write_text((work/'game_readme.txt').read_text(encoding='utf-8'),encoding='utf-8')
(out/'NOSTRAVECTOR_Sol_Sources.md').write_text((work/'sol_sources.md').read_text(encoding='utf-8'),encoding='utf-8')
(out/'NOSTRAVECTOR_Hazard_Script.txt').write_text((work/'hazard_script.txt').read_text(encoding='utf-8'),encoding='utf-8')
(out/'NOSTRAVECTOR_James_Ferry_Script.txt').write_text('JAMES BROWN â€” SECOND BLIZZARD / FERRY TO AFRICA\n\n'+'\n\n'.join(str(i+1)+'. '+q for i,q in enumerate(json.loads((work/'james_ferry_quotes.json').read_text(encoding='utf-8'))))+'\n',encoding='utf-8')
print('Built standalone menu:',len(html),'characters')
paras=re.search(r'const JAMES_BETRAYAL_QUOTES=(\[[\s\S]*?\]);',(work/'antarctica_betrayal.js').read_text(encoding='utf-8')).group(1)
(out/'NOSTRAVECTOR_James_Betrayal_Script.txt').write_text('JAMES BROWN â€” BETRAYAL AT THE FERRY\n\n'+'\n\n'.join(str(i+1)+'. '+q for i,q in enumerate(json.loads(paras)))+'\n\nCUTSCENE: James draws his weapon and fires. The player dodges, pushes James off the bridge into the water, runs onto the ferry, and sails north toward Africa.\n',encoding='utf-8')

james_quotes=json.loads('['+re.search(r'const JAMES_QUOTES=\[(.*?)\];',(work/'antarctica_game.js').read_text(encoding='utf-8'),re.S).group(1)+']')
car_quote=json.loads(re.search(r'const JAMES_CAR_QUOTE=(".*?");',(work/'antarctica_game.js').read_text(encoding='utf-8')).group(1))
(out/'NOSTRAVECTOR_James_Script.txt').write_text('JAMES BROWN â€” ANTARCTIC OPENING\n\n'+'\n\n'.join(str(i+1)+'. '+q for i,q in enumerate(james_quotes))+'\n\nAFTER ONE MINUTE OF ACTIVE FREE ROAM\n'+car_quote+'\n\nAT THE RESEARCH STATION â€” TEN LINES\n\n'+'\n\n'.join(str(i+1)+'. '+q for i,q in enumerate(json.loads('['+re.search(r'const JAMES_STATION_QUOTES=\[(.*?)\];',(work/'antarctica_speech.js').read_text(encoding='utf-8'),re.S).group(1)+']')))+'\n',encoding='utf-8')

(out/'NOSTRAVECTOR_James_Supply_Script.txt').write_text('JAMES BROWN â€” AFTER THE BLIZZARD\n\n'+'\n\n'.join(str(i+1)+'. '+q for i,q in enumerate(json.loads((work/'james_supply_quotes.json').read_text(encoding='utf-8'))))+'\n',encoding='utf-8')

(out/'NOSTRAVECTOR_Hawthorne_Moon_Transmission.txt').write_text('THOMAS HAWTHORNE â€” TRANSMISSION AFTER LEAVING THE MOON\n\n'+'\n\n'.join(str(i+1)+'. '+q for i,q in enumerate(hawthorne_quotes))+'\n',encoding='utf-8')

(out/'NOSTRAVECTOR_Khazglar_Dialogue.txt').write_text('KHAZGLAR / FIRST MEETING AT OLYMPUS MONS\n\n'+'\n\n'.join(str(i+1)+'. '+q for i,q in enumerate(khazglar_quotes))+'\n',encoding='utf-8')

(out/'NOSTRAVECTOR_Hawthorne_Mars_Orders.txt').write_text('THOMAS HAWTHORNE / MARS ORDERS\n\n'+'\n\n'.join(str(i+1)+'. '+q for i,q in enumerate(hawthorne_mars_quotes))+'\n',encoding='utf-8')

for constant,heading in [('INTRO','CONFRONTATION / FIVE LINES'),('BARKS','BOSS FIGHT / TEN LINES')]:
    lines=ast.literal_eval(re.search(r'const '+constant+r'=(\[.*?\n \]);',(work/'brown_bastion_core.js').read_text(encoding='utf-8'),re.S).group(1))
    with (out/'NOSTRAVECTOR_James_Boss_Dialogue.txt').open('w' if constant=='INTRO' else 'a',encoding='utf-8') as f:f.write(heading+'\n\n'+'\n\n'.join(str(i+1)+'. '+q for i,q in enumerate(lines))+'\n\n')

fall_quotes=ast.literal_eval(re.search(r'const QUOTES=(\[.*?\n \]);',(work/'sol_fall_core.js').read_text(encoding='utf-8'),re.S).group(1))
(out/'NOSTRAVECTOR_Hak_Sol_Fall_Dialogue.txt').write_text('HAK CHOMPJAK / AFTER THE FALL OF SOL\n\n'+'\n\n'.join(str(i+1)+'. '+q for i,q in enumerate(fall_quotes))+'\n',encoding='utf-8')

expedition_quotes=ast.literal_eval(re.search(r'const BRIEFING=(\[.*?\n \]);',(work/'janira_expedition_core.js').read_text(encoding='utf-8'),re.S).group(1))
(out/'NOSTRAVECTOR_Hak_Expansion_Dialogue.txt').write_text('HAK CHOMPJAK / RETURN TO HAK\n\n'+'\n\n'.join(str(i+1)+'. '+q for i,q in enumerate(expedition_quotes))+'\n',encoding='utf-8')

# Recording script for the new Project BC combat captions.
source=(work/'project_bc_combat.js').read_text(encoding='utf-8')
combat_taunts={}
for key in ['josiah','peter','gareth']:
    combat_taunts[key]=ast.literal_eval(re.search(key+r':(\[.*?\n  \])',source,re.S).group(1))
text='PROJECT BC / COMBAT DIALOGUE\n\n'
for key,name in [('josiah','JOSIAH RICHARDS'),('peter','PETER CHAMBERS'),('gareth','GARETH WILLIAMS / BOTH OUTFITS')]:
    text+=name+'\n\n'+'\n\n'.join(str(i+1)+'. '+line for i,line in enumerate(combat_taunts[key]))+'\n\n'
text+='ABILITY SHOUT / JOSIAH\nALMIGHTY HEAVEN!\n\nTRIP / GARETH\nOW! I\'M OKAY!\n'
(out/'NOSTRAVECTOR_Project_BC_Combat_Dialogue.txt').write_text(text,encoding='utf-8')

(out/'NOSTRAVECTOR_Governor_Quotes.txt').write_text('SHARED GOVERNOR DIALOGUE / TEN INDEPENDENT CONVERSATIONS\nRandomized individually; these are not a ten-line dialogue chain.\n\n'+'\n\n'.join(str(i+1)+'. ['+q['kind'].upper()+'] '+q['text'] for i,q in enumerate(governor_quotes))+'\n',encoding='utf-8')

for governor,lines in json.loads((work/'governor_personalities.json').read_text(encoding='utf-8')).items():
    (out/('NOSTRAVECTOR_Governor_'+governor.title()+'_Quotes.txt')).write_text(governor.upper()+' / TEN INDEPENDENT GOVERNOR CONVERSATIONS\n\n'+'\n\n'.join(str(i+1)+'. '+lines[q['id']] for i,q in enumerate(governor_quotes))+'\n',encoding='utf-8')

governor_names={'orion':'ORION MASCAR','khazglar':'KHAZGLAR','james':'JAMES BROWN / RECRUITED','kizna':'KIZNA / RECRUITED AFTER DECLINING CHARON','charon':'CHARON / RECRUITED','nyrexia':'NYREXIA ERISCONOS','custom-species':'CUSTOM SPECIES GOVERNOR','gareth':'GARETH WILLIAMS / BOTH OUTFITS','peter':'PETER CHAMBERS','josiah':'JOSIAH RICHARDS','croxian':'CROXIAN MASCAR','malia':'MALIA DE TORO','williams':'JOSIAH WILLIAMS II','tyrotaronus':'TYROTARONUS'}
governor_profiles=json.loads((work/'governor_personalities.json').read_text(encoding='utf-8'))
all_governor_text='NOSTRAVECTOR / GOVERNOR CONVERSATIONS\nTen independent, randomized lines per character.\n\n'
for governor in governor_names:
    lines=governor_profiles[governor]
    section=governor_names[governor]+'\n\n'+'\n\n'.join(str(i+1)+'. '+lines[q['id']] for i,q in enumerate(governor_quotes))+'\n\n'
    all_governor_text+=section
    (out/('NOSTRAVECTOR_Governor_'+governor.title()+'_Quotes.txt')).write_text(section,encoding='utf-8')
(out/'NOSTRAVECTOR_All_Governor_Quotes.txt').write_text(all_governor_text,encoding='utf-8')
tyro_faction_script='TYROTARONUS / COMPANION FACTION DIALOGUE\nTwo recorded posting lines and two recorded hostile encounter lines.\n\n'
for source,heading in [('crew_diplomacy_core.js','OFFERING A FOREIGN GOVERNOR POSTING'),('crew_enemy_encounters.js','HOSTILE GOVERNOR ENCOUNTER')]:
    lines=ast.literal_eval(re.search(r'(?m)^\s*tyrotaronus:(\[.*?\])[,}]',(work/source).read_text(encoding='utf-8')).group(1))
    tyro_faction_script+=heading+'\n\n'+'\n\n'.join(str(i+1)+'. '+line for i,line in enumerate(lines))+'\n\n'
(out/'NOSTRAVECTOR_Tyrotaronus_Faction_Dialogue.txt').write_text(tyro_faction_script,encoding='utf-8')
