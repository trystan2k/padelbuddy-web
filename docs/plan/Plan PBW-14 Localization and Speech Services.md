# Implementation Plan: PBW-14 Localization and Speech Services

## Task Analysis

- **Main objective**: Implement i18n (react-i18next) for UI translations and a speech service for voice announcements during match play.
- **Identified dependencies**:
  - PBW-8: App Foundation and Project Bootstrap (COMPLETED ✅)
- **System impact**: New `src/lib/i18n/` module for localization, new `src/lib/speech/` module for voice services, updates to existing components (AppShell, NotFoundPage, CurrentMatchStartupGate), IndexedDB for preference persistence.

---

## Understanding Summary

- **What is being built**: A localization system supporting English, Portuguese, and Spanish with browser language detection, plus a speech synthesis service for announcing match events with configurable verbosity and mute control.
- **Why it exists**: Padel Buddy serves international players (English, Portuguese, Spanish speakers) and courtside users benefit from hands-free voice announcements for score tracking.
- **Who it is for**: Recreational and semi-competitive padel players, coaches, referees, and spectators tracking scores courtside.
- **Key constraints**:
  - Client-only architecture (no server-side rendering for i18n)
  - Browser language detection with fallback to default locale
  - Speech must handle rapid score changes by canceling queued utterances
  - Verbosity levels: Minimal, Standard, Verbose
  - Voice fallback chain: selected locale → English → graceful mute
- **Explicit non-goals**:
  - Server-side rendering for SEO
  - Setup screen language switcher (will be added later)
  - Multi-device sync of preferences
  - Speech recognition (only synthesis)

---

## Assumptions

1. react-i18next works correctly with TanStack Start's client-only mode
2. Browser Speech Synthesis API is sufficiently supported across target browsers (Chrome, Safari, Firefox on mobile)
3. IndexedDB pattern from `src/lib/current-match/` can be reused for preference persistence
4. Speech content generation will integrate with existing match types from `src/core/match/`
5. Locale preference is a single value (no region-specific variants like `pt-BR` vs `pt-PT` in v1)
6. Speech verbosity preference persists across sessions alongside locale preference

---

## Chosen Approach

### Proposed Solution

Create two independent but complementary modules:

1. **Localization Module (`src/lib/i18n/`)**:
   - react-i18next configuration for client-only TanStack Start
   - Browser language detection with fallback chain
   - IndexedDB persistence for locale preference
   - Translation files for `en`, `pt`, `es`

2. **Speech Module (`src/lib/speech/`)**:
   - Speech synthesis service using Web Speech API
   - Verbosity levels: Minimal, Standard, Verbose
   - Mute control with persistence
   - Voice fallback chain: selected locale → English → mute
   - Utterance queue with cancellation for rapid score changes
   - Message generation from match state types

### Justification for Simplicity

- **Minimal complexity**: Two separate modules with clear boundaries
- **No overengineering**: Uses browser-native Speech Synthesis API (no external TTS services)
- **Existing patterns**: Follows `src/lib/current-match/` architecture for persistence
- **Composability**: Speech service depends on i18n for message templates but operates independently
- **Graceful degradation**: Speech falls back to mute when no suitable voice is available

### Components to be Modified/Created

| File                                             | Action | Purpose                                        |
| ------------------------------------------------ | ------ | ---------------------------------------------- |
| `src/lib/i18n/i18n.ts`                           | CREATE | react-i18next configuration and initialization |
| `src/lib/i18n/locale-detector.ts`                | CREATE | Browser language detection logic               |
| `src/lib/i18n/locale-storage.ts`                 | CREATE | IndexedDB persistence for locale preference    |
| `src/lib/i18n/types.ts`                          | CREATE | Type definitions for locale and i18n           |
| `src/lib/i18n/index.ts`                          | CREATE | Public exports                                 |
| `src/lib/i18n/locales/en.json`                   | CREATE | English translations                           |
| `src/lib/i18n/locales/pt.json`                   | CREATE | Portuguese translations                        |
| `src/lib/i18n/locales/es.json`                   | CREATE | Spanish translations                           |
| `src/lib/speech/speech-service.ts`               | CREATE | Speech synthesis service                       |
| `src/lib/speech/voice-selector.ts`               | CREATE | Voice selection with fallback chain            |
| `src/lib/speech/message-generator.ts`            | CREATE | Generate speech messages from match state      |
| `src/lib/speech/types.ts`                        | CREATE | Speech-related type definitions                |
| `src/lib/speech/index.ts`                        | CREATE | Public exports                                 |
| `src/lib/speech/speech-storage.ts`               | CREATE | Persistence for speech preferences             |
| `src/routes/__root.tsx`                          | MODIFY | Add i18n provider wrapper                      |
| `src/components/AppShell/AppShell.tsx`           | MODIFY | Replace hardcoded strings with translations    |
| `src/components/NotFoundPage/NotFoundPage.tsx`   | MODIFY | Replace hardcoded strings with translations    |
| `src/components/CurrentMatchStartupGate/...tsx`  | MODIFY | Replace hardcoded strings with translations    |
| `test/lib/i18n/locale-detector.test.ts`          | CREATE | Browser detection tests                        |
| `test/lib/i18n/locale-storage.test.ts`           | CREATE | Persistence tests                              |
| `test/lib/i18n/i18n.test.ts`                     | CREATE | i18n integration tests                         |
| `test/lib/speech/speech-service.test.ts`         | CREATE | Speech service tests                           |
| `test/lib/speech/voice-selector.test.ts`         | CREATE | Voice fallback tests                           |
| `test/lib/speech/message-generator.test.ts`      | CREATE | Message generation tests                       |
| `test/lib/speech/utterance-cancellation.test.ts` | CREATE | Rapid score change cancellation tests          |

---

## Implementation Steps

### Step 1: Install Dependencies

**Purpose**: Add react-i18next and required types

**Implementation**:

```bash
pnpm add react-i18next i18next i18next-browser-languagedetector i18next-http-backend
```

**Validation**:

- Dependencies installed successfully
- No peer dependency conflicts

### Step 2: Create i18n Type Definitions (`src/lib/i18n/types.ts`)

**Purpose**: Define TypeScript types for localization

**Implementation**:

