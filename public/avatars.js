/* Original illustrated owner portraits. Stable IDs preserve existing account selections. */
(function (root) {
  const rows = [
    // Saved ID, display name, backdrop, skin, hair, clothing, hairstyle, accessory.
    ['chef','Remy','#eed58d','#c98963','#352b35','#355e69','crop','cap'],
    ['fox','Jules','#e6a384','#f1bd94','#803f31','#465977','wave','earring'],
    ['panda','Kai','#aacbbf','#d29b76','#222d3a','#efe5ca','straight','glasses'],
    ['frog','Sage','#bfcd83','#89583e','#302d32','#76709b','curls','earring'],
    ['robot','Alex','#97c6d7','#edbc9c','#3d3245','#354754','crop','headphones'],
    ['space','Indigo','#b5a7d7','#b17756','#2d273d','#e9cf89','braids','glasses'],
    ['cat','Rowan','#dfaaca','#f1c9af','#b66245','#487873','bob','earring'],
    ['bear','Blake','#dbc1a1','#684431','#29262e','#bd805a','curls','headphones'],
    ['alien','Nova','#9eb7de','#be8563','#38374b','#b7c487','undercut','earring'],
    ['raccoon','Reese','#becbd6','#e1ae89','#53423c','#4a5675','wave','beanie'],
    ['owl','Quinn','#dfbe89','#895c43','#292737','#d4b898','braids','glasses'],
    ['tiger','River','#e5b0a0','#efbf96','#584335','#795b83','bob','beanie'],
    ['avery','Avery','#a4c8db','#dca47f','#43313a','#7c639f','ponytail','earring'],
    ['ellis','Ellis','#dfc88e','#704b39','#242b33','#427c77','fade','glasses'],
    ['morgan','Morgan','#c7b7df','#efbd99','#ac744b','#536582','shag','headphones'],
    ['sky','Sky','#a9cfb6','#c58c66','#595176','#b69058','bun','earring'],
    ['dakota','Dakota','#e8b8a2','#925d43','#332b30','#647494','locs','none'],
    ['finley','Finley','#b7cddd','#f0c9aa','#a3533f','#527464','wave','round'],
    ['parker','Parker','#d0c192','#b77e59','#342d35','#976a65','crop','beanie'],
    ['emery','Emery','#d7aad1','#e5b596','#594139','#487a85','ponytail','headband'],
    ['phoenix','Phoenix','#a9bddb','#744b35','#292b38','#b78b58','locs','earring'],
    ['arden','Arden','#c2d59e','#eec4a0','#a37a42','#726a94','shag','none'],
    ['milan','Milan','#e3b393','#b77d58','#353344','#4d657c','fade','headphones'],
    ['wren','Wren','#b3d3c8','#eac5ac','#5b4350','#af7c61','bun','round'],
    ['rory','Rory','#d5b2c2','#d39774','#b25840','#536b59','curls','cap'],
    ['eden','Eden','#a6bdd2','#684633','#282838','#9676a7','ponytail','glasses'],
    ['drew','Drew','#d6cc9e','#e7b895','#544534','#567487','straight','none'],
    ['aspen','Aspen','#bfc0e0','#9d694c','#353037','#a8835d','bun','headband'],
    ['zuri','Zuri','#e1b998','#80543c','#272c35','#477e77','locs','round'],
    ['auden','Auden','#a7cbd2','#e3ae89','#534c6a','#8a687e','undercut','headphones'],
    ['teagan','Teagan','#c9d0a4','#ba8562','#46313b','#62738f','shag','earring'],
    ['marley','Marley','#dbb6d0','#edc3a3','#78523f','#47746f','ponytail','beanie'],
  ];
  const circle=(x,y,r,fill)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}"/>`;
  const avatars=rows.map(([id,name,bg,skin,hair,shirt,style,accessory],index)=>{
    const long=['bob','braids'].includes(style),ink='#302c38';
    const backHair=style==='ponytail'?`<path d="M65 22q21-2 17 23l5 30q-20-2-18-26z" fill="${hair}"/>`:style==='bun'?circle(49,13,12,hair):long?`<path d="M25 46Q22 13 50 12q30 0 26 36l4 34H21z" fill="${hair}"/>`:'';
    const jacket=`<path d="M10 100l3-15q3-12 24-16h23q25 4 27 16l3 15" fill="${shirt}"/><path d="M37 69l11 14 12-14-3 31H39z" fill="#f5ead6"/><path d="M36 70L26 77l10 12-7 4m32-23 11 7-11 12 7 4" fill="none" stroke="${ink}" stroke-opacity=".22" stroke-width="2"/><path d="M17 88l-2 12m66-12 2 12" stroke="${ink}" opacity=".17" stroke-width="2"/>`;
    const hoodie=`<path d="M9 100l5-18q4-11 21-13h27q18 3 22 13l6 18" fill="${shirt}"/><path d="M34 70q14 16 28 0l5 9q-19 21-38 0z" fill="${ink}" opacity=".22"/><path d="M36 79v14m24-14v14" stroke="#ecdfc6" stroke-width="2" stroke-linecap="round"/><path d="M35 100l3-6h19l4 6" fill="none" stroke="${ink}" opacity=".22" stroke-width="2"/>`;
    const face=`<path d="M39 61h19v15q-9 10-19 0z" fill="${skin}"/><path d="M39 63q10 8 19-1v8q-10 8-19-1" fill="${ink}" opacity=".14"/>${circle(26,46,6,skin)}${circle(71,46,6,skin)}<path d="M27 34q0-19 21-19t22 19v16q-1 13-10 19-10 7-21 0-11-6-12-19z" fill="${skin}"/><path d="M65 34v18q-1 11-10 17 14-3 15-19V34z" fill="${ink}" opacity=".08"/>`;
    const hairstyles={
      ponytail:`<path d="M25 44V31q-1-20 25-20 24 0 24 20l-4 14-6-20q-12 12-32 8l-2 12z" fill="${hair}"/><path d="M37 20q13-7 26 2" fill="none" stroke="#fff" opacity=".13" stroke-width="2"/>`,
      bun:`<path d="M24 43V29q0-19 25-19 25 0 25 19l-3 15-7-20q-16 12-32 0l-3 19z" fill="${hair}"/><path d="M40 9q9-5 16 0" stroke="#fff" opacity=".13" stroke-width="2" fill="none"/>`,
      fade:`<path d="M25 43V29q0-18 24-18 24 0 24 18v14l-5-8-3-12q-16 8-32 0l-3 12z" fill="${hair}"/><path d="M26 33h5m-5 4h4m36-4h5m-4 4h4" stroke="${skin}" opacity=".6" stroke-width="2"/>`,
      shag:`<path d="M22 48l2-17-6 4 9-17 1 6q3-16 18-14l16-3-3 6q17 2 16 23l5 13-10-6-5-16-8 13-2-12-12 12 1-12-12 9-2 10z" fill="${hair}"/><path d="M32 23q10-9 22-8" stroke="#fff" opacity=".15" stroke-width="2" fill="none"/>`,
      locs:`<path d="M23 39q-4-26 25-28 30 0 26 28l-8-11q-17 8-34 0z" fill="${hair}"/>`+[27,35,43,52,61,70].map((x,i)=>`<path d="M${x} 22q-3 8 ${i%2?0:3} 15" stroke="${hair}" stroke-width="7" stroke-linecap="round"/>`).join('')+`<path d="M26 35v28m45-28v28" stroke="${hair}" stroke-width="7" stroke-linecap="round"/><path d="M25 51v5m46-14v5" stroke="#d8b576" stroke-width="3"/>`,
      crop:`<path d="M26 44l-3-13q1-19 27-18 23-2 24 18l-4 12-6-16q-17 10-33 1l-1 16z" fill="${hair}"/><path d="M32 22q12-7 27-2" fill="none" stroke="#fff" stroke-opacity=".12" stroke-width="3" stroke-linecap="round"/>`,
      wave:`<path d="M24 44q-7-25 12-29 6-13 24-5 22 7 14 35l-7-12q-5-1-6-12-8 15-29 13l-2 11z" fill="${hair}"/><path d="M33 25q16 1 24-10" fill="none" stroke="#fff" stroke-opacity=".13" stroke-width="3" stroke-linecap="round"/>`,
      straight:`<path d="M24 46V30q0-19 25-19 24 0 25 20v15h-5l-5-18-4 9-4-8-4 7-5-8-16 7-2 11z" fill="${hair}"/><path d="M31 22q16-9 32 1" fill="none" stroke="#fff" stroke-opacity=".1" stroke-width="3"/>`,
      curls:[ [28,29,10],[29,19,9],[40,15,10],[52,15,11],[64,19,10],[70,30,9],[26,39,5],[71,40,5] ].map(([x,y,r])=>circle(x,y,r,hair)).join('')+`<path d="M32 19q5-5 9 0m8-4q5-4 9 1" stroke="#fff" stroke-opacity=".12" stroke-width="2" fill="none"/>`,
      bob:`<path d="M25 46V30q1-19 25-19 25 0 25 23l2 38H65V31q-15 7-23-5-2 13-12 15v31H22z" fill="${hair}"/><path d="M66 24q6 13 5 39" stroke="#fff" stroke-opacity=".13" stroke-width="3" fill="none"/>`,
      braids:`<path d="M24 38q-4-25 25-26 29 0 24 27l-9-11q-16 11-32 0z" fill="${hair}"/>`+[25,72].map(x=>Array.from({length:7},(_,i)=>`<ellipse cx="${x+(i%2?1:-1)}" cy="${36+i*6}" rx="4.8" ry="5" fill="${hair}" stroke="#fff" stroke-opacity=".08"/>`).join('')).join('')+`<path d="M26 73v4m46-4v4" stroke="#edc575" stroke-width="3"/>`,
      undercut:`<path d="M25 44V30q0-19 23-19 26-1 26 22l-6 10-3-21q-14 15-33 13l-2 10z" fill="${hair}"/><path d="M29 28q9-17 29-12-8 11-29 12" fill="#a8a0ce"/><path d="M26 35h5m-5 4h5" stroke="#8e7c80" stroke-width="2"/>`,
    };
    const eyes=`<path d="M33 42q5-3 10-1m12 0q5-2 9 1" fill="none" stroke="${hair}" stroke-width="2.2" stroke-linecap="round"/><ellipse cx="38" cy="47" rx="2.1" ry="2.8" fill="${ink}"/><ellipse cx="59" cy="47" rx="2.1" ry="2.8" fill="${ink}"/>${circle(38.6,46.1,.7,'#fff')}${circle(59.6,46.1,.7,'#fff')}<path d="M49 47l-2 8 4 1" fill="none" stroke="${ink}" stroke-opacity=".23" stroke-width="1.5" stroke-linecap="round"/>${index%3===0?`<path d="M41 60q8 10 15-1" fill="#7f4145"/><path d="M43 61l11-1" stroke="#fff0de" stroke-width="2"/>`:`<path d="M42 61q7 ${index%2?5:3} 13-1" fill="none" stroke="#79464a" stroke-width="2" stroke-linecap="round"/>`}`;
    const accessories={
      none:'',
      round:`<g fill="none" stroke="#ad8956" stroke-width="2.2"><circle cx="38" cy="48" r="9"/><circle cx="59" cy="48" r="9"/><path d="M47 47h3m-24-3 4 2m38 0 4-2"/></g>`,
      headband:`<path d="M25 31q22-15 47 0" fill="none" stroke="#dfb887" stroke-width="7"/><path d="M28 29q20-11 41 0" fill="none" stroke="#fff0d5" stroke-width="1.5"/>`,
      cap:`<path d="M23 30q0-21 26-21 24 0 24 21z" fill="#304857"/><path d="M22 30q31-8 56 1l-2 6q-29-8-54-1z" fill="#547481"/><path d="M44 16h11v9H44z" fill="#e9cf87"/>`,
      glasses:`<g fill="none" stroke="#394452" stroke-width="2.3"><rect x="30" y="42" width="16" height="13" rx="5"/><rect x="52" y="42" width="16" height="13" rx="5"/><path d="M46 46h6m-26-2h4m38 0h4"/></g><path d="M34 45l4-1m18 1 4-1" stroke="#fff" stroke-opacity=".55" stroke-width="1.5"/>`,
      earring:`<circle cx="72" cy="53" r="4" fill="none" stroke="#f7db91" stroke-width="2.3"/>`,
      headphones:`<path d="M20 47V33q0-24 29-24 28 0 28 24v14" fill="none" stroke="#333e50" stroke-width="5"/><path d="M24 26q9-20 28-15" fill="none" stroke="#a6b6cd" stroke-width="2"/><rect x="18" y="39" width="9" height="20" rx="4" fill="#526c83"/><rect x="71" y="39" width="9" height="20" rx="4" fill="#526c83"/><path d="M21 44v9m56-9v9" stroke="#d6e791" stroke-width="2"/>`,
      beanie:`<path d="M23 29q0-23 26-23 25 0 25 23z" fill="#cfac7c"/><path d="M29 24l3-10m8 9 1-12m10 12V11m11 13-3-11" stroke="#9d7b60" opacity=".5" stroke-width="2"/><rect x="22" y="24" width="53" height="11" rx="4" fill="#e0c191"/><path d="M59 27h9v6h-9z" fill="#415365"/>`,
    };
    return {id,name,svg:`<svg viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect width="96" height="96" rx="24" fill="${bg}"/><path d="M0 66L96 17v79H0z" fill="#fff" opacity=".13"/><circle cx="79" cy="17" r="19" fill="#fff" opacity=".17"/><path d="M10 20h9m-4-4v8" stroke="#fff" stroke-width="2" opacity=".5"/>${backHair}${index%2?jacket:hoodie}${face}${hairstyles[style]}${eyes}${accessories[accessory]}<path d="M74 86h7v7h-7z" fill="#eee4c8" opacity=".85"/></svg>`};
  });
  if(typeof module!=='undefined'&&module.exports)module.exports=avatars;
  else root.CounterAvatars=avatars;
})(globalThis);
