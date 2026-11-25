import test from 'node:test';
import assert from 'node:assert/strict';
import {startRound,exampleTask,matches,answer,advance,outcome,spots,rng,accessible,islands,coreCount,finalIsland,roundSize,legacyCount,practiceIslands,groupOpen,groupComplete,finalPractice} from '../engine.ts';
import {add,parse,remove,record} from '../storage.js';

const solve=task=>task.mode==='order'?[...task.order].sort((a,b)=>a-b):task.n;

test('Les 36 activités apparaissent chacune sur une des six îles',()=>{
  assert.deepEqual(practiceIslands.map(group=>group.activities.length),[6,6,6,6,6,6]);
  assert.deepEqual(practiceIslands.flatMap(group=>group.activities).sort((a,b)=>a-b),islands.map((_,i)=>i));
});

test('Les séries générées respectent leur objectif et restent solubles',()=>{
  for(let seed=0;seed<500;seed++)for(let chapter=0;chapter<2;chapter++)for(let i=0;i<(chapter?legacyCount:islands.length);i++){
    const random=rng(seed), r=startRound(chapter,i,random), activity=islands[i];
    if(!activity.review){
      const example=exampleTask(chapter,i);
      assert.equal(example.mode,activity.mode);
      assert.ok(matches(example,solve(example)));
    }
    assert.equal(r.tasks.length,roundSize(chapter,i));
    if(activity.mode==='cards'){
      assert.deepEqual(r.tasks.map(q=>q.choices.length),[4,3,2,1,4,3,2,1]);
      for(const start of [0,4]) for(let j=start+1;j<start+4;j++){
        assert.deepEqual(r.tasks[j].choices,r.tasks[j-1].choices.filter(n=>n!==r.tasks[j-1].n));
        assert.equal(r.tasks[j].seed,r.tasks[start].seed);
      }
    }
    for(const q of r.tasks){
      assert.equal(q.mode,islands[q.activity].mode);
      assert.ok(activity.review?activity.review.includes(q.activity):q.activity===i);
      assert.ok(q.choices.includes(q.n));
      assert.equal(new Set(q.choices).size,q.choices.length);
      if(q.fixed){assert.equal(q.layout,q.fixed);assert.equal(q.flash,false);}
      const coords=spots(q.n,q.layout,q.seed);
      assert.equal(coords.length,q.n);
      assert.ok(coords.every(([x,y])=>x>0&&x<1&&y>0&&y<1));
      if(q.mode==='pair'||q.mode==='ferry') assert.ok(q.n>0);
      if(q.mode==='change') assert.equal(Math.abs(q.n-q.start),1);
      if(q.mode==='five') assert.equal(q.n+q.start,5);
      if(q.mode==='hidden'){assert.equal(q.n+q.start,q.total);assert.ok(q.total<=5);}
      if(q.comparison){
        const {left,right,ask}=q.comparison;
        const expected=left===right?1:ask==='equal'?0:((left>right)===(ask==='more')?0:2);
        assert.equal(q.n,expected);
      }
      assert.ok(answer(r,solve(q)));
      advance(r);
    }
    assert.ok(outcome(r).mastery);
  }
});

test('Une île demande de valider ses six activités et ouvre la suivante',()=>{
  const records=islands.map(()=>({mastery:false}));
  for(const [index,group] of practiceIslands.entries()){
    assert.ok(groupOpen(records,index));
    if(index+1<practiceIslands.length)assert.equal(groupOpen(records,index+1),false);
    for(const [position,id] of group.activities.entries()){
      assert.ok(accessible(records,id));
      const next=group.activities[position+1];
      if(next!==undefined)assert.equal(accessible(records,next),false);
      records[id].mastery=true;
    }
    assert.ok(groupComplete(records,index));
  }
  assert.ok(records[finalPractice].mastery);
});

test('Une correction ne remplace pas une réussite du premier coup',()=>{
  const random=rng(43),r=startRound(1,0,random);
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
  assert.deepEqual(outcome(r),{mastery:false,first:0,total:5,errors:5});
});

test('Le lagon fait compter en autonomie avec un défi à six réponses',()=>{
  assert.equal(exampleTask(0,9).independent,false);
  assert.equal(exampleTask(1,0).independent,false);
  for(const id of [0,15,16,17])assert.equal(exampleTask(0,id).independent,true);
  const r=startRound(0,0,rng(13));
  assert.equal(new Set(r.tasks.map(q=>q.layout)).size,6);
  assert.deepEqual(r.tasks.map(q=>q.n).sort(),[0,1,2,3,4,5]);
  assert.ok(r.tasks.every(q=>q.choices.join() === '0,1,2,3,4,5'));
});

test('Les anciens profils, réglages et îles validées sont conservés',()=>{
  const s=parse(null);add(s,'Lou',0);const a=s.active;add(s,'Noa',2);const b=s.active;
  record(s.players[0],0,0,{first:5,mastery:true});
  s.players[0].settings.sound=false;
  s.version=1;
  s.players.forEach(p=>p.records=p.records.map(r=>r.slice(0,coreCount)));
  const restored=parse(JSON.stringify(s));
  assert.equal(restored.version,3);
  assert.equal(restored.active,b);
  assert.equal(restored.players[0].settings.sound,false);
  assert.ok(accessible(restored.players[0].records[0],0));
  assert.ok(!accessible(restored.players[1].records[0],0));
  assert.ok(!accessible(restored.players[0].records[0],finalPractice));
  assert.equal(restored.players[0].records[0].length,36);
  assert.equal(restored.players[0].records[1].length,legacyCount);
  assert.equal(restored.players[0].legacyChapterOpen,false);
  s.players[0].records[0][finalIsland].mastery=true;
  const oldNavigator=parse(JSON.stringify(s)).players[0];
  assert.equal(oldNavigator.legacyChapterOpen,true);
  remove(restored,b);assert.equal(restored.active,a);
  assert.equal(restored.players.length,1);
});
