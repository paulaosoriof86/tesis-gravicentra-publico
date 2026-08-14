const B98_BACKEND_URL="https://script.google.com/macros/s/AKfycbyHTpqQ2yoitwaSATBvC43oGAZv9eKlIhSqtqzWU0qFdHAJF1bt7hCss7ithXTjBhQ/exec";
const B98_SCHEMA_TOKEN="B98-V05-20260812";
const B98_FRONTEND_VERSION="B98-FIELD-V0.5-CENTRALIZED-20260813";
const B98_SUBMISSION_ID_KEY="b98_field_v05_client_submission_id";
const B98_SENT_KEY="b98_field_v05_centralized_sent";

function b98SubmissionId(){
  let id=localStorage.getItem(B98_SUBMISSION_ID_KEY)||"";
  if(!id){
    const rnd=(globalThis.crypto&&typeof crypto.randomUUID==="function")?crypto.randomUUID().replace(/-/g,""):Math.random().toString(36).slice(2)+Date.now().toString(36);
    id="B98-WEB-"+rnd;
    localStorage.setItem(B98_SUBMISSION_ID_KEY,id);
  }
  return id;
}

const b98OriginalPayload=payload;
payload=function(){
  const p=b98OriginalPayload();
  p.frontendVersion=B98_FRONTEND_VERSION;
  p.clientSubmissionId=b98SubmissionId();
  return p;
};

async function b98SendCentralized(){
  const p=payload();
  const already=localStorage.getItem(B98_SENT_KEY)||"";
  if(already===p.clientSubmissionId)return {ok:true,duplicateSafe:true};
  const body=new URLSearchParams();
  body.set("schema_token",B98_SCHEMA_TOKEN);
  body.set("website","");
  body.set("payload",JSON.stringify(p));
  await fetch(B98_BACKEND_URL,{method:"POST",mode:"no-cors",cache:"no-store",credentials:"omit",redirect:"follow",body});
  localStorage.setItem(B98_SENT_KEY,p.clientSubmissionId);
  return {ok:true,duplicateSafe:false};
}

function b98ScrollTop(){
  requestAnimationFrame(()=>{
    window.scrollTo({top:0,left:0,behavior:"auto"});
    document.documentElement.scrollTop=0;
    document.body.scrollTop=0;
  });
}

const b98App=document.getElementById("app");
if(b98App){
  const b98ScrollObserver=new MutationObserver(()=>b98ScrollTop());
  b98ScrollObserver.observe(b98App,{childList:true});
}

const b98OriginalDone=done;
done=async function(){
  const sec=Math.max(0,Math.round((new Date(state.completedAt)-new Date(state.startedAt))/1000));
  const mins=Math.max(1,Math.round(sec/60));
  app.innerHTML=`<div class="eyebrow">Enviando respuestas</div><h1>Estamos registrando su participación</h1><div class="complete">Por favor, mantenga esta página abierta unos segundos.</div><div class="stats"><div class="stat"><b>15/15</b><span>Preguntas respondidas</span></div><div class="stat"><b>${mins} min</b><span>Duración aproximada</span></div></div>`;
  try{
    await b98SendCentralized();
    app.innerHTML=`<div class="eyebrow">Completado</div><h1>Gracias por responder</h1><div class="complete">Sus respuestas fueron enviadas correctamente.</div><div class="stats"><div class="stat"><b>15/15</b><span>Preguntas respondidas</span></div><div class="stat"><b>${mins} min</b><span>Duración aproximada</span></div></div><div class="soft">Puede cerrar esta página. Si desea conservar una copia personal, puede descargarla a continuación.</div><div class="nav"><span></span><button class="btn btn-secondary" id="dl">Guardar copia de mis respuestas</button></div>`;
    document.getElementById("dl").onclick=download;
  }catch(err){
    app.innerHTML=`<div class="eyebrow">No se pudo completar el envío</div><h1>Sus respuestas siguen guardadas en este navegador</h1><div class="complete">No cierre ni borre los datos del navegador. Puede intentar nuevamente.</div><div id="err" class="error" style="display:block">No fue posible conectar con el servidor de respuestas.</div><div class="nav"><button class="btn btn-secondary" id="dl">Guardar copia</button><button class="btn btn-primary" id="retry">Intentar de nuevo</button></div>`;
    document.getElementById("dl").onclick=download;
    document.getElementById("retry").onclick=()=>done();
  }
};

if(state.completedAt){done();}
