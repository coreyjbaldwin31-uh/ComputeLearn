import { NextResponse } from "next/server";

/**
 * Tool JWKS endpoint.
 * Returns the tool's public JSON Web Key Set for LTI 1.3.
 * V1: returns an empty keyset — actual key generation happens
 * when deployment is configured.
 */
export async function GET() {
  return NextResponse.json(
    { keys: [] },
    {
      headers: {
        "Cache-Control": "public, max-age=3600",
        "Content-Type": "application/json",
      },
    },
  );
}
