from pathlib import Path
work=Path(__file__).resolve().parent
p=work/'menu_shell.html';s=p.read_text(encoding='utf-8')
key='<button class="dialog-action" data-close>RETURN TO MENU</button></dialog>'
assert key in s
if 'id="jamesVolume"' not in s:s=s.replace(key,'<div class="settings-row"><label for="jamesVolume">James voice volume</label><input id="jamesVolume" type="range" min="0" max="1" step=".05" value=".85"></div>'+key,1)
p.write_text(s,encoding='utf-8')
p=work/'antarctica.html';s=p.read_text(encoding='utf-8').replace('M MAP · ESC PAUSE','M MAP · F CAR · ESC PAUSE');p.write_text(s,encoding='utf-8')
p=work/'antarctica_renderer.js';s=p.read_text(encoding='utf-8')
key='  function station(seed,time)'
assert key in s
vehicle='''  function wheelMesh(){const p=[],n=[],f=[],steps=20;for(let side=0;side<2;side++)for(let j=0;j<steps;j++){const a=j/steps*2*Math.PI;p.push([side-.5,Math.cos(a),Math.sin(a)]);n.push([0,Math.cos(a),Math.sin(a)]);}for(let j=0;j<steps;j++){const k=(j+1)%steps;f.push(j,k,steps+j,k,steps+k,steps+j);}for(let side=0;side<2;side++){const center=p.length;p.push([side-.5,0,0]);n.push([side?1:-1,0,0]);const rim=p.length;for(let j=0;j<steps;j++){const a=j/steps*2*Math.PI;p.push([side-.5,Math.cos(a),Math.sin(a)]);n.push([side?1:-1,0,0]);}for(let j=0;j<steps;j++){const a=rim+j,b=rim+(j+1)%steps;f.push(center,side?a:b,side?b:a);}}return mesh({p,n,f});}
  const tire=wheelMesh();
  function polarRover(car,seed,time,occupied){
    const ground=A.height(car.x,car.z,seed),forward=[Math.sin(car.yaw),Math.cos(car.yaw)],pitch=-Math.atan((A.height(car.x+forward[0]*2,car.z+forward[1]*2,seed)-A.height(car.x-forward[0]*2,car.z-forward[1]*2,seed))/4),base=M.mul(M.t(car.x,ground,car.z),M.mul(M.ry(car.yaw),M.rx(pitch))),orange=[.69,.28,.10],dark=[.11,.18,.23],white=[.80,.87,.90];
    function piece(x,y,z,sx,sy,sz,color,emission=0,q=cube,spin=0){draw(q,M.mul(base,M.mul(M.t(x,y,z),M.mul(M.rx(spin),M.scale(sx,sy,sz)))),color,0,emission);}
    piece(0,.58,0,2.6,.30,4.6,dark);piece(0,.91,0,2.48,.46,4.4,orange);piece(0,1.24,1.67,2.28,.37,1.22,orange);piece(0,1.03,-1.65,2.30,.52,1.07,orange);
    piece(0,2.29,-.12,2.5,.20,2.75,white);piece(0,2.43,-.12,2.45,.085,2.65,[.91,.96,.98]);
    for(const x of [-1.17,1.17]){for(const z of [-1.35,1.16])piece(x,1.70,z,.12,1.02,.13,white);piece(x,1.35,-.1,.15,.13,2.53,dark);piece(x,1.78,-.65,.11,.95,.09,dark);}
    piece(0,1.70,1.18,2.27,.94,.055,[.29,.46,.54]);piece(0,2.14,1.215,2.14,.07,.04,[.68,.83,.88]);piece(0,1.77,-1.38,2.24,.77,.055,[.22,.36,.43]);piece(0,1.76,1.25,.055,.86,.055,white);
    for(const x of [-.80,.80]){piece(x,1.07,2.30,.38,.22,.09,[.95,.92,.74],.85);piece(x,1.02,-2.23,.28,.12,.075,[.94,.13,.08],.5);piece(x,2.5,.84,.26,.13,.12,[.95,.86,.65],.7);}
    for(const x of [-1.34,1.34]){for(const z of [-1.62,0,1.62]){piece(x,.52,z,.32,.52,.52,[.075,.105,.13],0,tire,car.elapsed*8);piece(x*1.14,.52,z,.025,.25,.25,[.46,.55,.60],0,tire,car.elapsed*8);}piece(x,.96,-.10,.11,.13,4.15,white);}
    piece(0,2.57,-.52,2.0,.18,.94,dark);piece(-.58,2.77,-.56,.78,.30,.78,[.32,.38,.35]);piece(.59,2.67,-.52,.56,.14,.75,[.57,.64,.62]);piece(-1.03,2.72,-1.2,.055,.83,.055,dark);piece(-1.03,3.17,-1.2,.11,.12,.11,[.9,.26,.1],.6);
    if(occupied){const passengers=[[hero,-.51,false],[james,.51,true]];for(const [list,seat,isJames] of passengers){const entity={x:car.x+Math.cos(car.yaw)*seat,z:car.z-Math.sin(car.yaw)*seat,yaw:car.yaw},pose=rig(entity,0,0,seed,isJames);pose.root=M.mul(base,M.t(seat,.22,-.15));for(const q of list){if(/thigh|shin|foot/.test(q.bone)||/pelvis|belt|hose|backpack|pants|hips/i.test(q.name))continue;draw(q,M.mul(pose.root,pose.bones[q.bone]||pose.bones.body),isJames?(q.mat?getWandererColor(q,jamesProfile):q.c):getWandererColor(q));}}}
  }
'''
if 'function polarRover(' not in s:s=s.replace(key,vehicle+key,1)
s=s.replace('const distance=5.4,p=s.cameraPitch;', 'const distance=s.car?.driving?9.5:5.4,p=s.cameraPitch;')
s=s.replace('    if(!introMode)character(s,hero,', '    if(s.car&&Math.hypot(s.car.x-s.x,s.car.z-s.z)<240)polarRover(s.car,s.seed,time,s.car.driving);\n    if(!introMode&&!s.car?.driving)character(s,hero,')
s=s.replace('    character(s.james,james,', '    if(!s.car?.driving)character(s.james,james,')
p.write_text(s,encoding='utf-8')
print('Added the polar rover mesh, seated occupants, follow camera, and voice controls.')
