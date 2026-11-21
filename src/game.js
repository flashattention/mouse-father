
/* ═════════ characters (real-fur version) ═════════ */
const MC={fur:hx(0x7a5e46),belly:hx(0xd8c7ae),skin:hx(0xc98f86)};
function buildMouse(){
  const m=MC,g=new T.Group(),U=new T.Group(),R={g,U,atk:-1,blk:0};g.add(U);
  const body=[E([0,.42,-.03],[.33,.36,.35]),E([0,.74,.05],[.24,.25,.23],{k:.14}),E([0,.93,-.02],[.17,.13,.17],{k:.1}),E([.2,.3,-.02],[.18,.24,.25],{sym:1,k:.1}),C([0,.27,-.3],[0,.21,-.52],.1,.055,{k:.08})];
  const bodyTint=(x,y,z,nx,ny,nz,o)=>{const t=sst(.15,.7,nz)*sst(1.02,.8,y)*sst(.12,.2,y);o.c=mix3(o.c,m.belly,t*.9);if(nz<0){o.c[0]*=.82;o.c[1]*=.8;o.c[2]*=.78;}};
  U.add(furPart(sculpt(body,.0145,m.fur,bodyTint,null),{len:.055,den:290,comb:[0,-.75,-.35]}));
  const hg=R.head=new T.Group();hg.position.set(0,.98,.03);U.add(hg);
  const head=[E([0,.2,0],[.25,.23,.27]),C([0,.15,.12],[0,.085,.53],.17,.05,{k:.1}),E([.13,.11,.12],[.12,.12,.15],{sym:1,k:.1}),E([.055,.07,.44],[.062,.05,.07],{sym:1,k:.05}),
    C([0,.03,.1],[0,.015,.37],.085,.035,{k:.05,col:m.belly}),E([0,.1,.54],[.042,.036,.036],{k:.03,col:[m.skin[0]*.8,m.skin[1]*.6,m.skin[2]*.6],fur:0}),C([.06,.315,.2],[.2,.285,.13],.036,.03,{sym:1,k:.06})]
    .concat(earPair([.23,.44,-.06],[.2,.215,.042],[0,.5,-.32],.036,{col:m.skin,fur:.12}));
  const headTint=(x,y,z,nx,ny,nz,o)=>{o.c=mix3(o.c,m.belly,sst(.1,-.02,y)*sst(-.1,.2,z)*.8);if(y>.34&&Math.abs(x)>.1){o.c=mix3(m.skin,[m.skin[0]*1.12,m.skin[1],m.skin[2]],sst(0,.6,nz));o.fur=.1;}};
  hg.add(furPart(sculpt(head,.0125,m.fur,headTint,null),{len:.04,den:330,comb:[0,-.15,-.95]}));
  const eyeM=new T.MeshPhysicalMaterial({color:0x050403,roughness:.22,metalness:0,clearcoat:1,clearcoatRoughness:.18,envMap:env(),envMapIntensity:2.2});
  [-1,1].forEach(s=>hg.add(at(M(new T.SphereGeometry(.047,20,16),eyeM,false),s*.152,.235,.212)));
  whiskers(hg,[[.07,.075,.45,5],[-.07,.075,.45,5]],.34,.0028,.2);
  const arm=[C([0,0,0],[0,-.2,.015],.075,.058),C([0,-.2,.015],[0,-.37,0],.058,.042,{k:.04}),E([0,-.425,0],[.047,.052,.037],{k:.04,col:m.skin,fur:.1})];
  for(let i=0;i<4;i++)arm.push(C([-.03+i*.02,-.45,.005],[-.036+i*.024,-.5,.035],.0135,.011,{k:.015,col:m.skin,fur:0}));
  const aGeo=sculpt(arm,.0085,m.fur,null,null),aO={len:.035,den:330,comb:[0,-1,0]};
  const aR=R.armR=new T.Group();aR.position.set(-.32,.84,.05);aR.add(furPart(aGeo,aO));U.add(aR);
  const aL=R.armL=new T.Group();aL.position.set(.32,.84,.05);aL.add(furPart(aGeo,aO));U.add(aL);
  /* feet are separate so they can step */
  const foot=[C([-.01,.065,-.06],[.02,.045,.36],.068,.048,{k:.06,col:m.skin,fur:.25}),C([.02,.04,.36],[-.045,.024,.5],.024,.018,{k:.03,col:m.skin,fur:0}),C([.02,.04,.36],[.02,.024,.535],.024,.018,{k:.03,col:m.skin,fur:0}),C([.02,.04,.36],[.085,.024,.5],.024,.018,{k:.03,col:m.skin,fur:0})];
  const fGeo=sculpt(foot,.011,m.skin,null,null);R.feet=[];
  [1,-1].forEach(s=>{const fg=new T.Group(),inner=furPart(fGeo,{len:.02,den:330,comb:[0,0,-1]});inner.scale.x=s;fg.add(inner);fg.position.x=s*.2;g.add(fg);R.feet.push(fg);});
  const tb=R.tailT=tailTube(30,8,u=>{const k=.85+.15*Math.sin(u*150);return[m.skin[0]*k,m.skin[1]*k*.92,m.skin[2]*k*.92];},0,u=>.05+(.008-.05)*Math.pow(u,.8));
  U.add(M(tb.geo,sm(0xffffff,{vertexColors:true,roughness:.6})));
  const steel=metal(0xcfd6e0,.22),bronze=sm(0xb08a50,{metalness:.85,roughness:.5,envMapIntensity:1.6});
  const sw=R.sword=new T.Group();sw.position.set(0,-.44,.02);aR.add(sw);
  sw.add(at(M(new T.CylinderGeometry(.008,.028,1.25,10),steel),0,.7,0));sw.add(at(M(new T.CylinderGeometry(.1,.1,.022,24),bronze),0,.07,0));
  sw.add(at(M(new T.CylinderGeometry(.034,.034,.15,10),sm(0x4a1414,{roughness:1})),0,-.01,0));sw.add(at(M(new T.TorusGeometry(.04,.013,8,18),steel),0,-.12,0,1,1.5,1));
  const sh=R.shield=new T.Group();sh.position.set(.03,-.45,.13);aL.add(sh);
  const cg=new T.CylinderGeometry(.37,.37,.09,84,2,false),cp=cg.attributes.position;
  for(let i=0;i<cp.count;i++){const y=cp.getY(i),x=cp.getX(i),z=cp.getZ(i),a=Math.atan2(z,x),k=y<-.04?1.07+.05*Math.cos(a*21):y<.01?1.03:1;cp.setX(i,x*k);cp.setZ(i,z*k);}cg.computeVertexNormals();
  const capM=M(cg,bronze);capM.rotation.x=Math.PI/2;sh.add(capM);sh.add(at(M(new T.TorusGeometry(.29,.012,6,40),bronze),0,0,.045));
  const es=new T.Shape();es.moveTo(-.1,-.14);es.lineTo(-.1,.03);es.absarc(0,.03,.1,Math.PI,0,true);es.lineTo(.1,-.14);
  sh.add(at(new T.Mesh(new T.ShapeGeometry(es,12),new T.MeshBasicMaterial({color:0xff9a2a,fog:false})),0,0,.047));
  const sc=M(new T.TorusGeometry(.2,.065,10,24),sm(0x6e1a1a,{roughness:1}));sc.rotation.x=Math.PI/2;at(sc,0,.94,.02,1,1,.75);U.add(sc);
  const cpg=new T.PlaneGeometry(.85,1,8,12);R.cape=M(cpg,sm(0x6e1a1a,{roughness:1,side:T.DoubleSide,alphaMap:capeAlpha(),alphaTest:.5}));R.cape.position.set(0,.96,-.2);U.add(R.cape);R.capeBase=Float32Array.from(cpg.attributes.position.array);
  const st=M(new T.TorusGeometry(.3,.022,6,30),sm(0x3a2618,{roughness:.7}));st.rotation.set(1.2,.5,0);at(st,0,.68,.02,1,1.15,1);U.add(st);
  R.slash=new T.Mesh(new T.RingGeometry(.6,1.5,28,1,-.5,2.3),new T.MeshBasicMaterial({color:0xcfe0ff,transparent:true,opacity:0,side:T.DoubleSide,blending:T.AdditiveBlending,depthWrite:false,fog:false}));
  R.slash.position.set(-.3,.75,.35);R.slash.rotation.y=-Math.PI/2+.25;U.add(R.slash);
  return R;}

