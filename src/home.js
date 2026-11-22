/* ═════════ the home inside the wall, and the family ═════════ */
/* A separate scene that sits, in world coordinates, right behind the kitchen's mousehole (the doorway lines up
   with the hole at x=-3.2), so positional sounds stay consistent when a cutscene cuts between the two. */
const HM={door:[-3.2,-7.6],table:[-3.4,-11.5],top:1.1,bed:[-7,-13.5],candle:[-3.9,-11.8],bowl:[-3.05,-11.3],seat:[-6,-11.5],X0:-9,X1:3,Z0:-16,Z1:-7.25,H:5.2};

function plasterTex(){const c=cv(512,512),g=c.getContext('2d'),r=rnd(11);g.fillStyle='#6b5240';g.fillRect(0,0,512,512);
  for(let i=0;i<900;i++){const x=r()*512,y=r()*512,s=4+r()*40;g.globalAlpha=.05+r()*.07;g.fillStyle=r()>.5?'#3a2a1e':'#8a6e56';g.beginPath();g.ellipse(x,y,s,s*(.4+r()*.6),r()*3,0,7);g.fill();}
  g.globalAlpha=.55;g.strokeStyle='#2a1d14';g.lineWidth=1.2;for(let i=0;i<7;i++){let x=r()*512,y=r()*512;g.beginPath();g.moveTo(x,y);for(let k=0;k<9;k++){x+=(r()-.5)*40;y+=r()*30;g.lineTo(x,y);}g.stroke();}
  g.globalAlpha=1;return tex(c,2,1.2);}
function knitTex(a,b){const c=cv(128,128),g=c.getContext('2d');g.fillStyle=b;g.fillRect(0,0,128,128);
  for(let y=0;y<16;y++){const row=(y>>2)%3===1;for(let x=0;x<16;x++){g.fillStyle=row?a:(x+y)%7===0?'#00000022':b;
    g.beginPath();g.ellipse(x*8+2.4,y*8+4,2.6,4.2,.5,0,7);g.fill();g.beginPath();g.ellipse(x*8+5.6,y*8+4,2.6,4.2,-.5,0,7);g.fill();}}
  g.globalAlpha=.25;g.fillStyle='#000';for(let x=0;x<16;x++)g.fillRect(x*8+3.6,0,.8,128);g.globalAlpha=1;return tex(c,4,4);}
/* a postage stamp in a frame: the sun coming up over the hills — the title's 볕 */
function stampTex(){const c=cv(256,320),g=c.getContext('2d');g.fillStyle='#e9dfc6';g.fillRect(0,0,256,320);
  g.fillStyle='#3a2a1e';for(let x=8;x<256;x+=16){g.beginPath();g.arc(x,0,5,0,7);g.arc(x,320,5,0,7);g.fill();}for(let y=8;y<320;y+=16){g.beginPath();g.arc(0,y,5,0,7);g.arc(256,y,5,0,7);g.fill();}
  const sky=g.createLinearGradient(0,30,0,250);sky.addColorStop(0,'#5d7fa6');sky.addColorStop(.7,'#e8b878');sky.addColorStop(1,'#f3d39a');g.fillStyle=sky;g.fillRect(24,28,208,230);
  g.fillStyle='#f7e08a';g.beginPath();g.arc(128,200,46,0,7);g.fill();g.strokeStyle='#f7e08a';g.lineWidth=4;for(let i=0;i<9;i++){const a=Math.PI+i*Math.PI/8;g.beginPath();g.moveTo(128+Math.cos(a)*58,200+Math.sin(a)*58);g.lineTo(128+Math.cos(a)*78,200+Math.sin(a)*78);g.stroke();}
  g.fillStyle='#4a5a3a';g.beginPath();g.moveTo(24,258);g.quadraticCurveTo(90,170,150,230);g.quadraticCurveTo(200,190,232,215);g.lineTo(232,258);g.fill();
  g.fillStyle='#2f3d28';g.beginPath();g.moveTo(24,258);g.quadraticCurveTo(120,215,232,250);g.lineTo(232,258);g.fill();
  g.fillStyle='#3a2a1e';g.font='bold 30px serif';g.fillText('10',34,296);g.font='22px serif';g.fillText('볕',196,294);return tex(c);}
