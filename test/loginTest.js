// test/loginTest.js
require("dotenv").config();

const USER_ID = process.env.NAVER_USER_ID;
const USER_PASSWORD = process.env.NAVER_USER_PASSWORD;

const runLogin = require("../src/login/runLogin");
const headlessMode = true; // 화면을 보고 디버깅 시 false로 설정함.

(async () => {
  await runLogin(USER_ID, USER_PASSWORD, headlessMode);
})();

console.log("Login and session save");
