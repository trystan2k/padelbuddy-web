export default {
  common: {
    loading: 'Loading...',
    loadingLabel: 'Loading',
    loadingPleaseWait: 'Loading, please wait...',
    close: 'Close',
    retry: 'Try again',
    dismiss: 'Dismiss'
  },
  error: {
    loadMatch: 'Error loading match',
    unexpectedLabel: 'View recovery',
    unexpectedTitle: 'Something interrupted this screen.',
    unexpectedBody:
      'Padel Buddy hit a temporary issue while preparing this view. Try again to restore the screen.',
    invalidMatch: {
      title: 'Match not found',
      body: "The match you're looking for doesn't exist or has been cleared."
    },
    corruptMatch: {
      title: 'Match data corrupted',
      body: "The saved match data couldn't be read. Please start a new match."
    },
    noMatch: {
      title: 'No active match',
      body: "There's no match data available. Please start a new match."
    }
  },
  app: {
    title: 'Padel Buddy',
    description: 'Client-only TanStack Start foundation for the Padel Buddy score tracker.'
  },
  debugPwa: {
    reopen: 'Open PWA Debug',
    title: 'PWA Debug',
    supported: 'SW Supported',
    registered: 'SW Registered',
    ready: 'SW Ready',
    version: 'Version',
    cache: 'Cache',
    updating: 'Updating...',
    update: 'Update SW',
    clearing: 'Clearing...',
    clearCache: 'Clear Cache'
  },
  appShell: {
    eyebrow: 'App foundation',
    lead: 'A deliberately styled starter shell for the live score tracker, set up to carry future match flows without feeling like placeholder scaffolding.',
    statusPills: {
      clientOnly: 'Client-only',
      mobileReady: 'Mobile-ready',
      accessibleBaseline: 'Accessible baseline'
    },
    foundation: {
      sectionLabel: 'Styling foundation',
      sectionTitle: 'Bootstrap status',
      sectionText:
        'The shell now establishes shared global styles, component-scoped styling, and a responsive presentation layer that works cleanly on desktop and on-court mobile screens.'
    },
    foundationItems: {
      tanstackShell: {
        title: 'TanStack Start shell',
        detail: 'Route generation and the client-only bootstrap are already carrying the app frame.'
      },
      designTokens: {
        title: 'Shared design tokens',
        detail:
          'Global variables now define the spacing, color, typography, and focus baseline for future UI work.'
      },
      scopedStyling: {
        title: 'Scoped component styling',
        detail:
          'CSS Modules keep shell presentation isolated while the app grows into new screens and controls.'
      }
    },
    baseUiCheck: {
      trigger: 'Open Base UI check',
      eyebrow: 'Interaction baseline',
      title: 'Base UI is wired',
      description:
        'This dialog confirms the starter shell can render accessible, styled primitives inside the TanStack Start route.',
      close: 'Close panel'
    }
  },
  notFound: {
    eyebrow: 'Page not found',
    title: 'We could not find that route.',
    description:
      'The app foundation is running, but this page does not exist in the current route tree.',
    backLink: 'Go back to the home screen'
  },
  startupGate: {
    loading: {
      eyebrow: 'Startup check',
      title: 'Checking for a saved match',
      body: 'Padel Buddy is restoring the current-match workspace before opening the shell.'
    },
    corrupt: {
      eyebrow: 'Startup recovery',
      title: 'Saved match needs recovery',
      body: 'The current-match record could not be restored safely. Reset the saved match to continue into the app shell.',
      resetButton: 'Reset and continue'
    },
    notice: {
      title: 'Saved match was reset',
      body: 'An older saved match was cleared because it no longer matches the current app schema.',
      dismiss: 'Dismiss'
    },
    errors: {
      clearSavedMatch: 'Unable to clear the saved match right now.'
    },
    resume: {
      eyebrow: 'Saved match found',
      title: 'Resume saved match?',
      body: 'Padel Buddy restored an in-progress current match. Resume keeps the action log and restores the live score state through replay.',
      resumeButton: 'Resume match',
      discardButton: 'Discard match'
    }
  },
  speech: {
    verbosity: {
      minimal: 'Minimal',
      standard: 'Standard',
      verbose: 'Verbose'
    }
  },
  score: {
    points: {
      '0': 'Love',
      '15': 'Fifteen',
      '30': 'Thirty',
      '40': 'Forty',
      Ad: 'Advantage'
    },
    announcements: {
      game: 'Game',
      set: 'Set',
      match: 'Match',
      serving: 'Serving',
      all: 'All',
      deuce: 'Deuce',
      goldenPoint: 'Golden Point',
      correction: 'Correction.',
      gamePoint: 'Game point {{teamName}}',
      breakPoint: 'Break point',
      setPoint: 'Set point {{teamName}}',
      matchPoint: 'Match point {{teamName}}'
    }
  },
  share: {
    topbar: {
      appName: 'Padel Buddy',
      badge: 'MATCH COMPLETE'
    },
    result: {
      winners: 'WINNERS'
    },
    score: {
      title: 'Final Score',
      set: 'Set {{number}}'
    },
    stats: {
      duration: 'DURATION',
      date: 'DATE'
    }
  },
  setup: {
    header: {
      appName: 'Padel Buddy',
      subtitle: 'Setup Match'
    },
    locale: {
      selectLanguage: 'Select language'
    },
    teams: {
      team1Label: 'TEAM 1',
      team2Label: 'TEAM 2',
      team1Default: 'Team A',
      team2Default: 'Team B',
      playerPlaceholder: 'Team name'
    },
    firstServer: {
      label: 'FIRST SERVER',
      team1: 'Team 1',
      team2: 'Team 2'
    },
    format: {
      label: 'MATCH FORMAT',
      bestOf1: 'Best of 1',
      bestOf3: 'Best of 3',
      bestOf5: 'Best of 5'
    },
    rules: {
      audioAnnouncements: 'Audio Announcements',
      audioAnnouncementsHint: 'Speak chair umpire scoring updates aloud',
      goldenPoint: 'Golden Point',
      goldenPointHint: 'No advantage on deuce',
      superTiebreak: 'Super Tiebreak',
      superTiebreakHint: 'Final set tiebreak to 10 points',
      sideSwitch: 'Side-switch Prompts',
      sideSwitchHint: 'Prompt players for court side changes',
      servingIndicator: 'Serving Indicator',
      servingIndicatorHint: 'Show who is currently serving',
      countdownTimer: 'Countdown Timer',
      countdownTimerHint: 'Count down from a set match duration',
      countdownDuration: {
        label: 'Match duration',
        oneHour: '1:00 h',
        ninetyMinutes: '1:30 h',
        twoHours: '2:00 h'
      }
    },
    remoteConfig: {
      trigger: 'Remote Configuration',
      title: 'Bluetooth Remote Controller',
      description:
        'Assign one button per action. Revert buttons always remove the latest scoring action for that team only.',
      helper:
        'While listening, press any remote or keyboard button once. Saving with every action cleared removes the custom mapping.',
      listening: 'Listening...',
      listeningAnnouncement: 'Press a button on your remote to assign it to {{action}}.',
      notSet: 'Not set',
      rows: {
        singlePressHint: 'Single press to add a point',
        guardedUndoHint: "Removes that team's latest scoring action"
      },
      actions: {
        addTeam1: 'Add Team 1',
        revertTeam1: 'Revert Team 1',
        addTeam2: 'Add Team 2',
        revertTeam2: 'Revert Team 2',
        clear: 'Empty bindings',
        resetDefaults: 'Reset defaults',
        cancel: 'Cancel',
        save: 'Save'
      },
      feedback: {
        loadError: 'Could not load the remote controller bindings.',
        saveError: 'Could not save the remote controller bindings.',
        saveSuccess: 'Remote controller bindings saved.'
      }
    },
    voiceSelection: {
      title: 'Select voice',
      selectVoice: 'Select a voice',
      preview: 'Preview',
      previewLink: 'Setup voice',
      cancel: 'Cancel',
      accept: 'Accept'
    },
    startButton: 'Start Match',
    validation: {
      teamNamesRequired: 'Both team names are required',
      selectFormat: 'Please select a match format',
      selectServer: 'Please select the first server',
      invalidCountdownDuration: 'Please select a valid countdown duration'
    }
  },
  match: {
    header: {
      appName: 'Padel Buddy',
      subtitle: 'Live Match'
    },
    score: {
      games: 'Games'
    },
    scorePointFor: 'Score point for {{teamName}}',
    serving: 'Serving',
    info: {
      title: 'Court details',
      goldenPoint: 'GP',
      goldenPointOn: 'Golden point on',
      goldenPointOff: 'Golden point off',
      superTiebreakOn: 'Super tiebreak on',
      superTiebreakOff: 'Super tiebreak off',
      sideSwitchOn: 'Side-switch prompts: on',
      sideSwitchOff: 'Side-switch prompts: off'
    },
    sets: {
      label: 'Sets',
      setLabel: 'Set {{number}}',
      currentShort: 'Current',
      superTiebreakBadge: 'ST'
    },
    timer: {
      label: 'Current time: {{time}}',
      countdownLabel: 'Remaining match time: {{time}}'
    },
    rotateDevice: {
      title: 'Rotate your device',
      description:
        'This screen works best in landscape mode. Please rotate your device to continue.'
    },
    end: {
      header: {
        appName: 'Padel Buddy',
        subtitle: 'Match Complete'
      },
      winner: {
        label: 'Winners',
        finishedEarlyLabel: 'Match finished',
        finishedEarlyName: 'No winner (Tie)'
      },
      summary: {
        title: 'Set Summary',
        setLabel: 'Set {{number}}',
        setScoreRow:
          'Set {{setNumber}}: {{teamOneName}} {{teamOneScore}}, {{teamTwoName}} {{teamTwoScore}}'
      },
      stats: {
        matchLength: 'Match length',
        totalGames: 'Total games',
        durationHoursMinutes: '{{hours}}h {{minutes}}m',
        durationMinutes: '{{minutes}}m'
      },
      actions: {
        share: 'Share',
        sharing: 'Sharing...',
        newMatch: 'New Match',
        continue: 'Continue'
      },
      share: {
        text: '{{winnerName}} won a {{formatLabel}} Padel Buddy match in {{durationValue}} across {{totalGames}} games. {{teamOneName}} vs {{teamTwoName}}.',
        error: 'Unable to share this match right now.',
        download: 'Match image downloaded.',
        textFinishedEarly:
          'The {{formatLabel}} Padel Buddy match between {{teamOneName}} and {{teamTwoName}} finished early after {{durationValue}} and {{totalGames}} games.'
      },
      speech: {
        victory: 'Victory {{teamName}}',
        tiedMatch: 'Tied match'
      },
      aria: {
        summaryRegion: 'Match result summary',
        statisticsRegion: 'Match statistics'
      },
      debug: {
        previewLabel: 'Share screen debug preview',
        previewTitle: 'DEBUG — ShareScreen Preview',
        closeModal: 'Close debug modal'
      }
    },
    actions: {
      revertPoint: 'Revert point',
      finishMatch: 'Finish Game'
    },
    sideSwitch: {
      oddGames: 'Switch sides (odd games)',
      tiebreakInterval: 'Switch sides (tiebreak)',
      description: 'Players should switch sides now.',
      confirm: 'Switched'
    }
  }
} as const;
