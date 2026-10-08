/* Resume AI Studio — front end. No build step. Needs the FastAPI backend (app.py). */
'use strict';

/* =============================================================== utils */
const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pct = (x, d = 0) => (x * 100).toFixed(d) + '%';
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;

const LABELS = ['ACCOUNTANT','ADVOCATE','AGRICULTURE','APPAREL','ARTS','AUTOMOBILE','AVIATION','BANKING','BPO','BUSINESS-DEVELOPMENT','CHEF','CONSTRUCTION','CONSULTANT','DESIGNER','DIGITAL-MEDIA','ENGINEERING','FINANCE','FITNESS','HEALTHCARE','HR','INFORMATION-TECHNOLOGY','PUBLIC-RELATIONS','SALES','TEACHER'];
const pretty = s => s.replace(/-/g, ' ').toLowerCase().replace(/^\w/, c => c.toUpperCase());

const SAMPLES = {
  it:   'INFORMATION TECHNOLOGY SPECIALIST\n\nSummary\nIT professional experienced in network administration, help desk support and server maintenance.\n\nSkills\nWindows Server, Active Directory, SQL, networking, troubleshooting, technical support, system security, Python\n\nExperience\nIT Support Specialist - resolved hardware and software issues, managed user accounts, maintained servers and trained staff on new systems.',
  hr:   'HR ADMINISTRATOR\n\nSummary\nHR professional with experience in recruitment, payroll, employee relations and onboarding.\n\nSkills\nHRIS, benefits administration, interviewing, compliance, training and development, performance reviews\n\nExperience\nHR Generalist - managed hiring cycles, processed payroll, handled employee grievances and updated HR policies.',
  chef: 'HEAD CHEF\n\nSummary\nChef with ten years of experience in menu planning, kitchen management and food safety.\n\nSkills\nCatering, inventory control, food costing, staff training, HACCP, banquet service\n\nExperience\nExecutive Chef - led a team of 12 cooks, designed seasonal menus and reduced food waste through better inventory control.'
};

const store = { status: null, metrics: null, trainedAt: null };
const getKey = () => sessionStorage.getItem('gkey') || '';
const getModel = () => sessionStorage.getItem('gmodel') || '';
const hdr = () => { const h = {'Content-Type': 'application/json'}; if (getKey()) h['x-gemini-key'] = getKey(); if (getModel()) h['x-gemini-model'] = getModel(); return h; };

async function api(url, opts = {}) {
  const r = await fetch(url, opts);
  let d = {}; try { d = await r.json(); } catch (e) {}
  if (!r.ok) throw new Error(typeof d.detail === 'string' ? d.detail : ('Request failed (' + r.status + ')'));
  return d;
}
const post = (url, body) => api(url, {method: 'POST', headers: hdr(), body: JSON.stringify(body)});

function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('on'); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('on'), 2200); }
function msg(el, type, text) { $(el).innerHTML = text ? `<div class="msg ${type}">${esc(text)}</div>` : ''; }
function busy(btn, on, label) { if (on) { btn.dataset.l = btn.innerHTML; btn.innerHTML = `<span class="spin"></span>${esc(label)}`; btn.disabled = true; } else { btn.innerHTML = btn.dataset.l || btn.innerHTML; btn.disabled = false; } }
function countUp(el, to, fmt) {
  if (REDUCED) { el.textContent = fmt(to); return; }
  const t0 = performance.now(), D = 1100;
  (function f(t) { const k = clamp((t - t0) / D, 0, 1), e = 1 - Math.pow(1 - k, 3); el.textContent = fmt(to * e); if (k < 1) requestAnimationFrame(f); })(t0);
}

/* =============================================================== 3D helpers */
const HAS_GL = (() => { try { const c = document.createElement('canvas'); return !!(window.THREE && (c.getContext('webgl') || c.getContext('experimental-webgl'))); } catch (e) { return false; } })();

function fib(n, R) {
  const pts = [], g = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) { const y = 1 - (i / (n - 1)) * 2, r = Math.sqrt(1 - y * y), th = g * i; pts.push(new THREE.Vector3(Math.cos(th) * r * R, y * R, Math.sin(th) * r * R)); }
  return pts;
}
function glowTex(rgb) {
  const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d');
  const g = x.createRadialGradient(64, 64, 0, 64, 64, 64); g.addColorStop(0, `rgba(${rgb},.9)`); g.addColorStop(.35, `rgba(${rgb},.25)`); g.addColorStop(1, `rgba(${rgb},0)`);
  x.fillStyle = g; x.fillRect(0, 0, 128, 128); return new THREE.CanvasTexture(c);
}
function labelSprite(text, color = '#9fb0e6', bold = false) {
  const c = document.createElement('canvas'); c.width = 512; c.height = 64; const x = c.getContext('2d');
  x.font = `${bold ? 700 : 500} 30px "Instrument Sans", system-ui, sans-serif`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillStyle = color; x.fillText(pretty(text), 256, 34);
  const m = new THREE.SpriteMaterial({map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false});
  const s = new THREE.Sprite(m); s.scale.set(3.4, .425, 1); return s;
}
function sheetTex(seed) {
  const c = document.createElement('canvas'); c.width = 220; c.height = 290; const x = c.getContext('2d');
  x.fillStyle = '#F4F6FB'; x.fillRect(0, 0, 220, 290);
  const rnd = (() => { let s = seed * 9301 + 49297; return () => (s = (s * 9301 + 49297) % 233280) / 233280; })();
  x.fillStyle = '#141A2E'; x.fillRect(18, 20, 90 + rnd() * 50, 12);
  x.fillStyle = rnd() > .5 ? '#4C6FFF' : '#FFB547'; x.fillRect(18, 38, 60, 5);
  for (let i = 0; i < 15; i++) { x.fillStyle = i % 5 === 0 ? '#9AA3BF' : '#CDD3E4'; x.fillRect(18, 62 + i * 14, 70 + rnd() * 120, i % 5 === 0 ? 6 : 4); }
  return new THREE.CanvasTexture(c);
}
function makeRenderer(canvas) {
  const r = new THREE.WebGLRenderer({canvas, antialias: true, alpha: true});
  r.setPixelRatio(Math.min(devicePixelRatio || 1, 2)); return r;
}

