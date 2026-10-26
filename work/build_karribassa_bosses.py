"""Two original articulated Imperial commanders, made from native 3D geometry."""
from pathlib import Path
import json, math
import build_pontifex_model as geometry
from build_pontifex_model import Builder, PIVOTS

work=Path(__file__).resolve().parent
BLACK='#10191e'; PLATE='#26353c'; EDGE='#50636b'; CYAN='#38e3e5'; DARK='#070d12'

def commander(female):
    b=Builder(); waist=.37 if female else .48; shoulder=.54 if female else .68
    def panel(name,c,size,bone='body',color=PLATE):
        b.oval(name+' bevel',c,[v*1.08 for v in size],EDGE,bone,e=.45,rows=5,cols=12)
        b.oval(name+' plate',[c[0],c[1],c[2]+.012],size,color,bone,e=.48,rows=6,cols=12)
    def glow(name,points,r=.018,bone='body'):
        b.tube(name,points,r,CYAN,bone,sides=7,emission=.85)
    b.oval('Sealed undersuit',[0,2.60,0],[waist+.06,.66,.26],BLACK,e=.65)
    b.oval('Hip section',[0,1.90,0],[waist+.09,.25,.27],DARK,e=.6)
    for side in [-1,1]:
        arm='leftArm' if side<0 else 'rightArm'; leg='leftLeg' if side<0 else 'rightLeg'
        x=side*(.29 if female else .35)
        b.tube('Articulated leg '+leg,[[x,1.96,0],[x,1.07,0],[x,.27,.03]],[.235,.19,.15],BLACK,leg,sides=14)
        for name,y,sizes in [('Thigh',1.52,[.215,.35,.13]),('Knee',1.04,[.19,.18,.14]),('Shin',.65,[.17,.28,.13])]:
            panel(name+' '+leg,[x,y,.17],sizes,leg)
        b.oval('Boot '+leg,[x,.18,.16],[.23,.19,.39],BLACK,leg,e=.5)
        panel('Toe cap '+leg,[x,.20,.40],[.21,.10,.16],leg)
        for i in range(5): b.oval('Boot tread '+leg+str(i),[x,.045,-.10+i*.13],[.235,.035,.025],EDGE,leg,e=.4,rows=3,cols=8)
        glow('Leg conduit '+leg,[[x+side*.14,1.78,.29],[x+side*.16,1.26,.30],[x+side*.13,1.17,.31]],.018,leg)
        glow('Shin conduit '+leg,[[x+side*.14,.93,.26],[x+side*.13,.43,.28],[x,.35,.35]],.017,leg)
        for y in [1.92,1.14]:
            b.oval('Joint socket '+leg+str(y),[x,y,-.01],[.245,.085,.23],EDGE,leg,rows=5,cols=12)
        b.tube('Sleeve '+arm,[[side*shoulder,3.10,0],[side*(shoulder+.12),2.64,0],[side*(shoulder+.15),2.12,.08]],[.20,.16,.135],BLACK,arm,sides=14)
        panel('Shoulder '+arm,[side*shoulder,3.10,.02],[.29,.22,.28],arm)
        panel('Forearm '+arm,[side*(shoulder+.15),2.36,.16],[.165,.27,.12],arm)
        b.oval('Elbow servo '+arm,[side*(shoulder+.12),2.65,.02],[.17,.14,.18],EDGE,arm,rows=6,cols=12)
        b.oval('Glove '+arm,[side*(shoulder+.15),2.00,.12],[.14,.18,.13],BLACK,arm)
        for finger in range(4):
            fx=side*(shoulder+.06+finger*.056)
            b.tube('Finger '+arm+str(finger),[[fx,2.01,.20],[fx,1.85,.22],[fx,1.81,.15]],[.025,.026,.018],BLACK,arm,sides=7)
            b.oval('Knuckle '+arm+str(finger),[fx,2.04,.235],[.03,.04,.018],EDGE,arm,rows=3,cols=6)
        b.tube('Thumb '+arm,[[side*(shoulder+.03),2.07,.12],[side*(shoulder-.01),1.95,.23],[side*(shoulder+.03),1.87,.20]],.034,BLACK,arm,sides=7)
        glow('Arm conduit '+arm,[[side*(shoulder+.16),2.61,.29],[side*(shoulder+.25),2.42,.29],[side*(shoulder+.23),2.17,.27]],.024,arm)
        for i in range(3): b.oval('Wrist armour fastener '+arm+str(i),[side*(shoulder+.14),2.18+i*.11,.292],[.10,.018,.012],EDGE,arm,rows=3,cols=8)
        b.tube('Shoulder power cable '+arm,[[side*.25,3.21,-.14],[side*.46,3.32,-.13],[side*(shoulder+.16),3.03,-.06]],[.026,.034,.023],EDGE,arm,sides=8)
    for side in [-1,1]:
        panel('Pectoral armour '+str(side),[side*(.205 if female else .24),2.94,.235],[.24 if female else .28,.27,.14])
        glow('Chest seam '+str(side),[[side*.07,3.18,.34],[side*.13,2.98,.39],[side*.28,2.78,.33],[side*(waist-.02),2.70,.25]])
        panel('Side rib '+str(side),[side*(waist-.01),2.51,.11],[.10,.23,.18])
        glow('Waist conduit '+str(side),[[side*(waist+.04),2.68,.23],[side*(waist-.04),2.43,.30],[side*.23,2.24,.28]])
    for i in range(3):panel('Abdominal segment '+str(i),[0,2.65-i*.15,.24],[waist-.12,.085,.08])
    b.poly('Cyan reactor crest',[[-.105,3.27],[.105,3.27],[.085,3.13],[0,3.08],[-.085,3.13]],.34,.025,CYAN,emission=.7)
    b.oval('Utility belt',[0,2.06,.0],[waist+.09,.10,.31],BLACK,e=.4)
    panel('Belt buckle',[0,2.06,.32],[.09,.085,.03],color=EDGE)
    for side in [-1,1]:panel('Belt pouch '+str(side),[side*.24,2.06,.29],[.09,.13,.07],color=BLACK)
    b.oval('Spinal power pack',[0,2.75,-.29],[.27,.41,.16],BLACK,e=.5)
    for i in range(4):glow('Backpack charge cell '+str(i),[[-.16,2.53+i*.14,-.43],[.16,2.53+i*.14,-.43]],.016)
    b.tube('Neck seal',[[0,3.13,0],[0,3.30 if female else 3.49,0]],.145 if female else .17,BLACK,'head',sides=16)
    if female:
        skin='#b88b70'; hair='#171a1a'
        b.oval('Malia exposed neck',[0,3.38,.015],[.135,.18,.135],skin,'head',rows=12,cols=20)
        b.oval('Malia face',[0,3.70,.025],[.26,.355,.245],skin,'head',rows=16,cols=28)
        b.oval('Malia jaw',[0,3.48,.09],[.185,.15,.17],skin,'head',rows=14,cols=24)
        b.oval('Malia clean chin',[0,3.405,.115],[.12,.075,.12],skin,'head',rows=12,cols=20)
        b.oval('Nose bridge',[0,3.70,.256],[.043,.095,.038],skin,'head',rows=7,cols=12)
        b.oval('Nose tip',[0,3.65,.28],[.055,.038,.038],skin,'head',rows=7,cols=12)
        for side in [-1,1]:
            b.oval('Ear '+str(side),[side*.26,3.67,.02],[.045,.09,.05],skin,'head',rows=7,cols=12)
            b.oval('Eye liner '+str(side),[side*.109,3.78,.244],[.077,.033,.025],hair,'head',rows=6,cols=14)
            b.oval('Eye white '+str(side),[side*.109,3.78,.263],[.063,.021,.012],'#ddd8cd','head',rows=6,cols=14)
            b.oval('Hazel iris '+str(side),[side*.108,3.78,.275],[.023,.022,.008],'#6c744a','head',rows=6,cols=12)
            b.oval('Pupil '+str(side),[side*.108,3.78,.282],[.010,.014,.003],DARK,'head',rows=5,cols=10)
            b.oval('Eye catchlight '+str(side),[side*.102,3.786,.286],[.004,.004,.002],'#f4ffff','head',rows=3,cols=6)
            b.tube('Eyebrow '+str(side),[[side*.05,3.85,.25],[side*.12,3.87,.25],[side*.185,3.84,.228]],.014,hair,'head',sides=8)
        b.tube('Upper lip',[[-.085,3.51,.264],[0,3.515,.282],[.085,3.51,.264]],.012,'#704f4c','head',sides=8)
        b.tube('Lower lip',[[-.074,3.502,.263],[0,3.492,.28],[.074,3.502,.263]],.012,'#90635d','head',sides=8)
        b.oval('Swept hair crown',[0,3.98,-.035],[.275,.19,.255],hair,'head',rows=10,cols=24)
        for i in range(18):
            a=math.pi*.10+i/17*math.pi*.80
            b.tube('Swept hair strand '+str(i),[[math.cos(a)*.24,3.98,.11],[math.cos(a)*.26,4.08,-.02],[math.cos(a)*.18,3.98,-.21],[.14,3.70,-.25]],[.024,.026,.022,.014],hair,'head',sides=7)
        for i in range(17):
            y=3.83-i*.068;x=.20+math.sin(i*.9)*.022;z=-.24+i*.018
            for j in range(3):
                a=j/3*math.tau+i*1.4
                b.oval('Braided hair '+str(i)+' '+str(j),[x+math.cos(a)*.03,y,z+math.sin(a)*.03],[.041,.052,.036],hair if j else '#30302a','head',rows=5,cols=8)
        b.oval('Braid tie',[.20,2.73,.05],[.051,.035,.05],EDGE,'head',rows=5,cols=10)
        b.oval('Right wrist weapon',[shoulder+.15,2.35,.30],[.09,.20,.11],BLACK,'rightArm',e=.45)
        b.tube('Wrist emitter barrel',[[shoulder+.15,2.32,.30],[shoulder+.15,2.04,.30]],.055,EDGE,'rightArm',sides=10)
        b.oval('Cyan muzzle',[shoulder+.15,2.03,.30],[.04,.012,.04],CYAN,'rightArm',emission=.9)
        b.tube('Comms microphone',[[.28,3.70,0],[.30,3.54,.16],[.18,3.51,.29]],.016,EDGE,'head',sides=7)
    else:
        b.oval('Helmet inner shell',[0,3.76,.01],[.31,.39,.28],DARK,'head',e=.8,rows=12,cols=24)
        for side in [-1,1]:
            b.poly('Helmet cheek '+str(side),[[side*.02,3.87],[side*.24,3.94],[side*.30,3.72],[side*.17,3.48],[side*.04,3.53]],.238,.07,PLATE,'head')
            b.poly('Cyan eye '+str(side),[[side*.04,3.82],[side*.20,3.85],[side*.17,3.76],[side*.06,3.75]],.303,.018,CYAN,'head',emission=.9)
            b.tube('Crown fin '+str(side),[[side*.17,3.97,.02],[side*.24,4.18,-.01],[side*.20,4.29,-.07]],[.08,.06,.002],EDGE,'head',sides=8)
            glow('Helmet circuit '+str(side),[[side*.25,3.94,.20],[side*.27,3.70,.26],[side*.11,3.46,.25]],.016,'head')
        b.poly('Centre face shield',[[-.065,3.80],[.065,3.80],[.11,3.55],[0,3.43],[-.11,3.55]],.30,.065,BLACK,'head')
        glow('Mask centre light',[[0,3.74,.35],[0,3.48,.35]],.012,'head')
        for side in [-1,1]:
            b.poly('Torn battle cloak '+str(side),[[side*.08,3.22],[side*.48,3.10],[side*.76,.46],[side*.56,.33],[side*.43,.57],[side*.31,.29],[side*.13,.60]],-.36,.035,BLACK,'cape')
            b.tube('Cloak seam '+str(side),[[side*.40,3.08,-.39],[side*.61,1.54,-.40],[side*.70,.52,-.39]],.016,EDGE,'cape',sides=7)
        b.oval('Cowl',[0,3.29,-.03],[.37,.14,.31],BLACK,'head',e=.5)
        # A four-bladed cyan energy scythe, held as one articulated weapon.
        bone='leftArm'; sx=-.95
        b.tube('Scythe staff',[[sx,.13,.20],[sx,5.49,.20]],.055,EDGE,bone,sides=12)
        for i in range(16): b.oval('Staff grip ring '+str(i),[sx,1.76+i*.065,.20],[.069,.019,.069],BLACK,bone,rows=4,cols=10)
        for i in range(4):
            y=4.15+i*.40
            outline=[[sx+.02,y+.13],[sx-.28,y+.27],[sx-.65,y+.24],[sx-1.06,y+.10],[sx-1.47,y-.16],[sx-1.71,y-.49],[sx-1.28,y-.16],[sx-.81,y+.01],[sx-.28,y+.02]]
            b.poly('Scythe blade '+str(i),outline,.20,.075,PLATE,bone,bevel=.016)
            glow('Scythe cutting edge '+str(i),[[sx-.22,y+.10,.25],[sx-.65,y+.12,.25],[sx-1.06,y-.03,.25],[sx-1.47,y-.29,.25],[sx-1.69,y-.47,.25]],.025,bone)
            b.oval('Blade coupling '+str(i),[sx,y+.10,.20],[.13,.13,.09],BLACK,bone,e=.5)
        glow('Staff charge line',[[sx,.21,.26],[sx,1.66,.26]],.019,bone)
        b.poly('Staff pommel',[[sx-.06,.26],[sx+.06,.26],[sx+.05,.05],[sx-.19,-.03],[sx-.10,.09]],.20,.06,PLATE,bone)
    if female:
        # Keep the outer face visible with back-face culling. The shared oval
        # primitive winds inward, exposing the dark neck through the chin.
        for part in b.parts:
            if part['bone']!='head':
                continue
            for j in range(0,len(part['indices']),3):
                ids=part['indices'][j:j+3]
                vertices=[part['p'][i*3:i*3+3] for i in ids]
                u=[vertices[1][k]-vertices[0][k] for k in range(3)]
                v=[vertices[2][k]-vertices[0][k] for k in range(3)]
                normal=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]]
                outward=[sum(part['n'][i*3+k] for i in ids) for k in range(3)]
                if sum(normal[k]*outward[k] for k in range(3))<0:
                    part['indices'][j+1],part['indices'][j+2]=part['indices'][j+2],part['indices'][j+1]
    pivots={**PIVOTS,'leftArm':[-shoulder,3.10,0],'rightArm':[shoulder,3.10,0],'leftLeg':[-.29 if female else -.35,1.83,0],'rightLeg':[.29 if female else .35,1.83,0]}
    return {'name':'Malia de Toro' if female else 'Croxian Mascar','faction':'TERRA','meshes':b.parts,'pivots':pivots,'height':4.30,'design':'Original articulated cyan-and-black Imperial commander geometry.'}

models={'malia':commander(True),'croxian':commander(False)}
for key,m in models.items():
    geometry.PIVOTS=m['pivots']
    geometry.export_glb(m,'NOSTRAVECTOR_'+('Malia_de_Toro' if key=='malia' else 'Croxian_Mascar')+'.glb')
    print(m['name'],len(m['meshes']),'parts',sum(len(p['indices'])//3 for p in m['meshes']),'triangles')
(work/'karribassa_boss_models.js').write_text('const KarribassaBossModels='+json.dumps(models,separators=(',',':'))+';\n',encoding='utf-8')
