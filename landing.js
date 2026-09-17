import { scenario, nextState } from './scenario.mjs';
const $=id=>document.getElementById(id);
const canvas=$('facility'),ctx=canvas.getContext('2d');
const stage=$('modelStage'),labels=$('roomLabels');
const rooms=[
 {id:'mother',name:'Mothers',label:'Mothers',x:-244,y:-153,w:144,h:126,color:'#9e9362',kind:'plants',meta:'Mother stock · future clone supply'},
 {id:'veg',name:'Vegetative',label:'Veg',x:-80,y:-153,w:144,h:126,color:'#6d9d83',kind:'plants',meta:'Vegetative growth · next flower cycle'},
 {id:'flower',name:'Flower 01',label:'Flower 01',x:84,y:-153,w:156,h:126,color:'#9bb28c',kind:'plants',meta:'240 plants · harvest Oct 12'},
 {id:'dry',name:'Dry room',label:'Dry',x:84,y:16,w:156,h:125,color:'#a89877',kind:'racks',meta:'Current batch · room free Oct 22'},
 {id:'trim',name:'Trim & cure',label:'Trim / cure',x:-80,y:16,w:144,h:125,color:'#799caa',kind:'tables',meta:'Post-harvest work · after drying'},
 {id:'pack',name:'Packaging',label:'Pack / dispatch',x:-244,y:16,w:144,h:125,color:'#799caa',kind:'pack',meta:'Packaging · planned availability Nov 24'}
];
let state='planned',selected='flower',yaw=-.31,zoom=1,width=0,height=0,drag=null,frame=0;
const buttons=new Map();
for(const room of rooms){const button=document.createElement('button');button.type='button';button.className='room-label';button.textContent=room.label;button.setAttribute('aria-label',`Inspect ${room.name}`);button.setAttribute('aria-pressed',String(room.id===selected));button.addEventListener('click',()=>{selected=room.id;update();});labels.append(button);buttons.set(room.id,button);}
const mix=(hex,k)=>{const a=hex.replace('#','');return '#'+[0,2,4].map(i=>Math.round(Math.min(255,parseInt(a.slice(i,i+2),16)*k)).toString(16).padStart(2,'0')).join('');};
function project(x,y,z=0){const c=Math.cos(yaw),s=Math.sin(yaw),u=x*c-y*s,v=x*s+y*c;const fit=Math.min((width-34)/610,(height-64)/350)*zoom;return{x:width/2+u*fit,y:height*.52+(v*.61-z*.96)*fit,d:v};}
function path(points,fill,stroke,line=1){ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.closePath();if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=line;ctx.stroke();}}
function rect(x,y,w,h,z,fill,stroke,line=1){path([project(x,y,z),project(x+w,y,z),project(x+w,y+h,z),project(x,y+h,z)],fill,stroke,line);}
function box(x,y,w,h,z,t,color){const b=[project(x,y,z),project(x+w,y,z),project(x+w,y+h,z),project(x,y+h,z)],a=[project(x,y,z+t),project(x+w,y,z+t),project(x+w,y+h,z+t),project(x,y+h,z+t)];path([b[1],b[2],a[2],a[1]],mix(color,.56));path([b[2],b[3],a[3],a[2]],mix(color,.71));path(a,color,mix(color,1.18),.6);}
function line(a,b,color,w=1){ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.strokeStyle=color;ctx.lineWidth=w;ctx.stroke();}
function plant(x,y,size,color){const p=project(x,y,11);const q=project(x,y,18+size);const f=Math.min(width/610,height/350);line(p,q,'#638872',1);ctx.save();ctx.translate(q.x,q.y);for(let a=0;a<5;a++){ctx.save();ctx.rotate(a*Math.PI*.4);ctx.beginPath();ctx.ellipse(size*.35*f,0,size*.64*f,size*.27*f,0,0,Math.PI*2);ctx.fillStyle=a%2?mix(color,.79):color;ctx.fill();ctx.restore();}ctx.beginPath();ctx.arc(0,0,1.8*f,0,Math.PI*2);ctx.fillStyle=mix(color,1.25);ctx.fill();ctx.restore();}
function furniture(r){if(r.kind==='plants'){
 for(let row=0;row<3;row++){const y=r.y+16+row*31;box(r.x+12,y,r.w-24,23,5,6,'#526d60');for(let i=0;i<6;i++)plant(r.x+22+i*(r.w-43)/5,y+12,r.id==='mother'?7:6,r.id==='flower'?'#94b488':'#79a68b');}
 }else if(r.kind==='racks'){
 for(let row=0;row<3;row++){const y=r.y+18+row*31;box(r.x+15,y,r.w-30,7,5,31,'#7d8172');for(let i=0;i<9;i++){const x=r.x+22+i*13;line(project(x,y+5,31),project(x,y+5,14),'#a69b78',2);plant(x,y+5,4,'#8b9668');}}
 }else{for(let row=0;row<2;row++){const y=r.y+22+row*44;box(r.x+15,y,r.w-30,25,5,12,'#748f92');for(let i=0;i<4;i++)box(r.x+22+i*26,y+7,17,13,17,r.kind==='pack'?9:6,r.kind==='pack'?'#bbab84':'#98afb0');}}
}
function drawRoom(r){const isSelected=r.id===selected;const affected=state!=='planned'&&['flower','dry','trim','pack'].includes(r.id);const accent=r.id==='dry'&&state!=='planned'?'#edaa98':affected?'#d7b469':r.color;
 // Raised slab, solid low walls, and readable furniture replace transparent wireframes.
 box(r.x,r.y,r.w,r.h,0,5,isSelected?'#3d5148':'#263e40');
 rect(r.x+4,r.y+4,r.w-8,r.h-8,5,isSelected?'#40594c':'#2b4543',accent,isSelected?1.8:.7);
 box(r.x,r.y,r.w,5,5,30,'#667c78');box(r.x,r.y,5,r.h,5,30,'#566e6c');box(r.x+r.w-5,r.y,5,r.h,5,14,'#607675');
 furniture(r);
 // Open doorway on the low front wall.
 box(r.x,r.y+r.h-4,r.w*.39,4,5,9,'#546d68');box(r.x+r.w*.62,r.y+r.h-4,r.w*.38,4,5,9,'#546d68');
 const label=project(r.x+r.w/2,r.y+r.h-15,14);const button=buttons.get(r.id);button.style.left=label.x+'px';button.style.top=label.y+'px';
}
function render(){frame=0;if(!ctx||!width)return;const dpr=Math.min(window.devicePixelRatio||1,2);ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,width,height);
 // Quiet site grid, kept behind the facility.
 for(let x=-330;x<=330;x+=30)line(project(x,-210,-10),project(x,210,-10),'#35515345',.6);
 for(let y=-210;y<=210;y+=30)line(project(-330,y,-10),project(330,y,-10),'#35515345',.6);
 ctx.save();ctx.shadowColor='#0008';ctx.shadowBlur=28;ctx.shadowOffsetY=20;rect(-259,-168,515,325,-7,'#132329');ctx.restore();
 box(-259,-168,515,325,-9,9,'#253a40');
 rect(-250,-21,497,29,1,'#344448');
 for(let x=-235;x<240;x+=34)rect(x,-9,15,1,2,'#8c977955');
 rooms.slice().sort((a,b)=>project(a.x+a.w/2,a.y+a.h/2).d-project(b.x+b.w/2,b.y+b.h/2).d).forEach(drawRoom);
 // A visible route connects only the stages affected by the example change.
 if(state!=='planned'){
 const pts=[[162,-17],[162,3],[0,3],[-172,3]];ctx.setLineDash([4,4]);for(let i=1;i<pts.length;i++)line(project(...pts[i-1],7),project(...pts[i],7),'#e4bd72',2);ctx.setLineDash([]);
 }
}
function draw(){if(!frame)frame=requestAnimationFrame(render);}
function resize(){const box=stage.getBoundingClientRect();width=box.width;height=box.height;const dpr=Math.min(window.devicePixelRatio||1,2);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);draw();}
new ResizeObserver(resize).observe(stage);
function update(){const data=scenario(state);const room=rooms.find(r=>r.id===selected);$('roomName').textContent=room.name;let meta=room.meta;if(selected==='flower')meta=`240 plants · ${data.delay?'proposed harvest':'harvest'} ${data.stages[0].date}`;if(selected==='dry')meta=`Room free ${data.stages[1].date}${data.conflictDays?' · next intake Oct 23':''}`;if(selected==='pack')meta=`Planned availability ${data.stages[3].date}`;if(state==='confirmed')meta=meta.replace('proposed harvest','example harvest');$('roomMeta').textContent=meta;
 $('stateTag').textContent=state==='planned'?'As planned':state==='proposed'?'Proposed +2 days':'Example confirmed';$('stateTag').className='state-tag '+state;
 $('timeline').replaceChildren(...data.stages.map(s=>{const item=document.createElement('div');item.className='timeline-item'+(data.delay?' changed':'');const name=document.createElement('span');name.textContent=s.label;const value=document.createElement('b');value.textContent=s.date;item.append(name,value);if(data.delay){const old=document.createElement('s');old.textContent=s.original;item.append(old);}return item;}));
 $('scenarioKicker').textContent=state==='planned'?'Try a change':state==='proposed'?'Review the impact':'Decision recorded in this example';
 $('scenarioText').textContent=state==='planned'?'Harvest needs two more days. What moves?':state==='proposed'?'Four dates move. One room needs a decision.':'Dates updated. The room conflict stays visible.';
 $('scenarioAction').textContent=state==='planned'?'Move harvest +2 days →':state==='proposed'?'Confirm example →':'Replay example ↺';
 $('scenarioResult').textContent=state==='planned'?'':state==='proposed'?'Dry room overlap · The next batch arrives Oct 23, one day before this room is free. Review the room assignment or intake date. Nothing is confirmed yet.':'Example confirmed · Dry room overlap is still open. Confirming dates does not resolve the next batch’s room assignment.';
 $('resetExample').hidden=state==='planned';
 for(const r of rooms){const b=buttons.get(r.id);b.setAttribute('aria-pressed',String(r.id===selected));b.classList.toggle('affected',state!=='planned'&&['flower','dry','trim','pack'].includes(r.id));b.classList.toggle('conflict',state!=='planned'&&r.id==='dry');}
 draw();
}
$('scenarioAction').addEventListener('click',()=>{state=nextState(state);if(state==='proposed')selected='dry';if(state==='planned')selected='flower';update();});
$('resetExample').addEventListener('click',()=>{state='planned';selected='flower';update();$('scenarioAction').focus();});
$('rotateLeft').addEventListener('click',()=>{yaw=Math.max(-.85,yaw-.17);draw();});$('rotateRight').addEventListener('click',()=>{yaw=Math.min(.55,yaw+.17);draw();});$('resetView').addEventListener('click',()=>{yaw=-.31;zoom=1;draw();});
canvas.addEventListener('pointerdown',e=>{if(e.button!==0)return;drag={x:e.clientX,start:yaw};canvas.setPointerCapture(e.pointerId);});
canvas.addEventListener('pointermove',e=>{if(!drag)return;yaw=Math.max(-.85,Math.min(.55,drag.start+(e.clientX-drag.x)*.003));draw();});
const endDrag=()=>{drag=null;};canvas.addEventListener('pointerup',endDrag);canvas.addEventListener('pointercancel',endDrag);canvas.addEventListener('lostpointercapture',endDrag);
update();resize();
const dialog=$('plannerDialog');const openPlanner=()=>{if(!dialog.open)dialog.showModal();};$('expandPlanner').addEventListener('click',openPlanner);$('plannerImageButton').addEventListener('click',openPlanner);$('closePlanner').addEventListener('click',()=>dialog.close());dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
$('demoForm').addEventListener('submit',e=>{e.preventDefault();const form=e.currentTarget;if(!form.reportValidity())return;const name=$('leadName').value.trim(),email=$('leadEmail').value.trim(),challenge=$('leadChallenge').value;const body=['Hello Justin,','',`I would like a 20-minute Cultivo walkthrough.`,`Name: ${name}`,`Work email: ${email}`,`Starting point: ${challenge}`,'','Please suggest a time.'].join('\n');$('formStatus').textContent='Your email draft is ready. Send it from your email app to request a walkthrough. If it did not open, use the email link below.';window.location.href=`mailto:justin@gopraxis.ai?subject=${encodeURIComponent('Cultivo demo request — '+challenge)}&body=${encodeURIComponent(body)}`;});
