"""Temporary, in-memory previews. Never write localStorage or touch player saves."""
from pathlib import Path
root=Path(__file__).resolve().parents[1]
html=(root/'outputs/NOSTRAVECTOR_Main_Menu.html').read_text(encoding='utf-8')
base="""const solPreview=NVAntarctica.fresh(124);Object.assign(solPreview,{jamesIntroductionDone:true,stationFound:true,stationDialogueDone:true,hazardStage:'complete',jamesCarQuoteShown:true,supplyDialogueDone:true,suppliesPlanKnown:true,ferryDialogueDone:true,ferryPlanKnown:true,bedBuilt:true,bedRested:true,dreamDone:true,betrayalStage:'complete',ferryEscaped:true,jamesGone:true});NVAntarctica.grantWakeInventory(solPreview);NVAfrica.arrive(solPreview);solPreview.africaStage='complete';solPreview.friendQuest='recruited';solPreview.friendDialogueDone=true;solPreview.spaceshipFound=true;solPreview.x=NVAfrica.SHIP.x;solPreview.z=NVAfrica.SHIP.z-10;solPreview.space=NVSpace.fresh();NVSpace.board(solPreview);"""
views={
 'boarding':'',
 'saturn':"solPreview.space.body='saturn';solPreview.space.target='saturn';NVSpace.orbit(solPreview);",
 'earth':"solPreview.space.body='earth';solPreview.space.target='earth';NVSpace.orbit(solPreview);",
 'atlas':"solPreview.space.body='earth';NVSpace.orbit(solPreview);",
 'mars':"solPreview.space.body='mars';NVSpace.touchDown(solPreview);solPreview.cameraYaw=.35;",
 'charon':"solPreview.space.body='charon';NVSpace.touchDown(solPreview);solPreview.x=18;solPreview.z=11;solPreview.cameraYaw=.35;solPreview.friend={x:16,z:9,yaw:0};",
 'jupiter':"solPreview.space.body='jupiter';NVSpace.touchDown(solPreview);solPreview.cameraYaw=.25;",
}
for name,setup in views.items():
    fixture=base+setup+"savedGame=validCharacterSave({id:'temporary-sol-preview',wanderer:{...DEFAULT_WANDERER,name:'The Wanderer'},progress:{chapter:3,checkpoint:'sol-preview',antarctica:NVAntarctica.snapshot(solPreview)}});savedWanderer=savedGame.wanderer;startAntarctica();soundtrack.setEnabled(false);"
    if name=='atlas':fixture+='toggleSolChart(true);'
    index=html.rfind('</script>');(root/f'outputs/sol-{name}-qa.html').write_text(html[:index]+fixture+html[index:],encoding='utf-8')
print('Created seven read-only Sol preview fixtures.')
