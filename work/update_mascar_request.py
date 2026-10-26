from pathlib import Path
w=Path('work')
p=w/'mascar_rampage_core.js';s=p.read_text(encoding='utf-8');s=s.replace('HP=10000000','HP=3000000').replace('10,000,000 HP','3,000,000 HP').replace('%10;q.attack','%QUOTES.length;q.attack')
extra=[
'Croxian? CROXIAN! Answer me! I KNOW THE RADIO WORKS! I TORE OUT EVERYTHING ELSE!',
'Stop looking at me like that! I AM PERFECTLY CALM! THESE ARE CALM HANDS ON THE TRIGGERS!',
'I saved your seat, son. Nobody sits there. NOBODY! I WILL TEAR OUT EVERY SEAT IN THIS GALAXY!',
'HA! Another alarm! Turn it off! TURN THEM ALL OFF! I WANT TO HEAR MYSELF THINK!',
'You call this madness? I CALL IT FINALLY LISTENING TO THE ONLY VOICE THAT MATTERS! MINE!',
'I counted the stars for him once. Now I count the worlds that will scream your name!',
'No, no, no! You do not get to leave! I HAVEN’T FINISHED EXPLAINING WHAT YOU TOOK!',
'The cockpit is empty? THEN WHO KEEPS TELLING ME TO GO FASTER?!',
'I can still fix this! More power, more steel, one more world! SOMETHING HAS TO BE ENOUGH!',
'Don’t say his name! SAY HIS NAME! WHY WON’T ANY OF YOU SAY HIS NAME?!',
'Look at those little lights below us. They still have tomorrow. HOW DARE THEY!',
'I heard you laughing through the hull! Don’t deny it! EVEN THE STARS ARE LAUGHING!',
'I AM NOT RUNNING OUT OF PLACES TO HIDE! I AM RUNNING OUT OF PLACES TO PUT MY RAGE!',
'Croxian would have loved this view. He would have— SHUT UP! SHUT UP AND KEEP THE ENGINES BURNING!',
'Every warning on this dashboard is red. GOOD! AT LAST, SOMETHING AGREES WITH ME!',
'You want the man I used to be? GO AND DIG HIM OUT OF THAT GRAVE YOU MADE!',
'Let the reactor split! Let the bolts come loose! I ONLY NEED THIS WRECK TO HOLD TOGETHER LONGER THAN YOU!',
'I rehearsed what I would say when I found you. HAHAHA! I FORGOT EVERY WORD EXCEPT YOUR NAME!',
'There is no throne waiting for me! No parade! JUST YOU, ME, AND ALL THIS ROOM TO BREAK!',
'WHY DOES IT STILL HURT?! I MADE MYSELF BIGGER THAN WORLDS! WHY IS THERE STILL ROOM FOR IT TO HURT?!'
]
needle="  'I’ll drag this wreck through every star you hide behind! THERE IS NO FAR ENOUGH!'"
s=s.replace(needle,needle+',\n'+',\n'.join('  '+repr(q) for q in extra))
s=s.replace("function capture(s){const q=ensure(s);if(!active(s)||q.stage!=='active')return[];", "const playerPresent=s=>ensure(s).system===NVGalaxy.system(s);\n function capture(s){const q=ensure(s);if(!active(s)||q.stage!=='active'||playerPresent(s))return[];")
s=s.replace('q.capture+=dt;if(q.capture>=CAPTURE_SECONDS){q.capture-=CAPTURE_SECONDS;capture(s);}', 'if(playerPresent(s))q.capture=0;else{q.capture+=dt;if(q.capture>=CAPTURE_SECONDS){q.capture-=CAPTURE_SECONDS;capture(s);}}')
s=s.replace('worlds,capture,move,step','worlds,playerPresent,capture,move,step');p.write_text(s,encoding='utf-8')
for name in ['vengeful_mascar_core.js','mascar_rampage_game.js','build_menu.py']:
 p=w/name;s=p.read_text(encoding='utf-8').replace('10000000','3000000').replace('10,000,000 HP','3,000,000 HP');p.write_text(s,encoding='utf-8')
p=w/'orion_empire.js';s=p.read_text(encoding='utf-8');s=s.replace('function capture(s,id){const q=ensure(s);','function capture(s,id){const v=s.eris?.vengefulMascar;if(v?.form===3&&v.rampage?.system===NVGalaxy.system(s))return false;const q=ensure(s);');p.write_text(s,encoding='utf-8')
p=w/'orion_boss_recordings.js';s=p.read_text(encoding='utf-8').replace('v.phase===2?14:9','v.phase===2?14:v.phase===3?NVMascarRampage.QUOTES.length-1:9');s=s.replace('const r=state.current;if(!r)return;',"const r=state.current;if(!r){for(const button of document.querySelectorAll('.orion-boss-voice'))button.textContent='CAPTIONS / UNRECORDED';return;}");p.write_text(s,encoding='utf-8')
