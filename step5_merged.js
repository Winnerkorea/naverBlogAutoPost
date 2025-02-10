const fs = require("fs");
const path = require("path");

// 파일 경로 설정
const OUTPUT_FILE = path.join(__dirname, "output.json");
const UPLOAD_FILE = path.join(__dirname, "upload_results.json");
const MERGED_FILE = path.join(__dirname, "merged_output.json");

// output.json 파일 읽기 및 파싱 (각 객체는 { "content": { "<맛집이름>": { ... } } } 형식)
let outputData = JSON.parse(fs.readFileSync(OUTPUT_FILE, "utf8"));

// upload_results.json 파일 읽기 및 파싱 (배열 형식)
const uploadResults = JSON.parse(fs.readFileSync(UPLOAD_FILE, "utf8"));

// 객체의 개수가 동일한지 확인
if (outputData.length !== uploadResults.length) {
  console.error(
    "output.json과 upload_results.json의 객체 수가 다릅니다.",
    `output.json: ${outputData.length}, upload_results.json: ${uploadResults.length}`
  );
  process.exit(1);
}

// outputData의 각 객체에 대해 uploadResults의 url 값을 imgURL에 추가
outputData.forEach((item, index) => {
  // 각 item은 { "content": { "<맛집이름>": { ... } } } 형식으로 구성됨
  const contentKeys = Object.keys(item.content);
  if (contentKeys.length > 0) {
    const restaurantName = contentKeys[0];
    // upload_results의 해당 인덱스의 url 값을 imgURL로 설정
    item.content[restaurantName].imgURL = uploadResults[index].url;
  }
});

// 병합된 데이터를 merged_output.json 파일로 저장
fs.writeFileSync(MERGED_FILE, JSON.stringify(outputData, null, 2), "utf8");
console.log("병합된 파일이 생성되었습니다:", MERGED_FILE);
