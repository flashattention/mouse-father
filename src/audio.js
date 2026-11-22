/* ═════════ sound: procedural effects (Web Audio) + background music files ═════════ */
/* Effects are synthesised on the spot and placed in 3D with PannerNodes; the listener rides between camera
   and hero. Music is original, rendered offline by tools/compose_bgm.py into audio/*.mp3 — looped tracks
   carry a wrap-around pad, so the loop points below are seamless. audioTick() diffs the game state each
   frame and fires sounds on changes, so game.js needs no sound calls. */
const BGM={night:{loop:[.25,60.25],vol:.75},cat:{loop:[.25,40.25],vol:.8},home:{vol:.9},fall:{vol:.85}};
const AU={ctx:null,on:true,raw:{},buf:{},mus:null,want:null,S:null,clock:0,tk:0};
try{if(localStorage.getItem('mf.sound')==='0')AU.on=false;}catch(e){}
for(const k in BGM)AU.raw[k]=fetch('audio/'+k+'.mp3').then(r=>r.ok?r.arrayBuffer():null).catch(()=>null);

function audioInit(){
  if(AU.ctx){if(AU.ctx.state==='suspended'&&AU.on&&!document.hidden)AU.ctx.resume();return;}
  const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;let c;try{c=new AC();}catch(e){return;}AU.ctx=c;
  const comp=c.createDynamicsCompressor();comp.threshold.value=-16;comp.knee.value=12;comp.ratio.value=3.5;comp.attack.value=.004;comp.release.value=.25;comp.connect(c.destination);
  AU.master=c.createGain();AU.master.gain.value=AU.on?1:0;AU.master.connect(comp);
  AU.sfx=c.createGain();AU.sfx.gain.value=.9;AU.sfx.connect(AU.master);
  AU.musB=c.createGain();AU.musB.gain.value=.5;AU.musB.connect(AU.master);
  const sr=c.sampleRate,nb=c.createBuffer(1,sr*2,sr),d=nb.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;AU.noise=nb;
  /* a small dark room: decaying noise that loses its highs as it fades */
  const rl=Math.floor(sr*1.8),ir=c.createBuffer(2,rl,sr);
  for(let ch=0;ch<2;ch++){const q=ir.getChannelData(ch);let lp=0;for(let i=0;i<rl;i++){const t=i/sr;lp+=(Math.random()*2-1-lp)*(.7-.6*t/1.8);q[i]=lp*Math.exp(-3.8*t)*Math.min(1,t/.012);}}
  AU.rev=c.createConvolver();AU.rev.buffer=ir;const rg=c.createGain();rg.gain.value=.55;AU.rev.connect(rg);rg.connect(AU.master);
  /* cat purr: low noise chopped at ~23 Hz; level follows the cat's state */
  const pn=c.createBufferSource();pn.buffer=nb;pn.loop=true;const pf=c.createBiquadFilter();pf.type='lowpass';pf.frequency.value=240;pf.Q.value=3;
  const am=c.createGain();am.gain.value=.5;const lfo=c.createOscillator();lfo.frequency.value=23;const lg=c.createGain();lg.gain.value=.5;lfo.connect(lg);lg.connect(am.gain);
  AU.purr=c.createGain();AU.purr.gain.value=0;AU.purrP=aPan(0,2,0,3);pn.connect(pf);pf.connect(am);am.connect(AU.purr);AU.purr.connect(AU.purrP);pn.start();lfo.start();
  /* room tone: a refrigerator humming in the far corner */
  const hp=aPan(13,1.5,23,5),hg=c.createGain();hg.gain.value=.05;hg.connect(hp);
  [[50,1],[100,.5],[150,.18]].forEach(h=>{const o=c.createOscillator(),g=c.createGain();o.frequency.value=h[0];g.gain.value=h[1];o.connect(g);g.connect(hg);o.start();});
  const hn=c.createBufferSource();hn.buffer=nb;hn.loop=true;const hf=c.createBiquadFilter();hf.type='lowpass';hf.frequency.value=160;const hng=c.createGain();hng.gain.value=.5;hn.connect(hf);hf.connect(hng);hng.connect(hg);hn.start();
  for(const k in BGM)AU.raw[k].then(ab=>{if(!ab)return;c.decodeAudioData(ab,b=>{AU.buf[k]=b;if(AU.want===k&&!AU.mus)playMusic(k,1.5);},()=>{});});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)c.suspend();else if(AU.on)c.resume();});
  AU.clock=c.currentTime+1;}

