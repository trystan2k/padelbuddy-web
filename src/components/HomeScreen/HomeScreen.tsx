import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { CurrentMatchStartupGate } from '@/components/CurrentMatchStartupGate/CurrentMatchStartupGate';
import { SetupScreen } from '@/components/SetupScreen/SetupScreen';
import { useToast } from '@/components/ui/Toast/useToast';
import type { CurrentMatchStartupResult } from '@/lib/current-match/startup';
import type { MatchRouteErrorType } from '@/routes/-match-route-state';

const homeRouteErrorContent: Record<MatchRouteErrorType, string> = {
  'invalid-match': 'error.invalidMatch.body',
  corrupt: 'error.corruptMatch.body',
  'no-match': 'error.noMatch.body'
};

interface HomeRouteProps {
  startupState: CurrentMatchStartupResult;
  error?: MatchRouteErrorType;
}

export function HomeScreen({ startupState, error }: HomeRouteProps) {
  const { t } = useTranslation();
  const { addErrorToast } = useToast();
  const toastShownRef = useRef(false);

  useEffect(() => {
    if (!error || toastShownRef.current) {
      return;
    }

    toastShownRef.current = true;
    const errorBodyKey = homeRouteErrorContent[error];
    const translatedMessage = t(errorBodyKey);
    addErrorToast(translatedMessage, { timeout: 10000 });
  }, [error, addErrorToast, t]);

  return (
    <CurrentMatchStartupGate startupState={startupState}>
      <SetupScreen />
    </CurrentMatchStartupGate>
  );
}

export { HomeScreen as HomeRoute };