const CC={fur:hx(0x8c7c64),dark:hx(0x1a1611),pale:hx(0x9c9486),skin:hx(0xb07a78)};
function buildCat(){
  const c=CC,g=new T.Group(),R={g};
  const toe=(x,z)=>[0,1,2,3].map(i=>E([x+(i-1.5)*.05,.05,z+.09-Math.abs(i-1.5)*.02],[.04,.045,.05],{sym:1,k:.03,col:c.pale}));
  const body=[E([0,.62,.05],[.36,.36,.5]),E([0,.5,-.5],[.42,.42,.5],{k:.15}),E([.3,.36,-.45],[.22,.34,.36],{sym:1,k:.12}),E([.2,.72,.3],[.17,.25,.2],{sym:1,k:.1}),E([.13,1,.2],[.08,.085,.13],{sym:1,k:.08}),
    C([0,.85,.3],[0,1.16,.5],.25,.19,{k:.12}),E([0,.7,.47],[.22,.27,.16],{k:.1,col:c.pale}),C([.2,.6,.5],[.21,.14,.62],.1,.075,{sym:1,k:.08}),E([.21,.075,.7],[.105,.075,.15],{sym:1,k:.05,col:c.pale}),
    C([.34,.075,-.42],[.36,.065,0],.09,.08,{sym:1,k:.08,col:c.pale}),C([0,.38,-.9],[0,.36,-1.12],.11,.1,{k:.1})].concat(toe(.21,.74)).concat(toe(.36,.02));
  const bodyTint=(x,y,z,nx,ny,nz,o)=>{const s=Math.sin(z*14+Math.sin(y*7)*1.4+Math.abs(x)*2.5),leg=z>.38&&y<.55?Math.sin(y*34):-1,d=Math.max(sst(.25,.6,s)*sst(-.5,.1,ny),sst(.2,.6,leg));
    o.c=mix3(o.c,c.dark,d*.8*sst(.5,.9,o.fur));o.c=mix3(o.c,c.pale,sst(.3,.9,-ny)*.6);};
  R.body=new T.Group();R.body.add(furPart(sculpt(body,.026,c.fur,bodyTint,null),{len:.07,den:150,comb:[0,-.5,-.75]}));g.add(R.body);
  const h=R.head=new T.Group();h.position.set(0,1.2,.5);g.add(h);
  const eyeC=[.155,.045,.215],eyeR=.082;
  const head=[E([0,.02,-.02],[.34,.3,.32]),E([.2,-.08,.1],[.17,.15,.18],{sym:1,k:.1}),C([0,.03,.2],[0,-.05,.31],.125,.1,{k:.09}),E([.075,-.125,.295],[.092,.078,.092],{sym:1,k:.045,col:c.pale}),
    E([0,-.21,.245],[.085,.065,.085],{k:.05,col:c.pale}),E(eyeC,[eyeR,eyeR*.9,eyeR],{sym:1,sub:1,k:.03}),C([.045,.15,.25],[.25,.115,.15],.055,.05,{sym:1,k:.05}),E([0,-.045,.39],[.047,.032,.03],{k:.025,col:c.skin,fur:0})]
    .concat(earPair([.22,.36,-.06],[.15,.21,.05],[0,.35,-.28],.04,{col:c.fur})).concat([C([.23,.42,-.06],[.29,.56,-.1],.07,.012,{sym:1,k:.06})]);
  const headTint=(x,y,z,nx,ny,nz,o)=>{if(y>.35&&Math.abs(x)>.1&&nz>.25){o.c=mix3(c.skin,c.dark,.25);o.fur=.25;}
    const fs=sst(.5,.9,Math.abs(Math.sin(x*36)))*sst(.1,.2,y)*sst(.3,.1,y)*sst(-.2,.05,z),cs=sst(.4,.8,Math.sin(y*40+x*10))*sst(.14,.24,Math.abs(x))*sst(.02,-.08,y)*sst(.3,.15,z);o.c=mix3(o.c,c.dark,Math.max(fs,cs)*.85);};
  h.add(furPart(sculpt(head,.0165,c.fur,headTint,null),{len:.05,den:185,comb:[0,-.25,-.9]}));
  R.eyes=[];[-1,1].forEach(s=>{const tx=catEyeTex('#9ad94a','#263312',false),em=new T.MeshPhysicalMaterial({map:tx,emissiveMap:tx,emissive:0xffffff,emissiveIntensity:.85,roughness:.08,clearcoat:1,envMap:env(),envMapIntensity:1.6});
    const ey=M(new T.SphereGeometry(eyeR*.9,24,18),em,false);at(ey,s*eyeC[0],eyeC[1],eyeC[2]-.012);ey.rotation.set(.22,s*.16,0);h.add(ey);R.eyes.push(em);});
  whiskers(h,[[.12,-.12,.355,6],[-.12,-.12,.355,6]],.5,.0022,.16);whiskers(h,[[.1,.2,.26,2],[-.1,.2,.26,2]],.26,.0018,.5);
  const tb=R.tailT=tailTube(26,10,()=>c.fur,1,u=>.115+(.07-.115)*u*u+(u>.95?(u-.95)*-.07*12:0)),ca=tb.geo.attributes.color;
  for(let i=0;i<=26;i++)for(let j=0;j<10;j++){const k=Math.sin(i*1.5)>.2?.3:1;ca.setXYZ(i*10+j,c.fur[0]*k,c.fur[1]*k,c.fur[2]*k);}
  g.add(furPart(tb.geo,{len:.085,den:150,comb:[0,0,0]}));
  const claw=sm(0xd8d0bc,{roughness:.35});
  [-1,1].forEach(s=>[0,1,2,3].forEach(i=>{const k=M(new T.ConeGeometry(.012,.06,6),claw);at(k,s*(.21+(i-1.5)*.05),.035,.86-Math.abs(i-1.5)*.02);k.rotation.x=1.9;g.add(k);}));
  const col=M(new T.TorusGeometry(.2,.022,8,30),sm(0x7a1818,{roughness:.6}));col.rotation.x=1.05;at(col,0,1,.42);g.add(col);g.add(at(M(new T.SphereGeometry(.045,14,10),metal(0xd9a520,.25)),0,.86,.6));
  return R;}

