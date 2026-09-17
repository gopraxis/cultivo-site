// Illustrative marketing scenario. No network calls or production records.
export const STAGES = [
  {key:'harvest',label:'Harvest',day:12,month:9,room:'flower'},
  {key:'dry',label:'Dry room free',day:22,month:9,room:'dry'},
  {key:'pack',label:'Packed',day:14,month:10,room:'pack'},
  {key:'available',label:'Available',day:24,month:10,room:'pack'}
];
export function dateLabel(month,day,offset=0){return new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric',timeZone:'UTC'}).format(new Date(Date.UTC(2026,month,day+offset)));}
export function scenario(state='planned'){
  if(!['planned','proposed','confirmed'].includes(state))throw new Error('Unknown example state');
  const delay=state==='planned'?0:2;
  return {state,delay,conflictDays:Math.max(0,22+delay-23),stages:STAGES.map(s=>({...s,original:dateLabel(s.month,s.day),date:dateLabel(s.month,s.day,delay)}))};
}
export function nextState(state){return state==='planned'?'proposed':state==='proposed'?'confirmed':'planned';}
