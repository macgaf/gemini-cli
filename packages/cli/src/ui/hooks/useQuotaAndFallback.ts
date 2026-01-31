/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  AuthType,
  type Config,
  type FallbackModelHandler,
  type FallbackIntent,
  type ValidationHandler,
  type ValidationIntent,
  TerminalQuotaError,
  ModelNotFoundError,
  type UserTierId,
  PREVIEW_GEMINI_MODEL,
  DEFAULT_GEMINI_MODEL,
  VALID_GEMINI_MODELS,
} from '@google/gemini-cli-core';
import { useCallback, useEffect, useRef, useState } from 'react';
import { type UseHistoryManagerReturn } from './useHistoryManager.js';
import { MessageType } from '../types.js';
import {
  type ProQuotaDialogRequest,
  type ValidationDialogRequest,
} from '../contexts/UIStateContext.js';
import { i18n } from '../../i18n/index.js';

interface UseQuotaAndFallbackArgs {
  config: Config;
  historyManager: UseHistoryManagerReturn;
  userTier: UserTierId | undefined;
  setModelSwitchedFromQuotaError: (value: boolean) => void;
}

export function useQuotaAndFallback({
  config,
  historyManager,
  userTier,
  setModelSwitchedFromQuotaError,
}: UseQuotaAndFallbackArgs) {
  const [proQuotaRequest, setProQuotaRequest] =
    useState<ProQuotaDialogRequest | null>(null);
  const [validationRequest, setValidationRequest] =
    useState<ValidationDialogRequest | null>(null);
  const isDialogPending = useRef(false);
  const isValidationPending = useRef(false);

  // Set up Flash fallback handler
  useEffect(() => {
    const fallbackHandler: FallbackModelHandler = async (
      failedModel,
      fallbackModel,
      error,
    ): Promise<FallbackIntent | null> => {
      // Fallbacks are currently only handled for OAuth users.
      const contentGeneratorConfig = config.getContentGeneratorConfig();
      if (
        !contentGeneratorConfig ||
        contentGeneratorConfig.authType !== AuthType.LOGIN_WITH_GOOGLE
      ) {
        return null;
      }

      let message: string;
      let isTerminalQuotaError = false;
      let isModelNotFoundError = false;
      const usageLimitReachedModel =
        failedModel === DEFAULT_GEMINI_MODEL ||
        failedModel === PREVIEW_GEMINI_MODEL
          ? i18n.t('dialogs:proQuota.allProModels')
          : failedModel;
      if (error instanceof TerminalQuotaError) {
        isTerminalQuotaError = true;
        // Common part of the message for both tiers
        const messageLines = [
          i18n.t('dialogs:proQuota.usageLimitReached', {
            model: usageLimitReachedModel,
          }),
          error.retryDelayMs ? getResetTimeMessage(error.retryDelayMs) : null,
          i18n.t('dialogs:proQuota.statsHint'),
          i18n.t('dialogs:proQuota.modelHint'),
          i18n.t('dialogs:proQuota.authHint'),
        ].filter(Boolean);
        message = messageLines.join('\n');
      } else if (
        error instanceof ModelNotFoundError &&
        VALID_GEMINI_MODELS.has(failedModel)
      ) {
        isModelNotFoundError = true;
        const messageLines = [
          i18n.t('dialogs:proQuota.noAccess', { model: failedModel }),
          i18n.t('dialogs:proQuota.previewLearnMore'),
          i18n.t('dialogs:proQuota.disablePreview', { model: failedModel }),
        ];
        message = messageLines.join('\n');
      } else {
        const messageLines = [
          i18n.t('dialogs:proQuota.highDemand'),
          i18n.t('dialogs:proQuota.highDemandApology'),
          i18n.t('dialogs:proQuota.modelHint'),
        ];
        message = messageLines.join('\n');
      }

      setModelSwitchedFromQuotaError(true);
      config.setQuotaErrorOccurred(true);

      if (isDialogPending.current) {
        return 'stop'; // A dialog is already active, so just stop this request.
      }
      isDialogPending.current = true;

      const intent: FallbackIntent = await new Promise<FallbackIntent>(
        (resolve) => {
          setProQuotaRequest({
            failedModel,
            fallbackModel,
            resolve,
            message,
            isTerminalQuotaError,
            isModelNotFoundError,
          });
        },
      );

      return intent;
    };

    config.setFallbackModelHandler(fallbackHandler);
  }, [config, historyManager, userTier, setModelSwitchedFromQuotaError]);

  // Set up validation handler for 403 VALIDATION_REQUIRED errors
  useEffect(() => {
    const validationHandler: ValidationHandler = async (
      validationLink,
      validationDescription,
      learnMoreUrl,
    ): Promise<ValidationIntent> => {
      if (isValidationPending.current) {
        return 'cancel'; // A validation dialog is already active
      }
      isValidationPending.current = true;

      const intent: ValidationIntent = await new Promise<ValidationIntent>(
        (resolve) => {
          // Call setValidationRequest directly - same pattern as proQuotaRequest
          setValidationRequest({
            validationLink,
            validationDescription,
            learnMoreUrl,
            resolve,
          });
        },
      );

      return intent;
    };

    config.setValidationHandler(validationHandler);
  }, [config]);

  const handleProQuotaChoice = useCallback(
    (choice: FallbackIntent) => {
      if (!proQuotaRequest) return;

      const intent: FallbackIntent = choice;
      proQuotaRequest.resolve(intent);
      setProQuotaRequest(null);
      isDialogPending.current = false; // Reset the flag here

      if (choice === 'retry_always' || choice === 'retry_once') {
        // Reset quota error flags to allow the agent loop to continue.
        setModelSwitchedFromQuotaError(false);
        config.setQuotaErrorOccurred(false);

        if (choice === 'retry_always') {
          historyManager.addItem(
            {
              type: MessageType.INFO,
              text: i18n.t('dialogs:proQuota.switchedToFallback', {
                model: proQuotaRequest.fallbackModel,
              }),
            },
            Date.now(),
          );
        }
      }
    },
    [proQuotaRequest, historyManager, config, setModelSwitchedFromQuotaError],
  );

  const handleValidationChoice = useCallback(
    (choice: ValidationIntent) => {
      // Guard against double-execution (e.g. rapid clicks) and stale requests
      if (!isValidationPending.current || !validationRequest) return;

      // Immediately clear the flag to prevent any subsequent calls from passing the guard
      isValidationPending.current = false;

      validationRequest.resolve(choice);
      setValidationRequest(null);

      if (choice === 'change_auth') {
        historyManager.addItem(
          {
            type: MessageType.INFO,
            text: i18n.t('auth:validation.changeAuthHint'),
          },
          Date.now(),
        );
      }
    },
    [validationRequest, historyManager],
  );

  return {
    proQuotaRequest,
    handleProQuotaChoice,
    validationRequest,
    handleValidationChoice,
  };
}

function getResetTimeMessage(delayMs: number): string {
  const resetDate = new Date(Date.now() + delayMs);

  const locale = i18n.language || 'en';
  const timeFormatter = new Intl.DateTimeFormat(locale, {
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  });

  return i18n.t('dialogs:proQuota.resetTime', {
    time: timeFormatter.format(resetDate),
  });
}
