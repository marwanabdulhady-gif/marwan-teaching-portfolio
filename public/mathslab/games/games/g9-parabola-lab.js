/* Grade 9 · Parabola Lab — objective-led offline prototype.
   Source basis: G09-U01-MAT-L01 draft · quadratic functions and equations (HSA.REI.B.4, HSF.IF.C.7a). Source evidence is draft; current map and approval remain unverified. */
(function () {
 const {h,s,svg,rint,shuffle}=window.LK;
 function art(label,scene) { scene=scene&&(scene.scene||scene); const g=svg(420,150,label); g.append(s("rect",{x:0,y:0,width:420,height:150,rx:16,fill:"#f6f5ff"}));
   const t=(x,y,text,fill="#36536a",size=14)=>g.append(s("text",{x,y,text,fill,"font-size":size,"font-weight":700}));
   if(!scene){t(24,64,label,"#7057c8",18);t(24,94,"Observe · represent · reason","#667085",13);return g;}
   const vx=Math.max(120,Math.min(300,210+scene.h*22)),vy=Math.max(38,Math.min(112,74-scene.k*9)),sign=scene.a>0?1:-1;g.append(s("line",{x1:25,y1:125,x2:395,y2:125,stroke:"#98a3b5"}));g.append(s("line",{x1:210,y1:20,x2:210,y2:132,stroke:"#98a3b5"}));g.append(s("path",{d:`M35 ${sign>0?Math.min(128,vy+74):Math.max(22,vy-74)} Q${vx} ${vy} 385 ${sign>0?Math.min(128,vy+74):Math.max(22,vy-74)}`,fill:"none",stroke:"#7057c8","stroke-width":4}));g.append(s("circle",{cx:vx,cy:vy,r:7,fill:"#ef7857"}));g.append(s("line",{x1:vx,y1:vy,x2:vx,y2:125,stroke:"#98a3b5","stroke-dasharray":"4 4"}));t(235,54,`${scene.a>0?"opens up":"opens down"}`,"#36536a",14);t(235,82,"Locate the turning point", "#667085",13);
   return g; }
 let callIndex=0;
 function make(i,level){ const h=[-3,-2,-1,1,2,3,0,4][(i+level)%8],k=[-2,0,1,3,-1,2,4,-3][(i*3+level)%8],a=(i+level)%3===0?-1:1,ans=`(${h}, ${k})`,expr=`y = ${a<0?'−':''}(x ${h>0?'− '+h:h<0?'+ '+Math.abs(h):''})² ${k<0?'− '+Math.abs(k):'+ '+k}`; return {scene:{h,k,a},prompt:`For ${expr}, what is the vertex?`,answer:ans,opts:[ans,`(${h+1}, ${k})`,`(${h}, ${k+1})`],why:`Vertex form y = a(x − h)² + k has vertex (${h}, ${k}). The signs inside the bracket reverse.`}; }
 function gate(el,L,prompt,correct,wrong,why){const wrap=h("div",{class:"fk-tiles"});[correct,wrong].forEach((label,i)=>{const b=h("button",{class:"fk-tile",type:"button",text:label});b.onclick=()=>i===0?L.ok(why):L.say("Not quite. "+why,"bad");wrap.append(b);});el.append(h("p",{class:"fk-sub",text:prompt}),wrap);}
 LK.start({ id:"g9-parabola-lab",title:"Parabola Lab",emoji:"\ud83e\udd85",topic:"Vertex form and quadratic graph features",grade:"Grade 9 \u00b7 draft-objective prototype",band:"g912",coach:"\ud83e\udd85",
  how:{steps:["Read the prompt and notice the model.","In y = a(x \u2212 h)\u00b2 + k, the vertex is (h,k). The sign inside the brackets reverses.","Choose a response, then explain the relationship."] },
  world(el){el.append(art("Parabola Lab learning diagram"),h("p",{class:"fk-frame-caption",text:"Read a quadratic from its turning point, direction and intercepts; connect the equation to its graph."}));},
  learn:[
   {say:"A quadratic graph has a turning point called its vertex.",draw(el){el.append(art("lesson model"));}},
   {say:"In y = a(x \u2212 h)\u00b2 + k, the vertex is (h,k). The sign inside the brackets reverses.",draw(el){el.append(art("worked example"));}},
   {say:"Your turn: y = (x \u2212 3)\u00b2 + 2 has vertex\u2026",wait:true,draw(el,L){gate(el,L,"For y = (x − 3)² + 2, the vertex is…","(3, 2)","(−3, 2)","In vertex form, the sign inside (x − h) reverses; the vertex is (h,k).");el.append(art("your turn"));}},
   {say:"Ghubar reads the vertex as (\u22123,2). Check the sign of h inside (x \u2212 h).",wait:true,draw(el,L){gate(el,L,"In y = a(x − h)² + k, the vertex is…","(h, k)","(−h, k)","The turning point is the horizontal shift h and vertical shift k.");el.append(art("spot the misconception"));}},
  ],
  levels:[
   {name:"Model match",icon:"🧩",blurb:"Use the diagram to identify the relationship.",rounds:4,round(R){const q=make(callIndex++,0);LK.ui.choice(R,{prompt:q.prompt,sub:"Use the model, not a guess.",art:()=>art("model match",q),answer:q.answer,options:shuffle([...new Set(q.opts)]).map(x=>({key:x,html:x})),cat:"h-sign",why:()=>q.why,hint:"Name what each number represents first."});}},
   {name:"Spot the pattern",icon:"🔎",blurb:"Connect the representation to the rule.",rounds:4,round(R){const q=make(callIndex+++2,1);LK.ui.choice(R,{prompt:q.prompt,sub:"Explain the place, group, direction or rate.",art:()=>art("representation",q),answer:q.answer,options:shuffle([...new Set(q.opts)]).map(x=>({key:x,html:x})),cat:"roots-vs-vertex",why:()=>q.why,hint:"Look for the relationship that stays constant."});}},
   {name:"Mission solve",icon:"🎯",blurb:"Solve a fresh example and check your reasoning.",rounds:4,round(R){const q=make(callIndex+++4,2);LK.ui.choice(R,{prompt:q.prompt,sub:"Enter the answer; use a negative sign or decimal point if needed.",art:()=>art("mission",q),answer:q.answer,options:shuffle([...new Set(q.opts)]).map(x=>({key:x,html:x})),cat:"a-reflection",why:()=>q.why,hint:"Use the worked example as a strategy, not as an answer."});}}
  ],
  praise:["Great model reading!","Reasoning on track!","A thoughtful solution!"],finale:"Mission complete \u2014 you can quadratic functions."
 });
})();
