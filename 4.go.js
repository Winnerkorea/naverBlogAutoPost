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

const USER_ID = process.env.NAVER_USER_ID; // 네이버 아이디
const USER_PASSWORD = process.env.NAVER_USER_PASSWORD; // 네이버 비밀번호
const BLOG_ID = process.env.NAVER_BLOG_ID; // 블로그 이름 (블로그 URL에 있습니다)
const CATEGORY_ID = process.env.NAVER_CATEGORY_ID; // 포스팅할 카테고리 번호
const OPEN_TYPE = process.env.NAVER_OPEN_TYPE; // 0: 비공개, 2: 공개

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
  `${location} 현지인이 추천하는 ${foodName} 맛집 BEST ${restaurantCount}`,
  `${location}에서 꼭 가봐야 할 ${foodName} 맛집 ${restaurantCount}곳`,
  `${location} ${foodName} 맛집 투어 ${restaurantCount}선`,
  `${location} 맛도리들의 ${foodName} 성지 ${restaurantCount}곳`,
  `${location}의 숨은 보석 ${foodName} 맛집 ${restaurantCount}개`,
  `${location} 토박이가 인정한 ${foodName} 맛집 ${restaurantCount}선`,
  `${location}에서 ${foodName} 먹기 좋은 곳 ${restaurantCount}곳`,
  `${location} ${foodName} 맛집 끝판왕 ${restaurantCount}곳`,
  `${location} 여행 필수 코스 ${foodName} 맛집 ${restaurantCount}선`,
  `${location}의 ${foodName} 명소 ${restaurantCount}곳 총정리`,
  `${location} ${foodName} 맛집 ${restaurantCount}곳 완벽 가이드`,
  `${location}에서 즐기는 ${foodName} 맛집 ${restaurantCount}곳`,
  `${location} ${foodName} 맛집 ${restaurantCount}곳 리스트`,
  `${location} 맛집 투어: ${foodName} 편 ${restaurantCount}곳`,
  `${location}의 ${foodName} 맛집 ${restaurantCount}곳 탐방기`,
  `${location} ${foodName} 맛집 ${restaurantCount}곳 정복하기`,
  `${location}에서 ${foodName} 먹방 ${restaurantCount}곳`,
  `${location} ${foodName} 맛집 ${restaurantCount}곳 완전정복`,
  `${location} 맛집 지도: ${foodName} ${restaurantCount}곳`,
  `${location}의 ${foodName} 맛집 ${restaurantCount}곳 총망라`,
  `${location} ${foodName} 맛집 ${restaurantCount}곳 모음집`,
  `${location}에서 ${foodName} 맛집 찾기 ${restaurantCount}곳`,
  `${location} ${foodName} 맛집 ${restaurantCount}곳 추천`,
  `${location}의 ${foodName} 맛집 ${restaurantCount}곳 소개`,
  `${location} ${foodName} 맛집 ${restaurantCount}곳 리뷰`,
  `${location}에서 ${foodName} 맛집 ${restaurantCount}곳 탐방`,
  `${location} ${foodName} 맛집 ${restaurantCount}곳 순위`,
  `${location}의 ${foodName} 맛집 ${restaurantCount}곳 pick`,
  `${location} ${foodName} 맛집 ${restaurantCount}곳 정보`,
  `${location}에서 ${foodName} 먹을 때 가야 할 ${restaurantCount}곳`,
  `${location} ${foodName} 맛집 ${restaurantCount}곳 완벽 정리`,
  `${location}의 ${foodName} 맛집 ${restaurantCount}곳 추천 코스`,
  `${location} ${foodName} 맛집 ${restaurantCount}곳 맛있게 먹는 방법`,
  `${location}에서 ${foodName} 맛집 ${restaurantCount}곳 찾아가기`,
  `${location} ${foodName} 맛집 ${restaurantCount}곳 미식 여행`,
  `${location}의 ${foodName} 맛집 ${restaurantCount}곳 맛있는 발견`,
  `${location} ${foodName} 맛집 ${restaurantCount}곳 맛집 지도`,
  `${location}에서 ${foodName} 맛집 ${restaurantCount}곳 즐기기`,
  `${location} ${foodName} 맛집 ${restaurantCount}곳 완벽 공략`,
  `${location}의 ${foodName} 맛집 ${restaurantCount}곳 맛있는 여정`,
  `${location} ${foodName} 맛집 ${restaurantCount}곳 먹방 투어`,
  `${location}에서 ${foodName} 맛집 ${restaurantCount}곳 맛보기`,
  `${location} ${foodName} 맛집 ${restaurantCount}곳 맛집 탐방`,
  `${location}의 ${foodName} 맛집 ${restaurantCount}곳 맛있는 발견`,
  `${location} ${foodName} 맛집 ${restaurantCount}곳 미식가 가이드`,
  `${location}에서 ${foodName} 맛집 ${restaurantCount}곳 맛집 순례`,
  `${location} ${foodName} 맛집 ${restaurantCount}곳 맛있는 여행`,
  `${location}의 ${foodName} 맛집 ${restaurantCount}곳 맛집 정복기`,
  `${location} ${foodName} 맛집 ${restaurantCount}곳 맛있는 탐험`,
  `${location}에서 ${foodName} 맛집 ${restaurantCount}곳 맛집 체험`,
];

