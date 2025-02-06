project/
├── src/
│ ├── login/
│ │ └── login.js // 로그인 관련 함수와 Puppeteer 코드
│ ├── image/
│ │ └── imageUpload.js // 이미지 업로드, 세션키 획득 등 이미지 관련 기능
│ ├── document/
│ │ └── documentModel.js // 문서 모델 생성, 컴포넌트 구성 함수 등
│ ├── network/
│ │ └── apiClient.js // 네트워크 요청, 토큰 획득, 자동저장, 게시글 발행 함수 등
│ ├── utils/
│ │ ├── xmlParser.js // XML 파싱 관련 유틸 함수
│ │ ├── logger.js // 공통 로깅 함수(에러 처리, 디버깅용)
│ │ └── common.js // 랜덤 시간, 사용자 에이전트 관련 함수 등
│ └── main.js // 전체 플로우(로그인, 이미지 업로드, 게시글 발행) 제어
├── config/
│ └── .env // 환경 변수
├── test/ // 단위 테스트, 통합 테스트 파일
└── package.json
