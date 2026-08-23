(()=>{
'use strict';
const KEY='the-gaming-archive-v1';
const byId=id=>document.getElementById(id);
const getState=()=>{try{return JSON.parse(localStorage.getItem(KEY))||window.GAMING_ARCHIVE_SEED}catch{return window.GAMING_ARCHIVE_SEED}};
const finished=x=>x&&(x.status==='Beaten'||x.status==='Completed');
const statusClass=s=>finished({status:s})?'good':s==='Incomplete'?'warn':'';
const esc=v=>String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
function fmtDate(v){if(!v)return'Unknown';const d=new Date(v+'T12:00:00');return Number.isNaN(d.getTime())?v:new Intl.DateTimeFormat('en-GB',{day:'2-digit',month:'2-digit',year:'numeric'}).format(d)}
function openDlc(id){
 const state=getState(),d=(state.dlc||[]).find(x=>x.id===id);if(!d)return;
 const parent=(state.games||[]).find(g=>g.id===d.parentGameId)||null,dlg=byId('gameDialog'),content=byId('dialogContent');if(!dlg||!content)return;
 const cover=d.cover?`<img class="detail-cover" src="${esc(d.cover)}" alt="${esc(d.title)} cover art">`:'<div class="detail-cover cover-placeholder" aria-hidden="true">🧩</div>';
 content.innerHTML=`<div class="dialog-body detail-with-cover"><div class="detail-cover-wrap">${cover}</div><div class="detail-copy"><span class="eyebrow">DLC</span><h2>${esc(d.title)}</h2><div class="badge-row"><span class="badge ${statusClass(d.status)}">${esc(d.status)}</span></div><div class="detail-grid"><div><small>Parent game</small><strong>${esc(d.parentGame||parent?.title||'Not recorded')}</strong></div><div><small>Platform</small><strong>${esc(d.platform||parent?.platform||'Not recorded')}</strong></div><div><small>Completed</small><strong>${d.completedDate?fmtDate(d.completedDate):'Unknown'}</strong></div><div><small>Main-game stats</small><strong>Tracked separately</strong></div></div>${d.notes?`<p class="muted">${esc(d.notes)}</p>`:''}<button class="primary-btn" id="editDlcDetailBtn">Edit entry</button></div></div>`;
 dlg.showModal();
 byId('editDlcDetailBtn').onclick=()=>{dlg.close();const edit=[...document.querySelectorAll('.dlc-edit')].find(b=>b.dataset.id===id);edit?.click()};
}
function upgradeCard(card,d){
 if(!card||!d||card.dataset.v2DlcCard==='1')return;
 const edit=card.querySelector('.dlc-edit'),cover=card.querySelector('.dlc-cover');
 card.dataset.v2DlcCard='1';card.dataset.dlcId=d.id;card.classList.add('v2-dlc-card');card.setAttribute('role','button');card.tabIndex=0;card.setAttribute('aria-label',`Open ${d.title}`);
 const copy=document.createElement('div');copy.className='game-card-copy';
 const badges=document.createElement('div');badges.className='badge-row';const badge=document.createElement('span');badge.className=`badge ${statusClass(d.status)}`;badge.textContent=d.status||'Not recorded';badges.appendChild(badge);
 const title=document.createElement('h3');title.textContent=d.title||'Untitled DLC';
 const meta=document.createElement('div');meta.className='game-meta';meta.textContent=d.platform||'Platform not recorded';
 copy.append(badges,title,meta);
 card.replaceChildren();if(cover)card.appendChild(cover);card.appendChild(copy);if(edit){edit.hidden=true;edit.setAttribute('aria-hidden','true');edit.tabIndex=-1;card.appendChild(edit)}
 card.addEventListener('click',e=>{if(e.target.closest?.('.dlc-edit'))return;openDlc(d.id)});
 card.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openDlc(d.id)}});
}
function upgradeAll(){
 const state=getState(),dlc=state.dlc||[],list=byId('dlcList');if(!list)return;
 [...list.querySelectorAll('.dlc-card')].forEach((card,i)=>upgradeCard(card,dlc[i]));
}
function init(){const list=byId('dlcList');if(!list)return;upgradeAll();new MutationObserver(()=>setTimeout(upgradeAll,0)).observe(list,{childList:true})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(init,120));else setTimeout(init,120);
})();
