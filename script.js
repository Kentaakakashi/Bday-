/* =========================
   GLOBAL ELEMENTS
========================= */
const bgVideo = document.getElementById("bgVideo");

let MUSIC = document.getElementById("bgm");
if (!MUSIC) {
  MUSIC = new Audio("assets/music.mp3");
  MUSIC.id = "bgm";
  MUSIC.loop = true;
  MUSIC.volume = 0.45;
  document.body.appendChild(MUSIC);
}

const CLICK = new Audio("assets/click.mp3");

/* =========================
   PERSIST MUSIC TIME
========================= */
const savedTime = parseFloat(localStorage.getItem("bgTime") || "0");
MUSIC.currentTime = savedTime;

/* =========================
   MOBILE AUTOPLAY FIX
========================= */
function forcePlayMusic() {
  if (MUSIC.paused) {
    MUSIC.play().catch(() => {});
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  document.removeEventListener("touchstart", forcePlayMusic);
  document.removeEventListener("click", forcePlayMusic);
}

document.addEventListener("touchstart", forcePlayMusic, { once: true });
document.addEventListener("click", forcePlayMusic, { once: true });

/* =========================
   AUTO PLAY ON LOAD
========================= */
window.addEventListener("load", () => {
  if (!location.pathname.includes("edit") && !location.pathname.includes("recordings")) {
    MUSIC.play().catch(() => {});
  }
});

/* =========================
   FADE OUT FOR EDIT/RECORD
========================= */
if (
  location.pathname.includes("edit") ||
  location.pathname.includes("recordings")
) {
  const fade = setInterval(() => {
    if (MUSIC.volume > 0.02) {
      MUSIC.volume -= 0.02;
    } else {
      MUSIC.pause();
      clearInterval(fade);
    }
  }, 40);

  if (bgVideo) {
    bgVideo.classList.add("video-hide");
  }
} else {
  if (bgVideo) bgVideo.classList.remove("video-hide");
}

/* =========================
   SAVE TIME ON EXIT
========================= */
window.addEventListener("beforeunload", () => {
  localStorage.setItem("bgTime", MUSIC.currentTime);
});

/* =========================
   CLICK SOUND
========================= */
function playClick() {
  CLICK.currentTime = 0;
  CLICK.play().catch(() => {});
}

/* =========================
   PAUSE BUTTON
========================= */
(function () {
  const btn = document.getElementById("musicToggle");
  if (!btn) return;

  btn.textContent = MUSIC.paused ? "▶️" : "⏸️";

  btn.addEventListener("click", () => {
    if (MUSIC.paused) {
      MUSIC.play();
      btn.textContent = "⏸️";
    } else {
      MUSIC.pause();
      btn.textContent = "▶️";
    }
  });
})();

/* =========================
   BEAT ANALYSER
========================= */
let audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let source = audioCtx.createMediaElementSource(MUSIC);
let analyser = audioCtx.createAnalyser();
analyser.fftSize = 128;

let dataArray = new Uint8Array(analyser.frequencyBinCount);

source.connect(analyser);
analyser.connect(audioCtx.destination);

/* =========================
   SCREEN GLOW
========================= */
const screenGlow = document.createElement("div");
screenGlow.id = "screen-glow";
document.body.appendChild(screenGlow);

/* =========================
   BEAT BORDER
========================= */
function createBeatBorder() {
  const border = document.createElement("div");
  border.id = "beat-border";

  ["top", "bottom", "left", "right"].forEach(side => {
    const row = document.createElement("div");
    row.className = `beat-row beat-${side}`;

    const count = side === "top" || side === "bottom" ? 36 : 18;

    for (let i = 0; i < count; i++) {
      row.appendChild(document.createElement("span"));
    }

    border.appendChild(row);
  });

  document.body.appendChild(border);
}
createBeatBorder();

/* =========================
   BEAT ANIMATION LOOP (FIXED)
========================= */
function animateBeatBorder() {
  requestAnimationFrame(animateBeatBorder);

  if (MUSIC.paused) return;

  analyser.getByteFrequencyData(dataArray);

  const bars = document.querySelectorAll(".beat-row span");

  let bass = dataArray[1] || 0;
  bass = bass * 0.65; // ✅ softens glow & spikes

  let hue = (bass * 2.2) % 360;
  let glowColor = `hsl(${hue},100%,60%)`;

  screenGlow.style.background = glowColor;
  screenGlow.style.opacity = bass / 300;

  bars.forEach((bar, i) => {
    const v = dataArray[i % dataArray.length];
    const scale = Math.max(0.25, v / 160);

    bar.style.transform = `scaleY(${scale})`;
    bar.style.background = glowColor;
    bar.style.boxShadow = `0 0 ${8 + v / 6}px ${glowColor}`;
  });
}
animateBeatBorder();

/* =========================
   SPARKLE CURSOR (FIXED CLASS)
========================= */
document.addEventListener("mousemove", e => {
  const spark = document.createElement("div");
  spark.className = "cursor-trail"; // ✅ FIXED
  spark.style.left = e.clientX + "px";
  spark.style.top = e.clientY + "px";
  document.body.appendChild(spark);
  setTimeout(() => spark.remove(), 500);
});

/* =========================
   FLOATING EMOJIS
========================= */
setInterval(() => {
  const el = document.createElement("div");
  el.className = "float-emoji";
  el.textContent = ["💖", "✨", "🎀", "💕"][Math.floor(Math.random() * 4)];
  el.style.left = Math.random() * window.innerWidth + "px";
  el.style.bottom = "-30px";
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 7000);
}, 700);

/* =========================
   MEMORIES CAROUSEL (FIXED)
========================= */
(function () {
  const carousel = document.querySelector(".carousel");
  if (!carousel) return;

  const track = carousel.querySelector(".slide-track");
  const slides = Array.from(track.children);
  const prev = document.getElementById("prevSlide");
  const next = document.getElementById("nextSlide");

  let idx = 0;

  function update() {
    track.style.transform = `translateX(-${idx * 100}%)`;
  }

  prev?.addEventListener("click", () => {
    idx = (idx - 1 + slides.length) % slides.length;
    update();
  });

  next?.addEventListener("click", () => {
    idx = (idx + 1) % slides.length;
    update();
  });

  update();
})();