/* =============================================================== HERO SCENE */
const Hero = (() => {
  let R, scene, cam, root, ring, core, wire, inner, halo, sheets = [], orbs = [], labels = [], line, lineP = 1, active = -1, pulse = 0, running = false, ready = false, mx = 0, my = 0, clock = 0;
  const canvas = $('#heroCanvas');

  function init() {
    if (!HAS_GL || ready) return; ready = true;
    try { R = makeRenderer(canvas); } catch (e) { ready = false; return; }
    scene = new THREE.Scene(); cam = new THREE.PerspectiveCamera(50, 1, .1, 100); cam.position.set(0, 0, 12.5);
    root = new THREE.Group(); scene.add(root);

    core = new THREE.Group(); root.add(core);
    wire = new THREE.Mesh(new THREE.IcosahedronGeometry(1.3, 1), new THREE.MeshBasicMaterial({color: 0x4c6fff, wireframe: true, transparent: true, opacity: .85}));
    inner = new THREE.Mesh(new THREE.IcosahedronGeometry(.6, 0), new THREE.MeshBasicMaterial({color: 0xffb547}));
    halo = new THREE.Sprite(new THREE.SpriteMaterial({map: glowTex('76,111,255'), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false}));
    halo.scale.set(7, 7, 1); core.add(wire, inner, halo);

    ring = new THREE.Group(); root.add(ring);
    const pos = fib(LABELS.length, 4.6);
    LABELS.forEach((l, i) => {
      const o = new THREE.Mesh(new THREE.SphereGeometry(.11, 16, 16), new THREE.MeshBasicMaterial({color: 0x7f93ff}));
      o.position.copy(pos[i]); ring.add(o); orbs.push(o);
      const s = labelSprite(l); s.position.copy(pos[i]).multiplyScalar(1.12); s.material.opacity = .5; ring.add(s); labels.push(s);
    });

    for (let i = 0; i < 13; i++) {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(1.05, 1.39), new THREE.MeshBasicMaterial({map: sheetTex(i + 3), transparent: true, side: THREE.DoubleSide, depthWrite: false}));
      m.userData = {t: Math.random(), sp: .0016 + Math.random() * .0022, a: Math.random() * Math.PI * 2, y: (Math.random() - .5) * 8, r: 6 + Math.random() * 3.5, tw: Math.random() * .6 - .3};
      root.add(m); sheets.push(m);
    }

    const N = 520, g = new THREE.BufferGeometry(), p = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) { const v = new THREE.Vector3(Math.random() - .5, Math.random() - .5, Math.random() - .5).normalize().multiplyScalar(7 + Math.random() * 9); p.set([v.x, v.y, v.z], i * 3); }
    g.setAttribute('position', new THREE.BufferAttribute(p, 3));
    root.add(new THREE.Points(g, new THREE.PointsMaterial({color: 0x9fb0e6, size: .045, transparent: true, opacity: .55, depthWrite: false})));

    line = new THREE.Line(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({color: 0xffb547, transparent: true, opacity: .95}));
    line.geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(48 * 3), 3)); line.visible = false; root.add(line);

    addEventListener('pointermove', e => { mx = e.clientX / innerWidth - .5; my = e.clientY / innerHeight - .5; }, {passive: true});
    new ResizeObserver(resize).observe(canvas.parentElement); resize();
  }

  function resize() {
    if (!R) return; const w = canvas.parentElement.clientWidth, h = canvas.parentElement.clientHeight;
    R.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix();
    const wide = w > 980; root.position.x = wide ? 3.7 : 0; root.position.y = wide ? 0 : -1.6; root.scale.setScalar(wide ? 1 : .62);
  }

  function setActive(label) {
    if (!ready) return; const i = LABELS.indexOf(label); if (i < 0) return;
    active = i; pulse = 1; lineP = 0; line.visible = true;
    orbs.forEach((o, k) => { o.material.color.set(k === i ? 0xffb547 : 0x7f93ff); o.scale.setScalar(k === i ? 2.6 : 1); });
    labels.forEach((s, k) => { s.material.opacity = k === i ? 1 : .35; s.scale.set(k === i ? 4.6 : 3.4, k === i ? .575 : .425, 1); });
    const to = orbs[i].position, mid = to.clone().multiplyScalar(.5).add(new THREE.Vector3(0, 1.4, 0)), a = line.geometry.attributes.position;
    for (let k = 0; k < 48; k++) { const t = k / 47, u = 1 - t; a.setXYZ(k, u * u * 0 + 2 * u * t * mid.x + t * t * to.x, 2 * u * t * mid.y + t * t * to.y, 2 * u * t * mid.z + t * t * to.z); }
    a.needsUpdate = true; line.geometry.setDrawRange(0, 0);
  }

  function frame() {
    if (!running) return; requestAnimationFrame(frame);
    const k = REDUCED ? .15 : 1; clock += .016 * k;
    core.rotation.y += .006 * k; core.rotation.x += .003 * k; wire.rotation.z += .004 * k;
    pulse *= .94; core.scale.setScalar(1 + pulse * .45); halo.material.opacity = .65 + pulse * .35;
    ring.rotation.y += (active >= 0 ? .0006 : .0024) * k;
    if (!REDUCED) { root.rotation.y += ((mx * .6) - root.rotation.y) * .04; root.rotation.x += ((my * .35) - root.rotation.x) * .04; }
    orbs.forEach((o, i) => { if (i !== active) o.position.y += Math.sin(clock * 1.5 + i) * .0016; });
    sheets.forEach(s => {
      const d = s.userData; d.t += d.sp * k; if (d.t >= 1) { d.t = 0; d.a = Math.random() * Math.PI * 2; d.y = (Math.random() - .5) * 8; pulse = Math.max(pulse, .12); }
      const e = d.t * d.t * (3 - 2 * d.t), r = d.r * (1 - e), a = d.a + e * 1.4 + d.tw * e;
      s.position.set(Math.cos(a) * r * (Math.cos(a) < 0 ? .4 : 1), d.y * (1 - e) * .8, Math.min(Math.sin(a) * r, 2.5));
      s.quaternion.copy(cam.quaternion); s.rotateZ(d.tw * (1 - e)); s.scale.setScalar((1 - e * .8) * .9);
      s.material.opacity = Math.min(d.t * 8, 1, (1 - d.t) * 5) * .92;
    });
    if (line.visible && lineP < 1) { lineP = Math.min(1, lineP + .035); line.geometry.setDrawRange(0, Math.floor(48 * lineP)); }
    R.render(scene, cam);
  }
  return {
    start() { init(); if (!ready || running) return; running = true; resize(); frame(); },
    stop() { running = false; }, setActive, get ok() { return ready; }
  };
})();

