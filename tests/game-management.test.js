'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const {createApp}=require('../server');
for(const lessonId of ['cost-markup-v1','supply-demand-v1'])test(`reset and delete safely manage ${lessonId}`,async()=>{
 const app=createApp({dbPath:':memory:',teacherKey:'test-key'}),cookies={};
 await new Promise(r=>app.server.listen(0,'127.0.0.1',r));
 async function req(w,url,body,status=200){const r=await fetch(`http://127.0.0.1:${app.server.address().port}/api${url}`,{method:body?'POST':'GET',headers:{'Content-Type':'application/json',cookie:cookies[w]||''},body:body?JSON.stringify(body):undefined});if(r.headers.get('set-cookie'))cookies[w]=r.headers.get('set-cookie').split(';')[0];const d=await r.json();assert.equal(r.status,status,JSON.stringify(d));return d;}
 try {
 for(const w of ['teacher','other','student'])await req(w,'/register',{name:w,username:w,password:'test-password'});
 let g=await req('teacher','/games',{teacherKey:'test-key',name:'Reset lab',lessonId});const url='/games/'+g.code;
 const joined=await req('student',url+'/join',{restaurant:'Fry Society'}),id=joined.player.userId;
 g=await req('teacher',url);const rules=JSON.parse(app.db.prepare('SELECT data FROM games WHERE code=?').get(g.code).data).rules;
 g=await req('teacher',url+'/start',{version:g.version});
 await req('student',url+'/check',lessonId==='supply-demand-v1'?{id:'1',price:4.5,stock:40}:{id:'1',markup:100,amount:2.4,price:4.8});
 g=await req('teacher',url);
 for(const action of ['reset','delete']){
 await req('student',url+'/'+action,{version:g.version,confirmCode:g.code},400);
 await req('other',url+'/'+action,{version:g.version,confirmCode:g.code},400);
 await req('teacher',url+'/'+action,{version:g.version-1,confirmCode:g.code},400);
 await req('teacher',url+'/'+action,{version:g.version,confirmCode:'WRONG'},400);
 }
 // Seed a completed score to verify removal and preserve a different game's score.
 app.db.prepare('INSERT INTO careers(game,userId,profit,win,lessonId) VALUES(?,?,?,?,?)').run(g.code,id,100,1,lessonId);
 app.db.prepare('INSERT INTO careers(game,userId,profit,win,lessonId) VALUES(?,?,?,?,?)').run('OTHER',id,200,0,lessonId);
 const badges=(await req('student','/me')).user.badges;
 g=await req('teacher',url+'/reset',{version:g.version,confirmCode:g.code});
 assert.equal(g.phase,'lobby');assert.equal(g.round,1);assert.equal(g.paused,false);assert.equal(g.lesson.id,lessonId);assert.equal(g.board.length,1);
 const p=(await req('student',url)).player;assert.equal(p.restaurant,'Fry Society');assert.deepEqual(p.menu,[]);assert.deepEqual(p.reports,[]);assert.deepEqual(p.wrongRounds,[]);assert.equal(p.ready,false);
 assert.deepEqual((await req('student','/me')).user.badges,badges);
 assert.deepEqual(JSON.parse(app.db.prepare('SELECT data FROM games WHERE code=?').get(g.code).data).rules,rules);
 assert.equal(app.db.prepare('SELECT COUNT(*) AS n FROM careers WHERE game=?').get(g.code).n,0);
 g=await req('teacher',url+'/start',{version:g.version});assert.equal(g.phase,'planning');
 await req('teacher',url+'/delete',{version:g.version,confirmCode:g.code});
 await req('student',url,undefined,404);await req('teacher',url,undefined,404);await req('student','/leaderboard?room='+g.code,undefined,404);
 assert.equal((await req('student','/me')).games.length,0);assert.equal((await req('teacher','/me')).games.length,0);
 assert.equal(app.db.prepare('SELECT COUNT(*) AS n FROM careers WHERE game=?').get('OTHER').n,1);
 }finally{await new Promise(r=>app.server.close(r));app.db.close();}
});
