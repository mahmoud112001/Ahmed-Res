
/* ========== DATA ========== */
const gradesData=[
  {name:"العلوم",score:29,max:40,pct:72.5},
  {name:"الدراسات الاجتماعية",score:30,max:40,pct:75},
  {name:"English",score:44,max:60,pct:73},
  {name:"رياضيات",score:34,max:60,pct:57},
  {name:"اللغة العربية",score:66,max:80,pct:82.5}
];
const totalScore=gradesData.reduce((a,b)=>a+b.score,0);
const totalMax=gradesData.reduce((a,b)=>a+b.max,0);
const totalPct=((totalScore/totalMax)*100).toFixed(1);

/* ========== MESSAGES ========== */
const FIRST_MSG="استر يا دولي دة اعراض ناس 😤";
const LAST_MSG="يعم خلاص أوريك... دة انت مصمم بقا 😤✅";
const rndMsgs=[
  "يعني الدولي مش عايز يستر 🤔",
  "يعم اعمل معروف مينفعش والله 😂",
  "متضعطش عليا وتجري للرزيلة وأنا بحبها بصراحة 💔",
  "تدفع كام وأنا أوريك؟ هتدفع هتشوف اللي عمرك ما شوفته... أما ابو بلاش دة معرفهوش 💸"
];
const pressHints={1:"يا دولي!",2:"هو دة بتعمل إيه؟",3:"شايل إيه على قلبك؟",4:"يسطا بقا!",5:"أوكيه... أوكيه..."};

/* ========== STATE ========== */
let pressCount=0,transX=0,transY=0,popupCb=null;

/* ========== STARS ========== */
(function(){
  const s=document.getElementById('stars');
  for(let i=0;i<60;i++){
    const d=document.createElement('div');
    d.className='star';
    const sz=Math.random()*3+1;
    d.style.cssText=`width:${sz}px;height:${sz}px;left:${Math.random()*100}%;top:${Math.random()*100}%;animation-delay:${Math.random()*3}s;animation-duration:${1.5+Math.random()*2}s`;
    s.appendChild(d);
  }
})();

/* ========== AUDIO ========== */
let actx=null;
function initAudio(){if(!actx)actx=new(window.AudioContext||window.webkitAudioContext)();}
function playSound(type){
  try{
    initAudio();
    const o=actx.createOscillator(),g=actx.createGain();
    o.connect(g);g.connect(actx.destination);
    if(type==='run'){
      o.frequency.setValueAtTime(800,actx.currentTime);
      o.frequency.exponentialRampToValueAtTime(200,actx.currentTime+.3);
      g.gain.setValueAtTime(.3,actx.currentTime);
      g.gain.exponentialRampToValueAtTime(.01,actx.currentTime+.3);
    }else if(type==='win'){
      [523,659,784,1047].forEach((f,i)=>o.frequency.setValueAtTime(f,actx.currentTime+i*.12));
      g.gain.setValueAtTime(.3,actx.currentTime);
      g.gain.exponentialRampToValueAtTime(.01,actx.currentTime+.6);
    }else{
      o.frequency.setValueAtTime(440,actx.currentTime);
      g.gain.setValueAtTime(.2,actx.currentTime);
      g.gain.exponentialRampToValueAtTime(.01,actx.currentTime+.2);
    }
    o.start();o.stop(actx.currentTime+.7);
  }catch(e){}
}

/* ========== YES / NO ========== */
function pressYes(){
  pressCount++;
  playSound('run');
  const btn=document.getElementById('yes-btn');
  document.getElementById('counter-badge').textContent=`عدد المحاولات: ${pressCount} / 5`;
  document.getElementById('progress-msg').textContent=pressHints[pressCount]||'';
  btn.classList.add('fizzy');
  setTimeout(()=>btn.classList.remove('fizzy'),450);

  if(pressCount<=5){
    const card=document.getElementById('main-card');
    const cR=card.getBoundingClientRect();
    const bR=btn.getBoundingClientRect();
    const m=14;
    let dx=(Math.random()-.5)*260,dy=(Math.random()-.5)*160;
    if(bR.left+dx<cR.left+m) dx=Math.abs(dx);
    if(bR.right+dx>cR.right-m) dx=-Math.abs(dx);
    if(bR.top+dy<cR.top+m) dy=Math.abs(dy);
    if(bR.bottom+dy>cR.bottom-m) dy=-Math.abs(dy);
    transX+=dx;transY+=dy;
    btn.style.transform=`translate(${transX}px,${transY}px)`;
  }

  if(pressCount===1){
    showPopup(FIRST_MSG,'😤');
  }else if(pressCount<5){
    showPopup(rndMsgs[Math.floor(Math.random()*rndMsgs.length)],'😂');
  }else if(pressCount===5){
    showPopup(rndMsgs[Math.floor(Math.random()*rndMsgs.length)],'😂');
    setTimeout(()=>{
      btn.style.transform='none';transX=0;transY=0;
      setTimeout(()=>showPopup(LAST_MSG,'😤✅',true),600);
    },900);
  }
}

function pressNo(){
  playSound('beep');
  showPopup('احسن بردو... معنداش درجات تنكشف على رجالة 😏','🙈');
}

/* ========== POPUP ========== */
function showPopup(msg,emoji,triggerPuzzle){
  document.querySelector('.popup-overlay')?.remove();
  const ov=document.createElement('div');
  ov.className='popup-overlay';
  ov.innerHTML=`<div class="popup"><span class="popup-emoji">${emoji||'😄'}</span><div class="popup-msg">${msg}</div><button class="popup-close">تمام يعم 👍</button></div>`;
  document.body.appendChild(ov);
  ov.querySelector('.popup-close').addEventListener('click',()=>{
    ov.remove();
    if(triggerPuzzle)showPuzzle();
  });
}

