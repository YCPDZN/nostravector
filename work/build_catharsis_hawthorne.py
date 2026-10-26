"""Original four-armed Catharsis Hawthorne geometry from the supplied reference."""
from pathlib import Path
import json
import build_pontifex_model as geometry
from build_pontifex_model import Builder

work=Path(__file__).resolve().parent;b=Builder()
skin='#141e23';ridge='#344047';steel='#536169';edge='#87959b';dark='#10171e';cyan='#28e9e1';tooth='#aca38f'
P={'body':[0,2.3,0],'head':[0,3.65,0],'jaw':[0,3.83,.19],'eyes':[0,4.03,.12],
   'upperLeftArm':[-.59,3.22,0],'upperRightArm':[.59,3.22,0],
   'lowerLeftArm':[-.54,2.47,-.1],'lowerRightArm':[.54,2.47,-.1],
   'leftLeg':[-.3,1.85,0],'rightLeg':[.3,1.85,0],'tail':[0,1.95,-.18]}
def oval(name,c,size,col=skin,bone='body',e=.85):b.oval(name,c,size,col,bone,e=e,rows=7,cols=12)
def tube(name,points,radius,col=skin,bone='body'):b.tube(name,points,radius,col,bone,sides=8)
def armour(name,c,size,bone='body'):
    oval(name+' steel rim',c,[v*1.07 for v in size],edge,bone,.5)
    oval(name+' armour',[c[0],c[1],c[2]+.018],size,steel,bone,.5)

oval('Catharsis thorax',[0,2.9,0],[.56,.68,.31]);oval('Pelvic carapace',[0,1.92,0],[.43,.26,.30])
for j in range(4):armour('Segmented abdominal plate '+str(j),[0,2.58-j*.15,.28],[.36-j*.025,.095,.095])
for side in (-1,1):
    leg='leftLeg' if side<0 else 'rightLeg'
    tube('Armoured digitigrade '+leg,[[side*.30,1.88,0],[side*.39,1.10,.08],[side*.32,.48,-.08],[side*.34,.13,.1]],[.26,.21,.15,.12],skin,leg)
    armour('Thigh '+leg,[side*.35,1.52,.15],[.26,.39,.19],leg)
    armour('Knee '+leg,[side*.39,1.06,.22],[.24,.20,.15],leg)
    armour('Shin '+leg,[side*.34,.63,.06],[.20,.31,.17],leg)
    for j in range(3):tube('Clawed toe '+leg+str(j),[[side*.34,.14,.12],[side*(.21+j*.12),.08,.34],[side*(.19+j*.15),.055,.57]],[.08,.06,.002],dark,leg)
    for upper in (True,False):
        arm=('upper' if upper else 'lower')+('LeftArm' if side<0 else 'RightArm')
        y=3.22 if upper else 2.47;back=0 if upper else -.10
        points=[[side*.59,y,back],[side*(.95 if upper else .85),y-.46,back],[side*(1.05 if upper else .93),y-.95,.12]]
        tube('Sinewed limb '+arm,points,[.23,.18,.13],skin,arm)
        armour('Shoulder '+arm,[side*.66,y,.03],[.31,.25,.29],arm)
        armour('Forearm '+arm,[side*(1.02 if upper else .92),y-.74,.07],[.20,.31,.21],arm)
        for j in range(3):tube('Arm blade '+arm+str(j),[[side*.99,y-.45-j*.16,-.03],[side*1.25,y-.32-j*.16,-.08]],[.07,.001],ridge,arm)
        oval('Palm '+arm,[side*(1.05 if upper else .93),y-1.04,.15],[.17,.22,.11],skin,arm)
        for j in range(4):tube('Hooked finger '+arm+str(j),[[side*(.93+j*.07),y-1.10,.16],[side*(.96+j*.08),y-1.32,.23],[side*(.96+j*.08),y-1.37,.38]],[.035,.025,.001],dark,arm)
    armour('Crossed harness '+str(side),[side*.25,3.12,.27],[.28,.34,.13])
    tube('Chest harness strap '+str(side),[[side*.43,3.45,.18],[side*.31,3.03,.43],[side*.20,2.74,.38]],.05,dark)
    for j in range(3):tube('Pauldron thorn '+str(side)+str(j),[[side*(.5+j*.12),3.44,-.04],[side*(.62+j*.16),3.69-j*.04,-.13]],[.075,.001],ridge,'upperLeftArm' if side<0 else 'upperRightArm')

oval('Cyan neural core',[0,3.14,.46],[.07,.09,.025],cyan)
for side in (-1,1):oval('Waist buckle '+str(side),[side*.22,1.99,.31],[.095,.10,.05],edge)
tube('Barbed Catharsis tail',[[0,1.95,-.20],[0,1.24,-.55],[.35,.57,-.83],[.86,.62,-.80],[1.1,.93,-.55]],[.18,.14,.10,.06,.001],skin,'tail')
for j in range(6):tube('Tail spine '+str(j),[[.05+j*.14,1.03-j*.07,-.63],[.07+j*.15,1.25-j*.07,-.74]],[.045,.001],ridge,'tail')
oval('Alien neck',[0,3.52,0],[.23,.30,.20],skin,'head')
oval('Crowned Catharsis skull',[0,3.98,.02],[.36,.46,.30],skin,'head',.65)
oval('Needled jaw',[0,3.72,.20],[.30,.18,.18],skin,'jaw',.65)
oval('Black mouth aperture',[0,3.79,.306],[.27,.095,.045],dark,'head',.6)
for side in (-1,1):
    oval('Deep eye socket '+str(side),[side*.16,4.05,.26],[.16,.14,.065],ridge,'head',.6)
    b.oval('Cyan eye '+str(side),[side*.16,4.05,.32],[.105,.092,.027],cyan,'eyes',rows=7,cols=12,emission=.7)
    oval('Vertical pupil '+str(side),[side*.16,4.05,.35],[.016,.077,.006],dark,'eyes')
    armour('Temple implant '+str(side),[side*.32,4.13,.12],[.075,.14,.11],'head')
    tube('Face implant strap '+str(side),[[side*.29,4.13,.17],[side*.17,4.23,.22],[0,4.20,.29]],.035,steel,'head')
    for j in range(3):tube('Crown spike '+str(side)+str(j),[[side*(.14+j*.07),4.25,-j*.07],[side*(.20+j*.12),4.54+j*.04,-.16-j*.1],[side*(.16+j*.17),4.68-j*.03,-.30-j*.12]],[.10,.055,.001],ridge,'head')
    for j in range(9):
        x=-.23+j*.058;tube('Individual serrated tooth '+str(side)+str(j),[[x,3.80+side*.065,.35],[x,3.80-side*.025,.365]],[.016,.001],tooth,'head' if side>0 else 'jaw')
armour('Forehead implant',[0,4.22,.25],[.10,.12,.07],'head')
model={'name':'Thomas Hawthorne / Catharsis form','meshes':b.parts,'pivots':P,'height':4.72,'design':'Four clawed arms, dark digitigrade carapace, serrated jaws, horn crown, cyan eyes and heavy former Imperial armour.'}
(work/'catharsis_hawthorne_model.js').write_text('const CatharsisHawthorneModel='+json.dumps(model,separators=(',',':'))+';\n',encoding='utf-8')
geometry.PIVOTS=P;geometry.export_glb(model,'NOSTRAVECTOR_Hawthorne_Catharsis.glb')
print('Built four-armed Catharsis Hawthorne:',len(b.parts),'parts.')
