export const CHANNELS = [
 {id:'rootX',name:'Root · horizontal',min:-180,max:180,unit:'px'}, {id:'rootY',name:'Root · lift',min:-100,max:100,unit:'px'},
 {id:'body',name:'Spine',min:-65,max:65,unit:'°'}, {id:'head',name:'Head',min:-65,max:65,unit:'°'},
 {id:'armL',name:'Left shoulder',min:-180,max:180,unit:'°'}, {id:'foreL',name:'Left elbow',min:-160,max:160,unit:'°'},
 {id:'armR',name:'Right shoulder',min:-180,max:180,unit:'°'}, {id:'foreR',name:'Right elbow',min:-160,max:160,unit:'°'},
 {id:'legL',name:'Left hip',min:-100,max:100,unit:'°'}, {id:'shinL',name:'Left knee',min:-130,max:130,unit:'°'},
 {id:'legR',name:'Right hip',min:-100,max:100,unit:'°'}, {id:'shinR',name:'Right knee',min:-130,max:130,unit:'°'}
];
export const NEUTRAL = {rootX:0,rootY:0,body:0,head:0,armL:-20,foreL:15,armR:20,foreR:-15,legL:-8,shinL:0,legR:8,shinR:0};
export const copy = x => JSON.parse(JSON.stringify(x));
export function pose(overrides={}) {return {...NEUTRAL,...overrides};}
export function sample(keys,time) {
 if(!keys.length) return pose();
 if(time<=keys[0].frame) return copy(keys[0].pose);
 if(time>=keys.at(-1).frame) return copy(keys.at(-1).pose);
 const b=keys.findIndex(k=>k.frame>time), a=keys[b-1], z=keys[b];
 let t=(time-a.frame)/(z.frame-a.frame);
 if(a.easing==='smooth')t=t*t*(3-2*t); else if(a.easing==='hold')t=0;
 return Object.fromEntries(CHANNELS.map(c=>[c.id,a.pose[c.id]+(z.pose[c.id]-a.pose[c.id])*t]));
}
export function setKey(project,frame,p,easing='smooth') {
 const k={frame:Math.round(Math.max(0,Math.min(project.duration,frame))),pose:copy(p),easing};
 return {...project,keys:[...project.keys.filter(x=>x.frame!==k.frame),k].sort((a,b)=>a.frame-b.frame)};
}
export function mirror(p) {
 return {...p,rootX:-p.rootX,body:-p.body,head:-p.head,armL:-p.armR,armR:-p.armL,foreL:-p.foreR,foreR:-p.foreL,legL:-p.legR,legR:-p.legL,shinL:-p.shinR,shinR:-p.shinL};
}
export function preset(name='wave') {
 const project={format:'kata-kinframe',version:1,name:name==='walk'?'Little steps':name==='bounce'?'A little lift':'Hello, world',duration:96,fps:24,keys:[]};
 let frames=[];
 if(name==='walk') frames=[ [0,{armL:38,armR:-38,legL:-28,legR:28,shinL:24,shinR:4}], [24,{rootY:-7,armL:-38,armR:38,legL:28,legR:-28,shinL:-4,shinR:-24}], [48,{armL:38,armR:-38,legL:-28,legR:28,shinL:24,shinR:4}], [72,{rootY:-7,armL:-38,armR:38,legL:28,legR:-28,shinL:-4,shinR:-24}], [96,{armL:38,armR:-38,legL:-28,legR:28,shinL:24,shinR:4}]];
 else if(name==='bounce') frames=[[0,{}],[18,{rootY:32,legL:-30,legR:30,shinL:45,shinR:-45,armL:-35,armR:35}],[36,{rootY:-85,armL:-145,armR:145,legL:-15,legR:15}],[58,{rootY:26,legL:-20,legR:20,shinL:30,shinR:-30}],[76,{}],[96,{}]];
 else frames=[[0,{armR:145,foreR:25,body:-6,head:7}],[16,{armR:140,foreR:-20,body:-4,head:9}],[32,{armR:145,foreR:30,body:-6,head:7}],[48,{armR:140,foreR:-25,body:-4,head:9}],[64,{armR:145,foreR:25,body:-6,head:7}],[96,{armR:145,foreR:25,body:-6,head:7}]];
 project.keys=frames.map(([frame,p])=>({frame,pose:pose(p),easing:'smooth'})); return project;
}
export function validate(input) {
 if(!input||input.format!=='kata-kinframe'||input.version!==1)throw Error('Choose a Kinframe version 1 project.');
 if(typeof input.name!=='string'||input.name.length>100)throw Error('Invalid project name.');
 if(!Number.isInteger(input.duration)||input.duration<24||input.duration>240||![12,24,30,60].includes(input.fps))throw Error('Invalid timeline settings.');
 if(!Array.isArray(input.keys)||input.keys.length<1||input.keys.length>241)throw Error('Project needs 1–241 keys.');
 let previous=-1;
 const keys=input.keys.map(k=>{
  if(!Number.isInteger(k.frame)||k.frame<0||k.frame>input.duration||k.frame<=previous||!['smooth','linear','hold'].includes(k.easing))throw Error('Invalid or unordered keyframe.');
  previous=k.frame; const p={};
  for(const c of CHANNELS){const n=k.pose?.[c.id];if(!Number.isFinite(n)||n<c.min||n>c.max)throw Error(`Invalid ${c.name} value.`);p[c.id]=n;}
  return {frame:k.frame,easing:k.easing,pose:p};
 }); return {format:input.format,version:1,name:input.name,duration:input.duration,fps:input.fps,keys};
}
export function rig(p) {
 const rad=n=>n*Math.PI/180;
 const add=(a,len,angle)=>({x:a.x+Math.sin(rad(angle))*len,y:a.y+Math.cos(rad(angle))*len});
 const root={x:450+p.rootX,y:313+p.rootY};
 const chest=add(root,-87,p.body), neck=add(chest,-19,p.body), head=add(neck,-31,p.body+p.head);
 const shoulderL={x:chest.x-36*Math.cos(rad(p.body)),y:chest.y+36*Math.sin(rad(p.body))};
 const shoulderR={x:chest.x+36*Math.cos(rad(p.body)),y:chest.y-36*Math.sin(rad(p.body))};
 const elbowL=add(shoulderL,62,p.body+p.armL),handL=add(elbowL,57,p.body+p.armL+p.foreL);
 const elbowR=add(shoulderR,62,p.body+p.armR),handR=add(elbowR,57,p.body+p.armR+p.foreR);
 const hipL={x:root.x-20,y:root.y},hipR={x:root.x+20,y:root.y};
 const kneeL=add(hipL,73,p.legL),footL=add(kneeL,70,p.legL+p.shinL);
 const kneeR=add(hipR,73,p.legR),footR=add(kneeR,70,p.legR+p.shinR);
 return {root,chest,neck,head,shoulderL,shoulderR,elbowL,elbowR,handL,handR,hipL,hipR,kneeL,kneeR,footL,footR};
}
