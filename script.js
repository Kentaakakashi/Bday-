/* =========================
   VIDEO BASE SETUP
========================= */
const bgVideo = document.getElementById("bgVideo");

if (!bgVideo) {
  console.error("❌ bgVideo not found in HTML");
}

bgVideo.loop = true;
bgVideo.volume = 0.7;
bgVideo.playsInline = true;

/* =========================
   PAGE DETECTION (FIXED)
========================= */
const isWishPage =
  document.body.classList.contains("wish-page") ||
  location.pathname.toLowerCase().includes("wish");

/* =========================
   RESTORE LAST TIME
========================= */
let savedTime = parseFloat(localStorage.getItem("videoTime") || "0");

bgVideo.addEventListener("loadedmetadata", () => {
  if (!isNaN(savedTime)) bgVideo.currentTime = savedTime;
});

/* =========================
   AUTO PLAY LOGIC
========================= */
window.addEventListener("load", () => {
  if (!isWishPage) {
    bgVideo.muted = false;
    bgVideo.classList.remove("video-hide");

    const playPromise = bgVideo.play();
    if (playPromise) playPromise.catch(() => {});
  } else {
    hideVideoHard();
  }
});

/* =========================
   SAVE VIDEO TIME ALWAYS
========================= */
setInterval(() => {
  if (!bgVideo.paused) {
    localStorage.setItem("videoTime", bgVideo.currentTime);
  }
}, 400);

/* =========================
   HARD HIDE FOR WISH PAGE
========================= */
function hideVideoHard() {
  bgVideo.pause();
  bgVideo.muted = true;
  bgVideo.classList.add("video-hide");
  bgVideo.style.pointerEvents = "none";
}

/* =========================
   RESUME AFTER WISH
========================= */
if (!isWishPage) {
  bgVideo.muted = false;
  bgVideo.classList.remove("video-hide");
}

/* =========================
   PAUSE BUTTON (VIDEO ONLY)
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
   AUDIO ANALYSER (VIDEO)
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
   BEAT ANIMATION
========================= */
function animateBeatBorder() {
  requestAnimationFrame(animateBeatBorder);

  if (bgVideo.paused) return;

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
