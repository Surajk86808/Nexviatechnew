import { NextRequest, NextResponse } from "next/server";

const GOOGLE_CONTACT_FORM_URL =
  "https://docs.google.com/forms/u/0/d/e/1FAIpQLSf0x2eSHcyz1NkCVG2ofxf57i33tJCHHKlO7gAwGkmWW974Qw/formResponse";

interface ContactPayload {
  fullName?: unknown;
  email?: unknown;
  message?: unknown;
}

interface ValidContactPayload {
  fullName: string;
  email: string;
  message: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function requireNonEmptyString(value: unknown, fieldName: string): string {
  if (typeof value !== "string") {
    throw new Error(`Missing required field: ${fieldName}.`);
  }

  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error(`Missing required field: ${fieldName}.`);
  }

  return trimmed;
}

function validatePayload(input: ContactPayload): ValidContactPayload {
  const fullName = requireNonEmptyString(input.fullName, "fullName");
  const email = requireNonEmptyString(input.email, "email");
  const message = requireNonEmptyString(input.message, "message");

  if (!EMAIL_REGEX.test(email)) {
    throw new Error("Invalid email format.");
  }

  return { fullName, email, message };
}

export async function POST(req: NextRequest) {
  let raw: ContactPayload;

  try {
    raw = (await req.json()) as ContactPayload;
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: "Invalid JSON body.",
      },
      { status: 400 }
    );
  }

  let data: ValidContactPayload;
  try {
    data = validatePayload(raw);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Validation failed.";
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 400 }
    );
  }

  const body = new URLSearchParams({
    "entry.446710954": data.fullName,
    "entry.47258736": data.email,
    "entry.638013755": data.message,
  });

  try {
    // Google Forms is not a formal API and may return non-2xx/redirect responses
    // even when data is accepted. We only confirm validation + send attempt.
    const response = await fetch(GOOGLE_CONTACT_FORM_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
      redirect: "manual",
      cache: "no-store",
    });

    return NextResponse.json({
      success: true,
      message: "Message validated and sent to Google Form.",
      debug: {
        status: response.status,
        redirected: response.redirected,
        type: response.type,
      },
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to send request to Google Form.",
      },
      { status: 502 }
    );
  }
}
