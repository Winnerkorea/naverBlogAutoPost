const axios = require("axios");
const fs = require("fs");

const a = [
  // 종로구 (Jongno-gu)
  "종로구 사직동",
  "종로구 청운동",
  "종로구 평창동",
  "종로구 교남동",
  "종로구 교북동",
  "종로구 가회동",
  "종로구 종로",
  "종로구 혜화동",
  "종로구 창신동",
  "종로구 숭인동",
  "종로구 부암동",
  "종로구 삼청동",
  "종로구 익선동",
  "종로구 누상동",
  "종로구 누하동",

  // 중구 (Jung-gu)
  "중구 소공동",
  "중구 회현동",
  "중구 묘동",
  "중구 충무동",
  "중구 필동",
  "중구 장충동",
  "중구 을지로동",
  "중구 신당동",
  "중구 남산동",
  "중구 청파동",
  "중구 광희동",

  // 서대문구 (Seodaemun-gu)
  "서대문구 남가좌동",
  "서대문구 북가좌동",
  "서대문구 홍제동",
  "서대문구 신촌동",
  "서대문구 연희동",
  "서대문구 홍은동",
  "서대문구 창천동",
  "서대문구 남문동",
  "서대문구 북문동",
  "서대문구 충현동",

  // 동대문구 (Dongdaemun-gu)
  "동대문구 신설동",
  "동대문구 용두동",
  "동대문구 전농동",
  "동대문구 답십리동",
  "동대문구 장안동",
  "동대문구 이문동",
  "동대문구 제기동",
  "동대문구 휘경동",
  "동대문구 용신동",

  // 성북구 (Seongbuk-gu)
  "성북구 동선동",
  "성북구 동소문동",
  "성북구 보문동",
  "성북구 삼선동",
  "성북구 석관동",
  "성북구 정릉동",
  "성북구 길음동",
  "성북구 종암동",
  "성북구 안암동",
  "성북구 돈암동",
];

const b = [
  "쭈꾸미",
  "곱창",
  "국밥",
  "삼겹살",
  "치킨",
  "피자",
  "파스타",
  "라멘",
  "돈까스",
  "초밥",
  "짬뽕",
  "짜장면",
  "탕수육",
  "마라탕",
  "샤브샤브",
  "부대찌개",
  "김치찌개",
  "삼계탕",
  "갈비탕",
  "냉면",
  "빙수",
  "떡볶이",
  "순대",
  "족발",
  "보쌈",
  "칼국수",
  "수제비",
  "만두",
  "햄버거",
  "스테이크",
  "바비큐",
  "곰탕",
  "설렁탕",
  "쌀국수",
  "칼비빔국수",
  "잔치국수",
  "우동",
  "튀김",
  "모둠회",
  "전골",
  "찜닭",
  "떡갈비",
  "해물탕",
  "아구찜",
  "조개찜",
  "간장게장",
  "양념게장",
  "김밥",
  "비빔밥",
  "된장찌개",
  "육회",
  "회덮밥",
  "낙지볶음",
  "감자탕",
  "순두부찌개",
  "고등어구이",
  "갈치구이",
  "오징어볶음",
  "장어구이",
  "닭도리탕",
  "깐풍기",
  "닭갈비",
  "제육볶음",
  "족발보쌈",
  "홍어삼합",
  "물회",
  "육개장",
  "토마토파스타",
  "크림파스타",
  "봉골레파스타",
  "떡국",
  "부침개",
  "빈대떡",
  "연어초밥",
  "계란찜",
  "순살치킨",
  "닭꼬치",
  "고추장불고기",
  "달걀말이",
  "미역국",
  "뼈해장국",
  "돼지갈비",
  "오리백숙",
  "소갈비",
  "전복죽",
  "김치볶음밥",
  "잡채",
  "찐만두",
  "갈비찜",
  "라볶이",
  "동파육",
  "오코노미야키",
  "타코야끼",
  "크로켓",
  "타르트",
  "티라미수",
  "마카롱",
  "크레페",
  "샌드위치",
  "호떡",
];

const maxResults = 3; // 원하는 결과 수 (사용자가 설정)
const maxAttempts = 5; // 최대 시도 횟수

function getRandomKeyword() {
  const randomLocation = a[Math.floor(Math.random() * a.length)];
  const randomFood = b[Math.floor(Math.random() * b.length)];
  return `${randomLocation} ${randomFood}`;
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
      ); // 이미지가 있는 항목만 필터링
      if (items.length === 0) {
        break; // 더 이상 결과가 없으면 루프 종료
      }
      allResults.push(...items);
      start += display; // 다음 페이지로 이동
    } else {
      console.log("Error in response or no more results");
      break;
    }

    // 1~2초 사이의 랜덤한 시간 동안 대기
    const sleepTime = Math.random() * 1000 + 1000; // 1000 ~ 2000 밀리초
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
    return str; // 디코딩에 실패하면 원래 문자열을 반환
  }
}

function processResults(results, searchQuery) {
  return results.map((item, index) => ({
    keyword: searchQuery,
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

async function attemptSearch() {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const searchQuery = getRandomKeyword();
    console.log(`Attempt ${attempt}: Searching for "${searchQuery}"`);

    const results = await getAllResults(searchQuery);
    if (results.length > 0) {
      const randomResults = [];
      while (randomResults.length < maxResults && results.length > 0) {
        const randomIndex = Math.floor(Math.random() * results.length);
        randomResults.push(results.splice(randomIndex, 1)[0]); // 랜덤하게 선택하고 결과에서 제거
      }
      const processedResults = processResults(randomResults, searchQuery);

      const fileName = `result.json`;
      fs.writeFileSync(fileName, JSON.stringify(processedResults, null, 2));
      console.log(`Results saved to ${fileName}`);

      processedResults.forEach((item) => {
        console.log(`순위: ${item.rank}`);
        console.log(`검색어: ${item.keyword}`);
        console.log(`이름: ${item.name}`);
        console.log(`카테고리: ${item.category}`);
        console.log(`주소: ${item.roadAddress}`);
        console.log(`영업시간: ${item.businessHours}`);
        console.log(`전화번호: ${item.virtualPhone || item.phone || "없음"}`);
        console.log();
      });
      return; // 성공적으로 결과를 얻었으면 종료
    }

    console.log("No results found, trying a new keyword...");
  }

  console.log("All attempts failed to find results.");
}

attemptSearch();
