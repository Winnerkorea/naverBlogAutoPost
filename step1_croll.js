const axios = require("axios");
const fs = require("fs");

const a = [
  // 종로구 (Jongno-gu)
  { kr: "종로구 사직동", en: "Sajik-dong, Jongno-gu" },
  { kr: "종로구 청운동", en: "Cheongun-dong, Jongno-gu" },
  { kr: "종로구 평창동", en: "Pyeongchang-dong, Jongno-gu" },
  { kr: "종로구 교남동", en: "Gyonam-dong, Jongno-gu" },
  { kr: "종로구 교북동", en: "Gyobuk-dong, Jongno-gu" },
  { kr: "종로구 가회동", en: "Gahoe-dong, Jongno-gu" },
  { kr: "종로구 종로", en: "Jongno, Jongno-gu" },
  { kr: "종로구 혜화동", en: "Hyehwa-dong, Jongno-gu" },
  { kr: "종로구 창신동", en: "Changsin-dong, Jongno-gu" },
  { kr: "종로구 숭인동", en: "Sungin-dong, Jongno-gu" },
  { kr: "종로구 부암동", en: "Buam-dong, Jongno-gu" },
  { kr: "종로구 삼청동", en: "Samcheong-dong, Jongno-gu" },
  { kr: "종로구 익선동", en: "Ikseon-dong, Jongno-gu" },
  { kr: "종로구 누상동", en: "Nusang-dong, Jongno-gu" },
  { kr: "종로구 누하동", en: "Nuha-dong, Jongno-gu" },

  // 중구 (Jung-gu)
  { kr: "중구 소공동", en: "Sogong-dong, Jung-gu" },
  { kr: "중구 회현동", en: "Hoehyeon-dong, Jung-gu" },
  { kr: "중구 묘동", en: "Myo-dong, Jung-gu" },
  { kr: "중구 충무동", en: "Chungmu-dong, Jung-gu" },
  { kr: "중구 필동", en: "Pil-dong, Jung-gu" },
  { kr: "중구 장충동", en: "Jangchung-dong, Jung-gu" },
  { kr: "중구 을지로동", en: "Euljiro-dong, Jung-gu" },
  { kr: "중구 신당동", en: "Sindang-dong, Jung-gu" },
  { kr: "중구 남산동", en: "Namsan-dong, Jung-gu" },
  { kr: "중구 청파동", en: "Cheongpa-dong, Jung-gu" },
  { kr: "중구 광희동", en: "Gwanghui-dong, Jung-gu" },

  // 서대문구 (Seodaemun-gu)
  { kr: "서대문구 남가좌동", en: "Namgajwa-dong, Seodaemun-gu" },
  { kr: "서대문구 북가좌동", en: "Bukgajwa-dong, Seodaemun-gu" },
  { kr: "서대문구 홍제동", en: "Hongje-dong, Seodaemun-gu" },
  { kr: "서대문구 신촌동", en: "Sinchon-dong, Seodaemun-gu" },
  { kr: "서대문구 연희동", en: "Yeonhui-dong, Seodaemun-gu" },
  { kr: "서대문구 홍은동", en: "Hongeun-dong, Seodaemun-gu" },
  { kr: "서대문구 창천동", en: "Changcheon-dong, Seodaemun-gu" },
  { kr: "서대문구 남문동", en: "Nammun-dong, Seodaemun-gu" },
  { kr: "서대문구 북문동", en: "Bukmun-dong, Seodaemun-gu" },
  { kr: "서대문구 충현동", en: "Chunghyeon-dong, Seodaemun-gu" },

  // 동대문구 (Dongdaemun-gu)
  { kr: "동대문구 신설동", en: "Sinseol-dong, Dongdaemun-gu" },
  { kr: "동대문구 용두동", en: "Yongdu-dong, Dongdaemun-gu" },
  { kr: "동대문구 전농동", en: "Jeonnong-dong, Dongdaemun-gu" },
  { kr: "동대문구 답십리동", en: "Dapsimni-dong, Dongdaemun-gu" },
  { kr: "동대문구 장안동", en: "Jangan-dong, Dongdaemun-gu" },
  { kr: "동대문구 이문동", en: "Imun-dong, Dongdaemun-gu" },
  { kr: "동대문구 제기동", en: "Jegi-dong, Dongdaemun-gu" },
  { kr: "동대문구 휘경동", en: "Hwigyeong-dong, Dongdaemun-gu" },
  { kr: "동대문구 용신동", en: "Yongsin-dong, Dongdaemun-gu" },

  // 성북구 (Seongbuk-gu)
  { kr: "성북구 동선동", en: "Dongseon-dong, Seongbuk-gu" },
  { kr: "성북구 동소문동", en: "Dongsomun-dong, Seongbuk-gu" },
  { kr: "성북구 보문동", en: "Bomun-dong, Seongbuk-gu" },
  { kr: "성북구 삼선동", en: "Samseon-dong, Seongbuk-gu" },
  { kr: "성북구 석관동", en: "Seokgwan-dong, Seongbuk-gu" },
  { kr: "성북구 정릉동", en: "Jeongneung-dong, Seongbuk-gu" },
  { kr: "성북구 길음동", en: "Gireum-dong, Seongbuk-gu" },
  { kr: "성북구 종암동", en: "Jongam-dong, Seongbuk-gu" },
  { kr: "성북구 안암동", en: "Anam-dong, Seongbuk-gu" },
  { kr: "성북구 돈암동", en: "Donam-dong, Seongbuk-gu" },
];

