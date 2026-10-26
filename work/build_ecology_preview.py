"""In-memory ecological QA, with all persistent save writes disabled."""
from pathlib import Path
root=Path(__file__).resolve().parents[1]
html=(root/'outputs/NOSTRAVECTOR_Main_Menu.html').read_text(encoding='utf-8')
# Shadow storage before any game module initializes, including the soundtrack.
# Native storage remains readable; QA can never write character progress or settings.
guard="const nativeQAStorage=window.localStorage;Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:key=>nativeQAStorage.getItem(key),setItem(){throw Error('Read-only QA storage');},removeItem(){throw Error('Read-only QA storage');}}});"
html=html.replace('<script>','<script>'+guard,1)
base="""const wildlifePreview=NVAntarctica.fresh(124);Object.assign(wildlifePreview,{jamesIntroductionDone:true,stationFound:true,stationDialogueDone:true,hazardStage:'complete',jamesCarQuoteShown:true,supplyDialogueDone:true,suppliesPlanKnown:true,ferryDialogueDone:true,ferryPlanKnown:true,bedBuilt:true,bedRested:true,dreamDone:true,betrayalStage:'complete',ferryEscaped:true,jamesGone:true});NVAntarctica.grantWakeInventory(wildlifePreview);NVAfrica.arrive(wildlifePreview);wildlifePreview.africaStage='complete';wildlifePreview.friendQuest='recruited';wildlifePreview.friendDialogueDone=true;wildlifePreview.spaceshipFound=true;wildlifePreview.space=NVSpace.fresh();"""
views={
 'titan':"wildlifePreview.space.body='titan';NVSpace.touchDown(wildlifePreview);wildlifePreview.x=40;wildlifePreview.z=24;wildlifePreview.cameraYaw=.55;wildlifePreview.friend={x:42,z:21,yaw:0};",
 'europa':"wildlifePreview.space.body='europa';NVSpace.touchDown(wildlifePreview);wildlifePreview.x=20;wildlifePreview.z=-12;NVEcology.toggleOcean(wildlifePreview);wildlifePreview.cameraYaw=.6;",
 'enceladus':"wildlifePreview.space.body='enceladus';NVSpace.touchDown(wildlifePreview);wildlifePreview.x=20;wildlifePreview.z=-12;NVEcology.toggleOcean(wildlifePreview);wildlifePreview.cameraYaw=.6;",
 'antarctica':"wildlifePreview.space=null;Object.assign(wildlifePreview,{africaStarted:false,africaStage:'unseen',ferryEscaped:false,betrayalStage:'unseen',jamesGone:false,stationFound:false,stationDialogueDone:false,bedRested:false,bedBuilt:false});wildlifePreview.x=35;wildlifePreview.z=20;wildlifePreview.cameraYaw=.5;wildlifePreview.james={x:38,z:17,yaw:0};",
 'mars':"wildlifePreview.space.body='mars';NVSpace.touchDown(wildlifePreview);"
}
for name,setup in views.items():
 fixture=base+setup+"savedGame=validCharacterSave({id:'temporary-ecology-preview',wanderer:{...DEFAULT_WANDERER,name:'The Wanderer'},progress:{chapter:3,checkpoint:'ecology-preview',antarctica:NVAntarctica.snapshot(wildlifePreview)}});savedWanderer=savedGame.wanderer;startAntarctica();soundtrack.setEnabled(false);$('#saveWorld').disabled=true;"
 # Camera controls use UI interaction rather than hidden browser state mutation.
 fixture+="""const previewControls=document.createElement('div');previewControls.id='ecologyQA';previewControls.style='position:fixed;top:12px;left:40%;z-index:90;display:flex;gap:5px;background:#071827;padding:5px;';for(const [label,yaw,pitch] of [['VIEW HORIZON',.5,-.08],['TURN AROUND',Math.PI,.2]]){const b=document.createElement('button');b.textContent=label;b.onclick=()=>{polarState.cameraYaw=yaw;polarState.cameraPitch=pitch;};previewControls.append(b);}const frame=document.createElement('button');frame.textContent='NEAR WILDLIFE';frame.onclick=()=>{const r=NVEcology.populate(polarState),a=r.animals.filter(a=>!a.species.flying&&a.species.behavior!=='predator').sort((a,b)=>Math.hypot(a.x-polarState.x,a.z-polarState.z)-Math.hypot(b.x-polarState.x,b.z-polarState.z))[0];if(a){polarState.x=a.x-5;polarState.z=a.z-12;polarState.cameraYaw=0;polarState.cameraPitch=.05;if(polarState.friend)polarState.friend={x:polarState.x+2,z:polarState.z-3,yaw:0};updatePolarHUD();}};previewControls.append(frame);const hide=document.createElement('button');hide.textContent='HIDE QA CONTROLS';hide.onclick=()=>previewControls.style.display='none';previewControls.append(hide);document.body.append(previewControls);"""
 at=html.rfind('</script>');(root/f'outputs/ecology-{name}-qa.html').write_text(html[:at]+fixture+html[at:],encoding='utf-8')
print('Created ecological QA fixtures without modifying character saves.')
