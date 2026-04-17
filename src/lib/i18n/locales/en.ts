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
      advantageTeam: 'Advantage {{teamName}}',
      gamePoint: 'Game point {{teamName}}',
      breakPoint: 'Break point {{teamName}}',
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
      remoteController: 'Remote Controller',
      remoteControllerHint: 'Keyboard and media button support',
      remoteControllerLink: 'Setup remote',
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
        'You can use your keyboard or the media track buttons (Previous/Next Track) to control the match. Click a keyboard button to capture your preferred key.',
      listening: 'Listening...',
      listeningAnnouncement: 'Press a button on your remote to assign it to {{action}}.',
      notSet: 'Not set',
      mediaButtons: {
        nextTrack: 'Next Single Click',
        nextTrackDouble: 'Next Double Click',
        nextTrackShort: '>> Next Single Click',
        nextTrackShortDouble: '>> Next Double Click',
        previousTrack: 'Previous Single Click',
        previousTrackDouble: 'Previous Double Click',
        previousTrackShort: '<< Previous Single Click',
        previousTrackShortDouble: '<< Previous Double Click',
        notConfigurable: 'Not configurable'
      },
      rows: {
        addPointHint: 'Press to add a point to that team',
        revertPointHint: 'Press to revert the point of that team',
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
    historyButton: 'History',
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
        continue: 'Continue',
        back: 'Back'
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
  history: {
    header: {
      title: 'Match History',
      subtitle: 'Match History'
    },
    matchCount_one: '{{count}} match',
    matchCount_other: '{{count}} matches',
    emptyState: 'No finished matches yet.',
    saveError: 'Could not save this match in history.',
    saveRetry: 'Retry',
    deleteSuccess: 'Match removed from history',
    setsScore: {
      unfinishedTooltip: 'Match not finished'
    },
    table: {
      ariaLabel: 'Match history table',
      columns: {
        teams: 'Teams',
        date: 'Date',
        sets: 'Sets',
        games: 'Games',
        actions: 'Actions'
      }
    },
    actions: {
      share: 'Share',
      shareAriaLabel: 'Share match {{team1}} vs {{team2}}',
      shareCopied: 'Match summary copied to clipboard.',
      shareError: 'Unable to share this match right now.',
      delete: 'Delete',
      deleteAriaLabel: 'Delete match {{team1}} vs {{team2}}',
      deleteConfirm: 'Delete this match from history?',
      deleteError: 'Unable to delete this match right now.',
      playAgain: 'Play Again',
      playAgainError: 'Unable to prepare this rematch right now.',
      playAgainAriaLabel: 'Play again',
      back: 'Back'
    },
    shareMessage: '{{date}} · {{team1}} vs {{team2}} · Sets {{sets}} · Games {{games}}'
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
      dismiss: 'Got it',
      announcement: 'Welcome dialog open. Press Escape or click outside to close.'
    },
    page: {
      meta: {
        title: 'Padel Buddy Help & Guide',
        description:
          'Learn how Padel Buddy works from setup to live scoring, match end, history, recovery, and offline play.'
      },
      hero: {
        eyebrow: 'Help Guide',
        title: 'Everything you need to use Padel Buddy on court',
        body: 'This page explains the full product flow in plain language so any player can configure a match quickly and score with confidence.'
      },
      toc: {
        title: 'On this page',
        whatIs: 'What is Padel Buddy?',
        mainFlow: 'The main flow',
        setup: 'Setting up a match',
        liveMatch: 'Live match screen',
        matchEnd: 'Match end screen',
        history: 'Match history',
        recovery: 'Recovery and reliability',
        helpSystem: 'Built-in help system',
        accessibility: 'Languages and accessibility',
        platforms: 'Web, PWA, and native apps',
        smallDetails: 'Small but important details'
      },
      common: {
        backToHome: 'Back to home',
        startMatch: 'Start a match',
        publicOnlyNote: 'This page includes only public user-facing content.',
        placeholderLabel: 'Screenshot placeholder',
        captureHintLabel: 'How to capture',
        captionLabel: 'Caption',
        storeAvailabilityLabel: 'Also available in mobile stores'
      },
      whatIs: {
        title: 'What is Padel Buddy?',
        body: 'Padel Buddy is a match companion designed specifically for padel scoring on real courts. It combines official score logic, serve rotation, side-switch reminders, match summaries, and history in a single workflow so you do not need paper notes or multiple apps. In practice, you can set up teams before warm-up, track each point during play, and finish with a shareable result card in seconds.'
      },
      mainFlow: {
        title: 'The Main Flow of the App',
        body: 'Padel Buddy follows a clear three-step journey: configure the match, score it live, then review the final result. Each step is optimized for quick use on court, but still gives enough control for different competition formats. This flow helps players spend less time managing the app and more time playing.',
        setup: {
          title: '1) Setup',
          body: 'Before the first point, define team names, match format, service order, and optional rules such as Golden Point or Super Tiebreak. You can also enable spoken announcements, configure a remote, and choose a countdown duration. Completing setup first ensures the scoring engine behaves correctly from the first game.'
        },
        liveMatch: {
          title: '2) Live match',
          body: 'During play, use large touch targets or remote controls to add or revert points with minimal delay. The app automatically applies deuce, tiebreak, super tiebreak, serving order, and side-switch logic based on your setup. This allows fast scoring without manually calculating special cases.'
        },
        matchEndHistory: {
          title: '3) Match end and history',
          body: 'When the match ends, review winner, set-by-set score, and core stats, then optionally share a generated result image. Finished matches are stored in history so you can revisit them later, delete them, or start a rematch with prefilled team names. This keeps both immediate and long-term match records organized.'
        },
        recovery: {
          title: 'Automatic recovery',
          body: 'If the browser tab closes, the phone locks, or the app is interrupted, Padel Buddy can restore the in-progress match from local storage. On restart, you can choose to resume exactly where you stopped or discard the saved state. This protects scoring continuity during real-world interruptions.'
        }
      },
      setup: {
        title: 'Setting Up a Match',
        body: 'The setup screen is the control center where you define how the entire match will behave. Every option here directly affects live scoring, announcements, timing, and final summaries. Spending one minute configuring setup correctly prevents confusion once the match starts.',
        teamNames: {
          title: 'Team names',
          body: 'Enter clear custom names for Team 1 and Team 2, such as player pairs or club names. These names are used throughout live scoring, spoken announcements, match-end summaries, history rows, and share cards. If you play recurring matches, remembered names speed up rematches and reduce typing errors.'
        },
        matchFormat: {
          title: 'Match format',
          body: 'Choose Best of 1, Best of 3, or Best of 5 to define the number of sets required to win. This setting controls when the match can end and how many set opportunities each team has. For example, Best of 3 is common for competitive play, while Best of 1 is useful for quick court sessions.'
        },
        goldenPoint: {
          title: 'Golden Point or Advantage',
          body: 'Select between traditional advantage scoring or Golden Point at deuce. In advantage mode, teams must win two consecutive points from 40-40; in Golden Point mode, the next point immediately wins the game. Golden Point usually shortens games and increases pressure on deuce points.'
        },
        superTiebreak: {
          title: 'Deciding-set super tiebreak',
          body: 'Enable this option to replace the final deciding set with a super tiebreak to 10 points, win by 2. This is commonly used to reduce total match time while preserving a competitive finish. If disabled, the deciding set follows normal game-based scoring.'
        },
        firstServer: {
          title: 'First server',
          body: 'Choose which team serves first before the match starts. This initializes correct serve rotation for all games and tiebreak scenarios. Setting this accurately avoids serve-order corrections later.'
        },
        servingIndicator: {
          title: 'Serving indicator',
          body: 'When enabled, the currently serving team is visually highlighted on the live match screen. This provides immediate context for players and spectators, especially in fast exchanges. It is particularly useful when scorekeeper and players are switching attention quickly.'
        },
        sideSwitch: {
          title: 'Side-switch prompts',
          body: 'Enable automatic reminders for court side changes at the correct moments. The app shows a clear prompt so players can confirm and continue without losing score focus. This reduces missed side changes in long or intense matches.'
        },
        countdown: {
          title: 'Countdown timer',
          body: 'Switch the top time display to a countdown for fixed court bookings, with preset durations such as 1:00, 1:30, or 2:00. If countdown is off, the same area behaves as a regular clock/timer reference. This helps teams manage session time and decide when to finish or accelerate play.'
        },
        audio: {
          title: 'Audio announcements',
          body: 'Turn on spoken announcements so the app calls score updates and key match states out loud. This is useful when players cannot watch the screen between points or when the scorekeeper is off to the side. Audio feedback improves confidence that everyone heard the same score.'
        },
        voiceSelection: {
          title: 'Voice selection',
          body: 'Open voice selection to preview and choose the speech voice that sounds clearest on your device. Available options depend on your operating system and installed voice packs. Testing voice quality before the match prevents misunderstandings during announcements.'
        },
        remoteController: {
          title: 'Remote controller setup',
          body: 'Use remote configuration to map external buttons or keys to score and revert actions for each team. You can save custom bindings, clear individual mappings, or restore defaults at any time. This is ideal when one player controls scoring with a Bluetooth clicker or keyboard from outside the court.'
        },
        languageSelector: {
          title: 'Language selector',
          body: 'Change the interface language between English, Spanish, and Portuguese directly in setup. The selected language updates labels, help content, and most user-facing text instantly. This makes mixed-language groups more comfortable using the same device.'
        },
        historyShortcut: {
          title: 'History shortcut',
          body: 'Use the history shortcut to open past match records without starting a new match first. From there, you can review scores, share old results, delete entries, or start a rematch with prefilled teams. It is a quick way to access recent activity from the home setup flow.'
        },
        storeButtons: {
          title: 'Store buttons on web/PWA',
          body: 'On web and PWA builds, store badges provide direct links to native mobile app listings. This helps users move to their preferred install channel when they want an app-store distribution. It also clarifies platform availability in one visible place.'
        }
      },
      liveMatch: {
        title: 'Live Match Screen',
        body: 'The live match screen is optimized for fast, reliable point tracking during real games. It prioritizes large controls, clear context, and automatic rule handling so the scorekeeper can operate with minimal taps. Most complex scoring decisions are applied by the engine, not by manual calculation.',
        largeScorePanels: {
          title: 'Large score panels',
          body: 'Tap a team panel to add a point instantly, even under pressure between rallies. The layout uses large, high-contrast touch areas optimized for landscape orientation and quick interaction. This reduces accidental taps and improves scoring speed.'
        },
        servingIndicator: {
          title: 'Serving indicator',
          body: 'When enabled, the serving team is clearly highlighted so users always know service context at a glance. This visual cue aligns with scoring state and can also influence spoken announcement wording. It reduces confusion during side changes and tiebreak transitions.'
        },
        undo: {
          title: 'Per-team undo buttons',
          body: 'Each team has an independent undo action to revert the last point assigned to that side. Undo rewinds the real scoring timeline, including game, set, tiebreak, and serve progression when needed. This is essential for correcting mis-taps without rebuilding the score manually.'
        },
        automaticScoring: {
          title: 'Automatic scoring rules',
          body: 'The scoring engine automatically applies standard padel rules according to your selected configuration. It handles point progression, game wins, set wins, deuce behavior, and tiebreak transitions without manual intervention. This ensures consistent scoring even in complex end-of-set scenarios.'
        },
        deuceAdvantage: {
          title: 'Deuce and advantage',
          body: 'In advantage mode, once the game reaches 40-40, a team must win two consecutive points to close the game. The app tracks advantage state automatically and announces transitions clearly. This mirrors traditional scoring used in many official matches.'
        },
        goldenPoint: {
          title: 'Golden Point logic',
          body: 'In Golden Point mode, deuce is resolved in a single deciding point at 40-40. The next point immediately ends the game for the winning team. This option makes matches faster and adds high-pressure moments that are easy to follow in the app.'
        },
        standardTiebreak: {
          title: 'Standard tiebreak at 6-6',
          body: 'When a set reaches 6-6, the app enters a standard 7-point tiebreak with a win-by-2 requirement. If won, the set is recorded as 7-6 in the final summary. This behavior is automatic and requires no manual mode change.'
        },
        superTiebreak: {
          title: 'Deciding-set super tiebreak',
          body: 'If super tiebreak is enabled in setup, the deciding set is replaced by a race to 10 points, win by 2. The app enters this format only in the final deciding set and records the result accordingly. This supports tournament formats where full final sets are optional.'
        },
        sideSwitch: {
          title: 'Side-switch prompts',
          body: 'When active, side-switch prompts appear at the correct rule moments to remind players to change court sides. The prompt auto-hides after a short period so play can continue smoothly if no action is needed. This balances reminder visibility with uninterrupted scoring flow.'
        },
        timer: {
          title: 'Match timer / clock',
          body: 'The top timer area shows either ongoing match time context or countdown remaining time, depending on setup. Time is displayed in a clear HH:MM:SS format for quick reading during breaks. It helps teams manage pace, court booking windows, and finish decisions.'
        },
        finishAction: {
          title: 'Finish Game action',
          body: 'Use Finish Game to end the match manually when real-world conditions require stopping before official completion. Typical examples include court time limits, player injury, or agreement to stop. The app preserves recorded progress and routes to a proper summary state.'
        },
        autoFinishRoute: {
          title: 'Automatic route to match end',
          body: 'When official winning conditions are met, the app automatically navigates to the match-end screen. This removes the need to confirm completion manually and prevents accidental extra scoring. It keeps finalization consistent with the selected match format.'
        },
        rotateBlocker: {
          title: 'Portrait rotation blocker',
          body: 'On phones held in portrait orientation, live scoring asks users to rotate to landscape. This layout choice prioritizes larger controls and clearer score visibility for on-court use. It helps prevent cramped UI interactions during active play.'
        },
        compactHeight: {
          title: 'Compact-height behavior',
          body: 'On very short-height screens, secondary controls can auto-hide after inactivity to maximize score visibility. Users can bring controls back quickly when needed. This adaptive behavior keeps the main scoring area readable on smaller devices.'
        },
        wakeLock: {
          title: 'Wake lock support',
          body: 'When supported by the device and browser, the app requests wake lock to keep the screen from sleeping during play. This prevents interruptions caused by auto-lock while scoring points. If wake lock is unavailable, the app still functions normally.'
        },
        keyboardRemote: {
          title: 'Keyboard / remote / media controls',
          body: 'Beyond touch input, live scoring can be controlled by keyboard mappings, Bluetooth remotes, and supported media buttons. This flexibility allows one player or coach to score from distance without approaching the screen. It is useful for tripod setups or bench-side tracking.'
        },
        mediaDoublePress: {
          title: 'Double-press media revert',
          body: 'With compatible media controls, a single press can score while a double press can revert for the same side within a short detection window. This design supports quick corrections without opening extra menus. It is especially practical on compact clicker devices with limited buttons.'
        },
        speech: {
          title: 'Speech during live scoring',
          body: 'Speech announcements can report score updates and important match moments such as deuce, game point, set point, and match point. Audio feedback keeps all players aligned when visual attention is on the rally. It also improves accessibility for users who rely on spoken context.'
        },
        speechVerbosity: {
          title: 'Minimal / Standard / Verbose',
          body: 'Choose Minimal, Standard, or Verbose speech output depending on how much detail you want to hear. Minimal focuses on essential score calls, while Verbose adds richer contextual announcements. This allows teams to tune audio behavior to their pace and preference.'
        }
      },
      matchEnd: {
        title: 'Match End Screen',
        body: 'The match-end screen consolidates the final outcome and provides clear next actions. It is designed to close the session cleanly while preserving data for sharing and history. From here, you can start fresh or continue informal play if needed.',
        winnerCard: {
          title: 'Winner card',
          body: 'The winner card shows the team that won according to completed set rules. If the match ended early or no side achieved a clear winning condition, the card communicates that state explicitly. This avoids ambiguity when reviewing results later.'
        },
        setSummary: {
          title: 'Set summary',
          body: 'Set summary displays each completed set result in order, including deciding super tiebreak values when applicable. This provides a compact but complete record of how the match unfolded. It is useful for quick verification before sharing.'
        },
        statistics: {
          title: 'Match statistics',
          body: 'Core statistics include match duration and total games played. These metrics add context beyond the raw score and help compare match intensity over time. They also appear in share content where supported.'
        },
        spokenResult: {
          title: 'Spoken result announcement',
          body: 'If audio announcements are enabled, the final result can be spoken when entering this screen. This confirms closure without requiring users to read the screen immediately. It is helpful in noisy courts or when players are packing up.'
        },
        share: {
          title: 'Share action',
          body: 'Share generates a match card image with key details such as winner, format, set scores, duration, and date. You can send it through your preferred apps as a clean post-match summary. This makes reporting results easy for groups, clubs, or social channels.'
        },
        newMatch: {
          title: 'New Match',
          body: 'New Match ends the current session and returns directly to setup with a clean state. Use this when you are ready to start another official match immediately. It prevents accidental carry-over from the previous session.'
        },
        continue: {
          title: 'Continue',
          body: 'Continue lets you keep playing after official completion without discarding current context. This is useful for bonus games, warm-down sets, or informal extensions. The app preserves elapsed timing and scoring continuity for that extended session.'
        }
      },
      history: {
        title: 'Match History',
        body: 'Match history stores finished sessions locally so results remain available after the match ends. It works as a lightweight archive for review, sharing, and quick rematches. This helps players track recurring opponents and recent outcomes without external tools.',
        autoStorage: {
          title: 'Automatic local storage',
          body: 'Completed matches are saved automatically in local device/browser storage with no extra steps required. This ensures the result is available even if you close the app immediately after finishing. It also supports offline-first usage patterns.'
        },
        limit: {
          title: '100-match limit',
          body: 'History keeps up to the 100 most recent finished matches to control local storage size and performance. When the limit is exceeded, older entries are removed first. This keeps the list practical and responsive on mobile devices.'
        },
        tableInfo: {
          title: 'History table details',
          body: 'Each history row summarizes teams, date, set score, game totals, and available actions. The table is designed for quick scanning so you can find a specific match without opening each entry. It functions as a compact match logbook.'
        },
        winnerHighlight: {
          title: 'Winner highlighting',
          body: 'Winning teams are visually emphasized to make outcomes readable at a glance. This avoids misreading close scores when reviewing many entries. Highlighting is especially useful in tournament or league contexts.'
        },
        finishedEarly: {
          title: 'Finished-early indicator',
          body: 'Special markers identify matches that ended early or without a standard completed-set winner. This communicates that the record is valid but follows an exceptional finish condition. It adds transparency when comparing historical results.'
        },
        share: {
          title: 'Share from history',
          body: 'You can generate and share result cards from history at any later time, not only at match end. This is useful when players request the summary after leaving court. It keeps sharing flexible and does not depend on immediate action.'
        },
        delete: {
          title: 'Delete from history',
          body: 'History entries can be deleted with confirmation to prevent accidental removal. This helps keep your archive clean and relevant over time. Deletion affects only local stored records on that device.'
        },
        playAgain: {
          title: 'Play Again',
          body: 'Play Again starts a rematch using team names from the selected historical match. This reduces setup time for recurring pairings and club routines. You can still adjust format and rules before starting the new match.'
        },
        backHome: {
          title: 'Back to home',
          body: 'A dedicated back action returns you from history to the setup screen quickly. This keeps navigation predictable and avoids getting stuck in deep flows. It is useful when switching from review to starting a new game.'
        },
        emptyState: {
          title: 'Empty state',
          body: 'When no finished matches are stored yet, a friendly empty state explains that history is currently blank. This confirms the screen is working normally rather than failing to load. It also guides users toward starting their first recorded match.'
        }
      },
      recovery: {
        title: 'Recovery, Safety, and Reliability',
        body: 'Recovery features are designed to protect match progress in real-world conditions such as tab closures, app restarts, or unstable devices. The goal is to preserve as much valid state as possible while preventing corrupted scoring. These safeguards improve trust when using the app during competitive play.',
        autoPersistence: {
          title: 'Automatic current-match persistence',
          body: 'While a match is in progress, state is saved continuously in the background so recent points are not lost easily. This persistence is automatic and requires no manual save action. It forms the foundation of resume-on-restart behavior.'
        },
        resumePrompt: {
          title: 'Resume saved match prompt',
          body: 'On startup, if a saved in-progress match exists, the app asks whether to resume or discard it. Resuming restores the previous context, while discarding starts clean setup. This explicit choice prevents accidental continuation of stale matches.'
        },
        corruptRecovery: {
          title: 'Corrupt-data recovery',
          body: 'If saved match data is unreadable or invalid, the app provides a guided safe-reset path instead of crashing. This ensures users can recover quickly and return to playable state. It prioritizes reliability over risky partial restores.'
        },
        schemaReset: {
          title: 'Schema-mismatch reset notice',
          body: 'When app data schema changes make older saves incompatible, those saves can be reset automatically with a one-time explanatory notice. This keeps the app stable across updates while informing users what happened. It avoids silent failures or broken resumes.'
        },
        friendlyErrors: {
          title: 'Friendly error handling',
          body: 'For invalid routes or unavailable match records, the interface shows clear recovery-focused messages instead of technical crash output. Users are guided toward actionable next steps, such as returning to setup. This keeps error handling understandable for non-technical players.'
        },
        loadingFeedback: {
          title: 'Route loading feedback',
          body: 'During loading and route transitions, the app displays visible pending feedback so users know work is in progress. This reduces uncertainty and repeated taps during slower device moments. Good loading states improve perceived reliability and control.'
        }
      },
      helpSystem: {
        title: 'Help System Inside the App',
        body: 'Padel Buddy includes built-in help entry points so users can get guidance without leaving the app. Help content is designed to answer practical on-court questions quickly. This lowers onboarding friction for new players and occasional scorekeepers.',
        topBarHelp: {
          title: 'Top bar help trigger',
          body: 'A help action in the top bar gives quick access from key screens such as setup and match contexts. Users do not need to search through menus to find documentation. This keeps support discoverable during live use.'
        },
        spotlight: {
          title: 'First-visit spotlight',
          body: 'On first visits, a spotlight introduces where help is located and how to open it. Once dismissed, it is remembered so it does not repeatedly interrupt experienced users. This balances onboarding guidance with long-term usability.'
        },
        builtInDialog: {
          title: 'Built-in help dialog',
          body: 'The built-in help dialog summarizes core app flow, setup essentials, and installation options for web/PWA/native. It acts as a quick reference when users need immediate clarification before starting a match. This reduces dependency on external documentation.'
        }
      },
      accessibility: {
        title: 'Languages and Accessibility',
        body: 'Padel Buddy supports English, Spanish, and Portuguese with localized labels and help content so mixed-language groups can use one shared device. Accessibility features include semantic structure, keyboard-friendly controls, clear focus behavior, readable contrast, and spoken score updates. Together, these improvements make match tracking easier for users with different language, visual, and interaction needs.'
      },
      platforms: {
        title: 'PWA, Offline Use, Web, and Native Apps',
        body: 'Padel Buddy can be used in multiple delivery formats depending on your preference: browser web, installed PWA, or native mobile app. All options follow the same core scoring experience, but installation and distribution details differ by platform. Understanding these differences helps users choose the most practical setup for regular court use.',
        web: {
          title: 'Web version',
          body: 'The web version opens instantly in a compatible browser with no installation required. It is ideal for first-time use, quick trials, or occasional scoring from shared devices. You can start tracking a match immediately from a URL.'
        },
        pwa: {
          title: 'PWA experience',
          body: 'As a PWA, Padel Buddy can be installed to home screen and launched like an app in standalone mode. This experience reduces browser chrome distractions and improves quick access before matches. It also enables stronger offline behavior for court environments with weak connectivity.'
        },
        install: {
          title: 'How to install the PWA',
          body: 'To install on iOS Safari, open the share menu and choose Add to Home Screen. On Android Chrome and similar browsers, use Install App or Add to Home Screen from browser options. After installation, launch Padel Buddy from your home screen like any regular app.'
        },
        offline: {
          title: 'Offline use',
          body: 'Installed PWA sessions can continue operating during matches even when internet is unavailable. This is valuable on courts with unstable mobile data or restricted Wi-Fi. Offline readiness helps keep scoring uninterrupted from warm-up to match end.'
        },
        nativeApps: {
          title: 'Native mobile apps',
          body: 'Native app-store builds are available through Google Play and the App Store. They provide a familiar install/update flow for users who prefer store-managed apps. These versions are currently positioned as ad-free for a dedicated match experience.'
        },
        androidProtection: {
          title: 'Android license/store-origin protection',
          body: 'Some Android native distributions include license or store-origin validation that requires Google Play installation. This helps ensure the app is running from an authorized source. If validation fails, reinstalling from Google Play is the recommended fix.'
        },
        adsDifference: {
          title: 'Ads difference by platform',
          body: 'Ad behavior may differ by platform: web/PWA can include ads, while native store builds are positioned without ads. This distinction helps users choose the experience that best matches their preferences. If ad-free use is a priority, store builds are the recommended channel.'
        }
      },
      smallDetails: {
        title: 'Small But Important Details',
        body: 'These smaller product behaviors often have the biggest practical impact during real matches. They reduce friction, prevent common mistakes, and improve confidence while scoring under pressure. Knowing them in advance helps users get more value from the app immediately.',
        servingCard: {
          title: 'Serving card highlight',
          body: 'The serving team card uses visual highlight changes so service context is obvious at a glance. This helps avoid disagreements about who should serve next. It is especially useful during fast game transitions.'
        },
        sideSwitchTimeout: {
          title: 'Side-switch timeout',
          body: 'Side-switch reminders auto-hide after about 10 seconds to avoid blocking gameplay unnecessarily. Players still receive a clear reminder, but the UI quickly returns to scoring mode. This keeps the match flow smooth.'
        },
        landscapeOnly: {
          title: 'Landscape-first live scoring',
          body: 'Live scoring prioritizes landscape orientation and intentionally blocks portrait on phones. Landscape provides larger controls and better score legibility from distance. This decision improves touch accuracy and readability on court.'
        },
        resumeMatch: {
          title: 'Resume interrupted matches',
          body: 'Interrupted sessions can be resumed from saved state instead of restarting from zero. This protects match integrity when interruptions happen unexpectedly. It is one of the most important reliability features for real play.'
        },
        finishEarly: {
          title: 'Finish manually when needed',
          body: 'You can finish a match manually before official completion when needed, such as court time expiration or injury. The app records the outcome state and preserves available stats. This supports realistic match management beyond ideal conditions.'
        },
        continueAfterFinish: {
          title: 'Continue after finish',
          body: 'After official completion, you can continue scoring for extra informal games without starting over. This is useful for casual overtime play while keeping the session context. It separates official closure from optional additional points.'
        },
        deviceVoices: {
          title: 'Voices come from the device',
          body: 'Speech voices are provided by your operating system and browser, not by a fixed in-app list. Available voice names and quality may vary across devices. Checking voice options before starting helps ensure understandable announcements.'
        },
        advancedSpeech: {
          title: 'Advanced spoken states',
          body: 'Speech can include advanced match states such as deuce, Golden Point, advantage, set point, and match point. These cues provide richer context than raw point numbers alone. They help players understand pressure moments without looking at the screen.'
        },
        undoRestoresState: {
          title: 'Undo restores true state',
          body: 'Undo rewinds the real scoring timeline, including dependent states like game progression and serve order. It is not just a visual decrement of the displayed points. This ensures corrections remain rule-accurate.'
        },
        historyLimit: {
          title: 'History retention cap',
          body: 'History retention is capped to the newest 100 finished matches to maintain performance and manageable storage. Older entries roll off automatically as new ones are added. This keeps the archive lightweight on mobile devices.'
        },
        shareLater: {
          title: 'Share now or later',
          body: 'Result cards can be shared immediately at match end or generated later from history. This flexibility is useful when players are in a hurry after the game. You do not lose sharing capability if you skip it initially.'
        },
        offlineUse: {
          title: 'Offline-ready sessions',
          body: 'Installed PWA sessions are designed to keep match tracking usable without stable internet access. This is critical for courts where network quality changes during play. Offline readiness reduces risk of interrupted scoring.'
        },
        rememberedPreferences: {
          title: 'Remembered setup preferences',
          body: 'Padel Buddy can remember team names and key setup preferences to speed up future match creation. This reduces repetitive configuration work for regular groups. Faster setup means less delay before the first serve.'
        },
        spotlightDiscovery: {
          title: 'Help discovery spotlight',
          body: 'A first-visit spotlight points users to the help entry so documentation is easy to discover early. After it is seen once, it stays out of the way for returning users. This supports onboarding without recurring interruptions.'
        }
      },
      media: {
        hero: {
          title: 'Hero on-court usage shot',
          description: 'Phone near court bench with live score visible and optional remote nearby.',
          captureHint: 'Take a real on-court photo with the live match screen open in landscape.',
          caption: 'Keep the score without leaving the game.'
        },
        mainFlow: {
          title: 'Main app flow visual',
          description: 'Simple 3-step sequence: Setup → Live Match → Match End / History.',
          captureHint: 'Use a clean illustration or collage from real screens.',
          caption: 'From setup to summary in a simple flow.'
        },
        setupOverview: {
          title: 'Setup screen overview',
          description: 'Full setup view highlighting rules, teams, history, and start action.',
          captureHint: 'Capture setup with audio enabled so voice setup controls are visible.',
          caption: 'Everything you need before the first point.'
        },
        remoteConfig: {
          title: 'Remote configuration modal',
          description: 'Shows key mapping fields plus clear/reset/save controls.',
          captureHint: 'Open the remote modal from setup and capture with filled bindings.',
          caption: 'Configure score controls for your remote device.'
        },
        voiceSelection: {
          title: 'Voice selection modal',
          description: 'Voice list grouped by locale with preview/accept actions.',
          captureHint: 'Open voice selection while audio announcements are enabled.',
          caption: 'Choose the voice that best fits your match.'
        },
        liveMatch: {
          title: 'Live match screen in landscape',
          description: 'Score cards, timer, serving highlight, undo, and finish action visible.',
          captureHint: 'Use a realistic mid-game state (for example 40–30).',
          caption: 'Big controls, clear scoring, and live context at a glance.'
        },
        sideSwitch: {
          title: 'Side-switch prompt modal',
          description: 'Modal reminding players to switch sides with confirmation action.',
          captureHint: 'Enable side-switch prompts and capture before auto-hide.',
          caption: 'The app reminds players when it is time to switch sides.'
        },
        rotateBlocker: {
          title: 'Portrait rotate blocker',
          description: 'Phone portrait blocker requesting rotation to landscape.',
          captureHint: 'Open a live match on a portrait phone-sized viewport.',
          caption: 'The live scoring screen is optimized for landscape use.'
        },
        matchEnd: {
          title: 'Match end summary screen',
          description: 'Winner card, set summary, stats, and action buttons.',
          captureHint: 'Finish a match and capture the complete summary state.',
          caption: 'Review the result, share it, or keep playing.'
        },
        shareImage: {
          title: 'Generated share image',
          description: 'Exportable match card with winner, scores, date, and duration.',
          captureHint: 'Use share action and capture the generated artifact.',
          caption: 'A ready-to-share match result image.'
        },
        historyList: {
          title: 'History list with records',
          description: 'Multiple entries with winner highlighting and actions.',
          captureHint: 'Populate several matches and open history list.',
          caption: 'Recent matches stay easy to review, share, and replay.'
        },
        historyEmpty: {
          title: 'History empty state',
          description: 'Friendly empty message when no finished matches exist.',
          captureHint: 'Clear history records and capture the empty view.',
          caption: 'No finished matches yet.'
        },
        resumeDialog: {
          title: 'Resume saved match dialog',
          description: 'Startup prompt offering resume or discard actions.',
          captureHint: 'Interrupt a live match and relaunch to trigger the prompt.',
          caption: 'You can safely continue where you left off.'
        },
        corruptRecovery: {
          title: 'Corrupt-data recovery state',
          description: 'Guided recovery message when saved match data is invalid.',
          captureHint: 'Load seeded invalid current-match data and capture recovery view.',
          caption: 'If stored data is invalid, the app guides you back safely.'
        },
        helpSpotlight: {
          title: 'Help spotlight in top bar',
          description: 'First-visit spotlight pointing users to help action.',
          captureHint: 'Use a fresh profile where help spotlight has not been seen yet.',
          caption: 'New users are guided toward the help area.'
        },
        platformComparison: {
          title: 'Web vs PWA vs Native comparison',
          description: 'Comparison card for install, offline support, stores, and ads differences.',
          captureHint: 'Create a designed comparison visual aligned with current product behavior.',
          caption: 'Use Padel Buddy in the format that fits you best.'
        }
      }
    }
  }
} as const;
