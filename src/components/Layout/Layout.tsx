import { type ComponentPropsWithoutRef, type ReactNode, type Ref } from 'react';

import { cn } from '@/lib/utils/cn';

import styles from './Layout.module.css';

export interface LayoutProps extends Omit<ComponentPropsWithoutRef<'main'>, 'children'> {
  ref?: Ref<HTMLElement>;
  /** Optional header content (navigation, metadata, etc.) */
  header?: ReactNode;
  /** Optional footer content (primary actions, buttons, etc.) */
  footer?: ReactNode;
  /** Additional CSS class for the body section */
  bodyClassName?: string;
  /** Main content rendered inside the shell body */
  children?: ReactNode;
}

export function Layout({
  ref,
  header,
  footer,
  children,
  className,
  bodyClassName,
  ...props
}: LayoutProps) {
  return (
    <main ref={ref} className={cn(styles.layout, className)} {...props}>
      <div className={styles.container}>
        {header && <header className={styles.header}>{header}</header>}
        <div
          className={cn(styles.body, bodyClassName)}
          data-testid="layout-body"
          data-view-transition-body="true"
        >
          {children}
        </div>
        {footer && <footer className={styles.footer}>{footer}</footer>}
      </div>
    </main>
  );
}
