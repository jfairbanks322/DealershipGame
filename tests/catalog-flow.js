const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict'),fs=require('node:fs');
const {createApp}=require('../server');
(async()=>{
 const app=createApp({dbPath:':memory:',teacherKey:'test-key'});
 await new Promise(r=>app.server.listen(0,'127.0.0.1',r));
 const base=`http://127.0.0.1:${app.server.address().port}`,browser=await chromium.launch({headless:true});
 try {
 const h=await browser.newContext(),c=await browser.newContext(),errors=[];
 async function post(ctx,path,data,status=200){const r=await ctx.request.post(base+'/api'+path,{data});assert.equal(r.status(),status,await r.text());return r.json();}
 await post(h,'/register',{name:'Teacher',username:'catalogteacher',password:'test-password',teacherLogin:true,teacherKey:'test-key'});
 await post(c,'/register',{name:'Owner',username:'catalogowner',password:'test-password'});
 const p=await c.newPage();p.on('pageerror',e=>errors.push(e.message));fs.mkdirSync('output/catalog',{recursive:true});
 for(const lessonId of ['cost-markup-v1','supply-demand-v1']){
 let g=await post(h,'/games',{name:'Menu Drop',lessonId}),url='/games/'+g.code;
 await post(c,url+'/join',{restaurant:'Fry Society'});
 g=await (await h.request.get(base+'/api'+url)).json();await post(h,url+'/start',{version:g.version});
 let state=await (await c.request.get(base+'/api'+url)).json();assert.equal(state.catalog.length,15);
 await post(c,url+'/check',{id:'45',markup:100,amount:0,price:5,stock:40},400);
 await p.goto(base);await p.locator(`[data-open="${g.code}"]`).click();await p.locator('.product[data-select="35"]').click();
 await p.locator('#pricing-form [name=price]').fill('4.40');
 if(lessonId==='cost-markup-v1'){await p.locator('#pricing-form [name=markup]').fill('100');await p.locator('#pricing-form [name=amount]').fill('2.20');}
 await p.locator('#pricing-form button').click();await p.waitForTimeout(400);
 state=await (await c.request.get(base+'/api'+url)).json();assert.equal(state.player.menu[0].id,'35');
 await post(c,url+'/check',{id:'36',markup:100,amount:0,price:5,stock:40},400);
 const saved=JSON.parse(app.db.prepare('SELECT data FROM games WHERE code=?').get(g.code).data);saved.round=10;saved.version++;app.db.prepare('UPDATE games SET data=? WHERE code=?').run(JSON.stringify(saved),g.code);
 await p.reload();await p.locator(`[data-open="${g.code}"]`).click();await p.locator('.product[data-select="134"]').waitFor();
 assert.equal(await p.locator('.product').count(),133);
 const first=await p.locator('.product').first().getAttribute('data-select');assert.equal(first,'32');
 await p.locator('.product[data-select="134"]').click();await p.locator('#pricing-form [name=price]').fill('7.80');
 if(lessonId==='cost-markup-v1'){await p.locator('#pricing-form [name=markup]').fill('100');await p.locator('#pricing-form [name=amount]').fill('3.90');}
 await p.locator('#pricing-form button').click();await p.waitForTimeout(400);
 state=await (await c.request.get(base+'/api'+url)).json();assert.equal(state.player.menu.at(-1).id,'134');
 await p.locator('.catalog').scrollIntoViewIfNeeded();await p.screenshot({path:`output/catalog/${lessonId}.png`});
 await p.setViewportSize({width:390,height:844});await p.locator('.catalog').scrollIntoViewIfNeeded();await p.screenshot({path:`output/catalog/${lessonId}-mobile.png`});assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await p.setViewportSize({width:1280,height:900});
 }
 assert.deepEqual(errors,[]);console.log('PASS expanded catalog in both modes: future locks, newest first, save new IDs, one item per round, mobile, no console errors');
 }finally{await browser.close();await new Promise(r=>app.server.close(r));app.db.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
