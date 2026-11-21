/* Grade 5 · Decimal Shift Lab — objective-led offline prototype.
   Source basis: G05-U01-MAT-L01 draft · decimal place value and powers of ten (5.NBT.A.1–2). Source evidence is draft; current map and approval remain unverified. */
(function () {
 const {h,s,svg,rint,shuffle}=window.LK;
 function art(label,scene) { scene=scene&&(scene.scene||scene); const g=svg(420,150,label); g.append(s("rect",{x:0,y:0,width:420,height:150,rx:16,fill:"#f6f5ff"}));
   const t=(x,y,text,fill="#36536a",size=14)=>g.append(s("text",{x,y,text,fill,"font-size":size,"font-weight":700}));
   if(!scene){t(24,64,label,"#7057c8",18);t(24,94,"Observe · represent · reason","#667085",13);return g;}
   const str=String(scene.x);t(20,35,`${scene.div?"÷":"×"} ${scene.k}`,"#7057c8",14);for(let i=0;i<str.length;i++){let x=28+i*44;g.append(s("rect",{x,y:48,width:38,height:43,rx:6,fill:i===str.indexOf(".")?"#fff0df":"#fff",stroke:"#9383dc","stroke-width":1.5}));t(x+19,76,str[i],"#36415a",20);}t(24,118,"Track every digit’s place", "#667085",13);
   return g; }
 let callIndex=0;
 function make(i,level){ const x=[1.24,2.5,0.36,4.08,6.2,0.75,3.45,0.9][(i*3+level)%8], k=[10,100][(i+level)%2], div=(i+level)%3===0, y=div?x/k:x*k, ans=String(Number(y.toFixed(3))); return {scene:{x,k,div},prompt:`${div?'Divide':'Multiply'} ${x} ${div?'by':'by'} ${k}. What is the result?`,answer:ans,opts:[ans,String(Number((div?x*k:x/k).toFixed(3))),String(Number((x+(div?1:-1)).toFixed(3)))],why:`Each place is worth ${k} times the place ${div?'to the right':'to the left'}. Move every digit place, not just the decimal point.`}; }
 function gate(el,L,prompt,correct,wrong,why){const wrap=h("div",{class:"fk-tiles"});[correct,wrong].forEach((label,i)=>{const b=h("button",{class:"fk-tile",type:"button",text:label});b.onclick=()=>i===0?L.ok(why):L.say("Not quite. "+why,"bad");wrap.append(b);});el.append(h("p",{class:"fk-sub",text:prompt}),wrap);}
 LK.start({ id:"g5-decimal-shift",title:"Decimal Shift Lab",emoji:"\ud83d\udd1f",topic:"Decimal place value and powers of ten",grade:"Grade 5 \u00b7 draft-objective prototype",band:"g35",coach:"\ud83d\udd1f",
  how:{steps:["Read the prompt and notice the model.","Multiplying by 10 shifts each digit one place left; dividing by 10 shifts it one place right.","Choose a response, then explain the relationship."] },
  world(el){el.append(art("Decimal Shift Lab learning diagram"),h("p",{class:"fk-frame-caption",text:"Trace how each digit shifts when a decimal is multiplied or divided by 10 and 100."}));},
  learn:[
   {say:"In the decimal lab, every digit sits in a place-value column.",draw(el){el.append(art("lesson model"));}},
   {say:"Multiplying by 10 shifts each digit one place left; dividing by 10 shifts it one place right.",draw(el){el.append(art("worked example"));}},
   {say:"Your turn: 2.5 \u00d7 10 = ?",wait:true,draw(el,L){gate(el,L,"2.5 × 10 = ?","25","2.05","Multiplying by 10 shifts each digit one place left in value.");el.append(art("your turn"));}},
   {say:"Ghubar moves only the decimal point. Track the value of every digit instead.",wait:true,draw(el,L){gate(el,L,"What shifts when multiplying by 10?","Each digit’s place value","Only the decimal point","Digits keep their values; their place changes.");el.append(art("spot the misconception"));}},
  ],
  levels:[
   {name:"Model match",icon:"🧩",blurb:"Use the diagram to identify the relationship.",rounds:4,round(R){const q=make(callIndex++,0);LK.ui.choice(R,{prompt:q.prompt,sub:"Use the model, not a guess.",art:()=>art("model match",q),answer:q.answer,options:shuffle([...new Set(q.opts)]).map(x=>({key:x,html:x})),cat:"decimal-point-only",why:()=>q.why,hint:"Name what each number represents first."});}},
   {name:"Spot the pattern",icon:"🔎",blurb:"Connect the representation to the rule.",rounds:4,round(R){const q=make(callIndex+++2,1);LK.ui.choice(R,{prompt:q.prompt,sub:"Explain the place, group, direction or rate.",art:()=>art("representation",q),answer:q.answer,options:shuffle([...new Set(q.opts)]).map(x=>({key:x,html:x})),cat:"shift-wrong-way",why:()=>q.why,hint:"Look for the relationship that stays constant."});}},
   {name:"Mission solve",icon:"🎯",blurb:"Solve a fresh example and check your reasoning.",rounds:4,round(R){const q=make(callIndex+++4,2);LK.ui.choice(R,{prompt:q.prompt,sub:"Enter the answer; use a negative sign or decimal point if needed.",art:()=>art("mission",q),answer:q.answer,options:shuffle([...new Set(q.opts)]).map(x=>({key:x,html:x})),cat:"place-value-confusion",why:()=>q.why,hint:"Use the worked example as a strategy, not as an answer."});}}
  ],
  praise:["Great model reading!","Reasoning on track!","A thoughtful solution!"],finale:"Mission complete \u2014 you can decimal place value."
 });
})();
