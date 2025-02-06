// src/login/runLogin.js
const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");

// 세션 정보를 저장할 파일 경로
const SESSION_FILE = path.join(process.cwd(), "session", "session.json");

/**
 * 브라우저를 실행하고 옵션을 설정합니다.
 */
async function startBrowser(headlessMode) {
  try {
    const browser = await puppeteer.launch({
      headless: headlessMode, // 테스트 시 디버깅을 위해 false로 설정
      ignoreHTTPSErrors: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-infobars",
        "--disable-blink-features=AutomationControlled",
        "--ignore-certificate-errors",
      ],
    });
    console.log("브라우저 실행 성공");
    return browser;
  } catch (error) {
    console.error("브라우저 실행 중 오류 발생:", error);
    throw error;
  }
}

async function autoPopup(page) {
  page.on("dialog", async (dialog) => {
    try {
      await dialog.accept();
      console.log("팝업 자동 수락");
    } catch (error) {
      console.error("팝업 처리 중 오류:", error);
    }
  });
}

async function makeBrowserNice(page) {
  try {
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, "webdriver", {
        get: () => false,
      });
    });
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"
    );
    console.log("브라우저 속성 설정 완료");
  } catch (error) {
    console.error("브라우저 속성 설정 중 오류:", error);
    throw error;
  }
}

async function typeRandomly(page, selector, text) {
  try {
    await page.click(selector);
    for (const char of text) {
      await page.type(selector, char, { delay: Math.random() * 120 + 30 });
    }
    console.log(`텍스트 입력 완료: ${text}`);
  } catch (error) {
    console.error(`텍스트 입력 중 오류 (selector: ${selector}):`, error);
    throw error;
  }
}

async function performLogin(page, userId, userPassword) {
  try {
    const loginUrl =
      "https://nid.naver.com/nidlogin.login?mode=form&url=https://www.naver.com";
    await page.goto(loginUrl, { waitUntil: "networkidle2" });
    await page.waitForSelector("#id");
    await typeRandomly(page, "#id", userId);
    await page.waitForSelector("#pw");
    await typeRandomly(page, "#pw", userPassword);
    await page.keyboard.press("Enter");
    console.log("로그인 시도 중...");
    await page.waitForNavigation({ waitUntil: "networkidle2" });
    console.log("로그인 성공");
  } catch (error) {
    console.error("로그인 중 오류 발생:", error);
    throw error;
  }
}

async function saveUserSession(page, userId) {
  try {
    const cookies = await page.cookies();
    const sessionData = { userId, cookies };

    // SESSION_FILE의 디렉터리가 존재하는지 확인하고, 없으면 생성
    const sessionDir = path.dirname(SESSION_FILE);
    if (!fs.existsSync(sessionDir)) {
      fs.mkdirSync(sessionDir, { recursive: true });
      console.log(`세션 디렉터리를 생성했습니다: ${sessionDir}`);
    }

    fs.writeFileSync(
      SESSION_FILE,
      JSON.stringify(sessionData, null, 2),
      "utf8"
    );
    console.log(`세션 정보가 저장되었습니다: ${SESSION_FILE}`);
  } catch (error) {
    console.error("세션 저장 중 오류 발생:", error);
    throw error;
  }
}

/**
 * 네이버 로그인 플로우를 실행하는 함수.
 * @param {string} userId - 네이버 사용자 아이디
 * @param {string} userPassword - 네이버 사용자 비밀번호
 */
async function runLogin(userId, userPassword, headlessMode) {
  let browser;
  try {
    browser = await startBrowser(headlessMode);
    const page = await browser.newPage();

    await autoPopup(page);
    await makeBrowserNice(page);

    console.log("네이버 로그인을 시작합니다...");
    await performLogin(page, userId, userPassword);

    await saveUserSession(page, userId);
    console.log("로그인 테스트 완료");
  } catch (error) {
    console.error("로그인 플로우 실행 중 오류 발생:", error);
  } finally {
    if (browser) {
      await browser.close();
      console.log("브라우저 종료");
    }
    process.exit();
  }
}

module.exports = runLogin;
