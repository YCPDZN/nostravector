from pathlib import Path
p=Path(__file__).resolve().parent
f=p/'antarctica_core.js';s=f.read_text(encoding='utf-8')
s=s.replace('CAR_TRIP_SECONDS=300,', "DEPOT={x:40,z:2058},CAR_TRIP_SECONDS=300,")
s=s.replace('stormRemaining:300,suitHeat:100,', "stormRemaining:300,nextBlizzardRemaining:300,blizzardCycle:0,stormClearCount:0,supplyDialoguePending:false,supplyDialogueActive:false,supplyDialogueIndex:0,supplyDialogueDone:false,suppliesPlanKnown:false,suppliesCollected:false,suitHeat:100,")
s=s.replace("numeric('stormRemaining',0,300);", "numeric('stormRemaining',0,300);numeric('nextBlizzardRemaining',0,300);numeric('blizzardCycle',0,1e7);numeric('stormClearCount',0,1e7);numeric('supplyDialogueIndex',0,9);s.supplyDialogueIndex=Math.floor(s.supplyDialogueIndex);for(const key of ['supplyDialoguePending','supplyDialogueActive','supplyDialogueDone','suppliesPlanKnown','suppliesCollected'])s[key]=!!w[key];if(s.hazardStage==='complete'&&!s.superBlizzard&&!s.supplyDialogueDone&&!s.suppliesPlanKnown)s.supplyDialoguePending=true;")
s=s.replace('stormRemaining:s.stormRemaining,suitHeat:', 'stormRemaining:s.stormRemaining,nextBlizzardRemaining:s.nextBlizzardRemaining,blizzardCycle:s.blizzardCycle,stormClearCount:s.stormClearCount,supplyDialoguePending:s.supplyDialoguePending,supplyDialogueActive:s.supplyDialogueActive,supplyDialogueIndex:s.supplyDialogueIndex,supplyDialogueDone:s.supplyDialogueDone,suppliesPlanKnown:s.suppliesPlanKnown,suppliesCollected:s.suppliesCollected,suitHeat:')
start=s.index('  function hazardStep(');end=s.index('  function routeDistance(',start)
s=s[:start]+'''  function hazardStep(s,dt){
    if(s.hazardStage!=='complete'||dt<=0)return false;
    let left=dt,recovered=false;
    while(left>1e-8){
      const storm=s.superBlizzard,timer=storm?s.stormRemaining:s.nextBlizzardRemaining,step=Math.min(left,Math.max(0,timer));
      const exposed=storm&&!inShelter(s)&&!s.car?.driving;
      s.suitHeat=clamp(s.suitHeat+(exposed?-100/180:inShelter(s)?1.2:s.car?.driving?.6:0)*step,0,100);
      left-=step;
      if(storm){s.stormRemaining=Math.max(0,timer-step);if(s.stormRemaining<=1e-8){s.stormRemaining=0;s.superBlizzard=false;s.nextBlizzardRemaining=300;s.stormClearCount++;if(!s.supplyDialogueDone&&!s.suppliesPlanKnown)s.supplyDialoguePending=true;}}
      else{s.nextBlizzardRemaining=Math.max(0,timer-step);if(s.nextBlizzardRemaining<=1e-8){s.nextBlizzardRemaining=0;s.superBlizzard=true;s.stormRemaining=300;s.blizzardCycle++;}}
      if(s.suitHeat<=0){s.x=STATION.x;s.z=STATION.z;s.yaw=0;s.james={x:s.x+1.7,z:s.z+1.5,yaw:Math.PI};s.suitHeat=35;recovered=true;}
    }
    return recovered;
  }
'''+s[end:]
s=s.replace('return{WALK,SPRINT,STATION,', 'return{WALK,SPRINT,STATION,DEPOT,')
f.write_text(s,encoding='utf-8')
