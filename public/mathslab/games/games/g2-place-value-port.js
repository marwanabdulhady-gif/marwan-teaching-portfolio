/* Grade 2 · Place-Value Port — objective-led offline prototype.
   Source basis: G02-U01-MAT-L02 draft · place value through 1,000 (2.NBT.A.1). Source evidence is draft; current map and approval remain unverified. */
(function () {
 const {h,s,svg,rint,shuffle}=window.LK;
 function art(label,scene) { scene=scene&&(scene.scene||scene); const g=svg(420,150,label); g.append(s("rect",{x:0,y:0,width:420,height:150,rx:16,fill:"#f6f5ff"}));
   const t=(x,y,text,fill="#36536a",size=14)=>g.append(s("text",{x,y,text,fill,"font-size":size,"font-weight":700}));
   if(!scene){t(24,64,label,"#7057c8",18);t(24,94,"Observe · represent · reason","#667085",13);return g;}
   t(75,35,"HUNDREDS","#7057c8",12);t(210,35,"TENS","#bc6b31",12);t(340,35,"ONES","#238576",12);[[scene.H,28,"#eee9ff","#7057c8"],[scene.T,160,"#fff0df","#bc6b31"],[scene.O,292,"#e2f6f1","#238576"]].forEach(([v,x,fill,stroke])=>{g.append(s("rect",{x,y:50,width:105,height:60,rx:12,fill,stroke,"stroke-width":2}));t(x+52,89,String(v),stroke,28);}); t(75,133,"×100", "#667085",12);t(210,133,"×10", "#667085",12);t(342,133,"×1", "#667085",12);
   return g; }
 let callIndex=0;
 function make(i,level){ const n=[204,370,508,691,840,905,276,430][(i*3+level)%8], H=Math.floor(n/100),T=Math.floor(n/10)%10,O=n%10; const ans=String(n); return {scene:{H,T,O},prompt:`Load ${H} hundreds, ${T} tens and ${O} ones. Which number is on the manifest?`,answer:ans,opts:[ans,String(n+11),String(n-11)],why:`${H}×100 + ${T}×10 + ${O} = ${n}. Keep the zero in its place.`}; }
 function gate(el,L,prompt,correct,wrong,why){const wrap=h("div",{class:"fk-tiles"});[correct,wrong].forEach((label,i)=>{const b=h("button",{class:"fk-tile",type:"button",text:label});b.onclick=()=>i===0?L.ok(why):L.say("Not quite. "+why,"bad");wrap.append(b);});el.append(h("p",{class:"fk-sub",text:prompt}),wrap);}
 LK.start({ id:"g2-place-value-port",title:"Place-Value Port",emoji:"\u2693",topic:"Build and compare numbers to 1,000",grade:"Grade 2 \u00b7 draft-objective prototype",band:"k2",coach:"\u2693",
  how:{steps:["Read the prompt and notice the model.","Each digit has a place: 3 hundreds, 4 tens and 5 ones make 345.","Choose a response, then explain the relationship."] },
  world(el){el.append(art("Place-Value Port learning diagram"),h("p",{class:"fk-frame-caption",text:"Load hundreds, tens and ones into the right cargo holds, including zero placeholders."}));},
  learn:[
   {say:"A cargo manifest lists hundreds, tens and ones.",draw(el){el.append(art("lesson model"));}},
   {say:"Each digit has a place: 3 hundreds, 4 tens and 5 ones make 345.",draw(el){el.append(art("worked example"));}},
   {say:"Your turn: in 208, how many tens? Keep the zero placeholder.",wait:true,draw(el,L){gate(el,L,"In 208, how many tens are there?","0 tens","8 tens","The tens digit is 0. Keep that placeholder between hundreds and ones.");el.append(art("your turn"));}},
   {say:"Ghubar writes 208 as 28. What place would disappear?",wait:true,draw(el,L){gate(el,L,"Why do we write 208, not 28?","The zero holds the tens place","The zero means add 10","One digit belongs in each place-value column.");el.append(art("spot the misconception"));}},
  ],
  levels:[
   {name:"Model match",icon:"🧩",blurb:"Use the diagram to identify the relationship.",rounds:4,round(R){const q=make(callIndex++,0);LK.ui.choice(R,{prompt:q.prompt,sub:"Use the model, not a guess.",art:()=>art("model match",q),answer:q.answer,options:shuffle([...new Set(q.opts)]).map(x=>({key:x,html:x})),cat:"pv-concat",why:()=>q.why,hint:"Name what each number represents first."});}},
   {name:"Spot the pattern",icon:"🔎",blurb:"Connect the representation to the rule.",rounds:4,round(R){const q=make(callIndex+++2,1);LK.ui.choice(R,{prompt:q.prompt,sub:"Explain the place, group, direction or rate.",art:()=>art("representation",q),answer:q.answer,options:shuffle([...new Set(q.opts)]).map(x=>({key:x,html:x})),cat:"pv-zero",why:()=>q.why,hint:"Look for the relationship that stays constant."});}},
   {name:"Mission solve",icon:"🎯",blurb:"Solve a fresh example and check your reasoning.",rounds:4,round(R){const q=make(callIndex+++4,2);LK.ui.keypad(R,{prompt:q.prompt,sub:"Enter the answer; use a negative sign or decimal point if needed.",art:()=>art("mission",q),answer:q.answer,max:12,cat:"pv-swap",why:()=>q.why,hint:"Use the worked example as a strategy, not as an answer."});}}
  ],
  praise:["Great model reading!","Reasoning on track!","A thoughtful solution!"],finale:"Mission complete \u2014 you can hundreds, tens, ones."
 });
})();
