# GitHub Publishing

## 권장 저장소 정보

- Repository name: `weather-eat`
- Description: `실시간 날씨와 위치를 기반으로 주변 식당을 추천하고 예약까지 연결하는 지도 앱`
- Topics: `nextjs`, `nestjs`, `typescript`, `postgresql`, `kakao-map`, `weather-api`, `restaurant-recommendation`

## 게시 전 확인

다음 파일과 폴더가 포함되지 않았는지 확인합니다.

- `.env`, `.env.local`
- `node_modules`, `.next`, `dist`
- `uploads`
- API 키, JWT Secret, 실제 데이터베이스 비밀번호

원본 프로젝트의 코드나 Git 기록에 실제 키가 들어간 적이 있다면 파일에서 지우는 것만으로는 충분하지 않습니다. 먼저 해당 키를 폐기하고 새 키를 발급해야 합니다.

## 새 저장소로 게시

`weather-eat` 폴더에서 다음 명령을 실행합니다.

```bash
git init
git add .
git status
git commit -m "chore: add weather eat portfolio project"
git branch -M main
git remote add origin https://github.com/<github-username>/weather-eat.git
git push -u origin main
```

`git status`에서 환경변수나 빌드 결과가 보이면 커밋하지 말고 `.gitignore`를 먼저 확인합니다.

## GitHub 화면 구성

1. 저장소 설명과 Topics를 등록합니다.
2. 서비스 대표 화면이 있다면 README의 주요 기능 아래에 추가합니다.
3. 배포 주소가 준비되면 저장소 About의 Website와 README 상단에 연결합니다.
4. `docs/DEMO_SCENARIO.md`를 따라 실제 동작을 보여주는 GIF 또는 짧은 영상을 추가합니다.

## 추천 공개 순서

1. 민감정보 재발급 및 제외 확인
2. 로컬 빌드와 테스트 확인
3. README와 문서 링크 확인
4. GitHub 저장소 게시
5. 배포 주소와 대표 이미지 추가