// 랜덤으로 제목 선택
const title = titleTemplates[Math.floor(Math.random() * titleTemplates.length)];

console.log(title); // 생성된 제목을 출력

// 본문 내용 생성
let content = "";
Object.values(resultData).forEach((restaurant, index) => {
  content += `<h2>${index + 1}. ${restaurant.name}</h2>\n`;
  content += `<p>${restaurant.here}</p>\n`;
  content += `<img src="${restaurant.imageUrl}" alt="${restaurant.name}">\n`;
  content += `<p>${restaurant.introduction}</p>\n\n`;
});

// selectedItem 설정 (이전 구조와 유사하게)
const selectedItem = {
  resultContent: content,
  naver_content: resultData,
};

// 이모티콘 리스트
const emoticonUrls = [
  {
    packCode: "cafe_001",
    seq: 2,
    src: "https://storep-phinf.pstatic.net/cafe_001/original_2.gif",
  },
  {
    packCode: "cafe_001",
    seq: 11,
    src: "https://storep-phinf.pstatic.net/cafe_001/original_11.gif",
  },
  {
    packCode: "cafe_001",
    seq: 1,
    src: "https://storep-phinf.pstatic.net/cafe_001/original_1.gif",
  },
  {
    packCode: "cafe_001",
    seq: 19,
    src: "https://storep-phinf.pstatic.net/cafe_001/original_19.gif",
  },
  {
    packCode: "cafe_001",
    seq: 23,
    src: "https://storep-phinf.pstatic.net/cafe_001/original_23.gif",
  },
  {
    packCode: "cafe_001",
    seq: 4,
    src: "https://storep-phinf.pstatic.net/cafe_001/original_4.gif",
  },
  {
    packCode: "cafe_001",
    seq: 7,
    src: "https://storep-phinf.pstatic.net/cafe_001/original_7.gif",
  },
  {
    packCode: "cafe_001",
    seq: 9,
    src: "https://storep-phinf.pstatic.net/cafe_001/original_9.gif",
  },
  {
    packCode: "cafe_001",
    seq: 3,
    src: "https://storep-phinf.pstatic.net/cafe_001/original_3.gif",
  },
  {
    packCode: "cafe_002",
    seq: 14,
    src: "https://storep-phinf.pstatic.net/cafe_002/original_14.gif",
  },
  {
    packCode: "cafe_002",
    seq: 22,
    src: "https://storep-phinf.pstatic.net/cafe_002/original_22.gif",
  },
  {
    packCode: "cafe_004",
    seq: 1,
    src: "https://storep-phinf.pstatic.net/cafe_004/original_1.png",
  },
  {
    packCode: "cafe_004",
    seq: 4,
    src: "https://storep-phinf.pstatic.net/cafe_004/original_4.png",
  },
  {
    packCode: "cafe_004",
    seq: 7,
    src: "https://storep-phinf.pstatic.net/cafe_004/original_7.png",
  },
  {
    packCode: "cafe_004",
    seq: 3,
    src: "https://storep-phinf.pstatic.net/cafe_004/original_3.png",
  },
  {
    packCode: "cafe_004",
    seq: 5,
    src: "https://storep-phinf.pstatic.net/cafe_004/original_5.png",
  },
  {
    packCode: "cafe_004",
    seq: 6,
    src: "https://storep-phinf.pstatic.net/cafe_004/original_6.png",
  },
  {
    packCode: "cafe_004",
    seq: 10,
    src: "https://storep-phinf.pstatic.net/cafe_004/original_10.png",
  },
  {
    packCode: "cafe_004",
    seq: 11,
    src: "https://storep-phinf.pstatic.net/cafe_004/original_11.png",
  },
  {
    packCode: "cafe_004",
    seq: 13,
    src: "https://storep-phinf.pstatic.net/cafe_004/original_13.png",
  },
  {
    packCode: "cafe_004",
    seq: 15,
    src: "https://storep-phinf.pstatic.net/cafe_004/original_15.png",
  },
  {
    packCode: "cafe_004",
    seq: 14,
    src: "https://storep-phinf.pstatic.net/cafe_004/original_14.png",
  },
  {
    packCode: "cafe_004",
    seq: 16,
    src: "https://storep-phinf.pstatic.net/cafe_004/original_16.png",
  },
  {
    packCode: "cafe_004",
    seq: 22,
    src: "https://storep-phinf.pstatic.net/cafe_004/original_22.png",
  },
  {
    packCode: "cafe_004",
    seq: 23,
    src: "https://storep-phinf.pstatic.net/cafe_004/original_23.png",
  },
  {
    packCode: "cafe_004",
    seq: 21,
    src: "https://storep-phinf.pstatic.net/cafe_004/original_21.png",
  },
  {
    packCode: "cafe_002",
    seq: 21,
    src: "https://storep-phinf.pstatic.net/cafe_002/original_21.gif",
  },
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

// 로그인 함수
async function naver_login(accountList) {
  const fs = require("fs");
  const puppeteer = require("puppeteer");
  const path = require("path");
  // 상수 정의
  const HEADLESS_MODE = false;
  const WRITE_URL =
    "https://nid.naver.com/nidlogin.login?mode=form&url=https://www.naver.com/";
  const loginDelayTime = 2000;
  // 브라우저 시작 옵션 설정
  async function startBrowser() {
    return await puppeteer.launch({
      headless: HEADLESS_MODE,
      ignoreHTTPSErrors: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-infobars",
        "--disable-blink-features=AutomationControlled",
        "--ignore-certificate-errors",
      ],
    });
  }
  // 팝업 듣기
  async function autoPopup(page) {
    page.on("dialog", async (dialog) => {
      await dialog.accept();
    });
  }
  // 자동화 우회 설정
  async function makeBrowserNice(page) {
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, "webdriver", {
        get: () => false,
      });
    });
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"
    );
  }
  // 사이트 이동
  async function goToSite(page, url) {
    try {
      await page.goto(url, { waitUntil: "networkidle0" });
    } catch (error) {
      console.error("Failed to load the page:", error);
    }
  }
  // 로그인 함수
  async function loginNaver(page, userId, userPassword) {
    await goToSite(page, WRITE_URL);
    await page.waitForSelector("#id");
    await typeRandomly(page, "#id", userId);
    await new Promise((resolve) => setTimeout(resolve, 500));
    await page.waitForSelector("#pw");
    await typeRandomly(page, "#pw", userPassword);
    await new Promise((resolve) => setTimeout(resolve, 1200));
    await page.keyboard.press("Enter");
    await new Promise((resolve) => setTimeout(resolve, loginDelayTime));
    await saveSession(page, userId);
    await page.screenshot({ path: "login.jpg", fullPage: true });
    console.log("로그인 완료 스크린샷이 저장되었습니다: login.jpg");
  }
  // 세션 정보 저장 함수
  async function saveSession(page, userId) {
    const sessionFilePath = path.join(__dirname, `${userId}_session.json`);
    const cookies = await page.cookies();
    const sessionData = {
      userId,
      cookies,
    };
    await fs.promises.writeFile(
      sessionFilePath,
      JSON.stringify(sessionData, null, 2),
      "utf8"
    );
    console.log("세션 정보가 저장되었습니다:", sessionFilePath);
  }
  // 랜덤 딜레이 설정
  async function typeRandomly(page, selector, text) {
    await page.click(selector);
    for (let char of text) {
      await page.type(selector, char, { delay: Math.random() * 120 + 30 });
    }
  }
  // 메인 로직
  for (const account of accountList) {
    const { id: userId, password: userPassword } = account;
    console.log(`${userId} 계정으로 로그인을 시작합니다.`);
    const browser = await startBrowser();
    const pages = await browser.pages();
    const page = pages[0];
    await autoPopup(page);
    await makeBrowserNice(page);
    await loginNaver(page, userId, userPassword);
    await browser.close();
    console.log(`${userId} 계정의 세션 정보가 저장되었습니다.`);
    console.log("3초 후 다음 계정으로 로그인을 시작합니다...");
    await new Promise((resolve) => setTimeout(resolve, 3000));
  }
  console.log("모든 계정의 세션 정보가 저장되었습니다.");
}