function buildTrap(){const g=new T.Group(),met=metal(0xcfd6e0,.3);g.add(at(M(new T.BoxGeometry(1.7,.09,.9),sm(0x6a5238)),0,.045,0));
  const pv=new T.Group();pv.position.set(0,.12,0);g.add(pv);
  const rod=(l,x,z,ry)=>{const c=M(new T.CylinderGeometry(.024,.024,l,8),met);c.rotation.z=Math.PI/2;c.rotation.y=ry||0;at(c,x,0,z);pv.add(c);};
  rod(.8,-.74,0,Math.PI/2);rod(.74,-.37,-.38);rod(.74,-.37,.38);
  for(let i=0;i<6;i++){const t=M(new T.TorusGeometry(.07,.016,6,16),met);t.rotation.y=Math.PI/2;at(t,0,.14,-.2+i*.08);g.add(t);}
  g.add(at(M(new T.BoxGeometry(.34,.02,.26),met),.42,.1,0));
  const s=new T.Shape();s.moveTo(0,0);s.lineTo(.36,0);s.lineTo(0,.24);s.lineTo(0,0);
  const bait=M(new T.ExtrudeGeometry(s,{depth:.22,bevelEnabled:false}),sm(0xe0ac28,{roughness:.6,emissive:0x3a2600}));at(bait,.3,.11,-.11);g.add(bait);
  return{g,pv,bait};}
function buildHuman(){const g=new T.Group();g.add(at(M(new T.SphereGeometry(1,28,20),sm(0x4a3040)),0,.62,0,1.25,.62,2.5));g.add(at(M(new T.BoxGeometry(2.3,.18,4.9),sm(0x16120f)),0,.09,0));
  g.add(at(M(new T.CylinderGeometry(.72,.8,24,24),sm(0x1b2030)),0,12.6,-1.1));g.add(at(M(new T.CylinderGeometry(.9,.9,.5,24),sm(0x1b2030)),0,1.25,-1.1));return g;}
function miniMouse(s,scarf){const g=new T.Group(),fur=sm(0x6b5a4e),pink=sm(0xb5847c);g.add(at(M(new T.SphereGeometry(.36,20,16),fur),0,.42,0,1,1.1,.95));
  const h=new T.Group();h.position.set(0,.98,.05);g.add(h);h.add(M(new T.SphereGeometry(.3,20,16),fur));const sn=M(new T.ConeGeometry(.14,.3,16),fur);sn.rotation.x=Math.PI/2;sn.position.set(0,-.05,.3);h.add(sn);
  [-1,1].forEach(q=>{h.add(at(M(new T.SphereGeometry(.19,16,12),pink),q*.25,.28,0,1,1,.2));h.add(at(M(new T.SphereGeometry(.05,10,8),sm(0x050403,{roughness:.1})),q*.12,.05,.26));});
  if(scarf){const t=M(new T.TorusGeometry(.24,.07,8,20),sm(scarf));t.rotation.x=Math.PI/2;t.position.y=.76;g.add(t);}g.scale.setScalar(s);g.userData.head=h;return g;}

