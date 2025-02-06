require("dotenv").config(); //.env 파일 로드

// npm install axios form-data xml2js axios-cookiejar-support tough-cookie uuid sharp @google/generative-ai puppeteer canvas
const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const fsPromises = fs.promises;
const path = require("path");
const FormData = require("form-data");
const xml2js = require("xml2js");
const { wrapper } = require("axios-cookiejar-support");
const { CookieJar } = require("tough-cookie");
const { v4: uuidv4 } = require("uuid");

const USER_ID = process.env.NAVER_USER_ID; // 네이버 아이디 (더 이상 사용하지 않음)
const USER_PASSWORD = process.env.NAVER_USER_PASSWORD; // 네이버 비밀번호 (더 이상 사용하지 않음)
const BLOG_ID = process.env.NAVER_BLOG_ID; // 블로그 이름 (더 이상 사용하지 않음)
const CATEGORY_ID = process.env.NAVER_CATEGORY_ID; // 포스팅할 카테고리 번호 (더 이상 사용하지 않음)
const OPEN_TYPE = process.env.NAVER_OPEN_TYPE; // 0: 비공개, 2: 공개 (더 이상 사용하지 않음)

const RESULT_FILE = path.join(__dirname, "result.json");
const MAKE_IMG_DIR = path.join(__dirname, "make_img");
const OUTPUT_TXT_FILE = path.join(__dirname, "output.txt"); // 생성될 텍스트 파일 경로

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

// 본문 내용 생성 (HTML -> 텍스트)
let content = "";
Object.values(resultData).forEach((restaurant, index) => {
  content += `${index + 1}. ${restaurant.name}\n`; // 맛집 번호 및 이름
  content += `${restaurant.here}\n`; // 위치 정보
  content += `[Image: ${restaurant.name}]\n`; // 이미지 표시 (실제 이미지 파일은 저장하지 않음)
  content += `${restaurant.introduction}\n\n`; // 소개글
});

// selectedItem 설정 (더 이상 HTML 콘텐츠를 사용하지 않으므로 텍스트 콘텐츠로 변경)
const selectedItem = {
  textContent: content, // 텍스트 콘텐츠 저장
  naver_content: resultData,
};

// 이모티콘 리스트 (더 이상 사용하지 않음)
const emoticonUrls = [
  {
    packCode: "cafe_001",
    seq: 2,
    src: "https://storep-phinf.pstatic.net/cafe_001/original_2.gif",
  },
  // ... (이모티콘 리스트는 제거하거나 주석 처리) ...
];

function extractTitle(content) {
  const match = content.match(/<h1[^>]*>(.*?)<\/h1>/i);
  return match ? removeHtmlTags(match[1]) : "";
}

function removeHtmlTags(html) {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const SESSION_FILE = path.join(__dirname, `${USER_ID}_session.json`);
const BASE_URL = "https://blog.naver.com";
const BLOG_FILES_URL = "https://blogfiles.pstatic.net";

// 로그인 함수 (더 이상 사용하지 않음)
async function naver_login(accountList) {
  // ... (naver_login 함수 내용은 제거하거나 주석 처리) ...
}

async function checkAndRunLoginScript() {
  // ... (checkAndRunLoginScript 함수 내용은 제거하거나 주석 처리) ...
}

async function performLogin() {
  // ... (performLogin 함수 내용은 제거하거나 주석 처리) ...
}

//user agent 세팅 (더 이상 사용하지 않음)
const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
];