async function checkAndRunLoginScript() {
  if (!fs.existsSync(SESSION_FILE)) {
    console.log(
      "세션 파일을 찾을 수 없습니다. 로그인 스크립트를 실행합니다..."
    );
    await performLogin();
  } else {
    try {
      const sessionData = JSON.parse(fs.readFileSync(SESSION_FILE, "utf8"));
      if (
        !sessionData ||
        !sessionData.cookies ||
        sessionData.cookies.length === 0
      ) {
        console.log(
          "유효하지 않은 세션 데이터입니다. 로그인 스크립트를 실행합니다..."
        );
        await performLogin();
      }
    } catch (error) {
      console.error("세션 파일을 읽는 중 오류 발생:", error);
      console.log("로그인 스크립트를 실행합니다...");
      await performLogin();
    }
  }
}

async function performLogin() {
  try {
    const accountList = [{ id: USER_ID, password: USER_PASSWORD }];
    await naver_login(accountList);
    console.log("로그인 성공");
  } catch (error) {
    console.error("로그인 중 오류 발생:", error);
    throw error;
  }
}

//user agent 세팅 (여러개 두면 랜덤으로 선택되나 유효성을 확인하고 추가해야합니다)
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

// 발행 전 토큰 받아오기
async function getToken() {
  const config = {
    method: "get",
    url: `${BASE_URL}/PostWriteFormSeOptions.naver?blogId=${BLOG_ID}&categoryNo=${CATEGORY_ID}`,
    headers: {
      accept: "application/json, text/plain, */*",
      "accept-language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
      referer: `${BASE_URL}/${BLOG_ID}/postwrite?categoryNo=${CATEGORY_ID}`,
      "user-agent": USER_AGENTS,
    },
  };

  const response = await client(config);
  if (!response.data.result) {
    throw new Error("Failed to retrieve token: result is undefined");
  }

  return response.data.result.token;
}

