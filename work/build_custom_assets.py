from pathlib import Path
import json,math,re,struct,shutil
import numpy as np
root=Path(__file__).resolve().parents[1];work=root/'work'
source=Path('C:/Users/HOME/Documents/Codex/2026-10-10/make/work/build_astronaut.py').read_text(encoding='utf-8')
geometry=source[source.index('parts = []'):source.index('# +Y is up.')]
scope=dict(np=np,math=math);exec(geometry,scope)
shape=scope['shape'];tube=scope['tube'];groups={}
def capture(group,fn):
    scope['parts'].clear();fn()
    groups[group]=[dict(name=q['name'],p=q['p'].round(6).tolist(),n=q['n'].round(6).tolist(),f=q['f'].flatten().tolist(),mat=q['mat']) for q in scope['parts']]
def head():
    shape('Face',[0,1.665,0],[.212,.25,.185],'skin',.79,n=32,m=20)
    shape('Jaw',[0,1.505,.015],[.142,.079,.133],'skin',.72,n=24,m=12)
    shape('Nose',[0,1.648,.188],[.026,.043,.046],'skin',.8,n=18,m=12)
    shape('Neck',[0,1.437,0],[.075,.10,.073],'skin',.8,n=20,m=12)
capture('head',head)
def haircap():
    # A cap trimmed above the forehead, leaving the face visible.
    p=[];f=[];n=32;m=12
    for j in range(m+1):
        lat=.38+(math.pi/2-.38)*j/m
        for i in range(n):
            lon=2*math.pi*i/n
            power=lambda v:math.copysign(abs(v)**.79,v)
            p.append([.222*power(math.cos(lat))*power(math.cos(lon)),1.665+.267*power(math.sin(lat)),.197*power(math.cos(lat))*power(math.sin(lon))])
    for j in range(m):
        for i in range(n):
            a=j*n+i;b=j*n+(i+1)%n;c=(j+1)*n+i;d=(j+1)*n+(i+1)%n
            f.extend([[a,c,b],[b,c,d]])
    scope['add']('Hair cap',p,f,'hair')
    for s in [-1,1]:shape('Sideburn '+str(s),[s*.197,1.765,.01],[.026,.07,.075],'hair',.68,n=16,m=10)
def hair(style):
    if style=='bald':return
    haircap()
    if style=='swept':
        R=np.array([[math.cos(.17),-math.sin(.17),0],[math.sin(.17),math.cos(.17),0],[0,0,1]])
        shape('Swept fringe',[-.025,1.804,.137],[.157,.045,.039],'hair',.45,n=24,m=12,rotation=R)
        shape('Swept crown',[-.048,1.893,.00],[.142,.051,.122],'hair',.7,n=24,m=12)
    elif style=='bob':
        shape('Bob fringe',[0,1.821,.164],[.171,.028,.038],'hair',.55,n=24,m=12)
        for s in [-1,1]:shape('Bob side '+str(s),[s*.195,1.631,-.014],[.052,.217,.116],'hair',.65,n=20,m=16)
        shape('Bob back',[0,1.67,-.133],[.177,.23,.069],'hair',.7,n=24,m=16)
    elif style=='ponytail':
        shape('Hair tie',[0,1.817,-.197],[.049,.046,.047],'trim',n=16,m=10)
        shape('Ponytail',[0,1.653,-.239],[.072,.167,.069],'hair',.8,n=20,m=16)
    elif style=='curly':
        for i in range(15):
            t=i*2*math.pi/15
            shape('Curl '+str(i),[.161*math.cos(t),1.839+.047*math.sin(t*2),.133*math.sin(t)],[.075,.061,.065],'hair',.85,n=14,m=10)
        shape('Curls crown',[0,1.914,0],[.153,.075,.136],'hair',.8,n=22,m=12)
for style in ['cropped','swept','bob','ponytail','curly','bald']:capture('hair_'+style,lambda st=style:hair(st))
def eyes(style):
    ey=.030 if style=='round' else .023 if style=='relaxed' else .018
    for s in [-1,1]:
        R=None
        if style=='focused':
            a=-s*.12;R=np.array([[math.cos(a),-math.sin(a),0],[math.sin(a),math.cos(a),0],[0,0,1]])
        shape('Eye white '+str(s),[s*.076,1.705,.172],[.052,ey,.026],'white',.76,n=22,m=12,rotation=R)
        shape('Iris '+str(s),[s*.074,1.705,.199],[.020,ey*.78,.006],'iris',.95,n=18,m=10)
        shape('Pupil '+str(s),[s*.074,1.705,.205],[.009,ey*.59,.003],'black',n=16,m=10)
        shape('Eye glint '+str(s),[s*.074-.005,1.712,.208],[.0045,.0045,.002],'white',n=12,m=8)
        path=[[s*.035,1.759,.178],[s*.067,1.770,.186],[s*.109,1.761,.166]]
        tube('Eyebrow '+str(s),path,.008,'hair',n=8)
