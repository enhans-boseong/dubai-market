'use client';

import { TextComponent, ComponentRendererProps } from '@/lib/a2ui/types';
import { interpolateString } from '@/lib/a2ui/interpolation';

interface TextProps extends Omit<ComponentRendererProps, 'component'> {
  component: TextComponent;
}

const variantStyles: Record<string, string> = {
  h1: 'text-3xl font-bold text-gray-900',
  h2: 'text-2xl font-semibold text-gray-900',
  h3: 'text-xl font-semibold text-gray-900',
  body: 'text-base text-gray-800',
  caption: 'text-sm text-gray-500',
  label: 'text-sm font-medium text-gray-700',
};

const fontWeightStyles: Record<string, string> = {
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
};

const textAlignStyles: Record<string, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

export function A2UIText({ component, dataModel }: TextProps) {
  const { text, variant = 'body', color, fontWeight, textAlign, style } = component;

  const interpolatedText = interpolateString(text, dataModel);

  const classNames = [
    variantStyles[variant],
    fontWeight && fontWeightStyles[fontWeight],
    textAlign && textAlignStyles[textAlign],
  ].filter(Boolean).join(' ');

  const inlineStyle: React.CSSProperties = {
    color,
    ...styleToCSS(style),
  };

  return (
    <span className={classNames} style={inlineStyle}>
      {interpolatedText}
    </span>
  );
}

function styleToCSS(style?: TextComponent['style']): React.CSSProperties {
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