// 이미지 세션
async function getSessionKey(token) {
  const config = {
    method: "get",
    url: "https://platform.editor.naver.com/api/blogpc001/v1/photo-uploader/session-key",
    headers: {
      accept: "application/json",
      "accept-language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
      origin: BASE_URL,
      referer: `${BASE_URL}/${BLOG_ID}/postwrite?categoryNo=${CATEGORY_ID}`,
      "se-app-id": "SE-2a665df9-8ca0-4cc0-a2ba-16b36d52889f",
      "se-authorization": token,
      "user-agent": getRandomUserAgent(),
    },
  };

  const response = await client(config);
  return response.data.sessionKey;
}

async function uploadImage(sessionKey, imagePath) {
  const formData = new FormData();
  formData.append("image", fs.createReadStream(imagePath), {
    filename: path.basename(imagePath),
    contentType: `image/${path.extname(imagePath).slice(1)}`,
  });

  const config = {
    method: "post",
    url: `https://blog.upphoto.naver.com/${sessionKey}/simpleUpload/0?userId=${USER_ID}&extractExif=true&extractAnimatedCnt=true&autorotate=true&extractDominantColor=false&type=&customQuery=&denyAnimatedImage=false&skipXcamFiltering=false`,
    headers: {
      ...formData.getHeaders(),
      Accept: "*/*",
      "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
      Origin: BASE_URL,
      Referer: `${BASE_URL}/${BLOG_ID}/postwrite?categoryNo=${CATEGORY_ID}`,
      "User-Agent": getRandomUserAgent(),
    },
    data: formData,
  };

  try {
    const response = await client(config);
    const parsedXML = await parseXML(response.data);
    const item = parsedXML.item;
    return {
      url: `${BLOG_FILES_URL}${item.url[0]}`,
      path: `${item.path[0]}/${item.fileName[0]}`,
      fileSize: parseInt(item.fileSize[0]),
      width: parseInt(item.width[0]),
      height: parseInt(item.height[0]),
      originalWidth: parseInt(item.width[0]),
      originalHeight: parseInt(item.height[0]),
      fileName: item.fileName[0],
      thumbnail: `${BLOG_FILES_URL}${item.thumbnail[0]}`,
    };
  } catch (error) {
    console.error("이미지 업로드 중 오류 발생:", error);
    if (error.response) {
      console.error("응답 상태:", error.response.status);
      console.error("응답 데이터:", error.response.data);
    }
    throw error;
  }
}

