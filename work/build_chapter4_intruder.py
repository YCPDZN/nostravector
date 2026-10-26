"""Articulated, original ship intruder: ribbed carapace, red eyes and barbed tail."""
from pathlib import Path
import json, math
import build_pontifex_model as geometry
from build_pontifex_model import Builder, cross

work=Path(__file__).resolve().parent
b=Builder()
BLACK='#111b21'; DARK='#060b10'; EDGE='#425258'; RIDGE='#283a40'; RED='#fa242e'; IVORY='#9fa293'
pivots={'body':[0,2.2,0],'head':[0,3.47,0],'eyes':[0,3.47,0],'jaw':[0,3.73,.23],'leftArm':[-.68,3.14,0],'rightArm':[.68,3.14,0],'leftLeg':[-.33,1.87,0],'rightLeg':[.33,1.87,0],'tail':[0,1.98,-.23]}
def oval(name,c,size,color=BLACK,bone='body',rows=7,cols=14,emission=0):
    b.oval(name,c,size,color,bone,e=.78,rows=rows,cols=cols,emission=emission)
def line(name,points,r=.025,color=RIDGE,bone='body',emission=0):
    b.tube(name,points,r,color,bone,sides=8,emission=emission)
def spike(name,start,tip,r=.08,bone='body',color=BLACK):
    mid=[start[i]*.42+tip[i]*.58 for i in range(3)]
    b.tube(name,[start,mid,tip],[r,r*.53,.003],color,bone,sides=9)

oval('Thoracic carapace',[0,2.77,-.02],[.53,.65,.28])
oval('Narrow abdomen',[0,2.24,0],[.30,.40,.23],DARK)
oval('Pelvic shell',[0,1.93,-.03],[.43,.25,.27])
for side in [-1,1]:
    for i in range(7):
        y=3.12-i*.115
        points=[[side*.025,y,.29],[side*.20,y-.10,.36],[side*.43,y-.14,.26],[side*.51,y-.07,.03]]
        line('Interlocking rib '+str(side)+' '+str(i),points,.045 if i<3 else .034)
        line('Rib edge '+str(side)+' '+str(i),[[p[0],p[1]+.025,p[2]+.018] for p in points],.010,EDGE)
    for i in range(6):
        oval('Abdominal lamella '+str(side)+str(i),[side*.13,2.57-i*.10,.225],[.14,.045,.035],RIDGE,rows=4,cols=10)
    arm='leftArm' if side<0 else 'rightArm'; leg='leftLeg' if side<0 else 'rightLeg'
    line('Sinewed arm '+arm,[[side*.62,3.15,0],[side*.91,2.65,-.04],[side*.97,2.03,.10]],[.22,.17,.12],BLACK,arm)
    for j in range(6):
        y=3.13-j*.16;x=side*(.68+j*.055)
        oval('Arm chitin '+arm+str(j),[x,y,.07],[.23-j*.012,.11,.17],RIDGE,arm,rows=5,cols=12)
        line('Arm ridge '+arm+str(j),[[x-side*.13,y+.06,.18],[x,y+.12,.21],[x+side*.13,y,.11]],.016,EDGE,arm)
    for j in range(3):spike('Shoulder horn '+arm+str(j),[side*(.57+j*.13),3.22-j*.09,-.04],[side*(.67+j*.21),3.68-j*.15,-.18],.11,arm)
    for j in range(4):spike('Forearm thorn '+arm+str(j),[side*(.98+j*.015),2.51-j*.13,-.01],[side*(1.20+j*.02),2.60-j*.14,-.12],.065,arm)
    oval('Clawed palm '+arm,[side*.99,1.88,.12],[.18,.23,.10],BLACK,arm)
    for j in range(4):
        x=side*(.86+j*.085);y=1.80-abs(1.5-j)*.035
        line('Finger tendon '+arm+str(j),[[x,y,.17],[x+side*.035,y-.21,.25],[x+side*.06,y-.34,.16]],[.039,.030,.020],RIDGE,arm)
        spike('Hooked talon '+arm+str(j),[x+side*.06,y-.34,.16],[x+side*.025,y-.45,.34],.036,arm,IVORY)
    line('Opposing thumb '+arm,[[side*.83,1.95,.10],[side*.74,1.78,.21],[side*.77,1.62,.33]],[.052,.037,.009],BLACK,arm)
    x=side*.33
    line('Digitigrade leg '+leg,[[x,1.99,-.04],[side*.49,1.16,.11],[side*.38,.55,-.21],[side*.43,.15,.06]],[.28,.24,.13,.15],BLACK,leg)
    oval('Thigh shell '+leg,[side*.42,1.53,.08],[.28,.40,.22],RIDGE,leg)
    for j in range(7):
        y=1.85-j*.12
        line('Thigh striation '+leg+str(j),[[side*.24,y,.22],[side*.40,y-.10,.30],[side*.57,y-.15,.16]],.022,EDGE if j%3==0 else BLACK,leg)
    for j in range(4):oval('Shin scute '+leg+str(j),[side*.40,.95-j*.13,-.07],[.17,.09,.16],RIDGE,leg,rows=5,cols=10)
    oval('Splayed foot '+leg,[side*.43,.13,.20],[.24,.13,.33],BLACK,leg)
    for j in range(3):spike('Foot claw '+leg+str(j),[side*(.29+j*.13),.13,.40],[side*(.25+j*.16),.06,.69],.09,leg,IVORY)
    spike('Knee barb '+leg,[side*.56,1.13,.12],[side*.78,1.34,.09],.11,leg)

