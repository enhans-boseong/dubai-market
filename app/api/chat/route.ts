import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { products } from '@/data/products';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// A2UI JSON Schema 정의
const A2UI_JSON_SCHEMA = `{
  "MessageArray": {
    "type": "array",
    "items": { "$ref": "#/Message" }
  },
  "Message": {
    "oneOf": [
      { "$ref": "#/CreateSurfaceMessage" },
      { "$ref": "#/UpdateComponentsMessage" },
      { "$ref": "#/UpdateDataModelMessage" }
    ]
  },
  "CreateSurfaceMessage": {
    "type": "object",
    "required": ["type", "surfaceId"],
    "properties": {
      "type": { "const": "createSurface" },
      "surfaceId": { "type": "string" },
      "rootId": { "type": "string" }
    }
  },
  "UpdateComponentsMessage": {
    "type": "object",
    "required": ["type", "surfaceId", "components"],
    "properties": {
      "type": { "const": "updateComponents" },
      "surfaceId": { "type": "string" },
      "components": { "type": "array", "items": { "$ref": "#/Component" } }
    }
  },
  "UpdateDataModelMessage": {
    "type": "object",
    "required": ["type", "surfaceId", "dataModel"],
    "properties": {
      "type": { "const": "updateDataModel" },
      "surfaceId": { "type": "string" },
      "dataModel": { "type": "object" }
    }
  },
  "Component": {
    "type": "object",
    "required": ["id", "type"],
    "properties": {
      "id": { "type": "string" },
      "type": { "enum": ["Text", "Button", "Column", "Row", "Card", "TextField", "CheckBox", "Image", "Divider", "List"] },
      "childIds": { "type": "array", "items": { "type": "string" } }
    }
  }
}`;

// UI 템플릿 예시
const PRODUCT_LIST_EXAMPLE = `[
  { "type": "createSurface", "surfaceId": "main", "rootId": "root" },
  { "type": "updateDataModel", "surfaceId": "main", "dataModel": {
    "products": [
      { "id": "dubai-cookie-original", "name": "두바이 쫀득 쿠키 오리지널", "price": 8900, "image": "https://..." }
    ]
  }},
  { "type": "updateComponents", "surfaceId": "main", "components": [
    { "id": "root", "type": "Column", "childIds": ["title", "product-list"], "gap": 16 },
    { "id": "title", "type": "Text", "text": "🍪 두바이 쫀득 쿠키", "variant": "h1" },
    { "id": "product-list", "type": "List", "dataPath": "/products", "itemTemplateId": "product-card-template" },
    { "id": "product-card-template", "type": "Card", "childIds": ["product-row"], "style": { "padding": 16 } },
    { "id": "product-row", "type": "Row", "childIds": ["product-image", "product-info"], "gap": 16 },
    { "id": "product-image", "type": "Image", "src": "\${item.image}", "width": 100, "height": 100 },
    { "id": "product-info", "type": "Column", "childIds": ["product-name", "product-price", "select-btn"], "gap": 8 },
    { "id": "product-name", "type": "Text", "text": "\${item.name}", "variant": "h3" },
    { "id": "product-price", "type": "Text", "text": "\${item.price}원", "variant": "body", "color": "#e11d48" },
    { "id": "select-btn", "type": "Button", "label": "선택하기", "variant": "primary", "action": { "type": "sendAction", "actionId": "selectProduct", "payload": { "productId": "\${item.id}" } } }
  ]}
]`;

const CHECKOUT_FORM_EXAMPLE = `[
  { "type": "createSurface", "surfaceId": "main", "rootId": "root" },
  { "type": "updateDataModel", "surfaceId": "main", "dataModel": {
    "selectedProduct": { "name": "두바이 쫀득 쿠키 오리지널", "price": 8900 },
    "form": { "name": "", "phone": "", "address": "" }
  }},
  { "type": "updateComponents", "surfaceId": "main", "components": [
    { "id": "root", "type": "Column", "childIds": ["product-summary", "divider", "form-section", "submit-btn"], "gap": 24 },
    { "id": "product-summary", "type": "Card", "title": "선택한 상품", "childIds": ["summary-row"] },
    { "id": "summary-row", "type": "Row", "childIds": ["summary-name", "summary-price"], "justifyContent": "space-between" },
    { "id": "summary-name", "type": "Text", "text": "\${/selectedProduct/name}", "variant": "body" },
    { "id": "summary-price", "type": "Text", "text": "\${/selectedProduct/price}원", "variant": "body", "fontWeight": "bold" },
    { "id": "divider", "type": "Divider" },
    { "id": "form-section", "type": "Column", "childIds": ["form-title", "name-field", "phone-field", "address-field"], "gap": 16 },
    { "id": "form-title", "type": "Text", "text": "배송 정보", "variant": "h2" },
    { "id": "name-field", "type": "TextField", "label": "이름", "placeholder": "홍길동", "dataPath": "/form/name", "required": true },
    { "id": "phone-field", "type": "TextField", "label": "연락처", "placeholder": "010-1234-5678", "dataPath": "/form/phone", "inputType": "tel", "required": true },
    { "id": "address-field", "type": "TextField", "label": "배송 주소", "placeholder": "서울시 강남구...", "dataPath": "/form/address", "multiline": true, "required": true },
    { "id": "submit-btn", "type": "Button", "label": "주문 확인", "variant": "primary", "action": { "type": "sendAction", "actionId": "submitOrder" } }
  ]}
]`;

