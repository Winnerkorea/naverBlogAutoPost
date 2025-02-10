const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

// result.json 파일 읽기
const data = JSON.parse(fs.readFileSync("result.json", "utf8"));

// 출력 폴더 생성
const outputDir = "make_img";
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

/**
 * Puppeteer를 이용하여 HTML을 생성하고 캡처하는 함수
 * @param {string} backgroundUrl - 배경 이미지 URL
 * @param {string} name - 텍스트 오버레이에 표시할 내용
 * @param {string|number} rank - 파일 이름에 사용할 순번
 */
async function captureImage(backgroundUrl, name, rank) {
  const finalWidth = 1280; // 해상도를 높인 예시 (1280x960)
  const finalHeight = 960;
  const margin = 20;
  const fontSize = Math.round(Math.min(finalWidth, finalHeight) * 0.05);

  // HTML 문서 생성
  const htmlContent = `
  <html>
    <head>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Nanum+Pen+Script&display=swap');
        html, body {
          margin: 0;
          padding: 0;
          width: ${finalWidth}px;
          height: ${finalHeight}px;
        }
        body {
          background: url('${backgroundUrl}') no-repeat center center;
          background-size: cover;
          position: relative;
          /* 화이트 밸런스(밝기, 대비, 채도) 조정 – 필요에 따라 값 수정 */
          filter: brightness(1.05) contrast(1.05) saturate(1.1);
        }
        .overlay {
          position: absolute;
          bottom: ${margin}px;
          right: ${margin}px;
          font-family: 'Nanum Pen Script', serif;
          font-size: ${fontSize}px;
          letter-spacing: -0.05rem;
          color: #3F4F44;
        }
      </style>
    </head>
    <body>
      <div class="overlay">${name}</div>
    </body>
  </html>
  `;

  // Puppeteer를 사용하여 HTML을 로드 후 스크린샷 캡처
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  // 높은 해상도를 위해 deviceScaleFactor를 사용합니다.
  await page.setViewport({
    width: finalWidth,
    height: finalHeight,
    deviceScaleFactor: 2,
  });
  await page.setContent(htmlContent, { waitUntil: "networkidle0" });

  // 폰트와 배경 이미지가 완전히 로드되도록 잠시 대기 (1초)
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const screenshotBuffer = await page.screenshot({
    type: "png",
    omitBackground: false,
  });
  await browser.close();

  // Sharp를 사용하여 PNG 스크린샷을 WebP로 변환 후 저장
  const outputFilename = path.join(outputDir, `${rank}.${name}.webp`);
  await sharp(screenshotBuffer)
    .resize(finalWidth, finalHeight, { fit: "fill" })
    .webp()
    .toFile(outputFilename);

  console.log(`${outputFilename} 저장 완료`);
}

/**
 * 메인 실행 함수: 각 항목에 대해 이미지 캡처를 실행
 */
async function main() {
  for (const item of data) {
    const rank = item.rank;
    const name = item.name;
    const backgroundUrl = item.imageUrl; // result.json의 이미지 URL
    try {
      await captureImage(backgroundUrl, name, rank);
    } catch (err) {
      console.error(`${rank}.${name}.webp 저장 실패:`, err);
    }
  }
}

main().catch(console.error);
