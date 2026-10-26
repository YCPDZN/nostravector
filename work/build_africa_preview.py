from pathlib import Path
root=Path(__file__).resolve().parents[1]
html=(root/'outputs/NOSTRAVECTOR_Main_Menu.html').read_text(encoding='utf-8')
base="""const africaPreview=NVAntarctica.fresh(123);Object.assign(africaPreview,{jamesIntroductionDone:true,stationFound:true,stationDialogueDone:true,hazardStage:'complete',jamesCarQuoteShown:true,supplyDialogueDone:true,suppliesPlanKnown:true,ferryDialogueDone:true,ferryPlanKnown:true,bedMaterialsCollected:true,bedBuilt:true,bedRested:true,dreamDone:true,betrayalStage:'complete',betrayalTime:27,ferryEscaped:true,jamesGone:true,earthTime:300});NVAntarctica.grantWakeInventory(africaPreview);const previewBoat=NVBetrayal.ship(africaPreview);africaPreview.x=previewBoat.x;africaPreview.z=previewBoat.z-19;"""
views={
 'crossing':"NVAfrica.ensureJourney(africaPreview);",
 'title':"NVAfrica.arrive(africaPreview);",
 'briefing':"NVAfrica.arrive(africaPreview);NVAfrica.transitionStep(africaPreview,6);",
 'coast':"NVAfrica.arrive(africaPreview);africaPreview.africaStage='complete';",
 'camp':"NVAfrica.arrive(africaPreview);africaPreview.africaStage='complete';africaPreview.friendQuest='accepted';africaPreview.x=NVAfrica.CAMP.x;africaPreview.z=NVAfrica.CAMP.z-4;",
 'ship':"NVAfrica.arrive(africaPreview);africaPreview.africaStage='complete';africaPreview.z=NVAfrica.SHIP.z-18;",
 'voice':"africaPreview.betrayalStage='dialogue';africaPreview.betrayalIndex=2;africaPreview.ferryEscaped=false;africaPreview.jamesGone=false;africaPreview.x=NVAntarctica.FERRY.x;africaPreview.z=NVAntarctica.FERRY.z-9;africaPreview.james={x:NVAntarctica.FERRY.x+1.15,z:NVAntarctica.FERRY.z-6.5,yaw:Math.PI+.4};"
}
for name,setup in views.items():
 fixture=base+setup+"savedGame=validCharacterSave({id:'temporary-africa-preview',wanderer:{...DEFAULT_WANDERER,name:'The Wanderer'},progress:{chapter:2,checkpoint:'africa-preview',antarctica:NVAntarctica.snapshot(africaPreview)}});savedWanderer=savedGame.wanderer;startAntarctica();"
 if name=='title':fixture+="gamePaused=true;$('#worldPauseSheet').hidden=true;"
 index=html.rfind('</script>');(root/f'outputs/africa-{name}-qa.html').write_text(html[:index]+fixture+html[index:],encoding='utf-8')
print('Built seven in-memory audio/Africa QA previews; no character progress is saved.')
