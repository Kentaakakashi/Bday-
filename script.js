const screenGlow = document.createElement("div");
screenGlow.id = "screen-glow";
document.body.appendChild(screenGlow);

/* =========================
   CLEAN MASTER AUDIO + BEAT ENGINE
   ========================= */

const CLICK = new Audio('assets/click.mp3');
const MUSIC = new Audio('assets/music.mp3');
MUSIC.loop = true;
MUSIC.volume = 0.45;

let audioCtx = null;
let analyser = null;
let dataArray = null;
let beatInitialized = false;

/* Click sound */
function playClick(){
  try{
    CLICK.currentTime = 0;
    CLICK.play();
  }catch(e){}
}

/* Unlock audio only once */
function unlockAudioSystem(){
  try{
    const savedTime = parseFloat(localStorage.getItem("bgTime") || "0");
    MUSIC.currentTime = savedTime;

    if(
      !location.pathname.includes("edit.html") &&
      !location.pathname.includes("recordings.html")
    ){
      MUSIC.play();
    }

    if(!audioCtx){
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioCtx.createMediaElementSource(MUSIC);
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      dataArray = new Uint8Array(analyser.frequencyBinCount);

      source.connect(analyser);
      analyser.connect(audioCtx.destination);
    }

    if(!beatInitialized && analyser){
      createBeatBorder();
      animateBeatBorder();
      beatInitialized = true;
    }
  }catch(e){}
}

window.addEventListener("pointerdown", unlockAudioSystem, { once:true });

window.addEventListener("beforeunload", ()=>{
  try{
    localStorage.setItem("bgTime", MUSIC.currentTime);
  }catch(e){}
});

/* =========================
   PAGE COLORS (SAFE)
   ========================= */
const PAGE_COLORS = {
  "index.html": ["#ff69b4", "#ffc1dc", "#ff2d8f"],
  "menu.html": ["#ff4fd8", "#ff79c6", "#ff177a"],
  "memories.html": ["#ff9f1a", "#ffd36a", "#ff7f00"],
  "wishes.html": ["#7f5cff", "#b28dff", "#5a2bff"],
  "recordings.html": ["#00ffe1", "#00bcd4", "#0097a7"],
  "edit.html": ["#ff0033", "#ff6a00", "#ff0000"],
  "surprise.html": ["#ffd700", "#ffb700", "#ff8c00"]
};

const page = location.pathname.split("/").pop();
const ACTIVE_COLORS = PAGE_COLORS[page] || ["#ff69b4", "#ff79c6", "#ff005d"];

/* =========================
   CURSOR SPARKLE
   ========================= */
(function(){
  const cur = document.createElement('div');
  cur.className='cursor-spark';
  document.body.appendChild(cur);

  document.addEventListener('mousemove', e=>{
    cur.style.left = e.clientX + 'px';
    cur.style.top  = e.clientY + 'px';
  });

  document.addEventListener('mousedown', ()=>{
    cur.style.transform='translate(-50%,-50%) scale(.75)';
    setTimeout(()=>cur.style.transform='translate(-50%,-50%) scale(1)',140);
  });
})();

/* =========================
   FLOATING EMOJIS
   ========================= */
setInterval(()=>{
  const el = document.createElement('div');
  el.className='float-emoji';
  const pool = ['💖','🌸','✨','🎀','💕','💗','🎉','😝'];
  el.textContent = pool[Math.floor(Math.random()*pool.length)];
  el.style.left = Math.random() * window.innerWidth + "px";
  el.style.bottom = "-40px";
  el.style.fontSize = (18 + Math.random()*36) + 'px';
  el.style.animationDuration = (5 + Math.random()*5) + 's';
  document.body.appendChild(el);
  setTimeout(()=>el.remove(),9000);
},600);

/* =========================
   BUTTON PARTICLES + CLICK
   ========================= */
function spawnClickParticle(x,y){
  for(let i=0;i<8;i++){
    const p = document.createElement('div');
    p.className='float-emoji';
    p.textContent='✨';
    p.style.left = (x + (Math.random()*80-40)) + 'px';
    p.style.top  = (y + (Math.random()*60-30)) + 'px';
    p.style.animationDuration='1s';
    document.body.appendChild(p);
    setTimeout(()=>p.remove(),1200);
  }
}

document.addEventListener('click', e=>{
  const a = e.target.closest('a,button');
  if(a){
    playClick();
    spawnClickParticle(e.clientX,e.clientY);
  }
});

/* =========================
   TYPEWRITER WISH
   ========================= */
(function(){
  const area = document.getElementById('typed-area');
  const display = document.getElementById('typed-text');
  if(!area || !display) return;

  const raw = area.dataset.wish || display.textContent;
  display.textContent='';
  let i=0;

  function step(){
    if(i < raw.length){
      display.textContent += raw.charAt(i++);
      setTimeout(step,30);
    }
  }
  step();
})();

/* =========================
   RECORDINGS
   ========================= */
(function(){
  const items = document.querySelectorAll('.recording-item');
  items.forEach(item=>{
    const btn = item.querySelector('.play-bubble');
    const audio = item.querySelector('audio');
    btn.addEventListener('click', ()=>{
      if(audio.paused){ audio.play(); btn.textContent='❚❚'; }
      else{ audio.pause(); btn.textContent='▶'; }
    });
  });
})();

/* =========================
   BEAT BORDER
   ========================= */
function createBeatBorder(){
  const border = document.createElement("div");
  border.id = "beat-border";

  ["top","bottom","left","right"].forEach(side=>{
    const row = document.createElement("div");
    row.className = `beat-row beat-${side}`;
    const count = side==="top"||side==="bottom"?48:24;

    for(let i=0;i<count;i++){
      row.appendChild(document.createElement("span"));
    }
    border.appendChild(row);
  });

  document.body.appendChild(border);
}

function animateBeatBorder(){
  if(!analyser) return;

  requestAnimationFrame(animateBeatBorder);
  analyser.getByteFrequencyData(dataArray);

  let bass = dataArray[2];
  const bars = document.querySelectorAll(".beat-row span");

  bars.forEach((bar,i)=>{
    const v = dataArray[i % dataArray.length];
    const scale = Math.max(0.3, v / 120);

    bar.style.transform = `scaleY(${scale})`;

    const hue = (v * 2.2) % 360;
    bar.style.background = `hsl(${hue},100%,60%)`;
    bar.style.boxShadow = `0 0 ${14 + v/3}px hsl(${hue},100%,60%)`;
  });

  /* ===== BASS SCREEN GLOW + SHOCK ===== */
  if(bass > 160){
    document.body.classList.add("beat-flash");
    document.body.classList.add("beat-shock");

    setTimeout(()=>{
      document.body.classList.remove("beat-flash");
      document.body.classList.remove("beat-shock");
    }, 80);
  }
}
