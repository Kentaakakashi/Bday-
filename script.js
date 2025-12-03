/* Ultra-decorated script: cursor, floats, carousel, typewriter, recordings, UI sounds, transitions */
const CLICK = new Audio('assets/click.mp3');
const MUSIC = new Audio('assets/music.mp3');
MUSIC.loop = true; MUSIC.volume = 0.45;

function playClick(){ try{ CLICK.currentTime = 0; CLICK.play(); }catch(e){} }

/* auto-play music on first user interaction (many browsers block autoplay) */
function initMusicOnFirstInteraction(){
  function start(){
    try{ MUSIC.play(); }catch(e){}
    window.removeEventListener('pointerdown', start);
  }
  window.addEventListener('pointerdown', start);
}
initMusicOnFirstInteraction();

/* sparkle cursor */
(function(){
  const cur = document.createElement('div'); cur.className='cursor-spark'; document.body.appendChild(cur);
  document.addEventListener('mousemove', (e)=>{ cur.style.left = e.clientX + 'px'; cur.style.top = e.clientY + 'px'; cur.style.transform = 'translate(-50%,-50%) scale(1.0)'; });
  document.addEventListener('mousedown', ()=>{ cur.style.transform = 'translate(-50%,-50%) scale(.85)'; setTimeout(()=>cur.style.transform='translate(-50%,-50%) scale(1)',140) });
})();

/* floating emojis/hearts generator */
setInterval(()=>{
  const el = document.createElement('div'); el.className='float-emoji';
  const pool = ['💖','🌸','✨','🎀','💕','💗','🎉','😝'];
  el.textContent = pool[Math.floor(Math.random()*pool.length)];
  emoji.style.left = Math.random() * window.innerWidth + "px";
  emoji.style.bottom = "-40px";
  el.style.fontSize = (18 + Math.random()*36) + 'px';
  el.style.animationDuration = (5 + Math.random()*5) + 's';
  document.body.appendChild(el);
  setTimeout(()=> el.remove(), 9000);
}, 420);

/* page header underline reveal */
document.addEventListener('DOMContentLoaded', ()=>{
  const h = document.querySelector('.animated-header');
  if(h) setTimeout(()=> h.classList.add('show-underline'), 350);
});

/* click particle burst for buttons */
function spawnClickParticle(x,y){
  for(let i=0;i<8;i++){
    const p = document.createElement('div'); p.className='float-emoji'; p.textContent=['✨','💗','🌸'][Math.floor(Math.random()*3)];
    p.style.left = (x + (Math.random()*80-40)) + 'px';
    p.style.top = (y + (Math.random()*60-30)) + 'px';
    p.style.fontSize = (10 + Math.random()*22) + 'px';
    p.style.animationDuration = (600 + Math.random()*800) + 'ms';
    document.body.appendChild(p);
    setTimeout(()=>p.remove(), 1200);
  }
}
document.addEventListener('click', (e)=>{
  const a = e.target.closest('a, button');
  if(a) { try{ playClick(); spawnClickParticle(e.clientX, e.clientY); }catch(e){} }
});

/* MEMORIES CAROUSEL */
(function(){
  const carousel = document.querySelector('.carousel');
  if(!carousel) return;
  const track = carousel.querySelector('.slide-track');
  const slides = Array.from(track.children);
  const prev = document.getElementById('prevSlide');
  const next = document.getElementById('nextSlide');
  let idx = 0;
  function update(){ track.style.transform = `translateX(-${idx*100}%)`; const cap = slides[idx].dataset.caption||''; const capBox = document.querySelector('.caption'); if(capBox) capBox.textContent = cap; }
  prev && prev.addEventListener('click', ()=>{ idx = (idx-1+slides.length)%slides.length; update(); });
  next && next.addEventListener('click', ()=>{ idx = (idx+1)%slides.length; update(); });
  // swipe
  let sx=null;
  const vp = carousel.querySelector('.carousel-viewport');
  vp && vp.addEventListener('touchstart', e=> sx = e.touches[0].clientX);
  vp && vp.addEventListener('touchend', e=> { if(sx===null) return; const dx = e.changedTouches[0].clientX - sx; if(dx>40) idx=(idx-1+slides.length)%slides.length; else if(dx<-40) idx=(idx+1)%slides.length; update(); sx=null; });
  update();
})();

/* TYPEWRITER (wishes) */
(function(){
  const area = document.getElementById('typed-area');
  if(!area) return;
  const display = document.getElementById('typed-text');
  let caret = document.getElementById('lemonCaret');
  if(!caret){ caret = document.createElement('div'); caret.id='lemonCaret'; caret.textContent='🍋'; area.appendChild(caret); }
  const raw = area.dataset.wish || display.textContent || "My dearest Kavimitha, happy birthday!\\nYou are my world.";
  const text = raw;
  display.textContent = '';
  let i=0, speed=28;
  function placeCaret(){
    try{
      const range = document.createRange(); range.selectNodeContents(display); range.collapse(false);
      const rects = range.getClientRects(); const parentRect = area.getBoundingClientRect();
      let left=12, top=12;
      if(rects.length){ const r = rects[rects.length-1]; left = r.right - parentRect.left + 4; top = r.bottom - parentRect.top - 6; } else { const dr = display.getBoundingClientRect(); left = dr.left - parentRect.left + 8; top = dr.bottom - parentRect.top - 6; }
      caret.style.left = Math.max(8,left) + 'px'; caret.style.top = Math.max(8,top) + 'px';
    }catch(e){}
  }
  function step(){
    if(i < text.length){ display.textContent += text.charAt(i); i++; placeCaret(); const ch = text.charAt(i-1); const delay = (ch==='.'||ch===','||ch==='?')? speed*6 : speed; setTimeout(step, delay); } else { setTimeout(()=>{ caret.style.transform='translateY(-140px) rotate(20deg) scale(1.2)'; caret.style.opacity='0'; }, 800); }
  }
  placeCaret(); setTimeout(step, 420);
  window.addEventListener('resize', placeCaret);
})();

/* RECORDINGS: bubble players + fake waveform animation */
(function(){
  const items = document.querySelectorAll('.recording-item');
  if(!items.length) return;
  items.forEach(item=>{
    const btn = item.querySelector('.play-bubble');
    const audio = item.querySelector('audio');
    const bars = item.querySelectorAll('.wave > i');
    btn.addEventListener('click', ()=>{
      if(audio.paused){ audio.play(); btn.textContent='❚❚'; } else { audio.pause(); btn.textContent='▶'; }
    });
    audio.addEventListener('timeupdate', ()=>{
      const pct = (audio.currentTime / (audio.duration || 1));
      bars.forEach((b,i)=> {
        const h = 6 + Math.round( (Math.abs(Math.sin((pct*20 + i)*1.7)) * (6 + (i%3)*3)) );
        b.style.height = h + 'px';
      });
    });
    audio.addEventListener('ended', ()=> btn.textContent='▶');
  });
})();

/* small utility: ensure Next buttons animate when in view */
document.addEventListener('DOMContentLoaded', ()=>{
  document.querySelectorAll('.next-ultra-cute').forEach(btn=>{
    btn.animate([{transform:'translateY(6px) scale(.98)'},{transform:'translateY(-4px) scale(1.02)'},{transform:'translateY(0px) scale(1)'}], {duration:900, iterations:1, easing:'cubic-bezier(.2,.9,.3,1)'});
  });
});
