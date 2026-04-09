import { Component, type ErrorInfo, type ReactNode } from 'react';

import { AppStatusActions, AppStatusPage } from '@/components/AppStatus/AppStatusPage';
import { Button } from '@/components/ui/Button/Button';
import { i18n } from '@/lib/i18n/i18n';

interface AppErrorBoundaryState {
  error: Error | null;
}

interface AppErrorBoundaryFallbackProps {
  error: Error;
  reset: () => void;
}

interface AppErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode | ((props: AppErrorBoundaryFallbackProps) => ReactNode);
}

export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  public override state: AppErrorBoundaryState = {
    error: null
  };

  public static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    return { error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('AppErrorBoundary caught an error:', error, errorInfo);
  }

  private readonly reset = () => {
    this.setState({ error: null });
  };

  public override render() {
    const { children, fallback } = this.props;
    const { error } = this.state;

    if (error === null) {
      return children;
    }

    if (typeof fallback === 'function') {
      return fallback({ error, reset: this.reset });
    }

    if (fallback) {
      return fallback;
    }

    return (
      <AppStatusPage
        eyebrow={i18n.t('error.unexpectedLabel')}
        title={i18n.t('error.unexpectedTitle')}
        body={i18n.t('error.unexpectedBody')}
        liveRegion="assertive"
      >
        <AppStatusActions>
          <Button variant="outline" size="sm" accent="secondary" onClick={this.reset}>
            {i18n.t('common.retry')}
          </Button>
        </AppStatusActions>
      </AppStatusPage>
    );
  }
}
