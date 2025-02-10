require("dotenv").config(); //.env 파일 로드

// npm install axios form-data xml2js axios-cookiejar-support tough-cookie uuid sharp @google/generative-ai puppeteer canvas
const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const fsPromises = fs.promises;
const path = require("path");
const FormData = require("form-data");
const xml2js = require("xml2js");
const { v4: uuidv4 } = require("uuid");

const WORDPRESS_SITE_URL = process.env.WORDPRESS_SITE_URL; // 워드프레스 사이트 주소
const WORDPRESS_USERNAME = process.env.WORDPRESS_USERNAME; // 워드프레스 사용자 이름
const WORDPRESS_PASSWORD = process.env.WORDPRESS_PASSWORD; // 워드프레스 비밀번호 또는 Application Password
const WORDPRESS_CATEGORY_ID = process.env.WORDPRESS_CATEGORY_ID; // 워드프레스 카테고리 ID
const WORDPRESS_POST_STATUS = process.env.WORDPRESS_POST_STATUS || "publish"; // 포스트 상태 (publish, draft 등), 기본값: publish

const RESULT_FILE = path.join(__dirname, "result.json");
const MAKE_IMG_DIR = path.join(__dirname, "make_img");

const resultData = JSON.parse(fs.readFileSync(RESULT_FILE, "utf8"));

// 키워드 추출 및 분리
const keywordItem = Object.values(resultData).find((item) => item.keyword);
const keyword = keywordItem ? keywordItem.keyword : "";
const [location, foodName] = keyword.split(" ");

// 유효한 keyword를 가진 항목 수 계산
const restaurantCount = Object.values(resultData).filter(
  (item) => item.keyword
).length;

// 제목 템플릿 10개 생성
const titleTemplates = [
  // 한국 여행자들을 위한 음식 탐방 가이드
  `${location} Foodie Guide: ${restaurantCount} Must-Try ${foodName} Spots in Korea`,
  `Explore ${location}: ${restaurantCount} Top ${foodName} Restaurants to Try in Korea`,
  `Korea's Hidden Gems: ${restaurantCount} Unmissable ${foodName} Eateries in ${location}`,
  `Your Ultimate ${location} ${foodName} Tour: ${restaurantCount} Must-Visit Restaurants in Korea`,
  `Taste Korea: Discover ${restaurantCount} Essential ${foodName} Spots in ${location}`,
  `Don't Miss Out: ${restaurantCount} Amazing ${foodName} Restaurants in ${location}, Korea`,
  `Insider's Pick: ${restaurantCount} Best ${foodName} Places in ${location} for Korean Food Lovers`,
  `The ${restaurantCount} Best ${foodName} Restaurants in ${location} You Must Experience in Korea`,
  `A Food Lover's Journey: ${restaurantCount} Unforgettable ${foodName} Spots in ${location}, Korea`,
  `Discover ${location}: ${restaurantCount} Top ${foodName} Eateries for an Authentic Korean Experience`,
  `Korea Calling: ${restaurantCount} ${foodName} Restaurants in ${location} to Savor Right Now`,
  `${location} on a Plate: ${restaurantCount} Delicious ${foodName} Spots for Your Korean Adventure`,
  `Ultimate ${location} ${foodName} Guide: ${restaurantCount} Places You Can't Miss in Korea`,
  `Experience ${location}: ${restaurantCount} Must-See ${foodName} Restaurants for a True Taste of Korea`,
  `Foodie Favorites: ${restaurantCount} Top ${foodName} Spots in ${location} for Your Korean Trip`,
];

// 랜덤으로 제목 선택
const title = titleTemplates[Math.floor(Math.random() * titleTemplates.length)];

console.log(title); // 생성된 제목을 출력

