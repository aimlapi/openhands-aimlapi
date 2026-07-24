import { openHands } from "../open-hands-axios";

export interface AimlapiAuthorizeStartResponse {
  request_id: string;
  verification_uri: string;
  interval: number;
  expires_in: number;
}

export interface AimlapiAuthorizePollResponse {
  status: string;
  api_key?: string | null;
}

/**
 * Client for the AIMLAPI "Get API key" device-authorization endpoints. The
 * device code stays server-side; the frontend only ever holds the request id
 * and the consent URL it opens in a new tab.
 */
class AimlapiService {
  static async startAuthorize(): Promise<AimlapiAuthorizeStartResponse> {
    const { data } = await openHands.post<AimlapiAuthorizeStartResponse>(
      "/api/v1/aimlapi/authorize/start",
    );
    return data;
  }

  static async pollAuthorize(
    requestId: string,
  ): Promise<AimlapiAuthorizePollResponse> {
    const { data } = await openHands.post<AimlapiAuthorizePollResponse>(
      "/api/v1/aimlapi/authorize/poll",
      { request_id: requestId },
    );
    return data;
  }
}

export default AimlapiService;
