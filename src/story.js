/* ═════════ cutscenes: shots on camera rails, subtitles, letterbox ═════════ */
/* A cut is a list of shots. Each shot names its scene (home | kitchen), a duration, a camera move
   [from, look-from, to, look-to], timed subtitles, and on(u) which poses the characters at local time u.
   Characters are posed through the same state the game uses (P for the father, W.kin[i].st for the family),
   so animHero / animKin keep doing the walking, breathing and looking. */
const CUT={name:'',t:0,i:-1,shots:null,end:null,music:null,total:0,flags:{}};
const ez=x=>x<=0?0:x>=1?1:x*x*x*(x*(x*6-15)+10);
const baseFov=()=>camera.aspect<1?66:50;
function heroTo(sc){if(W.hero.g.parent!==sc)sc.add(W.hero.g);W.cur=sc;W.hero.sword.visible=W.hero.shield.visible=sc===W.scene;}   /* the sword and shield stay by the door at home */
/* walk along a polyline: k in 0..1 → [x,z,heading] at constant speed */
function path(pts,k){let L=0;const seg=[];for(let i=1;i<pts.length;i++){const l=hyp(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]);seg.push(l);L+=l;}
  let d=Math.max(0,Math.min(1,k))*L,i=0;while(i<seg.length-1&&d>seg[i]){d-=seg[i];i++;}const a=pts[i],b=pts[i+1],q=seg[i]?Math.min(1,d/seg[i]):1;
  return[a[0]+(b[0]-a[0])*q,a[1]+(b[1]-a[1])*q,Math.atan2(b[0]-a[0],b[1]-a[1])];}
const seg01=(u,a,b)=>Math.max(0,Math.min(1,(u-a)/(b-a)));
function walkHero(pts,u,a,b){if(u<a)return;const p=path(pts,ez(seg01(u,a,b)));P.x=p[0];P.z=p[1];if(u>a&&u<b)P.yaw+=angd(p[2],P.yaw)*.25;}
function walkKin(i,pts,u,a,b){if(u<a)return;const p=path(pts,ez(seg01(u,a,b)));W.kin[i].st.x=p[0];W.kin[i].st.z=p[1];}
function once(key,fn){if(!CUT.flags[key]){CUT.flags[key]=1;fn();}}
const heroHead=()=>[P.x,1.45,P.z];
const kinPos=i=>{const k=W.kin[i].st;return[k.x,.6,k.z,3];};

/* where everyone is in the home for a given moment */
function homeLayout(name){const K=W.kin.map(R=>R.st),fd=W.homeFood,bowl=[HM.bowl[0],HM.top+.2,HM.bowl[1]];
  K.forEach(k=>Object.assign(k,{y:0,lie:0,roll:0,sit:0,eye:1,look:null,al:null,ar:null,lean:0,hdx:0,nod:0,px:null}));
  if(name==='night'){fd.visible=false;
    [[-7.85,.3],[-7.0,-.25],[-6.2,.35]].forEach((q,j)=>Object.assign(K[j+1],{x:q[0],z:-12.85+j*.06,y:.08,yaw:.12,lie:1,roll:q[1],eye:0,al:[.25,0,.15],ar:[.25,0,-.15]}));
    Object.assign(K[0],{x:HM.seat[0],z:HM.seat[1],y:.04,yaw:-2.6,sit:1,look:[-6.2,.6,-13.4]});
    P.x=-2.15;P.z=-10.85;P.yaw=Math.atan2(HM.table[0]-P.x,HM.table[1]-P.z);P.pose={hdx:.35};}
  if(name==='end'){fd.visible=true;
    Object.assign(K[0],{x:-4.75,z:-10.7,yaw:Math.atan2(HM.table[0]+4.75,HM.table[1]+10.7),look:bowl});
    [[-4.85,-12.25,0],[-2.05,-12.55,.28],[-3.75,-13.15,.28]].forEach((q,j)=>Object.assign(K[j+1],{x:q[0],z:q[1],y:q[2],yaw:Math.atan2(HM.table[0]-q[0],HM.table[1]-q[1]),look:bowl,nod:.12}));
    P.x=-2.1;P.z=-10.7;P.yaw=Math.atan2(HM.table[0]-P.x,HM.table[1]-P.z);P.pose={hdx:.15};}}
