'use strict';
const crypto = require('node:crypto');
const price = 500;
// Amount is the outcome credit (negative for an extra expense), before the $5 box price.
const outcomes = [
 ['Golden Spatula', 'A collector pays for Paulie’s “lightly legendary” spatula. It still smells like Tuesday.',2000],
 ['Emergency Cheese', 'A neighboring diner buys your surplus cheese. Paulie calls it liquid assets. It is not liquid yet.',1800],
 ['Celebrity Napkin', 'Someone buys a napkin allegedly signed by a famous chef. The signature says “Paulie.”',1600],
 ['Coupon Confetti', 'The coupons are actually valid. Paulie looks more surprised than you.',1400],
 ['Lucky Pickle', 'A customer tips extra after meeting your emotional-support pickle.',1200],
 ['Tiny Billboard', 'A hamster-sized billboard attracts one unusually generous customer.',1000],
 ['Sauce Windfall', 'Your mystery sauce wins a tiny local prize. Nobody can identify the flavor.',2000],
 ['Dancing Potato', 'A potato that resembles your principal sells to an enthusiastic collector.',1800],
 ['Accidental Catering', 'The box contains a prepaid order. For once, Paulie brought paperwork.',1600],
 ['Retro Menu', 'A vintage menu sells online. Apparently “soup in a cone” was ahead of its time.',1400],
 ['Fork Fortune', 'A café buys your extra forks. You have successfully diversified into pokey things.',1200],
 ['Mascot Side Hustle', 'Your inflatable chicken earns a small appearance fee. Its agent takes no cut.',1000],
 ['Cash in the Apron', 'A forgotten tip falls out of an apron. Paulie insists this was the business plan.',1500],
 ['Glitter Gravy', 'The gravy is craft glitter. Pay for cleanup before the fries become fabulous.',-200],
 ['Kazoo Delivery', 'Forty kazoos arrive instead of straws. Pay a small return fee. HOOOOONK.',-300],
 ['Dramatic Onions', 'These onions make the entire staff cry about their career choices. Buy tissues.',-400],
 ['Escaped Dough', 'The dough expands out of the box. Pay for a replacement storage tub.',-500],
 ['Squeaky Cart', 'The cart squeaks in B-flat. A little repair keeps it out of the school band.',-600],
 ['Tiny Aprons', 'The aprons only fit breadsticks. Pay to exchange them for people-sized ones.',-700],
 ['Wrong-Side Stickers', 'Every label says “BOTTOM” on the top. Buy replacement labels and question reality.',-800],
 ['Disco Lettuce', 'The lettuce comes with a broken disco light. Pay its recycling fee.',-900],
 ['Haunted Toaster', 'It only toasts the word “BOO.” A small service call removes its artistic ambitions.',-1000],
 ['Leaky Mustard', 'The mustard escaped. Buy cleaning supplies for the world’s least exciting yellow brick road.',-500],
 ['Singing Receipt', 'The receipt printer sings every total. Pay to switch it back to its indoor voice.',-400],
 ['Bubble-Wrap Buffet', 'The packaging is enormous. Pay a disposal fee after everybody finishes popping it.',-300],
 ['Invisible Sandwich', 'Paulie says it is there. Your accountant says it is not. No extra effect.',0],
 ['Box Inside a Box', 'Inside is another box, containing a note: “You’re welcome.” No extra effect.',0],
 ['Certified Air', 'Premium truck air, locally sourced from the parking lot. No extra effect.',0],
 ['Retired Rubber Duck', 'It has seen things. It refuses to elaborate. No extra effect.',0],
 ['Motivational Crumb', 'A single crumb and a note saying “Think bigger.” No extra effect.',0],
].map(([title,description,amount],i)=>({id:i+1,title,description,amount,kind:amount>0?'reward':amount<0?'mishap':'nothing'}));
const vinniePrice = 30000;
const stories = require('./vinnie-stories');
const vinnieOutcomes = outcomes.map((o,i) => ({...o, title:stories[i][0], description:stories[i][1], amount:o.kind === 'nothing' ? 0 : vinniePrice + (o.amount-price)*10}));
const offer = round => round >= 6
  ? {vendor:'Vinnie',price:vinniePrice,outcomes:vinnieOutcomes}
  : {vendor:'Paulie',price,outcomes};
const expense=(p,round)=>(p.mysteryBoxes||[]).filter(x=>x.round===round).reduce((n,x)=>n+x.price-x.amount,0);
function buy(g,p,draw=()=>crypto.randomInt(outcomes.length)) {
 const check=(ok,message)=>{if(!ok)throw Object.assign(new Error(message),{status:400});};
 check(require('./classroom').settings(g).boxes,'The teacher disabled mystery boxes.');
 check(g.phase==='planning'&&!g.paused&&g.round>=2&&!p.ready&&p.skippedRound!==g.round,'Visit Paulie during open planning from round 2, before submitting.');
 check(!(p.mysteryBoxes||[]).some(x=>x.round===g.round),'Only one mystery box per round. Paulie has standards.');
 const box = offer(g.round);
 check(require('./achievements').sum(p)>=box.price,`You need $${box.price/100} in earned profit to buy this box.`);
 const outcome=box.outcomes[draw()];
 const result={...outcome,round:g.round,vendor:box.vendor,price:box.price,net:outcome.amount-box.price};
 (p.mysteryBoxes??=[]).push(result);return result;
}
module.exports={price,outcomes,vinniePrice,vinnieOutcomes,offer,expense,buy};
