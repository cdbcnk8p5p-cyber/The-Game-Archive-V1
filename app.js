(()=>{
'use strict';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const KEY='the-gaming-archive-v1';
const THEME_KEY='the-gaming-archive-theme';
const deepClone=x=>JSON.parse(JSON.stringify(x));
const seed=()=>deepClone(window.GAMING_ARCHIVE_SEED);
let state=load();
let selectedFamily='All';
let editing=null;

function load(){
  try{
    const base=seed();
    const raw=localStorage.getItem(KEY);
    if(!raw) return base;
    const parsed=JSON.parse(raw);
    if(!Array.isArray(parsed.games)||!Array.isArray(parsed.dlc)) return base;
    const merged={...base,...parsed,version:'1.5'};
    merged.games=parsed.games.map(g=>{
      if(g.id==='ga-waw'||g.title==='Call of Duty: World at War'){
        return {
          ...g,
          platform:'Xbox 360',
          family:'Xbox',
          format:'Disc',
          status:'Beaten',
          startedDate:g.startedDate||'2026-08-09',
          completedDate:'2026-08-10',
          currentlyPlaying:false,
          notes:'Completed on Xbox 360.',
          cover:'./assets/covers/world-at-war.jpg'
        };
      }
      return g;
    });
    const gameIds=new Set(merged.games.map(g=>g.id));
    base.games.forEach(g=>{if(!gameIds.has(g.id))merged.games.push(g)});
    merged.dlc=parsed.dlc.slice();
    const dlcIds=new Set(merged.dlc.map(d=>d.id));
    base.dlc.forEach(d=>{if(!dlcIds.has(d.id))merged.dlc.push(d)});
    // Persist migrations immediately so refreshes keep the corrected data.
    localStorage.setItem(KEY,JSON.stringify(merged));
    return merged;
  }catch{return seed()}
}
function save(){localStorage.setItem(KEY,JSON.stringify(state))}
function esc(v=''){return String(v).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
function fmtDate(v){if(!v)return 'Unknown';const d=new Date(v+'T12:00:00');return Number.isNaN(d.getTime())?v:new Intl.DateTimeFormat('en-GB',{day:'2-digit',month:'2-digit',year:'numeric'}).format(d)}
function storyFinished(g){return g.status==='Beaten'||g.status==='Completed'}
function statusClass(s){return storyFinished({status:s})?'good':s==='Incomplete'?'warn':''}
function familyClass(f){return f==='PlayStation'?'ps':f==='Xbox'?'xbox':f==='PC'?'pc':f==='Nintendo'?'nintendo':''}
function familyIcon(f){return ({PlayStation:'🟦',Xbox:'🟩',PC:'🖥️',Nintendo:'🔴'})[f]||'⚪'}
function coverMarkup(item,cls='game-cover'){return item?.cover?`<img class="${cls}" src="${esc(item.cover)}" alt="${esc(item.title)} cover art" loading="lazy">`:`<div class="${cls} cover-placeholder" aria-hidden="true">🎮</div>`}
function pct(a,b){return b?Math.round((a/b)*1000)/10:0}
function completedMain(){return state.games.filter(storyFinished).filter(g=>g.completedDate).sort((a,b)=>a.completedDate.localeCompare(b.completedDate))}
function latestSave(){const arr=completedMain();const game=arr.at(-1);if(!game)return null;const memory=(state.memories||[]).find(m=>m.gameId===game.id);return {game,number:arr.length,quote:memory?.quote||'Story complete.'}}
function count100(){return state.games.filter(g=>g.status==='Completed').length}
function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>t.classList.remove('show'),2200)}
function go(page){$$('.page').forEach(p=>p.classList.toggle('active',p.id===page));$$('.drawer button[data-page]').forEach(b=>b.classList.toggle('active',b.dataset.page===page));closeDrawer();scrollTo({top:0,behavior:'smooth'});if(page==='roulette')resetRoulette()}
function openDrawer(){$('#drawer').classList.add('open');$('#scrim').classList.add('show')}
function closeDrawer(){$('#drawer').classList.remove('open');$('#scrim').classList.remove('show')}

function dashboard(){
  const total=state.games.length, beaten=state.games.filter(storyFinished).length, incomplete=state.games.filter(g=>g.status==='Incomplete').length;
  $('#headlineBeaten').textContent=beaten;$('#mainCount').textContent=total;$('#beatenCount').textContent=beaten;$('#incompleteCount').textContent=incomplete;$('#dlcCount').textContent=state.dlc.length;
  const playing=state.games.filter(g=>g.currentlyPlaying);
  const playingCoverWrap=$('#playingCoverWrap'),playingCover=$('#playingCover');
  if(playing.length){
    $('#playingTitle').textContent=playing.map(g=>g.title).join(' • ');
    $('#playingMeta').textContent=playing.map(g=>`${g.platform}${g.startedDate?' • started '+fmtDate(g.startedDate):''}`).join(' | ');
    const artGame=playing.find(g=>g.cover);
    if(artGame){playingCover.src=artGame.cover;playingCover.alt=artGame.title+' cover art';playingCoverWrap.classList.remove('hidden')}
    else{playingCover.removeAttribute('src');playingCover.alt='';playingCoverWrap.classList.add('hidden')}
  }else{
    $('#playingTitle').textContent='Nothing selected';
    $('#playingMeta').textContent='Mark a game as currently playing and it will appear here.';
    playingCover.removeAttribute('src');playingCover.alt='';playingCoverWrap.classList.add('hidden')
  }
  const latest=latestSave();
  const latestWrap=$('#latestSaveCoverWrap'),latestCover=$('#latestSaveCover');
  if(latest){
    $('#latestSaveTitle').textContent=latest.game.title;
    $('#latestSaveNumber').textContent='#'+latest.number;
    $('#latestSaveMeta').textContent=`${latest.game.platform} • ${fmtDate(latest.game.completedDate)}`;
    $('#latestSaveQuote').textContent='“'+latest.quote+'”';
    if(latest.game.cover){latestCover.src=latest.game.cover;latestCover.alt=latest.game.title+' cover art';latestWrap.classList.remove('hidden')}
    else{latestCover.removeAttribute('src');latestCover.alt='';latestWrap.classList.add('hidden')}
  }else{
    latestCover.removeAttribute('src');latestCover.alt='';latestWrap.classList.add('hidden')
  }
  const cp=pct(beaten,total);$('#homeCompletionPct').textContent=cp+'%';$('#homeCompletionBar').style.width=cp+'%';$('#homeCompletionText').textContent=`${beaten} of ${total} main stories beaten. ${count100()} tracked at 100%.`;
  const arr=completedMain(), ten=arr[9], first=arr[0];
  if(ten){$('#homeMilestoneTitle').textContent='10 games beaten';$('#homeMilestoneMeta').textContent=`${ten.title} • ${fmtDate(ten.completedDate)}`}
  else if(first){$('#homeMilestoneTitle').textContent='First game beaten';$('#homeMilestoneMeta').textContent=`${first.title} • ${fmtDate(first.completedDate)}`}
}

function games(){
  const families=['All','PlayStation','Xbox','PC','Nintendo','Other'];
  $('#platformTabs').innerHTML=families.map(f=>`<button data-family="${esc(f)}" class="${selectedFamily===f?'active':''}">${f==='All'?'🎮':familyIcon(f)} ${esc(f)}</button>`).join('');
  $$('#platformTabs button').forEach(b=>b.onclick=()=>{selectedFamily=b.dataset.family;games()});
  const q=($('#gameSearch').value||'').trim().toLowerCase(), status=$('#gameStatusFilter').value;
  let arr=state.games.filter(g=>(selectedFamily==='All'||(selectedFamily==='Other'?!['PlayStation','Xbox','PC','Nintendo'].includes(g.family):g.family===selectedFamily))&&(!status||g.status===status)&&(!q||[g.title,g.series,g.platform,g.format,g.status].join(' ').toLowerCase().includes(q)));
  const order=['PlayStation','Xbox','PC','Nintendo','Other'];
  const groups={};arr.forEach(g=>{const fam=['PlayStation','Xbox','PC','Nintendo'].includes(g.family)?g.family:'Other';(groups[fam]??=[]).push(g)});
  $('#gameSections').innerHTML=order.filter(f=>groups[f]?.length).map(f=>{
    const list=groups[f].sort((a,b)=>a.title.localeCompare(b.title));const fin=list.filter(storyFinished).length;const comp=pct(fin,list.length);
    return `<section class="platform-section"><div class="platform-heading"><h2>${familyIcon(f)} ${esc(f)}</h2><span class="platform-summary">${list.length} games • ${fin} beaten • ${comp}% story completion</span></div><div class="game-grid">${list.map(gameCard).join('')}</div></section>`
  }).join('')||'<article class="panel">No main games match those filters.</article>';
  $$('.game-card').forEach(c=>c.onclick=()=>openGame(c.dataset.id));
}
function gameCard(g){return `<button class="game-card ${familyClass(g.family)} ${g.cover?'has-cover':''}" data-id="${esc(g.id)}">${coverMarkup(g)}<div class="game-card-copy"><div class="badge-row"><span class="badge ${statusClass(g.status)}">${esc(g.status)}</span>${g.currentlyPlaying?'<span class="badge live">▶ Playing</span>':''}</div><h3>${esc(g.title)}</h3><div class="game-meta">${esc(g.platform)} • ${esc(g.format||'Not recorded')}</div><div class="game-meta">${g.completedDate?'Completed '+fmtDate(g.completedDate):g.startedDate?'Started '+fmtDate(g.startedDate):'No date recorded'}</div></div></button>`}
function openGame(id){
  const g=state.games.find(x=>x.id===id);if(!g)return;
  const dlg=$('#gameDialog');
  $('#dialogContent').innerHTML=`<div class="dialog-body detail-with-cover"><div class="detail-cover-wrap">${coverMarkup(g,'detail-cover')}</div><div class="detail-copy"><span class="eyebrow">MAIN GAME</span><h2>${esc(g.title)}</h2><div class="badge-row"><span class="badge ${statusClass(g.status)}">${esc(g.status)}</span>${g.currentlyPlaying?'<span class="badge live">▶ Currently playing</span>':''}</div><div class="detail-grid"><div><small>Platform</small><strong>${esc(g.platform)}</strong></div><div><small>Format</small><strong>${esc(g.format||'Not recorded')}</strong></div><div><small>Series</small><strong>${esc(g.series||'Not recorded')}</strong></div><div><small>Started</small><strong>${g.startedDate?fmtDate(g.startedDate):'Not recorded'}</strong></div><div><small>Completed</small><strong>${g.completedDate?fmtDate(g.completedDate):'—'}</strong></div><div><small>100% status</small><strong>${g.status==='Completed'?'Yes':'No / not tracked'}</strong></div></div>${g.notes?`<p class="muted">${esc(g.notes)}</p>`:''}<button class="primary-btn" id="editGameBtn">Edit entry</button></div></div>`;
  dlg.showModal();$('#editGameBtn').onclick=()=>{dlg.close();editGame(g.id)};
}

function dlc(){
  const total=state.dlc.length, done=state.dlc.filter(d=>storyFinished(d)).length, rate=pct(done,total);
  $('#dlcSummary').innerHTML=`<article><small>Total DLC</small><strong>${total}</strong><span>separate entries</span></article><article><small>Completed</small><strong>${done}</strong><span>finished add-ons</span></article><article><small>DLC progress</small><strong>${rate}%</strong><span>does not affect main stats</span></article>`;
  $('#dlcList').innerHTML=state.dlc.map(d=>`<article class="dlc-card ${d.cover?'has-cover':''}">${coverMarkup(d,'dlc-cover')}<div><div class="badge-row"><span class="badge ${statusClass(d.status)}">${esc(d.status)}</span></div><h3>${esc(d.title)}</h3><span class="dlc-link">↳ ${esc(d.parentGame||'Parent game not recorded')}</span></div><div class="muted">${esc(d.platform)}<br>${d.completedDate?'Completed '+fmtDate(d.completedDate):'Completion date unknown'}</div><button class="ghost-btn dlc-edit" data-id="${esc(d.id)}">Edit</button></article>`).join('')||'<article class="panel">No DLC archived yet.</article>';
  $$('.dlc-edit').forEach(b=>b.onclick=()=>editDlc(b.dataset.id));
}

function progress(){
  const total=state.games.length, done=state.games.filter(storyFinished).length, rate=pct(done,total), degree=rate/100*360;
  $('#progressPct').textContent=rate+'%';$('#completionRing').style.background=`conic-gradient(var(--accent) ${degree}deg,var(--surface3) ${degree}deg)`;$('#progressStoryText').textContent=`${done} of ${total} main stories beaten • ${count100()} at 100%.`;
  const dt=state.dlc.length, dd=state.dlc.filter(storyFinished).length, dr=pct(dd,dt);$('#dlcPct').textContent=dr+'%';$('#dlcProgressBar').style.width=dr+'%';$('#dlcProgressText').textContent=`${dd} of ${dt} DLC entries beaten. DLC stays separate from all main-game stats.`;
  const fams=['PlayStation','Xbox','PC','Nintendo'];const pdata=fams.map(f=>{const a=state.games.filter(g=>g.family===f),fins=a.filter(storyFinished).length;return [f,a.length,fins,pct(fins,a.length)]});barChart('#platformChart',pdata.map(x=>({label:`${familyIcon(x[0])} ${x[0]}`,value:x[3],text:`${x[2]}/${x[1]} • ${x[3]}%`})),100);
  const byYear={};state.games.filter(storyFinished).filter(g=>g.completedDate).forEach(g=>{const y=g.completedDate.slice(0,4);byYear[y]=(byYear[y]||0)+1});const years=Object.keys(byYear).sort();const max=Math.max(1,...Object.values(byYear));barChart('#yearChart',years.map(y=>({label:y,value:byYear[y],text:String(byYear[y])})),max);
  formatDonut();franchises();
}
function barChart(sel,data,max){$(sel).innerHTML=data.map(r=>`<div class="bar-row"><span class="bar-label">${esc(r.label)}</span><div class="bar-rail"><div class="bar-fill" style="width:${Math.max(0,Math.min(100,(r.value/max)*100))}%"></div></div><span class="bar-value">${esc(r.text)}</span></div>`).join('')||'<p class="muted">No data yet.</p>'}
function formatDonut(){
  const counts={Digital:0,Physical:0,Unknown:0};state.games.forEach(g=>{/disc/i.test(g.format||'')?counts.Physical++:/digital/i.test(g.format||'')?counts.Digital++:counts.Unknown++});const total=Math.max(1,state.games.length);let start=0;const colours=['var(--accent)','var(--gold)','var(--other)'];const parts=Object.entries(counts).map(([k,v],i)=>{const a=start,b=start+(v/total*360);start=b;return `${colours[i]} ${a}deg ${b}deg`});$('#formatDonut').innerHTML=`<div><div class="donut" style="background:conic-gradient(${parts.join(',')})"><div class="donut-label"><strong>${state.games.length}</strong><br><span class="muted">main games</span></div></div><div class="donut-legend">${Object.entries(counts).map(([k,v],i)=>`<span><i class="legend-dot" style="background:${colours[i]}"></i>${k}: ${v}</span>`).join('')}</div></div>`
}
function franchises(){
  const map={};state.games.forEach(g=>{const s=g.series||g.title;(map[s]??=[]).push(g)});const data=Object.entries(map).map(([name,arr])=>({name,total:arr.length,done:arr.filter(storyFinished).length,rate:pct(arr.filter(storyFinished).length,arr.length)})).sort((a,b)=>b.rate-a.rate||a.name.localeCompare(b.name));
  $('#franchiseChart').innerHTML=data.map(x=>`<div class="franchise-row"><span>${esc(x.name)}</span><div class="bar-rail"><div class="bar-fill" style="width:${x.rate}%"></div></div><span class="bar-value">${x.done}/${x.total} • ${x.rate}%</span></div>`).join('')
}

function milestones(){
  const arr=completedMain();const marks=[1,10,25,50,100];
  $('#milestoneList').innerHTML=marks.map(n=>{const g=arr[n-1],name=n===1?'First Game Beaten':`${n} Games Beaten`;return g?`<article class="milestone-card done"><span class="eyebrow">MILESTONE UNLOCKED</span><div class="milestone-number">${n===1?'🥇':'🏅'}</div><h3>${name}</h3><strong>${esc(g.title)}</strong><p class="muted">${esc(g.platform)} • ${fmtDate(g.completedDate)}</p></article>`:`<article class="milestone-card waiting"><span class="eyebrow">WAITING</span><div class="milestone-number">${n}</div><h3>${name}</h3><p class="muted">Not reached yet.</p></article>`}).join('')
}
function timeline(){
  const arr=completedMain().slice().reverse();$('#timelineList').innerHTML=arr.map((g,i)=>`<article class="timeline-item"><span class="eyebrow">${fmtDate(g.completedDate)}</span><h3>${esc(g.title)}</h3><p>${esc(g.platform)} • Save File #${arr.length-i}</p></article>`).join('')||'<article class="panel">No main stories completed yet.</article>'
}
function memory(){
  const list=(state.memories||[]).slice().sort((a,b)=>String(b.date).localeCompare(String(a.date)));$('#memoryList').innerHTML=list.map(m=>`<article class="memory-slot"><span class="eyebrow">MEMORY SLOT • ${fmtDate(m.date)}</span><h2>${esc(m.title)}</h2>${(m.body||[]).map(p=>`<p>${esc(p)}</p>`).join('')}<div class="memory-quote">“${esc(m.quote||'')}”</div></article>`).join('')||'<article class="panel">No memory slots saved yet.</article>'
}
function hall(){
  const list=(state.hallOfFame||[]).slice().sort((a,b)=>a.rank-b.rank);$('#hallList').innerHTML=list.map(h=>`<article class="hall-card"><div class="hall-rank">#${h.rank}</div><div><span class="eyebrow">PERMANENT INDUCTEE</span><h2>${esc(h.title)}</h2><div class="rating">★ ${Number(h.rating).toFixed(1)} / 10</div><p>${esc(h.reason)}</p></div></article>`).join('')||'<article class="panel">The Hall of Fame is waiting for its first inductee.</article>'
}
function resetRoulette(){$('#rouletteTitle').textContent='Ready when you are.';$('#rouletteMeta').textContent='The draw only uses unfinished main games.'}
function roulette(){const pool=state.games.filter(g=>!storyFinished(g));if(!pool.length){$('#rouletteTitle').textContent='Backlog cleared!';$('#rouletteMeta').textContent='There are no unfinished main games in the archive.';return}const g=pool[Math.floor(Math.random()*pool.length)];$('#rouletteTitle').textContent=g.title;$('#rouletteMeta').textContent=`${g.platform} • ${g.status}${g.currentlyPlaying?' • currently playing':''}`}

function populateParents(){const s=$('#parentGameSelect');s.innerHTML=state.games.slice().sort((a,b)=>a.title.localeCompare(b.title)).map(g=>`<option value="${esc(g.id)}">${esc(g.title)}</option>`).join('')}
function entryTypeUi(){const dlc=$('#entryType').value==='dlc';$('#parentLabel').classList.toggle('hidden',!dlc);$('#familyLabel').classList.toggle('hidden',dlc);$('#formatLabel').classList.toggle('hidden',dlc);$('#startedLabel').classList.toggle('hidden',dlc);$('#playingLabel').classList.toggle('hidden',dlc)}
function clearForm(){editing=null;$('#entryForm').reset();$('#entryType').disabled=false;entryTypeUi();$('#entryForm').querySelector('button[type=submit]').textContent='Save entry'}
function editGame(id){const g=state.games.find(x=>x.id===id);if(!g)return;editing={type:'game',id};go('add');const f=$('#entryForm'),el=n=>f.elements.namedItem(n);$('#entryType').value='game';$('#entryType').disabled=true;entryTypeUi();el('title').value=g.title;el('series').value=g.series||'';el('platform').value=g.platform||'';el('family').value=g.family||'Other';el('format').value=[...el('format').options].some(o=>o.value===g.format)?g.format:'Not recorded';el('status').value=g.status;el('startedDate').value=g.startedDate||'';el('completedDate').value=g.completedDate||'';el('currentlyPlaying').checked=!!g.currentlyPlaying;el('notes').value=g.notes||'';f.querySelector('button[type=submit]').textContent='Update main game'}
function editDlc(id){const d=state.dlc.find(x=>x.id===id);if(!d)return;editing={type:'dlc',id};go('add');const f=$('#entryForm'),el=n=>f.elements.namedItem(n);$('#entryType').value='dlc';$('#entryType').disabled=true;entryTypeUi();el('title').value=d.title;el('series').value='';el('platform').value=d.platform||'';el('status').value=d.status;el('completedDate').value=d.completedDate||'';el('parentGame').value=d.parentGameId||state.games.find(g=>g.title===d.parentGame)?.id||'';el('notes').value=d.notes||'';f.querySelector('button[type=submit]').textContent='Update DLC'}
function submitEntry(e){
  e.preventDefault();const f=new FormData(e.currentTarget), type=editing?.type||f.get('type');
  if(type==='game'){
    const obj={id:editing?.id||'ga-local-'+Date.now(),title:f.get('title').trim(),series:f.get('series').trim()||f.get('title').trim(),platform:f.get('platform').trim(),family:f.get('family')||'Other',format:f.get('format')||'Not recorded',status:f.get('status'),startedDate:f.get('startedDate')||'',completedDate:f.get('completedDate')||'',currentlyPlaying:f.get('currentlyPlaying')==='on',notes:f.get('notes').trim()};
    if(editing){const i=state.games.findIndex(g=>g.id===editing.id);state.games[i]=obj}else state.games.push(obj);
  }else{
    const parentId=f.get('parentGame'), parent=state.games.find(g=>g.id===parentId);const obj={id:editing?.id||'dlc-local-'+Date.now(),title:f.get('title').trim(),parentGameId:parentId,parentGame:parent?.title||'',platform:f.get('platform').trim()||parent?.platform||'',status:f.get('status'),completedDate:f.get('completedDate')||'',notes:f.get('notes').trim()};
    if(editing){const i=state.dlc.findIndex(d=>d.id===editing.id);state.dlc[i]=obj}else state.dlc.push(obj);
  }
  const wasEditing=!!editing;save();clearForm();render();toast(wasEditing?'Entry updated':'Entry saved');go(type==='game'?'games':'dlc')
}

function backup(){/* section is static */}
function download(name,type,text){const b=new Blob([text],{type}),a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),600)}
function exportJson(){download(`the-gaming-archive-v1.2-${new Date().toISOString().slice(0,10)}.json`,'application/json',JSON.stringify(state,null,2))}
function importJson(file){const r=new FileReader();r.onload=()=>{try{const x=JSON.parse(r.result);if(!Array.isArray(x.games)||!Array.isArray(x.dlc))throw new Error();state={...seed(),...x,version:'1.5'};save();render();toast('Archive backup restored')}catch{alert('That file is not a valid Gaming Archive backup.')}};r.readAsText(file)}

