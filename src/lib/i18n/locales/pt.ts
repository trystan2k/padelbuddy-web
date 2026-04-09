export default {
  common: {
    loading: 'Carregando...',
    loadingLabel: 'Carregando',
    loadingPleaseWait: 'Por favor aguarde...',
    close: 'Fechar',
    retry: 'Tentar novamente',
    dismiss: 'Dispensar'
  },
  error: {
    loadMatch: 'Erro ao carregar partida',
    unexpectedLabel: 'Recuperação de tela',
    unexpectedTitle: 'Algo interrompeu esta tela.',
    unexpectedBody:
      'O Padel Buddy encontrou um problema temporário enquanto preparava esta visualização. Tente novamente para restaurar a tela.',
    invalidMatch: {
      title: 'Partida não encontrada',
      body: 'A partida que você está procurando não existe ou já foi removida.'
    },
    corruptMatch: {
      title: 'Dados da partida corrompidos',
      body: 'Não foi possível ler os dados salvos da partida. Inicie uma nova partida.'
    },
    noMatch: {
      title: 'Nenhuma partida ativa',
      body: 'Não há dados de partida disponíveis. Inicie uma nova partida.'
    }
  },
  app: {
    title: 'Padel Buddy',
    description: 'Base client-only do TanStack Start para o placar do Padel Buddy.'
  },
  debugPwa: {
    reopen: 'Abrir depuração PWA',
    title: 'Depuração PWA',
    supported: 'SW compatível',
    registered: 'SW registrado',
    ready: 'SW pronto',
    version: 'Versão',
    cache: 'Cache',
    updating: 'Atualizando...',
    update: 'Atualizar SW',
    clearing: 'Limpando...',
    clearCache: 'Limpar cache'
  },
  appShell: {
    eyebrow: 'Base do aplicativo',
    lead: 'Uma base estilizada para o rastreador de pontuação ao vivo, configurada para suportar futuros fluxos de partida sem parecer um scaffolding provisório.',
    statusPills: {
      clientOnly: 'Somente cliente',
      mobileReady: 'Pronto para mobile',
      accessibleBaseline: 'Base acessível'
    },
    foundation: {
      sectionLabel: 'Base de estilo',
      sectionTitle: 'Status de inicialização',
      sectionText:
        'A base agora estabelece estilos globais compartilhados, estilo com escopo de componente e uma camada de apresentação responsiva que funciona claramente em desktop e telas móveis em quadra.'
    },
    foundationItems: {
      tanstackShell: {
        title: 'Shell TanStack Start',
        detail:
          'A geração de rotas e a inicialização somente cliente já estão carregando a estrutura do aplicativo.'
      },
      designTokens: {
        title: 'Tokens de design compartilhados',
        detail:
          'Variáveis globais agora definem o espaçamento, cores, tipografia e linha de base de foco para futuros trabalhos de UI.'
      },
      scopedStyling: {
        title: 'Estilo de componente com escopo',
        detail:
          'CSS Modules mantêm a apresentação do shell isolada enquanto o aplicativo cresce em novas telas e controles.'
      }
    },
    baseUiCheck: {
      trigger: 'Verificar Base UI',
      eyebrow: 'Base de interação',
      title: 'Base UI conectado',
      description:
        'Este diálogo confirma que a base pode renderizar primitivos acessíveis e estilizados dentro da rota TanStack Start.',
      close: 'Fechar painel'
    }
  },
  notFound: {
    eyebrow: 'Página não encontrada',
    title: 'Não foi possível encontrar essa rota.',
    description:
      'A base do aplicativo está funcionando, mas esta página não existe na árvore de rotas atual.',
    backLink: 'Voltar para a tela inicial'
  },
  startupGate: {
    loading: {
      eyebrow: 'Verificação de inicialização',
      title: 'Verificando partida salva',
      body: 'Padel Buddy está restaurando o espaço de trabalho da partida atual antes de abrir o shell.'
    },
    corrupt: {
      eyebrow: 'Recuperação de inicialização',
      title: 'Partida salva precisa de recuperação',
      body: 'O registro da partida atual não pôde ser restaurado com segurança. Reinicie a partida salva para continuar no shell do aplicativo.',
      resetButton: 'Reiniciar e continuar'
    },
    notice: {
      title: 'Partida salva foi reiniciada',
      body: 'Uma partida salva mais antiga foi limpa porque não corresponde mais ao esquema atual do aplicativo.',
      dismiss: 'Dispensar'
    },
    errors: {
      clearSavedMatch: 'Não foi possível limpar a partida salva agora.'
    },
    resume: {
      eyebrow: 'Partida salva encontrada',
      title: 'Retomar partida salva?',
      body: 'Padel Buddy restaurou uma partida atual em andamento. Retomar mantém o registro de ações e restaura o estado da pontuação ao vivo através de replay.',
      resumeButton: 'Retomar',
      discardButton: 'Descartar'
    }
  },
  speech: {
    verbosity: {
      minimal: 'Mínimo',
      standard: 'Padrão',
      verbose: 'Detalhado'
    }
  },
  score: {
    points: {
      '0': 'Zero',
      '15': 'Quinze',
      '30': 'Trinta',
      '40': 'Quarenta',
      Ad: 'Vantagem'
    },
    announcements: {
      game: 'Game',
      set: 'Set',
      match: 'Partida',
      serving: 'Sacando',
      all: 'Iguais',
      deuce: 'Deuce',
      goldenPoint: 'Ponto de Ouro',
      correction: 'Correção.',
      gamePoint: 'Game point {{teamName}}',
      breakPoint: 'Break point',
      setPoint: 'Set point {{teamName}}',
      matchPoint: 'Match point {{teamName}}'
    }
  },
  share: {
    topbar: {
      appName: 'Padel Buddy',
      badge: 'PARTIDA ENCERRADA'
    },
    result: {
      winners: 'VENCEDORES'
    },
    score: {
      title: 'Resultado',
      set: 'Set {{number}}'
    },
    stats: {
      duration: 'DURAÇÃO',
      date: 'DATA'
    }
  },
  setup: {
    header: {
      appName: 'Padel Buddy',
      subtitle: 'Configurar partida'
    },
    locale: {
      selectLanguage: 'Selecionar idioma'
    },
    teams: {
      team1Label: 'TIME 1',
      team2Label: 'TIME 2',
      team1Default: 'Time A',
      team2Default: 'Time B',
      playerPlaceholder: 'Nome do time'
    },
    firstServer: {
      label: 'PRIMEIRO SAQUE',
      team1: 'Time 1',
      team2: 'Time 2'
    },
    format: {
      label: 'FORMATO DA PARTIDA',
      bestOf1: 'Melhor de 1',
      bestOf3: 'Melhor de 3',
      bestOf5: 'Melhor de 5'
    },
    rules: {
      audioAnnouncements: 'Anúncios de áudio',
      audioAnnouncementsHint: 'Narra a pontuação como árbitro de cadeira',
      goldenPoint: 'Ponto de Ouro',
      goldenPointHint: 'Sem vantagem no deuce',
      superTiebreak: 'Super Tiebreak',
      superTiebreakHint: 'Tiebreak no set final até 10 pontos',
      sideSwitch: 'Avisos de Troca de Lado',
      sideSwitchHint: 'Lembrar jogadores de trocar de lado',
      servingIndicator: 'Indicador de saque',
      servingIndicatorHint: 'Mostra quem está sacando no momento',
      countdownTimer: 'Cronômetro regressivo',
      countdownTimerHint: 'Faz a contagem regressiva de tempo fixa da partida',
      countdownDuration: {
        label: 'Duração da partida',
        oneHour: '1:00 h',
        ninetyMinutes: '1:30 h',
        twoHours: '2:00 h'
      }
    },
    remoteConfig: {
      trigger: 'Config. controle remoto',
      title: 'Controle remoto Bluetooth',
      description:
        'Atribua um botão por ação. Os botões de reverter sempre removem apenas a última ação de pontuação daquele time.',
      helper:
        'Enquanto estiver escutando, pressione uma vez qualquer botão do controle ou teclado. Salvar com todas as ações vazias remove o mapeamento personalizado.',
      listening: 'Escutando...',
      listeningAnnouncement: 'Pressione um botão no seu controle para atribuí-lo a {{action}}.',
      notSet: 'Não configurado',
      rows: {
        singlePressHint: 'Um toque para adicionar um ponto',
        guardedUndoHint: 'Remove a última ação de pontuação daquele time'
      },
      actions: {
        addTeam1: 'Adicionar Time 1',
        revertTeam1: 'Reverter Time 1',
        addTeam2: 'Adicionar Time 2',
        revertTeam2: 'Reverter Time 2',
        clear: 'Vínculos vazios',
        resetDefaults: 'Restaurar padrões',
        cancel: 'Cancelar',
        save: 'Salvar'
      },
      feedback: {
        loadError: 'Não foi possível carregar a configuração do controle remoto.',
        saveError: 'Não foi possível salvar a configuração do controle remoto.',
        saveSuccess: 'Configuração do controle remoto salva.'
      }
    },
    voiceSelection: {
      title: 'Selecionar voz',
      selectVoice: 'Selecione uma voz',
      preview: 'Prévia',
      previewLink: 'Configurar voz',
      cancel: 'Cancelar',
      accept: 'Aceitar'
    },
    startButton: 'Iniciar Partida',
    validation: {
      teamNamesRequired: 'Ambos os nomes dos times são obrigatórios',
      selectFormat: 'Por favor, selecione um formato de partida',
      selectServer: 'Por favor, selecione o primeiro sacador',
      invalidCountdownDuration: 'Por favor, selecione uma duração válida para o cronômetro'
    }
  },
  match: {
    header: {
      appName: 'Padel Buddy',
      subtitle: 'Partida ao vivo'
    },
    score: {
      games: 'Jogos'
    },
    scorePointFor: 'Marcar ponto para {{teamName}}',
    serving: 'Sacando',
    info: {
      title: 'Detalhes da quadra',
      goldenPoint: 'PO',
      goldenPointOn: 'Ponto de ouro ativado',
      goldenPointOff: 'Ponto de ouro desativado',
      superTiebreakOn: 'Super tiebreak ativado',
      superTiebreakOff: 'Super tiebreak desativado',
      sideSwitchOn: 'Trocas de lado: ativado',
      sideSwitchOff: 'Trocas de lado: desativado'
    },
    sets: {
      label: 'Sets',
      setLabel: 'Set {{number}}',
      currentShort: 'Atual',
      superTiebreakBadge: 'S-TB'
    },
    timer: {
      label: 'Hora atual: {{time}}',
      countdownLabel: 'Tempo restante da partida: {{time}}'
    },
    rotateDevice: {
      title: 'Gire o seu dispositivo',
      description:
        'Esta tela funciona melhor no modo paisagem. Gire o seu dispositivo para continuar.'
    },
    end: {
      header: {
        appName: 'Padel Buddy',
        subtitle: 'Partida encerrada'
      },
      winner: {
        label: 'Vencedores',
        finishedEarlyLabel: 'Partida encerrada',
        finishedEarlyName: 'Nenhum vencedor (Empate)'
      },
      summary: {
        title: 'Resultado',
        setLabel: 'Set {{number}}',
        setScoreRow:
          'Set {{setNumber}}: {{teamOneName}} {{teamOneScore}}, {{teamTwoName}} {{teamTwoScore}}'
      },
      stats: {
        matchLength: 'Duração da partida',
        totalGames: 'Total de games',
        durationHoursMinutes: '{{hours}}h {{minutes}}min',
        durationMinutes: '{{minutes}}min'
      },
      actions: {
        share: 'Compartilhar',
        sharing: 'Compartilhando...',
        newMatch: 'Nova partida',
        continue: 'Continuar'
      },
      share: {
        text: '{{winnerName}} venceu uma partida {{formatLabel}} do Padel Buddy em {{durationValue}} e {{totalGames}} games. {{teamOneName}} vs {{teamTwoName}}.',
        error: 'Não foi possível compartilhar esta partida agora.',
        download: 'A imagem da partida foi baixada.',
        textFinishedEarly:
          'A partida {{formatLabel}} do Padel Buddy entre {{teamOneName}} e {{teamTwoName}} terminou mais cedo após {{durationValue}} e {{totalGames}} games.'
      },
      speech: {
        victory: 'Vitória {{teamName}}',
        tiedMatch: 'Jogo empatado'
      },
      aria: {
        summaryRegion: 'Resumo do resultado da partida',
        statisticsRegion: 'Estatísticas da partida'
      },
      debug: {
        previewLabel: 'Pré-visualização de depuração da tela de compartilhamento',
        previewTitle: 'DEPURAÇÃO — Pré-visualização da ShareScreen',
        closeModal: 'Fechar modal de depuração'
      }
    },
    actions: {
      revertPoint: 'Desfazer ponto',
      finishMatch: 'Encerrar Partida'
    },
    sideSwitch: {
      oddGames: 'Trocar de lado (jogos ímpares)',
      tiebreakInterval: 'Trocar de lado (tiebreak)',
      description: 'Os jogadores devem trocar de lado agora.',
      confirm: 'Trocado'
    }
  },
  help: {
    triggerLabel: 'Abrir ajuda',
    about:
      'Padel Buddy é um rastreador de pontuação ao vivo para partidas de padel. Acompanhe pontos, games e sets em tempo real.',
    howToUse: {
      title: 'Como usar',
      body: 'O aplicativo orienta você através de três telas principais:\n\nTela de configuração — Insira os nomes dos times, escolha um formato de partida (Melhor de 1, 3 ou 5 sets) e configure regras opcionais como Ponto de Ouro, Super Tiebreak, Avisos de Troca de Lado, Indicador de Saque e Cronômetro. Você também pode configurar um controle remoto Bluetooth e selecionar uma voz para os anúncios de pontuação.\n\nTela de partida ao vivo — Toque no painel de pontuação de um time para adicionar um ponto, ou use seu controle remoto configurado. Toque no botão desfazer para reverter a última ação de pontuação daquele time. Quando o Indicador de Saque está ativado, o cartão do time que está sacando fica destacado. Quando os anúncios de áudio estão ativados, uma voz anuncia cada ponto. Um aviso de troca de lado aparece entre os games quando essa opção está ativa.\n\nTela de fim de partida — Mostra o resultado final e as estatísticas da partida. O vencedor é determinado apenas pelos sets completados. Se ambos os times venceram a mesma quantidade de sets, o resultado é um empate mesmo que um terceiro set esteja em andamento. Use o botão Compartilhar para distribuir a imagem do resultado, ou o botão Continuar para continuar jogando sem encerrar a partida.\n\nSe o aplicativo ou a aba do navegador for fechada durante uma partida ativa, o estado da partida é salvo automaticamente. Quando você reabrir o aplicativo, pode retomar a partida de onde parou ou descartá-la e começar novamente.'
    },
    advertising: {
      title: 'Obter o app',
      body: 'Baixe o aplicativo móvel para uma experiência dedicada e sem anúncios no seu dispositivo.',
      getItOnGooglePlay: 'Disponível no Google Play',
      downloadOnAppStore: 'Baixar na App Store',
      noAds: 'Os aplicativos móveis não contêm anúncios.'
    },
    pwa: {
      title: 'Instalar app',
      body: 'Padel Buddy é um Aplicativo Web Progressivo (PWA). Você pode instalá-lo em qualquer dispositivo abrindo o menu compartilhar do seu navegador e selecionando "Adicionar à tela inicial" (ou opção similar). Uma vez instalado, Padel Buddy funciona completamente offline — não é necessária conexão com a internet durante as partidas.'
    },
    spotlight: {
      title: 'Bem-vindo ao Padel Buddy',
      message: 'Comece aqui se tiver alguma dúvida',
      dismiss: 'Entendi'
    }
  }
} as const;