```typescript
// Supported locales
export const supportedLocales = ['en', 'pt', 'es'] as const;
export type SupportedLocale = (typeof supportedLocales)[number];

// Default locale for fallback
export const defaultLocale: SupportedLocale = 'en';

// Locale preference stored in IndexedDB
export interface LocalePreference {
  locale: SupportedLocale;
  updatedAt: string; // ISO timestamp
}

// i18n configuration options
export interface I18nConfig {
  fallbackLng: SupportedLocale;
  supportedLngs: SupportedLocale[];
  detection: {
    order: ('localStorage' | 'navigator')[];
    caches: 'localStorage'[];
    lookupLocalStorage: string;
  };
}
```

**Validation**:

- Types compile without errors
- All supported locales are typed

### Step 3: Create Locale Storage (`src/lib/i18n/locale-storage.ts`)

**Purpose**: Persist locale preference in IndexedDB following existing patterns

**Implementation**:

- Create `createLocaleStorage()` factory function
- Use separate IndexedDB database or shared database with separate object store
- Follow pattern from `src/lib/current-match/indexed-db.ts`
- Methods:
  - `saveLocalePreference(locale: SupportedLocale): Promise<void>`
  - `loadLocalePreference(): Promise<SupportedLocale | null>`
  - `clearLocalePreference(): Promise<void>`

**Key Design Decisions**:

- Use same database name (`padel-buddy-web`) with new object store `locale-preference`
- Increment database version to 2
- Store full `LocalePreference` object for future extensibility

**Validation**:

- Unit tests for save/load/clear operations
- Test persistence across simulated sessions

### Step 4: Create Locale Detector (`src/lib/i18n/locale-detector.ts`)

**Purpose**: Detect browser language and map to supported locale

**Implementation**:

```typescript
export function detectBrowserLocale(): SupportedLocale | null {
  const browserLang = navigator.language; // e.g., 'en-US', 'pt-BR', 'es-ES'
  const primaryLang = browserLang.split('-')[0].toLowerCase();

  if (supportedLocales.includes(primaryLang as SupportedLocale)) {
    return primaryLang as SupportedLocale;
  }

  return null;
}

export function resolveInitialLocale(
  storedPreference: SupportedLocale | null,
  browserDetected: SupportedLocale | null
): SupportedLocale {
  // Priority: stored preference > browser detection > default
  return storedPreference ?? browserDetected ?? defaultLocale;
}
```

**Validation**:

- Unit tests for browser language parsing
- Test fallback chain: stored → browser → default
- Test unsupported browser language fallback to default

### Step 5: Create i18n Configuration (`src/lib/i18n/i18n.ts`)

**Purpose**: Configure react-i18next for client-only TanStack Start

**Implementation**:

```typescript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpBackend from 'i18next-http-backend';

import { defaultLocale, supportedLocales, type SupportedLocale } from './types';
import { loadLocalePreference, saveLocalePreference } from './locale-storage';
import { detectBrowserLocale, resolveInitialLocale } from './locale-detector';

export async function initializeI18n(): Promise<void> {
  const storedPreference = await loadLocalePreference();
  const browserLocale = detectBrowserLocale();
  const initialLocale = resolveInitialLocale(storedPreference, browserLocale);

  await i18n
    .use(HttpBackend)
    .use(initReactI18next)
    .init({
      lng: initialLocale,
      fallbackLng: defaultLocale,
      supportedLngs: supportedLocales,
      interpolation: {
        escapeValue: false
      },
      backend: {
        loadPath: '/locales/{{lng}}.json'
      }
    });
}

export function changeLocale(locale: SupportedLocale): Promise<void> {
  await saveLocalePreference(locale);
  await i18n.changeLanguage(locale);
}

export { i18n };
```

**Validation**:

- i18n initializes successfully
- Locale files load correctly
- Language changes work

### Step 6: Create Translation Files

**Purpose**: Provide translations for all current UI strings

**File: `src/lib/i18n/locales/en.json`**

```json
{
  "app": {
    "title": "Padel Buddy",
    "description": "A deliberately styled starter shell for the live score tracker."
  },
  "appShell": {
    "eyebrow": "App foundation",
    "lead": "A deliberately styled starter shell for the live score tracker, set up to carry future match flows without feeling like placeholder scaffolding.",
    "statusPills": {
      "clientOnly": "Client-only",
      "mobileReady": "Mobile-ready",
      "accessibleBaseline": "Accessible baseline"
    },
    "foundation": {
      "sectionLabel": "Styling foundation",
      "sectionTitle": "Bootstrap status",
      "sectionText": "The shell now establishes shared global styles, component-scoped styling, and a responsive presentation layer that works cleanly on desktop and on-court mobile screens."
    },
    "foundationItems": {
      "tanstackShell": {
        "title": "TanStack Start shell",
        "detail": "Route generation and the client-only bootstrap are already carrying the app frame."
      },
      "designTokens": {
        "title": "Shared design tokens",
        "detail": "Global variables now define the spacing, color, typography, and focus baseline for future UI work."
      },
      "scopedStyling": {
        "title": "Scoped component styling",
        "detail": "CSS Modules keep shell presentation isolated while the app grows into new screens and controls."
      }
    },
    "baseUiCheck": {
      "trigger": "Open Base UI check",
      "eyebrow": "Interaction baseline",
      "title": "Base UI is wired",
      "description": "This dialog confirms the starter shell can render accessible, styled primitives inside the TanStack Start route.",
      "close": "Close panel"
    }
  },
  "notFound": {
    "eyebrow": "Page not found",
    "title": "We could not find that route.",
    "description": "The app foundation is running, but this page does not exist in the current route tree.",
    "backLink": "Go back to the home screen"
  },
  "startupGate": {
    "loading": {
      "eyebrow": "Startup check",
      "title": "Checking for a saved match",
      "body": "Padel Buddy is restoring the current-match workspace before opening the shell."
    },
    "corrupt": {
      "eyebrow": "Startup recovery",
      "title": "Saved match needs recovery",
      "body": "The current-match record could not be restored safely. Reset the saved match to continue into the app shell.",
      "resetButton": "Reset and continue"
    },
    "notice": {
      "title": "Saved match was reset",
      "body": "An older saved match was cleared because it no longer matches the current app schema.",
      "dismiss": "Dismiss"
    },
    "resume": {
      "eyebrow": "Saved match found",
      "title": "Resume saved match?",
      "body": "Padel Buddy restored an in-progress current match. Resume keeps the action log and restores the live score state through replay.",
      "resumeButton": "Resume saved match",
      "discardButton": "Discard saved match"
    }
  },
  "speech": {
    "verbosity": {
      "minimal": "Minimal",
      "standard": "Standard",
      "verbose": "Verbose"
    }
  },
  "score": {
    "points": {
      "0": "Love",
      "15": "Fifteen",
      "30": "Thirty",
      "40": "Forty",
      "ad": "Advantage"
    },
    "announcements": {
      "game": "Game",
      "set": "Set",
      "match": "Match",
      "serving": "Serving"
    }
  }
}
```

