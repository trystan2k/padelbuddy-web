export default {
  common: {
    loading: 'Cargando...',
    loadingLabel: 'Cargando',
    loadingPleaseWait: 'Por favor espera...',
    close: 'Cerrar',
    retry: 'Intentar de nuevo',
    dismiss: 'Descartar'
  },
  pwaInstall: {
    banner: {
      label: 'Banner para instalar la app',
      title: 'Instala Padel Buddy',
      body: 'Agrega la app a tu pantalla de inicio para acceder mas rapido.',
      manualTitle: 'Agrega Padel Buddy a tu pantalla de inicio',
      manualBody: 'En iPhone o iPad, abre el menu Compartir y toca Agregar a pantalla de inicio.',
      install: 'Instalar app',
      installing: 'Abriendo aviso...'
    }
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
    description: 'Base cliente de TanStack Start para el rastreador de puntuación de Padel Buddy.',
    license: {
      blocked: {
        eyebrow: 'Google Play requerido',
        title: 'Instala desde Google Play',
        body: 'Esta compilación solo puede ejecutarse si fue instalada desde Google Play Store. Si compraste Padel Buddy, vuelve a instalarla desde Google Play para recuperar el acceso.'
      }
    }
  },
  debugPwa: {
    reopen: 'Abrir depuración PWA',
    title: 'Depuración PWA',
    supported: 'SW compatible',
    registered: 'SW registrado',
    ready: 'SW listo',
    version: 'Versión',
    cache: 'Caché',
    updating: 'Actualizando...',
    update: 'Actualizar SW',
    clearing: 'Limpiando...',
    clearCache: 'Limpiar caché'
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
    errors: {
      clearSavedMatch: 'No se puede borrar el partido guardado ahora mismo.'
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
      '0': 'Nada',
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
      deuce: 'Cuarenta Iguales',
      goldenPoint: 'Punto de Oro',
      correction: 'Corrección.',
      advantageTeam: 'Ventaja {{teamName}}',
      gamePoint: 'Game Point {{teamName}}',
      breakPoint: 'Break point {{teamName}}',
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
      remoteController: 'Mando a distancia',
      remoteControllerHint: 'Teclado y botones de medios',
      remoteControllerLink: 'Configurar',
      goldenPoint: 'Punto de Oro',
      goldenPointHint: 'Sin ventaja en deuce',
      superTiebreak: 'Super Tiebreak',
      superTiebreakHint: 'Reemplaza el set decisivo por un super tiebreak configurable',
      superTiebreakTarget: {
        label: 'Objetivo del super tiebreak',
        sevenPoints: '7',
        ninePoints: '9',
        elevenPoints: '11',
        sevenPointsAriaLabel: 'Primero en llegar a 7 puntos',
        ninePointsAriaLabel: 'Primero en llegar a 9 puntos',
        elevenPointsAriaLabel: 'Primero en llegar a 11 puntos'
      },
      sideSwitch: 'Avisos de Cambio de Lado',
      sideSwitchHint: 'Recordar a jugadores cambiar de lado',
      autoOpenSetsHistoryModal: 'Autoabrir Historial de Sets',
      autoOpenSetsHistoryModalHint:
        'Abre automáticamente el historial de sets al completar cada set',
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
      trigger: 'Config. del mando a distancia',
      title: 'Mando a distancia',
      description:
        'Puedes usar tu teclado o los botones de medios (Anterior/Siguiente) para controlar el partido. Haz clic en un botón del teclado para capturar tu tecla preferida.',
      listening: 'Escuchando...',
      listeningAnnouncement:
        'Presiona un botón en tu mando a distancia para asignarlo a {{action}}.',
      notSet: 'Sin asignar',
      mediaButtons: {
        nextTrack: 'Siguiente un clic',
        nextTrackDouble: 'Siguiente doble clic',
        nextTrackShort: '>> Siguiente un clic',
        nextTrackShortDouble: '>> Siguiente doble clic',
        previousTrack: 'Anterior un clic',
        previousTrackDouble: 'Anterior doble clic',
        previousTrackShort: '<< Anterior un clic',
        previousTrackShortDouble: '<< Anterior doble clic',
        notConfigurable: 'No configurable'
      },
      rows: {
        addPointHint: 'Presiona para sumar un punto a ese equipo',
        revertPointHint: 'Presiona para revertir el punto de ese equipo',
        mediaBadgeTooltip: 'Asignación fija de botón de medios'
      },
      actions: {
        addTeam1: 'Punto Equipo 1',
        revertTeam1: 'Revertir Equipo 1',
        addTeam2: 'Punto Equipo 2',
        revertTeam2: 'Revertir Equipo 2',
        cancel: 'Cancelar',
        save: 'Guardar',
        clear: 'Limpiar',
        resetDefaults: 'Restablecer'
      },
      feedback: {
        loadError: 'No se pudo cargar la configuración del control remoto.',
        saveError: 'No se pudo guardar la configuración del control remoto.',
        saveSuccess: 'Configuración del control remoto guardada.',
        clearSuccess: 'Configuración del control remoto limpiada.',
        resetSuccess: 'Configuración del control remoto restablecida.'
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
    historyButton: 'Historial',
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
      subtitle: 'Partido en directo'
    },
    score: {
      games: 'Juegos'
    },
    scorePointFor: 'Anotar punto para {{teamName}}',
    serving: 'Sacando',
    servingPlayer: 'Sacando: Jugador {{number}}',
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
      label: 'Set Actual',
      setLabel: 'Set {{number}}',
      currentShort: 'Actual',
      overallSetsScoreHeadline: 'Sets: {{team1}} - {{team2}}',
      openHistoryLabel: 'Abrir historial de sets. Marcador del set actual: {{team1}} - {{team2}}',
      emptyHistory: 'Todavía no hay sets completados.',
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
        continue: 'Continuar',
        back: 'Volver'
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
      },
      debug: {
        previewLabel: 'Vista previa de depuración de la pantalla para compartir',
        previewTitle: 'DEPURACIÓN — Vista previa de ShareScreen',
        closeModal: 'Cerrar modal de depuración'
      }
    },
    actions: {
      revertPoint: 'Deshacer punto',
      finishMatch: 'Terminar Partido',
      exitFullscreen: 'Salir de pantalla completa'
    },
    sideSwitch: {
      oddGames: 'Cambiar de lado (juegos impares)',
      tiebreakInterval: 'Cambiar de lado (tiebreak)',
      description: 'Los jugadores deben cambiar de lado ahora.',
      confirm: 'Cambiado'
    }
  },
  history: {
    header: {
      title: 'Historial de partidos',
      subtitle: 'Historial de partidos'
    },
    matchCount_one: '{{count}} partido',
    matchCount_other: '{{count}} partidos',
    emptyState: 'Todavía no hay partidos terminados.',
    saveError: 'No se pudo guardar este partido en el historial.',
    saveRetry: 'Reintentar',
    deleteSuccess: 'Partido eliminado del historial',
    setsScore: {
      unfinishedTooltip: 'Partido no terminado'
    },
    table: {
      ariaLabel: 'Tabla del historial de partidos',
      columns: {
        teams: 'Equipos',
        date: 'Fecha',
        sets: 'Sets',
        games: 'Games',
        actions: 'Acciones'
      }
    },
    actions: {
      share: 'Compartir',
      shareAriaLabel: 'Compartir partido {{team1}} vs {{team2}}',
      shareCopied: 'Resumen del partido copiado al portapapeles.',
      shareError: 'No se puede compartir este partido ahora mismo.',
      delete: 'Eliminar',
      deleteAriaLabel: 'Eliminar partido {{team1}} vs {{team2}}',
      deleteConfirm: '¿Eliminar este partido del historial?',
      deleteError: 'No se puede eliminar este partido ahora mismo.',
      playAgain: 'Jugar de nuevo',
      playAgainError: 'No se puede preparar esta revancha ahora mismo.',
      playAgainAriaLabel: 'Jugar de nuevo',
      back: 'Volver'
    },
    shareMessage: '{{date}} · {{team1}} vs {{team2}} · Sets {{sets}} · Games {{games}}'
  },
  help: {
    triggerLabel: 'Abrir ayuda',
    about:
      'Padel Buddy es un rastreador de puntuación en vivo para partidos de pádel. Registra puntos, juegos y sets en tiempo real.',
    howToUse: {
      title: 'Cómo usar',
      body: 'La aplicación te guía a través de tres pantallas principales:\n\nPantalla de configuración — Ingresa los nombres de los equipos, elige un formato de partido (Mejor de 1, 3 o 5 sets) y configura reglas opcionales como Punto de Oro, Super Tiebreak, Avisos de Cambio de Lado, Indicador de Servicio y Temporizador. También puedes configurar un control remoto Bluetooth y seleccionar una voz para los anuncios de puntuación.\n\nPantalla de partido en directo — Toca el panel de puntuación de un equipo para sumar un punto, o usa tu control remoto configurado. Toca el botón de deshacer para revertir la última acción de puntuación de ese equipo. Cuando el Indicador de Servicio está activado, la tarjeta del equipo que saca aparece resaltada. Cuando los anuncios de audio están activados, una voz anuncia cada punto. Un aviso de cambio de lado aparece entre juegos cuando esa opción está activa.\n\nPantalla de fin de partido — Muestra el resultado final y las estadísticas del partido. El ganador se determina solo por los sets completados. Si ambos equipos han ganado la misma cantidad de sets, el resultado es un empate incluso si un tercer set está en progreso. Usa el botón Compartir para distribuir la imagen del resultado, o el botón Continuar para seguir jugando sin terminar el partido.\n\nSi la aplicación o la pestaña del navegador se cierra durante un partido activo, el estado del partido se guarda automáticamente. Cuando vuelvas a abrir la aplicación, puedes retomar el partido desde donde lo dejaste o descartarlo y comenzar de nuevo.'
    },
    advertising: {
      title: 'Obtener la app',
      body: 'Descarga la aplicación móvil para una experiencia dedicada y sin anuncios en tu dispositivo.',
      getItOnGooglePlay: 'Disponible en Google Play',
      downloadOnAppStore: 'Descargar en App Store',
      noAds: 'Las aplicaciones móviles no contienen publicidad.'
    },
    pwa: {
      title: 'Instalar app',
      body: 'Padel Buddy es una Aplicación Web Progresiva (PWA). Puedes instalarla en cualquier dispositivo abriendo el menú compartir de tu navegador y seleccionando "Añadir a pantalla de inicio" (u opción similar). Una vez instalada, Padel Buddy funciona completamente sin conexión — no se requiere conexión a internet durante los partidos.'
    },
    spotlight: {
      title: 'Bienvenido a Padel Buddy',
      message: 'Empieza aquí si tienes alguna pregunta',
      dismiss: 'Entendido',
      announcement: 'Diálogo de bienvenida abierto. Presiona Escape o haz clic fuera para cerrar.'
    },
    page: {
      meta: {
        title: 'Ayuda y guía de Padel Buddy',
        description:
          'Aprende cómo funciona Padel Buddy desde la configuración hasta el marcador en vivo, fin de partido, historial, recuperación y juego sin conexión.'
      },
      hero: {
        eyebrow: 'Guía de ayuda',
        title: 'Todo lo que necesitas para usar Padel Buddy en la pista',
        body: 'Esta página explica el flujo completo del producto en lenguaje simple para que cualquier jugador configure un partido rápidamente y marque con confianza.'
      },
      toc: {
        title: 'En esta página',
        whatIs: '¿Qué es Padel Buddy?',
        mainFlow: 'Flujo principal',
        setup: 'Configurar un partido',
        liveMatch: 'Pantalla de partido en directo',
        matchEnd: 'Pantalla de fin de partido',
        history: 'Historial de partidos',
        recovery: 'Recuperación y confiabilidad',
        helpSystem: 'Sistema de ayuda integrado',
        accessibility: 'Idiomas y accesibilidad',
        platforms: 'Web, PWA y apps nativas',
        smallDetails: 'Detalles pequeños pero importantes',
        privacy: 'Privacidad'
      },
      common: {
        back: 'Volver',
        startMatch: 'Iniciar partido',
        publicOnlyNote: 'Esta página incluye solo contenido público orientado al usuario.',
        placeholderLabel: 'Marcador de posición de captura',
        captureHintLabel: 'Cómo capturar',
        captionLabel: 'Descripción',
        storeAvailabilityLabel: 'También disponible en tiendas móviles'
      },
      related: {
        privacy: {
          title: 'Información de privacidad',
          body: 'Consulta cómo Padel Buddy guarda los datos del partido localmente en tu dispositivo y qué servicios de apoyo pueden procesar datos técnicos limitados de la app.',
          cta: 'Abrir página de privacidad'
        }
      },
      whatIs: {
        title: '¿Qué es Padel Buddy?',
        body: 'Padel Buddy es un asistente de partido diseñado específicamente para llevar el marcador de pádel en pista real. Combina lógica oficial de puntuación, rotación de saque, avisos de cambio de lado, resumen final e historial en un solo flujo, sin depender de papel ni de varias apps. En la práctica, puedes configurar equipos antes del calentamiento, registrar cada punto durante el juego y terminar con una tarjeta de resultado lista para compartir en pocos segundos.'
      },
      mainFlow: {
        title: 'El flujo principal de la app',
        body: 'Padel Buddy sigue un recorrido claro de tres pasos: configurar el partido, puntuar en vivo y revisar el resultado final. Cada paso está pensado para uso rápido en pista, pero con suficiente control para distintos formatos de competencia. Este flujo permite dedicar menos tiempo a la app y más tiempo al juego.',
        setup: {
          title: '1) Configuración',
          body: 'Antes del primer punto, define nombres de equipos, formato del partido, orden de saque y reglas opcionales como Punto de Oro o Súper tie-break. También puedes activar anuncios hablados, configurar un mando y elegir duración de cuenta regresiva. Completar esta etapa correctamente asegura que el motor de puntuación funcione bien desde el inicio.'
        },
        liveMatch: {
          title: '2) Partido en directo',
          body: 'Durante el juego, usa controles grandes o tu mando para sumar y revertir puntos con mínima fricción. La app aplica automáticamente deuce, tie-break, súper tie-break, orden de saque y cambios de lado según tu configuración. Así evitas cálculos manuales en momentos de presión.'
        },
        matchEndHistory: {
          title: '3) Fin de partido e historial',
          body: 'Al finalizar, revisa ganador, resultado por sets y estadísticas clave, y comparte una imagen generada del partido si lo deseas. Los partidos terminados se guardan en historial para revisarlos después, eliminarlos o iniciar una revancha con nombres precompletados. Esto mantiene organizados tanto el cierre inmediato como el registro a largo plazo.'
        },
        recovery: {
          title: 'Recuperación automática',
          body: 'Si se cierra la pestaña, se bloquea el móvil o la app se interrumpe, Padel Buddy puede restaurar el partido en curso desde almacenamiento local. Al volver a abrir, puedes continuar exactamente donde estabas o descartar el estado guardado. Esto protege la continuidad del marcador ante interrupciones reales.'
        }
      },
      setup: {
        title: 'Configurar un partido',
        body: 'La pantalla de configuración es el centro de control donde defines cómo se comportará todo el partido. Cada opción impacta directamente el marcador en vivo, los anuncios, el tiempo y el resumen final. Invertir un minuto en configurarla bien evita confusiones durante el juego.',
        teamNames: {
          title: 'Nombres de equipos',
          body: 'Ingresa nombres claros para Equipo 1 y Equipo 2, por ejemplo parejas de jugadores o nombre del club. Esos nombres se usan en el marcador en vivo, anuncios de voz, resumen final, historial y tarjetas para compartir. Si juegas con frecuencia, recordarlos acelera las revanchas y reduce errores de escritura.'
        },
        matchFormat: {
          title: 'Formato de partido',
          body: 'Elige Mejor de 1, Mejor de 3 o Mejor de 5 para definir cuántos sets hacen falta para ganar. Esta opción controla cuándo puede terminar el partido y cuántas oportunidades de remontada tiene cada equipo. Por ejemplo, Mejor de 3 suele ser ideal para competencia y Mejor de 1 para turnos cortos de pista.'
        },
        goldenPoint: {
          title: 'Punto de oro o ventaja',
          body: 'Selecciona entre puntuación tradicional con ventaja o Punto de Oro en deuce. En modo ventaja, desde 40-40 hay que ganar dos puntos consecutivos; en Punto de Oro, el siguiente punto define el juego. El Punto de Oro suele acortar juegos y aumentar la tensión en puntos clave.'
        },
        superTiebreak: {
          title: 'Súper tie-break en set decisivo',
          body: 'Activa esta opción para reemplazar el set decisivo por un súper tie-break con objetivo configurable, con diferencia de 2. Es un formato común cuando se busca reducir la duración total manteniendo un cierre competitivo. Si está desactivado, el set decisivo se juega con formato normal por juegos.'
        },
        firstServer: {
          title: 'Primer sacador',
          body: 'Define qué equipo saca primero antes de iniciar. Esto establece correctamente la rotación de saque para todos los juegos y escenarios de tie-break. Configurarlo bien evita correcciones posteriores del orden de servicio.'
        },
        servingIndicator: {
          title: 'Indicador de saque',
          body: 'Al activarlo, el equipo que está sacando queda resaltado visualmente en la pantalla de partido en directo. Este contexto rápido ayuda a jugadores y espectadores, sobre todo en intercambios de ritmo alto. Es especialmente útil cuando quien anota no está dentro de la pista.'
        },
        sideSwitch: {
          title: 'Avisos de cambio de lado',
          body: 'Activa recordatorios automáticos para los momentos correctos de cambio de lado. La app muestra un aviso claro para confirmar y seguir sin perder foco del marcador. Así se reducen olvidos en partidos largos o intensos.'
        },
        countdown: {
          title: 'Temporizador de cuenta regresiva',
          body: 'Convierte el tiempo superior en una cuenta regresiva para reservas de pista con duración fija, como 1:00, 1:30 o 2:00. Si está desactivada, la misma zona funciona como referencia de reloj/tiempo. Esto ayuda a gestionar el turno y decidir cuándo cerrar o acelerar el partido.'
        },
        audio: {
          title: 'Anuncios de audio',
          body: 'Activa anuncios hablados para que la app cante el marcador y estados importantes del partido. Es útil cuando los jugadores no pueden mirar la pantalla entre puntos o cuando quien anota está a un costado. El audio mejora la seguridad de que todos escucharon el mismo resultado.'
        },
        voiceSelection: {
          title: 'Selección de voz',
          body: 'Abre la selección de voz para previsualizar y elegir la voz más clara en tu dispositivo. Las opciones disponibles dependen del sistema operativo y de los paquetes de voz instalados. Probarla antes de comenzar evita malentendidos durante los anuncios.'
        },
        remoteController: {
          title: 'Configuración de control remoto',
          body: 'Usa la configuración remota para mapear botones externos o teclas a acciones de puntuar y deshacer para cada equipo. Puedes guardar asignaciones personalizadas, limpiar vínculos individuales o restaurar valores por defecto. Es ideal cuando una persona controla el marcador con clicker Bluetooth o teclado desde fuera de la pista.\n\nHemos probado el siguiente mando a distancia Bluetooth, que funciona con esta app: <remoteLink>Bluetooth Media Buttons Remote Control</remoteLink> (o busca opciones similares en AliExpress: Bluetooth Media Buttons Remote Control). Usa los botones de volumen, que la app soporta nativamente.'
        },
        languageSelector: {
          title: 'Selector de idioma',
          body: 'Cambia el idioma de la interfaz entre inglés, español y portugués directamente en configuración. El cambio actualiza al instante etiquetas, ayuda y la mayor parte del texto visible al usuario. Así, grupos multilingües pueden usar el mismo dispositivo con más comodidad.'
        },
        historyShortcut: {
          title: 'Acceso directo al historial',
          body: 'Usa este acceso para abrir el historial sin iniciar un partido nuevo. Desde ahí puedes revisar resultados anteriores, compartirlos más tarde, borrar registros o comenzar una revancha con nombres precompletados. Es una entrada rápida al registro reciente desde el flujo inicial.'
        },
        storeButtons: {
          title: 'Botones de tiendas en web/PWA',
          body: 'En web y PWA se muestran insignias de tiendas con enlaces directos a las versiones móviles nativas. Esto facilita pasar al canal de instalación preferido cuando se quiere distribución por tienda. También aclara la disponibilidad por plataforma en un solo lugar.'
        }
      },
      liveMatch: {
        title: 'Pantalla de partido en directo',
        body: 'La pantalla de partido en directo está optimizada para registrar puntos de forma rápida y confiable durante juego real. Prioriza controles grandes, contexto claro y aplicación automática de reglas para reducir errores bajo presión. Las decisiones complejas de puntuación las toma el motor, no el usuario manualmente.',
        largeScorePanels: {
          title: 'Paneles de puntuación grandes',
          body: 'Toca el panel de un equipo para sumar un punto al instante, incluso en pausas muy cortas entre rallies. El diseño usa áreas táctiles amplias y alto contraste, optimizadas para orientación horizontal. Esto reduce toques accidentales y mejora la velocidad al anotar.'
        },
        servingIndicator: {
          title: 'Indicador de saque',
          body: 'Cuando está activado, el equipo sacador se resalta claramente para tener contexto de servicio de un vistazo. Esta señal visual se mantiene alineada con el estado del marcador y puede influir en los anuncios hablados. Reduce confusiones en cambios de lado y transiciones a tie-break.'
        },
        undo: {
          title: 'Botones de deshacer por equipo',
          body: 'Cada equipo tiene su propia acción de deshacer para revertir el último punto asignado a ese lado. Deshacer rebobina el estado real, incluyendo juego, set, tie-break y progresión de saque cuando corresponde. Es clave para corregir toques erróneos sin reconstruir el marcador a mano.'
        },
        automaticScoring: {
          title: 'Reglas de puntuación automáticas',
          body: 'El motor de puntuación aplica automáticamente las reglas de pádel según la configuración elegida. Gestiona progresión de puntos, cierre de juegos, cierre de sets, deuce y transiciones de tie-break sin intervención manual. Esto garantiza coherencia incluso en finales de set complejos.'
        },
        deuceAdvantage: {
          title: 'Deuce y ventaja',
          body: 'En modo ventaja, al llegar a 40-40, un equipo debe ganar dos puntos consecutivos para cerrar el juego. La app controla automáticamente el estado de ventaja y anuncia los cambios de forma clara. Así se replica la puntuación tradicional usada en muchos partidos oficiales.'
        },
        goldenPoint: {
          title: 'Lógica de punto de oro',
          body: 'En modo Punto de Oro, el deuce se resuelve con un único punto decisivo en 40-40. El siguiente punto cierra inmediatamente el juego para el equipo ganador. Esta opción acelera el ritmo del partido y simplifica momentos de máxima presión.'
        },
        standardTiebreak: {
          title: 'Tie-break estándar en 6-6',
          body: 'Cuando un set llega a 6-6, la app entra automáticamente en tie-break estándar a 7 puntos, con diferencia de 2. Al ganarlo, el set queda registrado como 7-6 en el resumen final. No necesitas activar ningún modo manualmente.'
        },
        superTiebreak: {
          title: 'Súper tie-break en set decisivo',
          body: 'Si activaste Súper tie-break en configuración, el set decisivo se reemplaza por una carrera hasta el objetivo seleccionado, con diferencia de 2. La app aplica este formato solo en el último set decisivo y registra ese resultado correctamente. Es útil para torneos que buscan cerrar en menos tiempo.'
        },
        sideSwitch: {
          title: 'Avisos de cambio de lado',
          body: 'Si está activo, los avisos de cambio de lado aparecen en los momentos reglamentarios para recordarlo a los jugadores. El aviso se oculta automáticamente tras unos segundos para no bloquear el marcador. De esta forma se combina visibilidad del recordatorio con fluidez de juego.'
        },
        timer: {
          title: 'Temporizador / reloj del partido',
          body: 'La zona superior muestra contexto de tiempo en formato claro HH:MM:SS, ya sea reloj o cuenta regresiva según configuración. Esto permite leer rápidamente el estado temporal en descansos o cambios de lado. Ayuda a gestionar ritmo, reserva de pista y cierre del partido.'
        },
        finishAction: {
          title: 'Acción Finalizar juego',
          body: 'Usa Finalizar juego para cerrar el partido manualmente cuando las condiciones reales obligan a terminar antes. Ejemplos habituales: fin del turno de pista, lesión o acuerdo entre jugadores. La app conserva el progreso registrado y pasa a un resumen consistente.'
        },
        autoFinishRoute: {
          title: 'Ruta automática a fin de partido',
          body: 'Cuando se cumple la condición oficial de victoria, la app navega automáticamente a la pantalla de fin de partido. Esto evita confirmar manualmente el cierre y reduce riesgo de sumar puntos extra por error. El resultado final queda alineado con el formato elegido.'
        },
        rotateBlocker: {
          title: 'Bloqueador de rotación en retrato',
          body: 'En teléfonos en vertical, el marcador en vivo solicita girar a horizontal. Esta decisión prioriza controles más grandes y mejor legibilidad de puntuación a distancia. También reduce interacciones apretadas durante juego activo.'
        },
        compactHeight: {
          title: 'Comportamiento en altura compacta',
          body: 'En pantallas con poca altura, algunos controles secundarios pueden ocultarse tras inactividad para dar más espacio al marcador. Cuando los necesitas, puedes recuperarlos rápidamente. Este comportamiento adaptativo mantiene legible la parte más importante en dispositivos pequeños.'
        },
        wakeLock: {
          title: 'Soporte de wake lock',
          body: 'Cuando el dispositivo y el navegador lo permiten, la app solicita wake lock para evitar que la pantalla se apague durante el partido. Esto reduce interrupciones causadas por bloqueo automático mientras se está puntuando. Si no está disponible, la app sigue funcionando con normalidad.'
        },
        keyboardRemote: {
          title: 'Controles de teclado / remoto / multimedia',
          body: 'Además del toque en pantalla, puedes controlar el marcador con teclado, mandos Bluetooth y botones multimedia compatibles. Esta flexibilidad permite puntuar a distancia sin acercarte al dispositivo. Es muy útil con soporte en trípode o cuando quien anota está en el banco.'
        },
        mediaDoublePress: {
          title: 'Deshacer multimedia con doble pulsación',
          body: 'Con controles multimedia compatibles, una pulsación simple puede puntuar y una doble pulsación puede deshacer para ese lado dentro de una ventana breve. Este diseño permite corregir rápido sin abrir menús adicionales. Es especialmente práctico en mandos compactos con pocos botones.'
        },
        speech: {
          title: 'Voz durante el marcador en vivo',
          body: 'Los anuncios de voz pueden informar el puntaje y también momentos clave como deuce, punto de juego, punto de set y punto de partido. Esto mantiene alineados a todos cuando la atención visual está en el punto en juego. Además mejora la accesibilidad para quienes dependen del contexto hablado.'
        },
        speechVerbosity: {
          title: 'Mínimo / Estándar / Verboso',
          body: 'Puedes elegir salida de voz Mínima, Estándar o Verbosa según el nivel de detalle que prefieras escuchar. Mínima prioriza lo esencial y Verbosa agrega más contexto de partido. Así cada grupo ajusta el comportamiento del audio a su ritmo de juego.'
        }
      },
      matchEnd: {
        title: 'Pantalla de fin de partido',
        body: 'La pantalla de fin de partido consolida el resultado final y muestra las acciones siguientes más importantes. Está diseñada para cerrar la sesión de forma clara, conservando los datos para compartir e historial. Desde aquí puedes empezar de nuevo o continuar juego informal si lo necesitas.',
        winnerCard: {
          title: 'Tarjeta del ganador',
          body: 'La tarjeta del ganador muestra el equipo vencedor según reglas de sets completados. Si el partido terminó antes de tiempo o sin condición clara de victoria, el estado se informa explícitamente. Esto evita ambigüedades al revisar el resultado después.'
        },
        setSummary: {
          title: 'Resumen de sets',
          body: 'El resumen de sets presenta cada set completado en orden, incluyendo puntaje de súper tie-break decisivo cuando aplica. Ofrece un registro compacto pero completo de cómo se desarrolló el partido. Es ideal para verificar antes de compartir.'
        },
        statistics: {
          title: 'Estadísticas del partido',
          body: 'Las estadísticas clave incluyen duración total y cantidad de juegos disputados. Estos datos agregan contexto más allá del resultado final y ayudan a comparar partidos en el tiempo. También se reflejan en contenido compartible cuando corresponde.'
        },
        spokenResult: {
          title: 'Anuncio hablado del resultado',
          body: 'Si el audio está habilitado, al entrar en esta pantalla se puede anunciar verbalmente el resultado final. Esto confirma el cierre sin obligar a leer inmediatamente la pantalla. Resulta útil en pistas ruidosas o cuando los jugadores ya están recogiendo.'
        },
        share: {
          title: 'Acción Compartir',
          body: 'Compartir genera una tarjeta de resultado con datos clave como ganador, formato, marcador por sets, duración y fecha. Puedes enviarla por tus apps favoritas como resumen claro de postpartido. Así reportar resultados a grupos, clubes o redes es rápido y consistente.'
        },
        newMatch: {
          title: 'Nuevo partido',
          body: 'Nuevo partido cierra la sesión actual y vuelve a configuración con estado limpio. Úsalo cuando quieres comenzar otro partido oficial de inmediato. Evita arrastrar datos por error desde la sesión anterior.'
        },
        continue: {
          title: 'Continuar',
          body: 'Continuar permite seguir jugando después del cierre oficial sin perder el contexto actual. Es útil para juegos extra informales o para alargar la sesión fuera del resultado oficial. La app conserva la continuidad temporal y de puntuación de esa extensión.'
        }
      },
      history: {
        title: 'Historial de partidos',
        body: 'El historial guarda localmente los partidos finalizados para que sus resultados sigan disponibles después del cierre. Funciona como un archivo ligero para revisar, compartir y lanzar revanchas rápidamente. Es útil para seguir evolución frente a rivales frecuentes sin herramientas externas.',
        autoStorage: {
          title: 'Almacenamiento local automático',
          body: 'Los partidos completados se guardan automáticamente en el almacenamiento local del dispositivo o navegador, sin pasos extra. Así el resultado queda disponible incluso si cierras la app al terminar. También favorece un uso orientado a offline.'
        },
        limit: {
          title: 'Límite de 100 partidos',
          body: 'El historial conserva hasta 100 partidos finalizados recientes para mantener rendimiento y tamaño de almacenamiento bajo control. Al superar ese límite, se eliminan primero los más antiguos. De esta forma la lista se mantiene ágil en móvil.'
        },
        tableInfo: {
          title: 'Detalles de la tabla de historial',
          body: 'Cada fila resume equipos, fecha, marcador por sets, total de juegos y acciones disponibles. La tabla está pensada para escaneo rápido sin abrir cada registro. Funciona como una bitácora compacta de partidos.'
        },
        winnerHighlight: {
          title: 'Resaltado del ganador',
          body: 'Los equipos ganadores se resaltan visualmente para identificar resultados de un vistazo. Esto reduce errores de lectura cuando revisas muchos partidos seguidos. Es especialmente útil en contextos de liga o torneo.'
        },
        finishedEarly: {
          title: 'Indicador de finalización temprana',
          body: 'Marcadores especiales indican partidos finalizados antes de tiempo o sin ganador estándar por sets completos. Así se entiende que el registro es válido pero con cierre excepcional. Aporta transparencia al comparar resultados históricos.'
        },
        share: {
          title: 'Compartir desde el historial',
          body: 'Puedes generar y compartir tarjetas desde historial en cualquier momento, no solo al finalizar. Esto es práctico cuando alguien pide el resultado horas o días después del partido. La capacidad de compartir queda disponible aunque no se use al instante.'
        },
        delete: {
          title: 'Eliminar del historial',
          body: 'Los registros pueden eliminarse con confirmación para evitar borrados accidentales. Esto ayuda a mantener un historial limpio y relevante con el tiempo. La eliminación afecta solo al almacenamiento local de ese dispositivo.'
        },
        playAgain: {
          title: 'Jugar de nuevo',
          body: 'Jugar de nuevo inicia una revancha usando nombres de equipos del registro seleccionado. Esto reduce tiempo de configuración en enfrentamientos repetidos. Aun así, puedes ajustar formato y reglas antes de comenzar.'
        },
        backHome: {
          title: 'Volver al inicio',
          body: 'Una acción dedicada te devuelve del historial a configuración de forma directa. Mantiene una navegación predecible y evita perderse en flujos profundos. Es útil cuando pasas de revisar datos a iniciar un nuevo partido.'
        },
        emptyState: {
          title: 'Estado vacío',
          body: 'Si todavía no hay partidos guardados, se muestra un estado vacío claro y amigable. Esto confirma que la pantalla funciona correctamente y no que falló la carga. También orienta al usuario a crear su primer registro.'
        }
      },
      recovery: {
        title: 'Recuperación, seguridad y confiabilidad',
        body: 'Las funciones de recuperación están diseñadas para proteger el progreso del partido ante cierres de pestaña, reinicios de app o fallos del dispositivo. El objetivo es conservar estado válido sin arriesgar puntuaciones corruptas. Estas medidas mejoran la confianza para uso competitivo en pista.',
        autoPersistence: {
          title: 'Persistencia automática del partido en curso',
          body: 'Mientras un partido está activo, el estado se guarda continuamente en segundo plano para minimizar pérdida de puntos recientes. Este guardado es automático y no requiere acción manual. Es la base de la recuperación al reiniciar.'
        },
        resumePrompt: {
          title: 'Aviso para reanudar partido guardado',
          body: 'Al iniciar la app, si existe un partido guardado en curso, se pregunta si deseas retomarlo o descartarlo. Retomar recupera contexto completo; descartar vuelve a configuración limpia. Esta decisión explícita evita continuar por error un partido antiguo.'
        },
        corruptRecovery: {
          title: 'Recuperación de datos corruptos',
          body: 'Si los datos guardados son inválidos o no se pueden leer, la app ofrece un reinicio seguro guiado en lugar de fallar. Esto permite volver rápido a un estado utilizable. Se prioriza estabilidad por encima de restauraciones parciales riesgosas.'
        },
        schemaReset: {
          title: 'Aviso de reinicio por incompatibilidad de esquema',
          body: 'Cuando una actualización cambia el esquema de datos y un guardado antiguo deja de ser compatible, la app puede reiniciarlo automáticamente con un aviso único. Así se mantiene estabilidad entre versiones y se informa claramente lo ocurrido. Se evitan errores silenciosos o recuperaciones rotas.'
        },
        friendlyErrors: {
          title: 'Manejo amigable de errores',
          body: 'En rutas inválidas o registros inexistentes, la interfaz muestra mensajes claros orientados a recuperación, no errores técnicos crudos. El usuario recibe pasos prácticos para continuar, como volver a configuración. Esto hace el sistema entendible para perfiles no técnicos.'
        },
        loadingFeedback: {
          title: 'Feedback de carga de rutas',
          body: 'Durante cargas y transiciones, la app muestra estado pendiente visible para indicar que sigue trabajando. Esto reduce incertidumbre y toques repetidos en momentos de lentitud del dispositivo. Un buen feedback de carga mejora la percepción de confiabilidad.'
        }
      },
      helpSystem: {
        title: 'Página de ayuda dentro de la app',
        body: 'Padel Buddy ofrece una página de ayuda accesible desde la propia aplicación para resolver dudas frecuentes sin salir de la experiencia principal. El contenido está pensado para preguntas prácticas de uso en pista y decisiones rápidas. Así se reduce la fricción de aprendizaje para usuarios nuevos y ocasionales.',
        topBarHelp: {
          title: 'Botón de ayuda en la barra superior',
          body: 'La barra superior ofrece acceso rápido a la página de ayuda en pantallas clave como configuración y partido. No necesitas navegar menús profundos para encontrar documentación. Esto mantiene el soporte siempre visible durante uso real.'
        },
        spotlight: {
          title: 'Foco de primera visita',
          body: 'En la primera visita, un foco visual muestra dónde está la ayuda y cómo abrirla. Una vez descartado, se recuerda para no interrumpir repetidamente a usuarios habituales. Así se equilibra onboarding inicial con fluidez a largo plazo.'
        },
        builtInDialog: {
          title: 'Página de ayuda',
          body: 'La página de ayuda resume el flujo principal, opciones clave de configuración y posibilidades de instalación web/PWA/nativa. Funciona como referencia rápida antes de iniciar o durante el partido. Esto reduce dependencia de documentación externa.'
        }
      },
      accessibility: {
        title: 'Idiomas y accesibilidad',
        body: 'Padel Buddy soporta inglés, español y portugués con etiquetas y ayuda localizadas para que grupos multilingües compartan el mismo dispositivo. En accesibilidad, incluye estructura semántica, navegación por teclado, foco visible, contraste legible y actualizaciones habladas del marcador. En conjunto, estas medidas facilitan el uso para perfiles con distintas necesidades de idioma, visión e interacción.'
      },
      platforms: {
        title: 'PWA, uso sin conexión, web y apps nativas',
        body: 'Padel Buddy puede usarse en distintos formatos según preferencia: web en navegador, PWA instalada o app móvil nativa. El flujo de marcador es el mismo, pero cambian detalles de instalación y distribución por plataforma. Entender estas diferencias ayuda a elegir la opción más conveniente para uso frecuente en pista.',
        web: {
          title: 'Versión web',
          body: 'La versión web abre al instante en un navegador compatible, sin instalación previa. Es ideal para probar rápido, uso ocasional o dispositivos compartidos. Puedes empezar a puntuar en segundos desde una URL.'
        },
        pwa: {
          title: 'Experiencia PWA',
          body: 'Como PWA, Padel Buddy puede instalarse en pantalla de inicio y abrirse en modo más parecido a app independiente. Esto reduce distracciones del navegador y acelera el acceso antes del partido. También fortalece el comportamiento sin conexión en canchas con red inestable.'
        },
        install: {
          title: 'Cómo instalar la PWA',
          body: 'En iOS Safari, abre el menú Compartir y elige Añadir a pantalla de inicio. En Android Chrome u otros navegadores compatibles, usa Instalar aplicación o Añadir a pantalla de inicio. Después, abre Padel Buddy desde el icono como cualquier app.'
        },
        offline: {
          title: 'Uso sin conexión',
          body: 'Las sesiones de PWA instalada pueden seguir funcionando durante el partido aunque no haya internet. Esto es muy útil en pistas con señal móvil inestable o Wi-Fi limitado. La capacidad offline ayuda a mantener el marcador sin interrupciones.'
        },
        nativeApps: {
          title: 'Apps móviles nativas',
          body: 'También existen versiones nativas en Google Play y App Store para quienes prefieren el flujo clásico de instalación y actualizaciones desde tienda. Estas versiones están orientadas a una experiencia dedicada de uso móvil. Actualmente se posicionan como libres de anuncios.'
        },
        androidProtection: {
          title: 'Protección de licencia/origen de tienda en Android',
          body: 'Algunas distribuciones nativas de Android incluyen validación de licencia u origen que exige instalación desde Google Play. Esto ayuda a asegurar que la app proviene de una fuente autorizada. Si falla la validación, la solución recomendada es reinstalar desde Google Play.'
        },
        adsDifference: {
          title: 'Diferencias de anuncios por plataforma',
          body: 'El comportamiento de anuncios puede variar por plataforma: en web/PWA puede haber publicidad, mientras que en versiones nativas de tienda se posiciona experiencia sin anuncios. Esta diferencia ayuda a elegir el canal que mejor encaja con tus preferencias. Si priorizas experiencia sin anuncios, la opción recomendada es app de tienda.'
        }
      },
      smallDetails: {
        title: 'Detalles pequeños pero importantes',
        body: 'Estos comportamientos pequeños suelen tener gran impacto práctico durante partidos reales. Reducen fricción, evitan errores frecuentes y mejoran la confianza al puntuar bajo presión. Conocerlos de antemano permite aprovechar mejor la app desde el primer uso.',
        servingCard: {
          title: 'Resaltado de tarjeta de saque',
          body: 'La tarjeta del equipo sacador cambia visualmente para que el contexto de servicio sea evidente de inmediato. Esto ayuda a evitar discusiones sobre quién debe sacar. Es especialmente valioso en transiciones rápidas entre juegos.'
        },
        sideSwitchTimeout: {
          title: 'Tiempo límite para cambio de lado',
          body: 'Los avisos de cambio de lado se ocultan automáticamente después de unos 10 segundos para no bloquear el juego más de lo necesario. El recordatorio se ve con claridad, pero la interfaz vuelve rápido al marcador. Así se mantiene fluidez en la partida.'
        },
        landscapeOnly: {
          title: 'Marcador en vivo orientado a horizontal',
          body: 'El marcador en vivo prioriza horizontal y bloquea vertical en móviles de forma intencional. En horizontal hay controles más grandes y mejor legibilidad a distancia. Esta decisión mejora precisión táctil y lectura en pista.'
        },
        resumeMatch: {
          title: 'Reanudar partidos interrumpidos',
          body: 'Las sesiones interrumpidas pueden recuperarse desde estado guardado en lugar de empezar de cero. Esto protege la integridad del partido cuando ocurre un corte inesperado. Es una de las funciones de confiabilidad más útiles en uso real.'
        },
        finishEarly: {
          title: 'Finalizar manualmente cuando sea necesario',
          body: 'Puedes finalizar manualmente antes del cierre oficial cuando sea necesario, por ejemplo por límite de tiempo de pista o lesión. La app conserva el estado alcanzado y estadísticas disponibles. Esto refleja mejor las condiciones reales de juego.'
        },
        continueAfterFinish: {
          title: 'Continuar después de finalizar',
          body: 'Tras el cierre oficial, puedes seguir puntuando para juegos extra informales sin reiniciar. Esto sirve para tiempo adicional casual manteniendo el contexto de sesión. Se separa el resultado oficial de la extensión opcional.'
        },
        deviceVoices: {
          title: 'Las voces provienen del dispositivo',
          body: 'Las voces de anuncios dependen del sistema operativo y del navegador, no de una lista fija de la app. Por eso nombres y calidad pueden variar entre dispositivos. Revisarlas antes de empezar ayuda a elegir una voz más clara.'
        },
        advancedSpeech: {
          title: 'Estados hablados avanzados',
          body: 'La voz puede anunciar estados avanzados como deuce, Punto de Oro, ventaja, punto de set y punto de partido. Estas señales aportan más contexto que solo decir números de puntos. Ayudan a entender momentos de presión sin mirar la pantalla.'
        },
        undoRestoresState: {
          title: 'Deshacer restaura el estado real',
          body: 'Deshacer rebobina la línea temporal real del partido, incluyendo estados dependientes como progresión de juegos y orden de saque. No es una resta visual superficial del número mostrado. Así las correcciones mantienen validez reglamentaria.'
        },
        historyLimit: {
          title: 'Límite de retención del historial',
          body: 'El historial mantiene solo los 100 partidos finalizados más recientes para cuidar rendimiento y almacenamiento. Los más antiguos salen automáticamente cuando ingresan nuevos registros. Esto mantiene el archivo liviano en móviles.'
        },
        shareLater: {
          title: 'Compartir ahora o después',
          body: 'Las tarjetas de resultado pueden compartirse al terminar el partido o generarse más tarde desde historial. Es útil cuando hay prisa al salir de la pista. No se pierde la opción de compartir por no hacerlo en el momento.'
        },
        offlineUse: {
          title: 'Sesiones listas para uso offline',
          body: 'La PWA instalada está pensada para mantener el marcador usable sin conexión estable durante la sesión. Esto es clave en canchas con cobertura irregular. El modo offline reduce riesgo de interrupciones al puntuar.'
        },
        rememberedPreferences: {
          title: 'Preferencias de configuración recordadas',
          body: 'Padel Buddy puede recordar nombres de equipos y opciones importantes de configuración para acelerar futuros inicios. Esto evita repetir la misma preparación en cada partido. Comenzar más rápido significa más tiempo efectivo de juego.'
        },
        spotlightDiscovery: {
          title: 'Foco de descubrimiento de ayuda',
          body: 'Un foco de primera visita señala dónde está la ayuda para facilitar su descubrimiento temprano. Después de verlo una vez, deja de mostrarse para no molestar a usuarios recurrentes. Así mejora onboarding sin añadir ruido constante.'
        }
      },
      media: {
        hero: {
          title: 'Imagen principal de uso en pista',
          description:
            'Teléfono cerca del banco de la pista con marcador en vivo visible y control remoto opcional cercano.',
          captureHint:
            'Toma una foto real en pista con la pantalla de partido en directo abierta en horizontal.',
          caption: 'Lleva el marcador sin salir del juego.'
        },
        mainFlow: {
          title: 'Visual del flujo principal de la app',
          description:
            'Secuencia simple de 3 pasos: Configuración → Partido en directo → Fin de partido / Historial.',
          captureHint: 'Usa una ilustración limpia o un collage de pantallas reales.',
          caption: 'De la configuración al resumen en un flujo simple.'
        },
        setupOverview: {
          title: 'Vista general de la pantalla de configuración',
          description:
            'Vista completa de configuración destacando reglas, equipos, historial y acción de inicio.',
          captureHint:
            'Captura la configuración con audio activado para que se vean los controles de voz.',
          caption: 'Todo lo que necesitas antes del primer punto.'
        },
        remoteConfig: {
          title: 'Modal de configuración remota',
          description:
            'Muestra campos de mapeo de teclas y controles de limpiar/restablecer/guardar.',
          captureHint:
            'Abre el modal remoto desde configuración y captura con asignaciones completas.',
          caption: 'Configura los controles de puntuación para tu dispositivo remoto.'
        },
        voiceSelection: {
          title: 'Modal de selección de voz',
          description: 'Lista de voces agrupada por idioma con acciones de vista previa/aceptar.',
          captureHint: 'Abre la selección de voz mientras los anuncios de audio están habilitados.',
          caption: 'Elige la voz que mejor se adapte a tu partido.'
        },
        liveMatch: {
          title: 'Pantalla de partido en directo en horizontal',
          description:
            'Tarjetas de puntuación, temporizador, resaltado de saque, deshacer y acción de finalizar visibles.',
          captureHint: 'Usa un estado de partido realista (por ejemplo 40–30).',
          caption: 'Controles grandes, marcador claro y contexto en vivo de un vistazo.'
        },
        sideSwitch: {
          title: 'Modal de aviso de cambio de lado',
          description:
            'Modal que recuerda a los jugadores cambiar de lado con acción de confirmación.',
          captureHint: 'Activa los avisos de cambio de lado y captura antes del auto-ocultado.',
          caption: 'La app recuerda a los jugadores cuándo es momento de cambiar de lado.'
        },
        rotateBlocker: {
          title: 'Bloqueador por rotación en retrato',
          description: 'Bloqueador en retrato que solicita girar a horizontal.',
          captureHint: 'Abre un partido en directo en un viewport de teléfono en retrato.',
          caption: 'La pantalla de marcador en vivo está optimizada para uso horizontal.'
        },
        matchEnd: {
          title: 'Pantalla de resumen de fin de partido',
          description: 'Tarjeta del ganador, resumen de sets, estadísticas y botones de acción.',
          captureHint: 'Finaliza un partido y captura el estado completo del resumen.',
          caption: 'Revisa el resultado, compártelo o sigue jugando.'
        },
        shareImage: {
          title: 'Imagen de compartir generada',
          description: 'Tarjeta de partido exportable con ganador, marcadores, fecha y duración.',
          captureHint: 'Usa la acción de compartir y captura el artefacto generado.',
          caption: 'Una imagen de resultado lista para compartir.'
        },
        historyList: {
          title: 'Lista de historial con registros',
          description: 'Múltiples entradas con resaltado del ganador y acciones.',
          captureHint: 'Genera varios partidos y abre la lista de historial.',
          caption: 'Los partidos recientes siguen siendo fáciles de revisar, compartir y repetir.'
        },
        historyEmpty: {
          title: 'Estado vacío del historial',
          description: 'Mensaje amigable cuando no hay partidos finalizados.',
          captureHint: 'Borra los registros del historial y captura la vista vacía.',
          caption: 'Aún no hay partidos finalizados.'
        },
        resumeDialog: {
          title: 'Diálogo para reanudar partido guardado',
          description: 'Aviso al inicio que ofrece reanudar o descartar.',
          captureHint:
            'Interrumpe un partido en directo y vuelve a abrir la app para activar el aviso.',
          caption: 'Puedes continuar con seguridad donde lo dejaste.'
        },
        helpSpotlight: {
          title: 'Foco de ayuda en la barra superior',
          description:
            'Foco de primera visita que orienta a los usuarios hacia la acción de ayuda.',
          captureHint:
            'Usa un perfil nuevo donde el foco de ayuda aún no se haya marcado como visto.',
          caption: 'Los usuarios nuevos son guiados hacia el área de ayuda.'
        },
        platformComparison: {
          title: 'Comparación Web vs PWA vs Nativa',
          description:
            'Tarjeta comparativa de instalación, soporte offline, tiendas y diferencias de anuncios.',
          captureHint:
            'Crea un visual comparativo diseñado y alineado con el comportamiento actual del producto.',
          caption: 'Usa Padel Buddy en el formato que mejor se adapte a ti.'
        }
      }
    }
  },
  privacy: {
    page: {
      meta: {
        title: 'Privacidad de Padel Buddy',
        description:
          'Conoce de forma simple cómo Padel Buddy guarda datos del partido en tu dispositivo y qué datos técnicos limitados pueden usar los servicios de apoyo.'
      },
      hero: {
        eyebrow: 'Privacidad',
        title: 'Los datos de tu partido permanecen cerca de ti',
        body: 'Padel Buddy está pensado para que llevar el marcador sea simple y privado. Cosas como los nombres de los equipos, el marcador en vivo, el historial de partidos terminados y muchas configuraciones se guardan en tu dispositivo o navegador para que la app siga funcionando bien, incluso sin conexión.'
      },
      localStorage: {
        title: 'Qué permanece en tu dispositivo',
        body: 'La app guarda la información del partido de forma local para que puedas reanudar un partido interrumpido, revisar el historial y dejar tu configuración preferida lista para la próxima vez. Esto incluye nombres de equipos, avance del marcador, resúmenes de partidos terminados y ajustes elegidos en tu dispositivo. En el uso normal, estos datos del partido no se envían a un servidor dedicado de partidos de Padel Buddy.'
      },
      noAccount: {
        title: 'No se requiere cuenta',
        body: 'No necesitas crear una cuenta para usar Padel Buddy. Puedes abrir la app y empezar a puntuar sin iniciar sesión, sin crear perfiles de jugadores y sin guardar partidos en la nube. Para la mayoría de las personas, eso significa que la experiencia principal de puntuación sigue en el dispositivo que están usando.'
      },
      limitedServices: {
        title: 'Servicios de apoyo limitados',
        body: 'Algunos datos técnicos limitados sí pueden ser usados por servicios de apoyo según la plataforma y la versión de la app. Por ejemplo, las builds de producción usan herramientas de analítica y algunas versiones pueden hacer comprobaciones de licencia o de instalación. Estos servicios están separados de tu historial local de partidos y no se usan para publicar ni compartir automáticamente tus marcadores con otros jugadores.'
      },
      control: {
        title: 'Tu control sobre los datos locales',
        body: 'Como los datos principales del partido se guardan localmente, normalmente quedan bajo control de la persona que usa el dispositivo. Borrar el almacenamiento del navegador o de la app, desinstalar la app o usar los ajustes de privacidad del dispositivo puede eliminar esa información guardada. Si compartes el dispositivo con otras personas, recuerda que el historial y las preferencias guardadas pueden seguir visibles allí hasta que se borren.'
      }
    }
  }
} as const;
