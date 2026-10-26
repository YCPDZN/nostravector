const MUSIC_TRACKS = __MUSIC_TRACKS__;
const soundtrack = createNVMusicPlayer({tracks: MUSIC_TRACKS, AudioClass: Audio, onTrackEnded: track => {
  if(track.role==='siege'&&gameActive&&polarState&&typeof NVJaniraSiege!=='undefined')NVJaniraSiege.ensure(polarState).musicEnded=true;
}, onStatus: status => {
  sound = status.enabled; volume = status.volume;
  const label = !status.enabled ? 'MUSIC OFF' : status.blocked ? 'PLAY MUSIC' : 'MUSIC ON';
  for (const id of ['#soundToggle', '#worldMusicToggle']) {
    $(id).textContent = label; $(id).setAttribute('aria-pressed', String(status.enabled));
  }
  $('#audio').checked = status.enabled;
  for (const id of ['#volume', '#worldMusicVolume']) $(id).value = status.volume;
  const text = !status.enabled ? 'SOUNDTRACK / OFF' : status.failed ? 'MUSIC UNAVAILABLE' :
    status.blocked ? 'SOUNDTRACK / CLICK PLAY MUSIC' :
    ['nightmare-orion','nightmare-tyrotaronus','nightmare-josiah','nightmare-zark','roam','roam-chapter4','combat','predator','siege','mercury','mascar','mascar-piano','crew-enemy','leader-darius','leader-vishara','leader-hak','leader-grek','leader-archamus-light-egg','catharsis-final'].includes(status.scene) ? 'SOUNDTRACK / ' + status.title :
    ['menu','menu-chapter4'].includes(status.scene) ? 'SOUNDTRACK / ' + status.title : status.scene==='chapter4-silence' ? 'SOUNDTRACK / SILENT' : 'SOUNDTRACK / PAUSED';
  $('#musicStatus').textContent = text; $('#worldMusicStatus').textContent = text;
  const banner=$('#nowPlaying');
  banner.hidden=!status.enabled||!status.title||status.failed||!['nightmare-orion','nightmare-tyrotaronus','nightmare-josiah','nightmare-zark','menu','menu-chapter4','roam','roam-chapter4','combat','predator','siege','mercury','mascar','mascar-piano','crew-enemy','leader-darius','leader-vishara','leader-hak','leader-grek','leader-archamus-light-egg','catharsis-final'].includes(status.scene);
  banner.dataset.scene=status.scene;
  if($('#nowPlayingTitle').textContent!==status.title)$('#nowPlayingTitle').textContent=status.title;
  const playingLabel=status.blocked?'CLICK MUSIC TO PLAY':status.playing?'NOW PLAYING':'SOUNDTRACK / PAUSED';
  if($('#nowPlayingLabel').textContent!==playingLabel)$('#nowPlayingLabel').textContent=playingLabel;
}});
function syncSoundtrack() {
  const nightmare=typeof NVBeamStruggleUI!=='undefined'&&NVBeamStruggleUI?.musicContext();
  if(nightmare){soundtrack.setContext(nightmare);return;}
  // The scripted Olympus Mons advance also uses the combat arrangement.
  const p=polarState?.space;
  const catharsisFinal=gameActive&&typeof NVCatharsisFinal!=='undefined'&&NVCatharsisFinal.active(polarState);
  const zarkCinematic=gameActive&&typeof zarkScene!=='undefined'&&!!zarkScene&&!zarkPaused;
  const mercury=gameActive&&typeof NVMercuryFinale!=='undefined'&&NVMercuryFinale.active(polarState);
  const siege=gameActive&&typeof NVJaniraSiege!=='undefined'&&NVJaniraSiege.musicActive(polarState);
  const rallyCinematic=gameActive&&typeof janiraRallyScene!=='undefined'&&janiraRallyScene&&!janiraRallyScene.paused;
  const rallySpeaking=gameActive&&typeof NVJaniraRallyVoice!=='undefined'&&NVJaniraRallyVoice.active()&&!NVJaniraRallyVoice.state.muted;
  const marsAdvance=gameActive&&typeof NVKhazglar!=='undefined'&&NVKhazglar.fighting(polarState)&&!(typeof imperiaArrivalActive==='function'&&imperiaArrivalActive())&&!(typeof khazglarCutsceneActive==='function'&&khazglarCutsceneActive());
  const karribassaCombat=gameActive&&typeof NVKarribassaBosses!=='undefined'&&NVKarribassaBosses.fighting(polarState);
  const mascarOrbitCinematic=gameActive&&typeof mascarOrbitOpen!=='undefined'&&mascarOrbitOpen&&!mascarOrbitPaused;
  const mascarBattle=gameActive&&((typeof NVVengefulMascar!=='undefined'&&NVVengefulMascar.fighting(polarState))||(typeof NVMascarRampage!=='undefined'&&(NVMascarRampage.ensure(polarState).stage==='cutscene'||NVMascarRampage.engaged(polarState)||NVMascarRampage.ensure(polarState).defeatTime>0)));
  const mascarPiano=gameActive&&typeof NVMascarRampage!=='undefined'&&NVVengefulMascar.ensure(polarState).form===3&&['active','defeat'].includes(NVMascarRampage.ensure(polarState).stage);
  const mascarCombat=gameActive&&typeof NVVengefulMascar!=='undefined'&&NVVengefulMascar.fighting(polarState);
  const croxianSpeaking=gameActive&&typeof NVCroxianVoice!=='undefined'&&NVCroxianVoice.active()&&!NVCroxianVoice.state.muted;
  const victorySpeaking=gameActive&&typeof janiraVictoryOpen!=='undefined'&&janiraVictoryOpen&&!janiraVictoryPaused;
  const rageSpeaking=gameActive&&typeof solRageOpen!=='undefined'&&solRageOpen&&!solRagePaused;
  const mascarSpeaking=gameActive&&typeof mascarSceneOpen!=='undefined'&&mascarSceneOpen&&!mascarScenePaused;
  const chapter4Scene=gameActive&&typeof chapter4Open!=='undefined'&&chapter4Open&&!chapter4Paused;
  const leaderTheme=gameActive&&typeof NVFactionLeaders!=='undefined'&&NVFactionLeaders.battle(polarState);
  const fortressGovernor=gameActive&&typeof NVFortressCampaign!=='undefined'&&NVFortressCampaign.battle(polarState);
  const crewEnemy=gameActive&&typeof NVCrewEnemyEncounter!=='undefined'&&NVCrewEnemyEncounter.battle(polarState);
  const combat=gameActive&&(p?.phase==='flight'&&p.combatActive===true||marsAdvance||karribassaCombat||mascarCombat||(gameActive&&typeof NVSiegeOfSol!=='undefined'&&NVSiegeOfSol.started(polarState)&&NVSiegeOfSol.near(polarState)&&!NVSiegeOfSol.ensure(polarState).confronted));
  const predator=gameActive&&ecologyPlayable()&&NVEcology.populate(polarState).animals.some(a=>a.mode==='hunting'&&Math.hypot(a.x-polarState.x,a.z-polarState.z)<24);
  const brownSpeaking=(typeof solFallOpen!=='undefined'&&solFallOpen&&!solFallPaused)||(typeof brownEncounterOpen!=='undefined'&&brownEncounterOpen&&!brownEncounterPaused)||(typeof brownReturnVoice!=='undefined'&&!!brownReturnVoice.key)||(typeof brownFateOpen!=='undefined'&&brownFateOpen&&!brownFatePaused);
  const archamusSpeaking=gameActive&&typeof archamusConversation!=='undefined'&&!!archamusConversation;
  const khazglarSpeaking=archamusSpeaking||(chapter4Scene&&NVChapter4.raw(polarState)?.stage!=='ambush')||(gameActive&&typeof solEpilogueOpen!=='undefined'&&solEpilogueOpen&&!solEpiloguePaused)||victorySpeaking||rageSpeaking||croxianSpeaking||mascarSpeaking||brownSpeaking||(gameActive&&typeof NVGovernorVoice!=='undefined'&&NVGovernorVoice.speaking())||(typeof brownScene!=='undefined'&&brownScene&&!brownScene.paused)||(typeof rewardDialogueOpen!=='undefined'&&rewardDialogueOpen||typeof charonBriefingOpen!=='undefined'&&charonBriefingOpen||typeof charonRobotOpen!=='undefined'&&charonRobotOpen)||(typeof khazglarCutsceneActive==='function'&&khazglarCutsceneActive())||(typeof imperiaArrivalActive==='function'&&imperiaArrivalActive());
  const speaking = gameActive && ((typeof NVDariusBossVoice!=='undefined'&&NVDariusBossVoice.speaking()) || (typeof NVVisharaBossVoice!=='undefined'&&NVVisharaBossVoice.speaking()) || (typeof NVCaraxEndingVoice!=='undefined'&&NVCaraxEndingVoice.speaking()) || (typeof NVZarkBossVoice!=='undefined'&&NVZarkBossVoice.speaking()) || (typeof NVArchamusPhase2Dialogue!=='undefined'&&NVArchamusPhase2Dialogue.speaking()) || (typeof NVHakBossVoice!=='undefined'&&NVHakBossVoice.speaking()) || (typeof NVArchamusBossVoice!=='undefined'&&NVArchamusBossVoice.speaking()) || (typeof NVOrionCombatVoice!=='undefined'&&NVOrionCombatVoice.speaking()) || (typeof NVOrionReliefVoice!=='undefined'&&NVOrionReliefVoice.active()) || (typeof NVCrewEnemyVoice!=='undefined'&&NVCrewEnemyVoice.speaking()) || (typeof NVOrionCroxianVoice!=='undefined'&&NVOrionCroxianVoice.speaking()) || (typeof NVHakAridaxxVoice!=='undefined'&&NVHakAridaxxVoice.context()) || rallySpeaking || khazglarSpeaking || (typeof NVBCVoice!=='undefined'&&NVBCVoice.speaking()) || (typeof solAlertVoice!=='undefined'&&solAlertVoice.index>=0) || (typeof NVKhazglar!=='undefined'&&NVKhazglar.troopsNearby(polarState)&&(NVKhazglar.ensure(polarState).battle?.shout||0)>0) || orionActive() || betrayalActive() || !polarState?.jamesIntroductionDone || jamesConversation.active ||
    hazardModalActive() || [currentJamesVoice(), currentHazardVoice()].some(a => a && !a.paused && !a.ended));
  soundtrack.setContext({scene: archamusSpeaking&&(archamusConversation.briefing||archamusConversation.contact)?'chapter4-silence':gameActive ? fortressGovernor?'crew-enemy':catharsisFinal?'catharsis-final':leaderTheme?leaderTheme:mascarBattle?(mascarPiano?'mascar-piano':'mascar'):crewEnemy?'crew-enemy':chapter5Unlocked(polarState)&&combat?'combat':chapter4VisualMood(polarState)?predator&&!chapter4Scene?'predator':chapter4Scene||combat?'chapter4-silence':'roam-chapter4':chapter4Scene&&NVChapter4.raw(polarState)?.stage==='ambush'?'combat':mercury?'mercury':siege?'siege':combat?'combat':predator?'predator':'roam' : introActive || customActive ? 'silent' : typeof chapter4MenuActive==='function'&&chapter4MenuActive()?'menu-chapter4':'menu',
    paused: gameActive && (gamePaused&&!zarkCinematic&&!khazglarSpeaking&&!rallyCinematic&&!chapter4Scene&&!mascarOrbitCinematic || !!polarState?.bedSleeping), hidden: document.hidden, duck: speaking});
}
function toggleMusic() {
  if ($('#soundToggle').textContent === 'PLAY MUSIC') soundtrack.unlock();
  else setSound(!sound);
}
$('#soundToggle').onclick = toggleMusic;
$('#worldMusicToggle').onclick = toggleMusic;
$('#volume').oninput = e => soundtrack.setVolume(e.target.value);
$('#worldMusicVolume').oninput = e => soundtrack.setVolume(e.target.value);
document.addEventListener('pointerdown', e => {
  if (!e.target.closest('#soundToggle, #worldMusicToggle')) soundtrack.unlock();
});
document.addEventListener('keydown', e => {
  if (!e.target.closest('#soundToggle, #worldMusicToggle')) soundtrack.unlock();
});
document.addEventListener('visibilitychange', syncSoundtrack);
const musicStartWorld = startAntarctica;
startAntarctica = () => {
  if (savedGame) soundtrack.startSession();
  musicStartWorld();
  if (gameActive) syncSoundtrack();
};
let musicLastTick = performance.now();
setInterval(() => {
  const now = performance.now(); syncSoundtrack(); soundtrack.tick(Math.min((now - musicLastTick) / 1000, .1)); musicLastTick = now;
}, 50);
syncSoundtrack();
