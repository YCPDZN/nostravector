const NVSolEpilogue=(()=>{
 const HAWTHORNE=[
  'NO... MY FLEETS. MY EMPIRE. I GAVE HUMANITY A FUTURE, AND YOU HAVE TORN IT FROM ME.',
  'YOU THINK THEY WILL REMEMBER YOU AS THEIR SAVIOUR? THEY WILL FEAR THE NEXT WAR... AND THEY WILL WISH I WERE STILL HERE.',
  'DARIUS HID. VISHARA FLED. I STOOD AND FOUGHT! I WAS THE ONLY ONE STRONG ENOUGH TO HOLD SOL TOGETHER!',
  'I WILL NOT KNEEL TO YOU, WANDERER. NOT HERE. NOT AT THE END OF EVERYTHING I BUILT.',
  'I AM THOMAS HAWTHORNE... THE GRAND IMPERARCH... AND I WILL NOT LET THIS BE MY END.'
 ];
 const STRANGER=[
  'You have come far, Wanderer. Farther than most who heard my voice would have survived. You have earned this victory.',
  'Hawthorne believed Sol was the whole prize. There are powers beyond these stars that have only now begun to notice you.',
  'That was only the beginning.'
 ];
 const ensure=s=>NVSiegeOfSol.ensure(s).finale;
 const active=s=>!!s&&['hawthorne','execution','stranger'].includes(NVSiegeOfSol.raw(s)?.finale?.stage);
 function execute(s){const q=ensure(s);if(q.stage!=='execution'||q.executed)return false;q.executed=true;const war=NVSolWar.ensure(s);war.thomasAlive=false;war.thomasHp=0;NVSiegeOfSol.ensure(s).owners.mercury='HUMAN';return true;}
 function next(s){const q=ensure(s);if(q.stage==='hawthorne'){q.elapsed=0;q.voiceTime=0;if(q.line<4)q.line++;else{q.stage='execution';q.line=0;}return true;}
  if(q.stage!=='stranger')return false;q.elapsed=0;q.voiceTime=0;if(q.line<2)q.line++;else{q.stage='done';const siege=NVSiegeOfSol.ensure(s);siege.notice='HAWTHORNE HAS FALLEN / MERCURY LIBERATED';siege.noticeTime=12;NVSiegeOfSol.complete(s);NVQuests.update(s);}return true;
 }
 function tick(s,dt){if(!active(s)||!Number.isFinite(dt)||dt<=0)return;const q=ensure(s);q.elapsed+=Math.min(.1,dt);if(q.stage==='execution'){if(q.elapsed>=2.4)execute(s);if(q.elapsed>=4.5){q.stage='stranger';q.line=0;q.elapsed=0;q.voiceTime=0;}}}
 return{HAWTHORNE,STRANGER,ensure,active,execute,next,tick};
})();