function storyTitle(){homeLayout('night');heroTo(W.home);}

const SHOTS={
  intro:()=>[
    {sc:'home',d:7,fin:1,init(){homeLayout('night');},cam:[[-4.4,1.95,-13.2],[-2.4,1.3,-10.9],[-4.15,1.85,-12.85],[-2.4,1.35,-10.95]],
      sub:[[1,6.6,'벽 속 작은 집. 그릇은 사흘째 비어 있다.']]},
    {sc:'home',d:6.5,cam:[[-8.3,2.4,-11.3],[-6.9,.45,-13.3],[-8.1,2.1,-11.7],[-6.9,.4,-13.35]],sub:[[.6,6,'막내의 기침이 잦아졌다.']],
      on(u){const k=W.kin[3].st;if(u>1.4)once('c1',()=>{k.cough=G.t;sfx('cough',kinPos(3));});if(u>3.3)once('c2',()=>{k.cough=G.t;sfx('cough',kinPos(3));});
        W.kin[0].st.look=[k.x,.6,k.z-.8];}},
    {sc:'home',d:7.5,cam:[[.3,1.35,-9.25],[-3.3,1.2,-9.4],[0,1.3,-9.4],[-3.3,1.2,-9.4]],sub:[[.8,3.9,'“꼭 돌아와요.”'],[4.3,7.3,'“해 뜨기 전에 오리다.”']],
      init(){Object.assign(W.kin[0].st,{x:-3.3,z:-9.8,y:0,yaw:0,sit:0,px:null});P.x=-3.3;P.z=-8.95;P.yaw=Math.PI;P.pose={hdx:.22};},
      on(u){const w=W.kin[0].st,a=u<4.2?Math.sin(u*2.2)*.12:0,up=u<4.2?1:Math.max(0,1-(u-4.2)*1.5);w.look=heroHead();
        w.al=[-.35-1.15*up,0,.35+.25*up+a];w.ar=[-.35-1.15*up,0,-.35-.25*up-a];P.pose.hdx=.22+.1*Math.sin(u*.8);}},
    {sc:'home',d:6.6,fout:1,cam:[[-1.9,1.1,-11.4],[-3.2,1.2,-7.3],[-2,1.08,-10.9],[-3.2,1.2,-7.2]],sub:[[2.6,6.2,'아버지는 오늘 밤도 문턱을 넘는다.']],
      init(){P.x=-3.3;P.z=-8.95;P.yaw=0;Object.assign(W.kin[0].st,{x:-4.3,z:-9.9,yaw:.4,al:null,ar:null,px:null});},
      on(u){walkHero([[-3.3,-8.95],[-3.2,-8.05]],u,0,1.8);if(u>1.8&&u<4.3){const b=Math.sin(Math.PI*seg01(u,1.9,4.2));P.pose={hdy:-1.15*b,crx:-.08*b};}else P.pose=null;
        walkHero([[-3.2,-8.05],[-3.2,-6.6]],u,4.3,6.6);W.kin[0].st.look=heroHead();}},
    {sc:'kit',d:4.5,fin:1,chap:[1.2,99],cam:[[-1.8,.8,-2],[-3.2,1.0,-6.2],[-2.1,.9,-2.5],[-3.2,1.05,-6]],
      init(){P.x=-3.2;P.z=-7;P.yaw=0;P.pose=null;},on(u){walkHero([[-3.2,-7],[-3.2,-5.6]],u,.2,4.5);}},
    {sc:'kit',d:5.2,chap:[0,3.8],cam:[[-3.0,4.6,-6.4],[-1,.8,9],[-3.2,3.3,-6.5],[-3.2,1.4,-1.4]],
      on(u){walkHero([[-3.2,-5.6],[-3.2,-3.6]],u,0,2.4);P.yaw+=angd(0,P.yaw)*.1;P.pose=u>2.4?{hdy:Math.sin((u-2.4)*1.6)*.6}:null;}}],
  ret:()=>{let sx=P.x,sz=P.z;return[
    {sc:'kit',d:3.6,fout:1,cam:[[-1.6,2.2,-2.2],[-3.2,1,-6.4],[-2.3,1.7,-3.4],[-3.2,1,-6.6]],init(){sx=P.x;sz=P.z;P.pose=null;},
      on(u){walkHero([[sx,sz],[-3.2,-5.6],[-3.2,-7]],u,0,3.4);}},
    {sc:'home',d:7,fin:1,cam:[[.6,1.6,-12.2],[-3.6,1.0,-8.9],[.3,1.5,-11.8],[-3.6,1.0,-9.1]],sub:[[3,6.8,'문턱을 넘자, 작은 발소리 셋이 달려온다.']],
      init(){homeLayout('night');W.homeFood.visible=false;const K=W.kin.map(R=>R.st);
        [[-5.6,-11.6],[-6.2,-12.4],[-4.9,-12.7]].forEach((q,j)=>Object.assign(K[j+1],{x:q[0],z:q[1],y:0,lie:0,eye:1,px:null}));
        Object.assign(K[0],{x:-4.3,z:-11,y:0,sit:0,yaw:.6,px:null});P.x=-3.2;P.z=-7.3;P.yaw=Math.PI;P.pose=null;},
      on(u){walkHero([[-3.2,-7.3],[-3.25,-9.15]],u,0,2.6);P.yaw+=angd(Math.PI,P.yaw)*.1;
        walkKin(1,[[-5.6,-11.6],[-3.95,-9.8]],u,1,3.3);walkKin(2,[[-6.2,-12.4],[-2.55,-9.85]],u,1.3,3.9);walkKin(3,[[-4.9,-12.7],[-3.3,-10.0]],u,1.1,3.6);
        walkKin(0,[[-4.3,-11],[-3.9,-10.45]],u,2.4,5);W.kin.forEach(R=>R.st.look=heroHead());
        if(u>1.2)once('sq',()=>sfx('family',[1,2,3].map(kinPos)));if(u>4.2)once('sq2',()=>sfx('family',[1,3].map(kinPos)));
        if(u>3.9){[1,2,3].forEach(i=>{W.kin[i].st.y=Math.abs(Math.sin((u-3.9)*7+i))*.08;});}}},
    {sc:'home',d:6,cam:[[.8,2.5,-11.9],[-3.3,1.1,-11.3],[.5,2.35,-11.8],[-3.3,1.1,-11.3]],sub:[[1.8,5.8,'치즈 다섯 조각. 오늘 밤은 모두 배불리 잠들 것이다.']],
      init(){homeLayout('end');W.homeFood.visible=false;W.kin.forEach(R=>{R.st.look=heroHead();R.st.nod=0;});},
      on(u){if(u>1.1)once('pk',()=>{P.pickT=G.t;});if(u>1.5)once('fd',()=>{W.homeFood.visible=true;sfx('pick',[HM.bowl[0],HM.top,HM.bowl[1]],true);
        W.kin.forEach(R=>R.st.look=[HM.bowl[0],HM.top+.2,HM.bowl[1]]);});}},
    {sc:'home',d:7.5,cam:[[-1,1.5,-13.3],[-2.75,1.2,-9.9],[-1.2,1.45,-13],[-2.75,1.2,-9.95]],sub:[[.6,3.7,'망토는 찢기고, 팔에는 상처가 남았다.'],[4,7.2,'그는 아무렇지 않은 듯 웃었다.']],
      init(){P.x=-3.2;P.z=-9.9;P.yaw=Math.PI/2;Object.assign(W.kin[0].st,{x:-2.3,z:-9.9,yaw:-Math.PI/2,px:null});Object.assign(W.kin[2].st,{x:-4.4,z:-12.9,y:0,px:null});},
      on(u){const away=u<3.9?Math.min(1,u/1):Math.max(0,1-(u-3.9)*1.2);P.pose={hdy:.55*away,hdx:.1*away-.05,al:[.75*away-.5*(1-away),.2*away,.35]};
        W.kin[0].st.look=u<3.9?[P.x,1.05,P.z-.3]:heroHead();}},
    {sc:'home',d:7,fout:1,cam:[[-3.1,1.5,-8.4],[-3.4,1.1,-11.5],[-3.15,2.1,-7.7],[-3.4,1.0,-11.5]],sub:[[1,5.6,'그리고 막내는, 오늘 밤에도 기침을 했다.']],
      init(){homeLayout('end');},on(u){const k=W.kin[3].st;if(u>1.6)once('c3',()=>{k.cough=G.t;sfx('cough',kinPos(3));});if(u>3.4)once('c4',()=>{k.cough=G.t;sfx('cough',kinPos(3));});
        if(u>1.6)W.kin[0].st.look=[k.x,.9,k.z];}}];}
};

