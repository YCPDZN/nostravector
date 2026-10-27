// Browser-export touch layer. All actions use the game's existing input handlers.
const NVTouch=(()=>{
 const touch=matchMedia('(any-pointer:coarse)').matches||navigator.maxTouchPoints>0;
 let enabled=touch,lastRefresh=0,lastMode='',held=new Set(),look=null,stickPointer=null;
 const owners=new Map(),$m=id=>document.getElementById(id),clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
 const root=document.createElement('nav');root.id='nvMobileControls';root.hidden=true;root.setAttribute('aria-label','Touch game controls');
 root.innerHTML='<button id="nvMobilePause" aria-label="Pause and save game">Ⅱ</button><div id="nvMobileStick" role="group" aria-label="Movement thumbstick"><span class="nv-stick-guide">MOVE</span><i id="nvMobileThumb"></i></div><div id="nvMobileActions"><button id="nvMobileUse">INTERACT</button><button id="nvMobileFire">FIRE</button><button id="nvMobileJump">JUMP</button><button id="nvMobileRun">RUN</button><button id="nvMobileRise" hidden>RISE</button><button id="nvMobileDescend" hidden>DESCEND</button></div><span id="nvMobileLookHint">SWIPE THE VIEW TO LOOK</span>';
 document.body.append(root);
 const toggle=document.createElement('button');toggle.id='nvTouchToggle';toggle.type='button';toggle.className='menu-btn';toggle.innerHTML='<span class="num">✥</span><span>TOUCH CONTROLS</span><span id="nvTouchStatus"></span>';
 toggle.className='dialog-action';$m('settings').append(toggle);
 const visible=el=>!!el&&!el.hidden&&!!el.getClientRects().length&&getComputedStyle(el).visibility!=='hidden';
 function context(){
  if(!gameActive||!polarState)return'menu';
  if(NVArchiostal.active(polarState))return'station';
  if(NVShipInterior.active(polarState))return'interior';
  if(polarState.space&&['flight','atmosphere','ascent','descent','cockpit','launch','disabled'].includes(polarState.space.phase))return'flight';
  return polarState.car?.driving?'rover':'ground';
 }
 function blocked(){
  if(!enabled||!gameActive||!polarState||gamePaused||document.hidden)return true;
  if(galaxyOpen||spaceChartOpen||hudToolsOpen||!$m('inventorySheet').hidden)return true;
  if(document.querySelector('dialog[open]')||[...document.querySelectorAll('[role="dialog"]')].some(visible))return true;
  if(visible($m('archiostalWardDirectory'))||shipCrewBoardOpen||charonBriefingOpen)return true;
  if(polarScreen.classList.contains('hud-cinematic')||(!['station','interior'].includes(context())&&cleanHUDRoot.hidden))return true;
  return false;
 }
 function canvas(){return context()==='station'?$m('archiostalCanvas'):context()==='interior'?$m('shipInteriorCanvas'):polarCanvas;}
 function emit(code,down){const target=canvas()||document.body;target.dispatchEvent(new KeyboardEvent(down?'keydown':'keyup',{code,key:code==='Space'?' ':code.startsWith('Key')?code.slice(3).toLowerCase():code==='ShiftLeft'?'Shift':code,bubbles:true,cancelable:true}));}
 function assign(owner,codes){
  if(codes.length)owners.set(owner,new Set(codes));else owners.delete(owner);
  const next=new Set([...owners.values()].flatMap(s=>[...s])),old=held;held=next;
  for(const k of old)if(!next.has(k))emit(k,false);
  for(const k of next)if(!old.has(k))emit(k,true);
 }
 function release(){owners.clear();const old=held;held=new Set();for(const k of old)emit(k,false);stickPointer=null;look=null;$m('nvMobileThumb').style.transform='translate(0,0)';for(const b of root.querySelectorAll('button'))b.classList.remove('nv-held');}
 function bindHold(id,code){const el=$m(id);el.addEventListener('pointerdown',e=>{if(blocked()||el.disabled)return;e.preventDefault();e.stopPropagation();el.setPointerCapture(e.pointerId);el.classList.add('nv-held');assign(id+e.pointerId,[typeof code==='function'?code():code]);});for(const type of ['pointerup','pointercancel','lostpointercapture'])el.addEventListener(type,e=>{e.preventDefault();el.classList.remove('nv-held');assign(id+e.pointerId,[]);});}
 bindHold('nvMobileFire','KeyZ');bindHold('nvMobileRun','ShiftLeft');bindHold('nvMobileJump',()=>context()==='flight'||context()==='rover'?'Space':'KeyJ');bindHold('nvMobileRise','KeyE');bindHold('nvMobileDescend','KeyQ');
 const stick=$m('nvMobileStick');
 function moveStick(e){if(e.pointerId!==stickPointer||blocked())return;const r=stick.getBoundingClientRect(),radius=r.width*.33,dx=e.clientX-r.left-r.width/2,dy=e.clientY-r.top-r.height/2,d=Math.hypot(dx,dy),scale=Math.min(1,radius/Math.max(.1,d)),x=dx*scale,y=dy*scale,codes=[];
  $m('nvMobileThumb').style.transform=`translate(${x}px,${y}px)`;
  if(y< -radius*.27)codes.push('KeyW');if(y>radius*.27)codes.push('KeyS');if(x< -radius*.27)codes.push('KeyA');if(x>radius*.27)codes.push('KeyD');assign('stick',codes);
 }
 stick.addEventListener('pointerdown',e=>{if(blocked())return;e.preventDefault();e.stopPropagation();stickPointer=e.pointerId;stick.setPointerCapture(e.pointerId);moveStick(e);});
 stick.addEventListener('pointermove',e=>{e.preventDefault();moveStick(e);});
 for(const type of ['pointerup','pointercancel','lostpointercapture'])stick.addEventListener(type,e=>{if(e.pointerId!==stickPointer)return;e.preventDefault();stickPointer=null;$m('nvMobileThumb').style.transform='translate(0,0)';assign('stick',[]);});
 function action(){
  const mode=context();if(mode==='interior'){const b=$m('interiorInteract');return b&&!b.hidden&&!b.disabled?b:null;}
  if(mode==='flight'){if(polarState.space.phase==='cockpit')return $m('launchSpaceship');for(const id of ['dockArchiostal','spaceLand']){const b=$m(id);if(visible(b)&&!b.disabled)return b;}return null;}
  if(hudInteractionSource&&!hudInteractionSource.disabled)return hudInteractionSource;
  const b=$m('hudInteract');if(visible(b)&&!b.disabled)return b;
  const wanted=/speak|talk|recruit|collect|gather|board|pick up|take rifle|unlock|activate|enter rover|leave rover|return to ship/i;
  return [...polarScreen.querySelectorAll('button')].find(b=>!b.disabled&&visible(b)&&wanted.test(b.textContent)&&!b.closest('#hudTools,#hudToolbar,#worldPauseSheet'))||null;
 }
 $m('nvMobileUse').onclick=()=>{if(blocked())return;const el=action();if(el&&!el.disabled)el.click();refresh(true);};
 $m('nvMobilePause').onclick=()=>{release();pausePolar(true);refresh(true);};
 toggle.onclick=()=>{enabled=!enabled;release();refresh(true);};
 const mission=$m('hudMission');mission.addEventListener('click',()=>{if(!enabled)return;const on=document.body.dataset.mobileDetails!=='true';document.body.dataset.mobileDetails=String(on);mission.setAttribute('aria-expanded',String(on));});
 mission.addEventListener('keydown',e=>{if(enabled&&['Enter','Space'].includes(e.code)){e.preventDefault();e.stopPropagation();mission.click();}});
 // Ground/station/interior canvases already support touch dragging. Add it to flight too.
 window.addEventListener('pointerdown',e=>{if(!enabled||e.pointerType!=='touch'||blocked()||e.target!==polarCanvas||context()!=='flight')return;look={id:e.pointerId,x:e.clientX,y:e.clientY,startX:e.clientX,startY:e.clientY,moved:false};try{polarCanvas.setPointerCapture(e.pointerId);}catch{}} ,true);
 window.addEventListener('pointermove',e=>{if(!look||look.id!==e.pointerId)return;if(blocked()){look=null;return;}const dx=e.clientX-look.x,dy=e.clientY-look.y;if(Math.hypot(e.clientX-look.startX,e.clientY-look.startY)>6)look.moved=true;
  if(look.moved){e.preventDefault();e.stopImmediatePropagation();const p=polarState.space;if(p.autopilot)NVSpace.releaseCourse(polarState);p.yaw-=dx*.005;p.pitch=clamp((p.pitch||0)-dy*.004,-1.35,1.35);}
  look.x=e.clientX;look.y=e.clientY;
 },{capture:true,passive:false});
 for(const type of ['pointerup','pointercancel'])window.addEventListener(type,e=>{if(!look||look.id!==e.pointerId)return;if(look.moved){spacePlanetPointer=null;e.preventDefault();e.stopImmediatePropagation();}look=null;},true);
 function refresh(force=false){
  const now=performance.now();if(!force&&now-lastRefresh<100)return;lastRefresh=now;document.body.dataset.touchControls=enabled?'on':'off';document.body.dataset.mobileGame=document.documentElement.dataset.mobileGame=String(gameActive);$m('nvTouchStatus').textContent=enabled?'ON':'OFF';toggle.setAttribute('aria-pressed',String(enabled));
  if(enabled){mission.tabIndex=0;mission.setAttribute('role','button');mission.setAttribute('aria-label','Show or hide objective details');}else{mission.removeAttribute('tabindex');mission.removeAttribute('role');}
  const mode=context(),off=blocked();root.hidden=off;if(off){release();lastMode=mode;return;}if(mode!==lastMode){release();lastMode=mode;}root.dataset.mode=mode;
  const flight=mode==='flight',rover=mode==='rover',interior=mode==='interior';
  const boarding=interior&&NVCatharsisBoarding.active(polarState);
  $m('nvMobileFire').hidden=interior&&!boarding||rover;$m('nvMobileFire').textContent=flight?'FIRE TURRETS':'FIRE';
  $m('nvMobileJump').hidden=interior;$m('nvMobileJump').textContent=flight||rover?'BRAKE':'JUMP';$m('nvMobileRun').textContent=flight||rover?'BOOST':'RUN';
  const atmo=flight&&polarState.space.phase==='atmosphere';$m('nvMobileRise').hidden=!atmo;$m('nvMobileDescend').hidden=!atmo;
  const el=action(),use=$m('nvMobileUse');use.disabled=!el;use.textContent=el?el.textContent.replace(/\s*\/\s*(?:F|T|G|L|SPACE|ENTER).*$/i,'').trim().slice(0,46):'INTERACT';
  $m('nvMobileStick').querySelector('span').textContent=flight?'FLY':rover?'DRIVE':'MOVE';
 }
 const update=updatePolarHUD;updatePolarHUD=()=>{update();refresh();};
 const interiorUpdate=refreshInteriorHUD;refreshInteriorHUD=()=>{interiorUpdate();refresh();};
 const stationUpdate=drawArchiostalStation;drawArchiostalStation=(...args)=>{const result=stationUpdate(...args);refresh();return result;};
 const pause=pausePolar;pausePolar=on=>{release();const r=pause(on);refresh(true);return r;};
 const exit=exitPolar;exitPolar=()=>{release();const r=exit();refresh(true);return r;};
 document.addEventListener('click',()=>queueMicrotask(()=>refresh(true)));
 window.addEventListener('blur',release);document.addEventListener('visibilitychange',()=>{if(document.hidden)release();});
 function resize(){release();document.documentElement.style.setProperty('--nv-mobile-height',(window.visualViewport?.height||innerHeight)+'px');refresh(true);}
 window.addEventListener('resize',resize);window.addEventListener('orientationchange',resize);window.visualViewport?.addEventListener('resize',resize);resize();
 return{refresh,release,context,blocked,get enabled(){return enabled;},get held(){return[...held];}};
})();
