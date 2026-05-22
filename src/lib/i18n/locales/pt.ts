export default {
  common: {
    loading: 'Carregando...',
    loadingLabel: 'Carregando',
    loadingPleaseWait: 'Por favor aguarde...',
    close: 'Fechar',
    retry: 'Tentar novamente',
    dismiss: 'Dispensar'
  },
  pwaInstall: {
    banner: {
      label: 'Banner para instalar o app',
      title: 'Instale o Padel Buddy',
      body: 'Adicione o app a tela inicial para acesso mais rapido.',
      manualTitle: 'Adicione o Padel Buddy a tela inicial',
      manualBody:
        'No iPhone ou iPad, abra o menu Compartilhar e toque em Adicionar a Tela de Inicio.',
      install: 'Instalar app',
      installing: 'Abrindo aviso...'
    }
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
    description: 'Base client-only do TanStack Start para o placar do Padel Buddy.',
    license: {
      blocked: {
        eyebrow: 'Google Play obrigatório',
        title: 'Instale pela Google Play',
        body: 'Esta versão só pode ser executada quando instalada pela Google Play Store. Se você comprou o Padel Buddy, reinstale o app pela Google Play para restaurar o acesso.'
      }
    }
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
      advantageTeam: 'Vantagem {{teamName}}',
      gamePoint: 'Game point {{teamName}}',
      breakPoint: 'Break point {{teamName}}',
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
      remoteController: 'Controle Remoto',
      remoteControllerHint: 'Teclado e botões de mídia',
      remoteControllerLink: 'Configurar',
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
      title: 'Controle Remoto',
      description:
        'Você pode usar seu teclado ou os botões de faixa (Anterior/Próxima) para controlar a partida. Clique em um botão do teclado para capturar sua tecla preferida.',
      listening: 'Escutando...',
      listeningAnnouncement: 'Pressione um botão no seu controle para atribuí-lo a {{action}}.',
      notSet: 'Não configurado',
      mediaButtons: {
        nextTrack: 'Próxima um clique',
        nextTrackDouble: 'Próxima duplo cliques',
        nextTrackShort: '>> Próxima um clique',
        nextTrackShortDouble: '>> Próxima duplo cliques',
        previousTrack: 'Anterior um clique',
        previousTrackDouble: 'Anterior duplo cliques',
        previousTrackShort: '<< Anterior um clique',
        previousTrackShortDouble: '<< Anterior duplo cliques',
        notConfigurable: 'Não configurável'
      },
      rows: {
        addPointHint: 'Pressione para adicionar um ponto a esse time',
        revertPointHint: 'Pressione para reverter o ponto desse time',
        mediaBadgeTooltip: 'Atribuição fixa do botão de mídia'
      },
      actions: {
        addTeam1: 'Ponto Time 1',
        revertTeam1: 'Reverter Time 1',
        addTeam2: 'Ponto Time 2',
        revertTeam2: 'Reverter Time 2',
        cancel: 'Cancelar',
        save: 'Salvar',
        clear: 'Limpar',
        resetDefaults: 'Restabelecer'
      },
      feedback: {
        loadError: 'Não foi possível carregar a configuração do controle remoto.',
        saveError: 'Não foi possível salvar a configuração do controle remoto.',
        saveSuccess: 'Configuração do controle remoto salva.',
        clearSuccess: 'Configuração do controle remoto limpa.',
        resetSuccess: 'Configuração do controle remoto restabelecida.'
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
    historyButton: 'Histórico',
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
        continue: 'Continuar',
        back: 'Voltar'
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
      finishMatch: 'Encerrar Partida',
      exitFullscreen: 'Sair da tela cheia'
    },
    sideSwitch: {
      oddGames: 'Trocar de lado (jogos ímpares)',
      tiebreakInterval: 'Trocar de lado (tiebreak)',
      description: 'Os jogadores devem trocar de lado agora.',
      confirm: 'Trocado'
    }
  },
  history: {
    header: {
      title: 'Histórico de partidas',
      subtitle: 'Histórico de partidas'
    },
    matchCount_one: '{{count}} partida',
    matchCount_other: '{{count}} partidas',
    emptyState: 'Ainda não há partidas finalizadas.',
    saveError: 'Não foi possível salvar esta partida no histórico.',
    saveRetry: 'Tentar novamente',
    deleteSuccess: 'Partida removida do histórico',
    setsScore: {
      unfinishedTooltip: 'Partida não terminada'
    },
    table: {
      ariaLabel: 'Tabela do histórico de partidas',
      columns: {
        teams: 'Times',
        date: 'Data',
        sets: 'Sets',
        games: 'Games',
        actions: 'Ações'
      }
    },
    actions: {
      share: 'Compartilhar',
      shareAriaLabel: 'Compartilhar partida {{team1}} vs {{team2}}',
      shareCopied: 'Resumo da partida copiado para a área de transferência.',
      shareError: 'Não foi possível compartilhar esta partida agora.',
      delete: 'Excluir',
      deleteAriaLabel: 'Excluir partida {{team1}} vs {{team2}}',
      deleteConfirm: 'Excluir esta partida do histórico?',
      deleteError: 'Não foi possível excluir esta partida agora.',
      playAgain: 'Jogar novamente',
      playAgainError: 'Não foi possível preparar esta revanche agora.',
      playAgainAriaLabel: 'Jogar novamente',
      back: 'Voltar'
    },
    shareMessage: '{{date}} · {{team1}} vs {{team2}} · Sets {{sets}} · Games {{games}}'
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
      dismiss: 'Entendi',
      announcement: 'Diálogo de boas-vindas aberto. Pressione Escape ou clique fora para fechar.'
    },
    page: {
      meta: {
        title: 'Ajuda e guia do Padel Buddy',
        description:
          'Aprenda como o Padel Buddy funciona desde a configuração até o placar ao vivo, fim de partida, histórico, recuperação e uso offline.'
      },
      hero: {
        eyebrow: 'Guia de ajuda',
        title: 'Tudo o que você precisa para usar o Padel Buddy em quadra',
        body: 'Esta página explica o fluxo completo do produto em linguagem simples para que qualquer jogador configure uma partida rapidamente e marque pontos com confiança.'
      },
      toc: {
        title: 'Nesta página',
        whatIs: 'O que é o Padel Buddy?',
        mainFlow: 'Fluxo principal',
        setup: 'Configuração da partida',
        liveMatch: 'Tela de partida ao vivo',
        matchEnd: 'Tela de fim de partida',
        history: 'Histórico de partidas',
        recovery: 'Recuperação e confiabilidade',
        helpSystem: 'Sistema de ajuda integrado',
        accessibility: 'Idiomas e acessibilidade',
        platforms: 'Web, PWA e apps nativos',
        smallDetails: 'Pequenos detalhes importantes',
        privacy: 'Privacidade'
      },
      common: {
        back: 'Voltar',
        startMatch: 'Iniciar partida',
        publicOnlyNote: 'Esta página inclui apenas conteúdo público voltado ao usuário.',
        placeholderLabel: 'Espaço reservado para captura',
        captureHintLabel: 'Como capturar',
        captionLabel: 'Legenda',
        storeAvailabilityLabel: 'Também disponível nas lojas móveis'
      },
      related: {
        privacy: {
          title: 'Informações de privacidade',
          body: 'Veja como o Padel Buddy armazena dados da partida localmente no seu dispositivo e quais serviços de apoio podem processar dados técnicos limitados do app.',
          cta: 'Abrir página de privacidade'
        }
      },
      whatIs: {
        title: 'O que é o Padel Buddy?',
        body: 'Padel Buddy é um assistente de partida criado especificamente para marcar jogos de padel em uso real de quadra. Ele reúne lógica oficial de pontuação, rotação de saque, avisos de troca de lado, resumo final e histórico em um único fluxo, sem depender de papel nem de vários apps. Na prática, você configura os times antes do aquecimento, registra cada ponto durante o jogo e termina com um card de resultado pronto para compartilhar em poucos segundos.'
      },
      mainFlow: {
        title: 'Fluxo principal do app',
        body: 'O Padel Buddy segue uma jornada clara de três etapas: configurar a partida, pontuar ao vivo e revisar o resultado final. Cada etapa foi pensada para uso rápido em quadra, sem perder controle para formatos diferentes de competição. Isso ajuda os jogadores a gastar menos tempo operando o app e mais tempo jogando.',
        setup: {
          title: '1) Configuração',
          body: 'Antes do primeiro ponto, defina nomes dos times, formato da partida, ordem de saque e regras opcionais como Ponto de Ouro ou Super Tie-break. Você também pode ativar anúncios falados, configurar controle remoto e escolher duração da contagem regressiva. Fazer essa etapa corretamente garante que o motor de pontuação se comporte bem desde o início.'
        },
        liveMatch: {
          title: '2) Partida ao vivo',
          body: 'Durante o jogo, use controles grandes na tela ou no controle remoto para adicionar e reverter pontos com mínima fricção. O app aplica automaticamente deuce, tie-break, super tie-break, ordem de saque e trocas de lado com base na configuração. Assim, você evita cálculos manuais em momentos de pressão.'
        },
        matchEndHistory: {
          title: '3) Fim de partida e histórico',
          body: 'Ao finalizar, revise vencedor, placar por set e estatísticas principais, e compartilhe uma imagem gerada se desejar. Partidas concluídas ficam no histórico para consulta posterior, exclusão ou revanche com nomes pré-preenchidos. Isso organiza tanto o fechamento imediato quanto o registro de longo prazo.'
        },
        recovery: {
          title: 'Recuperação automática',
          body: 'Se a aba fechar, o celular bloquear ou o app for interrompido, o Padel Buddy pode restaurar a partida em andamento a partir do armazenamento local. Na reabertura, você escolhe retomar exatamente de onde parou ou descartar o estado salvo. Isso protege a continuidade do placar em interrupções reais.'
        }
      },
      setup: {
        title: 'Configuração da partida',
        body: 'A tela de configuração é o centro de controle onde você define como toda a partida vai funcionar. Cada opção impacta diretamente o placar ao vivo, os anúncios, o tempo e o resumo final. Investir um minuto nessa etapa evita confusão durante o jogo.',
        teamNames: {
          title: 'Nomes das equipes',
          body: 'Informe nomes claros para Time 1 e Time 2, como duplas de jogadores ou nome do clube. Esses nomes aparecem no placar ao vivo, anúncios de voz, tela final, histórico e cards de compartilhamento. Para grupos recorrentes, lembrar nomes acelera revanches e reduz erros de digitação.'
        },
        matchFormat: {
          title: 'Formato da partida',
          body: 'Escolha Melhor de 1, Melhor de 3 ou Melhor de 5 para definir quantos sets são necessários para vencer. Essa opção controla quando a partida pode terminar e quantas chances de recuperação cada equipe tem. Por exemplo, Melhor de 3 é comum em jogos competitivos, enquanto Melhor de 1 funciona bem para sessões curtas.'
        },
        goldenPoint: {
          title: 'Golden Point ou vantagem',
          body: 'Selecione entre pontuação tradicional com vantagem ou Golden Point no deuce. No modo vantagem, a dupla precisa vencer dois pontos seguidos após 40-40; no Golden Point, o próximo ponto decide o game. O Golden Point normalmente encurta games e aumenta a pressão nos pontos decisivos.'
        },
        superTiebreak: {
          title: 'Super tie-break no set decisivo',
          body: 'Ative esta opção para substituir o set decisivo por um super tie-break até 10 pontos, vencendo por 2. Esse formato é comum quando se quer reduzir o tempo total sem perder competitividade no fechamento. Se desativado, o set decisivo segue o formato normal por games.'
        },
        firstServer: {
          title: 'Primeiro sacador',
          body: 'Defina qual equipe saca primeiro antes de começar. Isso inicializa corretamente a rotação de saque para todos os games e cenários de tie-break. Configurar corretamente evita correções futuras da ordem de serviço.'
        },
        servingIndicator: {
          title: 'Indicador de saque',
          body: 'Quando ativado, o time sacador fica visualmente destacado na tela da partida ao vivo. Esse contexto rápido ajuda jogadores e observadores, principalmente em trocas de ritmo acelerado. É especialmente útil quando quem marca está fora da quadra.'
        },
        sideSwitch: {
          title: 'Avisos de troca de lado',
          body: 'Ative lembretes automáticos para os momentos corretos de troca de lado. O app mostra um aviso claro para confirmar e seguir sem perder foco no placar. Isso reduz esquecimentos em partidas longas ou intensas.'
        },
        countdown: {
          title: 'Temporizador de contagem regressiva',
          body: 'Transforme o tempo superior em contagem regressiva para reservas de quadra com duração fixa, como 1:00, 1:30 ou 2:00. Se estiver desativado, a mesma área funciona como referência de relógio/tempo. Isso ajuda a gerenciar o horário e decidir quando encerrar ou acelerar a partida.'
        },
        audio: {
          title: 'Anúncios de áudio',
          body: 'Ative anúncios falados para que o app narre o placar e estados importantes da partida. Isso ajuda quando os jogadores não conseguem olhar para a tela entre pontos ou quando o marcador está em posição lateral. O áudio melhora a confiança de que todos ouviram o mesmo resultado.'
        },
        voiceSelection: {
          title: 'Seleção de voz',
          body: 'Abra a seleção de voz para testar e escolher a voz mais clara no seu dispositivo. As opções dependem do sistema operacional e dos pacotes de voz instalados. Validar antes do jogo evita mal-entendidos durante os anúncios.'
        },
        remoteController: {
          title: 'Configuração de controle remoto',
          body: 'Use a configuração remota para mapear botões externos ou teclas às ações de pontuar e desfazer de cada equipe. Você pode salvar mapeamentos personalizados, limpar vínculos individuais ou restaurar padrões. É ideal quando alguém controla o placar por clicker Bluetooth ou teclado fora da quadra.\n\nTestamos o seguinte controle remoto Bluetooth, que funciona com este app: <remoteLink>Bluetooth Media Buttons Remote Control</remoteLink> (ou procure opções similares: Bluetooth Media Buttons Remote Control). Ele usa os botões de volume, que o app suporta nativamente.'
        },
        languageSelector: {
          title: 'Seletor de idioma',
          body: 'Altere o idioma da interface entre inglês, espanhol e português diretamente na configuração. A troca atualiza na hora rótulos, ajuda e a maior parte dos textos visíveis ao usuário. Assim, grupos multilíngues conseguem compartilhar o mesmo aparelho com mais conforto.'
        },
        historyShortcut: {
          title: 'Atalho para histórico',
          body: 'Use este atalho para abrir o histórico sem precisar iniciar uma nova partida. De lá, você revisa resultados antigos, compartilha depois, exclui registros ou inicia revanche com nomes pré-preenchidos. É um caminho rápido para atividades recentes a partir do fluxo inicial.'
        },
        storeButtons: {
          title: 'Botões de lojas na web/PWA',
          body: 'Na web e na PWA, badges de loja levam direto para as versões móveis nativas. Isso facilita migrar para o canal de instalação preferido quando o usuário quer distribuição por loja. Também deixa a disponibilidade por plataforma clara em um único lugar.'
        }
      },
      liveMatch: {
        title: 'Tela de partida ao vivo',
        body: 'A tela de partida ao vivo é otimizada para registrar pontos com rapidez e segurança durante jogos reais. Ela prioriza controles grandes, contexto claro e aplicação automática das regras para reduzir erros sob pressão. As decisões complexas de pontuação ficam com o motor, não com cálculos manuais do usuário.',
        largeScorePanels: {
          title: 'Painéis grandes de pontuação',
          body: 'Toque no painel de uma equipe para adicionar ponto instantaneamente, mesmo em pausas curtas entre rallies. O layout usa áreas de toque amplas e alto contraste, otimizado para orientação paisagem. Isso reduz toques acidentais e melhora a velocidade de marcação.'
        },
        servingIndicator: {
          title: 'Indicador de saque',
          body: 'Quando ativado, o time sacador fica claramente destacado para dar contexto imediato de serviço. Esse sinal visual acompanha o estado do placar e pode refletir no anúncio falado. Isso reduz dúvidas em trocas de lado e transições de tie-break.'
        },
        undo: {
          title: 'Botões de desfazer por equipe',
          body: 'Cada equipe possui sua própria ação de desfazer para reverter o último ponto atribuído àquele lado. O desfazer rebobina o estado real, incluindo game, set, tie-break e progressão de saque quando necessário. É essencial para corrigir toques incorretos sem reconstruir o placar manualmente.'
        },
        automaticScoring: {
          title: 'Regras automáticas de pontuação',
          body: 'O motor de pontuação aplica automaticamente as regras de padel conforme a configuração escolhida. Ele gerencia progressão de pontos, fechamento de games, fechamento de sets, deuce e transições de tie-break sem intervenção manual. Isso garante consistência mesmo em finais de set mais complexos.'
        },
        deuceAdvantage: {
          title: 'Deuce e vantagem',
          body: 'No modo vantagem, ao chegar em 40-40, a equipe precisa vencer dois pontos consecutivos para fechar o game. O app controla automaticamente o estado de vantagem e anuncia as transições com clareza. Assim, a pontuação tradicional é aplicada de forma confiável.'
        },
        goldenPoint: {
          title: 'Lógica de Golden Point',
          body: 'No modo Golden Point, o deuce é resolvido em um único ponto decisivo no 40-40. O próximo ponto encerra imediatamente o game para o time vencedor. Essa opção acelera o ritmo da partida e simplifica momentos de alta pressão.'
        },
        standardTiebreak: {
          title: 'Tie-break padrão em 6-6',
          body: 'Quando um set chega em 6-6, o app entra automaticamente no tie-break padrão de 7 pontos, com vitória por 2. Ao vencer, o set é registrado como 7-6 no resumo final. Não é necessário ativar nenhum modo manual.'
        },
        superTiebreak: {
          title: 'Super tie-break no set decisivo',
          body: 'Se o Super Tie-break foi ativado na configuração, o set decisivo vira disputa até 10 pontos, vencendo por 2. O app aplica esse formato somente no último set decisivo e registra o resultado corretamente. É útil para torneios que precisam encerrar em menos tempo.'
        },
        sideSwitch: {
          title: 'Avisos de troca de lado',
          body: 'Quando ativo, avisos de troca de lado aparecem nos momentos corretos de regra para lembrar os jogadores. O aviso some automaticamente após alguns segundos para não bloquear o placar. Assim, você mantém lembrete visível sem perder fluidez de jogo.'
        },
        timer: {
          title: 'Cronômetro / relógio da partida',
          body: 'A área superior mostra contexto de tempo em formato claro HH:MM:SS, como relógio ou contagem regressiva conforme a configuração. Isso permite leitura rápida em pausas e trocas de lado. Ajuda a controlar ritmo, horário da quadra e decisões de encerramento.'
        },
        finishAction: {
          title: 'Ação Finalizar jogo',
          body: 'Use Finalizar jogo para encerrar manualmente quando as condições reais exigirem parar antes do fim oficial. Exemplos comuns: fim do horário da quadra, lesão ou acordo entre jogadores. O app preserva o progresso registrado e leva para um resumo consistente.'
        },
        autoFinishRoute: {
          title: 'Rota automática para fim de partida',
          body: 'Quando a condição oficial de vitória é atingida, o app navega automaticamente para a tela de fim de partida. Isso evita confirmação manual de encerramento e reduz risco de pontuação extra por engano. O fechamento final permanece alinhado ao formato escolhido.'
        },
        rotateBlocker: {
          title: 'Bloqueio de rotação em retrato',
          body: 'Em celulares no modo retrato, o placar ao vivo pede rotação para paisagem. Essa escolha prioriza controles maiores e leitura de pontuação mais clara à distância. Também evita interações apertadas durante o jogo.'
        },
        compactHeight: {
          title: 'Comportamento em altura compacta',
          body: 'Em telas com pouca altura, controles secundários podem se ocultar após inatividade para ampliar a área do placar. Quando necessário, eles podem ser restaurados rapidamente. Esse comportamento adaptativo mantém o principal sempre legível em aparelhos menores.'
        },
        wakeLock: {
          title: 'Suporte a wake lock',
          body: 'Quando dispositivo e navegador suportam, o app solicita wake lock para evitar que a tela apague durante a partida. Isso reduz interrupções causadas por bloqueio automático no meio da marcação. Se não houver suporte, o app continua funcionando normalmente.'
        },
        keyboardRemote: {
          title: 'Controles de teclado / remoto / mídia',
          body: 'Além do toque na tela, você pode controlar o placar com teclado, controles Bluetooth e botões de mídia compatíveis. Essa flexibilidade permite marcar pontos à distância sem chegar perto do aparelho. É muito útil com celular em tripé ou marcador no banco.'
        },
        mediaDoublePress: {
          title: 'Desfazer com mídia por duplo toque',
          body: 'Com controles de mídia compatíveis, um toque simples pode pontuar e um toque duplo pode desfazer para o mesmo lado em uma janela curta. Esse desenho permite correções rápidas sem abrir menus extras. É especialmente prático em clickers compactos com poucos botões.'
        },
        speech: {
          title: 'Fala durante pontuação ao vivo',
          body: 'Os anúncios por voz podem informar placar e também momentos importantes como deuce, game point, set point e match point. Isso mantém todos alinhados quando a atenção visual está no rally. Também melhora a acessibilidade para quem depende de contexto falado.'
        },
        speechVerbosity: {
          title: 'Mínimo / Padrão / Verboso',
          body: 'Você pode escolher saída de voz Mínima, Padrão ou Verbosa conforme o nível de detalhe desejado. O modo mínimo foca no essencial, enquanto o verboso adiciona mais contexto da partida. Assim, cada grupo ajusta o áudio ao próprio ritmo de jogo.'
        }
      },
      matchEnd: {
        title: 'Tela de fim de partida',
        body: 'A tela de fim de partida consolida o resultado final e mostra ações seguintes de forma clara. Ela foi desenhada para encerrar a sessão com segurança, mantendo dados para compartilhamento e histórico. A partir dela, você pode iniciar uma nova partida ou continuar jogo informal, se quiser.',
        winnerCard: {
          title: 'Card do vencedor',
          body: 'O card do vencedor mostra a equipe que venceu conforme as regras de sets concluídos. Se a partida terminou antes ou sem condição clara de vitória, esse estado aparece explicitamente. Isso evita ambiguidades ao consultar o resultado depois.'
        },
        setSummary: {
          title: 'Resumo dos sets',
          body: 'O resumo dos sets apresenta cada set concluído em ordem, incluindo pontuação de super tie-break decisivo quando aplicável. Ele oferece um registro compacto e completo de como a partida evoluiu. É ideal para conferir antes de compartilhar.'
        },
        statistics: {
          title: 'Estatísticas da partida',
          body: 'As estatísticas principais incluem duração total e quantidade de games disputados. Esses dados acrescentam contexto além do placar final e ajudam a comparar partidas ao longo do tempo. Também podem aparecer no conteúdo de compartilhamento, quando suportado.'
        },
        spokenResult: {
          title: 'Anúncio falado do resultado',
          body: 'Se os anúncios de áudio estiverem ativos, o resultado final pode ser narrado ao entrar nesta tela. Isso confirma o encerramento sem exigir leitura imediata da interface. É útil em quadras barulhentas ou quando os jogadores já estão guardando o material.'
        },
        share: {
          title: 'Ação de compartilhar',
          body: 'Compartilhar gera um card de resultado com dados principais como vencedor, formato, placares por set, duração e data. Você pode enviar por apps de mensagem ou redes como resumo pós-jogo. Isso facilita reportar resultados para grupos, clubes e torneios.'
        },
        newMatch: {
          title: 'Nova partida',
          body: 'Nova partida encerra a sessão atual e volta direto para a configuração com estado limpo. Use quando você vai iniciar outro confronto oficial em seguida. Isso evita carregar dados da partida anterior por engano.'
        },
        continue: {
          title: 'Continuar',
          body: 'Continuar permite seguir jogando após o fechamento oficial sem perder o contexto atual. É útil para games extras informais ou extensão casual da sessão. O app preserva continuidade de tempo e pontuação nessa extensão.'
        }
      },
      history: {
        title: 'Histórico de partidas',
        body: 'O histórico guarda partidas concluídas localmente para que os resultados continuem acessíveis após o fim do jogo. Ele funciona como um arquivo leve para revisar, compartilhar e iniciar revanches rapidamente. Isso ajuda a acompanhar confrontos frequentes sem ferramentas externas.',
        autoStorage: {
          title: 'Armazenamento local automático',
          body: 'Partidas concluídas são salvas automaticamente no armazenamento local do dispositivo ou navegador, sem etapas extras. Assim, o resultado fica disponível mesmo se você fechar o app logo após terminar. Também favorece um uso mais orientado a offline.'
        },
        limit: {
          title: 'Limite de 100 partidas',
          body: 'O histórico mantém até 100 partidas finalizadas mais recentes para equilibrar desempenho e espaço de armazenamento. Ao passar desse limite, os registros mais antigos saem primeiro. Dessa forma, a lista continua leve e rápida em aparelhos móveis.'
        },
        tableInfo: {
          title: 'Detalhes da tabela de histórico',
          body: 'Cada linha resume equipes, data, placar por set, total de games e ações disponíveis. A tabela foi desenhada para leitura rápida sem abrir cada registro individualmente. Ela funciona como um caderno compacto de partidas.'
        },
        winnerHighlight: {
          title: 'Destaque do vencedor',
          body: 'As equipes vencedoras recebem destaque visual para facilitar a identificação de resultado de imediato. Isso reduz erros de leitura ao consultar muitas partidas em sequência. É especialmente útil em contextos de liga ou torneio.'
        },
        finishedEarly: {
          title: 'Indicador de término antecipado',
          body: 'Marcadores especiais identificam partidas encerradas antecipadamente ou sem vencedor padrão por sets completos. Assim, fica claro que o registro é válido, mas com encerramento excepcional. Isso aumenta a transparência na comparação histórica.'
        },
        share: {
          title: 'Compartilhar pelo histórico',
          body: 'Você pode gerar e compartilhar cards de resultado a partir do histórico a qualquer momento, não apenas no fim da partida. Isso é útil quando alguém pede o resumo mais tarde. A opção de compartilhar permanece disponível mesmo sem ação imediata.'
        },
        delete: {
          title: 'Excluir do histórico',
          body: 'Registros podem ser removidos com confirmação para evitar exclusões acidentais. Isso ajuda a manter o histórico limpo e relevante com o tempo. A exclusão afeta apenas o armazenamento local daquele dispositivo.'
        },
        playAgain: {
          title: 'Jogar novamente',
          body: 'Jogar novamente inicia uma revanche usando os nomes das equipes do registro selecionado. Isso reduz o tempo de configuração em confrontos repetidos. Ainda assim, você pode ajustar formato e regras antes de começar.'
        },
        backHome: {
          title: 'Voltar para o início',
          body: 'Uma ação dedicada leva você do histórico de volta para a configuração rapidamente. Isso mantém a navegação previsível e evita se perder em fluxos mais profundos. É útil ao alternar entre revisão e início de novo jogo.'
        },
        emptyState: {
          title: 'Estado vazio',
          body: 'Quando ainda não existe partida concluída salva, um estado vazio amigável é exibido. Isso confirma que a tela está funcionando normalmente, e não com falha de carregamento. Também orienta o usuário a criar o primeiro registro.'
        }
      },
      recovery: {
        title: 'Recuperação, segurança e confiabilidade',
        body: 'Os recursos de recuperação foram projetados para proteger o progresso da partida em situações reais, como fechamento de aba, reinício do app ou instabilidade do dispositivo. O objetivo é preservar estado válido sem arriscar placar corrompido. Essas proteções aumentam a confiança no uso em partidas competitivas.',
        autoPersistence: {
          title: 'Persistência automática da partida atual',
          body: 'Enquanto a partida está em andamento, o estado é salvo continuamente em segundo plano para reduzir perda de pontos recentes. Esse salvamento é automático e não exige ação manual. Ele é a base para retomar após reiniciar.'
        },
        resumePrompt: {
          title: 'Prompt para retomar partida salva',
          body: 'Na inicialização, se houver partida em andamento salva, o app pergunta se você deseja retomar ou descartar. Retomar restaura o contexto completo; descartar volta para configuração limpa. Essa escolha explícita evita continuidade acidental de partida antiga.'
        },
        corruptRecovery: {
          title: 'Recuperação de dados corrompidos',
          body: 'Se os dados salvos estiverem inválidos ou ilegíveis, o app oferece um fluxo seguro de redefinição em vez de falhar. Isso permite recuperar rapidamente um estado utilizável. A prioridade é estabilidade, não restauração parcial arriscada.'
        },
        schemaReset: {
          title: 'Aviso de redefinição por incompatibilidade de esquema',
          body: 'Quando mudanças de versão tornam salvamentos antigos incompatíveis, o app pode redefini-los automaticamente com aviso único explicativo. Isso mantém estabilidade entre atualizações e informa claramente o que aconteceu. Evita falhas silenciosas ou retomadas quebradas.'
        },
        friendlyErrors: {
          title: 'Tratamento amigável de erros',
          body: 'Para rotas inválidas ou registros ausentes, a interface mostra mensagens claras focadas em recuperação, em vez de erros técnicos brutos. O usuário recebe próximos passos práticos, como voltar para configuração. Isso torna o comportamento compreensível para quem não é técnico.'
        },
        loadingFeedback: {
          title: 'Feedback de carregamento de rotas',
          body: 'Durante carregamentos e transições, o app mostra estado pendente visível para indicar que ainda está processando. Isso reduz incerteza e toques repetidos em momentos de lentidão. Um bom feedback de carregamento melhora a percepção de confiabilidade.'
        }
      },
      helpSystem: {
        title: 'Página de ajuda dentro do app',
        body: 'O Padel Buddy reúne orientações em uma página de ajuda dedicada, acessível sem sair do aplicativo. O conteúdo foi pensado para perguntas práticas de uso em quadra e decisões rápidas. Isso reduz atrito de onboarding para usuários novos e ocasionais.',
        topBarHelp: {
          title: 'Ação de ajuda na barra superior',
          body: 'A barra superior oferece acesso rápido à página de ajuda em telas-chave, como configuração e partida. Assim, você não precisa navegar por menus profundos para encontrar documentação. O suporte fica sempre visível durante o uso real.'
        },
        spotlight: {
          title: 'Destaque de primeira visita',
          body: 'Na primeira visita, um destaque visual mostra onde a ajuda está e como acessar a página /help. Depois de dispensado, ele fica marcado como visto para não interromper usuários frequentes. Isso equilibra orientação inicial com fluidez de longo prazo.'
        },
        builtInDialog: {
          title: 'Página de ajuda integrado',
          body: 'A página de ajuda resume fluxo principal, configurações essenciais e opções de instalação web/PWA/nativa. Ela funciona como referência rápida antes de iniciar ou durante a partida. Assim, reduz a dependência de documentação externa.'
        }
      },
      accessibility: {
        title: 'Idiomas e acessibilidade',
        body: 'O Padel Buddy suporta inglês, espanhol e português com rótulos e ajuda localizados, permitindo uso confortável por grupos multilíngues no mesmo aparelho. Em acessibilidade, oferece estrutura semântica, navegação por teclado, foco visível, contraste legível e atualizações faladas de placar. Em conjunto, esses recursos facilitam o uso para diferentes necessidades de idioma, visão e interação.'
      },
      platforms: {
        title: 'PWA, uso offline, web e apps nativos',
        body: 'O Padel Buddy pode ser usado em formatos diferentes conforme sua preferência: web no navegador, PWA instalada ou app móvel nativo. A experiência principal de placar é a mesma, mas instalação e distribuição variam por plataforma. Entender essas diferenças ajuda a escolher a opção mais prática para uso frequente em quadra.',
        web: {
          title: 'Versão web',
          body: 'A versão web abre instantaneamente em navegador compatível, sem instalação prévia. É ideal para teste rápido, uso eventual ou aparelhos compartilhados. Você pode começar a marcar pontos em segundos a partir de uma URL.'
        },
        pwa: {
          title: 'Experiência PWA',
          body: 'Como PWA, o Padel Buddy pode ser instalado na tela inicial e aberto em modo mais próximo de app independente. Isso reduz distrações do navegador e acelera o acesso antes da partida. Também fortalece o comportamento offline em quadras com internet instável.'
        },
        install: {
          title: 'Como instalar a PWA',
          body: 'No iOS Safari, abra o menu Compartilhar e selecione Adicionar à Tela de Início. No Android Chrome e navegadores compatíveis, use Instalar app ou Adicionar à Tela de Início. Depois de instalada, abra pelo ícone como qualquer aplicativo comum.'
        },
        offline: {
          title: 'Uso offline',
          body: 'Sessões com PWA instalada podem continuar funcionando durante partidas mesmo sem internet disponível. Isso é valioso em quadras com sinal móvel fraco ou Wi-Fi limitado. A prontidão offline ajuda a manter o placar sem interrupções.'
        },
        nativeApps: {
          title: 'Apps móveis nativos',
          body: 'Também existem versões nativas na Google Play e na App Store para quem prefere instalação e atualização via loja. Elas oferecem fluxo familiar de distribuição para uso móvel dedicado. Atualmente, essas versões são posicionadas como sem anúncios.'
        },
        androidProtection: {
          title: 'Proteção Android de licença/origem da loja',
          body: 'Algumas distribuições nativas Android incluem validação de licença ou origem, exigindo instalação pela Google Play. Isso ajuda a garantir que o app venha de fonte autorizada. Se a validação falhar, a recomendação é reinstalar pela Google Play.'
        },
        adsDifference: {
          title: 'Diferença de anúncios por plataforma',
          body: 'O comportamento de anúncios pode variar por plataforma: web/PWA pode incluir anúncios, enquanto apps nativos de loja são posicionados sem anúncios. Essa distinção ajuda a escolher o canal que melhor combina com sua preferência. Se prioridade for experiência sem anúncios, a recomendação é usar a versão de loja.'
        }
      },
      smallDetails: {
        title: 'Pequenos detalhes, grande impacto',
        body: 'Esses comportamentos menores costumam ter grande impacto prático durante partidas reais. Eles reduzem atrito, evitam erros comuns e aumentam a confiança ao marcar sob pressão. Conhecê-los antes de jogar ajuda a extrair mais valor do app desde o primeiro uso.',
        servingCard: {
          title: 'Destaque do card de saque',
          body: 'O card do time sacador muda visualmente para deixar o contexto de serviço evidente de imediato. Isso ajuda a evitar dúvidas sobre quem deve sacar na sequência. É especialmente útil em transições rápidas entre games.'
        },
        sideSwitchTimeout: {
          title: 'Tempo limite para troca de lado',
          body: 'Avisos de troca de lado desaparecem automaticamente após cerca de 10 segundos para não bloquear o jogo além do necessário. O lembrete continua claro, mas a interface volta rápido ao placar. Isso mantém fluidez durante a partida.'
        },
        landscapeOnly: {
          title: 'Placar ao vivo prioriza paisagem',
          body: 'O placar ao vivo prioriza paisagem e bloqueia retrato em celulares de forma intencional. Em paisagem, os controles ficam maiores e a leitura do placar melhora à distância. Essa decisão aumenta precisão de toque e legibilidade em quadra.'
        },
        resumeMatch: {
          title: 'Retomar partidas interrompidas',
          body: 'Sessões interrompidas podem ser retomadas a partir do estado salvo, em vez de recomeçar do zero. Isso protege a integridade da partida quando ocorre interrupção inesperada. É um dos recursos de confiabilidade mais importantes no uso real.'
        },
        finishEarly: {
          title: 'Finalizar manualmente quando necessário',
          body: 'Você pode encerrar manualmente antes do fim oficial quando necessário, como por limite de horário da quadra ou lesão. O app preserva o estado alcançado e estatísticas disponíveis. Isso reflete melhor condições reais de jogo.'
        },
        continueAfterFinish: {
          title: 'Continuar após finalizar',
          body: 'Após o fechamento oficial, é possível continuar pontuando para games extras informais sem reiniciar. Isso atende sessões casuais estendidas mantendo contexto atual. O resultado oficial e a extensão opcional ficam claramente separados.'
        },
        deviceVoices: {
          title: 'As vozes vêm do dispositivo',
          body: 'As vozes de anúncio vêm do sistema operacional e do navegador, não de uma lista fixa interna do app. Por isso, nomes e qualidade podem variar entre aparelhos. Revisar as opções antes de começar ajuda a escolher uma voz mais clara.'
        },
        advancedSpeech: {
          title: 'Estados falados avançados',
          body: 'A fala pode incluir estados avançados como deuce, Golden Point, vantagem, set point e match point. Esses avisos dão mais contexto do que apenas números de pontos. Assim, jogadores entendem momentos de pressão sem olhar para a tela.'
        },
        undoRestoresState: {
          title: 'Desfazer restaura o estado real',
          body: 'Desfazer rebobina a linha do tempo real da partida, incluindo estados dependentes como progressão de games e ordem de saque. Não é apenas uma redução visual do número exibido. Isso mantém as correções válidas pelas regras.'
        },
        historyLimit: {
          title: 'Limite de retenção do histórico',
          body: 'O histórico mantém apenas as 100 partidas finalizadas mais recentes para preservar desempenho e armazenamento. Registros mais antigos saem automaticamente quando entram novos. Isso mantém o arquivo leve em dispositivos móveis.'
        },
        shareLater: {
          title: 'Compartilhe agora ou depois',
          body: 'Cards de resultado podem ser compartilhados no fim da partida ou gerados depois pelo histórico. Isso é útil quando o grupo precisa sair da quadra rapidamente. A possibilidade de compartilhar não se perde se você pular essa etapa na hora.'
        },
        offlineUse: {
          title: 'Sessões prontas para offline',
          body: 'A PWA instalada foi pensada para manter o placar utilizável sem internet estável durante a sessão. Isso é essencial em quadras com cobertura irregular. O modo offline reduz risco de interrupções na marcação.'
        },
        rememberedPreferences: {
          title: 'Preferências de configuração lembradas',
          body: 'O Padel Buddy pode lembrar nomes dos times e opções principais de configuração para acelerar partidas futuras. Isso evita repetir a mesma preparação toda vez. Começar mais rápido significa mais tempo efetivo de jogo.'
        },
        spotlightDiscovery: {
          title: 'Destaque para descoberta da ajuda',
          body: 'Um destaque de primeira visita aponta onde está a ajuda para facilitar descoberta logo no início. Depois de visto uma vez, ele deixa de aparecer para não incomodar usuários recorrentes. Assim, melhora onboarding sem adicionar ruído constante.'
        }
      },
      media: {
        hero: {
          title: 'Imagem hero de uso em quadra',
          description:
            'Celular próximo ao banco da quadra com placar ao vivo visível e controle remoto opcional por perto.',
          captureHint:
            'Tire uma foto real em quadra com a tela de partida ao vivo aberta em paisagem.',
          caption: 'Marque o placar sem sair do jogo.'
        },
        mainFlow: {
          title: 'Visual do fluxo principal do app',
          description:
            'Sequência simples em 3 etapas: Configuração → Partida ao vivo → Fim da partida / Histórico.',
          captureHint: 'Use uma ilustração limpa ou colagem com telas reais.',
          caption: 'Da configuração ao resumo em um fluxo simples.'
        },
        setupOverview: {
          title: 'Visão geral da tela de configuração',
          description:
            'Tela completa de configuração destacando regras, equipes, histórico e ação de iniciar.',
          captureHint:
            'Capture a configuração com áudio habilitado para exibir os controles de voz.',
          caption: 'Tudo o que você precisa antes do primeiro ponto.'
        },
        remoteConfig: {
          title: 'Modal de configuração do controle remoto',
          description:
            'Mostra campos de mapeamento de teclas e controles de limpar/redefinir/salvar.',
          captureHint: 'Abra o modal remoto na configuração e capture com os vínculos preenchidos.',
          caption: 'Configure os controles de pontuação para seu dispositivo remoto.'
        },
        voiceSelection: {
          title: 'Modal de seleção de voz',
          description: 'Lista de vozes agrupadas por idioma com ações de prévia/aceitar.',
          captureHint: 'Abra a seleção de voz com anúncios por áudio habilitados.',
          caption: 'Escolha a voz que melhor combina com sua partida.'
        },
        liveMatch: {
          title: 'Tela de partida ao vivo em paisagem',
          description:
            'Cards de placar, cronômetro, destaque do saque, desfazer e ação de finalizar visíveis.',
          captureHint: 'Use um estado realista de meio de jogo (por exemplo, 40–30).',
          caption: 'Controles grandes, pontuação clara e contexto ao vivo de relance.'
        },
        sideSwitch: {
          title: 'Modal de aviso de troca de lado',
          description: 'Modal lembrando os jogadores de trocar de lado com ação de confirmação.',
          captureHint: 'Ative os avisos de troca de lado e capture antes do auto-ocultamento.',
          caption: 'O app lembra os jogadores quando é hora de trocar de lado.'
        },
        rotateBlocker: {
          title: 'Bloqueio de rotação em retrato',
          description: 'Bloqueio em retrato no celular pedindo rotação para paisagem.',
          captureHint: 'Abra uma partida ao vivo em um viewport de celular em retrato.',
          caption: 'A tela de placar ao vivo é otimizada para uso em paisagem.'
        },
        matchEnd: {
          title: 'Tela de resumo de fim de partida',
          description: 'Card do vencedor, resumo de sets, estatísticas e botões de ação.',
          captureHint: 'Finalize uma partida e capture o estado completo do resumo.',
          caption: 'Revise o resultado, compartilhe ou continue jogando.'
        },
        shareImage: {
          title: 'Imagem gerada para compartilhamento',
          description: 'Card exportável da partida com vencedor, placares, data e duração.',
          captureHint: 'Use a ação de compartilhar e capture o artefato gerado.',
          caption: 'Uma imagem de resultado pronta para compartilhar.'
        },
        historyList: {
          title: 'Lista de histórico com registros',
          description: 'Múltiplas entradas com destaque do vencedor e ações.',
          captureHint: 'Preencha várias partidas e abra a lista de histórico.',
          caption: 'Partidas recentes continuam fáceis de revisar, compartilhar e repetir.'
        },
        historyEmpty: {
          title: 'Estado vazio do histórico',
          description: 'Mensagem amigável quando não há partidas finalizadas.',
          captureHint: 'Limpe os registros do histórico e capture a visualização vazia.',
          caption: 'Ainda não há partidas finalizadas.'
        },
        resumeDialog: {
          title: 'Diálogo para retomar partida salva',
          description: 'Prompt de inicialização oferecendo retomar ou descartar.',
          captureHint: 'Interrompa uma partida ao vivo e reabra o app para acionar o prompt.',
          caption: 'Você pode continuar com segurança de onde parou.'
        },
        helpSpotlight: {
          title: 'Destaque de ajuda na barra superior',
          description: 'Destaque de primeira visita apontando o usuário para a ação de ajuda.',
          captureHint:
            'Use um perfil novo onde o destaque de ajuda ainda não tenha sido marcado como visto.',
          caption: 'Novos usuários são guiados para a área de ajuda.'
        },
        platformComparison: {
          title: 'Comparação Web vs PWA vs Nativo',
          description:
            'Card comparativo sobre instalação, suporte offline, lojas e diferenças de anúncios.',
          captureHint: 'Crie um visual comparativo alinhado ao comportamento atual do produto.',
          caption: 'Use o Padel Buddy no formato que melhor se adapta a você.'
        }
      }
    }
  },
  privacy: {
    page: {
      meta: {
        title: 'Privacidade do Padel Buddy',
        description:
          'Entenda de forma simples como o Padel Buddy guarda dados da partida no seu dispositivo e quais dados técnicos limitados podem ser usados por serviços de apoio.'
      },
      hero: {
        eyebrow: 'Privacidade',
        title: 'Os dados da sua partida ficam perto de você',
        body: 'O Padel Buddy foi criado para manter sua marcação simples e privada. Itens como nomes dos times, placar ao vivo, histórico de partidas finalizadas e várias configurações ficam salvos no seu dispositivo ou navegador para que o app continue funcionando bem, inclusive offline.'
      },
      localStorage: {
        title: 'O que fica no seu dispositivo',
        body: 'O app salva informações da partida localmente para que você possa retomar uma partida interrompida, revisar o histórico e deixar sua configuração preferida pronta para a próxima vez. Isso inclui nomes dos times, andamento do placar, resumos de partidas finalizadas e ajustes feitos no seu dispositivo. No uso normal, esses dados da partida não são enviados para um servidor dedicado de partidas do Padel Buddy.'
      },
      noAccount: {
        title: 'Não é necessário ter conta',
        body: 'Você não precisa criar uma conta para usar o Padel Buddy. É só abrir o app e começar a marcar, sem login, sem perfil de jogador e sem registro de partidas em nuvem. Para a maioria das pessoas, isso significa que a experiência principal de pontuação continua no próprio dispositivo em uso.'
      },
      limitedServices: {
        title: 'Serviços de apoio limitados',
        body: 'Alguns dados técnicos limitados ainda podem ser usados por serviços de apoio, dependendo da plataforma e da build do app. Por exemplo, as builds de produção usam ferramentas de analytics, e algumas versões do app podem fazer verificações de licença ou de instalação. Esses serviços são separados do seu histórico local de partidas e não servem para publicar nem compartilhar automaticamente seus placares com outros jogadores.'
      },
      control: {
        title: 'Seu controle sobre os dados locais',
        body: 'Como os dados principais da partida ficam salvos localmente, eles normalmente permanecem sob controle de quem usa o dispositivo. Limpar o armazenamento do navegador ou do app, desinstalar o app ou usar ajustes de privacidade do aparelho pode remover essas informações. Se o dispositivo for compartilhado, lembre-se de que o histórico e as preferências salvas podem continuar visíveis nele até serem apagados.'
      }
    }
  }
} as const;
