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
const LAKE={x:108,z:46,rx:54,rz:24,rot:-.42},RINK={x:-12,z:83,rx:13,rz:13},ICE_Y=-.12,HILL={x:-72,z:-112,r:40,h:16},STAIR={x:-48,z:-80};
const RSH=a=>1;/* sân băng tròn đều như sân thật */
const LSH=a=>1+.2*Math.sin(2*a+.7)+.15*Math.sin(3*a+2.1)+.09*Math.sin(5*a+1.3)+.07*Math.sin(4*a+.4);/* bờ hồ uốn lượn tự nhiên */
const LC=Math.cos(LAKE.rot),LS=Math.sin(LAKE.rot),LW=(u,v)=>[LAKE.x+u*LC-v*LS,LAKE.z+u*LS+v*LC];
const lakeShore=(a,off,k)=>{const R=LSH(a)*(k||1),[bx,bz]=LW(Math.cos(a)*R*LAKE.rx,Math.sin(a)*R*LAKE.rz),dx=bx-LAKE.x,dz=bz-LAKE.z,l=Math.hypot(dx,dz);return [bx+dx/l*off,bz+dz/l*off]};
const ISLE=(()=>{const [x,z]=LW(-20,-2);return {x,z,r:7}})();
const IGLOOS=[[-1.1,4],[-.62,17],[.28,2]].map(([a,o])=>lakeShore(a,o));/* Lều Rừng Thông · Lều Đồi Tuyết · Lều Bờ Hồ */
const toLake=([x,z],d)=>{const dx=LAKE.x-x,dz=LAKE.z-z,l=Math.hypot(dx,dz);return [x+dx/l*d,z+dz/l*d]};
{const z=ZONES.find(q=>q.id==='rungkinh'),[x0,z0]=IGLOOS[1],[x1,z1]=toLake(IGLOOS[1],12);z.x=x1;z.z=z1;z.cam=[x0-x1,z0-z1]}
const PIER=(()=>{const a=lakeShore(2.95,0),b=toLake(a,9);return [a,b]})();/* cầu gỗ bờ tây, xuất phát xe trượt */
// Tuyến xe trượt băng: vòng khép kín cách bờ 6 m, chạy theo một chiều. 3 bến đậu sát bờ tây, chỗ cầu tàu cũ (đã bỏ cầu tàu).
const SLOOP=Array.from({length:240},(_,i)=>{const a=Math.PI-i/240*Math.PI*2;return [...lakeShore(a,-6),a]});
const SDOCK=[2.84,2.95,3.06].map(a=>({a,p:lakeShore(a,-2.2),m:lakeShore(a,-6)}));
const SKI={x:104,z:-118,r:66,h:50},SKIRUNS=[[[98,-110],[93,-102],[94,-94],[99,-86],[97,-78],[90,-70],[88,-60]],[[112,-110],[118,-101],[121,-92],[117,-84],[119,-75],[125,-66],[124,-58]]],LIFT=[[78,-60],[94,-110]];
const HTRAILS=[[[14,96],[30,88],[40,74],[41,58],[39,40],[36,18],[26,-4],[15,-11],[14.8,-15.5],[16,-20],[12.4,-28.6],[10,-34],[18,-42],[10,-50]],/* vòng ngoài phía đông làng, vào bãi husky qua hai cửa rào */[[10,-50],[40,-58],[66,-56],[80,-58]],[[10,-50],[-16,-66],[-42,-80]],[[26,-4],[70,8],[110,4],[140,-2],[176,-2]],[[40.8,54],[24.8,53]]];/* tuyến husky chính có nhánh */
const HR=[[16,-20],[12.4,-28.6],[10,-34],[18,-42],[10,-50],[40,-58],[66,-56],[80,-58]];/* xe husky chạy đi về */
const HUSKY={x:10,z:-50,rx:1,rz:1};
const along=(pts,closed,u)=>{const P=closed?[...pts,pts[0]]:pts;let tot=0;const L=[];for(let i=0;i+1<P.length;i++){const l=Math.hypot(P[i+1][0]-P[i][0],P[i+1][1]-P[i][1]);L.push(l);tot+=l}
  let d=((u%1)+1)%1*tot;if(!closed&&u>=1)d=tot;for(let i=0;i<L.length;i++){if(d<=L[i]||i===L.length-1){const t=Math.min(1,d/L[i]),a=P[i],b=P[i+1];return [a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,Math.atan2(b[0]-a[0],b[1]-a[1])]}d-=L[i]}};
const FARM={x:142,z:88,r:14},TREE={x:10,z:56},FUN={x:-30,z:56},RH={x:-64,z:55},CAR={x:-22,z:62},WHEEL={x:-36,z:50};
const SNOWMAN={x:-30,z:58},ARCH={x:-1,z:69,ry:-.7},archW=(lx,lz)=>[ARCH.x+Math.cos(ARCH.ry)*lx+Math.sin(ARCH.ry)*lz,ARCH.z-Math.sin(ARCH.ry)*lx+Math.cos(ARCH.ry)*lz];/* cổng đỏ Giáng sinh */
// Làng Lapland xếp lại theo tấm 10: nhà quây vòng cung phía bắc và đông cây thông lớn, quay mặt về cây thông và hồ trượt băng;
// vòng trong bán kính 22 m, vòng ngoài 38 m đặt đúng khe giữa hai nhà vòng trong để có đường đi thẳng từ quảng trường ra.
// [góc (0 = bắc, dương = đông), bán kính, rộng, sâu, cao, màu, loại]
const VH=[[0,29,9,19.8,4.4,'#c99d70','main'],[-58,22,8,7,3.8,'#b8906a','shop'],[58,22,8.5,8,3.6,'#c99d70','cafe'],[104,22,7,7.5,3.4,'#b8906a','chalet'],
  [-29,38,7,8,3.3,'#a8805c','aframe'],[29,38,7,7.5,3.4,'#b8906a','chalet']].map(([b,r,w,d,h,col,k])=>{const a=b*Math.PI/180,x=TREE.x+Math.sin(a)*r,z=TREE.z-Math.cos(a)*r,ry=Math.atan2(TREE.x-3-x,TREE.z+5-z);return {a,r,x,z,ry,w,d,h,col,k}});
const CHIMNEYS=[];/* miệng ống khói 5 nhà trên tuyến xe trao Yên */
const VRING=15,VPATH=[Array.from({length:49},(_,i)=>[TREE.x+Math.cos(i/48*Math.PI*2)*VRING,TREE.z+Math.sin(i/48*Math.PI*2)*VRING]),
  ...VH.map(v=>{const dx=Math.sin(v.ry)*(v.d/2+.6),dz=Math.cos(v.ry)*(v.d/2+.6);return [[v.x+dx,v.z+dz],[TREE.x+Math.sin(v.a)*VRING,TREE.z-Math.cos(v.a)*VRING]]})];
const PATHS=[[[14,98],[17,80],[12.5,71]],[[-4,62],[-16,66]],...VPATH,[[46,86],[84,94],[124,94]],[[124,94],[124,78],[134,70],[152,70],[160,80]],[[124,94],[130,104],[148,106],[160,98]],[[12,-4],[6,-12],[2,-24],[-4,-34]],[[30,-20],[38,-26]],Array.from({length:73},(_,i)=>lakeShore(i/72*Math.PI*2,4.5))],HUSKY_TRAIL=[];
const STATIONS=[
  {id:'aurora',x:48,z:-49.6,label:'✨ Vào lều kính ngắm cực quang'},
  {id:'husky',x:12.5,z:-19,label:'🐕 Lên xe husky dạo rừng'},
  {id:'sled',x:0,z:0,label:'🛷 Lái xe trượt trên hồ băng'},
  {id:'sit',x:0,z:-94.2,label:'🪷 Ngồi thiền trước Phật'},
  {id:'bell',x:9,z:-94,label:'🪷 Chiêm bái tượng Phật'},
  {id:'fire',x:-44,z:85.4,label:'🔥 Ngồi sưởi bên bếp lửa'},
  {id:'deer',x:122.6,z:86,label:'🦌 Cho tuần lộc ăn rêu'},
  {id:'carousel',x:-22,z:69.6,label:'🎠 Ngồi vòng ngựa gỗ'},
  {id:'wheel',x:-36,z:56.4,label:'🎡 Lên vòng quay ngắm làng'}];
{const q=STATIONS.find(o=>o.id==='aurora'),[x,z]=toLake(IGLOOS[1],7.4);q.x=x;q.z=z}
{const q=STATIONS.find(o=>o.id==='sled'),d=lakeShore(2.95,1.6);q.x=d[0];q.z=d[1];const zn=ZONES.find(o=>o.id==='hobang');zn.x=PIER[0][0]-4;zn.z=PIER[0][1];zn.cam=[PIER[1][0]-PIER[0][0],PIER[1][1]-PIER[0][1]]}