/* =============================================================== GALAXY SCENE */
const Galaxy = (() => {
  const canvas = $('#galaxyCanvas'), tip = $('#galaxyTip');
  let R, scene, cam, group, spheres = [], labelSp = [], data = null, running = false, ready = false;
  let rotX = .25, rotY = 0, vx = 0, vy = 0, drag = false, moved = 0, last = [0, 0], hover = -1, selected = -1, camZ = 14;
  const ray = typeof THREE !== 'undefined' ? new THREE.Raycaster() : null, ptr = {x: 0, y: 0, in: false};

  function f1Color(f) { const h = clamp((f - .45) / .55, 0, 1) * 150 / 360; return new THREE.Color().setHSL(h, .72, .56); }

  function init() {
    if (!HAS_GL || ready) return; ready = true;
    try { R = makeRenderer(canvas); } catch (e) { ready = false; return; }
    scene = new THREE.Scene(); cam = new THREE.PerspectiveCamera(48, 1, .1, 100); cam.position.z = camZ;
    group = new THREE.Group(); scene.add(group);
    scene.add(new THREE.AmbientLight(0xffffff, .55));
    const p1 = new THREE.PointLight(0xffffff, 1.1); p1.position.set(7, 7, 10); scene.add(p1);
    const p2 = new THREE.PointLight(0x4c6fff, .9); p2.position.set(-9, -5, -7); scene.add(p2);

    canvas.addEventListener('pointerdown', e => { drag = true; moved = 0; last = [e.clientX, e.clientY]; canvas.setPointerCapture(e.pointerId); });
    canvas.addEventListener('pointermove', e => {
      const b = canvas.getBoundingClientRect(); ptr.x = ((e.clientX - b.left) / b.width) * 2 - 1; ptr.y = -((e.clientY - b.top) / b.height) * 2 + 1; ptr.in = true; ptr.px = e.clientX - b.left; ptr.py = e.clientY - b.top;
      if (drag) { const dx = e.clientX - last[0], dy = e.clientY - last[1]; moved += Math.abs(dx) + Math.abs(dy); vy = dx * .006; vx = dy * .006; rotY += vy; rotX = clamp(rotX + vx, -1.3, 1.3); last = [e.clientX, e.clientY]; }
    });
    canvas.addEventListener('pointerup', () => { drag = false; if (moved < 5 && hover >= 0) select(hover); });
    canvas.addEventListener('pointerleave', () => { ptr.in = false; drag = false; });
    canvas.addEventListener('wheel', e => { e.preventDefault(); camZ = clamp(camZ + e.deltaY * .01, 8, 19); }, {passive: false});
    new ResizeObserver(resize).observe(canvas.parentElement); resize();
  }
  function resize() { if (!R) return; const p = canvas.parentElement; R.setSize(p.clientWidth, p.clientHeight, false); cam.aspect = p.clientWidth / p.clientHeight; cam.updateProjectionMatrix(); }

  function setData(m) {
    data = m; if (!ready) init(); if (!ready) return;
    while (group.children.length) group.remove(group.children[0]);
    spheres = []; labelSp = [];
    const L = m.labels, pos = fib(L.length, 5.4), counts = L.map(l => m.class_counts[l] || 1), maxC = Math.max(...counts);
    L.forEach((l, i) => {
      const f = m.per_class[l] ? m.per_class[l]['f1-score'] : 0, r = .17 + Math.sqrt(counts[i] / maxC) * .42;
      const s = new THREE.Mesh(new THREE.SphereGeometry(r, 28, 28), new THREE.MeshPhongMaterial({color: f1Color(f), shininess: 70, emissive: f1Color(f), emissiveIntensity: .12}));
      s.position.copy(pos[i]); s.userData = {i, r}; group.add(s); spheres.push(s);
      const t = labelSprite(l, '#C9D3F5'); t.position.copy(pos[i]).add(new THREE.Vector3(0, r + .38, 0)); t.material.opacity = .72; group.add(t); labelSp.push(t);
    });
    const cm = m.confusion_matrix; let maxOff = 1;
    cm.forEach((row, i) => row.forEach((v, j) => { if (i !== j && v > maxOff) maxOff = v; }));
    const pts = [], cols = [];
    cm.forEach((row, i) => row.forEach((v, j) => {
      if (i === j || !v) return; const k = .25 + .75 * v / maxOff;
      pts.push(pos[i].x, pos[i].y, pos[i].z, pos[j].x, pos[j].y, pos[j].z); cols.push(1 * k, .42 * k, .53 * k, 1 * k, .42 * k, .53 * k);
    }));
    if (pts.length) {
      const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
      group.add(new THREE.LineSegments(g, new THREE.LineBasicMaterial({vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false})));
    }
  }

  function select(i) { selected = i; Galaxy.onSelect && Galaxy.onSelect(i); }

  function frame() {
    if (!running) return; requestAnimationFrame(frame);
    if (!drag) { rotY += vy; rotX = clamp(rotX + vx, -1.3, 1.3); vy *= .93; vx *= .93; if (!REDUCED && Math.abs(vy) < .0006 && hover < 0) rotY += .0022; }
    group.rotation.set(rotX, rotY, 0); cam.position.z += (camZ - cam.position.z) * .1;
    hover = -1;
    if (ptr.in && !drag && ray) { ray.setFromCamera(ptr, cam); const h = ray.intersectObjects(spheres); if (h.length) hover = h[0].object.userData.i; }
    spheres.forEach((s, i) => { const t = (i === hover ? 1.2 : i === selected ? 1.35 : 1); s.scale.setScalar(s.scale.x + (t - s.scale.x) * .18); labelSp[i].material.opacity = i === hover || i === selected ? 1 : .72; });
    if (hover >= 0 && data) {
      const l = data.labels[hover], c = data.per_class[l] || {};
      tip.hidden = false; tip.style.left = Math.min(ptr.px + 14, canvas.clientWidth - 200) + 'px'; tip.style.top = (ptr.py + 14) + 'px';
      tip.innerHTML = `<b>${esc(pretty(l))}</b><br>${data.class_counts[l] || 0} resumes · F1 ${(c['f1-score'] ?? 0).toFixed(2)}`;
      canvas.style.cursor = 'pointer';
    } else { tip.hidden = true; canvas.style.cursor = drag ? 'grabbing' : 'grab'; }
    R.render(scene, cam);
  }
  return { start() { init(); if (!ready || running) return; running = true; resize(); frame(); }, stop() { running = false; }, setData, select, onSelect: null, get ok() { return ready; } };
})();

