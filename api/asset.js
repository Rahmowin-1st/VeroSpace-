const ALLOWED=new Set(['verospace-featured-home.jpg','verospace-logo.png']);
const ASSET_BASE='https://raw.githubusercontent.com/Rahmowin-1st/VeroSpace-/b01af5cd73e168ae97e9092a387fcd4bbf0fba0e/assets/';

module.exports=async function handler(req,res){
  if(req.method!=='GET'&&req.method!=='HEAD'){
    res.setHeader('Allow','GET, HEAD');
    return res.status(405).end();
  }
  const raw=Array.isArray(req.query?.file)?req.query.file[0]:req.query?.file;
  const file=String(raw||'').split('/').pop();
  if(!ALLOWED.has(file))return res.status(404).end();
  try{
    const upstream=await fetch(ASSET_BASE+encodeURIComponent(file));
    if(!upstream.ok)return res.status(502).end();
    const bytes=Buffer.from(await upstream.arrayBuffer());
    if(bytes.length<4||bytes[0]!==0xff||bytes[1]!==0xd8||bytes[2]!==0xff)return res.status(502).end();
    res.setHeader('Content-Type','image/jpeg');
    res.setHeader('Cache-Control','public, max-age=31536000, immutable');
    res.setHeader('Content-Length',String(bytes.length));
    if(req.method==='HEAD')return res.status(200).end();
    return res.status(200).send(bytes);
  }catch(error){
    console.error('Asset proxy error',error);
    return res.status(502).end();
  }
};
