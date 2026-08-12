function renderQ(){
 const q=QS[state.current], prev=state.answers[q.code]||{};
 prog.style.width=`${((state.current+1)/QS.length)*100}%`;
 let groups=q.groups.map((g,gi)=>{
  const vals=prev[gi]||[];
  return `<div class="group"><div class="group-title">${esc(g.label)}</div>${g.type==="multi"?'<div class="group-help">Puede seleccionar más de una opción.</div>':''}
  <div class="options">${g.options.map((o,idx)=>option(state.current,gi,idx,o,g.type,vals.includes(o))).join("")}</div>
  <div class="other" id="other_${gi}"><input placeholder="Especifique otra opción" value="${esc((prev.other||{})[gi]||"")}"></div></div>`;
 }).join("");
 const cog=state.cognitive[q.code]||{};
 app.innerHTML=`<div class="eyebrow">📍 Pregunta ${state.current+1} de ${QS.length}</div><h2>${esc(q.title)}</h2>
 <div class="question">${esc(q.text)}</div>${groups}
 <div class="cog"><div class="cog-title">📝 Antes de continuar</div><div class="cog-sub">Cuéntenos brevemente cómo le resultó esta pregunta.</div>
  <div class="group"><div class="group-title">¿La pregunta fue clara?</div><div class="pills">${pill("clarity","Sí",cog.clarity)}${pill("clarity","Más o menos",cog.clarity)}${pill("clarity","No",cog.clarity)}</div></div>
  <div class="group"><div class="group-title">¿Encontró las opciones que necesitaba?</div><div class="pills">${pill("coverage","Sí",cog.coverage)}${pill("coverage","Casi",cog.coverage)}${pill("coverage","No",cog.coverage)}</div></div>
  <div class="group"><div class="group-title">¿Le resultó fácil responder?</div><div class="pills">${pill("ease","Sí",cog.ease)}${pill("ease","Más o menos",cog.ease)}${pill("ease","No",cog.ease)}</div></div>
  <div class="conditional" id="cogNote"><input id="cogText" placeholder="Si algo faltó o no fue claro, indíquelo brevemente" value="${esc(cog.note||"")}"></div>
 </div>
 <div id="err" class="error"></div>
 <div class="nav"><button class="btn btn-secondary" id="back">${state.current===0?"Inicio":"Anterior"}</button><button class="btn btn-primary" id="next">${state.current===QS.length-1?"Finalizar":"Siguiente"}</button></div>`;
 bindDynamic(q);
 document.getElementById("back").onclick=()=>{capture(false);if(state.current===0)start();else{state.current--;save();renderQ()}};
 document.getElementById("next").onclick=()=>{if(!capture(true))return;if(state.current===QS.length-1)closing();else{state.current++;save();renderQ()}};
}
function pill(name,val,current){const id=`${name}_${val.replace(/\W/g,"")}`;return `<div class="pill"><input type="radio" id="${id}" name="${name}" value="${val}" ${current===val?'checked':''}><label for="${id}">${val}</label></div>`}
function bindDynamic(q){
 q.groups.forEach((g,gi)=>{
  const update=()=>{
   const checked=[...document.querySelectorAll(`[name="q${state.current}_g${gi}"]:checked`)].map(x=>x.value);
   document.getElementById(`other_${gi}`).style.display=checked.includes("Otro")?"block":"none";
  };
  document.querySelectorAll(`[name="q${state.current}_g${gi}"]`).forEach(x=>x.addEventListener("change",update));update();
 });
 const up=()=>{
   const vals=["clarity","coverage","ease"].map(n=>document.querySelector(`[name="${n}"]:checked`)?.value||"");
   document.getElementById("cogNote").style.display=vals.some(v=>v&&v!=="Sí")?"block":"none";
 };
 ["clarity","coverage","ease"].forEach(n=>document.querySelectorAll(`[name="${n}"]`).forEach(x=>x.addEventListener("change",up))); up();
}
function capture(validate){
 const q=QS[state.current], ans={}, other={};
 for(let gi=0;gi<q.groups.length;gi++){
   const vals=[...document.querySelectorAll(`[name="q${state.current}_g${gi}"]:checked`)].map(x=>x.value);
   if(validate&&vals.length===0)return error("Seleccione al menos una opción en cada bloque."), false;
   ans[gi]=vals;
   if(vals.includes("Otro")){
     const v=document.querySelector(`#other_${gi} input`).value.trim();
     if(validate&&!v)return error("Especifique la opción “Otro”."), false;
     other[gi]=v;
   }
 }
 ans.other=other;
 const clarity=document.querySelector('[name="clarity"]:checked')?.value||"",
       coverage=document.querySelector('[name="coverage"]:checked')?.value||"",
       ease=document.querySelector('[name="ease"]:checked')?.value||"";
 if(validate&&(!clarity||!coverage||!ease))return error("Complete las tres preguntas breves antes de continuar."), false;
 const note=document.getElementById("cogText")?.value.trim()||"";
 if(validate&&[clarity,coverage,ease].some(v=>v&&v!=="Sí")&&!note)return error("Indique brevemente qué faltó o qué no fue claro."), false;
 state.answers[q.code]=ans; state.cognitive[q.code]={clarity,coverage,ease,note}; save(); return true;
}
function closing(){
 prog.style.width="100%";
 const c=state.closing||{};
 app.innerHTML=`<div class="eyebrow">✅ Último paso</div><h2>Ya casi terminamos 🎉</h2><p class="lead">Solo necesitamos tres respuestas breves sobre la experiencia de completar la encuesta.</p>
 <div class="group"><div class="group-title">¿Cómo le pareció la extensión de la encuesta?</div><div class="pills">${pill("length","Corta",c.length)}${pill("length","Adecuada",c.length)}${pill("length","Larga",c.length)}</div></div>
 <div class="group"><div class="group-title">¿Sintió que alguna parte se repetía innecesariamente?</div><div class="pills">${pill("repeat","No",c.repeat)}${pill("repeat","Un poco",c.repeat)}${pill("repeat","Sí",c.repeat)}</div></div>
 <div class="group"><div class="group-title">¿Considera que faltó algún tema importante?</div><div class="pills">${pill("missing","No",c.missing)}${pill("missing","Tal vez",c.missing)}${pill("missing","Sí",c.missing)}</div><div class="conditional" id="missBox"><input id="missText" placeholder="¿Qué tema faltó?" value="${esc(c.missingText||"")}"></div></div>
 <div id="err" class="error"></div>
 <div class="nav"><button class="btn btn-secondary" id="back">Volver</button><button class="btn btn-primary" id="finish">Enviar respuestas</button></div>`;
 const upd=()=>{const v=document.querySelector('[name="missing"]:checked')?.value||"";document.getElementById("missBox").style.display=(v==="Sí"||v==="Tal vez")?"block":"none"}; document.querySelectorAll('[name="missing"]').forEach(x=>x.onchange=upd); upd();
 document.getElementById("back").onclick=()=>{state.current=QS.length-1; renderQ()};
 document.getElementById("finish").onclick=()=>{
   const length=document.querySelector('[name="length"]:checked')?.value||"",
         repeat=document.querySelector('[name="repeat"]:checked')?.value||"",
         missing=document.querySelector('[name="missing"]:checked')?.value||"";
   if(!length||!repeat||!missing)return error("Complete las tres preguntas finales.");
   const missingText=document.getElementById("missText").value.trim();
   if((missing==="Sí"||missing==="Tal vez")&&!missingText)return error("Indique brevemente qué tema faltó.");
   state.closing={length,repeat,missing,missingText}; state.completedAt=new Date().toISOString(); save(); submitCentralized();
 }
}
function payload(){
 return {
   instrument:{id:"EncuestaGestionSeguros",version:"V0.5-publicable"},
   frontendVersion:FRONTEND_VERSION,
   clientSubmissionId:state.clientSubmissionId,
   participant:{
      code:state.participantCode,
      country:state.country,
      countryOther:state.countryOther,
      intermediary:state.intermediary,
      intermediaryOther:state.intermediaryOther,
      role:state.role,
      roleOther:state.roleOther
   },
   timing:{startedAt:state.startedAt,completedAt:state.completedAt},
   answers:state.answers,
   cognitive:state.cognitive,
   closing:state.closing
 };
}
let submitTimeout=null;
function submitCentralized(){
 const cfg=window.SURVEY_BACKEND||{};
 if(!cfg.endpoint){
   return submissionProblem("El servicio de recepción todavía no está disponible. Sus respuestas siguen guardadas en este dispositivo y podrá reintentar sin volver a contestar.");
 }
 prog.style.width="100%";
 app.innerHTML=`<div class="eyebrow">Enviando</div><h1>Estamos registrando sus respuestas</h1>
 <div class="complete"><span class="spinner" aria-hidden="true"></span> No cierre esta ventana hasta ver la confirmación.</div>`;
 const frameName="survey_sink_"+Date.now();
 const iframe=document.createElement("iframe");
 iframe.name=frameName; iframe.style.display="none"; iframe.setAttribute("aria-hidden","true");
 const form=document.createElement("form");
 form.method="POST"; form.action=cfg.endpoint; form.target=frameName; form.style.display="none";
 const fields={schema_token:cfg.schemaToken||"",payload:JSON.stringify(payload()),website:""};
 Object.entries(fields).forEach(([name,value])=>{const input=document.createElement("input");input.type="hidden";input.name=name;input.value=value;form.appendChild(input)});
 document.body.appendChild(iframe); document.body.appendChild(form);
 submitTimeout=setTimeout(()=>submissionProblem("No recibimos confirmación del servidor. Puede reintentar; el identificador de envío evita duplicados."),25000);
 form.submit();
 setTimeout(()=>form.remove(),1000);
}
function submissionProblem(message){
 if(submitTimeout)clearTimeout(submitTimeout);
 app.innerHTML=`<div class="eyebrow">Envío pendiente</div><h1>No fue posible confirmar la recepción</h1>
 <div class="error" style="display:block">${esc(message)}</div>
 <p class="lead" style="margin-top:18px">No perdió sus respuestas.</p>
 <div class="nav"><span></span><button class="btn btn-primary" id="retry">Reintentar envío</button></div>`;
 document.getElementById("retry").onclick=submitCentralized;
}
function submitted(receipt){
 if(submitTimeout)clearTimeout(submitTimeout);
 state.serverReceipt=receipt;
 const stored={survey:"EncuestaGestionSeguros",version:"V0.5-publicable",submissionId:receipt.submissionId,payloadHash:receipt.payloadHash,completedAt:state.completedAt,clientSubmissionId:state.clientSubmissionId};
 localStorage.setItem(RECEIPT_KEY,JSON.stringify(stored));
 localStorage.removeItem(KEY);
 const sec=Math.max(0,Math.round((new Date(state.completedAt)-new Date(state.startedAt))/1000)), mins=Math.max(1,Math.round(sec/60));
 app.innerHTML=`<div class="eyebrow">Completado</div><h1>Gracias por responder</h1>
 <div class="complete">Su respuesta fue recibida y guardada correctamente.</div>
 <div class="stats"><div class="stat"><b>15/15</b><span>Preguntas respondidas</span></div><div class="stat"><b>${mins} min</b><span>Duración aproximada</span></div><div class="stat"><b>${esc(String(receipt.submissionId||"").slice(0,8))}</b><span>Comprobante</span></div></div>
 <p class="lead">No necesita descargar ni enviar ningún archivo. Puede cerrar esta ventana.</p>`;
}
function showSavedReceipt(receipt){
 prog.style.width="100%";
 app.innerHTML=`<div class="eyebrow">Completado</div><h1>Respuesta recibida</h1>
 <div class="complete">Este dispositivo ya registró correctamente una respuesta para esta encuesta.</div>
 <p class="lead" style="margin-top:18px">Comprobante: ${esc(String(receipt.submissionId||"").slice(0,8))}. No necesita descargar ni enviar ningún archivo.</p>`;
}
window.addEventListener("message",event=>{
 if(event.origin!=="https://script.googleusercontent.com"&&event.origin!=="https://script.google.com")return;
 const data=event.data||{};
 if(data.type!=="gravicentra-survey-submit")return;
 if(data.ok)submitted(data); else submissionProblem("El servidor rechazó el envío: "+(data.status||"error no especificado")+". Puede reintentar sin generar duplicados.");
});
if(savedReceipt&&savedReceipt.version==="V0.5-publicable")showSavedReceipt(savedReceipt); else if(state.completedAt)submitCentralized(); else if(state.startedAt&&state.consent)renderQ(); else start();
