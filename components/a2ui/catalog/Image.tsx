'use client';

import { ImageComponent, ComponentRendererProps } from '@/lib/a2ui/types';
import { interpolateString } from '@/lib/a2ui/interpolation';
import NextImage from 'next/image';

interface ImageProps extends Omit<ComponentRendererProps, 'component'> {
  component: ImageComponent;
}

const objectFitStyles: Record<string, string> = {
  cover: 'object-cover',
  contain: 'object-contain',
  fill: 'object-fill',
  none: 'object-none',
};

export function A2UIImage({ component, dataModel }: ImageProps) {
  const { src, alt = '', width, height, objectFit = 'cover', style } = component;

  const interpolatedSrc = interpolateString(src, dataModel);
  const interpolatedAlt = interpolateString(alt, dataModel);

  const imgWidth = typeof width === 'number' ? width : parseInt(width || '200', 10);
  const imgHeight = typeof height === 'number' ? height : parseInt(height || '200', 10);

  // Check if src is an external URL or local path
  const isExternal = interpolatedSrc.startsWith('http://') || interpolatedSrc.startsWith('https://');

  if (isExternal) {
    // For external images, use regular img tag to avoid Next.js domain config
    return (
      <img
        src={interpolatedSrc}
        alt={interpolatedAlt}
        className={`rounded-lg ${objectFitStyles[objectFit]}`}
        style={{
          width: typeof width === 'number' ? `${width}px` : width || 'auto',
          height: typeof height === 'number' ? `${height}px` : height || 'auto',
          ...styleToCSS(style),
        }}
      />
    );
  }

  return (
    <NextImage
      src={interpolatedSrc}
      alt={interpolatedAlt}
      width={imgWidth}
      height={imgHeight}
      className={`rounded-lg ${objectFitStyles[objectFit]}`}
      style={styleToCSS(style)}
    />
  );
}

function styleToCSS(style?: ImageComponent['style']): React.CSSProperties {
  if (!style) return {};

  return {
    padding: typeof style.padding === 'number' ? `${style.padding}px` : style.padding,
    margin: typeof style.margin === 'number' ? `${style.margin}px` : style.margin,
    backgroundColor: style.backgroundColor,
    borderRadius: typeof style.borderRadius === 'number' ? `${style.borderRadius}px` : style.borderRadius,
    border: style.border,
  };
}
