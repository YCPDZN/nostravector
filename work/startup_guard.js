// Installed before the main script so a startup exception cannot leave an endless loading label.
window.NVStartup={loaded:false,error:'',previewError:'',
 report(error){this.error=String(error?.message||error||'Unknown loading error').slice(0,400);const el=document.getElementById('loadStatus');if(el){el.hidden=false;el.textContent='LOAD ERROR: '+this.error+' — Your saved games are retained.';}},
 preview(error){this.previewError=String(error?.message||error||'Preview unavailable').slice(0,200);const el=document.getElementById('loadStatus');if(el){el.hidden=false;el.textContent='MENU PREVIEW UNAVAILABLE / Save selection and Continue are still available.';}console.warn('Menu preview:',error);},
 ready(){this.loaded=true;const el=document.getElementById('loadStatus');if(el&&!this.error&&!this.previewError){el.textContent='';el.hidden=true;}}
};
window.addEventListener('error',event=>{if(!window.NVStartup.loaded&&event.error)window.NVStartup.report(event.error);});