oval('Elongated skull',[0,3.83,0],[.46,.50,.34],BLACK,'head',rows=12,cols=22)
oval('Mouth darkness',[0,3.56,.29],[.28,.21,.12],DARK,'head')
oval('Lower mandible',[0,3.48,.24],[.30,.17,.20],RIDGE,'jaw')
for side in [-1,1]:
    oval('Eye socket '+str(side),[side*.235,3.91,.285],[.205,.215,.13],DARK,'head',rows=9,cols=18)
    oval('Crimson compound eye '+str(side),[side*.235,3.91,.377],[.135,.163,.060],RED,'eyes',rows=10,cols=18,emission=.55)
    line('Vertical pupil '+str(side),[[side*.235,3.78,.428],[side*.235,4.04,.428]],.018,DARK,'eyes')
    for j in range(5):
        line('Eye lens vein '+str(side)+str(j),[[side*(.14+j*.035),3.84,.421],[side*(.14+j*.035),3.96,.425]],.003,'#ff8b7c','eyes',.25)
    line('Swept brow '+str(side),[[side*.02,4.13,.27],[side*.20,4.17,.36],[side*.41,4.09,.22]],.062,RIDGE,'head')
    line('Cheek blade '+str(side),[[side*.42,3.94,.13],[side*.40,3.72,.28],[side*.24,3.47,.36]],.056,RIDGE,'head')
    for j in range(3):spike('Crown horn '+str(side)+str(j),[side*(.18+j*.11),4.15-j*.06,-.09],[side*(.26+j*.18),4.65-j*.12,-.25],.105,'head')
    for j in range(4):line('Temporal rib '+str(side)+str(j),[[side*.42,4.12-j*.13,.03],[side*.45,4.01-j*.13,-.19],[side*.24,3.98-j*.13,-.32]],.022,EDGE,'head')
for j in range(13):
    x=-.25+j*.042;length=.105 if j%2 else .145
    spike('Upper needle tooth '+str(j),[x,3.66,.406],[x,3.66-length,.426],.018,'head',IVORY)
    spike('Lower needle tooth '+str(j),[x,3.39,.405],[x,3.39+length*.85,.423],.016,'jaw',IVORY)
for j in range(10):
    y=4.37-j*.245
    oval('Dorsal vertebra '+str(j),[0,y,-.29],[.10,.10,.10],EDGE,'head' if j<2 else 'body',rows=5,cols=10)
    if j>1:spike('Dorsal barb '+str(j),[0,y,-.30],[0,y+.12,-.65],.095)
tail=[]
for j in range(37):
    t=j/36;tail.append([math.sin(t*3.9)*1.15,1.98-t*1.65,-.25-t*2.35])
b.tube('Segmented sweeping tail',tail,[.18*(1-j/40)+.016 for j in range(37)],BLACK,'tail',sides=12)
for j in range(0,35,2):
    p=tail[j];oval('Tail ring '+str(j),p,[.16*(1-j/42),.075,.13],RIDGE,'tail',rows=4,cols=10)
    spike('Tail barb '+str(j),[p[0],p[1]+.06,p[2]],[p[0],p[1]+.30-j*.004,p[2]-.13],.065,'tail')
spike('Terminal tail blade',tail[-2],[tail[-1][0]-.42,tail[-1][1]+.17,tail[-1][2]-.27],.14,'tail',EDGE)
for part in b.parts:
    faces=[]
    for j in range(0,len(part['indices']),3):
        ids=part['indices'][j:j+3];p=[part['p'][i*3:i*3+3] for i in ids];n=cross([p[1][k]-p[0][k] for k in range(3)],[p[2][k]-p[0][k] for k in range(3)])
        if sum(v*v for v in n)<1e-18:continue
        if sum(n[k]*sum(part['n'][i*3+k] for i in ids) for k in range(3))<0:ids[1],ids[2]=ids[2],ids[1]
        faces+=ids
    part['indices']=faces
model={'name':'Unknown ship intruder','meshes':b.parts,'pivots':pivots,'height':4.65}
(work/'chapter4_intruder_model.js').write_text('const Chapter4IntruderModel='+json.dumps(model,separators=(',',':'))+';\n',encoding='utf-8')
geometry.PIVOTS=pivots
geometry.export_glb(model,'NOSTRAVECTOR_Chapter4_Intruder.glb')
print('Intruder:',len(b.parts),'articulated meshes;',sum(len(p['indices'])//3 for p in b.parts),'triangles')
