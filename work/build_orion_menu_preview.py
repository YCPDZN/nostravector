from pathlib import Path
root=Path(__file__).resolve().parents[1]
html=(root/'outputs/NOSTRAVECTOR_Main_Menu.html').read_text(encoding='utf-8')
fixture="""const partyPreview=NVAntarctica.fresh(123);Object.assign(partyPreview,{jamesIntroductionDone:true,bedBuilt:true,bedRested:true,betrayalStage:'complete',ferryEscaped:true,jamesGone:true,africaStarted:true,africaStage:'complete',friendQuest:'recruited',friendDialogueDone:true});savedGame=validCharacterSave({id:'temporary-orion-menu-preview',wanderer:{...DEFAULT_WANDERER,name:'The Wanderer'},progress:{chapter:2,checkpoint:'africa-coast',antarctica:NVAntarctica.snapshot(partyPreview)}});savedWanderer=savedGame.wanderer;syncMenuWanderer();syncSavedGameMenu();setMotion(false);window.NVMenu?.setAngles(.05,1.5);"""
index=html.rfind('</script>');(root/'outputs/orion-menu-qa.html').write_text(html[:index]+fixture+html[index:],encoding='utf-8')
print('Built in-memory Orion menu preview; no user saves are changed.')