// 워드프레스 HTML 콘텐츠 생성 함수
async function createWordPressContent(uploadedImages, title, content) {
  let postContent = `<h1>${title}</h1>\n`; // 제목 (h1 태그 사용)

  // hello_content 처리 (예시, 필요에 따라 구조 변경)
  const helloContentItem = content.find(
    (item) => item.type === "hello_content"
  );
  if (helloContentItem && helloContentItem.content) {
    postContent += `<p><b>${helloContentItem.content}</b></p>\n`; // 굵게 표시
  }

  let imageIndex = 0;
  content.forEach((item, index) => {
    if (item.keyword) {
      postContent += `<h2>${index + 1}. ${item.name}</h2>\n`; // 맛집 이름 (h2 태그)
      if (imageIndex < uploadedImages.length) {
        postContent += `<img src="${uploadedImages[imageIndex].url}" alt="${item.name}" style="max-width: 600px;">\n`; // 이미지 삽입, 최대 너비 설정
        imageIndex++;
      }
      postContent += `<p><b>${item.here}</b></p>\n`; // 위치 정보 굵게
      postContent += `<p>${item.introduction}</p>\n`; // 소개글
      postContent += `<hr>\n`; // 구분선 (hr 태그)
    }
  });

  // content 내용 처리 (예시, 필요에 따라 구조 변경)
  const contentItem = content.find((item) => item.type === "content");
  if (contentItem && contentItem.content) {
    postContent += `<p style="font-family: 'nanumdasisijaghae'; font-size: 19px;">${contentItem.content}</p>\n`; // 스타일 적용
  }

  return postContent; // HTML 문자열 반환
}

// 워드프레스 이미지 업로드 함수
async function uploadWordPressMedia(imagePath) {
  const formData = new FormData();
  formData.append("file", fs.createReadStream(imagePath), {
    filename: path.basename(imagePath),
  });

  const config = {
    method: "post",
    url: `${WORDPRESS_SITE_URL}/wp-json/wp/v2/media`,
    headers: {
      ...formData.getHeaders(),
      // Content-Disposition 헤더 값 수정 (filename* 방식으로 변경)
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(
        path.basename(imagePath)
      )}`,
      Authorization: `Basic ${Buffer.from(
        `${WORDPRESS_USERNAME}:${WORDPRESS_PASSWORD}`
      ).toString("base64")}`,
    },
    data: formData,
  };

  try {
    const response = await axios(config);
    return response.data; // 워드프레스 미디어 객체 반환 (URL 정보 포함)
  } catch (error) {
    console.error("워드프레스 이미지 업로드 오류:", error);
    if (error.response) {
      console.error("응답 상태:", error.response.status);
      console.error("응답 데이터:", error.response.data);
    }
    throw error;
  }
}

// 워드프레스 포스트 작성 함수
async function createWordPressPost(title, contentHTML, uploadedMediaIds) {
  // uploadedMediaIds: 업로드된 미디어 ID 배열
  const postData = {
    title: title,
    content: contentHTML,
    categories: [WORDPRESS_CATEGORY_ID], // 카테고리 설정
    status: WORDPRESS_POST_STATUS, // 포스트 상태 설정 (publish, draft 등)
    featured_media:
      uploadedMediaIds.length > 0 ? uploadedMediaIds[0].id : undefined, // 대표 이미지 설정 (첫 번째 이미지), 이미지가 있을 경우에만 설정
  };

  const config = {
    method: "post",
    url: `${WORDPRESS_SITE_URL}/wp-json/wp/v2/posts`,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${Buffer.from(
        `${WORDPRESS_USERNAME}:${WORDPRESS_PASSWORD}`
      ).toString("base64")}`, // Basic Authentication 예시
    },
    data: postData,
  };

  try {
    const response = await axios(config);
    return response.data; // 워드프레스 포스트 객체 반환
  } catch (error) {
    console.error("워드프레스 포스트 작성 오류:", error);
    if (error.response) {
      console.error("응답 상태:", error.response.status);
      console.error("응답 데이터:", error.response.data);
    }
    throw error;
  }
}

// 게시글을 모두 올리고 이미지 폴더 내용 삭제 함수 (유지)
async function deleteImagesInMakeImgDir() {
  try {
    const files = await fsPromises.readdir(MAKE_IMG_DIR);
    for (const file of files) {
      const filePath = path.join(MAKE_IMG_DIR, file);
      await fsPromises.unlink(filePath);
      console.log(`Deleted file: ${filePath}`);
    }
    console.log("All files in make_img directory have been deleted.");
  } catch (error) {
    console.error("Error deleting files:", error);
  }
}

