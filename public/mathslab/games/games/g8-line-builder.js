/* Grade 8 · Line Builder — objective-led offline prototype.
   Source basis: G08-U01-MAT-L01 draft · linear relationships, slope and intercept (8.EE.B.5–6). Source evidence is draft; current map and approval remain unverified. */
(function () {
 const {h,s,svg,rint,shuffle}=window.LK;
 function art(label,scene) { scene=scene&&(scene.scene||scene); const g=svg(420,150,label); g.append(s("rect",{x:0,y:0,width:420,height:150,rx:16,fill:"#f6f5ff"}));
   const t=(x,y,text,fill="#36536a",size=14)=>g.append(s("text",{x,y,text,fill,"font-size":size,"font-weight":700}));
   if(!scene){t(24,64,label,"#7057c8",18);t(24,94,"Observe · represent · reason","#667085",13);return g;}
   g.append(s("line",{x1:36,y1:122,x2:390,y2:122,stroke:"#68758a"}));g.append(s("line",{x1:75,y1:138,x2:75,y2:23,stroke:"#68758a"}));for(let i=0;i<6;i++){let x=75+i*48,y=117-(scene.m*i+scene.b)*10;g.append(s("line",{x1:x,y1:25,x2:x,y2:122,stroke:"#e1e4ee"}));g.append(s("circle",{cx:x,cy:Math.max(26,Math.min(120,y)),r:4,fill:"#7057c8"}));}t(230,32,`m = ${scene.m} · rate`,"#7057c8",14);t(230,54,`b = ${scene.b} · start`,"#ef7857",14);
   return g; }
 let callIndex=0;
 function make(i,level){ const m=[-3,-2,-1,1,2,3,4,-4][(i+level)%8],b=[-4,-2,-1,0,2,3,4,1][(i*3+level)%8],x=2,y=m*x+b,ans=`y = ${m}x ${b<0?'− '+Math.abs(b):'+ '+b}`; return {scene:{m,b},prompt:`A line starts at y = ${b} and changes by ${m} for each 1 step right. At x = ${x}, what is y?`,answer:String(y),opts:[String(y),String(y+1),String(y-1)],why:`Use y = mx + b: ${m}×${x} + (${b}) = ${y}. The intercept is the starting value.`}; }
 function gate(el,L,prompt,correct,wrong,why){const wrap=h("div",{class:"fk-tiles"});[correct,wrong].forEach((label,i)=>{const b=h("button",{class:"fk-tile",type:"button",text:label});b.onclick=()=>i===0?L.ok(why):L.say("Not quite. "+why,"bad");wrap.append(b);});el.append(h("p",{class:"fk-sub",text:prompt}),wrap);}
 LK.start({ id:"g8-line-builder",title:"Line Builder",emoji:"\u2708\ufe0f",topic:"Linear relationships, slope and intercept",grade:"Grade 8 \u00b7 draft-objective prototype",band:"g68",coach:"\u2708\ufe0f",
  how:{steps:["Read the prompt and notice the model.","In y = mx + b, b is where the line crosses the y-axis; m is the change in y for each 1 step in x.","Choose a response, then explain the relationship."] },
  world(el){el.append(art("Line Builder learning diagram"),h("p",{class:"fk-frame-caption",text:"Build a line from its initial value and constant rate of change, then read its equation."}));},
  learn:[
   {say:"A straight-line route has a starting value and a constant rate of change.",draw(el){el.append(art("lesson model"));}},
   {say:"In y = mx + b, b is where the line crosses the y-axis; m is the change in y for each 1 step in x.",draw(el){el.append(art("worked example"));}},
   {say:"Your turn: for y = 2x + 3, identify m and b.",wait:true,draw(el,L){gate(el,L,"For y = 2x + 3, what are m and b?","m = 2, b = 3","m = 3, b = 2","m is the rate of change; b is the initial value.");el.append(art("your turn"));}},
   {say:"Ghubar swaps slope and intercept. The intercept is the start; slope is the rate.",wait:true,draw(el,L){gate(el,L,"In y = mx + b, what is b?","The y-intercept","The slope","b is the value of y when x = 0.");el.append(art("spot the misconception"));}},
  ],
  levels:[
   {name:"Model match",icon:"🧩",blurb:"Use the diagram to identify the relationship.",rounds:4,round(R){const q=make(callIndex++,0);LK.ui.choice(R,{prompt:q.prompt,sub:"Use the model, not a guess.",art:()=>art("model match",q),answer:q.answer,options:shuffle([...new Set(q.opts)]).map(x=>({key:x,html:x})),cat:"run-over-rise",why:()=>q.why,hint:"Name what each number represents first."});}},
   {name:"Spot the pattern",icon:"🔎",blurb:"Connect the representation to the rule.",rounds:4,round(R){const q=make(callIndex+++2,1);LK.ui.choice(R,{prompt:q.prompt,sub:"Explain the place, group, direction or rate.",art:()=>art("representation",q),answer:q.answer,options:shuffle([...new Set(q.opts)]).map(x=>({key:x,html:x})),cat:"intercept-on-x",why:()=>q.why,hint:"Look for the relationship that stays constant."});}},
   {name:"Mission solve",icon:"🎯",blurb:"Solve a fresh example and check your reasoning.",rounds:4,round(R){const q=make(callIndex+++4,2);LK.ui.choice(R,{prompt:q.prompt,sub:"Enter the answer; use a negative sign or decimal point if needed.",art:()=>art("mission",q),answer:q.answer,options:shuffle([...new Set(q.opts)]).map(x=>({key:x,html:x})),cat:"slope-sign",why:()=>q.why,hint:"Use the worked example as a strategy, not as an answer."});}}
  ],
  praise:["Great model reading!","Reasoning on track!","A thoughtful solution!"],finale:"Mission complete \u2014 you can slope and intercept."
 });
})();
