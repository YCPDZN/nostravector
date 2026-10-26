from pathlib import Path
root=Path(__file__).resolve().parents[1];html=(root/'outputs/NOSTRAVECTOR_Main_Menu.html').read_text(encoding='utf-8')
base='''const expeditionPreview=NVAntarctica.fresh(123);Object.assign(expeditionPreview,{x:-2.25,z:1696.5,cameraYaw:Math.PI/2,cameraPitch:.35,earthTime:1500,james:{x:-.8,z:1698,yaw:Math.PI},jamesIntroductionDone:true,stationFound:true,stationDialogueDone:true,hazardStage:'complete',superBlizzard:false,nextBlizzardRemaining:300,blizzardCycle:1,jamesCarQuoteShown:true,supplyDialogueDone:true,suppliesPlanKnown:true,ferryDialogueDone:true,ferryPlanKnown:true,bedMaterialsCollected:true,bedBuilt:true});'''
modes={
 'dream':"NVAntarctica.beginBedSleep(expeditionPreview);NVAntarctica.bedSleepStep(expeditionPreview,3);",
 'dawn':"expeditionPreview.dreamDone=true;NVAntarctica.beginBedSleep(expeditionPreview);NVAntarctica.bedSleepStep(expeditionPreview,8);",
 'ferry':"expeditionPreview.dreamDone=true;NVAntarctica.beginBedSleep(expeditionPreview);NVAntarctica.bedSleepStep(expeditionPreview,8);NVAntarctica.unlockCar(expeditionPreview);Object.assign(expeditionPreview,{x:NVAntarctica.FERRY.x,z:NVAntarctica.FERRY.z-27,cameraYaw:.65,cameraPitch:.25,earthTime:300,superBlizzard:false,nextBlizzardRemaining:300,james:{x:NVAntarctica.FERRY.x+1,z:NVAntarctica.FERRY.z-30,yaw:0}});",
 'inventory':"expeditionPreview.dreamDone=true;NVAntarctica.beginBedSleep(expeditionPreview);NVAntarctica.bedSleepStep(expeditionPreview,8);"
}
for mode,setup in modes.items():
 fixture=base+setup+'''savedGame=validCharacterSave({id:'temporary-expedition-preview',wanderer:{...DEFAULT_WANDERER,name:'The Wanderer'},progress:{chapter:1,checkpoint:'antarctica-station',antarctica:NVAntarctica.snapshot(expeditionPreview)}});savedWanderer=savedGame.wanderer;startAntarctica();'''
 if mode=='inventory':fixture+='openInventory();'
 end=html.rfind('</script>');assert end>0
 (root/f'outputs/{mode}-qa.html').write_text(html[:end]+fixture+html[end:],encoding='utf-8')
print('Created in-memory dream, dawn and ferry previews; no save writes.')
