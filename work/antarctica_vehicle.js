function updateVehicleHUD(){
  const s=polarState,car=s?.car;$('#vehiclePanel').hidden=!s?.jamesIntroductionDone||!car;$('#autoWalk').disabled=!!car?.driving;$('#toggleSprint').disabled=!!car?.driving;if(!car)return;if(!car.driving&&Math.hypot(s.x-car.x,s.z-car.z)>80)$('#vehiclePanel').hidden=true;
  const manual=car.driver==='player',distance=Math.hypot(s.x-car.x,s.z-car.z),left=Math.max(0,car.routeStartElapsed+car.routeDuration-car.elapsed),total=Math.ceil(left),eta=String(Math.floor(total/60)).padStart(2,'0')+':'+String(total%60).padStart(2,'0');
  $('#vehicleETA').textContent=car.driving?(manual?'MANUAL DRIVE / FREE ROAM':'ARRIVAL / '+eta):car.arrived?(s.bedRested?'ROVER PARKED / FERRY ROUTE':'STATION REACHED / FREE ROAM'):Math.round(distance)+' M AWAY / JAMES CAN DRIVE';
  $('#vehicleTitle').textContent=car.driving?(manual?'YOU ARE DRIVING':'JAMES IS DRIVING'):'JAMES’S POLAR ROVER';
  $('#boardCar').textContent=car.driving?'STOP & EXIT / F':'ENTER CAR / F';$('#boardCar').disabled=!car.driving&&distance>6;
  $('#switchCarDriver').hidden=!car.driving;$('#switchCarDriver').textContent=manual?'LET JAMES DRIVE / X':'TAKE THE WHEEL / X';
  $('#vehicleSpeed').textContent=String(Math.floor(Math.abs(car.speed)/NVAntarctica.MPH_TO_MPS+.001)).padStart(3,'0');$('#vehicleGear').textContent=car.speed<-.1?'REVERSE':manual?'MANUAL':'JAMES / AUTO';
  $('#vehicleControls').hidden=!car.driving||!manual;$('#vehicleBrake').hidden=!car.driving||!manual;
  if(car.driving){$('#jamesStatus').textContent=manual?'PASSENGER / WITH YOU':'AT THE WHEEL / WITH YOU';$('#staminaLabel').textContent='RESTING / IN VEHICLE';$('#journeyEstimate').textContent=manual?'UP TO 200 MPH / MANUAL DRIVE':eta+(s.bedRested?' DRIVE TO FERRY':' DRIVE TO STATION');}
  polarScreen.dataset.vehicle=car.driving?'driving':car.arrived?'arrived':'parked';polarScreen.dataset.driver=car.driver;polarScreen.dataset.speedMph=(Math.abs(car.speed)/NVAntarctica.MPH_TO_MPS).toFixed(2);polarScreen.dataset.driveRemaining=left.toFixed(2);
}
function interactWithCar(){if(!gameActive||gamePaused||betrayalActive()||africaModal()||polarState.ferryEscaped||polarState.bedSleeping||jamesConversation.active||hazardModalActive()||!polarState.jamesIntroductionDone)return;const A=NVAntarctica,s=polarState;if(s.car?.driving)A.leaveCar(s);else if(!A.boardCar(s))return;polarAutoWalk=false;polarSprint=false;polarKeys.clear();polarTravel=0;jamesTravel=0;polarPhase=0;jamesPhase=0;polarVelocity=0;jamesVelocity=0;polarPoseSpeed=0;jamesPoseSpeed=0;polarTrail=[];polarCanvas.focus();updatePolarHUD();}
function switchPolarDriver(){if(!gameActive||gamePaused||betrayalActive()||africaModal()||polarState.ferryEscaped||polarState.bedSleeping||jamesConversation.active||hazardModalActive()||!NVAntarctica.switchCarDriver(polarState))return;polarKeys.clear();polarCanvas.focus();updatePolarHUD();}
function drivePolarCar(dt){
  const s=polarState,manual=s.car.driver==='player',held=(...keys)=>keys.some(k=>polarKeys.has(k));
  const arrived=manual?NVAntarctica.manualCarStep(s,dt,{throttle:held('KeyW','ArrowUp'),brake:held('KeyS','ArrowDown'),steer:Number(held('KeyA','ArrowLeft'))-Number(held('KeyD','ArrowRight')),handbrake:held('Space')}):NVAntarctica.carStep(s,dt);
  polarAutoWalk=false;polarSprint=false;polarVelocity=0;jamesVelocity=0;polarPoseSpeed=0;jamesPoseSpeed=0;if(held('KeyQ'))s.cameraYaw-=dt*1.5;if(held('KeyE'))s.cameraYaw+=dt*1.5;
  if(arrived){polarKeys.clear();if(s.bedRested)checkFerryArrival();else{polarWinTime=polarClock+8;$('#stationMessage').hidden=false;}}
}
$('#boardCar').onclick=interactWithCar;
$('#switchCarDriver').onclick=switchPolarDriver;
$('#vehicleBrake').onpointerdown=e=>{if(gamePaused||!polarState?.car?.driving||polarState.car.driver!=='player')return;e.preventDefault();$('#vehicleBrake').setPointerCapture(e.pointerId);polarKeys.add('Space');};
$('#vehicleBrake').onpointerup=$('#vehicleBrake').onpointercancel=()=>polarKeys.delete('Space');
$('#vehicleBrake').onclick=()=>{if(!gamePaused&&polarState?.car?.driving&&polarState.car.driver==='player'){polarState.car.speed=0;updatePolarHUD();polarCanvas.focus();}};
