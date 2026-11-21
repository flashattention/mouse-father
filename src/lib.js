const hx=h=>[(h>>16&255)/255,(h>>8&255)/255,(h&255)/255];
const mix3=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];
const sst=(a,b,x)=>{let t=(x-a)/(b-a);t=t<0?0:t>1?1:t;return t*t*(3-2*t);};
function rnd(seed){let s=seed;return()=>{s=(s*16807)%2147483647;return s/2147483647;};}

/* ═════════ SDF sculpting: smooth-blended ellipsoids and tapered capsules ═════════ */
const E=(c,r,o)=>Object.assign({t:0,c,r,k:.08},o||{});
const C=(a,b,ra,rb,o)=>Object.assign({t:1,a,b,ra,rb,k:.08},o||{});
function prep(p){
  if(p.t===0&&p.rot){const e=new T.Matrix4().makeRotationFromEuler(new T.Euler(p.rot[0],p.rot[1],p.rot[2])).elements;p.m=[e[0],e[1],e[2],e[4],e[5],e[6],e[8],e[9],e[10]];}
  if(p.t===1){p.d=[p.b[0]-p.a[0],p.b[1]-p.a[1],p.b[2]-p.a[2]];p.il=1/(p.d[0]*p.d[0]+p.d[1]*p.d[1]+p.d[2]*p.d[2]);}
  return p;}
function pd(p,x,y,z){
  if(p.sym)x=x<0?-x:x;
  if(p.t===0){let px=x-p.c[0],py=y-p.c[1],pz=z-p.c[2];const m=p.m;
    if(m){const qx=m[0]*px+m[1]*py+m[2]*pz,qy=m[3]*px+m[4]*py+m[5]*pz,qz=m[6]*px+m[7]*py+m[8]*pz;px=qx;py=qy;pz=qz;}
    const r=p.r,ax=px/r[0],ay=py/r[1],az=pz/r[2],k0=Math.sqrt(ax*ax+ay*ay+az*az),bx=ax/r[0],by=ay/r[1],bz=az/r[2],k1=Math.sqrt(bx*bx+by*by+bz*bz);
    return k1<1e-9?-Math.min(r[0],r[1],r[2]):k0*(k0-1)/k1;}
  const a=p.a,d=p.d;let px=x-a[0],py=y-a[1],pz=z-a[2],t=(px*d[0]+py*d[1]+pz*d[2])*p.il;t=t<0?0:t>1?1:t;
  px-=d[0]*t;py-=d[1]*t;pz-=d[2]*t;return Math.sqrt(px*px+py*py+pz*pz)-(p.ra+(p.rb-p.ra)*t);}
function makeSDF(prims){const n=prims.length;
  return function(x,y,z){let d=1e9;
    for(let i=0;i<n;i++){const p=prims[i],di=pd(p,x,y,z),k=p.k;
      if(p.sub){let h=k-Math.abs(-di-d);h=h>0?h/k:0;d=(d>-di?d:-di)+h*h*k*.25;}
      else if(d>1e8)d=di;
      else{let h=k-Math.abs(di-d);h=h>0?h/k:0;d=(d<di?d:di)-h*h*k*.25;}}
    return d;};}
function bounds(prims,pad){const lo=[9,9,9],hi=[-9,-9,-9];
  prims.forEach(p=>{if(p.sub)return;const pts=p.t===0?[[p.c,Math.max(p.r[0],p.r[1],p.r[2])]]:[[p.a,p.ra],[p.b,p.rb]];
    pts.forEach(q=>{for(let s=p.sym?-1:1;s<=1;s+=2)for(let i=0;i<3;i++){const v=i===0?q[0][0]*s:q[0][i];lo[i]=Math.min(lo[i],v-q[1]);hi[i]=Math.max(hi[i],v+q[1]);}});});
  for(let i=0;i<3;i++){lo[i]-=pad;hi[i]+=pad;}return[lo,hi];}