function labelTex(){const c=cv(256,128),g=c.getContext('2d');g.fillStyle='#7a1e18';g.fillRect(0,0,256,128);g.strokeStyle='#e8d3a0';g.lineWidth=4;g.strokeRect(8,8,240,112);
  g.fillStyle='#e8d3a0';g.beginPath();g.moveTo(52,96);g.quadraticCurveTo(30,64,52,30);g.quadraticCurveTo(58,56,70,50);g.quadraticCurveTo(76,78,52,96);g.fill();
  g.font='bold 40px serif';g.fillText('성 냥',96,78);g.fillRect(96,90,130,3);return tex(c);}
function threadTex(){const c=cv(64,256),g=c.getContext('2d');g.fillStyle='#7a2420';g.fillRect(0,0,64,256);for(let y=0;y<256;y+=3){g.fillStyle=y%6?'#8e2e28':'#5e1a16';g.fillRect(0,y,64,1.5);}return tex(c);}
function doorTex(){const c=cv(128,128),g=c.getContext('2d'),a=g.createLinearGradient(0,0,0,128);a.addColorStop(0,'#05070c');a.addColorStop(.55,'#1b2740');a.addColorStop(1,'#3c5478');g.fillStyle=a;g.fillRect(0,0,128,128);
  g.globalAlpha=.25;g.fillStyle='#8fb2ff';g.fillRect(40,90,60,38);return tex(c);}
function glowTex(){const c=cv(64,64),g=c.getContext('2d'),a=g.createRadialGradient(32,32,0,32,32,32);a.addColorStop(0,'rgba(255,220,150,1)');a.addColorStop(.25,'rgba(255,160,60,.45)');a.addColorStop(1,'rgba(255,120,40,0)');g.fillStyle=a;g.fillRect(0,0,64,64);return tex(c);}

