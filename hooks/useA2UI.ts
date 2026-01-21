'use client';

import { useState, useCallback } from 'react';
import { A2UIMessage, A2UIAction, SurfaceState } from '@/lib/a2ui/types';
import { processA2UIMessages } from '@/components/a2ui/A2UIRenderer';
import { setValueByPath } from '@/lib/a2ui/interpolation';

interface UseA2UIReturn {
  surfaces: Map<string, SurfaceState>;
  processMessages: (messages: A2UIMessage[]) => void;
  handleAction: (action: A2UIAction) => void;
  handleDataChange: (surfaceId: string, path: string, value: unknown) => void;
  clearSurfaces: () => void;
}

interface UseA2UIOptions {
  onAction?: (action: A2UIAction) => void;
}

/**
 * A2UI 상태 관리 훅
 * Surface 상태, 메시지 처리, 액션/데이터 변경 핸들링을 제공합니다.
 */
export function useA2UI(options?: UseA2UIOptions): UseA2UIReturn {
  const [surfaces, setSurfaces] = useState<Map<string, SurfaceState>>(new Map());

  // A2UI 메시지 처리
  const processMessages = useCallback((messages: A2UIMessage[]) => {
    setSurfaces((prev) => processA2UIMessages(messages, prev));
  }, []);

  // 액션 핸들링 (버튼 클릭 등)
  const handleAction = useCallback(
    (action: A2UIAction) => {
      console.log('Action received:', action);
      options?.onAction?.(action);
    },
    [options]
  );

  // 데이터 변경 핸들링 (TextField 입력 등)
  const handleDataChange = useCallback(
    (surfaceId: string, path: string, value: unknown) => {
      setSurfaces((prev) => {
        const newSurfaces = new Map(prev);
        const surface = newSurfaces.get(surfaceId);

        if (surface) {
          const newDataModel = setValueByPath(surface.dataModel, path, value);
          newSurfaces.set(surfaceId, {
            ...surface,
            dataModel: newDataModel,
          });
        }

        return newSurfaces;
      });
    },
    []
  );

  // 모든 Surface 초기화
  const clearSurfaces = useCallback(() => {
    setSurfaces(new Map());
  }, []);

  return {
    surfaces,
    processMessages,
    handleAction,
    handleDataChange,
    clearSurfaces,
  };
}
