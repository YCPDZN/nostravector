from pathlib import Path
root=Path(__file__).resolve().parents[1];html=(root/'outputs/NOSTRAVECTOR_Main_Menu.html').read_text(encoding='utf-8')
base="""const betrayalPreview=NVAntarctica.fresh(123);Object.assign(betrayalPreview,{x:NVAntarctica.FERRY.x,z:NVAntarctica.FERRY.z-25,cameraPitch:.35,earthTime:400,jamesIntroductionDone:true,stationFound:true,stationDialogueDone:true,hazardStage:'complete',nextBlizzardRemaining:300,jamesCarQuoteShown:true,supplyDialogueDone:true,suppliesPlanKnown:true,ferryDialogueDone:true,ferryPlanKnown:true,bedMaterialsCollected:true,bedBuilt:true,bedRested:true,dreamDone:true});NVAntarctica.grantWakeInventory(betrayalPreview);NVBetrayal.begin(betrayalPreview);"""
modes={'dialogue':"betrayalPreview.betrayalIndex=2;",'shot':"betrayalPreview.betrayalStage='action';NVBetrayal.actionStep(betrayalPreview,3.18);",'fall':"betrayalPreview.betrayalStage='action';NVBetrayal.actionStep(betrayalPreview,7.8);",'run':"betrayalPreview.betrayalStage='action';NVBetrayal.actionStep(betrayalPreview,13);",'sail':"betrayalPreview.betrayalStage='action';NVBetrayal.actionStep(betrayalPreview,23);",'voyage':"betrayalPreview.betrayalStage='action';NVBetrayal.actionStep(betrayalPreview,27);"}
modes['final']="betrayalPreview.betrayalIndex=14;"
for mode,setup in modes.items():
 fixture=base+setup+"""savedGame=validCharacterSave({id:'temporary-betrayal-preview',wanderer:{...DEFAULT_WANDERER,name:'The Wanderer'},progress:{chapter:1,checkpoint:'antarctica-ferry',antarctica:NVAntarctica.snapshot(betrayalPreview)}});savedWanderer=savedGame.wanderer;startAntarctica();"""
 # Static cinematic preview only, with no persistent writes. Pause retains the exact action pose.
 if mode not in ['dialogue','voyage','final']:fixture+="gamePaused=true;$('#worldPauseSheet').hidden=true;"
 end=html.rfind('</script>');assert end>0;(root/f'outputs/betrayal-{mode}-qa.html').write_text(html[:end]+fixture+html[end:],encoding='utf-8')
print('Built seven in-memory ferry-story previews; no saved progress is written.')
