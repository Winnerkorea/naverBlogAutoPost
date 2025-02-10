const fs = require("fs");
const path = require("path");

// 파일 경로 설정
const RESULT_FILE = path.join(__dirname, "result.json");
const OUTPUT_FILE = path.join(__dirname, "merged_output.json");
const POSTS_FILE = path.join(__dirname, "posts.json");

// merged_output.json 파일 읽기
// merged_output.json 파일은 각 맛집의 콘텐츠가 담긴 객체들이 배열 형태로 저장되어 있다고 가정합니다.
// result.json 파일 읽기 및 파싱
const resultData = JSON.parse(fs.readFileSync(RESULT_FILE, "utf8"));

// 키워드 추출 및 분리
const keywordItem = Object.values(resultData).find((item) => item.keyword);
const keyword = keywordItem ? keywordItem.keyword : "";
const [location, foodName] = keyword.split(" ");

// 유효한 keyword를 가진 항목 수 계산
const restaurantCount = Object.values(resultData).filter(
  (item) => item.keyword
).length;

const outputData = JSON.parse(fs.readFileSync(OUTPUT_FILE, "utf8"));

// 제목 템플릿 목록 (여러 템플릿을 포함)
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

const introTemplates = [
  `${location}의 대표 ${foodName} 맛집 ${restaurantCount}곳을 엄선해 소개합니다. 생생한 후기가 함께하는 미식 여행, 지금 시작해 보세요.`,
  `${location}에서 추천하는 ${foodName} 맛집 ${restaurantCount}곳! 한 번 맛보면 잊지 못할 특별한 경험을 선사합니다.`,
  `${location}의 숨겨진 ${foodName} 맛집 ${restaurantCount}곳을 소개합니다. 감성 넘치는 공간과 맛있는 메뉴가 기다리고 있어요.`,
  `${location} 토박이들이 꼽은 ${foodName} 맛집 ${restaurantCount}곳! 현지인들의 생생한 추천 후기를 확인해 보세요.`,
  `${location}의 인기 ${foodName} 맛집 ${restaurantCount}곳, 각각의 개성과 맛이 돋보이는 특별한 장소들을 만나보세요.`,
  `${location} 미식가들이 사랑하는 ${foodName} 맛집 ${restaurantCount}곳을 소개합니다. 따뜻한 분위기와 맛의 조화가 매력적입니다.`,
  `${location}의 매력적인 ${foodName} 맛집 ${restaurantCount}곳! 맛과 멋이 어우러진 공간에서 특별한 경험을 즐겨보세요.`,
  `${location}에서 꼭 방문해야 할 ${foodName} 맛집 ${restaurantCount}곳! 정성스런 리뷰와 함께하는 미식 탐험을 시작해 보세요.`,
  `${location}의 감성을 자극하는 ${foodName} 맛집 ${restaurantCount}곳을 소개합니다. 아늑한 분위기와 특별한 메뉴가 돋보입니다.`,
  `${location}의 독특한 분위기를 자랑하는 ${foodName} 맛집 ${restaurantCount}곳! 맛있는 이야기와 함께하는 미식 여행을 즐겨보세요.`,
  `${location}에서 추천하는 감각적인 ${foodName} 맛집 ${restaurantCount}곳, 한 번의 방문으로 추억을 만들 수 있는 곳들을 만나보세요.`,
  `${location} 현지인들이 극찬하는 ${foodName} 맛집 ${restaurantCount}곳을 소개합니다. 세련된 인테리어와 향긋한 맛의 향연이 기다립니다.`,
  `${location}의 다양한 매력을 느낄 수 있는 ${foodName} 맛집 ${restaurantCount}곳! 특별한 맛과 분위기를 한 자리에서 즐겨보세요.`,
  `${location}에서 찾은 최고의 ${foodName} 맛집 ${restaurantCount}곳을 소개합니다. 맛과 멋이 공존하는 공간에서 즐거운 시간을 보내세요.`,
  `${location}의 이색적인 ${foodName} 맛집 ${restaurantCount}곳! 매력 넘치는 후기가 함께하는 미식 여행, 지금 바로 시작해 보세요.`,
  `${location}의 핫플레이스 ${foodName} 맛집 ${restaurantCount}곳을 엄선하여 소개합니다. 당신의 미각을 사로잡을 특별한 맛집 리스트입니다.`,
  `${location}에서 경험하는 새로운 미식, ${foodName} 맛집 ${restaurantCount}곳을 추천합니다. 감각적인 리뷰와 함께 특별한 맛을 즐기세요.`,
  `${location}의 인기 맛집, ${foodName} 맛집 ${restaurantCount}곳! 현지인 추천과 생생한 후기가 어우러진 미식 여행을 즐겨보세요.`,
  `${location}에서 꼭 가봐야 할 ${foodName} 맛집 ${restaurantCount}곳! 감동적인 맛과 분위기가 어우러진 장소들을 만나보세요.`,
  `${location}의 다채로운 맛을 느낄 수 있는 ${foodName} 맛집 ${restaurantCount}곳을 소개합니다. 매력적인 후기와 함께 미식의 세계로 초대합니다.`,
];

// 최종 JSON 객체 구성
const posts = {
  mainTitle: titleTemplates[Math.floor(Math.random() * titleTemplates.length)], // 원하는 메인 타이틀로 수정하세요.
  mainIntro: introTemplates[Math.floor(Math.random() * introTemplates.length)], // 원하는 메인 소개글로 수정하세요.
  restaurants: outputData, // outputData 배열의 각 항목은 { "content": { "맛집이름": { ... } } } 형식이어야 합니다.
};

console.log("Main Title:", posts.mainTitle);
console.log("Main Intro:", posts.mainIntro);
// posts.json 파일로 저장 (들여쓰기 2칸으로 보기 좋게 저장)

fs.writeFileSync(POSTS_FILE, JSON.stringify(posts, null, 2), "utf8");

console.log("posts.json 파일이 생성되었습니다!");
