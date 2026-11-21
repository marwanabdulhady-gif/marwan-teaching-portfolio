/* Grade 1 · Chime Match — objective-led offline prototype.
   Source basis: G01-U01-MAT-L06 draft · full and half hours (code/current map not independently verified). Source evidence is draft; current map and approval remain unverified. */
(function () {
 const {h,s,svg,rint,shuffle}=window.LK;
 function art(label,scene) { scene=scene&&(scene.scene||scene); const g=svg(420,150,label); g.append(s("rect",{x:0,y:0,width:420,height:150,rx:16,fill:"#f6f5ff"}));
   const t=(x,y,text,fill="#36536a",size=14)=>g.append(s("text",{x,y,text,fill,"font-size":size,"font-weight":700}));
   if(!scene){t(24,64,label,"#7057c8",18);t(24,94,"Observe · represent · reason","#667085",13);return g;}
   const hourLabel=scene.half?(scene.hour===12?0:scene.hour)+0.5:scene.hour; const deg=hourLabel*30; g.append(s("circle",{cx:100,cy:82,r:55,fill:"#fff",stroke:"#247b83","stroke-width":4})); for(let n=1;n<=12;n++){let a=n*Math.PI/6-Math.PI/2;g.append(s("text",{x:100+Math.cos(a)*43,y:85+Math.sin(a)*43,"text-anchor":"middle","font-size":10,text:String(n)}));} g.append(s("line",{x1:100,y1:82,x2:100,y2:48,stroke:"#e8794a","stroke-width":5,"stroke-linecap":"round",transform:`rotate(${deg} 100 82)`})); let min=scene.half?180:0; g.append(s("line",{x1:100,y1:82,x2:100,y2:35,stroke:"#257a88","stroke-width":3,"stroke-linecap":"round",transform:`rotate(${min} 100 82)`})); t(180,72,`${scene.half?"HALF PAST":"O’CLOCK"}`,"#36536a",18); t(180,100,"Short hand: hour", "#667085",13);
   return g; }
 let callIndex=0;
 function make(i,level){ const h=[2,4,6,8,10,12][(i+level)%6], half=(i+level)%2===1, shown=half?((h%12)+.5):h, hour=Math.floor(shown)||12, ans=half?`${hour}:30`:`${hour}:00`; return {scene:{hour,half},prompt:`The long hand points to ${half?"6":"12"}. What time is it?`,answer:ans,opts:half?[ans,`${hour}:00`,`${hour===12?1:hour+1}:00`]:[ans,`${hour}:30`,`${hour===12?1:hour+1}:30`],why:`At a half hour the long hand points to 6; at o’clock it points to 12. Read the short hand for the hour.`}; }
 function gate(el,L,prompt,correct,wrong,why){const wrap=h("div",{class:"fk-tiles"});[correct,wrong].forEach((label,i)=>{const b=h("button",{class:"fk-tile",type:"button",text:label});b.onclick=()=>i===0?L.ok(why):L.say("Not quite. "+why,"bad");wrap.append(b);});el.append(h("p",{class:"fk-sub",text:prompt}),wrap);}
 LK.start({ id:"g1-chime-match",title:"Chime Match",emoji:"\ud83d\udd70\ufe0f",topic:"Read full and half hours",grade:"Grade 1 \u00b7 draft-objective prototype",band:"k2",coach:"\ud83d\udd70\ufe0f",
  how:{steps:["Read the prompt and notice the model.","At o\u2019clock, the long hand points to 12. At half past, it points to 6. The short hand names the hour.","Choose a response, then explain the relationship."] },
  world(el){el.append(art("Chime Match learning diagram"),h("p",{class:"fk-frame-caption",text:"Match Corniche chimes to analogue clocks: read the short hand and check whether the minute hand is at 12 or 6."}));},
  learn:[
   {say:"Noor hears a clock chime at the Corniche. Can you match the time?",draw(el){el.append(art("lesson model"));}},
   {say:"At o\u2019clock, the long hand points to 12. At half past, it points to 6. The short hand names the hour.",draw(el){el.append(art("worked example"));}},
   {say:"Your turn: when the long hand points to 6, is it an o\u2019clock time or a half-hour time?",wait:true,draw(el,L){gate(el,L,"When the long hand points to 6, what time type is it?","Half past","O’clock","The long hand at 6 means 30 minutes past the hour.");el.append(art("your turn"));}},
   {say:"Ghubar reads the long hand as the hour. Remember: the short hand tells the hour; the long hand tells the minutes.",wait:true,draw(el,L){gate(el,L,"Which hand tells the hour?","The short hand","The long hand","At a half hour, the short hand sits between hours; the long hand counts minutes.");el.append(art("spot the misconception"));}},
  ],
  levels:[
   {name:"Model match",icon:"🧩",blurb:"Use the diagram to identify the relationship.",rounds:4,round(R){const q=make(callIndex++,0);LK.ui.choice(R,{prompt:q.prompt,sub:"Use the model, not a guess.",art:()=>art("model match",q),answer:q.answer,options:shuffle([...new Set(q.opts)]).map(x=>({key:x,html:x})),cat:"minute-hand-as-hour",why:()=>q.why,hint:"Name what each number represents first."});}},
   {name:"Spot the pattern",icon:"🔎",blurb:"Connect the representation to the rule.",rounds:4,round(R){const q=make(callIndex+++2,1);LK.ui.choice(R,{prompt:q.prompt,sub:"Explain the place, group, direction or rate.",art:()=>art("representation",q),answer:q.answer,options:shuffle([...new Set(q.opts)]).map(x=>({key:x,html:x})),cat:"half-hour-hand-position",why:()=>q.why,hint:"Look for the relationship that stays constant."});}},
   {name:"Mission solve",icon:"🎯",blurb:"Solve a fresh example and check your reasoning.",rounds:4,round(R){const q=make(callIndex+++4,2);LK.ui.choice(R,{prompt:q.prompt,sub:"Enter the answer; use a negative sign or decimal point if needed.",art:()=>art("mission",q),answer:q.answer,options:shuffle([...new Set(q.opts)]).map(x=>({key:x,html:x})),cat:"hour-order",why:()=>q.why,hint:"Use the worked example as a strategy, not as an answer."});}}
  ],
  praise:["Great model reading!","Reasoning on track!","A thoughtful solution!"],finale:"Mission complete \u2014 you can full and half hours."
 });
})();
