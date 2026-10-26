"""Two articulated Archamus assets. Only the hooded variant ships in Archiostal."""
from pathlib import Path
import json, math, shutil, struct
import build_pontifex_model as geometry
from build_pontifex_model import Builder, mirror, cross

ROOT=Path(__file__).resolve().parents[1]
WORK,OUT=ROOT/'work',ROOT/'outputs'
GOLD='#a98536'; EDGE='#d4bd7b'; DARK='#171d20'; IRON='#424b4b'; CLOTH='#a89976'; SHADOW='#302b23'
PIVOTS={'body':[0,2.3,0],'head':[0,3.5,0],'leftArm':[-.85,3.15,0],'rightArm':[.85,3.15,0],'leftLeg':[-.4,1.85,0],'rightLeg':[.4,1.85,0],'eyes':[0,4.07,.2],'weapon':[-1.13,2.03,.12],'cape':[0,3.35,-.4]}

def hood(b):
    # A genuine open-front cloth shell. The opening hides all anatomy.
    p=[];n=[];faces=[];rows=16;cols=36
    for j in range(rows+1):
        v=j/rows;y=3.33+v*1.2;width=.70*(1-.78*v**3)
        for i in range(cols+1):
            a=math.pi*.18+i/cols*math.pi*1.64
            ripple=1+.035*math.sin(i*1.9+j*.7)
            p.append([math.sin(a)*width*ripple,y+.08*math.cos(a),math.cos(a)*(.50-.25*v)*ripple-.03])
            n.append([math.sin(a),.25,math.cos(a)])
    for j in range(rows):
        for i in range(cols):
            a=j*(cols+1)+i;d=a+cols+1;faces.extend([a,d,a+1,a+1,d,d+1])
    b.add('Weathered cloth hood shell',p,n,faces,CLOTH,'head')
    for side in [-1,1]:
        b.tube('Hood opening stitched rim '+str(side),[[side*.15,4.49,.19],[side*.35,4.20,.37],[side*.50,3.91,.47],[side*.61,3.57,.46],[side*.41,3.42,.53]],[.032,.026,.027,.036,.027],EDGE,'head',sides=8)
        b.poly('Hood hanging fold '+str(side),mirror([[.30,3.39],[.58,3.41],[.77,3.58],[.55,3.79],[.47,4.0],[.35,3.76]],side),.43,.045,CLOTH,'head',.01)
    b.tube('Crown cloth seam',[[-.12,4.46,-.09],[0,4.53,-.08],[.12,4.46,-.09]],.024,CLOTH,'head',sides=8)
    for i in range(3):b.tube('Layered cowl fold '+str(i),[[-.60,3.56-i*.05,.30],[-.40,3.40-i*.05,.52],[0,3.30-i*.05,.57],[.40,3.40-i*.05,.52],[.60,3.56-i*.05,.30]],[.07,.075,.07,.075,.07],CLOTH,'head',sides=10)
    b.oval('Recessed shadow under hood',[0,3.91,-.035],[.36,.40,.25],'#090c0d','head')
    b.plate('Angular gold respirator',[[-.26,3.64],[-.28,3.96],[-.15,4.08],[.15,4.08],[.28,3.96],[.26,3.64],[0,3.53]],.26,GOLD,'head',.07)
    for side in [-1,1]:
        b.oval('Recessed amber eye '+str(side),[side*.145,4.18,.27],[.085,.035,.03],'#b78839','eyes',rows=6,cols=12,emission=.25)
        for i in range(5):b.tube('Respirator vent '+str(side)+'-'+str(i),[[side*.06,3.70+i*.045,.312],[side*.18,3.75+i*.035,.312]],.013,DARK,'head',sides=6)

