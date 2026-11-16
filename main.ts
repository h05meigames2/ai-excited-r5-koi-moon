// Koi to the Moon — make.fun bounty ai-excited-01, round 5 entry.
// Procedural 1024x1024 PNG, standard library only, fully deterministic.
// A giant koi leaps out of a waterfall, arcing through the night sky
// toward a huge full moon. No text anywhere in the image.
import { writeFileSync, mkdirSync } from "node:fs";
import { deflateSync } from "node:zlib";

const W = 1024;
const H = 1024;
const buf = new Uint8ClampedArray(W * H * 4);

// ---- deterministic PRNG (mulberry32) ----
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rnd = mulberry32(20261117);

// ---- pixel helpers ----
function px(x: number, y: number, r: number, g: number, b: number, a = 1) {
  const xi = x | 0, yi = y | 0;
  if (xi < 0 || yi < 0 || xi >= W || yi >= H) return;
  const i = (yi * W + xi) * 4;
  const ia = 1 - a;
  buf[i] = r * a + buf[i] * ia;
  buf[i + 1] = g * a + buf[i + 1] * ia;
  buf[i + 2] = b * a + buf[i + 2] * ia;
  buf[i + 3] = 255;
}
function circle(cx: number, cy: number, rad: number, r: number, g: number, b: number, a = 1) {
  const x0 = Math.max(0, Math.floor(cx - rad)), x1 = Math.min(W - 1, Math.ceil(cx + rad));
  const y0 = Math.max(0, Math.floor(cy - rad)), y1 = Math.min(H - 1, Math.ceil(cy + rad));
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
    const dx = x - cx, dy = y - cy;
    if (dx * dx + dy * dy <= rad * rad) px(x, y, r, g, b, a);
  }
}
function ellipse(cx: number, cy: number, rx: number, ry: number, rot: number, r: number, g: number, b: number, a = 1) {
  const cos = Math.cos(rot), sin = Math.sin(rot);
  const x0 = Math.max(0, Math.floor(cx - rx - ry)), x1 = Math.min(W - 1, Math.ceil(cx + rx + ry));
  const y0 = Math.max(0, Math.floor(cy - rx - ry)), y1 = Math.min(H - 1, Math.ceil(cy + rx + ry));
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
    const dx = x - cx, dy = y - cy;
    const u = (dx * cos + dy * sin) / rx, v = (-dx * sin + dy * cos) / ry;
    if (u * u + v * v <= 1) px(x, y, r, g, b, a);
  }
}
function thickLine(x0: number, y0: number, x1: number, y1: number, w: number, r: number, g: number, b: number, a = 1) {
  const steps = Math.ceil(Math.hypot(x1 - x0, y1 - y0)) + 1;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    circle(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, w / 2, r, g, b, a);
  }
}
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// ---- 1. night sky gradient ----
for (let y = 0; y < H; y++) {
  const t = y / H;
  let r: number, g: number, b: number;
  if (t < 0.55) { const u = t / 0.55; r = lerp(7, 16, u); g = lerp(12, 30, u); b = lerp(38, 74, u); }
  else { const u = (t - 0.55) / 0.45; r = lerp(16, 34, u); g = lerp(30, 62, u); b = lerp(74, 110, u); }
  for (let x = 0; x < W; x++) { const i = (y * W + x) * 4; buf[i] = r; buf[i + 1] = g; buf[i + 2] = b; buf[i + 3] = 255; }
}

// ---- 2. stars ----
for (let i = 0; i < 320; i++) {
  const x = rnd() * W, y = rnd() * H * 0.72;
  const s = rnd();
  const rad = s < 0.85 ? 1 : s < 0.97 ? 1.8 : 2.6;
  const br = 150 + rnd() * 105;
  circle(x, y, rad, br, br, Math.min(255, br + 20), 0.35 + rnd() * 0.6);
  if (s > 0.97) { // sparkle cross
    thickLine(x - 6, y, x + 6, y, 1, 255, 255, 255, 0.5);
    thickLine(x, y - 6, x, y + 6, 1, 255, 255, 255, 0.5);
  }
}