/* heatmap (plain 2D canvas) */
function drawHeat(m) {
  const cv = $('#heatCanvas'), tip = $('#heatTip'), L = m.labels, n = L.length, cell = 22, left = 190, top = 30;
  const dpr = Math.min(devicePixelRatio || 1, 2), W = left + n * cell + 10, H = top + n * cell + 10;
  cv.width = W * dpr; cv.height = H * dpr; cv.style.width = W + 'px'; cv.style.height = H + 'px';
  const x = cv.getContext('2d'); x.scale(dpr, dpr); x.clearRect(0, 0, W, H); x.font = '11px "Instrument Sans", sans-serif';
  m.confusion_matrix.forEach((row, i) => {
    const S = row.reduce((a, b) => a + b, 0) || 1;
    x.fillStyle = '#9fb0e6'; x.textAlign = 'right'; x.textBaseline = 'middle'; x.fillText(`${String(i + 1).padStart(2, '0')} ${pretty(L[i]).slice(0, 26)}`, left - 8, top + i * cell + cell / 2);
    row.forEach((v, j) => {
      const f = v / S, px = left + j * cell, py = top + i * cell;
      x.fillStyle = v === 0 ? 'rgba(255,255,255,.035)' : (i === j ? `rgba(61,224,168,${.18 + .82 * f})` : `rgba(255,107,134,${.3 + .7 * Math.min(1, f * 2.5)})`);
      x.fillRect(px + 1, py + 1, cell - 2, cell - 2);
    });
  });
  x.fillStyle = '#9fb0e6'; x.textAlign = 'center'; for (let j = 0; j < n; j++) x.fillText(String(j + 1).padStart(2, '0'), left + j * cell + cell / 2, top - 12);
  cv.onmousemove = e => {
    const b = cv.getBoundingClientRect(), j = Math.floor((e.clientX - b.left - left) / cell), i = Math.floor((e.clientY - b.top - top) / cell);
    if (i < 0 || j < 0 || i >= n || j >= n) { tip.hidden = true; return; }
    const v = m.confusion_matrix[i][j]; tip.hidden = false; tip.style.left = (e.clientX - b.left + 16) + 'px'; tip.style.top = (e.clientY - b.top + 16) + 'px';
    tip.innerHTML = `True <b>${esc(pretty(L[i]))}</b><br>Predicted <b>${esc(pretty(L[j]))}</b>: ${v}`;
  };
  cv.onmouseleave = () => tip.hidden = true;
}

function galaxySide(i) {
  const m = store.metrics, l = m.labels[i], c = m.per_class[l] || {}, row = m.confusion_matrix[i];
  const wrong = row.map((v, j) => [v, j]).filter(([v, j]) => j !== i && v > 0).sort((a, b) => b[0] - a[0]).slice(0, 4);
  const asWrong = m.confusion_matrix.map((r, k) => [r[i], k]).filter(([v, k]) => k !== i && v > 0).sort((a, b) => b[0] - a[0]).slice(0, 3);
  $('#galaxySide').innerHTML = `<h3>${esc(pretty(l))}</h3><div class="meta">${m.class_counts[l] || 0} resumes in the dataset · ${c.support ?? 0} in the test set</div>
    <div class="stat"><div><b>${(c.precision ?? 0).toFixed(2)}</b><span>Precision</span></div><div><b>${(c.recall ?? 0).toFixed(2)}</b><span>Recall</span></div><div><b>${(c['f1-score'] ?? 0).toFixed(2)}</b><span>F1</span></div></div>
    <h4 style="margin:16px 0 8px;font:600 14px var(--sans)">Resumes of this field were mistaken for</h4>
    ${wrong.length ? `<div class="terms">${wrong.map(([v, j]) => `<span class="term neg">${esc(pretty(m.labels[j]))} × ${v}</span>`).join('')}</div>` : '<p class="hint">Nothing in the test set. Every one was recognised.</p>'}
    <h4 style="margin:16px 0 8px;font:600 14px var(--sans)">Other fields wrongly called this</h4>
    ${asWrong.length ? `<div class="terms">${asWrong.map(([v, k]) => `<span class="term miss">${esc(pretty(m.labels[k]))} × ${v}</span>`).join('')}</div>` : '<p class="hint">None.</p>'}
    <p class="hint" style="margin-top:16px">${(c.support ?? 0) < 10 ? 'Few test resumes for this field, so these scores can swing a lot.' : ''}</p>`;
}
Galaxy.onSelect = galaxySide;

