/* LÀNG YÊN · nút ⓘ và bảng thông tin dùng chung cho cả ba bản đồ (Rừng Yên, Vịnh Yên, Xứ Yên) và trong các nhà.
   28/11: mọi hoạt động đều bắt đầu bằng cách chạm vào đồ vật, ngôi nhà, mặt đất trên bản đồ; bảng thông tin chỉ để đọc.
   - Nút chữ i trong vòng tròn: bấm mới hiện bảng, bảng trượt từ bên phải sang; nút mũi tên ở mép trái bảng để đóng (đẩy bảng về lại bên phải).
   - Gợi ý tự tắt: lần đầu tới một nơi, hoặc khi người chơi đứng yên chưa chạm gì một lúc, hiện một dòng nhắc nhẹ rồi tự tắt. */
(function(){
  if(window.YenInfo)return;
  const PLACES={
    forest:{t:'Rừng Yên',p:'Rừng thông yên tĩnh với Hồ Sen, Chánh điện trên đồi, sáu ngôi nhà ngũ quan và Tư Gia.',g:['Chạm mặt đất để đi tới','Chạm ngôi nhà, tọa cụ, thuyền hay hồ để bắt đầu']},
    bay:{t:'Vịnh Yên',p:'Du thuyền chậm rãi giữa những đảo đá. Ghé Đảo Yên để dạo bãi cát, nhặt vỏ sò, xếp đá.',g:['Chạm mặt nước thoáng để tàu đi tới','Chạm Đảo Yên hay danh thắng để ghé thăm']},
    island:{t:'Đảo Yên',p:'Hòn đảo nhỏ có Nhà Thiền, nhà nghỉ, chòi ngắm cảnh và bãi cát.',g:['Chạm bãi cát để đi tới','Chạm nhà, chòi, vỏ sò hay đá để bắt đầu']},
    snow:{t:'Xứ Yên',p:'Làng tuyết mùa Giáng sinh: hồ băng, vòng đu quay, trang trại tuần lộc và husky.',g:['Chạm mặt tuyết để đi tới','Chạm xe, ngôi nhà hay đồ vật để bắt đầu','Chạm cây thông lớn để treo điều ước, bãi tuyết để đắp người tuyết, sân băng để trượt','Ngồi bên đống lửa để viết và thả điều muốn buông, vào Nhà Ấm tròn uống ly ấm']}
  };
  const VIEW=['Kéo để nhìn quanh','Chụm hai ngón hoặc lăn chuột để phóng to, thu nhỏ','Chạm đúp để lại gần hoặc ra xa'];
  const FIRST_MS=4000,IDLE_MS=15000,HINT_MS=6000;/* lần đầu tới nơi mới: nhắc sau 4 giây; những lần sau: chỉ nhắc khi 15 giây chưa chạm gì; dòng nhắc tự tắt sau 6 giây */
  const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const B=document.body;
  const btn=document.createElement('button');btn.type='button';btn.id='yenInfoBtn';btn.className='yen-info-btn';btn.hidden=true;btn.setAttribute('aria-label','Thông tin');btn.setAttribute('aria-expanded','false');btn.textContent='i';
  const dr=document.createElement('aside');dr.id='yenInfo';dr.className='yen-drawer';dr.setAttribute('aria-label','Thông tin');dr.setAttribute('aria-hidden','true');
  dr.innerHTML='<button type="button" class="yd-close" aria-label="Đóng bảng thông tin">›</button><div class="yd-body"></div>';
  const pill=document.createElement('div');pill.id='yenHint';pill.className='yen-hint';pill.setAttribute('aria-live','polite');
  B.append(btn,dr,pill);
  const body=dr.querySelector('.yd-body');
  function place(){if(!B.classList.contains('immersive')&&!B.classList.contains('snow-open'))return null;const rb=document.getElementById('roomBox');if(rb&&!rb.hidden)return 'room';
    if(B.classList.contains('snow-open'))return 'snow';if(B.classList.contains('yen-bay'))return B.classList.contains('bay-island')?'island':'bay';return 'forest'}
  function fill(k){const P=PLACES[k];if(!P)return;body.innerHTML='<h3>'+esc(P.t)+'</h3><p>'+esc(P.p)+'</p><ul>'+P.g.concat(VIEW).map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul>'}
  function setOpen(o){if(o)fill(ctx);dr.classList.toggle('open',!!o);dr.setAttribute('aria-hidden',o?'false':'true');btn.setAttribute('aria-expanded',o?'true':'false');if(o)hint(null)}
  btn.addEventListener('click',e=>{e.stopPropagation();setOpen(!dr.classList.contains('open'))});
  dr.querySelector('.yd-close').addEventListener('click',e=>{e.stopPropagation();setOpen(false)});
  dr.addEventListener('pointerdown',e=>e.stopPropagation());
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&dr.classList.contains('open'))setOpen(false)});
  /* dòng nhắc nhẹ: hiện rồi tự tắt; chạm vào đâu cũng tắt ngay */
  let hT=0;function hint(t,ms){clearTimeout(hT);if(!t){pill.classList.remove('on');return}pill.textContent=t;pill.classList.add('on');hT=setTimeout(()=>pill.classList.remove('on'),ms||HINT_MS)}
  let ctx=null,ctxT=0,lastTap=0,done=false,first=false;
  document.addEventListener('pointerdown',()=>{lastTap=performance.now();if(pill.classList.contains('on'))setTimeout(()=>hint(null),1200)},true);
  /* bản đồ đang hiện lời nhắc riêng (Vịnh Yên, Xứ Yên) thì đợi lời nhắc đó tắt rồi mới nhắc, không hiện hai dòng cùng lúc */
  function capOn(){for(const el of document.querySelectorAll('#bayCapBox,.sn-cap')){if(!el.offsetParent||!el.textContent.trim())continue;const cs=getComputedStyle(el);if(cs.display!=='none'&&cs.visibility!=='hidden'&&+cs.opacity>.15)return true}return false}
  function seen(k){try{return !!localStorage.getItem('yen_info_seen_'+k)}catch(e){return true}}
  function markSeen(k){try{localStorage.setItem('yen_info_seen_'+k,'1')}catch(e){}}
  setInterval(()=>{const k=place(),now=performance.now();
    if(k!==ctx){ctx=k;ctxT=now;done=false;first=!!k&&!seen(k);setOpen(false);hint(null);btn.hidden=!k||k==='room'}
    if(!k||done)return;
    if(k==='room'){if(typeof YenInfo.roomIdle==='function'&&now-Math.max(ctxT,lastTap)>IDLE_MS){done=true;YenInfo.roomIdle()}return}
    if(dr.classList.contains('open'))return;
    const wait=first?FIRST_MS:IDLE_MS;if(now-Math.max(ctxT,first?0:lastTap)>wait&&!capOn()){done=true;markSeen(k);hint(PLACES[k].g.join(' · '))}},1000);
  window.YenInfo={hint,open:()=>setOpen(true),close:()=>setOpen(false),place,roomIdle:null};
})();
