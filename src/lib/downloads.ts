export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  // Let the browser consume the URL before releasing it.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function downloadCanvasPNG(canvas: HTMLCanvasElement, filename: string): Promise<void> {
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(value => value ? resolve(value) : reject(new Error("Unable to encode PNG")), "image/png");
  });
  downloadBlob(blob, filename);
}
