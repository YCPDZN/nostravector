const assert=require('node:assert/strict'),A=require('./antarctica_core.js');
function travel(sprint){const s=A.fresh(17);let elapsed=0,distance=0;while(distance<1680){distance+=A.staminaStep(s,sprint,true,.01)*.01;elapsed+=.01;}return elapsed;}
assert.ok(Math.abs(travel(false)-1200)<.1,'The direct walking route must take 20 minutes.');
assert.ok(Math.abs(travel(true)-480)<2,'Holding sprint must resume in short bursts after 1% recovery.');
assert.equal(A.routeDistance(A.fresh(17)),1680);
const s=A.fresh(17);for(let i=0;i<3000;i++)A.staminaStep(s,true,true,.01);assert.equal(s.exhausted,true);assert.ok(s.stamina<.01);
assert.equal(A.staminaStep(s,true,true,.59),A.WALK);assert(s.stamina<1&&s.exhausted);
assert.equal(A.staminaStep(s,true,true,.01),A.WALK);assert(Math.abs(s.stamina-1)<1e-8);assert.equal(s.exhausted,false);
assert.equal(A.staminaStep(s,true,true,.1),A.SPRINT);assert(s.stamina>0&&s.stamina<1);
const recovering=A.restored({antarctica:{stamina:1,exhausted:true}},'old-save');assert.equal(A.staminaStep(recovering,true,true,.01),A.SPRINT);assert.equal(recovering.exhausted,false);
for(let i=0;i<6000;i++)A.staminaStep(s,false,false,.01);assert.equal(s.stamina,100);assert.equal(s.exhausted,false);
for(const x of [-256,-128,0,128,4096])for(const z of [-10000,-128,0,1698]){assert.equal(A.height(x,z,99),A.height(x,z,99));assert.ok(Number.isFinite(A.height(x,z,99)));const e=1e-5;assert.ok(Math.abs(A.height(x-e,z,99)-A.height(x+e,z,99))<.001);}
const initial=A.fresh(99);initial.x=105;initial.z=1200;initial.stamina=34;initial.james={x:103,z:1197,yaw:1};initial.jamesIntroductionDone=true;initial.stationFound=false;
assert.deepEqual(A.snapshot(A.restored({antarctica:A.snapshot(initial)},'slot')),A.snapshot(initial));
const clean=A.restored({antarctica:{x:NaN,z:Infinity,stamina:-40,introIndex:100,seed:99}},'slot');assert.equal(clean.x,0);assert.equal(clean.z,0);assert.equal(clean.stamina,0);assert.equal(clean.introIndex,4);
const hip=[0,.74,0],ankle=[0,.18,.22],knee=A.knee(hip,ankle,.31,.35);assert.ok(Math.abs(Math.hypot(...knee.map((n,i)=>n-hip[i]))-.31)<.001);assert.ok(Math.abs(Math.hypot(...knee.map((n,i)=>n-ankle[i]))-.35)<.001);
for(let n=0;n<13;n++){const moved=A.avoid(0,n*130,99);assert.equal(moved.x,0);assert.equal(moved.z,n*130);}
const passenger=A.fresh(123);passenger.jamesIntroductionDone=true;passenger.jamesCarQuoteShown=true;A.unlockCar(passenger);assert.ok(passenger.car);
const parked=A.snapshot(passenger);passenger.x+=100;assert.equal(A.boardCar(passenger),false);Object.assign(passenger,A.restored({antarctica:parked},'slot'));assert.equal(A.boardCar(passenger),true);
for(let i=0;i<2400;i++)A.carStep(passenger,.05);
const midtrip=A.snapshot(passenger),resumed=A.restored({antarctica:midtrip},'slot');assert.deepEqual(A.snapshot(resumed),midtrip);assert.ok(Math.abs(resumed.car.elapsed-120)<.0001);
for(let i=0;i<3599;i++)A.carStep(resumed,.05);assert.equal(resumed.car.arrived,false);
A.carStep(resumed,.05);assert.equal(resumed.car.elapsed,300);assert.equal(resumed.car.arrived,true);assert.equal(resumed.car.driving,false);assert.equal(resumed.stationFound,true);assert.ok(A.routeDistance(resumed)<.001);assert.ok(Math.hypot(resumed.james.x-resumed.x,resumed.james.z-resumed.z)<6);
const stopped=A.fresh(321);stopped.jamesIntroductionDone=true;stopped.jamesCarQuoteShown=true;A.unlockCar(stopped);A.boardCar(stopped);A.carStep(stopped,90);A.leaveCar(stopped);assert.equal(stopped.car.driving,false);assert.equal(A.boardCar(stopped),true);A.carStep(stopped,210);assert.equal(stopped.car.arrived,true);
console.log('Passed: walking/sprint travel, 1% exhaustion recovery boundary, immediate old-save recovery, unchanged refill/drain, deterministic terrain, save restoration and leg IK.');
console.log('Passed: exact 300-second car arrival, both passengers, saved mid-trip continuation, proximity boarding, and stop/reboard.');
function drivingState(){const s=A.fresh(123);s.jamesIntroductionDone=true;s.jamesCarQuoteShown=true;A.unlockCar(s);A.boardCar(s);return s;}
const racer=drivingState();assert.equal(A.switchCarDriver(racer),true);assert.equal(racer.car.driver,'player');
for(let i=0;i<200;i++)A.manualCarStep(racer,.05,{throttle:true});
assert.ok(Math.abs(racer.car.speed/A.MPH_TO_MPS-200)<1e-8,'The engine must reach an actual 200 mph.');
const beforeTopSpeed=racer.car.z;A.manualCarStep(racer,1,{throttle:true});assert.ok(Math.abs(racer.car.z-beforeTopSpeed-A.CAR_MAX_SPEED)<.001,'Top speed must cover 89.408 metres in one second.');
const racerSave=A.snapshot(racer);assert.deepEqual(A.snapshot(A.restored({antarctica:racerSave},'slot')),racerSave);
const beforeSteer=racer.car.yaw;A.manualCarStep(racer,.1,{throttle:true,steer:1});assert.ok(racer.car.yaw>beforeSteer);
const handoffPosition={x:racer.car.x,z:racer.car.z};A.switchCarDriver(racer);assert.equal(racer.car.driver,'james');assert.equal(racer.car.x,handoffPosition.x);assert.equal(racer.car.z,handoffPosition.z);A.carStep(racer,.05);assert.ok(Math.hypot(racer.car.x-handoffPosition.x,racer.car.z-handoffPosition.z)<1,'Handing back to James must not teleport to the old route.');
const brake=drivingState();A.switchCarDriver(brake);for(let i=0;i<200;i++)A.manualCarStep(brake,.05,{throttle:true});for(let i=0;i<50;i++)A.manualCarStep(brake,.05,{handbrake:true});assert.equal(brake.car.speed,0);
for(let i=0;i<40;i++)A.manualCarStep(brake,.05,{brake:true});assert.ok(Math.abs(brake.car.speed/A.MPH_TO_MPS+20)<.001);A.manualCarStep(brake,.2,{throttle:true});assert.ok(brake.car.speed>-A.CAR_REVERSE_SPEED,'Throttle should brake reverse before moving forward.');
const impact=drivingState();A.switchCarDriver(impact);const p=A.chunkProps(1,4,impact.seed)[0];assert.ok(p);impact.car.x=p.x;impact.car.z=p.z-p.r*.75-2.8;impact.car.yaw=0;impact.car.speed=A.CAR_MAX_SPEED;impact.stationFound=true;A.manualCarStep(impact,.05,{throttle:true});assert.ok(impact.car.speed<A.CAR_MAX_SPEED);assert.ok(Math.hypot(impact.car.x-p.x,impact.car.z-p.z)>=p.r*.75+2.5-.001);
const fastArrival=drivingState();A.switchCarDriver(fastArrival);fastArrival.car.x=0;fastArrival.car.z=1640;fastArrival.car.yaw=0;fastArrival.car.speed=A.CAR_MAX_SPEED;assert.equal(A.manualCarStep(fastArrival,1,{throttle:true}),true);assert.equal(fastArrival.stationFound,true);assert.equal(fastArrival.car.driving,false);assert.ok(A.routeDistance(fastArrival)<.001);assert.equal(A.boardCar(fastArrival),true);assert.equal(fastArrival.car.driver,'player','The car remains usable after reaching the station.');
const far=drivingState();A.switchCarDriver(far);far.car.x=100000;far.car.z=0;A.switchCarDriver(far);const farStart={x:far.car.x,z:far.car.z};A.carStep(far,.1);assert.ok(Math.hypot(far.car.x-farStart.x,far.car.z-farStart.z)<=A.CAR_MAX_SPEED*.1+.001,'James must also respect the speed limit after a long detour.');
const legacy=A.restored({antarctica:{jamesIntroductionDone:true,car:{x:0,z:500,yaw:0,startX:0,startZ:0,elapsed:120,driving:true,arrived:false}}},'old-slot');assert.equal(legacy.car.driver,'james');assert.equal(legacy.car.routeDuration,300);assert.equal(legacy.car.elapsed,120);
console.log('Passed: driver handoff, physical 200 mph cap, saved manual velocity, steering, braking/reverse, rock collision, fast station arrival, post-arrival free roam, and legacy car saves.');
