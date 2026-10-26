from pathlib import Path
w=Path('work');p=w/'imperia_inner_circle.js';s=p.read_text(encoding='utf-8').replace("rank:'GRAND IMPERARCH',deceased", "rank:'GRAND IMPERARCH',alignment:'LAWFUL EVIL',deceased").replace("rank:'CO-GRAND GENERAL',deceased", "rank:'CO-GRAND GENERAL',alignment:'LAWFUL EVIL',deceased");s=s.replace("rank:'VENGEFUL',deceased:false", "rank:'VENGEFUL',alignment:s.eris.chapter4?.year===2127&&s.eris.vengefulMascar?.stage!=='complete'?'LAWFUL EVIL':'CHAOTIC EVIL',deceased:false");s=s.replace('row.append(name,rank);',"row.append(name,rank);const alignment=document.createElement('small');alignment.className='inner-circle-alignment';alignment.textContent=m.alignment;row.append(alignment);");p.write_text(s,encoding='utf-8')
p=w/'imperia_inner_circle.css';s=p.read_text(encoding='utf-8');s+='\n#imperiaInnerCircle .inner-circle-alignment{grid-column:1;font:10px/1.6 Consolas,monospace;letter-spacing:1px;color:#dfb2a4}\n';p.write_text(s,encoding='utf-8')
p=w/'test_imperia_inner_circle_browser.js';s=p.read_text(encoding='utf-8');needle="  await p.screenshot({path:'outputs/NOSTRAVECTOR_Inner_Circle.png'});";insert='''  for(const id of ['thomas','malia','croxian'])assert.equal(await p.locator('[data-member="'+id+'"] .inner-circle-alignment').textContent(),'LAWFUL EVIL');
  assert.equal(await p.locator('[data-member="orion"] .inner-circle-alignment').textContent(),'CHAOTIC EVIL');
  await p.evaluate(()=>{NVChapter4.ensure(polarState).year=2127;refreshInnerCircle();});
  assert.equal(await p.locator('[data-member="orion"] .inner-circle-alignment').textContent(),'LAWFUL EVIL');
  await p.evaluate(()=>{NVVengefulMascar.ensure(polarState).stage='complete';refreshInnerCircle();});
  assert.equal(await p.locator('[data-member="orion"] .inner-circle-alignment').textContent(),'CHAOTIC EVIL');
  await p.evaluate(()=>{NVVengefulMascar.ensure(polarState).stage='waiting';NVChapter4.ensure(polarState).year=2125;refreshInnerCircle();});
''';assert needle in s;s=s.replace(needle,insert+needle);p.write_text(s,encoding='utf-8')