function getRandomUserAgent() {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

const jar = new CookieJar();
const client = wrapper(
  axios.create({ jar, headers: { "User-Agent": getRandomUserAgent() } })
);

function parseXML(xml) {
  return new Promise((resolve, reject) => {
    xml2js.parseString(xml, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
}

// 발행 전 토큰 받아오기 (더 이상 사용하지 않음)
async function getToken() {
  // ... (getToken 함수 내용은 제거하거나 주석 처리) ...
}

// 이미지 세션 (더 이상 사용하지 않음)
async function getSessionKey(token) {
  // ... (getSessionKey 함수 내용은 제거하거나 주석 처리) ...
}

// 이미지 업로드 (더 이상 사용하지 않음)
async function uploadImage(sessionKey, imagePath) {
  // ... (uploadImage 함수 내용은 제거하거나 주석 처리) ...
}

function getRandomTime(min, max) {
  // 분 단위를 초 단위로 변환
  const minSeconds = min * 60;
  const maxSeconds = max * 60;
  // 최소값과 최대값 사이의 랜덤한 초 값을 반환
  return Math.floor(Math.random() * (maxSeconds - minSeconds + 1)) + minSeconds;
}

// 랜덤 페이지 체류 시간 (더 이상 사용하지 않음)
function getRandomStayTime() {
  return getRandomTime(100, 150);
}

// 랜덤 타이핑 시간 (더 이상 사용하지 않음)
function getRandomTypingTime() {
  return getRandomTime(70, 90);
}

function processContent(content) {
  const $ = cheerio.load(content);
  let naver_content = {};
  let index = 1;

  $("article.blog-post")
    .children()
    .each((i, element) => {
      if (
        element.name === "h1" ||
        element.name === "h2" ||
        element.name === "div"
      ) {
        if (element.name === "div") {
          $(element)
            .children()
            .each((j, child) => {
              naver_content[index++] = $.html(child).trim();
            });
        } else {
          naver_content[index++] = $.html(element).trim();
        }
      }
    });

  return naver_content;
}

function createImageComponent(image) {
  // ... (createImageComponent 함수 내용은 제거하거나 주석 처리) ...
  return {}; // 빈 객체 반환으로 변경
}

// 워드 프로세서 (.txt) 파일 내용 생성 함수
async function createPlainTextContent(title, content) {
  let plainTextContent = `${title}\n\n`; // 제목 추가

  // hello_content 처리
  const helloContentItem = content.find(
    (item) => item.type === "hello_content"
  );
  if (helloContentItem && helloContentItem.content) {
    plainTextContent += `${helloContentItem.content}\n\n`;
  }

  let index = 0;
  content.forEach((item) => {
    if (item.keyword) {
      index++;
      plainTextContent += `${index}. ${item.name}\n`; // 맛집 번호 및 이름
      plainTextContent += `위치: ${item.here}\n`; // 위치 정보
      plainTextContent += `이미지: [Image of ${item.name}]\n`; // 이미지 placeholder
      plainTextContent += `소개: ${item.introduction}\n\n`; // 소개글
      plainTextContent += "---\n\n"; // 구분선 추가
    }
  });

  // content 내용 처리
  const contentItem = content.find((item) => item.type === "content");
  if (contentItem && contentItem.content) {
    plainTextContent += `${contentItem.content}\n`;
  }

  return plainTextContent;
}

function createPopulationParams(
  uploadedImages,
  autoSaveNo = null,
  logNo = null
) {
  // ... (createPopulationParams 함수 내용은 제거하거나 주석 처리) ...
  return {}; // 빈 객체 반환으로 변경
}

async function autoSave(documentModel, populationParams) {
  // ... (autoSave 함수 내용은 제거하거나 주석 처리) ...
  return {}; // 빈 객체 반환으로 변경
}

async function publishPost(autoSaveNo, documentModel, populationParams) {
  // ... (publishPost 함수 내용은 제거하거나 주석 처리) ...
  return {}; // 빈 객체 반환으로 변경
}

// 게시글을 모두 올리고 이미지 폴더 내용 삭제 함수 (이미지 업로드 및 삭제 로직은 변경되었으므로 수정 필요)
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
      // ... (로그인 및 세션 관련 코드는 모두 제거) ...

      // 이미지 파일 목록 확인 및 필터링 (기존 코드 유지)
      const imageFiles = fs
        .readdirSync(MAKE_IMG_DIR)
        .filter((file) => /\.(jpg|jpeg|png|gif|webp)$/i.test(file))
        .map((file) => {
          const fullPath = path.join(MAKE_IMG_DIR, file);
          console.log(`Processing file: ${fullPath}`);
          return fullPath;
        });

      console.log("Processed image files:", imageFiles);

      // make_img 폴더의 이미지 업로드 (더 이상 업로드하지 않음)
      const uploadedImages = []; // 빈 배열로 변경

      // info.gif 파일 업로드 (더 이상 업로드하지 않음)
      // ... (info.gif 파일 처리 로직 제거) ...

      console.log("업로드된 이미지:", uploadedImages); // 빈 배열 출력

      // 내용 처리 (HTML -> 텍스트 함수는 더 이상 필요 없음. selectedItem.textContent 사용)
      // const naver_content = processContent(selectedItem.resultContent); // 제거

      // 워드 프로세서(.txt) 파일 내용 생성 함수 호출
      const plainTextContent = await createPlainTextContent(title, resultData);

      // 텍스트 파일로 저장
      fs.writeFileSync(OUTPUT_TXT_FILE, plainTextContent, "utf8");
      console.log(`워드 프로세서 파일(.txt) 생성 완료: ${OUTPUT_TXT_FILE}`);

      // 이미지 업로드 후 make_img 폴더 내 파일 삭제 (이미지 업로드 로직 제거되었으므로 삭제 로직만 유지)
      await deleteImagesInMakeImgDir();

      break; // 성공적으로 실행되면 루프 종료
    } catch (error) {
      console.error("오류 발생:", error);
      // ... (오류 처리 로직은 필요에 따라 유지 또는 수정) ...

      if (
        error.message.includes("ENOENT: no such file or directory")
        // ... (세션 만료 및 로그인 관련 오류 조건 제거) ...
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
