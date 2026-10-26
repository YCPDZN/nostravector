from pathlib import Path
p=Path(__file__).resolve().parent
f=p/'test_antarctica_runtime.js';s=f.read_text(encoding='utf-8').replace('close(){},addEventListener(){}','close(){},value:.85,addEventListener(){}')
s=s.replace("vm.runInContext(profile+", "const hazardVoice=fs.readFileSync(root+'/antarctica_hazard_voice.js','utf8').replace('__HAZARD_VOICES__',JSON.stringify(JSON.parse(fs.readFileSync(root+'/hazard_audio.json','utf8')).map(q=>({...q,source:'data:audio/mpeg;base64,AA=='}))));\nvm.runInContext(profile+")
s=s.replace("fs.readFileSync(root+'/antarctica_hazards.js','utf8')", "hazardVoice+'\\n'+fs.readFileSync(root+'/antarctica_hazards.js','utf8')")
f.write_text(s,encoding='utf-8')
f=p/'test_antarctica_hazards.js';s=f.read_text(encoding='utf-8')
s=s.replace('setAttribute(){}','setAttribute(){},addEventListener(){}')
start=s.index('let speech=null');end=s.index('const ctx=')
s=s[:start]+'''let saves=0,failPlayback=false;
class AudioStub{constructor(){this.duration=20;this.currentTime=0;this.paused=true;this.ended=false;}play(){if(failPlayback)return Promise.reject(Error('Blocked'));this.paused=false;return Promise.resolve();}pause(){this.paused=true;}}
const voice=fs.readFileSync(__dirname+'/antarctica_hazard_voice.js','utf8').replace('__HAZARD_VOICES__',JSON.stringify(JSON.parse(fs.readFileSync(__dirname+'/hazard_audio.json','utf8')).map(q=>({...q,source:'data:audio/mpeg;base64,AA=='}))));
'''+s[end:]
s=s.replace("window:{speechSynthesis:synth},SpeechSynthesisUtterance:class{constructor(text){this.text=text;}}", "window:{speechSynthesis:{speak(){throw Error('Recorded hazards must not use system speech.');}}},Audio:AudioStub")
s=s.replace("+'\\n'+fs.readFileSync(__dirname+'/antarctica_hazards.js'", "+'\\n'+voice+'\\n'+fs.readFileSync(__dirname+'/antarctica_hazards.js'")
s=s.replace("assert.equal(speech.text,'WEATHER WARNING! SUPER BLIZZARD INCOMING!');", "assert.equal(run('hazardVoiceIndex'),0);assert.equal(el('#hazardVoiceStatus').textContent,'RECORDED VOICE / SUIT');")
s=s.replace("assert.equal(speech.text,run('HAZARD_LESSONS[0].text'));", "assert.equal(run('hazardVoiceIndex'),1);assert.equal(el('#hazardVoiceStatus').textContent,'RECORDED VOICE / NARRATOR1');")
s=s.replace("assert.equal(pauseCount,1);", "assert.equal(run('currentHazardVoice().paused'),true);")
s=s.replace("assert.equal(resumeCount,1);", "assert.equal(run('currentHazardVoice().paused'),false);")
s=s.replace("run('polarState=NVAntarctica.restored", "run('currentHazardVoice().currentTime=3.2;captureHazardVoice();stopHazardNarration();');\nrun('polarState=NVAntarctica.restored")
s=s.replace("'Continue resumes the saved lesson.');", "'Continue resumes the saved lesson.');assert.equal(run('hazardVoiceIndex'),3);assert.equal(run('currentHazardVoice().currentTime'),3.2,'Continue resumes the recorded playback position.');\nrun(\"$('#hazardNarration').onclick();\");assert.equal(run('currentHazardVoice().paused'),true);run(\"$('#hazardNarration').onclick();\");assert.equal(run('currentHazardVoice().currentTime'),3.2);")
s=s.replace('assert.ok(saves>=6);assert.ok(cancelCount>=6);', "assert.ok(saves>=6);assert.equal(run('hazardVoiceClips.every(a=>a.paused)'),true);\n(async()=>{run(\"polarState.hazardStage='warning';\");failPlayback=true;run('showHazardTutorial();');await Promise.resolve();await Promise.resolve();assert.equal(el('#enableHazardVoice').hidden,false);failPlayback=false;run('playHazardVoice();');await Promise.resolve();assert.equal(el('#enableHazardVoice').hidden,true);run('currentHazardVoice().onerror();');assert.equal(el('#hazardVoiceStatus').textContent,'RECORDING UNAVAILABLE / CAPTIONS ACTIVE');console.log('Passed: supplied hazard clip order, pause/seek, mute, autoplay recovery and caption fallback.');})().catch(e=>{console.error(e);process.exitCode=1;});")
f.write_text(s,encoding='utf-8')
f=p/'game_readme.txt';s=f.read_text(encoding='utf-8')
s=s.replace('21 embedded', '27 embedded').replace('21 supplied', '27 supplied')
s=s.replace('The suit warning and hazard narrator currently use optional temporary browser system voices, separate from the supplied James and prologue recordings.', 'SUIT.mp3 plays the incoming-blizzard warning; NARRATOR1.mp3 through NARRATOR5.mp3 play the five hazard lessons. These supplied recordings replace temporary system speech. Pausing stops playback; Continue resumes the saved lesson and recording position. ENABLE AUDIO recovers from browser autoplay restrictions. Captions remain visible if audio is muted or unavailable.')
s+='\nHAZARD RECORDINGS\nSUIT.mp3 plays the weather alert. NARRATOR1.mp3 through NARRATOR5.mp3 play the five survival lessons in order, with pause/resume, saved playback position and caption fallback. All six files are embedded for offline playback. Suit heat depletion currently shows a text emergency-recovery notice and returns both companions to shelter; there is no supplied spoken depletion alert.\n'
f.write_text(s,encoding='utf-8')
