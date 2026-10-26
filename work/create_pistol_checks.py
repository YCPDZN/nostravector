from pathlib import Path
w=Path('work');s=(w/'test_companion_combat_browser.js').read_text(encoding='utf-8').split('const patterns=')[0]
s+='''
await p.evaluate(()=>{const s=polarState;for(const n of NVParty.list(s))NVGovernance.setRole(s,n.id,'ship');updatePolarHUD();renderSpaceWorld(s,1,{playerPhase:0,jamesPhase:0,playerSpeed:0,jamesSpeed:0});polarCanvas.focus();});
assert(await p.evaluate(()=>NVPlayerPistol.playable(polarState)));const before=await p.evaluate(()=>testEnemy.hp);await p.keyboard.press('z');assert.equal(await p.evaluate(()=>testEnemy.hp),before-34);assert.equal(await p.evaluate(()=>NVPlayerPistol.state(polarState).count),1);
await p.waitForFunction(()=>NVPlayerPistol.sounds.some(a=>!a.paused),{},{timeout:10000});
const count=await p.evaluate(()=>NVPlayerPistol.state(polarState).count);await p.evaluate(()=>NVPlayerPistol.step(polarState,.1));await p.keyboard.press('z');assert.equal(await p.evaluate(()=>NVPlayerPistol.state(polarState).count),count,'cooldown prevents duplicate shots');
await p.evaluate(()=>{NVPlayerPistol.state(polarState).cooldown=0;polarState.cameraYaw=Math.PI;polarState.cameraPitch=.5;updatePolarHUD();renderSpaceWorld(polarState,2,{playerPhase:0,jamesPhase:0,playerSpeed:0,jamesSpeed:0});});
const target=await p.evaluate(()=>NVPlayerPistol.project(160,NVWorldFlight.ground(polarState,160,163)+1.1,163));assert(target);await p.mouse.click(target.x,target.y);assert.equal(await p.evaluate(()=>NVPlayerPistol.state(polarState).count),count+1);assert.equal(await p.evaluate(()=>testEnemy.hp),before-68);
await p.evaluate(()=>renderSpaceWorld(polarState,3,{playerPhase:0,jamesPhase:0,playerSpeed:0,jamesSpeed:0}));assert.equal(await p.evaluate(()=>polarCanvas.getContext('webgl').getError()),0);await p.screenshot({path:'outputs/NOSTRAVECTOR_Player_Laser_Pistol.png'});
await p.evaluate(()=>{NVPlayerPistol.state(polarState).cooldown=0;polarCanvas.focus();});await p.keyboard.down('z');await p.evaluate(()=>{for(let i=0;i<12;i++)NVPlayerPistol.step(polarState,.1);});await p.keyboard.up('z');assert(await p.evaluate(()=>NVPlayerPistol.state(polarState).count>=5));
const quiet=await p.evaluate(()=>{pausePolar(true);const q=NVPlayerPistol.state(polarState),count=q.count;NVPlayerPistol.fire(polarState);return{count:q.count,before:count,held:q.held,audio:NVPlayerPistol.sounds.every(a=>a.paused)};});assert.equal(quiet.count,quiet.before);assert(!quiet.held);assert(quiet.audio);
await p.evaluate(()=>{pausePolar(false);polarState.space.phase='flight';updatePolarHUD();});assert(!(await p.evaluate(()=>NVPlayerPistol.playable(polarState))));
assert.deepEqual(errors,[]);console.log('Passed Z and aimed left-click laser fire, single damage, cooldown, held fire, attached sound playback, pause/mute cleanup, on-foot scope and visible WebGL pistol rendering.');}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
'''
# The companion test uses a browser variable b and keeps the same fixtures.
(w/'test_player_laser_pistol_browser.js').write_text(s,encoding='utf-8')
p=w/'package_menu.py';s=p.read_text(encoding='utf-8').replace("'audio/player-laser.mp3']", "'audio/player-laser.mp3','test_player_laser_pistol_browser.js']");p.write_text(s,encoding='utf-8')
