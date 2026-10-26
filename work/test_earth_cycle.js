const assert=require('node:assert/strict'),A=require('./antarctica_core.js');
const s=A.fresh(77);
assert.equal(A.EARTH_DAY_SECONDS,20*60);assert.equal(A.EARTH_NIGHT_SECONDS,10*60);assert.equal(A.EARTH_CYCLE_SECONDS,30*60);
assert.equal(A.earthLighting(s).clock,'06:00');assert.equal(A.earthLighting(s).remaining,1200);
A.earthStep(s,600);assert.equal(A.earthLighting(s).phase,'DAYLIGHT');assert.equal(A.earthLighting(s).daylight,1);assert.equal(A.earthLighting(s).clock,'12:00');
A.earthStep(s,599.999);assert.equal(A.earthLighting(s).isDay,true);
s.earthTime=1200;assert.equal(A.earthLighting(s).isDay,false);assert.equal(A.earthLighting(s).clock,'18:00');assert.equal(A.earthLighting(s).remaining,600);
A.earthStep(s,300);assert.equal(A.earthLighting(s).clock,'00:00');assert.equal(A.earthLighting(s).daylight,0);
A.earthStep(s,299.999);assert.equal(A.earthLighting(s).isDay,false);
s.earthTime=1800;assert.equal(A.earthLighting(s).day,2);assert.equal(A.earthLighting(s).clock,'06:00');assert.equal(A.earthLighting(s).isDay,true);
const before=s.earthTime;for(const dt of [0,-3,NaN,Infinity])A.earthStep(s,dt);assert.equal(s.earthTime,before);
A.earthStep(s,1800*123+1450);assert.equal(A.earthLighting(s).day,125);assert.equal(A.earthLighting(s).seconds,1450);
const snapshot=A.snapshot(s);assert.deepEqual(A.snapshot(A.restored({antarctica:snapshot},'manual-checkpoint')),snapshot);
assert.equal(A.restored({antarctica:{playTime:1450}},'legacy').earthTime,1450);
assert.equal(A.restored({antarctica:{earthTime:-10}},'invalid').earthTime,0);
assert.equal(A.restored({antarctica:{earthTime:Infinity}},'invalid').earthTime,0);
for(const t of [0,45,90,600,1110,1155,1199,1200,1245,1500,1755,1799,1800]){
  const light=A.earthLighting({earthTime:t});assert.ok(light.direction.every(Number.isFinite));
  assert.ok(Math.abs(Math.hypot(...light.direction)-1)<1e-9);
  assert.ok(light.daylight>=0&&light.daylight<=1);assert.ok(light.twilight>=0&&light.twilight<=1);
  const nearby=A.earthLighting({earthTime:t+.001});assert.ok(Math.abs(nearby.daylight-light.daylight)<.001,'Lighting remains continuous at dawn, sunset and cycle wrap.');
}
console.log('Passed: exact 20-minute day / 10-minute night, clock boundaries, repeated cycles, smooth lighting, invalid-time guards and manual checkpoint migration.');
