import React from 'react';

export interface TagProps {
  /** Text content of the tag */
  text: string;
  /** Color variant - default uses neutral color */
  variant?: 'default' | 'highlight' | 'primary' | 'black';
  /** Size variant of the tag */
  size?: 'small' | 'normal';
  /** Whether to use uppercase text */
  uppercase?: boolean;
  /** Additional class names */
  className?: string;
  /** Optional click handler */
  onClick?: () => void;
}

/**
 * Tag component for consistent badge/tag/pill styling across the application
 */
export const Tag: React.FC<TagProps> = ({
  text,
  variant = 'default',
  size = 'normal',
  uppercase = false,
  className = '',
  onClick,
}) => {
  // Define styling based on variant
  const variantStyles = {
    default: 'bg-[var(--neutral)]/20 text-[var(--neutral)]',
    highlight: 'bg-[var(--highlight)]/80 text-white',
    primary: 'bg-[var(--primary)]/20 text-[var(--primary)]',
    black: 'bg-black/30 text-white',
  }[variant];

  // Define styling based on size
  const sizeStyles = {
    small: 'text-[10px] px-2.5 py-0.5 rounded-xl',
    normal: 'text-xs px-2.5 py-0.5 rounded-[10px]',
  }[size];

  return (
    <span
      className={`inline-block font-medium whitespace-nowrap overflow-hidden ${variantStyles} ${sizeStyles} ${
        uppercase ? 'uppercase' : ''
      } ${className}`}
      onClick={onClick}
    >
      {text}
    </span>
  );
};

export default Tag;
