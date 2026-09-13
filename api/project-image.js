const PHOTO_IDS = new Set([
  'OcxgtPN0FmM','uaO2jAFKR0c','U74CPDcq5OY',
  '881IAs1vdE4','n4U6GwZJmBM','lq8FnmruSjo',
  'G8kRVwlZK3Q','3bgpVpEZV6s','GRxzOdEUKVg',
  'hjNTscPXJTg','rFpEHzGB37w','54xFukuLp1E',
  'NMXNCYy-2ks','B6ZXOlMO3EY','mQmDscIIQfs'
]);

module.exports = async function handler(req,res){
  if(req.method!=='GET' && req.method!=='HEAD'){
    res.setHeader('Allow','GET, HEAD');
    return res.status(405).end();
  }

  const raw = Array.isArray(req.query?.id) ? req.query.id[0] : req.query?.id;
  const id = String(raw||'').trim();
  if(!PHOTO_IDS.has(id)) return res.status(404).end();

  try{
    const upstream = await fetch(`https://unsplash.com/photos/${encodeURIComponent(id)}/download?force=true`,{
      redirect:'follow',
      headers:{'User-Agent':'Mozilla/5.0 VeroSpace-Webflow-Transfer'}
    });
    if(!upstream.ok) return res.status(502).end();

    const type = upstream.headers.get('content-type') || 'image/jpeg';
    if(!type.startsWith('image/')) return res.status(502).end();

    const bytes = Buffer.from(await upstream.arrayBuffer());
    res.setHeader('Content-Type',type);
    res.setHeader('Cache-Control','public, max-age=31536000, immutable');
    res.setHeader('Content-Length',String(bytes.length));
    res.setHeader('X-Content-Type-Options','nosniff');
    res.setHeader('Access-Control-Allow-Origin','*');
    if(req.method==='HEAD') return res.status(200).end();
    return res.status(200).send(bytes);
  }catch(error){
    console.error('Project image proxy error',id,error);
    return res.status(502).end();
  }
};
