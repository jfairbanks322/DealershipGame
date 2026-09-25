const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),{createApp}=require('../server');
(async()=>{const app=createApp({dbPath:':memory:',teacherKey:'test-key'});await new Promise(r=>app.server.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${app.server.address().port}`,browser=await chromium.launch({headless:true});try{
 const h=await browser.newContext(),students=await Promise.all(Array.from({length:5},()=>browser.newContext())),errors=[];
 async function post(ctx,path,data,status=200){const r=await ctx.request.post(base+'/api'+path,{data});assert.equal(r.status(),status,await r.text());return r.json();}async function get(ctx,path){return(await ctx.request.get(base+'/api'+path)).json();}
 await post(h,'/register',{name:'Teacher',username:'flashhost',password:'test-password',teacherLogin:true,teacherKey:'test-key'});
 for(let i=0;i<5;i++)await post(students[i],'/register',{name:'Owner '+i,username:'flashowner'+i,password:'test-password'});
 let g=await post(h,'/games',{name:'Flash Kitchen'}),url='/games/'+g.code;
 for(const c of students)await post(c,url+'/join',{restaurant:'Fry Society'});
 g=await get(h,url);await post(h,url+'/start',{version:g.version});
 const t=await h.newPage(),s=await students[0].newPage(),homeStudent=await students[4].newPage();await homeStudent.goto(base);for(const p of [t,s])p.on('pageerror',e=>errors.push(e.message));
 await t.goto(base);await t.locator(`[data-open="${g.code}"]`).click();await s.goto(base);await s.locator(`[data-open="${g.code}"]`).click();await s.locator('.product[data-select="1"]').click();await s.locator('#pricing-form [name=markup]').fill('123');await s.locator('#pricing-form [name=markup]').focus();
 await t.locator('[data-flash-random]').click();assert.ok((await t.locator('#flash-form [name=question]').inputValue()).length>3);await t.locator('#flash-bank').selectOption('1');assert.equal(await t.locator('#flash-form [name=question]').inputValue(),'An item costs $4. What is its selling price with a 50% markup?');await t.locator('#flash-form button:not([type=button])').click();await s.locator('#flash-dialog').waitFor();await homeStudent.locator('#flash-dialog').waitFor();assert.equal(await homeStudent.locator('[data-action=game]').count(),0);await homeStudent.reload();await homeStudent.locator('#flash-dialog').waitFor();await t.waitForTimeout(1600);const delivered=await get(h,url);assert.equal(delivered.flash.received,2);assert.equal(delivered.flash.unreceived.length,3);
 let st=await get(students[0],url),id=st.flash.id;assert.equal(st.flash.correct,undefined);assert.equal(st.flashBank,undefined);
 await post(students[0],url+'/flashStart',{},400);await post(students[1],url+'/flashClose',{id},400);
 const other=await post(h,'/games',{name:'Other room'});assert.equal((await get(h,'/games/'+other.code)).flash,null);
 fs.mkdirSync('output/flash',{recursive:true});await s.setViewportSize({width:390,height:844});await s.screenshot({path:'output/flash/countdown.png'});assert.ok(await s.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await s.locator('#flash-dialog [data-choice="2"]:not([disabled])').waitFor();await s.locator('#flash-dialog [data-choice="2"]').click();await s.getByText('Correct! You placed #1 and won $50.00.').waitFor();
 // Four requests race for the two remaining places; transactions admit exactly two.
 const replies=await Promise.all(students.slice(1).map(c=>c.request.post(base+'/api'+url+'/flashAnswer',{data:{id,choice:2}})));assert.equal(replies.filter(r=>r.status()===200).length,2);
 const final=await get(h,url);assert.equal(final.flash.winners.length,3);assert.deepEqual(final.flash.winners.map(w=>w.amount),[5000,3000,1000]);
 await post(students[0],url+'/flashAnswer',{id,choice:2});assert.equal((await get(students[0],url)).player.flashRewards.length,1);
 await s.getByText('Challenge closed',{exact:true}).waitFor();await s.screenshot({path:'output/flash/winners.png'});await s.locator('[data-flash-dismiss]').click();assert.equal(await s.locator('#pricing-form [name=markup]').inputValue(),'123');
 await t.waitForTimeout(2800);await t.locator('#flash-teacher').screenshot({path:'output/flash/teacher.png'});
 for(const c of students){await post(c,url+'/check',{id:'1',markup:100,amount:2.4,price:4.8});await post(c,url+'/ready',{});}g=await get(h,url);await post(h,url+'/run',{version:g.version});st=await get(students[0],url);assert.equal(st.player.reports[0].flashIncome,5000);assert.equal(st.player.reports[0].profit,st.player.reports[0].revenue-st.player.reports[0].cost-st.player.reports[0].fees-st.player.reports[0].penalty);
 g=await get(h,url);await post(h,url+'/reset',{version:g.version,confirmCode:g.code});st=await get(students[0],url);assert.equal(st.flash,null);assert.equal(st.player.flashRewards,undefined);assert.deepEqual(errors,[]);
 console.log('PASS teacher bank/send, home-screen delivery after reload, delivery receipts, live mobile popup while typing, privacy/auth/room isolation, simultaneous first-three winners, retry safety, input preservation, report credit and reset');
 }finally{await browser.close();await new Promise(r=>app.server.close(r));app.db.close();}})().catch(e=>{console.error(e);process.exitCode=1});
