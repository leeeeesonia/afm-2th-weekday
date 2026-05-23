// 이미지 업로드 — 클라이언트가 base64로 인코딩해서 서버로 보냄.
// 서버가 ImageKit SDK로 업로드 후 영구 CDN URL을 반환.
//
// data URL 방식과 비교:
//  - localStorage에는 짧은 https URL만 저장됨 (~70~120 bytes)
//  - 이미지 본체는 ImageKit CDN에 영구 보관
//  - 다른 기기/브라우저에서도 같은 이미지 URL로 즉시 표시

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result); // "data:...;base64,XXX"
    reader.onerror = () => reject(reader.error || new Error('file read failed'));
    reader.readAsDataURL(file);
  });
}

/**
 * 파일을 서버(=ImageKit) 경유로 업로드하고 영구 CDN URL을 반환.
 * @param {File|Blob} file - input[type=file]의 File 객체
 * @param {object} [opts]
 * @param {string} [opts.folder='cardnews'] - ImageKit 폴더 경로
 * @param {string} [opts.fileName] - 저장 파일명 (생략 시 file.name 또는 자동 생성)
 * @returns {Promise<string>} 업로드된 이미지의 public URL
 */
export async function uploadImage(file, opts = {}) {
  if (!file) throw new Error('파일이 비어있어요');
  const base64 = await fileToBase64(file);
  const r = await fetch('/api/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      file: base64,
      fileName: opts.fileName || file.name || `upload-${Date.now()}.png`,
      folder: opts.folder || 'cardnews',
    }),
  });
  if (!r.ok) {
    let msg = `업로드 실패: ${r.status}`;
    try {
      const j = await r.json();
      if (j?.error) msg = j.error;
    } catch {}
    throw new Error(msg);
  }
  const data = await r.json();
  return data.url; // https://ik.imagekit.io/.../...
}
