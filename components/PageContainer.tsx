import type { ElementType, ReactNode } from 'react';

/** Matches UserHeader: container padding + max-w-7xl content column */
export const PAGE_SHELL_OUTER =
  'container mx-auto w-full px-3 sm:px-4 md:px-6 lg:px-8';

export const PAGE_SHELL_INNER = 'max-w-7xl mx-auto w-full min-w-0';

type PageContainerProps = {
  children: ReactNode;
  className?: string;
  outerClassName?: string;
  as?: ElementType;
};

/**
 * Aligns page content with the fixed navbar (logo / nav buttons share this column).
 */
export default function PageContainer({
  children,
  className = '',
  outerClassName = '',
  as: Tag = 'div',
}: PageContainerProps) {
  return (
    <Tag className={[PAGE_SHELL_OUTER, outerClassName].filter(Boolean).join(' ')}>
      <div className={[PAGE_SHELL_INNER, className].filter(Boolean).join(' ')}>{children}</div>
    </Tag>
  );
}
