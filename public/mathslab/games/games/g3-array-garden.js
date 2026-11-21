/* Grade 3 · Array Garden — objective-led offline prototype.
   Source basis: G03-U01-MAT-L01 draft · products as equal groups and arrays (3.OA.A.1). Source evidence is draft; current map and approval remain unverified. */
(function () {
 const {h,s,svg,rint,shuffle}=window.LK;
 function art(label,scene) { scene=scene&&(scene.scene||scene); const g=svg(420,150,label); g.append(s("rect",{x:0,y:0,width:420,height:150,rx:16,fill:"#f6f5ff"}));
   const t=(x,y,text,fill="#36536a",size=14)=>g.append(s("text",{x,y,text,fill,"font-size":size,"font-weight":700}));
   if(!scene){t(24,64,label,"#7057c8",18);t(24,94,"Observe · represent · reason","#667085",13);return g;}
   for(let r=0;r<scene.r;r++)for(let c=0;c<scene.c;c++)g.append(s("circle",{cx:35+c*24,cy:32+r*25,r:7,fill:"#41a889"})); t(250,68,`${scene.r} rows`,"#36536a",17);t(250,95,`${scene.c} in each row`,"#36536a",15);t(250,122,"Rows × in each row", "#667085",12);
   return g; }
 let callIndex=0;
 function make(i,level){ const r=2+(i+level)%5,c=2+(i*2+level)%6,ans=r*c; return {scene:{r,c},prompt:`${r} equal rows have ${c} palms in each row. How many palms altogether?`,answer:String(ans),opts:[String(ans),String(ans+1),String(ans-1)],why:`An array has ${r} groups of ${c}: ${r} × ${c} = ${ans}.`}; }
 function gate(el,L,prompt,correct,wrong,why){const wrap=h("div",{class:"fk-tiles"});[correct,wrong].forEach((label,i)=>{const b=h("button",{class:"fk-tile",type:"button",text:label});b.onclick=()=>i===0?L.ok(why):L.say("Not quite. "+why,"bad");wrap.append(b);});el.append(h("p",{class:"fk-sub",text:prompt}),wrap);}
 LK.start({ id:"g3-array-garden",title:"Array Garden",emoji:"\ud83c\udf34",topic:"Multiplication as equal groups and arrays",grade:"Grade 3 \u00b7 draft-objective prototype",band:"g35",coach:"\ud83c\udf34",
  how:{steps:["Read the prompt and notice the model.","Rows \u00d7 palms in each row gives the total. A 3 by 4 array has 12 palms.","Choose a response, then explain the relationship."] },
  world(el){el.append(art("Array Garden learning diagram"),h("p",{class:"fk-frame-caption",text:"Arrange palms in equal rows, then connect each rectangle to repeated addition and a product."}));},
  learn:[
   {say:"A palm grove is planted in equal rows.",draw(el){el.append(art("lesson model"));}},
   {say:"Rows \u00d7 palms in each row gives the total. A 3 by 4 array has 12 palms.",draw(el){el.append(art("worked example"));}},
   {say:"Your turn: show 4 rows with 5 palms each as a multiplication fact.",wait:true,draw(el,L){gate(el,L,"Four rows with five in each row make…","4 × 5 = 20","4 + 5 = 9","Equal rows are groups: multiply rows by the number in each row.");el.append(art("your turn"));}},
   {say:"Ghubar counts only the top row. What must he count?",wait:true,draw(el,L){gate(el,L,"What should you count in an array?","Every row and every column","Only the first row","The total includes every equal group.");el.append(art("spot the misconception"));}},
  ],
  levels:[
   {name:"Model match",icon:"🧩",blurb:"Use the diagram to identify the relationship.",rounds:4,round(R){const q=make(callIndex++,0);LK.ui.choice(R,{prompt:q.prompt,sub:"Use the model, not a guess.",art:()=>art("model match",q),answer:q.answer,options:shuffle([...new Set(q.opts)]).map(x=>({key:x,html:x})),cat:"rows-columns-mixed",why:()=>q.why,hint:"Name what each number represents first."});}},
   {name:"Spot the pattern",icon:"🔎",blurb:"Connect the representation to the rule.",rounds:4,round(R){const q=make(callIndex+++2,1);LK.ui.choice(R,{prompt:q.prompt,sub:"Explain the place, group, direction or rate.",art:()=>art("representation",q),answer:q.answer,options:shuffle([...new Set(q.opts)]).map(x=>({key:x,html:x})),cat:"added-not-multiplied",why:()=>q.why,hint:"Look for the relationship that stays constant."});}},
   {name:"Mission solve",icon:"🎯",blurb:"Solve a fresh example and check your reasoning.",rounds:4,round(R){const q=make(callIndex+++4,2);LK.ui.keypad(R,{prompt:q.prompt,sub:"Enter the answer; use a negative sign or decimal point if needed.",art:()=>art("mission",q),answer:q.answer,max:12,cat:"one-row-only",why:()=>q.why,hint:"Use the worked example as a strategy, not as an answer."});}}
  ],
  praise:["Great model reading!","Reasoning on track!","A thoughtful solution!"],finale:"Mission complete \u2014 you can equal groups and arrays."
 });
})();
