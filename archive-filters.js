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