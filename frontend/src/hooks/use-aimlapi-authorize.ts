import React from "react";
import AimlapiService from "#/api/aimlapi-service/aimlapi-service.api";

export type AimlapiAuthorizeStatus =
  | "idle"
  | "starting"
  | "awaiting"
  | "ready"
  | "expired"
  | "denied"
  | "error";

const DENIED_STATUSES = new Set([
  "denied",
  "cancelled",
  "canceled",
  "rejected",
]);
const EXPIRED_STATUSES = new Set(["expired"]);
const FAILURE_STATUSES = new Set([
  ...DENIED_STATUSES,
  ...EXPIRED_STATUSES,
  "error",
  "failed",
]);

interface UseAimlapiAuthorizeOptions {
  onKey: (apiKey: string) => void;
}

/**
 * Drives the AIMLAPI device-authorization flow from the browser: start →
 * open the consent page in a new tab → poll the backend until the issued key
 * comes back (then hand it to `onKey`) or the request reaches a terminal
 * state. Timers are cleaned up on unmount and on a fresh `authorize()`.
 */
export function useAimlapiAuthorize({ onKey }: UseAimlapiAuthorizeOptions) {
  const [status, setStatus] = React.useState<AimlapiAuthorizeStatus>("idle");
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeRef = React.useRef(false);
  const onKeyRef = React.useRef(onKey);
  onKeyRef.current = onKey;

  const stop = React.useCallback(() => {
    activeRef.current = false;
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  React.useEffect(() => stop, [stop]);

  const authorize = React.useCallback(async () => {
    if (activeRef.current) return;
    stop();
    activeRef.current = true;
    setStatus("starting");

    let start;
    try {
      start = await AimlapiService.startAuthorize();
    } catch {
      activeRef.current = false;
      setStatus("error");
      return;
    }

    // Consent happens on aimlapi.com; the key is fetched by polling below.
    window.open(start.verification_uri, "_blank", "noopener,noreferrer");
    setStatus("awaiting");

    const intervalMs = Math.max(1, start.interval) * 1000;
    const deadline = Date.now() + Math.max(1, start.expires_in) * 1000;

    const poll = async () => {
      if (!activeRef.current) return;
      if (Date.now() >= deadline) {
        activeRef.current = false;
        setStatus("expired");
        return;
      }

      let result;
      try {
        result = await AimlapiService.pollAuthorize(start.request_id);
      } catch {
        activeRef.current = false;
        setStatus("error");
        return;
      }
      if (!activeRef.current) return;

      if (result.status === "ready" && result.api_key) {
        activeRef.current = false;
        onKeyRef.current(result.api_key);
        setStatus("ready");
        return;
      }
      if (FAILURE_STATUSES.has(result.status)) {
        activeRef.current = false;
        if (DENIED_STATUSES.has(result.status)) setStatus("denied");
        else if (EXPIRED_STATUSES.has(result.status)) setStatus("expired");
        else setStatus("error");
        return;
      }

      timerRef.current = setTimeout(poll, intervalMs);
    };

    timerRef.current = setTimeout(poll, intervalMs);
  }, [stop]);

  const reset = React.useCallback(() => {
    stop();
    setStatus("idle");
  }, [stop]);

  return { status, authorize, reset };
}
