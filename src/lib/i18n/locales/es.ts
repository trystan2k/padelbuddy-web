export default {
  common: {
    loading: 'Cargando...',
    retry: 'Intentar de nuevo',
    dismiss: 'Descartar'
  },
  error: {
    loadMatch: 'Error al cargar el partido',
    unexpectedLabel: 'Recuperación de vista',
    unexpectedTitle: 'Algo interrumpió esta pantalla.',
    unexpectedBody:
      'Padel Buddy encontró un problema temporal mientras preparaba esta vista. Inténtalo de nuevo para restaurar la pantalla.',
    invalidMatch: {
      title: 'Partido no encontrado',
      body: 'El partido que buscas no existe o ya fue eliminado.'
    },
    corruptMatch: {
      title: 'Datos del partido dañados',
      body: 'No se pudieron leer los datos guardados del partido. Inicia un partido nuevo.'
    },
    noMatch: {
      title: 'No hay un partido activo',
      body: 'No hay datos de partido disponibles. Inicia un partido nuevo.'
    }
  },
  app: {
    title: 'Padel Buddy',
    description: 'Una base estilizada para el rastreador de puntuación en vivo.'
  },
  appShell: {
    eyebrow: 'Base de la aplicación',
    lead: 'Una base estilizada para el rastreador de puntuación en vivo, configurada para soportar futuros flujos de partidos sin parecer un andamiaje provisional.',
    statusPills: {
      clientOnly: 'Solo cliente',
      mobileReady: 'Listo para móvil',
      accessibleBaseline: 'Base accesible'
    },
    foundation: {
      sectionLabel: 'Base de estilo',
      sectionTitle: 'Estado de inicialización',
      sectionText:
        'La base ahora establece estilos globales compartidos, estilo con alcance de componente y una capa de presentación responsiva que funciona claramente en escritorio y pantallas móviles en cancha.'
    },
    foundationItems: {
      tanstackShell: {
        title: 'Shell TanStack Start',
        detail:
          'La generación de rutas y la inicialización solo cliente ya están cargando la estructura de la aplicación.'
      },
      designTokens: {
        title: 'Tokens de diseño compartidos',
        detail:
          'Las variables globales ahora definen el espaciado, colores, tipografía y línea base de enfoque para futuros trabajos de UI.'
      },
      scopedStyling: {
        title: 'Estilo de componente con alcance',
        detail:
          'CSS Modules mantienen la presentación del shell aislada mientras la aplicación crece en nuevas pantallas y controles.'
      }
    },
    baseUiCheck: {
      trigger: 'Verificar Base UI',
      eyebrow: 'Base de interacción',
      title: 'Base UI conectado',
      description:
        'Este diálogo confirma que la base puede renderizar primitivas accesibles y estilizadas dentro de la ruta TanStack Start.',
      close: 'Cerrar panel'
    }
  },
  notFound: {
    eyebrow: 'Página no encontrada',
    title: 'No pudimos encontrar esa ruta.',
    description:
      'La base de la aplicación está funcionando, pero esta página no existe en el árbol de rutas actual.',
    backLink: 'Volver a la pantalla de inicio'
  },
  startupGate: {
    loading: {
      eyebrow: 'Verificación de inicio',
      title: 'Buscando partido guardado',
      body: 'Padel Buddy está restaurando el espacio de trabajo del partido actual antes de abrir el shell.'
    },
    corrupt: {
      eyebrow: 'Recuperación de inicio',
      title: 'El partido guardado necesita recuperación',
      body: 'El registro del partido actual no pudo ser restaurado de forma segura. Reinicia el partido guardado para continuar en el shell de la aplicación.',
      resetButton: 'Reiniciar y continuar'
    },
    notice: {
      title: 'El partido guardado fue reiniciado',
      body: 'Un partido guardado más antiguo fue eliminado porque ya no coincide con el esquema actual de la aplicación.',
      dismiss: 'Descartar'
    },
    resume: {
      eyebrow: 'Partido guardado encontrado',
      title: '¿Retomar partido guardado?',
      body: 'Padel Buddy restauró un partido actual en progreso. Retomar mantiene el registro de acciones y restaura el estado de puntuación en vivo a través de replay.',
      resumeButton: 'Retomar',
      discardButton: 'Descartar'
    }
  },
  speech: {
    verbosity: {
      minimal: 'Mínimo',
      standard: 'Estándar',
      verbose: 'Detallado'
    }
  },
  score: {
    points: {
      '0': 'Cero',
      '15': 'Quince',
      '30': 'Treinta',
      '40': 'Cuarenta',
      Ad: 'Ventaja'
    },
    announcements: {
      game: 'Juego',
      set: 'Set',
      match: 'Partido',
      serving: 'Sacando',
      all: 'Iguales',
      deuce: 'Deuce',
      goldenPoint: 'Punto de Oro',
      correction: 'Corrección.',
      gamePoint: 'Game Point {{teamName}}',
      breakPoint: 'Break point',
      setPoint: 'Set Point {{teamName}}',
      matchPoint: 'Match point {{teamName}}'
    }
  },
  share: {
    topbar: {
      appName: 'Padel Buddy',
      badge: 'PARTIDO TERMINADO'
    },
    result: {
      winners: 'GANADORES'
    },
    score: {
      title: 'Resultado',
      set: 'Set {{number}}'
    },
    stats: {
      duration: 'DURACIÓN',
      date: 'FECHA'
    }
  },
  setup: {
    header: {
      appName: 'Padel Buddy',
      subtitle: 'Configurar partido'
    },
    locale: {
      selectLanguage: 'Seleccionar idioma'
    },
    teams: {
      team1Label: 'EQUIPO 1',
      team2Label: 'EQUIPO 2',
      team1Default: 'Equipo A',
      team2Default: 'Equipo B',
      playerPlaceholder: 'Nombre del equipo'
    },
    firstServer: {
      label: 'PRIMER SAQUE',
      team1: 'Equipo 1',
      team2: 'Equipo 2'
    },
    format: {
      label: 'FORMATO DEL PARTIDO',
      bestOf1: 'Mejor de 1',
      bestOf3: 'Mejor de 3',
      bestOf5: 'Mejor de 5'
    },
    rules: {
      audioAnnouncements: 'Anuncios de audio',
      audioAnnouncementsHint: 'Lee la puntuación como un juez de silla',
      goldenPoint: 'Punto de Oro',
      goldenPointHint: 'Sin ventaja en deuce',
      superTiebreak: 'Super Tiebreak',
      superTiebreakHint: 'Tiebreak en el set final a 10 puntos',
      sideSwitch: 'Avisos de Cambio de Lado',
      sideSwitchHint: 'Recordar a jugadores cambiar de lado',
      servingIndicator: 'Indicador de servicio',
      servingIndicatorHint: 'Muestra quién está sacando actualmente',
      countdownTimer: 'Temporizador regresivo',
      countdownTimerHint: 'Cuenta regresiva de tiempo fijo del partido',
      countdownDuration: {
        label: 'Duración del partido',
        oneHour: '1:00 h',
        ninetyMinutes: '1:30 h',
        twoHours: '2:00 h'
      }
    },
    remoteConfig: {
      trigger: 'Config. del control remoto',
      title: 'Control remoto Bluetooth',
      description:
        'Asigna un botón por acción. Los botones de revertir siempre eliminan solo la última acción de puntuación de ese equipo.',
      helper:
        'Mientras está escuchando, presiona una vez cualquier botón del control o teclado. Guardar con todas las acciones vacías elimina la configuración personalizada.',
      listening: 'Escuchando...',
      listeningAnnouncement: 'Presiona un botón en tu control para asignarlo a {{action}}.',
      notSet: 'Sin asignar',
      rows: {
        singlePressHint: 'Una pulsación para sumar un punto',
        guardedUndoHint: 'Elimina la última acción de puntuación de ese equipo'
      },
      actions: {
        addTeam1: 'Sumar Equipo 1',
        revertTeam1: 'Revertir Equipo 1',
        addTeam2: 'Sumar Equipo 2',
        revertTeam2: 'Revertir Equipo 2',
        clear: 'Asignaciones vacías',
        resetDefaults: 'Restablecer predeterminados',
        cancel: 'Cancelar',
        save: 'Guardar'
      },
      feedback: {
        loadError: 'No se pudo cargar la configuración del control remoto.',
        saveError: 'No se pudo guardar la configuración del control remoto.',
        saveSuccess: 'Configuración del control remoto guardada.'
      }
    },
    voiceSelection: {
      title: 'Seleccionar voz',
      selectVoice: 'Selecciona una voz',
      preview: 'Vista previa',
      previewLink: 'Configurar voz',
      cancel: 'Cancelar',
      accept: 'Aceptar'
    },
    startButton: 'Iniciar Partido',
    validation: {
      teamNamesRequired: 'Ambos nombres de equipo son obligatorios',
      selectFormat: 'Por favor, selecciona un formato de partido',
      selectServer: 'Por favor, selecciona el primer sacador',
      invalidCountdownDuration: 'Por favor, selecciona una duración válida del temporizador'
    }
  },
  match: {
    header: {
      appName: 'Padel Buddy',
      subtitle: 'Partido en vivo'
    },
    score: {
      games: 'Juegos'
    },
    scorePointFor: 'Anotar punto para {{teamName}}',
    serving: 'Sacando',
    info: {
      title: 'Detalles de cancha',
      goldenPoint: 'PO',
      goldenPointOn: 'Punto de oro activado',
      goldenPointOff: 'Punto de oro desactivado',
      superTiebreakOn: 'Super tiebreak activado',
      superTiebreakOff: 'Super tiebreak desactivado',
      sideSwitchOn: 'Cambios de lado: activado',
      sideSwitchOff: 'Cambios de lado: desactivado'
    },
    sets: {
      label: 'Sets',
      setLabel: 'Set {{number}}',
      currentShort: 'Actual',
      superTiebreakBadge: 'ST'
    },
    timer: {
      label: 'Hora actual: {{time}}',
      countdownLabel: 'Tiempo restante del partido: {{time}}'
    },
    rotateDevice: {
      title: 'Gira tu dispositivo',
      description:
        'Esta pantalla funciona mejor en modo horizontal. Gira tu dispositivo para continuar.'
    },
    end: {
      header: {
        appName: 'Padel Buddy',
        subtitle: 'Partido terminado'
      },
      winner: {
        label: 'Ganadores',
        finishedEarlyLabel: 'Partido terminado',
        finishedEarlyName: 'Sin ganador (Empate)'
      },
      summary: {
        title: 'Resultado',
        setLabel: 'Set {{number}}',
        setScoreRow:
          'Set {{setNumber}}: {{teamOneName}} {{teamOneScore}}, {{teamTwoName}} {{teamTwoScore}}'
      },
      stats: {
        matchLength: 'Duración del partido',
        totalGames: 'Juegos totales',
        durationHoursMinutes: '{{hours}}h {{minutes}}m',
        durationMinutes: '{{minutes}}m'
      },
      actions: {
        share: 'Compartir',
        sharing: 'Compartiendo...',
        newMatch: 'Nuevo partido',
        continue: 'Continuar'
      },
      share: {
        text: '{{winnerName}} ganó un partido {{formatLabel}} de Padel Buddy en {{durationValue}} y {{totalGames}} juegos. {{teamOneName}} vs {{teamTwoName}}.',
        error: 'No se puede compartir este partido ahora mismo.',
        download: 'La imagen del partido se descargó.',
        textFinishedEarly:
          'El partido {{formatLabel}} de Padel Buddy entre {{teamOneName}} y {{teamTwoName}} terminó antes de tiempo tras {{durationValue}} y {{totalGames}} juegos.'
      },
      speech: {
        victory: 'Victoria {{teamName}}',
        tiedMatch: 'Partido empatado'
      },
      aria: {
        summaryRegion: 'Resumen del resultado del partido',
        statisticsRegion: 'Estadísticas del partido'
      }
    },
    actions: {
      revertPoint: 'Deshacer punto',
      finishMatch: 'Terminar Partido'
    },
    sideSwitch: {
      oddGames: 'Cambiar de lado (juegos impares)',
      tiebreakInterval: 'Cambiar de lado (tiebreak)',
      description: 'Los jugadores deben cambiar de lado ahora.',
      confirm: 'Cambiado'
    }
  }
} as const
