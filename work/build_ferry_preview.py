from pathlib import Path
root=Path(__file__).resolve().parents[1];html=(root/'outputs/NOSTRAVECTOR_Main_Menu.html').read_text(encoding='utf-8')
fixture='''
// Temporary in-memory story preview. No save writes.
const ferryPreview=NVAntarctica.fresh(123);Object.assign(ferryPreview,{x:0,z:1698,earthTime:660,james:{x:1.7,z:1699.5,yaw:Math.PI},jamesIntroductionDone:true,stationFound:true,stationDialogueDone:true,hazardStage:'complete',superBlizzard:true,blizzardCycle:1,jamesCarQuoteShown:true,supplyDialogueDone:true,suppliesPlanKnown:true,ferryDialoguePending:true});
savedGame=validCharacterSave({id:'temporary-ferry-preview',wanderer:{...DEFAULT_WANDERER,name:'The Wanderer'},progress:{chapter:1,checkpoint:'antarctica-station',antarctica:NVAntarctica.snapshot(ferryPreview)}});savedWanderer=savedGame.wanderer;startAntarctica();
'''
end=html.rfind('</script>');assert end>0
(root/'outputs/ferry-qa.html').write_text(html[:end]+fixture+html[end:],encoding='utf-8')
print('Created in-memory second-blizzard conversation preview.')
