/**
 * A2UI Parser
 *
 * AI 응답에서 A2UI 메시지를 파싱하고 검증합니다.
 */

import { A2UIMessage } from './types';

// A2UI JSON 구분자
const A2UI_SEPARATOR = '---a2ui_JSON---';

/**
 * 단일 JSON 문자열을 A2UI 메시지로 파싱
 */
export function parseMessage(json: string): A2UIMessage | null {
  try {
    const parsed = JSON.parse(json);
    if (!isValidA2UIMessage(parsed)) {
      console.warn('Invalid A2UI message:', parsed);
      return null;
    }
    return parsed;
  } catch (error) {
    console.error('Failed to parse A2UI message:', error);
    return null;
  }
}

/**
 * JSONL (줄바꿈 구분 JSON) 파싱
 */
export function parseJSONL(jsonl: string): A2UIMessage[] {
  const lines = jsonl.split('\n').filter(line => line.trim());
  const messages: A2UIMessage[] = [];

  for (const line of lines) {
    const message = parseMessage(line);
    if (message) {
      messages.push(message);
    }
  }

  return messages;
}

/**
 * JSON 배열을 A2UI 메시지 배열로 파싱
 */
export function parseMessageArray(json: string): A2UIMessage[] {
  try {
    const parsed = JSON.parse(json);

    if (!Array.isArray(parsed)) {
      const message = isValidA2UIMessage(parsed) ? parsed : null;
      return message ? [message] : [];
    }

    return parsed.filter(isValidA2UIMessage);
  } catch {
    return parseJSONL(json);
  }
}

/**
 * A2UI 메시지 유효성 검증
 */
function isValidA2UIMessage(obj: unknown): obj is A2UIMessage {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }

  const message = obj as Record<string, unknown>;

  if (typeof message.type !== 'string') {
    return false;
  }

  switch (message.type) {
    case 'createSurface':
      return typeof message.surfaceId === 'string';

    case 'updateComponents':
      return (
        typeof message.surfaceId === 'string' &&
        Array.isArray(message.components)
      );

    case 'updateDataModel':
      return (
        typeof message.surfaceId === 'string' &&
        typeof message.dataModel === 'object' &&
        message.dataModel !== null
      );

    case 'deleteSurface':
      return typeof message.surfaceId === 'string';

    default:
      return false;
  }
}

/**
 * 구분자 기반 파싱 결과
 */
export interface ParsedResponse {
  textContent: string;
  messages: A2UIMessage[];
}

/**
 * 구분자 기반 파싱 (---a2ui_JSON--- 구분자 사용)
 * @param text - AI 응답 전체 텍스트
 * @returns 텍스트 내용과 A2UI 메시지 배열
 */
export function parseWithSeparator(text: string): ParsedResponse {
  if (text.includes(A2UI_SEPARATOR)) {
    const [textPart, jsonPart] = text.split(A2UI_SEPARATOR);
    const textContent = textPart.trim();

    try {
      const jsonMatch = jsonPart.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (Array.isArray(parsed)) {
          const validMessages = parsed.filter(isValidA2UIMessage);
          return { textContent, messages: validMessages };
        }
      }
    } catch {
      // 파싱 실패 시 빈 메시지 반환
    }

    return { textContent, messages: [] };
  }

  // 구분자가 없으면 기존 방식으로 파싱
  const messages = extractA2UIMessages(text);

  // JSON 부분 제거하여 텍스트 추출
  let textContent = text;
  const arrayMatch = text.match(/\[[\s\S]*\]/);
  if (arrayMatch && messages.length > 0) {
    textContent = text.replace(arrayMatch[0], '').trim();
  }

  return { textContent, messages };
}

/**
 * 텍스트에서 A2UI 메시지 추출 (AI 응답에서 JSON 찾기)
 */
export function extractA2UIMessages(text: string): A2UIMessage[] {
  const messages: A2UIMessage[] = [];

  // 먼저 JSON 배열 찾기 시도
  const arrayMatch = text.match(/\[[\s\S]*\]/);
  if (arrayMatch) {
    try {
      const parsed = JSON.parse(arrayMatch[0]);
      if (Array.isArray(parsed)) {
        const validMessages = parsed.filter(isValidA2UIMessage);
        if (validMessages.length > 0) {
          return validMessages;
        }
      }
    } catch {
      // 개별 객체 추출로 진행
    }
  }

  // 개별 JSON 객체 찾기
  let depth = 0;
  let start = -1;
  let inString = false;
  let escaped = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (escaped) {
      escaped = false;
      continue;
    }

    if (char === '\\' && inString) {
      escaped = true;
      continue;
    }

    if (char === '"') {
      inString = !inString;
      continue;
    }

    if (inString) continue;

    if (char === '{') {
      if (depth === 0) start = i;
      depth++;
    } else if (char === '}') {
      depth--;
      if (depth === 0 && start !== -1) {
        const jsonStr = text.slice(start, i + 1);
        try {
          const parsed = JSON.parse(jsonStr);
          if (isValidA2UIMessage(parsed)) {
            messages.push(parsed);
          }
        } catch {
          // 유효하지 않은 JSON, 스킵
        }
        start = -1;
      }
    }
  }

  return messages;
}