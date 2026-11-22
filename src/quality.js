/* ═════════ quality tiers: fur shells, shadow map, resolution, bloom taps ═════════ */
/* 'auto' starts from a device guess and steps down (never up) when the frame rate stays low. */
const QUAL=[{name:'낮음',shells:6,shadow:512,dpr:1,bloom:8},{name:'보통',shells:10,shadow:1024,dpr:1.25,bloom:12},{name:'높음',shells:14,shadow:2048,dpr:2,bloom:20}];
const Q={mode:'auto',tier:mobile?1:2,acc:0,n:0,warm:0};
try{const v=localStorage.getItem('mf.quality');if(v==='auto'||QUAL[v])Q.mode=v;}catch(e){}
function setTier(i){Q.tier=Math.max(0,Math.min(2,i));const q=QUAL[Q.tier];
  setShells(q.shells);
  if(W.key){W.key.shadow.mapSize.set(q.shadow,q.shadow);if(W.key.shadow.map){W.key.shadow.map.dispose();W.key.shadow.map=null;}}
  if(W.candle){const on=Q.tier>1,sz=512;W.candle.castShadow=on;W.candle.shadow.mapSize.set(sz,sz);if(W.candle.shadow.map){W.candle.shadow.map.dispose();W.candle.shadow.map=null;}}
  postMat.defines.BN=q.bloom;postMat.needsUpdate=true;
  const d=Math.min(window.devicePixelRatio||1,q.dpr);if(d!==DPR){DPR=d;renderer.setPixelRatio(DPR);resize();}
  qLabel();}
function qLabel(){const t='화질: '+(Q.mode==='auto'?'자동 · '+QUAL[Q.tier].name:QUAL[Q.tier].name);document.querySelectorAll('.qbtn').forEach(b=>b.textContent=t);}
function setMode(m){Q.mode=m;Q.acc=Q.n=Q.warm=0;try{localStorage.setItem('mf.quality',String(m));}catch(e){}setTier(m==='auto'?(mobile?1:2):+m);}
/* cycle: 자동 → 낮음 → 보통 → 높음 → 자동 */
document.querySelectorAll('.qbtn').forEach(b=>b.addEventListener('click',()=>setMode(Q.mode==='auto'?0:Q.mode>=2?'auto':Q.mode+1)));
document.addEventListener('visibilitychange',()=>{Q.skip=true;});
function qualMonitor(raw){if(Q.mode!=='auto'||Q.tier===0||document.hidden)return;
  if(Q.skip){Q.skip=false;Q.warm=Q.acc=Q.n=0;return;}   /* back from a hidden tab: the gap is not a slow frame */
  Q.warm+=raw;if(Q.warm<1.5)return;                     /* skip shader warm-up and resize hitches */
  Q.acc+=Math.min(raw,.5);Q.n++;if(Q.acc<2.5)return;   /* a slow device still counts, just capped per frame */
  const fps=Q.n/Q.acc;Q.acc=Q.n=0;if(fps<42){Q.warm=0;setTier(Q.tier-1);}}
function applyQuality(){setTier(Q.mode==='auto'?Q.tier:+Q.mode);}
