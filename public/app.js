function isSupply() { return game?.lesson?.id === 'supply-demand-v1'; }
function competitionFeedback(r) {
 return `<div class="competition-feedback" role="status"><h3>What this situation teaches</h3>${r.answers.map(a=>`<article><strong>${esc(a.name)}: ${a.correctType==='direct'?'direct':'indirect'} competition</strong><p>You chose ${esc(a.type)} · ${a.classificationCorrect?'Correct classification':'Review the distinction'}.<br>Your reason: ${esc(a.reasonLabel)} · ${a.reasonCorrect?'Fits this situation':'Needs a different explanation'}.</p><p>${esc(a.explanation)}</p></article>`).join('')}${r.strategy?`<p><strong>Your response: ${esc(r.strategyLabel)}</strong><br>Your reasoning: ${esc(r.strategyReasonLabel)}<br>${r.strategyReasonCorrect?'Your explanation matches the response.':'Review the tradeoff: '+esc(r.strategyExplanation)}</p>`:''}<p class="tiny">These answers are saved. Wrong answers add no penalty and do not stop you from submitting the round. Strategy understanding and business profit are different measures.</p></div>`;
}
function competitionPanel() {
 const c=game.competition;if(!isSupply()||!c?.enabled)return '';
 const b=c.briefing,p=game.player,locked=p.ready||game.paused||p.skippedRound===game.round;
 const options=list=>`<option value="">Choose an answer</option>${list.map(x=>`<option value="${x.id}">${esc(x.label)}</option>`).join('')}`;
 return `<section class="card competition-panel" style="margin-bottom:20px"><span class="eyebrow">COMPETITION CHALLENGE · ${game.round<=2?'IDENTIFY':game.round<=5?'IDENTIFY & RESPOND':'COMPARE & RESPOND'}</span><h2>${esc(b.title)}</h2><p>${esc(b.context)}</p><details><summary>Direct or indirect?</summary><p>Direct competitors offer similar products or services to the same customers for the same occasion. Indirect competitors meet the same need in a different way. Being nearby or having a particular business name is not enough to decide.</p></details>${c.response?competitionFeedback(c.response):`<form id="competition-form" class="stack">${b.cases.map(q=>`<fieldset><legend>${esc(q.name)}</legend><p>${esc(q.text)}</p><label>What kind of competition is this?<select name="type-${q.id}" required ${locked?'disabled':''}>${options([{id:'direct',label:'Direct competition'},{id:'indirect',label:'Indirect competition'}])}</select></label><label>Why does it fit that classification?<select name="reason-${q.id}" required ${locked?'disabled':''}>${options(b.reasons)}</select></label></fieldset>`).join('')}${b.strategies.length?`<h3>Choose your business response</h3><p>Several responses can be reasonable. Read each tradeoff, then choose one. This choice changes the simulation; your menu prices and stock still need your decisions.</p>${b.strategies.map(x=>`<p><strong>${esc(x.label)}:</strong> ${esc(x.description)}</p>`).join('')}<label>My response<select name="competitionStrategy" required ${locked?'disabled':''}>${options(b.strategies)}</select></label><label>Why this response?<select name="competitionReason" required ${locked?'disabled':''}>${options(b.strategyReasons)}</select></label>`:'<p>These first two challenges are practice in classification. They do not change sales or costs.</p>'}<button class="btn secondary" ${locked?'disabled':''}>Save answers & see feedback</button><p class="tiny">One answer submission per round. You can proceed after feedback even if an answer is wrong.</p></form>`}</section>`;
}
function competitionRecap(r) {
 if(!r?.competition)return '';const c=r.competition;
 return `<section class="card" style="margin:20px 0"><span class="eyebrow">COMPETITION DEBRIEF</span><h2>${esc(c.title)}</h2><p>${esc(c.feedback)}</p>${c.strategy?`<p>Your response: <strong>${esc(c.strategyLabel)}</strong><br>Campaign / helper cost: ${cash(r.competitionFee||0)} (included in round fees).${c.effects.cost>1?' The distinctive ingredients are included in food costs.':''}</p>`:''}${competitionFeedback(c)}<p>Compare your price, units sold, leftovers, and profit. What would you keep or change next round?</p></section>`;
}
function competitionTeacher() {
 if(!isSupply())return '';const active=game.competition.enabled,locked=!['lobby','results'].includes(game.phase)||game.paused;
 const score=(x,key)=>`${x[key+'Right']} / ${x[key+'Total']}`;
 return `<section class="card" style="margin:20px 0"><span class="eyebrow">TEACHER ONLY · OPTIONAL LESSON</span><h2>Direct & indirect competition</h2><button class="btn secondary" data-competition-toggle="${!active}" ${locked?'disabled':''}>Competition challenges: ${active?'ON':'OFF'} · ${active?'turn off':'turn on'}</button><p>Enable before starting or between rounds. Rounds 1–2: classification. Rounds 3–5: classification and a response. Rounds 6–10: direct and indirect competitors together. No markup calculations or wrong-answer penalties.</p><p>Counts below show <strong>right / answered</strong>. The first saved answers are retained after feedback; profit is not an understanding score. Response reasoning checks whether the explanation matches the chosen strategy, not whether that strategy earned the most money.</p><div class="table-wrap"><table><thead><tr><th>Owner</th><th>Round classification</th><th>Round reason</th><th>Round response reasoning</th><th>Game classification</th><th>Game reason</th><th>Game response reasoning</th><th>Current response</th></tr></thead><tbody>${(game.competitionTracker||[]).map(p=>`<tr><td>${esc(p.owner)}</td><td>${score(p.round,'classification')}</td><td>${score(p.round,'reason')}</td><td>${score(p.round,'strategyReason')}</td><td>${score(p.total,'classification')}</td><td>${score(p.total,'reason')}</td><td>${score(p.total,'strategyReason')}</td><td>${esc(p.current?.strategyLabel||'—')}</td></tr>`).join('')}</tbody></table></div>${(game.competitionTracker||[]).filter(p=>p.history.length).map(p=>`<details><summary>${esc(p.owner)} · answer history</summary>${p.history.map(r=>`<h3>Round ${r.round}: ${esc(r.title)}</h3>${competitionFeedback(r)}`).join('')}</details>`).join('')}</section>`;
}
function marketCard() {
  const m=game.market;
  return `<section class="card soft" style="margin-bottom:20px"><span class="eyebrow">SUPPLY & DEMAND · ROUND ${game.round}</span><h2>${esc(m.title)}</h2><p>${esc(m.description)}</p><div class="grid3">${m.clues.map(c=>`<div><h3>${esc(c.label)}</h3><p>${esc(c.text)}</p></div>`).join('')}</div><p class="tiny muted">Lower prices tend to attract more buyers. Other restaurants selling the same item also influence demand. You pay for every unit prepared; leftovers expire after each round.</p></section>`;
}
function strategyPanel() {
  const p=game.player,decision=(p.marketStrategies||[]).find(x=>x.round===game.round),locked=p.ready||game.paused||p.skippedRound===game.round;
  const options=(selected,labels)=>`<option value="">Choose a response</option>${['increase','hold','decrease'].map((v,i)=>`<option value="${v}" ${selected===v?'selected':''}>${labels[i]}</option>`).join('')}`;
  return `<section class="card strategy-panel" style="margin-bottom:20px"><h2>Your market strategy</h2><p>Use the clues above to make a plan. There is no single guaranteed winning strategy, and no calculation to answer. Then set your actual menu prices and stock to put your plan into action.</p><form id="strategy-form" class="stack"><label>Which clue most influenced your decision?<select name="clue" required ${locked?'disabled':''}><option value="">Choose your main clue</option>${game.market.clues.map(c=>`<option value="${c.id}" ${decision?.clue===c.id?'selected':''}>${esc(c.label)}</option>`).join('')}</select></label><div class="grid3"><label>Customer demand versus a typical day<select name="demandForecast" required ${locked?'disabled':''}>${options(decision?.demand,['More customers','About the same','Fewer customers'])}</select></label><label>My price plan versus a typical day<select name="pricePlan" required ${locked?'disabled':''}>${options(decision?.price,['Aim higher','Keep it typical','Aim lower'])}</select></label><label>My stock plan versus a typical day<select name="stockPlan" required ${locked?'disabled':''}>${options(decision?.stock,['Prepare more','Keep it typical','Prepare less'])}</select></label></div><button class="btn secondary" ${locked?'disabled':''}>${decision?'Update strategy':'Save strategy'}</button></form>${decision?'<p class="success" role="status">Strategy saved for this round. Review your actual prices and stock below before submitting.</p>':'<p class="tiny muted">Required each round before you submit. A plan does not change your menu automatically.</p>'}</section>`;
}
function strategyRecap(report) {
  const d=report?.marketStrategy;if(!d)return '';
  const words={increase:'higher',hold:'typical',decrease:'lower'},clue=game.market.clues.find(x=>x.id===d.clue);
  return `<section class="card" style="margin:20px 0"><h3>Your plan and the results</h3><p>You focused on <strong>${esc(clue?.label||d.clue)}</strong>, expected <strong>${words[d.demand]} demand</strong>, and planned <strong>${words[d.price]} prices</strong> with <strong>${words[d.stock]} stock</strong>.</p><p>Compare your plan with the actual sales, leftovers, missed sales, and profit below. Did your decisions match the clue? What would you change?</p></section>`;
}

function supplyStudent() {
  const p=game.player, added=p.menu.some(x=>x.addedRound===game.round), skipped=p.skippedRound===game.round, locked=p.ready||game.paused||skipped;
  if(game.phase==='lobby') return `${heading()}<div class="welcome"><h2>Your restaurant is ready for business.</h2><p>Supply & Demand: choose prices and stock, respond to market changes, and see what customers buy. No calculation answers or math penalties.</p><p>Waiting for your teacher to start.</p></div>${leaderboard()}`;
  const report=p.reports.at(-1);
  if(game.phase!=='planning') return `${heading()}${marketCard()}${strategyRecap(report)}${competitionRecap(report)}${report.skipped?'<div class="card"><h2>Your restaurant sat this round out.</h2><p>Your saved menu is ready for your return.</p></div>':`<div class="stats">${stat('Round profit',cash(report.profit),'All prepared food is included in costs')}${stat('Sold',report.units,'Units customers bought')}${stat('Left over',report.items.reduce((a,x)=>a+x.leftover,0),'Unsold units expire')}${stat('Missed sales',report.items.reduce((a,x)=>a+x.missed,0),'Demand beyond your stock')}</div><section class="card"><h2>What happened at your counter?</h2><div class="table-wrap"><table><thead><tr><th>Item</th><th>Price</th><th>Prepared</th><th>Wanted</th><th>Sold</th><th>Left over</th><th>Profit</th></tr></thead><tbody>${report.items.map(x=>`<tr><td>${esc(x.name)}</td><td>${cash(x.price)}</td><td>${x.prepared}</td><td>${x.demand}</td><td>${x.units}</td><td>${x.leftover}</td><td>${cash(x.profit)}</td></tr>`).join('')}</tbody></table></div>${report.items.map(x=>`<p><strong>${esc(x.name)}:</strong> ${esc(x.feedback)}</p>`).join('')}<div class="math-note"><strong>Discuss:</strong> Did you lose more opportunities from a shortage or from leftovers? What would you change next round?</div></section>`}<section class="card" style="margin-top:20px"><h2>${game.phase==='complete'?'Season complete':'Waiting for the next round'}</h2><p>Total profit: <strong>${cash(game.sabotage.balance)}</strong></p>${leaderboard()}</section>`;
  const item=game.catalog.find(x=>x.id===selected),entry=p.menu.find(x=>x.id===selected),input=pricingInput;
  return `${heading()}${marketCard()}${competitionPanel()}${strategyPanel()}${locked?`<div class="notice">${skipped?'Your teacher skipped this round. Your saved menu is kept.':game.paused?'Your teacher paused this round.':'Your decisions are submitted.'}</div>`:''}<div class="stats">${stat('Total profit',cash(game.sabotage.balance),'Across completed rounds')}${stat('New item',added?'1 of 1 added':'0 of 1 added','One new menu item each round')}${stat('Menu size',p.menu.length,'Review prices and stock each round')}${stat('Mode','Strategy','No math checks or penalties')}</div><div class="workspace"><div><section class="card"><h2>Your menu</h2><p class="muted">Saved prices and stock repeat next round unless you change them. Stock is prepared fresh each round.</p><div class="menu-strip">${p.menu.map(x=>`<button class="menu-item" data-select="${x.id}" ${locked?'disabled':''}>${foodArt(x.id,'menu-food')}<strong>${esc(game.catalog.find(i=>i.id===x.id).name)}</strong>${cash(x.price)} · ${x.stock} units</button>`).join('')||'<p>Choose your first item below.</p>'}</div></section><h2 style="margin-top:24px">${added?'New item added · 1 of 1':'Choose one new item'}</h2><div class="catalog">${game.catalog.filter(i=>!p.menu.some(x=>x.id===i.id)).map(i=>`<button class="product" data-select="${i.id}" ${added||locked?'disabled':''}>${foodArt(i.id)}<h3>${esc(i.name)}</h3><p>Cost today: ${cash(Math.round(Math.round(i.cost*game.market.cost)*(game.competition?.effects?.cost||1)))}</p></button>`).join('')}</div><div class="card" style="margin-top:20px"><p>One new item is required. Existing items keep their saved decisions unless you update them.</p><button class="btn orange" data-action="ready" ${!added||locked||!(p.marketStrategies||[]).some(x=>x.round===game.round)||(game.competition?.enabled&&!game.competition.response)?'disabled':''}>Submit round ${game.round} →</button>${p.ready&&!game.paused?'<button class="btn secondary" data-action="unready">Reopen my submission</button>':''}</div></div><aside class="card price-panel" id="pricing-panel">${item&&!locked?`<span class="eyebrow">PRICE & STOCK</span>${foodArt(item.id)}<h2>${esc(item.name)}</h2><p>Cost per prepared unit today: <strong>${cash(Math.round(Math.round(item.cost*game.market.cost)*(game.competition?.effects?.cost||1)))}</strong></p><p class="muted">Typical customer price: ${cash(item.expected)}. Try a lower price for volume, or a higher price for more revenue per sale.</p><form id="pricing-form" class="stack" data-item="${item.id}"><label>Selling price ($)<input name="price" type="number" min="0.25" max="50" step="0.01" value="${esc(input.price??(entry?entry.price/100:item.expected/100))}" required></label><label>Units to prepare<input name="stock" type="number" min="1" max="200" step="1" value="${esc(input.stock??entry?.stock??40)}" required></label><p class="tiny muted">Every unit costs money, even if it does not sell. Unfinished choices do not save.</p><button class="btn full">Save price & stock</button></form>${feedback?`<div class="feedback success">${esc(feedback.message)}</div>`:''}`:'<h2>Make your next decision.</h2><p>Choose an item to set its price and stock. You make the decisions; the game handles the calculations.</p>'}</aside></div>`;
}
"use strict";
const root = document.querySelector("#app");
const avatarDefs = window.CounterAvatars;
const foodArt = (id, cls = "") =>
  `<span class="food-art ${cls}">${window.CounterFoodArt(id)}</span>`;
