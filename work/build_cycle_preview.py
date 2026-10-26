from pathlib import Path
root=Path(__file__).resolve().parents[1]
html=(root/'outputs/NOSTRAVECTOR_Main_Menu.html').read_text(encoding='utf-8')
end=html.rfind('</script>');assert end>0
for name,clock in [('day',600),('night',1250)]:
    fixture='''
// Visual fixture only; no storage writes or changes to the player's saved progress.
const cyclePreview=NVAntarctica.fresh(123);Object.assign(cyclePreview,{x:0,z:1660,cameraYaw:.60,cameraPitch:.15,earthTime:CLOCK,james:{x:1.7,z:1659,yaw:0},jamesIntroductionDone:true,stationFound:true,stationDialogueDone:true,hazardStage:'complete',superBlizzard:false,jamesCarQuoteShown:true,supplyDialogueDone:true,suppliesPlanKnown:true});
savedGame=validCharacterSave({id:'temporary-cycle-preview',wanderer:{...DEFAULT_WANDERER,name:'The Wanderer'},progress:{chapter:1,checkpoint:'antarctica-station',antarctica:NVAntarctica.snapshot(cyclePreview)}});savedWanderer=savedGame.wanderer;startAntarctica();
'''.replace('CLOCK',str(clock))
    (root/f'outputs/{name}-qa.html').write_text(html[:end]+fixture+html[end:],encoding='utf-8')
print('Created in-memory day and night previews; no game saves written.')
