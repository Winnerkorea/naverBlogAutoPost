const fs = require("fs");
const path = require("path");
const axios = require("axios");
const { marked } = require("marked"); // marked 모듈: 마크다운을 HTML로 변환
require("dotenv").config();

// 환경변수 설정
const WORDPRESS_SITE_URL = process.env.WORDPRESS_SITE_URL; // 예: "https://your-wordpress-site.com"
const WORDPRESS_USERNAME = process.env.WORDPRESS_USERNAME;
const WORDPRESS_PASSWORD = process.env.WORDPRESS_PASSWORD;
const WORDPRESS_CATEGORY_ID = process.env.WORDPRESS_CATEGORY_ID; // 예: "5"
const WORDPRESS_POST_STATUS = process.env.WORDPRESS_POST_STATUS || "publish";

// WordPress REST API 엔드포인트
const WP_POSTS_API_URL = `${WORDPRESS_SITE_URL}/wp-json/wp/v2/posts`;
const WP_MEDIA_API_URL = `${WORDPRESS_SITE_URL}/wp-json/wp/v2/media`;

// posts.json 파일 경로 설정
const POSTS_FILE = path.join(__dirname, "posts.json");

// posts.json 파일 읽기 및 파싱
let postsData;
try {
  postsData = JSON.parse(fs.readFileSync(POSTS_FILE, "utf8"));
} catch (err) {
  console.error("posts.json 파일 읽기 오류:", err);
  process.exit(1);
}

console.log("Main Title:", postsData.mainTitle);
console.log("Main Intro:", postsData.mainIntro);

/**
 * 파일 확장자에 따른 Content-Type 반환
 * @param {string} ext - 파일 확장자 (예: ".webp", ".jpg", ".png")
 * @returns {string} Content-Type 문자열
 */
function getContentType(ext) {
  switch (ext.toLowerCase()) {
    case ".webp":
      return "image/webp";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".png":
      return "image/png";
    default:
      return "application/octet-stream";
  }
}

/**
 * 지정된 이미지 URL을 WordPress 미디어 라이브러리에 업로드하고 미디어 ID를 반환하는 함수
 * @param {string} imageUrl - 업로드할 이미지 URL
 * @returns {number|null} - 업로드된 미디어의 ID (실패 시 null)
 */
async function uploadFeaturedImage(imageUrl) {
  try {
    // 이미지 데이터를 바이너리 형식으로 다운로드
    const imageResponse = await axios.get(imageUrl, {
      responseType: "arraybuffer",
    });
    // 파일 확장자 추출 (예: .webp)
    const ext = path.extname(imageUrl) || ".jpg";
    const fileName = "featured_image" + ext;
    const contentType = getContentType(ext);

    // 미디어 업로드 요청 (바디는 이미지 데이터)
    const mediaResponse = await axios.post(
      WP_MEDIA_API_URL,
      imageResponse.data,
      {
        headers: {
          "Content-Disposition": `attachment; filename="${fileName}"`,
          "Content-Type": contentType,
        },
        auth: {
          username: WORDPRESS_USERNAME,
          password: WORDPRESS_PASSWORD,
        },
      }
    );
    console.log(
      `이미지 업로드 성공: ${fileName}, 미디어 ID: ${mediaResponse.data.id}`
    );
    return mediaResponse.data.id;
  } catch (err) {
    console.error(
      "이미지 업로드 실패:",
      err.response ? err.response.data : err.message
    );
    return null;
  }
}

/**
 * WordPress REST API를 통해 하나의 포스트를 생성하는 함수
 * - 포스트 제목: postsData.mainTitle
 * - 포스트 상단 소개: postsData.mainIntro
 * - 본문 내용: restaurants 배열의 각 맛집 콘텐츠를 순차적으로 추가하며, 리뷰 부분은 마크다운을 HTML로 변환
 * - restaurants 배열의 첫 번째 맛집 이미지를 썸네일(Featured Image)로 업로드 후 설정
 */
async function autoPostSingle() {
  // 본문 상단에 mainIntro 추가
  let postContent = `<p>${postsData.mainIntro}</p>`;

  // restaurants 배열의 각 맛집 정보를 순회하며 본문에 추가
  postsData.restaurants.forEach((restaurantObj) => {
    // 각 객체는 { content: { "<맛집이름>": { intro, Review, roadAddress, map, imgURL } } } 형식임
    const restaurantNames = Object.keys(restaurantObj.content);
    if (restaurantNames.length === 0) return;
    const restaurantName = restaurantNames[0];
    const contentData = restaurantObj.content[restaurantName];

    // 마크다운 형식의 리뷰를 HTML로 변환 (marked 또는 marked.parse() 사용)
    // 1번 방식 (marked() 사용)
    const reviewHTML = marked(contentData.Review || "");
    // 2번 방식 (marked.parse() 사용)
    // const reviewHTML = marked.parse(contentData.Review || "");

    postContent += `
      <hr />
      <h3>${restaurantName}</h3>
      <p>${contentData.intro}</p>
      <p><img src="${contentData.imgURL}" alt="${restaurantName}" style="max-width:100%;" /></p>
      <div>${reviewHTML}</div>
      <p><strong>주소:</strong> ${contentData.roadAddress}</p>
      <p><a href="${contentData.map}" target="_blank">지도 보기</a></p>
        <iframe 
    src=https://www.google.com/maps/embed?hl=en&pb=!1m17!1m12!1m3!1d3166.176272673723!2d${contentData.longitude}!3d${contentData.latitude}!2m3!1f0!2f0!3f0!3m2!1sen!2sUS!4f13.1!3m2!1m1!2zMzfCsDI4JzQ4LjYiTiAxMjfCsDA3JzA5LjAiRQ!5e0!3m2!1sen!2sUS!4v1739162272250!5m2!1sen!2sU"
    width="600" 
    height="450" 
    style="border:0;" 
    allowfullscreen="" 
    loading="lazy" 
    referrerpolicy="no-referrer-when-downgrade">
  </iframe>
    `;
  });

  // restaurants 배열의 첫 번째 맛집의 첫 번째 이미지 URL을 썸네일로 사용
  let featuredMediaID = null;
  if (postsData.restaurants.length > 0) {
    const firstRestaurantObj = postsData.restaurants[0];
    const firstRestaurantNames = Object.keys(firstRestaurantObj.content);
    if (firstRestaurantNames.length > 0) {
      const firstRestaurantName = firstRestaurantNames[0];
      const firstImageUrl =
        firstRestaurantObj.content[firstRestaurantName].imgURL;
      if (firstImageUrl) {
        featuredMediaID = await uploadFeaturedImage(firstImageUrl);
      }
    }
  }

  try {
    const response = await axios.post(
      WP_POSTS_API_URL,
      {
        title: postsData.mainTitle,
        content: postContent,
        status: WORDPRESS_POST_STATUS,
        categories: [parseInt(WORDPRESS_CATEGORY_ID)],
        featured_media: featuredMediaID, // 썸네일 이미지 설정
      },
      {
        auth: {
          username: WORDPRESS_USERNAME,
          password: WORDPRESS_PASSWORD,
        },
      }
    );

    console.log(`포스트 생성 성공: ID ${response.data.id}`);
  } catch (error) {
    if (error.response) {
      console.error("포스트 생성 실패:", error.response.data);
    } else {
      console.error("포스트 생성 실패:", error.message);
    }
  }
}

// 자동 포스팅 실행
autoPostSingle();
