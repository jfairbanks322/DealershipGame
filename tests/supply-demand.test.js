'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const supply=require('../lib/lessons/supply-demand-v1'),{initializeLesson}=require('../lib/lessons'),{createApp}=require('../server');
test('supply-demand responds to price, stocking and market shifts',()=>{
 const g=initializeLesson({round:1},supply.id),p={menu:[{id:'1',price:450,stock:200}]};
 const normal=supply.simulateItem(g,p,p.menu[0],[p]);const cheap=supply.simulateItem(g,p,{...p.menu[0],price:300},[p]);assert.ok(cheap.demand>normal.demand);
 const scarce=supply.simulateItem(g,p,{...p.menu[0],stock:1},[p]);assert.equal(scarce.units,1);assert.ok(scarce.missed>0);assert.equal(normal.cost,200*240);assert.equal(normal.leftover,200-normal.units);
 g.round=3;assert.ok(supply.simulateItem(g,p,p.menu[0],[p]).unitCost>240);g.round=2;assert.ok(supply.simulateItem(g,p,p.menu[0],[p]).demand>normal.demand);
 assert.throws(()=>supply.checkPricing(g.rules.catalog[0],{price:'0',stock:10}));assert.throws(()=>supply.checkPricing(g.rules.catalog[0],{price:4.5,stock:1.2}));
});
test('separate supply-demand game runs ten rounds without math and keeps math scores separate',async()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'supply-test-')),app=createApp({dbPath:path.join(dir,'db'),teacherKey:'test-key'}),cookies={};await new Promise(r=>app.server.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${app.server.address().port}/api`;
 async function req(w,u,b,status=200){const r=await fetch(base+u,{method:b?'POST':'GET',headers:{'Content-Type':'application/json',cookie:cookies[w]||''},body:b?JSON.stringify(b):undefined});if(r.headers.get('set-cookie'))cookies[w]=r.headers.get('set-cookie').split(';')[0];const d=await r.json();assert.equal(r.status,status,JSON.stringify(d));return d;}
 try{for(const w of ['teacher','student'])await req(w,'/register',{name:w,username:w,password:'test-password'});
 let g=await req('teacher','/games',{name:'Market game',teacherKey:'test-key',lessonId:supply.id,penalty:20}),url='/games/'+g.code;assert.equal(g.penalty,0);assert.equal(g.lesson.id,supply.id);
 await req('student',url+'/join',{restaurant:'Fry Society'});g=await req('teacher',url);g=await req('teacher',url+'/start',{version:g.version});
 for(let round=1;round<=10;round++){const i=g.catalog[round-1];g=await req('student',url+'/check',{id:i.id,price:i.expected/100,stock:35});assert.equal(g.check.correct,true);assert.deepEqual(g.player.wrongRounds,[]);assert.ok(!g.player.badges.includes(6));if(round===1){await req('student',url+'/check',{id:'2',price:4.9,stock:35},400);await req('student',url+'/promotion',{id:'bogo',target:'1'},400);}await req('student',url+'/ready',{},400);await req('student',url+'/strategy',{clue:'demand',demand:'hold',price:'hold',stock:'hold'});await req('student',url+'/ready',{});g=await req('teacher',url);g=await req('teacher',url+'/run',{version:g.version});if(round<10)g=await req('teacher',url+'/next',{version:g.version});}
 const p=(await req('student',url)).player;assert.equal(p.reports.length,10);assert.equal(p.marketStrategies.length,10);assert.ok(p.reports.every(r=>r.marketStrategy?.round===r.round));assert.ok(p.reports.every(r=>r.penalty===0));assert.equal((await req('student','/leaderboard?lessonId=supply-demand-v1')).board.length,1);assert.equal((await req('student','/leaderboard?lessonId=cost-markup-v1')).board.length,0);
 const math=await req('teacher','/games',{teacherKey:'test-key',name:'Math stays'});assert.equal(math.lesson.id,'cost-markup-v1');assert.equal(math.penalty,500);
 }finally{await new Promise(r=>app.server.close(r));app.db.close();fs.rmSync(dir,{recursive:true,force:true});}
});
