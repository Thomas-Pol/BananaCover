export function centralFallbackBox(canvas: HTMLCanvasElement | null): [number, number, number, number] {
  if (!canvas) return [50, 50, 200, 200];
  const w = canvas.width * 0.4;
  const h = canvas.height * 0.4;
  return [(canvas.width - w) / 2, (canvas.height - h) / 2, w, h];
}

export function bananafyBox(
  bbox: [number, number, number, number],
  canvas: HTMLCanvasElement | null,
  sprite: HTMLImageElement | null,
  options?: { density?: number }
): number {
  if (!canvas || !sprite || !sprite.complete) return 0;
  const ctx = canvas.getContext('2d');
  if (!ctx) return 0;
  const [x, y, w, h] = bbox;
  ctx.save();
  ctx.fillStyle = 'rgba(255,246,191,0.85)';
  ctx.fillRect(x, y, w, h);
  const density = options?.density ?? 1; 
  const targetAcross = Math.min(10, Math.max(4, Math.floor((w / 70) * density)));
  const baseWidth = w / targetAcross;
  const scale = baseWidth / sprite.width;
  const bananaW = baseWidth;
  const bananaH = sprite.height * scale;
  const colStride = bananaW * 0.8;
  const rowStride = bananaH * 0.7;
  const cols = Math.max(1, Math.ceil(w / colStride));
  const rows = Math.max(1, Math.ceil(h / rowStride));
  let count = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const bx = x + c * colStride + Math.random() * bananaW * 0.2;
      const by = y + r * rowStride + Math.random() * bananaH * 0.2;
      if (bx > x + w - bananaW || by > y + h - bananaH) continue;
      ctx.save();
      const cx = bx + bananaW / 2;
      const cy = by + bananaH / 2;
      ctx.translate(cx, cy);
      ctx.rotate((Math.random() - 0.5) * 0.8);
      ctx.translate(-cx, -cy);
      ctx.drawImage(sprite, bx, by, bananaW, bananaH);
      ctx.restore();
      count++;
      if (count > 600) break;
    }
    if (count > 600) break;
  }
  ctx.restore();
  return count;
}