**File: `src/lib/i18n/locales/pt.json`**

```json
{
  "app": {
    "title": "Padel Buddy",
    "description": "Uma base estilizada para o rastreador de pontuação ao vivo."
  },
  "appShell": {
    "eyebrow": "Base do aplicativo",
    "lead": "Uma base estilizada para o rastreador de pontuação ao vivo, configurada para suportar futuros fluxos de partida sem parecer um scaffolding provisório.",
    "statusPills": {
      "clientOnly": "Somente cliente",
      "mobileReady": "Pronto para mobile",
      "accessibleBaseline": "Base acessível"
    },
    "foundation": {
      "sectionLabel": "Base de estilo",
      "sectionTitle": "Status de inicialização",
      "sectionText": "A base agora estabelece estilos globais compartilhados, estilo com escopo de componente e uma camada de apresentação responsiva que funciona claramente em desktop e telas móveis em quadra."
    },
    "foundationItems": {
      "tanstackShell": {
        "title": "Shell TanStack Start",
        "detail": "A geração de rotas e a inicialização somente cliente já estão carregando a estrutura do aplicativo."
      },
      "designTokens": {
        "title": "Tokens de design compartilhados",
        "detail": "Variáveis globais agora definem o espaçamento, cores, tipografia e linha de base de foco para futuros trabalhos de UI."
      },
      "scopedStyling": {
        "title": "Estilo de componente com escopo",
        "detail": "CSS Modules mantêm a apresentação do shell isolada enquanto o aplicativo cresce em novas telas e controles."
      }
    },
    "baseUiCheck": {
      "trigger": "Verificar Base UI",
      "eyebrow": "Base de interação",
      "title": "Base UI conectado",
      "description": "Este diálogo confirma que a base pode renderizar primitivos acessíveis e estilizados dentro da rota TanStack Start.",
      "close": "Fechar painel"
    }
  },
  "notFound": {
    "eyebrow": "Página não encontrada",
    "title": "Não foi possível encontrar essa rota.",
    "description": "A base do aplicativo está funcionando, mas esta página não existe na árvore de rotas atual.",
    "backLink": "Voltar para a tela inicial"
  },
  "startupGate": {
    "loading": {
      "eyebrow": "Verificação de inicialização",
      "title": "Verificando partida salva",
      "body": "Padel Buddy está restaurando o espaço de trabalho da partida atual antes de abrir o shell."
    },
    "corrupt": {
      "eyebrow": "Recuperação de inicialização",
      "title": "Partida salva precisa de recuperação",
      "body": "O registro da partida atual não pôde ser restaurado com segurança. Reinicie a partida salva para continuar no shell do aplicativo.",
      "resetButton": "Reiniciar e continuar"
    },
    "notice": {
      "title": "Partida salva foi reiniciada",
      "body": "Uma partida salva mais antiga foi limpa porque não corresponde mais ao esquema atual do aplicativo.",
      "dismiss": "Dispensar"
    },
    "resume": {
      "eyebrow": "Partida salva encontrada",
      "title": "Retomar partida salva?",
      "body": "Padel Buddy restaurou uma partida atual em andamento. Retomar mantém o registro de ações e restaura o estado da pontuação ao vivo através de replay.",
      "resumeButton": "Retomar partida salva",
      "discardButton": "Descartar partida salva"
    }
  },
  "speech": {
    "verbosity": {
      "minimal": "Mínimo",
      "standard": "Padrão",
      "verbose": "Detalhado"
    }
  },
  "score": {
    "points": {
      "0": "Zero",
      "15": "Quinze",
      "30": "Trinta",
      "40": "Quarenta",
      "Ad": "Vantagem"
    },
    "announcements": {
      "game": "Jogo",
      "set": "Set",
      "match": "Partida",
      "serving": "Sacando"
    }
  }
}
```

**File: `src/lib/i18n/locales/es.json`**

