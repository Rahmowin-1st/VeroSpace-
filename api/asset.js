const ASSETS={
  'verospace-featured-home.jpg':{
    url:'https://raw.githubusercontent.com/Rahmowin-1st/VeroSpace-/b01af5cd73e168ae97e9092a387fcd4bbf0fba0e/assets/verospace-featured-home.jpg',
    type:'image/jpeg',
    verify(bytes){return bytes.length>4&&bytes[0]===0xff&&bytes[1]===0xd8&&bytes[2]===0xff;}
  },
  'verospace-logo.png':{
    url:'https://raw.githubusercontent.com/Rahmowin-1st/VeroSpace-/b01af5cd73e168ae97e9092a387fcd4bbf0fba0e/assets/verospace-logo.png',
    type:'image/jpeg',
    verify(bytes){return bytes.length>4&&bytes[0]===0xff&&bytes[1]===0xd8&&bytes[2]===0xff;}
  },
  'verospace-home-yellow.webp':{
    url:'https://raw.githubusercontent.com/Rahmowin-1st/VeroSpace-/603bc2f7abb78855579f2d263774ee15ea5ce29e/assets/verospace-home-yellow.webp',
    type:'image/webp',
    verify(bytes){return bytes.length>12&&bytes.subarray(0,4).toString()==='RIFF'&&bytes.subarray(8,12).toString()==='WEBP';}
  }
};

module.exports=async function handler(req,res){
  if(req.method!=='GET'&&req.method!=='HEAD'){
    res.setHeader('Allow','GET, HEAD');
    return res.status(405).end();
  }
  const raw=Array.isArray(req.query?.file)?req.query.file[0]:req.query?.file;
  const file=String(raw||'').split('/').pop();
  const asset=ASSETS[file];
  if(!asset)return res.status(404).end();
  try{
    const upstream=await fetch(asset.url);
    if(!upstream.ok)return res.status(502).end();
    const bytes=Buffer.from(await upstream.arrayBuffer());
    if(!asset.verify(bytes))return res.status(502).end();
    res.setHeader('Content-Type',asset.type);
    res.setHeader('Cache-Control','public, max-age=31536000, immutable');
    res.setHeader('Content-Length',String(bytes.length));
    res.setHeader('X-Content-Type-Options','nosniff');
    if(req.method==='HEAD')return res.status(200).end();
    return res.status(200).send(bytes);
  }catch(error){
    console.error('Asset proxy error',error);
    return res.status(502).end();
  }
};
