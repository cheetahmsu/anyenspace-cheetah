// LÀNG YÊN · Xứ Yên · Arctic Wonderland (vùng tuyết Bắc Âu kiểu Lapland, mùa Giáng sinh). Mô-đun riêng, tải lười khi bấm "Khám phá Xứ Yên".
// Tự chứa: một lớp toàn màn hình với canvas, cảnh, camera và nhân vật riêng; không đụng tới Rừng Yên hay Vịnh Yên.
// Bố cục theo bản đồ minh hoạ "Xứ Yên" (27/11): cổng gỗ Xứ Yên phía trước, Làng Lapland ở giữa quanh cây thông lớn, sáu khu đánh số,
// cộng thêm Chùa Tuyết Yên trên núi ở góc trên bên trái (tây bắc). 1 đơn vị = 1 m, -z là phía bắc.
//   Cổng (0,96) → Làng Lapland, cây thông lớn (0,30) → đường lên núi, bậc đá tới chùa (-72,-112)
//   1 Rừng Kính: lều kính vòm dọc bờ bắc Hồ Băng, nằm nhìn cực quang · 6 Hồ Băng & Xe Trượt phía đông (78,40)
//   3 Rừng Thông & Husky phía tây (-100,-15) · 4 Khu Vui Chơi Giáng Sinh phía tây nam (-32,64) · 5 Trang Trại Tuần Lộc phía đông bắc (56,-40)
// Tư liệu: apukkaresort.fi (lều kính Aurora/Kammi nhìn trời 360°, husky, xe trượt qua hồ băng), wherethesoulswander.com,
// trangantravel.com.vn (săn cực quang Lapland), laits.utexas.edu (lều kota, lavvu của người Sámi).

const ZONES=[
  {id:'don',n:'',name:'Cổng Xứ Yên',icon:'⛩',x:14,z:110,ml:[62,6],cam:[0,-1],note:'Hít một hơi lạnh trong lành, thở ra thật chậm.'},
  {id:'rungkinh',n:'1',name:'Rừng Kính',icon:'✨',x:110,z:0,ml:[0,-46],cam:[1,0],note:'Lều kính ven hồ giữa rừng thông, nằm ngắm sao và cực quang.'},
  {id:'lang',n:'2',name:'Làng Lapland',icon:'🏡',x:22,z:76,ml:[-70,0],cam:[-.4,-1],note:'Nhà gỗ, chợ đêm, ẩm thực ấm quanh cây thông lớn.'},
  {id:'rung',n:'5',name:'Rừng Thông & Husky',icon:'🐕',x:12,z:-4,cam:[0,-1],note:'Xe chó kéo dạo giữa rừng tuyết.'},
  {id:'vuichoi',n:'3',name:'Khu Vui Chơi Giáng Sinh',icon:'🎠',x:-46,z:76,ml:[-40,24],cam:[.5,-1],note:'Vòng quay, ngựa gỗ, hoạt động Noel.'},
  {id:'truotbang',n:'4',name:'Hồ Trượt Băng',icon:'⛸️',x:-12,z:104,cam:[0,-1],note:'Sân băng nhỏ trước làng, trượt chậm cùng gia đình.'},
  {id:'tuanloc',n:'6',name:'Trang Trại Tuần Lộc',icon:'🦌',x:112,z:90,cam:[1,0],note:'Gặp tuần lộc, cho ăn, tìm hiểu văn hoá Sámi.'},
  {id:'hobang',n:'7',name:'Hồ Băng Lớn',icon:'❄️',x:30,z:14,ml:[60,24],cam:[1,-.1],note:'Xe trượt lướt chậm trên mặt hồ soi bóng cực quang.'},
  {id:'dinh',n:'9',name:'Đỉnh Tuyết Yên',icon:'⛷️',x:100,z:-36,cam:[0,-1],note:'Khu trượt tuyết trên núi, ngắm toàn cảnh Xứ Yên.'},
  {id:'chua',n:'8',name:'Chùa Tuyết Yên',icon:'🪷',x:-46,z:-76,cam:[-.6,-1],note:'Chánh điện gỗ sồi và tượng Phật ngoài trời giữa núi tuyết.'}];
const LAKE={x:108,z:46,rx:54,rz:24,rot:-.42},RINK={x:-12,z:82,rx:21,rz:10},ICE_Y=-.12,HILL={x:-72,z:-112,r:40,h:16},STAIR={x:-48,z:-80};
const RSH=a=>1+.07*Math.sin(2*a+1.1)+.06*Math.sin(3*a+.4)+.04*Math.sin(5*a);/* sân băng bờ lượn mềm */
const LSH=a=>1+.2*Math.sin(2*a+.7)+.15*Math.sin(3*a+2.1)+.09*Math.sin(5*a+1.3)+.07*Math.sin(4*a+.4);/* bờ hồ uốn lượn tự nhiên */
const LC=Math.cos(LAKE.rot),LS=Math.sin(LAKE.rot),LW=(u,v)=>[LAKE.x+u*LC-v*LS,LAKE.z+u*LS+v*LC];
const lakeShore=(a,off,k)=>{const R=LSH(a)*(k||1),[bx,bz]=LW(Math.cos(a)*R*LAKE.rx,Math.sin(a)*R*LAKE.rz),dx=bx-LAKE.x,dz=bz-LAKE.z,l=Math.hypot(dx,dz);return [bx+dx/l*off,bz+dz/l*off]};
const ISLE=(()=>{const [x,z]=LW(-20,-2);return {x,z,r:7}})();
const IGLOOS=[[-1.1,4],[-.62,17],[.28,2]].map(([a,o])=>lakeShore(a,o));/* Lều Rừng Thông · Lều Đồi Tuyết · Lều Bờ Hồ */
const toLake=([x,z],d)=>{const dx=LAKE.x-x,dz=LAKE.z-z,l=Math.hypot(dx,dz);return [x+dx/l*d,z+dz/l*d]};
{const z=ZONES.find(q=>q.id==='rungkinh'),[x0,z0]=IGLOOS[1],[x1,z1]=toLake(IGLOOS[1],12);z.x=x1;z.z=z1;z.cam=[x0-x1,z0-z1]}
const PIER=(()=>{const a=lakeShore(2.95,0),b=toLake(a,9);return [a,b]})();/* cầu gỗ bờ tây, xuất phát xe trượt */
const SLOOP=Array.from({length:64},(_,i)=>lakeShore(Math.PI-i/64*Math.PI*2,0,.72));/* tuyến xe trượt trên hồ (khép kín) */
const SKI={x:104,z:-118,r:66,h:50},SKIRUNS=[[[98,-110],[93,-102],[94,-94],[99,-86],[97,-78],[90,-70],[88,-60]],[[112,-110],[118,-101],[121,-92],[117,-84],[119,-75],[125,-66],[124,-58]]],LIFT=[[78,-60],[94,-110]];
const HTRAILS=[[[14,96],[24,80],[34,62],[38,40],[34,18],[26,-4],[14,-12],[22,-22],[10,-32],[18,-42],[10,-50]],[[10,-50],[40,-58],[66,-56],[80,-58]],[[10,-50],[-16,-66],[-42,-80]],[[26,-4],[70,8],[110,4],[140,-2],[176,-2]],[[35,52],[24,50]]];/* tuyến husky chính có nhánh */
const HR=[[22,-22],[10,-32],[18,-42],[10,-50],[40,-58],[66,-56],[80,-58]];/* xe husky chạy đi về */
const HUSKY={x:10,z:-50,rx:1,rz:1};
const along=(pts,closed,u)=>{const P=closed?[...pts,pts[0]]:pts;let tot=0;const L=[];for(let i=0;i+1<P.length;i++){const l=Math.hypot(P[i+1][0]-P[i][0],P[i+1][1]-P[i][1]);L.push(l);tot+=l}
  let d=((u%1)+1)%1*tot;if(!closed&&u>=1)d=tot;for(let i=0;i<L.length;i++){if(d<=L[i]||i===L.length-1){const t=Math.min(1,d/L[i]),a=P[i],b=P[i+1];return [a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,Math.atan2(b[0]-a[0],b[1]-a[1])]}d-=L[i]}};
const FARM={x:142,z:88,r:14},TREE={x:10,z:56},FUN={x:-30,z:56},CAR={x:-22,z:62},WHEEL={x:-36,z:50};
const PATHS=[[[14,98],[17,80],[13,66]],[[0,60],[-14,62]],[[46,86],[84,94],[124,94]],[[124,94],[124,78],[132,68],[156,66]],[[124,94],[128,104],[146,108],[160,104]],[[12,-4],[6,-12],[2,-24],[-4,-34]],[[30,-20],[38,-26]]],HUSKY_TRAIL=[];
const STATIONS=[
  {id:'aurora',x:48,z:-49.6,label:'✨ Vào lều kính ngắm cực quang'},
  {id:'husky',x:12.5,z:-19,label:'🐕 Lên xe husky dạo rừng'},
  {id:'sled',x:0,z:0,label:'🛷 Lái xe trượt trên hồ băng'},
  {id:'sit',x:0,z:-94.2,label:'🪷 Ngồi thiền trước Phật'},
  {id:'bell',x:9,z:-94,label:'🪷 Chiêm bái tượng Phật'},
  {id:'fire',x:-44,z:85.4,label:'🔥 Ngồi sưởi bên bếp lửa'},
  {id:'deer',x:125.4,z:88,label:'🦌 Cho tuần lộc ăn rêu'},
  {id:'carousel',x:-22,z:67.4,label:'🎠 Ngồi vòng ngựa gỗ'},
  {id:'wheel',x:-36,z:55.6,label:'🎡 Lên vòng quay ngắm làng'}];
{const q=STATIONS.find(o=>o.id==='aurora'),[x,z]=toLake(IGLOOS[1],7.4);q.x=x;q.z=z}
{const q=STATIONS.find(o=>o.id==='sled');q.x=PIER[1][0];q.z=PIER[1][1];const zn=ZONES.find(o=>o.id==='hobang');zn.x=PIER[0][0]-4;zn.z=PIER[0][1];zn.cam=[PIER[1][0]-PIER[0][0],PIER[1][1]-PIER[0][1]]}