/* ═════════ world ═════════ */
const HOME={x:-3.2,z:-6.2},BX=15,BZ0=-6.1,BZ1=25,QUOTA=5,HS=1.5;
const LEGS=[[-5,7,.75],[7,7,.75],[-5,17,.75],[7,17,.75],[11,2,.4],[13.5,2,.4],[11,4.5,.4],[13.5,4.5,.4]];
const W={};
function buildWorld(){
  const scene=W.scene=new T.Scene();scene.background=new T.Color(0x05070c);scene.fog=new T.Fog(0x070a12,9,40);
  scene.add(new T.HemisphereLight(0x3a4c70,0x14100c,.7));
  const key=W.key=new T.DirectionalLight(0x8fb2ff,1.1);key.castShadow=true;const sc=key.shadow.camera;sc.left=-13;sc.right=13;sc.top=13;sc.bottom=-13;sc.near=1;sc.far=50;
  key.shadow.mapSize.set(mobile?1024:2048,mobile?1024:2048);key.shadow.bias=-.0004;key.shadow.normalBias=.04;scene.add(key);scene.add(key.target);
  const rim=new T.DirectionalLight(0x9fc0ff,.6);rim.position.set(-6,7,-6);scene.add(rim);
  const holeL=new T.PointLight(0xff8a2a,2.4,14,2);holeL.position.set(-3.2,1,-5.6);scene.add(holeL);
  W.fill=new T.PointLight(0xffc890,.55,11,2);scene.add(W.fill);
  const floor=new T.Mesh(new T.PlaneGeometry(90,90),sm(0xffffff,{map:plankTex(),roughness:.75}));floor.material.map.repeat.set(9,9);floor.rotation.x=-Math.PI/2;floor.position.set(0,0,10);floor.receiveShadow=true;scene.add(floor);
  const wmat=sm(0xffffff,{map:wallTex(),roughness:.95}),bmat=sm(0x3a3530);
  const wallAt=(x,z,ry,len)=>{const w=new T.Mesh(new T.PlaneGeometry(len,30),wmat);w.position.set(x,15,z);w.rotation.y=ry;w.receiveShadow=true;scene.add(w);
    const b=M(new T.BoxGeometry(len,1.1,.16),bmat);b.position.set(x,.55,z);b.rotation.y=ry;b.translateZ(.08);scene.add(b);const b2=M(new T.BoxGeometry(len,.12,.22),bmat);b2.position.set(x,1.14,z);b2.rotation.y=ry;b2.translateZ(.1);scene.add(b2);};
  wallAt(0,-7,0,60);wallAt(-16.2,10,Math.PI/2,60);wallAt(16.2,10,-Math.PI/2,60);wallAt(0,26.2,Math.PI,60);
  const w=1.7,hh=1.85,a=new T.Shape();a.moveTo(-w/2,0);a.lineTo(-w/2,hh-w/2);a.absarc(0,hh-w/2,w/2,Math.PI,0,true);a.lineTo(w/2,0);
  const ag=new T.ShapeGeometry(a,24),uv=ag.attributes.uv,pp=ag.attributes.position;for(let i=0;i<uv.count;i++)uv.setXY(i,(pp.getX(i)+w/2)/w,pp.getY(i)/hh);
  scene.add(at(new T.Mesh(ag,new T.MeshBasicMaterial({map:holeTex(),fog:false})),-3.2,0,-6.72));
  scene.add(at(new T.Mesh(new T.ShapeGeometry(a,24),new T.MeshBasicMaterial({color:0x140a05})),-3.2,0,-6.78,1.13,1.07,1));
  W.fam=[at(miniMouse(.82,0x4a6a90),-3.75,0,-6.3),at(miniMouse(.46),-2.7,0,-6.3),at(miniMouse(.4),-3.2,0,-6.45)];W.fam[0].rotation.y=.3;W.fam[1].rotation.y=-.3;W.fam.forEach(m=>scene.add(m));
  const gt=goboTex();[[0,3,.4],[-4,15,-.3],[9,21,.2]].forEach(q=>{const gb=new T.Mesh(new T.PlaneGeometry(8,11),new T.MeshBasicMaterial({map:gt,color:0x8fb2ff,transparent:true,opacity:.2,blending:T.AdditiveBlending,depthWrite:false,fog:false}));gb.rotation.x=-Math.PI/2;gb.rotation.z=q[2];gb.position.set(q[0],.02,q[1]);scene.add(gb);});
  const wood=sm(0x5a4632);LEGS.forEach(l=>scene.add(at(M(new T.BoxGeometry(l[2]*1.25,24,l[2]*1.25),wood),l[0],12,l[1])));
  scene.add(at(M(new T.BoxGeometry(15,.6,13),wood),1,19,12));scene.add(at(M(new T.BoxGeometry(4,.4,4),wood),12.25,11,3.25));
  /* food crumbs */
  W.crumbs=[[3.5,-1.5],[-10,6],[1,12]].map((p,i)=>{const g=new T.Group(),r=rnd(20+i);for(let k=0;k<4;k++){const c=M(new T.DodecahedronGeometry(.16+r()*.1,0),sm(0xc79a52,{roughness:.9,emissive:0x2a1a04}));c.position.set((r()-.5)*.35,.14+r()*.1,(r()-.5)*.35);c.rotation.set(r()*3,r()*3,r()*3);g.add(c);}
    const gl=new T.Mesh(new T.CircleGeometry(.9,24),new T.MeshBasicMaterial({color:0xffb040,transparent:true,opacity:.22,blending:T.AdditiveBlending,depthWrite:false,fog:false}));gl.rotation.x=-Math.PI/2;gl.position.y=.03;g.add(gl);
    g.position.set(p[0],0,p[1]);scene.add(g);return{g,x:p[0],z:p[1],got:false};});
  W.traps=[[-1,3.2,.4],[10,9.5,-1],[-8,14,2],[4,20.5,.3]].map(p=>{const t=buildTrap();t.g.position.set(p[0],0,p[1]);t.g.rotation.y=p[2];t.g.scale.setScalar(1.3);scene.add(t.g);
    t.x=p[0];t.z=p[1];t.bx=p[0]+Math.cos(p[2])*.42*1.3;t.bz=p[1]-Math.sin(p[2])*.42*1.3;t.state=0;t.t0=0;t.got=false;return t;});
  W.human=buildHuman();W.human.position.set(0,30,0);scene.add(W.human);
  const ringM=c=>new T.MeshBasicMaterial({color:c,transparent:true,opacity:0,depthWrite:false,fog:false,side:T.DoubleSide});
  W.hShadow=new T.Mesh(new T.CircleGeometry(2.7,32),ringM(0x000000));W.hRing=new T.Mesh(new T.RingGeometry(2.5,2.7,40),ringM(0xff5a3a));
  W.cRing=new T.Mesh(new T.RingGeometry(1.9,2.1,40),ringM(0x9ad94a));
  [W.hShadow,W.hRing,W.cRing].forEach((m,i)=>{m.rotation.x=-Math.PI/2;m.position.y=.03+i*.005;scene.add(m);});
  W.spark=new T.Mesh(new T.SphereGeometry(.5,12,10),new T.MeshBasicMaterial({color:0xfff0c0,transparent:true,opacity:0,blending:T.AdditiveBlending,depthWrite:false,fog:false}));scene.add(W.spark);
  W.cat=buildCat();W.cat.g.scale.setScalar(3.2);scene.add(W.cat.g);
  W.catL=new T.PointLight(0x7dff6a,.5,7,2);scene.add(W.catL);
  W.hero=buildMouse();W.hero.g.scale.setScalar(HS);scene.add(W.hero.g);
  const st=shaftTex();W.shafts=[];[[2,3],[-3,15]].forEach((q,i)=>{const m=new T.Mesh(new T.PlaneGeometry(3.4,22),new T.MeshBasicMaterial({map:st,color:0x9fbcff,transparent:true,opacity:.09,blending:T.AdditiveBlending,depthWrite:false,fog:false,side:T.DoubleSide}));m.position.set(q[0]+3,9,q[1]);m.rotation.z=.5;scene.add(m);W.shafts.push(m);});
  const n=320,p=new Float32Array(n*3),r=rnd(3);for(let i=0;i<n;i++){p[i*3]=(r()-.5)*32;p[i*3+1]=r()*10;p[i*3+2]=r()*32-6;}
  const dg=new T.BufferGeometry();dg.setAttribute('position',new T.BufferAttribute(p,3));W.dust=new T.Points(dg,new T.PointsMaterial({color:0xbfd4ff,size:.045,transparent:true,opacity:.55,blending:T.AdditiveBlending,depthWrite:false,fog:false}));scene.add(W.dust);
}

