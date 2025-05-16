/* =============================================================
     Forest Fairy Gemstone Game – v17
       • Slider (1‑60 min) adjusts fairy lifespan live.
       • 5s idle ↔ 5/10s wander cycle.
       • Corner‑bounce movement, at least one fairy alive.
  ============================================================= */

/* DOM refs */
const game = document.getElementById('game');
const scoreSpan = document.getElementById('score');
const resetBtn = document.getElementById('resetBtn');
const lifeSlider = document.getElementById('lifeSlider');
const lifeVal = document.getElementById('lifeVal');
const plop = document.getElementById('plop');
plop.volume = 0.5;
const bling = document.getElementById('bling');
bling.volume = 0.5;

/* config */
let lifeMinutes = parseInt(lifeSlider.value, 10);

/* helpers */
const rand = (m) => Math.random() * m;
const rect = (el) => {
  const r = el.getBoundingClientRect();
  return { x: r.left, y: r.top, w: r.width, h: r.height };
};
const hit = (a, b) =>
  a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
const SAVE_KEY = 'ffgg_state';

/* Fairy class */
class Fairy {
  constructor(x, y) {
    this.el = document.createElement('div');
    this.el.className = 'fairy';
    game.appendChild(this.el);
    this.x = x;
    this.y = y;
    this.updatePos();
    this.pid = null;
    this.dx = 0;
    this.dy = 0;
    this.isWandering = false;
    this.nextWander = 5000;
    this.enableDrag();
    this.startIdle();
    this.walkTimer = setInterval(() => this.step(), 300);
    this.resetLife();
  }
  updatePos() {
    this.el.style.left = this.x + 'px';
    this.el.style.top = this.y + 'px';
  }

  /* life */
  // resetLife() {
  //   clearTimeout(this.lifeTimer);
  //   this.lifeTimer = setTimeout(() => this.expire(), lifeMinutes * 60000);
  // }
  resetLife() {
    // stop any existing timers
    clearTimeout(this.lifeTimer);
    clearInterval(this.lifeInterval);

    // initialize total & remaining life in ms
    this.totalLife = lifeMinutes * 60000;
    this.remainingLife = this.totalLife;

    // how long before expiry we switch to red (in ms)
    const dangerThreshold = 2 * 60_000; // 2 minutes

    // clear any tint
    this.el.classList.remove('warning', 'danger');

    // schedule removal
    this.lifeTimer = setTimeout(() => this.expire(), this.totalLife);

    // every second, update remainingLife and apply tints
    this.lifeInterval = setInterval(() => {
      this.remainingLife -= 1000;
      const halfLife = this.totalLife / 2;

      if (this.remainingLife <= dangerThreshold) {
        // last 2 min → red
        this.el.classList.remove('warning');
        this.el.classList.add('danger');
      } else if (this.remainingLife <= halfLife) {
        // past halfway → orange
        this.el.classList.add('warning');
      }
    }, 1000);
  }
  expire() {
    if (fairies.length <= 1) {
      this.resetLife();
      return;
    }
    bling.currentTime = 0;
    bling.play().catch(() => {});
    this.destroy();
    fairies.splice(fairies.indexOf(this), 1);
  }

  /* movement */
  setRandDir() {
    const speed = 20 + rand(30),
      ang = rand(Math.PI * 2);
    this.dx = Math.cos(ang) * speed;
    this.dy = Math.sin(ang) * speed;
  }
  step() {
    if (this.pid || !this.isWandering) return;
    let nx = this.x + this.dx,
      ny = this.y + this.dy;
    const maxX = game.clientWidth - 96,
      maxY = game.clientHeight - 96;
    if (nx < 0 || nx > maxX || ny < 0 || ny > maxY) {
      this.setRandDir();
      nx = this.x + this.dx;
      ny = this.y + this.dy;
    }
    this.moveCenter(nx + 48, ny + 48, false);
    if (rand(1) < 0.1) this.setRandDir();
  }
  moveCenter(cx, cy, prop) {
    const w = 96,
      h = 96,
      maxX = game.clientWidth - w,
      maxY = game.clientHeight - h;
    const nx = Math.max(0, Math.min(cx - w / 2, maxX)),
      ny = Math.max(0, Math.min(cy - h / 2, maxY));
    const dx = nx - this.x,
      dy = ny - this.y;
    if (!dx && !dy) return;
    this.x = nx;
    this.y = ny;
    this.updatePos();
    checkGems();
    if (prop)
      fairies.forEach((f) => {
        if (f !== this && hit(rect(this.el), rect(f.el))) f.nudge(dx, dy);
      });
  }
  nudge(dx, dy) {
    this.moveCenter(this.x + dx + 48, this.y + dy + 48, false);
  }

