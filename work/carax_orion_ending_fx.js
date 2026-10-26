// One persistent, quiet sound bed. No per-frame sound spawning or flashing overlays.
const NVOrionEndingFX=(()=>{
 const shade=document.createElement('div');shade.id='caraxOrionVision';shade.setAttribute('aria-hidden','true');caraxEndingSheet.append(shade);
 const css=document.createElement('style');css.textContent='#caraxOrionVision{position:absolute;inset:0;z-index:5;pointer-events:none;display:none;background:#000}#caraxEndingScene.orion-first-person header{opacity:.45}#caraxEndingScene.orion-first-person article{border-color:#863845;background:#10080fe8}#caraxEndingScene.orion-first-person h2{font-size:clamp(18px,3vw,30px)}';document.head.append(css);
 let context=null,master=null,breath=null,heart=null,impact=null,noise=null,tone=null,shotKey='',attempted=false;
 function sound(){
  if(master||attempted)return;attempted=true;
  try{
   const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;context=new AC();master=context.createGain();master.gain.value=0;master.connect(context.destination);
   const filter=context.createBiquadFilter();filter.type='lowpass';filter.frequency.value=350;breath=context.createGain();breath.gain.value=0;
   const buffer=context.createBuffer(1,context.sampleRate*2,context.sampleRate),data=buffer.getChannelData(0);let last=0;for(let i=0;i<data.length;i++){last=(last+.035*(Math.random()*2-1))/1.02;data[i]=last*.25;}
   noise=context.createBufferSource();noise.buffer=buffer;noise.loop=true;noise.connect(filter);filter.connect(breath);breath.connect(master);noise.start();
   tone=context.createOscillator();tone.type='sine';tone.frequency.value=51;heart=context.createGain();heart.gain.value=0;tone.connect(heart);heart.connect(master);tone.start();
   impact=context.createGain();impact.gain.value=0;const thud=context.createOscillator();thud.type='sine';thud.frequency.value=72;thud.connect(impact);impact.connect(master);thud.start();tone._thud=thud;
  }catch(e){shutdown();}
 }
 function level(node,v){if(node&&context)node.gain.setTargetAtTime(v,context.currentTime,.06);}
 function shutdown(){try{noise?.stop();tone?.stop();tone?._thud?.stop();context?.close();}catch(e){}context=master=breath=heart=impact=noise=tone=null;attempted=false;}
 function sync(q){
  const b=NVCaraxEndings.deathBeat(q),active=NVCaraxEndings.fatal(q)&&q.stage==='cinematic'&&b.firstPerson,running=active&&!caraxEndingPaused&&!document.hidden;
  caraxEndingSheet.classList.toggle('orion-first-person',active);const canvas=$('#caraxEndingCanvas');canvas.style.filter=active?'blur('+b.blur.toFixed(2)+'px) saturate('+(1-b.pressure*.7).toFixed(2)+')':'';
  shade.style.display=active?'block':'none';shade.style.opacity=active?String(b.blackout):'0';
  // Edge constriction darkens gradually; the final fade covers the entire scene.
  canvas.style.maskImage=active&&b.pressure>0?'radial-gradient(ellipse at 50% 46%,#000 '+(70-b.pressure*54)+'%,#0009 '+(95-b.pressure*20)+'%,#0003 100%)':'';
  if(active){$('#caraxEndingHeading').textContent=q.route==='bad-tyrotaronus'?'THE OILKOUMENEUS':q.route==='bad-josiah'?'THE PRIME SECRETARY':q.route==='bad-zark'?'THE PRIME EVIL':q.shot>=4?'THE VENGEFUL MASCAR':'THE RIFT CLOSES';canvas.setAttribute('aria-label','First-person view: '+(q.route==='bad-tyrotaronus'?'Tyrotaronus ':q.route==='bad-josiah'?'Josiah Richards ':q.route==='bad-zark'?'Lord Zark ':'Orion ')+b.phase);}
  else{$('#caraxEndingHeading').textContent=q.route==='bad-tyrotaronus'?'THE OILKOUMENEUS':q.route==='bad-josiah'?'THE PRIME SECRETARY':q.route==='bad-zark'?'THE PRIME EVIL':'THE RIFT CLOSES';canvas.setAttribute('aria-label','After the battle of Carax');}
  if(!running){level(master,0);if(context?.state==='running')context.suspend().catch(()=>{});return;}
  if(q.shot<(q.route==='bad-tyrotaronus'?15:q.route==='bad-josiah'?7:q.route==='bad-zark'?1:4))return;sound();if(context?.state==='suspended')context.resume().catch(()=>{});level(master,.65*(1-b.blackout));
  const beat=Math.max(0,Math.sin(q.time*(q.shot>=12?5:7)))**12;
  level(heart,.035*b.grip*beat);level(breath,.11*b.grip*(.3+.7*Math.sin(q.time*2.1)**2)*(1-b.pressure*.8));
  const k=q.route+':'+q.shot+':'+b.phase;if(k!==shotKey){shotKey=k;level(impact,0);}level(impact,b.impact*.11);
 }
 function stop(){const canvas=$('#caraxEndingCanvas');canvas.style.filter='';canvas.style.maskImage='';caraxEndingSheet.classList.remove('orion-first-person');shade.style.display='none';shade.style.opacity='0';shotKey='';shutdown();}
 window.addEventListener('blur',()=>{level(master,0);context?.suspend().catch(()=>{});});document.addEventListener('visibilitychange',()=>{if(document.hidden){level(master,0);context?.suspend().catch(()=>{});}});window.addEventListener('pagehide',stop);
 return{sync,stop,audible:()=>!!context&&context.state==='running'&&!!master&&master.gain.value>0};
})();