/* ── building blocks ── */
function aPan(x,y,z,ref){const p=AU.ctx.createPanner();p.panningModel='equalpower';p.distanceModel='inverse';p.refDistance=ref||4;p.rolloffFactor=1;p.maxDistance=90;
  aPos(p,x,y,z);p.connect(AU.sfx);return p;}
function aPos(p,x,y,z){if(p.positionX){p.positionX.value=x;p.positionY.value=y;p.positionZ.value=z;}else p.setPosition(x,y,z);}
/* one-shot output: optional 3D position [x,y,z,ref] and reverb send; torn down after `life` seconds */
function aOut(pos,rv,life){const c=AU.ctx,g=c.createGain(),p=pos?aPan(pos[0],pos[1],pos[2],pos[3]):null;g.connect(p||AU.sfx);
  let s=null;if(rv){s=c.createGain();s.gain.value=rv;g.connect(s);s.connect(AU.rev);}
  setTimeout(()=>{g.disconnect();if(p)p.disconnect();if(s)s.disconnect();},(life||2)*1000+300);return g;}
function aEnv(p,t,a,att,dur){p.setValueAtTime(0,t);p.linearRampToValueAtTime(a,t+att);p.exponentialRampToValueAtTime(.0001,t+Math.max(dur,att+.005));}
function aOsc(dst,t,type,f0,f1,dur,a,att){const c=AU.ctx,o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.setValueAtTime(f0,t);
  if(f1&&f1!==f0)o.frequency.exponentialRampToValueAtTime(f1,t+dur);aEnv(g.gain,t,a,att||.003,dur);o.connect(g);g.connect(dst);o.start(t);o.stop(t+dur+.05);}
function aNz(dst,t,ft,f0,f1,q,dur,a,att){const c=AU.ctx,s=c.createBufferSource(),fl=c.createBiquadFilter(),g=c.createGain();s.buffer=AU.noise;
  fl.type=ft;fl.frequency.setValueAtTime(f0,t);if(f1&&f1!==f0)fl.frequency.exponentialRampToValueAtTime(f1,t+dur);fl.Q.value=q||1;
  aEnv(g.gain,t,a,att||.002,dur);s.connect(fl);fl.connect(g);g.connect(dst);s.start(t,Math.random()*1.5);s.stop(t+dur+.05);}
/* struck metal: inharmonic partials, higher ones die first */
function aRing(dst,t,f,ratios,dur,a){ratios.forEach((r,i)=>aOsc(dst,t,'sine',f*r,0,dur/(1+i*.6),a/(1+i*.5),.001));}
/* a cat voice: sawtooth through two moving formants */
function aMeow(dst,t,f0s,f1s,dur,a){const c=AU.ctx,o=c.createOscillator(),g=c.createGain(),m=c.createGain(),cv=v=>new Float32Array(v);o.type='sawtooth';
  o.frequency.setValueCurveAtTime(cv(f0s),t,dur);aEnv(g.gain,t,a,.05,dur);m.gain.value=.55;
  const b1=c.createBiquadFilter(),b2=c.createBiquadFilter();b1.type=b2.type='bandpass';b1.Q.value=5;b2.Q.value=7;
  b1.frequency.setValueCurveAtTime(cv(f1s),t,dur);b2.frequency.setValueCurveAtTime(cv(f1s.map(f=>f*2.4)),t,dur);
  o.connect(b1);o.connect(b2);b1.connect(g);b2.connect(m);m.connect(g);g.connect(dst);o.start(t);o.stop(t+dur+.05);}
const aR=(a,b)=>a+Math.random()*(b-a);

