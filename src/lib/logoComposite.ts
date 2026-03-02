export type CompositeMode = "auto" | "sticker" | "realistic";

export interface CompositeOptions {
  baseImageUrl: string;
  logoDataUrl: string;
  mode: CompositeMode;
  scale: number;       // 0.05 – 1.0
  rotation: number;    // degrees
  positionX: number;   // 0 – 1 (fraction of base width)
  positionY: number;   // 0 – 1 (fraction of base height)
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export async function compositeLogo(opts: CompositeOptions): Promise<string> {
  const [base, logo] = await Promise.all([
    loadImage(opts.baseImageUrl),
    loadImage(opts.logoDataUrl),
  ]);

  const canvas = document.createElement("canvas");
  canvas.width = base.width;
  canvas.height = base.height;
  const ctx = canvas.getContext("2d")!;

  // Draw base scene
  ctx.drawImage(base, 0, 0);

  // Calculate logo dimensions
  const maxDim = Math.min(base.width, base.height);
  const logoScale = opts.scale * maxDim;
  const aspect = logo.width / logo.height;
  const drawW = aspect >= 1 ? logoScale : logoScale * aspect;
  const drawH = aspect >= 1 ? logoScale / aspect : logoScale;

  const cx = opts.positionX * base.width;
  const cy = opts.positionY * base.height;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate((opts.rotation * Math.PI) / 180);

  const mode = opts.mode === "auto" ? "sticker" : opts.mode;

  if (mode === "realistic") {
    // Realistic: multiply blend + slight opacity for surface integration
    ctx.globalAlpha = 0.92;
    ctx.globalCompositeOperation = "multiply";
    ctx.drawImage(logo, -drawW / 2, -drawH / 2, drawW, drawH);

    // Overlay pass for vibrancy
    ctx.globalCompositeOperation = "screen";
    ctx.globalAlpha = 0.3;
    ctx.drawImage(logo, -drawW / 2, -drawH / 2, drawW, drawH);

    // Normal pass for sharpness
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 0.7;
    ctx.drawImage(logo, -drawW / 2, -drawH / 2, drawW, drawH);
  } else {
    // Sticker: drop shadow + clean overlay
    ctx.shadowColor = "rgba(0,0,0,0.35)";
    ctx.shadowBlur = drawW * 0.04;
    ctx.shadowOffsetX = drawW * 0.015;
    ctx.shadowOffsetY = drawW * 0.02;
    ctx.globalAlpha = 1;
    ctx.drawImage(logo, -drawW / 2, -drawH / 2, drawW, drawH);
  }

  ctx.restore();

  return canvas.toDataURL("image/png");
}
