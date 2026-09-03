(()=>{
'use strict';
const KEY='the-gaming-archive-v1';
const COLD_WAR_MIGRATION='the-gaming-archive-migration-bocw-20260822';
const SIRENS_REST_MIGRATION='the-gaming-archive-migration-sirens-rest-title-20260823';
const MWII_MIGRATION='the-gaming-archive-migration-mwii-20260826';
const MWII_COMPLETION_MIGRATION='the-gaming-archive-migration-mwii-complete-20260903';
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
function migrateModernWarfareII(){
 try{
  if(localStorage.getItem(MWII_MIGRATION))return;
  const raw=localStorage.getItem(KEY);
  if(raw){
   const state=JSON.parse(raw);
   if(!Array.isArray(state.games))state.games=[];
   state.games.forEach(g=>{g.currentlyPlaying=false});
   let game=state.games.find(g=>g.id==='ga-mwii2022'||g.title==='Call of Duty: Modern Warfare II (2022)');
   const update={id:'ga-mwii2022',title:'Call of Duty: Modern Warfare II (2022)',series:'Call of Duty',platform:'Xbox Series X/S',family:'Xbox',format:'Disc',status:'Incomplete',startedDate:'2026-08-26',completedDate:'',currentlyPlaying:true,notes:'Started on Xbox Series X/S on 26/08/2026.',cover:'./assets/covers/modern-warfare-ii-2022.png'};
   if(game)Object.assign(game,update);else state.games.push(update);
   localStorage.setItem(KEY,JSON.stringify(state));
  }
  localStorage.setItem(MWII_MIGRATION,'1');
 }catch{}
}
function migrateModernWarfareIICompletion(){
 try{
  if(localStorage.getItem(MWII_COMPLETION_MIGRATION))return;
  const raw=localStorage.getItem(KEY);
  if(raw){
   const state=JSON.parse(raw);
   const game=Array.isArray(state.games)?state.games.find(g=>g.id==='ga-mwii2022'||g.title==='Call of Duty: Modern Warfare II (2022)'):null;
   if(game){
    game.status='Beaten';
    game.startedDate='2026-08-26';
    game.completedDate='2026-09-03';
    game.currentlyPlaying=false;
    game.notes='Completed on Xbox Series X/S on 03/09/2026.';
    game.cover='./assets/covers/modern-warfare-ii-2022.png';
    localStorage.setItem(KEY,JSON.stringify(state));
   }
  }
  localStorage.setItem(MWII_COMPLETION_MIGRATION,'1');
 }catch{}
}
ensureLegacyStatusControl();
migrateColdWarCompletion();
migrateSirensRestTitle();
migrateModernWarfareII();
migrateModernWarfareIICompletion();
})();