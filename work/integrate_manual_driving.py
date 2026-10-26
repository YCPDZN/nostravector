from pathlib import Path
work=Path(__file__).resolve().parent
p=work/'antarctica_game.js';s=p.read_text(encoding='utf-8')
s=s.replace("if(polarState.jamesIntroductionDone&&['Enter','Space'].includes(e.code))return;", "if(polarState.jamesIntroductionDone&&(e.code==='Enter'||(e.code==='Space'&&(!polarState.car?.driving||polarState.car.driver!=='player'||e.target?.tagName==='BUTTON'))))return;")
s=s.replace("'KeyR','KeyF','KeyQ'", "'KeyR','KeyF','KeyX','KeyQ'")
s=s.replace("if(e.code==='KeyF'){interactWithCar();return;}", "if(e.code==='KeyF'){interactWithCar();return;}if(e.code==='KeyX'){switchPolarDriver();return;}")
p.write_text(s,encoding='utf-8')
p=work/'antarctica.html';s=p.read_text(encoding='utf-8').replace('F CAR · ESC PAUSE','F CAR · X SWITCH DRIVER · ESC PAUSE');p.write_text(s,encoding='utf-8')
p=work/'antarctica_renderer.js';s=p.read_text(encoding='utf-8')
s=s.replace('car.elapsed*8', '(car.odometer||0)/.52')
s=s.replace('const passengers=[[hero,-.51,false],[james,.51,true]];', "const driverSeat=car.driver==='player'?.51:-.51,passengers=[[hero,driverSeat,false],[james,-driverSeat,true]];")
s=s.replace('const distance=s.car?.driving?9.5:5.4,p=s.cameraPitch;', 'const distance=s.car?.driving?9.5+Math.abs(s.car.speed)/A.CAR_MAX_SPEED*7:5.4,p=s.cameraPitch;')
p.write_text(s,encoding='utf-8')
print('Connected manual driving, driver handoff, speedometer, and matching character seats.')