```json
{
  "app": {
    "title": "Padel Buddy",
    "description": "Una base estilizada para el rastreador de puntuación en vivo."
  },
  "appShell": {
    "eyebrow": "Base de la aplicación",
    "lead": "Una base estilizada para el rastreador de puntuación en vivo, configurada para soportar futuros flujos de partidos sin parecer un andamiaje provisional.",
    "statusPills": {
      "clientOnly": "Solo cliente",
      "mobileReady": "Listo para móvil",
      "accessibleBaseline": "Base accesible"
    },
    "foundation": {
      "sectionLabel": "Base de estilo",
      "sectionTitle": "Estado de inicialización",
      "sectionText": "La base ahora establece estilos globales compartidos, estilo con alcance de componente y una capa de presentación responsiva que funciona claramente en escritorio y pantallas móviles en cancha."
    },
    "foundationItems": {
      "tanstackShell": {
        "title": "Shell TanStack Start",
        "detail": "La generación de rutas y la inicialización solo cliente ya están cargando la estructura de la aplicación."
      },
      "designTokens": {
        "title": "Tokens de diseño compartidos",
        "detail": "Las variables globales ahora definen el espaciado, colores, tipografía y línea base de enfoque para futuros trabajos de UI."
      },
      "scopedStyling": {
        "title": "Estilo de componente con alcance",
        "detail": "CSS Modules mantienen la presentación del shell aislada mientras la aplicación crece en nuevas pantallas y controles."
      }
    },
    "baseUiCheck": {
      "trigger": "Verificar Base UI",
      "eyebrow": "Base de interacción",
      "title": "Base UI conectado",
      "description": "Este diálogo confirma que la base puede renderizar primitivas accesibles y estilizadas dentro de la ruta TanStack Start.",
      "close": "Cerrar panel"
    }
  },
  "notFound": {
    "eyebrow": "Página no encontrada",
    "title": "No pudimos encontrar esa ruta.",
    "description": "La base de la aplicación está funcionando, pero esta página no existe en el árbol de rutas actual.",
    "backLink": "Volver a la pantalla de inicio"
  },
  "startupGate": {
    "loading": {
      "eyebrow": "Verificación de inicio",
      "title": "Buscando partido guardado",
      "body": "Padel Buddy está restaurando el espacio de trabajo del partido actual antes de abrir el shell."
    },
    "corrupt": {
      "eyebrow": "Recuperación de inicio",
      "title": "El partido guardado necesita recuperación",
      "body": "El registro del partido actual no pudo ser restaurado de forma segura. Reinicia el partido guardado para continuar en el shell de la aplicación.",
      "resetButton": "Reiniciar y continuar"
    },
    "notice": {
      "title": "El partido guardado fue reiniciado",
      "body": "Un partido guardado más antiguo fue eliminado porque ya no coincide con el esquema actual de la aplicación.",
      "dismiss": "Descartar"
    },
    "resume": {
      "eyebrow": "Partido guardado encontrado",
      "title": "¿Retomar partido guardado?",
      "body": "Padel Buddy restauró un partido actual en progreso. Retomar mantiene el registro de acciones y restaura el estado de puntuación en vivo a través de replay.",
      "resumeButton": "Retomar partido guardado",
      "discardButton": "Descartar partido guardado"
    }
  },
  "speech": {
    "verbosity": {
      "minimal": "Mínimo",
      "standard": "Estándar",
      "verbose": "Detallado"
    }
  },
  "score": {
    "points": {
      "0": "Cero",
      "15": "Quince",
      "30": "Treinta",
      "40": "Cuarenta",
      "Ad": "Ventaja"
    },
    "announcements": {
      "game": "Juego",
      "set": "Set",
      "match": "Partido",
      "serving": "Sacando"
    }
  }
}
```

**Validation**:

- JSON files are valid
- All keys present in all locale files
- Translations are accurate (native speaker review recommended)

### Step 7: Create Speech Type Definitions (`src/lib/speech/types.ts`)

**Purpose**: Define types for speech service

**Implementation**:

```typescript
export const verbosityLevels = ['minimal', 'standard', 'verbose'] as const;
export type VerbosityLevel = (typeof verbosityLevels)[number];

export const defaultVerbosity: VerbosityLevel = 'standard';

export interface SpeechPreferences {
  muted: boolean;
  verbosity: VerbosityLevel;
  updatedAt: string;
}

export interface SpeechServiceConfig {
  muted?: boolean;
  verbosity?: VerbosityLevel;
  onVoiceChange?: (voice: SpeechSynthesisVoice | null) => void;
  onError?: (error: Error) => void;
}

export interface SpeechService {
  speak(text: string, options?: SpeechOptions): void;
  cancel(): void;
  getMuted(): boolean;
  setMuted(muted: boolean): void;
  getVerbosity(): VerbosityLevel;
  setVerbosity(level: VerbosityLevel): void;
  getVoice(): SpeechSynthesisVoice | null;
  isSupported(): boolean;
}

export interface SpeechOptions {
  immediate?: boolean; // Skip queue, speak immediately
}

export type SpeechEventType =
  | 'point-scored'
  | 'game-won'
  | 'set-won'
  | 'match-won'
  | 'server-change';

export interface SpeechEventData {
  eventType: SpeechEventType;
  team1Score?: number | string;
  team2Score?: number | string;
  team1Name?: string;
  team2Name?: string;
  winningTeam?: 'team-1' | 'team-2';
  servingTeam?: 'team-1' | 'team-2';
  isTiebreak?: boolean;
  verbosity: VerbosityLevel;
}
```

**Validation**:

- Types compile without errors
- All speech event types covered

### Step 8: Create Speech Storage (`src/lib/speech/speech-storage.ts`)

**Purpose**: Persist speech preferences in IndexedDB

**Implementation**:

- Follow pattern from `src/lib/i18n/locale-storage.ts`
- Use same database (`padel-buddy-web`) with object store `speech-preference`
- Methods:
  - `saveSpeechPreferences(prefs: SpeechPreferences): Promise<void>`
  - `loadSpeechPreferences(): Promise<SpeechPreferences | null>`
  - `clearSpeechPreferences(): Promise<void>`

**Validation**:

- Unit tests for save/load/clear
- Test default values when no preferences stored

### Step 9: Create Voice Selector (`src/lib/speech/voice-selector.ts`)

**Purpose**: Select appropriate voice with fallback chain

**Implementation**:

```typescript
import { SupportedLocale, defaultLocale } from '@/lib/i18n/types';

export function selectVoice(
  locale: SupportedLocale,
  voices: SpeechSynthesisVoice[]
): SpeechSynthesisVoice | null {
  // Priority: locale voice > English voice > null (mute)

  // Try to find voice matching locale
  const localeVoice = voices.find((voice) =>
    voice.lang.toLowerCase().startsWith(locale.toLowerCase())
  );

  if (localeVoice) {
    return localeVoice;
  }

  // Fallback to English voice
  const englishVoice = voices.find((voice) => voice.lang.toLowerCase().startsWith('en'));

  return englishVoice ?? null;
}

export function getAvailableVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    const voices = speechSynthesis.getVoices();

    if (voices.length > 0) {
      resolve(voices);
      return;
    }

    // Voices might not be loaded yet
    speechSynthesis.onvoiceschanged = () => {
      resolve(speechSynthesis.getVoices());
    };
  });
}
```

**Validation**:

- Unit tests for voice selection logic
- Test fallback chain: locale → English → null
- Test with mock voice lists

### Step 10: Create Message Generator (`src/lib/speech/message-generator.ts`)

**Purpose**: Generate speech messages from match state events

**Implementation**:

