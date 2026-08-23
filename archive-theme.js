(()=>{
'use strict';
function syncThemeChrome(){
 const light=document.body.classList.contains('light');
 document.documentElement.dataset.archiveTheme=light?'light':'dark';
 document.documentElement.style.colorScheme=light?'light':'dark';
 const meta=document.querySelector('meta[name="theme-color"]');
 if(meta)meta.setAttribute('content',light?'#ffffff':'#0f1722');
 const btn=document.getElementById('themeBtn');
 if(btn){
  btn.setAttribute('aria-label',light?'Switch to dark mode':'Switch to light mode');
  btn.setAttribute('title',light?'Switch to dark mode':'Switch to light mode');
 }
}
function init(){
 syncThemeChrome();
 new MutationObserver(syncThemeChrome).observe(document.body,{attributes:true,attributeFilter:['class']});
 document.getElementById('themeBtn')?.addEventListener('click',()=>setTimeout(syncThemeChrome,0));
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