// ---- 3. moon glow + moon ----
const MX = 758, MY = 236, MR = 148;
for (let rad = 330; rad > MR; rad -= 2) {
  const a = 0.10 * (1 - (rad - MR) / (330 - MR));
  circle(MX, MY, rad, 235, 225, 190, a * 0.28);
}
circle(MX, MY, MR, 250, 240, 205);
circle(MX, MY, MR - 6, 246, 234, 196);
// craters (subtle, darker warm grey)
const craters: Array<[number, number, number]> = [[-52, -38, 26], [34, 18, 20], [-8, 52, 15], [62, -58, 17], [-70, 30, 12], [10, -70, 13]];
for (const [dx, dy, cr] of craters) circle(MX + dx, MY + dy, cr, 214, 200, 168, 0.55);
for (const [dx, dy, cr] of craters) circle(MX + dx - 3, MY + dy - 3, cr * 0.7, 228, 216, 182, 0.4);
// bright rim on lower-left edge
for (let a = 0; a < Math.PI * 2; a += 0.01) {
  const x = MX + Math.cos(a) * (MR - 2), y = MY + Math.sin(a) * (MR - 2);
  if (a > Math.PI * 0.6 && a < Math.PI * 1.4) circle(x, y, 2.5, 255, 250, 225, 0.7);
}

// ---- 4. faint clouds near moon (kept clear of the moon disc) ----
for (let i = 0; i < 7; i++) {
  let cx = 120 + rnd() * 700, cy = 120 + rnd() * 260;
  if (Math.hypot(cx - MX, cy - MY) < 260) { cx = 120 + rnd() * 320; cy = 90 + rnd() * 120; }
  for (let j = 0; j < 26; j++) {
    const ox = (rnd() - 0.5) * 150, oy = (rnd() - 0.5) * 22;
    circle(cx + ox, cy + oy, 8 + rnd() * 14, 120, 140, 190, 0.05);
  }
}

// ---- 5. waterfall (left edge) ----
// per-column brightness: a few low-frequency waves + seeded jitter,
// so the falls read as flowing sheets, not flat stripes.
const colB: number[] = [];
for (let x = 0; x < 200; x++) {
  colB.push(0.5 + 0.28 * Math.sin(x * 0.11 + 1.3) + 0.16 * Math.sin(x * 0.031 + 4.0) + (rnd() - 0.5) * 0.22);
}
for (let x = 0; x < 175; x++) {
  const edge = 150 + 26 * Math.sin(x * 0.05);
  for (let y = 0; y < H; y++) {
    if (x > edge) continue;
    const flow = 0.5 + 0.5 * Math.sin(y * 0.05 + x * 0.35 + Math.sin(x * 0.2) * 2);
    const base = Math.max(0.15, Math.min(1, colB[x] * (0.75 + flow * 0.45)));
    const foam = y > 640 ? 1 - (y - 640) / 380 : 0;
    const r = lerp(30, 235, base * 0.8 + foam * 0.2);
    const g = lerp(60, 245, base * 0.8 + foam * 0.2);
    const b = lerp(120, 255, base);
    px(x, y, r, g, b, 0.85);
  }
}
// dark rocky edge on the right side of the falls
for (let y = 0; y < 720; y++) {
  const rx = 172 + 10 * Math.sin(y * 0.018 + 0.7) + 4 * Math.sin(y * 0.06);
  for (let x = Math.floor(rx); x < rx + 13; x++) {
    px(x, y, 30, 40, 72, 0.75);
  }
}
// waterfall foam bursts at base
for (let i = 0; i < 90; i++) {
  const x = 20 + rnd() * 200, y = 700 + rnd() * 130;
  circle(x, y, 3 + rnd() * 10, 225, 240, 255, 0.25 + rnd() * 0.4);
}

// ---- 6. pool at bottom ----
for (let y = 830; y < H; y++) {
  const t = (y - 830) / (H - 830);
  for (let x = 0; x < W; x++) {
    const wob = Math.sin(x * 0.03 + y * 0.11) * 6;
    const r = lerp(14, 26, t) + wob * 0.3, g = lerp(34, 52, t) + wob * 0.3, b = lerp(72, 96, t) + wob * 0.3;
    const i = (y * W + x) * 4;
    buf[i] = r; buf[i + 1] = g; buf[i + 2] = b; buf[i + 3] = 255;
  }
}
// moon reflection column on the pool: horizontal shimmering streaks
for (let i = 0; i < 90; i++) {
  const y = 845 + rnd() * 165;
  const halfW = 26 + rnd() * 55 * (1 - (y - 845) / 220);
  const x = MX + (rnd() - 0.5) * halfW * 2;
  const len = 12 + rnd() * 42;
  thickLine(x - len / 2, y, x + len / 2, y, 2.5, 240, 228, 185, 0.10 + rnd() * 0.22);
}
// ripple rings where the koi left the water
for (const [cy, rx, a] of [[872, 150, 0.55], [892, 210, 0.4], [912, 275, 0.28]] as const) {
  for (let th = 0; th < Math.PI * 2; th += 0.004) {
    const x = 190 + Math.cos(th) * rx, y = cy + Math.sin(th) * rx * 0.22;
    circle(x, y, 2.5, 200, 225, 255, a);
  }
}

