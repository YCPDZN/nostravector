// Scene-aware soundtrack. Audio preferences never write expedition save data.
function createNVMusicPlayer({tracks, AudioClass, onStatus = () => {}, onTrackEnded = () => {}, random = Math.random}) {
  const clips = tracks.map(q => {
    const a = new AudioClass(q.source);
    a.preload = 'none'; a.volume = 0;
    return a;
  });
  clips[0].loop = true;
  const chapter4MenuIndex=tracks.findIndex(q=>q.role==='menu-chapter4');
  if(chapter4MenuIndex>=0)clips[chapter4MenuIndex].loop=true;
  const mascarIndex=tracks.findIndex(q=>q.role==='mascar');if(mascarIndex>=0)clips[mascarIndex].loop=true;
  const mascarPianoIndex=tracks.findIndex(q=>q.role==='mascar-piano');if(mascarPianoIndex>=0)clips[mascarPianoIndex].loop=true;
  const crewEnemyIndex=tracks.findIndex(q=>q.role==='crew-enemy');if(crewEnemyIndex>=0)clips[crewEnemyIndex].loop=true;
  const combatIndex=tracks.findIndex(q=>q.role==='combat');
  const siegeIndex=tracks.findIndex(q=>q.role==='siege');
  const catharsisFinalIndex=tracks.findIndex(q=>q.role==='catharsis-final');if(catharsisFinalIndex>=0)clips[catharsisFinalIndex].loop=true;
  const mercuryIndex=tracks.findIndex(q=>q.role==='mercury');
  if(mercuryIndex>=0)clips[mercuryIndex].loop=true;
  if(siegeIndex>=0)clips[siegeIndex].loop=true;
  if(combatIndex>=0)clips[combatIndex].loop=true;
  const predatorIndices=tracks.map((q,i)=>q.role==='predator'?i:-1).filter(i=>i>=0);
  const roamIndices=tracks.map((q,i)=>i>0&&!q.role?i:-1).filter(i=>i>=0);
  const chapter4RoamIndices=tracks.map((q,i)=>q.role==='roam-chapter4'?i:-1).filter(i=>i>=0);
  predatorIndices.forEach(i=>clips[i].loop=true);let predatorIndex=-1;
  let enabled = true, volume = .3, scene = 'menu', paused = false, hidden = false;
  let duck = false, roamIndex = -1, chapter4RoamIndex = -1, selected = -1, blocked = false, pending = false, token = 0;
  const failed = new Set();
  const leaderIndices=tracks.map((q,i)=>q.role?.startsWith('leader-')?i:-1).filter(i=>i>=0);leaderIndices.forEach(i=>clips[i].loop=true);
  const nightmareIndices=tracks.map((q,i)=>q.role?.startsWith('nightmare-')?i:-1).filter(i=>i>=0);nightmareIndices.forEach(i=>clips[i].loop=true);
  function wanted() { if(scene.startsWith('nightmare-'))return tracks.findIndex(q=>q.role===scene); if(scene==='catharsis-final')return catharsisFinalIndex;if(scene.startsWith('leader-'))return tracks.findIndex(q=>q.role===scene);return scene === 'menu' ? 0 : scene === 'menu-chapter4' ? (chapter4MenuIndex>=0?chapter4MenuIndex:0) : scene === 'mercury' ? mercuryIndex : scene === 'siege' ? siegeIndex : scene === 'mascar' ? mascarIndex : scene === 'mascar-piano' ? mascarPianoIndex : scene === 'crew-enemy' ? crewEnemyIndex : scene === 'combat' ? combatIndex : scene === 'predator' ? predatorIndex : scene === 'roam' ? roamIndex : scene === 'roam-chapter4' ? chapter4RoamIndex : -1; }
  function audible() { return enabled && !paused && !hidden && wanted() >= 0; }
  function publish() {
    onStatus({enabled, volume, blocked, playing: selected >= 0 && !clips[selected].paused,
      title: tracks[wanted()]?.title || '', scene, failed: failed.has(wanted())});
  }
  function stop() {
    token++; pending = false;
    clips.forEach(a => { a.pause(); a.volume = 0; });
  }
  function startSession() {
    stop(); blocked = false;
    const roll=Math.max(0,random()),choice = Math.min(roamIndices.length - 1, Math.floor(roll * roamIndices.length));
    roamIndex = roamIndices[choice] ?? -1;
    chapter4RoamIndex=chapter4RoamIndices[Math.min(chapter4RoamIndices.length-1,Math.floor(roll*chapter4RoamIndices.length))]??-1;
    [...roamIndices,...chapter4RoamIndices].forEach(i => { clips[i].currentTime = 0; });
  }
  function play() {
    if (!audible() || selected < 0 || blocked || pending || failed.has(selected)) return;
    const a = clips[selected];
    if (!a.paused && !a.ended) return;
    const attempt = ++token; pending = true;
    Promise.resolve(a.play()).then(() => {
      if (attempt !== token) { if (!audible() || clips[selected] !== a) a.pause(); return; }
      pending = false;
      if (!audible() || clips[selected] !== a) { a.pause(); return; }
      blocked = false; publish();
    }).catch(error => {
      if (attempt !== token) return;
      pending = false;
      if (error?.name === 'NotAllowedError') blocked = true;
      else if (error?.name !== 'AbortError') failed.add(selected);
      publish();
    });
  }
  function sync() {
    const next = wanted();
    if (next !== selected) { stop(); selected = next; blocked = false;if(next>=0&&(next===combatIndex||next===crewEnemyIndex||leaderIndices.includes(next)||nightmareIndices.includes(next)||predatorIndices.includes(next)))clips[next].currentTime=0; }
    if (!audible()) stop(); else play();
    publish();
  }
  clips.forEach((a, index) => {
    a.onended = () => {
      if(index===selected&&index===siegeIndex){onTrackEnded({role:'siege',title:tracks[index].title});publish();return;}
      if (index !== selected || index === 0 || !['roam','roam-chapter4'].includes(scene)) return;
      const list=scene==='roam-chapter4'?chapter4RoamIndices:roamIndices,next=list[(list.indexOf(index)+1)%list.length];
      a.currentTime = 0;if(scene==='roam-chapter4')chapter4RoamIndex=next;else roamIndex=next;sync();
    };
    a.onerror = () => { failed.add(index); if (index === selected) publish(); };
  });
  return {
    startSession,
    seek(role,time) { const i=tracks.findIndex(q=>q.role===role);if(i>=0)clips[i].currentTime=Math.max(0,Number(time)||0); },
    trackTime(role) { const i=tracks.findIndex(q=>q.role===role);return i>=0?clips[i].currentTime:0; },
    setContext(context) {
      if(context.scene==='roam'&&roamIndex<0)startSession();
      if(context.scene==='roam-chapter4'&&chapter4RoamIndex<0)startSession();
      if(context.scene==='predator'&&scene!=='predator'&&predatorIndices.length)predatorIndex=predatorIndices[Math.min(predatorIndices.length-1,Math.floor(Math.max(0,random())*predatorIndices.length))];
      scene = context.scene; paused = !!context.paused; hidden = !!context.hidden; duck = !!context.duck;
      sync();
    },
    setEnabled(on) { enabled = !!on; blocked = false; sync(); },
    setVolume(value) { volume = Math.max(0, Math.min(1, Number(value) || 0)); publish(); },
    unlock() { blocked = false; sync(); },
    tick(dt) {
      if (selected < 0 || !audible()) return;
      const a = clips[selected], target = volume * (duck ? .2 : 1);
      const step = Math.max(0, dt) * .5;
      a.volume += Math.sign(target - a.volume) * Math.min(step, Math.abs(target - a.volume));
    }
  };
}
if (typeof module !== 'undefined') module.exports = {createNVMusicPlayer};
