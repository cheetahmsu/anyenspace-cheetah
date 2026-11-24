// LÀNG YÊN · không gian bên trong các nhà (nạp lười). Tách tự động từ js/world3d.js bằng tools/split_lazy.py; chạy bằng eval bên trong initialize3D.
  function roomChuongGio(st){rmHint('Chạm vào chuông xoay, chiêng hay chuông gió để nghe · Kéo để nhìn quanh');
    const bowlM=new THREE.MeshStandardMaterial({color:'#b88d45',metalness:.6,roughness:.35});rAdd(st,new THREE.Mesh(new THREE.BoxGeometry(2.4,.32,1),mat('#4e3a2a')),0,.16,0);
    [[-.8,.26,196],[0,.32,147],[.8,.22,262]].forEach(([x,r,f],k)=>{const b=rAdd(st,new THREE.Mesh(new THREE.LatheGeometry([[0,0],[r*.6,.02],[r,.14],[r*1.05,.2]].map(([a,c])=>new THREE.Vector2(a,c)),24),bowlM),x,.33,0);
      const cushion=rAdd(st,new THREE.Mesh(new THREE.CylinderGeometry(r*.9,r,.05,16),mat('#7a2f2f')),x,.33,0);rTap(st,b,()=>{strike(f,7,.14);b.userData.ring=performance.now()});st.tick.push(()=>{const u=(performance.now()-(b.userData.ring||0))/1000;b.scale.setScalar(u<1.2?1+Math.sin(u*40)*.012*(1.2-u):1)})});
    const frame=new THREE.Group();frame.position.set(-2.4,0,-1.8);st.sc.add(frame);for(const x of [-.7,.7]){const p=new THREE.Mesh(new THREE.BoxGeometry(.1,2.2,.1),mat('#4e3a2a'));p.position.set(x,1.1,0);frame.add(p)}const tb=new THREE.Mesh(new THREE.BoxGeometry(1.6,.12,.12),mat('#4e3a2a'));tb.position.y=2.2;frame.add(tb);
    const gong=new THREE.Mesh(new THREE.CylinderGeometry(.55,.55,.05,32),new THREE.MeshStandardMaterial({color:'#a8823e',metalness:.65,roughness:.3}));gong.rotation.x=Math.PI/2;gong.position.y=1.35;frame.add(gong);const boss=new THREE.Mesh(new THREE.SphereGeometry(.12,12,8),bowlM);boss.position.set(0,1.35,.04);boss.scale.z=.5;frame.add(boss);
    rTap(st,frame,()=>{strike(98,9,.18,[[1,1],[1.48,.5],[2.3,.3],[3.9,.12]]);gong.userData.ring=performance.now()});st.tick.push(()=>{const u=(performance.now()-(gong.userData.ring||0))/1000;frame.rotation.z=u<2?Math.sin(u*9)*.015*(2-u):0});
    const metal=new THREE.MeshStandardMaterial({color:'#d2c49a',metalness:.6,roughness:.3}),chimes=[];
    for(const [x,z] of [[-1.6,1.2],[1.6,1.2],[2.4,-1.4]]){const g=new THREE.Group();g.position.set(x,2.9,z);st.sc.add(g);const top=new THREE.Mesh(new THREE.CylinderGeometry(.2,.2,.05,12),mat('#6b4a32'));g.add(top);for(let k=0;k<6;k++){const a=k*1.047,len=.5+k*.12,t=new THREE.Mesh(new THREE.CylinderGeometry(.025,.025,len,8),metal);t.position.set(Math.cos(a)*.14,-.1-len/2,Math.sin(a)*.14);g.add(t)}chimes.push(g);rTap(st,g,()=>{playChime();g.userData.ring=performance.now()})}
    st.tick.push(t=>{for(const [i,g] of chimes.entries()){const u=(performance.now()-(g.userData.ring||0))/1000,k=u<3?(3-u)*.08:0;g.rotation.z=Math.sin(t*1.3+i)*(.04+k);g.rotation.x=Math.sin(t*.9+i*2)*(.03+k*.6)}});
    for(let k=0;k<6;k++){const a=-1+k*.4,c=rAdd(st,new THREE.Mesh(new THREE.CylinderGeometry(.3,.32,.12,14),mat('#6e4a33')),Math.sin(a)*2,.06,1.3+Math.cos(a)*.6)}
    let sess=null;
    function render(){rmPanel.innerHTML='<p>Âm thanh là một cửa vào tĩnh lặng. Lắng nghe một tiếng chuông từ lúc ngân đến khi tắt hẳn.</p><div class="rm-row"><button data-cg="bowl0">🥣 Chuông trầm</button><button data-cg="bowl1">🥣 Chuông vừa</button><button data-cg="bowl2">🥣 Chuông thanh</button><button data-cg="gong">🔔 Chiêng</button><button data-cg="wind">🎐 Gió thổi</button></div><div class="rm-row"><button class="rm-gold" data-cg="sess">'+(sess?'⏹ Dừng thiền âm thanh · '+sess.left+'s':'🧘 Thiền âm thanh 3 phút')+'</button></div>'}
    render();rmPanel.onclick=e=>{const a=e.target.closest('[data-cg]')?.dataset.cg;if(!a)return;const fs=[147,196,262];
      if(a.startsWith('bowl'))strike(fs[+a[4]],7,.14);else if(a==='gong')strike(98,9,.18,[[1,1],[1.48,.5],[2.3,.3],[3.9,.12]]);else if(a==='wind'){for(const g of chimes)g.userData.ring=performance.now();playChime();setTimeout(()=>{if(st.run)playChime()},900)}
      else if(a==='sess'){if(sess){clearInterval(sess.id);sess=null;rmHint('Đã dừng buổi thiền âm thanh');render();return}sess={left:180,id:0};strike(98,9,.18,[[1,1],[1.48,.5],[2.3,.3]]);rmHint('Ngồi thẳng, thả lỏng vai · Mỗi tiếng chuông là một lần trở về hơi thở');
        sess.id=setInterval(()=>{if(!roomOpen){clearInterval(sess.id);sess=null;return}sess.left--;if(sess.left%20===0&&sess.left>0)strike([147,196,262][(sess.left/20)%3],7,.12);if(sess.left%45===0)playChime();if(sess.left<=0){clearInterval(sess.id);sess=null;strike(98,10,.18,[[1,1],[1.48,.5]]);setTimeout(()=>strike(98,10,.16,[[1,1],[1.48,.5]]),3500);rmHint('🙏 Buổi thiền âm thanh đã xong · Mang sự tĩnh lặng này theo bạn')}render()},1000)}};
    st.cleanup=()=>{if(sess)clearInterval(sess.id)}}
  function roomXongHuong(st){
    const W=st.sc,amb=new THREE.PointLight('#ffcf8a',4,7,1.6);amb.position.set(0,2.2,-1.4);W.add(amb);
    // window onto Hồ Hương: a painted view of the pond and pines, with open shutters
    {const cv=document.createElement('canvas');cv.width=512;cv.height=384;const c=cv.getContext('2d');let gr=c.createLinearGradient(0,0,0,384);gr.addColorStop(0,'#cfe6dc');gr.addColorStop(.55,'#9cc6b4');gr.addColorStop(1,'#5f8f7c');c.fillStyle=gr;c.fillRect(0,0,512,384);
      for(let k=0;k<26;k++){const x=k*21+(k%3)*5,h=120+((k*53)%70);c.fillStyle=k%2?'#2f5a46':'#3e6e52';c.beginPath();c.moveTo(x,250);c.lineTo(x+14,250-h);c.lineTo(x+28,250);c.fill()}
      gr=c.createLinearGradient(0,250,0,384);gr.addColorStop(0,'#8fc0c0');gr.addColorStop(1,'#4f8a8a');c.fillStyle=gr;c.fillRect(0,250,512,134);c.fillStyle='rgba(255,250,220,.35)';for(let k=0;k<6;k++){c.beginPath();c.moveTo(220+k*12,0);c.lineTo(160+k*40,384);c.lineTo(175+k*40,384);c.lineTo(232+k*12,0);c.fill()}
      const tex=new THREE.CanvasTexture(cv);tex.colorSpace=THREE.SRGBColorSpace;const view=new THREE.Mesh(new THREE.PlaneGeometry(2.2,1.65),new THREE.MeshBasicMaterial({map:tex}));view.position.set(0,2.05,-3.43);W.add(view);
      const fr=mat('#5b3d2a');for(const [x,y,w,h] of [[0,2.92,2.4,.12],[0,1.18,2.4,.12],[-1.16,2.05,.12,1.86],[1.16,2.05,.12,1.86],[0,2.05,.05,1.65]]){const b=new THREE.Mesh(new THREE.BoxGeometry(w,h,.1),fr);b.position.set(x,y,-3.4);W.add(b)}
      for(const sx of [-1,1]){const sh=new THREE.Group();sh.position.set(sx*1.2,2.05,-3.38);sh.rotation.y=-sx*1.0;W.add(sh);const p=new THREE.Mesh(new THREE.BoxGeometry(.62,1.6,.04),mat('#7a5438'));p.position.x=sx*.31;sh.add(p);for(let k=0;k<9;k++){const sl=new THREE.Mesh(new THREE.BoxGeometry(.54,.03,.05),mat('#6a4630'));sl.position.set(sx*.31,-.68+k*.17,.02);sh.add(sl)}}}
    // tatami floor in front of the table
    {const t=new THREE.Mesh(new THREE.BoxGeometry(3.6,.02,2.6),mat('#b9a77a'));t.position.set(0,.01,-.9);W.add(t)}
    // cabinets: herbs on the left wall, amber bottles on the right wall; row 0 = hương đầu (top) … row 2 = hương nền (bottom)
    const slotPos=(side,a)=>{const col=a.i%6,row=a.tier,y=[2.55,1.8,1.05][row],z=-2.75+col*.52;return [side*3.62,y,z]};
    const herbMeshes={},bottleMeshes={},rings={};
    for(const side of [-1,1]){const cab=new THREE.Group();W.add(cab);const wood=mat('#6b4a32'),dark=mat('#4e3a2a');
      const back=new THREE.Mesh(new THREE.BoxGeometry(.06,2.75,3.3),dark);back.position.set(side*3.93,1.65,-1.45);cab.add(back);
      for(const y of [.62,1.38,2.13,2.95]){const sh=new THREE.Mesh(new THREE.BoxGeometry(.5,.05,3.3),wood);sh.position.set(side*3.7,y,-1.45);cab.add(sh)}
      for(const z of [-3.1,.2]){const p=new THREE.Mesh(new THREE.BoxGeometry(.5,2.75,.06),wood);p.position.set(side*3.7,1.65,z);cab.add(p)}
      const strip=new THREE.Mesh(new THREE.BoxGeometry(.04,.02,3.2),new THREE.MeshBasicMaterial({color:'#ffd690'}));strip.position.set(side*3.47,2.93,-1.45);cab.add(strip)}
    for(const a of AROMAS){
      // left: hanging bunch (top row) or a rattan basket of dried herbs (rows below)
      const [hx,hy,hz]=slotPos(-1,a),hm=new THREE.MeshStandardMaterial({color:new THREE.Color(a.c).lerp(new THREE.Color('#8a7a52'),.35),roughness:.95,emissive:'#000000'}),hg=new THREE.Group();hg.position.set(hx,hy,hz);W.add(hg);
      if(a.tier===0){const b=new THREE.Mesh(new THREE.ConeGeometry(.12,.42,7),hm);b.rotation.x=Math.PI;b.position.y=.12;hg.add(b);const tie=new THREE.Mesh(new THREE.CylinderGeometry(.03,.03,.05,8),mat('#c8a96a'));tie.position.y=.34;hg.add(tie);const str=new THREE.Mesh(new THREE.CylinderGeometry(.004,.004,.24,3),mat('#c8a96a'));str.position.y=.48;hg.add(str)}
      else{const bk=new THREE.Mesh(new THREE.CylinderGeometry(.19,.15,.14,12,1,true),mat('#a8865a'));bk.position.y=-.36;hg.add(bk);const bot=new THREE.Mesh(new THREE.CircleGeometry(.15,12),mat('#8f6f48'));bot.rotation.x=-Math.PI/2;bot.position.y=-.43;hg.add(bot);
        for(let k=0;k<9;k++){const p=new THREE.Mesh(a.tier===2&&k%2?new THREE.BoxGeometry(.09,.025,.025):new THREE.SphereGeometry(.045,6,4),hm);p.position.set(Math.cos(k*2.4)*.09*(k%3?1:.3),-.31+(k%3)*.015,Math.sin(k*2.4)*.09*(k%3?1:.3));p.rotation.y=k;hg.add(p)}}
      herbMeshes[a.id]=hm;rTap(st,hg,()=>arTap(a.id));
      // right: amber dropper bottle with a label
      const [bx,by,bz]=slotPos(1,a),bg=new THREE.Group();bg.position.set(bx,by-.36,bz);W.add(bg);const bm=new THREE.MeshStandardMaterial({color:'#8a4a18',roughness:.25,metalness:.1,transparent:true,opacity:.92,emissive:'#000000'});
      const body=new THREE.Mesh(new THREE.LatheGeometry([[0,0],[.07,0],[.075,.02],[.075,.16],[.05,.2],[.025,.22],[.025,.25]].map(([x,y])=>new THREE.Vector2(x,y)),14),bm);bg.add(body);
      const cap=new THREE.Mesh(new THREE.CylinderGeometry(.03,.03,.05,10),mat('#2b2420'));cap.position.y=.275;bg.add(cap);const bulb=new THREE.Mesh(new THREE.SphereGeometry(.028,8,6),mat('#1e1a18'));bulb.scale.y=1.4;bulb.position.y=.32;bg.add(bulb);
      const lc=document.createElement('canvas');lc.width=128;lc.height=96;const lx=lc.getContext('2d');lx.fillStyle='#f3ead2';lx.fillRect(0,0,128,96);lx.fillStyle=a.c;lx.beginPath();lx.arc(64,36,22,0,7);lx.fill();lx.fillStyle='#3a2b1f';lx.font='bold 17px sans-serif';lx.textAlign='center';lx.fillText(a.name,64,84,120);
      const lt=new THREE.CanvasTexture(lc);lt.colorSpace=THREE.SRGBColorSpace;const label=new THREE.Mesh(new THREE.PlaneGeometry(.12,.09),new THREE.MeshBasicMaterial({map:lt}));label.position.set(-.077,.09,0);label.rotation.y=-Math.PI/2;bg.add(label);
      bottleMeshes[a.id]=bm;rTap(st,bg,()=>arTap(a.id));
      for(const [side,x,y,z] of [[-1,hx,hy,hz],[1,bx,by,bz]]){const ring=new THREE.Mesh(new THREE.TorusGeometry(.19,.01,6,24),new THREE.MeshBasicMaterial({color:'#ffd27a',transparent:true,opacity:0}));ring.position.set(x+side*-.12,y-.15,z);ring.rotation.y=Math.PI/2;W.add(ring);(rings[a.id]=rings[a.id]||[]).push(ring)}}
    // low table, diffuser (left) and clay censer (right), four cushions
    const table=new THREE.Group();table.position.set(0,0,-1.6);W.add(table);{const top=new THREE.Mesh(new THREE.BoxGeometry(1.9,.08,.8),mat('#5a3d2a'));top.position.y=.42;table.add(top);for(const x of [-.85,.85])for(const z of [-.32,.32]){const l=new THREE.Mesh(new THREE.BoxGeometry(.07,.4,.07),mat('#4a3222'));l.position.set(x,.2,z);table.add(l)}}
    const diff=new THREE.Group();diff.position.set(-.5,.46,0);table.add(diff);diff.add(new THREE.Mesh(new THREE.CylinderGeometry(.13,.16,.2,18),mat('#e8e0d2')));diff.children[0].position.y=.1;
    const bowl=new THREE.Mesh(new THREE.SphereGeometry(.15,20,10,0,Math.PI*2,0,Math.PI/2),new THREE.MeshStandardMaterial({color:'#f4f1ea',transparent:true,opacity:.55,roughness:.3,side:THREE.DoubleSide}));bowl.rotation.x=Math.PI;bowl.position.y=.36;diff.add(bowl);
    const water=new THREE.Mesh(new THREE.CircleGeometry(.14,22),new THREE.MeshStandardMaterial({color:'#bfe0e0',roughness:.1,transparent:true,opacity:.85}));water.rotation.x=-Math.PI/2;water.position.y=.33;diff.add(water);
    const candle=new THREE.Mesh(new THREE.CylinderGeometry(.03,.03,.04,10),new THREE.MeshBasicMaterial({color:'#ffcf6a'}));candle.position.y=.16;diff.add(candle);
    const pip=new THREE.Group();pip.position.set(-.1,.75,.0);diff.add(pip);{const tube=new THREE.Mesh(new THREE.CylinderGeometry(.008,.012,.16,8),new THREE.MeshStandardMaterial({color:'#f6f6f2',transparent:true,opacity:.6}));pip.add(tube);const bulbP=new THREE.Mesh(new THREE.SphereGeometry(.022,8,6),mat('#2b2420'));bulbP.scale.y=1.4;bulbP.position.y=.1;pip.add(bulbP)}pip.visible=false;
    const drop=new THREE.Mesh(new THREE.SphereGeometry(.014,8,6),new THREE.MeshStandardMaterial({color:'#f2c34a',emissive:'#a8781a',emissiveIntensity:.5}));drop.visible=false;diff.add(drop);
    const ripple=new THREE.Mesh(new THREE.RingGeometry(.02,.03,24),new THREE.MeshBasicMaterial({color:'#ffffff',transparent:true,opacity:0,side:THREE.DoubleSide}));ripple.rotation.x=-Math.PI/2;ripple.position.y=.335;diff.add(ripple);
    const cen=new THREE.Group();cen.position.set(.5,.46,0);table.add(cen);cen.add(new THREE.Mesh(new THREE.LatheGeometry([[0,0],[.12,.01],[.17,.08],[.16,.16],[.18,.18]].map(([x,y])=>new THREE.Vector2(x,y)),18),mat('#9a5a38')));
    const rim=new THREE.Mesh(new THREE.TorusGeometry(.175,.012,6,24),new THREE.MeshStandardMaterial({color:'#c28a4a',metalness:.6,roughness:.35}));rim.rotation.x=Math.PI/2;rim.position.y=.18;cen.add(rim);
    const coals=new THREE.Mesh(new THREE.CircleGeometry(.15,18),new THREE.MeshBasicMaterial({color:'#7a2a12'}));coals.rotation.x=-Math.PI/2;coals.position.y=.165;cen.add(coals);
    const dish=new THREE.Mesh(new THREE.CylinderGeometry(.12,.1,.02,16),mat('#d8cba8'));dish.position.set(.35,.01,.12);cen.add(dish);const tongs=new THREE.Mesh(new THREE.BoxGeometry(.24,.01,.02),new THREE.MeshStandardMaterial({color:'#b07a3a',metalness:.6,roughness:.3}));tongs.position.set(.3,.02,-.12);tongs.rotation.y=.4;cen.add(tongs);
    const pinch=[];for(let k=0;k<3;k++){const p=new THREE.Group();p.visible=false;cen.add(p);pinch.push(p)}
    for(let k=0;k<4;k++){const a=[-.55,-.2,.2,.55][k],cu=new THREE.Mesh(new THREE.CylinderGeometry(.28,.3,.12,16),mat('#6a7a5a'));cu.position.set(a*2,.06,-.5+(k===0||k===3?.15:0));W.add(cu)}
    // mist / smoke above the two stations
    const fogMat=()=>new THREE.MeshBasicMaterial({color:'#f2efe6',transparent:true,opacity:0,depthWrite:false});const mist=[],smoke=[];
    for(let k=0;k<12;k++){const m=new THREE.Mesh(new THREE.SphereGeometry(.06,8,6),fogMat());m.userData.k=k;diff.add(m);mist.push(m);const s=new THREE.Mesh(new THREE.SphereGeometry(.05,8,6),fogMat());s.userData.k=k;cen.add(s);smoke.push(s)}
    // Kệ Lưu Hương 3×3 at the corner of the window, with a candle and the An Yên journal below
    const shelf=new THREE.Group();shelf.position.set(2.35,0,-3.25);W.add(shelf);{const wd=mat('#5a3b24');for(const y of [.55,1.15,1.75,2.35]){const b=new THREE.Mesh(new THREE.BoxGeometry(1.2,.05,.4),wd);b.position.y=y;shelf.add(b)}for(const x of [-.6,-.2,.2,.6]){const p=new THREE.Mesh(new THREE.BoxGeometry(.04,1.85,.4),wd);p.position.set(x,1.45,0);shelf.add(p)}
      const lamp=new THREE.Mesh(new THREE.BoxGeometry(1.1,.015,.03),new THREE.MeshBasicMaterial({color:'#ffd690'}));lamp.position.set(0,2.33,.17);shelf.add(lamp);
      const plinth=new THREE.Mesh(new THREE.BoxGeometry(1.2,.3,.4),wd);plinth.position.y=.15;shelf.add(plinth);const book=new THREE.Mesh(new THREE.BoxGeometry(.3,.05,.22),mat('#7a3f2a'));book.position.set(-.25,.325,.02);shelf.add(book);const cd=new THREE.Mesh(new THREE.CylinderGeometry(.05,.05,.1,10),mat('#f2e6c8'));cd.position.set(.25,.35,.02);shelf.add(cd);const fl=new THREE.Mesh(new THREE.ConeGeometry(.012,.04,6),new THREE.MeshBasicMaterial({color:'#ffcf6a'}));fl.position.set(.25,.42,.02);shelf.add(fl)}
    const shelfItems=new THREE.Group();shelf.add(shelfItems);
    const drawShelf2=()=>{while(shelfItems.children.length)shelfItems.remove(shelfItems.children[0]);aromaRows.slice(0,9).forEach((r,i)=>{const m=makeAromaGift(r,.8);m.position.set(-.4+(i%3)*.4,[1.775,1.175,.575][Math.floor(i/3)],0);shelfItems.add(m)})};
    drawShelf2();st.onAromas=drawShelf2;rTap(st,shelf,()=>openArchive('aromas'));loadAromas();
    haromyDecor(st);
    // ---- camera views (own drag handling so a view can face any wall)
    const VIEWS={home:{t:[0,1.35,-1.2],yaw:0,pitch:.14,dist:4.4},left:{t:[-3.4,1.75,-1.45],yaw:Math.PI/2,pitch:.05,dist:2.6},right:{t:[3.4,1.75,-1.45],yaw:-Math.PI/2,pitch:.05,dist:2.6},
      drip:{t:[-.5,.85,-1.6],yaw:.15,pitch:.42,dist:1.35},burn:{t:[.5,.75,-1.6],yaw:-.15,pitch:.42,dist:1.35},seat:{t:[0,1.6,-3.2],yaw:0,pitch:-.08,dist:3.9},shelf:{t:[2.35,1.6,-3.2],yaw:-.25,pitch:.05,dist:2.4}};
    let view=VIEWS.home,base=view.yaw,tw=null;const goView=k=>{const v=VIEWS[k];tw={t0:performance.now(),from:{t:st.target.clone(),yaw:st.yaw,pitch:st.pitch,dist:st.dist},to:v};view=v;base=v.yaw};
    st.target.set(...VIEWS.home.t);st.yaw=0;st.pitch=VIEWS.home.pitch;st.dist=VIEWS.home.dist;
    let drag=null;rmCanvas.onpointerdown=e=>{drag={x:e.clientX,y:e.clientY,moved:false};rmCanvas.setPointerCapture(e.pointerId)};
    rmCanvas.onpointermove=e=>{if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(Math.hypot(dx,dy)>6)drag.moved=true;drag.x=e.clientX;drag.y=e.clientY;st.yaw=Math.max(base-.8,Math.min(base+.8,st.yaw-dx*.006));st.pitch=Math.max(-.2,Math.min(.7,st.pitch+dy*.004))};
    rmCanvas.onpointerup=e=>{const d=drag;drag=null;if(!d||d.moved)return;const rc=rmCanvas.getBoundingClientRect(),p=new THREE.Vector2((e.clientX-rc.left)/rc.width*2-1,-(e.clientY-rc.top)/rc.height*2+1),ray=new THREE.Raycaster();ray.setFromCamera(p,st.cam);
      const hit=ray.intersectObjects(st.picks.map(x=>x.obj),true)[0];if(!hit)return;let o=hit.object;while(o&&!st.picks.some(x=>x.obj===o))o=o.parent;const pk=st.picks.find(x=>x.obj===o);if(pk)pk.fn()};
    rmCanvas.onwheel=e=>{e.preventDefault();st.dist=Math.max(.9,Math.min(6,st.dist*Math.exp(e.deltaY*.001)))};
    // ---- state and flow
    const S={step:'mood',sel:[],mood:null,info:null,method:null,drops:[],done:0,form:'lo',title:'',wish:'',breath:[4,4,6]};
    const tier=id=>AR(id).tier,ordered=()=>S.sel.slice().sort((a,b)=>tier(a)-tier(b));
    function arTap(id){if(S.step!=='pick'&&S.step!=='mood')return;if(S.step==='mood')S.step='pick';const i=S.sel.indexOf(id);if(i>=0)S.sel.splice(i,1);else{if(S.sel.length>=3){rmHint('Tối đa 3 mùi để bài hương thanh tao · bỏ bớt một mùi trước');S.info=id;render();return}S.sel.push(id)}S.mood=null;S.info=id;strike(660+AR(id).tier*-110,1.4,.03,[[1,1],[2,.25]]);render()}
    let glowT=0;st.tick.push(t=>{
      if(tw){const u=Math.min(1,(performance.now()-tw.t0)/900),q=u*u*(3-2*u);st.target.lerpVectors(tw.from.t,new THREE.Vector3(...tw.to.t),q);st.yaw=tw.from.yaw+(tw.to.yaw-tw.from.yaw)*q;st.pitch=tw.from.pitch+(tw.to.pitch-tw.from.pitch)*q;st.dist=tw.from.dist+(tw.to.dist-tw.from.dist)*q;if(u>=1)tw=null}
      const pulse=.55+Math.sin(t*3)*.25;for(const a of AROMAS){const on=S.sel.includes(a.id),inf=S.info===a.id;const e=on?pulse:inf?.25:0;herbMeshes[a.id].emissive.set(on||inf?'#c8962e':'#000000');herbMeshes[a.id].emissiveIntensity=e;bottleMeshes[a.id].emissive.set(on||inf?'#c8962e':'#000000');bottleMeshes[a.id].emissiveIntensity=e;for(const r of rings[a.id])r.material.opacity=on?.85:inf?.35:0}
      // mist above the diffuser and smoke over the censer, coloured by the recipe, breathing with the session
      const mixC=new THREE.Color('#f2efe6');if(S.drops.length){const c=new THREE.Color(0,0,0);for(const id of S.drops)c.add(new THREE.Color(AR(id).c));c.multiplyScalar(1/S.drops.length);mixC.lerp(c,.7)}
      const br=S.breathPhase||0,amp=S.method==='drip'?Math.min(1,S.done/3):0,amp2=S.method==='burn'?Math.min(1,S.done/2):0;
      for(const m of mist){const u=((t*.16+m.userData.k/12)%1);m.position.set(Math.sin(t*.6+m.userData.k)*.08*u,.4+u*.9*(1+br*.3),Math.cos(t*.5+m.userData.k)*.08*u);m.scale.setScalar(1+u*2.2);m.material.opacity=.16*amp*(1-u)*(1-u);m.material.color.lerp(mixC,.05)}
      for(const s of smoke){const u=((t*.2+s.userData.k/12)%1),w=Math.sin(t*1.3+u*6+s.userData.k);s.position.set(w*.05*u+u*.12,.22+u*1.2*(1+br*.3),Math.cos(t+s.userData.k)*.04*u);s.scale.set(.6+u*1.2,1.4+u*2,.6+u*1.2);s.material.opacity=.2*amp2*(1-u)*(1-u);s.material.color.lerp(mixC,.05)}
      coals.material.color.setHSL(.03,.85,(S.method==='burn'&&S.done?.42:.25)+Math.sin(t*2.5)*.04+br*.08);candle.material.color.setHSL(.11,1,.62+Math.sin(t*9)*.05+br*.1);
      if(drip){const u=(performance.now()-drip.t0)/700;if(u<1){drop.visible=true;drop.position.set(-.1,.67-u*.33,0)}else{drop.visible=false;const v=Math.min(1,(u-1)/1.2);ripple.material.opacity=.6*(1-v);ripple.scale.setScalar(1+v*5);if(v>=1)drip=null}}
    });
    let drip=null;
    const card=id=>{const a=AR(id);return '<div class="ar-card"><span class="ar-dot" style="background:'+a.c+'"></span><b>'+a.name+'</b> · '+AR_TIERS[a.tier]+'<br><i>'+a.feel+'</i><br>✦ '+a.mean+'<br>🌿 '+a.heal+'</div>'};
    const chips=ids=>ids.map(id=>'<span class="ar-chip" style="--c:'+AR(id).c+'">'+AR(id).name+'</span>').join(' ');
    function render(){let h='';const s=S.step;
      if(s==='mood'){h='<p><b>Hôm nay lòng và cơ thể bạn đang thế nào?</b></p><div class="rm-row">'+AR_MOODS.map(m=>'<button data-mood="'+m.id+'">'+m.label+'</button>').join('')+'</div><div class="rm-row"><button data-ar="self">🌿 Tự dạo hai tủ 18 mùi</button></div>'}
      else if(s==='pick'){const ids=ordered(),hint=arBalanceHint(ids);h='<p>'+(S.mood?'Gợi ý cho <b>'+AR_MOODS.find(m=>m.id===S.mood).label+'</b>: ':'Chọn 1–3 mùi (chạm trên hai tủ hoặc bên dưới): ')+(ids.length?chips(ids):'<i>chưa chọn</i>')+'</p>'
          +[0,1,2].map(ti=>'<div class="rm-row"><span class="rm-note" style="min-width:76px">'+AR_TIERS[ti]+'</span>'+AROMAS.filter(a=>a.tier===ti).map(a=>'<button data-sc="'+a.id+'"'+(S.sel.includes(a.id)?' class="sel"':'')+'><span class="rm-dot" style="background:'+a.c+'"></span>'+a.name+'</button>').join('')+'</div>').join('')
          +(S.info?card(S.info):'')+(hint?'<p class="rm-note">💡 '+hint+'</p>':'')
          +(ids.length?'<p class="rm-note">Tỷ lệ: '+arRatio(ids).map(([id,d])=>AR(id).name+' '+d+' giọt').join(' + ')+' (hoặc '+(ids.length===1?2:3)+' nhúm thảo mộc)</p><div class="rm-row"><button class="rm-gold" data-ar="drip">💧 Nhỏ tinh dầu vào đèn xông</button><button class="rm-gold" data-ar="burn">🔥 Đốt thảo mộc khô trên lư</button></div>':'')
          +'<div class="rm-row"><button data-ar="look-left">👈 Nhìn tủ thảo mộc</button><button data-ar="look-right">Nhìn tủ tinh dầu 👉</button><button data-ar="look-home">⌂ Toàn cảnh</button><button data-ar="back">↺ Chọn lại tâm trạng</button></div>'}
      else if(s==='drip'){const plan=S.plan,n=S.done;h='<p>💧 Nhỏ tinh dầu vào bát nước ấm · '+n+'/'+plan.length+' giọt</p><p class="rm-note">'+plan.map((id,i)=>'<span style="opacity:'+(i<n?1:.45)+'">'+AR(id).name+'</span>').join(' · ')+'</p><div class="rm-row">'+(n<plan.length?'<button class="rm-gold" data-ar="drop">💧 Nhỏ giọt</button>':'<button class="rm-gold" data-ar="sit">🧘 Ngồi thở cùng hương</button>')+'</div>'}
      else if(s==='burn'){const plan=S.plan,n=S.done;h='<p>🔥 Đặt thảo mộc khô lên than hồng · '+n+'/'+plan.length+' nhúm</p><p class="rm-note">'+plan.map((id,i)=>'<span style="opacity:'+(i<n?1:.45)+'">'+AR(id).name+'</span>').join(' · ')+'</p><div class="rm-row">'+(n<plan.length?'<button class="rm-gold" data-ar="pinch">🔥 Đặt thảo mộc lên than</button>':'<button class="rm-gold" data-ar="sit">🧘 Ngồi thở cùng hương</button>')+'</div>'}
      else if(s==='sit'){const b=S.breath;h='<p>🧘 Ngồi trên tọa cụ, nhìn ra Hồ Hương. Nhịp thở theo bài hương: hít '+b[0]+' · giữ '+b[1]+' · thở '+b[2]+'.</p><div class="rm-row">'+(S.br?'<button data-ar="stop">⏹ Dừng</button>':'<button class="rm-gold" data-ar="b6">🌬 6 nhịp (~'+Math.round(6*(b[0]+b[1]+b[2])/60*10)/10+' phút)</button><button data-ar="b3">🕯 3 phút tĩnh tâm</button><button data-ar="gift">Bỏ qua · làm quà mang về</button>')+'</div>'}
      else if(s==='gift'){h='<p>🎁 Quà mang về Túi An Yên</p><div class="rm-row"><button data-form="lo"'+(S.form==='lo'?' class="sel"':'')+'>🫙 Lọ Ước tinh dầu</button><button data-form="tui"'+(S.form==='tui'?' class="sel"':'')+'>👝 Túi thảo mộc khô</button></div>'
          +'<label class="kt-wish">Tên bài hương<input data-ti maxlength="40" value="'+escA(S.title)+'"></label><label class="kt-wish">Một dòng cảm nhận / điều ước (không bắt buộc)<input data-wi maxlength="80" value="'+escA(S.wish)+'" placeholder="Ví dụ: Nguyện đêm nay ngủ ngon"></label>'
          +'<div class="rm-row"><button class="rm-gold" data-ar="keep">🎒 Cất vào Túi An Yên</button></div>'}
      else if(s==='done'){const mix=S.mix;h='<p>🙏 <b>'+escA(S.title)+'</b> đã vào Túi An Yên, lên Kệ Lưu Hương và được ghi vào Nhật ký An Yên.</p>'
          +'<p class="rm-note">Dùng tại nhà: '+(S.form==='lo'?'máy khuếch tán 100 ml nước, nhỏ '+mix.map(([id,d])=>d+' giọt '+AR(id).name.toLowerCase()).join(' + ')+'; xông 20–30 phút rồi nghỉ.':'cho '+mix.map(([id])=>AR(id).name.toLowerCase()).join(', ')+' khô vào túi vải, bóp nhẹ cho dậy mùi; hoặc đun một nồi nước lá với các vị này, xông hơi 5–10 phút.')+' Tinh dầu dùng ngoài, không uống; phụ nữ mang thai, trẻ nhỏ, người có bệnh hô hấp nên hỏi ý kiến bác sĩ.</p>'
          +'<div class="rm-row"><button data-ar="again">🌿 Pha bài hương khác</button><button data-ar="shelf">🗄 Xem Kệ Lưu Hương</button><button data-ar="kho">📜 Kho Lọ Ước & Túi thơm</button></div>'}
      rmPanel.innerHTML=h}
    const escA=t=>String(t||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    const brEl=roomBox.querySelector('#roomBreath');
    function startBreath(cycles,totalSec){const b=S.breath,ph=[['Hít vào',b[0],1.35],['Giữ hơi',b[1],1.35],['Thở ra',b[2],.75]].filter(p=>p[1]>0);let n=0;const t0=performance.now();brEl.hidden=false;S.br={t:0};render();goView('seat');
      const step=i=>{if(!S.br||!roomOpen){brEl.hidden=true;S.breathPhase=0;return}if(i>=ph.length){n++;if((cycles&&n>=cycles)||(totalSec&&(performance.now()-t0)/1000>=totalSec)){S.br=null;brEl.hidden=true;S.breathPhase=0;strike(196,5,.08);rmHint('🙏 Phiên thở đã xong · Cảm nhận hơi thở nhẹ nhàng hơn');S.step='gift';render();return}i=0}
        const [lab,sec,sc]=ph[i];brEl.querySelector('span').textContent=lab+(cycles?' · '+(n+1)+'/'+cycles:'');const orb=brEl.querySelector('.rm-orb');orb.style.transition='transform '+sec+'s ease-in-out';orb.style.transform='scale('+sc+')';S.breathPhase=i===2?0:1;if(i===0)strike(523,3,.03);S.br.t=setTimeout(()=>step(i+1),sec*1000)};step(0)}
    function defaultTitle(){const m=S.mood&&AR_MOODS.find(x=>x.id===S.mood);if(m&&m.mix.every(([id])=>S.sel.includes(id))&&S.sel.length===m.mix.length)return m.title;return 'Hương '+ordered().map(id=>AR(id).name).join(' · ')}
    async function keepGift(){S.title=String(S.title||defaultTitle()).trim().slice(0,40)||defaultTitle();S.wish=String(S.wish||'').trim().slice(0,80);const mix=S.method==='drip'?arRatio(ordered()):ordered().map(id=>[id,1]);S.mix=mix;
      const now=new Date(),row={id:'local-'+Date.now(),form:S.form,aromas:mix.map(x=>x[0]),drops:mix.map(x=>x[1]),title:S.title,wish:S.wish,name:guestName(),picks:0,created_at:now.toISOString()};
      aromaRows.unshift(row);aromaRows=aromaRows.slice(0,9);drawShelf2();goView('shelf');strike(784,3,.05,[[1,1],[2,.3]]);
      window.__bagTake&&window.__bagTake('aromas',row,true);
      const moodL=S.mood?AR_MOODS.find(m=>m.id===S.mood).label:'Tự chọn';
      window.dispatchEvent(new CustomEvent('anyen-journal-add',{detail:{lake:'Hương · Haromy',quote:S.title+' — '+(S.form==='lo'?'Lọ Ước tinh dầu':'Túi thảo mộc khô')+' · Tâm trạng: '+moodL+' · Cách xông: '+(S.method==='drip'?'nhỏ tinh dầu':'đốt thảo mộc')+' · '+mix.map(([id,d])=>AR(id).name+(S.method==='drip'?' '+d+' giọt':'')).join(' + ')+(S.wish?' · “'+S.wish+'”':''),at:Date.now()}}));
      S.step='done';render();
      if(typeof flowerDb!=='undefined'&&flowerDb){try{const {error}=await flowerDb.from('anyen_aroma_gifts').insert({form:row.form,aromas:row.aromas,drops:row.drops,title:row.title,wish:row.wish,name:row.name,method:S.method});if(!error)loadAromas()}catch(e){}}}
    rmPanel.oninput=e=>{if(e.target.matches('[data-ti]'))S.title=e.target.value;if(e.target.matches('[data-wi]'))S.wish=e.target.value};
    rmPanel.onclick=e=>{const md=e.target.closest('[data-mood]');if(md){const m=AR_MOODS.find(x=>x.id===md.dataset.mood);S.mood=m.id;S.sel=m.mix.map(x=>x[0]);S.breath=m.breath;S.info=S.sel[0];S.step='pick';goView('home');strike(523,2,.04);render();return}
      const sc=e.target.closest('[data-sc]');if(sc){arTap(sc.dataset.sc);return}
      const fm=e.target.closest('[data-form]');if(fm){S.form=fm.dataset.form;render();return}
      const a=e.target.closest('[data-ar]')?.dataset.ar;if(!a)return;
      if(a==='self'){S.step='pick';S.mood=null;S.sel=[];S.breath=[4,4,6];goView('left');render()}
      else if(a==='look-left')goView('left');else if(a==='look-right')goView('right');else if(a==='look-home')goView('home');
      else if(a==='back'){S.step='mood';S.sel=[];S.mood=null;S.info=null;goView('home');render()}
      else if(a==='drip'||a==='burn'){S.method=a;S.done=0;S.drops=[];S.form=a==='drip'?'lo':'tui';S.title=defaultTitle();const r=arRatio(ordered());S.plan=a==='drip'?r.flatMap(([id,d])=>Array(d).fill(id)):ordered().slice(0,3).concat(ordered().length===1?[ordered()[0]]:[]);S.step=a;goView(a);if(a==='drip')pip.visible=true;render()}
      else if(a==='drop'){if(drip)return;const id=S.plan[S.done++];S.drops.push(id);drip={t0:performance.now()};drop.material.color.set(AR(id).c);setTimeout(()=>{strike(1568,.35,.05,[[1,1],[2.4,.4]]);strike(1046,.6,.025)},700);rmHint('💧 '+AR(id).name+' · giọt '+S.done+'/'+S.plan.length);render()}
      else if(a==='pinch'){const id=S.plan[S.done],p=pinch[S.done];S.done++;S.drops.push(id);p.clear();for(let k=0;k<6;k++){const l=new THREE.Mesh(new THREE.SphereGeometry(.02,5,3),mat(new THREE.Color(AR(id).c).lerp(new THREE.Color('#6a5a3a'),.4)));l.scale.set(1.6,.4,1);l.position.set(Math.cos(k)*.04+(S.done-2)*.05,.175,Math.sin(k)*.04);p.add(l)}p.visible=true;if(typeof katSwish==='function')katSwish();setTimeout(()=>strike(1318,3,.04,[[1,1],[2.76,.3]]),300);rmHint('🔥 '+AR(id).name+' trên than hồng');render()}
      else if(a==='sit'){pip.visible=false;S.step='sit';goView('seat');render()}
      else if(a==='b6')startBreath(6,0);else if(a==='b3')startBreath(0,180);
      else if(a==='stop'){if(S.br)clearTimeout(S.br.t);S.br=null;brEl.hidden=true;S.breathPhase=0;S.step='gift';render()}
      else if(a==='gift'){S.step='gift';render()}
      else if(a==='keep')keepGift();
      else if(a==='again'){S.step='mood';S.sel=[];S.mood=null;S.info=null;S.method=null;S.done=0;S.drops=[];for(const p of pinch)p.visible=false;goView('home');render()}
      else if(a==='shelf')goView('shelf');else if(a==='kho')openArchive('aromas')};
    st.cleanup=()=>{if(S.br)clearTimeout(S.br.t);brEl.hidden=true;st.onAromas=null};
    rmHint('Nhà Hương · Haromy, ngôi nhà của mùi thơm Hạnh phúc · chạm tủ để chọn mùi · kéo để nhìn quanh');render()}
  function roomQuanTra(st){rmHint('Pha một ấm trà theo từng bước · Kéo để nhìn quanh');st.target.set(0,.6,0);st.dist=3.6;
    rAdd(st,new THREE.Mesh(new THREE.BoxGeometry(1.8,.36,1.1),mat('#3e2c20')),0,.18,0);for(const z of [-.95,.95])rAdd(st,new THREE.Mesh(new THREE.CylinderGeometry(.34,.36,.14,14),mat('#6e4a33')),0,.07,z*1.3);
    const stove=rAdd(st,new THREE.Mesh(new THREE.CylinderGeometry(.16,.2,.22,10),mat('#5a3a28')),-1.3,.11,0);const kettle=rAdd(st,new THREE.Mesh(new THREE.SphereGeometry(.16,12,8),mat('#2f2a26')),-1.3,.36,0);kettle.scale.y=.8;
    const pot=new THREE.Group();pot.position.set(-.35,.36,0);st.sc.add(pot);const body=new THREE.Mesh(new THREE.SphereGeometry(.13,14,10),mat('#6a3e2a'));body.scale.y=.8;body.position.y=.1;pot.add(body);const sp=new THREE.Mesh(new THREE.CylinderGeometry(.015,.028,.14,6),mat('#6a3e2a'));sp.position.set(.14,.13,0);sp.rotation.z=-1;pot.add(sp);const lid=new THREE.Mesh(new THREE.SphereGeometry(.05,8,6),mat('#6a3e2a'));lid.position.y=.2;pot.add(lid);
    const cups=[],teas=[];for(const [x,z] of [[.3,-.2],[.3,.2],[.6,0]]){const c=rAdd(st,new THREE.Mesh(new THREE.LatheGeometry([[0,0],[.05,0],[.065,.07]].map(([a,b])=>new THREE.Vector2(a,b)),14),mat('#ece4d0')),x,.36,z);const t=rAdd(st,new THREE.Mesh(new THREE.CylinderGeometry(.055,.045,.01,14),new THREE.MeshStandardMaterial({color:'#a87a2a',roughness:.2})),x,.37,z);t.visible=false;cups.push(c);teas.push(t)}
    const jar=rAdd(st,new THREE.Mesh(new THREE.CylinderGeometry(.09,.1,.2,12),mat('#3f5f52')),-.6,.46,-.35);
    const steam=[];const sm=new THREE.MeshBasicMaterial({color:'#efe9dc',transparent:true,opacity:.2,depthWrite:false});for(let k=0;k<8;k++){const p=rAdd(st,new THREE.Mesh(new THREE.SphereGeometry(.04,6,4),sm.clone()),0,0,0);p.userData.k=k;steam.push(p)}
    let step=0,boiling=false,pour=0;const STEPS=[['🔥 Đun nước','Nước đang sôi lăn tăn…'],['🫖 Tráng ấm','Tráng ấm bằng nước nóng cho ấm đều.'],['🍃 Cho trà','Một nhúm trà vào ấm, nghe mùi lá dậy lên.'],['⏳ Hãm trà','Chờ một hơi thở dài để trà ngấm.'],['🍵 Rót trà','Rót đều tay, mỗi chén một ít, xoay vòng.'],['🙏 Mời trà','Hai tay nâng chén, mời người đối diện.']];
    st.tick.push(t=>{for(const p of steam){const u=((t*.4+p.userData.k/8)%1),src=step>=4?cups[0]:boiling?kettle:pot;p.visible=boiling||step>=3;p.position.set(src.position.x+Math.sin(t+p.userData.k)*.03*u,src.position.y+.15+u*.5,src.position.z);p.scale.setScalar(1+u*2);p.material.opacity=.2*(1-u)}
      if(pour>0){pour=Math.max(0,pour-.01);pot.rotation.z=-Math.sin(Math.min(1,pour*2)*Math.PI/2)*.7}});
    function render(){const s=STEPS[step];rmPanel.innerHTML='<p>'+(step<STEPS.length?'Bước '+(step+1)+'/'+STEPS.length+' · '+s[1]:'')+'</p><div class="rm-steps">'+STEPS.map((x,i)=>'<span class="'+(i<step?'done':i===step?'on':'')+'">'+x[0]+'</span>').join('')+'</div><div class="rm-row">'+(step<STEPS.length?'<button class="rm-gold" data-qt="next">'+s[0]+'</button>':'<button data-qt="again">🔁 Pha ấm mới</button>')+'</div><p class="rm-quote" id="teaQuote"></p>'}
    render();rmPanel.onclick=e=>{const a=e.target.closest('[data-qt]')?.dataset.qt;if(!a)return;
      if(a==='again'){step=0;for(const t of teas)t.visible=false;render();return}
      if(step===0){boiling=true;strike(523,2,.03,[[1,1]]);setTimeout(()=>{boiling=false},2600)}else if(step===1||step===3){pour=1}else if(step===2){jar.rotation.z=.6;setTimeout(()=>jar.rotation.z=0,700)}else if(step===4){pour=1;teas.forEach((t,i)=>setTimeout(()=>{if(!st.run)return;t.visible=true;strike(880,1.2,.02,[[1,1]])},300+i*350))}
      step++;render();if(step>=STEPS.length){const q=TEA_WORDS[Math.floor(Math.random()*TEA_WORDS.length)];document.getElementById('teaQuote').textContent='🍵 '+q;rmHint('Mời bạn một chén trà · '+q)}}}
  function roomTuGia(st){let sty='gian_di';try{const v=localStorage.getItem('yen_home_style');if(HOME_STYLES[v])sty=v}catch(e){}
    rmHint('Tư Gia của bạn · Chỉ bạn thấy nhà mình · Kéo để nhìn quanh');st.target.set(0,.8,-.4);st.dist=4.4;st.pitch=.16;
    const tint=[];const T=(m,k)=>{tint.push([m,k]);return m};
    const table=rAdd(st,new THREE.Mesh(new THREE.CylinderGeometry(.75,.8,.08,24),T(mat('#6e4a33'),'acc')),0,.32,.3);rAdd(st,new THREE.Mesh(new THREE.CylinderGeometry(.18,.24,.28,10),mat('#4e3a2a')),0,.14,.3);
    for(let k=0;k<6;k++){const a=k*Math.PI/3;rAdd(st,new THREE.Mesh(new THREE.CylinderGeometry(.24,.26,.1,14),T(mat('#c9b38a'),'cush')),Math.sin(a)*1.25,.05,.3+Math.cos(a)*1.25)}
    const pot=rAdd(st,new THREE.Mesh(new THREE.SphereGeometry(.11,12,8),mat('#6a3e2a')),0,.44,.3);pot.scale.y=.8;
    for(let k=0;k<6;k++){const a=k*Math.PI/3;rAdd(st,new THREE.Mesh(new THREE.CylinderGeometry(.045,.035,.06,10),mat('#ece4d0')),Math.sin(a)*.5,.39,.3+Math.cos(a)*.5)}
    // Kệ Lưu Hương 9 ô (3 × 3) trên tường sau
    const shelf=new THREE.Group();shelf.position.set(-1.9,1.1,-3.38);st.sc.add(shelf);const sm=T(mat('#5b3d2a'),'acc');
    for(let i=0;i<4;i++){const b=new THREE.Mesh(new THREE.BoxGeometry(1.9,.05,.32),sm);b.position.set(0,i*.6,0);shelf.add(b);const v=new THREE.Mesh(new THREE.BoxGeometry(.05,1.85,.32),sm);v.position.set(-.95+i*.633,.9,0);shelf.add(v)}
    const glowM=new THREE.MeshBasicMaterial({color:'#ffe7b8',transparent:true,opacity:.18});for(let r=0;r<3;r++)for(let c=0;c<3;c++){const q=new THREE.Mesh(new THREE.PlaneGeometry(.55,.5),glowM);q.position.set(-.633+c*.633,.3+r*.6,-.12);shelf.add(q)}
    // cửa sổ lớn nhìn ra hồ sen
    const win=rAdd(st,new THREE.Mesh(new THREE.PlaneGeometry(2.2,1.4),new THREE.MeshBasicMaterial({color:'#9fd0c4'})),1.6,1.7,-3.42);const fr=rAdd(st,new THREE.Mesh(new THREE.BoxGeometry(2.36,1.56,.06),T(mat('#5b3d2a'),'acc')),1.6,1.7,-3.46);
    for(let k=0;k<4;k++){const lo=rAdd(st,new THREE.Mesh(new THREE.SphereGeometry(.09,8,6),mat('#ef9fb9')),.8+k*.5,1.25+(k%2)*.12,-3.4);lo.scale.y=.6}
    const plant=rAdd(st,new THREE.Mesh(new THREE.IcosahedronGeometry(.32,0),mat('#4f7f4c')),3.2,.55,-2.8);rAdd(st,new THREE.Mesh(new THREE.CylinderGeometry(.2,.16,.36,10),mat('#b0754f')),3.2,.18,-2.8);
    function apply(k){sty=k;try{localStorage.setItem('yen_home_style',k)}catch(e){}const S=HOME_STYLES[k];
      st.sc.traverse(o=>{if(!o.isMesh||!o.material||!o.material.color)return;const p=o.position;if(o.geometry.type==='BoxGeometry'){const g=o.geometry.parameters;if(g.width===8&&g.height===.1)o.material.color.set(S.floor);else if((g.width===8&&g.height===4)||(g.width===.12&&g.height===4))o.material.color.set(S.wall)}});
      for(const [m,t] of tint)m.color.set(t==='acc'?S.acc:k==='sang_chanh'?'#c8a96a':k==='hanh_phuc'?'#f3c3cf':'#c9b38a');render()}
    function render(){rmPanel.innerHTML='<p>🏡 <b>Tư Gia của bạn</b> · Phong cách:</p><div class="rm-row">'+Object.entries(HOME_STYLES).map(([k,v])=>'<button type="button" data-hs="'+k+'"'+(k===sty?' class="sel"':'')+'>'+v.label+'</button>').join('')+'</div>'+
      '<p class="rm-note">Bàn trà 6 chỗ · Kệ Lưu Hương 9 ô · Góc Gieo Hạt ở cạnh nhà. Bày đồ từ Túi An Yên, gieo hạt và mời tối đa 5 khách sẽ mở ở bước tiếp theo.</p>'}
    rmPanel.onclick=e=>{const b=e.target.closest('[data-hs]');if(b)apply(b.dataset.hs)};apply(sty)}
  function roomTinhThat(st){rmHint('Nhuộm vải, chọn số điều, rồi khâu từng mảnh · Chạm mảnh đã khâu để đổi màu');st.target.set(0,1.2,0);st.dist=3.6;st.pitch=.08;
    const fr=new THREE.Group();fr.position.set(0,0,-.6);st.sc.add(fr);const wood=mat('#5b3d2a');for(const x of [-1.5,1.5]){const l=new THREE.Mesh(new THREE.BoxGeometry(.1,2.3,.1),wood);l.position.set(x,1.15,0);fr.add(l)}for(const y of [.45,2.05]){const b=new THREE.Mesh(new THREE.BoxGeometry(3.1,.09,.09),wood);b.position.set(0,y,0);fr.add(b)}
    // Kho y: the robes hang open on the back wall above the sewing frame (five over four), each showing its patchwork as it was sewn
    const shelf=new THREE.Group();shelf.position.set(0,0,-3.38);st.sc.add(shelf);for(const y of [3.05,2.25]){const rod=new THREE.Mesh(new THREE.CylinderGeometry(.022,.022,7.4,8),mat('#4e3a2a'));rod.rotation.z=Math.PI/2;rod.position.set(0,y,.06);shelf.add(rod)}
    const drawKho=()=>{while(shelf.children.length>3){const o=shelf.children[3];shelf.remove(o);o.traverse(q=>{if(q.geometry)q.geometry.dispose();if(q.material)q.material.dispose()})}katRows.filter(r=>katAge(r)>KAT_CHANT_SEC||katInKho(r)).slice(0,9).forEach((r,i)=>{const top=i<5,c=robeCloth(r,1.3,.62);c.position.set(top?-2.9+i*1.45:-2.175+(i-5)*1.45,top?3.05-.37:2.25-.37,.08);shelf.add(c)})};drawKho();
    // dye tub: the strip of cloth dips into the dye of the chosen colour
    const tub=new THREE.Group();tub.position.set(-2.05,0,.35);st.sc.add(tub);tub.add(new THREE.Mesh(new THREE.CylinderGeometry(.36,.3,.5,16,1,true),mat('#5b3d2a')));tub.children[0].position.y=.25;
    const dye=new THREE.Mesh(new THREE.CircleGeometry(.34,20),new THREE.MeshStandardMaterial({color:kat.color,roughness:.3}));dye.rotation.x=-Math.PI/2;dye.position.y=.44;tub.add(dye);
    const strip=new THREE.Mesh(new THREE.PlaneGeometry(.22,.55),new THREE.MeshStandardMaterial({color:'#efe4cf',roughness:.95,side:THREE.DoubleSide}));strip.position.set(0,1.05,0);tub.add(strip);
    const bar=new THREE.Mesh(new THREE.CylinderGeometry(.02,.02,.5,6),wood);bar.rotation.z=Math.PI/2;bar.position.y=1.34;tub.add(bar);
    const kv={on:false,t0:0,from:null};/* camera: sewing frame, or up to the robe store on the back wall */
    st.tick.push(()=>{if(!kv.from)return;const u=Math.min(1,(performance.now()-kv.t0)/900),q=u*u*(3-2*u),to=kv.on?[2.3,-3.3,4.3,.02]:[1.2,0,3.6,.08];st.target.y=kv.from[0]+(to[0]-kv.from[0])*q;st.target.z=kv.from[1]+(to[1]-kv.from[1])*q;st.dist=kv.from[2]+(to[2]-kv.from[2])*q;st.pitch=kv.from[3]+(to[3]-kv.from[3])*q;if(u>=1)kv.from=null});
    let dip=null;const dipTo=c=>{dye.material.color.set(c);dip={t0:performance.now(),from:strip.material.color.clone(),to:new THREE.Color(c)};strike(240,1.2,.03,[[1,1]])};
    const cloth=new THREE.Group();cloth.position.set(0,1.25,-.55);st.sc.add(cloth);let pieces=[],sewn=0;const stitches=[];
    function layout(){const oldP=new Set(pieces);st.picks=st.picks.filter(x=>!oldP.has(x.obj));cloth.clear();pieces=[];sewn=0;stitches.length=0;const cols=kat.dieu,W=2.7,H=1.45,gap=.045,cw=(W-gap*(cols+1))/cols,c=new THREE.Color(kat.color),dark=new THREE.Color('#4a2e1e');
      const back=new THREE.Mesh(new THREE.PlaneGeometry(W+.08,H+.08),new THREE.MeshStandardMaterial({color:dark,roughness:.95,side:THREE.DoubleSide}));back.position.z=-.005;cloth.add(back);
      for(let i=0;i<cols;i++){/* each strip: two long pieces and one short, alternating up/down like rice-field plots */const longH=(H-gap*4)*.4,shortH=(H-gap*4)*.2,seq=i%2?[shortH,longH,longH]:[longH,longH,shortH];let y=H/2-gap;
        for(const h of seq){const m=new THREE.Mesh(new THREE.PlaneGeometry(cw,h),new THREE.MeshStandardMaterial({color:c,roughness:.9,transparent:true,opacity:.12,side:THREE.DoubleSide}));m.position.set(-W/2+gap+cw/2+i*(cw+gap),y-h/2,0);m.userData.wh=[cw,h];cloth.add(m);pieces.push(m);rTap(st,m,()=>{if(m.userData.ci!=null){m.userData.ci=curIdx();m.material.color.set(kat.color);strike(620,.4,.02,[[1,1]]);render()}else sewNext()});y-=h+gap}}
      render()}
    const curIdx=()=>Math.max(0,KAT_COLORS.findIndex(x=>x[1]===kat.color));
    function tintUnsewn(){for(const m of pieces)if(m.userData.ci==null)m.material.color.set(kat.color)}
    // a running stitch drawn round the edge of the piece just sewn
    function stitch(m){const [w,h]=m.userData.wh,iw=w/2-.03,ih=h/2-.03,pts=[];const per=2*(iw+ih)*2,n=Math.max(16,Math.round(per/.035));for(let k=0;k<=n;k++){let t=k/n*per,x,y;const e=2*iw,f=2*ih;if(t<e){x=-iw+t;y=ih}else if((t-=e)<f){x=iw;y=ih-t}else if((t-=f)<e){x=iw-t;y=-ih}else{t-=e;x=-iw;y=-ih+t}pts.push(new THREE.Vector3(x,y,.004))}
      const g=new THREE.BufferGeometry().setFromPoints(pts),line=new THREE.LineSegments(g,new THREE.LineBasicMaterial({color:'#f3e2b0'}));line.position.copy(m.position);g.setDrawRange(0,0);cloth.add(line);stitches.push({g,n:pts.length,t0:performance.now()})}
    st.tick.push(()=>{const now=performance.now();for(const s of stitches){const u=Math.min(1,(now-s.t0)/700);s.g.setDrawRange(0,Math.floor(u*s.n/2)*2)}
      if(dip){const u=Math.min(1,(now-dip.t0)/1400);strip.position.y=1.05-Math.sin(u*Math.PI)*.6;if(u>.5)strip.material.color.copy(dip.from).lerp(dip.to,Math.min(1,(u-.5)*2.5));if(u>=1)dip=null}});
    function sewNext(){if(kv.on){kv.on=false;kv.t0=performance.now();kv.from=[st.target.y,st.target.z,st.dist,st.pitch]}if(sewn>=pieces.length)return;const m=pieces[sewn++];m.userData.ci=curIdx();m.material.color.set(kat.color);m.material.opacity=1;m.material.transparent=false;stitch(m);katSwish();
      if(sewn%3===0){strike(1320,2.5,.025,[[1,1],[2.4,.3]]);rmHint('🪡 '+KAT_SEW_WORDS[(sewn/3-1)%KAT_SEW_WORDS.length])}render();if(sewn>=pieces.length){rmHint('Tấm y đã may xong · Gửi lời hồi hướng (nếu muốn) rồi gấp y');strike(196,4,.08)}}
    const esc=t=>String(t||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    function render(){const done=sewn>=pieces.length;rmPanel.innerHTML='<p>Y được may từ nhiều mảnh ghép như ruộng lúa xứ Magadha, mỗi đường viền là một bờ ruộng. Mỗi mũi khâu là một hơi thở có mặt.</p>'
      +'<p class="rm-note">Nhuộm vải: chọn một chậu thuốc nhuộm. Mỗi mảnh khâu nhận màu đang chọn, có thể may nhiều màu; chạm mảnh đã khâu để đổi màu.</p>'
      +'<div class="rm-row">'+KAT_COLORS.map(([n,c],i)=>'<button data-kc="'+c+'"'+(kat.color===c?' class="sel"':'')+'><span class="rm-dot" style="background:'+c+'"></span>'+n+' · '+KAT_DYES[i]+'</button>').join('')+'</div>'
      +'<div class="rm-row">'+KAT_DIEU.map(d=>'<button data-kd="'+d+'"'+(kat.dieu===d?' class="sel"':'')+'>'+d+' điều</button>').join('')+'<span class="rm-note">Đã khâu '+sewn+'/'+pieces.length+' mảnh</span></div>'
      +'<p class="rm-note">'+KAT_DIEU_INFO[kat.dieu]+'</p>'
      +(done?'<label class="kt-wish">Lời hồi hướng (không bắt buộc, sẽ hiện trong sổ kho y)<input data-kw maxlength="80" value="'+esc(kat.wish)+'" placeholder="Ví dụ: Hồi hướng bình an cho mẹ"></label><div class="rm-row">'+KAT_WISHES.map(w=>'<button data-kwt="'+esc(w)+'">'+w+'</button>').join('')+'</div>':'')
      +'<div class="rm-row">'+(done?'<button class="rm-gold" data-ks="fold">🙏 Gấp y, đặt lên khay và đội lên đầu</button>':'<button class="rm-gold" data-ks="sew">🪡 Khâu mảnh tiếp</button>')+'</div>'
      +'<div class="rm-row"><button data-ks="view">'+(kv.on?'🪡 Về khung may':'🧺 Nhìn kho y')+'</button><button data-ks="kho">📜 Sổ kho y</button></div><p class="rm-note">Kho y treo 9 tấm y gần nhất, trải đủ như lúc may · chạm vào tấm y hoặc Sổ kho y để xem đầy đủ.</p>'}
    rmPanel.oninput=e=>{if(e.target.matches('[data-kw]'))kat.wish=e.target.value.slice(0,80)};
    rmPanel.onclick=e=>{const c=e.target.closest('[data-kc]'),d=e.target.closest('[data-kd]'),s2=e.target.closest('[data-ks]'),wt=e.target.closest('[data-kwt]');if(c){kat.color=c.dataset.kc;tintUnsewn();dipTo(kat.color);render();return}if(d){kat.dieu=+d.dataset.kd;layout();return}
      if(wt){kat.wish=wt.dataset.kwt;render();return}
      if(s2?.dataset.ks==='kho'){openArchive('robes');return}if(s2?.dataset.ks==='view'){kv.on=!kv.on;kv.t0=performance.now();kv.from=[st.target.y,st.target.z,st.dist,st.pitch];render();return}if(s2?.dataset.ks==='sew')sewNext();else if(s2?.dataset.ks==='fold'){kat.wish=String(kat.wish||'').trim().slice(0,80);kat.pieces=pieces.map(m=>m.userData.ci).join('');const cnt=[0,0,0,0];for(const ch of kat.pieces)cnt[+ch]++;kat.color=KAT_COLORS[cnt.indexOf(Math.max(...cnt))][1];kat.phase='carry';closeRoom();setCarry(true);refreshKatPill();say('🟧 Bạn đang đội y trên đầu · Bấm "Rước y" để nhiễu Phật ba vòng')}};
    layout();strip.material.color.set(kat.color);st.onKho=drawKho;rTap(st,shelf,()=>openArchive('robes'))}
  function roomXuongGom(st){st.target.set(0,.85,0);st.dist=3.5;st.pitch=.16;
    if(gom.phase==='fire'||gom.phase==='spray'){rmHint('🔥 Gốm của bạn đang nung ngoài bãi bên hông nhà');rmPanel.innerHTML='<p>Gốm của bạn đang nằm trong lửa ở bãi nung bên hông nhà. Ra bãi nung để chờ lửa tàn và phun nước tạo màu.</p>';return}
    if(gom.phase==='carry'){setGomCarry(false);refreshGomPill();gom.phase='room';gom.step='xong'}
    if(gom.phase!=='room'){Object.assign(gom,{phase:'room',step:'nhao',kneads:0,shape:0,pattern:0,rounds:0,polish:0,seed:Math.floor(Math.random()*9999)})}
    rmHint('Nhà Chạm · gốm Chăm Bàu Trúc nặn tay, không bàn xoay · Kéo khung hình để nhìn quanh');
    rAdd(st,new THREE.Mesh(new THREE.CylinderGeometry(.32,.38,.55,12),mat('#6b4a32')),0,.275,0);const sand=rAdd(st,new THREE.Mesh(new THREE.CylinderGeometry(.36,.36,.02,18),mat('#d8cba8')),0,.56,0);sand.visible=false;
    const lump=rAdd(st,new THREE.Mesh(new THREE.DodecahedronGeometry(.2,1),mat('#7f604c')),0,.72,0);lump.scale.set(1,.75,1);
    const potMat=gomMaterial(gom.shape,-1,gom.seed,'wet',false);const pot=rAdd(st,new THREE.Mesh(gomGeo(gom.shape,.01),potMat),0,.57,0);pot.visible=false;
    const guestColor=(()=>{try{return JSON.parse(localStorage.getItem('yenGuestProfile17')||'{}').color||'#687b48'}catch(e){return '#687b48'}})();
    const potter=new THREE.Group();/* the guest, bent over the clay */{const body=new THREE.Mesh(new THREE.ConeGeometry(.24,.95,10),mat(guestColor));body.position.y=.48;potter.add(body);const head=new THREE.Mesh(new THREE.SphereGeometry(.12,12,10),mat('#d9b48f'));head.position.set(0,1.02,0);potter.add(head);
      for(const s of [-1,1]){const arm=new THREE.Mesh(new THREE.CylinderGeometry(.035,.035,.42,6),mat(guestColor));arm.position.set(s*.13,.72,-.16);arm.rotation.x=.9;potter.add(arm)}}
    st.sc.add(potter);let ang=1.9;const placePotter=()=>{potter.position.set(Math.sin(ang)*.95,0,Math.cos(ang)*.95);potter.rotation.set(0,ang,0);potter.rotateX(-.32)};placePotter();
    const shelf=new THREE.Group();shelf.position.set(0,0,-3.05);st.sc.add(shelf);for(let k=0;k<6;k++){const b=new THREE.Mesh(new THREE.BoxGeometry(4,.06,.45),mat('#4e3a2a'));b.position.y=.12+k*.44;shelf.add(b)}
    const drawShelf=()=>{while(shelf.children.length>6)gomDispose(shelf.children[6],shelf);gomRows.filter(r=>gomAge(r)>=GOM_FIRE_SEC).slice(0,9).forEach((r,i)=>{const m=gomMesh(r,.72);m.position.set(-1.65+(i%6)*.66,.15+Math.floor(i/6)*.44,0);shelf.add(m)})};drawShelf();st.onPots=drawShelf;rTap(st,shelf,()=>openArchive('pots'));
    let anim=null,dryT=null;
    const setPot=frac=>{pot.geometry.dispose();pot.geometry=gomGeo(gom.shape,frac);pot.visible=frac>0;lump.visible=frac<1;const k=Math.max(.15,1-frac);lump.scale.set(k,.75*k,k);lump.position.y=.57+.15*k};
    const retex=stage=>{potMat.map.dispose();const t=new THREE.CanvasTexture(gomCanvas(gom.shape,['nhao','cat','dang','nan','chuot','hoavan'].includes(gom.step)?-1:gom.pattern,gom.seed,stage));t.colorSpace=THREE.SRGBColorSpace;t.wrapS=THREE.RepeatWrapping;potMat.map=t;potMat.roughness=gom.polish>=2?.55:gom.polish?.75:.95;potMat.needsUpdate=true};
    // resume a half-made pot if the guest stepped out
    if(['nan','chuot','hoavan','phoi','xong'].includes(gom.step)){sand.visible=true;setPot(gom.rounds/GOM_ROUNDS);retex(gom.step==='xong'?'dry':'wet')}else if(gom.step==='dang'||gom.step==='cat'){sand.visible=gom.step==='dang'}
    st.tick.push(t=>{if(anim){const u=Math.min(1,(performance.now()-anim.t0)/anim.dur);if(anim.kind==='round'){ang=anim.a0+u*Math.PI*2;placePotter();potter.position.y=Math.abs(Math.sin(u*Math.PI*8))*.03;setPot((gom.rounds-1+u)/GOM_ROUNDS);const h=u<.5?'Hít vào…':'Thở ra…';if(anim.h!==h){anim.h=h;rmHint('🚶 Đi lùi quanh đôn · vòng '+gom.rounds+'/'+GOM_ROUNDS+' · '+h)}}
        else if(anim.kind==='knead'){const s=1-Math.sin(u*Math.PI)*.25;lump.scale.set(1+(1-s)*.6,.75*s,1+(1-s)*.6)}
        if(u>=1){const k=anim.kind;anim=null;if(k==='round'&&gom.rounds>=GOM_ROUNDS){gom.step='chuot';setPot(1)}render()}}});
    st.cleanup=()=>{clearInterval(dryT);st.onPots=null};
    const btn=(k,label,gold)=>'<button data-gm="'+k+'"'+(gold?' class="rm-gold"':'')+(anim?' disabled':'')+'>'+label+'</button>';
    function render(){const s=gom.step;let h='';
      if(s==='nhao')h='<p>Đất sét ven sông được đập nhỏ, trộn cát rồi nhào kỹ. Mỗi lần nhào là một hơi thở.</p><div class="rm-row">'+btn('knead','👐 Nhào đất · '+gom.kneads+'/5',1)+'</div>';
      else if(s==='cat')h='<p>Rắc một lớp cát trắng mỏng lên mặt đôn để đất không dính, rồi đặt khối đất lên.</p><div class="rm-row">'+btn('sand','🤲 Rắc cát, đặt đất lên đôn',1)+'</div>';
      else if(s==='dang')h='<p>Chọn dáng gốm. Ở Bàu Trúc không dùng khuôn: mỗi món là một độc bản.</p><div class="rm-row">'+GOM_SHAPES.map((g,i)=>'<button data-gs="'+i+'"'+(gom.shape===i?' class="sel"':'')+'>'+g.name+'</button>').join('')+'</div><div class="rm-row">'+btn('start','🚶 Bắt đầu nặn',1)+'</div>';
      else if(s==='nan')h='<p>Không có bàn xoay: người thợ cúi xuống, đôi tay vuốt đất, chân đi lùi quanh đôn. Mỗi vòng thân gốm cao thêm một chút. Bước theo hơi thở.</p><div class="rm-row">'+btn('round','🚶 Đi lùi một vòng · '+gom.rounds+'/'+GOM_ROUNDS,1)+'</div>';
      else if(s==='chuot')h='<p>Chuốt láng thân gốm: vuốt bằng miếng vải ướt, rồi làm bóng bằng cật tre.</p><div class="rm-row">'+btn('polish0','💧 Vuốt vải ướt'+(gom.polish>=1?' ✓':''),!gom.polish)+btn('polish1','🎋 Làm bóng bằng cật tre',gom.polish===1)+'</div>';
      else if(s==='hoavan')h='<p>Khắc hoa văn bằng những dụng cụ mộc mạc.</p><div class="rm-row">'+GOM_TOOLS.map((t,i)=>'<button data-gt="'+i+'"'+(gom.pattern===i?' class="sel"':'')+'>'+t[0]+' · '+t[1]+'</button>').join('')+'</div><div class="rm-row">'+btn('carve','✍️ Khắc hoa văn',1)+'</div>';
      else if(s==='phoi')h='<p>Phơi gốm dưới nắng cho khô. <span class="rm-note">Thực tế ở Bàu Trúc gốm phơi nắng khoảng 4–6 giờ; trong Rừng Yên rút lại '+GOM_DRY_SEC+' giây.</span></p><div class="rm-row">'+(dryT?'<span class="rm-note">☀️ Đang phơi nắng · còn '+gom.dryLeft+' giây</span>':btn('dry','☀️ Phơi nắng',1))+'</div>';
      else if(s==='xong')h='<p>Gốm mộc đã khô. Đội gốm lên đầu như các bà, các mẹ ở làng gốm, mang ra bãi nung bên hông nhà.</p><div class="rm-row">'+btn('carry','🏺 Đội gốm ra bãi nung',1)+'</div>';
      rmPanel.innerHTML=h+'<div class="rm-row"><button data-gm="kho">📜 Xem kho gốm</button></div><p class="rm-note">Kệ gốm 6 × 6 bày 36 chiếc gần nhất · chạm kệ hoặc nút trên để xem đầy đủ.</p>'}
    render();
    rmPanel.onclick=e=>{const sh=e.target.closest('[data-gs]');if(sh){gom.shape=+sh.dataset.gs;render();return}const tl=e.target.closest('[data-gt]');if(tl){gom.pattern=+tl.dataset.gt;render();return}
      const a=e.target.closest('[data-gm]')?.dataset.gm;if(a==='kho'){openArchive('pots');return}if(!a||anim)return;
      if(a==='knead'){gom.kneads++;strike(82,.6,.1,[[1,1],[1.6,.3]]);anim={kind:'knead',t0:performance.now(),dur:600};if(gom.kneads>=5)gom.step='cat';render()}
      else if(a==='sand'){sand.visible=true;strike(2400,.4,.012,[[1,1]]);gom.step='dang';render()}
      else if(a==='start'){gom.step='nan';gom.rounds=0;pot.geometry.dispose();pot.geometry=gomGeo(gom.shape,.01);render()}
      else if(a==='round'){gom.rounds++;anim={kind:'round',t0:performance.now(),dur:4800,a0:ang};render()}
      else if(a==='polish0'){gom.polish=Math.max(1,gom.polish);retex('wet');strike(520,.8,.02,[[1,1]]);render()}
      else if(a==='polish1'){if(!gom.polish)return;gom.polish=2;retex('wet');strike(700,.8,.02,[[1,1]]);gom.step='hoavan';render()}
      else if(a==='carve'){gom.step='phoi';retex('wet');strike(900,.5,.02,[[1,1],[2.2,.3]]);render()}
      else if(a==='dry'){gom.dryLeft=GOM_DRY_SEC;dryT=setInterval(()=>{gom.dryLeft--;if(gom.dryLeft<=0){clearInterval(dryT);dryT=null;gom.step='xong';retex('dry');rmHint('☀️ Gốm mộc đã khô')}render()},1000);render()}
      else if(a==='carry'){closeRoom();gom.phase='carry';setGomCarry(true);refreshGomPill();say('🏺 Đội gốm ra bãi nung · Chạm nút bên dưới để đi');}}}
  // ---------------------------------------------------------------- Nhà Niệm · House of Mindfulness (Đ1)
  // Bản vẽ nội thất 11 × 11 × 6,2 m: gỗ trầm #4A3C2E, cột #261C14, đá bazan #4C4A43, chiếu cói #9E8969.
  // Cửa vòm Trăng (R 1,8 m) nhìn ra Hồ Niệm, giếng trời Oculus (R 1,8 m) rọi cột nắng xuống Đèn Thở ở tâm phòng.
  // Đèn Thở là PointLight duy nhất; toàn bộ lưới nội thất dưới 1.750 tam giác (window.__niem.tris() để kiểm).
  // 00 Gột bụi rồi chọn luồng: Solo (không vào kênh nào) hoặc Phiên 1+5 (kênh phiên riêng của lịch Healer, qua space-chat.js).
  // 01 Thở cùng Đèn Thở · 02 Khoảng Lặng 18 phút · 03 Lần chuỗi 108 hạt · 04 Bát Buông Bỏ (chữ chỉ ở trên máy, tan ngay, không lưu, không gửi) & Kệ 9 thẻ.
  // Không tạo kho vật phẩm: mốc lần chuỗi chỉ ghi nhẹ vào Nhật ký An Yên trên máy.
  function roomNhaNiem(st){
    const R=5.5,H=6.2,C={wood:'#4A3C2E',col:'#261C14',basalt:'#4C4A43',mat:'#9E8969',floor:'#3a2d21',brass:'#a6824b',pine:'#2f5a48',lampW:'#FFFDF5',lampG:'#D9A338'};
    const sc=st.sc,texs=[],offs=[];
    const on=(t,n,f,o)=>{t.addEventListener(n,f,o);offs.push(()=>t.removeEventListener(n,f,o))};
    const M=(c,o)=>new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:.9,side:THREE.DoubleSide},o||{}));
    const add=(geo,m,x,y,z,rx,ry)=>{const o=new THREE.Mesh(geo,m);o.position.set(x,y,z);if(rx)o.rotation.x=rx;if(ry)o.rotation.y=ry;sc.add(o);return o};
    const tex=(w,h,draw,rep)=>{const cv=document.createElement('canvas');cv.width=w;cv.height=h;const c=cv.getContext('2d');draw(c,w,h);const t=new THREE.CanvasTexture(cv);t.colorSpace=THREE.SRGBColorSpace;if(rep){t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rep[0],rep[1])}texs.push(t);t.cv=cv;t.c=c;return t};
    const glow=(c,o)=>new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:o,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide});
    const LS=(k,v)=>{try{if(v===undefined)return localStorage.getItem(k);localStorage.setItem(k,v)}catch(e){return null}};
    sc.background=new THREE.Color('#17120d');roomBox.classList.add('niem');
    // ---- ánh sáng: bán cầu dịu + nắng giếng trời (định hướng) + 1 PointLight Đèn Thở
    const LIGHT={hemi:.7,key:.9,lamp:4.2};st.hemi.color.set('#f3e2c2');st.hemi.groundColor.set('#2a2016');st.key.color.set('#ffe7bd');st.key.position.set(1.2,9,2.5);
    // ---- vỏ phòng: sàn ván, tường ván gỗ trầm, vách lam phía sau lưng (Đông-Bắc), trần có giếng trời
    const boards=(seam,rx,ry)=>tex(128,128,(c,w,h)=>{c.fillStyle=C.wood;c.fillRect(0,0,w,h);for(let i=0;i<40;i++){c.fillStyle='rgba(20,12,6,'+(.04+Math.random()*.05)+')';c.fillRect(Math.random()*w,0,1+Math.random()*2,h)}c.fillStyle=seam;c.fillRect(0,0,3,h);c.fillRect(w/2,0,3,h)},[rx,ry]);
    const floorT=tex(128,128,(c,w,h)=>{c.fillStyle=C.floor;c.fillRect(0,0,w,h);for(let i=0;i<4;i++){c.fillStyle='rgba(0,0,0,.28)';c.fillRect(0,i*32,w,2);c.fillStyle='rgba(255,230,190,.035)';c.fillRect(0,i*32+2,w,14)}},[6,6]);
    add(new THREE.PlaneGeometry(2*R,2*R),M('#fff',{map:floorT}),0,0,0,-Math.PI/2);
    add(new THREE.PlaneGeometry(2*R,H),M('#fff',{map:boards('#231910',11,1)}),-R,H/2,0,0,Math.PI/2);
    add(new THREE.PlaneGeometry(2*R,H),M('#fff',{map:boards('#231910',11,1)}),R,H/2,0,0,-Math.PI/2);
    const lamT=tex(64,64,(c,w,h)=>{c.fillStyle='#1c140d';c.fillRect(0,0,w,h);const g=c.createLinearGradient(0,0,w,0);g.addColorStop(0,'#3a2d20');g.addColorStop(.5,'#5a4632');g.addColorStop(1,'#3a2d20');c.fillStyle=g;c.fillRect(8,0,w-16,h)},[26,1]);
    add(new THREE.PlaneGeometry(2*R,H),M('#fff',{map:lamT}),0,H/2,R,0,Math.PI);
    // mặt tường Tây-Nam có lỗ tròn cửa vòm Trăng
    const MY=2.2,MR=1.8;{const s=new THREE.Shape();s.moveTo(-R,0);s.lineTo(R,0);s.lineTo(R,H);s.lineTo(-R,H);s.lineTo(-R,0);const hole=new THREE.Path();hole.absarc(0,MY,MR,0,Math.PI*2,true);s.holes.push(hole);
      const t=boards('#231910',1,1);t.repeat.set(1,1);add(new THREE.ShapeGeometry(s,8),M('#fff',{map:t}),0,0,-R)}
    add(new THREE.RingGeometry(MR,MR+.18,32),M(C.col),0,MY,-R+.02);
    // khung nhìn ra Hồ Niệm: mặt nước phẳng gương, rừng thông, sen trắng
    const viewT=tex(512,512,(c,w,h)=>{let g=c.createLinearGradient(0,0,0,h*.52);g.addColorStop(0,'#cfdcd6');g.addColorStop(1,'#f1e6cb');c.fillStyle=g;c.fillRect(0,0,w,h);
      c.fillStyle='#8fa596';c.beginPath();c.moveTo(0,250);for(let x=0;x<=w;x+=32)c.lineTo(x,226+Math.sin(x*.02)*14);c.lineTo(w,262);c.lineTo(0,262);c.fill();
      for(const [x,s,col] of [[70,1.25,'#29483a'],[130,.85,'#35574a'],[190,1,'#2c4b3e'],[330,1.15,'#29483a'],[392,.8,'#36584a'],[452,1.3,'#253f34']]){c.fillStyle=col;for(let k=0;k<3;k++){c.beginPath();c.moveTo(x,262-170*s+k*48*s);c.lineTo(x-34*s-k*10*s,262-90*s+k*40*s);c.lineTo(x+34*s+k*10*s,262-90*s+k*40*s);c.fill()}}
      g=c.createLinearGradient(0,262,0,h);g.addColorStop(0,'#7fa5a2');g.addColorStop(1,'#3c6466');c.fillStyle=g;c.fillRect(0,262,w,h-262);c.fillStyle='rgba(255,255,255,.18)';for(let k=0;k<9;k++)c.fillRect(60+k*41%380,290+k*22,90-k*5,2);
      for(const [x,y,r] of [[170,372,30],[330,410,38],[240,452,24],[400,350,20]]){c.fillStyle='#4f7d5c';c.beginPath();c.ellipse(x,y,r,r*.35,0,.3,Math.PI*2-.1);c.fill()}
      for(const [x,y] of [[178,360],[338,396]]){c.fillStyle='#fbfaf3';for(let k=-2;k<=2;k++){c.beginPath();c.ellipse(x+k*7,y-6,6,14,k*.35,0,Math.PI*2);c.fill()}c.fillStyle='#d8a73a';c.beginPath();c.arc(x,y-4,4,0,Math.PI*2);c.fill()}});
    add(new THREE.PlaneGeometry(4.4,4.4),new THREE.MeshBasicMaterial({map:viewT}),0,MY,-R-.4);
    add(new THREE.BoxGeometry(3.8,.4,.5),M(C.basalt),0,.2,-R+.25);/* bậu cửa đá bazan */
    // trần gỗ tối mở giếng trời tròn, đĩa trời sáng phía trên, xà và cột góc
    {const s=new THREE.Shape();s.moveTo(-R,-R);s.lineTo(R,-R);s.lineTo(R,R);s.lineTo(-R,R);s.lineTo(-R,-R);const hole=new THREE.Path();hole.absarc(0,0,MR,0,Math.PI*2,true);s.holes.push(hole);add(new THREE.ShapeGeometry(s,8),M(C.col),0,H,0,Math.PI/2)}
    add(new THREE.CircleGeometry(MR,16),new THREE.MeshBasicMaterial({color:'#fbf1d4'}),0,H+.35,0,Math.PI/2);
    for(const [w,d,x,z] of [[2*R,.35,0,-R+.18],[2*R,.35,0,R-.18],[.35,2*R,-R+.18,0],[.35,2*R,R-.18,0]])add(new THREE.BoxGeometry(w,.4,d),M(C.col),x,H-.2,z);
    for(const [x,z] of [[-R+.2,-R+.2],[R-.2,-R+.2],[-R+.2,R-.2],[R-.2,R-.2],[-2.6,-R+.2],[2.6,-R+.2]])add(new THREE.BoxGeometry(.4,H,.4),M(C.col),x,H/2,z);
    // ---- tâm phòng: chiếu cói, vũng nắng, cột nắng giếng trời, Đèn Thở trên bệ đá
    const matT=tex(64,64,(c,w,h)=>{c.fillStyle=C.mat;c.fillRect(0,0,w,h);c.strokeStyle='rgba(60,45,25,.25)';for(let y=0;y<h;y+=4){c.beginPath();c.moveTo(0,y);c.lineTo(w,y);c.stroke()}c.fillStyle='rgba(255,240,200,.08)';for(let x=0;x<w;x+=8)c.fillRect(x,0,3,h)},[7,7]);
    add(new THREE.CircleGeometry(3.3,24),M('#fff',{map:matT}),0,.012,0,-Math.PI/2);
    const pool=add(new THREE.CircleGeometry(2.1,16),glow('#ffe2a0',.12),0,.022,0,-Math.PI/2);
    const beamCol=add(new THREE.CylinderGeometry(MR*.95,2.1,H,16,1,true),glow('#ffe6a8',.07),0,H/2,0);
    add(new THREE.CylinderGeometry(.32,.42,.55,8),M(C.basalt),0,.275,0);
    const lamp=add(new THREE.SphereGeometry(.2,10,7),new THREE.MeshStandardMaterial({color:'#ffffff',emissive:C.lampW,emissiveIntensity:.85,roughness:.4}),0,.86,0);
    const haloT=tex(64,64,(c,w)=>{const g=c.createRadialGradient(32,32,0,32,32,32);g.addColorStop(0,'rgba(255,240,200,.9)');g.addColorStop(.35,'rgba(217,163,56,.35)');g.addColorStop(1,'rgba(217,163,56,0)');c.fillStyle=g;c.fillRect(0,0,w,w)});
    const halo=new THREE.Sprite(new THREE.SpriteMaterial({map:haloT,blending:THREE.AdditiveBlending,depthWrite:false,transparent:true}));halo.position.copy(lamp.position);halo.scale.setScalar(1.7);sc.add(halo);
    const light=new THREE.PointLight(C.lampG,LIGHT.lamp,12,1.5);light.position.set(0,1.05,0);sc.add(light);
    // ---- vòng tọa cụ 1 + 5: Healer (vàng đồng trầm) quay lưng ra cửa vòm Trăng, 5 khách (xanh thông trầm)
    const seats=[];for(let k=0;k<6;k++){const a=Math.PI+k*Math.PI/3,x=Math.sin(a)*2.4,z=Math.cos(a)*2.4,healer=k===0;
      const m=M(healer?C.brass:C.pine,{emissive:healer?'#7a5a24':'#1f4a3a',emissiveIntensity:0,roughness:.85});const s=add(new THREE.CylinderGeometry(.36,.4,.14,8),m,x,.08,z);s.userData={k,healer};seats.push(s)}
    const seatA=k=>Math.PI+k*Math.PI/3;
    // nhân vật ngồi tọa thiền (kiết già) trên tọa cụ: thân áo + vạt chân là 1 Lathe, đầu là khối 20 mặt; mỗi người 68 tam giác
    const ROBE=['#b8873f','#5b7f6b','#8a6a8e','#4f6f86','#9a6b4f','#6f7d52'],SKIN=new THREE.Color('#e2b98f');
    const bodyG=new THREE.LatheGeometry([[.34,0],[.36,.08],[.2,.17],[.22,.42],[.07,.5]].map(([a,b])=>new THREE.Vector2(a,b)),6);
    const bodies=new THREE.InstancedMesh(bodyG,new THREE.MeshStandardMaterial({color:'#ffffff',roughness:.85,side:THREE.DoubleSide,emissive:'#2a1d10',emissiveIntensity:.35}),6),heads=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(.11,0),new THREE.MeshStandardMaterial({color:'#ffffff',roughness:.7,flatShading:true}),6);
    bodies.count=heads.count=0;sc.add(bodies,heads);
    // bệ Chuông Đồng ngay dưới bậu cửa, cạnh tọa cụ Healer
    add(new THREE.BoxGeometry(.5,.18,.5),M(C.basalt),.85,.09,-3.05);
    const bell=add(new THREE.LatheGeometry([[0,0],[.13,.01],[.21,.08],[.23,.19],[.215,.21]].map(([a,b])=>new THREE.Vector2(a,b)),8),M('#b88d45',{metalness:.65,roughness:.32}),.85,.18,-3.05);
    const wave=add(new THREE.RingGeometry(.95,1,24),glow('#ffd88a',0),0,.03,0,-Math.PI/2);
    // ---- Tường trái · Trạm 3: bảng lần chuỗi 108 hạt (1 InstancedMesh), số đếm giữa vòng, vòng sáng đồng
    const BY=2.35,BR=1.02,bx=-R+.08;
    add(new THREE.BoxGeometry(.06,2.9,2.9),M(C.col),-R+.03,BY,0);const board=add(new THREE.PlaneGeometry(2.66,2.66),M('#e9dcc0',{roughness:1}),bx,BY,0,0,Math.PI/2);
    const beadT=tex(64,64,(c,w)=>{const g=c.createRadialGradient(24,22,2,32,32,30);g.addColorStop(0,'#fff3dc');g.addColorStop(.45,'#d9b48a');g.addColorStop(1,'#6b4a2c');c.fillStyle=g;c.beginPath();c.arc(32,32,29,0,Math.PI*2);c.fill()});
    const beads=new THREE.InstancedMesh(new THREE.PlaneGeometry(.09,.09),new THREE.MeshBasicMaterial({map:beadT,alphaTest:.5,side:THREE.DoubleSide}),108);sc.add(beads);
    const dummy=new THREE.Object3D(),cDone=new THREE.Color('#f1c98a'),cTodo=new THREE.Color('#7a5638');
    const countT=tex(256,256,()=>{});const counter=add(new THREE.PlaneGeometry(1.1,1.1),new THREE.MeshBasicMaterial({map:countT,transparent:true}),bx+.01,BY,0,0,Math.PI/2);
    const beadRing=add(new THREE.RingGeometry(BR+.09,BR+.15,28),glow('#f2c46a',.12),bx+.02,BY,0,0,Math.PI/2);
    // ---- Tường phải · Trạm 4: kệ 9 thẻ, Bát Nước Buông Bỏ bằng đá bazan
    add(new THREE.BoxGeometry(.06,1.75,2.7),M(C.col),R-.03,3.0,0);
    const cardT=tex(128,72,(c,w,h)=>{c.fillStyle='#f4ead6';c.fillRect(0,0,w,h);c.fillStyle='rgba(120,90,50,.35)';c.fillRect(22,26,84,4);c.fillRect(32,42,64,4);c.strokeStyle='#c8a96a';c.lineWidth=3;c.strokeRect(4,4,w-8,h-8)});
    const cards=new THREE.InstancedMesh(new THREE.PlaneGeometry(.66,.38),new THREE.MeshBasicMaterial({map:cardT,side:THREE.DoubleSide}),9);sc.add(cards);
    const cardPos=k=>[R-.09,3.45-Math.floor(k/3)*.5,(k%3-1)*.82];
    const drawCards=pick=>{for(let k=0;k<9;k++){const [x,y,z]=cardPos(k);dummy.position.set(x-(k===pick?.08:0),y,z);dummy.rotation.set(0,-Math.PI/2,0);dummy.scale.setScalar(k===pick?1.12:1);dummy.updateMatrix();cards.setMatrixAt(k,dummy.matrix);cards.setColorAt(k,new THREE.Color(k===pick?'#fff8e2':pick==null?'#b8ab92':'#6e6555'))}cards.instanceMatrix.needsUpdate=true;cards.instanceColor.needsUpdate=true};
    add(new THREE.BoxGeometry(1.1,.72,.9),M(C.col),R-.8,.36,0);
    const bowl=add(new THREE.LatheGeometry([[0,0],[.3,.02],[.46,.14],[.52,.3],[.5,.32]].map(([a,b])=>new THREE.Vector2(a,b)),10),M(C.basalt,{roughness:.75}),R-.8,.72,0);
    const waterT=tex(256,256,()=>{});const water=add(new THREE.CircleGeometry(.47,20),new THREE.MeshBasicMaterial({map:waterT}),R-.8,.72+.27,0);water.rotation.set(-Math.PI/2,0,-Math.PI/2);
    const ripple=add(new THREE.RingGeometry(.9,1,24),glow('#d8f0ee',0),R-.8,.72+.28,0,-Math.PI/2);
    // ---- âm thanh
    const ac=audio();
    const knock=()=>{strike(1150,.09,.07,[[1,1],[1.6,.4]]);strike(380,.14,.05,[[1,1]])};
    const bellSound=()=>{strike(196,10,.15,[[1,1],[2.76,.4],[5.4,.14],[1.5,.18]]);bell.userData.ring=performance.now();wave.userData.t0=performance.now()};
    const softBell=()=>strike(392,7,.07,[[1,1],[2.76,.3],[5.4,.1]]);
    let noiseBuf=null;const noise=()=>{if(noiseBuf||!ac)return noiseBuf;const n=ac.sampleRate*2,b=ac.createBuffer(1,n,ac.sampleRate),d=b.getChannelData(0);let l=0;for(let i=0;i<n;i++){l=(l+.02*(Math.random()*2-1))/1.02;d[i]=l*3.5}return noiseBuf=b};
    const splash=()=>{if(!ac)return;const s=ac.createBufferSource(),f=ac.createBiquadFilter(),g=ac.createGain(),t=ac.currentTime;s.buffer=noise();f.type='bandpass';f.frequency.value=1400;f.Q.value=.8;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.35,t+.15);g.gain.exponentialRampToValueAtTime(.001,t+1.6);s.connect(f).connect(g).connect(ac.destination);s.start(t);s.stop(t+1.7);[0,.35,.8].forEach(d=>setTimeout(()=>strike(1900+Math.random()*700,.25,.012,[[1,1]]),300+d*1000))};
    const bamboo=()=>[[523,0],[659,180],[587,420],[784,700]].forEach(([f,d])=>setTimeout(()=>strike(f,.9,.035,[[1,1],[2.7,.25],[4.1,.08]]),d));
    let amb=null;
    function ambientOn(){if(amb||!ac)return;const g=ac.createGain(),t=ac.currentTime;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(1,t+5);g.connect(ac.destination);
      const mk=(type,freq,q,vol)=>{const s=ac.createBufferSource(),f=ac.createBiquadFilter(),v=ac.createGain();s.buffer=noise();s.loop=true;f.type=type;f.frequency.value=freq;f.Q.value=q;v.gain.value=vol;s.connect(f).connect(v).connect(g);s.start();return {s,v}};
      const wind=mk('lowpass',420,.4,.22),wat=mk('bandpass',900,.7,.05);const lfo=ac.createOscillator(),lg=ac.createGain();lfo.frequency.value=.07;lg.gain.value=.1;lfo.connect(lg).connect(wind.v.gain);lfo.start();
      const drip=setInterval(()=>{if(Math.random()<.5)strike(1700+Math.random()*900,.3,.006,[[1,1]])},2600);amb={g,srcs:[wind.s,wat.s,lfo],drip}}
    function ambientOff(){if(!amb)return;const a=amb;amb=null;clearInterval(a.drip);try{const t=ac.currentTime;a.g.gain.cancelScheduledValues(t);a.g.gain.setValueAtTime(a.g.gain.value,t);a.g.gain.linearRampToValueAtTime(0,t+1.2)}catch(e){}setTimeout(()=>{for(const s of a.srcs)try{s.stop()}catch(e){}a.g.disconnect()},1400)}
    // ---- góc nhìn từng trạm (trượt mềm)
    const VIEWS={overview:[0,1.4,.6,0,.2,4.3],gate:[0,2.1,-3.2,0,.06,3.6],beads:[-R+.1,BY,0,Math.PI/2,.02,2.9],cards:[R-.1,2.95,0,-Math.PI/2,.04,2.7],bowl:[R-.8,1.0,0,-Math.PI/2,.62,2.1]};
    let tw=null;function goView(k){if(k==='seat'||k==='seatH'){const a=seatA(S.mySeat==null?3:S.mySeat);VIEWS.seat=[0,.45,0,a,.62,4.4];/* sau lưng mình, cao vừa đủ thấy cả vòng tọa cụ */k='seat'}const v=VIEWS[k];tw={a:[st.target.x,st.target.y,st.target.z,st.yaw,st.pitch,st.dist],b:v,t0:performance.now()};st.yawC=v[3]}
    st.minD=1.8;st.maxD=4.5;st.target.set(0,1.6,-1.2);st.yaw=0;st.pitch=.1;st.dist=4.4;goView('gate');
    // ---- trạng thái
    const S={entered:false,mode:'solo',pending:false,healer:false,healerHere:false,people:0,mySeat:3,occ:{},therapist:null,me:null,list:[],act:null,tab:'home',beads:0,mark:{},card:null,rel:null,dim:0,quiet:false};
    const BREATH={'446':[4,4,6],'478':[4,7,8]};
    const STATE_LINES={khoi:['Khởi','Hôm nay cần một cú đẩy nhẹ để bắt đầu.'],giao:['Giao','Hôm nay cần sự ấm áp và kết nối.'],an:['An','Hôm nay cần buông căng thẳng và ngủ yên.'],hoa:['Hoa','Hôm nay đang ổn, hãy sáng tạo và lan toả.'],tinh:['Tịnh','Hôm nay cần lắng xuống và hạ nhiệt.']};
    const ansense=()=>{try{const r=JSON.parse(localStorage.getItem('anyen-ansense-v1')||'{}').result;return r&&STATE_LINES[r.state]?r.state:null}catch(e){return null}};
    const CARDS=[['Thở ra dài hơn hít vào. Thế là đủ cho phút này.',['an','tinh']],['Buông một điều nhỏ. Bàn tay nhẹ thì lòng cũng nhẹ.',['tinh']],['Uống một ngụm nước thật chậm, cảm nhận nó đi qua.',['tinh','an']],
      ['Đặt một ý định nhỏ cho hôm nay, rồi bước bước đầu tiên.',['khoi']],['Đứng dậy, vươn vai, để ánh sáng chạm vào mặt.',['khoi']],['Gửi một lời cảm ơn cho một người, dù chỉ một dòng.',['giao']],
      ['Đặt tay lên ngực và nói thầm: mình đang ở đây với mình.',['giao','an']],['Nhìn một vật quen như thể lần đầu bạn thấy nó.',['hoa']],['Điều đang có mặt bây giờ là đủ để bắt đầu.',['hoa','khoi']]];
    const esc=t=>String(t).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
    const today=()=>new Date().toLocaleDateString('sv');
    const journal=(quote)=>{window.dispatchEvent(new CustomEvent('anyen-journal-add',{detail:{lake:'Niệm',title:'🕯️ Nhà Niệm',quote,at:Date.now()}}))};
    const inSession=()=>S.mode==='session';
    const send=p=>{if(inSession()&&S.healer&&window.anyenSpaceChat)window.anyenSpaceChat.send(p)};
    // ---- 108 hạt
    function drawBeads(){const cur=S.beads%108;for(let k=0;k<108;k++){const a=k/108*Math.PI*2;dummy.position.set(bx+.015,BY+Math.cos(a)*BR,-Math.sin(a)*BR);dummy.rotation.set(0,Math.PI/2,0);dummy.scale.setScalar(k===cur?1.45:1);dummy.updateMatrix();beads.setMatrixAt(k,dummy.matrix);beads.setColorAt(k,k<cur||(S.beads&&cur===0&&S.full)?cDone:cTodo)}beads.instanceMatrix.needsUpdate=true;beads.instanceColor.needsUpdate=true;
      const c=countT.c;c.clearRect(0,0,256,256);c.fillStyle='rgba(250,244,230,.92)';c.beginPath();c.arc(128,128,96,0,Math.PI*2);c.fill();c.strokeStyle='#a6824b';c.lineWidth=4;c.stroke();c.fillStyle='#3a2a1c';c.textAlign='center';c.font='600 72px Georgia, serif';c.fillText(String(S.full&&cur===0?108:cur),128,138);c.font='600 22px system-ui, sans-serif';c.fillStyle='#8c6a34';c.fillText('HẠT LÀNH',128,178);countT.needsUpdate=true}
    function bead(){S.beads++;S.full=false;knock();const n=S.beads%108||108;if(n===108)S.full=true;
      if(n===18||n===54||n===108){beadRing.userData.t0=performance.now();setTimeout(()=>strike(n===108?262:330,4,.05,[[1,1],[2,.3],[3,.12]]),120);
        const key=Math.floor((S.beads-1)/108)+':'+n;if(!S.mark[key]){S.mark[key]=1;journal('Lần chuỗi '+n+' hạt theo hơi thở'+(n===108?' · tròn một vòng':''));rmHint('📿 '+n+' hạt · đã ghi nhẹ vào Nhật ký An Yên')}}
      drawBeads();if(S.tab==='beads')render()}
    // ---- Bát Buông Bỏ: chữ chỉ nằm trong biến tạm, vẽ lên mặt nước rồi tan; không lưu, không gửi đi đâu
    const textCv=document.createElement('canvas');textCv.width=textCv.height=256;
    function paintWater(p){const c=waterT.c;let g=c.createRadialGradient(128,128,10,128,128,130);g.addColorStop(0,'#6f9ea2');g.addColorStop(1,'#29474b');c.fillStyle=g;c.fillRect(0,0,256,256);
      if(S.rel){const k=Math.max(0,p);for(let y=0;y<256;y+=3){const dx=Math.sin(y*.09+k*16)*k*k*30,dy=Math.sin(k*9+y*.05)*k*6;c.globalAlpha=Math.max(0,Math.min(1,(p<0?1+p/0.4:1)-k*1.05));c.drawImage(textCv,0,y,256,3,dx,y+dy,256,3)}c.globalAlpha=1}
      c.strokeStyle='rgba(230,248,246,.25)';c.lineWidth=2;for(let i=0;i<3;i++){const r=((performance.now()/40+i*40)%130);c.beginPath();c.arc(128,128,r,0,Math.PI*2);c.stroke()}waterT.needsUpdate=true}
    function release(text){text=String(text||'').trim().slice(0,80);if(!text||S.rel)return;const c=textCv.getContext('2d');c.clearRect(0,0,256,256);c.fillStyle='#fbf6e8';c.textAlign='center';c.font='italic 21px Georgia, serif';
      const words=text.split(/\s+/),lines=[];let ln='';for(const w of words){const t=ln?ln+' '+w:w;if(c.measureText(t).width>186&&ln){lines.push(ln);ln=w}else ln=t}if(ln)lines.push(ln);lines.slice(0,5).forEach((l,i,a)=>c.fillText(l,128,128-(a.length-1)*13+i*26+7));
      text=null;S.rel={t0:performance.now()};splash();goView('bowl');ripple.userData.t0=performance.now()+1400}
    // ---- Kệ 9 thẻ: mỗi ngày một thẻ, ưu tiên khớp trạng thái AnSense
    function drawCard(){const d=today();let saved=null;try{saved=JSON.parse(LS('yen_niem_the')||'null')}catch(e){}
      if(saved&&saved.d===d&&CARDS[saved.i]){S.card=saved.i;S.cardAgain=true}else{const stt=ansense(),pool=CARDS.map((c,i)=>i).filter(i=>!stt||CARDS[i][1].includes(stt));S.card=pool[Math.floor(Math.random()*pool.length)];S.cardAgain=false;LS('yen_niem_the',JSON.stringify({d,i:S.card}))}
      drawCards(S.card);strike(880,1.2,.025,[[1,1],[2,.2]]);goView('cards')}
    // ---- Thở cùng Đèn Thở · Khoảng Lặng 18 phút
    const brEl=roomBox.querySelector('#roomBreath'),brTxt=brEl.querySelector('span');
    function stopAct(remote,silent){const a=S.act;if(!a)return;S.act=null;brEl.hidden=true;brTxt.textContent='';setQuiet(false);ambientOff();if(!remote&&a.shared)send({k:'stop'});if(!silent&&a.kind==='breath')rmHint('🕯️ Đã thở '+Math.max(1,Math.round((Date.now()-a.t0)/60000))+' phút cùng Đèn Thở');render()}
    function startBreath(p,m,el,remote){stopAct(true,true);S.act={kind:'breath',p:BREATH[p]?p:'446',m:[3,6,10].includes(+m)?+m:3,t0:Date.now()-(el||0)*1000,ph:-1,shared:inSession()&&S.healer&&!remote};
      if(S.act.shared)send({k:'breath',p:S.act.p,m:S.act.m,el:0});brEl.hidden=false;goView(S.healer&&inSession()?'seatH':'seat');softBell();S.tab='breath';render()}
    function startSilence(el,remote){stopAct(true,true);S.act={kind:'silence',m:18,t0:Date.now()-(el||0)*1000,bells:{},shared:inSession()&&S.healer&&!remote};if(S.act.shared)send({k:'silence',el:0});
      ambientOn();goView(S.healer&&inSession()?'seatH':'seat');S.tab='silence';render();setQuiet(true)}
    function tickAct(){const a=S.act;if(!a)return 0;const el=(Date.now()-a.t0)/1000;
      if(a.kind==='silence'){for(const [m,k] of [[0,'a'],[9,'b'],[18,'c']])if(el>=m*60&&!a.bells[k]){a.bells[k]=1;bellSound()}
        if(el>=18*60){S.act=null;ambientOff();setQuiet(false);S.tab='silenceDone';render()}return .5+.5*Math.sin(el*2*Math.PI/10)}
      const pat=BREATH[a.p],cyc=pat[0]+pat[1]+pat[2];if(el>=a.m*60){S.act=null;brEl.hidden=true;bellSound();S.tab='breathDone';render();return 0}
      const u=el%cyc;let ph,left,b;if(u<pat[0]){ph=0;left=pat[0]-u;b=u/pat[0]}else if(u<pat[0]+pat[1]){ph=1;left=pat[0]+pat[1]-u;b=1}else{ph=2;left=cyc-u;b=1-(u-pat[0]-pat[1])/pat[2]}
      b=b*b*(3-2*b);if(ph!==a.ph){a.ph=ph;strike([330,392,262][ph],2.2,.02,[[1,1],[2,.2]])}brTxt.textContent=['Hít vào','Giữ hơi','Thở ra'][ph]+' · '+Math.ceil(left);return b}
    // ---- giao diện tự ẩn trong Khoảng Lặng (chạm màn hình để hiện lại 3 giây)
    let peekT=0;function setQuiet(v){S.quiet=v;roomBox.classList.toggle('niem-quiet',v);document.body.classList.toggle('niem-quiet',v);if(v)peek()}
    function peek(){roomBox.classList.add('peek');clearTimeout(peekT);peekT=setTimeout(()=>roomBox.classList.remove('peek'),3000)}
    on(roomBox,'pointerdown',()=>{if(S.quiet)peek()});
    // ---- Phiên 1+5: dùng kênh phiên riêng của Lịch trị liệu (space-chat.js xin chỗ anyen_space_enter → anyen:sp:nha_niem__s<phiên>)
    let pendT=0;
    function chooseSolo(note){S.mode='solo';S.pending=false;S.healer=false;S.healerHere=false;S.people=0;S.list=[];S.therapist=null;if(S.mySeat==null||S.mySeat===0)S.mySeat=3;clearTimeout(pendT);window.dispatchEvent(new CustomEvent('anyen-space',{detail:{space:'solo:nha_niem'}}));if(note)rmHint(note);litSeats();render()}
    function chooseSession(){S.pending=true;render();window.dispatchEvent(new CustomEvent('anyen-space',{detail:{space:'room:nha_niem'}}));clearTimeout(pendT);pendT=setTimeout(()=>{if(S.pending)chooseSolo('Chưa kết nối được phiên 1+5 · bạn đang ở chế độ Solo')},12000)}
    on(window,'anyen-space-result',e=>{const d=e.detail||{};if(d.id!=='nha_niem'||!S.entered)return;
      if(d.ok&&d.session){const was=inSession();S.mode='session';S.pending=false;clearTimeout(pendT);S.healer=!!d.healer;S.therapist=d.therapist||null;if(d.me)S.me=d.me;if(!was){S.list=[];S.mySeat=S.healer?0:null}if(!was){rmHint(S.healer?'🌿 Bạn dẫn phiên 1+5 · chuông và nhịp thở của bạn vang tới cả phòng':'🌿 Đã vào phiên 1+5 cùng Healer');goView(S.healer?'seatH':'seat')}litSeats();render();return}
      if(!S.pending&&!inSession())return;const was=inSession();
      const why=d.ok?(was?'Phiên 1+5 đã kết thúc · bạn tiếp tục Solo':'Bạn chưa có phiên 1+5 nào đang diễn ra ở Nhà Niệm · đặt lịch Healer ở trang Lịch trị liệu'):d.reason==='guest'||d.reason==='auth'?'Đăng nhập thành viên và đặt lịch Healer để vào phiên 1+5':d.reason==='session'?'Đang có phiên riêng ở đây · bạn trải nghiệm Solo, không phiên nào thấy bạn':d.reason==='full'?'Phiên đã đủ người · bạn trải nghiệm Solo':'Chưa vào được phiên · bạn đang ở chế độ Solo';
      if(was&&S.act&&!S.act.shared)stopAct(true,true);chooseSolo(why);S.sessNote=why;render()});
    on(window,'anyen-space-people',e=>{const d=e.detail||{};if(d.id!=='nha_niem'||!inSession())return;const grew=(d.n||0)>S.people;S.people=d.n||0;S.healerHere=!!d.healer;if(d.me)S.me=d.me;if(Array.isArray(d.list))S.list=d.list.slice(0,8);litSeats();if(S.tab!=='bowl')render();
      if(grew&&S.healer&&S.act&&S.act.shared){const el=(Date.now()-S.act.t0)/1000;send(S.act.kind==='breath'?{k:'breath',p:S.act.p,m:S.act.m,el}:{k:'silence',el})}});
    on(window,'anyen-space-room',e=>{const m=e.detail||{};if(!inSession()||!m.fromHealer)return;const el=Math.max(0,Math.min(1200,+m.el||0));
      if(m.k==='bell')bellSound();else if(m.k==='breath')startBreath(String(m.p),+m.m,el,true);else if(m.k==='silence')startSilence(el,true);else if(m.k==='stop')stopAct(true)});
    // Healer luôn ở tọa cụ 0. Khách giữ chỗ bằng cờ c; hai người cùng chọn một chỗ thì ai vào trước giữ chỗ, người sau tự sang chỗ trống kế tiếp.
    function claim(k){S.mySeat=k;if(inSession()&&window.anyenSpaceChat&&window.anyenSpaceChat.meta)window.anyenSpaceChat.meta({c:k})}
    function seatPeople(){const occ={};if(!S.entered){S.occ=occ;drawPeople();return}
      if(!inSession()){occ[S.mySeat==null?3:S.mySeat]={id:'me',name:'Bạn',me:true}}
      else{const list=S.list.slice().sort((x,y)=>(x.t||0)-(y.t||0)||String(x.id).localeCompare(String(y.id)));
        for(const p of list){const healer=S.therapist&&p.id===S.therapist,k=healer?0:p.c;if(k==null||(k===0&&!healer)||occ[k])continue;occ[k]={id:p.id,name:p.name||'Một người bạn',healer,me:p.id===S.me}}
        if(S.healer){if(!occ[0]||!occ[0].me){occ[0]={id:S.me,name:'Bạn',healer:true,me:true}}if(S.mySeat!==0)claim(0)}
        else{const mine=Object.entries(occ).find(([k,o])=>o.me);if(mine)S.mySeat=+mine[0];else if(S.list.length){/* chờ danh sách có mặt rồi mới chọn chỗ */const free=[1,2,3,4,5].filter(k=>!occ[k]),k=free.includes(S.mySeat)?S.mySeat:free[0];if(k!=null){claim(k);occ[k]={id:S.me,name:'Bạn',me:true}}}}}
      S.occ=occ;drawPeople()}
    function drawPeople(){let n=0;for(let k=0;k<6;k++){const o=S.occ[k];seats[k].material.emissiveIntensity=o?(o.me?.9:.45):0;if(!o)continue;const a=seatA(k);
        dummy.position.set(Math.sin(a)*2.4,.15,Math.cos(a)*2.4);dummy.rotation.set(0,a+Math.PI,0);dummy.scale.set(1.2,1,.95);dummy.updateMatrix();bodies.setMatrixAt(n,dummy.matrix);bodies.setColorAt(n,new THREE.Color(o.healer||k===0?ROBE[0]:o.me&&!inSession()?myRobe():ROBE[k]));
        dummy.position.y=.15+.6;dummy.scale.set(1,1.12,1);dummy.updateMatrix();heads.setMatrixAt(n,dummy.matrix);heads.setColorAt(n,SKIN);n++}
      bodies.count=heads.count=n;bodies.instanceMatrix.needsUpdate=heads.instanceMatrix.needsUpdate=true;if(n){bodies.instanceColor.needsUpdate=heads.instanceColor.needsUpdate=true}}
    const myRobe=()=>{try{const c=JSON.parse(localStorage.getItem('yenGuestProfile17')||'{}').color;return /^#[0-9a-f]{6}$/i.test(c)?c:ROBE[3]}catch(e){return ROBE[3]}};
    function litSeats(){seatPeople()}
    function tapSeat(k){if(!S.entered)return;const o=S.occ[k];
      if(o&&o.me){goView('seat');return}
      if(k===0&&!S.healer){rmHint('Tọa cụ vàng đồng dành cho Healer dẫn phiên');return}
      if(S.healer&&inSession()){rmHint('Healer ngồi ở tọa cụ vàng đồng, quay lưng ra cửa vòm Trăng');return}
      if(o){rmHint('Chỗ này đã có '+o.name+' ngồi · chạm một tọa cụ còn trống');return}
      claim(k);seatPeople();goView('seat');rmHint('🧘 Đã ngồi vào tọa cụ K'+k);if(S.tab!=='bowl')render()}
    // ---- chạm vào vật trong phòng
    rTap(st,lamp,()=>{if(!S.entered)return;S.tab='breath';goView('seat');render()});/* ngồi tại tọa cụ của mình */
    rTap(st,board,()=>{if(!S.entered)return;if(S.tab!=='beads'){S.tab='beads';goView('beads');render()}else bead()});rTap(st,counter,()=>{if(S.entered){if(S.tab!=='beads'){S.tab='beads';goView('beads');render()}else bead()}});
    rTap(st,cards,()=>{if(!S.entered)return;S.tab='cards';drawCard();render()});
    rTap(st,bowl,()=>{if(!S.entered)return;S.tab='bowl';goView('bowl');render()});rTap(st,water,()=>{if(!S.entered)return;S.tab='bowl';goView('bowl');render()});
    rTap(st,bell,()=>{if(!S.entered)return;bellSound();if(inSession()&&S.healer)send({k:'bell'})});
    seats.forEach(s=>rTap(st,s,()=>tapSeat(s.userData.k)));
    const spaceKey=e=>{if(e.code!=='Space'||!S.entered||S.tab!=='beads')return false;const t=e.target;return !(t&&(t.tagName==='INPUT'||t.tagName==='TEXTAREA'||t.isContentEditable))};
    on(document,'keydown',e=>{if(!spaceKey(e))return;e.preventDefault();if(!e.repeat)bead()});on(document,'keyup',e=>{if(spaceKey(e))e.preventDefault()});/* nút đang được chọn không nhận thêm một lần bấm */
    // ---- bảng điều khiển
    const ritualDone=()=>{S.entered=true;seatPeople();goView('overview');rmHint('Kéo để nhìn quanh · chạm Đèn Thở, bảng 108 hạt, Bát Buông Bỏ hay Kệ thẻ');const fromSched=window.__anyenSchedHouse==='nha_niem';window.__anyenSchedHouse=null;S.suggest=fromSched;render()};
    function modeBadge(){if(S.pending)return '<p class="nm-mode">⏳ Đang vào phiên 1+5…</p>';
      if(inSession())return '<p class="nm-mode">🌿 Phiên 1+5'+(S.healer?' · bạn là Healer dẫn phiên':' · cùng Healer')+' · '+Math.max(1,S.people)+'/6 người · phiên khác không thấy phiên này <button type="button" data-nm="solo">Chuyển Solo</button></p>';
      return '<p class="nm-mode">🧘 Solo · yên tĩnh, không ai thấy bạn <button type="button" data-nm="session">Vào Phiên 1+5</button></p>'}
    function render(){let h='';const t=S.tab,a=S.act;
      if(!S.entered){h='<p><b>00 · Nghi thức Gột bụi</b> · Trước khi bước qua cửa vòm Trăng, chạm bồn đá bazan để rửa tay và nghe một tiếng chuông gió tre.</p>'+
        (S.washed?'<p class="rm-quote">Bụi đường đã lắng. Mời bạn chọn cách bước vào.</p><div class="rm-row"><button type="button" class="'+(window.__anyenSchedHouse==='nha_niem'?'':'rm-gold')+'" data-nm="go-solo">🧘 Đi Solo · hoàn toàn yên tĩnh</button><button type="button" class="'+(window.__anyenSchedHouse==='nha_niem'?'rm-gold':'')+'" data-nm="go-session">🌿 Vào Phiên 1+5 cùng Healer</button></div><p class="rm-note">Phiên 1+5 là phiên bạn đã đặt ở Lịch trị liệu. Mỗi phiên có kênh riêng; các phiên chạy song song không thấy nhau.</p>'
        :'<div class="rm-row"><button type="button" class="rm-gold" data-nm="wash">💧 Chạm bồn đá · rửa tay</button></div>');rmPanel.innerHTML=h;return}
      h=modeBadge()+(S.sessNote&&!inSession()?'<p class="rm-note">'+esc(S.sessNote)+(/Lịch trị liệu|đặt lịch/.test(S.sessNote)?' · <a href="lich.html" style="color:#f2dca8">Mở Lịch trị liệu</a>':'')+'</p>':'');
      h+='<div class="rm-row nm-tabs">'+[['breath','🕯️ 01 Thở'],['silence','🌙 02 Khoảng Lặng'],['beads','📿 03 Chuỗi 108'],['bowl','💧 04 Buông Bỏ'],['cards','🃏 Kệ 9 thẻ']].map(([k,l])=>'<button type="button" data-tab="'+k+'"'+(t===k||t===k+'Done'?' class="sel"':'')+'>'+l+'</button>').join('')+'</div>';
      if(inSession()&&S.healer)h+='<div class="rm-row"><button type="button" class="rm-gold" data-nm="bell">🔔 Thỉnh chuông đồng · cả phòng cùng nghe</button></div>';
      {const names=Object.entries(S.occ).filter(([k,o])=>!o.me).map(([k,o])=>(+k===0?'Healer ':'K'+k+' ')+esc(o.name));h+='<p class="rm-note">🧘 Bạn ngồi ở '+(S.mySeat===0?'tọa cụ Healer':'K'+(S.mySeat==null?'…':S.mySeat))+(names.length?' · cùng ngồi: '+names.join(' · '):'')+' · chạm một tọa cụ trống để đổi chỗ</p>'}
      if(t==='home')h+='<p>Chạm Đèn Thở ở tâm phòng, bảng 108 hạt ở tường trái, Bát Buông Bỏ và Kệ thẻ ở tường phải. Kéo để nhìn quanh.</p>';
      else if(t==='breath'){if(a&&a.kind==='breath')h+='<p>Quả cầu sáng và cột nắng giếng trời co giãn theo nhịp '+a.p.split('').join('–')+' · '+a.m+' phút. Không chấm điểm, chỉ cần có mặt.</p><div class="rm-row"><button type="button" data-nm="stop">⏹ Dừng</button></div>';
        else{const sel=S.bp||'446',sm=S.bm||3,follow=inSession()&&!S.healer;h+='<p><b>01 · Thở Chánh Niệm cùng Đèn Thở</b>'+(follow?' · Healer sẽ bắt đầu cho cả phòng; bạn cũng có thể thở riêng.':'')+'</p><div class="rm-row">Nhịp: '+[['446','4–4–6'],['478','4–7–8']].map(([k,l])=>'<button type="button" data-bp="'+k+'"'+(k===sel?' class="sel"':'')+'>'+l+'</button>').join('')+'</div><div class="rm-row">Thời gian: '+[3,6,10].map(m=>'<button type="button" data-bm="'+m+'"'+(m===sm?' class="sel"':'')+'>'+m+' phút</button>').join('')+'</div><div class="rm-row"><button type="button" class="rm-gold" data-nm="breathe">🕯️ '+(inSession()&&S.healer?'Bắt đầu cho cả phòng':'Bắt đầu thở')+'</button></div>'}}
      else if(t==='breathDone')h+='<p class="rm-quote">Bạn vừa thở cùng Đèn Thở. Mang nhịp thở này theo bạn ra khỏi Nhà Niệm.</p><div class="rm-row"><button type="button" data-tab="breath">🔁 Thở thêm</button></div>';
      else if(t==='silence'){if(a&&a.kind==='silence'){const el=Math.floor((Date.now()-a.t0)/1000);h+='<p>🌙 Khoảng Lặng · phút '+Math.min(18,Math.floor(el/60))+'/18 · chuông ngân ở phút 0 · 9 · 18. Chữ và nút tự ẩn, chạm màn hình để hiện lại.</p><div class="rm-row"><button type="button" data-nm="stop">⏹ Kết thúc sớm</button></div>'}
        else{const stt=ansense();h+='<p><b>02 · Khoảng Lặng 18 phút</b> · Ánh sáng dịu xuống tông ấm, chỉ còn gió rừng thông và nước Hồ Niệm. Ba tiếng chuông ở phút 0 · 9 · 18.</p>'+(stt?'<p class="rm-note">Theo bài test AnSense, trạng thái hôm nay của bạn là <b>'+STATE_LINES[stt][0]+'</b>: '+STATE_LINES[stt][1]+'</p>':'<p class="rm-note">Làm bài test AnSense 3 phút trước để Khoảng Lặng và Kệ thẻ gợi ý theo trạng thái hôm nay của bạn. <a href="ansense.html" style="color:#f2dca8">Mở AnSense</a></p>')+'<div class="rm-row"><button type="button" class="rm-gold" data-nm="silence">🌙 '+(inSession()&&S.healer?'Bắt đầu cho cả phòng':'Bắt đầu 18 phút')+'</button></div>'}}
      else if(t==='silenceDone')h+='<p class="rm-quote">Mười tám phút lặng đã trọn. Bạn có thể nối tiếp sáu chặng Khoảng Lặng của AnSense, hoặc ghi lại một dòng.</p><div class="rm-row"><button type="button" data-nm="jsilence">📔 Ghi vào Nhật ký An Yên</button><a href="ansense.html#silence" style="color:#f2dca8">Khoảng Lặng sáu chặng (AnSense) →</a></div>';
      else if(t==='beads'){const n=S.beads%108||(S.full?108:0);h+='<p><b>03 · Lần chuỗi 108 hạt</b> · Chạm bảng hạt hoặc bấm phím Space theo mỗi nhịp thở. Mốc 18 · 54 · 108 vòng sáng đồng bừng lên và ghi nhẹ vào Nhật ký An Yên. Không chuỗi ngày, không áp lực.</p><div class="rm-row"><button type="button" class="rm-gold" data-nm="bead">📿 Lần 1 hạt · '+n+'/108</button></div>'}
      else if(t==='bowl')h+='<p><b>04 · Bát Nước Buông Bỏ</b> · Gõ một nỗi lo rồi thả vào bát. Chữ tan thành gợn sóng và biến mất hẳn: chỉ ở trên máy bạn trong vài giây, không lưu, không gửi đi đâu.</p><form class="rm-row" data-nm="rel"><input type="text" maxlength="80" autocomplete="off" placeholder="Một nỗi lo (tối đa 80 ký tự)" aria-label="Nỗi lo muốn buông" style="flex:1;min-width:0;border:1px solid #a18a5e;border-radius:10px;background:#0b2d28;color:#f6e3b4;padding:8px 10px;font-size:16px"><button type="submit" class="rm-gold">💧 Thả vào bát</button></form>';
      else if(t==='cards'){if(S.card==null)h+='<p><b>Kệ 9 thẻ chánh niệm</b> · Rút một lời nhắc an tĩnh cho hôm nay'+(ansense()?' (gợi ý theo trạng thái AnSense của bạn)':'')+'.</p><div class="rm-row"><button type="button" class="rm-gold" data-nm="card">🃏 Rút thẻ hôm nay</button></div>';
        else h+='<p class="rm-quote">“'+esc(CARDS[S.card][0])+'”</p><p class="rm-note">'+(S.cardAgain?'Đây là thẻ bạn đã rút hôm nay. Mai kệ sẽ có lời nhắc mới.':'Thẻ của hôm nay. Mai kệ sẽ có lời nhắc mới.')+'</p>'}
      rmPanel.innerHTML=h;const f=rmPanel.querySelector('form[data-nm="rel"]');if(f){const inp=f.querySelector('input');f.onsubmit=e=>{e.preventDefault();const v=inp.value;inp.value='';inp.blur();release(v)}}}
    on(rmPanel,'click',e=>{const b=e.target.closest('button');if(!b)return;const tab=b.dataset.tab,a=b.dataset.nm;
      if(tab){S.tab=tab;if(tab==='beads')goView('beads');else if(tab==='bowl')goView('bowl');else if(tab==='cards'){goView('cards');if(S.card==null){try{const s=JSON.parse(LS('yen_niem_the')||'null');if(s&&s.d===today()&&CARDS[s.i]){S.card=s.i;S.cardAgain=true;drawCards(s.i)}}catch(e){}}}else if(tab==='breath'||tab==='silence')goView(S.healer&&inSession()?'seatH':'seat');render();return}
      if(b.dataset.bp){S.bp=b.dataset.bp;render();return}if(b.dataset.bm){S.bm=+b.dataset.bm;render();return}
      if(a==='wash'){S.washed=true;splash();setTimeout(bamboo,700);render()}
      else if(a==='go-solo'){chooseSolo();ritualDone()}else if(a==='go-session'){ritualDone();chooseSession()}
      else if(a==='solo'){if(S.act&&!S.act.shared)stopAct(true,true);S.sessNote='';chooseSolo('🧘 Đã chuyển sang Solo')}else if(a==='session'){S.sessNote='';chooseSession()}
      else if(a==='bell'){bellSound();send({k:'bell'})}
      else if(a==='breathe')startBreath(S.bp||'446',S.bm||3,0,false);else if(a==='silence')startSilence(0,false);else if(a==='stop')stopAct(false);
      else if(a==='jsilence'){journal('Ngồi Khoảng Lặng 18 phút trong Nhà Niệm');rmHint('📔 Đã ghi vào Nhật ký An Yên');b.disabled=true}
      else if(a==='bead')bead();else if(a==='card'){drawCard();render()}});
    // ---- vòng vẽ: Đèn Thở thở theo nhịp, cột nắng co giãn, chuông ngân, gợn nước, vòng sáng đồng
    drawBeads();drawCards(null);paintWater(1);litSeats();
    const cWarm=new THREE.Color('#c98a3a'),cLamp=new THREE.Color(C.lampG),bgA=new THREE.Color('#17120d'),bgB=new THREE.Color('#0a0806');
    let fade=0;st.tick.push(t=>{const now=performance.now();{const asp=st.cam.aspect,f=asp<1?Math.min(74,50/Math.sqrt(asp)):50;if(Math.abs(st.cam.fov-f)>.5){st.cam.fov=f;st.cam.updateProjectionMatrix()}}/* điện thoại dọc: mở góc nhìn */
      if(tw){const u=Math.min(1,(now-tw.t0)/1200),k=u*u*(3-2*u),A=tw.a,B=tw.b;st.target.set(A[0]+(B[0]-A[0])*k,A[1]+(B[1]-A[1])*k,A[2]+(B[2]-A[2])*k);st.yaw=A[3]+(B[3]-A[3])*k;st.pitch=A[4]+(B[4]-A[4])*k;st.dist=A[5]+(B[5]-A[5])*k;if(u>=1)tw=null}
      fade=Math.min(1,fade+.012);const want=S.act&&S.act.kind==='silence'?1:0;S.dim+=(want-S.dim)*.006;
      let b=tickAct();if(!S.act)b=.5+.5*Math.sin(t*2*Math.PI/14);const amp=S.act?1:.45;
      lamp.scale.setScalar(1+.38*b*amp);bodies.scale.y=1+.025*b*amp;halo.scale.setScalar(1.1+.9*b*amp);
      st.hemi.intensity=LIGHT.hemi*fade*(1-.7*S.dim);st.key.intensity=LIGHT.key*fade*(1-.8*S.dim);light.intensity=LIGHT.lamp*fade*(.75+.5*b*amp)*(1-.45*S.dim);light.color.copy(cLamp).lerp(cWarm,S.dim);sc.background.copy(bgA).lerp(bgB,S.dim);
      beamCol.material.opacity=(.04+.07*b*amp)*(1-.6*S.dim);pool.material.opacity=(.03+.07*b*amp)*(1-.5*S.dim);
      const ub=(now-(bell.userData.ring||0))/1000;bell.rotation.z=ub<2.5?Math.sin(ub*30)*.03*(2.5-ub):0;
      const uw=(now-(wave.userData.t0||-1e9))/1000;if(uw<4){wave.scale.setScalar(.4+uw*1.4);wave.material.opacity=.5*(1-uw/4)}else wave.material.opacity=0;
      const ur=(now-(beadRing.userData.t0||-1e9))/1000;beadRing.material.opacity=ur<3?.12+.8*Math.max(0,1-ur/3)*(ur<.3?ur/.3:1):.12;
      if(S.rel){const u=(now-S.rel.t0)/1000,p=u<1.6?(u-1.6)/1.6*.4:Math.min(1,(u-1.6)/3.6);paintWater(p);if(u>5.4){S.rel=null;textCv.getContext('2d').clearRect(0,0,256,256);paintWater(1);rmHint('💧 Đã tan vào nước · không còn lại gì')}}
      else if(((t*10)|0)%3===0)paintWater(1);
      const up=(now-(ripple.userData.t0||-1e9))/1000;if(up>0&&up<4){ripple.scale.setScalar(.08+up*.11);ripple.material.opacity=.6*(1-up/4)}else ripple.material.opacity=0;
      if(S.act&&S.tab==='silence'&&((t*2)|0)!==S.lastSec){S.lastSec=(t*2)|0;if(((t)|0)%15===0)render()}});
    rmHint('Nhà Niệm · chạm bồn đá ở hiên để Gột bụi trước khi bước vào');render();
    st.cleanup=()=>{roomBox.classList.remove('niem');clearTimeout(pendT);clearTimeout(peekT);ambientOff();setQuiet(false);roomBox.classList.remove('peek');brEl.hidden=true;S.rel=null;textCv.getContext('2d').clearRect(0,0,256,256);
      for(const f of offs)f();for(const t of texs)t.dispose();sc.traverse(o=>{if(o.material)(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>m.dispose())});delete window.__niem};
    // kiểm tra: số tam giác nội thất, số PointLight, trạng thái; tua nhanh hoạt động
    window.__niem={tris:()=>{let n=0;sc.traverse(o=>{if(!o.isMesh&&!o.isSprite)return;const g=o.geometry;if(!g)return;const c=(g.index?g.index.count:g.attributes.position.count)/3;n+=c*(o.isInstancedMesh?o.count:1)});return n},
      points:()=>{let n=0;sc.traverse(o=>{if(o.isPointLight)n++});return n},state:()=>({mySeat:S.mySeat,entered:S.entered,mode:S.mode,healer:S.healer,people:S.people,act:S.act&&S.act.kind,tab:S.tab,beads:S.beads,card:S.card,rel:!!S.rel,quiet:S.quiet}),
      skip:sec=>{if(S.act)S.act.t0-=sec*1000},seats:()=>Object.fromEntries(Object.entries(S.occ).map(([k,o])=>[k,(o.me?'*':'')+o.name])),tap:k=>tapSeat(k),
      people:(list,me)=>window.dispatchEvent(new CustomEvent('anyen-space-people',{detail:{id:'nha_niem',n:list.length,me,healer:list.some(p=>p.id===S.therapist),list}})),enter:mode=>{S.washed=true;if(mode==='session'){ritualDone();chooseSession()}else{chooseSolo();ritualDone()}}};
  }
  // ---------------------------------------------------------------- Nhà Văn Hóa · 36 người · Ca Múa Nhạc & 5 hoạt động tập thể
  // Khối 16 × 11 × 6,8 m gỗ trầm. Đồng bộ qua kênh cộng đồng anyen:sp:nha_van_hoa (space-chat.js, tối đa 36 người); không cần SQL mới, không tạo kho mới.
  // Người dẫn: Healer/Admin có mặt sớm nhất; vắng Healer/Admin thì người vào phòng sớm nhất dẫn tạm. Chỉ nhận lệnh sân khấu, câu đố, thả đèn từ người dẫn.
  function roomNhaVanHoa(st){
    const W=16,D=11,HW=W/2,HD=D/2,EAVE=4.6,RIDGE=6.8,STAGE_Y=.6;
    const C={wood:'#42362A',floor:'#4a3826',col:'#2A1F15',stage:'#5a452f',screen:'#101712',gold:'#d9a338',lamp:'#ffd59a'};
    const sc=st.sc,texs=[],offs=[];
    const on=(t,n,f,o)=>{t.addEventListener(n,f,o);offs.push(()=>t.removeEventListener(n,f,o))};
    const M=(c,o)=>new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:.9},o||{}));
    const add=(geo,m,x,y,z,rx,ry,rz)=>{const o=new THREE.Mesh(geo,m);o.position.set(x,y,z);if(rx)o.rotation.x=rx;if(ry)o.rotation.y=ry;if(rz)o.rotation.z=rz;sc.add(o);return o};
    const tex=(w,h,draw,rep)=>{const cv=document.createElement('canvas');cv.width=w;cv.height=h;const c=cv.getContext('2d');draw(c,w,h);const t=new THREE.CanvasTexture(cv);t.colorSpace=THREE.SRGBColorSpace;if(rep){t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rep[0],rep[1])}texs.push(t);t.cv=cv;t.c=c;return t};
    const glow=(c,o,map)=>new THREE.MeshBasicMaterial({color:c,map:map||null,transparent:true,opacity:o,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide});
    const esc=t=>String(t).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
    const clean=(t,n)=>String(t||'').replace(/[\u0000-\u001f<>]/g,'').replace(/\s+/g,' ').trim().slice(0,n);
    const myName=()=>{try{return clean(JSON.parse(localStorage.getItem('yenGuestProfile17')||'{}').name,24)||'Khách Làng Yên'}catch(e){return 'Khách Làng Yên'}};
    const journal=q=>window.dispatchEvent(new CustomEvent('anyen-journal-add',{detail:{lake:'Văn Hóa',title:'🏛️ Nhà Văn Hóa',quote:q,at:Date.now()}}));
    sc.background=new THREE.Color('#120e0a');roomBox.classList.add('vanhoa');
    st.hemi.color.set('#f6e3c0');st.hemi.groundColor.set('#2a2016');st.hemi.intensity=1.15;st.key.color.set('#ffe2b0');st.key.intensity=.9;st.key.position.set(-3,9,6);
    // ---- vỏ phòng: sàn gỗ, tường ván gỗ trầm, hai đầu hồi, mái hai dốc có khe sáng cổ diêm (mặt trong hướng vào phòng, nhìn từ cửa thấy xuyên tường trước)
    const boards=(seam,rx,ry)=>tex(128,128,(c,w,h)=>{c.fillStyle=C.wood;c.fillRect(0,0,w,h);for(let i=0;i<36;i++){c.fillStyle='rgba(18,10,5,'+(.04+Math.random()*.05)+')';c.fillRect(Math.random()*w,0,1+Math.random()*2,h)}c.fillStyle=seam;c.fillRect(0,0,3,h);c.fillRect(w/2,0,3,h)},[rx,ry]);
    const floorT=tex(128,128,(c,w,h)=>{c.fillStyle=C.floor;c.fillRect(0,0,w,h);for(let i=0;i<4;i++){c.fillStyle='rgba(0,0,0,.3)';c.fillRect(0,i*32,w,2);c.fillStyle='rgba(255,230,190,.04)';c.fillRect(0,i*32+2,w,14)}},[8,6]);
    add(new THREE.PlaneGeometry(W,D),M('#fff',{map:floorT}),0,0,0,-Math.PI/2);
    add(new THREE.PlaneGeometry(W,EAVE),M('#fff',{map:boards('#20160d',14,1)}),0,EAVE/2,-HD);/* tường Nam sau sân khấu */
    {const t=tex(512,128,(c,w,h)=>{c.fillStyle=C.wood;c.fillRect(0,0,w,h);for(let i=0;i<32;i++){c.fillStyle='#20160d';c.fillRect(i*16,0,2,h)}const g=c.createLinearGradient(0,0,0,h);g.addColorStop(0,'#f5d38e');g.addColorStop(1,'#b9894a');c.fillStyle=g;c.fillRect(w/2-46,h-84,92,84);c.fillStyle='#241a11';c.fillRect(w/2-1,h-84,2,84);
      for(const sx of [-1,1]){c.fillStyle='#7b5f3c';c.fillRect(w/2+sx*150-40,h-74,80,44)}});add(new THREE.PlaneGeometry(W,EAVE),M('#fff',{map:t}),0,EAVE/2,HD,0,Math.PI)}/* tường Bắc có cửa kính */
    for(const sx of [-1,1]){const s=new THREE.Shape();s.moveTo(-HD,0);s.lineTo(HD,0);s.lineTo(HD,EAVE);s.lineTo(0,RIDGE);s.lineTo(-HD,EAVE);s.lineTo(-HD,0);const t=boards('#20160d',1,1);t.repeat.set(1/11*6,1/6.8*3);
      add(new THREE.ShapeGeometry(s),M('#fff',{map:t}),sx*HW,0,0,0,-sx*Math.PI/2)}
    const roofT=tex(128,128,(c,w,h)=>{c.fillStyle='#2e241a';c.fillRect(0,0,w,h);c.fillStyle='#1a120b';for(let i=0;i<4;i++)c.fillRect(i*32,0,8,h);c.fillStyle='rgba(255,220,160,.05)';c.fillRect(0,0,w,3)},[8,1]);
    const SL=Math.hypot(HD,RIDGE-EAVE);for(const sz of [-1,1]){const th=Math.atan2(-sz*HD,RIDGE-EAVE);add(new THREE.PlaneGeometry(W,SL),M('#fff',{map:roofT,side:THREE.DoubleSide}),0,(EAVE+RIDGE)/2,sz*HD/2,th)}
    const slit=add(new THREE.PlaneGeometry(W-.4,.32),glow('#ffcf86',.55),0,RIDGE-.22,0,Math.PI/2);/* khe sáng cổ diêm dọc nóc */
    for(const x of [-5.4,0,5.4])add(new THREE.BoxGeometry(.26,.26,D),M(C.col),x,EAVE,0);/* xà ngang */
    for(const x of [-HW+.2,HW-.2])for(const z of [-HD+.2,0,HD-.2])add(new THREE.BoxGeometry(.32,EAVE,.32),M(C.col),x,EAVE/2,z);/* 6 cột #2A1F15 */
    // ---- sân khấu gỗ trầm 6,4 × 2,8 m, màn chiếu 16:9, 1 PointLight ấm
    const SZ=-HD+1.5;add(new THREE.BoxGeometry(6.4,STAGE_Y,2.8),M(C.stage),0,STAGE_Y/2,SZ);add(new THREE.BoxGeometry(2.4,.2,.5),M('#4a3826'),0,.1,SZ+1.65);
    const SCW=4.8,SCH=2.7,SCY=3.0;add(new THREE.BoxGeometry(SCW+.24,SCH+.24,.08),M('#1e150d'),0,SCY,-HD+.06);
    const scrT=tex(1024,576,()=>{});const scrMat=new THREE.MeshBasicMaterial({map:scrT,toneMapped:false});const screen=add(new THREE.PlaneGeometry(SCW,SCH),scrMat,0,SCY,-HD+.11);
    const stageLight=new THREE.PointLight(C.lamp,5,10,1.4);stageLight.position.set(0,3.2,SZ+1.6);sc.add(stageLight);
    // ---- 6 cụm bàn × 6 ghế = 36 chỗ (2 InstancedMesh), nhãn nhạc cụ, sóng ánh sáng trên sàn
    const CL=[['C1','Đàn Tranh','tranh','#d9a338'],['C2','Chuông Xoay','chuong','#e6c27a'],['C3','Sáo Trúc','sao','#9fd3a8'],['C4','Đàn Tranh','tranh','#d9a338'],['C5','Mõ & Chuông','mo','#e0a070'],['C6',"Đàn T'rưng",'trung','#b9d77a']];
    const CPOS=[[-4.6,.3],[0,.3],[4.6,.3],[-4.6,3.3],[0,3.3],[4.6,3.3]];
    const dummy=new THREE.Object3D();
    const tables=new THREE.InstancedMesh(new THREE.CylinderGeometry(.62,.62,.72,8,1),M('#5a452f'),6);sc.add(tables);
    CPOS.forEach(([x,z],k)=>{dummy.position.set(x,.36,z);dummy.rotation.set(0,0,0);dummy.scale.setScalar(1);dummy.updateMatrix();tables.setMatrixAt(k,dummy.matrix);tables.setColorAt(k,new THREE.Color('#ffffff'))});
    const SEAT_OFF=new THREE.Color('#3b3026'),SEAT_ON=new THREE.Color('#c99a52'),SEAT_ME=new THREE.Color('#f2d58a');
    const seats=new THREE.InstancedMesh(new THREE.BoxGeometry(.42,.42,.42),M('#ffffff'),36);sc.add(seats);
    const seatPos=i=>{const k=i%6,s=Math.floor(i/6),a=s/6*Math.PI*2+Math.PI/6;return [CPOS[k][0]+Math.sin(a)*1.08,CPOS[k][1]+Math.cos(a)*1.08,a]};
    for(let i=0;i<36;i++){const [x,z,a]=seatPos(i);dummy.position.set(x,.21,z);dummy.rotation.set(0,a,0);dummy.updateMatrix();seats.setMatrixAt(i,dummy.matrix);seats.setColorAt(i,SEAT_OFF)}
    const labels=CL.map(([id,nm,,col],k)=>{const t=tex(256,64,(c,w,h)=>{c.fillStyle='rgba(20,14,8,.78)';c.beginPath();c.roundRect?c.roundRect(2,2,w-4,h-4,18):c.rect(2,2,w-4,h-4);c.fill();c.strokeStyle=col;c.lineWidth=3;c.stroke();c.fillStyle='#f6e7c8';c.font='600 26px system-ui, sans-serif';c.textAlign='center';c.fillText(id+' · '+nm,w/2,42)});
      const s=new THREE.Sprite(new THREE.SpriteMaterial({map:t,transparent:true,depthWrite:false}));s.scale.set(1.1,.275,1);s.position.set(CPOS[k][0],1.3,CPOS[k][1]);sc.add(s);return s});
    const ringT=tex(128,128,(c,w)=>{const g=c.createRadialGradient(64,64,40,64,64,62);g.addColorStop(0,'rgba(255,255,255,0)');g.addColorStop(.7,'rgba(255,255,255,.9)');g.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=g;c.fillRect(0,0,w,w)});
    const WAVES=12,waves=new THREE.InstancedMesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({map:ringT,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}),WAVES);waves.frustumCulled=false;sc.add(waves);
    const waveS=[...Array(WAVES)].map(()=>({t0:-1e9,x:0,z:0,c:new THREE.Color()}));let waveI=0;const BLACK=new THREE.Color(0,0,0);
    for(let i=0;i<WAVES;i++){dummy.position.set(0,-1,0);dummy.rotation.set(-Math.PI/2,0,0);dummy.scale.setScalar(.01);dummy.updateMatrix();waves.setMatrixAt(i,dummy.matrix);waves.setColorAt(i,BLACK)}
    function wave(k,col){const w=waveS[waveI++%WAVES];w.t0=performance.now();w.x=CPOS[k][0];w.z=CPOS[k][1];w.c.set(col||CL[k][3])}
    // ---- 3 NPC biểu diễn low-poly (Múa Sen · Múa Quạt Lụa · Hòa tấu) và đạo cụ
    const skin=M('#e2bf98'),hair=M('#1b130d');
    const NPC=[0,1,2].map(i=>{const g=new THREE.Group(),robe=M('#e8b4b8',{roughness:.8}),arms=[];
      const body=new THREE.Mesh(new THREE.ConeGeometry(.34,1.25,6,1),robe);body.position.y=.62;g.add(body);
      const head=new THREE.Mesh(new THREE.OctahedronGeometry(.15,0),skin);head.position.y=1.42;head.scale.y=1.2;g.add(head);const bun=new THREE.Mesh(new THREE.OctahedronGeometry(.08,0),hair);bun.position.set(0,1.56,-.06);g.add(bun);
      for(const sx of [-1,1]){const p=new THREE.Group();p.position.set(sx*.17,1.18,0);const a=new THREE.Mesh(new THREE.BoxGeometry(.07,.55,.07),robe);a.position.y=-.27;p.add(a);p.rotation.z=sx*.25;g.add(p);arms.push(p)}
      const lotus=new THREE.Mesh(new THREE.ConeGeometry(.13,.2,5,1),M('#f4a7b9',{emissive:'#6a2a3a',emissiveIntensity:.4}));lotus.position.set(0,-.58,0);arms[1].add(lotus);
      const fan=new THREE.Mesh(new THREE.CircleGeometry(.34,5,0,Math.PI),M('#e8c46a',{side:THREE.DoubleSide,emissive:'#5a3c10',emissiveIntensity:.35}));fan.position.set(0,-.58,0);arms[1].add(fan);
      const inst=new THREE.Mesh(i===0?new THREE.BoxGeometry(1.05,.07,.3):i===1?new THREE.BoxGeometry(.5,.035,.035):new THREE.BoxGeometry(.9,.1,.16),M(i===1?'#c9b07a':'#6b4a2c'));g.add(inst);
      g.position.set((i-1)*1.9,STAGE_Y,SZ-.2);sc.add(g);return {g,body,robe,arms,lotus,fan,inst,head,i}});
    // ---- 36 Đèn Hoa An Yên: 1 InstancedMesh (bát diện kéo dài như đèn giấy), bay từ cụm bàn lên lơ lửng dưới vòm mái
    const lanterns=new THREE.InstancedMesh(new THREE.OctahedronGeometry(.13,0),new THREE.MeshBasicMaterial({color:'#ffffff',toneMapped:false}),36);lanterns.frustumCulled=false;sc.add(lanterns);
    const LCOL=new THREE.Color('#ffc46b'),LCOL2=new THREE.Color('#ffe2a8');
    for(let i=0;i<36;i++){dummy.position.set(0,-2,0);dummy.rotation.set(0,0,0);dummy.scale.setScalar(.001);dummy.updateMatrix();lanterns.setMatrixAt(i,dummy.matrix);lanterns.setColorAt(i,LCOL)}
    const roofY=z=>EAVE+(HD-Math.abs(z))/HD*(RIDGE-EAVE);
    const slotPos=i=>{const col=i%6,row=Math.floor(i/6),x=-6.25+col*2.5+(row%2)*.6,z=-3.6+row*1.45;return [x,roofY(z)-.85-((col+row)%3)*.18,z]};
    // ---- Tường Tây: triển lãm 9 ô (đọc từ 4 kho 69/9 sẵn có) · Tường Đông: 18 lời chúc và Quầy trà
    const galT=tex(512,512,()=>{});const gallery=add(new THREE.PlaneGeometry(3.4,3.4),new THREE.MeshBasicMaterial({map:galT}),-HW+.06,2.55,2.65,0,Math.PI/2);add(new THREE.BoxGeometry(.05,3.6,3.6),M(C.col),-HW+.03,2.55,2.65);
    const wallT=tex(768,384,()=>{});const wishWall=add(new THREE.PlaneGeometry(4.4,2.2),new THREE.MeshBasicMaterial({map:wallT}),HW-.06,2.9,2.65,0,-Math.PI/2);add(new THREE.BoxGeometry(.05,2.4,4.6),M(C.col),HW-.03,2.9,2.65);
    const counter=add(new THREE.BoxGeometry(.7,.95,3.0),M('#5a452f'),HW-.55,.475,2.65);
    const pot=add(new THREE.LatheGeometry([[0,0],[.12,.01],[.16,.1],[.13,.2],[.05,.24]].map(([a,b])=>new THREE.Vector2(a,b)),8),M('#7a3e2a',{roughness:.6}),HW-.55,.95,1.75);
    const steam=add(new THREE.PlaneGeometry(.25,.6),glow('#fff4e0',0),HW-.55,1.45,1.75,0,-Math.PI/2);
    // ---- cổ vũ dịu nhẹ: Points (cánh sen · lụa vàng · vỗ tay êm) bay quanh sân khấu
    const PN=120,pGeo=new THREE.BufferGeometry(),pPos=new Float32Array(PN*3),pCol=new Float32Array(PN*3);pGeo.setAttribute('position',new THREE.BufferAttribute(pPos,3));pGeo.setAttribute('color',new THREE.BufferAttribute(pCol,3));
    const dotT=tex(64,64,(c,w)=>{const g=c.createRadialGradient(32,32,0,32,32,30);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.5,'rgba(255,255,255,.5)');g.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=g;c.fillRect(0,0,w,w)});
    const pts=new THREE.Points(pGeo,new THREE.PointsMaterial({size:.2,map:dotT,vertexColors:true,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}));pts.frustumCulled=false;sc.add(pts);
    const parts=[...Array(PN)].map(()=>({life:0,x:0,y:-5,z:0,a:0,r:0,vy:0,va:0}));let partI=0;for(let i=0;i<PN;i++)pPos[i*3+1]=-5;
    const CHEER=[['🌸','Cánh sen','#f4a7b9'],['🎗️','Lụa vàng','#f2c75c'],['👏','Vỗ tay êm','#fff4dc']];
    function cheerBurst(e,k){const col=new THREE.Color(CHEER[e][2]),from=k==null?[0,2,SZ+2]:[CPOS[k][0],1.2,CPOS[k][1]];for(let n=0;n<14;n++){const p=parts[partI++%PN];p.life=1;p.x=from[0]+(Math.random()-.5)*.6;p.y=from[1];p.z=from[2];p.a=Math.random()*Math.PI*2;p.r=2.2+Math.random()*1.6;p.vy=.5+Math.random()*.5;p.va=(Math.random()<.5?-1:1)*(.4+Math.random()*.4);p.tx=0;p.tz=SZ+.4;p.k=0;p.c=col}
      if(e===2){strike(1600+Math.random()*300,.08,.03,[[1,1]]);setTimeout(()=>strike(1500,.08,.025,[[1,1]]),110)}else strike(e?988:784,1.2,.02,[[1,1],[2,.2]])}
    // ---- âm thanh: ngũ cung C–D–E–G–A, 6 chất âm mộc
    const ac=audio();const NOTE=[261.63,293.66,329.63,392,440];
    function voice(kind,p,g){if(!ac)return;const f=NOTE[(p-1)%5]*(p>5?2:1);g=g==null?1:g;
      if(kind==='tranh'){strike(f,1.8,.09*g,[[1,1],[2,.35],[3,.12],[4,.05]])}
      else if(kind==='chuong'){strike(f*2,3.2,.06*g,[[1,1],[2.76,.3],[5.4,.1]])}
      else if(kind==='mo'){strike(f*1.5,.14,.11*g,[[1,1],[1.6,.4]]);if(p>=4)strike(f*2,1.6,.03*g,[[1,1],[2.76,.25]])}
      else if(kind==='trung'){strike(f*2,.55,.09*g,[[1,1],[3.9,.25],[9.1,.06]])}
      else if(kind==='sao'||kind==='bau'){const t=ac.currentTime,o=ac.createOscillator(),v=ac.createGain(),lfo=ac.createOscillator(),lg=ac.createGain(),dur=kind==='sao'?1.3:1.9;o.type=kind==='sao'?'sine':'triangle';
        if(kind==='bau'){o.frequency.setValueAtTime(f*.94,t);o.frequency.exponentialRampToValueAtTime(f,t+.16)}else o.frequency.value=f*2;lfo.frequency.value=5.2;lg.gain.value=kind==='sao'?f*.012:f*.006;lfo.connect(lg).connect(o.frequency);
        v.gain.setValueAtTime(0,t);v.gain.linearRampToValueAtTime((kind==='sao'?.07:.09)*g,t+(kind==='sao'?.09:.02));v.gain.exponentialRampToValueAtTime(.0004,t+dur);o.connect(v).connect(ac.destination);o.start(t);lfo.start(t);o.stop(t+dur+.05);lfo.stop(t+dur+.05)}}
    // ---- nội dung: chương trình, câu đố văn hóa, ghép câu, đàm đạo, hái lộc
    const PROGRAMS={sen:{name:'Múa Sen',dur:150,step:.6,robe:'#f0c4c8',seed:11},quat:{name:'Múa Quạt Lụa',dur:150,step:.45,robe:'#e9c46a',seed:23},hoatau:{name:'Hòa tấu Đàn Tranh · Sáo Trúc · Đàn Bầu',dur:180,step:.5,robe:'#7a5a3c',seed:37}};
    const QUIZ=[
      ['do','Đàn bầu (độc huyền cầm) có mấy dây?',['1 dây','2 dây','3 dây','16 dây'],0,'Đàn bầu chỉ có một dây; người chơi tạo cao độ bằng cần đàn và bồi âm.'],
      ['do','Đàn tranh phổ biến ngày nay thường có bao nhiêu dây?',['7 dây','12 dây','16 dây','36 dây'],2,'Đàn tranh còn gọi là đàn thập lục: 16 dây.'],
      ['do',"Đàn T'rưng là nhạc cụ tre nứa của vùng nào?",['Tây Bắc','Tây Nguyên','Nam Bộ','Đồng bằng sông Hồng'],1,"Đàn T'rưng gắn với đồng bào các dân tộc Tây Nguyên."],
      ['do','Quan họ là dân ca của vùng nào?',['Huế','Nghệ Tĩnh','Kinh Bắc (Bắc Ninh, Bắc Giang)','Nam Bộ'],2,'Dân ca Quan họ Bắc Ninh được UNESCO ghi danh năm 2009.'],
      ['do','Nhã nhạc cung đình Huế được UNESCO vinh danh năm nào?',['1993','2003','2013','2023'],1,'Năm 2003, Nhã nhạc được công nhận là kiệt tác di sản phi vật thể.'],
      ['do','Thang âm ngũ cung có mấy âm?',['3','5','7','12'],1,'Năm âm: vì thế ai bấm phím nào cũng hòa âm êm tai.'],
      ['do','Múa rối nước sinh ra từ vùng nào?',['Đồng bằng sông Hồng','Tây Nguyên','Duyên hải miền Trung','Đồng bằng sông Cửu Long'],0,'Múa rối nước gắn với làng quê đồng bằng Bắc Bộ.'],
      ['do','Tết Trung thu rơi vào ngày nào âm lịch?',['Rằm tháng Giêng','Mùng 5 tháng 5','Rằm tháng 7','Rằm tháng 8'],3,'Rằm tháng Tám, đêm trăng tròn sáng nhất năm.'],
      ['doi','Ghép câu: «Thịt mỡ, dưa hành, câu đối đỏ»',['Cây nêu, tràng pháo, bánh chưng xanh','Hoa đào, mứt bí, áo dài hồng','Trăng rằm, đèn kéo, bánh nướng thơm','Ruộng lúa, cánh cò, khói lam chiều'],0,'Câu đối Tết quen thuộc của người Việt.'],
      ['doi','Ghép câu ca dao: «Gió đưa cành trúc la đà»',['Mây trôi lững thững qua nhà người thương','Tiếng chuông Trấn Vũ, canh gà Thọ Xương','Đêm khuya thanh vắng một mình ngân nga','Đường lên xứ Lạng bao xa'],1,'Ca dao về Hà Nội: Trấn Vũ, Thọ Xương.'],
      ['doi','Ghép câu ca dao: «Công cha như núi Thái Sơn»',['Nghĩa mẹ như nước trong nguồn chảy ra','Lòng con như biển bao la','Thờ cha kính mẹ mới là đạo con','Ơn thầy như ánh trăng rằm'],0,'Câu tiếp theo: «Một lòng thờ mẹ kính cha…»'],
      ['talk','Đàm đạo tối nay: mình cùng kể về điều gì?',['Ký ức Tết quê','Một câu hát mẹ ru','Món ăn chữa lành','Một nơi thấy bình yên'],-1,''],
      ['talk','Tiết mục nào bạn muốn xem tiếp?',['Múa Sen','Múa Quạt Lụa','Hòa tấu Đàn Tranh & Sáo','Một bài hát cùng hát'],-1,'']];
    const LOC=['Bình an như nước, mềm mà bền.','Năm nay lòng nhẹ, bước chân vững.','Có người thương, có việc vui, có giấc ngủ ngon.','Sức khỏe dồi dào, tâm ý thong dong.','Gieo một hạt lành, gặt mùa an.','Lời hiền đi trước, phúc lành theo sau.','Thở chậm một nhịp, việc khó hóa dễ.','Nhà ấm, bếp đỏ, bạn hiền.','Mỗi ngày một niềm biết ơn nhỏ.','Học điều mới, giữ điều tốt.','Sen trong đầm: gần bùn mà vẫn thơm.','Đi chậm mà xa, sống hiền mà sáng.'];
    // ---- trạng thái chung (chỉ trong bộ nhớ của trang: lời chúc, đèn, phiếu chọn không lưu Supabase)
    const S={joined:false,me:'me',role:'guest',list:[],assign:{},leader:'me',myC:0,pickC:null,tab:'stage',show:null,quiz:null,tally:[0,0,0,0],votes:new Map(),myVote:null,lantern:new Map(),wall:new Map(),lgo:null,loc:null,n:0,note:'',muted:false,video:null};
    const isLeader=()=>!S.joined||S.leader===S.me;
    const canHost=()=>isLeader();
    const nameOf=id=>{if(id===S.me)return myName();const p=S.list.find(x=>x.id===id);return clean(p&&p.name,24)||'Một người bạn'};
    const send=p=>{if(S.joined&&window.anyenSpaceChat)return window.anyenSpaceChat.send(p);return false};
    function computeSeats(){const list=S.joined?S.list:[{id:S.me,t:0,c:S.pickC}];const used=[0,0,0,0,0,0],assign={};let rr=0;
      for(const p of [...list].sort((a,b)=>(a.t||0)-(b.t||0)||String(a.id).localeCompare(String(b.id)))){let k=Number.isInteger(p.c)&&p.c>=0&&p.c<6&&used[p.c]<6?p.c:-1;if(k<0){for(let j=0;j<6;j++){const q=(rr+j)%6;if(used[q]<6){k=q;break}}rr=(k+1)%6}if(k<0)break;assign[p.id]=k*1+used[k]*6;used[k]++}
      S.assign=assign;const mine=assign[S.me];S.myC=mine==null?(S.pickC||0):mine%6;
      const hosts=S.list.filter(p=>p.host).sort((a,b)=>(a.t||0)-(b.t||0));S.leader=S.joined?((hosts[0]||[...S.list].sort((a,b)=>(a.t||0)-(b.t||0)||String(a.id).localeCompare(String(b.id)))[0]||{id:S.me}).id):S.me;
      for(let i=0;i<36;i++)seats.setColorAt(i,SEAT_OFF);for(const [id,i] of Object.entries(assign))seats.setColorAt(i,id===S.me?SEAT_ME:SEAT_ON);seats.instanceColor.needsUpdate=true;
      CPOS.forEach((_,k)=>tables.setColorAt(k,new THREE.Color(k===S.myC?'#f6dca0':'#ffffff')));tables.instanceColor.needsUpdate=true}
    const clusterOf=id=>{const i=S.assign[id];return i==null?null:i%6};
    // ---- màn chiếu 16:9
    function roundRect(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath()}
    function wrap(c,text,x,y,maxW,lh,maxL){const words=String(text).split(' ');let ln='',n=0;for(const w of words){const t=ln?ln+' '+w:w;if(c.measureText(t).width>maxW&&ln){c.fillText(ln,x,y+n*lh);n++;ln=w;if(n>=maxL)return}else ln=t}if(ln&&n<maxL)c.fillText(ln,x,y+n*lh)}
    let scrDirty=true,scrLast=0;
    function drawScreen(){const c=scrT.c,w=1024,h=576;const g=c.createLinearGradient(0,0,0,h);g.addColorStop(0,'#1b2a22');g.addColorStop(1,'#0e1512');c.fillStyle=g;c.fillRect(0,0,w,h);c.strokeStyle='#c8a96a';c.lineWidth=3;c.strokeRect(14,14,w-28,h-28);c.textAlign='center';
      const now=Date.now();
      if(S.lgo&&S.lgo>now-1500){const s=Math.max(0,Math.ceil((S.lgo-now)/1000));c.fillStyle='#f6dca0';c.font='600 40px system-ui, sans-serif';c.fillText('🏮 CÙNG THẢ 36 ĐÈN HOA AN YÊN',w/2,150);c.font='700 200px Georgia, serif';c.fillText(s?String(s):'✦',w/2,390);c.font='26px system-ui, sans-serif';c.fillStyle='#e8d7b0';c.fillText('Viết một lời chúc bình an ở bảng dưới, đèn sẽ tự bay khi đếm xong',w/2,470);}
      else if(S.quiz){const q=QUIZ[S.quiz.i];if(!q)return;c.fillStyle='#e8cf95';c.font='600 26px system-ui, sans-serif';c.fillText(q[0]==='talk'?'💬 ĐÀM ĐẠO · BÌNH CHỌN':q[0]==='doi'?'📜 GHÉP CÂU ĐỐI · CA DAO':'❓ ĐỐ VUI VĂN HÓA VIỆT',w/2,64);c.fillStyle='#fbf1dc';c.font='600 36px Georgia, serif';wrap(c,q[1],w/2,118,880,44,2);
        const tot=S.tally.reduce((a,b)=>a+b,0);q[2].forEach((o,k)=>{const y=210+k*80,pct=tot?S.tally[k]/tot:0,right=S.quiz.r&&q[3]===k;c.fillStyle='rgba(255,255,255,.06)';roundRect(c,80,y,864,62,14);c.fill();c.fillStyle=right?'rgba(140,200,140,.55)':'rgba(217,163,56,.42)';if(pct>0){roundRect(c,80,y,Math.max(28,864*pct),62,14);c.fill()}
          c.strokeStyle=S.myVote===k?'#f6dca0':'rgba(200,169,106,.5)';c.lineWidth=S.myVote===k?3:1.5;roundRect(c,80,y,864,62,14);c.stroke();c.textAlign='left';c.fillStyle='#fbf1dc';c.font='28px system-ui, sans-serif';c.fillText('ABCD'[k]+'. '+o+(right?'  ✓':''),104,y+41);c.textAlign='right';c.fillText(Math.round(pct*100)+'%',920,y+41);c.textAlign='center'});
        c.fillStyle='#cdb98e';c.font='22px system-ui, sans-serif';c.fillText(S.quiz.r&&q[4]?q[4]:tot+' phiếu · tỷ lệ chọn hiện trực tiếp · không chấm điểm',w/2,548)}
      else if(S.loc&&now-S.loc.at<20000){c.fillStyle='#f2c46a';c.font='600 40px system-ui, sans-serif';c.fillText('🧧 HÁI LỘC ĐẦU XUÂN',w/2,150);c.fillStyle='#fbf1dc';c.font='italic 44px Georgia, serif';wrap(c,'“'+LOC[S.loc.i]+'”',w/2,280,820,58,3);c.font='24px system-ui, sans-serif';c.fillStyle='#cdb98e';c.fillText('Lộc của riêng bạn · mỗi người một lá',w/2,480)}
      else if(S.show&&S.show.p!=='video'){const P=PROGRAMS[S.show.p],el=Math.max(0,(now-S.show.at)/1000);c.fillStyle='#e8cf95';c.font='600 28px system-ui, sans-serif';c.fillText('ĐÊM CA MÚA NHẠC AN YÊN · ĐANG DIỄN',w/2,80);c.fillStyle='#fbf1dc';c.font='600 56px Georgia, serif';wrap(c,P.name,w/2,200,900,64,2);
        c.fillStyle='rgba(255,255,255,.12)';c.fillRect(160,400,704,10);c.fillStyle='#d9a338';c.fillRect(160,400,704*Math.min(1,el/P.dur),10);c.font='26px system-ui, sans-serif';c.fillStyle='#cdb98e';const mm=s=>Math.floor(s/60)+':'+String(Math.floor(s%60)).padStart(2,'0');c.fillText(mm(Math.min(el,P.dur))+' / '+mm(P.dur)+' · đồng bộ '+(S.joined?S.n:1)+' khán giả',w/2,460);c.fillText('Bấm 🌸 🎗️ 👏 để cổ vũ dịu nhẹ',w/2,505)}
      else{c.fillStyle='#e8cf95';c.font='600 30px system-ui, sans-serif';c.fillText('NHÀ VĂN HÓA LÀNG YÊN',w/2,100);c.fillStyle='#fbf1dc';c.font='600 52px Georgia, serif';c.fillText('Đêm Ca Múa Nhạc An Yên',w/2,190);c.font='28px system-ui, sans-serif';c.fillStyle='#e8d7b0';
        ['🎭 Múa Sen · Múa Quạt Lụa · Hòa tấu Đàn Tranh, Sáo Trúc, Đàn Bầu','🎶 Hòa tấu 36 nhịp gõ ngũ cung · phím 1–5','🏮 Thả 36 đèn hoa lên vòm mái','❓ Đố vui văn hóa · ghép câu đối · hái lộc','🍵 Tiệc trà · triển lãm 9 ô · 18 lời chúc'].forEach((t,k)=>c.fillText(t,w/2,270+k*48));
        c.fillStyle='#cdb98e';c.font='24px system-ui, sans-serif';c.fillText((S.joined?S.n+'/36 người trong phòng':'Trải nghiệm riêng')+(isLeader()?' · bạn đang dẫn chương trình':''),w/2,535)}
      scrT.needsUpdate=true;scrDirty=false}
    // ---- tường lời chúc 18 thẻ và triển lãm 9 ô
    function drawWall(){const c=wallT.c,w=768,h=384;c.fillStyle='#2b2118';c.fillRect(0,0,w,h);c.fillStyle='#e8cf95';c.font='600 20px system-ui, sans-serif';c.textAlign='center';c.fillText('BỨC TƯỜNG 18 LỜI CHÚC LÀNH',w/2,26);
      const items=[...S.wall.values()].sort((a,b)=>b.at-a.at).slice(0,18);for(let k=0;k<18;k++){const x=12+(k%6)*125,y=40+Math.floor(k/6)*114,it=items[k];c.save();c.translate(x+58,y+52);c.rotate(((k*37)%7-3)*.012);c.fillStyle=it?['#f4ead6','#f6e2c4','#efe6d0'][k%3]:'rgba(244,234,214,.12)';c.fillRect(-56,-48,112,98);c.fillStyle='#b8873a';c.beginPath();c.arc(0,-42,4,0,Math.PI*2);c.fill();
        if(it){c.fillStyle='#3a2a1c';c.font='italic 13px Georgia, serif';c.textAlign='center';wrap(c,it.w,0,-20,100,15,4);c.font='600 11px system-ui, sans-serif';c.fillStyle='#8c6a34';c.fillText('— '+clean(it.name,14),0,40)}c.restore()}wallT.needsUpdate=true}
    const GAL={rows:[],state:'loading'};
    function drawGallery(){const c=galT.c,w=512;c.fillStyle='#2b2118';c.fillRect(0,0,w,w);c.fillStyle='#e8cf95';c.font='600 18px system-ui, sans-serif';c.textAlign='center';c.fillText('TRIỂN LÃM 9 Ô · 4 KHO LÀNG',w/2,24);
      for(let k=0;k<9;k++){const x=16+(k%3)*162,y=36+Math.floor(k/3)*158,it=GAL.rows[k];c.fillStyle='#1c140d';c.fillRect(x,y,150,146);c.strokeStyle='#a6824b';c.lineWidth=3;c.strokeRect(x+3,y+3,144,140);
        if(!it){c.fillStyle='rgba(232,207,149,.35)';c.font='13px system-ui, sans-serif';c.fillText(GAL.state==='loading'?'Đang mở kho…':'Ô trống',x+75,y+78);continue}
        c.fillStyle=it.bg;c.fillRect(x+12,y+12,126,92);c.font='44px system-ui, sans-serif';c.fillStyle='#fff';c.fillText(it.icon,x+75,y+74);c.font='600 12px system-ui, sans-serif';c.fillStyle='#f6e7c8';c.fillText(clean(it.title,20),x+75,y+122);c.font='11px system-ui, sans-serif';c.fillStyle='#cdb98e';c.fillText(clean(it.by,18),x+75,y+137)}galT.needsUpdate=true}
    async function loadGallery(){drawGallery();const db=typeof flowerDb!=='undefined'?flowerDb:null;const out={flowers:[],robes:[],pots:[],aromas:[]};
      if(db&&typeof ARCH!=='undefined'){await Promise.all(Object.keys(out).map(async kind=>{const A=ARCH[kind];if(!A)return;for(const cols of A.cols){try{const {data,error}=await db.from(A.table).select(cols).order('seq',{ascending:false}).limit(STORE_FETCH);if(!error&&data){out[kind]=pickNine(data);return}}catch(e){return}}}))}
      const card={flowers:r=>({icon:(r.flowers||[]).slice(0,3).map(f=>(FLOWER_KINDS[f]||{}).icon||'🌸').join('')||'💐',bg:'#3d4a32',title:'Bó hoa dâng Phật',kind:'flowers'}),
        robes:r=>({icon:'🟧',bg:String(r.color||'#c98a1c').replace(/[^#0-9a-fA-F]/g,'').slice(0,7)||'#c98a1c',title:(Number(r.dieu)||5)+' điều y',kind:'robes'}),
        pots:r=>({icon:'🏺',bg:(typeof GOM_FIRED!=='undefined'&&GOM_FIRED[(Number(r.seed)||0)%GOM_FIRED.length]||[0,'#a0502e'])[1],title:(typeof GOM_SHAPES!=='undefined'&&(GOM_SHAPES[r.shape]||GOM_SHAPES[0]).name)||'Gốm Bàu Trúc',kind:'pots'}),
        aromas:r=>({icon:r.form==='tui'?'👝':'🫙',bg:'#4a3a52',title:clean(r.title,20)||(r.form==='tui'?'Túi thơm':'Lọ Ước'),kind:'aromas'})};
      const take=[['pots',3],['flowers',2],['robes',2],['aromas',2]],rows=[];for(const [k,n] of take)for(const r of out[k].slice(0,n))rows.push(Object.assign(card[k](r),{by:clean(r.name,18)||'Khách Làng Yên',row:r}));
      for(const [k] of take)for(const r of out[k].slice(take.find(x=>x[0]===k)[1]))if(rows.length<9)rows.push(Object.assign(card[k](r),{by:clean(r.name,18)||'Khách Làng Yên',row:r}));
      GAL.rows=rows.slice(0,9);GAL.state='ready';drawGallery();if(S.tab==='tea'&&S.sub==='gallery')render()}
    // ---- đèn hoa
    const L=[];/* {id,w,name,k,t0,slot} */
    function placeLantern(id,w,name){w=clean(w,60);if(!w)return;let it=S.lantern.get(id);if(it){it.w=w;it.name=name;return it}
      const used=new Set([...S.lantern.values()].map(x=>x.slot));let slot=0;while(used.has(slot)&&slot<36)slot++;if(slot>=36){const old=[...S.lantern.values()].sort((a,b)=>a.t0-b.t0)[0];if(!old)return;S.lantern.delete(old.id);slot=old.slot}
      const k=clusterOf(id);it={id,w,name,k:k==null?Math.floor(Math.random()*6):k,t0:performance.now(),slot};S.lantern.set(id,it);strike(523,2.5,.035,[[1,1],[2,.25],[3,.08]]);return it}
    function releaseMine(w){w=clean(w,60);if(!w){rmHint('Viết một lời chúc bình an ngắn trước khi thả đèn nhé');return}S.myWish=w;placeLantern(S.me,w,myName());send({k:'l',w});rmHint('🏮 Đèn hoa của bạn đang bay lên vòm mái · chạm một đèn để đọc lời chúc');goView('roof');render()}
    // ---- góc nhìn (trượt mềm)
    const VIEWS={overview:[0,1.1,-.8,0,.34,8.6],stage:[0,1.8,-3.3,0,.16,4.4],roof:[0,4.4,-.6,0,-.22,6.4],gallery:[-HW+.1,2.5,2.65,Math.PI/2,.04,3.6],wall:[HW-.1,2.8,2.65,-Math.PI/2,.04,3.6],tea:[HW-.6,1.2,2.2,-Math.PI/2+.3,.25,3]};
    let tw=null;function goView(k){let v=VIEWS[k];if(k==='mine'){const [x,z]=CPOS[S.myC];v=[x,.8,z-.4,0,.5,4.6]}if(!v)return;tw={a:[st.target.x,st.target.y,st.target.z,st.yaw,st.pitch,st.dist],b:v,t0:performance.now()};st.yawC=v[3]}
    st.minD=2.4;st.maxD=9.2;st.target.set(0,1.5,1.5);st.yaw=0;st.pitch=.12;st.dist=6;goView('overview');
    // ---- chương trình biểu diễn (đồng bộ mốc giây sync_ts: mỗi máy tính thời điểm bắt đầu theo đồng hồ của người dẫn trừ độ lệch)
    let vidEl=null,vidTex=null;
    function stopVideo(){if(vidEl){try{vidEl.pause()}catch(e){}vidEl.removeAttribute('src');try{vidEl.load()}catch(e){}vidEl=null}if(vidTex){vidTex.dispose();vidTex=null}scrMat.map=scrT;scrMat.needsUpdate=true}
    function startVideo(url,at){stopVideo();const v=document.createElement('video');v.crossOrigin='anonymous';v.playsInline=true;v.setAttribute('playsinline','');v.preload='auto';v.src=url;vidEl=v;
      const sync=()=>{if(vidEl!==v||!S.show)return;const el=(Date.now()-S.show.at)/1000;if(isFinite(v.duration)&&el>v.duration+1){return}if(Math.abs(v.currentTime-el)>1.5)try{v.currentTime=Math.max(0,el)}catch(e){}};
      v.addEventListener('loadedmetadata',sync);v.addEventListener('error',()=>{if(vidEl===v){rmHint('Không mở được video này trên máy bạn (cần đường dẫn https tới tệp mp4/webm cho phép CORS)');stopVideo()}});
      vidTex=new THREE.VideoTexture(v);vidTex.colorSpace=THREE.SRGBColorSpace;scrMat.map=vidTex;scrMat.needsUpdate=true;v.muted=S.muted;v.play().catch(()=>{v.muted=true;S.muted=true;v.play().catch(()=>{});rmHint('Video đang chạy không tiếng · bấm 🔊 Bật tiếng ở bảng Sân khấu');render()});S.vsync=sync}
    function startShow(p,at,url,remote){if(p!=='video'&&!PROGRAMS[p])return;stopShow(true);S.show={p,at,url:p==='video'?url:null,step:-1};
      if(p==='video')startVideo(url,at);else{const P=PROGRAMS[p];NPC.forEach(n=>{n.robe.color.set(p==='hoatau'?['#7a5a3c','#5a6a4c','#6a4a5c'][n.i]:P.robe)})}
      layoutNPC();if(!remote){send({k:'show',p,at,u:p==='video'?url:undefined})}scrDirty=true;goView('stage');render()}
    function stopShow(silent,remote){if(!S.show)return;S.show=null;stopVideo();layoutNPC();if(!silent&&!remote)send({k:'stop'});scrDirty=true;render()}
    function layoutNPC(){const p=S.show&&S.show.p;NPC.forEach(n=>{n.g.visible=p!=='video';n.lotus.visible=p==='sen';n.fan.visible=p==='quat';n.inst.visible=p==='hoatau';n.body.scale.set(1,p==='hoatau'?.62:1,1);n.body.position.y=p==='hoatau'?.39:.62;n.head.position.y=p==='hoatau'?1.0:1.42;
      n.arms.forEach(a=>a.position.y=p==='hoatau'?.8:1.18);n.inst.position.set(0,p==='hoatau'?(n.i===1?.95:.12):0,p==='hoatau'?(n.i===1?.18:.42):0);n.inst.rotation.set(0,n.i===1?0:0,0);n.g.position.set((n.i-1)*1.9,STAGE_Y,SZ-.2);n.g.rotation.set(0,0,0)})}
    const rng=s=>()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
    function melodyAt(p,step){const r=rng(PROGRAMS[p].seed*1000+Math.floor(step/8))();const phrase=[0,1,2,4,3,2,1,0].map((d,i)=>(d+Math.floor(r*5)+(i===7?0:0))%5+1);return phrase[step%8]}
    function tickShow(t){const sh=S.show;if(!sh){NPC.forEach(n=>{n.arms[0].rotation.z=-.25+Math.sin(t*.8+n.i)*.03;n.arms[1].rotation.z=.25;n.g.rotation.y=0});return}
      const el=(Date.now()-sh.at)/1000;if(sh.p==='video'){if(((t*2)|0)%10===0&&S.vsync)S.vsync();return}
      const P=PROGRAMS[sh.p];if(el>=P.dur){if(isLeader())stopShow(false);else stopShow(true,true);rmHint('🎭 '+P.name+' đã khép lại · cảm ơn bạn đã cùng xem');return}if(el<0)return;
      const step=Math.floor(el/P.step);if(step!==sh.step){const first=sh.step<0;sh.step=step;if(!first||el-step*P.step<.2){const m=melodyAt(sh.p,step);
        if(sh.p==='sen'){voice('tranh',m,.8);if(step%4===0)voice('sao',melodyAt(sh.p,step+2),.9)}else if(sh.p==='quat'){voice('tranh',m,.8);if(step%2===0)voice('mo',3,.6)}else{voice('tranh',m,.8);if(step%4===0)voice('sao',melodyAt(sh.p,step+3),.8);if(step%2===1)voice('bau',melodyAt(sh.p,step+5),.8);NPC.forEach(n=>n.hit=performance.now())}}}
      NPC.forEach(n=>{const i=n.i,ph=el*(sh.p==='quat'?1.6:1)+i*2.1;if(sh.p==='sen'){n.g.position.x=(i-1)*1.9+Math.sin(el*.35+i*2.1)*.7;n.g.position.z=SZ-.2+Math.cos(el*.35+i*2.1)*.5;n.g.rotation.y=Math.sin(ph*.6)*.7;n.arms[0].rotation.z=-1.3-Math.sin(ph*1.1)*.5;n.arms[1].rotation.z=1.5+Math.sin(ph*1.1+1)*.6}
        else if(sh.p==='quat'){n.g.position.x=(i-1)*1.9+Math.sin(el*.5+i)*.5;n.g.rotation.y=Math.sin(ph*.8)*.9;n.arms[0].rotation.z=-.9-Math.sin(ph*2)*.4;n.arms[1].rotation.z=1.1+Math.sin(ph*2.4)*.8;n.fan.rotation.z=Math.sin(ph*3)*.6}
        else{const u=Math.max(0,1-(performance.now()-(n.hit||0))/300);n.arms[0].rotation.z=-.7-u*.25;n.arms[1].rotation.z=.7+u*.3;n.g.rotation.y=0}})}
    // ---- câu đố / bình chọn
    let qsT=0;function pushTally(){if(!isLeader()||!S.quiz)return;clearTimeout(qsT);qsT=setTimeout(()=>{if(S.quiz)send({k:'qs',i:S.quiz.i,c:S.tally,r:S.quiz.r?1:0,at:S.quiz.at})},350)}
    function recount(){const c=[0,0,0,0];for(const v of S.votes.values())if(v>=0&&v<4)c[v]++;S.tally=c;scrDirty=true}
    function openQuiz(i,at,remote){if(!QUIZ[i])return;S.quiz={i,r:false,at};S.votes=new Map();S.myVote=null;S.tally=[0,0,0,0];S.lgo=null;if(!remote)send({k:'q',i,at});scrDirty=true;S.tab='quiz';goView('stage');render()}
    function vote(c){if(!S.quiz||c<0||c>3)return;S.myVote=c;strike(660,.6,.03,[[1,1],[2,.2]]);if(isLeader()){S.votes.set(S.me,c);recount();pushTally()}else{send({k:'v',i:S.quiz.i,c});S.tally=S.tally.slice();scrDirty=true}render()}
    function reveal(remote){if(!S.quiz)return;S.quiz.r=true;if(!remote){send({k:'qa',i:S.quiz.i});pushTally()}const q=QUIZ[S.quiz.i];if(q&&q[3]>=0)strike(784,2,.04,[[1,1],[2,.3],[3,.1]]);scrDirty=true;render()}
    function closeQuiz(remote){if(!S.quiz)return;S.quiz=null;if(!remote)send({k:'qx'});scrDirty=true;render()}
    function haiLoc(remote){const i=Math.floor(Math.random()*LOC.length);S.loc={i,at:Date.now()};scrDirty=true;strike(880,1.4,.04,[[1,1],[2,.3]]);if(!remote&&isLeader()&&S.joined)send({k:'loc'});rmHint('🧧 Lộc của bạn: '+LOC[i]);journal('Hái lộc ở Nhà Văn Hóa: '+LOC[i]);render()}
    // ---- hòa tấu: gói nốt nhỏ, gửi theo lô 200 ms (tối đa 5 gói/giây/người)
    let batch=[],batchT0=0,batchTimer=0,recent=[];
    function playNote(p,remote,k){k=k==null?S.myC:k;const kind=CL[k][2];const now=performance.now();recent=recent.filter(x=>now-x<600);if(!remote||recent.length<10){voice(kind,p,remote?.55:1);recent.push(now)}wave(k);
      if(!remote){if(!batch.length)batchT0=now;batch.push([p,Math.min(999,Math.round(now-batchT0))]);if(batch.length>=8)flushNotes();else if(!batchTimer)batchTimer=setTimeout(flushNotes,200)}}
    function flushNotes(){clearTimeout(batchTimer);batchTimer=0;if(batch.length)send({k:'n',n:batch});batch=[]}
    // ---- tín hiệu phòng (mọi gói đều đã qua space-chat: kênh riêng nha_van_hoa, có from và t)
    let cheerLast=0,teaLast=0;
    on(window,'anyen-space-room',e=>{const m=e.detail||{};if(!S.joined||!m.from||m.from===S.me)return;const from=String(m.from),lead=from===S.leader,skew=Number.isFinite(+m.t)?Date.now()-(+m.t):0,local=x=>Number.isFinite(+x)?+x+skew:Date.now();
      switch(m.k){
        case 'n':{const k=clusterOf(from);if(k==null||!Array.isArray(m.n))return;m.n.slice(0,8).forEach(x=>{const p=Array.isArray(x)?x[0]|0:0,dt=Array.isArray(x)?Math.max(0,Math.min(999,x[1]|0)):0;if(p>=1&&p<=5)setTimeout(()=>playNote(p,true,k),dt)});return}
        case 'ch':{const e2=m.e|0;if(e2>=0&&e2<3)cheerBurst(e2,clusterOf(from));return}
        case 'l':{placeLantern(from,m.w,nameOf(from));if(S.tab==='lantern')render();return}
        case 'w':{const w=clean(m.w,60);if(w){S.wall.set(from,{w,name:nameOf(from),at:Date.now()});drawWall();if(S.tab==='tea')render()}return}
        case 'tea':{rmHint('🍵 '+nameOf(from)+' vừa rót trà ở Quầy Đông');return}
        case 'v':{if(isLeader()&&S.quiz&&(m.i|0)===S.quiz.i){const c=m.c|0;if(c>=0&&c<4){S.votes.set(from,c);recount();pushTally();if(S.tab==='quiz')render()}}return}
      }
      if(!lead)return;/* từ đây: chỉ người dẫn */
      if(m.k==='show'){const p=String(m.p||''),u=typeof m.u==='string'&&/^https:\/\/[^\s"'<>]{4,400}$/.test(m.u)?m.u:null;if(p==='video'&&!u)return;if(S.show&&S.show.p===p&&Math.abs(S.show.at-local(m.at))<1500)return;startShow(p,local(m.at),u,true);rmHint('🎭 Người dẫn mở tiết mục · cả phòng cùng xem')}
      else if(m.k==='stop')stopShow(true,true);
      else if(m.k==='q'){const i=m.i|0;if(!S.quiz||S.quiz.i!==i)openQuiz(i,local(m.at),true)}
      else if(m.k==='qs'){const i=m.i|0;if(!QUIZ[i])return;if(!S.quiz||S.quiz.i!==i)openQuiz(i,local(m.at),true);if(Array.isArray(m.c))S.tally=[0,1,2,3].map(k=>Math.max(0,Math.min(99,m.c[k]|0)));if(m.r)S.quiz.r=true;scrDirty=true;if(S.tab==='quiz')render()}
      else if(m.k==='qa')reveal(true);else if(m.k==='qx')closeQuiz(true);
      else if(m.k==='lgo'){const at=local(m.at);if(at>Date.now()-2000&&at<Date.now()+30000){S.lgo=at;scrDirty=true;S.tab='lantern';goView('roof');render()}}
      else if(m.k==='loc')haiLoc(true);
      else if(m.k==='vr'){if(S.quiz&&(m.i|0)===S.quiz.i&&S.myVote!=null)setTimeout(()=>send({k:'v',i:S.quiz.i,c:S.myVote}),200+Math.random()*1500)}});
    function resendMine(){const j=600+Math.random()*3500;setTimeout(()=>{if(!S.joined)return;if(S.myWish)send({k:'l',w:S.myWish});if(S.myWall)setTimeout(()=>send({k:'w',w:S.myWall}),400)},j)}
    function resendLeader(){if(!isLeader()||!S.joined)return;setTimeout(()=>{if(!isLeader())return;if(S.show)send({k:'show',p:S.show.p,at:S.show.at,u:S.show.url||undefined});if(S.quiz)send({k:'qs',i:S.quiz.i,c:S.tally,r:S.quiz.r?1:0,at:S.quiz.at})},300)}
    on(window,'anyen-space-result',e=>{const d=e.detail||{};if(d.id!=='nha_van_hoa')return;if(d.ok){S.joined=true;S.me=d.me||S.me;S.note='';resendMine()}else{S.joined=false;S.list=[];S.n=0;
      S.note=d.reason==='guest'||d.reason==='auth'?'Bạn đang trải nghiệm riêng · đăng nhập thành viên để cùng 36 người xem, chơi nhạc và thả đèn':d.reason==='full'?'Nhà Văn Hóa đã đủ 36 người · bạn đang trải nghiệm riêng':'Chưa kết nối được phòng 36 người · bạn đang trải nghiệm riêng'}computeSeats();scrDirty=true;render()});
    on(window,'anyen-space-people',e=>{const d=e.detail||{};if(d.id!=='nha_van_hoa')return;const grew=(d.n||0)>S.n;S.n=d.n||0;if(d.me)S.me=d.me;S.joined=true;
      S.list=Array.isArray(d.list)?d.list.map(p=>({id:String(p.id),name:clean(p.name,24),t:+p.t||0,host:!!p.host,c:Number.isInteger(p.c)?p.c:null})):[];const wasLead=S.leader;computeSeats();
      if(grew){resendLeader();resendMine()}if(wasLead!==S.leader&&S.leader===S.me){rmHint('🎙️ Bạn đang dẫn chương trình cho cả phòng');if(S.quiz){S.votes=new Map();if(S.myVote!=null)S.votes.set(S.me,S.myVote);recount();send({k:'vr',i:S.quiz.i});pushTally()}}scrDirty=true;render()});
    // vai trò: Healer/Admin được ưu tiên dẫn (tự báo trong presence; chỉ ảnh hưởng ai điều khiển màn chiếu, không mở quyền dữ liệu nào)
    (async()=>{try{if(typeof window.anyenAuthClient!=='function')return;const c=await window.anyenAuthClient();if(!c)return;const {data}=await c.rpc('anyen_my_role');S.role=String(data||'guest');if(/therapist|admin/.test(S.role)&&window.anyenSpaceChat&&window.anyenSpaceChat.meta)window.anyenSpaceChat.meta({host:true})}catch(e){}})();
    function pickCluster(k){if(k<0||k>5)return;S.pickC=k;if(S.joined&&window.anyenSpaceChat&&window.anyenSpaceChat.meta)window.anyenSpaceChat.meta({c:k});computeSeats();wave(k);voice(CL[k][2],1);rmHint('🎶 Bạn ngồi cụm '+CL[k][0]+' · '+CL[k][1]+' · bấm phím 1–5 để hòa tấu');render()}
    // ---- chạm trong phòng: dùng vị trí ngón tay cuối cùng để biết chạm vào bàn nào, đèn nào, ô nào
    let lastP=null;on(rmCanvas,'pointerdown',e=>{lastP={x:e.clientX,y:e.clientY}});
    const ray=new THREE.Raycaster();function hitOf(obj){if(!lastP)return null;const rc=rmCanvas.getBoundingClientRect();ray.setFromCamera(new THREE.Vector2((lastP.x-rc.left)/rc.width*2-1,-(lastP.y-rc.top)/rc.height*2+1),st.cam);return ray.intersectObject(obj,false)[0]||null}
    rTap(st,tables,()=>{const h=hitOf(tables);if(h&&h.instanceId!=null){S.tab='jam';pickCluster(h.instanceId);goView('mine')}});
    rTap(st,seats,()=>{const h=hitOf(seats);if(h&&h.instanceId!=null){S.tab='jam';pickCluster(h.instanceId%6);goView('mine')}});
    rTap(st,lanterns,()=>{const h=hitOf(lanterns);if(!h||h.instanceId==null)return;const it=[...S.lantern.values()].find(x=>x.slot===h.instanceId);if(it){S.readL=it.id;rmHint('🏮 '+clean(it.name,24)+': “'+it.w+'”');S.tab='lantern';render()}});
    rTap(st,screen,()=>{S.tab=S.quiz?'quiz':'stage';goView('stage');render()});
    rTap(st,gallery,()=>{S.tab='tea';S.sub='gallery';goView('gallery');const h=hitOf(gallery);if(h&&h.uv){const px=h.uv.x*512,py=(1-h.uv.y)*512,col=Math.max(0,Math.min(2,Math.floor((px-16)/162))),row=Math.max(0,Math.min(2,Math.floor((py-36)/158)));S.galSel=row*3+col}if(GAL.state!=='ready')loadGallery();render()});
    rTap(st,wishWall,()=>{S.tab='tea';S.sub='wall';goView('wall');render()});
    rTap(st,counter,()=>{S.tab='tea';S.sub='tea';goView('tea');render()});rTap(st,pot,()=>pourTea());
    NPC.forEach(n=>rTap(st,n.g,()=>{S.tab='stage';goView('stage');render()}));
    function pourTea(){if(performance.now()-teaLast<2500)return;teaLast=performance.now();steam.userData.t0=teaLast;strike(1900,.4,.01,[[1,1]]);setTimeout(()=>strike(620,1.2,.02,[[1,1],[2.4,.2]]),400);rmHint('🍵 Bạn rót một chén trà ấm ở Quầy Đông');send({k:'tea'})}
    const typing=e=>{const t=e.target;return t&&(t.tagName==='INPUT'||t.tagName==='TEXTAREA'||t.isContentEditable)};
    on(document,'keydown',e=>{if(!roomOpen||typing(e)||e.repeat)return;const p=+e.key;if(p>=1&&p<=5){e.preventDefault();playNote(p);if(S.tab!=='jam'){S.tab='jam';render()}}});
    // ---- bảng điều khiển
    function modeBadge(){const lead=isLeader();return '<p class="vh-mode">'+(S.joined?'👥 '+S.n+'/36 người':'🧘 Trải nghiệm riêng')+' · bạn ở <b>'+CL[S.myC][0]+' '+CL[S.myC][1]+'</b>'+(S.joined?(lead?' · 🎙️ bạn đang dẫn chương trình':' · người dẫn: '+esc(nameOf(S.leader))):'')+'</p>'+(S.note?'<p class="rm-note">'+esc(S.note)+'</p>':'')}
    function render(){{const ae=document.activeElement;if(ae&&ae.tagName==='INPUT'&&rmPanel.contains(ae)){S.pend=true;return}}const t=S.tab,lead=canHost();let h=modeBadge();
      h+='<div class="rm-row vh-tabs">'+[['stage','🎭 Sân khấu'],['jam','🎶 Hòa tấu'],['lantern','🏮 Đèn hoa'],['quiz','❓ Đố vui'],['tea','🍵 Tiệc trà']].map(([k,l])=>'<button type="button" data-tab="'+k+'"'+(t===k?' class="sel"':'')+'>'+l+'</button>').join('')+'</div>';
      if(t==='stage'){const sh=S.show;h+=sh?'<p>🎭 Đang diễn: <b>'+esc(sh.p==='video'?'Video / Livestream 16:9':PROGRAMS[sh.p].name)+'</b> · cả phòng xem cùng một mốc giây.</p>':'<p><b>01 · Ca Múa Nhạc Dân tộc</b> · '+(lead?'Bạn chọn tiết mục cho cả phòng.':'Người dẫn sẽ mở tiết mục; mọi người xem cùng lúc.')+'</p>';
        if(lead){h+='<div class="rm-row">'+Object.entries(PROGRAMS).map(([k,P])=>'<button type="button" data-vh="show" data-p="'+k+'"'+(sh&&sh.p===k?' class="sel"':'')+'>'+(k==='sen'?'🪷 ':k==='quat'?'🪭 ':'🎼 ')+esc(P.name)+'</button>').join('')+(sh?'<button type="button" data-vh="stop">⏹ Dừng</button>':'')+'</div>'+
          '<form class="rm-row" data-vh="video"><input type="url" inputmode="url" maxlength="400" placeholder="Đường dẫn video https (mp4/webm) cho màn chiếu" aria-label="Đường dẫn video" class="vh-in"><button type="submit">📺 Chiếu</button></form>'}
        if(sh&&sh.p==='video')h+='<div class="rm-row"><button type="button" data-vh="unmute">'+(S.muted?'🔊 Bật tiếng':'🔈 Tắt tiếng')+'</button></div>';
        h+='<div class="rm-row">Cổ vũ: '+CHEER.map(([i,l],k)=>'<button type="button" data-vh="cheer" data-e="'+k+'">'+i+' '+l+'</button>').join('')+'</div>'}
      else if(t==='jam')h+='<p><b>02 · Hòa tấu 36 nhịp gõ ngũ cung</b> · Bấm 1–5 (hoặc phím số) lúc nào cũng hòa âm êm tai, không lệch tông. Chạm một bàn để đổi cụm nhạc cụ.</p><div class="rm-row vh-keys">'+['Đô','Rê','Mi','Son','La'].map((n,k)=>'<button type="button" data-vh="note" data-p="'+(k+1)+'"><b>'+(k+1)+'</b><small>'+n+'</small></button>').join('')+'</div><div class="rm-row">'+CL.map(([id,nm],k)=>'<button type="button" data-vh="cluster" data-c="'+k+'"'+(k===S.myC?' class="sel"':'')+'>'+id+' '+esc(nm)+'</button>').join('')+'</div>';
      else if(t==='lantern'){const mine=S.lantern.get(S.me),cnt=S.lantern.size;h+='<p><b>03 · Thả đèn hoa An Yên</b> · '+cnt+'/36 đèn đang lơ lửng dưới vòm mái. Chạm một đèn để đọc lời chúc.</p>'+
        (S.readL&&S.lantern.get(S.readL)?'<p class="rm-quote">🏮 '+esc(S.lantern.get(S.readL).name)+': “'+esc(S.lantern.get(S.readL).w)+'”</p>':'')+
        '<form class="rm-row" data-vh="lantern"><input type="text" maxlength="60" autocomplete="off" placeholder="Lời chúc bình an ngắn (tối đa 60 ký tự)" aria-label="Lời chúc" class="vh-in" value="'+esc(S.draftWish||'')+'"><button type="submit" class="rm-gold">🏮 '+(mine?'Đổi lời chúc':'Thả đèn hoa')+'</button></form>'+
        (lead&&S.joined?'<div class="rm-row"><button type="button" data-vh="lgo">✨ Cả phòng cùng thả sau 10 giây</button></div>':'')+'<p class="rm-note">Lời chúc chỉ gửi cho người đang ở trong phòng, không lưu lại.</p>'}
      else if(t==='quiz'){const q=S.quiz&&QUIZ[S.quiz.i];h+='<p><b>04 · Đố vui văn hóa · Ghép câu đối · Bình chọn</b> · Tỷ lệ chọn hiện trực tiếp trên màn chiếu, không chấm điểm.</p>';
        if(q)h+='<p>'+esc(q[1])+'</p><div class="rm-row vh-opts">'+q[2].map((o,k)=>'<button type="button" data-vh="vote" data-c="'+k+'"'+(S.myVote===k?' class="sel"':'')+'>'+'ABCD'[k]+'. '+esc(o)+'</button>').join('')+'</div>'+(S.quiz.r&&q[4]?'<p class="rm-note">'+esc(q[4])+'</p>':'');
        else h+='<p class="rm-note">'+(lead?'Chọn một câu để mở cho cả phòng.':'Chờ người dẫn mở câu hỏi trên màn chiếu.')+'</p>';
        if(lead){h+='<div class="rm-row">'+(q?(q[3]>=0&&!S.quiz.r?'<button type="button" data-vh="reveal">✓ Hiện đáp án</button>':'')+'<button type="button" data-vh="next">⏭ Câu tiếp</button><button type="button" data-vh="qclose">✕ Đóng câu</button>':'<button type="button" class="rm-gold" data-vh="next">❓ Mở câu đố</button><button type="button" data-vh="doi">📜 Ghép câu đối</button><button type="button" data-vh="talk">💬 Chủ đề đàm đạo</button>')+'<button type="button" data-vh="loc">🧧 Hái lộc cùng nhau</button></div>'}
        else h+='<div class="rm-row"><button type="button" data-vh="loc">🧧 Hái lộc cho mình</button></div>'}
      else if(t==='tea'){const sub=S.sub||'tea';h+='<p><b>05 · Tiệc trà · Triển lãm 9 ô · 18 lời chúc · Quà Túi An Yên</b></p><div class="rm-row">'+[['tea','🍵 Quầy trà'],['wall','📜 18 lời chúc'],['gallery','🖼️ Triển lãm 9 ô']].map(([k,l])=>'<button type="button" data-sub="'+k+'"'+(sub===k?' class="sel"':'')+'>'+l+'</button>').join('')+'<button type="button" data-vh="gift">🎁 Tặng quà</button></div>';
        if(sub==='tea')h+='<p>Quầy Đông tự phục vụ: chạm ấm trà hoặc bấm nút để rót một chén cho mình, mọi người trong phòng thấy bạn đang dùng trà.</p><div class="rm-row"><button type="button" class="rm-gold" data-vh="tea">🍵 Rót trà</button></div>';
        else if(sub==='wall')h+='<p>Treo một lời chúc lên Tường Đông (18 thẻ mới nhất của phòng).</p><form class="rm-row" data-vh="wall"><input type="text" maxlength="60" autocomplete="off" placeholder="Lời chúc (tối đa 60 ký tự)" aria-label="Lời chúc treo tường" class="vh-in"><button type="submit" class="rm-gold">📜 Treo thẻ</button></form>';
        else{const it=GAL.rows[S.galSel|0];h+='<p>Tường Tây bày 9 tác phẩm từ 4 kho sẵn có (Gốm · Hoa · May Y · Lọ Ước), theo quy tắc kho 69/9. Chỉ xem, không tạo kho mới.</p>'+(GAL.state!=='ready'?'<p class="rm-note">Đang mở kho…</p>':!GAL.rows.length?'<p class="rm-note">Các kho đang trống hoặc chưa kết nối được.</p>':'<div class="rm-row">'+GAL.rows.map((r,k)=>'<button type="button" data-vh="gal" data-c="'+k+'"'+(k===(S.galSel|0)?' class="sel"':'')+'>'+r.icon+' '+(k+1)+'</button>').join('')+'</div>'+(it?'<p class="rm-quote">'+it.icon+' '+esc(it.title)+' · '+esc(it.by)+(typeof ARCH!=='undefined'&&ARCH[it.kind]?'</p><div class="vh-arch">'+ARCH[it.kind].row(it.row)+'</div>':'</p>'):''))}}
      rmPanel.innerHTML=h;
      rmPanel.querySelectorAll('form[data-vh]').forEach(f=>{const inp=f.querySelector('input');if(f.dataset.vh==='lantern')inp.oninput=()=>{S.draftWish=inp.value};f.onsubmit=e=>{e.preventDefault();const v=inp.value;inp.blur();
        if(f.dataset.vh==='lantern'){S.draftWish='';releaseMine(v)}else if(f.dataset.vh==='wall'){const w=clean(v,60);if(!w)return;S.myWall=w;S.wall.set(S.me,{w,name:myName(),at:Date.now()});drawWall();send({k:'w',w});rmHint('📜 Đã treo lời chúc lên Tường Đông');goView('wall');render()}
        else if(f.dataset.vh==='video'){const u=String(v||'').trim();if(!/^https:\/\/[^\s"'<>]{4,400}$/.test(u)){rmHint('Cần đường dẫn https tới tệp video');return}startShow('video',Date.now(),u,false)}}})}
    on(rmPanel,'focusout',()=>{if(S.pend){S.pend=false;setTimeout(render,0)}});
    let cheerBusy=0;
    on(rmPanel,'click',e=>{const b=e.target.closest('button');if(!b||b.type==='submit')return;if(b.dataset.tab){S.tab=b.dataset.tab;goView(S.tab==='jam'?'mine':S.tab==='lantern'?'roof':S.tab==='tea'?(S.sub==='wall'?'wall':S.sub==='gallery'?'gallery':'tea'):'stage');render();return}
      if(b.dataset.sub){S.sub=b.dataset.sub;goView(S.sub==='wall'?'wall':S.sub==='gallery'?'gallery':'tea');if(S.sub==='gallery'&&GAL.state!=='ready')loadGallery();render();return}
      const a=b.dataset.vh;
      if(a==='note')playNote(+b.dataset.p);
      else if(a==='cluster')pickCluster(+b.dataset.c);
      else if(a==='cheer'){const now=performance.now();if(now-cheerBusy<700)return;cheerBusy=now;const k=+b.dataset.e;cheerBurst(k,S.myC);send({k:'ch',e:k})}
      else if(a==='show'&&canHost())startShow(b.dataset.p,Date.now(),null,false);
      else if(a==='stop'&&canHost())stopShow(false);
      else if(a==='unmute'){S.muted=!S.muted;if(vidEl){vidEl.muted=S.muted;if(!S.muted)vidEl.play().catch(()=>{})}render()}
      else if(a==='lgo'&&canHost()){const at=Date.now()+10000;S.lgo=at;send({k:'lgo',at});scrDirty=true;goView('roof');render()}
      else if(a==='vote')vote(+b.dataset.c);
      else if(a==='reveal'&&canHost())reveal(false);
      else if(a==='qclose'&&canHost())closeQuiz(false);
      else if((a==='next'||a==='doi'||a==='talk')&&canHost()){const kind=a==='next'?(S.quiz?QUIZ[S.quiz.i][0]:'do'):a;const cur=S.quiz?S.quiz.i:-1;let i=-1;for(let j=1;j<=QUIZ.length;j++){const q=(cur+j)%QUIZ.length;if(QUIZ[q][0]===kind){i=q;break}}if(i>=0)openQuiz(i,Date.now(),false)}
      else if(a==='loc')haiLoc(false);
      else if(a==='tea')pourTea();
      else if(a==='gal'){S.galSel=+b.dataset.c;render()}
      else if(a==='gift'){document.body.classList.add('zen-sheet-bag');rmHint('🎁 Chọn một vật phẩm trong Túi An Yên rồi chọn người nhận đang cùng phòng')}});
    // ---- vòng vẽ
    computeSeats();drawWall();drawGallery();drawScreen();layoutNPC();loadGallery();
    const tmpC=new THREE.Color();let lgoFired=false;
    st.tick.push(t=>{const now=performance.now();{const asp=st.cam.aspect,f=asp<1?Math.min(78,52/Math.sqrt(asp)):52;if(Math.abs(st.cam.fov-f)>.5){st.cam.fov=f;st.cam.updateProjectionMatrix()}}/* điện thoại dọc: mở góc nhìn */
      if(tw){const u=Math.min(1,(now-tw.t0)/1200),k=u*u*(3-2*u),A=tw.a,B=tw.b;st.target.set(A[0]+(B[0]-A[0])*k,A[1]+(B[1]-A[1])*k,A[2]+(B[2]-A[2])*k);st.yaw=A[3]+(B[3]-A[3])*k;st.pitch=A[4]+(B[4]-A[4])*k;st.dist=A[5]+(B[5]-A[5])*k;if(u>=1)tw=null}
      tickShow(t);slit.material.opacity=.42+.12*Math.sin(t*.4);stageLight.intensity=S.show?6+Math.sin(t*2.2)*.6:4;
      // sóng ánh sáng
      for(let i=0;i<WAVES;i++){const w=waveS[i],u=(now-w.t0)/1600;if(u>=0&&u<1){dummy.position.set(w.x,.03,w.z);dummy.rotation.set(-Math.PI/2,0,0);dummy.scale.setScalar(1.4+u*4.2);dummy.updateMatrix();waves.setMatrixAt(i,dummy.matrix);waves.setColorAt(i,tmpC.copy(w.c).multiplyScalar(.32*(1-u)))}else if(u>=1&&u<1.2){waves.setColorAt(i,BLACK)}}
      waves.instanceMatrix.needsUpdate=true;waves.instanceColor.needsUpdate=true;
      // đèn hoa
      for(const it of S.lantern.values()){const [sx,sy,sz]=slotPos(it.slot),[cx,cz]=CPOS[it.k],u=Math.min(1,(now-it.t0)/6000),k=u*u*(3-2*u),i=it.slot;dummy.position.set(cx+(sx-cx)*k+Math.sin(t*.25+i)*.12*k,1+(sy-1)*k+Math.sin(t*.6+i*1.7)*.1*k,cz+(sz-cz)*k+Math.cos(t*.22+i)*.1*k);dummy.rotation.set(0,t*.2+i,0);dummy.scale.set(1,1.35,1);dummy.updateMatrix();lanterns.setMatrixAt(i,dummy.matrix);lanterns.setColorAt(i,tmpC.copy(LCOL).lerp(LCOL2,.5+.5*Math.sin(t*1.3+i)))}
      lanterns.instanceMatrix.needsUpdate=true;lanterns.instanceColor.needsUpdate=true;lanterns.boundingSphere=null;lanterns.boundingBox=null;
      if(S.lgo){const left=S.lgo-Date.now();if(left<=0&&!lgoFired){lgoFired=true;if(S.myWish||clean(S.draftWish,60))releaseMine(S.myWish||S.draftWish);else rmHint('🏮 Cả phòng vừa thả đèn · viết lời chúc để thả đèn của bạn');setTimeout(()=>{S.lgo=null;lgoFired=false;scrDirty=true},1600)}if(((now/250)|0)!==S.lgoTick){S.lgoTick=(now/250)|0;scrDirty=true}}
      // cổ vũ
      let alive=false;for(let i=0;i<PN;i++){const p=parts[i];if(p.life<=0)continue;alive=true;p.life-=.0045;p.k=Math.min(1,p.k+.02);p.a+=p.va*.016;p.y+=p.vy*.016;const cx=p.x+(p.tx-p.x)*p.k*.02,cz=p.z+(p.tz-p.z)*p.k*.02;p.x=cx;p.z=cz;
        pPos[i*3]=p.x+Math.sin(p.a)*p.r*p.k*.6;pPos[i*3+1]=p.life>0?p.y:-5;pPos[i*3+2]=p.z+Math.cos(p.a)*p.r*p.k*.35;pCol[i*3]=p.c.r*p.life;pCol[i*3+1]=p.c.g*p.life;pCol[i*3+2]=p.c.b*p.life}
      if(alive||pts.userData.alive){pGeo.attributes.position.needsUpdate=true;pGeo.attributes.color.needsUpdate=true}pts.userData.alive=alive;
      const us=(now-(steam.userData.t0||-1e9))/1000;steam.material.opacity=us<4?.25*Math.sin(Math.min(1,us/4)*Math.PI):0;steam.position.y=1.3+us*.06;
      if(scrDirty||(now-scrLast>1000&&(S.show||S.lgo))){scrLast=now;drawScreen()}});
    rmHint('Nhà Văn Hóa · 36 người · chạm sân khấu, bàn nhạc cụ, đèn hoa, Tường Tây hay Quầy Đông');render();
    window.dispatchEvent(new CustomEvent('anyen-space-ask'));/* xin space-chat phát lại danh sách người nếu đã ở trong kênh */
    st.cleanup=()=>{roomBox.classList.remove('vanhoa');flushNotes();clearTimeout(qsT);stopVideo();document.body.classList.remove('zen-sheet-bag');for(const f of offs)f();for(const t of texs)t.dispose();
      sc.traverse(o=>{if(o.material)(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>m.dispose())});delete window.__vanhoa};
    // kiểm tra: số tam giác đang vẽ, số PointLight, trạng thái; giả lập người khác
    window.__vanhoa={tris:()=>{let n=0;sc.traverse(o=>{if(!o.visible||(!o.isMesh&&!o.isSprite))return;let p=o.parent,vis=true;while(p){if(!p.visible)vis=false;p=p.parent}if(!vis)return;const g=o.geometry;if(!g)return;const c=(g.index?g.index.count:g.attributes.position.count)/3;n+=c*(o.isInstancedMesh?o.count:1)});return n},
      points:()=>{let n=0;sc.traverse(o=>{if(o.isPointLight)n++});return n},state:()=>({joined:S.joined,me:S.me,leader:S.leader,myC:S.myC,n:S.n,show:S.show&&S.show.p,quiz:S.quiz&&S.quiz.i,tally:S.tally.slice(),lanterns:S.lantern.size,wall:S.wall.size,gallery:GAL.rows.length,tab:S.tab}),
      fake:(id,msg)=>window.dispatchEvent(new CustomEvent('anyen-space-room',{detail:Object.assign({from:id,t:Date.now()},msg)})),
      people:list=>window.dispatchEvent(new CustomEvent('anyen-space-people',{detail:{id:'nha_van_hoa',n:list.length,me:S.me,list}})),
      lanternAll:()=>{for(let i=0;i<36;i++)placeLantern('t'+i,'Lời chúc bình an số '+(i+1),'Khách '+(i+1))},skip:s=>{if(S.show)S.show.at-=s*1000}};
  }
  __roomsExport({roomChuongGio,roomXongHuong,roomQuanTra,roomTuGia,roomTinhThat,roomXuongGom,roomNhaNiem,roomNhaVanHoa});
