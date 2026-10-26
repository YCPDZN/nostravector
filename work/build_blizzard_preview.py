from pathlib import Path
root=Path(__file__).resolve().parents[1]
html=(root/'outputs/NOSTRAVECTOR_Main_Menu.html').read_text(encoding='utf-8')
fixture="""
// Temporary visual fixture: in-memory test character, no save writes.
const stormPreview=NVAntarctica.fresh(123);stormPreview.x=0;stormPreview.z=1680;stormPreview.james={x:1.7,z:1681,yaw:Math.PI};stormPreview.jamesIntroductionDone=true;stormPreview.stationFound=true;stormPreview.stationDialogueDone=true;stormPreview.hazardStage='complete';stormPreview.superBlizzard=true;stormPreview.jamesCarQuoteShown=true;
savedGame=validCharacterSave({id:'temporary-storm-preview',wanderer:{...DEFAULT_WANDERER,name:'Storm Preview'},progress:{chapter:1,checkpoint:'antarctica-station',antarctica:NVAntarctica.snapshot(stormPreview)}});savedWanderer=savedGame.wanderer;startAntarctica();
"""
end=html.rfind('</script>');assert end>0
(root/'outputs/blizzard-qa.html').write_text(html[:end]+fixture+html[end:],encoding='utf-8')
print('Created temporary, unsaved blizzard visual fixture.')
