const NVArchamus=(()=>{
 const POSITION={x:0,z:18,yaw:Math.PI},SCALE=.48;
 const CHAPTER3="I didn’t come to Archiostal looking for company, and I certainly didn’t ask for yours. Whatever you want, find someone else. Go away.";
 const CHAPTER4=[
  "Hold there. If you’re going to stand in front of me, you may as well tell me what you need. I’m Archamus. Before you start asking questions, that is a name, not an invitation to investigate my life.",
  "I prefer the middle of the station. People coming in, people leaving, merchants pretending they haven’t raised their prices. Someone has to watch this place, and the fountain has yet to prove itself useful in a crisis.",
  "Two years have done this galaxy no favours. You can see it in the queues at the docks: too many families with one bag between them. The authorities call them displaced persons. I find that makes it easier for the authorities to sleep.",
  "I’ve heard enough grand speeches to last several lifetimes. Every conqueror promises order; every liberator promises a better tomorrow. I watch what they do when there’s no audience. Particularly when someone small gets in their way.",
  "Your crew will tell you things your admirals won’t. Listen to them. Learn when they’re frightened, when they’re exhausted, and when they’re agreeing with you just to end the argument. People are remarkably good at that last one.",
  "You’re staring at the hammer. No, I don’t use it to settle every disagreement. That would be exhausting, and the station charges for damaged flooring. Sometimes I settle for asking twice.",
  "If you want my advice, keep a way out and remember who can’t run as fast as you. I’ve watched plenty of well-armed people save themselves. The ones worth remembering went back for somebody.",
  "The hood stays. You can ask where I’m from, what I was, or why I’m here, but you won’t enjoy the answers. Mostly because I won’t give you any. We can have a perfectly civil conversation without them.",
  "Take a proper look around Archiostal before you hurry back to your ship. There’s a mechanic in the docks who fixes children’s toys between shifts. Nobody puts that on a monument. I’d sooner defend his workshop than most monuments I’ve seen.",
  "Well. You’ve managed to keep me talking longer than I intended. Come back if you need another opinion; I can’t promise you’ll like it. And if anyone asks whether I’ve become sociable, have the decency to lie."
 ];
 const RETURN="Back again? All right. Stand where I can see you, and tell me how the galaxy has managed to disappoint you this time.";
 const CONTACT="There is someone you should speak to before you go any further. I know a contact back on Earth: Josiah Williams II. He is based in Europe. Find him, and tell him Archamus sent you.";
 const CATHARSIS=[
  "Before you go, close your public comms channel. Yes, all of it. There are things I will discuss in a station full of strangers, and there are things I would rather not hear repeated by a voice I do not recognise.",
  "The creature that boarded your ship was no scavenger. It did not come looking for cargo, and it did not stop when your vessel could no longer defend itself. I have read your distress record. There are gaps in it that I wish I could explain.",
  "Catharsis. That is the name of the alien species you encountered. Remember it. The word appears in transmissions recovered from ships that never reached their destinations. In some recordings, it is the last clear thing anyone says.",
  "I have an image from the incident. I am keeping it sealed. You have already had that thing close enough to touch you; I will not put its face in front of you again to make a point. What I need you to see is much larger.",
  "Look at your comms display. I am sending a projection of the Milky Way, with colony beacons laid over the old shipping charts. Those lights once meant somebody was awake down there. Somebody was listening for a ship to come home.",
  "Look at those worlds. Gone to nothingness. That dark stretch was a chain of settlements, not an empty corner of a survey. There were landing lights there. Weather stations. Children complaining about having to move again. Keep looking. There are more.",
  "The first relay reported a missed cargo arrival. The next requested an escort. Then a third began transmitting the same emergency code without a pause. By the time anyone agreed to send help, all three had stopped answering.",
  "One recording begins with somebody laughing. You can hear cups being put down, a door opening, an ordinary shift getting underway. Forty seconds later, the only sound is a chair scraping across the floor. Then the carrier disappears.",
  "The stars are still visible from those routes. That has fooled more than one captain into believing the reports were exaggerated. Starlight can travel for years after the lives beneath it have ended. A bright horizon is a poor promise of safety.",
  "You spent seven hundred and thirty nights in that medical pod. Your people counted them because they were waiting for you. Out there, other people were counting missed supply runs, missed calls, missed birthdays. Eventually, there was nobody left to keep the count.",
  "Hawthorne believed a flag over a world made him its master. He sent fleets across Sol and called the suffering necessary. Study these records and imagine him trying to give orders to that silence. Against the Catharsis, he would have had no audience and no throne worth taking.",
  "Do not assume the Federation, the Erisians, or the Grek can stand outside this and watch it happen to somebody else. A refugee ship carries families, but it also carries a route. Every place that opens its doors must ask what might have followed them.",
  "I will not pretend to know how every one of these worlds was lost. Some records end in violence. Others simply stop. The survey teams found empty approach lanes where traffic should have been thick enough to complain about. Several teams never sent a second report.",
  "That marker on the edge of the arm was a listening post. Its final operator kept reading out the number of vessels approaching. Twelve. Twenty-nine. Sixty. Then she stopped counting. The last message asked whether anyone could still hear her.",
  "Your escape pod reached Triton. Hold on to that fact. Someone got you out, and people kept you alive when it would have been easier to abandon you. I do not know why you survived the boarding. I refuse to turn that unanswered question into a promise that you are safe.",
  "Look at the crew around you before your next departure. Learn which doors they sleep behind. Learn who goes quiet when an alarm sounds. If the ship is breached again, there may be no time to run through a roster and decide whom you meant to protect.",
  "And do not send them into one of these dark sectors because a beacon lights up for a moment. We have seen signals return on frequencies that were supposed to be dead. A working transmitter tells you that something has power. It does not tell you who is using it.",
  "If a familiar voice calls from a place that has fallen silent, ask it something the person would know. Then listen to the answer. Listen to the pauses. If anything feels wrong, pull back and bring the recording here. Do not go closer just to prove you are brave.",
  "The ship Am-Grek gave you can carry people out of danger. Use that strength. Keep your routes open and your crew together. There are captains on this chart who stayed a little longer because they believed one more turret, one more shield, would make the difference.",
  "I am closing the projection now. Remember the name Catharsis, but remember the lights before they went out as well. If these comms fall silent and you see me watching the docks instead of the sky, do not wait for another speech. Get your people aboard."
 ];
 const JOSIAH=[
  {"speaker":"ARCHAMUS","text":"You. Josiah Richards. Spare me the pleasantries. You tampered with the universe and expected everything you touched to stay where you left it. Did you think Project BC would leave no consequences?"},
  {"speaker":"JOSIAH RICHARDS","text":"Son... is that you? When I made those two eggs... you came out of one of them?"},
  {"speaker":"ARCHAMUS","text":"Do not call me son as though that explains anything. Two eggs. Is that all you remember? You speak about making lives as though you were setting something down on a workbench."},
  {"speaker":"JOSIAH RICHARDS","text":"I remember more than you think. But I never thought I would find you here, underneath that hood, looking at me like this."},
  {"speaker":"ARCHAMUS","text":"Then look carefully. This is what happens when your creations have to live with the things you did. The polite conversation is over, Josiah."},
  {"speaker":"JOSIAH RICHARDS","text":"All right, son. No pleasantries. But sooner or later, you and I are going to talk about those eggs."},
  {"speaker":"ARCHAMUS","text":"You're not going to tell me NOTHING! You don't get to stroll back into my life, call me son, and decide when I owe you an explanation! You tampered with an entire universe, Josiah. Start explaining yourself before you demand anything from me!"},
  {"speaker":"ARCHAMUS","text":"Have you seen what the Catharsis leave behind? They're an alien species tearing through everything in their path! Settlements, ships, whole lives reduced to wreckage, and you stand here wanting a cosy conversation about two eggs! There are people out there who won't survive long enough to learn what killed them!"},
  {"speaker":"ARCHAMUS","text":"And Hawthorne! That arrogant bastard thought the stars existed for him to conquer! All those soldiers, all those speeches, all those people sacrificed to feed his ambition! The Catharsis don't care about his titles. They'll destroy the worlds he wanted to rule and leave nobody alive to remember his name!"},
  {"speaker":"ARCHAMUS","text":"So put your questions aside and look at what's happening, Josiah! If you know anything that can stop the Catharsis, tell us! Help someone for once without treating their existence like another experiment! You want me to hear you out? Give me a reason to believe you've learned anything!"}
 ];
 const fresh=()=>({chapter3Met:false,chapter4Met:false,josiahMet:false,josiahRantHeard:false,catharsisHeard:false,catharsisLine:0,contactBriefed:false,contactMet:false,williamsChoice:'',williamsReactionHeard:false,williamsHelpAccepted:false,williamsCrewHeard:[]});
 const restore=raw=>({chapter3Met:raw?.chapter3Met===true,chapter4Met:raw?.chapter4Met===true,josiahMet:raw?.josiahMet===true,josiahRantHeard:raw?.josiahRantHeard===true,catharsisHeard:raw?.catharsisHeard===true,contactBriefed:raw?.contactBriefed===true,contactMet:raw?.contactMet===true,williamsReactionHeard:raw?.williamsReactionHeard===true,williamsHelpAccepted:raw?.williamsHelpAccepted===true&&['sympathetic','gareth','richards'].includes(raw?.williamsChoice),williamsChoice:['rude','sarcastic','sympathetic','ignorant','gareth','richards'].includes(raw?.williamsChoice)?raw.williamsChoice:'',williamsCrewHeard:[...new Set([...(Array.isArray(raw?.williamsCrewHeard)?raw.williamsCrewHeard:[]),...(['gareth','richards'].includes(raw?.williamsChoice)&&raw?.williamsReactionHeard===true?[raw.williamsChoice]:[])].filter(id=>['gareth','richards'].includes(id)))],catharsisLine:Math.max(0,Math.min(19,Math.floor(Number(raw?.catharsisLine)||0)))});
 const ensure=s=>{const q=NVArchiostal.ensure(s);return q.archamus||(q.archamus=fresh());};
 const chapter=s=>NVChapter4.started(s)?4:NVArchiostal.chapter(s);
 const present=s=>NVArchiostal.active(s)&&chapter(s)>=3;
 const distance=s=>{const q=NVArchiostal.ensure(s);return Math.hypot(q.x-POSITION.x,q.z-POSITION.z);};
 const canTalk=s=>present(s)&&distance(s)<=6.5;
 const catharsisPending=s=>NVArchiostal.chapter4Arrived(s)&&ensure(s).chapter4Met&&!ensure(s).catharsisHeard;
 const contactPending=s=>NVArchiostal.chapter4Arrived(s)&&ensure(s).catharsisHeard&&!ensure(s).contactBriefed;
 const earthContact=s=>NVArchiostal.chapter4Arrived(s)&&ensure(s).contactBriefed&&!ensure(s).contactMet;
 const objective=s=>NVArchiostal.chapter4Arrived(s)&&(!ensure(s).chapter4Met||!ensure(s).catharsisHeard||!ensure(s).contactBriefed);
 function waypoint(s){if(!objective(s))return null;if(NVArchiostal.active(s))return{...POSITION,label:'Speak to Archamus · Central Hub'};if(NVGalaxy.system(s)!==NVArchiostal.SYSTEM)return{galaxy:true,system:NVArchiostal.SYSTEM,label:'Return to Archiostal · Speak to Archamus'};if(['landed','cockpit','off'].includes(s.space.phase))return{x:s.space.landingX||0,z:s.space.landingZ||0,label:'Return to ship · Speak to Archamus'};return{space:true,position:NVArchiostal.POSITION.slice(),radius:110,label:'Archiostal · Speak to Archamus'};}
 const josiah=s=>NVCustomCrew.followers(s).find(n=>NVBCCombat.kind(n)==='josiah')||null;
 const hiddenAvailable=s=>canTalk(s)&&(!ensure(s).josiahMet||!ensure(s).josiahRantHeard)&&!!josiah(s);
 const hiddenLines=s=>ensure(s).josiahMet?JOSIAH.slice(6):JOSIAH;
 const lines=s=>chapter(s)>=4?(ensure(s).chapter4Met?[RETURN]:CHAPTER4):[CHAPTER3];
 function finish(s,epoch,hidden=false){const q=ensure(s);if(hidden){q.josiahMet=true;q.josiahRantHeard=true;}else q[epoch>=4?'chapter4Met':'chapter3Met']=true;NVQuests.update(s);}
 const blocks=(x,z)=>Math.hypot(x-POSITION.x,z-POSITION.z)<1.0;
 let cached;function parts(){if(!cached)cached=ArchamusHoodedModel.meshes.map(p=>{const b=p.bone,kind=b==='head'||b==='eyes'?'head':/Arm/.test(b)?'arm':/Leg/.test(b)?'leg':b==='weapon'?'weapon':b==='cape'?'cape':'body';return{...p,p:p.p.map(v=>v*SCALE),f:p.indices,c:p.color,rig:{kind,side:b.startsWith('left')?-1:1,pivot:ArchamusHoodedModel.pivots[b].map(v=>v*SCALE)}};});return cached;}
 return{POSITION,SCALE,CHAPTER3,CHAPTER4,RETURN,CONTACT,CATHARSIS,JOSIAH,fresh,restore,ensure,chapter,present,distance,canTalk,objective,catharsisPending,contactPending,earthContact,waypoint,josiah,hiddenAvailable,hiddenLines,lines,finish,blocks,parts};
})();
const archamusStationRestore=NVArchiostal.restore;NVArchiostal.restore=raw=>({...archamusStationRestore(raw),archamus:NVArchamus.restore(raw?.archamus)});
NVQuests.definitions.push({id:'chapter4-archamus',chapter:4,title:'Speak to Archamus',description:'After docking at Archiostal, find Archamus beside the fountain in the Central Hub and finish speaking with him.',available:s=>NVArchiostal.chapter4Arrived(s),done:s=>s.eris?.archiostal?.archamus?.chapter4Met===true});
NVQuests.definitions.push({id:'chapter4-catharsis',chapter:4,title:'The worlds that went dark',description:'Hear Archamus’s warning about the Catharsis and examine his Milky Way comms projection. The attacker’s image remains sealed.',available:s=>NVArchiostal.chapter4Arrived(s)&&NVArchamus.ensure(s).chapter4Met,done:s=>s.eris?.archiostal?.archamus?.catharsisHeard===true});
const archamusQuestRestore=NVQuests.restore;NVQuests.restore=raw=>{const q=archamusQuestRestore(raw);for(const id of ['chapter4-archamus','chapter4-catharsis','chapter4-earth-contact'])if(raw?.completed?.includes(id)&&!q.completed.includes(id))q.completed.push(id);return q;};

NVQuests.definitions.push({id:'chapter4-earth-contact',chapter:4,title:'Find Josiah Williams II',description:'Archamus knows Josiah Williams II, a contact based in Europe on Earth. Return to Sol, head to Earth and seek him in Europe.',available:s=>NVArchamus.earthContact(s),done:s=>s.eris?.archiostal?.archamus?.contactMet===true});
