/**
 * Generează iconițele PNG ale PWA-ului (192/512) fără dependențe externe —
 * desen în buffer RGBA + encoder PNG minimal (zlib din node). Reproduce
 * aproximativ icon.svg: pătrat verde-pădure cu colțuri rotunde + frunze.
 * Rulare: `node scripts/make-icons.mjs` (scrie în public/).
 */
import { deflateSync } from "node:zlib";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "public");

const BG = [0x0d, 0x63, 0x1b, 255]; // verde pădure (token Stitch)
const LEAF_LIGHT = [0xa3, 0xf6, 0x9c, 255];
const WHITE = [255, 255, 255, 255];

function draw(size) {
  const px = Buffer.alloc(size * size * 4); // RGBA, transparent
  const s = size / 512; // desenul e definit în coordonatele SVG-ului (512)
  const put = (x, y, c) => {
    const i = (y * size + x) * 4;
    px[i] = c[0]; px[i + 1] = c[1]; px[i + 2] = c[2]; px[i + 3] = c[3];
  };

  const R = 112 * s; // raza colțurilor
  const inRounded = (x, y) => {
    const cx = x < R ? R : x > size - R ? size - R : x;
    const cy = y < R ? R : y > size - R ? size - R : y;
    if ((x < R || x > size - R) && (y < R || y > size - R)) {
      return (x - cx) ** 2 + (y - cy) ** 2 <= R * R;
    }
    return true;
  };

  // frunză = elipsă rotită (u,v = coordonate în cadrul rotit)
  const leaf = (x, y, cx, cy, a, b, deg) => {
    const t = (deg * Math.PI) / 180;
    const dx = x - cx * s, dy = y - cy * s;
    const u = Math.cos(t) * dx + Math.sin(t) * dy;
    const v = -Math.sin(t) * dx + Math.cos(t) * dy;
    return (u * u) / ((a * s) ** 2) + (v * v) / ((b * s) ** 2) <= 1;
  };

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (!inRounded(x, y)) continue;
      put(x, y, BG);
      // tulpina
      if (Math.abs(x - 256 * s) <= 12 * s && y >= 230 * s && y <= 372 * s) put(x, y, WHITE);
      // frunza deschisă (dreapta-sus) + frunza albă (stânga)
      if (leaf(x, y, 312, 210, 78, 34, -45)) put(x, y, LEAF_LIGHT);
      if (leaf(x, y, 203, 250, 72, 31, 45)) put(x, y, WHITE);
    }
  }
  return px;
}

// ——— encoder PNG minimal (IHDR + IDAT + IEND) ————————————————
const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
const crc32 = (buf) => {
  let c = 0xffffffff;
  for (const b of buf) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};
const chunk = (type, data) => {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
};

function png(size, rgba) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  // scanline-uri cu filtru 0
  const raw = Buffer.alloc(size * (size * 4 + 1));
  for (let y = 0; y < size; y++) {
    rgba.copy(raw, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4);
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

for (const size of [192, 512]) {
  const file = join(OUT, `icon-${size}.png`);
  writeFileSync(file, png(size, draw(size)));
  console.log(`scris ${file}`);
}