for style in ['relaxed','round','focused']:capture('eyes_'+style,lambda st=style:eyes(st))
def mouth(style):
    if style=='grin':
        shape('Grin outline',[0,1.55,.178],[.061,.024,.014],'black',.69,n=24,m=12)
        shape('Grin teeth',[0,1.556,.194],[.052,.011,.003],'white',.55,n=24,m=10)
    else:
        p=[]
        for x in np.linspace(-.056,.056,13):
            y=1.551+(.020*(x/.056)**2 if style=='smile' else 0)
            z=.186-.013*(abs(x)/.056)**2
            p.append([x,y,z])
        tube('Mouth '+style,p,.0055,'black',n=8)
for style in ['neutral','smile','grin']:capture('mouth_'+style,lambda st=style:mouth(st))
def ears(style):
    for s in [-1,1]:
        if style=='pointed':
            shape('Pointed ear '+str(s),[s*.221,1.689,0],[.055,.091,.030],'skin',.8,n=18,m=12)
            p=[[s*.197,1.69,-.01],[s*.264,1.783,0],[s*.265,1.67,.01],[s*.198,1.63,.025]]
            scope['add']('Ear tip '+str(s),p,[[0,1,2],[0,2,3]] if s>0 else [[0,2,1],[0,3,2]],'skin')
        else:
            scale=.72 if style=='small' else 1
            shape('Ear '+str(s),[s*.214,1.671,-.006],[.035*scale,.061*scale,.026],'skin',.78,n=18,m=12)
        shape('Ear inner '+str(s),[s*.23,1.671,.018],[.012,.031 if style!='small' else .021,.004],'ear_inner',.85,n=16,m=10)
for style in ['rounded','small','pointed']:capture('ears_'+style,lambda st=style:ears(st))
(work/'face_parts.json').write_text(json.dumps(groups,separators=(',',':')),encoding='utf-8')

def mp3_duration(path):
    b=path.read_bytes();pos=0;duration=0;frames=0
    if b[:3]==b'ID3':pos=10+sum((b[6+i]&127)<<(7*(3-i)) for i in range(4))
    while pos+4<len(b):
        h=int.from_bytes(b[pos:pos+4],'big')
        ver=(h>>19)&3;layer=(h>>17)&3;bi=(h>>12)&15;si=(h>>10)&3
        if h>>21!=0x7ff or ver==1 or layer!=1 or not 0<bi<15 or si==3:
            pos+=1;continue
        rates=[44100,48000,32000];rate=rates[si]//(1 if ver==3 else 2 if ver==2 else 4)
        kb=([0,32,40,48,56,64,80,96,112,128,160,192,224,256,320] if ver==3 else [0,8,16,24,32,40,48,56,64,80,96,112,128,144,160])[bi]
        length=(144000 if ver==3 else 72000)*kb//rate+((h>>9)&1)
        if pos+length>len(b):break
        duration+=(1152 if ver==3 else 576)/rate;frames+=1;pos+=length
    assert frames>20 and duration>1,path
    return round(duration,4)

audio_dir=work/'audio';audio_dir.mkdir(exist_ok=True)
quotes=json.loads((work/'intro_quotes.json').read_text(encoding='utf-8'))
for i,q in enumerate(quotes,1):
    src=Path('C:/Users/HOME/Documents/NOSTRAVECTOR/INTRODUCTION')/(str(i)+'.mp3')
    shutil.copyfile(src,audio_dir/src.name)
    q['audio_file']='audio/'+src.name;q['voice_duration']=mp3_duration(src);q['duration']=round(q['voice_duration']+1.35,4)
(work/'intro_quotes.json').write_text(json.dumps(quotes,indent=2),encoding='utf-8')
print('Generated custom face geometry:',len(groups),'groups; voice durations:',[q['voice_duration'] for q in quotes])
