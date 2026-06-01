// 이미지 업로드 — 클라이언트가 자동 리사이즈/JPEG 변환 후 base64로 서버에 전송.
// 서버는 ImageKit SDK로 업로드, 영구 CDN URL을 반환.
//
// 리사이즈 정책 (Vercel Functions 4.5MB body 한도 회피용):
//  - longest side > MAX_DIM(2048px) → 비율 유지하며 축소
//  - 작은 이미지는 그대로 (불필요한 재인코딩 회피)
//  - GIF는 첫 프레임 손실 위험 있어 리사이즈 스킵
//  - JPEG quality 0.85 (인스타 4:5 카드뉴스 화질 충분)
//  - 출력은 항상 JPEG (HEIC/PNG도 → JPEG 변환). PNG 투명 필요 케이스는 별도 처리 가능
//
// 결과: 5~10MB → 200KB~1MB로 줄어들어 4.5MB 한도 안에 들어옴.
// 별도 npm 패키지 없이 브라우저 기본 API(createImageBitmap / canvas / toBlob)만 사용.

const MAX_DIM = 2048;
const JPEG_QUALITY = 0.85;
// 안전 마진: 이 임계 이하면 리사이즈 시도 안 함 (이미 충분히 작음)
const SKIP_RESIZE_BYTES = 1.5 * 1024 * 1024; // 1.5MB

function fileToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error || new Error('file read failed'));
    reader.readAsDataURL(blob);
  });
}

function isGif(file) {
  return file.type === 'image/gif' || /\.gif$/i.test(file.name || '');
}

// 캔버스로 리사이즈 + JPEG 인코딩. 실패 시 원본 그대로 반환.
async function resizeImageBlob(file) {
  try {
    // 작은 파일 + 이미 JPEG면 그대로 (재인코딩 손실 방지)
    if (file.size <= SKIP_RESIZE_BYTES && (file.type === 'image/jpeg' || file.type === 'image/jpg')) {
      return { blob: file, resized: false };
    }
    // GIF는 리사이즈 스킵 (애니메이션 손실)
    if (isGif(file)) return { blob: file, resized: false };

    // createImageBitmap이 대부분 포맷 디코딩 (HEIC는 브라우저 지원 시)
    let bitmap;
    try {
      bitmap = await createImageBitmap(file);
    } catch {
      // 폴백: <img>로 디코딩
      bitmap = await loadViaImg(file);
    }
    const { width, height } = bitmap;
    const longest = Math.max(width, height);

    // 이미 충분히 작고 JPEG면 그대로
    if (longest <= MAX_DIM && file.size <= SKIP_RESIZE_BYTES && (file.type === 'image/jpeg' || file.type === 'image/jpg')) {
      if (bitmap.close) bitmap.close();
      return { blob: file, resized: false };
    }

    const scale = longest > MAX_DIM ? MAX_DIM / longest : 1;
    const targetW = Math.round(width * scale);
    const targetH = Math.round(height * scale);

    const canvas = document.createElement('canvas');
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext('2d');
    // 부드러운 다운샘플
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(bitmap, 0, 0, targetW, targetH);
    if (bitmap.close) bitmap.close();

    const blob = await new Promise((resolve) =>
      canvas.toBlob((b) => resolve(b), 'image/jpeg', JPEG_QUALITY)
    );
    if (!blob) return { blob: file, resized: false };

    // 리사이즈 결과가 원본보다 크면(드물지만 작은 PNG 인코딩 차이) 원본 사용
    if (blob.size >= file.size && longest <= MAX_DIM) {
      return { blob: file, resized: false };
    }
    return { blob, resized: true, originalSize: file.size, newSize: blob.size };
  } catch (err) {
    console.warn('[uploadImage] resize failed, falling back to original', err);
    return { blob: file, resized: false };
  }
}

function loadViaImg(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('image decode failed'));
    };
    img.src = url;
  });
}

/**
 * 파일을 자동 리사이즈 후 서버(=ImageKit) 경유로 업로드, 영구 CDN URL 반환.
 * @param {File|Blob} file - input[type=file]의 File 객체
 * @param {object} [opts]
 * @param {string} [opts.folder='cardnews']
 * @param {string} [opts.fileName]
 * @returns {Promise<string>}
 */
export async function uploadImage(file, opts = {}) {
  if (!file) throw new Error('파일이 비어있어요');

  const { blob: prepared, resized, originalSize, newSize } = await resizeImageBlob(file);
  if (resized) {
    console.info(
      `[uploadImage] resized: ${(originalSize / 1024 / 1024).toFixed(2)}MB → ${(newSize / 1024 / 1024).toFixed(2)}MB`
    );
  }

  // 리사이즈된 경우 파일명 확장자도 JPEG로 보정
  let fileName = opts.fileName || file.name || `upload-${Date.now()}.jpg`;
  if (resized) {
    fileName = fileName.replace(/\.(png|webp|heic|heif|bmp|tiff?)$/i, '.jpg');
    if (!/\.(jpe?g)$/i.test(fileName)) fileName += '.jpg';
  }

  const base64 = await fileToBase64(prepared);
  const r = await fetch('/api/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      file: base64,
      fileName,
      folder: opts.folder || 'cardnews',
    }),
  });
  if (!r.ok) {
    let msg = `업로드 실패: ${r.status}`;
    if (r.status === 413) {
      msg = '이미지가 너무 커서 업로드에 실패했어요. 더 작은 사이즈로 시도해보세요.';
    } else {
      try {
        const j = await r.json();
        if (j?.error) msg = j.error;
      } catch {}
    }
    throw new Error(msg);
  }
  const data = await r.json();
  return data.url;
}
