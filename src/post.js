/* ═════════ post: bloom, grade, vignette, grain ═════════ */
const postScene=new T.Scene(),postCam=new T.OrthographicCamera(-1,1,1,-1,0,1);
const postMat=new T.ShaderMaterial({depthTest:false,depthWrite:false,uniforms:{tD:{value:null},res:{value:new T.Vector2(1,1)},time:{value:0}},
  vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}',
  fragmentShader:`precision highp float;uniform sampler2D tD;uniform vec2 res;uniform float time;varying vec2 vUv;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
void main(){vec2 uv=vUv;float asp=res.x/res.y;vec3 c=texture2D(tD,uv).rgb;vec3 b=vec3(0.);
  for(int i=0;i<20;i++){float fi=float(i),an=fi*2.39996,rr=sqrt((fi+.5)/20.)*.032;b+=max(texture2D(tD,uv+vec2(cos(an),sin(an)*asp)*rr).rgb-.6,0.);}
  c+=b/20.*3.2;c=(c-.5)*1.12+.5;float l=dot(c,vec3(.299,.587,.114));c=mix(vec3(l),c,1.05)*vec3(.97,1.,1.06);
  float v=smoothstep(.98,.28,length((uv-.5)*vec2(1.,1.12)));c*=mix(1.,v,.7);c+=(h(uv*res+fract(time)*61.)-.5)*.04;gl_FragColor=vec4(clamp(c,0.,1.),1.);}`});
postScene.add(new T.Mesh(new T.PlaneGeometry(2,2),postMat));

