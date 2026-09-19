'use strict';
const {rulesFor}=require('./lessons');
const classroom=require('./classroom');
function progress(g,p){
 const supply=rulesFor(g).mathChecks===false,guide=p.roundGuide?.round===g.round?p.roundGuide:{},added=p.menu.some(x=>x.addedRound===g.round);
 const steps=[{id:'clues',label:supply?'Read today’s market clues':'Review today’s goal',done:!!guide.clues,required:false}];
 if(require('./lessons/competition').enabled(g))steps.push({id:'challenge',label:'Complete the competition challenge',done:!!require('./lessons/competition').record(p,g.round),required:true});
 if(supply)steps.push({id:'strategy',label:'Save your market strategy',done:(p.marketStrategies||[]).some(x=>x.round===g.round),required:true});
 steps.push({id:'item',label:supply?'Add one menu item and save its price and stock':'Add one menu item and save its math check',done:added,required:true});
 steps.push({id:'review',label:supply?'Review your prices and stock':'Review your menu prices',done:!!guide.review,required:false});
 const missing=steps.filter(x=>x.required&&!x.done).map(x=>({id:x.id,label:x.label}));
 steps.push({id:'submit',label:'Submit this round',done:!!p.ready,required:true});
 const skipped=p.skippedRound===g.round,open=g.phase==='planning'&&!g.paused&&!skipped&&!p.ready;
 const math=require('./math-progress').summary(p,g.round),practice=p.guidedPracticeByRound?.[g.round],answers=require('./lessons/competition').record(p,g.round);
 const support=[];if(!supply&&math.round.wrong>0)support.push(`${math.round.wrong} math check${math.round.wrong===1?'':'s'} needed correction`);if(practice?.wrong>=2)support.push(`${practice.wrong} guided practice retries`);if(answers?.answers.some(x=>!x.classificationCorrect||!x.reasonCorrect)||answers?.strategyReasonCorrect===false)support.push('Competition feedback needs review');
 return {steps,missing,canSubmit:open&&missing.length===0,next:open?(steps.find(x=>!x.done)?.id||'submit'):null,status:skipped?'skipped':p.ready?'submitted':g.phase==='lobby'?'waiting':g.phase!=='planning'?'finished':g.paused?'paused':'planning',support};
}
function acknowledge(g,p,key){const {insist}=require('./game');insist(g.phase==='planning'&&!g.paused&&!p.ready&&p.skippedRound!==g.round,'Review during open planning before submitting.');insist(['clues','review'].includes(key),'Choose a checklist reminder.');p.roundGuide=p.roundGuide?.round===g.round?p.roundGuide:{round:g.round};p.roundGuide[key]=true;}
function pending(g,p){return (g.sabotageClaims||[]).filter(x=>!x.settled&&(x.attackerId===p.userId||x.targetId===p.userId)).map(x=>x.attackerId===p.userId?{direction:'income',round:x.round,description:`You will receive ${x.rate}% of ${g.players[x.targetId]?.restaurant||'the target restaurant'}’s round ${x.round} sales. The amount is not known yet.`}:{direction:'loss',round:x.round,description:`Your restaurant was targeted. A share of round ${x.round} sales will be diverted; the amount appears after that round runs.`});}
function receipt(p,r){if(!r)return null;const rows=[],add=(label,amount,timing='Settled with this round')=>{if(amount)rows.push({label,amount,timing});};
 add('Sales revenue',r.revenue||0);add('Food costs',-(r.cost||0));
 const promotions=(r.items||[]).reduce((n,x)=>n+(x.fee||0),0);add('Promotions / advertising',-promotions);add('Competition campaign / pickup help',-(r.competitionFee||0));
 const boxes=(p.mysteryBoxes||[]).filter(x=>x.round===r.round),boxNet=boxes.reduce((n,x)=>n+x.price-x.amount,0),planning='Paid or credited during planning; already included';
 if(boxes.length){add('Mystery box purchases',-boxes.reduce((n,x)=>n+x.price,0),planning);add('Box payouts / refunds',boxes.reduce((n,x)=>n+Math.max(0,x.amount),0),planning);add('Box extra expenses',boxes.reduce((n,x)=>n+Math.min(0,x.amount),0),planning);}else add('Mystery box net result',-(r.mysteryFees||0),planning);
 add('Sabotage spins / repair costs',-(r.sabotageFees||0),planning);add('Sales stolen from rivals',r.sabotageIncome||0);add('Sales lost to sabotage',-(r.sabotageStolen||0));add('Purchased math hints',-(r.hintFees||0),planning);add('Math penalty',-(r.penalty||0));
 const accounted=promotions+(r.competitionFee||0)+(boxes.length?boxNet:r.mysteryFees||0)+(r.sabotageFees||0)+(r.hintFees||0)+(r.sabotageStolen||0)-(r.sabotageIncome||0);add('Other recorded fees / credits',-((r.fees||0)-accounted));
 return {round:r.round,rows,profit:r.profit,allianceSavings:r.allianceSavings||0};
}
function story(g,p){const r=p.reports.find(x=>x.round===g.round);if(!r)return null;const items=r.items||[],left=items.reduce((n,x)=>n+(x.leftover||0),0),missed=items.reduce((n,x)=>n+(x.missed||0),0),best=[...items].sort((a,b)=>b.profit-a.profit)[0];
 let helped=best?.profit>0?`${best.name} earned $${(best.profit/100).toFixed(2)} before restaurant-wide fees and bonuses.`:r.revenue>0?`Customers bought ${r.units} units, generating $${(r.revenue/100).toFixed(2)} in sales.`:'Your saved decisions are available to review.';
 let hurt=left?`${left} prepared units did not sell. Prepared food still costs money.`:missed?`Demand exceeded stock by ${missed} units. Those were missed sales opportunities.`:r.penalty?`A math penalty reduced profit by $${(r.penalty/100).toFixed(2)}.`:r.sabotageStolen?`Sabotage diverted $${(r.sabotageStolen/100).toFixed(2)} of your sales.`:r.profit<0?'The recorded costs and losses were greater than sales and credits.':'No single issue stands out from these totals. Review the breakdown for costs and bonuses.';
 let next=left?'Consider preparing less of the items with leftovers, after checking the next market clues.':missed?'Consider more stock for sold-out items, while checking whether demand is likely to continue.':r.penalty?(p.guidedEnabled!==false?'Use “Walk me through it” when pricing your next item. Guided retries add no penalties.':'Ask your teacher to review a worked pricing example with you before the next item.'):r.profit<0?'Compare each item’s selling price with its costs, and review optional spending.':(rulesFor(g).mathChecks===false?'Read the next round’s clues before deciding whether to change your prices or stock.':'Review the next item’s cost and your saved prices before choosing a markup.');
 if(r.skipped){helped='Your menu and earlier results were kept.';hurt='This restaurant made no sales because the round was skipped. Earlier purchases or scheduled transfers can still affect profit.';next='Return for the next open round, or review your saved results with your teacher.';}
 return {round:r.round,helped,hurt,next,receipt:receipt(p,r)};
}
function presets(g){const supply=rulesFor(g).mathChecks===false;return [
 {id:'core',name:'Core lesson',description:'Core pricing and lesson decisions only. Mystery boxes, sabotage, alliances, and paid hints OFF. Competition challenges OFF. Free guided math stays available according to each student’s setting.',settings:{sabotage:false,boxes:false,alliances:false,hints:false},competition:false},
 ...(supply?[{id:'competition',name:'Competition focus',description:'Supply & Demand plus direct/indirect competition challenges. Mystery boxes, sabotage, alliances, and paid hints OFF.',settings:{sabotage:false,boxes:false,alliances:false,hints:false},competition:true}]:[]),
 {id:'full',name:'Full game',description:`Mystery boxes, alliances and next-round sales sabotage ON.${supply?' Competition challenges ON.':' Paid math hints ON; free guided math keeps its individual settings.'} Core pricing and lesson decisions remain required.`,settings:{sabotage:true,boxes:true,alliances:true,hints:!supply},competition:supply},
 ];}
function currentPreset(g){return presets(g).find(p=>Object.entries(p.settings).every(([k,v])=>classroom.settings(g)[k]===v)&&require('./lessons/competition').enabled(g)===p.competition&&(!p.settings.sabotage||g.sabotageMode==='sales'))?.id||'custom';}
function applyPreset(g,id){const {insist}=require('./game');insist(['lobby','results'].includes(g.phase)&&!g.paused,'Apply presets before starting or between rounds.');const preset=presets(g).find(x=>x.id===id);insist(preset,'Choose an available lesson preset.');g.bonusSettings={...classroom.settings(g),...preset.settings};g.competitionEnabled=preset.competition;if(preset.settings.sabotage)g.sabotageMode='sales';return preset;}
module.exports={progress,acknowledge,pending,receipt,story,presets,currentPreset,applyPreset};
