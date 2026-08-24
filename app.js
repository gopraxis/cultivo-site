'use strict';
/* ============ Cultivo machine v2 — config-driven facility engine ============ */
(function(){
if(!document.getElementById('machine'))return;
const BRASS='#C9A24B', LUM='#F4EFE4';
const CLR={plan:'#7DA6B7',mom:'#C9A24B',clone:'#BDAE72',veg:'#77A58E',flower:'#D7887E',dry:'#A88F66',trim:'#B99F70',cure:'#C9A24B',test:'#7DA6B7',pack:'#91AA9C',ship:'#7DA6B7'};

/* ---------- facility configs (the loader) ---------- */
const CONFIGS={
 cult:{
  label:'CULT-PATTERN · AZ', clock:'AZ',
  stages:{clone:14,veg:28,flower:63,dry:10,trim:5,cure:14,test:14,pack:5,ship:3},
  flowerRooms:3, plantsBase:190, plantsVar:50, wetBase:90, wetVar:45,
  crew:{cultMgr:'Andrew',pp:'Laura',inv:'Josie',tech:'Sam'},
  strains:[['Hawaiian Snowcone','HSC'],['Capulator Junky','CPJ'],['Chile Azul','CHA'],['Blue Pave','BLP'],['Flavor Flav','FLF'],['Dog Walker','DGW'],['Gas Face','GSF'],['Magic Marker','MGM'],['Animal Tsunami','AST'],['Peanut Butter Breath','PBB'],['Slymer Cookies','SLC'],['Black Maple','BKM']],
  topRow:[
   {key:'PLAN',name:'Planner',w:64,h:52,c:CLR.plan,desk:true},
   {key:'MOM',name:'Mothers',w:86,h:66,c:CLR.mom,plants:'mom',photoperiod:18},
   {key:'PROP',name:'Clone',w:88,h:66,c:CLR.clone,plants:'tray',photoperiod:18},
   {key:'VEG',name:'Veg',w:104,h:76,c:CLR.veg,plants:'veg',photoperiod:18,capacity:2},
   {key:'FLW-01',name:'Flower 01',w:96,h:84,c:CLR.flower,plants:'flw',photoperiod:12,capacity:1},
   {key:'FLW-02',name:'Flower 02',w:96,h:84,c:CLR.flower,plants:'flw',photoperiod:12,capacity:1},
   {key:'FLW-03',name:'Flower 03',w:96,h:84,c:CLR.flower,plants:'flw',photoperiod:12,capacity:1}],
  botRow:[
   {key:'DRY',name:'Dry',w:80,h:62,c:CLR.dry,racks:true},
   {key:'TRIM',name:'Buck + Trim',w:92,h:62,c:CLR.trim,tables:true},
   {key:'CURE',name:'Cure',w:78,h:56,c:CLR.cure,bins:true},
   {key:'VAULT',name:'Test Vault',w:76,h:56,c:CLR.test,bins:true,lock:true},
   {key:'PACK',name:'Packaging',w:86,h:62,c:CLR.pack,tables:true},
   {key:'DOCK',name:'Dispatch',w:92,h:66,c:CLR.ship,dock:true}]
 },
 sostanza:{
  label:'SHOWCASE · ON, CANADA', clock:'ON',
  stages:{clone:14,veg:28,flower:63,dry:12,trim:4,cure:14,test:14,pack:4,ship:3},
  flowerRooms:2, plantsBase:96, plantsVar:24, wetBase:46, wetVar:18,
  crew:{cultMgr:'Head Grower',pp:'Post-Prod Lead',inv:'Inventory Lead',tech:'Cultivation Tech'},
  strains:[['BD Line','BD'],['GC Line','GC'],['ZK Line','ZK'],['HB Line','HB'],['OG Line','OG'],['BM Line','BM']],
  topRow:[
   {key:'PLAN',name:'Planner',w:64,h:52,c:CLR.plan,desk:true},
   {key:'MOM+CLONE',name:'Mother + Clone',w:118,h:70,c:CLR.mom,plants:'mom',photoperiod:18},
   {key:'VEG',name:'Veg',w:110,h:78,c:CLR.veg,plants:'veg',photoperiod:18,capacity:2},
   {key:'FLW-01',name:'Flower 01 · 4 tables',w:118,h:88,c:CLR.flower,plants:'flw',photoperiod:12,capacity:1},
   {key:'FLW-02',name:'Flower 02 · 4 tables',w:118,h:88,c:CLR.flower,plants:'flw',photoperiod:12,capacity:1}],
  botRow:[
   {key:'DRY',name:'Dry',w:88,h:64,c:CLR.dry,racks:true},
   {key:'TRIM',name:'Trim',w:92,h:62,c:CLR.trim,tables:true},
   {key:'CURE',name:'Cure',w:80,h:58,c:CLR.cure,bins:true},
   {key:'VAULT',name:'Test Vault',w:78,h:58,c:CLR.test,bins:true,lock:true},
   {key:'PACK',name:'Packaging',w:88,h:62,c:CLR.pack,tables:true},
   {key:'DOCK',name:'Dispatch',w:94,h:66,c:CLR.ship,dock:true}]
 }
};
/* pick config: ?facility=name, or ?cfg=<base64 json> merged over cult */
const qs=new URLSearchParams(location.search);
let cfgName=qs.get('facility')||'cult';
let CFG=CONFIGS[cfgName]||CONFIGS.cult; if(!CONFIGS[cfgName])cfgName='cult';
try{ if(qs.get('cfg')){ CFG=Object.assign({},CONFIGS.cult,JSON.parse(atob(qs.get('cfg')))); cfgName='custom'; CFG.label=CFG.label||'CUSTOM FACILITY'; } }catch(e){}

/* ---------- derived model ---------- */
const S=CFG.stages;
const cut2harvest=S.clone+S.veg+S.flower;
const STAGES=(()=>{ let t=0; const seq=[['plan','Planning',-7,0,'PLAN']];
 const push=(k,l,d,room)=>{ seq.push([k,l,t,t+d,room]); t+=d; };
 push('clone','Clone',S.clone, CFG.topRow.find(r=>r.plants==='tray')?'PROP':CFG.topRow[1].key);
 push('veg','Veg',S.veg,'VEG'); push('flower','Flower',S.flower,'FLW');
 push('dry','Dry',S.dry,'DRY'); push('trim','Trim',S.trim,'TRIM'); push('cure','Cure',S.cure,'CURE');
 push('test','COA Test',S.test,'VAULT'); push('pack','Packaging',S.pack,'PACK'); push('ship','Dispatch',S.ship,'DOCK');
 seq.push(['gone','Delivered',t,1e9,null]); return seq; })();
const HARVEST_D=S.clone+S.veg+S.flower;
const LIFESPAN=STAGES[STAGES.length-1][2]+7;
const SPAWN_EVERY=Math.ceil(S.flower/CFG.flowerRooms);
const BASE=new Date(2026,0,5);

/* layout: auto-position rows around corridor at y=-20 */
const ROOMS=[]; (function build(){
 const GAP=14; let x=-430;
 for(const r of CFG.topRow){ ROOMS.push(Object.assign({},r,{x,y:-58-r.h})); x+=r.w+GAP; }
 const right=x-GAP;
 let bx=right;
 for(const r of CFG.botRow){ bx-=r.w; ROOMS.push(Object.assign({},r,{x:bx,y:52})); bx-=GAP; }
})();
const roomByKey={}; ROOMS.forEach((r,i)=>{roomByKey[r.key]=r;r.cx=r.x+r.w/2;r.cy=r.y+r.h/2;r.idx=i;});
const FLWKEYS=CFG.topRow.filter(r=>r.key.startsWith('FLW')).map(r=>r.key);
const WORLD={minX:Math.min(...ROOMS.map(r=>r.x))-30, maxX:Math.max(...ROOMS.map(r=>r.x+r.w))+30};

function srand(i){let s=(i*2654435761)%4294967296;return()=>{s=(s*1664525+1013904223)%4294967296;return s/4294967296;};}
function fmtDate(d){const t=new Date(BASE.getTime()+d*864e5);return t.toLocaleDateString('en-US',{month:'short',day:'numeric'});}
function codeDate(d){const t=new Date(BASE.getTime()+d*864e5);const p=n=>String(n).padStart(2,'0');return String(t.getFullYear()).slice(2)+p(t.getMonth()+1)+p(t.getDate());}
function makeBatch(i){const r=srand(i+7);const st=CFG.strains[i%CFG.strains.length];const spawn=i*SPAWN_EVERY;
 const wet=CFG.wetBase+r()*CFG.wetVar,dryW=wet*(0.205+r()*0.035),bucked=dryW*(0.86+r()*0.05);
 return{i,spawn,strain:st[0],code:codeDate(spawn)+'-'+st[1],flw:FLWKEYS[i%FLWKEYS.length],
  plants:CFG.plantsBase+Math.floor(r()*CFG.plantsVar),wet,dryW,fl:bucked*0.66,sm:bucked*0.18,tr:bucked*0.12};}
const DELAYS={};
function stageAt(b,day,dl){const d=day-b.spawn;
 for(const s of STAGES){const t0=s[2]+(s[2]>=HARVEST_D?dl:0);const t1=s[3]+(s[3]>HARVEST_D||s[0]==='flower'?dl:0);
  if(d<t1)return{key:s[0],label:s[1],t0,t1,d,room:s[4]==='FLW'?b.flw:s[4],prog:Math.max(0,Math.min(1,(d-t0)/(t1-t0)))};}
 return null;}
function stageOf(b,day){return stageAt(b,day,DELAYS[b.i]||0);}
function batchesAt(day){const out=[];const lo=Math.max(0,Math.floor((day-LIFESPAN)/SPAWN_EVERY));
 for(let i=lo;i*SPAWN_EVERY<=day+7;i++){const b=makeBatch(i);const d=day-b.spawn;if(d>=-7&&d<LIFESPAN)out.push(b);}return out;}

/* ---------- canvas + camera ---------- */
const cv=document.getElementById('machine'),ctx=cv.getContext('2d');
cv.setAttribute('role','img');
cv.setAttribute('aria-label','Animated working model of a cultivation facility: batches flowing from planning and propagation through grow rooms, harvest, dry, trim, cure, testing, packaging and dispatch.');
let W=0,H=0,DPR=1;
const cam={yaw:-0.42,zoom:1,cx:0,cy:0,K:0.52,HZ:0.92};
const camGoal={yaw:-0.42,zoom:1,pt:null};   // pt = world point to center, null = fit
let fitZoom=1,fitCx=0,fitCy=0;
function resize(){DPR=Math.min(2,window.devicePixelRatio||1);const rc=cv.getBoundingClientRect();W=rc.width;H=rc.height;
 cv.width=W*DPR;cv.height=H*DPR;
 fitZoom=Math.min(W/((WORLD.maxX-WORLD.minX)*1.18),H/560)*1.0;
 fitCx=W/2+6;fitCy=H/2+16;
 if(!camGoal.pt){cam.zoom=fitZoom;cam.cx=fitCx;cam.cy=fitCy;}}
addEventListener('resize',resize);
function proj(x,y,z){const c=Math.cos(cam.yaw),s=Math.sin(cam.yaw);const u=x*c-y*s,v=x*s+y*c;
 return{x:cam.cx+u*cam.zoom,y:cam.cy+(v*cam.K-(z||0)*cam.HZ)*cam.zoom,d:v};}
function camTick(){
 cam.yaw+=(camGoal.yaw-cam.yaw)*0.06;
 cam.zoom+=(camGoal.zoom*fitZoom-cam.zoom)*0.06;
 let tx=fitCx,ty=fitCy;
 if(camGoal.pt){const c=Math.cos(cam.yaw),s=Math.sin(cam.yaw);
  const u=camGoal.pt.x*c-camGoal.pt.y*s,v=camGoal.pt.x*s+camGoal.pt.y*c;
  tx=W/2-u*cam.zoom; ty=H*0.46-(v*cam.K)*cam.zoom;}
 cam.cx+=(tx-cam.cx)*0.06; cam.cy+=(ty-cam.cy)*0.06;}
function camFocus(roomKey,zoom){const r=roomByKey[roomKey];
 if(r){camGoal.pt={x:r.cx,y:r.cy};camGoal.zoom=zoom||1.55;}}
function camReset(){camGoal.pt=null;camGoal.zoom=1;camGoal.yaw=-0.42;}
let drag=null;
cv.addEventListener('pointerdown',e=>{drag={x:e.clientX,yaw:cam.yaw};cv.setPointerCapture(e.pointerId);cv.classList.add('dragging');});
cv.addEventListener('pointermove',e=>{if(drag){cam.yaw=drag.yaw+(e.clientX-drag.x)*0.005;camGoal.yaw=cam.yaw;}});
cv.addEventListener('pointerup',()=>{drag=null;cv.classList.remove('dragging');});

/* ---------- time + visibility ---------- */
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
let day=196.5,speed=3,playing=!reduced,lastT=performance.now(),visible=true;
const playBtn=document.getElementById('mplay');
function setPlay(p){playing=p;playBtn.textContent=p?'⏸ pause':'▶ play';}
playBtn.onclick=()=>setPlay(!playing);
if(reduced)setPlay(false);
new IntersectionObserver(es=>{es.forEach(e=>{visible=e.isIntersecting;});},{threshold:0.05}).observe(cv);

/* ---------- feed + events ---------- */
const feedEl=document.getElementById('mfeed');const feed=[];
function pushEv(who,text){feed.push({who,text});if(feed.length>3)feed.shift();
 feedEl.innerHTML=feed.slice().reverse().map(e=>`<div class="ev"><span class="who">${e.who}</span> ${e.text}</div>`).join('');}
const EVENTS={
 clone:b=>[CFG.crew.tech+' → Agent',`clone intake attested: ${b.code}, reconciliation draft saved`],
 veg:b=>['Crew',`transplant to veg: ${b.code}`],
 flower:b=>[CFG.crew.cultMgr,`flip to flower day ${S.clone+S.veg}: ${b.code}`],
 dry:b=>['Harvest',`${b.code} down at ${b.wet.toFixed(0)} lb wet → dry`],
 trim:b=>[CFG.crew.pp,`trim started on ${b.code}`],
 cure:b=>[CFG.crew.inv,`conversion finalized ${b.code}: ledger written`],
 test:b=>[CFG.crew.pp,`COA sample out for ${b.code}`],
 pack:b=>['Pack',`packaging ${b.code}`],
 ship:b=>['Dispatch',`${b.code}: manifest + invoice + COA out`],
 gone:b=>['Done',`${b.code} delivered inside the 5–7d promise`]};
const seenStage={};
function emitTransitions(bs){for(const b of bs){const st=stageOf(b,day);if(!st)continue;
 const prev=seenStage[b.i];if(prev===undefined){seenStage[b.i]=st.key;continue;}
 if(prev!==st.key){seenStage[b.i]=st.key;const mk=EVENTS[st.key];if(mk){const[w,t]=mk(b);pushEv(w,t);}}}}

/* ---------- photoperiod (wall-clock diorama rhythm, 48s = 24h) ---------- */
function shiftHour(now){return ((now/48000)%1)*24;}
function roomLight(r,now){ if(!r.photoperiod) return 1;
 const h=(shiftHour(now)+r.idx*1.7)%24;
 const on=h<r.photoperiod;
 return on?1:0.32; }

/* ---------- drawing ---------- */
function line(a,b,color,w){ctx.strokeStyle=color;ctx.lineWidth=w||1;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();}
function poly(pts,fill,stroke,w){ctx.beginPath();ctx.moveTo(pts[0].x,pts[0].y);for(let i=1;i<pts.length;i++)ctx.lineTo(pts[i].x,pts[i].y);
 ctx.closePath();if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=w||1;ctx.stroke();}}
function hexA(hex,a){const n=parseInt(hex.slice(1),16);return`rgba(${n>>16&255},${n>>8&255},${n&255},${a})`;}
function roomPoly(r){return[proj(r.x,r.y,0),proj(r.x+r.w,r.y,0),proj(r.x+r.w,r.y+r.h,0),proj(r.x,r.y+r.h,0)];}
const flashRooms={};
function drawGrid(){ctx.save();
 for(let x=WORLD.minX-40;x<=WORLD.maxX+40;x+=40)line(proj(x,-190,0),proj(x,170,0),'rgba(233,221,187,0.04)');
 for(let y=-190;y<=170;y+=40)line(proj(WORLD.minX-40,y,0),proj(WORLD.maxX+40,y,0),'rgba(233,221,187,0.04)');
 ctx.setLineDash([3,7]);line(proj(WORLD.minX,-20,0),proj(WORLD.maxX,-20,0),'rgba(201,162,75,0.14)',1.5);ctx.setLineDash([]);ctx.restore();}
function drawRoom(r,occ,now,capFill){const p=roomPoly(r);
 const lit=roomLight(r,now);
 const fl=flashRooms[r.key]&&now<flashRooms[r.key];
 poly(p,hexA(r.c,(occ?0.10:0.05)*lit+0.01),hexA(r.c,0.45*Math.max(lit,0.55)),1);
 if(fl){const pulse=0.35+0.45*Math.abs(Math.sin(now/240));poly(p,null,hexA(BRASS,pulse),2);}
 const h=34;const cs=[[r.x,r.y],[r.x+r.w,r.y],[r.x+r.w,r.y+r.h],[r.x,r.y+r.h]];
 const tops=cs.map(c=>proj(c[0],c[1],h));cs.forEach((c,i)=>line(proj(c[0],c[1],0),tops[i],hexA(r.c,0.30*Math.max(lit,0.5))));
 poly(tops,null,hexA(r.c,0.30*Math.max(lit,0.5)),1);
 // photoperiod lamp on the top wire
 if(r.photoperiod){const lp=proj(r.cx,r.y+4,h);
  ctx.fillStyle=lit>0.5?hexA(BRASS,0.95):'rgba(95,85,65,0.5)';
  ctx.beginPath();ctx.arc(lp.x,lp.y,2.2*Math.sqrt(cam.zoom/fitZoom||1),0,7);ctx.fill();}
 // capacity gauge on front edge
 if(r.capacity&&capFill!=null){const a=proj(r.x+4,r.y+r.h,2),b=proj(r.x+r.w-4,r.y+r.h,2);
  line(a,b,'rgba(233,221,187,0.14)',2.5);
  const f=Math.min(1,capFill);
  line(a,{x:a.x+(b.x-a.x)*f,y:a.y+(b.y-a.y)*f},capFill>1.01?hexA('#D7887E',0.85):hexA(BRASS,0.8),2.5);}
 if(occ&&lit>0.5){const ctr=proj(r.cx,r.cy,0);const g=ctx.createRadialGradient(ctr.x,ctr.y,2,ctr.x,ctr.y,44*cam.zoom);
  g.addColorStop(0,hexA(r.c,0.13));g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(ctr.x,ctr.y,44*cam.zoom,0,7);ctx.fill();}}
function drawLabel(r,now){const lit=Math.max(roomLight(r,now),0.55);const p=proj(r.cx,r.y-6,40);
 const compact=cam.zoom<0.52;
 ctx.font=`600 ${Math.max(compact?8:9,10*Math.sqrt(cam.zoom/fitZoom||1))}px ui-monospace,Menlo,monospace`;ctx.textAlign='center';
 ctx.fillStyle=hexA(r.c,0.95*lit);ctx.fillText(r.key,p.x,p.y);
 if(compact)return;
 ctx.font=`500 ${Math.max(8,8.5*Math.sqrt(cam.zoom/fitZoom||1))}px -apple-system,sans-serif`;
 ctx.fillStyle=`rgba(167,156,126,${0.85*lit})`;ctx.fillText(r.name,p.x,p.y+12);}
function drawPlants(r,list,now){if(!r.plants)return;const lit=roomLight(r,now);const items=[];
 for(const{b,st}of list){const rr=srand(b.i+31);const n=r.plants==='mom'?10:r.plants==='tray'?42:22;
  const grow=r.plants==='tray'?0.25+st.prog*0.3:r.plants==='veg'?0.35+st.prog*0.5:0.5+st.prog*0.6;
  for(let k=0;k<n;k++){const cols=Math.ceil(Math.sqrt(n*2));
   const gx=r.x+8+(k%cols)*((r.w-16)/cols)+rr()*3,gy=r.y+8+Math.floor(k/cols)*((r.h-16)/Math.ceil(n/cols))+rr()*3;
   items.push({gx,gy,h:r.plants==='mom'?16:4+grow*16,c:r.c});}}
 items.sort((a,b)=>proj(a.gx,a.gy,0).d-proj(b.gx,b.gy,0).d);
 for(const it of items){const base=proj(it.gx,it.gy,0),top=proj(it.gx,it.gy,it.h);
  line(base,top,hexA(it.c,0.55*lit),1.2);const lr=3+it.h*0.18;
  line(top,proj(it.gx-lr,it.gy,it.h*0.8),hexA(it.c,0.4*lit));line(top,proj(it.gx+lr,it.gy,it.h*0.8),hexA(it.c,0.4*lit));}}
let lastShipDay=-99;
function truckOff(){const s=day-lastShipDay;return(s>0&&s<2.2)?Math.min(1,s/2.2)*-70:0;}
function drawFurniture(r,now){
 if(r.racks){for(let i=1;i<4;i++){const y=r.y+i*(r.h/4);
  line(proj(r.x+8,y,0),proj(r.x+r.w-8,y,0),hexA(r.c,0.25));line(proj(r.x+8,y,16),proj(r.x+r.w-8,y,16),hexA(r.c,0.35));
  for(let k=1;k<5;k++){const hx=r.x+8+k*((r.w-16)/5);line(proj(hx,y,16),proj(hx,y,9),hexA(r.c,0.3));}}}
 if(r.tables){for(let i=0;i<2;i++){const y=r.y+12+i*(r.h-28);
  poly([proj(r.x+10,y,10),proj(r.x+r.w-10,y,10),proj(r.x+r.w-10,y+9,10),proj(r.x+10,y+9,10)],hexA(r.c,0.10),hexA(r.c,0.4));}}
 if(r.bins){for(let i=0;i<3;i++)for(let j=0;j<2;j++){const bx=r.x+12+i*((r.w-24)/3),by=r.y+10+j*((r.h-24)/2);
  poly([proj(bx,by,0),proj(bx+14,by,0),proj(bx+14,by+11,0),proj(bx,by+11,0)],hexA(r.c,0.08),hexA(r.c,0.35));}}
 if(r.lock){const p=proj(r.cx,r.y+8,26);
  ctx.strokeStyle=hexA(r.c,0.8);ctx.lineWidth=1.4;
  ctx.strokeRect(p.x-4,p.y-3,8,6);ctx.beginPath();ctx.arc(p.x,p.y-3,3,Math.PI,0);ctx.stroke();}
 if(r.desk){poly([proj(r.x+10,r.cy-8,12),proj(r.x+r.w-10,r.cy-8,12),proj(r.x+r.w-10,r.cy+8,12),proj(r.x+10,r.cy+8,12)],hexA(r.c,0.14),hexA(r.c,0.5));
  if(Math.floor(now/600)%2===0){const q=proj(r.cx,r.cy,14);ctx.fillStyle=hexA(r.c,0.9);ctx.fillRect(q.x-1.5,q.y-6,3,6);}}
 if(r.dock){const tx=r.x+18+truckOff(),ty=r.cy+6;
  // road stripes out the door
  ctx.save();ctx.setLineDash([6,8]);
  line(proj(r.x-4,ty,0),proj(WORLD.minX,ty,0),hexA('#7DA6B7',0.25),1.2);ctx.restore();
  poly([proj(tx,ty-9,0),proj(tx+34,ty-9,0),proj(tx+34,ty+9,0),proj(tx,ty+9,0)],hexA('#7DA6B7',0.12),hexA('#7DA6B7',0.6));
  poly([proj(tx,ty-9,16),proj(tx+34,ty-9,16),proj(tx+34,ty+9,16),proj(tx,ty+9,16)],null,hexA('#7DA6B7',0.5));
  [[tx,ty-9],[tx+34,ty-9],[tx+34,ty+9],[tx,ty+9]].forEach(c=>line(proj(c[0],c[1],0),proj(c[0],c[1],16),hexA('#7DA6B7',0.45)));
  poly([proj(tx+34,ty-7,0),proj(tx+44,ty-7,0),proj(tx+44,ty+7,0),proj(tx+34,ty+7,0)],hexA('#7DA6B7',0.2),hexA('#7DA6B7',0.7));}}
const TRAVEL=0.9;
function slotOf(b,room){const rr=srand(b.i+13);
 return{x:room.cx+(rr()-0.5)*room.w*0.4,y:room.cy+(rr()-0.5)*room.h*0.35};}
function puckPosAt(b,st){const room=roomByKey[st.room];if(!room)return null;
 const slot=slotOf(b,room);
 const dIn=st.d-st.t0;
 if(dIn<TRAVEL&&st.key!=='plan'){const idx=STAGES.findIndex(s=>s[0]===st.key);
  const prevKey=STAGES[idx-1][4]==='FLW'?b.flw:STAGES[idx-1][4];const pr=roomByKey[prevKey]||room;
  const t=dIn/TRAVEL;const ax=pr.cx,ay=pr.cy,bx=slot.x,by=slot.y,midY=-20;let x,y;
  if(t<0.33){const u=t/0.33;x=ax;y=ay+(midY-ay)*u;}
  else if(t<0.67){const u=(t-0.33)/0.34;x=ax+(bx-ax)*u;y=midY;}
  else{const u=(t-0.67)/0.33;x=bx;y=midY+(by-midY)*u;}
  return{x,y,moving:true};}
 return{x:slot.x,y:slot.y,moving:false};}
function puckSize(st){switch(st.key){case'plan':return 5;case'clone':return 6;case'veg':return 8;case'flower':return 9+st.prog*3;
 case'dry':return 10;case'trim':return 8.5;case'cure':return 7.5;default:return 7;}}
let focusBatch=null;
function drawGhost(b){const dl=DELAYS[b.i]||0;if(!dl)return;
 const st0=stageAt(b,day,0);const st=stageOf(b,day);
 if(!st0||!st||st0.key==='gone')return;
 if(st0.key===st.key&&st0.room===st.room&&!puckPosAt(b,st0).moving&&!puckPosAt(b,st).moving&&st0.key===st.key){
   // same room, same slot — only annotate when rooms differ or stage differs
   if(st0.key===st.key)return;}
 const gp=puckPosAt(b,st0);if(!gp)return;
 const rp=puckPosAt(b,st);if(!rp)return;
 if(Math.abs(gp.x-rp.x)<4&&Math.abs(gp.y-rp.y)<4)return;
 const g=proj(gp.x,gp.y,4), r=proj(rp.x,rp.y,4);
 ctx.save();ctx.setLineDash([3,4]);
 ctx.strokeStyle='rgba(233,221,187,0.5)';ctx.lineWidth=1.2;
 const rS=puckSize(st0), rx=rS*cam.zoom, ry=rx*0.5;
 ctx.beginPath();ctx.ellipse(g.x,g.y,rx,ry,0,0,7);ctx.stroke();
 ctx.beginPath();ctx.moveTo(g.x,g.y);ctx.lineTo(r.x,r.y);ctx.stroke();
 ctx.setLineDash([]);
 ctx.font=`600 ${9.5*Math.sqrt(cam.zoom/fitZoom||1)}px ui-monospace,Menlo,monospace`;
 ctx.fillStyle='rgba(233,221,187,0.75)';ctx.textAlign='center';
 ctx.fillText('plan', g.x, g.y-ry-6);
 ctx.fillStyle=BRASS;
 ctx.fillText('+'+dl+'d', (g.x+r.x)/2, (g.y+r.y)/2-8);
 ctx.restore();}
function drawPuck(b,st,t){const pos=puckPosAt(b,st);if(!pos)return;const rS=puckSize(st);
 const z=pos.moving?6+Math.sin(t*6+b.i)*1.5:4;const p=proj(pos.x,pos.y,z);const col=CLR[st.key]||'#999';
 const sh=proj(pos.x,pos.y,0);
 ctx.fillStyle='rgba(0,0,0,0.5)';ctx.beginPath();ctx.ellipse(sh.x,sh.y,rS*cam.zoom*0.9,rS*cam.zoom*0.45,0,0,7);ctx.fill();
 const g=ctx.createRadialGradient(p.x,p.y,1,p.x,p.y,rS*3*cam.zoom);g.addColorStop(0,hexA(col,0.35));g.addColorStop(1,'rgba(0,0,0,0)');
 ctx.fillStyle=g;ctx.beginPath();ctx.arc(p.x,p.y,rS*3*cam.zoom,0,7);ctx.fill();
 const rx=rS*cam.zoom,ry=rx*0.5,hh=rS*0.7*cam.zoom;
 ctx.fillStyle=hexA(col,0.28);ctx.strokeStyle=hexA(col,0.95);ctx.lineWidth=1.4;
 ctx.beginPath();ctx.ellipse(p.x,p.y,rx,ry,0,0,Math.PI);ctx.fill();
 ctx.beginPath();ctx.moveTo(p.x-rx,p.y);ctx.lineTo(p.x-rx,p.y-hh);ctx.ellipse(p.x,p.y-hh,rx,ry,0,Math.PI,0,false);ctx.lineTo(p.x+rx,p.y);ctx.stroke();
 ctx.beginPath();ctx.ellipse(p.x,p.y-hh,rx,ry,0,0,7);ctx.fillStyle=hexA(col,0.5);ctx.fill();ctx.stroke();
 if(focusBatch===b.i){ctx.strokeStyle=hexA(BRASS,0.9);ctx.lineWidth=1.4;ctx.setLineDash([4,4]);
  ctx.beginPath();ctx.ellipse(sh.x,sh.y,rx*2.1,ry*2.1,0,0,7);ctx.stroke();ctx.setLineDash([]);
  ctx.font=`600 ${10*Math.sqrt(cam.zoom/fitZoom||1)}px ui-monospace,Menlo,monospace`;ctx.fillStyle=BRASS;ctx.textAlign='center';
  ctx.fillText(b.code,p.x,p.y-hh-10*cam.zoom-6);}}

/* ---------- KPI band ---------- */
const kpiEl=document.getElementById('mkpi');
function renderKPI(bs){if(!kpiEl)return;
 let inflight=0,dryLbs=0,pend=0,nextH=1e9;
 for(const b of bs){const st=stageOf(b,day);if(!st||st.key==='gone')continue;inflight++;
  if(st.key==='dry')dryLbs+=b.wet;
  if(st.key==='trim'&&st.prog>0.6)pend++;
  if(st.key==='flower')nextH=Math.min(nextH,Math.ceil(st.t1-st.d));}
 kpiEl.innerHTML=
  `<span><b>${inflight}</b> batches in flight</span>`+
  `<span><b>${dryLbs?dryLbs.toFixed(0):0} lb</b> hanging in dry</span>`+
  `<span><b>${pend}</b> conversion${pend===1?'':'s'} pending</span>`+
  `<span><b>${nextH===1e9?'—':nextH+'d'}</b> to next harvest</span>`+
  `<span class="kfac">${CFG.label}</span>`;}

/* ---------- story chapters ---------- */
const capEl=document.getElementById('mcap'),capE=document.getElementById('mcapE'),capT=document.getElementById('mcapT');
const dmEl=document.getElementById('mdm'),dmWho=document.getElementById('mdmWho'),dmBody=document.getElementById('mdmBody');
const dmYes=document.getElementById('mdmYes'),dmNo=document.getElementById('mdmNo'),dmDone=document.getElementById('mdmDone'),dmActions=document.getElementById('mdmActions');
const story={active:false,ch:null,beat:-1,beatStart:0,target:null,answered:false,ran:false};
function caption(e,t){capE.textContent=e;capT.textContent=t;capEl.classList.add('show');}
function captionHide(){capEl.classList.remove('show');}
function dmShow(who,html,yesLabel,onYes){dmWho.textContent=who;dmBody.innerHTML=html;
 dmYes.textContent=yesLabel||'Yes';
 dmActions.style.display='flex';dmDone.style.display='none';dmYes.classList.remove('armed');dmEl.classList.add('show');story.answered=false;
 dmYes.onclick=()=>{if(story.answered)return;story.answered=true;dmActions.style.display='none';dmDone.style.display='block';onYes();};
 dmNo.onclick=()=>{if(story.answered)return;story.answered=true;dmActions.style.display='none';
  dmDone.textContent='Noted. The agent follows up tomorrow. Nothing blocks.';dmDone.style.display='block';};}
function dmHide(){dmEl.classList.remove('show');}
function targetBatch(){return batchesAt(day).find(b=>b.i===story.target);}
function beatsElapsed(now){return now-story.beatStart;}
function chapterEnd(){story.active=false;story.ch=null;captionHide();dmHide();speed=3;camReset();
 document.querySelectorAll('.chbtn').forEach(x=>x.classList.remove('on'));}
function startChapter(name){
 story.ch=name;story.active=true;story.ran=true;story.beat=-1;story.answered=false;
 document.querySelectorAll('.chbtn').forEach(x=>x.classList.toggle('on',x.dataset.ch===name));
 setPlay(true);
 const CH=CHAPTERS[name]; CH.setup(); nextBeat();}
function nextBeat(){story.beat++;story.beatStart=performance.now();
 const CH=CHAPTERS[story.ch]; if(story.beat>=CH.beats.length){chapterEnd();return;}
 CH.beats[story.beat].enter();}
function tickStory(now){if(!story.active)return;
 const CH=CHAPTERS[story.ch];const bt=CH.beats[story.beat];
 if(bt&&bt.tick)bt.tick(beatsElapsed(now));}
const CHAPTERS={
 ripple:{
  setup(){const i=Math.max(1,Math.round((day-(HARVEST_D-4))/SPAWN_EVERY));story.target=i;delete DELAYS[i];
   day=i*SPAWN_EVERY+HARVEST_D-6;focusBatch=i;speed=2;},
  beats:[
   {enter(){camReset();caption('THE FACILITY, LIVE',`${batchesAt(day).length} batches in flight on one closed loop. Clone ${S.clone}, veg ${S.veg}, flower ${S.flower}, dry ${S.dry}, cure ${S.cure}, test ${S.test}. Watch one cycle meet reality.`);},
    tick(el){if(el>6200)nextBeat();}},
   {enter(){const b=targetBatch();if(!b)return chapterEnd();camFocus(b.flw,1.5);speed=1.6;
     caption(`DAY ${Math.floor(day-b.spawn)} FOR ${b.code}`,`${b.strain} is finishing flower. The plan says harvest in ${Math.max(1,Math.round(HARVEST_D-(day-b.spawn)))} days. The grower has not opened a computer this week, and will not need to.`);},
    tick(el){if(el>6600)nextBeat();}},
   {enter(){const b=targetBatch();if(!b)return chapterEnd();speed=0.35;captionHide();
     dmShow(`Cultivo Agent → ${CFG.crew.cultMgr} (Cultivation)`,
      `Trichome check on <span class="mono">${b.code}</span> says it wants 2 more days. Harvest is drifting past plan.<br><br>Push harvest and ripple the downstream schedule?`,'Yes, push it',
      ()=>{DELAYS[b.i]=2;dmDone.textContent='✓ Pushed 2 days. Dry, trim, cure, test and packaging moved. Sales sees the new sellable date.';
       pushEv(CFG.crew.cultMgr,'replied YES in Slack. Three seconds of his day.');
       pushEv('Agent',`ripple applied to ${b.code}: plan and reality reconciled`);
       ['DRY','TRIM','CURE','VAULT','PACK','DOCK'].forEach((k,j)=>{if(roomByKey[k])flashRooms[k]=performance.now()+2600+j*220;});});},
    tick(el){if(!story.answered&&el>4600)dmYes.classList.add('armed');
     if(!story.answered&&el>5800)dmYes.onclick();
     if(story.answered&&el>8600)nextBeat();}},
   {enter(){dmHide();camReset();speed=8;
     caption('THE RIPPLE, VISIBLE','The dashed ghost is the old plan. The solid batch is reality, two days behind it. Every downstream stage shifted, the change is on the ledger, and the owner view updated itself.');},
    tick(el){const b=targetBatch();if(b&&stageOf(b,day).key==='dry')nextBeat();else if(el>26000)nextBeat();}},
   {enter(){const b=targetBatch();if(!b)return chapterEnd();camFocus('DRY',1.4);speed=3;
     caption(`DAY ${Math.floor(day-b.spawn)}: HARVEST LANDS`,`${b.code} comes down at ${b.wet.toFixed(0)} lb wet and crosses into post-production, two days late and fully recorded. The ghost still marks what the plan said.`);},
    tick(el){if(el>6500)speed=14;const b=targetBatch();
     if(b&&['trim','cure'].includes(stageOf(b,day).key))nextBeat();else if(el>30000)nextBeat();}},
   {enter(){const b=targetBatch();speed=0.6;captionHide();camFocus('TRIM',1.4);
     dmShow(`Cultivo Agent → ${CFG.crew.inv} (Inventory)`,
      `Trim session on <span class="mono">${b?b.code:'the batch'}</span> is weighed and complete. One conversion pending finalization.<br><br>Finalize now so tonight's inventory is true?`,'Finalize',
      ()=>{dmDone.textContent='✓ Finalized. The ledger closed the day clean.';
       pushEv(CFG.crew.inv,'finalized the conversion from her phone');});},
    tick(el){if(!story.answered&&el>4200)dmYes.classList.add('armed');
     if(!story.answered&&el>5400)dmYes.onclick();
     if(story.answered&&el>7600)nextBeat();}},
   {enter(){dmHide();camReset();speed=5;
     caption('CLOSED-LOOP CULTIVATION','Plan. Deviate. Ripple. Record. Review. The system stays true even when nobody opens it.');},
    tick(el){if(el>8000)nextBeat();}}]},
 intake:{
  setup(){const i=Math.ceil(day/SPAWN_EVERY)+0;story.target=i;
   day=i*SPAWN_EVERY+1.5;focusBatch=i;speed=1.2;},
  beats:[
   {enter(){const b=targetBatch();camFocus(STAGES[1][4]==='PROP'?'PROP':CFG.topRow[1].key,1.5);
     caption('CHAPTER 02 · THE INTAKE',`Cut day. ${b?b.plants+' cuts of '+b.strain:'A new batch'} came off the mothers this morning. In most facilities, this is where plants start existing off the books.`);},
    tick(el){if(el>6800)nextBeat();}},
   {enter(){const b=targetBatch();if(!b)return chapterEnd();speed=0.4;captionHide();
     dmShow(`${CFG.crew.tech} → Cultivo Agent`,
      `taking ${Math.round(b.plants*1.15)} cuts of ${b.strain} this morning, going into trays now`,
      'Log it',
      ()=>{dmDone.textContent=`✓ Intake drafted: ${b.code}. Matched against the plant ledger; nothing writes until the count is confirmed on the walk.`;
       pushEv('Agent',`clone intake ${b.code}: reconciliation draft persisted`);
       const k=STAGES[1][4];if(roomByKey[k])flashRooms[k]=performance.now()+2800;});},
    tick(el){if(!story.answered&&el>4400)dmYes.classList.add('armed');
     if(!story.answered&&el>5600)dmYes.onclick();
     if(story.answered&&el>8400)nextBeat();}},
   {enter(){dmHide();camReset();speed=4;
     caption('NO PHANTOM PLANTS','A sentence in Slack became a permanent record with lineage back to the mothers. When the physical count happens, the system reconciles instead of discovering strangers in veg.');},
    tick(el){if(el>8500)nextBeat();}}]},
 collision:{
  setup(){const i=Math.max(1,Math.round((day-(HARVEST_D-8))/SPAWN_EVERY));story.target=i;
   day=i*SPAWN_EVERY+HARVEST_D-8;focusBatch=null;speed=1.2;},
  beats:[
   {enter(){camFocus('PLAN',1.5);
     caption('CHAPTER 03 · THE COLLISION','A week out, the planner sees what the crew will live: a harvest, a defoliation pass and a transplant all landing inside three days.');},
    tick(el){if(el>6800)nextBeat();}},
   {enter(){speed=0.4;captionHide();
     const b=targetBatch();
     dmShow(`Cultivo Agent → ${CFG.crew.cultMgr} (Cultivation)`,
      `Week of ${fmtDate(day+7)}: harvest ${b?b.code:'FLW batch'}, defol in ${FLWKEYS[1]||FLWKEYS[0]}, and a transplant all land within 3 days. The crew can't cover all three.<br><br>Shift the transplant 2 days earlier?`,'Shift it',
      ()=>{dmDone.textContent='✓ Shifted. Task board leveled; nobody finds out the hard way on the day.';
       pushEv('Agent','labor collision resolved a week before it happened');
       ['VEG',FLWKEYS[0]].forEach((k,j)=>{if(roomByKey[k])flashRooms[k]=performance.now()+2600+j*200;});});},
    tick(el){if(!story.answered&&el>4600)dmYes.classList.add('armed');
     if(!story.answered&&el>5800)dmYes.onclick();
     if(story.answered&&el>8400)nextBeat();}},
   {enter(){dmHide();camReset();speed=4;
     caption('BOTTLENECKS, FORECAST','Labor-heavy days collide in every facility. The difference is whether you find out a week early in a plan, or at 6am with half a crew.');},
    tick(el){if(el>8500)nextBeat();}}]}
};
document.querySelectorAll('.chbtn').forEach(b=>{b.onclick=()=>{if(story.active)chapterEnd();startChapter(b.dataset.ch);};});
const facBtn=document.getElementById('mfac');
if(facBtn){facBtn.textContent='⚙ '+CFG.label;
 facBtn.onclick=()=>{const next=cfgName==='cult'?'sostanza':'cult';
  const u=new URL(location.href);u.searchParams.set('facility',next);location.href=u.toString();};}
if(!reduced){const io=new IntersectionObserver(es=>{es.forEach(e=>{if(e.isIntersecting&&!story.ran){setTimeout(()=>startChapter('ripple'),700);io.disconnect();}});},{threshold:0.45});
 io.observe(cv);}

/* ---------- main loop ---------- */
const mday=document.getElementById('mday'),mdate=document.getElementById('mdate');
let kpiTick=0;
function frame(now){const dt=Math.min(0.1,(now-lastT)/1000);lastT=now;
 if(!visible){requestAnimationFrame(frame);return;}
 if(playing){const prev=day;day+=dt*speed;
  for(const b of batchesAt(day)){const s=stageOf(b,day);
   if(s&&s.key==='gone'&&stageOf(b,prev)&&stageOf(b,prev).key==='ship')lastShipDay=day;}}
 camTick();
 const t=now/1000;const bs=batchesAt(day);emitTransitions(bs);
 const occ={},rb={};for(const b of bs){const st=stageOf(b,day);if(!st||!st.room)continue;occ[st.room]=true;(rb[st.room]=rb[st.room]||[]).push({b,st});}
 ctx.setTransform(DPR,0,0,DPR,0,0);ctx.clearRect(0,0,W,H);
 drawGrid();
 const sorted=[...ROOMS].sort((a,b)=>proj(a.cx,a.cy,0).d-proj(b.cx,b.cy,0).d);
 for(const r of sorted){let cap=null;
  if(r.capacity){const n=(rb[r.key]||[]).length;cap=n/r.capacity;}
  drawRoom(r,!!occ[r.key],now,cap);}
 for(const r of sorted){drawFurniture(r,now);const list=rb[r.key];
  if(list&&r.plants)drawPlants(r,list.filter(x=>['clone','veg','flower'].includes(x.st.key)||r.plants==='mom'),now);}
 const momKey=CFG.topRow[1].key;
 if(!rb[momKey])drawPlants(roomByKey[momKey],[{b:makeBatch(0),st:{prog:1,key:'flower'}}],now);
 for(const b of bs)drawGhost(b);
 const pucks=[];for(const b of bs){const st=stageOf(b,day);if(!st||st.key==='gone'||!st.room)continue;
  const pos=puckPosAt(b,st);if(pos)pucks.push({b,st,d:proj(pos.x,pos.y,0).d});}
 pucks.sort((a,b)=>a.d-b.d);for(const p of pucks)drawPuck(p.b,p.st,t);
 for(const r of sorted)drawLabel(r,now);
 tickStory(now);
 mday.textContent=Math.floor(day);mdate.textContent=fmtDate(day);
 if(now-kpiTick>400){kpiTick=now;renderKPI(bs);}
 requestAnimationFrame(frame);}
resize();
pushEv('Cultivo',`model live: ${CFG.label.toLowerCase()} · ${SPAWN_EVERY}-day cadence · one closed loop`);
requestAnimationFrame(n=>{lastT=n;frame(n);});
})();