function startCut(name,end){const c=CUT;c.name=name;c.shots=SHOTS[name]();c.t=0;c.i=-1;c.end=end;c.flags={};c.music=name==='intro'?'night':'home';
  c.total=c.shots.reduce((a,s)=>a+s.d,0);G.state='cut';
  ['hud','pad','joy'].forEach(id=>$(id).style.display='none');$('intro').classList.remove('show');$('end').classList.remove('show');$('toast').style.opacity=0;
  document.body.classList.add('cine');}
function endCut(skip){document.body.classList.remove('cine');$('sub').style.opacity=0;$('chap').classList.remove('show');$('fade').style.opacity=0;
  camera.fov=baseFov();camera.updateProjectionMatrix();P.pose=null;const e=CUT.end;CUT.end=null;if(e)e(skip);}
function storyStep(dt){const c=CUT;if(!c.end)return;c.t+=dt;let acc=0,i=0;while(i<c.shots.length-1&&c.t>=acc+c.shots[i].d){acc+=c.shots[i].d;i++;}
  const sh=c.shots[i],u=Math.min(c.t-acc,sh.d),k=u/sh.d,cut=i!==c.i;
  if(cut){c.i=i;heroTo(sh.sc==='home'?W.home:W.scene);if(sh.init)sh.init();camera.fov=baseFov()*(sh.fov||1);camera.updateProjectionMatrix();}
  const x0=P.x,z0=P.z;if(sh.on)sh.on(u);P.sp=cut||dt<=0?0:hyp(P.x-x0,P.z-z0)/dt;
  const e=ez(k),C=sh.cam,hh=G.t;
  camera.position.set(lerp(C[0][0],C[2][0],e)+Math.sin(hh*.71)*.015,lerp(C[0][1],C[2][1],e)+Math.sin(hh*.53+1)*.012,lerp(C[0][2],C[2][2],e));
  camera.lookAt(lerp(C[1][0],C[3][0],e)+Math.sin(hh*.37)*.02,lerp(C[1][1],C[3][1],e),lerp(C[1][2],C[3][2],e));
  let txt='';(sh.sub||[]).forEach(q=>{if(u>=q[0]&&u<q[1])txt=q[2];});const sb=$('sub');if(sb.textContent!==txt&&txt)sb.textContent=txt;sb.style.opacity=txt?1:0;
  let f=0;if(sh.fin)f=Math.max(f,1-u/.7);if(sh.fout)f=Math.max(f,1-(sh.d-u)/.7);$('fade').style.opacity=Math.max(0,f);
  $('chap').classList.toggle('show',!!sh.chap&&u>=sh.chap[0]&&u<sh.chap[1]);
  if(c.t>=c.total)endCut(false);}

function startIntro(){startCut('intro',skip=>{if(!skip)G.camFrom={p:camera.position.clone(),q:camera.quaternion.clone(),t:G.t};begin();});}
function startReturn(){startCut('ret',()=>{G.state='win';homeLayout('end');heroTo(W.home);$('end').classList.add('show');});}
$('skip').addEventListener('click',()=>{if(G.state==='cut')endCut(true);});
window.addEventListener('keydown',e=>{if(e.code==='Escape'&&G.state==='cut')endCut(true);});
