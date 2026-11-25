import test from 'node:test';
import assert from 'node:assert/strict';
import {startRound,exampleTask,matches,answer,advance,outcome,spots,rng,accessible,islands,coreCount,finalIsland,roundSize} from '../engine.ts';
import {add,parse,remove,record} from '../storage.js';

const solve=task=>task.mode==='order'?[...task.order].sort((a,b)=>a-b):task.n;

test('Chaque atelier est soluble et travaille une seule compétence',()=>{
  let checked=0;
  for(let seed=0;seed<500;seed++)for(let chapter=0;chapter<2;chapter++)for(let i=0;i<islands.length;i++){
    const random=rng(seed);
    const r=startRound(chapter,i,random), example=exampleTask(chapter,i);
    const mode=islands[i].mode;
    assert.equal(example.mode,mode);
    assert.ok(matches(example,solve(example)));
    assert.equal(r.tasks.length,roundSize(chapter,i));
    assert.equal(new Set(r.tasks.map(task=>task.n)).size,r.planned);
    for(const q of r.tasks){
      assert.equal(q.mode,mode);
      assert.ok(q.choices.includes(q.n));
      assert.equal(new Set(q.choices).size,q.choices.length);
      const coords=spots(q.n,q.layout,q.seed);
      assert.equal(coords.length,q.n);
      assert.ok(coords.every(([x,y])=>x>0&&x<1&&y>0&&y<1));
      if(i<coreCount) assert.notEqual(q.mode,'order');
      if(q.mode==='pair'||q.mode==='ferry') assert.ok(q.n>0);
      if(q.mode==='change') assert.equal(Math.abs(q.n-q.start),1);
      assert.ok(answer(r,solve(q)));
      advance(r);
      checked++;
    }
    assert.ok(outcome(r).mastery);
  }
  assert.equal(checked,48500);
});

test('Une correction ne remplace pas une réussite du premier coup',()=>{
  const random=rng(43),r=startRound(0,0,random);
  for(let i=0;i<r.planned;i++){
    const q=r.tasks[i];
    assert.equal(answer(r,q.choices.find(n=>n!==q.n),random),false);
    assert.equal(answer(r,q.n,random),null);
    advance(r);
  }
  assert.equal(r.tasks.length,r.planned*2);
  for(let i=r.planned;i<r.tasks.length;i++){
    const task=r.tasks[i],original=r.tasks[i-r.planned];
    assert.equal(task.n,original.n);
    assert.notEqual(task.layout,original.layout);
    assert.notEqual(task.token,original.token);
    assert.notEqual(task.choices.indexOf(task.n),original.choices.indexOf(original.n));
    assert.ok(answer(r,solve(task),random));
    advance(r);
  }
  assert.deepEqual(outcome(r),{mastery:false,first:0,total:6,errors:6});
});

test('Les anciens profils, réglages et îles validées sont conservés',()=>{
  const s=parse(null);add(s,'Lou',0);const a=s.active;add(s,'Noa',2);const b=s.active;
  record(s.players[0],0,0,{first:5,mastery:true});
  s.players[0].settings.sound=false;
  s.version=1;
  s.players.forEach(p=>p.records=p.records.map(r=>r.slice(0,coreCount)));
  const restored=parse(JSON.stringify(s));
  assert.equal(restored.version,2);
  assert.equal(restored.active,b);
  assert.equal(restored.players[0].settings.sound,false);
  assert.ok(accessible(restored.players[0].records[0],1));
  assert.ok(!accessible(restored.players[1].records[0],1));
  assert.ok(!accessible(restored.players[0].records[0],finalIsland+1));
  restored.players[0].records[0].slice(0,coreCount).forEach(r=>r.mastery=true);
  assert.ok(accessible(restored.players[0].records[0],finalIsland+1));
  assert.ok(!restored.players[0].records[0][finalIsland+1].mastery);
  remove(restored,b);assert.equal(restored.active,a);
  assert.equal(restored.players.length,1);
});
