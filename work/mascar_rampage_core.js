const NVMascarRampage=(()=>{
 const HP=3000000,ID=7900000,TRAVEL_SECONDS=30,CAPTURE_SECONDS=5,CUTSCENE_SECONDS=18;
 const QUOTES=[
  'What is it you want from me? MY SON IS DEAD! MY BODY IS BROKEN! WHY ARE YOU STILL HERE?!',
  'LOOK AT ME! You couldn’t leave one grieving man alone! NOW YOU GET TO FIGHT HIM IN THE SKY!',
  'Sol wasn’t big enough to bury this! HAHAHA! LET’S SEE HOW MUCH THE REST OF THE GALAXY CAN HOLD!',
  'Keep your borders! Draw them again! I’LL BE THROUGH THEM BEFORE THE INK IS DRY!',
  'They called this chassis unsalvageable! HA! SO AM I! AND YET HERE WE BOTH ARE!',
  'Croxian, look! Every world below us! I could give you— ... WHY ARE YOU MAKING ME DO THIS?!',
  'You brought a spaceship to kill one man?! HAHAHA! I’M FLATTERED!',
  'Tell your governors to look up! Tell your admirals to count their ships! TELL THEM I’M COMING!',
  'KEEP FIRING! I CAN STILL HEAR YOU! I CAN STILL SEE YOU! YOU HAVEN’T TAKEN ENOUGH FROM ME YET!',
  'I’ll drag this wreck through every star you hide behind! THERE IS NO FAR ENOUGH!',
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
 ];
 const DEFEAT='Croxian...? I can’t hear the engines anymore. ... Is it quiet where you are?';
 const fresh=()=>({stage:'waiting',elapsed:0,system:'sol',body:'earth',position:[0,0,0],route:[],index:0,travel:0,capture:0,clock:0,quote:0,quoteTime:9,attackTime:0,attack:'roaming',aim:[0,0,0],beam:0,defeatTime:0,deathVoiceHeard:false,tracked:false,visited:[],musicTime:0});
 const vector=v=>Array.isArray(v)&&v.length===3&&v.every(n=>Number.isFinite(n)&&Math.abs(n)<2e6);
 function restore(r){const q=fresh();if(!r)return q;q.stage=['waiting','cutscene','active','defeat'].includes(r.stage)?r.stage:'waiting';q.system=NVGalaxy.systems.some(v=>v.id===r.system)?r.system:'sol';q.body=NVSol.byId[r.body]?r.body:'earth';q.route=[...new Set((Array.isArray(r.route)?r.route:[]).filter(id=>NVGalaxy.systems.some(v=>v.id===id)))];q.index=Math.max(0,Math.min(q.route.length-1,Math.floor(Number(r.index)||0)));for(const k of ['elapsed','travel','capture','clock','quoteTime','attackTime','beam','defeatTime','musicTime'])if(Number.isFinite(r[k]))q[k]=Math.max(0,Math.min(100000,r[k]));q.elapsed=Math.min(CUTSCENE_SECONDS,q.elapsed);q.quote=Math.max(0,Math.floor(Number(r.quote)||0))%QUOTES.length;q.attack='roaming';q.attackTime=0;q.beam=0;if(vector(r.position))q.position=r.position.slice();q.aim=q.position.slice();q.deathVoiceHeard=r.deathVoiceHeard===true;q.tracked=r.tracked===true;q.visited=[...new Set((Array.isArray(r.visited)?r.visited:[]).filter(id=>NVGalaxy.systems.some(v=>v.id===id)))];return q;}
 const ensure=s=>{const v=NVVengefulMascar.ensure(s);return v.rampage||(v.rampage=fresh());};
 const active=s=>s?.eris?.vengefulMascar?.form===3&&['cutscene','active'].includes(ensure(s).stage)&&s.eris.vengefulMascar.stage==='hunt';
 function route(from){const left=NVGalaxy.systems.map(v=>v.id).filter(id=>id!==from),out=[from];while(left.length){const here=out.at(-1);left.sort((a,b)=>NVCluster.distance(here,a)-NVCluster.distance(here,b)||a.localeCompare(b));out.push(left.shift());}return out;}
 function begin(s){const v=NVVengefulMascar.ensure(s);if(v.form!==2||v.stage!=='hunt')return false;const q=fresh();v.rampage=q;v.form=3;v.engaged=false;q.stage='cutscene';q.system=NVGalaxy.system(s);q.body=s.space.body;q.route=route(q.system);q.visited=[q.system];Object.assign(v.enemy,{hp:HP,maxHp:HP,mode:'idle',altitude:0});v.shot=null;return true;}
 function safePosition(body){const b=NVSol.byId[body];return[b.position[0],b.position[1]+b.radius+650,b.position[2]+b.radius+650];}
 function launch(s){const q=ensure(s);if(q.stage!=='cutscene')return false;const p=s.space;p.system=q.system;p.body=q.body;p.target=q.body;p.phase='flight';p.position=safePosition(q.body);p.yaw=0;p.pitch=0;p.speed=0;p.throttle=0;p.autopilot=false;p.focusReleased=true;p.warp=null;p.geo=null;p.ecologyOcean=false;p.combatActive=true;if(p.interior)p.interior.active=false;p.hull=Math.max(1,p.hull);q.position=p.position.map((v,i)=>v+(i===1?30:i===2?520:0));q.aim=q.position.slice();q.attack='roaming';q.attackTime=0;q.stage='active';q.elapsed=CUTSCENE_SECONDS;q.tracked=true;NVSpace.notice(p,'PHASE 3 / MASCAR ORBITAL RAMPAGE / 3,000,000 HP / SHIP COMBAT');return true;}
 const local=s=>active(s)&&ensure(s).stage==='active'&&ensure(s).system===NVGalaxy.system(s)&&s.space.phase==='flight'&&!s.space.warp&&!s.space.interior?.active;
 const engaged=s=>local(s)&&NVSpace.distance(s.space.position,ensure(s).position)<6000;
 function vessel(s){const q=ensure(s);return{id:ID,mascarRampage:true,system:q.system,body:q.body,home:q.body,faction:'TERRA',originFaction:'TERRA',captain:'ORION MASCAR / MASCAR FRAME',leader:null,position:q.position.slice(),yaw:q.clock*.04,pitch:0,hp:NVVengefulMascar.ensure(s).enemy.hp,maxHp:HP,front:-1,target:-1,fire:0,mode:'rampage',playerWeaponCooldown:99};}
 function damage(s,amount){const q=ensure(s),v=NVVengefulMascar.ensure(s);if(!local(s)||!Number.isFinite(amount)||amount<=0)return[];v.enemy.hp=Math.max(0,v.enemy.hp-(amount>=500?25000:10000));if(!v.enemy.hp)NVVengefulMascar.victory(s);return[];}
 function defeat(s){const q=ensure(s);if(q.stage==='defeat')return false;q.stage='defeat';q.defeatTime=12;q.beam=0;q.tracked=false;return true;}
 function worlds(system){return system==='sol'?NVSol.worlds:system==='janira-proxima'?[NVGalaxy.prime,NVGalaxy.moon]:NVCluster.bodyLists[system]||[];}
 const playerPresent=s=>ensure(s).system===NVGalaxy.system(s);
 function capture(s){const q=ensure(s);if(!active(s)||q.stage!=='active'||playerPresent(s))return[];NVOrionEmpire.begin(s);const e=NVOrionEmpire.ensure(s),targets=worlds(q.system).filter(b=>!b.stellar&&NVEris.faction(s,b.id)!=='TERRA'&&!e.owners.includes(b.id)&&!NVGovernance.protectedWorld(s,b.id)),taken=[];for(const b of targets.slice(0,3))if(NVOrionEmpire.capture(s,b.id))taken.push(b.name);if(taken.length){e.notice='MASCAR’S RAMPAGE / TERRA IMPERIA CONQUERED '+taken.join(' · ').toUpperCase();e.noticeTime=12;}return taken;}
 function move(s){const q=ensure(s);if(!q.route.length)q.route=route(q.system);q.index=(q.index+1)%q.route.length;q.system=q.route[q.index];const b=worlds(q.system).find(b=>!b.stellar)||NVSol.byId[q.system+'-star']||NVSol.byId.earth;q.body=typeof b==='string'?b:b.id;q.position=safePosition(q.body);q.position[2]+=500;q.travel=0;q.capture=0;if(!q.visited.includes(q.system))q.visited.push(q.system);q.aim=q.position.slice();q.attackTime=0;q.attack='roaming';return q.system;}
 function step(s,dt){const q=ensure(s);if(!Number.isFinite(dt)||dt<=0)return;dt=Math.min(.1,dt);if(q.stage==='defeat'){q.defeatTime=Math.max(0,q.defeatTime-dt);return;}if(!active(s)||q.stage!=='active')return;q.clock+=dt;q.beam=Math.max(0,q.beam-dt);if(engaged(s)){q.quoteTime-=dt;if(q.quoteTime<=0){q.quote=(q.quote+1)%QUOTES.length;q.quoteTime=9;}}if(playerPresent(s))q.capture=0;else{q.capture+=dt;if(q.capture>=CAPTURE_SECONDS){q.capture-=CAPTURE_SECONDS;capture(s);}}
  if(!engaged(s)){q.travel+=dt;if(q.travel>=TRAVEL_SECONDS)move(s);return;}
  q.travel=0;q.position[1]+=Math.sin(q.clock*.35)*dt*.6;q.attack='roaming';q.attackTime=0;q.beam=0;q.aim=q.position.slice();
 }
 function target(s){if(!local(s))return null;const p=s.space,q=ensure(s),d=q.position.map((v,i)=>v-p.position[i]),r=Math.hypot(...d)||1,f=[Math.sin(p.yaw)*Math.cos(p.pitch),Math.sin(p.pitch),Math.cos(p.yaw)*Math.cos(p.pitch)];return r<=(NVCapital.owned(s)?6000:1800)&&d.reduce((sum,v,i)=>sum+v*f[i]/r,0)>.965&&NVShipReward.clearShot(s,vessel(s))?vessel(s):null;}
 function waypoint(s){const q=ensure(s);if(!active(s)||!q.tracked)return null;const p=s.space;if(['landed','cockpit','off'].includes(p.phase))return{x:p.landingX||0,z:p.landingZ||0,label:'Return to ship · MASCAR ORBITAL RAMPAGE'};if(NVGalaxy.system(s)!==q.system)return{galaxy:true,system:q.system,label:'MASCAR FRAME · '+NVCluster.meta[q.system].name};return{space:true,position:q.position,radius:65,label:'MASCAR FRAME · '+Math.ceil(NVVengefulMascar.ensure(s).enemy.hp).toLocaleString()+' HP'};}
 return{HP,ID,TRAVEL_SECONDS,CAPTURE_SECONDS,CUTSCENE_SECONDS,QUOTES,DEFEAT,fresh,restore,ensure,active,route,begin,launch,local,engaged,vessel,damage,defeat,worlds,playerPresent,capture,move,step,target,waypoint};
})();
const rampageRestore=NVVengefulMascar.restore;NVVengefulMascar.restore=r=>{const v=rampageRestore(r);v.rampage=NVMascarRampage.restore(r?.rampage);return v;};
