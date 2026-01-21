'use client';

import { CardComponent, ComponentRendererProps } from '@/lib/a2ui/types';
import { ComponentRenderer } from '../ComponentRenderer';
import { interpolateString } from '@/lib/a2ui/interpolation';

interface CardProps extends Omit<ComponentRendererProps, 'component'> {
  component: CardComponent;
}

const elevationStyles: Record<string, string> = {
  none: '',
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
};

export function A2UICard({ component, components, dataModel, onAction, onDataChange, surfaceId }: CardProps) {
  const { childIds = [], title, subtitle, elevation = 'md', style } = component;

  const interpolatedTitle = title ? interpolateString(title, dataModel) : undefined;
  const interpolatedSubtitle = subtitle ? interpolateString(subtitle, dataModel) : undefined;

  return (
    <div
      className={`bg-white rounded-xl border border-gray-200 ${elevationStyles[elevation]}`}
      style={styleToCSS(style)}
    >
      {(interpolatedTitle || interpolatedSubtitle) && (
        <div className="px-4 py-3 border-b border-gray-100">
          {interpolatedTitle && (
            <h3 className="text-lg font-semibold text-gray-900">{interpolatedTitle}</h3>
          )}
          {interpolatedSubtitle && (
            <p className="text-sm text-gray-500 mt-0.5">{interpolatedSubtitle}</p>
          )}
        </div>
      )}
      <div className="p-4">
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
    </div>
  );
}

function styleToCSS(style?: CardComponent['style']): React.CSSProperties {
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
