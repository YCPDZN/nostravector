// Story choices and the committed route belong to one character's world.
const NVCaraxEndings=(()=>{
 const ROUTES=['good','neutral','bad','bad-zark','bad-josiah','bad-tyrotaronus'];
 const fatal=r=>['bad','bad-zark','bad-josiah','bad-tyrotaronus'].includes(typeof r==='string'?r:r?.route);
 const TYROTARONUS_TAUNTS=[
  "You look relieved. You should have asked why I was so willing to guide you to my father.",
  "Yes. My father, Lord Zark. What you defeated here was only the beginning. You have not even reached the hands that arranged it.",
  "You knew me as the Vector of Neutrality. A comforting title. You heard neutrality and mistook it for mercy.",
  "We are the ancient ones. In the oldest fragments of your histories, you call us the Oilkoumeneus.",
  "We are puppet masters. We have been pulling strings long before you were even born, and you have spent this entire journey congratulating yourself for following them.",
  "Obra-Spira. Did you think that fortress world was merely another empty prize at the edge of Cyrannus? Its foundations remember who laid the first chains.",
  "A ruler needs a throne. We need only someone desperate enough to sit upon it. Your little empires have been most obliging.",
  "Every crossing, every warning, every invitation. I never needed to force your hand. I only had to make the next door look like your idea.",
  "Look upon my brother, Tyromairon’as. You would have called him a monster before you learned how easily he could make a monster look like a friend.",
  "He has worn more faces than your civilizations have raised flags. A veil, a crown, an offered hand. The same will moves beneath them.",
  "Now you see him without the courtesy of concealment. Tyromairon’as does not command the puppets from their stage. He builds the stage around them.",
  "And Tyronihlus, my other brother. Green and red upon his armour, patience behind his eyes. He does not need to hurry when the trapped are already walking towards him.",
  "That is Steca. Blue earth and red water, beneath the shadow of Obsidnia. The goliath titan conquered it in an age your maps have forgotten. Obsidnia’s empire left wounds that paradise could only cover.",
  "Arjaximon understands what your coalition never did. Isolation can be a curtain. Behind it, an ancient appetite has all the time it needs.",
  "My father taught you to fear a thing that could tear down a fortress. I am going to teach you to fear the hand that makes you open its gates.",
  "DO YOU FEEL IT? THAT DARKNESS UNDER YOUR ARMOUR IS NOT A WOUND YOUR LITTLE RIFLE CAN CLOSE!",
  "I LET YOU CARRY ME ACROSS THE STARS! I LISTENED WHILE YOU CALLED IT TRUST! NOW HOLD STILL AND LEARN WHAT THAT TRUST HAS BOUGHT YOU!",
  "YOUR SHIPS CANNOT SHOOT A COMMAND OUT OF YOUR BLOOD! YOUR GOVERNORS CANNOT BUILD YOU ANOTHER BREATH! EVERY STRING YOU FOLLOWED HAS LED HERE!",
  "LOOK AT ME, WANDERER! LORD ZARK WAS THE BEGINNING! THE OILKOUMENEUS WERE HERE BEFORE YOUR FIRST EMPIRE, AND WE WILL BE HERE WHEN ITS LAST LIGHT DIES!",
  "NO MORE DOORS! NO MORE JOURNEYS! I CLOSE MY HAND, AND YOUR PART IN THIS UNIVERSE IS OVER!"
];
 const JOSIAH_TAUNTS=[
  'There you are. I was beginning to wonder whether you would leave anyone alive to enjoy this with me.',
  'I have unmade reality before. The interesting part is how long people continue to believe it can be repaired.',
  'This is the 2ND TIME this has happened. The first time, I let them beg. I think I preferred the silence.',
  'This timeline had a Josiah Richards of its own. An ordinary man. No powers. Such a modest little existence.',
  'He died in 2047. You have been travelling with someone else entirely.',
  'You watched what these golden chains did to your enemies, and never once wondered how they would feel around you.',
  "Don't pull against them. I can tighten one link at a time. There is no need to spoil the last few moments.",
  'Did you think I was standing over there? Look again. I do like the moment your eyes stop keeping up.',
  'A whole universe outside, and here you are, waiting for permission to take another breath.',
  "There. Nothing left to hold together. Let's see what survives when I let go."
 ];
 const ZARK_TAUNTS=[
  'SO YOU WENT BACK AND KILLED MASCAR. DID YOU EXPECT THE UNIVERSE TO APPLAUD?',
  'YOU MISTOOK MY FALL FOR DEFEAT. COME CLOSER. LET ME CORRECT YOU!',
  'ARCHAMUS GATHERED AN ENTIRE COALITION, AND THIS IS THE CHAMPION HE SENT ME?',
  'THAT ARMOUR HAS CARRIED YOU ACROSS GALAXIES. LISTEN TO IT BREAK!',
  'YOU CANNOT MURDER YOUR WAY BACK TO THE PEOPLE YOU ABANDONED!',
  'LOOK AT YOUR FLEETS! ALL THOSE GUNS, AND NOT ONE OF THEM CAN REACH YOU!',
  'STRUGGLE, WANDERER! MAKE YOUR LAST MOMENTS WORTH MY ATTENTION!',
  'MY BROTHER WILL REMEMBER THIS. EVERY WORLD HE SAVED WILL HEAR HOW YOU FELL!',
  'KEEP REACHING FOR THAT WEAPON. I WANT YOU TO UNDERSTAND HOW LITTLE IT MATTERS!',
  'NO SHIP. NO ESCAPE. NO NEXT GALAXY. YOUR JOURNEY ENDS IN MY HANDS!'
 ];
 const ORION_TAUNTS=[
  'ON YOUR KNEES! YOU DO NOT WALK AWAY FROM ME!',
  'LOOK AT ME! LOOK AT THE FATHER YOU LEFT BEHIND!',
  'YOU TOOK MY SON, THEN EXPECTED THE STARS TO FORGET!',
  'WHERE IS YOUR COALITION NOW? WHERE ARE YOUR GODS?',
  'KEEP REACHING! THEY ARE NOT COMING!',
  'I HELD HIM WHEN HE WAS SMALL ENOUGH TO FIT IN THESE HANDS!',
  'NOW ALL I HAVE LEFT IS YOU, AND YOU ARE NOT LEAVING!',
  'YOU SAVED THE UNIVERSE? YOU COULD NOT EVEN SAVE YOURSELF!',
  'NO MORE VICTORIES! NO MORE SECOND CHANCES!',
  'THIS IS FOR CROXIAN! YOU DO NOT GET TO GO HOME!'
 ];
 const WARNINGS={good:NVCatharsisFinal.WARNING,
  neutral:"PATH OF NO RETURN: THE COALITION HAS REACHED SAGITTARIUS A*, BUT THE ROAD HERE HAS LEFT SCARS. THERE IS STILL A CHANCE TO END THIS. ARE YOU READY TO FACE THE CATHARSIS, OR WILL YOU RETURN WHEN YOU'RE PREPARED?",
  bad:"PATH OF NO RETURN: ORION MASCAR IS STILL LINGERING IN THE MILKY WAY. DEALING WITH THE ARMED MADMAN YOU LEFT BEHIND WOULD BE WISE BEFORE HEADING TO SAGITTARIUS A*. BUT SURE, CHARGE INTO THE GALACTIC CORE WITH YOUR UNFINISHED BUSINESS. THAT HAS ALWAYS WORKED OUT BRILLIANTLY, HASN'T IT?",
  'bad-zark':"PATH OF NO RETURN: OH, BRILLIANT. YOU WENT BACK AND KILLED ORION MASCAR. THAT MUST MAKE EVERYTHING FINE NOW. ALL THOSE ABANDONED PEOPLE AND DEAD COMPANIONS? CLEARLY JUST A FEW BOXES YOU FORGOT TO TICK. GO ON, THEN. MARCH INTO SAGITTARIUS A* LIKE YOU HAVE FINALLY LEARNED SOMETHING. GOOD LUCK, YOU'RE GOING TO NEED IT :)",
  'bad-josiah':'PATH OF NO RETURN: BE CAREFUL AROUND THE ONES YOU TRUST.',
  'bad-tyrotaronus':'PATH OF NO RETURN: BE CAREFUL AROUND THE ONES YOU TRUST.'};
 const GOOD_INTRO=[
  [
    "LORD ZARK",
    "I HAVE BROKEN YOUR FLEETS! I HAVE TORN OPEN YOUR SKY! LOOK AT ME, WANDERER! EVEN NOW, I AM COMING FOR YOU!"
  ],
  [
    "JAMES BROWN",
    "ZARK! YOU THINK EVERY LIFE IS YOURS TO TAKE? THEN COME THROUGH ME! I WILL TEAR THAT GRIN OFF YOUR FACE!"
  ],
  [
    "CROXIAN MASCAR",
    "YOU DO NOT GET TO BURY MY FAMILY, ZARK! NOT TODAY! ALL THREE BLADES ARE COMING STRAIGHT FOR YOU!"
  ],
  [
    "MALIA DE TORO",
    "LOOK AT ME, YOU COWARD! ALL THAT POWER, AND YOU STILL HAVE TO PREY ON THE WEAK! I AM GOING TO PUT YOU DOWN!"
  ],
  [
    "ORION MASCAR",
    "YOU REACHED FOR MY FAMILY, ZARK! NOW YOU ANSWER TO ME! BOTH BARRELS! RIGHT THROUGH YOUR ROTTEN HEART!"
  ],
  [
    "NYREXIA ERISCONOS",
    "YOU HAVE TAKEN ENOUGH FROM THESE WORLDS! EVERY LIFE YOU TRIED TO EXTINGUISH STANDS AGAINST YOU! FREEZE AND SHATTER, ZARK!"
  ],
  [
    "JOSIAH WILLIAMS II",
    "I AM DONE BEING AFRAID OF MONSTERS LIKE YOU! YOU WANT US ON OUR KNEES? THEN COME AND MAKE ME, ZARK!"
  ],
  [
    "TYROTARONUS",
    "YOU CALL THIS YOUR UNIVERSE? IT WAS NEVER YOURS TO BREAK! YOUR CRUELTY ENDS HERE, ZARK! NOW FACE THE BALANCE YOU DEFIED!"
  ]
];
 const LINES={
 good:[...GOOD_INTRO,['LORD ZARK','IMPOSSIBLE! I WATCHED YOUR EMPIRES BREAK! HOW ARE YOU STILL STANDING?!'],['ARCHAMUS','You spared lives when revenge would have been easier. Those choices brought them here. Look at what they have helped you save.'],['THE COALITION','Across Carax, the allied banners rise. Orion, Nyrexia, James, Malia and Croxian answer the recall. The Catharsis signal falls silent as Zark collapses beneath the closing rift.'],['ARCHAMUS','The Milky Way has a future again. Beyond it, Andromeda is waiting. This time, you do not have to face the unknown alone.']],
 neutral:[['LORD ZARK','YOU CALL THIS VICTORY? COUNT THE EMPTY PLACES BESIDE YOU!'],['ARCHAMUS','Zark is defeated. That matters. So do the people who will never see the worlds you saved. Neither truth erases the other.'],['THE COALITION','The rift seals over Carax. The surviving crews gather beneath torn banners, and the dead remain beyond the reach of another victory.'],['ARCHAMUS','Take time to rebuild. When you are ready, there is another galaxy beyond this one. Andromeda may offer a new beginning.']],
 bad:[['LORD ZARK','THEN TAKE YOUR VICTORY, WANDERER. SEE HOW LONG IT KEEPS YOU WARM.'],['THE WANDERER','The rift closes. For a moment, the battlefield is quiet. You lower your weapon and turn towards the waiting ships.'],['ORION MASCAR','YOU HAD TIME FOR ANOTHER GOD. ANOTHER GRAND VICTORY. YOU NEVER HAD TIME TO FINISH THINGS WITH ME.'],['ORION MASCAR','CROXIAN DOES NOT GET TO GO HOME. NEITHER DO YOU.'],...ORION_TAUNTS.map(line=>['ORION MASCAR',line]),['','Your hands lose their grip. The last light disappears.']]};
 LINES['bad-zark']=[...ZARK_TAUNTS.map(line=>['LORD ZARK',line]),['','The fortress falls silent. Your weapon slips away. There is no light left.']];
 LINES['bad-josiah']=[LINES.bad[0],['THE WANDERER','The rift closes. A familiar figure walks out of the settling dust. For a moment, you think you are safe.'],...JOSIAH_TAUNTS.map(line=>['JOSIAH RICHARDS',line]),['','The golden chains fall slack. There is no one left to answer.']];
 LINES['bad-tyrotaronus']=[LINES.bad[0],...TYROTARONUS_TAUNTS.map(line=>['TYROTARONUS',line]),['','The dark threads release you. Your body falls against the stone. There is no breath left to answer.']];
 const TYROTARONUS_LAST=LINES['bad-tyrotaronus'].length-1;
 const BAD_LAST=LINES.bad.length-1,ZARK_LAST=LINES['bad-zark'].length-1,JOSIAH_LAST=LINES['bad-josiah'].length-1;
 const smooth=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x);},mix=(a,b,t)=>a+(b-a)*t;
 function badBeat(q){
  const t=Math.max(0,q.time||0),shot=q.shot,impact=smooth((t-.65)/1.25),lift=smooth((t-.4)/2.8),choking=shot>=6&&shot<BAD_LAST;
  const pressure=choking?Math.min(.86,.15+(shot-6)*.092+t*.009):shot===BAD_LAST?.86+.14*smooth(t/4):0;
  let phase='approach',eye=[0,1.62,2.6],target=[0,1.8,0],roll=0,orionZ=shot===2?mix(-2,.15,smooth(t/5)):.15,grip=0,blur=0,blackout=0,struggle=0;
  if(shot===4){phase='knockdown';eye=[.08*impact,mix(1.62,.24,impact),mix(2.6,3.15,impact)];target=[0,2.05,1.5];roll=-.26*impact;orionZ=mix(.15,1.8,smooth((t-.35)/1.5));blur=2.2*Math.sin(Math.PI*impact);}
  if(shot===5){phase='lift';eye=[mix(.08,0,lift),mix(.24,2.12,lift),mix(3.15,3.05,lift)];target=[0,1.94,1.8];roll=mix(-.26,.035,lift);orionZ=1.8;grip=smooth(t/.6);blur=.5+lift;struggle=lift;}
  if(choking||shot===BAD_LAST){phase=shot===BAD_LAST?'blackout':'strangle';const alive=shot===BAD_LAST?1-smooth(t/3.5):1;eye=[Math.sin(t*3.3+shot)*.014*alive,2.12+Math.sin(t*4.2)*.012*alive,3.05];target=[0,1.94,1.8];roll=.035+Math.sin(t*2.1)*.015*alive;orionZ=1.8;grip=1;blur=1.5+pressure*5;struggle=alive*(1-pressure*.75);blackout=shot===BAD_LAST?.44+.56*smooth((t-.4)/4.8):smooth((shot-10+t/6)/5)*.44;}
  return{phase,eye,target,roll,orionZ,grip,blur,blackout,pressure,struggle,impact:shot===4?Math.exp(-Math.abs(t-1.35)*9):0,firstPerson:shot>0,terminal:shot===BAD_LAST&&t>=6.8};
 }
 function zarkBeat(q){
  const t=Math.max(0,q.time||0),shot=q.shot,k=smooth((t-.55)/1.1),rise=smooth((t-.4)/2.2),last=shot===ZARK_LAST;
  let phase='rise',eye=[0,1.65,5.2],target=[0,3.5,-1],roll=0,zarkZ=-1,zarkY=0,pitch=0,grip=0,strike=0,impact=0,struggle=0;
  if(shot===0){zarkY=-.8*(1-rise);pitch=1.05*(1-rise);}
  if(shot===1){phase='wing-strike';eye=[.28*k,mix(1.65,.3,k),mix(5.2,6.1,k)];target=[0,3.6,-.4];roll=-.28*k;strike=k;impact=Math.exp(-Math.abs(t-1)*8);}
  if(shot===2){phase='pin';eye=[.28,.3,6.1];target=[0,3.4,3];roll=-.28;zarkZ=mix(-1,3.3,rise);pitch=.28*rise;grip=rise;}
  if(shot>=3&&shot<=8){phase=shot===3?'lift':shot===4?'claw-strike':shot===8?'fatal-strike':'suspended';const lift=shot===3?rise:1;eye=[mix(.28,0,lift),mix(.3,3.1,lift),mix(6.1,5.6,lift)];target=[0,3.5,3.3];roll=mix(-.28,.03,lift);zarkZ=3.3;grip=1;struggle=1-(shot-3)*.105;
   if(shot===4||shot===8){strike=Math.sin(Math.PI*k);impact=Math.exp(-Math.abs(t-1)*8);eye[0]+=.16*impact;roll+=.1*impact;}
  }
  if(shot===9||last){phase=last?'blackout':'ground-slam';const fall=last?1:k;eye=[.1,mix(3.1,.18,fall),mix(5.6,6.3,fall)];target=[0,3.7,3.3];roll=mix(.03,-.34,fall);zarkZ=3.3;grip=1-fall;strike=1-fall;impact=last?0:Math.exp(-Math.abs(t-1)*8);}
  const pressure=shot<3?0:Math.min(1,.12+(shot-3)*.125),blackout=last?.72+.28*smooth(t/5):shot===9?.35+.37*k:Math.max(0,shot-5)*.08;
  return{phase,eye,target,roll,zarkZ,zarkY,pitch,grip,strike,impact,struggle,pressure,blur:shot===0?0:.4+pressure*4+impact*1.8,blackout,firstPerson:shot>0,terminal:last&&t>=6.8};
 }
 // Root travel and gait share distance, so he walks only while changing position.
 const josiahStops=[[1.45,-.7],[.8,.25],[.45,1.25],[0,1.95],[0,1.95],[-.15,2.15],[-.15,2.15],[-.15,2.15],[-.15,2.15],[.15,2.15],[.15,2.15],[.15,2.15],[.15,2.15]];
 const josiahDurations=Array(13).fill(9);josiahDurations[1]=5;
 function setJosiahDurations(rows){for(const r of rows){if(r.route==='bad-josiah'||r.route==='bad'&&r.shot===0)josiahDurations[r.shot]=r.duration+.7;}}
 function josiahMotion(q){
  const shot=Math.max(0,Math.min(12,q.shot)),t=Math.max(0,q.time||0),a=josiahStops[Math.max(0,shot-1)],b=josiahStops[shot],dx=b[0]-a[0],dz=b[1]-a[1],distance=Math.hypot(dx,dz),travelTime=distance/.62+.6,start=.65,u=Math.max(0,Math.min(1,(t-start)/travelTime)),travel=u*u*u*(10+u*(-15+6*u)),moving=distance>.001&&u>0&&u<1;
  const pos=[mix(a[0],b[0],travel),0,mix(a[1],b[1],travel)],face=p=>Math.atan2(-p[0],4.5-p[1]),turn=(a,b,k)=>a+Math.atan2(Math.sin(b-a),Math.cos(b-a))*smooth(k),heading=Math.atan2(dx,dz);
  let yaw=face(b);if(distance>.001){yaw=t<start?turn(face(a),heading,t/start):t<start+travelTime?heading:turn(heading,face(b),(t-start-travelTime)/.65);}
  let previousSteps=0,clock=t;for(let i=0;i<shot;i++){clock+=josiahDurations[i];if(i>0){const d=Math.hypot(josiahStops[i][0]-josiahStops[i-1][0],josiahStops[i][1]-josiahStops[i-1][1]);if(d>.001)previousSteps+=Math.max(1,Math.round(d/.48));}}
  const steps=distance>.001?Math.max(1,Math.round(distance/.48)):0,speed=moving?distance*30*u*u*(1-u)*(1-u)/travelTime:0;
  return{position:pos,yaw,speed,gaitPhase:(previousSteps+steps*travel)*Math.PI,clock,settledAt:distance>.001?start+travelTime+.65:0};
 }
 function josiahBeat(q){
  const shot=q.shot,t=Math.max(0,q.time||0),k=smooth(t/3),last=shot===JOSIAH_LAST,bind=shot<7?0:shot===7?smooth((t-.4)/2):1,motion=josiahMotion(q),pos=motion.position;
  const phase=shot<2?'quiet':shot<7?'circle':shot===7?'golden-bind':shot===8?'suspend':shot===9?'false-step':shot===10?'tighten':shot===11?'unravel':'blackout';
  const lift=shot===8?smooth(t/2.8):shot>8?1:0,pressure=shot<7?0:Math.min(1,.15+(shot-7)*.17),blackout=last?.72+.28*smooth(t/5):shot===11?.42+.30*k:shot===10?.15+.2*k:0;
  const eye=[0,1.65+lift*.65,4.5],target=[pos[0]*.35,1.55,pos[2]],roll=bind*.04*Math.sin(t*.55);
  return{phase,eye,target,roll,josiahPosition:pos,motion,bind,grip:bind,pressure,blackout,blur:pressure*3.4,strike:0,impact:0,struggle:bind*(1-pressure),firstPerson:shot>=2,terminal:last&&t>=6.8};
 }
 function tyrotaronusBeat(q){
  const shot=q.shot,t=Math.max(0,q.time||0),last=shot===TYROTARONUS_LAST,k=smooth(t/3),vision=({6:'obra-spira',9:'veiled',10:'unsealed',11:'puppetMaster',12:'tyronihlus',13:'steca',14:'arjaximon'})[shot]||'';
  const bind=shot<15?0:shot===15?smooth((t-.5)/3):1,lift=shot<16?0:shot===16?smooth(t/3):1,crush=shot<18?0:shot===18?k:1,fall=last?1:shot===20?smooth((t-2)/3):0;
  const pressure=last?1:shot<15?0:Math.min(.92,.1+(shot-15)*.15),blackout=last?.68+.32*smooth(t/5):shot===20?.42+.26*smooth((t-2)/3):shot===19?.2+.22*k:0;
  return{phase:vision?'vision':last?'blackout':shot===20?'collapse':shot===19?'rupture':shot>=18?'crush':shot>=16?'levitate':shot===15?'dark-bind':'reveal',vision,eye:[Math.sin(t*2)*.006*bind, mix(1.65,2.5,lift)*(1-fall)+.2*fall,5.5+.25*fall],target:[0,1.95,1.8],roll:bind*.025+fall*.28,tyrotaronusPosition:[0,0,1.8],bind,lift,crush,grip:bind,strike:0,impact:shot===19?Math.exp(-Math.abs(t-1.4)*6)*.25:0,struggle:bind*(1-pressure),pressure,blackout,blur:pressure*3.4,firstPerson:shot>0&&!vision,terminal:last&&t>=6.8};
 }
 const deathBeat=q=>q.route==='bad-tyrotaronus'?tyrotaronusBeat(q):q.route==='bad-josiah'?josiahBeat(q):q.route==='bad-zark'?zarkBeat(q):badBeat(q);
 const minimumTime=q=>q.route==='bad-tyrotaronus'?(q.shot===TYROTARONUS_LAST?6.8:q.shot>=15?5:2):q.route==='bad-josiah'?(q.shot===JOSIAH_LAST?6.8:Math.max(q.shot>=7?3:0,josiahMotion(q).settledAt)):q.route==='bad-zark'?(q.shot===ZARK_LAST?6.8:q.shot<=4||q.shot>=8?3:0):q.route!=='bad'?0:q.shot===4?2.5:q.shot===5?3.3:q.shot===BAD_LAST?6.8:0;
 const duration=q=>q.route==='bad-tyrotaronus'?(q.shot===TYROTARONUS_LAST?6.8:Math.max(8.5,LINES[q.route][q.shot][1].length/13)):q.route==='bad-josiah'?(q.shot===JOSIAH_LAST?6.8:q.shot===1?5:Math.max(8.5,LINES[q.route][q.shot][1].length/13)):q.route==='bad-zark'?(q.shot===ZARK_LAST?6.8:8.5):q.route==='bad'&&q.shot>=4?(q.shot===BAD_LAST?6.8:[5.4,5.6,5.1,5.1,4.3,6.2,5.6,5.4,4.6,5.5][q.shot-4]):8.5;
 const fresh=()=>({route:'',stage:'waiting',shot:0,time:0,voiceTime:0,saveId:'',betrayerId:'',history:{},andromeda:'',goodVersion:3,nightmareDefeat:false,beam:null});
 function restore(r){const q=fresh();if(!r)return q;q.route=ROUTES.includes(r.route)?r.route:'';q.stage=['waiting','cinematic','offer','done','gameover'].includes(r.stage)?r.stage:'waiting';q.shot=Math.max(0,Math.min((LINES[q.route]?.length||1)-1,Math.floor(Number(r.shot)||0)));if(q.route==='good'&&r.goodVersion!==3&&['cinematic','offer','done'].includes(q.stage)){if(r.goodVersion===2)q.shot=Math.floor(Number(r.shot)||0)>=9?Math.min(LINES.good.length-1,Math.floor(r.shot)-1):Math.min(7,q.shot);else q.shot=GOOD_INTRO.length+Math.max(0,Math.min(3,Math.floor(Number(r.shot)||0)));}q.beam=typeof NVBeamStruggle!=='undefined'?NVBeamStruggle.restore(r.beam):null;q.time=Math.max(0,Math.min(600,Number(r.time)||0));q.voiceTime=Math.max(0,Math.min(600,Number(r.voiceTime)||0));q.saveId=typeof r.saveId==='string'?r.saveId:'';q.betrayerId=/^custom-\d+$/.test(r.betrayerId)?r.betrayerId:'';q.andromeda=['interested','later'].includes(r.andromeda)?r.andromeda:'';q.nightmareDefeat=r.nightmareDefeat===true||fatal(q)&&r.beam?.stage==='complete'&&r.beam?.failures>0;if(q.nightmareDefeat&&fatal(q)&&q.stage==='cinematic'&&q.shot===0){q.shot=1;q.time=0;q.voiceTime=0;}for(const k of ['orionChapter2','nyrexiaBeforeCoup','badWarningSeen'])if(typeof r.history?.[k]==='boolean')q.history[k]=r.history[k];return q;}
 const ensure=s=>{const q=NVCatharsisRoute.ensure(s);return q.ending||(q.ending=fresh());};
 function tyrotaronusBetrayer(s){const e=s?.eris,g=e?.governance,candidates=typeof NVCustomCrew!=='undefined'?NVCustomCrew.followers(s):e?.customCrew?.characters;return candidates?.find(n=>n.status==='crew'&&n.model?.id==='glb-story-tyrotaronus'&&g?.roles?.[n.id]!=='ship'&&!e?.crewDiplomacy?.assignments?.[n.id]&&!Object.values(g?.colonies||{}).some(c=>!c.captured&&[c.governor,...(c.extraGovernors||[])].includes(n.id)))||null;}
 function betrayer(s){const e=s?.eris,g=e?.governance,candidates=typeof NVCustomCrew!=='undefined'?NVCustomCrew.followers(s):e?.customCrew?.characters;return candidates?.find(n=>n.status==='crew'&&n.model?.id==='glb-project-bc-josiah-richards'&&g?.roles?.[n.id]!=='ship'&&!e?.crewDiplomacy?.assignments?.[n.id]&&!Object.values(g?.colonies||{}).some(c=>!c.captured&&[c.governor,...(c.extraGovernors||[])].includes(n.id)))||null;}
 function choices(s){const e=ensure(s),reset=s.eris?.siegeOfSol?.restartChoices,v=s.eris?.vengefulMascar,c=s.eris?.solWar?.solFall?.expedition?.blockade?.siege?.commanders?.resolution?.choices||{};
  return{orion:e.history.orionChapter2??reset?.orion??s.friendQuest==='recruited',nyrexia:e.history.nyrexiaBeforeCoup??reset?.nyrexia??s.eris?.nyrexia?.recruited===true,james:s.eris?.solWar?.brownStory?.resolution?.outcome||'',malia:c.malia||'',croxian:c.croxian||'',orionDead:v?.stage==='complete',orionHostile:!!v&&v.stage!=='complete'&&['speech','hunt'].includes(v.stage)&&v.enemy?.hp>0};
 }
 function evaluate(s){const c=choices(s);if(c.orion&&c.nyrexia&&c.james==='spare'&&c.malia==='spare'&&c.croxian==='spare')return'good';if(!c.nyrexia&&c.james==='kill'&&c.malia==='kill'&&c.croxian==='kill'){if(c.orionDead)return betrayer(s)?'bad-josiah':tyrotaronusBetrayer(s)?'bad-tyrotaronus':'bad-zark';if(c.orionHostile)return'bad';}return'neutral';}
 const route=s=>{const q=ensure(s);if(q.route==='neutral'&&q.stage==='waiting'&&s.eris?.catharsisCoreRoute?.finalStage!=='complete'){const next=evaluate(s);if(['bad-zark','bad-josiah','bad-tyrotaronus'].includes(next))q.route=next;}return q.route||evaluate(s);};
 function commit(s){const q=ensure(s);q.route=route(s);if(q.route==='bad-josiah'&&!q.betrayerId)q.betrayerId=betrayer(s)?.id||'';if(q.route==='bad-tyrotaronus'&&!q.betrayerId)q.betrayerId=tyrotaronusBetrayer(s)?.id||'';return q.route;}
 const revenant=s=>route(s)==='neutral'&&choices(s).croxian==='kill'&&choices(s).orionDead;
 function begin(s,id=''){const q=ensure(s);if(q.stage!=='waiting')return false;commit(s);q.stage='cinematic';q.shot=0;q.time=0;q.voiceTime=0;q.saveId=id;NVCatharsisRoute.ensure(s).finalStage='ending';return true;}
 function advance(s){const q=ensure(s);if(q.stage!=='cinematic')return false;q.time=0;q.voiceTime=0;if(q.shot<LINES[q.route].length-1)q.shot++;else{q.stage=fatal(q)?'gameover':'offer';}return true;}
 return{GOOD_INTRO,TYROTARONUS_TAUNTS,TYROTARONUS_LAST,tyrotaronusBeat,tyrotaronusBetrayer,ROUTES,WARNINGS,LINES,ORION_TAUNTS,ZARK_TAUNTS,JOSIAH_TAUNTS,BAD_LAST,ZARK_LAST,JOSIAH_LAST,badBeat,zarkBeat,josiahBeat,josiahMotion,setJosiahDurations,deathBeat,fatal,betrayer,minimumTime,duration,fresh,restore,ensure,choices,evaluate,route,commit,revenant,begin,advance};
})();
const endingRouteRestore=NVCatharsisRoute.restore;NVCatharsisRoute.restore=r=>({...endingRouteRestore(r),ending:NVCaraxEndings.restore(r?.ending)});
function recordEarlyOrion(s){const h=NVCaraxEndings.ensure(s).history;if(h.orionChapter2===undefined&&s.friendQuest==='recruited'&&(!s.space||s.space.phase==='off'&&s.space.visited.length===1))h.orionChapter2=true;}
const endingOrionRecruit=NVAfrica.recruit;NVAfrica.recruit=s=>{const ok=endingOrionRecruit(s);if(ok)recordEarlyOrion(s);return ok;};
const endingOrionDialogue=NVAfrica.advanceFriendDialogue;NVAfrica.advanceFriendDialogue=s=>{const ok=endingOrionDialogue(s);if(ok)recordEarlyOrion(s);return ok;};
const endingFirstLaunch=NVSpace.launch;NVSpace.launch=s=>{const first=s.space?.body==='earth'&&s.space.visited.length===1,ok=endingFirstLaunch(s);if(ok&&first){const h=NVCaraxEndings.ensure(s).history;if(h.orionChapter2===undefined)h.orionChapter2=s.friendQuest==='recruited';}return ok;};
const endingLateHire=hireShipCompanion;hireShipCompanion=id=>{const s=polarState,ok=endingLateHire(id);if(ok&&id==='orion'){const h=NVCaraxEndings.ensure(s).history;if(h.orionChapter2===undefined)h.orionChapter2=false;}return ok;};
const endingNyrexiaRecruit=NVErisFamily.recruit;NVErisFamily.recruit=s=>{const ok=endingNyrexiaRecruit(s);if(ok)NVCaraxEndings.ensure(s).history.nyrexiaBeforeCoup=true;return ok;};
const endingCheckpoints=NVStoryCheckpoints.progress;NVStoryCheckpoints.progress=(...args)=>{const p=endingCheckpoints(...args),s=NVAntarctica.restored(p,args[0].id),c=NVStoryCheckpoints.choices(args[2]);Object.assign(NVCaraxEndings.ensure(s).history,{orionChapter2:c.orion,nyrexiaBeforeCoup:c.nyrexia});return{...p,antarctica:NVAntarctica.snapshot(s)};};
