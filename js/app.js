const SUBJECTS={physics:"⚛ Physics",chemistry:"🧪 Chemistry",biology:"🧬 Biology",mathematics:"📐 Mathematics"};
let state={subject:null,chapter:null,topic:null,data:null};

const $=id=>document.getElementById(id);
async function loadJSON(url){const r=await fetch(url);if(!r.ok)throw new Error("Cannot load "+url);return r.json();}
function initSubjects(){
  $("subjects").innerHTML=Object.entries(SUBJECTS).map(([k,v])=>`<button class="subject" onclick="loadSubject('${k}')">${v}</button>`).join("");
}
async function loadSubject(subj){
  state={subject:subj,chapter:null,topic:null,data:null};
  const chapters=await loadJSON(`data/${subj}/chapters.json`);
  $("app").innerHTML=`<section class="hero"><h1>${SUBJECTS[subj]}</h1><p>Select a chapter.</p><div class="chapter-grid">${chapters.map(c=>`<div class="chapter" onclick="loadChapter('${subj}','${c.id}')"><h3>${c.order}. ${c.name}</h3><p>${c.subchapters} subchapters</p></div>`).join("")}</div></section>`;
}
async function loadChapter(subj,cid){
  state.data=await loadJSON(`data/${subj}/${cid}.json`); state.chapter=cid;
  const c=state.data;
  $("app").innerHTML=`<section class="hero"><button onclick="loadSubject('${subj}')">← Chapters</button><h1>${c.name}</h1>
  <p>Select a subchapter.</p>${c.subchapters.map((t,i)=>`<div class="topic" onclick="loadTopic(${i})"><b>${i+1}. ${t.title}</b><br><small>Theory • Formula • Example • Graph • Diagram • MCQ • Revision</small></div>`).join("")}</section>`;
}
function loadTopic(i){
  state.topic=i; const t=state.data.subchapters[i];
  $("app").innerHTML=`<section class="hero"><button onclick="loadChapter('${state.subject}','${state.chapter}')">← Subchapters</button><h1>${t.title}</h1>
  <div class="tabs">${["Theory","Key Points","Formula","Examples","Graph","Diagram","MCQ","Quick Revision"].map(x=>`<button onclick="renderTab('${x}')">${x}</button>`).join("")}</div>
  <div id="content" class="content"></div></section>`;
  renderTab("Theory");
}
function renderTab(tab){
  const t=state.data.subchapters[state.topic], c=$("content");
  if(tab==="Theory") c.innerHTML=`<h2>📖 Theory</h2><p>${t.theory}</p><h3>Concept</h3><p>${t.key_points[0]}</p>`;
  if(tab==="Key Points") c.innerHTML=`<h2>📌 Key Points</h2><ul>${t.key_points.map(x=>`<li>${x}</li>`).join("")}</ul>`;
  if(tab==="Formula") c.innerHTML=`<h2>📐 Formula Sheet</h2>${t.formulas.map(f=>`<div class="formula"><b>${f.name}</b><br>${f.formula}<br><small>Unit: ${f.unit}</small></div>`).join("")}`;
  if(tab==="Examples") c.innerHTML=`<h2>🧮 Solved Examples</h2>${t.examples.map(e=>`<h3>${e.question}</h3><p>${e.solution}</p>`).join("")}`;
  if(tab==="Graph") c.innerHTML=`<h2>📊 Graph</h2><img class="visual" src="../../${t.graph}" onerror="this.src='${t.graph}'">`;
  if(tab==="Diagram") c.innerHTML=`<h2>🖼️ Diagram</h2><img class="visual" src="../../${t.diagram}" onerror="this.src='${t.diagram}'">`;
  if(tab==="MCQ") c.innerHTML=`<h2>❓ MCQ</h2>${t.mcqs.map((q,qi)=>`<p><b>${q.q}</b></p>${q.options.map((o,i)=>`<button class="option" onclick="alert(${i}===${q.answer}?'Correct!':'Incorrect.\\n\\n'+${JSON.stringify(q.explanation)})">${String.fromCharCode(65+i)}. ${o}</button>`).join("")}`).join("")}`;
  if(tab==="Quick Revision") c.innerHTML=`<h2>⚡ Quick Revision</h2><ul>${t.revision.map(x=>`<li>${x}</li>`).join("")}</ul>`;
}
function showHome(){location.reload()}
$("search").addEventListener("input",async e=>{
  const q=e.target.value.trim().toLowerCase(); if(!q)return;
  let results=[];
  for(const subj of Object.keys(SUBJECTS)){
    const chapters=await loadJSON(`data/${subj}/chapters.json`);
    chapters.forEach(c=>{if(c.name.toLowerCase().includes(q))results.push({subj,c});});
  }
  $("app").innerHTML=`<section class="hero"><h1>Search Results</h1>${results.length?results.map(r=>`<div class="chapter" onclick="loadChapter('${r.subj}','${r.c.id}')"><b>${SUBJECTS[r.subj]}</b><h3>${r.c.name}</h3></div>`).join(""):"<p>No chapter found.</p>"}</section>`;
});
initSubjects();