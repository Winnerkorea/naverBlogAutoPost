require("dotenv").config();
const fs = require("fs").promises;
const path = require("path");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// ---------------------------------------------------
// 1) Gemini API 초기화
// ---------------------------------------------------
const geminiApiKey = process.env.GEMINI_API_KEY;
const geminiClient = new GoogleGenerativeAI(geminiApiKey);

/**
 * JSON 파일을 읽어 파싱하는 함수
 * @param {string} filename - 읽어올 JSON 파일 이름
 * @returns {Promise<object|array>} 파싱된 JSON 데이터
 */
async function readJsonFile(filename) {
  try {
    const data = await fs.readFile(path.join(__dirname, filename), "utf8");
    return JSON.parse(data);
  } catch (err) {
    console.error(`${filename} 파일을 읽는 중 오류 발생:`, err);
    throw err;
  }
}

/**
 * 데이터를 JSON 파일로 저장하는 함수
 * @param {string} filename - 저장할 JSON 파일 이름
 * @param {object|array} data - 저장할 데이터
 */
async function writeJsonFile(filename, data) {
  try {
    await fs.writeFile(
      path.join(__dirname, filename),
      JSON.stringify(data, null, 2),
      "utf8"
    );
    console.log(`${filename} 파일이 성공적으로 저장되었습니다.`);
  } catch (err) {
    console.error(`${filename} 파일을 저장하는 데 실패했습니다:`, err);
    throw err;
  }
}

// ---------------------------------------------------
// 2) Markdown 코드 블록 제거 후처리 함수 (옵션)
// ---------------------------------------------------
function cleanJsonResponse(text) {
  // 만약 텍스트가 백틱 코드 블록(예: ```json)으로 감싸져 있다면 제거
  if (text.startsWith("```")) {
    text = text.replace(/^```[^\n]*\n/, ""); // 첫 줄 제거
    text = text.replace(/\n```$/, ""); // 마지막 백틱 제거
  }
  return text.trim();
}

// ---------------------------------------------------
// 3) 개별 맛집에 대한 Gemini API 요청 함수 예시
// ---------------------------------------------------
/**
 * 단일 맛집 객체를 입력받아, Gemini API로부터
 * {
 *   "title": "...",
 *   "introduction": "..."
 * }
 * 형태의 JSON을 받아오는 예시 함수
 *
 * @param {object} restaurant - 맛집 객체
 * @returns {Promise<object>} { title, introduction } 형태의 JSON 객체
 */
async function generateIntroForOneRestaurant(restaurant) {
  const model = geminiClient.getGenerativeModel({ model: "gemini-1.5-flash" });

  // 프롬프트 예시 (단일 맛집에 대한 소개글)
  // 주의: 응답은 "title"과 "introduction"만 포함하는 JSON을 반환해야 합니다.
  // 모델이 다른 키를 반환하지 않도록 '중요' 문구에 명시합니다.
  const prompt = `Write a short restaurant introduction in English for the following place.
It must be strictly in JSON format with only two keys: "title" and "introduction".
No additional text, no markdown. The place info:
- Name: ${restaurant.name}
- Address: ${restaurant.roadAddress}
- Phone: ${restaurant.virtualPhone || restaurant.phone}

Use around 100-150 characters in "introduction". 
**IMPORTANT**: The output must be valid JSON with:
{
  "title": "...",
  "introduction": "..."
}
No extra keys, no code blocks, no markdown.`;

  const result = await model.generateContent(prompt);
  let rawResponse = result.response.text();

  // 코드 블록 제거(옵션)
  rawResponse = cleanJsonResponse(rawResponse);

  // 파싱 시도
  let parsed;
  try {
    parsed = JSON.parse(rawResponse);
  } catch (err) {
    console.error("Gemini 응답을 JSON으로 파싱 실패:", err, rawResponse);
    // 파싱 실패 시, 임시로 raw를 반환하거나, 기본 값을 반환
    parsed = { title: "", introduction: rawResponse };
  }

  return parsed;
}

// ---------------------------------------------------
// 4) 메인 로직
// ---------------------------------------------------
async function main() {
  try {
    // (1) result.json 파일에서 배열 형태의 맛집 데이터 읽기
    let resultData = await readJsonFile("result.json");

    if (!Array.isArray(resultData)) {
      console.error("resultData가 배열 형식이 아닙니다.");
      return;
    }

    // (2) 각 맛집 객체에 새 필드 추가 및 Gemini API로부터 소개글 생성
    const updatedRestaurants = [];
    for (let i = 0; i < resultData.length; i++) {
      const restaurant = resultData[i];

      // 예시: id, openStatus, keyword 등 추가
      restaurant.id = i + 1;
      restaurant.openStatus = restaurant.businessHours
        ? "영업중"
        : "영업정보없음";
      restaurant.keyword = "구로1동 낙지볶음"; // 예시 키워드
      restaurant.rank = i + 1; // 예시 rank

      // (2-A) Gemini API를 호출하여 개별 소개글(JSON)을 생성
      // 실제로는 비동기 호출 => 각 객체별 1회 API 호출
      const geminiIntro = await generateIntroForOneRestaurant(restaurant);
      // "title", "introduction"만 들어있을 것으로 기대
      // 사용자 요구 사항에 따라, 배열로 넣을 수도 있고 단일 객체로 넣을 수도 있습니다.
      // 여기서는 "restaurant_introductions"가 배열인 형태로 예시
      restaurant.restaurant_introductions = [geminiIntro];

      // (2-B) 완성된 객체를 배열에 모음
      updatedRestaurants.push(restaurant);
    }

    // (3) 최종 구조
    // 질문에서 예시로 준 구조를 따라, "updatedRestaurants" 배열만 포함하는 객체를 생성
    const finalOutput = {
      updatedRestaurants,
    };

    // (4) posting.json에 저장
    await writeJsonFile("posting.json", finalOutput);
    console.log("모든 작업 완료! posting.json 파일을 확인하세요.");
  } catch (error) {
    console.error("메인 함수 실행 중 오류:", error);
  }
}

// ---------------------------------------------------
// 5) 실행
// ---------------------------------------------------
main();