async function main() {
  let retryCount = 0;
  const maxRetries = 1;

  while (retryCount < maxRetries) {
    try {
      // make_img 폴더 경로 로그 추가
      console.log("make_img 폴더 경로:", MAKE_IMG_DIR);

      // make_img 폴더 내용 확인 및 로그 추가
      try {
        const filesInMakeImgDir = fs.readdirSync(MAKE_IMG_DIR);
        console.log("make_img 폴더 내용:", filesInMakeImgDir); // 폴더 내용 로그
      } catch (readDirError) {
        console.error("make_img 폴더 읽기 오류:", readDirError);
        throw readDirError; // 폴더 읽기 오류 발생 시, 즉시 에러 처리
      }

      // 이미지 파일 목록 확인 및 필터링 (기존 코드 유지)
      const imageFiles = fs
        .readdirSync(MAKE_IMG_DIR)
        .filter((file) => /\.(jpg|jpeg|png|gif|webp)$/i.test(file))
        .map((file) => {
          const fullPath = path.join(MAKE_IMG_DIR, file);
          console.log(`Processing file: ${fullPath}`);
          return fullPath;
        });

      // 필터링된 이미지 파일 목록 로그 추가
      console.log("Processed image files:", imageFiles);

      // make_img 폴더의 이미지 업로드 (워드프레스 이미지 업로드 함수 사용)
      const uploadedImages = await Promise.all(
        imageFiles.map(async (imagePath) => {
          try {
            const result = await uploadWordPressMedia(imagePath); // 워드프레스 이미지 업로드 함수 호출
            return result;
          } catch (error) {
            console.error(`워드프레스 이미지 업로드 실패: ${imagePath}`, error);
            return null; // 업로드 실패 시 null 반환
          }
        })
      ).then((images) => images.filter((img) => img !== null)); // null 값 필터링

      console.log("업로드된 이미지:", uploadedImages);

      // HTML 콘텐츠 생성 (워드프레스 HTML 콘텐츠 생성 함수 사용)
      const contentHTML = await createWordPressContent(
        uploadedImages,
        title,
        resultData
      );

      // 워드프레스 포스트 작성 (워드프레스 포스트 작성 함수 사용)
      const publishResult = await createWordPressPost(
        title,
        contentHTML,
        uploadedImages
      ); // uploadedImages는 필요에 따라 미디어 ID 배열로 가공하여 전달

      if (publishResult && publishResult.id) {
        // 워드프레스는 포스트 ID를 반환
        console.log(
          "워드프레스 포스트 발행 성공. 포스트 ID:",
          publishResult.id
        );
        console.log("워드프레스 포스트 URL:", publishResult.link); // 워드프레스는 포스트 URL을 link 필드에 반환

        // 이미지 업로드 후 make_img 폴더 내 파일 삭제 (**삭제**: 이 부분 제거)
        // await deleteImagesInMakeImgDir();
      } else {
        console.error("워드프레스 포스트 발행 실패");
        console.error(publishResult);
        throw new Error("워드프레스 포스트 발행 실패");
      }

      break; // 성공적으로 실행되면 루프 종료
    } catch (error) {
      console.error("오류 발생:", error);
      if (error.response) {
        console.error("응답 상태:", error.response.status);
        console.error("응답 데이터:", error.response.data);
      }

      if (
        error.message.includes("ENOENT: no such file or directory")
        // ... (워드프레스 관련 오류 외 다른 오류 조건 필요시 추가) ...
      ) {
        console.log("파일을 찾을 수 없습니다. 파일 경로를 확인해주세요.");
        retryCount++;

        if (retryCount < maxRetries) {
          console.log(`재시도 중... (시도 ${retryCount + 1}/${maxRetries})`);
        } else {
          console.error("최대 재시도 횟수에 도달했습니다. 종료합니다.");
          break;
        }
      } else {
        console.error("처리되지 않은 오류입니다.");
        retryCount++;

        if (retryCount < maxRetries) {
          console.log(`재시도 중... (시도 ${retryCount + 1}/${maxRetries})`);
        } else {
          console.error("최대 재시도 횟수에 도달했습니다. 종료합니다.");
          break;
        }
      }
    }
  }
}

// main 함수 호출
main().catch((error) => {
  console.error("Unhandled error in main:", error);
  process.exit(1);
});
