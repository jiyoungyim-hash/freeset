import type { CustomSetting, CropMode } from './types';

export interface AiExpandInput {
  blob: Blob
  left: number
  right: number
  up: number
  down: number
  isNoOp: boolean
}

export async function prepareAiExpandBlob(
  img: HTMLImageElement,
  targetW: number,
  targetH: number,
): Promise<AiExpandInput> {
  const scale = Math.min(targetW / img.naturalWidth, targetH / img.naturalHeight)
  const scaledW = Math.round(img.naturalWidth * scale)
  const scaledH = Math.round(img.naturalHeight * scale)

  const totalPadW = targetW - scaledW
  const totalPadH = targetH - scaledH
  const left = Math.floor(totalPadW / 2)
  const right = totalPadW - left
  const up = Math.floor(totalPadH / 2)
  const down = totalPadH - up

  const canvas = document.createElement('canvas')
  canvas.width = scaledW
  canvas.height = scaledH
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(img, 0, 0, scaledW, scaledH)

  return new Promise(resolve => {
    canvas.toBlob(blob => {
      resolve({ blob: blob!, left, right, up, down, isNoOp: totalPadW === 0 && totalPadH === 0 })
    }, 'image/png')
  })
}

export async function aiExpandImage(
  img: HTMLImageElement,
  targetW: number,
  targetH: number,
): Promise<string> {
  const input = await prepareAiExpandBlob(img, targetW, targetH)

  if (input.isNoOp) {
    const canvas = document.createElement('canvas')
    canvas.width = targetW
    canvas.height = targetH
    canvas.getContext('2d')!.drawImage(img, 0, 0, targetW, targetH)
    return new Promise(resolve => canvas.toBlob(b => {
      const reader = new FileReader()
      reader.onload = e => resolve(e.target!.result as string)
      reader.readAsDataURL(b!)
    }, 'image/png'))
  }

  const form = new FormData()
  form.append('image', input.blob, 'image.png')
  form.append('left', String(input.left))
  form.append('right', String(input.right))
  form.append('up', String(input.up))
  form.append('down', String(input.down))

  const res = await fetch('/api/ai-expand', { method: 'POST', body: form })
  if (!res.ok) {
    const { error } = await res.json()
    throw new Error(error ?? 'AI 배경 확장 실패')
  }
  const { dataUrl } = await res.json()
  return dataUrl
}

export function extractEdgeColor(img: HTMLImageElement): string {
  const size = 80;
  const tmp = document.createElement('canvas');
  tmp.width = tmp.height = size;
  const ctx = tmp.getContext('2d')!;
  ctx.drawImage(img, 0, 0, size, size);
  const data = ctx.getImageData(0, 0, size, size).data;
  let r = 0, g = 0, b = 0, count = 0;
  const sample = (x: number, y: number) => {
    const i = (y * size + x) * 4;
    r += data[i]; g += data[i + 1]; b += data[i + 2]; count++;
  };
  for (let i = 0; i < size; i++) {
    sample(i, 0); sample(i, size - 1);
    sample(0, i); sample(size - 1, i);
  }
  return `rgb(${Math.round(r / count)},${Math.round(g / count)},${Math.round(b / count)})`;
}

export function drawBgBlur(ctx: CanvasRenderingContext2D, img: HTMLImageElement, w: number, h: number) {
  const s = Math.max(w / img.naturalWidth, h / img.naturalHeight);
  const dw = img.naturalWidth * s;
  const dh = img.naturalHeight * s;
  ctx.save();
  ctx.filter = 'blur(40px) brightness(0.85) saturate(1.2)';
  ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
  ctx.restore();
  const edgeColor = extractEdgeColor(img);
  ctx.save();
  ctx.globalAlpha = 0.35;
  ctx.fillStyle = edgeColor;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
  ctx.globalAlpha = 1;
}

