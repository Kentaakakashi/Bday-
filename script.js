/* =========================
   GLOBAL VIDEO SETUP
========================= */
const bgVideo = document.getElementById("bgVideo");

if (!bgVideo) {
  console.error("bgVideo element not found!");
}

bgVideo.loop = true;
bgVideo.volume = 0.6;

/* =========================
   RESTORE VIDEO TIME
========================= */
const savedTime = parseFloat(localStorage.getItem("videoTime") || "0");
bgVideo.currentTime = savedTime;

/* =========================
   PAGE CHECK
========================= */
const isWishPage = location.pathname.toLowerCase().includes("wish");

/* =========================
   AUTO PLAY LOGIC
========================= */
window.addEventListener("load", () => {
  if (!isWishPage) {
    bgVideo.muted = false;
    bgVideo.play().catch(() => {});
  } else {
    bgVideo.pause();
    bgVideo.muted = true;
    bgVideo.style.opacity = "0";
  }
});

/* =========================
   SAVE TIME ALWAYS
========================= */
setInterval(() => {
  localStorage.setItem("videoTime", bgVideo.currentTime);
}, 500);

/* =========================
   WISH PAGE HARD BLOCK
========================= */
if (isWishPage) {
  bgVideo.pause();
  bgVideo.muted = true;
  bgVideo.style.opacity = "0";
  bgVideo.style.pointerEvents = "none";
}

/* =========================
   RESUME ON LEAVE WISH PAGE
========================= */
if (!isWishPage) {
  bgVideo.muted = false;
  bgVideo.style.opacity = "1";
}

/* =========================
   PAUSE BUTTON (VIDEO BASED)
========================= */
(function () {
  const btn = document.getElementById("musicToggle");
  if (!btn) return;

  btn.textContent = bgVideo.paused ? "▶️" : "⏸️";

  btn.addEventListener("click", () => {
    if (bgVideo.paused) {
      bgVideo.play();
      btn.textContent = "⏸️";
    } else {
      bgVideo.pause();
      btn.textContent = "▶️";
    }
  });
})();

/* =========================
   BEAT ANALYSER (VIDEO AUDIO)
========================= */
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const source = audioCtx.createMediaElementSource(bgVideo);
const analyser = audioCtx.createAnalyser();

analyser.fftSize = 256;
const dataArray = new Uint8Array(analyser.frequencyBinCount);

source.connect(analyser);
analyser.connect(audioCtx.destination);

/* =========================
   SCREEN GLOW
========================= */
const screenGlow = document.createElement("div");
screenGlow.id = "screen-glow";
document.body.appendChild(screenGlow);

/* =========================
   BEAT BORDER CREATION
========================= */
function createBeatBorder() {
  const border = document.createElement("div");
  border.id = "beat-border";

  ["top", "bottom", "left", "right"].forEach(side => {
    const row = document.createElement("div");
    row.className = `beat-row beat-${side}`;

    const count = side === "top" || side === "bottom" ? 48 : 24;

    for (let i = 0; i < count; i++) {
      row.appendChild(document.createElement("span"));
    }

    border.appendChild(row);
  });

  document.body.appendChild(border);
}
createBeatBorder();

/* =========================
   BEAT ANIMATION LOOP
========================= */
function animateBeatBorder() {
  requestAnimationFrame(animateBeatBorder);
  analyser.getByteFrequencyData(dataArray);

  const bars = document.querySelectorAll(".beat-row span");
  const bass = dataArray[2] || 0;
  const hue = (bass * 3) % 360;
  const glowColor = `hsl(${hue},100%,60%)`;

  screenGlow.style.background = glowColor;
  screenGlow.style.opacity = bass / 255;

  bars.forEach((bar, i) => {
    const v = dataArray[i % dataArray.length];
    const scale = Math.max(0.4, v / 120);
    bar.style.transform = `scaleY(${scale})`;
    bar.style.background = glowColor;
    bar.style.boxShadow = `0 0 ${12 + v / 4}px ${glowColor}`;
  });
}
animateBeatBorder();
