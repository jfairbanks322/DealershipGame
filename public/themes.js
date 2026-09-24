/* Shared, validated appearance choices. Colors never affect game mechanics. */
(function(root){
 const themes = [
 ['classic','Classic Counter','Cream & forest green','#204c40','#dcf572','#f6f5ee'],
 ['arcade','Neon Arcade','Electric cyan & purple','#36235c','#78f3ec','#f1edfb'],
 ['sunset','Sunset Strip','Coral, orange & plum','#592c48','#ffc292','#fff2ed'],
 ['ocean','Ocean Blue','Navy & turquoise','#153e60','#7ee7ed','#edf7fb'],
 ['candy','Cotton Candy','Pink & lavender','#593460','#ffc4e9','#fff1fa'],
 ['lava','Lava Lounge','Charcoal & fiery orange','#49312a','#ffba82','#fff3eb'],
 ['mint','Mint Condition','Mint & deep teal','#174b47','#a3f1ca','#eefaf4'],
 ['golden','Golden Hour','Gold & warm brown','#503b25','#ffe08a','#fff8e7'],
 ['galaxy','Galaxy Diner','Midnight blue & violet','#302e60','#c9b8ff','#f3f1fc'],
 ['cherry','Cherry Pop','Cherry red & soft cream','#692c40','#ffbccc','#fff3f0']
 ].map(([id,name,description,deep,accent,paper])=>({id,name,description,deep,accent,paper}));
 if(typeof module!=='undefined'&&module.exports)module.exports=themes;
 else root.CounterThemes=themes;
})(typeof window==='undefined'?globalThis:window);