/* ═════════ game state ═════════ */
const G={state:'intro',t:0,hp:5,food:0,inv:0,shake:0,msgT:0,catGone:false},P={},Ct={},Hm={},In={x:0,y:0,atk:false,shd:false,dash:false},keys={};
const cam={yaw:0,pitch:.28,manual:-9};
const angd=(a,b)=>{let d=a-b;while(d>Math.PI)d-=6.2832;while(d<-Math.PI)d+=6.2832;return d;};
const hyp=Math.hypot;
function toast(s,d){const e=$('toast');e.textContent=s;e.style.opacity=1;G.msgT=G.t+(d||2.4);}
function hud(){const p=$('pips');let h='';for(let i=0;i<5;i++)h+='<i'+(i<G.hp?'':' class="off"')+'></i>';p.innerHTML=h;$('foodn').textContent=G.food;
  $('goal').textContent=G.food<QUOTA?'먹이를 찾아라. 덫의 치즈는 칼로 덫을 먼저 터뜨리고 줍는다.':!G.catGone?'고양이를 물리쳐라. 덮친 직후가 빈틈이다.':'집으로 돌아가라.';
  $('boss').style.display=Ct.awake&&!G.catGone?'flex':'none';$('bossbar').firstElementChild.style.width=Math.max(0,Ct.hp/6*100)+'%';}
function reset(){
  Object.assign(G,{hp:5,food:0,inv:0,shake:0,catGone:false});
  Object.assign(P,{x:-3.2,z:-3.6,yaw:0,kx:0,kz:0,atk:-9,hit:false,dash:0,dashCd:0,dx:0,dz:1,run:0,ph:0,sp:0});
  Object.assign(Ct,{x:11,z:21,y:0,yaw:-2.5,state:'doze',t0:0,hp:6,awake:false,wait:1,bit:false,leaps:0});
  Object.assign(Hm,{state:'wait',t0:G.t,next:4,tx:0,tz:8,yaw:0});
  cam.yaw=0;cam.pitch=.28;
  W.crumbs.forEach(c=>{c.got=false;c.g.visible=true;});W.traps.forEach(t=>{t.state=0;t.got=false;t.bait.visible=true;t.pv.rotation.z=0;});
  W.cat.g.visible=true;W.human.position.y=30;[W.hShadow,W.hRing,W.cRing].forEach(m=>m.material.opacity=0);hud();}
function hurt(n,sx,sz,blockable){
  if(G.state!=='play'||G.inv>0||P.dash>0)return false;
  const dx=P.x-sx,dz=P.z-sz,l=hyp(dx,dz)||1;
  if(blockable&&In.shd&&Math.abs(angd(Math.atan2(-dx,-dz),P.yaw))<1.25){P.kx=dx/l*7;P.kz=dz/l*7;G.shake=.25;spark(P.x-dx/l*.6,1,P.z-dz/l*.6);toast('막았다!',1);G.inv=.35;return false;}
  G.hp-=n;G.inv=1.3;G.shake=.5;P.kx=dx/l*9;P.kz=dz/l*9;$('hurt').style.opacity=1;setTimeout(()=>$('hurt').style.opacity=0,200);hud();
  if(G.hp<=0)finish(false);return true;}
function spark(x,y,z){W.spark.position.set(x,y,z);W.spark.userData.t=G.t;}
function getFood(){G.food++;hud();if(G.food===QUOTA){toast('다섯 조각. 이제 집으로.',2.6);if(!Ct.awake)setTimeout(()=>{if(G.state==='play')wakeCat(true);},1800);}else toast('먹이 '+G.food+' / '+QUOTA,1.2);}
function wakeCat(block){if(Ct.awake||G.catGone)return;Ct.awake=true;toast('고양이가 눈을 떴다.',2.4);hud();
  if(block){const dx=HOME.x-P.x,dz=HOME.z+2-P.z,l=hyp(dx,dz)||1,d=Math.min(l*.6,7);leapTo(P.x+dx/l*d,P.z+dz/l*d,1.1,'hunt');}else{Ct.state='hunt';Ct.t0=G.t;Ct.wait=.8;}}
function leapTo(x,z,dur,next){Ct.sx=Ct.x;Ct.sz=Ct.z;Ct.ex=Math.max(-BX+2,Math.min(BX-2,x));Ct.ez=Math.max(BZ0+2.5,Math.min(BZ1-2,z));Ct.dur=dur;Ct.next=next;Ct.state='leap';Ct.t0=G.t;Ct.yaw=Math.atan2(Ct.ex-Ct.sx,Ct.ez-Ct.sz);}
function finish(win){G.state=win?'win':'dead';$('toast').style.opacity=0;G.msgT=0;$('hud').style.display='none';$('pad').style.display='none';$('joy').style.display='none';
  $('endeye').textContent=win?'제1장 끝':'쓰러지다';$('endh').textContent=win?'오늘 저녁은 치즈 다섯 조각':'아직 끝낼 수 없다';
  $('endp').textContent=win?'문턱을 넘자 작은 발소리 셋이 달려온다. 망토는 찢어졌고 방패는 찌그러졌지만, 식탁에는 촛불이 켜진다. 내일 밤에도 그는 다시 문턱을 넘을 것이다.':'문간의 불빛이 아직 꺼지지 않았다. 식구들이 기다린다. 다시 일어서야 한다.';
  $('again').textContent=win?'다시 나서기':'다시 일어서기';setTimeout(()=>$('end').classList.add('show'),win?900:700);}
function begin(){reset();G.state='play';$('intro').classList.remove('show');$('end').classList.remove('show');$('hud').style.display='flex';if(touch)$('pad').style.display='grid';toast('먹이 다섯 개를 구해 돌아오자.',2.6);}

