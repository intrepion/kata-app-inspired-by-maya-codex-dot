import {CHANNELS,NEUTRAL,copy,sample,setKey,mirror,preset,validate,rig} from './model.js';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const STORE='kata-kinframe-v1'; let project=preset(),frame=0,current=sample(project.keys,0),selected='armR',playing=false,last=0,dirty=false,history=[],future=[],drag=null,storageWarning=false,raf=0;
try{const saved=localStorage.getItem(STORE);if(saved)project=validate(JSON.parse(saved));}catch{storageWarning=true;}
current=sample(project.keys,frame);
function status(text){$('#status').textContent=text;}
function snapshot(){return {project:copy(project),frame,current:copy(current)};}
function remember(){history.push(snapshot());if(history.length>50)history.shift();future=[];}
function persist(){dirty=true;try{localStorage.setItem(STORE,JSON.stringify(project));}catch{status('Browser storage is full or unavailable. Save a project file.');}}
function restore(s){project=copy(s.project);frame=s.frame;current=copy(s.current);stop();persist();render();}
function atFrame(n){frame=Math.max(0,Math.min(project.duration,n));current=sample(project.keys,frame);render();}
function stop(){cancelAnimationFrame(raf);playing=false;$('#play').textContent='▶';$('#play').setAttribute('aria-label','Play animation');}
function switchPlay(){if(playing){stop();return;}playing=true;last=performance.now();$('#play').textContent=playing?'Ⅱ':'▶';$('#play').setAttribute('aria-label',playing?'Pause animation':'Play animation');if(playing)raf=requestAnimationFrame(tick);}
function tick(t){if(!playing)return;frame=(frame+(t-last)/1000*project.fps)%(project.duration+1);last=t;current=sample(project.keys,frame);render();raf=requestAnimationFrame(tick);}
function line(a,b,width,color){return `<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke="${color}" stroke-width="${width}" stroke-linecap="round"/>`;}
function circle(p,r,color,extra=''){return `<circle cx="${p.x}" cy="${p.y}" r="${r}" fill="${color}" ${extra}/>`;}
function puppet(p,ghost=false,handles=false){const r=rig(p);let s='<g'+(ghost?' opacity=".12"':'')+'>';
 s+=line(r.hipL,r.kneeL,26,'#425f59')+line(r.kneeL,r.footL,23,'#769489')+line(r.hipR,r.kneeR,26,'#526e65')+line(r.kneeR,r.footR,23,'#8aa497');
 for(const f of [r.footL,r.footR])s+=`<rect x="${f.x-16}" y="${f.y-9}" width="39" height="19" rx="9" fill="#344b45"/>`;
 s+=line(r.shoulderL,r.elbowL,24,'#dfba91')+line(r.elbowL,r.handL,21,'#e7caaa')+circle(r.handL,14,'#c4946c');
 s+=line(r.shoulderR,r.elbowR,24,'#dfba91')+line(r.elbowR,r.handR,21,'#e7caaa')+circle(r.handR,14,'#c4946c');
 s+=line(r.root,r.chest,76,'#a7bba0')+line(r.root,r.chest,65,'#bfd0af');
 s+=`<g transform="translate(${r.chest.x},${r.chest.y}) rotate(${-p.body})"><rect x="-24" y="-10" width="48" height="28" rx="9" fill="#d2ddc5"/><path d="M-14 31H14M-14 39H5" stroke="#8ba382" stroke-width="3" stroke-linecap="round"/></g>`;
 s+=line(r.chest,r.neck,22,'#a68e71');
 s+=`<g transform="translate(${r.head.x},${r.head.y}) rotate(${-p.body-p.head})"><rect x="-35" y="-33" width="70" height="65" rx="24" fill="#e3c5a0"/><rect x="-29" y="-29" width="58" height="51" rx="20" fill="#f0d9b7"/><rect x="-22" y="-10" width="44" height="21" rx="9" fill="#394e48"/><circle cx="-10" cy="0" r="3.5" fill="#c2dfb6"/><circle cx="10" cy="0" r="3.5" fill="#c2dfb6"/><path d="M-7 19Q0 24 7 19" stroke="#bd9065" stroke-width="2" fill="none"/><path d="M-23 -28Q0 -42 23 -28" fill="none" stroke="#7f9c75" stroke-width="7" stroke-linecap="round"/></g>`;
 if(handles&&!ghost){const dots={body:r.chest,head:r.head,armL:r.elbowL,foreL:r.handL,armR:r.elbowR,foreR:r.handR,legL:r.kneeL,shinL:r.footL,legR:r.kneeR,shinR:r.footR};for(const [id,pos] of Object.entries(dots))s+=circle(pos,id===selected?11:7,'#fffdf2',`data-joint="${id}" stroke="${id===selected?'#c18150':'#7f9c74'}" stroke-width="${id===selected?3:1.5}" style="cursor:grab"`);s+=`<ellipse cx="${r.root.x}" cy="${r.root.y+8}" rx="51" ry="14" stroke="#b49d75" stroke-width="1.5" fill="none" stroke-dasharray="4 3"/>`;}
 return s+'</g>';
}
function stageMarkup(exporting=false){let s='<defs><pattern id="grid" width="42" height="42" patternUnits="userSpaceOnUse"><path d="M42 0H0V42" fill="none" stroke="#dce2d3" stroke-width=".65"/></pattern><radialGradient id="paper"><stop stop-color="#fcfcf8"/><stop offset="1" stop-color="#eef0e7"/></radialGradient><radialGradient id="shadow"><stop stop-color="#8e9e7f" stop-opacity=".25"/><stop offset="1" stop-color="#8e9e7f" stop-opacity="0"/></radialGradient></defs><rect width="900" height="530" fill="url(#paper)"/><path d="M0 407L450 335L900 407V530H0Z" fill="url(#grid)"/><path d="M0 407L450 335L900 407" fill="none" stroke="#dce2d3"/><ellipse cx="450" cy="466" rx="130" ry="25" fill="url(#shadow)"/>';
 if(!exporting&&$('#onion').checked){s+=puppet(sample(project.keys,Math.max(0,frame-12)),true)+puppet(sample(project.keys,Math.min(project.duration,frame+12)),true);}
 return s+puppet(current,false,!exporting&&$('#controls').checked);
}
function render(){
 $('#viewport').innerHTML=stageMarkup();const c=CHANNELS.find(c=>c.id===selected);$('#joint').value=selected;$('#angle').min=c.min;$('#angle').max=c.max;$('#angle').value=current[selected];$('#jointNumber').textContent=Math.round(current[selected]);$('#jointUnit').textContent=c.unit;$('#min').textContent=c.min+c.unit;$('#max').textContent=c.max+c.unit;
 $('#projectName').value=project.name;$('#scrubber').max=project.duration;$('#scrubber').value=frame;$('#frameNumber').textContent=String(Math.floor(frame)).padStart(3,'0');$('#durationLabel').textContent=String(project.duration).padStart(3,'0');$('#fps').value=project.fps;$('#keyCount').textContent=`${project.keys.length} keys`;
 const exact=project.keys.find(k=>k.frame===Math.round(frame)); const isKey=exact&&CHANNELS.every(c=>Math.abs(exact.pose[c.id]-current[c.id])<.01);
 $('#poseState').textContent=isKey?'◇ Keyed pose':'○ Preview pose · press K to key';$('#deleteKey').disabled=!exact||project.keys.length<=1;
 $('#easing').value=exact?.easing||project.keys.filter(k=>k.frame<=frame).at(-1)?.easing||'smooth';
 $('#keyTrack').innerHTML=project.keys.map(k=>`<button class="key-marker ${k.frame===Math.round(frame)?'active':''}" data-frame="${k.frame}" style="left:${k.frame/project.duration*100}%" aria-label="Go to keyframe ${k.frame}"></button>`).join('')+`<div class="playhead" style="left:${frame/project.duration*100}%"></div>`;
 $('#ruler').innerHTML=Array.from({length:9},(_,i)=>`<span>${String(Math.round(i*project.duration/8)).padStart(2,'0')}</span>`).join('');
 const points=Array.from({length:97},(_,i)=>{const val=sample(project.keys,i/96*project.duration)[selected];return `${i/96*224+8},${86-(val-c.min)/(c.max-c.min)*76}`;}).join(' ');
 $('#curve').innerHTML=`<path d="M8 48H232M120 8V88" stroke="#e3e9da" fill="none"/><polyline points="${points}" stroke="#91a77d" stroke-width="2" fill="none"/><path d="M${frame/project.duration*224+8} 8V88" stroke="#c58a59" stroke-width="1"/>`;
 $('#undo').disabled=!history.length;$('#redo').disabled=!future.length;
}
$('#joint').innerHTML=CHANNELS.map(c=>`<option value="${c.id}">${c.name}</option>`).join('');
$('#joint').onchange=e=>{selected=e.target.value;render();};
let rangeSaved=false;$('#angle').onpointerdown=()=>{remember();rangeSaved=true;stop();};
$('#angle').oninput=e=>{if(!rangeSaved){remember();rangeSaved=true;}stop();current[selected]=Number(e.target.value);dirty=true;render();};
$('#angle').onchange=()=>{rangeSaved=false;};
$('#resetJoint').onclick=()=>{remember();stop();current[selected]=NEUTRAL[selected];dirty=true;render();};
$('#mirror').onclick=()=>{remember();stop();current=mirror(current);dirty=true;render();status('Pose mirrored. Set a key to keep it on the timeline.');};
function key(){remember();stop();frame=Math.round(frame);project=setKey(project,frame,current,$('#easing').value);persist();render();status(`Pose key saved at frame ${frame}.`);}
$('#setKey').onclick=key;
$('#deleteKey').onclick=()=>{if(project.keys.length<=1)return;remember();project.keys=project.keys.filter(k=>k.frame!==Math.round(frame));persist();current=sample(project.keys,frame);render();status('Key removed. Undo is available.');};
$('#easing').onchange=e=>{const k=project.keys.find(k=>k.frame===Math.round(frame));if(k){remember();k.easing=e.target.value;persist();render();status('Interpolation updated for the segment after this key.');}};
$('#projectName').onchange=e=>{remember();project.name=e.target.value.trim()||'Untitled motion';persist();render();};$('#fps').onchange=e=>{remember();project.fps=Number(e.target.value);persist();};
$('#scrubber').oninput=e=>{stop();atFrame(Number(e.target.value));};$('#keyTrack').onclick=e=>{if(e.target.dataset.frame){stop();atFrame(Number(e.target.dataset.frame));}};
$('#play').onclick=switchPlay;$('#first').onclick=()=>{stop();atFrame(0);};$('#last').onclick=()=>{stop();atFrame(project.duration);};
$('#onion').onchange=render;$('#controls').onchange=render;
$$('[data-preset]').forEach(b=>b.onclick=()=>{if(dirty&&!confirm('Replace this motion with a preset? Download a project first to keep it. You can also undo.'))return;remember();stop();project=preset(b.dataset.preset);frame=0;current=sample(project.keys,0);persist();render();status('Preset loaded. Make it your own.');});
function undo(){if(!history.length)return;future.push(snapshot());restore(history.pop());status('Undid the last change.');}function redo(){if(!future.length)return;history.push(snapshot());restore(future.pop());status('Redid the last change.');}$('#undo').onclick=undo;$('#redo').onclick=redo;
function download(blob,name){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function save(){if(CHANNELS.some(c=>Math.abs(current[c.id]-sample(project.keys,frame)[c.id])>.01)){if(!confirm(`Key this preview pose at frame ${Math.round(frame)} before saving?`))return;key();}download(new Blob([JSON.stringify(project,null,2)],{type:'application/json'}),'kinframe-project.kinframe');dirty=false;status('Project downloaded. Preview poses must be keyed to be included.');}$('#save').onclick=save;
$('#export').onclick=()=>{download(new Blob([`<svg xmlns="http://www.w3.org/2000/svg" width="1800" height="1060" viewBox="0 0 900 530">${stageMarkup(true)}</svg>`],{type:'image/svg+xml'}),`kinframe-${Math.round(frame)}.svg`);status('Clean vector frame exported as SVG.');};
$('#open').onclick=()=>$('#file').click();$('#file').onchange=async e=>{const file=e.target.files[0];if(!file)return;try{if(file.size>1000000)throw Error('Project files must be smaller than 1 MB.');const next=validate(JSON.parse(await file.text()));if(dirty&&!confirm('Replace this motion with the selected project? You can undo.'))return;remember();stop();project=next;frame=0;current=sample(project.keys,0);persist();render();status('Project opened successfully.');}catch(err){status(`Could not open project: ${err.message}`);}finally{e.target.value='';}};
$('#help').onclick=()=>$('#helpDialog').showModal();$('#closeHelp').onclick=()=>$('#helpDialog').close();
$('#viewport').onpointerdown=e=>{const id=e.target.dataset.joint;if(!id)return;stop();remember();selected=id;const p=screenPoint(e),r=rig(current);const anchors={body:r.root,head:r.neck,armL:r.shoulderL,foreL:r.elbowL,armR:r.shoulderR,foreR:r.elbowR,legL:r.hipL,shinL:r.kneeL,legR:r.hipR,shinR:r.kneeR};const anchor=anchors[id];drag={id,anchor,start:Math.atan2(p.x-anchor.x,p.y-anchor.y),value:current[id]};$('#viewport').setPointerCapture(e.pointerId);render();};
function screenPoint(e){return new DOMPoint(e.clientX,e.clientY).matrixTransform($('#viewport').getScreenCTM().inverse());}
$('#viewport').onpointermove=e=>{if(!drag)return;const p=screenPoint(e),angle=Math.atan2(p.x-drag.anchor.x,p.y-drag.anchor.y),c=CHANNELS.find(c=>c.id===drag.id);let delta=angle-drag.start;while(delta>Math.PI)delta-=2*Math.PI;while(delta<-Math.PI)delta+=2*Math.PI;current[drag.id]=Math.max(c.min,Math.min(c.max,drag.value+delta*180/Math.PI));dirty=true;render();};
$('#viewport').onpointerup=()=>{drag=null;};$('#viewport').onpointercancel=()=>{drag=null;};
window.addEventListener('keydown',e=>{if($('#helpDialog').open||['INPUT','SELECT','TEXTAREA'].includes(document.activeElement.tagName))return;if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='s'){e.preventDefault();save();}else if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'){e.preventDefault();e.shiftKey?redo():undo();}else if(e.code==='Space'){e.preventDefault();switchPlay();}else if(e.key.toLowerCase()==='k'){e.preventDefault();key();}else if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();stop();atFrame(Math.round(frame)+(e.key==='ArrowRight'?1:-1));}});
window.addEventListener('beforeunload',e=>{if(dirty){e.preventDefault();e.returnValue='';}});
render();if(storageWarning)status('Could not restore browser autosave. Save project files for durable backups.');
