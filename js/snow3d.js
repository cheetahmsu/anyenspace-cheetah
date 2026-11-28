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
  {id:'vuichoi',n:'3',name:'Khu Vui Chơi Giáng Sinh',icon:'🎠',x:-34,z:70,ml:[-40,24],cam:[.5,-1],note:'Vòng quay, ngựa gỗ, hoạt động Noel.'},
  {id:'truotbang',n:'4',name:'Hồ Trượt Băng',icon:'⛸️',x:-12,z:104,cam:[0,-1],note:'Sân băng nhỏ trước làng, trượt chậm cùng gia đình.'},
  {id:'tuanloc',n:'6',name:'Trang Trại Tuần Lộc',icon:'🦌',x:92,z:118,cam:[1,0],note:'Gặp tuần lộc, cho ăn, tìm hiểu văn hoá Sámi.'},
  {id:'hobang',n:'7',name:'Hồ Băng Lớn',icon:'❄️',x:30,z:14,ml:[60,24],cam:[1,-.1],note:'Xe trượt lướt chậm trên mặt hồ soi bóng cực quang.'},
  {id:'dinh',n:'9',name:'Đỉnh Tuyết Yên',icon:'⛷️',x:100,z:-36,cam:[0,-1],note:'Khu trượt tuyết trên núi, ngắm toàn cảnh Xứ Yên.'},
  {id:'chua',n:'8',name:'Chùa Tuyết Yên',icon:'🪷',x:-46,z:-76,cam:[-.6,-1],note:'Chánh điện gỗ sồi và tượng Phật ngoài trời giữa núi tuyết.'}];
const LAKE={x:108,z:46,rx:54,rz:24,rot:-.42},RINK={x:-17,z:90,rx:13,rz:13}/* 28/11: lùi sân trượt băng xa cổng đỏ cho quảng trường rộng (cũ: -12,83) */,ICE_Y=-.12,HILL={x:-72,z:-112,r:40,h:16},STAIR={x:-48,z:-80};
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
const SLOOP=Array.from({length:240},(_,i)=>{const a=Math.PI-i/240*Math.PI*2,da=Math.atan2(Math.sin(a-.5),Math.cos(a-.5));return [...lakeShore(a,-6-6.5*Math.exp(-Math.pow(da/.13,2))),a]});/* 28/11: đoạn bờ đông trước Nhà Mái Cỏ lượn ra xa bờ thêm, xe không chạy xuyên nhà và hiên */
const SDOCK=[2.84,2.95,3.06].map(a=>({a,p:lakeShore(a,-2.2),m:lakeShore(a,-6)}));
const SKI={x:104,z:-118,r:66,h:50},SKIRUNS=[[[98,-110],[93,-102],[94,-94],[99,-86],[97,-78],[90,-70],[88,-60]],[[112,-110],[118,-101],[121,-92],[117,-84],[119,-75],[125,-66],[124,-58]]],LIFT=[[78,-60],[94,-110]];
/* 28/11: tuyến xe husky mới: từ trại theo đường rừng sang tây, vòng qua vùng núi đá hiểm trở quanh đồi chùa, sang chân núi trượt tuyết rồi về trại */
const HL=(()=>{const L=[[16,-20],[12.4,-28.6],[10,-34],[18,-42],[10,-50],[-16,-66],[-42,-80]];for(let k=0;k<=12;k++){const a=.82+k/12*4.6,r=54+6*Math.sin(k*1.7);L.push([-72+Math.cos(a)*r,-112+Math.sin(a)*r])}L.push([8,-122],[42,-100],[66,-74],[80,-60],[66,-56],[40,-58],[10,-50],[18,-42],[10,-34],[12.4,-28.6],[16,-20]);return L})();
const HTRAILS=[[[14,96],[33,88],[45,74],[46,58],[44,40],[40,18],[27,-4],[15,-11],[14.8,-15.5],[16,-20],[12.4,-28.6],[10,-34],[18,-42],[10,-50]],/* vòng ngoài phía đông làng, vào bãi husky qua hai cửa rào */[[10,-50],[40,-58],[66,-56],[80,-58]],[[10,-50],[-16,-66],[-42,-80]],[[26,-4],[70,8],[110,4],[140,-2],[176,-2]],[[40.8,54],[24.8,53]],HL.slice(6,22)];/* tuyến husky chính có nhánh; thêm vòng núi quanh đồi chùa */
const HR=[[16,-20],[12.4,-28.6],[10,-34],[18,-42],[10,-50],[40,-58],[66,-56],[80,-58]];/* xe husky chạy đi về */
const HUSKY={x:10,z:-50,rx:1,rz:1};
const along=(pts,closed,u)=>{const P=closed?[...pts,pts[0]]:pts;let tot=0;const L=[];for(let i=0;i+1<P.length;i++){const l=Math.hypot(P[i+1][0]-P[i][0],P[i+1][1]-P[i][1]);L.push(l);tot+=l}
  let d=((u%1)+1)%1*tot;if(!closed&&u>=1)d=tot;for(let i=0;i<L.length;i++){if(d<=L[i]||i===L.length-1){const t=Math.min(1,d/L[i]),a=P[i],b=P[i+1];return [a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,Math.atan2(b[0]-a[0],b[1]-a[1])]}d-=L[i]}};
const FARM={x:122,z:116,r:14}/* 28/11: dời trang trại tuần lộc xuống phía nam, xa bờ hồ cho thoáng (cũ: 142,88) */,TREE={x:10,z:56},FUN={x:-30,z:56},RH={x:-64,z:55},CAR={x:-25,z:51},WHEEL={x:-48,z:37},STAGE={x:-40,z:114},FIRE2={x:-44,z:50};
const HOME=(()=>{const [x,z]=lakeShore(.65,9);const ry=Math.atan2(-46-x,-76-z),c=Math.cos(ry),sn=Math.sin(ry),dw=(lx,lz)=>[x+lx*c+lz*sn,z-lx*sn+lz*c];return {x,z,ry,d:dw(3.6,1.2),o:dw(19,1.2)}})();
const homeClear=(x,z)=>{if(Math.hypot(x-HOME.x,z-HOME.z)<15)return true;const [ax,az]=HOME.d,[bx,bz]=HOME.o,dx=bx-ax,dz=bz-az,t=Math.max(0,Math.min(1,((x-ax)*dx+(z-az)*dz)/(dx*dx+dz*dz)));return Math.hypot(x-ax-dx*t,z-az-dz*t)<6};/* chừa sân trước cửa nhà và tầm camera khi ra cửa *//* Nhà Mái Cỏ Riêng (Tư Gia): bờ đông Hồ Băng Lớn, hiên nhà nhìn qua hồ về đồi chùa tượng Phật (người dùng chọn 28/11) */
const KOTA={x:-52.5,z:-74,R:4.1},SNOWMAN={x:-52,z:86},ARCH={x:-1,z:69,ry:-.7},archW=(lx,lz)=>[ARCH.x+Math.cos(ARCH.ry)*lx+Math.sin(ARCH.ry)*lz,ARCH.z-Math.sin(ARCH.ry)*lx+Math.cos(ARCH.ry)*lz];/* cổng đỏ Giáng sinh */
// Làng Lapland xếp lại theo tấm 10: nhà quây vòng cung phía bắc và đông cây thông lớn, quay mặt về cây thông và hồ trượt băng;
// vòng trong bán kính 22 m, vòng ngoài 38 m đặt đúng khe giữa hai nhà vòng trong để có đường đi thẳng từ quảng trường ra.
// 28/11 (người dùng dặn): nhà chính đổi chỗ với nhà chữ A (nhà chính sang -29°, nhà chữ A về chính bắc); cửa hàng lưu niệm lùi xa về sau (29 → 47 m) cho quảng trường thoáng. Cửa hàng lưu niệm kéo lại gần cây thông một chút (47 → 38 m, -62°), vẫn cách vòng ngựa gỗ. Sau cùng (người dùng chốt): nhà chính kéo lại gần cây thông trung tâm (-25°, 36 m), nhà chữ A dời sang phải (15°, 40 m) để không bị che.
// [góc (0 = bắc, dương = đông), bán kính, rộng, sâu, cao, màu, loại]
const VH=[[-25,36,9,19.8,4.4,'#c99d70','main'],[-62,38,8,7,3.8,'#b8906a','shop'],[58,29,8.5,8,3.6,'#c99d70','cafe'],[118,29,7,7.5,3.4,'#b8906a','chalet'],
  [15,40,7,8,3.3,'#a8805c','aframe'],[29,43,7,7.5,3.4,'#b8906a','chalet']].map(([b,r,w,d,h,col,k])=>{const a=b*Math.PI/180,x=TREE.x+Math.sin(a)*r,z=TREE.z-Math.cos(a)*r,ry=Math.atan2(TREE.x-3-x,TREE.z+5-z);return {a,r,x,z,ry,w,d,h,col,k}});
const CHIMNEYS=[];/* miệng ống khói 5 nhà trên tuyến xe trao Yên */
const VRING=19,VPATH=[Array.from({length:49},(_,i)=>[TREE.x+Math.cos(i/48*Math.PI*2)*VRING,TREE.z+Math.sin(i/48*Math.PI*2)*VRING]),
  ...VH.map(v=>{const dx=Math.sin(v.ry)*(v.d/2+.6),dz=Math.cos(v.ry)*(v.d/2+.6);return [[v.x+dx,v.z+dz],[TREE.x+Math.sin(v.a)*VRING,TREE.z-Math.cos(v.a)*VRING]]})];
const PATHS=[[[14,98],[17,80],[12.5,71]],[[-36,72],[-37,92],[-38,107]],[[-4,62],[-16,66]],...VPATH,[[46,86],[78,96],[104,122]],[[104,122],[104,106],[114,98],[132,98],[140,108]],[[104,122],[110,132],[128,134],[140,126]],[[12,-4],[6,-12],[2,-24],[-4,-34]],[[30,-20],[38,-26]],Array.from({length:73},(_,i)=>lakeShore(i/72*Math.PI*2,4.5))],HUSKY_TRAIL=[];
const STATIONS=[
  {id:'aurora',x:48,z:-49.6,label:'✨ Vào lều kính'},
  {id:'husky',x:12.5,z:-19,label:'🐕 Lên xe husky dạo rừng'},
  {id:'sled',x:0,z:0,label:'🛷 Lái xe trượt trên hồ băng'},
  {id:'sit',x:0,z:-94.2,label:'🪷 Ngồi thiền trước Phật'},
  {id:'bell',x:9,z:-94,label:'🪷 Chiêm bái tượng Phật'},
  {id:'fire',x:25,z:79.6,label:'🔥 Ngồi sưởi bên bếp lửa'},
  {id:'deer',x:102.6,z:114,label:'🦌 Lấy rêu cho tuần lộc ăn',tapOnly:1},
  {id:'carousel',x:-25,z:58.6,label:'🎠 Ngồi vòng ngựa gỗ'},
  {id:'wheel',x:-48,z:43.4,label:'🎡 Lên vòng quay ngắm làng'},
  {id:'snowman',x:-46,z:89,label:'⛄ Đắp người tuyết'},
  {id:'tree',x:10,z:66.5,label:'🎄 Treo điều ước lên cây thông'},
  {id:'skate',x:-3,z:71.6,label:'⛸ Xỏ giày trượt băng'},
  {id:'kota',x:0,z:0,label:'🔥 Vào chòi lửa'},
  {id:'home',x:0,z:0,label:'🏡 Vào Nhà Mái Cỏ Riêng'},
  {id:'isle',x:0,z:-999,label:'✨ Ngồi ngắm cực quang'},{id:'bridge',x:0,z:-999,label:'🌉 Lên cầu'},
  {id:'cocoa',x:-53.8,z:54,label:'☕ Ngồi uống ly ấm',tapOnly:1},
  {id:'stars',x:24,z:93,label:'🌌 Nằm trên tuyết ngắm sao'}];
{const q=STATIONS.find(o=>o.id==='kota');KOTA.ry=Math.atan2(STAIR.x-KOTA.x,STAIR.z-KOTA.z);KOTA.door=[KOTA.x+Math.sin(KOTA.ry)*(KOTA.R+1.4),KOTA.z+Math.cos(KOTA.ry)*(KOTA.R+1.4)];q.x=KOTA.door[0];q.z=KOTA.door[1]}
{const q=STATIONS.find(o=>o.id==='home'),c=Math.cos(HOME.ry),sn=Math.sin(HOME.ry),lx=3.6+1.5,lz=1.2;q.x=HOME.x+lx*c+lz*sn;q.z=HOME.z-lx*sn+lz*c}/* trước bậc cửa mặt bên */
{const q=STATIONS.find(o=>o.id==='cocoa'),a=Math.atan2(CAR.x-RH.x,CAR.z-RH.z);q.x=RH.x+Math.sin(a)*10.4;q.z=RH.z+Math.cos(a)*10.4;q.a=a}
{const q=STATIONS.find(o=>o.id==='skate'),GA=Math.atan2(ARCH.z-RINK.z,ARCH.x-RINK.x);q.x=RINK.x+Math.cos(GA)*(RINK.rx+1.6);q.z=RINK.z+Math.sin(GA)*(RINK.rz+1.6)}
{const q=STATIONS.find(o=>o.id==='aurora'),[x,z]=toLake(IGLOOS[1],7.4);q.x=x;q.z=z}
{const q=STATIONS.find(o=>o.id==='sled'),d=lakeShore(2.95,1.6);q.x=d[0];q.z=d[1];const zn=ZONES.find(o=>o.id==='hobang');zn.x=PIER[0][0]-4;zn.z=PIER[0][1];zn.cam=[PIER[1][0]-PIER[0][0],PIER[1][1]-PIER[0][1]]}

export function openSnow(THREE,opts){opts=opts||{};
  if(window.__snowOpen)return window.__snowOpen;
  const coarse=!!(window.matchMedia&&matchMedia('(pointer:coarse)').matches),LOW=coarse||!!opts.low;
  // ---------- khung trang ----------
  const box=document.createElement('section');box.id='snowBox';box.setAttribute('role','dialog');box.setAttribute('aria-label','Xứ Yên');
  box.innerHTML='<canvas id="snowCanvas"></canvas><div class="sn-top"><strong>✧ LÀNG YÊN - XỨ YÊN</strong><span class="sn-sp"></span><button type="button" data-sn="xmas" aria-pressed="false" title="Bật tắt đèn và trang trí Giáng sinh">🎄<span class="sn-lb"> Giáng sinh</span></button><button type="button" data-sn="snow" aria-pressed="false" title="Bật tắt tuyết rơi">❄<span class="sn-lb"> Tuyết rơi</span></button><button type="button" data-sn="map">🗺<span class="sn-lb"> Bản đồ</span></button><button type="button" data-sn="home">🏠 Trang chính</button></div>'
    +'<div class="sn-cap" aria-live="polite"></div><div class="sn-breath" hidden><div class="sn-orb"></div><span></span></div>'
    +'<div class="sn-bottom"><button type="button" class="sn-act" hidden></button><button type="button" class="sn-far" hidden>🔭 Ngắm xe từ xa</button><button type="button" class="sn-stop" hidden>↩ Đứng dậy</button></div>'
    +'<div class="sn-map" hidden><div class="sn-card"><div class="sn-mh"><b>Bản đồ Xứ Yên</b><button type="button" data-sn="mapx">✕ Đóng</button></div><canvas class="sn-mc" width="720" height="720"></canvas><div class="sn-list"></div></div></div>';
  const css=document.createElement('style');css.id='snowCss';css.textContent=`#snowBox{position:fixed;inset:0;z-index:150;background:#0b1424;color:#f3ead8;font:15px/1.4 system-ui,sans-serif;touch-action:none;user-select:none;-webkit-user-select:none}
#snowCanvas{position:absolute;inset:0;width:100%;height:100%;display:block}
#snowBox .sn-top{position:absolute;left:0;right:0;top:0;display:flex;gap:8px;align-items:center;padding:calc(8px + env(safe-area-inset-top)) 12px 8px;background:linear-gradient(#0b1424cc,#0b142400)}
#snowBox .sn-top strong{font-weight:600;letter-spacing:.06em;font-size:13px;color:#f1e2bf}#snowBox .sn-sp{flex:1}
#snowBox button{border:1px solid #d6b87888;border-radius:999px;background:#0e1f33cc;color:#f5e8cc;padding:8px 13px;font-size:14px;cursor:pointer;-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px)}
#snowBox .sn-cap{position:absolute;left:50%;top:calc(56px + env(safe-area-inset-top));transform:translateX(-50%);max-width:min(560px,92vw);text-align:center;padding:8px 14px;border-radius:14px;background:#0b1424d9;text-shadow:0 1px 2px #0008;line-height:1.4;opacity:0;transition:opacity .8s;pointer-events:none;font-size:14px}
#snowBox .sn-cap.on{opacity:1}
#snowBox .sn-wish{position:absolute;left:50%;bottom:calc(84px + env(safe-area-inset-bottom));transform:translateX(-50%);width:min(420px,92vw);padding:14px;border-radius:16px;background:#0b1424e6;border:1px solid #c8a96a55;color:#f3ead8;z-index:6;font-size:14px}#snowBox .sn-wish.tv{bottom:calc(12px + env(safe-area-inset-bottom));padding:12px}@media (max-width:520px){#snowBox .sn-wish.tv .wr{flex-wrap:nowrap;overflow-x:auto;scrollbar-width:none}#snowBox .sn-wish.tv .wr button{flex:none}}#snowBox .sn-wish b{display:block;margin-bottom:8px}#snowBox .sn-wish .bp{margin:0 0 10px;line-height:1.45;opacity:.9}#snowBox .sn-wish .wr{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:8px}#snowBox .sn-wish .wr button{padding:7px 10px;border-radius:12px;border:1px solid #ffffff33;background:#ffffff14;color:inherit;font-size:14px}#snowBox .sn-wish .wr button.on{background:#c8a96a;color:#13202c;border-color:#c8a96a}#snowBox .sn-wish input{width:100%;box-sizing:border-box;padding:8px 10px;border-radius:10px;border:1px solid #ffffff33;background:#ffffff10;color:inherit;font-size:14px;margin-bottom:8px}#snowBox .sn-wish .rw{display:flex;gap:8px;justify-content:flex-end}#snowBox .sn-wish .rw button{padding:8px 14px;border-radius:12px;border:1px solid #ffffff33;background:none;color:inherit}#snowBox .sn-wish .rw .go{background:#c8a96a;color:#13202c;border-color:#c8a96a;font-weight:600}#snowBox .sn-ba{position:absolute}#snowBox .sn-ba .ba-x{position:absolute;top:8px;right:10px;background:none;border:0;color:inherit;opacity:.7;font-size:16px;padding:4px}#snowBox .sn-ba .ba-dot{display:inline-block;width:12px;height:12px;border-radius:50%;margin-right:6px;vertical-align:-1px;border:1px solid #fff6}#snowBox .sn-ba .ba-orb{width:64px;height:64px;margin:10px auto;border-radius:50%;background:radial-gradient(circle,#f3d58f,#c8a96a55);transition:transform 4s ease-in-out;transform:scale(.6)}#snowBox .sn-ba .ba-orb.in{animation:baIn 4s ease-in-out forwards}#snowBox .sn-ba .ba-orb.out{transform:scale(1);animation:baOut 4.5s ease-in-out forwards}@keyframes baIn{from{transform:scale(.6)}to{transform:scale(1)}}@keyframes baOut{from{transform:scale(1)}to{transform:scale(.6)}}#snowBox .sn-ba .ba-candle{position:relative;width:70px;height:46px;margin:22px auto 10px;border-radius:0 0 30px 30px;background:var(--c)}#snowBox .sn-ba .ba-candle span{position:absolute;left:50%;top:-20px;width:12px;height:20px;margin-left:-6px;border-radius:50% 50% 50% 50%/60% 60% 40% 40%;background:radial-gradient(circle at 50% 70%,#fff6d0,#ffb347 60%,transparent 70%);opacity:0;transition:opacity .8s}#snowBox .sn-ba .ba-candle.on span{opacity:1;animation:baFl 1.6s ease-in-out infinite}@keyframes baFl{50%{transform:scaleY(1.15) translateY(-1px)}}#snowBox .sn-ba .ba-bowl{width:84px;height:38px;margin:12px auto 6px;border-radius:0 0 42px 42px;background:#f1e8d6;box-shadow:inset 0 10px 0 #6a3352}#snowBox .sn-ba .ba-n{font:600 34px Georgia,serif;text-align:center;color:#f3d58f;margin:4px 0 8px}#snowBox .sn-ba .wr button.on{background:#c8a96a;color:#13202c}
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
#snowBox .sn-rail{position:absolute;right:calc(10px + env(safe-area-inset-right));top:50%;transform:translateY(-50%);display:flex;flex-direction:column;gap:10px;z-index:3}
#snowBox .sn-rail button{width:58px;padding:7px 2px 6px;border-radius:16px;display:flex;flex-direction:column;align-items:center;gap:2px;line-height:1}#snowBox .sn-rail span{font-size:22px}#snowBox .sn-rail small{font-size:10px;opacity:.9;white-space:nowrap}
#snowBox .sn-rail button.on{background:rgba(197,163,111,.38);border-color:#c5a36f}
#snowBox .sn-sheet{position:absolute;right:calc(78px + env(safe-area-inset-right));top:50%;transform:translateY(-50%);width:min(360px,calc(100vw - 100px));max-height:min(78vh,620px);overflow:auto;background:#0b1424ee;border:1px solid #d6b87866;border-radius:18px;padding:12px 14px;z-index:3;box-shadow:0 18px 50px #0008;touch-action:pan-y;user-select:text;-webkit-user-select:text}
#snowBox .sn-sh{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px}#snowBox .sn-sh b{color:#f1e2bf;font-size:16px}#snowBox .sn-sh button{padding:5px 10px}
#snowBox .sn-gr{font-size:13px;color:#d6b878;margin:10px 0 6px;font-weight:600}#snowBox .sn-grid{display:grid;grid-template-columns:1fr 1fr;gap:6px}#snowBox .sn-grid.one{grid-template-columns:1fr}
#snowBox .sn-grid button{border-radius:12px;text-align:left;font-size:13px;padding:8px 10px;display:flex;flex-direction:column;gap:2px}#snowBox .sn-grid button span{font-size:20px}#snowBox .sn-grid button em{font-size:10px;font-style:normal;color:#9fb3c8}#snowBox .sn-grid button.on{background:rgba(197,163,111,.34);border-color:#c5a36f}
#snowBox .sn-pvw{position:sticky;top:-12px;z-index:1;background:#0b1424;margin:0 -14px;padding:2px 14px 4px}#snowBox .sn-pv{display:block;width:100%;height:auto;max-height:150px;object-fit:contain;border-radius:12px;border:1px solid #d6b87844;background:#15243b}#snowBox .sn-grid.wear button{display:block}#snowBox .sn-grid.wear button span{font-size:16px;margin-right:5px}#snowBox .sn-grid.wear button em{display:block;margin-top:2px}#snowBox .sn-pvc{display:flex;justify-content:space-around;font-size:11px;color:#9fb3c8;margin-top:3px}
#snowBox .sn-sw{display:flex;flex-wrap:wrap;gap:8px}#snowBox .sn-sw button{width:36px;height:36px;padding:0;border-radius:50%;border:2px solid #ffffff44}#snowBox .sn-sw button.on{border:3px solid #f2c75c;box-shadow:0 0 0 2px #0b1424}
#snowBox .sn-note{font-size:12px;opacity:.75;margin:10px 0 2px}#snowBox .sn-ta{width:100%;min-height:76px;box-sizing:border-box;border-radius:12px;border:1px solid #d6b87866;background:#0e1f33;color:#f5e8cc;padding:8px;font:14px/1.4 system-ui,sans-serif;resize:vertical}
#snowBox .sn-row{display:flex;justify-content:flex-end;margin:6px 0 4px}#snowBox .sn-gold{background:#c8a96a;color:#13202c;border-color:#c8a96a;font-weight:600}
#snowBox .sn-sheet article{border-top:1px solid #d6b87833;padding:8px 2px}#snowBox .sn-sheet article b{display:block;font-size:13px;color:#f1e2bf}#snowBox .sn-sheet article small{font-size:11px;opacity:.7}#snowBox .sn-sheet article p{margin:4px 0 0;font-size:14px}
#snowBox .sn-gift{position:absolute;left:50%;transform:translateX(-50%);top:calc(104px + env(safe-area-inset-top));display:flex;flex-wrap:wrap;gap:6px;justify-content:center;max-width:min(560px,94vw);background:#0b1424dd;border:1px solid #d6b87866;border-radius:16px;padding:10px;z-index:3}#snowBox .sn-gift[hidden]{display:none}#snowBox .sn-gq{width:100%;text-align:center;font-size:13px;color:#f1e2bf}#snowBox .sn-gift button{font-size:14px;padding:8px 12px}#snowBox .sn-skip{opacity:.75}
@media(max-width:520px){#snowBox .sn-rail{top:auto;bottom:calc(84px + env(safe-area-inset-bottom));transform:none}#snowBox .sn-rail button{width:52px}#snowBox .sn-sheet{left:10px;right:72px;width:auto;top:auto;bottom:calc(84px + env(safe-area-inset-bottom));transform:none;max-height:62vh}#snowBox .sn-pv{max-height:118px}#snowBox .sn-grid.wear button{padding:6px 8px}}
@media(max-width:520px){#snowBox .sn-top strong{display:none}#snowBox .sn-lb{display:none}#snowBox .sn-top button{padding:7px 10px;font-size:13px;white-space:nowrap}}`;
  document.head.appendChild(css);document.body.appendChild(box);document.body.classList.add('snow-open');
  const cv=box.querySelector('#snowCanvas'),capEl=box.querySelector('.sn-cap'),actBtn=box.querySelector('.sn-act'),stopBtn=box.querySelector('.sn-stop'),farBtn=box.querySelector('.sn-far'),breathEl=box.querySelector('.sn-breath'),mapEl=box.querySelector('.sn-map');
  const snowCleanup=[];
  /* 28/11: đi xe husky, xe trượt như du thuyền ở Vịnh Yên: camera sau lưng xe; nút 🔭 để ngắm xe từ xa, bấm lại về sau lưng */
  let farView=false;farBtn.addEventListener('click',e=>{e.stopPropagation();farView=!farView;farBtn.textContent=farView?'🎥 Về sau lưng':'🔭 Ngắm xe từ xa'});
  let capT=0;const caption=(t,ms)=>{capEl.textContent=t;capEl.classList.add('on');clearTimeout(capT);capT=setTimeout(()=>capEl.classList.remove('on'),ms||5000)};

  // ---------- renderer, cảnh ----------
  const R=new THREE.WebGLRenderer({canvas:cv,antialias:!LOW,powerPreference:'high-performance'});R.setPixelRatio(Math.min(LOW?1.5:2,devicePixelRatio||1));R.outputColorSpace=THREE.SRGBColorSpace;R.toneMapping=THREE.ACESFilmicToneMapping;R.toneMappingExposure=1.05;
  const sc=new THREE.Scene();sc.fog=new THREE.FogExp2('#3e5880',.0052);
  const cam=new THREE.PerspectiveCamera(62,1,.1,1400);/* cùng góc nhìn 62° với Rừng Yên, Vịnh Yên */
  const hemi=new THREE.HemisphereLight('#c4d6f2','#56688e',1.45);sc.add(hemi);
  const moon=new THREE.DirectionalLight('#dfe8ff',1.0);moon.position.set(-60,80,40);sc.add(moon);
  const warm=(x,y,z,i,d)=>{const l=new THREE.PointLight('#ffb366',i,d,1.6);l.position.set(x,y,z);sc.add(l);return l},houseWarm=[],warmH=(...a)=>{const l=warm(...a);l.userData.i0=l.intensity;houseWarm.push(l);return l};/* warmH: ánh ấm hắt từ nhà, tắt khi không bật Giáng sinh */

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
  const S=new Batch(),L=new Batch(),LA=new Batch(),T=new Batch(),XS=new Batch(),XL=new Batch();/* L: cửa sổ, đèn nhà, chỉ sáng ở bản Giáng sinh · LA: luôn sáng (chùa, đèn đá, lửa, lều) *//* XS, XL: trang trí Giáng sinh, chỉ hiện ở phiên bản Giáng sinh */
  const LIT=()=>true;const I4=new THREE.Matrix4(),bulb=(x,y,z,c)=>{const t0=XL.T;XL.T=I4;XL.add(G.sphLo,c||'#ffd896',MX(x,y,z,.075));XL.T=t0};
  for(const p of PATHS)for(let i=0;i+1<p.length;i++){const [ax,az]=p[i],[bx,bz]=p[i+1],ln=Math.hypot(bx-ax,bz-az);if(ln<.01)continue;const ux=(bx-ax)/ln,uz=(bz-az)/ln,n=Math.max(1,Math.round(ln/3));
    for(let k=0;k<n;k++){const t=(k+.5)/n,x=ax+(bx-ax)*t,z=az+(bz-az)*t;for(const sd of [-1,1]){const px=x-uz*1.75*sd,pz=z+ux*1.75*sd;bulb(px,H(px,pz)+.12,pz,k%3?'#ffd896':'#fff0d0')}}}/* đèn nhỏ dọc hai mép đường đi *//* nguyên tắc toàn bản đồ: không cột đèn, chỉ đèn nhỏ gắn trên đường, hàng rào, kiến trúc, và chỉ bật ở bản Giáng sinh */const _lv=new THREE.Vector3();{const _la=L.add.bind(L);L.add=function(geo,col,m){if(geo===G.sphLo||geo===G.sph||col==='#ffd08a'){const t0=XL.T;XL.T=this.T;XL.add(geo,col,m);XL.T=t0;return this}return _la(geo,col,m)}}/* bóng đèn trang trí chỉ bật cùng nút Giáng sinh *//* S: vật thể thường · L: đèn, cửa sổ sáng · T: cây thông */
  const colliders=[],TG={};const block=(x,z,r)=>colliders.push([x,z,r]);/* vật cản hình hộp theo đúng mặt bằng nhà (vòng tròn cũ để hở góc nhà, đi xuyên vách được) */const blockBox=(x,z,ry,hw,hd,lx,lz)=>{const cs=Math.cos(ry),sn=Math.sin(ry);lx=lx||0;lz=lz||0;colliders.push([x+cs*lx+sn*lz,z-sn*lx+cs*lz,Math.hypot(hw,hd),cs,sn,hw,hd])};

  // ---------- bầu trời đêm xanh thẫm và cực quang (theo ảnh chụp cực quang thật: dải lục toả tia, viền tím hồng) ----------
  // Cực quang: dải sáng uốn lượn ở "độ cao" cố định, dò dọc tia nhìn qua nhiều lớp nên có tia dọc và màu đổi theo chiều cao.
  const U={time:{value:0},boost:{value:1},camP:{value:new THREE.Vector3()},meP:{value:new THREE.Vector3()},fadeR:{value:0},night:{value:0}};
  // Làm mờ vật cản trước camera (như Rừng Yên, Vịnh Yên: vật cản giữa camera và nhân vật trong suốt bớt, không bị xoá).
  // Cảnh Xứ Yên gộp thành vài lưới lớn nên làm mờ theo điểm ảnh: phần vật thể nằm trong ống quanh đường nhìn camera → nhân vật
  // bị đục lỗ lưới mịn khoảng 75% (giống độ mờ .25 ở Rừng Yên), mép ống mờ dần; đoạn sát nhân vật giữ nguyên để không mờ chỗ đang đứng.
  const seeThrough=m=>{m.onBeforeCompile=sh=>{sh.uniforms.camP=U.camP;sh.uniforms.meP=U.meP;sh.uniforms.fadeR=U.fadeR;
    sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vSeeW;').replace('#include <project_vertex>','#include <project_vertex>\nvSeeW=(modelMatrix*vec4(transformed,1.)).xyz;');
    sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vSeeW;uniform vec3 camP,meP;uniform float fadeR;').replace('void main() {','void main() {\n if(fadeR>0.){vec3 ab=meP-camP;float L2=max(dot(ab,ab),1.),t=dot(vSeeW-camP,ab)/L2,lim=1.-2.2/sqrt(L2);if(t>0.&&t<lim){float d=length(vSeeW-(camP+ab*t)),k=smoothstep(fadeR,fadeR*.45,d)*smoothstep(0.,.08,t);float n=fract(52.9829189*fract(dot(gl_FragCoord.xy,vec2(.06711056,.00583715))));if(n<k*.75)discard;}}');};m.customProgramCacheKey=()=>'seeThrough'};seeThrough(LAM);seeThrough(GLOW);
  const AUR_STEPS=LOW?10:16;
  const SKYFN=`uniform float time,boost,night;
    float h2(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
    float n2(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h2(i),h2(i+vec2(1,0)),f.x),mix(h2(i+vec2(0,1)),h2(i+vec2(1,1)),f.x),f.y);}
    float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<3;i++){v+=a*n2(p);p=p*2.1+vec2(3.1,1.7);a*=.5;}return v;}
    /* 28/11 vẽ lại cực quang theo ảnh mẫu: mỗi dải là một tấm rèm đứng thật (giao tia nhìn với mặt rèm), chân rèm sắc hồng, lõi xanh lục sáng,
       tia dọc rõ, phía trên ngả xanh ngọc rồi tím nhạt dần; có rèm ở phía bắc, ngang đỉnh đầu, phía đông, tây và nam nên nhìn đâu cũng thấy */
    vec3 curtain(vec3 d,float z0,float A,float k,float ph,float yb,float yt,float sd,float gain){float hx=d.x,hz=d.z;if(hz*z0<=0.||abs(hz)<.03)return vec3(0.);
      float u=z0/hz;for(int i=0;i<4;i++){float s=u*hx;u=(z0+A*sin(k*s+ph+time*.05)+A*.45*sin(k*2.3*s-ph*1.7-time*.04))/hz;}if(u<=0.||u>45.)return vec3(0.);float s0=u*hx,res=abs(u*hz-(z0+A*sin(k*s0+ph+time*.05)+A*.45*sin(k*2.3*s0-ph*1.7-time*.04)));if(res>.25)return vec3(0.);/* chưa hội tụ (nhìn xiên dọc rèm): bỏ, tránh vệt răng cưa */
      float y=u*d.y,v=(y-yb)/(yt-yb),s=u*hx;if(v<-.25||v>1.)return vec3(0.);
      float ray=n2(vec2(s*5.5+time*.35,sd));ray=.12+1.6*ray*ray*ray;ray*=.55+.9*smoothstep(.25,.75,n2(vec2(s*.35-time*.03,sd+4.)));/* tia dọc sắc, mảng sáng tối dọc rèm */
      float prof=v<0.?exp(v*22.)*.1:smoothstep(0.,.035,v)*pow(1.-v,1.6)*(1.+1.2*exp(-v*14.));/* chân rèm sắc, sáng nhất ngay trên chân, nhạt dần lên cao; quầng mờ dưới chân */
      vec3 col=v<0.?vec3(.15,1.,.45):mix(vec3(1.,.3,.6),vec3(.15,1.,.45),smoothstep(.0,.06,v));col=mix(col,vec3(.25,.95,.55),smoothstep(.3,.55,v));col=mix(col,vec3(.62,.36,1.),smoothstep(.5,.9,v));
      col=mix(col,vec3(1.,.4,.7),.55*smoothstep(.62,.85,n2(vec2(s*.25+sd,time*.02)))*smoothstep(.35,.8,v));/* mảng hồng tím từng lúc */
      return col*prof*mix(1.,ray,exp(-u*.03))*gain*exp(-u*.035)*smoothstep(40.,22.,u)*smoothstep(.25,.05,res)*smoothstep(.06,.3,abs(hz)/max(length(vec2(hx,hz)),.001));}/* xa thì tia mịn lại để không lấp lánh răng cưa */
    vec3 aurora(vec3 d){if(d.y<.01)return vec3(0.);vec3 c=vec3(0.);
      c+=curtain(d,-4.,1.1,.55,0.,1.,3.2,1.,1.25);/* rèm lớn phía bắc */
      c+=curtain(d,-9.,2.,.3,1.3,1.,3.4,7.,.9);/* rèm thấp sát núi phía bắc */
      c+=curtain(d,-.7,.6,.9,2.,1.,3.,13.,.85);/* rèm vắt qua đỉnh đầu */
      c+=curtain(d.zyx,5.5,1.3,.45,4.,1.,3.,19.,.8);/* rèm phía đông */
      c+=curtain(d.zyx,-7.,1.6,.4,5.,1.,3.,23.,.6);/* rèm phía tây */
      c+=curtain(d,7.5,1.8,.35,3.,1.,3.,29.,.55);/* rèm phía nam */
      c*=smoothstep(.01,.08,d.y)*boost*1.15;return c/(1.+c*.3);}
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
    S.reset();L.reset();block(x,z,Math.max(w,d)/2+.8);blockBox(x,z,ry,w/2+.25,d/2+.25);if(o.porch!==false)for(const sx of [-1,1])blockBox(x,z,ry,.2,.2,sx*w*.28,d/2+2)}
  // lều kota gỗ sáu cạnh, mái nón, khói bếp
  function kota(x,z,r,col){const y=H(x,z);S.at(x,y,z,0);S.add(G.cyl6,col||'#a8805c',MX(0,.9,0,r,1.8,r));S.add(G.cone,'#9a7a5a',MX(0,1.8+r*.6,0,r*1.15,r*1.3,r*1.15,0,Math.PI/6,0));S.add(G.cone,SNOW,MX(0,1.95+r*.6,0,r*1.08,r*1.12,r*1.08,0,Math.PI/6,0));S.b('#2a1e16',0,.85,r*.86,.9,1.7,.1);LA.reset();LA.b('#ffb35a',x,y+.8,z+r*.9,.7,1.4,.05);S.reset();block(x,z,r+.6)}
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
      T.add(G.cone,i%2?'#2e5a48':'#284f40',MX(X,ty+th*.32,Z,r*1.04,th*.64,r*1.04,0,i*.45,0));
      T.add(G.cone12,'#1c382e',MX(X,ty+th*.55,Z,r*.86,th*.9,r*.86,0,i*.45+.2,0));/* lõi tối hơn để mép mỗi tầng tách khỏi tầng trên */
      {const vis=(h-3.2)/tiers,oc=y=>Math.max(r*1.04*(1-(y-ty)/(th*.64)),r*.86*(ty+th-y)/(th*.9))+.1,y2=ty+vis+.05,y1=ty+vis*.55,ym=ty+vis*.5;
        T.add(new THREE.CylinderGeometry(oc(y2),oc(y1),y2-y1,14,1,true).toNonIndexed(),SNOW,MX(X,(y1+y2)/2,Z,1,1,1,0,i*.45,0));
        for(let k=0;k<7;k++){const q=i*.45+(k+.5)/7*Math.PI*2,rr=oc(ym)*Math.cos(Math.PI/7)+.04;T.add(G.ico,SNOW,MX(X+Math.sin(q)*rr,ym,Z+Math.cos(q)*rr,.35+r*.07,.2,.26,0,q,0))}}/* 28/11: tuyết phủ gần nửa trên phần lộ của mỗi tầng, mép dưới để lá xanh lộ ra nên nhìn rõ từng tầng; cụm tuyết rủ xuống giữa mỗi mặt tán */}
    T.add(G.cone12,'#2e5a48',MX(X,base+h-2.9,Z,.8,2.6,.8));T.add(G.cone12,SNOW,MX(X,base+h-2.5,Z,.62,1.3,.62));
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
  // 28/11 vẽ lại nhà chính (công trình điểm nhấn Làng Lapland, người dùng dặn): giữ mặt bằng chữ thập, lõi gỗ súc trên chân đá,
  // tầng tháp dải cửa sổ, chóp nhọn nay tám mặt cao thanh hơn có bốn cửa mái nhỏ và huy hiệu Xứ Yên viền đèn; mái cánh có cửa mái,
  // hiên cổng có vòng nguyệt quế, dây lá thông, hai cây thông chậu. Đèn nhỏ viền kín mép mái, sống mái tháp, cạnh chóp, hiên, cửa sổ,
  // quấn xoắn quanh cột hiên. Không cột đèn; bóng đèn (XL) và trang trí lễ (XS) chỉ hiện khi bật Giáng sinh, cửa sổ (L) tắt lúc thường.
  function mainHall(v){const y=H(v.x,v.z);S.at(v.x,y,v.z,v.ry);L.at(v.x,y,v.z,v.ry);XL.T=S.T;XS.T=S.T;
    const K=LOW?1.4:1,BW='#ffd98e',BC='#fff3d6',BG='#ffc46a',PINE='#2d5544';
    const ln=(x0,y0,z0,x1,y1,z1,st,sag)=>{const n=Math.max(1,Math.round(Math.hypot(x1-x0,y1-y0,z1-z0)/((st||.42)*K)));for(let i=0;i<=n;i++){const t=i/n;XL.add(G.ico,i%6===0?BC:i%3?BW:BG,MX(x0+(x1-x0)*t,y0+(y1-y0)*t-Math.sin(t*Math.PI)*(sag||0),z0+(z1-z0)*t,.075))}};/* chuỗi bóng đèn nhỏ */
    const box4=(x,y,z,w,h)=>{ln(x-w/2,y-h/2,z,x+w/2,y-h/2,z,.3);ln(x-w/2,y+h/2,z,x+w/2,y+h/2,z,.3);ln(x-w/2,y-h/2,z,x-w/2,y+h/2,z,.3);ln(x+w/2,y-h/2,z,x+w/2,y+h/2,z,.3)};/* viền đèn quanh cửa sổ */
    const winF=(x,y,z,w,h)=>{win(x,y,z,0,w,h);S.b('#7a2e26',x-w/2-.32,y,z+.02,.3,h+.2,.08);S.b('#7a2e26',x+w/2+.32,y,z+.02,.3,h+.2,.08);/* cánh chớp gỗ đỏ trầm */
      S.b(FRAME,x,y-h/2-.2,z+.16,w+.5,.22,.34);S.b(SNOW,x,y-h/2-.07,z+.18,w+.46,.06,.3);XS.b(PINE,x,y-h/2-.02,z+.2,w+.3,.16,.22);for(const sx of [-1,0,1])XS.add(G.sphLo,'#b8322c',MX(x+sx*w*.33,y-h/2+.08,z+.26,.07));box4(x,y,z+.1,w+.36,h+.36)};/* bậu hoa có lá thông, quả đỏ */
    // ----- lõi nhà, mái loe, tầng tháp -----
    S.b(STONE,0,.6,0,9.8,1.2,9.8);logWall(0,1.2,0,9,3.2,9);
    S.add(G.pyr4,OAK,MX(0,5.15,0,6.2*1.414,1.7,6.2*1.414));S.add(G.pyr4,SNOW,MX(0,5.3,0,6.4*1.414,1.8,6.4*1.414));
    for(const [sx,sz] of [[-1,-1],[-1,1],[1,-1],[1,1]])ln(sx*6.4,4.44,sz*6.4,sx*3.25,5.32,sz*3.25,.4);/* đèn sống mái lõi */
    S.b(STONE,0,5.6,0,6.4,1.2,6.4);S.b(OAK,0,7.2,0,6,2.4,6);
    for(let k=0;k<4;k++){const q=k*Math.PI/2;for(let i=-1.5;i<=1.5;i++){const fx=Math.sin(q)*3.02+Math.cos(q)*i*1.3,fz=Math.cos(q)*3.02-Math.sin(q)*i*1.3;S.b('#8a6244',fx,7.25,fz,1.1,1.4,.08,q);L.b('#ffd79a',fx+Math.sin(q)*.03,7.25,fz+Math.cos(q)*.03,.9,1.2,.04,q);S.b('#8a6244',fx+Math.sin(q)*.06,7.25,fz+Math.cos(q)*.06,.06,1.2,.03,q)}}/* dải cửa sổ tầng tháp */
    for(const sx of [-1,1])for(const sz of [-1,1])S.b(RED,sx*3.02,7.2,sz*3.02,.22,2.4,.22);S.b(RED,0,6.1,0,6.12,.12,6.12);S.b(RED,0,8.3,0,6.12,.12,6.12);/* góc và đai gỗ đỏ */
    S.b(RED,0,6.35,3.55,4.4,.1,.1);for(let i=-2;i<=2;i++)S.b(RED,i*1.05,5.95,3.55,.1,.8,.1);S.b(OAK,0,5.55,3.3,4.6,.14,.8);ln(-2.2,6.45,3.6,2.2,6.45,3.6,.32);/* ban công lan can đỏ */
    XS.add(new THREE.CylinderGeometry(.09,.09,4.4,6).rotateZ(Math.PI/2).toNonIndexed(),PINE,MX(0,6.2,3.62,1));for(const sx of [-2.2,2.2])XS.add(G.sphLo,'#b8322c',MX(sx,6.2,3.7,.14));/* dây lá thông lan can */
    S.add(G.pyr4,OAK,MX(0,9.05,0,4.9*1.414,1.5,4.9*1.414));S.add(G.pyr4,SNOW,MX(0,9.2,0,5.1*1.414,1.6,5.1*1.414));/* mái tháp loe rộng */
    for(const [a,b] of [[[-5.1,5.1],[5.1,5.1]],[[5.1,5.1],[5.1,-5.1]],[[5.1,-5.1],[-5.1,-5.1]],[[-5.1,-5.1],[-5.1,5.1]]])ln(a[0],8.44,a[1],b[0],8.44,b[1],.42);
    for(const [sx,sz] of [[-1,-1],[-1,1],[1,-1],[1,1]])ln(sx*5.1,8.46,sz*5.1,sx*2.05,9.6,sz*2.05,.4);
    // ----- chóp tám mặt -----
    const sp0=9.6,sh=11.4,sr=2.35,ap=sr*Math.cos(Math.PI/8);
    S.add(new THREE.CylinderGeometry(sr*1.12,sr*1.12,.5,8).rotateY(Math.PI/8).toNonIndexed(),OAK,MX(0,sp0+.05,0,1));
    S.add(new THREE.CylinderGeometry(.0001,sr,sh,8).rotateY(Math.PI/8).toNonIndexed(),'#eef0f2',MX(0,sp0+.3+sh/2,0,1));
    for(let k=0;k<8;k++){const q=k*Math.PI/4+Math.PI/8,vx=Math.sin(q)*sr,vz=Math.cos(q)*sr;S.add(G.cyl,'#d8dce2',MX(vx/2,sp0+.3+sh/2,vz/2,.05,Math.hypot(sh,sr),.05,Math.atan2(sr,sh)*Math.cos(q)*-1,0,Math.atan2(sr,sh)*Math.sin(q)));
      ln(vx*1.02,sp0+.35,vz*1.02,0,sp0+.3+sh-.35,0,.5)}/* gờ cạnh chóp và đèn chạy dọc tám cạnh lên đỉnh */
    S.add(G.cyl12,'#d6b878',MX(0,sp0+.3+sh+.1,0,.16,.3,.16));S.add(G.cyl,'#9a958e',MX(0,sp0+.3+sh+1.1,0,.04,2,.04));S.add(G.sph,'#d6b878',MX(0,sp0+sh+2.2,0,.12));
    {const ty=sp0+sh+2.55;for(let k=0;k<5;k++){const q=k/5*Math.PI*2;XS.add(G.cone12,'#e3c88c',MX(Math.sin(q)*.22,ty+Math.cos(q)*.22,0,.12,.5,.06,0,0,-q))}XL.add(G.sph,'#fff0c4',MX(0,ty,0,.3))}/* sao vàng trên đỉnh */
    {const dy=sp0+1.6;for(let k=0;k<4;k++){const q=k*Math.PI/2,c=Math.cos(q),s=Math.sin(q),rr=ap*(1-(dy-sp0-.3)/sh),P=(lx,ly,lz)=>[lx*c+lz*s,ly,-lx*s+lz*c];/* bốn cửa mái nhỏ dưới chân chóp */
      if(k%2===0)continue;const [x0,,z0]=P(0,0,rr+.15);S.b(OAK,x0,dy,z0,1,1.3,1.1,q);L.b('#ffd79a',x0+s*.56,dy,z0+c*.56,.5,.75,.04,q);S.add(G.prism,SNOW,MX(x0,dy+.62,z0,1.4,.8,1.4,0,q,0));
      const [ax,,az]=P(-.7,0,rr+.75),[bx,,bz]=P(0,0,rr+.75),[cx2,,cz2]=P(.7,0,rr+.75);ln(ax,dy+.62,az,bx,dy+1.42,bz,.28);ln(bx,dy+1.42,bz,cx2,dy+.62,cz2,.28)}}
    {const ey=sp0+3.4,hw=ap*(1-(ey-sp0-.3)/sh)+.05,t=Math.atan(ap/sh);for(let k=0;k<4;k+=2){const q=k*Math.PI/2,ex=Math.sin(q)*hw,ez=Math.cos(q)*hw;/* huy hiệu Xứ Yên ở mặt trước và mặt sau chóp, vòng đèn quanh */
      S.add(G.cyl12,'#d6b878',MX(ex,ey,ez,.95,.05,.95,Math.PI/2-t,q,0));S.add(G.cyl12,IVORY,MX(ex+Math.sin(q)*.03,ey+.01,ez+Math.cos(q)*.03,.8,.05,.8,Math.PI/2-t,q,0));S.add(G.cyl6,'#2f5a4a',MX(ex+Math.sin(q)*.06,ey+.02,ez+Math.cos(q)*.06,.45,.05,.45,Math.PI/2-t,q,0));S.add(G.cyl6,IVORY,MX(ex+Math.sin(q)*.09,ey+.03,ez+Math.cos(q)*.09,.18,.05,.18,Math.PI/2-t,q,0));
      const N=Math.round(18/K);for(let i=0;i<N;i++){const a=i/N*Math.PI*2,lx=Math.cos(a)*1.15,ly=Math.sin(a)*1.15,ux=0,uy=Math.cos(t),uz=-Math.sin(t),px=lx,py=ly*uy,pz=ly*uz+.12;XL.add(G.ico,i%2?BW:BC,MX(ex+px*Math.cos(q)+pz*Math.sin(q),ey+py,ez-px*Math.sin(q)+pz*Math.cos(q),.075))}}}
    // ----- hai cánh và cánh sau -----
    for(const sx of [-1,1]){const cx=sx*8.3;S.b(STONE,cx,.3,0,7.8,.6,7.4);logWall(cx,.6,0,7.6,3,7);snowRoof(cx,3.6,0,7,2.6,7.8,Math.PI/2);
      for(const wx of [-2.4,0,2.4])winF(cx+wx,2.1,3.53,1,1.2);S.add(G.cyl6,'#5c5550',MX(cx+sx*1.8,6.2,-1.2,.45,1.6,.45));S.b(SNOW,cx+sx*1.8,7.05,-1.2,.95,.14,.95);
      const ex=cx+sx*4.45,e0=cx-sx*1.7;/* đèn mép mái trước, sau, đầu hồi */
      for(const sz of [-1,1])ln(e0,3.64,sz*4.17,ex,3.64,sz*4.17,.42,.06);for(const sz of [-1,1])ln(ex,3.66,sz*4.17,ex,6.68,0,.4);
      S.add(G.cyl12,FRAME,MX(cx+sx*3.86,5,0,.62,.08,.62,0,0,Math.PI/2));L.add(G.cyl12,'#ffd79a',MX(cx+sx*3.92,5,0,.5,.06,.5,0,0,Math.PI/2));ln(cx+sx*3.98,4.38,-.62,cx+sx*3.98,4.38,.62,.3);/* cửa sổ tròn đầu hồi */
      for(const dx of [-1.3,1.3]){const x=cx+dx,z0=2.55,yb=3.62+3.05*(1-z0/4.15);S.b(LOG,x,yb+.55,z0-.8,1.25,1.5,1.7);S.b(FRAME,x,yb+.62,z0+.06,.78,.9,.06);L.b('#ffd79a',x,yb+.62,z0+.09,.6,.72,.04);
        S.add(G.prism,OAK,MX(x,yb+1.25,z0-.75,1.5,.7,2.1));S.add(G.prism,SNOW,MX(x,yb+1.32,z0-.75,1.65,.78,2.2));ln(x-.82,yb+1.32,z0+.36,x,yb+2.08,z0+.36,.25);ln(x,yb+2.08,z0+.36,x+.82,yb+1.32,z0+.36,.25)}}/* cửa mái */
    S.b(STONE,0,.3,-8.2,7.4,.6,7.6);logWall(0,.6,-8.2,7,3,7.2);snowRoof(0,3.6,-8.2,7,2.6,7.4,0);
    for(const sx of [-1,1]){ln(sx*4.17,3.64,-4.6,sx*4.17,3.64,-12.4,.45,.06);ln(sx*4.17,3.66,-12.45,0,6.68,-12.45,.42)}/* đèn cánh sau */
    // ----- hiên cổng -----
    {const pz=7.1;S.b(STONE,0,.35,pz,6.2,.7,4.6);for(const sx of [-2.3,2.3])for(const sz of [-1.6,1.6]){S.add(G.cyl12,OAK,MX(sx,2.3,pz+sz,.34,3.3,.34));S.add(G.cyl12,STONE,MX(sx,.85,pz+sz,.5,.3,.5));S.add(G.cyl12,'#d6b878',MX(sx,3.9,pz+sz,.4,.12,.4));
        for(let i=0;i<Math.round(20/K);i++){const a=i*1.05,h=1.05+i*(2.75/(Math.round(20/K)-1));XL.add(G.ico,i%2?BW:BC,MX(sx+Math.cos(a)*.4,h,pz+sz+Math.sin(a)*.4,.07))}}/* cột gỗ tròn to, đèn quấn xoắn */
      for(const sx of [-2.3,2.3])S.add(G.cyl12,OAK,MX(sx,4,pz,.24,4.2,.24,Math.PI/2,0,0));S.add(G.cyl12,OAK,MX(0,4.05,pz+2.1,.24,5,.24,0,0,Math.PI/2));
      snowRoof(0,4.1,pz,5.6,2.4,4.8,0);for(const sd of [-1,1])S.add(G.cyl12,OAK,MX(sd*1.4,4.8,pz+2.45,.16,3.1,.16,0,0,sd*1.0));
      for(const sd of [-1,1]){ln(sd*3.47,4.14,pz+2.96,0,6.98,pz+2.96,.36);ln(sd*3.47,4.13,pz-1.8,sd*3.47,4.13,pz+2.96,.42,.05)}/* đèn đầu hồi và mép mái hiên */
      XS.add(WREATH,PINE,MX(0,5.35,pz+3.02,1.25,1.25,1.6));XS.b('#b8322c',0,4.82,pz+3.08,.34,.26,.08);for(const sd of [-1,1])XS.b('#b8322c',sd*.18,4.6,pz+3.08,.1,.4,.06,0,0,sd*.3);
      {const N=Math.round(18/K);for(let i=0;i<N;i++){const a=i/N*Math.PI*2;XL.add(G.ico,i%2?BC:BG,MX(Math.cos(a)*.62,5.35+Math.sin(a)*.62,pz+3.12,.065))}}/* vòng nguyệt quế lớn nơ đỏ, viền đèn */
      for(let i=0;i<=12;i++){const t=i/12,x=-2.3+4.6*t,yy=3.9-Math.sin((t*2%1)*Math.PI)*.38;XS.add(G.ico,PINE,MX(x,yy,pz+2.22,.2,.15,.15,0,i,0));if(i%2)XL.add(G.ico,i%4===1?BC:BG,MX(x,yy-.12,pz+2.38,.07))}/* dây lá thông võng giữa cột */
      for(let k=0;k<4;k++)S.b('#a9b0b9',0,.62-k*.17,pz+2.6+k*.45,4.6,.17,.45);S.b('#4a3424',0,3.2,pz+2.25,2.6,.6,.12);S.add(G.cyl6,'#d6b878',MX(0,3.2,pz+2.33,.22,.04,.22,Math.PI/2,0,0));
      S.b('#3b2a20',0,1.7,4.53,1.6,2.4,.1);S.b('#5a3c28',-.41,1.7,4.6,.7,2.2,.04);S.b('#5a3c28',.41,1.7,4.6,.7,2.2,.04);L.b('#ffd08a',0,3.1,4.55,1.4,.5,.04);box4(0,1.95,4.64,1.9,2.85);/* cửa đôi, ô kính vòm */
      for(const sx of [-1,1])winF(sx*2.9,2.3,4.53,1.1,1.3);
      for(const sx of [-3.35,3.35]){const tz=pz+3.4;S.b('#7a5434',sx,.3,tz,.8,.6,.8);S.b('#d6b878',sx,.62,tz,.86,.06,.86);for(const [r,hh,yy] of [[.75,1.1,1.1],[.55,.9,1.65],[.32,.7,2.15]]){S.add(G.cone12,PINE,MX(sx,yy,tz,r,hh,r));S.add(G.cone12,SNOW,MX(sx,yy+hh*.22,tz,r*.7,hh*.4,r*.7))}
        for(let i=0;i<14;i++){const a=i*1.3,hh=.75+i*.12,rr=.8-i*.045;XL.add(G.ico,i%2?BW:BC,MX(sx+Math.cos(a)*rr,hh,tz+Math.sin(a)*rr,.06))}for(let i=0;i<5;i++){const a=i*1.9+1;XS.add(G.sphLo,i%2?'#c8a24e':'#b8322c',MX(sx+Math.cos(a)*.6,1+i*.22,tz+Math.sin(a)*.6,.08))}XL.add(G.sph,'#fff0c4',MX(sx,2.55,tz,.1))}}/* hai cây thông chậu hai bên bậc */
    for(const sx of [-1,1]){S.b(STONE,sx*8.3,.5,5,7.8,1,.6);S.b(RED,sx*8.3,1.35,5,7.8,.1,.1);for(let i=0;i<9;i++)S.b(RED,sx*8.3-3.6+i*.9,1.05,5,.08,.6,.08);ln(sx*4.5,1.44,5,sx*12.1,1.44,5,.36)}/* lan can đỏ trên kè đá, đèn dọc tay vịn */
    S.reset();L.reset();XL.reset();XS.reset();const sn=Math.sin(v.ry),cs=Math.cos(v.ry);block(v.x,v.z,6);blockBox(v.x,v.z,v.ry,4.95,4.95);for(const sx of [-8.3,8.3])block(v.x+cs*sx,v.z-sn*sx,4.4);block(v.x-sn*8.2,v.z-cs*8.2,4.2);block(v.x+sn*7.1,v.z+cs*7.1,2.4);
    for(const sx of [-3.35,3.35])block(v.x+cs*sx+sn*10.5,v.z-sn*sx+cs*10.5,.6)}
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
      S.reset();L.reset();block(v.x,v.z,Math.max(w,d)*.55);blockBox(v.x,v.z,v.ry,w/2+.35,d/2+.35);blockBox(v.x,v.z,v.ry,w*.4,1.2,0,d/2+1.4);return}
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
    S.reset();L.reset();block(v.x,v.z,Math.max(w,d)*.55);blockBox(v.x,v.z,v.ry,w/2+.25,d/2+.25);for(const sx of [-1.2,1.2])blockBox(v.x,v.z,v.ry,.2,.2,sx,d/2+1.5)}
  for(const v of VH){const sn=Math.sin(v.ry),cs=Math.cos(v.ry);if(v.k==='main')mainHall(v);else logHouse(v);
    if(v.k==='cafe')for(const k of [-1.8,1.8]){const bx=v.x+cs*k+sn*(v.d/2+3.2),bz=v.z-sn*k+cs*(v.d/2+3.2),by=H(bx,bz);S.add(G.cyl12,'#a07a56',MX(bx,by+.45,bz,.5,.06,.5));S.b('#a07a56',bx,by+.22,bz,.1,.45,.1);S.b('#c5a36f',bx,by+1.6,bz,1.4,.06,1.4)}}
  for(let i=0;i<12;i++){const a=i/12*Math.PI*2+.13;/* ghế gỗ quanh gốc cây thông */
    if(i%3===1){const bx=TREE.x+Math.cos(a+.26)*11,bz=TREE.z+Math.sin(a+.26)*11,by=H(bx,bz),br=-a-.26+Math.PI/2;S.b('#a07a56',bx,by+.45,bz,1.8,.1,.5,br);S.b(SNOW,bx,by+.53,bz,1.7,.05,.45,br);S.b('#a07a56',bx,by+.8,bz,1.8,.5,.08,br)}}
  // ---------- Hội Chợ Giáng Sinh Xứ Yên (Bạn đồng hành, Giáng sinh 2026): theo tranh mẫu người dùng gửi 28/11 ----------
  // Người tuyết lớn ở giữa trên bệ tuyết; 6 gian gỗ hai bên, mỗi bên 3 gian, xếp vòng cung bán kính 14 m mở về phía sân băng.
  // Gian: mái dốc phủ tuyết dày, đầu hồi gỗ có vòng lá thông nơ đỏ, biển gỗ khắc tên, mái hiên sọc đỏ trắng, dây đèn viền mái, hàng bày trên quầy,
  // chậu trạng nguyên trước gian. Không đèn lồng đứng, không trụ đèn: chỉ đèn trang trí gắn lên gian, cổng (người dùng dặn 28/11). Lối lát đá uốn vòng trước các gian; cổng chào gỗ phía trước có biển, nơ đỏ, chuông vàng, hai lính gỗ, hàng rào thấp.
  // Đèn (L, XL) chỉ sáng ở bản Giáng sinh; trang trí lễ (XS) chỉ hiện ở bản Giáng sinh. Gian chưa có nhà tài trợ: biển trơn, quầy phủ tuyết.
  const BOOTHS=[];{const R=14,AS=[-1.22,-1.75,-2.27,1.22,1.75,2.27]/* bắc: 3 gian, nam: 3 gian */,FX=SNOWMAN.x+9,FZ=SNOWMAN.z,
    WOOD='#9a6a44',WOODL='#b98a5c',WOODD='#6e4a30',TOP='#d9c09a',RED='#b8322c',CRM='#f3ead8',PINE='#2e5a48',GOLD='#d6b878',COB='#8d8a98',COBL='#a7a4b0';
    const SPON={0:{name:'ANN CANDLE',th:'candle',sub:' '},3:{name:'MsSlim',th:'rice',sub:'CƠM ĐỘ DƯỠNG'}};
    const PAL0={wall:WOOD,plank:WOODL,post:WOODD,gable:WOOD,roof:WOODD,a1:RED,a2:CRM,bow:RED},PALS={rice:{wall:'#6b4a32',plank:'#7d5a3e',post:'#4a3122',gable:'#7a3a5c',roof:'#4a3122',a1:'#7a3a5c',a2:'#f1e8d6',bow:GOLD,sg:{bg:'#6a2f4f',fg:'#f6ecd6',fg2:'#e0bf7a'}},
      candle:{wall:'#3f5a46',plank:'#4b6a53',post:'#2c4233',gable:'#3f5a46',roof:'#2c4233',a1:'#a8302c',a2:'#f3ead8',bow:'#b8322c',bell:true,sg:{bg:'#f3ead8',fg:'#6a4428',fg2:'#b8935a',bd:'#c9a24e',lotus:true}}};/* Ann Candle: xanh thông, đỏ Noel, kem champagne, vàng ánh nến (người dùng gửi 28/11) *//* MsSlim: tím mận, kem ivory, nâu walnut, champagne, sage (người dùng gửi 28/11) *//* gian thật: Ann Candle (nến thơm thủ công), MsSlim (cơm độ dưỡng) */
    let demo=[];try{if(new URLSearchParams(location.search).has('gian-mau'))demo=['Đồ Uống Ấm','Quà Lưu Niệm','Sách & Thiền','Bánh & Ngọt','Đồ Trang Trí','Len Ấm Mùa Đông']}catch(e){}
    const plaque=(t,w,h,f,o)=>{o=o||{};const c=document.createElement('canvas');c.width=w||512;c.height=h||128;const g=c.getContext('2d'),W=c.width,Hh=c.height;g.fillStyle=o.bg||'#6a4428';if(g.roundRect){g.beginPath();g.roundRect(4,4,W-8,Hh-8,Hh*.3);g.fill()}else g.fillRect(0,0,W,Hh);g.strokeStyle=o.bd||'#e0bf7a';g.lineWidth=6;if(g.roundRect){g.beginPath();g.roundRect(12,12,W-24,Hh-24,Hh*.24);g.stroke()}
      g.textAlign='center';g.textBaseline='middle';g.fillStyle=o.fg||'#fbefd2';const L2=String(t||'✧').split('\n'),fs=f||(t?50:44),dy=o.lotus?Hh*.12:o.sub?-Hh*.12:0;if(o.lotus){const cx=W/2,cy=Hh*.27;g.strokeStyle=o.fg2;g.lineWidth=3;for(const [a,r] of [[0,1],[-.55,.85],[.55,.85],[-1.05,.6],[1.05,.6]]){g.save();g.translate(cx,cy+12);g.rotate(a);g.beginPath();g.ellipse(0,-16*r,7*r,16*r,0,0,7);g.stroke();g.restore()}}g.font='600 '+fs+'px Georgia,serif';L2.forEach((s,i)=>g.fillText(s,W/2,Hh/2+dy+(i-(L2.length-1)/2)*fs*1.15,W-60));if(o.sub&&o.sub.trim()){g.font='500 '+Math.round(fs*.42)+'px system-ui,sans-serif';g.fillStyle=o.fg2||'#e0bf7a';g.fillText('— '+o.sub.split('').join('\u200a')+' —',W/2,Hh*.74,W-60)}const tx=new THREE.CanvasTexture(c);tx.colorSpace=THREE.SRGBColorSpace;return tx};
    const sign=(t,x,y,z,ry,w,h,tw,th,fs,two,o)=>{const mt=new THREE.MeshBasicMaterial({map:plaque(t,tw,th,fs,o),fog:true}),m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),mt);m.position.set(x,y,z);m.rotation.y=ry;sc.add(m);if(two){const m2=m.clone();m2.rotation.y=ry+Math.PI;m2.position.set(x-Math.sin(ry)*.06,y,z-Math.cos(ry)*.06);sc.add(m2)}return m};
    const poins=(x,y,z)=>{S.add(G.cyl12,'#8a5a3a',MX(x,y+.18,z,.26,.36,.26));for(let i=0;i<6;i++){const q=i/6*6.28;XS.add(G.ico,RED,MX(x+Math.cos(q)*.17,y+.45,z+Math.sin(q)*.17,.14,.06,.14,0,q,0))}XS.add(G.ico,PINE,MX(x,y+.4,z,.22,.08,.22));XS.add(G.sph,GOLD,MX(x,y+.5,z,.05))};
    const gift=(B,x,y,z,s,c,r)=>{B.b(c,x,y+s/2,z,s,s,s,r||0);B.b(GOLD,x,y+s/2,z,s+.02,s+.02,s*.18,r||0);B.b(GOLD,x,y+s/2,z,s*.18,s+.02,s+.02,r||0)};
    // lối lát đá: vòng bán kính 9,5 m trước các gian, lối thẳng từ vòng ra cổng chào và tới đường đi phía đông
    {const seg=(x0,z0,x1,z1,w)=>{const l=Math.hypot(x1-x0,z1-z0),mx=(x0+x1)/2,mz=(z0+z1)/2,r=Math.atan2(x1-x0,z1-z0);S.b(COB,mx,H(mx,mz)+.035,mz,w,.04,l+.05,r);for(const sd of [-1,1]){const ex=mx+Math.cos(r)*sd*(w/2+.12),ez=mz-Math.sin(r)*sd*(w/2+.12);S.b(COBL,ex,H(ex,ez)+.05,ez,.22,.07,l+.05,r)}};
      const RR=9.5,n=44;for(let i=0;i<n;i++){const q0=-2.55+5.1*i/n,q1=-2.55+5.1*(i+1)/n;seg(SNOWMAN.x+Math.cos(q0)*RR,SNOWMAN.z+Math.sin(q0)*RR,SNOWMAN.x+Math.cos(q1)*RR,SNOWMAN.z+Math.sin(q1)*RR,2.4)}
      for(let i=0;i<6;i++){const x0=SNOWMAN.x+RR+i*1.05,x1=x0+1.05;seg(x0,SNOWMAN.z,x1,SNOWMAN.z,2.8)}}
    // bệ tuyết tròn quanh người tuyết, hộp quà
    {const sx=SNOWMAN.x,sz=SNOWMAN.z,y=H(sx,sz);S.add(G.cyl12,SNOW,MX(sx,y+.14,sz,3.35,.28,3.35));S.add(G.cyl12,'#e3e8f0',MX(sx,y+.05,sz,3.5,.1,3.5));
      [[.2,.5,RED],[-.25,.38,'#2f5b48'],[.0,.3,CRM]].forEach(([q,s,c],i)=>gift(XS,sx+Math.cos(q)*2.6,y+.28,sz+Math.sin(q)*2.6,s,c,q))}
    // 6 gian hàng
    for(let k=0;k<AS.length;k++){const a=AS[k],x=SNOWMAN.x+Math.cos(a)*R,z=SNOWMAN.z+Math.sin(a)*R,y=H(x,z),ry=Math.atan2(FX-x,FZ-z),sp=SPON[k],name=sp?sp.name:(demo[k]||''),th=sp&&sp.th,PA=PALS[th]||PAL0;
      S.at(x,y,z,ry);L.at(x,y,z,ry);XS.at(x,y,z,ry);XL.at(x,y,z,ry);
      S.b('#a99a84',0,.08,0,3.8,.16,3.0);/* sàn */
      S.b(PA.wall,0,1.3,-1.25,3.3,2.4,.14);for(const sx of [-1,1])S.b(PA.wall,sx*1.6,1.3,0,.14,2.4,2.5);/* vách sau, hai vách hông */
      for(let i=0;i<6;i++)S.b(i%2?PA.plank:PA.wall,0,.3+i*.4,-1.17,3.2,.05,.02);/* đường ván ngang */
      for(const sx of [-1,1])S.b(PA.post,sx*1.62,1.3,1.25,.2,2.6,.2);/* cột trước */
      S.b(PA.wall,0,.55,1.1,3.1,.95,.3);for(let i=0;i<8;i++)S.b(PA.plank,-1.4+i*.4,.55,1.26,.03,.9,.02);S.b(TOP,0,1.06,1.15,3.3,.08,.5);/* quầy, ván dọc */
      S.b(WOODL,0,2.4,1.27,3.44,.3,.1);/* xà ngang trước */
      S.add(G.prism,PA.roof,MX(0,2.55,0,4.1,1.35,3.25));S.add(G.prism,PA.gable,MX(0,2.56,.02,3.5,1.18,3.3));if(PA.sg){S.b(GOLD,0,2.57,1.66,3.5,.04,.02);for(const sx of [-1,1])S.b(GOLD,sx*.88,3.2,1.66,2.05,.035,.02,0,0,sx*-.6)}/* mái gỗ, đầu hồi */
      S.add(G.prism,SNOW,MX(0,2.72,-.05,4.35,1.42,3.05));for(const sx of [-1,1])S.b(SNOW,sx*1.95,2.6,-.05,.5,.22,3.1,0,0,sx*-.55);/* tuyết dày trên mái, mép tuyết rủ */
      {const WY=PA.sg?3.56:3.12,WS=PA.sg?.42:.62,wr=WS*.43;S.add(WREATH,PINE,MX(0,WY,1.68,WS,WS,.9));XS.b(PA.bow,-.12,WY-wr-.04,1.74,.22,.14,.05,0,0,.5);XS.b(PA.bow,.12,WY-wr-.04,1.74,.22,.14,.05,0,0,-.5);XS.b(PA.bow,0,WY-wr-.04,1.76,.08,.1,.06);XS.b(PA.bow,-.07,WY-wr-.18,1.74,.06,.22,.04,0,0,-.3);XS.b(PA.bow,.07,WY-wr-.18,1.74,.06,.22,.04,0,0,.3);for(let j=0;j<6;j++){const q=j/6*6.28+.3;XS.add(G.sph,j%2?RED:'#efe6d2',MX(Math.cos(q)*wr,WY+Math.sin(q)*wr,1.75,.045))}if(PA.bell)XS.add(G.cone12,GOLD,MX(0,WY-.02,1.74,.09,.16,.09))}/* vòng lá thông nơ đỏ */
      for(let i=0;i<8;i++){const lx=-1.58+i*.452;S.b(i%2?PA.a2:PA.a1,lx,2.02,1.62,.452,.04,.78,0,.42,0)}for(let i=0;i<8;i++)S.b(i%2?PA.a2:PA.a1,-1.58+i*.452,1.76,1.95,.452,.2,.03);/* mái hiên sọc đỏ trắng, diềm lượn */
      stringLights(L,-2.05,2.58,1.66,0,3.9,1.66,10,0);stringLights(L,0,3.9,1.66,2.05,2.58,1.66,10,0);stringLights(L,-1.6,2.25,1.34,1.6,2.25,1.34,10,.1);/* đèn viền mái và xà */{const fz=1.29,x0=1.48,yt=.96,yb=.17;stringLights(L,-x0,yt,fz,x0,yt,fz,13,0);stringLights(L,-x0,yb,fz,x0,yb,fz,13,0);for(const sx of [-1,1])stringLights(L,sx*x0,yb,fz,sx*x0,yt,fz,4,0)}/* đèn viền ô chữ nhật mặt quầy phía dưới (người dùng dặn 28/11) */
      if(!name)S.b(SNOW,0,1.12,1.15,3.2,.05,.45);
      else if(th==='candle'){/* Ann Candle: kệ ba tầng; tầng dưới nến hoa cúc, mẫu đơn, nến bánh kem, hộp quà thắt nơ đỏ, ba bảng nhỏ; tầng giữa nến bơ hoa sen trong bát sen pastel;
        tầng trên nến ly ngà có ngọn lửa, nến trái tim, hộp quà. Hoạ tiết hoa sen vàng trên mặt quầy. Ngọn lửa chỉ sáng ở bản Giáng sinh. */
        const CR='#f3ead8',flame=(lx,ly,lz,s)=>XL.add(G.cone12,'#ffcf6a',MX(lx,ly,lz,.025*(s||1),.08*(s||1),.025*(s||1)));
        for(const [ty,tz] of [[1.27,.6],[1.47,.12]]){S.b('#d9b98a',0,ty,tz,3.0,.05,.4);for(const sx of [-1.45,0,1.45])S.b('#b98a5c',sx,ty-.16,tz,.05,.32,.36)}/* kệ bậc */
        [['#f2c94c',-1.3],['#e79ab0',-.95],['#f6efe0',-.6]].forEach(([c,lx])=>{S.add(G.cyl12,'#7f9a7a',MX(lx,1.15,1.15,.13,.08,.13));for(let j=0;j<8;j++){const q=j/8*6.28;S.add(G.sph,c,MX(lx+Math.cos(q)*.09,1.24,1.15+Math.sin(q)*.09,.06,.035,.06))}S.add(G.sph,'#e8b84a',MX(lx,1.25,1.15,.04))});/* nến hoa cúc, mẫu đơn */
        S.add(G.cyl12,'#6f9ad0',MX(.15,1.2,1.14,.17,.18,.17));S.add(G.cyl12,'#f6efe0',MX(.15,1.3,1.14,.18,.04,.18));for(let j=0;j<7;j++){const q=j/7*6.28;S.add(G.sph,'#3f6fb8',MX(.15+Math.cos(q)*.1,1.35,1.14+Math.sin(q)*.1,.045))}flame(.15,1.42,1.14);/* nến bánh kem xanh */
        S.b('#f3e6d2',.6,1.18,1.12,.32,.14,.24,.2);for(const [dx,c] of [[-.08,'#e15b6a'],[.04,'#f2c94c'],[.1,'#7fb77e']])S.add(G.sph,c,MX(.6+dx,1.27,1.12,.04));/* nến bánh kem trái cây */
        S.b(CR,1.15,1.21,1.12,.36,.2,.26);S.b(RED,1.15,1.21,1.12,.06,.21,.27);S.b(RED,1.15,1.21,1.12,.37,.21,.06);XS.b(RED,1.08,1.34,1.12,.12,.07,.04,0,0,.5);XS.b(RED,1.22,1.34,1.12,.12,.07,.04,0,0,-.5);/* hộp quà handmade nơ đỏ */
        [['#bfe3d6',-1.1],['#d9c7e6',-.55],['#f3e6c4',0],['#f2c9d2',.55],['#bfe3d6',1.1]].forEach(([c,lx])=>{const lz=.6,ly=1.37;S.add(G.cyl12,c,MX(lx,ly,lz,.17,.14,.17));for(let j=0;j<6;j++){const q=j/6*6.28;S.add(G.cone12,c,MX(lx+Math.cos(q)*.14,ly+.08,lz+Math.sin(q)*.14,.06,.16,.06,Math.cos(q)*.5,0,-Math.sin(q)*.5))}S.add(G.cyl12,'#f2c24e',MX(lx,ly+.07,lz,.13,.02,.13));XS.add(G.sph,'#d9577f',MX(lx,ly+.1,lz,.05))});/* nến bơ hoa sen */
        for(let i=0;i<4;i++){const lx=-1.25+i*.4;S.add(G.cyl12,'#f6efe0',MX(lx,1.61,.12,.12,.22,.12));S.b(['#d9c7e6','#f2c9d2','#bfe3d6','#f3e6c4'][i],lx,1.59,.24,.1,.08,.005);flame(lx,1.77,.12)}/* nến ly tinh dầu */
        for(const [dx,dy] of [[0,0],[.14,0],[.07,.12],[-.07,.12],[.21,.12],[.07,.24]])S.add(G.sph,'#f2a7bd',MX(.5+dx,1.57+dy,.12,.075));/* nến trái tim */
        S.add(G.cyl12,'#f6efe0',MX(1.05,1.59,.12,.15,.18,.15));for(const [dx,dz,c] of [[-.05,0,'#9b7fc4'],[.05,.03,'#f2c9d2'],[0,-.05,'#7a5aa0']])S.add(G.ico,c,MX(1.05+dx,1.7,.12+dz,.04));/* nến đính đá */
        S.b(CR,1.4,1.61,.12,.24,.22,.2);S.b(RED,1.4,1.61,.12,.05,.23,.21);/* hộp quà nhỏ */
        const tag=(t,lx)=>{const c=document.createElement('canvas');c.width=256;c.height=96;const g=c.getContext('2d');g.fillStyle='#f6eedc';g.fillRect(0,0,256,96);g.strokeStyle='#c9a24e';g.lineWidth=4;g.strokeRect(6,6,244,84);g.fillStyle='#5a3a22';g.textAlign='center';g.font='600 26px Georgia,serif';const w=t.split('|');w.forEach((s2,i)=>g.fillText(s2,128,40+i*30));const tx=new THREE.CanvasTexture(c);tx.colorSpace=THREE.SRGBColorSpace;const m=new THREE.Mesh(new THREE.PlaneGeometry(.36,.135),new THREE.MeshBasicMaterial({map:tx,fog:true}));m.position.set(x+Math.cos(ry)*lx+Math.sin(ry)*1.37,y+1.17,z-Math.sin(ry)*lx+Math.cos(ry)*1.37);m.rotation.set(-.35,ry,0,'YXZ');sc.add(m)};
        tag('Nến Hoa|Thủ Công',-.95);tag('Nến Thơm|Tinh Dầu',.15);tag('Nến Đá|Năng Lượng',.85);/* ba bảng nhỏ */
        {const ly=.6,lz=1.265;S.add(G.ico,GOLD,MX(0,ly+.04,lz,.08,.12,.02));for(const sx of [-1,1]){S.add(G.ico,GOLD,MX(sx*.1,ly,lz,.07,.1,.02,0,0,sx*.6));for(let j=0;j<4;j++){S.b(GOLD,sx*(.3+j*.22),ly-.04+Math.sin(j*1.3)*.05,lz,.22,.02,.01,0,0,sx*.2*Math.cos(j*1.3));S.add(G.ico,GOLD,MX(sx*(.32+j*.22),ly+.04+Math.sin(j*1.3)*.05,lz,.04,.025,.01,0,0,sx*.8))}}}/* hoạ tiết hoa sen vàng trên mặt quầy */}
      else if(th==='rice'){/* MsSlim: bát cơm tím trên đế gỗ, hai hộp cơm, hai túi cơm độ dưỡng đứng, hũ muối hạt; hai đèn nhỏ treo dưới mái hiên */
        const PL='#5e2a45',IV='#f1e8d6',RC='#6a3352';S.add(G.cyl12,'#b98a5c',MX(-1.15,1.12,1.12,.34,.04,.34));S.add(G.cyl12,IV,MX(-1.15,1.22,1.12,.27,.16,.27));S.add(G.sph,RC,MX(-1.15,1.3,1.12,.25,.11,.25));S.b(PL,-1.15,1.22,1.4,.08,.08,.01);/* bát cơm tím */
        for(const lx of [-.42,.12]){S.b('#e8eef2',lx,1.16,1.12,.46,.14,.32);S.b(RC,lx,1.2,1.12,.4,.06,.26);S.b(PL,lx,1.17,1.12,.12,.15,.33);S.b(IV,lx,1.2,1.29,.08,.06,.005)}/* hộp cơm MsSlim */
        for(const [lx,lz] of [[.72,1.02],[1.08,1.06]]){S.b(IV,lx,1.42,lz,.32,.62,.1);S.b(PL,lx,1.24,lz+.001,.32,.24,.1);S.add(G.sph,RC,MX(lx,1.42,lz+.055,.07,.05,.02));S.b(PL,lx,1.62,lz+.052,.14,.04,.005)}/* túi cơm độ dưỡng */
        S.b('#b98a5c',.72,1.12,1.02,.42,.05,.2);S.add(G.cyl12,'#f6efe0',MX(1.35,1.2,1.22,.09,.16,.09));S.add(G.cyl12,'#8a5a3a',MX(1.35,1.3,1.22,.095,.04,.095));S.add(G.sph,'#c9b08a',MX(1.35,1.17,1.22,.07,.05,.07));/* hũ muối 6 loại hạt */
        XS.add(G.ico,'#7f9a7a',MX(-1.45,1.26,.98,.16,.12,.12));XS.add(G.ico,'#7f9a7a',MX(1.45,1.3,.95,.14,.12,.12));for(const lx of [-1.42,1.48])XS.add(G.sph,RED,MX(lx,1.36,.98,.035));/* điểm sage, quả đỏ */
        for(const lx of [-1.0,1.0]){S.b('#2f2620',lx,2.0,1.0,.02,.16,.02);S.b(GOLD,lx,1.86,1.0,.14,.03,.14);XL.add(G.cyl12,'#ffcf7a',MX(lx,1.76,1.0,.065,.16,.065))}/* đèn nhỏ treo dưới mái hiên */
        for(let r=0;r<2;r++)for(let i=0;i<4;i++){const lx=-1.1+i*.73,ly=1.66+r*.55;S.b(IV,lx,ly+.12,-1.05,.22,.34,.08);S.b(PL,lx,ly+.02,-1.04,.22,.14,.08)}/* túi cơm trên kệ sau */}
      else{const v=k%3,C=[[RED,CRM,'#5b7da8'],['#c9a24e',RED,PINE],[CRM,'#8a5a3a',RED]][v];for(let i=0;i<5;i++)XS.b(C[i%3],-1.2+i*.6,1.24+(i%2)*.04,1.12,.42,.28+(i%2)*.08,.32,(i-2)*.1);
        S.add(G.sph,'#cfe3ef',MX(-.85,1.42,.6,.18));S.add(G.cyl12,GOLD,MX(-.85,1.27,.6,.13,.08,.13));S.add(G.cone12,PINE,MX(.95,1.5,.55,.2,.6,.2));XL.add(G.sphLo,'#ffe3a8',MX(.95,1.84,.55,.05))}/* hàng bày: hộp, quả cầu tuyết, cây thông nhỏ */
      for(let i=0;i<4;i++)S.b(i%2?'#8a5a3a':'#a8784e',-1.2+i*.8,1.6,-1.1,.6,.1,.3);/* kệ sau */
      if(th==='candle')for(const sx of [-1,1]){const bx=sx*2.05,bz=1.7;S.add(G.cyl12,'#8a5a3a',MX(bx,.28,bz,.3,.56,.3));for(const hy of [.12,.44])S.add(G.cyl12,GOLD,MX(bx,hy,bz,.31,.03,.31));XS.add(G.ico,PINE,MX(bx,.64,bz,.32,.16,.32));for(let j=0;j<7;j++){const q=j/7*6.28;XS.add(G.ico,RED,MX(bx+Math.cos(q)*.18,.76,bz+Math.sin(q)*.18,.13,.05,.13,0,q,0))}XS.add(G.sph,GOLD,MX(bx,.8,bz,.05))}/* chậu thùng gỗ hoa trạng nguyên */
      else if(th==='rice')for(const sx of [-1,1]){const bx=sx*2.05,bz=1.7;S.add(G.cyl12,'#8a5a3a',MX(bx,.28,bz,.3,.56,.3));for(const hy of [.12,.44])S.add(G.cyl12,'#4a3122',MX(bx,hy,bz,.31,.04,.31));XS.add(G.ico,PINE,MX(bx,.66,bz,.3,.2,.3));for(let j=0;j<5;j++){const q=j/5*6.28;XS.add(G.sph,RED,MX(bx+Math.cos(q)*.16,.78,bz+Math.sin(q)*.16,.05))}XS.add(G.ico,SNOW,MX(bx,.82,bz,.12,.06,.12));XS.b('#8c2f3a',bx,.5,bz+.31,.22,.12,.03,0,0,0)}/* chậu thùng gỗ cây thông quả đỏ */
      else{poins(-2.0,0,1.7);poins(2.0,0,1.7)}
      S.reset();L.reset();XS.reset();XL.reset();blockBox(x,z,ry,1.95,1.5);
      const m=sp&&sp.sub?sign(name,x+Math.sin(ry)*1.7,y+2.86,z+Math.cos(ry)*1.7,ry,2.2,.58,512,140,56,false,Object.assign({sub:sp.sub},PA.sg)):sign(name,x+Math.sin(ry)*1.36,y+2.4,z+Math.cos(ry)*1.36,ry,2.3,.52,512,116,name.length>13?44:50);
      BOOTHS.push({k,x,z,ry,name,th,sign:m,front:[x+Math.sin(ry)*3.4,z+Math.cos(ry)*3.4]});if(th)STATIONS.push({id:'booth_'+th,x:x+Math.sin(ry)*3.1,z:z+Math.cos(ry)*3.1,label:th==='candle'?'🕯 Thắp một ngọn nến bình an':'🍚 Một miếng cơm chánh niệm'})}
    // cổng chào "Hội Chợ Giáng Sinh Xứ Yên" phía trước, hai lính gỗ, hộp quà, hàng rào gỗ thấp
    {const gx=SNOWMAN.x+12.6,gz=SNOWMAN.z,gy=H(gx,gz),ry=Math.PI/2;S.at(gx,gy,gz,ry);L.at(gx,gy,gz,ry);XS.at(gx,gy,gz,ry);XL.at(gx,gy,gz,ry);
      for(const sx of [-1,1]){S.b(WOODD,sx*2.8,1.7,0,.42,3.4,.42);S.b(WOOD,sx*2.8,.15,0,.6,.3,.6);S.b(SNOW,sx*2.8,3.46,0,.55,.14,.55)}
      S.b(WOOD,0,3.15,0,6.2,.34,.4);S.add(G.prism,SNOW,MX(0,3.32,0,.9,.35,6.5,0,Math.PI/2,0));/* xà gỗ, tuyết trên xà */
      XS.b(PINE,0,3.0,.24,5.8,.24,.2);for(let i=0;i<9;i++)XS.add(G.ico,PINE,MX(-2.6+i*.65,3.0,.3,.28,.2,.2,0,i,0));for(let i=0;i<9;i++)XL.add(G.sphLo,i%2?'#ffd27a':'#fff0c4',MX(-2.6+i*.65,2.86,.42,.06));/* vòng lá thông, đèn */
      XS.b(RED,-.32,3.62,.32,.55,.32,.1,0,0,.5);XS.b(RED,.32,3.62,.32,.55,.32,.1,0,0,-.5);XS.b(RED,0,3.62,.36,.18,.22,.12);XS.b(RED,-.22,3.25,.33,.12,.5,.05,0,0,-.2);XS.b(RED,.22,3.25,.33,.12,.5,.05,0,0,.2);/* nơ đỏ */
      for(const sx of [-.2,.2])XS.add(G.cone12,GOLD,MX(sx,3.32,.42,.17,.3,.17));/* chuông vàng */
      for(const sx of [-1,1]){XS.b(RED,sx*2.8,2.5,.26,.5,.32,.08,0,0,sx*.4);XS.b(RED,sx*2.8,2.15,.26,.1,.55,.05)}/* nơ trên cột */
      for(const sx of [-1,1]){const nx=sx*3.55,nz=.9;S.b('#f3ead8',nx,.42,nz,.3,.55,.22);S.b(RED,nx,.95,nz,.42,.62,.3);S.b(GOLD,nx,.95,nz+.16,.06,.6,.02);S.b('#1f2a24',nx,.66,nz,.44,.06,.32);
        S.add(G.sph,'#f0d2b4',MX(nx,1.42,nz,.19));S.add(G.cyl12,'#1f2a24',MX(nx,1.78,nz,.17,.48,.17));S.b(GOLD,nx,1.66,nz+.17,.12,.12,.02);S.b('#1f2a24',nx,.08,nz,.36,.16,.3);blockBox(gx,gz,ry,.3,.3,nx,nz)}/* hai lính gỗ */
      gift(XS,-3.3,0,-.3,.5,RED,.3);gift(XS,3.4,0,-.4,.45,'#2f5b48',-.2);gift(XS,3.2,0,.0,.32,CRM,.5);
      for(const sx of [-1,1]){for(let i=0;i<4;i++){const px=sx*(3.0+i*1.25);S.b(WOOD,px,.5,0,.14,1.0,.14);S.add(G.sph,SNOW,MX(px,1.04,0,.13,.08,.13))}S.b(WOOD,sx*4.9,.75,0,3.8,.1,.07);S.b(WOOD,sx*4.9,.4,0,3.8,.1,.07);S.b(SNOW,sx*4.9,.83,0,3.8,.05,.12);blockBox(gx,gz,ry,1.95,.15,sx*4.9,0)}/* hàng rào gỗ thấp */
      S.reset();L.reset();XS.reset();XL.reset();for(const sx of [-1,1])blockBox(gx,gz,ry,.25,.25,sx*2.8,0);
      sign('Hội Chợ Giáng Sinh\nXứ Yên',gx+.27,gy+2.35,gz,ry,3.2,1.05,512,168,52,true)}
    for(const k of [0,3])poins(SNOWMAN.x+Math.cos(AS[k]*.5)*9.5,H(SNOWMAN.x+9.5,SNOWMAN.z),SNOWMAN.z+Math.sin(AS[k]*.5)*9.5+(k?1.6:-1.6));}
  {const x=TREE.x+5.5,z=TREE.z+23,y=H(x,z);S.b('#8a6a4a',x,y+1.7,z,.16,3.4,.16);/* cột biển chỉ đường */
    [['Quảng Trường',.4],['Chợ Mùa Đông',2.6],['Café',-.9],['Cửa Hàng',2.0],['Rừng Kính',-.3]].forEach(([n,a],i)=>{S.b('#b8906a',x+Math.cos(a)*.7,y+3-i*.45,z-Math.sin(a)*.7,1.5,.32,.08,a)});S.b(SNOW,x,y+3.45,z,.25,.1,.25)}
  for(const v of VH)warmH(v.x+Math.sin(v.ry)*6,4,v.z+Math.cos(v.ry)*6,10,18);
  
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
  const WR=12.5,WY=14.5,wheel=new THREE.Group(),gondolas=[];{const y=H(WHEEL.x,WHEEL.z);
    for(const sz of [-1.5,1.5])for(const sx of [-1,1])S.add(G.cyl,'#e9e0cf',MX(WHEEL.x+sx*3.9,y+WY/2,WHEEL.z+sz,.26,WY+.8,.26,0,0,-sx*.27));S.b('#d6b878',WHEEL.x,y+WY,WHEEL.z,.4,.4,3.4);
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
  // cổng đỏ Giáng sinh giữa cây thông và hồ trượt băng (vẽ lại 28/11): cột sọc kẹo gậy đỏ trắng trên bệ đá phủ tuyết, chóp cột quả cầu vàng;
  // vòm đỏ viền trắng, vòng lá thông ôm theo vòm có nơ đỏ và quả thông; vòng nguyệt quế giữa đỉnh; bảng gỗ "Xứ Yên"; hai chuông vàng treo dải ruy băng;
  // hai cây thông nhỏ hai bên; đèn chỉ sáng khi bật Giáng sinh
  {const ax=ARCH.x,az=ARCH.z,y=H(ax,az),RED='#b8322c',WH='#f4efe6',GR='#2f5b48',GR2='#3d6b52',GOLD='#d9b56a';S.at(ax,y,az,ARCH.ry);XL.at(ax,y,az,ARCH.ry);
    for(const sx of [-1,1]){const px=sx*2.8;S.b('#d9d4ca',px,.2,0,1.0,.4,1.0);S.b(SNOW,px,.43,0,1.06,.08,1.06);S.b(RED,px,2.1,0,.56,3.4,.56);
      for(let i=0;i<9;i++)S.b(WH,px,.65+i*.38,0,.6,.1,.6,0,0,sx*.42);/* sọc trắng chéo kiểu kẹo gậy */
      S.b(WH,px,3.85,0,.7,.14,.7);S.add(G.sph,GOLD,MX(px,4.0,0,.16));}
    const R=2.8,H0=3.85,HA=1.5,arc=t=>{const a=Math.PI*t;return [-Math.cos(a)*R,H0+Math.sin(a)*HA,a]};
    for(let i=0;i<18;i++){const [x,yy,a]=arc(i/17);S.b(RED,x,yy,0,.56,.56,.56,0,0,a-Math.PI/2)}
    for(let i=0;i<34;i++){const [x,yy,a]=arc(i/33),ox=-Math.cos(a)*.34,oy=Math.sin(a)*.34;S.b(WH,x+ox*.0,yy,.3,.2,.08,.04,0,0,a-Math.PI/2);/* viền trắng mặt trước */
      S.add(G.sphLo,i%2?GR:GR2,MX(x+ox,yy+oy,(i%3-1)*.12,.26,.2,.3));if(i%3===0)XL.add(G.sphLo,['#ffd27a','#ff9a8a','#fff0d0'][(i/3)%3|0],MX(x+ox*1.5,yy+oy*1.5,.22,.08))}/* vòng lá thông ôm vòm */
    for(const t of [.12,.3,.7,.88]){const [x,yy,a]=arc(t),ox=-Math.cos(a)*.5,oy=Math.sin(a)*.5;S.add(G.sph,RED,MX(x+ox-.1,yy+oy,.3,.12,.09,.06));S.add(G.sph,RED,MX(x+ox+.1,yy+oy,.3,.12,.09,.06));S.add(G.sph,'#8e2024',MX(x+ox,yy+oy,.33,.05));S.b(RED,x+ox,yy+oy-.17,.31,.06,.26,.03,0,0,.25);S.add(G.sph,'#6b4a2c',MX(x+ox,yy+oy-.05,-.3,.08,.12,.08))}/* nơ đỏ, quả thông */
    // vòng nguyệt quế giữa đỉnh vòm, nơ đỏ dưới
    for(let i=0;i<14;i++){const a=i/14*Math.PI*2;S.add(G.sphLo,i%2?GR:GR2,MX(Math.cos(a)*.48,H0+HA+.05+Math.sin(a)*.48,.42,.17,.17,.12))}for(let i=0;i<5;i++){const a=i/5*Math.PI*2+.3;S.add(G.sphLo,RED,MX(Math.cos(a)*.48,H0+HA+.05+Math.sin(a)*.48,.52,.06))}
    S.add(G.sph,RED,MX(-.13,H0+HA-.43,.52,.13,.09,.06));S.add(G.sph,RED,MX(.13,H0+HA-.43,.52,.13,.09,.06));S.add(G.sph,'#8e2024',MX(0,H0+HA-.43,.55,.05));for(const sx of [-1,1])S.b(RED,sx*.08,H0+HA-.62,.53,.06,.3,.03,0,0,sx*.25);
    S.b(SNOW,0,H0+HA+.38,0,1.6,.16,.8);for(const sx of [-1,1])S.b(SNOW,sx*2.0,H0+HA*.72+.34,0,1.2,.13,.7,0,0,-sx*.55);
    // hai chuông vàng treo dải ruy băng đỏ dưới vòm
    for(const sx of [-1,1]){const bx=sx*1.85,top=H0+HA*Math.sin(Math.acos(bx/R))-.25;S.b(RED,bx,top-.35,0,.05,.7,.05);S.add(G.cone,GOLD,MX(bx,top-.92,0,.2,.32,.2));S.add(G.sph,GOLD,MX(bx,top-1.1,0,.07));S.add(G.cyl12,GOLD,MX(bx,top-1.07,0,.21,.04,.21))}
    S.reset();XL.reset();
    // bảng gỗ "Xứ Yên" dưới vòm (canvas)
    {const c=document.createElement('canvas');c.width=512;c.height=160;const g=c.getContext('2d');g.fillStyle='#f4efe6';g.fillRect(0,0,512,160);g.strokeStyle='#b8322c';g.lineWidth=12;g.strokeRect(6,6,500,148);g.strokeStyle='#d9b56a';g.lineWidth=3;g.strokeRect(20,20,472,120);
      g.fillStyle='#9a2226';g.textAlign='center';g.font='700 76px Georgia,serif';g.fillText('Xứ Yên',256,104);g.fillStyle='#6f8fb0';g.font='38px serif';g.fillText('❄',70,96);g.fillText('❄',442,96);
      const tx=new THREE.CanvasTexture(c);tx.colorSpace=THREE.SRGBColorSpace;const m=new THREE.Mesh(new THREE.PlaneGeometry(2.7,.84),new THREE.MeshLambertMaterial({map:tx}));const d=new THREE.Mesh(new THREE.PlaneGeometry(2.7,.84),new THREE.MeshLambertMaterial({map:tx}));
      const fw=(lx,ly,lz)=>new THREE.Vector3(ax+Math.cos(ARCH.ry)*lx+Math.sin(ARCH.ry)*lz,y+ly,az-Math.sin(ARCH.ry)*lx+Math.cos(ARCH.ry)*lz);m.position.copy(fw(0,4.35,.32));m.rotation.y=ARCH.ry;d.position.copy(fw(0,4.35,-.32));d.rotation.y=ARCH.ry+Math.PI;sc.add(m,d);
      for(const sx of [-1,1]){const p=fw(sx*1.1,4.95,0);S.b('#9a7a56',p.x,p.y,p.z,.04,.4,.04)}}
    for(const sx of [-2.8,2.8]){const [bx,bz]=archW(sx,0);block(bx,bz,.6)}
    // hai cây thông nhỏ hai bên cổng, đèn khi Giáng sinh
    for(const sx of [-1,1]){const [px,pz]=archW(sx*4.4,-1.2),py=H(px,pz);for(let k=0;k<4;k++){const r=1.1-k*.24,hh=.9;S.add(G.cone,k%2?GR:GR2,MX(px,py+.5+k*.55+hh/2,pz,r,hh,r));S.add(G.cone,SNOW,MX(px,py+.5+k*.55+hh*.72,pz,r*.55,hh*.35,r*.55))}S.add(G.cyl12,'#5e4330',MX(px,py+.25,pz,.14,.5,.14));
      for(let i=0;i<10;i++){const a=i*2.1,hy=.7+i*.2,r=1.0-i*.08;bulb(px+Math.cos(a)*r,py+hy,pz+Math.sin(a)*r,i%2?'#ffd27a':'#ff9a8a')}block(px,pz,1)}}
  // Sân khấu Cung Băng (theo ảnh mẫu 28/11): bục tròn mặt băng hoa văn bông tuyết, ba bậc vòng cung, vòm nhọn băng có bông tuyết lớn, phông lâu đài băng dưới cực quang,
  // cụm tinh thể băng, rèm trắng, hai cờ xanh bông tuyết; mặt quay về sân trượt băng. Phong cách cung điện băng chung, không dùng tên, hình nhân vật hay biểu tượng của phim nào.
  {const sx0=STAGE.x,sz0=STAGE.z,y=H(sx0,sz0),ry=Math.atan2(RINK.x-sx0,RINK.z-sz0),ICE='#cfe5f4',ICE2='#a9d0ec',ICE3='#e8f4fc';S.at(sx0,y,sz0,ry);
    const flake=(g,cx,cy,r,lw,col)=>{g.save();g.translate(cx,cy);g.strokeStyle=col;g.lineWidth=lw;g.lineCap='round';for(let i=0;i<6;i++){g.rotate(Math.PI/3);g.beginPath();g.moveTo(0,0);g.lineTo(0,-r);for(const t of [.38,.62,.82]){const b=r*(1-t)*.55;g.moveTo(0,-r*t);g.lineTo(-b,-r*t-b);g.moveTo(0,-r*t);g.lineTo(b,-r*t-b)}g.stroke()}g.restore()};
    const tex=(w,h,draw)=>{const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t};
    const place=(m,lx,ly,lz,rx)=>{const p=new THREE.Vector3(lx,ly,lz).applyMatrix4(S.T);m.position.copy(p);m.rotation.set(rx||0,ry,0,'YXZ');sc.add(m)};
    // ba bậc vòng cung và mặt bục
    for(let k=0;k<3;k++)S.add(G.cyl12,k%2?ICE2:ICE,MX(0,.14+k*.22,.25*(2-k),6.2-k*.55,.3,6.2-k*.55));S.add(G.cyl12,ICE3,MX(0,.8,0,4.9,.08,4.9));
    {const t=tex(512,512,(g,w)=>{const r=g.createRadialGradient(256,256,20,256,256,256);r.addColorStop(0,'#eef8ff');r.addColorStop(1,'#bcdcf2');g.fillStyle=r;g.beginPath();g.arc(256,256,254,0,7);g.fill();flake(g,256,256,150,7,'#ffffffdd');
        for(let i=0;i<8;i++){const a=i/8*Math.PI*2;flake(g,256+Math.cos(a)*205,256+Math.sin(a)*205,22,3,'#ffffffbb')}g.strokeStyle='#ffffff88';g.lineWidth=3;g.beginPath();g.arc(256,256,232,0,7);g.stroke()});
      const m=new THREE.Mesh(new THREE.CircleGeometry(4.85,40),new THREE.MeshLambertMaterial({map:t}));place(m,0,.85,0,-Math.PI/2)}
    // phông nền lâu đài băng dưới cực quang
    {const t=tex(768,512,(g,w,h)=>{const sky=g.createLinearGradient(0,0,0,h);sky.addColorStop(0,'#0c2350');sky.addColorStop(.6,'#2a5d9c');sky.addColorStop(1,'#9cc8ea');g.fillStyle=sky;g.fillRect(0,0,w,h);
        for(const [y0,col] of [[120,'rgba(90,255,190,.45)'],[160,'rgba(120,200,255,.35)']]){g.strokeStyle=col;g.lineWidth=46;g.beginPath();for(let x=0;x<=w;x+=16){const yy=y0+Math.sin(x/90)*30+Math.sin(x/37)*8;x?g.lineTo(x,yy):g.moveTo(x,yy)}g.stroke()}
        g.fillStyle='#ffffffcc';for(let i=0;i<60;i++)g.fillRect((i*137)%w,(i*71)%200,2,2);
        g.fillStyle='#e6f1fa';for(const [x0,x1,pk] of [[-60,300,250],[200,520,300],[460,830,240]]){g.beginPath();g.moveTo(x0,h);g.lineTo((x0+x1)/2,pk);g.lineTo(x1,h);g.fill()}
        g.fillStyle='#bfe3fb';for(const [cx,bw,tp] of [[384,40,110],[344,26,190],[424,26,190],[310,20,250],[458,20,250],[280,16,300],[488,16,300]]){g.beginPath();g.moveTo(cx-bw,h-40);g.lineTo(cx-bw*.55,tp+40);g.lineTo(cx,tp);g.lineTo(cx+bw*.55,tp+40);g.lineTo(cx+bw,h-40);g.fill()}
        g.fillStyle='#d9efff';g.fillRect(250,h-120,268,90);g.fillStyle='#8fc4ec';g.beginPath();g.arc(384,h-60,26,Math.PI,0);g.fill();g.fillRect(358,h-60,52,30);
        g.fillStyle='#f4f9fd';g.fillRect(0,h-34,w,34)});
      const m=new THREE.Mesh(new THREE.PlaneGeometry(8.2,5.4),new THREE.MeshLambertMaterial({map:t}));place(m,0,.84+2.7,-4.05)}
    // vòm nhọn băng, cột tinh thể hai bên, bông tuyết lớn trên đỉnh
    S.b(ICE2,0,3.6,-4.2,8.8,6.2,.25);for(const sd of [-1,1]){S.b(ICE,sd*4.35,3.4,-4,.6,6,.6);S.add(G.pyr4,ICE3,MX(sd*4.35,6.4,-4,.85,1.6,.85))}
    for(let i=0;i<=14;i++){const t=i/14,a=t*Math.PI,ax=-Math.cos(a)*4.35,ay=6.3+Math.pow(Math.sin(a),.7)*1.6+(Math.abs(t-.5)<.08?.35:0);S.b(ICE3,ax,ay,-3.95,.7,.35,.4,0,0,(t-.5)*-1.6)}
    {const fy=7.9,fz=-3.75;for(let i=0;i<6;i++){const a=i*Math.PI/3;S.b('#f4fbff',Math.cos(a)*.55,fy+Math.sin(a)*.55,fz,1.1,.12,.08,0,0,a);for(const s of [-1,1])S.b('#f4fbff',Math.cos(a)*.75+Math.cos(a+s*.8)*.18,fy+Math.sin(a)*.75+Math.sin(a+s*.8)*.18,fz,.36,.08,.06,0,0,a+s*.8)}}
    // cánh gà: vách băng xanh, rèm trắng vắt, cụm tinh thể băng
    for(const sd of [-1,1]){S.b('#7fb4dd',sd*5.6,2.4,-3.2,2.4,3.8,.18,0,sd*.5,0);S.b(ICE3,sd*5.85,4.5,-3.1,.45,1.3,.45);S.add(G.pyr4,ICE3,MX(sd*5.85,5.4,-3.1,.5,1,.5));
      for(let k=0;k<3;k++)S.b('#f6f6f2',sd*(4.9+k*.5),4.1-k*.25,-3.0+k*.25,.9,.16,.5,0,sd*.5,sd*(.4-k*.2));
      for(const [lx,lz,h,s] of [[4.6,-1.6,2.2,.42],[5.1,-1.1,1.5,.34],[4.2,-2.3,1.7,.36],[5.4,-2,1.1,.3],[4.8,-.4,1,.28]]){S.add(G.pyr4,ICE2,MX(sd*lx,.84+h/2,lz,s,h,s,0,.3*sd,sd*.12));S.add(G.pyr4,ICE3,MX(sd*lx+sd*.05,.84+h/2+.05,lz,s*.6,h*.9,s*.6,0,.3*sd,sd*.12))}
      // cờ xanh in bông tuyết
      const fx=sd*7.3,fzz=-1.2;S.b('#d9dde2',fx,2.4,fzz,.1,4.8,.1);S.add(G.sphLo,'#e0c070',MX(fx,4.85,fzz,.12));S.b('#d9dde2',fx,4.55,fzz,1.4,.06,.06);
      const t=tex(128,256,(g,w,h)=>{const gr=g.createLinearGradient(0,0,0,h);gr.addColorStop(0,'#3d7fc4');gr.addColorStop(1,'#1d4f8f');g.fillStyle=gr;g.beginPath();g.moveTo(0,0);g.lineTo(w,0);g.lineTo(w,h);g.lineTo(w/2,h-40);g.lineTo(0,h);g.fill();flake(g,w/2,96,44,5,'#ffffff')});
      const m=new THREE.Mesh(new THREE.PlaneGeometry(1.25,2.5),new THREE.MeshLambertMaterial({map:t,transparent:true,side:THREE.DoubleSide}));place(m,fx,3.25,fzz+.02);
      for(const [lx,lz] of [[6.4,1],[6.9,-.2]]){S.add(G.sph,SNOW,MX(sd*lx,.3,lz,.7,.45,.6))}}
    // đèn nhỏ viền bậc và vòm: chỉ sáng khi bật Giáng sinh
    XL.T=S.T;for(let i=0;i<28;i++){const a=Math.PI*(.05+i/27*.9);XL.add(G.sphLo,'#dff2ff',MX(Math.cos(a)*6.25,.32,Math.sin(a)*6.25,.08))}for(let i=0;i<=14;i++){const a=i/14*Math.PI;XL.add(G.sphLo,'#e8f6ff',MX(-Math.cos(a)*4.35,6.55+Math.pow(Math.sin(a),.7)*1.6,-3.7,.08))}XL.reset();
    S.reset();block(sx0,sz0,5.8);{const bx=sx0-Math.sin(ry)*3.6,bz=sz0-Math.cos(ry)*3.6;block(bx,bz,3)}}
  for(const [lx,lz,c] of [[4.2,.8,'#b8322c'],[4.9,-.4,'#c5a36f'],[-4.2,.6,'#2f5b48']]){const [gx,gz]=archW(lx,lz),y=H(gx,gz);XS.b(c,gx,y+.35,gz,.7,.7,.7,.4);XS.b('#f1eee5',gx,y+.35,gz,.72,.72,.12,.4)}
  // Hồ Trượt Băng theo tấm 04: nhà dịch vụ (trên trái), café kính ven sân (trên phải), góc sưởi (dưới phải), khung đèn trái tim (dưới trái)
  {const x=TREE.x+15,z=TREE.z+21,y=H(x,z);/* đống lửa dời từ cổng về cạnh quảng trường cây thông */for(let i=0;i<9;i++){const a=i/9*6.28;S.add(G.sph,'#8d8780',MX(x+Math.cos(a)*.75,y+.12,z+Math.sin(a)*.75,.2,.16,.2))}block(x,z,1);S.add(G.cyl12,'#9a7a5a',MX(x,y+.4,z,.5,.8,.5));LA.add(G.cone12,'#ffae4a',MX(x,y+1.05,z,.35,.6,.35));for(const a of [0,2.1,4.2]){const bx=x+Math.cos(a)*2,bz=z+Math.sin(a)*2;S.b('#a07a56',bx,H(bx,bz)+.4,bz,1.6,.12,.5,-a+Math.PI/2)}warm(x,y+1.5,z,6,10)}
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
    S.reset();L.reset();block(X,Z,R0+.7);warmH(X,y+2.5,Z,10,20)}
  // ---------- Chòi lửa: lều kota nướng kiểu Lapland (grillikota) ở chân đồi chùa ----------
  // theo lều kota thật: thân tám cạnh ghép gỗ khúc nằm ngang, mái chóp tám mặt dốc lợp ván (phủ tuyết), ống khói kim loại giữa đỉnh mái, cửa gỗ một cánh, ô cửa sổ nhỏ ở vài mặt, củi xếp bên hông
  {const {x,z,R,ry}=KOTA,y=H(x,z),a=R*Math.cos(Math.PI/8),L8=2*R*Math.sin(Math.PI/8),hw=2.15,rh=3.3,LOG=['#8a5e3a','#7a5032','#93663f'];S.at(x,y,z,ry);L.at(x,y,z,ry);
    S.add(new THREE.CylinderGeometry(R+.35,R+.45,.3,8).toNonIndexed(),'#8c96a2',MX(0,.12,0,1,1,1,0,Math.PI/8,0));/* bệ đá */
    for(let k=0;k<8;k++){const f=k*Math.PI/4,cx=Math.sin(f)*a,cz=Math.cos(f)*a;for(let i=0;i<8;i++){const yy=.4+i*.235;S.add(G.cyl12,LOG[(i+k)%3],MX(cx,yy,cz,.13,L8+.3,.13,0,f,Math.PI/2))}/* khúc gỗ tròn nằm ngang, đầu khúc chìa ra ở góc */
      if(k===3||k===5||k===6){L.b('#ffcf8a',Math.sin(f)*(a+.09),1.35,Math.cos(f)*(a+.09),.62,.5,.04,0,f,0);for(const [w,h2,dy] of [[.74,.07,.29],[.74,.07,-.29]])S.b('#5a3c26',Math.sin(f)*(a+.13),1.35+dy,Math.cos(f)*(a+.13),w,h2,.08,0,f,0);for(const dx of [-.34,0,.34])S.b('#5a3c26',Math.sin(f)*(a+.13)+Math.cos(f)*dx,1.35,Math.cos(f)*(a+.13)-Math.sin(f)*dx,.06,.62,.08,0,f,0)}}
    S.b('#4e3424',0,1.12,a+.12,1.0,1.85,.1);for(const dx of [-.56,.56])S.b('#3e2a1c',dx,1.12,a+.15,.12,1.95,.14);S.b('#3e2a1c',0,2.08,a+.15,1.24,.12,.14);S.add(G.sphLo,'#c9a24a',MX(.33,1.1,a+.2,.05));L.b('#ffcf8a',0,1.8,a+.18,.6,.18,.02);/* cửa gỗ, ô kính trên cửa */
    S.b('#9aa3ad',0,.18,a+.9,1.6,.16,1.1);/* bậc đá trước cửa */
    S.add(new THREE.ConeGeometry(R+.75,rh,8).toNonIndexed(),'#4a3a30',MX(0,hw+rh/2,0,1,1,1,0,Math.PI/8,0));S.add(new THREE.ConeGeometry(R+.7,rh*.93,8).toNonIndexed(),SNOW,MX(0,hw+rh/2+.2,0,1,1,1,0,Math.PI/8,0));/* mái chóp lợp ván, tuyết phủ */
    S.add(G.cyl12,'#2b2c2e',MX(0,hw+rh+.35,0,.17,1.4,.17));S.add(G.cone,'#2b2c2e',MX(0,hw+rh+1.15,0,.36,.3,.36));S.add(G.cyl12,SNOW,MX(0,hw+rh+1.32,0,.3,.06,.3));/* ống khói giữa đỉnh mái */
    for(let i=0;i<4;i++)for(let j=0;j<5-i%2;j++)S.add(G.cyl12,j%2?'#a07a56':'#8f6a48',MX(-a*.75+Math.cos(Math.PI/4)*0-1.3,.3+i*.26,a*.45+(j-2)*.27+(i%2)*.13,.12,.9,.12,Math.PI/2,0,0));S.b(SNOW,-a*.75-1.3,1.36,a*.45,1,.08,1.5);/* củi xếp bên hông, mái tuyết */
    S.reset();L.reset();block(x,z,R+.5);
    {const c=document.createElement('canvas');c.width=256;c.height=96;const g=c.getContext('2d');g.fillStyle='#5e4128';g.fillRect(0,0,256,96);g.strokeStyle='#d9b77e';g.lineWidth=5;g.strokeRect(5,5,246,86);g.fillStyle='#f6efe2';g.font='600 46px Georgia,serif';g.textAlign='center';g.fillText('Chòi Lửa',128,64);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;
      const m=new THREE.Mesh(new THREE.PlaneGeometry(1.1,.42),new THREE.MeshLambertMaterial({map:t}));m.position.set(x+Math.sin(ry)*(a+.24),y+2.42,z+Math.cos(ry)*(a+.24));m.rotation.y=ry;sc.add(m)}}{const fx=FIRE2.x,fz=FIRE2.z,y=H(fx,fz);const fire=new THREE.Group();const fl=new THREE.Mesh(new THREE.ConeGeometry(.35,1,7),new THREE.MeshBasicMaterial({color:'#ffae4a',fog:false}));fl.position.y=.6;fire.add(fl);
    for(let i=0;i<8;i++){const a=i/8*6.28;S.add(G.sph,'#5e5a56',MX(fx+Math.cos(a)*1,y+.1,fz+Math.sin(a)*1,.2,.15,.2))}fire.position.set(fx,y,fz);sc.add(fire);block(fx,fz,1.3);var fireFl=fl;var fireLight=warm(fx,y+1.2,fz,14,14);
    for(const a of [0.6,1.57,2.6,3.6,4.6,5.6])S.b('#7a5a3e',fx+Math.cos(a)*2.6,y+.35,fz+Math.sin(a)*2.6,1.4,.3,.4,-a+Math.PI/2)}
  // người tuyết nhỏ bên cổng đỏ (vẽ lại 28/11): mắt than, má hồng, miệng cười, mũi cà rốt, cúc áo, tay cành cây vẫy chào, khăn len đỏ sọc trắng có đuôi, mũ len xanh quả bông, găng đỏ; quay mặt về hồ trượt băng
  {const [sx,sz]=archW(3.7,1.8),y=H(sx,sz),k=1.2;S.at(sx,y,sz,ARCH.ry);
    S.add(G.sph,SNOW,MX(0,.7*k,0,.9*k,.82*k,.9*k));S.add(G.sph,SNOW,MX(0,1.82*k,0,.62*k));S.add(G.sph,SNOW,MX(0,2.68*k,0,.44*k));S.add(G.cyl12,SNOW,MX(0,.06,0,1.1*k,.12,1.1*k));
    for(const ex of [-.15,.15]){S.add(G.sph,'#1e1c1a',MX(ex*k,2.8*k,.39*k,.055*k));S.add(G.sph,'#e8a1a0',MX(ex*1.7*k,2.62*k,.36*k,.07*k,.045*k,.03*k))}S.add(G.cone,'#e07a3a',MX(0,2.68*k,.62*k,.07*k,.44*k,.07*k,Math.PI/2,0,0));
    for(let i=0;i<5;i++){const t=(i-2)/2*.55;S.add(G.sph,'#1e1c1a',MX(Math.sin(t)*.22*k,2.54*k-Math.cos(t)*.06*k+.04*k,.4*k-Math.abs(t)*.03*k,.03*k))}
    for(const [h,zz] of [[1.62,.6],[1.86,.62],[2.08,.58],[1.05,.86],[.7,.9]])S.add(G.sph,'#1e1c1a',MX(0,h*k,zz*k,.05*k));
    S.add(G.cyl12,'#b8322c',MX(0,2.3*k,0,.5*k,.17*k,.5*k));for(const yy of [2.26,2.34])S.add(G.cyl12,'#f4efe6',MX(0,yy*k,0,.505*k,.025*k,.505*k));S.b('#b8322c',-.22*k,1.98*k,.44*k,.17*k,.62*k,.06*k,.12,0,-.2);for(const yy of [1.85,1.75])S.b('#f4efe6',-.23*k-(2.0-yy)*.07*k,yy*k,.47*k,.18*k,.035*k,.065*k,.12,0,-.2);
    S.add(G.cyl12,'#5e4330',MX(-.95*k,2.0*k,0,.03*k,.95*k,.03*k,0,0,1.0));S.add(G.cyl12,'#5e4330',MX(.9*k,2.35*k,0,.03*k,.95*k,.03*k,0,0,-.55));S.add(G.cyl12,'#5e4330',MX(1.05*k,2.85*k,.02*k,.02*k,.3*k,.02*k,0,0,.3));/* một tay buông, một tay vẫy */
    S.add(G.sph,'#b8322c',MX(-1.37*k,2.27*k,0,.11*k));S.add(G.sph,'#b8322c',MX(1.15*k,2.78*k,0,.11*k));
    S.add(G.sph,'#3d6fb0',MX(0,2.98*k,0,.42*k,.3*k,.42*k));S.add(G.cyl12,'#f4efe6',MX(0,2.96*k,0,.43*k,.09*k,.43*k));for(let i=0;i<6;i++){const a=i/6*Math.PI*2;S.add(G.sphLo,'#f4efe6',MX(Math.sin(a)*.3*k,3.12*k,Math.cos(a)*.3*k,.035*k))}S.add(G.sph,'#f4efe6',MX(0,3.3*k,0,.13*k));
    S.reset();block(sx,sz,1*k)}
  // người tuyết lớn giữa Nhà Ấm tròn và sân khấu: ba khối tuyết, mắt than, mũi cà rốt, miệng cười, cúc áo, tay cành cây, khăn len đỏ có đuôi, mũ chóp có dải đỏ và nhánh nhựa ruồi; quanh là vài cây thông nhỏ, quà và dây đèn chỉ hiện khi bật Giáng sinh
  {const sx=SNOWMAN.x,sz=SNOWMAN.z,y=H(sx,sz),k=3.4,ry=Math.atan2(RINK.x-sx,RINK.z-sz);S.at(sx,y,sz,ry);
    S.add(G.sph,SNOW,MX(0,.72*k,0,.92*k,.86*k,.92*k));S.add(G.sph,SNOW,MX(0,1.82*k,0,.64*k));S.add(G.sph,SNOW,MX(0,2.66*k,0,.44*k));S.add(G.cyl12,SNOW,MX(0,.08,0,1.15*k,.16,1.15*k));
    for(const ex of [-.15,.15])S.add(G.sph,'#1e1c1a',MX(ex*k,2.78*k,.39*k,.055*k));S.add(G.cone,'#e07a3a',MX(0,2.68*k,.6*k,.07*k,.42*k,.07*k,Math.PI/2,0,0));for(let i=0;i<5;i++){const t=(i-2)/2*.55;S.add(G.sph,'#1e1c1a',MX(Math.sin(t)*.22*k,2.52*k-Math.cos(t)*.06*k+.04*k,.4*k-Math.abs(t)*.03*k,.03*k))}
    for(const [h,zz] of [[1.62,.62],[1.86,.64],[2.1,.6],[1.1,.88],[.76,.92]])S.add(G.sph,'#1e1c1a',MX(0,h*k,zz*k,.05*k));
    S.add(G.cyl12,'#b8322c',MX(0,2.3*k,0,.5*k,.16*k,.5*k));S.b('#b8322c',.2*k,2.0*k,.46*k,.16*k,.6*k,.06*k,.1,0,.15);S.b('#efe6d6',.22*k,1.73*k,.47*k,.17*k,.05*k,.07*k,.1,0,.15);
    for(const sd of [-1,1]){S.add(G.cyl12,'#5e4330',MX(sd*.95*k,2.05*k,0,.03*k,.95*k,.03*k,0,0,-sd*1.0));S.add(G.cyl12,'#5e4330',MX(sd*1.28*k,2.42*k,.05*k,.02*k,.3*k,.02*k,0,0,-sd*.3))}
    S.add(G.cyl12,'#1e1c1a',MX(0,3.02*k,0,.5*k,.06*k,.5*k));S.add(G.cyl12,'#1e1c1a',MX(0,3.28*k,0,.32*k,.5*k,.32*k));S.add(G.cyl12,'#b8322c',MX(0,3.1*k,0,.33*k,.08*k,.33*k));for(const [dx,dz] of [[.12,.28],[.2,.24]])S.add(G.sphLo,'#2f5b48',MX(dx*k,3.13*k,dz*k,.07*k,.04*k,.11*k));S.add(G.sphLo,'#b8322c',MX(.16*k,3.16*k,.3*k,.035*k));
    S.reset();block(sx,sz,1*k);
    for(let i=0;i<5;i++){const a=ry+Math.PI+(i-2)*.55,r=8.5+(i%2)*1.6,px=sx+Math.sin(a)*r,pz=sz+Math.cos(a)*r;pine(T,px,pz,4.5+(i%3)*1.4)}/* vài cây thông nhỏ sau lưng người tuyết */
    for(let i=0;i<6;i++){const a=ry+(i-2.5)*.42,r=4.2+(i%2)*.5,px=sx+Math.sin(a)*r,pz=sz+Math.cos(a)*r,pyy=H(px,pz),q=.32+(i%3)*.1,c=['#b8322c','#2f5b48','#d6b878'][i%3];XS.b(c,px,pyy+q/2,pz,q,q,q,0,a,0);XS.b('#efe6d6',px,pyy+q/2,pz,q+.02,q+.02,.07,0,a,0);XS.b('#efe6d6',px,pyy+q/2,pz,.07,q+.02,q+.02,0,a,0)}/* quà Giáng sinh */
    for(let i=0;i<24;i++){const a=i/24*Math.PI*2,px=sx+Math.cos(a)*3.6,pz=sz+Math.sin(a)*3.6;bulb(px,H(px,pz)+.12,pz)}}
  {for(let i=0;i<7;i++){const a=Math.PI*(-.6+i/6*1.2),r=4.2+(i%3)*.6,x=SNOWMAN.x+Math.cos(a)*r,z=SNOWMAN.z+Math.sin(a)*r,q=.35+(i%3)*.18;S.add(G.sph,SNOW,MX(x,H(x,z)+q*.8,z,q))}/* bãi đắp người tuyết: người tuyết lớn, quả cầu tuyết lăn dở quanh đó */}
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
    for(const sx of [-1.75,1.75]){S.add(G.cyl12,OAK,MX(sx,.35,-2.1,.3,.6,.3));LA.add(G.sph,'#ffcf86',MX(sx,.85,-2.1,.15))}/* bàn nhỏ, đèn bàn */
    S.b('#d5c7ad',1.7,.45,.9,.9,.5,.85);S.b('#d5c7ad',1.95,.85,.9,.15,.6,.85);S.add(G.cyl12,OAK,MX(.7,.4,1.1,.35,.5,.35));/* ghế bành, bàn trà */
    for(const sx of [-1,1])S.b('#f4f1ea',sx*2.9,1.6,-1.6,.12,2.6,.7,sx*.5);/* rèm trắng mỏng vén hai bên */
    for(let i=0;i<3;i++)S.b(OAK,0,-.25-i*.22,r+1.55+i*.5,3.6-i*.1,.22,.6);/* bậc thềm rộng */
    LA.add(G.sph,'#ffe2b0',MX(0,2.6,-.6,.16));
    S.reset();L.reset();
    glassB.T=MX(x,y+.06,z,1);glassB.add(geo,'#ffffff',new THREE.Matrix4());glowB.T=MX(x,y+.06,z,1);glowB.add(geo,'#ffffff',MX(0,0,0,.96));
    if(idx===1){const [lx,lz]=toLake([x,z],1);const dx=lx-x,dz=lz-z;for(let k=0;k<12;k++){const sx=x+dx*(r+2.6+k*.85),sz=z+dz*(r+2.6+k*.85),sy=H(sx,sz);S.b('#9aa2ac',sx,sy+.12,sz,2.2,.3,1,Math.atan2(-dz,dx)+Math.PI/2);if(k%3===1){lantern(sx+dz*1.6,sz-dx*1.6,1.1);lantern(sx-dz*1.6,sz+dx*1.6,1.1)}}}/* bậc đá xuống đồi */
    for(let k=0;k<4;k++){const a=k*1.6+x,mx=x+Math.cos(a)*(r+3.2),mz=z+Math.sin(a)*(r+3.2);S.add(G.sph,SNOW,MX(mx,H(mx,mz)+.1,mz,1+k*.2,.5,.9))}
    {const la=Math.atan2(LAKE.z-z,LAKE.x-x),N=idx===0?11:idx===1?6:4;for(let k=0;k<N;k++){const a=la+Math.PI*.42+k*(Math.PI*1.16/(N-1)),rr=r+4.5+((k*7)%4)*1.6,px=x+Math.cos(a)*rr,pz=z+Math.sin(a)*rr;if(!homeClear(px,pz))pine(T,px,pz,6+((k*5)%4)*1.6)}}/* thông ôm sau lều */
    block(x,z,r+1.5)});
  for(let k=0;k<3;k++){const [ax,az]=IGLOOS[k],[bx,bz]=IGLOOS[(k+1)%3],mx=(ax+bx)/2,mz=(az+bz)/2,[ox,oz]=toLake([mx,mz],-3);/* cụm thông dày giữa các lều: riêng tư, không nhìn thẳng sang nhau */
    for(let j=0;j<7;j++){const a=j*2.4+k,rr=1+j*.7,px=ox+Math.cos(a)*rr,pz=oz+Math.sin(a)*rr;if(lakeE(px,pz)>1.12&&IGLOOS.every(([ix,iz])=>Math.hypot(px-ix,pz-iz)>DR+3.2)&&!homeClear(px,pz))pine(T,px,pz,5+((j*3+k)%4)*1.5)}}
  {const gm=glassB.mesh(glassMat);gm.renderOrder=2;sc.add(gm);const gl=glowB.mesh(glowMat);gl.renderOrder=1;sc.add(gl)}
  for(const [x,z] of IGLOOS)warm(x,H(x,z)+2.5,z,10,30);
  // ---------- tuyến đường phát sáng: husky vàng cam, xe trượt xanh lam, trượt tuyết hồng ----------
  const glow=(pts,col,w,yf,closed)=>{const P=closed?[...pts,pts[0]]:pts;for(let i=0;i+1<P.length;i++){const [x0,z0]=P[i],[x1,z1]=P[i+1],ln=Math.hypot(x1-x0,z1-z0),n=Math.max(1,Math.ceil(ln/2)),ry=Math.atan2(-(z1-z0),x1-x0);
    for(let k=0;k<n;k++){const t=(k+.5)/n,x=x0+(x1-x0)*t,z=z0+(z1-z0)*t;L.b(col,x,yf(x,z),z,ln/n+.05,.05,w,ry)}}};
  /* không vẽ dải đèn dọc tuyến đường: tuyến husky, xe trượt, dốc trượt chỉ in trên nền tuyết */
  // ---------- 7 đảo nhỏ trồng thông giữa hồ, cầu gỗ cong nối bờ ----------
  // Đảo ngắm cực quang (tấm 07 mới): viền đá phủ tuyết, vài cây thông phía sau, sân tròn, ghế băng cong thấp, bậc thềm, kính thiên văn đồng
  const ISEATS=[],BRG={},DEERS=[];let isleSel=0;
  {const X=ISLE.x,Z=ISLE.z,y=H(X,Z),fa=Math.atan2(-.3,-.95);/* hướng ra cầu */
    for(let k=0;k<30;k++){const a=k/30*6.283,r=ISLE.r*(1.02+.12*Math.sin(k*2.7)),sz=.45+.25*((k*7)%5)/5;S.add(G.sphLo,k%3?'#b6b2ab':'#c4c0b9',MX(X+Math.cos(a)*r,ICE_Y+.15,Z+Math.sin(a)*r,sz*1.3,sz*.7,sz));S.add(G.sphLo,SNOW,MX(X+Math.cos(a)*r,ICE_Y+.15+sz*.45,Z+Math.sin(a)*r,sz*1.05,sz*.3,sz*.8))}
    for(const [a,r,h] of [[fa+Math.PI-.5,ISLE.r*.72,6.5],[fa+Math.PI+.15,ISLE.r*.78,8],[fa+Math.PI+.75,ISLE.r*.7,5]])pine(T,X+Math.cos(a)*r,Z+Math.sin(a)*r,h);
    const cx=X+Math.cos(fa)*1.2,cz=Z+Math.sin(fa)*1.2;S.add(G.cyl12,'#c9c5be',MX(cx,y+.35,cz,3.4,.7,3.4));S.add(G.cyl12,SNOW,MX(cx,y+.72,cz,3.25,.06,3.25));
    for(let i=0;i<3;i++){const r=3.6+i*.55;S.b('#cbc7c0',cx+Math.cos(fa)*r,y+.55-i*.2,cz+Math.sin(fa)*r,.6,.2,2.2,-fa)}
    for(let i=0;i<9;i++){const a=fa+Math.PI-1.1+i*2.2/8,r=2.6;S.b('#d4d0c9',cx+Math.cos(a)*r,y+1.05,cz+Math.sin(a)*r,.55,.12,1.05,-a);S.b('#c4c0b9',cx+Math.cos(a)*r,y+.88,cz+Math.sin(a)*r,.45,.3,.9,-a)}
    {const tx=cx+Math.cos(fa+.9)*2,tz=cz+Math.sin(fa+.9)*2;S.add(G.cyl,'#5c5550',MX(tx,y+1.3,tz,.08,1.2,.08));S.add(G.cyl12,'#b08a4a',MX(tx,y+2.05,tz,.13,1.3,.13,0,0,1.1));S.add(G.cyl12,'#c5a36f',MX(tx-.45,y+2.3,tz,.17,.25,.17,0,0,1.1))}
    // chỗ ngồi ngắm cực quang trên đảo: 9 phiến ghế đá dài quanh bệ và các ụ đá ven đảo; chạm để tới ngồi
    for(let i=0;i<9;i++){const a=fa+Math.PI-1.1+i*2.2/8,r=2.6,x=cx+Math.cos(a)*r,z=cz+Math.sin(a)*r;ISEATS.push({x,z,y:y+1.11,a:Math.atan2(-Math.cos(a),-Math.sin(a))/* ngồi quay vào bệ, nhìn qua kính viễn vọng ra mặt hồ */,ax:cx+Math.cos(a)*3.95,az:cz+Math.sin(a)*3.95,hit:[x,y+.8,z,.75,.7,1.15,-a]})}
    for(let k=0;k<30;k++){const a=k/30*6.283;let da=a-fa;da=Math.atan2(Math.sin(da),Math.cos(da));if(Math.abs(da)<.4)continue;const r=ISLE.r*(1.02+.12*Math.sin(k*2.7)),sz=.45+.25*((k*7)%5)/5,x=X+Math.cos(a)*r,z=Z+Math.sin(a)*r;
      ISEATS.push({x,z,y:ICE_Y+.15+sz*.75,a:Math.atan2(Math.cos(a),Math.sin(a)),ax:X+Math.cos(a)*(r-1.1),az:Z+Math.sin(a)*(r-1.1),hit:[x,ICE_Y+.4,z,sz*2.4,.9,sz*2.2,-a]})}
    block(cx,cz,3.45)/* chỉ chắn bệ đá giữa đảo; đảo đi lại được để tới ghế đá, ụ đá */}
  for(let k=0;k<3;k++){const a=k*2.1+.5;lantern(ISLE.x+Math.cos(a)*ISLE.r*.95,ISLE.z+Math.sin(a)*ISLE.r*.95,1.3)}
  {let dx=-.95,dz=-.3;const l=Math.hypot(dx,dz);dx/=l;dz/=l;const ax=ISLE.x+dx*ISLE.r*1.05,az=ISLE.z+dz*ISLE.r*1.05;let len=2;while(len<60&&lakeE(ax+dx*len,az+dz*len)<1.08)len+=.5;
    const ry=Math.atan2(-dz,dx),n=Math.ceil(len/1.05);let sc=len*.8,bd=1e9;for(let q=0;q<=len;q+=.25){const x=ax+dx*q,z=az+dz*q;for(const w of SLOOP){const d=Math.hypot(w[0]-x,w[1]-z);if(d<bd){bd=d;sc=q}}}/* chỗ tuyến xe trượt chạy dưới cầu: cầu vồng cao lên để xe lọt qua */
    // Cầu theo ảnh 16: mặt cầu và lan can gỗ sồi sáng, trụ lan can vuông có tuyết trên đầu, dầm vòm và mố trụ đá xám nhạt trơn, ít chi tiết.
    const yAt=q=>ICE_Y+.45+Math.sin(Math.PI*q/len)*1.1+2.3*Math.exp(-Math.pow((q-sc)/6,2)),STN='#c9c5be',STN2='#b8b4ad',DECK='#d6d4cf',RAIL='#c8c6c1';/* 28/11: cầu xám nhạt */Object.assign(BRG,{ax,az,dx,dz,len,ry,yAt});
    {const seg=(q0,q1)=>{if(q1-q0<.5)return;const qm=(q0+q1)/2;blockBox(ax+dx*qm,az+dz*qm,ry,(q1-q0)/2,1.45)};seg(.3,sc-5);seg(sc+5,len-.3)}/* đi trên băng không xuyên qua thân cầu thấp; chỗ vòm cao (xe trượt lọt qua) thì đi dưới được */
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
    const d=SDOCK[k],ry=Math.atan2(d.m[0]-d.p[0],d.m[1]-d.p[1]);g.position.set(d.p[0],ICE_Y,d.p[1]);g.rotation.y=ry;sc.add(g);g.userData.sl=k;
    return {k,g,npc,st:'park',s:0,v:0,from:null,to:null,exitS:null,exit:null,rider:null,wait:15+k*22,len:[2.2,3,4.2][k],seatZ:-[2.2,3,4.2][k]/2+.75}});
  const SLL=(()=>{const c=[0];for(let i=1;i<=SLOOP.length;i++){const a=SLOOP[i-1],b=SLOOP[i%SLOOP.length];c.push(c[i-1]+Math.hypot(b[0]-a[0],b[1]-a[1]))}return c})(),STOT=SLL[SLOOP.length];
  const sAt=s=>{s=((s%STOT)+STOT)%STOT;let i=0,j=SLOOP.length;while(j-i>1){const m=(i+j)>>1;if(SLL[m]<=s)i=m;else j=m}const a=SLOOP[i],b=SLOOP[(i+1)%SLOOP.length],t=(s-SLL[i])/(SLL[i+1]-SLL[i]);return [a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,Math.atan2(b[0]-a[0],b[1]-a[1]),a[2]]};
  const sNear=(x,z)=>{let bi=0,bd=1e9;SLOOP.forEach((q,i)=>{const d=Math.hypot(q[0]-x,q[1]-z);if(d<bd){bd=d;bi=i}});return SLL[bi]};
  const fwd=(a,b)=>((b-a)%STOT+STOT)%STOT;/* quãng đường xuôi chiều từ a tới b */
  const gapFree=(s0,me0)=>sleds.every(o=>o===me0||o.st!=='loop'||(fwd(o.s,s0)>14&&fwd(s0,o.s)>9));/* điểm nhập trống: không xe nào sắp tới trong 14 m hay vừa qua trong 9 m */
  let mySled=null,sledPick=null;
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
  // ---------- Chuyến xe trao Yên: xe tuần lộc của ông già Noel bay qua 5 ống khói trong làng, chạm để thả một lời chúc; lúc nào cũng chơi được ----------
  const SP={x:FARM.x-23,z:FARM.z+5,ry:Math.PI},santaG=new THREE.Group(),santaLegs=[];
  {const B=new Batch(),G0='#d6b04a',RD='#a8262b';
    for(const sx of [-.85,.85]){B.b(G0,sx,.12,0,.12,.1,3.6);B.add(G.cyl12,G0,MX(sx,.45,1.85,.42,.08,.42,0,0,Math.PI/2))}for(const sz of [-1,0,1])for(const sx of [-.85,.85])B.b(G0,sx,.35,sz,.08,.45,.08);
    B.b(RD,0,.95,-.3,1.9,.9,2.6);B.b(RD,0,1.55,-1.4,1.9,1.3,.5);B.add(G.cyl12,RD,MX(0,1.1,1.05,.95,.3,.95,0,0,Math.PI/2));B.b(G0,0,1.42,-.3,1.95,.08,2.65);B.b('#2f5b48',0,1.45,-.8,1.6,.12,1);
    B.add(G.sph,'#7a4a2e',MX(0,1.95,-1.25,.6,.55,.5));B.b('#b8322c',.6,1.75,-.9,.45,.45,.45,.3);B.b('#2f5b48',-.6,1.7,-.8,.4,.38,.4,-.2);
    // ông già Noel ngồi ghế trước, bên trái; chỗ trống bên phải dành cho bạn
    B.add(G.cyl12,'#b8262b',MX(-.45,1.75,-.2,.42,.9,.38));B.add(G.sph,'#f1e2d0',MX(-.45,2.35,-.15,.22));B.add(G.sph,'#ffffff',MX(-.45,2.2,0,.24,.26,.16));B.add(G.cone,'#b8262b',MX(-.45,2.65,-.18,.22,.45,.22,-.3,0,0));B.add(G.sphLo,'#ffffff',MX(-.45,2.86,-.3,.08));B.b('#2b2622',-.45,1.42,-.2,.86,.08,.4);
    B.b('#5e4330',0,.7,2.6,.08,.08,2);
    const deer=(lx,lz)=>{const br='#8f7c66',dk='#4f4032',lt='#efe7d8',an='#cdb894';B.add(G.sph,br,MX(lx,1.05,lz,.38,.36,.76));B.add(G.sph,lt,MX(lx,.98,lz+.48,.3,.32,.24));B.add(G.cyl,lt,MX(lx,1.45,lz+.68,.14,.62,.14,-.5,0,0));B.add(G.sph,br,MX(lx,1.72,lz+.96,.15,.15,.26));B.add(G.sph,'#b8322c',MX(lx,1.68,lz+1.2,.06));
      for(const sx of [-1,1]){for(const sz of [-.42,.42])B.add(G.cyl,dk,MX(lx+sx*.18,.45,lz+sz,.05,.9,.05));B.add(G.cyl,an,MX(lx+sx*.2,2.1,lz+.85,.03,.65,.03,-.35,0,-sx*.45));B.add(G.cyl,an,MX(lx+sx*.42,2.45,lz+.7,.025,.45,.025,-.7,0,-sx*.2))}
      B.add(WREATH,'#b8322c',MX(lx,1.03,lz+.26,.92,.9,.42));B.add(G.sphLo,'#e0b04a',MX(lx,.66,lz+.34,.08))};
    for(const [lx,lz] of [[-.6,3.7],[.6,3.7],[-.6,5.7],[.6,5.7]])deer(lx,lz);
    santaG.add(B.mesh(LAM));santaG.position.set(SP.x,H(SP.x,SP.z),SP.z);santaG.rotation.y=SP.ry;sc.add(santaG)}
  STATIONS.push({id:'gift',x:SP.x+2.6,z:SP.z-.5,label:'🎅 Lên xe tuần lộc đi trao Yên'});
  const WISHES=[['🕊','Bình an'],['🔥','Ấm áp'],['✨','Niềm vui'],['🌙','Ngủ ngon'],['🌲','Vững vàng']],SANTA_SAY=['Ống khói năm nay hơi chật, ta thả nhẹ tay thôi nhé.','Nhà này ngủ sớm rồi. Suỵt, khẽ thôi.','Ta già rồi, ngắm cháu thả cho chuẩn.','Nhìn kìa, cửa sổ vừa sáng lên. Đẹp không?','Chà, ống khói này còn ấm. Chắc vừa nấu cacao.'];
  const REAL=['Nhắn một lời cảm ơn cho một người đã giúp bạn gần đây.','Pha cho mình một cốc nước ấm, uống chậm từng ngụm.','Gọi cho một người thân chỉ để hỏi thăm, không cần lý do.','Tối nay tắt màn hình sớm hơn 15 phút và nằm nghe hơi thở.','Viết ra một điều nhỏ hôm nay làm bạn mỉm cười.','Khen một người bên cạnh, thật lòng và cụ thể.'];
  const SR={on:false,leg:0,t:0,legs:[],stops:[],wait:false,gift:null,puffs:[],done:[],lights:[]};
  const giftBar=document.createElement('div');giftBar.className='sn-gift';giftBar.hidden=true;giftBar.innerHTML='<div class="sn-gq">Chọn một lời chúc để thả vào ống khói</div>'+WISHES.map((w,i)=>'<button type="button" data-w="'+i+'">'+w[0]+' '+w[1]+'</button>').join('')+'<button type="button" data-w="skip" class="sn-skip">Bỏ qua nhà này ›</button>';box.append(giftBar);
  giftBar.addEventListener('pointerdown',e=>e.stopPropagation());
  const _gp=new THREE.Vector3(),_gq=new THREE.Vector3();
  // Đường bay một mạch liền: cất cánh, đi vòng trong rồi vòng ngoài các nhà theo một chiều (không lượn qua lại giữa hai vòng), dừng cạnh từng ống khói,
  // phát xong bay một vòng lớn quanh Xứ Yên rồi hạ xuống sân trước Nhà Mái Cỏ (tư gia). Xe đổi hướng từ từ, có giới hạn tốc độ quay.
  const homeLand=()=>{const c=Math.cos(HOME.ry),sn=Math.sin(HOME.ry),w=(lx,lz)=>[HOME.x+lx*c+lz*sn,HOME.z-lx*sn+lz*c];return {land:w(9.5,1.2),app:w(26,1.2),out:w(8,3.4)}};
  const flyPath=(wps)=>{const cv=new THREE.CatmullRomCurve3(wps,false,'centripetal'),N=(wps.length-1)*24,pts=[],cum=[0];for(let i=0;i<=N;i++){const q=cv.getPoint(i/N);q.y=Math.max(q.y,H(q.x,q.z)+(i===0||i===N?0:1.2));pts.push(q);if(i)cum.push(cum[i-1]+q.distanceTo(pts[i-1]))}return {pts,cum,tot:cum[N],at:d=>{d=Math.max(0,Math.min(cum[N],d));let a=0,b=N;while(b-a>1){const m=(a+b)>>1;if(cum[m]<=d)a=m;else b=m}const t=(d-cum[a])/((cum[b]-cum[a])||1);return pts[a].clone().lerp(pts[b],t)},wpD:k=>cum[Math.min(N,k*24)]}};
  const santaStart=()=>{const ang=c=>Math.atan2(c.z-TREE.z,c.x-TREE.x),rad=c=>Math.hypot(c.x-TREE.x,c.z-TREE.z),inner=CHIMNEYS.filter(c=>rad(c)<30).sort((a,b)=>ang(a)-ang(b)),outer=CHIMNEYS.filter(c=>rad(c)>=30).sort((a,b)=>ang(a)-ang(b)),order=[...inner,...outer];
    const y0=H(SP.x,SP.z)+.02,park=new THREE.Vector3(SP.x,y0,SP.z),fw=[Math.sin(SP.ry),Math.cos(SP.ry)],wps=[park,new THREE.Vector3(SP.x+fw[0]*8,y0+3,SP.z+fw[1]*8),new THREE.Vector3(SP.x+fw[0]*20,y0+12,SP.z+fw[1]*20)],stopK=[];
    let prev=null;for(const c of order){const dx=c.x-TREE.x,dz=c.z-TREE.z,l=Math.hypot(dx,dz)||1,sp=new THREE.Vector3(c.x+dx/l*3.4,c.y+1.6,c.z+dz/l*3.4);
      if(prev){const a0=Math.atan2(prev.z-TREE.z,prev.x-TREE.x),a1=Math.atan2(sp.z-TREE.z,sp.x-TREE.x);let da=a1-a0;da=Math.atan2(Math.sin(da),Math.cos(da));const am=a0+da/2,rm=(Math.hypot(prev.x-TREE.x,prev.z-TREE.z)+Math.hypot(sp.x-TREE.x,sp.z-TREE.z))/2+2;wps.push(new THREE.Vector3(TREE.x+Math.cos(am)*rm,Math.max(prev.y,sp.y)+3.5,TREE.z+Math.sin(am)*rm))}/* điểm giữa hai nhà nằm trên vòng cung, cao hơn mái: bay vòng theo dãy nhà */
      stopK.push(wps.length);wps.push(sp);prev=sp}
    const CX=30,CZ=15,R=105,a0=Math.atan2(prev.z-CZ,prev.x-CX);for(let k=1;k<=8;k++){const a=a0+k/8*Math.PI*2;wps.push(new THREE.Vector3(CX+Math.cos(a)*R,34,CZ+Math.sin(a)*R))}/* một vòng lớn quanh Xứ Yên */
    const hl=homeLand();wps.push(new THREE.Vector3(hl.app[0],H(...hl.app)+9,hl.app[1]),new THREE.Vector3((hl.app[0]+hl.land[0])/2,H(...hl.land)+3,(hl.app[1]+hl.land[1])/2),new THREE.Vector3(hl.land[0],H(...hl.land)+.02,hl.land[1]));
    SR.path=flyPath(wps);SR.stopD=stopK.map(k=>SR.path.wpD(k));SR.d=0;SR.v=0;SR.ret=null;
    SR.stops=order;SR.on=true;SR.leg=0;SR.wait=false;SR.done=[];P.mode='santa';P.ride=0;setSit(true);me.visible=true;
    caption('🎅 Ho ho, lên xe nào! Tuần lộc đưa cháu qua '+order.length+' nhà trong làng. Tới mỗi ống khói, chọn một lời chúc để thả vào. Xong ta bay một vòng Xứ Yên rồi đưa cháu về Nhà Mái Cỏ.',8000)};
  // Xe không người: từ chỗ hiện tại bay lên, vòng về bãi đỗ cạnh trại tuần lộc
  const santaReturn=()=>{const p0=santaG.position.clone(),y0=H(SP.x,SP.z)+.02,fw=[Math.sin(SP.ry),Math.cos(SP.ry)],hd=[Math.sin(santaG.rotation.y),Math.cos(santaG.rotation.y)];
    SR.ret=flyPath([p0,new THREE.Vector3(p0.x+hd[0]*8,p0.y+5,p0.z+hd[1]*8),new THREE.Vector3((p0.x+SP.x)/2,Math.max(p0.y,y0)+24,(p0.z+SP.z)/2),new THREE.Vector3(SP.x+fw[0]*20,y0+10,SP.z+fw[1]*20),new THREE.Vector3(SP.x+fw[0]*7,y0+2.5,SP.z+fw[1]*7),new THREE.Vector3(SP.x,y0,SP.z)]);SR.rd=0;SR.rv=0};
  const santaHead=(p,q,dt,k)=>{if(Math.hypot(q.x-p.x,q.z-p.z)>.02){const hd=Math.atan2(q.x-p.x,q.z-p.z);let d=hd-santaG.rotation.y;d=Math.atan2(Math.sin(d),Math.cos(d));santaG.rotation.y+=Math.sign(d)*Math.min(Math.abs(d)*Math.min(1,dt*1.6),.9*dt)}/* quay đầu từ từ, tối đa ~50 độ mỗi giây */
    const pt=-Math.max(-.3,Math.min(.3,(q.y-p.y)/(Math.hypot(q.x-p.x,q.z-p.z)+.01)*.8));santaG.rotation.x+=(pt*k-santaG.rotation.x)*Math.min(1,dt*2)};
  const santaEnd=(early)=>{SR.on=false;SR.wait=false;giftBar.hidden=true;if(SR.gift){sc.remove(SR.gift.m);SR.gift=null}santaReturn();/* xe tự bay về bãi đỗ */
    if(!early){const task=REAL[(Math.random()*REAL.length)|0];caption('🎅 Cảm ơn cháu đã trao Yên cho '+SR.done.length+' nhà. Món quà của ta cho cháu: '+task,12000);
      if(window.__xuyenJournal)window.__xuyenJournal('Chuyến xe trao Yên: đã thả '+(SR.done.length?SR.done.join(', '):'những lời chúc')+'. Mang Yên về đời thực: '+task,'🎅 Chuyến xe trao Yên')}};
  const santaDrop=i=>{if(!SR.wait||SR.gift)return;const c=SR.stops[SR.leg-1];if(i==='skip'){giftBar.hidden=true;SR.wait=false;caption('🎅 Nhà này để lần sau vậy.',2500);return}
    const w=WISHES[i],m=new THREE.Mesh(new THREE.BoxGeometry(.5,.5,.5),new THREE.MeshLambertMaterial({color:['#b8322c','#2f5b48','#d6b04a','#3d6fb0','#c46a8a'][i]}));m.position.copy(santaG.position).setY(santaG.position.y+1.9);sc.add(m);
    SR.gift={m,a:m.position.clone(),b:new THREE.Vector3(c.x,c.y-.2,c.z),t:0,w:w[1],c};giftBar.hidden=true};
  giftBar.addEventListener('click',e=>{const b=e.target.closest('[data-w]');if(b)santaDrop(b.dataset.w==='skip'?'skip':+b.dataset.w)});
  const santaTick=dt=>{if(SR.fast)dt*=8;if(!SR.on){const R=SR.ret;if(R){const left=R.tot-SR.rd;SR.rv+=(Math.min(9,Math.max(1.5,left*.5))-SR.rv)*Math.min(1,dt*1.5);SR.rd=Math.min(R.tot,SR.rd+SR.rv*dt);const p=R.at(SR.rd),q=R.at(SR.rd+1.5);santaG.position.copy(p);santaHead(p,q,dt,1);if(SR.rd>=R.tot){SR.ret=null;santaG.rotation.set(0,SP.ry,0)}}return}
    if(SR.gift){const g=SR.gift;g.t=Math.min(1,g.t+dt/1.1);g.m.position.lerpVectors(g.a,g.b,g.t);g.m.position.y+=Math.sin(g.t*Math.PI)*2.2;g.m.rotation.set(g.t*6,g.t*4,0);
      if(g.t>=1){sc.remove(g.m);g.m.geometry.dispose();for(let k=0;k<7;k++){const p=new THREE.Mesh(new THREE.SphereGeometry(.3,8,6),new THREE.MeshBasicMaterial({color:'#f4f6fa',transparent:true,opacity:.8,fog:false}));p.position.set(g.c.x+(Math.random()-.5)*.4,g.c.y+.3,g.c.z+(Math.random()-.5)*.4);p.userData={v:.9+Math.random()*.8,dx:(Math.random()-.5)*.5,life:0};sc.add(p);SR.puffs.push(p)}
        const l=new THREE.PointLight('#ffc27a',0,16,1.6);l.position.set(g.c.x,g.c.y-3,g.c.z);sc.add(l);SR.lights.push({l,t:0});SR.done.push(g.w);caption('🎅 '+SANTA_SAY[(SR.leg-1)%SANTA_SAY.length]+'  ('+g.w+')',4500);SR.gift=null;SR.wait=false}}
    for(let i=SR.puffs.length-1;i>=0;i--){const p=SR.puffs[i],u=p.userData;u.life+=dt;p.position.y+=u.v*dt;p.position.x+=u.dx*dt;p.scale.setScalar(1+u.life*1.6);p.material.opacity=Math.max(0,.8-u.life*.45);if(u.life>1.8){sc.remove(p);p.geometry.dispose();p.material.dispose();SR.puffs.splice(i,1)}}
    for(const o of SR.lights)if(o.t<1){o.t=Math.min(1,o.t+dt*.6);o.l.intensity=o.t*14}
    if(SR.wait)return;const Pth=SR.path,nx=SR.leg<SR.stopD.length?SR.stopD[SR.leg]:Pth.tot,left=nx-SR.d;
    SR.v+=(Math.min(SR.leg>=SR.stopD.length&&left>40?13:8,Math.max(1.2,left*.55),1.5+SR.d*.6)-SR.v)*Math.min(1,dt*1.5);SR.d=Math.min(nx,SR.d+SR.v*dt);const p=Pth.at(SR.d),q=Pth.at(SR.d+1.5);santaG.position.copy(p);santaHead(p,q,dt,1);/* chậm dần khi tới ống khói, nhanh dần khi rời đi */
    if(SR.d>=nx-.01){if(SR.leg<SR.stopD.length){SR.leg++;SR.wait=true;giftBar.hidden=false;SR.v=0;caption('🎅 Tới nhà thứ '+SR.leg+'. Chọn một lời chúc, hoặc chạm vào ống khói để thả.',5000)}
      else{const hl=homeLand();santaEnd(false);stand(true);P.x=hl.out[0];P.z=hl.out[1];P.a=HOME.ry;first=true;caption('🎅 Về tới Nhà Mái Cỏ rồi. Cảm ơn cháu đã cùng ta trao Yên. Ta về trại tuần lộc đây, ho ho!',6000)}}};
  window.__santa=()=>({on:SR.on,leg:SR.leg,wait:SR.wait,done:SR.done.slice(),stops:SR.stops.length,d:SR.path?+SR.d.toFixed(1):0,tot:SR.path?+SR.path.tot.toFixed(0):0,ret:!!SR.ret});window.__santaDrop=i=>santaDrop(i);window.__santaFast=()=>{SR.fast=1};
  // nhà gỗ mở (chuồng, chòi nghỉ, xưởng): cột, vách sau, mái dốc phủ tuyết, dây đèn
  function openShed(x,z,ry,w,d,h,o){o=o||{};const y=H(x,z),col=o.col||'#98745a';S.at(x,y,z,ry);L.at(x,y,z,ry);
    S.b('#7a756e',0,.08,0,w+.4,.16,d+.4);S.b(col,0,h/2,-d/2+.15,w,h,.3);for(const sx of [-1,1])S.b(col,sx*(w/2-.15),h/2,0,.3,h,d);
    for(let i=0;i<=Math.round(w/2.4);i++){const px=-w/2+.2+i*(w-.4)/Math.round(w/2.4);S.b('#a8805c',px,h/2,d/2-.2,.26,h,.26);if(o.stalls&&i>0&&i<Math.round(w/2.4))S.b(col,px,.6,0,.12,1.2,d-.6)}
    const a=.6,rh=Math.tan(a)*(d/2+.5),Lr=(d/2+.6)/Math.cos(a);for(const sd of [-1,1]){S.b('#8a6a4a',0,h+rh/2,sd*(d/4+.15),w+.8,.2,Lr,sd*a,0,0);S.b(SNOW,0,h+rh/2+.22,sd*(d/4+.15),w+.9,.3,Lr+.05,sd*a,0,0)}
    if(o.chimney){S.b('#9a958e',w/2-1,h+rh*.6,-d*.2,.8,2.4,.8);S.b(SNOW,w/2-1,h+rh*.6+1.25,-d*.2,.95,.2,.95)}
    stringLights(L,-w/2-.4,h,d/2+.2,w/2+.4,h,d/2+.2,Math.round(w*1.6),.15);if(o.wreath){XS.T=S.T;XS.add(WREATH,'#2f5b48',MX(0,h+rh*.45,d/2+.35,1));XS.add(G.sphLo,'#a5302a',MX(0,h+rh*.45-.42,d/2+.4,.1));XS.reset()}
    S.reset();L.reset();block(x,z,Math.max(w,d)/2+.6);blockBox(x,z,ry,w/2+.2,d/2+.2)}
  // nhà kính mái gỗ (café ấm): khung gỗ, kính sáng vàng, mái tuyết
  function glassHouse(x,z,ry,w,d,h){const y=H(x,z);S.at(x,y,z,ry);L.at(x,y,z,ry);S.b('#8f98a3',0,.12,0,w+.6,.24,d+.6);
    L.b('#d9a868',0,h/2+.2,0,w-.2,h-.2,d-.2);S.b('#a8805c',0,h*.55,0,w+.05,.12,d+.05);for(let i=0;i<=4;i++){const t=-w/2+i*w/4;for(const sz of [-1,1])S.b('#a8805c',t,h/2+.2,sz*d/2,.16,h,.16)}for(let i=0;i<=3;i++){const t=-d/2+i*d/3;for(const sx of [-1,1])S.b('#a8805c',sx*w/2,h/2+.2,t,.16,h,.16)}
    for(const sz of [-1,1])S.b('#a8805c',0,h+.2,sz*d/2,w+.2,.2,.2);const a=.5,rh=Math.tan(a)*(d/2+.5),Lr=(d/2+.7)/Math.cos(a);
    for(const sd of [-1,1]){S.b('#8a6a4a',0,h+.2+rh/2,sd*(d/4+.2),w+1,.22,Lr,sd*a,0,0);S.b(SNOW,0,h+.42+rh/2,sd*(d/4+.2),w+1.1,.3,Lr+.05,sd*a,0,0)}
    stringLights(L,-w/2-.5,h+.25,d/2+.4,w/2+.5,h+.25,d/2+.4,Math.round(w*1.6),.12);S.reset();L.reset();block(x,z,Math.max(w,d)/2+.8);blockBox(x,z,ry,w/2+.3,d/2+.3)}
  // hàng rào gỗ thấp hai bên đường xe kéo, đèn lồng Bắc Âu cách quãng: tách đường xe với lối đi bộ
  function trailRails(pts,off,every){let acc=0;for(let i=0;i+1<pts.length;i++){const [ax,az]=pts[i],[bx,bz]=pts[i+1],len=Math.hypot(bx-ax,bz-az),ux=(bx-ax)/len,uz=(bz-az)/len,ang=Math.atan2(ux,uz),n=Math.max(1,Math.round(len/3));
    for(let k=0;k<n;k++){const t0=k/n,t1=(k+1)/n;for(const sd of [-1,1]){const x0=ax+(bx-ax)*t0-uz*off*sd,z0=az+(bz-az)*t0+ux*off*sd,x1=ax+(bx-ax)*t1-uz*off*sd,z1=az+(bz-az)*t1+ux*off*sd,mx=(x0+x1)/2,mz=(z0+z1)/2;
      S.b('#9a7a5a',x0,H(x0,z0)+.35,z0,.1,.7,.1);S.b('#b8906a',mx,H(mx,mz)+.55,mz,.06,.07,len/n,ang);S.b(SNOW,mx,H(mx,mz)+.62,mz,.1,.04,len/n,ang);bulb(mx,H(mx,mz)+.68,mz)}}}}
  // nhà gỗ sồi sáng có đầu hồi kính lớn khung gỗ chéo (nhà trại husky, nhà trang trại tuần lộc)
  function glassGable(x,z,ry,w,d,h,o){cabin(x,z,ry,Object.assign({w,d,h},o||{}));const y=H(x,z),rh=Math.tan(.72)*(w/2);S.at(x,y,z,ry);L.at(x,y,z,ry);
    L.b('#ffd9a0',0,h*.5,d/2+.05,w*.72,h*.92,.05);L.add(G.prism,'#ffd9a0',MX(0,h,d/2+.05,w*.62,rh*.72,.05));
    for(const sx of [-1,-.33,.33,1])S.b('#8a6a4a',sx*w*.36,h*.5,d/2+.1,.14,h*.92,.08);S.b('#8a6a4a',0,h,d/2+.1,w*.74,.16,.08);
    for(const sd of [-1,1])S.b('#8a6a4a',sd*w*.16,h+rh*.32,d/2+.1,.12,rh*.82,.08,0,0,-sd*.72);S.reset();L.reset()}
  // ---------- 05 Trại Husky (vẽ lại theo ảnh mẫu 28/11): nhà đón khách đầu hồi kính, biển đầu husky, ống khói đá, chân tường đá, ghế băng; dãy chuồng mở nối nhà bằng hành lang mái thấp;
  // bãi tròn rào gỗ hai thanh, 5 husky đeo đai, xe trượt gỗ; cổng gỗ mái tuyết có huy hiệu đầu husky, lối vào có cọc gỗ nối dây thừng; bãi là điểm xuất phát xe husky ----------
  {const huskyHead=(g,cx,cy,r)=>{g.fillStyle='#7d838c';g.beginPath();g.ellipse(cx,cy,r,r*.95,0,0,7);g.fill();for(const s of [-1,1]){g.beginPath();g.moveTo(cx+s*r*.35,cy-r*.6);g.lineTo(cx+s*r*.95,cy-r*1.45);g.lineTo(cx+s*r*.95,cy-r*.3);g.fill()}
      g.fillStyle='#f4f2ee';g.beginPath();g.moveTo(cx,cy-r*.55);g.quadraticCurveTo(cx+r*.75,cy-r*.15,cx+r*.55,cy+r*.55);g.quadraticCurveTo(cx,cy+r*1.05,cx-r*.55,cy+r*.55);g.quadraticCurveTo(cx-r*.75,cy-r*.15,cx,cy-r*.55);g.fill();
      g.fillStyle='#2a2d33';for(const s of [-1,1]){g.beginPath();g.ellipse(cx+s*r*.33,cy-r*.08,r*.1,r*.08,0,0,7);g.fill()}g.beginPath();g.ellipse(cx,cy+r*.45,r*.14,r*.1,0,0,7);g.fill()};
    const tex=(w,h,draw)=>{const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t};
    const plane=(t,w,h,lx,ly,lz,ry,dbl)=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshLambertMaterial({map:t,transparent:true,side:dbl?THREE.DoubleSide:THREE.FrontSide}));m.position.copy(new THREE.Vector3(lx,ly,lz).applyMatrix4(S.T));m.rotation.y=ry;sc.add(m)};
    // nhà đón khách: mặt nhìn ra bãi husky (hướng đông)
    {const x=-2,z=-21,y=H(x,z),ry=Math.PI/2,w=11,d=9,h=3.4,a=.62,b0=.6,rh=Math.tan(a)*(w/2+.9),Lr=(w/2+1)/Math.cos(a);S.at(x,y,z,ry);L.at(x,y,z,ry);
      S.b('#8c96a2',0,b0/2,0,w+.3,b0+.1,d+.3);S.b('#b98a5a',0,b0+h/2,0,w,h,d);for(let k=0;k<6;k++)S.b('#a07a50',0,b0+.3+k*.6,d/2+.02,w+.04,.06,.04);S.add(G.prism,'#b98a5a',MX(0,b0+h,0,w,rh-.3,d));
      for(const sd of [-1,1]){S.b('#5e4330',sd*(w/4+.2),b0+h+rh/2-.2,0,Lr,.26,d+1.8,0,0,-sd*a);S.b(SNOW,sd*(w/4+.2)-sd*.1,b0+h+rh/2+.05,0,Lr,.3,d+1.9,0,0,-sd*a)}
      L.add(G.prism,'#ffd9a0',MX(0,b0+h+.1,d/2+.04,w*.66,rh*.68,.05));S.b('#6e4a30',0,b0+h+.05,d/2+.1,w*.7,.18,.1);S.b('#6e4a30',0,b0+h+rh*.36,d/2+.12,.16,rh*.7,.1);for(const sd of [-1,1])S.b('#6e4a30',sd*w*.17,b0+h+rh*.34,d/2+.12,.12,rh*.66,.1,0,0,-sd*a);
      S.b('#6e4a30',0,b0+1.15,d/2+.06,1.7,2.3,.12);L.b('#ffd9a0',0,b0+1.25,d/2+.08,1.2,1.8,.03);for(const sx of [-1,1]){L.b('#ffd9a0',sx*3.1,b0+1.4,d/2+.04,2.6,2.1,.05);for(const k of [-1,0,1])S.b('#6e4a30',sx*3.1+k*1.3,b0+1.4,d/2+.09,.1,2.2,.06);S.b('#6e4a30',sx*3.1,b0+2.5,d/2+.09,2.8,.12,.06)}
      {const cx=w*.3,cz=-d*.2,y1=b0+h+rh*.4+1.9;S.b('#9d978f',cx,(b0+h+y1)/2,cz,1.2,y1-b0-h,1.2);for(let k=0;k*.45<y1-b0-h-.2;k++)S.b(k%2?'#8b857d':'#b1aba3',cx,b0+h+.3+k*.45,cz,1.25,.07,1.25);S.b('#6e6862',cx,y1+.1,cz,1.45,.2,1.45);S.b(SNOW,cx,y1+.24,cz,1.4,.1,1.4)}/* ống khói đá */
      // biển gỗ đầu husky "TRẠI HUSKY"
      plane(tex(640,260,(g)=>{g.fillStyle='#5e4128';g.beginPath();g.moveTo(20,110);g.lineTo(230,110);g.quadraticCurveTo(320,-10,410,110);g.lineTo(620,110);g.lineTo(620,250);g.lineTo(20,250);g.closePath();g.fill();g.strokeStyle='#d9b77e';g.lineWidth=6;g.stroke();
        huskyHead(g,320,72,34);g.fillStyle='#f6efe2';g.textAlign='center';g.font='700 58px Georgia,serif';g.fillText('TRẠI HUSKY',320,182,560);g.font='italic 30px Georgia,serif';g.fillStyle='#e8d6b4';g.fillText('Husky Camp',320,228)}),5.2,2.1,0,b0+h-.15,d/2+.2,ry);
      // ghế băng gỗ trước cửa
      for(const sx of [-3.6,3.6]){S.b('#a07a56',sx,.45,d/2+1.5,1.8,.1,.5);S.b(SNOW,sx,.53,d/2+1.5,1.7,.05,.45);S.b('#a07a56',sx,.8,d/2+1.3,1.8,.5,.08);for(const ex of [-.75,.75])S.b('#7a5a40',sx+ex,.22,d/2+1.5,.1,.44,.4)}
      // mái hiên trước cửa trên hai cột gỗ, bậc đá
      for(const sx of [-1.7,1.7]){S.b('#8a5f3a',sx,b0+1.25,d/2+1.9,.24,2.5,.24);S.b('#8a5f3a',sx*.7,b0+2.3,d/2+1.4,.12,.12,1.1,-.6,0,0)}S.b('#5e4330',0,b0+2.62,d/2+1.1,4.3,.16,2.5,.12,0,0);S.b(SNOW,0,b0+2.76,d/2+1.1,4.4,.16,2.6,.12,0,0);S.b('#8c96a2',0,.15,d/2+.9,3,.3,1.4);
      XS.T=S.T;XS.add(WREATH,'#2f5b48',MX(0,b0+h+rh*.42,d/2+.2,1.15,1.15,1));XS.add(G.sphLo,'#a5302a',MX(0,b0+h+rh*.42-.48,d/2+.26,.12));XS.reset();/* vòng nguyệt quế chỉ khi bật Giáng sinh */
      stringLights(L,-(w/2+.9),b0+h-.3,d/2+.95,0,b0+h+rh-.05,d/2+.95,12,0);stringLights(L,0,b0+h+rh-.05,d/2+.95,w/2+.9,b0+h-.3,d/2+.95,12,0);
      S.reset();L.reset();block(x,z,6.6);blockBox(x,z,ry,w/2+.15,d/2+.15)}
    // bãi tròn rào gỗ hai thanh (đường husky đi qua hai cửa rào)
    fence(16,-22,7,30,[1.66,4.25]);for(let i=0;i<60;i++){const a=i/60*6.28;if([1.66,4.25].some(g=>Math.abs(Math.atan2(Math.sin(a-g),Math.cos(a-g)))<.34))continue;block(16+Math.cos(a)*7,-22+Math.sin(a)*7,.55)}/* rào không đi xuyên, vào qua hai cửa */
    // 5 husky xám trắng đeo đai: ngồi, nằm, đứng
    const DG2=(x,z,r,pose,hc,yo)=>{const y=H(x,z)+(yo||0),sit=pose==='sit',lie=pose==='lie';S.at(x,y,z,r);const g='#7d838c',w='#f1f1ee',by=lie?.3:sit?.42:.5,hy=lie?.45:sit?.95:.72;
      S.add(G.sph,g,MX(0,by,sit?-.05:0,.2,sit?.26:.2,sit?.3:.42,sit?-.6:0,0,0));S.add(G.sph,w,MX(0,by-.06,.05,.16,.15,sit?.24:.35,sit?-.6:0,0,0));S.add(G.sph,g,MX(0,hy,sit?.2:.42,.15,.14,.17));S.add(G.sph,w,MX(0,hy-.06,sit?.34:.56,.08,.07,.1));
      for(const sx of [-1,1]){S.add(G.cone,g,MX(sx*.07,hy+.17,sit?.18:.4,.04,.12,.04));if(!lie)for(const sz of sit?[.18]:[-.25,.25])S.add(G.cyl,w,MX(sx*.09,.2,sz,.04,.4,.04))}
      S.add(G.sph,g,MX(0,by+.12,sit?-.32:-.45,.06,.06,.18,-.9,0,0));S.b(hc,0,by+.02,sit?.1:.18,.42,.42*.95,.08);S.b(hc,0,by+.2,sit?-.05:-.02,.08,.04,.4);S.reset();if(!yo)block(x,z,lie?.7:.5)};
    for(const [x,z,r,p,c] of [[11.5,-25,1.2,'sit','#2f5fa8'],[13,-27.2,.4,'lie','#b8322c'],[20.5,-17.6,3.6,'stand','#2f5fa8'],[21.2,-25.4,4.4,'lie','#b8322c'],[19.4,-27.6,5.2,'sit','#2f5fa8']])DG2(x,z,r,p,c);
    // Chuồng Chó Husky (theo ảnh mẫu): nhà riêng kế bên nhà trại, lùi về trước; mặt trước mở ba khoang vòm khung gỗ, rào thấp, mỗi khoang một husky; huy hiệu dấu chân trên đầu hồi; bệ đá; biển gỗ trên cột; lối lát đá xám
    {const x=1.2,z=-8.6,y=H(x,z),ry=Math.PI/2,W=8.4,D=4.4,b0=.3,h=2.7,a=.46,rh=Math.tan(a)*(W/2+.7),Lr=(W/2+.9)/Math.cos(a),WD='#b07a4c',TB='#8a5a34';S.at(x,y,z,ry);
      S.b('#8c96a2',0,b0/2,0,W+.5,b0+.1,D+.5);for(let k=0;k<9;k++)S.b(k%2?'#7f8994':'#9aa3ad',-W/2-.2+k*(W+.4)/8,b0*.5,D/2+.27,.9,b0*.8,.04);S.b('#d9bd82',0,b0+.03,.1,W-.3,.05,D-.4);/* bệ đá, rơm lót */
      S.b(WD,0,b0+h/2,-D/2+.1,W,h,.2);for(const sx of [-1,1])S.b(WD,sx*(W/2-.1),b0+h/2,0,.2,h,D);for(let k=0;k<7;k++)S.b('#9a6a40',-W/2+.6+k*(W-1.2)/6,b0+h/2,-D/2+.22,.06,h,.04);/* vách sau ván dọc */
      S.add(G.prism,WD,MX(0,b0+h,0,W,rh-.25,D));for(const sd of [-1,1]){S.b('#5e4330',sd*(W/4+.2),b0+h+rh/2-.18,0,Lr,.22,D+1.4,0,0,-sd*a);S.b(SNOW,sd*(W/4+.2)-sd*.08,b0+h+rh/2+.08,0,Lr,.32,D+1.5,0,0,-sd*a)}
      for(let i=0;i<4;i++){const px=-W/2+i*W/3;S.b(TB,px,b0+h/2,D/2-.15,.3,h,.3);if(i>0&&i<3)S.b(TB,px,b0+h/2,0,.12,h,D-.3)}/* cột trước, vách ngăn khoang */
      S.b(TB,0,b0+h-.05,D/2-.15,W+.3,.26,.32);/* xà đầu */
      for(let i=0;i<3;i++){const cx=-W/3+i*W/3,bw=W/3;for(const sd of [-1,1]){S.b(TB,cx+sd*(bw/2-.42),b0+h-.5,D/2-.12,.95,.18,.2,0,0,sd*.75);S.b(TB,cx+sd*(bw/2-.95),b0+h-.24,D/2-.12,.5,.16,.2,0,0,sd*.3)}/* vòm khung gỗ */
        for(const hy of [.3,.68])S.b('#c08d5a',cx,b0+hy,D/2-.08,bw-.4,.08,.07);for(let k=0;k<6;k++)S.b('#c08d5a',cx-bw/2+.4+k*(bw-.8)/5,b0+.38,D/2-.08,.06,.7,.06)}/* rào thấp */
      S.b('#6e4a30',0,b0+h+.18,D/2+.05,W*.82,.16,.14);S.b('#6e4a30',0,b0+h+rh*.42,D/2+.05,.16,rh*.62,.14);for(const sd of [-1,1])S.b('#6e4a30',sd*W*.2,b0+h+rh*.36,D/2+.05,.13,rh*.64,.13,0,0,-sd*(a+.5));/* kèo đầu hồi */
      plane(tex(200,200,g=>{g.fillStyle='#6b4a2c';g.beginPath();g.arc(100,100,96,0,7);g.fill();g.strokeStyle='#d9b77e';g.lineWidth=8;g.stroke();g.fillStyle='#f3e6c8';g.beginPath();g.ellipse(100,122,34,28,0,0,7);g.fill();for(const [px,py,r] of [[58,82,13],[82,60,14],[118,60,14],[142,82,13]]){g.beginPath();g.ellipse(px,py,r,r*1.25,0,0,7);g.fill()}}),1.25,1.25,0,b0+h+rh*.46,D/2+.14,ry);/* huy hiệu dấu chân */
      S.reset();for(const k of [-1,0,1])block(...[x,z-k*2.8],2.2);
      // ba husky trong ba khoang
      for(const [k,p,c] of [[-1,'lie','#2f5fa8'],[0,'sit','#b8322c'],[1,'lie','#2f5fa8']]){const lz=k*W/3;DG2(x+.4,z-lz,Math.PI/2+(k?k*.25:0),p,c,b0+.05)}
      // biển gỗ "Chuồng Chó Husky" trên cột, phía trước bên trái
      {const sx=x+2.4,sz=z+5.3,sy=H(sx,sz);S.b('#7a5a40',sx,sy+1.3,sz,.22,2.6,.22);S.b('#7a5a40',sx,sy+2.5,sz-.7,.18,.18,1.6);S.b(SNOW,sx,sy+2.62,sz-.7,.24,.08,1.65);S.b('#5e4128',sx,sy+1.6,sz-.95,.08,.9,1.6);S.b(SNOW,sx,sy+2.08,sz-.95,.14,.08,1.65);block(sx,sz,.4);
        const m=new THREE.Mesh(new THREE.PlaneGeometry(1.5,.82),new THREE.MeshLambertMaterial({map:tex(360,200,g=>{g.fillStyle='#5e4128';g.fillRect(0,0,360,200);g.strokeStyle='#d9b77e';g.lineWidth=6;g.strokeRect(8,8,344,184);g.strokeStyle='#f3e6c8';g.lineWidth=4;g.beginPath();g.moveTo(130,78);g.lineTo(165,40);g.lineTo(185,60);g.lineTo(205,36);g.lineTo(240,78);g.stroke();g.fillStyle='#f6efe2';g.textAlign='center';g.font='600 40px Georgia,serif';g.fillText('Chuồng Chó Husky',180,135,330)})}));m.position.set(sx+.05,sy+1.6,sz-.95);m.rotation.y=Math.PI/2;sc.add(m)}
      // lối lát đá xám nhỏ từ lối vào trại tới trước chuồng
      {const PV=['#9aa2ac','#a9b0b9','#8f98a3','#b4bbc4'];for(let i=0;i<5;i++)for(let j=-3;j<=3;j++){const px=x+D/2+.8+i*.62,pz=z+j*.62+(i%2?.31:0),py=H(px,pz);S.b('#e6ebf2',px,py+.03,pz,.64,.06,.64);S.b(PV[(i*3+j+9)%4],px,py+.08,pz,.55,.08,.55,0,(i+j)%3*.04,0)}}}
    // xe trượt gỗ mộc chờ trong bãi
    {const x=21.5,z=-21.5,y=H(x,z);S.at(x,y,z,.3);S.b('#c99d70',0,.35,-.2,.9,.1,1.9);S.b('#8f949a',0,.55,-.4,.8,.25,1);S.b('#c99d70',0,.8,-.95,.86,.6,.1);for(const sx of [-.45,.45]){S.b('#b8906a',sx,.04,-.2,.06,.06,2.4);S.b('#b8906a',sx,.6,-1.05,.06,1.1,.06);S.add(G.cyl,'#b8906a',MX(sx,.25,1.05,.05,.5,.05,.6,0,0))}S.reset();block(x,z,1.1)}
    // cổng gỗ mái tuyết, huy hiệu đầu husky; lối vào có cọc gỗ nối dây thừng hai bên (chỉ đoạn lối vào trại)
    {const x=7,z=-4,ry=Math.atan2(5-x,-15-z),y=H(x,z);S.at(x,y,z,ry);for(const sx of [-1.5,1.5])S.b('#8a6a4a',sx,1.6,0,.3,3.2,.3);S.b('#8a6a4a',0,3.1,0,3.6,.22,.3);S.add(G.prism,'#5e4330',MX(0,3.2,0,4.2,.9,1.3));S.b(SNOW,-1.05,3.62,0,2.3,.14,1.4,0,0,.42);S.b(SNOW,1.05,3.62,0,2.3,.14,1.4,0,0,-.42);
      for(const s of [1,-1])plane(tex(160,160,g=>{g.fillStyle='#5e4128';g.beginPath();g.arc(80,80,76,0,7);g.fill();g.strokeStyle='#d9b77e';g.lineWidth=6;g.stroke();huskyHead(g,80,92,34)}),1,1,0,3.45,s*.17,ry+(s<0?Math.PI:0));
      S.reset();block(...[x+Math.cos(ry)*1.5,z-Math.sin(ry)*1.5],.4);block(...[x-Math.cos(ry)*1.5,z+Math.sin(ry)*1.5],.4);
      const ex=5,ez=-15,ln=Math.hypot(ex-x,ez-z),ux=(ex-x)/ln,uz=(ez-z)/ln,n=Math.floor(ln/2.2);for(const sd of [-1,1]){let prev=null;for(let k=0;k<=n;k++){const t=k/n*.82+.06,px=x+(ex-x)*t-uz*1.6*sd,pz=z+(ez-z)*t+ux*1.6*sd,py=H(px,pz);if(px<6.6&&Math.abs(pz+8.6)<3.4){prev=null;continue}/* chừa lối vào Chuồng Chó */S.b('#8a6a4a',px,py+.45,pz,.16,.9,.16);S.b(SNOW,px,py+.93,pz,.2,.06,.2);
        if(prev){const mx=(px+prev[0])/2,mz=(pz+prev[1])/2,l2=Math.hypot(px-prev[0],pz-prev[1]),an=Math.atan2(px-prev[0],pz-prev[1]);for(const [f,dy] of [[.25,-.1],[.5,-.16],[.75,-.1]])S.add(G.cyl,'#d8c8a4',MX(prev[0]+(px-prev[0])*f,py+.78+dy,prev[1]+(pz-prev[1])*f,.025,l2/3+.12,.025,Math.PI/2,an,0))}prev=[px,pz]}}}
    /* đường husky không rào; bản Giáng sinh có đèn nhỏ hai bên */for(const t of HTRAILS)for(let i=0;i+1<t.length;i++){const [ax,az]=t[i],[bx,bz]=t[i+1],ln=Math.hypot(bx-ax,bz-az),ux=(bx-ax)/ln,uz=(bz-az)/ln,n=Math.max(1,Math.round(ln/3.2));for(let k=0;k<n;k++){const q=(k+.5)/n,x=ax+(bx-ax)*q,z=az+(bz-az)*q;for(const sd of [-1,1]){const px=x-uz*2.4*sd,pz=z+ux*2.4*sd;if(Math.hypot(px-16,pz+22)>7.6)bulb(px,H(px,pz)+.12,pz)}}}}
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
    const deer=(x,z,ry,mode)=>{DEERS.push({x,z,ry,lie:mode==='lie'});const y=H(x,z),lie=mode==='lie',graze=mode==='graze',br='#8f7c66',dk='#4f4032',lt='#efe7d8',an='#cdb894',B=S;B.at(x,y-(lie?.62:0),z,ry);
      B.add(G.sph,br,MX(0,1.05,0,.4,.38,.8));B.add(G.sph,lt,MX(0,.98,.5,.33,.34,.26));B.add(G.sph,lt,MX(0,1.0,-.74,.16,.18,.08));
      const hy=graze?.55:1.6,hz=graze?.98:.88;B.add(G.cyl,lt,MX(0,(1.15+hy)/2+.05,(.55+hz)/2,.15,.72,.15,graze?1.1:-.5,0,0));B.add(G.sph,br,MX(0,hy,hz+.12,.16,.16,.28));B.add(G.sph,dk,MX(0,hy-.03,hz+.38,.07,.06,.06));
      for(const sx of [-1,1]){if(!lie)for(const sz of [-.45,.45])B.add(G.cyl,dk,MX(sx*.19,.45,sz,.055,.9,.055));else for(const sz of [-.4,.42])B.b(dk,sx*.3,.72,sz+.1,.12,.12,.5);
        const ax=sx*.1,ay=hy+.2,az=hz+.05;B.add(G.cyl,an,MX(ax+sx*.14,ay+.3,az-.08,.03,.75,.03,-.35,0,-sx*.45));B.add(G.cyl,an,MX(ax+sx*.4,ay+.68,az-.25,.025,.55,.025,-.75,0,-sx*.2));
        B.add(G.cyl,an,MX(ax+sx*.24,ay+.6,az+.12,.022,.36,.022,.55,0,-sx*.3));B.add(G.cyl,an,MX(ax+sx*.5,ay+.9,az-.05,.02,.3,.02,.2,0,-sx*.6))}
      B.add(WREATH,'#b8322c',MX(0,1.03,.28,.95,.92,.45));B.b('#b8322c',0,1.42,.05,.12,.06,.62);B.add(G.sphLo,'#e0b04a',MX(0,.66,.36,.08));B.reset();block(x,z,lie?1:.9)};
    for(const [x0,z0,r,m] of [[132,84,.6,'stand'],[137,93,2.3,'graze'],[141,86,4.2,'lie'],[146,82,1.2,'stand'],[150,91,5.4,'graze'],[136,80,2.9,'stand'],[153,86,.2,'lie'],[145,95,3.3,'graze'],[129,91,1.7,'stand']])deer(x0-142+FARM.x,z0-88+FARM.z,r,m);
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
      S.reset();L.reset();block(x,z,7.5);for(const sd of [-1,1])block(x,z+sd*7.5,2.4);blockBox(x,z,ry,w/2+.15,d/2+.15);for(const sd of [-1,1])blockBox(x,z,ry,1.8,(d-2.6)/2+.1,sd*(w/2+1.6),.6)}
    block(FX-FRX-6,FZ+5,0);/* xe tuần lộc của ông già Noel: xem Chuyến xe trao Yên */
    block(FX,FZ,11.5);block(FX-7,FZ,10.5);block(FX+7,FZ,10.5)}
  {
    // 3 Khu nghỉ ngắm cảnh: chòi gỗ nhỏ bên trái và một góc ghế
    for(const [bx,bz,br] of [[153,70,.3],[156,72,1.1]]){const by=H(bx,bz);S.b('#c99d70',bx,by+.45,bz,1.8,.1,.5,br);S.b('#a8805c',bx,by+.22,bz,1.6,.44,.12,br)}
    // cổng biển gỗ "Trang Trại Tuần Lộc" có gạc, mái nhỏ phủ tuyết; bảng thông tin gỗ cạnh cổng
    {const x=124.5,z=96,y=H(x,z);S.at(x,y,z,-Math.PI/2);for(const sx of [-1.3,1.3])S.b('#b8906a',sx,1.6,0,.25,3.2,.25);S.b('#c99d70',0,2.3,0,2.4,1,.16);S.b('#8a6a4a',0,3.3,0,3.2,.14,.9,0,0,0);S.b(SNOW,0,3.45,0,3.3,.2,1);
      for(const sx of [-1,1]){S.add(G.cyl,'#f1eee5',MX(sx*.3,3.05,.12,.04,.5,.04,0,0,-sx*.5));S.add(G.cyl,'#f1eee5',MX(sx*.48,3.2,.12,.03,.3,.03,0,0,sx*.4))}S.reset();
      const ix=125,iz=80,iy=H(ix,iz);S.at(ix,iy,iz,-Math.PI/2);S.b('#b8906a',0,.6,0,.14,1.2,.14);S.b('#c99d70',0,1.25,0,1.4,.9,.1,0,-.35,0);S.b('#f1eee5',0,1.27,.05,1.1,.6,.02,0,-.35,0);S.reset();block(x,z,1.6);block(ix,iz,.9)}
  }
  // ---------- Chùa Tuyết Yên trên núi, góc trên bên trái bản đồ (tây bắc) ----------
  const TP={x:HILL.x,z:HILL.z},TRY=Math.atan2(STAIR.x-HILL.x,STAIR.z-HILL.z),tw=(lx,lz)=>[TP.x+Math.cos(TRY)*lx+Math.sin(TRY)*lz,TP.z-Math.sin(TRY)*lx+Math.cos(TRY)*lz];
  {const y=H(TP.x,TP.z);S.at(TP.x,y,TP.z,TRY);L.at(TP.x,y,TP.z,TRY);LA.at(TP.x,y,TP.z,TRY);
    // Chánh điện kiểu Bắc Âu (tấm 08): nhà gỗ sồi một tầng, hai lớp mái dốc nhẹ phủ tuyết, lam gỗ dọc, cửa kính lớn sáng ấm, hoa sen phát sáng trên đầu hồi
    const oak='#d2a676',dk='#a07a56',st='#9ca4ae',z0=-1.5,w=11,d=8,h=3.4,y0=.7;
    S.b(st,0,.3,z0+.8,14,.8,12.5);for(let i=0;i<4;i++)S.b(i%2?'#aab2bc':st,0,.1+i*.17,z0+d/2+3.2-i*.45,7,.2,1);/* nền đá, bậc thềm rộng */
    S.b(oak,0,y0+h/2,z0,w,h,d);for(let x=-w/2+.3;x<=w/2-.2;x+=.45)if(Math.abs(x)>2.5){S.b(dk,x,y0+h/2,z0+d/2+.03,.12,h,.06);S.b(dk,x,y0+h/2,z0-d/2-.03,.12,h,.06)}
    for(let zz=-d/2+.3;zz<=d/2-.2;zz+=.45)for(const sx of [-1,1])S.b(dk,sx*(w/2+.03),y0+h/2,z0+zz,.06,h,.12);
    LA.b('#ffcf86',0,y0+1.4,z0+d/2+.04,4.6,2.7,.05);for(const x of [-2.35,-1.15,0,1.15,2.35])S.b('#4a3828',x,y0+1.4,z0+d/2+.08,.12,2.8,.08);S.b('#4a3828',0,y0+2.8,z0+d/2+.08,4.8,.14,.1);
    for(const sx of [-1,1])L.b('#ffc977',sx*(w/2+.04),y0+1.8,z0,.05,1.4,3);
    const roof=(yb,half,rise,len,col)=>{const a=Math.atan2(rise,half),Lr=Math.hypot(half,rise);for(const sd of [-1,1]){S.b(col,sd*half/2,yb+rise/2,z0,Lr,.26,len,0,0,-sd*a);S.b(SNOW,sd*(half/2-.06),yb+rise/2+.26,z0,Lr+.05,.32,len+.15,0,0,-sd*a)}S.b(SNOW,0,yb+rise+.2,z0,.6,.3,len+.15)};
    S.add(G.prism,oak,MX(0,y0+h,z0,w,1.9,d));roof(y0+h-.15,w/2+1.1,2.3,d+1.8,'#a8805c');
    S.b(oak,0,y0+h+2.1,z0,5.6,1.3,d-1.4);S.add(G.prism,oak,MX(0,y0+h+2.75,z0,5.6,1.2,d-1.4));roof(y0+h+2.6,3.4,1.45,d,'#a8805c');
    {const gx=0,gy=y0+h+3.2,gz=z0+(d-1.4)/2+.06;for(const a of [-.95,-.48,0,.48,.95])LA.add(G.sph,'#ffd98a',MX(gx+Math.sin(a)*.22,gy+Math.cos(a)*.22,gz,.09,.32,.03,0,0,-a));LA.b('#ffd98a',gx,gy-.12,gz,.7,.05,.03)}
    stringLights(L,-w/2-1,y0+h-.2,z0+d/2+.9,w/2+1,y0+h-.2,z0+d/2+.9,20,0);
    S.add(G.cyl12,'#7a3a28',MX(0,.86,4.4,.45,.12,.45));/* toạ cụ trên thềm đá, nhìn vào chánh điện */
    // Tượng Phật ngoài trời: cùng mẫu tượng Phật trên đồi Rừng Yên (kiết già, thiền định ấn), màu trắng, trên bệ đá tự nhiên bên phải chánh điện
    {const bx=10.5,bz=1.5;for(const [rx,rz,rr,ry] of [[0,0,1.9,.7],[-1.2,.8,1.1,.5],[1.3,.6,1.2,.55],[.4,-1,1.3,.6],[-.9,-.7,1,.45]])S.add(G.sphLo,rx%2?'#8f8a84':'#a29d96',MX(bx+rx,ry,bz+rz,rr,ry+.35,rr));S.add(G.sphLo,SNOW,MX(bx,1.1,bz,1.6,.3,1.5));S.add(G.cyl12,'#a29d96',MX(bx,1.2,bz,1.5,.3,1.5))}
    S.reset();L.reset();LA.reset();warm(...tw(0,2).slice(0,1),y+3.2,tw(0,2)[1],16,18);
    {  // 3.14: Seated Buddha in full lotus (kiết già), dhyana mudra: crossed shins with upturned soles, hands resting in the lap,
  // robe over the left shoulder with the right shoulder bare, curled hair and ushnisha, long earlobes, eyes lowered.
  const buddha=new THREE.Group();const bm=c=>new THREE.MeshLambertMaterial({color:c}),skin=bm('#f6f4ef'),robeGold=bm('#eeebe4'),robeFold=bm('#dedad2'),hairM=bm('#e6e2da'),lineM=bm('#b9b2a6'),gold=bm('#f2eee6');
  const lotusBase=new THREE.Mesh(new THREE.CylinderGeometry(1.05,1.2,.28,24),gold);lotusBase.position.y=.14;buddha.add(lotusBase);
  for(let ring=0;ring<2;ring++)for(let k=0;k<12;k++){const a=k*Math.PI/6+ring*Math.PI/12,r=ring?.95:1.12;const pet=new THREE.Mesh(new THREE.SphereGeometry(.3,10,8),ring?robeGold:gold);pet.scale.set(.55,.42,1.1);pet.position.set(Math.cos(a)*r,.34+ring*.1,Math.sin(a)*r);pet.rotation.y=-a+Math.PI/2;pet.rotation.x=ring?-.5:-.25;buddha.add(pet)}
  const bAdd=(geo,m,x,y,z,sx=1,sy=1,sz=1)=>{const o=new THREE.Mesh(geo,m);o.position.set(x,y,z);o.scale.set(sx,sy,sz);buddha.add(o);return o};
  const limb=(r,a,b,m)=>{const A=new THREE.Vector3(...a),B=new THREE.Vector3(...b),d=B.clone().sub(A),o=new THREE.Mesh(new THREE.CapsuleGeometry(r,Math.max(.01,d.length()),5,12),m);o.position.copy(A).add(B).multiplyScalar(.5);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());buddha.add(o);return o};
  // lap and crossed legs
  bAdd(new THREE.SphereGeometry(1,24,14),robeGold,0,.6,.12,1.02,.27,.66);
  limb(.19,[-.82,.62,.12],[.36,.66,.46],robeGold);limb(.19,[.82,.66,.18],[-.34,.74,.4],robeFold);
  bAdd(new THREE.SphereGeometry(.22,14,10),robeGold,-.84,.6,.14);bAdd(new THREE.SphereGeometry(.22,14,10),robeFold,.84,.64,.18);
  for(const [x,z,s] of [[.44,.44,1],[-.42,.38,-1]]){const sole=bAdd(new THREE.SphereGeometry(.14,12,8),skin,x,.82,z,1.5,.5,.85);sole.rotation.z=s*.35;for(let t=0;t<5;t++)bAdd(new THREE.SphereGeometry(.032,6,5),skin,x+s*.2,.86+t*.012,z-.09+t*.045)}
  // robe hem pooling over the lotus
  bAdd(new THREE.CylinderGeometry(1.02,1.08,.12,28),robeFold,0,.46,.1,1,1,.68);
  // torso from a lathe profile, slightly flattened front to back
  const torsoG=new THREE.LatheGeometry([[0,.82],[.44,.84],[.42,1.05],[.46,1.35],[.53,1.62],[.6,1.84],[.5,1.98],[.2,2.07],[0,2.08]].map(([r,y])=>new THREE.Vector2(r,y)),24);
  bAdd(torsoG,robeGold,0,0,.02,1,1,.7);
  // bare right shoulder and chest, robe edge falling diagonally from the left shoulder
  bAdd(new THREE.SphereGeometry(.34,16,12),skin,.28,1.72,.06,1,.95,.72);bAdd(new THREE.SphereGeometry(.24,14,10),skin,.56,1.84,.0,1,.8,.85);
  limb(.06,[-.42,1.98,.3],[.4,1.1,.34],robeFold);limb(.05,[-.5,1.95,-.05],[-.55,1.2,-.2],robeFold);
  // arms: upper arms down the sides, forearms in toward the lap
  limb(.15,[-.6,1.82,.02],[-.66,1.22,.12],robeGold);limb(.14,[.6,1.82,.02],[.66,1.22,.12],skin);
  limb(.13,[-.66,1.22,.12],[-.22,.92,.48],robeGold);limb(.12,[.66,1.22,.12],[.22,.94,.5],skin);
  bAdd(new THREE.SphereGeometry(.15,14,10),robeFold,-.66,1.22,.12);bAdd(new THREE.SphereGeometry(.14,14,10),skin,.66,1.22,.12);
  // dhyana mudra: right hand resting on the left, palms up, thumb tips touching
  bAdd(new THREE.SphereGeometry(.2,14,10),skin,0,.9,.5,1.25,.32,.78);bAdd(new THREE.SphereGeometry(.19,14,10),skin,0,.95,.52,1.2,.3,.74);
  limb(.035,[-.13,.98,.6],[0,1.05,.6],skin);limb(.035,[.13,.98,.6],[0,1.05,.6],skin);
  // neck with the three beauty folds
  bAdd(new THREE.CylinderGeometry(.15,.18,.24,14),skin,0,2.14,0);for(const y of [2.08,2.14,2.2]){const f=bAdd(new THREE.TorusGeometry(.16,.008,4,20),lineM,0,y,0);f.rotation.x=Math.PI/2}
  // head
  const hy=2.48;bAdd(new THREE.SphereGeometry(.34,24,18),skin,0,hy,.02,1,1.14,1.02);
  bAdd(new THREE.SphereGeometry(.355,24,14,0,Math.PI*2,0,Math.PI*.45),hairM,0,hy+.02,-.01,1,1.12,1.04);
  bAdd(new THREE.SphereGeometry(.17,16,12),hairM,0,hy+.42,-.02,1,1.05,1);
  for(let ring=0;ring<4;ring++){const n=[14,12,9,5][ring],el=.25+ring*.22;for(let k=0;k<n;k++){const a=k/n*Math.PI*2+ring*.2;const r=.36*Math.sin(Math.PI/2-el)*1.02;bAdd(new THREE.SphereGeometry(.04,6,5),hairM,Math.sin(a)*r,hy+.02+.38*Math.cos(Math.PI/2-el)*1.1,Math.cos(a)*r*1.02)}}
  for(let k=0;k<7;k++){const a=k/7*Math.PI*2;bAdd(new THREE.SphereGeometry(.035,6,5),hairM,Math.sin(a)*.12,hy+.47,Math.cos(a)*.12-.02)}
  for(const s of [-1,1]){bAdd(new THREE.CapsuleGeometry(.05,.3,3,8),skin,s*.34,hy-.1,0);
    const lid=bAdd(new THREE.TorusGeometry(.065,.009,4,12,Math.PI),lineM,s*.12,hy+.02,.33);lid.rotation.z=Math.PI;
    const brow=bAdd(new THREE.TorusGeometry(.1,.008,4,14,Math.PI*.8),lineM,s*.12,hy+.06,.32);brow.rotation.z=Math.PI*.1}
  bAdd(new THREE.ConeGeometry(.035,.14,8),skin,0,hy-.06,.37).rotation.x=.2;bAdd(new THREE.SphereGeometry(.018,6,5),gold,0,hy+.1,.36);
  const mouth=bAdd(new THREE.TorusGeometry(.05,.008,4,10,Math.PI),lineM,0,hy-.16,.33);mouth.rotation.z=Math.PI;
  // halo behind the head and a soft aura behind the body
  const glow=c=>new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:.3,fog:false,side:THREE.DoubleSide,depthWrite:false});
  bAdd(new THREE.RingGeometry(.55,.9,48),glow('#fff3d6'),0,hy+.04,-.36);bAdd(new THREE.RingGeometry(.92,.97,48),glow('#fff6e0'),0,hy+.04,-.37);
  const aura=bAdd(new THREE.RingGeometry(1.25,1.33,56),glow('#fff0d0'),0,1.45,-.42,1,1.25,1);


      const c=tw(10.5,1.5);buddha.scale.setScalar(1.45);buddha.position.set(c[0],y+1.36,c[1]);buddha.rotation.y=TRY;sc.add(buddha)}
    {const c=tw(0,-1.5);block(c[0],c[1],7.8)}{const c=tw(10.5,1.5);block(c[0],c[1],5.5)}
    for(const [lx,lz,h] of [[-10,-3,8],[-9,-9,9],[8,-8,7],[-12,4,6],[16,-4,8],[6,-6,6]]){const c=tw(lx,lz);pine(T,c[0],c[1],h)}}
  // lối lên chùa lát đá nhỏ xám liền mạch, tuyết ở khe (theo ảnh mẫu đá lát); không có trụ hai bên
  {const a=tw(0,7.2),b=STAIR,len=Math.hypot(a[0]-b.x,a[1]-b.z),ang=Math.atan2(a[0]-b.x,a[1]-b.z),ux=(a[0]-b.x)/len,uz=(a[1]-b.z)/len,PV=['#9aa2ac','#a9b0b9','#8f98a3','#b4bbc4','#a3abb5'],W=3.4,R=.62;
    for(let r=0;r*R<=len;r++){const cx=b.x+ux*r*R,cz=b.z+uz*r*R,yc=H(cx,cz);S.b('#e6ebf2',cx,yc+.04,cz,W+.2,.08,R+.02,ang);const off=r%2?R/2:0;
      for(let c=-W/2+R/2+off;c<=W/2-R/3;c+=R){const px=cx+Math.cos(ang)*c,pz=cz-Math.sin(ang)*c,py=H(px,pz),k=(r*7+Math.round(c*10))%PV.length;S.b(PV[(k+PV.length)%PV.length],px,py+.1,pz,Math.min(R-.07,W/2-c+R/2-.07),.1,R-.07,ang+((r+k)%3-1)*.03)}}}
  // 28/11 (đổi theo người dùng): bỏ đèn đá đứng dưới đất; chỉ gắn đèn nhỏ trang trí: hai mép lối đá lên chùa, viền mái và góc tường chánh điện, quanh bệ tượng Phật. Luôn sáng, vàng dịu, không lấn cực quang
  {const bl=(x,y,z,i,s)=>LA.add(G.sphLo,i%3?'#ffd896':'#fff0d0',MX(x,y,z,s||.06));
    // hai mép lối đá
    {const a=tw(0,7.2),b=STAIR,len=Math.hypot(a[0]-b.x,a[1]-b.z),ux=(a[0]-b.x)/len,uz=(a[1]-b.z)/len;let i=0;
      for(let t=.4;t<len;t+=1.4,i++){const cx=b.x+ux*t,cz=b.z+uz*t;for(const sd of [-1,1]){const px=cx-uz*1.82*sd,pz=cz+ux*1.82*sd;bl(px,H(px,pz)+.12,pz,i)}}}
    const y=H(TP.x,TP.z),z0=-1.5,w=11,d=8,h=3.4,y0=.7;LA.at(TP.x,y,TP.z,TRY);
    const line=(x0,y1,za,x1,y2,zb,step,s)=>{const n=Math.max(1,Math.round(Math.hypot(x1-x0,y2-y1,zb-za)/step));for(let k=0;k<=n;k++){const t=k/n;bl(x0+(x1-x0)*t,y1+(y2-y1)*t,za+(zb-za)*t,k,s)}};
    // mái dưới: hai đường rìa đầu hồi trước và sau, hai mép mái dọc hai hông
    {const ex=w/2+1.1,ey=y0+h-.32,top=ey+2.3,ez=z0+(d+1.8)/2+.06;for(const zz of [ez,z0*2-ez])for(const sd of [-1,1])line(sd*ex,ey,zz,0,top,zz,.45);for(const sd of [-1,1])line(sd*(ex+.04),ey,z0-(d+1.8)/2,sd*(ex+.04),ey,z0+(d+1.8)/2,.45)}
    // mái trên: rìa đầu hồi phía trước
    {const ex=3.4,ey=y0+h+2.45,ez=z0+d/2+.06;for(const sd of [-1,1])line(sd*ex,ey,ez,0,ey+1.45,ez,.4)}
    // tường: bốn góc chánh điện và dải dưới mái phía trước
    for(const sx of [-1,1])for(const sz of [-1,1])line(sx*(w/2+.1),y0+.15,z0+sz*(d/2+.1),sx*(w/2+.1),y0+h-.1,z0+sz*(d/2+.1),.4);
    line(-w/2,y0+h-.12,z0+d/2+.1,w/2,y0+h-.12,z0+d/2+.1,.45);
    // quanh tượng Phật: một vòng trên mép bệ đá tròn, một vòng sát chân bệ đá tự nhiên
    {const bx=10.5,bz=1.5;for(let k=0;k<32;k++){const a=k/32*Math.PI*2;bl(bx+Math.cos(a)*1.68,1.56,bz+Math.sin(a)*1.68,k,.055)}/* viền chân đài sen */
      LA.reset();for(let k=0;k<36;k++){const a=k/36*Math.PI*2,r=2.9+.15*Math.sin(k*1.3),c=tw(bx+Math.cos(a)*r,bz+Math.sin(a)*r);bl(c[0],H(c[0],c[1])+.1,c[1],k)}}/* vòng sát chân bệ đá */
    LA.reset()}
  {const s=STATIONS.find(s=>s.id==='sit'),c=tw(0,5.8);s.x=c[0];s.z=c[1];const b=STATIONS.find(s=>s.id==='bell'),d=tw(10.5,5.6);b.x=d[0];b.z=d[1]}

  // ---------- trồng thông: dày ở rừng tây và dải sau lều kính, thưa quanh làng ----------
  const segD=(x,z,ax,az,bx,bz)=>{const dx=bx-ax,dz=bz-az,t=Math.max(0,Math.min(1,((x-ax)*dx+(z-az)*dz)/(dx*dx+dz*dz)));return Math.hypot(x-ax-dx*t,z-az-dz*t)};
  const stTop=tw(0,7.2);
  const keep=(x,z)=>{if(lakeE(x,z)<1.12)return false;
    if(Math.hypot(x-FARM.x,z-FARM.z)<FARM.r+6)return false;if(Math.hypot(x-TREE.x,z-TREE.z)<46||VH.some(v=>Math.hypot(x-v.x,z-v.z)<(v.k==='main'?15.5:Math.max(v.w,v.d)*.6+4))||/* chừa rừng quanh nhà làng đã lùi ra xa */Math.hypot(x-FUN.x,z-FUN.z)<24||Math.hypot(x-RH.x,z-RH.z)<18||Math.hypot(x-16,z+22)<13||Math.hypot(x-6,z+9)<7||Math.hypot(x-FIRE2.x,z-FIRE2.z)<6||Math.hypot(x-STAGE.x,z-STAGE.z)<13||segD(x,z,STAGE.x,STAGE.z,RINK.x,RINK.z)<9||Math.hypot(x-KOTA.x,z-KOTA.z)<8||Math.hypot(x-SNOWMAN.x,z-SNOWMAN.z)<11.5||/* chừa lối đá vòng quanh người tuyết của hội chợ */homeClear(x,z)||Math.hypot(x-WHEEL.x,z-WHEEL.z)<15||Math.hypot(x-CAR.x,z-CAR.z)<10||Math.hypot(x-FARM.x-25,z-FARM.z)<14||Math.hypot(x-FARM.x+23,z-FARM.z-3)<7)return false;if(Math.hypot(x-TP.x,z-TP.z)<15)return false;if(segD(x,z,STAIR.x,STAIR.z,stTop[0],stTop[1])<5)return false;
    for(const [ix,iz] of IGLOOS){const [lx,lz]=toLake([ix,iz],16);if(Math.hypot(x-ix,z-iz)<8.5||segD(x,z,ix,iz,lx,lz)<4.5)return false}if(Math.abs(x)<9&&z>80&&z<104)return false;
    for(const p of PATHS)for(let i=0;i+1<p.length;i++)if(segD(x,z,...p[i],...p[i+1])<4)return false;
    for(const c of colliders)if(Math.hypot(x-c[0],z-c[1])<c[2]+1.5)return false;for(const q of PEAKS)if(Math.hypot(x-q.x,z-q.z)<q.R*1.25)return false;/* không trồng cây trên vách đá */for(const t of HTRAILS)for(let i=0;i+1<t.length;i++)if(segD(x,z,...t[i],...t[i+1])<4)return false;for(const r of SKIRUNS)for(let i=0;i+1<r.length;i++)if(segD(x,z,...r[i],...r[i+1])<7)return false;if(segD(x,z,...LIFT[0],...LIFT[1])<4||Math.hypot(x-SKI.x,z-SKI.z+2)<12)return false;if(Math.abs(x-SKI.x)<30&&z>SKI.z-4&&z<SKI.z+62&&rnd()<.85)return false;if(segD(x,z,PIER[0][0],PIER[0][1],PIER[0][0]-8,PIER[0][1])<4)return false;if(Math.hypot((x-RINK.x)/(RINK.rx+6),(z-RINK.z)/(RINK.rz+6))<1)return false;for(let i=0;i+1<HUSKY_TRAIL.length;i++)if(segD(x,z,...HUSKY_TRAIL[i],...HUSKY_TRAIL[i+1])<4)return false;
    for(const zn of ZONES){const l=Math.hypot(zn.cam[0],zn.cam[1]);if(Math.hypot(x-zn.x,z-zn.z)<8||segD(x,z,zn.x,zn.z,zn.x-zn.cam[0]/l*18,zn.z-zn.cam[1]/l*18)<8)return false}return true};
  {const N=LOW?1500:4800;let n=0,tries=0;while(n<N&&tries<N*12){tries++;const x=(rnd()-.5)*560,z=(rnd()-.5)*560,r=Math.hypot(x,z);if(r>300)continue;
    let p=.12;if(x<-40&&z<20&&z>-150)p=.92;else if(z<-20)p=.93;else if(x>30)p=.9;else if(z<20)p=.6;else if(z<-60)p=.5;else if(r>130)p=.55;if(rnd()>p||!keep(x,z))continue;pine(T,x,z,5+rnd()*7*(r>160?1.4:1));n++}}

  const WINOFF=new THREE.MeshLambertMaterial({vertexColors:true,color:'#4f5c6c'}),winM=L.mesh(GLOW);/* bình thường: cửa kính tối màu lam xám, không phát sáng */sc.add(S.mesh(LAM));sc.add(winM);sc.add(LA.mesh(GLOW));sc.add(T.mesh(LAM));const xmasG=new THREE.Group();xmasG.add(XS.mesh(LAM),XL.mesh(GLOW));sc.add(xmasG);

  // ---------- nhãn tên các khu ----------
  const labels=[];
  function signTex(t1,t2){const c=document.createElement('canvas');c.width=512;c.height=180;const g=c.getContext('2d');g.fillStyle='rgba(14,22,36,.72)';g.beginPath();if(g.roundRect)g.roundRect(8,8,496,164,40);else g.rect(8,8,496,164);g.fill();g.strokeStyle='rgba(214,184,120,.7)';g.lineWidth=3;g.stroke();
    g.textAlign='center';g.fillStyle='#f1e2bf';g.font='600 50px Georgia,serif';g.fillText(t1,256,90,470);g.fillStyle='#cfd8e6';g.font='28px system-ui,sans-serif';g.fillText(t2,256,138,470);const tx=new THREE.CanvasTexture(c);tx.colorSpace=THREE.SRGBColorSpace;return tx}
  for(const zn of ZONES){if(zn.id==='don')continue;const p={rungkinh:[...IGLOOS[1],8],lang:[12,24,9.5],hobang:[LAKE.x,LAKE.z,4],rung:[12,-40,6],vuichoi:[-30,64,7],tuanloc:[FARM.x,FARM.z-12,5],dinh:[SKI.x,SKI.z-2,12],chua:[...tw(0,0),12]}[zn.id];if(!p)continue;
    const s=new THREE.Sprite(new THREE.SpriteMaterial({map:signTex(zn.name.toUpperCase(),zn.note.split('.')[0].slice(0,40)),transparent:true,fog:false,depthWrite:false}));s.scale.set(4.6,1.6,1);labels.push(s);s.position.set(p[0],H(p[0],p[1])+p[2],p[1]);sc.add(s)}

  // ---------- tuyết rơi ----------
  const SNN=LOW?900:2200,sp=new Float32Array(SNN*3);for(let i=0;i<SNN;i++){sp[i*3]=(rnd()-.5)*70;sp[i*3+1]=rnd()*30;sp[i*3+2]=(rnd()-.5)*70}
  const snowG=new THREE.BufferGeometry();snowG.setAttribute('position',new THREE.BufferAttribute(sp,3));
  const flake=(()=>{const c=document.createElement('canvas');c.width=c.height=32;const g=c.getContext('2d'),r=g.createRadialGradient(16,16,0,16,16,16);r.addColorStop(0,'rgba(255,255,255,1)');r.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=r;g.fillRect(0,0,32,32);return new THREE.CanvasTexture(c)})();
  const snow=new THREE.Points(snowG,new THREE.PointsMaterial({size:.16,map:flake,transparent:true,depthWrite:false,opacity:.85}));snow.frustumCulled=false;sc.add(snow);
  // hai nút bật tắt trong Xứ Yên: Giáng sinh (đèn và trang trí Noel ở làng, khu vui chơi) · Tuyết rơi. Cả hai tắt là cảnh bình thường
  const fog0=sc.fog.density,FX={xmas:false,snow:false};let fogK=fog0;
  const applyFx=()=>{xmasG.visible=FX.xmas;winM.material=FX.xmas?GLOW:WINOFF;for(const l of houseWarm)l.intensity=FX.xmas?l.userData.i0:0;U.night.value=FX.xmas?1:0;hemi.intensity=FX.xmas?.62:1.45;moon.intensity=FX.xmas?.38:1;sc.fog.color.set(FX.xmas?'#1a2640':'#3e5880');for(const m of xmasOnly)m.visible=FX.xmas;snow.visible=FX.snow;fogK=fog0*(FX.snow?1.35:1);sc.fog.density=fogK;
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
    const scarf=new THREE.Mesh(new THREE.TorusGeometry(.22,.07,6,16),new THREE.MeshLambertMaterial({color:'#8c2f2a'}));scarf.rotation.x=Math.PI/2;scarf.position.y=1.6;me.add(scarf);var meParts={body,coat,hat,scarf,pom};me.scale.setScalar(.85);
    const lap=new THREE.Mesh(new THREE.SphereGeometry(1,12,8),coat.material);lap.scale.set(.5,.16,.42);lap.position.set(0,.16,.12);lap.visible=false;me.add(lap);
    var setSit=on=>{const k=on?-.55:0;body.position.y=1.05+k*.8;body.scale.y=on?.7:1;coat.visible=!on;lap.visible=on;head.position.y=1.85+k;hat.position.y=1.9+k;pom.position.y=2.2+k;scarf.position.y=1.6+k;if(WEAR.cur)wearSit(on,k);else coat.visible=!on}}
  sc.add(me);
  // ---------- Trang phục mùa đông Xứ Yên (28/11, theo bộ sưu tập người dùng gửi): Thiền phục quàng khăn ấm và 4 bộ mùa đông;
  // mỗi bộ chọn 1 trong 6 màu chung của An Yên (Vàng, Xanh, Kem, Tím, Rêu, Hồng), màu tô vào phần chính (áo choàng, váy, áo khoác), viền lông và phụ kiện giữ màu riêng.
  // Mỗi bộ chia phần trên (hạ xuống theo đầu khi ngồi) và phần dưới (ẩn khi ngồi, thay bằng vạt áo phủ đùi) ----------
  const WEAR_COLORS=[['Vàng','#d9b67d'],['Xanh','#90b7a5'],['Kem','#f0e5d4'],['Tím','#b5a1c7'],['Rêu','#687b48'],['Hồng','#e8a1b4']];
  const WEAR_STYLES=[['robe','🧘','Thiền phục','quàng khăn ấm'],['amap','🧣','Ấm Áp Yên','áo choàng viền lông, váy len'],['bangtuyet','❄️','Băng Tuyết Yên','váy dài hoa tuyết, choàng voan'],['dungkhi','🛡','Dũng Khí Yên','áo choàng, áo khoác đai da'],['khampha','🎒','Khám Phá Yên','áo khoác bông, mũ len, ba lô']];
  const WEAR={cur:null,st:{},mats:[]};
  function wearBuild(){const FUR='#f4f1ea',BOOT='#7a5234',mixW=(c,k)=>'#'+new THREE.Color(c).lerp(new THREE.Color('#ffffff'),k).getHexString(),dk=(c,k)=>'#'+new THREE.Color(c).multiplyScalar(k).getHexString();
    const mat=(c,o)=>new THREE.MeshLambertMaterial(Object.assign({color:c},o||{})),lathe=(pts,seg,p0,pl)=>new THREE.LatheGeometry(pts.map(([r,y])=>new THREE.Vector2(r,y)),seg||24,p0||0,pl||Math.PI*2);
    const add=(g,geo,m,x,y,z,sx,sy,sz,rx,ry,rz)=>{const o=new THREE.Mesh(geo,m);o.position.set(x,y,z);o.scale.set(sx,sy,sz);o.rotation.set(rx||0,ry||0,rz||0);g.add(o);return o};
    const SPH=new THREE.SphereGeometry(1,12,8),CYL=new THREE.CylinderGeometry(1,1,1,12),BX=new THREE.BoxGeometry(1,1,1),TOR=(r,t)=>new THREE.TorusGeometry(r,t,8,24);
    // hoa tuyết nhỏ trên vải: ba nét trắng chéo nhau, áp lên mặt cong theo góc a, bán kính r
    const flake=(g,r,y,a,s,m)=>{const q=new THREE.Group();q.position.set(Math.sin(a)*r,y,Math.cos(a)*r);q.rotation.y=a;for(let i=0;i<3;i++){const b=new THREE.Mesh(BX,m);b.scale.set(s,s*.16,.01);b.rotation.z=i*Math.PI/3;q.add(b)}g.add(q)};
    const legs=(g,col,fur)=>{const ml=mat(col),mb=mat(BOOT),mf=mat(FUR);for(const sx of [-.14,.14]){add(g,CYL,ml,sx,.38,0,.11,.5,.11);add(g,CYL,mb,sx,.15,.02,.125,.3,.125);add(g,BX,mb,sx,.04,.08,.2,.08,.3);if(fur)add(g,TOR(.13,.05),mf,sx,.31,.02,1,1,1,Math.PI/2)}};
    const mitt=(g,col,y,r)=>{const m=mat(col);for(const sx of [-1,1])add(g,SPH,m,sx*(r||.36),y||.98,.18,.09,.1,.09)};
    const mk=(id,o)=>{const up=new THREE.Group(),low=new THREE.Group();up.visible=low.visible=false;me.add(up,low);WEAR.st[id]=Object.assign({up,low,main:[]},o);return WEAR.st[id]};
    // Thiền phục: giữ áo, mũ len; khăn quàng len dày hơn, có đuôi khăn tua rua buông trước ngực
    {const s=mk('robe',{base:true,body:c=>c,lap:c=>c});const m=mat('#8c2f2a'),cr=mat('#efe6d6');s.scarf=m;
      add(s.up,TOR(.29,.13),m,0,1.6,0,1,1,1.15,Math.PI/2);for(let i=0;i<16;i++){const a=i/16*Math.PI*2;add(s.up,BX,mat('#7a2824'),Math.sin(a)*.41,1.6,Math.cos(a)*.41,.02,.12,.01,0,a,0)}/* cổ khăn len to, gân đan */
      // hai mảng khăn buông dài: mảng trước ngực xuống gần gối, mảng sau vắt qua vai; sọc kem, tua rua cuối khăn
      const pan=(x,z,h,ry,rx)=>{const q=new THREE.Group();q.position.set(x,1.52,z);q.rotation.set(rx,ry,0);add(q,BX,m,0,-h/2,0,.24,h,.07);for(const f of [.22,.3])add(q,BX,cr,0,-h*(1-f)+.02,.037,.24,.035,.005);for(let i=0;i<6;i++)add(q,BX,cr,-.1+i*.04,-h-.05,0,.016,.1,.016);s.up.add(q)};
      pan(.13,.4,.82,0,-.1);pan(-.1,-.38,.6,Math.PI,-.12)}
    // Ấm Áp Yên: áo choàng ngắn viền lông trắng có hoa tuyết, nơ và hai quả bông; váy len kem; mũ nồi lông trắng; găng; bốt nâu cổ lông
    {const s=mk('amap',{body:()=>'#efe6d6',lap:()=>'#efe6d6'}),mc=mat('#b8322c',{side:THREE.DoubleSide}),fur=mat(FUR),wt=mat('#ffffff');s.main.push([mc,0]);
      add(s.up,new THREE.Mesh(lathe([[.62,.95],[.52,1.2],[.41,1.45],[.33,1.62]],28)).geometry,mc,0,0,0,1,1,1);add(s.up,TOR(.6,.065),fur,0,.95,0,1,1,1,Math.PI/2);add(s.up,TOR(.3,.085),fur,0,1.62,0,1,1,1,Math.PI/2);
      for(const [a,y,r] of [[.6,1.12,.56],[-.7,1.2,.53],[2.2,1.1,.57],[3.1,1.25,.5],[-2.3,1.08,.58],[1.4,1.32,.47],[-1.5,1.3,.48]])flake(s.up,r+.012,y,a,.1,wt);
      const bow=mat('#a8262a');s.bow=bow;add(s.up,SPH,bow,-.08,1.56,.39,.08,.055,.03,0,0,.4);add(s.up,SPH,bow,.08,1.56,.39,.08,.055,.03,0,0,-.4);add(s.up,SPH,bow,0,1.56,.41,.035,.035,.03);for(const sx of [-1,1])add(s.up,BX,bow,sx*.05,1.47,.43,.04,.14,.01,-.3,0,sx*.3);
      for(const sx of [-1,1]){add(s.up,CYL,wt,sx*.07,1.4,.47,.006,.16,.006);add(s.up,SPH,fur,sx*.07,1.3,.51,.06,.06,.06)}
      add(s.up,SPH,fur,0,2.03,0,.33,.15,.33,0,0,.12);add(s.up,SPH,fur,.05,2.13,-.02,.1,.08,.1);mitt(s.up,'#a8262a',.86,.4);
      const kn=mat('#efe6d6');add(s.low,new THREE.Mesh(lathe([[.44,.42],[.4,.7],[.35,.98]],24)).geometry,kn,0,0,0,1,1,1);for(let i=0;i<14;i++){const a=i/14*Math.PI*2;add(s.low,BX,mat('#dcd2bf'),Math.sin(a)*.415,.56,Math.cos(a)*.415,.015,.28,.01,0,a,0)}
      legs(s.low,'#efe6d6',true);for(const sx of [-.14,.14])add(s.low,SPH,mat(BOOT),sx+.06,.3,.12,.04,.03,.02)}
    // Băng Tuyết Yên: váy dài xoè có hoa tuyết, áo choàng voan trong mờ phía sau, cổ lông trắng, trâm hoa tuyết, tóc búi thấp, găng sáng màu
    {const s=mk('bangtuyet',{body:c=>mixW(c,.3),lap:c=>mixW(c,.3)}),mg=mat('#9cc6e8',{side:THREE.DoubleSide}),mv=mat('#cfe6f7',{transparent:true,opacity:.5,side:THREE.DoubleSide,depthWrite:false}),fur=mat(FUR),wt=mat('#ffffff'),ice=mat('#dff2ff');
      s.main.push([mg,.3],[mv,.55]);add(s.up,new THREE.Mesh(lathe([[.76,.04],[.58,.6],[.42,1.2],[.32,1.6]],28,1.15,Math.PI*2-2.3)).geometry,mv,0,0,0,1,1,1);
      add(s.up,TOR(.29,.07),fur,0,1.61,0,1,1,1,Math.PI/2);flake(s.up,.36,1.55,0,.09,ice);
      const hair=mat('#efe0b8');add(s.up,new THREE.SphereGeometry(.27,14,8,0,Math.PI*2,0,Math.PI*.55),hair,0,1.86,-.02,1,1,1,-.25,0,0);add(s.up,SPH,hair,0,1.78,-.25,.12,.12,.11);flake(s.up,.24,2.0,.7,.09,ice);
      mitt(s.up,'#e8f3fb');
      add(s.low,new THREE.Mesh(lathe([[.68,.02],[.56,.3],[.43,.65],[.32,1.0]],32)).geometry,mg,0,0,0,1,1,1);
      for(const [a,y,r] of [[0,.35,.56],[.9,.2,.62],[-.9,.25,.6],[.45,.62,.45],[-.45,.6,.45],[2.0,.3,.58],[-2.0,.4,.55],[3.1,.25,.6],[0,.75,.4]])flake(s.low,r+.01,y,a,a===0&&y<.4?.2:.11,wt)}
    // Dũng Khí Yên: áo choàng dài mở trước có hoa tuyết, cổ lông kem dày, khoá sao vàng; áo khoác xám thắt đai da; quần sẫm; bốt nâu cổ lông; găng nâu; tóc nâu
    {const s=mk('dungkhi',{body:()=>'#4a4f5c',lap:()=>'#3a4256'}),mc=mat('#34406a',{side:THREE.DoubleSide}),fur=mat('#efe6d6'),wt=mat('#ffffff'),gold=mat('#d9b56a');s.main.push([mc,0]);
      add(s.up,new THREE.Mesh(lathe([[.66,.5],[.53,.9],[.42,1.3],[.34,1.6]],28,.6,Math.PI*2-1.2)).geometry,mc,0,0,0,1,1,1);add(s.up,TOR(.3,.1),fur,0,1.6,0,1,1,1,Math.PI/2);
      for(const [a,y,r] of [[1.3,1.0,.5],[1.9,.7,.6],[2.6,1.1,.49],[3.14,.75,.59],[-2.6,1.05,.5],[-1.9,.72,.6],[-1.3,1.15,.47]])flake(s.up,r+.012,y,a,.1,wt);
      {const q=new THREE.Group();q.position.set(0,1.5,.36);for(let i=0;i<4;i++){const b=new THREE.Mesh(new THREE.OctahedronGeometry(.05),gold);b.scale.set(.35,1,.3);b.rotation.z=i*Math.PI/4;q.add(b)}s.up.add(q)}
      add(s.up,new THREE.SphereGeometry(.265,14,8,0,Math.PI*2,0,Math.PI*.5),mat('#6b4a32'),0,1.88,-.02,1,1,1,-.2,0,0);mitt(s.up,'#4f3a2a');
      add(s.low,new THREE.Mesh(lathe([[.4,.6],[.36,.92]],20)).geometry,mat('#4a4f5c'),0,0,0,1,1,1);add(s.low,TOR(.355,.035),mat('#6b4a2c'),0,.9,0,1,1,1,Math.PI/2);add(s.low,BX,gold,0,.9,.37,.09,.07,.02);
      legs(s.low,'#3a4256',true)}
    // Khám Phá Yên: áo khoác bông có cúc sừng và túi, mũ len có quả bông và hoa tuyết, khăn len xanh, ba lô nâu có cuộn chăn, quần túi hộp, bốt nâu
    {const s=mk('khampha',{body:c=>c,lap:()=>'#3e4a5e'}),mc=mat('#f0e5d4',{side:THREE.DoubleSide}),mc2=mat('#e0d3bd'),br=mat('#7a5234'),navy=mat('#4a5a86'),blue=mat('#5f73a8'),wt=mat('#ffffff');s.main.push([mc,0],[mc2,-.1]);
      add(s.low,new THREE.Mesh(lathe([[.44,.55],[.39,.9],[.36,1.2]],24)).geometry,mc,0,0,0,1,1,1);for(const sx of [-1,1])add(s.low,BX,mc2,sx*.2,.72,.39,.16,.15,.03);
      for(const y of [1.0,1.18,1.36])add(s.up,BX,br,0,y,.355,.1,.03,.03);add(s.up,TOR(.3,.06),mc2,0,1.58,0,1,1,1,Math.PI/2);
      add(s.up,TOR(.24,.09),blue,0,1.63,0,1,1,1,Math.PI/2);add(s.up,BX,blue,-.13,1.4,.27,.14,.38,.06,.1,0,-.06);
      add(s.up,new THREE.SphereGeometry(.275,14,8,0,Math.PI*2,0,Math.PI/2),navy,0,1.9,0,1,1.05,1);add(s.up,TOR(.265,.05),blue,0,1.93,0,1,1,1,Math.PI/2);add(s.up,SPH,wt,0,2.22,0,.09,.09,.09);flake(s.up,.27,2.04,0,.1,wt);
      add(s.up,BX,br,0,1.15,-.42,.42,.5,.2);add(s.up,BX,mat('#6b4628'),0,1.05,-.53,.3,.2,.04);add(s.up,CYL,mat('#9a7a56'),0,1.46,-.42,.1,.5,.1,0,0,Math.PI/2);for(const sx of [-1,1])add(s.up,BX,mat('#5e3e28'),sx*.16,1.2,-.3,.04,.5,.03);
      mitt(s.up,'#4a5a86');legs(s.low,'#3e4a5e',false);for(const sx of [-1,1])add(s.low,BX,mat('#334056'),sx*.25,.4,0,.04,.14,.12)}}
  function wearApply(style,color){if(!WEAR.st.robe)wearBuild();const s=WEAR.st[style]||WEAR.st.robe,P2=meParts;WEAR.cur=s;for(const k in WEAR.st){const q=WEAR.st[k];q.up.visible=q===s;q.low.visible=q===s&&!WEAR.sit}
    P2.body.material.color.set(s.body(color));P2.coat.material.color.set(s.lap(color));const base=!!s.base;P2.coat.visible=base&&!WEAR.sit;P2.hat.visible=base;P2.pom.visible=base;P2.scarf.visible=false;
    for(const [m,k] of s.main){const c=new THREE.Color(color);if(k>0)c.lerp(new THREE.Color('#ffffff'),k);else if(k<0)c.multiplyScalar(1+k);m.color.copy(c)}}
  function wearSit(on,k){WEAR.sit=on;const s=WEAR.cur;if(!s)return;s.up.position.y=k;s.low.visible=!on;if(!s.base)meParts.coat.visible=false}

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
  function tap(cx,cy){if(P.mode==='build'){buildTap(cx,cy);return}if(P.mode==='santa'){if(SR.wait&&!SR.gift){const c=SR.stops[SR.leg-1],r=cv.getBoundingClientRect(),p=new THREE.Vector3(c.x,c.y,c.z).project(cam),sx=r.left+(p.x+1)/2*r.width,sy=r.top+(1-p.y)/2*r.height;if(Math.hypot(sx-cx,sy-cy)<110)santaDrop((Math.random()*WISHES.length)|0)}return}if(P.mode!=='walk'&&P.mode!=='sled'&&P.mode!=='skate'&&P.mode!=='kota')return;const r=cv.getBoundingClientRect();ray.setFromCamera(new THREE.Vector2((cx-r.left)/r.width*2-1,-(cy-r.top)/r.height*2+1),cam);
    if(P.mode==='sled'){const h=ray.intersectObjects([groundMesh],false)[0];if(h&&lakeE(h.point.x,h.point.z)>=1&&Math.hypot(h.point.x-LAKE.x,h.point.z-LAKE.z)<90)sledLand(h.point.x,h.point.z);else caption('Bấm vào bờ hồ để ghé bờ nhé.',2500);return}
    if(P.mode==='kota'){kotaTap();return}
    if(P.mode==='skate'){const h=ray.intersectObjects([groundMesh],false)[0];if(h&&Math.hypot(h.point.x-RINK.x,h.point.z-RINK.z)<RINK.rx-.9){P.dest={x:h.point.x,z:h.point.z};P.camAim=null/* 28/11: không xoay camera ra sau lưng khi bắt đầu đi */}else caption('Chạm vào mặt băng để lướt. Muốn ra thì bấm Rời sân băng.',3000);return}
    P.autoAct=null;{const o=ray.intersectObjects([...PROX,santaG,huskyG,...sleds.map(q=>q.g),...DEERHIT],true)[0],gh=ray.intersectObjects([ice,groundMesh],false)[0];if(o&&(!gh||o.distance<gh.distance+.5)){let q=o.object;if(q.userData.deer!=null){const di=q.userData.deer,d=DEERS[di];if(!FEED.hold){caption(FEED.fly?'🦌 Chú tuần lộc đang ăn. Chạm thùng rêu để lấy thêm nhé.':'🦌 Chạm thùng rêu gỗ ở góc rào để lấy một nắm rêu trước nhé.',3500);return}if(Math.hypot(d.x-P.x,d.z-P.z)<8){feedGive(di);return}FEED.tgt=di;P.autoAct='deerfeed';P.dest={x:d.x,z:d.z};P.camAim=null;return}/* chạm tuần lộc: tới gần (ngoài rào) rồi chìa rêu */
    while(q&&!q.userData.st&&q!==santaG&&q!==huskyG&&q.userData.sl==null)q=q.parent;if(q&&q.userData.sl!=null){const so=sleds[q.userData.sl];if(so.rider){caption('🛷 Xe này đang có người lái, bấm chiếc xe trống nhé.',3000);return}if(so.st!=='park'){caption('🛷 Xe đang chạy về bến, đợi xe đỗ rồi bấm nhé.',3000);return}sledPick=so;const g=so.g,sx=g.position.x+Math.cos(g.rotation.y)*(so.len*.55+.6),sz=g.position.z-Math.sin(g.rotation.y)*(so.len*.55+.6);P.autoAct='sledpick';if(Math.hypot(sx-P.x,sz-P.z)<1){P.autoAct=null;sledBoard(so);return}P.dest={x:sx,z:sz};P.camAim=null;return}/* bấm vào xe trượt trống: tới cạnh xe rồi lên xe luôn */const id=q===santaG?'gift':q===huskyG?'husky':q&&q.userData.st;if(id==='isle')isleSet(q.userData.seat);if(id==='aurora')igSet(q.userData.ig);if(id==='bridge')bridgeSet();const st=id&&STATIONS.find(s=>s.id===id);if(st&&!(id==='husky'&&Math.hypot(huskyG.position.x-st.x,huskyG.position.z-st.z)>8)&&!(id==='gift'&&SR.on)){P.autoAct=id;if(Math.hypot(st.x-P.x,st.z-P.z)<.6){near=st;P.autoAct=null;act();return}P.dest={x:st.x,z:st.z};P.camAim=null/* 28/11: không xoay camera ra sau lưng khi bắt đầu đi */;return}}}
    const hit=ray.intersectObjects([ice,groundMesh],false)[0];if(!hit)return;let x=hit.point.x,z=hit.point.z;
    const st=STATIONS.find(s=>!s.tapOnly&&Math.hypot(s.x-x,s.z-z)<4.5);if(st){x=st.x;z=st.z;P.autoAct=st.id}
    if(Math.hypot(x,z)>220){caption('Phía xa là núi tuyết, mình dạo quanh làng thôi nhé');return}P.dest={x,z};if(Math.hypot(x-P.x,z-P.z)>.5)P.camAim=null/* 28/11: không xoay camera ra sau lưng khi bắt đầu đi */}
  // Va chạm khi đi: nhà, công trình (colliders), thân cây (lưới TG 8 m), xe trượt và đàn husky đang đứng hay chạy. Không đi xuyên, không đè lên nhau.
  const BM=.38,hitC=(x,z)=>{for(const c of colliders){if(c.length>3){const dx=x-c[0],dz=z-c[1];if(Math.hypot(dx,dz)>c[2]+BM)continue;const cs=c[3],sn=c[4],hw=c[5],hd=c[6],lx=cs*dx-sn*dz,lz=sn*dx+cs*dz;let qx=Math.max(-hw,Math.min(hw,lx)),qz=Math.max(-hd,Math.min(hd,lz)),ex=lx-qx,ez=lz-qz,e=Math.hypot(ex,ez);if(e>=BM)continue;/* hộp: trả về vòng tròn lớn tiếp xúc mặt tường để trượt dọc tường */if(e<1e-6){if(hw-Math.abs(lx)<hd-Math.abs(lz)){ex=Math.sign(lx)||1;ez=0;qx=hw*ex}else{ex=0;ez=Math.sign(lz)||1;qz=hd*ez}}else{ex/=e;ez/=e}const wx=cs*ex+sn*ez,wz=-sn*ex+cs*ez,px=c[0]+cs*qx+sn*qz,pz=c[1]-sn*qx+cs*qz;return [px-wx*20,pz-wz*20,20+BM]}if(Math.hypot(x-c[0],z-c[1])<c[2])return c}const gx=(x/8)|0,gz=(z/8)|0;for(let i=-1;i<=1;i++)for(let j=-1;j<=1;j++){const a=TG[(gx+i)+','+(gz+j)];if(a)for(const c of a)if(Math.hypot(x-c[0],z-c[1])<c[2])return c}
    for(const o of sleds)if(o!==mySled){const c=[o.g.position.x,o.g.position.z,o.len*.55];if(Math.hypot(x-c[0],z-c[1])<c[2])return c}
    if(P.mode!=='husky'){const c=[huskyG.position.x,huskyG.position.z,2.6];if(Math.hypot(x-c[0],z-c[1])<c[2])return c}
    if(P.mode!=='santa')for(const k of [0,4.6]){const c=[santaG.position.x+Math.sin(santaG.rotation.y)*k,santaG.position.z+Math.cos(santaG.rotation.y)*k,k?1.6:2.1];if(Math.hypot(x-c[0],z-c[1])<c[2])return c}return null};
  const blocked=(x,z)=>!!hitC(x,z);

  let first=true;
  // ---------- hoạt động ----------
  let near=null;
  // ---------- đợt 3: đắp người tuyết, treo điều ước lên cây thông, trượt băng ----------
  const lam=c=>new THREE.MeshLambertMaterial({color:c}),gSph=new THREE.SphereGeometry(1,18,12),gCone=new THREE.ConeGeometry(1,1,10),gCyl=new THREE.CylinderGeometry(1,1,1,14);
  // Người tuyết tự đắp: tối đa 4 chỗ phía tây bãi tuyết, đắp chỗ thứ 5 thì thay người tuyết cũ nhất
  const BUILD=[[-6.2,.4],[-1.2,6.6],[-5.4,-4.6],[-2.6,10]].map(([x,z])=>({x:SNOWMAN.x+x,z:SNOWMAN.z+z,g:null,c:null}));let buildK=0,myMan=null;
  const BOBS=[[SNOWMAN.x,SNOWMAN.z,3.2]];for(let i=0;i<7;i++){const q=Math.PI*(-.6+i/6*1.2),r=4.2+(i%3)*.6;BOBS.push([SNOWMAN.x+Math.cos(q)*r,SNOWMAN.z+Math.sin(q)*r,1])}/* người tuyết lớn và mấy quả cầu lăn dở: tránh để chúng che camera lúc đắp */
  function snowmanBuild(){const sp=BUILD[buildK%BUILD.length];buildK++;if(sp.g){sc.remove(sp.g);const i=colliders.indexOf(sp.c);if(i>=0)colliders.splice(i,1)}
    const g=new THREE.Group(),y=H(sp.x,sp.z),sn=lam('#f4f7fb'),dark=lam('#2b2622'),of=outfitNow();g.position.set(sp.x,y,sp.z);
    const ball=(r,h)=>{const m=new THREE.Mesh(gSph,sn);m.userData={r,h};m.scale.setScalar(r);m.position.y=h;m.visible=false;g.add(m);return m};
    const grp=(cy)=>{const q=new THREE.Group();q.userData.cy=cy;q.visible=false;g.add(q);return q};
    const parts={b0:ball(.85,.75),b1:ball(.6,1.9),b2:ball(.42,2.7),coal:grp(2.4),carrot:grp(2.7),scarf:grp(2.3),hat:grp(3.1),arms:grp(2.05)};
    for(const sx of [-.15,.15]){const e=new THREE.Mesh(gSph,dark);e.scale.setScalar(.05);e.position.set(sx,2.82,.37);parts.coal.add(e)}
    for(const h of [1.75,1.95,2.15]){const e=new THREE.Mesh(gSph,dark);e.scale.setScalar(.055);e.position.set(0,h,.58+(h-1.95)*-.08);parts.coal.add(e)}
    {const n=new THREE.Mesh(gCone,lam('#e07a3a'));n.scale.set(.07,.36,.07);n.rotation.x=Math.PI/2;n.position.set(0,2.7,.55);parts.carrot.add(n)}
    {const sc2=new THREE.Mesh(gCyl,lam(of.scarf));sc2.scale.set(.47,.14,.47);sc2.position.y=2.33;parts.scarf.add(sc2);const tail=new THREE.Mesh(new THREE.BoxGeometry(.16,.55,.05),sc2.material);tail.position.set(.22,2.05,.4);tail.rotation.z=.15;parts.scarf.add(tail)}
    {const hm=lam(of.hat),hb=new THREE.Mesh(gCyl,hm);hb.scale.set(.34,.32,.34);hb.position.y=3.08;parts.hat.add(hb);const pom=new THREE.Mesh(gSph,lam('#f4f7fb'));pom.scale.setScalar(.12);pom.position.y=3.3;parts.hat.add(pom)}
    for(const sx of [-1,1]){const a=new THREE.Mesh(gCyl,lam('#6e4632'));a.scale.set(.035,.9,.035);a.position.set(sx*.85,2.05,0);a.rotation.z=-sx*1.05;parts.arms.add(a)}
    sc.add(g);sp.g=g;sp.c=[sp.x,sp.z,1];colliders.push(sp.c);const a=Math.atan2(sp.x-SNOWMAN.x,sp.z-SNOWMAN.z);
    const vx0=Math.sin(a),vz0=Math.cos(a),cl=Math.hypot(-vx0*.55+vz0*.85,-vz0*.55-vx0*.85),dx0=(-vx0*.55+vz0*.85)/cl,dz0=(-vz0*.55-vx0*.85)/cl;
    // chọn hướng camera ít cây che nhất: thử xoay dần quanh hướng gốc, đếm thân cây và vật cản nằm giữa người tuyết và camera
    const occ=(ux,uz)=>{const ax=sp.x+ux*1.2,az=sp.z+uz*1.2,bx=sp.x+ux*13,bz=sp.z+uz*13,wx=uz*1.4,wz=-ux*1.4;let n=0;for(let i=-2;i<=2;i++)for(let j=-2;j<=2;j++)for(const t of TG[(((sp.x/8)|0)+i)+','+(((sp.z/8)|0)+j)]||[])if(Math.min(segD(t[0],t[1],ax,az,bx,bz),segD(t[0],t[1],ax-wx,az-wz,bx-wx,bz-wz))<3)n+=2;/* cả người tuyết lẫn chỗ khách đứng bên trái phải thoáng */for(const c of colliders)if(c!==sp.c&&segD(c[0],c[1],ax,az,bx,bz)<c[2]+.5)n++;for(const c of BOBS)if(segD(c[0],c[1],ax,az,bx,bz)<c[2])n+=3;if(H(bx,bz)>y+2.5)n+=3;return n};
    let dx=dx0,dz=dz0,bn=1e9;for(const o of [0,.3,-.3,.6,-.6,.9,-.9,1.2,-1.2]){const ux=dx0*Math.cos(o)+dz0*Math.sin(o),uz=dz0*Math.cos(o)-dx0*Math.sin(o),n=occ(ux,uz)+Math.abs(o)*.5;if(n<bn){bn=n;dx=ux;dz=uz}}
    const vx=dz,vz=-dx;g.rotation.y=Math.atan2(dx,dz);/* mặt người tuyết (mắt than, mũi cà rốt) quay thẳng về phía camera và khách đứng đắp. d: từ chỗ đắp hướng về phía camera (chếch vào giữa bãi tuyết trống), v: ngang khung hình */
    // Đồ để đắp bày trên tuyết giữa mình và chỗ đắp: hàng sau 3 quả cầu tuyết lớn, vừa, nhỏ; hàng trước than, cà rốt, khăn, mũ, cành cây. Bấm món nào thì món đó bay lên đặt vào người tuyết.
    const pg=new THREE.Group();sc.add(pg);const hitM=new THREE.MeshBasicMaterial({visible:false}),pcs={};
    const put=(k,pb,pa,hr,build)=>{const x=sp.x+dx*pa+vx*pb,z=sp.z+dz*pa+vz*pb,q=new THREE.Group();q.position.set(x,H(x,z),z);q.rotation.y=Math.atan2(dx,dz);build(q);const h=new THREE.Mesh(gSph,hitM);h.scale.setScalar(hr);h.position.y=hr*.6;q.add(h);q.traverse(o=>o.userData.pc=k);pg.add(q);pcs[k]=q};
    const M2=(q,geo,mat,x,y,z,sx,sy,sz,rx,ry,rz)=>{const o=new THREE.Mesh(geo,mat);o.position.set(x,y,z);o.scale.set(sx,sy,sz);o.rotation.set(rx||0,ry||0,rz||0);q.add(o);return o};
    put('b0',-1.45,2.0,.95,q=>M2(q,gSph,sn,0,.72,0,.85,.85,.85));put('b1',.15,2.0,.75,q=>M2(q,gSph,sn,0,.52,0,.6,.6,.6));put('b2',1.35,2.0,.6,q=>M2(q,gSph,sn,0,.36,0,.42,.42,.42));
    put('coal',-1.4,3.4,.45,q=>{for(let i=0;i<6;i++)M2(q,gSph,dark,Math.cos(i*2.4)*.13*(i?1:0),.05+(i?0:.07),Math.sin(i*2.4)*.13,.06,.06,.06)});
    put('carrot',-.7,3.4,.45,q=>M2(q,gCone,lam('#e07a3a'),0,.07,0,.07,.36,.07,0,0,Math.PI/2));
    put('scarf',0,3.4,.45,q=>{const mm=lam(of.scarf);M2(q,new THREE.BoxGeometry(1,1,1),mm,0,.05,0,.5,.1,.32);M2(q,new THREE.BoxGeometry(1,1,1),mm,.12,.12,.05,.4,.08,.16,0,.4,0)});
    put('hat',.7,3.4,.45,q=>{M2(q,gCyl,lam(of.hat),0,.16,0,.3,.3,.3);M2(q,gSph,lam('#f4f7fb'),0,.36,0,.11,.11,.11)});
    put('arms',1.4,3.4,.5,q=>{const mm=lam('#6e4632');M2(q,gCyl,mm,0,.05,0,.035,.9,.035,0,.3,Math.PI/2);M2(q,gCyl,mm,0,.08,0,.035,.85,.035,0,-.5,Math.PI/2)});
    myMan={sp,g,parts,pg,pcs,t:0,done:{},n:0,fly:[],me:[sp.x+dx*.6-vx*1.35,sp.z+dz*.6-vz*1.35],yaw:Math.atan2(dx,dz),dx,dz};return myMan}
  const BNEED={b1:['b0','⛄ Đặt quả cầu lớn làm thân trước đã nhé.'],b2:['b1','⛄ Cần quả cầu vừa đặt lên thân trước, rồi mới tới cái đầu.'],coal:['b2','⛄ Đắp xong cái đầu rồi mới gắn mắt than nhé.'],carrot:['b2','⛄ Cần có cái đầu để gắn mũi cà rốt.'],hat:['b2','⛄ Đội mũ khi đã có cái đầu nhé.'],scarf:['b1','⛄ Quàng khăn khi đã có thân trên nhé.'],arms:['b1','⛄ Cắm cành tay khi đã có thân trên nhé.']};
  const BSAY={b0:'⛄ Quả cầu lớn làm thân. Nén nhẹ tay cho chắc.',b1:'⛄ Quả cầu vừa đặt lên trên.',b2:'⛄ Cái đầu tròn nhỏ.',coal:'⛄ Mắt và hàng cúc bằng than.',carrot:'⛄ Mũi cà rốt.',scarf:'⛄ Khăn len ấm, giống khăn của bạn.',hat:'⛄ Mũ len giống của bạn.',arms:'⛄ Hai cành cây làm tay.'};
  function buildTap(cx,cy){const m=myMan;if(!m)return;const r=cv.getBoundingClientRect();ray.setFromCamera(new THREE.Vector2((cx-r.left)/r.width*2-1,-(cy-r.top)/r.height*2+1),cam);
    const h=ray.intersectObjects(m.pg.children,true)[0];if(!h){caption('⛄ Chạm vào quả cầu tuyết hay món đồ bày trên tuyết để đặt lên người tuyết.',3000);return}
    buildPick(h.object.userData.pc)}
  function buildPick(k){const m=myMan;if(!m||!k||m.done[k]||m.fin!=null)return;const nd=BNEED[k];if(nd&&!m.done[nd[0]]){caption(nd[1],3000);return}
    const q=m.pcs[k],o=m.parts[k],from=m.g.worldToLocal(q.position.clone());q.visible=false;m.done[k]=1;m.n++;o.visible=true;
    const ball=k[0]==='b'&&k.length===2;m.fly.push({o,t:0,from,ball});if(m.n===8){m.fin=0;caption('⛄ Đủ cả tám món rồi!',2600)}else caption(BSAY[k]+' Còn '+(8-m.n)+' món.',4000)}
  // Đắp đủ: người tuyết khẽ nhún chào, hiện bảng "Đã đắp xong" để khách hoàn thành và đi tiếp, hoặc ở lại ngắm thêm
  function buildDoneOpen(){wishEl.innerHTML='<b>⛄ Đã đắp xong người tuyết!</b><p class="bp">Người tuyết của bạn sẽ đứng canh bãi tuyết. Mang Yên về đời thực: hôm nay, làm một việc nhỏ bằng đôi tay và thong thả tận hưởng nó.</p><div class="rw"><button type="button" data-x>Ngắm thêm</button><button type="button" class="go" data-bdone>Hoàn thành, đi tiếp</button></div>';wishEl.hidden=false;stopBtn.textContent='✓ Hoàn thành, đi tiếp';
    if(window.__xuyenJournal)window.__xuyenJournal('Mình đã tự tay đắp một người tuyết, mắt than mũi cà rốt, quàng khăn đội mũ giống mình.','⛄ Đắp người tuyết')}
  function buildDone(){stand(true);caption('⛄ Người tuyết của bạn đứng canh bãi tuyết rồi. Nhìn thành quả nhỏ, thấy lòng vui.',6000)}
  const outfitNow=()=>{try{return Object.assign({hat:'#efe6d6',scarf:'#8c2f2a'},JSON.parse(localStorage.getItem('xuyen-outfit')||'{}'))}catch(e){return {hat:'#efe6d6',scarf:'#8c2f2a'}}};
  function buildTick(dt){const m=myMan;if(!m)return;m.t+=dt;if(m.t<.05)caption('⛄ Chạm vào quả cầu tuyết lớn, vừa, nhỏ rồi tới các món đồ bày trên tuyết để đắp người tuyết theo ý mình.',9000);
    for(const f of m.fly){f.t=Math.min(1,f.t+dt/.7);const e=1-Math.pow(1-f.t,3),arc=Math.sin(Math.PI*f.t)*.9;
      if(f.ball){const r=f.o.userData.r;f.o.position.set(f.from.x*(1-e),(f.from.y+r)*(1-e)+f.o.userData.h*e+arc,f.from.z*(1-e))}
      else{const cy=f.o.userData.cy;f.o.position.set(f.from.x*(1-e),(f.from.y-cy)*(1-e)+arc*.6,f.from.z*(1-e))}}
    m.fly=m.fly.filter(f=>f.t<1);
    if(m.fin!=null){const f0=m.fin;m.fin+=dt;if(m.fin>.8&&m.fin<2.2){const q=(m.fin-.8)/1.4;m.g.scale.set(1,1+Math.sin(q*Math.PI*3)*.06*(1-q),1)}else m.g.scale.set(1,1,1);if(f0<=1.2&&m.fin>1.2)buildDoneOpen()}}
  // Điều ước trên cây thông: điều ước cho chính mình, mỗi điều ước là một quả châu sáng treo trên tán, lưu trên máy, ghi vào Nhật ký
  const TW_KEY='xuyen-tree-wishes',TWC={'Bình an':'#cfe4ff','Khỏe mạnh':'#9fe0b8','Nhẹ lòng':'#ffe07a','Ngủ ngon':'#c7b8ff','Thương mình hơn':'#ffb3c1'},TWC_OLD={'Ấm áp':'#ffb36b','Niềm vui':'#ffe07a','Vững vàng':'#9fe0b8'},orn=[];
  const treeRad=t=>7.6*Math.pow(1-t,.92)+.25;
  function hangWish(w,i){const t=.1+((i*37)%55)/100,a=Math.PI/2+(((i*53)%100)/100-.5)*2.4,r=treeRad(t)*.84+.1,y=H(TREE.x,TREE.z)+1.6+t*26-1.1,x=TREE.x+Math.cos(a)*r,z=TREE.z+Math.sin(a)*r;
    const b=new THREE.Mesh(gSph,new THREE.MeshBasicMaterial({color:TWC[w.w]||TWC_OLD[w.w]||'#ffe07a'}));b.scale.setScalar(.38);b.position.set(x,y,z);const cap=new THREE.Mesh(gCyl,lam('#c8a96a'));cap.scale.set(.09,.1,.09);cap.position.set(x,y+.32,z);sc.add(b,cap);orn.push(b,cap);return b}
  const readTW=()=>{try{const v=JSON.parse(localStorage.getItem(TW_KEY)||'[]');return Array.isArray(v)?v:[]}catch(e){return []}};readTW().slice(-30).forEach((w,i)=>hangWish(w,i));
  const wishEl=document.createElement('div');wishEl.className='sn-wish';wishEl.hidden=true;box.appendChild(wishEl);wishEl.addEventListener('pointerdown',e=>e.stopPropagation());wishEl.addEventListener('keydown',e=>e.stopPropagation());
  let wishPick='Bình an',treeView=false,treeHold=0;const TREE_SPOT=[TREE.x-1.5,TREE.z+11];
  function wishOpen(){wishPick='Bình an';wishEl.classList.remove('tv');wishEl.innerHTML='<b>🎄 Hôm nay, bạn ước gì cho mình?</b><div class="wr">'+Object.keys(TWC).map(k=>'<button type="button" data-w="'+k+'"'+(k===wishPick?' class="on"':'')+'>'+k+'</button>').join('')+'</div><input maxlength="80" placeholder="Viết điều ước bằng lời của bạn (không bắt buộc)"><div class="rw"><button type="button" data-x>Thôi</button><button type="button" class="go" data-go>Treo điều ước</button></div>';wishEl.hidden=false}
  wishEl.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.lt){letPick=b.dataset.lt;wishEl.querySelectorAll('[data-lt]').forEach(o=>o.classList.toggle('on',o===b));return}if(b.dataset.burn!=null){const txt=wishEl.querySelector('input').value.trim().slice(0,80);wishEl.hidden=true;letBurn(txt);return}if(b.dataset.w){wishPick=b.dataset.w;wishEl.querySelectorAll('[data-w]').forEach(o=>o.classList.toggle('on',o===b));return}
    if(b.dataset.x!=null){wishEl.hidden=true;return}if(b.dataset.bdone!=null){buildDone();return}
    if(b.dataset.go!=null){const txt=wishEl.querySelector('input').value.trim().slice(0,80),list=readTW(),w={w:wishPick,txt,at:Date.now()};list.push(w);try{localStorage.setItem(TW_KEY,JSON.stringify(list.slice(-60)))}catch(err){}
      const o=hangWish(w,list.length-1);wishEl.hidden=true;treeHold=performance.now()+4000;o.scale.setScalar(.01);const t0=performance.now(),pop=()=>{const k=Math.min(1,(performance.now()-t0)/700);o.scale.setScalar(.38*(1+Math.sin(k*Math.PI)*.5)*k||.01);if(k<1)requestAnimationFrame(pop)};pop();
      if(window.__xuyenJournal)window.__xuyenJournal(wishPick+(txt?': '+txt:''),'🎄 Điều ước trên cây thông');caption('🎄 Điều ước "'+wishPick+'" đã sáng trên cây và được ghi vào Nhật ký. Hôm nay, làm một việc nhỏ cho điều ước ấy nhé.',7000)}});
  // Trượt băng: chạm mặt băng để lướt tới, có quán tính, không ra khỏi sân
  const SK={vx:0,vz:0};
  function skateTick(dt,t){let ax=0,az=0;if(keys.size){const f=(keys.has('f')?1:0)-(keys.has('b')?1:0),s2=(keys.has('r')?1:0)-(keys.has('l')?1:0),sy=Math.sin(P.yaw),cy=Math.cos(P.yaw);ax=-sy*f+cy*s2;az=-cy*f-sy*s2}
    else if(P.dest){const dx=P.dest.x-P.x,dz=P.dest.z-P.z,d=Math.hypot(dx,dz);if(d<.6)P.dest=null;else{ax=dx/d;az=dz/d}}
    const l=Math.hypot(ax,az);if(l){SK.vx+=ax/l*4.2*dt;SK.vz+=az/l*4.2*dt}const v=Math.hypot(SK.vx,SK.vz),vm=3.8;if(v>vm){SK.vx*=vm/v;SK.vz*=vm/v}const fr=Math.exp(-dt*(l?.6:.9));SK.vx*=fr;SK.vz*=fr;
    let nx=P.x+SK.vx*dt,nz=P.z+SK.vz*dt;const dr=Math.hypot(nx-RINK.x,nz-RINK.z),R=RINK.rx-.9;if(dr>R){const ux=(nx-RINK.x)/dr,uz=(nz-RINK.z)/dr,vn=SK.vx*ux+SK.vz*uz;nx=RINK.x+ux*R;nz=RINK.z+uz*R;if(vn>0){SK.vx-=ux*vn*1.6;SK.vz-=uz*vn*1.6}}
    P.x=nx;P.z=nz;const sp=Math.hypot(SK.vx,SK.vz);if(sp>.2)P.a=Math.atan2(SK.vx,SK.vz);me.position.set(P.x,groundY(P.x,P.z)+.06,P.z);let da=P.a-me.rotation.y;da=Math.atan2(Math.sin(da),Math.cos(da));me.rotation.y+=da*Math.min(1,dt*4);me.rotation.z=Math.sin(t*2.2)*.09*Math.min(1,sp/2);me.rotation.x=.12*Math.min(1,sp/2);
    if(P.camAim!=null){follow(P.camAim,dt,3);let d=P.camAim+Math.PI-P.yaw;d=Math.atan2(Math.sin(d),Math.cos(d));if(Math.abs(d)<.03||pts.size)P.camAim=null}tgt.set(P.x,me.position.y+1.5,P.z)}
  // Bấm vào đồ vật để bắt đầu: vùng chạm vô hình quanh cây thông, bãi tuyết, vòng quay, vòng ngựa gỗ, bếp lửa, tượng Phật
  // ---------- đợt 4: buông bỏ bên lửa, ly ấm, nằm ngắm sao, dâng hương, cho tuần lộc ăn ----------
  const FXS=[],steamM=new THREE.MeshBasicMaterial({color:'#ffffff',transparent:true,opacity:.35,depthWrite:false}),sparkM=new THREE.MeshBasicMaterial({color:'#ffc06a',fog:false});
  const puff=(x,y,z,o)=>{const m=new THREE.Mesh(gSph,o.mat||steamM.clone());m.position.set(x,y,z);m.scale.setScalar(o.r||.08);sc.add(m);FXS.push({m,t:0,life:o.life||2.4,vx:o.vx||0,vy:o.vy||.35,vz:o.vz||0,g:o.g||1.6,fade:o.fade!==false})};
  const fxTick=dt=>{for(let i=FXS.length-1;i>=0;i--){const f=FXS[i];f.t+=dt;const k=f.t/f.life;f.m.position.x+=f.vx*dt;f.m.position.y+=f.vy*dt;f.m.position.z+=f.vz*dt;f.m.scale.multiplyScalar(1+dt*(f.g-1));if(f.fade&&f.m.material.transparent)f.m.material.opacity=Math.max(0,.35*(1-k));if(k>=1){sc.remove(f.m);if(f.m.material!==sparkM)f.m.material.dispose();FXS.splice(i,1)}}};
  // ly ấm cầm tay và hương trầm: chỉ hiện khi đang làm hoạt động
  const cup=new THREE.Group();{const c=new THREE.Mesh(gCyl,lam('#efe6d6'));c.scale.set(.09,.16,.09);cup.add(c);const d=new THREE.Mesh(gCyl,lam('#6b3f26'));d.scale.set(.075,.01,.075);d.position.y=.075;cup.add(d);const h=new THREE.Mesh(new THREE.TorusGeometry(.05,.015,6,10),c.material);h.position.set(.1,0,0);cup.add(h)}cup.visible=false;sc.add(cup);
  const insence=new THREE.Group();{const c=tw(0,3.3),y=H(TP.x,TP.z)+.9;insence.position.set(c[0],y,c[1]);const b=new THREE.Mesh(gCyl,lam('#8a7a62'));b.scale.set(.32,.32,.32);b.position.y=.16;insence.add(b);const sd=new THREE.Mesh(gCyl,lam('#d8cfbf'));sd.scale.set(.28,.02,.28);sd.position.y=.33;insence.add(sd);
    for(const dx of [-.08,0,.08]){const st=new THREE.Mesh(gCyl,lam('#9a4a32'));st.scale.set(.012,.5,.012);st.position.set(dx,.58,0);insence.add(st);const tip=new THREE.Mesh(gSph,new THREE.MeshBasicMaterial({color:'#ff7a3a',fog:false}));tip.scale.setScalar(.022);tip.position.set(dx,.84,0);tip.visible=false;tip.userData.tip=1;insence.add(tip)}}sc.add(insence);block(insence.position.x,insence.position.z,.5);
  const setIncense=on=>insence.children.forEach(o=>{if(o.userData.tip)o.visible=on});
  let fxClock=0;const FIRE=[25,77];
  // Buông bỏ bên đống lửa: viết điều muốn buông, mảnh giấy bay vào lửa, lửa bùng nhẹ, tàn lửa bay lên
  const LET=['Lo âu','Giận dữ','Mệt mỏi','Tiếc nuối','Sợ hãi'];let letPick=LET[0];
  function letOpen(){letPick=LET[0];wishEl.innerHTML='<b>🔥 Điều gì bạn muốn buông xuống tối nay?</b><div class="wr">'+LET.map(k=>'<button type="button" data-lt="'+k+'"'+(k===letPick?' class="on"':'')+'>'+k+'</button>').join('')+'</div><input maxlength="80" placeholder="Viết ra điều đang đè nặng (chỉ bạn thấy)"><div class="rw"><button type="button" data-x>Thôi</button><button type="button" class="go" data-burn>Thả vào lửa</button></div>';wishEl.hidden=false}
  function letBurn(txt){const sx=P.x,sz=P.z,y0=H(sx,sz)+1.1,paper=new THREE.Mesh(new THREE.PlaneGeometry(.28,.2),new THREE.MeshLambertMaterial({color:'#f4ecd8',side:THREE.DoubleSide}));paper.position.set(sx,y0,sz);sc.add(paper);
    const fy=H(FIRE[0],FIRE[1]),t0=performance.now(),fl=new THREE.PointLight('#ffb050',0,16,1.6);fl.position.set(FIRE[0],fy+1.4,FIRE[1]);sc.add(fl);
    const step=()=>{const k=(performance.now()-t0)/1600;if(k<1){paper.position.set(sx+(FIRE[0]-sx)*k,y0+Math.sin(k*Math.PI)*1.2+(fy+.9-y0)*k,sz+(FIRE[1]-sz)*k);paper.rotation.set(k*6,k*4,k*3);requestAnimationFrame(step);return}
      if(paper.parent){sc.remove(paper);paper.geometry.dispose();paper.material.dispose();for(let i=0;i<26;i++)puff(FIRE[0]+(Math.random()-.5)*.6,fy+1,FIRE[1]+(Math.random()-.5)*.6,{mat:sparkM,r:.035,life:1.6+Math.random()*1.4,vy:1.2+Math.random()*1.4,vx:(Math.random()-.5)*.5,vz:(Math.random()-.5)*.5,g:.7,fade:false})}
      const q=k-1;fl.intensity=q<2.5?18*Math.sin(Math.min(1,q/2.5)*Math.PI):0;if(q<2.5)requestAnimationFrame(step);else{sc.remove(fl);fl.dispose()}};step();
    if(window.__xuyenJournal)window.__xuyenJournal('Mình đã thả "'+letPick+'"'+(txt?' ('+txt+')':'')+' vào lửa và để nó cháy thành tro.','🔥 Buông bỏ bên lửa');
    setTimeout(()=>caption('🔥 Nhìn nó cháy thành tro. Hít vào hơi ấm, thở ra thật dài. Bạn không cần mang nó theo nữa.',8000),1700)}
  // Cho tuần lộc ăn: nắm rêu địa y trên tay, đàn tuần lộc gần đó cúi xuống ăn (chỉ là gợi ý nhẹ), đếm số lần trên máy
  const deerFed={n:0,t:0};/* không đếm hiển thị; cho ăn quá 3 lần trong 10 phút thì tuần lộc báo đã no */
  const moss=new THREE.Mesh(gSph,lam('#b9c29a'));moss.scale.set(.22,.12,.22);moss.visible=false;sc.add(moss);
  // 28/11: thùng rêu ở góc ngoài rào trại tuần lộc. Chạm thùng để lấy một nắm rêu, rồi chạm con tuần lộc để cho ăn; lặp lại tới khi tuần lộc no hoặc bấm Dừng cho ăn.
  const MOSSBIN=(()=>{const st=STATIONS.find(o=>o.id==='deer'),x=st.x-1.2,z=st.z-2.8,y=H(x,z),g=new THREE.Group();g.position.set(x,y,z);g.rotation.y=.4;
    const wood=lam('#8a6446'),dk=lam('#5e4330');for(const [sx,sy,sz,px,py,pz] of [[1.2,.08,.85,0,.08,0],[1.2,.6,.06,0,.38,.4],[1.2,.6,.06,0,.38,-.4],[.06,.6,.85,.58,.38,0],[.06,.6,.85,-.58,.38,0]]){const m=new THREE.Mesh(new THREE.BoxGeometry(1,1,1),wood);m.scale.set(sx,sy,sz);m.position.set(px,py,pz);g.add(m)}
    for(const sx of [-.58,.58])for(const sz of [-.4,.4]){const m=new THREE.Mesh(new THREE.BoxGeometry(1,1,1),dk);m.scale.set(.09,.72,.09);m.position.set(sx,.36,sz);g.add(m)}
    const lich=lam('#b9c29a'),lich2=lam('#9fae86');for(let i=0;i<9;i++){const m=new THREE.Mesh(gSph,i%2?lich:lich2);m.scale.set(.26,.14,.24);m.position.set(-.38+(i%3)*.38,.66+(i%2)*.04,-.22+Math.floor(i/3)*.22);g.add(m)}
    {const m=new THREE.Mesh(gSph,lam('#f4f7fb'));m.scale.set(.5,.06,.35);m.position.set(.1,.75,.05);g.add(m)}
    sc.add(g);block(x,z,.85);st.x=x-Math.cos(.4)*1.6;st.z=z+Math.sin(.4)*1.6;return {x,z,g}})();
  const FEED={hold:false,on:false,n:0,fly:null,tgt:-1};
  const feedEnd=msg=>{FEED.on=false;FEED.hold=false;moss.visible=false;stopBtn.hidden=true;if(msg)caption(msg,6000)};
  const feedTake=()=>{const now=performance.now();if(now-deerFed.t>600000)deerFed.n=0;if(deerFed.n>=5){caption('🦌 Tuần lộc no rồi, chúng nằm xuống nhai lại thong thả. Để chúng nghỉ, lát nữa ghé lại nhé.',6000);return}
    FEED.on=true;FEED.hold=true;moss.visible=true;stopBtn.hidden=false;stopBtn.textContent='⏹ Dừng cho ăn';P.a=Math.atan2(MOSSBIN.x-P.x,MOSSBIN.z-P.z);caption('🦌 Bạn bốc một nắm rêu địa y mềm. Giờ chạm vào một chú tuần lộc để cho ăn.',5000)};
  const feedGive=i=>{const d=DEERS[i];if(!d)return;const now=performance.now();deerFed.t=now;deerFed.n++;FEED.n++;FEED.hold=false;P.a=Math.atan2(d.x-P.x,d.z-P.z);
    FEED.fly={a:moss.position.clone(),b:new THREE.Vector3(d.x+Math.sin(d.ry)*.9,H(d.x,d.z)+(d.lie?.5:1.1),d.z+Math.cos(d.ry)*.9),t:0};
    if(deerFed.n>=5){setTimeout(()=>feedEnd('🦌 Nắm rêu cuối cùng. Tuần lộc no rồi, thở ra một làn hơi ấm rồi nằm xuống nhai lại. Cảm ơn bạn đã chăm chúng.'),1600);return}
    caption(['🦌 Tuần lộc cúi xuống ăn chậm rãi. Chạm thùng rêu để lấy thêm nhé.','🦌 Chú này nhai rêu, khẽ hít hơi ấm từ tay bạn. Lấy thêm rêu cho bạn khác nhé.','🦌 Tuần lộc sống chậm theo mùa, không vội vàng. Còn đói một chút, lấy thêm rêu nhé.','🦌 Gần no rồi. Thêm một nắm nữa thôi.'][Math.min(3,deerFed.n-1)],5000)};
  const feedTick=dt=>{if(FEED.hold&&P.mode==='walk'){moss.position.set(P.x+Math.sin(P.a)*.45,groundY(P.x,P.z)+1,P.z+Math.cos(P.a)*.45)}
    const f=FEED.fly;if(f){f.t=Math.min(1,f.t+dt/.8);moss.position.lerpVectors(f.a,f.b,f.t);moss.position.y+=Math.sin(f.t*Math.PI)*.8;if(f.t>=1){if(f.t2==null)f.t2=0;f.t2+=dt;moss.scale.set(.22*(1-f.t2/2.5),.12*(1-f.t2/2.5),.22*(1-f.t2/2.5));if(f.t2>2.5){FEED.fly=null;moss.visible=false;moss.scale.set(.22,.12,.22)}}}};
  // ---------- Bên trong chòi lửa (lều kota): dựng khi vào lần đầu, đặt riêng dưới mặt đất; bếp nướng giữa nhà có chụp khói và ống khói lên đỉnh mái,
  // ghế băng quanh vách phủ da tuần lộc, 6 chỗ ngồi quây quanh lửa, ấm trà trên vỉ nướng, kệ chén, ô cửa mái nhìn lên trời; ánh sáng chỉ từ lửa và cửa sổ ----------
  const KI={x:420,y:-80,z:420,g:null,floor:null,seats:[],fl:null,light:null,kettle:null,sit:-1,seatTo:-1,camY:2.75,li:22,kp:[.45,1.6,.25],ent:[0,0,Math.PI],
    msg:'🔥 Chòi lửa · chạm sàn để đi, chạm ghế da tuần lộc để ngồi quây quanh bếp lửa · 🚪 Ra cửa để ra ngoài',sitMsg:'🔥 Ngồi quây quanh bếp lửa. Nghe củi tí tách, ấm trà reo khẽ.'},KA=KOTA.R*Math.cos(Math.PI/8);
  let RM=KI;/* phòng đang ở trong: chòi lửa hoặc Nhà Mái Cỏ Riêng; cả hai dùng chung chế độ 'kota' (trong nhà) */
  KI.ent[1]=KA-1.1;KI.build=()=>kotaBuild();
  KI.clamp=(lx,lz)=>{let r=Math.hypot(lx,lz);const mx=KA-.95;if(r>mx){lx*=mx/r;lz*=mx/r;r=mx}if(r<1.75){const k=1.75/(r||1);lx*=k;lz*=k}return [lx,lz]};
  KI.camClamp=(cx,cz)=>{const rr=Math.hypot(cx,cz),mx=KA-.35;return rr>mx?[cx/rr*mx,cz/rr*mx]:[cx,cz]};
  KI.exit=()=>{const dx=Math.sin(KOTA.ry),dz=Math.cos(KOTA.ry);P.x=KOTA.x+dx*(KA+1.6);P.z=KOTA.z+dz*(KA+1.6);P.a=KOTA.ry;P.yaw=KOTA.ry};
  function kotaBuild(){if(KI.g)return;const g=new THREE.Group();g.position.set(KI.x,KI.y,KI.z);const M=(geo,c,x,y,z,sx,sy,sz,rx,ry,rz,basic)=>{const m=new THREE.Mesh(geo,basic?new THREE.MeshBasicMaterial({color:c,fog:false}):lam(c));m.position.set(x,y,z);m.scale.set(sx,sy,sz);m.rotation.set(rx||0,ry||0,rz||0);g.add(m);return m},box=new THREE.BoxGeometry(1,1,1),oct=new THREE.CylinderGeometry(1,1,1,8),R=KOTA.R,a=KA,L8=2*R*Math.sin(Math.PI/8);
    KI.floor=M(oct,'#b98a5a',0,0,0,R,.1,R,0,Math.PI/8,0);for(let i=-4;i<=4;i++)M(box,'#a8784c',i*.8,.052,0,.03,.01,2*a-.2);/* sàn ván */
    for(let k=0;k<8;k++){const f=k*Math.PI/4;for(let i=0;i<9;i++)M(gCyl,['#a87a4e','#9a6c44','#b3845a'][(i+k)%3],Math.sin(f)*(a-.08),.2+i*.235,Math.cos(f)*(a-.08),.13,L8+.1,.13,0,f,Math.PI/2)}/* vách gỗ khúc */
    {const rf=new THREE.Mesh(new THREE.ConeGeometry(R+.1,3.3,8,1,true),new THREE.MeshLambertMaterial({color:'#7a5236',side:THREE.BackSide}));rf.position.y=2.15+1.65;rf.rotation.y=Math.PI/8;g.add(rf);for(let k=0;k<8;k++){const f=(k+.5)*Math.PI/4;const r0=R*.98,len=Math.hypot(r0,3.3);const m=M(box,'#5e3e28',Math.sin(f)*r0/2,2.15+1.65,Math.cos(f)*r0/2,.12,len,.12,0,f,0);m.rotation.set(Math.atan2(r0,3.3),f,0,'YXZ')}}/* mái trong, kèo */
    M(box,'#3e2a1c',0,1.05,a-.02,1.0,1.9,.06);M(box,'#ffcf8a',0,1.8,a-.06,.6,.18,.02,0,0,0,1);/* cửa */
    for(const k of [3,5,6]){const f=k*Math.PI/4;M(box,'#ffdca0',Math.sin(f)*(a-.16),1.35,Math.cos(f)*(a-.16),.6,.48,.02,0,f,0,1)}/* cửa sổ (đêm ngoài sáng ánh tuyết) */
    {const f=Math.PI,rr=R*.55,h=2.15+3.3*(1-.55/1);const m=M(box,'#8fe6cf',Math.sin(f)*rr,h,Math.cos(f)*rr,.9,.7,.02,0,0,0,1);m.rotation.set(-Math.atan2(R,3.3),f,0,'YXZ')}/* ô cửa mái nhìn lên trời cực quang */
    // ghế băng quanh vách (trừ mặt cửa), da tuần lộc trên 6 chỗ ngồi
    for(let k=1;k<8;k++){const f=k*Math.PI/4,r=a-.42;M(box,'#8a5e3a',Math.sin(f)*r,.42,Math.cos(f)*r,L8+.05,.08,.62,0,f,0);M(box,'#6e4a30',Math.sin(f)*r,.2,Math.cos(f)*r,L8-.2,.4,.5,0,f,0)}
    KI.seats=[1,2,3,5,6,7].map(k=>{const f=k*Math.PI/4,r=a-.44,x=Math.sin(f)*r,z=Math.cos(f)*r;M(gSph,k%2?'#e9e2d4':'#8a6a4c',x,.5,z,.42,.07,.32,0,f,0);M(gSph,k%2?'#d8cfbe':'#6e5238',x*.96,.52,z*.96,.18,.05,.12,0,f,0);const hit=M(box,'#000',x,.6,z,1,1.2,.9,0,f,0);hit.material.visible=false;hit.userData.seat=1;const rr=Math.hypot(x,z);return {x,z,px:x*.94,pz:z*.94,ax:x*(rr-.75)/rr,az:z*(rr-.75)/rr,a:f+Math.PI,hit}});
    // kệ chén ở mặt sau, chăn len gấp
    {const f=Math.PI,r=a-.12;M(box,'#7a5032',Math.sin(f)*r,1.5,Math.cos(f)*r,1.2,.06,.28,0,f,0);for(let i=0;i<5;i++)M(gCyl,['#efe6d6','#c46a4a','#6f8fb0','#efe6d6','#d6b878'][i],Math.sin(f)*r+(i-2)*.2,1.6,Math.cos(f)*r,.06,.12,.06);M(box,'#b8322c',-2.2,.55,-.6,.5,.12,.4,0,.6,0);M(box,'#efe6d6',-2.2,.66,-.6,.48,.08,.38,0,.6,0)}
    // bếp nướng giữa nhà: bàn tám cạnh bằng gỗ ôm lò đá, vỉ nướng, chụp khói đen và ống khói lên đỉnh mái
    M(oct,'#7a5a40',0,.36,0,1.25,.72,1.25,0,Math.PI/8,0);M(oct,'#9a7450',0,.74,0,1.32,.06,1.32,0,Math.PI/8,0);M(gCyl,'#5e5a56',0,.78,0,.72,.08,.72);for(let i=0;i<9;i++){const t=i/9*6.28;M(gSph,'#4e4a46',Math.cos(t)*.6,.84,Math.sin(t)*.6,.14,.1,.14)}
    for(let i=0;i<3;i++)M(gCyl,'#5a3a22',(i-1)*.18,.88,0,.07,.6,.07,Math.PI/2,i*.8,0);KI.fl=[0,1,2].map(i=>{const m=M(gCone,i?'#ffcf5a':'#ff8a3a',(i-1)*.12,1.1,(i%2)*.08,.16-i*.03,.5-i*.08,.16-i*.03,0,0,0,1);m.userData.h=.5-i*.08;return m});for(let i=-3;i<=3;i++)M(box,'#222326',i*.12,1.32,0,.02,.02,1.1);
    M(gCone,'#222326',0,2.35,0,.95,.55,.95);M(gCyl,'#222326',0,3.75,0,.15,2.3,.15);
    KI.kettle=new THREE.Group();{const k=KI.kettle;const b=new THREE.Mesh(gSph,lam('#2f3338'));b.scale.set(.17,.14,.17);k.add(b);const sp=new THREE.Mesh(gCyl,b.material);sp.scale.set(.03,.16,.03);sp.position.set(.17,.04,0);sp.rotation.z=-1;k.add(sp);const hd=new THREE.Mesh(new THREE.TorusGeometry(.12,.012,5,12,Math.PI),b.material);hd.position.y=.1;k.add(hd)}KI.kettle.position.set(.3,1.47,.25);g.add(KI.kettle);
    KI.light=new THREE.PointLight('#ffb060',22,12,1.4);KI.light.position.set(0,1.6,0);g.add(KI.light);{const l2=new THREE.PointLight('#ffd9a8',5,9,1.6);l2.position.set(0,3.2,0);g.add(l2)}
    sc.add(g);KI.g=g}
  function roomEnter(R){R.build();RM=R;P.mode='kota';R.sit=-1;R.seatTo=-1;P.dest=null;P.x=R.x+R.ent[0];P.z=R.z+R.ent[1];P.a=R.ent[2];P.yaw=R.yaw!=null?R.yaw:R.ent[2]+Math.PI;first=true;snow.visible=false;me.visible=true;R.g.visible=true;caption(R.msg,8000)}
  const kotaEnter=()=>roomEnter(KI);
  function kotaExit(){RM.sit=-1;setSit(false);snow.visible=FX.snow;RM.exit();first=true;if(typeof camZoom!=='undefined'&&camZoom<1.3)setZoom(1.3)}/* ra cửa: đứng trước cửa quay lưng về nhà, camera phía đối diện nhìn ngược về nhà */
  function kotaTick(dt,t){const R=RM;if(R.fl)R.fl.forEach((f,i)=>{f.scale.y=f.userData.h*(1+Math.sin(t*(9+i*3)+i)*.18)});if(R.light)R.light.intensity=R.li*(1+Math.sin(t*8)*.11+Math.sin(t*21)*.055);
    if(R.kettle&&Math.random()<dt*4)puff(R.x+R.kp[0],R.y+R.kp[1],R.z+R.kp[2],{r:.04,vy:.35,life:1.8,g:1.6});
    if(R.sit>=0){const s=R.seats[R.sit];me.position.set(R.x+s.px,R.y+(s.y||.12),R.z+s.pz);me.rotation.set(0,s.a,0);tgt.set(me.position.x,me.position.y+1.2,me.position.z);return}
    if(P.dest){const dx=P.dest.x-P.x,dz=P.dest.z-P.z,d=Math.hypot(dx,dz);if(d<.12){P.dest=null;if(R.seatTo>=0){const si=R.seatTo;R.seatTo=-1;if(!(R.onSeat&&R.onSeat(si))){R.sit=si;setSit(true);caption(R.sitMsg,6000)}}}else{const sp=Math.min(d,2.2*dt);const [lx,lz]=R.clamp(P.x+dx/d*sp-R.x,P.z+dz/d*sp-R.z);P.x=R.x+lx;P.z=R.z+lz;P.a=Math.atan2(dx,dz)}}
    me.position.set(P.x,R.y+.05+(P.dest?Math.abs(Math.sin(t*8))*.04:0),P.z);let da=P.a-me.rotation.y;da=Math.atan2(Math.sin(da),Math.cos(da));me.rotation.y+=da*Math.min(1,dt*10);tgt.set(P.x,me.position.y+1.4,P.z)}
  function kotaTap(){const R=RM,h=ray.intersectObjects([...R.seats.map(s=>s.hit),R.floor],false)[0];if(!h)return;const si=R.seats.findIndex(s=>s.hit===h.object);
    if(R.sit>=0){R.sit=-1;setSit(false)}
    if(si>=0){const s=R.seats[si];P.dest={x:R.x+s.ax,z:R.z+s.az};R.seatTo=si;return}
    const [lx,lz]=R.clamp(h.point.x-R.x,h.point.z-R.z);P.dest={x:R.x+lx,z:R.z+lz};R.seatTo=-1}
  // ---------- Tư Gia Xứ Yên: nhà gỗ đỏ viền trắng mái cỏ kiểu nhà chài Bắc Âu (rorbu) trên bờ Hồ Băng Lớn ----------
  // ván dọc sơn đỏ, nẹp góc và khung cửa trắng, cửa sổ bốn ô, mái dốc hai mái lợp cỏ (mùa đông phủ tuyết, mép cỏ lộ ra), đầu hồi quay ra hồ, móng đá, hiên gỗ nhỏ có lan can nhìn ra hồ, thuyền gỗ kéo lên bờ
  const TGH={g:null,c:null,i:0,x:0,z:0,ry:0,W:7.2,D:5.2};
  function tgBuild(){const g=new THREE.Group(),M=(geo,c,x,y,z,sx,sy,sz,rx,ry,rz,basic)=>{const m=new THREE.Mesh(geo,basic?new THREE.MeshBasicMaterial({color:c}):lam(c));m.position.set(x,y,z);m.scale.set(sx,sy,sz);m.rotation.set(rx||0,ry||0,rz||0);g.add(m);return m},bx=new THREE.BoxGeometry(1,1,1),W=TGH.W,D=TGH.D,h=2.6,b0=.5,RED='#a3262a',WH='#f2efe8',rt=Math.atan(1.0),rh=Math.tan(rt)*(W/2+.35);
    // móng đá, thân nhà ván dọc đỏ (local: z+ là đầu hồi quay ra hồ, cửa ở mặt bên x+)
    M(bx,'#8c8a86',0,b0/2,0,W+.3,b0,D+.3);for(let i=0;i<10;i++)M(bx,i%2?'#7c7a76':'#9a9792',-W/2+.36+i*(W/9.2),b0*.5,D/2+.16,.62,b0*.7,.04);
    M(bx,RED,0,b0+h/2,0,W,h,D);for(let i=0;i<=24;i++){const xx=-W/2+i*W/24;M(bx,'#8e2024',xx,b0+h/2,D/2+.01,.05,h,.02);M(bx,'#8e2024',xx,b0+h/2,-D/2-.01,.05,h,.02)}for(let i=0;i<=17;i++){const zz=-D/2+i*D/17;for(const sx of [-1,1])M(bx,'#8e2024',sx*(W/2+.01),b0+h/2,zz,.02,h,.05)}
    for(const sx of [-1,1])for(const sz of [-1,1])M(bx,WH,sx*(W/2+.03),b0+h/2,sz*(D/2+.03),.14,h+.04,.14);/* nẹp góc trắng */
    // đầu hồi ván đỏ (tam giác) hai đầu
    for(const sz of [-1,1]){const tri=new THREE.Shape();tri.moveTo(-W/2,0);tri.lineTo(W/2,0);tri.lineTo(0,rh-.25);tri.closePath();const m=new THREE.Mesh(new THREE.ShapeGeometry(tri),lam(RED));m.position.set(0,b0+h,sz*(D/2+.005));if(sz<0)m.rotation.y=Math.PI;g.add(m)}
    // mái cỏ hai mái: lớp cỏ nâu xanh dày, tuyết phủ phía trên, mép cỏ lộ; diềm mái trắng ở đầu hồi
    const Lr=(W/2+.45)/Math.cos(rt);for(const sd of [-1,1]){const cx=sd*(W/4+.12),cy=b0+h+rh/2-.12;M(bx,'#6f5f40',cx,cy,0,Lr,.34,D+.9,0,0,-sd*rt);M(bx,'#7e7a4a',cx+sd*.02,cy+.12,0,Lr-.1,.12,D+.85,0,0,-sd*rt);M(bx,SNOW,cx-sd*.05,cy+.26,0,Lr-.5,.16,D+.7,0,0,-sd*rt);
      for(const sz of [-1,1])M(bx,WH,cx,cy-.05,sz*(D/2+.46),Lr+.06,.2,.08,0,0,-sd*rt)}/* diềm trắng */
    M(bx,'#8c8a86',-W*.18,b0+h+rh*.62,-D*.18,.55,1.6,.55);M(bx,SNOW,-W*.18,b0+h+rh*.62+.84,-D*.18,.62,.1,.62);/* ống khói đá */
    // cửa sổ bốn ô khung trắng: đầu hồi quay ra hồ hai tầng, mặt bên
    const win=(x,y,z,ry2,w=.85,hh=1.0)=>{const q=new THREE.Group();q.position.set(x,y,z);q.rotation.y=ry2;const a=(geo,c,xx,yy,zz,sx,sy,sz,basic)=>{const m=new THREE.Mesh(geo,basic?new THREE.MeshBasicMaterial({color:c}):lam(c));m.position.set(xx,yy,zz);m.scale.set(sx,sy,sz);q.add(m)};a(bx,'#ffd79a',0,0,.02,w,hh,.02,1);a(bx,WH,0,hh/2+.06,.05,w+.24,.12,.06);a(bx,WH,0,-hh/2-.06,.05,w+.24,.12,.06);for(const sx of [-1,1])a(bx,WH,sx*(w/2+.06),0,.05,.12,hh+.24,.06);a(bx,WH,0,0,.05,.05,hh,.05);a(bx,WH,0,0,.05,w,.05,.05);g.add(q)};
    win(-1.5,b0+1.45,D/2,0);win(1.5,b0+1.45,D/2,0);win(0,b0+h+.95,D/2,0,.6,.75);win(-1.4,b0+1.45,-D/2,Math.PI);win(W/2,b0+1.45,-1.4,Math.PI/2);win(-W/2,b0+1.45,.6,-Math.PI/2);win(-W/2,b0+1.45,-1.6,-Math.PI/2);
    // cửa gỗ trắng ở mặt bên, bậc gỗ; hiên gỗ có lan can ở đầu hồi quay ra hồ
    M(bx,WH,W/2+.04,b0+1.05,1.2,.06,2.1,1.05);M(bx,'#d9d4ca',W/2+.08,b0+1.05,1.2,.02,1.8,.8);M(bx,"#c9a24a",W/2+.1,b0+1.0,.9,.04,.08,.08);M(bx,'#9a7a56',W/2+.75,.32,1.2,1.3,.12,1.3);M(bx,'#9a7a56',W/2+.75,.12,1.2,1.3,.12,1.3);
    M(bx,'#9a7a56',0,.42,D/2+1.3,W-.6,.12,2.4);for(const sx of [-1,1])M(bx,'#7a5a40',sx*(W/2-.4),.95,D/2+1.3,.08,.08,2.4);M(bx,'#7a5a40',0,.95,D/2+2.45,W-.7,.08,.08);for(let i=0;i<9;i++){const xx=-W/2+.4+i*(W-.8)/8;M(bx,'#7a5a40',xx,.68,D/2+2.45,.08,.55,.08)}M(bx,SNOW,0,.5,D/2+1.3,W-.7,.04,2.3);
    {const ch=(x)=>{M(bx,'#a07a56',x,.75,D/2+1.0,.5,.06,.5);M(bx,'#a07a56',x,1.0,D/2+.78,.5,.5,.06)};ch(-1.3);ch(1.3)}/* hai ghế gỗ trên hiên */
    // 28/11: bỏ thuyền gỗ trước cửa nhà theo yêu cầu
    TGH.light=new THREE.PointLight('#ffc27a',2.5,8,1.6);TGH.light.position.set(0,b0+1.4,D/2+1.2);g.add(TGH.light);
    {const c=document.createElement('canvas');c.width=256;c.height=96;const g2=c.getContext('2d');g2.fillStyle='#f2efe8';g2.fillRect(0,0,256,96);g2.strokeStyle='#a3262a';g2.lineWidth=5;g2.strokeRect(5,5,246,86);g2.fillStyle='#7a1c20';g2.font='600 30px Georgia,serif';g2.textAlign='center';g2.fillText('Nhà Mái Cỏ Riêng',128,60,236);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;const m=new THREE.Mesh(new THREE.PlaneGeometry(1.3,.49),new THREE.MeshLambertMaterial({map:t}));m.position.set(W/2+.06,b0+1.75,-.2);m.rotation.y=Math.PI/2;g.add(m)}
    sc.add(g);TGH.g=g}
  // đặt nhà cố định ở bờ đông, hiên quay ra hồ hướng về đồi chùa; va chạm thân nhà
  tgBuild();TGH.x=HOME.x;TGH.z=HOME.z;TGH.ry=HOME.ry;TGH.g.position.set(HOME.x,H(HOME.x,HOME.z)-.1,HOME.z);TGH.g.rotation.y=HOME.ry;TGH.c=[HOME.x,HOME.z,4.4];colliders.push(TGH.c);blockBox(HOME.x,HOME.z,HOME.ry,TGH.W/2+.15,TGH.D/2+.15);
  window.__homeView=()=>{const ux=Math.sin(TGH.ry),uz=Math.cos(TGH.ry),px=Math.cos(TGH.ry),pz=-Math.sin(TGH.ry),y=H(TGH.x,TGH.z);return {house:[TGH.x,TGH.z],cam:[TGH.x+ux*20+px*9,y+7,TGH.z+uz*20+pz*9],see:[TGH.x,y+2.5,TGH.z],door:[TGH.x+px*9-ux*2,y+3,TGH.z+pz*9-uz*2]}};
  // ---------- Bên trong Nhà Mái Cỏ Riêng: một gian ấm kiểu nhà gỗ Thuỵ Điển, dựng khi vào lần đầu, đặt riêng dưới mặt đất như chòi lửa.
  // Vách ván dọc sơn trắng ngà, sàn ván thông rộng, trần dốc theo mái có xà ngang; lò sưởi gang có lửa sau ô kính, ấm nước trên nóc lò;
  // bàn ăn gỗ với 6 ghế song (6 chỗ ngồi), thảm sọc đỏ trắng, đèn thả trên bàn, góc bếp nhỏ, ghế băng dưới cửa sổ nhìn ra hồ, ghế bành đọc sách ----------
  const HI={x:470,y:-80,z:420,g:null,floor:null,seats:[],fl:null,light:null,kettle:null,sit:-1,seatTo:-1,camY:2.25,li:7,hx:TGH.W/2-.15,hz:TGH.D/2-.15,tb:[-.4,0],st:[-2.95,-.5],
    msg:'🏡 Nhà Mái Cỏ Riêng · chạm sàn để đi, chạm ghế quanh bàn để ngồi · 🚪 Ra cửa để ra ngoài',sitMsg:'🏡 Ngồi bên bàn gỗ. Lửa lò sưởi tí tách, ngoài cửa sổ hồ băng lặng yên.'};
  HI.ent=[HI.hx-1.5,1.2,-Math.PI/2];HI.yaw=Math.PI/2+.6;/* camera chếch về góc phòng cạnh cửa cho rộng tầm nhìn */HI.kp=[HI.st[0]+.05,1.3,HI.st[1]+.2];HI.build=()=>homeBuild();
  HI.clamp=(lx,lz)=>{lx=Math.max(-HI.hx+.4,Math.min(HI.hx-.4,lx));lz=Math.max(-HI.hz+.4,Math.min(HI.hz-.7,lz));if(lz<-.15&&lx>HI.hx-1.0)lx=HI.hx-1.0;
    const ox=lx-HI.tb[0],oz=lz-HI.tb[1],tx=1.5,tz=1.2;if(Math.abs(ox)<tx&&Math.abs(oz)<tz){if(tx-Math.abs(ox)<tz-Math.abs(oz))lx=HI.tb[0]+(ox<0?-tx:tx);else lz=HI.tb[1]+(oz<0?-tz:tz)}
    const sx=lx-HI.st[0],sz=lz-HI.st[1],sr=Math.hypot(sx,sz);if(sr<1.1){lx=HI.st[0]+sx/(sr||1)*1.1;lz=HI.st[1]+sz/(sr||1)*1.1}
    const ax=lx+2.55,az=lz-1.75,ar=Math.hypot(ax,az);if(ar<.95){lx=-2.55+ax/(ar||1)*.95;lz=1.75+az/(ar||1)*.95}return [lx,lz]};
  HI.camClamp=(cx,cz)=>[Math.max(-HI.hx+.25,Math.min(HI.hx-.25,cx)),Math.max(-HI.hz+.25,Math.min(HI.hz-.25,cz))];
  HI.exit=()=>{const c=Math.cos(HOME.ry),sn=Math.sin(HOME.ry),lx=TGH.W/2+1.9,lz=1.2;P.x=HOME.x+lx*c+lz*sn;P.z=HOME.z-lx*sn+lz*c;P.a=Math.atan2(c,-sn);P.yaw=P.a};/* đứng cách bậc cửa 1 m, quay lưng về nhà */
  // ---------- Bên trong Lều Đồi Tuyết (lều kính có bậc đá): chạm lều để vào hẳn trong vòm kính, đi lại quanh giường, ghế bành;
  // chạm giường để nằm ngắm cực quang: kéo để nhìn quanh cả bầu trời, kéo dọc để ngước lên cao hay nhìn xuống mặt hồ, chụm hoặc lăn chuột để phóng to thu nhỏ ----------
  const mkGI=k=>{const [x,z]=IGLOOS[k],ry=Math.atan2(LAKE.x-x,LAKE.z-z),c=Math.cos(ry),s=Math.sin(ry),w=(lx,lz)=>[lx*c+lz*s,-lx*s+lz*c],lo=(dx,dz)=>[dx*c-dz*s,dx*s+dz*c];
    const R={x,z,y:H(x,z)+.56,ry,w,lo,g:null,floor:null,seats:[],fl:null,light:null,kettle:null,sit:-1,seatTo:-1,camY:2.45,li:0,kp:[0,0,0],
      msg:'✨ Lều kính · chạm sàn để đi, chạm giường để nằm ngắm cực quang, chạm ghế bành để ngồi · 🚪 Ra cửa để ra ngoài',sitMsg:'✨ Ngồi trong ghế bành, nhìn qua vòm kính ra mặt hồ đêm.'};
    const e=w(0,1.7);R.ent=[e[0],e[1],ry+Math.PI];R.yaw=ry;
    R.clamp=(dx,dz)=>{let [lx,lz]=lo(dx,dz);const r=Math.hypot(lx,lz),mx=DR-.75;if(r>mx){lx*=mx/r;lz*=mx/r}
      const box=(x0,x1,z0,z1)=>{if(lx>x0&&lx<x1&&lz>z0&&lz<z1){const d=[lx-x0,x1-lx,lz-z0,z1-lz],m=Math.min(...d);if(m===d[0])lx=x0;else if(m===d[1])lx=x1;else if(m===d[2])lz=z0;else lz=z1}};
      box(-1.65,1.65,-3.2,-.05);box(1.0,2.4,.25,1.55);const cr=(cx,cz,rr)=>{const ax=lx-cx,az=lz-cz,d=Math.hypot(ax,az);if(d<rr){lx=cx+ax/(d||1)*rr;lz=cz+az/(d||1)*rr}};cr(.7,1.1,.75);return w(lx,lz)};
    R.camClamp=(cx,cz)=>{const r=Math.hypot(cx,cz),mx=DR-1.0;return r>mx?[cx/r*mx,cz/r*mx]:[cx,cz]};
    R.exit=()=>{const o=w(0,DR+3.6);P.x=x+o[0];P.z=z+o[1];P.a=ry;P.yaw=ry};
    R.build=()=>{if(R.g)return;const g=new THREE.Group();g.position.set(x,R.y,z);g.rotation.y=ry;const inv=new THREE.MeshBasicMaterial({visible:false});
      R.floor=new THREE.Mesh(new THREE.CircleGeometry(DR,24).rotateX(-Math.PI/2),inv);g.add(R.floor);
      const hit=(px,py,pz,sx,sy,sz)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(sx,sy,sz),inv);m.position.set(px,py,pz);g.add(m);return m};
      const sw=(lx,lz)=>w(lx,lz),dirA=(lx,lz)=>{const v=w(lx,lz);return Math.atan2(v[0],v[1])};
      {const [px,pz]=sw(0,-1.3),[ax,az]=sw(0,.35);R.seats.push({px,pz,ax,az,a:dirA(0,1),bed:true,hit:hit(0,.6,-1.3,2.7,1.2,2.4)})}
      {const [px,pz]=sw(1.65,.9),[ax,az]=sw(.95,.15);R.seats.push({px,pz,ax,az,a:dirA(-1,0),y:.3,hit:hit(1.75,.6,.9,1.0,1.2,1.0)})}
      sc.add(g);R.g=g};
    R.onSeat=i=>{if(!R.seats[i].bed)return false;auroraStart();return true};R.k=k;
    return R};
  let GI=mkGI(1);
  const igSet=k=>{if(GI.k===k||P.mode==='kota'||P.mode==='aurora')return;if(GI.g)sc.remove(GI.g);GI=mkGI(k);const q=STATIONS.find(o=>o.id==='aurora'),[sx,sz]=toLake(IGLOOS[k],7.4);q.x=sx;q.z=sz};/* 28/11: cả ba lều kính đều chạm vào được, chọn lều vừa chạm */
  const AUR={on:false,fov:0,zoom:1,lift:1,pos:new THREE.Vector3()};
  const WV={fov:50,zoom:1,lift:1};function auroraStart(o2){const R=GI,o=R.w(0,-1.05);AUR.on=true;AUR.fov=cam.fov;AUR.zoom=camZoom;AUR.lift=camLift;AUR.back=o2&&o2.back;if(o2)AUR.pos.set(...o2.pos);else AUR.pos.set(R.x+o[0],R.y+1.25,R.z+o[1]);
    P.mode='aurora';P.ride=0;P.dest=null;P.yaw=o2?o2.yaw:R.ry;near=null;actBtn.hidden=true;camLift=1.15;camZoom=1.6;camZoomS=1.6;U.boost.value=1.5;me.visible=false;labels.forEach(l=>l.visible=false);
    stopBtn.hidden=false;stopBtn.textContent=o2?'↩ Đứng dậy':'↩ Ngồi dậy';caption((o2?o2.msg:'✨ Nằm ngắm cực quang')+' · kéo ngang để nhìn quanh, kéo dọc để ngước lên hay nhìn xuống hồ, chụm hai ngón hoặc lăn chuột để phóng to',9000)}
  function auroraEnd(){AUR.on=false;cam.fov=AUR.fov;cam.updateProjectionMatrix();camZoom=AUR.zoom;camZoomS=camZoom;camLift=AUR.lift;U.boost.value=1;me.visible=true;labels.forEach(l=>l.visible=true);
    if(AUR.back){const [bx,bz,ba]=AUR.back;AUR.back=null;P.mode='walk';P.x=bx;P.z=bz;P.a=ba+Math.PI;P.yaw=ba;first=true;stopBtn.hidden=true;caption('Mang Yên về đời thực: tối nay, trước khi ngủ, thử ngước nhìn bầu trời một phút.',7000);return}
    const R=GI,s=R.seats[0];RM=R;P.mode='kota';R.sit=-1;R.seatTo=-1;P.x=R.x+s.ax;P.z=R.z+s.az;P.a=R.ry;P.yaw=R.ry+Math.PI;first=true;stopBtn.hidden=false;stopBtn.textContent='🚪 Ra cửa';
    caption('Mang Yên về đời thực: tối nay, trước khi ngủ, thử ngước nhìn bầu trời một phút.',7000)}
  function homeBuild(){if(HI.g)return;const g=new THREE.Group();g.position.set(HI.x,HI.y,HI.z);const M=(geo,c,x,y,z,sx,sy,sz,rx,ry,rz,basic)=>{const m=new THREE.Mesh(geo,basic?new THREE.MeshBasicMaterial({color:c,fog:false}):lam(c));m.position.set(x,y,z);m.scale.set(sx,sy,sz);m.rotation.set(rx||0,ry||0,rz||0);g.add(m);return m},
      box=new THREE.BoxGeometry(1,1,1),W=HI.hx*2,D=HI.hz*2,h=2.6,rt=Math.atan(1.0),rh=Math.tan(rt)*W/2,WALL='#eee6d8',WD='#dcd2c2',WH='#f6f2ea',WOOD='#b88a56';
    // sàn ván thông rộng, vách ván dọc sơn trắng ngà, chân tường gỗ
    HI.floor=M(box,'#c9a06a',0,-.05,0,W,.1,D);for(let i=1;i<9;i++)M(box,'#b08656',0,.002,-D/2+i*D/9,W,.006,.025);
    for(const sz of [-1,1]){M(box,WALL,0,h/2,sz*D/2,W,h,.08);for(let i=1;i<20;i++)M(box,WD,-W/2+i*W/20,h/2,sz*(D/2-.045),.02,h,.01);M(box,'#a8865c',0,.08,sz*(D/2-.05),W,.16,.03)}
    for(const sx of [-1,1]){M(box,WALL,sx*W/2,h/2,0,.08,h,D);for(let i=1;i<14;i++)M(box,WD,sx*(W/2-.045),h/2,-D/2+i*D/14,.01,h,.02);M(box,'#a8865c',sx*(W/2-.05),.08,0,.03,.16,D)}
    // đầu hồi trong, trần dốc ván gỗ sáng theo mái, xà ngang và xà nóc
    for(const sz of [-1,1]){const tri=new THREE.Shape();tri.moveTo(-W/2,0);tri.lineTo(W/2,0);tri.lineTo(0,rh);tri.closePath();const m=new THREE.Mesh(new THREE.ShapeGeometry(tri),lam(WALL));m.position.set(0,h,sz*(D/2-.04));if(sz>0)m.rotation.y=Math.PI;g.add(m)}
    {const Lr=(W/2+.1)/Math.cos(rt);for(const sd of [-1,1]){M(box,'#d8bf94',sd*W/4,h+rh/2,0,Lr,.06,D,0,0,-sd*rt);for(let i=0;i<5;i++)M(box,'#a8804e',sd*W/4,h+rh/2-.07,-D/2+.25+i*(D-.5)/4,Lr,.1,.12,0,0,-sd*rt)}}
    for(let i=1;i<=3;i++)M(box,'#a8804e',0,h+.8,-D/2+i*D/4,W-1.5,.16,.14);M(box,'#a8804e',0,h+rh-.14,0,.18,.18,D);
    // cửa sổ bốn ô khung trắng, ngoài trời đêm tuyết xanh nhạt; cùng chỗ với cửa sổ ngoài nhà
    const win=(x,y,z,ry,w=.85,hh=1.0)=>{const q=new THREE.Group();q.position.set(x,y,z);q.rotation.y=ry;const a=(c,xx,yy,zz,sx,sy,sz,basic)=>{const m=new THREE.Mesh(box,basic?new THREE.MeshBasicMaterial({color:c,fog:false}):lam(c));m.position.set(xx,yy,zz);m.scale.set(sx,sy,sz);q.add(m)};
      a('#8fbcd6',0,0,0,w,hh,.02,1);for(const s2 of [-1,1]){a(WH,0,s2*(hh/2+.05),.03,w+.2,.1,.06);a(WH,s2*(w/2+.05),0,.03,.1,hh+.2,.06)}a(WH,0,0,.03,.05,hh,.04);a(WH,0,0,.03,w,.05,.04);a(WH,0,-hh/2-.1,.1,w+.3,.05,.2);
      for(const s2 of [-1,1])a('#c8423a',s2*(w/2+.2),.05,.07,.18,hh+.25,.03);g.add(q)};/* rèm vải đỏ hai bên */
    win(-1.5,1.45,D/2-.05,Math.PI);win(1.5,1.45,D/2-.05,Math.PI);win(0,h+.95,D/2-.05,Math.PI,.6,.75);win(-1.4,1.45,-D/2+.05,0);win(W/2-.05,1.55,-1.4,-Math.PI/2);win(-W/2+.05,1.45,.75,Math.PI/2);win(-W/2+.05,1.45,-1.75,Math.PI/2);
    // cửa ra vào gỗ trắng ở vách phải, móc áo treo khăn đỏ và mũ len
    M(box,WH,W/2-.05,1.05,1.2,.06,2.1,1.0);M(box,'#e3ddd2',W/2-.09,1.05,1.2,.02,1.8,.76);M(gSph,'#c9a24a',W/2-.12,1.0,.85,.04,.04,.04);M(box,'#ffcf8a',W/2-.1,2.2,1.2,.02,.1,.7,0,0,0,1);
    M(box,'#9a7048',W/2-.06,1.62,2.0,.04,.08,.6);M(box,'#b8322c',W/2-.1,1.3,1.9,.04,.6,.16);M(gSph,'#3d6fb0',W/2-.14,1.55,2.15,.12,.1,.12);
    // lò sưởi gang ở vách trái: tấm đá lót, ô kính thấy lửa, ống khói lên mái, ấm nước, giỏ củi
    {const [sx0,sz0]=HI.st;M(box,'#9a9792',sx0+.15,.03,sz0,1.1,.06,1.3);M(box,'#26282b',sx0,.55,sz0,.62,.8,.7);M(box,'#2e3034',sx0,.98,sz0,.7,.08,.78);M(box,'#26282b',sx0,.1,sz0,.5,.2,.55);
      M(box,'#ff7a2a',sx0+.2,.5,sz0,.01,.36,.44,0,0,0,1);for(const s2 of [-1,1]){M(box,'#16171a',sx0+.32,.5,sz0+s2*.24,.03,.46,.05);M(box,'#16171a',sx0+.32,.5+s2*.21,sz0,.03,.05,.5)}
      HI.fl=[0,1,2].map(i=>{const hh=.26-i*.05,m=M(gCone,i?'#ffcf5a':'#ff8a3a',sx0+.26,.33+hh/2,sz0+(i-1)*.11,.08-i*.012,hh,.08-i*.012,0,0,0,1);m.userData.h=hh;return m});
      M(gCyl,'#26282b',sx0,2.15,sz0,.08,2.3,.08);
      HI.kettle=new THREE.Group();{const k=HI.kettle,mt=lam('#3a3f46'),b=new THREE.Mesh(gSph,mt);b.scale.set(.15,.12,.15);k.add(b);const sp=new THREE.Mesh(gCyl,mt);sp.scale.set(.025,.14,.025);sp.position.set(.14,.03,0);sp.rotation.z=-1;k.add(sp);const hd=new THREE.Mesh(new THREE.TorusGeometry(.1,.01,5,12,Math.PI),mt);hd.position.y=.09;k.add(hd)}HI.kettle.position.set(sx0-.05,1.13,sz0+.2);HI.kettle.rotation.y=Math.PI/2;g.add(HI.kettle);
      M(gCyl,'#8a6a48',sx0+.15,.2,sz0+.95,.25,.4,.25);for(let i=0;i<4;i++)M(gCyl,['#a87a4e','#9a6c44','#b3845a','#a87a4e'][i],sx0+.1+(i%2)*.12,.45,sz0+.88+(i>>1)*.12,.05,.5,.05,Math.PI/2,i*.4,0)}
    // thảm sọc đỏ trắng, bàn ăn gỗ, khăn trải giữa bàn, nến, chén trà; 6 ghế song quanh bàn (6 chỗ ngồi)
    {const [tx,tz]=HI.tb;M(box,'#f2ece2',tx,.006,tz,3.0,.01,2.2);for(let i=0;i<7;i++)M(box,'#b8322c',tx,.012,tz-.9+i*.3,3.0,.004,.08);
      M(box,WOOD,tx,.74,tz,1.9,.06,.9);for(const a of [-1,1])for(const b of [-1,1])M(box,'#9a7048',tx+a*.85,.37,tz+b*.37,.07,.72,.07);M(box,'#f2ece2',tx,.775,tz,1.5,.006,.34);
      for(const a of [-.35,.35]){M(gCyl,'#f4efe4',tx+a,.86,tz,.035,.16,.035);M(gCone,'#ffd27a',tx+a,.97,tz,.02,.06,.02,0,0,0,1)}M(gSph,'#7a9a5a',tx,.82,tz,.1,.06,.1);
      for(const [a,b,c] of [[-.62,.25,'#c46a4a'],[0,.25,'#efe6d6'],[.62,.25,'#6f8fb0'],[-.62,-.25,'#efe6d6'],[0,-.25,'#d6b878'],[.62,-.25,'#c46a4a']])M(gCyl,c,tx+a,.81,tz+b,.045,.09,.045);
      HI.seats=[];[-1,1].forEach(sd=>[-.62,0,.62].forEach((k,ki)=>{const x=tx+k,z=tz+sd*.78,col=(ki+(sd>0?1:0))%2?'#c9a56e':'#7d9aa8',bz=z+sd*.2;
        M(box,col,x,.45,z,.44,.05,.42);for(const a of [-1,1])for(const b of [-1,1])M(box,col,x+a*.18,.22,z+b*.17,.04,.44,.04);for(const a of [-1,1])M(box,col,x+a*.18,.72,bz,.045,.55,.045);M(box,col,x,.97,bz,.44,.07,.05);for(const a of [-.08,0,.08])M(box,col,x+a,.74,bz,.025,.45,.025);
        M(box,'#efe6d6',x,.485,z,.36,.03,.34);const hit=M(box,'#000',x,.6,z,.62,1.2,.62);hit.material.visible=false;hit.userData.seat=1;HI.seats.push({px:x,pz:z,a:sd>0?Math.PI:0,ax:x,az:tz+sd*1.32,hit})}));
      // đèn thả trên bàn
      M(gCyl,'#222326',tx,2.65,tz,.01,1.5,.01);M(gCone,'#f2efe8',tx,1.86,tz,.3,.22,.3);M(gSph,'#ffe2a8',tx,1.74,tz,.08,.08,.08,0,0,0,1);{const l=new THREE.PointLight('#ffd9a8',7,9,1.4);l.position.set(tx,1.6,tz);g.add(l)}}
    // góc bếp nhỏ ở vách phải: tủ trắng, mặt gỗ, hũ và chén, kệ đĩa
    {const kx=W/2-.31,kz=-1.33;M(box,WH,kx,.43,kz,.6,.86,2.0);M(box,WOOD,kx-.02,.89,kz,.66,.05,2.06);for(const i of [-1,0,1]){M(box,'#e6dfd2',kx-.305,.45,kz+i*.64,.01,.7,.58);M(gSph,'#9a7a56',kx-.32,.62,kz+i*.64+.2,.025,.025,.025)}
      for(let i=0;i<4;i++)M(gCyl,['#3d6fb0','#efe6d6','#c46a4a','#d6b878'][i],kx,.98+i%2*.02,kz+.45+i*.15,.06,.14+i%2*.04,.06);M(box,'#9a7048',kx-.05,.93,kz-.6,.35,.03,.45);
      M(box,WOOD,W/2-.13,1.85,-.25,.24,.04,.6);for(let i=0;i<3;i++)M(gCyl,i%2?'#3d6fb0':'#efe6d6',W/2-.1,2.0,-.45+i*.2,.09,.01,.09,0,0,Math.PI/2)}
    // ghế băng dưới cửa sổ nhìn ra hồ: đệm đỏ trắng, gối
    {const bz=D/2-.27;M(box,WOOD,0,.42,bz,3.9,.06,.5);M(box,'#9a7048',0,.2,bz,3.8,.4,.42);for(const [x,c] of [[-1.3,'#b8322c'],[0,'#efe6d6'],[1.3,'#b8322c']])M(box,c,x,.5,bz,1.25,.1,.46);for(const [x,c] of [[-1.7,'#efe6d6'],[1.6,'#7d9aa8']])M(box,c,x,.66,bz+.12,.42,.3,.12,-.2,0,0)}
    // ghế bành đọc sách ở góc, chăn len, bàn nhỏ có sách và ly
    {const ax=-2.55,az=1.75;M(box,'#8a5e3a',ax,.25,az,.8,.4,.75);M(box,'#5f7a6a',ax,.5,az,.72,.14,.68);M(box,'#5f7a6a',ax-.05,.85,az+.32,.72,.65,.14,-.15,0,0);for(const s2 of [-1,1])M(box,'#5f7a6a',ax+s2*.38,.65,az,.12,.35,.7);M(box,'#b8322c',ax+.1,.62,az-.1,.5,.04,.5,0,.3,0);
      M(gCyl,WOOD,ax+.75,.3,az-.1,.2,.6,.2);M(box,'#3d5f8a',ax+.75,.63,az-.1,.22,.05,.16,0,.4,0);M(gCyl,'#efe6d6',ax+.82,.66,az-.2,.04,.08,.04)}
    HI.light=new THREE.PointLight('#ff9a50',HI.li,7,1.5);HI.light.position.set(HI.st[0]+.7,.7,HI.st[1]);g.add(HI.light);{const l2=new THREE.PointLight('#ffd9a8',3,9,1.6);l2.position.set(0,3.4,0);g.add(l2)}
    sc.add(g);HI.g=g}
  // ---------- Hoạt động ở gian Bạn đồng hành (khoảng 1 phút) ----------
  // Ann Candle · Thắp một ngọn nến bình an: chọn nến hoa sen, chạm để thắp, nhìn lửa qua 3 hơi thở, viết lời nguyện bình an (lưu Nhật ký).
  // MsSlim · Một miếng cơm chánh niệm: cầm bát cơm tím, nhìn màu cơm, thở một hơi, nhai chậm 30 nhịp, nói lời cảm ơn bữa ăn.
  // Không có lời hứa công dụng (giảm cân, chữa bệnh, vận may), chỉ thực hành chánh niệm. Quà cảm ơn sẽ nối khi kho quà mở.
  const baEl=document.createElement('div');baEl.className='sn-wish sn-ba';baEl.hidden=true;box.appendChild(baEl);baEl.addEventListener('pointerdown',e=>e.stopPropagation());baEl.addEventListener('keydown',e=>e.stopPropagation());
  let baT=[];const baClear=()=>{baT.forEach(clearTimeout);baT.forEach(clearInterval);baT=[]};
  const baEsc=t=>String(t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const baShow=(h)=>{baEl.innerHTML=h+'<button type="button" class="ba-x" data-bax aria-label="Đóng">✕</button>';baEl.hidden=false};
  const baBreath=(n,cb,label)=>{let i=0;const step=()=>{if(i>=n){cb();return}i++;baShow('<b>'+label+'</b><div class="ba-orb in"></div><p class="bp ba-c">Hít vào… ('+i+'/'+n+')</p>');baT.push(setTimeout(()=>{const c=baEl.querySelector('.ba-c'),o=baEl.querySelector('.ba-orb');if(c)c.textContent='Thở ra… ('+i+'/'+n+')';if(o)o.className='ba-orb out'},4000));baT.push(setTimeout(step,8500))};step()};
  const CANDLES=[['#bfe3d6','Sen ngọc bích'],['#d9c7e6','Sen oải hương'],['#f3e6c4','Sen kem'],['#f2c9d2','Sen hồng phấn']];
  function boothAct(th){baClear();capEl.classList.remove('on');
    if(th==='candle'){baShow('<b>🕯 Ann Candle · Thắp một ngọn nến bình an</b><p class="bp">Chọn một ngọn nến hoa sen bạn thích.</p><div class="wr">'+CANDLES.map((c,i)=>'<button type="button" data-bc="'+i+'"><i class="ba-dot" style="background:'+c[0]+'"></i>'+c[1]+'</button>').join('')+'</div>');return}
    baShow('<b>🍚 MsSlim · Một miếng cơm chánh niệm</b><p class="bp">Một bát cơm gạo lứt tím còn ấm. Mời bạn nâng bát lên bằng cả hai tay.</p><div class="rw"><button type="button" class="go" data-br="1">Nâng bát lên</button></div>')}
  const candleLit=(i)=>{const c=CANDLES[i];baShow('<b>🕯 '+c[1]+'</b><div class="ba-candle" style="--c:'+c[0]+'"><span></span></div><p class="bp">Ngọn nến đã sẵn sàng. Chạm để thắp.</p><div class="rw"><button type="button" class="go" data-blit="'+i+'">Thắp nến</button></div>')};
  const candleBreath=(i)=>{const c=CANDLES[i];baShow('<b>🕯 '+c[1]+'</b><div class="ba-candle on" style="--c:'+c[0]+'"><span></span></div><p class="bp">Nhìn ngọn lửa. Để hơi thở tự chậm lại.</p>');baT.push(setTimeout(()=>baBreath(3,()=>candleWish(i),'🕯 Nhìn ngọn lửa, thở cùng ngọn lửa'),3000))};
  const PRAY=['Mong mình bình an','Mong gia đình mạnh khoẻ','Mong người thương luôn vui','Mong mọi người bớt khổ'];
  const candleWish=(i)=>{baShow('<b>🕯 Một lời nguyện bình an</b><p class="bp">Cho mình, hoặc cho một người bạn thương.</p><div class="wr">'+PRAY.map(t=>'<button type="button" data-bp="'+baEsc(t)+'">'+t+'</button>').join('')+'</div><input maxlength="120" placeholder="Viết lời nguyện bằng lời của bạn"><div class="rw"><button type="button" class="go" data-bpok="'+i+'">Gửi lời nguyện</button></div>')};
  const riceLook=()=>{baShow('<b>🍚 Nhìn bát cơm</b><div class="ba-bowl"></div><p class="bp">Màu tím sẫm của gạo lứt, hạt cơm mềm, hơi ấm toả lên. Chỉ nhìn thôi, chưa vội ăn.</p>');baT.push(setTimeout(()=>baBreath(1,riceChew,'🍚 Thở một hơi trước khi ăn'),6000))};
  const riceChew=()=>{let n=0;baShow('<b>🍚 Một miếng cơm, nhai thật chậm</b><div class="ba-bowl"></div><p class="bp">Nhai theo nhịp số. Để vị ngọt của hạt gạo hiện ra từ từ.</p><div class="ba-n">0</div><div class="rw"><button type="button" data-bthanks>Xong rồi</button></div>');const iv=setInterval(()=>{n++;const e=baEl.querySelector('.ba-n');if(e)e.textContent=n;if(n>=30){clearInterval(iv);riceThanks()}},1000);baT.push(iv)};
  const THANKS=['Cảm ơn người nông dân đã trồng lúa','Cảm ơn người đã nấu bữa ăn này','Cảm ơn cơ thể mình','Cảm ơn bữa ăn hôm nay'];
  const riceThanks=()=>{baClear();baShow('<b>🍚 Một lời cảm ơn bữa ăn</b><div class="wr">'+THANKS.map(t=>'<button type="button" data-bp="'+baEsc(t)+'">'+t+'</button>').join('')+'</div><input maxlength="120" placeholder="Hoặc viết lời cảm ơn của bạn"><div class="rw"><button type="button" class="go" data-btok>Gửi lời cảm ơn</button></div>')};
  const baDone=(title,line,quote)=>{if(window.__xuyenJournal)window.__xuyenJournal(quote,title);baShow('<b>'+title+'</b><p class="bp">'+line+'</p><div class="rw"><button type="button" class="go" data-bax>Về hội chợ</button></div>')};
  baEl.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const d=b.dataset;
    if(d.bax!=null){baClear();baEl.hidden=true;return}
    if(d.bc!=null){candleLit(+d.bc);return}
    if(d.blit!=null){candleBreath(+d.blit);return}
    if(d.bp!=null){const inp=baEl.querySelector('input');if(inp)inp.value=d.bp;baEl.querySelectorAll('[data-bp]').forEach(o=>o.classList.toggle('on',o===b));return}
    if(d.bpok!=null){const t=(baEl.querySelector('input').value.trim()||PRAY[0]).slice(0,120);baDone('🕯 Thắp một ngọn nến bình an','Ngọn nến '+CANDLES[+d.bpok][1].toLowerCase()+' đã thắp cùng lời nguyện của bạn, và được ghi vào Nhật ký. Cảm ơn bạn đã ghé gian Ann Candle.','Thắp một ngọn nến bình an ('+CANDLES[+d.bpok][1]+') ở gian Ann Candle, Hội Chợ Giáng Sinh Xứ Yên. Lời nguyện: '+t);return}
    if(d.br!=null){riceLook();return}
    if(d.bthanks!=null){riceThanks();return}
    if(d.btok!=null){const t=(baEl.querySelector('input').value.trim()||THANKS[3]).slice(0,120);baDone('🍚 Một miếng cơm chánh niệm','Lời cảm ơn của bạn đã được ghi vào Nhật ký. Bữa ăn tới, thử nhai chậm thêm một chút nhé. Cảm ơn bạn đã ghé gian MsSlim.','Một miếng cơm chánh niệm ở gian MsSlim, Hội Chợ Giáng Sinh Xứ Yên: nhìn, thở, nhai chậm 30 nhịp. Lời cảm ơn: '+t);return}});
  const PROX=[],proxM=new THREE.MeshBasicMaterial({visible:false});

  for(const [id,x,z,r,h,y0] of [['tree',TREE.x,TREE.z,6.5,27,1],['snowman',SNOWMAN.x,SNOWMAN.z,4.6,8,0],['wheel',WHEEL.x,WHEEL.z+3,WR,WY+WR,0],['carousel',CAR.x,CAR.z,6.4,8,0],['fire',25,77,1.6,2.4,0],['bell',...tw(10.5,1.5),2.6,6,1],['kota',KOTA.x,KOTA.z,KOTA.R+.6,6,0],['home',HOME.x,HOME.z,4.8,7,0]]){const m=new THREE.Mesh(gCyl,proxM);m.scale.set(r,h,r);m.position.set(x,H(x,z)+y0+h/2,z);m.userData.st=id;sc.add(m);PROX.push(m)}
  IGLOOS.forEach(([x,z],k)=>{const m=new THREE.Mesh(gCyl,proxM);m.scale.set(DR+2.2,6.5,DR+2.2);m.position.set(x,H(x,z)-.5+3.25,z);m.userData.st='aurora';m.userData.ig=k;sc.add(m);PROX.push(m)});/* 28/11: vùng chạm phủ cả vòm kính, sàn gỗ và bậc thềm của cả ba lều */
  {const a=Math.atan2(CAR.x-RH.x,CAR.z-RH.z),x=RH.x+Math.sin(a)*8.3,z=RH.z+Math.cos(a)*8.3,m=new THREE.Mesh(new THREE.BoxGeometry(1,1,1),proxM);m.scale.set(2.6,3.2,1.4);m.position.set(x,H(x,z)+1.6,z);m.rotation.y=a;m.userData.st='cocoa';sc.add(m);PROX.push(m)}/* 28/11: chỉ chạm đúng cửa Nhà Ấm tròn mới vào uống ly ấm */
  {const m=new THREE.Mesh(new THREE.BoxGeometry(1,1,1),proxM);m.scale.set(1.8,1.6,1.5);m.position.set(MOSSBIN.x,H(MOSSBIN.x,MOSSBIN.z)+.6,MOSSBIN.z);m.userData.st='deer';sc.add(m);PROX.push(m)}/* thùng rêu */
  const DEERHIT=DEERS.map((d,i)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(1,1,1),proxM);m.scale.set(1.4,d.lie?1.3:2.2,2.4);m.position.set(d.x,H(d.x,d.z)+(d.lie?.6:1.1),d.z);m.rotation.y=d.ry;m.userData.deer=i;sc.add(m);return m});
  ISEATS.forEach((q,i)=>{const [x,y,z,sx,sy,sz,ry]=q.hit,m=new THREE.Mesh(new THREE.BoxGeometry(1,1,1),proxM);m.scale.set(sx,sy,sz);m.position.set(x,y,z);m.rotation.y=ry;m.userData.st='isle';m.userData.seat=i;sc.add(m);PROX.push(m)});
  {const B=BRG,m=new THREE.Mesh(new THREE.BoxGeometry(1,1,1),proxM),qm=B.len/2;m.scale.set(B.len,2.6,3);m.position.set(B.ax+B.dx*qm,B.yAt(qm)+.4,B.az+B.dz*qm);m.rotation.y=B.ry;m.userData.st='bridge';sc.add(m);PROX.push(m)}
  for(const b of BOOTHS)if(b.th){const m=new THREE.Mesh(new THREE.BoxGeometry(1,1,1),proxM);m.scale.set(4,3.6,3.2);m.position.set(b.x,H(b.x,b.z)+1.8,b.z);m.rotation.y=b.ry;m.userData.st='booth_'+b.th;sc.add(m);PROX.push(m)}/* chạm gian hàng nhà tài trợ: tới trước quầy rồi bắt đầu hoạt động */
  const bridgeSet=()=>{const B=BRG,st=STATIONS.find(o=>o.id==='bridge'),e0=[B.ax-B.dx*.9,B.az-B.dz*.9],e1=[B.ax+B.dx*(B.len+1.2),B.az+B.dz*(B.len+1.2)],near0=Math.hypot(e0[0]-P.x,e0[1]-P.z)<Math.hypot(e1[0]-P.x,e1[1]-P.z);B.dir=near0?1:-1;[st.x,st.z]=near0?e0:e1};/* bấm cầu: tới đầu cầu gần mình rồi đi qua cầu sang đầu kia */
  const isleSet=i=>{isleSel=i;const q=ISEATS[i],st=STATIONS.find(o=>o.id==='isle');st.x=q.ax;st.z=q.az};
  function act(){const s=near;if(!s)return;P.dest=null;
    if(s.id==='bridge'){const B=BRG;P.mode='bridge';P.dest=null;P.bq=B.dir>0?-.9:B.len+1.2;P.a=Math.atan2(B.dx*B.dir,B.dz*B.dir);P.yaw=P.a+Math.PI;P.camAim=null;actBtn.hidden=true;stopBtn.hidden=true;near=null;caption(B.dir>0?'🌉 Đi qua cầu đá về bờ':'🌉 Đi qua cầu ra đảo giữa hồ',4000);return}
    if(s.id==='isle'){const q=ISEATS[isleSel];P.x=q.ax;P.z=q.az;auroraStart({pos:[q.x,q.y+1.05,q.z],yaw:q.a,back:[q.ax,q.az,q.a],msg:'✨ Ngồi trên đá giữa hồ ngắm cực quang'});return}
    if(s.id==='aurora'){roomEnter(GI);actBtn.hidden=true;stopBtn.hidden=false;stopBtn.textContent='🚪 Ra cửa';return}
    else if(s.id==='gift'){if(SR.ret){caption('🎅 Xe tuần lộc đang bay về trại, đợi xe đỗ rồi lên nhé.',3500);return}santaStart()}
    else if(s.id==='husky'){if(HK.run){caption('🐕 Đàn husky đang chạy về trại, đợi chúng về rồi lên xe nhé.',3500);return}P.mode='husky';P.ride=0;HK.d=0;HK.run=true;caption('🐕 Đàn husky đưa bạn qua rừng thông, vòng quanh vùng núi đá quanh đồi chùa, ghé chân núi trượt tuyết rồi về trại. Muốn xuống ở đâu thì bấm Xuống xe.',7000)}
    else if(s.id==='sled'){const o=sleds.filter(q=>q.st==='park'&&!q.rider).sort((a,b)=>Math.hypot(a.g.position.x-P.x,a.g.position.z-P.z)-Math.hypot(b.g.position.x-P.x,b.g.position.z-P.z))[0];if(!o){caption('🛷 Cả 3 xe đang chạy, đợi một chút xe về bến nhé.',4000);return}sledBoard(o,true);return}
    else if(s.id==='sit'){setSit(true);P.mode='sit';setIncense(true);{const c=tw(0,4.4);P.sitAt={x:c[0],z:c[1],y:H(TP.x,TP.z)+.92,a:TRY+Math.PI}}caption('🪷 Ngồi yên trước Phật. Mỗi hơi thở ra, thả lỏng đôi vai.',8000);breathEl.hidden=false;bell()}
    else if(s.id==='fire'){setSit(true);P.mode='sit';P.sitAt={x:25,z:79.1,y:H(25,79.1)+.5,a:Math.PI};P.yaw=.75;first=true;caption('🔥 Hơ tay bên lửa. Nếu muốn, viết ra một điều bạn muốn buông và thả vào lửa.',7000);setTimeout(()=>{if(P.mode==='sit'&&P.sitAt&&P.sitAt.z>70)letOpen()},1200)}
    else if(s.id==='cocoa'){setSit(true);P.mode='sit';P.sitAt={x:s.x,z:s.z,y:H(s.x,s.z)+.5,a:s.a,cup:1};P.yaw=s.a;first=true;cup.visible=true;caption('☕ Hai tay ôm ly cacao nóng. Hít mùi thơm, thở ra làn hơi ấm. Uống từng ngụm nhỏ.',8000)}
    else if(s.id==='stars'){const y=H(s.x,s.z);auroraStart({pos:[s.x,y+.7,s.z],yaw:Math.PI,back:[s.x,s.z,Math.PI],msg:'🌌 Nằm ngửa trên tuyết ngắm trời sao và cực quang. Đếm mười hơi thở chậm'});camLift=1.6;return}/* như các chỗ ngắm khác: kéo xoay nhìn cả bầu trời */
    else if(s.id==='bell'){bell();caption('🪷 Chắp tay trước tượng Phật giữa rừng thông tuyết. Một tiếng chuông nhỏ, rồi lắng nghe sự tĩnh lặng.',7000);return}
    else if(s.id==='deer'){feedTake();return}
    else if(s.id==='carousel'){P.mode='carousel';P.ride=0;caption('🎠 Vòng ngựa gỗ quay thật chậm, nhìn đèn lướt qua.',6000)}
    else if(s.id==='kota'){kotaEnter()}
    else if(s.id==='home'){roomEnter(HI)}
    else if(s.id==='snowman'){const m=snowmanBuild();P.mode='build';P.x=m.me[0];P.z=m.me[1];P.a=Math.atan2(m.sp.x-P.x,m.sp.z-P.z);P.yaw=m.yaw;P.camAim=null;first=true;near=null}
    else if(s.id==='booth_candle'||s.id==='booth_rice'){const b=BOOTHS.find(o=>'booth_'+o.th===s.id);P.dest=null;P.a=Math.atan2(b.x-P.x,b.z-P.z);P.yaw=P.a+Math.PI;P.camAim=null;actBtn.hidden=true;boothAct(b.th);return}
    else if(s.id==='tree'){P.dest=null;P.x=TREE_SPOT[0];P.z=TREE_SPOT[1];P.a=Math.atan2(TREE.x-P.x,TREE.z-P.z);P.yaw=P.a+Math.PI;P.camAim=null;treeView=true;actBtn.hidden=true;wishOpen();wishEl.classList.add('tv');return}/* treo điều ước: đứng ở góc trước cây, camera lùi xa nhìn trọn cây từ gốc tới ngôi sao */
    else if(s.id==='skate'){P.mode='skate';SK.vx=SK.vz=0;const GA=Math.atan2(s.z-RINK.z,s.x-RINK.x);P.x=RINK.x+Math.cos(GA)*(RINK.rx-2);P.z=RINK.z+Math.sin(GA)*(RINK.rz-2);P.yaw=Math.atan2(Math.cos(GA),Math.sin(GA));P.a=P.yaw+Math.PI;first=true;caption('⛸ Chạm vào mặt băng để lướt tới. Lướt dài, thở dài, để cơ thể tự cân bằng.',7000)}
    else if(s.id==='wheel'){P.mode='wheel';P.ride=0;setSit(true);WV.fov=cam.fov;WV.zoom=camZoom;WV.lift=camLift;P.yaw=.55;camLift=1.1;camZoom=1.6;camZoomS=1.6;me.visible=false;caption('🎡 Vòng quay lên rất chậm. Kéo ngang để quay nhìn mọi hướng, kéo dọc để ngước lên hay nhìn xuống làng, chụm hai ngón hoặc lăn chuột để phóng to',9000)}
    actBtn.hidden=true;stopBtn.hidden=false;stopBtn.textContent=P.mode==='kota'?'🚪 Ra cửa':P.mode==='stars'?'↩ Ngồi dậy':P.mode==='skate'?'⛸ Rời sân băng':P.mode==='build'?'↩ Dừng đắp':['husky','sled','carousel','wheel','santa'].includes(P.mode)?'⏹ Xuống xe':'↩ Đứng dậy'}
  function sledBoard(o,fromAct){mySled=o;sledPick=null;sledStart(o,'me');P.mode='sled';P.ride=0;P.dest=null;setSit(true);near=null;actBtn.hidden=true;stopBtn.hidden=false;stopBtn.textContent='⏹ Xuống xe';caption('🛷 Xe chạy vòng sát bờ hồ. Muốn lên bờ thì bấm vào bờ chỗ bạn thích.',6000)}
  const HK={d:0,run:false,len:(()=>{let t=0;for(let i=0;i+1<HL.length;i++)t+=Math.hypot(HL[i+1][0]-HL[i][0],HL[i+1][1]-HL[i][1]);return t})()};
  function stand(fin){if(FEED.on&&P.mode==='walk'){feedEnd('🦌 Bạn dừng cho ăn. Tuần lộc nhìn theo, khẽ lắc sừng.');return}if(P.mode==='santa'&&SR.on&&!fin){santaEnd(true);setSit(false);P.mode='walk';me.visible=true;me.rotation.set(0,me.rotation.y,0);const hl=homeLand();P.x=hl.out[0];P.z=hl.out[1];P.dest=null;P.a=HOME.ry;first=true;stopBtn.hidden=true;actBtn.hidden=true;caption('🏡 Bạn xuống xe ở Nhà Mái Cỏ. Xe tuần lộc tự bay về trại.',4500);return}/* bấm xuống xe: thoát hoạt động ngay, đứng ở tư gia */if(P.mode==='sled'&&mySled){const o=mySled;if(o.st==='park'||o.st==='merge'&&o.to===SDOCK[o.k].m&&Math.hypot(o.g.position.x-SDOCK[o.k].p[0],o.g.position.z-SDOCK[o.k].p[1])<1.5){o.st='park';o.rider=null;mySled=null}else{const [x,z]=sAt(o.s+12);sledLand(...lakeShore(sAt(o.s+12)[3],3));return}}const m=P.mode;if(m==='build'){wishEl.hidden=true;if(myMan)sc.remove(myMan.pg);myMan=null}/* rời bãi đắp: cất đồ còn bày trên tuyết */if(m==='aurora'&&AUR.on){auroraEnd();return}if(m==='wheel'){cam.fov=WV.fov;cam.updateProjectionMatrix();camZoom=WV.zoom;camZoomS=camZoom;camLift=WV.lift;me.visible=true;first=true;P.yaw=Math.PI/2}if(m==='kota'){P.mode='walk';kotaExit();actBtn.hidden=true;stopBtn.hidden=true;near=null;return}if(m==='build'&&myMan){const mm=myMan;sc.remove(mm.pg);for(const f of mm.fly)f.t=1;for(const k in mm.parts){const o=mm.parts[k];if(o.visible){o.scale.setScalar(o.userData.r||1);o.position.set(0,o.userData.h||0,0)}}if(!mm.n){sc.remove(mm.g);const i=colliders.indexOf(mm.sp.c);if(i>=0)colliders.splice(i,1);mm.sp.g=null}myMan=null}/* dừng giữa chừng: giữ đúng phần mình đã đắp */if(m==='skate'||m==='stars'){me.rotation.x=me.rotation.z=0}cup.visible=false;setIncense(false);wishEl.hidden=true;P.mode='walk';breathEl.hidden=true;U.boost.value=1;me.visible=true;labels.forEach(l=>l.visible=true);me.rotation.set(0,me.rotation.y,0);stopBtn.hidden=true;
    setSit(false);const st=id=>{const q=STATIONS.find(s=>s.id===id);return [q.x,q.z]},back={stars:st('stars'),skate:st('skate'),build:st('snowman'),santa:st('gift'),aurora:st('aurora'),husky:fin?st('husky'):null,sled:st('sled'),carousel:st('carousel'),wheel:st('wheel'),sit:P.sitAt&&P.sitAt.cup?st('cocoa'):P.sitAt&&P.sitAt.z<-50?st('sit'):st('fire')}[m];if(back){P.x=back[0];P.z=back[1]}if(m==='husky'&&!fin){P.x+=Math.cos(huskyG.rotation.y)*3;P.z-=Math.sin(huskyG.rotation.y)*3;caption('🐕 Bạn xuống xe ngay tại đây. Đàn husky tự chạy về trại.',4000)}/* xuống xe husky: ở lại đúng chỗ, đứng cạnh xe */P.sitAt=null;
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
  // ---------- Xem trước trang phục (28/11): dáng đứng và dáng ngồi ngay trong bảng chọn, đổi kiểu hay màu là thấy liền.
  // Dùng chung renderer của cảnh, không mở thêm WebGL: ngay trước khi vẽ cảnh, vẽ nhân vật vào một góc khung hình rồi chép sang khung xem trước. Chỉ vẽ lại khi đổi kiểu hoặc màu ----------
  const PV={dirty:false,cv:document.createElement('canvas'),W:300,H:150,sc:new THREE.Scene(),cam:new THREE.PerspectiveCamera(30,1,.1,30),sz:new THREE.Vector2()};
  PV.cv.width=PV.W*2;PV.cv.height=PV.H*2;PV.cv.className='sn-pv';PV.cv.setAttribute('role','img');PV.cv.setAttribute('aria-label','Xem trước trang phục: dáng đứng và dáng ngồi');
  {const q=PV.sc;q.background=new THREE.Color('#15243b');q.add(new THREE.HemisphereLight('#fff4e6','#4a5a78',1.9));const d=new THREE.DirectionalLight('#fff0dc',1.5);d.position.set(1.5,4,4);q.add(d);const rim=new THREE.DirectionalLight('#cfe0ff',.7);rim.position.set(-3,2,-3);q.add(rim);
    const disc=new THREE.Mesh(new THREE.CylinderGeometry(.8,.85,.06,40),new THREE.MeshLambertMaterial({color:'#e9eef6'}));disc.position.y=-.03;q.add(disc)}
  function pvRender(){PV.dirty=false;const W=PV.W,H=PV.H,pr=R.getPixelRatio();R.getSize(PV.sz);if(PV.sz.x<W||PV.sz.y<H)return;
    const par=me.parent,p0=me.position.clone(),r0=me.rotation.clone(),v0=me.visible,s0=!!WEAR.sit;
    PV.sc.add(me);me.position.set(0,0,0);me.visible=true;PV.cam.aspect=W/2/H;PV.cam.updateProjectionMatrix();PV.cam.position.set(0,1.45,4.5);PV.cam.lookAt(0,.86,0);R.setScissorTest(true);
    for(const sit of [false,true]){setSit(sit);me.rotation.set(0,sit?-.45:.45,0);const x=sit?W/2:0;R.setViewport(x,0,W/2,H);R.setScissor(x,0,W/2,H);R.render(PV.sc,PV.cam)}
    R.setScissorTest(false);R.setViewport(0,0,PV.sz.x,PV.sz.y);
    try{PV.cv.getContext('2d').drawImage(cv,0,cv.height-H*pr,W*pr,H*pr,0,0,PV.cv.width,PV.cv.height)}catch(e){}
    setSit(s0);par.add(me);me.position.copy(p0);me.rotation.copy(r0);me.visible=v0}
  // ---------- hàng nút đứng bên phải: Hoạt động · Trang phục · Âm nhạc · Nhật ký ----------
  {const rail=document.createElement('div');rail.className='sn-rail';rail.innerHTML=[['act','🧭','Hoạt động'],['outfit','🧥','Trang phục'],['music','🎵','Âm nhạc'],['journal','📔','Nhật ký']].map(([k,i,t])=>'<button type="button" data-rl="'+k+'" aria-label="'+t+'"><span>'+i+'</span><small>'+t+'</small></button>').join('');
    const sheet=document.createElement('div');sheet.className='sn-sheet';sheet.hidden=true;box.append(rail,sheet);let cur=null;
    const close=()=>{sheet.hidden=true;cur=null;rail.querySelectorAll('button').forEach(b=>b.classList.remove('on'))};
    const head=t=>'<div class="sn-sh"><b>'+t+'</b><button type="button" data-rl="x">✕</button></div>';
    // Hoạt động: chia theo "Hôm nay, bạn cần gì?"; hoạt động đã có thì tới nơi và bắt đầu luôn, hoạt động đang dựng thì đưa tới nơi và báo sắp mở
    const ACTS=[['🕊 Tìm bình an',[['incense','🪷','Lên núi dâng hương Phật','sit'],['aurora','✨','Ngắm cực quang, thở theo nhịp sáng','aurora'],['fire','🔥','Ngồi bên đống lửa','fire'],['glass','🛖','Nghỉ trong lều kính','aurora'],['cocoa','☕','Ly ấm ở Nhà Ấm tròn','cocoa'],['stars','🌌','Nằm tuyết ngắm sao','stars'],['tree','🎄','Treo điều ước lên cây thông','tree'],['home','🏡','Về Nhà Mái Cỏ Riêng','home']]],
      ['🎿 Dạo chơi',[['husky','🐕','Dạo xe chó husky','husky'],['sled','🛷','Xe trượt trên Hồ Băng Lớn','sled'],['skate','⛸','Trượt băng','skate'],['wheel','🎡','Vòng quay ngắm làng','wheel'],['carousel','🎠','Vòng ngựa gỗ','carousel']]],
      ['💝 Kết nối',[['gift','🎁','Chuyến xe trao Yên cùng ông già Noel','gift'],['snowman','⛄','Đắp người tuyết','snowman'],['deer','🦌','Cho tuần lộc ăn','deer']]]];
    const goAct=(st,pos,label)=>{close();if(P.mode!=='walk')stand();let x,z;if(st){const s=STATIONS.find(o=>o.id===st);x=s.x;z=s.z}else[x,z]=pos;
      for(let k=0;k<12&&blocked(x,z);k++){x+=Math.cos(k)*1.2;z+=Math.sin(k)*1.2}P.x=x;P.z=z;P.dest=null;first=true;
      if(st){near=STATIONS.find(o=>o.id===st);setTimeout(()=>{near=STATIONS.find(o=>o.id===st);act()},350)}else caption(label+' · hoạt động này đang được dựng, sắp mở. Bạn cứ dạo quanh đây nhé.',6000)};
    const renderAct=()=>head('Hôm nay, bạn cần gì?')+ACTS.map(([g,list],gi)=>'<div class="sn-gr">'+g+'</div><div class="sn-grid">'+list.map((a,ai)=>'<button type="button" data-ac="'+gi+','+ai+'"><span>'+a[1]+'</span>'+a[2]+(a[3]?'':'<em>sắp mở</em>')+'</button>').join('')+'</div>').join('');
    // Trang phục mùa đông: chọn kiểu (Thiền phục và 4 bộ mùa đông) và 1 trong 6 màu chung; lưu trên máy
    const OUT_KEY='xuyen-outfit';
    let outfit={style:'robe',color:WEAR_COLORS.some(c=>c[1]===prof.color)?prof.color:'#687b48'};try{const o=JSON.parse(localStorage.getItem(OUT_KEY)||'{}');if(WEAR_STYLES.some(w=>w[0]===o.style))outfit.style=o.style;if(WEAR_COLORS.some(c=>c[1]===o.color))outfit.color=o.color}catch(e){}
    const applyOutfit=()=>{wearApply(outfit.style,outfit.color);try{localStorage.setItem(OUT_KEY,JSON.stringify({style:outfit.style,color:outfit.color,hat:'#efe6d6',scarf:outfit.color}))}catch(e){}};applyOutfit();
    const renderOut=()=>head('🧥 Trang phục mùa đông')+'<div class="sn-pvw"><div class="sn-pvc" aria-hidden="true"><span>Đứng</span><span>Ngồi</span></div></div><div class="sn-gr">Màu sắc</div><div class="sn-sw">'+WEAR_COLORS.map(([n,c])=>'<button type="button" data-ot="color" data-c="'+c+'" style="background:'+c+'"'+(outfit.color===c?' class="on"':'')+' aria-label="Màu '+n+'" title="'+n+'"></button>').join('')+'</div>'+
      '<div class="sn-gr">Kiểu trang phục</div><div class="sn-grid wear">'+WEAR_STYLES.map(([id,ic,n,d])=>'<button type="button" data-ot="style" data-c="'+id+'"'+(outfit.style===id?' class="on"':'')+'><span>'+ic+'</span>'+n+'<em>'+d+'</em></button>').join('')+'</div>'+'<p class="sn-note">Trang phục lưu trên máy này, chỉ dùng trong Xứ Yên.</p>';
    // Âm nhạc: hộp nhạc tổng hợp ngay trong trình duyệt (giai điệu dân gian, đã hết bản quyền), không dùng bản thu của ai
    const MUS_KEY='xuyen-music';let music='off';try{music=localStorage.getItem(MUS_KEY)||'off'}catch(e){}
    const N={C3:130.81,D3:146.83,E3:164.81,F3:174.61,G3:196,A3:220,B3:246.94,C4:261.63,D4:293.66,E4:329.63,F4:349.23,G4:392,A4:440,B4:493.88,C5:523.25,D5:587.33,E5:659.25,F5:698.46,G5:783.99};
    const SONGS={
      jingle:{name:'Jingle Bells · vui',beat:.3,gap:1.2,mel:'E4 1 E4 1 E4 2 E4 1 E4 1 E4 2 E4 1 G4 1 C4 1.5 D4 .5 E4 4 F4 1 F4 1 F4 1.5 F4 .5 F4 1 E4 1 E4 1 E4 .5 E4 .5 E4 1 D4 1 D4 1 E4 1 D4 2 G4 2 E4 1 E4 1 E4 2 E4 1 E4 1 E4 2 E4 1 G4 1 C4 1.5 D4 .5 E4 4 F4 1 F4 1 F4 1.5 F4 .5 F4 1 E4 1 E4 1 E4 .5 E4 .5 G4 1 G4 1 F4 1 D4 1 C4 4',bass:'C3 4 C3 4 C3 4 C3 4 F3 4 C3 4 G3 4 G3 4 C3 4 C3 4 C3 4 C3 4 F3 4 C3 4 G3 4 C3 4',soft:0},
      silent:{name:'Silent Night · sâu lắng',beat:.3,gap:2.4,mel:'G4 3 A4 1 G4 2 E4 6 G4 3 A4 1 G4 2 E4 6 D5 4 D5 2 B4 6 C5 4 C5 2 G4 6 A4 4 A4 2 C5 3 B4 1 A4 2 G4 3 A4 1 G4 2 E4 6 A4 4 A4 2 C5 3 B4 1 A4 2 G4 3 A4 1 G4 2 E4 6 D5 4 D5 2 F5 3 D5 1 B4 2 C5 6 E5 6 C5 3 G4 1 E4 2 G4 3 F4 1 D4 2 C4 12',bass:'C3 12 C3 12 G3 12 C3 12 F3 12 C3 12 F3 12 C3 12 G3 12 C3 12 C3 6 G3 6 C3 12',soft:1}};
    const parse=s=>{const a=s.trim().split(/\s+/),r=[];for(let i=0;i<a.length;i+=2)r.push([N[a[i]],+a[i+1]]);return r};
    let mus=null;const stopMusic=()=>{if(mus){clearInterval(mus.iv);try{mus.g.gain.setTargetAtTime(0,ac.currentTime,.3);const g=mus.g;setTimeout(()=>g.disconnect(),1500)}catch(e){}mus=null}};
    const tone=(g,f,t,d,soft,vol)=>{for(const [m,a] of soft?[[1,1],[2,.18]]:[[1,1],[2,.32],[3.01,.12]]){const o=ac.createOscillator(),e=ac.createGain();o.type=soft&&m===1?'triangle':'sine';o.frequency.value=f*m;e.gain.setValueAtTime(0,t);e.gain.linearRampToValueAtTime(vol*a,t+(soft?.06:.008));e.gain.exponentialRampToValueAtTime(.0004,t+Math.max(d,soft?1.6:1.1));o.connect(e).connect(g);o.start(t);o.stop(t+Math.max(d,1.8)+.1)}};
    const playMusic=id=>{stopMusic();if(id==='off')return;try{ac=ac||new (window.AudioContext||window.webkitAudioContext)();if(ac.state==='suspended')ac.resume()}catch(e){return}
      const S0=SONGS[id],mel=parse(S0.mel),bas=parse(S0.bass),g=ac.createGain();g.gain.value=.5;g.connect(ac.destination);const len=mel.reduce((s,n)=>s+n[1],0)*S0.beat+S0.gap;
      const evs=[];{let t=0;for(const [f,b] of mel){evs.push([t,f,b*S0.beat,0,.11]);t+=b*S0.beat}t=0;for(const [f,b] of bas){evs.push([t,f,b*S0.beat,1,.05]);t+=b*S0.beat}}evs.sort((a,b)=>a[0]-b[0]);
      const m={g,t0:ac.currentTime+.15,i:0,loop:0};m.iv=setInterval(()=>{const now=ac.currentTime;while(true){const e=evs[m.i];const at=m.t0+m.loop*len+e[0];if(at>now+.6)break;if(at>now-.05)tone(g,e[1],at,e[2],S0.soft||e[3],e[4]);m.i++;if(m.i>=evs.length){m.i=0;m.loop++}}},150);mus=m};
    const setMusic=id=>{music=id;try{localStorage.setItem(MUS_KEY,id)}catch(e){}playMusic(id)};
    if(music!=='off'){const kick=()=>{playMusic(music);box.removeEventListener('pointerdown',kick)};box.addEventListener('pointerdown',kick)}
    const renderMus=()=>head('🎵 Âm nhạc')+'<div class="sn-grid one">'+[['jingle','🔔',SONGS.jingle.name],['silent','🕯',SONGS.silent.name],['off','🔇','Im lặng']].map(([k,i,t])=>'<button type="button" data-mu="'+k+'"'+(music===k?' class="on"':'')+'><span>'+i+'</span>'+t+'</button>').join('')+'</div><p class="sn-note">Giai điệu Giáng sinh dân gian đã hết bản quyền, phát bằng tiếng hộp nhạc tổng hợp ngay trên máy.</p>';
    // Nhật ký: dùng chung Nhật ký An Yên (lưu trên máy)
    const JK='anyen_wish_journal_v1',readJ=()=>{try{const v=JSON.parse(localStorage.getItem(JK)||'[]');return Array.isArray(v)?v:[]}catch(e){return []}};
    const esc=s=>String(s||'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
    const renderJ=()=>{const j=readJ().slice(-40).reverse();return head('📔 Nhật ký An Yên')+'<textarea class="sn-ta" maxlength="400" placeholder="Hôm nay ở Xứ Yên, bạn thấy gì, nghĩ gì?"></textarea><div class="sn-row"><button type="button" data-jn="save" class="sn-gold">✍ Ghi vào nhật ký</button></div>'+(j.length?j.map(e=>'<article><b>'+esc(e.title||('🪷 '+e.lake))+'</b><small>'+new Date(e.at).toLocaleString('vi-VN')+'</small><p>'+esc(e.quote)+'</p></article>').join(''):'<p class="sn-note">Chưa có dòng nào. Viết dòng đầu tiên nhé.</p>')+'<p class="sn-note">Lưu riêng trên máy này, chung với Nhật ký An Yên của Làng Yên.</p>'};
    window.__xuyenJournal=(quote,title)=>{const e={lake:'Xứ Yên',quote:String(quote).slice(0,400),at:Date.now(),title:(title||'❄ Xứ Yên').slice(0,40)};window.dispatchEvent(new CustomEvent('anyen-journal-add',{detail:e}));setTimeout(()=>{const j=readJ();if(!j.some(x=>x.at===e.at&&x.quote===e.quote)){j.push(e);try{localStorage.setItem(JK,JSON.stringify(j.slice(-500)))}catch(err){}}if(cur==='journal')open('journal',1)},60)};
    const open=(k,force)=>{if(cur===k&&!force){close();return}cur=k;rail.querySelectorAll('button').forEach(b=>b.classList.toggle('on',b.dataset.rl===k));sheet.innerHTML=k==='act'?renderAct():k==='outfit'?renderOut():k==='music'?renderMus():renderJ();if(k==='outfit'){const w=sheet.querySelector('.sn-pvw');if(w){w.prepend(PV.cv);PV.dirty=true}}sheet.hidden=false;mapEl.hidden=true};
    rail.addEventListener('click',e=>{const b=e.target.closest('[data-rl]');if(b)open(b.dataset.rl)});
    sheet.addEventListener('pointerdown',e=>e.stopPropagation());sheet.addEventListener('keydown',e=>e.stopPropagation());
    sheet.addEventListener('click',e=>{const t=e.target.closest('button');if(!t)return;if(t.dataset.rl==='x'){close();return}
      if(t.dataset.ac){const [gi,ai]=t.dataset.ac.split(',').map(Number),a=ACTS[gi][1][ai];goAct(a[3],a[4],a[1]+' '+a[2]);return}
      if(t.dataset.ot){outfit[t.dataset.ot]=t.dataset.c;applyOutfit();open('outfit',1);return}
      if(t.dataset.mu){setMusic(t.dataset.mu);open('music',1);return}
      if(t.dataset.jn==='save'){const ta=sheet.querySelector('.sn-ta'),v=ta&&ta.value.trim();if(!v)return;window.__xuyenJournal(v);caption('📔 Đã ghi vào Nhật ký An Yên.',3000)}});
    window.__snowRail=k=>k?open(k,1):close();snowCleanup.push(()=>stopMusic())}
  mc.addEventListener('click',e=>{const r=mc.getBoundingClientRect(),u=(e.clientX-r.left)/r.width*MS,v=(e.clientY-r.top)/r.height*MS;let best=null,bd=40;for(const z of ZONES){const [a,b]=toM(z.x,z.z),d=Math.hypot(a-u,b-v);if(d<bd){bd=d;best=z}}if(best)goZone(best)});
  box.addEventListener('click',e=>{const a=e.target.closest('[data-sn]')?.dataset.sn;if(a==='xmas'||a==='snow'){FX[a]=!FX[a];applyFx()}else if(a==='map'){drawMap();mapEl.hidden=false}else if(a==='mapx')mapEl.hidden=true;else if(a==='home')close()});
  mapEl.addEventListener('click',e=>{if(e.target===mapEl)mapEl.hidden=true});

  // ---------- vòng lặp ----------
  const resize=()=>{const w=box.clientWidth||innerWidth,h=box.clientHeight||innerHeight;R.setSize(w,h,false);cam.aspect=w/h;cam.fov=cam.fov0||(w<h?66:56);cam.updateProjectionMatrix()};resize();addEventListener('resize',resize);
  let run=true,tl=performance.now(),camFix=null;const tgt=new THREE.Vector3(),cpos=new THREE.Vector3();
  const loop=()=>{if(!run)return;requestAnimationFrame(loop);const now=performance.now(),dt=Math.min(.05,(now-tl)/1000);tl=now;const t=now/1000;U.time.value=t;U.camP.value.copy(cam.position);
    // đàn husky và xe trượt chạy vòng (kể cả khi không ngồi trên xe)
    if(P.mode==='husky'||HK.run){HK.d+=dt*6.5;if(HK.d>=HK.len){HK.d=0;HK.run=false;if(P.mode==='husky'){stand(true)}}}const [hx,hz,hr]=along(HL,false,HK.d/HK.len);huskyG.position.set(hx,H(hx,hz),hz);{let dr=hr-huskyG.rotation.y;dr=Math.atan2(Math.sin(dr),Math.cos(dr));huskyG.rotation.y+=dr*Math.min(1,dt*3)}/* xe chạy hết vòng thì về trại; khách xuống giữa đường thì đàn chó tự chạy tiếp về trại */
    dogs.forEach((d,i)=>{d.position.y=P.mode==='husky'?Math.abs(Math.sin(t*9+i))*.08:0});
    sledTick(dt);santaTick(dt);feedTick(dt);fxTick(dt);fxClock+=dt;if(fxClock>.22){fxClock=0;if(cup.visible)puff(cup.position.x+(Math.random()-.5)*.05,cup.position.y+.1,cup.position.z+(Math.random()-.5)*.05,{r:.05,vy:.3,life:2,g:1.7});if(insence.children.some(o=>o.userData.tip&&o.visible))puff(insence.position.x+(Math.random()-.5)*.12,insence.position.y+.88,insence.position.z,{r:.035,vy:.45,vx:Math.sin(t*.7)*.08,life:3.2,g:1.45})}
    carousel.rotation.y=t*.18;for(const h of horses)h.position.y=1.7+Math.sin(t*1.6+h.userData.ph)*.35;wheel.rotation.z=-t*.08;for(const g of gondolas){const a=g.userData.a;g.position.set(Math.cos(a)*WR,Math.sin(a)*WR,0);g.rotation.z=t*.08}if(fireFl){fireFl.scale.set(1+Math.sin(t*13)*.08,1+Math.sin(t*7.3)*.18,1+Math.cos(t*11)*.08);fireLight.intensity=12+Math.sin(t*9)*2+Math.sin(t*23)*1.2}
    if(P.mode==='walk'){let mvx=0,mvz=0;if(keys.size){const f=(keys.has('f')?1:0)-(keys.has('b')?1:0),s=(keys.has('r')?1:0)-(keys.has('l')?1:0),sy=Math.sin(P.yaw),cy=Math.cos(P.yaw);mvx=-sy*f+cy*s;mvz=-cy*f-sy*s}
      else if(P.dest){const dx=P.dest.x-P.x,dz=P.dest.z-P.z,d=Math.hypot(dx,dz);if(d<.15)P.dest=null;else{mvx=dx/d;mvz=dz/d}}
      if(mvx||mvz){const l=Math.hypot(mvx,mvz),spd=(P.dest&&Math.hypot(P.dest.x-P.x,P.dest.z-P.z)>30?6:2.6)*dt;mvx/=l;mvz/=l;let nx=P.x+mvx*spd,nz=P.z+mvz*spd;
        const c0=hitC(nx,nz),esc=c0&&Math.hypot(P.x-c0[0],P.z-c0[1])<c0[2]&&Math.hypot(nx-c0[0],nz-c0[1])>Math.hypot(P.x-c0[0],P.z-c0[1]);/* đang kẹt trong vật cản thì cho bước ra */
        if(c0&&!esc){const c=c0;const ox=P.x-c[0],oz=P.z-c[1],ol=Math.hypot(ox,oz)||1,tx=-oz/ol,tz=ox/ol,sg=Math.sign(tx*mvx+tz*mvz)||1;nx=P.x+tx*sg*spd;nz=P.z+tz*sg*spd;if(blocked(nx,nz)){nx=P.x;nz=P.z;P.dest=null;if(P.autoAct==='isle'){P.autoAct=null;near=STATIONS.find(o=>o.id==='isle');act()}}}/* ụ đá sau gốc thông trên đảo: vướng cây thì ngồi luôn */
        if(P.autoAct==='isle'&&P.dest){P.stk=Math.hypot(nx-P.x,nz-P.z)<spd*.35?(P.stk||0)+dt:0;if(P.stk>.7){P.stk=0;P.dest=null;P.autoAct=null;near=STATIONS.find(o=>o.id==='isle');act()}}/* bị gốc thông chắn quanh ụ đá: đứng khựng một lúc thì ngồi luôn */if(P.mode==='walk'&&Math.hypot(nx,nz)<230){P.x=nx;P.z=nz}P.a=Math.atan2(mvx,mvz);/* camera không tự xoay theo lúc đi; chỉ đặt lại một lần về sau lưng khi bấm điểm đến mới (P.camAim), vẫn trượt theo để giữ nhân vật giữa, 1/3 dưới */me.position.y=groundY(P.x,P.z)+Math.abs(Math.sin(t*8))*.04}else me.position.y=groundY(P.x,P.z);
      me.position.x=P.x;me.position.z=P.z;let da=P.a-me.rotation.y;da=Math.atan2(Math.sin(da),Math.cos(da));me.rotation.y+=da*Math.min(1,dt*10);
      if(P.camAim!=null){follow(P.camAim,dt,3);let d=P.camAim+Math.PI-P.yaw;d=Math.atan2(Math.sin(d),Math.cos(d));if(Math.abs(d)<.03||pts.size)P.camAim=null}
      near=null;for(const s of STATIONS)if(!s.tapOnly&&Math.hypot(s.x-P.x,s.z-P.z)<4.2){near=s;break}actBtn.hidden=!near||treeView||!baEl.hidden;if(near)actBtn.textContent=near.label;
      if(P.autoAct==='deerfeed'&&P.dest&&DEERS[FEED.tgt]&&Math.hypot(DEERS[FEED.tgt].x-P.x,DEERS[FEED.tgt].z-P.z)<7)P.dest=null;
      if(P.autoAct&&!P.dest){const id=P.autoAct;P.autoAct=null;if(id==='deerfeed'){const d=DEERS[FEED.tgt];if(d&&FEED.hold&&Math.hypot(d.x-P.x,d.z-P.z)<9)feedGive(FEED.tgt);else if(FEED.hold)caption('🦌 Chú này ở xa rào quá, chạm một chú gần hơn nhé.',3500)}else if(id==='sledpick'){const so=sledPick;if(so&&so.st==='park'&&!so.rider&&Math.hypot(so.g.position.x-P.x,so.g.position.z-P.z)<4.5)sledBoard(so)}else{const so=STATIONS.find(o=>o.id===id);if(so&&so.tapOnly&&Math.hypot(so.x-P.x,so.z-P.z)<1.5){near=so;act()}else if(near&&near.id===id)act()}}/* đã bấm vào đồ vật: tới nơi là bắt đầu luôn */
      tgt.set(P.x,me.position.y+1.5,P.z)}
    else if(P.mode==='husky'){me.position.copy(huskyG.position).add(_v.set(0,.35,-.1).applyAxisAngle(_v2.set(0,1,0),huskyG.rotation.y));me.rotation.set(0,huskyG.rotation.y,0);tgt.set(me.position.x,me.position.y+1.4,me.position.z);P.x=me.position.x;P.z=me.position.z}
    else if(P.mode==='santa'){me.position.copy(santaG.position).add(_v.set(.45,1.05,-.2).applyEuler(santaG.rotation));me.rotation.set(santaG.rotation.x,santaG.rotation.y,0);tgt.set(me.position.x,me.position.y+1.4,me.position.z);if(SR.wait){const c=SR.stops[SR.leg-1];if(c)tgt.set(c.x*.75+me.position.x*.25,c.y+.4,c.z*.75+me.position.z*.25)}P.x=me.position.x;P.z=me.position.z}
    else if(P.mode==='sled'&&mySled){const g=mySled.g;me.position.copy(g.position).add(_v.set(0,.5,mySled.seatZ).applyAxisAngle(_v2.set(0,1,0),g.rotation.y));me.rotation.set(0,g.rotation.y,0);tgt.set(me.position.x,me.position.y+1.4,me.position.z);P.x=me.position.x;P.z=me.position.z}
    else if(P.mode==='carousel'){P.ride+=dt;const a=-carousel.rotation.y;const h0=horses[1];me.position.set(CAR.x+Math.cos(a+h0.userData.q-.26)*h0.userData.r,carousel.position.y+h0.position.y+.1,CAR.z+Math.sin(a+h0.userData.q-.26)*h0.userData.r);me.rotation.set(0,-a+Math.PI,0);tgt.set(CAR.x,carousel.position.y+2,CAR.z);if(P.ride>50)stand()}
    else if(P.mode==='bridge'){const B=BRG,end=B.dir>0?B.len+1.2:-.9;P.bq+=B.dir*2.4*dt;const q=Math.max(0,Math.min(B.len,P.bq));P.x=B.ax+B.dx*P.bq;P.z=B.az+B.dz*P.bq;const gy=P.bq<0||P.bq>B.len?groundY(P.x,P.z):B.yAt(q)+.1;me.position.set(P.x,Math.max(gy,groundY(P.x,P.z))+Math.abs(Math.sin(t*8))*.04,P.z);let da=P.a-me.rotation.y;da=Math.atan2(Math.sin(da),Math.cos(da));me.rotation.y+=da*Math.min(1,dt*10);tgt.set(P.x,me.position.y+1.5,P.z);if(B.dir*(P.bq-end)>=0){P.mode='walk';P.dest=null}}/* đi bộ trên mặt cầu theo độ cong vòm */
    else if(P.mode==='wheel'){P.ride+=dt;const a=gondolas[0].userData.a+wheel.rotation.z;me.position.set(WHEEL.x+Math.cos(a)*WR,wheel.position.y+Math.sin(a)*WR-1.05,WHEEL.z);me.rotation.set(0,0,0);tgt.set(me.position.x,me.position.y+1.2,me.position.z);if(P.ride>78)stand()}/* ngồi cabin: tự do kéo xoay nhìn mọi hướng, không kéo camera về */
    else if(P.mode==='kota')kotaTick(dt,t);
    else if(P.mode==='skate')skateTick(dt,t);
    else if(P.mode==='stars'){P.ride+=dt;const s2=STATIONS.find(o=>o.id==='stars');me.position.set(s2.x,groundY(s2.x,s2.z)+.25,s2.z);me.rotation.set(-Math.PI/2,0,0);tgt.set(s2.x,me.position.y+1,s2.z)}
    else if(P.mode==='build'){buildTick(dt);if(P.mode==='build'){me.position.set(P.x,groundY(P.x,P.z)-Math.abs(Math.sin(t*3))*.12,P.z);me.rotation.set(0,P.a,0);if(P.camAim!=null){follow(P.camAim,dt,3)}tgt.set(P.x,me.position.y+1.5,P.z)}}
    else if(P.mode==='sit'){const s=P.sitAt;if(s.cup){cup.position.set(s.x+Math.sin(s.a)*.32,s.y+.62,s.z+Math.cos(s.a)*.32);cup.rotation.y=s.a}follow(s.a,dt);me.position.set(s.x,s.y,s.z);me.rotation.set(0,s.a,0);tgt.set(s.x,me.position.y+1.2,s.z)}
    // camera
    {const rf=P.mode==='husky'||P.mode==='santa'||P.mode==='sled'&&!!mySled;if(farBtn.hidden===rf)farBtn.hidden=!rf;if(!rf&&farView){farView=false;farBtn.textContent='🔭 Ngắm xe từ xa'}}
    if(treeView&&(wishEl.hidden&&performance.now()>treeHold||P.mode!=='walk'||P.dest||keys.size)){treeView=false;wishEl.hidden=true;wishEl.classList.remove('tv')}
    U.fadeR.value=0;if(camFix){cam.position.set(...camFix[0]);cam.lookAt(...camFix[1])}
    else if(treeView){const gy=H(TREE.x,TREE.z);cpos.set(TREE.x-3,gy+21,TREE.z+60);cam.position.lerp(cpos,1-Math.exp(-dt*2.2));cam.lookAt(TREE.x,gy+6.5,TREE.z);U.meP.value.set(P.x,me.position.y+1.4,P.z);U.fadeR.value=0}/* treo điều ước: nhìn trọn cây thông, bảng điều ước nằm thấp phía dưới */
    else if(P.mode==='kota'){const R=RM;camZoomS+=(camZoom-camZoomS)*Math.min(1,dt*7);const d=Math.min(3.4,3.0*camZoomS);const [cx,cz]=R.camClamp(tgt.x+Math.sin(P.yaw)*d-R.x,tgt.z+Math.cos(P.yaw)*d-R.z);cpos.set(R.x+cx,R.y+R.camY,R.z+cz);if(first){cam.position.copy(cpos);first=false}else cam.position.lerp(cpos,1-Math.exp(-dt*8));cam.lookAt(R.x*.35+tgt.x*.65,R.y+1.05,R.z*.35+tgt.z*.65);U.fadeR.value=0}
    else if(P.mode==='stars'){const s2=STATIONS.find(o=>o.id==='stars'),y=groundY(s2.x,s2.z)+.6;cam.position.set(s2.x,y,s2.z-.2);cam.lookAt(s2.x+Math.sin(P.ride*.04)*6,y+12,s2.z-9+Math.cos(P.ride*.05)*2)}
    else if(P.mode==='build'&&myMan){const m=myMan,k=Math.max(1,Math.pow(.75/cam.aspect,.7)),D=9.5*k,lx=m.sp.x+m.dx*2.2,lz=m.sp.z+m.dz*2.2,gy=H(m.sp.x,m.sp.z);cpos.set(m.sp.x+m.dx*D,gy+4.2*k,m.sp.z+m.dz*D);if(first){cam.position.copy(cpos);first=false}else cam.position.lerp(cpos,1-Math.exp(-dt*4));cam.lookAt(lx,gy+1.1,lz);U.meP.value.set(m.sp.x,gy+1.4,m.sp.z);U.fadeR.value=3.2}/* đắp người tuyết: nhìn từ phía bãi trống, thấy người tuyết phía sau và đồ bày trên tuyết phía trước để chạm chọn */
    else if(P.mode==='aurora'){P.ride+=dt;camZoomS+=(camZoom-camZoomS)*Math.min(1,dt*7);const pit=.12+(camLift-.35)/2.25*1.38,fv=25+(camZoomS-.45)/2.55*55;if(Math.abs(cam.fov-fv)>.01){cam.fov=fv;cam.updateProjectionMatrix()}cam.position.copy(AUR.pos);cam.lookAt(AUR.pos.x+Math.sin(P.yaw)*Math.cos(pit)*10,AUR.pos.y+Math.sin(pit)*10,AUR.pos.z+Math.cos(P.yaw)*Math.cos(pit)*10)}/* nằm trên giường lều kính: kéo ngang xoay nhìn quanh, kéo dọc ngước lên, chụm hoặc lăn chuột đổi góc nhìn rộng hẹp */
    else if(P.mode==='wheel'){camZoomS+=(camZoom-camZoomS)*Math.min(1,dt*7);const pit=-.55+(camLift-.35)/2.25*1.45,fv=25+(camZoomS-.45)/2.55*55;if(Math.abs(cam.fov-fv)>.01){cam.fov=fv;cam.updateProjectionMatrix()}cam.position.set(me.position.x+Math.sin(P.yaw)*.25,me.position.y+1.3,me.position.z+Math.cos(P.yaw)*.25);cam.lookAt(cam.position.x+Math.sin(P.yaw)*Math.cos(pit)*10,cam.position.y+Math.sin(pit)*10,cam.position.z+Math.cos(P.yaw)*Math.cos(pit)*10);U.fadeR.value=0}/* ngồi trong cabin đu quay: nhìn từ chỗ ngồi, kéo ngang quay mọi hướng, kéo dọc ngước lên hay nhìn xuống, chụm hoặc lăn chuột phóng to */
    else if(farView){camZoomS+=(camZoom-camZoomS)*Math.min(1,dt*7);const k=Math.max(.6,Math.min(2.2,camZoomS)),a=P.yaw+.7,d=34*k,cx=tgt.x+Math.sin(a)*d,ccz=tgt.z+Math.cos(a)*d;/* ngắm xe từ xa: lùi xa, lên cao, chếch một bên, như góc Toàn cảnh của du thuyền */cpos.set(cx,Math.max(groundY(cx,ccz)+4,tgt.y+20*k),ccz);cam.position.lerp(cpos,1-Math.exp(-dt*2.5));U.meP.value.set(tgt.x,tgt.y,tgt.z);U.fadeR.value=6;/* cây, nhà giữa camera và xe tự mờ đi */cam.lookAt(tgt.x,tgt.y-.6,tgt.z)}
    else{camZoomS+=(camZoom-camZoomS)*Math.min(1,dt*7);const cz=camZoomS,ride=!['walk','skate','build','bridge'].includes(P.mode),gy=P.mode==='bridge'?me.position.y:ride?tgt.y-1.05:groundY(P.x,P.z),behind=(ride?(P.mode==='sit'?.55:.7):1)*14*cz,cx=tgt.x+Math.sin(P.yaw)*behind,ccz=tgt.z+Math.cos(P.yaw)*behind;
      const cy=Math.max(5.6*cz*camLift*(ride?.7:1)+Math.max(0,cz-1.5)*7+gy,groundY(cx,ccz)+2.2);/* như Rừng Yên: thu nhỏ quá 1,5 thì camera lên cao dần để thấy toàn cảnh */
      cpos.set(cx,cy,ccz);if(first){cam.position.copy(cpos);first=false}else cam.position.lerp(cpos,1-Math.exp(-dt*9));U.meP.value.set(tgt.x,gy+1.05,tgt.z);U.fadeR.value=1.8+Math.min(camZoomS,2)*.9;cam.lookAt(tgt.x,gy+1.05,tgt.z);cam.rotateX(Math.atan(Math.tan(cam.fov*Math.PI/360)/3));if(camLift<.8)cam.rotateX((.8-camLift)/.45*1.05);/* vuốt lên hạ camera sát đất và ngước nhìn trời: ở đâu cũng ngắm được cực quang *//* nhân vật ở giữa, trên đường một phần ba dưới */
      sc.fog.density=fogK/(1+Math.max(0,cz-1.2)*.7)}
    // tuyết bay quanh camera
    const A=snowG.attributes.position.array;for(let i=0;i<SNN;i++){let y=A[i*3+1]-dt*(.8+(i%7)*.12);A[i*3]+=Math.sin(t*.6+i)*dt*.25;if(y<0)y+=30;A[i*3+1]=y}snowG.attributes.position.needsUpdate=true;snow.position.set(cam.position.x,cam.position.y-12,cam.position.z);
    if(PV.dirty)pvRender();R.render(sc,cam)};
  const _v2=new THREE.Vector3();let lastDrag=0;cv.addEventListener('pointermove',()=>{if(pts.size)lastDrag=performance.now()});
  /* 28/11 (2): mọi hoạt động di chuyển (đi bộ, trượt băng, xe husky, xe trượt, xe ông già Noel, đu quay): camera không tự xoay, chỉ đi theo giữ người ở giữa một phần ba dưới; muốn xoay thì kéo màn hình. Có nút ngắm xe từ xa */
  function follow(h,dt,k=3){if(pts.size||performance.now()-lastDrag<1200)return;let d=h+Math.PI-P.yaw;d=Math.atan2(Math.sin(d),Math.cos(d));P.yaw+=d*Math.min(1,dt*k)}/* camera về sau lưng, bám theo cả khi xe đổi hướng; vuốt xoay thì tạm dừng 1,2 giây */
  requestAnimationFrame(loop);
  caption('❄ Xứ Yên · Hít một hơi lạnh trong lành, thở ra thật chậm. Chạm mặt tuyết để đi, vuốt ngang để nhìn quanh, vuốt lên để ngước nhìn cực quang.',7000);

  function close(){if(!run)return;run=false;removeEventListener('resize',resize);document.removeEventListener('keydown',onKey);document.removeEventListener('keyup',onKey);
    sc.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material){const m=o.material;if(m.map)m.map.dispose();m.dispose()}});R.dispose();try{R.forceContextLoss()}catch(e){}
    snowCleanup.forEach(f=>{try{f()}catch(e){}});box.remove();css.remove();document.body.classList.remove('snow-open');window.__snowOpen=null;window.__snowCam=null;window.__snowGo=null;if(opts.onClose)opts.onClose()}
  // Chụp thử: __snowCam([x,y,z],[tx,ty,tz]) đặt camera cố định, __snowCam(null) để trả lại; __snowGo('leukinh') tới một khu; __snowAct('aurora') mở hoạt động
  window.__snowPos=(x,z,yaw)=>{P.x=x;P.z=z;P.dest=null;if(yaw!=null)P.yaw=yaw;first=true};window.__snowCam=(p,q)=>{camFix=p?[p,q]:null};window.__snowFog=d=>{sc.fog.density=d};window.__snowH=(x,z)=>groundY(x,z);window.__sleds=()=>sleds.map(o=>[o.st,o.rider,+o.s.toFixed(1),+o.v.toFixed(1)]);window.__sledLand=(x,z)=>sledLand(x,z);window.__snowMe=()=>{const p=me.position.clone().setY(groundY(P.x,P.z)+1.05).project(cam);return {x:+((p.x+1)/2).toFixed(3),y:+((1-p.y)/2).toFixed(3),mode:P.mode,yaw:+P.yaw.toFixed(2),a:+P.a.toFixed(2),zoom:camZoom,lift:camLift}};window.__snowProject=v=>{const p=new THREE.Vector3(...v).project(cam);return [(p.x+1)/2,(1-p.y)/2]};window.__snowExp=e=>{R.toneMappingExposure=e};window.__snowFov=f=>{cam.fov=f;cam.updateProjectionMatrix();cam.fov0=f};window.__snowGo=id=>{const z=ZONES.find(z=>z.id===id);if(z)goZone(z)};
  window.__snowBuildT=x=>{if(myMan)myMan.t=x};window.__snowBuildPick=k=>buildPick(k);window.__snowFree=(x,z,r)=>colliders.filter(c=>c!==TGH.c&&Math.hypot(x-c[0],z-c[1])<r+c[2]).length;window.__lakeShore=(a,o)=>lakeShore(a,o);window.__snowAct=id=>{const s=STATIONS.find(s=>s.id===id);if(s){if(P.mode!=='walk')stand();P.x=s.x;P.z=s.z;near=s;act()}};window.__snowMap=()=>{drawMap();mapEl.hidden=false};
  const api={close};window.__snowOpen=api;return api}
