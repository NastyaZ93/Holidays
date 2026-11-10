(() => {
  const STORAGE_KEY = "snowfall";
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const canvas = document.createElement("canvas");
  canvas.id = "snow-overlay";
  canvas.setAttribute("aria-hidden", "true");
  const supportsPopover = typeof canvas.showPopover === "function";
  // Popover puts the canvas in the browser top layer, above modal dialogs too.
  if (supportsPopover) canvas.setAttribute("popover", "manual");
  const ctx = canvas.getContext("2d");

  let flakes = [];
  let sprites = [];
  let width = 0;
  let height = 0;
  let dpr = 1;
  let rafId = null;
  let lastTime = 0;
  let running = false;

  function makeSprite(size) {
    const s = document.createElement("canvas");
    const px = Math.ceil(size * 2 * dpr) + 4;
    s.width = s.height = px;
    const c = s.getContext("2d");
    const r = (px - 4) / 2;
    c.translate(px / 2, px / 2);
    c.strokeStyle = "#ffffff";
    c.lineCap = "round";
    c.lineWidth = Math.max(1, r / 7);
    c.shadowColor = "rgba(255,255,255,0.8)";
    c.shadowBlur = r / 3;
    for (let i = 0; i < 6; i++) {
      c.save();
      c.rotate((Math.PI / 3) * i);
      c.beginPath();
      c.moveTo(0, 0);
      c.lineTo(0, -r);
      c.moveTo(0, -r * 0.5);
      c.lineTo(-r * 0.25, -r * 0.7);
      c.moveTo(0, -r * 0.5);
      c.lineTo(r * 0.25, -r * 0.7);
      c.stroke();
      c.restore();
    }
    return s;
  }

  function buildSprites() {
    sprites = [3, 5, 7, 10, 14].map(makeSprite);
  }

  function createFlake(randomY) {
    const sprite = Math.floor(Math.random() ** 2 * sprites.length);
    const size = [3, 5, 7, 10, 14][sprite];
    return {
      sprite,
      size,
      x: Math.random() * width,
      y: randomY ? Math.random() * height : -size * 2,
      speed: 20 + size * 4 + Math.random() * 25,
      opacity: 0.35 + Math.random() * 0.45,
      angle: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 1.2,
      swayPhase: Math.random() * Math.PI * 2,
      swayAmp: 10 + Math.random() * 30,
      swaySpeed: 0.4 + Math.random() * 0.8,
    };
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    buildSprites();
    const target = Math.min(160, Math.round((width * height) / 9000));
    while (flakes.length < target) flakes.push(createFlake(true));
    flakes.length = target;
  }

  function frame(time) {
    const dt = Math.min((time - lastTime) / 1000, 0.05);
    lastTime = time;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < flakes.length; i++) {
      const f = flakes[i];
      f.y += f.speed * dt;
      f.swayPhase += f.swaySpeed * dt;
      f.angle += f.spin * dt;
      const x = f.x + Math.sin(f.swayPhase) * f.swayAmp;

      if (f.y - f.size * 2 > height) {
        flakes[i] = createFlake(false);
        continue;
      }

      const sprite = sprites[f.sprite];
      const half = sprite.width / 2;
      ctx.globalAlpha = f.opacity;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.translate(x, f.y);
      ctx.rotate(f.angle);
      ctx.drawImage(sprite, -half / dpr, -half / dpr, sprite.width / dpr, sprite.height / dpr);
    }
    rafId = requestAnimationFrame(frame);
  }

  function bringToFront() {
    if (!running) return;
    if (supportsPopover) {
      canvas.hidePopover();
      canvas.showPopover();
    } else if (document.body.lastElementChild !== canvas) {
      document.body.appendChild(canvas);
    }
  }

  function start() {
    if (running) return;
    running = true;
    document.body.appendChild(canvas);
    if (supportsPopover) canvas.showPopover();
    resize();
    lastTime = performance.now();
    rafId = requestAnimationFrame(frame);
  }

  function stop() {
    if (!running) return;
    running = false;
    cancelAnimationFrame(rafId);
    if (supportsPopover && canvas.matches(":popover-open")) canvas.hidePopover();
    canvas.remove();
  }

  function isEnabled() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved !== null) return saved === "on";
    return !reducedMotion.matches;
  }

  function apply() {
    const on = isEnabled();
    on ? start() : stop();
    document.querySelectorAll("[data-snow-toggle]").forEach((btn) => {
      btn.setAttribute("aria-pressed", String(on));
      btn.textContent = on ? "❄ Snow: on" : "❄ Snow: off";
    });
  }

  function init() {
    document.querySelectorAll("[data-snow-toggle]").forEach((btn) => {
      btn.addEventListener("click", () => {
        localStorage.setItem(STORAGE_KEY, isEnabled() ? "off" : "on");
        apply();
      });
    });
    reducedMotion.addEventListener("change", apply);

    let resizeTimer;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => running && resize(), 150);
    });

    // Keep the overlay on top when content, dialogs or popovers are added later.
    new MutationObserver((mutations) => {
      const relevant = supportsPopover
        ? mutations.some((m) => m.type === "attributes" && m.target !== canvas)
        : document.body.lastElementChild !== canvas;
      if (relevant) bringToFront();
    }).observe(document.body, {
      childList: true,
      subtree: true,
      attributeFilter: ["open"],
    });
    document.addEventListener(
      "toggle",
      (e) => {
        if (e.target !== canvas && e.newState === "open") bringToFront();
      },
      true
    );

    apply();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
