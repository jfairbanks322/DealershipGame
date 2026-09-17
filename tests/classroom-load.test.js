'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {createApp}=require('../server'),{catalog}=require('../lib/catalog'),options=require('../public/restaurant-options');
test('40 simultaneous owners: ten rounds, teacher attendance, recovery and leaderboards',async()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'classroom-load-')),app=createApp({dbPath:path.join(dir,'test.db'),teacherKey:'test-teacher'}),cookies={},times=[];
 await new Promise(resolve=>app.server.listen(0,'127.0.0.1',resolve));const base=`http://127.0.0.1:${app.server.address().port}/api`;
 async function req(who,url,body,status=200){const start=performance.now(),r=await fetch(base+url,{method:body?'POST':'GET',headers:{'Content-Type':'application/json',cookie:cookies[who]||''},body:body?JSON.stringify(body):undefined});times.push(performance.now()-start);if(r.headers.get('set-cookie'))cookies[who]=r.headers.get('set-cookie').split(';')[0];const data=await r.json();assert.equal(r.status,status,JSON.stringify(data));return data;}
 try {
 await Promise.all(['teacher',...Array.from({length:40},(_,i)=>'p'+i)].map(w=>req(w,'/register',{name:w,username:"owner_"+w,password:'classroom-password'})));
 let g=await req('teacher','/games',{name:'40 owner classroom',teacherKey:'test-teacher'}),url='/games/'+g.code;
 await Promise.all(Array.from({length:40},(_,i)=>req('p'+i,url+'/join',{restaurant:options.names[i],icon:options.signs[i%32],color:options.colors[i%16].value})));
 g=await req('teacher',url);g=await req('teacher',url+'/start',{version:g.version});
 const absent=(await req('p39',url)).player.userId;
 await req('p39',url+'/draft',{id:'1',markup:'100',amount:'2.'},400);g=await req('teacher',url);
 await req('p0',url+'/skip',{version:g.version,userId:absent},400);
 g=await req('teacher',url+'/skip',{version:g.version,userId:absent});
 await req('p39',url+'/check',{id:'1',markup:'100',amount:'2.40',price:'4.80'},400);
 g=await req('teacher',url+'/restore',{version:g.version,userId:absent});assert.deepEqual((await req('p39',url)).player.drafts,{});
 const stale=g.version;g=await req('teacher',url+'/skip',{version:g.version,userId:absent});await req('teacher',url+'/restore',{version:stale,userId:absent},400);
 await req('teacher',url+'/run',{version:g.version},400);
 for(let round=1;round<=10;round++){
  await Promise.all(Array.from({length:round===1?39:40},async(_,i)=>{
   const who='p'+i,item=catalog[round-1];

   let v=await req(who,url+'/check',{id:item.id,markup:'100',amount:(item.cost/100).toFixed(2),price:(item.cost/50).toFixed(2)});assert.equal(v.check.correct,true);
   if(round===2&&i===39)await req(who,url+'/check',{id:'1',markup:'100',amount:'2.40',price:'4.80'},400);
   await req(who,url+'/ready',{});
  }));
  // Exercise simultaneous room polling, as browsers do during classroom play.
  const views=await Promise.all(Array.from({length:40},(_,i)=>req('p'+i,url)));assert.ok(views.every(v=>v.round===round));
  g=await req('teacher',url);if(round===1)await req('teacher',url+'/skip',{version:g.version,userId:views[0].player.userId},400);
  g=await req('teacher',url+'/run',{version:g.version});assert.equal(g.phase,round===10?'complete':'results');
  if(round===1){const p=(await req('p39',url)).player;assert.equal(p.reports[0].skipped,true);assert.equal(p.reports[0].profit,0);assert.equal(p.reports[0].penalty,0);assert.ok(!p.badges.includes(1));}
  if(round<10)g=await req('teacher',url+'/next',{version:g.version});
 }
 const last=(await req('p39',url)).player;assert.equal(last.menu.length,9);assert.equal(last.reports.length,10);assert.ok(last.reports[1].units>0);assert.ok(!last.badges.includes(9));
 assert.equal((await req('teacher',url+'/export')).rows.length,400);assert.equal(g.board.length,40);
 const sorted=times.sort((a,b)=>a-b);console.log(`40-owner load: ${times.length} requests; p95 ${Math.round(sorted[Math.floor(sorted.length*.95)])}ms; max ${Math.round(sorted.at(-1))}ms`);
 }finally{await new Promise(resolve=>app.server.close(resolve));app.db.close();fs.rmSync(dir,{recursive:true,force:true});}
});