let badgeFilter = "all";
let teacherEntry = false;
const restaurantOptions = window.RestaurantOptions;
let lessonChoices = [{ id: "cost-markup-v1", label: "Cost & Markup" }];
let registrationAvatar = "chef";
let theme = matchMedia("(prefers-color-scheme: dark)").matches
  ? "dark"
  : "light";
try {
  const saved = localStorage.getItem("counter-theme");
  if (["light", "dark"].includes(saved)) theme = saved;
} catch {}
document.documentElement.dataset.theme = theme;
function themeButton() {
  return `<button type="button" class="btn ghost small theme-toggle" data-action="theme" aria-label="Switch to ${theme === "dark" ? "light" : "dark"} mode">${theme === "dark" ? "☀ Light" : "☾ Dark"}</button>`;
}
function avatarArt(id, cls = "") {
  const a = avatarDefs.find((x) => x.id === id) || avatarDefs[0];
  return `<span class="owner-art ${cls}" title="${a.name}">${a.svg}</span>`;
}
function avatarPicker(id, registering = false) {
  return `<div class="avatar-options ${registering ? "compact" : ""}" role="group" aria-label="Choose your player avatar">${avatarDefs.map((a) => `<button type="button" class="avatar-choice ${a.id === id ? "selected" : ""}" data-avatar="${a.id}" data-registering="${registering}" aria-label="${a.name}" aria-pressed="${a.id === id}">${avatarArt(a.id)}<span>${a.name}</span></button>`).join("")}</div>`;
}
function profilePage() {
  return `<div class="page-heading"><div><span class="eyebrow">MEET THE PERSON BEHIND THE COUNTER</span><h1>Your owner identity.</h1><p class="muted">Pick your kitchen sidekick. Your avatar follows you across games and leaderboards.</p></div></div><section class="card avatar-profile"><div class="owner-showcase">${avatarArt(user.avatar, "hero-avatar")}<h2>${esc(user.name)}</h2><span class="pill">${avatarDefs.find((a) => a.id === user.avatar)?.name || "Chef Sprout"}</span><p class="muted">${user.badges.length} badges earned</p></div><div><h2>A whole crew of possibilities.</h2><p class="muted">Select an avatar to save it to your account.</p>${avatarPicker(user.avatar)}</div></section>`;
}
let user = null,
  games = [],
  badgeDefs = [],
  game = null,
  page = "home",
  authTab = "register",
  selected = null,
  feedback = null,
  boardData = [],
  boardMode = "career",
  boardLesson = "cost-markup-v1",
  projector = false,
  requestBusy = false,
  pricingInput = {},
  toastTimer;
const esc = (x) =>
  String(x ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const cash = (n) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    (n || 0) / 100,
  );
const brand =
  '<div class="brand"><span class="brand-mark">↗</span><div>counter culture<small>THE BUSINESS MATH GAME</small></div></div>';