/* ============ Cultivo ROI value instrument ============ */
(function(){
const form=document.getElementById('roiCalc');
if(!form)return;

const PACKAGES={
 core:{name:'Core',monthly:2500,implementation:10000,capture:35,description:'planner, ledger and read-only diagnostics'},
 operator:{name:'Operator',monthly:3500,implementation:12000,capture:60,description:'3–5 governed agent workflows'},
 performance:{name:'Performance',monthly:6000,implementation:20000,capture:75,description:'a cross-functional operating program'}
};
const PRESETS={
 lean:{roiRevenue:2000000,roiMargin:55,roiWeeks:52,roiTechs:6,roiTechMins:12,roiTechRate:25,roiManagers:1,roiManagerHours:4,roiManagerRate:45,roiAdmins:1,roiAdminHours:3,roiAdminRate:34,roiLeads:1,roiLeadHours:2,roiLeadRate:65,roiOvertime:0,roiLosses:25000},
 mid:{roiRevenue:4000000,roiMargin:60,roiWeeks:52,roiTechs:12,roiTechMins:15,roiTechRate:26,roiManagers:3,roiManagerHours:5,roiManagerRate:45,roiAdmins:2,roiAdminHours:4,roiAdminRate:35,roiLeads:1,roiLeadHours:3,roiLeadRate:65,roiOvertime:0,roiLosses:50000},
 large:{roiRevenue:12000000,roiMargin:60,roiWeeks:52,roiTechs:30,roiTechMins:20,roiTechRate:28,roiManagers:6,roiManagerHours:6,roiManagerRate:50,roiAdmins:4,roiAdminHours:6,roiAdminRate:38,roiLeads:2,roiLeadHours:4,roiLeadRate:75,roiOvertime:25000,roiLosses:150000}
};
const $=id=>document.getElementById(id);
const num=id=>Math.max(0,Number($(id).value)||0);
const money=new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0});
const number=new Intl.NumberFormat('en-US',{maximumFractionDigits:0});
const setText=(id,value)=>{$(id).textContent=value;};
const selectedPackage=()=>document.querySelector('input[name="roiPackage"]:checked').value;

