# 운동 기록

운동 중 땀에 젖은 손으로도 탭만으로 세트 무게/횟수를 기록하는 개인용 웹앱.

## 아이폰에 설치하기

1. Safari로 앱 URL 접속
2. 공유 버튼 → "홈 화면에 추가"
3. 홈 화면 아이콘으로 전체화면 앱처럼 실행됨

## 사용 흐름

종목 탭 → 세트수 탭 → (무게 스테퍼 확인 → 횟수 스테퍼 확인) 반복 → 저장하고 홈으로

- 다음 세트는 이전 세트 무게/횟수가 기본값으로 채워짐 (같은 무게로 계속하는 경우 확인만 계속 탭하면 됨)
- 다음 운동 세션에서 같은 종목을 고르면 지난번 마지막 세트 무게/횟수가 기본값으로 채워짐
- 요약 화면에서 세트를 탭하면 수정 가능

## GitHub 자동 백업 설정 (선택)

1. GitHub에서 별도 **private** 저장소 `workout-data`를 만든다 (기록은 공개 저장소인 이 앱 코드와 분리해서 비공개로 보관)
2. GitHub → Settings → Developer settings → Fine-grained personal access tokens → Generate new token
3. Repository access: **workout-data 저장소만** 선택
4. Permissions: **Contents → Read and write** 만 부여
5. 앱의 ⚙(설정) 화면에서 토큰/사용자명/저장소명(`workout-data`) 입력 후 저장
6. 운동을 저장할 때마다 `log.json`에 자동으로 백업됨

토큰은 이 기기의 브라우저 localStorage에만 저장되며 다른 곳으로 전송되지 않습니다 (GitHub API 호출 외).
