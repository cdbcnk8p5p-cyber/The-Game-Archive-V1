(()=>{
'use strict';
const KEY='the-gaming-archive-v1';
const COLD_WAR_MIGRATION='the-gaming-archive-migration-bocw-20260822';
const SIRENS_REST_MIGRATION='the-gaming-archive-migration-sirens-rest-title-20260823';
function ensureLegacyStatusControl(){
 if(document.getElementById('gameStatusFilter'))return;
 const select=document.createElement('select');
 select.id='gameStatusFilter';
 select.hidden=true;
 select.innerHTML='<option value="" selected>All statuses</option><option value="Beaten">Beaten</option><option value="Completed">Completed</option><option value="Incomplete">Incomplete</option><option value="Not Started">Not Started</option>';
 document.body.appendChild(select);
}
function migrateColdWarCompletion(){
 try{
  if(localStorage.getItem(COLD_WAR_MIGRATION))return;
  const raw=localStorage.getItem(KEY);
  if(raw){
   const state=JSON.parse(raw);
   const game=Array.isArray(state.games)?state.games.find(g=>g.id==='ga-bocw'||g.title==='Call of Duty: Black Ops Cold War'):null;
   if(game){
    game.status='Beaten';
    game.startedDate='2026-08-14';
    game.completedDate='2026-08-22';
    game.currentlyPlaying=false;
    game.notes='Completed on Xbox Series X/S using the Xbox One disc.';
    game.cover='./assets/covers/black-ops-cold-war.jpg';
    localStorage.setItem(KEY,JSON.stringify(state));
   }
  }
  localStorage.setItem(COLD_WAR_MIGRATION,'1');
 }catch{}
}
function migrateSirensRestTitle(){
 try{
  if(localStorage.getItem(SIRENS_REST_MIGRATION))return;
  const raw=localStorage.getItem(KEY);
  if(raw){
   const state=JSON.parse(raw);
   const dlc=Array.isArray(state.dlc)?state.dlc.find(d=>d.id==='dlc-swtd'||d.title==='Still Wakes the Deep DLC'):null;
   if(dlc){
    dlc.title='Still Wakes the Deep: Sirens Rest';
    dlc.parentGame='Still Wakes the Deep';
    dlc.parentGameId='ga-swtd';
    dlc.cover='./assets/covers/sirens-rest.jpg';
    localStorage.setItem(KEY,JSON.stringify(state));
   }
  }
  localStorage.setItem(SIRENS_REST_MIGRATION,'1');
 }catch{}
}
ensureLegacyStatusControl();
migrateColdWarCompletion();
migrateSirensRestTitle();
})();