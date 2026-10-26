"""Isolated in-memory galaxy preview; never reads or writes player saves."""
from pathlib import Path
root=Path(__file__).resolve().parents[1]
html=(root/'outputs/NOSTRAVECTOR_Main_Menu.html').read_text(encoding='utf-8')
guard="Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:()=>null,setItem(){},removeItem(){}}});"
html=html.replace('<script>','<script>'+guard,1)
fixture="""
const galaxyPreview=NVAntarctica.fresh(124);Object.assign(galaxyPreview,{jamesIntroductionDone:true,stationFound:true,stationDialogueDone:true,hazardStage:'complete',bedBuilt:true,bedRested:true,dreamDone:true,betrayalStage:'complete',ferryEscaped:true,jamesGone:true});
NVAntarctica.grantWakeInventory(galaxyPreview);NVAfrica.arrive(galaxyPreview);galaxyPreview.africaStage='complete';galaxyPreview.friendQuest='recruited';galaxyPreview.friendDialogueDone=true;galaxyPreview.spaceshipFound=true;galaxyPreview.space=NVSpace.fresh();galaxyPreview.space.phase='flight';galaxyPreview.space.body='earth';galaxyPreview.space.target='moon';NVSpace.orbit(galaxyPreview);
savedGame=validCharacterSave({id:'isolated-galaxy-preview',wanderer:{...DEFAULT_WANDERER,name:'The Wanderer'},progress:{chapter:3,checkpoint:'galaxy-preview',antarctica:NVAntarctica.snapshot(galaxyPreview)}});savedWanderer=savedGame.wanderer;startAntarctica();soundtrack.setEnabled(false);$('#saveWorld').disabled=true;
const galaxyQA=document.createElement('button');galaxyQA.textContent='QA: NEAR FIGURE';galaxyQA.style='position:fixed;right:20px;top:80px;z-index:100';galaxyQA.onclick=()=>{const n=NVGalaxy.figure(polarState);if(n){polarState.x=n.x;polarState.z=n.z-4;polarState.cameraYaw=0;polarState.cameraPitch=.15;updatePolarHUD();}};document.body.append(galaxyQA);
"""
at=html.rfind('</script>')
(root/'outputs/galaxy-qa.html').write_text(html[:at]+fixture+html[at:],encoding='utf-8')
print('Built galaxy preview with isolated storage.')