/* ═════════ update ═════════ */
function collide(){
  P.x=Math.max(-BX,Math.min(BX,P.x));P.z=Math.max(BZ0,Math.min(BZ1,P.z));
  const push=(cx,cz,r)=>{const dx=P.x-cx,dz=P.z-cz,l=hyp(dx,dz);if(l<r&&l>1e-4){P.x=cx+dx/l*r;P.z=cz+dz/l*r;}};
  LEGS.forEach(l=>push(l[0],l[1],l[2]+.45));
  if(!G.catGone&&Ct.y<.6)push(Ct.x,Ct.z,2.1);
  if(Hm.state==='hold')push(Hm.tx,Hm.tz,2.2);}
function updatePlayer(dt){
  let ix=In.x+((keys.KeyD||keys.ArrowRight)?1:0)-((keys.KeyA||keys.ArrowLeft)?1:0),iy=In.y+((keys.KeyW||keys.ArrowUp)?1:0)-((keys.KeyS||keys.ArrowDown)?1:0);
  let l=hyp(ix,iy);if(l>1){ix/=l;iy/=l;l=1;}
  const fx=Math.sin(cam.yaw),fz=Math.cos(cam.yaw),mx=fx*iy-fz*ix,mz=fz*iy+fx*ix;
  if(l>.12){P.dx=mx/l;P.dz=mz/l;P.yaw+=angd(Math.atan2(mx,mz),P.yaw)*Math.min(1,dt*12);}
  const shd=In.shd&&P.dash<=0;let sp=l>.12?4.6*l*(shd?.45:1):0;
  if(In.dash&&P.dashCd<=0&&P.dash<=0){P.dash=.24;P.dashCd=.9;G.inv=Math.max(G.inv,.32);if(l<=.12){P.dx=Math.sin(P.yaw);P.dz=Math.cos(P.yaw);}}In.dash=false;
  let vx=P.dx*sp,vz=P.dz*sp;if(P.dash>0){vx=P.dx*11.5;vz=P.dz*11.5;P.dash-=dt;}P.dashCd-=dt;
  P.x+=(vx+P.kx)*dt;P.z+=(vz+P.kz)*dt;const kd=Math.exp(-dt*7);P.kx*=kd;P.kz*=kd;P.vx=vx;P.vz=vz;P.sp=hyp(vx,vz);
  collide();
  if(In.atk&&G.t-P.atk>.5){P.atk=G.t;P.hit=false;}In.atk=false;
  const at0=G.t-P.atk;
  if(at0>.16&&at0<.32&&!P.hit){const fwx=Math.sin(P.yaw),fwz=Math.cos(P.yaw),inArc=(x,z,r)=>{const dx=x-P.x,dz=z-P.z,d=hyp(dx,dz);return d<r&&(d<.8||(dx*fwx+dz*fwz)/d>.25);};
    W.traps.forEach(t=>{if(t.state===0&&inArc(t.x,t.z,2.5)){t.state=1;t.t0=G.t;P.hit=true;spark(t.x,.5,t.z);G.shake=.2;toast('덫을 터뜨렸다.',1.2);}});
    if(!G.catGone&&Ct.y<.8){const cfx=Ct.x+Math.sin(Ct.yaw)*2.3,cfz=Ct.z+Math.cos(Ct.yaw)*2.3;
      if(inArc(cfx,cfz,2.9)||inArc(Ct.x,Ct.z,3.4)){P.hit=true;const sneak=!Ct.awake;Ct.hp-=sneak?2:1;spark((P.x+cfx)/2,1.3,(P.z+cfz)/2);G.shake=.3;
        if(sneak){Ct.awake=true;toast('기습!',1.2);}
        const dx=Ct.x-P.x,dz=Ct.z-P.z,d=hyp(dx,dz)||1;Ct.x+=dx/d*.7;Ct.z+=dz/d*.7;
        if(Ct.hp<=0){G.catGone=true;Ct.leaps=2;toast('고양이가 물러난다. 집으로!',3);leapTo(Ct.x+dx/d*9,Ct.z+dz/d*9,.7,'flee');}else{Ct.state='hurt';Ct.t0=G.t;}hud();}}}
  W.crumbs.forEach(c=>{if(!c.got&&hyp(P.x-c.x,P.z-c.z)<1.1){c.got=true;c.g.visible=false;getFood();}});
  W.traps.forEach(t=>{
    if(t.state===0&&hyp(P.x-t.x,P.z-t.z)<1.0&&P.dash<=0){t.state=1;t.t0=G.t;if(hurt(1,t.x,t.z,false))toast('덫에 걸렸다!',1.4);}
    if(t.state===2&&!t.got&&hyp(P.x-t.bx,P.z-t.bz)<1.25){t.got=true;t.bait.visible=false;getFood();}});
  if(G.food>=QUOTA&&hyp(P.x-HOME.x,P.z-HOME.z)<1.7){if(G.catGone)finish(true);else if(G.t>G.msgT)toast('고양이를 달고 집에 들어갈 수는 없다.',2);}
  if(!Ct.awake&&hyp(P.x-Ct.x,P.z-Ct.z)<5.2&&P.sp>3)wakeCat(false);}
function updateTraps(){W.traps.forEach(t=>{if(t.state===1){const k=Math.min(1,(G.t-t.t0)/.1);t.pv.rotation.z=-2.85*k;if(k>=1)t.state=2;}});}
function updateHuman(dt){const H=Hm,e=G.t-H.t0,hm=W.human,fx=Math.sin(H.yaw),fz=Math.cos(H.yaw);
  if(H.state==='wait'){if(Ct.awake&&!G.catGone)H.t0=G.t;else if(e>H.next){const r=Math.random;if(P.z>1&&r()<.45){H.tx=P.x+P.vx*.6;H.tz=P.z+P.vz*.6;}else{H.tx=(r()-.5)*22;H.tz=3+r()*15;}
      H.tx=Math.max(-12,Math.min(12,H.tx));H.tz=Math.max(2.5,Math.min(22,H.tz));H.yaw=(r()-.5)*1.2;H.state='warn';H.t0=G.t;}}
  else if(H.state==='warn'){const k=e/1.25;W.hShadow.material.opacity=.5*k;W.hRing.material.opacity=.4+.4*Math.sin(G.t*18);W.hShadow.scale.setScalar(.5+.5*k);hm.position.set(H.tx,16,H.tz);if(k>=1){H.state='fall';H.t0=G.t;}}
  else if(H.state==='fall'){const k=Math.min(1,e/.24);hm.position.y=16*(1-k*k);if(k>=1){H.state='hold';H.t0=G.t;G.shake=Math.max(G.shake,hyp(P.x-H.tx,P.z-H.tz)<9?.7:.3);W.hRing.material.opacity=0;
      if(hyp(P.x-H.tx,P.z-H.tz)<2.6&&hurt(2,H.tx,H.tz,false))toast('밟혔다!',1.4);}}
  else if(H.state==='hold'){hm.position.y=0;if(e>.7){H.state='rise';H.t0=G.t;}}
  else if(H.state==='rise'){const k=e/1.1;hm.position.y=16*k*k;W.hShadow.material.opacity=.5*(1-k);if(k>=1){H.state='wait';H.t0=G.t;H.next=3.2+Math.random()*2.8;hm.position.y=30;W.hShadow.material.opacity=0;}}
  hm.rotation.y=H.yaw;W.hShadow.position.set(H.tx,.03,H.tz);W.hRing.position.set(H.tx,.035,H.tz);}