  /* idle / wander cycle */
  startIdle() {
    this.isWandering = false;
    this.startBounce();
    this.idleTimer = setTimeout(() => this.startWander(), 5000);
  }
  startBounce() {
    const loop = () => {
      if (!this.pid && !this.isWandering) {
        const a = 6 + rand(12),
          d = 250 + rand(250);
        this.el.animate(
          [
            { transform: 'translateY(0)' },
            { transform: `translateY(-${a}px)` },
          ],
          {
            duration: d,
            direction: 'alternate',
            iterations: 2,
            easing: 'ease-out',
          }
        );
      }
      this.bounceTimer = setTimeout(loop, 1500 + rand(3000));
    };
    this.bounceTimer = setTimeout(loop, rand(2000));
  }
  startWander() {
    this.isWandering = true;
    this.setRandDir();
    clearTimeout(this.bounceTimer);
    const dur = this.nextWander;
    this.nextWander = this.nextWander === 5000 ? 10000 : 5000;
    this.wanderTimer = setTimeout(() => {
      this.isWandering = false;
      this.startIdle();
    }, dur);
  }

  /* drag */
  enableDrag() {
    this.el.addEventListener('pointerdown', (e) => {
      this.pid = e.pointerId;
      this.moveCenter(e.clientX, e.clientY, true);
      e.stopPropagation();
    });
    window.addEventListener('pointermove', (e) => {
      if (e.pointerId === this.pid) this.moveCenter(e.clientX, e.clientY, true);
    });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach((t) =>
      window.addEventListener(t, (e) => {
        if (e.pointerId === this.pid) {
          this.pid = null;
        }
      })
    );
  }

  /* cleanup */
  destroy() {
    clearInterval(this.lifeInterval);
    clearInterval(this.walkTimer);
    clearTimeout(this.idleTimer);
    clearTimeout(this.wanderTimer);
    clearTimeout(this.bounceTimer);
    clearTimeout(this.lifeTimer);
    this.el.remove();
  }
}

/* gems & scoring */
function spawnGem() {
  const g = document.createElement('div');
  g.className = 'gem';
  g.style.left = rand(game.clientWidth - 64) + 'px';
  g.style.top = rand(game.clientHeight - 64) + 'px';
  game.appendChild(g);
}
function checkGems() {
  document.querySelectorAll('.gem').forEach((g) => {
    if (fairies.some((f) => hit(rect(f.el), rect(g)))) collect(g);
  });
}
function collect(g) {
  g.remove();
  score++;
  scoreSpan.textContent = score;
  localStorage.setItem(SAVE_KEY, JSON.stringify({ score }));
  plop.currentTime = 0;
  plop.play().catch(() => {});
  if (score % 100 === 0) addFairy();
}

/* setup */
let score = 0;
const fairies = [];
function addFairy() {
  fairies.push(
    new Fairy(
      game.clientWidth / 2 - 48 + rand(40) - 20,
      game.clientHeight * 0.7 - 48 + rand(40) - 20
    )
  );
}

(function init() {
  const saved = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null');
  if (saved && saved.score) score = saved.score;
  scoreSpan.textContent = score;
  addFairy();
  for (let i = 1; i < Math.floor(score / 100) + 1; i++) addFairy();
  spawnGem();
  setInterval(spawnGem, 1800);
})();

/* UI events */
lifeSlider.addEventListener('input', () => {
  lifeMinutes = parseInt(lifeSlider.value, 10);
  lifeVal.textContent = lifeMinutes;
  fairies.forEach((f) => f.resetLife());
});
resetBtn.addEventListener('click', () => {
  document.querySelectorAll('.gem').forEach((g) => g.remove());
  fairies.forEach((f) => f.destroy());
  fairies.length = 0;
  score = 0;
  scoreSpan.textContent = '0';
  localStorage.removeItem(SAVE_KEY);
  addFairy();
});
window.addEventListener('resize', () => {
  fairies.forEach((f) => f.moveCenter(f.x + 48, f.y + 48, false));
});
