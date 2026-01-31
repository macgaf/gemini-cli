/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { SHELL_FOCUS_HINT_DELAY_MS } from '../constants.js';
import { getInformativeTips } from '../constants/tips.js';
import { getWittyLoadingPhrases } from '../constants/wittyPhrases.js';
import { useInactivityTimer } from './useInactivityTimer.js';
import { getFallbackString, t } from '../../i18n/index.js';

export const PHRASE_CHANGE_INTERVAL_MS = 15000;

// Function to get translated phrase
const WAITING_FOR_CONFIRMATION_FALLBACK = getFallbackString(
  'common:loading.waitingForConfirmation',
);

// Export for external use
export const INTERACTIVE_SHELL_WAITING_PHRASE = getFallbackString(
  'common:loading.interactiveShellWaiting',
);

function getInteractiveShellWaitingPhrase(): string {
  return t('common:loading.interactiveShellWaiting', {
    defaultValue: INTERACTIVE_SHELL_WAITING_PHRASE,
  });
}

function getWaitingForConfirmationPhrase(): string {
  return t('common:loading.waitingForConfirmation', {
    defaultValue: WAITING_FOR_CONFIRMATION_FALLBACK,
  });
}

/**
 * Custom hook to manage cycling through loading phrases.
 * @param isActive Whether the phrase cycling should be active.
 * @param isWaiting Whether to show a specific waiting phrase.
 * @param isInteractiveShellWaiting Whether an interactive shell is waiting for input but not focused.
 * @param customPhrases Optional list of custom phrases to use.
 * @returns The current loading phrase.
 */
export const usePhraseCycler = (
  isActive: boolean,
  isWaiting: boolean,
  isInteractiveShellWaiting: boolean,
  lastOutputTime: number = 0,
  customPhrases?: string[],
) => {
  const { i18n } = useTranslation();
  // Get translated phrases from i18n
  const translatedWittyPhrases = useMemo(
    () => getWittyLoadingPhrases(i18n.language),
    [i18n.language],
  );
  const translatedTips = useMemo(
    () => getInformativeTips(i18n.language),
    [i18n.language],
  );

  const loadingPhrases = useMemo(
    () =>
      customPhrases && customPhrases.length > 0
        ? customPhrases
        : translatedWittyPhrases,
    [customPhrases, translatedWittyPhrases],
  );

  const [currentLoadingPhrase, setCurrentLoadingPhrase] = useState(
    loadingPhrases[0],
  );
  const showShellFocusHint = useInactivityTimer(
    isInteractiveShellWaiting,
    lastOutputTime,
    SHELL_FOCUS_HINT_DELAY_MS,
  );
  const phraseIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasShownFirstRequestTipRef = useRef(false);

  useEffect(() => {
    // Always clear on re-run
    if (phraseIntervalRef.current) {
      clearInterval(phraseIntervalRef.current);
      phraseIntervalRef.current = null;
    }

    if (isInteractiveShellWaiting && showShellFocusHint) {
      setCurrentLoadingPhrase(getInteractiveShellWaitingPhrase());
      return;
    }

    if (isWaiting) {
      setCurrentLoadingPhrase(getWaitingForConfirmationPhrase());
      return;
    }

    if (!isActive) {
      setCurrentLoadingPhrase(loadingPhrases[0]);
      return;
    }

    const setRandomPhrase = () => {
      if (customPhrases && customPhrases.length > 0) {
        const randomIndex = Math.floor(Math.random() * customPhrases.length);
        setCurrentLoadingPhrase(customPhrases[randomIndex]);
      } else {
        let phraseList;
        // Show a tip on the first request after startup, then continue with 1/6 chance
        if (!hasShownFirstRequestTipRef.current) {
          // Show a tip during the first request
          phraseList = translatedTips;
          hasShownFirstRequestTipRef.current = true;
        } else {
          // Roughly 1 in 6 chance to show a tip after the first request
          const showTip = Math.random() < 1 / 6;
          phraseList = showTip ? translatedTips : translatedWittyPhrases;
        }
        const randomIndex = Math.floor(Math.random() * phraseList.length);
        setCurrentLoadingPhrase(phraseList[randomIndex]);
      }
    };

    // Select an initial random phrase
    setRandomPhrase();

    phraseIntervalRef.current = setInterval(() => {
      // Select a new random phrase
      setRandomPhrase();
    }, PHRASE_CHANGE_INTERVAL_MS);

    return () => {
      if (phraseIntervalRef.current) {
        clearInterval(phraseIntervalRef.current);
        phraseIntervalRef.current = null;
      }
    };
  }, [
    isActive,
    isWaiting,
    isInteractiveShellWaiting,
    customPhrases,
    loadingPhrases,
    showShellFocusHint,
    translatedTips,
    translatedWittyPhrases,
  ]);

  return currentLoadingPhrase;
};