/* naive surface nets → indexed smooth mesh (plain arrays only: this also runs inside the sculpt workers) */
function polyCore(sdf,lo,hi,cell){
  const nx=Math.ceil((hi[0]-lo[0])/cell)+1,ny=Math.ceil((hi[1]-lo[1])/cell)+1,nz=Math.ceil((hi[2]-lo[2])/cell)+1,g=new Float32Array(nx*ny*nz);
  for(let k=0,q=0;k<nz;k++)for(let j=0;j<ny;j++)for(let i=0;i<nx;i++,q++)g[q]=sdf(lo[0]+i*cell,lo[1]+j*cell,lo[2]+k*cell);
  const cx=nx-1,cy=ny-1,vid=new Int32Array(cx*cy*(nz-1)).fill(-1),pos=[],idx=[],sx=1,sy=nx,sz=nx*ny;
  const co=[0,sx,sy,sx+sy,sz,sz+sx,sz+sy,sz+sx+sy],cp=[[0,0,0],[1,0,0],[0,1,0],[1,1,0],[0,0,1],[1,0,1],[0,1,1],[1,1,1]];
  const ed=[[0,1],[2,3],[4,5],[6,7],[0,2],[1,3],[4,6],[5,7],[0,4],[1,5],[2,6],[3,7]],v=new Float32Array(8);
  for(let k=0;k<nz-1;k++)for(let j=0;j<cy;j++)for(let i=0;i<cx;i++){
    const b=i+j*sy+k*sz;let m=0;for(let c=0;c<8;c++){v[c]=g[b+co[c]];if(v[c]<0)m|=1<<c;}
    if(m===0||m===255)continue;let px=0,py=0,pz=0,n=0;
    for(let e=0;e<12;e++){const a=ed[e][0],c=ed[e][1];if((v[a]<0)===(v[c]<0))continue;const t=v[a]/(v[a]-v[c]);
      px+=cp[a][0]+(cp[c][0]-cp[a][0])*t;py+=cp[a][1]+(cp[c][1]-cp[a][1])*t;pz+=cp[a][2]+(cp[c][2]-cp[a][2])*t;n++;}
    vid[i+j*cx+k*cx*cy]=pos.length/3;pos.push(lo[0]+(i+px/n)*cell,lo[1]+(j+py/n)*cell,lo[2]+(k+pz/n)*cell);}
  const V=(i,j,k)=>vid[i+j*cx+k*cx*cy];
  const quad=(a,b,c,d,flip)=>{if(a<0||b<0||c<0||d<0)return;if(flip)idx.push(a,c,b,a,d,c);else idx.push(a,b,c,a,c,d);};
  for(let k=1;k<nz-1;k++)for(let j=1;j<ny-1;j++)for(let i=1;i<nx-1;i++){const b=i+j*sy+k*sz,s=g[b]<0;
    if(i<nx-1&&s!==(g[b+sx]<0))quad(V(i,j-1,k-1),V(i,j,k-1),V(i,j,k),V(i,j-1,k),!s);
    if(j<ny-1&&s!==(g[b+sy]<0))quad(V(i-1,j,k-1),V(i-1,j,k),V(i,j,k),V(i,j,k-1),!s);
    if(k<nz-1&&s!==(g[b+sz]<0))quad(V(i-1,j-1,k),V(i,j-1,k),V(i,j,k),V(i-1,j,k),!s);}
  return{pos:new Float32Array(pos),idx:pos.length/3>65535?new Uint32Array(idx):new Uint16Array(idx)};}
/* per-vertex colour and fur length from the nearest primitives, then a part-specific tint */
function paint(geo,prims,base,tint){const P=geo.attributes.position,N=geo.attributes.normal,n=P.count,col=new Float32Array(n*3),fur=new Float32Array(n),add=prims.filter(p=>!p.sub),ds=new Float32Array(add.length),o={c:[0,0,0],fur:1};
  for(let i=0;i<n;i++){const x=P.getX(i),y=P.getY(i),z=P.getZ(i);let dm=1e9;
    for(let j=0;j<add.length;j++){ds[j]=pd(add[j],x,y,z);if(ds[j]<dm)dm=ds[j];}
    let w=0,r=0,g=0,b=0,f=0;for(let j=0;j<add.length;j++){const wi=Math.exp(-(ds[j]-dm)*45),c=add[j].col||base;w+=wi;r+=c[0]*wi;g+=c[1]*wi;b+=c[2]*wi;f+=(add[j].fur===undefined?1:add[j].fur)*wi;}
    o.c[0]=r/w;o.c[1]=g/w;o.c[2]=b/w;o.fur=f/w;if(tint)tint(x,y,z,N.getX(i),N.getY(i),N.getZ(i),o);
    col[i*3]=o.c[0];col[i*3+1]=o.c[1];col[i*3+2]=o.c[2];fur[i]=o.fur;}
  geo.setAttribute('color',new T.BufferAttribute(col,3));geo.setAttribute('fur',new T.BufferAttribute(fur,1));return geo;}
