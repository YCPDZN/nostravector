"""QA fixtures use in-memory characters and never persist user progress."""
from pathlib import Path
import re,base64,io,wave
root=Path(__file__).resolve().parents[1];html=(root/'outputs/NOSTRAVECTOR_Main_Menu.html').read_text(encoding='utf-8')
# These scene fixtures test no recorded dialogue. Keep them lightweight with valid silent audio.
buf=io.BytesIO()
with wave.open(buf,'wb') as wav:
    wav.setnchannels(1);wav.setsampwidth(2);wav.setframerate(8000);wav.writeframes(b'\0\0'*80)
silent='data:audio/wav;base64,'+base64.b64encode(buf.getvalue()).decode()
html=re.sub(r'data:audio/mpeg;base64,[A-Za-z0-9+/=]+',silent,html)
base="""const erisPreview=NVAntarctica.fresh(124);Object.assign(erisPreview,{jamesIntroductionDone:true,stationFound:true,stationDialogueDone:true,hazardStage:'complete',jamesCarQuoteShown:true,supplyDialogueDone:true,suppliesPlanKnown:true,ferryDialogueDone:true,ferryPlanKnown:true,bedBuilt:true,bedRested:true,dreamDone:true,betrayalStage:'complete',ferryEscaped:true,jamesGone:true});NVAntarctica.grantWakeInventory(erisPreview);NVAfrica.arrive(erisPreview);erisPreview.africaStage='complete';erisPreview.friendQuest='recruited';erisPreview.friendDialogueDone=true;erisPreview.spaceshipFound=true;erisPreview.space=NVSpace.fresh();erisPreview.space.body='eris';NVSpace.touchDown(erisPreview);erisPreview.eris=NVEris.fresh();erisPreview.inventory.scrap=20;erisPreview.inventory.fabric=20;"""
views={'citadel':"erisPreview.x=0;erisPreview.z=-25;erisPreview.cameraYaw=0;erisPreview.cameraPitch=.22;",'queen':"erisPreview.x=0;erisPreview.z=43;erisPreview.friend={x:5,z:42,yaw:Math.PI};",'assistant':"erisPreview.eris.travel=400;erisPreview.x=9;erisPreview.z=36;",'conquest':"erisPreview.eris.clock=1799;erisPreview.x=0;erisPreview.z=25;",'base':"erisPreview.space.body='mars';NVSpace.touchDown(erisPreview);erisPreview.x=15;erisPreview.z=0;",'earth':"erisPreview.eris.travel=400;erisPreview.space.body='earth';erisPreview.space.phase='landed';erisPreview.space.geo={lat:-78,lon:20,global:true,altitude:0,heading:0,look:0};erisPreview.space.landingX=0;erisPreview.space.landingZ=0;erisPreview.x=32;erisPreview.z=NVEris.EARTH.z-3;",'cameo':"erisPreview.africaStarted=false;erisPreview.africaStage='unseen';erisPreview.ferryEscaped=false;erisPreview.jamesGone=false;erisPreview.betrayalStage='unseen';erisPreview.space=null;erisPreview.x=32;erisPreview.z=NVEris.EARTH.z-30;erisPreview.james={x:35,z:erisPreview.z-3,yaw:0};"}
for name,setup in views.items():
    code=base+setup+"savedGame=validCharacterSave({id:'temporary-eris-preview',wanderer:{...DEFAULT_WANDERER,name:'The Wanderer'},progress:{chapter:3,checkpoint:'eris-preview',antarctica:NVAntarctica.snapshot(erisPreview)}});savedWanderer=savedGame.wanderer;startAntarctica();soundtrack.setEnabled(false);"
    # Visible controls let browser QA test departure, arrival and long timers without hidden-state edits.
    code+="const qaBar=document.createElement('div');qaBar.style.cssText='position:fixed;top:55px;right:22px;z-index:100;display:flex;gap:4px';for(const [label,action] of [['QA: DEPART',()=>{polarState.eris.travel=300;updatePolarHUD();}],['QA: EARTH',()=>{polarState.eris.travel=400;updatePolarHUD();}],['QA: RETURN',()=>{polarState.eris.travel=0;updatePolarHUD();}],['QA: 30 MIN',()=>{NVEris.step(polarState,1800);updatePolarHUD();}]]){const button=document.createElement('button');button.className='polar-button';button.textContent=label;button.onclick=action;qaBar.append(button);}document.body.append(qaBar);"
    if name in ['citadel','queen']:code+='qaBar.remove();'
    at=html.rfind('</script>');(root/f'outputs/eris-{name}-qa.html').write_text(html[:at]+code+html[at:],encoding='utf-8')
print('Created seven temporary Eris QA fixtures without changing localStorage.')