function updateCat(dt){
  if(!W.cat.g.visible)return;const e=G.t-Ct.t0,dx=P.x-Ct.x,dz=P.z-Ct.z,dist=hyp(dx,dz),want=Math.atan2(dx,dz),turn=r=>{Ct.yaw+=Math.max(-r*dt,Math.min(r*dt,angd(want,Ct.yaw)));};
  const R=W.cat;let sq=1,headX=.3,headZ=.5,glow=.85;
  switch(Ct.state){
    case 'doze':glow=.1;headX=.55;break;
    case 'hunt':turn(2.6);if(e>Ct.wait){const front=Math.abs(angd(want,Ct.yaw))<.7;if(dist<4.3&&front){Ct.state='bitewind';Ct.t0=G.t;}else{Ct.tx=P.x+P.vx*.3;Ct.tz=P.z+P.vz*.3;Ct.state='tele';Ct.t0=G.t;}}break;
    case 'tele':{const k=e/.85;sq=1-.14*k;glow=.85+k;Ct.yaw+=angd(Math.atan2(Ct.tx-Ct.x,Ct.tz-Ct.z),Ct.yaw)*Math.min(1,dt*6);W.cRing.position.set(Ct.tx,.04,Ct.tz);W.cRing.material.opacity=.45+.4*Math.sin(G.t*20);
      if(k>=1){const lx=Ct.tx-Ct.x,lz=Ct.tz-Ct.z,l=hyp(lx,lz)||1;Ct.sx=Ct.x;Ct.sz=Ct.z;Ct.ex=Ct.tx-lx/l*2.2;Ct.ez=Ct.tz-lz/l*2.2;Ct.state='pounce';Ct.t0=G.t;}}break;
    case 'pounce':{const k=Math.min(1,e/.5);Ct.x=Ct.sx+(Ct.ex-Ct.sx)*k;Ct.z=Ct.sz+(Ct.ez-Ct.sz)*k;Ct.y=Math.sin(k*Math.PI)*3;sq=1.1;headX=.1;glow=1.6;
      if(k>=1){Ct.y=0;W.cRing.material.opacity=0;G.shake=Math.max(G.shake,.45);if(hyp(P.x-Ct.tx,P.z-Ct.tz)<2.5)hurt(1,Ct.x,Ct.z,true);Ct.state='recover';Ct.t0=G.t;Ct.rec=1.5;}}break;
    case 'recover':sq=.9+.1*Math.min(1,e/.4);headX=.6;glow=.5;if(e>Ct.rec){Ct.state='hunt';Ct.t0=G.t;Ct.wait=.5+Math.random()*.7;}break;
    case 'bitewind':{turn(3);headZ=.5-.22*Math.min(1,e/.4);headX=.15;glow=1.6;if(e>.42){Ct.state='bite';Ct.t0=G.t;Ct.bit=false;}}break;
    case 'bite':{const k=Math.min(1,e/.22);headZ=.28+.75*Math.sin(k*Math.PI);headX=.5;if(k>.45&&!Ct.bit){Ct.bit=true;const hx0=Ct.x+Math.sin(Ct.yaw)*3.4,hz0=Ct.z+Math.cos(Ct.yaw)*3.4;if(hyp(P.x-hx0,P.z-hz0)<2.1)hurt(1,Ct.x,Ct.z,true);}
      if(k>=1){Ct.state='recover';Ct.t0=G.t;Ct.rec=1.1;}}break;
    case 'hurt':sq=.92;headX=-.1;glow=.3;if(e>.4){Ct.state='hunt';Ct.t0=G.t;Ct.wait=.45;}break;
    case 'leap':{const k=Math.min(1,e/Ct.dur);Ct.x=Ct.sx+(Ct.ex-Ct.sx)*k;Ct.z=Ct.sz+(Ct.ez-Ct.sz)*k;Ct.y=Math.sin(k*Math.PI)*3.6;sq=1.1;headX=.1;
      if(k>=1){Ct.y=0;G.shake=Math.max(G.shake,.4);if(Ct.next==='flee'){if(--Ct.leaps>0)leapTo(Ct.x+Math.sin(Ct.yaw)*9,Ct.z+Math.cos(Ct.yaw)*9,.6,'flee');else{W.cat.g.visible=false;hud();}}else{Ct.state='hunt';Ct.t0=G.t;Ct.wait=1.1;}}}break;}
  R.g.position.set(Ct.x,Ct.y,Ct.z);R.g.rotation.y=Ct.yaw;const br=Math.sin(G.t*1.3)*.015;R.body.scale.set(1+br,(1+br)*sq,1);
  R.head.position.set(0,1.2*sq+.0,headZ);R.head.rotation.set(headX+Math.sin(G.t*.33)*.04,Ct.awake?0:Math.sin(G.t*.2)*.05,Math.sin(G.t*.27)*.05);
  R.eyes.forEach(m=>m.emissiveIntensity+=(glow-m.emissiveIntensity)*.15);
  W.catL.position.set(Ct.x+Math.sin(Ct.yaw)*2.4,Ct.y+3.6,Ct.z+Math.cos(Ct.yaw)*2.4);W.catL.intensity=Ct.awake?.7:.15;
  chain(R.tailT,catBase,.085,-.35,-.3,i=>-.15+Math.sin(G.t*(Ct.awake?2.6:1.2)-i*.45)*(Ct.awake?.1:.05),i=>i>19?.14+Math.sin(G.t*2.1)*.06:0,.09);}