/* =============================================================== STATUS + HOME NUMBERS */
function fillCats(labels) {
  const sel = $('#gCat'); if (sel.options.length > 1) return;
  labels.forEach(l => sel.add(new Option(pretty(l), l)));
}
function renderNumbers() {
  const m = store.metrics, el = $('#homeNumbers');
  if (!m) { el.innerHTML = '<div><p class="lede" style="margin:0 0 14px">The model has not been trained yet.</p><a class="btn primary" href="#/backend">Open the training lab</a></div>'; return; }
  el.innerHTML = [[m.test_accuracy * 100, 'accuracy on resumes it never saw', v => v.toFixed(1) + '%'], [m.n_classes, 'fields it can tell apart', v => Math.round(v)], [m.rows, 'resumes after cleaning', v => Math.round(v).toLocaleString()], [Object.keys(m.models).length, 'models raced, best one kept', v => Math.round(v)]]
    .map(([, s], i) => `<div class="num"><b data-i="${i}">0</b><span>${s}</span></div>`).join('');
  [[m.test_accuracy * 100, v => v.toFixed(1) + '%'], [m.n_classes, v => Math.round(v)], [m.rows, v => Math.round(v).toLocaleString()], [Object.keys(m.models).length, v => Math.round(v)]]
    .forEach(([to, f], i) => countUp($(`[data-i="${i}"]`, el), to, f));
}
async function refreshStatus(first) {
  const pill = $('#statusPill'), b = $('b', pill);
  try {
    const s = await api('/api/status?quiet=1', {headers: hdr()}); store.status = s;
    if (s.model_ready && s.metrics) { pill.className = 'pill ok'; b.textContent = `Model ready · ${pct(s.metrics.test_accuracy, 1)}`; }
    else { pill.className = 'pill warn'; b.textContent = 'Model not trained'; }
    if (s.training === 'running') { pill.className = 'pill warn'; b.textContent = 'Training…'; }
    const changed = (s.metrics && s.metrics.trained_at) !== store.trainedAt;
    store.metrics = s.metrics; store.trainedAt = s.metrics && s.metrics.trained_at;
    if (changed || first) { renderNumbers(); if (s.metrics) { fillCats(s.metrics.labels); Galaxy.setData(s.metrics); drawHeat(s.metrics); } updateGalaxyEmpty(); }
    $('#dsInfo').textContent = s.dataset_found ? `Dataset found in the project folder: ${s.dataset_found}` : 'No dataset in the project folder. Choose a CSV.';
  } catch (e) { pill.className = 'pill bad'; b.textContent = 'Backend offline'; }
}
function updateGalaxyEmpty() { const none = !store.metrics; $('#galaxyEmpty').hidden = !none; $('.galaxy').style.display = none ? 'none' : ''; $('.heat').style.display = none ? 'none' : ''; }

/* =============================================================== HOME demo */
$$('.chip[data-sample]').forEach(b => b.onclick = () => { $('#heroText').value = SAMPLES[b.dataset.sample]; $('#heroGo').click(); });
$('#heroGo').onclick = async () => {
  const btn = $('#heroGo'), out = $('#heroOut'); out.innerHTML = '';
  busy(btn, true, 'Reading');
  try {
    const d = await post('/api/predict', {text: $('#heroText').value}), a = d.top[0];
    Hero.setActive(a.category);
    out.innerHTML = `<div class="verdict"><b>${esc(pretty(a.category))}</b><span>${pct(a.score)} match · next closest ${esc(pretty(d.top[1].category))}</span><a class="chip" href="#/studio" id="whyLink">See why</a></div>`;
    $('#whyLink').onclick = () => { $('#clsText').value = $('#heroText').value; };
  } catch (e) { out.innerHTML = `<div class="msg err" style="margin-top:12px">${esc(e.message)}${/trained/i.test(e.message) ? ' <a href="#/backend" style="text-decoration:underline">Open the training lab</a>' : ''}</div>`; }
  busy(btn, false);
};

/* =============================================================== STUDIO: read */
$$('.tab').forEach(t => t.onclick = () => {
  $$('.tab').forEach(x => x.classList.toggle('on', x === t));
  $('#studio-read').classList.toggle('hidden', t.dataset.studio !== 'read'); $('#studio-build').classList.toggle('hidden', t.dataset.studio !== 'build');
});
$('#clsSample').onclick = () => { $('#clsText').value = SAMPLES.it; };
const drop = $('.drop');
['dragenter', 'dragover'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.add('over'); }));
['dragleave', 'drop'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.remove('over'); }));
drop.addEventListener('drop', e => { if (e.dataTransfer.files[0]) loadFile(e.dataTransfer.files[0]); });
$('#resFile').onchange = e => e.target.files[0] && loadFile(e.target.files[0]);
async function loadFile(f) {
  const fd = new FormData(); fd.append('file', f); msg('#clsMsg', 'warn', 'Reading the file…');
  try { const d = await api('/api/extract-text', {method: 'POST', body: fd}); $('#clsText').value = d.text; msg('#clsMsg', 'ok', `${f.name} loaded.`); }
  catch (e) { msg('#clsMsg', 'err', e.message); }
}
const ringHTML = (v, c) => `<div class="ring" data-t="${Math.round(v)}%" style="--v:${v};--c:${c}"></div>`;
const scoreColor = v => v >= 60 ? 'var(--mint)' : v >= 35 ? 'var(--amber)' : 'var(--rose)';