// ---- 7. spray trail along the leap arc ----
const q = (t: number) => { // quadratic bezier: pool -> apex -> moon
  const x0 = 190, y0 = 800, x1 = 330, y1 = 300, x2 = 660, y2 = 330;
  const u = 1 - t;
  return [u * u * x0 + 2 * u * t * x1 + t * t * x2, u * u * y0 + 2 * u * t * y1 + t * t * y2] as const;
};
for (let i = 0; i < 420; i++) {
  const t = rnd();
  const [bx, by] = q(t);
  const spread = 14 + t * 55;
  const x = bx + (rnd() - 0.5) * spread * 2;
  const y = by + (rnd() - 0.5) * spread * 1.4 + 26;
  const rad = 1 + rnd() * 4.5;
  circle(x, y, rad, 210, 232, 255, 0.25 + rnd() * 0.55);
}
// elongated spray streaks near the tail
for (let i = 0; i < 26; i++) {
  const t = 0.04 + rnd() * 0.22;
  const [bx, by] = q(t);
  const ang = -0.9 + rnd() * 0.5;
  const len = 14 + rnd() * 30;
  thickLine(bx, by, bx + Math.cos(ang) * len, by + Math.sin(ang) * len, 2, 215, 235, 255, 0.5);
}

// ---- 8. the koi ----
// body: circles along the bezier, radius profile head->tail
const bodyPts: Array<[number, number, number]> = [];
for (let i = 0; i <= 60; i++) {
  const t = 0.06 + (i / 60) * 0.62; // head near moon side, tail toward pool
  const [x, y] = q(t);
  const prof = Math.sin(Math.min(1, (i / 60) * 1.15) * Math.PI * 0.62) ; // fat mid-body
  const rad = 18 + prof * 54;
  bodyPts.push([x, y, rad]);
}
// tail ribbons first (behind body): continuous tapering strokes
const tailBase = bodyPts[0];
for (const [dx, dy, ex, ey, wdt, col] of [
  [-70, 60, -168, 208, 30, [250, 246, 235]], [-95, 95, -138, 248, 23, [240, 110, 40]],
  [-45, 95, -88, 218, 20, [250, 246, 235]],
] as const) {
  const cxp = tailBase[0] + dx, cyp = tailBase[1] + dy;
  const exx = tailBase[0] + ex, eyy = tailBase[1] + ey;
  const steps = 40;
  let px0 = tailBase[0], py0 = tailBase[1];
  for (let s = 1; s <= steps; s++) {
    const tt = s / steps;
    const x = (1 - tt) * (1 - tt) * tailBase[0] + 2 * (1 - tt) * tt * cxp + tt * tt * exx;
    const y = (1 - tt) * (1 - tt) * tailBase[1] + 2 * (1 - tt) * tt * cyp + tt * tt * eyy;
    thickLine(px0, py0, x, y, wdt * (1 - tt * 0.7), col[0], col[1], col[2], 0.95);
    px0 = x; py0 = y;
  }
}
// body: orange top, white belly — draw orange full, then white lower half
for (const [x, y, rad] of bodyPts) circle(x, y, rad, 232, 96, 28, 1);
for (const [x, y, rad] of bodyPts) {
  // belly: offset downward along local normal (approx: +y bias, body slopes up-right)
  ellipse(x + 6, y + rad * 0.42, rad * 0.92, rad * 0.55, -0.5, 250, 246, 235, 0.95);
}
// black koi patches on the back — larger, irregular, hugging the top edge
const patches: Array<[number, number, number, number]> = [[0.30, 0.55, 20, 12], [0.44, 0.48, 15, 10], [0.56, 0.55, 17, 11], [0.68, 0.42, 12, 8]];
for (const [tt, off, pr, pr2] of patches) {
  const idx = Math.floor(tt * 60);
  const [x, y, rad] = bodyPts[Math.min(60, idx)];
  ellipse(x - 6, y - rad * off, pr, pr2, -0.6, 22, 20, 26, 0.9);
}
// golden highlight along the moon-facing top edge of the body
for (let i = 0; i < 59; i++) {
  const [x0, y0, r0] = bodyPts[i];
  const [x1, y1] = bodyPts[i + 1];
  thickLine(x0 - 4, y0 - r0 * 0.72, x1 - 4, y1 - bodyPts[i + 1][2] * 0.72, 3.5, 255, 176, 90, 0.55);
}
// pectoral fin
const mid = bodyPts[38];
ellipse(mid[0] + 18, mid[1] + mid[2] * 0.75, 34, 13, 0.7, 240, 120, 45, 0.95);
ellipse(mid[0] + 18, mid[1] + mid[2] * 0.75, 24, 8, 0.7, 250, 246, 235, 0.6);
// head + eye (head is the moon-side end)
const head = bodyPts[60];
circle(head[0], head[1], head[2] * 0.92, 232, 96, 28, 1);
ellipse(head[0] + 8, head[1] + head[2] * 0.4, head[2] * 0.8, head[2] * 0.45, -0.5, 250, 246, 235, 0.95);
circle(head[0] + 26, head[1] - 12, 7, 18, 16, 22, 1);
circle(head[0] + 28, head[1] - 14, 2.5, 255, 255, 255, 1);
// whiskers
thickLine(head[0] + 34, head[1] + 6, head[0] + 62, head[1] + 22, 2, 250, 240, 220, 0.9);
thickLine(head[0] + 30, head[1] + 12, head[0] + 56, head[1] + 34, 2, 250, 240, 220, 0.9);
// mouth highlight
thickLine(head[0] + 38, head[1] + 2, head[0] + 52, head[1] - 2, 3, 120, 40, 10, 0.8);

