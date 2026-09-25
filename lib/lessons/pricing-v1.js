'use strict';
const base=require('./supply-demand-v1'),markup=require('./markup-v1'),data=require('./pricing-data');
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const check=(ok,message)=>{if(!ok)throw Object.assign(new Error(message),{status:400});};
const rules={...structuredClone(base.rules),pricing:data};
function initialize(g){const events=[...data.events.slice(1)];for(let i=events.length-1;i>0;i--){const j=require('node:crypto').randomInt(i+1);[events[i],events[j]]=[events[j],events[i]];}g.rules.events=[data.events[0],...events.slice(0,9)];}
const defs=g=>(g.rules||rules).pricing;
const decision=(g,p)=>(p.pricingPlans||[]).find(x=>x.round===g.round);
const event=g=>(g.rules||rules).events[g.round-1];
const strategy=(g,p)=>defs(g).strategies.find(s=>s.id===decision(g,p)?.strategy);
function market(g){const e=event(g);return {...e,clues:[{id:'customers',label:'Customer research',text:'Six customer groups share a limited number of visits. Your target market helps attract one group; it does not exclude the others.'},{id:'cost',label:'Supplier update',text:`Ingredient costs are ${Math.round(e.cost*100)}% of normal. Leftovers expire and are paid for.`},{id:'competition',label:'Competition',text:'Student restaurants compete for the same customers. A simulated outside option keeps very high prices from guaranteeing sales.'}]};}
function readyError(g,p){return markup.readyError(g,p)||planError(g,p);}
function planError(g,p){const d=decision(g,p);if(!d)return 'Save your target market and pricing strategy for this round.';const focus=p.menu.find(x=>x.id===d.focus),other=p.menu.find(x=>x.id===d.companion);
 if(['bundle','loss-leader','skimming'].includes(d.strategy)&&!focus)return 'Select a saved menu item for your featured strategy.';
 if(d.strategy==='bundle'&&(!other||other.id===focus.id))return 'Choose two different saved menu items for your bundle.';
 if(d.strategy==='loss-leader'&&(p.menu.length<2||focus.price>Math.round(g.rules.catalog.find(x=>x.id===focus.id).cost*event(g).cost)))return 'A loss leader needs two menu items and a featured price at or below today’s ingredient cost.';
 if(d.strategy==='skimming'&&(!g.rules.catalog.find(x=>x.id===focus.id).wild||g.round-focus.addedRound>2))return 'Skimming needs a wild creation introduced within the last three rounds.';
 return null;
}
function choose(g,p,b){
 check(g.lessonId==='pricing-v1'&&g.phase==='planning'&&!g.paused&&!p.ready&&p.skippedRound!==g.round,'Strategy editing is closed.');
 check(defs(g).markets.some(x=>x.id===b.target)&&defs(g).strategies.some(x=>x.id===b.strategy),'Choose a target market and pricing strategy.');
 check(['match','undercut','exceed'].includes(b.position||'match'),'Choose a competitive position.');
 const discount=Number(b.discount??10);check(Number.isInteger(discount)&&discount>=5&&discount<=30,'Bundle discount must be 5–30%.');
 const scenario=defs(g).scenarios.find(x=>x.round===g.round);
 if(b.scenario)check(scenario&&defs(g).strategies.some(x=>x.id===b.scenario),'Choose a valid scenario response.');
 const d={round:g.round,target:b.target,strategy:b.strategy,position:b.position||'match',focus:String(b.focus||''),companion:String(b.companion||''),discount,scenario:b.scenario||null};
 p.pricingPlans??=[];const index=p.pricingPlans.findIndex(x=>x.round===g.round);if(index<0)p.pricingPlans.push(d);else p.pricingPlans[index]=d;return d;
}
function research(g,p){
 const d=defs(g),rivals=Object.values(g.players).filter(q=>q!==p).flatMap(q=>q.reports.filter(r=>r.round===g.round-1).flatMap(r=>r.items));
 return {strategies:d.strategies,markets:d.markets,plan:p?decision(g,p)||null:null,scenario:d.scenarios.find(x=>x.round===g.round)||null,
  rivals:[...new Set(g.rules.catalog.filter(x=>x.round<=g.round).map(x=>x.category))].map(category=>{const prices=rivals.filter(x=>x.category===category).map(x=>x.price);const fallback=g.rules.catalog.filter(x=>x.category===category&&x.round<=g.round).map(x=>x.expected);return {category,price:Math.round((prices.length?prices:fallback).reduce((a,b)=>a+b,0)/(prices.length||fallback.length)),source:prices.length?'Last round’s student menu prices':'Simulated typical menu price'};}),
  tracker:g.host?Object.values(g.players).map(q=>({owner:q.owner,plan:decision(g,q)||null})):[]};
}
function publicResearch(g,p,host){const r=research(g,p);if(!host)delete r.tracker;if(r.scenario)r.scenario={round:r.scenario.round,question:r.scenario.question};return r;}
function simulateRound(g,players){
 const e=event(g),active=players.filter(p=>p.skippedRound!==g.round),offers=[],out={};
 for(const p of active){check(!readyError(g,p),readyError(g,p));const d=decision(g,p),s=strategy(g,p),prior=p.reports.filter(r=>r.business).at(-1)?.business;
  const switched=!!prior&&(prior.strategy!==d.strategy||prior.target!==d.target);
  const loyalty=clamp((prior?.loyalty||0)*.8,0,.18);
  const entries=p.menu.map(entry=>({entry,product:g.rules.catalog.find(x=>x.id===entry.id)}));
  out[p.userId]={items:{},transactions:0,customers:{},satisfaction:0,weight:0,strategyFee:s.fee,switched,loyalty,plan:d};
  for(const {entry,product} of entries)out[p.userId].items[entry.id]={...entry,name:product.name,icon:product.icon,category:product.category,orders:0,units:0,demand:0,prepared:entry.stock,unitCost:Math.round(product.cost*e.cost),revenue:0,cost:entry.stock*Math.round(product.cost*e.cost),fee:0,promoted:false,discount:0};
  const add=rows=>{const raw=rows.reduce((n,x)=>n+x.entry.price,0),price=rows.length===2?Math.round(raw*(1-d.discount/100)):raw;
   offers.push({p,d,s,rows,price,raw,ref:rows.reduce((n,x)=>n+x.product.expected,0),stock:Math.min(...rows.map(x=>x.entry.stock)),desired:0,segments:{},switched,loyalty});};
  if(d.strategy==='bundle'){add(entries.filter(x=>[d.focus,d.companion].includes(x.entry.id)));for(const row of entries.filter(x=>![d.focus,d.companion].includes(x.entry.id)))add([row]);}else entries.forEach(row=>add([row]));
 }
 // Allocate a finite number of purchase opportunities among every restaurant and an outside option.
 for(const m of defs(g).markets){
  const visits=Math.round(active.length*18*e.demand*(e.segment===m.id?(e.traffic||1):1));
  const weights=offers.map(o=>{
   const affinity=o.rows.reduce((n,x)=>n*(m.likes.includes(x.product.category)?1.2:.9)*(x.product.wild?m.wild*(e.wild||1):1),1)**(1/o.rows.length);
   let perceived=o.price,fit=1;
   if(o.s.id==='psychological'&&o.price%100===99&&o.price/o.ref<1.4)fit*=m.psych;
   if(o.s.id==='premium'&&o.price/o.ref>=1.1)fit*=m.premium;
   if(o.s.id==='penetration'&&o.rows.some(x=>g.round-x.entry.addedRound<=1)&&o.price/o.ref<=.85)fit*=1.22;
   if(o.s.id==='skimming'&&o.rows[0].entry.id===o.d.focus&&['luxury','teens'].includes(m.id))fit*=1+Math.max(0,2-(g.round-o.rows[0].entry.addedRound))*.18;
   if(o.rows.length===2){fit*=m.id==='families'?1.2:1.04;if(e.segment===m.id)fit*=e.bundle||1;}
   // Competitive intent alone gives no bonus. Actual prices are compared with all offers below.
   const value=Math.exp(clamp(-m.sensitivity*(e.sensitivity||1)*(perceived/(o.ref*m.budget/(o.rows.length===2?(m.id==='families'?1.2:1.55):1))-1),-12,2));
   return clamp(affinity*fit*value*(o.d.target===m.id?2:1)*(1+o.loyalty)*(o.switched?.9:1)/Math.pow(o.p.menu.length,.55),.00001,5);
  });
  const outside=active.length*1.25*(e.segment===m.id||!e.segment?(e.outside||1):1),total=weights.reduce((a,b)=>a+b,0)+outside;
  // Flooring conserves visits; fractional residuals choose the outside option.
  offers.forEach((o,i)=>{const n=Math.floor(visits*weights[i]/total);o.desired+=n;o.segments[m.id]=n;});
 }
 for(const o of offers){
  const sold=Math.min(o.stock,o.desired),record=out[o.p.userId];let remaining=sold*o.price;
  o.rows.forEach((row,i)=>{const r=record.items[row.entry.id],revenue=i===o.rows.length-1?remaining:Math.round(sold*o.price*row.entry.price/o.raw);remaining-=revenue;r.units+=sold;r.orders+=sold;r.demand+=o.desired;r.revenue+=revenue;r.discount+=sold*row.entry.price-revenue;});
  record.transactions+=sold;
  const satisfaction=clamp(78-(o.price/o.ref-1)*24+(o.s.id==='premium'?6:0)-(o.switched?5:0)-(o.desired>sold?12:0),15,98);
  record.satisfaction+=satisfaction*sold;record.weight+=sold;
  const shares=Object.entries(o.segments).map(([id,n])=>({id,exact:sold*n/Math.max(1,o.desired),count:Math.floor(sold*n/Math.max(1,o.desired))}));let residual=sold-shares.reduce((n,x)=>n+x.count,0);for(const x of [...shares].sort((a,b)=>(b.exact-b.count)-(a.exact-a.count))){if(residual--<=0)break;x.count++;}shares.forEach(x=>record.customers[x.id]=(record.customers[x.id]||0)+x.count);
 }
 // Loss-leader cross-sales are bounded by actual lead purchases and remaining stock.
 for(const p of active){const rec=out[p.userId],d=rec.plan;if(d.strategy==='loss-leader'){
  const lead=rec.items[d.focus];const companion=Object.values(rec.items).filter(x=>x.id!==d.focus&&x.price>x.unitCost).sort((a,b)=>(b.price-b.unitCost)-(a.price-a.unitCost))[0];
  if(companion){const extras=Math.min(companion.prepared-companion.units,Math.floor(lead.units*.25));companion.units+=extras;companion.orders+=extras;companion.demand+=extras;companion.revenue+=extras*companion.price;rec.crossSales=extras;}
 }
 for(const r of Object.values(rec.items)){
  r.leftover=r.prepared-r.units;r.missed=Math.max(0,r.demand-r.units);r.profit=r.revenue-r.cost;
  r.feedback=`${r.units} of ${r.prepared} prepared units sold. ${r.leftover} leftovers cost $${(r.leftover*r.unitCost/100).toFixed(2)} before alliance savings. ${r.missed?'Stock ran out while more customers wanted this offer.':'All customer demand for this offer was served.'}`;
 }
 rec.satisfaction=rec.weight?Math.round(rec.satisfaction/rec.weight):null;
 const introductory=d.strategy==='penetration'&&p.menu.some(entry=>g.round-entry.addedRound<=1&&entry.price/g.rules.catalog.find(x=>x.id===entry.id).expected<=.85&&rec.items[entry.id].units>=10);
 rec.loyalty=clamp(rec.loyalty+(rec.satisfaction>=70&&rec.transactions>0?.04+(introductory?.03:0):-.03),0,.18);
 }
 return out;
}
function finalize(g,players,simulation){
 const total=Object.values(simulation).reduce((n,r)=>n+r.transactions,0);
 for(const p of players){const r=p.reports.at(-1),x=simulation[p.userId];if(!x){r.business={strategy:'skipped',strategyName:'Skipped service',targetName:'No service',transactions:0,customers:{},satisfaction:null,loyalty:p.reports.at(-2)?.business?.loyalty||0,marketTransactions:total,marketShare:0,coreProfit:0,cogs:0,waste:0,grossProfit:0,operatingExpenses:r.fees,netMargin:null,notes:['No customer sales this round. Existing bonuses and transfers are still included in net profit.'],scenario:null};continue;}const d=x.plan,s=strategy(g,p),m=defs(g).markets.find(m=>m.id===d.target);
  r.strategyFee=x.strategyFee;r.fees+=x.strategyFee;r.profit-=x.strategyFee;
  const cogs=r.items.reduce((n,item)=>n+Math.round(item.cost*item.units/item.prepared),0),waste=r.cost-cogs;
  const scenario=defs(g).scenarios.find(q=>q.round===g.round);
  const avgRatio=r.items.reduce((n,item)=>n+item.price/g.rules.catalog.find(q=>q.id===item.id).expected,0)/Math.max(1,r.items.length);
  const notes=[`You used ${s.name} and focused on ${m.name.toLowerCase()}. Prices averaged ${Math.round(avgRatio*100)}% of the menu’s typical prices.`,
   `${x.customers[d.target]||0} transactions came from your target group. Other groups could still choose your restaurant.`,
   `Your strategy cost $${(x.strategyFee/100).toFixed(2)}. Unsold stock cost $${(waste/100).toFixed(2)} after alliance savings.`,
   `Market event: ${event(g).description}`];
  if(d.strategy==='premium')notes.push(m.sensitivity>2?'Your target customers are price-sensitive. Premium presentation helps some customers, but it does not remove resistance to high prices.':'This target market values presentation; higher prices still reduce willingness to buy as they rise.');
  if(d.strategy==='loss-leader')notes.push(`${x.crossSales||0} extra items were purchased with the loss leader. Cross-sales reach at most 25% of lead purchases; customers can buy only the discounted item.`);
  if(d.strategy==='bundle')notes.push(`The ${d.discount}% bundle discount reduced sales revenue by $${(r.items.reduce((n,i)=>n+i.discount,0)/100).toFixed(2)} versus the listed individual prices. Each bundle consumed two units.`);
  if(d.strategy==='psychological')notes.push('Only .99 prices near the typical price received the modest psychological effect. It cannot overcome a severely overpriced menu.');
  if(d.strategy==='skimming')notes.push('The featured product’s novelty premium declines across its first three rounds. Keeping a launch price forever does not preserve launch demand.');
  if(d.strategy==='cost-plus')notes.push('Covering ingredient cost per unit does not guarantee profit: unsold food and business fees still need to be covered.');
  if(d.strategy==='competitive')notes.push(`Your stated plan was to ${d.position} competitors. Customers compared your actual offers with other restaurants, not just your strategy label.`);
  if(d.strategy==='penetration')notes.push('Low introductory prices can attract trial purchases; repeat-business recognition grows only after satisfactory service and is capped.');
  if(x.switched)notes.push('Changing your target or strategy since the last service reduced initial customer interest by 10% this round. There is no permanent switching penalty.');
  r.business={...d,strategyName:s.name,targetName:m.name,transactions:x.transactions,customers:x.customers,satisfaction:x.satisfaction,loyalty:x.loyalty,marketTransactions:total,coreProfit:r.revenue-r.cost-x.strategyFee,marketShare:total?x.transactions/total*100:0,cogs,waste,grossProfit:r.revenue-cogs,operatingExpenses:waste+r.fees,netMargin:r.revenue?r.profit/r.revenue*100:null,notes,scenario:scenario&&d.scenario?{question:scenario.question,selected:d.scenario,correct:d.scenario===scenario.answer,answer:scenario.answer,explanation:scenario.explanation}:null};
 }
}
module.exports={id:'pricing-v1',label:'Pricing & Customers',rules,initialize,market,checkPricing:base.checkPricing,readyError,planError,choose,publicResearch,simulateRound,finalize,calculateOffer:markup.calculateOffer,draftFields:[]};