function buildHome(){const s=W.home=new T.Scene(),h=HM;s.background=new T.Color(0x040302);s.fog=new T.Fog(0x0a0705,8,24);
  s.add(new T.HemisphereLight(0x6a5040,0x140d08,.5));const fill=new T.PointLight(0xc89070,.55,16,1.5);fill.position.set(-1,4,-8.6);s.add(fill);
  const w=h.X1-h.X0,d=h.Z1-h.Z0,cx=(h.X0+h.X1)/2,cz=(h.Z0+h.Z1)/2;
  const fl=new T.Mesh(new T.PlaneGeometry(w,d),sm(0xb89070,{map:plankTex(),roughness:.8}));fl.material.map.repeat.set(2.2,1.6);fl.rotation.x=-Math.PI/2;fl.position.set(cx,0,cz);fl.receiveShadow=true;s.add(fl);
  const pm=sm(0xffffff,{map:plasterTex(),roughness:.95}),wall=(x,z,ry,len)=>{const m=new T.Mesh(new T.PlaneGeometry(len,h.H),pm);m.position.set(x,h.H/2,z);m.rotation.y=ry;m.receiveShadow=true;s.add(m);};
  wall(cx,h.Z0,0,w);wall(h.X0,cz,Math.PI/2,d);wall(h.X1,cz,-Math.PI/2,d);
  /* front wall with the arched doorway (same size as the kitchen hole) */
  const fw=new T.Shape(),dx=-(-3.2-cx),dw=1.7,dh=1.85;fw.moveTo(-w/2,0);fw.lineTo(w/2,0);fw.lineTo(w/2,h.H);fw.lineTo(-w/2,h.H);fw.lineTo(-w/2,0);
  const ho=new T.Path();ho.moveTo(dx-dw/2,0);ho.lineTo(dx-dw/2,dh-dw/2);ho.absarc(dx,dh-dw/2,dw/2,Math.PI,0,true);ho.lineTo(dx+dw/2,0);ho.lineTo(dx-dw/2,0);fw.holes.push(ho);
  const fg=new T.ShapeGeometry(fw,24),fuv=fg.attributes.uv,fp=fg.attributes.position;for(let i=0;i<fuv.count;i++)fuv.setXY(i,fp.getX(i)/w+.5,fp.getY(i)/h.H);
  const fm=new T.Mesh(fg,pm);fm.position.set(cx,0,h.Z1);fm.rotation.y=Math.PI;fm.receiveShadow=true;s.add(fm);
  const beyond=new T.Mesh(new T.PlaneGeometry(3,3),new T.MeshBasicMaterial({map:doorTex(),fog:false}));beyond.position.set(-3.2,1.4,h.Z1+.4);beyond.rotation.y=Math.PI;s.add(beyond);
  s.add(at(M(new T.BoxGeometry(2.1,.08,.5),sm(0x4a3626)),-3.2,.04,h.Z1-.15));
  const ceil=new T.Mesh(new T.PlaneGeometry(w,d),sm(0x2a1e16,{roughness:1}));ceil.rotation.x=Math.PI/2;ceil.position.set(cx,h.H,cz);s.add(ceil);
  /* studs and beams: the inside of a wall */
  const wood=sm(0x5a4030,{roughness:.85}),dark=sm(0x3a2a1e,{roughness:.9});
  [-8.6,-5.2,-1.2,2.6].forEach(x=>s.add(at(M(new T.BoxGeometry(.38,h.H,.3),wood),x,h.H/2,h.Z0+.15)));
  [-14.2,-10.4].forEach(z=>{s.add(at(M(new T.BoxGeometry(.3,h.H,.38),wood),h.X0+.15,h.H/2,z));s.add(at(M(new T.BoxGeometry(.3,h.H,.38),wood),h.X1-.15,h.H/2,z));});
  s.add(at(M(new T.BoxGeometry(w,.4,.45),dark),cx,h.H-.2,-12));
  /* rug and spool table */
  const rug=new T.Mesh(new T.CircleGeometry(2.2,48),sm(0xffffff,{map:knitTex('#8a6a3a','#5a3a2a'),roughness:1}));rug.rotation.x=-Math.PI/2;rug.position.set(h.table[0],.012,h.table[1]);rug.receiveShadow=true;s.add(rug);
  const sp=new T.Group(),sw=sm(0xa07a54,{roughness:.6});sp.position.set(h.table[0],0,h.table[1]);s.add(sp);
  sp.add(at(M(new T.CylinderGeometry(1.08,1.08,.12,48),sw),0,.06,0));sp.add(at(M(new T.CylinderGeometry(1.08,1.08,.12,48),sw),0,h.top-.06,0));
  sp.add(at(M(new T.CylinderGeometry(.62,.62,h.top-.24,40,1,true),sm(0xffffff,{map:threadTex(),roughness:.9})),0,h.top/2,0));
  /* thimble bowl, candle stub, bottle-cap stools */
  const lp=[];for(let i=0;i<=12;i++){const t=i/12;lp.push(new T.Vector2(.17+.05*t,.3*t));}lp.push(new T.Vector2(.205,.3),new T.Vector2(.19,.04),new T.Vector2(0,.04));
  const th=M(new T.LatheGeometry(lp,32),metal(0xbdb5a6,.45));th.position.set(h.bowl[0],h.top,h.bowl[1]);s.add(th);
  const cd=new T.Group();cd.position.set(h.candle[0],h.top,h.candle[1]);s.add(cd);const wax=sm(0xeadfc4,{roughness:.55,emissive:0x2a1608});
  cd.add(at(M(new T.CylinderGeometry(.15,.17,.42,24),wax),0,.21,0));[[.12,.33,.05,.05],[-.09,.25,.1,.06],[.05,.12,-.14,.05]].forEach(q=>cd.add(at(M(new T.SphereGeometry(q[3],10,8),wax),q[0],q[1],q[2],1,1.6,1)));
  cd.add(at(M(new T.CylinderGeometry(.008,.008,.07,6),sm(0x111111)),0,.45,0));
  const fmat=new T.MeshBasicMaterial({color:0xffb050,transparent:true,opacity:.9,blending:T.AdditiveBlending,depthWrite:false,fog:false});
  W.flame=at(new T.Mesh(new T.SphereGeometry(1,12,10),fmat),0,.55,0,.045,.11,.045);cd.add(W.flame);
  W.flame.add(at(new T.Mesh(new T.SphereGeometry(1,10,8),new T.MeshBasicMaterial({color:0xfff4d0,blending:T.AdditiveBlending,depthWrite:false,fog:false})),0,-.25,0,.55,.5,.55));
  W.halo=new T.Sprite(new T.SpriteMaterial({map:glowTex(),blending:T.AdditiveBlending,depthWrite:false,transparent:true,opacity:.55,fog:false}));W.halo.position.set(0,.56,0);W.halo.scale.set(1.3,1.3,1);cd.add(W.halo);
  const cl=W.candle=new T.PointLight(0xff9a48,2.6,14,2);cl.position.set(h.candle[0],h.top+.62,h.candle[1]);cl.castShadow=true;cl.shadow.mapSize.set(512,512);cl.shadow.bias=-.004;cl.shadow.camera.near=.1;s.add(cl);
  const dl=W.doorL=new T.PointLight(0x7090ff,.9,7,2);dl.position.set(-3.2,1.2,h.Z1-.5);s.add(dl);
  const capG=new T.CylinderGeometry(.42,.42,.28,48,2),cpp=capG.attributes.position;for(let i=0;i<cpp.count;i++){const y=cpp.getY(i),a=Math.atan2(cpp.getZ(i),cpp.getX(i)),k=y<0?1.06+.04*Math.cos(a*21):1;cpp.setX(i,cpp.getX(i)*k);cpp.setZ(i,cpp.getZ(i)*k);}capG.computeVertexNormals();
  const capM=sm(0x8a2a20,{metalness:.6,roughness:.45,envMapIntensity:1.2});[[-2.05,-12.55],[-3.75,-13.15],[-6,-11.5]].forEach(q=>s.add(at(M(capG,capM),q[0],.14,q[1])));
  /* the bed: a matchbox drawer with a cotton-ball pillow and a knitted blanket; the sleeve stands as headboard */
  const bd=new T.Group();bd.position.set(h.bed[0],0,h.bed[1]);bd.rotation.y=.12;s.add(bd);const cb=sm(0xb88a58,{roughness:.9});
  bd.add(at(M(new T.BoxGeometry(3,.06,2.1),cb),0,.03,0));[[0,.3,1.05,3,.6,.05],[0,.3,-1.05,3,.6,.05],[1.5,.3,0,.05,.6,2.1],[-1.5,.3,0,.05,.6,2.1]].forEach(q=>bd.add(at(M(new T.BoxGeometry(q[3],q[4],q[5]),cb),q[0],q[1],q[2])));
  const sl=at(M(new T.BoxGeometry(3.06,2.2,.66),cb),0,1.1,-1.42);bd.add(sl);
  const lb=new T.Mesh(new T.PlaneGeometry(2.4,1.2),sm(0xffffff,{map:labelTex(),roughness:.8}));lb.position.set(0,1.25,-1.08);bd.add(lb);
  bd.add(at(M(new T.SphereGeometry(.42,20,16),sm(0xf2eee6,{roughness:1})),0,.3,-.5,2.9,.45,1));
  const bg=new T.PlaneGeometry(2.9,1.05,24,12),bp=bg.attributes.position;for(let i=0;i<bp.count;i++){const x=bp.getX(i),y=bp.getY(i),e=Math.max(Math.abs(x)/1.45,y<0?-y/.525:0);bp.setZ(i,-Math.pow(Math.max(0,e-.7)/.3,2)*.42+.05*Math.cos(x*6.5)+Math.sin(x*5)*.02+Math.sin(y*7+x*2)*.015);}bg.computeVertexNormals();
  W.blanket=at(M(bg,sm(0xffffff,{map:knitTex('#e8d8b8','#9a3a2a'),roughness:1,side:T.DoubleSide})),0,.92,.62);W.blanket.rotation.x=-Math.PI/2;bd.add(W.blanket);
  /* a stamp hung as a painting, and a sewing needle — the old sword — against the wall */
  const fr=new T.Group();fr.position.set(-3.4,2.9,h.Z0+.06);s.add(fr);fr.add(at(M(new T.BoxGeometry(1.4,1.72,.06),dark),0,0,0));fr.add(at(new T.Mesh(new T.PlaneGeometry(1.15,1.44),sm(0xffffff,{map:stampTex(),roughness:.8})),0,0,.04));
  const nd=M(new T.CylinderGeometry(.03,.006,3.4,10),metal(0xd8dde4,.25));nd.position.set(2.45,1.65,-14.6);nd.rotation.z=.18;s.add(nd);
  /* tonight's food appears on the table on the way home */
  const fd=W.homeFood=new T.Group(),ch=sm(0xf2c24e,{roughness:.55,emissive:0x2a1800});fd.visible=false;s.add(fd);
  [[0,.22,0,0],[.28,.06,.18,1.2],[-.3,.06,.12,2.5],[.12,.06,-.32,4],[-.2,.08,-.28,5.2]].forEach(q=>{const m=M(new T.CylinderGeometry(.15,.15,.12,1,1,false,0,1.1),ch);m.position.set(h.bowl[0]+q[0],h.top+q[1],h.bowl[1]+q[2]);m.rotation.y=q[3];fd.add(m);});
  /* chapter 2: the roof leaks into a bottle cap on the floor */
  const hd=W.homeDrip=new T.Group();hd.visible=false;s.add(hd);hd.add(at(M(capG,sm(0x2a5a7a,{metalness:.6,roughness:.4,envMapIntensity:1.2})),-5.8,.14,-9.2));
  const hw=new T.Mesh(new T.CircleGeometry(.38,24),sm(0x0b1018,{roughness:.05,metalness:.5,envMapIntensity:1.5}));hw.rotation.x=-Math.PI/2;hw.position.set(-5.8,.29,-9.2);hd.add(hw);
  const hp2=new T.Mesh(new T.CircleGeometry(.9,24),sm(0x0b1018,{roughness:.05,metalness:.5,transparent:true,opacity:.7,polygonOffset:true,polygonOffsetFactor:-2}));hp2.rotation.x=-Math.PI/2;hp2.position.set(-5.6,.013,-9.0);hd.add(hp2);
  W.hDrop=new T.Mesh(new T.SphereGeometry(.035,8,6),new T.MeshBasicMaterial({color:0xbcd0f0,fog:false}));W.hDrop.scale.y=2.4;hd.add(W.hDrop);
  const n=140,p=new Float32Array(n*3),r=rnd(9);for(let i=0;i<n;i++){p[i*3]=h.X0+r()*w;p[i*3+1]=r()*h.H;p[i*3+2]=h.Z0+r()*d;}
  const dg=new T.BufferGeometry();dg.setAttribute('position',new T.BufferAttribute(p,3));W.hdust=new T.Points(dg,new T.PointsMaterial({color:0xffc890,size:.03,transparent:true,opacity:.5,blending:T.AdditiveBlending,depthWrite:false}));s.add(W.hdust);
  /* the family */
  W.kin=[{fur:0x8c6c52,belly:0xe4d4be,skin:0xd09a90,s:1.36,shawl:0xcfc0a0,apron:1},{fur:0x6a5442,belly:0xd2c0a8,skin:0xc48a82,s:.95,head:1.2,scarf:['#9ab0d0','#3c5a80']},
    {fur:0x8a7058,belly:0xdccab2,skin:0xcc948c,s:.82,head:1.24,scarf:['#e0c070','#8a6a28']},{fur:0xa8967f,belly:0xe8dccb,skin:0xd8aaa2,s:.68,head:1.3}].map(o=>{const R=buildKin(o);s.add(R.g);return R;});}