function toast(t) {
  clearTimeout(toastTimer);
  const el = document.querySelector("#toast");
  el.textContent = t;
  el.className = "show";
  toastTimer = setTimeout(() => (el.className = ""), 6500);
}
async function api(path, body) {
  const res = await fetch("/api" + path, {
    method: body === undefined ? "GET" : "POST",
    headers: body === undefined ? {} : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
    keepalive: body !== undefined,
  });
  const value = await res.json();
  if (!res.ok) { const error = new Error(value.error || "Request failed."); error.status = res.status; throw error; }
  return value;
}
function rememberBadges(ids) {
  if (!user) return;
  const added = ids.filter((id) => !user.badges.includes(id));
  user.badges = [...new Set([...user.badges, ...ids])];
  if (added.length) {
    const b = badgeDefs.find((x) => x.id === added[0]);
    if (b)
      toast(
        `${b.icon} Badge unlocked: ${b.name}\n${b.description}${added.length > 1 ? `\n+ ${added.length - 1} more in your badge collection.` : ""}`,
      );
  }
}
function apply(g) {
  if (game && (g.code !== game.code || g.round !== game.round || (g.phase === "lobby" && game.phase !== "lobby"))) { pricingInput = {}; selected = null; feedback = null; guidedOpen=false; }
  if (g.phase === "lobby") { tutorialStep = 0; tutorialReplay = false; }
  game = g;
  if (g.player) rememberBadges(g.player.badges);
  if (selected && !g.catalog.some((x) => x.id === selected)) selected = null;
}
async function refreshMe() {
  const d = await api("/me");
  user = d.user;
  games = d.games;
  badgeDefs = d.badges;
  lessonChoices = d.lessons || lessonChoices;
}
function auth() {
  return `<div class="landing"><header class="landing-header">${brand}<div class="row">${themeButton()}<button class="btn small secondary" data-action="teacher-entry">${teacherEntry ? "Student login" : "Teacher login"}</button><button class="btn ghost small" data-action="public">Global leaderboard ↗</button></div></header><div class="landing-grid"><section><span class="pill">10 ROUNDS. YOUR RESTAURANT. YOUR CALL.</span><h1>Small counter.<br><em>Big ambitions.</em></h1><p class="muted intro">Build a menu. Find your price. Turn smart math into a thriving fast-food business.</p><div class="row"><span class="pill">🍔 34 menu possibilities</span><span class="pill">🏅 ${badgeDefs.length || 70} achievements</span></div><div class="visual"><canvas id="restaurant-scene" width="900" height="280" aria-label="An illustrated fast-food restaurant"></canvas></div></section><section class="card auth-card"><div class="auth-tabs"><button data-action="register-tab" class="${authTab === "register" ? "active" : ""}">Create account</button><button data-action="login-tab" class="${authTab === "login" ? "active" : ""}">Log in</button></div><span class="eyebrow">${teacherEntry ? "TEACHER ACCESS" : "YOUR NEXT BIG IDEA STARTS HERE"}</span><h2 style="margin-top:12px">${teacherEntry ? (authTab === "register" ? "Create your teacher account." : "Welcome back, teacher.") : authTab === "register" ? "Meet the owner." : "Welcome back, boss."}</h2><p class="muted">${teacherEntry ? "Log in with your account and teacher access key to run your classroom." : authTab === "register" ? "Your restaurant journey, saved from the first order." : "Pick up right where you left off."}</p><form id="auth-form" class="stack">${authTab === "register" ? '<label>Owner display name<input name="name" autocomplete="nickname" maxlength="40" placeholder="e.g. Jordan" required></label>' : ""}<label>Username<input name="username" autocomplete="username" pattern="(?:[A-Za-z0-9_]|-){3,24}" placeholder="Your unique username" required></label><label>Password<input name="password" type="password" autocomplete="${authTab === "register" ? "new-password" : "current-password"}" minlength="8" maxlength="128" placeholder="At least 8 characters" required></label>${authTab === "register" ? `<fieldset class="avatar-fieldset"><legend>Choose your avatar</legend><input type="hidden" name="avatar" value="${registrationAvatar}">${avatarPicker(registrationAvatar, true)}</fieldset>` : ""}${teacherEntry ? '<label>Teacher access key<input name="teacherKey" type="password" autocomplete="off" placeholder="Your private classroom key" required></label>' : ""}<div id="form-error"></div><button class="btn orange full">${teacherEntry ? (authTab === "register" ? "Create teacher account" : "Teacher login") : authTab === "register" ? "Create my account" : "Log in"} →</button></form><p class="tiny muted" style="margin:18px 0 0">Your owner display name appears on leaderboards. Your username and password stay private.</p></section></div><footer class="landing-footer"><span>A little creativity. A little competition. A lot of good math.</span><span>COST + MARKUP = YOUR NEXT MOVE</span></footer></div>`;
}
function shell(body) {
  return `<div class="app-shell ${projector ? "projector" : ""}"><aside class="sidebar">${brand}<nav><button class="nav ${page === "profile" ? "active" : ""}" data-action="profile">◉ &nbsp; My avatar</button><button class="nav ${page === "home" ? "active" : ""}" data-action="home">▦ &nbsp; My businesses</button>${game ? `<button class="nav ${page === "game" ? "active" : ""}" data-action="game">🍔 &nbsp; ${game.host ? "Teacher dashboard" : "My restaurant"}</button><button class="nav ${page === "board" ? "active" : ""}" data-action="board">↗ &nbsp; Game leaderboard</button>` : ""}<button class="nav ${page === "global" ? "active" : ""}" data-action="global">◎ &nbsp; Global leaderboard</button><button class="nav ${page === "badges" ? "active" : ""}" data-action="badges">✦ &nbsp; Achievements</button></nav><div class="side-foot">BUILT ONE ROUND AT A TIME<hr>Good math. Bold menus.<br>Your business story.</div></aside><div><header class="topbar"><span class="muted">${game ? `ROOM <strong>${esc(game.code)}</strong> &nbsp; / &nbsp; ${esc(game.name)}` : "BUSINESS MATH / OWNER HQ"}</span><div class="row">${themeButton()}${user ? `<button class="avatar-trigger" data-action="profile" aria-label="Choose your avatar">${avatarArt(user.avatar)}</button>` : ""}<strong>${esc(user?.name || "Public view")}</strong><button class="btn ghost small" data-action="${user ? "logout" : "login-tab"}">${user ? "Log out" : "Log in"}</button></div></header><main class="content">${body}</main></div></div>`;
}
function home() {
  return `<div class="page-heading"><div><span class="eyebrow">${user.teacher ? "TEACHER HEADQUARTERS" : "THE OWNER’S OFFICE"}</span><h1 style="margin-top:10px">Your next chapter.</h1><p class="muted">Join your class, reopen a business, or host a new competition.</p></div><span class="pill">${user.badges.length} / ${badgeDefs.length} BADGES</span></div><div class="grid2"><section class="card"><h2>Open your restaurant</h2><p class="muted">Get a room code from your teacher. Make the place your own.</p><form id="join-form" class="stack"><label>Room code<input name="code" maxlength="6" minlength="6" placeholder="ABC123" required style="text-transform:uppercase"></label><label>Restaurant name<select name="restaurant" required><option value="">Choose from 50 restaurant names</option>${restaurantOptions.names.map((n) => `<option value="${esc(n)}">${esc(n)}</option>`).join("")}</select></label><div class="grid2"><label>Your sign<select name="icon">${restaurantOptions.signs.map((x) => `<option>${x}</option>`).join("")}</select></label><label>Restaurant color<select name="color">${restaurantOptions.colors.map((c) => `<option value="${c.value}">${c.name}</option>`).join("")}</select></label></div><div id="restaurant-preview" class="restaurant-preview"><span>🍔</span><div><strong>Pick your restaurant</strong><small>50 names · 32 signs · 16 colors</small></div></div><button class="btn">Join the kitchen →</button></form></section><section class="card soft"><span class="eyebrow">FOR TEACHERS</span><h2 style="margin-top:12px">Run the room.</h2><p class="muted">You control each round. Choose a lesson below. Saved decisions and round results are kept between sessions.</p><form id="host-form" class="stack"><label>Competition name<input name="name" maxlength="60" placeholder="Period 3 · Fast Food Founders" required></label>${user.teacher ? '<div class="success tiny">✓ Teacher access verified for this session.</div>' : '<label>Teacher access key<input name="teacherKey" type="password" autocomplete="off" required></label>'}<label>Lesson<select name="lessonId">${lessonChoices.map((l) => `<option value="${esc(l.id)}">${esc(l.label)}</option>`).join("")}</select></label><label>Math penalty increase per round after round 5 ($5 gives $5, $10, $15, $20, $25)<input name="penalty" type="number" min="0" max="20" step="0.01" value="5" required></label><button class="btn secondary">Create a classroom →</button></form></section></div><div class="section-title"><h2>Your saved games</h2><span class="muted tiny">Resume with the same account on any device</span></div><div class="stack">${games.length ? games.map((g) => `<button class="card row between" data-open="${g.code}" style="text-align:left;color:inherit"><span><strong>${esc(g.name)}</strong><br><span class="muted tiny">${g.code} · ${g.host ? "Teacher" : "Owner"}</span></span><span class="pill">ROUND ${g.round} · ${esc(g.phase)}</span><span>Open →</span></button>`).join("") : '<div class="card empty">Your first business story starts above.</div>'}</div>`;
}
function heading() {
  return `<div class="page-heading"><div><span class="eyebrow">${game.host ? "CLASSROOM CONTROL" : "YOUR RESTAURANT, YOUR RULES"}</span><h1 style="margin-top:10px">${game.host ? esc(game.name) : esc(game.player.restaurant)}</h1><p class="muted">${game.phase === "lobby" ? "The kitchen opens when your teacher starts the game." : game.phase === "complete" ? "That’s a wrap. Your ten-round business story is saved." : `Round ${game.round} of 10 · ${game.phase === "planning" ? "Make your next move." : "See what your decisions earned."}`}</p></div><span class="pill ${game.paused ? "orange" : ""}">${game.paused ? "PAUSED" : esc(game.phase.toUpperCase())}</span></div><ol class="round-rail" aria-label="Ten-round game progress">${Array.from(
    { length: 10 },
    (_, i) => {
      const n = i + 1,
        done =
          n < game.round ||
          (n === game.round && ["results", "complete"].includes(game.phase));
      return `<li class="${done ? "done" : n === game.round ? "current" : ""}" ${n === game.round ? 'aria-current="step"' : ""}><span>${done ? "✓" : n}</span><small>${isSupply() ? "Round " + n : n === 1 ? "Open" : n === 3 ? "Promos" : n === 6 ? "Game on" : n === 10 ? "Finale" : "Round " + n}</small></li>`;
    },
  ).join("")}</ol>`;
}
function stat(label, value, note) {
  return `<div class="card stat"><span class="eyebrow">${label}</span><strong>${value}</strong><small>${note}</small></div>`;
}
function leaderboard(rows = game.board) {
  return `<div class="table-wrap"><table><thead><tr><th>Rank</th><th>Restaurant</th><th>Owner</th><th>Total profit</th><th>Last round</th><th>Units served</th><th>Status</th></tr></thead><tbody>${rows.map((r) => `<tr class="${r.userId === user?.id ? "me" : ""}"><td><strong>${r.rank <= 3 ? ["🥇", "🥈", "🥉"][r.rank - 1] : "#" + r.rank}</strong>${r.previousRank != null ? `<small>${r.previousRank === r.rank ? "—" : r.previousRank > r.rank ? "↑ " + (r.previousRank - r.rank) : "↓ " + (r.rank - r.previousRank)}</small>` : ""}</td><td><strong>${esc(r.icon)} ${esc(r.restaurant)}</strong>${r.featured ? `<small>${esc(r.featuredName || badgeDefs.find((b) => b.id === r.featured)?.name || "Badge earned")}</small>` : ""}</td><td><span class="owner-cell">${avatarArt(r.avatar)}${esc(r.owner)}</span></td><td><strong>${cash(r.profit)}</strong></td><td class="${r.last < 0 ? "negative" : "positive"}">${cash(r.last)}</td><td>${r.units}</td><td>${game?.phase === "planning" ? (r.skipped ? "Skipped this round" : r.ready ? "✓ Submitted" : "Planning") : "—"}</td></tr>`).join("")}</tbody></table>${rows.length ? "" : '<div class="empty">Waiting for the first restaurant.</div>'}</div>`;
}
let tutorialStep = 0, tutorialReplay = false, tutorialRoom = null;
function tutorial() {
  if (!game?.player || game.host || game.phase !== "planning") return "";
  if (tutorialRoom !== game.code) { tutorialRoom = game.code; tutorialStep = 0; tutorialReplay = false; }
  const show = tutorialReplay || (game.round === 1 && !game.player.tutorialSeen);
  if (!show) return '<div class="tutorial-help"><button class="btn ghost small" data-tutorial="replay">How to play</button></div>';
  const steps = isSupply() ? [
    ["Read the market", "Read the customer, supplier, and price clues. Save your demand forecast and price/stock plan each round, then choose actual prices and stock to match. No markup calculations are needed."],
    ["Choose one menu item", "Pick one of the five starting items below. Each round you must add exactly one new item. More choices unlock later, and earlier choices stay available."],
    ["Set your price and stock", "Enter a selling price and how many units to prepare, then choose Save price & stock. Lower prices tend to attract more buyers. You pay for every unit prepared, even leftovers. The game does the math for you."],
    ["Submit, then learn from the results", "Choose Submit round 1 when you’re ready. Your teacher runs the round after the class submits. Review profit, missed sales, and leftovers. Next round, add one item and adjust your existing prices or stock if you want."]
  ] : [
    ["Build your restaurant", "Your goal is to earn profit over ten rounds. Start by choosing one of the five available menu items. Each round you must add exactly one new item; more choices unlock as you play."],
    ["Choose your markup", "The item’s cost is fixed. Choose a markup percentage, then calculate the markup amount and selling price. For example: $2.00 cost × 50% = $1.00 markup; $2.00 + $1.00 = $3.00 selling price."],
    ["Check and save your price", "Enter your markup percentage, markup amount, and selling price, then choose Check math & save price. Wrong answers show a correction and save the correct price for your chosen markup, so you can submit. Rounds 1–5 have no math penalties. From round 6, the penalty grows each round, at most once per round."],
    ["Submit and watch your business grow", "Choose Submit round 1 once your new item is saved. Your teacher simulates customer sales. Review your profit, then add one new item next round and adjust existing prices if you want. Promotions unlock in round 3."]
  ];
  const step = steps[tutorialStep];
  return `<section class="card tutorial-card" aria-labelledby="tutorial-title"><div class="row between"><span class="eyebrow">QUICK START · ${isSupply() ? "SUPPLY & DEMAND" : "COST & MARKUP"} · ${tutorialStep + 1} / ${steps.length}</span><button class="btn ghost small" data-tutorial="skip">Skip tutorial</button></div><div aria-live="polite"><h2 id="tutorial-title">${step[0]}</h2><p>${step[1]}</p></div><div class="row between"><span class="tiny muted">You can reopen this guide with How to play.</span><div class="row">${tutorialStep ? '<button class="btn secondary small" data-tutorial="back">Back</button>' : ''}<button class="btn orange small" data-tutorial="${tutorialStep === steps.length - 1 ? 'done' : 'next'}">${tutorialStep === steps.length - 1 ? 'Let’s play' : 'Next →'}</button></div></div></section>`;
}
function roundUpdate() {
  const update=game?.roundStandings;
  if(!update) return '';
  return `<section class="card" style="margin:20px 0"><h2>Round ${update.round} leaderboard update</h2><div class="stack">${update.rows.map(r=>`<div class="row between"><span><strong>#${r.rank} ${esc(r.owner)}</strong> · ${esc(r.restaurant)}</span><span>${r.previousRank==null||r.rank===r.previousRank?'No change':r.rank<r.previousRank?'↑ Up '+(r.previousRank-r.rank):'↓ Down '+(r.rank-r.previousRank)} · ${cash(r.profit)}</span></div>`).join('')}</div></section>`;
}
function studentExperience() {
  const p=game.player;
  if(game.phase==='planning'&&game.round>=2&&p.bonusPromptRound!==game.round&&!p.ready&&p.skippedRound!==game.round){
    return `${heading()}${roundUpdate()}<section class="card"><span class="eyebrow">BEFORE THE NEXT RUSH</span><h2>Any bonus moves this round?</h2><p>Try sabotage or visit the cousins below, or keep your money and go straight to your menu. These choices are optional.</p><button class="btn" data-action="bonus-continue">Continue to menu planning →</button></section>${alliancePanel()}${mysteryPanel()}${sabotagePanel()}`;
  }
  return tutorial()+mathHint()+student()+(game.phase==='results'||game.phase==='complete'?roundUpdate():'')+rivalryReport()+alliancePanel()+mysteryPanel()+sabotagePanel();
}
function mathHint() {
  if(!game?.player||isSupply()||game.phase!=='planning')return '';
  const p=game.player,unlocked=(p.hintRounds||[]).includes(game.round);
  return `<section class="card" style="margin-top:20px"><h3>Math help · round ${game.round}</h3>${p.guidedEnabled!==false?`<p><strong>Free help is available on every item.</strong> Choose an item, then select “Walk me through it.”</p>${p.guidedSession?.round===game.round&&!p.guidedSession.complete?'<button class="btn secondary" data-action="resume-guided">Resume guided practice</button>':''}`:''}${unlocked?'<div class="math-note"><strong>Your hint is unlocked.</strong><p>1. Divide your markup percentage by 100.<br>2. Multiply that decimal by the item’s cost. Round to two decimal places.<br>3. Add that markup amount to the cost to find the selling price.</p><p>Example: $2.40 cost and 75% markup → 0.75 × $2.40 = $1.80 markup → $2.40 + $1.80 = $4.20 selling price.</p><p>Use the cost and markup from your own item. Your one $5 hint fee is included in profit.</p></div>':`<p>Buy a worked example and step-by-step help for $5. One purchase unlocks it for this round. Available even with no earned profit; the $5 fee can make your balance negative.</p><button class="btn secondary" data-action="buy-hint" ${!game.bonusSettings.hints||game.paused||p.ready||p.skippedRound===game.round?'disabled':''}>Buy round hint · $5</button>${!game.bonusSettings.hints?'<p>Hints are disabled by your teacher.</p>':''}`}</section>`;
}
function eventLabel(type) {
  return {competitionSetting:'Competition lesson changed',competitionAnswer:'Competition answers saved',sabotagePayout:'Sales theft settled',allianceInvite:'Alliance invitation',allianceAccept:'Alliance joined',allianceLeave:'Alliance left',allianceDecline:'Invitation removed',allianceDissolve:'Alliance dissolved',sabotageMode:'Sabotage rules changed',guidedStart:'Guided math started',guidedAnswer:'Guided practice',guidedSupport:'Guided help setting changed',bonusSettings:'Bonus settings changed',teacherReopen:'Submission reopened',waiveMath:'Math penalty waived',bonusContinue:'Menu planning',hint:'Math hint purchased',mysteryBox:'Mystery box opened',sabotage:'Sabotage attempt',pricing:'Pricing saved',strategy:'Market strategy saved',ready:'Round submitted',unready:'Submission reopened',join:'Restaurant joined',start:'Game started',next:'Next round opened',run:'Round simulated',pause:'Pause / resume',skip:'Student skipped',restore:'Student restored',promotion:'Promotion changed'}[type] || type;
}
function mathProgressTable(students) {
  if(isSupply())return '';
  return `<section class="card" style="margin-top:20px"><span class="eyebrow">TEACHER ONLY</span><h2>Math answer tracker</h2><p>Each pricing check counts once: right if both markup dollars and selling price are correct, wrong if either needs correction. Retries count as new attempts. Totals include practice rounds and remain recorded if a penalty is waived.</p><div class="table-wrap"><table><thead><tr><th>Owner</th><th>Round ${game.round} right</th><th>Round ${game.round} wrong</th><th>Game right</th><th>Game wrong</th><th>Earlier checks without a breakdown</th></tr></thead><tbody>${students.map(p=>`<tr><td><strong>${esc(p.owner)}</strong><small>${esc(p.restaurant)}</small></td><td>${p.math.round.right}</td><td>${p.math.round.wrong}</td><td>${p.math.total.right}</td><td>${p.math.total.wrong}</td><td>${p.math.total.unclassified}${p.math.round.unclassified?` (${p.math.round.unclassified} this round)`:''}</td></tr>`).join('')}</tbody></table></div><p class="tiny muted">Live totals are private to the teacher. Checks made before this tracker was added cannot reliably be split into right and wrong, so they are listed separately.</p></section>`;
}
function guidedProgressTable(students) {
 if(isSupply())return '';
 return `<section class="card" style="margin-top:20px"><span class="eyebrow">TEACHER ONLY</span><h2>Independent & assisted answers</h2><p>Free guided help is on by default for everyone. Completed walkthroughs and checks after using help count as assisted. Guided step retries are separate from full pricing checks. Earlier checks have no assistance classification.</p><div class="table-wrap"><table><thead><tr><th>Owner</th><th>Guided help</th><th>Round independent ✓ / ✗</th><th>Round assisted ✓ / ✗</th><th>Game independent ✓ / ✗</th><th>Game assisted ✓ / ✗</th><th>Guided steps ✓ / retries</th></tr></thead><tbody>${students.map(p=>{const x=p.support;if(!x)return '';return `<tr><td>${esc(p.owner)}</td><td><button class="btn secondary small" data-guided-owner="${p.id}" data-enabled="${!x.enabled}">${x.enabled?'ON':'OFF'} · change</button></td><td>${x.round.independentRight} / ${x.round.independentWrong}</td><td>${x.round.assistedRight} / ${x.round.assistedWrong}</td><td>${x.total.independentRight} / ${x.total.independentWrong}</td><td>${x.total.assistedRight} / ${x.total.assistedWrong}</td><td>${x.practice.right} / ${x.practice.wrong}</td></tr>`}).join('')}</tbody></table></div></section>`;
}
function teacherTools() {
  const data=game.teacherData;if(!data)return '';
  return `${competitionTeacher()}${mathProgressTable(data.students)}${guidedProgressTable(data.students)}${alliancePanel()}<section class="card" style="margin-top:20px"><h2>Teacher tools & live progress</h2><p class="muted">Refreshes every few seconds. Bonus switches apply immediately; previous purchases stay recorded. Reopening lets a student edit again. Waiving removes this round’s math penalty.</p><div class="row">${[['sabotage','Sabotage'],['boxes','Mystery boxes'],['hints','Math hints']].filter(([key])=>key!=='hints'||!isSupply()).map(([key,label])=>`<button class="btn secondary small" data-bonus-toggle="${key}">${label}: ${game.bonusSettings[key]?'ON':'OFF'}</button>`).join('')}</div><div class="table-wrap"><table><thead><tr><th>Owner</th><th>Status</th><th>Checks</th><th>Math penalty</th><th>Hint</th><th>Box</th><th>Spins</th>${isSupply()?'<th>Market strategy</th>':''}<th>Controls</th></tr></thead><tbody>${data.students.map(p=>`<tr><td>${esc(p.owner)}</td><td>${p.skipped?'Skipped':p.ready?'Submitted':'Planning'} · ${p.menu} items</td><td>${p.attempts}${p.wrong?' · correction':''}</td><td>${cash(p.penalty)}</td><td>${p.hint?'Bought':'—'}</td><td>${p.box?esc(p.box.title)+' ('+cash(p.box.net)+')':'—'}</td><td>${p.spins}</td>${isSupply()?`<td>${p.strategy?`${esc(p.strategy.clue)} clue · demand ${esc(p.strategy.demand)} · price ${esc(p.strategy.price)} · stock ${esc(p.strategy.stock)}`:'Not saved'}</td>`:''}<td>${game.phase==='planning'?`<button class="btn ghost small" data-control="teacherReopen" data-owner="${p.id}" ${!p.ready?'disabled':''}>Reopen</button><button class="btn ghost small" data-control="waiveMath" data-owner="${p.id}" ${!p.penalty?'disabled':''}>Waive penalty</button>`:'—'}</td></tr>`).join('')}</tbody></table></div><h3 style="margin-top:20px">Live activity</h3><div class="activity-feed">${data.events.map(e=>`<p><strong>Round ${e.round} · ${esc(e.actor)}</strong> <span class="tiny muted">${new Date(e.time).toLocaleTimeString()}</span><br>${esc(eventLabel(e.type))} — ${esc(e.detail)}</p>`).join('')||'<p>No events yet. New activity will appear here.</p>'}</div></section>`;
}