export function openSnow(THREE,opts){opts=opts||{};
  if(window.__snowOpen)return window.__snowOpen;
  const coarse=!!(window.matchMedia&&matchMedia('(pointer:coarse)').matches),LOW=coarse||!!opts.low;
  // ---------- khung trang ----------
  const box=document.createElement('section');box.id='snowBox';box.setAttribute('role','dialog');box.setAttribute('aria-label','Xứ Yên');
  box.innerHTML='<canvas id="snowCanvas"></canvas><div class="sn-top"><strong>✧ LÀNG YÊN - XỨ YÊN</strong><span class="sn-sp"></span><button type="button" data-sn="xmas" aria-pressed="false" title="Bật tắt đèn và trang trí Giáng sinh">🎄<span class="sn-lb"> Giáng sinh</span></button><button type="button" data-sn="snow" aria-pressed="false" title="Bật tắt tuyết rơi">❄<span class="sn-lb"> Tuyết rơi</span></button><button type="button" data-sn="map">🗺<span class="sn-lb"> Bản đồ</span></button><button type="button" data-sn="home">🏠 Trang chính</button></div>'
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
#snowBox .sn-top button.on{background:rgba(197,163,111,.34)!important;border-color:#c5a36f!important;color:#fff3d6!important}
@media(max-width:520px){#snowBox .sn-top strong{display:none}#snowBox .sn-lb{display:none}#snowBox .sn-top button{padding:7px 10px;font-size:13px;white-space:nowrap}}`;
  document.head.appendChild(css);document.body.appendChild(box);document.body.classList.add('snow-open');
  const cv=box.querySelector('#snowCanvas'),capEl=box.querySelector('.sn-cap'),actBtn=box.querySelector('.sn-act'),stopBtn=box.querySelector('.sn-stop'),breathEl=box.querySelector('.sn-breath'),mapEl=box.querySelector('.sn-map');
  let capT=0;const caption=(t,ms)=>{capEl.textContent=t;capEl.classList.add('on');clearTimeout(capT);capT=setTimeout(()=>capEl.classList.remove('on'),ms||5000)};

  // ---------- renderer, cảnh ----------
  const R=new THREE.WebGLRenderer({canvas:cv,antialias:!LOW,powerPreference:'high-performance'});R.setPixelRatio(Math.min(LOW?1.5:2,devicePixelRatio||1));R.outputColorSpace=THREE.SRGBColorSpace;R.toneMapping=THREE.ACESFilmicToneMapping;R.toneMappingExposure=1.05;
  const sc=new THREE.Scene();sc.fog=new THREE.FogExp2('#3e5880',.0052);
  const cam=new THREE.PerspectiveCamera(62,1,.1,1400);/* cùng góc nhìn 62° với Rừng Yên, Vịnh Yên */
  const hemi=new THREE.HemisphereLight('#c4d6f2','#56688e',1.45);sc.add(hemi);
  const moon=new THREE.DirectionalLight('#dfe8ff',1.0);moon.position.set(-60,80,40);sc.add(moon);
  const warm=(x,y,z,i,d)=>{const l=new THREE.PointLight('#ffb366',i,d,1.6);l.position.set(x,y,z);sc.add(l);return l};

  // ---------- hàm ngẫu nhiên, nhiễu, độ cao ----------
  let seed=20261127;const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
  const hh=(x,z)=>{const v=Math.sin(x*127.1+z*311.7)*43758.5453;return v-Math.floor(v)};
  const vn=(x,z)=>{const ix=Math.floor(x),iz=Math.floor(z),fx=x-ix,fz=z-iz,sx=fx*fx*(3-2*fx),sz=fz*fz*(3-2*fz);const a=hh(ix,iz),b=hh(ix+1,iz),c=hh(ix,iz+1),d=hh(ix+1,iz+1);return a+(b-a)*sx+(c-a)*sz+(a-b-c+d)*sx*sz};
  const sm=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t)};
  const lakeE=(x,z)=>{const dx=x-LAKE.x,dz=z-LAKE.z,u=(dx*LC+dz*LS)/LAKE.rx,v=(-dx*LS+dz*LC)/LAKE.rz,e=Math.hypot(u,v)/LSH(Math.atan2(v,u));if(e<1){const di=Math.hypot(x-ISLE.x,z-ISLE.z)/ISLE.r;if(di<1.35)return Math.max(e,1+(1.35-di)/1.35*.4)}return e};
  // Dáng núi hoang (ảnh 13, nơi không có công trình): đỉnh đá dựng đứng nhọn sắc kiểu vách đá Bắc Âu, mọc thành cụm trên vòng núi ngoài;
  // né núi chùa, núi trượt tuyết, trang trại và cuối đường husky. Sườn dốc lộ đá xám Arctic Slate, chỗ thoải phủ tuyết.
  const PEAKS=[];for(let i=0;i<30;i++){const a=i/30*Math.PI*2+.11*Math.sin(i*7.3),r=222+38*Math.sin(i*3.1),x=Math.cos(a)*r,z=Math.sin(a)*r;
    if(Math.hypot(x-SKI.x,z-SKI.z)<100||Math.hypot(x-HILL.x,z-HILL.z)<75||Math.hypot(x-FARM.x,z-FARM.z)<85||Math.hypot(x-176,z+2)<70)continue;
    PEAKS.push({x,z,A:85+80*(.5+.5*Math.sin(i*5.3)),R:34+16*(.5+.5*Math.cos(i*2.7))});if(i%2===0)PEAKS.push({x:x+Math.cos(a+1.7)*28,z:z+Math.sin(a+1.7)*28,A:55+40*(.5+.5*Math.cos(i*1.9)),R:26})}
  function H(x,z){const r=Math.hypot(x,z);let h=(vn(x*.025,z*.025)-.5)*1.3+(vn(x*.07+9,z*.07)-.5)*.4;
    {const k=sm(175,320,r),rid=1-Math.abs(vn(x*.011,z*.011)*2-1),rid2=1-Math.abs(vn(x*.03+5,z*.03)*2-1);h+=k*(10+rid*rid*72+rid2*14);if(r>150)for(const q of PEAKS){const dx=x-q.x,dz=z-q.z,d=Math.hypot(dx,dz);if(d<q.R*1.5){const th=Math.atan2(dz,dx),rr=q.R*(1+.32*Math.sin(3*th+q.A)+.16*Math.sin(5*th+q.R)),t=1-d/rr;if(t>0){const n=vn(x*.12+q.x,z*.12)*.3+.7;h=Math.max(h,q.A*Math.pow(t,1.55)*n+8)}}}}/* núi tuyết vòng ngoài, sống núi nhọn, đỉnh đá dựng */
    const dh=Math.hypot(x-HILL.x,z-HILL.z);h+=HILL.h*(1-sm(HILL.r*.35,HILL.r,dh));/* đồi chùa */
    {const dm=Math.hypot(x-IGLOOS[1][0],z-IGLOOS[1][1]);h+=5*(1-sm(5,15,dm))}/* đồi tuyết dưới Lều Đồi Tuyết */
    {const dq=Math.hypot(x-SKI.x,z-SKI.z);h+=SKI.h*(1-sm(SKI.r*.12,SKI.r,dq))}/* núi Đỉnh Tuyết Yên */
    {const er=Math.hypot((x-RINK.x)/RINK.rx,(z-RINK.z)/RINK.rz);if(er<1.5)h*=sm(1,1.5,er)}/* đồi rừng sau lều kính */
    const e=lakeE(x,z);if(e<1.25)h=e<1?-.6:-.6+(h+.6)*sm(1,1.25,e);return h}
  const groundY=(x,z)=>lakeE(x,z)<1?ICE_Y:H(x,z);

  // ---------- gộp hình: mỗi nhóm vật liệu là một lưới, ít lệnh vẽ, chạy nhẹ trên điện thoại ----------
  const G={box:new THREE.BoxGeometry(1,1,1),cone:new THREE.ConeGeometry(1,1,7,1,true),cone12:new THREE.ConeGeometry(1,1,12),cyl:new THREE.CylinderGeometry(1,1,1,8),cyl12:new THREE.CylinderGeometry(1,1,1,14),sph:new THREE.SphereGeometry(1,10,8),sphLo:new THREE.SphereGeometry(1,6,5),
    prism:new THREE.CylinderGeometry(1,1,1,3).rotateX(-Math.PI/2).translate(0,.5,0).scale(1/1.732,1/1.5,1),pyr4:new THREE.CylinderGeometry(.0001,1,1,4,1).rotateY(Math.PI/4),frus:new THREE.CylinderGeometry(.62,1,1,4,1).rotateY(Math.PI/4),cyl6:new THREE.CylinderGeometry(1,1,1,6),ico:new THREE.IcosahedronGeometry(1,0)};
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
  const S=new Batch(),L=new Batch(),T=new Batch(),XS=new Batch(),XL=new Batch();/* XS, XL: trang trí Giáng sinh, chỉ hiện ở phiên bản Giáng sinh */
  const LIT=()=>true;const I4=new THREE.Matrix4(),bulb=(x,y,z,c)=>{const t0=XL.T;XL.T=I4;XL.add(G.sphLo,c||'#ffd896',MX(x,y,z,.075));XL.T=t0};
  for(const p of PATHS)for(let i=0;i+1<p.length;i++){const [ax,az]=p[i],[bx,bz]=p[i+1],ln=Math.hypot(bx-ax,bz-az);if(ln<.01)continue;const ux=(bx-ax)/ln,uz=(bz-az)/ln,n=Math.max(1,Math.round(ln/3));
    for(let k=0;k<n;k++){const t=(k+.5)/n,x=ax+(bx-ax)*t,z=az+(bz-az)*t;for(const sd of [-1,1]){const px=x-uz*1.75*sd,pz=z+ux*1.75*sd;bulb(px,H(px,pz)+.12,pz,k%3?'#ffd896':'#fff0d0')}}}/* đèn nhỏ dọc hai mép đường đi *//* nguyên tắc toàn bản đồ: không cột đèn, chỉ đèn nhỏ gắn trên đường, hàng rào, kiến trúc, và chỉ bật ở bản Giáng sinh */const _lv=new THREE.Vector3();{const _la=L.add.bind(L);L.add=function(geo,col,m){if(geo===G.sphLo||geo===G.sph||col==='#ffd08a'){const t0=XL.T;XL.T=this.T;XL.add(geo,col,m);XL.T=t0;return this}return _la(geo,col,m)}}/* bóng đèn trang trí chỉ bật cùng nút Giáng sinh *//* S: vật thể thường · L: đèn, cửa sổ sáng · T: cây thông */
  const colliders=[],TG={};const block=(x,z,r)=>colliders.push([x,z,r]);

  // ---------- bầu trời đêm xanh thẫm và cực quang (theo ảnh chụp cực quang thật: dải lục toả tia, viền tím hồng) ----------
  // Cực quang: dải sáng uốn lượn ở "độ cao" cố định, dò dọc tia nhìn qua nhiều lớp nên có tia dọc và màu đổi theo chiều cao.
  const U={time:{value:0},boost:{value:1},camP:{value:new THREE.Vector3()},meP:{value:new THREE.Vector3()},fadeR:{value:0},night:{value:0}};
  // Làm mờ vật cản trước camera (như Rừng Yên, Vịnh Yên: vật cản giữa camera và nhân vật trong suốt bớt, không bị xoá).
  // Cảnh Xứ Yên gộp thành vài lưới lớn nên làm mờ theo điểm ảnh: phần vật thể nằm trong ống quanh đường nhìn camera → nhân vật
  // bị đục lỗ lưới mịn khoảng 75% (giống độ mờ .25 ở Rừng Yên), mép ống mờ dần; đoạn sát nhân vật giữ nguyên để không mờ chỗ đang đứng.
  const seeThrough=m=>{m.onBeforeCompile=sh=>{sh.uniforms.camP=U.camP;sh.uniforms.meP=U.meP;sh.uniforms.fadeR=U.fadeR;
    sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vSeeW;').replace('#include <project_vertex>','#include <project_vertex>\nvSeeW=(modelMatrix*vec4(transformed,1.)).xyz;');
    sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vSeeW;uniform vec3 camP,meP;uniform float fadeR;').replace('void main() {','void main() {\n if(fadeR>0.){vec3 ab=meP-camP;float L2=max(dot(ab,ab),1.),t=dot(vSeeW-camP,ab)/L2,lim=1.-2.2/sqrt(L2);if(t>0.&&t<lim){float d=length(vSeeW-(camP+ab*t)),k=smoothstep(fadeR,fadeR*.45,d)*smoothstep(0.,.08,t);float n=fract(52.9829189*fract(dot(gl_FragCoord.xy,vec2(.06711056,.00583715))));if(n<k*.75)discard;}}');};m.customProgramCacheKey=()=>'seeThrough'};seeThrough(LAM);seeThrough(GLOW);
  const AUR_STEPS=LOW?9:14;
  const SKYFN=`uniform float time,boost,night;
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
        vec3 col=mix(vec3(.12,.95,.7),vec3(.35,.95,.9),smoothstep(.2,.5,v));col=mix(col,vec3(.72,.52,.98),smoothstep(.5,1.,v));
        acc+=col*b*rays*(1.15-v*.75);}
      return acc*(4.2/${AUR_STEPS}.)*smoothstep(.015,.12,d.y)*boost;}
    vec3 skyCol(vec3 d){float y=d.y;vec3 c=mix(vec3(.3,.42,.6),vec3(.1,.19,.36),smoothstep(0.,.3,y));c=mix(c,vec3(.035,.07,.18),smoothstep(.3,.95,y));c*=mix(1.,.32,night);/* bản Giáng sinh: trời tối */
      float south=max(0.,d.z);c+=vec3(.22,.12,.2)*pow(south,2.)*exp(-max(y,0.)*9.)*.5;
      vec2 g=floor(d.xz/(abs(d.y)+.35)*260.);float st=step(.9965,h2(g))*smoothstep(.04,.3,y);c+=vec3(.9,.95,1.)*st*(.55+.45*sin(time*2.+h2(g+3.)*40.));
      c+=aurora(d);return c;}`;
  const sky=new THREE.Mesh(new THREE.SphereGeometry(1200,40,20),new THREE.ShaderMaterial({uniforms:U,side:THREE.BackSide,depthWrite:false,fog:false,toneMapped:false,
    vertexShader:'varying vec3 vD;void main(){vD=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader:SKYFN+`varying vec3 vD;void main(){vec3 d=normalize(vD);vec3 c=d.y<0.?vec3(.3,.42,.6)*mix(1.,.32,night):skyCol(d);gl_FragColor=vec4(c,1.);
        #include <colorspace_fragment>
      }`}));sky.frustumCulled=false;sky.renderOrder=-10;sc.add(sky);

  // ---------- mặt đất tuyết (vẽ đường đi lên vân) ----------
  const W=900,TX=LOW?1024:2048,tcv=document.createElement('canvas');tcv.width=tcv.height=TX;{const c=tcv.getContext('2d'),k=TX/W,P=(x,z)=>[(x+W/2)*k,(z+W/2)*k];
    c.fillStyle='#eef2f8';c.fillRect(0,0,TX,TX);
    for(let i=0;i<TX*TX/220;i++){const x=Math.random()*TX,y=Math.random()*TX,r=Math.random()*3*k+.5;c.fillStyle=Math.random()<.5?'rgba(205,216,236,.35)':'rgba(255,255,255,.5)';c.beginPath();c.arc(x,y,r,0,7);c.fill()}
    const line=(pts,w,col)=>{c.strokeStyle=col;c.lineWidth=w*k;c.lineCap=c.lineJoin='round';c.beginPath();pts.forEach((p,i)=>{const q=P(p[0],p[1]);i?c.lineTo(...q):c.moveTo(...q)});c.stroke()};
    for(const p of PATHS){line(p,4.6,'rgba(190,198,210,.6)');line(p,3,'rgba(146,157,172,.95)')}
    const ell=(o,col,w,off)=>{c.strokeStyle=col;c.lineWidth=w*k;c.beginPath();for(let i=0;i<=96;i++){const a=i/96*Math.PI*2,q=P(o.x+Math.cos(a)*(o.rx+off),o.z+Math.sin(a)*(o.rz+off));i?c.lineTo(...q):c.moveTo(...q)}c.stroke()};
    for(const t of HTRAILS){line(t,5,'rgba(226,230,238,.6)');line(t,1.4,'rgba(196,188,166,.9)')}for(const r of SKIRUNS){line(r,9,'rgba(250,250,255,.95)')}
    {const q=P(FARM.x,FARM.z);c.fillStyle='rgba(176,184,196,.7)';c.beginPath();c.arc(q[0],q[1],FARM.r*k,0,7);c.fill()}
    {const q=P(TREE.x,TREE.z);c.fillStyle='rgba(156,166,180,.92)';c.beginPath();c.arc(q[0],q[1],16.5*k,0,7);c.fill();c.strokeStyle='rgba(140,150,164,.85)';c.lineWidth=1.2*k;c.beginPath();c.arc(q[0],q[1],13.5*k,0,7);c.stroke()}}
  const ttex=new THREE.CanvasTexture(tcv);ttex.colorSpace=THREE.SRGBColorSpace;ttex.anisotropy=4;
  {const seg=LOW?150:220,g=new THREE.PlaneGeometry(W,W,seg,seg);g.rotateX(-Math.PI/2);const P=g.attributes.position;for(let i=0;i<P.count;i++)P.setY(i,H(P.getX(i),P.getZ(i)));g.computeVertexNormals();{const N=g.attributes.normal,C=[];for(let i=0;i<P.count;i++){const st=1-N.getY(i),k=sm(.3,.55,st)*sm(100,180,Math.hypot(P.getX(i),P.getZ(i))),f=1-k*.66;C.push(f*(1-k*.12),f*(1-k*.05),f*(1+k*.04))}g.setAttribute('color',new THREE.Float32BufferAttribute(C,3))}
    const ground=new THREE.Mesh(g,new THREE.MeshLambertMaterial({map:ttex,vertexColors:true}));ground.name='ground';sc.add(ground);var groundMesh=ground}
  // núi tuyết xa phía sau vòng ngoài
  for(let i=0;i<46;i++){const a=i/46*Math.PI*2+rnd()*.1,r=380+rnd()*120,h=90+rnd()*120,w=34+rnd()*36,x=Math.cos(a)*r,z=Math.sin(a)*r,ro=rnd()*3;S.add(G.cone,'#7d8896',MX(x,h/2-6,z,w,h,w*(.7+rnd()*.4),0,ro,0));S.add(G.cone,'#e8edf4',MX(x,h-6-h*.16,z,w*.33,h*.32,w*.3,0,ro+.3,0));/* răng cưa đá xa */
    for(let k=0;k<2;k++){const b=a+(k?.05:-.05),hh=h*(.45+rnd()*.3),ww=w*.6;S.add(G.cone,'#8a95a3',MX(Math.cos(b)*(r+10),hh/2-6,Math.sin(b)*(r+10),ww,hh,ww,0,rnd()*3,0))}}
  // hồ băng phẳng lặng như gương: phản chiếu bầu trời và cực quang, vân nứt băng mờ
  const ice=new THREE.Mesh((()=>{const sh=new THREE.Shape();for(let i=0;i<=160;i++){const [bx,bz]=lakeShore(-i/160*Math.PI*2,0);i?sh.lineTo(bx-LAKE.x,-(bz-LAKE.z)):sh.moveTo(bx-LAKE.x,-(bz-LAKE.z))}
      const ho=new THREE.Path();for(let i=0;i<=40;i++){const a=i/40*Math.PI*2,r=ISLE.r*1.3;const hx=ISLE.x+Math.cos(a)*r,hz=ISLE.z+Math.sin(a)*r;i?ho.lineTo(hx-LAKE.x,-(hz-LAKE.z)):ho.moveTo(hx-LAKE.x,-(hz-LAKE.z))}sh.holes.push(ho);
      return new THREE.ShapeGeometry(sh,4).rotateX(-Math.PI/2)})(),new THREE.ShaderMaterial({uniforms:U,side:THREE.DoubleSide,fog:false,toneMapped:false,
    vertexShader:'varying vec3 vW;void main(){vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}',
    fragmentShader:SKYFN+`uniform vec3 camP;varying vec3 vW;void main(){vec3 v=normalize(vW-camP);vec2 q=vW.xz*.35;
        vec3 n=normalize(vec3((n2(q*3.)-.5)*.05,1.,(n2(q*3.+7.)-.5)*.05));vec3 r=reflect(v,n);r.y=abs(r.y);
        float fr=.3+.7*pow(1.-max(-v.y,0.),3.);vec3 base=vec3(.2,.44,.58);
        float cr=smoothstep(.48,.5,n2(q*1.3))*smoothstep(.52,.5,n2(q*1.3))*.07;
        vec3 c=mix(base,skyCol(r)*.85,clamp(fr,0.,.62))+cr*vec3(.6,.8,.85)+vec3(.0,.03,.04);
        float dist=length(vW-camP);c=mix(c,vec3(.13,.2,.34),1.-exp(-dist*dist*.0000035));
        gl_FragColor=vec4(c,1.);
        #include <colorspace_fragment>
      }`}));ice.position.set(LAKE.x,ICE_Y,LAKE.z);ice.name='ice';sc.add(ice);
  {const sh=new THREE.Shape();for(let i=0;i<=96;i++){const a=-i/96*Math.PI*2,k=RSH(a);i?sh.lineTo(Math.cos(a)*RINK.rx*k,-Math.sin(a)*RINK.rz*k):sh.moveTo(Math.cos(a)*RINK.rx*k,-Math.sin(a)*RINK.rz*k)}const rk=new THREE.Mesh(new THREE.ShapeGeometry(sh,3).rotateX(-Math.PI/2),ice.material);rk.position.set(RINK.x,.05,RINK.z);sc.add(rk)}

  // ---------- các mẫu dựng ----------
  const SNOW='#f4f7fc',IVORY='#f1eee5',WREATH=new THREE.TorusGeometry(.42,.13,5,14).toNonIndexed();
  // cây thông theo dáng Rừng Yên (thông cao thân trần tán bẹt, thông vừa tầng nón, thông non), phủ tuyết, cao thấp tự nhiên
  const NEEDLE=['#2b4c3f','#335a48','#264438','#3d6450'],BARK='#6e4632',hsh=(x,z,k)=>{const v=Math.sin(x*12.9898+z*78.233+k*37.719)*43758.5453;return v-Math.floor(v)};
  function pine(B,x,z,h,y0){if(B===T){const k=((x/8)|0)+','+((z/8)|0);(TG[k]||(TG[k]=[])).push([x,z,.75])}/* thân cây là vật cản */const y=y0==null?H(x,z):y0,r=hsh(x,z,1),r2=hsh(x,z,2),r3=hsh(x,z,3),ry=r2*6.28;h*=.8+.45*r3;
    const kind=h<4.6?'young':r<.3?'tall':r<.8?'mid':'young';
    if(kind==='tall'){const Ht=h*1.5,k=Ht/16;B.add(G.cyl,BARK,MX(x,y+Ht*.4,z,.16*k+.05,Ht*.8,.16*k+.05));
      const tiers=[[0,1,0,1.4,.8,1.4],[.9,.93,.4,2.1,.7,1.8],[-1.1,.87,-.3,2.2,.62,1.9],[.5,.81,-1,1.9,.58,1.7],[-.5,.75,1,1.8,.55,1.6],[1.3,.7,.2,1.3,.5,1.2]];
      tiers.forEach(([ox,fy,oz,sx,sy,sz],i)=>{if(i===5&&r2<.5)return;const c=Math.cos(ry),s=Math.sin(ry),px=x+(ox*c-oz*s)*k,pz=z+(ox*s+oz*c)*k,py=y+Ht*fy;
        B.add(G.ico,NEEDLE[i%4],MX(px,py,pz,sx*k,sy*k,sz*k,0,i*.9+ry,0));B.add(G.ico,SNOW,MX(px,py+sy*k*.42,pz,sx*k*.86,sy*k*.42,sz*k*.86,0,i*.9+ry,0))});return}
    if(kind==='mid'){const k=h/10;B.add(G.cyl,BARK,MX(x,y+h*.3,z,.17*k,h*.6,.17*k));
      for(const [cr,ch,cy,c] of [[2.2,3,6.1,1],[1.8,2.7,7.6,0],[1.25,2.3,8.9,3],[.6,1.6,10.1,1]]){B.add(G.cone,NEEDLE[c],MX(x,y+cy*k-1.6*k,z,cr*k*(1.1+.25*r2),ch*k,cr*k*(1.1+.25*r2),0,ry+cy,0));B.add(G.cone,SNOW,MX(x,y+cy*k-1.6*k+ch*k*.2,z,cr*k*.9,ch*k*.45,cr*k*.9,0,ry+cy+.3,0))}return}
    const k=h/4.6;B.add(G.cyl,BARK,MX(x,y+1*k,z,.08*k,2*k,.08*k));
    for(const [cr,ch,cy,c] of [[1.25,2.1,2,3],[.9,1.8,3.1,1],[.5,1.2,4.05,0]]){B.add(G.cone,NEEDLE[c],MX(x,y+cy*k,z,cr*k*1.15,ch*k,cr*k*1.15,0,ry+cy,0));B.add(G.cone,SNOW,MX(x,y+cy*k+ch*k*.2,z,cr*k*.74,ch*k*.42,cr*k*.74,0,ry+cy+.3,0))}}
  // nhà gỗ Lapland: thân gỗ sẫm (đỏ Falu, nâu), mái dốc phủ tuyết dày, cửa sổ vàng ấm, ống khói, củi xếp hiên
  function cabin(x,z,ry,o){o=o||{};const w=o.w||7,d=o.d||9,h=o.h||3.2,col=o.col||'#c99d70',y=H(x,z);S.at(x,y,z,ry);L.at(x,y,z,ry);
    S.b('#8f98a3',0,-.3,0,w+.5,.8,d+.5);S.b(col,0,h/2,0,w,h,d);
    for(let i=0;i<6;i++){S.b(i%2?'#b08660':col,0,.3+i*.5,d/2+.01,w,.06,.02)}
    const a=.72,s=w/2+.45,Lr=s/Math.cos(a),rh=Math.tan(a)*(w/2);
    S.add(G.prism,col,MX(0,h,0,w,rh,d));
    const ry0=h+rh-Math.tan(a)*s/2+.1;for(const sd of [-1,1]){S.b('#b8906a',sd*s/2,ry0,0,Lr,.22,d+.8,0,0,-sd*a);S.b(SNOW,sd*(s/2-.08),ry0+.27,0,Lr+.05,.38,d+1,0,0,-sd*a)}
    S.b(SNOW,0,h+rh+.18,0,.7,.4,d+1);
    S.b('#5c5550',w*.25,h+rh*.7,-d*.2,.7,2.2,.7);S.b(SNOW,w*.25,h+rh*.7+1.15,-d*.2,.85,.2,.85);
    S.b('#3b2a20',0,1.1,d/2+.06,1.2,2.2,.12);L.b('#ffd08a',0,2.6,d/2+.05,.5,.35,.05);
    for(const sx of [-1,1]){L.b('#ffc977',sx*w*.3,1.7,d/2+.04,1.1,1,.05);S.b('#e9e2d6',sx*w*.3,1.17,d/2+.12,1.3,.1,.2);
      for(const sz of [-.22,.22])L.b('#ffc977',sx*(w/2+.03),1.7,sz*d,.05,1,1.1)}
    if(o.porch!==false){S.b('#7a5a40',0,.15,d/2+1.1,w*.6,.2,2);for(const sx of [-1,1])S.b('#9a7a5a',sx*w*.28,1.3,d/2+2,.18,2.4,.18);S.b('#b8906a',0,2.6,d/2+1.3,w*.66,.16,2.4,0,-.18);S.b(SNOW,0,2.76,d/2+1.3,w*.68,.18,2.4,0,-.18)}
    for(let i=0;i<5;i++)S.add(G.cyl,i%2?'#8a6a4a':'#7a5a3e',MX(-w/2-.5,.25+Math.floor(i/3)*.4,-d*.15+(i%3)*.42-.4,.18,1.4,.18,Math.PI/2,0,0));
    stringLights(L,-w/2-.45,h+.05,d/2+.12,0,h+rh+.15,d/2+.12,12,0);stringLights(L,0,h+rh+.15,d/2+.12,w/2+.45,h+.05,d/2+.12,12,0);stringLights(L,-w/2-.45,h+.02,-d/2,-w/2-.45,h+.02,d/2,14,0);stringLights(L,w/2+.45,h+.02,-d/2,w/2+.45,h+.02,d/2,14,0);
    XS.T=S.T;XL.T=L.T;XS.add(WREATH,'#2f5b48',MX(0,h+rh*.42,d/2+.14,1));XS.add(G.sphLo,'#a5302a',MX(0,h+rh*.42-.42,d/2+.2,.1));XS.reset();XL.reset();
    S.reset();L.reset();block(x,z,Math.max(w,d)/2+.8)}
  // lều kota gỗ sáu cạnh, mái nón, khói bếp
  function kota(x,z,r,col){const y=H(x,z);S.at(x,y,z,0);S.add(G.cyl6,col||'#a8805c',MX(0,.9,0,r,1.8,r));S.add(G.cone,'#9a7a5a',MX(0,1.8+r*.6,0,r*1.15,r*1.3,r*1.15,0,Math.PI/6,0));S.add(G.cone,SNOW,MX(0,1.95+r*.6,0,r*1.08,r*1.12,r*1.08,0,Math.PI/6,0));S.b('#2a1e16',0,.85,r*.86,.9,1.7,.1);L.reset();L.b('#ffb35a',x,y+.8,z+r*.9,.7,1.4,.05);S.reset();block(x,z,r+.6)}
  // lều lavvu của người Sámi: cọc gỗ chụm đầu, bạt nhạt
  function lavvu(x,z,r){const y=H(x,z);S.add(G.cone12,'#d8cbb2',MX(x,y+r*1.1,z,r,r*2.2,r));for(let i=0;i<7;i++){const a=i/7*6.28;S.add(G.cyl,'#5a4532',MX(x+Math.cos(a)*.2,y+r*2.2+.5,z+Math.sin(a)*.2,.05,1.2,.05,Math.sin(a)*.3,0,-Math.cos(a)*.3))}S.b('#9a7a5a',x,y+.7,z+r*.75,.8,1.3,.05);block(x,z,r+.4)}
  function lantern(){}/* bỏ toàn bộ cột đèn, trụ đèn */
  function reindeer(B,x,z,ry,s,graze){const y=H(x,z);B.at(x,y,z,ry,s);const br='#9a8268',dk='#5a4838',lt='#efe6d6';
    B.add(G.sph,br,MX(0,1.05,0,.38,.36,.78));B.add(G.sph,lt,MX(0,.95,.55,.3,.3,.2));B.add(G.sph,lt,MX(0,.98,-.72,.16,.18,.08));
    const hy=graze?.55:1.55,hz=graze?.95:.85;B.add(G.cyl,br,MX(0,(1.15+hy)/2+.05,(.55+hz)/2,.13,.7,.13,graze?1.1:-.5,0,0));B.add(G.sph,br,MX(0,hy,hz+.12,.15,.15,.26));B.add(G.sph,dk,MX(0,hy-.03,hz+.36,.07,.06,.06));
    for(const sx of [-1,1]){for(const sz of [-.45,.45])B.add(G.cyl,dk,MX(sx*.18,.45,sz,.05,.9,.05));
      const ax=sx*.1,ay=hy+.18,az=hz+.05;B.add(G.cyl,'#cbb89a',MX(ax+sx*.12,ay+.25,az-.05,.025,.6,.025,-.3,0,-sx*.4));B.add(G.cyl,'#cbb89a',MX(ax+sx*.32,ay+.55,az-.18,.02,.45,.02,-.7,0,-sx*.2));B.add(G.cyl,'#cbb89a',MX(ax+sx*.2,ay+.5,az+.1,.02,.3,.02,.5,0,-sx*.3))}
    B.reset()}
  function fence(cx,cz,r,n,gap){const gs=gap?[].concat(gap):[];for(let i=0;i<n;i++){const a0=i/n*6.28,a1=(i+1)/n*6.28;if(gs.some(g=>Math.abs(Math.atan2(Math.sin(a0-g),Math.cos(a0-g)))<.3))continue;const x0=cx+Math.cos(a0)*r,z0=cz+Math.sin(a0)*r,x1=cx+Math.cos(a1)*r,z1=cz+Math.sin(a1)*r,mx=(x0+x1)/2,mz=(z0+z1)/2,len=Math.hypot(x1-x0,z1-z0),ang=Math.atan2(x1-x0,z1-z0),y=H(mx,mz);
    S.b('#8f7258',x0,H(x0,z0)+.55,z0,.12,1.1,.12);S.b(SNOW,x0,H(x0,z0)+1.12,z0,.16,.06,.16);for(const hy of [.4,.85])S.b('#9a7a5a',mx,y+hy,mz,.06,.08,len,ang);for(const t of [.25,.75])bulb(x0+(x1-x0)*t,y+.93,z0+(z1-z0)*t)}}

  // dây đèn dưới mái hiên: chuỗi bóng vàng ấm như ảnh Xứ Yên
  function stringLights(B,x0,y0,z0,x1,y1,z1,n,sag){for(let i=0;i<=n;i++){const t=i/n;_lv.set(x0+(x1-x0)*t,y0,z0+(z1-z0)*t).applyMatrix4(B.T);if(!LIT(_lv.x,_lv.z))continue;B.add(G.sphLo,i%4?'#ffd27a':'#ffe8b8',MX(x0+(x1-x0)*t,y0+(y1-y0)*t-Math.sin(t*Math.PI)*(sag||0),z0+(z1-z0)*t,.07))}}
  // ---------- Cổng Xứ Yên ----------
  {const GX=14,GZ=98,y=H(GX,GZ);S.at(GX,y,GZ,0);L.at(GX,y,GZ,0);for(const sx of [-1,1]){S.b('#8a6a4a',sx*3.4,2,0,.5,4,.5);S.b('#9a7a5a',sx*3.4,.2,0,.8,.4,.8);L.b('#ffcc7a',sx*3.4,3.4,.3,.3,.4,.06)}
    S.b('#4a3426',0,4.3,0,8.4,.5,.7);S.add(G.prism,'#4a3426',MX(0,4.55,0,9.4,1.9,1.6));S.b(SNOW,-2.4,5.55,0,5.3,.3,1.9,0,0,.38);S.b(SNOW,2.4,5.55,0,5.3,.3,1.9,0,0,-.38);
    stringLights(L,-4.6,4.5,.95,0,6.35,.95,10,0);stringLights(L,0,6.35,.95,4.6,4.5,.95,10,0);S.reset();L.reset();block(GX-3.4,GZ,.6);block(GX+3.4,GZ,.6);
    const sg=signTex('XỨ YÊN','Arctic Wonderland'),m=new THREE.Mesh(new THREE.PlaneGeometry(3.6,1.27),new THREE.MeshBasicMaterial({map:sg,transparent:true}));m.position.set(GX,y+3.45,GZ+.4);sc.add(m);const m2=m.clone();m2.rotation.y=Math.PI;m2.position.z=GZ-.4;sc.add(m2);
    for(const [lx,lz] of [[12,108],[17,108],[13.5,90],[19,90],[15,84],[20,84]])lantern(lx,lz)}
  // ---------- 2 Làng Lapland quanh cây thông lớn ----------
  // Cây thông trung tâm: cao 26 m, 11 tầng tán xếp so le, mép tán phủ tuyết, sao vàng champagne trên đỉnh.
  // Bản Giáng sinh thêm quả châu đỏ, vàng, ngà, 460 bóng đèn xoắn ốc và hộp quà dưới gốc.
  {const X=TREE.x,Z=TREE.z,y=H(X,Z),h=26,base=y+1.6,tiers=9,R0=7.6,rad=t=>R0*Math.pow(1-t,.92)+.25;
    S.add(G.cyl12,'#b4bbc4',MX(X,y+.25,Z,8.6,.5,8.6));S.add(G.cyl12,'#9aa3ad',MX(X,y+.52,Z,8.7,.06,8.7));S.add(G.cyl12,SNOW,MX(X,y+.56,Z,8.4,.08,8.4));/* bồn gỗ đá quanh gốc */
    T.add(G.cyl,'#6e4632',MX(X,y+1.5,Z,.75,3,.75));
    for(let i=0;i<tiers;i++){const t=i/tiers,r=rad(t),th=6.4-t*3.4,ty=base+t*(h-3.2);/* mỗi tầng xoè rộng hơn đỉnh tầng dưới nên thấy rõ từng bậc tán */
      T.add(G.cone,i%2?'#24493b':'#1f4034',MX(X,ty+th*.32,Z,r*1.04,th*.64,r*1.04,0,i*.45,0));
      T.add(G.cone12,i%2?'#1f4034':'#24493b',MX(X,ty+th*.55,Z,r*.86,th*.9,r*.86,0,i*.45+.2,0));
      {const oc=y=>Math.max(r*1.04*(1-(y-ty)/(th*.64)),r*.86*(ty+th-y)/(th*.9))+.1,y2=ty+(h-3.2)/tiers+.05,y1=y2-.42;T.add(new THREE.CylinderGeometry(oc(y2),oc(y1),y2-y1,14,1,true).toNonIndexed(),'#e4ecf4',MX(X,(y1+y2)/2,Z,1,1,1,0,i*.45,0))}/* tuyết đọng trên mép tán */}
    T.add(G.cone12,'#24493b',MX(X,base+h-2.9,Z,.8,2.6,.8));
    const sR=hy=>{let m=0;for(let i=0;i<tiers;i++){const t=i/tiers,r=rad(t),th=6.4-t*3.4,ty=base+t*(h-3.2);if(hy>=ty&&hy<=ty+th*.64)m=Math.max(m,r*1.04*(ty+th*.64-hy)/(th*.64));if(hy>=ty+th*.1&&hy<=ty+th)m=Math.max(m,r*.86*(ty+th-hy)/(th*.9))}return m};/* bán kính mặt tán thật ở độ cao hy, để châu và đèn bám sát lá */
    {const sy=base+h-.9;for(let k=0;k<5;k++){const q=k/5*Math.PI*2;for(const pl of [0,1]){const m=pl?MX(X,sy+Math.cos(q)*.55,Z+Math.sin(q)*.55,.24,1.1,.24,q,0,0):MX(X+Math.sin(q)*.55,sy+Math.cos(q)*.55,Z,.24,1.1,.24,0,0,-q);S.add(G.cone12,'#d6b878',m)}}
      S.add(G.sph,'#e3c88c',MX(X,sy,Z,.45));XL.add(G.sph,'#fff0c4',MX(X,sy,Z,.7))}
    const hs=i=>{const v=Math.sin(i*127.1+311.7)*43758.5453;return v-Math.floor(v)};
    for(let i=0;i<tiers-1;i++){const t=i/tiers,r=rad(t),ty=base+t*(h-3.2)+.5,n=Math.max(4,Math.round(r*2.2));
      for(let k=0;k<n;k++){const q=k/n*Math.PI*2+i*.6+hs(i*31+k)*.3,rr=sR(ty)+.12,c=['#9e2b2b','#c8a24e','#efe6d2','#9e2b2b','#c8a24e'][(i+k)%5];XS.add(G.sph,c,MX(X+Math.cos(q)*rr,ty,Z+Math.sin(q)*rr,.3+hs(k+i*7)*.12))}}
    for(let i=0;i<460;i++){const t=i/460,q=t*Math.PI*2*13+1.3,hy=base+.2+t*(h-3.4),r=sR(hy)+.12;XL.add(G.sphLo,i%9===0?'#ff9a86':i%4?'#ffd18a':'#fff1d0',MX(X+Math.cos(q)*r,hy,Z+Math.sin(q)*r,.12))}
    block(X,Z,8.8);warm(X,y+6,Z+9,34,40);
    for(let i=0;i<12;i++){const q=i/12*6.28+.2,rr=9.3+hs(i)*.6,sz=.6+hs(i+40)*.5;XS.b(['#9e2b2b','#efe6d2','#c8a24e','#2f5a4a'][i%4],X+Math.cos(q)*rr,y+sz/2,Z+Math.sin(q)*rr,sz,sz,sz,q);XS.b('#d6b878',X+Math.cos(q)*rr,y+sz/2,Z+Math.sin(q)*rr,sz+.02,sz+.02,.1,q)}}
  // Làng Lapland: các nhà theo VH, cửa quay về cây thông và hồ băng, lối lát đá từ cửa ra vòng quảng trường
  // Kiến trúc nhà Làng Lapland (ảnh tham khảo 12): gỗ súc nâu ấm trên chân đá, mái dốc phủ tuyết dày, hiên cột gỗ tròn, khung cửa sổ đỏ trầm.
  // Nhà chính: mặt bằng chữ thập, lõi đá và gỗ súc, tầng tháp gỗ sồi có dải cửa sổ sáng ấm và ban công lan can đỏ, mái loe rộng,
  // chóp nhọn trắng rất cao có cột thu lôi; mặt trước và sau chóp gắn huy hiệu riêng của Xứ Yên (vòng vàng champagne, lục giác xanh thông).
  const LOG='#bf915f',LOGD='#9c7046',STONE='#9a948c',RED='#9e2b2b',OAK='#c99d70',FRAME='#7a5434';/* gỗ thông xử lý sáng (tấm 14) */
  const logWall=(cx,y0,cz,w,h,d)=>{S.b(LOG,cx,y0+h/2,cz,w,h,d);for(let yy=y0+.3;yy<y0+h-.1;yy+=.34){S.b(LOGD,cx,yy,cz+d/2+.02,w+.12,.06,.05);S.b(LOGD,cx,yy,cz-d/2-.02,w+.12,.06,.05);S.b(LOGD,cx+w/2+.02,yy,cz,.05,.06,d+.12);S.b(LOGD,cx-w/2-.02,yy,cz,.05,.06,d+.12)}
    for(const sx of [-1,1])for(const sz of [-1,1])S.add(G.cyl,LOG,MX(cx+sx*(w/2),y0+h/2,cz+sz*(d/2),.2,h,.2))};
  const snowRoof=(cx,y0,cz,w,rh,len,rot)=>{S.add(G.prism,OAK,MX(cx,y0-.12,cz,w+1.1,rh+.25,len+.9,0,rot,0));S.add(G.prism,SNOW,MX(cx,y0+.02,cz,w+1.3,rh+.45,len+1.1,0,rot,0))};/* mái tuyết dày, lộ viền gỗ sồi dưới mép */
  const win=(x,y,z,ry,w,h)=>{S.b(FRAME,x,y,z,w+.24,h+.24,.1,ry);L.b('#ffd79a',x+Math.sin(ry)*.04,y,z+Math.cos(ry)*.04,w,h,.05,ry);S.b(FRAME,x+Math.sin(ry)*.07,y,z+Math.cos(ry)*.07,.07,h,.04,ry);S.b(FRAME,x+Math.sin(ry)*.07,y,z+Math.cos(ry)*.07,w,.07,.04,ry)};
  function mainHall(v){const y=H(v.x,v.z);S.at(v.x,y,v.z,v.ry);L.at(v.x,y,v.z,v.ry);
    S.b(STONE,0,.6,0,9.8,1.2,9.8);logWall(0,1.2,0,9,3.2,9);
    S.add(G.pyr4,OAK,MX(0,5.15,0,6.2*1.414,1.7,6.2*1.414));S.add(G.pyr4,SNOW,MX(0,5.3,0,6.4*1.414,1.8,6.4*1.414));/* mái lõi loe */
    S.b(STONE,0,5.6,0,6.4,1.2,6.4);S.b(OAK,0,7.2,0,6,2.4,6);for(let k=0;k<4;k++){const q=k*Math.PI/2;for(let i=-1.5;i<=1.5;i++){const fx=Math.sin(q)*3.02+Math.cos(q)*i*1.3,fz=Math.cos(q)*3.02-Math.sin(q)*i*1.3;S.b('#8a6244',fx,7.25,fz,1.1,1.4,.08,q);L.b('#ffd79a',fx+Math.sin(q)*.03,7.25,fz+Math.cos(q)*.03,.9,1.2,.04,q);S.b('#8a6244',fx+Math.sin(q)*.06,7.25,fz+Math.cos(q)*.06,.06,1.2,.03,q)}}/* dải cửa sổ tầng tháp */
    S.b(RED,0,6.35,3.55,4.4,.1,.1);for(let i=-2;i<=2;i++)S.b(RED,i*1.05,5.95,3.55,.1,.8,.1);S.b(OAK,0,5.55,3.3,4.6,.14,.8);/* ban công lan can đỏ */
    S.add(G.pyr4,OAK,MX(0,9.05,0,4.9*1.414,1.5,4.9*1.414));S.add(G.pyr4,SNOW,MX(0,9.2,0,5.1*1.414,1.6,5.1*1.414));/* mái tháp loe rộng */
    const sp0=9.6,sh=9.6,sw=2.1;S.add(G.pyr4,'#eef0f2',MX(0,sp0+sh/2,0,sw*1.414,sh,sw*1.414));S.add(G.cyl12,'#d6b878',MX(0,sp0+sh+.1,0,.16,.3,.16));S.add(G.cyl,'#9a958e',MX(0,sp0+sh+1.3,0,.04,2.4,.04));S.add(G.sph,'#d6b878',MX(0,sp0+sh+2.5,0,.1));
    {const ey=sp0+2.2,hw=sw*(1-(ey-sp0)/sh)+.05,t=Math.atan(sw/sh);for(let k=0;k<4;k+=2){const q=k*Math.PI/2,ex=Math.sin(q)*hw,ez=Math.cos(q)*hw;/* huy hiệu Xứ Yên ở mặt trước và mặt sau chóp */
      S.add(G.cyl12,'#d6b878',MX(ex,ey,ez,.95,.05,.95,Math.PI/2-t,q,0));S.add(G.cyl12,IVORY,MX(ex+Math.sin(q)*.03,ey+.01,ez+Math.cos(q)*.03,.8,.05,.8,Math.PI/2-t,q,0));S.add(G.cyl6,'#2f5a4a',MX(ex+Math.sin(q)*.06,ey+.02,ez+Math.cos(q)*.06,.45,.05,.45,Math.PI/2-t,q,0));S.add(G.cyl6,IVORY,MX(ex+Math.sin(q)*.09,ey+.03,ez+Math.cos(q)*.09,.18,.05,.18,Math.PI/2-t,q,0))}}
    XL.add(G.sph,'#fff0c4',MX(0,sp0+sh+2.5,0,.25));
    for(const sx of [-1,1]){const cx=sx*8.3;S.b(STONE,cx,.3,0,7.8,.6,7.4);logWall(cx,.6,0,7.6,3,7);snowRoof(cx,3.6,0,7,2.6,7.8,Math.PI/2);/* hai cánh nhà thấp */
      for(const wx of [-2.4,0,2.4])win(cx+wx,2.1,3.53,0,1,1.2);S.add(G.cyl6,'#5c5550',MX(cx+sx*1.8,6.2,-1.2,.45,1.6,.45))}
    S.b(STONE,0,.3,-8.2,7.4,.6,7.6);logWall(0,.6,-8.2,7,3,7.2);snowRoof(0,3.6,-8.2,7,2.6,7.4,0);/* cánh sau */
    {const pz=7.1;S.b(STONE,0,.35,pz,6.2,.7,4.6);for(const sx of [-2.3,2.3])for(const sz of [-1.6,1.6]){S.add(G.cyl12,OAK,MX(sx,2.3,pz+sz,.34,3.3,.34));S.add(G.cyl12,STONE,MX(sx,.85,pz+sz,.5,.3,.5))}/* hiên cổng cột gỗ tròn to */
      for(const sx of [-2.3,2.3])S.add(G.cyl12,OAK,MX(sx,4,pz,.24,4.2,.24,Math.PI/2,0,0));S.add(G.cyl12,OAK,MX(0,4.05,pz+2.1,.24,5,.24,0,0,Math.PI/2));
      snowRoof(0,4.1,pz,5.6,2.4,4.8,0);for(const sd of [-1,1])S.add(G.cyl12,OAK,MX(sd*1.4,4.8,pz+2.45,.16,3.1,.16,0,0,sd*1.0));/* giàn kèo gỗ tròn đầu hồi */
      for(let k=0;k<4;k++)S.b('#a9b0b9',0,.62-k*.17,pz+2.6+k*.45,4.6,.17,.45);S.b('#4a3424',0,3.2,pz+2.25,2.6,.6,.12);S.add(G.cyl6,'#d6b878',MX(0,3.2,pz+2.33,.22,.04,.22,Math.PI/2,0,0));/* bậc thềm, biển gỗ */
      S.b('#3b2a20',0,1.7,4.53,1.6,2.4,.1);L.b('#ffd08a',0,3.1,4.55,1.4,.5,.04);for(const sx of [-1,1])win(sx*2.9,2.3,4.53,0,1.1,1.3)}
    for(const sx of [-1,1]){stringLights(L,sx*4.6,3.5,4.2,sx*12.2,3.5,4.2,14,.08);stringLights(L,sx*3.2,8.1,3.4,-sx*3.2,8.1,3.4,10,0)}stringLights(L,-2.9,4.05,9.6,0,6.6,9.6,6,0);stringLights(L,2.9,4.05,9.6,0,6.6,9.6,6,0);/* dây đèn nhà chính */
    for(const sx of [-1,1]){S.b(STONE,sx*8.3,.5,5,7.8,1,.6);S.b(RED,sx*8.3,1.35,5,7.8,.1,.1);for(let i=0;i<9;i++)S.b(RED,sx*8.3-3.6+i*.9,1.05,5,.08,.6,.08)}/* lan can đỏ trên kè đá */
    S.reset();L.reset();const sn=Math.sin(v.ry),cs=Math.cos(v.ry);block(v.x,v.z,6);for(const sx of [-8.3,8.3])block(v.x+cs*sx,v.z-sn*sx,4.4);block(v.x-sn*8.2,v.z-cs*8.2,4.2);block(v.x+sn*7.1,v.z+cs*7.1,2.4)}
  // Bộ sưu tập nhà làng (tấm 14): nhà hàng và café hai tầng có ban công, cửa hàng lưu niệm có tủ kính, chalet lưu trú ban công gỗ,
  // nhà nhỏ ống khói đá, nhà ngắm cảnh chữ A mặt kính. Đầu hồi có kèo gỗ lộ, vòng nguyệt quế chỉ hiện ở bản Giáng sinh.
  function gableTimber(w,y0,rh,z){const a=Math.atan2(rh,w/2),L0=Math.hypot(w/2,rh);for(const sd of [-1,1])S.b(FRAME,sd*w/4,y0+rh/2,z,L0,.16,.1,0,0,-sd*a);S.b(FRAME,0,y0+rh/2,z,.14,rh,.1);S.b(FRAME,0,y0+.08,z,w,.14,.1);for(const sd of [-1,1])S.b(FRAME,sd*w*.16,y0+rh*.3,z,.1,rh*.55,.08,0,0,-sd*.5)}
  // ống khói đá lớn cho chuyến xe trao Yên: thân đá xếp lớp, miệng rộng mở tối, gờ phủ tuyết; lưu vị trí miệng để thả quà
  function chimney(cx,cz,y0,y1){const hh=y1-y0,c0='#a39d95',c1='#8b857d',rim='#6e6862';S.b(c0,cx,y0+hh/2,cz,1.5,hh,1.5);for(let k=0;k*.45<hh-.2;k++)S.b(k%2?c1:'#b1aba3',cx,y0+.3+k*.45,cz,1.56,.07,1.56);
    for(const sd of [-1,1]){S.b(rim,cx,y1+.13,cz+sd*.8,1.95,.28,.36);S.b(rim,cx+sd*.8,y1+.13,cz,.36,.28,1.25);S.b(SNOW,cx,y1+.31,cz+sd*.8,1.9,.09,.32);S.b(SNOW,cx+sd*.8,y1+.31,cz,.32,.09,1.25)}
    S.b('#1b1816',cx,y1+.05,cz,1.26,.06,1.26);XL.T=S.T;for(let i=0;i<8;i++){const a=i/8*Math.PI*2;XL.add(G.sphLo,'#ffd08a',MX(cx+Math.cos(a)*1.05,y1+.42,cz+Math.sin(a)*1.05,.075))}XL.reset();
    _lv.set(cx,y1+.3,cz).applyMatrix4(S.T);CHIMNEYS.push({x:_lv.x,y:_lv.y,z:_lv.z})}
  function logHouse(v){const y=H(v.x,v.z),k=v.k||'cottage',w=v.w,d=v.d,two=k==='cafe'||k==='chalet',h=two?5.4:v.h;S.at(v.x,y,v.z,v.ry);L.at(v.x,y,v.z,v.ry);
    if(k==='aframe'){const H0=7.6;S.b(STONE,0,.3,0,w+.6,.6,d+.6);S.add(G.prism,OAK,MX(0,.55,0,w+.5,H0+.2,d+.6));S.add(G.prism,SNOW,MX(0,.7,0,w+.9,H0+.35,d+.4));/* nhà ngắm cảnh chữ A */
      L.add(G.prism,'#ffd9a0',MX(0,.65,d/2+.33,w*.88,H0*.88,.05));const a=Math.atan2(H0,w/2),L0=Math.hypot(w/2,H0);for(const sd of [-1,1])S.b(FRAME,sd*w/4,.6+H0/2,d/2+.38,L0,.2,.14,0,0,-sd*a);
      S.b(FRAME,0,.6+H0*.42,d/2+.38,.12,H0*.84,.08);for(const hy of [2.4,4.6])S.b(FRAME,0,.6+hy,d/2+.38,w*(1-hy/H0),.12,.08);S.b(OAK,0,.65,d/2+1.4,w*.8,.14,2);for(let i=-3;i<=3;i++)S.b(OAK,i*w*.13,1.15,d/2+2.35,.08,.9,.08);S.b(OAK,0,1.6,d/2+2.35,w*.8,.08,.1);
      {const cx=w*.2;chimney(cx,-d*.2,.6,.55+(H0+.2)*(1-cx/((w+.5)/2))+1.9)}
      S.reset();L.reset();block(v.x,v.z,Math.max(w,d)*.55);return}
    S.b(STONE,0,.45,0,w+.4,.9,d+.4);logWall(0,.9,0,w,h,d);const rh=w*.62;snowRoof(0,.9+h,0,w,rh,d,0);gableTimber(w,.9+h,rh,d/2+.12);
    XS.add(WREATH,'#2f5a4a',MX(0,.9+h+rh*.38,d/2+.25,.8,.8,1));XS.b('#9e2b2b',0,.9+h+rh*.38-.4,d/2+.27,.22,.22,.06);/* vòng nguyệt quế */
    chimney(w*.3,-d*.15,.9+h,.9+h+rh*.4+2.1);/* ống khói đá thả quà */
    const dz=d/2+.06;S.b('#4a3424',0,2,dz,1.2,2.2,.1);L.b('#ffd08a',0,2.7,dz+.01,.6,.6,.03);
    if(k==='shop'){for(const sx of [-1,1]){win(sx*w*.3,2,dz,0,1.6,1.5);S.b(FRAME,sx*w*.3,1.1,dz+.15,1.9,.12,.4)}S.b('#4a3424',0,3.55,dz+.08,w*.55,.55,.1);S.add(G.cyl6,'#d6b878',MX(0,3.55,dz+.15,.2,.04,.2,Math.PI/2,0,0))}/* tủ kính, biển hiệu */
    else for(const sx of [-1,1])win(sx*w*.3,2.1,dz,0,1,1.15);
    if(two){for(const sx of [-1,0,1])win(sx*w*.3,4.3,dz,0,.85,1.05);S.b(OAK,0,3.25,dz+.55,w*.8,.16,1.1);S.b(OAK,0,4.05,dz+1.05,w*.8,.08,.08);for(let i=0;i<=8;i++)S.b(OAK,-w*.4+i*w*.1,3.65,dz+1.05,.07,.7,.07);for(const sx of [-1,1])S.b(FRAME,sx*w*.38,2.6,dz+.9,.14,1.3,.14,0,.5*sx,0)}/* ban công gỗ, công-xon */
    for(const sz of [-.25,.25])for(const sx of [-1,1]){win(sx*(w/2+.06),2.1,sz*d,sx*Math.PI/2,.9,1);if(two)win(sx*(w/2+.06),4.3,sz*d,sx*Math.PI/2,.8,.9)}
    {const pz=d/2+1.1;for(const sx of [-1.2,1.2])S.add(G.cyl12,OAK,MX(sx,1.75,pz+.4,.17,1.9,.17));S.b(OAK,0,2.75,pz+.4,2.9,.14,.2);S.add(G.prism,SNOW,MX(0,2.75,pz-.1,3.3,1,2.4));S.b(OAK,0,2.68,pz-.1,3.1,.06,2.2)}/* mái hiên cột tròn */
    for(let i=0;i<3;i++)S.b('#a9b0b9',0,.6-i*.2,d/2+1.7+i*.42,1.8,.2,.42);
    if(k==='cafe')XL.add(G.sph,'#ffd896',MX(0,2.4,d/2+1.5,.18));
    for(const sx of [-1,1]){stringLights(L,sx*(w/2+.62),.9+h-.12,-d/2-.5,sx*(w/2+.62),.9+h-.12,d/2+.5,Math.round(d*1.6),.08);stringLights(L,sx*(w/2+.6),.9+h-.05,d/2+.58,0,.9+h+rh+.3,d/2+.58,Math.round(w*1.2),0)}/* dây đèn viền mái và đầu hồi */
    S.reset();L.reset();block(v.x,v.z,Math.max(w,d)*.55)}
  for(const v of VH){const sn=Math.sin(v.ry),cs=Math.cos(v.ry);if(v.k==='main')mainHall(v);else logHouse(v);
    if(v.k==='cafe')for(const k of [-1.8,1.8]){const bx=v.x+cs*k+sn*(v.d/2+3.2),bz=v.z-sn*k+cs*(v.d/2+3.2),by=H(bx,bz);S.add(G.cyl12,'#a07a56',MX(bx,by+.45,bz,.5,.06,.5));S.b('#a07a56',bx,by+.22,bz,.1,.45,.1);S.b('#c5a36f',bx,by+1.6,bz,1.4,.06,1.4)}}
  for(let i=0;i<12;i++){const a=i/12*Math.PI*2+.13;/* ghế gỗ quanh gốc cây thông */
    if(i%3===1){const bx=TREE.x+Math.cos(a+.26)*11,bz=TREE.z+Math.sin(a+.26)*11,by=H(bx,bz),br=-a-.26+Math.PI/2;S.b('#a07a56',bx,by+.45,bz,1.8,.1,.5,br);S.b(SNOW,bx,by+.53,bz,1.7,.05,.45,br);S.b('#a07a56',bx,by+.8,bz,1.8,.5,.08,br)}}
  {const x=TREE.x+4.6,z=TREE.z+16.8,y=H(x,z);S.b('#8a6a4a',x,y+1.7,z,.16,3.4,.16);/* cột biển chỉ đường */
    [['Quảng Trường',.4],['Chợ Mùa Đông',2.6],['Café',-.9],['Cửa Hàng',2.0],['Rừng Kính',-.3]].forEach(([n,a],i)=>{S.b('#b8906a',x+Math.cos(a)*.7,y+3-i*.45,z-Math.sin(a)*.7,1.5,.32,.08,a)});S.b(SNOW,x,y+3.45,z,.25,.1,.25)}
  for(const v of VH)warm(v.x+Math.sin(v.ry)*6,4,v.z+Math.cos(v.ry)*6,10,18);
  
  // ---------- 4 Khu Vui Chơi Giáng Sinh: ngựa gỗ, vòng quay, bếp lửa kota, người tuyết ----------
  // Vòng xoay ngựa gỗ theo tấm 10: mái sọc đỏ trắng hai tầng, diềm lượn, cột giữa gương vàng, 12 ngựa gỗ ngà và sồi nhấp nhô trên cột vàng.
  // Đèn trên mái và trên vòng quay chỉ bật ở bản Giáng sinh (xmasOnly).
  const xmasOnly=[],CRR=5.6,horses=[];
  const carousel=new THREE.Group();{const CB=new Batch(),CL=new Batch(),y=H(CAR.x,CAR.z);
    CB.add(G.cyl12,'#e9e0cf',MX(0,.25,0,CRR+.4,.5,CRR+.4));CB.add(G.cyl12,'#c5a36f',MX(0,.52,0,CRR+.45,.06,CRR+.45));CB.add(G.cyl12,'#8c2f2a',MX(0,.56,0,CRR-.2,.04,CRR-.2));
    for(let k=0;k<2;k++)CB.b('#b4bbc4',0,.1,CRR+.65+k*.45,2.4,.2-k*.08,.5);/* bậc lên */
    CB.add(G.cyl12,'#d6b878',MX(0,3,0,1.1,4.8,1.1));CB.add(G.cyl12,'#efe6d6',MX(0,3,0,1.14,3.4,1.14));for(let i=0;i<8;i++){const q=i/8*6.28;CB.b('#c5a36f',Math.cos(q)*1.13,3,Math.sin(q)*1.13,.12,3.4,.12,-q)}/* cột giữa */
    CB.add(G.cyl12,'#8c2f2a',MX(0,5.55,0,CRR+.5,.5,CRR+.5));/* vành mái */
    for(let i=0;i<16;i++){const q=(i+.5)/16*6.28;CB.add(G.sph,i%2?'#efe6d6':'#8c2f2a',MX(Math.cos(q)*(CRR+.45),5.2,Math.sin(q)*(CRR+.45),.62,.42,.62))}/* diềm lượn */
    for(let i=0;i<12;i++){const q=i/12*6.28,g=new THREE.ConeGeometry(CRR+.7,2.3,2,1,true,q,6.28/12);CB.add(g.toNonIndexed(),i%2?'#efe6d6':'#8c2f2a',MX(0,6.9,0,1))}/* mái 12 múi sọc đỏ trắng */
    CB.add(G.cyl12,'#efe6d6',MX(0,8.25,0,1.6,.6,1.6));CB.add(G.cone12,'#8c2f2a',MX(0,9.1,0,1.9,1.2,1.9));CB.add(G.cyl,'#d6b878',MX(0,10,0,.06,.8,.06));CB.add(G.sph,'#d6b878',MX(0,10.45,0,.24));CB.add(G.cone,'#c8a96a',MX(0,10.85,.0,.18,.5,.18));
    for(let i=0;i<12;i++){const q=i/12*6.28;CB.add(G.cyl,'#d6b878',MX(Math.cos(q)*(CRR-.15),3,Math.sin(q)*(CRR-.15),.07,4.8,.07))}/* cột viền */
    for(let i=0;i<48;i++){const q=i/48*6.28;CL.add(G.sphLo,i%4?'#ffd896':'#fff0c8',MX(Math.cos(q)*(CRR+.78),5.55,Math.sin(q)*(CRR+.78),.1))}
    for(let i=0;i<24;i++){const q=i/24*6.28;CL.add(G.sphLo,'#ffe2a8',MX(Math.cos(q)*(CRR+.1)*.8,7.1,Math.sin(q)*(CRR+.1)*.8,.08))}
    const cl=CL.mesh(GLOW);xmasOnly.push(cl);carousel.add(CB.mesh(LAM),cl);
    const hg=(()=>{const HB=new Batch(),c='#efe6d6';HB.add(G.sph,c,MX(0,0,0,.28,.3,.62));HB.add(G.cyl,c,MX(0,.38,.48,.12,.55,.14,-.55,0,0));HB.add(G.sph,c,MX(0,.66,.66,.13,.14,.27,.3,0,0));
      HB.add(G.box,'#c5a36f',MX(0,.5,.4,.05,.5,.22,-.55,0,0));/* bờm */HB.add(G.box,'#8c2f2a',MX(0,.28,0,.5,.08,.42));HB.add(G.box,'#d6b878',MX(0,.33,0,.52,.03,.44));
      for(const sx of [-1,1]){HB.add(G.cyl,c,MX(sx*.13,-.18,.35,.05,.5,.05,-.9,0,0));HB.add(G.cyl,c,MX(sx*.13,-.38,-.38,.05,.55,.05,.35,0,0))}HB.add(G.cyl,'#c5a36f',MX(0,.02,-.68,.05,.45,.05,.9,0,0));return HB})();
    const hgeo=[hg.geo()];
    for(let i=0;i<12;i++){const q=i/12*6.28+.26,r=i%2?CRR-1.4:CRR-2.6,m=new THREE.Mesh(hgeo[0],LAM);m.position.set(Math.cos(q)*r,1.7,Math.sin(q)*r);m.rotation.y=-q;m.scale.setScalar(1.25);m.userData={q,r,ph:i*1.3};carousel.add(m);horses.push(m)
      const pole=new THREE.Mesh(G.cyl,new THREE.MeshLambertMaterial({color:'#d6b878'}));pole.position.set(Math.cos(q)*r,3.05,Math.sin(q)*r);pole.scale.set(.05,4.9,.05);carousel.add(pole)}
    carousel.position.set(CAR.x,y,CAR.z);sc.add(carousel);block(CAR.x,CAR.z,CRR+.6);warm(CAR.x,y+3,CAR.z+7,10,18)}
  // đu quay lớn theo tấm 10: vành champagne, 12 cabin luôn thẳng đứng, quay rất chậm (khoảng 80 giây một vòng)
  const WR=9.2,WY=11,wheel=new THREE.Group(),gondolas=[];{const y=H(WHEEL.x,WHEEL.z);
    for(const sz of [-1.5,1.5])for(const sx of [-1,1])S.add(G.cyl,'#e9e0cf',MX(WHEEL.x+sx*3,y+WY/2,WHEEL.z+sz,.2,WY+.6,.2,0,0,-sx*.27));S.b('#d6b878',WHEEL.x,y+WY,WHEEL.z,.4,.4,3.4);
    S.b('#a07a56',WHEEL.x,y+.5,WHEEL.z+3.6,3.4,1,2.2);S.b(SNOW,WHEEL.x,y+1.02,WHEEL.z+3.6,3.3,.06,2.1);for(let k=0;k<3;k++)S.b('#b4bbc4',WHEEL.x,y+.12+k*.0,WHEEL.z+5+k*.4,2,.24-k*.07,.45);/* sàn lên cabin */
    const WB=new Batch(),WL=new Batch();for(const z of [-1.1,1.1]){WB.add(new THREE.TorusGeometry(WR,.12,6,56).toNonIndexed(),'#d6b878',MX(0,0,z,1));WB.add(new THREE.TorusGeometry(WR*.82,.06,5,48).toNonIndexed(),'#efe6d6',MX(0,0,z,1));WB.add(new THREE.TorusGeometry(1.2,.14,6,18).toNonIndexed(),'#c8a96a',MX(0,0,z,1))}
    for(let i=0;i<24;i++){const a=i/24*6.28;for(const z of [-1.1,1.1])WB.add(G.box,'#efe6d6',MX(Math.cos(a)*WR/2,Math.sin(a)*WR/2,z,WR,.07,.07,0,0,a))}
    for(let i=0;i<12;i++){const a=i/12*6.28;WB.add(G.box,'#d6b878',MX(Math.cos(a)*WR,Math.sin(a)*WR,0,.1,.1,2.4))}
    for(let i=0;i<72;i++){const a=i/72*6.28;WL.add(G.sphLo,i%3?'#ffd896':'#fff0c8',MX(Math.cos(a)*WR,Math.sin(a)*WR,1.25,.11))}for(let i=0;i<24;i++){const a=i/24*6.28;for(let k=1;k<6;k++)WL.add(G.sphLo,'#ffe6b0',MX(Math.cos(a)*WR*k/6,Math.sin(a)*WR*k/6,1.2,.07))}
    WL.add(G.sph,'#fff0c4',MX(0,0,1.3,.5));const wl=WL.mesh(GLOW);xmasOnly.push(wl);wheel.add(WB.mesh(LAM),wl);
    const GB=new Batch();GB.b('#8c2f2a',0,-.75,0,1.4,.85,1.5);GB.b('#efe6d6',0,-.28,0,1.42,.1,1.52);GB.b('#d6b878',0,.15,0,.07,.7,.07);GB.add(G.cone,'#efe6d6',MX(0,.1,0,1.05,.5,1.05));GB.add(G.cone,'#8c2f2a',MX(0,.12,0,1.07,.5,1.07,0,.45,0));GB.add(G.cone,SNOW,MX(0,.2,0,.75,.3,.75));const gg=GB.geo();
    for(let i=0;i<12;i++){const g=new THREE.Mesh(gg,LAM);g.userData.a=i/12*6.28;wheel.add(g);gondolas.push(g)}
    wheel.position.set(WHEEL.x,y+WY,WHEEL.z);sc.add(wheel);block(WHEEL.x,WHEEL.z,4);warm(WHEEL.x,y+3,WHEEL.z+5,12,22)}
  function deerFig(B,col){const T0=B.T.clone(),add=(g,c,m)=>{B.T=T0;B.add(g,c,m)};add(G.sph,col,MX(0,.9,0,.3,.3,.62));add(G.cyl,col,MX(0,1.3,.45,.1,.6,.1,-.5,0,0));add(G.sph,col,MX(0,1.6,.62,.13,.13,.24));for(const sx of [-1,1]){for(const sz of [-.35,.35])add(G.cyl,col,MX(sx*.14,.45,sz,.05,.8,.05));add(G.cyl,'#c8a96a',MX(sx*.12,1.85,.55,.025,.45,.025,-.3,0,-sx*.4))}add(G.box,'#8c2f2a',MX(0,1.18,0,.5,.06,.4));B.T=new THREE.Matrix4()}
  // Khu Vui Chơi theo tấm 03: cổng vòm đỏ, sân khấu vòm gỗ bông tuyết
  {const ax=ARCH.x,az=ARCH.z,y=H(ax,az);S.at(ax,y,az,ARCH.ry);L.at(ax,y,az,ARCH.ry);/* cổng đỏ giữa cây thông và hồ trượt băng */for(const sx of [-1,1]){S.b('#b8322c',sx*2.8,1.9,0,.6,3.8,.6);S.b('#e9e0cf',sx*2.8,.15,0,.9,.3,.9)}
    for(let i=0;i<14;i++){const t=i/13,a=Math.PI*t,x=-Math.cos(a)*2.8,yy=3.8+Math.sin(a)*1.4;S.b('#b8322c',x,yy,0,.62,.62,.62,0,0,a-Math.PI/2);if(i%2===0)L.add(G.sphLo,'#ffd27a',MX(x,yy+.42,.32,.09))}
    S.b('#f1eee5',0,4.25,.35,3.4,.7,.06);S.b(SNOW,0,5.3,0,1.4,.18,.8);S.reset();L.reset();for(const sx of [-2.8,2.8]){const [bx,bz]=archW(sx,0);block(bx,bz,.5)}}
  {const sx0=RH.x+1,sz0=RH.z+16,y=H(sx0,sz0);S.at(sx0,y,sz0,0);L.at(sx0,y,sz0,0);/* sân khấu dời về phía nam Nhà Ấm tròn */S.add(G.cyl12,'#a07a56',MX(0,.3,0,4.2,.6,4.2));S.add(G.cyl12,'#98745A',MX(0,.62,0,4.1,.04,4.1));/* sân khấu tròn */
    for(let i=0;i<=16;i++){const a=Math.PI*i/16,x=-Math.cos(a)*3.6,yy=.6+Math.sin(a)*3.6;S.b('#b8906a',x,yy,-2,.5,.5,.5,0,0,a);L.add(G.sphLo,'#ffd27a',MX(x*.92,yy*.95,-1.7,.08))}
    for(let k=0;k<3;k++){const a=k*Math.PI/3;L.b('#bfe6ff',0,2.6,-1.9,.12,2.4,.05,0,0,a)}S.reset();L.reset();block(sx0,sz0,4.4);warm(sx0,y+3,sz0+3,8,14)}
  for(const [lx,lz,c] of [[4.2,.8,'#b8322c'],[4.9,-.4,'#c5a36f'],[-4.2,.6,'#2f5b48']]){const [gx,gz]=archW(lx,lz),y=H(gx,gz);XS.b(c,gx,y+.35,gz,.7,.7,.7,.4);XS.b('#f1eee5',gx,y+.35,gz,.72,.72,.12,.4)}
  // Hồ Trượt Băng theo tấm 04: nhà dịch vụ (trên trái), café kính ven sân (trên phải), góc sưởi (dưới phải), khung đèn trái tim (dưới trái)
  {const x=TREE.x+12.6,z=TREE.z+18,y=H(x,z);/* đống lửa dời từ cổng về cạnh quảng trường cây thông */for(let i=0;i<9;i++){const a=i/9*6.28;S.add(G.sph,'#8d8780',MX(x+Math.cos(a)*.75,y+.12,z+Math.sin(a)*.75,.2,.16,.2))}block(x,z,1);S.add(G.cyl12,'#9a7a5a',MX(x,y+.4,z,.5,.8,.5));L.add(G.cone12,'#ffae4a',MX(x,y+1.05,z,.35,.6,.35));for(const a of [0,2.1,4.2]){const bx=x+Math.cos(a)*2,bz=z+Math.sin(a)*2;S.b('#a07a56',bx,H(bx,bz)+.4,bz,1.6,.12,.5,-a+Math.PI/2)}warm(x,y+1.5,z,6,10)}
  // Nhà Ấm tròn ở khu vui chơi (ảnh 15), phía tây đu quay và vòng xoay ngựa gỗ: 12 cạnh, chân đá, vòng cửa kính lớn sáng ấm,
  // cột gỗ ngà, mái nón thấp rộng phủ tuyết, lầu kính bát giác trên đỉnh đội chóp xanh ngọc cực quang; ghế băng và bàn dã ngoại ngoài sân.
  {const X=RH.x,Z=RH.z,y=H(X,Z),R0=8,N=12,ry0=Math.atan2(CAR.x-X,CAR.z-Z);S.at(X,y,Z,ry0);L.at(X,y,Z,ry0);
    S.add(new THREE.CylinderGeometry(R0+.35,R0+.5,.8,N).toNonIndexed(),STONE,MX(0,.4,0,1));
    for(let i=0;i<N;i++){const a0=i/N*Math.PI*2,a1=(i+1)/N*Math.PI*2,am=(a0+a1)/2,cw=2*R0*Math.sin(Math.PI/N),px=Math.sin(am)*R0*Math.cos(Math.PI/N),pz=Math.cos(am)*R0*Math.cos(Math.PI/N);
      L.b('#ffd79a',px,2.35,pz,cw-.35,3,.06,am);for(const f of [-.25,.25])S.b('#8a6244',px+Math.cos(am)*f*cw,2.35,pz-Math.sin(am)*f*cw,.06,3,.1,am);S.b('#8a6244',px,2.35,pz,cw-.3,.06,.1,am);S.b('#8a6244',px,1.2,pz,cw-.3,.2,.14,am);
      const cx=Math.sin(a0)*R0,cz=Math.cos(a0)*R0;S.add(G.cyl12,'#efe6d6',MX(cx,2.45,cz,.2,3.4,.2))}
    S.add(new THREE.CylinderGeometry(R0+.2,R0+.2,.7,N).toNonIndexed(),OAK,MX(0,4.3,0,1));
    S.add(new THREE.CylinderGeometry(.01,R0+1.6,2.8,N,1,true).toNonIndexed(),OAK,MX(0,5.95,0,1));S.add(new THREE.CylinderGeometry(.01,R0+1.75,3,N,1,true).toNonIndexed(),SNOW,MX(0,6.12,0,1));/* mái nón thấp rộng */
    S.add(new THREE.CylinderGeometry(1.45,1.45,.3,8).toNonIndexed(),'#2f5a4a',MX(0,6.9,0,1));for(let i=0;i<8;i++){const a=i/8*Math.PI*2,px=Math.sin(a+Math.PI/8)*1.34,pz=Math.cos(a+Math.PI/8)*1.34;L.b('#ffe2a8',px,7.65,pz,.9,1.1,.05,a+Math.PI/8);S.add(G.cyl,'#2f5a4a',MX(Math.sin(a)*1.45,7.65,Math.cos(a)*1.45,.07,1.3,.07))}/* lầu kính bát giác */
    S.add(new THREE.CylinderGeometry(.01,1.95,.9,8).toNonIndexed(),SNOW,MX(0,8.7,0,1));S.add(new THREE.CylinderGeometry(.01,1.1,4.6,8).toNonIndexed(),'#3aa996',MX(0,10.9,0,1));S.add(G.sph,'#d6b878',MX(0,13.3,0,.16));S.add(G.cyl,'#d6b878',MX(0,13.8,0,.03,.9,.03));/* chóp xanh ngọc */
    XL.add(G.sph,'#bff5e8',MX(0,13.3,0,.24));
    for(let i=0;i<N;i++){const a0=i/N*Math.PI*2,a1=(i+1)/N*Math.PI*2;stringLights(L,Math.sin(a0)*(R0+1.5),4.55,Math.cos(a0)*(R0+1.5),Math.sin(a1)*(R0+1.5),4.55,Math.cos(a1)*(R0+1.5),6,.12)}/* dây đèn viền mái, chỉ bản Giáng sinh */
    S.b('#3b2a20',0,1.95,R0*Math.cos(Math.PI/N)+.1,1.6,2.4,.12);for(let k=0;k<3;k++)S.b('#a9b0b9',0,.62-k*.2,R0+.7+k*.45,2.6,.2,.45);/* cửa chính quay về vòng xoay ngựa gỗ */
    for(const [a,r,kind] of [[.6,12,'b'],[-.6,12,'b'],[1.9,12.5,'t'],[2.5,13,'t'],[-2.2,12.5,'t']]){const bx=Math.sin(a)*r,bz=Math.cos(a)*r,br=a+Math.PI;
      if(kind==='b'){S.b('#a07a56',bx,.45,bz,1.9,.1,.5,br);S.b(SNOW,bx,.53,bz,1.8,.05,.45,br);S.b('#a07a56',bx,.8,bz-.0,1.9,.5,.08,br)}
      else{S.b('#a07a56',bx,.78,bz,1.9,.08,.9,br);for(const sd of [-.75,.75])S.b('#a07a56',bx+Math.cos(br)*0+Math.sin(br)*sd,.42,bz+Math.cos(br)*sd,1.9,.07,.3,br);S.b(SNOW,bx,.84,bz,1.8,.04,.8,br)}}/* ghế băng, bàn dã ngoại */
    S.reset();L.reset();block(X,Z,R0+.7);warm(X,y+2.5,Z,10,20)}
  kota(-50,92,3,'#a8805c');{const fx=-44,fz=82,y=H(fx,fz);const fire=new THREE.Group();const fl=new THREE.Mesh(new THREE.ConeGeometry(.35,1,7),new THREE.MeshBasicMaterial({color:'#ffae4a',fog:false}));fl.position.y=.6;fire.add(fl);
    for(let i=0;i<8;i++){const a=i/8*6.28;S.add(G.sph,'#5e5a56',MX(fx+Math.cos(a)*1,y+.1,fz+Math.sin(a)*1,.2,.15,.2))}fire.position.set(fx,y,fz);sc.add(fire);block(fx,fz,1.3);var fireFl=fl;var fireLight=warm(fx,y+1.2,fz,14,14);
    for(const a of [0.6,1.57,2.6,3.6,4.6,5.6])S.b('#7a5a3e',fx+Math.cos(a)*2.6,y+.35,fz+Math.sin(a)*2.6,1.4,.3,.4,-a+Math.PI/2)}
  for(const [sx,sz,k] of [[...archW(3.6,1.6),1],[-40,74,.8],[SNOWMAN.x,SNOWMAN.z,2.4]]){const y=H(sx,sz);S.add(G.sph,SNOW,MX(sx,y+.7*k,sz,.9*k));S.add(G.sph,SNOW,MX(sx,y+1.85*k,sz,.62*k));S.add(G.sph,SNOW,MX(sx,y+2.7*k,sz,.42*k));S.add(G.cone,'#e07a3a',MX(sx,y+2.7*k,sz+.5*k,.07*k,.35*k,.07*k,Math.PI/2,0,0));S.b('#8c2f2a',sx,y+2.3*k,sz,.9*k,.16*k,.9*k);S.add(G.cyl,'#2b2622',MX(sx,y+3.15*k,sz,.3*k,.4*k,.3*k));block(sx,sz,k)}
  {for(let i=0;i<7;i++){const a=Math.PI*(.4+i/6*1.2),r=4.2+(i%3)*.6,x=SNOWMAN.x+Math.cos(a)*r,z=SNOWMAN.z+Math.sin(a)*r,q=.35+(i%3)*.18;S.add(G.sph,SNOW,MX(x,H(x,z)+q*.8,z,q))}/* bãi đắp người tuyết: người tuyết lớn, quả cầu tuyết lăn dở quanh đó */}
  {const n=56,GA=Math.atan2(ARCH.z-RINK.z,ARCH.x-RINK.x),pt=i=>{const a=i/n*Math.PI*2,k=RSH(a);return [RINK.x+Math.cos(a)*(RINK.rx*k+1),RINK.z+Math.sin(a)*(RINK.rz*k+1)]};
    for(let i=0;i<96;i++){const a=i/96*Math.PI*2,x=RINK.x+Math.cos(a)*(RINK.rx+.45),z=RINK.z+Math.sin(a)*(RINK.rz+.45);S.b(SNOW,x,H(x,z)+.08,z,.9,.22,1.05,-a)}/* gờ tuyết ôm viền sân *//* sân trượt băng: hàng rào gỗ + đèn */
    for(let i=0;i<n;i++){const am=(i+.5)/n*Math.PI*2;if(Math.abs(Math.atan2(Math.sin(am-GA),Math.cos(am-GA)))<.17)continue;const [x0,z0]=pt(i),[x1,z1]=pt(i+1),mx=(x0+x1)/2,mz=(z0+z1)/2,ln=Math.hypot(x1-x0,z1-z0),ry=Math.atan2(-(z1-z0),x1-x0),y=H(mx,mz);
      S.b('#9a7a5a',mx,y+.75,mz,ln,.1,.1,ry);S.b('#9a7a5a',mx,y+.4,mz,ln,.08,.08,ry);S.b('#7a5a40',x0,y+.5,z0,.14,1,.14);for(const t of [.25,.75])bulb(x0+(x1-x0)*t,y+.83,z0+(z1-z0)*t)}}
  // ---------- 1 Rừng Kính: lều kính vòm dọc bờ bắc Hồ Băng ----------
  // lều kính vòm trắc địa (khung tam giác) trên sàn gỗ sát bờ hồ, bên trong đèn vàng ấm, bậc thềm, ghế gỗ phủ tuyết (theo ảnh mẫu 27/11)
  const glassMat=new THREE.MeshPhongMaterial({color:'#cfe2ff',specular:'#ffffff',shininess:120,transparent:true,opacity:.2,depthWrite:false,side:THREE.DoubleSide});
  const glowMat=new THREE.MeshBasicMaterial({color:'#ffb866',transparent:true,opacity:.22,depthWrite:false,side:THREE.BackSide,blending:THREE.AdditiveBlending,fog:false});
  // 3 lều ngắm cực quang theo bộ thiết kế Rừng Kính: vòm kính khung tối, vách sau gỗ sồi, sàn gỗ, nội thất ấm (Lều Rừng Thông · Lều Đồi Tuyết · Lều Bờ Hồ)
  const DR=4,RIB='#33383d',geo=new THREE.SphereGeometry(DR,28,12,0,Math.PI*2,0,Math.PI/2).toNonIndexed();
  const ribM=new THREE.TorusGeometry(DR+.03,.055,4,28,Math.PI).toNonIndexed(),ribR=[[.0,1],[.5,Math.cos(Math.PI/6)],[.966,.26]].map(([sy,cr])=>[sy*DR,new THREE.TorusGeometry(DR*cr+.03,.05,4,36).rotateX(Math.PI/2).toNonIndexed()]);
  const glassB=new Batch(),glowB=new Batch();
  IGLOOS.forEach(([x,z],idx)=>{const y=H(x,z)+.5,r=DR,ry=Math.atan2(LAKE.x-x,LAKE.z-z);S.at(x,y,z,ry);L.at(x,y,z,ry);
    // Lều Kính Tròn (tấm mới): vòm kính trọn vẹn, khung mảnh tối chia múi, vòng nhỏ ở đỉnh, sàn gỗ tròn sáng màu, bậc thềm rộng; bên trong tối giản
    S.add(G.cyl12,'#8d8a85',MX(0,-.55,0,r+1.5,.5,r+1.5));S.add(G.cyl12,OAK,MX(0,-.2,0,r+1.3,.5,r+1.3));S.add(G.cyl12,'#d8b48a',MX(0,.04,0,r+1.25,.04,r+1.25));
    for(let k=0;k<6;k++)S.add(ribM,RIB,MX(0,.06,0,1,1,1,0,k*Math.PI/6,0));for(const [ry2,rg] of ribR)S.add(rg,RIB,MX(0,.06+ry2,0,1));S.add(G.cyl12,'#5c6066',MX(0,r+.02,0,.55,.12,.55));/* khung, vòng đỉnh */
    S.add(G.cyl12,'#e9e2d6',MX(0,.08,-.3,2.1,.04,2.1));/* thảm tròn */
    S.b('#b8906a',0,.4,-1.3,2.6,.35,2.2);S.b(IVORY,0,.68,-1.3,2.4,.25,2.0);S.b(IVORY,-.6,.88,-2.2,.8,.22,.4);S.b(IVORY,.6,.88,-2.2,.8,.22,.4);S.b('#d5c7ad',0,.83,-.6,2.45,.06,.7);S.b('#b8906a',0,1.1,-2.45,2.7,1.3,.15);/* giường lớn */
    for(const sx of [-1.75,1.75]){S.add(G.cyl12,OAK,MX(sx,.35,-2.1,.3,.6,.3));L.add(G.sph,'#ffcf86',MX(sx,.85,-2.1,.15))}/* bàn nhỏ, đèn bàn */
    S.b('#d5c7ad',1.7,.45,.9,.9,.5,.85);S.b('#d5c7ad',1.95,.85,.9,.15,.6,.85);S.add(G.cyl12,OAK,MX(.7,.4,1.1,.35,.5,.35));/* ghế bành, bàn trà */
    for(const sx of [-1,1])S.b('#f4f1ea',sx*2.9,1.6,-1.6,.12,2.6,.7,sx*.5);/* rèm trắng mỏng vén hai bên */
    for(let i=0;i<3;i++)S.b(OAK,0,-.25-i*.22,r+1.55+i*.5,3.6-i*.1,.22,.6);/* bậc thềm rộng */
    L.add(G.sph,'#ffe2b0',MX(0,2.6,-.6,.16));
    S.reset();L.reset();
    glassB.T=MX(x,y+.06,z,1);glassB.add(geo,'#ffffff',new THREE.Matrix4());glowB.T=MX(x,y+.06,z,1);glowB.add(geo,'#ffffff',MX(0,0,0,.96));
    if(idx===1){const [lx,lz]=toLake([x,z],1);const dx=lx-x,dz=lz-z;for(let k=0;k<12;k++){const sx=x+dx*(r+2.6+k*.85),sz=z+dz*(r+2.6+k*.85),sy=H(sx,sz);S.b('#9aa2ac',sx,sy+.12,sz,2.2,.3,1,Math.atan2(-dz,dx)+Math.PI/2);if(k%3===1){lantern(sx+dz*1.6,sz-dx*1.6,1.1);lantern(sx-dz*1.6,sz+dx*1.6,1.1)}}}/* bậc đá xuống đồi */
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
  /* không vẽ dải đèn dọc tuyến đường: tuyến husky, xe trượt, dốc trượt chỉ in trên nền tuyết */
  // ---------- 7 đảo nhỏ trồng thông giữa hồ, cầu gỗ cong nối bờ ----------
  // Đảo ngắm cực quang (tấm 07 mới): viền đá phủ tuyết, vài cây thông phía sau, sân tròn, ghế băng cong thấp, bậc thềm, kính thiên văn đồng
  {const X=ISLE.x,Z=ISLE.z,y=H(X,Z),fa=Math.atan2(-.3,-.95);/* hướng ra cầu */
    for(let k=0;k<30;k++){const a=k/30*6.283,r=ISLE.r*(1.02+.12*Math.sin(k*2.7)),sz=.45+.25*((k*7)%5)/5;S.add(G.sphLo,k%3?'#b6b2ab':'#c4c0b9',MX(X+Math.cos(a)*r,ICE_Y+.15,Z+Math.sin(a)*r,sz*1.3,sz*.7,sz));S.add(G.sphLo,SNOW,MX(X+Math.cos(a)*r,ICE_Y+.15+sz*.45,Z+Math.sin(a)*r,sz*1.05,sz*.3,sz*.8))}
    for(const [a,r,h] of [[fa+Math.PI-.5,ISLE.r*.72,6.5],[fa+Math.PI+.15,ISLE.r*.78,8],[fa+Math.PI+.75,ISLE.r*.7,5]])pine(T,X+Math.cos(a)*r,Z+Math.sin(a)*r,h);
    const cx=X+Math.cos(fa)*1.2,cz=Z+Math.sin(fa)*1.2;S.add(G.cyl12,'#c9c5be',MX(cx,y+.35,cz,3.4,.7,3.4));S.add(G.cyl12,SNOW,MX(cx,y+.72,cz,3.25,.06,3.25));
    for(let i=0;i<3;i++){const r=3.6+i*.55;S.b('#cbc7c0',cx+Math.cos(fa)*r,y+.55-i*.2,cz+Math.sin(fa)*r,.6,.2,2.2,-fa)}
    for(let i=0;i<9;i++){const a=fa+Math.PI-1.1+i*2.2/8,r=2.6;S.b('#d4d0c9',cx+Math.cos(a)*r,y+1.05,cz+Math.sin(a)*r,.55,.12,1.05,-a);S.b('#c4c0b9',cx+Math.cos(a)*r,y+.88,cz+Math.sin(a)*r,.45,.3,.9,-a)}
    {const tx=cx+Math.cos(fa+.9)*2,tz=cz+Math.sin(fa+.9)*2;S.add(G.cyl,'#5c5550',MX(tx,y+1.3,tz,.08,1.2,.08));S.add(G.cyl12,'#b08a4a',MX(tx,y+2.05,tz,.13,1.3,.13,0,0,1.1));S.add(G.cyl12,'#c5a36f',MX(tx-.45,y+2.3,tz,.17,.25,.17,0,0,1.1))}
    block(X,Z,ISLE.r)}
  for(let k=0;k<3;k++){const a=k*2.1+.5;lantern(ISLE.x+Math.cos(a)*ISLE.r*.95,ISLE.z+Math.sin(a)*ISLE.r*.95,1.3)}
  {let dx=-.95,dz=-.3;const l=Math.hypot(dx,dz);dx/=l;dz/=l;const ax=ISLE.x+dx*ISLE.r*1.05,az=ISLE.z+dz*ISLE.r*1.05;let len=2;while(len<60&&lakeE(ax+dx*len,az+dz*len)<1.08)len+=.5;
    const ry=Math.atan2(-dz,dx),n=Math.ceil(len/1.05);let sc=len*.8,bd=1e9;for(let q=0;q<=len;q+=.25){const x=ax+dx*q,z=az+dz*q;for(const w of SLOOP){const d=Math.hypot(w[0]-x,w[1]-z);if(d<bd){bd=d;sc=q}}}/* chỗ tuyến xe trượt chạy dưới cầu: cầu vồng cao lên để xe lọt qua */
    // Cầu theo ảnh 16: mặt cầu và lan can gỗ sồi sáng, trụ lan can vuông có tuyết trên đầu, dầm vòm và mố trụ đá xám nhạt trơn, ít chi tiết.
    const yAt=q=>ICE_Y+.45+Math.sin(Math.PI*q/len)*1.1+2.3*Math.exp(-Math.pow((q-sc)/6,2)),STN='#c9c5be',STN2='#b8b4ad',DECK='#dcc29a',RAIL='#d2b384';
    for(let i=0;i<n;i++){const t=(i+.5)/n,q=len*t,x=ax+dx*q,z=az+dz*q,y=yAt(q),y2=yAt(Math.min(len,q+len/n)),y1=yAt(Math.max(0,q-len/n)),pit=Math.atan2(y2-y1,2*len/n);
      S.add(G.box,STN,MX(x,y-.32,z,len/n+.04,.5,2.5,0,ry,pit));S.add(G.box,DECK,MX(x,y,z,len/n+.02,.14,2.8,0,ry,pit));S.add(G.box,SNOW,MX(x,y+.08,z,len/n*.95,.03,1.9,0,ry,pit));
      for(const sd of [-1.3,1.3]){const rx=x+Math.sin(ry)*sd,rz=z+Math.cos(ry)*sd;S.add(G.box,RAIL,MX(rx,y+.95,rz,len/n+.02,.12,.14,0,ry,pit));S.add(G.box,RAIL,MX(rx,y+.5,rz,len/n+.02,.09,.09,0,ry,pit));
        if(i%2===0){S.b(RAIL,rx,y+.55,rz,.2,1.1,.2,ry);S.b(SNOW,rx,y+1.13,rz,.24,.08,.24,ry)}}}
    for(const q of [0,len,Math.max(1,sc-4.2),Math.min(len-1,sc+4.2)]){const x=ax+dx*q,z=az+dz*q,y=yAt(q);S.b(STN2,x,(ICE_Y+y-.5)/2,z,1.4,y-.5-ICE_Y,2.7,ry);S.b(SNOW,x,ICE_Y+.06,z,1.6,.1,2.9,ry)}/* mố và trụ đá trơn */
  }
  // ---------- 9 Đỉnh Tuyết Yên: nhà nghỉ trên đỉnh, cáp treo, cờ, dốc trượt ----------
  // Nhà ngắm cảnh mái tam giác (tấm 09): nhà chữ A, mặt trước kính tam giác lớn khung gỗ sồi sáng, một mái lợp kính, nền đá tự nhiên, sàn hiên lan can mảnh
  {const x=SKI.x,z=SKI.z-8,y=H(x,z),w=8.5,d=9,h=8,a=Math.atan2(h,w/2),Lr=Math.hypot(w/2,h);S.at(x,y,z,0);L.at(x,y,z,0);
    for(let k=0;k<14;k++){const t=k/14*6.283,r=6.6+((k*5)%3)*.5,sz=1.1+((k*3)%4)*.3;S.add(G.sphLo,k%2?'#a29d96':'#8f8a84',MX(Math.cos(t)*r,.2,Math.sin(t)*r*.9,sz*1.4,sz,sz))}
    S.add(G.cyl12,'#9a958e',MX(0,.35,0,6.8,.9,6.2));S.b('#c99d70',0,.85,.6,12,.16,11);
    for(const [px,pz,lx,lz] of [[0,6.1,12,.06],[-6,.6,.06,11],[6,.6,.06,11]]){S.b('#b8906a',px,1.75,pz,lx,.07,lz);for(let i=-5;i<=5;i+=2.5)S.b('#b8906a',px?px:i,1.3,pz?(px?i*.9+.6:pz):pz,.08,.9,.08)}
    S.add(G.prism,'#c99d70',MX(0,.95,-d/2+.1,w,h,.2));L.add(G.prism,'#ffd9a0',MX(0,1.05,d/2-.15,w*.9,h*.9,.05));
    for(const sd of [-1,1]){S.b(sd<0?'#a9c8dc':'#c99d70',sd*w/4,.95+h/2,0,Lr,.22,d,0,0,-sd*a);if(sd>0)S.b(SNOW,w/4+.14,1.02+h/2,0,Lr,.12,d+.1,0,0,-a);
      S.b('#b8906a',sd*w/4,.95+h/2,d/2,Lr,.24,.3,0,0,-sd*a)}
    for(const sx of [-1.4,0,1.4])S.b('#b8906a',sx,.95+(h-Math.abs(sx)*h/(w/2))/2,d/2+.02,.12,h-Math.abs(sx)*h/(w/2)-.2,.08);for(const hy of [2.6,5])S.b('#b8906a',0,.95+hy,d/2+.02,w*(1-hy/h)-.3,.12,.08);
    S.reset();L.reset();block(x,z,7.5)}
  // biển gỗ "Khu Trượt Tuyết" hình núi, mái nhỏ phủ tuyết, ở chân dốc
  {const x=SKI.x-12,z=-54,y=H(x,z);S.at(x,y,z,0);for(const sx of [-1.3,1.3])S.b('#b8906a',sx,1.6,0,.25,3.2,.25);S.b('#c99d70',0,2.3,0,2.4,1,.16);S.b('#8a6a4a',0,3.3,0,3.2,.14,.9);S.b(SNOW,0,3.45,0,3.3,.2,1);S.add(G.pyr4,'#f1eee5',MX(0,2.95,.12,.5,.45,.05));S.reset();block(x,z,1.6)}
  // cọc đỏ trắng nối dây hai bên tuyến trượt
  for(const r of SKIRUNS)for(let k=0;k+1<r.length;k++){const [x0,z0]=r[k],[x1,z1]=r[k+1],ln=Math.hypot(x1-x0,z1-z0),nx=-(z1-z0)/ln,nz=(x1-x0)/ln,n=Math.max(1,Math.round(ln/3.5));
    for(let i=0;i<n;i++){const t=i/n;for(const sd of [-5,5]){const px=x0+(x1-x0)*t+nx*sd,pz=z0+(z1-z0)*t+nz*sd,py=H(px,pz);S.b(i%2?'#f1eee5':'#b8322c',px,py+.6,pz,.1,1.2,.1);S.b('#9a958e',px+(x1-x0)/n/2,py+1.05,pz+(z1-z0)/n/2,.03,.03,ln/n,Math.atan2(x1-x0,z1-z0))}}}
  {const [[ax,az],[bx,bz]]=LIFT,ln=Math.hypot(bx-ax,bz-az),ry=Math.atan2(-(bz-az),bx-ax),n=6;const top=[];for(let i=0;i<=n;i++){const t=i/n,x=ax+(bx-ax)*t,z=az+(bz-az)*t,y=H(x,z);S.b('#5a5f68',x,y+3,z,.25,6,.25);S.b('#5a5f68',x,y+6,z,.2,.2,2.4,ry);top.push([x,y+5.9,z])}
    for(let i=0;i<n;i++){const [x0,y0,z0]=top[i],[x1,y1,z1]=top[i+1],mx=(x0+x1)/2,my=(y0+y1)/2,mz=(z0+z1)/2,l=Math.hypot(x1-x0,y1-y0,z1-z0),pitch=Math.atan2(y1-y0,Math.hypot(x1-x0,z1-z0));
      for(const sd of [-1,1]){S.add(G.box,'#2b2622',MX(mx+Math.sin(ry)*sd,my,mz+Math.cos(ry)*sd,l,.05,.05,0,ry,pitch));S.b('#c99d70',mx+Math.sin(ry)*sd,my-1.1,mz+Math.cos(ry)*sd,.9,.12,.6,ry);S.b('#2b2622',mx+Math.sin(ry)*sd,my-.55,mz+Math.cos(ry)*sd,.05,1.1,.05)}}}
  {const walk=(pts)=>{for(let k=0;k+1<pts.length;k++){const [x0,z0]=pts[k],[x1,z1]=pts[k+1],ln=Math.hypot(x1-x0,z1-z0),ry=Math.atan2(-(z1-z0),x1-x0),n=Math.max(1,Math.ceil(ln/1.1));
      for(let i=0;i<n;i++){const t=(i+.5)/n,x=x0+(x1-x0)*t,z=z0+(z1-z0)*t,y=Math.max(H(x,z),ICE_Y)+.25;S.b('#98745A',x,y,z,ln/n*.9,.12,2,ry);S.b(SNOW,x,y+.08,z,ln/n*.6,.03,1.8,ry)}}};/* lối sàn gỗ ven hồ nối 3 lều */
    const shore=[];for(let a=-1.3;a<=.12;a+=.06)shore.push(lakeShore(a,2.6));walk(shore);shore.forEach((q,i)=>{if(i%5===2)lantern(...toLake(q,-1.6),1.3)});
    for(const q of IGLOOS){const f=toLake(q,DR+2.4);let best=shore[0],bd=1e9;for(const w of shore){const dd=Math.hypot(w[0]-f[0],w[1]-f[1]);if(dd<bd){bd=dd;best=w}}if(bd>1.5)walk([f,best])}}
  // ---------- 6 Hồ Băng & Xe Trượt: cầu gỗ bờ tây, xe trượt tuyết đỏ chạy chậm, đèn băng ----------
  
  // tuyến trượt băng nét đứt xanh chạy vòng trên mặt hồ (tấm 07 mới)
  for(let i=0;i<SLOOP.length;i+=6){const [x0,z0]=SLOOP[i],[x1,z1]=SLOOP[(i+3)%SLOOP.length];S.b('#9fd0e6',(x0+x1)/2,ICE_Y+.03,(z0+z1)/2,.3,.02,Math.hypot(x1-x0,z1-z0)*.8,Math.atan2(x1-x0,z1-z0))}
  function kickSled(B){B.b('#8c2f2a',0,.5,.2,.55,.08,.5);B.b('#8c2f2a',0,.75,-.05,.55,.5,.06);for(const sx of [-.22,.22]){B.b('#2b2622',sx,.05,-.2,.04,.04,2.2);B.b('#2b2622',sx,.55,-.35,.04,1.1,.04,0,.2);B.b('#2b2622',sx,1.05,-.4,.04,.04,.3)}B.b('#2b2622',0,1.08,-.48,.5,.04,.04)}
  function snowmobile(B){B.b('#2b2622',0,.25,-.5,.9,.4,1.8);B.b('#b8322c',0,.55,.2,1,.45,1.6);B.add(G.sph,'#b8322c',MX(0,.6,1,.5,.35,.6));B.b('#1d1a18',0,.82,-.35,.6,.18,1.1);B.b('#9fc4dd',0,1.0,.55,.7,.4,.05,0,-.5);for(const sx of [-.45,.45])B.b('#2b2622',sx,.05,1.2,.12,.06,1.2);B.b('#c8a96a',0,.95,.25,.8,.05,.05);L.reset()}
  // 3 xe trượt băng kiểu xe kéo Bắc Âu, ba cỡ: nhỏ 1 chỗ (ngà), vừa 2 chỗ (đỏ trầm), lớn 4 chỗ (gỗ sồi, đệm xanh thông).
  // Luật chạy: mọi xe chạy một chiều trên vòng sát bờ; xe sau giữ cách xe trước ít nhất 9 m (chậm lại khi gần);
  // xe chỉ vào vòng khi khoảng trống quanh điểm nhập đủ rộng; người lái bấm vào bờ thì xe ghé bờ chỗ đó và cho xuống.
  // Lúc vắng, xe có người khác lái chạy một vòng rồi về bến, nhưng luôn chừa ít nhất 1 xe ở bến cho mình.
  function sleigh(B,k){const L0=[2.2,3,4.2][k],W=[1,1.3,1.6][k],body=['#efe6d6','#8c2f2a','#c99d70'][k],seat=['#8c2f2a','#efe6d6','#2f5a4a'][k],trim='#d6b878';
    for(const sx of [-W/2+.08,W/2-.08]){B.b('#3a3430',sx,.06,0,.07,.06,L0+.3);B.add(G.cyl12,'#3a3430',MX(sx,.32,L0/2+.15,.26,.05,.26,0,0,Math.PI/2));for(const z of [-L0*.3,L0*.3])B.b('#3a3430',sx,.28,z,.06,.44,.06)}/* càng trượt cong mũi */
    B.b(body,0,.62,0,W,.38,L0);B.b(trim,0,.82,0,W+.04,.04,L0+.04);
    B.b(body,0,1.05,L0/2-.15,W,.5,.3,-.35,0,0);B.add(G.cyl12,body,MX(0,1.25,L0/2-.05,W/2,.12,W/2,0,0,Math.PI/2));B.b(trim,0,1.33,L0/2-.02,W*.9,.04,.12);/* mũi cong */
    const rows=[1,1,2][k];for(let r=0;r<rows;r++){const z=-L0/2+.55+r*1.6;B.b(seat,0,.86,z+.25,W-.16,.12,.8);B.b(body,0,1.25,z-.12,W,.75,.14);B.b(seat,0,1.2,z-.04,W-.2,.55,.06)}
    B.b(trim,0,1.64,-L0/2+.42,W*.9,.04,.08);for(const sx of [-1,1])B.b(body,sx*(W/2-.03),.98,-L0/2+.9,.06,.32,1.1)}
  const sleds=[0,1,2].map(k=>{const g=new THREE.Group(),B=new Batch();sleigh(B,k);g.add(B.mesh(LAM));
    const npc=new THREE.Group();{const c=new THREE.Mesh(new THREE.CylinderGeometry(.3,.4,.8,10),new THREE.MeshLambertMaterial({color:['#2f5a4a','#c5a36f','#8c2f2a'][k]}));c.position.y=1.3;npc.add(c);const h=new THREE.Mesh(new THREE.SphereGeometry(.22,10,8),new THREE.MeshLambertMaterial({color:'#e7c9a8'}));h.position.y=1.92;npc.add(h);const hat=new THREE.Mesh(new THREE.ConeGeometry(.24,.34,10),new THREE.MeshLambertMaterial({color:'#efe6d6'}));hat.position.y=2.15;npc.add(hat);npc.position.z=-[2.2,3,4.2][k]/2+.75;npc.visible=false;g.add(npc)}
    const d=SDOCK[k],ry=Math.atan2(d.m[0]-d.p[0],d.m[1]-d.p[1]);g.position.set(d.p[0],ICE_Y,d.p[1]);g.rotation.y=ry;sc.add(g);
    return {k,g,npc,st:'park',s:0,v:0,from:null,to:null,exitS:null,exit:null,rider:null,wait:15+k*22,len:[2.2,3,4.2][k],seatZ:-[2.2,3,4.2][k]/2+.75}});
  const SLL=(()=>{const c=[0];for(let i=1;i<=SLOOP.length;i++){const a=SLOOP[i-1],b=SLOOP[i%SLOOP.length];c.push(c[i-1]+Math.hypot(b[0]-a[0],b[1]-a[1]))}return c})(),STOT=SLL[SLOOP.length];
  const sAt=s=>{s=((s%STOT)+STOT)%STOT;let i=0,j=SLOOP.length;while(j-i>1){const m=(i+j)>>1;if(SLL[m]<=s)i=m;else j=m}const a=SLOOP[i],b=SLOOP[(i+1)%SLOOP.length],t=(s-SLL[i])/(SLL[i+1]-SLL[i]);return [a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,Math.atan2(b[0]-a[0],b[1]-a[1]),a[2]]};
  const sNear=(x,z)=>{let bi=0,bd=1e9;SLOOP.forEach((q,i)=>{const d=Math.hypot(q[0]-x,q[1]-z);if(d<bd){bd=d;bi=i}});return SLL[bi]};
  const fwd=(a,b)=>((b-a)%STOT+STOT)%STOT;/* quãng đường xuôi chiều từ a tới b */
  const gapFree=(s0,me0)=>sleds.every(o=>o===me0||o.st!=='loop'||(fwd(o.s,s0)>14&&fwd(s0,o.s)>9));/* điểm nhập trống: không xe nào sắp tới trong 14 m hay vừa qua trong 9 m */
  let mySled=null;
  const sledStart=(o,rider)=>{o.rider=rider;o.npc.visible=rider==='npc';o.from=[o.g.position.x,o.g.position.z];const d=SDOCK[o.k];o.to=d.m;o.mS=sNear(...d.m);o.exitS=fwd(0,o.mS-6);o.exit={dock:true};o.st='merge';o.v=0;o.laps=0};
  let sledK=1;window.__sledFast=k=>{sledK=k;return STOT};
  function sledTick(dt0){const dt=dt0*sledK;for(const o of sleds){const g=o.g;
      if(o.st==='park'){if(o.rider==null&&(o.wait-=dt)<0){o.wait=40+Math.random()*50;if(sleds.filter(q=>q.st==='park').length>=2)sledStart(o,'npc')}continue}
      if(o.st==='merge'||o.st==='leave'){const [tx,tz]=o.to,dx=tx-g.position.x,dz=tz-g.position.z,d=Math.hypot(dx,dz);
        if(o.st==='merge'&&d<1.2&&!gapFree(o.mS,o)){o.v=0;continue}
        o.v=Math.min(3,o.v+dt*3);const st=Math.min(d,o.v*dt);if(d>.05){g.position.x+=dx/d*st;g.position.z+=dz/d*st;let ry=Math.atan2(dx,dz),dr=ry-g.rotation.y;dr=Math.atan2(Math.sin(dr),Math.cos(dr));g.rotation.y+=dr*Math.min(1,dt*4)}
        if(d<.1){if(o.st==='merge'){o.st='loop';o.s=o.mS}else{
          if(o.exit.dock){o.st='park';o.rider=null;o.npc.visible=false;const d0=SDOCK[o.k];g.rotation.y=Math.atan2(d0.m[0]-d0.p[0],d0.m[1]-d0.p[1])}
          else{if(o===mySled){mySled=null;const [lx,lz]=o.exit.land;stand();P.x=lx;P.z=lz;P.a=g.rotation.y;caption('🛷 Đã ghé bờ. Xe tự chạy về bến.',4000)}o.rider=null;o.npc.visible=false;o.from=null;o.to=[...SLOOP[0]];o.to=[...sAt(sNear(g.position.x,g.position.z)+5)].slice(0,2);o.mS=sNear(...o.to);const d0=SDOCK[o.k];o.exitS=fwd(0,sNear(...d0.m)-6);o.exit={dock:true};o.st='merge';o.v=0}}}continue}
      if(o.st==='loop'){let vmax=o.rider==='me'?5.5:4.5;if(P.mode==='walk'){const fx=o.g.position.x+Math.sin(o.g.rotation.y)*2.5,fz=o.g.position.z+Math.cos(o.g.rotation.y)*2.5;if(Math.hypot(P.x-fx,P.z-fz)<3.2)vmax=0}/* nhường người đi bộ trên băng */for(const q of sleds)if(q!==o&&q.st==='loop'){const ahead=fwd(o.s,q.s);if(ahead<16)vmax=Math.min(vmax,Math.max(0,(ahead-9)/7)*q.v+(ahead>9?.6:0))}/* giữ khoảng cách xe trước */
        o.v+=(vmax-o.v)*Math.min(1,dt*1.8);const ns=o.s+o.v*dt,hit=o.exitS!=null&&fwd(o.s,o.exitS)<=o.v*dt+.01&&(o.rider!=='npc'||o.laps>0||fwd(o.mS,o.s)>STOT*.5);
        if(fwd(o.mS,ns)<fwd(o.mS,o.s))o.laps++;o.s=ns%STOT;const [x,z,ry]=sAt(o.s);g.position.set(x,ICE_Y,z);let dr=ry-g.rotation.y;dr=Math.atan2(Math.sin(dr),Math.cos(dr));g.rotation.y+=dr*Math.min(1,dt*6);
        if(hit){o.st='leave';o.v=Math.min(o.v,3);o.to=o.exit.dock?SDOCK[o.k].p:o.exit.water}}}}
  // bấm vào bờ khi đang ngồi xe: xe chạy tiếp tới điểm gần chỗ bấm nhất trên vòng rồi rẽ vào bờ
  function sledLand(x,z){const o=mySled;if(!o)return false;const a=Math.atan2(0,1);const s0=sNear(x,z),q=sAt(s0),aa=q[3],water=lakeShore(aa,-1.6),land=lakeShore(aa,1.8);
    o.exitS=fwd(0,s0);o.exit={water,land};if(o.st==='park'){}caption('🛷 Xe sẽ ghé bờ chỗ bạn chọn.',3500);return true}
  // ---------- 3 Rừng Thông & Husky ----------
  const huskyG=new THREE.Group();const dogs=[];{const DG=(()=>{const B=new Batch();const g='#8a8f98',w='#f1f1ee';B.add(G.sph,g,MX(0,.5,0,.2,.2,.42));B.add(G.sph,w,MX(0,.42,.05,.16,.15,.35));B.add(G.sph,g,MX(0,.72,.42,.15,.14,.17));B.add(G.sph,w,MX(0,.66,.56,.08,.07,.1));for(const sx of [-1,1]){B.add(G.cone,g,MX(sx*.07,.9,.4,.04,.12,.04));for(const sz of [-.25,.25])B.add(G.cyl,w,MX(sx*.09,.2,sz,.04,.4,.04))}B.add(G.cyl,g,MX(0,.62,-.42,.05,.3,.05,-.9,0,0));return B.geo()})();
    for(let i=0;i<6;i++){const m=new THREE.Mesh(DG,LAM);m.position.set(i%2?.4:-.4,0,2.2+Math.floor(i/2)*1.2);huskyG.add(m);dogs.push(m)}
    const B=new Batch();B.b('#9a7a5a',0,.35,-.2,.9,.1,1.8);B.b('#c99d70',0,.6,-.1,.86,.5,1.2);B.b('#8f949a',0,.66,0,.7,.1,.9);for(const sx of [-.45,.45]){B.b('#2b2622',sx,.04,-.3,.05,.05,2.4);B.b('#2b2622',sx,.7,-1.05,.05,1.1,.05)}B.b('#2b2622',0,1.25,-1.05,.95,.05,.05);B.b('#7a5a40',0,.45,1.6,.03,.03,3.6);
    huskyG.add(B.mesh(LAM));sc.add(huskyG)}
  // nhà gỗ mở (chuồng, chòi nghỉ, xưởng): cột, vách sau, mái dốc phủ tuyết, dây đèn
  function openShed(x,z,ry,w,d,h,o){o=o||{};const y=H(x,z),col=o.col||'#98745a';S.at(x,y,z,ry);L.at(x,y,z,ry);
    S.b('#7a756e',0,.08,0,w+.4,.16,d+.4);S.b(col,0,h/2,-d/2+.15,w,h,.3);for(const sx of [-1,1])S.b(col,sx*(w/2-.15),h/2,0,.3,h,d);
    for(let i=0;i<=Math.round(w/2.4);i++){const px=-w/2+.2+i*(w-.4)/Math.round(w/2.4);S.b('#a8805c',px,h/2,d/2-.2,.26,h,.26);if(o.stalls&&i>0&&i<Math.round(w/2.4))S.b(col,px,.6,0,.12,1.2,d-.6)}
    const a=.6,rh=Math.tan(a)*(d/2+.5),Lr=(d/2+.6)/Math.cos(a);for(const sd of [-1,1]){S.b('#8a6a4a',0,h+rh/2,sd*(d/4+.15),w+.8,.2,Lr,sd*a,0,0);S.b(SNOW,0,h+rh/2+.22,sd*(d/4+.15),w+.9,.3,Lr+.05,sd*a,0,0)}
    if(o.chimney){S.b('#9a958e',w/2-1,h+rh*.6,-d*.2,.8,2.4,.8);S.b(SNOW,w/2-1,h+rh*.6+1.25,-d*.2,.95,.2,.95)}
    stringLights(L,-w/2-.4,h,d/2+.2,w/2+.4,h,d/2+.2,Math.round(w*1.6),.15);if(o.wreath){XS.T=S.T;XS.add(WREATH,'#2f5b48',MX(0,h+rh*.45,d/2+.35,1));XS.add(G.sphLo,'#a5302a',MX(0,h+rh*.45-.42,d/2+.4,.1));XS.reset()}
    S.reset();L.reset();block(x,z,Math.max(w,d)/2+.6)}
  // nhà kính mái gỗ (café ấm): khung gỗ, kính sáng vàng, mái tuyết
  function glassHouse(x,z,ry,w,d,h){const y=H(x,z);S.at(x,y,z,ry);L.at(x,y,z,ry);S.b('#8f98a3',0,.12,0,w+.6,.24,d+.6);
    L.b('#d9a868',0,h/2+.2,0,w-.2,h-.2,d-.2);S.b('#a8805c',0,h*.55,0,w+.05,.12,d+.05);for(let i=0;i<=4;i++){const t=-w/2+i*w/4;for(const sz of [-1,1])S.b('#a8805c',t,h/2+.2,sz*d/2,.16,h,.16)}for(let i=0;i<=3;i++){const t=-d/2+i*d/3;for(const sx of [-1,1])S.b('#a8805c',sx*w/2,h/2+.2,t,.16,h,.16)}
    for(const sz of [-1,1])S.b('#a8805c',0,h+.2,sz*d/2,w+.2,.2,.2);const a=.5,rh=Math.tan(a)*(d/2+.5),Lr=(d/2+.7)/Math.cos(a);
    for(const sd of [-1,1]){S.b('#8a6a4a',0,h+.2+rh/2,sd*(d/4+.2),w+1,.22,Lr,sd*a,0,0);S.b(SNOW,0,h+.42+rh/2,sd*(d/4+.2),w+1.1,.3,Lr+.05,sd*a,0,0)}
    stringLights(L,-w/2-.5,h+.25,d/2+.4,w/2+.5,h+.25,d/2+.4,Math.round(w*1.6),.12);S.reset();L.reset();block(x,z,Math.max(w,d)/2+.8)}
  // hàng rào gỗ thấp hai bên đường xe kéo, đèn lồng Bắc Âu cách quãng: tách đường xe với lối đi bộ
  function trailRails(pts,off,every){let acc=0;for(let i=0;i+1<pts.length;i++){const [ax,az]=pts[i],[bx,bz]=pts[i+1],len=Math.hypot(bx-ax,bz-az),ux=(bx-ax)/len,uz=(bz-az)/len,ang=Math.atan2(ux,uz),n=Math.max(1,Math.round(len/3));
    for(let k=0;k<n;k++){const t0=k/n,t1=(k+1)/n;for(const sd of [-1,1]){const x0=ax+(bx-ax)*t0-uz*off*sd,z0=az+(bz-az)*t0+ux*off*sd,x1=ax+(bx-ax)*t1-uz*off*sd,z1=az+(bz-az)*t1+ux*off*sd,mx=(x0+x1)/2,mz=(z0+z1)/2;
      S.b('#9a7a5a',x0,H(x0,z0)+.35,z0,.1,.7,.1);S.b('#b8906a',mx,H(mx,mz)+.55,mz,.06,.07,len/n,ang);S.b(SNOW,mx,H(mx,mz)+.62,mz,.1,.04,len/n,ang);bulb(mx,H(mx,mz)+.68,mz)}}}}
  // nhà gỗ sồi sáng có đầu hồi kính lớn khung gỗ chéo (nhà trại husky, nhà trang trại tuần lộc)
  function glassGable(x,z,ry,w,d,h,o){cabin(x,z,ry,Object.assign({w,d,h},o||{}));const y=H(x,z),rh=Math.tan(.72)*(w/2);S.at(x,y,z,ry);L.at(x,y,z,ry);
    L.b('#ffd9a0',0,h*.5,d/2+.05,w*.72,h*.92,.05);L.add(G.prism,'#ffd9a0',MX(0,h,d/2+.05,w*.62,rh*.72,.05));
    for(const sx of [-1,-.33,.33,1])S.b('#8a6a4a',sx*w*.36,h*.5,d/2+.1,.14,h*.92,.08);S.b('#8a6a4a',0,h,d/2+.1,w*.74,.16,.08);
    for(const sd of [-1,1])S.b('#8a6a4a',sd*w*.16,h+rh*.32,d/2+.1,.12,rh*.82,.08,0,0,-sd*.72);S.reset();L.reset()}
  // ---------- 05 Trại Husky (tấm mới): nhà đón khách, dãy mái che chuồng husky, bãi xuất phát xe chó kéo, cổng biển đầu husky ----------
  {glassGable(-1,-21,Math.PI/2,9,12,3.6);
    openShed(-1,-8.5,Math.PI/2,9,4,2.4,{stalls:true});
    const DG2=(x,z,r,lie)=>{const y=H(x,z);S.at(x,y,z,r);const g='#8a8f98',w='#f1f1ee';S.add(G.sph,g,MX(0,lie?.3:.5,0,.2,.2,.42));S.add(G.sph,w,MX(0,lie?.24:.42,.05,.16,.15,.35));S.add(G.sph,g,MX(0,lie?.45:.72,.42,.15,.14,.17));S.add(G.sph,w,MX(0,lie?.4:.66,.56,.08,.07,.1));for(const sx of [-1,1]){S.add(G.cone,g,MX(sx*.07,lie?.62:.9,.4,.04,.12,.04));if(!lie)for(const sz of [-.25,.25])S.add(G.cyl,w,MX(sx*.09,.2,sz,.04,.4,.04))}S.reset()};
    for(const [x,z,r,l] of [[-1.5,-10,1.6,1],[1.5,-9,1.2,1],[-3.5,-8,1.9,0],[3,-7.5,1.4,1],[16,-24,2.6,0],[17.2,-25.2,2.9,1]])DG2(x,z,r,l);
    // 3 Bãi xuất phát: bãi tuyết bầu dục rào gỗ thanh ngang, xe trượt gỗ tự nhiên đệm xám
    fence(16,-22,7,30,[1.66,4.25]);{const x=20,z=-24,y=H(x,z);S.at(x,y,z,.6);S.b('#c99d70',0,.35,-.2,.9,.1,1.9);S.b('#8f949a',0,.55,-.4,.8,.25,1);S.b('#c99d70',0,.8,-.95,.86,.6,.1);for(const sx of [-.45,.45]){S.b('#b8906a',sx,.04,-.2,.06,.06,2.4);S.b('#b8906a',sx,.6,-1.05,.06,1.1,.06)}S.reset()}
    // cổng biển gỗ "Trại Husky" có hình đầu husky, mái nhỏ phủ tuyết
    {const x=9,z=-6,y=H(x,z);S.at(x,y,z,.3);for(const sx of [-1.3,1.3])S.b('#b8906a',sx,1.6,0,.25,3.2,.25);S.b('#c99d70',0,2.3,0,2.4,1,.16);S.b('#8a6a4a',0,3.3,0,3.2,.14,.9);S.b(SNOW,0,3.45,0,3.3,.2,1);
      S.add(G.sph,'#8a8f98',MX(0,3.05,.14,.32,.28,.06));S.add(G.sph,'#f1f1ee',MX(0,2.98,.18,.18,.16,.05));for(const sx of [-1,1])S.add(G.cone,'#8a8f98',MX(sx*.18,3.36,.14,.07,.16,.04));S.reset();block(x,z,1.6)}
    /* đường husky không rào; bản Giáng sinh có đèn nhỏ hai bên */for(const t of HTRAILS)for(let i=0;i+1<t.length;i++){const [ax,az]=t[i],[bx,bz]=t[i+1],ln=Math.hypot(bx-ax,bz-az),ux=(bx-ax)/ln,uz=(bz-az)/ln,n=Math.max(1,Math.round(ln/3.2));for(let k=0;k<n;k++){const q=(k+.5)/n,x=ax+(bx-ax)*q,z=az+(bz-az)*q;for(const sd of [-1,1]){const px=x-uz*2.4*sd,pz=z+ux*2.4*sd;if(Math.hypot(px-16,pz+22)>7.6)bulb(px,H(px,pz)+.12,pz)}}}block(16,-22,7.5)}
  // ---------- 06 Trang Trại Tuần Lộc (vẽ lại theo ảnh mẫu 28/11): nhà gỗ đầu hồi kính, biển tuần lộc trắng, chân tường đá, hai cánh mái thấp; bãi bầu dục rào gỗ hai thanh; tuần lộc đeo đai đỏ; xe tuần lộc ông già Noel chờ xuất phát ----------
  {const FX=FARM.x,FZ=FARM.z,FRX=17,FRZ=11.5;
    // rào bầu dục hai thanh ngang, cột có mũ tuyết, cổng mở phía tây (đèn nhỏ chỉ sáng khi bật Giáng sinh)
    {const n=56,pt=i=>{const a=i/n*Math.PI*2;return [FX+Math.cos(a)*FRX,FZ+Math.sin(a)*FRZ]};
      for(let i=0;i<n;i++){const a=(i+.5)/n*Math.PI*2;if(Math.abs(Math.atan2(Math.sin(a-Math.PI),Math.cos(a-Math.PI)))<.16)continue;
        const [x0,z0]=pt(i),[x1,z1]=pt(i+1),mx=(x0+x1)/2,mz=(z0+z1)/2,ln=Math.hypot(x1-x0,z1-z0),ang=Math.atan2(x1-x0,z1-z0),y=H(mx,mz);
        S.b('#8f7258',x0,H(x0,z0)+.6,z0,.16,1.2,.16);S.b(SNOW,x0,H(x0,z0)+1.23,z0,.2,.07,.2);for(const hy of [.45,.95])S.b('#a07e5c',mx,y+hy,mz,.08,.12,ln+.1,ang);S.b(SNOW,mx,y+1.02,mz,.1,.04,ln,ang);
        for(const t of [.3,.7])bulb(x0+(x1-x0)*t,y+1.06,z0+(z1-z0)*t)}
      for(const sd of [-1,1]){const gz=FZ+sd*Math.sin(.16)*FRZ*1.05,gx=FX-FRX-.1,gy=H(gx,gz);S.b('#7a5a40',gx,gy+.8,gz,.24,1.6,.24);S.b(SNOW,gx,gy+1.63,gz,.3,.08,.3)}}
    // tuần lộc: lông xám nâu, ngực trắng, đai đỏ; con đứng, con gặm tuyết, con nằm
    const deer=(x,z,ry,mode)=>{const y=H(x,z),lie=mode==='lie',graze=mode==='graze',br='#8f7c66',dk='#4f4032',lt='#efe7d8',an='#cdb894',B=S;B.at(x,y-(lie?.62:0),z,ry);
      B.add(G.sph,br,MX(0,1.05,0,.4,.38,.8));B.add(G.sph,lt,MX(0,.98,.5,.33,.34,.26));B.add(G.sph,lt,MX(0,1.0,-.74,.16,.18,.08));
      const hy=graze?.55:1.6,hz=graze?.98:.88;B.add(G.cyl,lt,MX(0,(1.15+hy)/2+.05,(.55+hz)/2,.15,.72,.15,graze?1.1:-.5,0,0));B.add(G.sph,br,MX(0,hy,hz+.12,.16,.16,.28));B.add(G.sph,dk,MX(0,hy-.03,hz+.38,.07,.06,.06));
      for(const sx of [-1,1]){if(!lie)for(const sz of [-.45,.45])B.add(G.cyl,dk,MX(sx*.19,.45,sz,.055,.9,.055));else for(const sz of [-.4,.42])B.b(dk,sx*.3,.72,sz+.1,.12,.12,.5);
        const ax=sx*.1,ay=hy+.2,az=hz+.05;B.add(G.cyl,an,MX(ax+sx*.14,ay+.3,az-.08,.03,.75,.03,-.35,0,-sx*.45));B.add(G.cyl,an,MX(ax+sx*.4,ay+.68,az-.25,.025,.55,.025,-.75,0,-sx*.2));
        B.add(G.cyl,an,MX(ax+sx*.24,ay+.6,az+.12,.022,.36,.022,.55,0,-sx*.3));B.add(G.cyl,an,MX(ax+sx*.5,ay+.9,az-.05,.02,.3,.02,.2,0,-sx*.6))}
      B.add(WREATH,'#b8322c',MX(0,1.03,.28,.95,.92,.45));B.b('#b8322c',0,1.42,.05,.12,.06,.62);B.add(G.sphLo,'#e0b04a',MX(0,.66,.36,.08));B.reset();if(!lie)block(x,z,.9)};
    for(const [x,z,r,m] of [[132,84,.6,'stand'],[137,93,2.3,'graze'],[141,86,4.2,'lie'],[146,82,1.2,'stand'],[150,91,5.4,'graze'],[136,80,2.9,'stand'],[153,86,.2,'lie'],[145,95,3.3,'graze'],[129,91,1.7,'stand']])deer(x,z,r,m);
    // nhà trang trại: phía đông bãi, mặt nhìn về bãi tuần lộc
    {const x=FX+FRX+8.5,z=FZ,y=H(x,z),ry=-Math.PI/2,w=12,d=9,h=3.4,a=.62,b0=.6,rh=Math.tan(a)*(w/2+.9),Lr=(w/2+1)/Math.cos(a);S.at(x,y,z,ry);L.at(x,y,z,ry);
      S.b('#8c96a2',0,b0/2,0,w+.3,b0+.1,d+.3);S.b('#bf915f',0,b0+h/2,0,w,h,d);for(let k=0;k<6;k++)S.b('#a97e52',0,b0+.3+k*.6,d/2+.02,w+.04,.06,.04);/* chân tường đá, vách gỗ ghép */
      S.add(G.prism,'#bf915f',MX(0,b0+h,0,w,rh-.3,d));
      for(const sd of [-1,1]){S.b('#5e4330',sd*(w/4+.2),b0+h+rh/2-.2,0,Lr,.26,d+1.8,0,0,-sd*a);S.b(SNOW,sd*(w/4+.2)-sd*.1,b0+h+rh/2+.05,0,Lr,.3,d+1.9,0,0,-sd*a)}
      // đầu hồi kính lớn, kèo gỗ
      L.add(G.prism,'#ffd9a0',MX(0,b0+h+.1,d/2+.04,w*.66,rh*.68,.05));S.b('#7a5434',0,b0+h+.05,d/2+.1,w*.7,.18,.1);S.b('#7a5434',0,b0+h+rh*.36,d/2+.12,.16,rh*.7,.1);for(const sd of [-1,1])S.b('#7a5434',sd*w*.17,b0+h+rh*.34,d/2+.12,.12,rh*.66,.1,0,0,-sd*a);
      // cửa gỗ giữa, vòng nguyệt quế (Giáng sinh), hai ô kính lớn sáng ấm
      S.b('#7a5434',0,b0+1.15,d/2+.06,1.7,2.3,.12);S.b('#5e4330',0,b0+1.15,d/2+.13,.06,2.2,.04);XS.T=S.T;XS.add(WREATH,'#2f5b48',MX(0,b0+1.75,d/2+.2,.75));XS.add(G.sphLo,'#a5302a',MX(0,b0+1.45,d/2+.22,.08));XS.reset();
      for(const sx of [-1,1]){L.b('#ffd9a0',sx*3.2,b0+1.4,d/2+.04,2.8,2.1,.05);for(const k of [-1,0,1])S.b('#7a5434',sx*3.2+k*1.4,b0+1.4,d/2+.09,.1,2.2,.06);S.b('#7a5434',sx*3.2,b0+2.5,d/2+.09,3,.12,.06);S.b('#7a5434',sx*3.2,b0+1.4,d/2+.09,2.9,.08,.05)}
      // biển gỗ có tuần lộc trắng trên cửa
      {const c=document.createElement('canvas');c.width=640;c.height=240;const g=c.getContext('2d');g.fillStyle='#6b4a30';g.beginPath();g.moveTo(20,90);g.lineTo(240,90);g.quadraticCurveTo(320,0,400,90);g.lineTo(620,90);g.lineTo(620,230);g.lineTo(20,230);g.closePath();g.fill();g.strokeStyle='#d9b77e';g.lineWidth=6;g.stroke();
        g.fillStyle='#f6efe2';g.strokeStyle='#f6efe2';g.lineWidth=5;g.lineCap='round';g.beginPath();g.ellipse(318,74,22,11,0,0,7);g.fill();g.beginPath();g.ellipse(340,56,6,9,.3,0,7);g.fill();for(const [x0,y0,x1,y1] of [[304,80,302,100],[312,82,312,100],[326,82,327,100],[334,80,337,100],[340,50,333,26],[342,50,350,26],[336,36,328,30],[346,36,355,31]]){g.beginPath();g.moveTo(x0,y0);g.lineTo(x1,y1);g.stroke()}
        g.textAlign='center';g.font='700 54px Georgia,serif';g.fillText('TRANG TRẠI TUẦN LỘC',320,162,580);g.font='italic 30px Georgia,serif';g.fillStyle='#e8d6b4';g.fillText('Reindeer Ranch',320,208);
        const tx=new THREE.CanvasTexture(c);tx.colorSpace=THREE.SRGBColorSpace;const m=new THREE.Mesh(new THREE.PlaneGeometry(5.4,2.02),new THREE.MeshLambertMaterial({map:tx,transparent:true}));
        const p=new THREE.Vector3(0,b0+h-.25,d/2+.2).applyMatrix4(S.T);m.position.copy(p);m.rotation.y=ry;sc.add(m)}
      // hai cánh mái thấp hai bên, ô cửa sáng
      for(const sd of [-1,1]){const cx=sd*(w/2+1.6);S.b('#8c96a2',cx,b0/2,.6,3.4,b0+.1,d-2.6);S.b('#bf915f',cx,b0+1.2,.6,3.2,2.4,d-3);L.b('#ffd9a0',cx,b0+1.3,d/2-.88,1.6,1.1,.05);S.b('#7a5434',cx,b0+1.3,d/2-.84,1.7,.08,.05);
        S.b('#5e4330',cx+sd*.15,b0+2.75,.6,3.9,.2,d-1.8,0,0,-sd*.32);S.b(SNOW,cx+sd*.1,b0+2.95,.6,3.9,.26,d-1.7,0,0,-sd*.32);stringLights(L,cx-1.9,b0+2.4,d/2-.6,cx+1.9,b0+2.4,d/2-.6,8,.08)}
      // dây đèn viền đầu hồi (chỉ sáng khi Giáng sinh)
      for(const sd of [-1,1])stringLights(L,sd*(w/2+.9),b0+h-.3,d/2+.95,0,b0+h+rh-.05,d/2+.95,12,0);
      S.reset();L.reset();block(x,z,7.5);for(const sd of [-1,1])block(x,z+sd*7.5,2.4)}
    // xe tuần lộc của ông già Noel: chờ ở cổng tây, nơi xuất phát chuyến phát quà
    {const x=FX-FRX-6,z=FZ+5,y=H(x,z),ry=Math.PI;S.at(x,y,z,ry);L.at(x,y,z,ry);
      for(const sx of [-.85,.85]){S.b('#d6b04a',sx,.12,0,.12,.1,3.6);S.add(G.cyl12,'#d6b04a',MX(sx,.45,1.85,.42,.08,.42,0,0,Math.PI/2))}for(const sz of [-1,0,1])for(const sx of [-.85,.85])S.b('#d6b04a',sx,.35,sz,.08,.45,.08);
      S.b('#a8262b',0,.95,-.3,1.9,.9,2.6);S.b('#a8262b',0,1.55,-1.4,1.9,1.3,.5);S.add(G.cyl12,'#a8262b',MX(0,1.1,1.05,.95,.3,.95,0,0,Math.PI/2));S.b('#d6b04a',0,1.42,-.3,1.95,.08,2.65);S.b('#2f5b48',0,1.45,-.8,1.6,.12,1);
      S.add(G.sph,'#7a4a2e',MX(0,1.95,-1.05,.7,.65,.6));S.b('#b8322c',.55,1.7,-.2,.5,.5,.5,.3);S.b('#2f5b48',-.5,1.65,0,.45,.4,.45,-.2);S.b('#e0b04a',.1,1.6,.35,.4,.35,.4,.5);
      S.b('#5e4330',0,.7,2.6,.08,.08,2,0,0,0);S.reset();L.reset();block(x,z,2);
      for(const [lx,lz] of [[-.6,3.6],[.6,3.6],[-.6,5.6],[.6,5.6]]){const wx=x-lx,wz=z-lz;deer(wx,wz,ry,'stand')}}
    block(FX,FZ,11.5);block(FX-7,FZ,10.5);block(FX+7,FZ,10.5)}
  {
    // 3 Khu nghỉ ngắm cảnh: chòi gỗ nhỏ bên trái và một góc ghế
    openShed(140,68,0,4.4,3.2,2.4);for(const [bx,bz,br] of [[153,70,.3],[156,72,1.1]]){const by=H(bx,bz);S.b('#c99d70',bx,by+.45,bz,1.8,.1,.5,br);S.b('#a8805c',bx,by+.22,bz,1.6,.44,.12,br)}
    // cổng biển gỗ "Trang Trại Tuần Lộc" có gạc, mái nhỏ phủ tuyết; bảng thông tin gỗ cạnh cổng
    {const x=124.5,z=96,y=H(x,z);S.at(x,y,z,-Math.PI/2);for(const sx of [-1.3,1.3])S.b('#b8906a',sx,1.6,0,.25,3.2,.25);S.b('#c99d70',0,2.3,0,2.4,1,.16);S.b('#8a6a4a',0,3.3,0,3.2,.14,.9,0,0,0);S.b(SNOW,0,3.45,0,3.3,.2,1);
      for(const sx of [-1,1]){S.add(G.cyl,'#f1eee5',MX(sx*.3,3.05,.12,.04,.5,.04,0,0,-sx*.5));S.add(G.cyl,'#f1eee5',MX(sx*.48,3.2,.12,.03,.3,.03,0,0,sx*.4))}S.reset();
      const ix=125,iz=80,iy=H(ix,iz);S.at(ix,iy,iz,-Math.PI/2);S.b('#b8906a',0,.6,0,.14,1.2,.14);S.b('#c99d70',0,1.25,0,1.4,.9,.1,0,-.35,0);S.b('#f1eee5',0,1.27,.05,1.1,.6,.02,0,-.35,0);S.reset();block(x,z,1.6);block(ix,iz,.9)}
  }
  // ---------- Chùa Tuyết Yên trên núi, góc trên bên trái bản đồ (tây bắc) ----------
  const TP={x:HILL.x,z:HILL.z},TRY=Math.atan2(STAIR.x-HILL.x,STAIR.z-HILL.z),tw=(lx,lz)=>[TP.x+Math.cos(TRY)*lx+Math.sin(TRY)*lz,TP.z-Math.sin(TRY)*lx+Math.cos(TRY)*lz];
  {const y=H(TP.x,TP.z);S.at(TP.x,y,TP.z,TRY);L.at(TP.x,y,TP.z,TRY);
    // Chánh điện kiểu Bắc Âu (tấm 08): nhà gỗ sồi một tầng, hai lớp mái dốc nhẹ phủ tuyết, lam gỗ dọc, cửa kính lớn sáng ấm, hoa sen phát sáng trên đầu hồi
    const oak='#d2a676',dk='#a07a56',st='#9ca4ae',z0=-1.5,w=11,d=8,h=3.4,y0=.7;
    S.b(st,0,.3,z0+.8,14,.8,12.5);for(let i=0;i<4;i++)S.b(i%2?'#aab2bc':st,0,.1+i*.17,z0+d/2+3.2-i*.45,7,.2,1);/* nền đá, bậc thềm rộng */
    S.b(oak,0,y0+h/2,z0,w,h,d);for(let x=-w/2+.3;x<=w/2-.2;x+=.45)if(Math.abs(x)>2.5){S.b(dk,x,y0+h/2,z0+d/2+.03,.12,h,.06);S.b(dk,x,y0+h/2,z0-d/2-.03,.12,h,.06)}
    for(let zz=-d/2+.3;zz<=d/2-.2;zz+=.45)for(const sx of [-1,1])S.b(dk,sx*(w/2+.03),y0+h/2,z0+zz,.06,h,.12);
    L.b('#ffcf86',0,y0+1.4,z0+d/2+.04,4.6,2.7,.05);for(const x of [-2.35,-1.15,0,1.15,2.35])S.b('#4a3828',x,y0+1.4,z0+d/2+.08,.12,2.8,.08);S.b('#4a3828',0,y0+2.8,z0+d/2+.08,4.8,.14,.1);
    for(const sx of [-1,1])L.b('#ffc977',sx*(w/2+.04),y0+1.8,z0,.05,1.4,3);
    const roof=(yb,half,rise,len,col)=>{const a=Math.atan2(rise,half),Lr=Math.hypot(half,rise);for(const sd of [-1,1]){S.b(col,sd*half/2,yb+rise/2,z0,Lr,.26,len,0,0,-sd*a);S.b(SNOW,sd*(half/2-.06),yb+rise/2+.26,z0,Lr+.05,.32,len+.15,0,0,-sd*a)}S.b(SNOW,0,yb+rise+.2,z0,.6,.3,len+.15)};
    S.add(G.prism,oak,MX(0,y0+h,z0,w,1.9,d));roof(y0+h-.15,w/2+1.1,2.3,d+1.8,'#a8805c');
    S.b(oak,0,y0+h+2.1,z0,5.6,1.3,d-1.4);S.add(G.prism,oak,MX(0,y0+h+2.75,z0,5.6,1.2,d-1.4));roof(y0+h+2.6,3.4,1.45,d,'#a8805c');
    {const gx=0,gy=y0+h+3.2,gz=z0+(d-1.4)/2+.06;for(const a of [-.95,-.48,0,.48,.95])L.add(G.sph,'#ffd98a',MX(gx+Math.sin(a)*.22,gy+Math.cos(a)*.22,gz,.09,.32,.03,0,0,-a));L.b('#ffd98a',gx,gy-.12,gz,.7,.05,.03)}
    stringLights(L,-w/2-1,y0+h-.2,z0+d/2+.9,w/2+1,y0+h-.2,z0+d/2+.9,20,0);
    // đèn đá hai bên bậc thềm
    for(const sx of [-4.2,4.2]){const lz=z0+d/2+2.6;S.add(G.cyl,st,MX(sx,.9,lz,.18,1.2,.18));S.b(st,sx,1.6,lz,.7,.15,.7);S.b('#8f98a3',sx,1.95,lz,.45,.5,.45);S.add(G.pyr4,st,MX(sx,2.4,lz,.9,.5,.9));S.add(G.pyr4,SNOW,MX(sx,2.5,lz,.8,.4,.8))}
    S.add(G.cyl12,'#7a3a28',MX(0,.86,4.4,.45,.12,.45));/* toạ cụ trên thềm đá, nhìn vào chánh điện */
    // Tượng Phật ngoài trời: tượng trắng ngồi thiền trên bệ đá tự nhiên, bên phải chánh điện
    {const bx=10.5,bz=1.5;for(const [rx,rz,rr,ry] of [[0,0,1.9,.7],[-1.2,.8,1.1,.5],[1.3,.6,1.2,.55],[.4,-1,1.3,.6],[-.9,-.7,1,.45]])S.add(G.sphLo,rx%2?'#8f8a84':'#a29d96',MX(bx+rx,ry,bz+rz,rr,ry+.35,rr));S.add(G.sphLo,SNOW,MX(bx,1.1,bz,1.6,.3,1.5));
      const wt='#ffffff',k=1.7,yb=1.15;S.add(G.cyl12,wt,MX(bx,yb+.15*k,bz,.95*k,.3*k,.7*k));S.add(G.sph,wt,MX(bx,yb+.42*k,bz,.85*k,.32*k,.6*k));S.add(G.sph,wt,MX(bx,yb+1.0*k,bz-.05,.48*k,.66*k,.36*k));S.add(G.sph,wt,MX(bx,yb+1.78*k,bz-.05,.27*k,.31*k,.27*k));S.add(G.sph,wt,MX(bx,yb+2.08*k,bz-.07,.13*k));S.add(G.sph,wt,MX(bx,yb+.62*k,bz+.28*k,.3*k,.12*k,.18*k));
      L.add(G.sph,'#fff0c8',MX(bx,yb+1.8*k,bz-.6,.9,.9,.05));for(const sx of [-2,2]){S.add(G.cyl,st,MX(bx+sx,.6,bz+2.4,.14,1,.14));S.b('#8f98a3',bx+sx,1.25,bz+2.4,.3,.35,.3);S.add(G.pyr4,st,MX(bx+sx,1.6,bz+2.4,.6,.35,.6))}}
    S.reset();L.reset();warm(...tw(0,2).slice(0,1),y+3.2,tw(0,2)[1],16,18);
    {const c=tw(0,-1.5);block(c[0],c[1],7.8)}{const c=tw(10.5,1.5);block(c[0],c[1],5.5)}
    for(const [lx,lz,h] of [[-10,-3,8],[-9,-9,9],[8,-8,7],[-12,4,6],[16,-4,8],[6,-6,6]]){const c=tw(lx,lz);pine(T,c[0],c[1],h)}}
  // bậc đá lên núi, đèn đá hai bên
  {const a=tw(0,7.2),b=STAIR,n=Math.ceil(Math.hypot(a[0]-b.x,a[1]-b.z)/1.6),ang=Math.atan2(a[0]-b.x,a[1]-b.z);
    for(let i=0;i<=n;i++){const t=i/n,x=b.x+(a[0]-b.x)*t,z=b.z+(a[1]-b.z)*t,yy=H(x,z);S.b('#8f98a3',x,yy+.05,z,3.2,.35,1.3,ang);S.b(SNOW,x,yy+.25,z,3,.04,.6,ang);
      if(i%4===1)for(const sd of [-2.6,2.6]){const lx=x+Math.cos(ang)*sd,lz=z-Math.sin(ang)*sd,y2=H(lx,lz);S.b('#8f98a3',lx,y2+.5,lz,.35,1,.35);S.b('#8f98a3',lx,y2+1.15,lz,.55,.3,.55);L.b('#ffcf7a',lx,y2+1.15,lz,.3,.2,.3);S.add(G.pyr4,'#8f98a3',MX(lx,y2+1.5,lz,.55,.4,.55));S.add(G.pyr4,SNOW,MX(lx,y2+1.58,lz,.45,.3,.45))}}}
  {const s=STATIONS.find(s=>s.id==='sit'),c=tw(0,5.8);s.x=c[0];s.z=c[1];const b=STATIONS.find(s=>s.id==='bell'),d=tw(10.5,5.6);b.x=d[0];b.z=d[1]}

  // ---------- trồng thông: dày ở rừng tây và dải sau lều kính, thưa quanh làng ----------
  const segD=(x,z,ax,az,bx,bz)=>{const dx=bx-ax,dz=bz-az,t=Math.max(0,Math.min(1,((x-ax)*dx+(z-az)*dz)/(dx*dx+dz*dz)));return Math.hypot(x-ax-dx*t,z-az-dz*t)};
  const stTop=tw(0,7.2);
  const keep=(x,z)=>{if(lakeE(x,z)<1.12)return false;
    if(Math.hypot(x-FARM.x,z-FARM.z)<FARM.r+6)return false;if(Math.hypot(x-TREE.x,z-TREE.z)<46||Math.hypot(x-FUN.x,z-FUN.z)<24||Math.hypot(x-RH.x,z-RH.z)<18||Math.hypot(x-16,z+22)<10||Math.hypot(x-RH.x-1,z-RH.z-16)<7.5||Math.hypot(x-FARM.x-25,z-FARM.z)<14||Math.hypot(x-FARM.x+23,z-FARM.z-3)<7)return false;if(Math.hypot(x-TP.x,z-TP.z)<15)return false;if(segD(x,z,STAIR.x,STAIR.z,stTop[0],stTop[1])<5)return false;
    for(const [ix,iz] of IGLOOS){const [lx,lz]=toLake([ix,iz],16);if(Math.hypot(x-ix,z-iz)<8.5||segD(x,z,ix,iz,lx,lz)<4.5)return false}if(Math.abs(x)<9&&z>80&&z<104)return false;
    for(const p of PATHS)for(let i=0;i+1<p.length;i++)if(segD(x,z,...p[i],...p[i+1])<4)return false;
    for(const c of colliders)if(Math.hypot(x-c[0],z-c[1])<c[2]+1.5)return false;for(const q of PEAKS)if(Math.hypot(x-q.x,z-q.z)<q.R*1.25)return false;/* không trồng cây trên vách đá */for(const t of HTRAILS)for(let i=0;i+1<t.length;i++)if(segD(x,z,...t[i],...t[i+1])<4)return false;for(const r of SKIRUNS)for(let i=0;i+1<r.length;i++)if(segD(x,z,...r[i],...r[i+1])<7)return false;if(segD(x,z,...LIFT[0],...LIFT[1])<4||Math.hypot(x-SKI.x,z-SKI.z+2)<12)return false;if(Math.abs(x-SKI.x)<30&&z>SKI.z-4&&z<SKI.z+62&&rnd()<.85)return false;if(segD(x,z,PIER[0][0],PIER[0][1],PIER[0][0]-8,PIER[0][1])<4)return false;if(Math.hypot((x-RINK.x)/(RINK.rx+6),(z-RINK.z)/(RINK.rz+6))<1)return false;for(let i=0;i+1<HUSKY_TRAIL.length;i++)if(segD(x,z,...HUSKY_TRAIL[i],...HUSKY_TRAIL[i+1])<4)return false;
    for(const zn of ZONES){const l=Math.hypot(zn.cam[0],zn.cam[1]);if(Math.hypot(x-zn.x,z-zn.z)<8||segD(x,z,zn.x,zn.z,zn.x-zn.cam[0]/l*18,zn.z-zn.cam[1]/l*18)<8)return false}return true};
  {const N=LOW?1500:4800;let n=0,tries=0;while(n<N&&tries<N*12){tries++;const x=(rnd()-.5)*560,z=(rnd()-.5)*560,r=Math.hypot(x,z);if(r>300)continue;
    let p=.12;if(x<-40&&z<20&&z>-150)p=.92;else if(z<-20)p=.93;else if(x>30)p=.9;else if(z<20)p=.6;else if(z<-60)p=.5;else if(r>130)p=.55;if(rnd()>p||!keep(x,z))continue;pine(T,x,z,5+rnd()*7*(r>160?1.4:1));n++}}

  sc.add(S.mesh(LAM));sc.add(L.mesh(GLOW));sc.add(T.mesh(LAM));const xmasG=new THREE.Group();xmasG.add(XS.mesh(LAM),XL.mesh(GLOW));sc.add(xmasG);

  // ---------- nhãn tên các khu ----------
  const labels=[];
  function signTex(t1,t2){const c=document.createElement('canvas');c.width=512;c.height=180;const g=c.getContext('2d');g.fillStyle='rgba(14,22,36,.72)';g.beginPath();if(g.roundRect)g.roundRect(8,8,496,164,40);else g.rect(8,8,496,164);g.fill();g.strokeStyle='rgba(214,184,120,.7)';g.lineWidth=3;g.stroke();
    g.textAlign='center';g.fillStyle='#f1e2bf';g.font='600 50px Georgia,serif';g.fillText(t1,256,90,470);g.fillStyle='#cfd8e6';g.font='28px system-ui,sans-serif';g.fillText(t2,256,138,470);const tx=new THREE.CanvasTexture(c);tx.colorSpace=THREE.SRGBColorSpace;return tx}
  for(const zn of ZONES){if(zn.id==='don')continue;const p={rungkinh:[...IGLOOS[1],8],lang:[-24,34,8],hobang:[LAKE.x,LAKE.z,4],rung:[12,-40,6],vuichoi:[-46,30,7],tuanloc:[142,76,5],dinh:[SKI.x,SKI.z-2,12],chua:[...tw(0,0),12]}[zn.id];if(!p)continue;
    const s=new THREE.Sprite(new THREE.SpriteMaterial({map:signTex(zn.name.toUpperCase(),zn.note.split('.')[0].slice(0,40)),transparent:true,fog:false,depthWrite:false}));s.scale.set(4.6,1.6,1);labels.push(s);s.position.set(p[0],H(p[0],p[1])+p[2],p[1]);sc.add(s)}

  // ---------- tuyết rơi ----------
  const SNN=LOW?900:2200,sp=new Float32Array(SNN*3);for(let i=0;i<SNN;i++){sp[i*3]=(rnd()-.5)*70;sp[i*3+1]=rnd()*30;sp[i*3+2]=(rnd()-.5)*70}
  const snowG=new THREE.BufferGeometry();snowG.setAttribute('position',new THREE.BufferAttribute(sp,3));
  const flake=(()=>{const c=document.createElement('canvas');c.width=c.height=32;const g=c.getContext('2d'),r=g.createRadialGradient(16,16,0,16,16,16);r.addColorStop(0,'rgba(255,255,255,1)');r.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=r;g.fillRect(0,0,32,32);return new THREE.CanvasTexture(c)})();
  const snow=new THREE.Points(snowG,new THREE.PointsMaterial({size:.16,map:flake,transparent:true,depthWrite:false,opacity:.85}));snow.frustumCulled=false;sc.add(snow);
  // hai nút bật tắt trong Xứ Yên: Giáng sinh (đèn và trang trí Noel ở làng, khu vui chơi) · Tuyết rơi. Cả hai tắt là cảnh bình thường
  const fog0=sc.fog.density,FX={xmas:false,snow:false};let fogK=fog0;
  const applyFx=()=>{xmasG.visible=FX.xmas;U.night.value=FX.xmas?1:0;hemi.intensity=FX.xmas?.62:1.45;moon.intensity=FX.xmas?.38:1;sc.fog.color.set(FX.xmas?'#1a2640':'#3e5880');for(const m of xmasOnly)m.visible=FX.xmas;snow.visible=FX.snow;fogK=fog0*(FX.snow?1.35:1);sc.fog.density=fogK;
    for(const k of ['xmas','snow']){const b=box.querySelector('[data-sn="'+k+'"]');if(b){b.setAttribute('aria-pressed',FX[k]?'true':'false');b.classList.toggle('on',FX[k])}}
    try{localStorage.setItem('xuyen-fx',JSON.stringify(FX))}catch(e){}};
  {try{const q=new URLSearchParams(location.search).get('xuyen');const sv=JSON.parse(localStorage.getItem('xuyen-fx')||'{}');FX.xmas=!!sv.xmas;FX.snow=!!sv.snow;if(q){FX.xmas=/giangsinh/.test(q);FX.snow=/tuyetroi/.test(q)}}catch(e){}if(opts.fx)Object.assign(FX,opts.fx);applyFx()}
  const setMode=m=>{FX.xmas=/giangsinh/.test(m||'');FX.snow=/tuyetroi/.test(m||'');applyFx()};
  window.__snowMode=setMode;window.__snowChimneys=CHIMNEYS;

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
  // Nguyên tắc camera giống Rừng Yên, Vịnh Yên (world3d.js): camera sau lưng 14 m × zoom, cao 5,6 m × zoom × độ nâng; zoom 0,45–3 và độ nâng 0,35–2,6 lưu chung
  // 'yen_cam_zoom', 'yen_cam_lift'; vuốt một ngón khoá trục (ngang xoay ~200° mỗi bề ngang màn hình, có quán tính; dọc nâng hạ camera); hai ngón chụm để zoom
  // hoặc xoay để quay quanh nhân vật; con lăn chuột zoom tối đa ±18% mỗi nấc; chạm đúp: zoom 0,6 ↔ 1 và trả độ nâng về 1. Xoay chỉ đổi camera, không đổi hướng nhân vật.
  let camZoom=1,camLift=1;try{const z=Number(localStorage.getItem('yen_cam_zoom'));if(z>=.45&&z<=3)camZoom=z;const v=Number(localStorage.getItem('yen_cam_lift'));if(v>=.35&&v<=2.6)camLift=v}catch(e){}let camZoomS=camZoom;
  const setZoom=z=>{camZoom=Math.max(.45,Math.min(3,z));try{localStorage.setItem('yen_cam_zoom',String(camZoom))}catch(e){}};
  const setCamLift=v=>{camLift=Math.max(.35,Math.min(2.6,v));try{localStorage.setItem('yen_cam_lift',String(camLift))}catch(e){}};
  const ray=new THREE.Raycaster(),pts=new Map();let drag=null,g2=null,pinch0=0,ang0=0,swipeAxis=null,swipeAcc=[0,0],swipeV=0,swipeT=0,inV=0,lastTap=null,dtIn=false;
  const two=()=>{const [a,b]=[...pts.values()];return [Math.max(10,Math.hypot(a.x-b.x,a.y-b.y)),Math.atan2(b.y-a.y,b.x-a.x)]};
  cv.addEventListener('pointerdown',e=>{inV=0;pts.set(e.pointerId,{x:e.clientX,y:e.clientY});try{cv.setPointerCapture(e.pointerId)}catch(_){}swipeAxis=null;swipeAcc=[0,0];
    if(pts.size===1)drag={mv:0,x:e.clientX,y:e.clientY};else{if(drag)drag.mv=99;if(pts.size===2){[pinch0,ang0]=two();g2={mode:null,s:0,a:0}}}});
  cv.addEventListener('pointermove',e=>{const p=pts.get(e.pointerId);if(!p)return;let dx=e.clientX-p.x,dy=e.clientY-p.y;p.x=e.clientX;p.y=e.clientY;
    if(pts.size===2&&g2){const [d,a]=two(),f=Math.max(.8,Math.min(1.25,pinch0/d));let da=a-ang0;da=Math.atan2(Math.sin(da),Math.cos(da));pinch0=d;ang0=a;
      if(!g2.mode){g2.s+=Math.log(f);g2.a+=da;if(Math.abs(g2.a)>.14)g2.mode='rot';else if(Math.abs(g2.s)>.08)g2.mode='zoom';else return}
      if(g2.mode==='rot')P.yaw-=da;else setZoom(camZoom*f);return}
    if(!drag||pts.size!==1)return;if(Math.hypot(e.clientX-drag.x,e.clientY-drag.y)>12)drag.mv=99;
    if(!swipeAxis){swipeAcc[0]+=dx;swipeAcc[1]+=dy;const ax=Math.abs(swipeAcc[0]),ay=Math.abs(swipeAcc[1]);if(Math.max(ax,ay)<8)return;swipeAxis=ax>=ay*.8?'x':'y';dx=swipeAcc[0];dy=swipeAcc[1]}
    if(swipeAxis==='x'){const k=dx/Math.max(320,innerWidth)*3.5,n0=performance.now();swipeV=-k/Math.max(8,n0-swipeT)*1000;swipeT=n0;P.yaw-=k}else setCamLift(camLift+dy/Math.max(320,innerHeight)*2.4)});
  const inertia=()=>{let tl=performance.now();const f=()=>{const n=performance.now(),dt=Math.min(.05,(n-tl)/1000);tl=n;P.yaw+=inV*dt;inV*=Math.exp(-dt*3.2);if(Math.abs(inV)>.03&&!pts.size&&run)requestAnimationFrame(f)};requestAnimationFrame(f)};
  cv.addEventListener('pointerup',e=>{const one=pts.size===1;if(!pts.delete(e.pointerId))return;if(one&&swipeAxis==='x'&&performance.now()-swipeT<90&&Math.abs(swipeV)>.3){inV=swipeV;inertia()}
    if(pts.size===2){[pinch0,ang0]=two();g2={mode:null,s:0,a:0}}else g2=null;swipeAxis=null;swipeAcc=[0,0];if(pts.size)return;const d=drag;drag=null;if(!d||d.mv>8)return;
    const nt=performance.now();if(lastTap&&nt-lastTap.t<330&&Math.hypot(e.clientX-lastTap.x,e.clientY-lastTap.y)<28){lastTap=null;setZoom(camZoom>.85?.6:1);setCamLift(1);return}lastTap={t:nt,x:e.clientX,y:e.clientY};tap(e.clientX,e.clientY)});
  cv.addEventListener('pointercancel',e=>{pts.delete(e.pointerId);if(!pts.size){drag=null;g2=null}});
  cv.addEventListener('wheel',e=>{e.preventDefault();const dy=e.deltaY*(e.deltaMode===1?16:e.deltaMode===2?innerHeight:1);setZoom(camZoom*Math.exp(Math.max(-.18,Math.min(.18,dy*(e.ctrlKey?.006:.0012)))))},{passive:false});
  const keys=new Set();const onKey=e=>{const k={w:'f',arrowup:'f',s:'b',arrowdown:'b',a:'l',arrowleft:'l',d:'r',arrowright:'r'}[e.key.toLowerCase()];if(e.key==='Escape'&&e.type==='keydown'){if(!mapEl.hidden)mapEl.hidden=true;else if(P.mode!=='walk')stand();return}if(!k)return;e.preventDefault();if(e.type==='keydown'){keys.add(k);P.dest=null}else keys.delete(k)};
  document.addEventListener('keydown',onKey);document.addEventListener('keyup',onKey);
  function tap(cx,cy){if(P.mode!=='walk'&&P.mode!=='sled')return;const r=cv.getBoundingClientRect();ray.setFromCamera(new THREE.Vector2((cx-r.left)/r.width*2-1,-(cy-r.top)/r.height*2+1),cam);
    if(P.mode==='sled'){const h=ray.intersectObjects([groundMesh],false)[0];if(h&&lakeE(h.point.x,h.point.z)>=1&&Math.hypot(h.point.x-LAKE.x,h.point.z-LAKE.z)<90)sledLand(h.point.x,h.point.z);else caption('Bấm vào bờ hồ để ghé bờ nhé.',2500);return}
    const hit=ray.intersectObjects([ice,groundMesh],false)[0];if(!hit)return;let x=hit.point.x,z=hit.point.z;
    const st=STATIONS.find(s=>Math.hypot(s.x-x,s.z-z)<4.5);if(st){x=st.x;z=st.z}
    if(Math.hypot(x,z)>220){caption('Phía xa là núi tuyết, mình dạo quanh làng thôi nhé');return}P.dest={x,z}}
  // Va chạm khi đi: nhà, công trình (colliders), thân cây (lưới TG 8 m), xe trượt và đàn husky đang đứng hay chạy. Không đi xuyên, không đè lên nhau.
  const hitC=(x,z)=>{for(const c of colliders)if(Math.hypot(x-c[0],z-c[1])<c[2])return c;const gx=(x/8)|0,gz=(z/8)|0;for(let i=-1;i<=1;i++)for(let j=-1;j<=1;j++){const a=TG[(gx+i)+','+(gz+j)];if(a)for(const c of a)if(Math.hypot(x-c[0],z-c[1])<c[2])return c}
    for(const o of sleds)if(o!==mySled){const c=[o.g.position.x,o.g.position.z,o.len*.55];if(Math.hypot(x-c[0],z-c[1])<c[2])return c}
    if(P.mode!=='husky'){const c=[huskyG.position.x,huskyG.position.z,2.6];if(Math.hypot(x-c[0],z-c[1])<c[2])return c}return null};
  const blocked=(x,z)=>!!hitC(x,z);

  let first=true;
  // ---------- hoạt động ----------
  let near=null;
  function act(){const s=near;if(!s)return;P.dest=null;
    if(s.id==='aurora'){P.mode='aurora';P.ride=0;caption('✨ Nằm yên trong lều kính, nhìn bầu trời và mặt hồ. Thở theo vòng sáng: hít vào khi nó lớn, thở ra khi nó nhỏ.',9000);breathEl.hidden=false;U.boost.value=1.5;me.visible=false;labels.forEach(l=>l.visible=false)}
    else if(s.id==='husky'){P.mode='husky';P.ride=0;caption('🐕 Đàn husky chạy chậm một vòng rừng thông. Vuốt để nhìn quanh.',6000)}
    else if(s.id==='sled'){const o=sleds.filter(q=>q.st==='park').sort((a,b)=>Math.hypot(a.g.position.x-P.x,a.g.position.z-P.z)-Math.hypot(b.g.position.x-P.x,b.g.position.z-P.z))[0];if(!o){caption('🛷 Cả 3 xe đang chạy, đợi một chút xe về bến nhé.',4000);return}mySled=o;sledStart(o,'me');P.mode='sled';P.ride=0;setSit(true);caption('🛷 Xe chạy vòng sát bờ hồ. Muốn lên bờ thì bấm vào bờ chỗ bạn thích.',6000)}
    else if(s.id==='sit'){setSit(true);P.mode='sit';{const c=tw(0,4.4);P.sitAt={x:c[0],z:c[1],y:H(TP.x,TP.z)+.92,a:TRY+Math.PI}}caption('🪷 Ngồi yên trước Phật. Mỗi hơi thở ra, thả lỏng đôi vai.',8000);breathEl.hidden=false;bell()}
    else if(s.id==='fire'){setSit(true);P.mode='sit';P.sitAt={x:-44,z:84.6,y:H(-44,82)+.5,a:Math.PI};caption('🔥 Hơ tay bên lửa. Ấm áp là điều nhỏ mà thật.',7000)}
    else if(s.id==='bell'){bell();caption('🪷 Chắp tay trước tượng Phật giữa rừng thông tuyết. Một tiếng chuông nhỏ, rồi lắng nghe sự tĩnh lặng.',7000);return}
    else if(s.id==='deer'){caption('🦌 Tuần lộc ăn rêu địa y. Chúng sống chậm theo mùa, không vội vàng.',7000);return}
    else if(s.id==='carousel'){P.mode='carousel';P.ride=0;caption('🎠 Vòng ngựa gỗ quay thật chậm, nhìn đèn lướt qua.',6000)}
    else if(s.id==='wheel'){P.mode='wheel';P.ride=0;setSit(true);caption('🎡 Vòng quay lên rất chậm. Từ trên cao nhìn cả làng tuyết và bầu trời.',7000)}
    actBtn.hidden=true;stopBtn.hidden=false;stopBtn.textContent=['husky','sled','carousel','wheel'].includes(P.mode)?'⏹ Xuống xe':'↩ Đứng dậy'}
  function stand(){if(P.mode==='sled'&&mySled){const o=mySled;if(o.st==='park'||o.st==='merge'&&o.to===SDOCK[o.k].m&&Math.hypot(o.g.position.x-SDOCK[o.k].p[0],o.g.position.z-SDOCK[o.k].p[1])<1.5){o.st='park';o.rider=null;mySled=null}else{const [x,z]=sAt(o.s+12);sledLand(...lakeShore(sAt(o.s+12)[3],3));return}}const m=P.mode;P.mode='walk';breathEl.hidden=true;U.boost.value=1;me.visible=true;labels.forEach(l=>l.visible=true);me.rotation.set(0,me.rotation.y,0);stopBtn.hidden=true;
    setSit(false);const st=id=>{const q=STATIONS.find(s=>s.id===id);return [q.x,q.z]},back={aurora:st('aurora'),husky:st('husky'),sled:st('sled'),carousel:st('carousel'),wheel:st('wheel'),sit:P.sitAt&&P.sitAt.z<-50?st('sit'):st('fire')}[m];if(back){P.x=back[0];P.z=back[1]}P.sitAt=null;
    if(m==='aurora')caption('Mang Yên về đời thực: tối nay, trước khi ngủ, thử ngước nhìn bầu trời một phút.',7000)}
  actBtn.onclick=act;stopBtn.onclick=stand;

  // ---------- bản đồ ----------
  const mc=box.querySelector('.sn-mc'),mx=mc.getContext('2d'),MS=720,MW=250,toM=(x,z)=>[(x+10+MW/2)/MW*MS,(z+8+MW/2)/MW*MS],fromM=(u,v)=>[u/MS*MW-MW/2,v/MS*MW-MW/2+10];
  function drawMap(){const c=mx;c.fillStyle='#e8eef6';c.fillRect(0,0,MS,MS);
    c.fillStyle='#cfdbe9';c.beginPath();const [lx,lz]=toM(LAKE.x,LAKE.z);c.ellipse(lx,lz,LAKE.rx/MW*MS,LAKE.rz/MW*MS,0,0,7);c.fill();c.strokeStyle='#9fb6cf';c.lineWidth=2;c.stroke();
    c.fillStyle='rgba(42,82,66,.18)';for(let i=0;i<500;i++){const x=(hh(i,1)-.5)*300,z=(hh(i,2)-.5)*300;if(!((x<-40&&z<46&&z>-150)||(x>36&&x<124&&z<2&&z>-70))||!keep(x,z))continue;const [u,v]=toM(x,z);c.beginPath();c.moveTo(u,v-7);c.lineTo(u-5,v+4);c.lineTo(u+5,v+4);c.fill()}
    c.strokeStyle='#aeb6c0';c.lineWidth=7;c.lineCap=c.lineJoin='round';for(const p of PATHS){c.beginPath();p.forEach((q,i)=>{const [u,v]=toM(...q);i?c.lineTo(u,v):c.moveTo(u,v)});c.stroke()}
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
  box.addEventListener('click',e=>{const a=e.target.closest('[data-sn]')?.dataset.sn;if(a==='xmas'||a==='snow'){FX[a]=!FX[a];applyFx()}else if(a==='map'){drawMap();mapEl.hidden=false}else if(a==='mapx')mapEl.hidden=true;else if(a==='home')close()});
  mapEl.addEventListener('click',e=>{if(e.target===mapEl)mapEl.hidden=true});

  // ---------- vòng lặp ----------
  const resize=()=>{const w=box.clientWidth||innerWidth,h=box.clientHeight||innerHeight;R.setSize(w,h,false);cam.aspect=w/h;cam.fov=cam.fov0||(w<h?66:56);cam.updateProjectionMatrix()};resize();addEventListener('resize',resize);
  let run=true,tl=performance.now(),camFix=null;const tgt=new THREE.Vector3(),cpos=new THREE.Vector3();
  const loop=()=>{if(!run)return;requestAnimationFrame(loop);const now=performance.now(),dt=Math.min(.05,(now-tl)/1000);tl=now;const t=now/1000;U.time.value=t;U.camP.value.copy(cam.position);
    // đàn husky và xe trượt chạy vòng (kể cả khi không ngồi trên xe)
    const hu=P.mode==='husky'?(P.ride+=dt*.03):0,[hx,hz,hr]=along(HR,false,1-Math.abs(1-2*hu));huskyG.position.set(hx,H(hx,hz),hz);huskyG.rotation.y=hu>.5?hr+Math.PI:hr;
    dogs.forEach((d,i)=>{d.position.y=P.mode==='husky'?Math.abs(Math.sin(t*9+i))*.08:0});
    sledTick(dt);
    carousel.rotation.y=t*.18;for(const h of horses)h.position.y=1.7+Math.sin(t*1.6+h.userData.ph)*.35;wheel.rotation.z=-t*.08;for(const g of gondolas){const a=g.userData.a;g.position.set(Math.cos(a)*WR,Math.sin(a)*WR,0);g.rotation.z=t*.08}if(fireFl){fireFl.scale.set(1+Math.sin(t*13)*.08,1+Math.sin(t*7.3)*.18,1+Math.cos(t*11)*.08);fireLight.intensity=12+Math.sin(t*9)*2+Math.sin(t*23)*1.2}
    if(P.mode==='walk'){let mvx=0,mvz=0;if(keys.size){const f=(keys.has('f')?1:0)-(keys.has('b')?1:0),s=(keys.has('r')?1:0)-(keys.has('l')?1:0),sy=Math.sin(P.yaw),cy=Math.cos(P.yaw);mvx=-sy*f+cy*s;mvz=-cy*f-sy*s}
      else if(P.dest){const dx=P.dest.x-P.x,dz=P.dest.z-P.z,d=Math.hypot(dx,dz);if(d<.15)P.dest=null;else{mvx=dx/d;mvz=dz/d}}
      if(mvx||mvz){const l=Math.hypot(mvx,mvz),spd=(P.dest&&Math.hypot(P.dest.x-P.x,P.dest.z-P.z)>30?6:2.6)*dt;mvx/=l;mvz/=l;let nx=P.x+mvx*spd,nz=P.z+mvz*spd;
        const c0=hitC(nx,nz),esc=c0&&Math.hypot(P.x-c0[0],P.z-c0[1])<c0[2]&&Math.hypot(nx-c0[0],nz-c0[1])>Math.hypot(P.x-c0[0],P.z-c0[1]);/* đang kẹt trong vật cản thì cho bước ra */
        if(c0&&!esc){const c=c0;const ox=P.x-c[0],oz=P.z-c[1],ol=Math.hypot(ox,oz)||1,tx=-oz/ol,tz=ox/ol,sg=Math.sign(tx*mvx+tz*mvz)||1;nx=P.x+tx*sg*spd;nz=P.z+tz*sg*spd;if(blocked(nx,nz)){nx=P.x;nz=P.z;P.dest=null}}
        if(Math.hypot(nx,nz)<230){P.x=nx;P.z=nz}P.a=Math.atan2(mvx,mvz);if(P.dest||keys.has('f'))follow(P.a,dt,1.8);/* camera sau lưng nhân vật khi đi, như kayak và bơi ở Vịnh Yên */me.position.y=groundY(P.x,P.z)+Math.abs(Math.sin(t*8))*.04}else me.position.y=groundY(P.x,P.z);
      me.position.x=P.x;me.position.z=P.z;let da=P.a-me.rotation.y;da=Math.atan2(Math.sin(da),Math.cos(da));me.rotation.y+=da*Math.min(1,dt*10);
      near=null;for(const s of STATIONS)if(Math.hypot(s.x-P.x,s.z-P.z)<4.2){near=s;break}actBtn.hidden=!near;if(near)actBtn.textContent=near.label;
      tgt.set(P.x,me.position.y+1.5,P.z)}
    else if(P.mode==='husky'){me.position.copy(huskyG.position).add(_v.set(0,.35,-.1).applyAxisAngle(_v2.set(0,1,0),huskyG.rotation.y));me.rotation.set(0,huskyG.rotation.y,0);follow(huskyG.rotation.y,dt);if(P.ride>=1)stand();tgt.set(me.position.x,me.position.y+1.4,me.position.z);P.x=me.position.x;P.z=me.position.z}
    else if(P.mode==='sled'&&mySled){const g=mySled.g;me.position.copy(g.position).add(_v.set(0,.5,mySled.seatZ).applyAxisAngle(_v2.set(0,1,0),g.rotation.y));me.rotation.set(0,g.rotation.y,0);follow(g.rotation.y,dt);tgt.set(me.position.x,me.position.y+1.4,me.position.z);P.x=me.position.x;P.z=me.position.z}
    else if(P.mode==='carousel'){P.ride+=dt;const a=-carousel.rotation.y;const h0=horses[1];me.position.set(CAR.x+Math.cos(a+h0.userData.q-.26)*h0.userData.r,carousel.position.y+h0.position.y+.1,CAR.z+Math.sin(a+h0.userData.q-.26)*h0.userData.r);me.rotation.set(0,-a+Math.PI,0);tgt.set(CAR.x,carousel.position.y+2,CAR.z);if(P.ride>50)stand()}
    else if(P.mode==='wheel'){P.ride+=dt;const a=gondolas[0].userData.a+wheel.rotation.z;me.position.set(WHEEL.x+Math.cos(a)*WR,wheel.position.y+Math.sin(a)*WR-1.05,WHEEL.z);me.rotation.set(0,0,0);tgt.set(me.position.x,me.position.y+1.2,me.position.z);follow(0,dt);if(P.ride>78)stand()}
    else if(P.mode==='sit'){const s=P.sitAt;follow(s.a,dt);me.position.set(s.x,s.y,s.z);me.rotation.set(0,s.a,0);tgt.set(s.x,me.position.y+1.2,s.z)}
    // camera
    U.fadeR.value=0;if(camFix){cam.position.set(...camFix[0]);cam.lookAt(...camFix[1])}
    else if(P.mode==='aurora'){P.ride+=dt;const x=70,z=6.2,y=H(70,6)+.45+1.1;cam.position.set(x,y,z);cam.lookAt(x+Math.sin(P.ride*.05)*8,y+9+Math.sin(P.ride*.07)*.8,z+11)}
    else{camZoomS+=(camZoom-camZoomS)*Math.min(1,dt*7);const cz=camZoomS,ride=P.mode!=='walk',gy=ride?tgt.y-1.05:groundY(P.x,P.z),behind=(ride?(P.mode==='sit'?.55:.7):1)*14*cz,cx=tgt.x+Math.sin(P.yaw)*behind,ccz=tgt.z+Math.cos(P.yaw)*behind;
      const cy=Math.max(5.6*cz*camLift*(ride?.7:1)+Math.max(0,cz-1.5)*7+gy,groundY(cx,ccz)+2.2);/* như Rừng Yên: thu nhỏ quá 1,5 thì camera lên cao dần để thấy toàn cảnh */
      cpos.set(cx,cy,ccz);if(first){cam.position.copy(cpos);first=false}else cam.position.lerp(cpos,1-Math.exp(-dt*9));U.meP.value.set(tgt.x,gy+1.05,tgt.z);U.fadeR.value=1.8+Math.min(camZoomS,2)*.9;cam.lookAt(tgt.x,gy+1.05,tgt.z);cam.rotateX(Math.atan(Math.tan(cam.fov*Math.PI/360)/3));/* nhân vật ở giữa, trên đường một phần ba dưới */
      sc.fog.density=fogK/(1+Math.max(0,cz-1.2)*.7)}
    // tuyết bay quanh camera
    const A=snowG.attributes.position.array;for(let i=0;i<SNN;i++){let y=A[i*3+1]-dt*(.8+(i%7)*.12);A[i*3]+=Math.sin(t*.6+i)*dt*.25;if(y<0)y+=30;A[i*3+1]=y}snowG.attributes.position.needsUpdate=true;snow.position.set(cam.position.x,cam.position.y-12,cam.position.z);
    R.render(sc,cam)};
  const _v2=new THREE.Vector3();let lastDrag=0;cv.addEventListener('pointermove',()=>{if(pts.size)lastDrag=performance.now()});
  function follow(h,dt,k=3){if(pts.size||performance.now()-lastDrag<1200)return;let d=h+Math.PI-P.yaw;d=Math.atan2(Math.sin(d),Math.cos(d));P.yaw+=d*Math.min(1,dt*k)}/* camera về sau lưng, bám theo cả khi xe đổi hướng; vuốt xoay thì tạm dừng 1,2 giây */
  requestAnimationFrame(loop);
  caption('❄ Xứ Yên · Hít một hơi lạnh trong lành, thở ra thật chậm. Chạm mặt tuyết để đi, vuốt để nhìn quanh.',7000);

  function close(){if(!run)return;run=false;removeEventListener('resize',resize);document.removeEventListener('keydown',onKey);document.removeEventListener('keyup',onKey);
    sc.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material){const m=o.material;if(m.map)m.map.dispose();m.dispose()}});R.dispose();try{R.forceContextLoss()}catch(e){}
    box.remove();css.remove();document.body.classList.remove('snow-open');window.__snowOpen=null;window.__snowCam=null;window.__snowGo=null;if(opts.onClose)opts.onClose()}
  // Chụp thử: __snowCam([x,y,z],[tx,ty,tz]) đặt camera cố định, __snowCam(null) để trả lại; __snowGo('leukinh') tới một khu; __snowAct('aurora') mở hoạt động
  window.__snowPos=(x,z,yaw)=>{P.x=x;P.z=z;P.dest=null;if(yaw!=null)P.yaw=yaw;first=true};window.__snowCam=(p,q)=>{camFix=p?[p,q]:null};window.__snowFog=d=>{sc.fog.density=d};window.__snowH=(x,z)=>groundY(x,z);window.__sleds=()=>sleds.map(o=>[o.st,o.rider,+o.s.toFixed(1),+o.v.toFixed(1)]);window.__sledLand=(x,z)=>sledLand(x,z);window.__snowMe=()=>{const p=me.position.clone().setY(groundY(P.x,P.z)+1.05).project(cam);return {x:+((p.x+1)/2).toFixed(3),y:+((1-p.y)/2).toFixed(3),mode:P.mode,yaw:+P.yaw.toFixed(2),a:+P.a.toFixed(2),zoom:camZoom,lift:camLift}};window.__snowProject=v=>{const p=new THREE.Vector3(...v).project(cam);return [(p.x+1)/2,(1-p.y)/2]};window.__snowExp=e=>{R.toneMappingExposure=e};window.__snowFov=f=>{cam.fov=f;cam.updateProjectionMatrix();cam.fov0=f};window.__snowGo=id=>{const z=ZONES.find(z=>z.id===id);if(z)goZone(z)};
  window.__snowAct=id=>{const s=STATIONS.find(s=>s.id===id);if(s){if(P.mode!=='walk')stand();P.x=s.x;P.z=s.z;near=s;act()}};window.__snowMap=()=>{drawMap();mapEl.hidden=false};
  const api={close};window.__snowOpen=api;return api}
