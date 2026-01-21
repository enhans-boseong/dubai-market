'use client';

import { RowComponent, ComponentRendererProps } from '@/lib/a2ui/types';
import { ComponentRenderer } from '../ComponentRenderer';

interface RowProps extends Omit<ComponentRendererProps, 'component'> {
  component: RowComponent;
}

const alignItemsStyles: Record<string, string> = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
};

const justifyContentStyles: Record<string, string> = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  'space-between': 'justify-between',
  'space-around': 'justify-around',
};

export function A2UIRow({ component, components, dataModel, onAction, onDataChange, surfaceId }: RowProps) {
  const { childIds = [], gap = 0, alignItems = 'center', justifyContent = 'start', wrap = false, style } = component;

  const gapValue = typeof gap === 'number' ? `${gap * 4}px` : gap;

  return (
    <div
      className={`flex ${wrap ? 'flex-wrap' : 'flex-nowrap'} ${alignItemsStyles[alignItems]} ${justifyContentStyles[justifyContent]}`}
      style={{
        gap: gapValue,
        ...styleToCSS(style),
      }}
    >
      {childIds.map((childId) => {
        const childComponent = components.get(childId);
        if (!childComponent) return null;

        return (
          <ComponentRenderer
            key={childId}
            component={childComponent}
            components={components}
            dataModel={dataModel}
            onAction={onAction}
            onDataChange={onDataChange}
            surfaceId={surfaceId}
          />
        );
      })}
    </div>
  );
}

function styleToCSS(style?: RowComponent['style']): React.CSSProperties {
  if (!style) return {};

  return {
    width: typeof style.width === 'number' ? `${style.width}px` : style.width,
    height: typeof style.height === 'number' ? `${style.height}px` : style.height,
    padding: typeof style.padding === 'number' ? `${style.padding}px` : style.padding,
    margin: typeof style.margin === 'number' ? `${style.margin}px` : style.margin,
    backgroundColor: style.backgroundColor,
    borderRadius: typeof style.borderRadius === 'number' ? `${style.borderRadius}px` : style.borderRadius,
    border: style.border,
    flex: style.flex,
    overflow: style.overflow,
  };
}
