'use strict';
const crypto=require('node:crypto');
const check=(ok,message)=>{if(!ok)throw Object.assign(new Error(message),{status:400});};
const enabled=g=>require('./classroom').settings(g).alliances;
const group=(g,id)=>(g.alliances||[]).find(a=>a.members.includes(id));
function open(g,p){check(enabled(g),'The teacher disabled alliances.');check(['lobby','planning'].includes(g.phase)&&!g.paused&&!p.ready&&p.skippedRound!==g.round,'Manage alliances during open planning before submitting.');}
function act(g,p,action,b){
 open(g,p);g.alliances??=[];g.allianceInvites??=[];
 if(action==='allianceInvite'){
  const target=g.players[b.target],mine=group(g,p.userId);
  check(target&&target.userId===b.target&&target!==p&&!target.ready&&target.skippedRound!==g.round,'Choose another available player.');
  check(!group(g,target.userId),'That player already belongs to an alliance.');check(!mine||mine.members.length<4,'Your alliance is full.');
  check(!g.allianceInvites.some(i=>i.from===p.userId&&i.to===target.userId),'You already invited this player.');
  g.allianceInvites.push({id:crypto.randomUUID(),from:p.userId,to:target.userId,groupId:mine?.id||null});
 }else if(action==='allianceAccept'){
  const invite=g.allianceInvites.find(i=>i.id===b.id&&i.to===p.userId);check(invite,'Invitation no longer available.');check(!group(g,p.userId),'Leave your current alliance first.');
  const inviter=g.players[invite.from];check(inviter&&!inviter.ready&&inviter.skippedRound!==g.round,'The inviter is not available to form an alliance now.');
  let mine=group(g,invite.from);check((mine?.id||null)===invite.groupId,'This alliance changed. Ask for a new invitation.');
  check(!mine||mine.members.length<4,'That alliance is full.');
  if(!mine){mine={id:crypto.randomUUID(),members:[invite.from],createdRound:g.round};g.alliances.push(mine);}
  mine.members.push(p.userId);
  // Invitations from the founding owner follow the newly formed group.
  for(const i of g.allianceInvites)if(i.from===invite.from&&i.groupId===null)i.groupId=mine.id;
  g.allianceInvites=g.allianceInvites.filter(i=>i.to!==p.userId&&i.from!==p.userId);
 }else if(action==='allianceDecline'){
  check(g.allianceInvites.some(i=>i.id===b.id&&(i.to===p.userId||i.from===p.userId)),'Invitation not found.');g.allianceInvites=g.allianceInvites.filter(i=>i.id!==b.id);
 }else if(action==='allianceLeave'){
  const mine=group(g,p.userId);check(mine,'You are not in an alliance.');
  check(g.phase==='lobby'||mine.members.every(id=>!g.players[id]?.ready),'An ally has submitted. Leave next round, or ask the teacher to reopen their submission.');
  mine.members=mine.members.filter(id=>id!==p.userId);g.alliances=g.alliances.filter(a=>a.members.length>=2);
  g.allianceInvites=g.allianceInvites.filter(i=>i.from!==p.userId&&i.to!==p.userId&&(!i.groupId||g.alliances.some(a=>a.id===i.groupId)));
 }else check(false,'Unknown alliance action.');
}
function dissolve(g,id){check((g.alliances||[]).some(a=>a.id===id),'Choose an alliance.');g.alliances=g.alliances.filter(a=>a.id!==id);g.allianceInvites=(g.allianceInvites||[]).filter(i=>i.groupId!==id);}
function view(g,id,host){return {enabled:enabled(g),groups:(g.alliances||[]).map(a=>({id:a.id,members:[...a.members]})),invitations:(g.allianceInvites||[]).filter(i=>host||i.to===id||i.from===id)};}
function saving(g,p,cost){const a=group(g,p.userId);return enabled(g)&&a&&a.members.filter(id=>g.players[id]?.skippedRound!==g.round).length>=2?Math.round(cost*.03):0;}
module.exports={group,act,dissolve,view,saving,enabled};
