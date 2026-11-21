/* Grade 7 · Number-Line Rescue — objective-led offline prototype.
   Source basis: G07-U01-MAT-L02 draft · rational-number operations (7.NS.A.1–2). Source evidence is draft; current map and approval remain unverified. */
(function () {
 const {h,s,svg,rint,shuffle}=window.LK;
 function art(label,scene) { scene=scene&&(scene.scene||scene); const g=svg(420,150,label); g.append(s("rect",{x:0,y:0,width:420,height:150,rx:16,fill:"#f6f5ff"}));
   const t=(x,y,text,fill="#36536a",size=14)=>g.append(s("text",{x,y,text,fill,"font-size":size,"font-weight":700}));const defs=s("defs");defs.append(s("marker",{id:"arrow",markerWidth:8,markerHeight:8,refX:6,refY:3,orient:"auto"},[s("path",{d:"M0 0 L0 6 L6 3 z",fill:"#7057c8"})]));g.append(defs);
   if(!scene){t(24,64,label,"#7057c8",18);t(24,94,"Observe · represent · reason","#667085",13);return g;}
   g.append(s("line",{x1:28,y1:83,x2:390,y2:83,stroke:"#247b83","stroke-width":3}));for(let n=-5;n<=5;n++){let x=45+(n+5)*33;g.append(s("line",{x1:x,y1:75,x2:x,y2:91,stroke:"#38445a","stroke-width":1}));if(n%2===0)t(x,112,String(n),"#38445a",11);}let sx=45+(scene.a+5)*33, ex=45+Math.max(0,Math.min(10,(scene.a+(scene.sub?-scene.b:scene.b))+5))*33;g.append(s("circle",{cx:sx,cy:83,r:7,fill:"#ef7857"}));g.append(s("path",{d:`M${sx} 60 Q${(sx+ex)/2} 32 ${ex} 60`,fill:"none",stroke:"#7057c8","stroke-width":3,"marker-end":"url(#arrow)"}));t(24,25,`Start at ${scene.a}; ${scene.sub?"subtract":"add"} ${scene.b}`,"#36536a",13);
   return g; }
 let callIndex=0;
 function make(i,level){ const a=[-7,-5,-3,4,8,2,-6,5][(i+level)%8],b=[3,-4,6,-7,-3,5,2,-8][(i*3+level)%8],sub=(i+level)%2===1,ans=sub?a-b:a+b; return {scene:{a,b,sub},prompt:`Start at ${a} on the number line. ${sub?'Subtract':'Add'} ${b}. Where do you land?`,answer:String(ans),opts:[String(ans),String(ans+1),String(ans-1)],why:`${sub?`Subtracting ${b} means add its opposite.`:`Move ${Math.abs(b)} units ${b<0?'left':'right'}.`} The result is ${ans}.`}; }
 function gate(el,L,prompt,correct,wrong,why){const wrap=h("div",{class:"fk-tiles"});[correct,wrong].forEach((label,i)=>{const b=h("button",{class:"fk-tile",type:"button",text:label});b.onclick=()=>i===0?L.ok(why):L.say("Not quite. "+why,"bad");wrap.append(b);});el.append(h("p",{class:"fk-sub",text:prompt}),wrap);}
 LK.start({ id:"g7-number-line-rescue",title:"Number-Line Rescue",emoji:"\ud83c\udf0a",topic:"Operate with rational numbers",grade:"Grade 7 \u00b7 draft-objective prototype",band:"g68",coach:"\ud83c\udf0a",
  how:{steps:["Read the prompt and notice the model.","Adding a negative moves left; subtracting a negative reverses direction and moves right.","Choose a response, then explain the relationship."] },
  world(el){el.append(art("Number-Line Rescue learning diagram"),h("p",{class:"fk-frame-caption",text:"Navigate positive and negative values on a number line; explain why subtracting a negative moves right."}));},
  learn:[
   {say:"The sea-level number line goes below zero as well as above it.",draw(el){el.append(art("lesson model"));}},
   {say:"Adding a negative moves left; subtracting a negative reverses direction and moves right.",draw(el){el.append(art("worked example"));}},
   {say:"Your turn: start at \u22122 and subtract \u22123.",wait:true,draw(el,L){gate(el,L,"Start at −2 and subtract −3. Where do you land?","1","−5","Subtracting a negative reverses direction: −2 + 3 = 1.");el.append(art("your turn"));}},
   {say:"Ghubar says two minus signs always make a negative answer. Test the direction on the line.",wait:true,draw(el,L){gate(el,L,"Subtracting a negative moves…","Right on the number line","Left on the number line","Subtract the negative means add its opposite.");el.append(art("spot the misconception"));}},
  ],
  levels:[
   {name:"Model match",icon:"🧩",blurb:"Use the diagram to identify the relationship.",rounds:4,round(R){const q=make(callIndex++,0);LK.ui.choice(R,{prompt:q.prompt,sub:"Use the model, not a guess.",art:()=>art("model match",q),answer:q.answer,options:shuffle([...new Set(q.opts)]).map(x=>({key:x,html:x})),cat:"sign-ignored",why:()=>q.why,hint:"Name what each number represents first."});}},
   {name:"Spot the pattern",icon:"🔎",blurb:"Connect the representation to the rule.",rounds:4,round(R){const q=make(callIndex+++2,1);LK.ui.choice(R,{prompt:q.prompt,sub:"Explain the place, group, direction or rate.",art:()=>art("representation",q),answer:q.answer,options:shuffle([...new Set(q.opts)]).map(x=>({key:x,html:x})),cat:"minus-negative",why:()=>q.why,hint:"Look for the relationship that stays constant."});}},
   {name:"Mission solve",icon:"🎯",blurb:"Solve a fresh example and check your reasoning.",rounds:4,round(R){const q=make(callIndex+++4,2);LK.ui.choice(R,{prompt:q.prompt,sub:"Enter the answer; use a negative sign or decimal point if needed.",art:()=>art("mission",q),answer:q.answer,options:shuffle([...new Set(q.opts)]).map(x=>({key:x,html:x})),cat:"magnitude-sign",why:()=>q.why,hint:"Use the worked example as a strategy, not as an answer."});}}
  ],
  praise:["Great model reading!","Reasoning on track!","A thoughtful solution!"],finale:"Mission complete \u2014 you can rational-number operations."
 });
})();
