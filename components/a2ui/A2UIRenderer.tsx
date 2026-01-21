'use client';

import { useCallback } from 'react';
import {
  A2UIMessage,
  A2UIAction,
  ComponentDefinition,
  SurfaceState,
} from '@/lib/a2ui/types';
import { ComponentRenderer } from './ComponentRenderer';

interface A2UIRendererProps {
  surfaces: Map<string, SurfaceState>;
  onAction?: (action: A2UIAction) => void;
  onDataChange?: (surfaceId: string, path: string, value: unknown) => void;
}

/**
 * A2UI 메인 렌더러
 * 여러 Surface를 관리하고 렌더링합니다.
 */
export function A2UIRenderer({ surfaces, onAction, onDataChange }: A2UIRendererProps) {
  const handleAction = useCallback(
    (action: A2UIAction) => {
      console.log('A2UI Action:', action);
      onAction?.(action);
    },
    [onAction]
  );

  const handleDataChange = useCallback(
    (surfaceId: string) => (path: string, value: unknown) => {
      console.log('A2UI Data Change:', { surfaceId, path, value });
      onDataChange?.(surfaceId, path, value);
    },
    [onDataChange]
  );

  if (surfaces.size === 0) {
    return null;
  }

  return (
    <div className="a2ui-renderer flex flex-col gap-4">
      {Array.from(surfaces.entries()).map(([surfaceId, surface]) => (
        <A2UISurface
          key={surfaceId}
          surface={surface}
          onAction={handleAction}
          onDataChange={handleDataChange(surfaceId)}
        />
      ))}
    </div>
  );
}

interface A2UISurfaceProps {
  surface: SurfaceState;
  onAction: (action: A2UIAction) => void;
  onDataChange: (path: string, value: unknown) => void;
}

/**
 * 단일 Surface 렌더링
 */
function A2UISurface({ surface, onAction, onDataChange }: A2UISurfaceProps) {
  const { surfaceId, rootId, components, dataModel } = surface;

  // rootId가 있으면 해당 컴포넌트부터 렌더링, 없으면 parentId가 없는 컴포넌트들을 찾아서 렌더링
  let rootComponents: ComponentDefinition[] = [];

  if (rootId) {
    const rootComponent = components.get(rootId);
    if (rootComponent) {
      rootComponents = [rootComponent];
    }
  } else {
    // parentId가 없는 최상위 컴포넌트들 찾기
    rootComponents = Array.from(components.values()).filter(
      (c) => !c.parentId
    );
  }

  if (rootComponents.length === 0) {
    return null;
  }

  return (
    <div className="a2ui-surface" data-surface-id={surfaceId}>
      {rootComponents.map((component) => (
        <ComponentRenderer
          key={component.id}
          component={component}
          components={components}
          dataModel={dataModel}
          onAction={onAction}
          onDataChange={onDataChange}
          surfaceId={surfaceId}
        />
      ))}
    </div>
  );
}

/**
 * A2UI 메시지 배열을 처리하여 Surface 상태로 변환
 */
export function processA2UIMessages(
  messages: A2UIMessage[],
  existingSurfaces?: Map<string, SurfaceState>
): Map<string, SurfaceState> {
  const surfaces = new Map(existingSurfaces || []);

  for (const message of messages) {
    switch (message.type) {
      case 'createSurface': {
        surfaces.set(message.surfaceId, {
          surfaceId: message.surfaceId,
          surfaceName: message.surfaceName,
          rootId: message.rootId,
          components: new Map(),
          dataModel: {},
        });
        break;
      }

      case 'updateComponents': {
        const surface = surfaces.get(message.surfaceId);
        if (surface) {
          // 컴포넌트 업데이트
          for (const component of message.components) {
            surface.components.set(component.id, component);
          }
        } else {
          // Surface가 없으면 자동 생성
          const newSurface: SurfaceState = {
            surfaceId: message.surfaceId,
            components: new Map(),
            dataModel: {},
          };
          for (const component of message.components) {
            newSurface.components.set(component.id, component);
          }
          surfaces.set(message.surfaceId, newSurface);
        }
        break;
      }

      case 'updateDataModel': {
        const surface = surfaces.get(message.surfaceId);
        if (surface) {
          surface.dataModel = {
            ...surface.dataModel,
            ...message.dataModel,
          };
        } else {
          // Surface가 없으면 자동 생성
          surfaces.set(message.surfaceId, {
            surfaceId: message.surfaceId,
            components: new Map(),
            dataModel: message.dataModel,
          });
        }
        break;
      }

      case 'deleteSurface': {
        surfaces.delete(message.surfaceId);
        break;
      }
    }
  }

  return surfaces;
}