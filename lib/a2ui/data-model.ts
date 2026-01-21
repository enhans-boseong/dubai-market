/**
 * A2UI Data Model Manager
 *
 * Surface별 데이터 모델 상태를 관리합니다.
 * interpolation.ts의 저수준 함수를 사용해 고수준 상태 관리를 제공합니다.
 */

import { getValueByPath, setValueByPath } from './interpolation';

// 전체 앱의 데이터 모델 상태 (Surface ID → 데이터)
export interface DataModelState {
  [surfaceId: string]: Record<string, unknown>;
}

/**
 * 빈 데이터 모델 상태 생성
 */
export function createDataModelState(): DataModelState {
  return {};
}

/**
 * Surface의 데이터 모델 초기화
 */
export function initializeSurfaceDataModel(
  state: DataModelState,
  surfaceId: string,
  initialData?: Record<string, unknown>
): DataModelState {
  return {
    ...state,
    [surfaceId]: initialData || {},
  };
}

/**
 * Surface의 데이터 모델 업데이트 (deep merge)
 */
export function updateSurfaceDataModel(
  state: DataModelState,
  surfaceId: string,
  updates: Record<string, unknown>
): DataModelState {
  const currentModel = state[surfaceId] || {};
  const newModel = deepMerge(currentModel, updates);

  return {
    ...state,
    [surfaceId]: newModel,
  };
}

/**
 * JSON Pointer 경로로 값 설정
 */
export function setDataModelValue(
  state: DataModelState,
  surfaceId: string,
  path: string,
  value: unknown
): DataModelState {
  const currentModel = state[surfaceId] || {};
  const newModel = setValueByPath(currentModel, path, value);

  return {
    ...state,
    [surfaceId]: newModel,
  };
}

/**
 * JSON Pointer 경로로 값 조회
 */
export function getDataModelValue(
  state: DataModelState,
  surfaceId: string,
  path: string
): unknown {
  const currentModel = state[surfaceId] || {};
  return getValueByPath(currentModel, path);
}

/**
 * Surface의 데이터 모델 삭제
 */
export function deleteSurfaceDataModel(
  state: DataModelState,
  surfaceId: string
): DataModelState {
  const newState = { ...state };
  delete newState[surfaceId];
  return newState;
}

/**
 * Surface의 전체 데이터 모델 조회
 */
export function getSurfaceDataModel(
  state: DataModelState,
  surfaceId: string
): Record<string, unknown> {
  return state[surfaceId] || {};
}

/**
 * Deep merge (배열은 교체, 객체는 병합)
 */
function deepMerge(
  target: Record<string, unknown>,
  source: Record<string, unknown>
): Record<string, unknown> {
  const result = { ...target };

  for (const key of Object.keys(source)) {
    const sourceValue = source[key];
    const targetValue = target[key];

    if (
      sourceValue !== null &&
      typeof sourceValue === 'object' &&
      !Array.isArray(sourceValue) &&
      targetValue !== null &&
      typeof targetValue === 'object' &&
      !Array.isArray(targetValue)
    ) {
      result[key] = deepMerge(
        targetValue as Record<string, unknown>,
        sourceValue as Record<string, unknown>
      );
    } else {
      result[key] = sourceValue;
    }
  }

  return result;
}

/**
 * Action 전송용 데이터 모델 스냅샷 생성
 */
export function createDataModelSnapshot(
  state: DataModelState,
  surfaceId: string
): Record<string, unknown> {
  const model = state[surfaceId];
  if (!model) return {};
  return JSON.parse(JSON.stringify(model));
}