function boxReceipt(x) {
  const net=x.amount-x.price;
  return `<div class="box-receipt"><div class="row between"><span>Box purchase</span><strong>−${cash(x.price)}</strong></div><div class="row between"><span>${x.amount<0?'Extra expense':x.kind==='mishap'&&x.amount>0?'Partial refund':'Money received'}</span><strong>${x.amount<0?'−':'+'}${cash(Math.abs(x.amount))}</strong></div><hr><div class="row between"><strong>${net>=0?'You gained':'You lost'}</strong><strong>${cash(Math.abs(net))} overall</strong></div><p>${x.kind==='nothing'?`Nothing came out of this box, so you lost the ${cash(x.price)} purchase price.`:x.kind==='mishap'&&x.amount>0?`You got ${cash(x.amount)} back, but paid ${cash(x.price)}. The refund is smaller than the cost, so this is a loss.`:net>0?`Your ${cash(x.amount)} payout covers the box cost and leaves ${cash(net)} extra profit.`:`The purchase${x.amount<0?' plus the extra expense':''} reduced your profit by ${cash(-net)}.`}</p><p class="tiny muted">Already included in your total profit. This will not be charged again when the round runs.</p></div>`;
}
function mysteryPanel() {
  if(!game?.player||game.host) return '';
  const boxes=game.player.mysteryBoxes||[],current=boxes.find(x=>x.round===game.round),offer=game.mysteryOffer;
  if(!offer)return '';
  const {price,vendor}=offer;
  const locked=game.phase!=='planning'||game.round<2||game.paused||game.player.ready||game.player.skippedRound===game.round||current||game.sabotage.balance<price||!game.bonusSettings.boxes;
  return `<section class="card paulie-panel" id="paulie-panel"><span class="eyebrow">📦 ${esc(vendor)}’S DELIVERY</span><h2>${esc(offer.name)}</h2><p>${esc(offer.pitch)}</p><p>Optional · one box per round · 30 equally likely outcomes.</p><div class="math-note"><strong>What could happen after paying ${cash(price)}?</strong><p>13 rewards: gain ${cash(offer.rewardMin)}–${cash(offer.rewardMax)} overall.<br>12 mishaps: lose ${cash(offer.lossMin)}–${cash(offer.lossMax)} overall.<br>5 duds: receive nothing and lose the full ${cash(price)}.</p><strong>These gains and losses already include the box price.</strong></div>${current?`<div class="paulie-reveal" role="status"><span class="eyebrow">${current.net>0?'A PROFITABLE FIND':current.kind==='nothing'?'EMPTY-HANDED':'A COSTLY SURPRISE'}</span><h3>${esc(current.title)}</h3><p>${esc(current.description)}</p>${boxReceipt(current)}</div>`:''}<button class="btn orange" data-action="mystery-box" ${locked?'disabled':''}>${current?'Box opened this round':`Buy ${esc(offer.name)} · ${cash(price)}`}</button>${!game.bonusSettings.boxes?'<p>Mystery boxes are disabled by your teacher.</p>':''}${game.round<2?'<p>Paulie’s truck arrives in round 2.</p>':!current&&game.sabotage.balance<price?`<p>You need ${cash(price)} in earned profit. Your available profit: ${cash(game.sabotage.balance)}.</p>`:''}<details><summary>Box delivery schedule</summary>${game.mysterySchedule.map(x=>`<p>Round ${x.from}: ${esc(x.name)} · ${cash(x.price)}</p>`).join('')}</details>${boxes.length?`<details><summary>Your delivery history (${boxes.length})</summary>${boxes.map(x=>`<article><h3>Round ${x.round}: ${esc(x.title)}</h3><p>${esc(x.description)}</p>${boxReceipt(x)}</article>`).join('')}</details>`:''}</section>`;
}

function alliancePanel() {
 const a=game.alliances;if(!a)return '';const mine=a.groups.find(x=>x.members.includes(user.id));
 const owner=id=>game.board.find(x=>x.userId===id)?.owner||'Player';
 if(game.host)return `<section class="card" style="margin:20px 0"><h2>Alliances & sabotage rules</h2><p>Up to four members. Active alliances save 3% on ingredient costs. Backstabs remain possible.</p><button class="btn secondary" data-bonus-toggle="alliances">Alliances: ${a.enabled?'ON':'OFF'}</button><button class="btn secondary" data-sabotage-mode="${game.sabotageMode==='sales'?'repair':'sales'}">Sabotage: ${game.sabotageMode==='sales'?'Next-round sales theft':'$40 repair damage'} · switch</button><p class="tiny">Switches apply to new attempts. Existing thefts still settle. Turning alliances off suspends savings and new backstab bonuses; memberships remain saved.</p>${a.groups.map(x=>`<p>${x.members.map(id=>esc(owner(id))).join(' · ')} <button class="btn ghost small" data-dissolve="${x.id}">Dissolve alliance</button></p>`).join('')||'<p>No alliances yet.</p>'}<h3>Sales theft ledger</h3>${(game.sabotageLedger||[]).map(x=>`<p>${esc(owner(x.attackerId))} → ${esc(owner(x.targetId))}: ${x.rate}% of round ${x.round} sales · ${x.settled?'Paid '+cash(x.amount):'Pending'}</p>`).join('')||'<p>No scheduled thefts.</p>'}</section>`;
 const locked=!a.enabled||!['lobby','planning'].includes(game.phase)||game.paused||game.player.ready||game.player.skippedRound===game.round;
 const invites=a.invitations.filter(x=>x.to===user.id),sent=a.invitations.filter(x=>x.from===user.id);
 const targets=game.board.filter(x=>x.userId!==user.id&&!x.ready&&!x.skipped&&!a.groups.some(g=>g.members.includes(x.userId))&&!sent.some(i=>i.to===x.userId));
 return `<section class="card alliance-panel" style="margin:20px 0"><span class="eyebrow">COOPERATE… OR CONSPIRE</span><h2>Your alliance${mine?` · ${mine.members.length} / 4`:''}</h2><p>${mine?mine.members.map(id=>esc(owner(id))).join(' · '):'Invite another owner to form an alliance. They must accept.'}</p><p>With at least two active members, each restaurant saves 3% on ingredient costs. Your money and leaderboard scores stay separate.</p><p>Allies can backstab each other. In sales-theft mode, a successful backstab steals 15%, 20%, or 25% of one ally’s next-round sales with 2, 3, or 4 members. Success looks like an outside attack; a failure exposes the backstabber to the whole class.</p>${!a.enabled?'<p class="notice">Alliances are disabled by your teacher.</p>':''}${mine?`<button class="btn ghost" data-alliance-action="allianceLeave" ${locked?'disabled':''}>Leave alliance</button><p class="tiny">Leave before any ally submits. Existing attacks still settle even if membership changes.</p>`:''}${invites.map(i=>`<div class="notice">${esc(owner(i.from))} invited you. <button class="btn small" data-alliance-action="allianceAccept" data-invite="${i.id}" ${locked||mine?'disabled':''}>Accept</button> <button class="btn ghost small" data-alliance-action="allianceDecline" data-invite="${i.id}" ${locked?'disabled':''}>Decline</button></div>`).join('')}${(!mine||mine.members.length<4)?`<form id="alliance-invite-form" class="stack"><label>Invite an owner<select name="target" ${locked?'disabled':''} required><option value="">Choose a player</option>${targets.map(x=>`<option value="${x.userId}">${esc(x.owner)} · ${esc(x.restaurant)}</option>`).join('')}</select></label><button class="btn secondary" ${locked||!targets.length?'disabled':''}>Send alliance invitation</button></form>`:'<p>Your alliance is full.</p>'}${sent.map(i=>`<p>Invitation pending: ${esc(owner(i.to))} <button class="btn ghost small" data-alliance-action="allianceDecline" data-invite="${i.id}" ${locked?'disabled':''}>Cancel</button></p>`).join('')}</section>`;
}
function rivalryReport() {
 const r=game.player?.reports.find(x=>x.round===game.round);if(!r)return '';
 return `<section class="card" style="margin:20px 0"><h3>Alliance & rivalry results</h3><p>Alliance ingredient savings: <strong>${cash(r.allianceSavings||0)}</strong> (already deducted from food costs).<br>Sales stolen from rivals: <strong>+${cash(r.sabotageIncome||0)}</strong>.<br>Sales lost to sabotage: <strong>−${cash(r.sabotageStolen||0)}</strong>.</p><p class="tiny">Transfers are included in fees / bonus credits and total profit. They settle once, using this round’s gross sales. A skipped target has no sales to steal.</p></section>`;
}
function sabotagePanel() {
 if(!game?.player||game.host)return '';
 const p=game.player,sales=game.sabotageMode==='sales',mine=game.alliances?.enabled?game.alliances.groups.find(x=>x.members.includes(user.id)):null;
 const pending=(p.sabotageHistory||[]).filter(x=>x.success&&x.mode==='sales'&&x.dueRound>=game.round&&!p.reports.some(r=>r.round===x.dueRound));
 const pendingText=pending.map(x=>`<p>Scheduled: ${x.rate}% of ${esc(x.target)}’s gross sales in round ${x.dueRound}. The amount is known after that round runs.</p>`).join('');
 if(game.phase!=='planning'||game.round<2)return `<section class="card" style="margin-top:20px"><h3>Sabotage</h3><p>Spins open from round 2.</p>${pendingText}</section>`;
 const targets=game.board.filter(x=>x.userId!==user.id&&!x.skipped&&!game.sabotage.targeted.includes(x.userId));
 const final=sales&&game.round>=game.rules.totalRounds,locked=p.ready||game.paused||p.skippedRound===game.round||!game.sabotage.canSpin||!game.bonusSettings.sabotage||final;
 return `<section class="card sabotage-panel"><span class="eyebrow">BONUS · SABOTAGE WHEEL</span><h2>Rivals, allies, and risky business</h2><p>${sales?'A success steals 10% of one target’s gross sales next round. Target an ally to steal 15% with 2 members, 20% with 3, or 25% with 4. The money moves from their profit to yours after the next round runs. A skipped target pays $0.':'A success gives the target a $40 repair expense this round. This mode has no sales payout or alliance-size cash bonus.'}</p><p>A success unlocks another attempt, up to 3 per round. Each follow-up loses 15 percentage points of success chance. A miss ends your turns and reveals you to everyone you targeted this round. If you attempted a backstab, a miss exposes you to the whole class. Each restaurant can be targeted once per round. Spin fees are always charged.</p>${final?'<p class="notice">Sales stealing is closed: there is no round 11. Your earlier successful attacks still pay out this round.</p>':''}<p>Attempt ${Math.min(3,game.sabotage.attempts+1)} of 3 · Available profit: <strong>${cash(game.sabotage.balance)}</strong></p>${pendingText}<form id="sabotage-form" class="stack"><label>Target restaurant<select name="target" required ${locked?'disabled':''}><option value="">Choose a target</option>${targets.map(x=>{const ally=mine?.members.includes(x.userId);return `<option value="${x.userId}">${esc(x.restaurant)} · ${esc(x.owner)}${ally?` · BACKSTAB${sales?' '+(5+5*mine.members.length)+'%':''}`:sales?' · steal 10%':''}</option>`}).join('')}</select></label><label>Spin price and success chance<select name="cost" ${locked?'disabled':''}>${game.sabotage.tiers.map(t=>`<option value="${t.cost}" ${game.sabotage.balance<t.cost?'disabled':''}>${cash(t.cost)} · ${t.chance}% success</option>`).join('')}</select></label><button class="btn orange" ${locked||!targets.length||game.sabotage.balance<1000?'disabled':''}>Pay & spin</button></form>${!game.bonusSettings.sabotage?'<p>Sabotage is disabled by your teacher.</p>':''}</section>`;
}
function sabotageMessage(event,spinning) {
 if(spinning)return `${event.success?'Success!':'Miss!'} ${event.success?event.mode==='sales'?`You will receive ${event.rate}% of ${event.target}’s round ${event.dueRound} sales.`:`${event.target} gets a $40 repair expense.`:'The target was not affected.'} Your spin cost ${cash(event.cost)}.${!event.success&&event.backstab?' Your backstabbing has been exposed to the whole class.':''}`;
 if(event.exposure)return `${event.attacker} (${event.restaurant}) was exposed as a backstabber in round ${event.round}! A failed attempt revealed their betrayal to the whole class.`;
 const who=event.revealed||!event.success?`${event.attacker} (${event.restaurant})`:'An anonymous outside rival';
 const effect=event.success?event.mode==='sales'?`A share of ${event.allianceNotice?'their':'your'} round ${event.dueRound} sales will be diverted. The amount appears in that round’s report.`:`A $40 repair expense was added${event.allianceNotice?' to their restaurant':''}.`:'The attempt failed. No new damage or theft was applied.';
 return `${who} targeted ${event.allianceNotice?event.target+' in your alliance':'you'} in round ${event.round}. ${effect}${event.exposedByFailure?' A failed attempt exposed this attacker.':''}`;
}
function sabotageDialog(event, spinning=false) {
 if(document.querySelector('#sabotage-dialog'))return;
 const dialog=document.createElement('dialog');dialog.id='sabotage-dialog';dialog.className='card sabotage-dialog';
 dialog.innerHTML=`<h2>${spinning?'Sabotage spin':event.exposure?'Backstabber exposed!':event.allianceNotice?'Your alliance was targeted!':'Your restaurant was targeted!'}</h2>${spinning?`<div class="wheel-wrap"><span class="wheel-pointer">▼</span><div class="sabotage-wheel" style="background:conic-gradient(#238363 0 ${event.chance}%,#da583b ${event.chance}% 100%)"><span>↗</span></div></div><p>Green = success (${event.chance}%) · orange = miss</p>`:''}<p class="spin-result" role="status">${spinning?'Spinning…':esc(sabotageMessage(event,false))}</p><button class="btn" ${spinning?'disabled':''}>Got it</button>`;
 document.body.append(dialog);dialog.showModal();dialog.addEventListener('cancel',e=>e.preventDefault());
 dialog.querySelector('button').onclick=async()=>{try{if(!spinning){const next=await api(`/games/${game.code}/sabotageSeen`,{id:event.id,revealed:!!event.revealed});game.player.sabotageInbox=next.player.sabotageInbox;}dialog.close();dialog.remove();notifySabotage(game);}catch(e){toast(e.message);if(e.status===400||e.status===404){dialog.close();dialog.remove();}}};
 if(spinning){const angle=(event.roll+.5)/10000*360;requestAnimationFrame(()=>requestAnimationFrame(()=>{dialog.querySelector('.sabotage-wheel').style.transform=`rotate(${1800+360-angle}deg)`;}));setTimeout(()=>{dialog.querySelector('.spin-result').textContent=sabotageMessage(event,true);dialog.querySelector('button').disabled=false;},2600);}
}
function notifySabotage(g) {
  const event=g?.player?.sabotageInbox?.find(x=>!x.seen);
  if(event) sabotageDialog(event);
}