const mBase=new T.Vector3(0,.23,-.5),catBase=new T.Vector3(0,.37,-1.1);
function animHero(dt){const H=W.hero,t=G.t,play=G.state==='play';
  P.run+=((play?Math.min(1,P.sp/4.6):0)-P.run)*Math.min(1,dt*10);const run=P.run;P.ph+=P.sp*dt*2.6;
  H.g.position.set(P.x,0,P.z);H.g.rotation.y=P.yaw;H.g.visible=!(G.inv>0&&play&&Math.sin(t*40)>.3&&P.dash<=0);
  H.feet.forEach((f,i)=>{const ph=P.ph+(i?Math.PI:0),c=Math.max(0,Math.cos(ph));f.position.z=Math.sin(ph)*.15*run;f.position.y=c*.09*run;f.rotation.x=-c*.6*run;});
  H.U.position.y=Math.abs(Math.sin(P.ph))*.035*run;H.U.rotation.x=.16*run+(P.dash>0?.45:0);
  H.head.rotation.set(-.12*run+Math.sin(t*.8)*.04*(1-run),Math.sin(t*.5)*.3*(1-run),0);
  chain(H.tailT,mBase,.05,.15,-.45,i=>.085*(1-run*.8)+Math.sin(t*(1.4+run*8)-i*.3)*(.035+run*.03),i=>i>22?.09:0,.05);
  const ca=H.cape.geometry.attributes.position,cb=H.capeBase,fl=1+run*1.6;
  for(let i=0;i<ca.count;i++){const x=cb[i*3],y=cb[i*3+1],v=.5-y;ca.setXYZ(i,x*(.7+v*.65),-v*(1-run*.25),-(.02+v*(.45+run*.35))-Math.sin(t*2.4*fl+v*4.5+x*2.5)*.07*v*fl-Math.abs(x)*.28*(1-v));}
  ca.needsUpdate=true;H.cape.geometry.computeVertexNormals();
  H.blk+=((In.shd&&play?1:0)-H.blk)*Math.min(1,dt*14);const b=H.blk,sw=Math.sin(P.ph)*.5*run;
  let ax=-.35-sw,az=-.45,sx=Math.PI/2-.75,sz=.6;const q0=(t-P.atk)/.5;H.slash.material.opacity=0;
  if(q0>=0&&q0<1){sz=0;sx=Math.PI/2-.4;if(q0<.3)ax=-.35-2.4*(q0/.3);else if(q0<.6){const q=(q0-.3)/.3;ax=-2.75+3.3*q;H.slash.material.opacity=(1-Math.abs(q-.5)*2)*.9;}else ax=.55-.9*((q0-.6)/.4);}
  H.armR.rotation.set(ax,0,az);H.sword.rotation.set(sx,0,sz);
  H.armL.rotation.set((-.5+sw)*(1-b)-1.2*b,-.1*(1-b)-.45*b,.35*(1-b)+.05*b);H.shield.rotation.x=.5*(1-b)+1.2*b;}
function updateCamera(dt){
  const portrait=camera.aspect<1;
  if(G.state==='intro'||G.state==='win'){const a=Math.sin(G.t*.2)*.25;camera.position.set(-1.2+Math.sin(a)*5.5,portrait?2.6:2,-3.6+Math.cos(a)*(portrait?7:5.4));camera.lookAt(-2.6,1.3,-5);return;}
  if(P.sp>.5&&G.t-cam.manual>1.2){const d=angd(P.yaw,cam.yaw);if(Math.abs(d)<2.5)cam.yaw+=d*Math.min(1,dt*1.1);}
  const d=portrait?7.2:5.8,cp=Math.cos(cam.pitch),fx=Math.sin(cam.yaw),fz=Math.cos(cam.yaw);
  let cx=P.x-fx*d*cp,cz=P.z-fz*d*cp,cy=1.3+Math.sin(cam.pitch)*d;
  cx=Math.max(-15.8,Math.min(15.8,cx));cz=Math.max(-6.5,Math.min(25.8,cz));
  const hd=hyp(P.x-cx,P.z-cz);if(hd<3.2)cy+=(3.2-hd)*1.3;
  if(G.shake>0){const s=G.shake*.35;cx+=(Math.random()-.5)*s;cy+=(Math.random()-.5)*s;G.shake-=dt*1.6;}
  camera.position.set(cx,cy,cz);camera.lookAt(P.x+fx*2.2,1.4+(Ct.awake&&!G.catGone?.7:0),P.z+fz*2.2);}
function step(dt){
  G.t+=dt;if(G.inv>0)G.inv-=dt;if(G.t>G.msgT)$('toast').style.opacity=0;
  if(G.state==='play'){updatePlayer(dt);updateHuman(dt);if(G.state==='play'){if(Ct.awake||Ct.state==='leap')updateCat(dt);else updateCat(0);}}
  else updateCat(0);
  if(G.state==='intro'||G.state==='win'){P.yaw+=angd(G.state==='win'?-2.6:0,P.yaw)*Math.min(1,dt*4);P.sp=0;if(G.state==='win'){P.x+=(-1.9-P.x)*dt*2;P.z+=(-4.4-P.z)*dt*2;}}
  if(G.state==='dead')P.sp=0;
  updateTraps();animHero(dt);
  W.fam.forEach((m,i)=>{const ex=G.state==='win'?3:1;m.position.y=Math.abs(Math.sin(G.t*2*ex+i*1.7))*.04*ex*(i?1:.5);m.userData.head.rotation.y=Math.sin(G.t*.9+i)*.25;});
  W.crumbs.forEach((c,i)=>{c.g.rotation.y=G.t*.5+i;});
  const st=G.t-(W.spark.userData.t||-9);W.spark.material.opacity=st<.22?1-st/.22:0;W.spark.scale.setScalar(.4+st*7);
  W.key.position.set(P.x+7,12,P.z+1);W.key.target.position.set(P.x,0,P.z);
  W.fill.position.set(P.x-Math.sin(cam.yaw)*2.5,4,P.z-Math.cos(cam.yaw)*2.5);
  W.dust.rotation.y=Math.sin(G.t*.05)*.05;W.dust.position.y=Math.sin(G.t*.2)*.4;W.shafts.forEach((m,i)=>m.material.opacity=.08+Math.sin(G.t*.5+i)*.02);
  updateCamera(dt);}
