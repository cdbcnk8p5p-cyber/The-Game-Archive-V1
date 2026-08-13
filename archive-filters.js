(()=>{
'use strict';
const FILTER_OPTIONS={
 Nintendo:['Nintendo 3DS','Nintendo DS','Nintendo Switch','Wii','Wii U'],
 PC:['Epic Games Store','GOG','Microsoft Store','Rockstar Games Launcher','Steam'],
 PlayStation:['PlayStation','PlayStation 2','PlayStation 3','PlayStation 4','PlayStation 5','PlayStation Portable','PlayStation Vita'],
 Sega:['Dreamcast','Game Gear','Mega Drive','Master System','Saturn'],
 Xbox:['Xbox','Xbox 360','Xbox One','Xbox Series X/S']
};
function optionList(type,games){
 if(type==='status')return [...new Set(games.map(g=>g.status).filter(Boolean))].sort((a,b)=>a.localeCompare(b));
 return FILTER_OPTIONS[type]||[];
}
window.GAMING_ARCHIVE_FILTERS={
 options:FILTER_OPTIONS,
 populate(typeSelect,optionSelect,games){
  const type=typeSelect.value;
  optionSelect.innerHTML='<option value="">All games</option>';
  optionList(type,games).forEach(value=>{
   const option=document.createElement('option');option.value=value;option.textContent=value;optionSelect.appendChild(option);
  });
  optionSelect.disabled=!type;
 },
 matches(game,type,option){
  if(!type)return true;
  if(type==='status')return !option||game.status===option;
  if(type==='PC')return game.family==='PC'&&(!option||[game.storefront,game.launcher,game.platform].filter(Boolean).includes(option));
  if(Object.prototype.hasOwnProperty.call(FILTER_OPTIONS,type))return game.family===type&&(!option||game.platform===option);
  return true;
 }
};
})();

