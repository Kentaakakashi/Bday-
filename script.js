/* ===============================
   VIDEO + MASTER AUDIO ENGINE
================================ */

const VIDEO = document.getElementById("bgVideo");
VIDEO.muted = false;
VIDEO.volume = 0.6;

let audioCtx, analyser, dataArray, beatInit=false;

/* ===== AUTO PLAY FIX ===== */
function unlockSystem(){
  VIDEO.play().catch(()=>{});
  
  if(!audioCtx){
    audioCtx = new (window.AudioContext||window.webkitAudioContext)();
    const source = audioCtx.createMediaElementSource(VIDEO);
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;
    dataArray = new Uint8Array(analyser.frequencyBinCount);

    source.connect(analyser);
    analyser.connect(audioCtx.destination);

    createBeatBorder();
    animateBeat();
    beatInit = true;
  }
}
window.addEventListener("pointerdown",unlockSystem,{once:true});

/* ===== SAVE VIDEO TIME BETWEEN PAGES ===== */
VIDEO.currentTime = localStorage.getItem("vTime") || 0;
setInterval(()=>{
  localStorage.setItem("vTime",VIDEO.currentTime);
},1000);

/* ===== PAGE BASED VIDEO BEHAVIOR ===== */
const page = location.pathname.split("/").pop();

if(page !== "index.html"){
  VIDEO.classList.add("video-hide");
}

if(page === "edit.html" || page === "recordings.html"){
  VIDEO.pause();
  VIDEO.classList.add("video-hide");
}

/* ===== PAUSE BUTTON ===== */
const btn = document.createElement("button");
btn.id="musicToggle";
btn.textContent="⏸️";
document.body.appendChild(btn);

btn.onclick=()=>{
  if(VIDEO.paused){
    VIDEO.play();
    btn.textContent="⏸️";
  }else{
    VIDEO.pause();
    btn.textContent="▶️";
  }
};

/* ===============================
   BEAT BORDER ENGINE
================================ */
function createBeatBorder(){
  const b=document.createElement("div");
  b.id="beat-border";
  ["top","bottom","left","right"].forEach(side=>{
    const row=document.createElement("div");
    row.className=`beat-row beat-${side}`;
    const count=side=="top"||side=="bottom"?48:24;
    for(let i=0;i<count;i++) row.appendChild(document.createElement("span"));
    b.appendChild(row);
  });
  document.body.appendChild(b);
}

function animateBeat(){
  requestAnimationFrame(animateBeat);
  analyser.getByteFrequencyData(dataArray);

  const bars=document.querySelectorAll(".beat-row span");
  let bass=dataArray[3];

  let hue=(bass*2.8)%360;
  let glow=`hsl(${hue},100%,65%)`;

  bars.forEach((bar,i)=>{
    const v=dataArray[i%dataArray.length];
    bar.style.transform=`scaleY(${Math.max(.4,v/100)})`;
    bar.style.background=glow;
    bar.style.boxShadow=`0 0 ${20+v/2}px ${glow}`;
  });
}

/* ===============================
   SPARKLE CURSOR (REAL ONE)
================================ */
const trail=[];
for(let i=0;i<10;i++){
  const s=document.createElement("div");
  s.className="spark";
  document.body.appendChild(s);
  trail.push(s);
}
document.addEventListener("mousemove",e=>{
  trail.forEach((s,i)=>{
    setTimeout(()=>{
      s.style.left=e.clientX+"px";
      s.style.top=e.clientY+"px";
    },i*20);
  });
});