function gameManagement() {
  return `<section class="card" style="margin-top:20px"><h3>Manage this game</h3><p class="muted">Reset returns everyone to the round-one lobby, keeping the room code, lesson, and restaurants. Delete permanently removes the room. Both clear this game’s results and global leaderboard scores. Accounts and earned badges stay saved.</p><div class="row"><button class="btn secondary" data-manage="reset">Reset game</button><button class="btn secondary" data-manage="delete">Delete game</button></div></section>`;
}
function teacher() {
  const ready = game.board.filter((x) => x.ready).length;
  return `${heading()}${gameManagement()}${isSupply()?marketCard():""}${game.paused ? '<div class="notice">This game is paused. Saved work will be waiting when you resume.</div>' : ""}<div class="stats">${stat("Room code", game.code, "Share this code with students")}${stat("Restaurants", game.board.length, "Up to 100 owners")}${stat("Submitted", `${ready} / ${game.board.length}`, "Submit or skip each owner to simulate")}${isSupply()?stat("Mode", "Strategy", "No calculation answers or math penalties"):stat("Math penalty", cash(game.roundPenalty), "Current round · increases each round after round 5")}</div><div class="card row between"><div><h2 style="margin-bottom:5px">${game.phase === "lobby" ? "Ready to open?" : game.phase === "planning" ? "Let the owners make their move." : game.phase === "complete" ? "Competition complete." : "Time for a business debrief."}</h2><p class="muted" style="margin:0">${game.phase === "planning" ? "Submitted plans are locked until an owner reopens them." : "Discuss the results together before continuing."}</p></div><div class="row">${game.phase === "lobby" ? '<button class="btn" data-control="start">Start round 1 →</button>' : ""}${game.phase === "planning" ? `<button class="btn orange" data-control="run" ${!game.board.length || game.board.some((r) => !r.ready && !r.skipped) || !ready || game.paused ? "disabled" : ""}>Simulate round ${game.round} →</button>` : ""}${game.phase === "results" ? `<button class="btn" data-control="next" ${game.paused ? "disabled" : ""}>Open round ${game.round + 1} →</button>` : ""}${game.phase !== "complete" ? `<button class="btn ghost" data-control="pause">${game.paused ? "Resume" : "Pause"}</button>` : ""}</div></div>${game.phase === "planning" ? `<section class="card" style="margin-top:20px"><h2>Round attendance</h2><p class="muted">Skip an absent or unfinished owner for this round. They make no sales and receive no math penalty. Saved menu stays available. Restore them before simulating if they return. At least one owner must submit.</p><div class="stack">${game.board.filter((r) => !r.ready).map((r) => `<div class="row between"><span><strong>${esc(r.owner)}</strong> · ${esc(r.restaurant)}${r.skipped ? ' · Skipped' : ''}</span><button class="btn ghost small" data-control="${r.skipped ? 'restore' : 'skip'}" data-owner="${esc(r.userId)}" ${game.paused ? 'disabled' : ''}>${r.skipped ? 'Restore this round' : 'Skip this round'}</button></div>`).join('') || '<p>Everyone has submitted.</p>'}</div></section>` : ''}<div class="section-title"><h2>Classroom leaderboard</h2><div class="row"><button class="btn ghost small" data-action="export">Download results ↓</button><button class="btn ghost small" data-action="board">Project leaderboard ↗</button></div></div><div class="card">${leaderboard()}</div><div class="card soft" style="margin-top:20px"><h3>Round rhythm</h3><p class="muted" style="margin:0">${isSupply()?"One new item per round. Students choose price and stock, react to market changes, and review shortages and leftovers. All prepared food costs money. No math checks or promotions in this lesson.":"One new item per round. Five choices in round 1, five more in round 2, then three each round. Promotions start in round 3. Incorrect math saves the corrected price so students can submit. Rounds 1–5 are penalty-free; rounds 6–10 charge 1×, 2×, 3×, 4×, and 5× the base penalty, once per round."}</p></div>`;
}
let guidedOpen = false;
function guidedPanel(item, p) {
  const session=p.guidedSession?.round===game.round&&p.guidedSession.id===item.id?p.guidedSession:null;
  const active=session&&!session.complete;
  const prompts=active?[`Divide ${session.markup}% by 100. What decimal do you get?`,`Multiply ${cash(session.cost)} by ${session.markup/100}. What is the markup amount?`,`Add ${cash(session.cost)} + ${cash(session.amount)}. What is the selling price?`]:[];
  return `<aside class="card price-panel" id="pricing-panel"><span class="eyebrow">FREE GUIDED PRACTICE</span><h2>Walk me through it</h2><h3>${esc(item.name)}</h3><p>Cost: <strong>${cash(item.cost)}</strong></p><p>Take one step at a time. Retries here add no penalties. Any earlier round penalty remains.</p>${active?`<p class="pill">Step ${session.step+1} of 3</p><h3>${prompts[session.step]}</h3><form id="guided-answer-form" class="stack" data-item="${item.id}" data-step="${session.step}"><label>${session.step===0?'Decimal':'Amount in dollars'}<input name="answer" type="number" step="any" inputmode="decimal" required></label><button class="btn">Check this step</button></form><details><summary>Give me a hint</summary><p>${['Percent means out of 100. Move the decimal point two places to the left. Example: 75% = 0.75.','Cost × decimal = markup dollars. Round the result to two decimal places.','The customer pays enough to cover your cost plus your markup. Add the two amounts.'][session.step]}</p></details>`:session?.complete?`<div class="feedback success">Price saved: ${cash(session.price)}. You can now submit the round.</div>`:`<form id="guided-start-form" class="stack" data-item="${item.id}"><label>Choose your markup (%)<input name="markup" type="number" min="0" max="500" step="0.01" value="${esc(pricingInput.markup??50)}" required></label><button class="btn">Start the walkthrough</button></form>`}${feedback?`<p role="status" class="feedback ${feedback.correct?'success':'error'}">${esc(feedback.message)}</p>`:''}<button class="btn ghost" data-action="close-guided">Back to pricing</button></aside>`;
}
function pricingPanel(p) {
  const item = game.catalog.find((x) => x.id === selected);
  if (!item)
    return `<aside class="card price-panel"><span class="eyebrow">THE PRICING DESK</span><h2>Your next best seller?</h2><p class="muted">Choose an available product to calculate its markup and selling price.</p><div class="math-note">Markup dollars = cost × markup % ÷ 100<br>Selling price = cost + markup dollars<br><strong>Round money to the nearest cent.</strong></div></aside>`;
  if (guidedOpen && p.guidedEnabled !== false) return guidedPanel(item,p);
  const entry = p.menu.find((x) => x.id === item.id),
    input = pricingInput;
  return `<aside class="card price-panel" id="pricing-panel"><span class="eyebrow">${entry ? "REFINE YOUR PRICE" : "BUILD YOUR MENU"}</span><div class="bigfood" style="margin-top:18px">${foodArt(item.id)}</div><h2>${esc(item.name)}</h2><p class="muted tiny">${esc(item.category)} · Customers expect about ${cash(item.expected)}</p><div class="formula"><span>Cost per unit</span><strong>${cash(item.cost)}</strong></div>${p.guidedEnabled!==false?'<button class="btn secondary full" data-action="open-guided">Walk me through it · Free</button><p class="tiny">Three small steps, with penalty-free retries.</p>':''}<form id="pricing-form" class="stack" data-item="${item.id}"><label>Your markup (%)<input name="markup" inputmode="decimal" type="number" min="0" max="500" step="0.01" value="${esc(input.markup ?? entry?.markup ?? "")}" placeholder="Choose your markup" required></label><label>Markup amount ($)<input name="amount" inputmode="decimal" type="number" min="0" step="0.01" value="${esc(input.amount ?? (entry ? ((entry.price - item.cost) / 100).toFixed(2) : ""))}" placeholder="Cost × markup ÷ 100" required></label><label>Selling price ($)<input name="price" inputmode="decimal" type="number" min="0" step="0.01" value="${esc(input.price ?? (entry ? (entry.price / 100).toFixed(2) : ""))}" placeholder="Cost + markup amount" required></label><span class="save-status" id="save-status">Incorrect math saves the corrected price and still lets you submit. One new item per round.</span><button class="btn full">Check math & save price ✓</button></form><div class="math-note" style="margin-top:14px">${game.round <= 5 ? "Practice rounds: mistakes have no penalty." : `First wrong check this round: ${cash(game.roundPenalty)} penalty. Only one penalty per round. You can submit without retrying.`}<br>Round markup dollars to cents, then add to cost.</div>${feedback ? `<div class="feedback ${feedback.correct ? "success" : "error"}" role="status">${esc(feedback.message)}${feedback.roundPenalty ? ` This round’s math penalty is ${cash(feedback.roundPenalty)} total; further checks do not add another penalty.` : " No math penalty this round."}</div>` : ""}</aside>`;
}
function promotionPanel(p) {
  return `<section class="card" style="margin-top:22px"><div class="row between"><h2>Bring in a crowd.</h2><span class="pill">PROMOTIONS</span></div>${
    game.round < 3
      ? '<p class="muted" style="margin:0">Your promotion toolbox opens in round 3.</p>'
      : `<form id="promotion-form" class="stack"><label>Promotion<select name="id">${game.promotions.map((x) => `<option value="${x.id}" ${p.promotion.id === x.id ? "selected" : ""}>${esc(x.name)}</option>`).join("")}</select></label><p id="promo-description" class="math-note" style="margin:0">${esc(game.promotions.find((x) => x.id === p.promotion.id).description)}</p><div class="grid2"><label>Featured item<select name="target"><option value="">Choose item</option>${p.menu.map((x) => `<option value="${x.id}" ${p.promotion.target === x.id ? "selected" : ""}>${esc(game.catalog.find((i) => i.id === x.id).name)}</option>`).join("")}</select></label><label>Companion (for meal offers)<select name="companion"><option value="">No companion</option>${p.menu
          .filter((x) =>
            ["Sides", "Drinks"].includes(
              game.catalog.find((i) => i.id === x.id).category,
            ),
          )
          .map(
            (x) =>
              `<option value="${x.id}" ${p.promotion.companion === x.id ? "selected" : ""}>${esc(game.catalog.find((i) => i.id === x.id).name)}</option>`,
          )
          .join(
            "",
          )}</select></label></div><p class="tiny muted">Companion costs and sales are included with the featured product in your report. Preview the offer below before saving.</p><div id="promo-preview" class="math-note"></div><button class="btn secondary">Save promotion</button></form>`
  }</section>`;
}
function student() {
  if (isSupply()) return supplyStudent();
  const p = game.player,
    total = game.sabotage.balance,
    report = p.reports.at(-1);
  if (game.phase === "lobby")
    return `${heading()}<div class="welcome"><canvas id="restaurant-scene" width="900" height="280" style="width:100%;height:220px" aria-label="Your restaurant"></canvas><h2>${esc(p.icon)} ${esc(p.restaurant)} is on the map.</h2><p>Owner: ${esc(p.owner)}. Your teacher will open round 1 when everyone has joined.</p><span class="pill">ROOM ${game.code}</span></div><div class="card">${leaderboard()}</div>`;
  const skipped = p.skippedRound === game.round;
  const added = p.menu.some((x) => x.addedRound === game.round);
  const locked = p.ready || game.paused || skipped;
  return `${heading()}${skipped ? '<div class="notice">Your teacher skipped this round for your restaurant. No sales or math penalty this round. Your checked menu prices are saved; you can return next round.</div>' : ""}${game.paused ? '<div class="notice">Your teacher paused this game. Your work is saved.</div>' : ""}<div class="stats">${stat("Total profit", cash(total), "After promotions and math penalties")}${stat("Menu items", p.menu.length, `Add one product each round`)}${stat("Your rank", "#" + (game.board.find((x) => x.userId === user.id)?.rank || "—"), `Of ${game.board.length} restaurants`)}${stat("Round " + game.round, game.round <= 5 ? "Practice" : "Game on", game.round <= 5 ? "No math penalties" : `${cash(game.roundPenalty)} max math penalty this round`)}</div>${
    game.phase !== "planning"
      ? results(p)
      : `<div class="workspace"><div><section class="card restaurant"><canvas id="restaurant-scene" width="900" height="240" aria-label="Your personalized restaurant"></canvas><div class="restaurant-head row between"><h2>${esc(p.icon)} ${esc(p.restaurant)}</h2><span class="eyebrow">EST. ROUND 1</span></div><div class="menu-strip">${
          p.menu.length
            ? p.menu
                .map((x) => {
                  const i = game.catalog.find((y) => y.id === x.id);
                  return `<button class="menu-item" data-select="${x.id}" ${locked ? "disabled" : ""}>${foodArt(i.id, "menu-food")}<strong>${esc(i.name)}</strong>${cash(x.price)} <small class="muted">· ${x.markup}%</small></button>`;
                })
                .join("")
            : '<p class="muted" style="padding:12px;margin:0">A blank menu. A world of possibilities.</p>'
        }</div></section>${
          p.ready
            ? `<div class="success" style="margin-top:20px"><h3>✓ Your restaurant is ready.</h3><p>Your teacher will simulate the round after everyone submits.</p><button class="btn secondary" data-action="unready" ${game.paused ? "disabled" : ""}>Reopen my submission</button></div>`
            : `<div class="section-title"><h2>${!added ? "Choose your next menu item" : "New item added · 1 of 1"}</h2><span class="pill">${game.catalog.length} UNLOCKED</span></div><p class="muted tiny">Older items remain available. New items are marked below. Select a menu item above to adjust its price.</p><div class="catalog">${game.catalog
                .filter((i) => !p.menu.some((x) => x.id === i.id))
                .map(
                  (i) =>
                    `<button class="product ${selected === i.id ? "selected" : ""}" data-select="${i.id}" ${added || locked ? "disabled" : ""}>${i.round === game.round ? '<span class="new">JUST UNLOCKED</span>' : ""}<span class="food-icon">${foodArt(i.id)}</span><h3>${esc(i.name)}</h3><div class="row between"><span class="tiny muted">Unit cost</span><span class="price">${cash(i.cost)}</span></div></button>`,
                )
                .join(
                  "",
                )}</div>${!locked ? promotionPanel(p) : ""}<div class="card row between" style="margin-top:22px"><div><h3>Ready for the rush?</h3><span class="muted tiny">${added ? "You added your one new item for this round. You can still adjust saved menu prices." : "Add one new item before submitting."}</span></div><button class="btn orange" data-action="ready" ${!added || locked ? "disabled" : ""}>Submit round ${game.round} →</button></div>`
        }</div>${!locked ? pricingPanel(p) : '<aside class="card"><h2>Your work is saved.</h2><p class="muted">You can close the browser and log back in with this account to resume.</p></aside>'}</div>`
  }`;
}
function results(p) {
  const r = p.reports.at(-1);
  if (r.skipped) return `<section class="card"><span class="eyebrow">ROUND ${r.round} · SKIPPED</span><h2>Your restaurant sat this round out.</h2><p>No sales or math penalty were applied. Purchased bonuses and hints still count. Your saved menu prices are kept.</p><p class="muted">${game.phase === 'complete' ? 'This game is complete. Your earlier results are saved.' : 'You can participate when your teacher opens the next round.'}</p></section>`;
  const best = [...r.items].sort((a, b) => b.profit - a.profit)[0];
  const prior = p.reports.at(-2),
    change = prior ? r.profit - prior.profit : null;
  return `<div class="round-results"><section class="profit-hero ${r.profit < 0 ? "loss" : ""}"><div><span class="eyebrow">${game.phase === "complete" ? "SEASON COMPLETE" : "ROUND " + r.round + " • SERVICE COMPLETE"}</span><h2>${r.profit >= 0 ? "That’s a good day at the counter." : "Every round is a chance to learn."}</h2><span class="profit-total">${cash(r.profit)}</span><p class="muted">Round profit, after all costs${change !== null ? ` · ${change >= 0 ? "↑" : "↓"} ${cash(Math.abs(change))} from last round` : ""}</p><div class="row"><span class="pill">${r.units} units served</span><span class="pill">${r.items.length} menu item${r.items.length === 1 ? "" : "s"}</span></div></div><div class="receipt"><div class="eyebrow">${esc(p.restaurant)}</div><div class="receipt-line"><span>Sales revenue</span><strong>${cash(r.revenue)}</strong></div><div class="receipt-line"><span>Food costs</span><span>− ${cash(r.cost)}</span></div><div class="receipt-line"><span>Fees / bonus credits</span><span>${r.fees < 0 ? "+" : "−"} ${cash(Math.abs(r.fees))}</span></div><div class="receipt-line"><span>Math penalty</span><span>− ${cash(r.penalty)}</span></div><div class="receipt-line receipt-total"><strong>NET PROFIT</strong><strong>${cash(r.profit)}</strong></div><div class="receipt-code" aria-hidden="true"></div><span class="tiny muted">ROUND ${r.round} / 10 · SAVED ✓</span></div></section><section class="star-product card"><div class="star-food">${foodArt(best.id)}</div><div><span class="eyebrow">${best.profit > 0 ? "YOUR TOP EARNER" : "YOUR STRONGEST PRODUCT"}</span><h2>${esc(best.name)}</h2><p class="muted">${best.units} units served · ${cash(best.profit)} product profit</p><span class="tiny">${esc(best.feedback)}</span></div><div class="result-owner">${avatarArt(user.avatar)}<span>${esc(p.owner)}<small class="muted">${game.phase === "complete" ? "Career results saved" : "Waiting for the next round"}</small></span></div></section></div><div class="welcome compact-summary"><span class="eyebrow">ROUND ${r.round} RESULTS</span><h2 style="margin-top:12px">${r.profit >= 0 ? "The numbers are in." : "A lesson for the next rush."}</h2><p>Revenue ${cash(r.revenue)} − food ${cash(r.cost)} − fees / bonus credits ${cash(r.fees)} − math penalty ${cash(r.penalty)} = <strong>${cash(r.profit)} profit</strong>.</p>${game.phase === "complete" ? '<span class="pill">CAREER RESULTS SAVED ✓</span>' : '<span class="pill">WAITING FOR YOUR TEACHER TO OPEN THE NEXT ROUND</span>'}</div><div class="card"><h2>Every item tells a story.</h2><div class="table-wrap"><table><thead><tr><th>Menu item</th><th>Markup</th><th>Price</th><th>Orders / units</th><th>Revenue</th><th>Food cost</th><th>Ad fee</th><th>Profit</th></tr></thead><tbody>${r.items.map((x) => `<tr><td><strong class="owner-cell">${foodArt(x.id, "food-tiny")} ${esc(x.name)}</strong><small>${x.promoted ? "Promotion applied" : ""}</small></td><td>${x.markup}%</td><td>${cash(x.price)}</td><td>${x.orders} / ${x.units}</td><td>${cash(x.revenue)}</td><td>${cash(x.cost)}</td><td>${cash(x.fee)}</td><td class="${x.profit < 0 ? "negative" : "positive"}">${cash(x.profit)}</td></tr>`).join("")}</tbody></table></div><div class="result-list">${r.items.map((x) => `<p><strong>${esc(x.name)}:</strong> ${esc(x.feedback)}</p>`).join("")}</div></div><div class="section-title"><h2>Your season so far</h2></div><div class="card table-wrap"><table><thead><tr><th>Round</th><th>Revenue</th><th>Food cost</th><th>Fees / bonus credits</th><th>Math penalty</th><th>Profit</th></tr></thead><tbody>${p.reports.map((x) => `<tr><td>${x.round}${x.skipped ? " · Skipped" : ""}</td><td>${cash(x.revenue)}</td><td>${cash(x.cost)}</td><td>${cash(x.fees)}</td><td>${cash(x.penalty)}</td><td>${cash(x.profit)}</td></tr>`).join("")}</tbody></table></div>`;
}
function badgePage() {
  return `<div class="page-heading"><div><span class="eyebrow">A LITTLE PROOF OF YOUR BIG IDEAS</span><h1 style="margin-top:10px">The badge collection.</h1><p class="muted">${user.badges.length} of ${badgeDefs.length} unlocked. Feature up to three; your first appears on the leaderboard.</p></div><span class="pill">COSMETIC REWARDS · NO GAME ADVANTAGE</span></div><div class="badge-toolbar"><div class="row">${["all", "earned", "locked"].map((f) => `<button class="btn small ${badgeFilter === f ? "" : "secondary"}" data-badge-filter="${f}" aria-pressed="${badgeFilter === f}">${f === "all" ? "All " + badgeDefs.length : f === "earned" ? "Earned · " + user.badges.length : "Locked · " + (badgeDefs.length - user.badges.length)}</button>`).join("")}</div><div class="collection-progress" role="progressbar" aria-label="Achievement collection" aria-valuemin="0" aria-valuemax="${badgeDefs.length}" aria-valuenow="${user.badges.length}"><span style="width:${user.badges.length / badgeDefs.length * 100}%"></span></div></div><div class="badge-grid">${badgeDefs
    .filter(
      (b) =>
        badgeFilter === "all" ||
        (badgeFilter === "earned"
          ? user.badges.includes(b.id)
          : !user.badges.includes(b.id)),
    )
    .map(
      (b) =>
        `<article class="card badge ${user.badges.includes(b.id) ? "" : "locked"} ${user.featured.includes(b.id) ? "selected" : ""}"><div class="icon">${b.icon}</div><h3>${esc(b.name)}</h3><p class="muted">${esc(b.description)}</p>${user.badges.includes(b.id) ? `<button class="btn small ${user.featured.includes(b.id) ? "" : "secondary"}" data-feature="${b.id}">${user.featured.includes(b.id) ? "★ Featured" : "Feature badge"}</button>` : '<span class="eyebrow">LOCKED</span>'}</article>`,
    )
    .join("")}</div>`;
}
function globalPage() {
  const rows = [...boardData].sort((a, b) =>
    boardMode === "best" ? b.best - a.best : b.profit - a.profit,
  );
  return `<div class="page-heading"><div><span class="eyebrow">THE HALL OF FAST-FOOD FAME</span><h1 style="margin-top:10px">Big ambitions. Real results.</h1><p class="muted">${esc(lessonChoices.find(l=>l.id===boardLesson)?.label || "Cost & Markup")} · across completed games. Each lesson has separate rankings.</p><label>Leaderboard lesson<select id="leaderboard-lesson">${lessonChoices.map(l=>`<option value="${esc(l.id)}" ${l.id===boardLesson?"selected":""}>${esc(l.label)}</option>`).join("")}</select></label><p></p></div><div class="row"><button class="btn ${boardMode === "career" ? "" : "secondary"}" data-action="career-sort">Career profit</button><button class="btn ${boardMode === "best" ? "" : "secondary"}" data-action="best-sort">Best game</button></div></div><div class="card table-wrap"><table><thead><tr><th>Rank</th><th>Owner</th><th>Games completed</th><th>Career profit</th><th>Best game</th><th>Wins</th></tr></thead><tbody>${rows.map((r, i) => `<tr class="${r.id === user?.id ? "me" : ""}"><td>#${rows.findIndex((x) => (boardMode === "best" ? x.best : x.profit) === (boardMode === "best" ? r.best : r.profit)) + 1}</td><td><span class="owner-cell">${avatarArt(r.avatar)}<strong>${esc(r.name)}</strong></span></td><td>${r.games}</td><td>${cash(r.profit)}</td><td>${cash(r.best)}</td><td>${r.wins}</td></tr>`).join("")}</tbody></table>${rows.length ? "" : '<div class="empty">The first champions are still in the kitchen. Completed games will appear here.</div>'}</div>`;
}
function draw() {
  const c = document.querySelector("canvas");
  if (!c) return;
  const ctx = c.getContext("2d"),
    w = c.width,
    h = c.height,
    p = game?.player,
    night = theme === "dark";
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, night ? "#12243b" : "#d9ebe0");
  sky.addColorStop(1, night ? "#304556" : "#f6e9c7");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);
  const circle = (x, y, r, color) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  };
  circle(w * 0.84, 43, 22, night ? "#f3e6b0" : "#f6cf77");
  if (night) {
    for (let i = 0; i < 25; i++)
      circle(
        (i * 139 + 31) % w,
        12 + ((i * 23) % 80),
        i % 3 ? 1 : 1.7,
        "#c3dbd8",
      );
  } else {
    for (const x of [90, w * 0.65]) {
      circle(x, 39, 14, "#ffffff99");
      circle(x + 19, 34, 19, "#ffffff99");
      circle(x + 39, 40, 13, "#ffffff99");
    }
  }
  ctx.fillStyle = night ? "#213743" : "#c5d8c5";
  for (let i = 0; i < 11; i++) {
    const x = i * 92,
      y = 85 + (i % 3) * 15;
    ctx.fillRect(x, y, 58, h - y);
    ctx.fillStyle = night ? "#e9bc6244" : "#f5f1dd";
    for (let k = 0; k < 3; k++) ctx.fillRect(x + 9 + k * 15, y + 13, 7, 11);
    ctx.fillStyle = night ? "#213743" : "#c5d8c5";
  }
  const ground = h - 25;
  ctx.fillStyle = night ? "#334840" : "#a9bd97";
  ctx.fillRect(0, ground - 7, w, 32);
  ctx.fillStyle = night ? "#485450" : "#d7d4be";
  ctx.fillRect(0, ground + 9, w, 16);
  const x = w * 0.25,
    bw = w * 0.5,
    roof = 60,
    base = ground;
  ctx.fillStyle = "#00000018";
  ctx.fillRect(x + 10, roof + 15, bw, base - roof);
  ctx.fillStyle = night ? "#dbc59e" : "#fff3d8";
  ctx.fillRect(x, roof + 34, bw, base - roof - 34);
  ctx.fillStyle = p?.color || "#da583b";
  ctx.beginPath();
  ctx.roundRect(x - 9, roof, bw + 18, 44, 8);
  ctx.fill();
  const hex = p?.color || "#da583b",
    rgb = hex
      .slice(1)
      .match(/../g)
      .map((v) => parseInt(v, 16) / 255)
      .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  ctx.fillStyle =
    0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2] > 0.179
      ? "#182d27"
      : "#fff8e5";
  ctx.textAlign = "center";
  ctx.font = "900 22px Arial";
  ctx.fillText(
    (p?.restaurant || "YOUR NEXT BIG THING").toUpperCase(),
    w / 2,
    roof + 28,
    bw - 30,
  );
  for (let i = 0; i < 12; i++) {
    ctx.fillStyle = i % 2 ? "#fff3d5" : p?.color || "#da583b";
    ctx.fillRect(x + (i * bw) / 12, roof + 44, bw / 12, 19);
    ctx.beginPath();
    ctx.arc(x + ((i + 0.5) * bw) / 12, roof + 62, bw / 24, 0, Math.PI);
    ctx.fill();
  }
  const wy = roof + 83,
    wh = base - wy - 11;
  ctx.fillStyle = night ? "#f5c77b" : "#3b6658";
  ctx.fillRect(x + 18, wy, bw * 0.48, wh);
  ctx.fillRect(x + bw * 0.65, wy, bw * 0.27, base - wy);
  ctx.fillStyle = night ? "#ffe4a4" : "#92b7a6";
  ctx.fillRect(x + 22, wy + 4, bw * 0.47 - 5, 6);
  ctx.fillStyle = night ? "#7f633a" : "#dae6ca";
  ctx.font = "bold 14px Arial";
  ctx.fillText(
    "ORDER • PICK UP • ENJOY",
    x + 18 + bw * 0.24,
    wy + Math.max(21, wh * 0.55),
    bw * 0.43,
  );
  ctx.strokeStyle = "#ffffff55";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x + bw * 0.71, wy + 8);
  ctx.lineTo(x + bw * 0.86, wy + 24);
  ctx.stroke();
  circle(x + bw * 0.88, base - 22, 3, "#f2b858");
  ctx.fillStyle = night ? "#153d35" : "#2c6950";
  ctx.fillRect(x + bw * 0.66, base - 36, bw * 0.22, 18);
  ctx.fillStyle = "#b7ecc9";
  ctx.font = "bold 10px Arial";
  ctx.fillText("OPEN", x + bw * 0.77, base - 23);
  for (const tx of [x - 53, x + bw + 57]) {
    ctx.fillStyle = "#957451";
    ctx.fillRect(tx - 3, base - 60, 6, 60);
    circle(tx, base - 63, 21, night ? "#3e6a58" : "#65996c");
    circle(tx - 13, base - 53, 16, night ? "#385e4d" : "#77a875");
    ctx.fillStyle = "#c68857";
    ctx.fillRect(tx - 13, base - 16, 26, 17);
  }
  for (let i = 0; i < 7; i++) {
    const lx = x + 8 + (i * bw) / 6.5;
    circle(lx, roof - 4, 3.2, night ? "#ffe6a0" : "#f8ce74");
    if (night) {
      ctx.shadowColor = "#ffd887";
      ctx.shadowBlur = 10;
      circle(lx, roof - 4, 2, "#ffe8b5");
      ctx.shadowBlur = 0;
    }
  }
  ctx.fillStyle = night ? "#243d36" : "#3f6c54";
  ctx.beginPath();
  ctx.roundRect(x - 112, base - 48, 46, 48, 4);
  ctx.fill();
  ctx.strokeStyle = "#e3c78c";
  ctx.lineWidth = 2;
  ctx.strokeRect(x - 108, base - 43, 38, 38);
  ctx.fillStyle = "#f6e4b9";
  ctx.font = "bold 9px Arial";
  ctx.fillText("FRESH", x - 89, base - 27);
  ctx.fillText("DAILY", x - 89, base - 15);
}