/* ── the sounds ── */
const SFX={
  step(p,v){const c=AU.ctx,t=c.currentTime,o=aOut(p,0,.2);aNz(o,t,'bandpass',aR(1500,2200),800,1.4,.045,.018+.03*v);aOsc(o,t,'sine',150,70,.05,.015+.02*v);},
  swing(p,k){const t=AU.ctx.currentTime,o=aOut(p,.12,.6),big=k===2;
    aNz(o,t+.05,'bandpass',big?1900:2600,big?320:650,2.2,big?.3:.2,big?.5:.38,big?.1:.06);aNz(o,t+.08,'highpass',5000,5000,1,.08,.05,.03);},
  roll(p){const t=AU.ctx.currentTime,o=aOut(p,.05,.6);aNz(o,t,'bandpass',900,450,.8,.3,.2,.06);aNz(o,t+.1,'bandpass',2400,1600,1.5,.14,.06,.02);},
  clank(p){const t=AU.ctx.currentTime,o=aOut(p,.35,1.2);aRing(o,t,aR(500,540),[1,2.27,3.55,5.06,6.6],.6,.18);aNz(o,t,'highpass',2800,2800,1,.035,.4);aOsc(o,t,'sine',160,80,.12,.4);},
  hurt(p){const t=AU.ctx.currentTime,o=aOut(p,.15,.8);aOsc(o,t,'sine',120,50,.18,.55);aNz(o,t,'lowpass',900,300,1,.12,.35);
    const c=AU.ctx,s=c.createOscillator(),g=c.createGain();s.type='triangle';s.frequency.setValueCurveAtTime(new Float32Array([2400,3500,3300,2500]),t+.03,.24);aEnv(g.gain,t+.03,.16,.01,.24);s.connect(g);g.connect(o);s.start(t+.03);s.stop(t+.3);},
  fall(p){const c=AU.ctx,t=c.currentTime,o=aOut(p,.3,1.5),s=c.createOscillator(),g=c.createGain();s.type='triangle';
    s.frequency.setValueCurveAtTime(new Float32Array([2300,2600,1900,1200,900]),t+.15,.7);aEnv(g.gain,t+.15,.14,.02,.75);s.connect(g);g.connect(o);s.start(t+.15);s.stop(t+.95);aOsc(o,t+.35,'sine',110,45,.3,.4);},
  pick(p,last){const t=AU.ctx.currentTime,o=aOut(p,.3,2.2);aNz(o,t,'bandpass',2600,1800,2,.06,.12);
    (last?[1175,1397,1760,2349]:[1175,1760]).forEach((f,i)=>{aOsc(o,t+.04+i*.09,'sine',f,0,1.1,.09,.004);aOsc(o,t+.04+i*.09,'sine',f*3.01,0,.25,.012,.002);});},
  snap(p){const t=AU.ctx.currentTime,o=aOut(p,.3,1);aNz(o,t,'highpass',3000,3000,1,.018,.8);aOsc(o,t,'square',1900,900,.02,.12);aRing(o,t+.005,aR(1250,1350),[1,2.17,3.3],.35,.08);aOsc(o,t+.01,'sine',190,80,.09,.55);},
  catHit(p,dead){const t=AU.ctx.currentTime,o=aOut(p,.25,1.6);aOsc(o,t,'sine',105,48,.2,.6);aNz(o,t,'lowpass',1000,250,1,.12,.35);
    if(dead)aMeow(o,t+.06,[520,860,780,420,300],[700,1300,1100,600,450],.9,.4);else aMeow(o,t+.05,[560,980,640],[800,1500,700],.36,.32);},
  wake(p){const t=AU.ctx.currentTime,o=aOut(p,.3,1.4);aMeow(o,t,[230,300,360,320],[500,900,1100,700],.75,.3);},
  hiss(p){const t=AU.ctx.currentTime,o=aOut(p,.15,1.2);aNz(o,t,'highpass',2600,3400,.7,.75,.32,.09);aNz(o,t,'bandpass',6000,5200,2,.7,.14,.12);},
  growl(p){const c=AU.ctx,t=c.currentTime,o=aOut(p,.15,1),s=c.createOscillator(),f=c.createBiquadFilter(),g=c.createGain(),tr=c.createGain(),l=c.createOscillator(),lg=c.createGain();
    s.type='sawtooth';s.frequency.setValueAtTime(95,t);s.frequency.linearRampToValueAtTime(120,t+.4);f.type='lowpass';f.frequency.value=650;f.Q.value=4;
    l.frequency.value=31;lg.gain.value=.5;tr.gain.value=.5;l.connect(lg);lg.connect(tr.gain);aEnv(g.gain,t,.38,.08,.45);
    s.connect(f);f.connect(tr);tr.connect(g);g.connect(o);s.start(t);l.start(t);s.stop(t+.5);l.stop(t+.5);},
  jaw(p){const t=AU.ctx.currentTime,o=aOut(p,.15,.6);aNz(o,t,'bandpass',1400,900,3,.05,.55);aOsc(o,t,'sine',320,110,.06,.4);},
  pounce(p){const t=AU.ctx.currentTime,o=aOut(p,.15,1.2);aNz(o,t,'bandpass',700,260,1,.5,.35,.15);SFX.bell(p,.16);},
  land(p){const t=AU.ctx.currentTime,o=aOut(p,.25,1);aOsc(o,t,'sine',85,38,.32,.7);aNz(o,t,'lowpass',600,160,1,.18,.4);},
  bell(p,a){const t=AU.ctx.currentTime,o=aOut(p,.25,.8),f=aR(2850,3050);aRing(o,t,f,[1,2.08,3.21],.32,a);aRing(o,t+aR(.035,.06),f*1.004,[1,2.08,3.21],.25,a*.6);},
  paw(p){const t=AU.ctx.currentTime,o=aOut(p,0,.3);aOsc(o,t,'sine',95,55,.07,.12);aNz(o,t,'lowpass',500,300,1,.05,.08);},
  warn(p){const t=AU.ctx.currentTime,o=aOut(p,.2,2);aNz(o,t,'lowpass',140,90,1,1.35,.55,1.15);aOsc(o,t,'sine',36,30,1.35,.45,1.1);},
  drop(p){const t=AU.ctx.currentTime,o=aOut(p,.1,.6);aNz(o,t,'bandpass',420,160,.9,.26,.5,.2);},
  stomp(p){const t=AU.ctx.currentTime,o=aOut(p,.6,2.5);aOsc(o,t,'sine',62,26,1.1,1);aNz(o,t,'lowpass',480,90,.8,.6,.85);aNz(o,t,'bandpass',900,500,1,.09,.25);},
  tick(p,hi){const t=AU.ctx.currentTime,o=aOut(p,.5,.4);aNz(o,t,'bandpass',hi?3600:2700,0,9,.014,.11);aOsc(o,t,'sine',hi?2100:1650,0,.012,.04);},
  family(){const t=AU.ctx.currentTime;[[-3.75,.6,-6.3],[-2.7,.4,-6.3],[-3.2,.4,-6.45]].forEach((q,i)=>{for(let k=0;k<3;k++){const d=.5+i*.35+k*aR(.5,.9),o=aOut([q[0],q[1],q[2],3],.25,d+.5),f=(i?3300:2600)*aR(.95,1.08);
    aOsc(o,t+d,'sine',f,f*1.25,.07,.06,.008);aOsc(o,t+d+.09,'sine',f*1.1,f*1.35,.06,.05,.008);}});}
};

