// LÀNG YÊN · Vịnh Yên (nạp lười). Tách tự động từ js/world3d.js bằng tools/split_lazy.py; chạy bằng eval bên trong initialize3D.
  const BAY={x:0,z:20000};let bayPlay=null,playFly=null,playAnch=null;/* trượt phao / kayak khi tàu neo */
  bayGroup=new THREE.Group();bayGroup.position.set(BAY.x,0,BAY.z);bayGroup.visible=false;scene.add(bayGroup);
  // bayWorld: mọi thứ của vịnh (bờ đất, đảo, danh thắng, thuyền neo). Khi bước xuống Đảo Yên thì ẩn cả nhóm này: đảo là một không gian riêng.
  const bayWorld=new THREE.Group();bayGroup.add(bayWorld);const bayLandGroup=new THREE.Group();bayWorld.add(bayLandGroup);let bayIslandScene=null;
  bayData=null,bayBuilt=false,bayLoading=null,bayStash=null;
  const bayHash=(a,b,c)=>{const v=Math.sin(a*12.9898+b*78.233+c*37.719)*43758.5453;return v-Math.floor(v)};
  const baySm=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t)};
  // ---- Bầu trời buổi sáng và mặt biển ngọc (màu lấy từ khung giờ trong dữ liệu) ----
  const bayU={time:{value:0},top:{value:new THREE.Color('#7fb6dc')},hor:{value:new THREE.Color('#dfeef2')},haze:{value:new THREE.Color('#cfe0e6')},sunCol:{value:new THREE.Color('#fff2dc')},sunDir:{value:new THREE.Vector3(.4,.55,-.7).normalize()},cover:{value:.42},deep:{value:new THREE.Color('#1f7f74')},shallow:{value:new THREE.Color('#47b39d')},fogD:{value:.00105},camL:{value:new THREE.Vector3()}};
  const baySky=new THREE.Mesh(new THREE.SphereGeometry(1500,32,16),new THREE.ShaderMaterial({uniforms:bayU,side:THREE.BackSide,depthWrite:false,fog:false,toneMapped:false,
    vertexShader:'varying vec3 vD;void main(){vD=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader:`uniform vec3 top,hor,haze,sunCol,sunDir;uniform float time,cover;varying vec3 vD;
      float h2(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float n2(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h2(i),h2(i+vec2(1,0)),f.x),mix(h2(i+vec2(0,1)),h2(i+vec2(1,1)),f.x),f.y);}
      float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*n2(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return v;}
      void main(){vec3 d=normalize(vD);float y=max(d.y,0.);vec3 c=mix(hor,top,pow(y,.55));
        float s=max(dot(d,sunDir),0.);c+=sunCol*(pow(s,900.)*1.6+pow(s,14.)*.16);
        if(d.y>0.){vec2 uv=d.xz/(d.y+.1)*.9+vec2(time*.003,time*.001);float n=fbm(uv*1.4);float cl=smoothstep(.62-cover*.3,.86,n)*smoothstep(.0,.16,d.y);
          c=mix(c,vec3(.97,.98,1.)*mix(.9,1.03,fbm(uv*3.1))+sunCol*.03,cl*.88);}
        c=mix(c,haze,exp(-y*11.)*.8);if(d.y<0.)c=haze;
        gl_FragColor=vec4(c,1.);
        #include <colorspace_fragment>
      }`}));
  baySky.renderOrder=-10;baySky.frustumCulled=false;bayGroup.add(baySky);
  const BAY_WAVES=[[.08,.035,.62,.12],[-.05,.1,.8,.1],[.15,-.12,1.1,.04]];
  const bayWaveY=(x,z,t)=>{let y=0;for(const [kx,kz,w,a] of BAY_WAVES)y+=Math.sin(x*kx+z*kz+t*w)*a;return y};
  const baySea=new THREE.Mesh(new THREE.PlaneGeometry(3600,3600,170,170),new THREE.ShaderMaterial({uniforms:bayU,fog:false,toneMapped:false,
    vertexShader:`uniform float time;varying vec3 vL;
      void main(){vec4 w=modelMatrix*vec4(position.x,0.,-position.y,1.);vec3 p=vec3(w.x,0.,w.z-${BAY.z.toFixed(1)});
        p.y=sin(p.x*.08+p.z*.035+time*.62)*.12+sin(-p.x*.05+p.z*.1+time*.8)*.1+sin(p.x*.15-p.z*.12+time*1.1)*.04;
        vL=p;gl_Position=projectionMatrix*viewMatrix*vec4(w.x,p.y,w.z,1.);}`,
    fragmentShader:`uniform float time,fogD;uniform vec3 top,hor,haze,sunCol,sunDir,deep,shallow,camL;varying vec3 vL;
      void W(inout vec2 g,vec2 p,vec2 k,float w,float a){g+=k*a*cos(dot(p,k)+time*w);}
      void main(){vec2 p=vL.xz,g=vec2(0.);
        W(g,p,vec2(.08,.035),.62,.12);W(g,p,vec2(-.05,.1),.8,.1);W(g,p,vec2(.15,-.12),1.1,.04);
        W(g,p,vec2(1.1,.38),1.5,.024);W(g,p,vec2(-.52,.98),1.7,.02);W(g,p,vec2(1.9,-1.4),2.3,.008);W(g,p,vec2(-2.6,-2.),2.7,.006);W(g,p,vec2(.35,-3.9),3.1,.004);
        vec3 n=normalize(vec3(-g.x,1.,-g.y)),v=camL-vL;float dist=length(v);v/=dist;
        float fr=.03+.97*pow(1.-max(dot(n,v),0.),5.);
        vec3 r=reflect(-v,n);r.y=abs(r.y);
        vec3 sky=mix(hor,top,pow(clamp(r.y,0.,1.),.55));float s=max(dot(r,sunDir),0.);
        vec3 body=mix(deep,shallow,clamp(.55+n.y*.25-(1.-n.y)*5.,0.,1.));
        vec3 c=mix(body,sky,clamp(fr,0.,.62));
        c+=sunCol*(pow(s,320.)*1.2+pow(s,30.)*.08);
        c=mix(c,haze,1.-exp(-fogD*fogD*dist*dist));
        gl_FragColor=vec4(c,1.);
        #include <colorspace_fragment>
      }`}));
  baySea.frustumCulled=false;bayGroup.add(baySea);
  // ---- Đảo đá vôi: mỗi đảo dựng từ một hình trụ biến dạng (ngấn sóng ở chân, vách đứng, đỉnh tròn phủ cây) ----
  // ---- Chất liệu đá vôi và tán cây: vẽ bằng code (lặp liền mạch), kèm bản đồ lồi lõm để vách đá bắt sáng ----
  const bayTex=(()=>{
    // điện thoại (màn cảm ứng): vân đá 256 điểm ảnh, dựng nhanh gấp 4 lần lúc mở vịnh; máy tính giữ 512
    const S=(window.matchMedia&&matchMedia('(pointer:coarse)').matches)?256:512,rnd=(()=>{let s=7741;return()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296}})();
    // nhiễu giá trị lặp tuần hoàn: px,py theo ô, chu kỳ gx,gy ô
    const grid=(gx,gy)=>{const v=new Float32Array(gx*gy);for(let i=0;i<v.length;i++)v[i]=rnd();return(x,y)=>{const fx=x*gx,fy=y*gy,ix=Math.floor(fx),iy=Math.floor(fy),tx=fx-ix,ty=fy-iy,sx=tx*tx*(3-2*tx),sy=ty*ty*(3-2*ty),a=v[(iy%gy)*gx+ix%gx],b=v[(iy%gy)*gx+(ix+1)%gx],c=v[((iy+1)%gy)*gx+ix%gx],d=v[((iy+1)%gy)*gx+(ix+1)%gx];return a+(b-a)*sx+(c-a)*sy+(a-b-c+d)*sx*sy}};
    const fb=[grid(4,4),grid(8,8),grid(16,16),grid(32,32),grid(64,64)],fbm=(x,y)=>fb[0](x,y)*.42+fb[1](x,y)*.26+fb[2](x,y)*.16+fb[3](x,y)*.1+fb[4](x,y)*.06;
    const streakN=[grid(40,2),grid(96,4),grid(200,6)],ledgeN=[grid(3,14),grid(7,30)],stainN=grid(5,8),fine=grid(128,128);
    const H=new Float32Array(S*S),rock=document.createElement('canvas'),leaf=document.createElement('canvas');rock.width=rock.height=leaf.width=leaf.height=S;
    const rc=rock.getContext('2d'),ri=rc.createImageData(S,S),lc=leaf.getContext('2d'),li=lc.createImageData(S,S);
    const leafN=[grid(10,10),grid(24,24),grid(48,48)];
    for(let y=0;y<S;y++)for(let x=0;x<S;x++){const u=x/S,v=y/S,k=y*S+x;
      const base=fbm(u,v),st=streakN[0](u,v)*.5+streakN[1](u,v)*.32+streakN[2](u,v)*.18,ledge=ledgeN[0](u,v),fn=fine(u,v);
      const streak=Math.max(0,st-.46)*2.6,shelf=Math.max(0,1-Math.abs(ledgeN[1](u,v)-.5)*14)*(ledge>.55?1:0),stain=Math.max(0,stainN(u,v)-.58)*2.2;
      H[k]=base*.55+st*.5+fn*.12-shelf*.3;
      let r=200,g=198,b=188;const lum=.74+base*.3+fn*.1-streak*.36-shelf*.18;
      r=r*lum+stain*28;g=g*lum+stain*10;b=b*lum-stain*12;// vệt gỉ cam nhạt như đá vôi Hạ Long
      r+=-streak*6;ri.data[k*4]=Math.min(255,r);ri.data[k*4+1]=Math.min(255,g);ri.data[k*4+2]=Math.min(255,b);ri.data[k*4+3]=255;
      const l=leafN[0](u,v)*.5+leafN[1](u,v)*.32+leafN[2](u,v)*.18,clump=Math.pow(Math.max(0,l-.32)/.68,1.3);
      li.data[k*4]=48+clump*70;li.data[k*4+1]=82+clump*92;li.data[k*4+2]=44+clump*40;li.data[k*4+3]=255;}
    rc.putImageData(ri,0,0);lc.putImageData(li,0,0);
    // bản đồ pháp tuyến từ độ cao
    const nc=document.createElement('canvas');nc.width=nc.height=S;const nx=nc.getContext('2d'),ni=nx.createImageData(S,S),hAt=(x,y)=>H[((y+S)%S)*S+(x+S)%S];
    for(let y=0;y<S;y++)for(let x=0;x<S;x++){const dx=(hAt(x+1,y)-hAt(x-1,y))*5,dy=(hAt(x,y+1)-hAt(x,y-1))*5,l=Math.hypot(dx,dy,1),k=(y*S+x)*4;ni.data[k]=(-dx/l*.5+.5)*255;ni.data[k+1]=(dy/l*.5+.5)*255;ni.data[k+2]=(1/l*.5+.5)*255;ni.data[k+3]=255}
    nx.putImageData(ni,0,0);
    const mk=(cv,srgb)=>{const t=new THREE.CanvasTexture(cv);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=4;if(srgb)t.colorSpace=THREE.SRGBColorSpace;return t};
    return{rock:mk(rock,true),leaf:mk(leaf,true),normal:mk(nc,false)};
  })();
  const KT=(()=>{const g=new THREE.CylinderGeometry(1,1,1,22,16,false),p=g.attributes.position,uv=g.attributes.uv,n=p.count,a=new Float32Array(n),t=new Float32Array(n),ring=new Float32Array(n),u=new Float32Array(n);for(let i=0;i<n;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i);a[i]=Math.atan2(z,x);t[i]=y+.5;ring[i]=Math.hypot(x,z)>.01?1:0;u[i]=uv.getX(i)}const idx=Array.from(g.index.array);g.dispose();return{idx,a,t,ring,u,n}})();
  // ---- Nhìn xuyên vật cản: mảnh nằm giữa camera và người/tàu, trong ống bán kính R quanh đường nhìn, bị đục lưới thưa (mờ đi) ----
  SEE={cam:{value:new THREE.Vector3()},tgt:{value:new THREE.Vector3()},rad:{value:0},on:{value:0},onShip:{value:0}};
  function addSeeThrough(m,ship){const prev=m.onBeforeCompile;m.onBeforeCompile=(sh,r)=>{if(prev)prev(sh,r);sh.uniforms.seeCam=SEE.cam;sh.uniforms.seeTgt=SEE.tgt;sh.uniforms.seeRad=SEE.rad;sh.uniforms.seeOn=ship?SEE.onShip:SEE.on;
      sh.vertexShader='varying vec3 vSeeW;\n'+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvSeeW=(modelMatrix*vec4(transformed,1.)).xyz;');
      sh.fragmentShader='uniform vec3 seeCam,seeTgt;uniform float seeRad,seeOn;varying vec3 vSeeW;\n'+sh.fragmentShader.replace('void main() {','void main() {\n if(seeOn>.5){vec3 ab=seeTgt-seeCam;float t=dot(vSeeW-seeCam,ab)/max(dot(ab,ab),1e-4);if(t>.0&&t<.88){float d=length(vSeeW-(seeCam+ab*t)),R=seeRad*(1.-.55*t);if(d<R){float k=fract(sin(dot(floor(gl_FragCoord.xy),vec2(12.9898,78.233)))*43758.5453);if(k<.9*(1.-smoothstep(R*.6,R,d)))discard;}}}');};
    m.customProgramCacheKey=()=>'see'+(m.uuid);m.needsUpdate=true;return m}
  const bayRockMat=new THREE.MeshStandardMaterial({color:'#ffffff',roughness:.95,vertexColors:true,map:bayTex.rock,normalMap:bayTex.normal,normalScale:new THREE.Vector2(1.3,1.3)});
  bayRockMat.onBeforeCompile=sh=>{sh.uniforms.leafMap={value:bayTex.leaf};
    sh.vertexShader='attribute float aGreen;varying float vGreen;\n'+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvGreen=aGreen;');
    sh.fragmentShader='uniform sampler2D leafMap;varying float vGreen;\n'+sh.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\n{vec3 lf=texture2D(leafMap,vMapUv*1.7).rgb;float pch=(texture2D(leafMap,vMapUv*.23+.37).g-.2)*1.5;float g=smoothstep(.25,.7,vGreen+(lf.g-.2)*.8+pch*smoothstep(.0,.25,vGreen+.12));diffuseColor.rgb=mix(diffuseColor.rgb,lf*vec3(1.15,1.12,1.),g);}');};
  addSeeThrough(bayRockMat);
  const bayChunks=new Map();// "cx,cz" -> {P,I,T,D,H,S,UV,R}
  const bayExtraRocks=[];// mỏm đá phụ và vòng đảo quanh làng chài: [x,z,bán kính chặn] cho lưới dò đường
  const bayArchMeshes=[];
  // Tám dáng đảo đá vôi (khớp trường "shape" trong dữ liệu). Không dùng shadow map: chiều sâu đến từ hình khối,
  // khe gân đá sẫm, sọc tầng đá và ngấn hàm ếch được tô thẳng vào màu đỉnh.
  const KSHAPES=[
    {taper:.1,dome:.22,ribs:10,ribAmp:.15},                        // 0 tháp vách đứng, gân đá sắc
    {taper:.55,dome:.5,ribs:7,ribAmp:.1,rough:.24},                // 1 núi chóp nón (đầu chóp bo tròn)
    {taper:.08,dome:.85,round:true},                               // 2 đồi tròn thảm xanh
    {taper:.15,dome:.5,sx:1.9,sz:.8,saddle:.3,ribs:8,ribAmp:.09},  // 3 dãy núi yên ngựa dài
    {taper:.2,dome:.4,sx:1.5,sz:.9,saddle:.64,ribs:8,ribAmp:.1},   // 4 núi hai đỉnh tách rõ
    {taper:0,dome:.36,pinch:.5,bulge:.22,notch:.36,ribs:6},        // 5 hòn nấm thắt chân, hàm ếch sâu
    {taper:.4,dome:.45,sx:1.1,sz:.42,lean:.25,ribs:4},             // 6 mỏm đá / hòn buồm nghiêng
    {taper:.25,dome:.55,ribs:4,ribAmp:.08}                         // 7 hòn đá mồ côi sát sóng
  ];
  // opt.y0: khối nổi (đầu, mỏ, phiến đá) đặt từ độ cao y0, cao h; mặc định chân ngập từ -4.
  // opt.grooves: các rãnh ăn mòn ngang; opt.steps: vách giật cấp; opt.notch: độ sâu hàm ếch.
  function addKarst(x,z,r,h,k,opt={}){
    if(opt.shape!=null)opt={...KSHAPES[opt.shape],...opt};
    const key=Math.floor(x/900)+','+Math.floor(z/900);let ch=bayChunks.get(key);if(!ch){ch={P:[],I:[],T:[],D:[],H:[],S:[],UV:[],R:[]};bayChunks.set(key,ch)}
    const base=ch.P.length/3,ph=bayHash(k,1.7,3.1)*6.28,lean=opt.lean||0,pinch=opt.pinch??1,dome=opt.dome??(.16+bayHash(k,2,5)*.14),rot=opt.rot??bayHash(k,9,1)*6.28,cr=Math.cos(rot),sr=Math.sin(rot);
    const floating=opt.y0!=null,yb=floating?opt.y0:-4,total=floating?h:h+4;
    const sx=opt.sx||1,sz=(opt.sz||1)*(opt.squash||1),taper=opt.taper??.12,saddle=opt.saddle||0,tilt=opt.round?0:.05+bayHash(k,4,8)*.08;
    const rough=opt.rough??(opt.round?.1:.18),ribN=opt.round?0:(opt.ribs??5),ribA=opt.ribAmp??.12,notch=floating?0:(opt.notch??.26),steps=opt.steps||0;
    const reps=Math.max(1,Math.round(2*Math.PI*r*Math.max(sx,1)/44)),vo=bayHash(k,3,7)*4;
    for(let i=0;i<KT.n;i++){const t=KT.t[i],al=KT.a[i];
      let prof=opt.cone?Math.pow(Math.max(0,1-t*.92),.9):1-taper*t+(opt.round?0:.06*Math.sin(Math.PI*t));
      if(steps){const f=t*steps,fl=Math.floor(f);prof*=1-.18*(fl+baySm(.6,1,f-fl))/steps}
      if(t>1-dome){const u=(t-(1-dome))/dome;prof*=Math.pow(Math.max(0,1-u*u),.42)}
      if(!opt.round&&!floating)prof*=1+.1*Math.exp(-((t/.1)**2));// chân loe nhẹ ra mặt nước
      if(pinch!==1)prof*=pinch+(1-pinch)*baySm(.04,.6,t);
      if(opt.bulge)prof*=1+opt.bulge*Math.exp(-(((t-(opt.bulgeAt??.72))/.15)**2));
      const hN=(1-saddle*.5)/(1+tilt),hRaw=(1-saddle*Math.pow(Math.sin(al),2))*(1+tilt*Math.cos(al-ph))/(1+tilt),hf=KT.ring[i]?hN+(hRaw-hN)*Math.min(1,prof*1.6):hN;
      const lump=opt.round?0:baySm(.55,1,t)*(.08*Math.sin(al*2+ph*2.1)+.05*Math.sin(al*5+ph*.7)+.03*Math.sin(al*9+ph))*(KT.ring[i]?Math.min(1,prof*1.6):0);
      const wy=yb+t*total*(1-(1-hf)*baySm(.3,1,t))*(1+lump);
      // ngấn hàm ếch do sóng bào mòn sát mực nước (0..2,6) và các rãnh ăn mòn ngang
      if(notch)prof*=1-notch*baySm(-.25,.55,wy)*(1-baySm(1.9,2.7,wy));
      if(opt.grooves)for(const gy of opt.grooves)prof*=1-.3*Math.exp(-(((wy-gy)/.6)**2));
      // khe gân đá: đường lõm hẹp chạy dọc vách, sẫm màu
      let crev=0;if(ribN){const rs=Math.abs(Math.sin(al*ribN*.5+ph+Math.sin(t*3.1+ph)*.35));crev=Math.pow(1-rs,6)*baySm(.06,.25,t)*(1-baySm(1-dome-.05,1-dome+.1,t))}
      const crown=baySm(.55,1,t);
      // mặt đá bào mòn không đều: nhiều lớp gợn theo cả góc lẫn chiều cao, lệch pha từng đảo
      const nz=opt.round?1+.08*Math.sin(al*3+ph)+.05*Math.sin(al*5+t*4+ph):1+rough*(.75*Math.sin(al*2+ph+t*1.7)+.55*Math.sin(al*3+ph*1.9+t*3.3)+.35*Math.sin(al*5+ph*2.3+t*5.1)+.25*Math.sin(al*7-ph+t*7.3)+.3*(bayHash(al*5,t*9,k)-.5))+crown*(.09*Math.sin(al*2+ph*1.7)+.06*Math.sin(al*4-ph))-ribA*crev;
      const rr=r*prof*nz*KT.ring[i],px=Math.cos(al)*rr*sx+lean*t*t*total,pz=Math.sin(al)*rr*sz;
      ch.P.push(x+px*cr-pz*sr,wy,z+px*sr+pz*cr);ch.T.push(t);ch.D.push(opt.round?.15:1-dome);ch.H.push(bayHash(k+i*.37,t*7,al));ch.S.push(opt.round?1:0);ch.R.push(crev);
      ch.UV.push(KT.u[i]*reps,wy/44+vo);}
    for(const j of KT.idx)ch.I.push(base+j);
  }
  // Tô màu đá: đá vôi xám ngà, sọc tầng ngang, khe gân sẫm, ngấn nước ẩm; cây chỉ phủ mặt hướng lên,
  // vách hẫng (ny < -0,1) giữ đá trần.
  const rockTint=['#e9e8e2','#dfe0da','#ecebe4'].map(c=>new THREE.Color(c)),rockWet=new THREE.Color('#7d857a'),rockStrata=new THREE.Color('#a9a89c'),rockCrev=new THREE.Color('#5e6359'),rockNotch=new THREE.Color('#4f564f'),rockStreak=new THREE.Color('#585d58'),rockOchre=new THREE.Color('#b59a6e');
  function paintRock(c,wy,px,pz,hh,crev){
    c.copy(rockTint[Math.floor(hh*3)%3]);
    const s=.5+.5*Math.sin(wy*1.15+px*.011+pz*.015);c.lerp(rockStrata,baySm(.84,.98,s)*.32);
    c.lerp(rockCrev,Math.min(1,crev*1.1)*.6);
    c.lerp(rockWet,(1-baySm(2.4,3.6,wy))*.55);c.lerp(rockNotch,(1-baySm(.6,2.6,wy))*baySm(-.6,.2,wy)*.65);
  }
  function finishKarsts(){
    const c=new THREE.Color(),meshes=[];
    for(const ch of bayChunks.values()){
      const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(ch.P,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(ch.UV,2));g.setIndex(ch.I);g.computeVertexNormals();
      const N=g.attributes.normal,n=ch.T.length,col=new Float32Array(n*3),gr=new Float32Array(n);
      for(let i=0;i<n;i++){const t=ch.T[i],hh=ch.H[i],px=ch.P[i*3],wy=ch.P[i*3+1],pz=ch.P[i*3+2],ny=N.getY(i),crev=ch.R[i];
        paintRock(c,wy,px,pz,hh,crev);
        // vệt nước chảy dọc vách dựng: vệt sẫm đen xám và vệt vàng gỉ, dài từ mép rừng xuống, nhạt dần về chân
        const steep=1-baySm(.3,.7,Math.abs(ny)),u=px*.83+pz*.61,run=baySm(1.5,.25*ch.D[i]+.0,1-t+.35);
        const sd=baySm(.62,.92,.5+.5*Math.sin(u*1.7+Math.sin(u*.23)*3.1))*(.55+.45*Math.sin(u*.37+wy*.018)),so=baySm(.78,.96,.5+.5*Math.sin(u*2.9+1.7+Math.sin(u*.41)*2.3));
        c.lerp(rockStreak,sd*steep*baySm(4,14,wy)*.42);c.lerp(rockOchre,so*steep*baySm(6,18,wy)*.3*(.6+.4*run));
        // mảng cây bám vách và gờ đá (nhiều ở nửa trên)
        const tuft=baySm(.5,.8,.5+.5*Math.sin(px*.07+wy*.13+Math.sin(pz*.05)*2.)*Math.sin(pz*.08-wy*.09+Math.sin(px*.04)*1.7))*baySm(.25,.6,t);
        const green=ch.S[i]?1:Math.max(baySm(.3,.68,ny),baySm(ch.D[i]-.12,ch.D[i]+.04,t),(hh>.72&&t>.3)?.65:0,t>.3?.14:0,tuft*.9);
        gr[i]=green*baySm(-.1,.2,ny)*baySm(2.6,3.8,wy)*(1-crev*.85);
        col[i*3]=c.r;col[i*3+1]=c.g;col[i*3+2]=c.b}
      g.setAttribute('color',new THREE.BufferAttribute(col,3));g.setAttribute('aGreen',new THREE.BufferAttribute(gr,1));g.computeBoundingSphere();
      const m=new THREE.Mesh(g,bayRockMat);bayGroup.add(m);meshes.push(m);
    }
    bayChunks.clear();return meshes;
  }
  // Vòm đá xuyên thủy: khối đá có lỗ vòm, cửa vòm quay thẳng về hướng f (về phía tàu tiếp cận).
  function addCaveArch(cx,cz,f,W,H,ow,oh,depth){
    const s=new THREE.Shape();s.moveTo(-W/2,-6);s.lineTo(W/2,-6);s.lineTo(W/2*1.02,H*.62);s.quadraticCurveTo(W/2*.92,H,0,H*1.02);s.quadraticCurveTo(-W/2*.95,H,-W/2*1.04,H*.58);s.closePath();
    const hole=new THREE.Path();hole.moveTo(-ow/2,-5);hole.lineTo(ow/2,-5);hole.lineTo(ow/2,oh-ow/2);hole.absarc(0,oh-ow/2,ow/2,0,Math.PI,false);hole.lineTo(-ow/2,-5);s.holes.push(hole);
    const geo=new THREE.ExtrudeGeometry(s,{depth,bevelEnabled:true,bevelThickness:2.2,bevelSize:2.2,bevelSegments:3,steps:2,curveSegments:18});geo.translate(0,0,-depth/2);
    const p=geo.attributes.position,uv=geo.attributes.uv;for(let i=0;i<p.count;i++)uv.setXY(i,uv.getX(i)/44,uv.getY(i)/44);
    geo.computeVertexNormals();
    const N=geo.attributes.normal,col=new Float32Array(p.count*3),gr=new Float32Array(p.count),c=new THREE.Color();
    for(let i=0;i<p.count;i++){const y=p.getY(i),inner=Math.abs(p.getX(i))<ow/2+1.5&&y<oh+1;paintRock(c,y,p.getX(i)+cx,p.getZ(i)+cz,bayHash(i,2,3),inner?.55:0);if(inner)c.multiplyScalar(.72);
      col[i*3]=c.r;col[i*3+1]=c.g;col[i*3+2]=c.b;gr[i]=baySm(H*.7,H*.9,y)*baySm(-.1,.3,N.getY(i))+(N.getY(i)>.6?.6:0)*baySm(H*.4,H*.6,y)}
    geo.setAttribute('color',new THREE.BufferAttribute(col,3));geo.setAttribute('aGreen',new THREE.BufferAttribute(gr,1));
    const m=new THREE.Mesh(geo,bayRockMat);m.position.set(cx,0,cz);m.rotation.y=Math.PI/2-f;bayGroup.add(m);bayArchMeshes.push(m);return m;
  }
  // ---- Phông tranh toàn cảnh 360°: nhiều lớp núi đá xa chìm trong sương, phía bắc là đồi bờ Hạ Long ----
  function paintBackdrop(p,sunAz){
    const W=4096,Hh=1024,cv=document.createElement('canvas');cv.width=W;cv.height=Hh;const g=cv.getContext('2d');
    const R=p.radius||2200,top=p.top||420,bottom=-30,yPx=y=>(top-y)/(top-bottom)*Hh,base=yPx(0);
    let s=p.seed||1119;const rnd=()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296};
    const haze=new THREE.Color(p.haze||'#cfe0e6'),far=new THREE.Color(p.far_rock||'#a9bdbf'),near=new THREE.Color(p.near_rock||'#7f9a8c'),leaf=new THREE.Color(p.leaf||'#6f8f62'),warm=new THREE.Color('#f3dcc0');
    const css=c=>'#'+c.getHexString(),mixC=(a,b,t)=>a.clone().lerp(b,t);
    const azOf=x=>x/W*Math.PI*2,north=x=>{const d=Math.atan2(Math.sin(azOf(x)-Math.PI),Math.cos(azOf(x)-Math.PI));return Math.abs(d)<(p.north_span||.75)};
    const sunNear=x=>{const d=Math.atan2(Math.sin(azOf(x)-sunAz),Math.cos(azOf(x)-sunAz));return Math.max(0,1-Math.abs(d)/1.1)};
    const angle=(y,dist)=>yPx(Math.tan(Math.atan2(y,dist))*R);// độ cao biểu kiến khi đặt núi ở khoảng cách dist
    const layers=p.layers||[{dist:5200,count:110,h:[70,170],w:[160,520]},{dist:4200,count:90,h:[80,190],w:[150,480]},{dist:3400,count:70,h:[90,210],w:[130,420]},{dist:2800,count:50,h:[100,220],w:[110,360]}];
    const island=(cx,w,hTop,col,colTop,dist,mist)=>{const kind=rnd();// tháp · chóp · đồi · dãy
      if(kind<.28){w*=.38;hTop=base-(base-hTop)*1.35}else if(kind<.5){w*=.75;hTop=base-(base-hTop)*1.15}else if(kind<.7){hTop=base-(base-hTop)*.55;w*=1.1}
      const prof=[];if(kind<.28)prof.push([.18,.12],[.38,.01],[.62,0],[.82,.1]);else if(kind<.5)prof.push([.22,.2],[.42,.03],[.6,0],[.78,.16]);else if(kind<.7)prof.push([.2,.3],[.5,0],[.8,.3]);else{const n=2+Math.floor(rnd()*3);for(let b=0;b<=n;b++)prof.push([.12+.76*b/n,(b%2?.28:0)+rnd()*.18])}
      for(const off of [-W,0,W]){const x0=cx+off-w/2,x1=cx+off+w/2;if(x1<0||x0>W)continue;
      const pts=prof.map(([u,d])=>[x0+w*u,hTop+d*(base-hTop)]);
      g.beginPath();g.moveTo(x0-w*.04,base+2);g.bezierCurveTo(x0+w*.02,base-(base-hTop)*.4,x0-w*.03,pts[0][1]+(base-hTop)*.25,pts[0][0],pts[0][1]);
      for(let b=1;b<pts.length;b++){const [px,py]=pts[b-1],[qx,qy]=pts[b];g.quadraticCurveTo((px+qx)/2,Math.min(py,qy)-(base-hTop)*.08,qx,qy)}
      g.bezierCurveTo(x1+w*.03,pts[pts.length-1][1]+(base-hTop)*.25,x1-w*.02,base-(base-hTop)*.4,x1+w*.04,base+2);g.closePath();
      const gr=g.createLinearGradient(0,hTop,0,base);gr.addColorStop(0,css(colTop));gr.addColorStop(.35,css(col));gr.addColorStop(1,css(mixC(col,haze,mist)));g.fillStyle=gr;g.fill();
      g.save();g.clip();g.globalAlpha=.16;for(let k=0;k<w/5;k++){const sx=x0+rnd()*w;g.fillStyle=rnd()<.5?css(mixC(col,new THREE.Color('#ffffff'),.35)):css(mixC(col,new THREE.Color('#41504a'),.35));g.fillRect(sx,hTop+rnd()*(base-hTop)*.4,1+rnd()*2.5,(base-hTop)*(.25+rnd()*.6))}g.restore();g.globalAlpha=1}};
    layers.forEach((L,li)=>{const t=li/(layers.length-1||1),col=mixC(far,near,t).lerp(haze,.45-.3*t),colTop=mixC(col,leaf,.25+.35*t);
      for(let k=0;k<L.count;k++){const cx=rnd()*W;if(north(cx))continue;const w=(L.w[0]+rnd()*(L.w[1]-L.w[0]))/L.dist*W/(2*Math.PI),hTop=angle(L.h[0]+rnd()*(L.h[1]-L.h[0]),L.dist);const sw=sunNear(cx)*.35;
        island(cx,w,hTop,mixC(col,warm,sw),mixC(colTop,warm,sw*.6),L.dist,.8-.3*t)}
      // dải sương sau mỗi lớp
      const mg=g.createLinearGradient(0,base-90+li*8,0,base);mg.addColorStop(0,css(haze)+'00');mg.addColorStop(1,css(haze)+'a0');g.fillStyle=mg;g.fillRect(0,base-90+li*8,W,90-li*8);});
    // đồi bờ bắc (Bãi Cháy · Hòn Gai): dải đồi thấp, thoải, nhiều cây
    {const c1=mixC(near,haze,.45),c2=mixC(leaf,haze,.35);for(let pass=0;pass<2;pass++){g.beginPath();let first=true;for(let x=0;x<=W;x+=8){if(!north(x)&&!north(x-8)){if(!first){g.lineTo(x,base+2);g.closePath();g.fillStyle=css(pass?c2:c1);g.fill();g.beginPath();first=true}continue}
        const az=azOf(x),hh=angle((pass?55:90)+Math.sin(az*9+pass)*25+Math.sin(az*23)*10,pass?1800:2600);if(first){g.moveTo(x,base+2);first=false}g.lineTo(x,hh)}
      if(!first){g.lineTo(W,base+2);g.closePath();g.fillStyle=css(pass?c2:c1);g.fill()}}}
    const hg=g.createLinearGradient(0,base-40,0,Hh);hg.addColorStop(0,css(haze)+'00');hg.addColorStop(.25,css(haze)+'ff');hg.addColorStop(1,css(haze)+'ff');g.fillStyle=hg;g.fillRect(0,base-40,W,Hh-base+40);
    const tex=new THREE.CanvasTexture(cv);tex.colorSpace=THREE.SRGBColorSpace;tex.wrapS=THREE.RepeatWrapping;tex.anisotropy=4;
    const m=new THREE.Mesh(new THREE.CylinderGeometry(R,R,top-bottom,96,1,true),new THREE.MeshBasicMaterial({map:tex,transparent:true,depthWrite:false,fog:false,toneMapped:false,side:THREE.BackSide}));
    m.position.y=(top+bottom)/2;m.renderOrder=-9;m.frustumCulled=false;return m;
  }
  let bayBackdrop=null;
  // ---- Du thuyền 5 sao: thân xanh ngọc, ba tầng trắng có dải kính, boong mũi gỗ, lan can kính ----
  bayMult=()=>bayShip.mult||1;
  function setBayMult(N){const M=bayMult();if(N===M)return;
    // đang dừng ngắm trong tour: phần thời gian còn lại co/giãn theo tốc độ mới
    if(typeof bayTour!=='undefined'&&bayTour&&bayTour.dwellUntil){const now=performance.now();bayTour.dwellUntil=now+Math.max(0,bayTour.dwellUntil-now)*M/N}
    bayShip.mult=N;bayShip.fast=N>1;bayStatusKey='';refreshOpts();refreshBayHud()}
  bayPause=null,bayAt=null;// bayAt: danh thắng tàu vừa tới / đang tới {p,x,z}
  bayShip={group:new THREE.Group(),x:0,z:0,heading:0,speed:0,path:[],dest:null,fast:false,stopped:true,trail:[],trailT:0};
  // Mũi tàu (đầu nhọn của thân, cách tâm gần nửa chiều dài): điểm dẫn đường khi tàu chạy và điểm chạm đầu cầu tàu khi cập đảo
  const shipBowLen=S=>(S.len||46)*.5-1,shipBow=S=>{const L=shipBowLen(S);return [S.x+Math.sin(S.heading)*L,S.z+Math.cos(S.heading)*L]};
  // Ván sàn: dải ván 0,25 đơn vị chạy dọc thân tàu, mạch ghép so le, vân màu nâu óc chó ấm
  function deckPlankTex(base){const c=document.createElement('canvas');c.width=256;c.height=512;const x=c.getContext('2d'),col=new THREE.Color(base);
    for(let i=0;i<8;i++){const off=(i*197)%512;for(let seg=-1;seg<2;seg++){const y0=off+seg*512,k=.9+((i*37+seg*11)%7)/30,cc=col.clone().multiplyScalar(k);x.fillStyle='#'+cc.getHexString();x.fillRect(i*32,y0,32,512);
        x.strokeStyle='rgba(0,0,0,.08)';for(let g=0;g<5;g++){x.beginPath();x.moveTo(i*32+4+g*6,y0);x.lineTo(i*32+4+g*6+((g%2)?2:-2),y0+512);x.stroke()}
        x.fillStyle='rgba(20,12,8,.55)';x.fillRect(i*32,y0,32,2)}
      x.fillStyle='rgba(20,12,8,.6)';x.fillRect(i*32,0,1.6,512)}
    const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(.5,1/6);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;return t}
  function buildShip(ex){
    const g=bayShip.group,L=ex.length/2,B=ex.beam/2,mat=(c,o={})=>new THREE.MeshStandardMaterial({color:c,roughness:.6,...o});
    const outline=(inset,front=L,back=-L)=>{const s=new THREE.Shape(),b=B-inset,f=front-inset,k=back+inset;s.moveTo(-b,-(k+2));s.quadraticCurveTo(-b,-k,0,-k);s.quadraticCurveTo(b,-k,b,-(k+2));s.lineTo(b,-(f-12));s.quadraticCurveTo(b*.95,-(f-3),0,-f);s.quadraticCurveTo(-b*.95,-(f-3),-b,-(f-12));s.closePath();return s};
    const slab=(shape,y,h,m)=>{const geo=new THREE.ExtrudeGeometry(shape,{depth:h,bevelEnabled:false,curveSegments:14});geo.rotateX(-Math.PI/2);const mesh=new THREE.Mesh(geo,m);mesh.position.y=y;g.add(mesh);return mesh};
    const hull=mat(ex.hull_color||'#2f8c8a',{roughness:.45}),white=mat(ex.body_color||'#f4f2ec',{roughness:.5}),glass=mat(ex.glass||'#3f5f6c',{roughness:.12,metalness:.25,color:new THREE.Color(ex.glass||'#3f5f6c').lerp(new THREE.Color('#9fc4cf'),.35)}),wood=mat('#ffffff',{roughness:.72,map:deckPlankTex(ex.deck_wood||'#a07e60')}),dark=mat('#25363c'),woodMain=wood.clone(),whiteSolid=white.clone();addSeeThrough(white,1);addSeeThrough(glass,1);addSeeThrough(dark,1);addSeeThrough(wood,1);addSeeThrough(hull,1);
    slab(outline(0),-2.6,3.8,hull);slab(outline(-.05),1.15,1.4,whiteSolid);slab(outline(.25),2.5,.12,woodMain);
    const stripe=slab(outline(-.07),1.05,.14,dark);stripe.scale.set(1,1,1);
    // dải cửa sổ tròn ở thân
    for(let z=-L+5;z<L-12;z+=2.6)for(const sx of [-1,1]){const p=new THREE.Mesh(new THREE.CircleGeometry(.28,10),dark);p.position.set(sx*(B+.02),.2,z);p.rotation.y=sx*Math.PI/2;g.add(p)}
    // ba tầng thượng tầng
    const railSets=[];
    const decks=[[0,-L+2.5,L-14,4.7],[1,-L+2.5,L-17.5,4.5],[2,-L+5,L-23,4.2]];
    decks.forEach(([i,back,front,b])=>{const y=2.62+i*2.85;const sh=(w)=>{const s=new THREE.Shape();s.moveTo(-w,-back);s.lineTo(w,-back);s.lineTo(w,-(front-w));s.absarc(0,-(front-w),w,0,Math.PI,true);s.lineTo(-w,-back);return s};
      slab(sh(b+.35),y-.1,.32,white);slab(sh(b-.06),y+.22,.55,white);const gl=slab(sh(b-.12),y+.77,1.55,glass);slab(sh(b+.42),y+2.32,.42,white);slab(sh(b+.3),y+2.74,.03,wood);// mái mỗi tầng là sân gỗ của tầng trên
      const nextFront=i<2?decks[i+1][2]:-1e9,ring=sh(b+.1).getPoints(10).map(p=>new THREE.Vector3(p.x,0,-p.y));
      railSets.push({pts:i===2?ring.filter(p=>p.z>-L+3.2):ring.filter(p=>p.z>nextFront-.6),y0:y+2.77})
      for(let z=back+1.5;z<front-b;z+=3.2)for(const sx of [-1,1]){const pillar=new THREE.Mesh(new THREE.BoxGeometry(.32,2.1,.42),white);pillar.position.set(sx*(b-.02),y+1.27,z);g.add(pillar)}
      if(i===0){const rail=new THREE.Mesh(new THREE.BoxGeometry(.08,.9,front-back),white);}});
    // boong thượng: hồ bơi, ghế nằm, cột anten
    const topY=2.62+2*2.85+2.74;const pool=new THREE.Mesh(new THREE.BoxGeometry(5.5,.12,4),mat('#5cc6d6',{roughness:.2}));pool.position.set(0,topY+.08,-L+12);g.add(pool);
    for(let k=0;k<4;k++){const ch=new THREE.Mesh(new THREE.BoxGeometry(.8,.25,2),white);ch.position.set(-3+k*2,topY+.15,-L+7.5);ch.rotation.x=-.12;g.add(ch)}
    const arch=new THREE.Mesh(new THREE.TorusGeometry(2.2,.2,8,20,Math.PI),white);arch.position.set(0,topY,-L+5.5);arch.rotation.y=Math.PI/2;g.add(arch);
    const awning=new THREE.Mesh(new THREE.BoxGeometry(7,.18,4.5),white);awning.position.set(0,topY+2.4,-L+9.5);g.add(awning);
    for(const sx of [-3.2,3.2])for(const sz of [-L+7.7,-L+11.3]){const p=new THREE.Mesh(new THREE.CylinderGeometry(.08,.08,2.4,6),white);p.position.set(sx,topY+1.2,sz);g.add(p)}
    // lan can kính và tay vịn quanh mũi tàu
    const railPts=[],rw=B-.35,fz=L-.6,bz=L-14;const bez=t=>{const p0=[rw,fz-12],p1=[rw*.95,fz-3],p2=[0,fz];return[(1-t)**2*p0[0]+2*(1-t)*t*p1[0]+t*t*p2[0],(1-t)**2*p0[1]+2*(1-t)*t*p1[1]+t*t*p2[1]]};
    const half=[[rw,bz],[rw,(bz+fz-12)/2]];for(let k=0;k<=10;k++)half.push(bez(k/10*.94));
    for(const [x,z] of half)railPts.push(new THREE.Vector3(-x,3.55,z));for(let k=half.length-1;k>=0;k--)railPts.push(new THREE.Vector3(half[k][0],3.55,half[k][1]));
    const steel=mat('#e3e6e8',{metalness:.8,roughness:.22}),cap=mat(ex.rail_wood||'#9a6448',{roughness:.45}),// lan can luôn giữ nguyên, không làm mờ
    curve=new THREE.CatmullRomCurve3(railPts);
    const handrail=new THREE.Mesh(new THREE.TubeGeometry(curve,80,.085,8,false),cap);handrail.scale.set(1,1,1);g.add(handrail);
    {const low=railPts.map(p=>new THREE.Vector3(p.x,2.66,p.z));g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(low),80,.035,6,false),steel))}
    {const pos=[],idx=[],cp=curve.getSpacedPoints(80);cp.forEach((p,i)=>{pos.push(p.x,2.62,p.z,p.x,3.47,p.z);if(i){const a=(i-1)*2;idx.push(a,a+1,a+2,a+1,a+3,a+2)}});const gg=new THREE.BufferGeometry();gg.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));gg.setIndex(idx);gg.computeVertexNormals();
     g.add(new THREE.Mesh(gg,new THREE.MeshStandardMaterial({color:'#d6f0f2',transparent:true,opacity:.16,metalness:.1,side:THREE.DoubleSide,depthWrite:false,roughness:.05})));
     // mép kính hơi xanh như kính cường lực
     const edge=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(cp.map(p=>new THREE.Vector3(p.x,3.45,p.z))),80,.02,4,false),new THREE.MeshStandardMaterial({color:'#9fd3d6',transparent:true,opacity:.6,roughness:.1}));g.add(edge)}
    {const cp=curve.getSpacedPoints(26);for(const p of cp){const post=new THREE.Mesh(new THREE.CylinderGeometry(.035,.035,.92,8),steel);post.position.set(p.x,3.06,p.z);g.add(post);
      const clip=new THREE.Mesh(new THREE.BoxGeometry(.12,.06,.12),steel);clip.position.set(p.x,3.48,p.z);g.add(clip)}}
    // lan can kính + tay vịn gỗ quanh boong thượng (chừa lối cầu thang phía sau)
    for(const {pts,y0} of railSets){if(pts.length<3)continue;const cz=pts.reduce((s,p)=>s+p.z,0)/pts.length-3;pts.sort((a,b)=>Math.atan2(a.x,a.z-cz)-Math.atan2(b.x,b.z-cz));
      const cv=new THREE.CatmullRomCurve3(pts.map(p=>new THREE.Vector3(p.x,y0+.95,p.z))),cp=cv.getSpacedPoints(70);
      g.add(new THREE.Mesh(new THREE.TubeGeometry(cv,90,.075,8,false),cap));
      const pos=[],idx=[];cp.forEach((p,i)=>{pos.push(p.x,y0,p.z,p.x,y0+.9,p.z);if(i){const a=(i-1)*2;idx.push(a,a+1,a+2,a+1,a+3,a+2)}});const gg=new THREE.BufferGeometry();gg.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));gg.setIndex(idx);gg.computeVertexNormals();
      g.add(new THREE.Mesh(gg,new THREE.MeshStandardMaterial({color:'#d6f0f2',transparent:true,opacity:.16,side:THREE.DoubleSide,depthWrite:false,roughness:.05})));
      for(const p of cv.getSpacedPoints(Math.max(8,Math.round(cv.getLength()/1.1)))){const post=new THREE.Mesh(new THREE.CylinderGeometry(.035,.035,.95,8),steel);post.position.set(p.x,y0+.47,p.z);g.add(post)}}
    // bọt sóng ở mũi
    const foam=new THREE.Mesh(new THREE.RingGeometry(3.5,5.2,24,1,Math.PI*.15,Math.PI*.7),new THREE.MeshBasicMaterial({color:'#ffffff',transparent:true,opacity:0,depthWrite:false,side:THREE.DoubleSide}));foam.rotation.x=-Math.PI/2;foam.position.set(0,.25,L-3.2);g.add(foam);bayShip.foam=foam;
    bayShip.bow=new THREE.Vector3(...(ex.bow_spot||[0,2.62,18.8]));bayShip.deck=new THREE.Vector3(...(ex.deck_spot||[0,11.06,-3.2]));bayShip.ex=ex;bayShip.max=ex.max_speed||10;bayShip.turn=ex.turn_rate||.45;bayShip.clear=ex.clearance||26;bayShip.len=ex.length;
    bayGroup.add(g);
  }
  // ---- Vệt sóng sau tàu (ribbon trong suốt, mờ dần theo thời gian) ----
  const bayWake=new THREE.Mesh(new THREE.BufferGeometry(),new THREE.MeshBasicMaterial({vertexColors:true,transparent:true,depthWrite:false,side:THREE.DoubleSide}));bayWake.frustumCulled=false;bayGroup.add(bayWake);
  const WAKE_N=70;
  function updateWake(t){
    const pts=bayShip.trail,pos=[],col=[],idx=[];
    const strip=(off,w0,grow,alpha)=>{let base=pos.length/3;for(let i=0;i<pts.length;i++){const p=pts[i],age=(t-p.t),fade=Math.max(0,1-age/14)*p.s*alpha;const rx=Math.cos(p.h),rz=-Math.sin(p.h);const o=off===0?0:Math.sign(off)*(Math.abs(off)+age*2.4),w=w0+age*grow;
      for(const e of [-.5,.5]){pos.push(p.x+rx*(o+e*w),.18,p.z+rz*(o+e*w));col.push(1,1,1,fade*(off===0?1:.9))}
      if(i){const a=base+(i-1)*2;idx.push(a,a+1,a+2,a+1,a+3,a+2)}}};
    if(pts.length>1){strip(-4.6,1.1,.35,.55);strip(4.6,1.1,.35,.55);strip(0,7,.9,.32)}
    const g=bayWake.geometry;g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(col,4));g.setIndex(idx);
  }
  // ---- Bờ đất, danh thắng, làng chài, cầu, thuyền gỗ, phao ----
  const bayPick=[];const bayJunks=[];const bayBuoys=[];let bayKarstMeshes=[];const bayLand=[];
  function makeJunk(hullColor){const g=new THREE.Group(),m=c=>new THREE.MeshStandardMaterial({color:c,roughness:.85});
    const hull=new THREE.Mesh(new THREE.BoxGeometry(2.6,1.2,9),m(hullColor||'#7d5a3d'));hull.position.y=.3;g.add(hull);
    const bow=new THREE.Mesh(new THREE.ConeGeometry(1.3,2.6,4),m(hullColor||'#7d5a3d'));bow.rotation.set(Math.PI/2,0,Math.PI/4);bow.scale.set(1,1,.45);bow.position.set(0,.45,5.6);g.add(bow);
    const cab=new THREE.Mesh(new THREE.BoxGeometry(2.3,1.3,4.2),m('#a27e58'));cab.position.set(0,1.55,-1.2);g.add(cab);
    const roof=new THREE.Mesh(new THREE.BoxGeometry(2.7,.15,4.8),m('#5c4130'));roof.position.set(0,2.25,-1.2);g.add(roof);
    const mast=new THREE.Mesh(new THREE.CylinderGeometry(.06,.07,5,6),m('#4a3424'));mast.position.set(0,3.4,1.6);g.add(mast);
    const sail=new THREE.Mesh(new THREE.PlaneGeometry(2.4,3),new THREE.MeshStandardMaterial({color:'#b98b62',side:THREE.DoubleSide,roughness:.9}));sail.position.set(.06,3.5,1);sail.rotation.y=Math.PI/2;g.add(sail);
    return g}
  // ---- Điêu khắc các danh thắng có tên ----
  function villageRocks(p){const x=p.x,z=p.z,k=Math.round(x*7+z*3),f=lmFacing(p),sh=[0,1,4,3,5,6,0,1],out=[];
    for(let j=0;j<8;j++){const a=f+.9+j*(2*Math.PI-1.8)/7,d=160+bayHash(k,j,5)*30,rr=20+bayHash(k,j,1)*12,s=sh[j],er=rr*(s===3?1.9:s===4?1.5:1),qx=x+Math.cos(a)*d,qz=z+Math.sin(a)*d;
      if(!clearOfChannels(qx,qz,er*1.3+30))continue;out.push([qx,qz,rr,rr*(2.2+bayHash(k,j,2)*1.2),k+j,s,er*1.25])}return out}
  // 1–2 mỏm đá phụ ven mép nước ở các đảo lớn, chỉ đặt khi nằm ngoài luồng tàu
  function fieldExtras(i,x,z,r,h,v){const out=[];if(v===7||r<32)return out;const er=r*(v===3?1.5:v===4?1.3:1),cnt=1+(r>=44&&bayHash(i,5,9)>.4?1:0);
    for(let j=0;j<cnt;j++){const a=bayHash(i,j,13)*6.28,d=er*(1.1+bayHash(i,j,17)*.22),sr=r*(.12+bayHash(i,j,19)*.08),sh=Math.min(h*.35,sr*(1.6+bayHash(i,j,23)*1.6))+2,qx=x+Math.cos(a)*d,qz=z+Math.sin(a)*d;
      if(!clearOfChannels(qx,qz,sr*1.3+30))continue;out.push([qx,qz,sr,sh,i*31+j,bayHash(i,j,29)>.5?7:6,a])}return out}
  const lmFacing=p=>{const [ax,az]=p.params?.approach||[p.x+60,p.z];return Math.atan2(az-p.z,ax-p.x)};// hướng từ danh thắng ra điểm tàu ghé
  const darkMat=new THREE.MeshBasicMaterial({color:'#1a221f'}),pineMat=new THREE.MeshStandardMaterial({color:'#3d6b46',roughness:1,flatShading:true}),pineDark=new THREE.MeshStandardMaterial({color:'#2f5839',roughness:1,flatShading:true});
  const chanLines=()=>{const c=bayData?.nature?.find(n=>n.kind==='channels');return c?{hw:c.params.half_width,lines:c.params.lines}:{hw:0,lines:[]}};
  function clearOfChannels(x,z,pad){const {hw,lines}=chanLines();for(const L of lines)for(let i=0;i<L.length-1;i++){const [ax,az]=L[i],[bx,bz]=L[i+1],vx=bx-ax,vz=bz-az,l2=vx*vx+vz*vz||1,t=Math.max(0,Math.min(1,((x-ax)*vx+(z-az)*vz)/l2));if(Math.hypot(ax+vx*t-x,az+vz*t-z)<hw+pad)return false}return true}
  function caveMouth(x,z,f,dist,y,w,hgt){const m=new THREE.Mesh(new THREE.SphereGeometry(1,20,14),darkMat);m.scale.set(w,hgt,Math.max(3,w*.45));m.position.set(x+Math.cos(f)*dist,y,z+Math.sin(f)*dist);m.rotation.y=Math.PI/2-f;bayGroup.add(m)}
  function pines(cx,cy,cz,rot,ax,az,n,k){for(let j=0;j<n;j++){const u=(bayHash(k,j,1)-.5)*2*ax,v=(bayHash(k,j,2)-.5)*2*az;if((u/ax)**2+(v/az)**2>1)continue;const s=.8+bayHash(k,j,3)*.7,c=new THREE.Mesh(new THREE.ConeGeometry(1.1*s,3.2*s,7),j%2?pineMat:pineDark);
    c.position.set(cx+u*Math.cos(rot)-v*Math.sin(rot),cy+1.3*s,cz+u*Math.sin(rot)+v*Math.cos(rot));bayGroup.add(c)}}
  const DECO={};const decoMat=c=>DECO[c]||(DECO[c]=new THREE.MeshStandardMaterial({color:c,roughness:.85}));
  const decoBox=(g,w,hh,d,c,px,py,pz,ry=0)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,hh,d),decoMat(c));m.position.set(px,py,pz);m.rotation.y=ry;g.add(m);return m};
  // Ô dù bãi tắm: cán trắng + tán nón màu
  function addUmbrellas(x,z,f,r,n,k){const cols=['#d9583f','#2f7fb5','#f2c14e','#e9e4d8','#3f9a7a'];for(let j=0;j<n;j++){const a=f+(j-(n-1)/2)*(.62/n)*1.6,d=r*(.86+bayHash(k,j,8)*.12),g=new THREE.Group();g.position.set(x+Math.cos(a)*d,.3,z+Math.sin(a)*d);
    const pole=new THREE.Mesh(new THREE.CylinderGeometry(.07,.07,2.6,5),decoMat('#f1ece2'));pole.position.y=1.3;g.add(pole);const top=new THREE.Mesh(new THREE.ConeGeometry(1.5,.7,8),decoMat(cols[(j+k)%5]));top.position.y=2.7;g.add(top);bayGroup.add(g)}}
  // Hàng phi lao / cây ven bãi: nón xanh sẫm
  function addBeachTrees(x,z,f,r,n,k,span=.7){for(let j=0;j<n;j++){const a=f+(j/(n-1)-.5)*span*Math.PI,d=r*(.66+bayHash(k,j,9)*.06),hh=5+bayHash(k,j,7)*4,t=new THREE.Mesh(new THREE.ConeGeometry(1.4+bayHash(k,j,6),hh,6),decoMat(j%3?'#2f5e3a':'#3d6b40'));t.position.set(x+Math.cos(a)*d,hh/2+.6,z+Math.sin(a)*d);bayGroup.add(t)}}
  // Ki-ốt / nhà gỗ ven bãi
  function addKiosks(x,z,f,r,n,k){for(let j=0;j<n;j++){const a=f+(j-(n-1)/2)*.16,d=r*.74,g=new THREE.Group();g.position.set(x+Math.cos(a)*d,.3,z+Math.sin(a)*d);g.rotation.y=-a+Math.PI/2;
    decoBox(g,4.2,2.4,3,'#f3efe6',0,1.2,0);decoBox(g,4.8,.25,3.8,j%2?'#2f7fb5':'#c4553c',0,2.55,.2);bayGroup.add(g)}}
  // Thuyền thúng / xuồng gỗ nhỏ và đò mui đen (ảnh làng chài Cửa Vạn)
  function makeSampan(canopy){const g=new THREE.Group();const hull=new THREE.Mesh(new THREE.CylinderGeometry(1.5,1.1,9,10,1,false,0,Math.PI),decoMat('#6f4f36'));hull.rotation.set(0,0,Math.PI/2);hull.rotation.order='ZXY';hull.rotation.x=Math.PI/2;hull.scale.set(1,1,.6);hull.position.y=.5;g.add(hull);
    decoBox(g,.3,.9,9.2,'#b7412f',1.45,.9,0);if(canopy){const c=new THREE.Mesh(new THREE.CylinderGeometry(1.6,1.6,4.6,12,1,true,-Math.PI/2,Math.PI),decoMat('#2b2b2b'));c.rotation.x=Math.PI/2;c.position.set(0,1.1,-.6);g.add(c)}return g}
  function buildLandmark(p){
    const q=p.params||{},x=p.x,z=p.z,r=q.radius||0,h=q.height||0,k=Math.round(x*7+z*3),f=lmFacing(p),fx=Math.cos(f),fz=Math.sin(f);
    if(q.shape==='big_island'){
      // đỉnh chính vách dựng, 8 hòn phụ đa hình thái quây phía sau, cửa hang tối mở về phía tàu
      addKarst(x,z,r*.45,h*1.15,k,{taper:.1,dome:.26,ribs:11,ribAmp:.13});
      const sh=[0,4,1,3,5,0,6,2];for(let j=0;j<8;j++){const a=f+.55+j*(2*Math.PI-1.1)/7+(bayHash(k,j,4)-.5)*.2,d=r*(.5+bayHash(k,j,3)*.28);
        addKarst(x+Math.cos(a)*d,z+Math.sin(a)*d,r*(.17+bayHash(k,j,1)*.15),h*(.45+bayHash(k,j,2)*.55),k+j+1,{shape:sh[j]})}
      caveMouth(x,z,f,r*.43,h*.2,r*.15,r*.1);
    }
    else if(q.shape==='pair'){
      // 3.42 Hòn Trống Mái (to gấp đôi): hai khối đá đứng sát nhau trên một rạn đá thấp, chân bị sóng khoét thắt nhỏ,
      // thân nở dần lên trên như ức gà, phần trên cong vào nhau, hai "đầu" chụm sát như đôi gà đang tựa mỏ; Trống cao và to hơn Mái
      const A=.78,ux=Math.cos(A),uz=Math.sin(A),sep=r*.6;
      addKarst(x,z,r*.92,.25,k,{round:true,sx:1.55,sz:.72,rot:A,notch:0});
      // Trống
      const tx=x-ux*sep,tz=z-uz*sep;
      addKarst(tx,tz,r*.4,h,k+1,{taper:-.22,pinch:.3,dome:.3,lean:.15,rot:A,ribs:5,ribAmp:.1,bulge:.16,bulgeAt:.68,sz:.8,rough:.2,notch:.34});
      addKarst(tx+ux*r*.3,tz+uz*r*.3,r*.24,h*.17,k+3,{y0:h*.84,taper:.1,dome:.7,rot:A,lean:.1,sz:.78,rough:.14,ribs:0});/* đầu Trống: cao, chúi về phía Mái */
      // Mái
      const mx=x+ux*sep,mz=z+uz*sep;
      addKarst(mx,mz,r*.36,h*.82,k+2,{taper:-.2,pinch:.32,dome:.34,lean:.14,rot:A+Math.PI,ribs:4,ribAmp:.08,bulge:.2,bulgeAt:.66,sz:.84,rough:.2,notch:.34});
      addKarst(mx-ux*r*.26,mz-uz*r*.26,r*.21,h*.14,k+4,{y0:h*.69,taper:.1,dome:.72,rot:A+Math.PI,lean:.08,sz:.8,rough:.14,ribs:0});/* đầu Mái: thấp hơn, tựa vào Trống */
    }
    else if(q.shape==='incense'){
      // Hòn Đỉnh Hương: một khối liền, chân bị sóng khoét thắt lại, thân nở dần lên đỉnh rộng và bằng, phủ cây bụi
      const rot=f+Math.PI/2;
      addKarst(x,z,r*.58,h,k,{taper:-.15,pinch:.42,dome:.2,sx:1.45,sz:.72,rot,ribs:6,ribAmp:.1,notch:.3,grooves:[h*.22],bulge:.12,bulgeAt:.8,rough:.22});
    }
    else if(q.shape==='dog'){
      // Hòn Chó Đá: cụm đá tự nhiên, khối cao phía trước tựa vào khối thấp phía sau, gợi dáng chó ngồi khi nhìn từ luồng tàu
      addKarst(x-fx*r*.3,z-fz*r*.3,r*.62,h*.5,k,{taper:.1,dome:.55,sx:1.15,rot:f,ribs:5,rough:.22});
      addKarst(x+fx*r*.18,z+fz*r*.18,r*.42,h,k+1,{taper:.3,dome:.42,lean:.08,rot:f,ribs:6,bulge:.1,bulgeAt:.55,rough:.22});
    }
    else if(q.shape==='titop'){
      // Ti Tốp: đỉnh vách giật cấp, vai núi phía sau, bãi cát khô và cát ẩm hình lưỡi liềm, hai mũi đá ôm bãi, lầu vọng cảnh 2 mái đỏ
      addKarst(x,z,r*.62,h*1.5,k,{taper:.14,dome:.34,steps:2,ribs:7,rough:.2});
      addKarst(x-fx*r*.4,z-fz*r*.4,r*.45,h*1.05,k+1,{taper:.15,dome:.42,ribs:6,rough:.2});
      const sand=(a,b,y,c)=>{const m=new THREE.Mesh(new THREE.RingGeometry(r*a,r*b,32,1,-f-Math.PI*.38,Math.PI*.76),new THREE.MeshStandardMaterial({color:c,roughness:1}));m.rotation.x=-Math.PI/2;m.position.set(x,y,z);bayGroup.add(m)};
      sand(.78,1.12,.28,'#efe3c4');sand(1.1,1.26,.2,'#c9b48e');
      for(const s of [-1,1]){const a=f+s*Math.PI*.42;addKarst(x+Math.cos(a)*r*1.08,z+Math.sin(a)*r*1.08,r*.2,h*.38,k+5+s,{shape:6,rot:a})}
      const top=h*1.5,pav=new THREE.Group(),white=new THREE.MeshStandardMaterial({color:'#f1ece2'}),red=new THREE.MeshStandardMaterial({color:'#b6533c',flatShading:true});
      for(const a of [-1,1])for(const b of [-1,1]){const col=new THREE.Mesh(new THREE.CylinderGeometry(.18,.18,3.4,8),white);col.position.set(a*1.3,1.2,b*1.3);pav.add(col)}
      const r1=new THREE.Mesh(new THREE.ConeGeometry(2.7,1.3,4),red);r1.position.y=3.2;r1.rotation.y=Math.PI/4;const r2=new THREE.Mesh(new THREE.ConeGeometry(1.8,1.1,4),red);r2.position.y=4.25;r2.rotation.y=Math.PI/4;pav.add(r1,r2);
      pav.position.set(x,top-1.2,z);bayGroup.add(pav);
      addKiosks(x,z,f-.55,r,4,k);addUmbrellas(x,z,f+.15,r,7,k);
      // bậc đá trắng dẫn lên đỉnh (dải zíc zắc trên sườn phía bãi)
      for(let j=0;j<7;j++){const t=j/7,a=f+(j%2?.25:-.1),d=r*(.62-t*.42),y=1+t*(top-3),s=new THREE.Mesh(new THREE.BoxGeometry(1.2,.5,7),decoMat('#e8e1d2'));s.position.set(x+Math.cos(a)*d,y,z+Math.sin(a)*d);s.rotation.y=-a;s.rotation.x=.55;bayGroup.add(s)}
      for(const s of [-1,1]){const jk=makeJunk(s>0?'#8a6446':'#6f4f36');const a=f+s*.3,d=r*1.45;jk.position.set(x+Math.cos(a)*d,0,z+Math.sin(a)*d);jk.rotation.y=-a;bayGroup.add(jk)}
    }
    else if(q.shape==='arch'){
      // Hang Luồn: vòm đá xuyên thủy quay về phía tàu, hai vách trụ hai bên, vòng 5 đỉnh quây hồ nước lặng bên trong
      const R=r*.92;addCaveArch(x+fx*R,z+fz*R,f,r*1.05,h*.95,r*.56,h*.62,r*.3);
      for(const s of [-1,1]){const a=f+s*.45;addKarst(x+Math.cos(a)*R,z+Math.sin(a)*R,r*.26,h,k+3+s,{shape:0,rot:a})}
      const sh=[0,4,7,0,5];for(let j=0;j<5;j++){const a=f+.9+j*(2*Math.PI-1.8)/4,low=j===2;addKarst(x+Math.cos(a)*R,z+Math.sin(a)*R,r*(low?.2:.26+bayHash(k,j,1)*.1),h*(low?.32:.8+bayHash(k,j,2)*.35),k+10+j,{shape:sh[j],rot:a})}// đỉnh đối diện vòm thấp để nhìn xuyên thấy hồ và trời
    }
    else if(q.shape==='trio'){
      // Hòn Ba Trái Đào: ba đỉnh đá tròn nối chân nhau, xếp ngang tầm nhìn từ luồng tàu, bãi cát nhỏ phía trước
      const px=-fz,pz=fx;for(let j=-1;j<=1;j++)addKarst(x+px*j*r*.55,z+pz*j*r*.55,r*.42,h*(j?(j>0?.86:.92):1),k+j+2,{taper:.18,dome:.62,ribs:4,ribAmp:.07,rough:.2});
      const m=new THREE.Mesh(new THREE.RingGeometry(r*.6,r*.95,24,1,-f-Math.PI*.3,Math.PI*.6),new THREE.MeshStandardMaterial({color:'#efe3c4',roughness:1}));m.rotation.x=-Math.PI/2;m.position.set(x,.26,z);bayGroup.add(m);
    }
    else if(q.shape==='beach'){
      // Đảo có bãi tắm (Đảo Khỉ): đồi đá phủ rừng, bãi cát khô + cát ẩm lưỡi liềm quay về phía tàu, hai mũi đá
      addKarst(x,z,r*.62,h,k,{taper:.12,dome:.5,ribs:5,rough:.2});addKarst(x-fx*r*.38,z-fz*r*.38,r*.5,h*.8,k+1,{shape:2});
      const sand=(a,b,y,c)=>{const m=new THREE.Mesh(new THREE.RingGeometry(r*a,r*b,32,1,-f-Math.PI*.36,Math.PI*.72),new THREE.MeshStandardMaterial({color:c,roughness:1}));m.rotation.x=-Math.PI/2;m.position.set(x,y,z);bayGroup.add(m)};
      sand(.74,1.1,.28,'#f1e6c8');sand(1.08,1.24,.2,'#c9b48e');
      for(const s of [-1,1]){const a=f+s*Math.PI*.4;addKarst(x+Math.cos(a)*r*1.05,z+Math.sin(a)*r*1.05,r*.17,h*.3,k+5+s,{shape:6,rot:a})}
      addBeachTrees(x,z,f,r,9,k,.62);addUmbrellas(x,z,f,r,4,k);
    }
    else if(q.shape==='cove'){
      // Áng nước kín kiểu Lan Hạ / Cống Đỏ: vòng vách đá dựng đứng, đỉnh tròn phủ rừng, mở về phía tàu; nhà bè nhỏ trong áng
      const sh=[0,3,4,0,3,0,4];for(let j=0;j<7;j++){const a=f+.75+j*(2*Math.PI-1.5)/6,d=r*(.95+bayHash(k,j,3)*.15);
        addKarst(x+Math.cos(a)*d,z+Math.sin(a)*d,r*(.3+bayHash(k,j,1)*.1),h*(.78+bayHash(k,j,2)*.4),k+j,{shape:sh[j],rot:a+Math.PI/2,taper:.05,dome:.5,ribs:10,ribAmp:.13,rough:.22})}
      const g=new THREE.Group();g.position.set(x-fx*r*.15,0,z-fz*r*.15);g.rotation.y=-f;decoBox(g,12,.5,8,'#8a6f52',0,.25,0);decoBox(g,6,3,5,'#4f9a8c',-1.5,2,0);decoBox(g,7,.3,6,'#5f8f6a',-1.5,3.6,0);
      for(let j=0;j<4;j++){const b=new THREE.Mesh(new THREE.CylinderGeometry(.5,.5,1,10),decoMat('#2f6fb0'));b.position.set(3+j%2*1.2,1,-2+Math.floor(j/2)*1.2);g.add(b)}bayGroup.add(g);
      const sp=makeSampan(true);sp.position.set(x-fx*r*.15+fz*12,0,z-fz*r*.15-fx*12);sp.rotation.y=-f;bayGroup.add(sp);
    }
    else if(q.shape==='island_beach'){
      // Đảo Bái Tử Long: hai đồi tròn thấp phủ rừng, bãi cát trắng dài lưỡi liềm, hàng phi lao, ô dù
      const px=-fz,pz=fx;addKarst(x-fx*r*.25+px*r*.2,z-fz*r*.25+pz*r*.2,r*.55,h,k,{shape:2,sx:1.5,rot:f+Math.PI/2});addKarst(x-fx*r*.3-px*r*.35,z-fz*r*.3-pz*r*.35,r*.42,h*.75,k+1,{shape:2,rot:f});
      const sand=(a,b,y,c)=>{const m=new THREE.Mesh(new THREE.RingGeometry(r*a,r*b,40,1,-f-Math.PI*.46,Math.PI*.92),new THREE.MeshStandardMaterial({color:c,roughness:1}));m.rotation.x=-Math.PI/2;m.position.set(x,y,z);bayGroup.add(m)};
      sand(.6,1.02,.3,'#f4ead0');sand(1.0,1.16,.2,'#cdb995');
      addBeachTrees(x,z,f,r*.95,14,k,.82);addUmbrellas(x,z,f,r*.95,8,k);addKiosks(x,z,f+.5,r*.9,3,k);
    }
    else if(q.shape==='village'){
      // Dãy nhà bè san sát dọc chân vách đá (như làng chài Cửa Vạn): sàn gỗ, vách xanh, mái tôn, thùng phao xanh, cờ đỏ, đò mui đen, xuồng gỗ
      const walls=['#4f9a8c','#5d8fb0','#7fae9a','#3f7f86','#a9c3b4','#6a9fc0'],roofs=['#5f8f6a','#4d7d8a','#6f8f78'],px=-fz,pz=fx;
      const back=34;for(let j=-4;j<=4;j++){const g=new THREE.Group(),off=j*13+(bayHash(k,j+5,1)-.5)*3,dep=back+(bayHash(k,j+5,2)-.5)*8;g.position.set(x+px*off-fx*dep,0,z+pz*off-fz*dep);g.rotation.y=-f+Math.PI/2;
        decoBox(g,12,.5,10,'#8a6f52',0,.25,0);decoBox(g,12.5,.35,1.4,'#a68a66',0,.4,5.8);// sàn bè + lối ván ra mép nước
        const ww=7+bayHash(k,j+5,3)*2.5;decoBox(g,ww,3.2,6,walls[(j+9)%6],-1,2.1,-1.2);decoBox(g,ww+1.4,.3,7.4,roofs[(j+9)%3],-1,3.85,-1.2).rotation.x=-.08;
        decoBox(g,3.2,1.6,3,'#e7e1d3',4,1.3,1.6);// gian phơi đồ
        for(let b=0;b<3;b++){const c=new THREE.Mesh(new THREE.CylinderGeometry(.45,.45,.95,10),decoMat(b%2?'#2f6fb0':'#3b82c4'));c.position.set(2+b*1.1,.95,-3.4);g.add(c)}
        if(j%3===0){const pole=new THREE.Mesh(new THREE.CylinderGeometry(.06,.06,6,5),decoMat('#d9d2c2'));pole.position.set(-4.5,4,2.5);g.add(pole);decoBox(g,.05,1,1.6,'#d2332b',-4.5,6.3,3.3)}
        bayGroup.add(g)}
      for(const [s,cn] of [[-1,true],[1,false],[.3,true]]){const sp=makeSampan(cn);sp.position.set(x+px*s*30-fx*(back-12),0,z+pz*s*30-fz*(back-12));sp.rotation.y=-f+(s>0?.2:-.3);bayGroup.add(sp)}
      // vòng đảo tháp đá vôi đa dạng bao quanh làng, chừa luồng tàu và lối vào phía tàu ghé
      for(const v of villageRocks(p))addKarst(v[0],v[1],v[2],v[3],v[4],{shape:v[5]})}
    else if(q.shape==='pier'){const pier=new THREE.Mesh(new THREE.BoxGeometry(6,1,60),new THREE.MeshStandardMaterial({color:'#b9b1a2'}));pier.position.set(x,.6,z+22);bayGroup.add(pier);
      for(let j=0;j<2;j++){const jk=makeJunk(['#7d5a3d','#8a6446'][j]);jk.position.set(x-6.5,0,z+10+j*16);jk.rotation.y=j%2?Math.PI/2:-Math.PI/2;bayGroup.add(jk)}}
    else if(q.shape==='bridge'){const m=new THREE.MeshStandardMaterial({color:'#e9e6df',roughness:.6});const deck=new THREE.Mesh(new THREE.BoxGeometry(260,2.2,9),m);deck.position.set(x,20,z);bayGroup.add(deck);
      for(const sx of [-45,45]){const py=new THREE.Mesh(new THREE.BoxGeometry(4,64,4),m);py.position.set(x+sx,30,z);bayGroup.add(py);
        const pos=[];for(let j=1;j<=8;j++)for(const s of [-1,1]){pos.push(x+sx,58-j*1.5,z,x+sx+s*j*13,21,z)}const lg=new THREE.BufferGeometry();lg.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));bayGroup.add(new THREE.LineSegments(lg,new THREE.LineBasicMaterial({color:'#d9d6cf'})))}}
    if(r>0||q.shape==='village'||q.shape==='pier'||q.shape==='bridge'){const pr=Math.max(r*1.1,q.shape==='bridge'?60:30);const hit=new THREE.Mesh(new THREE.CylinderGeometry(pr,pr,(h||30)+20,10),new THREE.MeshBasicMaterial({visible:false}));hit.position.set(x,(h||30)/2,z);hit.userData.landmark=p;bayGroup.add(hit);bayPick.push(hit)}
  }
  // ===== Đảo Yên (đảo riêng): 160 m phía đông Hòn Gà Chọi, nhìn về Gà Chọi; cầu tàu quay về phía tây để du thuyền cập.
  // Cùng một toạ độ cho mọi người, mỗi người thấy đảo của mình.
  const TU_DAO={x:1428,z:650,r:40,dock:[1428-79,650],heading:Math.PI/2};
  // ===== Đảo Yên (vẽ lại theo ảnh thiết kế 3.40). Toạ độ địa phương của đảo, đơn vị mét, không xoay, mặt nước y = 0.
  // Mặt trước đảo nhìn về phía tây (-x), nơi du thuyền cập. Từ ngoài vào: cầu tàu gỗ có biển ĐẢO YÊN → bãi cát rộng hình cung
  // → lối lát đá thẳng → bậc đá rộng → nhà chính mái ngói nâu, tường kính, hiên gỗ. Bên trái (-z): phòng nhỏ nghỉ ngơi và thiền
  // (có tượng Phật, bồ đoàn). Bên phải (+z): chòi ngắm biển bát giác trên cột. Hai lối đá bước cong nối từ lối chính sang hai công trình.
  // Phía sau nhà (+x): núi đá vôi dựng bằng cùng hàm addKarst như mọi đảo khác trong vịnh (vách đá, vệt nước, cây bám).
  // Hai đầu bãi cát và hai sườn đảo có đá tảng; ghế nằm và dù trên bãi trái; cây tán rộng, dừa, bụi hoa quanh lối đi.
  const TD_O=[8,0];
  const tdR=a=>48-3*Math.cos(a)+2*Math.cos(2*a)+1.2*Math.sin(5*a+.7)+.8*Math.cos(9*a+1.3);/* bán kính bờ theo góc quanh TD_O */
  const tdRho=(x,z)=>{const dx=x-TD_O[0],dz=z-TD_O[1],a=Math.atan2(dz,dx);return [Math.hypot(dx,dz)/tdR(a),a]};
  const tdSandEdge=a=>1-(.06+.36*Math.pow(Math.max(0,-Math.cos(a)),.8));/* ρ nơi cỏ gặp cát: bãi cát rộng ở mặt trước, hẹp dần hai bên */
  function tdTerrainY(x,z){const [r,a]=tdRho(x,z),se=tdSandEdge(a);
    if(r>=1)return r<1.1?-.3-(r-1)/.1*1.6:-1.9;
    if(r>se)return -.3+1.3*Math.pow((1-r)/(1-se),.8);/* bãi cát: mép nước -0,3 m lên 1 m ở mép cỏ */
    const t=(se-r)/se;return 1+1.4*baySm(0,.45,t)+.22*Math.sin(x*.21+1)*Math.sin(z*.17)*baySm(0,.3,t)+6*baySm(12,34,x)*baySm(0,.4,t)}
  // Bố cục (mét)
  const TD_H={x0:-1.5,x1:13.5,z:9.5},TD_MED={x:-6,z:-30,h:3.7},TD_GAZ={x:-2,z:34,r:4.2};
  const TD_FY=(()=>{let y=-9;for(let x=TD_H.x0;x<=TD_H.x1;x+=1.5)for(let z=-TD_H.z;z<=TD_H.z;z+=1.5)y=Math.max(y,tdTerrainY(x,z));return y+1.3})();/* sàn nhà chính */
  const TD_SR=(()=>{for(let L=1;L<14;L+=.1)if(TD_FY-tdTerrainY(TD_H.x0-L,0)<=.38*L)return L;return 14})();/* chiều dài bậc đá trước nhà */
  const TD_SBOT=tdTerrainY(TD_H.x0-TD_SR,0);
  const TD_MY=(()=>{let y=-9;for(let i=-1;i<=1;i+=.5)for(let j=-1;j<=1;j+=.5)y=Math.max(y,tdTerrainY(TD_MED.x+i*TD_MED.h,TD_MED.z+j*TD_MED.h));return y+.45})();/* sàn phòng thiền */
  const TD_GY=(()=>{let y=-9;for(let k=0;k<8;k++){const a=k/8*Math.PI*2;y=Math.max(y,tdTerrainY(TD_GAZ.x+Math.cos(a)*TD_GAZ.r,TD_GAZ.z+Math.sin(a)*TD_GAZ.r))}return y+5.4})();/* sàn chòi: cao gần gấp đôi trước */
  const TD_GDIR=(()=>{const v=[-.6,-.8];return v})(),TD_GRUN=Math.max(2,(TD_GY-tdTerrainY(TD_GAZ.x,TD_GAZ.z))/.62);
  const TD_PIER_END=[-TU_DAO.r-14,0],TD_PIER_MID=[-TU_DAO.r-5,0],TD_PIER_START=[-TU_DAO.r+4,0];
  const TD_STEP=[TD_H.x0-TD_SR-1,0],TD_DOOR=[.2,0],TD_JUNC=[-15,0];
  const TD_MED_FOOT=[TD_MED.x-TD_MED.h-1.8,TD_MED.z],TD_GAZ_FOOT=[TD_GAZ.x+TD_GDIR[0]*(TD_GAZ.r+TD_GRUN+.9),TD_GAZ.z+TD_GDIR[1]*(TD_GAZ.r+TD_GRUN+.9)];
  const tdBez=(a,c,b,n)=>{const o=[];for(let i=0;i<=n;i++){const t=i/n,u=1-t;o.push([u*u*a[0]+2*u*t*c[0]+t*t*b[0],u*u*a[1]+2*u*t*c[1]+t*t*b[1]])}return o};
  const TD_LEFT=tdBez(TD_JUNC,[-22,-17],TD_MED_FOOT,16),TD_RIGHT=tdBez(TD_JUNC,[-22,15],TD_GAZ_FOOT,16);
  const TD_BEACH=tdBez(TD_GAZ_FOOT,[-21,29],[-31,6],10).concat([[TD_PIER_START[0]+3,0]]);
  const TD_WALK_HOUSE=[TD_PIER_START,TD_STEP];
  const tdSegD=(x,z,P)=>{let m=1e9;for(let i=0;i<P.length-1;i++){const [ax,az]=P[i],[bx,bz]=P[i+1],vx=bx-ax,vz=bz-az,t=Math.max(0,Math.min(1,((x-ax)*vx+(z-az)*vz)/(vx*vx+vz*vz||1)));m=Math.min(m,Math.hypot(ax+vx*t-x,az+vz*t-z))}return m};
  const tdOnPaths=(x,z,pad)=>tdSegD(x,z,[[TD_PIER_START[0]-8,0],TD_STEP])<pad||tdSegD(x,z,TD_LEFT)<pad||tdSegD(x,z,TD_RIGHT)<pad||tdSegD(x,z,TD_BEACH)<pad*.8;
  const tdInBuild=(x,z,m)=>(x>TD_H.x0-TD_SR-1.5-m&&x<TD_H.x1+1.5+m&&Math.abs(z)<TD_H.z+1.2+m)||(Math.abs(x-TD_MED.x)<TD_MED.h+1.8+m&&Math.abs(z-TD_MED.z)<TD_MED.h+1+m)||Math.hypot(x-TD_GAZ.x,z-TD_GAZ.z)<TD_GAZ.r+1.4+m||tdSegD(x,z,[[TD_GAZ.x,TD_GAZ.z],TD_GAZ_FOOT])<1.8+m||(x<-23&&x>-35&&z<-12&&z>-28&&m>=0);
  // Núi đá vôi sau nhà: thêm vào cùng lô đá của vịnh (gọi trước finishKarsts) nên cùng chất liệu, màu và cây bám như mọi đảo khác.
  function addTuDaoMountain(){const X=TU_DAO.x,Z=TU_DAO.z;
    addKarst(X+40,Z+1,20,30,7301,{shape:2,rot:.4});/* đồi đá tròn ngay sau nhà, phủ cây */
    addKarst(X+52,Z-15,15,52,7302,{shape:1,rot:1.1});addKarst(X+55,Z+14,14,44,7303,{shape:0,rot:2.3});/* hai chóp đá vôi cao phía sau */
    addKarst(X+31,Z-27,8,17,7304,{shape:2,rot:.9});addKarst(X+33,Z+28,7,15,7305,{shape:2,rot:2.2});/* hai gò đá thấp ôm hai bên */
    bayExtraRocks.push([X+48,Z,30])}
  const TD_COLL=[];const TD_ACT={cairn:null,beach:[],bins:[],carry:null,hand:null,seq:null,nextSpawn:0,g:null,clear:null,spawned:0,queue:0,decor:[],decorOk:false,tweens:[],leaveCont:null,mode:null,camSave:null,station:null,focus:null};/* hoạt động trên bãi: xếp đá cân bằng, nhặt vỏ sò *//* vật cản khi đi bộ trên đảo (toạ độ địa phương): [x, z, bán kính] của đá, gốc cây, dừa, bụi cây, ghế nằm */
  // ===== Bộ Sưu Tập 12 Loại Ốc – Vịnh Yên (phong cách 3D Soft Minimal Luxury): 12 dáng × 3 phiên bản màu = 36 vỏ.
  // Mỗi dáng là một khối tham số (vài trăm tam giác), màu và vân bằng Vertex Color (không dùng ảnh), bề mặt bóng mềm (clearcoat).
  // Vỏ mới nhặt còn phủ cát ẩm, «Nhúng nước rửa cát» ở mép sóng mới lộ màu thật. Ốc Gai Biển có nút «Áp tai nghe sóng» (15 giây).
  const SH_N=12,SH_T=3;
  const SH_SHAPE=['Sò Điệp','Ốc Xà Cừ','Ốc Sứ','Ốc Tháp','Sò Trái Tim','Ốc Bồ Câu','Ốc Đốm','Ốc Nón','Sò Tai Tượng','Ốc Ngọc Trai','Ốc Anh Vũ','Ốc Gai Biển'];
  const SH_TONE=['Bình Minh','Nắng Vàng','Biển Ngọc'],SH_TONE_IC=['🌸','🌞','🌊'];
  const SH_NAME=[['Hồng San Hô','Vàng Nắng','Xanh Ngọc'],['Ánh Ngọc Hồng','Ánh Tím Lam','Ánh Vàng Lục'],['Đốm Nâu Kem','Vàng Đốm Trắng','Ngọc Đốm Trắng'],['Vàng Nắng','Hồng San Hô','Xanh Biển'],['Sọc Hồng','Sọc Vàng','Sọc Tím'],['Hồng Phấn','Vàng Mật','Ngọc Lam'],['Hồng Chấm Trắng','Vàng Chấm Trắng','Lam Chấm Trắng'],['Zigzag Hồng','Zigzag Vàng','Zigzag Lam'],['Sóng Tím','Sóng Vàng','Sóng Ngọc'],['Vân Nâu Kem','Vân Hồng','Vân Lam'],['Sọc Cam Đỏ','Sọc Vàng','Sọc Lam'],['Gai Hồng','Gai Vàng','Gai Lam']];
  /* [màu nền, màu vân / đốm / miệng, (màu thứ ba)] cho từng phiên bản */
  const SH_COL=[[['#f4628a','#ffd3df'],['#f7b524','#ffeaa6'],['#1fbfab','#bff5ec']],
    [['#d8b8f0','#9fe3f2','#f9c7de'],['#8c78e6','#c5d2ff','#f2c6f0'],['#f2cf45','#93d88c','#fff2b8']],
    [['#fbf1e2','#a5582c'],['#f8c21c','#fffaf0'],['#22bcc0','#f3fefd']],
    [['#f6be26','#fff0b4'],['#f47a6c','#ffd9cf'],['#2f8de6','#c4e4ff']],
    [['#f25479','#ffd7e1'],['#f6be2b','#fff3c9'],['#9767de','#f0e6ff']],
    [['#f46797','#ffe0ea'],['#f5b52a','#fff1ca'],['#27bfae','#d3f8f0']],
    [['#f45b6d','#ffffff'],['#f7c21d','#ffffff'],['#1d9ae6','#ffffff']],
    [['#f26b6b','#fff5f0'],['#f5b928','#fff7de'],['#2c9fe6','#ecf8ff']],
    [['#8752d6','#fcefdc'],['#f4b229','#fff4d8'],['#1db3a6','#e8fbf7']],
    [['#b9652b','#fcefdf'],['#f27c9f','#fff1f5'],['#4f86e0','#eef4ff']],
    [['#f2553f','#fff4ea'],['#f6b71c','#fff6d8'],['#2d8fe6','#eef6ff']],
    [['#f26f7b','#ffdde0'],['#f5b52a','#ffecbc'],['#29a5e6','#d9f2ff']]];
  const SH_SEA=['Sóng đến rồi đi, như hơi thở của biển. Thở vào, thở ra.','Cát mịn trôi đi, sắc men thật hiện ra. Mọi điều đẹp cần chút kiên nhẫn.','Biển không vội vàng, mà vẫn chạm tới mọi bờ.','Một chiếc vỏ nhỏ cũng mang cả đại dương trong lòng.','Hãy để ưu phiền trôi theo bọt sóng.','Lắng nghe: tiếng sóng chính là tiếng lòng đang dịu lại.','Mỗi con sóng là một khởi đầu mới.','Bình yên không ở đâu xa, ở ngay hơi thở này.','Cảm ơn biển đã gửi món quà nhỏ hôm nay.'];
  const shName=(s,t)=>SH_SHAPE[s]+' '+SH_NAME[s][t],shKey=(s,t)=>s+'-'+t;
  function shSurf(nu,nv,fn,c1,c2,c3){const P=[],C=[],I=[],a=new THREE.Color(c1),b=new THREE.Color(c2),d=new THREE.Color(c3||'#fbf3ea'),c=new THREE.Color();
    for(let j=0;j<=nv;j++)for(let i=0;i<=nu;i++){const [x,y,z,k]=fn(i/nu,j/nv);P.push(x,y,z);const kk=Math.max(0,Math.min(2,k));if(kk<=1)c.copy(a).lerp(b,kk);else c.copy(b).lerp(d,kk-1);C.push(c.r,c.g,c.b)}
    for(let j=0;j<nv;j++)for(let i=0;i<nu;i++){const q=j*(nu+1)+i;I.push(q,q+nu+1,q+1,q+1,q+nu+1,q+nu+2)}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('color',new THREE.Float32BufferAttribute(C,3));g.setIndex(I);return g}
  const shSm=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t)},TAU=Math.PI*2;
  const SH_SPOTS=Array.from({length:22},(_,i)=>[(i*2.399+Math.sin(i*7.1)*1.3)%TAU,.08+.66*((i*.7548+.5*Math.sin(i*3.7)**2)%1),.2+.12*((i*.37)%1)]);
  /* Vỏ ốc xoắn (đường xoắn logarit): u = vòng quanh ống, v = dọc theo vòng xoắn từ đỉnh tới miệng ốc.
     o: T số vòng, c tốc độ lớn, a bán kính ống, d bán kính tâm ống, H chiều cao tháp, sp(θ,φ,s,f) hệ số gai/loe, col(θ,φ,f) màu */
  function shHelix(o){const Tt=o.T*TAU;return (u,v)=>{const f=u*TAU,th=v*Tt,s=Math.exp(-o.c*(Tt-th)),fr=v,m=o.sp?o.sp(th,f,s,fr):1,rho=o.a*s*m,D=o.d*s;
      return [(D+rho*Math.cos(f))*Math.cos(th),o.H*(1-s)+rho*Math.sin(f)*(o.ys||1),(D+rho*Math.cos(f))*Math.sin(th),o.col(th,f,fr,s)]}}
  /* vỏ ốc tròn xoay nằm ngang (trục x): prof(t,φ) → [bán kính, màu]; t từ đầu ống (0) tới đỉnh tháp (1) */
  function shRev(L,prof){return (u,v)=>{const f=u*TAU,[r,k]=prof(v,f);return [(v-.5)*L,r*Math.sin(f),r*Math.cos(f),k]}}
  /* 12 dáng theo ảnh «Bộ Sưu Tập 12 Loại Ốc – Vịnh Yên» (3 góc nhìn trước – trái – trên): dựng xong chuẩn hoá dài ~1 đơn vị, nằm trên mặt cát (y ≥ 0) */
  const shDots=(t,f,rows,cols,t0,t1,rad,asp=1.4)=>{const rt=(t-t0)/(t1-t0)*rows,ri=Math.round(rt);if(ri<0||ri>rows||t<t0-.02||t>t1+.02)return 0;const off=(ri%2)*.5,cf=f/TAU*cols-off,ci=Math.round(cf);return 1-shSm(rad*.72,rad,Math.hypot(rt-ri,(cf-ci)*asp))};
  const SH_FN=[
    /* 01 Sò Điệp: nguyên mảnh quạt tròn ~230°, 20 rãnh tròn nổi, mép lượn sóng, hai tai vuông ở bản lề (bản lề quay về phía người xem) */ [72,18,(u,v)=>{const th=(u-.5)*3.9,R=.62*(.3+.7*Math.pow(Math.max(0,Math.cos(th*.62)),.55)),rib=Math.cos(th*20/3.9*TAU*.5),cr=Math.pow(Math.max(0,rib),1.3),r=v;
      const ear=(1-shSm(.05,.3,r))*shSm(.9,1.5,Math.abs(th))*.2,rr=R*r*(1+.04*rib*r*r)+ear,h=.34*Math.pow(Math.max(0,1-r*r),.55)*(.55+.45*Math.cos(th*.5))+.04*cr*r;return [Math.sin(th)*rr,.015+h,Math.cos(th)*rr-.22,.05+.8*cr*r*r+.25*shSm(.8,1,r)]}],
    /* 02 Ốc Xà Cừ: tròn mập, nhiều vòng xoắn lộ trên đỉnh, dải ánh xà cừ ngũ sắc theo đường xoắn */ [24,110,shHelix({T:3.8,c:.19,a:.48,d:.52,H:.72,col:(th,f)=>.55+.8*(.5+.5*Math.sin(th*1.3))+.35*Math.sin(f*2+th*.4)})],
    /* 03 Ốc Sứ: trứng bầu dục bóng sứ, đốm tròn đều, khe miệng dưới bụng */ [56,30,(u,v)=>{const f=u*TAU,a=Math.PI*v,x=.6*Math.sin(a)*Math.cos(f),z=.42*Math.sin(a)*Math.sin(f)*(1-.05*Math.cos(2*f)),y=.3+.3*Math.cos(a);
      const k=a>2.35?0:shDots(a/Math.PI,f,5,11,.08,.72,.36,1.6);return [x,Math.max(.02,y),z,k]}],
    /* 04 Ốc Tháp: tháp nhọn, gờ xoắn rõ, miệng tròn, nằm nghiêng */ [14,150,shHelix({T:7.5,c:.07,a:.3,d:.24,H:1.45,sp:(th,f)=>1+.12*Math.pow(Math.max(0,Math.sin(f)),3),col:(th,f,fr)=>.05+.8*Math.pow(Math.max(0,Math.sin(f)),4)+.6*shSm(.97,1,fr)}),g=>g.rotateZ(Math.PI/2-.12)],
    /* 05 Sò Trái Tim: trái tim phồng tròn, sọc chéo */ [56,14,(u,v)=>{const t=u*TAU,s=1-v,hx=16*Math.pow(Math.sin(t),3)/17,hz=(13*Math.cos(t)-5*Math.cos(2*t)-2*Math.cos(3*t)-Math.cos(4*t))/17,/* hai múi tròn ở xa, đỉnh nhọn quay về phía người xem */x=hx*s*.5,z=hz*s*.5;return [x,.015+.4*Math.pow(Math.max(0,1-s*s),.55),z,shSm(-.3,.3,Math.sin((x*1.1+z)*11))]}],
    /* 06 Ốc Bồ Câu: xoắn tròn mập, miệng loe rộng màu nhạt */ [22,104,shHelix({T:3.2,c:.2,a:.5,d:.44,H:.95,sp:(th,f,s,fr)=>1+.32*Math.pow(shSm(.88,1,fr),1.4)*(.5+.5*Math.max(0,Math.cos(f))),col:(th,f,fr)=>.08+.92*shSm(.9,.99,fr)+.12*Math.max(0,Math.sin(th*2))})],
    /* 07 Ốc Đốm: hình giọt nước, chóp xoắn nhỏ, chấm tròn trắng */ [48,80,shRev(1.25,(t,f)=>{const tt=Math.pow(t,.9),r=.42*Math.pow(Math.sin(Math.PI*tt),.62)*(t>.8?1+.1*Math.sin((t-.8)*70):1);return [Math.max(.004,r),shDots(t,f,5,10,.1,.74,.36,1.5)]})],
    /* 08 Ốc Nón: nón ngược, vai tròn, chóp thấp, sọc zigzag */ [40,56,shRev(1.25,(t,f)=>{const r=t<.8?.03+.42*Math.pow(t/.8,1.05):.45*Math.pow(Math.max(0,1-(t-.8)/.2),.75)*(1+.05*Math.sin((t-.8)*90));const zz=Math.abs(((f/TAU*10)%1)*2-1);return [Math.max(.004,r),t>.82?.25+.5*shSm(-.3,.3,Math.sin((t-.8)*120)):shSm(-.25,.25,Math.sin((t*7.5+zz*.45)*TAU))]})],
    /* 09 Sò Tai Tượng: năm cánh thon dài như sao biển, thân phồng giữa, đầu cánh màu kem */ [100,18,(u,v)=>{const f=u*TAU,a=Math.PI*v,sa=Math.sin(a),arm=Math.pow(Math.abs(Math.cos(f*2.5)),5),R=.26+.74*arm;
      const y=.2*(1-Math.cos(a))*(.3+.7*(1-arm*.8));return [.66*sa*Math.cos(f)*R,y,.66*sa*Math.sin(f)*R,.05+.95*shSm(.55,.95,sa*R)]}],
    /* 10 Ốc Ngọc Trai: tròn bóng, vòng xoắn lộ trên đỉnh, sọc theo đường xoắn */ [22,96,shHelix({T:3.2,c:.2,a:.47,d:.5,H:.75,col:(th)=>shSm(-.22,.22,Math.sin(th*2.2))})],
    /* 11 Ốc Anh Vũ (Nautilus): xoắn phẳng đối xứng, ống dẹt, sọc toả */ [22,90,shHelix({T:2.4,c:.15,a:.5,d:.62,H:0,ys:.6,col:(th,f,fr)=>shSm(-.28,.28,Math.sin(th*4.2))*(1-.35*shSm(.9,1,fr))})],
    /* 12 Ốc Gai Biển: thân thoi, hàng gai dài toả tròn, miệng loe màu nhạt */ [42,76,shRev(1.4,(t,f)=>{const ap=Math.max(0,Math.cos(f-Math.PI/2)),body=t<.28?.05+.05*t/.28:t<.55?.1+.22*Math.sin((t-.28)/.27*Math.PI*.5+.15):.32*Math.pow(Math.max(0,(1-t)/.45),1.1)*(.85+.15*Math.pow(1-((1-t)*6)%1,2));
      const sp=Math.pow(Math.max(0,Math.cos(f*7)),9),spk=sp*(.32*Math.exp(-Math.pow((t-.47)/.022,2))+.24*Math.exp(-Math.pow((t-.6)/.022,2))+.14*Math.exp(-Math.pow((t-.72)/.022,2))+.12*Math.exp(-Math.pow((t-.3)/.02,2))),lip=Math.pow(ap,5)*shSm(.25,.34,t)*(1-shSm(.5,.6,t))*.24;return [body+spk+lip,lip>.03?shSm(.03,.09,lip):.35*sp]})]];
  const SH_GEO=new Map();
  function shGeo(s,t){s=((s|0)%SH_N+SH_N)%SH_N;t=((t|0)%SH_T+SH_T)%SH_T;/* vỏ lưu từ bộ cũ (9×4) vẫn hiện được */const k=shKey(s,t);if(!SH_GEO.has(k)){const [nu,nv,fn,post]=SH_FN[s],[c1,c2,c3]=SH_COL[s][t],g=shSurf(nu,nv,fn,c1,c2,c3);if(post)post(g);
      g.computeBoundingBox();const B=g.boundingBox,sz=Math.max(B.max.x-B.min.x,B.max.z-B.min.z,B.max.y-B.min.y);g.translate(-(B.max.x+B.min.x)/2,-B.min.y,-(B.max.z+B.min.z)/2);g.scale(1/sz,1/sz,1/sz);g.computeVertexNormals();SH_GEO.set(k,g)}return SH_GEO.get(k)}
  const SH_MAT=new THREE.MeshPhysicalMaterial({vertexColors:true,roughness:.32,metalness:0,clearcoat:.9,clearcoatRoughness:.18,side:THREE.DoubleSide}),SH_PEARL=new THREE.MeshPhysicalMaterial({vertexColors:true,roughness:.25,metalness:.05,clearcoat:1,clearcoatRoughness:.12,iridescence:.7,iridescenceIOR:1.6,side:THREE.DoubleSide})/* bóng mềm kiểu Soft Minimal Luxury; xà cừ và ngọc trai có ánh ngũ sắc */,SH_SANDY=new THREE.MeshStandardMaterial({vertexColors:true,color:'#cdbb96',roughness:.95,side:THREE.DoubleSide});
  const shMat=s=>s===1||s===9?SH_PEARL:SH_MAT;
  const SH_HIT_G=new THREE.SphereGeometry(.85,6,4),SH_HIT_M=new THREE.MeshBasicMaterial({visible:false});
  function shMesh(s,t,sandy){const m=new THREE.Mesh(shGeo(s,t),sandy?SH_SANDY:shMat(s));m.scale.setScalar(.34);return m}
  // ---- 3 mẫu Khay / Giỏ (mỗi mẫu < 450 tam giác, 5 chỗ neo cố định cho vỏ)
  const BIN_INFO=[{name:'Giỏ Mây Đan Mắt Cáo',short:'Giỏ Mây',ic:'🧺',style:'Giản Dị'},{name:'Khay Gốm Sóng Biển',short:'Khay Sóng Ngọc',ic:'🌊',style:'Sang Chảnh'},{name:'Đĩa Sứ Vỏ Sò Hồng Đào',short:'Đĩa Sò Hồng',ic:'🐚',style:'Hạnh Phúc'}];
  const SH_CAP=36;/* mỗi khay / giỏ đựng được cả 36 vỏ */
  function binSock(k,i){if(i<5)return BIN_SOCK[k][i];const j=i-5,ring=j%9,layer=Math.floor(j/9),a=ring/9*TAU+layer*.35,r=.15-.02*layer;return [Math.cos(a)*r,.12+.045*layer+(ring%2)*.015,Math.sin(a)*r*.85]}
  const BIN_SOCK=[[[0,.07,0],[.12,.08,.06],[-.12,.08,.05],[.05,.09,-.12],[-.06,.1,-.1]],[[-.2,.07,.02],[-.07,.07,-.06],[.06,.07,.05],[.19,.07,-.03],[0,.07,.12]],[[0,.11,.02],[.13,.1,.1],[-.13,.1,.1],[.1,.1,-.08],[-.1,.1,-.08]]];
  function buildBin(k){const g2=new THREE.Group(),M=(c,r=.85,o={})=>new THREE.MeshStandardMaterial({color:c,roughness:r,...o});
    if(k===0){/* Giỏ Mây Đan Mắt Cáo: thân đan mắt cáo thưa, 2 quai mây cong bọc đai xanh ngọc, thẻ vỏ sò bên hông */
      const body=new THREE.Mesh(shSurf(16,6,(u,v)=>{const f=u*TAU,r=.24+.08*v,cell=(Math.floor(u*16+v*3)+Math.floor(u*16-v*3))%2;return [Math.cos(f)*r,.02+v*.3,Math.sin(f)*r,Math.abs(cell)]},'#c9a06a','#8f6a3e'),M('#ffffff',.9,{vertexColors:true,side:THREE.DoubleSide}));g2.add(body);
      const bt=new THREE.Mesh(new THREE.CircleGeometry(.24,12),M('#9b7444'));bt.rotation.x=-Math.PI/2;bt.position.y=.03;g2.add(bt);
      const rim=new THREE.Mesh(new THREE.TorusGeometry(.32,.022,5,18),M('#8f6a3e'));rim.rotation.x=Math.PI/2;rim.position.y=.32;g2.add(rim);
      for(const s of [-1,1]){const h=new THREE.Mesh(new THREE.TorusGeometry(.16,.018,5,10,Math.PI),M('#a77d4a'));h.position.set(s*.2,.32,0);h.rotation.y=Math.PI/2;g2.add(h);const band=new THREE.Mesh(new THREE.CylinderGeometry(.026,.026,.06,6),M('#3fa79a'));band.position.set(s*.2,.48,0);band.rotation.x=Math.PI/2;g2.add(band)}
      const tag=shMesh(0,0,false);tag.scale.setScalar(.09);tag.position.set(0,.2,.33);tag.rotation.x=-1.2;g2.add(tag);return {g:g2,fy:0}}
    if(k===1){/* Khay Gốm Sóng Biển: viền gốm mộc dáng hạt đậu, lòng khay làn nước xanh ngọc, bọt sóng trắng, cát mịn, 4 viên thủy tinh biển */
      const base=new THREE.Mesh(new THREE.BoxGeometry(.7,.05,.44),M('#d9c7a8',.7));base.position.y=.03;g2.add(base);
      const water=new THREE.Mesh(new THREE.BoxGeometry(.4,.012,.38),M('#46c2b4',.25,{transparent:true,opacity:.9}));water.position.set(-.12,.062,0);g2.add(water);
      const sand=new THREE.Mesh(new THREE.BoxGeometry(.24,.012,.38),M('#ecdfc3',.95));sand.position.set(.21,.062,0);g2.add(sand);
      const foam=new THREE.Mesh(new THREE.BoxGeometry(.035,.016,.38),M('#ffffff',.6));foam.position.set(.08,.066,0);g2.add(foam);
      const bead=new THREE.SphereGeometry(.03,6,4),bm=M('#cdb48e',.7);for(let i=0;i<22;i++){const f=i/22*TAU,x=Math.cos(f),z=Math.sin(f),sx=.35*Math.sign(x)*Math.pow(Math.abs(x),.35),sz=.22*Math.sign(z)*Math.pow(Math.abs(z),.35),b=new THREE.Mesh(bead,bm);b.position.set(sx,.07,sz);b.scale.set(1.2,1,1);g2.add(b)}
      const cg=new THREE.OctahedronGeometry(.025,0),cm=M('#bff0ff',.1,{transparent:true,opacity:.8,metalness:.2});for(const [x,z] of [[-.25,.1],[-.15,-.12],[.18,.12],[.26,-.1]]){const c=new THREE.Mesh(cg,cm);c.position.set(x,.08,z);g2.add(c)}return {g:g2,fy:0}}
    /* Đĩa Sứ Vỏ Sò Hồng Đào: dáng sò điệp gân nổi, men sứ kem ánh ngọc phớt hồng đào ở lòng, chân đế bầu dục */
    const dish=new THREE.Mesh(shSurf(16,5,(u,v)=>{const th=(u-.5)*2.6,r=v,rib=Math.cos(th*9);return [Math.sin(th)*r*.36,.08+.14*r*r+.012*r*rib,Math.cos(th)*r*.36-.14,1-r*.9]},'#f7ead9','#f2b6a2'),M('#ffffff',.3,{vertexColors:true,side:THREE.DoubleSide}));g2.add(dish);
    const foot=new THREE.Mesh(new THREE.CylinderGeometry(.11,.13,.08,14),M('#f3e2cf',.35));foot.scale.set(1.3,1,1);foot.position.set(0,.04,.02);g2.add(foot);return {g:g2,fy:0}}
  function buildTuDao(){const g=new THREE.Group();g.position.set(TU_DAO.x,0,TU_DAO.z);TD_COLL.length=0;
    const M=(c,r=.82,o={})=>new THREE.MeshStandardMaterial({color:c,roughness:r,...o});
    const wood=M('#8a6446'),woodL=M('#b48b62'),darkW=M('#4a3a2e'),stone=M('#a49c8c',.92),stoneD=M('#857e71',.95),stoneL=M('#c9bfaa',.9),
      tile=M('#5b4234',.85,{flatShading:true,side:THREE.DoubleSide}),tileD=M('#45322a',.85),whiteM=M('#f1ece0',.5),creamM=M('#e9dfc8',.7),
      glass=new THREE.MeshStandardMaterial({color:'#b9d6d2',roughness:.12,metalness:.1,transparent:true,opacity:.32,depthWrite:false}),
      warm=new THREE.MeshStandardMaterial({color:'#ffe2b2',emissive:'#ffbe72',emissiveIntensity:.8,roughness:.6}),
      gold=new THREE.MeshStandardMaterial({color:'#d2a85e',metalness:.75,roughness:.3,emissive:'#ffcf86',emissiveIntensity:.25}),
      leafM=['#2f6b3c','#3f7d45','#5b9150','#77a35a'].map(c=>M(c,.9)),flowerM=['#f2a7c3','#ffffff','#f6d36b','#e86f7f'].map(c=>M(c,.7));
    const P=(geo,m,x,y,z,p)=>{const o=new THREE.Mesh(geo,m);o.position.set(x,y,z);(p||g).add(o);return o};
    const box=(p,x,y,z,sx,sy,sz,m)=>P(new THREE.BoxGeometry(sx,sy,sz),m,x,y,z,p);
    const cyl=(p,x,y,z,r1,r2,h,m,seg=10)=>P(new THREE.CylinderGeometry(r1,r2,h,seg),m,x,y,z,p);
    const beam=(p,a,b,r,m)=>{const A=new THREE.Vector3(...a),B=new THREE.Vector3(...b),d=B.clone().sub(A);const o=new THREE.Mesh(new THREE.CylinderGeometry(r,r,d.length(),6),m);o.position.copy(A).add(B).multiplyScalar(.5);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());p.add(o);return o};
    // mái dốc bốn phía (mái hông): mép mái là hình chữ nhật, nóc chạy theo cạnh dài
    const hipRoof=(p,x0,x1,z0,z1,y,h,m)=>{const cx=(x0+x1)/2,cz=(z0+z1)/2,hx=(x1-x0)/2,hz=(z1-z0)/2;let r1,r2;if(hz>=hx){const d=hz-hx;r1=[cx,y+h,cz-d];r2=[cx,y+h,cz+d]}else{const d=hx-hz;r1=[cx-d,y+h,cz];r2=[cx+d,y+h,cz]}
      const A=[x0,y,z0],B=[x1,y,z0],C=[x1,y,z1],D=[x0,y,z1],T=hz>=hx?[A,D,r2, A,r2,r1, C,B,r1, C,r1,r2, B,A,r1, D,C,r2]:[A,B,r2, A,r2,r1, C,D,r1, C,r1,r2, D,A,r1, B,C,r2];
      const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(T.flat(),3));geo.computeVertexNormals();const o=new THREE.Mesh(geo,m);p.add(o);
      box(p,cx,y-.06,cz,x1-x0,.12,z1-z0,darkW);/* mép và trần hiên gỗ */beam(p,r1,r2,.16,tileD);for(const c of [A,B,C,D])beam(p,c,hz>=hx?(c[2]<cz?r1:r2):(c[0]<cx?r1:r2),.11,tileD);return o};
    // ---- thân đảo: lưới cực tô màu cát / cát ướt / cỏ, có vành chìm dưới nước
    {const N=128,RS=[];for(let j=0;j<=30;j++)RS.push(Math.pow(j/30,.8));RS.push(1.03,1.07,1.12,1.25);const V=[],C=[],I=[],cSand=new THREE.Color('#ead9b0'),cWet=new THREE.Color('#cdb88d'),cSea=new THREE.Color('#b9ae8c'),cG1=new THREE.Color('#6f9a4f'),cG2=new THREE.Color('#4d7d3f'),c=new THREE.Color();
      for(let j=0;j<RS.length;j++){const r=RS[j];for(let i=0;i<N;i++){const a=i/N*Math.PI*2,R=tdR(a)*r,x=TD_O[0]+Math.cos(a)*R,z=TD_O[1]+Math.sin(a)*R,y=r>1.12?-2.6:tdTerrainY(x,z),se=tdSandEdge(a);V.push(x,y,z);
        if(r>1)c.copy(cSea);else if(r>se+.02)c.copy(cSand).lerp(cWet,baySm(.93,1,r));else if(r>se-.015)c.copy(cSand).lerp(cG1,.55);else c.copy(cG1).lerp(cG2,.5+.5*Math.sin(x*.13+z*.09)*Math.cos(z*.11-x*.05));C.push(c.r,c.g,c.b)}}
      for(let j=0;j<RS.length-1;j++)for(let i=0;i<N;i++){const a=j*N+i,b=j*N+(i+1)%N,cc=(j+1)*N+(i+1)%N,d=(j+1)*N+i;I.push(a,d,b,b,d,cc)}
      const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(V,3));geo.setAttribute('color',new THREE.Float32BufferAttribute(C,3));geo.setIndex(I);geo.computeVertexNormals();
      g.add(new THREE.Mesh(geo,new THREE.MeshStandardMaterial({vertexColors:true,roughness:1,side:THREE.DoubleSide})))}
    // ---- đá tảng: hai đầu bãi cát, hai sườn đảo, vài hòn trên bãi và dưới làn nước nông
    const rockG=new THREE.DodecahedronGeometry(1,1),rockMs=[M('#9a978d',.95),M('#868a82',.95),M('#aaa599',.95)];
    const rock=(x,z,s,k)=>{TD_COLL.push([x,z,s*1.15]);const o=P(rockG,rockMs[k%3],x,tdTerrainY(x,z)+s*.25,z);o.scale.set(s*(1.2+.3*Math.sin(k)),s*(.7+.2*Math.cos(k*1.7)),s*(1+.25*Math.sin(k*2.3)));o.rotation.set(.3*k,.7*k,.2*k);return o};
    {let k=0;for(const [a0,a1,n] of [[1.72,2.35,9],[-2.35,-1.72,9],[.55,1.6,10],[-1.6,-.55,10]])for(let i=0;i<n;i++){const a=a0+(a1-a0)*(i+.5)/n+.05*Math.sin(i*3.1),rr=.93+.12*((i*7+3)%5)/4,R=tdR(a)*rr,x=TD_O[0]+Math.cos(a)*R,z=TD_O[1]+Math.sin(a)*R;
        if(tdInBuild(x,z,.5)||tdOnPaths(x,z,2.5))continue;const s=1.4+1.6*((i*5+k)%4)/3;rock(x,z,s,k++);if(i%2===0){const b=rock(x+Math.cos(a+1)*s*1.4,z+Math.sin(a+1)*s*1.4,s*.6,k++)}}
      for(const [x,z,s] of [[-28,-30,1.6],[-36,-24,1.1],[-25,33,1.4],[-37,29,.9],[-44,-14,1.3],[-46,16,1.5],[-42,30,1.2],[-41,-31,1.6]])rock(x,z,s,k++);
      for(const [x,z,s] of [[-8,-8,1.2],[-9,8.5,1.1],[-12,-10,.8],[-11,10.5,.7]])rock(x,z,s,k++)}/* đá cảnh hai bên lối lên nhà */
    // ---- cầu tàu gỗ (giữ nguyên chỗ du thuyền cập), lan can dây, đèn lồng
    const pier=new THREE.Group();g.add(pier);const X0=-TU_DAO.r-15,X1=-TU_DAO.r+4;/* cầu tàu 19 m */
    for(let x=X0,i=0;x<X1;x+=1.1,i++)box(pier,x+.55,1.85,0,1.0,.3,5,i%3===0?woodL:wood);
    for(let i=0;i<6;i++)box(pier,X1+.5+i,1.7-i*.25,0,1.0,.25,4.4,i%2?woodL:wood);/* ván dốc xuống bãi */
    for(let x=X0;x<=X1;x+=5.5)for(const s of [-1,1]){cyl(pier,x,-1,s*2.6,.35,.4,6,darkW,7);cyl(pier,x,2.9,s*2.45,.12,.14,1.9,darkW,6)}
    const rope=M('#c9b48a');for(const s of [-1,1])for(let x=X0;x<X1-5.4;x+=5.5){beam(pier,[x,3.55,s*2.45],[x+5.5,3.55,s*2.45],.05,rope);beam(pier,[x,2.85,s*2.45],[x+5.5,2.85,s*2.45],.04,rope)}
    for(let x=X0+2.75;x<X1;x+=11)for(const s of [-1,1]){const lg=new THREE.Group();lg.position.set(x,3.0,s*2.45);lg.scale.setScalar(.9);pier.add(lg);box(lg,0,.95,0,.34,.36,.34,gold);const cp=P(new THREE.ConeGeometry(.28,.2,4),darkW,0,1.23,0,lg);cp.rotation.y=Math.PI/4}
    // ---- lối lát đá thẳng từ cầu tàu tới chân bậc: phiến đá chữ nhật nằm ngang lối, viền đá nhỏ hai bên
    const pathG=new THREE.Group();g.add(pathG);
    {const sl=[stoneL,M('#bdb39d',.9),M('#d4cbb6',.9)];let k=0;for(let x=TD_PIER_START[0]+5.6;x<TD_STEP[0]+.6;x+=1.15){const o=box(pathG,x,tdGroundY(x,0)+.06,0,.95,.16,3.3,sl[k%3]);o.rotation.y=.015*Math.sin(k*2.1);k++}}
    // lối đá bước cong sang phòng thiền và chòi ngắm biển
    // lối sang Nhà Thiền: một hàng đá lát bát giác lớn đặt so le như ảnh mẫu; lối sang chòi giữ đá bước đôi
    {const ocG=new THREE.CylinderGeometry(.74,.8,.18,8),ocM=[M('#c9c4b9',.9),M('#b9b3a7',.92)];let k=0;const L=TD_LEFT;
      for(let i=1;i<L.length;i++){const [ax,az]=L[i-1],[bx,bz]=L[i],d=Math.hypot(bx-ax,bz-az),nx=-(bz-az)/d,nz=(bx-ax)/d;
        for(let t=.6;t<d;t+=1.7){const s=.38*Math.sin(k*2.2),xx=ax+(bx-ax)*t/d+nx*s,zz=az+(bz-az)*t/d+nz*s;const o=P(ocG,ocM[k%2],xx,tdTerrainY(xx,zz)+.06,zz,pathG);o.rotation.y=k*.37;o.scale.setScalar(.92+.12*Math.cos(k*1.7));k++}}}
    {const stG=new THREE.CylinderGeometry(.62,.68,.14,7);let k=0;for(const L of [TD_RIGHT]){for(let i=1;i<L.length;i++){const [ax,az]=L[i-1],[bx,bz]=L[i],d=Math.hypot(bx-ax,bz-az),nx=-(bz-az)/d,nz=(bx-ax)/d;
        for(let t=.5;t<d;t+=1.15){const x=ax+(bx-ax)*t/d,z=az+(bz-az)*t/d;for(const s of [-.55,.55]){const xx=x+nx*s,zz=z+nz*s;const o=P(stG,k%2?stoneL:M('#bfb5a0',.9),xx,tdTerrainY(xx,zz)+.05,zz,pathG);o.rotation.y=k*1.3;o.scale.set(.85+.2*Math.sin(k),1,.75+.2*Math.cos(k));k++}}}}}
    // ---- nhà chính: nền đá ốp, sàn gỗ, hiên trước, tường kính khung gỗ, cửa đôi, mái ngói nâu bốn mái, bậc đá rộng
    const house=new THREE.Group();g.add(house);const FY=TD_FY,hx0=TD_H.x0,hx1=TD_H.x1,hz=TD_H.z;
    {const base=TD_SBOT-1.6;box(house,(hx0+hx1)/2,(FY+base)/2-.1,0,hx1-hx0,FY-base-.2,hz*2,stone);box(house,(hx0+hx1)/2,FY-.17,0,hx1-hx0+.25,.14,hz*2+.25,stoneD);
      box(house,(hx0+hx1)/2,FY-.05,0,hx1-hx0+.1,.12,hz*2+.1,woodL);for(let z=-hz+.3;z<hz;z+=.55)box(house,(hx0+hx1)/2,FY+.015,z,hx1-hx0,.012,.03,darkW)}
    const gx0=1.2,gx1=12.4,gz=7.8,WH=3.3;/* khối nhà kính */
    box(house,(gx0+gx1)/2,FY+WH/2,0,gx1-gx0,WH,gz*2,glass);box(house,(gx0+gx1)/2,FY+WH-.08,0,gx1-gx0-.2,.14,gz*2-.2,woodL);/* tường kính, trần gỗ */
    {/* bên trong nhìn qua kính: vách sau ấm sáng, phòng khách (sofa, bàn trà, thảm, đèn), bàn ăn, kệ sách, cây lớn */
      box(house,gx1-.35,FY+WH/2,0,.2,WH-.2,gz*2-.4,warm);for(const z of [-4.2,0,4.2])box(house,gx1-.5,FY+WH/2,z,.08,WH-.3,.12,darkW);
      box(house,6,FY+.03,-2,5.2,.04,4.2,M('#cdbb99',.95));box(house,9.6,FY+.45,-2,.9,.6,4,creamM);box(house,9.95,FY+.95,-2,.3,.7,4,creamM);for(const s2 of [-1,1])box(house,7.6,FY+.45,-2+s2*2.4,2.4,.6,.9,creamM);
      box(house,6.6,FY+.38,-2,1.6,.12,1.1,woodL);cyl(house,9.4,FY+1.1,-4.6,.05,.05,2.2,darkW,6);P(new THREE.CylinderGeometry(.28,.36,.4,12,1,true),warm,9.4,FY+2.2,-4.6,house);
      box(house,6.5,FY+.78,4.4,2.6,.08,1.3,wood);for(const s2 of [-1,1])for(const x of [5.7,7.3])box(house,x,FY+.42,4.4+s2*.95,.45,.84,.45,woodL);
      for(const x of [5.5,7.5])P(new THREE.SphereGeometry(.22,10,8),warm,x,FY+2.6,4.4,house);box(house,11.6,FY+1.3,5.6,.4,2.4,2.2,wood);
      cyl(house,3,FY+.3,-6.6,.34,.28,.6,creamM,12);{const pl=P(new THREE.IcosahedronGeometry(.75,1),leafM[0],3,FY+1.35,-6.6,house);pl.scale.set(1,1.6,1)}}
    for(let z=-gz;z<=gz+.01;z+=gz/3)box(house,gx0,FY+WH/2,z,.16,WH,.16,wood);for(let x=gx0;x<=gx1+.01;x+=(gx1-gx0)/4)for(const s of [-1,1])box(house,x,FY+WH/2,s*gz,.16,WH,.16,wood);
    for(const s of [-1,1])box(house,gx1,FY+WH/2,s*gz*.5,.16,WH,.16,wood);
    box(house,gx0,FY+WH,0,.22,.22,gz*2+.2,wood);box(house,gx0,FY+.08,0,.2,.16,gz*2,wood);for(const s of [-1,1])box(house,(gx0+gx1)/2,FY+WH,s*gz,gx1-gx0,.22,.22,wood);
    {/* cửa đôi giữa mặt tiền */box(house,gx0-.04,FY+1.25,0,.14,2.5,.14,darkW);for(const s of [-1,1])box(house,gx0-.04,FY+1.25,s*1.35,.16,2.5,.16,darkW);box(house,gx0-.04,FY+2.55,0,.18,.16,2.9,darkW);for(const s of [-1,1])box(house,gx0-.1,FY+1.2,s*.25,.06,.32,.06,gold)}
    {/* hiên trước: cột gỗ đỡ mái đua, chậu cây trắng hai bên cửa, đôi ghế dài */for(let z=-hz+.6;z<=hz-.5;z+=(hz*2-1.1)/4)if(Math.abs(z)>1.5)cyl(house,hx0+.45,FY+WH/2+.15,z,.14,.16,WH+.3,wood,8);/* bỏ cột giữa trước cửa cho thoáng lối vào */
      for(const s of [-1,1]){cyl(house,-.2,FY+.4,s*2.3,.42,.32,.8,whiteM,12);const pl=P(new THREE.IcosahedronGeometry(.62,1),leafM[1],-.2,FY+1.25,s*2.3,house);pl.scale.set(1,1.15,1);
        box(house,.1,FY+.42,s*6,.8,.4,2.6,creamM);box(house,.45,FY+.75,s*6,.18,.5,2.6,creamM);cyl(house,-.5,FY+.55,s*4.3,.03,.03,1.1,darkW,6);box(house,-.5,FY+1.15,s*4.3,.28,.32,.28,warm)}}
    hipRoof(house,hx0-1.3,hx1+1.3,-hz-1.3,hz+1.3,FY+WH+.25,3.1,tile);
    {/* bậc đá rộng từ hiên xuống, gờ đá hai bên, bụi hoa hai bên chân bậc */const n=Math.max(3,Math.ceil((FY-TD_SBOT)/.17)),W=6.6;
      for(let i=0;i<n;i++){const top=FY-(i+1)*(FY-TD_SBOT)/n,x=hx0-(i+.5)*TD_SR/n,hgt=top-(TD_SBOT-.8);box(house,x,top-hgt/2+.02,0,TD_SR/n+.03,hgt,W,i%2?stoneL:M('#d2c9b4',.9))}
      for(const s of [-1,1]){const cheek=box(house,hx0-TD_SR/2,(FY+TD_SBOT)/2-.1,s*(W/2+.3),TD_SR+.2,.6,.6,stoneD);cheek.rotation.z=Math.atan2(FY-TD_SBOT,TD_SR);cheek.scale.x=Math.hypot(TD_SR,FY-TD_SBOT)/TD_SR}}
    // ---- Nhà Thiền (bên trái), dựng lại theo ảnh mẫu 25/11: bệ đá xám cao có ba bậc cấp rộng, sàn gỗ ấm chừa viền hiên quanh nhà, khung cột gỗ nâu sẫm;
    // mặt tiền: cửa kính đôi tay nắm đồng ở giữa, hai cánh song gỗ hai bên, kính ở hai góc; hai hông vách kính khung gỗ; vách sau kem ấm treo tranh trăng tròn.
    // Nhìn qua kính: bàn trà thấp có bonsai và bộ ấm, hai bồ đoàn trên chiếu, kệ gốm bên trái, đèn giấy đứng bên phải, bàn thờ thấp tượng Phật nhỏ.
    // Mái gỗ bốn mái thấp, đua rộng, viền gỗ dày, lằn ván; đèn lồng giấy treo ở góc mái trước bên trái.
    const med=new THREE.Group();med.position.set(TD_MED.x,0,TD_MED.z);g.add(med);
    {const Y=TD_MY,h=TD_MED.h,w=h-.6,H=2.9,base=Y-2.4,TB=Y+H-.45/* thanh ngang trên (ô kính đầu cửa) */;
      const plinth=M('#9e9a92',.95),plinthTop=M('#b6b1a7',.9),deck=M('#b8743f',.7),frame=M('#5a3622',.75),stepM=[M('#c2beb5',.92),M('#b0aca3',.92)],
        roofM=M('#8a583b',.85,{flatShading:true,side:THREE.DoubleSide}),wallW=M('#f2e6cc',.9,{emissive:'#ffd9a0',emissiveIntensity:.35}),dkW=M('#3e2a1e',.8);
      // bệ đá, gờ đá, sàn gỗ có ván
      box(med,0,(Y-.14+base)/2,0,h*2,Y-.14-base,h*2,plinth);box(med,0,Y-.1,0,h*2+.12,.1,h*2+.12,plinthTop);
      box(med,0,Y-.02,0,w*2+.7,.1,w*2+.7,deck);for(let z=-w-.2;z<w+.3;z+=.45)box(med,0,Y+.033,z,w*2+.7,.008,.025,frame);
      // ba bậc đá rộng phía trước, mỗi bậc là một khối đá xám chồng thấp dần
      {const gb=tdTerrainY(TD_MED.x-h-1.3,TD_MED.z),rise=(Y-gb)/4;for(let i=0;i<3;i++){const top=Y-(i+1)*rise,hgt=top-gb+.6;box(med,-h-.3-i*.55,top-hgt/2,0,.6,hgt,3.6-i*.1,stepM[i%2])}}
      // khung: cột vuông bốn góc và giữa các ô, dầm trên, ngưỡng dưới, thanh ngang đầu ô kính
      const post=(x,z,s=.16)=>box(med,x,Y+H/2,z,s,H,s,frame);
      for(const x of [-w,w])for(const z of [-w,w])post(x,z,.22);
      for(const z of [-2.2,-1.1,1.1,2.2])post(-w,z);for(const s of [-1,1])for(const x of [-w/3,w/3])post(x,s*w);for(const s of [-1,1])post(w,s*w/2);
      for(const s of [-1,1]){box(med,0,Y+H,s*w,w*2+.3,.22,.24,frame);box(med,s*w,Y+H,0,.24,.22,w*2+.3,frame);
        box(med,0,Y+.07,s*w,w*2,.12,.14,frame);box(med,-w,TB,s*(w+1.1)/2,.1,.08,w-1.1,frame);box(med,0,TB,s*w,w*2,.08,.1,frame)}
      box(med,w,Y+.07,0,.14,.12,w*2,frame);
      // mặt tiền: kính góc, song gỗ, cửa kính đôi
      for(const s of [-1,1]){box(med,-w,Y+H/2,s*(w+2.2)/2,.04,H-.1,w-2.2,glass);
        const zc=s*1.65;box(med,-w+.01,Y+H/2,zc,.03,H-.1,1.1,M('#f4e7c9',.9,{emissive:'#ffd59a',emissiveIntensity:.45}));/* song gỗ trên nền giấy sáng ấm */
        for(let k=-4;k<=4;k++)box(med,-w-.04,(Y+.14+TB)/2,zc+k*.12,.04,TB-Y-.14,.035,frame);
        for(let y=Y+.45;y<TB-.1;y+=.42)box(med,-w-.05,y,zc,.05,.04,1.08,frame)}
      for(const s of [-1,1]){const zc=s*.55;box(med,-w+.02,Y+(TB-Y)/2,zc,.03,TB-Y-.1,1.0,glass);/* cánh kính */
        for(const k of [-.5,.5])box(med,-w-.03,Y+(TB-Y)/2,zc+k*.98,.06,TB-Y-.1,.07,frame);box(med,-w-.03,Y+.16,zc,.06,.12,1.0,frame);box(med,-w-.03,TB-.06,zc,.06,.08,1.0,frame);
        box(med,-w-.09,Y+1.15,s*.12,.04,.55,.04,gold)}/* tay nắm đồng dài */
      box(med,-w-.01,(TB+Y+H)/2,0,.03,Y+H-TB-.1,2.2,glass);
      med.userData.medDoor=true;
      // hai hông: vách kính khung gỗ; vách sau kem ấm
      for(const s of [-1,1])box(med,0,Y+H/2,s*w,w*2,H-.1,.04,glass);
      box(med,w-.04,Y+H/2,0,.1,H-.1,w*2-.1,wallW);for(const s of [-1,1])box(med,w-.1,Y+H/2,s*w*.5,.06,H-.1,.1,frame);
      {/* tranh trăng tròn: khung gỗ tròn, nền giấy ngà, vầng trăng, dáng núi mực */const mc=new THREE.Group();mc.position.set(w-.12,Y+1.85,0);med.add(mc);
        const ring=P(new THREE.TorusGeometry(.62,.05,8,32),frame,0,0,0,mc);ring.rotation.y=Math.PI/2;
        const disc=P(new THREE.CircleGeometry(.6,32),M('#efe3c6',.9,{emissive:'#ffe3b0',emissiveIntensity:.25}),-.01,0,0,mc);disc.rotation.y=-Math.PI/2;
        const moon=P(new THREE.CircleGeometry(.2,24),M('#f6d58c',.8,{emissive:'#ffcc70',emissiveIntensity:.6}),-.02,.18,-.12,mc);moon.rotation.y=-Math.PI/2;
        for(const [z,s2] of [[.12,.32],[-.2,.24]]){const m=P(new THREE.ConeGeometry(s2,s2*1.1,3),M('#6d6a62',.95),-.025,-.6+s2*.55+.18,z,mc);m.scale.z=.05;m.rotation.y=Math.PI/2}}
      // bàn thờ thấp sát vách sau, tượng Phật nhỏ trước tranh trăng, hai đèn nến
      box(med,w-.45,Y+.22,0,.55,.4,2.4,dkW);const bd=new THREE.Group();bd.position.set(w-.45,Y+.42,0);bd.scale.setScalar(.62);med.add(bd);
      cyl(bd,0,.12,0,.42,.46,.24,gold,16);P(new THREE.SphereGeometry(.36,16,12),gold,0,.45,0,bd).scale.set(1,.8,1.1);P(new THREE.SphereGeometry(.2,14,10),gold,0,.85,0,bd);P(new THREE.SphereGeometry(.17,14,10),gold,0,1.12,0,bd);P(new THREE.SphereGeometry(.07,8,6),gold,0,1.3,0,bd);
      for(const s of [-1,1]){cyl(med,w-.45,Y+.5,s*.9,.06,.06,.14,whiteM,8);P(new THREE.SphereGeometry(.06,8,6),warm,w-.45,Y+.62,s*.9,med)}
      // chiếu, bàn trà thấp, bonsai, bộ ấm, hai bồ đoàn
      box(med,-.2,Y+.045,0,3.2,.02,2.4,M('#cdbb8e',.95));
      box(med,.35,Y+.34,0,.85,.07,1.5,dkW);for(const a of [-1,1])for(const b of [-1,1])box(med,.35+a*.33,Y+.17,b*.65,.08,.32,.08,dkW);
      {const bx=.45,bz=-.35;box(med,bx,Y+.43,bz,.32,.12,.22,M('#3d4a52',.6));cyl(med,bx,Y+.6,bz,.025,.035,.3,M('#5b3b26'),6);
        for(const [dx,dy,dz,r] of [[0,.8,0,.17],[-.1,.7,.14,.12],[.06,.72,-.13,.11]]){const f=P(new THREE.SphereGeometry(r,10,7),leafM[0],bx+dx,Y+dy,bz+dz,med);f.scale.y=.6}}
      {const tea=M('#e7e0d2',.4);P(new THREE.SphereGeometry(.09,12,8),tea,.3,Y+.46,.25,med).scale.y=.8;for(const z of [.45,.55])cyl(med,.15,Y+.41,z-.1,.04,.035,.06,tea,10)}
      for(const s of [-1,1])cyl(med,-.55,Y+.13,s*.5,.3,.33,.18,M('#d8c49a',.95),18);
      // kệ gốm bên trái (góc trước), đèn giấy đứng bên phải
      {const kx=-w+.75,kz=-w+.28;for(const y of [.02,.55,1.08,1.6])box(med,kx,Y+y+.03,kz,1.1,.05,.36,frame);for(const s of [-1,1])box(med,kx+s*.53,Y+.85,kz,.05,1.7,.36,frame);
        const cer=['#7d8f86','#c9b28c','#4f5d63','#a9744e','#e7dfcf','#6e7c5d'].map(c=>M(c,.5));let k=0;for(const y of [.05,.58,1.11])for(const dx of [-.3,0,.3]){const c=cer[k++%6],r=.08+.03*(k%3);const v=P(new THREE.SphereGeometry(r,12,8),c,kx+dx,Y+y+.06+r*.9,kz,med);v.scale.y=1.1+.3*(k%2)}}
      {const lx=-w+.5,lz=w-.5;box(med,lx,Y+.35,lz,.06,.7,.06,frame);box(med,lx,Y+.9,lz,.38,.62,.38,warm);for(const y of [.6,1.2])box(med,lx,Y+y,lz,.42,.04,.42,frame)}
      // mái gỗ bốn mái thấp đua rộng, viền gỗ dày, lằn ván
      {const R=h+1.15,y0=Y+H+.2,rh=1.75;hipRoof(med,-R,R,-R,R,y0,rh,roofM);box(med,0,y0-.13,0,R*2-.1,.02,R*2-.1,M('#9a6a45',.85));/* trần hiên gỗ ấm dưới mái đua */
        for(const s of [-1,1]){box(med,0,y0-.02,s*R,R*2+.08,.26,.1,dkW);box(med,s*R,y0-.02,0,.1,.26,R*2+.08,dkW)}
        for(const t of [.18,.36,.54,.72]){const r=R*(1-t),y=y0+rh*t+.035;for(const [a,b] of [[[-r,y,-r],[r,y,-r]],[[r,y,-r],[r,y,r]],[[r,y,r],[-r,y,r]],[[-r,y,r],[-r,y,-r]]])beam(med,a,b,.025,dkW)}}
      // đèn lồng giấy treo ở góc mái trước bên trái
      {const lx=-h-.55,lz=-h-.55,ly=Y+H-.55;beam(med,[lx,Y+H+.25,lz],[lx,ly+.3,lz],.015,dkW);box(med,lx,ly,lz,.5,.42,.5,warm);for(const y of [-.23,.23])box(med,lx,ly+y,lz,.56,.05,.56,dkW);for(const a of [-1,1])for(const b of [-1,1])box(med,lx+a*.25,ly,lz+b*.25,.04,.44,.04,dkW)}}
    // ---- chòi ngắm biển (bên phải): bát giác trên cột cao, lan can, mái nón lá màu vàng nâu, bàn ghế, cầu thang về phía lối đá
    const gaz=new THREE.Group();gaz.position.set(TD_GAZ.x,0,TD_GAZ.z);g.add(gaz);
    {const Y=TD_GY,R=TD_GAZ.r;cyl(gaz,0,Y-.12,0,R+.25,R+.25,.26,woodL,8);
      for(let i=0;i<8;i++){const a=(i+.5)/8*Math.PI*2,x=Math.cos(a)*(R-.3),z=Math.sin(a)*(R-.3),gy=tdTerrainY(TD_GAZ.x+x,TD_GAZ.z+z);cyl(gaz,x,(Y+gy-.6)/2,z,.17,.2,Y-gy+.6,darkW,8);cyl(gaz,x,Y+1.7,z,.12,.12,3.4,wood,8)}
      for(let i=0;i<8;i++){const a=(i+.5)/8*Math.PI*2,b=(i+1.5)/8*Math.PI*2,gy=tdTerrainY(TD_GAZ.x+Math.cos(a)*(R-.3),TD_GAZ.z+Math.sin(a)*(R-.3)),gy2=tdTerrainY(TD_GAZ.x+Math.cos(b)*(R-.3),TD_GAZ.z+Math.sin(b)*(R-.3)),ym=Math.min(gy,gy2)+(Y-Math.min(gy,gy2))*.45;beam(gaz,[Math.cos(a)*(R-.3),ym,Math.sin(a)*(R-.3)],[Math.cos(b)*(R-.3),ym+.4,Math.sin(b)*(R-.3)],.07,wood)}/* giằng ngang giữa các cột chân */
      const sa=Math.atan2(TD_GDIR[1],TD_GDIR[0]);for(let i=0;i<8;i++){const a=i/8*Math.PI*2,b=(i+1)/8*Math.PI*2,m=(a+b)/2+Math.PI/8;if(Math.abs(Math.atan2(Math.sin(m-sa),Math.cos(m-sa)))<.4)continue;
        beam(gaz,[Math.cos(a+Math.PI/8)*(R-.3),Y+.95,Math.sin(a+Math.PI/8)*(R-.3)],[Math.cos(b+Math.PI/8)*(R-.3),Y+.95,Math.sin(b+Math.PI/8)*(R-.3)],.05,wood);
        for(let t=.2;t<1;t+=.2){const aa=a+Math.PI/8+(b-a)*t;cyl(gaz,Math.cos(aa)*(R-.3),Y+.5,Math.sin(aa)*(R-.3),.03,.03,.9,wood,5)}}
      const roof=P(new THREE.ConeGeometry(R+1.4,3.0,8),M('#a98a5f',.95,{flatShading:true}),0,Y+4.9,0,gaz);roof.rotation.y=Math.PI/8;cyl(gaz,0,Y+3.4,0,R+.1,R+.1,.14,wood,8);P(new THREE.SphereGeometry(.24,8,6),gold,0,Y+6.5,0,gaz);
      cyl(gaz,0,Y+.45,0,.75,.75,.07,woodL,16);cyl(gaz,0,Y+.22,0,.08,.12,.45,darkW,8);for(let k=0;k<4;k++){const a=k/4*Math.PI*2+.4;box(gaz,Math.cos(a)*1.5,Y+.25,Math.sin(a)*1.5,.6,.08,.6,creamM)}
      const st=new THREE.Group();st.position.set(Math.cos(sa)*R,0,Math.sin(sa)*R);st.rotation.y=-sa+Math.PI/2;gaz.add(st);const n=Math.ceil((Y-tdTerrainY(TD_GAZ_FOOT[0],TD_GAZ_FOOT[1]))/.2);
      for(let i=0;i<n;i++)box(st,0,Y-.1-(i+1)*(Y-tdTerrainY(TD_GAZ_FOOT[0],TD_GAZ_FOOT[1]))/n+.1,(i+.5)*TD_GRUN/n,1.6,.1,TD_GRUN/n+.05,woodL);
      for(const s of [-1,1]){const yb=tdTerrainY(TD_GAZ_FOOT[0],TD_GAZ_FOOT[1]);beam(st,[s*.85,Y+.9,0],[s*.85,yb+.9,TD_GRUN],.05,wood);beam(st,[s*.85,Y-.1,0],[s*.85,yb,TD_GRUN],.08,darkW);cyl(st,s*.85,yb+.45,TD_GRUN,.06,.06,.9,wood,6)}}
    // ---- bãi biển bên phải (phía chòi), giữa dải cát: hai ghế nằm gỗ nệm trắng quay ra biển, dù trắng che phía đầu ghế
    {const C=[-29.5,21.7],out=[-.866,.5],land=[.866,-.5],perp=[.5,.866],th=Math.atan2(-out[1],out[0]);TD_COLL.push([C[0],C[1],2.6],[C[0]+land[0]*1.4+perp[0]*2.2,C[1]+land[1]*1.4+perp[1]*2.2,.6]);
      for(const s2 of [-1,1]){const x=C[0]+perp[0]*1.15*s2,z=C[1]+perp[1]*1.15*s2,y=tdTerrainY(x,z),lg=new THREE.Group();lg.position.set(x,y,z);lg.rotation.y=th;g.add(lg);
        box(lg,0,.32,0,2.1,.1,.75,woodL);const bk=box(lg,-1.05,.62,0,.85,.1,.75,woodL);bk.rotation.z=-.85;box(lg,.15,.42,0,1.7,.1,.68,whiteM);for(const sx of [-.85,.85])for(const sz of [-.3,.3])cyl(lg,sx,.15,sz,.04,.04,.3,darkW,5)}
      const ux=C[0]+land[0]*.5,uz=C[1]+land[1]*.5,uy=tdTerrainY(ux,uz);cyl(g,ux,uy+1.35,uz,.05,.05,2.7,darkW,6);
      const um=P(new THREE.ConeGeometry(2.4,.75,14,1,true),M('#f7f3ea',.7,{side:THREE.DoubleSide}),ux,uy+2.65,uz);P(new THREE.SphereGeometry(.07,6,5),darkW,ux,uy+3.05,uz);
      box(g,C[0]+land[0]*1.4+perp[0]*2.2,tdTerrainY(C[0]+land[0]*1.4+perp[0]*2.2,C[1]+land[1]*1.4+perp[1]*2.2)+.25,C[1]+land[1]*1.4+perp[1]*2.2,.5,.45,.5,woodL)}
    // ---- cây: tán rộng nhiều cụm lá, dừa nghiêng ven bãi; bụi cây và bụi hoa dọc lối, quanh nhà
    const blobG=new THREE.IcosahedronGeometry(1,1),frondG=new THREE.ConeGeometry(.3,2.6,4);
    const okPlant=(x,z,pad)=>{const [r,a]=tdRho(x,z);return r<tdSandEdge(a)-.01&&!tdInBuild(x,z,pad)&&!tdOnPaths(x,z,pad+1.6)&&x<22};
    const tree=(x,z,s,k)=>{if(!okPlant(x,z,s*2.2))return;TD_COLL.push([x,z,.7*s]);const t=new THREE.Group();t.position.set(x,tdTerrainY(x,z)-.1,z);t.scale.setScalar(s);t.rotation.y=k*1.7;g.add(t);
      const tr=P(new THREE.CylinderGeometry(.22,.38,4.2,7),wood,.3,2.0,0,t);tr.rotation.z=-.12;beam(t,[.4,3.2,0],[1.4,4.3,.4],.13,wood);beam(t,[.2,3.0,0],[-.8,4.1,-.3],.12,wood);
      for(const [bx,by,bz,bs] of [[.5,5.0,0,1.6],[-.9,4.6,-.4,1.25],[1.6,4.6,.5,1.2],[.2,5.6,.8,1.1],[-.2,5.4,-.9,1.05],[1.1,5.5,-.6,1]]){const o=P(blobG,leafM[(k+(bx*10|0))&3],bx,by,bz,t);o.scale.set(bs*1.25,bs*.8,bs*1.15)}};
    const palm=(x,z,s,k)=>{if(!okPlant(x,z,1.4))return;TD_COLL.push([x,z,.5*s]);const t=new THREE.Group();t.position.set(x,tdTerrainY(x,z)-.1,z);t.scale.setScalar(s);t.rotation.y=k*2.1;g.add(t);const lean=.18+.08*Math.sin(k);
      const top=[Math.sin(lean)*5.4,5.4*Math.cos(lean),0];for(let i=0;i<5;i++){const a=[top[0]*i/5,top[1]*i/5,0],b=[top[0]*(i+1)/5,top[1]*(i+1)/5,0];beam(t,a,b,.2-.02*i,wood)}
      for(let j=0;j<9;j++){const a=j/9*Math.PI*2,f=P(frondG,leafM[j%4],top[0]+Math.cos(a)*1.1,top[1]-.2,Math.sin(a)*1.1,t);f.rotation.z=-Math.cos(a)*1.25;f.rotation.x=Math.sin(a)*1.25}P(new THREE.SphereGeometry(.32,8,6),darkW,top[0],top[1]-.1,0,t)};
    [[-14,-24,1.05],[2,-22,1.15],[-2,-38,.95],[12,-26,1.2],[18,-14,1],[16,16,1.05],[10,26,1.1],[-12,22,.9],[4,42,.9],[-16,-38,.85],[19,-34,.9],[20,30,.95],[-6,18,.8],[-4,-14,.75]].forEach(([x,z,s],k)=>tree(x,z,s*1.15,k));
    [[-24,-12,1],[-22,13,1.05],[-20,-30,.9],[-19,26,.95],[-27,-4.5,.85],[-27,5,.9],[-9,-44,.85],[-10,45,.8],[-30,-36,.8]].forEach(([x,z,s],k)=>palm(x,z,s*1.1,k));
    {let k=0;const bush=(x,z,s,fl,force)=>{if(!force&&!okPlant(x,z,.2))return;TD_COLL.push([x,z,.55*s]);const b=new THREE.Group();b.position.set(x,tdTerrainY(x,z),z);b.scale.setScalar(s);g.add(b);for(let i=0;i<5;i++){const q=i*2.4+k,o=P(blobG,leafM[(i+k)&3],Math.cos(q)*.45,.35+.12*Math.sin(i*3),Math.sin(q)*.45,b);o.scale.set(.6,.45,.55)}
        if(fl)for(let i=0;i<7;i++){const q=i*.9+k;P(new THREE.SphereGeometry(.12,6,5),flowerM[(k+i)%4],Math.cos(q)*.55,.7+.12*Math.sin(i*2),Math.sin(q)*.55,b)}k++};
      for(let x=TD_PIER_START[0]+9;x<TD_STEP[0]-.5;x+=2.6)for(const s of [-1,1]){const z=s*(2.9+.4*Math.sin(x)),xx=x;const [r,a]=tdRho(xx,z);if(r>tdSandEdge(a)-.02)continue;bush(xx,z,.95,k%3===0,true)}
      for(const s of [-1,1])for(const [x,z] of [[TD_STEP[0]+.3,s*4.6],[TD_STEP[0]+1.4,s*5.6],[-2.6,s*(TD_H.z-.2)],[-2.4,s*(TD_H.z-2.4)]])bush(x,z,1.15,true,true);
      for(let i=0;i<70;i++){const a=i*2.399,r=10+(i%13)*2.6,x=TD_O[0]-6+Math.cos(a)*r,z=Math.sin(a)*r*1.15;if(okPlant(x,z,.4))bush(x,z,.8+.4*((i*7)%5)/4,i%4===0)}}
    // ---- Hoạt động trên bãi: xếp đá cân bằng trên bãi cát trước Nhà Thiền (bãi trái), nhặt vỏ sò ở bãi phải cạnh Chòi ngắm cảnh
    {const sandAt=(x,z)=>{const [r,a]=tdRho(x,z);return r>tdSandEdge(a)+.04&&r<.95};
     const clear=(x,z,m)=>{if(!tdWalkable(x,z))return false;for(let k=0;k<8;k++){const a=k*Math.PI/4;if(!tdWalkable(x+Math.cos(a)*m,z+Math.sin(a)*m))return false}return true};
     let cs=null;for(let rr=0;rr<9&&!cs;rr+=1)for(let k=0;k<12&&!cs;k++){const x=-20+Math.cos(k*.52)*rr,z=-29+Math.sin(k*.52)*rr;if(sandAt(x,z)&&clear(x,z,2.2)&&tdSegD(x,z,TD_LEFT)>3)cs=[x,z]}
     if(!cs)cs=[-20,-29];
     const cg=new THREE.Group();cg.position.set(cs[0],tdTerrainY(cs[0],cs[1]),cs[1]);g.add(cg);const stoneG=new THREE.DodecahedronGeometry(1,1);
     const sm=['#8d8a80','#a39e92','#6f6c64','#b5ae9f','#7d7a71','#9a9488','#c2bba9','#857f74'].map(c=>new THREE.MeshStandardMaterial({color:c,roughness:.95,flatShading:true}));
     const base=new THREE.Mesh(stoneG,sm[2]);base.scale.set(.8,.24,.65);base.position.y=.1;cg.add(base);
     const pile=[];for(let i=0;i<7;i++){const m=new THREE.Mesh(stoneG,sm[i]),sc=.36-i*.035,a=i*2.3;m.scale.set(sc,sc*.42,sc*.85);m.position.set(1.15+Math.cos(a)*.38,sc*.36,.25+Math.sin(a)*.38);m.rotation.y=a;m.userData.home=m.position.clone();m.userData.homeR=a;cg.add(m);pile.push(m)}
     /* 3.41 bỏ tháp đá cũ nhưng quên gán TD_ACT.cairn nên nút Xếp đá không chạy; nay giữ đống đá để tự xếp, đặt lại chỗ sau khi dựng Vườn đá */
     // ---- Vườn đá cân bằng trên bãi trái gần Nhà Thiền: bộ 36 viên ST01–ST36 (mỗi viên một model: kích thước, dáng, vân riêng), dùng lại cho 5 tác phẩm
     {const S=.03;/* 1 cm ngoài đời = 3 cm trong cảnh để nhìn rõ trên điện thoại */
      const ST=[[28,20,12,'#bcb7ac','spk','#2e2c28'],[26,18,11,'#c99f68','spk','#6a4a2a'],[24,17,10,'#8b8a84','vein','#ece6d8'],[22,16,10,'#d28a48','band','#f4ecdc'],[20,14,9,'#dcd6ca','spk','#1e1c1a'],[19,13,8,'#9c9a76','pore','#6e6c50'],[18,12,8,'#d8c39e','plain',''],[17,12,7,'#5f5f5d','pore','#3a3a38'],[16,11,7,'#7c8a5e','vein','#d8dcc0'],
        [16,11,7,'#dacb9e','spk','#3a3226'],[15,10,6,'#7b8a4c','vein','#e8e2b0'],[14,10,6,'#eee8dc','vein','#c9a46a'],[14,9,5,'#8d8d87','plain',''],[13,9,5,'#a8623c','pore','#6a3a20'],[13,8,5,'#e3d5b2','plain',''],[12,8,5,'#5b5b59','vein','#e0ddd4'],[12,7,5,'#b6ab99','plain',''],[12,7,5,'#dacfba','plain',''],
        [11,7,4,'#b9b1a2','spk','#7a7266'],[11,7,4,'#a8432f','vein','#f2e6dc'],[10,6,4,'#d79c4a','plain',''],[10,6,4,'#e7ddc6','plain',''],[9,6,4,'#8b9169','plain',''],[9,6,3.5,'#a98b8f','spk','#7a5e62'],[9,5,3.5,'#9b9b99','plain',''],[8.5,5,3.5,'#bba962','spk','#2e2a18'],[8,5,3.5,'#e3d0a9','plain',''],
        [8,5,3.5,'#8b6b4b','plain',''],[7,4.5,3,'#e1d5c1','spk','#7a6a50'],[7,4.5,3,'#6f6f6b','spk','#e6e2d8'],[6.5,4,3,'#7f8159','plain',''],[6,4,2.8,'#d9a96a','spk','#6a4220'],[5.5,4.5,2.5,'#e9e1d1','plain',''],[5,3.5,2.5,'#d9a952','spk','#7a5420'],[5,3.4,2.3,'#5d5b51','spk','#c8c2b0'],[4.5,3,2,'#4b4b49','plain','']];
      const stTex=(i)=>{const [,,,base,pat,pc]=ST[i],cv=document.createElement('canvas');cv.width=cv.height=64;const c=cv.getContext('2d');c.fillStyle=base;c.fillRect(0,0,64,64);let sd=i*97+13;const rnd=()=>(sd=(sd*16807)%2147483647)/2147483647;
        for(let k=0;k<70;k++){c.fillStyle='rgba('+(rnd()<.5?'255,250,240,':'40,30,20,')+(.04+rnd()*.06)+')';c.fillRect(rnd()*64,rnd()*64,2+rnd()*5,1+rnd()*3)}
        if(pat==='spk')for(let k=0;k<90;k++){c.fillStyle=pc;c.globalAlpha=.5+rnd()*.5;c.beginPath();c.arc(rnd()*64,rnd()*64,.5+rnd()*1.6,0,7);c.fill()}
        if(pat==='pore')for(let k=0;k<60;k++){c.fillStyle=pc;c.globalAlpha=.35+rnd()*.4;c.beginPath();c.arc(rnd()*64,rnd()*64,.8+rnd()*1.4,0,7);c.fill()}
        if(pat==='vein'){c.strokeStyle=pc;for(let k=0;k<3;k++){c.globalAlpha=.55+rnd()*.35;c.lineWidth=.6+rnd()*1.2;c.beginPath();c.moveTo(rnd()*64,0);c.bezierCurveTo(rnd()*64,20,rnd()*64,44,rnd()*64,64);c.stroke()}}
        if(pat==='band'){c.globalAlpha=.9;c.fillStyle=pc;c.fillRect(26,0,7,64)}
        c.globalAlpha=1;const t=new THREE.CanvasTexture(cv);t.colorSpace=THREE.SRGBColorSpace;return t};
      const stCache=[];const stone=(id,asym)=>{const i=id-1;if(!stCache[i]){const [w,d,h]=ST[i],geo=new THREE.IcosahedronGeometry(1,2),p=geo.attributes.position,v=new THREE.Vector3(),s1=i*1.37+.4,s2=i*.71+1.1;
          for(let k=0;k<p.count;k++){v.fromBufferAttribute(p,k).normalize();const n=1+.07*Math.sin(v.x*3.1+s1)*Math.cos(v.z*2.6+s2)+.04*Math.sin(v.y*5+s1*2)+(asym?.16*Math.max(0,v.x)*(.6+.4*Math.sin(s2)):0);v.multiplyScalar(n);v.y=Math.sign(v.y)*Math.pow(Math.abs(v.y),.78);p.setXYZ(k,v.x*w/2*S,v.y*h/2*S,v.z*d/2*S)}
          geo.computeVertexNormals();stCache[i]={geo,mat:new THREE.MeshStandardMaterial({map:stTex(i),roughness:.82})}}
        const m=new THREE.Mesh(stCache[i].geo,stCache[i].mat);m.userData.stone='ST'+String(id).padStart(2,'0');return m};
      const sg=new THREE.Group();g.add(sg);const bb=new THREE.Box3();
      const boulder=(x,z,sx,sy,sz,k)=>{const y=tdTerrainY(x,z),o=P(rockG,M(['#8f8a80','#9d968a'][k%2],.95),x,y+sy*.55,z,sg);o.scale.set(sx,sy,sz);o.rotation.set(0,k*.9,0);o.updateMatrixWorld();bb.setFromObject(o,true);return bb.max.y-.04};
      const ray=new THREE.Raycaster(),down=new THREE.Vector3(0,-1,0),up=new THREE.Vector3(0,1,0),from=new THREE.Vector3();const stack=(ids,x,z,y0,o={})=>{let y=y0,prev=null;ids.forEach((id,k)=>{const m=stone(id,o.asym);m.rotation.set(o.tilt?o.tilt[k%o.tilt.length]*.8:0,(k*1.9+x)%6.28,o.tilt?o.tilt[k%o.tilt.length]:(k%2?.05:-.04));const dx=(o.dx?o.dx[k%o.dx.length]:0);if(prev){/* tựa đúng mặt viên bên dưới tại trục tháp, không lơ lửng */sg.updateMatrixWorld();from.set(x+dx,y+2,z);sg.localToWorld(from);ray.set(from,down);const h=ray.intersectObject(prev,false)[0];if(h){const v=h.point.clone();sg.worldToLocal(v);y=v.y}}m.position.set(x+dx,y+1,z);sg.add(m);m.updateMatrixWorld();bb.setFromObject(m,true);m.position.y+=y-bb.min.y-.012;if(prev){m.updateMatrixWorld();sg.updateMatrixWorld();from.set(x+dx,y-3,z);sg.localToWorld(from);ray.set(from,up);const h=ray.intersectObject(m,false)[0];if(h){const v=h.point.clone();sg.worldToLocal(v);m.position.y+=y-v.y-.01}}m.updateMatrixWorld();bb.setFromObject(m,true);y=bb.max.y-.008;prev=m});return y};
      const a0=-2.05,se0=tdSandEdge(a0),spot=(t,u)=>{const a=a0+t/(.86*tdR(a0)),se=tdSandEdge(a),r=(se+(1-se)*u)*tdR(a);return [TD_O[0]+Math.cos(a)*r,TD_O[1]+Math.sin(a)*r]};
      const find=(t,need)=>{for(const u of [.38,.3,.46,.24,.54])for(const dt of [0,1,-1,2,-2,3,-3]){const [x,z]=spot(t+dt,u);if(sandAt(x,z)&&clear(x,z,need))return [x,z]}return spot(t,.38)};
      const tag=(name,fromIdx)=>{for(let k=fromIdx;k<sg.children.length;k++)sg.children[k].userData.stoneArt=name};
      const ARTS=[];
      // (1) Tháp đá cân bằng · 6 viên: Đ01 (đế) Đ02 Đ06 Đ15 Đ22 Đ28 (đỉnh)
      {const n0=sg.children.length,[x,z]=find(-8,.9);stack([1,2,6,15,22,28],x,z,tdTerrainY(x,z));tag('Tháp đá cân bằng · 6 viên',n0);ARTS.push(['tower',x,z]);TD_COLL.push([x,z,.6])}
      // (2) Đá cân bằng nghệ thuật · 7 viên bất đối xứng trên tảng đá
      {const n0=sg.children.length,[x,z]=find(-4,1.2),top=boulder(x,z,.72,.42,.6,1);stack([4,12,3,13,21,31,29],x,z,top,{asym:true,tilt:[.95,-.35,.45,-.3,.25,-.2,.15],dx:[0,.04,-.05,.03,-.02,.02,0]});tag('Đá cân bằng nghệ thuật · 7 viên',n0);ARTS.push(['art',x,z]);TD_COLL.push([x,z,1.2])}
      // (3) Vòng tròn đá thiền · 10 viên đồng tâm có đá tâm, cát cào thành vòng
      {const n0=sg.children.length,[x,z]=find(1,2.1),y0=tdTerrainY(x,z);
        const rg=[];for(let r=.3;r<=1.62;r+=.22){const ring=new THREE.RingGeometry(r-.025,r+.025,56,1).rotateX(-Math.PI/2),p=ring.attributes.position;for(let k=0;k<p.count;k++)p.setY(k,tdTerrainY(x+p.getX(k),z+p.getZ(k))-y0+.012);rg.push(ring)}
        for(const ring of rg){const o=new THREE.Mesh(ring,new THREE.MeshBasicMaterial({color:'#b89f72',transparent:true,opacity:.45,depthWrite:false}));o.position.set(x,y0,z);sg.add(o)}
        stack([5],x,z,y0);[[10,0],[20,1],[11,2],[16,3]].forEach(([id,k])=>{const a=k/4*Math.PI*2+.4,px=x+Math.cos(a)*.55,pz=z+Math.sin(a)*.55;stack([id],px,pz,tdTerrainY(px,pz))});
        [19,23,26,32,34].forEach((id,k)=>{const a=k/5*Math.PI*2,px=x+Math.cos(a)*1.05,pz=z+Math.sin(a)*1.05;stack([id],px,pz,tdTerrainY(px,pz))});tag('Vòng tròn đá thiền · 10 viên',n0);ARTS.push(['circle',x,z]);TD_COLL.push([x,z,1.3])}
      // (4) Con đường đá cân bằng · 7 viên, 3 cụm 3–2–2 dọc bãi
      {const n0=sg.children.length,[x,z]=find(5.5,1),a=a0+5.5/(.86*tdR(a0)),tx=-Math.sin(a),tz=Math.cos(a);[[[7,9,14],-1.3],[[17,24],0],[[27,33],1.2]].forEach(([ids,o])=>{const px=x+tx*o,pz=z+tz*o;stack(ids,px,pz,tdTerrainY(px,pz));TD_COLL.push([px,pz,.45])});tag('Con đường đá cân bằng · 7 viên',n0);ARTS.push(['path',x,z])}
      // (5) Tác phẩm đá trên nền đá tự nhiên · 6 viên, điểm nhận diện của bãi
      {const n0=sg.children.length,[x,z]=find(9.5,1.2),top=boulder(x,z,.85,.45,.7,0);stack([8,18,25,30,35,36],x,z,top,{dx:[0,.02,-.02,.015,-.01,0]});tag('Tác phẩm đá trên nền đá tự nhiên · 6 viên',n0);ARTS.push(['base',x,z]);TD_COLL.push([x,z,1.3])}
      TD_ACT.stoneArts=ARTS}
     /* đống đá để tự xếp: tránh 5 tác phẩm của Vườn đá, gần bãi trước Nhà Thiền */
     {const arts=TD_ACT.stoneArts||[],far=(x,z)=>arts.every(q=>Math.hypot(q[1]-x,q[2]-z)>2.8);let p=null;
      for(let rr=0;rr<16&&!p;rr++)for(let k=0;k<16&&!p;k++){const x=cs[0]+Math.cos(k*.393)*rr,z=cs[1]+Math.sin(k*.393)*rr;if(sandAt(x,z)&&clear(x,z,1.6)&&far(x,z))p=[x,z]}
      if(p)cg.position.set(p[0],tdTerrainY(p[0],p[1]),p[1]);
      const hit=new THREE.Mesh(SH_HIT_G,SH_HIT_M);hit.scale.set(1.5,.8,1.3);hit.position.set(.55,.3,.1);cg.add(hit);
      TD_ACT.cairn={g:cg,x:cg.position.x,z:cg.position.z,pile,n:0,h:.3,anim:null};TD_COLL.push([cg.position.x,cg.position.z,.7])}
     TD_ACT.g=g;TD_ACT.clear=clear;const hitM=SH_HIT_M;
     /* 3 mẫu Khay / Giỏ đặt sẵn trên bãi cạnh Chòi ngắm cảnh */
     /* cả 3 đồ đựng đặt chung một chỗ: một tấm chiếu cói nhỏ trên bãi cát cạnh Chòi ngắm cảnh */
     let st=null;for(let d=0;d<40&&!st;d++){const a=(124+(d%2?1:-1)*Math.ceil(d/2)*2)*Math.PI/180,e=tdSandEdge(a)+.12,R=tdR(a)*(e+.12),x=TD_O[0]+Math.cos(a)*R,z=TD_O[1]+Math.sin(a)*R;if(sandAt(x,z)&&clear(x,z,1.7))st=[x,z,a]}
     if(!st){const a=124*Math.PI/180,R=tdR(a)*(tdSandEdge(a)+.24);st=[TD_O[0]+Math.cos(a)*R,TD_O[1]+Math.sin(a)*R,a]}
     {const mat=new THREE.Mesh(new THREE.CircleGeometry(1.25,24),new THREE.MeshStandardMaterial({color:'#c9a56a',roughness:1}));mat.rotation.x=-Math.PI/2;mat.position.set(st[0],tdTerrainY(st[0],st[1])+.02,st[1]);mat.scale.y=.7;mat.rotation.z=st[2];g.add(mat);mat.userData.binMat=true;TD_ACT.stationMat=mat}
     TD_ACT.station={x:st[0],z:st[1],a:st[2]};const tx=-Math.sin(st[2]),tz=Math.cos(st[2]);/* xếp theo hàng dọc bờ biển */
     for(let bi=0;bi<3;bi++){const o=(bi-1)*.78,x=st[0]+tx*o,z=st[1]+tz*o;
       const k=TD_ACT.bins.length,bg=buildBin(k).g;bg.position.set(x,tdTerrainY(x,z),z);bg.rotation.y=k*1.3;const hit=new THREE.Mesh(SH_HIT_G,hitM);hit.scale.setScalar(1.1);hit.position.y=.25;bg.add(hit);g.add(bg);TD_ACT.bins.push({x,z,g:bg,items:[],home:bg.position.clone(),homeR:bg.rotation.y})}}
    g.traverse(o=>{if(!o.isMesh)return;let p=o,tag='island';while(p&&p!==g){if(p===house){tag='house';break}if(p===pier){tag='pier';break}if(p.userData&&p.userData.medDoor){tag='med';break}p=p.parent}o.userData.tuDao=tag});
    if(TD_ACT.cairn)TD_ACT.cairn.g.traverse(o=>{o.userData.tuDao='cairn'});TD_ACT.bins.forEach((q,k)=>q.g.traverse(o=>{o.userData.tuDao='bin';o.userData.bin=k}));if(TD_ACT.stationMat){TD_ACT.stationMat.userData.tuDao='bin';TD_ACT.stationMat.userData.bin=-1}
    bayGroup.add(g);TU_DAO.group=g;bayExtraRocks.push([TU_DAO.x+20,TU_DAO.z,50],[TU_DAO.x-16,TU_DAO.z-32,20],[TU_DAO.x-16,TU_DAO.z+32,20])/* chừa lối vào cầu tàu ngắn ở giữa bờ tây (x≈-44) */}
  // Bấm cầu tàu / đảo / nhà: tàu cập cầu tàu (nếu đang ở xa thì đi tới trước), rồi bước lên đảo.
  // Tạm thời không gian trên đảo dùng chung không gian Tư Gia. Lưu tàu ở cầu tàu, nên tắt đột xuất hay rời đi thì lần sau vào vịnh vẫn đứng ở cầu tàu.
  let tuDaoPending=null;const TU_DAO_SPOTS={pier:'Cầu tàu',island:'Bãi đảo',house:'Nhà nghỉ trên đảo',med:'Nhà Thiền'};
  // ---- Tạm lưu trạng thái thuyền trên vịnh khi xuống đảo; bấm Về tàu thì nạp lại đúng như cũ ----
  // tdTrip: chuyến đang đi (tour và điểm dừng, hoặc điểm đến) ngay trước khi rẽ vào Đảo Yên. tdSnap: ảnh chụp lúc bước xuống đảo
  // (vị trí, hướng, tốc độ x1/x5, góc nhìn, độ zoom, hướng nhìn, chuyến đang đi). Lưu cả trên máy để tải lại trang vẫn còn.
  let tdTrip=null,tdSnap=null;const TD_SNAP_KEY='yen_bay_island_snap';
  try{tdSnap=JSON.parse(localStorage.getItem(TD_SNAP_KEY)||'null')}catch(e){}
  function tdTripMemo(){const S=bayShip,T=bayTour||bayPause?.tour,D=S.dest||bayPause?.dest;
    if(T)tdTrip={tour:T.tour.id,stops:T.stops.map(s=>s.landmark),idx:T.idx};else if(D&&D.label!=='Đảo Yên của bạn')tdTrip={dest:{x:D.x,z:D.z,label:D.label,bow:!!D.bow}};else if(!S.path.length)tdTrip=null}
  function tdSnapTake(){if(!tdTrip)tdTripMemo();const S=bayShip;tdSnap={x:S.x,z:S.z,heading:S.heading,mult:bayMult(),view:bayView,farZoom:bayFarZoom,zoomBack:bayZoomBack,zoom:bayZoom,viewYaw,trip:tdTrip,t:Date.now()};tdTrip=null;
    try{localStorage.setItem(TD_SNAP_KEY,JSON.stringify(tdSnap))}catch(e){}}
  function tdSnapDrop(){tdSnap=null;try{localStorage.removeItem(TD_SNAP_KEY)}catch(e){}}
  // Nạp lại chuyến đã lưu: tàu đứng chờ ở cầu tàu (⏸), bấm ▶ Đi tiếp để chạy tiếp đúng tour / điểm đến cũ
  function tdTripResume(trip){if(!trip||!bayBuilt)return false;
    if(trip.tour){const t=bayData.props.find(p=>p.kind==='tour'&&p.id===trip.tour),stops=t&&(t.params?.stops||[]).filter(s=>trip.stops.includes(s.landmark));if(!stops?.length)return false;
      bayTour={tour:t,stops,idx:Math.min(trip.idx||0,stops.length-1),dwellUntil:0};sailToStop();if(!bayTour)return false;pauseShip();bayCaption('⏸ Tàu đang chờ ở cầu tàu · bấm ▶ để đi tiếp '+shortName(t.name),6000);return true}
    if(trip.dest){const D=trip.dest;setDestination(D.x,D.z,D.label,false,D.bow?{bow:true}:null);if(!bayShip.path.length)return false;pauseShip();bayCaption('⏸ Tàu đang chờ ở cầu tàu · bấm ▶ để đi tiếp tới '+(D.label?shortName(D.label):'điểm đã chọn'),6000);return true}
    return false}
  function tdSnapRestore(withTrip){const P=tdSnap;tdSnapDrop();if(!P||!bayBuilt)return false;const S=bayShip;dropPause();endTour(false);
    if(Number.isFinite(P.x)&&navFree(P.x,P.z)){S.x=P.x;S.z=P.z;S.heading=P.heading||0}S.speed=0;S.yawRate=0;S.path=[];S.dest=null;S.stopped=true;S.trail.length=0;
    if(P.mult)S.mult=P.mult;S.fast=bayMult()>1;if(P.view&&P.view!==bayView)setBayView(P.view);if(P.zoom)bayZoom=P.zoom;if(P.view==='far'){if(P.farZoom)bayFarZoom=P.farZoom;if(P.zoomBack)bayZoomBack=P.zoomBack}viewYaw=Number(P.viewYaw)||0;
    return withTrip?tdTripResume(P.trip):false}
  window.__bayResumeSnap=()=>tdSnapRestore(true);window.__bayIslandTrip=()=>bayIsland&&tdSnap?.trip||null;
  // Đầu cầu tàu (mút ngoài cùng của cầu tàu, phía biển): mũi tàu cập đúng điểm này, thân tàu nằm hướng nào cũng được.
  const tdPierHead=()=>[TU_DAO.x+TD_PIER_END[0]-1.2,TU_DAO.z+TD_PIER_END[1]],tdDockOpt=()=>({bow:true})/* 3.42: mũi tàu đi thẳng tới đầu cầu tàu (vẫn né đá), không vòng ra canh thẳng trục */;
  function tuDaoTap(kind){if(bayIsland){islandGo(kind);return}if(bayPlay)playEnd(true);tdTripMemo();const [x,z]=tdPierHead(),[bx,bz]=shipBow(bayShip);if(Math.hypot(bx-x,bz-z)>5||bayShip.path.length){tuDaoPending=kind;setDestination(x,z,'Đảo Yên của bạn',false,tdDockOpt());if(bayShip.path.length)bayCaption('🏝 Đang tới Đảo Yên · mũi tàu sẽ chạm đầu cầu tàu, rồi bấm vào đảo để lên đảo',5000);else tuDaoPending=null;return}dockAtTuDao();islandGo(kind)}
  function dockAtTuDao(){dropPause();endTour(false);const S=bayShip;S.path=[];S.dest=null;S.stopped=true;S.speed=0;S.yawRate=0;S.rev=null;
    tdDockGlide(S);saveBayState()}
  function tdDockGlide(S){const [hx,hz]=tdPierHead(),[bx,bz]=shipBow(S),to=[S.x+hx-bx,S.z+hz-bz,S.heading];if(Math.hypot(hx-bx,hz-bz)>4)return;if(Math.hypot(S.x-to[0],S.z-to[1])<.05)return;S.glide={t:0,f:[S.x,S.z,S.heading],to}}
  function stepOnIsland(kind){if(!bayMode)return;const [x,z]=TU_DAO.dock;dropPause();endTour(false);bayShip.path=[];bayShip.dest=null;bayShip.stopped=true;bayShip.x=x;bayShip.z=z;bayShip.speed=0;bayShip.heading=TU_DAO.heading;saveBayState();
    window.__tuDaoSpot=TU_DAO_SPOTS[kind]||'Bãi đảo';exitBay();setTimeout(()=>{if(typeof openTuDaoSpace==='function')openTuDaoSpace(kind)},80)}
  // ===== Đi bộ trên Đảo Yên: khi tàu đã cập cầu tàu, bấm cầu tàu → xuống tàu đứng trên cầu tàu; bấm đảo → xuống tàu, dạo một vòng quanh đảo;
  // bấm nhà → xuống tàu, đi hết cầu tàu, lên dốc rồi vào nhà. Bấm mặt nước / nút Về tàu → đi về cầu tàu và lên tàu.
  // Tàu vẫn neo ở cầu tàu (đã lưu), nên rời đi hay tắt trang thì lần sau trở lại đúng chỗ tàu đang neo ở Đảo Yên.
  function tdGroundY(x,z){// toạ độ địa phương của Đảo Yên
    const PIER_X0=-TU_DAO.r-14.8,/* đúng mép ván đầu cầu */PIER_X1=-TU_DAO.r+4;let y=tdTerrainY(x,z);
    if(x>=PIER_X0&&x<=PIER_X1&&Math.abs(z)<2.5)y=Math.max(y,2);/* mặt cầu tàu */
    if(x>PIER_X1&&x<PIER_X1+6&&Math.abs(z)<2.2)y=Math.max(y,2-(x-PIER_X1)*.25);/* ván dốc xuống bãi */
    if(x>=TD_H.x0&&x<=TD_H.x1&&Math.abs(z)<=TD_H.z)y=Math.max(y,TD_FY);/* sàn nhà chính và hiên */
    else if(x<TD_H.x0&&x>=TD_H.x0-TD_SR&&Math.abs(z)<3.3)y=Math.max(y,TD_FY-(TD_H.x0-x)/TD_SR*(TD_FY-TD_SBOT));/* bậc đá trước nhà */
    if(Math.abs(x-TD_MED.x)<TD_MED.h&&Math.abs(z-TD_MED.z)<TD_MED.h)y=Math.max(y,TD_MY);/* sàn phòng thiền */
    return y}
  bayIsland=null;const tdV=new THREE.Vector3();
  function tdBowLocal(){const v=(bayShip.bow||new THREE.Vector3(0,2.62,18.8)).clone();bayShip.group.localToWorld(v);TU_DAO.group.worldToLocal(v);return [v.x,v.z]}
  /* Dạo quanh Đảo Yên: từ đầu cầu tàu theo lối đá sang phòng thiền, quay lại ngã ba, sang chân cầu thang chòi ngắm biển, rồi men bãi cát về cầu tàu. */
  function tdLoop(){return [TD_JUNC].concat(TD_LEFT.slice(1),TD_LEFT.slice(0,-1).reverse(),TD_RIGHT.slice(1),TD_BEACH.slice(1))}
  function tdIslandCam(){/* đang ngắm toàn cảnh / tự xoay thì khi bước lên đảo chuyển về camera sau lưng người; Về tàu sẽ trả lại góc cũ */if(bayView==='far'||bayView==='spin'){const v=bayView;setBayView('bow');try{localStorage.setItem('yen_bay_view',v)}catch(e){}}bayZoom=bayZoomS=Math.min(bayZoom,1.6)}
  /* 3.42: lên đảo có chuyển cảnh: máy quay lướt theo đường cong từ boong tàu lên cầu tàu vào đảo (2,4 s), rồi bám sau lưng khách như thường */
  let tdFly=null;const tdFlyQ=new THREE.Quaternion();
  function islandGo(kind){if(bayIsland||window.__noFly)return islandGoNow(kind);tdFly={t:0,T:2.4,p:camera.position.clone(),q:camera.quaternion.clone()};islandGoNow(kind);bayCaption('🏝 Lên Đảo Yên…',2200)}
  function islandGoNow(kind){{const G=bayShip.glide;if(G){bayShip.x=G.to[0];bayShip.z=G.to[1];bayShip.heading=bayShip.bh=G.to[2];bayShip.glide=null}}if(!bayIsland){tdSnapTake();tdIslandCam();tdShellsRefresh();islandName(true);const b=tdBowLocal();bayIsland={x:TD_PIER_MID[0],z:TD_PIER_MID[1],yaw:Math.PI/2,path:[],then:null,t:0};document.body.classList.add('bay-island');viewYaw=0;/* chuyển cảnh: xuất hiện ngay giữa cầu tàu, quay mặt vào đảo */}
    const I=bayIsland;I.then=null;const onPier=I.x<TD_PIER_START[0]+1,atHouse=Math.hypot(I.x-TD_DOOR[0],I.z-TD_DOOR[1])<9,base=I.x<TD_PIER_END[0]-.5?[TD_PIER_END]:atHouse?[TD_STEP]:[];I.path=base;
    if(kind==='pier'){I.path=base.concat([TD_PIER_MID]);bayCaption('🏝 Bạn đã lên Đảo Yên · đi bằng W A S D hoặc nút mũi tên, chạm đất để đi tới, chạm nhà để vào nhà',6500)}
    else if(kind==='island'){I.path=(onPier?base.concat([TD_PIER_START]):atHouse?[TD_STEP,TD_PIER_START]:[]);bayCaption('🏝 Bạn đã lên Đảo Yên · đi bằng W A S D hoặc nút mũi tên, chạm đất để đi tới, chạm nhà để vào nhà',6500)}
    else if(kind==='med'){tdStand();const [fx,fz]=TD_MED_FOOT;if(Math.hypot(I.x-fx,I.z-fz)<1.4){I.path=[];I.then='med';bayCaption('🚪 Mở cửa lùa vào Nhà Thiền…',2500)}
      else{const p=tdRoute(I.x,I.z,fx,fz);I.path=p||(onPier?base:[]).concat(TD_LEFT||[],[TD_MED_FOOT]);I.then='med';bayCaption('🧘 Đang đi tới cửa Nhà Thiền…',4000)}}
    else if(kind==='house'){tdStand();const porch=[TD_H.x0+.8,0];if(Math.hypot(I.x-porch[0],I.z-porch[1])<1.8){I.path=[TD_DOOR];I.then='house';bayCaption('🚪 Vào nhà…',2500)}
      else{const p=tdRoute(I.x,I.z,porch[0],porch[1]);I.path=p||(onPier?base:[]).concat(TD_WALK_HOUSE,[porch]);I.then='porch';bayCaption('🏡 Đang đi tới trước cửa nhà · tới nơi bấm vào cửa để vào nhà',4500)}}
    refreshIslandHud()}
  function islandBack(){if(!bayIsland)return;if(shGuardLeave(()=>islandBack()))return;tdStand();const I=bayIsland,b=tdBowLocal();I.then='board';const p=tdRoute(I.x,I.z,TD_PIER_END[0],TD_PIER_END[1]);I.path=p?p:(Math.hypot(I.x-TD_DOOR[0],I.z-TD_DOOR[1])<9?[TD_STEP]:[]).concat(I.x>TD_PIER_START[0]?[TD_PIER_START]:[]).concat([TD_PIER_MID,TD_PIER_END]);/* đi tới đầu cầu (trên mặt ván) rồi lên tàu */bayCaption('⛵ Đang về tàu…',3000)}
  /* 3.42: góc camera lúc ra cửa trên đảo: ưu tiên chéo bên trái (−72°); nếu cây, chậu, mái hiên che giữa camera và người thì thử góc kế bên */
  const tdExitRay=new THREE.Raycaster();
  let tdExitPick=null;const tdInScene=o=>{while(o){if(!o.visible)return false;if(o===scene)return true;o=o.parent}return false};
  const tdVis=o=>{while(o){if(!o.visible)return false;o=o.parent}return true};
  function tdExitCamSide(yaw,cur){if(!TU_DAO.group)return -Math.PI*.4;scene.updateMatrixWorld(true);tdExitRay.camera=camera;const g=islandWorld(new THREE.Vector3());g.y+=1.2;const zm=Math.min(bayZoom,1.6),dist=3.7*(camera.aspect<1?1.25:1)*zm,up=2.7*Math.min(1,zm)+Math.max(0,zm-1)*2.2-1.2,
      cands=[-.4,-.32,-.48,-.24,-.56,-.64,-.16,-.72,-.08,0,.16,.32,.4].map(k=>k*Math.PI);if(cur!=null)cands.unshift(cur);
    const objs=scene.children.filter(o=>!o.isSprite&&o.visible);
    const blocked=(cp,ty)=>{const o=new THREE.Vector3(g.x,g.y-1.2+ty,g.z),d=cp.clone().sub(o),L=d.length();tdExitRay.set(o,d.normalize());tdExitRay.far=L+.8;return tdExitRay.intersectObjects(objs,true).some(h=>h.distance>.55&&tdVis(h.object)&&h.object.material&&!(h.object.material.transparent&&h.object.material.opacity<.15))};/* kính cũng tính là che: camera không được nằm trong nhà */
    /* camera và người phải nhìn thông nhau: tia tới đầu, ngực, hông, và hai bên khung hình; không được thì kéo camera lại gần hơn */
    for(const f of [1,.8,.62])for(const c of cands){const a=yaw+c,D=dist*f,cp=new THREE.Vector3(g.x-Math.sin(a)*D,g.y+up*f,g.z-Math.cos(a)*D),rx=Math.cos(a)*.6,rz=-Math.sin(a)*.6;
      if([.35,.9,1.5].some(ty=>blocked(cp,ty))||[[-1.7,0],[1.7,0],[-1.2,-.9],[1.2,-.9]].some(([k,dy])=>blocked(new THREE.Vector3(cp.x+rx*k,cp.y+dy,cp.z+rz*k),.9)))continue;if(f<1&&bayIsland)bayZoom=bayZoomS=Math.min(bayZoom,f);return c}
    return cur!=null?cur:-Math.PI*.4}
  function tdAtDoor(){if(!bayMode||!bayBuilt)return false;if(!tdSnap)tdSnapTake();tdIslandCam();islandName(true);/* 3.40: ra cửa: đứng cách cửa 1 m, quay lưng về cửa; vướng thì tìm ô trống kế bên; camera chéo bên trái */const exitAt=(x,z,yaw)=>{let p=[x,z];if(typeof tdWalkable==='function'&&!tdWalkable(x,z)){const dx=Math.sin(yaw),dz=Math.cos(yaw);p=null;for(let k=1;k<=8&&!p;k++){const q=[x+dx*k*.25,z+dz*k*.25];if(tdWalkable(...q))p=q}for(let r=.5;r<=2.5&&!p;r+=.5)for(let k=0;k<12&&!p;k++){const a=k*Math.PI/6,q=[x+Math.cos(a)*r,z+Math.sin(a)*r];if(tdWalkable(...q))p=q}p=p||[x,z]}bayIsland={x:p[0],z:p[1],yaw,path:[],then:null,t:0};viewYaw=-Math.PI*.4;tdExitPick={yaw,t:0,k:0}/* trên đảo camera = cam0 (hướng người) + viewYaw; góc né vật che chọn ở khung hình đầu khi cảnh đảo đã hiện lại */};if(arguments[0]==='med'){exitAt(TD_MED.x-TD_MED.h-1,TD_MED.z,-Math.PI/2);document.body.classList.add('bay-island');refreshIslandHud();bayCaption('🚪 Đã ra khỏi Nhà Thiền · chạm cửa lùa để vào lại',4500);return true}exitAt(TD_DOOR[0]-1,0,-Math.PI/2);document.body.classList.add('bay-island');/* đứng trên hiên trước cửa, quay mặt ra biển; camera nhìn từ phía cầu tàu vào */refreshIslandHud();bayCaption('🚪 Đã ra trước cửa nhà · bấm nhà để vào lại, bấm đảo để dạo, bấm mặt nước để về tàu',5500);return true}
  window.__tdAtDoor=tdAtDoor;
  function islandName(on){const nm=document.querySelector('.immersive-name');if(nm)nm.textContent=on?'✧ LÀNG YÊN - ĐẢO YÊN':'✧ LÀNG YÊN - VỊNH YÊN'}
  // back: bấm Về tàu → nạp lại trạng thái đã lưu; 'new': chọn chuyến mới ngay trên đảo → bỏ bản lưu; không truyền (vào nhà, rời vịnh) → giữ bản lưu
  function islandBoardNow(back){if(!bayIsland)return;if(TD_ACT.mode){TD_ACT.leaveCont=null;shEnd(true)}tdBinsHome();TD_ACT.seq=null;if(bayAvatar)bayAvatar.crouch=0;bayIsland=null;shPills();shPanel(null);document.body.classList.remove('bay-island');viewYaw=0;islandName(false);refreshIslandHud();
    if(back==='new'){tdSnapDrop();return}if(!back)return;const resumed=tdSnapRestore(true);if(back&&!resumed)bayCaption('⛵ Đã về tàu · tàu neo ở cầu tàu Đảo Yên',3500);refreshBayHud();drawBayMap()}
  // Đi tự do trên đảo như ở Rừng Yên: không xuống nước, không xuyên nhà / chòi; bước vào cửa nhà thì vào nhà.
  const tdOk=(x,z)=>{if(tdGroundY(x,z)<-.03)return false;if(x>-TU_DAO.r-15.5&&x<-TU_DAO.r+10.5&&Math.abs(z)>(x>-TU_DAO.r+4?2.1:2.15)&&Math.abs(z)<4.5&&tdTerrainY(x,z)<.35)return false;/* lan can cầu tàu và mép ván dốc: không bước ra ngoài rơi xuống biển */if(x>TD_H.x0-.4&&x<TD_H.x1+.5&&Math.abs(z)<TD_H.z+.4&&!(x<TD_H.x0+1.9&&Math.abs(z)<2.4))return false;if(Math.hypot(x-TD_GAZ.x,z-TD_GAZ.z)<TD_GAZ.r+.3)return false;return true};
  // ---- Đi bộ trên Đảo Yên: A* trên lưới 0,7 m, tránh nước, nhà, phòng thiền, chòi, đá, gốc cây, bụi cây, ghế;
  // chi phí: lối đá / cầu tàu / hiên = 1, bãi cát = 2, bãi cỏ = 3, nên luôn ưu tiên đi đường lát đá trước rồi mới lên cỏ.
  const tdWalkable=(x,z)=>{if(!tdOk(x,z))return false;if(Math.abs(x-TD_MED.x)<TD_MED.h+.4&&Math.abs(z-TD_MED.z)<TD_MED.h+.4)return false;
    if(tdSegD(x,z,[[TD_GAZ.x,TD_GAZ.z],TD_GAZ_FOOT])<1.3&&Math.hypot(x-TD_GAZ_FOOT[0],z-TD_GAZ_FOOT[1])>1)return false;
    for(const [cx,cz,r] of TD_COLL)if((x-cx)*(x-cx)+(z-cz)*(z-cz)<(r+.3)*(r+.3))return false;return true};
  const tdPaved=(x,z)=>tdOnPaths(x,z,1.25)||(x<TD_PIER_START[0]+6&&Math.abs(z)<2.6)||(x>=TD_H.x0-TD_SR-1.5&&x<=TD_H.x1&&Math.abs(z)<TD_H.z+.5);
  const tdCostAt=(x,z)=>{if(tdPaved(x,z))return 1;const [r,a]=tdRho(x,z);return r>tdSandEdge(a)?2:3};
  const TDW={x0:-96,z0:-62,s:.7,nx:0,nz:0,ok:null,cost:null};
  function tdGrid(){if(TDW.ok)return TDW;TDW.nx=Math.ceil(170/TDW.s);TDW.nz=Math.ceil(124/TDW.s);const N=TDW.nx*TDW.nz;TDW.ok=new Uint8Array(N);TDW.cost=new Uint8Array(N);
    for(let j=0;j<TDW.nz;j++)for(let i=0;i<TDW.nx;i++){const x=TDW.x0+i*TDW.s,z=TDW.z0+j*TDW.s,k=j*TDW.nx+i;if(tdWalkable(x,z)){TDW.ok[k]=1;TDW.cost[k]=tdCostAt(x,z)}}return TDW}
  const tdLineOk=(a,b)=>{const n=Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/.3));for(let i=0;i<=n;i++)if(!tdWalkable(a[0]+(b[0]-a[0])*i/n,a[1]+(b[1]-a[1])*i/n))return false;return true};
  const tdLineCost=(a,b)=>{const L=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.max(1,Math.ceil(L/.4));let c=0;for(let i=1;i<=n;i++)c+=tdCostAt(a[0]+(b[0]-a[0])*i/n,a[1]+(b[1]-a[1])*i/n)*L/n;return c};
  function tdFindPath(sx,sz,tx,tz){const G=tdGrid(),nx=G.nx,nz=G.nz,S=G.s,pos=k=>[G.x0+(k%nx)*S,G.z0+Math.floor(k/nx)*S];
    const near=(x,z)=>{const ci=Math.round((x-G.x0)/S),cj=Math.round((z-G.z0)/S);for(let r=0;r<=14;r++){let best=-1,bd=1e9;for(let dj=-r;dj<=r;dj++)for(let di=-r;di<=r;di++){if(Math.max(Math.abs(di),Math.abs(dj))!==r)continue;const i=ci+di,j=cj+dj;if(i<0||j<0||i>=nx||j>=nz||!G.ok[j*nx+i])continue;const p=pos(j*nx+i),d=Math.hypot(p[0]-x,p[1]-z);if(d<bd){bd=d;best=j*nx+i}}if(best>=0)return best}return -1};
    const s0=near(sx,sz),t0=near(tx,tz);if(s0<0||t0<0)return null;const N=nx*nz,gs=new Float32Array(N).fill(Infinity),par=new Int32Array(N).fill(-1),cl=new Uint8Array(N),heap=[];
    const push=(k,f)=>{heap.push([f,k]);let c=heap.length-1;while(c){const p=(c-1)>>1;if(heap[p][0]<=heap[c][0])break;[heap[p],heap[c]]=[heap[c],heap[p]];c=p}};
    const pop=()=>{const top=heap[0],last=heap.pop();if(heap.length){heap[0]=last;let c=0;for(;;){const l=c*2+1,r=l+1;let m=c;if(l<heap.length&&heap[l][0]<heap[m][0])m=l;if(r<heap.length&&heap[r][0]<heap[m][0])m=r;if(m===c)break;[heap[m],heap[c]]=[heap[c],heap[m]];c=m}}return top};
    const tp=pos(t0);gs[s0]=0;push(s0,0);let found=false;
    while(heap.length){const [,k]=pop();if(cl[k])continue;cl[k]=1;if(k===t0){found=true;break}const i=k%nx,j=(k-i)/nx;
      for(let dj=-1;dj<=1;dj++)for(let di=-1;di<=1;di++){if(!di&&!dj)continue;const a=i+di,b=j+dj;if(a<0||b<0||a>=nx||b>=nz)continue;const kk=b*nx+a;if(!G.ok[kk]||cl[kk])continue;if(di&&dj&&(!G.ok[j*nx+a]||!G.ok[b*nx+i]))continue;
        const g=gs[k]+Math.hypot(di,dj)*S*(G.cost[k]+G.cost[kk])/2;if(g<gs[kk]){gs[kk]=g;par[kk]=k;const q=pos(kk);push(kk,g+Math.hypot(q[0]-tp[0],q[1]-tp[1]))}}}
    if(!found)return null;const raw=[];for(let k=t0;k!==-1;k=par[k])raw.push(pos(k));raw.reverse();
    // kéo thẳng: chỉ nối tắt khi đoạn thẳng không vướng vật cản và không đi thêm qua cỏ so với đường lưới
    const acc=[0];for(let i=1;i<raw.length;i++)acc.push(acc[i-1]+tdLineCost(raw[i-1],raw[i]));
    const out=[];let a=[sx,sz],ai=0,k=0;if(!tdLineOk(a,raw[0])){a=raw[0]}
    while(k<raw.length-1){let j=raw.length-1;for(;j>k+1;j--){if(tdLineOk(a,raw[j])&&tdLineCost(a,raw[j])<=acc[j]-acc[ai]+.6)break}out.push(raw[j]);a=raw[j];ai=j;k=j}
    const end=tdWalkable(tx,tz)&&tdLineOk(out.length?out[out.length-1]:a,[tx,tz])?[tx,tz]:null;if(end)out.push(end);if(!out.length)out.push(raw[raw.length-1]);return out}
  // Đường đi từ (sx,sz): đang đứng trên tàu (chỗ không đi bộ được) thì bước xuống đầu cầu tàu trước
  function tdRoute(sx,sz,tx,tz){const pre=tdWalkable(sx,sz)?[]:[TD_PIER_END],[ax,az]=pre.length?TD_PIER_END:[sx,sz],p=tdFindPath(ax,az,tx,tz);return p?pre.concat(p):null}
  function tdStand(){if(typeof meActivity!=='undefined'&&meActivity==='sit')document.getElementById('realtimeSit')?.click()}
  function tdClip(x0,z0,x1,z1){const d=Math.hypot(x1-x0,z1-z0),n=Math.max(1,Math.ceil(d/.5));let lx=x0,lz=z0;for(let i=1;i<=n;i++){const x=x0+(x1-x0)*i/n,z=z0+(z1-z0)*i/n;if(!tdOk(x,z))break;lx=x;lz=z}return [lx,lz]}
  function islandWalkTo(x,z){const I=bayIsland;if(!I)return;tdStand();const p=tdRoute(I.x,I.z,x,z);if(!p){bayCaption('Chỗ đó chưa đi tới được, hãy chạm chỗ khác trên đảo',2500);return}I.then=null;I.path=p}
  function updateIslandWalk(dt){const I=bayIsland;if(!I)return;tdActAnim(dt);
    {const K=walkingKeys;if(K.size&&I.then!=='board'&&I.then!=='house'){I.path.length=0;I.then=null;if(K.has('turnleft'))I.yaw+=1.9*dt;if(K.has('turnright'))I.yaw-=1.9*dt;const mv=K.has('forward')?1:K.has('back')?-.6:0;
      if(mv){const sp=WALK_SPEED*mv*walkDt,nx=I.x+Math.sin(I.yaw)*sp,nz=I.z+Math.cos(I.yaw)*sp;if(tdWalkable(nx,nz)){I.x=nx;I.z=nz}else if(tdWalkable(nx,I.z))I.x=nx;else if(tdWalkable(I.x,nz))I.z=nz;I.moving=true;I.t+=dt}else I.moving=false;
      if(I.x>TD_H.x0+1.2&&Math.abs(I.z)<2.4)I.then='house';return}}
    let left=WALK_SPEED*walkDt;/* cùng tốc độ đi bộ với Rừng Yên, không nhân theo tốc độ tàu */
    while(left>0&&I.path.length){const [tx,tz]=I.path[0],dx=tx-I.x,dz=tz-I.z,d=Math.hypot(dx,dz);if(d<=left){I.x=tx;I.z=tz;left-=d;I.path.shift();continue}
      I.x+=dx/d*left;I.z+=dz/d*left;left=0;const want=Math.atan2(dx,dz);I.yaw+=Math.atan2(Math.sin(want-I.yaw),Math.cos(want-I.yaw))*Math.min(1,dt*6)}
    I.moving=I.path.length>0;I.t+=dt;
    if(!I.path.length&&I.then){const t=I.then;I.then=null;if(t==='cairn'){const C=TD_ACT.cairn;I.yaw=Math.atan2(C.x-I.x,C.z-I.z);cairnAdd()}else if(String(t).startsWith('shell:'))pickShell(+t.slice(6));else if(t==='rinse')shRinseNow();else if(t==='pickstart')shPickStart();else if(t==='station'){const S=TD_ACT.station;if(S)I.yaw=Math.atan2(S.x-I.x,S.z-I.z)}else if(String(t).startsWith('bin:'))takeBin(+t.slice(4));else if(t==='porch'){I.yaw=Math.PI/2;bayCaption('🚪 Đã tới trước cửa nhà · bấm vào cửa để vào nhà',5000)}else if(t==='board')islandBoardNow(true);else if(t==='med'){if(bayPhoto)closePhoto();window.__tuDaoSpot='Nhà Thiền';saveBayState();islandBoardNow();exitBay();setTimeout(()=>{if(typeof openTuDaoSpace==='function')openTuDaoSpace('med')},80)}else if(t==='house'){if(bayPhoto)closePhoto();window.__tuDaoSpot='Nhà nghỉ trên đảo';const S=bayShip;saveBayState();islandBoardNow();exitBay();setTimeout(()=>{if(typeof openTuDaoSpace==='function')openTuDaoSpace('house')},80)}}}
  // ---- Xếp đá cân bằng / nhặt vỏ sò
  function tdGoTo(sx,sz,then,cap){const I=bayIsland;if(!I)return;tdStand();if(Math.hypot(I.x-sx,I.z-sz)<.9){I.path=[];I.then=then;return}const p=tdRoute(I.x,I.z,sx,sz);if(!p){bayCaption('Chỗ đó chưa đi tới được, hãy chạm chỗ khác trên đảo',2500);return}I.path=p;I.then=then;if(cap)bayCaption(cap,3000)}
  function tdNearStand(x,z,r,side){const I=bayIsland,cy=(bayIsland.cam0||0)+viewYaw,fx=Math.sin(cy),fz=Math.cos(cy);let best=null,bd=1e9;for(let k=0;k<16;k++){const a=k*Math.PI/8,px=x+Math.cos(a)*r,pz=z+Math.sin(a)*r;if(!tdWalkable(px,pz))continue;const d=Math.hypot(px-I.x,pz-I.z)+(side?4*Math.abs(-Math.cos(a)*fx-Math.sin(a)*fz):0);/* side: đứng cạnh, không che vật trước camera */if(d<bd){bd=d;best=[px,pz]}}return best||[x,z]}
  function tdGoCairn(){const C=TD_ACT.cairn;if(!C||!bayIsland)return;const [sx,sz]=tdNearStand(C.x,C.z,1.4,true);tdGoTo(sx,sz,'cairn','🪨 Đang ra bãi đá trước Nhà Thiền…')}
  const CAIRN_SAY=['Thở vào, đặt viên đá đầu tiên thật nhẹ','Thở ra, để viên đá tự tìm chỗ đứng','Chậm lại, nghe tiếng sóng vỗ','Tay nhẹ, tâm lặng','Mỗi viên đá một hơi thở','Gần xong rồi, không vội','Tháp đá đã cân bằng · ngồi yên một chút, nghe sóng'];
  function cairnAdd(){const C=TD_ACT.cairn;if(!C)return;if(C.n>=C.pile.length){for(const m of C.pile){m.position.copy(m.userData.home);m.rotation.set(0,m.userData.homeR,0)}C.n=0;C.h=.3;C.anim=null;TD_ACT.cairnShot=null;if(!TD_ACT.mode)shPanel(null);bayCaption('🪨 Đã gỡ tháp đá về bãi · chạm vào đá để xếp lại từ đầu',4000);return}
    const m=C.pile[C.n],sy=m.scale.y;C.anim={m,t:0,to:new THREE.Vector3((Math.random()-.5)*.06,C.h+sy*.82,(Math.random()-.5)*.06),from:m.position.clone()};m.rotation.set(0,Math.random()*6.28,0);C.h+=sy*1.6;C.n++;
    bayCaption('🪨 Viên '+C.n+'/'+C.pile.length+' · '+CAIRN_SAY[C.n-1]+(C.n<C.pile.length?' · chạm đá để đặt tiếp':''),C.n<C.pile.length?3500:6000)}
  function tdActAnim(dt){const C=TD_ACT.cairn;if(C&&C.anim){const A=C.anim;A.t+=dt/.7;const u=Math.min(1,A.t),e=u*u*(3-2*u);A.m.position.lerpVectors(A.from,A.to,e);A.m.position.y+=Math.sin(Math.PI*u)*.6;A.m.rotation.z=u>=1?0:Math.sin(u*Math.PI*3)*.05*(1-u);if(u>=1){A.m.position.copy(A.to);C.anim=null;if(C.n>=C.pile.length&&!TD_ACT.mode){TD_ACT.cairnShot=null;shPanel('cairndone')}}}
    const A=TD_ACT;bayAvatar.crouch=0;if(A.seq){const S=A.seq;S.t+=dt;const u=Math.min(1,S.t/S.dur);if(S.crouch)bayAvatar.crouch=Math.sin(Math.PI*u);S.step(u,S.t,S.S);if(u>=1){A.seq=null;S.done&&S.done()}}
    if(A.g&&bayIsland&&A.beach.length<6&&A.spawned<36&&performance.now()>A.nextSpawn){shSpawn();A.nextSpawn=performance.now()+1200}/* bãi luôn có 6 vỏ, nhặt tới đâu hiện bù từ từ tới đó, đủ 36 vỏ thì thôi */
    for(let i=A.tweens.length-1;i>=0;i--){const w=A.tweens[i];w.t+=dt;if(w.t<0)continue;const u=Math.min(1,w.t/w.dur),e=u*u*(3-2*u);w.g.position.lerpVectors(w.from,w.to,e);w.g.position.y+=Math.sin(Math.PI*u)*.7;if(u>=1){w.g.position.copy(w.to);if(w.kill)w.g.parent&&w.g.parent.remove(w.g);A.tweens.splice(i,1)}}}
  // ---- Dạo cát & bắt gặp: mép cát ẩm chỉ lấp ló 2–3 vỏ phủ cát; nhặt rồi sóng lại dạt vỏ khác vào
  const SH_BOOK_KEY='yen_shell_book_v2',SH_DAY_KEY='yen_shell_bag_day_v1';
  const shBook=()=>{try{return JSON.parse(localStorage.getItem(SH_BOOK_KEY)||'{}')||{}}catch(e){return {}}};
  const shToday=()=>new Date().toLocaleDateString('sv-SE');
  const shDayCount=()=>{try{const d=JSON.parse(localStorage.getItem(SH_DAY_KEY)||'{}');return d.d===shToday()?d.n|0:0}catch(e){return 0}};
  let shId=0;
  function shRandKind(){const A=TD_ACT;if(!A.deck||!A.deck.length){A.deck=[];for(let s=0;s<SH_N;s++)for(let t=0;t<SH_T;t++)A.deck.push([s,t]);for(let i=A.deck.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[A.deck[i],A.deck[j]]=[A.deck[j],A.deck[i]]}}return A.deck.pop()}/* mỗi lượt: 36 vỏ, mỗi vỏ hiện một lần */
  function shSpawn(){const A=TD_ACT;if(!A.g||A.spawned>=36)return;/* cả bãi hiện tối đa 36 vỏ trong một lượt dạo */
    for(let tr=0;tr<80;tr++){const F=A.focus,A0=1.75,A1=2.88,/* chỉ bãi biển bên phải, cạnh Chòi ngắm cảnh */a=F!=null&&tr<50?Math.max(A0,Math.min(A1,F+(Math.random()-.5)*.45)):A0+Math.random()*(A1-A0),e0=tdSandEdge(a)+.03,lo=e0,rr=lo+Math.random()*Math.max(.01,.885-lo),R=tdR(a)*rr,/* chỉ trên bãi cát khô, không ra mép nước */x=TD_O[0]+Math.cos(a)*R,z=TD_O[1]+Math.sin(a)*R;
      if(Math.abs(z)<5||!tdWalkable(x,z)||!A.clear(x,z,.5))continue;if(A.cairn&&Math.hypot(x-A.cairn.x,z-A.cairn.z)<3)continue;if(A.beach.some(q=>Math.hypot(q.x-x,q.z-z)<(F!=null?1.3:2.2))||A.decor.some(q=>Math.hypot(q.x-x,q.z-z)<1.2)||A.bins.some(b=>Math.hypot(b.x-x,b.z-z)<1.5)||(bayIsland&&Math.hypot(bayIsland.x-x,bayIsland.z-z)<1.2))continue;
      const [s,t]=shRandKind(),g=new THREE.Group();g.position.set(x,tdTerrainY(x,z)+.01,z);g.rotation.y=Math.random()*TAU;const m=shMesh(s,t,false);g.add(m);const h=new THREE.Mesh(SH_HIT_G,SH_HIT_M);h.position.y=.15;g.add(h);
      const q={id:++shId,s,t,x,z,g,m,clean:true};g.traverse(o=>{o.userData.tuDao='shell';o.userData.shell=q.id});A.g.add(g);A.beach.push(q);A.spawned++;return}}
  function tdGoShell(id){const q=TD_ACT.beach.find(b=>b.id===id);if(!q||!bayIsland)return;if(TD_ACT.mode!=='pick'){shIntro();return}if(TD_ACT.art||TD_ACT.artCam)return;if(TD_ACT.carry!=null&&TD_ACT.bins[TD_ACT.carry].items.length>=SH_CAP){bayCaption(BIN_INFO[TD_ACT.carry].short+' đã đầy '+SH_CAP+' vỏ · bấm Ngừng nhặt để chọn nơi gửi vỏ',3500);shPanel('picked');return}if(TD_ACT.hand){bayCaption('🐚 Tay đang cầm một vỏ · chọn cách lưu giữ ở bảng bên dưới trước nhé',3000);shPanel();return}const [sx,sz]=tdNearStand(q.x,q.z,.6);tdGoTo(sx,sz,'shell:'+id,'🐚 Đang tới chỗ vỏ sò lấp ló trên cát…')}
  function tdGoBin(k){if(!bayIsland)return;if(TD_ACT.mode!=='pick'){shIntro();return}const q=TD_ACT.bins[k];if(!q)return;if(TD_ACT.carry===k){bayCaption(BIN_INFO[k].ic+' Bạn đang cầm '+BIN_INFO[k].name,3000);return}const [sx,sz]=tdNearStand(q.x,q.z,.75,true);tdGoTo(sx,sz,'bin:'+k,BIN_INFO[k].ic+' Đang tới lấy '+BIN_INFO[k].name+'…')}
  function binHold(q,on){if(on){TU_DAO.group.remove(q.g);me.add(q.g);q.g.position.set(.42,.62,.18);q.g.rotation.set(0,0,0);q.g.scale.setScalar(.8)}else{if(q.g.parent)q.g.parent.remove(q.g);TU_DAO.group.add(q.g);q.g.position.copy(q.home);q.g.rotation.set(0,q.homeR,0);q.g.scale.setScalar(1)}}
  function takeBin(k){const q=TD_ACT.bins[k];if(!q)return;const I=bayIsland;if(I)I.yaw=Math.atan2(q.x-I.x,q.z-I.z);const old=TD_ACT.carry;if(old!=null&&old!==k)binHold(TD_ACT.bins[old],false);TD_ACT.carry=k;
    shSeq(.9,(u,T,S)=>{if(T>=.45&&!S.held){S.held=true;binHold(q,true)}},()=>{shPills();if(TD_ACT.mode==='go'){shBegin();return}if(TD_ACT.hand)shPanel()});
    if(TD_ACT.mode!=='go')bayCaption(BIN_INFO[k].ic+' Đã cầm '+BIN_INFO[k].name+' (phong cách '+BIN_INFO[k].style+') · đựng được tới '+SH_CAP+' vỏ'+(old!=null&&old!==k?' · đã đặt '+BIN_INFO[old].short+' về chỗ cũ':''),4500)}
  function tdBinsHome(){if(TD_ACT.carry!=null){binHold(TD_ACT.bins[TD_ACT.carry],false);TD_ACT.carry=null}if(TD_ACT.hand)shDrop(false);shPanel(null);shPills()}
  /* một chuỗi động tác ngắn: ngồi xuống (crouch theo hình sin) rồi đứng lên */
  function shSeq(dur,step,done,crouch=true){TD_ACT.seq={t:0,dur,step,done,crouch,S:{}}}
  const shHandLocal=new THREE.Vector3(.16,.95,.42);
  function pickShell(id){const A=TD_ACT,q=A.beach.find(b=>b.id===id);if(!q||A.hand||A.seq)return;const I=bayIsland;if(I)I.yaw=Math.atan2(q.x-I.x,q.z-I.z);
    A.beach=A.beach.filter(b=>b!==q);A.focus=Math.atan2(q.z-TD_O[1],q.x-TD_O[0]);A.nextSpawn=performance.now()+1500;/* nhặt thì sóng mới từ từ dạt thêm vỏ; ngừng nhặt thì ngừng hiện */const from=q.g.position.clone();q.g.traverse(o=>{o.userData.tuDao=null});
    shSeq(1.4,(u,T)=>{if(T>.45&&T<1){const w=new THREE.Vector3().copy(shHandLocal);me.localToWorld(w);TU_DAO.group.worldToLocal(w);const e=(T-.45)/.55;q.g.position.lerpVectors(from,w,e*e*(3-2*e))}},()=>{q.g.parent&&q.g.parent.remove(q.g);me.add(q.g);q.g.position.copy(shHandLocal);q.g.rotation.set(0,0,0);A.hand=q;q.clean=true;q.msg=SH_SEA[Math.floor(Math.random()*SH_SEA.length)];
      const B=shBook(),k=shKey(q.s,q.t),isNew=!B[k];if(isNew){B[k]={at:Date.now(),where:'Đảo Yên'};try{localStorage.setItem(SH_BOOK_KEY,JSON.stringify(B))}catch(e){}}q.isNew=isNew;
      if(A.carry!=null&&A.bins[A.carry].items.length<SH_CAP)shIntoBin(true);else shPanel()})}
  /* tìm mép sóng gần nhất: đi thẳng ra phía biển tới chỗ cuối cùng còn đứng được */
  function shWetPoint(){const I=bayIsland,a=Math.atan2(I.z-TD_O[1],I.x-TD_O[0]);let p=[I.x,I.z];for(let d=0;d<25;d+=.3){const x=I.x+Math.cos(a)*d,z=I.z+Math.sin(a)*d;if(!tdWalkable(x,z))break;p=[x,z]}return p}
  function shRinse(){const A=TD_ACT;if(!A.hand||A.hand.clean)return;const [x,z]=shWetPoint();shPanel(null);tdGoTo(x,z,'rinse','🌊 Đang ra mép sóng nhúng rửa cát…')}
  function shRinseNow(){const A=TD_ACT,q=A.hand;if(!q)return;const I=bayIsland,a=Math.atan2(I.z-TD_O[1],I.x-TD_O[0]);I.yaw=Math.atan2(Math.cos(a),Math.sin(a));
    const ring=new THREE.Mesh(new THREE.RingGeometry(.15,.22,20),new THREE.MeshBasicMaterial({color:'#ffffff',transparent:true,opacity:.8,depthWrite:false}));ring.rotation.x=-Math.PI/2;const w=new THREE.Vector3(.16,.05,.6);me.localToWorld(w);TU_DAO.group.worldToLocal(w);ring.position.set(w.x,Math.max(-.1,tdGroundY(w.x,w.z))+.03,w.z);TU_DAO.group.add(ring);
    shSeq(1.8,(u,T)=>{q.g.position.set(.16,.95-.75*Math.sin(Math.PI*Math.min(1,T/1.8)),.42+.2*Math.sin(Math.PI*Math.min(1,T/1.8)));q.g.rotation.y=T*2;const k=Math.min(1,T/1.8);ring.scale.setScalar(1+k*5);ring.material.opacity=.8*(1-k);if(T>.9&&!q.clean){q.clean=true;q.m.material=shMat(q.s)}},()=>{ring.parent&&ring.parent.remove(ring);ring.geometry.dispose();ring.material.dispose();q.g.position.copy(shHandLocal);
      const B=shBook(),k=shKey(q.s,q.t),isNew=!B[k];if(isNew){B[k]={at:Date.now(),where:'Đảo Yên'};try{localStorage.setItem(SH_BOOK_KEY,JSON.stringify(B))}catch(e){}}
      q.msg=SH_SEA[Math.floor(Math.random()*SH_SEA.length)];bayCaption('✨ '+shName(q.s,q.t)+' · '+SH_TONE_IC[q.t]+' '+SH_TONE[q.t]+(isNew?' · ô mới trong Sổ Sưu Tập ('+Object.keys(B).length+'/36)':''),5000);shPanel();shPills()})}
  function shFinish(){TD_ACT.hand=null;shPanel(null);shPills()}
  function shIntoBin(auto){const A=TD_ACT,q=A.hand,b=A.bins[A.carry];if(!q||!b)return;if(b.items.length>=SH_CAP){bayCaption(BIN_INFO[A.carry].ic+' '+BIN_INFO[A.carry].short+' đã đầy '+SH_CAP+' vỏ',3000);return}const sk=binSock(A.carry,b.items.length);
    q.g.parent&&q.g.parent.remove(q.g);b.g.add(q.g);q.g.position.set(...sk);q.g.rotation.set(0,Math.random()*TAU,0);q.g.scale.setScalar(b.items.length<5?.55:.4);q.g.traverse(o=>{o.userData.tuDao='bin';o.userData.bin=A.carry});b.items.push(q);
    bayCaption(BIN_INFO[A.carry].ic+' '+shName(q.s,q.t)+' · '+SH_TONE_IC[q.t]+' '+SH_TONE[q.t]+(q.isNew?' · ô mới trong Sổ Sưu Tập':''),4000);A.last=q;A.hand=null;shPills();if(A.mode==='pick')shPanel('picked');else shPanel(null)}
  function shToBag(){const q=TD_ACT.hand;if(!q||!q.clean)return;const n=shDayCount();if(n>=3){bayCaption('🎒 Hôm nay đã cất đủ 3 vỏ vào Túi An Yên · nhịp chậm an yên, mai lại ghé nhé',4000);return}
    try{localStorage.setItem(SH_DAY_KEY,JSON.stringify({d:shToday(),n:n+1}))}catch(e){}window.dispatchEvent(new CustomEvent('anyen-bag-add',{detail:{kind:'shell',label:shName(q.s,q.t),own:true,data:{s:q.s,t:q.t,where:'Đảo Yên'}}}));
    shSeq(.7,(u)=>{q.g.position.y=.95+u*.8;q.g.scale.setScalar(.26*(1-u)+.01)},()=>{q.g.parent&&q.g.parent.remove(q.g)},false);bayCaption('🎒 Đã cất '+shName(q.s,q.t)+' vào Túi An Yên · hôm nay '+(n+1)+'/3',4000);shFinish();shAfterChoice()}
  function shToSea(){const A=TD_ACT,q=A.hand;if(!q)return;const I=bayIsland,a=Math.atan2(I.z-TD_O[1],I.x-TD_O[0]);I.yaw=Math.atan2(Math.cos(a),Math.sin(a));const w=new THREE.Vector3().copy(shHandLocal);me.localToWorld(w);TU_DAO.group.worldToLocal(w);q.g.parent&&q.g.parent.remove(q.g);TU_DAO.group.add(q.g);q.g.position.copy(w);
    const from=w.clone(),to=new THREE.Vector3(w.x+Math.cos(a)*6,-.6,w.z+Math.sin(a)*6);shSeq(1.4,(u)=>{q.g.position.lerpVectors(from,to,u);q.g.position.y+=Math.sin(Math.PI*u)*1.6;if(u>.85)q.g.scale.setScalar(.26*(1-(u-.85)/.15)+.01)},()=>{q.g.parent&&q.g.parent.remove(q.g)},false);
    bayCaption('🌊 Đã thả vỏ về biển · buông nhẹ một điều nặng lòng theo bọt sóng',4500);shFinish()}
  function shDrop(say=true){const A=TD_ACT,q=A.hand;if(!q)return;const I=bayIsland;A.hand=null;q.g.parent&&q.g.parent.remove(q.g);if(!I)return;const x=I.x+Math.sin(I.yaw)*.55,z=I.z+Math.cos(I.yaw)*.55;TU_DAO.group.add(q.g);const w=new THREE.Vector3().copy(shHandLocal);me.localToWorld(w);TU_DAO.group.worldToLocal(w);const from=w.clone(),to=new THREE.Vector3(x,tdTerrainY(x,z)+.01,z);
    q.g.scale.setScalar(1);q.g.traverse(o=>{o.userData.tuDao='shell';o.userData.shell=q.id});q.x=x;q.z=z;shSeq(1,(u,T)=>{if(T>.3){const e=Math.min(1,(T-.3)/.5);q.g.position.lerpVectors(from,to,e*e*(3-2*e))}},()=>{q.g.position.copy(to);A.beach.push(q)});
    if(say)bayCaption('↩ Đã đặt vỏ lại trên cát, trả cho biển',3000);shPanel(null);shPills()}
  function shTrayToBag(name){const A=TD_ACT,b=A.bins[A.carry];if(!b||b.items.length<3)return;const label=String(name||'').trim().slice(0,40)||BIN_INFO[A.carry].short+' '+new Date().toLocaleDateString('vi-VN');
    window.dispatchEvent(new CustomEvent('anyen-bag-add',{detail:{kind:'shelltray',label,own:true,data:{tray:A.carry,shells:b.items.map(q=>[q.s,q.t]),where:'Đảo Yên'}}}));for(const q of b.items)b.g.remove(q.g);b.items=[];
    bayCaption('🎒 Đã cất '+BIN_INFO[A.carry].name+' «'+label+'» vào Túi An Yên · cả khay chỉ chiếm 1 ô',4500);shPanel(null);shPills();if(A.mode==='pick'){shSeaAll(true);setTimeout(()=>shEnd(true),1400)}else shAfterChoice()}
  let shAudio=null;function shListen(qq){const q=qq||TD_ACT.hand;if(!q||q.s!==11)return;try{const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;if(shAudio){shAudio.stop();shAudio=null}const ctx=new AC(),len=ctx.sampleRate*15,buf=ctx.createBuffer(1,len,ctx.sampleRate),d=buf.getChannelData(0);let last=0;for(let i=0;i<len;i++){const w=Math.random()*2-1;last=(last+.02*w)/1.02;d[i]=last*3.2}
      const src=ctx.createBufferSource();src.buffer=buf;const lp=ctx.createBiquadFilter();lp.type='lowpass';lp.frequency.value=700;const g=ctx.createGain();const t0=ctx.currentTime;g.gain.setValueAtTime(0,t0);for(let k=0;k<15;k+=5){g.gain.linearRampToValueAtTime(.5,t0+k+2.2);g.gain.linearRampToValueAtTime(.12,t0+k+5)}g.gain.linearRampToValueAtTime(0,t0+15);
      src.connect(lp);lp.connect(g);g.connect(ctx.destination);src.start();src.stop(t0+15);src.onended=()=>{ctx.close()};shAudio={stop:()=>{try{src.stop()}catch(e){}}};bayCaption('🐚 Áp tai nghe sóng · 15 giây tĩnh lặng',15000)}catch(e){}}
  // ---- bảng chọn bên dưới màn hình (1–2 chạm) và nút Sổ Sưu Tập / khay đang cầm
  const shUI=document.createElement('div');shUI.id='shellPanel';shUI.hidden=true;document.body.appendChild(shUI);
  const shPill=document.createElement('div');shPill.id='shellPills';shPill.hidden=true;document.body.appendChild(shPill);
  {const st=document.createElement('style');st.textContent='#shellPanel{position:fixed;z-index:74;left:50%;transform:translateX(-50%);top:calc(env(safe-area-inset-top,0px) + 64px);width:min(92vw,420px);max-height:62vh;overflow:auto;background:rgba(11,40,36,.94);border:1px solid #c8a96a;border-radius:16px;color:#f4e2b9;padding:10px 12px;font-size:13px;box-shadow:0 8px 24px rgba(0,0,0,.35)}#shellPanel[hidden],#shellPills[hidden]{display:none}#shellPanel .pv{float:right;width:96px;height:96px;margin:-2px -4px 4px 8px;border-radius:12px;background:radial-gradient(circle at 50% 40%,#eaf6f2,#9fc9c0)}#shellPanel h4{margin:0 0 4px;font-size:14px;color:#ffe9b8}#shellPanel p{margin:2px 0 8px;line-height:1.35}#shellPanel .row{display:flex;flex-wrap:wrap;gap:6px}#shellPanel button,#shellPills button{border:1px solid #c8a96a;border-radius:999px;background:rgba(20,16,12,.55);color:#f4e2b9;font-size:12.5px;padding:7px 11px;cursor:pointer}#shellPills button.shstop{background:#c8a96a;color:#0b2824;font-weight:700;font-size:14px;padding:9px 15px}#shellPanel button small{opacity:.75}#shellPanel button.shmain{background:#c8a96a;color:#0b2824;font-weight:600}#shellPanel input{width:100%;box-sizing:border-box;margin:4px 0 8px;padding:7px 9px;border-radius:10px;border:1px solid #c8a96a;background:#0b2824;color:#f4e2b9}#shellPills{position:fixed;z-index:73;right:12px;bottom:calc(env(safe-area-inset-bottom,0px) + 74px);display:flex;flex-direction:column;gap:6px;align-items:flex-end}#shellPanel .book{display:grid;grid-template-columns:repeat(3,1fr);gap:5px;margin:4px 0 8px}#shellPanel .book div{border:1px solid #5d6f5f;border-radius:10px;padding:5px;font-size:11px;line-height:1.25;min-height:34px}#shellPanel .book div.on{border-color:#c8a96a;background:rgba(200,169,106,.14)}#shellPanel.low{top:auto;bottom:calc(env(safe-area-inset-bottom,0px) + 10px);max-height:42vh;padding:8px 10px}#shellPanel .strip{display:grid;grid-template-columns:repeat(auto-fill,minmax(40px,1fr));gap:4px;max-height:132px;overflow-y:auto;margin:2px 0 8px}#shellPanel .strip div{aspect-ratio:1;border:1px solid #5d6f5f;border-radius:9px;background:radial-gradient(circle at 50% 40%,#f3efe4,#c9bfa6);cursor:pointer;overflow:hidden}#shellPanel .strip img{width:100%;height:100%;display:block;pointer-events:none}#shellPanel .strip div.on{outline:3px solid #ffe08a;outline-offset:-1px}#shellPanel .strip div.on{border-color:#ffe08a;background:rgba(255,224,138,.22);color:#fff3cf}body.sh-grid #islandPad,body.sh-grid #islandBack,body.sh-grid #shellPills,body.sh-grid #zenToolbar{display:none!important}#shellPanel .tabs{display:flex;gap:4px;margin-bottom:6px}#shellPanel .tabs button{padding:5px 8px;font-size:11.5px}';document.head.appendChild(st)}
  const shBtn=(lab,fn,main)=>{const b=document.createElement('button');b.type='button';b.innerHTML=lab;if(main)b.className='shmain';b.addEventListener('pointerdown',e=>e.stopPropagation());b.addEventListener('click',e=>{e.stopPropagation();fn()});return b};
  function shPanel(mode){if(mode===undefined)mode=TD_ACT.hand?'hand':null;shUI.replaceChildren();shUI.classList.toggle('low',mode==='grid');document.body.classList.toggle('sh-grid',mode==='grid'&&!!bayIsland);if(!mode||!bayIsland){shUI.hidden=true;return}shUI.hidden=false;shUI.onpointerdown=e=>e.stopPropagation();
    const h=document.createElement('h4'),p=document.createElement('p'),row=document.createElement('div');row.className='row';shUI.append(h,p,row);const A=TD_ACT,q=A.hand;
    if(mode==='cairndone'){const C=A.cairn;h.textContent='🪨 Tháp đá cân bằng trên bãi Đảo Yên';p.textContent='Bạn đã xếp xong '+(C?C.pile.length:7)+' viên. Chụp một tấm ảnh để giữ lại khoảnh khắc này.';if(A.cairnShot){const im=document.createElement('img');im.src=A.cairnShot;im.style.cssText='width:100%;border-radius:10px;margin:4px 0 8px';shUI.insertBefore(im,row);const a=document.createElement('a');a.href=A.cairnShot;a.download='lang-yen-dao-yen-thap-da-'+Date.now()+'.jpg';a.textContent='💾 Lưu ảnh về máy';a.style.cssText='display:inline-block;color:#ffe9b8;margin:0 0 8px';shUI.insertBefore(a,row)}
      row.append(shBtn('📷 Chụp ảnh lưu lại',cairnShot,!A.cairnShot),shBtn('🔁 Xếp lại',()=>{A.cairnShot=null;shPanel(null);cairnAdd()}),shBtn('✕ Đóng',()=>{A.cairnShot=null;shPanel(null)}))}
    else if(mode==='hand'&&q){shUI.insertBefore(shPreview(q),h);if(!q.clean){h.textContent='🐚 '+SH_SHAPE[q.s]+' phủ cát ẩm';p.textContent='Chưa thấy hết sắc màu thật bên dưới lớp cát. Nhúng qua làn nước trong ở mép sóng để cát tan ra.';row.append(shBtn('🌊 Nhúng rửa cát',shRinse,true),shBtn('↩ Đặt lại',()=>shDrop()))}
      else{h.textContent='✨ '+shName(q.s,q.t)+' · '+SH_TONE_IC[q.t]+' '+SH_TONE[q.t];p.textContent='«'+q.msg+'»';const left=3-shDayCount();
        if(A.carry!=null&&A.bins[A.carry].items.length<SH_CAP)row.append(shBtn(BIN_INFO[A.carry].ic+' Xếp vào '+BIN_INFO[A.carry].short,shIntoBin,true));
        else if(A.carry!=null)row.append(shBtn('⏹ '+BIN_INFO[A.carry].short+' đã đầy · Ngừng nhặt',()=>shPanel('stop'),true));
        if(A.mode!=='pick')row.append(shBtn('🎒 Cất Túi An Yên ('+Math.max(0,left)+'/3)',shToBag,A.carry==null),shBtn('🎨 Xếp hình trên cát',()=>shPanel('art')));row.append(shBtn('🌊 Thả biển',shToSea),shBtn('↩ Đặt lại cho biển',()=>shDrop()));if(q.s===11)row.append(shBtn('👂 Áp tai nghe sóng',shListen))}}
    else if(mode==='tray'){const b=A.bins[A.carry];if(!b){shPanel(null);return}h.textContent=BIN_INFO[A.carry].ic+' '+BIN_INFO[A.carry].name+' · '+b.items.length+'/'+SH_CAP;p.textContent=b.items.length?b.items.map(q=>shName(q.s,q.t)).join(' · '):'Chưa có vỏ nào. Nhặt và rửa vỏ rồi chọn «Xếp vào» để bày lên khay.';
      if(b.items.length>=3){const inp=document.createElement('input');inp.maxLength=40;inp.placeholder='Tên kỷ niệm (≤ 40 ký tự), ví dụ: Chiều nắng Đảo Yên';inp.addEventListener('keydown',e=>e.stopPropagation());shUI.insertBefore(inp,row);row.append(shBtn('🎒 Cất cả khay vào Túi An Yên',()=>shTrayToBag(inp.value),true))}
      if(b.items.length)row.append(shBtn('🎨 Xếp hình trên cát',()=>shPanel('art')));row.append(shBtn('↩ Đặt khay về chỗ cũ',()=>{binHold(b,false);A.carry=null;shPanel(null);shPills()}),shBtn('✕ Đóng',()=>shPanel(null)))}
    else if(mode==='art'&&A.mode==='pick'){shGridStart();return}
    else if(mode==='grid'){shGridPanel(h,p,row);}
    else if(mode==='art'){h.textContent='🎨 Xếp vỏ sò thành hình trên cát';p.textContent='Chọn kiểu xếp cho '+(A.art?A.art.list.length:shPending())+' vỏ sò. Vỏ sẽ tự xếp trên nền cát cao trước mặt bạn.';for(const k in SH_ART)row.append(shBtn(SH_ART[k],()=>shArrange(k),k==='hoa'));row.append(shBtn('← Quay lại',()=>{if(A.art)shArtUnlay();shPanel(A.mode==='pick'?'stop':A.leaveCont?'leave':undefined)}))}
    else if(mode==='leave'){const n=shPending();h.textContent='🏖 Trước khi rời bãi biển';p.textContent='Bạn đang giữ '+n+' vỏ sò. Hãy chọn vỏ thích nhất cất vào Túi An Yên, hoặc xếp thành hình trên cát rồi mới rời bãi nhé.';
      if(q&&q.clean&&shDayCount()<3)row.append(shBtn('🎒 Cất '+shName(q.s,q.t),shToBag));if(q&&!q.clean)row.append(shBtn('🌊 Nhúng rửa cát vỏ trên tay',()=>{A.leaveCont=null;shRinse()}));
      if(A.carry!=null&&A.bins[A.carry].items.length>=3)row.append(shBtn('🎒 Cất cả '+BIN_INFO[A.carry].short+' vào Túi',()=>shPanel('tray')));
      row.append(shBtn('🎨 Xếp hình trên cát',()=>shPanel('art'),true),shBtn('↩ Ở lại bãi',()=>{A.leaveCont=null;shPanel(undefined)}))}
    else if(mode==='intro'){h.textContent='🐚 Nhặt vỏ sò Vịnh Yên';p.textContent='Trên bãi cát có 36 loại vỏ sò, ốc Vịnh Yên. Chọn một đồ đựng, ngồi xuống cầm lên rồi đi nhặt vỏ trên cát: mỗi vỏ nhặt lên tự vào đồ đựng (đựng được tới 36 vỏ). Nhặt tới đâu vỏ hiện thêm tới đó. Khi ngừng nhặt, bạn chọn cất vào Túi An Yên, xếp hình trên bãi cát hoặc trả về biển.';
      BIN_INFO.forEach((b,k)=>row.append(shBtn(b.ic+' '+b.name+' <small>· '+b.style+'</small>',()=>shChoose(k),k===0)));row.append(shBtn('📖 Sổ Sưu Tập '+Object.keys(shBook()).length+'/36',()=>shPanel({book:0})),shBtn('✕ Để sau',()=>shPanel(null)))}
    else if(mode==='picked'){const b=A.bins[A.carry],L=b?b.items:[],q2=A.last;if(q2)shUI.insertBefore(shPreview(q2),h);h.textContent=(BIN_INFO[A.carry]?.ic||'')+' Vỏ sò đã nhặt · '+L.length+'/'+SH_CAP;p.textContent=q2?'Vừa nhặt: '+SH_TONE_IC[q2.t]+' '+shName(q2.s,q2.t)+'. ':'';
      if(L.length<SH_CAP)row.append(shBtn('🐚 Nhặt tiếp',()=>shPanel(null),true));else p.textContent+=' '+BIN_INFO[A.carry].short+' đã đầy '+SH_CAP+' vỏ.';row.append(shBtn('⏹ Ngừng nhặt',()=>shPanel('stop'),L.length>=SH_CAP));if(q2&&q2.s===11)row.append(shBtn('👂 Áp tai nghe sóng',()=>shListen(q2)))}
    else if(mode==='bag2'){const b=A.bins[A.carry],L=b?b.items:[];A.sel=A.sel||new Set();const n=[...A.sel].filter(x=>L.includes(x)).length,left=3-shDayCount();h.textContent='🎒 Chọn vỏ cất vào Túi An Yên';
      p.textContent='Chạm từng vỏ để chọn: 🎒 cất vào Túi An Yên, 🌊 trả lại biển. '+(n>=3?'Đã chọn '+n+' vỏ: cất chung thành 1 '+BIN_INFO[A.carry].short.toLowerCase()+' (chiếm 1 ô).':'Chọn từ 3 vỏ trở lên để cất cả khay (1 ô, tối đa '+SH_CAP+' vỏ), hoặc 1–2 vỏ lẻ (hôm nay còn '+Math.max(0,left)+'/3 vỏ lẻ).');
      const ul=document.createElement('div');ul.className='row';ul.style.marginBottom='8px';L.forEach(x=>{const on=A.sel.has(x);ul.append(shBtn((on?'🎒 ':'🌊 ')+shName(x.s,x.t),()=>{on?A.sel.delete(x):A.sel.add(x);shPanel('bag2')},on))});shUI.insertBefore(ul,row);
      if(n>=3){const inp=document.createElement('input');inp.maxLength=40;inp.value=A.trayName||'';inp.placeholder='Tên kỷ niệm (≤ 40 ký tự), ví dụ: Chiều nắng Đảo Yên';inp.addEventListener('keydown',e=>e.stopPropagation());inp.addEventListener('input',()=>{A.trayName=inp.value});shUI.insertBefore(inp,row)}
      row.append(shBtn('✓ Xác nhận'+(n?' cất '+n+' vỏ':' · trả hết về biển'),shBagConfirm,true),shBtn('← Quay lại',()=>shPanel('stop')))}
    else if(mode==='artdone'){h.textContent='🌅 Hình vỏ sò trên bờ biển Đảo Yên';p.textContent='Hình được giữ lại trên bãi cát tới khi bạn chọn «Dọn sạch bãi biển».';if(A.shot){const im=document.createElement('img');im.src=A.shot;im.style.cssText='width:100%;border-radius:10px;margin:4px 0 8px';shUI.insertBefore(im,row);const a=document.createElement('a');a.href=A.shot;a.download='lang-yen-dao-yen-vo-so-'+Date.now()+'.jpg';a.textContent='💾 Lưu ảnh về máy';a.style.cssText='display:inline-block;color:#ffe9b8;margin:0 0 8px';shUI.insertBefore(a,row)}
      row.append(shBtn('📷 Chụp ảnh lưu lại',shArtShot,!A.shot),shBtn('🐚 Nhặt thêm',shArtMore),shBtn('🔁 Xếp lại',shArtRedo),shBtn('🚶 Rời đi',()=>shEnd()))}
    else if(mode==='stop'){const L=shAll();h.textContent='⏹ Dừng nhặt vỏ sò';p.textContent=L.length?'Bạn đã nhặt '+L.length+' vỏ: '+L.map(q=>shName(q.s,q.t)).join(' · ')+'. Bạn muốn gửi chúng về đâu?':'Bạn chưa giữ vỏ nào. Đặt đồ đựng về chỗ cũ và kết thúc nhé?';
      if(L.length)row.append(shBtn('🎒 Cất vào Túi An Yên',()=>{A.sel=new Set();shPanel('bag2')},true),shBtn('🎨 Xếp hình trên bãi cát',()=>shPanel('art')),shBtn('🌊 Trả hết về biển',shLetGo));else row.append(shBtn('✓ Kết thúc',()=>shEnd(),true));
      row.append(shBtn('↩ Nhặt tiếp',()=>{A.leaveCont=null;shPanel(undefined)}))}
    else if(mode==='bag'){const L=shAll().filter(q=>q.clean),left=3-shDayCount(),b=A.carry!=null?A.bins[A.carry]:null;h.textContent='🎒 Bỏ vào Túi An Yên';p.textContent='Chọn vỏ thích nhất (hôm nay còn '+Math.max(0,left)+'/3 lượt), hoặc cất cả '+(b?BIN_INFO[A.carry].short:'khay')+' khi có 3–5 vỏ (chỉ chiếm 1 ô). Những vỏ còn lại sẽ được trả về biển.';
      if(b&&b.items.length>=3){const inp=document.createElement('input');inp.maxLength=40;inp.placeholder='Tên kỷ niệm (≤ 40 ký tự), ví dụ: Chiều nắng Đảo Yên';inp.addEventListener('keydown',e=>e.stopPropagation());shUI.insertBefore(inp,row);row.append(shBtn('🎒 Cất cả '+BIN_INFO[A.carry].short+' ('+b.items.length+' vỏ)',()=>shTrayToBag(inp.value),true))}
      if(left>0)L.forEach(q=>row.append(shBtn('🎒 '+shName(q.s,q.t),()=>shOneToBag(q))));if(!L.length&&!(b&&b.items.length>=3))p.textContent='Chưa có vỏ nào đã rửa sạch để cất. Hãy nhúng rửa cát trước nhé.';row.append(shBtn('← Quay lại',()=>shPanel('stop')))}
    else if(mode==='clean'){h.textContent='🧹 Dọn sạch bãi biển?';p.textContent='Các hình xếp bằng vỏ sò ('+A.decor.length+' vỏ) sẽ được dọn đi, cát lại phẳng mịn.';row.append(shBtn('🧹 Dọn sạch',shClearDecor,true),shBtn('✕ Giữ lại',()=>shPanel(undefined)))}
    else if(mode&&mode.book!=null){const B=shBook(),t=mode.book;h.textContent='📖 Sổ Sưu Tập 36 loại · '+Object.keys(B).length+'/36';const tabs=document.createElement('div');tabs.className='tabs';SH_TONE.forEach((n,i)=>tabs.append(shBtn(SH_TONE_IC[i]+' '+n,()=>shPanel({book:i}),i===t)));p.replaceWith(tabs);
      const grid=document.createElement('div');grid.className='book';for(let s=0;s<SH_N;s++){const c=document.createElement('div'),e=B[shKey(s,t)];if(e)c.className='on';c.textContent=String(s+1).padStart(2,'0')+' '+(e?SH_NAME[s][t]+' · '+SH_SHAPE[s]:'· · ·');grid.append(c)}shUI.insertBefore(grid,row);row.append(shBtn('✕ Đóng',()=>shPanel(null)))}}
  /* xoay 360° ngắm vỏ trên tay: một khung 3D nhỏ dùng chung, chỉ chạy khi bảng đang mở */
  let shPV=null;function shPreview(q){if(!shPV){const cv=document.createElement('canvas');cv.className='pv';cv.width=192;cv.height=192;const r=new THREE.WebGLRenderer({canvas:cv,antialias:true,alpha:true});r.setPixelRatio(1);r.setSize(192,192,false);
      const sc=new THREE.Scene();sc.add(new THREE.HemisphereLight('#ffffff','#9a8c70',1.6));const dl=new THREE.DirectionalLight('#ffffff',1.6);dl.position.set(2,3,2);sc.add(dl);const cam=new THREE.PerspectiveCamera(32,1,.05,20);cam.position.set(0,1.25,1.9);cam.lookAt(0,.15,0);
      shPV={cv,r,sc,cam,m:null,raf:0};const loop=()=>{shPV.raf=0;if(!shPV.cv.isConnected||shUI.hidden)return;if(shPV.m)shPV.m.rotation.y+=.02;shPV.r.render(shPV.sc,shPV.cam);shPV.raf=requestAnimationFrame(loop)};shPV.loop=loop}
    if(shPV.m)shPV.sc.remove(shPV.m);const m=new THREE.Mesh(shGeo(q.s,q.t),q.clean?shMat(q.s):SH_SANDY);m.scale.setScalar(1.05);m.position.y=-.05;shPV.sc.add(m);shPV.m=m;if(!shPV.raf)shPV.raf=requestAnimationFrame(shPV.loop);return shPV.cv}
  function shPills(){shPill.replaceChildren();if(!bayIsland){shPill.hidden=true;return}shPill.hidden=false;const A=TD_ACT;
    if(A.mode==='pick'){const st=shBtn('⏹ Ngừng nhặt',()=>{if(TD_ACT.art)shArtUnlay();shPanel('stop')});st.className='shstop';shPill.append(st)}
    if(A.carry!=null){const b=A.bins[A.carry];shPill.append(shBtn(BIN_INFO[A.carry].ic+' '+BIN_INFO[A.carry].short+' '+b.items.length+'/'+SH_CAP,()=>shPanel(A.mode==='pick'?'picked':'tray')))}
    if(A.mode==='pick')shPill.append(shBtn('📖 Sổ '+Object.keys(shBook()).length+'/36',()=>shPanel({book:0})));if(A.decor.length&&!A.mode)shPill.append(shBtn('🧹 Dọn sạch bãi biển',()=>shPanel('clean')))}
  function tdShellsRefresh(){const A=TD_ACT;if(!A.decorOk&&A.g){A.decorOk=true;shDecorLoad()}A.spawned=A.beach.length;A.nextSpawn=0;setTimeout(shPills,0)}
  // ---- Xếp vỏ sò thành hình trên cát: hoa, trái tim, mandala hoặc tác phẩm tự do; giữ lại trên bãi tới khi bấm «Dọn sạch bãi biển»
  const SH_DECOR_KEY='yen_shell_decor_v1';
  function shDecorSave(){try{localStorage.setItem(SH_DECOR_KEY,JSON.stringify(TD_ACT.decor.map(q=>({s:q.s,t:q.t,x:+q.x.toFixed(2),z:+q.z.toFixed(2),r:+q.r.toFixed(2)}))))}catch(e){}}
  function shDecorLoad(){let L=[];try{L=JSON.parse(localStorage.getItem(SH_DECOR_KEY)||'[]')||[]}catch(e){}for(const d of L.slice(0,120)){if(!(d.s>=0&&d.s<SH_N&&d.t>=0&&d.t<SH_T)||!Number.isFinite(d.x)||!Number.isFinite(d.z))continue;const g=new THREE.Group(),m=shMesh(d.s,d.t,false);g.add(m);g.position.set(d.x,tdTerrainY(d.x,d.z)+.01,d.z);g.rotation.y=d.r||0;TD_ACT.g.add(g);TD_ACT.decor.push({s:d.s,t:d.t,x:d.x,z:d.z,r:d.r||0,g})}}
  function shPattern(kind,n,v=0){const P=[],sc=1+.18*(v%3),rot=v*.7;if(kind==='hoa'){P.push([0,0]);let k=1;for(let ring=1;k<n;ring++){const c=ring*6,r=.32*ring;for(let i=0;i<c&&k<n;i++,k++){const a=(i+(ring%2?0:.5))/c*TAU;P.push([Math.cos(a)*r,Math.sin(a)*r])}}}
    else if(kind==='tim'){const sc=Math.max(.045,Math.min(.12,.02*n+.03));for(let i=0;i<n;i++){const t=i/n*TAU,hx=16*Math.pow(Math.sin(t),3),hz=13*Math.cos(t)-5*Math.cos(2*t)-2*Math.cos(3*t)-Math.cos(4*t);P.push([hx*sc*.55,hz*sc*.55])}}
    else if(kind==='mandala'){const rings=[1,6,12,18,24];let k=0;for(let ri=0;k<n;ri++){const c=rings[Math.min(ri,4)],r=.34*ri;for(let i=0;i<c&&k<n;i++,k++){const a=(i+ri*.5)/c*TAU;P.push([Math.cos(a)*r,Math.sin(a)*r])}}}
    else for(let i=0;i<n;i++){const a=i*(2.399+.3*(v%4)),r=.22*Math.sqrt(i+.6);P.push([Math.cos(a)*r,Math.sin(a)*r])}
    return kind==='tim'?P.map(([x,z])=>[x*sc,z*sc]):P.map(([x,z])=>[(x*Math.cos(rot)-z*Math.sin(rot))*sc,(x*Math.sin(rot)+z*Math.cos(rot))*sc])}
  const SH_ART={hoa:'🌸 Hoa',tim:'❤️ Trái tim',mandala:'🔆 Mandala',tudo:'🌀 Tác phẩm tự do'};
  function shArrange(kind){const A=TD_ACT,I=bayIsland;if(!I)return;const list=[];if(A.hand)list.push(A.hand);if(A.carry!=null)list.push(...A.bins[A.carry].items);if(!list.length){bayCaption('Chưa có vỏ sò nào để xếp · hãy nhặt vỏ trên bãi trước',3000);return}
    const cy=(I.cam0||0)+viewYaw,fx=Math.sin(cy),fz=Math.cos(cy);let cx=I.x+fx*2.2,cz=I.z+fz*2.2;if(!tdWalkable(cx,cz)){cx=I.x+Math.sin(I.yaw)*1.8;cz=I.z+Math.cos(I.yaw)*1.8}
    const pts=shPattern(kind,list.length);list.forEach((q,i)=>{const [px,pz]=pts[i],x=cx+px*fz+pz*fx,z=cz-px*fx+pz*fz;/* xoay hình theo hướng nhìn: đỉnh hình về phía xa */
      const w=new THREE.Vector3();q.g.getWorldPosition(w);TU_DAO.group.worldToLocal(w);q.g.parent&&q.g.parent.remove(q.g);TU_DAO.group.add(q.g);q.g.position.copy(w);q.g.scale.setScalar(1);if(!q.clean){q.clean=true;q.m.material=shMat(q.s)}
      const r=Math.atan2(x-cx,z-cz);q.g.rotation.set(0,r,0);q.g.traverse(o=>{o.userData.tuDao=null});A.tweens.push({g:q.g,from:w,to:new THREE.Vector3(x,tdTerrainY(x,z)+.01,z),t:-i*.12,dur:.8});A.decor.push({s:q.s,t:q.t,x,z,r,g:q.g})});
    A.hand=null;if(A.carry!=null)A.bins[A.carry].items=[];shDecorSave();shSeq(.9,()=>{},null);bayCaption('🎨 Đã xếp '+list.length+' vỏ sò thành '+SH_ART[kind].slice(2).toLowerCase()+' trên cát · hình được giữ lại tới khi bạn dọn sạch bãi',5000);shPanel(null);shPills();if(A.mode==='pick')setTimeout(()=>shEnd(true),1600);else shAfterChoice()}
  function shClearDecor(){const A=TD_ACT;for(const q of A.decor)q.g.parent&&q.g.parent.remove(q.g);A.decor=[];shDecorSave();bayCaption('🧹 Đã dọn sạch bãi biển · cát lại phẳng mịn',3500);shPanel(null);shPills()}
  // ---- Hoạt động Nhặt vỏ sò: giới thiệu → chọn đồ đựng → ngồi cầm lên → ra mép biển nhặt → Dừng nhặt → Túi An Yên / xếp hình / buông bỏ → về như cũ
  function shIntro(){if(!bayIsland)return;const A=TD_ACT;if(A.mode==='pick'){shPanel(A.hand?'hand':'stop');return}if(A.mode)return;tdStand();shPanel('intro')}
  function shGoStation(){const A=TD_ACT,S=A.station;if(!S||!bayIsland)return;const [sx,sz]=tdNearStand(S.x,S.z,1.35,false);tdGoTo(sx,sz,'station','🐚 Đang ra chỗ để giỏ, khay nhặt vỏ sò…')}
  function shChoose(k){const A=TD_ACT,I=bayIsland;if(!I)return;shPanel(null);A.mode='go';A.pickBin=k;A.camSave={cam0:I.cam0,vy:viewYaw};const q=A.bins[k];const [sx,sz]=tdNearStand(q.x,q.z,.8,false);tdGoTo(sx,sz,'bin:'+k,BIN_INFO[k].ic+' Đang tới lấy '+BIN_INFO[k].name+'…')}
  function shBegin(){const A=TD_ACT,I=bayIsland;if(!I)return;/* trước mỗi lượt nhặt: tự dọn sạch bãi (hình vỏ sò xếp lần trước + vỏ còn sót trên cát); vườn đá giữ nguyên */if(A.decor.length){for(const q of A.decor)q.g.parent&&q.g.parent.remove(q.g);A.decor=[];shDecorSave()}shClearBeach();const a=Math.atan2(I.z-TD_O[1],I.x-TD_O[0]);/* đi thẳng ra phía biển, dừng trước mép sóng một chút */
    let p=[I.x,I.z];const e0=tdSandEdge(a)+.035;for(let d=0;d<8;d+=.3){const x=I.x-Math.cos(a)*d,z=I.z-Math.sin(a)*d;if(!tdWalkable(x,z))break;const [r]=tdRho(x,z);if(r<e0)break;p=[x,z]}/* lùi vào bãi cát khô, quay mặt ra biển: vỏ nằm trên cát trước mặt */
    A.mode='pick';tdGoTo(p[0],p[1],'pickstart',BIN_INFO[A.carry].ic+' Cầm '+BIN_INFO[A.carry].short+' ra bãi cát…');shPills()}
  function shPickStart(){const A=TD_ACT,I=bayIsland;if(!I)return;const a=Math.atan2(I.z-TD_O[1],I.x-TD_O[0]),sea=Math.atan2(Math.cos(a),Math.sin(a));I.yaw=sea;I.cam0=sea;viewYaw=0;/* camera quay ra biển, sau lưng người */
    A.spawned=A.beach.length;A.focus=a;A.nextSpawn=performance.now()+600;
    bayCaption('🐚 Vỏ sò nằm trên bãi cát trước mặt · chạm vào vỏ để ngồi xuống nhặt',6000);shPills()}
  function shClearBeach(){const A=TD_ACT;for(const q of A.beach)q.g.parent&&q.g.parent.remove(q.g);A.beach=[];A.queue=0}
  function shAll(){const A=TD_ACT,L=[];if(A.hand)L.push(A.hand);if(A.carry!=null)L.push(...A.bins[A.carry].items);return L}
  function shSeaAll(quiet){const A=TD_ACT,I=bayIsland;const L=shAll();if(!I){A.hand=null;if(A.carry!=null)A.bins[A.carry].items=[];return 0}const a=Math.atan2(I.z-TD_O[1],I.x-TD_O[0]);
    L.forEach((q,i)=>{const w=new THREE.Vector3();q.g.getWorldPosition(w);TU_DAO.group.worldToLocal(w);q.g.parent&&q.g.parent.remove(q.g);TU_DAO.group.add(q.g);q.g.position.copy(w);q.g.scale.setScalar(.8);const s=(i-(L.length-1)/2)*.35;
      A.tweens.push({g:q.g,from:w,to:new THREE.Vector3(w.x+Math.cos(a+s)*7,-.8,w.z+Math.sin(a+s)*7),t:-i*.18,dur:1.3,kill:true})});
    A.hand=null;if(A.carry!=null)A.bins[A.carry].items=[];if(!quiet&&L.length)bayCaption('🍃 Đã buông '+L.length+' vỏ về biển · nhẹ lòng theo bọt sóng',4500);return L.length}
  function shLetGo(){shPanel(null);shSeaAll(false);shSeq(1.4,()=>{},()=>shEnd(true),false)}
  function shOneToBag(q){const A=TD_ACT,n=shDayCount();if(n>=3){bayCaption('🎒 Hôm nay đã cất đủ 3 vỏ vào Túi An Yên · mai lại ghé nhé',4000);return}
    try{localStorage.setItem(SH_DAY_KEY,JSON.stringify({d:shToday(),n:n+1}))}catch(e){}window.dispatchEvent(new CustomEvent('anyen-bag-add',{detail:{kind:'shell',label:shName(q.s,q.t),own:true,data:{s:q.s,t:q.t,where:'Đảo Yên'}}}));
    if(A.hand===q)A.hand=null;else if(A.carry!=null){const b=A.bins[A.carry];b.items=b.items.filter(x=>x!==q)}q.g.parent&&q.g.parent.remove(q.g);
    const rest=shSeaAll(true);bayCaption('🎒 Đã cất '+shName(q.s,q.t)+' vào Túi An Yên (hôm nay '+(n+1)+'/3)'+(rest?' · '+rest+' vỏ còn lại trả về biển':''),5000);shPanel(null);shSeq(1.3,()=>{},()=>shEnd(true),false)}
  function shEnd(silent){const A=TD_ACT,I=bayIsland;if(A.art){for(const q of A.art.cells)q&&q.g.parent&&q.g.parent.remove(q.g);shGridHide(A.art);A.art=null}A.artCam=null;A.done=null;A.shot=null;A.sel=null;if(A.carry!=null){const b=A.bins[A.carry];for(const q of b.items)b.g.remove(q.g);b.items=[]}if(A.hand){A.hand.g.parent&&A.hand.g.parent.remove(A.hand.g);A.hand=null}if(A.carry!=null){binHold(A.bins[A.carry],false);A.carry=null}A.mode=null;A.focus=null;
    if(I&&A.camSave){I.cam0=A.camSave.cam0;viewYaw=A.camSave.vy||0}A.camSave=null;shPanel(null);A.spawned=A.beach.length;shPills();
    if(!silent)bayCaption('🐚 Đã đặt đồ đựng về chỗ cũ · kết thúc nhặt vỏ sò',3500);else setTimeout(()=>bayCaption('🌿 Kết thúc nhặt vỏ sò · đồ đựng đã về chỗ cũ trên bãi',3500),2200);
    const c=A.leaveCont;A.leaveCont=null;if(c)setTimeout(c,2600)}
  /* 3.41: mất mạng hoặc đóng trang giữa lúc nhặt vỏ sò: tự trả giỏ về chỗ cũ và xoá vỏ tạm */
  const shNetDrop=e=>{if(!TD_ACT.mode)return;TD_ACT.leaveCont=null;shEnd(true);tdBinsHome();shPanel(null);shPills();if(e&&e.type==='offline')bayCaption('📶 Mất kết nối · đã trả giỏ về chỗ cũ, vỏ sò tạm trả về biển',4500)};
  window.addEventListener("offline",shNetDrop);window.addEventListener("pagehide",shNetDrop);
  /* Link thẳng từ AnSense (index.html?vao=xep-da | nhat-so): neo tàu ở cầu tàu Đảo Yên, lên đảo rồi mở hoạt động. */
   window.anyenIslandAct=act=>{if(!bayMode)return false;const was=!!bayIsland;if(!was){dropPause();endTour(false);const S=bayShip;S.path=[];S.dest=null;S.stopped=true;S.speed=0;S.glide=null;S.x=TU_DAO.dock[0];S.z=TU_DAO.dock[1];S.heading=S.bh=TU_DAO.heading;const [hx,hz]=tdPierHead(),[bx,bz]=shipBow(S);S.x+=hx-bx;S.z+=hz-bz;saveBayState();islandGo('pier')}const fire=n=>{if(!bayIsland||(act==='cairn'&&!TD_ACT.cairn)||TD_ACT.mode){if(n<15)setTimeout(()=>fire(n+1),1000);return}window.dispatchEvent(new CustomEvent('anyen-island-act',{detail:{act}}))};setTimeout(()=>fire(0),was?300:2800);return true};
   window.addEventListener('anyen-island-act',e=>{if(!bayMode||!bayIsland){bayCaption&&bayMode&&bayCaption('🏝 Lên Đảo Yên để chơi hoạt động này',3000);return}const k=e.detail?.act;if(k==='cairn'){if(TD_ACT.mode){shGuardLeave(()=>tdGoCairn());return}tdGoCairn()}else if(k==='shell'){if(TD_ACT.mode==='pick'){shPanel(TD_ACT.hand?'hand':'stop');return}shGoStation();shPanel('intro')}});
  // ---- Cất Túi An Yên: chọn vỏ cất / vỏ trả biển
  function shBagConfirm(){const A=TD_ACT,b=A.bins[A.carry];if(!b)return;const L=b.items,keep=L.filter(x=>A.sel&&A.sel.has(x));
    if(keep.length>=3){const label=String(A.trayName||'').trim().slice(0,40)||BIN_INFO[A.carry].short+' '+new Date().toLocaleDateString('vi-VN');window.dispatchEvent(new CustomEvent('anyen-bag-add',{detail:{kind:'shelltray',label,own:true,data:{tray:A.carry,shells:keep.map(q=>[q.s,q.t]),where:'Đảo Yên'}}}));bayCaption('🎒 Đã cất '+BIN_INFO[A.carry].short+' «'+label+'» ('+keep.length+' vỏ) vào Túi An Yên · chiếm 1 ô',5000)}
    else if(keep.length){const n=shDayCount();if(n+keep.length>3){bayCaption('🎒 Hôm nay chỉ còn cất được '+Math.max(0,3-n)+' vỏ lẻ · chọn ít hơn, hoặc chọn từ 3 vỏ trở lên để cất cả khay',4500);return}try{localStorage.setItem(SH_DAY_KEY,JSON.stringify({d:shToday(),n:n+keep.length}))}catch(e){}
      for(const q of keep)window.dispatchEvent(new CustomEvent('anyen-bag-add',{detail:{kind:'shell',label:shName(q.s,q.t),own:true,data:{s:q.s,t:q.t,where:'Đảo Yên'}}}));bayCaption('🎒 Đã cất '+keep.map(q=>shName(q.s,q.t)).join(', ')+' vào Túi An Yên',5000)}
    for(const q of keep){b.g.remove(q.g)}b.items=L.filter(x=>!keep.includes(x));const rest=shSeaAll(true);if(rest)setTimeout(()=>bayCaption('🌊 '+rest+' vỏ còn lại đã trả về biển',3500),2600);A.sel=null;A.trayName='';shPanel(null);shSeq(1.4,()=>{},()=>shEnd(true),false)}
  // ---- Xếp hình trên bãi cát: tự xếp → hỏi ưng chưa → ưng thì camera lên cao ngắm bờ biển, chụp ảnh / nhặt thêm / xếp lại
  function shArtSpot(){const I=bayIsland,A=TD_ACT,a0=Math.atan2(I.z-TD_O[1],I.x-TD_O[0]);/* bãi cát trống, cao, xa mép nước: cả 36 ô đều nằm trên cát khô, không đè đồ vật */
    const things=[...A.decor,...A.beach,...A.bins,A.station,A.cairn].filter(Boolean).map(o=>[o.x,o.z]),half=(GRID_N-1)/2*GRID_S+.3;
    const ok=(cx,cz,f)=>{const rx=f[1],rz=-f[0];for(let i=-1;i<=1;i+=.5)for(let j=-1;j<=1;j+=.5){const x=cx+rx*i*half+f[0]*j*half,z=cz+rz*i*half+f[1]*j*half,[r,a]=tdRho(x,z),se=tdSandEdge(a);if(r<se+.012||r>se+(1-se)*.5||!tdWalkable(x,z))return false;for(const [ox,oz] of things)if(Math.hypot(x-ox,z-oz)<.7)return false}return true};
    let best=null;for(let k=0;k<=40&&!best;k++)for(const sg of k?[1,-1]:[1]){const a=a0+sg*k*.025,se=tdSandEdge(a);for(const u of [.3,.22,.38,.15]){const r=(se+(1-se)*u)*tdR(a),cx=TD_O[0]+Math.cos(a)*r,cz=TD_O[1]+Math.sin(a)*r,f=[-Math.cos(a),-Math.sin(a)];if(ok(cx,cz,f)){best=[cx,cz,a,f];break}}if(best)break}
    if(best)return best;for(const d of [2.4,2,1.6,2.8,1.2]){const x=I.x-Math.cos(a0)*d,z=I.z-Math.sin(a0)*d,[r]=tdRho(x,z);if(tdWalkable(x,z)&&r>tdSandEdge(a0)-.02)return [x,z,a0]}return [I.x-Math.cos(a0)*1.6,I.z-Math.sin(a0)*1.6,a0]}
  /* lưới 6×6 ô mờ trên cát: khách tự chọn vỏ trong giỏ rồi chạm ô để đặt, chạm vỏ đã đặt để nhấc lên đổi chỗ */
  const GRID_N=6,GRID_S=.46,GRID_G=new THREE.PlaneGeometry(GRID_S*.86,GRID_S*.86).rotateX(-Math.PI/2),GRID_M=new THREE.MeshBasicMaterial({color:'#fffaf0',transparent:true,opacity:.26,depthWrite:false}),GRID_MS=new THREE.MeshBasicMaterial({color:'#ffe08a',transparent:true,opacity:.5,depthWrite:false});
  function shGridStart(){const A=TD_ACT,I=bayIsland;if(!I)return;let R=A.art;const b=A.bins[A.carry];if(A.hand&&b&&b.items.length<SH_CAP){const q=A.hand;A.hand=null;q.clean=true;q.g.parent&&q.g.parent.remove(q.g);b.g.add(q.g);q.g.position.set(...binSock(A.carry,b.items.length));q.g.scale.setScalar(.4);b.items.push(q)}
    if(!R){if(!b||!b.items.length){bayCaption('Chưa có vỏ sò nào để xếp',3000);return}const [cx,cz,a,ff]=shArtSpot(),fx=cx-I.x,fz=cz-I.z,fl=Math.hypot(fx,fz)||1;R=A.art={cx,cz,a,f:ff||[fx/fl,fz/fl],cells:Array(GRID_N*GRID_N).fill(null),sel:null};if(ff){const sx=cx-ff[0]*((GRID_N/2)*GRID_S+.9),sz=cz-ff[1]*((GRID_N/2)*GRID_S+.9);if(tdWalkable(sx,sz))tdGoTo(sx,sz,null,null)}/* khách bước tới đứng trước lưới, phía biển */}
    if(!R.grid){const g=new THREE.Group(),[fx,fz]=R.f,rx=fz,rz=-fx;R.pos=[];R.cellM=[];for(let i=0;i<GRID_N*GRID_N;i++){const row=Math.floor(i/GRID_N),col=i%GRID_N,u=(col-(GRID_N-1)/2)*GRID_S,w=((GRID_N-1)/2-row)*GRID_S,x=R.cx+rx*u+fx*w,z=R.cz+rz*u+fz*w;R.pos.push([x,z]);
        const m=new THREE.Mesh(GRID_G,GRID_M);m.position.set(x,tdTerrainY(x,z)+.03,z);m.rotation.y=Math.atan2(fx,fz);m.renderOrder=2;m.userData.tuDao='cell';m.userData.cell=i;g.add(m);R.cellM.push(m)}TU_DAO.group.add(g);R.grid=g}
    R.cells.forEach((q,i)=>{if(q)q.g.traverse(o=>{o.userData.tuDao='artshell';o.userData.cell=i})});
    I.yaw=Math.atan2(R.cx-I.x,R.cz-I.z);if(!R.sel&&b&&b.items.length)R.sel=b.items[0];shGridMark();shPanel('grid');
    bayCaption('🎨 Chọn vỏ trong giỏ rồi chạm vào ô trên cát để đặt · xếp tới khi nào ưng thì bấm «Xong»',6000)}
  function shGridMark(){const R=TD_ACT.art;if(!R||!R.cellM)return;const k=R.sel?R.cells.indexOf(R.sel):-1;R.cellM.forEach((m,i)=>{m.material=i===k?GRID_MS:GRID_M});R.cells.forEach((q,i)=>{if(q){const [x,z]=R.pos[i];q.g.position.y=tdTerrainY(x,z)+.01+(q===R.sel?.12:0)}})}
  function shGridPut(q,i){const A=TD_ACT,R=A.art,b=A.bins[A.carry],[x,z]=R.pos[i];A.tweens=A.tweens.filter(w=>w.g!==q.g);const w=new THREE.Vector3();q.g.getWorldPosition(w);TU_DAO.group.worldToLocal(w);
    if(b&&b.items.includes(q)){b.items=b.items.filter(o=>o!==q);b.items.forEach((o,k)=>{o.g.position.set(...binSock(A.carry,k));o.g.scale.setScalar(k<5?.55:.4)})}const old=R.cells.indexOf(q);if(old>=0)R.cells[old]=null;
    q.g.parent&&q.g.parent.remove(q.g);TU_DAO.group.add(q.g);q.g.position.copy(w);q.g.scale.setScalar(1);const r=Math.atan2(R.f[0],R.f[1]);q.g.rotation.set(0,r,0);q.ax=x;q.az=z;q.ar=r;q.g.traverse(o=>{o.userData.tuDao='artshell';o.userData.cell=i;if(o.geometry===SH_HIT_G)o.scale.setScalar(.26)});R.cells[i]=q;
    A.tweens.push({g:q.g,from:w,to:new THREE.Vector3(x,tdTerrainY(x,z)+.01,z),t:0,dur:.45})}
  function shGridBack(q){const A=TD_ACT,R=A.art,b=A.bins[A.carry];if(!R||!b)return;const i=R.cells.indexOf(q);if(i>=0)R.cells[i]=null;A.tweens=A.tweens.filter(w=>w.g!==q.g);q.g.parent&&q.g.parent.remove(q.g);b.g.add(q.g);q.g.position.set(...binSock(A.carry,b.items.length));q.g.scale.setScalar(b.items.length<5?.55:.4);q.g.traverse(o=>{o.userData.tuDao='bin';o.userData.bin=A.carry});b.items.push(q)}
  function shGridTap(i){const A=TD_ACT,R=A.art,b=A.bins[A.carry];if(!R||i==null)return;const at=R.cells[i],s=R.sel;
    if(s&&at===s){R.sel=null}/* chạm lại vỏ đang nhấc: đặt xuống, bỏ chọn */
    else if(at&&(!s||R.cells.indexOf(s)<0))R.sel=at;/* chạm vỏ đã đặt: nhấc lên để dời / đổi chỗ */
    else if(s){const from=R.cells.indexOf(s);shGridPut(s,i);if(at&&at!==s){if(from>=0)shGridPut(at,from);else shGridBack(at)}/* ô đã có vỏ: đổi chỗ, hoặc vỏ cũ về giỏ */R.sel=b&&b.items.length&&from<0?b.items[0]:null}
    else if(at)R.sel=at;/* chưa chọn gì: nhấc vỏ đã đặt lên để đổi chỗ */
    else if(b&&b.items.length){shGridPut(b.items[0],i);R.sel=b&&b.items.length?b.items[0]:null}
    shGridMark();shPanel('grid')}
  function shGridPanel(h,p,row){const A=TD_ACT,R=A.art,b=A.bins[A.carry];if(!R){shPanel(null);return}const L=b?b.items:[],n=R.cells.filter(Boolean).length,s=R.sel,placed=s&&R.cells.includes(s);
    h.textContent='🎨 Xếp vỏ sò vào 36 ô · đã đặt '+n+'/'+(n+L.length);p.textContent=s?(placed?'Đang nhấc 1 vỏ: chạm ô khác để dời tới (ô có vỏ thì đổi chỗ), chạm lại để đặt xuống.':'Đã chọn vỏ có viền vàng: chạm vào một ô mờ trên cát để đặt.'):(L.length?'Chạm chọn một vỏ bên dưới, rồi chạm ô trên cát để đặt. Chạm vỏ đã đặt để nhấc lên đổi chỗ.':'Đã đặt hết vỏ. Chạm vỏ trên cát để đổi chỗ, ưng rồi thì bấm «Xong».');
    if(L.length){const ul=document.createElement('div');ul.className='strip';L.forEach(x=>{const c=document.createElement('div');if(x===s)c.className='on';c.style.cursor='pointer';c.title=shName(x.s,x.t);const im=document.createElement('img');im.src=shThumb(x);im.alt='';c.append(im);c.addEventListener('pointerdown',e=>e.stopPropagation());c.addEventListener('click',e=>{e.stopPropagation();R.sel=x===s?null:x;shGridMark();shPanel('grid')});ul.append(c)});shUI.insertBefore(ul,row);requestAnimationFrame(()=>ul.querySelector('.on')?.scrollIntoView({inline:'nearest',block:'nearest'}))}
    row.append(shBtn('✓ Xong, ưng rồi',shArtAccept,n>0),shBtn('🎲 Xếp ngẫu nhiên',shGridRandom));if(placed)row.append(shBtn('↩ Cất vỏ này lại vào giỏ',()=>{shGridBack(s);R.sel=null;shGridMark();shPanel('grid')}));if(n)row.append(shBtn('🧺 Gom hết về giỏ',()=>{R.cells.filter(Boolean).forEach(shGridBack);R.sel=L[0]||b.items[0]||null;shGridMark();shPanel('grid')}));
    row.append(shBtn('← Quay lại',()=>{shArtUnlay();shPanel('stop')}))}
  function shGridRandom(){const A=TD_ACT,R=A.art,b=A.bins[A.carry];if(!R)return;const all=R.cells.filter(Boolean).concat(b?b.items:[]);for(const q of all)if(R.cells.includes(q))R.cells[R.cells.indexOf(q)]=null;
    const idx=[...Array(GRID_N*GRID_N).keys()].sort(()=>Math.random()-.5),sh=all.slice().sort(()=>Math.random()-.5);sh.forEach((q,k)=>shGridPut(q,idx[k]));R.sel=null;shGridMark();shPanel('grid');bayCaption('🎲 Đã xếp ngẫu nhiên '+sh.length+' vỏ · bấm lại để xếp kiểu khác, hoặc chạm vỏ để tự chỉnh',4000)}
  /* ảnh nhỏ của từng loại vỏ (vẽ một lần, dùng lại) để khách chọn vỏ bằng hình, không cần tên */
  /* xem trước cả bộ 36 vỏ (kiểm thử / ảnh giới thiệu): 12 cột × 3 hàng, góc nhìn view: 'front' | 'side' | 'top' */
  window.__shellSheet=(view='front',W=1600,H=760)=>{const cv=document.createElement('canvas');cv.width=W;cv.height=H;const r=new THREE.WebGLRenderer({canvas:cv,antialias:true,preserveDrawingBuffer:true});r.setPixelRatio(1);r.setSize(W,H,false);r.setClearColor('#f7efe3');r.toneMapping=THREE.ACESFilmicToneMapping;r.toneMappingExposure=1.05;
    const sc=new THREE.Scene();sc.add(new THREE.HemisphereLight('#ffffff','#c9b89a',1.5));const dl=new THREE.DirectionalLight('#fff4e0',2.2);dl.position.set(3,6,5);sc.add(dl);const d2=new THREE.DirectionalLight('#e0f0ff',.8);d2.position.set(-4,3,-2);sc.add(d2);
    for(let s=0;s<SH_N;s++)for(let t=0;t<SH_T;t++){const m=shMesh(s,t,false);m.scale.setScalar(.95);const col=s%4,row=Math.floor(s/4);m.position.set(-((col-1.5)*4.3+(t-1)*1.25),0,-(row-1)*2.9);if(view==='side')m.rotation.y=Math.PI/2;sc.add(m)}
    const hw=8.4,cam=new THREE.OrthographicCamera(-hw,hw,hw*H/W,-hw*H/W,.1,100);if(view==='top'){cam.position.set(0,20,-0.01);cam.lookAt(0,0,0)}else{cam.position.set(0,11,-16);cam.lookAt(0,.3,0)}r.render(sc,cam);const url=cv.toDataURL('image/jpeg',.9);r.dispose();return url};
  const shThumbC={};let shThumbR=null;function shThumb(q){const k=q.s+'_'+q.t;if(shThumbC[k])return shThumbC[k];try{if(!shThumbR){const cv=document.createElement('canvas');cv.width=cv.height=96;const r=new THREE.WebGLRenderer({canvas:cv,antialias:true,alpha:true,preserveDrawingBuffer:true});r.setPixelRatio(1);r.setSize(96,96,false);const sc=new THREE.Scene();sc.add(new THREE.HemisphereLight('#ffffff','#9a8c70',1.6));const dl=new THREE.DirectionalLight('#ffffff',1.6);dl.position.set(2,3,2);sc.add(dl);const cam=new THREE.PerspectiveCamera(30,1,.05,20);cam.position.set(0,1.5,-1.35);cam.lookAt(0,.08,0);shThumbR={r,sc,cam,cv}}
      const T=shThumbR,m=new THREE.Mesh(shGeo(q.s,q.t),shMat(q.s));m.rotation.y=.6;T.sc.add(m);T.r.render(T.sc,T.cam);shThumbC[k]=T.cv.toDataURL('image/png');T.sc.remove(m)}catch(e){shThumbC[k]=''}return shThumbC[k]}
  function shGridHide(R){if(R&&R.grid){R.grid.parent&&R.grid.parent.remove(R.grid);R.grid=null;R.cellM=null}}
  function shArtUnlay(){const A=TD_ACT,R=A.art;if(!R)return;R.cells.filter(Boolean).forEach(shGridBack);shGridHide(R);A.art=null}
  function shArtAccept(){const A=TD_ACT,R=A.art,I=bayIsland;if(!R||!I)return;R.list=R.cells.filter(Boolean);if(!R.list.length){bayCaption('Hãy đặt ít nhất một vỏ lên ô trên cát',3000);return}R.sel=null;shGridMark();shGridHide(R);for(const q of R.list)q.g.traverse(o=>{o.userData.tuDao=null});for(const q of R.list)A.decor.push({s:q.s,t:q.t,x:q.ax,z:q.az,r:q.ar,g:q.g,art:R});shDecorSave();A.done=R;A.art=null;A.shot=null;
    const cx=R.cx-Math.cos(R.a)*5.5,cz=R.cz-Math.sin(R.a)*5.5;A.artCam={t:0,cx,cy:tdTerrainY(cx,cz)+8.5,cz,lx:R.cx+Math.cos(R.a)*2.5,ly:tdTerrainY(R.cx,R.cz),lz:R.cz+Math.sin(R.a)*2.5};/* camera lên cao phía trong đảo, nhìn ra bờ biển có hình vỏ sò */
    bayCaption('🌅 Hình vỏ sò đã nằm trên bãi cát · giữ lại tới khi bạn dọn sạch bãi',4500);shPanel('artdone');shPills()}
  function shArtShot(){const A=TD_ACT,u=tdShot();if(u){A.shot=u;bayCaption('📷 Đã chụp ảnh · bấm «Lưu ảnh về máy» để giữ lại',4000)}else bayCaption('Chưa chụp được ảnh trên thiết bị này',3000);shPanel('artdone')}
  function cairnShot(){const A=TD_ACT,C=A.cairn,I=bayIsland;let sv=null;/* đặt camera chéo phía trước tháp đá (người đứng lệch một bên), chụp xong trả camera về */
    if(C&&I&&TU_DAO.group){const y0=tdTerrainY(C.x,C.z);let dx=C.x-I.x,dz=C.z-I.z;const L=Math.hypot(dx,dz)||1;dx/=L;dz/=L;const r=1.15,rx=dx*Math.cos(r)-dz*Math.sin(r),rz=dx*Math.sin(r)+dz*Math.cos(r);
      const eye=new THREE.Vector3(C.x-rx*3.8,y0+2.1,C.z-rz*3.8),look=new THREE.Vector3(C.x,y0+.6,C.z);TU_DAO.group.localToWorld(eye);TU_DAO.group.localToWorld(look);
      sv={p:camera.position.clone(),q:camera.quaternion.clone()};camera.position.copy(eye);camera.lookAt(look);camera.updateMatrixWorld()}
    const u=tdShot();if(sv){camera.position.copy(sv.p);camera.quaternion.copy(sv.q);camera.updateMatrixWorld()}if(u){A.cairnShot=u;bayCaption('📷 Đã chụp tháp đá · bấm «Lưu ảnh về máy» để giữ lại',4000)}else bayCaption('Chưa chụp được ảnh trên thiết bị này',3000);shPanel('cairndone')}
  function tdShot(){try{renderer.render(scene,camera);const src=renderer.domElement,W=src.width,H=src.height,c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');g.drawImage(src,0,0);
      const S=Math.max(1,W/700),bh=56*S;g.fillStyle='rgba(9,43,38,.78)';g.fillRect(0,H-bh,W,bh);g.fillStyle='#c8a96a';g.fillRect(0,H-bh,W,2*S);g.fillStyle='#f4e2b9';g.font='600 '+(20*S)+'px Georgia, serif';g.textBaseline='middle';g.fillText('✧ LÀNG YÊN · Đảo Yên',14*S,H-bh/2,W*.6);g.font=(14*S)+'px system-ui, sans-serif';g.textAlign='right';g.fillText(new Date().toLocaleDateString('vi-VN'),W-14*S,H-bh/2);
      return c.toDataURL('image/jpeg',.9)}catch(e){return null}}
  function shArtMore(){const A=TD_ACT,I=bayIsland;A.artCam=null;A.done=null;A.shot=null;if(I){const a=Math.atan2(I.z-TD_O[1],I.x-TD_O[0]),sea=Math.atan2(Math.cos(a),Math.sin(a));I.yaw=sea;I.cam0=sea;viewYaw=0;A.focus=a;}shPanel(null);shPills();bayCaption('🐚 Nhặt thêm vỏ sò trên bãi cát',3000)}
  function shArtRedo(){const A=TD_ACT,R=A.done;if(!R){shPanel('art');return}A.decor=A.decor.filter(d=>d.art!==R);shDecorSave();A.art=R;A.done=null;A.artCam=null;A.shot=null;shGridStart()}
  // ---- Trước khi rời bãi: vỏ đang giữ (trên tay, trong khay / giỏ) phải được cất Túi An Yên hoặc xếp thành hình trên cát
  function shPending(){const A=TD_ACT;return (A.hand?1:0)+(A.carry!=null?A.bins[A.carry].items.length:0)}
  function shGuardLeave(cont){if(bayIsland&&TD_ACT.mode){TD_ACT.leaveCont=null;shEnd(true);return false}/* rời đi giữa chừng: giỏ về chỗ cũ, vỏ chưa cất bỏ lại biển */if(!bayIsland||!shPending())return false;TD_ACT.leaveCont=cont;shPanel('leave');bayCaption('🏖 Trước khi rời bãi biển, hãy cất vỏ sò vào Túi An Yên hoặc xếp thành hình trên cát',5000);return true}
  function shAfterChoice(){const A=TD_ACT;if(!A.leaveCont)return;if(shPending()){setTimeout(()=>{if(A.leaveCont&&shPending())shPanel('leave')},900);return}const c=A.leaveCont;A.leaveCont=null;setTimeout(c,1600)}
  document.getElementById('exit3D')?.addEventListener('click',e=>{if(typeof bayMode!=='undefined'&&bayMode&&bayIsland&&TD_ACT.mode){TD_ACT.leaveCont=null;shEnd(true)}},true);
  window.__tdShot=(tx,tz,ox,oy,oz)=>{const T=new THREE.Vector3(tx,tdGroundY(tx,tz)+.4,tz),C=new THREE.Vector3(tx+ox,tdGroundY(tx,tz)+oy,tz+oz);TU_DAO.group.localToWorld(T);TU_DAO.group.localToWorld(C);const c=camera.clone();c.position.copy(C);c.lookAt(T);c.updateMatrixWorld();renderer.render(scene,c);return renderer.domElement.toDataURL('image/jpeg',.85)};/* chỉ dùng khi kiểm thử: chụp cảnh từ một điểm nhìn */
  window.__tdAct={fill:n=>{const A=TD_ACT;for(let i=0;i<n;i++){if(!A.beach.length)shSpawn();const q=A.beach.shift();if(!q)break;q.g.parent&&q.g.parent.remove(q.g);me.add(q.g);q.clean=true;q.msg='';A.hand=q;shIntoBin(true)}return A.carry!=null?A.bins[A.carry].items.length:0},hit:(px,py)=>{const r=new THREE.Raycaster();r.setFromCamera(new THREE.Vector2(px/innerWidth*2-1,-py/innerHeight*2+1),camera);return r.intersectObject(TU_DAO.group,true).slice(0,4).map(h=>[h.object.userData.tuDao,h.object.userData.bin,+h.distance.toFixed(1),h.object.type])},act:TD_ACT,cairn:()=>tdGoCairn(),shell:k=>tdGoShell(k),scr:(x,z,y=.3)=>{const v=new THREE.Vector3(x,tdGroundY(x,z)+y,z);TU_DAO.group.localToWorld(v);v.project(camera);return [(v.x+1)/2*innerWidth,(1-v.y)/2*innerHeight]}};
  function islandWorld(out){const I=bayIsland;out.set(I.x,tdGroundY(I.x,I.z)+(I.moving?Math.abs(Math.sin(I.t*7))*.08:0),I.z);TU_DAO.group.localToWorld(out);return out}
  const islandHud=document.createElement('button');islandHud.type='button';islandHud.id='islandBack';islandHud.textContent='⛵ Về tàu';islandHud.hidden=true;document.body.appendChild(islandHud);
  {const st=document.createElement('style');st.textContent='#islandBack{position:fixed;z-index:73;left:50%;transform:translateX(-50%);bottom:calc(env(safe-area-inset-bottom,0px) + 74px);border:1px solid #c8a96a;border-radius:999px;background:#c8a96a;color:#0b2824;font-weight:600;font-size:14px;padding:9px 16px;cursor:pointer}#islandBack[hidden]{display:none}body.bay-island #bayHUD,body.bay-island #homeBtn,body.bay-island #bayMap,body.bay-island #baySheet{display:none!important}';document.head.appendChild(st)}
  const islandPad=document.createElement('div');islandPad.id='islandPad';islandPad.hidden=true;document.body.appendChild(islandPad);
  {const st=document.createElement('style');st.textContent='#islandPad{position:fixed;z-index:73;left:12px;bottom:calc(env(safe-area-inset-bottom,0px) + 88px);display:grid;grid-template-columns:repeat(3,46px);grid-template-rows:repeat(2,46px);gap:6px;touch-action:none;user-select:none}#islandPad[hidden]{display:none}#islandPad button{border-radius:12px;border:1px solid rgba(255,255,255,.35);background:rgba(20,16,12,.55);color:#f4e2b9;font-size:18px;touch-action:none}';document.head.appendChild(st)}
  for(const [k,lab,gc,gr] of [['forward','▲',2,1],['turnleft','◀',1,2],['back','▼',2,2],['turnright','▶',3,2]]){const b=document.createElement('button');b.type='button';b.textContent=lab;b.style.cssText='grid-column:'+gc+';grid-row:'+gr;b.setAttribute('aria-label',{forward:'Đi tới',back:'Lùi',turnleft:'Quay trái',turnright:'Quay phải'}[k]);
    b.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();walkingKeys.add(k);try{b.setPointerCapture(e.pointerId)}catch(_){}});for(const ev of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(ev,()=>walkingKeys.delete(k));b.addEventListener('contextmenu',e=>e.preventDefault());islandPad.appendChild(b)}
  function refreshIslandHud(){islandHud.hidden=!(bayIsland||bayPlay)||!bayMode;islandPad.hidden=islandHud.hidden;if(islandHud.hidden)walkingKeys.clear()}
  islandHud.addEventListener('click',()=>bayPlay?playBack():islandBack());
  // ===== Trượt phao & Chèo kayak: chỉ mở khi du thuyền đang neo (đứng yên) giữa vịnh. Nhân vật rời tàu, chơi quanh tàu rồi về thang ở đuôi tàu lên lại.
  // Trượt phao: lên boong tầng 2 (cầu trượt ở mạn trái, +x), ngồi trên phao tròn trượt cầu trượt hơi xuống biển, bơi cùng phao. Kayak: xuống bục đuôi tàu, chèo quanh chỗ neo.
  // Người bơi và kayak không đi xuyên thân tàu, cầu trượt, đá, đảo, bờ (đĩa chặn lấy từ dữ liệu đảo như lưới dò đường, không cộng khoảng an toàn của tàu).
  // Bơi trong vòng 45 m, kayak trong vòng 140 m quanh tàu. Chạm mặt nước để bơi / chèo tới (tự vòng qua tàu và đá); trên laptop dùng thêm phím mũi tên / WASD để tự lái.
  const PLAY={built:false,R:{swim:45,kayak:140},V:{swim:1.6,kayak:3.6},SV:-9,depth:1.02,seat:-.12};
  const shipL=()=>bayShip.len/2,shipB=()=>(bayShip.ex?.beam||10)/2;
  function shipToBay(u,v){const S=bayShip,s=Math.sin(S.heading),c=Math.cos(S.heading);return [S.x+s*v+c*u,S.z+c*v-s*u]}
  function bayToShip(x,z){const S=bayShip,dx=x-S.x,dz=z-S.z,s=Math.sin(S.heading),c=Math.cos(S.heading);return [dx*c-dz*s,dx*s+dz*c]}
  const playMat=(c,o={})=>new THREE.MeshStandardMaterial({color:c,roughness:.55,...o});
  function makeRing(){const g=new THREE.Group(),o=new THREE.Mesh(new THREE.TorusGeometry(.52,.17,10,24),playMat('#f0702a',{roughness:.4}));o.rotation.x=Math.PI/2;g.add(o);
    for(let k=0;k<4;k++){const w=new THREE.Mesh(new THREE.TorusGeometry(.52,.175,10,6,.42),playMat('#fbf6ec',{roughness:.4}));w.rotation.set(Math.PI/2,0,k*Math.PI/2-.21);g.add(w)}return g}
  function makeKayak(){const g=new THREE.Group(),hull=new THREE.Mesh(new THREE.SphereGeometry(1,22,12),playMat('#e8532f',{roughness:.35}));hull.scale.set(.42,.26,1.75);g.add(hull);
    const stripe=new THREE.Mesh(new THREE.SphereGeometry(1,22,6,0,Math.PI*2,Math.PI*.47,Math.PI*.06),playMat('#f6d04d'));stripe.scale.set(.425,.26,1.76);g.add(stripe);
    const rim=new THREE.Mesh(new THREE.TorusGeometry(.3,.045,6,18),playMat('#1f2a30'));rim.rotation.x=Math.PI/2;rim.scale.set(1,1.5,1);rim.position.set(0,.22,-.1);g.add(rim);
    const hole=new THREE.Mesh(new THREE.CircleGeometry(.29,18),playMat('#141a1e'));hole.rotation.x=-Math.PI/2;hole.scale.set(1,1.5,1);hole.position.set(0,.2,-.1);g.add(hole);
    const pad=new THREE.Group(),sh=new THREE.Mesh(new THREE.CylinderGeometry(.024,.024,2.3,6),playMat('#2b2f33',{metalness:.4}));sh.rotation.z=Math.PI/2;pad.add(sh);
    for(const sx of [-1,1]){const bl=new THREE.Mesh(new THREE.BoxGeometry(.4,.02,.17),playMat('#f6d04d'));bl.position.x=sx*1.2;bl.rotation.x=sx*.5;pad.add(bl)}
    pad.position.set(0,.78,.32);g.add(pad);g.userData.paddle=pad;g.traverse(o=>{o.userData.bayPlay='kayak'});return g}
  // Cầu trượt phao: lòng máng xanh, hai ống hơi vàng hai bên, phao đỡ dưới chân; bục tắm gỗ và thang inox ở đuôi tàu
  function playBuild(){if(PLAY.built||!bayShip.ex)return;PLAY.built=true;const g=bayShip.group,L=shipL(),B=shipB(),SV=PLAY.SV;
    const curve=new THREE.CatmullRomCurve3([[B-.6,5.62,SV],[B+1.4,5.15,SV+.1],[B+4.4,3.1,SV+.6],[B+7.4,1.15,SV+.5],[B+10.2,.42,SV]].map(a=>new THREE.Vector3(...a)));PLAY.curve=curve;
    const N=48,K=13,W=1.7,pos=[],col=[],idx=[],up=new THREE.Vector3(0,1,0),lat=new THREE.Vector3(),nrm=new THREE.Vector3(),cA=new THREE.Color('#2f8fd6'),cB=new THREE.Color('#62b8ef'),edges=[[],[]];
    for(let i=0;i<=N;i++){const u=i/N,p=curve.getPointAt(u),tg=curve.getTangentAt(u);lat.crossVectors(tg,up).normalize();nrm.crossVectors(lat,tg).normalize();
      for(let k=0;k<K;k++){const s=k/(K-1)*2-1,q=p.clone().addScaledVector(lat,s*W/2).addScaledVector(nrm,.62*Math.pow(Math.abs(s),5));pos.push(q.x,q.y,q.z);const c=(i%6<3?cA:cB);col.push(c.r,c.g,c.b);
        if(i&&k){const a=(i-1)*K+k-1,b=i*K+k-1;idx.push(a,b,a+1,b,b+1,a+1)}}
      for(const [j,sx] of [[0,-1],[1,1]])edges[j].push(p.clone().addScaledVector(lat,sx*(W/2+.12)).addScaledVector(nrm,.55))}
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setAttribute('color',new THREE.Float32BufferAttribute(col,3));geo.setIndex(idx);geo.computeVertexNormals();
    const slide=new THREE.Group();slide.add(new THREE.Mesh(geo,new THREE.MeshStandardMaterial({vertexColors:true,roughness:.35,side:THREE.DoubleSide})));
    for(const e of edges)slide.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(e),60,.24,10,false),playMat('#f6c542',{roughness:.4})));
    for(const e of edges){const cap=new THREE.Mesh(new THREE.SphereGeometry(.24,10,8),playMat('#f6c542',{roughness:.4}));cap.position.copy(e[e.length-1]);slide.add(cap);const cap0=cap.clone();cap0.position.copy(e[0]);slide.add(cap0)}
    {const tower=new THREE.Mesh(new THREE.BoxGeometry(1.2,.9,2.4),playMat('#e8532f',{roughness:.45}));tower.position.set(B-.9,5.85,SV);slide.add(tower)}
    {const padG=new THREE.Group(),disc=new THREE.Mesh(new THREE.CylinderGeometry(1.9,1.9,.32,24),playMat('#62b8ef',{roughness:.4})),tor=new THREE.Mesh(new THREE.TorusGeometry(1.95,.22,8,28),playMat('#f6c542',{roughness:.4}));tor.rotation.x=Math.PI/2;tor.position.y=.12;padG.add(disc,tor);padG.position.set(B+12.1,.05,SV);slide.add(padG)}
    slide.traverse(o=>{o.userData.bayPlay='slide'});g.add(slide);PLAY.slide=slide;
    const deck=new THREE.Mesh(new THREE.BoxGeometry(B*1.5,.2,1.7),new THREE.MeshStandardMaterial({color:'#ffffff',roughness:.72,map:deckPlankTex('#a07e60')}));deck.position.set(0,.5,-L-.75);g.add(deck);
    const lad=new THREE.Group(),steel=playMat('#dfe3e6',{metalness:.8,roughness:.25});for(const sx of [-.36,.36]){const r=new THREE.Mesh(new THREE.CylinderGeometry(.035,.035,2.6,6),steel);r.position.set(sx,-.1,-L-1.62);lad.add(r);const h=new THREE.Mesh(new THREE.TorusGeometry(.32,.035,6,10,Math.PI),steel);h.position.set(sx,1.2,-L-1.3);h.rotation.y=Math.PI/2;lad.add(h)}
    for(let k=0;k<4;k++){const r=new THREE.Mesh(new THREE.CylinderGeometry(.03,.03,.72,6),steel);r.rotation.z=Math.PI/2;r.position.set(0,.3-k*.42,-L-1.62);lad.add(r)}lad.traverse(o=>{o.userData.bayPlay='ladder'});g.add(lad);PLAY.ladder=lad;
    const kt=makeKayak();kt.position.set(-B-1.15,0,-L+3.2);kt.traverse(o=>{o.userData.bayPlay='kayak'});g.add(kt);PLAY.kayakTied=kt;
    const ka=makeKayak();ka.visible=false;bayShip.group.parent.add(ka);PLAY.kayak=ka;
    const ring=makeRing();ring.visible=false;bayShip.group.parent.add(ring);PLAY.ring=ring;
    PLAY.splash=[0,1,2].map(()=>{const m=new THREE.Mesh(new THREE.RingGeometry(.6,1,28),new THREE.MeshBasicMaterial({color:'#ffffff',transparent:true,opacity:0,depthWrite:false,side:THREE.DoubleSide}));m.rotation.x=-Math.PI/2;m.visible=false;bayShip.group.parent.add(m);return m});
    playShowProps(false)}
  function playShowProps(on){if(!PLAY.built)return;PLAY.slide.visible=on;PLAY.ladder.visible=on;PLAY.kayakTied.visible=on&&!(bayPlay&&bayPlay.kind==='kayak')}
  // Tàu đang neo: không có đường đi, không trượt, không đang trong tour (tour dừng ngắm vài giây rồi đi tiếp); dừng ngắm cảnh (⏸) cũng tính là neo
  function playAnchored(){const S=bayShip;return !!(bayBuilt&&bayMode&&!bayIsland&&!S.path.length&&!S.glide&&S.speed<.4&&!bayTour)}
  // ---- Vật cản cho người bơi / kayak: thân tàu, cầu trượt, kayak buộc mạn phải; đĩa đá / đảo / bờ gần tàu (gom một lần khi bắt đầu)
  function playScan(R){const S=bayShip,out=[],lands=[],near=(x,z,r)=>Math.hypot(x-S.x,z-S.z)<R+r+60;
    for(const n of bayData.nature)if(n.kind==='karst_field')for(const [x,z,r,,v] of n.params.items){const er=r*(v===3?1.9:v===4?1.35:1)*1.02;if(near(x,z,er))out.push([x,z,er])}
    for(const p of bayData.props){const q=p.params||{};if(p.kind==='moored_boat'&&near(p.x,p.z,6))out.push([p.x,p.z,6]);if(p.kind==='landmark'){if(q.shape==='pier'&&near(p.x,p.z+22,12))out.push([p.x,p.z+22,12]);
      if(q.radius>0){const r=q.radius*(q.shape==='big_island'?1.08:1.2);if(near(p.x,p.z,r))out.push([p.x,p.z,r])}if(q.shape==='village'){const f=lmFacing(p),x=p.x-Math.cos(f)*34,z=p.z-Math.sin(f)*34;if(near(x,z,48))out.push([x,z,48])}}}
    for(const [x,z,rr] of bayExtraRocks)if(near(x,z,rr))out.push([x,z,rr*.85]);
    for(const L of bayLand){let a=1e9,b=-1e9,c=1e9,d=-1e9;for(const [x,z] of L.pts){a=Math.min(a,x);b=Math.max(b,x);c=Math.min(c,z);d=Math.max(d,z)}if(S.x+R+40>a&&S.x-R-40<b&&S.z+R+40>c&&S.z-R-40<d)lands.push(L.pts)}
    return {discs:out,lands}}
  function inPoly(P,x,z){let ins=false;for(let a=0,b=P.length-1;a<P.length;b=a++){const [x1,z1]=P[a],[x2,z2]=P[b];if((z1>z)!==(z2>z)&&x<x1+(z-z1)*(x2-x1)/(z2-z1))ins=!ins}return ins}
  function playBlocked(x,z){const P=bayPlay;if(!P)return true;const S=bayShip,L=shipL(),B=shipB(),[u,v]=bayToShip(x,z),pad=P.kind==='kayak'?.9:.55;
    if(Math.abs(u)<B+pad&&v>-L-2.2&&v<L+pad)return 'ship';
    if(u>B-1&&u<B+14.2+pad&&Math.abs(v-PLAY.SV)<2.3+pad)return 'ship';
    if(u<-B+.5&&u>-B-2.4-pad&&v>-L+.8-pad&&v<-L+5.6+pad)return 'ship';
    if(Math.hypot(x-S.x,z-S.z)>PLAY.R[P.kind])return 'far';
    for(const [cx,cz,r] of P.obs.discs)if(Math.hypot(x-cx,z-cz)<r+pad)return 'rock';
    for(const pts of P.obs.lands)if(inPoly(pts,x,z))return 'rock';
    return false}
  // Đường đi: A* tám hướng trên lưới quanh tàu (ô 1,2 m khi bơi, 2 m khi chèo), rồi kéo thẳng các đoạn nhìn thông
  function playLine(ax,az,bx,bz){const d=Math.hypot(bx-ax,bz-az),n=Math.max(1,Math.ceil(d/.6)),k0=playBlocked(ax,az)?Math.ceil(2.5/.6):1;/* đang kẹt sát vật cản thì cho thoát ra */for(let k=k0;k<=n;k++){if(playBlocked(ax+(bx-ax)*k/n,az+(bz-az)*k/n))return false}return true}
  function playPath(tx,tz){const P=bayPlay,S=bayShip,C=P.kind==='kayak'?2:1.2,H=Math.ceil((PLAY.R[P.kind]+4)/C),n=2*H+1,x0=S.x-H*C,z0=S.z-H*C,cell=(x,z)=>[Math.round((x-x0)/C),Math.round((z-z0)/C)];
    if(playLine(P.x,P.z,tx,tz))return [[tx,tz]];const [si,sj]=cell(P.x,P.z),[ti,tj]=cell(tx,tz);if(ti<0||tj<0||ti>=n||tj>=n)return null;
    const st=new Int8Array(n*n),g=new Float32Array(n*n).fill(1e9),from=new Int32Array(n*n).fill(-1),ok=k=>{if(!st[k])st[k]=playBlocked(x0+(k%n)*C,z0+Math.floor(k/n)*C)?2:1;return st[k]===1};
    const open=[],push=(k,f)=>{open.push([f,k]);let i=open.length-1;while(i){const p=(i-1)>>1;if(open[p][0]<=open[i][0])break;[open[p],open[i]]=[open[i],open[p]];i=p}},
      pop=()=>{const top=open[0],last=open.pop();if(open.length){open[0]=last;let i=0;for(;;){const l=2*i+1,r=l+1;let m=i;if(l<open.length&&open[l][0]<open[m][0])m=l;if(r<open.length&&open[r][0]<open[m][0])m=r;if(m===i)break;[open[m],open[i]]=[open[i],open[m]];i=m}}return top};
    const s=sj*n+si,t=tj*n+ti;if(!ok(t))return null;st[s]=1;g[s]=0;push(s,0);let it=0,done=false;
    while(open.length&&it++<40000){const [,k]=pop();if(k===t){done=true;break}const i=k%n,j=Math.floor(k/n);
      for(let dj=-1;dj<=1;dj++)for(let di=-1;di<=1;di++){if(!di&&!dj)continue;const a=i+di,b=j+dj;if(a<0||b<0||a>=n||b>=n)continue;const q=b*n+a;if(!ok(q))continue;if(di&&dj&&(!ok(j*n+a)||!ok(b*n+i)))continue;
        const ng=g[k]+(di&&dj?1.414:1);if(ng<g[q]){g[q]=ng;from[q]=k;push(q,ng+Math.hypot(ti-a,tj-b))}}}
    if(!done)return null;const raw=[];for(let k=t;k!==s&&k>=0;k=from[k])raw.unshift([x0+(k%n)*C,z0+Math.floor(k/n)*C]);raw[raw.length-1]=[tx,tz];
    const out=[];let cx=P.x,cz=P.z,i=0;while(i<raw.length){let j=raw.length-1;while(j>i&&!playLine(cx,cz,raw[j][0],raw[j][1]))j--;out.push(raw[j]);[cx,cz]=raw[j];i=j+1}return out}
  const playLadder=()=>shipToBay(0,-shipL()-2.9),playLaunch=()=>shipToBay(0,-shipL()-3.6);
  function playStart(kind){if(!bayBuilt||bayIsland)return false;if(bayPlay){bayCaption(bayPlay.kind==='kayak'?'🛶 Đang chèo kayak · bấm ⛵ Về tàu để lên tàu':'🏊 Đang bơi · bấm ⛵ Về tàu để leo thang lên tàu',3000);return false}
    if(!playAnchored()){bayCaption('⚓ Neo thuyền lại trước (⏹ Neo lại, hoặc đợi tàu tới nơi) rồi mới '+(kind==='kayak'?'chèo kayak':'trượt phao xuống biển')+' được',4500);return false}
    playBuild();tdStand();closeSheet();closeMapBox();if(bayOutfitOpen)closeBayOutfit(false);if(bayPause){bayPause.auto=false;bayPause.turn=0;bayPause.bow=0}
    const S=bayShip,P=bayPlay={kind:kind==='kayak'?'kayak':'swim',phase:kind==='kayak'?'board':'top',t:0,path:[],x:S.x,z:S.z,y:3,yaw:S.heading,moving:0,view:bayView,zoom:bayZoom,hint:0};
    P.obs=playScan(PLAY.R[P.kind]);if(bayView!=='bow'&&bayView!=='sundeck')setBayView('bow');else{bayView='bow';viewYaw=0}bayZoom=Math.min(bayZoom,1.5);bayCamYaw=null;
    if(P.kind==='kayak'){const k=PLAY.kayak;[P.x,P.z]=playLaunch();P.yaw=S.heading+Math.PI;k.visible=true;PLAY.kayakTied.visible=false;bayCaption('🛶 Xuống bục đuôi tàu, ngồi vào kayak…',3500)}
    else bayCaption('🛝 Lên đỉnh cầu trượt bên mạn tàu, ngồi lên phao tròn…',3500);
    P.cam=camera.position.clone();document.body.classList.add('bay-play');refreshIslandHud();return true}
  function playGoTo(x,z){const P=bayPlay;if(!P||!/^(swim|kayak)$/.test(P.phase))return;const S=bayShip,R=PLAY.R[P.kind]-1,d=Math.hypot(x-S.x,z-S.z);
    if(d>R){x=S.x+(x-S.x)/d*R;z=S.z+(z-S.z)/d*R;bayCaption(P.kind==='kayak'?'🛶 Chèo quanh chỗ neo thôi nhé, trong vòng 140 m':'🏊 Bơi quanh tàu thôi nhé, trong vòng 45 m',3000)}
    const why=playBlocked(x,z);if(why==='rock'){bayCaption('🪨 Chỗ đó là đá, đảo · chạm vào mặt nước thoáng',2800);return}if(why==='ship'){playBack();return}
    const p=playPath(x,z);if(!p){bayCaption('Chưa tới được chỗ đó, hãy chạm chỗ nước thoáng khác',2800);return}P.path=p;P.then=null}
  function playBack(){const P=bayPlay;if(!P)return;if(!/^(swim|kayak)$/.test(P.phase))return;const [lx,lz]=P.kind==='kayak'?playLaunch():playLadder(),p=Math.hypot(P.x-lx,P.z-lz)<.6?[]:playPath(lx,lz);
    P.path=p||[[lx,lz]];P.then='board';bayCaption(P.kind==='kayak'?'🛶 Đang chèo về đuôi tàu…':'🏊 Đang bơi về thang đuôi tàu…',3000)}
  function playSplash(x,z){PLAY.splash.forEach((m,i)=>{m.visible=true;m.userData.t=-i*.18;m.position.set(x,.15,z)})}
  // Kết thúc ngay (đi tiếp, đổi điểm đến, rời vịnh): người về mũi tàu, cất phao / kayak
  function playEnd(quiet){const P=bayPlay;if(!P)return;bayPlay=null;if(PLAY.built){PLAY.ring.visible=false;PLAY.kayak.visible=false;PLAY.splash.forEach(m=>m.visible=false)}bayAvatar.sit=0;bayAvatar.lean=0;
    document.body.classList.remove('bay-play');walkingKeys.clear();refreshIslandHud();if(P.view&&P.view!==bayView&&P.view!=='far')setBayView(P.view);viewYaw=0;bayCamYaw=null;bayZoom=P.zoom||bayZoom;playShowProps(playAnchored());
    if(!quiet){playFly={t:0,T:1.8,p:camera.position.clone(),q:camera.quaternion.clone()};bayCaption(P.kind==='kayak'?'⛵ Đã buộc kayak, lên lại du thuyền':'⛵ Đã leo thang lên tàu, phơi phao cho khô',3500)}}
  function playUpdate(dt){const P=bayPlay;if(!P)return;const S=bayShip,t=performance.now()/1000,L=shipL(),B=shipB(),wy=(x,z)=>bayWaveY(x,z,t)*.9,ease=u=>u*u*(3-2*u);P.t+=dt;
    for(const m of PLAY.splash){if(!m.visible)continue;m.userData.t+=dt;const u=m.userData.t;if(u<0){m.material.opacity=0;continue}const k=1+u*3.2;m.scale.set(k,k,1);m.material.opacity=Math.max(0,.75*(1-u/1.1));if(u>1.1)m.visible=false}
    const loc=(u,v,y)=>{const [x,z]=shipToBay(u,v);P.x=x;P.z=z;P.y=y},ring=PLAY.ring,kay=PLAY.kayak,out=S.heading+Math.PI/2;bayAvatar.lean=0;
    if(P.phase==='top'||P.phase==='slide'){const cv=PLAY.curve,u=P.phase==='top'?0:Math.min(1,Math.pow(P.t/1.9,1.6)),p=cv.getPointAt(u);loc(p.x,p.z,p.y+.08);const tg=cv.getTangentAt(u);
      P.yaw=out;bayAvatar.sit=1;bayAvatar.lean=P.phase==='slide'?-Math.atan2(-tg.y,Math.hypot(tg.x,tg.z))*.55:0;ring.visible=true;ring.position.set(P.x,P.y+.06,P.z);ring.rotation.set(0,0,0);
      if(P.phase==='top'&&P.t>1.6){P.phase='slide';P.t=0;bayCaption('🛝 Trượt xuống biển nào!',2200)}else if(P.phase==='slide'&&u>=1){P.phase='splash';P.t=0;P.sx=p.x;P.sz=p.z;P.sy=p.y}}
    else if(P.phase==='splash'){const u=Math.min(1,P.t/.9),e=ease(u),uu=P.sx+(B+15.6-P.sx)*e,[x,z]=shipToBay(uu,PLAY.SV);P.x=x;P.z=z;const w=wy(x,z)-PLAY.depth;P.y=u<.45?P.sy+(w-.5-P.sy)*(u/.45):w-.5*Math.sin(Math.PI*Math.min(1,(u-.45)/.55))*.9;
      if(!P.splashed&&P.y<.2){P.splashed=1;playSplash(P.x,P.z)}bayAvatar.sit=u<.45?1:0;ring.visible=true;ring.position.set(P.x,Math.max(P.y+.95,wy(P.x,P.z)),P.z);P.yaw=out;
      if(u>=1){P.phase='swim';P.t=0;bayCaption('🏊 Bơi cùng phao quanh tàu · chạm mặt nước để bơi tới, bấm ⛵ Về tàu để leo thang lên',6000)}}
    else if(P.phase==='board'||P.phase==='unboard'){const u=Math.min(1,P.t/1.2),e=ease(P.phase==='board'?u:1-u),[lx,lz]=playLaunch(),[dx,dz]=shipToBay(0,-L-.8);
      kay.position.set(lx,wy(lx,lz),lz);kay.rotation.set(0,P.phase==='board'?S.heading+Math.PI:P.kyaw,0);P.x=dx+(lx-dx)*e;P.z=dz+(lz-dz)*e;P.y=.6+(wy(lx,lz)+PLAY.seat-.6)*e+Math.sin(Math.PI*e)*.35;P.yaw=P.phase==='board'?S.heading+Math.PI:P.kyaw;bayAvatar.sit=e>.6?1:0;
      if(u>=1){if(P.phase==='board'){P.phase='kayak';P.t=0;bayCaption('🛶 Chèo kayak quanh chỗ neo · chạm mặt nước để chèo tới, bấm ⛵ Về tàu khi muốn lên tàu',6000)}else{playEnd(false);return}}}
    else if(P.phase==='climb'){const u=Math.min(1,P.t/1.5),[lx,lz]=playLadder(),[dx,dz]=shipToBay(0,-L-.8),e=ease(Math.max(0,(u-.55)/.45));P.yaw=S.heading;
      P.x=lx+(dx-lx)*e;P.z=lz+(dz-lz)*e;P.y=wy(lx,lz)-PLAY.depth+(.6-wy(lx,lz)+PLAY.depth)*ease(Math.min(1,u/.6));ring.visible=u<.5;ring.position.set(lx,wy(lx,lz),lz);bayAvatar.sit=0;if(u>=1){playEnd(false);return}}
    else{// tự do: bơi / chèo theo đường chạm, hoặc tự lái bằng phím
      const V=PLAY.V[P.kind];let mv=0;const K=walkingKeys;
      if(K.size){P.path.length=0;P.then=null;if(K.has('turnleft'))P.yaw+=1.5*dt;if(K.has('turnright'))P.yaw-=1.5*dt;const f=K.has('forward')?1:K.has('back')?-.5:0;
        if(f){const st=V*f*dt,nx=P.x+Math.sin(P.yaw)*st,nz=P.z+Math.cos(P.yaw)*st,b=playBlocked(P.x,P.z)?false:playBlocked(nx,nz);if(!b){P.x=nx;P.z=nz;mv=1}else{if(!playBlocked(nx,P.z)){P.x=nx;mv=1}else if(!playBlocked(P.x,nz)){P.z=nz;mv=1}
          else if(t-P.hint>2.5){P.hint=t;bayCaption(b==='far'?(P.kind==='kayak'?'🛶 Chỉ chèo trong vòng 140 m quanh chỗ neo':'🏊 Chỉ bơi trong vòng 45 m quanh tàu'):b==='ship'?'⛵ Thân tàu ở ngay đó · bấm ⛵ Về tàu để lên':'🪨 Đá chắn phía trước, quay hướng khác nhé',2600)}}}}
      else{let left=V*dt;while(left>0&&P.path.length){const [tx,tz]=P.path[0],dx=tx-P.x,dz=tz-P.z,d=Math.hypot(dx,dz);const want=Math.atan2(dx,dz);P.yaw+=Math.atan2(Math.sin(want-P.yaw),Math.cos(want-P.yaw))*Math.min(1,dt*3.5);
          if(d<=left){P.x=tx;P.z=tz;left-=d;P.path.shift();continue}const nx=P.x+dx/d*left,nz=P.z+dz/d*left;if(P.then!=='board'&&!playBlocked(P.x,P.z)&&playBlocked(nx,nz)){P.path.length=0;break}P.x=nx;P.z=nz;left=0;mv=1}
        if(!P.path.length&&P.then==='board'){P.then=null;P.t=0;P.kyaw=P.yaw;P.phase=P.kind==='kayak'?'unboard':'climb';bayCaption(P.kind==='kayak'?'🛶 Cập bục đuôi tàu, bước lên…':'🪜 Leo thang đuôi tàu lên lại du thuyền…',2500)}}
      P.moving+=((mv?1:0)-P.moving)*Math.min(1,dt*5);const w=wy(P.x,P.z);
      if(P.kind==='kayak'){P.y=w+PLAY.seat;bayAvatar.sit=1;kay.position.set(P.x,w,P.z);kay.rotation.set(Math.sin(t*1.3)*.03,P.yaw,Math.sin(t*1.7)*.04);const pd=kay.userData.paddle,a=t*4.2;pd.rotation.set(0,Math.sin(a)*.35*P.moving,Math.cos(a)*.55*P.moving)}
      else{P.y=w-PLAY.depth+Math.sin(t*2.2)*.04;bayAvatar.sit=0;bayAvatar.lean=-.3*P.moving;ring.visible=true;ring.position.set(P.x,w+.02,P.z);ring.rotation.set(.32*P.moving*Math.cos(P.yaw)*0,0,0)}}
  }
  // Camera cố định khi trượt, xuống / lên kayak, leo thang: đặt ngoài mạn tàu nhìn vào người (sau lưng người lúc đó là thân tàu, camera sẽ bị che)
  const playCamV=new THREE.Vector3(),playCamL=new THREE.Vector3();
  function playCamFixed(dt,at){const P=bayPlay;if(!P)return false;const L=shipL(),B=shipB();let o=null;
    if(/^(top|slide|splash)$/.test(P.phase))o=[B+11,5.2,PLAY.SV+12];else if(/^(board|unboard)$/.test(P.phase))o=[6.5,3.2,-L-10];else if(P.phase==='climb')o=[6,3.4,-L-9];if(!o)return false;
    const [x,z]=shipToBay(o[0],o[2]),dx=x+BAY.x-at.x,dz=z+BAY.z-at.z,c=Math.cos(viewYaw),s=Math.sin(viewYaw),k=Math.max(.6,bayZoomS);
    playCamV.set(at.x+(dx*c+dz*s)*k,Math.max(1.2,o[1]*Math.min(1.4,k)+(P.phase==='slide'||P.phase==='top'?at.y*.35:0)),at.z+(-dx*s+dz*c)*k);
    if(!P.cam){P.cam=camera.position.clone()}P.cam.lerp(playCamV,Math.min(1,(dt||0)*2.5));camera.position.copy(P.cam);playCamL.set(at.x,at.y+.7,at.z);camera.lookAt(playCamL);return true}
  window.addEventListener('anyen-bay-play',e=>playStart(e.detail?.kind));
  document.getElementById('exit3D')?.addEventListener('click',()=>{if(bayPlay)playEnd(true)},true);
  {const bar=document.getElementById('zenToolbar'),before=bar&&bar.querySelector('[data-zen="ritual"]');if(bar){for(const [k,ic,lb,al] of [['slide','🛝','Trượt phao','Trượt phao xuống biển bơi'],['kayak','🛶','Kayak','Chèo thuyền kayak']]){const b=document.createElement('button');b.type='button';b.dataset.zen=k;b.title=al;b.setAttribute('aria-label',al);b.innerHTML=ic+'<small>'+lb+'</small>';
      b.addEventListener('click',e=>{e.stopPropagation();playStart(k)});bar.insertBefore(b,before||null)}}
   const st=document.createElement('style');st.textContent='body #zenToolbar button[data-zen=slide],body #zenToolbar button[data-zen=kayak],body.immersive #zenToolbar button[data-zen=slide],body.immersive #zenToolbar button[data-zen=kayak]{display:none!important}body.immersive.yen-bay.bay-anchored:not(.bay-island):not(.bay-play):not(.bay-photo-open) #zenToolbar button[data-zen=slide],body.immersive.yen-bay.bay-anchored:not(.bay-island):not(.bay-play):not(.bay-photo-open) #zenToolbar button[data-zen=kayak]{display:flex!important}body.yen-bay.bay-play #zenToolbar [data-zen=sit],body.yen-bay.bay-play #zenToolbar [data-zen=bell]{display:none!important}body.yen-bay.bay-play:not(.bay-photo-open) #zenToolbar [data-zen=boat]{display:flex!important}body.bay-play #bayHUD,body.bay-play #bayMap,body.bay-play #baySheet,body.bay-play #bayPauseRow{display:none!important}';document.head.appendChild(st)}
  window.__bayPlay={start:k=>playStart(k),go:(x,z)=>playGoTo(x,z),back:()=>playBack(),end:()=>playEnd(true),get st(){return bayPlay},blocked:(x,z)=>playBlocked(x,z),toBay:(u,v)=>shipToBay(u,v),anch:()=>playAnchored()};
  function goTuDao(instant){if(!bayBuilt)return;if(bayPlay)playEnd(true);tdTripMemo();const [hx,hz]=tdPierHead(),x=hx-Math.sin(TU_DAO.heading)*shipBowLen(bayShip),z=hz-Math.cos(TU_DAO.heading)*shipBowLen(bayShip);
    if(!instant){setDestination(hx,hz,'Đảo Yên của bạn',false,tdDockOpt());return}
    dropPause();endTour(false);bayShip.path=[];bayShip.dest=null;bayShip.stopped=true;bayMarker.visible=false;bayShip.x=x;bayShip.z=z;bayShip.speed=0;bayShip.trail.length=0;bayShip.heading=TU_DAO.heading;viewYaw=0;bayAt=null;
    updateBay(0);camera.position.copy(bayCam);refreshBayHud();drawBayMap();document.body.classList.add('bay-warp');setTimeout(()=>document.body.classList.remove('bay-warp'),60);
    bayCaption('🏝 Đảo Yên của bạn · cập cầu tàu, nhìn về Hòn Gà Chọi · Lên đảo, chọn phong cách và mời khách sẽ mở ở bước tiếp theo',6500)}
  window.__goTuDao=goTuDao;
  // ---- Bước xuống Đảo Yên = sang một không gian 3D riêng: vùng đảo của vịnh ẩn đi, chỉ còn Đảo Yên, du thuyền đang neo ở cầu tàu,
  // thuyền gỗ, thuyền nan đậu rải quanh đảo, vòng núi đá xa làm phông và hai hòn gần nhất (Trống Mái, Đỉnh Hương). Chuyển cảnh bằng một lớp mờ.
  function ensureIslandScene(){if(bayIslandScene)return;const prev=bayGroup,g=new THREE.Group();prev.add(g);bayGroup=g;const cx=TU_DAO.x+TD_O[0],cz=TU_DAO.z;
    try{bayChunks.clear();
      const hulls=['#7d5a3d','#8a6446','#6f4f36','#94704d'];
      [[.45,112,0],[1.05,98,1],[1.6,124,0],[2.2,104,1],[-.35,118,1],[-.95,102,0],[-1.55,128,1],[-2.25,108,0],[2.62,150,1],[-2.62,146,0]].forEach(([a,d,sp],i)=>{
        const x=cx+Math.cos(a)*d,z=cz+Math.sin(a)*d,b=sp?makeSampan(i%2===0):makeJunk(hulls[i%4]);b.position.set(x,0,z);b.rotation.y=-a+(i%2?.35:-.4);if(!sp)b.scale.setScalar(1.15);g.add(b);bayBuoys.push({g:b,x,z});
        const buoy=new THREE.Mesh(new THREE.SphereGeometry(.55,10,8),decoMat(i%2?'#d8483a':'#f2c14e'));buoy.position.set(x+Math.cos(a)*7,.2,z+Math.sin(a)*7);g.add(buoy);bayBuoys.push({g:buoy,x:buoy.position.x,z:buoy.position.z})});
      for(let k=0;k<11;k++){const a=k*.571+.2,d=430+bayHash(k,3,1)*230,x=cx+Math.cos(a)*d,z=cz+Math.sin(a)*d,sh=[0,1,3,4,2,5,1,3,0,4,6][k],r=18+bayHash(k,4,2)*26;
        addKarst(x,z,r,r*(sh===2?.9:sh===0?3.6:2.1)+12,8800+k,{shape:sh})}
      finishKarsts()}finally{bayGroup=prev}
    g.visible=false;bayIslandScene=g}
  const bayFadeEl=document.createElement('div');bayFadeEl.id='bayFade';document.body.appendChild(bayFadeEl);
  {const st=document.createElement('style');st.textContent='#bayFade{position:fixed;inset:0;z-index:71;background:#e6f1f2;opacity:0;pointer-events:none}';document.head.appendChild(st)}
  function bayFade(){const el=bayFadeEl;el.style.transition='none';el.style.opacity='1';requestAnimationFrame(()=>requestAnimationFrame(()=>{el.style.transition='opacity .8s ease';el.style.opacity='0'}))}
  // ---- Tải bản đồ theo vùng: lúc vào vịnh chỉ dựng đảo quanh tàu; tàu đi tới đâu dựng tới đó (mỗi khung hình vài mili giây),
  // vùng đã xa thì giải phóng. Danh thắng dựng một lần, đi xa thì ẩn.
  const STREAM={C:600,LOAD:1700,DROP:2400,NEAR:650,cells:new Map(),lms:[],scanT:0,todo:null,island:false};
  function streamAdd(x,z,fn){const i=Math.floor(x/STREAM.C),j=Math.floor(z/STREAM.C),key=i+','+j;let c=STREAM.cells.get(key);if(!c){c={i,j,fns:[],g:null,ms:null};STREAM.cells.set(key,c)}c.fns.push(fn)}
  const cellDist=(c,x,z)=>{const C=STREAM.C,x0=c.i*C,z0=c.j*C;return Math.hypot(Math.max(x0-x,0,x-x0-C),Math.max(z0-z,0,z-z0-C))};
  function streamBuild(fn){const prev=bayGroup,g=new THREE.Group(),a0=bayArchMeshes.length;bayWorld.add(g);bayGroup=g;let ms=[];
    try{bayChunks.clear();fn();ms=finishKarsts().concat(bayArchMeshes.slice(a0))}finally{bayGroup=prev}for(const m of ms)bayKarstMeshes.push(m);return [g,ms]}
  function streamDrop(c){bayWorld.remove(c.g);c.g.traverse(o=>{if(o.geometry)o.geometry.dispose()});const gone=new Set(c.ms);bayKarstMeshes=bayKarstMeshes.filter(m=>!gone.has(m));c.g=null;c.ms=null}
  function streamUpdate(x,z,dt){
    STREAM.scanT-=dt;
    if(dt===0||STREAM.scanT<=0||!STREAM.todo){STREAM.scanT=.35;const todo=[];
      // trên Đảo Yên: chỉ giữ hai danh thắng gần đảo (Hòn Trống Mái, Hòn Đỉnh Hương) làm phối cảnh; các vùng đảo khác ẩn
      const isl=STREAM.island,near=L=>Math.hypot(L.x-TU_DAO.x,L.z-TU_DAO.z)<450;
      for(const c of STREAM.cells.values()){const d=cellDist(c,x,z);if(c.g){if(d>STREAM.DROP)streamDrop(c);else c.g.visible=!isl}else if(d<STREAM.LOAD&&!isl)todo.push([d,c])}
      for(const L of STREAM.lms){const d=Math.max(0,Math.hypot(L.x-x,L.z-z)-L.r),show=isl?near(L):d<STREAM.DROP;if(L.g)L.g.visible=show;else if(show&&d<STREAM.LOAD)todo.push([d,L])}
      todo.sort((a,b)=>a[0]-b[0]);STREAM.todo=todo}
    const t0=performance.now(),budget=dt===0?40:6;
    while(STREAM.todo.length){const [d,c]=STREAM.todo[0];if(d>STREAM.NEAR&&performance.now()-t0>budget)break;STREAM.todo.shift();if(c.g)continue;
      const [g,ms]=streamBuild(c.fns?()=>{for(const f of c.fns)f()}:()=>buildLandmark(c.p));c.g=g;c.ms=ms}
  }
  const dbgRay=new THREE.Raycaster(),dbgDown=new THREE.Vector3(0,-1,0),dbgO=new THREE.Vector3();
  const dbgRock=(x,z)=>{dbgO.set(x+BAY.x,300,z+BAY.z);dbgRay.set(dbgO,dbgDown);const hs=dbgRay.intersectObjects(bayKarstMeshes.concat(TU_DAO.group?[TU_DAO.group]:[]),true);return hs.some(h=>h.point.y>.6)};
  window.__bayNav={rock:dbgRock,view:id=>setBayView(id),hull:()=>{const S=bayShip,L=S.len/2-1,sx=Math.sin(S.heading),sz=Math.cos(S.heading),B=4.5;return [[0,L],[0,0],[0,-L],[B,0],[-B,0],[B,L*.6],[-B,L*.6],[B,-L*.7],[-B,-L*.7]].some(([u,v])=>dbgRock(S.x+sx*v+sz*u,S.z+sz*v-sx*u))},hard:(x,z)=>!hardFree(x,z),block:(x,z)=>!navFree(x,z),bow:()=>shipBow(bayShip),sim:(n,dt)=>{const out=[];for(let i=0;i<n;i++){updateBay(dt);const S=bayShip,L=shipBowLen(S),sx=Math.sin(S.heading),sz=Math.cos(S.heading);out.push([S.x,S.z,S.heading,S.speed,S.path.length,!hardFree(S.x+sx*L,S.z+sz*L)||!hardFree(S.x,S.z)||!hardFree(S.x-sx*L,S.z-sz*L)])}return out}};
  window.__bayStream=()=>({cells:[...STREAM.cells.values()].filter(c=>c.g).length,of:STREAM.cells.size,lms:STREAM.lms.filter(l=>l.g).length,ofLm:STREAM.lms.length,pending:STREAM.todo?STREAM.todo.length:-1,meshes:bayKarstMeshes.length});
  function buildBay(d){
    const ship=d.buildings.find(b=>b.kind==='cruise_ship');buildShip(ship.exterior);
    const ts=d.map.time_slots?.[d.map.active_time_slot||'morning']||{};
    if(ts.sky_top)bayU.top.value.set(ts.sky_top);if(ts.sky_horizon)bayU.hor.value.set(ts.sky_horizon);if(ts.haze)bayU.haze.value.set(ts.haze);if(ts.water_deep)bayU.deep.value.set(ts.water_deep);if(ts.water_shallow)bayU.shallow.value.set(ts.water_shallow);if(ts.cloud_cover!=null)bayU.cover.value=ts.cloud_cover;
    if(ts.sun_elevation!=null){const e=ts.sun_elevation,a=ts.sun_azimuth||0;bayU.sunDir.value.set(Math.sin(a)*Math.cos(e),Math.sin(e),Math.cos(a)*Math.cos(e)).normalize()}
    bayU.fogD.value=Number(d.map.fog_density)||.00105;bayU.sunCol.value.set(d.map.sun_color||'#fff2dc');
    const root=bayGroup;bayGroup=bayLandGroup;
    for(const n of d.nature){
      if(n.kind==='land')for(const L of n.params.polygons){const s=new THREE.Shape(L.pts.map(([x,z])=>new THREE.Vector2(x,-z)));const geo=new THREE.ExtrudeGeometry(s,{depth:Math.max(1,L.height-6),bevelEnabled:L.height>4,bevelThickness:6,bevelSize:14,bevelSegments:3,curveSegments:4});geo.rotateX(-Math.PI/2);
        const m=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({color:L.color,roughness:1}));m.position.y=-4;bayGroup.add(m);bayLand.push(L);
        if(L.hills){const xs=L.pts.map(p=>p[0]),zs=L.pts.map(p=>p[1]),inP=(x,z)=>{let c=false;for(let a=0,b2=L.pts.length-1;a<L.pts.length;b2=a++){const [x1,z1]=L.pts[a],[x2,z2]=L.pts[b2];if((z1>z)!==(z2>z)&&x<(x2-x1)*(z-z1)/(z2-z1)+x1)c=!c}return c};
          let made=0;for(let k=0;k<L.hills*20&&made<L.hills;k++){const x=Math.min(...xs)+bayHash(k,L.height,1)*(Math.max(...xs)-Math.min(...xs)),z=Math.min(...zs)+bayHash(k,L.height,2)*(Math.max(...zs)-Math.min(...zs));const r=L.hills>10?60+bayHash(k,3,3)*90:30+bayHash(k,3,3)*30;
            if(!inP(x,z)||!inP(x+r*.8,z)||!inP(x-r*.8,z)||!inP(x,z+r*.8)||!inP(x,z-r*.8))continue;const hh=r*(.45+bayHash(k,4,4)*.5)+L.height;streamAdd(x,z,()=>addKarst(x,z,r,hh,9000+k,{round:true,dome:.75}));made++}}}
      if(n.kind==='backdrop'){bayBackdrop=paintBackdrop(n.params,ts.sun_azimuth||0);bayGroup.add(bayBackdrop)}
      if(n.kind==='karst_field')n.params.items.forEach(([x,z,r,h,v],i)=>{const ex=fieldExtras(i,x,z,r,h,v);for(const e of ex)bayExtraRocks.push([e[0],e[1],e[2]*1.3]);
        streamAdd(x,z,()=>{addKarst(x,z,r,h,i*7+v,{shape:v});for(const e of ex)addKarst(e[0],e[1],e[2],e[3],e[4],{shape:e[5],rot:e[6]})})})
    }
    for(const p of d.props){
      if(p.kind==='landmark'){const q=p.params||{};STREAM.lms.push({p,x:p.x,z:p.z,r:q.shape==='village'?200:(q.radius||40)*1.6+30,g:null,ms:null});if(q.shape==='village')for(const v of villageRocks(p))bayExtraRocks.push([v[0],v[1],v[6]])}
      if(p.kind==='moored_boat'){const g=makeJunk(p.params?.hull);g.position.set(p.x,0,p.z);g.rotation.y=p.params?.heading||0;g.scale.setScalar(.9);bayGroup.add(g);bayBuoys.push({g,x:p.x,z:p.z})}
      if(p.kind==='junk_boat'){const g=makeJunk(p.params?.hull);bayGroup.add(g);bayJunks.push({g,x:p.x,z:p.z,r:p.params?.loop_radius||50,sp:p.params?.speed||3,ph:p.params?.phase||0})}
      if(p.kind==='buoy'){const g=new THREE.Group(),c=p.params?.color||'#d8483a';const b=new THREE.Mesh(new THREE.CylinderGeometry(.9,1.1,2.4,12),new THREE.MeshStandardMaterial({color:c}));b.position.y=.8;g.add(b);
        const band=new THREE.Mesh(new THREE.CylinderGeometry(.92,.92,.5,12),new THREE.MeshStandardMaterial({color:'#f4f2ec'}));band.position.y=1.2;g.add(band);
        const cone=new THREE.Mesh(new THREE.ConeGeometry(.6,1.1,10),new THREE.MeshStandardMaterial({color:c}));cone.position.y=2.55;g.add(cone);g.position.set(p.x,0,p.z);bayGroup.add(g);bayBuoys.push({g,x:p.x,z:p.z})}
    }
    bayGroup=root;
    window.__bayRockCount={field:(d.nature.find(n=>n.kind==='karst_field')?.params.items.length)||0,extra:bayExtraRocks.length,cells:STREAM.cells.size,landmarks:STREAM.lms.length};
    bayChunks.clear();addTuDaoMountain();
    bayKarstMeshes=finishKarsts();
    buildTuDao();
    buildNav(d,ship.exterior);
    const sp=d.map.spawn;bayShip.x=sp.x;bayShip.z=sp.z;bayShip.heading=sp.heading||0;
    bayBuilt=true;
  }
  // ---- Lưới dò đường: ô bị chặn bởi đảo, bờ đất (cộng khoảng an toàn của tàu); A* tám hướng rồi kéo thẳng đường ----
  const NAV={C:24};
  function buildNav(d,ex){
    const b=d.map.bounds,C=NAV.C,CL=ex.clearance||26;NAV.x0=b.x_min;NAV.z0=b.z_min;NAV.nx=Math.ceil((b.x_max-b.x_min)/C);NAV.nz=Math.ceil((b.z_max-b.z_min)/C);
    // block: lưới dò đường (đá + khoảng an toàn của tàu); hard: chỉ chân đá thật (+ vài mét), dùng khi tàu đang chạy để thấy vật cản phía trước mà giảm tốc
    const blk=NAV.block=new Uint8Array(NAV.nx*NAV.nz),hard=NAV.hard=new Uint8Array(NAV.nx*NAV.nz);
    const discTo=(arr,x,z,r)=>{const i0=Math.max(0,Math.floor((x-r-NAV.x0)/C)),i1=Math.min(NAV.nx-1,Math.floor((x+r-NAV.x0)/C)),j0=Math.max(0,Math.floor((z-r-NAV.z0)/C)),j1=Math.min(NAV.nz-1,Math.floor((z+r-NAV.z0)/C));
      for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++){const cx=NAV.x0+(i+.5)*C,cz=NAV.z0+(j+.5)*C;if(Math.hypot(cx-x,cz-z)<r+C*.35)arr[j*NAV.nx+i]=1}};
    const disc=(x,z,rNav,rHard)=>{discTo(blk,x,z,rNav+CL);discTo(hard,x,z,rHard)};
    for(const n of d.nature)if(n.kind==='karst_field')for(const [x,z,r,,v] of n.params.items){const er=r*(v===3?1.9:v===4?1.35:1);disc(x,z,er*1.25,er*1.02+3)}
    for(const p of d.props){if(p.kind==='moored_boat')disc(p.x,p.z,8,6);if(p.kind==='landmark'&&p.params?.shape==='pier')disc(p.x,p.z+22,14,12)}
    for(const p of d.props)if(p.kind==='landmark'){const q=p.params||{};if(q.radius>0)disc(p.x,p.z,q.radius*(q.shape==='big_island'?1.25:1.4),q.radius*(q.shape==='big_island'?1.08:1.2)+3);
      if(q.shape==='village'){const f=lmFacing(p);disc(p.x-Math.cos(f)*34,p.z-Math.sin(f)*34,56,48)}}
    for(const [x,z,rr] of bayExtraRocks)disc(x,z,rr,rr);
    const segD=(px,pz,ax,az,bx,bz)=>{const vx=bx-ax,vz=bz-az,L=vx*vx+vz*vz||1,t=Math.max(0,Math.min(1,((px-ax)*vx+(pz-az)*vz)/L));return Math.hypot(ax+vx*t-px,az+vz*t-pz)};
    // bờ đất: phần trong đa giác tô theo từng hàng ô, dải ven bờ tính theo từng cạnh (nhanh hơn nhiều so với xét mọi cạnh cho mọi ô)
    const HP=C*.35;for(const L of bayLand){const P=L.pts,pad=CL+12,zs=P.map(p=>p[1]);
      const r0=Math.max(0,Math.floor((Math.min(...zs)-NAV.z0)/C)),r1=Math.min(NAV.nz-1,Math.floor((Math.max(...zs)-NAV.z0)/C));
      for(let j=r0;j<=r1;j++){const cz=NAV.z0+(j+.5)*C,xs=[];for(let a=0,b2=P.length-1;a<P.length;b2=a++){const [x1,z1]=P[a],[x2,z2]=P[b2];if((z1>cz)!==(z2>cz))xs.push(x1+(cz-z1)*(x2-x1)/(z2-z1))}xs.sort((p,q)=>p-q);
        for(let k=0;k+1<xs.length;k+=2){const i0=Math.max(0,Math.ceil((xs[k]-NAV.x0)/C-.5)),i1=Math.min(NAV.nx-1,Math.floor((xs[k+1]-NAV.x0)/C-.5));for(let i=i0;i<=i1;i++){blk[j*NAV.nx+i]=1;hard[j*NAV.nx+i]=1}}}
      for(let a=0,b2=P.length-1;a<P.length;b2=a++){const [x1,z1]=P[a],[x2,z2]=P[b2];
        const i0=Math.max(0,Math.floor((Math.min(x1,x2)-pad-NAV.x0)/C)),i1=Math.min(NAV.nx-1,Math.floor((Math.max(x1,x2)+pad-NAV.x0)/C)),j0=Math.max(0,Math.floor((Math.min(z1,z2)-pad-NAV.z0)/C)),j1=Math.min(NAV.nz-1,Math.floor((Math.max(z1,z2)+pad-NAV.z0)/C));
        for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++){const k=j*NAV.nx+i;if(hard[k])continue;const m=segD(NAV.x0+(i+.5)*C,NAV.z0+(j+.5)*C,x1,z1,x2,z2);if(m<pad)blk[k]=1;if(m<HP)hard[k]=1}}}
    // mép bản đồ
    for(let i=0;i<NAV.nx;i++){blk[i]=1;blk[(NAV.nz-1)*NAV.nx+i]=1}for(let j=0;j<NAV.nz;j++){blk[j*NAV.nx]=1;blk[j*NAV.nx+NAV.nx-1]=1}
  }
  const navCell=(x,z)=>[Math.max(0,Math.min(NAV.nx-1,Math.floor((x-NAV.x0)/NAV.C))),Math.max(0,Math.min(NAV.nz-1,Math.floor((z-NAV.z0)/NAV.C)))];
  navFree=(x,z)=>{const [i,j]=navCell(x,z);return !NAV.block[j*NAV.nx+i]};
  const hardFree=(x,z)=>{const [i,j]=navCell(x,z);return !NAV.hard[j*NAV.nx+i]};
  function nearestFree(i,j,towardI,towardJ){if(!NAV.block[j*NAV.nx+i])return[i,j];let best=null;for(let r=1;r<60&&!best;r++){for(let dj=-r;dj<=r;dj++)for(let di=-r;di<=r;di++){if(Math.max(Math.abs(di),Math.abs(dj))!==r)continue;const a=i+di,b=j+dj;if(a<0||b<0||a>=NAV.nx||b>=NAV.nz||NAV.block[b*NAV.nx+a])continue;const score=Math.hypot(di,dj)+.15*Math.hypot(a-towardI,b-towardJ)/60;if(!best||score<best[2])best=[a,b,score]}}return best?[best[0],best[1]]:null}
  function lineFree(ax,az,bx,bz){const d=Math.hypot(bx-ax,bz-az),n=Math.ceil(d/(NAV.C*.45));for(let k=0;k<=n;k++){const t=k/n;if(!navFree(ax+(bx-ax)*t,az+(bz-az)*t))return false}return true}
  function findPath(sx,sz,tx,tz,exact){
    const nx=NAV.nx,blk=NAV.block;let [si,sj]=navCell(sx,sz);let [ti,tj]=navCell(tx,tz);
    const s=nearestFree(si,sj,ti,tj),t=nearestFree(ti,tj,si,sj);if(!s||!t)return null;[si,sj]=s;[ti,tj]=t;
    const N=nx*NAV.nz,gs=new Float32Array(N).fill(Infinity),par=new Int32Array(N).fill(-1),closed=new Uint8Array(N),heap=[];
    const hf=(i,j)=>{const dx=Math.abs(i-ti),dz=Math.abs(j-tj);return Math.max(dx,dz)+.414*Math.min(dx,dz)};
    const push=(k,f)=>{heap.push([f,k]);let c=heap.length-1;while(c){const p=(c-1)>>1;if(heap[p][0]<=heap[c][0])break;[heap[p],heap[c]]=[heap[c],heap[p]];c=p}};
    const pop=()=>{const top=heap[0],last=heap.pop();if(heap.length){heap[0]=last;let c=0;for(;;){const l=c*2+1,r=l+1;let m=c;if(l<heap.length&&heap[l][0]<heap[m][0])m=l;if(r<heap.length&&heap[r][0]<heap[m][0])m=r;if(m===c)break;[heap[m],heap[c]]=[heap[c],heap[m]];c=m}}return top};
    const sk=sj*nx+si,tk=tj*nx+ti;gs[sk]=0;push(sk,hf(si,sj));const D=[[1,0,1],[-1,0,1],[0,1,1],[0,-1,1],[1,1,1.414],[1,-1,1.414],[-1,1,1.414],[-1,-1,1.414]];
    let found=false;while(heap.length){const [,k]=pop();if(closed[k])continue;closed[k]=1;if(k===tk){found=true;break}const i=k%nx,j=(k-i)/nx;
      for(const [di,dj,c] of D){const a=i+di,b=j+dj;if(a<0||b<0||a>=nx||b>=NAV.nz)continue;const kk=b*nx+a;if(blk[kk]||closed[kk])continue;if(di&&dj&&(blk[j*nx+a]||blk[b*nx+i]))continue;let g=gs[k]+c;const pk=par[k];if(pk>=0){const pi=k%nx-pk%nx,pj=((k-k%nx)-(pk-pk%nx))/nx;g+=(1-(di*pi+dj*pj)/(Math.hypot(di,dj)*Math.hypot(pi,pj)))*.6}if(g<gs[kk]){gs[kk]=g;par[kk]=k;push(kk,g+hf(a,b))}}}
    if(!found)return null;
    const raw=[];for(let k=tk;k!==-1;k=par[k]){const i=k%nx,j=(k-i)/nx;raw.push([NAV.x0+(i+.5)*NAV.C,NAV.z0+(j+.5)*NAV.C])}raw.reverse();
    const end=navFree(tx,tz)||(exact&&hardFree(tx,tz))?[tx,tz]:raw[raw.length-1];raw[raw.length-1]=end;
    const out=[];let cx=sx,cz=sz,k=0;while(k<raw.length-1){let far=k+1;for(let m=raw.length-1;m>k+1;m--){if(lineFree(cx,cz,raw[m][0],raw[m][1])){far=m;break}}out.push(raw[far]);[cx,cz]=raw[far];k=far}
    if(!out.length)out.push(end);return out;
  }
  // ---- Điểm đến: vòng sáng trên mặt nước ----
  const bayMarker=new THREE.Group();{const ring=new THREE.Mesh(new THREE.RingGeometry(5,6.4,40),new THREE.MeshBasicMaterial({color:'#f6e3b0',transparent:true,opacity:.85,depthWrite:false,side:THREE.DoubleSide}));ring.rotation.x=-Math.PI/2;ring.position.y=.4;bayMarker.add(ring);
    const pin=new THREE.Mesh(new THREE.CylinderGeometry(.18,.18,9,8),new THREE.MeshBasicMaterial({color:'#f6e3b0'}));pin.position.y=4.8;bayMarker.add(pin);const top=new THREE.Mesh(new THREE.SphereGeometry(1,14,10),new THREE.MeshBasicMaterial({color:'#e9b866'}));top.position.y=9.6;bayMarker.add(top);bayMarker.userData.ring=ring}
  bayMarker.visible=false;bayGroup.add(bayMarker);
  // ---- Đường đi vẽ trên mặt nước: các vạch sáng nối mũi tàu tới đích, vòng qua các đảo (cập nhật khi tàu chạy) ----
  const bayRoute=new THREE.Mesh(new THREE.BufferGeometry(),new THREE.MeshBasicMaterial({color:'#fff1c9',transparent:true,opacity:.62,depthWrite:false,side:THREE.DoubleSide}));bayRoute.frustumCulled=false;bayRoute.visible=false;bayRoute.renderOrder=2;bayGroup.add(bayRoute);
  function updateRoute(){const S=bayShip;bayRoute.visible=false;return;/* không vẽ vạch đường đi trên mặt biển */if(!S.path.length||bayIsland||bayPhoto){bayRoute.visible=false;return}
    const pts=[shipBow(S)].concat(S.path),pos=[],idx=[],W=.8,ON=6,OFF=4,MAX=1600;let along=0,total=0;
    for(let i=0;i<pts.length-1&&total<MAX;i++){const [ax,az]=pts[i],[bx,bz]=pts[i+1],L=Math.hypot(bx-ax,bz-az);if(L<.01)continue;const ux=(bx-ax)/L,uz=(bz-az)/L,nx=-uz*W,nz=ux*W;
      for(let t=(along%(ON+OFF))?(ON+OFF)-(along%(ON+OFF)):0;t<L&&total+t<MAX;t+=ON+OFF){const e=Math.min(L,t+ON),x0=ax+ux*t,z0=az+uz*t,x1=ax+ux*e,z1=az+uz*e,b=pos.length/3;
        pos.push(x0+nx,.45,z0+nz,x0-nx,.45,z0-nz,x1+nx,.45,z1+nz,x1-nx,.45,z1-nz);idx.push(b,b+1,b+2,b+1,b+3,b+2)}
      along+=L;total+=L}
    const g=bayRoute.geometry;g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(idx);bayRoute.visible=pos.length>0}
  const fmtKm=u=>{const m=u*(bayData?.map?.geo?.meters_per_unit||4);return m<1000?Math.round(m/10)*10+' m':(m/1000).toFixed(1).replace('.',',')+' km'};
  // Đường đi ngắn nhất tính cho MŨI tàu (A* trên lưới đã nới khoảng an toàn quanh đảo, rồi kéo thẳng các đoạn không vướng đảo).
  // Mặc định (x,z) là chỗ TÂM tàu dừng: chặng cuối được kéo dài thêm một khoảng mũi–tâm. opt.bow: (x,z) là chỗ mũi tàu chạm (cầu tàu).
  function setDestination(x,z,label,fromTour,opt){if(bayIsland)islandBoardNow('new');if(bayPlay)playEnd(true);if(bayPause&&!fromTour)dropPause();bayShip.faceLm=null;
    if(!bayBuilt)return;if(!fromTour&&typeof bayTour!=='undefined'&&bayTour)endTour(false);const bow=!!opt?.bow,[bx,bz]=shipBow(bayShip),ap=opt?.approach;
    // cập cầu tàu: chạy tới điểm chờ ngoài khơi thẳng trục cầu tàu, rồi đi thẳng chặng cuối để mũi chạm đúng đầu cầu
    const L0=ap?Math.hypot(x-ap[0],z-ap[1]):1,ux=ap?(x-ap[0])/L0:0,uz=ap?(z-ap[1])/L0:0,along=(bx-x)*ux+(bz-z)*uz,lat=Math.abs((bx-x)*uz-(bz-z)*ux);
    let path;if(ap&&!(along<-3&&along>-L0*1.2&&lat<5)){/* mũi chưa nằm trên trục cầu tàu: vòng ra điểm chờ trước */path=findPath(bx,bz,ap[0],ap[1]);if(path)path.push([x,z])}else path=findPath(bx,bz,x,z,bow);
    if(!path){bayCaption('Không tìm được đường tới đó, hãy chọn chỗ nước thoáng hơn');return}
    if(!bayShip.path.length||bayShip.speed<.5){bayShip.bh=bayShip.heading;bayShip.yawRate=0}
    const end=path[path.length-1];bayShip.path=path;bayShip.dest={x,z,label:label||null,bow};bayShip.stopped=false;
    let len=0,px=bx,pz=bz;for(const [a,b] of path){len+=Math.hypot(a-px,b-pz);px=a;pz=b}
    bayMarker.position.set(end[0],0,end[1]);bayMarker.visible=false;
    updateRoute();bayCaption((fromTour&&bayTour?'🧭 '+(bayTour.idx+1)+'/'+bayTour.stops.length+' · ':'⛵ ')+'Đang đi tới '+(label||'điểm đã chọn')+' · khoảng '+fmtKm(len),5200);refreshBayHud();drawBayMap();
  }
  function pauseShip(){if(!bayBuilt||bayPause)return;const S=bayShip;
    bayPause={path:S.path.slice(),dest:S.dest,marker:bayMarker.visible,tour:bayTour||null,dwell:bayTour&&bayTour.dwellUntil?Math.max(0,bayTour.dwellUntil-performance.now()):0,auto:false,turn:0};
    S.path=[];S.dest=null;if(bayTour)bayTour.dwellUntil=0;bayTour=null;bayMarker.visible=false;viewYaw=0;
    bayCaption('⏸ Thuyền dừng lại · vuốt hoặc giữ nút xoay để ngắm, bấm 📷 để chụp ảnh',5000);bayStatusKey='';refreshBayHud();drawBayMap()}
  function resumeShip(){const P=bayPause;if(!P)return;bayPause=null;const S=bayShip;viewYaw=0;
    if(P.tour){bayTour=P.tour;if(P.path.length){S.path=P.path;S.dest=P.dest;bayMarker.visible=P.marker}else bayTour.dwellUntil=performance.now()+Math.max(1500,P.dwell)}
    else if(P.path.length){S.path=P.path;S.dest=P.dest;bayMarker.visible=P.marker}
    bayCaption(P.path.length||P.tour?'▶ Thuyền đi tiếp':'⚓ Thôi ngắm cảnh',3000);bayStatusKey='';refreshBayHud();drawBayMap()}
  function dropPause(){if(!bayPause)return;bayPause=null;bayStatusKey='';refreshBayHud()}
  function stopShip(){dropPause();dropPause();endTour(false);bayShip.path=[];bayShip.dest=null;bayShip.stopped=true;bayMarker.visible=false;refreshBayHud();drawBayMap()}
  // ---- Âm sóng tổng hợp tại chỗ ----
  // Âm thanh của vịnh: Sóng biển · Nhạc (nhạc thiền tạo ngay trên máy) · Im lặng. Lưu lựa chọn trên máy.
  let bayAudio=null,bayAudioMode='waves';try{const m=localStorage.getItem('yen_bay_audio');bayAudioMode=['waves','music','silent'].includes(m)?m:(localStorage.getItem('yen_bay_sound')==='0'?'silent':'waves')}catch(e){}
  const BAY_AUDIO={waves:['🌊','Sóng biển'],music:['🎵','Nhạc'],silent:['🔇','Im lặng']};
  function startBaySound(){
    stopBaySound(true);if(bayAudioMode==='silent')return;
    try{const a=new(window.AudioContext||window.webkitAudioContext)(),master=a.createGain();master.gain.value=0;master.connect(a.destination);const st={a,master,timers:[]};
      if(bayAudioMode==='waves'){const len=a.sampleRate*4,buf=a.createBuffer(1,len,a.sampleRate),d=buf.getChannelData(0);let b0=0,b1=0;for(let i=0;i<len;i++){const w=Math.random()*2-1;b0=.997*b0+w*.029;b1=.985*b1+w*.032;d[i]=(b0+b1)*.9}
        const src=a.createBufferSource();src.buffer=buf;src.loop=true;const lp=a.createBiquadFilter();lp.type='lowpass';lp.frequency.value=480;const g=a.createGain();g.gain.value=.3;
        const lfo=a.createOscillator();lfo.frequency.value=.1;const lg=a.createGain();lg.gain.value=.18;lfo.connect(lg);lg.connect(g.gain);src.connect(lp);lp.connect(g);g.connect(master);src.start();lfo.start();master.gain.linearRampToValueAtTime(.45,a.currentTime+2.5)}
      else{// nhạc: nền hợp âm ngũ cung chậm, vài tiếng chuông gió lấp lánh, có vang nhẹ
        const echo=a.createDelay(2);echo.delayTime.value=.42;const fb=a.createGain();fb.gain.value=.38;const wet=a.createGain();wet.gain.value=.35;echo.connect(fb);fb.connect(echo);echo.connect(wet);wet.connect(master);
        const PENTA=[261.63,293.66,329.63,392,440],note=(f,type,att,dur,vol,when=a.currentTime)=>{const o=a.createOscillator(),g=a.createGain();o.type=type;o.frequency.value=f;g.gain.setValueAtTime(0,when);g.gain.linearRampToValueAtTime(vol,when+att);g.gain.exponentialRampToValueAtTime(.0001,when+dur);o.connect(g);g.connect(master);g.connect(echo);o.start(when);o.stop(when+dur+.1)};
        const chords=[[0,2,4],[1,3,0],[2,4,1],[4,1,3]];let ci=0;
        const pad=()=>{const c=chords[ci++%chords.length];for(const k of c){note(PENTA[k]/2,'sine',2.5,9,.05);note(PENTA[k]/2*1.003,'triangle',3,9,.02)}};
        const bell=()=>{note(PENTA[Math.floor(Math.random()*5)]*(Math.random()<.5?2:1),'sine',.02,3.2,.045)};
        pad();st.timers.push(setInterval(pad,8000));st.timers.push(setInterval(()=>{if(Math.random()<.7)bell()},1700));
        master.gain.linearRampToValueAtTime(.8,a.currentTime+3)}
      bayAudio=st}catch(e){bayAudio=null}
  }
  function stopBaySound(quick){if(!bayAudio)return;const {a,master,timers}=bayAudio;bayAudio=null;timers.forEach(clearInterval);try{master.gain.cancelScheduledValues(a.currentTime);master.gain.setValueAtTime(master.gain.value,a.currentTime);master.gain.linearRampToValueAtTime(0,a.currentTime+(quick?.2:.6));setTimeout(()=>a.close(),quick?300:800)}catch(e){}}
  function setBayAudio(mode){bayAudioMode=mode;try{localStorage.setItem('yen_bay_audio',mode)}catch(e){}if(bayMode)startBaySound();refreshBayHud();if(typeof refreshOpts==='function')refreshOpts();bayCaption(BAY_AUDIO[mode][0]+' Âm thanh: '+BAY_AUDIO[mode][1],2500)}
  // ---- Bảng điều khiển và bản đồ ----
  bayHUD=document.createElement('div');bayHUD.id='bayHUD';bayHUD.setAttribute('role','region');bayHUD.setAttribute('aria-label','Vịnh Hạ Long');
  bayHUD.innerHTML='<div class="bay-row" style="position:relative"><button type="button" data-bay="status" class="bay-status" title="Mở tùy chọn du thuyền"><span class="bay-st-ico">⚓</span><span class="bay-st-text">Đang neo</span></button><button type="button" data-bay="pause" class="bay-stop" title="Dừng thuyền ngắm cảnh" aria-label="Dừng thuyền ngắm cảnh" aria-pressed="false">⏸️<span> Ngắm cảnh</span></button><button type="button" data-bay="fast" class="bay-fast" title="Đi nhanh: tốc độ ×5" aria-label="Đi nhanh, tốc độ nhân 5" aria-pressed="false">⏩<span> Nhanh</span></button><i class="bay-sep" aria-hidden="true"></i><button type="button" data-bay="tab-tour" title="Tour trải nghiệm" aria-label="Tour trải nghiệm">🧭<span> Tour</span></button><button type="button" data-bay="tab-cruise" title="Dạo ngắm vịnh" aria-label="Dạo ngắm vịnh">⛵<span> Dạo vịnh</span></button><button type="button" data-bay="tab-dest" title="Điểm đến · đến ngay" aria-label="Điểm đến">📍<span> Điểm đến</span></button><button type="button" data-bay="tab-view" title="Góc nhìn" aria-label="Góc nhìn">🎥<span> Góc nhìn</span></button><button type="button" data-bay="photo" title="Chụp ảnh" aria-label="Chụp ảnh">📷<span> Chụp ảnh</span></button><button type="button" data-bay="clean" title="Toàn cảnh: ẩn hết nút, chạm màn hình để hiện lại" aria-label="Toàn cảnh, ẩn hết nút">⛶<span> Toàn cảnh</span></button><button type="button" data-bay="audio" title="Âm thanh" aria-label="Chọn âm thanh">🌊<span> Âm thanh</span></button></div><div class="bay-row bay-pause-row" id="bayPauseRow" hidden><button type="button" data-bp2="left" title="Xoay trái (giữ để xoay)" aria-label="Xoay trái">⟲<span> Xoay trái</span></button><button type="button" data-bp2="auto" title="Tự xoay 360°" aria-label="Tự xoay 360 độ" aria-pressed="false">🔄<span> 360°</span></button><button type="button" data-bp2="right" title="Xoay phải (giữ để xoay)" aria-label="Xoay phải">⟳<span> Xoay phải</span></button><button type="button" data-bp2="front" title="Nhìn về mũi tàu" aria-label="Nhìn về mũi tàu">⬆<span> Mũi tàu</span></button><i class="bay-sep" aria-hidden="true"></i><button type="button" data-bp2="bowl" title="Xoay mũi tàu sang trái (giữ để xoay)" aria-label="Xoay mũi tàu sang trái">↶<span> Quay tàu</span></button><button type="button" data-bp2="bowr" title="Xoay mũi tàu sang phải (giữ để xoay)" aria-label="Xoay mũi tàu sang phải">↷<span> Quay tàu</span></button><i class="bay-sep" aria-hidden="true"></i><button type="button" data-bp2="photo" title="Chụp ảnh" aria-label="Chụp ảnh">📷<span> Chụp ảnh</span></button><button type="button" data-bp2="go" class="bay-go" title="Đi tiếp" aria-label="Đi tiếp">▶<span> Đi tiếp</span></button><button type="button" data-bp2="end" title="Kết thúc hành trình, neo tại đây" aria-label="Kết thúc hành trình">⏹<span> Neo lại</span></button></div><div class="bay-pop" id="bayAudioPop" role="menu" hidden><button type="button" role="menuitemradio" data-aud="waves">🌊 Sóng biển</button><button type="button" role="menuitemradio" data-aud="music">🎵 Nhạc thư giãn</button><button type="button" role="menuitemradio" data-aud="silent">🔇 Im lặng</button></div>';
  const bayCapBox=document.createElement('div');bayCapBox.id='bayCapBox';bayCapBox.innerHTML='<div class="bay-caption" id="bayCaption" aria-live="polite"></div>';document.body.appendChild(bayCapBox);
  document.body.appendChild(bayHUD);
  const BAY_TABS='<div class="bay-tabs" role="tablist"><button type="button" role="tab" data-tab="tour" aria-label="Tour trải nghiệm">🧭<span> Tour trải nghiệm</span></button><button type="button" role="tab" data-tab="cruise" aria-label="Dạo ngắm vịnh">⛵<span> Dạo ngắm vịnh</span></button><button type="button" role="tab" data-tab="dest" aria-label="Điểm đến">📍<span> Điểm đến</span></button><button type="button" role="tab" data-tab="view" aria-label="Góc nhìn">🎥<span> Góc nhìn</span></button></div>';
  const BAY_FOOT='<div class="bay-sheet-foot"><span>Tốc độ</span><button type="button" data-opt="slow">▶ Thong thả</button><button type="button" data-opt="fast">⏩ Nhanh ×5</button><span>Âm thanh</span><button type="button" data-opt="aud" data-mode="waves">🌊 Sóng</button><button type="button" data-opt="aud" data-mode="music">🎵 Nhạc</button><button type="button" data-opt="aud" data-mode="silent">🔇 Im lặng</button></div>';
  bayMapBox=document.createElement('div');bayMapBox.id='bayMap';bayMapBox.setAttribute('role','dialog');bayMapBox.setAttribute('aria-label','Bản đồ vịnh Hạ Long');
  bayMapBox.innerHTML='<div class="bay-map-head"><b>⛵ Du thuyền Yên</b><button type="button" data-bay="map-close">✕ Đóng</button></div>'+BAY_TABS+'<div class="bay-regions" id="bayRegions" role="tablist"></div><canvas id="bayMapCanvas" width="720" height="620"></canvas><p class="bay-map-note">Chạm một điểm trên bản đồ hoặc tên danh thắng để đến ngay. Bấm 📸 để đến điểm check-in và mở máy ảnh, danh thắng ở phía sau lưng bạn. Vị trí theo bản đồ thật (gần đúng), kích thước đảo được phóng đại.</p><div class="bay-map-places" id="bayMapPlaces"></div>'+BAY_FOOT;
  document.body.appendChild(bayMapBox);
  let captionTimer=0;function bayCaption(s,ms=4200){const c=document.getElementById('bayCaption');c.textContent=s;c.classList.add('show');clearTimeout(captionTimer);captionTimer=setTimeout(()=>c.classList.remove('show'),ms)}
  // Trạng thái tàu: neo · đang đi tới · dạo vịnh (đang đi / dừng ngắm) · đang ở danh thắng
  shortName=n=>String(n||'').split(' · ')[0];
  function bayStatus(){
    const S=bayShip;let rem=0,px=S.x,pz=S.z;for(const [a,b] of S.path){rem+=Math.hypot(a-px,b-pz);px=a;pz=b}
    if(bayPause){const where=bayPause.tour?shortName(bayPause.tour.tour.name):bayPause.dest?.label?'đến '+shortName(bayPause.dest.label):bayPause.path.length?'đến điểm đã chọn':'';return{ico:'⏸',text:'Dừng ngắm cảnh'+(where?' · '+where:''),short:'Đang dừng',moving:false,paused:true}}
    if(typeof bayTour!=='undefined'&&bayTour){const s=bayTour.stops[bayTour.idx],p=lmById(s.landmark),n=bayTour.stops.length,k=(bayTour.idx+1)+'/'+n;
      const nm=shortName(p?.name).replace(/^(Hòn|Đảo|Động|Hang|Làng chài|Cảng tàu khách quốc tế) /,'');
      if(S.path.length)return{ico:'🧭',text:shortName(bayTour.tour.name)+' · '+k+' · đến '+shortName(p?.name)+' · còn '+fmtKm(rem),short:k+' · '+nm+' · '+fmtKm(rem),moving:true,tour:true};
      if(bayTour.dwellUntil){const sec=Math.max(0,Math.ceil((bayTour.dwellUntil-performance.now())/1000));return{ico:'📍',text:shortName(p?.name)+' · '+k+' · đi tiếp sau '+sec+' giây',short:k+' · '+nm+' · '+sec+' giây',moving:true,tour:true}}
      return{ico:'📍',text:shortName(p?.name)+' · '+k,short:k+' · '+nm,moving:true,tour:true}}
    if(S.path.length){const nm=S.dest?.label?shortName(S.dest.label).replace(/^(Hòn|Đảo|Động|Hang|Làng chài|Cảng tàu khách quốc tế) /,''):'điểm chọn';return{ico:'⛵',text:'Đến '+(S.dest?.label?shortName(S.dest.label):'điểm đã chọn')+' · còn '+fmtKm(rem),short:nm+' · '+fmtKm(rem),moving:true}}
    let near=null;if(bayData)for(const p of bayData.props){if(p.kind!=='landmark')continue;const d=Math.hypot(p.x-S.x,p.z-S.z);if(!near||d<near.d)near={p,d}}
    if(bayAt&&Math.hypot(S.x-bayAt.x,S.z-bayAt.z)<200)near={p:bayAt.p,d:0};
    const nm=near?shortName(near.p.name).replace(/^Cảng tàu khách quốc tế /,'Cảng '):'';
    if(near&&near.d<(near.p.params?.radius||30)+260)return{ico:'📍',text:'Đang ở '+shortName(near.p.name),short:'Ở '+nm,moving:false};
    if(near&&near.d<900)return{ico:'⚓',text:'Đang neo · gần '+shortName(near.p.name),short:'Neo · gần '+nm,moving:false};
    return{ico:'⚓',text:'Đang neo giữa vịnh',short:'Neo giữa vịnh',moving:false};
  }
  let bayStatusKey='';
  function refreshBayHud(){
    const st=bayStatus(),narrow=innerWidth<760,txt=narrow&&st.short?st.short:st.text,key=st.ico+txt+st.moving;
    if(key!==bayStatusKey){bayStatusKey=key;const chip=bayHUD.querySelector('[data-bay="status"]');chip.querySelector('.bay-st-ico').textContent=st.ico;chip.querySelector('.bay-st-text').textContent=txt;chip.classList.toggle('moving',st.moving);chip.setAttribute('aria-label','Trạng thái tàu: '+st.text+'. Mở Hành trình');
      const pb=bayHUD.querySelector('[data-bay="pause"]');pb.setAttribute('aria-pressed',String(!!st.paused));pb.title=st.paused?'Đang dừng ngắm cảnh':'Dừng thuyền ngắm cảnh';
      const pr=document.getElementById('bayPauseRow');pr.hidden=!st.paused;document.body.classList.toggle('bay-paused',!!st.paused);if(st.paused){const g=pr.querySelector('[data-bp2="go"]');g.hidden=!bayPause.path.length&&!bayPause.tour;pr.querySelector('[data-bp2="end"]').hidden=g.hidden}}
    if(bayPause){const a=document.querySelector('[data-bp2="auto"]');if(a)a.setAttribute('aria-pressed',String(!!bayPause.auto))}
    {const ab=bayHUD.querySelector('[data-bay="audio"]');if(ab){const [ic,lb]=BAY_AUDIO[bayAudioMode];ab.innerHTML=ic+'<span> '+lb+'</span>';ab.title='Âm thanh: '+lb}for(const b of bayHUD.querySelectorAll('[data-aud]'))b.setAttribute('aria-checked',String(b.dataset.aud===bayAudioMode))}
    bayHUD.querySelector('[data-bay="tab-tour"]').setAttribute('aria-pressed',String(!!(typeof bayTour!=='undefined'&&bayTour)));
    {const fb=bayHUD.querySelector('[data-bay="fast"]'),M=bayMult();if(fb&&fb.dataset.m!==String(M)){fb.dataset.m=String(M);fb.setAttribute('aria-pressed',String(M>1));fb.innerHTML='⏩<span> '+(M>1?'×'+M:'Nhanh')+'</span>';
      fb.title=M===1?'Đi nhanh: tốc độ ×5':'Đang đi ×5 · bấm để về tốc độ thường';fb.setAttribute('aria-label',fb.title)}}
  }

  // ---- Bảng tùy chọn của du thuyền: Tour trải nghiệm · Dạo ngắm vịnh · Điểm đến · Góc nhìn ----
  baySheet=document.createElement('div');baySheet.id='baySheet';baySheet.setAttribute('role','dialog');baySheet.setAttribute('aria-label','Tùy chọn du thuyền');
  baySheet.innerHTML='<div class="bay-map-head"><b>⛵ Du thuyền Yên</b><button type="button" data-bay="sheet-close">✕ Đóng</button></div>'+BAY_TABS+'<p class="bay-map-note" id="baySheetTitle"></p><div id="baySheetBody"></div>'+BAY_FOOT;
  document.body.appendChild(baySheet);
  closeSheet=()=>{baySheet.classList.remove('open');document.body.classList.remove('bay-map-open')};
  baySheet.addEventListener('click',e=>{if(e.target.closest('[data-bay="sheet-close"]'))closeSheet()});
  const setTab=t=>{for(const b of document.querySelectorAll('.bay-tabs [data-tab]'))b.setAttribute('aria-selected',String(b.dataset.tab===t))};
  let lastTrip='tour';
  function openTrip(tab){if(!bayBuilt){bayCaption('Đang tải bản đồ vịnh…');return}tab=tab||lastTrip;lastTrip=tab;
    if(tab==='dest'){closeSheet();openBayMap()}else{bayMapBox.classList.remove('open');({tour:renderTours,cruise:renderCruise,view:renderViews})[tab]();baySheet.classList.add('open');document.body.classList.add('bay-map-open')}
    setTab(tab);refreshOpts()}
  document.addEventListener('click',e=>{const b=e.target.closest('.bay-tabs [data-tab]');if(b)openTrip(b.dataset.tab);
    const o=e.target.closest('[data-opt]');if(!o)return;
    if(o.dataset.opt==='slow'||o.dataset.opt==='fast'||o.dataset.opt==='fast9'){setBayMult(o.dataset.opt==='slow'?1:5);bayStatusKey='';refreshBayHud();refreshOpts();if(baySheet.classList.contains('open')&&lastTrip!=='view')openTrip(lastTrip)}
    if(o.dataset.opt==='aud')setBayAudio(o.dataset.mode)});
  function refreshOpts(){const M=bayMult();for(const [k,v] of [['slow',1],['fast',5],['fast9',-1]])for(const b of document.querySelectorAll('[data-opt="'+k+'"]'))b.setAttribute('aria-pressed',String(M===v));
    for(const b of document.querySelectorAll('[data-opt="aud"]'))b.setAttribute('aria-pressed',String(b.dataset.mode===bayAudioMode))}
  const lmById=id=>bayData?.props.find(p=>p.kind==='landmark'&&p.id===id);
  function legLength(fx,fz,tx,tz){const p=findPath(fx,fz,tx,tz);if(!p)return Math.hypot(tx-fx,tz-fz)*1.3;let len=0,x=fx,z=fz;for(const [a,b] of p){len+=Math.hypot(a-x,b-z);x=a;z=b}return len}
  // Thời gian: trên web theo tốc độ tàu trong cảnh; ngoài đời theo tốc độ tàu du lịch thật (ước tính, ghi trong dữ liệu).
  const fmtDur=s=>{s=Math.max(1,Math.round(s));if(s<60)return s+' giây';const m=Math.round(s/60);if(m<60)return m+' phút';const hh=Math.floor(m/60),mm=m%60;return hh+' giờ'+(mm?' '+mm+' phút':'')};
  const webSecs=len=>len/(bayShip.max*bayMult())+(len>1?5/bayMult():0);
  const realSecs=len=>len*(bayData?.map?.geo?.meters_per_unit||4)/1000/(bayShip.ex?.real_speed_kmh||15)*3600;
  const legInfo=(len,dwell=0)=>fmtKm(len)+' · web '+fmtDur(webSecs(len)+dwell/bayMult())+' · ngoài đời ≈ '+fmtDur(realSecs(len));
  const approachOf=p=>viewPoint(p);
  const sheetBody=(note)=>{document.getElementById('baySheetTitle').textContent=note;const body=document.getElementById('baySheetBody');body.innerHTML='';return body};
  function renderTours(){
    const body=sheetBody('Chọn tour và đoạn muốn đi: từ điểm nào đến điểm nào. Thời gian ngoài đời là ước tính theo tàu du lịch thật ('+(bayShip.ex?.real_speed_kmh||15)+' km/giờ).');
    if(bayTour){const cur=document.createElement('div');cur.className='bay-tour-now';cur.textContent='Đang đi: '+shortName(bayTour.tour.name)+' · điểm '+(bayTour.idx+1)+'/'+bayTour.stops.length;const stop=document.createElement('button');stop.type='button';stop.textContent='⏹ Kết thúc tour';stop.onclick=()=>{endTour(true);stopShip();closeSheet()};cur.appendChild(stop);body.appendChild(cur)}
    for(const t of bayData.props.filter(p=>p.kind==='tour')){
      const stops=(t.params?.stops||[]).filter(s=>lmById(s.landmark));if(!stops.length)continue;
      const card=document.createElement('div');card.className='bay-card bay-tour';
      card.innerHTML='<b></b><small></small><div class="bay-range"><label>Từ <select data-r="from"></select></label><label>Đến <select data-r="to"></select></label></div><ol class="bay-legs"></ol><div class="bay-tour-foot"><em></em><button type="button">⛵ Bắt đầu</button></div>';
      card.querySelector('b').textContent=t.name;card.querySelector('small').textContent=t.params?.summary||'';
      const selFrom=card.querySelector('[data-r="from"]'),selTo=card.querySelector('[data-r="to"]');
      stops.forEach((s,i)=>{const nm=shortName(lmById(s.landmark).name);selFrom.add(new Option((i+1)+'. '+nm,i));selTo.add(new Option((i+1)+'. '+nm,i))});selTo.value=String(stops.length-1);
      const legsCache=new Map();const leg=(ax,az,bx,bz)=>{const k=[ax,az,bx,bz].map(Math.round).join(',');if(!legsCache.has(k))legsCache.set(k,legLength(ax,az,bx,bz));return legsCache.get(k)};
      const draw=()=>{let a=+selFrom.value,b=+selTo.value;if(b<a){b=a;selTo.value=String(a)}
        const ol=card.querySelector('.bay-legs');ol.innerHTML='';let x=bayShip.x,z=bayShip.z,total=0,dwell=0,prev='Vị trí tàu';
        for(let i=a;i<=b;i++){const p=lmById(stops[i].landmark),[px,pz]=approachOf(p),len=leg(x,z,px,pz);total+=len;if(i<b)dwell+=stops[i].dwell||0;
          const li=document.createElement('li');li.innerHTML='<span></span><small></small>';li.querySelector('span').textContent=prev+' → '+shortName(p.name);li.querySelector('small').textContent=len<30?'đang ở đây':legInfo(len);ol.appendChild(li);x=px;z=pz;prev=shortName(p.name)}
        card.querySelector('em').textContent='Tổng '+fmtKm(total)+' · web '+fmtDur(webSecs(total)+dwell/bayMult())+' (gồm dừng ngắm) · ngoài đời ≈ '+fmtDur(realSecs(total));};
      selFrom.onchange=draw;selTo.onchange=draw;draw();
      card.querySelector('.bay-tour-foot button').onclick=()=>{startTour(t,+selFrom.value,+selTo.value);closeSheet()};body.appendChild(card)}
  }
  function renderCruise(){
    const body=sheetBody('Chọn điểm đến tiếp theo, tàu tự chạy tới và tránh các đảo trên đường.');
    const list=bayData.props.filter(p=>p.kind==='landmark').map(p=>{const [ax,az]=approachOf(p),d=Math.hypot(ax-bayShip.x,az-bayShip.z);return{p,d}}).sort((a,b)=>a.d-b.d).map(({p,d},i)=>{const [ax,az]=approachOf(p);return{p,len:d<30?0:i<10?legLength(bayShip.x,bayShip.z,ax,az):d*1.25}});
    for(const {p,len} of list){const c=document.createElement('div');c.className='bay-card bay-tour';
      c.innerHTML='<b></b><small></small><div class="bay-tour-foot"><em></em><button type="button">⛵ Đi tới</button></div>';c.querySelector('b').textContent=p.name;c.querySelector('small').textContent=p.params?.description||'';
      c.querySelector('em').textContent=len<1?'Tàu đang ở đây':legInfo(len);const btn=c.querySelector('button');if(len<1)btn.hidden=true;
      btn.onclick=()=>{endTour(false);goLandmark(p);closeSheet()};body.appendChild(c)}
  }
  bayView='bow';try{const v=localStorage.getItem('yen_bay_view');if(['bow','sundeck','far','spin'].includes(v))bayView=v}catch(e){}
  function renderViews(){
    const body=sheetBody('Chọn góc nhìn. Ở mọi góc, bạn vẫn vuốt trái/phải để nhìn quanh mà không đổi hướng tàu.');
    const views=bayShip.ex?.views||[{id:'bow',label:'Mũi tàu'},{id:'sundeck',label:'Boong thượng'},{id:'far',label:'Ngắm tàu từ xa'},{id:'spin',label:'Tự xoay 360°'}],ico={bow:'🧍',sundeck:'☀️',far:'🛳',spin:'🔄'};
    const grid=document.createElement('div');grid.className='bay-views';
    for(const v of views){const b=document.createElement('button');b.type='button';b.className='bay-card';b.setAttribute('aria-pressed',String(v.id===bayView));b.innerHTML='<b></b><small></small>';b.querySelector('b').textContent=(ico[v.id]||'🎥')+' '+v.label;b.querySelector('small').textContent=v.note||'';
      b.onclick=()=>{setBayView(v.id);closeSheet()};grid.appendChild(b)}
    body.appendChild(grid);
  }
  // Zoom trong vịnh: ＋/－, con lăn chuột, chụm 2 ngón. Gần ↔ xa sau lưng người (camera lên cao dần để thấy toàn cảnh);
  // đã xa hết cỡ mà vẫn thu nhỏ tiếp → chuyển sang "Ngắm tàu từ xa"; ở đó phóng to hết cỡ → trở về sau lưng người.
  bayLift=0,bayLiftWant=0,bayLiftT=0,bayLiftObjs=null,bayLiftPull=false;
  bayZoom=1,bayFarZoom=1,bayZoomOver=0,bayZoomBack='bow';try{const z=Number(localStorage.getItem('yen_bay_zoom'));if(z>=.8&&z<=4)bayZoom=z}catch(e){}
  const BZ_MIN=.8,BZ_MAX=4,BF_MIN=.55,BF_MAX=1.8;let bayZoomS=bayZoom,bayFarZoomS=bayFarZoom,bayLimitAt=0,bayBurst=0,bayZoomEvt=0;
  // Zoom quá giới hạn mới đổi sang/khỏi góc "toàn cảnh từ xa", nhưng chỉ ở một lần vuốt/cuộn MỚI bắt đầu khi đã ở giới hạn
  // (nghỉ tay ≥ 0,35 s): một lần vuốt/cuộn liền tay chạm giới hạn thì dừng ở đó, không nhảy cảnh. Nút ＋/－ (btn) thì đổi ngay.
  function bayZoomBy(f,force,btn){if(!bayMode||(bayPhoto&&!force))return;const far=bayView==='far',now=performance.now();
    if(now-bayZoomEvt>350)bayBurst=now;bayZoomEvt=now;
    const atLim=far?(f<1&&bayFarZoom<=BF_MIN+1e-3):(f>1&&bayZoom>=BZ_MAX-1e-3);
    if(atLim){if(!bayLimitAt)bayLimitAt=now;if(!btn)return;if(btn)bayZoomOver=Math.max(bayZoomOver,.25)}else bayLimitAt=0;
    if(!far){if(f>1&&bayZoom>=BZ_MAX-1e-3&&!bayIsland){bayZoomOver+=Math.log(f);if(bayZoomOver>.3){bayZoomOver=0;bayZoomBack=bayView;setBayView('far');bayFarZoom=bayFarZoomS=BF_MIN;bayLimitAt=0;bayCaption('🛳 Toàn cảnh từ xa · bấm ＋ để quay lại sau lưng',3000)}}
      else{bayZoomOver=0;bayZoom=Math.max(BZ_MIN,Math.min(BZ_MAX,bayZoom*f))}}
    else{if(f<1&&bayFarZoom<=BF_MIN+1e-3){bayZoomOver+=Math.log(1/f);if(bayZoomOver>.3){bayZoomOver=0;setBayView(bayZoomBack&&bayZoomBack!=='far'?bayZoomBack:'bow');bayZoom=bayZoomS=BZ_MAX;bayLimitAt=0}}
      else{bayZoomOver=0;bayFarZoom=Math.max(BF_MIN,Math.min(BF_MAX,bayFarZoom*f))}}
    try{localStorage.setItem('yen_bay_zoom',String(bayZoom))}catch(e){}}
  function setBayView(id){if(bayIsland&&(id==='far'||id==='spin')){bayCaption('🏝 Đang dạo trên đảo · về tàu rồi mới ngắm toàn cảnh được',3000);return}bayView=id;viewYaw=0;bayLift=0;bayLiftT=0;walkPitch=id==='far'?.12:.05;try{localStorage.setItem('yen_bay_view',id)}catch(e){}refreshBayHud();
    const v=(bayShip.ex?.views||[]).find(x=>x.id===id);bayCaption('🎥 '+(v?.label||'Góc nhìn')+(v?.note?' · '+v.note:''),3500)}
  // Lịch trình: đi lần lượt tới điểm ghé của từng danh thắng, dừng ngắm vài giây rồi đi tiếp.
  bayTour=null;
  function startTour(t,from=0,to){dropPause();let stops=(t.params?.stops||[]).filter(s=>lmById(s.landmark));if(to==null)to=stops.length-1;stops=stops.slice(Math.max(0,from),Math.max(from,to)+1);if(!stops.length)return;bayTour={tour:t,stops,idx:0,dwellUntil:0};bayCaption('🧭 Bắt đầu: '+shortName(t.name)+' · '+shortName(lmById(stops[0].landmark).name)+' → '+shortName(lmById(stops[stops.length-1].landmark).name),5000);sailToStop()}
  function sailToStop(){const s=bayTour.stops[bayTour.idx],p=lmById(s.landmark);let a=viewPoint(p);bayAt={p,x:a[0],z:a[1]};
    if(Math.hypot(a[0]-bayShip.x,a[1]-bayShip.z)<8){bayShip.faceLm=p;arriveStop();return}
    setDestination(a[0],a[1],p.name,true);if(!bayShip.path.length){a=p.params?.approach||[p.x,p.z];bayAt={p,x:a[0],z:a[1]};setDestination(a[0],a[1],p.name,true)}bayShip.faceLm=p;if(!bayShip.path.length){bayCaption('Không tìm được đường tới '+p.name+', bỏ qua điểm này');nextStop()}}
  function arriveStop(){const s=bayTour.stops[bayTour.idx],p=lmById(s.landmark);bayCaption('📍 '+(bayTour.idx+1)+'/'+bayTour.stops.length+' · '+p.name+(s.note?' · '+s.note:''),Math.max(4000,(s.dwell||0)*1000/bayMult()));
    if(bayTour.idx>=bayTour.stops.length-1){const name=shortName(bayTour.tour.name);setTimeout(()=>{if(!bayTour)return;bayTour=null;refreshBayHud();bayCaption('✨ Hoàn thành tour · '+name,6000)},Math.max(2500,(s.dwell||0)*1000/bayMult()));return}
    bayTour.dwellUntil=performance.now()+(s.dwell||0)*1000/bayMult();}
  function nextStop(){if(!bayTour)return;bayTour.idx++;bayTour.dwellUntil=0;if(bayTour.idx>=bayTour.stops.length){bayTour=null;refreshBayHud();return}sailToStop();refreshBayHud()}
  function endTour(say){if(!bayTour)return;bayTour=null;if(say)bayCaption('Đã kết thúc lịch trình dạo vịnh');refreshBayHud()}
  refreshBayHud();
  const mapView={s:1,ox:0,oz:0};
  let mapRegion='all';try{const v=localStorage.getItem('yen_bay_region');if(v)mapRegion=v}catch(e){}
  const REGION_NAME={halong:'Vịnh Hạ Long',lanha:'Vịnh Lan Hạ',btl:'Vịnh Bái Tử Long'};
  const lmRegion=p=>p.params?.region||'halong';
  const LM_ICON={village:'🏘',beach:'🏖',island_beach:'🏖',titop:'🏖',arch:'🕳',cove:'🌿',big_island:'⛰',pier:'⚓',bridge:'🌉'};
  function regionBounds(){const b=bayData.map.bounds;if(mapRegion==='all')return b;const ps=bayData.props.filter(p=>p.kind==='landmark'&&lmRegion(p)===mapRegion);if(!ps.length)return b;
    const xs=ps.map(p=>p.x),zs=ps.map(p=>p.z),pad=650,span=Math.max(...xs)-Math.min(...xs);return{x_min:Math.min(...xs)-pad,x_max:Math.max(...xs)+pad+span*.22,z_min:Math.min(...zs)-pad,z_max:Math.max(...zs)+pad}}
  function renderRegions(){const box=document.getElementById('bayRegions');if(!box)return;const items=bayData.nature.find(n=>n.kind==='map_regions')?.params.items||[{id:'all',name:'Toàn cảnh'}];
    box.innerHTML='';for(const it of items){const b=document.createElement('button');b.type='button';b.setAttribute('role','tab');b.textContent=it.name;b.setAttribute('aria-selected',String(it.id===mapRegion));b.onclick=()=>{mapRegion=it.id;try{localStorage.setItem('yen_bay_region',it.id)}catch(e){}renderRegions();renderPlaces();drawBayMap()};box.appendChild(b)}}
  function closeMapBox(){bayMapBox.classList.remove('open');document.body.classList.remove('bay-map-open')}
  function renderPlaces(){const places=document.getElementById('bayMapPlaces');places.innerHTML='';
    {const w=document.createElement('span');w.className='bay-place';const btn=document.createElement('button');btn.type='button';btn.textContent='🏝 Đảo Yên của bạn';btn.title='Đến ngay Đảo Yên của bạn';btn.onclick=()=>{goTuDao(true);closeMapBox()};w.append(btn);places.appendChild(w)}
    const groups=mapRegion==='all'?['halong','lanha','btl']:[mapRegion];
    for(const g of groups){const ps=bayData.props.filter(p=>p.kind==='landmark'&&lmRegion(p)===g);if(!ps.length)continue;
      if(groups.length>1){const hd=document.createElement('div');hd.className='bay-place-head';hd.textContent=REGION_NAME[g];places.appendChild(hd)}
      for(const p of ps){const w=document.createElement('span');w.className='bay-place';const btn=document.createElement('button');btn.type='button';btn.textContent=(LM_ICON[p.params?.shape]||'🪨')+' '+p.name;btn.title='Đến ngay '+p.name;btn.onclick=()=>{warpToLandmark(p);closeMapBox()};
        const ck=document.createElement('button');ck.type='button';ck.className='bay-ck';ck.textContent='📸';ck.title='Check-in chụp ảnh tại '+p.name;ck.setAttribute('aria-label','Check-in chụp ảnh tại '+p.name);ck.onclick=()=>checkinLandmark(p);
        w.append(btn,ck);places.appendChild(w)}}}
  function checkinLandmark(p){if(!bayBuilt)return;closeMapBox();closeSheet();warpToLandmark(p,true);setTimeout(()=>{openPhoto();if(bayPhoto){bayPhoto.pose=PHOTO_POSES.find(q=>q.id==='scene')||PHOTO_POSES[0];bayPhoto.cam={...CAM0};renderPhotoBar()}bayCaption('📸 Check-in '+p.name+' · chỉnh camera rồi bấm chụp',4200)},350)}
  function drawBayMap(){
    if(!bayBuilt||!bayMapBox.classList.contains('open'))return;const cv=document.getElementById('bayMapCanvas'),ctx=cv.getContext('2d'),b=regionBounds(),W=cv.width,H=cv.height;
    mapView.s=Math.min(W/(b.x_max-b.x_min),H/(b.z_max-b.z_min));mapView.ox=(W-(b.x_max-b.x_min)*mapView.s)/2-b.x_min*mapView.s;mapView.oz=(H-(b.z_max-b.z_min)*mapView.s)/2-b.z_min*mapView.s;
    const X=x=>x*mapView.s+mapView.ox,Z=z=>z*mapView.s+mapView.oz,FS=Math.min(2.1,Math.max(1,W/Math.max(1,cv.clientWidth))),fz=n=>Math.round(n*FS)+'px';
    ctx.fillStyle='#bfe1da';ctx.fillRect(0,0,W,H);
    for(const L of bayLand){ctx.beginPath();L.pts.forEach(([x,z],i)=>i?ctx.lineTo(X(x),Z(z)):ctx.moveTo(X(x),Z(z)));ctx.closePath();ctx.fillStyle=L.color;ctx.globalAlpha=.85;ctx.fill();ctx.globalAlpha=1}
    // đảo vẽ đúng dáng chân đảo (dãy dài, hai đỉnh là hình bầu dục xoay như trong cảnh 3D), danh thắng có đảo vẽ thêm khối đảo bên dưới chấm vàng
    for(const n of bayData.nature){if(n.kind==='karst_field'){ctx.fillStyle='#7f9b77';ctx.strokeStyle='#5f7d5a';ctx.lineWidth=1;n.params.items.forEach(([x,z,r,,v],i)=>{const sp=KSHAPES[v]||{},rx=Math.max(1.3,r*(sp.sx||1)*mapView.s),rz=Math.max(1.1,r*(sp.sz||1)*mapView.s);ctx.beginPath();ctx.ellipse(X(x),Z(z),rx,rz,bayHash(i*7+v,9,1)*6.28,0,6.283);ctx.fill();if(rx>4)ctx.stroke()})}
      if(n.kind==='channels'){ctx.strokeStyle='#ffffffaa';ctx.setLineDash([4,5]);ctx.lineWidth=1.2;for(const line of n.params.lines){ctx.beginPath();line.forEach(([x,z],i)=>i?ctx.lineTo(X(x),Z(z)):ctx.moveTo(X(x),Z(z)));ctx.stroke()}ctx.setLineDash([])}}
    {const lb=bayData.nature.find(n=>n.kind==='map_labels');if(lb){ctx.textAlign='center';for(const L of lb.params.items){ctx.fillStyle='#2f5a52aa';ctx.font='italic 600 '+fz(mapRegion==='all'?13:16)+' Georgia,serif';ctx.fillText(L.name,X(L.x),Z(L.z));if(L.sub){ctx.font='italic '+fz(12)+' Georgia,serif';ctx.fillText(L.sub,X(L.x),Z(L.z)+16*FS)}}ctx.textAlign='left'}}
    for(const p of bayData.props){const r=p.kind==='landmark'&&p.params?.radius;if(r>0){ctx.fillStyle='#6f8f68';ctx.beginPath();ctx.arc(X(p.x),Z(p.z),Math.max(2,r*mapView.s),0,6.283);ctx.fill()}}
    {const x=X(TU_DAO.x),z=Z(TU_DAO.z);ctx.fillStyle='#e8d29a';ctx.strokeStyle='#8a6a2f';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(x,z,Math.max(3.5,48*mapView.s),0,6.283);ctx.fill();ctx.stroke();if(mapRegion!=='all'){ctx.font='600 '+fz(12)+' Inter,system-ui,sans-serif';ctx.fillStyle='#6b4f1d';ctx.fillText('🏝 Đảo Yên',x+8*FS,z+14*FS)}}
    if(bayShip.path.length){const [bx,bz]=shipBow(bayShip);ctx.strokeStyle='#e9a94f';ctx.lineWidth=2.5*FS;ctx.lineJoin='round';ctx.beginPath();ctx.moveTo(X(bx),Z(bz));for(const [x,z] of bayShip.path)ctx.lineTo(X(x),Z(z));ctx.stroke();const [ex,ez]=bayShip.path[bayShip.path.length-1];ctx.fillStyle='#e9a94f';ctx.beginPath();ctx.arc(X(ex),Z(ez),4*FS,0,6.283);ctx.fill()}
    ctx.font='600 13px Inter,system-ui,sans-serif';ctx.textBaseline='middle';
    const showLabel=mapRegion!=='all',mapLabelBoxes=[];
    for(const p of bayData.props){if(p.kind!=='landmark')continue;const px=X(p.x),pz=Z(p.z);if(px<-20||pz<-20||px>W+20||pz>H+20)continue;ctx.fillStyle=mapRegion==='all'||lmRegion(p)===mapRegion?'#b8862f':'#b8862f88';ctx.beginPath();ctx.arc(px,pz,(showLabel?5:3.5)*FS,0,6.283);ctx.fill();
      if(!showLabel)continue;ctx.font=fz(14)+' system-ui,sans-serif';ctx.fillText(LM_ICON[p.params?.shape]||'',px-7*FS,pz-13*FS);ctx.font='600 '+fz(13)+' Inter,system-ui,sans-serif';const label=p.name.split(' · ')[0],tw=ctx.measureText(label).width;
      const cand=[[px+8*FS,pz,'left'],[px-8*FS,pz,'right'],[px,pz+15*FS,'center'],[px,pz-26*FS,'center']];let put=null;
      for(const [lx,ly,al] of cand){const x0=al==='left'?lx:al==='right'?lx-tw:lx-tw/2,rc=[x0-2,ly-8*FS,x0+tw+2,ly+8*FS];if(rc[0]<0||rc[2]>W||rc[1]<0||rc[3]>H)continue;if(!mapLabelBoxes.some(o=>rc[0]<o[2]&&rc[2]>o[0]&&rc[1]<o[3]&&rc[3]>o[1])){put=[lx,ly,al,rc];break}}
      if(!put)continue;mapLabelBoxes.push(put[3]);ctx.textAlign=put[2];ctx.lineWidth=3;ctx.strokeStyle='#ffffffdd';ctx.strokeText(label,put[0],put[1]);ctx.fillStyle='#24423c';ctx.fillText(label,put[0],put[1]);ctx.textAlign='left'}
    {const km=mapRegion==='all'?10:2,px=km*1000/(bayData.map.geo?.meters_per_unit||4)*mapView.s;ctx.fillStyle='#24423c';ctx.fillRect(14,H-18,px,3*FS);ctx.font=fz(11)+' Inter,system-ui,sans-serif';ctx.fillText(km+' km',14,H-22-8*FS)}
    ctx.save();ctx.translate(X(bayShip.x),Z(bayShip.z));ctx.rotate(-bayShip.heading+Math.PI);ctx.fillStyle='#0f5e66';ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,-10);ctx.lineTo(7,8);ctx.lineTo(0,4);ctx.lineTo(-7,8);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore();
    ctx.fillStyle='#24423c';ctx.font='12px Inter,system-ui,sans-serif';ctx.fillText('B ↑',W-34,18);
  }
  function openBayMap(){bayMapBox.classList.add('open');document.body.classList.add('bay-map-open');if(bayBuilt){renderRegions();renderPlaces()}drawBayMap()}
  // Dịch chuyển tức thì: tàu hiện ngay ở điểm ghé, mũi tàu quay về phía danh thắng.
  // Điểm ngắm: lùi đủ xa để danh thắng nằm trọn trong khung (cao và ngang), nhìn vào mặt đẹp nhất, không bị đảo khác che
  const LM_SIZE={big_island:[2.2,1.15],titop:[2.4,1.5],pair:[2.6,1],incense:[2.2,1],dog:[2.4,1],arch:[2.6,1.35],trio:[2,1],beach:[2.4,1],island_beach:[2.3,1],cove:[2.6,1.25]};
  const VP_CACHE=new Map();
  function viewPoint(p,asp){const key=p.id+'|'+(asp?'a'+asp:camera.aspect<1?'n':'w');if(VP_CACHE.has(key))return VP_CACHE.get(key).slice();const v=viewPointCalc(p,asp);VP_CACHE.set(key,v);return v.slice()}
  function viewPointCalc(p,aspO){const q=p.params||{},sh=q.shape,r=q.radius||20,h=q.height||20,f=lmFacing(p);
    let vx=Math.cos(f),vz=Math.sin(f);
    if(sh==='pair'){const A=.78+Math.PI/2;let px=Math.cos(A),pz=Math.sin(A);if(px*vx+pz*vz<0){px=-px;pz=-pz}vx=px;vz=pz}// Trống Mái: nhìn ngang trục hai hòn
    const [kw,kh]=LM_SIZE[sh]||[0,0];let W=Math.max(30,r*kw),H=h*kh;if(sh==='village'){W=120;H=36}if(sh==='pier'){W=60;H=12}if(sh==='bridge'){W=300;H=40}
    const vf=57*Math.PI/180,asp=Math.max(.45,Math.min(2.2,aspO||camera.aspect||1.6)),hf=2*Math.atan(Math.tan(vf/2)*asp);
    const want=Math.max(h<30&&r<20?38:70,H/Math.tan(vf*.42),(W/2)/Math.tan(hf*.4))+r*(sh==='arch'?1.3:.6)+18;// +18: mũi tàu ở trước tâm tàu
    const base=Math.atan2(vx,vz),front=[p.x+vx*(r*1.45+34),p.z+vz*(r*1.45+34)],isArch=sh==='arch',wantA=isArch?r*.92+Math.max(45,h*1.5)+18:want;
    for(const s of (isArch?[1,1.1,.92,1.2,.85]:[1,.9,.8,.7,.6,.5]))for(let k=0;k<(isArch?5:15);k++){const ang=base+(k%2?1:-1)*Math.ceil(k/2)*(isArch?.08:.15),d=wantA*s,qx=p.x+Math.sin(ang)*d,qz=p.z+Math.cos(ang)*d;
      const fx=p.x+Math.sin(ang)*(r*1.45+34),fz=p.z+Math.cos(ang)*(r*1.45+34);
      if(navFree(qx,qz)&&lineFree(qx,qz,fx,fz))return[qx,qz]}
    return p.params?.approach||[p.x+60,p.z]}
  function warpToLandmark(p,photo){
    if(!bayBuilt)return;if(bayPlay)playEnd(true);dropPause();endTour(false);bayShip.path=[];bayShip.dest=null;bayShip.stopped=true;bayMarker.visible=false;
    const [ax,az]=photo&&camera.aspect<1?viewPoint(p,.8):viewPoint(p);
    bayShip.x=ax;bayShip.z=az;bayShip.speed=0;bayShip.trail.length=0;
    if(Math.hypot(p.x-ax,p.z-az)>1)bayShip.heading=Math.atan2(p.x-ax,p.z-az);viewYaw=0;
    bayAt={p,x:ax,z:az};updateBay(0);camera.position.copy(bayCam);bayLastNear=p;refreshBayHud();drawBayMap();
    document.body.classList.add('bay-warp');setTimeout(()=>document.body.classList.remove('bay-warp'),60);
    bayCaption('✨ Đã đến '+p.name+(p.params?.description?' · '+p.params.description:''),5200);
  }
  function warpToPoint(x,z){
    if(!bayBuilt)return;if(bayPlay)playEnd(true);let px=x,pz=z;if(!navFree(x,z)){const [i,j]=navCell(x,z),f=nearestFree(i,j,i,j);if(!f){bayCaption('Chỗ đó không đến được');return}px=NAV.x0+(f[0]+.5)*NAV.C;pz=NAV.z0+(f[1]+.5)*NAV.C}
    dropPause();endTour(false);bayShip.path=[];bayShip.dest=null;bayShip.stopped=true;bayMarker.visible=false;bayShip.x=px;bayShip.z=pz;bayShip.speed=0;bayShip.trail.length=0;viewYaw=0;
    updateBay(0);camera.position.copy(bayCam);refreshBayHud();drawBayMap();document.body.classList.add('bay-warp');setTimeout(()=>document.body.classList.remove('bay-warp'),60);bayCaption('✨ Đã đến vị trí bạn chọn trên bản đồ',4000);
  }
  function goLandmark(p){let a=viewPoint(p);setDestination(a[0],a[1],p.name);if(!bayShip.path.length&&Math.hypot(a[0]-bayShip.x,a[1]-bayShip.z)>30){a=p.params?.approach||[p.x,p.z];setDestination(a[0],a[1],p.name)}bayAt={p,x:a[0],z:a[1]};bayShip.faceLm=p}
  document.getElementById('bayMapCanvas').addEventListener('click',e=>{if(!bayBuilt)return;const cv=e.currentTarget,r=cv.getBoundingClientRect(),px=(e.clientX-r.left)/r.width*cv.width,pz=(e.clientY-r.top)/r.height*cv.height;
    const x=(px-mapView.ox)/mapView.s,z=(pz-mapView.oz)/mapView.s;let near=null;for(const p of bayData.props){if(p.kind!=='landmark')continue;const d=Math.hypot(p.x-x,p.z-z)*mapView.s;if(d<14&&(!near||d<near.d))near={p,d}}
    if(near)warpToLandmark(near.p);else warpToPoint(x,z);(bayMapBox.classList.remove('open'),document.body.classList.remove('bay-map-open'))});
  bayMapBox.addEventListener('click',e=>{if(e.target.closest('[data-bay="map-close"]'))(bayMapBox.classList.remove('open'),document.body.classList.remove('bay-map-open'))});
  document.addEventListener('pointerdown',e=>{const p=document.getElementById('bayAudioPop');if(p&&!p.hidden&&!e.target.closest('#bayAudioPop,[data-bay="audio"]')){p.hidden=true;document.body.classList.remove('bay-pop-open')}},true);
  bayHUD.addEventListener('click',e=>{const au=e.target.closest('[data-aud]');if(au){setBayAudio(au.dataset.aud);document.getElementById('bayAudioPop').hidden=true;document.body.classList.remove('bay-pop-open');return}const act=e.target.closest('[data-bay]')?.dataset.bay;if(!act)return;
    if(act==='status')openTrip();
    if(act.startsWith('tab-'))openTrip(act.slice(4));
    if(act==='photo')openPhoto();
    if(act==='clean'){closeSheet();document.body.classList.add('bay-clean');const p=document.getElementById('bayAudioPop');if(p)p.hidden=true}
    if(act==='audio'){const p=document.getElementById('bayAudioPop');p.hidden=!p.hidden;document.body.classList.toggle('bay-pop-open',!p.hidden)}
    if(act==='pause'){if(bayPause)resumeShip();else pauseShip()}
    if(act==='fast'){const N=bayMult()>1?1:5;setBayMult(N);bayCaption(N===1?'⛵ Về tốc độ thường':'⏩ Đi nhanh · tốc độ ×'+N+' (cả thời gian dừng ngắm)',2500)}
  });
  {const pr=document.getElementById('bayPauseRow');
    pr.addEventListener('click',e=>{const b=e.target.closest('[data-bp2]');if(!b||!bayPause)return;const k=b.dataset.bp2;
      if(k==='auto'){bayPause.auto=!bayPause.auto;refreshBayHud()}
      else if(k==='front'){bayPause.auto=false;bayPause.snap=true;refreshBayHud()}
      else if(k==='photo'){bayPause.auto=false;openPhoto()}
      else if(k==='go')resumeShip();
      else if(k==='end'){stopShip();bayCaption('⚓ Đã neo tàu tại đây')}});
    for(const [k,d] of [['left',1],['right',-1]]){const b=pr.querySelector('[data-bp2="'+k+'"]');
      b.addEventListener('pointerdown',e=>{if(!bayPause)return;e.preventDefault();bayPause.turn=d;bayPause.auto=false;bayPause.snap=false;refreshBayHud();try{b.setPointerCapture(e.pointerId)}catch(_){}});
      for(const ev of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(ev,()=>{if(bayPause)bayPause.turn=0})}
    for(const [k,d] of [['bowl',1],['bowr',-1]]){const b=pr.querySelector('[data-bp2="'+k+'"]');
      b.addEventListener('pointerdown',e=>{if(!bayPause)return;e.preventDefault();bayPause.bow=d;bayShip.faceLm=null;try{b.setPointerCapture(e.pointerId)}catch(_){}});
      for(const ev of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(ev,()=>{if(bayPause)bayPause.bow=0})}}
  document.getElementById('enterBay')?.addEventListener('click',()=>{if(!document.body.classList.contains('yen-3d-error'))startBaySound()});
  // Chạm trong cảnh: danh thắng → đi tới điểm ghé; đảo hay mặt nước → đi tới chỗ nước gần nhất.
  const bayPlane=new THREE.Plane(new THREE.Vector3(0,1,0),0),bayHit=new THREE.Vector3();
  function bayTap(ray){
    if(!bayBuilt){bayCaption('Đang tải bản đồ vịnh…');return}
    if(bayPlay){const P=bayPlay;if(!/^(swim|kayak)$/.test(P.phase))return;const sh=ray.intersectObject(bayShip.group,true)[0];if(sh){playBack();return}if(ray.ray.intersectPlane(bayPlane,bayHit)){playGoTo(bayHit.x-BAY.x,bayHit.z-BAY.z);return}bayCaption('Chạm xuống mặt nước để '+(P.kind==='kayak'?'chèo':'bơi')+' tới',2500);return}
    if(PLAY.built&&!bayIsland&&playAnchored()){const h=ray.intersectObject(bayShip.group,true)[0],k=h&&h.object.userData.bayPlay;if(k==='slide'){playStart('slide');return}if(k==='kayak'){playStart('kayak');return}}
    if(bayIsland){const all=TU_DAO.group?ray.intersectObject(TU_DAO.group,true):[],act=all.find(h=>/^(cairn|shell|bin)$/.test(h.object.userData.tuDao||'')),th=act||all[0];if(TD_ACT.art&&TD_ACT.mode==='pick'){const c=all.find(h=>/^(cell|artshell)$/.test(h.object.userData.tuDao||''));if(c)shGridTap(c.object.userData.cell);else bayCaption('Chạm vào một ô mờ trên cát để đặt vỏ sò',2200);return}/* vật nhỏ để tương tác (đá, vỏ sò, giỏ) được ưu tiên dù có bụi cây che một phần */if(th&&th.object.userData.tuDao==='house'){islandGo('house');return}if(th&&th.object.userData.tuDao==='med'){islandGo('med');return}if(th&&th.object.userData.stoneArt){const v=th.point.clone();TU_DAO.group.worldToLocal(v);bayCaption('🪨 '+th.object.userData.stoneArt+' · Vườn đá cân bằng Vịnh Yên',4000);const sp=tdNearStand(v.x,v.z,1.6,false)||[v.x,v.z];islandWalkTo(sp[0],sp[1]);return}if(th&&th.object.userData.tuDao==='cairn'){tdGoCairn();return}if(th&&th.object.userData.tuDao==='shell'){tdGoShell(th.object.userData.shell);return}if(th&&th.object.userData.tuDao==='bin'){if(th.object.userData.bin<0){shIntro();return}tdGoBin(th.object.userData.bin);return}
      if(th){const v=th.point.clone();TU_DAO.group.worldToLocal(v);islandWalkTo(v.x,v.z);return}
      bayCaption('Chạm xuống đất để đi tới · nút ⛵ Về tàu để rời đảo',2500);return}
    if(TU_DAO.group){const th=ray.intersectObject(TU_DAO.group,true)[0];if(th&&th.object.userData.tuDao){const k=th.object.userData.tuDao;tuDaoTap(k==='cairn'||k==='shell'||k==='bin'?'island':k);return}}
    const lmHit=ray.intersectObjects(bayPick,false)[0],rock=ray.intersectObjects(bayKarstMeshes,false)[0];
    if(lmHit&&(!rock||lmHit.distance<rock.distance+60)){goLandmark(lmHit.object.userData.landmark);return}
    let pt=null;if(rock)pt=rock.point;else if(ray.ray.intersectPlane(bayPlane,bayHit))pt=bayHit;
    if(!pt){bayCaption('Chạm xuống mặt nước để chọn nơi tàu đi tới',3000);return}
    const x=pt.x-BAY.x,z=pt.z-BAY.z;if(Math.hypot(x-bayShip.x,z-bayShip.z)>1700){bayCaption('Chỗ đó xa quá, hãy mở 🗺 Bản đồ để chọn',3500);return}
    setDestination(x,z,rock?'chân đảo đá':null);
  }
  // ---- Trang phục riêng cho Vịnh Yên: kiểu đi biển và trang phục thiền; rừng thông giữ trang phục cũ ----
  BAY_OUTFIT_KEY='yen_bay_outfit_1',BAY_OUTFIT_SEEN='yen_bay_outfit_seen_1';
  // Năm kiểu: thiền phục (như Rừng Yên) và bốn kiểu dựng riêng cho vịnh. Phụ kiện chọn nhiều: nón, kính, khăn.
  const SEA_STYLES={tee_jeans:{block:'tee'},suit:{block:'suit'},maxi:{dress:'maxi'},ao_dai:{block:'aodai'}};
  const BAY_STYLE_IDS=['robe','tee_jeans','suit','maxi','ao_dai'];
  bayOutfit={style:'tee_jeans',color:'#90b7a5',acc:['hat']},bayOutfitSaved=null,bayOutfitOpen=false;
  try{const o=JSON.parse(localStorage.getItem(BAY_OUTFIT_KEY)||'null');if(o&&o.style==='gown')o.style='ao_dai';if(o&&BAY_STYLE_IDS.includes(o.style)){bayOutfit={style:o.style,color:/^#[0-9a-f]{6}$/i.test(o.color)?o.color:'#90b7a5',acc:Array.isArray(o.acc)?o.acc.filter(a=>['hat','glasses','scarf'].includes(a)):[]};bayOutfitSaved={...bayOutfit,acc:[...bayOutfit.acc]}}}catch(e){}
  const wearMat=c=>new THREE.MeshStandardMaterial({color:c,roughness:.85});
  // Bộ đồ gắn vào một nhân vật (thân + đầu). Dựng từ khối đơn giản nhưng có dáng: quần ống côn, áo vest có ve áo,
  // đầm maxi xòe nhẹ, đầm dạ tiệc ôm dáng đuôi cá; phụ kiện gắn vào đầu.
  const shade=(hex,k)=>{const c=new THREE.Color(hex);c.multiplyScalar(k);return '#'+c.getHexString()};
  lathe=(pts,seg=28)=>new THREE.LatheGeometry(pts.map(([r,y])=>new THREE.Vector2(r,y)),seg);
  function makeSeaWear(group,head){
    const w={group:new THREE.Group(),m:{},head};group.add(w.group);w.group.visible=false;
    const M=(k,c,o={})=>w.m[k]=new THREE.MeshStandardMaterial({color:c,roughness:.8,...o});
    M('legs','#3d5a80');M('shoe','#2b2b2b',{roughness:.45});M('top','#90b7a5',{roughness:.72});M('trim','#ffffff');M('shirt','#f4f2ec');M('tie','#3a3f52');M('dress','#e8a1b4',{side:THREE.DoubleSide});M('gown','#b5a1c7',{roughness:.32,metalness:.22,side:THREE.DoubleSide});M('gold','#d9b56a',{roughness:.35,metalness:.5});M('scarf','#f0e5d4');M('straw','#e2cf9c');M('band','#7a5a3c');M('lens','#1f2629',{roughness:.2,metalness:.4});M('belt','#1b1b1b',{roughness:.45,side:THREE.DoubleSide});M('buckle','#c9ccd1',{roughness:.25,metalness:.8});M('skin','#e7c9a8');
    // quần: hai ống côn từ hông xuống giày
    w.legs=new THREE.Group();for(const sx of [-.14,.14]){const leg=new THREE.Mesh(lathe([[0,.06],[.105,.07],[.13,.45],[.155,.8],[0,.84]],14),w.m.legs);leg.position.x=sx;const shoe=new THREE.Mesh(new THREE.BoxGeometry(.16,.07,.28),w.m.shoe);shoe.position.set(sx,.035,.04);w.legs.add(leg,shoe)}w.group.add(w.legs);
    // áo thun: viền gấu, cổ tròn, tay ngắn
    w.tee=new THREE.Group();{const col=new THREE.Mesh(new THREE.TorusGeometry(.17,.03,8,20),w.m.trim);col.rotation.x=Math.PI/2;col.position.y=1.53;w.tee.add(col);
      const belt=new THREE.Mesh(new THREE.CylinderGeometry(.3,.3,.07,28,1,true),w.m.belt);belt.position.y=.82;const buckle=new THREE.Mesh(new THREE.BoxGeometry(.09,.06,.02),w.m.buckle);buckle.position.set(0,.82,.305);w.tee.add(belt,buckle);
      for(const sx of [-1,1]){const sl=new THREE.Mesh(new THREE.CapsuleGeometry(.11,.12,4,10),w.m.top);sl.position.set(sx*.4,1.32,0);sl.rotation.z=sx*.5;w.tee.add(sl)}}w.group.add(w.tee);
    // vest: áo khoác dài qua hông, ve áo chữ V lộ sơ mi trắng và cà vạt, hàng cúc
    w.suit=new THREE.Group();{const coat=new THREE.Mesh(new THREE.CapsuleGeometry(.37,.5,4,14),w.m.top);coat.position.y=1.12;coat.scale.z=1.03;w.suit.add(coat);
      const collar=new THREE.Mesh(new THREE.CylinderGeometry(.18,.24,.2,20,1,true),w.m.top);collar.position.y=1.68;w.suit.add(collar);
      const scol=new THREE.Mesh(new THREE.CylinderGeometry(.165,.175,.16,20,1,true),w.m.shirt);scol.position.y=1.72;w.suit.add(scol);
      for(const sx of [-1,1]){const pt=new THREE.Mesh(new THREE.BoxGeometry(.07,.07,.012),w.m.shirt);pt.position.set(sx*.06,1.65,.205);pt.rotation.z=sx*.75;w.suit.add(pt)}
      const v=new THREE.Shape();v.moveTo(-.13,.24);v.lineTo(.13,.24);v.lineTo(0,-.12);v.closePath();const shirt=new THREE.Mesh(new THREE.ShapeGeometry(v),w.m.shirt);shirt.position.set(0,1.12,.377);w.suit.add(shirt);
      const tie=new THREE.Mesh(new THREE.BoxGeometry(.06,.26,.01),w.m.tie);tie.position.set(0,1.18,.383);w.suit.add(tie);
      for(const sx of [-1,1]){const lap=new THREE.Mesh(new THREE.BoxGeometry(.06,.3,.012),w.m.trim);lap.position.set(sx*.1,1.2,.378);lap.rotation.z=sx*.38;w.suit.add(lap);
        const sl=new THREE.Mesh(new THREE.CapsuleGeometry(.1,.42,4,10),w.m.top);sl.position.set(sx*.43,1.08,0);sl.rotation.z=sx*.12;w.suit.add(sl)}
      for(const y of [1.05,.92]){const b=new THREE.Mesh(new THREE.SphereGeometry(.022,8,6),w.m.tie);b.position.set(0,y,.39);w.suit.add(b)}}w.group.add(w.suit);
    // đầm maxi: thân áo hai dây, chân váy dài xòe nhẹ có nếp gợn, nơ eo
    w.maxi=new THREE.Group();{const pts=[];for(let k=0;k<=10;k++){const t=k/10;pts.push([.25+t*.12+t*t*.3,.86-t*.82])}pts.push([0,.04]);const skirt=new THREE.Mesh(lathe(pts.reverse().map(([r,y])=>[r,y]),36),w.m.dress);
      const pos=skirt.geometry.attributes.position;for(let q=0;q<pos.count;q++){const x=pos.getX(q),z=pos.getZ(q),y=pos.getY(q),a=Math.atan2(z,x),f=1+.05*Math.sin(a*9)*(1-y/.86);pos.setX(q,x*f);pos.setZ(q,z*f)}skirt.geometry.computeVertexNormals();w.maxi.add(skirt);
      const sash=new THREE.Mesh(new THREE.TorusGeometry(.33,.035,8,24),w.m.scarf);sash.rotation.x=Math.PI/2;sash.position.y=.87;sash.scale.set(.8,.8,1);w.maxi.add(sash);const bow=new THREE.Mesh(new THREE.SphereGeometry(.06,10,8),w.m.scarf);bow.scale.set(1.6,1,.6);bow.position.set(.08,.87,.27);w.maxi.add(bow);
      for(const sx of [-1,1]){const st=new THREE.Mesh(new THREE.CylinderGeometry(.015,.015,.22,6),w.m.dress);st.position.set(sx*.16,1.52,.08);w.maxi.add(st)}}w.group.add(w.maxi);
    // đầm dạ tiệc: trễ vai, thân ôm theo ngực, eo, hông; xòe đuôi cá với hai tầng bèo; tà dài phía sau;
    // viền bèo mềm quanh vai, dây chuyền vàng mảnh
    w.gown=new THREE.Group();{
      const body=new THREE.Mesh(lathe([[0,.01],[.52,.01],[.45,.04],[.34,.12],[.24,.28],[.2,.42],[.22,.58],[.26,.74],[.255,.84],[.19,.97],[.2,1.08],[.245,1.22],[.255,1.3],[.22,1.36],[0,1.36]],48),w.m.gown);w.gown.add(body);
      const tier=(r,y,k)=>{const t=new THREE.Mesh(new THREE.TorusGeometry(r,.045,8,40),w.m.gown);t.rotation.x=Math.PI/2;t.position.y=y;const p=t.geometry.attributes.position;for(let q=0;q<p.count;q++){const x=p.getX(q),yy=p.getY(q),a=Math.atan2(yy,x);p.setZ(q,p.getZ(q)+Math.sin(a*k)*.012)}t.geometry.computeVertexNormals();w.gown.add(t)};
      tier(.33,.16,14);tier(.44,.06,18);
      const train=new THREE.Mesh(lathe([[0,.01],[.48,.01],[.4,.05],[.3,.14],[.2,.3],[0,.3]],32),w.m.gown);train.scale.set(.8,1,2.4);train.position.z=-.3;w.gown.add(train);
      const ruffle=new THREE.Mesh(new THREE.TorusGeometry(.25,.045,10,40),w.m.gown);ruffle.rotation.x=Math.PI/2;ruffle.position.y=1.37;ruffle.scale.set(1.25,.78,1);{const p=ruffle.geometry.attributes.position;for(let q=0;q<p.count;q++){const x=p.getX(q),yy=p.getY(q),a=Math.atan2(yy,x);p.setZ(q,p.getZ(q)+Math.sin(a*16)*.01)}ruffle.geometry.computeVertexNormals()}w.gown.add(ruffle);
      const belt=new THREE.Mesh(new THREE.TorusGeometry(.195,.014,8,30),w.m.gold);belt.rotation.x=Math.PI/2;belt.position.y=.97;w.gown.add(belt);
      const neck=new THREE.Mesh(new THREE.TorusGeometry(.12,.012,6,24),w.m.gold);neck.rotation.x=Math.PI/2-.35;neck.position.set(0,1.6,.03);w.gown.add(neck);
      const pend=new THREE.Mesh(new THREE.OctahedronGeometry(.028),w.m.gold);pend.position.set(0,1.51,.12);w.gown.add(pend);
    }w.group.add(w.gown);
    // Thân dạng khối (theo hình mẫu): cổ, thân áo, hai tay có bàn tay, hai ống quần, giày.
    // Dùng cho vest, áo thun · quần jean và áo dài. Phần trên tách riêng để hạ xuống khi ngồi thiền.
    M('pants','#3b3b3b');M('jean','#2c3a52');M('sneaker','#f2f0ea',{roughness:.6});M('silk','#f7f4ec',{roughness:.5,side:THREE.DoubleSide});M('lapel','#000000');M('ad','#e8a1b4',{roughness:.5,side:THREE.DoubleSide});
    // Khối bo tròn cạnh (bán kính theo cạnh ngắn nhất), đổ bóng mượt như hình mẫu
    const rbox=(sx,sy,sz,k=.32)=>{const r=Math.min(sx,sy,sz)*k,g=new THREE.BoxGeometry(sx,sy,sz,6,6,6),p=g.attributes.position,hx=sx/2-r,hy=sy/2-r,hz=sz/2-r,v=new THREE.Vector3(),c=new THREE.Vector3();
      for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i);c.set(Math.max(-hx,Math.min(hx,v.x)),Math.max(-hy,Math.min(hy,v.y)),Math.max(-hz,Math.min(hz,v.z)));v.sub(c);if(v.lengthSq()>1e-9)v.setLength(r);v.add(c);p.setXYZ(i,v.x,v.y,v.z)}
      g.computeVertexNormals();return g};
    const B=(x,y,z,sx,sy,sz,m,g)=>{const thin=Math.min(sx,sy,sz)<.03;const b=new THREE.Mesh(thin?new THREE.BoxGeometry(sx,sy,sz):rbox(sx,sy,sz),m);b.position.set(x,y,z);g.add(b);return b};
    w.bk={};const mk=()=>{const g=new THREE.Group();w.group.add(g);g.visible=false;return g};
    // ---- vest: dáng chiết eo (ngực rộng, eo thon, vạt xòe nhẹ), vai tròn mềm, ve áo satin, khăn cài túi ngực ----
    {const up=mk(),lg=mk();w.bk.suit={up,lg};
      M('satin','#000000',{roughness:.35,metalness:.08});M('gloss','#1b1b1b',{roughness:.25,metalness:.15});w.m.top.roughness=.6;
      const R=(x,y,z,sx,sy,sz,m,g,k)=>{const b=new THREE.Mesh(rbox(sx,sy,sz,k),m);b.position.set(x,y,z);g.add(b);return b};
      B(0,1.585,0,.15,.14,.15,w.m.skin,up);
      const coat=new THREE.Mesh(lathe([[0,.84],[.255,.84],[.275,.88],[.27,.95],[.235,1.06],[.25,1.18],[.29,1.32],[.3,1.42],[.28,1.5],[.2,1.55],[.08,1.57],[0,1.57]],32),w.m.top);coat.scale.z=.56;up.add(coat);
      const v=new THREE.Shape();v.moveTo(-.1,0);v.lineTo(.1,0);v.lineTo(0,-.3);v.closePath();const sh=new THREE.Mesh(new THREE.ShapeGeometry(v),w.m.shirt);sh.position.set(0,1.53,.163);up.add(sh);
      for(const sx of [-1,1]){const l=B(sx*.07,1.4,.164,.075,.3,.012,w.m.satin,up);l.rotation.z=sx*.34}
      B(0,1.38,.167,.045,.26,.008,w.m.tie,up);
      for(const y of [1.12,1.02]){const bt=new THREE.Mesh(new THREE.SphereGeometry(.016,10,8),w.m.satin);bt.position.set(0,y,.138);up.add(bt)}
      const sq=new THREE.Shape();sq.moveTo(-.04,0);sq.lineTo(.04,0);sq.lineTo(.02,.04);sq.lineTo(0,.025);sq.lineTo(-.02,.045);sq.closePath();const pk=new THREE.Mesh(new THREE.ShapeGeometry(sq),w.m.shirt);pk.position.set(.16,1.33,.165);up.add(pk);
      const col=new THREE.Mesh(new THREE.TorusGeometry(.085,.022,8,20),w.m.shirt);col.rotation.x=Math.PI/2;col.position.y=1.535;up.add(col);
      for(const sx of [-1,1]){const arm=R(sx*.335,1.17,0,.13,.6,.15,w.m.top,up,.5);arm.rotation.z=sx*.05;B(sx*.345,.865,0,.115,.035,.14,w.m.shirt,up);R(sx*.345,.8,0,.1,.1,.11,w.m.skin,up,.48);
        R(sx*.11,.47,0,.19,.78,.21,w.m.pants,lg,.45);R(sx*.11,.04,.04,.19,.08,.3,w.m.gloss,lg,.45)}}
    // ---- áo thun · quần jean ----
    {const up=mk(),lg=mk();w.bk.tee={up,lg};
      B(0,1.585,0,.15,.14,.15,w.m.skin,up);
      B(0,1.2,0,.58,.66,.32,w.m.top,up);
      const col=new THREE.Mesh(new THREE.TorusGeometry(.09,.02,6,18),w.m.shirt);col.rotation.x=Math.PI/2;col.position.y=1.535;up.add(col);
      for(const sx of [-1,1]){B(sx*.36,1.42,0,.17,.22,.22,w.m.top,up);B(sx*.36,1.07,0,.11,.48,.13,w.m.skin,up);
        B(sx*.12,.47,0,.21,.78,.23,w.m.jean,lg);B(sx*.12,.04,.04,.21,.08,.3,w.m.sneaker,lg)}
      B(0,.88,0,.585,.06,.325,w.m.belt,up);B(0,.88,.165,.07,.05,.01,w.m.buckle,up)}
    // ---- áo dài: cổ đứng, tay dài ôm, thân ôm eo, tà trước và tà sau xẻ hông, quần lụa trắng ống rộng ----
    {const up=mk(),lg=mk();w.bk.aodai={up,lg};
      B(0,1.585,0,.15,.14,.15,w.m.skin,up);
      const col=new THREE.Mesh(new THREE.CylinderGeometry(.095,.1,.13,20,1,true),w.m.ad);col.position.y=1.6;up.add(col);
      const torso=new THREE.Mesh(lathe([[0,.86],[.23,.86],[.2,1.0],[.24,1.22],[.27,1.38],[.25,1.5],[.12,1.55],[0,1.55]],24),w.m.ad);torso.scale.z=.62;up.add(torso);
      // đường xẻ cúc chéo từ cổ sang nách phải
      const seam=B(.11,1.47,.156,.2,.016,.01,w.m.gold,up);seam.rotation.z=-.45;
      for(const sx of [-1,1]){const a=B(sx*.33,1.2,0,.12,.62,.15,w.m.ad,up);a.rotation.z=sx*.06;B(sx*.345,.85,0,.1,.09,.11,w.m.skin,up)}
      // hai tà: hình thang, hơi bay nhẹ ra sau
      const panel=(z,tilt)=>{const s=new THREE.Shape();s.moveTo(-.21,0);s.lineTo(.21,0);s.lineTo(.25,-.74);s.quadraticCurveTo(0,-.78,-.25,-.74);s.closePath();const p=new THREE.Mesh(new THREE.ShapeGeometry(s,8),w.m.ad);p.position.set(0,.88,z);p.rotation.x=tilt;lg.add(p);return p};
      panel(.125,-.06);const back=panel(-.125,.1);back.rotation.y=Math.PI;
      for(const sx of [-1,1]){const pl=new THREE.Mesh(lathe([[0,.05],[.165,.05],[.15,.4],[.12,.86],[0,.86]],16),w.m.silk);pl.position.x=sx*.11;lg.add(pl);B(sx*.11,.03,.03,.14,.05,.24,w.m.sneaker,lg)}}
    // phụ kiện trên đầu
    w.hat=new THREE.Group();{const brim=new THREE.Mesh(new THREE.CylinderGeometry(.48,.5,.02,32),w.m.straw);brim.position.y=.13;const crown=new THREE.Mesh(new THREE.SphereGeometry(.22,20,10,0,Math.PI*2,0,Math.PI/2),w.m.straw);crown.scale.y=.85;crown.position.y=.13;const band=new THREE.Mesh(new THREE.CylinderGeometry(.222,.222,.05,24),w.m.band);band.position.y=.165;w.hat.add(brim,crown,band)}head.add(w.hat);
    w.glasses=new THREE.Group();{for(const sx of [-.085,.085]){const l=new THREE.Mesh(new THREE.CylinderGeometry(.055,.055,.02,16),w.m.lens);l.rotation.x=Math.PI/2;l.position.set(sx,.03,.236);w.glasses.add(l)}const br=new THREE.Mesh(new THREE.BoxGeometry(.06,.012,.015),w.m.lens);br.position.set(0,.04,.24);w.glasses.add(br)}head.add(w.glasses);
    w.scarf=new THREE.Group();{const ring=new THREE.Mesh(new THREE.TorusGeometry(.19,.06,8,22),w.m.scarf);ring.rotation.x=Math.PI/2;ring.position.y=-.27;const t1=new THREE.Mesh(new THREE.BoxGeometry(.11,.34,.04),w.m.scarf);t1.position.set(.09,-.46,.19);t1.rotation.z=.12;const t2=t1.clone();t2.position.set(.15,-.42,.17);t2.rotation.z=.32;w.scarf.add(ring,t1,t2)}head.add(w.scarf);
    for(const a of [w.hat,w.glasses,w.scarf])a.visible=false;
    return w;
  }
  const bw=makeSeaWear(me,meHead);
  bayBaseStyle=(o=bayOutfit)=>SEA_STYLES[o.style]?'casual':o.style;
  // Mặc bộ đồ (gọi sau dressAvatar). active=false thì tháo hết (rời vịnh).
  function wearSea(w,parts,torso,o,sitting,active){
    const st=active&&SEA_STYLES[o.style],c=o.color;w.group.visible=!!st&&(!sitting||!!st.block);
    w.legs.visible=false;w.tee.visible=false;w.suit.visible=false;w.gown.visible=false;w.maxi.visible=st?.dress==='maxi'&&!sitting;
    for(const [k,b] of Object.entries(w.bk)){const on=st?.block===k;b.up.visible=on;b.lg.visible=on&&!sitting;b.up.position.y=sitting?-.79:0}
    torso.visible=!st?.block;if(w.head){const k=st?.block?1.14:1;w.head.scale.setScalar(k)}
    if(st){parts.robe.visible=false;parts.vest.visible=false;parts.sash.visible=false;
      const legC=st.block==='tee'?'#2c3a52':st.block==='suit'?c:st.block==='aodai'?c:c;
      w.m.legs.color.set(legC);w.m.top.color.set(c);w.m.trim.color.set('#ffffff');w.m.pants.color.set(c);w.m.ad.color.set(c);w.m.lapel.color.set(shade(c,.78));if(w.m.satin)w.m.satin.color.set(shade(c,.62));w.m.dress.color.set(c);w.m.gown.color.set(c);
      torso.material.color.set(c);
      w.m.scarf.color.set(st.dress==='maxi'?'#fbf6ec':(c==='#f0e5d4'?'#e8a1b4':'#f0e5d4'));w.m.tie.color.set('#1f2430');
      // ngồi thiền: chân xếp mang màu quần hoặc màu váy; áo vest vẫn mặc
      if(sitting&&parts.legMat)parts.legMat.color.set(legC);
      // đứng: thân áo ngắn lại thành phần trên (eo ~0,8) để lộ quần hoặc chân váy; ngồi: áo vest thành màu thân
      if(!sitting&&st.dress){torso.scale.y=.62;torso.position.y=1.26;torso.scale.x=.78;torso.scale.z=.74}
}
    if(!st)torso.visible=true;
    const acc=active?o.acc:[];w.hat.visible=acc.includes('hat');w.glasses.visible=acc.includes('glasses');w.scarf.visible=acc.includes('scarf');
  }
  function bayDress(sitting){wearSea(bw,meOutfit,meTorso,bayOutfit,sitting,bayMode)}
  window.__anyenPhoto=()=>openPhoto();/* nút 📸 trên thanh công cụ: Đảo Yên và Rừng Yên */
  window.__forestPhotoCam=dt=>{const PC=bayPhoto&&bayPhoto.cam;if(!PC)return;if(bayPhoto.hold&&!bayPhoto.shooting)camStep(PC,bayPhoto.hold[0],bayPhoto.hold[1]*dt);camera.rotateOnWorldAxis(bayUpY,PC.yaw);camera.rotateX(PC.pitch);const fv=(bayPhoto.base?.fov||camera.fov)/PC.zoom;if(Math.abs(camera.fov-fv)>.01){camera.fov=fv;camera.updateProjectionMatrix()}};
  window.__shellMesh=(s,t)=>shMesh(s,t,false);window.__binMesh=k=>buildBin(k).g;
  window.__bayWear={make:makeSeaWear,wear:wearSea,outfit:()=>bayOutfit,base:()=>bayBaseStyle()};/* phòng trong nhà trên Đảo Yên mặc cùng bộ đồ đi biển */
  // Xem trước trong bảng trang phục: một người đứng, một người ngồi thiền trên tọa cụ, xoay nhẹ.
  let bayPrev=null;
  function bayPreview(open){
    const cv=document.getElementById('bayPreview');if(!open||!cv){if(bayPrev)bayPrev.running=false;return}
    if(!bayPrev||bayPrev.cv!==cv){try{if(bayPrev){bayPrev.r.dispose();try{bayPrev.r.forceContextLoss()}catch(e){}}const W=272,H=170;const r=new THREE.WebGLRenderer({canvas:cv,antialias:true,alpha:true});r.setPixelRatio(Math.min(devicePixelRatio||1,2));r.setSize(W,H,false);r.outputColorSpace=THREE.SRGBColorSpace;
      const sc=new THREE.Scene();sc.add(new THREE.HemisphereLight('#fff4e6','#2f5a50',2.1));const s=new THREE.DirectionalLight('#fff0dc',1.7);s.position.set(1.5,4,4);sc.add(s);const rim=new THREE.DirectionalLight('#cfe8e0',.9);rim.position.set(-3,2,-3);sc.add(rim);r.toneMapping=THREE.ACESFilmicToneMapping;
      const cam=new THREE.PerspectiveCamera(30,W/H,.1,30);cam.position.set(0,1.8,6.4);cam.lookAt(0,.82,0);
      const fig=(sitting,x)=>{const g=new THREE.Group();const torso=new THREE.Mesh(new THREE.CapsuleGeometry(.34,.8,4,8),mat('#687b48'));g.add(torso);const head=new THREE.Mesh(new THREE.SphereGeometry(.25,16,12),mat('#e7c9a8'));g.add(head);const tag=new THREE.Object3D();poseAvatar(torso,head,tag,sitting);const parts=outfitParts(g,torso);const w=makeSeaWear(g,head);const holder=new THREE.Group();holder.position.x=x;holder.add(g);sc.add(holder);return{holder,g,torso,head,tag,parts,w,sitting}};
      const stand=fig(false,-.95),sit=fig(true,.95);
      const deck=new THREE.Mesh(new THREE.CylinderGeometry(.62,.66,.08,48),mat('#5d7a52'));deck.position.set(-.95,-.04,0);sc.add(deck);
      const seat=buildCushion('zabuton');seat.rotation.y=Math.PI;sit.g.position.set(0,seat.userData.sitTop,-seat.userData.sitBack);sit.holder.add(seat);
      bayPrev={cv,r,sc,cam,figs:[stand,sit],running:false}}catch(err){console.warn('Bay outfit preview unavailable',err);return}}
    for(const f of bayPrev.figs){poseAvatar(f.torso,f.head,f.tag,f.sitting);dressAvatar(f.parts,f.torso,bayOutfit.color,bayBaseStyle(),f.sitting);wearSea(f.w,f.parts,f.torso,bayOutfit,f.sitting,true)}
    if(!bayPrev.running){bayPrev.running=true;const t0=performance.now(),spin=()=>{if(!bayPrev||!bayPrev.running)return;const a=Math.sin((performance.now()-t0)/1400)*.75;for(const f of bayPrev.figs)f.holder.rotation.y=a;bayPrev.r.render(bayPrev.sc,bayPrev.cam);requestAnimationFrame(spin)};spin()}
  }
  // Bảng "Lên Du thuyền Yên": chọn trang phục, nhân vật đổi ngay ở mũi tàu, camera quay ra trước mặt.
  const bayOutfitBox=document.createElement('div');bayOutfitBox.id='bayOutfit';bayOutfitBox.setAttribute('role','dialog');bayOutfitBox.setAttribute('aria-label','Trang phục đi biển');
  document.body.appendChild(bayOutfitBox);
  const outfitData=()=>bayData?.map?.outfits||{styles:BAY_STYLE_IDS.map(id=>({id,label:id})),accessories:[{id:'hat',label:'Nón'},{id:'glasses',label:'Kính'},{id:'scarf',label:'Khăn'}],colors:null};
  function renderOutfit(){
    const d=outfitData(),pal=Array.isArray(d.colors)?d.colors:[['Vàng','#d9b67d'],['Xanh','#90b7a5'],['Kem','#f0e5d4'],['Tím','#b5a1c7'],['Rêu','#687b48'],['Hồng','#e8a1b4']];
    if(!pal.some(c=>c[1]===bayOutfit.color)&&pal[0])bayOutfit.color=pal[0][1];
    const chip=(attr,val,label,on)=>'<button type="button" class="bo-chip" data-'+attr+'="'+val+'" aria-pressed="'+on+'">'+label+'</button>';
    const typed=bayOutfitBox.querySelector('#bayName')?.value;let name='';try{name=JSON.parse(localStorage.getItem('yenGuestProfile17')||'{}').name||''}catch(e){}
    const keep=document.getElementById('bayPreview');if(keep)keep.remove();
    bayOutfitBox.innerHTML='<div class="bay-map-head"><b>⛵ Lên Du thuyền Yên</b><button type="button" data-bo="later">Để sau</button></div>'+
      '<p class="bay-map-note">Trang phục này chỉ dùng ở Vịnh Yên, rừng thông vẫn giữ trang phục cũ.</p>'+
      '<div class="bo-preview"></div><label class="bo-label" for="bayName">Tên hoặc nickname</label><input id="bayName" maxlength="24" placeholder="Ví dụ: Người ngắm vịnh">'+
      '<div class="bo-label">Kiểu trang phục</div><div class="bo-row">'+d.styles.map(s=>chip('style',s.id,s.label,s.id===bayOutfit.style)).join('')+'</div>'+
      '<div class="bo-label">Màu sắc</div><div class="bo-row">'+pal.map(([n,c])=>chip('color',c,'<i style="background:'+c+'"></i>'+n,c===bayOutfit.color)).join('')+'</div>'+
      '<div class="bo-label">Phụ kiện (chọn nhiều)</div><div class="bo-row">'+d.accessories.map(a=>'<button type="button" class="bo-chip bo-check" role="checkbox" data-acc="'+a.id+'" aria-checked="'+bayOutfit.acc.includes(a.id)+'" aria-pressed="'+bayOutfit.acc.includes(a.id)+'"><b>'+(bayOutfit.acc.includes(a.id)?'✓':'')+'</b>'+a.label+'</button>').join('')+'</div>'+
      '<div class="row"><button type="button" class="cta" data-bo="save">⛵ Lên tàu</button></div>';
    const slot=bayOutfitBox.querySelector('.bo-preview');let cv=keep;if(!cv){cv=document.createElement('canvas');cv.id='bayPreview';cv.width=544;cv.height=340;cv.setAttribute('aria-label','Xem trước trang phục: dáng đứng và dáng ngồi thiền')}slot.appendChild(cv);slot.insertAdjacentHTML('beforeend','<div class="preview-caption" aria-hidden="true"><span>Đứng</span><span>Ngồi thiền</span></div>');bayPreview(true);
    const inp=bayOutfitBox.querySelector('#bayName');inp.value=typed!=null?typed:(name==='Khách Yên'?'':name);
  }
  function openBayOutfit(){if(!bayMode)return;bayOutfitOpen=true;renderOutfit();bayOutfitBox.classList.add('open');document.body.classList.add('bay-outfit-open');closeSheet();closeMapBox()}
  function closeBayOutfit(save){
    if(save){bayOutfitSaved={...bayOutfit,acc:[...bayOutfit.acc]};try{localStorage.setItem(BAY_OUTFIT_KEY,JSON.stringify(bayOutfit))}catch(e){}
      const nm=(bayOutfitBox.querySelector('#bayName')?.value||'').trim().replace(/[<>]/g,'').slice(0,24);
      if(nm){try{if(typeof guestProfile==='object'&&guestProfile){guestProfile.name=nm;localStorage.setItem('yenGuestProfile17',JSON.stringify(guestProfile));if(typeof refreshGuest==='function')refreshGuest()}else{const p=JSON.parse(localStorage.getItem('yenGuestProfile17')||'{}');p.name=nm;localStorage.setItem('yenGuestProfile17',JSON.stringify(p))}}catch(e){}window.dispatchEvent(new CustomEvent('yen-profile'))}
      bayCaption('⛵ Chào '+(nm||'bạn')+' · Chúc chuyến đi biển an yên',4500)}
    else if(bayOutfitSaved)bayOutfit={...bayOutfitSaved,acc:[...bayOutfitSaved.acc]};
    try{localStorage.setItem(BAY_OUTFIT_SEEN,'1')}catch(e){}
    bayOutfitOpen=false;bayPreview(false);bayOutfitBox.classList.remove('open');document.body.classList.remove('bay-outfit-open');
  }
  bayOutfitBox.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
    if(b.dataset.style){bayOutfit.style=b.dataset.style;renderOutfit()}else if(b.dataset.acc){const a=b.dataset.acc;bayOutfit.acc=bayOutfit.acc.includes(a)?bayOutfit.acc.filter(x=>x!==a):[...bayOutfit.acc,a];renderOutfit()}else if(b.dataset.color){bayOutfit.color=b.dataset.color;renderOutfit()}
    else if(b.dataset.bo==='save')closeBayOutfit(true);else if(b.dataset.bo==='later')closeBayOutfit(false)});
  window.addEventListener('anyen-bay-outfit',openBayOutfit);
  // ---- Chụp ảnh: nhân vật quay lưng về phía biển nhìn vào máy, chọn dáng, đếm ngược rồi chụp ----
  const PHOTO_POSES=[{id:'front',label:'Nhìn thẳng',yaw:0,lean:0,tilt:0},{id:'scene',label:'Ngắm vịnh',yaw:.75,lean:0,tilt:-.18},{id:'soft',label:'Nghiêng đầu',yaw:-.25,lean:.05,tilt:.22},{id:'side',label:'Dáng nghiêng',yaw:-.9,lean:-.03,tilt:-.1}];
  bayPhoto=null;// {pose, side, shooting}
  const photoBox=document.createElement('div');photoBox.id='bayPhoto';photoBox.setAttribute('role','dialog');photoBox.setAttribute('aria-label','Chụp ảnh');
  document.body.appendChild(photoBox);
  const photoFlash=document.createElement('div');photoFlash.id='bayFlash';document.body.appendChild(photoFlash);
  // Cỡ ảnh theo nơi đăng (w×h là ảnh xuất ra) và khung trang trí
  const PHOTO_FMT=[
    {id:'screen',label:'Như màn hình',w:0,h:0},
    {id:'fb_post',label:'FB bài dọc 4:5',w:1080,h:1350},
    {id:'fb_land',label:'FB bài ngang',w:1200,h:630},
    {id:'fb_cover',label:'Ảnh bìa FB',w:1702,h:630},
    {id:'story',label:'Story FB · Zalo 9:16',w:1080,h:1920},
    {id:'avatar',label:'Avatar tròn',w:1080,h:1080,round:true},
    {id:'square',label:'Vuông 1:1',w:1080,h:1080}];
  const PHOTO_FRAME=[{id:'none',label:'Không khung'},{id:'white',label:'Viền trắng'},{id:'polaroid',label:'Polaroid'},{id:'gold',label:'Viền vàng'},{id:'film',label:'Phim'}];
  let photoFmt='screen',photoFrame='none',photoTag=true;try{const s=JSON.parse(localStorage.getItem('yen_bay_photo_fmt')||'{}');if(PHOTO_FMT.some(f=>f.id===s.fmt))photoFmt=s.fmt;if(PHOTO_FRAME.some(f=>f.id===s.frame))photoFrame=s.frame;if(typeof s.tag==='boolean')photoTag=s.tag}catch(e){}
  const savePhotoOpts=()=>{try{localStorage.setItem('yen_bay_photo_fmt',JSON.stringify({fmt:photoFmt,frame:photoFrame,tag:photoTag}))}catch(e){}};
  const fmtById=id=>PHOTO_FMT.find(f=>f.id===id)||PHOTO_FMT[0];
  // Khung xem trước: vùng ảnh sẽ chụp (khớp cách dựng ảnh trong capture)
  function placePhotoCrop(){const box=photoBox.querySelector('.bp-crop');if(!box)return;const F=fmtById(photoFmt),W=innerWidth,Hh=innerHeight;
    box.classList.remove('f-white','f-gold','f-polaroid','f-film');if(photoFrame!=='none')box.classList.add('f-'+photoFrame);if(!F.w&&photoFrame==='none'){box.hidden=true;return}box.hidden=false;const T=F.w?F.w/F.h:W/Hh,A=W/Hh;let bw,bh;if(T<A){bh=Hh;bw=Hh*T}else{bw=W;bh=W/T}
    box.style.width=bw+'px';box.style.height=bh+'px';box.style.left=(W-bw)/2+'px';box.style.top=(Hh-bh)/2+'px';box.classList.toggle('round',!!F.round);
    box.querySelector('b').textContent=F.label+(F.w?' · '+F.w+'×'+F.h:'')}
  addEventListener('resize',()=>{if(bayPhoto&&!bayPhoto.shooting)placePhotoCrop()});
  function renderPhotoBar(){
    const cb=(k,ic,t)=>'<button type="button" class="bp-cb" data-cam="'+k+'" title="'+t+'" aria-label="'+t+'">'+ic+'</button>';
    const chip=(attr,id,label,on)=>'<button type="button" class="bo-chip" '+attr+'="'+id+'" aria-pressed="'+on+'">'+label+'</button>';
    const pi=PHOTO_POSES.indexOf(bayPhoto.pose);
    photoBox.innerHTML='<div class="bp-touch" aria-hidden="true"></div><div class="bp-crop" hidden><b></b></div><div class="bp-count" id="bpCount" aria-live="assertive"></div><div class="bp-col" role="toolbar" aria-label="Điều khiển chụp ảnh">'+
      '<button type="button" class="bp-shutter" data-bp="shoot" aria-label="Chụp ngay">📷</button>'+cb('zin','🔍＋','Zoom gần (phóng to)')+cb('zout','🔍－','Zoom xa (thu nhỏ)')+cb('u','▲','Hướng camera lên')+cb('d','▼','Hướng camera xuống')+cb('l','◀','Hướng camera sang trái')+cb('r','▶','Hướng camera sang phải')+
      '<button type="button" class="bp-cb" data-bp="pose" title="Đổi dáng: '+bayPhoto.pose.label+'" aria-label="Đổi dáng, đang là '+bayPhoto.pose.label+'">🧍<small>'+(pi+1)+'/'+PHOTO_POSES.length+'</small></button>'+
      '<button type="button" class="bp-cb" data-bp="fmtn" title="Cỡ ảnh: '+fmtById(photoFmt).label+'" aria-label="Đổi cỡ ảnh">📐<small class="bp-lab">'+fmtById(photoFmt).label.split(' ')[0]+'</small></button><button type="button" class="bp-cb" data-bp="framen" title="Khung: '+(PHOTO_FRAME.find(f=>f.id===photoFrame)||PHOTO_FRAME[0]).label+'" aria-label="Đổi khung ảnh">🖼<small class="bp-lab">'+(PHOTO_FRAME.find(f=>f.id===photoFrame)||PHOTO_FRAME[0]).label.replace('Không khung','Không').replace('Viền ','')+'</small></button>'+
      '<button type="button" class="bp-cb" data-bp="flip" title="Đổi bên" aria-label="Đổi bên">↔</button><button type="button" class="bp-cb" data-bp="reset" title="Đặt lại camera" aria-label="Đặt lại camera">↺</button><button type="button" class="bp-cb bp-x" data-bp="cancel" title="Thoát chụp ảnh" aria-label="Thoát chụp ảnh">✕</button></div><div class="bp-bar" hidden><div class="bp-cam">'+
      cb('zin','🔍＋','Zoom gần')+cb('zout','🔍－','Zoom xa')+'<i></i>'+cb('l','◀','Camera sang trái')+cb('u','▲','Camera lên cao')+cb('d','▼','Camera xuống thấp')+cb('r','▶','Camera sang phải')+'<i></i>'+cb('ol','⟲','Xoay vòng quanh sang trái')+cb('or','⟳','Xoay vòng quanh sang phải')+'<button type="button" class="bp-cb bp-reset" data-bp="reset" title="Đặt lại camera" aria-label="Đặt lại camera">↺</button></div><p class="bp-tip">Kéo màn hình để xoay quanh · chụm 2 ngón hoặc lăn chuột để zoom</p><div class="bo-row">'+PHOTO_POSES.map(p=>'<button type="button" class="bo-chip" data-pose="'+p.id+'" aria-pressed="'+(bayPhoto.pose.id===p.id)+'">'+p.label+'</button>').join('')+
      '<button type="button" class="bo-chip" data-bp="flip" title="Đổi góc chụp">↔ Đổi góc</button></div><div class="bp-actions"><button type="button" class="chip" data-bp="cancel">✕ Hủy</button><button type="button" class="bp-shutter" data-bp="shoot" aria-label="Chụp">📷</button><span></span></div></div>';
    bindPhotoCam();placePhotoCrop();
  }
  // Camera chụp ảnh: orb = xoay quanh người, zoom = gần/xa, h = cao/thấp, px = trái/phải
  // Không cho camera chui vào cột, cabin, thân tàu: bắn tia từ người ra camera, gặp khối lớn thì kéo camera vào trước khối đó.
  let photoBlockers=null;const photoRay=new THREE.Raycaster(),photoDir=new THREE.Vector3(),photoFrom=new THREE.Vector3();
  function shipBlockers(){photoAvoid(null);return photoBlockers}
  function photoAvoid(cam,at){
    if(!photoBlockers){photoBlockers=[];const sp=new THREE.Sphere(),sc=new THREE.Vector3();bayShip.group.updateMatrixWorld(true);bayShip.group.traverse(o=>{if(!o.isMesh||!o.geometry)return;o.geometry.computeBoundingSphere?.();if(!o.geometry.boundingSphere)return;sp.copy(o.geometry.boundingSphere);o.getWorldScale(sc);const r=sp.radius*Math.max(sc.x,sc.y,sc.z),bx=o.geometry.boundingBox||(o.geometry.computeBoundingBox(),o.geometry.boundingBox),sz=new THREE.Vector3();bx.getSize(sz).multiply(sc);const thin=[sz.x,sz.y,sz.z].sort((a,b)=>a-b);
      if(r>1.2&&thin[1]>.35)photoBlockers.push(o)})}
    if(!cam)return;
    photoFrom.set(at.x,at.y+1.1,at.z);photoDir.subVectors(cam,photoFrom);const L=photoDir.length();if(L<.5)return;photoDir.divideScalar(L);
    photoRay.set(photoFrom,photoDir);photoRay.far=L;const hit=photoRay.intersectObjects(photoBlockers,false)[0];
    if(hit&&hit.distance>.3)cam.copy(photoFrom).addScaledVector(photoDir,Math.max(.6,hit.distance-.35));
  }
  const camClamp=(v,a,b)=>Math.max(a,Math.min(b,v)),CAM0={zoom:1,yaw:0,pitch:0};
  const CAM_RATE={zin:['zoom',.9],zout:['zoom',-.9],l:['yaw',.55],r:['yaw',-.55],u:['pitch',.4],d:['pitch',-.4]};
  // Zoom khi chụp ảnh giống lúc bình thường: thu nhỏ = camera lùi xa, lên cao (xa hết cỡ → ngắm tàu từ xa);
  // phóng to = lại gần; đã gần hết cỡ mà vẫn phóng to thì zoom ống kính (tele) tới 4×.
  function photoZoom(f){const C=bayPhoto&&bayPhoto.cam;if(!C)return;if(!bayMode){C.zoom=Math.max(1,Math.min(4,C.zoom/f));return}/* rừng: zoom ống kính */
    if(f>1){if(C.zoom>1.001)C.zoom=Math.max(1,C.zoom/f);else bayZoomBy(f,true)}
    else{if(bayView==='far'||bayZoom>BZ_MIN+1e-3)bayZoomBy(f,true);else C.zoom=Math.min(4,C.zoom/f)}}
  function camStep(C,k,v){if(k==='zoom')photoZoom(Math.exp(-v));else if(k==='pitch')C.pitch=camClamp(C.pitch+v,-.7,.7);else if(k==='yaw')C.yaw=camClamp(C.yaw+v,-1.4,1.4)}
  function bindPhotoCam(){
    for(const b of photoBox.querySelectorAll('[data-cam]')){
      b.addEventListener('pointerdown',e=>{if(!bayPhoto||bayPhoto.shooting)return;e.preventDefault();bayPhoto.hold=CAM_RATE[b.dataset.cam];try{b.setPointerCapture(e.pointerId)}catch(_){}});
      for(const ev of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(ev,()=>{if(bayPhoto)bayPhoto.hold=null})}
    const el=photoBox.querySelector('.bp-touch'),pts=new Map();let pinch0=0,zoom0=1;
    el.addEventListener('pointerdown',e=>{if(!bayPhoto||bayPhoto.shooting)return;try{el.setPointerCapture(e.pointerId)}catch(_){}pts.set(e.pointerId,{x:e.clientX,y:e.clientY});
      if(pts.size===2){const [p,q]=[...pts.values()];pinch0=Math.hypot(p.x-q.x,p.y-q.y);el._a=Math.atan2(q.y-p.y,q.x-p.x);el._g={mode:null,s:0,a:0}}});
    el.addEventListener('pointermove',e=>{const p=pts.get(e.pointerId);if(!p||!bayPhoto||bayPhoto.shooting)return;const C=bayPhoto.cam;
      if(pts.size===1){const f=(camera.fov/57);C.yaw=camClamp(C.yaw+(e.clientX-p.x)/Math.max(320,innerWidth)*1.6*f,-1.4,1.4);C.pitch=camClamp(C.pitch+(e.clientY-p.y)/Math.max(320,innerHeight)*1.2*f,-.7,.7)}
      p.x=e.clientX;p.y=e.clientY;
      if(pts.size===2&&pinch0>0){const [a,c]=[...pts.values()],d=Math.max(20,Math.hypot(a.x-c.x,a.y-c.y)),an=Math.atan2(c.y-a.y,c.x-a.x),G=el._g||(el._g={mode:null,s:0,a:0});let da=an-(el._a??an);da=Math.atan2(Math.sin(da),Math.cos(da));el._a=an;const f=pinch0/d;pinch0=d;
        if(!G.mode){G.s+=Math.log(f);G.a+=da;if(Math.abs(G.a)>.14)G.mode='rot';else if(Math.abs(G.s)>.08)G.mode='zoom';else return}if(G.mode==='rot')viewYaw-=da;else photoZoom(f)}});/* hai ngón: xoay = camera quay vòng quanh người, chụm = zoom */
    for(const ev of ['pointerup','pointercancel'])el.addEventListener(ev,e=>{pts.delete(e.pointerId);if(pts.size<2)pinch0=0});
    el.addEventListener('wheel',e=>{if(!bayPhoto||bayPhoto.shooting)return;e.preventDefault();photoZoom(Math.exp(e.deltaY*.0012))},{passive:false});
  }
  function openPhoto(){const forest=!bayMode;if(forest&&(!document.body.classList.contains('immersive')||roomOpen))return;if(!forest&&!bayBuilt)return;if(!forest){closeSheet();closeMapBox();if(bayOutfitOpen)closeBayOutfit(false)}
    if(forest){bayPhoto={pose:PHOTO_POSES[0],side:1,shooting:false,cam:{...CAM0},hold:null,autoPaused:false,base:{fov:camera.fov},forest:true};meTag.visible=false;renderPhotoBar();photoBox.classList.add('open','forest');document.body.classList.add('bay-photo-open');const h=document.getElementById('zenHint');if(h)h.textContent='📷 Vuốt hoặc dùng cột bên phải để chỉnh góc rồi bấm chụp';return}
    photoBox.classList.remove('forest');bayShip.group.updateMatrixWorld(true);const base={fov:camera.fov,lp:bayShip.group.worldToLocal(camera.position.clone()),ld:camera.getWorldDirection(new THREE.Vector3()).applyQuaternion(bayShip.group.getWorldQuaternion(new THREE.Quaternion()).invert())};
    const autoPaused=!bayPause&&(bayShip.path.length>0||(typeof bayTour!=='undefined'&&!!bayTour));if(autoPaused){const vy=viewYaw;pauseShip();viewYaw=vy}
    bayPhoto={pose:PHOTO_POSES[0],side:1,shooting:false,cam:{...CAM0},hold:null,autoPaused,base};meTag.visible=false;renderPhotoBar();photoBox.classList.add('open');document.body.classList.add('bay-photo-open');
    bayCaption('📷 Chỉnh góc ở cột bên phải rồi bấm chụp'+(autoPaused?' · tàu tạm dừng':''),3000)}
  function closePhoto(){if(!bayPhoto)return;clearInterval(photoTick);document.getElementById('bpCount')?.classList.remove('show');const ap=bayPhoto.autoPaused,fv=bayPhoto.base?.fov;bayPhoto=null;if(fv&&camera.fov!==fv){camera.fov=fv;camera.updateProjectionMatrix()}if(ap&&bayPause)resumeShip();photoBox.classList.remove('open','forest');document.body.classList.remove('bay-photo-open');meTag.visible=true;meHead.rotation.set(0,0,0);me.rotation.z=0}
  photoBox.addEventListener('click',e=>{const b=e.target.closest('button');if(!b||!bayPhoto||bayPhoto.shooting)return;
    if(b.dataset.pose){bayPhoto.pose=PHOTO_POSES.find(p=>p.id===b.dataset.pose)||PHOTO_POSES[0];renderPhotoBar()}
    else if(b.dataset.fmt){photoFmt=b.dataset.fmt;if(photoFmt==='avatar'&&photoFrame==='polaroid')photoFrame='none';savePhotoOpts();renderPhotoBar()}
    else if(b.dataset.frame){photoFrame=b.dataset.frame;savePhotoOpts();renderPhotoBar()}
    else if(b.dataset.tag){photoTag=!photoTag;savePhotoOpts();renderPhotoBar()}
    else if(b.dataset.bp==='fmtn'){const i=(PHOTO_FMT.findIndex(f=>f.id===photoFmt)+1)%PHOTO_FMT.length;photoFmt=PHOTO_FMT[i].id;if(photoFmt==='avatar'&&photoFrame==='polaroid')photoFrame='none';savePhotoOpts();renderPhotoBar();bayCaption('📐 Cỡ ảnh: '+PHOTO_FMT[i].label,1800)}
    else if(b.dataset.bp==='framen'){const i=(PHOTO_FRAME.findIndex(f=>f.id===photoFrame)+1)%PHOTO_FRAME.length;photoFrame=PHOTO_FRAME[i].id;savePhotoOpts();renderPhotoBar();bayCaption('🖼 Khung: '+PHOTO_FRAME[i].label,1800)}
    else if(b.dataset.bp==='flip'){bayPhoto.side*=-1}
    else if(b.dataset.bp==='pose'){const i=(PHOTO_POSES.indexOf(bayPhoto.pose)+1)%PHOTO_POSES.length;bayPhoto.pose=PHOTO_POSES[i];renderPhotoBar();bayCaption('🧍 Dáng: '+bayPhoto.pose.label,1600)}
    else if(b.dataset.bp==='reset'){bayPhoto.cam={...CAM0}}
    else if(b.dataset.bp==='cancel')closePhoto();
    else if(b.dataset.bp==='shoot')shootPhoto()});
  let photoTick=0;
  function shootPhoto(){
    bayPhoto.shooting=true;clearInterval(photoTick);capture();
  }
  function capture(){
    if(!bayPhoto)return;meTag.visible=false;if(bayMode){updateBay(0);camera.position.copy(bayCam);camera.lookAt(bayLook)}
    const F=fmtById(photoFmt);let shot;
    if(F.w){// dựng ảnh ở đúng kích thước: giữ góc nhìn dọc nếu ảnh hẹp hơn màn hình, thu góc nhìn dọc nếu ảnh rộng hơn (khớp khung xem trước)
      const sz=renderer.getSize(new THREE.Vector2()),pr=renderer.getPixelRatio(),fov0=camera.fov,asp0=camera.aspect,T=F.w/F.h,A=sz.x/sz.y;
      try{camera.aspect=T;if(T>A)camera.fov=2*Math.atan(Math.tan(fov0*Math.PI/360)*A/T)*180/Math.PI;camera.updateProjectionMatrix();renderer.setPixelRatio(1);renderer.setSize(F.w,F.h,false);
        renderer.render(scene,camera);shot=renderer.domElement.toDataURL('image/png')}catch(e){shot=null}
      renderer.setPixelRatio(pr);renderer.setSize(sz.x,sz.y,false);camera.fov=fov0;camera.aspect=asp0;camera.updateProjectionMatrix()}
    else{renderer.render(scene,camera);try{shot=renderer.domElement.toDataURL('image/png')}catch(e){shot=null}}
    photoFlash.classList.remove('go');void photoFlash.offsetWidth;photoFlash.classList.add('go');
    if(!shot){bayCaption('Chưa chụp được ảnh trên thiết bị này');bayPhoto.shooting=false;return}
    const img=new Image();img.onload=()=>{
      const W=img.width,H=img.height,S0=Math.max(1,Math.min(W,H)/700),fr=photoFrame,round=!!F.round;
      // lề khung: trái, trên, phải, dưới
      const m=round?[0,0,0,0]:fr==='white'?[.035,.035,.035,.035]:fr==='polaroid'?[.045,.045,.045,.16]:fr==='film'?[.02,.075,.02,.075]:fr==='gold'?[.028,.028,.028,.028]:[0,0,0,0];
      const base=Math.min(W,H),ml=Math.round(base*m[0]),mt=Math.round(base*m[1]),mr=Math.round(base*m[2]),mb=Math.round(base*m[3]);
      // ảnh trong khung thu nhỏ để tổng kích thước vẫn đúng cỡ đã chọn
      const out=document.createElement('canvas');out.width=W;out.height=H;const g=out.getContext('2d');
      const iw=W-ml-mr,ih=H-mt-mb,sc=Math.max(iw/W,ih/H),dw=W*sc,dh=H*sc;
      g.fillStyle=fr==='film'?'#111':fr==='gold'?'#0d2f29':'#fbf8f1';g.fillRect(0,0,W,H);
      g.save();g.beginPath();g.rect(ml,mt,iw,ih);g.clip();g.drawImage(img,ml+(iw-dw)/2,mt+(ih-dh)/2,dw,dh);g.restore();
      if(fr==='gold'&&!round){g.strokeStyle='#c8a96a';g.lineWidth=3*S0;g.strokeRect(ml-6*S0,mt-6*S0,iw+12*S0,ih+12*S0);g.lineWidth=1.2*S0;g.strokeRect(ml-12*S0,mt-12*S0,iw+24*S0,ih+24*S0)}
      if(fr==='film'&&!round){g.fillStyle='#e9e4d8';const hw=base*.035,hh=base*.035*.62,step=hw*1.9;for(let x=step*.4;x<W;x+=step){g.fillRect(x,mt*.3,hw,hh);g.fillRect(x,H-mt*.3-hh,hw,hh)}}
      const W2=iw,H2=ih,X0=ml,Y0=mt;
      // khung mềm và dòng tên địa danh
      if(!fr||fr==='none'){const vg=g.createRadialGradient(W/2,H/2,Math.min(W,H)*.35,W/2,H/2,Math.max(W,H)*.7);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(10,30,26,.35)');g.fillStyle=vg;g.fillRect(0,0,W,H)}
      const S=Math.max(1,W2/900);let place='Vịnh Hạ Long';if(bayIsland)place='Đảo Yên · Vịnh Yên';else if(!bayMode){const l=(document.getElementById('anyenCurrentLake')?.textContent||'').replace(/^[^\p{L}]+/u,'').trim();place='Rừng Yên'+(l?' · '+l:'')}else try{const st=bayStatus();if(st&&/Ở |Đang ở /.test(st.text)){const nm=st.text.replace(/^Đang ở |^Ở /,'');let rg='halong';for(const p of bayData.props)if(p.kind==='landmark'&&shortName(p.name)===nm)rg=lmRegion(p);place=nm+' · '+(REGION_NAME[rg]||'Vịnh Hạ Long')}}catch(e){}
      const d=new Date(),line=place+' · '+d.toLocaleDateString('vi-VN');g.textBaseline='middle';
      if(fr==='polaroid'){if(photoTag){const cy=Y0+H2+mb/2;g.textAlign='center';g.fillStyle='#4a3b2a';g.font='italic 600 '+Math.round(mb*.26)+'px Georgia, serif';g.fillText('✧ Làng Yên',W/2,cy-mb*.14,W*.9);g.font=Math.round(mb*.17)+'px system-ui, sans-serif';g.fillStyle='#6d5d49';g.fillText(line,W/2,cy+mb*.2,W*.9);g.textAlign='left'}}
      else if(round){if(fr==='film'){g.strokeStyle='#111';g.lineWidth=base*.05;g.beginPath();g.arc(W/2,H/2,base/2-base*.06,0,Math.PI*2);g.stroke()}if(fr==='gold'||fr==='white'){g.strokeStyle=fr==='gold'?'#c8a96a':'#fbf8f1';g.lineWidth=base*.03;g.beginPath();g.arc(W/2,H/2,base/2-base*.05,0,Math.PI*2);g.stroke()}}
      else if(photoTag&&H2/W2<3){const narrow=W2<H2*.9,pad=22*S,bh=(narrow?96:74)*S*(H2/W2<.5?.8:1),by=Y0+H2-bh;g.fillStyle='rgba(9,43,38,.78)';g.fillRect(X0,by,W2,bh);g.fillStyle='#c8a96a';g.fillRect(X0,by,W2,2*S);
        g.fillStyle='#f4e2b9';g.font='600 '+(26*S)+'px Georgia, serif';
        if(narrow){g.fillText('✧ LÀNG YÊN',X0+pad,by+30*S);g.font=(17*S)+'px system-ui, sans-serif';g.fillStyle='#f1e6cf';g.fillText(line,X0+pad,by+66*S,W2-pad*2)}
        else{g.fillText('✧ LÀNG YÊN',X0+pad,by+bh/2);g.font=(18*S)+'px system-ui, sans-serif';g.textAlign='right';g.fillStyle='#f1e6cf';g.fillText(line,X0+W2-pad,by+bh/2);g.textAlign='left'}}
      out.toBlob(blob=>showPhoto(blob,out.toDataURL('image/jpeg',.9)),'image/jpeg',.92)};
    img.src=shot;
  }
  let bayPhotoUrl=null;
  function showPhoto(blob,url){
    const name='lang-yen-vinh-ha-long-'+Date.now()+'.jpg';
    const chip=(attr,id,label,on)=>'<button type="button" class="bo-chip" '+attr+'="'+id+'" aria-pressed="'+on+'">'+label+'</button>';
    photoBox.innerHTML='<div class="bp-result"><img alt="Ảnh vừa chụp ở Vịnh Hạ Long"><div class="bp-opts"><div class="bp-fmt"><span>Cỡ ảnh</span>'+PHOTO_FMT.map(f=>chip('data-fmt',f.id,f.label,f.id===photoFmt)).join('')+'</div><div class="bp-fmt"><span>Khung</span>'+PHOTO_FRAME.map(f=>chip('data-frame',f.id,f.label,f.id===photoFrame)).join('')+chip('data-tag','1','🏷 Địa danh',photoTag)+'</div></div><div class="bp-actions"><button type="button" class="chip" data-bp="again">↺ Chụp lại</button><a class="cta" download="'+name+'">⬇ Tải ảnh</a><button type="button" class="chip" data-bp="share">↗ Chia sẻ</button><button type="button" class="chip" data-bp="done">✕ Xong</button></div><p class="bp-hint" role="status"></p></div>';
    photoBox.querySelector('img').src=url;
    const share=photoBox.querySelector('[data-bp="share"]');const file=blob?new File([blob],name,{type:'image/jpeg'}):null;
    // Tải ảnh: dùng blob URL (data URL lớn hay bị trình duyệt chặn). iPhone và trình duyệt trong Zalo/Facebook: mở bảng chia sẻ để "Lưu hình ảnh".
    {const a=photoBox.querySelector('a.cta'),ua=navigator.userAgent,ios=/iPad|iPhone|iPod/.test(ua)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1),
      inApp=/FBAN|FBAV|FB_IAB|Instagram|Zalo|Line\/|MicroMessenger|TikTok|musical_ly/i.test(ua),canFile=!!(file&&navigator.canShare&&navigator.canShare({files:[file]})),touch=matchMedia('(pointer:coarse)').matches;
      if(bayPhotoUrl)try{URL.revokeObjectURL(bayPhotoUrl)}catch(e){}bayPhotoUrl=blob?URL.createObjectURL(blob):null;a.href=bayPhotoUrl||url;
      const hint=photoBox.querySelector('.bp-hint'),say=t=>{hint.textContent=t;hint.classList.add('on')};
      if(ios)a.textContent='🖼 Lưu vào Album ảnh';else if(inApp)a.textContent='⬇ Lưu vào máy';
      say(inApp?'Bạn đang mở web trong ứng dụng (Zalo/Facebook…), nơi thường không cho tải file: bấm "Lưu vào máy" rồi chọn "Lưu hình ảnh", hoặc chạm giữ vào ảnh.':ios?(canFile?'Bấm "Lưu vào Album ảnh" → chọn "Lưu hình ảnh" (Save Image) là ảnh vào ứng dụng Ảnh.':'Chạm giữ vào ảnh ở trên → chọn "Lưu vào Ảnh" (Save to Photos).'):touch?'Ảnh tải về nằm trong thư mục Download (mở bằng Thư viện ảnh). Cũng có thể chạm giữ vào ảnh để lưu.':'Ảnh tải về nằm trong thư mục Tải xuống (Downloads) của máy.');
      a.onclick=e=>{if((ios||inApp)&&canFile){e.preventDefault();navigator.share({files:[file]}).then(()=>say(ios?'✓ Nếu đã chọn "Lưu hình ảnh", ảnh nằm trong ứng dụng Ảnh › Gần đây.':'✓ Đã mở bảng chia sẻ.')).catch(()=>{});return}
        if(ios){e.preventDefault();const im=photoBox.querySelector('.bp-result img');im.classList.add('bp-pulse');setTimeout(()=>im.classList.remove('bp-pulse'),1600);say('Máy chưa hỗ trợ lưu bằng nút: chạm giữ vào ảnh ở trên → chọn "Lưu vào Ảnh" (Save to Photos).');return}
        if(inApp){e.preventDefault();say('Ứng dụng này chặn tải ảnh: chạm giữ vào ảnh → "Lưu ảnh", hoặc mở anyen.space bằng Safari/Chrome.');return}
        setTimeout(()=>say(ios?'Ảnh đã lưu vào ứng dụng Tệp › Tải về. Muốn ảnh nằm trong ứng dụng Ảnh: chạm giữ vào ảnh → "Lưu vào Ảnh".':touch?'✓ Đã tải: '+name+' · xem trong thư mục Download hoặc Thư viện ảnh.':'✓ Đã tải: '+name+' · trong thư mục Tải xuống (Downloads).'),400)};}
    if(!(file&&navigator.canShare&&navigator.canShare({files:[file]}))||/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1))share.hidden=true;
    share.onclick=()=>navigator.share({files:[file],title:'Làng Yên · Vịnh Hạ Long'}).catch(()=>{});
    photoBox.querySelector('[data-bp="again"]').onclick=()=>{bayPhoto.shooting=false;renderPhotoBar()};
    photoBox.querySelector('.bp-opts').onclick=e=>{const b=e.target.closest('button');if(!b||!bayPhoto)return;
      if(b.dataset.fmt){photoFmt=b.dataset.fmt;if(photoFmt==='avatar'&&photoFrame==='polaroid')photoFrame='none'}else if(b.dataset.frame)photoFrame=b.dataset.frame;else if(b.dataset.tag)photoTag=!photoTag;else return;
      savePhotoOpts();photoBox.querySelector('.bp-result').classList.add('busy');setTimeout(capture,30)};
    photoBox.querySelector('[data-bp="done"]').onclick=closePhoto;
  }
  // ---- Mỗi khung hình ----
  const BAY_WATER={lanha:['#18786a','#3fb594'],btl:['#1f7686','#4fb3b0']};let bayWaterRegion='halong',bayWaterBase=null;const bayTmpC1=new THREE.Color(),bayTmpC2=new THREE.Color();
  const bayUpY=new THREE.Vector3(0,1,0);let bayCamYaw=null;const bayTmpQ=new THREE.Quaternion(),bayTmpD=new THREE.Vector3();
  // Camera tự lên cao khi bị đá, vách, cabin che giữa camera và người (hoặc tàu khi ngắm từ xa): thử các độ cao tăng dần, lấy mức thấp nhất nhìn thông.
  const bayLiftRay=new THREE.Raycaster(),bayLiftA=new THREE.Vector3(),bayLiftB=new THREE.Vector3(),bayLiftD=new THREE.Vector3();
  function bayBlocked(from,to,objs){bayLiftD.subVectors(to,from);const L=bayLiftD.length();if(L<.3)return false;bayLiftD.divideScalar(L);bayLiftRay.set(from,bayLiftD);bayLiftRay.far=L;return bayLiftRay.intersectObjects(objs,false).length>0}
  function bayLiftFor(from,camAt,steps,objs){bayLiftPull=false;for(const h of steps){if(!bayBlocked(from,camAt(h),objs))return h}bayLiftPull=true;return steps[steps.length-1]}
  // đá quá cao, nâng hết mức vẫn bị che: kéo camera vào sát trước vật cản
  function bayPullIn(from,cam,objs){if(!bayLiftPull)return;bayLiftD.subVectors(cam,from);const L=bayLiftD.length();if(L<.5)return;bayLiftD.divideScalar(L);bayLiftRay.set(from,bayLiftD);bayLiftRay.far=L;const hit=bayLiftRay.intersectObjects(objs,false)[0];if(hit)cam.copy(from).addScaledVector(bayLiftD,Math.max(1.2,hit.distance-.8))}
  function bayLiftStep(dt,from,camAt,steps,objs){bayLiftT-=dt;if(bayLiftT<=0){bayLiftT=.15;bayLiftWant=bayLiftFor(from,camAt,steps,objs)}
    bayLift+=(bayLiftWant-bayLift)*Math.min(1,dt*(bayLiftWant>bayLift?3.2:.8));return bayLift}
  bayAvatar={pos:new THREE.Vector3(),yaw:0};bayTmp=new THREE.Vector3(),bayLook=new THREE.Vector3(),bayCam=new THREE.Vector3();let bayLastNear=null,bayMapTimer=0;
  // Tốc độ xoay mũi tàu tối đa (rad/s): chậm, tăng theo tốc độ tàu; không đổi hướng đột ngột.
  function shipTurnCap(S){return S.turn*.4*Math.sqrt(bayMult())*(.35+.65*Math.min(1,S.speed/(S.max*bayMult())))}
  // ---- Lái tàu: MŨI tàu đi trước, bám theo đường đi; tâm tàu luôn đi theo mũi (như rơ-moóc), nên thân tàu xoay dần theo mũi.
  // Mũi nhắm một điểm phía trước trên đường và chỉ xoay với tốc độ giới hạn (từ từ chuyển hướng).
  // Giảm tốc: trước khúc rẽ gắt, khi mũi còn lệch hướng nhiều, khi sắp tới đích, và khi thấy chân đá ngay trên hướng đi trong quãng hãm
  // (không kịp tránh thì đi chậm lại); qua chỗ đó thì tăng tốc dần trở lại.
  const wrapA=a=>Math.atan2(Math.sin(a),Math.cos(a));
  function steerShip(S,dt){
    if(!dt)return;if(S.glide){/* 3.42: cập bến: trườn chậm chặng cuối cho mũi tàu chạm đúng đầu cầu tàu */const G=S.glide;G.t=Math.min(1,G.t+dt/1.6);const e=G.t*G.t*(3-2*G.t);S.x=G.f[0]+(G.to[0]-G.f[0])*e;S.z=G.f[1]+(G.to[1]-G.f[1])*e;S.heading=G.f[2]+wrapA(G.to[2]-G.f[2])*e;S.bh=S.heading;S.speed=0;if(G.t>=1)S.glide=null;return}const M=bayMult(),LB=shipBowLen(S),top=S.max*M,om=S.turn*1.3*Math.sqrt(M),vmin=Math.min(top,1.5*Math.sqrt(M)),acc=.9*M,dec=1.8*M;
    let [bx,bz]=shipBow(S);if(S.bh==null)S.bh=S.heading;
    const Ld=Math.max(8,Math.min(42,6+S.speed*1.3));
    // bỏ các điểm mũi tàu đã tới / đã vượt qua
    while(S.path.length>1){const [px,pz]=S.path[0],[qx,qz]=S.path[1],d0=Math.hypot(px-bx,pz-bz);if(S.dest?.bow&&S.path.length===2?(d0<6||(d0<16&&(bx-px)*(qx-px)+(bz-pz)*(qz-pz)>0)):(d0<Math.max(5,Ld*.6)||(d0<Ld*1.5&&(bx-px)*(qx-px)+(bz-pz)*(qz-pz)>0)))S.path.shift();else break}/* điểm chờ thẳng trục cầu tàu phải đi qua thật */
    const [tx,tz]=S.path[0],last=S.path.length===1,d0=Math.hypot(tx-bx,tz-bz),D=S.dest;
    S.nearT=last&&d0<30?(S.nearT||0)+dt:0;/* loanh quanh sát đích quá lâu thì coi như đã tới */
    if(last&&(d0<(D?.bow?2.5:1.6)||(d0<9&&(tx-bx)*Math.sin(S.bh)+(tz-bz)*Math.cos(S.bh)<0)||S.nearT>25)){S.nearT=0;shipArrived(S);return}
    let rem=d0;for(let i=1;i<S.path.length;i++)rem+=Math.hypot(S.path[i][0]-S.path[i-1][0],S.path[i][1]-S.path[i-1][1]);
    // điểm nhắm: cách mũi Ld dọc theo đường
    let cx=tx,cz=tz;{let left=Ld,ax=bx,az=bz;for(const [qx,qz] of S.path){const sl=Math.hypot(qx-ax,qz-az);if(sl>=left){cx=ax+(qx-ax)/sl*left;cz=az+(qz-az)/sl*left;break}left-=sl;ax=cx=qx;az=cz=qz}}
    // Quay đầu tại chỗ: đích ở phía sau mà ngay trước mũi là đá / bờ (vd. vừa rời cầu tàu Đảo Yên, mũi đang quay vào đảo) thì đứng yên
    // xoay mũi dần về phía cần đến (không chạy lùi), đủ chỗ trống rồi mới tiến, mũi luôn đi trước.
    {const want=Math.atan2(cx-S.x,cz-S.z),eh=wrapA(want-S.heading),sx=Math.sin(S.heading),sz=Math.cos(S.heading),
      ahead=r=>{for(let k=4;k<=r;k+=5)if(!hardFree(bx+sx*k,bz+sz*k))return k;return 0};
      if(!S.rev&&Math.abs(eh)>1.3&&S.speed<vmin*2.5&&ahead(30))S.rev={d:0};
      if(S.rev){const vb=1.8*Math.sqrt(M),sternOk=true;
        if(!sternOk||S.rev.d>70||(Math.abs(eh)<1.1&&!ahead(35))){S.rev=null;S.bh=S.heading;S.yawRate=0}
        else{/* 3.42: không lùi tàu: đứng yên xoay mũi tại chỗ (chân vịt mũi) cho tới khi mũi hướng ra nước thoáng, rồi mũi đi trước */S.speed=0;S.rev.d+=vb*dt*.5;S.heading=wrapA(S.heading+Math.sign(eh)*Math.min(Math.abs(eh),.22*Math.sqrt(M)*dt));S.bh=S.heading;return}}}
    const err=wrapA(Math.atan2(cx-bx,cz-bz)-S.bh),rate=Math.max(-om,Math.min(om,err*2.2));
    S.yawRate=(S.yawRate||0)+(rate-(S.yawRate||0))*Math.min(1,dt*2.5);S.bh=wrapA(S.bh+S.yawRate*dt);
    {const rel=wrapA(S.bh-S.heading);if(Math.abs(rel)>1.2)S.bh=wrapA(S.heading+Math.sign(rel)*1.2)}
    // tốc độ mong muốn
    let vt=Math.max(Math.min(top,vmin*2),top*Math.cos(Math.min(1.5,Math.abs(err))));/* mũi còn lệch nhiều: đi chậm để quay vòng hẹp */
    if(!last){const [qx,qz]=S.path[1],th=Math.abs(wrapA(Math.atan2(qx-tx,qz-tz)-Math.atan2(tx-bx,tz-bz))),vc=Math.max(vmin*2,top*Math.max(.28,1-th/2.2));vt=Math.min(vt,Math.sqrt(vc*vc+2*dec*.8*d0))}
    vt=Math.min(vt,Math.sqrt(2*dec*.7*rem)+.25);if(D?.bow&&rem<70)vt=Math.min(vt,.8+rem*.1*Math.sqrt(M));if(D?.bow&&S.path.length===2)vt=Math.min(vt,(3+d0*.12)*Math.sqrt(M));/* chặng cập cầu tàu: chậm dần để mũi chạm nhẹ */
    // chân đá ngay trên hướng mũi trong quãng hãm (chỉ xét tới điểm rẽ kế tiếp)
    S.slowed=false;{const look=Math.max(12,Math.min(160,S.speed*S.speed/(2*dec)+10,d0+8)),sx=Math.sin(S.bh),sz=Math.cos(S.bh);
      for(let r=4;r<=look;r+=5)if(!hardFree(bx+sx*r,bz+sz*r)){vt=Math.min(vt,r<10?vmin*.5:vmin);S.slowed=true;break}}
    const dv=vt-S.speed;S.speed+=Math.max(-dec*dt*(S.slowed?1.6:1),Math.min(acc*dt,dv));S.speed=Math.max(0,S.speed);
    // tàu đứng yên lâu (bị kẹt) thì tìm đường lại từ mũi
    if(S.speed<.3){S.stuckT=(S.stuckT||0)+dt;if(S.stuckT>5&&D){S.stuckT=0;const p=findPath(bx,bz,D.bow?D.x:S.path[S.path.length-1][0],D.bow?D.z:S.path[S.path.length-1][1],D.bow);if(p)S.path=p}}else S.stuckT=0;
    // mũi đi tới, tâm đi theo mũi
    bx+=Math.sin(S.bh)*S.speed*dt;bz+=Math.cos(S.bh)*S.speed*dt;
    const dx=bx-S.x,dz=bz-S.z,L=Math.hypot(dx,dz);if(L>1e-4){S.x=bx-dx/L*LB;S.z=bz-dz/L*LB;S.heading=Math.atan2(dx,dz)}
  }
  function shipArrived(S){const D=S.dest,label=D?.label;S.path=[];S.dest=null;S.yawRate=0;S.speed=0;bayMarker.visible=false;refreshBayHud();drawBayMap();
    if(bayTour)arriveStop();else bayCaption(D?.bow?'⚓ Mũi tàu đã cập đầu cầu tàu'+(label?' · '+label:''):label?'Đã đến '+label:'⚓ Tàu đã tới nơi',5000);
    /* 3.42: tới Đảo Yên: tàu trườn nốt cho mũi chạm đúng đầu cầu tàu rồi neo lại; khách bấm vào đảo để lên đảo (có chuyển cảnh) */
    if(label==='Đảo Yên của bạn'){tuDaoPending=null;if(bayTour)tdDockGlide(S);else{dockAtTuDao();bayCaption('⚓ Mũi tàu đã chạm đầu cầu tàu · bấm vào đảo để lên Đảo Yên',7000)}}}
  function updateBay(dt){
    const t=performance.now()/1000;bayU.time.value=t;const S=bayShip;
    if(bayBuilt){
      if(!!bayIsland!==STREAM.island){STREAM.island=!!bayIsland;STREAM.todo=null;if(bayIsland)ensureIslandScene();if(!tdFly)bayFade()}
      streamUpdate(S.x,S.z,dt);bayLandGroup.visible=!bayIsland;if(bayIslandScene)bayIslandScene.visible=!!bayIsland;
      if(S.path.length||S.glide)steerShip(S,dt);
      else{S.speed+=(0-S.speed)*Math.min(1,dt*.6);if(S.yawRate){S.heading+=S.yawRate*dt;S.yawRate*=1-Math.min(1,dt*1.5);if(Math.abs(S.yawRate)<1e-4)S.yawRate=0}
        /* 3.42: tới nơi là dừng, không xoay chỉnh hướng */if(bayTour&&bayTour.dwellUntil&&performance.now()>bayTour.dwellUntil)nextStop()
        if(S.speed>.05){const [bx,bz]=shipBow(S);if(!hardFree(bx+Math.sin(S.heading)*3,bz+Math.cos(S.heading)*3))S.speed=0}/* trôi theo quán tính nhưng không lấn vào đá */
        S.x+=Math.sin(S.heading)*S.speed*dt;S.z+=Math.cos(S.heading)*S.speed*dt}
      S.trailT+=dt;if(S.trailT>.25){S.trailT=0;const sternX=S.x-Math.sin(S.heading)*(S.len/2-3),sternZ=S.z-Math.cos(S.heading)*(S.len/2-3);S.trail.push({x:sternX,z:sternZ,h:S.heading,t,s:Math.min(1,S.speed/6)});while(S.trail.length>WAKE_N)S.trail.shift()}
      updateWake(t);S.foam.material.opacity=Math.min(.75,S.speed/10);
      const y=bayWaveY(S.x,S.z,t)*.35;S.group.position.set(S.x,y,S.z);S.group.rotation.set(0,0,0);S.group.rotateY(S.heading);S.group.rotateX(Math.sin(t*.7)*.006);S.group.rotateZ(Math.sin(t*.55+1)*.008);S.group.updateMatrixWorld(true);
      for(const j of bayJunks){const a=t*j.sp/j.r+j.ph;j.g.position.set(j.x+Math.cos(a)*j.r,bayWaveY(j.x,j.z,t)*.8,j.z+Math.sin(a)*j.r);j.g.rotation.y=-a+Math.PI}
      for(const b of bayBuoys){b.g.position.y=bayWaveY(b.x,b.z,t)*.9;b.g.rotation.z=Math.sin(t*1.2+b.x)*.08}
      if(bayMarker.visible){const k=1+Math.sin(t*3)*.08;bayMarker.userData.ring.scale.set(k,k,1)}
      baySea.position.set(Math.round(S.x/40)*40,0,Math.round(S.z/40)*40);
      let near=null;for(const p of bayData.props){if(p.kind!=='landmark')continue;const d=Math.hypot(p.x-S.x,p.z-S.z);if(d<(p.params?.radius||30)+220&&(!near||d<near.d))near={p,d}}
      if(bayAt&&Math.hypot(S.x-bayAt.x,S.z-bayAt.z)<200)near={p:bayAt.p,d:0};
      if(near&&near.p!==bayLastNear&&!S.dest&&!bayTour)bayCaption(near.p.name+' · '+(near.p.params?.description||''),5200);bayLastNear=near?near.p:null;
      bayMapTimer+=dt;if(bayMapTimer>.4||(!S.path.length&&bayRoute.visible)){bayMapTimer=0;drawBayMap();refreshBayHud();updateRoute();
        let nr=null;for(const p of bayData.props){if(p.kind!=='landmark')continue;const d=Math.hypot(p.x-S.x,p.z-S.z);if(!nr||d<nr.d)nr={p,d}}bayWaterRegion=nr?lmRegion(nr.p):'halong'}
      if(!bayWaterBase){bayWaterBase={d:bayU.deep.value.clone(),s:bayU.shallow.value.clone()}}
      {const W=BAY_WATER[bayWaterRegion],td=W?bayTmpC1.set(W[0]):bayWaterBase.d,tsh=W?bayTmpC2.set(W[1]):bayWaterBase.s,kk=Math.min(1,dt*.35);bayU.deep.value.lerp(td,kk);bayU.shallow.value.lerp(tsh,kk)}
    }
    // người đứng ở mũi tàu, quay mặt theo hướng tàu
    const view=bayPhoto?'photo':bayView,wide=camera.aspect<1?1.25:1;
    if(bayIsland){updateIslandWalk(dt);}if(bayPlay)playUpdate(dt);{const a=playAnchored()||!!bayPlay;if(a!==playAnch){playAnch=a;document.body.classList.toggle('bay-anchored',a);if(a)playBuild();playShowProps(a)}}if(bayIsland){islandWorld(bayTmp);bayAvatar.pos.copy(bayTmp);bayAvatar.yaw=bayIsland.yaw}else if(bayPlay){bayTmp.set(bayPlay.x+BAY.x,bayPlay.y,bayPlay.z+BAY.z);bayAvatar.pos.copy(bayTmp);bayAvatar.yaw=bayPlay.yaw}else{bayTmp.copy(view==='sundeck'&&bayShip.deck?bayShip.deck:(bayShip.bow||new THREE.Vector3(0,2.62,18.8)));bayShip.group.localToWorld(bayTmp);bayAvatar.pos.copy(bayTmp);bayAvatar.yaw=S.heading;}mePosition.set(bayTmp.x,0,bayTmp.z);
    if(view==='spin'&&!bayPause)viewYaw+=dt*.12;
    if(bayPause&&bayPause.bow){S.heading+=bayPause.bow*dt*.45}
    if(bayPause&&view!=='photo'){if(bayPause.turn)viewYaw+=bayPause.turn*dt*1.1;else if(bayPause.auto)viewYaw+=dt*.22;else if(bayPause.snap){const d=Math.atan2(Math.sin(-viewYaw),Math.cos(-viewYaw));viewYaw+=d*Math.min(1,dt*4);if(Math.abs(d)<.01){viewYaw=0;bayPause.snap=false}}}
    // chụp ảnh: máy đặt trên boong trước mặt người (người quay lưng về phía biển), khung lấy cả vịnh phía sau
    // chụp ảnh: camera giống hệt lúc bình thường (cùng góc nhìn, cùng zoom xa/gần, tự nâng khi bị che), cộng thêm xoay trái/phải, lên/xuống và zoom ống kính
    const cv=view==='photo'?bayView:view;let PC=null;
    if(view==='photo'){PC=bayPhoto.cam||(bayPhoto.cam={...CAM0});if(bayPhoto.hold&&!bayPhoto.shooting)camStep(PC,bayPhoto.hold[0],bayPhoto.hold[1]*dt)}
    // Góc nhìn: mũi tàu / boong thượng / tự xoay (sau lưng người) · ngắm tàu từ xa (vòng quanh tàu) · trang phục (trước mặt người)
    bayZoomS+=(bayZoom-bayZoomS)*Math.min(1,dt*7);bayFarZoomS+=(bayFarZoom-bayFarZoomS)*Math.min(1,dt*7);
    if(cv==='far'){const c=bayShip.group.position,cx=c.x+BAY.x,cz=c.z+BAY.z,yaw=S.heading+viewYaw+Math.PI*.78,d=82*wide*bayFarZoomS,h0=24*Math.pow(bayFarZoomS,.7)+Math.sin(walkPitch)*-30;
      // không tự nâng / kéo camera khi đá che: đá giữa camera và tàu tự mờ đi (nhìn xuyên), nên khung hình giữ nguyên
      bayCam.set(cx-Math.sin(yaw)*d,h0,cz-Math.cos(yaw)*d);camera.position.lerp(bayCam,Math.min(1,dt*2.5));bayLook.set(cx,4,cz);camera.lookAt(bayLook)}
    else if(cv==='outfit'){const narrow=camera.aspect<1,yaw=S.heading+Math.PI+.35+viewYaw*.5,d=narrow?6.4:6;bayCam.set(bayTmp.x-Math.sin(yaw)*d,bayTmp.y+1.5,bayTmp.z-Math.cos(yaw)*d);camera.position.lerp(bayCam,Math.min(1,dt*4));
      // điện thoại: nhân vật ở nửa trên (bảng chọn ở dưới); màn rộng: nhân vật lệch trái (bảng chọn ở bên phải)
      const side=narrow?0:-2.1,rx=Math.cos(yaw),rz=-Math.sin(yaw);bayLook.set(bayTmp.x+rx*side,bayTmp.y+(narrow?-.72:.95),bayTmp.z+rz*side);camera.lookAt(bayLook)}
    else{
      // Camera gắn chặt sau lưng người: khoảng cách cố định (không zoom tới lui khi tàu tăng/giảm tốc), chỉ hướng nhìn trễ nhẹ khi tàu đổi hướng
      if(bayIsland&&bayIsland.cam0==null)bayIsland.cam0=bayIsland.yaw;if(bayIsland&&tdExitPick&&TU_DAO.group&&tdInScene(TU_DAO.group)){const P=tdExitPick;P.t+=dt||0;if(P.t>=P.k){P.k+=.25;const v=tdExitCamSide(P.yaw,viewYaw);if(Math.abs(v-viewYaw)>.01){viewYaw=v;if(P.t<.8)bayCamYaw=null}}if(P.t>3||bayIsland.path.length)tdExitPick=null}/* trên đảo: camera không xoay theo người, chỉ vuốt mới xoay */const want=(bayIsland?bayIsland.cam0:bayPlay?bayPlay.yaw:S.heading)+viewYaw;if(bayCamYaw==null||dt===0)bayCamYaw=want;else{const d=Math.atan2(Math.sin(want-bayCamYaw),Math.cos(want-bayCamYaw));bayCamYaw+=d*Math.min(1,dt*(Math.abs(d)>.6?6:2.4))}
      // zoom: xa dần thì camera lùi và lên cao để thấy toàn cảnh; bị che thì tự nâng cao thêm
      const zx=Math.max(0,bayZoomS-1),yaw=bayCamYaw,dist=(meActivity==='sit'?3.1:3.7)*wide*(cv==='sundeck'?1.06:1)*(bayPlay?1.25:1)*bayZoomS,up=(cv==='sundeck'?2.9:2.7)*Math.min(1,bayZoomS)+zx*2.2-Math.sin(walkPitch)*2.2+(bayPlay?.7:0);/* bơi / kayak: lùi và lên cao hơn chút để thấy phao, mũi kayak */
      // chỉ tránh cabin, cột của chính con tàu (gắn theo tàu nên không đổi khi tàu đi ngang đảo đá); đá thì nhìn xuyên, không tự zoom
      if(!bayLiftObjs&&bayBuilt&&!bayIsland){const sb=shipBlockers();if(sb.length)bayLiftObjs=sb}
      bayLiftA.set(bayTmp.x,bayTmp.y+1.1,bayTmp.z);const lift=bayLiftStep(dt,bayLiftA,h=>bayLiftB.set(bayTmp.x-Math.sin(yaw)*dist,bayTmp.y+up+h,bayTmp.z-Math.cos(yaw)*dist),[0,1.5,3,5,8,12],bayIsland||bayPlay?[]:bayLiftObjs||[]);
      bayCam.set(bayTmp.x-Math.sin(yaw)*dist,bayTmp.y+up+lift,bayTmp.z-Math.cos(yaw)*dist);const shPick=bayIsland&&TD_ACT.mode==='pick',shArt=shPick&&TD_ACT.artCam,shEye=shPick&&TD_ACT.art;if(shPick)bayCam.y+=3;if(shEye){const R=TD_ACT.art;R.et=Math.min(1,(R.et||0)+dt*1.2);const fy=bayIsland.yaw,hi=0/* 3.42: 2 nhịp: lúc xếp camera ở tầm mắt khách (cận cảnh); xếp xong mới nâng cao toàn cảnh bờ biển (artCam) */,hf=2*Math.atan(Math.tan(camera.fov*Math.PI/360)*camera.aspect),D=Math.max(4.2,2.1/Math.tan(hf/2)),gy=tdGroundY(R.cx,R.cz),P=hi?new THREE.Vector3(R.cx-R.f[0]*D*.42,gy+D*.92,R.cz-R.f[1]*D*.42):new THREE.Vector3(bayIsland.x-Math.sin(fy)*1.1,tdGroundY(bayIsland.x,bayIsland.z)+2.3,bayIsland.z-Math.cos(fy)*1.1);/* lưới 6×6: camera cao, lùi đủ xa để thấy trọn lưới */TU_DAO.group.localToWorld(P);const e=R.et*R.et*(3-2*R.et);bayCam.lerp(P,e);const L=hi?new THREE.Vector3(R.cx-R.f[0]*D*.2,gy,R.cz-R.f[1]*D*.2):new THREE.Vector3(R.cx,tdGroundY(R.cx,R.cz),R.cz);TU_DAO.group.localToWorld(L);R.L=L;R.e=e}/* xếp hình: camera ở tầm mắt khách, cận cảnh hình vỏ sò */if(shArt){const C=TD_ACT.artCam;C.t=Math.min(1,C.t+dt*.6);const P=new THREE.Vector3(C.cx,C.cy,C.cz);TU_DAO.group.localToWorld(P);const L=new THREE.Vector3(C.lx,C.ly,C.lz);TU_DAO.group.localToWorld(L);const e=C.t*C.t*(3-2*C.t);bayCam.lerp(P,e);C.L=L;C.e=e}/* nhặt vỏ: camera cao hơn một chút, nhìn xuống bãi cát trước mặt */if(!bayIsland&&!bayPlay&&bayLiftObjs)bayPullIn(bayLiftA,bayCam,bayLiftObjs);camera.position.copy(bayCam);
      // hướng nhìn: như cũ (về chân trời); khi lùi xa / lên cao thì cúi xuống vừa đủ để người vẫn nằm trong khung
      const ly=bayTmp.y+(camera.aspect<1?1.6:2.6)+Math.sin(walkPitch)*14-(cv==='sundeck'?4.5:0),hd=Math.max(.5,Math.hypot(bayCam.x-bayTmp.x,bayCam.z-bayTmp.z)),p0=Math.atan2(bayCam.y-ly,hd+30),pMe=Math.atan2(bayCam.y-(bayTmp.y+1),hd),
        half=Math.atan(Math.tan((view==='photo'&&bayPhoto.base?bayPhoto.base.fov:camera.fov)*Math.PI/360)),pitch=Math.max(p0,pMe-half*(.85-.25*Math.min(1,(zx+lift)/6)));
      if(shEye){const R=TD_ACT.art,lx=bayTmp.x+Math.sin(yaw)*4,ly=bayTmp.y,lz=bayTmp.z+Math.cos(yaw)*4;camera.lookAt(lx+(R.L.x-lx)*R.e,ly+(R.L.y-ly)*R.e,lz+(R.L.z-lz)*R.e)}else if(shArt){const C=TD_ACT.artCam,lx=bayTmp.x+Math.sin(yaw)*4,ly=bayTmp.y,lz=bayTmp.z+Math.cos(yaw)*4;camera.lookAt(lx+(C.L.x-lx)*C.e,ly+(C.L.y-ly)*C.e,lz+(C.L.z-lz)*C.e)}else if(shPick){camera.lookAt(bayTmp.x+Math.sin(yaw)*4,bayTmp.y,bayTmp.z+Math.cos(yaw)*4)}else if(bayIsland||bayPlay){camera.lookAt(bayTmp.x,bayTmp.y+1,bayTmp.z);camera.rotateX(Math.atan(Math.tan(camera.fov*Math.PI/360)/3))/* người ở giữa, trên đường 1/3 dưới */}else{bayLook.set(bayCam.x+Math.sin(yaw)*Math.cos(pitch)*30,bayCam.y-Math.sin(pitch)*30,bayCam.z+Math.cos(yaw)*Math.cos(pitch)*30);camera.lookAt(bayLook)}}
    if(tdFly){if(!bayIsland||view==='far'||view==='outfit'||view==='photo')tdFly=null;else{const F=tdFly;F.t=Math.min(F.T,F.t+(dt||0));const u=F.t/F.T,e=u*u*(3-2*u);/* vòng cung: lên cao giữa chặng để thấy cả tàu, cầu tàu và đảo */
      const gx=camera.position.x,gy=camera.position.y,gz=camera.position.z;camera.position.set(F.p.x+(gx-F.p.x)*e,F.p.y+(gy-F.p.y)*e+Math.sin(Math.PI*e)*9,F.p.z+(gz-F.p.z)*e);tdFlyQ.copy(camera.quaternion);camera.quaternion.copy(F.q).slerp(tdFlyQ,e);if(u>=1)tdFly=null}}
    if(bayPlay&&cv!=='far'&&cv!=='outfit'&&view!=='photo'){if(!playCamFixed(dt,bayTmp)&&bayPlay.cam){bayPlay.cam=null;playFly={t:0,T:1.4,p:camera.position.clone(),q:camera.quaternion.clone()}}}
    if(playFly){if(view==='far'||view==='outfit'||view==='photo')playFly=null;else{const F=playFly;F.t=Math.min(F.T,F.t+(dt||0));const u=F.t/F.T,e=u*u*(3-2*u);/* chuyển cảnh xuống nước / về tàu: camera bay vòng cung */
      const gx=camera.position.x,gy=camera.position.y,gz=camera.position.z;camera.position.set(F.p.x+(gx-F.p.x)*e,F.p.y+(gy-F.p.y)*e+Math.sin(Math.PI*e)*4,F.p.z+(gz-F.p.z)*e);tdFlyQ.copy(camera.quaternion);camera.quaternion.copy(F.q).slerp(tdFlyQ,e);if(u>=1)playFly=null}}
    if(PC){camera.rotateOnWorldAxis(bayUpY,PC.yaw);camera.rotateX(PC.pitch);const fv=(bayPhoto.base?.fov||camera.fov)/PC.zoom;if(Math.abs(camera.fov-fv)>.01){camera.fov=fv;camera.updateProjectionMatrix()}}
    baySky.position.set(camera.position.x-BAY.x,0,camera.position.z-BAY.z);if(bayBackdrop){bayBackdrop.position.x=camera.position.x-BAY.x;bayBackdrop.position.z=camera.position.z-BAY.z}
    bayU.camL.value.set(camera.position.x-BAY.x,camera.position.y,camera.position.z-BAY.z);
    // ống nhìn xuyên: tới ngực người, hoặc tới thân tàu khi ngắm từ xa
    meTag.visible=view==='far';SEE.on.value=1;SEE.onShip.value=view==='far'?0:1;SEE.cam.value.copy(camera.position);
    if(view==='far'){const c=bayShip.group.position;SEE.tgt.value.set(c.x+BAY.x,6,c.z+BAY.z);SEE.rad.value=16}else{SEE.tgt.value.set(bayTmp.x,bayTmp.y+1.1,bayTmp.z);SEE.rad.value=view==='photo'?2.4:2.1}
  }
  function loadBayData(){if(bayLoading)return bayLoading;bayLoading=window.anyenCachedText('data/world-halong_bay.json?v=5afaadff').then(t=>JSON.parse(t)).then(d=>{if(!d?.map)throw Error('no map');bayData=d;window.anyenBayWorld=d;return d}).catch(e=>{window.anyenBayError=String(e?.message||e);bayLoading=null;throw e});return bayLoading}
  __bayExport({bayCaption,bayDress,bayTap,bayZoomBy,buildBay,closeBayOutfit,closePhoto,dropPause,endTour,goLandmark,goTuDao,islandBoardNow,loadBayData,openBayMap,openBayOutfit,pauseShip,pines,refreshBayHud,resumeShip,sailToStop,setDestination,startTour,stopBaySound,tdGroundY,tuDaoTap,updateBay,viewPoint});