function render(){dashboard();games();dlc();progress();milestones();timeline();memory();hall();populateParents()}

$('#menuBtn').onclick=openDrawer;$('#scrim').onclick=closeDrawer;$$('[data-page]').forEach(b=>b.onclick=()=>go(b.dataset.page));$$('[data-go]').forEach(b=>b.onclick=()=>go(b.dataset.go));
$('#themeBtn').onclick=()=>{document.body.classList.toggle('light');localStorage.setItem(THEME_KEY,document.body.classList.contains('light')?'light':'dark')};if(localStorage.getItem(THEME_KEY)==='light')document.body.classList.add('light');
$('#gameSearch').addEventListener('input',games);$('#gameStatusFilter').addEventListener('change',games);$('#rouletteBtn').onclick=roulette;$('#entryType').onchange=entryTypeUi;$('#entryForm').onsubmit=submitEntry;$('#clearEntryForm').onclick=clearForm;
$('#gameDialog .dialog-close').onclick=()=>$('#gameDialog').close();$('#gameDialog').addEventListener('click',e=>{if(e.target===$('#gameDialog'))$('#gameDialog').close()});
$('#exportBtn').onclick=exportJson;$('#importFile').onchange=e=>{const f=e.target.files[0];if(f)importJson(f);e.target.value=''};$('#resetBtn').onclick=()=>{if(confirm('Reset local changes and restore The Gaming Archive Version 1.2?')){localStorage.removeItem(KEY);state=seed();render();toast('Version 1.2 restored')}};
entryTypeUi();render();
if('serviceWorker' in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
})();