export function openSnow(THREE,opts){opts=opts||{};
  if(window.__snowOpen)return window.__snowOpen;
  const coarse=!!(window.matchMedia&&matchMedia('(pointer:coarse)').matches),LOW=coarse||!!opts.low;
  // ---------- khung trang ----------
  const box=document.createElement('section');box.id='snowBox';box.setAttribute('role','dialog');box.setAttribute('aria-label','Xứ Yên');
  box.innerHTML='<canvas id="snowCanvas"></canvas><div class="sn-top"><strong>✧ LÀNG YÊN - XỨ YÊN</strong><span class="sn-sp"></span><button type="button" data-sn="map">🗺 Bản đồ</button><button type="button" data-sn="home">🏠 Trang chính</button></div>'
    +'<div class="sn-cap" aria-live="polite"></div><div class="sn-breath" hidden><div class="sn-orb"></div><span></span></div>'
    +'<div class="sn-bottom"><button type="button" class="sn-act" hidden></button><button type="button" class="sn-stop" hidden>↩ Đứng dậy</button></div>'
    +'<div class="sn-map" hidden><div class="sn-card"><div class="sn-mh"><b>Bản đồ Xứ Yên</b><button type="button" data-sn="mapx">✕ Đóng</button></div><canvas class="sn-mc" width="720" height="720"></canvas><div class="sn-list"></div></div></div>';
  const css=document.createElement('style');css.id='snowCss';css.textContent=`#snowBox{position:fixed;inset:0;z-index:150;background:#0b1424;color:#f3ead8;font:15px/1.4 system-ui,sans-serif;touch-action:none;user-select:none;-webkit-user-select:none}
#snowCanvas{position:absolute;inset:0;width:100%;height:100%;display:block}
#snowBox .sn-top{position:absolute;left:0;right:0;top:0;display:flex;gap:8px;align-items:center;padding:calc(8px + env(safe-area-inset-top)) 12px 8px;background:linear-gradient(#0b1424cc,#0b142400)}
#snowBox .sn-top strong{font-weight:600;letter-spacing:.06em;font-size:13px;color:#f1e2bf}#snowBox .sn-sp{flex:1}
#snowBox button{border:1px solid #d6b87888;border-radius:999px;background:#0e1f33cc;color:#f5e8cc;padding:8px 13px;font-size:14px;cursor:pointer;-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px)}
#snowBox .sn-cap{position:absolute;left:50%;top:calc(56px + env(safe-area-inset-top));transform:translateX(-50%);max-width:min(560px,92vw);text-align:center;padding:8px 14px;border-radius:14px;background:#0b142499;opacity:0;transition:opacity .8s;pointer-events:none;font-size:14px}
#snowBox .sn-cap.on{opacity:1}
#snowBox .sn-bottom{position:absolute;left:0;right:0;bottom:calc(14px + env(safe-area-inset-bottom));display:flex;gap:10px;justify-content:center;flex-wrap:wrap;padding:0 12px;pointer-events:none}
#snowBox .sn-bottom button{pointer-events:auto;padding:11px 18px;font-size:15px}#snowBox .sn-act{background:#c8a96a;color:#13202c;font-weight:600;border-color:#c8a96a}
#snowBox [hidden]{display:none!important}
#snowBox .sn-breath{position:absolute;left:50%;bottom:calc(84px + env(safe-area-inset-bottom));transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;gap:8px;pointer-events:none}
#snowBox .sn-orb{width:54px;height:54px;border-radius:50%;background:radial-gradient(circle,#bff5dc 0,#6fd2b4 45%,#6fd2b400 72%);animation:snBreath 10s ease-in-out infinite}
@keyframes snBreath{0%,100%{transform:scale(.6);opacity:.55}40%{transform:scale(1.25);opacity:1}55%{transform:scale(1.25);opacity:1}}
#snowBox .sn-map{position:absolute;inset:0;background:#050a14aa;display:flex;align-items:center;justify-content:center;padding:12px}
#snowBox .sn-card{width:min(560px,96vw);max-height:94vh;overflow:auto;background:#0e1b2c;border:1px solid #d6b87866;border-radius:18px;padding:12px}
#snowBox .sn-mh{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px}#snowBox .sn-mc{width:100%;height:auto;border-radius:12px;display:block;touch-action:manipulation}
#snowBox .sn-list{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:10px}#snowBox .sn-list button{border-radius:12px;text-align:left;font-size:13px;padding:8px 10px}
body.snow-open .shell,body.snow-open .scene{visibility:hidden}
@media(max-width:520px){#snowBox .sn-top strong{font-size:11px;letter-spacing:.03em}#snowBox .sn-top button{padding:7px 10px;font-size:13px;white-space:nowrap}}`;
  document.head.appendChild(css);document.body.appendChild(box);document.body.classList.add('snow-open');
  const cv=box.querySelector('#snowCanvas'),capEl=box.querySelector('.sn-cap'),actBtn=box.querySelector('.sn-act'),stopBtn=box.querySelector('.sn-stop'),breathEl=box.querySelector('.sn-breath'),mapEl=box.querySelector('.sn-map');
  let capT=0;const caption=(t,ms)=>{capEl.textContent=t;capEl.classList.add('on');clearTimeout(capT);capT=setTimeout(()=>capEl.classList.remove('on'),ms||5000)};

  // ---------- renderer, cảnh ----------
  const R=new THREE.WebGLRenderer({canvas:cv,antialias:!LOW,powerPreference:'high-performance'});R.setPixelRatio(Math.min(LOW?1.5:2,devicePixelRatio||1));R.outputColorSpace=THREE.SRGBColorSpace;R.toneMapping=THREE.ACESFilmicToneMapping;R.toneMappingExposure=1.05;
  const sc=new THREE.Scene();sc.fog=new THREE.FogExp2('#1b2a4a',.0062);
  const cam=new THREE.PerspectiveCamera(58,1,.1,1400);
  sc.add(new THREE.HemisphereLight('#8fa8dc','#1e2846',1.15));
  const moon=new THREE.DirectionalLight('#b9ccff',.85);moon.position.set(-60,80,40);sc.add(moon);
  const warm=(x,y,z,i,d)=>{const l=new THREE.PointLight('#ffb366',i,d,1.6);l.position.set(x,y,z);sc.add(l);return l};

  // ---------- hàm ngẫu nhiên, nhiễu, độ cao ----------
  let seed=20261127;const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
  const hh=(x,z)=>{const v=Math.sin(x*127.1+z*311.7)*43758.5453;return v-Math.floor(v)};
  const vn=(x,z)=>{const ix=Math.floor(x),iz=Math.floor(z),fx=x-ix,fz=z-iz,sx=fx*fx*(3-2*fx),sz=fz*fz*(3-2*fz);const a=hh(ix,iz),b=hh(ix+1,iz),c=hh(ix,iz+1),d=hh(ix+1,iz+1);return a+(b-a)*sx+(c-a)*sz+(a-b-c+d)*sx*sz};
  const sm=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t)};
  const lakeE=(x,z)=>{const dx=x-LAKE.x,dz=z-LAKE.z,u=(dx*LC+dz*LS)/LAKE.rx,v=(-dx*LS+dz*LC)/LAKE.rz,e=Math.hypot(u,v)/LSH(Math.atan2(v,u));if(e<1){const di=Math.hypot(x-ISLE.x,z-ISLE.z)/ISLE.r;if(di<1.35)return Math.max(e,1+(1.35-di)/1.35*.4)}return e};
  function H(x,z){const r=Math.hypot(x,z);let h=(vn(x*.025,z*.025)-.5)*1.3+(vn(x*.07+9,z*.07)-.5)*.4;
    {const k=sm(175,320,r),rid=1-Math.abs(vn(x*.011,z*.011)*2-1),rid2=1-Math.abs(vn(x*.03+5,z*.03)*2-1);h+=k*(10+rid*rid*72+rid2*14)}/* núi tuyết vòng ngoài, sống núi nhọn */
    const dh=Math.hypot(x-HILL.x,z-HILL.z);h+=HILL.h*(1-sm(HILL.r*.35,HILL.r,dh));/* đồi chùa */
    {const dm=Math.hypot(x-IGLOOS[1][0],z-IGLOOS[1][1]);h+=5*(1-sm(5,15,dm))}/* đồi tuyết dưới Lều Đồi Tuyết */
    {const dq=Math.hypot(x-SKI.x,z-SKI.z);h+=SKI.h*(1-sm(SKI.r*.12,SKI.r,dq))}/* núi Đỉnh Tuyết Yên */
    {const er=Math.hypot((x-RINK.x)/RINK.rx,(z-RINK.z)/RINK.rz);if(er<1.5)h*=sm(1,1.5,er)}/* đồi rừng sau lều kính */
    const e=lakeE(x,z);if(e<1.25)h=e<1?-.6:-.6+(h+.6)*sm(1,1.25,e);return h}
  const groundY=(x,z)=>lakeE(x,z)<1?ICE_Y:H(x,z);

  // ---------- gộp hình: mỗi nhóm vật liệu là một lưới, ít lệnh vẽ, chạy nhẹ trên điện thoại ----------
  const G={box:new THREE.BoxGeometry(1,1,1),cone:new THREE.ConeGeometry(1,1,7,1,true),cone12:new THREE.ConeGeometry(1,1,12),cyl:new THREE.CylinderGeometry(1,1,1,8),cyl12:new THREE.CylinderGeometry(1,1,1,14),sph:new THREE.SphereGeometry(1,10,8),sphLo:new THREE.SphereGeometry(1,6,5),
    prism:new THREE.CylinderGeometry(1,1,1,3).rotateX(-Math.PI/2).translate(0,.5,0).scale(1/1.732,1/1.5,1),pyr4:new THREE.CylinderGeometry(.0001,1,1,4,1).rotateY(Math.PI/4),frus:new THREE.CylinderGeometry(.62,1,1,4,1).rotateY(Math.PI/4),cyl6:new THREE.CylinderGeometry(1,1,1,6)};
  for(const k in G)if(G[k].index)G[k]=G[k].toNonIndexed();
  const _m=new THREE.Matrix4(),_q=new THREE.Quaternion(),_e=new THREE.Euler(),_v=new THREE.Vector3(),_s=new THREE.Vector3(),_c=new THREE.Color();
  const MX=(x,y,z,sx,sy,sz,rx,ry,rz)=>{_e.set(rx||0,ry||0,rz||0,'YXZ');_q.setFromEuler(_e);return new THREE.Matrix4().compose(_v.set(x,y,z),_q,_s.set(sx,sy==null?sx:sy,sz==null?sx:sz))};
  class Batch{constructor(){this.p=[];this.n=[];this.c=[];this.T=new THREE.Matrix4()}
    at(x,y,z,ry,s){this.T=MX(x,y,z,s||1,s||1,s||1,0,ry||0,0);return this}
    reset(){this.T=new THREE.Matrix4();return this}
    add(geo,col,m){const g=geo.clone();g.applyMatrix4(_m.multiplyMatrices(this.T,m));const P=g.attributes.position.array,N=g.attributes.normal.array;_c.set(col);
      for(let i=0;i<P.length;i++){this.p.push(P[i]);this.n.push(N[i])}for(let i=0;i<P.length/3;i++)this.c.push(_c.r,_c.g,_c.b);g.dispose();return this}
    b(col,x,y,z,sx,sy,sz,ry,rx,rz){return this.add(G.box,col,MX(x,y,z,sx,sy,sz,rx,ry,rz))}
    geo(){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(this.p,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(this.n,3));g.setAttribute('color',new THREE.Float32BufferAttribute(this.c,3));g.computeBoundingSphere();return g}
    mesh(mat){const m=new THREE.Mesh(this.geo(),mat);return m}}
  const LAM=new THREE.MeshLambertMaterial({vertexColors:true}),GLOW=new THREE.MeshBasicMaterial({vertexColors:true,fog:false,toneMapped:false});
  const S=new Batch(),L=new Batch(),T=new Batch();/* S: vật thể thường · L: đèn, cửa sổ sáng · T: cây thông */
  const colliders=[];const block=(x,z,r)=>colliders.push([x,z,r]);

  // ---------- bầu trời đêm xanh thẫm và cực quang (theo ảnh chụp cực quang thật: dải lục toả tia, viền tím hồng) ----------
  // Cực quang: dải sáng uốn lượn ở "độ cao" cố định, dò dọc tia nhìn qua nhiều lớp nên có tia dọc và màu đổi theo chiều cao.
  const U={time:{value:0},boost:{value:1},camP:{value:new THREE.Vector3()}};
  const AUR_STEPS=LOW?9:14;
  const SKYFN=`uniform float time,boost;
    float h2(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
    float n2(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h2(i),h2(i+vec2(1,0)),f.x),mix(h2(i+vec2(0,1)),h2(i+vec2(1,1)),f.x),f.y);}
    float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<3;i++){v+=a*n2(p);p=p*2.1+vec2(3.1,1.7);a*=.5;}return v;}
    vec3 aurora(vec3 d){if(d.y<.015)return vec3(0.);vec3 acc=vec3(0.);
      for(int i=0;i<${AUR_STEPS};i++){float v=float(i)/${AUR_STEPS}.;float h=1.+v*.75;vec2 p=d.xz*(h/d.y)*.32;
        float w=fbm(vec2(p.x*.35+time*.015,time*.01))*1.6;
        float c1=p.y+.32+sin(p.x*.55+time*.04)*.45+w*.4;/* dải chính vắt ngang trời phía bắc */
        float c2=p.y+1.05+sin(p.x*.32-time*.03+1.3)*.6+w*.5;/* dải thấp sát núi */
        float c3=p.y-.28+sin(p.x*.8+time*.05+2.)*.35+w*.3;/* dải mảnh gần đỉnh đầu */
        float b=exp(-c1*c1*60.)+exp(-c2*c2*30.)*.85+exp(-c3*c3*90.)*.55;
        float rays=.08+.92*pow(n2(vec2(p.x*14.+w*3.+time*.2,v*.3)),2.)*1.4;
        vec3 col=mix(vec3(.12,1.,.42),vec3(.25,.95,.75),smoothstep(.2,.5,v));col=mix(col,vec3(.78,.28,.82),smoothstep(.5,1.,v));
        acc+=col*b*rays*(1.15-v*.75);}
      return acc*(4.2/${AUR_STEPS}.)*smoothstep(.015,.12,d.y)*boost;}
    vec3 skyCol(vec3 d){float y=d.y;vec3 c=mix(vec3(.13,.2,.34),vec3(.035,.08,.2),smoothstep(0.,.3,y));c=mix(c,vec3(.01,.02,.07),smoothstep(.3,.95,y));
      float south=max(0.,d.z);c+=vec3(.22,.12,.2)*pow(south,2.)*exp(-max(y,0.)*9.)*.5;
      vec2 g=floor(d.xz/(abs(d.y)+.35)*260.);float st=step(.9965,h2(g))*smoothstep(.04,.3,y);c+=vec3(.9,.95,1.)*st*(.55+.45*sin(time*2.+h2(g+3.)*40.));
      c+=aurora(d);return c;}`;
  const sky=new THREE.Mesh(new THREE.SphereGeometry(1200,40,20),new THREE.ShaderMaterial({uniforms:U,side:THREE.BackSide,depthWrite:false,fog:false,toneMapped:false,
    vertexShader:'varying vec3 vD;void main(){vD=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader:SKYFN+`varying vec3 vD;void main(){vec3 d=normalize(vD);vec3 c=d.y<0.?vec3(.13,.2,.34):skyCol(d);gl_FragColor=vec4(c,1.);
        #include <colorspace_fragment>
      }`}));sky.frustumCulled=false;sky.renderOrder=-10;sc.add(sky);

  // ---------- mặt đất tuyết (vẽ đường đi lên vân) ----------
  const W=900,TX=LOW?1024:2048,tcv=document.createElement('canvas');tcv.width=tcv.height=TX;{const c=tcv.getContext('2d'),k=TX/W,P=(x,z)=>[(x+W/2)*k,(z+W/2)*k];
    c.fillStyle='#eef2f8';c.fillRect(0,0,TX,TX);
    for(let i=0;i<TX*TX/220;i++){const x=Math.random()*TX,y=Math.random()*TX,r=Math.random()*3*k+.5;c.fillStyle=Math.random()<.5?'rgba(205,216,236,.35)':'rgba(255,255,255,.5)';c.beginPath();c.arc(x,y,r,0,7);c.fill()}
    const line=(pts,w,col)=>{c.strokeStyle=col;c.lineWidth=w*k;c.lineCap=c.lineJoin='round';c.beginPath();pts.forEach((p,i)=>{const q=P(p[0],p[1]);i?c.lineTo(...q):c.moveTo(...q)});c.stroke()};
    for(const p of PATHS){line(p,4.6,'rgba(196,204,220,.55)');line(p,3,'rgba(214,206,196,.85)')}
    const ell=(o,col,w,off)=>{c.strokeStyle=col;c.lineWidth=w*k;c.beginPath();for(let i=0;i<=96;i++){const a=i/96*Math.PI*2,q=P(o.x+Math.cos(a)*(o.rx+off),o.z+Math.sin(a)*(o.rz+off));i?c.lineTo(...q):c.moveTo(...q)}c.stroke()};
    for(const t of HTRAILS){line(t,5,'rgba(200,190,176,.7)');line(t,3.2,'rgba(226,196,150,.9)')}for(const r of SKIRUNS){line(r,9,'rgba(250,250,255,.95)');line(r,1.2,'rgba(255,150,210,.9)')}
    {const q=P(FARM.x,FARM.z);c.fillStyle='rgba(206,200,190,.7)';c.beginPath();c.arc(q[0],q[1],FARM.r*k,0,7);c.fill()}
    {const q=P(TREE.x,TREE.z);c.fillStyle='rgba(226,218,206,.85)';c.beginPath();c.arc(q[0],q[1],11*k,0,7);c.fill();c.strokeStyle='rgba(200,180,150,.8)';c.lineWidth=1.2*k;c.beginPath();c.arc(q[0],q[1],8*k,0,7);c.stroke()}}
  const ttex=new THREE.CanvasTexture(tcv);ttex.colorSpace=THREE.SRGBColorSpace;ttex.anisotropy=4;
  {const seg=LOW?150:220,g=new THREE.PlaneGeometry(W,W,seg,seg);g.rotateX(-Math.PI/2);const P=g.attributes.position;for(let i=0;i<P.count;i++)P.setY(i,H(P.getX(i),P.getZ(i)));g.computeVertexNormals();{const N=g.attributes.normal,C=[];for(let i=0;i<P.count;i++){const st=1-N.getY(i),k=sm(.32,.6,st)*sm(100,180,Math.hypot(P.getX(i),P.getZ(i))),f=1-k*.72;C.push(f*(1-k*.05),f,f*(1+k*.08))}g.setAttribute('color',new THREE.Float32BufferAttribute(C,3))}
    const ground=new THREE.Mesh(g,new THREE.MeshLambertMaterial({map:ttex,vertexColors:true}));ground.name='ground';sc.add(ground);var groundMesh=ground}
  // núi tuyết xa phía sau vòng ngoài
  for(let i=0;i<46;i++){const a=i/46*Math.PI*2+rnd()*.1,r=380+rnd()*120,h=40+rnd()*90,w=60+rnd()*70;S.add(G.cone,'#c9d4e8',MX(Math.cos(a)*r,h/2-6,Math.sin(a)*r,w,h,w*(.7+rnd()*.5),0,rnd()*3,0))}
  // hồ băng phẳng lặng như gương: phản chiếu bầu trời và cực quang, vân nứt băng mờ
  const ice=new THREE.Mesh((()=>{const sh=new THREE.Shape();for(let i=0;i<=160;i++){const [bx,bz]=lakeShore(-i/160*Math.PI*2,0);i?sh.lineTo(bx-LAKE.x,-(bz-LAKE.z)):sh.moveTo(bx-LAKE.x,-(bz-LAKE.z))}
      const ho=new THREE.Path();for(let i=0;i<=40;i++){const a=i/40*Math.PI*2,r=ISLE.r*1.3;const hx=ISLE.x+Math.cos(a)*r,hz=ISLE.z+Math.sin(a)*r;i?ho.lineTo(hx-LAKE.x,-(hz-LAKE.z)):ho.moveTo(hx-LAKE.x,-(hz-LAKE.z))}sh.holes.push(ho);
      return new THREE.ShapeGeometry(sh,4).rotateX(-Math.PI/2)})(),new THREE.ShaderMaterial({uniforms:U,side:THREE.DoubleSide,fog:false,toneMapped:false,
    vertexShader:'varying vec3 vW;void main(){vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}',
    fragmentShader:SKYFN+`uniform vec3 camP;varying vec3 vW;void main(){vec3 v=normalize(vW-camP);vec2 q=vW.xz*.35;
        vec3 n=normalize(vec3((n2(q*3.)-.5)*.05,1.,(n2(q*3.+7.)-.5)*.05));vec3 r=reflect(v,n);r.y=abs(r.y);
        float fr=.3+.7*pow(1.-max(-v.y,0.),3.);vec3 base=vec3(.03,.13,.22);
        float cr=smoothstep(.48,.5,n2(q*1.3))*smoothstep(.52,.5,n2(q*1.3))*.07;
        vec3 c=mix(base,skyCol(r)*.85,clamp(fr,0.,.62))+cr*vec3(.6,.8,.85)+vec3(.0,.03,.04);
        float dist=length(vW-camP);c=mix(c,vec3(.13,.2,.34),1.-exp(-dist*dist*.0000035));
        gl_FragColor=vec4(c,1.);
        #include <colorspace_fragment>
      }`}));ice.position.set(LAKE.x,ICE_Y,LAKE.z);ice.name='ice';sc.add(ice);
  {const sh=new THREE.Shape();for(let i=0;i<=64;i++){const a=-i/64*Math.PI*2,k=RSH(a);i?sh.lineTo(Math.cos(a)*RINK.rx*k,-Math.sin(a)*RINK.rz*k):sh.moveTo(Math.cos(a)*RINK.rx*k,-Math.sin(a)*RINK.rz*k)}const rk=new THREE.Mesh(new THREE.ShapeGeometry(sh,3).rotateX(-Math.PI/2),ice.material);rk.position.set(RINK.x,.05,RINK.z);sc.add(rk)}

  // ---------- các mẫu dựng ----------
  const SNOW='#f4f7fc',IVORY='#f1eee5',WREATH=new THREE.TorusGeometry(.42,.13,5,14).toNonIndexed();
  function pine(B,x,z,h,y0){const y=y0==null?H(x,z):y0,w=h*.36;B.add(G.cyl,'#4a3a2e',MX(x,y+h*.08,z,w*.09,h*.18,w*.09));
    const tiers=h>6?4:3;for(let i=0;i<tiers;i++){const t=i/tiers,ty=y+h*(.18+t*.68),r=w*(1-t*.62),th=h*(.4-.05*i);
      B.add(G.cone,i%2?'#1f3d34':'#24463b',MX(x,ty+th/2,z,r,th,r,0,i*.6,0));B.add(G.cone,SNOW,MX(x,ty+th*.62,z,r*.78,th*.42,r*.78,0,i*.6+.3,0))}
    B.add(G.cone,SNOW,MX(x,y+h*.97,z,w*.16,h*.1,w*.16))}
  // nhà gỗ Lapland: thân gỗ sẫm (đỏ Falu, nâu), mái dốc phủ tuyết dày, cửa sổ vàng ấm, ống khói, củi xếp hiên
  function cabin(x,z,ry,o){o=o||{};const w=o.w||7,d=o.d||9,h=o.h||3.2,col=o.col||'#8a5f3e',y=H(x,z);S.at(x,y,z,ry);L.at(x,y,z,ry);
    S.b('#3d3530',0,-.3,0,w+.5,.8,d+.5);S.b(col,0,h/2,0,w,h,d);
    for(let i=0;i<6;i++){S.b(i%2?'#5a271e':col,0,.3+i*.5,d/2+.01,w,.06,.02)}
    const a=.72,s=w/2+.45,Lr=s/Math.cos(a),rh=Math.tan(a)*(w/2);
    S.add(G.prism,col,MX(0,h,0,w,rh,d));
    const ry0=h+rh-Math.tan(a)*s/2+.1;for(const sd of [-1,1]){S.b('#2e2622',sd*s/2,ry0,0,Lr,.22,d+.8,0,0,-sd*a);S.b(SNOW,sd*(s/2-.08),ry0+.27,0,Lr+.05,.38,d+1,0,0,-sd*a)}
    S.b(SNOW,0,h+rh+.18,0,.7,.4,d+1);
    S.b('#5c5550',w*.25,h+rh*.7,-d*.2,.7,2.2,.7);S.b(SNOW,w*.25,h+rh*.7+1.15,-d*.2,.85,.2,.85);
    S.b('#3b2a20',0,1.1,d/2+.06,1.2,2.2,.12);L.b('#ffd08a',0,2.6,d/2+.05,.5,.35,.05);
    for(const sx of [-1,1]){L.b('#ffc977',sx*w*.3,1.7,d/2+.04,1.1,1,.05);S.b('#e9e2d6',sx*w*.3,1.17,d/2+.12,1.3,.1,.2);
      for(const sz of [-.22,.22])L.b('#ffc977',sx*(w/2+.03),1.7,sz*d,.05,1,1.1)}
    if(o.porch!==false){S.b('#4a3a2e',0,.15,d/2+1.1,w*.6,.2,2);for(const sx of [-1,1])S.b('#3a2c22',sx*w*.28,1.3,d/2+2,.18,2.4,.18);S.b('#2e2622',0,2.6,d/2+1.3,w*.66,.16,2.4,0,-.18);S.b(SNOW,0,2.76,d/2+1.3,w*.68,.18,2.4,0,-.18)}
    for(let i=0;i<5;i++)S.add(G.cyl,i%2?'#8a6a4a':'#7a5a3e',MX(-w/2-.5,.25+Math.floor(i/3)*.4,-d*.15+(i%3)*.42-.4,.18,1.4,.18,Math.PI/2,0,0));
    stringLights(L,-w/2-.45,h+.05,d/2+.12,0,h+rh+.15,d/2+.12,12,0);stringLights(L,0,h+rh+.15,d/2+.12,w/2+.45,h+.05,d/2+.12,12,0);stringLights(L,-w/2-.45,h+.02,-d/2,-w/2-.45,h+.02,d/2,14,0);stringLights(L,w/2+.45,h+.02,-d/2,w/2+.45,h+.02,d/2,14,0);
    S.add(WREATH,'#2f5b48',MX(0,h+rh*.42,d/2+.14,1));L.add(G.sphLo,'#ff6a5a',MX(0,h+rh*.42-.42,d/2+.2,.1));
    S.reset();L.reset();block(x,z,Math.max(w,d)/2+.8)}
  // lều kota gỗ sáu cạnh, mái nón, khói bếp
  function kota(x,z,r,col){const y=H(x,z);S.at(x,y,z,0);S.add(G.cyl6,col||'#5e4634',MX(0,.9,0,r,1.8,r));S.add(G.cone,'#3a2c22',MX(0,1.8+r*.6,0,r*1.15,r*1.3,r*1.15,0,Math.PI/6,0));S.add(G.cone,SNOW,MX(0,1.95+r*.6,0,r*1.08,r*1.12,r*1.08,0,Math.PI/6,0));S.b('#2a1e16',0,.85,r*.86,.9,1.7,.1);L.reset();L.b('#ffb35a',x,y+.8,z+r*.9,.7,1.4,.05);S.reset();block(x,z,r+.6)}
  // lều lavvu của người Sámi: cọc gỗ chụm đầu, bạt nhạt
  function lavvu(x,z,r){const y=H(x,z);S.add(G.cone12,'#d8cbb2',MX(x,y+r*1.1,z,r,r*2.2,r));for(let i=0;i<7;i++){const a=i/7*6.28;S.add(G.cyl,'#5a4532',MX(x+Math.cos(a)*.2,y+r*2.2+.5,z+Math.sin(a)*.2,.05,1.2,.05,Math.sin(a)*.3,0,-Math.cos(a)*.3))}S.b('#3a2c22',x,y+.7,z+r*.75,.8,1.3,.05);block(x,z,r+.4)}
  function lantern(x,z,hgt){const y=H(x,z),h=hgt||1.6;S.b('#2b2622',x,y+h/2,z,.1,h,.1);S.b('#2b2622',x,y+h+.05,z,.36,.06,.36);L.b('#ffcc7a',x,y+h-.18,z,.26,.32,.26);S.b(SNOW,x,y+h+.12,z,.4,.07,.4)}
  function reindeer(B,x,z,ry,s,graze){const y=H(x,z);B.at(x,y,z,ry,s);const br='#9a8268',dk='#5a4838',lt='#efe6d6';
    B.add(G.sph,br,MX(0,1.05,0,.38,.36,.78));B.add(G.sph,lt,MX(0,.95,.55,.3,.3,.2));B.add(G.sph,lt,MX(0,.98,-.72,.16,.18,.08));
    const hy=graze?.55:1.55,hz=graze?.95:.85;B.add(G.cyl,br,MX(0,(1.15+hy)/2+.05,(.55+hz)/2,.13,.7,.13,graze?1.1:-.5,0,0));B.add(G.sph,br,MX(0,hy,hz+.12,.15,.15,.26));B.add(G.sph,dk,MX(0,hy-.03,hz+.36,.07,.06,.06));
    for(const sx of [-1,1]){for(const sz of [-.45,.45])B.add(G.cyl,dk,MX(sx*.18,.45,sz,.05,.9,.05));
      const ax=sx*.1,ay=hy+.18,az=hz+.05;B.add(G.cyl,'#cbb89a',MX(ax+sx*.12,ay+.25,az-.05,.025,.6,.025,-.3,0,-sx*.4));B.add(G.cyl,'#cbb89a',MX(ax+sx*.32,ay+.55,az-.18,.02,.45,.02,-.7,0,-sx*.2));B.add(G.cyl,'#cbb89a',MX(ax+sx*.2,ay+.5,az+.1,.02,.3,.02,.5,0,-sx*.3))}
    B.reset()}
  function fence(cx,cz,r,n,gap){for(let i=0;i<n;i++){const a0=i/n*6.28,a1=(i+1)/n*6.28;if(gap&&Math.abs(Math.atan2(Math.sin(a0-gap),Math.cos(a0-gap)))<.25)continue;const x0=cx+Math.cos(a0)*r,z0=cz+Math.sin(a0)*r,x1=cx+Math.cos(a1)*r,z1=cz+Math.sin(a1)*r,mx=(x0+x1)/2,mz=(z0+z1)/2,len=Math.hypot(x1-x0,z1-z0),ang=Math.atan2(x1-x0,z1-z0),y=H(mx,mz);
    S.b('#5a4636',x0,H(x0,z0)+.55,z0,.12,1.1,.12);S.b(SNOW,x0,H(x0,z0)+1.12,z0,.16,.06,.16);for(const hy of [.4,.85])S.b('#6b5440',mx,y+hy,mz,.06,.08,len,ang)}}

  // dây đèn dưới mái hiên: chuỗi bóng vàng ấm như ảnh Xứ Yên
  function stringLights(B,x0,y0,z0,x1,y1,z1,n,sag){for(let i=0;i<=n;i++){const t=i/n;B.add(G.sphLo,i%4?'#ffd27a':'#ffe8b8',MX(x0+(x1-x0)*t,y0+(y1-y0)*t-Math.sin(t*Math.PI)*(sag||0),z0+(z1-z0)*t,.07))}}
  // ---------- Cổng Xứ Yên ----------
  {const GX=14,GZ=98,y=H(GX,GZ);S.at(GX,y,GZ,0);L.at(GX,y,GZ,0);for(const sx of [-1,1]){S.b('#5a3b2a',sx*3.4,2,0,.5,4,.5);S.b('#3a2c22',sx*3.4,.2,0,.8,.4,.8);L.b('#ffcc7a',sx*3.4,3.4,.3,.3,.4,.06)}
    S.b('#4a3426',0,4.3,0,8.4,.5,.7);S.add(G.prism,'#4a3426',MX(0,4.55,0,9.4,1.9,1.6));S.b(SNOW,-2.4,5.55,0,5.3,.3,1.9,0,0,.38);S.b(SNOW,2.4,5.55,0,5.3,.3,1.9,0,0,-.38);
    stringLights(L,-4.6,4.5,.95,0,6.35,.95,10,0);stringLights(L,0,6.35,.95,4.6,4.5,.95,10,0);L.add(G.sph,'#fff0c4',MX(0,5.2,.85,.22));S.reset();L.reset();block(GX-3.4,GZ,.6);block(GX+3.4,GZ,.6);
    const sg=signTex('XỨ YÊN','Arctic Wonderland'),m=new THREE.Mesh(new THREE.PlaneGeometry(3.6,1.27),new THREE.MeshBasicMaterial({map:sg,transparent:true}));m.position.set(GX,y+3.45,GZ+.4);sc.add(m);const m2=m.clone();m2.rotation.y=Math.PI;m2.position.z=GZ-.4;sc.add(m2);
    for(const [lx,lz] of [[12,108],[17,108],[13.5,90],[19,90],[15,84],[20,84]])lantern(lx,lz)}
  // ---------- 2 Làng Lapland quanh cây thông lớn ----------
  {const y=H(TREE.x,TREE.z),h=15;T.add(G.cyl,'#4a3a2e',MX(TREE.x,y+1,TREE.z,.4,2,.4));for(let i=0;i<6;i++){const t=i/6,r=4.8*(1-t*.82),th=3.8-i*.3,ty=y+1.4+t*h*.78;T.add(G.cone12,'#1f4034',MX(TREE.x,ty+th/2,TREE.z,r,th,r,0,i,0));T.add(G.cone12,SNOW,MX(TREE.x,ty+th*.66,TREE.z,r*.7,th*.3,r*.7,0,i+.4,0))}
    for(let i=0;i<220;i++){const t=i/220,a=t*Math.PI*2*10,hy=1.6+t*h*.86,r=4.7*(1-(hy-1.4)/(h*.78)*.82)+.05;if(r<.2)continue;L.add(G.sphLo,i%7===0?'#ff8a7a':i%5?'#ffd18a':'#ffe9c2',MX(TREE.x+Math.cos(a)*r,y+hy,TREE.z+Math.sin(a)*r,.1))}
    L.add(G.sph,'#fff0c4',MX(TREE.x,y+h+1.2,TREE.z,.45));block(TREE.x,TREE.z,5.2);warm(TREE.x,y+5,TREE.z+7,30,34);
    for(let i=0;i<8;i++){const a=i/8*6.28;S.b(i%2?'#8c2f2a':'#c8a96a',TREE.x+Math.cos(a)*3.6,y+.3,TREE.z+Math.sin(a)*3.6,.6,.6,.6,a)}}
  // Làng Lapland theo tấm 02: quảng trường tròn, nhà chính tháp đồng hồ (trên phải), chợ mái sọc (trái), café (dưới phải), cửa hàng (trên trái), chalet quanh làng
  const TC=(dx,dz)=>[TREE.x+dx,TREE.z+dz],face=(x,z)=>Math.atan2(TREE.x-x,TREE.z-z);
  {const [x,z]=TC(4,-14);cabin(x,z,face(x,z),{col:'#8a5f3e',w:10,d:9,h:4.2});const ry=face(x,z),y=H(x,z),tx=x+Math.cos(ry)*6.2,tz=z-Math.sin(ry)*6.2;/* nhà chính + tháp đồng hồ */
    S.at(tx,y,tz,ry);L.at(tx,y,tz,ry);S.b('#7a5236',0,4.2,0,2.6,8.4,2.6);S.b('#5c4030',0,8.5,0,2.9,.3,2.9);S.add(G.pyr4,'#3a2c22',MX(0,10.3,0,2.2,3.6,2.2));S.add(G.pyr4,SNOW,MX(0,10.1,0,2.05,3.1,2.05));
    S.add(G.cyl12,'#f1eee5',MX(0,6.6,1.32,.75,.06,.75,Math.PI/2,0,0));L.add(G.cyl12,'#ffe2a8',MX(0,6.6,1.36,.6,.03,.6,Math.PI/2,0,0));S.b('#2b2622',0,6.75,1.4,.06,.5,.03);S.b('#2b2622',.12,6.6,1.4,.3,.06,.03);
    L.add(G.sph,'#ffe9b0',MX(0,12.3,0,.2));stringLights(L,-1.45,8.4,1.46,1.45,8.4,1.46,8,0);S.reset();L.reset();block(tx,tz,1.8)}
  {const [x,z]=TC(-12,-12);cabin(x,z,face(x,z),{col:'#7a5236',w:8,d:7,h:3.6})}/* cửa hàng & dịch vụ */
  {const [x,z]=TC(14,3);cabin(x,z,face(x,z),{col:'#8a5f3e',w:8,d:7,h:3.4});const ry=face(x,z);for(const k of [-1.6,1.6]){const bx=x+Math.cos(ry)*k+Math.sin(ry)*6.6,bz=z-Math.sin(ry)*k+Math.cos(ry)*6.6,by=H(bx,bz);S.add(G.cyl12,'#6b4f3c',MX(bx,by+.45,bz,.5,.06,.5));S.b('#6b4f3c',bx,by+.22,bz,.1,.45,.1);S.b('#c5a36f',bx,by+1.6,bz,1.4,.06,1.4)}}/* café & ẩm thực, bàn ngoài trời */
  for(const [dx,dz,o] of [[-26,-14,{col:'#6e4a32',w:6,d:7}],[18,-14,{col:'#7a5236',w:6,d:7}],[-6,-28,{col:'#8a5f3e',w:6.5,d:7}],[14,-30,{col:'#7a5236',w:7,d:7.5}],[-22,-32,{col:'#6e4a32',w:6,d:6.5}]]){const [x,z]=TC(dx,dz);cabin(x,z,face(x,z),o)}/* chalet lưu trú */
  for(let i=0;i<3;i++){const [x,z]=TC(-14,-4+i*5.2),ry=Math.PI/2+.08*(i-1.5),y=H(x,z);S.at(x,y,z,ry);L.at(x,y,z,ry);/* chợ mùa đông: quầy mái bạt sọc đỏ trắng */
    S.b('#6b4f3c',0,1.2,-.9,3.2,2.4,.15);for(const sx of [-1,1])S.b('#6b4f3c',sx*1.55,1.2,0,.15,2.4,1.9);S.b('#c9b48f',0,.95,.7,3.2,.12,.7);S.b('#5a3b2a',0,.45,.7,3,.9,.6);
    for(let k=0;k<8;k++)S.b(k%2?'#f1eee5':'#b8322c',-1.4+k*.4,2.55,.2,.4,.08,2.6,0,-.32);S.b(SNOW,0,2.66,.05,3.3,.06,2.2,0,-.32);
    stringLights(L,-1.7,2.12,1.35,1.7,2.12,1.35,8,.1);L.b('#ffcc7a',0,1.6,-.8,1.6,.7,.04);S.reset();L.reset();block(x,z,2)}
  for(let i=0;i<10;i++){const a=i/10*Math.PI*2+.2,px=TREE.x+Math.cos(a)*10,pz=TREE.z+Math.sin(a)*10,py=H(px,pz);S.b('#2b2622',px,py+2,pz,.12,4,.12);/* cột đèn + dây đèn toả từ cây thông */
    stringLights(L,TREE.x+Math.cos(a)*1.2,H(TREE.x,TREE.z)+10,TREE.z+Math.sin(a)*1.2,px,py+3.9,pz,16,.6);if(i%2===0){const bx=TREE.x+Math.cos(a+.3)*7.2,bz=TREE.z+Math.sin(a+.3)*7.2,by=H(bx,bz),br=-a-.3+Math.PI/2;S.b('#6b4f3c',bx,by+.45,bz,1.8,.1,.5,br);S.b(SNOW,bx,by+.53,bz,1.7,.05,.45,br);S.b('#6b4f3c',bx,by+.8,bz,1.8,.5,.08,br)}}
  {const [x,z]=TC(7,11),y=H(x,z);S.b('#5a3b2a',x,y+1.7,z,.16,3.4,.16);/* cột biển chỉ đường */
    [['Quảng Trường',.4],['Chợ Mùa Đông',2.6],['Café',-.9],['Cửa Hàng',2.0],['Rừng Kính',-.3]].forEach(([n,a],i)=>{S.b('#7a5236',x+Math.cos(a)*.7,y+3-i*.45,z-Math.sin(a)*.7,1.5,.32,.08,a)});S.b(SNOW,x,y+3.45,z,.25,.1,.25)}
  warm(TREE.x+14,5,TREE.z-10,14,24);warm(TREE.x-14,4,TREE.z,12,22);warm(TREE.x+12,4,TREE.z+16,12,22);
  
  // ---------- 4 Khu Vui Chơi Giáng Sinh: ngựa gỗ, vòng quay, bếp lửa kota, người tuyết ----------
  const carousel=new THREE.Group();{const CB=new Batch(),CL=new Batch(),y=H(CAR.x,CAR.z);CB.add(G.cyl12,'#e9e0cf',MX(0,.25,0,4,.5,4));CB.add(G.cyl12,'#8c2f2a',MX(0,.52,0,4.05,.06,4.05));CB.add(G.cyl,'#c8a96a',MX(0,2,0,.16,3.6,.16));
    CB.add(G.cone12,'#8c2f2a',MX(0,4.1,0,4.4,1.4,4.4));for(let i=0;i<12;i+=2)CB.add(G.cone12,'#efe6d6',MX(0,4.1,0,4.42,1.41,4.42,0,i/12*6.28,0));CB.add(G.cone12,SNOW,MX(0,4.45,0,3.6,.9,3.6));CB.add(G.sph,'#c8a96a',MX(0,4.95,0,.22));
    for(let i=0;i<6;i++){const a=i/6*6.28;CB.add(G.cyl,'#c8a96a',MX(Math.cos(a)*3,2,Math.sin(a)*3,.04,3,.04))}
    for(let i=0;i<30;i++){const a=i/30*6.28;CL.add(G.sphLo,'#ffd896',MX(Math.cos(a)*4.3,3.42,Math.sin(a)*4.3,.08))}
    carousel.add(CB.mesh(LAM),CL.mesh(GLOW));const DB=new Batch();for(let i=0;i<6;i++){const a=i/6*6.28;DB.T=MX(Math.cos(a)*3,.55,Math.sin(a)*3,.75,.75,.75,0,-a,0);deerFig(DB,i%2?'#f0e6d6':'#b89a78')}carousel.add(DB.mesh(LAM));
    carousel.position.set(CAR.x,y,CAR.z);sc.add(carousel);block(CAR.x,CAR.z,4.4);warm(CAR.x,y+3,CAR.z+5,10,16)}
  function deerFig(B,col){const T0=B.T.clone(),add=(g,c,m)=>{B.T=T0;B.add(g,c,m)};add(G.sph,col,MX(0,.9,0,.3,.3,.62));add(G.cyl,col,MX(0,1.3,.45,.1,.6,.1,-.5,0,0));add(G.sph,col,MX(0,1.6,.62,.13,.13,.24));for(const sx of [-1,1]){for(const sz of [-.35,.35])add(G.cyl,col,MX(sx*.14,.45,sz,.05,.8,.05));add(G.cyl,'#c8a96a',MX(sx*.12,1.85,.55,.025,.45,.025,-.3,0,-sx*.4))}add(G.box,'#8c2f2a',MX(0,1.18,0,.5,.06,.4));B.T=new THREE.Matrix4()}
  // vòng quay: quay rất chậm (khoảng 80 giây một vòng), cabin luôn thẳng đứng
  const WR=6.2,WY=7.6,wheel=new THREE.Group(),gondolas=[];{const y=H(WHEEL.x,WHEEL.z);
    for(const sz of [-1.2,1.2])for(const sx of [-1,1])S.add(G.cyl,'#e9e0cf',MX(WHEEL.x+sx*2.1,y+WY/2,WHEEL.z+sz,.14,WY+.5,.14,0,0,-sx*.27));S.b('#e9e0cf',WHEEL.x,y+WY,WHEEL.z,.3,.3,2.8);S.b('#5a3b2a',WHEEL.x,y+.4,WHEEL.z+3.2,3,.8,1.6);
    const WB=new Batch(),WL=new Batch();for(const z of [-.9,.9]){WB.add(new THREE.TorusGeometry(WR,.08,5,40).toNonIndexed(),'#efe6d6',MX(0,0,z,1));WB.add(new THREE.TorusGeometry(1,.1,5,16).toNonIndexed(),'#c8a96a',MX(0,0,z,1))}
    for(let i=0;i<16;i++){const a=i/16*6.28;WB.add(G.box,'#efe6d6',MX(Math.cos(a)*WR/2,Math.sin(a)*WR/2,.9,WR,.06,.06,0,0,a));WB.add(G.box,'#efe6d6',MX(Math.cos(a)*WR/2,Math.sin(a)*WR/2,-.9,WR,.06,.06,0,0,a))}
    for(let i=0;i<48;i++){const a=i/48*6.28;WL.add(G.sphLo,i%3?'#ffd896':'#ff9c8a',MX(Math.cos(a)*WR,Math.sin(a)*WR,1,.09))}for(let i=0;i<16;i++){const a=i/16*6.28;for(let k=1;k<5;k++)WL.add(G.sphLo,'#ffe6b0',MX(Math.cos(a)*WR*k/5,Math.sin(a)*WR*k/5,1,.06))}
    wheel.add(WB.mesh(LAM),WL.mesh(GLOW));
    const GB=new Batch();GB.b('#8c2f2a',0,-.55,0,1.1,.7,1.2);GB.b('#efe6d6',0,-.15,0,1.1,.1,1.2);GB.b('#c8a96a',0,.15,0,.06,.6,.06);GB.add(G.cone,'#8c2f2a',MX(0,.12,0,.8,.4,.8));GB.add(G.cone,SNOW,MX(0,.18,0,.6,.25,.6));const gg=GB.geo();
    for(let i=0;i<8;i++){const g=new THREE.Mesh(gg,LAM);g.userData.a=i/8*6.28;wheel.add(g);gondolas.push(g)}
    wheel.position.set(WHEEL.x,y+WY,WHEEL.z);sc.add(wheel);block(WHEEL.x,WHEEL.z,3.2);warm(WHEEL.x,y+3,WHEEL.z+4,12,20)}
  // Khu Vui Chơi theo tấm 03: cổng vòm đỏ, sân khấu vòm gỗ bông tuyết, dốc trượt phao tuyết, phố quà tặng
  {const ax=-14,az=66,y=H(ax,az);S.at(ax,y,az,0);L.at(ax,y,az,0);for(const sx of [-1,1]){S.b('#b8322c',sx*2.8,1.9,0,.6,3.8,.6);S.b('#e9e0cf',sx*2.8,.15,0,.9,.3,.9)}
    for(let i=0;i<14;i++){const t=i/13,a=Math.PI*t,x=-Math.cos(a)*2.8,yy=3.8+Math.sin(a)*1.4;S.b('#b8322c',x,yy,0,.62,.62,.62,0,0,a-Math.PI/2);if(i%2===0)L.add(G.sphLo,'#ffd27a',MX(x,yy+.42,.32,.09))}
    S.b('#f1eee5',0,4.25,.35,3.4,.7,.06);S.b(SNOW,0,5.3,0,1.4,.18,.8);S.reset();L.reset();block(ax-2.8,az,.5);block(ax+2.8,az,.5)}
  {const sx0=-46,sz0=64,y=H(sx0,sz0);S.at(sx0,y,sz0,.6);L.at(sx0,y,sz0,.6);S.add(G.cyl12,'#6b4f3c',MX(0,.3,0,4.2,.6,4.2));S.add(G.cyl12,'#98745A',MX(0,.62,0,4.1,.04,4.1));/* sân khấu tròn */
    for(let i=0;i<=16;i++){const a=Math.PI*i/16,x=-Math.cos(a)*3.6,yy=.6+Math.sin(a)*3.6;S.b('#7a5236',x,yy,-2,.5,.5,.5,0,0,a);L.add(G.sphLo,'#ffd27a',MX(x*.92,yy*.95,-1.7,.08))}
    for(let k=0;k<3;k++){const a=k*Math.PI/3;L.b('#bfe6ff',0,2.6,-1.9,.12,2.4,.05,0,0,a)}S.reset();L.reset();block(sx0,sz0,4.4);warm(sx0,y+3,sz0+3,8,14)}
  {const p0=[-66,40],p1=[-48,42];for(let i=0;i<10;i++){const t=(i+.5)/10,x=p0[0]+(p1[0]-p0[0])*t,z=p0[1]+(p1[1]-p0[1])*t,y=H(x,z)+3.2*(1-t)+.2,ry=Math.atan2(-(p1[1]-p0[1]),p1[0]-p0[0]);/* dốc trượt phao tuyết */
      S.b('#f6f8fc',x,y,z,1.9,.25,3.2,ry,0,.16);for(const sd of [-1.6,1.6])L.b(sd<0?'#ff9ad8':'#9ad8ff',x+Math.sin(ry)*sd,y+.3,z+Math.cos(ry)*sd,1.9,.08,.1,ry,0,.16)}
    S.add(G.cyl12,'#b8322c',MX(-50,H(-50,42)+.35,42,.7,.25,.7));S.add(G.cyl12,'#3a6fb0',MX(-53,H(-53,42)+.9,42,.7,.25,.7))}
  for(let i=0;i<2;i++){const x=-48,z=54+i*5,y=H(x,z);S.at(x,y,z,Math.PI/2);L.at(x,y,z,Math.PI/2);S.b('#6b4f3c',0,1.2,-.9,3.2,2.4,.15);for(const sx of [-1,1])S.b('#6b4f3c',sx*1.55,1.2,0,.15,2.4,1.9);S.b('#c9b48f',0,.95,.7,3.2,.12,.7);
    for(let k=0;k<8;k++)S.b(k%2?'#f1eee5':'#b8322c',-1.4+k*.4,2.55,.2,.4,.08,2.6,0,-.32);stringLights(L,-1.7,2.12,1.35,1.7,2.12,1.35,8,.1);L.b('#ffcc7a',0,1.6,-.8,1.6,.7,.04);S.reset();L.reset();block(x,z,2)}/* phố quà tặng */
  for(const [gx,gz,c] of [[-10,64,'#b8322c'],[-11,65.6,'#c5a36f'],[-17.5,64.4,'#2f5b48']]){const y=H(gx,gz);S.b(c,gx,y+.35,gz,.7,.7,.7,.4);S.b('#f1eee5',gx,y+.35,gz,.72,.72,.12,.4)}
  // Hồ Trượt Băng theo tấm 04: nhà dịch vụ (trên trái), café kính ven sân (trên phải), góc sưởi (dưới phải), khung đèn trái tim (dưới trái)
  cabin(-34,66,0,{col:'#8a5f3e',w:8,d:6,h:3.6});
  {const x=-1,z=69,y=H(x,z);S.at(x,y,z,0);L.at(x,y,z,0);S.b('#3d3530',0,-.2,0,6.4,.6,4.4);L.b('#ffd79a',0,1.4,0,5.8,2.6,3.8);S.add(G.prism,'#7a5236',MX(0,2.8,0,6.6,1.4,4.6));S.b(SNOW,-1.6,3.5,0,3.6,.2,4.8,0,0,.4);S.b(SNOW,1.6,3.5,0,3.6,.2,4.8,0,0,-.4);
    for(let k=0;k<6;k++)S.b('#5a3b2a',-2.8+k*1.12,1.4,1.95,.12,2.7,.1);stringLights(L,-3.3,2.8,2.35,3.3,2.8,2.35,12,.1);S.reset();L.reset();block(x,z,3.4);warm(x,y+2,z+3,8,14)}
  {const x=6,z=95,y=H(x,z);S.add(G.cyl12,'#3a2c22',MX(x,y+.4,z,.5,.8,.5));L.add(G.cone12,'#ffae4a',MX(x,y+1.05,z,.35,.6,.35));for(const a of [0,2.1,4.2]){const bx=x+Math.cos(a)*2,bz=z+Math.sin(a)*2;S.b('#6b4f3c',bx,H(bx,bz)+.4,bz,1.6,.12,.5,-a+Math.PI/2)}warm(x,y+1.5,z,6,10)}
  {const x=-34,z=96,y=H(x,z);for(let i=0;i<40;i++){const t=i/40*Math.PI*2,hx=16*Math.pow(Math.sin(t),3)/16*1.4,hy=(13*Math.cos(t)-5*Math.cos(2*t)-2*Math.cos(3*t)-Math.cos(4*t))/16*1.4;L.add(G.sphLo,'#ffd27a',MX(x+hx,y+2.1+hy,z,.11))}S.b('#2b2622',x,y+.5,z,.1,1,.1)}
  kota(-50,92,3,'#5e4634');{const fx=-44,fz=82,y=H(fx,fz);const fire=new THREE.Group();const fl=new THREE.Mesh(new THREE.ConeGeometry(.35,1,7),new THREE.MeshBasicMaterial({color:'#ffae4a',fog:false}));fl.position.y=.6;fire.add(fl);
    for(let i=0;i<8;i++){const a=i/8*6.28;S.add(G.sph,'#5e5a56',MX(fx+Math.cos(a)*1,y+.1,fz+Math.sin(a)*1,.2,.15,.2))}fire.position.set(fx,y,fz);sc.add(fire);block(fx,fz,1.3);var fireFl=fl;var fireLight=warm(fx,y+1.2,fz,14,14);
    for(const a of [0.6,1.57,2.6,3.6,4.6,5.6])S.b('#7a5a3e',fx+Math.cos(a)*2.6,y+.35,fz+Math.sin(a)*2.6,1.4,.3,.4,-a+Math.PI/2)}
  for(const [sx,sz,k] of [[-12,64,1],[-40,74,.8]]){const y=H(sx,sz);S.add(G.sph,SNOW,MX(sx,y+.7*k,sz,.9*k));S.add(G.sph,SNOW,MX(sx,y+1.85*k,sz,.62*k));S.add(G.sph,SNOW,MX(sx,y+2.7*k,sz,.42*k));S.add(G.cone,'#e07a3a',MX(sx,y+2.7*k,sz+.5*k,.07*k,.35*k,.07*k,Math.PI/2,0,0));S.b('#8c2f2a',sx,y+2.3*k,sz,.9*k,.16*k,.9*k);S.add(G.cyl,'#2b2622',MX(sx,y+3.15*k,sz,.3*k,.4*k,.3*k));block(sx,sz,1)}
  {const n=44,pt=i=>{const a=i/n*Math.PI*2,k=RSH(a);return [RINK.x+Math.cos(a)*(RINK.rx*k+1),RINK.z+Math.sin(a)*(RINK.rz*k+1)]};/* sân trượt băng: hàng rào gỗ + đèn */
    for(let i=0;i<n;i++){if(i===0||i===n-1)continue;const [x0,z0]=pt(i),[x1,z1]=pt(i+1),mx=(x0+x1)/2,mz=(z0+z1)/2,ln=Math.hypot(x1-x0,z1-z0),ry=Math.atan2(-(z1-z0),x1-x0),y=H(mx,mz);
      S.b('#6b5440',mx,y+.75,mz,ln,.1,.1,ry);S.b('#6b5440',mx,y+.4,mz,ln,.08,.08,ry);S.b('#4a3a2e',x0,y+.5,z0,.14,1,.14);if(i%5===0)lantern(x0,z0,1.9)}}
  // ---------- 1 Rừng Kính: lều kính vòm dọc bờ bắc Hồ Băng ----------
  // lều kính vòm trắc địa (khung tam giác) trên sàn gỗ sát bờ hồ, bên trong đèn vàng ấm, bậc thềm, ghế gỗ phủ tuyết (theo ảnh mẫu 27/11)
  const glassMat=new THREE.MeshPhongMaterial({color:'#cfe2ff',specular:'#ffffff',shininess:120,transparent:true,opacity:.2,depthWrite:false,side:THREE.DoubleSide});
  const glowMat=new THREE.MeshBasicMaterial({color:'#ffb866',transparent:true,opacity:.22,depthWrite:false,side:THREE.BackSide,blending:THREE.AdditiveBlending,fog:false});
  // 3 lều ngắm cực quang theo bộ thiết kế Rừng Kính: vòm kính khung tối, vách sau gỗ sồi, sàn gỗ, nội thất ấm (Lều Rừng Thông · Lều Đồi Tuyết · Lều Bờ Hồ)
  const DR=4,OAK='#98745A',RIB='#2b2a2a',geo=new THREE.SphereGeometry(DR,28,12,0,Math.PI*2,0,Math.PI/2).toNonIndexed();
  const ribM=new THREE.TorusGeometry(DR+.03,.055,4,28,Math.PI).toNonIndexed(),ribR=[[.0,1],[.5,Math.cos(Math.PI/6)],[.866,.5]].map(([sy,cr])=>[sy*DR,new THREE.TorusGeometry(DR*cr+.03,.05,4,36).rotateX(Math.PI/2).toNonIndexed()]);
  const glassB=new Batch(),glowB=new Batch();
  IGLOOS.forEach(([x,z],idx)=>{const y=H(x,z)+.5,r=DR,ry=Math.atan2(LAKE.x-x,LAKE.z-z);S.at(x,y,z,ry);L.at(x,y,z,ry);
    S.add(G.cyl12,'#8d8a85',MX(0,-.5,0,r+2.25,.45,r+2.25));S.add(G.cyl12,'#4a3a2e',MX(0,-.35,0,r+2,.7,r+2));S.add(G.cyl12,'#f4f1ea',MX(2.1,.42,-1.5,.62,.4,.42));S.add(G.cyl12,'#cfe2f0',MX(2.1,.6,-1.5,.5,.04,.32));S.add(G.cyl12,OAK,MX(0,.02,0,r+1.9,.08,r+1.9));S.add(G.cyl12,SNOW,MX(0,.07,0,r+2.05,.03,r+2.05).multiply(MX(0,0,0,1)));/* sàn gỗ sồi */
    for(let k=0;k<5;k++)S.add(ribM,RIB,MX(0,.06,0,1,1,1,0,k*Math.PI/5,0));for(const [ry2,rg] of ribR)S.add(rg,RIB,MX(0,.06+ry2,0,1));/* khung kính tối */
    S.add(G.sph,SNOW,MX(0,r-.05,0,1.7,.32,1.7));/* mái chống tuyết */
    S.b(OAK,0,1.7,-r+.7,4.6,3.4,2.4);S.b(SNOW,0,3.5,-r+.7,4.9,.25,2.7);S.b('#7d5f49',0,1.7,-r+1.92,4.4,3.2,.06);S.b('#c5a36f',1.6,1.2,-r+1.95,.06,2.2,.06);/* vách sau gỗ sồi */
    S.b('#6b4f3c',0,.4,-.9,2.6,.35,2.2);S.b(IVORY,0,.68,-.9,2.4,.25,2.0);S.b(IVORY,-.6,.88,-1.8,.8,.22,.4);S.b(IVORY,.6,.88,-1.8,.8,.22,.4);S.b('#c5a36f',0,.83,-.2,2.45,.06,.7);S.b('#6b4f3c',0,1.1,-2.05,2.7,1.3,.15);/* giường */
    for(const sx of [-1.75,1.75]){S.b('#d5c7ad',sx,.45,1.2,.9,.5,.85);S.b('#d5c7ad',sx,.85,.85,.9,.6,.15);L.add(G.sph,'#ffcf86',MX(sx*1.05,1.35,-1.9,.16))}
    S.add(G.cyl12,OAK,MX(0,.45,1.6,.45,.5,.45));L.add(G.sph,'#ffd28c',MX(0,.85,1.6,.12));S.add(G.cone,'#2f5b48',MX(-2.6,.9,-1.6,.35,1.2,.35));
    L.add(G.sph,'#ffe2b0',MX(0,2.9,-.4,.2));
    for(let i=0;i<4;i++)S.b('#5b4636',0,-.12-i*.16,r+2.1+i*.42,1.8,.16,.45);
    for(const sx of [-1.3,1.3]){S.b('#2b2622',sx,.55,r+1.75,.12,1.1,.12);L.b('#ffcc7a',sx,1.15,r+1.75,.22,.26,.22)}
    S.reset();L.reset();
    glassB.T=MX(x,y+.06,z,1);glassB.add(geo,'#ffffff',new THREE.Matrix4());glowB.T=MX(x,y+.06,z,1);glowB.add(geo,'#ffffff',MX(0,0,0,.96));
    if(idx===1){const [lx,lz]=toLake([x,z],1);const dx=lx-x,dz=lz-z;for(let k=0;k<12;k++){const sx=x+dx*(r+2.6+k*.85),sz=z+dz*(r+2.6+k*.85),sy=H(sx,sz);S.b('#9a9690',sx,sy+.12,sz,2.2,.3,1,Math.atan2(-dz,dx)+Math.PI/2);if(k%3===1){lantern(sx+dz*1.6,sz-dx*1.6,1.1);lantern(sx-dz*1.6,sz+dx*1.6,1.1)}}}/* bậc đá xuống đồi */
    for(let k=0;k<4;k++){const a=k*1.6+x,mx=x+Math.cos(a)*(r+3.2),mz=z+Math.sin(a)*(r+3.2);S.add(G.sph,SNOW,MX(mx,H(mx,mz)+.1,mz,1+k*.2,.5,.9))}
    {const la=Math.atan2(LAKE.z-z,LAKE.x-x),N=idx===0?11:idx===1?6:4;for(let k=0;k<N;k++){const a=la+Math.PI*.42+k*(Math.PI*1.16/(N-1)),rr=r+4.5+((k*7)%4)*1.6,px=x+Math.cos(a)*rr,pz=z+Math.sin(a)*rr;pine(T,px,pz,6+((k*5)%4)*1.6)}}/* thông ôm sau lều */
    block(x,z,r+1.5)});
  for(let k=0;k<3;k++){const [ax,az]=IGLOOS[k],[bx,bz]=IGLOOS[(k+1)%3],mx=(ax+bx)/2,mz=(az+bz)/2,[ox,oz]=toLake([mx,mz],-3);/* cụm thông dày giữa các lều: riêng tư, không nhìn thẳng sang nhau */
    for(let j=0;j<7;j++){const a=j*2.4+k,rr=1+j*.7,px=ox+Math.cos(a)*rr,pz=oz+Math.sin(a)*rr;if(lakeE(px,pz)>1.12&&IGLOOS.every(([ix,iz])=>Math.hypot(px-ix,pz-iz)>DR+3.2))pine(T,px,pz,5+((j*3+k)%4)*1.5)}}
  {const gm=glassB.mesh(glassMat);gm.renderOrder=2;sc.add(gm);const gl=glowB.mesh(glowMat);gl.renderOrder=1;sc.add(gl)}
  for(const [x,z] of IGLOOS)warm(x,H(x,z)+2.5,z,10,30);
  // ---------- tuyến đường phát sáng: husky vàng cam, xe trượt xanh lam, trượt tuyết hồng ----------
  const glow=(pts,col,w,yf,closed)=>{const P=closed?[...pts,pts[0]]:pts;for(let i=0;i+1<P.length;i++){const [x0,z0]=P[i],[x1,z1]=P[i+1],ln=Math.hypot(x1-x0,z1-z0),n=Math.max(1,Math.ceil(ln/2)),ry=Math.atan2(-(z1-z0),x1-x0);
    for(let k=0;k<n;k++){const t=(k+.5)/n,x=x0+(x1-x0)*t,z=z0+(z1-z0)*t;L.b(col,x,yf(x,z),z,ln/n+.05,.05,w,ry)}}};
  for(const t of HTRAILS){glow(t,'#ffb24e',.28,(x,z)=>H(x,z)+.06);let acc=0;for(let i=0;i+1<t.length;i++){const ln=Math.hypot(t[i+1][0]-t[i][0],t[i+1][1]-t[i][1]),nx=-(t[i+1][1]-t[i][1])/ln,nz=(t[i+1][0]-t[i][0])/ln;
    for(let d=0;d<ln;d+=2){acc+=2;if(acc%16===0){const x=t[i][0]+(t[i+1][0]-t[i][0])*d/ln,z=t[i][1]+(t[i+1][1]-t[i][1])*d/ln,sd=(acc/16)%2?3:-3;if(lakeE(x+nx*sd,z+nz*sd)>1.05)lantern(x+nx*sd,z+nz*sd,1.4)}}}}
  glow(SLOOP,'#7fd8ff',.32,()=>ICE_Y+.04,true);
  for(const r of SKIRUNS)for(const off of [-2.2,2.2])glow(r.map(([x,z],i,a)=>{const j=Math.min(i+1,a.length-1),k=Math.max(i-1,0),dx=a[j][0]-a[k][0],dz=a[j][1]-a[k][1],l=Math.hypot(dx,dz);return [x-dz/l*off,z+dx/l*off]}),'#ff7ad8',.26,(x,z)=>H(x,z)+.08);
  // ---------- 7 đảo nhỏ trồng thông giữa hồ, cầu gỗ cong nối bờ ----------
  for(let k=0;k<7;k++){const a=k*2.3,r=k?ISLE.r*(.25+.45*((k*37)%10)/10):0;pine(T,ISLE.x+Math.cos(a)*r,ISLE.z+Math.sin(a)*r,k?4+((k*13)%5):7.5)}
  for(let k=0;k<3;k++){const a=k*2.1+.5;lantern(ISLE.x+Math.cos(a)*ISLE.r*.95,ISLE.z+Math.sin(a)*ISLE.r*.95,1.3)}
  {let dx=-.95,dz=-.3;const l=Math.hypot(dx,dz);dx/=l;dz/=l;const ax=ISLE.x+dx*ISLE.r*1.05,az=ISLE.z+dz*ISLE.r*1.05;let len=2;while(len<60&&lakeE(ax+dx*len,az+dz*len)<1.08)len+=.5;
    const ry=Math.atan2(-dz,dx),n=Math.ceil(len/1.05);for(let i=0;i<n;i++){const t=(i+.5)/n,x=ax+dx*len*t,z=az+dz*len*t,y=ICE_Y+.45+Math.sin(Math.PI*t)*1.1;S.b('#6b5440',x,y,z,1.0,.14,2.4,ry);S.b(SNOW,x,y+.09,z,.75,.03,2.2,ry);
      for(const sd of [-1.15,1.15]){S.b('#4a3a2e',x+Math.sin(ry)*sd,y+.5,z+Math.cos(ry)*sd,1.05,.08,.08,ry);if(i%3===0)S.b('#4a3a2e',x+Math.sin(ry)*sd,y+.25,z+Math.cos(ry)*sd,.1,.6,.1)}
      if(i%6===3)L.add(G.sph,'#ffcf86',MX(x+Math.sin(ry)*1.15,y+.75,z+Math.cos(ry)*1.15,.14))}}
  // ---------- 9 Đỉnh Tuyết Yên: nhà nghỉ trên đỉnh, cáp treo, cờ, dốc trượt ----------
  cabin(SKI.x,SKI.z-8,0,{col:'#8a5f3e',w:11,d:7,h:3.8});{const y=H(SKI.x,SKI.z-8);L.at(SKI.x,y,SKI.z-8,0);stringLights(L,-5.5,3.6,3.7,5.5,3.6,3.7,18,.15);L.reset()}
  for(const [fx,fz,c] of [[SKI.x-8,SKI.z-2,'#c5a36f'],[SKI.x+8,SKI.z-2,'#ff7ad8'],[SKI.x,SKI.z+1,'#7fd8ff']]){const y=H(fx,fz);S.b('#e9e2d6',fx,y+2.2,fz,.12,4.4,.12);S.b(c,fx+.6,y+4,fz,1.1,.7,.05)}
  {const [[ax,az],[bx,bz]]=LIFT,ln=Math.hypot(bx-ax,bz-az),ry=Math.atan2(-(bz-az),bx-ax),n=6;const top=[];for(let i=0;i<=n;i++){const t=i/n,x=ax+(bx-ax)*t,z=az+(bz-az)*t,y=H(x,z);S.b('#5a5f68',x,y+3,z,.25,6,.25);S.b('#5a5f68',x,y+6,z,.2,.2,2.4,ry);top.push([x,y+5.9,z])}
    for(let i=0;i<n;i++){const [x0,y0,z0]=top[i],[x1,y1,z1]=top[i+1],mx=(x0+x1)/2,my=(y0+y1)/2,mz=(z0+z1)/2,l=Math.hypot(x1-x0,y1-y0,z1-z0),pitch=Math.atan2(y1-y0,Math.hypot(x1-x0,z1-z0));
      for(const sd of [-1,1]){S.add(G.box,'#2b2622',MX(mx+Math.sin(ry)*sd,my,mz+Math.cos(ry)*sd,l,.05,.05,0,ry,pitch));S.b('#8c2f2a',mx+Math.sin(ry)*sd,my-1.1,mz+Math.cos(ry)*sd,.9,.12,.6,ry);S.b('#2b2622',mx+Math.sin(ry)*sd,my-.55,mz+Math.cos(ry)*sd,.05,1.1,.05)}}}
  {const walk=(pts)=>{for(let k=0;k+1<pts.length;k++){const [x0,z0]=pts[k],[x1,z1]=pts[k+1],ln=Math.hypot(x1-x0,z1-z0),ry=Math.atan2(-(z1-z0),x1-x0),n=Math.max(1,Math.ceil(ln/1.1));
      for(let i=0;i<n;i++){const t=(i+.5)/n,x=x0+(x1-x0)*t,z=z0+(z1-z0)*t,y=Math.max(H(x,z),ICE_Y)+.25;S.b('#98745A',x,y,z,ln/n*.9,.12,2,ry);S.b(SNOW,x,y+.08,z,ln/n*.6,.03,1.8,ry)}}};/* lối sàn gỗ ven hồ nối 3 lều */
    const shore=[];for(let a=-1.3;a<=.12;a+=.06)shore.push(lakeShore(a,2.6));walk(shore);shore.forEach((q,i)=>{if(i%5===2)lantern(...toLake(q,-1.6),1.3)});
    for(const q of IGLOOS){const f=toLake(q,DR+2.4);let best=shore[0],bd=1e9;for(const w of shore){const dd=Math.hypot(w[0]-f[0],w[1]-f[1]);if(dd<bd){bd=dd;best=w}}if(bd>1.5)walk([f,best])}}
  // ---------- 6 Hồ Băng & Xe Trượt: cầu gỗ bờ tây, xe trượt tuyết đỏ chạy chậm, đèn băng ----------
  {const [[ax,az],[bx,bz]]=PIER,ln=Math.hypot(bx-ax,bz-az),ry=Math.atan2(-(bz-az),bx-ax),n=Math.ceil(ln/1.15);for(let i=0;i<n;i++){const t=(i+.5)/n,x=ax+(bx-ax)*t,z=az+(bz-az)*t;S.b('#5b4636',x,.05,z,1.05,.14,2.2,ry);S.b(SNOW,x,.13,z,.8,.04,2.1,ry);if(i%3===0)for(const sd of [-1.2,1.2])S.b('#3a2c22',x-Math.sin(ry)*sd*0+Math.sin(ry)*sd,.3,z+Math.cos(ry)*sd,.16,1,.16)}}
  for(const [x,z] of [.3,1.2,2.2,3.4,4.4,5.5].map(a=>lakeShore(a,0,.45))){S.b('#cfe6f2',x,ICE_Y+.35,z,.7,.7,.7);L.b('#bfe8ff',x,ICE_Y+.35,z,.4,.5,.4)}
  function kickSled(B){B.b('#8c2f2a',0,.5,.2,.55,.08,.5);B.b('#8c2f2a',0,.75,-.05,.55,.5,.06);for(const sx of [-.22,.22]){B.b('#2b2622',sx,.05,-.2,.04,.04,2.2);B.b('#2b2622',sx,.55,-.35,.04,1.1,.04,0,.2);B.b('#2b2622',sx,1.05,-.4,.04,.04,.3)}B.b('#2b2622',0,1.08,-.48,.5,.04,.04)}
  for(const [x,z] of [[PIER[0][0]+2,PIER[0][1]-5],[PIER[0][0]+2,PIER[0][1]+5]]){S.at(x,0,z,1.3);kickSled(S);S.reset()}
  function snowmobile(B){B.b('#2b2622',0,.25,-.5,.9,.4,1.8);B.b('#b8322c',0,.55,.2,1,.45,1.6);B.add(G.sph,'#b8322c',MX(0,.6,1,.5,.35,.6));B.b('#1d1a18',0,.82,-.35,.6,.18,1.1);B.b('#9fc4dd',0,1.0,.55,.7,.4,.05,0,-.5);for(const sx of [-.45,.45])B.b('#2b2622',sx,.05,1.2,.12,.06,1.2);B.b('#c8a96a',0,.95,.25,.8,.05,.05);L.reset()}
  const sledG=new THREE.Group();{const B=new Batch();snowmobile(B);sledG.add(B.mesh(LAM));sc.add(sledG)}
  // ---------- 3 Rừng Thông & Husky ----------
  const huskyG=new THREE.Group();const dogs=[];{const DG=(()=>{const B=new Batch();const g='#8a8f98',w='#f1f1ee';B.add(G.sph,g,MX(0,.5,0,.2,.2,.42));B.add(G.sph,w,MX(0,.42,.05,.16,.15,.35));B.add(G.sph,g,MX(0,.72,.42,.15,.14,.17));B.add(G.sph,w,MX(0,.66,.56,.08,.07,.1));for(const sx of [-1,1]){B.add(G.cone,g,MX(sx*.07,.9,.4,.04,.12,.04));for(const sz of [-.25,.25])B.add(G.cyl,w,MX(sx*.09,.2,sz,.04,.4,.04))}B.add(G.cyl,g,MX(0,.62,-.42,.05,.3,.05,-.9,0,0));return B.geo()})();
    for(let i=0;i<6;i++){const m=new THREE.Mesh(DG,LAM);m.position.set(i%2?.4:-.4,0,2.2+Math.floor(i/2)*1.2);huskyG.add(m);dogs.push(m)}
    const B=new Batch();B.b('#5b4636',0,.35,-.2,.9,.1,1.8);B.b('#8c2f2a',0,.6,-.1,.86,.5,1.2);B.b('#e9e2d6',0,.66,0,.7,.1,.9);for(const sx of [-.45,.45]){B.b('#2b2622',sx,.04,-.3,.05,.05,2.4);B.b('#2b2622',sx,.7,-1.05,.05,1.1,.05)}B.b('#2b2622',0,1.25,-1.05,.95,.05,.05);B.b('#4a3a2e',0,.45,1.6,.03,.03,3.6);
    huskyG.add(B.mesh(LAM));sc.add(huskyG)}
  // nhà gỗ mở (chuồng, chòi nghỉ, xưởng): cột, vách sau, mái dốc phủ tuyết, dây đèn
  function openShed(x,z,ry,w,d,h,o){o=o||{};const y=H(x,z),col=o.col||'#98745a';S.at(x,y,z,ry);L.at(x,y,z,ry);
    S.b('#7a756e',0,.08,0,w+.4,.16,d+.4);S.b(col,0,h/2,-d/2+.15,w,h,.3);for(const sx of [-1,1])S.b(col,sx*(w/2-.15),h/2,0,.3,h,d);
    for(let i=0;i<=Math.round(w/2.4);i++){const px=-w/2+.2+i*(w-.4)/Math.round(w/2.4);S.b('#6b4f3a',px,h/2,d/2-.2,.26,h,.26);if(o.stalls&&i>0&&i<Math.round(w/2.4))S.b(col,px,.6,0,.12,1.2,d-.6)}
    const a=.6,rh=Math.tan(a)*(d/2+.5),Lr=(d/2+.6)/Math.cos(a);for(const sd of [-1,1]){S.b('#5c4433',0,h+rh/2,sd*(d/4+.15),w+.8,.2,Lr,sd*a,0,0);S.b(SNOW,0,h+rh/2+.22,sd*(d/4+.15),w+.9,.3,Lr+.05,sd*a,0,0)}
    if(o.chimney){S.b('#9a958e',w/2-1,h+rh*.6,-d*.2,.8,2.4,.8);S.b(SNOW,w/2-1,h+rh*.6+1.25,-d*.2,.95,.2,.95)}
    stringLights(L,-w/2-.4,h,d/2+.2,w/2+.4,h,d/2+.2,Math.round(w*1.6),.15);if(o.wreath){S.add(WREATH,'#2f5b48',MX(0,h+rh*.45,d/2+.35,1));L.add(G.sphLo,'#ff6a5a',MX(0,h+rh*.45-.42,d/2+.4,.1))}
    S.reset();L.reset();block(x,z,Math.max(w,d)/2+.6)}
  // nhà kính mái gỗ (café ấm): khung gỗ, kính sáng vàng, mái tuyết
  function glassHouse(x,z,ry,w,d,h){const y=H(x,z);S.at(x,y,z,ry);L.at(x,y,z,ry);S.b('#8a8580',0,.12,0,w+.6,.24,d+.6);
    L.b('#d9a868',0,h/2+.2,0,w-.2,h-.2,d-.2);S.b('#6b4f3a',0,h*.55,0,w+.05,.12,d+.05);for(let i=0;i<=4;i++){const t=-w/2+i*w/4;for(const sz of [-1,1])S.b('#6b4f3a',t,h/2+.2,sz*d/2,.16,h,.16)}for(let i=0;i<=3;i++){const t=-d/2+i*d/3;for(const sx of [-1,1])S.b('#6b4f3a',sx*w/2,h/2+.2,t,.16,h,.16)}
    for(const sz of [-1,1])S.b('#6b4f3a',0,h+.2,sz*d/2,w+.2,.2,.2);const a=.5,rh=Math.tan(a)*(d/2+.5),Lr=(d/2+.7)/Math.cos(a);
    for(const sd of [-1,1]){S.b('#5c4433',0,h+.2+rh/2,sd*(d/4+.2),w+1,.22,Lr,sd*a,0,0);S.b(SNOW,0,h+.42+rh/2,sd*(d/4+.2),w+1.1,.3,Lr+.05,sd*a,0,0)}
    stringLights(L,-w/2-.5,h+.25,d/2+.4,w/2+.5,h+.25,d/2+.4,Math.round(w*1.6),.12);S.reset();L.reset();block(x,z,Math.max(w,d)/2+.8)}
  // hàng rào gỗ thấp hai bên đường xe kéo, đèn lồng Bắc Âu cách quãng: tách đường xe với lối đi bộ
  function trailRails(pts,off,every){let acc=0;for(let i=0;i+1<pts.length;i++){const [ax,az]=pts[i],[bx,bz]=pts[i+1],len=Math.hypot(bx-ax,bz-az),ux=(bx-ax)/len,uz=(bz-az)/len,ang=Math.atan2(ux,uz),n=Math.max(1,Math.round(len/3));
    for(let k=0;k<n;k++){const t0=k/n,t1=(k+1)/n;for(const sd of [-1,1]){const x0=ax+(bx-ax)*t0-uz*off*sd,z0=az+(bz-az)*t0+ux*off*sd,x1=ax+(bx-ax)*t1-uz*off*sd,z1=az+(bz-az)*t1+ux*off*sd,mx=(x0+x1)/2,mz=(z0+z1)/2;
      S.b('#6b5440',x0,H(x0,z0)+.35,z0,.1,.7,.1);S.b('#7a6048',mx,H(mx,mz)+.55,mz,.06,.07,len/n,ang);S.b(SNOW,mx,H(mx,mz)+.62,mz,.1,.04,len/n,ang)}
      acc+=len/n;if(acc>every){acc=0;const sd=k%2?1:-1;lantern(ax+(bx-ax)*t0-uz*(off+.5)*sd,az+(bz-az)*t0+ux*(off+.5)*sd,1.4)}}}}
  // ---------- 05 Rừng Thông & Husky: trạm, chuồng, chòi nghỉ, đài ngắm cảnh, khu trải nghiệm ----------
  {// 1 Trạm Husky: chalet gỗ lớn mặt kính, biển gỗ dấu chân
    cabin(0,-17,Math.PI/2,{w:8,d:11,h:3.6});const y=H(6.5,-11);S.at(6.5,y,-11,.4);S.b('#5c4433',-.9,.8,0,.16,1.6,.16);S.b('#5c4433',.9,.8,0,.16,1.6,.16);S.b('#98745a',0,1.75,0,2.4,1,.16);S.reset();
    L.at(6.5,y,-11,.4);L.add(G.sphLo,'#f1eee5',MX(0,1.7,.1,.22,.2,.04));for(const [px,py] of [[-.3,2.05],[-.1,2.15],[.12,2.15],[.32,2.05]])L.add(G.sphLo,'#f1eee5',MX(px,py,.1,.08,.08,.03));L.reset();
    // 2 Khu chuồng & chăm sóc: dãy chuồng gỗ mở, husky nằm nghỉ
    openShed(-8,-44,Math.PI/2,12,4,2.2,{stalls:true});fence(-8,-44,9,30,Math.PI/2*0);
    // 3 Điểm nghỉ chân: chòi gỗ mở, lò sưởi đá, ghế quanh lửa
    openShed(29,-33,-Math.PI/2,6,5,2.6,{chimney:true});{const fx=29,fz=-33,fy=H(fx,fz);S.b('#9a958e',fx+1.6,fy+.5,fz,1,1,1.6);L.b('#ffae4a',fx+1.05,fy+.5,fz,.05,.5,.8);for(const dz of [-1.4,1.4])S.b('#7a5a3e',fx-.6,fy+.25,fz+dz,2.2,.3,.5)}
    // 4 Đài ngắm cảnh: tháp gỗ, sàn quan sát, mái tuyết, đèn
    {const tx=20,tz=-70,ty=H(tx,tz),th=11;for(const sx of [-1,1])for(const sz of [-1,1])S.b('#6b4f3a',tx+sx*1.6,ty+th/2,tz+sz*1.6,.3,th,.3);for(const hy of [2.4,5,7.6])for(const sd of [-1,1]){S.b('#7a6048',tx,ty+hy,tz+sd*1.6,3.4,.14,.14,0,0,sd*.6);S.b('#7a6048',tx+sd*1.6,ty+hy,tz,.14,.14,3.4,sd*.6,0,0)}
      S.b('#98745a',tx,ty+th,tz,4.6,.3,4.6);for(const sd of [-1,1]){S.b('#7a6048',tx,ty+th+.6,tz+sd*2.2,4.6,.1,.1);S.b('#7a6048',tx+sd*2.2,ty+th+.6,tz,.1,.1,4.6)}for(const sx of [-1,1])for(const sz of [-1,1])S.b('#6b4f3a',tx+sx*2.1,ty+th+1.3,tz+sz*2.1,.18,2.6,.18);
      S.add(G.cone,'#5c4433',MX(tx,ty+th+3.2,tz,3.6,1.8,3.6,0,Math.PI/4,0));S.add(G.cone,SNOW,MX(tx,ty+th+3.35,tz,3.4,1.6,3.4,0,Math.PI/4,0));L.at(tx,ty,tz,0);stringLights(L,-2.2,th+2.4,2.2,2.2,th+2.4,2.2,8,.1);stringLights(L,-2.2,th+2.4,-2.2,2.2,th+2.4,-2.2,8,.1);L.reset();
      for(let i=0;i<16;i++)S.b('#7a6048',tx+2.4,ty+th*(i+.5)/16,tz-1.6+i*.2,1,.1,.4);block(tx,tz,8)}
    // 5 Khu trải nghiệm & tương tác: sân rào tròn, husky và ghế cho khách
    fence(42,-30,7,26,Math.PI);{const DG2=(x,z,r)=>{const y=H(x,z);S.at(x,y,z,r);const g='#8a8f98',w='#f1f1ee';S.add(G.sph,g,MX(0,.5,0,.2,.2,.42));S.add(G.sph,w,MX(0,.42,.05,.16,.15,.35));S.add(G.sph,g,MX(0,.72,.42,.15,.14,.17));S.add(G.sph,w,MX(0,.66,.56,.08,.07,.1));for(const sx of [-1,1]){S.add(G.cone,g,MX(sx*.07,.9,.4,.04,.12,.04));for(const sz of [-.25,.25])S.add(G.cyl,w,MX(sx*.09,.2,sz,.04,.4,.04))}S.reset()};
      for(const [x,z,r] of [[40,-28,.6],[44,-32,2.4],[42,-26,4],[45,-28,1.4],[39,-32,5.2],[-10,-43,1.6],[-6,-45,4.6],[-12,-46,.3]])DG2(x,z,r);for(const dz of [-2,2])S.b('#7a5a3e',34,H(34,-30)+.3,-30+dz,.5,.3,1.8);block(42,-30,7.5);block(-8,-44,9.5)}
    trailRails([[26,-4],[14,-12],[22,-22],[10,-32],[18,-42],[10,-50],[40,-58],[66,-56]],2.6,9);block(29,-33,4)}
  // ---------- 06 Trang Trại Tuần Lộc: nhà đón tiếp, chuồng, đồng cỏ tuyết, xưởng xe kéo, café ấm ----------
  fence(FARM.x,FARM.z,FARM.r,44,Math.PI);{const deer=[[138,84,.4,true],[146,94,2.2,false],[134,92,4,true],[150,84,1.2,true],[142,88,5.5,false],[136,80,3,true],[148,80,.2,false],[142,97,3.1,true]];for(const d of deer)reindeer(S,d[0],d[1],d[2],1,d[3]);
    // 1 Nhà đón tiếp & trải nghiệm: chalet gỗ, ống khói đá, vòng nguyệt quế, biển gạc tuần lộc
    cabin(164,74,-Math.PI/2,{w:9,d:11,h:3.6});{const x=157,z=66,y=H(x,z);S.at(x,y,z,-Math.PI/2);for(const sx of [-1,1])S.b('#5c4433',sx*1.1,.9,0,.16,1.8,.16);S.b('#98745a',0,2,0,2.8,1.1,.16);
      for(const sx of [-1,1]){S.add(G.cyl,'#e8dcc4',MX(sx*.35,2.85,0,.04,.7,.04,0,0,-sx*.5));S.add(G.cyl,'#e8dcc4',MX(sx*.55,3.05,0,.03,.4,.03,0,0,sx*.3))}S.reset()}
    // 2 Khu chuồng & chăm sóc: dãy chuồng gỗ mở có mái, tuần lộc nghỉ
    openShed(166,104,-Math.PI/2,13,4.4,2.5,{stalls:true,wreath:true});for(const [z,r] of [[100,-1.57],[104,-1.4],[108,-1.7]])reindeer(S,165.6,z,r,.9,false);
    // 4 Xưởng xe kéo tuần lộc: nhà mái gỗ mở, xe trượt đỏ
    openShed(132,110,-Math.PI/2,9,5,2.8,{chimney:true});for(const sx of [-2.2,2.2]){const x=131.4,z=110+sx,y=H(x,z);S.at(x,y,z,.15);S.b('#a5302a',0,.55,0,1.4,.6,2.4);S.b('#a5302a',0,1,-1,1.4,.9,.3);S.b('#e9e2d6',0,.9,.2,1.1,.12,1.2);S.b('#c5a36f',0,.12,0,1.5,.08,2.8);for(const px of [-.7,.7])S.add(G.sph,'#c5a36f',MX(px,.3,1.3,.1,.3,.3));S.reset()}
    // 5 Khu nghỉ chân & café ấm: nhà kính mái gỗ, bàn ngoài trời
    glassHouse(128,72,0,8,5,2.8);for(const dx of [-2.5,2.5]){const x=128+dx,z=78,y=H(x,z);S.add(G.cyl,'#6b4f3a',MX(x,y+.4,z,.5,.08,.5));S.b('#6b4f3a',x,y+.2,z,.1,.4,.1);for(const sx of [-.8,.8])S.b('#7a5a3e',x+sx,y+.22,z,.4,.44,.4)}
    for(const [x,z] of [[124,82],[124,94],[150,68],[150,108],[136,104],[136,72]])lantern(x,z);block(FARM.x,FARM.z,FARM.r+1)}
  // ---------- Chùa Tuyết Yên trên núi, góc trên bên trái bản đồ (tây bắc) ----------
  const TP={x:HILL.x,z:HILL.z},TRY=Math.atan2(STAIR.x-HILL.x,STAIR.z-HILL.z),tw=(lx,lz)=>[TP.x+Math.cos(TRY)*lx+Math.sin(TRY)*lz,TP.z-Math.sin(TRY)*lx+Math.cos(TRY)*lz];
  {const y=H(TP.x,TP.z);S.at(TP.x,y,TP.z,TRY);L.at(TP.x,y,TP.z,TRY);
    // Chánh điện kiểu Bắc Âu (tấm 08): nhà gỗ sồi một tầng, hai lớp mái dốc nhẹ phủ tuyết, lam gỗ dọc, cửa kính lớn sáng ấm, hoa sen phát sáng trên đầu hồi
    const oak='#d2a676',dk='#a07a56',st='#9a958e',z0=-1.5,w=11,d=8,h=3.4,y0=.7;
    S.b(st,0,.3,z0+.8,14,.8,12.5);for(let i=0;i<4;i++)S.b(i%2?'#a8a39b':st,0,.1+i*.17,z0+d/2+3.2-i*.45,7,.2,1);/* nền đá, bậc thềm rộng */
    S.b(oak,0,y0+h/2,z0,w,h,d);for(let x=-w/2+.3;x<=w/2-.2;x+=.45)if(Math.abs(x)>2.5){S.b(dk,x,y0+h/2,z0+d/2+.03,.12,h,.06);S.b(dk,x,y0+h/2,z0-d/2-.03,.12,h,.06)}
    for(let zz=-d/2+.3;zz<=d/2-.2;zz+=.45)for(const sx of [-1,1])S.b(dk,sx*(w/2+.03),y0+h/2,z0+zz,.06,h,.12);
    L.b('#ffcf86',0,y0+1.4,z0+d/2+.04,4.6,2.7,.05);for(const x of [-2.35,-1.15,0,1.15,2.35])S.b('#4a3828',x,y0+1.4,z0+d/2+.08,.12,2.8,.08);S.b('#4a3828',0,y0+2.8,z0+d/2+.08,4.8,.14,.1);
    for(const sx of [-1,1])L.b('#ffc977',sx*(w/2+.04),y0+1.8,z0,.05,1.4,3);
    const roof=(yb,half,rise,len,col)=>{const a=Math.atan2(rise,half),Lr=Math.hypot(half,rise);for(const sd of [-1,1]){S.b(col,sd*half/2,yb+rise/2,z0,Lr,.26,len,0,0,-sd*a);S.b(SNOW,sd*(half/2-.06),yb+rise/2+.26,z0,Lr+.05,.32,len+.15,0,0,-sd*a)}S.b(SNOW,0,yb+rise+.2,z0,.6,.3,len+.15)};
    S.add(G.prism,oak,MX(0,y0+h,z0,w,1.9,d));roof(y0+h-.15,w/2+1.1,2.3,d+1.8,'#6b4f3a');
    S.b(oak,0,y0+h+2.1,z0,5.6,1.3,d-1.4);S.add(G.prism,oak,MX(0,y0+h+2.75,z0,5.6,1.2,d-1.4));roof(y0+h+2.6,3.4,1.45,d,'#6b4f3a');
    {const gx=0,gy=y0+h+3.2,gz=z0+(d-1.4)/2+.06;for(const a of [-.95,-.48,0,.48,.95])L.add(G.sph,'#ffd98a',MX(gx+Math.sin(a)*.22,gy+Math.cos(a)*.22,gz,.09,.32,.03,0,0,-a));L.b('#ffd98a',gx,gy-.12,gz,.7,.05,.03)}
    stringLights(L,-w/2-1,y0+h-.2,z0+d/2+.9,w/2+1,y0+h-.2,z0+d/2+.9,20,0);
    // đèn đá hai bên bậc thềm
    for(const sx of [-4.2,4.2]){const lz=z0+d/2+2.6;S.add(G.cyl,st,MX(sx,.9,lz,.18,1.2,.18));S.b(st,sx,1.6,lz,.7,.15,.7);L.b('#ffcc7a',sx,1.95,lz,.45,.5,.45);S.add(G.pyr4,st,MX(sx,2.4,lz,.9,.5,.9));S.add(G.pyr4,SNOW,MX(sx,2.5,lz,.8,.4,.8))}
    S.add(G.cyl12,'#7a3a28',MX(0,.86,4.4,.45,.12,.45));/* toạ cụ trên thềm đá, nhìn vào chánh điện */
    // Tượng Phật ngoài trời: tượng trắng ngồi thiền trên bệ đá tự nhiên, bên phải chánh điện
    {const bx=10.5,bz=1.5;for(const [rx,rz,rr,ry] of [[0,0,1.9,.7],[-1.2,.8,1.1,.5],[1.3,.6,1.2,.55],[.4,-1,1.3,.6],[-.9,-.7,1,.45]])S.add(G.sphLo,rx%2?'#8f8a84':'#a29d96',MX(bx+rx,ry,bz+rz,rr,ry+.35,rr));S.add(G.sphLo,SNOW,MX(bx,1.1,bz,1.6,.3,1.5));
      const wt='#ffffff',k=1.7,yb=1.15;S.add(G.cyl12,wt,MX(bx,yb+.15*k,bz,.95*k,.3*k,.7*k));S.add(G.sph,wt,MX(bx,yb+.42*k,bz,.85*k,.32*k,.6*k));S.add(G.sph,wt,MX(bx,yb+1.0*k,bz-.05,.48*k,.66*k,.36*k));S.add(G.sph,wt,MX(bx,yb+1.78*k,bz-.05,.27*k,.31*k,.27*k));S.add(G.sph,wt,MX(bx,yb+2.08*k,bz-.07,.13*k));S.add(G.sph,wt,MX(bx,yb+.62*k,bz+.28*k,.3*k,.12*k,.18*k));
      L.add(G.sph,'#fff0c8',MX(bx,yb+1.8*k,bz-.6,.9,.9,.05));for(const sx of [-2,2]){S.add(G.cyl,st,MX(bx+sx,.6,bz+2.4,.14,1,.14));L.b('#ffcc7a',bx+sx,1.25,bz+2.4,.3,.35,.3);S.add(G.pyr4,st,MX(bx+sx,1.6,bz+2.4,.6,.35,.6))}}
    S.reset();L.reset();warm(...tw(0,2).slice(0,1),y+3.2,tw(0,2)[1],16,18);
    {const c=tw(0,-1.5);block(c[0],c[1],7.8)}{const c=tw(10.5,1.5);block(c[0],c[1],5.5)}
    for(const [lx,lz,h] of [[-10,-3,8],[-9,-9,9],[8,-8,7],[-12,4,6],[16,-4,8],[6,-6,6]]){const c=tw(lx,lz);pine(T,c[0],c[1],h)}}
  // bậc đá lên núi, đèn đá hai bên
  {const a=tw(0,7.2),b=STAIR,n=Math.ceil(Math.hypot(a[0]-b.x,a[1]-b.z)/1.6),ang=Math.atan2(a[0]-b.x,a[1]-b.z);
    for(let i=0;i<=n;i++){const t=i/n,x=b.x+(a[0]-b.x)*t,z=b.z+(a[1]-b.z)*t,yy=H(x,z);S.b('#8a8580',x,yy+.05,z,3.2,.35,1.3,ang);S.b(SNOW,x,yy+.25,z,3,.04,.6,ang);
      if(i%4===1)for(const sd of [-2.6,2.6]){const lx=x+Math.cos(ang)*sd,lz=z-Math.sin(ang)*sd,y2=H(lx,lz);S.b('#8a8580',lx,y2+.5,lz,.35,1,.35);S.b('#8a8580',lx,y2+1.15,lz,.55,.3,.55);L.b('#ffcf7a',lx,y2+1.15,lz,.3,.2,.3);S.add(G.pyr4,'#8a8580',MX(lx,y2+1.5,lz,.55,.4,.55));S.add(G.pyr4,SNOW,MX(lx,y2+1.58,lz,.45,.3,.45))}}}
  {const s=STATIONS.find(s=>s.id==='sit'),c=tw(0,5.8);s.x=c[0];s.z=c[1];const b=STATIONS.find(s=>s.id==='bell'),d=tw(10.5,5.6);b.x=d[0];b.z=d[1]}

  // ---------- trồng thông: dày ở rừng tây và dải sau lều kính, thưa quanh làng ----------
  const segD=(x,z,ax,az,bx,bz)=>{const dx=bx-ax,dz=bz-az,t=Math.max(0,Math.min(1,((x-ax)*dx+(z-az)*dz)/(dx*dx+dz*dz)));return Math.hypot(x-ax-dx*t,z-az-dz*t)};
  const stTop=tw(0,7.2);
  const keep=(x,z)=>{if(lakeE(x,z)<1.12)return false;
    if(Math.hypot(x-FARM.x,z-FARM.z)<FARM.r+6)return false;if(Math.hypot(x-TREE.x,z-TREE.z)<40||Math.hypot(x-FUN.x,z-FUN.z)<24)return false;if(Math.hypot(x-TP.x,z-TP.z)<15)return false;if(segD(x,z,STAIR.x,STAIR.z,stTop[0],stTop[1])<5)return false;
    for(const [ix,iz] of IGLOOS){const [lx,lz]=toLake([ix,iz],16);if(Math.hypot(x-ix,z-iz)<8.5||segD(x,z,ix,iz,lx,lz)<4.5)return false}if(Math.abs(x)<9&&z>80&&z<104)return false;
    for(const p of PATHS)for(let i=0;i+1<p.length;i++)if(segD(x,z,...p[i],...p[i+1])<4)return false;
    for(const c of colliders)if(Math.hypot(x-c[0],z-c[1])<c[2]+1.5)return false;for(const t of HTRAILS)for(let i=0;i+1<t.length;i++)if(segD(x,z,...t[i],...t[i+1])<4)return false;for(const r of SKIRUNS)for(let i=0;i+1<r.length;i++)if(segD(x,z,...r[i],...r[i+1])<7)return false;if(segD(x,z,...LIFT[0],...LIFT[1])<4||Math.hypot(x-SKI.x,z-SKI.z+2)<12)return false;if(Math.abs(x-SKI.x)<30&&z>SKI.z-4&&z<SKI.z+62&&rnd()<.85)return false;if(segD(x,z,PIER[0][0],PIER[0][1],PIER[0][0]-8,PIER[0][1])<4)return false;if(Math.hypot((x-RINK.x)/(RINK.rx+6),(z-RINK.z)/(RINK.rz+6))<1)return false;for(let i=0;i+1<HUSKY_TRAIL.length;i++)if(segD(x,z,...HUSKY_TRAIL[i],...HUSKY_TRAIL[i+1])<4)return false;
    for(const zn of ZONES){const l=Math.hypot(zn.cam[0],zn.cam[1]);if(Math.hypot(x-zn.x,z-zn.z)<8||segD(x,z,zn.x,zn.z,zn.x-zn.cam[0]/l*18,zn.z-zn.cam[1]/l*18)<8)return false}return true};
  {const N=LOW?1300:4000;let n=0,tries=0;while(n<N&&tries<N*12){tries++;const x=(rnd()-.5)*560,z=(rnd()-.5)*560,r=Math.hypot(x,z);if(r>300)continue;
    let p=.12;if(x<-40&&z<20&&z>-150)p=.92;else if(z<-20)p=.93;else if(x>30)p=.9;else if(z<20)p=.6;else if(z<-60)p=.5;else if(r>130)p=.55;if(rnd()>p||!keep(x,z))continue;pine(T,x,z,5+rnd()*7*(r>160?1.4:1));n++}}

  sc.add(S.mesh(LAM));sc.add(L.mesh(GLOW));sc.add(T.mesh(LAM));

  // ---------- nhãn tên các khu ----------
  const labels=[];
  function signTex(t1,t2){const c=document.createElement('canvas');c.width=512;c.height=180;const g=c.getContext('2d');g.fillStyle='rgba(14,22,36,.72)';g.beginPath();if(g.roundRect)g.roundRect(8,8,496,164,40);else g.rect(8,8,496,164);g.fill();g.strokeStyle='rgba(214,184,120,.7)';g.lineWidth=3;g.stroke();
    g.textAlign='center';g.fillStyle='#f1e2bf';g.font='600 50px Georgia,serif';g.fillText(t1,256,90,470);g.fillStyle='#cfd8e6';g.font='28px system-ui,sans-serif';g.fillText(t2,256,138,470);const tx=new THREE.CanvasTexture(c);tx.colorSpace=THREE.SRGBColorSpace;return tx}
  for(const zn of ZONES){if(zn.id==='don')continue;const p={rungkinh:[...IGLOOS[1],8],lang:[-24,34,8],hobang:[LAKE.x,LAKE.z,4],rung:[12,-40,6],vuichoi:[-46,30,7],tuanloc:[142,88,5],dinh:[SKI.x,SKI.z-2,12],chua:[...tw(0,0),12]}[zn.id];if(!p)continue;
    const s=new THREE.Sprite(new THREE.SpriteMaterial({map:signTex(zn.name.toUpperCase(),zn.note.split('.')[0].slice(0,40)),transparent:true,fog:false,depthWrite:false}));s.scale.set(4.6,1.6,1);labels.push(s);s.position.set(p[0],H(p[0],p[1])+p[2],p[1]);sc.add(s)}

  // ---------- tuyết rơi ----------
  const SNN=LOW?900:2200,sp=new Float32Array(SNN*3);for(let i=0;i<SNN;i++){sp[i*3]=(rnd()-.5)*70;sp[i*3+1]=rnd()*30;sp[i*3+2]=(rnd()-.5)*70}
  const snowG=new THREE.BufferGeometry();snowG.setAttribute('position',new THREE.BufferAttribute(sp,3));
  const flake=(()=>{const c=document.createElement('canvas');c.width=c.height=32;const g=c.getContext('2d'),r=g.createRadialGradient(16,16,0,16,16,16);r.addColorStop(0,'rgba(255,255,255,1)');r.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=r;g.fillRect(0,0,32,32);return new THREE.CanvasTexture(c)})();
  const snow=new THREE.Points(snowG,new THREE.PointsMaterial({size:.16,map:flake,transparent:true,depthWrite:false,opacity:.85}));snow.frustumCulled=false;sc.add(snow);

  // ---------- nhân vật ----------
  let prof={};try{prof=JSON.parse(localStorage.getItem('yenGuestProfile17')||'{}')||{}}catch(e){}
  const me=new THREE.Group();{const col=prof.color||'#687b48';const body=new THREE.Mesh(new THREE.CapsuleGeometry(.34,.8,4,10),new THREE.MeshLambertMaterial({color:col}));body.position.y=1.05;me.add(body);
    const coat=new THREE.Mesh(new THREE.CylinderGeometry(.36,.48,.9,12),new THREE.MeshLambertMaterial({color:col}));coat.position.y=.72;me.add(coat);
    const head=new THREE.Mesh(new THREE.SphereGeometry(.25,14,10),new THREE.MeshLambertMaterial({color:'#e7c9a8'}));head.position.y=1.85;me.add(head);
    const hat=new THREE.Mesh(new THREE.SphereGeometry(.27,14,8,0,Math.PI*2,0,Math.PI/2),new THREE.MeshLambertMaterial({color:'#efe6d6'}));hat.position.y=1.9;me.add(hat);const pom=new THREE.Mesh(new THREE.SphereGeometry(.08,8,6),hat.material);pom.position.y=2.2;me.add(pom);
    const scarf=new THREE.Mesh(new THREE.TorusGeometry(.22,.07,6,16),new THREE.MeshLambertMaterial({color:'#8c2f2a'}));scarf.rotation.x=Math.PI/2;scarf.position.y=1.6;me.add(scarf);me.scale.setScalar(.85);
    const lap=new THREE.Mesh(new THREE.SphereGeometry(1,12,8),coat.material);lap.scale.set(.5,.16,.42);lap.position.set(0,.16,.12);lap.visible=false;me.add(lap);
    var setSit=on=>{const k=on?-.55:0;body.position.y=1.05+k*.8;body.scale.y=on?.7:1;coat.visible=!on;lap.visible=on;head.position.y=1.85+k;hat.position.y=1.9+k;pom.position.y=2.2+k;scarf.position.y=1.6+k}}
  sc.add(me);
  const P={x:0,z:104,a:Math.PI,dest:null,mode:'walk',ride:0,yaw:0,pitch:.2,dist:9,camT:new THREE.Vector3(),sitAt:null};
  me.position.set(P.x,groundY(P.x,P.z),P.z);

  // ---------- âm thanh: tiếng chuông tổng hợp ----------
  let ac=null;const bell=()=>{try{ac=ac||new (window.AudioContext||window.webkitAudioContext)();const t0=ac.currentTime;for(const [m,a] of [[1,1],[2.76,.35],[5.4,.12]]){const o=ac.createOscillator(),g=ac.createGain();o.frequency.value=196*m;g.gain.setValueAtTime(0,t0);g.gain.linearRampToValueAtTime(.14*a,t0+.02);g.gain.exponentialRampToValueAtTime(.0003,t0+7/Math.sqrt(m));o.connect(g).connect(ac.destination);o.start(t0);o.stop(t0+7)}}catch(e){}};

  // ---------- chạm, kéo, chụm ----------
  const ray=new THREE.Raycaster(),pts=new Map();let drag=null,pinch=0;const pd=()=>{const [a,b]=[...pts.values()];return Math.max(10,Math.hypot(a.x-b.x,a.y-b.y))};
  cv.addEventListener('pointerdown',e=>{pts.set(e.pointerId,{x:e.clientX,y:e.clientY});try{cv.setPointerCapture(e.pointerId)}catch(_){}if(pts.size===1)drag={mv:0};else{if(drag)drag.mv=99;pinch=pd()}});
  cv.addEventListener('pointermove',e=>{const p=pts.get(e.pointerId);if(!p)return;const dx=e.clientX-p.x,dy=e.clientY-p.y;p.x=e.clientX;p.y=e.clientY;
    if(pts.size===2&&pinch){const d=pd();P.dist=Math.max(3.5,Math.min(40,P.dist*pinch/d));pinch=d;return}if(!drag)return;drag.mv+=Math.abs(dx)+Math.abs(dy);P.yaw-=dx*.006;P.pitch=Math.max(-.1,Math.min(1.2,P.pitch+dy*.004))});
  cv.addEventListener('pointerup',e=>{if(!pts.delete(e.pointerId))return;pinch=pts.size===2?pd():0;if(pts.size)return;const d=drag;drag=null;if(!d||d.mv>8)return;tap(e.clientX,e.clientY)});
  cv.addEventListener('pointercancel',e=>{pts.delete(e.pointerId);if(!pts.size)drag=null});
  cv.addEventListener('wheel',e=>{e.preventDefault();P.dist=Math.max(3.5,Math.min(40,P.dist*Math.exp(Math.sign(e.deltaY)*.1)))},{passive:false});
  const keys=new Set();const onKey=e=>{const k={w:'f',arrowup:'f',s:'b',arrowdown:'b',a:'l',arrowleft:'l',d:'r',arrowright:'r'}[e.key.toLowerCase()];if(e.key==='Escape'&&e.type==='keydown'){if(!mapEl.hidden)mapEl.hidden=true;else if(P.mode!=='walk')stand();return}if(!k)return;e.preventDefault();if(e.type==='keydown'){keys.add(k);P.dest=null}else keys.delete(k)};
  document.addEventListener('keydown',onKey);document.addEventListener('keyup',onKey);
  function tap(cx,cy){if(P.mode!=='walk')return;const r=cv.getBoundingClientRect();ray.setFromCamera(new THREE.Vector2((cx-r.left)/r.width*2-1,-(cy-r.top)/r.height*2+1),cam);
    const hit=ray.intersectObjects([ice,groundMesh],false)[0];if(!hit)return;let x=hit.point.x,z=hit.point.z;
    const st=STATIONS.find(s=>Math.hypot(s.x-x,s.z-z)<4.5);if(st){x=st.x;z=st.z}
    if(Math.hypot(x,z)>220){caption('Phía xa là núi tuyết, mình dạo quanh làng thôi nhé');return}P.dest={x,z}}
  const blocked=(x,z)=>colliders.some(c=>Math.hypot(x-c[0],z-c[1])<c[2]);

  let first=true;
  // ---------- hoạt động ----------
  let near=null;
  function act(){const s=near;if(!s)return;P.dest=null;
    if(s.id==='aurora'){P.mode='aurora';P.ride=0;caption('✨ Nằm yên trong lều kính, nhìn bầu trời và mặt hồ. Thở theo vòng sáng: hít vào khi nó lớn, thở ra khi nó nhỏ.',9000);breathEl.hidden=false;U.boost.value=1.5;me.visible=false;labels.forEach(l=>l.visible=false)}
    else if(s.id==='husky'){P.mode='husky';P.ride=0;caption('🐕 Đàn husky chạy chậm một vòng rừng thông. Vuốt để nhìn quanh.',6000)}
    else if(s.id==='sled'){P.mode='sled';P.ride=0;setSit(true);caption('🛷 Xe trượt lướt chậm một vòng hồ. Nhìn cực quang soi xuống mặt băng.',6000)}
    else if(s.id==='sit'){setSit(true);P.mode='sit';{const c=tw(0,4.4);P.sitAt={x:c[0],z:c[1],y:H(TP.x,TP.z)+.92,a:TRY+Math.PI}}caption('🪷 Ngồi yên trước Phật. Mỗi hơi thở ra, thả lỏng đôi vai.',8000);breathEl.hidden=false;bell()}
    else if(s.id==='fire'){setSit(true);P.mode='sit';P.sitAt={x:-44,z:84.6,y:H(-44,82)+.5,a:Math.PI};caption('🔥 Hơ tay bên lửa. Ấm áp là điều nhỏ mà thật.',7000)}
    else if(s.id==='bell'){bell();caption('🪷 Chắp tay trước tượng Phật giữa rừng thông tuyết. Một tiếng chuông nhỏ, rồi lắng nghe sự tĩnh lặng.',7000);return}
    else if(s.id==='deer'){caption('🦌 Tuần lộc ăn rêu địa y. Chúng sống chậm theo mùa, không vội vàng.',7000);return}
    else if(s.id==='carousel'){P.mode='carousel';P.ride=0;caption('🎠 Vòng ngựa gỗ quay thật chậm, nhìn đèn lướt qua.',6000)}
    else if(s.id==='wheel'){P.mode='wheel';P.ride=0;setSit(true);caption('🎡 Vòng quay lên rất chậm. Từ trên cao nhìn cả làng tuyết và bầu trời.',7000)}
    actBtn.hidden=true;stopBtn.hidden=false;stopBtn.textContent=['husky','sled','carousel','wheel'].includes(P.mode)?'⏹ Xuống xe':'↩ Đứng dậy'}
  function stand(){const m=P.mode;P.mode='walk';breathEl.hidden=true;U.boost.value=1;me.visible=true;labels.forEach(l=>l.visible=true);me.rotation.set(0,me.rotation.y,0);stopBtn.hidden=true;
    setSit(false);const st=id=>{const q=STATIONS.find(s=>s.id===id);return [q.x,q.z]},back={aurora:st('aurora'),husky:st('husky'),sled:st('sled'),carousel:st('carousel'),wheel:st('wheel'),sit:P.sitAt&&P.sitAt.z<-50?st('sit'):st('fire')}[m];if(back){P.x=back[0];P.z=back[1]}P.sitAt=null;
    if(m==='aurora')caption('Mang Yên về đời thực: tối nay, trước khi ngủ, thử ngước nhìn bầu trời một phút.',7000)}
  actBtn.onclick=act;stopBtn.onclick=stand;

  // ---------- bản đồ ----------
  const mc=box.querySelector('.sn-mc'),mx=mc.getContext('2d'),MS=720,MW=250,toM=(x,z)=>[(x+10+MW/2)/MW*MS,(z+8+MW/2)/MW*MS],fromM=(u,v)=>[u/MS*MW-MW/2,v/MS*MW-MW/2+10];
  function drawMap(){const c=mx;c.fillStyle='#e8eef6';c.fillRect(0,0,MS,MS);
    c.fillStyle='#cfdbe9';c.beginPath();const [lx,lz]=toM(LAKE.x,LAKE.z);c.ellipse(lx,lz,LAKE.rx/MW*MS,LAKE.rz/MW*MS,0,0,7);c.fill();c.strokeStyle='#9fb6cf';c.lineWidth=2;c.stroke();
    c.fillStyle='rgba(42,82,66,.18)';for(let i=0;i<500;i++){const x=(hh(i,1)-.5)*300,z=(hh(i,2)-.5)*300;if(!((x<-40&&z<46&&z>-150)||(x>36&&x<124&&z<2&&z>-70))||!keep(x,z))continue;const [u,v]=toM(x,z);c.beginPath();c.moveTo(u,v-7);c.lineTo(u-5,v+4);c.lineTo(u+5,v+4);c.fill()}
    c.strokeStyle='#c9bba6';c.lineWidth=7;c.lineCap=c.lineJoin='round';for(const p of PATHS){c.beginPath();p.forEach((q,i)=>{const [u,v]=toM(...q);i?c.lineTo(u,v):c.moveTo(u,v)});c.stroke()}
    c.strokeStyle='#a9b3c4';c.lineWidth=4;c.setLineDash([8,6]);c.beginPath();const [hx,hz]=toM(HUSKY.x,HUSKY.z);c.ellipse(hx,hz,HUSKY.rx/MW*MS,HUSKY.rz/MW*MS,0,0,7);c.stroke();c.setLineDash([]);
    c.strokeStyle='#8a6f56';c.lineWidth=2;c.beginPath();const [fx,fz]=toM(FARM.x,FARM.z);c.arc(fx,fz,FARM.r/MW*MS,0,7);c.stroke();
    {const [hx2,hz2]=toM(HILL.x,HILL.z);for(const [k,col] of [[1,'#d6dbe4'],[.7,'#c3cad6'],[.38,'#e9e3d6']]){c.fillStyle=col;c.beginPath();c.arc(hx2,hz2,HILL.r*k/MW*MS,0,7);c.fill()}c.fillStyle='#8f9aac';c.font='14px system-ui';c.textAlign='center';c.fillText('▲ núi',hx2,hz2-HILL.r*.72/MW*MS)}
    c.textAlign='center';for(const zn of ZONES){const [u,v]=toM(zn.x,zn.z);c.fillStyle='#0e1b2c';c.beginPath();c.arc(u,v,19,0,7);c.fill();c.font='22px system-ui';c.fillText(zn.icon,u,v+8);c.font='600 17px system-ui';c.fillStyle='#0e1b2c';const ml=zn.ml||[0,0];c.fillText((zn.n?zn.n+' · ':'')+zn.name,u+ml[0],v+38+ml[1])}
    const [mu,mv]=toM(P.x,P.z);c.fillStyle='#c8a96a';c.strokeStyle='#fff';c.lineWidth=3;c.beginPath();c.arc(mu,mv,9,0,7);c.fill();c.stroke();
    c.fillStyle='#5c6c84';c.font='15px system-ui';c.textAlign='left';c.fillText('▲ Bắc · cực quang',14,24)}
  const goZone=zn=>{if(P.mode!=='walk')stand();P.x=zn.x;P.z=zn.z;P.dest=null;P.yaw=Math.atan2(zn.cam[0],zn.cam[1])+Math.PI;P.a=P.yaw+Math.PI;mapEl.hidden=true;first=true;caption(zn.icon+' '+(zn.n?zn.n+' · ':'')+zn.name+' · '+zn.note,6500)};
  box.querySelector('.sn-list').innerHTML=ZONES.map((z,i)=>'<button type="button" data-z="'+i+'">'+z.icon+' '+(z.n?z.n+' · ':'')+z.name+'</button>').join('');
  box.querySelector('.sn-list').addEventListener('click',e=>{const b=e.target.closest('[data-z]');if(b)goZone(ZONES[+b.dataset.z])});
  mc.addEventListener('click',e=>{const r=mc.getBoundingClientRect(),u=(e.clientX-r.left)/r.width*MS,v=(e.clientY-r.top)/r.height*MS;let best=null,bd=40;for(const z of ZONES){const [a,b]=toM(z.x,z.z),d=Math.hypot(a-u,b-v);if(d<bd){bd=d;best=z}}if(best)goZone(best)});
  box.addEventListener('click',e=>{const a=e.target.closest('[data-sn]')?.dataset.sn;if(a==='map'){drawMap();mapEl.hidden=false}else if(a==='mapx')mapEl.hidden=true;else if(a==='home')close()});
  mapEl.addEventListener('click',e=>{if(e.target===mapEl)mapEl.hidden=true});

  // ---------- vòng lặp ----------
  const resize=()=>{const w=box.clientWidth||innerWidth,h=box.clientHeight||innerHeight;R.setSize(w,h,false);cam.aspect=w/h;cam.fov=cam.fov0||(w<h?66:56);cam.updateProjectionMatrix()};resize();addEventListener('resize',resize);
  let run=true,tl=performance.now(),camFix=null;const tgt=new THREE.Vector3(),cpos=new THREE.Vector3();
  const loop=()=>{if(!run)return;requestAnimationFrame(loop);const now=performance.now(),dt=Math.min(.05,(now-tl)/1000);tl=now;const t=now/1000;U.time.value=t;U.camP.value.copy(cam.position);
    // đàn husky và xe trượt chạy vòng (kể cả khi không ngồi trên xe)
    const hu=P.mode==='husky'?(P.ride+=dt*.03):0,[hx,hz,hr]=along(HR,false,1-Math.abs(1-2*hu));huskyG.position.set(hx,H(hx,hz),hz);huskyG.rotation.y=hu>.5?hr+Math.PI:hr;
    dogs.forEach((d,i)=>{d.position.y=P.mode==='husky'?Math.abs(Math.sin(t*9+i))*.08:0});
    const su=P.mode==='sled'?(P.ride+=dt*.025):0,[sx,sz,sr]=along(SLOOP,true,su);sledG.position.set(sx,ICE_Y,sz);sledG.rotation.y=sr;
    carousel.rotation.y=t*.18;wheel.rotation.z=-t*.08;for(const g of gondolas){const a=g.userData.a;g.position.set(Math.cos(a)*WR,Math.sin(a)*WR,0);g.rotation.z=t*.08}if(fireFl){fireFl.scale.set(1+Math.sin(t*13)*.08,1+Math.sin(t*7.3)*.18,1+Math.cos(t*11)*.08);fireLight.intensity=12+Math.sin(t*9)*2+Math.sin(t*23)*1.2}
    if(P.mode==='walk'){let mvx=0,mvz=0;if(keys.size){const f=(keys.has('f')?1:0)-(keys.has('b')?1:0),s=(keys.has('r')?1:0)-(keys.has('l')?1:0),sy=Math.sin(P.yaw),cy=Math.cos(P.yaw);mvx=-sy*f+cy*s;mvz=-cy*f-sy*s}
      else if(P.dest){const dx=P.dest.x-P.x,dz=P.dest.z-P.z,d=Math.hypot(dx,dz);if(d<.15)P.dest=null;else{mvx=dx/d;mvz=dz/d}}
      if(mvx||mvz){const l=Math.hypot(mvx,mvz),spd=(P.dest&&Math.hypot(P.dest.x-P.x,P.dest.z-P.z)>30?6:2.6)*dt;mvx/=l;mvz/=l;let nx=P.x+mvx*spd,nz=P.z+mvz*spd;
        if(blocked(nx,nz)){const c=colliders.find(c=>Math.hypot(nx-c[0],nz-c[1])<c[2]);const ox=P.x-c[0],oz=P.z-c[1],ol=Math.hypot(ox,oz)||1,tx=-oz/ol,tz=ox/ol,sg=Math.sign(tx*mvx+tz*mvz)||1;nx=P.x+tx*sg*spd;nz=P.z+tz*sg*spd;if(blocked(nx,nz)){nx=P.x;nz=P.z;P.dest=null}}
        if(Math.hypot(nx,nz)<230){P.x=nx;P.z=nz}P.a=Math.atan2(mvx,mvz);me.position.y=groundY(P.x,P.z)+Math.abs(Math.sin(t*8))*.04}else me.position.y=groundY(P.x,P.z);
      me.position.x=P.x;me.position.z=P.z;let da=P.a-me.rotation.y;da=Math.atan2(Math.sin(da),Math.cos(da));me.rotation.y+=da*Math.min(1,dt*10);
      if(P.dest||keys.size){let dy=P.a+Math.PI-P.yaw;dy=Math.atan2(Math.sin(dy),Math.cos(dy));P.yaw+=dy*Math.min(1,dt*1.6)}
      near=null;for(const s of STATIONS)if(Math.hypot(s.x-P.x,s.z-P.z)<4.2){near=s;break}actBtn.hidden=!near;if(near)actBtn.textContent=near.label;
      tgt.set(P.x,me.position.y+1.5,P.z)}
    else if(P.mode==='husky'){me.position.copy(huskyG.position).add(_v.set(0,.35,-.1).applyAxisAngle(_v2.set(0,1,0),huskyG.rotation.y));me.rotation.set(0,huskyG.rotation.y,0);follow(huskyG.rotation.y,dt);if(P.ride>=1)stand();tgt.set(me.position.x,me.position.y+1.4,me.position.z);P.x=me.position.x;P.z=me.position.z}
    else if(P.mode==='sled'){me.position.copy(sledG.position).add(_v.set(0,.42,-.45).applyAxisAngle(_v2.set(0,1,0),sledG.rotation.y));me.rotation.set(0,sledG.rotation.y,0);follow(sledG.rotation.y,dt);if(P.ride>=1)stand();tgt.set(me.position.x,me.position.y+1.4,me.position.z);P.x=me.position.x;P.z=me.position.z}
    else if(P.mode==='carousel'){P.ride+=dt;const a=-carousel.rotation.y;me.position.set(CAR.x+Math.cos(a)*3,carousel.position.y+.9,CAR.z+Math.sin(a)*3);me.rotation.set(0,-a+Math.PI,0);tgt.set(CAR.x,carousel.position.y+2,CAR.z);if(P.ride>50)stand()}
    else if(P.mode==='wheel'){P.ride+=dt;const a=gondolas[0].userData.a+wheel.rotation.z;me.position.set(WHEEL.x+Math.cos(a)*WR,wheel.position.y+Math.sin(a)*WR-1.05,WHEEL.z);me.rotation.set(0,0,0);tgt.set(me.position.x,me.position.y+1.2,me.position.z);follow(0,dt);if(P.ride>78)stand()}
    else if(P.mode==='sit'){const s=P.sitAt;follow(s.a,dt);me.position.set(s.x,s.y,s.z);me.rotation.set(0,s.a,0);tgt.set(s.x,me.position.y+1.2,s.z)}
    // camera
    if(camFix){cam.position.set(...camFix[0]);cam.lookAt(...camFix[1])}
    else if(P.mode==='aurora'){P.ride+=dt;const x=70,z=6.2,y=H(70,6)+.45+1.1;cam.position.set(x,y,z);cam.lookAt(x+Math.sin(P.ride*.05)*8,y+9+Math.sin(P.ride*.07)*.8,z+11)}
    else{const lift=P.mode==='walk'?1:.8,D=P.mode==='walk'?P.dist:Math.min(P.dist,P.mode==='sit'?4.2:5.5),cx=tgt.x+Math.sin(P.yaw)*Math.cos(P.pitch)*D,cz=tgt.z+Math.cos(P.yaw)*Math.cos(P.pitch)*D;let cy=tgt.y+Math.sin(P.pitch)*D*lift+.5;cy=Math.max(cy,groundY(cx,cz)+.6);
      cpos.set(cx,cy,cz);if(first){cam.position.copy(cpos);first=false}else cam.position.lerp(cpos,Math.min(1,dt*5));cam.lookAt(tgt.x,tgt.y+(P.mode==='walk'?.6+P.pitch*1.5:.6),tgt.z)}
    // tuyết bay quanh camera
    const A=snowG.attributes.position.array;for(let i=0;i<SNN;i++){let y=A[i*3+1]-dt*(.8+(i%7)*.12);A[i*3]+=Math.sin(t*.6+i)*dt*.25;if(y<0)y+=30;A[i*3+1]=y}snowG.attributes.position.needsUpdate=true;snow.position.set(cam.position.x,cam.position.y-12,cam.position.z);
    R.render(sc,cam)};
  const _v2=new THREE.Vector3();let lastDrag=0;cv.addEventListener('pointermove',()=>{if(pts.size)lastDrag=performance.now()});
  function follow(h,dt){if(performance.now()-lastDrag<2500)return;let d=h+Math.PI-P.yaw;d=Math.atan2(Math.sin(d),Math.cos(d));P.yaw+=d*Math.min(1,dt*1.2)}
  requestAnimationFrame(loop);
  caption('❄ Xứ Yên · Hít một hơi lạnh trong lành, thở ra thật chậm. Chạm mặt tuyết để đi, vuốt để nhìn quanh.',7000);

  function close(){if(!run)return;run=false;removeEventListener('resize',resize);document.removeEventListener('keydown',onKey);document.removeEventListener('keyup',onKey);
    sc.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material){const m=o.material;if(m.map)m.map.dispose();m.dispose()}});R.dispose();try{R.forceContextLoss()}catch(e){}
    box.remove();css.remove();document.body.classList.remove('snow-open');window.__snowOpen=null;window.__snowCam=null;window.__snowGo=null;if(opts.onClose)opts.onClose()}
  // Chụp thử: __snowCam([x,y,z],[tx,ty,tz]) đặt camera cố định, __snowCam(null) để trả lại; __snowGo('leukinh') tới một khu; __snowAct('aurora') mở hoạt động
  window.__snowCam=(p,q)=>{camFix=p?[p,q]:null};window.__snowFog=d=>{sc.fog.density=d};window.__snowH=(x,z)=>groundY(x,z);window.__snowProject=v=>{const p=new THREE.Vector3(...v).project(cam);return [(p.x+1)/2,(1-p.y)/2]};window.__snowExp=e=>{R.toneMappingExposure=e};window.__snowFov=f=>{cam.fov=f;cam.updateProjectionMatrix();cam.fov0=f};window.__snowGo=id=>{const z=ZONES.find(z=>z.id===id);if(z)goZone(z)};
  window.__snowAct=id=>{const s=STATIONS.find(s=>s.id===id);if(s){if(P.mode!=='walk')stand();P.x=s.x;P.z=s.z;near=s;act()}};window.__snowMap=()=>{drawMap();mapEl.hidden=false};
  const api={close};window.__snowOpen=api;return api}