/* ========== SHOW PUZZLE ========== */
function showPuzzle(){
  document.getElementById('intro-section').style.display='none';
  document.getElementById('puzzle-section').style.display='block';
  initDragDrop();
}

/* ========== DRAG & DROP — Pointer Events (works on all devices) ========== */
function initDragDrop(){
  const src=document.getElementById('drag-source');
  const img=document.getElementById('drag-ahmed');
  const target=document.getElementById('drop-target');
  const ghost=document.getElementById('drag-ghost');
  let dragging=false;

  /* Also keep native HTML5 drag for desktop */
  img.draggable=true;
  img.addEventListener('dragstart',e=>{
    e.dataTransfer.setData('text','ahmed');
    src.classList.add('dragging');
    playSound('run');
  });
  img.addEventListener('dragend',()=>src.classList.remove('dragging'));
  target.addEventListener('dragover',e=>{e.preventDefault();target.classList.add('over');});
  target.addEventListener('dragleave',()=>target.classList.remove('over'));
  target.addEventListener('drop',e=>{e.preventDefault();target.classList.remove('over');dropSuccess();});

  /* Pointer Events — reliable on mobile & desktop */
  src.addEventListener('pointerdown',e=>{
    if(e.button&&e.button!==0)return; // left click / touch only
    dragging=true;
    src.setPointerCapture(e.pointerId);
    src.classList.add('dragging');
    playSound('run');
    // show ghost
    ghost.style.display='block';
    ghost.style.left=e.clientX+'px';
    ghost.style.top=e.clientY+'px';
  });

  src.addEventListener('pointermove',e=>{
    if(!dragging)return;
    ghost.style.left=e.clientX+'px';
    ghost.style.top=e.clientY+'px';
    // detect hover over drop zone
    ghost.style.display='none';
    const el=document.elementFromPoint(e.clientX,e.clientY);
    ghost.style.display='block';
    const over=el&&(el===target||target.contains(el));
    target.classList.toggle('over',!!over);
  });

  src.addEventListener('pointerup',e=>{
    if(!dragging)return;
    dragging=false;
    src.classList.remove('dragging');
    ghost.style.display='none';
    target.classList.remove('over');
    // check if released over target
    ghost.style.display='none';
    const el=document.elementFromPoint(e.clientX,e.clientY);
    if(el&&(el===target||target.contains(el))){
      dropSuccess();
    }
  });

  src.addEventListener('pointercancel',()=>{
    dragging=false;
    src.classList.remove('dragging');
    ghost.style.display='none';
    target.classList.remove('over');
  });
}

function dropSuccess(){
  const target=document.getElementById('drop-target');
  if(target.classList.contains('done'))return; // prevent double trigger
  target.classList.add('done');
  playSound('win');
  target.innerHTML=`
    <img src="ahmed.jpg" style="width:clamp(65px,18vw,85px);height:clamp(65px,18vw,85px);border-radius:12px;object-fit:cover;border:3px solid #2ed573;display:block"
      onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22><circle cx=%2250%22 cy=%2250%22 r=%2250%22 fill=%22%232ed573%22/><text x=%2250%22 y=%2265%22 text-anchor=%22middle%22 fill=%22white%22 font-size=%2240%22>😎</text></svg>'"/>
    <div style="color:#2ed573;font-size:13px;font-weight:700;margin-top:6px">برافو! 🎉</div>`;
  document.getElementById('puzzle-hint').textContent='جاهز تشوف النتيجة؟ 🎊';
  setTimeout(()=>showResults(),1300);
}

/* ========== RESULTS ========== */
function showResults(){
  document.getElementById('puzzle-section').style.display='none';
  document.getElementById('result-section').style.display='block';
  launchConfetti();playSound('win');
  const tbody=document.getElementById('res-body');
  gradesData.forEach(item=>{
    const tr=document.createElement('tr');
    tr.innerHTML=`<td style="text-align:right">${item.name}</td><td>${item.score}</td><td>${item.max}</td><td><span style="color:#ffd700">${item.pct}%</span><div class="progress-wrap"><div class="progress-fill" data-w="${item.pct}%"></div></div></td>`;
    tbody.appendChild(tr);
  });
  const tot=document.createElement('tr');
  tot.className='total-row-res';
  tot.innerHTML=`<td>المجموع الكلي</td><td>${totalScore}</td><td>${totalMax}</td><td><span>${totalPct}%</span><div class="progress-wrap"><div class="progress-fill progress-fill-gold" data-w="${totalPct}%"></div></div></td>`;
  tbody.appendChild(tot);
  setTimeout(()=>document.querySelectorAll('.progress-fill').forEach(b=>b.style.width=b.dataset.w),350);
  setTimeout(()=>{launchConfetti();playSound('win');},2200);
}

/* ========== CONFETTI ========== */
function launchConfetti(){
  const colors=['#f093fb','#f5576c','#ffd700','#667eea','#2ed573','#ff6b6b','#48dbfb','#fff'];
  for(let i=0;i<70;i++){
    const c=document.createElement('div');
    c.className='confetti-piece';
    const sz=5+Math.random()*10;
    c.style.cssText=`left:${Math.random()*100}vw;top:-20px;background:${colors[Math.floor(Math.random()*colors.length)]};width:${sz}px;height:${sz}px;border-radius:${Math.random()>.5?'50%':'2px'};animation-duration:${2+Math.random()*2}s;animation-delay:${Math.random()*.6}s`;
    document.body.appendChild(c);
    setTimeout(()=>c.remove(),4000);
  }
}
