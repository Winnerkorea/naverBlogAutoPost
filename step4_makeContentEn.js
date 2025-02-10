// .env 파일의 환경변수 로딩
require("dotenv").config();
const fs = require("fs").promises;
const { GoogleGenerativeAI } = require("@google/generative-ai");

const geminiApiKey = process.env.GEMINI_API_KEY;

async function extractData() {
  try {
    const jsonString = await fs.readFile("./result.json", "utf8");
    const data = JSON.parse(jsonString);

    // 각 객체에서 name, roadAddress, latitude, longitude를 추출합니다.
    const extractedData = data.map((item) => ({
      name: item.name,
      roadAddress: item.roadAddress,
      latitude: item.y, // 'y' 값을 latitude로 사용
      longitude: item.x, // 'x' 값을 longitude로 사용
    }));

    // 배열 전체를 반환합니다.
    return extractedData;
  } catch (error) {
    console.error("파일 읽기 또는 파싱 중 오류 발생:", error);
    return []; // 에러 발생 시 빈 배열 반환
  }
}

async function createContent(name, roadAddress, latitude, longitude) {
  const genAI = new GoogleGenerativeAI(geminiApiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  const prompt = `
  Based on the Google Maps search results for the restaurant "${name}", please craft an engaging introduction (approximately 100-150 characters) that vividly conveys the restaurant’s unique ambiance and a delightful explosion of flavors. Additionally, write a creative and captivating blog-style review that will catch the reader's attention. 
  
  Ensure that both the restaurant name "${name}" and the address "${roadAddress}" are included in your text, and provide a Google Maps URL that utilizes the latitude ${latitude} and longitude ${longitude} information.
  
  Important:
  - The final output must strictly follow the JSON format provided below, with no extra keys or text (do not include a title).
  - Write the content entirely in English, as this is for a blog introducing Korea to foreigners.
  - If the restaurant name is to be displayed in both English and Korean, please format it as (korean - ${name}).
  
  {
    "content": {
      "${name}": {
        "intro": "<Introduction text here>",
        "Review": "<Blog-style review text here>",
        "roadAddress": "${roadAddress}",
        "map": "Google Maps URL",
        "latitude": ${latitude},
        "longitude": ${longitude}
      }
    }
  }
  `;

  try {
    const result = await model.generateContent(prompt);
    let contentText = result.response.text();
    console.log("Generated content:", contentText);

    // 만약 코드 블록(예: ```json ... ```)이 포함되어 있다면 제거
    if (contentText.startsWith("```json")) {
      contentText = contentText
        .replace(/^```json\s*/, "")
        .replace(/\s*```$/, "")
        .trim();
    }

    const parsedResult = JSON.parse(contentText);
    return parsedResult;
  } catch (error) {
    console.error("Error parsing JSON:", error);
    // 파싱 에러 발생 시, 원본 텍스트를 포함한 객체 반환
    return { error: "Invalid JSON generated", raw: error.message };
  }
}

async function main() {
  // extractData 함수 실행 후, 전체 배열을 가져옵니다.
  const extractedData = await extractData();
  console.log("전체 배열 데이터:", extractedData);

  // 누적 결과를 저장할 배열
  let allResults = [];

  // 배열 내 모든 객체에 대해 반복 처리
  for (let i = 0; i < extractedData.length; i++) {
    const item = extractedData[i];
    // 필요한 변수들을 포함하는 새로운 객체 생성
    const outputObj = {
      name: item.name,
      roadAddress: item.roadAddress,
      latitude: item.latitude,
      longitude: item.longitude,
    };

    // createContent 함수를 호출하여 콘텐츠 생성
    const generatedContent = await createContent(
      outputObj.name,
      outputObj.roadAddress,
      outputObj.latitude,
      outputObj.longitude
    );
    if (generatedContent !== null) {
      // 생성된 콘텐츠를 누적 배열에 추가합니다.
      allResults.push(generatedContent);
    }

    console.log(`${i + 1}번째 객체:`, outputObj);

    // 누적된 결과를 output.json 파일에 저장합니다.
    await fs.writeFile(
      "output.json",
      JSON.stringify(allResults, null, 2),
      "utf8"
    );
    console.log("Saved to output.json");

    // createContent 실행 후 20초 대기 (20000ms)
    await new Promise((resolve) => setTimeout(resolve, 20000));
  }
}

main();