/* sculpt() returns an empty geometry at once and queues the job; runSculpts() fills every queued geometry.
   Meshing runs in Web Workers (one per spare core) and the raw mesh is cached in IndexedDB under a hash of the
   shape, so a second visit skips meshing entirely. Painting stays on the main thread because tints are closures. */
const SJ=[];
function sculpt(prims,cell,base,tint){prims.forEach(prep);const geo=new T.BufferGeometry();SJ.push({prims,cell,base,tint,geo,b:bounds(prims,cell*2.5)});return geo;}
const WSRC=[pd,makeSDF,polyCore].map(f=>f.toString()).join('\n')+
  '\nonmessage=function(e){var d=e.data,r=polyCore(makeSDF(d.prims),d.lo,d.hi,d.cell);postMessage(r,[r.pos.buffer,r.idx.buffer]);};';
function sculptKey(j){const g=j.prims.map(p=>[p.t,p.c,p.r,p.a,p.b,p.ra,p.rb,p.k,p.sym?1:0,p.sub?1:0,p.m]),s=JSON.stringify([j.cell,j.b,g]);
  let h1=0x811c9dc5,h2=0x1505;for(let i=0;i<s.length;i++){const c=s.charCodeAt(i);h1=Math.imul(h1^c,16777619);h2=(Math.imul(h2,33)+c)|0;}
  return'sn1:'+(h1>>>0).toString(36)+(h2>>>0).toString(36)+':'+s.length;}
const IDB=(function(){let p=null;const wait=(pr,ms)=>Promise.race([pr,new Promise(r=>setTimeout(()=>r(null),ms))]);
  function db(){if(!p)p=wait(new Promise(res=>{try{const r=indexedDB.open('mouse-father',1);r.onupgradeneeded=()=>r.result.createObjectStore('sculpt');
    r.onsuccess=()=>res(r.result);r.onerror=r.onblocked=()=>res(null);}catch(e){res(null);}}),2000);return p;}
  return{get:k=>db().then(d=>d&&wait(new Promise(res=>{try{const q=d.transaction('sculpt').objectStore('sculpt').get(k);q.onsuccess=()=>res(q.result||null);q.onerror=()=>res(null);}catch(e){res(null);}}),2000)),
    put:(k,v)=>db().then(d=>{if(d)try{d.transaction('sculpt','readwrite').objectStore('sculpt').put(v,k);}catch(e){}})};})();
function fillGeo(j,r){const g=j.geo;g.setAttribute('position',new T.BufferAttribute(r.pos,3));g.setIndex(new T.BufferAttribute(r.idx,1));
  g.computeVertexNormals();paint(g,j.prims,j.base,j.tint);g.computeBoundingSphere();}
function runSculpts(prog){const jobs=SJ.splice(0),idle=[],queue=[],all=[];let done=0,url=null;
  const local=j=>polyCore(makeSDF(j.prims),j.b[0],j.b[1],j.cell);
  try{url=URL.createObjectURL(new Blob([WSRC],{type:'text/javascript'}));const n=Math.max(1,Math.min(4,(navigator.hardwareConcurrency||2)-1,jobs.length));
    for(let i=0;i<n;i++){const w=new Worker(url);idle.push(w);all.push(w);}}catch(e){idle.length=0;}
  function pump(){while(idle.length&&queue.length){const w=idle.pop(),q=queue.shift();
    w.onmessage=e=>{idle.push(w);q.res(e.data);pump();};
    w.onerror=e=>{e.preventDefault();q.res(local(q.j));};   /* a broken worker is dropped; its job runs here */
    w.postMessage({prims:q.j.prims,lo:q.j.b[0],hi:q.j.b[1],cell:q.j.cell});}
    if(!all.length)while(queue.length){const q=queue.shift();q.res(local(q.j));}}
  const mesh=j=>new Promise(res=>{queue.push({j,res});pump();});
  return Promise.all(jobs.map(j=>{const key=sculptKey(j);
    return IDB.get(key).then(hit=>hit&&hit.pos&&hit.idx?hit:mesh(j).then(r=>{IDB.put(key,r);return r;}))
      .then(r=>{fillGeo(j,r);done++;if(prog)prog(done,jobs.length);});}))
    .finally(()=>{all.forEach(w=>w.terminate());if(url)URL.revokeObjectURL(url);});}
