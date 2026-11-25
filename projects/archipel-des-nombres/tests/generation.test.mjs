import test from 'node:test';
import assert from 'node:assert/strict';
import {startRound,answer,advance,outcome,spots,rng,accessible} from '../engine.ts';
import {add,parse,remove,record} from '../storage.js';

const solve=task=>task.mode==='order'?[...task.order].sort((a,b)=>a-b):task.n;
test('Les deux chapitres sont solubles pour 500 graines',()=>{
  let checked=0;
  for(let seed=0;seed<500;seed++)for(let chapter=0;chapter<2;chapter++)for(let island=0;island<6;island++){
    const r=startRound(chapter,island,rng(seed));
    for(const q of r.tasks){
      assert.ok(q.choices.includes(q.n));
      assert.equal(new Set(q.choices).size,q.choices.length);
      const coordinates=spots(q.n,q.layout,q.seed);
      assert.equal(coordinates.length,q.n);
      assert.ok(coordinates.every(([x,y])=>x>0&&x<1&&y>0&&y<1));
      assert.ok(answer(r,solve(q)));
      advance(r);
      checked++;
    }
    assert.ok(outcome(r).mastery);
  }
  assert.equal(checked,38000);
});

test('Cliquer au hasard puis corriger ne crédite pas le premier essai',()=>{
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
test('La suppression et la reprise isolent les profils',()=>{
  const s=parse(null);add(s,'Lou',0);const a=s.active;add(s,'Noa',2);const b=s.active;
  record(s.players[0],0,0,{first:5,mastery:true,errors:1});
  const restored=parse(JSON.stringify(s));
  assert.equal(restored.active,b);
  assert.ok(accessible(restored.players[0].records[0],1));
  assert.ok(!accessible(restored.players[1].records[0],1));
  remove(restored,b);assert.equal(restored.active,a);
  assert.equal(restored.players.length,1);
});
