import { isLtiConfigured, ltiConfig } from "@/lib/lti-config";
import { NextRequest, NextResponse } from "next/server";

/**
 * LTI 1.3 OIDC third-party initiated login.
 * Canvas POSTs here to start the launch flow.
 */
export async function POST(request: NextRequest) {
  if (!isLtiConfigured()) {
    return NextResponse.json(
      {
        error: "LTI integration is not configured",
        detail:
          "Set LTI_PLATFORM_URL, LTI_CLIENT_ID, LTI_AUTH_ENDPOINT, and LTI_TOKEN_ENDPOINT environment variables.",
      },
      { status: 503 },
    );
  }

  let body: URLSearchParams;
  try {
    const text = await request.text();
    body = new URLSearchParams(text);
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }

  const iss = body.get("iss");
  const loginHint = body.get("login_hint");
  const targetLinkUri = body.get("target_link_uri");

  if (!iss || !loginHint) {
    return NextResponse.json(
      { error: "Missing required parameters: iss, login_hint" },
      { status: 400 },
    );
  }

  if (iss !== ltiConfig.platformUrl) {
    return NextResponse.json({ error: "Issuer mismatch" }, { status: 403 });
  }

  // Generate nonce and state for OIDC auth request
  const nonce = crypto.randomUUID();
  const state = crypto.randomUUID();

  const redirectUri = `${ltiConfig.toolUrl}/api/lti/callback`;

  const params = new URLSearchParams({
    response_type: "id_token",
    response_mode: "form_post",
    scope: "openid",
    client_id: ltiConfig.clientId,
    redirect_uri: redirectUri,
    login_hint: loginHint,
    nonce,
    state,
    prompt: "none",
  });

  if (targetLinkUri) {
    params.set("lti_message_hint", targetLinkUri);
  }

  const authUrl = `${ltiConfig.authEndpoint}?${params.toString()}`;
  return NextResponse.redirect(authUrl, 302);
}
