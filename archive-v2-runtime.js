(()=>{
'use strict';
const KEY='the-gaming-archive-v1';
const getState=()=>{try{return JSON.parse(localStorage.getItem(KEY))||window.GAMING_ARCHIVE_SEED}catch{return window.GAMING_ARCHIVE_SEED}};
const byId=id=>document.getElementById(id);
function oldFamilyButton(name){return [...document.querySelectorAll('#platformTabs button')].find(b=>b.dataset.family===name)}
function applyConsoleFilter(){
 const type=byId('gameFilterType'),opt=byId('gameFilterOption');
 if(!type||!opt)return;
 const games=(getState()?.games)||[];
 const family=['Nintendo','PC','PlayStation','Xbox'].includes(type.value)?type.value:'';
 const choice=opt.value;
 document.querySelectorAll('.game-card').forEach(card=>{
  const g=games.find(x=>x.id===card.dataset.id);
  let show=true;
  if(g&&family&&choice){
   if(family==='PC')show=[g.storefront,g.launcher,g.platform].filter(Boolean).includes(choice);
   else show=g.platform===choice;
  }
  card.style.display=show?'':'none';
 });
 document.querySelectorAll('.platform-section').forEach(section=>{
  section.style.display=[...section.querySelectorAll('.game-card')].some(c=>c.style.display!=='none')?'':'none';
 });
}
function renderFromFilters(){
 const type=byId('gameFilterType'),opt=byId('gameFilterOption'),legacy=byId('gameStatusFilter');
 if(!type||!opt||!legacy)return;
 const value=type.value;
 if(value==='status'){
  oldFamilyButton('All')?.click();
  legacy.value=opt.value||'';
  legacy.dispatchEvent(new Event('change',{bubbles:true}));
 }else if(['Nintendo','PC','PlayStation','Xbox'].includes(value)){
  legacy.value='';
  oldFamilyButton(value)?.click();
 }else{
  legacy.value='';
  oldFamilyButton('All')?.click();
 }
 setTimeout(applyConsoleFilter,0);
}
function init(){
 const type=byId('gameFilterType'),opt=byId('gameFilterOption'),search=byId('gameSearch');
 if(!type||!opt||!window.GAMING_ARCHIVE_FILTERS)return;
 const games=(getState()?.games)||[];
 type.value='';
 window.GAMING_ARCHIVE_FILTERS.populate(type,opt,games);
 type.addEventListener('change',()=>{
  window.GAMING_ARCHIVE_FILTERS.populate(type,opt,games);
  renderFromFilters();
 });
 opt.addEventListener('change',renderFromFilters);
 search?.addEventListener('input',()=>setTimeout(applyConsoleFilter,0));
 renderFromFilters();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(init,50));else setTimeout(init,50);
})();