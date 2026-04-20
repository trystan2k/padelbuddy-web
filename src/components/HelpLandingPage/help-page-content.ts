export type HelpPageMediaId =
  | 'hero'
  | 'mainFlow'
  | 'setupOverview'
  | 'remoteConfig'
  | 'voiceSelection'
  | 'liveMatch'
  | 'sideSwitch'
  | 'matchEnd'
  | 'shareImage'
  | 'historyList'
  | 'historyEmpty'
  | 'resumeDialog'
  | 'helpSpotlight'
  | 'platformComparison';

export interface HelpSectionItem {
  titleKey: string;
  bodyKey: string;
  bodyComponents?: 'remoteLink';
}

export interface HelpSectionContent {
  id: string;
  tocKey: string;
  titleKey: string;
  bodyKey: string;
  items: HelpSectionItem[];
  media: HelpPageMediaId[];
}

export const HELP_PAGE_SECTIONS: HelpSectionContent[] = [
  {
    id: 'what-is',
    tocKey: 'help.page.toc.whatIs',
    titleKey: 'help.page.whatIs.title',
    bodyKey: 'help.page.whatIs.body',
    items: [],
    media: ['hero']
  },
  {
    id: 'main-flow',
    tocKey: 'help.page.toc.mainFlow',
    titleKey: 'help.page.mainFlow.title',
    bodyKey: 'help.page.mainFlow.body',
    items: [
      { titleKey: 'help.page.mainFlow.setup.title', bodyKey: 'help.page.mainFlow.setup.body' },
      {
        titleKey: 'help.page.mainFlow.liveMatch.title',
        bodyKey: 'help.page.mainFlow.liveMatch.body'
      },
      {
        titleKey: 'help.page.mainFlow.matchEndHistory.title',
        bodyKey: 'help.page.mainFlow.matchEndHistory.body'
      },
      {
        titleKey: 'help.page.mainFlow.recovery.title',
        bodyKey: 'help.page.mainFlow.recovery.body'
      }
    ],
    media: ['mainFlow']
  },
  {
    id: 'setup',
    tocKey: 'help.page.toc.setup',
    titleKey: 'help.page.setup.title',
    bodyKey: 'help.page.setup.body',
    items: [
      { titleKey: 'help.page.setup.teamNames.title', bodyKey: 'help.page.setup.teamNames.body' },
      {
        titleKey: 'help.page.setup.matchFormat.title',
        bodyKey: 'help.page.setup.matchFormat.body'
      },
      {
        titleKey: 'help.page.setup.goldenPoint.title',
        bodyKey: 'help.page.setup.goldenPoint.body'
      },
      {
        titleKey: 'help.page.setup.superTiebreak.title',
        bodyKey: 'help.page.setup.superTiebreak.body'
      },
      {
        titleKey: 'help.page.setup.firstServer.title',
        bodyKey: 'help.page.setup.firstServer.body'
      },
      {
        titleKey: 'help.page.setup.servingIndicator.title',
        bodyKey: 'help.page.setup.servingIndicator.body'
      },
      { titleKey: 'help.page.setup.sideSwitch.title', bodyKey: 'help.page.setup.sideSwitch.body' },
      { titleKey: 'help.page.setup.countdown.title', bodyKey: 'help.page.setup.countdown.body' },
      { titleKey: 'help.page.setup.audio.title', bodyKey: 'help.page.setup.audio.body' },
      {
        titleKey: 'help.page.setup.voiceSelection.title',
        bodyKey: 'help.page.setup.voiceSelection.body'
      },
      {
        titleKey: 'help.page.setup.remoteController.title',
        bodyKey: 'help.page.setup.remoteController.body',
        bodyComponents: 'remoteLink'
      },
      {
        titleKey: 'help.page.setup.languageSelector.title',
        bodyKey: 'help.page.setup.languageSelector.body'
      },
      {
        titleKey: 'help.page.setup.historyShortcut.title',
        bodyKey: 'help.page.setup.historyShortcut.body'
      },
      {
        titleKey: 'help.page.setup.storeButtons.title',
        bodyKey: 'help.page.setup.storeButtons.body'
      }
    ],
    media: ['setupOverview', 'remoteConfig', 'voiceSelection']
  },
  {
    id: 'live-match',
    tocKey: 'help.page.toc.liveMatch',
    titleKey: 'help.page.liveMatch.title',
    bodyKey: 'help.page.liveMatch.body',
    items: [
      {
        titleKey: 'help.page.liveMatch.largeScorePanels.title',
        bodyKey: 'help.page.liveMatch.largeScorePanels.body'
      },
      {
        titleKey: 'help.page.liveMatch.servingIndicator.title',
        bodyKey: 'help.page.liveMatch.servingIndicator.body'
      },
      { titleKey: 'help.page.liveMatch.undo.title', bodyKey: 'help.page.liveMatch.undo.body' },
      {
        titleKey: 'help.page.liveMatch.automaticScoring.title',
        bodyKey: 'help.page.liveMatch.automaticScoring.body'
      },
      {
        titleKey: 'help.page.liveMatch.deuceAdvantage.title',
        bodyKey: 'help.page.liveMatch.deuceAdvantage.body'
      },
      {
        titleKey: 'help.page.liveMatch.goldenPoint.title',
        bodyKey: 'help.page.liveMatch.goldenPoint.body'
      },
      {
        titleKey: 'help.page.liveMatch.standardTiebreak.title',
        bodyKey: 'help.page.liveMatch.standardTiebreak.body'
      },
      {
        titleKey: 'help.page.liveMatch.superTiebreak.title',
        bodyKey: 'help.page.liveMatch.superTiebreak.body'
      },
      {
        titleKey: 'help.page.liveMatch.sideSwitch.title',
        bodyKey: 'help.page.liveMatch.sideSwitch.body'
      },
      { titleKey: 'help.page.liveMatch.timer.title', bodyKey: 'help.page.liveMatch.timer.body' },
      {
        titleKey: 'help.page.liveMatch.finishAction.title',
        bodyKey: 'help.page.liveMatch.finishAction.body'
      },
      {
        titleKey: 'help.page.liveMatch.autoFinishRoute.title',
        bodyKey: 'help.page.liveMatch.autoFinishRoute.body'
      },
      {
        titleKey: 'help.page.liveMatch.compactHeight.title',
        bodyKey: 'help.page.liveMatch.compactHeight.body'
      },
      {
        titleKey: 'help.page.liveMatch.wakeLock.title',
        bodyKey: 'help.page.liveMatch.wakeLock.body'
      },
      {
        titleKey: 'help.page.liveMatch.keyboardRemote.title',
        bodyKey: 'help.page.liveMatch.keyboardRemote.body'
      },
      {
        titleKey: 'help.page.liveMatch.mediaDoublePress.title',
        bodyKey: 'help.page.liveMatch.mediaDoublePress.body'
      },
      { titleKey: 'help.page.liveMatch.speech.title', bodyKey: 'help.page.liveMatch.speech.body' },
      {
        titleKey: 'help.page.liveMatch.speechVerbosity.title',
        bodyKey: 'help.page.liveMatch.speechVerbosity.body'
      }
    ],
    media: ['liveMatch', 'sideSwitch']
  },
  {
    id: 'match-end',
    tocKey: 'help.page.toc.matchEnd',
    titleKey: 'help.page.matchEnd.title',
    bodyKey: 'help.page.matchEnd.body',
    items: [
      {
        titleKey: 'help.page.matchEnd.winnerCard.title',
        bodyKey: 'help.page.matchEnd.winnerCard.body'
      },
      {
        titleKey: 'help.page.matchEnd.setSummary.title',
        bodyKey: 'help.page.matchEnd.setSummary.body'
      },
      {
        titleKey: 'help.page.matchEnd.statistics.title',
        bodyKey: 'help.page.matchEnd.statistics.body'
      },
      {
        titleKey: 'help.page.matchEnd.spokenResult.title',
        bodyKey: 'help.page.matchEnd.spokenResult.body'
      },
      { titleKey: 'help.page.matchEnd.share.title', bodyKey: 'help.page.matchEnd.share.body' },
      {
        titleKey: 'help.page.matchEnd.newMatch.title',
        bodyKey: 'help.page.matchEnd.newMatch.body'
      },
      { titleKey: 'help.page.matchEnd.continue.title', bodyKey: 'help.page.matchEnd.continue.body' }
    ],
    media: ['matchEnd', 'shareImage']
  },
  {
    id: 'history',
    tocKey: 'help.page.toc.history',
    titleKey: 'help.page.history.title',
    bodyKey: 'help.page.history.body',
    items: [
      {
        titleKey: 'help.page.history.autoStorage.title',
        bodyKey: 'help.page.history.autoStorage.body'
      },
      { titleKey: 'help.page.history.limit.title', bodyKey: 'help.page.history.limit.body' },
      {
        titleKey: 'help.page.history.tableInfo.title',
        bodyKey: 'help.page.history.tableInfo.body'
      },
      {
        titleKey: 'help.page.history.winnerHighlight.title',
        bodyKey: 'help.page.history.winnerHighlight.body'
      },
      {
        titleKey: 'help.page.history.finishedEarly.title',
        bodyKey: 'help.page.history.finishedEarly.body'
      },
      { titleKey: 'help.page.history.share.title', bodyKey: 'help.page.history.share.body' },
      { titleKey: 'help.page.history.delete.title', bodyKey: 'help.page.history.delete.body' },
      {
        titleKey: 'help.page.history.playAgain.title',
        bodyKey: 'help.page.history.playAgain.body'
      },
      { titleKey: 'help.page.history.backHome.title', bodyKey: 'help.page.history.backHome.body' },
      {
        titleKey: 'help.page.history.emptyState.title',
        bodyKey: 'help.page.history.emptyState.body'
      }
    ],
    media: ['historyList', 'historyEmpty']
  },
  {
    id: 'recovery',
    tocKey: 'help.page.toc.recovery',
    titleKey: 'help.page.recovery.title',
    bodyKey: 'help.page.recovery.body',
    items: [
      {
        titleKey: 'help.page.recovery.autoPersistence.title',
        bodyKey: 'help.page.recovery.autoPersistence.body'
      },
      {
        titleKey: 'help.page.recovery.resumePrompt.title',
        bodyKey: 'help.page.recovery.resumePrompt.body'
      },
      {
        titleKey: 'help.page.recovery.schemaReset.title',
        bodyKey: 'help.page.recovery.schemaReset.body'
      },
      {
        titleKey: 'help.page.recovery.friendlyErrors.title',
        bodyKey: 'help.page.recovery.friendlyErrors.body'
      },
      {
        titleKey: 'help.page.recovery.loadingFeedback.title',
        bodyKey: 'help.page.recovery.loadingFeedback.body'
      }
    ],
    media: ['resumeDialog']
  },
  {
    id: 'help-system',
    tocKey: 'help.page.toc.helpSystem',
    titleKey: 'help.page.helpSystem.title',
    bodyKey: 'help.page.helpSystem.body',
    items: [
      {
        titleKey: 'help.page.helpSystem.topBarHelp.title',
        bodyKey: 'help.page.helpSystem.topBarHelp.body'
      },
      {
        titleKey: 'help.page.helpSystem.spotlight.title',
        bodyKey: 'help.page.helpSystem.spotlight.body'
      },
      {
        titleKey: 'help.page.helpSystem.builtInDialog.title',
        bodyKey: 'help.page.helpSystem.builtInDialog.body'
      }
    ],
    media: ['helpSpotlight']
  },
  {
    id: 'accessibility',
    tocKey: 'help.page.toc.accessibility',
    titleKey: 'help.page.accessibility.title',
    bodyKey: 'help.page.accessibility.body',
    items: [],
    media: []
  },
  {
    id: 'platforms',
    tocKey: 'help.page.toc.platforms',
    titleKey: 'help.page.platforms.title',
    bodyKey: 'help.page.platforms.body',
    items: [
      { titleKey: 'help.page.platforms.web.title', bodyKey: 'help.page.platforms.web.body' },
      { titleKey: 'help.page.platforms.pwa.title', bodyKey: 'help.page.platforms.pwa.body' },
      {
        titleKey: 'help.page.platforms.install.title',
        bodyKey: 'help.page.platforms.install.body'
      },
      {
        titleKey: 'help.page.platforms.offline.title',
        bodyKey: 'help.page.platforms.offline.body'
      },
      {
        titleKey: 'help.page.platforms.nativeApps.title',
        bodyKey: 'help.page.platforms.nativeApps.body'
      },
      {
        titleKey: 'help.page.platforms.androidProtection.title',
        bodyKey: 'help.page.platforms.androidProtection.body'
      },
      {
        titleKey: 'help.page.platforms.adsDifference.title',
        bodyKey: 'help.page.platforms.adsDifference.body'
      }
    ],
    media: ['platformComparison']
  },
  {
    id: 'small-details',
    tocKey: 'help.page.toc.smallDetails',
    titleKey: 'help.page.smallDetails.title',
    bodyKey: 'help.page.smallDetails.body',
    items: [
      {
        titleKey: 'help.page.smallDetails.servingCard.title',
        bodyKey: 'help.page.smallDetails.servingCard.body'
      },
      {
        titleKey: 'help.page.smallDetails.sideSwitchTimeout.title',
        bodyKey: 'help.page.smallDetails.sideSwitchTimeout.body'
      },
      {
        titleKey: 'help.page.smallDetails.landscapeOnly.title',
        bodyKey: 'help.page.smallDetails.landscapeOnly.body'
      },
      {
        titleKey: 'help.page.smallDetails.resumeMatch.title',
        bodyKey: 'help.page.smallDetails.resumeMatch.body'
      },
      {
        titleKey: 'help.page.smallDetails.finishEarly.title',
        bodyKey: 'help.page.smallDetails.finishEarly.body'
      },
      {
        titleKey: 'help.page.smallDetails.continueAfterFinish.title',
        bodyKey: 'help.page.smallDetails.continueAfterFinish.body'
      },
      {
        titleKey: 'help.page.smallDetails.deviceVoices.title',
        bodyKey: 'help.page.smallDetails.deviceVoices.body'
      },
      {
        titleKey: 'help.page.smallDetails.advancedSpeech.title',
        bodyKey: 'help.page.smallDetails.advancedSpeech.body'
      },
      {
        titleKey: 'help.page.smallDetails.undoRestoresState.title',
        bodyKey: 'help.page.smallDetails.undoRestoresState.body'
      },
      {
        titleKey: 'help.page.smallDetails.historyLimit.title',
        bodyKey: 'help.page.smallDetails.historyLimit.body'
      },
      {
        titleKey: 'help.page.smallDetails.shareLater.title',
        bodyKey: 'help.page.smallDetails.shareLater.body'
      },
      {
        titleKey: 'help.page.smallDetails.offlineUse.title',
        bodyKey: 'help.page.smallDetails.offlineUse.body'
      },
      {
        titleKey: 'help.page.smallDetails.rememberedPreferences.title',
        bodyKey: 'help.page.smallDetails.rememberedPreferences.body'
      },
      {
        titleKey: 'help.page.smallDetails.spotlightDiscovery.title',
        bodyKey: 'help.page.smallDetails.spotlightDiscovery.body'
      }
    ],
    media: []
  }
];
