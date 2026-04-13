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
    description: 'Client-only TanStack Start foundation for the Padel Buddy score tracker.',
    license: {
      blocked: {
        eyebrow: 'Google Play required',
        title: 'Install from Google Play',
        body: 'This build can only run when installed from the Google Play Store. If you purchased Padel Buddy, reinstall it from Google Play to restore access.'
      }
    }
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
      title: 'Remote Controller',
      description:
        'You can use your keyboard or media buttons (Volume Up/Down, Next/Previous Track) to control the match. Click a keyboard button to capture your preferred key.',
      listening: 'Listening...',
      listeningAnnouncement: 'Press a button on your remote to assign it to {{action}}.',
      notSet: 'Not set',
      mediaButtons: {
        volumeUp: 'Volume Up',
        volumeUpShort: '+ Volume',
        volumeDown: 'Volume Down',
        volumeDownShort: '- Volume',
        nextTrack: 'Next Track',
        nextTrackShort: '>> Next track',
        previousTrack: 'Previous Track',
        previousTrackShort: '<< Previous track',
        notConfigurable: 'Not configurable'
      },
      rows: {
        singlePressHint: 'Single press to add a point',
        guardedUndoHint: "Removes that team's latest scoring action",
        mediaBadgeTooltip: 'Fixed media button assignment'
      },
      actions: {
        addTeam1: 'Score Team 1',
        revertTeam1: 'Revert Team 1',
        addTeam2: 'Score Team 2',
        revertTeam2: 'Revert Team 2',
        cancel: 'Cancel',
        save: 'Save',
        clear: 'Clear',
        resetDefaults: 'Reset Defaults'
      },
      feedback: {
        loadError: 'Could not load the remote controller configuration.',
        saveError: 'Could not save the remote controller configuration.',
        saveSuccess: 'Remote controller configuration saved.',
        clearSuccess: 'Remote controller configuration cleared.',
        resetSuccess: 'Remote controller configuration reset to defaults.'
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
      finishMatch: 'Finish Game',
      exitFullscreen: 'Exit fullscreen'
    },
    sideSwitch: {
      oddGames: 'Switch sides (odd games)',
      tiebreakInterval: 'Switch sides (tiebreak)',
      description: 'Players should switch sides now.',
      confirm: 'Switched'
    }
  },
  help: {
    triggerLabel: 'Open help',
    about:
      'Padel Buddy is a live score tracker for padel matches. Track points, games, and sets in real time.',
    howToUse: {
      title: 'How to Use',
      body: "The app guides you through three main screens:\n\nSetup Screen — Enter team names, choose a match format (Best of 1, 3, or 5 sets), and configure optional rules such as Golden Point, Super Tiebreak, Side-switch Prompts, Serving Indicator, and Countdown Timer. You can also configure a Bluetooth remote controller and select a voice for audio score announcements.\n\nActive Match Screen — Tap a team's score panel to add a point, or use your configured remote control. Tap the undo button to revert the last scoring action for that team. When the Serving Indicator is enabled, the serving team's card is highlighted. When audio announcements are enabled, a voice announces each point. A side-switch prompt appears between games when that option is active.\n\nMatch End Screen — Shows the final result and match statistics. The winner is determined only by completed sets. If both teams have won the same number of sets, the result is a tie even if a third set is in progress. Use the Share button to distribute the result image, or the Continue button to keep playing without ending the match.\n\nIf the app or browser tab closes during an active match, the match state is saved automatically. When you reopen the app, you can resume the match from where you left off or discard it and start fresh."
    },
    advertising: {
      title: 'Get the App',
      body: 'Download the mobile app for a dedicated, ad-free experience on your device.',
      getItOnGooglePlay: 'Get it on Google Play',
      downloadOnAppStore: 'Download on the App Store',
      noAds: 'The mobile apps do not contain advertisements.'
    },
    pwa: {
      title: 'Install App',
      body: 'Padel Buddy is a Progressive Web App (PWA). You can install it on any device by opening your browser\'s share menu and selecting "Add to Home Screen" (or similar option). Once installed, Padel Buddy works completely offline — no internet connection is required during matches.'
    },
    spotlight: {
      title: 'Welcome to Padel Buddy',
      message: 'Start here if you have any questions',
      dismiss: 'Got it'
    }
  }
} as const;
