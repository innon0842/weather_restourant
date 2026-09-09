# Weather Eat (웨더잇)

> 실시간 날씨와 사용자 위치를 바탕으로 지금 가기 좋은 식당을 추천하고 예약까지 연결하는 지도 애플리케이션

Weather Eat은 기온, 강수, 하늘 상태, 시간대와 식당까지의 거리를 함께 반영해 주변 식당의 적합도를 계산합니다. 사용자는 카카오 지도에서 추천 결과를 비교하고, 원하는 식당의 상세 정보를 확인한 뒤 예약할 수 있습니다.

## 주요 기능

- 현재 위치 또는 검색 지역을 기준으로 주변 식당 탐색
- 날씨·시간대·거리 기반 식당 적합도 점수와 추천 이유 제공
- 한식, 중식, 일식, 양식, 카페 등 카테고리 필터링
- 카카오 지도 마커, 지도 이동 후 재검색, 검색 반경 조절
- 회원가입·로그인, 프로필 이미지와 닉네임 관리
- 식당 예약 생성 및 내 예약 조회
- 기상청 단기·중기예보와 대기 중금속 데이터 표시

## 기술 스택

| 영역 | 기술 |
| --- | --- |
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS 4 |
| Backend | NestJS 11, TypeScript, TypeORM |
| Database | PostgreSQL 16 |
| Authentication | JWT, bcrypt |
| External APIs | Kakao Maps/Local API, 공공데이터포털 기상·대기 데이터 |
| Infrastructure | Docker, Docker Compose |

## 프로젝트 구조

```text
weather-eat/
├── README.md                # 프로젝트 요약과 실행 방법
├── .gitignore               # 비밀정보·빌드 결과 제외
├── docs/                    # 설계·시연·기술 문서
│   ├── ARCHITECTURE.md
│   ├── RECOMMENDATION_LOGIC.md
│   ├── DEMO_SCENARIO.md
│   ├── ENGINEERING_NOTES.md
│   ├── GITHUB_PUBLISHING.md
│   └── API_SPECIFICATION.md
├── client/                  # Next.js 웹 애플리케이션
│   ├── app/                 # 페이지 및 날씨 API 프록시
│   ├── components/          # 지도·추천·예약 UI
│   ├── hooks/               # 인증·지도·추천 상태 로직
│   └── types/               # 공통 TypeScript 타입
└── server/                  # NestJS API 서버
    ├── src/auth/            # 회원가입·로그인·JWT 인증
    ├── src/restaurants/     # 식당 조회·추천·클릭 기록
    ├── src/reservations/    # 예약 생성·조회
    ├── src/users/           # 사용자·프로필 관리
    └── src/weather/         # 기상·대기 데이터 연동
```

## 추천 방식

서버는 카카오 Local API에서 검색한 식당에 기본 점수를 부여한 뒤 다음 조건을 합산합니다.

1. 비·눈, 맑음, 더위, 추위 등 현재 날씨와 음식 태그의 일치도
2. 아침·점심·저녁 시간대와 식당 태그의 일치도
3. 사용자와 식당 사이의 거리 가중치

계산된 점수와 추천 이유를 함께 반환하고, 검색 반경 안의 식당을 점수순으로 정렬합니다.

## 로컬 실행

### 준비 사항

- Node.js 20 이상
- Docker 및 Docker Compose
- Kakao Developers의 JavaScript 키와 REST API 키
- 공공데이터포털에서 발급받은 서비스 키

### 1. 환경변수 설정

```bash
cp client/.env.example client/.env.local
cp server/.env.example server/.env
```

복사한 파일에 본인의 API 키와 로컬 설정값을 입력합니다. `.env`와 `.env.local`은 Git에 포함되지 않습니다.

### 2. 서버 실행

```bash
cd server
npm ci
docker compose up -d postgres-db
npm run start:dev
```

API 서버는 기본적으로 `http://localhost:4000`에서 실행됩니다.

### 3. 클라이언트 실행

```bash
cd client
npm ci
npm run dev
```

브라우저에서 `http://localhost:3000`을 엽니다.

## 문서

- [시스템 아키텍처](docs/ARCHITECTURE.md)
- [추천 로직](docs/RECOMMENDATION_LOGIC.md)
- [데모 시나리오](docs/DEMO_SCENARIO.md)
- [설계 결정과 기술적 한계](docs/ENGINEERING_NOTES.md)
- [GitHub 게시 안내](docs/GITHUB_PUBLISHING.md)
- [API 명세](docs/API_SPECIFICATION.md)

## 공개 저장소 안내

이 포트폴리오 복사본에는 의존성, 빌드 결과, 로컬 환경변수, 업로드 파일과 개발 도구 전용 지침을 포함하지 않았습니다. API 키는 환경변수로만 주입해야 합니다.
