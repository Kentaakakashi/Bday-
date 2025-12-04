/* =========================
   VIDEO + AUDIO MASTER SYSTEM
========================= */

const VIDEO = document.createElement("video");
VIDEO.src = "assets/lyrics.mp4"; // ✅ your lyrics video
VIDEO.loop = true;
VIDEO.muted = false;
VIDEO.playsInline = true;
VIDEO.id = "bg-video";

document.body.prepend(VIDEO);

const CLICK = new Audio("assets/click.mp3");

let audioCtx, analyser, dataArray, beatInit = false;

/* === Restore Time === */
const savedTime = parseFloat(localStorage.getItem("bgTime") || "0");
if(savedTime > 0) VIDEO.currentTime = savedTime;

/* === Autoplay Try === */
tryPlayVideo();
window.addEventListener("pointerdown", tryPlayVideo, { once:true });

function tryPlayVideo(){
  VIDEO.play().catch(()=>{});

  if(!audioCtx){
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const source = audioCtx.createMediaElementSource(VIDEO);
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;
    dataArray = new Uint8Array(analyser.frequencyBinCount);
    source.connect(analyser);
    analyser.connect(audioCtx.destination);
  }

  if(!beatInit){
    createBeatBorder();
    animateBeatBorder();
    beatInit = true;
  }
}

/* === Save Playback Time === */
setInterval(()=>{
  localStorage.setItem("bgTime", VIDEO.currentTime);
},1000);

/* === HUB vs OTHER PAGES === */
const page = document.body.className;

if(!page.includes("hub")){
  VIDEO.style.opacity = "0";
  VIDEO.style.pointerEvents = "none";
}else{
  VIDEO.style.opacity = "1";
}

/* === EDIT / RECORD FADE OUT === */
if(page.includes("edit-page") || page.includes("record-page")){
  VIDEO.style.transition = "opacity 1s ease";
  VIDEO.style.opacity = "0";
  setTimeout(()=>VIDEO.pause(),900);
}

/* =========================
   PAUSE BUTTON
========================= */
(function(){
  const btn = document.createElement("button");
  btn.id = "musicToggle";
  btn.innerHTML = "⏸";
  document.body.appendChild(btn);

  btn.onclick = ()=>{
    if(VIDEO.paused){
      VIDEO.play();
      btn.innerHTML = "⏸";
    }else{
      VIDEO.pause();
      btn.innerHTML = "▶";
    }
  };
})();

/* =========================
   CLICK FX
========================= */
document.addEventListener("click", e=>{
  if(e.target.closest("a,button")){
    CLICK.currentTime = 0;
    CLICK.play();
  }
});

/* =========================
   SPARKLE CURSOR TRAIL (REAL)
========================= */
document.addEventListener("mousemove", e=>{
  const dot = document.createElement("div");
  dot.className = "cursor-trail";
  dot.style.left = e.clientX+"px";
  dot.style.top  = e.clientY+"px";
  document.body.appendChild(dot);
  setTimeout(()=>dot.remove(),600);
});

/* =========================
   FLOATING EMOJIS
========================= */
setInterval(()=>{
  const el = document.createElement("div");
  el.className = "float-emoji";
  el.textContent = ["💖","✨","🌸","🎀","💕"][Math.floor(Math.random()*5)];
  el.style.left = Math.random()*innerWidth+"px";
  document.body.appendChild(el);
  setTimeout(()=>el.remove(),8000);
},700);

/* =========================
   TYPEWRITER
========================= */
(function(){
  const area = document.getElementById("typed-area");
  const display = document.getElementById("typed-text");
  if(!area||!display) return;

  const raw = area.dataset.wish || display.textContent;
  display.textContent="";
  let i=0;

  function step(){
    if(i < raw.length){
      display.textContent += raw[i++];
      setTimeout(step,30);
    }
  }
  step();
})();

/* =========================
   RECORDINGS
========================= */
document.querySelectorAll(".recording-item").forEach(item=>{
  const btn = item.querySelector(".play-bubble");
  const audio = item.querySelector("audio");
  btn.onclick = ()=>{
    if(audio.paused){ audio.play(); btn.textContent="❚❚"; }
    else{ audio.pause(); btn.textContent="▶"; }
  };
});

/* =========================
   BEAT BORDER (VIDEO AUDIO)
========================= */
function createBeatBorder(){
  const border = document.createElement("div");
  border.id="beat-border";
  ["top","bottom","left","right"].forEach(side=>{
    const row=document.createElement("div");
    row.className=`beat-row beat-${side}`;
    const count=(side==="top"||side==="bottom")?48:24;
    for(let i=0;i<count;i++) row.appendChild(document.createElement("span"));
    border.appendChild(row);
  });
  document.body.appendChild(border);
}

const glow = document.getElementById("screen-glow");

function animateBeatBorder(){
  requestAnimationFrame(animateBeatBorder);
  analyser.getByteFrequencyData(dataArray);

  const bars=document.querySelectorAll(".beat-row span");
  const bass=(dataArray[1]+dataArray[2]+dataArray[3])/3;
  const hue=(bass*2)%360;
  const color=`hsl(${hue},100%,60%)`;

  if(bass>140){
    glow.classList.add("active");
    glow.style.color=color;
    setTimeout(()=>glow.classList.remove("active"),70);
  }

  bars.forEach((bar,i)=>{
    const v=dataArray[i%dataArray.length];
    bar.style.transform=`scaleY(${Math.max(.3,v/110)})`;
    bar.style.background=color;
    bar.style.boxShadow=`0 0 ${10+v/2}px ${color}`;
  });
}

/* =========================
   MEMORY NEXT FIX (HARD FIX)
========================= */
(function(){
  const track=document.querySelector(".slide-track");
  if(!track) return;
  const slides=[...track.children];
  let index=0;

  document.getElementById("nextSlide").onclick=()=>{
    index=(index+1)%slides.length;
    track.style.transform=`translateX(-${index*100}%)`;
  };

  document.getElementById("prevSlide").onclick=()=>{
    index=(index-1+slides.length)%slides.length;
    track.style.transform=`translateX(-${index*100}%)`;
  };
})();