function getRandomTime(min, max) {
  // 분 단위를 초 단위로 변환
  const minSeconds = min * 60;
  const maxSeconds = max * 60;
  // 최소값과 최대값 사이의 랜덤한 초 값을 반환
  return Math.floor(Math.random() * (maxSeconds - minSeconds + 1)) + minSeconds;
}

// 랜덤 페이지 체류 시간
function getRandomStayTime() {
  return getRandomTime(100, 150);
}

// 랜덤 타이핑 시간
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
  const maxWidth = 600; // 원하는 최대 너비
  let width = image.width;
  let height = image.height;

  if (width > maxWidth) {
    const ratio = maxWidth / width;
    width = maxWidth;
    height = Math.round(height * ratio);
  }

  return {
    id: uuidv4(),
    layout: "default",
    src: image.url,
    internalResource: true,
    represent: false,
    path: image.path,
    domain: BLOG_FILES_URL,
    fileSize: image.fileSize,
    width: width,
    height: height,
    originalWidth: image.width,
    originalHeight: image.height,
    fileName: image.fileName,
    caption: null,
    format: "normal",
    displayFormat: "normal",
    imageLoaded: true,
    contentMode: "normal",
    widthPercentage: 0,
    origin: {
      srcFrom: "local",
      "@ctype": "imageOrigin",
    },
    "@ctype": "image",
    align: "center",
  };
}

