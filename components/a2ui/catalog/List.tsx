'use client';

import { ListComponent, ComponentRendererProps, ComponentDefinition } from '@/lib/a2ui/types';
import { ComponentRenderer } from '../ComponentRenderer';
import { getValueByPath } from '@/lib/a2ui/interpolation';

interface ListProps extends Omit<ComponentRendererProps, 'component'> {
  component: ListComponent;
}

export function A2UIList({ component, components, dataModel, onAction, onDataChange, surfaceId }: ListProps) {
  const { childIds = [], dataPath, itemTemplateId, emptyText = 'No items', style } = component;

  // If dataPath is provided, we render items from the data model
  if (dataPath && itemTemplateId) {
    const items = getValueByPath(dataModel, dataPath) as unknown[];

    if (!items || !Array.isArray(items) || items.length === 0) {
      return (
        <div className="py-8 text-center text-gray-500" style={styleToCSS(style)}>
          {emptyText}
        </div>
      );
    }

    const templateComponent = components.get(itemTemplateId);
    if (!templateComponent) {
      return null;
    }

    return (
      <div className="flex flex-col gap-3" style={styleToCSS(style)}>
        {items.map((item, index) => {
          // Create a modified data model with the current item
          const itemDataModel = {
            ...dataModel,
            item,
            index,
          };

          // Create a modified components map with the cloned children
          const clonedComponents = new Map(components);
          cloneComponentTree(templateComponent, components, clonedComponents, index);

          // Get the cloned template component (with suffixed ID)
          const clonedTemplateId = `${templateComponent.id}-${index}`;
          const clonedComponent = clonedComponents.get(clonedTemplateId);
          if (!clonedComponent) return null;

          return (
            <ComponentRenderer
              key={`${itemTemplateId}-${index}`}
              component={clonedComponent}
              components={clonedComponents}
              dataModel={itemDataModel}
              onAction={onAction}
              onDataChange={onDataChange}
              surfaceId={surfaceId}
            />
          );
        })}
      </div>
    );
  }

  // If no dataPath, render direct children
  if (childIds.length === 0) {
    return (
      <div className="py-8 text-center text-gray-500" style={styleToCSS(style)}>
        {emptyText}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3" style={styleToCSS(style)}>
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

function cloneComponentTree(
  component: ComponentDefinition,
  originalComponents: Map<string, ComponentDefinition>,
  clonedComponents: Map<string, ComponentDefinition>,
  index: number
) {
  // Clone the component with the new id
  const clonedComponent: ComponentDefinition = {
    ...component,
    id: `${component.id}-${index}`,
    childIds: component.childIds?.map(id => `${id}-${index}`),
  };

  clonedComponents.set(clonedComponent.id, clonedComponent);

  // Recursively clone children
  if (component.childIds) {
    for (const childId of component.childIds) {
      const childComponent = originalComponents.get(childId);
      if (childComponent) {
        cloneComponentTree(childComponent, originalComponents, clonedComponents, index);
      }
    }
  }
}

function styleToCSS(style?: ListComponent['style']): React.CSSProperties {
  if (!style) return {};

  return {
    width: typeof style.width === 'number' ? `${style.width}px` : style.width,
    height: typeof style.height === 'number' ? `${style.height}px` : style.height,
    padding: typeof style.padding === 'number' ? `${style.padding}px` : style.padding,
    margin: typeof style.margin === 'number' ? `${style.margin}px` : style.margin,
    backgroundColor: style.backgroundColor,
    borderRadius: typeof style.borderRadius === 'number' ? `${style.borderRadius}px` : style.borderRadius,
    border: style.border,
    overflow: style.overflow,
  };
}
