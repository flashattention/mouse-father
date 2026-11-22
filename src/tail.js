
/* ═════════ input ═════════ */
let rt=null,joyId=null,camId=null,joy0=null,camLast=null;
function resize(){const w=canvas.clientWidth||innerWidth,h=canvas.clientHeight||innerHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.fov=w<h?66:50;camera.updateProjectionMatrix();
  if(rt)rt.dispose();const Wd=Math.floor(w*DPR),Hd=Math.floor(h*DPR),opt={minFilter:T.LinearFilter,magFilter:T.LinearFilter,format:T.RGBAFormat};
  rt=renderer.capabilities.isWebGL2&&T.WebGLMultisampleRenderTarget?new T.WebGLMultisampleRenderTarget(Wd,Hd,opt):new T.WebGLRenderTarget(Wd,Hd,opt);postMat.uniforms.tD.value=rt.texture;postMat.uniforms.res.value.set(Wd,Hd);}
window.addEventListener('resize',resize);
canvas.addEventListener('pointerdown',e=>{if(G.state!=='play')return;try{canvas.setPointerCapture(e.pointerId);}catch(_){}
  if(e.pointerType==='touch'&&e.clientX<innerWidth*.45&&joyId===null){joyId=e.pointerId;joy0={x:e.clientX,y:e.clientY};const j=$('joy');j.style.left=e.clientX+'px';j.style.top=e.clientY+'px';j.style.display='block';$('knob').style.transform='';}
  else if(camId===null){camId=e.pointerId;camLast={x:e.clientX,y:e.clientY};}});
canvas.addEventListener('pointermove',e=>{
  if(e.pointerId===joyId){let dx=e.clientX-joy0.x,dy=e.clientY-joy0.y;const l=hyp(dx,dy),m=52;if(l>m){dx*=m/l;dy*=m/l;}In.x=dx/m;In.y=-dy/m;$('knob').style.transform='translate('+dx+'px,'+dy+'px)';}
  else if(e.pointerId===camId){cam.yaw-=(e.clientX-camLast.x)*.007;cam.pitch=Math.max(.02,Math.min(.75,cam.pitch+(e.clientY-camLast.y)*.004));camLast={x:e.clientX,y:e.clientY};cam.manual=G.t;}});
const up=e=>{if(e.pointerId===joyId){joyId=null;In.x=In.y=0;$('joy').style.display='none';}if(e.pointerId===camId)camId=null;};
canvas.addEventListener('pointerup',up);canvas.addEventListener('pointercancel',up);
const hold=(id,down,rel)=>{const b=$(id);b.addEventListener('pointerdown',e=>{e.preventDefault();b.classList.add('on');down();});
  ['pointerup','pointercancel','pointerleave'].forEach(n=>b.addEventListener(n,()=>{b.classList.remove('on');if(rel)rel();}));};
hold('b-atk',()=>In.atk=true);hold('b-dash',()=>In.dash=true);hold('b-shd',()=>In.shd=true,()=>In.shd=false);
window.addEventListener('keydown',e=>{if(e.repeat){if(e.code==='Space')e.preventDefault();return;}keys[e.code]=true;
  if(e.code==='Space'||e.code==='KeyJ'){e.preventDefault();In.atk=true;}if(e.code==='ShiftLeft'||e.code==='ShiftRight'||e.code==='KeyK')In.shd=true;if(e.code==='KeyL'||e.code==='KeyE')In.dash=true;
  if(e.code.indexOf('Arrow')===0)e.preventDefault();});
window.addEventListener('keyup',e=>{keys[e.code]=false;if(e.code==='ShiftLeft'||e.code==='ShiftRight'||e.code==='KeyK')In.shd=false;});
window.addEventListener('blur',()=>{for(const k in keys)keys[k]=false;In.shd=false;In.x=In.y=0;});
$('keys').textContent=touch?'왼쪽 화면을 끌어 이동, 오른쪽 화면을 끌어 시점 회전. 칼 · 방패(누르고 있기) · 구르기 버튼.':'이동 WASD · 시점 마우스 끌기 · 칼 Space · 방패 Shift(누르고 있기) · 구르기 E · 소리 M';
$('go').addEventListener('click',begin);$('again').addEventListener('click',begin);

/* ═════════ loop ═════════ */
let last=0;
function frame(ms){const raw=last?(ms-last)/1000:0,dt=Math.min(.05,raw);last=ms;qualMonitor(raw);step(dt);audioTick();
  postMat.uniforms.time.value=G.t;renderer.setRenderTarget(rt);renderer.render(W.scene,camera);renderer.setRenderTarget(null);renderer.render(postScene,postCam);requestAnimationFrame(frame);}
function start(){resize();qLabel();const b=$('go'),fail=e=>{console.error(e);b.textContent='불러오지 못했습니다';};
  setTimeout(()=>{try{buildWorld();}catch(e){fail(e);return;}
    runSculpts((d,n)=>{b.textContent='캐릭터를 조형하는 중… '+d+' / '+n;}).then(()=>{reset();applyQuality();
      b.disabled=false;b.textContent='문턱을 넘는다';requestAnimationFrame(frame);}).catch(fail);},60);}
start();
})();
</script>
</body>
</html>