async function createDocumentModel(
  uploadedImages,
  blogId,
  logNo,
  title,
  content
) {
  const components = [];
  let imageIndex = 0;

  // 제목 추가
  components.push({
    id: uuidv4(),
    layout: "default",
    title: [
      {
        id: uuidv4(),
        nodes: [
          {
            id: uuidv4(),
            value: title,
            "@ctype": "textNode",
          },
        ],
        "@ctype": "paragraph",
      },
    ],
    subTitle: null,
    align: "left",
    "@ctype": "documentTitle",
  });

  // hello_content 추가 (맨 처음에)
  const helloContentItem = content.find(
    (item) => item.type === "hello_content"
  );
  if (helloContentItem && helloContentItem.content) {
    components.push({
      id: uuidv4(),
      layout: "quotation_line",
      value: [
        {
          id: uuidv4(),
          nodes: [
            {
              id: uuidv4(),
              value: helloContentItem.content,
              "@ctype": "textNode",
            },
          ],
          "@ctype": "paragraph",
        },
        {
          id: uuidv4(),
          nodes: [
            {
              id: uuidv4(),
              value: "",
              "@ctype": "textNode",
            },
          ],
          "@ctype": "paragraph",
        },
      ],
      source: null,
      "@ctype": "quotation",
    });

    // 빈 줄 추가
    components.push({
      id: uuidv4(),
      layout: "default",
      value: [
        {
          id: uuidv4(),
          nodes: [
            {
              id: uuidv4(),
              value: "",
              "@ctype": "textNode",
            },
          ],
          "@ctype": "paragraph",
        },
      ],
      "@ctype": "text",
    });
  }

  // 본문 내용 추가
  content.forEach((item, index) => {
    if (item.keyword) {
      // keyword 값이 있는 경우에만 처리
      // 상호명 추가
      components.push({
        id: uuidv4(),
        layout: "default",
        value: [
          {
            id: uuidv4(),
            nodes: [
              {
                id: uuidv4(),
                value: `${index + 1}. ${item.name}`,
                style: {
                  fontFamily: "nanummaruburi",
                  fontSizeCode: "fs19",
                  bold: true,
                  "@ctype": "nodeStyle",
                },
                "@ctype": "textNode",
              },
            ],
            "@ctype": "paragraph",
          },
        ],
        "@ctype": "text",
      });

      // 이미지 추가 (상호명 바로 아래)
      if (imageIndex < uploadedImages.length) {
        components.push(createImageComponent(uploadedImages[imageIndex]));
        imageIndex++;
      }

      // 'here' 추가
      components.push({
        id: uuidv4(),
        layout: "default",
        value: [
          {
            id: uuidv4(),
            nodes: [
              {
                id: uuidv4(),
                value: item.here,
                style: {
                  fontFamily: "nanummaruburi",
                  fontSizeCode: "fs16",
                  bold: true,
                  italic: true,
                  "@ctype": "nodeStyle",
                },
                "@ctype": "textNode",
              },
            ],
            "@ctype": "paragraph",
          },
        ],
        "@ctype": "text",
      });

      // 'introduction' 추가
      components.push({
        id: uuidv4(),
        layout: "default",
        value: [
          {
            id: uuidv4(),
            nodes: [
              {
                id: uuidv4(),
                value: item.introduction,
                "@ctype": "textNode",
              },
            ],
            "@ctype": "paragraph",
          },
        ],
        "@ctype": "text",
      });

      // 구분선 추가 (마지막 맛집 항목 제외)
      if (index < content.filter((i) => i.keyword).length - 1) {
        components.push({
          id: uuidv4(),
          layout: "line1",
          "@ctype": "horizontalLine",
        });
      }
    }
  });

  // 랜덤으로 이모티콘 선택
  const randomEmoticon =
    emoticonUrls[Math.floor(Math.random() * emoticonUrls.length)];

  // 이모지 스티커 추가
  components.push({
    id: uuidv4(),
    layout: "default",
    align: "center",
    packCode: randomEmoticon.packCode,
    seq: randomEmoticon.seq,
    thumbnail: {
      src: randomEmoticon.src,
      width: 185,
      height: 160,
      "@ctype": "thumbnail",
    },
    format: randomEmoticon.packCode === "cafe_004" ? "normal" : "animated",
    "@ctype": "sticker",
  });

  // content 내용 추가 (맨 마지막에)
  const contentItem = content.find((item) => item.type === "content");
  if (contentItem && contentItem.content) {
    const contentData = {
      id: uuidv4(),
      layout: "default",
      value: [
        {
          id: uuidv4(),
          nodes: [
            {
              id: uuidv4(),
              value: contentItem.content,
              style: {
                fontFamily: "nanumdasisijaghae",
                fontSizeCode: "fs19",
                bold: false,
                "@ctype": "nodeStyle",
              },
              "@ctype": "textNode",
            },
          ],
          "@ctype": "paragraph",
        },
      ],
      "@ctype": "text",
    };

    // content 추가
    components.push(contentData);
  }
  return {
    documentId: "",
    document: {
      version: "2.8.0",
      theme: "default",
      language: "ko-KR",
      id: uuidv4(),
      components: components,
      di: {
        dif: false,
        dio: [
          {
            dis: "N",
            dia: {
              t: 0,
              p: 0,
              st: getRandomStayTime(),
              sk: getRandomTypingTime(),
            },
          },
          {
            dis: "N",
            dia: {
              t: 0,
              p: 0,
              st: getRandomStayTime(),
              sk: getRandomTypingTime(),
            },
          },
        ],
      },
    },
  };
}

