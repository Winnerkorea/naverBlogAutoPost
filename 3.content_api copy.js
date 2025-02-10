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

  const prompt = `Create engaging, SEO-optimized restaurant reviews for international audiences. Write in English, keeping Korean names in their original form when appropriate.

  <metadata>
  restaurants: ${JSON.stringify(restaurants, null, 2)}
  target_audience: International food enthusiasts and travelers
  content_type: Restaurant blog reviews
  primary_keywords: Korean restaurants, Seoul food guide, Korean cuisine, local restaurants
  </metadata>
  
  <section1>
  key: hello_content
  requirements:
  - Write a welcoming introduction (200 words max)
  - Include primary keywords naturally
  - Address common search queries about Korean food
  - Highlight unique aspects of Korean dining culture
  </section1>
  
  <section2>
  Format each restaurant review as follows (separate with "---"):
  
  ---
  restaurant_metadata:
    name: [Restaurant Name]
    address: [Full Address]
    phone: [Contact Number]
    cuisine_type: [Type of Cuisine]
    price_range: [Price Category]
  
  title: [Create an SEO-optimized, compelling title (50-60 characters)]
  h1_heading: [Unique, keyword-rich heading different from title]
  meta_description: [150-160 character compelling summary]
  
  main_content:
  - Natural, engaging introduction (100-150 words)
  - Must include location, contact details, and signature dishes
  - Incorporate relevant keywords naturally
  - Include local tips and recommendations
  ---
  
  <section3>
  key: content
  requirements:
  - Comprehensive summary (1500 words)
  - Include H2 and H3 subheadings
  - Cover:
    * Unique selling points
    * Target audience recommendations
    * Taste profiles and specialty dishes
    * Health benefits and nutritional value
    * Customer testimonials and reviews
    * Comparison with similar establishments
    * Best times to visit
    * Insider tips
  - Use structured data markup where appropriate
  - Incorporate primary and secondary keywords naturally
  - Include relevant internal linking opportunities
  - Focus on user intent and search relevance
  </section3>
  
  Additional SEO Guidelines:
  1. Use proper header hierarchy (H1 → H2 → H3)
  2. Include relevant schema markup for restaurants
  3. Optimize for featured snippets
  4. Use descriptive alt text for any images
  5. Incorporate long-tail keywords naturally
  6. Ensure mobile-friendly formatting
  7. Include local SEO elements (neighborhood, landmarks)
  8. Add FAQ section for common queries
  
  Output should prioritize both user experience and search engine visibility while maintaining natural, engaging writing style.`;

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
