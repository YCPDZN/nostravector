from pathlib import Path
W=Path(__file__).resolve().parent
def edit(name,a,b):
 p=W/name;s=p.read_text(encoding='utf-8');assert a in s,(name,a);p.write_text(s.replace(a,b),encoding='utf-8')
edit('capital_ship_renderer.js','M.t(x,y,z),M.scale(1,1,1)','M.t(x,y-3,z),M.scale(.62,.9,.62)')
edit('capital_ship_core.js','const owned=s=>',"const entry=s=>({x:s.space.landingX+22,z:s.space.landingZ-4});\n const canBoard=s=>owned(s)&&s.space.phase==='landed'&&!s.space.ecologyOcean&&Math.abs(s.x-s.space.landingX)<=24&&Math.abs(s.z-s.space.landingZ)<=73;\n const owned=s=>")
edit('capital_ship_core.js','DECKS,fresh,restore,ensure,owned,','DECKS,entry,canBoard,fresh,restore,ensure,owned,')
edit('capital_ship_game.js',"const capitalBoard=NVSpace.board;NVSpace.board=s=>{if(!capitalBoard(s))return false;if(NVCapital.owned(s))NVShipInterior.enter(s,true);return true;};", """const capitalBoard=NVSpace.board;NVSpace.board=s=>{if(!NVCapital.owned(s))return capitalBoard(s);if(!NVCapital.canBoard(s))return false;const p=s.space,x=p.landingX,z=p.landingZ;let entered=false;try{p.landingX=s.x;p.landingZ=s.z;entered=capitalBoard(s);}finally{p.landingX=x;p.landingZ=z;}if(entered)NVShipInterior.enter(s,true);return entered;};
const capitalDisembark=NVSpace.disembark;NVSpace.disembark=s=>{const owned=NVCapital.owned(s),ok=capitalDisembark(s);if(ok&&owned){const n=NVCapital.entry(s);s.x=n.x;s.z=n.z;s.cameraYaw=-Math.PI/2;s.friend={x:n.x+2,z:n.z-2,yaw:0};}return ok;};""")
edit('capital_ship_game.js',"Deck lift: centre aisle, beside the amber arch. Captain’s helm: floor 1, forward. Airlock: floor 5, aft.","Stairs: aft, alternating port/starboard, between the gold rails. Lift: centre aisle. Helm: floor 1 forward. Airlock: floor 5 aft.")
edit('capital_ship_game.js',"using the central deck lift.","using the aft stairs or central lift.")
edit('capital_ship_game.js',"if(NVCapital.owned(s)){shipInterior", "if(NVCapital.owned(s)){if(s.space.phase==='landed'){$('#boardGroundShip').disabled=!NVCapital.canBoard(s);$('#boardGroundShip').textContent='BOARD GREK HORIZON / F';const n=NVCapital.entry(s);$('#spaceDistance').textContent='AIRLOCK / '+Math.round(Math.hypot(s.x-n.x,s.z-n.z))+' M';}shipInterior")
edit('capital_interior_core.js','q.deck=Math.floor(q.deck);q.y=NVCapital.deckY(q.deck);return q;',"q.deck=Math.floor(q.deck);q.y=NVCapital.deckY(q.deck);if(Number.isInteger(r.stair)&&r.stair>=0&&r.stair<6&&Math.abs(q.x-capitalStairX(r.stair))<1.6&&q.z>=30&&q.z<=40){q.stair=r.stair;q.y=capitalStairY(r.stair,q.z);}return q;")
edit('capital_interior_core.js',"active:true,deck:airlock?4:0", "active:true,stair:null,deck:airlock?4:0")
edit('capital_interior_core.js',"Object.assign(q,{deck,x:0", "Object.assign(q,{deck,stair:null,x:0")
edit('capital_interior_core.js',"if(Math.abs(x)>14.2||Math.abs(z)>42.7)return true;", "if(Math.abs(x)>14.2||Math.abs(z)>42.7)return true;if(Math.abs(x)>7.5&&z>28)return false;")
edit('capital_interior_core.js',"[-28,-14,0,27]", "[-28,-14,0,21]")
edit('capital_interior_core.js',"q.steps+=Math.hypot(dx,dz);q.y=NVCapital.deckY(q.deck);", "q.steps+=Math.hypot(dx,dz);capitalWalkStairs(q);")
p=W/'capital_interior_core.js';s=p.read_text(encoding='utf-8');s+='''
function capitalStairX(d){return d%2===0?10.5:-10.5;}
function capitalStairY(d,z){return NVCapital.deckY(d+1)+(40-Math.max(30,Math.min(40,z)))*.45;}
function capitalWalkStairs(q){
 let d=Number.isInteger(q.stair)?q.stair:null;
 if(d===null&&q.z>=29.85&&q.z<=40.15)for(let k=0;k<6;k++)if(Math.abs(q.x-capitalStairX(k))<1.55&&[k,k+1].includes(q.deck)&&Math.abs(q.y-capitalStairY(k,q.z))<.3){d=k;break;}
 if(d!==null){if(q.z<=30){q.deck=d;q.stair=null;q.y=NVCapital.deckY(d);}else if(q.z>=40){q.deck=d+1;q.stair=null;q.y=NVCapital.deckY(d+1);}else{q.stair=d;q.y=capitalStairY(d,q.z);q.deck=q.y>NVCapital.deckY(d+1)+2.25?d:d+1;}}else{q.stair=null;q.y=NVCapital.deckY(q.deck);}
}
''';p.write_text(s,encoding='utf-8')
edit('ship_interior_renderer.js',"capitalRoom.filter(m=>m.deck===q.deck)","capitalRoom.filter(m=>Math.abs(m.deck-q.deck)<=1)")