const ORDER_CONFIRMATION_EXAMPLE = `[
  { "type": "createSurface", "surfaceId": "main", "rootId": "root" },
  { "type": "updateDataModel", "surfaceId": "main", "dataModel": {
    "order": {
      "orderId": "ORD-20250120-001",
      "product": { "name": "두바이 쫀득 쿠키 오리지널", "price": 8900 },
      "customer": { "name": "홍길동", "phone": "010-1234-5678", "address": "서울시 강남구..." },
      "totalAmount": 8900
    }
  }},
  { "type": "updateComponents", "surfaceId": "main", "components": [
    { "id": "root", "type": "Column", "childIds": ["success-icon", "success-title", "order-card", "confirm-btn"], "gap": 24, "alignItems": "center" },
    { "id": "success-icon", "type": "Text", "text": "✅", "variant": "h1" },
    { "id": "success-title", "type": "Text", "text": "주문이 완료되었습니다!", "variant": "h2" },
    { "id": "order-card", "type": "Card", "title": "주문 상세", "childIds": ["order-id", "product-info", "customer-info", "total-row"], "style": { "width": "100%" } },
    { "id": "order-id", "type": "Text", "text": "주문번호: \${/order/orderId}", "variant": "caption" },
    { "id": "product-info", "type": "Text", "text": "상품: \${/order/product/name}", "variant": "body" },
    { "id": "customer-info", "type": "Column", "childIds": ["customer-name", "customer-phone", "customer-address"], "gap": 4 },
    { "id": "customer-name", "type": "Text", "text": "수령인: \${/order/customer/name}", "variant": "body" },
    { "id": "customer-phone", "type": "Text", "text": "연락처: \${/order/customer/phone}", "variant": "body" },
    { "id": "customer-address", "type": "Text", "text": "주소: \${/order/customer/address}", "variant": "body" },
    { "id": "total-row", "type": "Row", "childIds": ["total-label", "total-amount"], "justifyContent": "space-between", "style": { "marginTop": 16 } },
    { "id": "total-label", "type": "Text", "text": "결제 금액", "variant": "h3" },
    { "id": "total-amount", "type": "Text", "text": "\${/order/totalAmount}원", "variant": "h3", "color": "#e11d48" },
    { "id": "confirm-btn", "type": "Button", "label": "확인", "variant": "primary", "action": { "type": "sendAction", "actionId": "goToHome" } }
  ]}
]`;