```typescript
import { t } from 'react-i18next';
import type { VerbosityLevel, SpeechEventData } from './types';

export function generateSpeechMessage(data: SpeechEventData): string | null {
  const { eventType, verbosity } = data;

  switch (eventType) {
    case 'point-scored':
      return generatePointScoreMessage(data);
    case 'game-won':
      return generateGameWonMessage(data);
    case 'set-won':
      return generateSetWonMessage(data);
    case 'match-won':
      return generateMatchWonMessage(data);
    case 'server-change':
      return generateServerChangeMessage(data);
    default:
      return null;
  }
}

function generatePointScoreMessage(data: SpeechEventData): string {
  const { team1Score, team2Score, team1Name, team2Name, servingTeam, isTiebreak, verbosity } = data;

  if (verbosity === 'minimal') {
    return null; // No point-by-point in minimal mode
  }

  if (isTiebreak) {
    return `${team1Score}-${team2Score}`;
  }

  if (verbosity === 'standard') {
    return formatStandardScore(team1Score, team2Score);
  }

  // Verbose
  return formatVerboseScore(team1Score, team2Score, team1Name, team2Name, servingTeam);
}

function formatStandardScore(score1: number | string, score2: number | string): string {
  return `${score1}-${score2}`;
}

function formatVerboseScore(
  score1: number | string,
  score2: number | string,
  team1Name: string,
  team2Name: string,
  servingTeam: string
): string {
  const scoreWords = {
    '0': t('score.points.0'),
    '15': t('score.points.15'),
    '30': t('score.points.30'),
    '40': t('score.points.40'),
    Ad: t('score.points.Ad')
  };

  const word1 = scoreWords[String(score1)] ?? String(score1);
  const word2 = scoreWords[String(score2)] ?? String(score2);

  if (score1 === score2) {
    return `${word1} all`;
  }

  const serverName = servingTeam === 'team-1' ? team1Name : team2Name;
  return `${word1} ${word2.toLowerCase()}, ${t('score.announcements.serving')} ${serverName}`;
}

function generateGameWonMessage(data: SpeechEventData): string {
  const { winningTeam, team1Name, team2Name, verbosity } = data;
  const winnerName = winningTeam === 'team-1' ? team1Name : team2Name;

  if (verbosity === 'minimal') {
    return t('score.announcements.game');
  }

  return `${t('score.announcements.game')}, ${winnerName}`;
}

function generateSetWonMessage(data: SpeechEventData): string {
  const { winningTeam, team1Name, team2Name, verbosity } = data;
  const winnerName = winningTeam === 'team-1' ? team1Name : team2Name;

  if (verbosity === 'minimal') {
    return t('score.announcements.set');
  }

  return `${t('score.announcements.set')}, ${winnerName}`;
}

function generateMatchWonMessage(data: SpeechEventData): string {
  const { winningTeam, team1Name, team2Name, verbosity } = data;
  const winnerName = winningTeam === 'team-1' ? team1Name : team2Name;

  if (verbosity === 'minimal') {
    return t('score.announcements.match');
  }

  return `${t('score.announcements.match')}, ${winnerName}`;
}

function generateServerChangeMessage(data: SpeechEventData): string {
  const { servingTeam, team1Name, team2Name, verbosity } = data;

  if (verbosity === 'minimal') {
    return null; // No server change in minimal mode
  }

  const serverName = servingTeam === 'team-1' ? team1Name : team2Name;
  return `${t('score.announcements.serving')} ${serverName}`;
}
```

**Validation**:

- Unit tests for each event type
- Test all verbosity levels
- Test tiebreak vs standard scoring
- Test i18n integration for translated terms

### Step 11: Create Speech Service (`src/lib/speech/speech-service.ts`)

**Purpose**: Main speech synthesis service with queue management

**Implementation**:

```typescript
import { useEffect, useRef, useState, useCallback } from 'react';
import { i18n } from '@/lib/i18n/i18n';
import { selectVoice, getAvailableVoices } from './voice-selector';
import { generateSpeechMessage } from './message-generator';
import {
  loadSpeechPreferences,
  saveSpeechPreferences,
  defaultVerbosity,
  type SpeechPreferences,
  type SpeechServiceConfig,
  type SpeechEventData,
  type VerbosityLevel
} from './types';

export function useSpeechService(config: SpeechServiceConfig = {}): SpeechService {
  const [muted, setMutedState] = useState(config.muted ?? false);
  const [verbosity, setVerbosityState] = useState<VerbosityLevel>(
    config.verbosity ?? defaultVerbosity
  );
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null);
  const utteranceQueueRef = useRef<SpeechSynthesisUtterance[]>([]);
  const isSpeakingRef = useRef(false);

  // Initialize from storage and load voices
  useEffect(() => {
    let cancelled = false;

    async function initialize() {
      const prefs = await loadSpeechPreferences();

      if (cancelled) return;

      if (prefs) {
        setMutedState(prefs.muted);
        setVerbosityState(prefs.verbosity);
      }

      const voices = await getAvailableVoices();
      const currentLocale = i18n.language;
      const selectedVoice = selectVoice(currentLocale, voices);

      if (!cancelled) {
        setVoice(selectedVoice);
        config.onVoiceChange?.(selectedVoice);

        // Graceful mute if no voice available
        if (!selectedVoice) {
          setMutedState(true);
          config.onError?.(new Error('No suitable voice found'));
        }
      }
    }

    initialize();

    return () => {
      cancelled = true;
    };
  }, []);

  // Update voice when locale changes
  useEffect(() => {
    async function updateVoice() {
      const voices = await getAvailableVoices();
      const currentLocale = i18n.language;
      const selectedVoice = selectVoice(currentLocale, voices);
      setVoice(selectedVoice);
    }

    i18n.on('languageChanged', updateVoice);
    return () => {
      i18n.off('languageChanged', updateVoice);
    };
  }, []);

  const speak = useCallback(
    (text: string, options?: SpeechOptions) => {
      if (muted || !voice || !text) {
        return;
      }

      // Cancel any queued utterances (rapid score change handling)
      if (options?.immediate) {
        speechSynthesis.cancel();
        utteranceQueueRef.current = [];
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.voice = voice;
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      utterance.onend = () => {
        isSpeakingRef.current = false;
        processQueue();
      };

      utterance.onerror = (event) => {
        isSpeakingRef.current = false;
        config.onError?.(new Error(`Speech error: ${event.error}`));
        processQueue();
      };

      utteranceQueueRef.current.push(utterance);

      if (!isSpeakingRef.current) {
        processQueue();
      }
    },
    [muted, voice, config]
  );

  const processQueue = useCallback(() => {
    if (isSpeakingRef.current || utteranceQueueRef.current.length === 0) {
      return;
    }

    const utterance = utteranceQueueRef.current.shift();
    if (utterance) {
      isSpeakingRef.current = true;
      speechSynthesis.speak(utterance);
    }
  }, []);

  const cancel = useCallback(() => {
    speechSynthesis.cancel();
    utteranceQueueRef.current = [];
    isSpeakingRef.current = false;
  }, []);

  const setMuted = useCallback(
    async (newMuted: boolean) => {
      setMutedState(newMuted);
      await saveSpeechPreferences({
        muted: newMuted,
        verbosity,
        updatedAt: new Date().toISOString()
      });

      if (newMuted) {
        cancel();
      }
    },
    [verbosity, cancel]
  );

  const setVerbosity = useCallback(
    async (level: VerbosityLevel) => {
      setVerbosityState(level);
      await saveSpeechPreferences({
        muted,
        verbosity: level,
        updatedAt: new Date().toISOString()
      });
    },
    [muted]
  );

  const announce = useCallback(
    (eventData: Omit<SpeechEventData, 'verbosity'>) => {
      const message = generateSpeechMessage({
        ...eventData,
        verbosity
      });

      if (message) {
        speak(message, { immediate: true });
      }
    },
    [verbosity, speak]
  );

  return {
    speak,
    cancel,
    getMuted: () => muted,
    setMuted,
    getVerbosity: () => verbosity,
    setVerbosity,
    getVoice: () => voice,
    isSupported: () => typeof speechSynthesis !== 'undefined',
    announce
  };
}
```

