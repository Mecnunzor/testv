const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

const DATA_DIR = path.join(__dirname, '..', 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

class JsonDB {
  constructor(name) {
    this.file = path.join(DATA_DIR, name + '.json');
    this.data = [];
    try { this.data = JSON.parse(fs.readFileSync(this.file, 'utf8')); } catch { this.data = []; }
  }
  save() { fs.writeFileSync(this.file, JSON.stringify(this.data, null, 2)); }
  insert(doc) { doc.id = Date.now().toString(36) + Math.random().toString(36).substr(2, 6); doc.created_at = new Date().toISOString(); this.data.push(doc); this.save(); return doc; }
  find(fn) { return fn ? this.data.filter(fn) : [...this.data]; }
  findOne(fn) { return this.data.find(fn) || null; }
  update(fn, updates) { const i = this.data.findIndex(fn); if (i >= 0) { Object.assign(this.data[i], updates); this.save(); return this.data[i]; } return null; }
  remove(fn) { const len = this.data.length; this.data = this.data.filter(d => !fn(d)); if (this.data.length !== len) this.save(); }
  count(fn) { return fn ? this.data.filter(fn).length : this.data.length; }
}

const db = { admins: new JsonDB('admins'), codes: new JsonDB('codes'), devices: new JsonDB('devices'), channels: new JsonDB('channels'), vod: new JsonDB('vod'), ads: new JsonDB('ads'), series: new JsonDB('series') };

// ── Seed Admin ──
if (db.admins.count() === 0) {
  db.admins.insert({ username: 'admin', password: crypto.createHash('sha256').update('admin123').digest('hex') });
  console.log('Default admin: admin / admin123');
}

// ── Seed Channels with real logos ──
if (db.channels.count() === 0) {
  [
    ['TRT 1','https://tv-trt1.medya.trt.com.tr/master.m3u8','Ulusal','https://i.imgur.com/8QK4Q0j.png'],
    ['TRT Haber','https://tv-trthaber.medya.trt.com.tr/master.m3u8','Haber','https://i.imgur.com/JfKxP2q.png'],
    ['TRT Spor','https://tv-trtspor1.medya.trt.com.tr/master.m3u8','Spor','https://i.imgur.com/K5nQ8Lm.png'],
    ['TRT Belgesel','https://tv-trtbelgesel.medya.trt.com.tr/master.m3u8','Belgesel','https://i.imgur.com/Xv3qR7n.png'],
    ['TRT Muzik','https://tv-trtmuzik.medya.trt.com.tr/master.m3u8','Muzik','https://i.imgur.com/Hm5pW3s.png'],
    ['TRT Cocuk','https://tv-trtcocuk.medya.trt.com.tr/master.m3u8','Cocuk','https://i.imgur.com/Rn7dY4t.png'],
    ['TRT World','https://tv-trtworld.medya.trt.com.tr/master.m3u8','Uluslararasi','https://i.imgur.com/Uj6mK9v.png'],
    ['TBMM TV','https://meclisdijitalmedya.tbmm.gov.tr/tbmmwebtv/tbmmtv.m3u8','Ulusal',''],
  ].forEach(([name,url,group,logo],i) => db.channels.insert({name,stream_url:url,group_name:group,logo_url:logo,epg_id:'',sort_order:i,is_active:true}));
  console.log('8 channels added');
}

// ── Seed VOD ──
const vodSeed = [
  {title:'Big Buck Bunny',stream_url:'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',poster_url:'https://picsum.photos/seed/bbb/300/450',description:'Orman hayvanlarinin eglenceli macerasi',category:'Film',year:2008,duration:'10 dk'},
  {title:'Sintel',stream_url:'https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8',poster_url:'https://picsum.photos/seed/sintel/300/450',description:'Ejderha arayan genc savasci',category:'Film',year:2010,duration:'15 dk'},
  {title:'Tears of Steel',stream_url:'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',poster_url:'https://picsum.photos/seed/tears/300/450',description:'Bilim kurgu kisa film',category:'Film',year:2012,duration:'12 dk'},
  {title:'Elephant Dream',stream_url:'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',poster_url:'https://picsum.photos/seed/elephant/300/450',description:'Ilk acik kaynak animasyon filmi',category:'Film',year:2006,duration:'11 dk'},
  {title:'Cosmos Laundromat',stream_url:'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',poster_url:'https://picsum.photos/seed/cosmos/300/450',description:'Paralel evrenlerde macera',category:'Film',year:2015,duration:'12 dk'},
  {title:'Spring',stream_url:'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',poster_url:'https://picsum.photos/seed/springmovie/300/450',description:'Buyulu orman macerasi',category:'Film',year:2019,duration:'8 dk'},
  {title:'Coffee Run',stream_url:'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',poster_url:'https://picsum.photos/seed/coffeerun/300/450',description:'Kahve tutkunu karakter',category:'Film',year:2020,duration:'3 dk'},
  {title:'Agent 327',stream_url:'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',poster_url:'https://picsum.photos/seed/agent327/300/450',description:'Gizli ajanin macerasi',category:'Film',year:2017,duration:'4 dk'},
  {title:'Bunny Macerasi',stream_url:'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',poster_url:'https://picsum.photos/seed/bunnykid/300/450',description:'Sevimli tavsan macerasi 3+ yas',category:'Cocuk',year:2008,duration:'10 dk'},
  {title:'Kozmos Cocuk',stream_url:'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',poster_url:'https://picsum.photos/seed/cosmoskid/300/450',description:'Uzay temali animasyon 5+ yas',category:'Cocuk',year:2015,duration:'12 dk'},
  {title:'Bahar Cocuk',stream_url:'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',poster_url:'https://picsum.photos/seed/springkid/300/450',description:'Doga ve hayvanlar macerasi',category:'Cocuk',year:2019,duration:'8 dk'},
  {title:'Cam Bardak',stream_url:'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',poster_url:'https://picsum.photos/seed/glasskid/300/450',description:'Iki arkadasin komik hikayesi',category:'Cocuk',year:2015,duration:'3 dk'},
  {title:'Renk Dunyasi',stream_url:'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',poster_url:'https://picsum.photos/seed/colorkid/300/450',description:'Renklerle egitici animasyon',category:'Cocuk',year:2020,duration:'5 dk'},
];
if (db.vod.count() === 0) {
  vodSeed.forEach((v,i) => db.vod.insert({...v,sort_order:i,is_active:true}));
  console.log(`${vodSeed.length} VOD items added`);
}

// ── Seed Series with Episodes ──
if (db.series.count() === 0) {
  const seriesData = [
    {
      title: 'Doga Belgeseli',
      poster_url: 'https://picsum.photos/seed/natureSeries/300/450',
      description: 'Anadolunun essiz dogasi ve yaban hayati',
      category: 'Dizi',
      year: 2024,
      seasons: [
        { season: 1, episodes: [
          {ep:1,title:'Karadeniz Ormanlari',stream_url:'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',duration:'10 dk'},
          {ep:2,title:'Ege Kiyilari',stream_url:'https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8',duration:'15 dk'},
          {ep:3,title:'Kapadokya',stream_url:'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',duration:'10 dk'},
          {ep:4,title:'Dogu Anadolu',stream_url:'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',duration:'10 dk'},
        ]},
        { season: 2, episodes: [
          {ep:1,title:'Akdeniz Derinlikleri',stream_url:'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',duration:'10 dk'},
          {ep:2,title:'Marmara Adalari',stream_url:'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',duration:'10 dk'},
          {ep:3,title:'Van Golu',stream_url:'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',duration:'10 dk'},
        ]},
      ]
    },
    {
      title: 'Tarih Yolculugu',
      poster_url: 'https://picsum.photos/seed/historySeries/300/450',
      description: 'Antik medeniyetlerden modern caga',
      category: 'Dizi',
      year: 2024,
      seasons: [
        { season: 1, episodes: [
          {ep:1,title:'Hitit Imparatorlugu',stream_url:'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',duration:'12 dk'},
          {ep:2,title:'Lidya ve Altin',stream_url:'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',duration:'12 dk'},
          {ep:3,title:'Efes Antik Kenti',stream_url:'https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8',duration:'15 dk'},
          {ep:4,title:'Bizans Donemi',stream_url:'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',duration:'12 dk'},
          {ep:5,title:'Osmanli Kurulusu',stream_url:'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',duration:'12 dk'},
        ]},
      ]
    },
    {
      title: 'Cocuk Dunyasi',
      poster_url: 'https://picsum.photos/seed/kidsWorld/300/450',
      description: 'Cocuklar icin egitici ve eglenceli animasyonlar',
      category: 'Cocuk',
      year: 2023,
      seasons: [
        { season: 1, episodes: [
          {ep:1,title:'Renkler',stream_url:'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',duration:'10 dk'},
          {ep:2,title:'Sayilar',stream_url:'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',duration:'10 dk'},
          {ep:3,title:'Hayvanlar',stream_url:'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',duration:'10 dk'},
          {ep:4,title:'Mevsimler',stream_url:'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',duration:'10 dk'},
        ]},
        { season: 2, episodes: [
          {ep:1,title:'Uzay',stream_url:'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',duration:'10 dk'},
          {ep:2,title:'Okyanuslar',stream_url:'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',duration:'10 dk'},
          {ep:3,title:'Dinozorlar',stream_url:'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',duration:'10 dk'},
        ]},
      ]
    },
    {
      title: 'Muzik Yolculugu',
      poster_url: 'https://picsum.photos/seed/musicJourney/300/450',
      description: 'Dunyanin dort bir yanindan muzik',
      category: 'Dizi',
      year: 2024,
      seasons: [
        { season: 1, episodes: [
          {ep:1,title:'Istanbul Ezgileri',stream_url:'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',duration:'10 dk'},
          {ep:2,title:'Anadolu Turkuleri',stream_url:'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',duration:'10 dk'},
          {ep:3,title:'Akdeniz Ritimleri',stream_url:'https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8',duration:'15 dk'},
        ]},
      ]
    },
  ];
  seriesData.forEach(s => db.series.insert({...s,is_active:true}));
  console.log(`${seriesData.length} series added`);
}

// ── Seed Ads ──
if (db.ads.count() === 0) {
  db.ads.insert({title:'Otel Spa Promosyon',image_url:'https://placehold.co/728x90/7c5cfc/ffffff?text=SPA+%26+WELLNESS+%7C+%2550+INDIRIM+%7C+Rezervasyon+icin+resepsiyonu+arayin',link_url:'',position:'bottom',display_mode:'always',interval_minutes:0,duration_seconds:0,is_active:true});
  db.ads.insert({title:'Restoran Menusu',image_url:'https://placehold.co/728x90/e53e3e/ffffff?text=ROOF+RESTAURANT+%7C+Aksam+Yemegi+%7C+18.00+-+23.00',link_url:'',position:'bottom',display_mode:'always',interval_minutes:0,duration_seconds:0,is_active:true});
  console.log('Demo ads added');
}

// ── Helpers ──
function genCode() { const c='ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; return [0,1,2].map(()=>Array.from({length:4},()=>c[Math.floor(Math.random()*c.length)]).join('')).join('-'); }

function authAdmin(req, res, next) {
  const a = req.headers.authorization;
  if (!a?.startsWith('Bearer ')) return res.status(401).json({error:'Unauthorized'});
  try {
    const [u,h] = Buffer.from(a.split(' ')[1],'base64').toString().split(':');
    if (!db.admins.findOne(x=>x.username===u&&x.password===h)) return res.status(401).json({error:'Invalid'});
    req.admin={username:u}; next();
  } catch { res.status(401).json({error:'Invalid'}); }
}

function checkDev(did) {
  const d = db.devices.findOne(x=>x.device_id===did&&x.is_active);
  if (!d) return {ok:false, err:'Cihaz bulunamadi'};
  if (new Date(d.expires_at)<new Date()) { db.devices.update(x=>x.device_id===did,{is_active:false}); return {ok:false,err:'Abonelik suresi doldu'}; }
  db.devices.update(x=>x.device_id===did,{last_seen:new Date().toISOString()});
  return {ok:true,device:d};
}

// ═══ ADMIN API ═══
app.post('/api/admin/login', (req, res) => {
  const {username,password}=req.body; const h=crypto.createHash('sha256').update(password||'').digest('hex');
  const u=db.admins.findOne(a=>a.username===username&&a.password===h);
  if (!u) return res.status(401).json({error:'Gecersiz kullanici adi veya sifre'});
  res.json({token:Buffer.from(`${username}:${h}`).toString('base64'),username});
});

app.post('/api/admin/codes/generate', authAdmin, (req, res) => {
  const {count=1,duration_days=365,max_devices=1,note=''}=req.body; const codes=[];
  for (let i=0;i<Math.min(count,100);i++) { const code=genCode(); db.codes.insert({code,duration_days,max_devices,is_used:false,created_by:req.admin.username,note}); codes.push({code,duration_days,max_devices}); }
  res.json({generated:codes.length,codes});
});
app.get('/api/admin/codes', authAdmin, (req, res) => res.json(db.codes.find().sort((a,b)=>new Date(b.created_at)-new Date(a.created_at))));
app.delete('/api/admin/codes/:id', authAdmin, (req, res) => { db.codes.remove(c=>c.id===req.params.id); res.json({success:true}); });

app.get('/api/admin/devices', authAdmin, (req, res) => res.json(db.devices.find().sort((a,b)=>new Date(b.created_at)-new Date(a.created_at))));
app.post('/api/admin/devices/:id/deactivate', authAdmin, (req, res) => { db.devices.update(d=>d.id===req.params.id,{is_active:false}); res.json({success:true}); });
app.post('/api/admin/devices/:id/extend', authAdmin, (req, res) => {
  const {days=365}=req.body; const dev=db.devices.findOne(d=>d.id===req.params.id);
  if (dev) { const e=new Date(dev.expires_at); e.setDate(e.getDate()+days); db.devices.update(d=>d.id===req.params.id,{expires_at:e.toISOString(),is_active:true}); }
  res.json({success:true});
});

app.get('/api/admin/channels', authAdmin, (req, res) => res.json(db.channels.find().sort((a,b)=>a.sort_order-b.sort_order)));
app.post('/api/admin/channels', authAdmin, (req, res) => { const ch=db.channels.insert({...req.body,sort_order:db.channels.count(),is_active:true}); res.json({id:ch.id}); });
app.put('/api/admin/channels/:id', authAdmin, (req, res) => { db.channels.update(c=>c.id===req.params.id,req.body); res.json({success:true}); });
app.delete('/api/admin/channels/:id', authAdmin, (req, res) => { db.channels.remove(c=>c.id===req.params.id); res.json({success:true}); });

app.get('/api/admin/vod', authAdmin, (req, res) => res.json(db.vod.find()));
app.post('/api/admin/vod', authAdmin, (req, res) => { const v=db.vod.insert({...req.body,is_active:true,sort_order:db.vod.count()}); res.json({id:v.id}); });
app.delete('/api/admin/vod/:id', authAdmin, (req, res) => { db.vod.remove(v=>v.id===req.params.id); res.json({success:true}); });

// ── Ads CRUD ──
app.get('/api/admin/ads', authAdmin, (req, res) => {
  const ads = db.ads.find();
  res.json(ads);
});
app.post('/api/admin/ads', authAdmin, (req, res) => {
  const ad = db.ads.insert({...req.body, is_active: true});
  res.json({id:ad.id});
});
app.put('/api/admin/ads/:id', authAdmin, (req, res) => { db.ads.update(a=>a.id===req.params.id, req.body); res.json({success:true}); });
app.delete('/api/admin/ads/:id', authAdmin, (req, res) => { db.ads.remove(a=>a.id===req.params.id); res.json({success:true}); });
app.post('/api/admin/ads/:id/toggle', authAdmin, (req, res) => {
  const ad = db.ads.findOne(a=>a.id===req.params.id);
  if (ad) db.ads.update(a=>a.id===req.params.id, {is_active: !ad.is_active});
  res.json({success:true});
});

// ── Series CRUD ──
app.get('/api/admin/series', authAdmin, (req, res) => res.json(db.series.find()));

app.post('/api/admin/import-m3u', authAdmin, (req, res) => {
  const {m3u_content}=req.body; if (!m3u_content) return res.status(400).json({error:'No M3U'}); const lines=m3u_content.split('\n'); let imp=0;
  for (let i=0;i<lines.length;i++) { if (lines[i].startsWith('#EXTINF:')) {
    const nm=lines[i].match(/,(.+)$/), lg=lines[i].match(/tvg-logo="([^"]*?)"/), gr=lines[i].match(/group-title="([^"]*?)"/), url=lines[i+1]?.trim();
    if (nm&&url&&url.startsWith('http')) { db.channels.insert({name:nm[1].trim(),stream_url:url,logo_url:lg?.[1]||'',group_name:gr?.[1]||'Imported',epg_id:'',sort_order:db.channels.count(),is_active:true}); imp++; }
  }} res.json({imported:imp});
});

app.get('/api/admin/stats', authAdmin, (req, res) => {
  const now=new Date();
  res.json({ totalCodes:db.codes.count(), usedCodes:db.codes.count(c=>c.is_used), availableCodes:db.codes.count(c=>!c.is_used),
    activeDevices:db.devices.count(d=>d.is_active&&new Date(d.expires_at)>now), totalDevices:db.devices.count(),
    totalChannels:db.channels.count(c=>c.is_active), totalVod:db.vod.count(v=>v.is_active), totalAds:db.ads.count(a=>a.is_active), totalSeries:db.series.count(s=>s.is_active),
    recentDevices:db.devices.find().sort((a,b)=>new Date(b.last_seen||0)-new Date(a.last_seen||0)).slice(0,5) });
});

// ═══ PUBLIC ENDPOINTS ═══
app.post('/api/activate', (req, res) => {
  const {code,device_id,device_name='Unknown',device_type='TV',mac_address=''}=req.body;
  if (!code||!device_id) return res.status(400).json({error:'Code and device_id required'});
  const cu=code.toUpperCase(), cr=db.codes.findOne(c=>c.code===cu);
  if (!cr) return res.status(404).json({error:'Gecersiz aktivasyon kodu'});
  if (db.devices.count(d=>d.activation_code===cu)>=cr.max_devices) return res.status(400).json({error:'Max cihaz sayisina ulasildi'});
  const ex=db.devices.findOne(d=>d.device_id===device_id);
  if (ex?.is_active&&new Date(ex.expires_at)>new Date()) return res.json({success:true,message:'Cihaz zaten aktif',expires_at:ex.expires_at});
  const exp=new Date(); exp.setDate(exp.getDate()+cr.duration_days);
  if (ex) db.devices.update(d=>d.device_id===device_id,{activation_code:cu,activated_at:new Date().toISOString(),expires_at:exp.toISOString(),is_active:true,device_name,device_type,mac_address});
  else db.devices.insert({device_id,mac_address,device_name,device_type,activation_code:cu,activated_at:new Date().toISOString(),expires_at:exp.toISOString(),is_active:true,last_seen:new Date().toISOString()});
  db.codes.update(c=>c.code===cu,{is_used:true});
  res.json({success:true,message:'Cihaz basariyla aktiflestirildi!',expires_at:exp.toISOString(),duration_days:cr.duration_days});
});

app.post('/api/check', (req, res) => {
  const {device_id}=req.body; if (!device_id) return res.status(400).json({error:'device_id required'});
  const r=checkDev(device_id); if (!r.ok) return res.status(403).json({active:false,error:r.err});
  res.json({active:true,expires_at:r.device.expires_at,device_name:r.device.device_name});
});

app.get('/api/ads', (req, res) => res.json(db.ads.find(a=>a.is_active)));
app.get('/api/series', (req, res) => res.json(db.series.find(s=>s.is_active)));

// ═══ XTREAM CODES API ═══
app.get('/player_api.php', (req, res) => {
  const {username,password,action}=req.query;
  if (!username) return res.status(401).json({error:'Auth required'});
  const dc=checkDev(username); if (!dc.ok) return res.status(403).json({user_info:{auth:0,status:'Expired',message:dc.err}});
  const d=dc.device, ui={auth:1,status:'Active',exp_date:Math.floor(new Date(d.expires_at).getTime()/1000),is_trial:0,active_cons:1,created_at:Math.floor(new Date(d.activated_at).getTime()/1000),max_connections:1,username,message:'FullIPTV'};
  if (!action) return res.json({user_info:ui,server_info:{url:req.protocol+'://'+req.get('host'),port:'80',https_port:'443',server_protocol:'http',timezone:'Europe/Istanbul',timestamp_now:Math.floor(Date.now()/1000)}});
  const chs=db.channels.find(c=>c.is_active).sort((a,b)=>a.sort_order-b.sort_order), grps=[...new Set(chs.map(c=>c.group_name))];
  if (action==='get_live_categories') return res.json(grps.map((g,i)=>({category_id:String(i+1),category_name:g,parent_id:0})));
  if (action==='get_live_streams') return res.json(chs.map(c=>({num:c.sort_order,name:c.name,stream_type:'live',stream_id:c.id,stream_icon:c.logo_url||'',epg_channel_id:c.epg_id||'',added:c.created_at,category_id:String(grps.indexOf(c.group_name)+1),category_name:c.group_name,direct_source:c.stream_url})));
  if (action==='get_vod_categories') { const vc=[...new Set(db.vod.find(v=>v.is_active).map(v=>v.category))]; return res.json(vc.map((c,i)=>({category_id:String(i+1),category_name:c,parent_id:0}))); }
  if (action==='get_vod_streams') return res.json(db.vod.find(v=>v.is_active).map(v=>({num:v.sort_order,name:v.title,stream_type:'movie',stream_id:v.id,stream_icon:v.poster_url||'',added:v.created_at,category_id:'1',category_name:v.category,container_extension:'m3u8',direct_source:v.stream_url})));
  res.json({user_info:ui});
});

app.get('/live/:u/:p/:sid.m3u8', (req, res) => { if (!checkDev(req.params.u).ok) return res.status(403).send('X'); const c=db.channels.findOne(x=>x.id===req.params.sid&&x.is_active); c?res.redirect(c.stream_url):res.status(404).send('N'); });
app.get('/get.php', (req, res) => {
  if (!req.query.username||!checkDev(req.query.username).ok) return res.status(403).send('X');
  let m='#EXTM3U\n'; db.channels.find(c=>c.is_active).sort((a,b)=>a.sort_order-b.sort_order).forEach(c=>{m+=`#EXTINF:-1 tvg-id="${c.epg_id||''}" tvg-logo="${c.logo_url||''}" group-title="${c.group_name}",${c.name}\n${c.stream_url}\n`;});
  res.setHeader('Content-Type','application/x-mpegurl'); res.send(m);
});

// ── Static ──
app.use('/admin', express.static(path.join(__dirname,'..','admin')));
app.use('/player', express.static(path.join(__dirname,'..','player')));
app.use('/', express.static(path.join(__dirname,'..','player')));

const PORT = process.env.PORT||3000;
app.listen(PORT, '0.0.0.0', () => console.log(`\n  FullIPTV v5.0 running on http://localhost:${PORT}\n  Admin: /admin | Player: /player\n  Login: admin / admin123\n`));