def build(unhooded=False):
    b=Builder();b.oval('Armour flexible undersuit',[0,2.52,0],[.73,.91,.44],DARK,e=.6)
    b.oval('Armoured pelvis',[0,1.90,0],[.61,.30,.42],IRON,e=.55)
    b.oval('Layered cuirass gold shell',[0,2.86,.05],[.86,.66,.49],GOLD,e=.5,rows=12,cols=24)
    b.plate('Original solar crest breastplate',[[-.65,2.84],[-.63,3.27],[0,3.43],[.63,3.27],[.65,2.84],[0,2.65]],.39,GOLD,'body',.1)
    for i in range(4):b.oval('Abdominal overlapping plate '+str(i),[0,2.58-i*.145,.16],[.62-i*.035,.13,.35],GOLD,e=.45)
    b.oval('Dark utility belt',[0,1.98,.04],[.70,.14,.46],DARK,e=.45)
    b.oval('Circular belt clasp',[0,1.98,.49],[.17,.15,.05],IRON,rows=8,cols=16)
    for side in [-1,1]:
        tag='Left' if side<0 else 'Right';arm='leftArm' if side<0 else 'rightArm';leg='leftLeg' if side<0 else 'rightLeg';x=side*.43
        b.tube(tag+' jointed leg',[[x,1.9,0],[x,1.14,.02],[x,.25,.09]],[.31,.27,.22],DARK,leg,sides=16)
        b.oval(tag+' thigh gold plate',[x,1.51,.10],[.40,.46,.39],GOLD,leg,e=.5)
        b.oval(tag+' knee bearing',[x,1.08,.28],[.33,.27,.25],IRON,leg,e=.65)
        b.oval(tag+' knee gold cap',[x,1.11,.38],[.26,.22,.14],GOLD,leg,e=.45)
        b.oval(tag+' broad greave',[x,.67,.10],[.36,.48,.34],GOLD,leg,e=.45)
        b.oval(tag+' heavy boot',[x,.18,.27],[.38,.21,.53],GOLD,leg,e=.38)
        b.oval(tag+' tread sole',[x,.04,.27],[.39,.04,.55],DARK,leg,e=.35,rows=5,cols=12)
        for k in range(5):b.oval(tag+' sole tread '+str(k),[x,.025,-.08+k*.17],[.40,.025,.035],IRON,leg,e=.4,rows=4,cols=8)
        b.tube(tag+' armature',[[side*.82,3.17,0],[side*1.1,2.64,.04],[side*1.15,2.04,.20]],[.31,.23,.20],DARK,arm,sides=16)
        b.oval(tag+' oversize shoulder shell',[side*1.00,3.21,0],[.57,.42,.49],IRON,arm,e=.55)
        b.oval(tag+' gold shoulder plate',[side*1.02,3.26,.17],[.53,.35,.43],GOLD,arm,e=.45,rows=10,cols=20)
        b.plate(tag+' shoulder bevel',mirror([[.60,3.04],[.66,3.46],[1.12,3.60],[1.51,3.38],[1.49,2.99],[1.13,2.86]],side),.30,GOLD,arm,.10)
        b.oval(tag+' elbow mechanism',[side*1.14,2.57,.09],[.29,.24,.29],IRON,arm,e=.55)
        b.oval(tag+' gold forearm shell',[side*1.17,2.38,.16],[.30,.36,.30],GOLD,arm,e=.45)
        b.oval(tag+' gauntlet',[side*1.16,1.99,.23],[.25,.23,.23],DARK,arm,e=.55)
        for f in range(4):
            fx=side*(1.00+f*.105)
            b.oval(tag+' articulated finger '+str(f),[fx,1.85,.32],[.055,.17,.075],GOLD,arm,e=.6,rows=6,cols=10)
            if unhooded:b.tube(tag+' silver claw '+str(f),[[fx,1.76,.34],[fx,1.53,.40],[fx,1.41,.49]],[.046,.032,.002],'#bfc8c5',arm,sides=8)
        b.oval(tag+' shoulder piston',[side*.73,3.51,-.18],[.15,.30,.15],IRON,arm,e=.45)
        for k in range(3):b.tube(tag+' exposed joint hose '+str(k),[[side*(.73+k*.08),2.91,.17],[side*(.85+k*.08),2.66,.24],[side*(.94+k*.08),2.37,.25]],.025,DARK,arm,sides=8)
        for k in range(10):
            xx=side*(.71+(k%4)*.18);yy=3.1+(k//4)*.13
            b.oval(tag+' shoulder rivet '+str(k),[xx,yy,.67],[.027,.027,.02],EDGE,arm,rows=5,cols=8)
        for k in range(14):
            xx=x+(k%4-1.5)*.12;yy=.39+(k//4)*.13
            b.tube(tag+' greave worn paint '+str(k),[[xx,yy,.432],[xx+.04,yy+.025,.437]],.008,DARK,leg,sides=5)
        b.oval(tag+' rear reactor housing',[side*.49,3.15,-.50],[.34,.56,.31],IRON,e=.45)
        for k in range(5):b.oval(tag+' backpack grille '+str(k),[side*.49,2.88+k*.13,-.79],[.22,.025,.018],DARK,e=.4,rows=4,cols=8)
    # Bevelled pec plates, vents and equipment break up the heavy cuirass.
    for side in [-1,1]:
        b.plate('Divided upper chest plate '+str(side),mirror([[.06,2.88],[.06,3.17],[.28,3.34],[.64,3.24],[.73,3.02],[.49,2.85]],side),.51,EDGE,'body',.075)
        for k in range(4):b.tube('Lower chest vent '+str(side)+'-'+str(k),[[side*(.42+k*.055),2.78,.44],[side*(.46+k*.055),2.86,.45]],.018,DARK,sides=6)
        for k in range(6):b.tube('Chest paint scar '+str(side)+'-'+str(k),[[side*(.17+(k%3)*.16),2.99+(k//3)*.13,.557],[side*(.23+(k%3)*.16),3.02+(k//3)*.13,.559]],.006,SHADOW,sides=5)
        b.oval('Utility ammunition pouch '+str(side),[side*.56,1.98,.43],[.14,.20,.11],SHADOW,e=.4)
        b.oval('Utility pouch clasp '+str(side),[side*.56,1.99,.546],[.035,.065,.012],IRON,e=.4,rows=5,cols=8)
        for k in range(3):b.tube('Boot articulated toe seam '+str(side)+'-'+str(k),[[side*.43-.24,.20,.56+k*.07],[side*.43,.22,.57+k*.07],[side*.43+.24,.20,.56+k*.07]],.015,DARK,'leftLeg' if side<0 else 'rightLeg',sides=7)
    if unhooded:
        b.oval('Avian neck feather collar',[0,3.51,.02],[.35,.32,.31],'#766344','head')
        b.oval('Unhooded avian cranium',[0,3.98,.01],[.33,.40,.32],'#9b855c','head',rows=12,cols=24)
        b.tube('Hooked avian beak',[[0,4.02,.28],[0,3.93,.48],[0,3.72,.50],[0,3.62,.42]],[.17,.15,.07,.003],GOLD,'head',sides=8)
        for side in [-1,1]:
            b.oval('Amber avian eye '+str(side),[side*.23,4.08,.36],[.08,.065,.045],'#f29e32','eyes',rows=8,cols=12,emission=.3)
            b.oval('Avian pupil '+str(side),[side*.23,4.08,.407],[.027,.042,.013],'#121a18','eyes',rows=6,cols=10)
            for k in range(4):b.tube('Layered cheek feather '+str(side)+'-'+str(k),[[side*(.15+k*.036),4.02-k*.06,.16],[side*(.30+k*.018),3.88-k*.05,.17],[side*(.25+k*.012),3.60-k*.035,.12]],[.08,.07,.002],'#7c6945','head',sides=8)
            b.tube('Dark swept brow '+str(side),[[side*.10,4.21,.24],[side*.26,4.16,.29],[side*.34,4.08,.18]],.035,DARK,'head',sides=8)
            for k in range(4):b.tube('Crest feather '+str(side)+'-'+str(k),[[side*.12,4.20,-.04],[side*(.10+k*.055),4.58-k*.05,-.10-k*.04],[side*(.06+k*.09),4.72-k*.045,-.19-k*.04]],[.10,.07,.002],SHADOW,'head',sides=8)
            b.tube('Back-mounted gold fin '+str(side),[[side*.73,3.51,-.36],[side*1.13,4.16,-.25],[side*1.47,4.68,-.18]],[.16,.13,.009],EDGE,sides=8)
            b.plate('Folded metallic wing blade '+str(side),mirror([[1.0,3.1],[1.47,3.18],[1.78,1.77],[1.29,2.19]],side),-.46,GOLD,'cape',.09)
            for k in range(3):b.tube('Boot talon '+str(side)+'-'+str(k),[[side*.43+(k-1)*.19,.19,.57],[side*.43+(k-1)*.22,.10,.80],[side*.43+(k-1)*.22,.06,.92]],[.09,.06,.002],EDGE,'leftLeg' if side<0 else 'rightLeg',sides=8)
            for k in range(3):b.oval('Green gauntlet conduit '+str(side)+'-'+str(k),[side*(1.02+k*.10),2.17,.45],[.024,.11,.025],'#62b79b','leftArm' if side<0 else 'rightArm',rows=5,cols=8,emission=.2)
        b.oval('Reactor dark bezel',[0,3.14,.54],[.21,.21,.055],IRON,rows=12,cols=20)
        b.oval('Magenta chest reactor',[0,3.14,.60],[.14,.14,.045],'#df75da',rows=12,cols=20,emission=.5)
    else:
        hood(b)
        for side in [-1,1]:
            for k in range(4):b.poly('Weathered cloak strip '+str(side)+'-'+str(k),mirror([[.12+k*.2,3.37],[.36+k*.21,3.36],[.65+k*.18,.26+(k%2)*.17],[.43+k*.18,.40],[.29+k*.18,.17],[.15+k*.17,.34]],side),-.43-k*.018,.045,CLOTH,'cape',.008)
            for k in range(4):b.poly('Torn tabard '+str(side)+'-'+str(k),mirror([[.03+k*.095,1.96],[.145+k*.095,1.96],[.18+k*.12,.45+(k%2)*.13],[.07+k*.12,.35+(k%3)*.1]],side),.49,.03,CLOTH,'cape',.008)
            for k in range(5):b.tube('Cloth stitched fold '+str(side)+'-'+str(k),[[side*(.11+k*.06),1.80,.526],[side*(.13+k*.07),1.10,.53],[side*(.15+k*.08),.58,.53]],.009,SHADOW,'cape',sides=5)
        for k in range(11):
            a=k/10*math.pi;b.oval('Belt chain link '+str(k),[-.40+math.cos(a)*.34,1.87-math.sin(a)*.18,.55],[.045,.03,.014],IRON,rows=5,cols=8)
        b.oval('Original sun medallion',[0,3.23,.55],[.14,.14,.04],EDGE,rows=10,cols=20)
        for side in [-1,1]:
            for k in range(5):b.tube('Chest feather insignia '+str(side)+'-'+str(k),[[side*.16,3.24-k*.025,.53],[side*(.25+k*.043),3.31-k*.03,.51]],.023,IRON,sides=7)
        b.tube('Long hammer shaft',[[-1.16,2.13,.25],[-1.52,.58,.41]],.065,IRON,'weapon',sides=14)
        b.oval('Dark square warhammer head',[-1.56,.57,.43],[.40,.33,.30],IRON,'weapon',e=.3,rows=8,cols=16)
        b.oval('Warhammer bevel inset',[-1.56,.57,.735],[.27,.22,.025],DARK,'weapon',e=.4,rows=6,cols=12)
        for k in range(8):b.oval('Hammer grip wrap '+str(k),[-1.19-k*.022,1.98-k*.09,.265+k*.01],[.078,.025,.078],SHADOW,'weapon',rows=4,cols=10)
    # Correct winding; retain separate articulated surfaces and readable names.
    for q in b.parts:
        faces=[]
        for j in range(0,len(q['indices']),3):
            ids=q['indices'][j:j+3];ps=[q['p'][i*3:i*3+3] for i in ids];n=cross([ps[1][k]-ps[0][k] for k in range(3)],[ps[2][k]-ps[0][k] for k in range(3)])
            if sum(v*v for v in n)<1e-20:continue
            if sum(n[k]*sum(q['n'][i*3+k] for i in ids) for k in range(3))<0:ids[1],ids[2]=ids[2],ids[1]
            faces+=ids
        q['indices']=faces
    return {'name':'Archamus / '+('Unhooded reference' if unhooded else 'Hooded'),'meshes':b.parts,'pivots':PIVOTS,'headPivot':PIVOTS['head'],'jawPivot':[0,3.75,.28],'eyePivot':[0,4.08 if unhooded else 4.18,.3],'origins':'UNKNOWN','stationAllowed':not unhooded,'height':4.8 if unhooded else 4.6,'design':'User reference interpretation; native articulated gold armour, cloth, mechanical joints and '+('avian anatomy. Reference asset only; never revealed on Archiostal.' if unhooded else 'concealed respirator and warhammer. No visible unhooded anatomy.')}

if __name__=='__main__':
    variants=[]
    for key,variable in [('Hooded','ArchamusHoodedModel'),('Unhooded','ArchamusUnhoodedModel')]:
        model=build(key=='Unhooded');variants.append(model)
        (WORK/('archamus_'+key.lower()+'_model.js')).write_text('const '+variable+'='+json.dumps(model,separators=(',',':'))+';\n',encoding='utf8')
        geometry.PIVOTS=PIVOTS;geometry.export_glb(model,'NOSTRAVECTOR_Archamus_'+key+'.glb')
        path=OUT/('NOSTRAVECTOR_Archamus_'+key+'.glb');data=path.read_bytes();size=struct.unpack_from('<I',data,12)[0];doc=json.loads(data[20:20+size]);nodes=doc['nodes'];groups={n['name']:i for i,n in enumerate(nodes) if n['name'] in PIVOTS}
        for child,parent in [('eyes','head'),('weapon','leftArm')]:
            index=groups[child]
            for n in nodes:
                if index in n.get('children',[]):n['children'].remove(index)
            nodes[groups[parent]].setdefault('children',[]).append(index);nodes[index]['translation']=[PIVOTS[child][i]-PIVOTS[parent][i] for i in range(3)]
        doc['extras'].update(origins='UNKNOWN',stationAllowed=not(key=='Unhooded'));raw=json.dumps(doc,separators=(',',':')).encode();raw+=b' '*((-len(raw))%4);binary=data[20+size:];path.write_bytes(struct.pack('<III',0x46546c67,2,20+len(raw)+len(binary))+struct.pack('<II',len(raw),0x4e4f534a)+raw+binary)
        print(key,len(model['meshes']),'parts',sum(len(p['indices'])//3 for p in model['meshes']),'triangles')
    references=WORK/'archamus-reference';references.mkdir(exist_ok=True)
    for file,name in [('Screenshot 2026-10-18 202958.png','hooded.png'),('Screenshot 2026-10-18 193510.png','unhooded.png')]:
        source=Path('C:/Users/HOME/Pictures/Screenshots')/file
        if source.is_file():shutil.copyfile(source,references/name)
    renderer=(WORK/'grek_renderer.js').read_text(encoding='utf8')
    html='''<!doctype html><meta charset="utf-8"><title>Archamus / model reference archive</title><style>body{margin:0;background:#09111b;color:#e0d5b0;font:14px Consolas}h1{text-align:center}main{display:flex;gap:20px;max-width:1200px;margin:auto}section{width:50%;text-align:center}canvas{width:100%;height:660px;background:radial-gradient(ellipse,#34414a,#0a1420)}p{max-width:1000px;margin:15px auto;text-align:center}</style><h1>ARCHAMUS / MODEL REFERENCE ARCHIVE</h1><p>Origins unknown. Only the hooded model is used on Archiostal. The unhooded asset is reserved for future story work.</p><main><section><h2>HOODED / ARCHIOSTAL</h2><canvas id="hood"></canvas></section><section><h2>UNHOODED / FUTURE REFERENCE</h2><canvas id="unhood"></canvas></section></main><script>'''
    html+='const models='+json.dumps(variants,separators=(',',':'))+';'+renderer+"const renderers=['hood','unhood'].map((id,i)=>createGrekRenderer(document.getElementById(id),models[i],{camera:[0,-2.3,-8.7]}));function frame(t){renderers.forEach(r=>r(t/1000));requestAnimationFrame(frame);}frame(450);</script>"
    (OUT/'NOSTRAVECTOR_Archamus_Models.html').write_text(html,encoding='utf8')
