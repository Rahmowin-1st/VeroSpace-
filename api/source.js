const COMMIT='d6ff1520dadb86cede6b3436d7f617411f2777ed';
const BASE=`https://raw.githubusercontent.com/Rahmowin-1st/VeroSpace-/${COMMIT}/`;
const ALLOWED=new Map([
  ['index.html','text/html; charset=utf-8'],
  ['native.js','application/javascript; charset=utf-8'],
  ['v5.css','text/css; charset=utf-8'],
  ['v5.js','application/javascript; charset=utf-8'],
  ['v6-fixes.css','text/css; charset=utf-8'],
  ['v6-fixes.js','application/javascript; charset=utf-8'],
  ['assets/verospace-home-yellow.webp','image/webp'],
  ['assets/verospace-logo.png','image/jpeg'],
  ['assets/verospace-featured-home.jpg','image/jpeg']
]);

module.exports=async function handler(req,res){
  if(req.method!=='GET'&&req.method!=='HEAD'){
    res.setHeader('Allow','GET, HEAD');
    return res.status(405).end();
  }
  const raw=Array.isArray(req.query?.file)?req.query.file[0]:req.query?.file;
  const file=String(raw||'').replace(/^\/+/, '');
  const type=ALLOWED.get(file);
  if(!type)return res.status(404).end();
  try{
    const upstream=await fetch(BASE+file,{headers:{'User-Agent':'VeroSpace/1.0'}});
    if(!upstream.ok)return res.status(502).end();
    let bytes=Buffer.from(await upstream.arrayBuffer());
    if(file==='index.html'){
      let html=bytes.toString('utf8');
      if(!html.includes('v6-fixes.css'))html=html.replace('</head>','  <link rel="stylesheet" href="/v6-fixes.css?v=20260903b1">\n</head>');
      if(!html.includes('v6-fixes.js'))html=html.replace('</body>','  <script src="/v6-fixes.js?v=20260903b1" defer></script>\n</body>');
      bytes=Buffer.from(html,'utf8');
    }
    res.setHeader('Content-Type',type);
    res.setHeader('Cache-Control','public, max-age=0, s-maxage=31536000, immutable');
    res.setHeader('X-Content-Type-Options','nosniff');
    if(req.method==='HEAD')return res.status(200).end();
    return res.status(200).send(bytes);
  }catch(error){
    console.error('Source proxy error',error);
    return res.status(502).end();
  }
};
