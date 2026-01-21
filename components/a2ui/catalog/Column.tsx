'use client';

import { ColumnComponent, ComponentRendererProps } from '@/lib/a2ui/types';
import { ComponentRenderer } from '../ComponentRenderer';

interface ColumnProps extends Omit<ComponentRendererProps, 'component'> {
  component: ColumnComponent;
}

const alignItemsStyles: Record<string, string> = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
};

export function A2UIColumn({ component, components, dataModel, onAction, onDataChange, surfaceId }: ColumnProps) {
  const { childIds = [], gap = 0, alignItems = 'stretch', style } = component;

  const gapValue = typeof gap === 'number' ? `${gap * 4}px` : gap;

  return (
    <div
      className={`flex flex-col ${alignItemsStyles[alignItems]}`}
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

function styleToCSS(style?: ColumnComponent['style']): React.CSSProperties {
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
