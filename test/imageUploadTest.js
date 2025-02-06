// 예시: test/imageUploadTest.js
require("dotenv").config();
const path = require("path");
const { getSessionKey, uploadImage } = require("../src/image/imageUpload");

(async () => {
  try {
    const token = process.env.NAVER_API_TOKEN; // 네이버 API 토큰
    const userId = process.env.NAVER_USER_ID; // 네이버 사용자 아이디 (매개변수로 전달)
    const sessionKey = await getSessionKey(token, userId);
    const imagePath = path.join(process.cwd(), "make_img", "example.jpg");
    const uploadResult = await uploadImage(sessionKey, imagePath, userId);
    console.log("업로드 결과:", uploadResult);
  } catch (error) {
    console.error("테스트 중 오류 발생:", error);
  }
})();
