(()=>{
'use strict';
const KEY='the-gaming-archive-v1';
const getState=()=>{try{return JSON.parse(localStorage.getItem(KEY))||window.GAMING_ARCHIVE_SEED}catch{return window.GAMING_ARCHIVE_SEED}};
const byId=id=>document.getElementById(id);
const finished=g=>g&&(g.status==='Beaten'||g.status==='Completed');
const FILTER_FAMILIES=['Nintendo','PC','PlayStation','Sega','Xbox'];
const icon=f=>({Nintendo:'🔴',PC:'🖥️',PlayStation:'🟦',Sega:'⚫',Xbox:'🟩'})[f]||'🎮';
const customSelects=new Map();
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
 syncCustomTheme();
}
function customTheme(select){
 if(select.id==='gameFilterType')return select.value||'none';
 return byId('gameFilterType')?.value||'none';
}
function closeCustom(api){
 if(!api)return;
 api.menu.hidden=true;
 api.trigger.setAttribute('aria-expanded','false');
 api.wrapper.classList.remove('open');
}
function closeAllCustom(except){customSelects.forEach(api=>{if(api!==except)closeCustom(api)})}
function renderCustomOptions(api){
 const {select,menu,kind}=api;
 menu.innerHTML='';
 [...select.options].forEach(option=>{
  const item=document.createElement('button');
  item.type='button';
  item.className='v2-custom-option';
  item.setAttribute('role','option');
  item.dataset.value=option.value;
  if(kind==='type')item.dataset.optionTheme=option.value||'none';
  item.textContent=option.textContent;
  const selected=option.value===select.value;
  item.setAttribute('aria-selected',selected?'true':'false');
  if(selected)item.classList.add('selected');
  item.addEventListener('click',()=>{
   select.value=option.value;
   select.dispatchEvent(new Event('change',{bubbles:true}));
   closeCustom(api);
  });
  menu.appendChild(item);
 });
}
function syncCustom(select,rebuild=false){
 const api=customSelects.get(select);if(!api)return;
 api.wrapper.dataset.theme=customTheme(select);
 const selected=[...select.options].find(o=>o.value===select.value)||select.options[0];
 api.label.textContent=selected?.textContent||'';
 api.trigger.disabled=!!select.disabled;
 api.wrapper.classList.toggle('disabled',!!select.disabled);
 if(rebuild)renderCustomOptions(api);
 else [...api.menu.children].forEach(item=>{
  const chosen=item.dataset.value===select.value;
  item.classList.toggle('selected',chosen);
  item.setAttribute('aria-selected',chosen?'true':'false');
 });
}
function syncCustomTheme(){customSelects.forEach((_,select)=>syncCustom(select,false))}
function buildCustomSelect(select,kind){
 if(!select||customSelects.has(select))return;
 select.classList.add('v2-native-select');
 select.setAttribute('aria-hidden','true');
 select.tabIndex=-1;
 const wrapper=document.createElement('div');
 wrapper.className='v2-custom-select';
 wrapper.dataset.kind=kind;
 const trigger=document.createElement('button');
 trigger.type='button';
 trigger.className='v2-custom-trigger';
 trigger.setAttribute('aria-haspopup','listbox');
 trigger.setAttribute('aria-expanded','false');
 const label=document.createElement('span');label.className='v2-custom-label';
 const arrow=document.createElement('span');arrow.className='v2-custom-arrow';arrow.textContent='⌄';arrow.setAttribute('aria-hidden','true');
 trigger.append(label,arrow);
 const menu=document.createElement('div');
 menu.className='v2-custom-menu';menu.setAttribute('role','listbox');menu.hidden=true;
 wrapper.append(trigger,menu);
 select.insertAdjacentElement('afterend',wrapper);
 const api={select,wrapper,trigger,label,menu,kind};
 customSelects.set(select,api);
 renderCustomOptions(api);syncCustom(select,false);
 trigger.addEventListener('click',()=>{
  if(trigger.disabled)return;
  const willOpen=menu.hidden;
  closeAllCustom(api);
  menu.hidden=!willOpen;
  wrapper.classList.toggle('open',willOpen);
  trigger.setAttribute('aria-expanded',willOpen?'true':'false');
 });
 select.addEventListener('change',()=>syncCustom(select,true));
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
 buildCustomSelect(type,'type');
 buildCustomSelect(opt,'option');
 type.addEventListener('change',()=>{
  setFilterTheme(type.value);
  window.GAMING_ARCHIVE_FILTERS.populate(type,opt,games);
  syncCustom(type,true);syncCustom(opt,true);
  renderFromFilters();
 });
 opt.addEventListener('change',()=>{syncCustom(opt,true);renderFromFilters()});
 search?.addEventListener('input',()=>setTimeout(applyConsoleFilter,0));
 document.addEventListener('pointerdown',e=>{customSelects.forEach(api=>{if(!api.wrapper.contains(e.target))closeCustom(api)})});
 document.addEventListener('keydown',e=>{if(e.key==='Escape')closeAllCustom()});
 renderFromFilters();syncCustom(type,true);syncCustom(opt,true);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(init,50));else setTimeout(init,50);
})();