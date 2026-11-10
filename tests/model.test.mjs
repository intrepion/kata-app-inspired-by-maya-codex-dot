import test from 'node:test';import assert from 'node:assert/strict';import {CHANNELS,NEUTRAL,sample,setKey,mirror,preset,validate,rig,advanceFrame,FLOOR_Y,WALK_CYCLE} from '../src/model.js';
test('all presets validate and loop',()=>{for(const name of ['wave','walk','bounce']){const p=preset(name);assert.deepEqual(validate(p),p);assert.deepEqual(sample(p.keys,0),sample(p.keys,96));}});
test('linear interpolation midpoint',()=>{const p=preset();p.keys=[{frame:0,pose:{...NEUTRAL,rootX:0},easing:'linear'},{frame:24,pose:{...NEUTRAL,rootX:100},easing:'linear'}];assert.equal(sample(p.keys,12).rootX,50);assert.equal(sample(p.keys,-10).rootX,0);assert.equal(sample(p.keys,100).rootX,100);});
test('hold easing retains source pose',()=>{const p=preset();p.keys[0].easing='hold';assert.deepEqual(sample(p.keys,p.keys[1].frame/2),p.keys[0].pose);});
test('smooth interpolation differs from linear away from center',()=>{const p=preset();p.keys=[{frame:0,pose:{...NEUTRAL,rootX:0},easing:'smooth'},{frame:24,pose:{...NEUTRAL,rootX:100},easing:'smooth'}];assert.equal(sample(p.keys,6).rootX,15.625);});
test('setKey replaces a frame without duplication, sorts, and clones',()=>{const p=preset(),pose={...NEUTRAL};const a=setKey(p,8,pose);pose.body=30;assert.equal(a.keys.find(k=>k.frame===8).pose.body,0);assert.equal(setKey(a,8,NEUTRAL).keys.length,a.keys.length);assert.ok(a.keys.every((k,i)=>!i||k.frame>a.keys[i-1].frame));});
test('mirror is an involution',()=>{assert.deepEqual(mirror(mirror(preset().keys[0].pose)),preset().keys[0].pose);});
test('forward kinematics preserves bone lengths',()=>{for(const k of preset('bounce').keys){const r=rig(k.pose);assert.ok(Math.abs(Math.hypot(r.handR.x-r.elbowR.x,r.handR.y-r.elbowR.y)-57)<1e-8);}});
test('rejects bad format, unordered frames and non-finite values',()=>{assert.throws(()=>validate({}));const p=preset();p.keys[1].frame=0;assert.throws(()=>validate(p));const q=preset();q.keys[0].pose.armR=NaN;assert.throws(()=>validate(q));});
test('validation bounds all channels',()=>{for(const c of CHANNELS){const p=preset();p.keys[0].pose[c.id]=c.max+1;assert.throws(()=>validate(p));}});
test('validation drops unknown fields and forbids empty keys',()=>{const p=preset();p.bad='x';assert.equal(validate(p).bad,undefined);p.keys=[];assert.throws(()=>validate(p));});


test('walk stays grounded throughout keys and fractional in-betweens',()=>{
 const p=preset('walk');
 for(let f=0;f<p.duration;f+=0.125){
  const value=sample(p.keys,f),r=rig(value,p.view);
  assert.ok(value.shinL<0&&value.shinR<0,'both knees bend forward consistently');
  assert.ok(r.footL.y<=FLOOR_Y+0.3&&r.footR.y<=FLOOR_Y+0.3,'no visible floor penetration');
  assert.ok(Math.max(r.footL.y,r.footR.y)>=FLOOR_Y-0.3,'at least one support foot');
  for(const side of ['L','R']){
   const phase=(f/WALK_CYCLE+(side==='R'?0.5:0))%1;
   if(phase<=0.625)assert.ok(Math.abs(r['foot'+side].y-FLOOR_Y)<0.3,'stance foot remains on floor');
  }
 }
});
test('walk has a planted stance, a clearing swing, opposing arms, and exact repeat',()=>{
 const p=preset('walk');
 const start=sample(p.keys,0),down=sample(p.keys,3),up=sample(p.keys,9);
 assert.ok(down.rootY>start.rootY&&up.rootY<start.rootY);
 assert.ok(start.armL<0&&start.armR>0);
 for(const f of [0,3,6,9,12,15,18,21])assert.deepEqual(sample(p.keys,f),sample(p.keys,f+24));
 assert.ok(rig(sample(p.keys,6),p.view).footR.y<FLOOR_Y-15);
 const positions=[0,3,6,9,12,15].map(f=>rig(sample(p.keys,f),p.view).footL.x);
 for(let i=1;i<positions.length;i++)assert.ok(Math.abs(positions[i]-positions[i-1]+15.2)<1e-8,'even stance speed');
});
test('wave raises and lowers with a bent elbow and grounded feet',()=>{
 const p=preset('wave'),rest=rig(p.keys[0].pose,p.view);
 for(let f=24;f<=63;f+=0.25){
  const value=sample(p.keys,f),r=rig(value,p.view);
  assert.ok(value.foreR>=80&&value.foreR<=120,'no elbow reversal during waving');
  assert.ok(value.armR>=69&&value.armR<=71,'quiet shoulder during hand arcs');
  assert.ok(r.handR.y<r.elbowR.y-40,'forearm stays raised');
  assert.deepEqual(r.footL,rest.footL);assert.deepEqual(r.footR,rest.footR);
 }
 assert.ok(sample(p.keys,16).armR>sample(p.keys,6).armR);
 assert.deepEqual(sample(p.keys,90),sample(p.keys,96));
});
test('walk and wave stay inside the stage at every sampled time',()=>{
 for(const name of ['walk','wave']){const p=preset(name);for(let f=0;f<=96;f+=.25){
  const value=sample(p.keys,f);for(const c of CHANNELS)assert.ok(value[c.id]>=c.min&&value[c.id]<=c.max);
  for(const joint of Object.values(rig(value,p.view)))assert.ok(joint.x>50&&joint.x<850&&joint.y>40&&joint.y<480);
 }}
});
test('version 1 files without view remain front-facing and editable',()=>{
 const p=preset('wave');delete p.view;assert.equal(validate(p).view,'front');
 const walk=preset('walk');assert.deepEqual(validate(JSON.parse(JSON.stringify(walk))),walk);
 walk.view='invalid';assert.throws(()=>validate(walk));
});
test('loop duration never inserts an extra closing-frame pause',()=>{
 for(const fps of [12,24,30,60]){assert.equal(advanceFrame(0,96/fps,fps,96),0);assert.equal(advanceFrame(95,1/fps,fps,96),0);}
 assert.equal(advanceFrame(96,0.5/24,24,96),0.5);
 assert.equal(advanceFrame(6,-1,24,96),6);
});
