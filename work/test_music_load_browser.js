const assert = require('node:assert/strict');
const path = require('node:path');
const {pathToFileURL} = require('node:url');
const {chromium} = require('C:/Users/HOME/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async () => {
  const browser = await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  try {
    const page = await browser.newPage(), errors = [];
    page.on('pageerror', e => errors.push(e.stack));
    await page.addInitScript(() => {
      requestAnimationFrame = () => 0; setInterval = () => 0;
      const random = Math.random;
      Math.random = () => typeof window.musicForcedRandom === 'number' ? window.musicForcedRandom : random();
      const NativeAudio = Audio;
      window.Audio = function(src) {
        const audio = new NativeAudio(src);
        Object.defineProperty(audio,'preload',{get:()=>audio.getAttribute('preload')||'none',set:v=>audio.setAttribute('preload',v==='metadata'?'none':v)});
        return audio;
      };
    });
    await page.goto(pathToFileURL(path.resolve('outputs/NOSTRAVECTOR_Main_Menu.html')).href,{waitUntil:'domcontentloaded',timeout:120000});
    const result = await page.evaluate(() => {
      soundtrack.setEnabled(false);
      creatingCharacter=true;
      writeGameSave({...DEFAULT_WANDERER,name:'Music Load QA'},{chapter:3});
      creatingCharacter=false;
      updateGameProgress(chapterRestartProgress(savedGame,3));
      const storage=localStorage.getItem(CHARACTER_SAVES_KEY), titles=[];
      const start=soundtrack.startSession;
      let choice=0, calls=0;
      soundtrack.startSession=()=>{
        calls++; window.musicForcedRandom=choice;
        try { start(); } finally { delete window.musicForcedRandom; }
      };
      for (choice of [0,.5,.999]) {
        startAntarctica(); syncSoundtrack();
        titles.push($('#nowPlayingTitle').textContent);
        const before=calls;
        gamePaused=true;syncSoundtrack();gamePaused=false;syncSoundtrack();
        if(calls!==before)throw Error('Pause rerolled music');
        exitPolar();syncSoundtrack();
        if($('#nowPlayingTitle').textContent!=='NOSTRAVECTOR MAIN MENU THEME')throw Error('Menu theme changed');
      }
      return {titles,calls,unchanged:localStorage.getItem(CHARACTER_SAVES_KEY)===storage};
    });
    assert.deepEqual(result.titles,['WONDERS OF LANIAKEA','SOL','COSMOS']);
    assert.equal(result.calls,3);assert.equal(result.unchanged,true);assert.deepEqual(errors,[]);
    console.log('Passed real gameplay loads selecting each free-roam track, stable pause/resume, unchanged menu theme and no gameplay save writes.');
  } finally { await browser.close(); }
})().catch(e=>{console.error(e);process.exitCode=1;});
