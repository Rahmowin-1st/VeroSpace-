const EMAIL_RE=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const clean=(value,max=1000)=>String(value??'').replace(/[\u0000-\u001F\u007F]/g,' ').trim().slice(0,max);
const esc=value=>clean(value,5000).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#039;'}[ch]));

const recent=globalThis.__VEROSPACE_REQUEST_IDS__||(globalThis.__VEROSPACE_REQUEST_IDS__=new Map());
const REQUEST_TTL=10*60*1000;
const rememberRequest=id=>{
  const now=Date.now();
  for(const [key,time] of recent){if(now-time>REQUEST_TTL)recent.delete(key);}
  if(!id)return false;
  if(recent.has(id))return true;
  recent.set(id,now);
  return false;
};

module.exports=async function handler(req,res){
  if(req.method!=='POST'){
    res.setHeader('Allow','POST');
    return res.status(405).json({ok:false,error:'method_not_allowed'});
  }

  const apiKey=process.env.RESEND_API_KEY;
  const recipient=process.env.CONSULTATION_TO;
  if(!apiKey||!recipient)return res.status(503).json({ok:false,error:'mail_not_configured'});

  let body=req.body;
  if(typeof body==='string'){
    try{body=JSON.parse(body);}catch{return res.status(400).json({ok:false,error:'invalid_json'});}
  }
  body=body||{};

  // Honeypot: bots receive a harmless success response without sending mail.
  const website=clean(body.website,200);
  if(website)return res.status(200).json({ok:true,id:null});

  const name=clean(body.name,120);
  const email=clean(body.email,200);
  const project=clean(body.project,140);
  const budget=clean(body.budget,100);
  const message=clean(body.message,3000);
  const requestId=clean(body.requestId||req.headers['x-request-id'],120);

  if(!name||!EMAIL_RE.test(email)||!project||!budget||message.length<3){
    return res.status(400).json({ok:false,error:'invalid_fields'});
  }
  if(!requestId)return res.status(400).json({ok:false,error:'missing_request_id'});
  if(rememberRequest(requestId))return res.status(409).json({ok:false,error:'duplicate_request'});

  const from=process.env.RESEND_FROM||'VeroSpace <onboarding@resend.dev>';
  const subject=`VeroSpace consultation — ${project}`;
  const html=`<!doctype html><html><body style="margin:0;background:#f7f3ec;font-family:Arial,sans-serif;color:#152133"><div style="max-width:680px;margin:0 auto;padding:30px 18px"><div style="background:#fffdf9;border-radius:28px;padding:30px;border:1px solid #ead8b5"><div style="font-size:12px;letter-spacing:.15em;color:#9b7534;text-transform:uppercase">New VeroSpace consultation</div><h1 style="font-family:Georgia,serif;font-size:32px;margin:10px 0 24px;color:#102038">${esc(project)}</h1><table style="width:100%;border-collapse:collapse;font-size:15px"><tr><td style="padding:10px 0;color:#6c7480">Name</td><td style="padding:10px 0;font-weight:700">${esc(name)}</td></tr><tr><td style="padding:10px 0;color:#6c7480">Email</td><td style="padding:10px 0;font-weight:700">${esc(email)}</td></tr><tr><td style="padding:10px 0;color:#6c7480">Budget</td><td style="padding:10px 0;font-weight:700">${esc(budget)}</td></tr></table><div style="height:1px;background:#eee4d3;margin:22px 0"></div><div style="font-size:12px;letter-spacing:.12em;color:#9b7534;text-transform:uppercase;margin-bottom:8px">Message</div><div style="white-space:pre-wrap;line-height:1.65">${esc(message)}</div></div></div></body></html>`;
  const text=`New VeroSpace consultation\n\nName: ${name}\nEmail: ${email}\nProject: ${project}\nBudget: ${budget}\n\n${message}`;
  const payload={from,to:[recipient],subject,html,text,reply_to:email,tags:[{name:'source',value:'verospace_site'}]};

  try{
    const response=await fetch('https://api.resend.com/emails',{
      method:'POST',
      headers:{
        'Authorization':`Bearer ${apiKey}`,
        'Content-Type':'application/json',
        'User-Agent':'VeroSpace/1.0',
        'Idempotency-Key':`verospace-consultation/${requestId}`
      },
      body:JSON.stringify(payload)
    });
    const data=await response.json().catch(()=>({}));
    if(!response.ok){
      // Allow retry after a server/provider failure; Resend idempotency still protects duplicates.
      recent.delete(requestId);
      console.error('Resend error',response.status,data?.message||data?.name||'unknown');
      return res.status(response.status>=500?502:500).json({ok:false,error:'send_failed'});
    }
    return res.status(200).json({ok:true,id:data.id||null});
  }catch(error){
    recent.delete(requestId);
    console.error('Consultation send exception',error);
    return res.status(502).json({ok:false,error:'send_unavailable'});
  }
};

// Canonical QA trigger: no runtime behavior change.
