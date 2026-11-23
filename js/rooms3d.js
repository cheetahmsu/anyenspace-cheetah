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
  __roomsExport({roomChuongGio,roomXongHuong,roomQuanTra,roomTuGia,roomTinhThat,roomXuongGom});
