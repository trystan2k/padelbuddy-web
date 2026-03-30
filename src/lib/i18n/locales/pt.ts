export default {
  common: {
    loading: 'Carregando...',
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
    description: 'Uma base estilizada para o rastreador de pontuação ao vivo.'
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
      title: 'Resultado Final',
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
      trigger: 'Config. do controle remoto',
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
      currentShort: 'Atual'
    },
    timer: {
      label: 'Hora atual: {{time}}',
      countdownLabel: 'Tempo restante da partida: {{time}}'
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
        title: 'Resumo dos sets',
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
  }
} as const
