'use strict';
const crypto = require('node:crypto');
const tiers = [{cost:1000,chance:35},{cost:2000,chance:60},{cost:3000,chance:85}];
const expense = (p, round) => (p.sabotageCosts || []).filter(x=>x.round===round).reduce((n,x)=>n+x.amount,0);
function spin(g,p,body,roll=()=>crypto.randomInt(10000)) {
 const check=(ok,message)=>{if(!ok)throw Object.assign(new Error(message),{status:400});};
 const {sum}=require('./achievements');
 check(g.phase==='planning'&&!g.paused&&g.round>=2&&!p.ready&&p.skippedRound!==g.round,'Spin during open planning from round 2, before submitting.');
 check(require('./classroom').settings(g).sabotage,'The teacher disabled sabotage.');
 const history=p.sabotageHistory??=[];
 if(p.sabotageSpin&&!history.some(x=>x.id===p.sabotageSpin.id))history.push(p.sabotageSpin);
 const attempts=history.filter(x=>x.round===g.round);
 check(attempts.length<3&&attempts.every(x=>x.success),'A miss ends your turns; at most three successful attempts per round.');
 const tier=tiers.find(t=>t.cost===Number(body.cost));check(tier,'Choose an available spin price.');
 const target=g.players[body.target];check(target&&target!==p&&target.skippedRound!==g.round,'Choose another active restaurant.');
 check(!(target.sabotageInbox||[]).some(n=>n.round===g.round),'That restaurant was already targeted this round.');
 check(sum(p)>=tier.cost,'You need enough earned profit to pay for this spin.');
 const chance=Math.max(5,tier.chance-attempts.length*15);
 const value=roll(),success=value<chance*100;
 const event={id:crypto.randomUUID(),round:g.round,attacker:p.owner,restaurant:p.restaurant,target:target.restaurant,attackerId:p.userId,targetId:target.userId,attempt:attempts.length+1,cost:tier.cost,chance,roll:value,success,damage:success?4000:0};
 (p.sabotageCosts??=[]).push({round:g.round,amount:tier.cost});
 if(success)(target.sabotageCosts??=[]).push({round:g.round,amount:4000});
 (target.sabotageInbox??=[]).push({...event,revealed:!success});
 if(!success) for(const victim of Object.values(g.players)) for(const notice of victim.sabotageInbox||[]) {
   if(notice.round===g.round&&(notice.attackerId===p.userId||attempts.some(x=>x.id===notice.id))) {notice.revealed=true;notice.seen=false;notice.exposedByFailure=true;}
 }
 history.push(event);p.sabotageSpin=event;
 return event;
}
module.exports={tiers,expense,spin};