function createPopulationParams(
  uploadedImages,
  autoSaveNo = null,
  logNo = null
) {
  return {
    configuration: {
      openType: OPEN_TYPE,
      commentYn: true,
      searchYn: true,
      sympathyYn: true,
      scrapType: 2,
      outSideAllowYn: true,
      twitterPostingYn: false,
      facebookPostingYn: false,
      cclYn: false,
    },
    populationMeta: {
      categoryId: CATEGORY_ID,
      logNo: logNo,
      directorySeq: 0,
      directoryDetail: null,
      mrBlogTalkCode: null,
      postWriteTimeType: "now",
      tags: "",
      moviePanelParticipation: false,
      greenReviewBannerYn: false,
      continueSaved: false,
      noticePostYn: false,
      autoByCategoryYn: false,
      postLocationSupportYn: false,
      postLocationJson: null,
      prePostDate: null,
      thisDayPostInfo: null,
      scrapYn: false,
      autoSaveNo: autoSaveNo,
      imageList: uploadedImages.map((image) => ({
        path: image.path,
        url: image.url,
        fileSize: image.fileSize,
        width: image.width,
        height: image.height,
        fileName: image.fileName,
        internalResource: true,
      })),
    },
    editorSource: "2SFRssMItF6lyIh/LQVcjQ==",
  };
}

async function autoSave(documentModel, populationParams) {
  const config = {
    method: "post",
    url: `${BASE_URL}/RabbitAutoSaveWrite.naver`,
    headers: {
      accept: "application/json, text/plain, */*",
      "accept-language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
      "content-type": "application/x-www-form-urlencoded",
      origin: BASE_URL,
      referer: `${BASE_URL}/${BLOG_ID}/postwrite?categoryNo=${CATEGORY_ID}`,
      "user-agent": getRandomUserAgent(),
    },
    data: `blogId=${BLOG_ID}&documentModel=${encodeURIComponent(
      JSON.stringify(documentModel)
    )}&populationParams=${encodeURIComponent(
      JSON.stringify(populationParams)
    )}&productApiVersion=v1`,
  };

  const response = await client(config);
  return response.data;
}

async function publishPost(autoSaveNo, documentModel, populationParams) {
  const requestData = `blogId=${BLOG_ID}&documentModel=${encodeURIComponent(
    JSON.stringify(documentModel)
  )}&populationParams=${encodeURIComponent(
    JSON.stringify(populationParams)
  )}&productApiVersion=v1`;

  // console.log("글쓰기 페이로드:");
  // console.log(requestData);

  const config = {
    method: "post",
    url: `${BASE_URL}/RabbitWrite.naver`,
    headers: {
      accept: "application/json, text/plain, */*",
      "accept-language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
      "content-type": "application/x-www-form-urlencoded",
      origin: BASE_URL,
      referer: `${BASE_URL}/${BLOG_ID}/postwrite?categoryNo=${CATEGORY_ID}`,
      "user-agent": getRandomUserAgent(),
    },
    data: requestData,
  };

  const response = await client(config);
  if (
    response.data.isSuccess &&
    response.data.result &&
    response.data.result.redirectUrl
  ) {
    // console.log("포스트 발행 결과 : " + response.data.result.redirectUrl);

    // 게시글 아이디 추출 및 로그 출력
    const postId = new URL(response.data.result.redirectUrl).searchParams.get(
      "logNo"
    );
    // console.log("게시글 아이디: " + postId);
  } else {
    console.error("포스트 발행 실패");
    console.error(response.data);
  }

  return response.data;
}

