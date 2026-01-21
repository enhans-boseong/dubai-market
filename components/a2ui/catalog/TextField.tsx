'use client';

import { TextFieldComponent, ComponentRendererProps } from '@/lib/a2ui/types';
import { interpolateString, resolveValue, getValueByPath } from '@/lib/a2ui/interpolation';

interface TextFieldProps extends Omit<ComponentRendererProps, 'component'> {
  component: TextFieldComponent;
}

export function A2UITextField({ component, dataModel, onDataChange }: TextFieldProps) {
  const {
    id,
    label,
    placeholder,
    value,
    dataPath,
    multiline = false,
    rows = 3,
    disabled,
    required,
    inputType = 'text',
    style
  } = component;

  const interpolatedLabel = label ? interpolateString(label, dataModel) : undefined;
  const interpolatedPlaceholder = placeholder ? interpolateString(placeholder, dataModel) : undefined;

  // Get the current value from dataPath or direct value
  let currentValue = '';
  if (dataPath) {
    const pathValue = getValueByPath(dataModel, dataPath);
    currentValue = pathValue !== undefined ? String(pathValue) : '';
  } else if (value !== undefined) {
    currentValue = interpolateString(value, dataModel);
  }

  const isDisabled = typeof disabled === 'string'
    ? resolveValue(disabled, dataModel) === true
    : disabled;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (dataPath) {
      onDataChange(dataPath, e.target.value);
    }
  };

  const inputClassName = 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed';

  return (
    <div className="flex flex-col gap-1.5" style={styleToCSS(style)}>
      {interpolatedLabel && (
        <label htmlFor={id} className="text-sm font-medium text-gray-700">
          {interpolatedLabel}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      {multiline ? (
        <textarea
          id={id}
          className={inputClassName}
          placeholder={interpolatedPlaceholder}
          value={currentValue}
          onChange={handleChange}
          disabled={isDisabled}
          required={required}
          rows={rows}
        />
      ) : (
        <input
          id={id}
          type={inputType}
          className={inputClassName}
          placeholder={interpolatedPlaceholder}
          value={currentValue}
          onChange={handleChange}
          disabled={isDisabled}
          required={required}
        />
      )}
    </div>
  );
}

function styleToCSS(style?: TextFieldComponent['style']): React.CSSProperties {
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
