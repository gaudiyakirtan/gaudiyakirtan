import React from 'react';

export type TagVariant = 'default' | 'highlight' | 'primary' | 'black' | 'custom';
export type TagSize = 'small' | 'normal' | 'custom';

export interface TagProps {
  /** Text content of the tag */
  text: string;
  /** Color variant - default uses neutral color */
  variant?: TagVariant;
  /** Size variant of the tag */
  size?: TagSize;
  /** Whether to use uppercase text */
  uppercase?: boolean;
  /** Additional class names */
  className?: string;
  /** Background color (only used with variant='custom') */
  bgColor?: string;
  /** Text color (only used with variant='custom') */
  textColor?: string;
  /** Custom padding (only used with size='custom') */
  padding?: string;
  /** Custom border radius */
  borderRadius?: string;
  /** Optional click handler */
  onClick?: () => void;
}

// Export utility classes for direct use
export const tagStyles = {
  base: 'inline-block font-medium whitespace-nowrap overflow-hidden',
  variant: {
    default: 'bg-[var(--neutral)]/20 text-[var(--neutral)]',
    highlight: 'bg-[var(--highlight)]/80 text-white',
    primary: 'bg-[var(--primary)]/20 text-[var(--primary)]',
    black: 'bg-black/30 text-white',
  },
  size: {
    small: 'text-[10px] px-2.5 py-0.5 rounded-xl',
    normal: 'text-xs px-2.5 py-0.5 rounded-[10px]',
  }
};

/**
 * Tag component for consistent badge/tag/pill styling across the application
 */
export const Tag: React.FC<TagProps> = ({
  text,
  variant = 'default',
  size = 'normal',
  uppercase = false,
  className = '',
  bgColor,
  textColor,
  padding,
  borderRadius,
  onClick,
}) => {
  // Handle custom variant styling
  let variantStyles = '';
  if (variant === 'custom' && bgColor && textColor) {
    variantStyles = `${bgColor} ${textColor}`;
  } else {
    variantStyles = tagStyles.variant[variant as keyof typeof tagStyles.variant] || '';
  }

  // Handle custom size styling
  let sizeStyles = '';
  if (size === 'custom' && padding && borderRadius) {
    sizeStyles = `text-xs ${padding} ${borderRadius}`;
  } else {
    sizeStyles = tagStyles.size[size as keyof typeof tagStyles.size] || '';
  }

  // Override border radius if provided
  if (borderRadius && size !== 'custom') {
    sizeStyles = sizeStyles.replace(/rounded-\w+/, borderRadius);
  }

  return (
    <span
      className={`${tagStyles.base} ${variantStyles} ${sizeStyles} ${
        uppercase ? 'uppercase' : ''
      } ${className}`}
      onClick={onClick}
    >
      {text}
    </span>
  );
};

export default Tag;