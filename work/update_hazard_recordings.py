from pathlib import Path
p=Path(__file__).resolve().parent
f=p/'antarctica_hazards.js';s=f.read_text(encoding='utf-8')
start=s.index('function stopHazardNarration()');end=s.index('function suitWarningBeep()')
s=s[:start]+s[end:]
s=s.replace("function pauseHazardNarration(on){if(hazardModalActive()&&window.speechSynthesis){if(on)window.speechSynthesis.pause();else window.speechSynthesis.resume();}}\n",'')
s=s.replace("polarState.hazardStage='lesson';polarState.hazardLessonIndex=0;","polarState.hazardVoiceTime=0;polarState.hazardStage='lesson';polarState.hazardLessonIndex=0;")
s=s.replace("else if(polarState.hazardLessonIndex<4)polarState.hazardLessonIndex++;","else if(polarState.hazardLessonIndex<4){polarState.hazardVoiceTime=0;polarState.hazardLessonIndex++;}")
s=s.replace("polarState.hazardStage='complete';stopHazardNarration();","polarState.hazardStage='complete';polarState.hazardVoiceTime=0;stopHazardNarration();")
s=s.replace("$('#hazardNarration').onclick=()=>{hazardTutorial.voiceOn", "$('#hazardNarration').onclick=()=>{captureHazardVoice();hazardTutorial.voiceOn")
f.write_text(s,encoding='utf-8')
f=p/'antarctica.html';s=f.read_text(encoding='utf-8').replace('<button id="hazardNarration"','<button id="enableHazardVoice" class="polar-button" hidden>ENABLE AUDIO</button><button id="hazardNarration"');f.write_text(s,encoding='utf-8')
f=p/'antarctica_core.js';s=f.read_text(encoding='utf-8').replace("hazardStage:'unseen',hazardLessonIndex:0,","hazardStage:'unseen',hazardLessonIndex:0,hazardVoiceTime:0,").replace("numeric('hazardLessonIndex',0,4);","numeric('hazardVoiceTime',0,120);numeric('hazardLessonIndex',0,4);").replace("hazardStage:s.hazardStage,hazardLessonIndex:s.hazardLessonIndex,","hazardStage:s.hazardStage,hazardLessonIndex:s.hazardLessonIndex,hazardVoiceTime:s.hazardVoiceTime,");f.write_text(s,encoding='utf-8')
f=p/'antarctica_game.js';s=f.read_text(encoding='utf-8').replace('return;captureJamesVoice();const result=','return;captureJamesVoice();captureHazardVoice();const result=');f.write_text(s,encoding='utf-8')
f=p/'package_menu.py';s=f.read_text(encoding='utf-8').replace("==21","==27").replace("sources+=['hazard_script.txt','hazard.css']","sources+=['hazard_script.txt','hazard.css','antarctica_hazard_voice.js','hazard_audio.json','import_hazard_audio.py']").replace("    z.write(out/'NOSTRAVECTOR_3D_Viewer.html'","    for clip in json.loads((work/'hazard_audio.json').read_text(encoding='utf-8')):z.write(work/clip['file'],'source/work/'+clip['file'])\n    z.write(out/'NOSTRAVECTOR_3D_Viewer.html'")
f.write_text(s,encoding='utf-8')