// 게시글을 모두 올리고 이미지 폴더 내용 삭제 함수
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
      await checkAndRunLoginScript();

      const sessionData = JSON.parse(fs.readFileSync(SESSION_FILE, "utf8"));

      sessionData.cookies.forEach((cookie) => {
        jar.setCookieSync(`${cookie.name}=${cookie.value}`, BASE_URL, {
          domain: cookie.domain,
          path: cookie.path,
          secure: cookie.secure,
          httpOnly: cookie.httpOnly,
          sameSite: cookie.sameSite,
        });
      });

      const token = await getToken();
      console.log("토큰 획득 성공");

      const sessionKey = await getSessionKey(token);
      console.log("세션 키 획득 성공");

      // 이미지 파일 목록 확인 및 필터링
      const imageFiles = fs
        .readdirSync(MAKE_IMG_DIR)
        .filter((file) => /\.(jpg|jpeg|png|gif|webp)$/i.test(file))
        .map((file) => {
          const fullPath = path.join(MAKE_IMG_DIR, file);
          console.log(`Processing file: ${fullPath}`);
          return fullPath;
        });

      console.log("Processed image files:", imageFiles);

      // make_img 폴더의 이미지 업로드
      console.log("이미지 파일 목록:", imageFiles);
      const uploadedImages = await Promise.all(
        imageFiles.map(async (imagePath) => {
          try {
            console.log(`이미지 업로드 시도: ${imagePath}`);
            const result = await uploadImage(sessionKey, imagePath);
            console.log(`이미지 업로드 성공:`, result);
            return result;
          } catch (error) {
            console.error(`이미지 업로드 실패: ${imagePath}`, error);
            return null;
          }
        })
      ).then((images) => images.filter((img) => img !== null));

      // info.gif 파일 업로드
      const infoGifPath = path.join(MAKE_IMG_DIR, "info.gif");
      if (fs.existsSync(infoGifPath)) {
        try {
          console.log(`info.gif 업로드 시도: ${infoGifPath}`);
          const infoGifResult = await uploadImage(sessionKey, infoGifPath);
          console.log(`info.gif 업로드 성공:`, infoGifResult);
          uploadedImages.push(infoGifResult);
        } catch (error) {
          console.error(`info.gif 업로드 실패: ${infoGifPath}`, error);
        }
      }

      console.log("업로드된 이미지:", uploadedImages);

      // 내용 처리
      const naver_content = processContent(selectedItem.resultContent);

      // documentModel 생성
      const documentModel = await createDocumentModel(
        uploadedImages,
        BLOG_ID,
        null,
        title,
        resultData
      );

      console.log("Document Model:", JSON.stringify(documentModel, null, 2));

      const populationParams = createPopulationParams(uploadedImages);

      console.log(
        "Population Params:",
        JSON.stringify(populationParams, null, 2)
      );

      const autoSaveData = await autoSave(documentModel, populationParams);
      console.log("AutoSave 데이터:", JSON.stringify(autoSaveData, null, 2));

      let autoSaveNo;
      if (
        autoSaveData &&
        autoSaveData.result &&
        autoSaveData.result.autoSaveNo
      ) {
        autoSaveNo = autoSaveData.result.autoSaveNo;
      } else {
        console.error("자동 저장 번호를 찾을 수 없습니다.");
        throw new Error("자동 저장 실패");
      }

      const publishResult = await publishPost(
        autoSaveNo,
        documentModel,
        populationParams
      );
      if (
        publishResult.isSuccess &&
        publishResult.result &&
        publishResult.result.redirectUrl
      ) {
        console.log("포스트 발행 결과 : " + publishResult.result.redirectUrl);

        const postId = new URL(
          publishResult.result.redirectUrl
        ).searchParams.get("logNo");
        console.log("게시글 아이디:", postId);

        // 이미지 업로드 후 make_img 폴더 내 파일 삭제
        await deleteImagesInMakeImgDir();
      } else {
        console.error("포스트 발행 실패");
        console.error(publishResult);
        throw new Error("포스트 발행 실패");
      }

      break; // 성공적으로 실행되면 루프 종료
    } catch (error) {
      console.error("오류 발생:", error);
      if (error.response) {
        console.error("응답 상태:", error.response.status);
        console.error("응답 데이터:", error.response.data);
      }

      if (
        error.message.includes("ENOENT: no such file or directory") ||
        error.message.includes("유효하지 않은 세션") ||
        (error.response && error.response.status === 401) ||
        error.message.includes("Failed to retrieve token")
      ) {
        console.log(
          "세션이 만료되었거나 유효하지 않습니다. 다시 로그인합니다..."
        );
        await performLogin();
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
