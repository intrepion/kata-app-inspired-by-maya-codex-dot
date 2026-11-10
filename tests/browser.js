const frame=document.querySelector('#app');if(frame.contentDocument.readyState!=='complete'||!frame.contentDocument.querySelector('#viewport'))await new Promise(r=>frame.addEventListener('load',r,{once:true}));
const win=frame.contentWindow,doc=frame.contentDocument,$=s=>doc.querySelector(s),results=[];let downloads=[];win.confirm=()=>true;
win.URL.createObjectURL=blob=>{downloads.push(blob);return 'blob:test';};win.URL.revokeObjectURL=()=>{};win.HTMLAnchorElement.prototype.click=function(){};
const assert=(ok,name)=>{results.push(`${ok?'PASS':'FAIL'} ${name}`);if(!ok)throw Error(name);};
const input=(sel,value)=>{const e=$(sel);e.value=value;e.dispatchEvent(new win.Event('input',{bubbles:true}));e.dispatchEvent(new win.Event('change',{bubbles:true}));};
// Poll observable progress rather than assuming a fixed animation-frame cadence.
const waitFor=async predicate=>{const end=Date.now()+5000;while(!predicate()&&Date.now()<end)await new Promise(r=>setTimeout(r,50));};
try{
 assert($('#viewport').querySelectorAll('[data-joint]').length===10,'10 visible rotation handles');
 assert($('#keyTrack').querySelectorAll('button').length===6,'starter has six full-pose keys');
 input('#scrubber','8');$('#joint').value='head';$('#joint').dispatchEvent(new win.Event('change'));input('#angle','30');
 assert($('#jointNumber').textContent==='30','channel slider updates pose');$('#setKey').click();
 assert($('#keyTrack').querySelectorAll('button').length===7,'set key adds a timeline key');$('#setKey').click();
 assert($('#keyTrack').querySelectorAll('button').length===7,'repeated key action replaces rather than duplicates');
 $('#easing').value='hold';$('#easing').dispatchEvent(new win.Event('change'));assert($('#easing').value==='hold','interpolation changes');
 $('#deleteKey').click();assert($('#keyTrack').querySelectorAll('button').length===6,'remove key');$('#undo').click();assert($('#keyTrack').querySelectorAll('button').length===7,'undo restores key');$('#redo').click();assert($('#keyTrack').querySelectorAll('button').length===6,'redo removes again');
 $('#save').click();const saved=JSON.parse(await downloads.at(-1).text());assert(saved.format==='kata-kinframe','project export format');
 $('#export').click();const svg=await downloads.at(-1).text();assert(svg.includes('<svg')&&!svg.includes('data-joint'),'clean SVG export excludes controls');
 $('#onion').click();assert($('#viewport').querySelectorAll('[opacity=".12"]').length===2,'ghost poses render');
 $('#controls').click();assert($('#viewport').querySelectorAll('[data-joint]').length===0,'rig handles toggle');$('#controls').click();
 $('#play').click();await waitFor(()=>Number($('#scrubber').value)>8);$('#play').click();assert(Number($('#scrubber').value)>8,'playback advances timeline');
 $('[data-preset="walk"]').click();assert($('#projectName').value==='Little steps','preset changes scene');
 const dt=new win.DataTransfer();dt.items.add(new win.File([JSON.stringify(saved)],'test.kinframe',{type:'application/json'}));$('#file').files=dt.files;$('#file').dispatchEvent(new win.Event('change'));await new Promise(r=>setTimeout(r,100));assert($('#projectName').value===saved.name,'project import round trip');
 const bad=new win.DataTransfer();bad.items.add(new win.File(['{}'],'bad.kinframe',{type:'application/json'}));$('#file').files=bad.files;$('#file').dispatchEvent(new win.Event('change'));await new Promise(r=>setTimeout(r,100));assert($('#status').textContent.startsWith('Could not open'),'malformed import rejected');assert($('#projectName').value===saved.name,'failed import preserves scene');
 $('#help').click();assert($('#helpDialog').open,'help opens');$('#closeHelp').click();assert(!$('#helpDialog').open,'help closes');
 assert(JSON.parse(win.localStorage.getItem('kata-kinframe-v1')).name===saved.name,'autosave stores validated project');
 frame.style.width='390px';await new Promise(r=>setTimeout(r,80));assert(doc.documentElement.scrollWidth<=390,'390px layout has no horizontal overflow');
}catch(e){results.push('ERROR '+e.message);}finally{$('#save').click();win.localStorage.removeItem('kata-kinframe-v1');document.querySelector('#results').textContent=results.join('\n')+'\n\n'+results.filter(r=>r.startsWith('PASS')).length+' passed; '+results.filter(r=>r.startsWith('FAIL')).length+' failed';document.body.dataset.result=results.some(r=>/^(FAIL|ERROR)/.test(r))?'failed':'passed';win.onbeforeunload=null;}
