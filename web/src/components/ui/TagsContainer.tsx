import React from 'react';

interface TagsContainerProps {
  children?: React.ReactNode;
  /** Additional class names */
  className?: string;
  /** Gap between items - default is 'gap-1' */
  gap?: string;
  /** Direction of tags - 'row' or 'column' */
  direction?: 'row' | 'column';
  /** Whether to wrap tags or not */
  wrap?: boolean;
}

/**
 * Container component for organizing multiple tags
 * with consistent spacing and flex behavior
 */
export const TagsContainer: React.FC<TagsContainerProps> = ({ 
  children, 
  className = '',
  gap = 'gap-1',
  direction = 'row',
  wrap = true
}) => {
  const flexDirection = direction === 'row' ? 'flex-row' : 'flex-col';
  const flexWrap = wrap ? 'flex-wrap' : 'flex-nowrap';
  
  return (
    <div className={`flex ${flexDirection} ${flexWrap} ${gap} ${className}`}>
      {children}
    </div>
  );
};

export default TagsContainer;