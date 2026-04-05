import { ltiConfig } from "@/lib/lti-config";
import { NextResponse } from "next/server";

/**
 * LTI tool configuration JSON.
 * Canvas administrators use this endpoint to register the tool.
 */
export async function GET() {
  const toolUrl = ltiConfig.toolUrl;

  return NextResponse.json({
    title: "ComputeLearn",
    description: "Mastery-based engineering learning platform",
    oidc_initiation_url: `${toolUrl}/api/lti/launch`,
    target_link_uri: `${toolUrl}/api/lti/callback`,
    scopes: ["https://purl.imsglobal.org/spec/lti-ags/scope/score"],
    extensions: [
      {
        platform: "canvas.instructure.com",
        settings: {
          placements: [
            {
              placement: "course_navigation",
              message_type: "LtiResourceLinkRequest",
              target_link_uri: `${toolUrl}/api/lti/callback`,
            },
            {
              placement: "assignment_selection",
              message_type: "LtiDeepLinkingRequest",
              target_link_uri: `${toolUrl}/api/lti/callback`,
            },
          ],
        },
      },
    ],
    public_jwk_url: `${toolUrl}/api/lti/jwks`,
    custom_fields: {
      lesson_id: "$Canvas.assignment.id",
      course_id: "$Canvas.course.id",
    },
  });
}
