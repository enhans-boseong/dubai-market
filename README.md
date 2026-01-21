## interpolation.ts 의 역할은 뭐야??

⏺ interpolation.ts는 A2UI에서 데이터 바인딩을 처리하는 핵심 유틸리티입니다.

주요 역할

1. JSON Pointer 경로 해석

데이터 모델에서 값을 읽고 쓸 때 사용합니다.

// 데이터 모델
const dataModel = {
user: { name: "홍길동", age: 30 },
products: [{ name: "쿠키", price: 5000 }]
};

// 경로로 값 가져오기
getValueByPath(dataModel, "/user/name")     // → "홍길동"
getValueByPath(dataModel, "/products/0/price") // → 5000

2. 문자열 보간 (String Interpolation)

${/path} 구문을 실제 값으로 치환합니다.

// A2UI JSON에서 이렇게 정의하면:
{ "type": "Text", "text": "안녕하세요, ${/user/name}님!" }

// 렌더링 시 이렇게 변환됨:
"안녕하세요, 홍길동님!"

3. 양방향 바인딩 지원

TextField 같은 입력 컴포넌트에서 사용자 입력을 데이터 모델에 저장합니다.

// TextField에서 dataPath="/form/name" 설정 시
// 사용자가 입력하면 자동으로 dataModel.form.name이 업데이트됨
setValueByPath(dataModel, "/form/name", "새 값")

왜 필요한가?

A2UI는 선언적 JSON이므로 실행 코드가 없습니다. 대신 ${/path} 같은 바인딩 표현식으로 동적 데이터를 표시하고, 이를 해석하는 것이 interpolation.ts의 역할입니다.


## parser.ts 는 무슨 역할이니

⏺ parser.ts는 AI가 생성한 A2UI JSON을 파싱하고 검증하는 역할입니다.

주요 역할

1. JSON 파싱

AI 응답에서 A2UI 메시지를 추출합니다.

// AI가 이런 텍스트를 반환하면:
const aiResponse = `
  여기 UI입니다:
  {"type": "createSurface", "surfaceId": "main"}
  {"type": "updateComponents", "surfaceId": "main", "components": [...]}
  `;

// parser가 A2UI 메시지만 추출
extractA2UIMessages(aiResponse)
// → [{ type: "createSurface", ... }, { type: "updateComponents", ... }]

2. JSONL 포맷 지원

A2UI는 스트리밍을 위해 JSONL(줄바꿈으로 구분된 JSON)을 사용합니다.

// JSONL 형식
const jsonl = `
  {"type": "createSurface", "surfaceId": "s1"}
  {"type": "updateComponents", "surfaceId": "s1", "components": [...]}
  `;

parseJSONL(jsonl) // → 메시지 배열로 변환

3. 메시지 검증

유효한 A2UI 메시지인지 확인합니다.

// 유효한 메시지 타입만 허용:
// - createSurface
// - updateComponents
// - updateDataModel
// - deleteSurface

// 잘못된 형식은 걸러냄
isValidA2UIMessage({ type: "unknown" }) // → false

왜 필요한가?

AI(GPT)가 항상 완벽한 JSON만 반환하지 않습니다. 텍스트 설명과 JSON이 섞여 있거나, 형식이 약간 다를 수 있어서 안전하게 파싱하고 검증하는 레이어가 필요합니다.



## A2UI 메시지 구조

A2UI는 4가지 메시지 타입으로 UI를 제어합니다.

  ---
1. surfaceId - UI 영역 식별자

Surface는 UI가 렌더링되는 독립적인 영역입니다. 하나의 앱에 여러 Surface가 존재할 수 있어요.

{
"surfaceId": "order-flow"  // 이 Surface의 고유 ID
}

예: 채팅앱에서 각 대화창이 별도의 Surface가 될 수 있음

  ---
2. type - 메시지 타입
   ┌──────────────────┬────────────────────┐
   │       type       │        역할        │
   ├──────────────────┼────────────────────┤
   │ createSurface    │ 새 UI 영역 생성    │
   ├──────────────────┼────────────────────┤
   │ updateComponents │ 컴포넌트 추가/수정 │
   ├──────────────────┼────────────────────┤
   │ updateDataModel  │ 데이터 업데이트    │
   ├──────────────────┼────────────────────┤
   │ deleteSurface    │ UI 영역 삭제       │
   └──────────────────┴────────────────────┘
  ---
3. components - UI 컴포넌트 배열

컴포넌트는 트리 구조로 구성됩니다.

{
"type": "updateComponents",
"surfaceId": "order-flow",
"components": [
{
"id": "root",           // 컴포넌트 고유 ID
"type": "Column",       // 컴포넌트 타입
"childIds": ["title", "button"]  // 자식 컴포넌트 참조
},
{
"id": "title",
"type": "Text",
"text": "안녕하세요!",
"parentId": "root"
},
{
"id": "button",
"type": "Button",
"label": "클릭",
"parentId": "root",
"action": {
"type": "sendAction",
"actionId": "onButtonClick"
}
}
]
}

렌더링 결과:
┌─────────────────┐
│  안녕하세요!      │  ← Text
│  [클릭]          │  ← Button
└─────────────────┘

  ---