function calculate(){
 const weeks=Math.min(52,num('roiWeeks'));
 const workdays=weeks*5;
 const techHours=num('roiTechs')*(num('roiTechMins')/60)*workdays;
 const managerHours=num('roiManagers')*num('roiManagerHours')*weeks;
 const adminHours=num('roiAdmins')*num('roiAdminHours')*weeks;
 const leadHours=num('roiLeads')*num('roiLeadHours')*weeks;
 const addressableHours=techHours+managerHours+adminHours+leadHours;
 const addressableValue=(techHours*num('roiTechRate'))+(managerHours*num('roiManagerRate'))+(adminHours*num('roiAdminRate'))+(leadHours*num('roiLeadRate'));
 const capture=num('roiCapture')/100;
 const redeploy=num('roiRedeploy')/100;
 const capturedHours=addressableHours*capture;
 const capacityValue=addressableValue*capture;
 const capacityIncluded=capacityValue*redeploy;

 const preventedLoss=num('roiLosses')*(num('roiLossCapture')/100);
 const avoidedHire=$('roiHireVerified').checked?num('roiHireCost'):0;
 const hardSavings=num('roiOvertime')+preventedLoss+avoidedHire;

 const strategicPotential=num('roiRevenue')*(num('roiMargin')/100)*(num('roiProductionGain')/100);
 const strategicIncluded=strategicPotential*(num('roiConfidence')/100);
 const annualValue=hardSavings+capacityIncluded+strategicIncluded;

 const packageKey=selectedPackage();
 const pkg=PACKAGES[packageKey];
 const firstYearCost=(pkg.monthly*12)+pkg.implementation;
 const netValue=annualValue-firstYearCost;
 const benefitCost=firstYearCost?annualValue/firstYearCost:0;
 const firstYearRoi=firstYearCost?(netValue/firstYearCost)*100:0;
 const payback=annualValue>0?firstYearCost/(annualValue/12):Infinity;
 const hurdle=num('roiHurdle');
 const priceHeadroom=hurdle>0?Math.max(0,((annualValue/hurdle)-pkg.implementation)/12):0;

 setText('roiCaptureReadout',`${number.format(num('roiCapture'))}%`);
 setText('roiRedeployReadout',`${number.format(num('roiRedeploy'))}%`);
 setText('roiLossCaptureReadout',`${number.format(num('roiLossCapture'))}%`);
 setText('roiConfidenceReadout',`${number.format(num('roiConfidence'))}%`);
 setText('roiHurdleReadout',`${hurdle.toFixed(1)}×`);
 setText('roiAnnualValue',money.format(annualValue));
 setText('roiHardSavings',money.format(hardSavings));
 setText('roiHardNote',avoidedHire?'Includes documented avoided hire':'Cash movement only; no avoided hire counted');
 setText('roiCapacityValue',money.format(capacityValue));
 setText('roiCapacityNote',`${number.format(capturedHours)} hours / year · ${money.format(capacityIncluded)} included`);
 setText('roiStrategicValue',money.format(strategicPotential));
 setText('roiStrategicNote',`${money.format(strategicIncluded)} included after confidence`);
 setText('roiPackageName',pkg.name);
 setText('roiMonthlyPrice',money.format(pkg.monthly));
 setText('roiImplementation',money.format(pkg.implementation));
 setText('roiFirstYearCost',money.format(firstYearCost));
 setText('roiNetValue',money.format(netValue));
 setText('roiRoi',`${firstYearRoi.toFixed(0)}%`);
 setText('roiBenefitCost',`${benefitCost.toFixed(1)}×`);
 setText('roiPayback',Number.isFinite(payback)?`${payback.toFixed(1)} months`:'—');
 setText('roiHeadroom',`${money.format(priceHeadroom)} / mo`);

 $('roiNetValue').classList.toggle('is-negative',netValue<0);
 $('roiRoi').classList.toggle('is-negative',firstYearRoi<0);
 $('roiMeterFill').style.width=`${Math.min(100,(benefitCost/5)*100)}%`;
 $('roiMeterMark').style.left=`${Math.min(100,(hurdle/5)*100)}%`;
 $('roiHireCost').disabled=!$('roiHireVerified').checked;

 const coreCapacity=addressableValue*(PACKAGES.core.capture/100)*redeploy;
 const coreBenefit=hardSavings+coreCapacity+strategicIncluded;
 const coreCost=(PACKAGES.core.monthly*12)+PACKAGES.core.implementation;
 const coreRatio=coreBenefit/coreCost;
 const cashCoverage=firstYearCost?Math.min(999,(hardSavings/firstYearCost)*100):0;
 let fitLabel,verdict;
 if(benefitCost>=hurdle){
  fitLabel=`Clears ${hurdle.toFixed(1)}× hurdle`;
  verdict=`The ${pkg.name} model clears your hurdle with ${number.format(capturedHours)} distinct hours returned per year. Hard savings alone cover ${cashCoverage.toFixed(0)}% of first-year cost; the rest of the case depends on measured redeployment and operating upside.`;
 }else if(packageKey!=='core'&&coreRatio>=hurdle){
  fitLabel='Core first';
  verdict=`The current assumptions support Core at ${coreRatio.toFixed(1)}×, but not ${pkg.name} at the ${hurdle.toFixed(1)}× hurdle. Prove the additional agentic capture in a 90-day pilot before expanding.`;
 }else if(benefitCost>=1){
  fitLabel='Positive, below hurdle';
  verdict=`The model is positive in year one, but does not yet clear your ${hurdle.toFixed(1)}× hurdle. A pilot should measure returned hours, prevented errors and one full plan-to-actual cycle before treating the upside as bankable.`;
 }else{
  fitLabel='Pilot validation needed';
  verdict=`These assumptions do not yet support the selected package in year one. Start with a bounded proof, or revisit only the costs you can document—never inflate capacity into cash savings.`;
 }
 setText('roiFitLabel',fitLabel);
 setText('roiVerdictText',verdict);

 const emailBody=[
  'Cultivo ROI model',
  '',
  `Package: ${pkg.name} (${money.format(pkg.monthly)}/month + ${money.format(pkg.implementation)} implementation)`,
  `Modeled annual value: ${money.format(annualValue)}`,
  `Hard-dollar savings: ${money.format(hardSavings)}`,
  `Capacity released: ${number.format(capturedHours)} hours/year (${money.format(capacityValue)} opportunity; ${money.format(capacityIncluded)} included)`,
  `Strategic upside: ${money.format(strategicPotential)} potential; ${money.format(strategicIncluded)} included`,
  `First-year investment: ${money.format(firstYearCost)}`,
  `First-year net value: ${money.format(netValue)}`,
  `Benefit/cost: ${benefitCost.toFixed(1)}x`,
  `Payback: ${Number.isFinite(payback)?payback.toFixed(1)+' months':'not reached'}`,
  '',
  `Facility revenue assumption: ${money.format(num('roiRevenue'))}`,
  `Workload capture: ${number.format(num('roiCapture'))}%`,
  `Productive redeployment: ${number.format(num('roiRedeploy'))}%`,
  `Required hurdle: ${hurdle.toFixed(1)}x`,
  '',
  'Illustrative estimate; assumptions require pilot validation.'
 ].join('\n');
 $('roiEmail').href=`mailto:justin@gopraxis.ai?subject=${encodeURIComponent('Cultivo ROI model')}&body=${encodeURIComponent(emailBody)}`;
}

