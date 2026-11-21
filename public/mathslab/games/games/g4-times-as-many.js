/* Grade 4 · Times-as-Many Workshop — objective-led offline prototype.
   Source basis: G04-U01-MAT-L01 draft · multiplicative comparison (4.OA.A.1). Source evidence is draft; current map and approval remain unverified. */
(function () {
 const {h,s,svg,rint,shuffle}=window.LK;
 function art(label,scene) { scene=scene&&(scene.scene||scene); const g=svg(420,150,label); g.append(s("rect",{x:0,y:0,width:420,height:150,rx:16,fill:"#f6f5ff"}));
   const t=(x,y,text,fill="#36536a",size=14)=>g.append(s("text",{x,y,text,fill,"font-size":size,"font-weight":700}));
   if(!scene){t(24,64,label,"#7057c8",18);t(24,94,"Observe · represent · reason","#667085",13);return g;}
   t(24,30,`1 group = ${scene.one} units`,"#36536a",14);for(let i=0;i<scene.k;i++)g.append(s("rect",{x:24+i*46,y:45,width:40,height:35,rx:7,fill:i%2?"#b8e4ed":"#67b9cf",stroke:"#2d8ba2","stroke-width":1}));t(25,100,`Long bar: ${scene.k} equal groups`,"#36536a",14);t(25,126,"How many units altogether?", "#667085",12);
   return g; }
 let callIndex=0;
 function make(i,level){ const k=2+(i+level)%6,one=3+(i*2+level)%8,ans=k*one; return {scene:{one,k},prompt:`A long display is ${k} times as long as a ${one}-metre display. How long is it?`,answer:String(ans),opts:[String(ans),String(ans+1),String(ans-1)],why:`“${k} times as many” means multiply: ${k} × ${one} = ${ans}, not add ${k}.`}; }
 function gate(el,L,prompt,correct,wrong,why){const wrap=h("div",{class:"fk-tiles"});[correct,wrong].forEach((label,i)=>{const b=h("button",{class:"fk-tile",type:"button",text:label});b.onclick=()=>i===0?L.ok(why):L.say("Not quite. "+why,"bad");wrap.append(b);});el.append(h("p",{class:"fk-sub",text:prompt}),wrap);}
 LK.start({ id:"g4-times-as-many",title:"Times-as-Many Workshop",emoji:"\ud83d\udccf",topic:"Multiplicative comparison",grade:"Grade 4 \u00b7 draft-objective prototype",band:"g35",coach:"\ud83d\udccf",
  how:{steps:["Read the prompt and notice the model.","If one bar is 4 metres and the other is 3 times as long, the longer bar is 3 \u00d7 4 = 12 metres.","Choose a response, then explain the relationship."] },
  world(el){el.append(art("Times-as-Many Workshop learning diagram"),h("p",{class:"fk-frame-caption",text:"Compare lengths and quantities with multiplicative bars: how many times as many, not how many more?"}));},
  learn:[
   {say:"Two display bars have different lengths. We compare by asking how many times as long.",draw(el){el.append(art("lesson model"));}},
   {say:"If one bar is 4 metres and the other is 3 times as long, the longer bar is 3 \u00d7 4 = 12 metres.",draw(el){el.append(art("worked example"));}},
   {say:"Your turn: 5 times as many as 6 is\u2026",wait:true,draw(el,L){gate(el,L,"Five times as many as six is…","30","11","“Times as many” means 5 equal groups of 6.");el.append(art("your turn"));}},
   {say:"Ghubar adds 5 and 6. \u201cTimes as many\u201d asks for equal groups, not a difference.",wait:true,draw(el,L){gate(el,L,"Which operation models “times as many”?","Multiplication","Subtraction","Multiplicative comparison scales one quantity by a factor.");el.append(art("spot the misconception"));}},
  ],
  levels:[
   {name:"Model match",icon:"🧩",blurb:"Use the diagram to identify the relationship.",rounds:4,round(R){const q=make(callIndex++,0);LK.ui.choice(R,{prompt:q.prompt,sub:"Use the model, not a guess.",art:()=>art("model match",q),answer:q.answer,options:shuffle([...new Set(q.opts)]).map(x=>({key:x,html:x})),cat:"additive-for-multiplicative",why:()=>q.why,hint:"Name what each number represents first."});}},
   {name:"Spot the pattern",icon:"🔎",blurb:"Connect the representation to the rule.",rounds:4,round(R){const q=make(callIndex+++2,1);LK.ui.choice(R,{prompt:q.prompt,sub:"Explain the place, group, direction or rate.",art:()=>art("representation",q),answer:q.answer,options:shuffle([...new Set(q.opts)]).map(x=>({key:x,html:x})),cat:"comparison-order",why:()=>q.why,hint:"Look for the relationship that stays constant."});}},
   {name:"Mission solve",icon:"🎯",blurb:"Solve a fresh example and check your reasoning.",rounds:4,round(R){const q=make(callIndex+++4,2);LK.ui.keypad(R,{prompt:q.prompt,sub:"Enter the answer; use a negative sign or decimal point if needed.",art:()=>art("mission",q),answer:q.answer,max:12,cat:"unknown-factor",why:()=>q.why,hint:"Use the worked example as a strategy, not as an answer."});}}
  ],
  praise:["Great model reading!","Reasoning on track!","A thoughtful solution!"],finale:"Mission complete \u2014 you can multiplicative comparison."
 });
})();
