from pathlib import Path
root=Path(__file__).resolve().parents[1]
html=(root/'outputs/NOSTRAVECTOR_Main_Menu.html').read_text(encoding='utf-8')
fixture="""
// In-memory visual fixture; never writes game progress or character saves.
const weatherPreview=NVAntarctica.fresh(123);Object.assign(weatherPreview,{x:0,z:1698,james:{x:1.7,z:1699.5,yaw:Math.PI},jamesIntroductionDone:true,stationFound:true,stationDialogueDone:true,hazardStage:'complete',superBlizzard:true,stormRemaining:.3,jamesCarQuoteShown:true});
savedGame=validCharacterSave({id:'temporary-weather-preview',wanderer:{...DEFAULT_WANDERER,name:'Weather Preview'},progress:{chapter:1,checkpoint:'antarctica-station',antarctica:NVAntarctica.snapshot(weatherPreview)}});savedWanderer=savedGame.wanderer;startAntarctica();
"""
end=html.rfind('</script>');assert end>0
(root/'outputs/weather-qa.html').write_text(html[:end]+fixture+html[end:],encoding='utf-8')
print('Created unsaved weather-expiry and world-map fixture.')
