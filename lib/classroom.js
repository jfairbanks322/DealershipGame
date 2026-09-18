'use strict';
const {rulesFor}=require('./lessons');
function settings(g){return {sabotage:true,boxes:true,hints:true,...g.bonusSettings};}
function event(g,actor,type,detail){(g.events??=[]).push({id:require('node:crypto').randomUUID(),time:Date.now(),round:g.round,actor,type,detail});if(g.events.length>500)g.events.splice(0,g.events.length-500);}
function hint(g,p){const check=(ok,msg)=>{if(!ok)throw Object.assign(new Error(msg),{status:400});};check(rulesFor(g).mathChecks!==false&&settings(g).hints,'Math hints are not available.');check(g.phase==='planning'&&!g.paused&&!p.ready&&p.skippedRound!==g.round,'Buy a hint during open planning, before submitting.');check(!(p.hintRounds||[]).includes(g.round),'Your hint is already unlocked this round.');(p.hintRounds??=[]).push(g.round);}
const hintFee=(p,round)=>(p.hintRounds||[]).includes(round)?500:0;
module.exports={settings,event,hint,hintFee};
