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

// 랜덤 색상 생성 함수
function getRandomColor() {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

// 이미지 다운로드 및 저장 함수
async function downloadAndSaveImage(url, filename, name) {
  try {
    const response = await axios.get(url, { responseType: "arraybuffer" });

    // 이미지 처리
    const image = sharp(response.data);
    const metadata = await image.metadata();

    // 새 이미지 크기 계산 (최대 800x800)
    const maxSize = 800;
    const resizeOptions =
      metadata.width > metadata.height
        ? { width: maxSize }
        : { height: maxSize };

    // 이미지 리사이즈
    const resizedImage = await image.resize(resizeOptions).toBuffer();
    const resizedMetadata = await sharp(resizedImage).metadata();

    // 액자 효과를 위한 패딩 계산
    const padding = Math.round(
      Math.min(resizedMetadata.width, resizedMetadata.height) * 0.05
    );

    // 새 캔버스 크기 계산
    const newWidth = resizedMetadata.width + padding * 2;
    const newHeight = resizedMetadata.height + padding * 2;

    // 랜덤 색상 생성
    const color1 = getRandomColor();
    const color2 = getRandomColor();

    // 배경을 위한 SVG 생성
    const svgBackground = `
      <svg width="${newWidth}" height="${newHeight}">
        <defs>
          <linearGradient id="frameGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="${color1}" />
            <stop offset="100%" stop-color="${color2}" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#frameGradient)" />
      </svg>
    `;

    // 텍스트 오버레이를 위한 SVG 생성
    const fontSize = Math.round(
      Math.min(resizedMetadata.width, resizedMetadata.height) * 0.05
    );
    const boxWidth = Math.round(resizedMetadata.width * 0.8);
    const boxHeight = Math.round(fontSize * 2);
    const svgOverlay = `
      <svg width="${newWidth}" height="${newHeight}">
        <rect x="${(newWidth - boxWidth) / 2}" y="${
      (newHeight - boxHeight) / 2
    }" width="${boxWidth}" height="${boxHeight}" fill="rgba(0,0,0,0.7)" rx="5" ry="5" />
        <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${fontSize}" fill="white" text-anchor="middle" dominant-baseline="middle">${name}</text>
      </svg>
    `;

    await sharp(resizedImage)
      .extend({
        top: padding,
        bottom: padding,
        left: padding,
        right: padding,
        background: { r: 255, g: 255, b: 255, alpha: 0 },
      })
      .composite([
        { input: Buffer.from(svgBackground), blend: "dest-over" },
        { input: Buffer.from(svgOverlay), blend: "over" },
      ])
      .webp()
      .toFile(path.join(outputDir, filename));

    console.log(`${filename} 저장 완료`);
  } catch (error) {
    console.error(`${filename} 저장 실패:`, error.message);
  }
}

// 각 항목에 대해 이미지 다운로드 및 저장
data.forEach((item) => {
  const rankNumber = item.rank;
  const filename = `${rankNumber}.${item.name}.webp`;
  downloadAndSaveImage(item.imageUrl, filename, item.name);
});
