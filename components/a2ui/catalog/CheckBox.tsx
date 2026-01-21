'use client';

import { CheckBoxComponent, ComponentRendererProps } from '@/lib/a2ui/types';
import { interpolateString, resolveValue, getValueByPath } from '@/lib/a2ui/interpolation';

interface CheckBoxProps extends Omit<ComponentRendererProps, 'component'> {
  component: CheckBoxComponent;
}

export function A2UICheckBox({ component, dataModel, onDataChange }: CheckBoxProps) {
  const { id, label, checked, dataPath, disabled, style } = component;

  const interpolatedLabel = label ? interpolateString(label, dataModel) : undefined;

  // Get the current checked state from dataPath or direct value
  let isChecked = false;
  if (dataPath) {
    const pathValue = getValueByPath(dataModel, dataPath);
    isChecked = Boolean(pathValue);
  } else if (checked !== undefined) {
    isChecked = typeof checked === 'string'
      ? resolveValue(checked, dataModel) === true
      : checked;
  }

  const isDisabled = typeof disabled === 'string'
    ? resolveValue(disabled, dataModel) === true
    : disabled;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (dataPath) {
      onDataChange(dataPath, e.target.checked);
    }
  };

  return (
    <label
      className="flex items-center gap-2 cursor-pointer select-none"
      style={styleToCSS(style)}
    >
      <input
        id={id}
        type="checkbox"
        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        checked={isChecked}
        onChange={handleChange}
        disabled={isDisabled}
      />
      {interpolatedLabel && (
        <span className={`text-sm ${isDisabled ? 'text-gray-400' : 'text-gray-700'}`}>
          {interpolatedLabel}
        </span>
      )}
    </label>
  );
}

function styleToCSS(style?: CheckBoxComponent['style']): React.CSSProperties {
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