export function drawImage(
  canvas: HTMLCanvasElement,
  img: HTMLImageElement,
  w: number,
  h: number,
  mode: CropMode
) {
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  const iw = img.naturalWidth, ih = img.naturalHeight;

  if (mode === 'stretch') {
    ctx.drawImage(img, 0, 0, w, h);
    return;
  }

  const scale = Math.min(w / iw, h / ih);
  const dw = iw * scale;
  const dh = ih * scale;
  const dx = (w - dw) / 2;
  const dy = (h - dh) / 2;

  if (dw < w || dh < h) {
    drawBgBlur(ctx, img, w, h);
  } else {
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, w, h);
  }
  ctx.drawImage(img, dx, dy, dw, dh);
}

export function drawImageCustom(
  canvas: HTMLCanvasElement,
  img: HTMLImageElement,
  w: number,
  h: number,
  s: CustomSetting
) {
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  if (s.bgColor === 'auto') {
    drawBgBlur(ctx, img, w, h);
  } else {
    ctx.fillStyle = s.bgColor;
    ctx.fillRect(0, 0, w, h);
  }

  const iw = img.naturalWidth, ih = img.naturalHeight;
  const zoomFactor = (s.imgZoom || 100) / 100;
  const baseScale = Math.min(w / iw, h / ih) * zoomFactor;
  const dw = iw * baseScale;
  const dh = ih * baseScale;

  const px = s.posH === 'ml' ? 0 : s.posH === 'mr' ? w - dw : (w - dw) / 2;
  const py = s.posV === 'tc' ? 0 : s.posV === 'bc' ? h - dh : (h - dh) / 2;

  ctx.save();
  ctx.globalAlpha = (s.imgOpacity ?? 100) / 100;
  ctx.filter = `brightness(${s.brightness}%) contrast(${s.contrast}%) saturate(${s.saturation}%)`;
  ctx.drawImage(img, px, py, dw, dh);
  ctx.restore();

  const layers = s.textLayers || [];
  layers.forEach(layer => {
    if (!layer.text) return;
    const lines = layer.text.split('\n');
    const fontSize = Math.max(8, Math.round(layer.size * (w / 400)));
    const lineH = fontSize * 1.45;
    const weight = layer.bold ? '700' : '400';
    ctx.save();
    ctx.globalAlpha = layer.opacity / 100;
    ctx.font = `${weight} ${fontSize}px 'SUIT', 'Apple SD Gothic Neo', sans-serif`;
    ctx.fillStyle = layer.color || '#FFFFFF';
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = Math.max(2, fontSize * 0.15);
    const maxW = lines.reduce((m, l) => Math.max(m, ctx.measureText(l).width), 0);
    const totalH = lines.length * lineH;
    const pad = fontSize * 0.8;
    const offsetScale = w / 400;
    let tx: number, ty: number;
    switch (layer.pos) {
      case 'tl': tx = pad; ty = fontSize + pad; break;
      case 'tc': tx = (w - maxW) / 2; ty = fontSize + pad; break;
      case 'tr': tx = w - maxW - pad; ty = fontSize + pad; break;
      case 'bl': tx = pad; ty = h - pad - totalH + fontSize; break;
      case 'bc': tx = (w - maxW) / 2; ty = h - pad - totalH + fontSize; break;
      case 'mc': tx = (w - maxW) / 2; ty = (h - totalH) / 2 + fontSize; break;
      case 'br': default: tx = w - maxW - pad; ty = h - pad - totalH + fontSize; break;
    }
    tx += (layer.offsetX || 0) * offsetScale;
    ty += (layer.offsetY || 0) * offsetScale;
    lines.forEach((line, i) => {
      let lx = tx;
      if (['tc', 'bc', 'mc'].includes(layer.pos))
        lx = (w - ctx.measureText(line).width) / 2 + (layer.offsetX || 0) * offsetScale;
      if (['tr', 'br'].includes(layer.pos))
        lx = w - ctx.measureText(line).width - pad + (layer.offsetX || 0) * offsetScale;
      ctx.fillText(line, lx, ty + i * lineH);
    });
    ctx.restore();
  });
}
