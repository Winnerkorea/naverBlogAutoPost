require("dotenv").config();

const fs = require("fs").promises;
const path = require("path");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// 제미나이 API키를 넣어주세요
const geminiApiKey = process.env.GEMINI_API_KEY;
const geminiClient = new GoogleGenerativeAI(geminiApiKey);

async function readResultJson() {
  try {
    const data = await fs.readFile(path.join(__dirname, "result.json"), "utf8");
    return JSON.parse(data);
  } catch (err) {
    console.error("result.json 파일을 읽는 데 실패했습니다:", err);
    throw err;
  }
}

async function writeResultJson(data) {
  try {
    await fs.writeFile(
      path.join(__dirname, "result.json"),
      JSON.stringify(data, null, 2),
      "utf8"
    );
    console.log("result.json 파일이 성공적으로 업데이트되었습니다.");
  } catch (err) {
    console.error("result.json 파일을 쓰는 데 실패했습니다:", err);
    throw err;
  }
}

async function generateRestaurantIntroduction(restaurants) {
  const model = geminiClient.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `다음은 여러 맛집의 정보입니다. 각 맛집에 대해 자연스럽고 흥미로운 소개글을 작성해주세요. 
  외국인들을 대상으로 작성하는 블로그 입니다. 영어로 작성해 주세요. 고유명사가 영어 변환이 어려우면 한글로 유지해 주세요.
  각 소개글은 약 100-150자로 작성하고, 맛집의 이름, 주소, 전화번호를 반드시 포함해야 합니다. 
  또한, 각 맛집에 대한 창의적이고 매력적인 제목도 함께 제시해주세요.

  맛집 정보:
  ${JSON.stringify(restaurants, null, 2)}

  <세션1 (hello_content 키를 만들어서 값을 넣어주세요)> 
  hello_content: [주제에 맞는 인사말을 200자 내외로 적어주세요.]


  <세션2>
  다음 형식으로 정확히 응답해주세요. 각 맛집 정보 사이에는 반드시 --- 를 넣어 구분해 주세요:

  --- 

  here: [창의적인 제목]
  introduction: [자연스러운 소개글 및 추천이유]

  ---

  here: [다음 맛집의 창의적인 제목]
  introduction: [다음 맛집의 자연스러운 소개글 및 추천이유]

  ---

  ...계속...

  <세션3 (content 키를 만들어서 값을 넣어주세요)> 
  content: [위 내용들을 정리해서 이 음식을 추천하는 이유, 추천대상, 맛, 효능, 사람들의 반응, 재방문 여부, 매장 비교, 등을 반드시 1500자 내외로 창의적으로 작성해주세요.]
  `;

  const result = await model.generateContent(prompt);
  const response = result.response.text();
  console.log("API 응답:", response); // API 응답 로깅
  return response;
}

// 특수 문자를 제거하는 함수
function removeSpecialCharacters(text) {
  if (text === undefined || text === null) {
    return "";
  }
  return text.replace(/\\|\*+/g, "");
}

async function main() {
  try {
    let resultData = await readResultJson();

    if (!Array.isArray(resultData)) {
      console.error("resultData is not an array");
      return;
    }

    const restaurantInfos = resultData.map((item) => ({
      name: item.name,
      normalizedName: item.normalizedName,
      category: item.category,
      roadAddress: item.roadAddress,
      address: item.address,
      virtualPhone: item.virtualPhone || item.phone,
      businessHours: item.businessHours,
    }));

    const introductionsText = await generateRestaurantIntroduction(
      restaurantInfos
    );

    const sections = introductionsText.split("<세션");

    // hello_content 추출
    const helloContentMatch = sections[1].match(
      /hello_content:\s*([\s\S]+?)\n\n/
    );
    const helloContent = helloContentMatch
      ? removeSpecialCharacters(helloContentMatch[1].trim())
      : "";

    const restaurantIntros = sections[2]
      .split("---")
      .map((text) => {
        const lines = text.trim().split("\n");
        const intro = {};
        lines.forEach((line) => {
          const [key, value] = line.split(":");
          if (key && value) {
            intro[key.trim()] = removeSpecialCharacters(value.trim());
          }
        });
        return intro;
      })
      .filter((intro) => Object.keys(intro).length > 0);

    // content 값 추출
    const contentMatch = sections[3].match(/content:\s*([\s\S]+)/);
    const content = contentMatch
      ? removeSpecialCharacters(contentMatch[1].trim())
      : "";

    console.log("파싱된 소개글:", JSON.stringify(restaurantIntros, null, 2));
    console.log("hello_content:", helloContent);
    console.log("content:", content);

    if (restaurantIntros.length === 0) {
      console.error("생성된 소개글이 없습니다.");
      return;
    }

    // resultData에 소개글 정보 추가
    resultData.forEach((item, index) => {
      if (index < restaurantIntros.length) {
        if (restaurantIntros[index].here) {
          item.here = restaurantIntros[index].here;
        }
        if (restaurantIntros[index].introduction) {
          item.introduction = restaurantIntros[index].introduction;
        }
      }
    });

    // hello_content 값을 별도의 객체로 추가
    resultData.push({
      type: "hello_content",
      id: "hello-content",
      content: helloContent,
    });

    // content 값을 별도의 객체로 추가
    resultData.push({
      type: "content",
      id: "main-content",
      content: content,
    });

    // 업데이트된 데이터를 result.json에 저장
    await writeResultJson(resultData);

    console.log("맛집 소개글 생성 및 result.json 업데이트 완료");
    console.log("업데이트된 맛집 수:", resultData.length - 2); // hello_content와 content 객체를 제외
  } catch (error) {
    console.error("실행 중 오류 발생:", error);
    console.error("오류 상세:", error.stack);
  }
}

main();