function earPair(c,r,rot,depth,o){const e=new T.Matrix4().makeRotationFromEuler(new T.Euler(rot[0],rot[1],rot[2])).elements,nrm=[e[8],e[9],e[10]];
  return[E(c,r,Object.assign({sym:1,k:.05,rot},o||{})),E([c[0]+nrm[0]*depth,c[1]+nrm[1]*depth,c[2]+nrm[2]*depth],[r[0]*.8,r[1]*.82,r[2]*.95],{sym:1,sub:1,k:.025,rot})];}

/* ═════════ environment textures ═════════ */
function cv(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return c;}
function tex(c,rx,ry){const t=new T.CanvasTexture(c);if(rx){t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(rx,ry);}t.anisotropy=4;return t;}
function plankTex(){const c=cv(512,512),g=c.getContext('2d'),r=rnd(7),cols=['#3b2e24','#35291f','#42342a'];
  for(let i=0;i<8;i++){g.fillStyle=cols[i%3];g.fillRect(0,i*64,512,64);g.globalAlpha=.1;for(let j=0;j<60;j++){g.fillStyle=r()>.5?'#000':'#a98';g.fillRect(r()*512,i*64+r()*64,60+r()*200,1);}g.globalAlpha=1;
    g.fillStyle='#120d09';g.fillRect(0,i*64,512,3);g.fillRect((i*173)%512,i*64,3,64);}return tex(c,6,6);}
function wallTex(){const c=cv(256,256),g=c.getContext('2d');g.fillStyle='#232a36';g.fillRect(0,0,256,256);g.fillStyle='#1e2530';for(let i=0;i<4;i++)g.fillRect(i*64,0,26,256);
  g.globalAlpha=.5;for(let y=0;y<4;y++)for(let x=0;x<4;x++){g.beginPath();g.arc(x*64+45,y*64+32,5,0,7);g.fill();}return tex(c,10,6);}
function holeTex(){const c=cv(256,272),g=c.getContext('2d'),gr=g.createRadialGradient(128,170,10,128,150,190);gr.addColorStop(0,'#fff0b8');gr.addColorStop(.35,'#ffc45a');gr.addColorStop(.75,'#c8601c');gr.addColorStop(1,'#3a1406');
  g.fillStyle=gr;g.fillRect(0,0,256,272);g.fillStyle='rgba(60,22,6,.9)';g.fillRect(0,232,256,40);g.fillRect(150,186,74,8);g.fillRect(158,194,6,40);g.fillRect(210,194,6,40);
  g.fillRect(22,206,84,10);g.fillRect(22,186,10,48);g.fillRect(98,200,8,34);g.beginPath();g.ellipse(52,204,20,9,0,0,7);g.fill();g.fillRect(183,170,6,16);
  g.fillStyle='#fff7d0';g.beginPath();g.ellipse(186,162,5,9,0,0,7);g.fill();g.strokeStyle='rgba(60,22,6,.9)';g.lineWidth=5;g.strokeRect(96,70,64,56);g.beginPath();g.moveTo(128,70);g.lineTo(128,126);g.moveTo(96,98);g.lineTo(160,98);g.stroke();return tex(c);}
function goboTex(){const c=cv(256,256),g=c.getContext('2d');g.fillStyle='#000';g.fillRect(0,0,256,256);g.fillStyle='#fff';g.shadowColor='#fff';g.shadowBlur=10;
  g.fillRect(40,34,82,88);g.fillRect(134,34,82,88);g.fillRect(40,134,82,88);g.fillRect(134,134,82,88);g.shadowBlur=0;
  const gr=g.createRadialGradient(128,128,60,128,128,150);gr.addColorStop(0,'rgba(0,0,0,0)');gr.addColorStop(1,'rgba(0,0,0,1)');g.fillStyle=gr;g.fillRect(0,0,256,256);return tex(c);}
function shaftTex(){const c=cv(64,256),g=c.getContext('2d'),a=g.createLinearGradient(0,0,64,0);a.addColorStop(0,'#000');a.addColorStop(.5,'#fff');a.addColorStop(1,'#000');g.fillStyle=a;g.fillRect(0,0,64,256);
  const b=g.createLinearGradient(0,0,0,256);b.addColorStop(0,'rgba(0,0,0,.2)');b.addColorStop(1,'rgba(0,0,0,1)');g.fillStyle=b;g.fillRect(0,0,64,256);return tex(c);}