function atsHTML(a) {
  return `<div class="gauge">${ringHTML(a.score, scoreColor(a.score))}<div><b style="font:400 20px var(--serif)">Keyword coverage</b><div class="hint" style="margin:2px 0 0">How many of the 40 strongest words of ${esc(pretty(a.category))} your resume already uses. A guide, not a real ATS.</div></div></div>
    <div class="terms" style="margin-top:10px">${a.present.slice(0, 18).map(t => `<span class="term have">${esc(t.term)}</span>`).join('')}</div>
    <h4 style="margin:16px 0 8px">Missing, if they are true for you</h4>
    <div class="terms">${a.missing.map(t => `<span class="term miss">${esc(t.term)}</span>`).join('') || '<span class="hint">Nothing missing.</span>'}</div>`;
}

$('#clsBtn').onclick = async () => {
  const btn = $('#clsBtn'), text = $('#clsText').value, res = $('#clsResult'); msg('#clsMsg', '', '');
  busy(btn, true, 'Reading');
  try {
    const d = await post('/api/explain', {text}), a = d.top[0]; Hero.setActive(a.category);
    const termRe = d.terms.length ? new RegExp('\\b(' + d.terms.map(t => t.term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/ /g, '\\s+')).sort((x, y) => y.length - x.length).join('|') + ')\\b', 'gi') : null;
    const shown = esc(text).slice(0, 5000), marked = termRe ? shown.replace(termRe, '<mark>$1</mark>') : shown;
    res.innerHTML = `<p class="big">${esc(pretty(a.category))}</p>
      <div class="gauge">${ringHTML(a.score * 100, scoreColor(a.score * 100))}<div class="hint" style="margin:0">${a.score >= .5 ? 'The model is fairly sure of this field.' : 'The model is unsure. Put the job title on the first line and add more skills.'}</div></div>
      ${d.top.map((t, i) => `<div class="bar${i === 0 ? ' top' : ''}"><span>${esc(pretty(t.category))}</span><div class="t"><div class="f" style="width:${t.score * 100}%"></div></div><span class="p">${pct(t.score)}</span></div>`).join('')}
      <h4>Why this field</h4><div class="why">${marked}</div>
      <div class="terms" style="margin-top:10px">${d.terms.map(t => `<span class="term" title="weight ${t.weight}">${esc(t.term)}</span>`).join('')}</div>
      ${d.against.length ? `<h4>Words pulling the other way</h4><div class="terms">${d.against.map(t => `<span class="term neg">${esc(t.term)}</span>`).join('')}</div>` : ''}
      <h4 style="margin-top:26px"></h4><div id="atsBox"><p class="hint">Checking keywords…</p></div>`;
    try { $('#atsBox').innerHTML = atsHTML(await post('/api/ats', {text, category: a.category})); } catch (e) { $('#atsBox').innerHTML = ''; }
  } catch (e) { msg('#clsMsg', 'err', e.message); }
  busy(btn, false);
};

/* =============================================================== STUDIO: build */
let lastResume = null;
function renderResume(r) {
  const contact = [r.email, r.phone, r.location].filter(Boolean).map(esc).join(' &nbsp;|&nbsp; ');
  let h = `<h2>${esc(r.name)}</h2>${r.headline ? `<div class="head">${esc(r.headline)}</div>` : ''}<div class="contact">${contact || '&nbsp;'}</div>`;
  if (r.summary) h += `<h4>Summary</h4><p>${esc(r.summary)}</p>`;
  if (r.skills?.length) h += `<h4>Skills</h4><p>${r.skills.map(esc).join(' • ')}</p>`;
  if (r.experience?.length) h += `<h4>Experience</h4>` + r.experience.map(e => `<div class="it">${esc(e.role)}<span>${esc(e.period)}</span></div><div class="sub2">${esc(e.company)}</div><ul>${(e.bullets || []).map(b => `<li>${esc(b)}</li>`).join('')}</ul>`).join('');
  if (r.projects?.length) h += `<h4>Projects</h4>` + r.projects.map(p => `<div class="it">${esc(p.name)}</div><ul>${(p.bullets || []).map(b => `<li>${esc(b)}</li>`).join('')}</ul>`).join('');
  if (r.education?.length) h += `<h4>Education</h4>` + r.education.map(e => `<div class="it">${esc(e.degree)}<span>${esc(e.period)}</span></div><div class="sub2">${esc(e.institute)}</div>`).join('');
  $('#resume').innerHTML = h;
}
const resumeText = r => [r.name, r.headline, [r.email, r.phone, r.location].filter(Boolean).join(' | '), '', 'SUMMARY', r.summary, '', 'SKILLS', (r.skills || []).join(', '), '',
  ...(r.experience?.length ? ['EXPERIENCE', ...r.experience.flatMap(e => [`${e.role} - ${e.company} (${e.period})`, ...(e.bullets || []).map(b => '- ' + b), ''])] : []),
  ...(r.projects?.length ? ['PROJECTS', ...r.projects.flatMap(p => [p.name, ...(p.bullets || []).map(b => '- ' + b), ''])] : []),
  ...(r.education?.length ? ['EDUCATION', ...r.education.map(e => `${e.degree} - ${e.institute} (${e.period})`)] : [])].join('\n');

