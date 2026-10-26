from pathlib import Path
p=Path('work/test_mascar_rampage_browser.js');s=p.read_text(encoding='utf-8');needle=" await p.waitForFunction(()=>{NVMascarRampage.step(polarState,.1);updatePolarHUD();return NVOrionCombatVoice.state.key==='3:0';},{},{polling:100,timeout:15000});";assert needle in s;s=s.replace(needle,""" await p.waitForFunction(()=>{NVMascarRampage.step(polarState,.1);updatePolarHUD();return NVOrionCombatVoice.state.key==='3:10';},{},{polling:100,timeout:15000});
 assert(await p.locator('#mascarCombatComms').isVisible());
 for(let line=10;line<30;line++){
  await p.evaluate(line=>{const r=NVMascarRampage.ensure(polarState);r.quote=line;r.quoteTime=9;updatePolarHUD();},line);
  assert.equal(await p.evaluate(()=>NVOrionCombatVoice.state.current==null),true);
  assert.equal(await p.locator('#mascarSpaceQuote').textContent(),await p.evaluate(line=>NVMascarRampage.QUOTES[line],line));
  assert.equal(await p.evaluate(()=>[...NVOrionCombatVoice.clips.values()].every(r=>r.a.paused)),true);
 }
 await p.evaluate(()=>{NVMascarRampage.ensure(polarState).quoteTime=.01;NVMascarRampage.step(polarState,.1);updatePolarHUD();});
 await p.waitForFunction(()=>NVOrionCombatVoice.state.key==='3:0'&&!!NVOrionCombatVoice.state.current);
""");p.write_text(s,encoding='utf-8')
p=Path('work/test_battle_performance_browser.js');s=p.read_text(encoding='utf-8');needle=' const outcome=await p.evaluate';insert=""" const gates=await p.evaluate(()=>{const s=polarState,r=NVMascarRampage.ensure(s),emp=NVOrionEmpire.ensure(s),before=emp.owners.length;const oldPhase=s.space.phase;for(const phase of ['landed','flight','cockpit']){s.space.phase=phase;r.capture=4.99;r.travel=0;for(let i=0;i<20;i++)NVMascarRampage.step(s,.1);if(r.capture!==0||NVMascarRampage.capture(s).length||NVOrionEmpire.capture(s,'mars'))return false;}s.space.phase=oldPhase;updatePolarHUD();return emp.owners.length===before&&NVMascarRampage.QUOTES.length===30&&$('#mascarSpaceQuote').parentElement.id==='mascarCommsLines';});assert(gates);
""";assert needle in s;s=s.replace(needle,insert+needle);p.write_text(s,encoding='utf-8')