function capeAlpha(){const c=cv(128,128),g=c.getContext('2d'),r=rnd(5);g.fillStyle='#fff';g.fillRect(0,0,128,128);g.fillStyle='#000';
  for(let x=0;x<128;x+=8){const h=10+r()*34;g.beginPath();g.moveTo(x,128);g.lineTo(x+4+r()*3,128-h);g.lineTo(x+8,128);g.fill();}
  for(let i=0;i<5;i++){g.beginPath();g.ellipse(r()*128,60+r()*50,2+r()*4,5+r()*9,0,0,7);g.fill();}return tex(c);}
function catEyeTex(iris,rim,blind){const c=cv(256,128),g=c.getContext('2d');g.fillStyle=rim;g.fillRect(0,0,256,128);
  const gr=g.createRadialGradient(64,64,4,64,64,44);gr.addColorStop(0,blind?'#cfd6dc':'#f4ffd0');gr.addColorStop(.45,iris);gr.addColorStop(1,rim);g.fillStyle=gr;g.beginPath();g.arc(64,64,44,0,7);g.fill();
  if(!blind){g.strokeStyle='rgba(0,0,0,.25)';for(let i=0;i<40;i++){const a=i/40*6.283;g.beginPath();g.moveTo(64+Math.cos(a)*12,64+Math.sin(a)*12);g.lineTo(64+Math.cos(a)*42,64+Math.sin(a)*42);g.stroke();}
    g.fillStyle='#020202';g.beginPath();g.ellipse(64,64,6,34,0,0,7);g.fill();}return tex(c);}
let envTex=null;
function env(){if(envTex)return envTex;const pm=new T.PMREMGenerator(renderer),es=new T.Scene();es.background=new T.Color(0x0a0f1c);
  const a=new T.Mesh(new T.SphereGeometry(3,16,12),new T.MeshBasicMaterial({color:0xff8a2a}));a.position.set(-6,1,-7);es.add(a);
  const b=new T.Mesh(new T.BoxGeometry(6,6,.2),new T.MeshBasicMaterial({color:0xaac8ff}));b.position.set(7,8,3);b.lookAt(0,0,0);es.add(b);
  const c=new T.Mesh(new T.BoxGeometry(30,.2,30),new T.MeshBasicMaterial({color:0x2a2018}));c.position.y=-4;es.add(c);
  envTex=pm.fromScene(es,.04).texture;pm.dispose();return envTex;}
const sm=(c,o)=>new T.MeshStandardMaterial(Object.assign({color:c,roughness:.8,metalness:0,envMap:env(),envMapIntensity:.35},o||{}));
const metal=(c,r)=>sm(c,{metalness:1,roughness:r===undefined?.28:r,envMapIntensity:1.5});
function M(geo,mat,sh){const m=new T.Mesh(geo,mat);m.castShadow=sh!==false;m.receiveShadow=true;return m;}
function at(m,x,y,z,sx,sy,sz){m.position.set(x,y,z);if(sx!==undefined)m.scale.set(sx,sy===undefined?sx:sy,sz===undefined?sx:sz);return m;}

/* ═════════ shell fur ═════════ */
/* the mesh is redrawn in layers pushed along the normal, each layer keeping fewer strands */
function furMat(layer,o){const m=sm(0xffffff,{vertexColors:true,roughness:.7,envMapIntensity:.25}),uL=m.userData.uL={value:layer};
  m.onBeforeCompile=sh=>{sh.uniforms.uL=uL;sh.uniforms.uLen={value:o.len};sh.uniforms.uDen={value:o.den};sh.uniforms.uComb={value:new T.Vector3(o.comb[0],o.comb[1],o.comb[2])};
    sh.vertexShader='attribute float fur;uniform float uL,uLen;uniform vec3 uComb;varying vec3 vBase;varying float vFur;\n'+sh.vertexShader.replace('#include <begin_vertex>',
      '#include <begin_vertex>\nvBase=position;vFur=fur;vec3 cb=uComb-normal*dot(uComb,normal);transformed+=(normal*uL+cb*uL*uL)*uLen*fur;');
    sh.fragmentShader='uniform float uL,uDen;varying vec3 vBase;varying float vFur;\nfloat fh(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}\n'+sh.fragmentShader.replace('#include <color_fragment>',
      '#include <color_fragment>\nif(uL>0.){if(vFur<.04)discard;vec3 q=vBase*uDen;float r=fh(floor(q));float ln=.3+.7*r;if(uL>ln)discard;vec3 f=fract(q)-.5;if(length(f)>.66*(1.-uL/ln)+.07)discard;}\ndiffuseColor.rgb*=mix(.3,1.25,uL)*(.85+.3*fh(floor(vBase*uDen)+3.));');};
  return m;}