function render() {
  root.innerHTML =
    !user && page !== "global"
      ? auth()
      : shell(
          page === "profile"
            ? profilePage()
            : page === "home"
              ? home()
              : page === "badges"
                ? badgePage()
                : page === "global"
                  ? globalPage()
                  : page === "board"
                    ? `${heading()}<div class="row" style="margin-bottom:20px"><button class="btn secondary" data-action="projector">${projector ? "Exit projector view" : "Projector view"}</button><button class="btn ghost" data-action="copy-board">Copy public leaderboard link</button></div><div class="card">${leaderboard()}</div>`
                    : game.host
                      ? teacher() + roundUpdate() + teacherTools()
                      : studentExperience(),
        );
  draw();
  previewPromotion();
  previewRestaurant();
  if(page === "game") notifySabotage(game);
}
async function openGame(code) {
  apply(await api("/games/" + code));
  page = "game";
  selected = null;
  pricingInput = {};
  feedback = null;
  render();
}
async function actionRoom(action, body = {}) {
  const data = await api(`/games/${game.code}/${action}`, body);
  apply(data);
  render();
  return data;
}
root.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (requestBusy) return;
  requestBusy = true;
  const form = e.target,
    b = Object.fromEntries(new FormData(form)),
    button = form.querySelector("button[type=submit],button:not([type])");
  form
    .querySelectorAll("input, select, button")
    .forEach((el) => (el.disabled = true));
  try {
    if(form.id === 'competition-form') {
      await actionRoom('competitionAnswer',{answers:game.competition.briefing.cases.map(q=>({id:q.id,type:b['type-'+q.id],reason:b['reason-'+q.id]})),strategy:b.competitionStrategy,strategyReason:b.competitionReason});
      root.querySelector('.competition-feedback')?.scrollIntoView({block:'center'});
    }
    if(form.id === "alliance-invite-form") { await actionRoom("allianceInvite",b);toast("Alliance invitation sent."); }
    if(form.id === "strategy-form") {
      await actionRoom("strategy", {clue:b.clue,demand:b.demandForecast,price:b.pricePlan,stock:b.stockPlan});toast("Strategy saved. Now review your price and stock decisions.");
    }
    if (form.id === "sabotage-form") {
      const result=await api(`/games/${game.code}/sabotage`, b);
      apply(result); render(); sabotageDialog(result.player.sabotageSpin, true);
    }
    if (form.getAttribute("id") === "auth-form") {
      await api("/" + authTab, { ...b, teacherLogin: teacherEntry });
      await refreshMe();
      page = "home";
      render();
    }
    if (form.getAttribute("id") === "join-form") {
      const code = b.code.trim().toUpperCase();
      apply(await api("/games/" + code + "/join", b));
      page = "game";
      await refreshMe();
      render();
    }
    if (form.getAttribute("id") === "host-form") {
      apply(await api("/games", b));
      page = "game";
      await refreshMe();
      render();
    }
    if (['guided-start-form','guided-answer-form'].includes(form.id)) {
      const data=await api(`/games/${game.code}/${form.id==='guided-start-form'?'guidedStart':'guidedAnswer'}`,{...b,id:form.dataset.item,step:form.dataset.step});
      apply(data); feedback=data.guidedFeedback; render();
    }
    if (form.getAttribute("id") === "pricing-form") {
          const data = await api(`/games/${game.code}/check`, {
        ...b,
        id: form.dataset.item,
      });
      feedback = data.check;
      pricingInput = data.check.saved ? {} : b;
      apply(data);
      render();
    }
    if (form.getAttribute("id") === "promotion-form") {
      await actionRoom("promotion", b);
      toast("Promotion saved.");
    }
  } catch (err) {
    const target = document.querySelector("#form-error");
    if (target)
      target.innerHTML = `<div class="error">${esc(err.message)}</div>`;
    else toast(err.message);
  } finally {
    requestBusy = false;
    if (form.isConnected)
      form
        .querySelectorAll("input, select, button")
        .forEach((el) => (el.disabled = false));
  }
});
root.addEventListener("click", async (e) => {
  const btn = e.target.closest("button");
  if (!btn || btn.disabled) return;
  try {
    if(btn.dataset.competitionToggle){await actionRoom('competitionSetting',{enabled:btn.dataset.competitionToggle==='true',version:game.version});return;}
    if(btn.dataset.allianceAction){btn.disabled=true;await actionRoom(btn.dataset.allianceAction,{id:btn.dataset.invite});return;}
    if(btn.dataset.sabotageMode){await actionRoom('sabotageMode',{mode:btn.dataset.sabotageMode,version:game.version});return;}
    if(btn.dataset.dissolve){await actionRoom('allianceDissolve',{id:btn.dataset.dissolve,version:game.version});return;}
    if(btn.dataset.bonusToggle){await actionRoom("bonusSettings",{version:game.version,key:btn.dataset.bonusToggle,enabled:!game.bonusSettings[btn.dataset.bonusToggle]});return;}
    if(btn.dataset.action === "buy-hint" || btn.dataset.action === "bonus-continue") {
      btn.disabled=true;await actionRoom(btn.dataset.action === "buy-hint"?"hint":"bonusContinue");return;
    }
    if (btn.dataset.action === "mystery-box") {
      btn.disabled = true;
      apply(await api(`/games/${game.code}/mysteryBox`, {})); render();
      root.querySelector("#paulie-panel")?.scrollIntoView({behavior:"smooth",block:"center"});
      return;
    }
    if (btn.dataset.tutorial) {
      const action = btn.dataset.tutorial;
      if (action === "next") tutorialStep = Math.min(3, tutorialStep + 1);
      if (action === "back") tutorialStep = Math.max(0, tutorialStep - 1);
      if (action === "replay") { tutorialStep = 0; tutorialReplay = true; }
      if (action === "done" || action === "skip") {
        btn.disabled = true;
        apply(await api(`/games/${game.code}/tutorial`, {}));
        tutorialStep = 0; tutorialReplay = false;
      }
      render();
      const focus = root.querySelector('[data-tutorial="next"], [data-tutorial="done"], [data-tutorial="replay"]');
      focus?.focus({ preventScroll: true });
      return;
    }
    if (btn.dataset.badgeFilter) {
      badgeFilter = btn.dataset.badgeFilter;
      render();
      return;
    }
    if (btn.dataset.action === "theme") {
      theme = theme === "dark" ? "light" : "dark";
      document.documentElement.dataset.theme = theme;
      try {
        localStorage.setItem("counter-theme", theme);
      } catch {}
      document.querySelectorAll(".theme-toggle").forEach((el) => {
        el.textContent = theme === "dark" ? "☀ Light" : "☾ Dark";
        el.setAttribute(
          "aria-label",
          `Switch to ${theme === "dark" ? "light" : "dark"} mode`,
        );
      });
      document.querySelector('meta[name="theme-color"]').content =
        theme === "dark" ? "#101b23" : "#f6f5ee";
      draw();
      return;
    }
    if (btn.dataset.avatar) {
      if (btn.dataset.registering === "true") {
        registrationAvatar = btn.dataset.avatar;
        root.querySelector('input[name="avatar"]').value = registrationAvatar;
        root.querySelectorAll(".avatar-choice").forEach((el) => {
          const chosen = el.dataset.avatar === registrationAvatar;
          el.classList.toggle("selected", chosen);
          el.setAttribute("aria-pressed", String(chosen));
        });
      } else {
        btn.disabled = true;
        const data = await api("/profile", { avatar: btn.dataset.avatar });
        user = data.user;
        render();
        toast("Your new avatar is saved.");
      }
      return;
    }
    if (btn.dataset.action === "profile") {
          await refreshMe();
      page = "profile";
      window.scrollTo(0, 0);
      render();
      return;
    }
    if (btn.dataset.action==='resume-guided') { selected=game.player.guidedSession.id; guidedOpen=true; feedback=null; render(); document.querySelector('#pricing-panel')?.scrollIntoView({block:'center'}); }
    if (btn.dataset.action==='open-guided') { guidedOpen=true; feedback=null; render(); }
    if (btn.dataset.action==='close-guided') { guidedOpen=false; feedback=null; render(); }
    if (btn.dataset.guidedOwner) { await actionRoom('guidedSupport',{version:game.version,userId:btn.dataset.guidedOwner,enabled:btn.dataset.enabled==='true'}); }
    if (btn.dataset.select) {
      guidedOpen=false;
          selected = btn.dataset.select;
      pricingInput = {};
      feedback = null;
      render();
      document
        .querySelector("#pricing-panel")
        ?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      return;
    }
    if (btn.dataset.open) return await openGame(btn.dataset.open);
    if (btn.dataset.manage) {
      const action = btn.dataset.manage, code = game.code, version = game.version;
      const confirmation = prompt(`${action === "reset" ? "Reset this game to the round-one lobby?" : "Permanently delete this game?"} This clears its results and global leaderboard scores. Accounts and earned badges stay saved. Type ${code} to confirm.`);
      if (confirmation === null) return;
      if (confirmation.trim().toUpperCase() !== code) { toast("Room code did not match. Nothing changed."); return; }
      btn.disabled = true;
      const result = await api(`/games/${code}/${action}`, { version, confirmCode: code });
      selected = null; pricingInput = {}; feedback = null;
      if (result.deleted) { game = null; page = "home"; await refreshMe(); }
      else apply(result);
      render();
      toast(action === "reset" ? "Game reset. Students are back in the lobby." : "Game deleted.");
      return;
    }
    if (btn.dataset.control) {
      btn.disabled = true;
      await actionRoom(btn.dataset.control, { version: game.version, userId: btn.dataset.owner });
      return;
    }
    if (btn.dataset.feature) {
      const id = Number(btn.dataset.feature),
        featured = user.featured.includes(id)
          ? user.featured.filter((x) => x !== id)
          : [...user.featured, id];
      await api("/profile", { featured });
      user.featured = featured;
      render();
      return;
    }
    const a = btn.dataset.action;
    if (a === "teacher-entry") {
      teacherEntry = !teacherEntry;
      authTab = "login";
      render();
      document
        .querySelector("#auth-form")
        .scrollIntoView({ block: "center", behavior: "smooth" });
      return;
    }
    if (
      [
        "home",
        "game",
        "board",
        "global",
        "public",
        "badges",
        "login-tab",
        "register-tab",
      ].includes(a)
    )
      window.scrollTo(0, 0);
    if (a === "login-tab" || a === "register-tab") {
      authTab = a === "login-tab" ? "login" : "register";
      page = "home";
      render();
    }
    if (a === "logout") {
          await api("/logout", {});
      user = null;
      game = null;
      page = "home";
      render();
    }
    if (a === "home") {
          await refreshMe();
      page = "home";
      projector = false;
      render();
    }
    if (a === "game") {
      page = "game";
      render();
    }
    if (a === "board") {
      page = "board";
      render();
    }
    if (a === "global" || a === "public") {
      boardData = (await api("/leaderboard?lessonId=" + encodeURIComponent(boardLesson))).board;
      page = "global";
      render();
    }
    if (a === "career-sort" || a === "best-sort") {
      boardMode = a === "best-sort" ? "best" : "career";
      render();
    }
    if (a === "badges") {
      await refreshMe();
      page = "badges";
      render();
    }
    if (a === "projector") {
      projector = !projector;
      render();
    }
    if (a === "export") {
      const d = await api("/games/" + game.code + "/export");
      const keys = [
        "skipped",
        "owner",
        "restaurant",
        "round",
        "revenue",
        "cost",
        "fees",
        "penalty",
        "profit",
        "units",
      ];
      const csv = [
        keys.join(","),
        ...d.rows.map((r) =>
          keys
            .map((k) => {
              let v = String(
                ["revenue", "cost", "fees", "penalty", "profit"].includes(k)
                  ? (r[k] / 100).toFixed(2)
                  : r[k],
              );
              if (["owner", "restaurant"].includes(k) && /^[=+@\-\t\r]/.test(v))
                v = "'" + v;
              return '"' + v.replace(/"/g, '""') + '"';
            })
            .join(","),
        ),
      ].join("\r\n");
      const link = document.createElement("a"),
        url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
      link.href = url;
      link.download = "business-math-" + game.code + ".csv";
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
    if (a === "copy-board") {
      await navigator.clipboard.writeText(
        location.origin + "/?board=" + game.code,
      );
      toast("Public leaderboard link copied.");
    }
    if (a === "ready" || a === "unready") {
      btn.disabled = true;
      await actionRoom(a);
    }
  } catch (err) {
    toast(err.message);
    btn.disabled = false;
  }
});
root.addEventListener("input", (e) => {
  const form = e.target.closest("#pricing-form");
  if (form) pricingInput = Object.fromEntries(new FormData(form));
});
function previewRestaurant() {
  const form = document.querySelector("#join-form"),
    preview = document.querySelector("#restaurant-preview");
  if (!form || !preview) return;
  const values = Object.fromEntries(new FormData(form));
  preview.style.borderColor = values.color;
  preview.innerHTML = `<span>${esc(values.icon)}</span><div><strong>${esc(values.restaurant || "Pick your restaurant")}</strong><small>50 names · 32 signs · 16 colors</small></div>`;
}
function previewPromotion() {
  const form = document.querySelector("#promotion-form");
  if (!form) return;
  const b = Object.fromEntries(new FormData(form)),
    def = game.promotions.find((x) => x.id === b.id),
    target = game.player.menu.find((x) => x.id === b.target),
    other = game.player.menu.find((x) => x.id === b.companion);
  document.querySelector("#promo-description").textContent = def.description;
  const el = document.querySelector("#promo-preview");
  if (def.id === "none") {
    el.textContent = "Regular menu prices. No additional costs.";
    return;
  }
  if (!target) {
    el.textContent = "Choose an item to preview revenue and cost per offer.";
    return;
  }
  let price = target.price,
    cost = game.catalog.find((x) => x.id === target.id).cost;
  if (def.id === "bogo") cost *= 2;
  if (def.id === "half") {
    cost *= 2;
    price = Math.round(price * 1.5);
  }
  if (["ten", "happy"].includes(def.id)) price = Math.round(price * 0.9);
  if (def.id === "twenty") price = Math.round(price * 0.8);
  if (def.id === "dollar") price = Math.max(0, price - 100);
  if (def.companion) {
    if (!other || other === target) {
      el.textContent = "Choose a different eligible side or drink.";
      return;
    }
    cost += game.catalog.find((x) => x.id === other.id).cost;
    price =
      def.id === "bundle"
        ? Math.round((price + other.price) * 0.85)
        : def.id === "drink"
          ? price + Math.round(other.price * 0.5)
          : price;
  }
  el.textContent = `Per offer: revenue ${cash(price)} − food cost ${cash(cost)} = ${cash(price - cost)} before fees.${def.fee ? " Advertising fee: " + cash(def.fee) + " per round." : ""}`;
}
root.addEventListener("change", (e) => {
  if (e.target.closest("#promotion-form")) previewPromotion();
  if (e.target.closest("#join-form")) previewRestaurant();
});
window.render_game_to_text = () =>
  JSON.stringify({
    page,
    theme,
    coordinateSystem:
      "Canvas origin top-left; x right, y down. Gameplay uses HTML form controls.",
    user: user
      ? { name: user.name, badges: user.badges, avatar: user.avatar }
      : null,
    game: game
      ? {
          code: game.code,
          round: game.round,
          phase: game.phase,
          paused: game.paused,
          host: game.host,
          player: game.player,
          board: game.board,
          availableItems: game.catalog.length,
        }
      : null,
    selected,
    tutorial: root.querySelector(".tutorial-card") ? { step: tutorialStep + 1, total: 4, lesson: game.lesson.id } : null,
  });
window.advanceTime = () => {
  draw();
};
document.addEventListener("keydown", (e) => {
  if (
    e.key.toLowerCase() === "f" &&
    !e.ctrlKey &&
    !e.metaKey &&
    !e.altKey &&
    !["INPUT", "SELECT", "TEXTAREA"].includes(document.activeElement.tagName)
  ) {
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen().catch(() => {});
  }
});
let publicRoom = new URLSearchParams(location.search).get("board");
async function publicView() {
  let data;
  try { data = await api("/leaderboard?room=" + encodeURIComponent(publicRoom)); }
  catch (error) {
    if (error.status !== 404) throw error;
    root.innerHTML = `<main class="content"><section class="card"><h1>Game unavailable</h1><p>This room was deleted or its code is incorrect.</p><a class="btn" href="/">Return to home</a></section></main>`;
    return;
  }
  root.innerHTML = `<div class="content"><div class="row between">${brand}<div class="row">${themeButton()}<a class="btn ghost" href="/">Owner login</a></div></div><div class="page-heading" style="margin-top:40px"><div><span class="eyebrow">LIVE CLASSROOM LEADERBOARD</span><h1>${esc(data.name)}</h1><p class="muted">Round ${data.round} / 10 · ${esc(data.phase)} · Updated after every round</p></div></div><div class="card">${leaderboard(data.board)}</div></div>`;
}
(async () => {
  try {
    if (publicRoom) {
      await publicView();
      return;
    }
    await refreshMe();
  } catch {}
  render();
})();
setInterval(async () => {
  if (requestBusy) return;
  try {
    if (publicRoom) return await publicView();
    if (!user) return;
    if (game && ["game", "board"].includes(page)) {
      const next = await api("/games/" + game.code);
      notifySabotage(next);
      if (next.version !== game.version) {
        const editing = ["INPUT", "SELECT", "TEXTAREA"].includes(
          document.activeElement.tagName,
        );
        if (
          editing &&
          next.phase === game.phase &&
          next.round === game.round &&
          next.paused === game.paused &&
          next.sabotageMode === game.sabotageMode &&
          next.competition?.enabled === game.competition?.enabled &&
          JSON.stringify(next.alliances) === JSON.stringify(game.alliances) &&
          JSON.stringify(next.bonusSettings) === JSON.stringify(game.bonusSettings) &&
          next.player?.guidedEnabled === game.player?.guidedEnabled &&
          next.player?.skippedRound === game.player?.skippedRound
        )
          return;
        apply(next);
        render();
      }
    }
    if (page === "global") {
      boardData = (await api("/leaderboard?lessonId=" + encodeURIComponent(boardLesson))).board;
      render();
    }
  } catch (error) {
    if (error.status === 404 && game) {
      game = null; selected = null; pricingInput = {}; feedback = null; page = "home";
      await refreshMe(); render(); toast("This game was deleted by its teacher.");
    }
    /* Keep saved UI visible through a brief network interruption. */
  }
}, 2500);

root.addEventListener("change", async (e) => {
 if(e.target.id === "leaderboard-lesson") {boardLesson=e.target.value;try {boardData=(await api("/leaderboard?lessonId="+encodeURIComponent(boardLesson))).board;render();}catch(err){toast(err.message);}}
});
