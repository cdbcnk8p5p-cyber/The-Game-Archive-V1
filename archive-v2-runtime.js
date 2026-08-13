(()=>{
'use strict';
const KEY='the-gaming-archive-v1';
const getState=()=>{try{return JSON.parse(localStorage.getItem(KEY))||window.GAMING_ARCHIVE_SEED}catch{return window.GAMING_ARCHIVE_SEED}};
const byId=id=>document.getElementById(id);
const finished=g=>g&&(g.status==='Beaten'||g.status==='Completed');
const FILTER_FAMILIES=['Nintendo','PC','PlayStation','Sega','Xbox'];
const icon=f=>({Nintendo:'🔴',PC:'🖥️',PlayStation:'🟦',Sega:'⚫',Xbox:'🟩'})[f]||'🎮';
function oldFamilyButton(name){return [...document.querySelectorAll('#platformTabs button')].find(b=>b.dataset.family===name)}
function ensureSegaOption(type){
 if(!type||[...type.options].some(o=>o.value==='Sega'))return;
 const option=document.createElement('option');
 option.value='Sega';option.textContent='Sega';
 const xbox=[...type.options].find(o=>o.value==='Xbox');
 type.insertBefore(option,xbox||null);
}
function setFilterTheme(value){
 const bar=document.querySelector('.archive-filterbar');
 if(bar)bar.dataset.filter=value||'none';
}
function refreshSectionSummaries(games,family,choice){
 document.querySelectorAll('.platform-section').forEach(section=>{
  const visible=[...section.querySelectorAll('.game-card')].filter(c=>c.style.display!=='none');
  if(!visible.length){section.style.display='none';return}
  section.style.display='';
  const entries=visible.map(c=>games.find(g=>g.id===c.dataset.id)).filter(Boolean);
  const total=entries.length;
  const beaten=entries.filter(finished).length;
  const rate=total?Math.round(beaten/total*1000)/10:0;
  const summary=section.querySelector('.platform-summary');
  if(summary)summary.textContent=`${total} ${total===1?'game':'games'} • ${beaten} beaten • ${rate}% story completion`;
  const heading=section.querySelector('.platform-heading h2');
  if(heading&&family&&entries.every(g=>g.family===family))heading.textContent=`${icon(family)} ${choice||family}`;
 });
}
function applyConsoleFilter(){
 const type=byId('gameFilterType'),opt=byId('gameFilterOption');
 if(!type||!opt)return;
 const games=(getState()?.games)||[];
 const family=FILTER_FAMILIES.includes(type.value)?type.value:'';
 const choice=opt.value;
 document.querySelectorAll('.game-card').forEach(card=>{
  const g=games.find(x=>x.id===card.dataset.id);
  let show=true;
  if(g&&family){
   show=g.family===family;
   if(show&&choice){
    if(family==='PC')show=[g.storefront,g.launcher,g.platform].filter(Boolean).includes(choice);
    else show=g.platform===choice;
   }
  }
  card.style.display=show?'':'none';
 });
 refreshSectionSummaries(games,family,choice);
}
function renderFromFilters(){
 const type=byId('gameFilterType'),opt=byId('gameFilterOption'),legacy=byId('gameStatusFilter');
 if(!type||!opt||!legacy)return;
 const value=type.value;
 setFilterTheme(value);
 if(value==='status'){
  oldFamilyButton('All')?.click();
  legacy.value=opt.value||'';
  legacy.dispatchEvent(new Event('change',{bubbles:true}));
 }else if(FILTER_FAMILIES.includes(value)){
  legacy.value='';
  oldFamilyButton(value==='Sega'?'Other':value)?.click();
 }else{
  legacy.value='';
  oldFamilyButton('All')?.click();
 }
 setTimeout(applyConsoleFilter,0);
}
function init(){
 const type=byId('gameFilterType'),opt=byId('gameFilterOption'),search=byId('gameSearch'),tabs=byId('platformTabs');
 if(tabs)tabs.style.display='none';
 if(!type||!opt||!window.GAMING_ARCHIVE_FILTERS)return;
 const games=(getState()?.games)||[];
 ensureSegaOption(type);
 type.value='';
 setFilterTheme('');
 window.GAMING_ARCHIVE_FILTERS.populate(type,opt,games);
 type.addEventListener('change',()=>{
  setFilterTheme(type.value);
  window.GAMING_ARCHIVE_FILTERS.populate(type,opt,games);
  renderFromFilters();
 });
 opt.addEventListener('change',renderFromFilters);
 search?.addEventListener('input',()=>setTimeout(applyConsoleFilter,0));
 renderFromFilters();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(init,50));else setTimeout(init,50);
})();