$('#gTpl').onchange = () => { $('#resume').className = 'paper ' + $('#gTpl').value; };
$('#genBtn').onclick = async () => {
  const name = $('#gName').value.trim(), role = $('#gRole').value.trim();
  if (!name || !role) { msg('#genMsg', 'err', 'Add your name and a target role first.'); return; }
  const btn = $('#genBtn'); busy(btn, true, 'Writing'); msg('#genMsg', '', '');
  try {
    const d = await post('/api/generate', {name, target_role: role, email: $('#gEmail').value, phone: $('#gPhone').value, location: $('#gLoc').value, skills: $('#gSkills').value, experience: $('#gExp').value, education: $('#gEdu').value, projects: $('#gProj').value, existing_resume: $('#gExisting').value, category_override: $('#gCat').value});
    lastResume = d.resume; renderResume(d.resume); $('#resume').className = 'paper ' + $('#gTpl').value; Hero.setActive(d.category);
    $('#genActions').hidden = false; const meta = $('#genMeta'); meta.hidden = false;
    meta.innerHTML = `<div class="row" style="margin:0"><b style="font:400 20px var(--serif);color:var(--amber)">${esc(pretty(d.category))}</b><span class="meta">${d.manual ? 'chosen by you' : pct(d.top[0].score) + ' match'}</span><span class="pill sm ${d.mode === 'ai' ? 'ok' : 'warn'}"><i></i><b>${d.mode === 'ai' ? 'Written by Gemini' : 'Plain template, no AI'}</b></span></div><div id="genAts"></div>`;
    if (d.note) msg('#genMsg', 'warn', d.note);
    try { const a = await post('/api/ats', {text: resumeText(d.resume), category: d.category}); $('#genAts').innerHTML = `<div style="margin-top:14px">${atsHTML(a)}</div>`; } catch (e) {}
  } catch (e) { msg('#genMsg', 'err', e.message); }
  busy(btn, false);
};
$('#copyBtn').onclick = () => { if (!lastResume) return; navigator.clipboard.writeText(resumeText(lastResume)); toast('Resume text copied'); };

/* =============================================================== BACKEND console */
const ROUTES = {
  '/api/predict': ['ui-api', 'api-clean', 'clean-tfidf', 'tfidf-svc', 'svc-out'],
  '/api/explain': ['ui-api', 'api-clean', 'clean-tfidf', 'tfidf-svc', 'svc-out'],
  '/api/ats': ['ui-api', 'api-clean', 'clean-tfidf', 'tfidf-svc', 'svc-out'],
  '/api/generate': ['ui-api', 'api-clean', 'clean-tfidf', 'tfidf-svc', 'svc-llm', 'llm-out'],
  '/api/test-llm': ['ui-api', 'llm-out'],
  '/api/train': ['ui-api', 'api-train', 'train-model', 'model-svc']
};
function flash(path) {
  const ids = ROUTES[path] || ['ui-api'];
  ids.forEach((id, k) => setTimeout(() => { const p = $('#p-' + id); if (!p) return; p.classList.add('hot'); setTimeout(() => p.classList.remove('hot'), 1100); }, k * 140));
}
let logSince = 0, logTimer = null, firstLog = true;
async function pollLogs() {
  try {
    const d = await api('/api/logs?since=' + logSince); const box = $('#logBox');
    if (d.logs.length) {
      if (box.querySelector('.empty')) box.innerHTML = '';
      d.logs.forEach(l => {
        const r = document.createElement('div'); r.className = 'lg' + (firstLog ? '' : ' new');
        r.innerHTML = `<span style="color:var(--faint)">${l.t}</span><span class="m">${l.method}</span><span>${esc(l.path)}</span><span class="st s${String(l.status)[0]}">${l.status}</span><span class="ms">${l.ms} ms</span>`;
        box.prepend(r); if (!firstLog) flash(l.path);
      });
      while (box.children.length > 60) box.lastChild.remove();
      logSince = d.last;
    }
    firstLog = false; $('#logPill').className = 'pill sm ok';
  } catch (e) { $('#logPill').className = 'pill sm bad'; }
}
const fmtUp = s => s < 90 ? s + ' s' : s < 5400 ? Math.round(s / 60) + ' min' : (s / 3600).toFixed(1) + ' h';
let sysLoaded = false;
async function loadSystem() {
  try {
    const s = await api('/api/system?quiet=1'), m = s.model;
    $('#sysInfo').innerHTML = [['Python', s.python], ['scikit-learn', s.sklearn], ['FastAPI', s.fastapi], ['System', s.os], ['Uptime', fmtUp(s.uptime_s)], ['Classifier', m ? m.classifier : 'not trained'], ['Fields', m ? m.classes : '-'], ['Word vocabulary', m ? m.body_vocab.toLocaleString() : '-'], ['Title vocabulary', m ? m.title_vocab.toLocaleString() : '-'], ['Model file', m ? m.file_mb + ' MB' : '-'], ['Gemini model', s.llm_model], ['Gemini key', (store.status && store.status.llm_configured) ? 'set' : 'not set']]
      .map(([k, v]) => `<dt>${k}</dt><dd>${esc(v)}</dd>`).join('');
    if (!sysLoaded) buildExplorer(s.endpoints); sysLoaded = true;
  } catch (e) { $('#sysInfo').innerHTML = '<dt>Backend</dt><dd>offline</dd>'; }
}
const SAMPLE_BODY = {
  '/api/predict': {text: SAMPLES.hr}, '/api/explain': {text: SAMPLES.it, k: 8}, '/api/ats': {text: SAMPLES.chef, category: 'CHEF'},
  '/api/generate': {name: 'Aman Sheikh', target_role: 'Web Developer', skills: 'HTML, CSS, JavaScript', experience: '', education: 'BCA | LJ University | 2022-2025', projects: 'Nutri-Scan | Nutrition scanner app'}
};
let curEp = null;
function buildExplorer(eps) {
  $('#epList').innerHTML = eps.filter(e => e.path !== '/api/logs').map(e => `<li><button data-p="${e.path}" data-m="${e.methods[0]}"><em class="${e.methods[0] === 'POST' ? 'post' : ''}">${e.methods[0]}</em>${e.path.replace('/api', '')}</button></li>`).join('');
  $$('#epList button').forEach(b => b.onclick = () => {
    $$('#epList button').forEach(x => x.classList.toggle('on', x === b)); curEp = {path: b.dataset.p, method: b.dataset.m};
    $('#epTitle').textContent = `${curEp.method} ${curEp.path}`;
    const noBody = curEp.method === 'GET', upload = ['/api/train', '/api/extract-text'].includes(curEp.path);
    $('#epReq').disabled = noBody || upload; $('#epReq').value = upload ? '' : noBody ? '' : JSON.stringify(SAMPLE_BODY[curEp.path] || {}, null, 2);
    $('#epReq').placeholder = upload ? 'This endpoint takes a file. Use the Studio or the training lab.' : noBody ? 'No body for GET requests.' : '';
    $('#epRun').disabled = upload; $('#epRes').textContent = 'Nothing sent yet.'; $('#epMeta').textContent = '';
  });
}
$('#epRun').onclick = async () => {
  if (!curEp) return; const t0 = performance.now(); let body;
  if (curEp.method === 'POST') { try { body = JSON.stringify(JSON.parse($('#epReq').value || '{}')); } catch (e) { $('#epRes').textContent = 'Request body is not valid JSON: ' + e.message; return; } }
  busy($('#epRun'), true, 'Sending');
  try {
    const r = await fetch(curEp.path, {method: curEp.method, headers: hdr(), body}), txt = await r.text(); let out = txt; try { out = JSON.stringify(JSON.parse(txt), null, 2); } catch (e) {}
    $('#epRes').textContent = out; $('#epMeta').textContent = `${r.status} · ${Math.round(performance.now() - t0)} ms`;
  } catch (e) { $('#epRes').textContent = 'Could not reach the backend: ' + e.message; }
  busy($('#epRun'), false); pollLogs();
};

