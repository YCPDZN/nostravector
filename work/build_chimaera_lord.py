"""Original articulated geometry inspired by the supplied Chimaera armour reference."""
import json, math
import build_pontifex_model as g


def build():
    b = g.Builder()
    black, steel, edge, gold = '#141419', '#303037', '#77716a', '#8f704d'
    b.oval('Flexible armoured torso', [0,2.55,0], [.65,.87,.33], black, e=.65)
    for side in [-1,1]:
        arm = 'leftArm' if side < 0 else 'rightArm'
        leg = 'leftLeg' if side < 0 else 'rightLeg'
        b.tube('Arm underplate', [[side*.75,3.05,0],[side*.91,2.55,.02],[side*.98,2.04,.12]], [.23,.19,.16], black, arm)
        b.oval('Spiked shoulder plate',[side*.76,3.12,0],[.43,.28,.39],steel,arm,e=.65)
        for j in range(3):
            x=side*(.63+j*.17)
            b.tube('Shoulder forged spike',[[x,3.29,.03],[x+side*.12,3.55+j*.035,.01]], [.095,.004],edge,arm,sides=7)
        for j in range(3):
            b.oval('Overlapping arm plate',[side*(.84+j*.055),2.83-j*.25,.04],[.22,.19,.23],steel,arm,e=.55,rows=6,cols=10)
        b.oval('Gauntlet',[side*.99,2.05,.12],[.19,.23,.19],edge,arm,e=.6)
        for j in range(4):
            b.tube('Gauntlet finger',[[side*(.87+j*.075),2.02,.24],[side*(.88+j*.075),1.86,.27]], [.045,.025],steel,arm,sides=6)
        b.tube('Leg articulated underplate',[[side*.34,1.98,0],[side*.38,1.10,0],[side*.41,.27,.04]], [.29,.23,.16],black,leg)
        for j in range(3):
            y=1.77-j*.22
            b.plate('Thigh overlapping steel',[[side*.13,y+.19],[side*.57,y+.19],[side*.61,y-.13],[side*.32,y-.22],[side*.12,y-.07]],.24,steel,leg)
        b.oval('Knee plate',[side*.39,1.05,.15],[.25,.22,.27],edge,leg,e=.65)
        b.plate('Pointed greave',[[side*.20,.98],[side*.57,.98],[side*.55,.28],[side*.39,.13],[side*.23,.30]],.26,steel,leg)
        b.oval('Armoured boot',[side*.42,.16,.18],[.25,.16,.40],steel,leg,e=.5,rows=6)
        # Tall split coat panels in front of the legs.
        b.poly('Ragged armoured coat',[[side*.08,2.1],[side*.63,2.1],[side*.85,.48],[side*.58,.64],[side*.46,.36],[side*.24,.65]],.10,.055,black,'cape')
    for side in [-1,1]:
        b.plate('Breastplate steel',[[side*.06,3.23],[side*.57,3.12],[side*.56,2.70],[side*.13,2.55]],.34,steel)
        b.tube('Breastplate trim',[[side*.07,3.22,.41],[side*.52,3.10,.41],[side*.50,2.74,.41]],.025,gold)
    for i in range(5):
        y=2.59-i*.12
        b.plate('Abdominal lames',[[-.38,y+.09],[.38,y+.09],[.34,y-.04],[0,y-.12],[-.34,y-.04]],.35,steel)
    b.oval('Belt',[0,1.99,0],[.65,.11,.36],black,e=.35)
    b.oval('Buckle skull',[0,2.02,.41],[.13,.16,.06],edge,e=.7)
    for x in [-.045,.045]:b.oval('Buckle eye',[x,2.06,.466],[.033,.037,.012],'#080809',rows=4,cols=6)
    b.oval('Closed helmet',[0,3.66,.01],[.34,.43,.29],black,'head',e=.6)
    for side in [-1,1]:
        b.plate('Angular helmet cheek',[[0,3.95],[side*.32,3.78],[side*.26,3.38],[side*.06,3.26]],.30,steel,'head')
        b.poly('Narrow eye slit',[[side*.04,3.70],[side*.24,3.75],[side*.20,3.68],[side*.05,3.65]],.348,.012,'#e6943b','head',emission=.6)
        for j in range(3):
            b.tube('Crown horn',[[side*(.19+j*.11),3.86-j*.035,0],[side*(.26+j*.20),4.11-j*.015,-.02],[side*(.20+j*.24),4.39-j*.08,.04]], [.09,.055,.003],edge,'head',sides=8)
    b.plate('Helmet central blade',[[-.055,4.12],[.055,4.12],[.065,3.52],[0,3.28],[-.065,3.52]],.35,edge,'head')
    # Individually folded, torn cape strips rather than a flat picture plane.
    for i in range(12):
        x=(i-5.5)*.15; bottom=.24+(i*7%5)*.12
        b.poly('Torn cape fold '+str(i),[[x-.10,3.28],[x+.10,3.28],[x*1.65+.13,bottom+.15],[x*1.65+.03,bottom],[x*1.65-.12,bottom+.17]],-.39-abs(x)*.17,.045,'#222027' if i%2 else '#100f14','cape',bevel=.008)
    # Heavy mace held by the right gauntlet, with radial forged teeth.
    b.tube('Mace weapon haft',[[1.0,2.12,.22],[1.15,1.38,.28],[1.42,.52,.34]],.065,steel,'weapon')
    b.oval('Mace weapon hub',[1.44,.53,.34],[.30,.31,.18],gold,'weapon',e=.65,rows=6,cols=12)
    for i in range(10):
        a=i*math.tau/10
        b.tube('Mace weapon forged spike',[[1.44+math.cos(a)*.23,.53+math.sin(a)*.23,.34],[1.44+math.cos(a)*.47,.53+math.sin(a)*.47,.34]],[.11,.004],edge,'weapon',sides=6)
    b.oval('Mace weapon ember',[1.44,.53,.53],[.11,.11,.04],'#eb9c48','weapon',emission=.8)
    pivots=g.PIVOTS
    for p in b.parts:
        bone=p['bone'];p['rig']={'kind':'arm' if 'Arm' in bone else 'leg' if 'Leg' in bone else bone,'side':-1 if bone.startswith('left') else 1,'pivot':pivots[bone]}
    return {'name':'Arjaximon','faction':'THE CHIMAERA SCOURGE','alignment':'CHAOTIC EVIL','height':4.4,'pivots':pivots,'meshes':b.parts,'design':'Original articulated black plate armour, horned helmet, torn cloak and spiked mace inspired by the supplied reference.'}


if __name__=='__main__':
    model=build()
    (g.WORK/'chimaera_lord_model.js').write_text('const ChimaeraLordModel='+json.dumps(model,separators=(',',':'))+';\n',encoding='utf-8')
    g.export_glb(model,'NOSTRAVECTOR_Arjaximon.glb')
    print('Arjaximon:',len(model['meshes']),'articulated parts')
