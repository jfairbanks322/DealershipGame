/* Flash Challenges use their own dialog so unfinished restaurant forms stay intact. */
let flashSnapshot=null,flashClockOffset=0;
const flashDismissed=new Set();
function flashWinners(c){return c.winners.length?`<ol class="flash-winners">${c.winners.map(w=>`<li><strong>#${w.rank} ${esc(w.owner)}</strong><span>${cash(w.amount)}</span></li>`).join('')}</ol>`:'<p class="muted">No winners yet.</p>';}
function flashTeacher(){
 const c=game.flash;
 return `<section class="card flash-teacher" id="flash-teacher"><span class="eyebrow">LIVE CLASSROOM CHALLENGE</span><h2>⚡ Flash Challenge</h2><p>First three correct answers win your cash prizes. One attempt per student. Answers open after a 5-second countdown; order is determined when answers reach the server.</p>${c?`<div class="math-note"><strong>${esc(c.question)}</strong><p>${c.open?'Open':'Closed'} · ${c.answered} of ${c.participants} answered</p><p><strong>Popup received: ${c.received||0} / ${c.participants}</strong></p>${c.unreceived?.length?`<p class="tiny">Not received yet: ${c.unreceived.map(esc).join(', ')}. Ask these students to refresh the game page once and stay signed in.</p>`:''}${flashWinners(c)}${c.open?`<button class="btn secondary" data-flash-close="${c.id}">Close challenge now</button>`:`<p>Correct answer: ${esc(c.options[c.correct])}</p>`}</div>`:''}${c?.open?'':`<form id="flash-form" class="stack"><label>Question bank<select id="flash-bank"><option value="">Write your own question</option>${(game.flashBank||[]).map(q=>`<option value="${q.id}">${esc(q.title)} · ${q.topic}</option>`).join('')}</select></label><button type="button" class="btn secondary" data-flash-random>Pick a random question</button><label>Question<textarea name="question" maxlength="300" minlength="3" required rows="2"></textarea></label><div class="grid2">${['A','B','C','D'].map((label,i)=>`<label>Answer ${label}<input name="option${i}" maxlength="120" required></label>`).join('')}</div><div class="grid2"><label>Correct answer<select name="correct">${['A','B','C','D'].map((label,i)=>`<option value="${i}">${label}</option>`).join('')}</select></label><label>Answer time (seconds)<input name="seconds" type="number" min="15" max="180" step="1" value="30" required></label></div><div class="flash-prizes">${[50,30,10].map((v,i)=>`<label>${['1st','2nd','3rd'][i]} prize ($)<input name="prize${i}" type="number" min="0" max="1000" step="0.01" value="${v}" required></label>`).join('')}</div><p class="tiny">Review before sending. Prizes and answers are locked once sent. Maximum $1,000 per place; prizes affect game and career scores. Pausing closes the challenge. Close it before simulating the round.</p><p role="status" id="flash-form-status"></p><button class="btn orange" ${game.phase!=='planning'||game.paused?'disabled':''}>Send Flash Challenge →</button>${game.phase!=='planning'||game.paused?'<p class="tiny">Available during open planning in this room.</p>':''}</form>`}</section>`;
}
function notifyFlash(g,force=false){
 if(!g||g.host||!g.player){document.querySelector("#flash-dialog")?.close();return;}
 const c=g.flash;flashSnapshot=c;flashClockOffset=c?c.serverNow-Date.now():0;
 const old=document.querySelector('#flash-dialog');
 if(!c||!c.eligible){old?.close();return;}
 if(old&&old.dataset.challenge!==c.id){old.close();old.remove();}
 const key=g.code+':'+c.id+':'+(c.open?'open':'closed');
 if(!force&&flashDismissed.has(key)&&!document.querySelector('#flash-dialog'))return;
 let d=document.querySelector('#flash-dialog');
 if(!d){
  d=document.createElement('dialog');d.id='flash-dialog';d.className='appearance-dialog flash-dialog';d.dataset.challenge=c.id;d.dataset.room=g.code;
  d.setAttribute('aria-labelledby','flash-title');
  d.innerHTML=`<div class="row between"><h2 id="flash-title">⚡ Flash Challenge</h2><button class="btn ghost small" data-flash-dismiss aria-label="Close Flash Challenge">✕</button></div><p id="flash-question"></p><p id="flash-timer" role="status"></p><div class="flash-prizes"></div><div class="flash-answers"></div><p id="flash-status" role="status"></p><div id="flash-winners"></div><p class="tiny">One answer only. First three correct answers received by the server win. Network speed can affect order. Your restaurant inputs stay in place.</p>`;
  d.addEventListener('close',()=>{flashDismissed.add(d.dataset.room+':'+d.dataset.challenge+':'+d.dataset.state);d.remove();});
  d.addEventListener('click',async e=>{
   const b=e.target.closest('button');if(!b)return;
   if(b.hasAttribute('data-flash-dismiss'))return d.close();
   if(b.dataset.choice===undefined)return;
   delete d.dataset.error;d.dataset.sending='true';paintFlash();
   try{const next=await api(`/games/${d.dataset.room}/flashAnswer`,{id:d.dataset.challenge,choice:Number(b.dataset.choice)});notifyFlash(next,true);}
   catch(e){d.dataset.error=e.message;}
   finally{delete d.dataset.sending;paintFlash();}
  });
  document.body.append(d);d.showModal();
 }
 d.dataset.state=c.open?'open':'closed';
 d.querySelector('#flash-title').textContent='⚡ Flash Challenge · '+g.name;
 acknowledgeFlash(d);
 paintFlash();
}
function paintFlash(){
 const d=document.querySelector('#flash-dialog'),c=flashSnapshot;if(!d||!c)return;
 const now=Date.now()+flashClockOffset,before=now<c.startsAt,expired=now>=c.endsAt;
 d.querySelector('#flash-question').textContent=c.question;
 d.querySelector('#flash-timer').textContent=!c.open?'Challenge closed':before?`Get ready… ${Math.max(0,Math.ceil((c.startsAt-now)/1000))}`:expired?'Time is up. Waiting for final results…':`${Math.ceil((c.endsAt-now)/1000)} seconds remaining`;
 d.querySelector('.flash-prizes').innerHTML=c.prizes.map((amount,i)=>`<span class="pill">#${i+1} · ${cash(amount)}</span>`).join('');
 const area=d.querySelector('.flash-answers');
 if(area.dataset.id!==c.id){area.innerHTML=c.options.map((o,i)=>`<button class="btn secondary" data-choice="${i}">${['A','B','C','D'][i]}. ${esc(o)}</button>`).join('');area.dataset.id=c.id;}
 area.querySelectorAll('button').forEach(b=>{b.disabled=!c.open||before||expired||!!c.answer||!!d.dataset.sending;b.setAttribute('aria-pressed',String(c.answer?.choice===Number(b.dataset.choice)));});
 if(!d.dataset.sending)d.querySelector('#flash-status').textContent=d.dataset.error|| (c.answer?c.answer.correct?`Correct! You placed #${c.answer.rank} and won ${cash(c.answer.amount)}.`:'Answer recorded. No prize this time.':c.open?'Choose carefully—you get one attempt.':'This challenge has ended.');
 d.querySelector('#flash-winners').innerHTML=flashWinners(c)+(!c.open?`<p>Correct answer: <strong>${esc(c.options[c.correct])}</strong></p>`:'');
}
setInterval(paintFlash,500);

// Delivery must not depend on an opened restaurant, the current tab, or form activity.
const flashReceipts=new Set();
async function acknowledgeFlash(d){
 const key=d.dataset.room+':'+d.dataset.challenge;
 if(flashReceipts.has(key))return;
 flashReceipts.add(key);
 try {await api(`/games/${d.dataset.room}/flashSeen`,{id:d.dataset.challenge});}
 catch {flashReceipts.delete(key);}
}
let flashPolling=false;
async function pollFlashInbox(){
 if(flashPolling||typeof user==='undefined'||!user||publicRoom)return;
 flashPolling=true;
 try {
  const accountId=user.id;
  const {challenges}=await api('/flashInbox');
  if(user?.id!==accountId)return;
  const existing=document.querySelector('#flash-dialog');
  const current=challenges.find(g=>g.flash.id===existing?.dataset.challenge);
  const next=current||challenges.find(g=>!flashDismissed.has(g.code+':'+g.flash.id+':'+(g.flash.open?'open':'closed')));
  if(next)notifyFlash(next);
  else if(existing&&!current)existing.close();
 } catch { /* Retry on the next poll after a connection interruption. */ }
 finally {flashPolling=false;}
}
setInterval(pollFlashInbox,1500);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)pollFlashInbox();});
window.addEventListener('online',pollFlashInbox);