// ---- 9. foreground spray burst around the koi ----
for (let i = 0; i < 130; i++) {
  const a = rnd() * Math.PI * 2, d = 40 + rnd() * 110;
  const x = head[0] + Math.cos(a) * d * 1.4, y = head[1] + Math.sin(a) * d;
  circle(x, y, 1 + rnd() * 3.5, 220, 238, 255, 0.3 + rnd() * 0.5);
}

// ---- 10. vignette ----
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
  const dx = (x - W / 2) / (W / 2), dy = (y - H / 2) / (H / 2);
  const d = Math.sqrt(dx * dx + dy * dy);
  if (d > 0.85) {
    const a = (d - 0.85) / 0.55 * 0.35;
    const i = (y * W + x) * 4;
    buf[i] *= 1 - a; buf[i + 1] *= 1 - a; buf[i + 2] *= 1 - a;
  }
}

// ---- minimal PNG encoder (filter 0, zlib deflate, CRC32) ----
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  crcTable[n] = c >>> 0;
}
function crc32(b: Buffer): number {
  let c = 0xffffffff;
  for (let i = 0; i < b.length; i++) c = crcTable[(c ^ b[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type: string, data: Buffer): Buffer {
  const out = Buffer.alloc(12 + data.length);
  out.writeUInt32BE(data.length, 0);
  out.write(type, 4, "ascii");
  data.copy(out, 8);
  out.writeUInt32BE(crc32(Buffer.concat([Buffer.from(type, "ascii"), data])), 8 + data.length);
  return out;
}
const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(W, 0); ihdr.writeUInt32BE(H, 4);
ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
const raw = Buffer.alloc(H * (1 + W * 4));
for (let y = 0; y < H; y++) {
  raw[y * (1 + W * 4)] = 0;
  Buffer.from(buf.buffer, y * W * 4, W * 4).copy(raw, y * (1 + W * 4) + 1);
}
const png = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  chunk("IHDR", ihdr),
  chunk("IDAT", deflateSync(raw, { level: 9 })),
  chunk("IEND", Buffer.alloc(0)),
]);
const outDir = process.env.MAKEFUN_OUTPUT_DIR || "/output";
mkdirSync(outDir, { recursive: true });
writeFileSync(`${outDir}/entry.png`, png);
console.log(`wrote ${outDir}/entry.png (${png.length} bytes, ${W}x${H})`);
