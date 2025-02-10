const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const axios = require("axios");

// JSON 데이터 읽기
const data = JSON.parse(fs.readFileSync("result.json", "utf8"));

// make_img 폴더 생성
const outputDir = "make_img";
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

/**
 * 이미지 다운로드 및 저장 함수
 * @param {string} url - 이미지 URL
 * @param {string} filename - 저장할 파일 이름
 * @param {string} name - 텍스트 오버레이에 표시할 이름
 */
async function downloadAndSaveImage(url, filename, name) {
  try {
    // 이미지 다운로드 (바이너리 형식)
    const response = await axios.get(url, { responseType: "arraybuffer" });
    const image = sharp(response.data);
    const metadata = await image.metadata();

    // 원본 이미지의 비율에 따라 리사이즈 (최대 800픽셀 기준)
    const maxSize = 800;
    const resizeOptions =
      metadata.width > metadata.height
        ? { width: maxSize }
        : { height: maxSize };
    const resizedImage = await image.resize(resizeOptions).toBuffer();

    // 최종 출력 크기 (640×480)로 기본 이미지를 리사이즈
    const finalWidth = 640;
    const finalHeight = 480;
    const baseImageBuffer = await sharp(resizedImage)
      .resize(finalWidth, finalHeight, { fit: "fill" })
      .toBuffer();

    // 최종 이미지 크기 고정
    const newWidth = finalWidth;
    const newHeight = finalHeight;
    const margin = 10; // 오른쪽 하단 여백 (픽셀)
    const fontSize = Math.round(Math.min(newWidth, newHeight) * 0.05);

    // 외부 폰트 적용 제거 – 기본 폰트 사용, letter-spacing은 인라인 스타일로 적용
    const svgOverlay = `
      <svg width="${newWidth}" height="${newHeight}" xmlns="http://www.w3.org/2000/svg">
        <text 
          x="${newWidth - margin}" 
          y="${newHeight - margin}" 
          font-size="${fontSize}" 
          fill="white" 
          text-anchor="end" 
          dominant-baseline="text-bottom"
          style="letter-spacing: -0.05rem;">
          ${name}
        </text>
      </svg>
    `;

    // 텍스트 오버레이를 합성한 후 최종 이미지를 저장 (WebP 포맷)
    await sharp(baseImageBuffer)
      .composite([{ input: Buffer.from(svgOverlay), blend: "over" }])
      .webp()
      .toFile(path.join(outputDir, filename));

    console.log(`${filename} 저장 완료`);
  } catch (error) {
    console.error(`${filename} 저장 실패:`, error.message);
  }
}

/**
 * 메인 실행 함수: JSON의 각 항목에 대해 이미지 다운로드 및 저장 실행
 */
async function main() {
  for (const item of data) {
    const rankNumber = item.rank;
    const filename = `${rankNumber}.${item.name}.webp`;
    await downloadAndSaveImage(item.imageUrl, filename, item.name);
  }
}

main();
