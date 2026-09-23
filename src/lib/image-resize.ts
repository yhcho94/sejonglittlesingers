// 브라우저에서 사진 줄이기 (JPEG 로 다시 저장하므로 위치정보 등 EXIF 도 함께 제거됨)
// 휴대폰 사진의 회전 정보는 반영해서 바로 세운 뒤 저장합니다.
export async function resizeImage(source: Blob | ImageBitmap, maxSide: number, quality = 0.85) {
  const bitmap = source instanceof Blob ? await createImageBitmap(source, { imageOrientation: "from-image" }) : source;
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bitmap, 0, 0, width, height);
  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("변환 실패"))), "image/jpeg", quality),
  );
  return { blob, width, height };
}
