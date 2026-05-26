const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export function validateImage(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return "Unsupported file type. Please upload JPG, PNG, or WEBP.";
  }
  if (file.size > MAX_FILE_SIZE) {
    return "File too large. Maximum size is 10MB.";
  }
  return null;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

function getImageElement(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = src;
  });
}

function convolve(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  kernel: number[]
): Uint8ClampedArray {
  const output = new Uint8ClampedArray(data.length);
  const size = Math.round(Math.sqrt(kernel.length));
  const half = Math.floor(size / 2);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const centerIdx = (y * width + x) * 4;
      const centerAlpha = data[centerIdx + 3];

      if (centerAlpha < 5) {
        output[centerIdx] = data[centerIdx];
        output[centerIdx + 1] = data[centerIdx + 1];
        output[centerIdx + 2] = data[centerIdx + 2];
        output[centerIdx + 3] = centerAlpha;
        continue;
      }

      let r = 0, g = 0, b = 0;

      for (let ky = -half; ky <= half; ky++) {
        for (let kx = -half; kx <= half; kx++) {
          const px = Math.min(width - 1, Math.max(0, x + kx));
          const py = Math.min(height - 1, Math.max(0, y + ky));
          const idx = (py * width + px) * 4;
          const k = kernel[(ky + half) * size + (kx + half)];

          if (data[idx + 3] < 5) {
            r += data[centerIdx] * k;
            g += data[centerIdx + 1] * k;
            b += data[centerIdx + 2] * k;
          } else {
            r += data[idx] * k;
            g += data[idx + 1] * k;
            b += data[idx + 2] * k;
          }
        }
      }

      output[centerIdx] = Math.max(0, Math.min(255, Math.round(r)));
      output[centerIdx + 1] = Math.max(0, Math.min(255, Math.round(g)));
      output[centerIdx + 2] = Math.max(0, Math.min(255, Math.round(b)));
      output[centerIdx + 3] = centerAlpha;
    }
  }

  return output;
}

function buildSharpenKernel(amount: number): number[] {
  const a = Math.max(0, Math.min(2, amount));
  return [
    0, -a, 0,
    -a, 1 + 4 * a, -a,
    0, -a, 0,
  ];
}

function createCanvas(width: number, height: number): {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
} {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { alpha: true, willReadFrequently: true })!;
  return { canvas, ctx };
}

function sharpenFromData(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  amount: number
): Uint8ClampedArray {
  const kernel = buildSharpenKernel(amount);
  return convolve(data, width, height, kernel);
}

export async function sharpenProcessedImage(
  originalFile: File,
  processedBlob: Blob,
  ultraHD: boolean = false
): Promise<Blob> {
  const origUrl = URL.createObjectURL(originalFile);
  const procUrl = URL.createObjectURL(processedBlob);

  const [origImg, procImg] = await Promise.all([
    getImageElement(origUrl),
    getImageElement(procUrl),
  ]);

  URL.revokeObjectURL(origUrl);
  URL.revokeObjectURL(procUrl);

  const w = origImg.naturalWidth;
  const h = origImg.naturalHeight;

  const { canvas, ctx } = createCanvas(w, h);

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  ctx.drawImage(procImg, 0, 0, w, h);

  const baseData = ctx.getImageData(0, 0, w, h);

  if (ultraHD) {
    const pre = sharpenFromData(baseData.data, w, h, 0.5);
    ctx.putImageData(new ImageData(pre.slice(), w, h), 0, 0);

    ctx.globalCompositeOperation = "source-atop";
    ctx.globalAlpha = 0.12;
    ctx.drawImage(origImg, 0, 0, w, h);
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1.0;

    const textured = ctx.getImageData(0, 0, w, h);
    const clean = sharpenFromData(textured.data, w, h, 0.3);

    const final = new Uint8ClampedArray(baseData.data.length);
    for (let i = 0; i < baseData.data.length; i += 4) {
      if (baseData.data[i + 3] < 5) {
        final[i] = 0;
        final[i + 1] = 0;
        final[i + 2] = 0;
        final[i + 3] = 0;
      } else {
        final[i] = clean[i];
        final[i + 1] = clean[i + 1];
        final[i + 2] = clean[i + 2];
        final[i + 3] = baseData.data[i + 3];
      }
    }
    ctx.putImageData(new ImageData(final.slice(), w, h), 0, 0);
  } else {
    const pre = sharpenFromData(baseData.data, w, h, 0.4);
    ctx.putImageData(new ImageData(pre.slice(), w, h), 0, 0);

    ctx.globalCompositeOperation = "source-atop";
    ctx.globalAlpha = 0.10;
    ctx.drawImage(origImg, 0, 0, w, h);
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1.0;

    const textured = ctx.getImageData(0, 0, w, h);
    const clean = sharpenFromData(textured.data, w, h, 0.25);

    const final = new Uint8ClampedArray(baseData.data.length);
    for (let i = 0; i < baseData.data.length; i += 4) {
      if (baseData.data[i + 3] < 5) {
        final[i] = 0;
        final[i + 1] = 0;
        final[i + 2] = 0;
        final[i + 3] = 0;
      } else {
        final[i] = clean[i];
        final[i + 1] = clean[i + 1];
        final[i + 2] = clean[i + 2];
        final[i + 3] = baseData.data[i + 3];
      }
    }
    ctx.putImageData(new ImageData(final.slice(), w, h), 0, 0);
  }

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/png")
  );

  return blob ?? processedBlob;
}

export async function createHDDownloadUrl(
  originalFile: File,
  processedBlob: Blob,
  ultraHD: boolean
): Promise<string> {
  const hdBlob = await sharpenProcessedImage(originalFile, processedBlob, ultraHD);
  return URL.createObjectURL(hdBlob);
}
