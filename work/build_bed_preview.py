from pathlib import Path
root=Path(__file__).resolve().parents[1];html=(root/'outputs/NOSTRAVECTOR_Main_Menu.html').read_text(encoding='utf-8')
fixture='''
// Temporary in-memory crafting preview; no save writes.
const bedPreview=NVAntarctica.fresh(123);Object.assign(bedPreview,{x:-2.25,z:1696.5,cameraYaw:Math.PI/2,cameraPitch:.35,earthTime:1500,james:{x:-.8,z:1698,yaw:Math.PI},jamesIntroductionDone:true,stationFound:true,stationDialogueDone:true,hazardStage:'complete',superBlizzard:true,blizzardCycle:1,jamesCarQuoteShown:true,supplyDialogueDone:true,suppliesPlanKnown:true,ferryDialogueDone:true,ferryPlanKnown:true});
savedGame=validCharacterSave({id:'temporary-bed-preview',wanderer:{...DEFAULT_WANDERER,name:'The Wanderer'},progress:{chapter:1,checkpoint:'antarctica-station',antarctica:NVAntarctica.snapshot(bedPreview)}});savedWanderer=savedGame.wanderer;startAntarctica();
'''
end=html.rfind('</script>');assert end>0
(root/'outputs/bed-qa.html').write_text(html[:end]+fixture+html[end:],encoding='utf-8')
print('Created in-memory bed crafting preview.')
