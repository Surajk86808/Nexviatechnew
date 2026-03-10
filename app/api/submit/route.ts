import { NextRequest, NextResponse } from "next/server";

const GOOGLE_FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSf91gwxlS_f2frVCZ9oQt5l3dxFHKHuNk07ICpuh48mitD8oA/formResponse";

const PROJECT_TYPE_VALUES = [
  "Web Development",
  "DevOps & Automation",
  "AI / Machine Learning",
  "Mobile App",
  "Cybersecurity",
  "Product Design",
  "Other",
] as const;

const CURRENCY_VALUES = ["USD", "INR"] as const;

const BUDGET_RANGE_VALUES = ["5,000 - 15,000", "15,000 - 30,000", "Custom"] as const;

type ProjectType = (typeof PROJECT_TYPE_VALUES)[number];
type Currency = (typeof CURRENCY_VALUES)[number];
type BudgetRange = (typeof BUDGET_RANGE_VALUES)[number];

interface SubmitPayload {
  email?: unknown;
  fullName?: unknown;
  companyName?: unknown;
  countryCode?: unknown;
  phoneNumber?: unknown;
  projectType?: unknown;
  currency?: unknown;
  budgetRange?: unknown;
  customBudget?: unknown;
  callDate?: unknown;
  callTime?: unknown;
  vision?: unknown;
  isolationMode?: unknown;
}

interface ValidPayload {
  email: string;
  fullName: string;
  companyName?: string;
  countryCode: string;
  phoneNumber?: string;
  projectType: ProjectType;
  currency: Currency;
  budgetRange: BudgetRange;
  customBudget?: string;
  callDate?: string;
  callTime?: string;
  vision?: string;
  isolationMode: boolean;
}

function requiredString(value: unknown, field: string): string {
  if (typeof value !== "string") {
    throw new Error(`Missing required field: ${field}.`);
  }

  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error(`Missing required field: ${field}.`);
  }

  return trimmed;
}

function optionalString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function assertAllowed<T extends readonly string[]>(
  value: string,
  allowed: T,
  field: string
): T[number] {
  if (!allowed.includes(value)) {
    throw new Error(
      `Invalid ${field}: \"${value}\". Allowed values: ${allowed.join(", ")}.`
    );
  }

  return value as T[number];
}

function toIsolationMode(value: unknown): boolean {
  return value === true || value === "true" || value === 1 || value === "1";
}

function validate(payload: SubmitPayload): ValidPayload {
  const email = requiredString(payload.email, "email");
  const fullName = requiredString(payload.fullName, "fullName");
  const countryCode = requiredString(payload.countryCode, "countryCode");

  const projectTypeRaw = requiredString(payload.projectType, "projectType");
  const currencyRaw = requiredString(payload.currency, "currency");
  const budgetRangeRaw = requiredString(payload.budgetRange, "budgetRange");

  return {
    email,
    fullName,
    countryCode,
    projectType: assertAllowed(projectTypeRaw, PROJECT_TYPE_VALUES, "projectType"),
    currency: assertAllowed(currencyRaw, CURRENCY_VALUES, "currency"),
    budgetRange: assertAllowed(budgetRangeRaw, BUDGET_RANGE_VALUES, "budgetRange"),
    companyName: optionalString(payload.companyName),
    phoneNumber: optionalString(payload.phoneNumber),
    customBudget: optionalString(payload.customBudget),
    callDate: optionalString(payload.callDate),
    callTime: optionalString(payload.callTime),
    vision: optionalString(payload.vision),
    isolationMode: toIsolationMode(payload.isolationMode),
  };
}

function buildIsolationBody(data: ValidPayload): URLSearchParams {
  // Isolation mode sends only required fields to debug silent Google Form rejection.
  return new URLSearchParams({
    "entry.211095986": data.email,
    "entry.744807873": data.fullName,
    "entry.1232467842": data.countryCode,
    "entry.1956428190": data.projectType,
    "entry.423485254": data.currency,
    "entry.407315334": data.budgetRange,
  });
}

function buildFullBody(data: ValidPayload): URLSearchParams {
  const params = buildIsolationBody(data);

  // Send optional fields only when non-empty.
  // This avoids sending empty strings that can trigger silent Google Form rejection.
  if (data.companyName) params.set("entry.2114660631", data.companyName);
  if (data.phoneNumber) params.set("entry.624400097", data.phoneNumber);
  if (data.customBudget) params.set("entry.1665693579", data.customBudget);
  if (data.callDate) params.set("entry.141516442", data.callDate);
  if (data.callTime) params.set("entry.149923427", data.callTime);
  if (data.vision) params.set("entry.1819570958", data.vision);

  return params;
}

export async function POST(req: NextRequest) {
  let raw: SubmitPayload;

  try {
    raw = (await req.json()) as SubmitPayload;
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: "Invalid JSON body.",
      },
      { status: 400 }
    );
  }

  let data: ValidPayload;
  try {
    data = validate(raw);
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

  const body = data.isolationMode ? buildIsolationBody(data) : buildFullBody(data);

  try {
    // Google Forms is not a reliable API: it may return 302/400 even when a row is created,
    // and may also reject silently. We do NOT use response.ok/status as success criteria.
    const response = await fetch(GOOGLE_FORM_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
      redirect: "manual",
      cache: "no-store",
    });

    const location = response.headers.get("location") || "";
    const locationLower = location.toLowerCase();
    const redirectedToLogin =
      locationLower.includes("servicelogin") || locationLower.includes("accounts.google.com");
    const explicitReject = response.status === 400;
    const accepted = !redirectedToLogin && !explicitReject;

    return NextResponse.json({
      success: accepted,
      accepted,
      sent: true,
      mode: data.isolationMode ? "isolation" : "full",
      message: accepted
        ? "Payload validated and sent to Google Form."
        : "Google likely rejected this submission. Check form access/settings and exact option text.",
      debug: {
        status: response.status,
        redirected: response.redirected,
        type: response.type,
        location,
        redirectedToLogin,
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
