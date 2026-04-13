import type { ComponentPropsWithoutRef } from 'react';

interface IconProps extends Omit<ComponentPropsWithoutRef<'svg'>, 'children' | 'height' | 'width'> {
  size?: number | string;
  width?: number | string;
  height?: number | string;
}

function createIcon(paths: string): React.FC<IconProps> {
  return function Icon({
    size,
    width = size ?? 24,
    height = size ?? 24,
    className = '',
    'aria-hidden': ariaHidden,
    ...props
  }: IconProps) {
    const computedAriaHidden =
      ariaHidden ??
      (props['aria-label'] == null && props['aria-labelledby'] == null ? true : undefined);

    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={width}
        height={height}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden={computedAriaHidden}
        {...props}
      >
        {paths.split('|').map((path) => (
          <path key={path} d={path} />
        ))}
      </svg>
    );
  };
}

export const Volume2Icon = createIcon(
  'M11 5L6 9H2v6h4l5 4V5z|M19.07 4.93a10 10 0 0 1 0 14.14|M15.54 8.46a5 5 0 0 1 0 7.07'
);

export const Volume1Icon = createIcon('M11 5L6 9H2v6h4l5 4V5z|M15.54 8.46a5 5 0 0 1 0 7.07');

export const SkipBackIcon = createIcon('M19 20L9 12l10-8v16z|M5 19V5');

export const SkipForwardIcon = createIcon('M5 4l10 8-10 8V4z|M19 5v14');
