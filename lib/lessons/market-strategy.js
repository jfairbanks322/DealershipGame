'use strict';
const choices=['increase','hold','decrease'];
const demandStories=[
 'The sidewalk count looks like an ordinary day. There is no special event bringing extra diners.',
 'Office workers are arriving in groups, and the lunch queue is forming earlier than usual.',
 'Your supplier is short on ingredients, but the neighborhood customer count looks normal.',
 'Rain is keeping people indoors. Fewer people are walking past the restaurants.',
 'A food festival is drawing hungry visitors into the neighborhood.',
 'Delivery trucks are arriving again. Customer traffic is back at its usual level.',
 'Customers are checking their budgets and comparing menus before buying.',
 'Weekend visitors are filling the neighborhood and treating themselves to a meal out.',
 'The streets are quieter than usual on this weekday.',
 'The final celebration is bringing a large crowd, while suppliers are charging more.'
];
function briefing(event,round){
 const direction=event.demand>1?'increase':event.demand<1?'decrease':'hold';
 return [
  {id:'demand',label:'Customer traffic',text:`${demandStories[round-1]||event.description} Expected traffic is ${direction==='increase'?'above':direction==='decrease'?'below':'close to'} a typical day.`},
  {id:'supply',label:'Supplier update',text:event.cost>1?'Ingredients are more expensive than on a typical day. Every prepared unit costs more, including food that is left over.':event.cost<1?'Deliveries have improved and ingredients are cheaper than on a typical day. Extra stock still costs money if it does not sell.':'Suppliers are charging their usual ingredient prices. Check the unit cost shown on each item.'},
  {id:'price',label:'Customer price clues',text:(event.sensitivity||1)>1?'Shoppers are especially price-conscious today. Raising prices is more likely to push buyers away.':(event.sensitivity||1)<1?'Shoppers are less price-sensitive today. Higher prices may be easier to sustain, though some customers will still walk away.':'Customers are comparing prices as usual. Lower prices tend to attract more buyers; higher prices may mean fewer sales.'}
 ];
}
function choose(game,p,b){
 const check=(ok,msg)=>{if(!ok)throw Object.assign(new Error(msg),{status:400});};
 check(game.lessonId==='supply-demand-v1','Market strategy choices belong to Supply & Demand.');
 check(['demand','supply','price'].includes(b.clue),'Choose the clue guiding your decision.');
 check([b.demand,b.price,b.stock].every(x=>choices.includes(x)),'Choose a demand forecast, price plan, and stock plan.');
 const decision={round:game.round,clue:b.clue,demand:b.demand,price:b.price,stock:b.stock};
 p.marketStrategies??=[];
 const i=p.marketStrategies.findIndex(x=>x.round===game.round);
 if(i<0)p.marketStrategies.push(decision);else p.marketStrategies[i]=decision;
 return decision;
}
function readyError(game,p){return (p.marketStrategies||[]).some(x=>x.round===game.round)?null:'Read this round’s market clues and save your strategy before submitting.';}
module.exports={briefing,choose,readyError};
