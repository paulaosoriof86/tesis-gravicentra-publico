const COUNTRY_OPTIONS=["Guatemala", "Colombia", "Honduras", "El Salvador", "Costa Rica", "Panamá", "Otro"];
const INTER_OPTIONS=["Corredora o broker de seguros", "Corredor o broker individual", "Agencia de seguros", "Agente de seguros", "Asesoría o consultoría relacionada", "Área interna de seguros dentro de una empresa", "Otro"];
const ROLE_OPTIONS=["Dirección / gerencia", "Asesor comercial / ventas", "Operaciones / emisión", "Servicio al cliente / seguimiento", "Cobros / cartera", "Comisiones / finanzas", "Administración", "Tecnología / sistemas", "Otro"];
const KEY="b98_field_v04rc";
const RECEIPT_KEY="b98_field_receipt_v06";
const FRONTEND_VERSION="V0.6-central-capture";
const qsParams=new URLSearchParams(location.search);
const suppliedCode=(qsParams.get("p")||"").trim().replace(/[^A-Za-z0-9_-]/g,"").slice(0,24);
const autoCode=suppliedCode||("R-"+Math.random().toString(36).slice(2,8).toUpperCase());
function newClientSubmissionId(){
 if(window.crypto&&typeof window.crypto.randomUUID==="function")return window.crypto.randomUUID();
 return "CS-"+Date.now().toString(36).toUpperCase()+"-"+Math.random().toString(36).slice(2,10).toUpperCase();
}
let state={participantCode:autoCode,clientSubmissionId:newClientSubmissionId(),country:"Guatemala",countryOther:"",intermediary:"",intermediaryOther:"",role:"",roleOther:"",otherRoles:[],consent:false,current:0,startedAt:null,completedAt:null,answers:{},cognitive:{},closing:{},serverReceipt:null};
try{const x=JSON.parse(localStorage.getItem(KEY));if(x)state={...state,...x}}catch(e){}
if(!state.clientSubmissionId)state.clientSubmissionId=newClientSubmissionId();
let savedReceipt=null;
try{savedReceipt=JSON.parse(localStorage.getItem(RECEIPT_KEY)||"null")}catch(e){}
const app=document.getElementById("app"), prog=document.getElementById("progress");
const esc=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
function save(){localStorage.setItem(KEY,JSON.stringify(state))}
function error(m){const e=document.getElementById("err");if(e){e.textContent=m;e.style.display="block"}}
function selectOptions(arr, selected){return ['<option value="">Seleccione</option>'].concat(arr.map(o=>`<option value="${esc(o)}" ${selected===o?'selected':''}>${esc(o)}</option>`)).join("")}
function start(){
 prog.style.width="0";
 app.innerHTML=`<div class="eyebrow">Encuesta sobre gestión de seguros</div>
 <h1>Cuéntenos cómo trabajan hoy.</h1>
 <p class="lead">Queremos conocer cómo se gestionan actualmente los principales procesos de intermediación de seguros. La mayoría de preguntas se responde seleccionando opciones y puede marcar más de una cuando corresponda.</p>
 <div class="soft">No buscamos una respuesta “correcta”. Marque lo que mejor represente su realidad. Si una opción no aparece, puede usar “Otro”. Evite incluir nombres, números de póliza u otros datos sensibles de clientes.</div>
 <div class="grid2">
  <div class="field"><label>País al que corresponde la experiencia que describirá</label><select id="country"><option value="">Seleccione</option><option value="Guatemala">Guatemala</option><option value="Colombia">Colombia</option><option value="Otro">Otro</option></select><div class="meta-other" id="countryOtherWrap"><input id="countryOther" placeholder="Indique el país" value="${esc(state.countryOther||"")}"></div></div>
  <div class="field"><label>Tipo de intermediario</label><select id="inter"><option value="">Seleccione</option><option value="Corredora o broker de seguros">Corredora o broker de seguros</option><option value="Corredor o broker independiente">Corredor o broker independiente</option><option value="Agencia de seguros">Agencia de seguros</option><option value="Agente de seguros independiente">Agente de seguros independiente</option><option value="Otro intermediario de seguros">Otro intermediario de seguros</option><option value="Otro">Otro</option></select><div class="meta-other" id="interOtherWrap"><input id="interOther" placeholder="Indique el tipo de intermediario" value="${esc(state.intermediaryOther||"")}"></div></div>
 </div>
 <div class="grid2">
  <div class="field"><label>Rol principal</label><select id="role"><option value="">Seleccione</option><option value="Propietario/a o dirección">Propietario/a o dirección</option><option value="Gerencia o coordinación">Gerencia o coordinación</option><option value="Ventas o asesoría comercial">Ventas o asesoría comercial</option><option value="Cotizaciones">Cotizaciones</option><option value="Operaciones, emisión o pólizas">Operaciones, emisión o pólizas</option><option value="Servicio al cliente o postventa">Servicio al cliente o postventa</option><option value="Renovaciones">Renovaciones</option><option value="Cobros o cartera">Cobros o cartera</option><option value="Comisiones o finanzas">Comisiones o finanzas</option><option value="Administración">Administración</option><option value="Tecnología, sistemas o datos">Tecnología, sistemas o datos</option><option value="Cumplimiento o control">Cumplimiento o control</option><option value="Otro">Otro</option></select><div class="meta-other" id="roleOtherWrap"><input id="roleOther" placeholder="Indique el rol principal" value="${esc(state.roleOther||"")}"></div></div>
  <div class="field"><label>¿Participa también en otras áreas? <span class="meta">(opcional)</span></label>
    <select id="otherRole"><option value="">No deseo agregar otra</option><option value="Dirección / gerencia">Dirección / gerencia</option><option value="Ventas / comercial">Ventas / comercial</option><option value="Cotizaciones">Cotizaciones</option><option value="Operaciones / emisión">Operaciones / emisión</option><option value="Servicio / postventa">Servicio / postventa</option><option value="Renovaciones">Renovaciones</option><option value="Cobros / cartera">Cobros / cartera</option><option value="Comisiones / finanzas">Comisiones / finanzas</option><option value="Administración">Administración</option><option value="Tecnología / datos">Tecnología / datos</option><option value="Cumplimiento / control">Cumplimiento / control</option></select>
  </div>
 </div>
 <div class="check"><input id="consent" type="checkbox" ${state.consent?"checked":""}><label for="consent">Acepto participar voluntariamente y entiendo que no debo incluir información confidencial o datos personales de clientes. Mis respuestas se almacenarán de forma privada para fines de esta investigación.</label></div>
 <div id="err" class="error"></div>
 <div class="nav"><span class="meta">Tiempo aproximado: 10–15 minutos</span><button class="btn btn-primary" id="go">Comenzar</button></div>`;
 document.getElementById("country").value=state.country||"";
 document.getElementById("inter").value=state.intermediary||"";
 document.getElementById("role").value=state.role||"";
 bindMetaOther();
 document.getElementById("go").onclick=()=>{
  const c=document.getElementById("country").value,co=document.getElementById("countryOther").value.trim(),
        i=document.getElementById("inter").value,io=document.getElementById("interOther").value.trim(),
        r=document.getElementById("role").value,ro=document.getElementById("roleOther").value.trim(),
        or=document.getElementById("otherRole").value,
        consent=document.getElementById("consent").checked;
  if(!c||!i||!r||!consent)return error("Complete los datos básicos y acepte la participación voluntaria para continuar.");
  if(c==="Otro"&&!co)return error("Indique el país.");
  if(i==="Otro"&&!io)return error("Indique el tipo de intermediario.");
  if(r==="Otro"&&!ro)return error("Indique el rol principal.");
  Object.assign(state,{country:c,countryOther:co,intermediary:i,intermediaryOther:io,role:r,roleOther:ro,otherRoles:or?[or]:[],consent:true,startedAt:state.startedAt||new Date().toISOString()});
  save(); renderQ();
 }
}
function bindMetaOther(){
 const map=[["country","countryOtherWrap"],["inter","interOtherWrap"],["role","roleOtherWrap"]];
 map.forEach(([id,wrap])=>{
   const el=document.getElementById(id), w=document.getElementById(wrap);
   const fn=()=>w.style.display=(el.value==="Otro")?"block":"none";
   el.addEventListener("change",fn); fn();
 });
}
function option(qi,gi,idx,opt,type,selected){
 const nm=`q${qi}_g${gi}`, id=`${nm}_${idx}`, cls=type==="single"?"opt single":"opt";
 return `<div class="${cls}"><input type="${type==="single"?"radio":"checkbox"}" id="${id}" name="${nm}" value="${esc(opt)}" ${selected?"checked":""}><label for="${id}">${esc(opt)}</label></div>`;
}