/* every fur part is built with SHELL_MAX shells; setShells(n) shows the first n+1 and respaces their layers */
const FURS=[];let shellsNow=SHELL_MAX;
function furPart(geo,o){const g=new T.Group();for(let i=0;i<=SHELL_MAX;i++){const m=new T.Mesh(geo,furMat(i/SHELL_MAX,o));m.castShadow=i===0;m.receiveShadow=true;g.add(m);}
  FURS.push(g);if(shellsNow!==SHELL_MAX)shellGroup(g,shellsNow);return g;}
function shellGroup(g,n){g.children.forEach((m,i)=>{m.visible=i<=n;if(i<=n)m.material.userData.uL.value=i/n;});}
function setShells(n){shellsNow=n;FURS.forEach(g=>shellGroup(g,n));}
/* tapered tube whose spine is rewritten every frame (tails) */
function tailTube(nS,nR,col,furV,rad){const n=(nS+1)*nR,pos=new Float32Array(n*3),c=new Float32Array(n*3),f=new Float32Array(n).fill(furV),idx=[];
  for(let i=0;i<=nS;i++)for(let j=0;j<nR;j++){const q=(i*nR+j)*3,cc=typeof col==='function'?col(i/nS,j/nR):col;c[q]=cc[0];c[q+1]=cc[1];c[q+2]=cc[2];
    if(i<nS){const a=i*nR+j,b=i*nR+(j+1)%nR,d=a+nR,e=b+nR;idx.push(a,d,b,b,d,e);}}
  const geo=new T.BufferGeometry();geo.setAttribute('position',new T.BufferAttribute(pos,3));geo.setAttribute('normal',new T.BufferAttribute(new Float32Array(n*3),3));
  geo.setAttribute('color',new T.BufferAttribute(c,3));geo.setAttribute('fur',new T.BufferAttribute(f,1));geo.setIndex(idx);geo.boundingSphere=new T.Sphere(new T.Vector3(),6);
  const pts=[];for(let i=0;i<=nS;i++)pts.push(new T.Vector3());const tg=new T.Vector3(),sd=new T.Vector3(),u2=new T.Vector3(),up=new T.Vector3(0,1,0);
  function set(){for(let i=0;i<=nS;i++){tg.subVectors(pts[Math.min(nS,i+1)],pts[Math.max(0,i-1)]).normalize();sd.crossVectors(up,tg);if(sd.lengthSq()<1e-4)sd.set(1,0,0);sd.normalize();u2.crossVectors(tg,sd);
      const r=rad(i/nS);for(let j=0;j<nR;j++){const a=j/nR*6.2832,cs=Math.cos(a)*r,sn=Math.sin(a)*r,q=(i*nR+j)*3;pos[q]=pts[i].x+sd.x*cs+u2.x*sn;pos[q+1]=pts[i].y+sd.y*cs+u2.y*sn;pos[q+2]=pts[i].z+sd.z*cs+u2.z*sn;}}
    geo.attributes.position.needsUpdate=true;geo.computeVertexNormals();}
  return{geo,pts,set,nS};}
function chain(tb,base,seg,h0,e0,dh,de,floor){let h=h0,e=e0;const p=tb.pts;p[0].copy(base);
  for(let i=1;i<=tb.nS;i++){h+=dh(i);e+=de(i);if(p[i-1].y<floor&&e<0)e=0;p[i].set(p[i-1].x+Math.sin(h)*Math.cos(e)*seg,Math.max(floor*.8,p[i-1].y+Math.sin(e)*seg),p[i-1].z-Math.cos(h)*Math.cos(e)*seg);}tb.set();}
function whiskers(par,roots,len,rad,spread){const mat=sm(0xbfb9ae,{emissive:0x101010,roughness:.4});
  roots.forEach(r=>{const s=r[0]<0?-1:1;for(let i=0;i<r[3];i++){const a=(i-(r[3]-1)/2)*spread,l=len*(.75+.25*Math.cos(i*1.7));
    const cu=new T.QuadraticBezierCurve3(new T.Vector3(r[0],r[1],r[2]),new T.Vector3(r[0]+s*l*.5,r[1]+a*l*.4+l*.05,r[2]+l*.12),new T.Vector3(r[0]+s*l,r[1]+a*l-l*.08,r[2]-l*.1));
    par.add(M(new T.TubeGeometry(cu,8,rad,3,false),mat,false));}});}