**Validation**:

- Unit tests for speak/cancel behavior
- Test muted mode
- Test verbosity changes
- Test voice selection on locale change

### Step 12: Create Public Export Surfaces

**File: `src/lib/i18n/index.ts`**

```typescript
export { i18n, initializeI18n, changeLocale } from './i18n';
export { detectBrowserLocale, resolveInitialLocale } from './locale-detector';
export {
  createLocaleStorage,
  loadLocalePreference,
  saveLocalePreference,
  clearLocalePreference
} from './locale-storage';
export {
  supportedLocales,
  defaultLocale,
  type SupportedLocale,
  type LocalePreference,
  type I18nConfig
} from './types';
```

**File: `src/lib/speech/index.ts`**

```typescript
export { useSpeechService } from './speech-service';
export { selectVoice, getAvailableVoices } from './voice-selector';
export { generateSpeechMessage } from './message-generator';
export {
  loadSpeechPreferences,
  saveSpeechPreferences,
  clearSpeechPreferences
} from './speech-storage';
export {
  verbosityLevels,
  defaultVerbosity,
  type VerbosityLevel,
  type SpeechPreferences,
  type SpeechServiceConfig,
  type SpeechService,
  type SpeechOptions,
  type SpeechEventType,
  type SpeechEventData
} from './types';
```

### Step 13: Update Root Route for i18n Initialization

**File: `src/routes/__root.tsx`**

```typescript
import '@/styles.css'

import { createRootRoute, HeadContent, Outlet, Scripts } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { initializeI18n } from '@/lib/i18n'

import { NotFoundPage } from '@/components/NotFoundPage/NotFoundPage'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Padel Buddy' },
      { name: 'description', content: 'Client-only TanStack Start foundation for the Padel Buddy score tracker.' }
    ]
  }),
  component: RootDocument,
  notFoundComponent: NotFoundPage
})

function RootDocument() {
  const [i18nReady, setI18nReady] = useState(false)

  useEffect(() => {
    initializeI18n().then(() => setI18nReady(true))
  }, [])

  if (!i18nReady) {
    return (
      <html lang="en">
        <head>
          <HeadContent />
        </head>
        <body>
          <Scripts />
        </body>
      </html>
    )
  }

  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <Outlet />
        <Scripts />
      </body>
    </html>
  )
}
```

**Validation**:

- i18n initializes before app renders
- No flash of untranslated content

### Step 14: Update Components with Translations

**File: `src/components/AppShell/AppShell.tsx`** (modified)

Replace all hardcoded strings with `t()` calls:

```typescript
import { Dialog } from '@base-ui/react/dialog'
import { useTranslation } from 'react-i18next'

import styles from './AppShell.module.css'

export function AppShell() {
  const { t } = useTranslation()

  const foundationItems = [
    {
      title: t('appShell.foundationItems.tanstackShell.title'),
      detail: t('appShell.foundationItems.tanstackShell.detail')
    },
    {
      title: t('appShell.foundationItems.designTokens.title'),
      detail: t('appShell.foundationItems.designTokens.detail')
    },
    {
      title: t('appShell.foundationItems.scopedStyling.title'),
      detail: t('appShell.foundationItems.scopedStyling.detail')
    }
  ] as const

  const statusPills = [
    t('appShell.statusPills.clientOnly'),
    t('appShell.statusPills.mobileReady'),
    t('appShell.statusPills.accessibleBaseline')
  ] as const

  return (
    <main className={styles.page}>
      {/* ... rest of component with t() calls ... */}
    </main>
  )
}
```

**Similar updates for**:

- `src/components/NotFoundPage/NotFoundPage.tsx`
- `src/components/CurrentMatchStartupGate/CurrentMatchStartupGate.tsx`

**Validation**:

- All components render with translations
- Language switching updates UI immediately
- No missing translation keys

### Step 15: Add Unit Tests for i18n

**File: `test/lib/i18n/locale-detector.test.ts`**

