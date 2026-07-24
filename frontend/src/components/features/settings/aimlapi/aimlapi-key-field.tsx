import { useTranslation } from "react-i18next";
import { BrandButton } from "#/components/features/settings/brand-button";
import { KeyStatusIcon } from "#/components/features/settings/key-status-icon";
import { SettingsInput } from "#/components/features/settings/settings-input";
import {
  AimlapiAuthorizeStatus,
  useAimlapiAuthorize,
} from "#/hooks/use-aimlapi-authorize";
import { I18nKey } from "#/i18n/declaration";
import { HelpLink } from "#/ui/help-link";
import { cn } from "#/utils/utils";

const STATUS_MESSAGE: Partial<Record<AimlapiAuthorizeStatus, I18nKey>> = {
  starting: I18nKey.SETTINGS$AIMLAPI_GET_KEY_STARTING,
  awaiting: I18nKey.SETTINGS$AIMLAPI_GET_KEY_AWAITING,
  ready: I18nKey.SETTINGS$AIMLAPI_GET_KEY_SUCCESS,
  expired: I18nKey.SETTINGS$AIMLAPI_GET_KEY_EXPIRED,
  denied: I18nKey.SETTINGS$AIMLAPI_GET_KEY_DENIED,
  error: I18nKey.SETTINGS$AIMLAPI_GET_KEY_ERROR,
};

const FAILURE_STATUSES: AimlapiAuthorizeStatus[] = [
  "expired",
  "denied",
  "error",
];

interface AimlapiKeyFieldProps {
  testId: string;
  helpTestId: string;
  value: string;
  apiKeySet?: boolean;
  isDisabled?: boolean;
  onChange: (value: string) => void;
}

/**
 * API-key field for the AIMLAPI provider: the key input shares a row with a
 * "Get API key" button that runs the device-authorization flow and fills the
 * field with the issued key. Input and button are bottom-aligned so they line
 * up regardless of the label height; on narrow screens the row wraps to two
 * lines. The status message sits on its own line below the row so it never
 * shifts the button out of alignment.
 */
export function AimlapiKeyField({
  testId,
  helpTestId,
  value,
  apiKeySet,
  isDisabled,
  onChange,
}: AimlapiKeyFieldProps) {
  const { t } = useTranslation();
  const { status, authorize } = useAimlapiAuthorize({ onKey: onChange });

  const busy = status === "starting" || status === "awaiting";
  const messageKey = STATUS_MESSAGE[status];

  return (
    <>
      <div className="flex flex-col gap-1.5 sm:max-w-[680px]">
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-end sm:gap-3">
          <SettingsInput
            testId={testId}
            label={t(I18nKey.SETTINGS_FORM$API_KEY)}
            type="password"
            className="w-full sm:flex-1 sm:min-w-0"
            value={value}
            placeholder={apiKeySet ? "<hidden>" : ""}
            onChange={onChange}
            isDisabled={isDisabled}
            startContent={
              apiKeySet ? <KeyStatusIcon isSet={apiKeySet} /> : undefined
            }
          />

          <BrandButton
            testId="aimlapi-get-key"
            type="button"
            variant="secondary"
            className="h-10 whitespace-nowrap"
            isDisabled={isDisabled || busy}
            onClick={() => authorize()}
          >
            {t(I18nKey.SETTINGS$AIMLAPI_GET_KEY)}
          </BrandButton>
        </div>

        {messageKey ? (
          <span
            className={cn(
              "text-xs leading-5",
              status === "ready" && "text-green-500",
              FAILURE_STATUSES.includes(status) && "text-red-500",
              busy && "text-tertiary-alt",
            )}
          >
            {t(messageKey)}
          </span>
        ) : null}
      </div>

      <HelpLink
        testId={helpTestId}
        text={t(I18nKey.SETTINGS$DONT_KNOW_API_KEY)}
        linkText={t(I18nKey.SETTINGS$CLICK_FOR_INSTRUCTIONS)}
        href="https://docs.openhands.dev/usage/local-setup#getting-an-api-key"
      />
    </>
  );
}
