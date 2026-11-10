const frame=document.querySelector('#app');if(frame.contentDocument.readyState!=='complete'||!frame.contentDocument.querySelector('#viewport'))await new Promise(r=>frame.addEventListener('load',r,{once:true}));
const win=frame.contentWindow,doc=frame.contentDocument,$=s=>doc.querySelector(s),results=[];let downloads=[];win.confirm=()=>true;
win.URL.createObjectURL=blob=>{downloads.push(blob);return 'blob:test';};win.URL.revokeObjectURL=()=>{};win.HTMLAnchorElement.prototype.click=function(){};
const assert=(ok,name)=>{results.push(`${ok?'PASS':'FAIL'} ${name}`);if(!ok)throw Error(name);};
const input=(sel,value)=>{const e=$(sel);e.value=value;e.dispatchEvent(new win.Event('input',{bubbles:true}));e.dispatchEvent(new win.Event('change',{bubbles:true}));};
// Poll observable progress rather than assuming a fixed animation-frame cadence.
const waitFor=async predicate=>{const end=Date.now()+5000;while(!predicate()&&Date.now()<end)await new Promise(r=>setTimeout(r,50));};
try{
 $('[data-preset="wave"]').click();
 assert($('#viewport').querySelectorAll('[data-joint]').length===10,'10 visible rotation handles');
 const starterKeys=$('#keyTrack').querySelectorAll('button').length;
 assert(starterKeys===13,'starter includes anticipation, wave, and settle keys');
 assert($('#viewport').querySelectorAll('circle[fill="#c2dfb6"]').length===2,'front-facing head renders');
 input('#scrubber','8');$('#joint').value='head';$('#joint').dispatchEvent(new win.Event('change'));input('#angle','30');
 assert($('#jointNumber').textContent==='30','channel slider updates pose');$('#setKey').click();
 assert($('#keyTrack').querySelectorAll('button').length===starterKeys+1,'set key adds a timeline key');$('#setKey').click();
 assert($('#keyTrack').querySelectorAll('button').length===starterKeys+1,'repeated key action replaces rather than duplicates');
 $('#easing').value='hold';$('#easing').dispatchEvent(new win.Event('change'));assert($('#easing').value==='hold','interpolation changes');
 $('#deleteKey').click();assert($('#keyTrack').querySelectorAll('button').length===starterKeys,'remove key');$('#undo').click();assert($('#keyTrack').querySelectorAll('button').length===starterKeys+1,'undo restores key');$('#redo').click();assert($('#keyTrack').querySelectorAll('button').length===starterKeys,'redo removes again');
 $('#save').click();const saved=JSON.parse(await downloads.at(-1).text());assert(saved.format==='kata-kinframe','project export format');
 $('#export').click();const svg=await downloads.at(-1).text();assert(svg.includes('<svg')&&!svg.includes('data-joint'),'clean SVG export excludes controls');
 $('#onion').click();assert($('#viewport').querySelectorAll('[opacity=".12"]').length===2,'ghost poses render');$('#onion').click();
 $('#controls').click();assert($('#viewport').querySelectorAll('[data-joint]').length===0,'rig handles toggle');$('#controls').click();
 $('#play').click();await waitFor(()=>Number($('#scrubber').value)>8);$('#play').click();assert(Number($('#scrubber').value)>8,'playback advances timeline');
 $('[data-preset="walk"]').click();assert($('#projectName').value==='Little steps','preset changes scene');
 assert($('#stageView').textContent==='RIGHT PROFILE','walk uses readable profile view');
 assert($('#viewport').querySelectorAll('circle[fill="#c2dfb6"]').length===1,'profile head renders');
 $('#save').click();const walkSaved=JSON.parse(await downloads.at(-1).text());assert(walkSaved.view==='right'&&walkSaved.keys.length===97,'walk exports editable grounded keys and view');
 $('#export').click();const walkSvg=await downloads.at(-1).text();assert(walkSvg.includes('scale(1,1)')&&!walkSvg.includes('data-joint'),'profile SVG export uses the same clean pose');
 $('#fps').value='30';$('#fps').dispatchEvent(new win.Event('change'));assert($('#stageFps').textContent==='30 FPS','stage shows actual playback rate');
 $('#mirror').click();$('#undo').click();assert($('#stageView').textContent==='RIGHT PROFILE','mirror undo preserves profile project');
 win.confirm=()=>false;$('[data-preset="bounce"]').click();assert($('#projectName').value==='Little steps','cancel preset replacement preserves motion');win.confirm=()=>true;
 input('#scrubber','6');$('#play').click();await waitFor(()=>Number($('#scrubber').value)>6);input('#scrubber','12');assert($('#play').getAttribute('aria-label')==='Play animation'&&Number($('#scrubber').value)===12,'scrubbing interrupts playback');
 const dt=new win.DataTransfer();dt.items.add(new win.File([JSON.stringify(saved)],'test.kinframe',{type:'application/json'}));$('#file').files=dt.files;$('#file').dispatchEvent(new win.Event('change'));await new Promise(r=>setTimeout(r,100));assert($('#projectName').value===saved.name,'project import round trip');
 const bad=new win.DataTransfer();bad.items.add(new win.File(['{}'],'bad.kinframe',{type:'application/json'}));$('#file').files=bad.files;$('#file').dispatchEvent(new win.Event('change'));await new Promise(r=>setTimeout(r,100));assert($('#status').textContent.startsWith('Could not open'),'malformed import rejected');assert($('#projectName').value===saved.name,'failed import preserves scene');
 $('#help').click();assert($('#helpDialog').open,'help opens');$('#closeHelp').click();assert(!$('#helpDialog').open,'help closes');
 assert(JSON.parse(win.localStorage.getItem('kata-kinframe-v1')).name===saved.name,'autosave stores validated project');
 frame.style.width='390px';await new Promise(r=>setTimeout(r,80));assert(doc.documentElement.scrollWidth<=390,'390px layout has no horizontal overflow');
}catch(e){results.push('ERROR '+e.message);}finally{$('#save').click();win.localStorage.removeItem('kata-kinframe-v1');document.querySelector('#results').textContent=results.join('\n')+'\n\n'+results.filter(r=>r.startsWith('PASS')).length+' passed; '+results.filter(r=>r.startsWith('FAIL')).length+' failed';document.body.dataset.result=results.some(r=>/^(FAIL|ERROR)/.test(r))?'failed':'passed';win.onbeforeunload=null;}
