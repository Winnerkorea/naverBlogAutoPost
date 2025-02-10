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
  `${location}’s Top Authentic ${foodName} Restaurants: BEST ${restaurantCount} Picks in Korea`,
  `Must-Visit Korean ${foodName} Eateries in ${location}: ${restaurantCount} Spots You Can't Miss`,
  `${location} ${foodName} Restaurant Tour: Top ${restaurantCount} Selections in Korea`,
  `Insider’s Guide to Korean ${foodName} in ${location}: ${restaurantCount} Must-Try Spots`,
  `Hidden Gems: Discover ${restaurantCount} Best Korean ${foodName} Restaurants in ${location}`,
  `Local Favorites: ${location}'s Top ${restaurantCount} Korean ${foodName} Restaurants`,
  `Where to Eat Korean ${foodName} in ${location}: ${restaurantCount} Best Picks`,
  `The Ultimate ${location} Korean ${foodName} Showdown: ${restaurantCount} Top Restaurants`,
  `Essential Korean ${foodName} Stops in ${location}: ${restaurantCount} Must-Visit Eateries`,
  `Complete Guide to ${restaurantCount} Top Korean ${foodName} Restaurants in ${location}`,
  `${location} ${foodName} Restaurant Guide: ${restaurantCount} Spots to Savor in Korea`,
  `Discover the Best ${restaurantCount} Korean ${foodName} Restaurants in ${location}`,
  `Top ${restaurantCount} Korean ${foodName} Restaurants in ${location} for Food Lovers`,
  `${location} Food Tour: ${restaurantCount} Must-Try Korean ${foodName} Eateries`,
  `Conquer ${location}'s Korean ${foodName} Scene: ${restaurantCount} Essential Restaurants`,
  `The Best of ${location} Korean ${foodName}: ${restaurantCount} Restaurant Picks`,
  `Your Ultimate Guide to ${restaurantCount} Korean ${foodName} Restaurants in ${location}`,
  `${location} Korean ${foodName} Map: ${restaurantCount} Top Restaurant Destinations`,
  `${location} Dining: ${restaurantCount} Unforgettable Korean ${foodName} Restaurants`,
  `Top Rated Korean ${foodName} Restaurants in ${location}: ${restaurantCount} Best Choices`,
  `Experience Korean ${foodName} in ${location}: ${restaurantCount} Must-Visit Restaurants`,
  `The Definitive ${location} Korean ${foodName} Restaurant List: ${restaurantCount} Picks`,
  `${location} Korean ${foodName} Hotspots: ${restaurantCount} Eateries for Foodies`,
  `A Culinary Journey Through ${location}: ${restaurantCount} Korean ${foodName} Restaurants`,
  `Explore ${location}'s Korean ${foodName} Scene: ${restaurantCount} Restaurant Recommendations`,
  `Best Korean ${foodName} in ${location}: ${restaurantCount} Restaurants Reviewed`,
  `${location} Eats: ${restaurantCount} Top Korean ${foodName} Spots You Need to Try`,
  `${location} Korean ${foodName} Guide: ${restaurantCount} Restaurants for a Gourmet Experience`,
  `${location} Food Finds: ${restaurantCount} Must-Try Korean ${foodName} Restaurants`,
  `Ultimate Korean ${foodName} Restaurant Guide in ${location}: ${restaurantCount} Picks`,
];

const introTemplates = [
  `Discover the top ${restaurantCount} must-visit Korean ${foodName} restaurants in ${location}, handpicked for their authentic flavors and vibrant ambiance. Start your culinary journey through Korea now!`,
  `Recommended in ${location}, Korea: ${restaurantCount} outstanding Korean ${foodName} restaurants that promise an unforgettable dining experience.`,
  `Uncover ${restaurantCount} hidden Korean ${foodName} gems in ${location}. Experience the perfect blend of traditional taste and modern flair waiting to be explored.`,
  `Rated by locals in ${location}, Korea: ${restaurantCount} Korean ${foodName} restaurants with genuine reviews from residents.`,
  `Explore ${restaurantCount} popular Korean ${foodName} spots in ${location} where each venue boasts unique charm and delectable cuisine.`,
  `For food lovers in ${location}, Korea: Enjoy ${restaurantCount} Korean ${foodName} restaurants celebrated for their cozy ambiance and impeccable flavors.`,
  `Experience the charm of ${location} with ${restaurantCount} enticing Korean ${foodName} restaurants, where tradition meets innovation.`,
  `Don't miss these ${restaurantCount} essential Korean ${foodName} restaurants in ${location} – begin your culinary adventure with detailed local reviews.`,
  `Stimulate your senses with ${restaurantCount} Korean ${foodName} restaurants in ${location} offering inviting atmospheres and exceptional dishes.`,
  `Embrace the unique vibe of ${location}, Korea with ${restaurantCount} standout Korean ${foodName} restaurants, paired with delightful stories and reviews.`,
  `Recommended by locals in ${location}: ${restaurantCount} trendy Korean ${foodName} restaurants that guarantee memorable dining experiences.`,
  `Experience rave reviews for ${restaurantCount} top Korean ${foodName} restaurants in ${location} – where stylish interiors meet authentic flavors.`,
  `Discover ${restaurantCount} diverse Korean ${foodName} restaurants in ${location} offering a perfect balance of taste and atmosphere.`,
  `We've curated the best ${restaurantCount} Korean ${foodName} restaurants in ${location} to ensure a delightful dining experience.`,
  `Embark on a culinary adventure in ${location} with ${restaurantCount} unique Korean ${foodName} restaurants that captivate your senses.`,
  `Our handpicked selection of ${restaurantCount} must-try Korean ${foodName} restaurants in ${location} is here to satisfy your cravings.`,
  `Experience a new wave of dining in ${location}, Korea with these ${restaurantCount} recommended Korean ${foodName} restaurants, complete with in-depth local reviews.`,
  `Indulge in the best of ${location} with ${restaurantCount} highly-rated Korean ${foodName} restaurants, as vouched for by locals.`,
  `A must-see list: ${restaurantCount} Korean ${foodName} restaurants in ${location} where exceptional taste and ambiance converge.`,
  `Explore the rich flavors of Korean ${foodName} in ${location} with our guide to ${restaurantCount} exquisite restaurants.`,
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