/* training lab */
function stepper(logLines, running) {
  const text = logLines.join('\n'); let last = -1;
  $$('#stepper li').forEach((li, i) => { if (text.includes(li.dataset.k)) last = i; });
  $$('#stepper li').forEach((li, i) => { li.className = i < last ? 'done' : i === last ? (running ? 'now' : 'done') : ''; });
}
$('#csvFile').onchange = e => { if (e.target.files[0]) toast('Selected ' + e.target.files[0].name); };
$('#trainBtn').onclick = async () => {
  const btn = $('#trainBtn'); busy(btn, true, 'Training'); $('#trainLog').textContent = 'Starting…'; stepper([], false);
  const fd = new FormData(); const f = $('#csvFile').files[0]; if (f) fd.append('file', f);
  try { await api('/api/train', {method: 'POST', body: fd}); } catch (e) { $('#trainLog').textContent = 'Error: ' + e.message; busy(btn, false); return; }
  flash('/api/train');
  const timer = setInterval(async () => {
    try {
      const t = await api('/api/train/status'); $('#trainLog').textContent = t.log.join('\n'); $('#trainLog').scrollTop = 1e9; stepper(t.log, t.status === 'running');
      if (t.status !== 'running') { clearInterval(timer); busy(btn, false); stepper(t.log, false); refreshStatus(); pollLogs(); toast(t.status === 'done' ? 'Training finished' : 'Training failed'); }
    } catch (e) { clearInterval(timer); busy(btn, false); }
  }, 900);
};

/* =============================================================== settings */
const dlg = $('#settings');
$('#openSettings').onclick = () => { $('#apiKey').value = getKey(); $('#modelName').value = getModel(); msg('#testOut', '', ''); dlg.showModal(); };
const saveSettings = () => { sessionStorage.setItem('gkey', $('#apiKey').value.trim()); sessionStorage.setItem('gmodel', $('#modelName').value.trim()); };
$('#saveKey').onclick = () => { saveSettings(); dlg.close(); toast('Saved for this tab'); refreshStatus(); };
$('#testKey').onclick = async () => {
  saveSettings(); const b = $('#testKey'); busy(b, true, 'Testing');
  try { const d = await api('/api/test-llm', {method: 'POST', headers: hdr()}); msg('#testOut', d.ok ? 'ok' : 'err', d.detail); } catch (e) { msg('#testOut', 'err', e.message); }
  busy(b, false);
};

/* =============================================================== router */
const PAGES = ['home', 'studio', 'galaxy', 'backend'];
function route(scroll = true) {
  const name = (location.hash.replace(/^#\/?/, '') || 'home'), page = PAGES.includes(name) ? name : 'home';
  $$('.page').forEach(p => p.classList.toggle('on', p.dataset.route === page));
  $$('.links a').forEach(a => a.classList.toggle('on', a.dataset.link === page));
  if (scroll) scrollTo(0, 0);
  page === 'home' ? Hero.start() : Hero.stop();
  page === 'galaxy' ? Galaxy.start() : Galaxy.stop();
  clearInterval(logTimer);
  if (page === 'backend') { loadSystem(); pollLogs(); logTimer = setInterval(pollLogs, 1500); }
  document.title = (page === 'home' ? '' : pretty(page) + ' · ') + 'Resume AI Studio';
}
addEventListener('hashchange', route);
document.addEventListener('visibilitychange', () => { if (document.hidden) { Hero.stop(); Galaxy.stop(); } else route(false); });

(async function boot() {
  route(); await refreshStatus(true); setInterval(() => refreshStatus(false), 8000);
  $('#heroText').value = ''; 
})();
