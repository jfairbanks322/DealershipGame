'use strict';
const crypto = require('node:crypto');
const tiers = [{cost:1000,chance:35},{cost:2000,chance:60},{cost:3000,chance:85}];
const mode=g=>g.sabotageMode==='sales'?'sales':'repair';
const expense = (p, round) => (p.sabotageCosts || []).filter(x=>x.round===round).reduce((n,x)=>n+x.amount,0);
function spin(g,p,body,roll=()=>crypto.randomInt(10000)) {
 const check=(ok,message)=>{if(!ok)throw Object.assign(new Error(message),{status:400});};
 const {sum}=require('./achievements');
 check(g.phase==='planning'&&!g.paused&&g.round>=2&&!p.ready&&p.skippedRound!==g.round,'Spin during open planning from round 2, before submitting.');
 check(require('./classroom').settings(g).sabotage,'The teacher disabled sabotage.');
 const sales=mode(g)==='sales';
 check(!sales||g.round<require('./lessons').rulesFor(g).totalRounds,'Sales stealing closes in the final round because there is no next round.');
 const history=p.sabotageHistory??=[];
 if(p.sabotageSpin&&!history.some(x=>x.id===p.sabotageSpin.id))history.push(p.sabotageSpin);
 const attempts=history.filter(x=>x.round===g.round);
 check(attempts.length<3&&attempts.every(x=>x.success),'A miss ends your turns; at most three successful attempts per round.');
 const tier=tiers.find(t=>t.cost===Number(body.cost));check(tier,'Choose an available spin price.');
 const target=g.players[body.target];check(target&&target.userId===body.target&&target!==p&&target.skippedRound!==g.round,'Choose another active restaurant.');
 check(!(target.sabotageInbox||[]).some(n=>n.round===g.round&&!n.allianceNotice&&!n.exposure),'That restaurant was already targeted this round.');
 check(sum(p)>=tier.cost,'You need enough earned profit to pay for this spin.');
 const alliance=require('./alliances').enabled(g)?require('./alliances').group(g,p.userId):null;
 const backstab=!!alliance?.members.includes(target.userId),allianceSize=backstab?alliance.members.length:0;
 const rate=backstab ? .05+.05*allianceSize : .10;
 const chance=Math.max(5,tier.chance-attempts.length*15);
 const value=roll(),success=value<chance*100;
 const event={id:crypto.randomUUID(),round:g.round,attacker:p.owner,restaurant:p.restaurant,target:target.restaurant,attackerId:p.userId,targetId:target.userId,attempt:attempts.length+1,cost:tier.cost,chance,roll:value,success,mode:mode(g),backstab,allianceSize,rate:Math.round(rate*100),dueRound:sales?g.round+1:null,damage:success&&!sales?4000:0};
 (p.sabotageCosts??=[]).push({round:g.round,amount:tier.cost});
 if(success&&!sales)(target.sabotageCosts??=[]).push({round:g.round,amount:4000});
 if(success&&sales)(g.sabotageClaims??=[]).push({id:event.id,attackerId:p.userId,targetId:target.userId,round:g.round+1,rate:event.rate,settled:false});
 (target.sabotageInbox??=[]).push({...event,revealed:!success});
 if(!success) for(const victim of Object.values(g.players)) for(const notice of victim.sabotageInbox||[]) {
   if(notice.round===g.round&&(notice.attackerId===p.userId||attempts.some(x=>x.id===notice.id))) {notice.revealed=true;notice.seen=false;notice.exposedByFailure=true;}
 }
 const victimAlliance=require('./alliances').enabled(g)?require('./alliances').group(g,target.userId):null;
 if(victimAlliance&&success)for(const id of victimAlliance.members)if(id!==p.userId&&id!==target.userId){
   (g.players[id].sabotageInbox??=[]).push({...event,id:crypto.randomUUID(),relatedId:event.id,allianceNotice:true,revealed:false});
 }
 const priorBackstab=attempts.some(x=>x.backstab);
 if(!success&&(backstab||priorBackstab))for(const q of Object.values(g.players)){
   (q.sabotageInbox??=[]).push({...event,id:crypto.randomUUID(),exposure:true,revealed:true,backstab:true,success:false});
 }
 history.push(event);p.sabotageSpin=event;
 return event;
}
// Apply after every restaurant has generated its report. Sales means gross revenue,
// not profit. Frozen claims survive teacher mode changes and membership changes.
function settle(g){
 for(const claim of g.sabotageClaims||[]){
  if(claim.settled||claim.round!==g.round)continue;
  const attacker=g.players[claim.attackerId],target=g.players[claim.targetId];
  const a=attacker?.reports.find(r=>r.round===g.round),t=target?.reports.find(r=>r.round===g.round);
  if(!a||!t)continue;
  const amount=Math.round(t.revenue*claim.rate/100);
  a.sabotageIncome=(a.sabotageIncome||0)+amount;a.profit+=amount;a.fees-=amount;
  t.sabotageStolen=(t.sabotageStolen||0)+amount;t.fees+=amount;t.profit-=amount;
  claim.settled=true;claim.amount=amount;
  require("./classroom").event(g,attacker.owner,"sabotagePayout",`Received $${(amount/100).toFixed(2)} from ${target.owner}: ${claim.rate}% of round ${g.round} sales`);
 }
}
function inbox(p){return (p.sabotageInbox||[]).map(n=>n.success&&!n.revealed?{id:n.id,round:n.round,success:true,damage:n.damage,seen:n.seen,revealed:false,mode:n.mode,dueRound:n.dueRound,allianceNotice:!!n.allianceNotice,outside:true,target:n.allianceNotice?n.target:undefined}:{...n});}
module.exports={tiers,expense,spin,mode,settle,inbox};
