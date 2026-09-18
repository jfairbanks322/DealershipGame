'use strict';
const {rulesFor,lessonFor}=require('./lessons');
function eligible(g,p){
 const {insist}=require('./game');
 insist(rulesFor(g).mathChecks!==false,'Guided math is only for the math lesson.');
 insist(p.guidedEnabled!==false,'Your teacher has turned off guided math for this game.');
 insist(g.phase==='planning'&&!g.paused&&!p.ready&&p.skippedRound!==g.round,'Use guided math during open planning before submitting.');
}
function start(g,p,b){
 eligible(g,p);const {insist}=require('./game');
 const item=rulesFor(g).catalog.find(x=>x.id===b.id&&x.round<=g.round);
 insist(item,'Choose an available menu item.');
 insist(p.menu.some(x=>x.id===b.id)||!p.menu.some(x=>x.addedRound===g.round),'You can add only one new item each round.');
 const verdict=lessonFor(g).checkPricing(item,{markup:b.markup,amount:0,price:0},rulesFor(g));
 p.guidedUsed??=[];const key=g.round+':'+item.id;if(!p.guidedUsed.includes(key))p.guidedUsed.push(key);
 p.guidedSession={id:item.id,round:g.round,markup:verdict.markup,cost:item.cost,amount:verdict.price-item.cost,price:verdict.price,step:0,complete:false};
 return {correct:true,message:'Let’s take it one step at a time. Guided practice is free and adds no math penalties.'};
}
function answer(g,p,b){
 eligible(g,p);const {insist,money,pricing}=require('./game');
 const session=p.guidedSession;
 insist(session&&session.round===g.round&&!session.complete,'Start or reopen guided practice first.');
 insist(b.id===session.id&&Number(b.step)===session.step,'This step changed. Review the current step and try again.');
 insist(p.menu.some(x=>x.id===session.id)||!p.menu.some(x=>x.addedRound===g.round),'You can add only one new item each round.');
 const expected=[session.markup/100,session.amount,session.price][session.step];
 const value=session.step===0?Number(b.answer):money(b.answer);
 const correct=String(b.answer??'').trim()!==''&&Number.isFinite(value)&&Math.abs(value-expected)<1e-9;
 p.guidedPracticeByRound??={};const counts=p.guidedPracticeByRound[g.round]??={right:0,wrong:0};counts[correct?'right':'wrong']++;
 if(!correct)return {correct:false,message:[`A percent means “out of 100.” Divide ${session.markup} by 100. Try again—no penalty.`,`Multiply $${(session.cost/100).toFixed(2)} by ${session.markup/100}, then round to the nearest cent. Try again—no penalty.`,`Add the original cost, $${(session.cost/100).toFixed(2)}, to the markup amount, $${(session.amount/100).toFixed(2)}. Try again—no penalty.`][session.step]};
 session.step++;
 if(session.step===3){
   const result=pricing(g,p,{id:session.id,markup:session.markup,amount:session.amount/100,price:session.price/100},{assisted:true});
   session.complete=true;
   return {...result,message:'You did it! Your price is saved. This was recorded as an assisted answer. You can submit the round.'};
 }
 return {correct:true,message:session.step===1?'Yes! Now use that decimal to find the markup amount.':'Correct! Add that markup amount to the original cost.'};
}
function progress(p,round){
 const records=Object.entries(p.mathModesByRound||{}),steps=Object.entries(p.guidedPracticeByRound||{});
 function total(filter){return records.filter(([r])=>filter(Number(r))).reduce((n,[r,c])=>({independentRight:n.independentRight+(c.independentRight||0),independentWrong:n.independentWrong+(c.independentWrong||0),assistedRight:n.assistedRight+(c.assistedRight||0),assistedWrong:n.assistedWrong+(c.assistedWrong||0)}),{independentRight:0,independentWrong:0,assistedRight:0,assistedWrong:0});}
 return {round:total(r=>r===round),total:total(()=>true),practice:steps.reduce((n,[r,c])=>({right:n.right+c.right,wrong:n.wrong+c.wrong}),{right:0,wrong:0}),enabled:p.guidedEnabled!==false};
}
module.exports={start,answer,progress};