const b = [
  { kr: "쭈꾸미", en: "Jjukkumi" },
  { kr: "곱창", en: "Gopchang" },
  { kr: "국밥", en: "Gukbap" },
  { kr: "삼겹살", en: "Samgyeopsal" },
  { kr: "치킨", en: "Chicken" },
  { kr: "피자", en: "Pizza" },
  { kr: "파스타", en: "Pasta" },
  { kr: "라멘", en: "Ramen" },
  { kr: "돈까스", en: "Donkatsu" },
  { kr: "초밥", en: "Sushi" },
  { kr: "짬뽕", en: "Jjamppong" },
  { kr: "짜장면", en: "Jajangmyeon" },
  { kr: "탕수육", en: "Sweet and Sour Pork" },
  { kr: "마라탕", en: "Mala Tang" },
  { kr: "샤브샤브", en: "Shabu-Shabu" },
  { kr: "부대찌개", en: "Budae Jjigae" },
  { kr: "김치찌개", en: "Kimchi Stew" },
  { kr: "삼계탕", en: "Samgyetang" },
  { kr: "갈비탕", en: "Galbitang" },
  { kr: "냉면", en: "Naengmyeon" },
  { kr: "빙수", en: "Bingsu" },
  { kr: "떡볶이", en: "Tteokbokki" },
  { kr: "순대", en: "Sundae" },
  { kr: "족발", en: "Jokbal" },
  { kr: "보쌈", en: "Bossam" },
  { kr: "칼국수", en: "Kalguksu" },
  { kr: "수제비", en: "Sujebi" },
  { kr: "만두", en: "Mandu" },
  { kr: "햄버거", en: "Hamburger" },
  { kr: "스테이크", en: "Steak" },
  { kr: "바비큐", en: "Barbecue" },
  { kr: "곰탕", en: "Gomtang" },
  { kr: "설렁탕", en: "Seolleongtang" },
  { kr: "쌀국수", en: "Rice Noodle Soup" },
  { kr: "칼비빔국수", en: "Kalbi Bibim Guksu" },
  { kr: "잔치국수", en: "Janchi Guksu" },
  { kr: "우동", en: "Udon" },
  { kr: "튀김", en: "Tempura" },
  { kr: "모둠회", en: "Assorted Sashimi" },
  { kr: "전골", en: "Jeongol" },
  { kr: "찜닭", en: "Jjimdak" },
  { kr: "떡갈비", en: "Tteokgalbi" },
  { kr: "해물탕", en: "Seafood Stew" },
  { kr: "아구찜", en: "Braised Anglerfish" },
  { kr: "조개찜", en: "Steamed Clams" },
  { kr: "간장게장", en: "Soy Sauce Marinated Crab" },
  { kr: "양념게장", en: "Spicy Marinated Crab" },
  { kr: "김밥", en: "Gimbap" },
  { kr: "비빔밥", en: "Bibimbap" },
  { kr: "된장찌개", en: "Doenjang Jjigae" },
  { kr: "육회", en: "Yukhoe" },
  { kr: "회덮밥", en: "Hwedupbap" },
  { kr: "낙지볶음", en: "Stir-fried Octopus" },
  { kr: "감자탕", en: "Gamjatang" },
  { kr: "순두부찌개", en: "Sundubu Jjigae" },
  { kr: "고등어구이", en: "Grilled Mackerel" },
  { kr: "갈치구이", en: "Grilled Hairtail" },
  { kr: "오징어볶음", en: "Stir-fried Squid" },
  { kr: "장어구이", en: "Grilled Eel" },
  { kr: "닭도리탕", en: "Dakdoritang" },
  { kr: "깐풍기", en: "Spicy Fried Chicken" },
  { kr: "닭갈비", en: "Dakgalbi" },
  { kr: "제육볶음", en: "Stir-fried Pork" },
  { kr: "족발보쌈", en: "Jokbal & Bossam" },
  { kr: "홍어삼합", en: "Hongeo Samhap" },
  { kr: "물회", en: "Mulhoe" },
  { kr: "육개장", en: "Yukgaejang" },
  { kr: "토마토파스타", en: "Tomato Pasta" },
  { kr: "크림파스타", en: "Cream Pasta" },
  { kr: "봉골레파스타", en: "Vongole Pasta" },
  { kr: "떡국", en: "Rice Cake Soup" },
  { kr: "부침개", en: "Buchimgae" },
  { kr: "빈대떡", en: "Bindaetteok" },
  { kr: "연어초밥", en: "Salmon Sushi" },
  { kr: "계란찜", en: "Steamed Egg" },
  { kr: "순살치킨", en: "Boneless Chicken" },
  { kr: "닭꼬치", en: "Chicken Skewer" },
  { kr: "고추장불고기", en: "Gochujang Bulgogi" },
  { kr: "달걀말이", en: "Rolled Egg" },
  { kr: "미역국", en: "Seaweed Soup" },
  { kr: "뼈해장국", en: "Bone Soup" },
  { kr: "돼지갈비", en: "Pork Ribs" },
  { kr: "오리백숙", en: "Duck Soup" },
  { kr: "소갈비", en: "Beef Short Ribs" },
  { kr: "전복죽", en: "Abalone Porridge" },
  { kr: "김치볶음밥", en: "Kimchi Fried Rice" },
  { kr: "잡채", en: "Japchae" },
  { kr: "찐만두", en: "Steamed Dumplings" },
  { kr: "갈비찜", en: "Braised Short Ribs" },
  { kr: "라볶이", en: "Rabokki" },
  { kr: "동파육", en: "Dongpo Pork" },
  { kr: "오코노미야키", en: "Okonomiyaki" },
  { kr: "타코야끼", en: "Takoyaki" },
  { kr: "크로켓", en: "Croquette" },
  { kr: "타르트", en: "Tart" },
  { kr: "티라미수", en: "Tiramisu" },
  { kr: "마카롱", en: "Macaron" },
  { kr: "크레페", en: "Crepe" },
  { kr: "샌드위치", en: "Sandwich" },
  { kr: "호떡", en: "Hotteok" },
];

