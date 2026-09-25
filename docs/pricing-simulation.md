# Pricing & Customers: integration and simulation rules

## Starting a game

Teachers choose **Pricing & Customers** for new rooms. It replaces Supply & Demand in the creation menu. Published legacy lesson IDs remain readable, so existing Supply & Demand rooms and their leaderboard retain their original rules. Cost & Markup, markdown calculations, and their accounts/scores are unchanged. Each lesson has its own career leaderboard.

The new lesson keeps ten teacher-controlled rounds, one new menu item each round, the 134-item catalog, profiles, themes, storefronts, alliances, sabotage, mystery boxes, Flash Challenges, saved progress, reset/delete, and live teacher controls. Non-math games require prices and stock but never require a markup answer or charge a math penalty.

## Student flow

1. Review the market event, six customer profiles, and prior-round category price research.
2. Save a target market and one of eight pricing strategies.
3. Add the round's product, set prices and stock, and revisit existing products.
4. Configure featured products when using a loss leader, a bundle, or skimming. The checklist checks these mechanical requirements, not whether the strategy is wise.
5. Submit. Only after simulation do strategy explanations and optional scenario feedback appear.
6. Use customer purchases, satisfaction, waste and profits to adjust next round.

A free cost-plus calculator suggests a selling price from current ingredient cost and a chosen markup. It does not grade students or force the suggested price. Three optional strategy scenarios appear in rounds 3, 6 and 9, with no money effects or submission requirement.

## Customer model

Customer profiles are simplified classroom assumptions, not claims that demographic groups always behave alike. Profiles represent teenagers, college students, families, professionals, luxury consumers and budget shoppers. Each has category interests, novelty preferences, price sensitivity and a willingness-to-pay reference.

Each round supplies 18 potential visits per active restaurant per segment, modified by the announced event. All restaurants compete for these visits, plus a simulated outside option. Purchase weights combine:

- The offer's actual price relative to the product reference and segment budget.
- Product category and novelty fit.
- A 2x preference weight for the selected target segment (not a guarantee of twice as many sales).
- Conditional strategy effects, bounded repeat-business recognition, and a temporary 10% interest reduction when changing strategy or target.
- Menu-size normalization so adding many products does not create unlimited customers.

Visits are allocated proportionally; fractional visits choose the outside option. Unfilled demand is reported as missed sales rather than sold twice elsewhere. Stock caps all realized sales. Bundles have additional total-bill sensitivity, especially outside the family segment. A customer transaction can contain two bundled units or a loss-leader add-on, so transactions and units are different measures.

## Strategy rules

- **Penetration:** trial interest increases only for items added in the current/prior round and priced at 85% or less of typical price. Satisfactory introductory sales can grow recognition faster. Investment $3.
- **Psychological:** a modest segment-specific effect applies to actual .99 prices below 140% of typical price. Investment $2.
- **Premium:** an investment in presentation changes segment appeal at prices at least 110% of typical. Luxury consumers and professionals value it more; value shoppers can value it less. Investment $12.
- **Loss leader:** a featured item must be priced at/below today's ingredient cost, with at least two menu items. At most 25% of actual lead purchases add a profitable second item, subject to remaining stock. Investment $4.
- **Competitive:** student menu prices compete directly with other offers. Match/undercut/exceed records intent; selecting the label does not add a hidden bonus. No investment fee.
- **Skimming:** a featured wild item introduced within three rounds gets a fading novelty effect among early adopters. Investment $6. The student still decides whether to lower its price.
- **Bundle:** two distinct saved products sell only together this round at 5–30% off their sum. Each sale uses one of each product; revenue is allocated in integer cents with an exact remainder. Other products remain individual offers. Investment $5.
- **Cost-plus:** free pricing calculator and no strategy fee. Actual customer demand still decides whether the suggested price works.

Recognition stays between 0% and 18% and decays; switching penalties last only one round. No customer visits or sales are awarded simply for choosing a strategy. Prices stay within $0.25–$50 and prepared stock within 1–200 per item.

## Events and persistence

Opening day is followed by nine events randomly selected without replacement from eleven possibilities. The schedule is saved in the game's rules at creation. Reloads and retries do not reroll it. Events change observable factors: ingredient cost, segment traffic, novelty appeal, outside competition, bundle appeal or price sensitivity. Students see the current event before decisions. Examples include a supplier increase, influencer attention, competing promotions, viral wild foods, and a shopping holiday.

## Financial accounting

All money is integer cents. Full prepared ingredient cost includes unsold food. After alliance savings:

- Cost of goods sold is the sold portion of prepared ingredient cost, rounded per item.
- Waste expense is prepared cost minus cost of goods sold, conserving cents.
- Gross profit = revenue − cost of goods sold.
- Net profit = gross profit − waste − other net expenses.
- Other expenses include the strategy investment and existing bonuses, credits and transfers.

The new strategy fee is charged once during simulation. Flash prizes and sales theft retain their existing settlement rules. Bundle discounts reduce recorded revenue rather than being charged again as an expense. The final report ranks profit, not revenue, and shows strategy trading profit separately from optional bonus/attack effects. Classroom market share measures transactions among student restaurants, excluding the simulated outside option. Skipped rounds contribute zero transactions to that denominator.

## Verification and limits

Tests exercise every strategy/segment combination, finite stock and visits, price extremes, bundle cents, loss-leader add-on limits, temporary switching, events, snapshots, delayed scenario disclosure, ten-round results and existing mechanics. A balance sweep varies customers, prices and stock and requires multiple winning strategies. This is evidence against an obvious dominant choice in those scenarios, not a guarantee of perfect balance; classroom play can guide later tuning under a new lesson version.