/* ── music ── */
function playMusic(name,fade){const c=AU.ctx,t=c.currentTime;
  if(AU.mus){const m=AU.mus;m.g.gain.cancelScheduledValues(t);m.g.gain.setValueAtTime(m.g.gain.value,t);m.g.gain.linearRampToValueAtTime(0,t+fade);m.s.stop(t+fade+.1);AU.mus=null;}
  const b=name&&AU.buf[name];if(!b)return;const cfg=BGM[name],s=c.createBufferSource(),g=c.createGain();s.buffer=b;
  if(cfg.loop){s.loop=true;s.loopStart=cfg.loop[0];s.loopEnd=cfg.loop[1];}
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(cfg.vol,t+fade);s.connect(g);g.connect(AU.musB);s.start(t,cfg.loop?cfg.loop[0]:0);AU.mus={s,g,name};}

/* ── per-frame: listener, ambience, and sounds for whatever changed since last frame ── */
const _af=new T.Vector3();
function aSnap(){return{st:G.state,atk:P.atk,dash:P.dash>0,hurt:P.hurtT,blk:P.blkT,pick:P.pickT,cs:Ct.state,ct0:Ct.t0,aw:Ct.awake,hp:Ct.hp,cy:Ct.y,hs:Hm.state,
  tr:W.traps.map(t=>t.state),ph:Math.floor(P.ph*2),cph:Math.floor(Ct.an.ph*4)};}
