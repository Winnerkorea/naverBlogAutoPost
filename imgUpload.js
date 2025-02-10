require("dotenv").config(); // .env 파일 로드

const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");

// 환경변수에서 설정값 로드
const siteUrl = process.env.WORDPRESS_SITE_URL;
const username = process.env.WORDPRESS_USERNAME;
const password = process.env.WORDPRESS_PASSWORD;
const categoryId = process.env.WORDPRESS_CATEGORY_ID; // 포스트 생성 시 활용 가능
const postStatus = process.env.WORDPRESS_POST_STATUS; // 포스트 상태

// 기본 인증(Basic Authentication) 토큰 생성
const authToken = Buffer.from(`${username}:${password}`).toString("base64");

// 이미지들이 위치한 폴더 경로
const imagesFolder = path.join(__dirname, "make_img");

// 업로드 진행 상태 변수
let totalFiles = 0;
let successCount = 0;
let failureCount = 0;

// 업로드 결과를 저장할 배열
const uploadResults = [];

// 허용할 이미지 확장자 목록 (대소문자 구분없이 비교)
const allowedExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp"];

// 단일 이미지 업로드 함수 (로그 포함)
async function uploadImage(imageFilePath, fileName) {
  console.log(`\n[START] ${fileName} 업로드 시작...`);
  const form = new FormData();
  form.append("file", fs.createReadStream(imageFilePath), fileName);

  try {
    const response = await axios.post(`${siteUrl}/wp-json/wp/v2/media`, form, {
      headers: {
        Authorization: `Basic ${authToken}`,
        ...form.getHeaders(),
      },
    });

    const data = response.data;
    console.log(`[SUCCESS] ${fileName} 업로드 완료!`);
    console.log(`         이미지 URL: ${data.source_url}`);
    successCount++;
    return data.source_url;
  } catch (error) {
    const errMsg = error.response ? error.response.data : error.message;
    console.error(`[ERROR] ${fileName} 업로드 실패:`, errMsg);
    failureCount++;
    return null;
  }
}

// 폴더 내 모든 이미지 업로드 및 결과 JSON 파일 생성 함수
async function uploadImagesFromFolder() {
  fs.readdir(imagesFolder, async (err, files) => {
    if (err) {
      return console.error("폴더 읽기 에러:", err);
    }

    // 폴더 내 파일 목록에서 허용된 이미지 확장자를 가진 파일만 필터링
    const imageFiles = files.filter((file) => {
      const ext = path.extname(file).toLowerCase();
      return allowedExtensions.includes(ext);
    });

    totalFiles = imageFiles.length;

    if (totalFiles === 0) {
      console.log(
        "이미지 파일이 존재하지 않습니다. (확인 가능한 확장자: " +
          allowedExtensions.join(", ") +
          ")"
      );
      return;
    }

    console.log(`총 ${totalFiles}개의 이미지 파일을 발견하였습니다.`);

    // 각 이미지 파일을 순차적으로 업로드
    for (const file of imageFiles) {
      const imagePath = path.join(imagesFolder, file);

      // 파일이 실제 존재하는지 확인
      if (!fs.existsSync(imagePath)) {
        console.warn(`[WARN] ${file} 파일이 존재하지 않습니다.`);
        continue;
      }

      const url = await uploadImage(imagePath, file);
      // 업로드 결과 배열에 추가 (실패한 경우 url은 null)
      uploadResults.push({
        fileName: file,
        url: url,
      });
    }

    // 전체 진행 상황 로그 출력
    console.log(`\n=== 업로드 완료 ===`);
    console.log(`총 파일 수: ${totalFiles}`);
    console.log(`성공한 파일 수: ${successCount}`);
    console.log(`실패한 파일 수: ${failureCount}`);

    // 결과를 JSON 파일로 저장
    const resultFilePath = path.join(__dirname, "upload_results.json");
    fs.writeFile(
      resultFilePath,
      JSON.stringify(uploadResults, null, 2),
      (err) => {
        if (err) {
          console.error("결과 JSON 파일 저장 실패:", err);
        } else {
          console.log(`\n결과 JSON 파일이 저장되었습니다: ${resultFilePath}`);
        }
      }
    );
  });
}

// 실행
uploadImagesFromFolder();
