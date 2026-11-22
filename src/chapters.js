/* ═════════ chapters: the five nights ═════════ */
/* Everything that differs between nights lives here: goals, map layout, light, cat patterns, music, texts.
   play:false chapters are shown on the landing page only. Positions are kitchen world coordinates. */
const CH={
  1:{play:true,title:'첫 번째 밤',season:'가을',hp:5,quota:5,catHp:6,
    blurb:'벽 속 식구 넷을 먹이려고 아버지가 처음 부엌에 나선다. 덫과 거대한 발, 그리고 잠든 고양이.',
    feat:['덫 터뜨려 치즈 얻기','인간 발 피하기','고양이와 첫 싸움'],
    crumbs:[[3.5,-1.5],[-10,6],[1,12]],traps:[[-1,3.2,.4],[10,9.5,-1],[-8,14,2],[4,20.5,.3]],glue:[],puddles:[],
    cat:[11,21,-2.5],swipe:false,charge:false,rain:false,music:'night',
    env:{fog:0x070a12,near:9,far:40,key:0x8fb2ff,ki:1.1,hemi:.7,shaft:.08},
    end:['제1장 끝','오늘 저녁은 치즈 다섯 조각','내일 밤에도 그는 다시 문턱을 넘을 것이다.']},
  2:{play:true,title:'비 오는 밤',season:'장마',hp:5,quota:6,catHp:8,
    blurb:'지붕이 새고 아이들이 떤다. 젖은 바닥은 미끄럽고 끈끈이가 숨어 있다. 고양이는 이제 앞발을 휘두르고, 화가 나면 돌진한다.',
    feat:['미끄러운 물웅덩이','끈끈이 — 칼을 연타해 떼어내기','앞발 휘두르기 · 돌진하는 고양이'],
    crumbs:[[-12,1.5],[6,3.6],[-3.5,11],[12.5,15]],traps:[[2.2,7,.8],[-9.5,17.5,1.6],[8.5,21.5,-.4]],
    glue:[[-1.2,1.8,.1],[9,11.2,.6],[-7.5,9.6,.3],[1.5,16.3,-.2]],
    puddles:[[-3.4,5.2,1.7],[4.4,9.6,1.4],[-10.4,11.6,1.9],[2.8,19.4,1.6],[11.6,6.6,1.3]],
    cat:[-9,22,2.6],swipe:true,charge:true,rain:true,music:'rain',
    env:{fog:0x04070d,near:7,far:32,key:0x6f88b8,ki:.7,hemi:.5,shaft:.035},
    end:['제2장 끝','여섯 조각, 그리고 마른 이불','빗소리가 그칠 무렵, 막내의 기침은 더 깊어져 있었다.']},
  3:{play:false,title:'약을 구하러',season:'초겨울',blurb:'막내의 기침이 멎지 않는다. 약은 찬장 꼭대기에 있다. 처음으로, 아버지는 두렵다.',feat:['의자와 서랍 오르기','통발 덫','흰 털 몇 가닥 · 체력 4']},
  4:{play:false,title:'겨울밤',season:'한겨울',blurb:'촛불이 다 타기 전에 돌아와야 한다. 상처 입은 고양이가 다시 일어섰다.',feat:['촛불 시간 제한','먹으면 안 되는 쥐약 미끼','고양이 2차전']},
  5:{play:false,title:'볕 드는 날',season:'봄 새벽',blurb:'마지막 밤. 아버지는 이제 혼자 문턱을 넘지 않는다.',feat:['다 자란 아들과 함께','고양이 최종전','새벽 햇살']}
};
const CHN=['','제1장','제2장','제3장','제4장','제5장'],KNUM=['','한','두','세','네','다섯','여섯','일곱'];
/* progress: which nights have been cleared (survives reloads; works without storage too) */
const PROG={done:{}};
try{const v=JSON.parse(localStorage.getItem('mf.done')||'{}');if(v&&typeof v==='object')PROG.done=v;}catch(e){}
function markDone(n){PROG.done[n]=1;try{localStorage.setItem('mf.done',JSON.stringify(PROG.done));}catch(e){}}
