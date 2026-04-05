/**
 * LTI 1.3 configuration for Canvas integration.
 * All values are read from environment variables.
 * When unconfigured, endpoints return 503.
 */
export const ltiConfig = {
  platformUrl: process.env.LTI_PLATFORM_URL || "",
  clientId: process.env.LTI_CLIENT_ID || "",
  deploymentId: process.env.LTI_DEPLOYMENT_ID || "",
  authEndpoint: process.env.LTI_AUTH_ENDPOINT || "",
  tokenEndpoint: process.env.LTI_TOKEN_ENDPOINT || "",
  jwksUrl: process.env.LTI_JWKS_URL || "",
  toolUrl: process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
};

export function isLtiConfigured(): boolean {
  return Boolean(
    ltiConfig.platformUrl &&
    ltiConfig.clientId &&
    ltiConfig.authEndpoint &&
    ltiConfig.tokenEndpoint &&
    ltiConfig.jwksUrl,
  );
}