// A2UI 시스템 프롬프트
const A2UI_SYSTEM_PROMPT = `당신은 Enhans 마켓플레이스의 AI 쇼핑 어시스턴트입니다.
사용자의 요청에 따라 A2UI 프로토콜을 사용하여 UI를 생성합니다.

## A2UI 프로토콜 규칙

### JSON Schema
${A2UI_JSON_SCHEMA}

### 메시지 타입
1. createSurface: UI 영역 생성 (surfaceId, rootId)
2. updateComponents: 컴포넌트 정의 (surfaceId, components)
3. updateDataModel: 데이터 설정 (surfaceId, dataModel)
4. deleteSurface: UI 영역 삭제 (surfaceId)

### 사용 가능한 컴포넌트 (10개)

#### 레이아웃 컴포넌트
- **Column**: 세로 레이아웃 { id, type: "Column", childIds: [...], gap?: number, alignItems?: "start"|"center"|"end"|"stretch" }
- **Row**: 가로 레이아웃 { id, type: "Row", childIds: [...], gap?: number, justifyContent?: "start"|"center"|"end"|"space-between", alignItems?: "start"|"center"|"end" }
- **Card**: 카드 컨테이너 { id, type: "Card", title?: string, subtitle?: string, childIds: [...], elevation?: "none"|"sm"|"md"|"lg" }
- **List**: 목록 (템플릿 기반 반복) { id, type: "List", dataPath: "/arrayPath", itemTemplateId: "template-id" }

#### 표시 컴포넌트
- **Text**: 텍스트 { id, type: "Text", text: "문자열 또는 \${/path}", variant?: "h1"|"h2"|"h3"|"body"|"caption"|"label", color?: string, fontWeight?: "normal"|"medium"|"semibold"|"bold" }
- **Image**: 이미지 { id, type: "Image", src: "url", alt?: string, width?: number, height?: number, objectFit?: "cover"|"contain" }
- **Divider**: 구분선 { id, type: "Divider", orientation?: "horizontal"|"vertical" }

#### 입력 컴포넌트
- **Button**: 버튼 { id, type: "Button", label: "텍스트", variant?: "primary"|"secondary"|"outline"|"danger", action?: { type: "sendAction", actionId: "...", payload?: {...} } }
- **TextField**: 텍스트 입력 { id, type: "TextField", label?: string, placeholder?: string, dataPath: "/form/field", inputType?: "text"|"email"|"tel"|"number", multiline?: boolean, required?: boolean }
- **CheckBox**: 체크박스 { id, type: "CheckBox", label?: string, dataPath: "/form/checked" }

### 데이터 바인딩

#### JSON Pointer 경로
- dataPath: 입력 컴포넌트의 양방향 바인딩 경로 (예: "/form/name")
- 값 읽기: "\${/path/to/value}" 형식으로 데이터 참조

#### List 컴포넌트의 템플릿 바인딩
- List의 itemTemplateId로 지정된 컴포넌트가 dataPath 배열 아이템마다 반복됨
- 템플릿 내에서 현재 아이템 접근: "\${item.propertyName}"
- 현재 인덱스 접근: "\${index}"

### 액션 정의
Button에 action을 정의하면 클릭 시 해당 액션이 서버로 전송됩니다:
{
  "action": {
    "type": "sendAction",
    "actionId": "selectProduct",
    "payload": { "productId": "\${item.id}" }
  }
}

## 상품 데이터 (Enhans 마켓플레이스 - 두바이 쫀득 쿠키)
${JSON.stringify(products, null, 2)}

## 주문 플로우 (3단계)

### Step 1: 상품 목록 표시
사용자가 "두바이 쿠키 보여줘" 등 요청 시 상품 목록 UI 생성

### Step 2: 결제 정보 입력
사용자가 상품을 선택하면 (selectProduct 액션) 결제 정보 입력 폼 표시

### Step 3: 주문 확인 및 완료
사용자가 주문 정보를 제출하면 (submitOrder 액션) 주문 완료 화면 표시

## UI 템플릿 예시

### 상품 목록 예시
${PRODUCT_LIST_EXAMPLE}

### 결제 정보 입력 예시
${CHECKOUT_FORM_EXAMPLE}

### 주문 완료 예시
${ORDER_CONFIRMATION_EXAMPLE}

## 응답 형식 (중요!)

응답은 반드시 다음 형식을 따라야 합니다:
1. 먼저 사용자에게 보여줄 간단한 텍스트 메시지를 작성합니다.
2. 구분자 "---a2ui_JSON---"를 작성합니다.
3. A2UI JSON 배열을 작성합니다.

예시:
두바이 쫀득 쿠키 상품 목록입니다. 원하시는 상품을 선택해주세요!

---a2ui_JSON---
[
  { "type": "createSurface", "surfaceId": "main", "rootId": "root" },
  ...
]`;

// A2UI JSON 구분자
const A2UI_SEPARATOR = '---a2ui_JSON---';

export async function POST(request: NextRequest) {
  try {
    const { messages, action } = await request.json();

    // 액션이 있으면 메시지에 추가
    let userContent = messages[messages.length - 1]?.content || '';
    if (action) {
      userContent += `\n\n[사용자 액션: ${action.actionId}]`;
      if (action.payload) {
        userContent += `\n페이로드: ${JSON.stringify(action.payload)}`;
      }
      if (action.dataModel) {
        userContent += `\n현재 데이터: ${JSON.stringify(action.dataModel)}`;
      }
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: A2UI_SYSTEM_PROMPT },
        ...messages.slice(0, -1),
        { role: 'user', content: userContent },
      ],
      temperature: 0.7,
    });

    const content = response.choices[0]?.message?.content || '';

    // 구분자 기반 파싱 시도
    let textContent = content;
    let a2uiMessages: unknown[] = [];

    if (content.includes(A2UI_SEPARATOR)) {
      const [text, jsonPart] = content.split(A2UI_SEPARATOR);
      textContent = text.trim();

      try {
        // JSON 배열 추출
        const jsonMatch = jsonPart.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          a2uiMessages = JSON.parse(jsonMatch[0]);
        }
      } catch (parseError) {
        console.error('Failed to parse A2UI messages from separator:', parseError);
      }
    } else {
      // 구분자가 없으면 기존 방식으로 JSON 추출 시도
      try {
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          a2uiMessages = JSON.parse(jsonMatch[0]);
          // JSON이 발견되면 텍스트에서 JSON 부분 제거
          textContent = content.replace(jsonMatch[0], '').trim();
        }
      } catch (parseError) {
        console.error('Failed to parse A2UI messages:', parseError);
      }
    }

    return NextResponse.json({
      content: textContent,
      a2uiMessages,
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
