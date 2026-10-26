from pathlib import Path
root=Path(__file__).resolve().parents[1]
html=(root/'outputs/NOSTRAVECTOR_Main_Menu.html').read_text(encoding='utf-8')
fixture="""
// Development fixture on a separate preview origin; the distributed game has no teleport.
creatingCharacter=true;writeGameSave({...DEFAULT_WANDERER,name:'Station Dialogue Preview'});creatingCharacter=false;savedWanderer=savedGame.wanderer;
const stationPreview=NVAntarctica.fresh(123);stationPreview.x=0;stationPreview.z=1683;stationPreview.james={x:0,z:1685,yaw:Math.PI};stationPreview.jamesIntroductionDone=true;stationPreview.stationFound=true;
updateGameProgress({chapter:1,checkpoint:'antarctica-station',antarctica:NVAntarctica.snapshot(stationPreview)});startAntarctica();beginJamesConversation();
"""
end=html.rfind('</script>');assert end>0
(root/'outputs/station-qa.html').write_text(html[:end]+fixture+html[end:],encoding='utf-8')
print('Created isolated station dialogue visual-test fixture.')
