'use strict';
function record(p,round,correct,assisted=false) {
  p.mathModesByRound??={};
  const modes=p.mathModesByRound[round]??={};
  const mode=(assisted?"assisted":"independent")+(correct?"Right":"Wrong");modes[mode]=(modes[mode]||0)+1;
  p.mathChecksByRound??={};
  const counts=p.mathChecksByRound[round]??={right:0,wrong:0};
  counts[correct?'right':'wrong']++;
}
function summary(p,round) {
  const attempts=Object.entries(p.attempts||{});
  const tracked=Object.entries(p.mathChecksByRound||{});
  function counts(filter){
    const stats=tracked.filter(([r])=>filter(Number(r))).reduce((n,[r,c])=>({right:n.right+c.right,wrong:n.wrong+c.wrong}),{right:0,wrong:0});
    const all=attempts.filter(([k])=>filter(Number(k.split(':')[0]))).reduce((n,[k,v])=>n+v,0);
    return {...stats,unclassified:Math.max(0,all-stats.right-stats.wrong)};
  }
  return {round:counts(r=>r===round),total:counts(()=>true)};
}
module.exports={record,summary};
