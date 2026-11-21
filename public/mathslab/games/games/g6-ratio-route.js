/* Grade 6 · Ratio Route — objective-led offline prototype.
   Source basis: G06-U01-MAT-L01 draft · ratios, equivalent ratios and unit rates (6.RP.A.1–3). Source evidence is draft; current map and approval remain unverified. */
(function () {
 const {h,s,svg,rint,shuffle}=window.LK;
 function art(label,scene) { scene=scene&&(scene.scene||scene); const g=svg(420,150,label); g.append(s("rect",{x:0,y:0,width:420,height:150,rx:16,fill:"#f6f5ff"}));
   const t=(x,y,text,fill="#36536a",size=14)=>g.append(s("text",{x,y,text,fill,"font-size":size,"font-weight":700}));
   if(!scene){t(24,64,label,"#7057c8",18);t(24,94,"Observe · represent · reason","#667085",13);return g;}
   t(20,28,`Original recipe`,"#36536a",13);t(20,55,`${scene.a} mango`,"#ef8753",17);t(20,82,`${scene.b} water`,"#3597aa",17);g.append(s("path",{d:"M170 68h58m-10-10 10 10-10 10",fill:"none",stroke:"#7057c8","stroke-width":3}));t(245,55,scene.rate?`For 1 mango: ÷ ${scene.a}`:`Scale both by ×${scene.k}`,"#7057c8",15);t(245,82,scene.rate?"Find water per 1 mango":"Keep the taste the same", "#667085",13);
   return g; }
 let callIndex=0;
 function make(i,level){ const a=2+(i+level)%4,k=2+(i*2+level)%5,b=level===2?a*k:3+(i*2+level)%5,ans=level===2?k:b*(2+(i+level)%4); return {scene:{a,b,k,rate:level===2},prompt:level===2?`A recipe uses ${a} parts mango and ${b} parts water. How many water parts per 1 mango part?`:`The mix is ${a} parts mango to ${b} parts water. Scale both by ${k}. How many water parts?`,answer:String(ans),opts:[String(ans),String(ans+1),String(Math.max(0,ans-1))],why:level===2?`${b} ÷ ${a} = ${ans} water parts for each 1 mango part.`:`The scale factor is ${k}; multiply both parts. ${b} × ${2+(i+level)%4} = ${ans}.`}; }
 function gate(el,L,prompt,correct,wrong,why){const wrap=h("div",{class:"fk-tiles"});[correct,wrong].forEach((label,i)=>{const b=h("button",{class:"fk-tile",type:"button",text:label});b.onclick=()=>i===0?L.ok(why):L.say("Not quite. "+why,"bad");wrap.append(b);});el.append(h("p",{class:"fk-sub",text:prompt}),wrap);}
 LK.start({ id:"g6-ratio-route",title:"Ratio Route",emoji:"\ud83e\uddc3",topic:"Equivalent ratios and unit rates",grade:"Grade 6 \u00b7 draft-objective prototype",band:"g68",coach:"\ud83e\uddc3",
  how:{steps:["Read the prompt and notice the model.","To make more, multiply both parts by the same factor. 2:3 becomes 6:9 when both parts are tripled.","Choose a response, then explain the relationship."] },
  world(el){el.append(art("Ratio Route learning diagram"),h("p",{class:"fk-frame-caption",text:"Scale a recipe without changing its taste, then find the amount for one serving."}));},
  learn:[
   {say:"At the juice stand, a recipe ratio keeps the taste balanced.",draw(el){el.append(art("lesson model"));}},
   {say:"To make more, multiply both parts by the same factor. 2:3 becomes 6:9 when both parts are tripled.",draw(el){el.append(art("worked example"));}},
   {say:"Your turn: scale 2:5 by 4.",wait:true,draw(el,L){gate(el,L,"Scale 2:5 by 4. What is the new ratio?","8:20","6:9","Multiply both terms by 4 to preserve the ratio.");el.append(art("your turn"));}},
   {say:"Ghubar adds 4 to both numbers. Why does multiplying preserve the ratio?",wait:true,draw(el,L){gate(el,L,"How do you preserve a ratio?","Multiply both terms by the same factor","Add the same number to both","Equivalent ratios use a common multiplicative scale factor.");el.append(art("spot the misconception"));}},
  ],
  levels:[
   {name:"Model match",icon:"🧩",blurb:"Use the diagram to identify the relationship.",rounds:4,round(R){const q=make(callIndex++,0);LK.ui.choice(R,{prompt:q.prompt,sub:"Use the model, not a guess.",art:()=>art("model match",q),answer:q.answer,options:shuffle([...new Set(q.opts)]).map(x=>({key:x,html:x})),cat:"additive-ratio",why:()=>q.why,hint:"Name what each number represents first."});}},
   {name:"Spot the pattern",icon:"🔎",blurb:"Connect the representation to the rule.",rounds:4,round(R){const q=make(callIndex+++2,1);LK.ui.choice(R,{prompt:q.prompt,sub:"Explain the place, group, direction or rate.",art:()=>art("representation",q),answer:q.answer,options:shuffle([...new Set(q.opts)]).map(x=>({key:x,html:x})),cat:"order-reversed",why:()=>q.why,hint:"Look for the relationship that stays constant."});}},
   {name:"Mission solve",icon:"🎯",blurb:"Solve a fresh example and check your reasoning.",rounds:4,round(R){const q=make(callIndex+++4,2);LK.ui.keypad(R,{prompt:q.prompt,sub:"Enter the answer; use a negative sign or decimal point if needed.",art:()=>art("mission",q),answer:q.answer,max:12,cat:"unit-rate-not-per-one",why:()=>q.why,hint:"Use the worked example as a strategy, not as an answer."});}}
  ],
  praise:["Great model reading!","Reasoning on track!","A thoughtful solution!"],finale:"Mission complete \u2014 you can equivalent ratios and unit rates."
 });
})();
