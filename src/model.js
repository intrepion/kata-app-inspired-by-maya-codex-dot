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
// Presets are baked FK keys, not a hidden playback solver. The editor, export,
// project files, and preview all sample exactly the same twelve channels.
const degrees = radians => radians * 180 / Math.PI;
const TAU = Math.PI * 2;
export const WALK_CYCLE = 24;
export const FLOOR_Y = 456;
function walkPose(frame) {
 const phase = (frame % WALK_CYCLE) / WALK_CYCLE;
 const rootY = 6 + 3 * Math.sin(phase * TAU * 2);
 const leg = offset => {
  const t = (phase + offset) % 1;
  // 62.5% stance: even backward travel for a treadmill walk, followed by
  // a shorter swing. Both feet stay down briefly during weight transfer.
  const stance = 0.625;
  let x, lift = 0;
  if (t <= stance) x = 38 - 76 * t / stance;
  else {
   const u = (t - stance) / (1 - stance);
   const ease = u * u * (3 - 2 * u);
   // Match the stance velocity at lift-off and landing instead of stopping
   // the foot at every breakdown. The small overshoot is the push-off arc.
   x = -38 + 76 * ease - 45.6 * (2 * u ** 3 - 3 * u ** 2 + u);
   lift = 23 * Math.sin(Math.PI * u) ** 2;
  }
  const y = FLOOR_Y - lift - (313 + rootY);
  const distance = Math.hypot(x, y);
  const bend = Math.acos(Math.max(-1, Math.min(1, (distance ** 2 - 73 ** 2 - 70 ** 2) / (2 * 73 * 70))));
  // Both knees bend in the same anatomical direction in profile.
  const hip = Math.atan2(x, y) + Math.atan2(70 * Math.sin(bend), 73 + 70 * Math.cos(bend));
  return [degrees(hip), -degrees(bend)];
 };
 const [legL, shinL] = leg(0), [legR, shinR] = leg(0.5);
 const swing = 20 * Math.cos(phase * TAU - 0.15);
 return pose({rootY, body:-3 + Math.sin(phase * TAU * 2) * 0.6,
  head:2.5 - Math.sin(phase * TAU * 2 - 0.3) * 0.5,
  armL:-swing, armR:swing,
  foreL:15 + 6 * Math.sin(phase * TAU - 0.5),
  foreR:15 - 6 * Math.sin(phase * TAU - 0.5),
  legL, shinL, legR, shinR});
}
export function preset(name='wave') {
 const project={format:'kata-kinframe',version:1,name:name==='walk'?'Little steps':name==='bounce'?'A little lift':'Hello, world',duration:96,fps:24,view:name==='walk'?'right':'front',keys:[]};
 if(name==='walk') {
  // Dense linear FK breakdowns preserve contact between keys; easing every
  // joint to a stop at each pose made the previous walk float and stutter.
  project.keys=Array.from({length:97},(_,frame)=>({frame,pose:walkPose(frame),easing:'linear'}));
  return project;
 }
 let frames=[];
 if(name==='bounce') frames=[[0,{}],[18,{rootY:32,legL:-30,legR:30,shinL:45,shinR:-45,armL:-35,armR:35}],[36,{rootY:-85,armL:-145,armR:145,legL:-15,legR:15}],[58,{rootY:26,legL:-20,legR:20,shinL:30,shinR:-30}],[76,{}],[96,{}]];
 else {
  // A greeting has an intent: settle, anticipate, raise, wave, and return.
  // The upper arm leads; the elbow stays flexed throughout the actual wave.
  const rest={armR:12,foreR:8,armL:-14,foreL:10};
  frames=[
   [0,rest], [6,{...rest,armR:8,foreR:14,body:1,head:-1}],
   [16,{...rest,armR:50,foreR:51,body:-2,head:2}],
   [24,{...rest,armR:70,foreR:102,body:-3,head:4}],
   [31,{...rest,armR:69,foreR:120,body:-3,head:4}],
   [39,{...rest,armR:71,foreR:80,body:-3,head:3}],
   [47,{...rest,armR:69,foreR:118,body:-3,head:4}],
   [55,{...rest,armR:71,foreR:83,body:-3,head:3}],
   [63,{...rest,armR:70,foreR:105,body:-2.5,head:3}],
   [72,{...rest,armR:49,foreR:88,body:-1.5,head:2}],
   [84,{...rest,armR:10,foreR:19,body:0.5,head:1}],
   [90,rest], [96,rest]
  ];
 }
 project.keys=frames.map(([frame,p])=>({frame,pose:pose(p),easing:'smooth'})); return project;
}
// Duration is the duplicate closing pose, not an extra frame of hold.
export function advanceFrame(frame, elapsedSeconds, fps, duration) {
 return (frame + Math.max(0, elapsedSeconds) * fps) % duration;
}
export function validate(input) {
 if(!input||input.format!=='kata-kinframe'||input.version!==1)throw Error('Choose a Kinframe version 1 project.');
 if(typeof input.name!=='string'||input.name.length>100)throw Error('Invalid project name.');
 if(!Number.isInteger(input.duration)||input.duration<24||input.duration>240||![12,24,30,60].includes(input.fps))throw Error('Invalid timeline settings.');
 if(!Array.isArray(input.keys)||input.keys.length<1||input.keys.length>241)throw Error('Project needs 1–241 keys.');
 if(input.view!==undefined&&!['front','right','left'].includes(input.view))throw Error('Invalid stage view.');
 let previous=-1;
 const keys=input.keys.map(k=>{
  if(!Number.isInteger(k.frame)||k.frame<0||k.frame>input.duration||k.frame<=previous||!['smooth','linear','hold'].includes(k.easing))throw Error('Invalid or unordered keyframe.');
  previous=k.frame; const p={};
  for(const c of CHANNELS){const n=k.pose?.[c.id];if(!Number.isFinite(n)||n<c.min||n>c.max)throw Error(`Invalid ${c.name} value.`);p[c.id]=n;}
  return {frame:k.frame,easing:k.easing,pose:p};
 }); return {format:input.format,version:1,name:input.name,duration:input.duration,fps:input.fps,view:input.view||'front',keys};
}
export function rig(p,view='front') {
 const rad=n=>n*Math.PI/180;
 const add=(a,len,angle)=>({x:a.x+Math.sin(rad(angle))*len,y:a.y+Math.cos(rad(angle))*len});
 const root={x:450+p.rootX,y:313+p.rootY};
 const chest=add(root,-87,p.body), neck=add(chest,-19,p.body), head=add(neck,-31,p.body+p.head);
 const shoulderWidth=view==='front'?36:8;
 const shoulderL={x:chest.x-shoulderWidth*Math.cos(rad(p.body)),y:chest.y+shoulderWidth*Math.sin(rad(p.body))};
 const shoulderR={x:chest.x+shoulderWidth*Math.cos(rad(p.body)),y:chest.y-shoulderWidth*Math.sin(rad(p.body))};
 const elbowL=add(shoulderL,62,p.body+p.armL),handL=add(elbowL,57,p.body+p.armL+p.foreL);
 const elbowR=add(shoulderR,62,p.body+p.armR),handR=add(elbowR,57,p.body+p.armR+p.foreR);
 const hipWidth=view==='front'?20:6;
 const hipL={x:root.x-hipWidth,y:root.y},hipR={x:root.x+hipWidth,y:root.y};
 const kneeL=add(hipL,73,p.legL),footL=add(kneeL,70,p.legL+p.shinL);
 const kneeR=add(hipR,73,p.legR),footR=add(kneeR,70,p.legR+p.shinR);
 return {root,chest,neck,head,shoulderL,shoulderR,elbowL,elbowR,handL,handR,hipL,hipR,kneeL,kneeR,footL,footR};
}
