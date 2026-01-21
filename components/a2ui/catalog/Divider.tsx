'use client';

import { DividerComponent, ComponentRendererProps } from '@/lib/a2ui/types';

interface DividerProps extends Omit<ComponentRendererProps, 'component'> {
  component: DividerComponent;
}

export function A2UIDivider({ component }: DividerProps) {
  const { orientation = 'horizontal', color = '#e5e7eb', thickness = 1, style } = component;

  if (orientation === 'vertical') {
    return (
      <div
        className="self-stretch"
        style={{
          width: `${thickness}px`,
          backgroundColor: color,
          minHeight: '100%',
          ...styleToCSS(style),
        }}
      />
    );
  }

  return (
    <hr
      style={{
        border: 'none',
        height: `${thickness}px`,
        backgroundColor: color,
        width: '100%',
        ...styleToCSS(style),
      }}
    />
  );
}

function styleToCSS(style?: DividerComponent['style']): React.CSSProperties {
  if (!style) return {};

  return {
    margin: typeof style.margin === 'number' ? `${style.margin}px` : style.margin,
  };
}
