# Dubai Market - A2UI MVP Demo

AI 에이전트가 동적 UI를 생성하는 **A2UI 프로토콜** MVP 구현체입니다.

> 두바이 쫀득 쿠키 주문 데모를 통해 A2UI의 핵심 개념을 시연합니다.

## What is A2UI?

**A2UI (Agent-to-UI)**는 Google에서 개발한 프로토콜로, AI가 **선언적 JSON**을 통해 안전하게 UI를 생성합니다.

```
AI가 생성하는 것:  { "type": "Button", "label": "주문하기" }  ← 데이터
렌더러가 만드는 것: <button>주문하기</button>                  ← 실제 UI
```

**핵심 아이디어**: AI는 "무엇을 보여줄지"만 선언하고, "어떻게 보여줄지"는 신뢰할 수 있는 렌더러가 담당

## Demo

```
사용자: "두바이 쫀득 쿠키 보여줘"
   ↓
AI: A2UI JSON 생성 (상품 카드 리스트)
   ↓
사용자: [상품 선택]
   ↓
AI: A2UI JSON 생성 (주문 폼)
   ↓
사용자: [주문하기]
   ↓
AI: A2UI JSON 생성 (주문 완료)
```

## Tech Stack

- **Framework**: Next.js 16 + React 19
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **AI**: OpenAI GPT-4o

## Getting Started

```bash
# Install dependencies
npm install

# Set environment variable
echo "OPENAI_API_KEY=your-api-key" > .env.local

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
├── app/
│   ├── api/chat/route.ts     # OpenAI API + A2UI system prompt
│   └── page.tsx              # Chat interface
├── components/a2ui/
│   ├── A2UIRenderer.tsx      # Main renderer
│   └── catalog/              # 10 components (Text, Button, Card, etc.)
├── lib/a2ui/
│   ├── types.ts              # TypeScript definitions
│   ├── parser.ts             # JSON parsing & validation
│   ├── interpolation.ts      # Data binding (${/path} syntax)
│   └── data-model.ts         # Surface state management
├── hooks/
│   └── useA2UI.ts            # React state hook
└── data/
    └── products.ts           # Dubai Cookie product data
```

## Implemented Components

| Category | Components |
|----------|------------|
| Layout | Column, Row, Card, List |
| Display | Text, Image, Divider |
| Input | Button, TextField, CheckBox |

## Documentation

자세한 A2UI 기술 설명은 [Notion.md](./Notion.md)를 참조하세요.

## References

- [A2UI Official Site](https://a2ui.org/)
- [A2UI GitHub](https://github.com/google/A2UI)
- [A2UI v0.9 Spec](https://a2ui.org/specification/v0.9-a2ui/)

## License

MIT