```typescript
import { describe, it, expect, vi } from 'vitest';
import { detectBrowserLocale, resolveInitialLocale } from '@/lib/i18n/locale-detector';
import { defaultLocale, supportedLocales } from '@/lib/i18n/types';

describe('locale-detector', () => {
  describe('detectBrowserLocale', () => {
    it('returns locale for supported language', () => {
      vi.stubGlobal('navigator', { language: 'en-US' });
      expect(detectBrowserLocale()).toBe('en');

      vi.stubGlobal('navigator', { language: 'pt-BR' });
      expect(detectBrowserLocale()).toBe('pt');

      vi.stubGlobal('navigator', { language: 'es-ES' });
      expect(detectBrowserLocale()).toBe('es');
    });

    it('returns null for unsupported language', () => {
      vi.stubGlobal('navigator', { language: 'fr-FR' });
      expect(detectBrowserLocale()).toBeNull();

      vi.stubGlobal('navigator', { language: 'de-DE' });
      expect(detectBrowserLocale()).toBeNull();
    });

    it('handles lowercase language codes', () => {
      vi.stubGlobal('navigator', { language: 'EN-us' });
      expect(detectBrowserLocale()).toBe('en');
    });
  });

  describe('resolveInitialLocale', () => {
    it('prioritizes stored preference', () => {
      expect(resolveInitialLocale('pt', 'es')).toBe('pt');
    });

    it('falls back to browser detection when no stored preference', () => {
      expect(resolveInitialLocale(null, 'es')).toBe('es');
    });

    it('falls back to default when no preference or detection', () => {
      expect(resolveInitialLocale(null, null)).toBe(defaultLocale);
    });
  });
});
```

**File: `test/lib/i18n/locale-storage.test.ts`**

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { createLocaleStorage, type SupportedLocale } from '@/lib/i18n';

describe('locale-storage', () => {
  let storage: ReturnType<typeof createLocaleStorage>;

  beforeEach(() => {
    storage = createLocaleStorage({ databaseName: 'test-locale-db' });
  });

  it('saves and loads locale preference', async () => {
    await storage.saveLocalePreference('pt' as SupportedLocale);
    const loaded = await storage.loadLocalePreference();
    expect(loaded).toBe('pt');
  });

  it('returns null when no preference stored', async () => {
    const loaded = await storage.loadLocalePreference();
    expect(loaded).toBeNull();
  });

  it('clears locale preference', async () => {
    await storage.saveLocalePreference('es' as SupportedLocale);
    await storage.clearLocalePreference();
    const loaded = await storage.loadLocalePreference();
    expect(loaded).toBeNull();
  });
});
```

### Step 16: Add Unit Tests for Speech

**File: `test/lib/speech/voice-selector.test.ts`**

```typescript
import { describe, it, expect } from 'vitest';
import { selectVoice } from '@/lib/speech/voice-selector';

const mockVoices = [
  { lang: 'en-US', name: 'English US' },
  { lang: 'en-GB', name: 'English UK' },
  { lang: 'pt-BR', name: 'Portuguese Brazil' },
  { lang: 'es-ES', name: 'Spanish Spain' },
  { lang: 'fr-FR', name: 'French France' }
] as SpeechSynthesisVoice[];

describe('voice-selector', () => {
  it('selects voice matching locale', () => {
    expect(selectVoice('pt', mockVoices)?.lang).toBe('pt-BR');
    expect(selectVoice('es', mockVoices)?.lang).toBe('es-ES');
  });

  it('falls back to English voice when locale voice unavailable', () => {
    expect(selectVoice('fr', mockVoices)?.lang).toBe('en-US');
  });

  it('returns null when no suitable voice found', () => {
    expect(selectVoice('pt', [])).toBeNull();
  });
});
```

**File: `test/lib/speech/message-generator.test.ts`**

```typescript
import { describe, it, expect, beforeAll } from 'vitest';
import { generateSpeechMessage } from '@/lib/speech/message-generator';
import { initializeI18n } from '@/lib/i18n';

describe('message-generator', () => {
  beforeAll(async () => {
    await initializeI18n();
  });

  describe('point-scored', () => {
    it('returns null for minimal verbosity', () => {
      const message = generateSpeechMessage({
        eventType: 'point-scored',
        team1Score: '15',
        team2Score: '0',
        verbosity: 'minimal'
      });
      expect(message).toBeNull();
    });

    it('returns simple score for standard verbosity', () => {
      const message = generateSpeechMessage({
        eventType: 'point-scored',
        team1Score: '15',
        team2Score: '0',
        verbosity: 'standard'
      });
      expect(message).toBe('15-0');
    });

    it('returns detailed score for verbose mode', () => {
      const message = generateSpeechMessage({
        eventType: 'point-scored',
        team1Score: '15',
        team2Score: '0',
        team1Name: 'Team A',
        team2Name: 'Team B',
        servingTeam: 'team-1',
        verbosity: 'verbose'
      });
      expect(message).toContain('Fifteen');
      expect(message).toContain('love');
      expect(message).toContain('Team A');
    });
  });

  describe('game-won', () => {
    it('returns just "Game" for minimal verbosity', () => {
      const message = generateSpeechMessage({
        eventType: 'game-won',
        winningTeam: 'team-1',
        team1Name: 'Team A',
        team2Name: 'Team B',
        verbosity: 'minimal'
      });
      expect(message).toBe('Game');
    });

    it('includes team name for standard/verbose', () => {
      const message = generateSpeechMessage({
        eventType: 'game-won',
        winningTeam: 'team-1',
        team1Name: 'Team A',
        team2Name: 'Team B',
        verbosity: 'standard'
      });
      expect(message).toBe('Game, Team A');
    });
  });
});
```

**File: `test/lib/speech/utterance-cancellation.test.ts`**

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSpeechService } from '@/lib/speech/speech-service';

describe('utterance-cancellation', () => {
  beforeEach(() => {
    vi.stubGlobal('speechSynthesis', {
      speak: vi.fn(),
      cancel: vi.fn(),
      getVoices: () => [{ lang: 'en-US', name: 'English' }],
      onvoiceschanged: null
    });
  });

  it('cancels queued utterances on immediate speak', () => {
    const { result } = renderHook(() => useSpeechService());

    act(() => {
      result.current.speak('First message');
      result.current.speak('Second message', { immediate: true });
    });

    expect(speechSynthesis.cancel).toHaveBeenCalled();
  });

  it('cancel() clears all queued utterances', () => {
    const { result } = renderHook(() => useSpeechService());

    act(() => {
      result.current.speak('Message 1');
      result.current.speak('Message 2');
      result.current.cancel();
    });

    expect(speechSynthesis.cancel).toHaveBeenCalled();
  });
});
```

---

## Validation

### Success Criteria

