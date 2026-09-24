'use strict';
const crypto=require('node:crypto');
const bank=[
 ['markup','Markup warm-up','An item costs $4. What is its selling price with a 50% markup?',['$2','$4.50','$6','$8'],2],
 ['markup','Find the markup','An item costs $5 and sells for $8. What is the markup amount?',['$3','$5','$8','$13'],0],
 ['discount','Discount dash','A $10 meal is discounted 20%. What is its sale price?',['$2','$8','$9.80','$12'],1],
 ['discount','Percent off','A $12 meal now costs $9. What percentage discount is that?',['3%','20%','25%','33%'],2],
 ['demand','Demand spike','More customers want smoothies, but supply stays the same. What pressure does this put on prices?',['Downward','Upward','Prices must stay fixed','Prices must become zero'],1],
 ['supply','Supply surge','More suppliers offer the same ingredients while demand stays steady. What usually happens to prices?',['They rise','They tend to fall','They always double','They cannot change'],1],
 ['competition','Direct competition','Which is most likely a direct competitor to a burger restaurant?',['A furniture shop','A bookstore','Another burger restaurant','A car wash'],2],
 ['competition','Indirect competition','Which business meets the same lunch need in a different way from a burger restaurant?',['A grocery deli','A shoe store','A phone repair shop','A gym equipment shop'],0],
 ['profit','Profit check','Sales are $100 and total costs are $70. What is profit?',['$170','$70','$30','$100'],2],
 ['stock','Stock decision','You repeatedly sell out early and turn customers away. Which response is worth considering?',['Prepare less','Prepare more while watching costs','Ignore demand','Stop selling the item'],1]
].map(([topic,title,question,options,correct],i)=>({id:String(i+1),topic,title,question,options,correct}));
const check=(ok,message)=>{if(!ok)throw Object.assign(new Error(message),{status:400});};
function active(c,now=Date.now()){return !!c&&!c.closedAt&&now<c.endsAt&&c.winners.length<3;}
function start(g,b,now=Date.now()){
 check(g.phase==='planning'&&!g.paused,'Send a challenge during open planning.');
 check(!active(g.flashChallenge,now),'Close the current challenge first.');
 check(typeof b.question==='string'&&b.question.trim().length>=3&&b.question.trim().length<=300,'Enter a question of 3–300 characters.');
 check(Array.isArray(b.options)&&b.options.length===4&&b.options.every(x=>typeof x==='string'&&x.trim().length>0&&x.trim().length<=120),'Enter four answers, each up to 120 characters.');
 check(new Set(b.options.map(x=>x.trim().toLowerCase())).size===4,'Use four different answer choices.');
 check(Number.isInteger(b.correct)&&b.correct>=0&&b.correct<4,'Select the correct answer.');
 check(Number.isInteger(b.seconds)&&b.seconds>=15&&b.seconds<=180,'Choose a timer from 15 to 180 seconds.');
 check(Array.isArray(b.prizes)&&b.prizes.length===3&&b.prizes.every(x=>Number.isInteger(x)&&x>=0&&x<=100000)&&b.prizes.some(x=>x>0),'Set three prizes between $0 and $1,000, with at least one positive prize.');
 check(b.prizes[0]>=b.prizes[1]&&b.prizes[1]>=b.prizes[2],'Prizes must decrease or stay equal from first to third place.');
 const eligible=Object.values(g.players).filter(p=>p.skippedRound!==g.round).map(p=>p.userId);
 check(eligible.length,'At least one student must be in this round.');
 g.flashChallenge={id:crypto.randomUUID(),round:g.round,question:b.question.trim(),options:b.options.map(x=>x.trim()),correct:b.correct,prizes:[...b.prizes],startsAt:now+5000,endsAt:now+5000+b.seconds*1000,eligible,answers:{},winners:[]};
 return g.flashChallenge;
}
function answer(g,p,b,now=Date.now()){
 const c=g.flashChallenge;check(p&&c&&b.id===c.id,'This challenge is no longer available.');
 check(c.eligible.includes(p.userId)&&p.skippedRound!==g.round,'You are not participating in this challenge.');
 // Retried submissions return the recorded answer, including after the challenge closes.
 if(c.answers[p.userId])return c.answers[p.userId];
 check(g.phase==='planning'&&!g.paused&&c.round===g.round&&active(c,now)&&now>=c.startsAt,'Answers are not open for this challenge.');
 check(Number.isInteger(b.choice)&&b.choice>=0&&b.choice<4,'Choose one answer.');
 const a={choice:b.choice,correct:b.choice===c.correct,time:now};c.answers[p.userId]=a;
 if(a.correct){const rank=c.winners.length+1,amount=c.prizes[rank-1];const win={userId:p.userId,owner:p.owner,rank,amount};c.winners.push(win);a.rank=rank;a.amount=amount;(p.flashRewards??=[]).push({id:c.id,round:g.round,amount,rank});require('./classroom').event(g,p.owner,'flashPrize',`Flash Challenge #${rank}: $${(amount/100).toFixed(2)}`);}
 if(c.winners.length===3||c.eligible.every(id=>c.answers[id]))c.closedAt=now;
 return a;
}
function close(g,id,now=Date.now()){check(g.flashChallenge?.id===id,'This challenge is no longer available.');g.flashChallenge.closedAt=now;}
function view(g,id,host=false,now=Date.now()){
 const c=g.flashChallenge;if(!c)return null;
 const open=active(c,now)&&g.phase==='planning'&&c.round===g.round;
 return {id:c.id,round:c.round,question:c.question,options:c.options,prizes:c.prizes,startsAt:c.startsAt,endsAt:c.endsAt,serverNow:now,open,eligible:c.eligible.includes(id),winners:c.winners,answered:Object.keys(c.answers).length,participants:c.eligible.length,answer:c.answers[id]||null,correct:host||!open?c.correct:undefined,answers:host?Object.entries(c.answers).map(([userId,a])=>({owner:g.players[userId]?.owner,...a})):undefined};
}
const income=(p,round)=>(p.flashRewards||[]).filter(x=>x.round===round).reduce((n,x)=>n+x.amount,0);
module.exports={bank,active,start,answer,close,view,income};
