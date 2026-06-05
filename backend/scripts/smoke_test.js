const fetch = require('node-fetch');
const BASE = process.env.BASE || 'http://localhost:4000/api';
(async ()=>{
  try{
    console.log('Login...');
    let r = await fetch(`${BASE}/auth/login`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:'admin@alpha.local',password:'password'})});
    const j = await r.json();
    if(!j.token){ console.error('Login failed', j); process.exit(1); }
    const TOKEN = j.token;
    console.log('Token obtained');
    const endpoints = ['/students','/classes','/subjects','/chapters','/tests','/questions','/dpq','/attendance','/fees','/notifications'];
    for(const ep of endpoints){
      try{
        const res = await fetch(`${BASE}${ep}`,{headers:{Authorization:`Bearer ${TOKEN}`}});
        console.log(ep, res.status);
      }catch(e){ console.error('Err',ep,e.message); }
    }
    console.log('Smoke test finished');
  }catch(e){ console.error(e); process.exit(1); }
})();
