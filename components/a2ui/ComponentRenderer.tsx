'use client';

import { ComponentDefinition, ComponentRendererProps } from '@/lib/a2ui/types';
import { resolveValue } from '@/lib/a2ui/interpolation';
import {
  A2UIText,
  A2UIButton,
  A2UIColumn,
  A2UIRow,
  A2UICard,
  A2UITextField,
  A2UICheckBox,
  A2UIImage,
  A2UIDivider,
  A2UIList,
} from './catalog';

/**
 * 컴포넌트 타입에 따라 적절한 A2UI 컴포넌트를 렌더링
 */
export function ComponentRenderer(props: ComponentRendererProps) {
  const { component, dataModel } = props;

  // Null check - component가 undefined인 경우 렌더링하지 않음
  if (!component) {
    return null;
  }

  // visible 속성 처리
  if (component.visible !== undefined) {
    const isVisible = typeof component.visible === 'string'
      ? resolveValue(component.visible, dataModel) !== false
      : component.visible;

    if (!isVisible) {
      return null;
    }
  }

  // 컴포넌트 타입별 렌더링
  switch (component.type) {
    case 'Text':
      return <A2UIText {...props} component={component} />;

    case 'Button':
      return <A2UIButton {...props} component={component} />;

    case 'Column':
      return <A2UIColumn {...props} component={component} />;

    case 'Row':
      return <A2UIRow {...props} component={component} />;

    case 'Card':
      return <A2UICard {...props} component={component} />;

    case 'TextField':
      return <A2UITextField {...props} component={component} />;

    case 'CheckBox':
      return <A2UICheckBox {...props} component={component} />;

    case 'Image':
      return <A2UIImage {...props} component={component} />;

    case 'Divider':
      return <A2UIDivider {...props} component={component} />;

    case 'List':
      return <A2UIList {...props} component={component} />;

    default:
      console.warn(`Unknown component type: ${(component as ComponentDefinition).type}`);
      return null;
  }
}