function buildKin(o){const m={fur:hx(o.fur),belly:hx(o.belly),skin:hx(o.skin)},g=new T.Group(),U=new T.Group(),R={g,U,o,atk:-1,blk:0};g.add(U);g.rotation.order='YXZ';
  const rg=R.rig=makeRig([['hips',null,[0,.36,-.03]],['chest','hips',[0,.6,0]],['neck','chest',[0,.86,0]],['head','neck',[0,.98,.03]],
    ['thighL','hips',[.2,.42,-.02]],['thighR','hips',[-.2,.42,-.02]]],U,g,22);R.B=rg.B;
  mouseCore(m,R,rg);R.head.scale.setScalar(o.head||1);R.armR.rotation.order='YXZ';
  const cloth=(c,k)=>sm(0xffffff,{map:k,color:c,roughness:1});
  if(o.scarf){const sc=M(new T.TorusGeometry(.2,.07,10,24),cloth(0xffffff,knitTex(o.scarf[0],o.scarf[1])));sc.rotation.x=Math.PI/2;at(sc,0,.08,.02,1,1,.75);R.B.neck.add(sc);}
  if(o.shawl){const sc=M(new T.TorusGeometry(.22,.075,10,24),sm(o.shawl,{roughness:1}));sc.rotation.x=Math.PI/2;at(sc,0,.06,.02,1,1,.8);R.B.neck.add(sc);}
  if(o.apron){const ap=M(new T.CylinderGeometry(.29,.41,.52,20,1,true,-.95,1.9),sm(0xd8ccb0,{map:knitTex('#cfc2a4','#e2d8c0'),roughness:1,side:T.DoubleSide}));ap.position.set(0,.17,.02);R.B.hips.add(ap);
    R.B.hips.add(at(M(new T.TorusGeometry(.3,.018,6,30),sm(0x8a6a4a)),0,.4,.0,1,1,1.05).rotateX(Math.PI/2));}
  g.scale.setScalar(o.s);g.traverse(c=>{if(FURS.indexOf(c)>=0)c.userData.k=o.s<1?.6:.8;if(c.isSkinnedMesh)c.frustumCulled=true;});   /* small on screen: fewer fur shells */
  R.st={x:0,z:0,y:0,yaw:0,lie:0,roll:0,sit:0,eye:1,look:null,al:null,ar:null,cough:-9,ph:0,mv:0,px:null,pz:null,lean:0,hdx:0};
  return R;}

