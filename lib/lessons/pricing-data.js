'use strict';
const strategies=[
 {id:'penetration',name:'Penetration pricing',fee:300,description:'Introduce a new item below 85% of its typical price to attract trial purchases. Good sales can build repeat business, but low margins and waste still cost money.'},
 {id:'psychological',name:'Psychological pricing',fee:200,description:'Prices ending in .99 can attract teenagers, students and value shoppers. The effect is modest and fades when the price is far above the typical price.'},
 {id:'premium',name:'Premium pricing',fee:1200,description:'Invest $12 in presentation and service. Luxury customers and professionals may accept a higher price; budget shoppers are harder to convince.'},
 {id:'loss-leader',name:'Loss leader pricing',fee:400,description:'Feature one item at or below today’s ingredient cost. Some customers add a profitable second item, but many buy only the loss leader. Requires two saved menu items.'},
 {id:'competitive',name:'Competitive pricing',fee:0,description:'Use the competitor price research to decide whether to match, undercut or exceed rivals. Your actual prices—not the label—determine value.'},
 {id:'skimming',name:'Price skimming',fee:600,description:'Feature a wild creation introduced in the last three rounds. Early adopters may pay extra at launch; that novelty fades, so consider reducing its price.'},
 {id:'bundle',name:'Bundle pricing',fee:500,description:'Sell two items together at 5–30% off their combined price. Every bundle uses one unit of each; those items are sold only in bundles this round. Requires two saved items.'},
 {id:'cost-plus',name:'Cost-plus pricing',fee:0,description:'Use the free calculator to add a chosen markup to today’s cost. It helps cover costs, but customers may not accept the result. No math quiz or penalty.'}
];
const markets=[
 {id:'teens',name:'Teenagers',sensitivity:2.3,budget:1,priorities:'Affordable treats, novelty and social buzz.',likes:['Pizza','Drinks','Desserts'],wild:1.25,premium:.9,psych:1.14},
 {id:'students',name:'College students',sensitivity:2.7,budget:.95,priorities:'Filling food, convenience and deals.',likes:['Wraps','Pizza','Bowls'],wild:1.05,premium:.85,psych:1.12},
 {id:'families',name:'Families',sensitivity:2.2,budget:1.05,priorities:'Familiar choices and good-value combinations.',likes:['Chicken','Burgers','Sides'],wild:.8,premium:.95,psych:1.06},
 {id:'professionals',name:'Working professionals',sensitivity:1.5,budget:1.2,priorities:'Reliable meals, convenience and presentation.',likes:['Wraps','Bowls','Chicken'],wild:.9,premium:1.45,psych:1},
 {id:'luxury',name:'Luxury consumers',sensitivity:.9,budget:1.4,priorities:'Distinctive products and a credible premium experience.',likes:['Burgers','Bowls','Desserts'],wild:1.2,premium:1.9,psych:.95},
 {id:'budget',name:'Budget-conscious shoppers',sensitivity:3.2,budget:.85,priorities:'Low total prices; less willing to pay for presentation.',likes:['Sides','Tacos','Wraps'],wild:.95,premium:.75,psych:1.1}
];
const events=[
 {id:'ordinary',title:'Open for business',description:'An ordinary trading day. Learn who your menu attracts.',demand:1,cost:1,segment:null,outside:1},
 {id:'price-war',title:'The rival’s giant SALE sign',description:'A nearby chain cuts prices. Customers have a more attractive alternative; value shoppers compare harder.',demand:1,cost:1,segment:'budget',outside:1.5},
 {id:'celebrity',title:'A celebrity eats across the street',description:'A competing restaurant gets celebrity attention. Luxury shoppers are more tempted to buy elsewhere.',demand:1,cost:1,segment:'luxury',outside:1.7},
 {id:'influencer',title:'The neighborhood goes viral',description:'An influencer tours local independent restaurants. Teen traffic rises 40%; wild creations receive extra interest.',demand:1,cost:1,segment:'teens',traffic:1.4,wild:1.2,outside:1},
 {id:'luxury-rival',title:'The gold-plated competitor',description:'A rival launches an exclusive menu. Luxury customers have another premium alternative.',demand:1,cost:1,segment:'luxury',outside:1.45},
 {id:'overpriced',title:'Receipt screenshots everywhere',description:'Customers share expensive receipts online. All groups compare prices more carefully today.',demand:1,cost:1,sensitivity:1.25,outside:1},
 {id:'campaign',title:'Coupons carpet the campus',description:'A chain’s campus promotion gives college students a strong alternative.',demand:1,cost:1,segment:'students',outside:1.6},
 {id:'wild-trend',title:'Weird food challenge',description:'Wild menu creations get 25% more attention. Taste and price still decide whether curiosity becomes a purchase.',demand:1,cost:1,wild:1.25,outside:1},
 {id:'supplier',title:'Supplier price surprise',description:'Ingredient costs rise 18% for every prepared unit. Review prices, waste and any loss leader.',demand:1,cost:1.18,outside:1},
 {id:'holiday',title:'Shopping holiday',description:'Potential customer visits rise 25%; families are especially interested in bundles.',demand:1.25,cost:1,segment:'families',bundle:1.2,outside:1},
 {id:'cheap-rival',title:'The suspiciously cheap lunch',description:'A new low-cost competitor tempts budget shoppers. Differentiation can matter as much as matching its price.',demand:1,cost:1,segment:'budget',outside:1.65},
 {id:'office',title:'Office lunch meetup',description:'Professional traffic rises 35%. Customers compare convenience, price and product fit.',demand:1,cost:1,segment:'professionals',traffic:1.35,outside:1}
];
const scenarios=[
 {round:3,question:'A new restaurant wants customers to try an unfamiliar menu, accepting smaller early margins. Which strategy fits that aim?',answer:'penetration',explanation:'Penetration pricing trades early margin for trial purchases. It only builds a useful customer base if customers return.'},
 {round:6,question:'A business offers a sandwich and drink together for less than buying both separately. Which strategy is this?',answer:'bundle',explanation:'Bundle pricing can grow a transaction, but the discount must cover both products’ costs.'},
 {round:9,question:'A novel product launched at a high price, then became cheaper as the novelty faded. Which strategy is this?',answer:'skimming',explanation:'Price skimming captures early willingness to pay, then adapts as the novelty advantage fades.'}
];
module.exports={strategies,markets,events,scenarios};