const maxResults = 3; // 원하는 결과 수 (사용자가 설정)
const maxAttempts = 5; // 최대 시도 횟수

// getRandomKeyword: 한글 검색어와 영어 정보(locationEn, foodEn)를 함께 생성
function getRandomKeyword() {
  const randomLocIndex = Math.floor(Math.random() * a.length);
  const randomFoodIndex = Math.floor(Math.random() * b.length);

  const locationKr = a[randomLocIndex].kr;
  const locationEn = a[randomLocIndex].en;
  const foodKr = b[randomFoodIndex].kr;
  const foodEn = b[randomFoodIndex].en;

  return {
    keyword: `${locationKr} ${foodKr}`,
    keywordEn: `${locationEn} ${foodEn}`, // 영어 검색어 추가
    locationEn: locationEn,
    foodEn: foodEn,
  };
}

async function makeRequest(start, display, searchQuery) {
  try {
    const response = await axios.post(
      "https://pcmap-api.place.naver.com/graphql",
      [
        {
          operationName: "getPlacesList",
          variables: {
            input: {
              query: searchQuery,
              start: start,
              display: display,
              adult: false,
              spq: false,
              x: "127.15545300000178",
              y: "37.613981999999794",
              deviceType: "pcmap",
              bounds:
                "127.13549736493127;37.586270920726705;127.17626694195758;37.6410031070355",
            },
            isNmap: true,
            isBounds: true,
          },
          query: `
                query getPlacesList($input: PlacesInput, $isNmap: Boolean!, $isBounds: Boolean!) {
                    businesses: places(input: $input) {
                        total
                        items {
                            id
                            name
                            normalizedName
                            category
                            x
                            y
                            distance
                            roadAddress
                            address
                            imageUrl
                            imageCount
                            phone
                            virtualPhone
                            businessHours
                            markerLabel @include(if: $isNmap) {
                                text
                                style
                            }
                        }
                        optionsForMap @include(if: $isBounds) {
                            maxZoom
                            minZoom
                            includeMyLocation
                            maxIncludePoiCount
                            center
                        }
                    }
                }
                `,
        },
      ],
      {
        headers: {
          accept: "*/*",
          "accept-language": "ko",
          "content-type": "application/json",
          origin: "https://pcmap.place.naver.com",
          referer: `https://pcmap.place.naver.com/place/list?query=${encodeURIComponent(
            searchQuery
          )}&x=127.15545300000178&y=37.613981999999794&clientX=127.024568&clientY=37.257788`,
          "user-agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36",
          cookie:
            "NNB=I76AM5NEV2XGM; ASID=7622f440000001912116cc9c00000079; NID_AUT=MdyM7WTqUVDE22yVHPIVSXIqg/oCW4f9emfLVfK6xvD6dkync5sPj2R+1thgacXQ;",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error:", error.message);
    return null;
  }
}

async function getAllResults(searchQuery) {
  let start = 1;
  const display = 70;
  const allResults = [];

  while (allResults.length < maxResults) {
    const response = await makeRequest(start, display, searchQuery);
    if (response && response[0].data.businesses.items) {
      const items = response[0].data.businesses.items.filter(
        (item) => item.imageUrl
      );
      if (items.length === 0) break;
      allResults.push(...items);
      start += display;
    } else {
      console.log("Error in response or no more results");
      break;
    }
    const sleepTime = Math.random() * 1000 + 1000;
    console.log(`Waiting for ${sleepTime / 1000} seconds...`);
    await new Promise((resolve) => setTimeout(resolve, sleepTime));
  }

  console.log(`Total results with images: ${allResults.length}`);
  return allResults;
}

function safeDecodeURIComponent(str) {
  try {
    return decodeURIComponent(str);
  } catch (e) {
    console.error(`Failed to decode: ${str}`);
    return str;
  }
}

function safeDecodeURIComponent(str) {
  try {
    return decodeURIComponent(str);
  } catch (e) {
    console.error(`Failed to decode: ${str}`);
    return str; // 디코딩에 실패하면 원래 문자열을 반환
  }
}

// processResults: 결과에 keyword, keywordEn, locationEn, foodEn 추가
function processResults(results, keyword, keywordEn, locationEn, foodEn) {
  return results.map((item, index) => ({
    keyword: keyword,
    keywordEn: keywordEn, // 영어 검색어 추가
    locationEn: locationEn,
    foodEn: foodEn,
    id: item.id,
    name: safeDecodeURIComponent(item.name),
    normalizedName: safeDecodeURIComponent(item.normalizedName),
    category: safeDecodeURIComponent(item.category),
    x: item.x,
    y: item.y,
    distance: item.distance,
    roadAddress: safeDecodeURIComponent(item.roadAddress),
    address: safeDecodeURIComponent(item.address),
    imageUrl: item.imageUrl,
    imageCount: item.imageCount,
    phone: item.phone,
    virtualPhone: item.virtualPhone,
    businessHours: item.businessHours
      ? safeDecodeURIComponent(item.businessHours)
      : null,
    rank: index + 1,
  }));
}

// attemptSearch: 검색어와 영어 정보를 함께 전달하여 결과 처리
async function attemptSearch() {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    // keywordEn도 함께 받아오기 위해 구조분해 할당 수정
    const { keyword, keywordEn, locationEn, foodEn } = getRandomKeyword();
    console.log(`Attempt ${attempt}: Searching for "${keyword}"`);

    const results = await getAllResults(keyword);
    if (results.length > 0) {
      const randomResults = [];
      while (randomResults.length < maxResults && results.length > 0) {
        const randomIndex = Math.floor(Math.random() * results.length);
        randomResults.push(results.splice(randomIndex, 1)[0]);
      }
      // keywordEn을 추가하여 processedResults 생성
      const processedResults = processResults(
        randomResults,
        keyword,
        keywordEn,
        locationEn,
        foodEn
      );

      const fileName = `result.json`;
      fs.writeFileSync(fileName, JSON.stringify(processedResults, null, 2));
      console.log(`Results saved to ${fileName}`);

      processedResults.forEach((item) => {
        console.log(`순위: ${item.rank}`);
        console.log(`검색어: ${item.keyword}`);
        console.log(`검색어영문: ${item.keywordEn}`);
        console.log(`영문 지역(locationEn): ${item.locationEn}`);
        console.log(`영문 음식(foodEn): ${item.foodEn}`);
        console.log(`이름: ${item.name}`);
        console.log(`카테고리: ${item.category}`);
        console.log(`주소: ${item.roadAddress}`);
        console.log(`영업시간: ${item.businessHours}`);
        console.log(`전화번호: ${item.virtualPhone || item.phone || "없음"}`);
        console.log();
      });
      return;
    }

    console.log("No results found, trying a new keyword...");
  }

  console.log("All attempts failed to find results.");
}

attemptSearch();