1. **UI translations available**: UI translations are available for `en`, `pt`, and `es` across all v1 screens and controls - verified through manual testing and screenshot tests.
2. **Browser language detection**: First launch uses browser language detection with fallback to default - verified through unit tests.
3. **Locale persistence**: Locale preference persists across sessions - verified through storage tests.
4. **Speech mute and verbosity**: Speech supports mute on/off plus verbosity levels Minimal, Standard, Verbose defaulting to Standard - verified through unit tests.
5. **Voice fallback chain**: Speech uses fallback chain of selected locale voice → English voice → graceful mute - verified through voice selector tests.
6. **Rapid score cancellation**: Rapid score changes cancel queued utterances and speak only the latest - verified through cancellation tests.

### Checkpoints

| Step | Checkpoint                    | Verification Method                    |
| ---- | ----------------------------- | -------------------------------------- |
| 1    | Dependencies installed        | `pnpm install` succeeds                |
| 2    | Types defined                 | TypeScript compilation succeeds        |
| 3    | Locale storage created        | Unit tests pass                        |
| 4    | Locale detector created       | Unit tests pass for detection/fallback |
| 5    | i18n configuration created    | App initializes without errors         |
| 6    | Translation files created     | All keys present in all locales        |
| 7    | Speech types defined          | TypeScript compilation succeeds        |
| 8    | Speech storage created        | Unit tests pass                        |
| 9    | Voice selector created        | Fallback chain tests pass              |
| 10   | Message generator created     | All verbosity/event tests pass         |
| 11   | Speech service created        | Integration tests pass                 |
| 12   | Public exports ready          | All types/functions exported           |
| 13   | Root route updated            | i18n initializes on app load           |
| 14   | Components translated         | UI renders with translations           |
| 15   | i18n tests added              | `pnpm test` passes for i18n tests      |
| 16   | Speech tests added            | `pnpm test` passes for speech tests    |
| 17   | Coverage threshold maintained | 80% coverage for new code              |
| 18   | Complete check passes         | `pnpm complete-check` succeeds         |

### Manual Testing Checklist

1. **Language Detection**:
   - [ ] Clear locale preference, set browser to Portuguese, verify app loads in Portuguese
   - [ ] Clear locale preference, set browser to Spanish, verify app loads in Spanish
   - [ ] Clear locale preference, set browser to unsupported language (e.g., French), verify app loads in English

2. **Translations**:
   - [ ] All UI strings appear in selected language
   - [ ] No missing translation keys (check console for warnings)
   - [ ] AppShell, NotFoundPage, CurrentMatchStartupGate all translated

3. **Speech**:
   - [ ] Voice announcements work when mute is off
   - [ ] No speech when mute is on
   - [ ] Minimal verbosity only announces game/set/match
   - [ ] Standard verbosity announces scores and winners
   - [ ] Verbose mode includes serving information
   - [ ] Rapid score changes cancel previous announcements
   - [ ] Fallback to English voice when locale voice unavailable

---

## Decision Log

| Decision                                | Alternatives                          | Rationale                                                              |
| --------------------------------------- | ------------------------------------- | ---------------------------------------------------------------------- |
| react-i18next                           | next-intl, formatjs, custom solution  | Standard React integration, works with TanStack Start client-only mode |
| IndexedDB for locale persistence        | localStorage, cookies                 | Consistent with existing persistence pattern, more storage capacity    |
| Web Speech API                          | External TTS service, AWS Polly       | No API costs, works offline, browser native                            |
| Separate speech and i18n modules        | Combined module                       | Separation of concerns, easier testing, independent feature toggles    |
| Immediate cancellation for score events | Queue all events                      | Prevents announcement backlog during rapid play                        |
| Static verbosity levels                 | Configurable verbosity per event type | Simpler UX, covers common use cases                                    |
| Voice selection on locale change        | Manual voice selection                | Automatic, matches user's language preference                          |

---

## Risk Mitigation

| Risk                                    | Mitigation                                                        |
| --------------------------------------- | ----------------------------------------------------------------- |
| Speech Synthesis API not supported      | Feature detection, graceful mute fallback, error callback         |
| Voice not available for selected locale | Fallback chain to English, then mute                              |
| i18n initialization blocks app render   | Show loading state during i18n init, minimize blocking time       |
| Translation file loading delays         | Bundle locales with app, use HTTP backend with caching            |
| Rapid speech queue overflow             | Immediate cancellation for score events, clear queue on new score |
| Browser language detection unreliable   | Fallback chain: stored → browser → default                        |
| Missing translations in production      | Translation key linting, fallback to English for missing keys     |

---

## File Structure After Implementation

```
src/lib/
├── current-match/
│   └── ... (existing)
├── input/
│   └── ... (existing)
├── i18n/
│   ├── i18n.ts                    # NEW - react-i18next configuration
│   ├── locale-detector.ts         # NEW - Browser language detection
│   ├── locale-storage.ts          # NEW - IndexedDB persistence
│   ├── types.ts                   # NEW - Type definitions
│   ├── index.ts                   # NEW - Public exports
│   └── locales/
│       ├── en.json                # NEW - English translations
│       ├── pt.json                # NEW - Portuguese translations
│       └── es.json                # NEW - Spanish translations
└── speech/
    ├── speech-service.ts          # NEW - Speech synthesis service
    ├── voice-selector.ts          # NEW - Voice selection with fallback
    ├── message-generator.ts       # NEW - Generate speech messages
    ├── speech-storage.ts          # NEW - Persistence for preferences
    ├── types.ts                   # NEW - Speech types
    └── index.ts                   # NEW - Public exports

test/lib/
├── i18n/
│   ├── locale-detector.test.ts    # NEW
│   ├── locale-storage.test.ts     # NEW
│   └── i18n.test.ts               # NEW
└── speech/
    ├── speech-service.test.ts     # NEW
    ├── voice-selector.test.ts     # NEW
    ├── message-generator.test.ts  # NEW
    └── utterance-cancellation.test.ts  # NEW
```

---

## Out of Scope (Future Work)

1. **Setup screen language switcher**: Will be added in a future task when setup screen is implemented
2. **Region-specific locale variants** (e.g., `pt-BR` vs `pt-PT`): Not needed for v1
3. **Speech recognition**: Only synthesis is required for v1
4. **Multi-device sync of preferences**: Client-only in v1
5. **Custom voice selection UI**: Auto-selection with fallback is sufficient for v1