4. dataModel - 동적 데이터

UI에 바인딩할 데이터를 정의합니다.

{
"type": "updateDataModel",
"surfaceId": "order-flow",
"dataModel": {
"user": { "name": "홍길동" },
"cart": { "total": 15000 }
}
}

컴포넌트에서 이렇게 참조:
{ "type": "Text", "text": "${/user/name}님, 총 ${/cart/total}원입니다." }
// → "홍길동님, 총 15000원입니다."

  ---
전체 플로우 예시

// 1. Surface 생성
{ "type": "createSurface", "surfaceId": "shop", "rootId": "main" }

// 2. 데이터 설정
{ "type": "updateDataModel", "surfaceId": "shop", "dataModel": { "product": { "name": "쿠키", "price": 5000 } } }

// 3. UI 컴포넌트 정의
{ "type": "updateComponents", "surfaceId": "shop", "components": [
{ "id": "main", "type": "Card", "childIds": ["name", "price"] },
{ "id": "name", "type": "Text", "text": "${/product/name}" },
{ "id": "price", "type": "Text", "text": "${/product/price}원" }
]}


## Surface란?

Surface = UI가 렌더링되는 독립적인 컨테이너

각 Surface는 자체적인 컴포넌트 트리와 데이터 모델을 가집니다.

  ---
예시: 쇼핑몰 채팅봇

┌─────────────────────────────────────────┐
│  AI: 어떤 상품을 찾으시나요?              │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  Surface: "product-list"        │   │  ← Surface 1
│  │  ┌───────┐ ┌───────┐ ┌───────┐  │   │
│  │  │ 쿠키  │ │ 케이크 │ │ 초콜릿 │  │   │
│  │  │ 5000원│ │ 8000원│ │ 3000원│  │   │
│  │  └───────┘ └───────┘ └───────┘  │   │
│  └─────────────────────────────────┘   │
│                                         │
│  AI: 쿠키를 선택하셨네요!                 │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  Surface: "order-form"          │   │  ← Surface 2
│  │  이름: [___________]            │   │
│  │  연락처: [___________]          │   │
│  │  [주문하기]                      │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘

왜 분리하나?
┌──────────────┬──────────────┬─────────────────────────┐
│   Surface    │     역할     │         데이터          │
├──────────────┼──────────────┼─────────────────────────┤
│ product-list │ 상품 목록 UI │ { products: [...] }     │
├──────────────┼──────────────┼─────────────────────────┤
│ order-form   │ 주문 폼 UI   │ { form: { name, tel } } │
└──────────────┴──────────────┴─────────────────────────┘
- 각 Surface를 독립적으로 생성/삭제/업데이트 가능
- 대화 흐름에 따라 Surface를 추가하거나 제거

// 상품 목록 Surface 삭제
{ "type": "deleteSurface", "surfaceId": "product-list" }

// 주문 완료 Surface 생성
{ "type": "createSurface", "surfaceId": "order-complete" }


## 아까 했던 interpolate.ts 와 data-model.ts 가 크게 다르지 않다는느낌인데 뭐가다른거지?

⏺ 좋은 질문이에요! 둘의 역할을 비교해드릴게요.

핵심 차이
┌──────────────────┬───────────────────────────────────────┬───────────────────┐
│       파일       │                 역할                  │       레벨        │
├──────────────────┼───────────────────────────────────────┼───────────────────┤
│ interpolation.ts │ 저수준 유틸리티 - 경로로 값 읽기/쓰기 │ 단일 객체 조작    │
├──────────────────┼───────────────────────────────────────┼───────────────────┤
│ data-model.ts    │ 고수준 관리자 - Surface별 상태 관리   │ 전체 앱 상태 관리 │
└──────────────────┴───────────────────────────────────────┴───────────────────┘
  ---
interpolation.ts - 순수 유틸리티

// 단순히 객체에서 경로로 값을 읽고 쓰는 함수들
getValueByPath(obj, "/user/name")     // 값 읽기
setValueByPath(obj, "/user/name", "홍길동")  // 값 쓰기
interpolateString("${/user/name}님", obj)    // 문자열 치환

Surface를 모름 - 그냥 객체 하나를 다룸

  ---
data-model.ts - 상태 관리자

// 여러 Surface의 데이터를 관리
const state = {
"product-list": { products: [...] },
"order-form": { form: { name: "", tel: "" } },
"cart": { items: [], total: 0 }
};

// Surface별로 데이터 조작
updateSurfaceDataModel(state, "cart", { total: 5000 })
setDataModelValue(state, "order-form", "/form/name", "홍길동")
deleteSurfaceDataModel(state, "product-list")

Surface를 인식 - 앱 전체의 여러 Surface 데이터를 관리

  ---
관계

data-model.ts (고수준)
│
│ 내부적으로 사용
▼
interpolation.ts (저수준)

data-model.ts가 interpolation.ts의 함수를 내부적으로 호출해서 실제 값 조작을 수행합니다.

  ---
실제로 data-model.ts를 없애고 interpolation.ts만 써도 되지만, Surface별 관리 로직이 여기저기 흩어지게 됩니다. 분리해두면 상태 관리가 깔끔해져요.