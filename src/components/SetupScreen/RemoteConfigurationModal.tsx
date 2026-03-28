/* oxlint-disable jsx-no-new-function-as-prop -- Base UI Dialog uses render props for accessible composition. */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Dialog } from '@base-ui/react/dialog'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import {
  assignRemoteControllerBinding,
  clearRemoteControllerBindings,
  configurableKeyboardActions,
  createEmptyRemoteControllerBindings,
  createRemoteControllerBindings,
  getKeyboardBindingDisplayLabel,
  loadRemoteControllerBindingsWithFallback,
  saveRemoteControllerBindings,
  type ConfigurableKeyboardAction,
  type RemoteControllerBindings
} from '@/lib/input'
import { cn } from '@/lib/utils/cn'

import styles from './RemoteConfigurationModal.module.css'

const ignoredCaptureKeys = new Set(['Alt', 'Control', 'Meta', 'Shift'])

function toError(error: unknown): Error {
  return error instanceof Error ? error : new Error(String(error))
}

export interface RemoteConfigurationModalProps {
  isOpen: boolean
  onClose: () => void
}

export function RemoteConfigurationModal({ isOpen, onClose }: RemoteConfigurationModalProps) {
  const { t } = useTranslation()
  const { addErrorToast, addSuccessToast } = useToast()
  const [draftBindings, setDraftBindings] = useState<RemoteControllerBindings>(
    createEmptyRemoteControllerBindings()
  )
  const [listeningAction, setListeningAction] = useState<ConfigurableKeyboardAction | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const closeGuardRef = useRef(false)

  useEffect(() => {
    if (isOpen) {
      closeGuardRef.current = false
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) {
      setListeningAction(null)
      return
    }

    let isMounted = true

    void (async () => {
      try {
        const storedBindings = await loadRemoteControllerBindingsWithFallback()

        if (!isMounted) {
          return
        }

        setDraftBindings(storedBindings)
      } catch (error) {
        console.error('Failed to load remote controller bindings.', error)

        if (!isMounted) {
          return
        }

        setDraftBindings(createEmptyRemoteControllerBindings())
        addErrorToast(t('setup.remoteConfig.feedback.loadError'))
      }
    })()

    return () => {
      isMounted = false
    }
  }, [addErrorToast, isOpen, t])

  useEffect(() => {
    if (!isOpen || !listeningAction) {
      return
    }

    const handleCapture = (event: KeyboardEvent) => {
      if (ignoredCaptureKeys.has(event.key)) {
        return
      }

      event.preventDefault()
      event.stopPropagation()

      setDraftBindings((currentBindings) =>
        assignRemoteControllerBinding(currentBindings, listeningAction, event.key)
      )
      setListeningAction(null)
    }

    window.addEventListener('keydown', handleCapture, true)

    return () => {
      window.removeEventListener('keydown', handleCapture, true)
    }
  }, [isOpen, listeningAction])

  const requestClose = useCallback(() => {
    if (closeGuardRef.current) {
      return
    }

    closeGuardRef.current = true
    onClose()
  }, [onClose])

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        requestClose()
      }
    },
    [requestClose]
  )

  const handleSave = useCallback(async () => {
    setIsSaving(true)

    try {
      const isCleared = configurableKeyboardActions.every((action) => !draftBindings[action])

      if (isCleared) {
        await clearRemoteControllerBindings()
      } else {
        await saveRemoteControllerBindings(draftBindings)
      }

      addSuccessToast(t('setup.remoteConfig.feedback.saveSuccess'))
      requestClose()
    } catch (error) {
      const saveError = toError(error)
      addErrorToast(`${t('setup.remoteConfig.feedback.saveError')} ${saveError.message}`)
    } finally {
      setIsSaving(false)
      setListeningAction(null)
    }
  }, [addErrorToast, addSuccessToast, draftBindings, requestClose, t])

  const handleClear = useCallback(() => {
    setListeningAction(null)
    setDraftBindings(createEmptyRemoteControllerBindings())
  }, [])

  const handleResetDefaults = useCallback(() => {
    setListeningAction(null)
    setDraftBindings(createRemoteControllerBindings())
  }, [])

  const bindingRows = useMemo(
    () =>
      [
        {
          action: 'add-team-1',
          label: t('setup.remoteConfig.actions.addTeam1'),
          hint: t('setup.remoteConfig.rows.singlePressHint')
        },
        {
          action: 'revert-team-1',
          label: t('setup.remoteConfig.actions.revertTeam1'),
          hint: t('setup.remoteConfig.rows.guardedUndoHint')
        },
        {
          action: 'add-team-2',
          label: t('setup.remoteConfig.actions.addTeam2'),
          hint: t('setup.remoteConfig.rows.singlePressHint')
        },
        {
          action: 'revert-team-2',
          label: t('setup.remoteConfig.actions.revertTeam2'),
          hint: t('setup.remoteConfig.rows.guardedUndoHint')
        }
      ] satisfies Array<{
        action: ConfigurableKeyboardAction
        label: string
        hint: string
      }>,
    [t]
  )

  const listeningAnnouncement = listeningAction
    ? t('setup.remoteConfig.listeningAnnouncement', {
        action: bindingRows.find((row) => row.action === listeningAction)?.label ?? ''
      })
    : ''

  return (
    <Dialog.Root open={isOpen} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop render={(props) => <div {...props} className={styles.overlay} />} />

        <Dialog.Popup
          render={(props) => (
            <div
              {...props}
              className={styles.container}
              aria-modal="true"
              data-testid="remote-configuration-modal"
            >
              <div className={styles.header}>
                <Dialog.Title
                  render={(titleProps) => (
                    <h2 {...titleProps} className={styles.title}>
                      {t('setup.remoteConfig.title')}
                    </h2>
                  )}
                />
                <Dialog.Description
                  render={(descriptionProps) => (
                    <p {...descriptionProps} className={styles.description}>
                      {t('setup.remoteConfig.description')}
                    </p>
                  )}
                />
              </div>

              <span role="status" aria-live="polite" className={styles.srOnly}>
                {listeningAnnouncement}
              </span>

              <div className={styles.rows}>
                {bindingRows.map((row) => {
                  const binding = draftBindings[row.action]
                  const isListening = listeningAction === row.action

                  return (
                    <div key={row.action} className={styles.row}>
                      <div className={styles.rowText}>
                        <span className={styles.rowLabel}>{row.label}</span>
                        <span className={styles.rowHint}>{row.hint}</span>
                      </div>

                      <Button
                        className={styles.captureButton}
                        variant={isListening ? 'solid' : 'outline'}
                        size="sm"
                        accent={isListening ? 'primary' : 'secondary'}
                        onClick={() => setListeningAction(row.action)}
                        aria-pressed={isListening}
                        data-testid={`remote-binding-${row.action}`}
                      >
                        <span
                          className={cn(
                            styles.captureValue,
                            isListening && styles.captureValueListening,
                            !binding && !isListening && styles.captureValueEmpty
                          )}
                        >
                          {isListening
                            ? t('setup.remoteConfig.listening')
                            : binding
                              ? getKeyboardBindingDisplayLabel(binding)
                              : t('setup.remoteConfig.notSet')}
                        </span>
                      </Button>
                    </div>
                  )
                })}
              </div>

              <p className={styles.helperText}>{t('setup.remoteConfig.helper')}</p>

              <div className={styles.footer}>
                <div className={styles.footerGroup}>
                  <Button variant="outline" size="sm" accent="secondary" onClick={handleClear}>
                    {t('setup.remoteConfig.actions.clear')}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    accent="secondary"
                    onClick={handleResetDefaults}
                  >
                    {t('setup.remoteConfig.actions.resetDefaults')}
                  </Button>
                </div>

                <div className={styles.footerGroup}>
                  <Button variant="outline" size="sm" accent="secondary" onClick={requestClose}>
                    {t('setup.remoteConfig.actions.cancel')}
                  </Button>
                  <Button
                    variant="solid"
                    size="sm"
                    accent="success"
                    onClick={handleSave}
                    disabled={isSaving}
                  >
                    {t('setup.remoteConfig.actions.save')}
                  </Button>
                </div>
              </div>
            </div>
          )}
        />
      </Dialog.Portal>
    </Dialog.Root>
  )
}
