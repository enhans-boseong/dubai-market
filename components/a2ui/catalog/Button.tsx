'use client';

import { ButtonComponent, ComponentRendererProps } from '@/lib/a2ui/types';
import { interpolateString, resolveValue } from '@/lib/a2ui/interpolation';

interface ButtonProps extends Omit<ComponentRendererProps, 'component'> {
  component: ButtonComponent;
}

const variantStyles: Record<string, string> = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800',
  secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 active:bg-gray-400',
  outline: 'border border-gray-300 text-gray-800 hover:bg-gray-50 active:bg-gray-100',
  ghost: 'text-gray-800 hover:bg-gray-100 active:bg-gray-200',
  danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800',
};

/**
 * Payload 내의 모든 문자열 값을 보간 처리
 * List 템플릿 내에서 ${item.id} 같은 값을 실제 값으로 변환
 */
function interpolatePayload(
  payload: Record<string, unknown> | undefined,
  dataModel: Record<string, unknown>
): Record<string, unknown> | undefined {
  if (!payload) return undefined;

  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(payload)) {
    if (typeof value === 'string') {
      result[key] = interpolateString(value, dataModel);
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      result[key] = interpolatePayload(value as Record<string, unknown>, dataModel);
    } else {
      result[key] = value;
    }
  }

  return result;
}

export function A2UIButton({ component, dataModel, onAction, surfaceId }: ButtonProps) {
  const { id, label, variant = 'primary', disabled, action, style } = component;

  const interpolatedLabel = interpolateString(label, dataModel);
  const isDisabled = typeof disabled === 'string'
    ? resolveValue(disabled, dataModel) === true
    : disabled;

  const handleClick = () => {
    if (action && !isDisabled) {
      // Payload 값들을 보간 처리
      const interpolatedPayload = interpolatePayload(action.payload, dataModel);

      onAction({
        actionId: action.actionId,
        surfaceId,
        componentId: id,
        payload: interpolatedPayload,
        dataModel,
      });
    }
  };

  const baseStyles = 'px-4 py-2 rounded-lg font-medium transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed';

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]}`}
      onClick={handleClick}
      disabled={isDisabled}
      style={styleToCSS(style)}
    >
      {interpolatedLabel}
    </button>
  );
}

function styleToCSS(style?: ButtonComponent['style']): React.CSSProperties {
  if (!style) return {};

  return {
    width: typeof style.width === 'number' ? `${style.width}px` : style.width,
    height: typeof style.height === 'number' ? `${style.height}px` : style.height,
    padding: typeof style.padding === 'number' ? `${style.padding}px` : style.padding,
    margin: typeof style.margin === 'number' ? `${style.margin}px` : style.margin,
    backgroundColor: style.backgroundColor,
    borderRadius: typeof style.borderRadius === 'number' ? `${style.borderRadius}px` : style.borderRadius,
    border: style.border,
  };
}