function audioTick(){const s=aSnap(),o=AU.S;AU.S=s;const c=AU.ctx;if(!c||c.state!=='running'||!o)return;const t=c.currentTime,L=c.listener;
  /* listener: between camera and hero, facing where the camera looks */
  const lx=lerp(camera.position.x,P.x,.55),ly=lerp(camera.position.y,1,.55),lz=lerp(camera.position.z,P.z,.55);camera.getWorldDirection(_af);
  if(L.positionX){L.positionX.value=lx;L.positionY.value=ly;L.positionZ.value=lz;L.forwardX.value=_af.x;L.forwardY.value=_af.y;L.forwardZ.value=_af.z;L.upX.value=0;L.upY.value=1;L.upZ.value=0;}
  else{L.setPosition(lx,ly,lz);L.setOrientation(_af.x,_af.y,_af.z,0,1,0);}
  const H=[P.x,.6,P.z],sy=Math.sin(Ct.yaw),cy=Math.cos(Ct.yaw),C=[Ct.x+sy*1.8,Ct.y+3,Ct.z+cy*1.8,5],cv=W.cat.g.visible;
  aPos(AU.purrP,C[0],C[1],C[2]);
  const pt=cv&&Ct.state==='doze'?.32*(.45+.55*Math.abs(Math.sin(t*Math.PI/1.7))):0;AU.purr.gain.setTargetAtTime(pt,t,.12);
  if(t>AU.clock+.5)AU.clock=t;if(t>=AU.clock){AU.clock+=1;SFX.tick([-15,9,24,6],AU.tk^=1);}   /* a wall clock, far corner */
  const want=s.st==='play'?(Ct.awake&&!G.catGone?'cat':'night'):s.st==='win'?'home':s.st==='dead'?'fall':null;
  if(want!==AU.want){const f=want==='fall'?.3:want==='cat'?1.2:AU.want==='cat'?3:1.5;AU.want=want;playMusic(want,f);}
  if(s.st!==o.st){if(s.st==='dead')SFX.fall(H);if(s.st==='win')SFX.family();}
  if(o.st==='play'){
    if(s.atk!==o.atk)SFX.swing(H,P.combo);
    if(s.dash&&!o.dash)SFX.roll(H);
    if(s.blk!==o.blk)SFX.clank(H);
    if(s.hurt!==o.hurt)SFX.hurt(H);
    if(s.pick!==o.pick)SFX.pick(H,G.food>=QUOTA);
    s.tr.forEach((v,i)=>{if(v===1&&o.tr[i]===0){const q=W.traps[i];SFX.snap([q.x,.3,q.z]);}});
    if(s.hp<o.hp)SFX.catHit(C,s.hp<=0);
    else if(s.aw&&!o.aw)SFX.wake(C);
    if(s.cs!==o.cs||(s.cs==='leap'&&s.ct0!==o.ct0)){const f={tele:SFX.hiss,pounce:SFX.pounce,bitewind:SFX.growl,bite:SFX.jaw,leap:SFX.pounce}[s.cs];if(f)f(C);}
    if(o.cy>.05&&s.cy<=.001)SFX.land([Ct.x,.5,Ct.z,5]);
    if(s.hs!==o.hs){const q=[Hm.tx,s.hs==='warn'?4:1,Hm.tz,8];if(s.hs==='warn')SFX.warn(q);else if(s.hs==='fall')SFX.drop(q);else if(s.hs==='hold')SFX.stomp(q);}}
  if((s.st==='play'||s.st==='win')&&s.ph!==o.ph&&P.sp>.5&&P.dash<=0)SFX.step(H,Math.min(1,P.sp/4.6));
  /* the collar bell gives the cat away when it walks */
  if(cv&&s.st==='play'&&s.cph!==o.cph&&Ct.an.walk>.3){const q=[Ct.x,.4,Ct.z,5];SFX.paw(q);if(Math.random()<.55)SFX.bell([C[0],C[1]-.8,C[2],5],.05);}}

/* ── on/off ── */
function sLabel(){document.querySelectorAll('.sbtn').forEach(b=>{b.textContent='소리: '+(AU.on?'켬':'끔');b.setAttribute('aria-pressed',String(AU.on));});}
function setSound(on){AU.on=on;try{localStorage.setItem('mf.sound',on?'1':'0');}catch(e){}sLabel();
  if(AU.ctx){const t=AU.ctx.currentTime;AU.master.gain.setTargetAtTime(on?1:0,t,.05);if(on&&AU.ctx.state==='suspended')AU.ctx.resume();}}
document.querySelectorAll('.sbtn').forEach(b=>b.addEventListener('click',()=>{audioInit();setSound(!AU.on);}));
['pointerdown','pointerup','touchend','click','keydown'].forEach(n=>window.addEventListener(n,audioInit,{passive:true}));
window.addEventListener('keydown',e=>{if(e.code==='KeyM'&&!e.repeat)setSound(!AU.on);});
sLabel();
