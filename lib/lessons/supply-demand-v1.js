'use strict';
const markup = require('./markup-v1');
const events = [
 {title:'Opening day',description:'Normal foot traffic. Learn how your price and stock affect sales.',demand:1,cost:1},
 {title:'Lunch rush',description:'More customers are eating out. Demand rises for every item.',demand:1.3,cost:1},
 {title:'Supplier shortage',description:'Ingredients cost more this round. Consider your price and how much to prepare.',demand:1,cost:1.3},
 {title:'Rainy afternoon',description:'Fewer customers are visiting restaurants. Unsold stock still costs money.',demand:.7,cost:1},
 {title:'Food festival',description:'A festival brings hungry visitors to the neighborhood.',demand:1.5,cost:1.05},
 {title:'Delivery recovery',description:'Ingredient supplies recover and unit costs fall.',demand:1,cost:.8},
 {title:'Budget-conscious customers',description:'Customers have less to spend and respond more strongly to prices.',demand:.95,cost:1,sensitivity:1.5},
 {title:'Weekend crowd',description:'More customers are out, and they are less sensitive to prices.',demand:1.25,cost:1,sensitivity:.75},
 {title:'Quiet weekday',description:'Foot traffic falls again. Review your earlier sales before stocking up.',demand:.8,cost:1},
 {title:'Final celebration',description:'One last busy service. Balance missed sales against leftover food.',demand:1.4,cost:1.1}
];
const rules={...structuredClone(markup.rules),mathChecks:false,practiceRounds:10,promotionsFromRound:11,promotions:[markup.rules.promotions[0]],events};
function market(game){const event=(game.rules||rules).events[game.round-1];return {...event,clues:require("./market-strategy").briefing(event,game.round)};}
function checkPricing(item,b){
 const price=Number(b.price),stock=Number(b.stock);
 if(!String(b.price??'').trim()||!Number.isFinite(price)||price<.25||price>50||Math.abs(price*100-Math.round(price*100))>1e-7||!String(b.stock??'').trim()||!Number.isInteger(stock)||stock<1||stock>200){const e=new Error('Choose a price from $0.25 to $50.00 and prepare 1–200 units.');e.status=400;throw e;}
 return {correct:true,price:Math.round(price*100),markup:0,menuPatch:{price:Math.round(price*100),stock,markup:Math.round((price*100/item.cost-1)*100)},message:'Price and stock saved. No calculation required.'};
}
function simulateItem(game,p,entry,players){
 const product=game.rules.catalog.find(x=>x.id===entry.id),event=market(game);
 const rivals=players.filter(q=>q!==p&&q.skippedRound!==game.round).flatMap(q=>q.menu.filter(x=>x.id===entry.id));
 const competition=rivals.length ? Math.max(.6,Math.min(1.25,1+(.15*((rivals.reduce((a,x)=>a+x.price,0)/rivals.length-entry.price)/product.expected)))) : 1;
 const demand=Math.max(0,Math.round(product.popularity*event.demand*Math.exp(-product.sensitivity*(event.sensitivity||1)*(entry.price/product.expected-1))*competition/Math.pow(p.menu.length,.38)));
 const units=Math.min(entry.stock,demand),unitCost=Math.round(product.cost*event.cost),cost=entry.stock*unitCost,revenue=units*entry.price;
 return {...entry,name:product.name,icon:product.icon,category:product.category,orders:units,units,demand,prepared:entry.stock,leftover:entry.stock-units,missed:Math.max(0,demand-units),unitCost,revenue,cost,fee:0,profit:revenue-cost,promoted:false,feedback: demand>entry.stock?'Sold out: more customers wanted this item than you prepared.':units<entry.stock?'Leftover food: try less stock or a more attractive price.':'Your stock matched customer demand.'};
}
module.exports={id:'supply-demand-v1',label:'Supply & Demand',rules,market,checkPricing,simulateItem,readyError:(g,p)=>markup.readyError(g,p)||require("./market-strategy").readyError(g,p),calculateOffer:markup.calculateOffer,draftFields:[]};
