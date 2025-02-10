const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

/**
 * make_img 폴더 내 파일들을 삭제하는 함수
 * @returns {Promise<void>}
 */
function clearMakeImgFolder() {
  return new Promise((resolve, reject) => {
    const folderPath = path.join(__dirname, "make_img");
    fs.readdir(folderPath, (err, files) => {
      if (err) {
        // 폴더가 없으면 그냥 resolve
        if (err.code === "ENOENT") {
          console.log("make_img 폴더가 존재하지 않습니다.");
          return resolve();
        }
        return reject(err);
      }

      // 폴더 내 파일들을 삭제하는 Promise 배열 생성
      const deletePromises = files.map((file) => {
        return new Promise((res, rej) => {
          const filePath = path.join(folderPath, file);
          fs.unlink(filePath, (unlinkErr) => {
            if (unlinkErr) {
              console.error(`파일 삭제 실패: ${file}`, unlinkErr);
              return rej(unlinkErr);
            }
            console.log(`파일 삭제 완료: ${file}`);
            res();
          });
        });
      });

      Promise.all(deletePromises)
        .then(() => resolve())
        .catch(reject);
    });
  });
}

/**
 * 지정한 스크립트를 실행하는 Promise 기반 함수
 * @param {string} script - 실행할 스크립트 파일 경로 (예: 'step1_croll.js')
 * @returns {Promise<void>}
 */
function runScript(script) {
  return new Promise((resolve, reject) => {
    exec(`node ${script}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing ${script}: ${error.message}`);
        return reject(error);
      }
      if (stderr) {
        console.error(`Stderr from ${script}: ${stderr}`);
      }
      console.log(`Output from ${script}:\n${stdout}`);
      resolve();
    });
  });
}

/**
 * 모든 스크립트를 순차적으로 실행하는 메인 함수
 */
async function runAllScripts() {
  try {
    console.log("make_img 폴더의 파일을 삭제하는 중...");
    await clearMakeImgFolder();
    console.log("make_img 폴더가 깨끗하게 정리되었습니다.");

    console.log("Running step1_croll.js...");
    await runScript("step1_croll.js");

    console.log("Running step2_img.js...");
    await runScript("step2_img.js");

    console.log("Running step3_uploadimg.js...");
    await runScript("step3_uploadimg.js");

    console.log("Running step4_makeContent.js...");
    await runScript("step4_makeContent.js");

    console.log("Running step5_merged.js...");
    await runScript("step5_merged.js");

    console.log("Running step6_postJson.js...");
    await runScript("step6_postJson.js");

    console.log("Running step7_postWordpress.js...");
    await runScript("step7_postWordpress.js");

    console.log("모든 스크립트 실행 완료");
  } catch (error) {
    console.error("스크립트 실행 중 오류 발생:", error);
  }
}

runAllScripts();