(()=>{
'use strict';
const KEY='the-gaming-archive-v1',FAMILIES=['Nintendo','PC','PlayStation','Sega','Xbox'];
const byId=id=>document.getElementById(id);
const getState=()=>{try{return JSON.parse(localStorage.getItem(KEY))||window.GAMING_ARCHIVE_SEED}catch{return window.GAMING_ARCHIVE_SEED}};
const finished=x=>x&&(x.status==='Beaten'||x.status==='Completed');
const percent=(a,b)=>b?Math.round(a/b*1000)/10:0;
function familyFor(platform,explicit){if(FAMILIES.includes(explicit))return explicit;const p=String(platform||'').toLowerCase();if(/playstation|^ps[1-5]\b|\bpsp\b|vita/.test(p))return'PlayStation';if(/xbox/.test(p))return'Xbox';if(/nintendo|switch|wii|3ds|\bds\b/.test(p))return'Nintendo';if(/sega|dreamcast|saturn|mega drive|master system|game gear/.test(p))return'Sega';if(/\bpc\b|steam|gog|epic games|rockstar games launcher|microsoft store/.test(p))return'PC';return''}
function dlcFamily(d,games){const parent=games.find(g=>g.id===d.parentGameId)||games.find(g=>g.title===d.parentGame);return familyFor(d.platform,d.family||parent?.family)}
function ensureDlcFilters(){
 const summary=byId('dlcSummary');if(!summary||byId('dlcFilterBar'))return;
 const bar=document.createElement('div');bar.id='dlcFilterBar';bar.className='toolbar archive-filterbar dlc-filterbar';bar.dataset.filter='none';
 const search=document.createElement('input');search.id='dlcSearch';search.type='search';search.placeholder='Search DLC, parent game or platform…';search.setAttribute('aria-label','Search DLC');
 const type=document.createElement('select');type.id='dlcFilterType';type.setAttribute('aria-label','Choose DLC filter');type.innerHTML='<option value="">Filter…</option><option value="status">Completion Status</option><option value="Nintendo">Nintendo</option><option value="PC">PC</option><option value="PlayStation">PlayStation</option><option value="Sega">Sega</option><option value="Xbox">Xbox</option>';
 const opt=document.createElement('select');opt.id='dlcFilterOption';opt.setAttribute('aria-label','Choose DLC filter option');opt.disabled=true;opt.innerHTML='<option value="">All DLC</option>';
 bar.append(search,type,opt);summary.insertAdjacentElement('beforebegin',bar);
 const ui=window.GAMING_ARCHIVE_V2_UI;ui?.buildCustomSelect(type,'type');ui?.buildCustomSelect(opt,'option');
 type.addEventListener('change',()=>{populateDlcOptions();applyDlcFilters()});opt.addEventListener('change',applyDlcFilters);search.addEventListener('input',applyDlcFilters);
}
function populateDlcOptions(){
 const type=byId('dlcFilterType'),opt=byId('dlcFilterOption'),bar=byId('dlcFilterBar');if(!type||!opt)return;const state=getState(),value=type.value;bar.dataset.filter=value||'none';
 let values=value==='status'?[...new Set((state.dlc||[]).map(d=>d.status).filter(Boolean))].sort((a,b)=>a.localeCompare(b)):(window.GAMING_ARCHIVE_FILTERS?.options?.[value]||[]);
 opt.innerHTML='<option value="">All DLC</option>'+values.map(v=>`<option value="${v}">${v}</option>`).join('');opt.disabled=!value;opt.value='';
 const ui=window.GAMING_ARCHIVE_V2_UI;ui?.syncCustom(type,true);ui?.syncCustom(opt,true);
}
function applyDlcFilters(){
 const type=byId('dlcFilterType'),opt=byId('dlcFilterOption'),search=byId('dlcSearch'),list=byId('dlcList');if(!type||!opt||!search||!list)return;
 const state=getState(),games=state.games||[],dlc=state.dlc||[],q=search.value.trim().toLowerCase(),kind=type.value,choice=opt.value,cards=[...list.querySelectorAll('.dlc-card')],shown=[];
 dlc.forEach((d,i)=>{const fam=dlcFamily(d,games);let show=!q||[d.title,d.parentGame,d.platform,d.status].join(' ').toLowerCase().includes(q);if(show&&kind==='status')show=!choice||d.status===choice;else if(show&&FAMILIES.includes(kind)){show=fam===kind;if(show&&choice)show=kind==='PC'?[d.storefront,d.launcher,d.platform].filter(Boolean).includes(choice):d.platform===choice}const card=cards[i];if(card){card.dataset.platformTheme=fam;card.style.display=show?'':'none'}if(show)shown.push(d)});
 const active=!!(q||kind||choice),done=shown.filter(finished).length,rate=percent(done,shown.length),summary=byId('dlcSummary');if(summary)summary.innerHTML=`<article><small>${active?'Shown DLC':'Total DLC'}</small><strong>${shown.length}</strong><span>${active?'matching entries':'separate entries'}</span></article><article><small>Completed</small><strong>${done}</strong><span>finished add-ons</span></article><article><small>DLC progress</small><strong>${rate}%</strong><span>does not affect main stats</span></article>`;
 let empty=byId('dlcFilterEmpty');if(!empty){empty=document.createElement('article');empty.id='dlcFilterEmpty';empty.className='panel dlc-filter-empty';empty.textContent='No DLC match those filters.';list.insertAdjacentElement('afterend',empty)}empty.hidden=shown.length>0;scheduleColouring();
}
function terms(){const state=getState(),set=new Set(FAMILIES);(state.games||[]).forEach(g=>g.platform&&set.add(g.platform));(state.dlc||[]).forEach(d=>d.platform&&set.add(d.platform));Object.values(window.GAMING_ARCHIVE_FILTERS?.options||{}).flat().forEach(v=>set.add(v));return[...set].filter(Boolean).sort((a,b)=>b.length-a.length)}
function escRegex(s){return String(s).replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}
function colourPlatformMentions(){
 const vals=terms();if(!vals.length)return;const re=new RegExp('('+vals.map(escRegex).join('|')+')','gi');
 const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT,{acceptNode(node){const p=node.parentElement;if(!p||!node.nodeValue.trim()||p.closest('.platform-tone,.v2-custom-select,.archive-filterbar,select,option,script,style'))return NodeFilter.FILTER_REJECT;re.lastIndex=0;return re.test(node.nodeValue)?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT}}),nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
 nodes.forEach(node=>{const text=node.nodeValue,frag=document.createDocumentFragment();let last=0,m;re.lastIndex=0;while((m=re.exec(text))){if(m.index>last)frag.append(document.createTextNode(text.slice(last,m.index)));const span=document.createElement('span');span.className='platform-tone';span.dataset.platformTheme=familyFor(m[0]);span.textContent=m[0];frag.append(span);last=m.index+m[0].length}if(last){if(last<text.length)frag.append(document.createTextNode(text.slice(last)));node.replaceWith(frag)}});
 document.querySelectorAll('#platformChart .bar-row').forEach(row=>{const fam=familyFor(row.querySelector('.bar-label')?.textContent||'');if(fam)row.dataset.platformTheme=fam});
}
let colourTimer;function scheduleColouring(){clearTimeout(colourTimer);colourTimer=setTimeout(colourPlatformMentions,25)}
function init(){ensureDlcFilters();populateDlcOptions();applyDlcFilters();scheduleColouring();const list=byId('dlcList');if(list)new MutationObserver(()=>setTimeout(applyDlcFilters,0)).observe(list,{childList:true});new MutationObserver(scheduleColouring).observe(document.body,{childList:true,subtree:true});document.addEventListener('submit',()=>setTimeout(()=>{populateDlcOptions();applyDlcFilters();scheduleColouring()},60))}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(init,180));else setTimeout(init,180);
})();