export interface CompressImageOptions {
  maxPx?: number
  quality?: number
}

function stripDataUrlPrefix(dataUrl: string): string {
  const commaIndex = dataUrl.indexOf(',')
  return commaIndex >= 0 ? dataUrl.slice(commaIndex + 1) : dataUrl
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result ?? ''))
    reader.onerror = () => reject(reader.error ?? new Error('Could not read image file'))
    reader.readAsDataURL(file)
  })
}

function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('Could not decode image for compression'))
    image.src = dataUrl
  })
}

/**
 * Resize an uploaded image in-browser and return plain JPEG base64.
 * The returned string intentionally has no data URL prefix so it can be
 * dropped straight into API payloads / vision image_url fields.
 */
export async function compressImageToBase64(
  file: File,
  maxPx = 1024,
  quality = 0.82,
): Promise<string> {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    throw new Error('Image compression is only available in the browser')
  }

  const sourceDataUrl = await readFileAsDataUrl(file)
  const image = await loadImage(sourceDataUrl)

  const sourceWidth = image.naturalWidth || image.width
  const sourceHeight = image.naturalHeight || image.height

  if (!sourceWidth || !sourceHeight) {
    return stripDataUrlPrefix(sourceDataUrl)
  }

  const longestSide = Math.max(sourceWidth, sourceHeight)
  const scale = longestSide > maxPx ? maxPx / longestSide : 1
  const targetWidth = Math.max(1, Math.round(sourceWidth * scale))
  const targetHeight = Math.max(1, Math.round(sourceHeight * scale))

  const canvas = document.createElement('canvas')
  canvas.width = targetWidth
  canvas.height = targetHeight

  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('Could not create image compression canvas')
  }

  ctx.drawImage(image, 0, 0, targetWidth, targetHeight)
  return stripDataUrlPrefix(canvas.toDataURL('image/jpeg', quality))
}

export async function compressImageToDataUrl(
  file: File,
  maxPx = 1024,
  quality = 0.82,
): Promise<string> {
  const base64 = await compressImageToBase64(file, maxPx, quality)
  return `data:image/jpeg;base64,${base64}`
}
