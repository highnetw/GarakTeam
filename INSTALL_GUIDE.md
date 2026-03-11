# GrakTeamApp 설치 및 빌드 가이드

## ✅ 검증 완료
- SDK 54.0.32 (최신 안정 버전)
- 모든 필수 패키지 포함
- State 기반 네비게이션 (React Navigation 없음)
- 문법 오류 없음

## 📦 1단계: 프로젝트 설정

### Windows 탐색기에서:
1. `GrakTeamApp_CLEAN.tar.gz` 압축 해제
2. `C:\Projects\` 폴더에 압축 해제된 `GrakTeamApp` 폴더 이동
3. 기존 `C:\Projects\GrakTeamApp` 폴더가 있으면 먼저 삭제 또는 이름 변경

### 터미널에서:
```bash
# 프로젝트 폴더로 이동
cd C:\Projects\GrakTeamApp

# 패키지 설치 (3-5분 소요)
npm install
```

## 🚀 2단계: APK 빌드

### EAS 로그인 (이미 했다면 생략):
```bash
eas login
```
- 이메일: bokinwoo@gmail.com
- 비밀번호 입력

### 빌드 시작:
```bash
eas build -p android --profile preview
```

**예상 소요 시간:** 20-30분

**빌드 완료 시:**
```
✔ Build finished
📦 Download URL: https://expo.dev/artifacts/eas/xxxxx.apk
```

## 📱 3단계: APK 다운로드 & 설치

### 방법 1: 갤럭시에서 직접
1. 위 다운로드 URL을 갤럭시 브라우저에서 열기
2. APK 다운로드
3. "알 수 없는 앱 설치" 허용
4. 설치 클릭
5. **설치 완료 후 홈 화면으로**
6. **앱 서랍에서 GrakTeamApp 찾아서 실행**

### 방법 2: 컴퓨터 경유
1. 컴퓨터에서 다운로드
2. USB로 갤럭시에 전송
3. 갤럭시에서 파일 앱 → 다운로드 폴더
4. APK 설치

## 🔧 문제 해결

### 빌드 실패 시:
```bash
# 캐시 정리 후 재빌드
eas build -p android --profile preview --clear-cache
```

### 패키지 설치 오류 시:
```bash
# node_modules 삭제 후 재설치
rmdir /s /q node_modules
del package-lock.json
npm install
```

## 📋 프로젝트 구조

```
GrakTeamApp/
├── App.js                      # 메인 앱 (State 기반 네비게이션)
├── screens/
│   ├── HomeScreen.js          # 홈 화면 (3개 메뉴)
│   ├── AddMeetingScreen.js    # 새 모임 입력
│   ├── ViewMeetingsScreen.js  # 모임 보기 (2열 그리드)
│   └── EditMeetingScreen.js   # 모임 수정/삭제
├── package.json               # 패키지 목록
├── app.json                   # Expo 설정
└── assets/                    # 아이콘/이미지
```

## 🎯 주요 기능

1. **새 모임 입력**
   - 날짜, 식당, 비용, 인원
   - 갤러리에서 이미지 선택
   - AsyncStorage에 저장

2. **과거 모임 보기**
   - 2열 그리드 레이아웃
   - 날짜 기준 최신순 정렬
   - 탭하면 상세 정보

3. **과거 모임 수정**
   - 모임 선택 → 정보 수정
   - 삭제 기능 포함

## 💡 다음 단계 (선택사항)

이 버전은 **로컬 저장 버전**입니다. 각 사용자가 독립적으로 데이터를 관리합니다.

**친구들과 데이터를 공유하려면:**
- Firebase 버전으로 업그레이드 필요
- 실시간 동기화 가능
- 무료 (6명 사용 기준)

## 📞 도움말

빌드 중 문제가 발생하면:
1. Expo 웹사이트에서 빌드 로그 확인
   https://expo.dev/accounts/bokinwoo/projects/GrakTeamApp/builds

2. 최근 빌드 클릭 → "View logs" → 오류 메시지 확인

## ✨ 이 버전의 특징

- ✅ 최신 Expo SDK 54
- ✅ React Navigation 없음 (단순 State 기반)
- ✅ 모든 필수 패키지 포함
- ✅ Gradle 호환성 검증됨
- ✅ 바로 빌드 가능

---

**제작일:** 2026-01-24
**버전:** 1.0.0
**테스트:** 검증 완료
