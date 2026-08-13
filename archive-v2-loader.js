(()=>{
'use strict';
function ensureLegacyStatusControl(){
 if(document.getElementById('gameStatusFilter'))return;
 const select=document.createElement('select');
 select.id='gameStatusFilter';
 select.hidden=true;
 select.innerHTML='<option value="All">All statuses</option><option value="Beaten">Beaten</option><option value="Completed">Completed</option><option value="Incomplete">Incomplete</option><option value="Not Started">Not Started</option>';
 document.body.appendChild(select);
}
ensureLegacyStatusControl();
})();