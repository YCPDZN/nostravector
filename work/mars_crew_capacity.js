// Olympus Vanguard has 25 berths across its three existing decks.
const marsCapacityCrew=NVShipInterior.crew;NVShipInterior.crew=s=>{
 const list=marsCapacityCrew(s);if(s?.space?.shipId!=='olympus-vanguard')return list;
 return list.slice(0,NVParty.capacity(s)).map((n,i)=>{if(n.id==='khazglar')return{...n,deck:1,x:-2.8,z:10.7,yaw:-2.8,speed:0};const slot=Math.floor(i/3),deck=i%3;if(slot===8)return{...n,deck,x:0,z:-2,yaw:Math.PI/2,speed:0};return{...n,deck,x:slot%2?2.5:-2.5,z:deck===1&&slot===6?7:[-14,-6,1,9][Math.floor(slot/2)],yaw:slot%2?-Math.PI/2:Math.PI/2,speed:0};});
};