/* family animation: hop when moving, breathe, look at a point, sit, lie in bed, cough */
function animKin(dt){if(!W.kin)return;const t=G.t;
  W.kin.forEach((R,i)=>{const k=R.st,B=R.B,s=R.o.s;if(k.px===null){k.px=k.x;k.pz=k.z;}
    const dx=k.x-k.px,dz=k.z-k.pz,v=dt>0?hyp(dx,dz)/dt:0;k.px=k.x;k.pz=k.z;
    k.mv+=((v>.3?1:0)-k.mv)*Math.min(1,dt*8);if(v>.3){k.ph+=dt*(4.5+i*.4);k.yaw+=angd(Math.atan2(dx,dz),k.yaw)*Math.min(1,dt*10);}
    const hop=Math.abs(Math.sin(k.ph*Math.PI))*.16*s*k.mv,lie=k.lie;
    R.g.position.set(k.x+(k.shiver?Math.sin(t*41+i*2)*.014*s:0),k.y+hop+lie*.4*s,k.z);R.g.rotation.set(-1.5708*lie,k.yaw,k.roll*lie);
    const br=Math.sin(t*(lie>.5?1.5:2.3)+i*1.3),cg=t-k.cough,ck=cg>0&&cg<.7?Math.sin(Math.min(1,cg/.35)*Math.PI)*(cg<.35?1:.6):0;
    const p0=B.hips.userData.p0,hy=-.17*k.sit;B.hips.position.set(p0.x,p0.y+hy,p0.z);
    const crx=.15*k.mv+.4*ck+k.lean+.12*k.sit+(k.nod||0)*Math.max(0,Math.sin(t*3.2+i*1.9));B.chest.rotation.set(crx,0,0);B.chest.scale.set(1+.025*br,1+.03*br,1+.025*br);B.neck.rotation.x=-.45*crx+.25*ck;
    let hx=0,hyw=0;if(k.look&&lie<.5){const L=k.look,lx=L[0]-k.x,lz=L[2]-k.z,ly=L[1]-(k.y+1.05*s);hyw=Math.max(-1.1,Math.min(1.1,angd(Math.atan2(lx,lz),k.yaw)));hx=Math.max(-.5,Math.min(.6,-Math.atan2(ly,hyp(lx,lz))))-.5*crx;}
    hyw+=Math.sin(t*.55+i*2.1)*.1*(1-lie);R.head.rotation.set(hx+k.hdx,hyw,0);
    const bl=((t+i*1.7)%4.3)<.13?.1:1;R.eyes.forEach(e=>e.scale.y=Math.max(.08,k.eye*bl));
    [B.thighL,B.thighR].forEach(th=>{th.rotation.x=-1.35*k.sit;});R.feet.forEach(f=>{f.position.z=.3*k.sit;f.position.y=.14*k.sit;f.rotation.x=-.4*k.sit;});
    const sw=Math.sin(k.ph*Math.PI*2)*.5*k.mv;
    if(k.ar)R.armR.rotation.set(k.ar[0],k.ar[1],k.ar[2]);else R.armR.rotation.set(-.35+sw-.5*k.sit,0,-.35);
    if(k.al)R.armL.rotation.set(k.al[0],k.al[1],k.al[2]);else R.armL.rotation.set(-.35-sw-.5*k.sit,0,.35);
    chain(R.tailT,new T.Vector3(mBase.x,mBase.y+hy,mBase.z),.05,.15,-.45,j=>.085+Math.sin(t*(1.2+i*.2)-j*.3+i)*.04*(1-lie*.7),j=>j>22?.09:0,.05);});}

/* candle flicker, dust drift; the shadow-casting candle only when the home is on screen */
function homeStep(dt){if(!W.home)return;const t=G.t,f=.86+.08*Math.sin(t*13.1)+.05*Math.sin(t*29.7+1)+.04*Math.sin(t*7.3+2);
  W.candle.intensity=2.2*f*(W.homeFood.visible?1.15:1);W.flame.scale.set(.045,.11*(.9+.15*f),.045);W.flame.rotation.z=Math.sin(t*3.1)*.08;W.halo.material.opacity=.45*f;
  if(W.homeDrip.visible){const c=(t%1.3)/1.3,pc=W.hdc===undefined?c:W.hdc;W.hdc=c;W.hDrop.visible=c<.6;W.hDrop.position.set(-5.8,.3+(HM.H-.3)*(1-Math.pow(Math.min(1,c/.6),2)),-9.2);
    if(pc<.6&&c>=.6&&W.cur===W.home)sfx('plip',[-5.8,.3,-9.2,3]);}
  W.hdust.rotation.y=Math.sin(t*.04)*.03;W.hdust.position.y=Math.sin(t*.25)*.15;}
