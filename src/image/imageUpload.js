// src/image/imageUpload.js
/**
 * @file image/imageUpload.js
 * @description 네이버 이미지 업로드 관련 API 호출 및 결과 처리를 담당합니다.
 *              세션키 획득 및 이미지 업로드 후 XML 응답을 파싱하여 결과를 반환합니다.
 */

const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");
const xml2js = require("xml2js");

const BASE_URL = "https://blog.naver.com";
const BLOG_FILES_URL = "https://blogfiles.pstatic.net";

/**
 * XML 문자열을 파싱하여 JavaScript 객체로 변환합니다.
 * @param {string} xml - 파싱할 XML 문자열
 * @returns {Promise<Object>} 파싱된 객체
 */
function parseXML(xml) {
  return new Promise((resolve, reject) => {
    xml2js.parseString(xml, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
}

/**
 * 이미지 업로드 세션키를 획득합니다.
 * @param {string} token - 네이버 API에서 발행받은 토큰 (Authorization token)
 * @param {string} userId - 네이버 사용자 아이디 (매개변수)
 * @returns {Promise<string>} 세션키
 */
async function getSessionKey(token, userId) {
  const config = {
    method: "get",
    url: "https://platform.editor.naver.com/api/blogpc001/v1/photo-uploader/session-key",
    headers: {
      Accept: "application/json",
      "accept-language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
      origin: BASE_URL,
      referer: `${BASE_URL}/${userId}/postwrite`,
      "se-authorization": token,
    },
  };

  try {
    const response = await axios(config);
    if (response.data && response.data.sessionKey) {
      console.log("세션키 획득 성공:", response.data.sessionKey);
      return response.data.sessionKey;
    } else {
      throw new Error("세션키를 획득할 수 없습니다.");
    }
  } catch (error) {
    console.error("세션키 획득 중 오류 발생:", error);
    throw error;
  }
}

/**
 * 단일 이미지 파일을 업로드합니다.
 * @param {string} sessionKey - 이미지 업로드 세션키
 * @param {string} imagePath - 업로드할 이미지 파일의 경로
 * @param {string} userId - 네이버 사용자 아이디 (매개변수)
 * @returns {Promise<Object>} 업로드된 이미지의 메타 정보
 */
async function uploadImage(sessionKey, imagePath, userId) {
  // 이미지 파일 존재 여부 및 확장자 검증
  if (!fs.existsSync(imagePath)) {
    throw new Error(`이미지 파일이 존재하지 않습니다: ${imagePath}`);
  }

  const ext = path.extname(imagePath).toLowerCase();
  const validExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
  if (!validExtensions.includes(ext)) {
    throw new Error(`지원되지 않는 이미지 확장자입니다: ${ext}`);
  }

  const formData = new FormData();
  formData.append("image", fs.createReadStream(imagePath), {
    filename: path.basename(imagePath),
    contentType: `image/${ext.slice(1)}`,
  });

  const config = {
    method: "post",
    url: `https://blog.upphoto.naver.com/${sessionKey}/simpleUpload/0?userId=${userId}&extractExif=true&extractAnimatedCnt=true&autorotate=true&extractDominantColor=false&type=&customQuery=&denyAnimatedImage=false&skipXcamFiltering=false`,
    headers: {
      ...formData.getHeaders(),
      Accept: "*/*",
      "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
      Origin: BASE_URL,
      Referer: `${BASE_URL}/${userId}/postwrite`,
    },
    data: formData,
  };

  try {
    const response = await axios(config);
    const parsedXML = await parseXML(response.data);
    const item = parsedXML.item;
    if (!item) {
      throw new Error("XML 응답에서 업로드 항목을 찾을 수 없습니다.");
    }
    const result = {
      url: `${BLOG_FILES_URL}${item.url[0]}`,
      path: `${item.path[0]}/${item.fileName[0]}`,
      fileSize: parseInt(item.fileSize[0]),
      width: parseInt(item.width[0]),
      height: parseInt(item.height[0]),
      originalWidth: parseInt(item.width[0]),
      originalHeight: parseInt(item.height[0]),
      fileName: item.fileName[0],
      thumbnail: `${BLOG_FILES_URL}${item.thumbnail[0]}`,
    };
    console.log("이미지 업로드 성공:", result);
    return result;
  } catch (error) {
    console.error("이미지 업로드 중 오류 발생:", error);
    if (error.response) {
      console.error("응답 상태:", error.response.status);
      console.error("응답 데이터:", error.response.data);
    }
    throw error;
  }
}

module.exports = {
  getSessionKey,
  uploadImage,
};