document.querySelectorAll('[data-roi-preset]').forEach(button=>{
 button.addEventListener('click',()=>{
  const preset=PRESETS[button.dataset.roiPreset];
  Object.entries(preset).forEach(([id,value])=>{$(id).value=value;});
  document.querySelectorAll('[data-roi-preset]').forEach(item=>item.classList.toggle('is-active',item===button));
  calculate();
 });
});
document.querySelectorAll('input[name="roiPackage"]').forEach(input=>{
 input.addEventListener('change',()=>{
  $('roiCapture').value=PACKAGES[input.value].capture;
  calculate();
 });
});
form.addEventListener('input',calculate);
form.addEventListener('change',calculate);
calculate();
})();

// Walkthrough request: keep the static site dependency-free while doing the
// qualification work before the visitor reaches their mail client.
(()=>{
 const form=document.getElementById('walkthroughForm');
 if(!form)return;
 const status=document.getElementById('walkthroughStatus');
 form.addEventListener('submit',event=>{
  event.preventDefault();
  if(!form.reportValidity())return;
  const name=document.getElementById('leadName').value.trim();
  const email=document.getElementById('leadEmail').value.trim();
  const challenge=document.getElementById('leadChallenge').value;
  const subject=`Cultivo fit check — ${challenge}`;
  const body=[
   'Cultivo walkthrough request',
   '',
   `Name: ${name}`,
   `Work email: ${email}`,
   `First problem to solve: ${challenge}`,
   '',
   'I would like to schedule a 20-minute fit check.'
  ].join('\n');
  status.textContent='Your request is ready. Opening your email app…';
  window.location.href=`mailto:justin@gopraxis.ai?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
 });
})();
