import { createHash } from "crypto";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const GOOGLE_FORM_URL =
  "https://docs.google.com/forms/u/0/d/e/1FAIpQLSescru1wSCtcxACey6SStr5Ev9WxPjORP7ldJoDfB4GtOx7UQ/formResponse";

// Provided as requested for this specific integration.
const CLOUDINARY_CLOUD_NAME = "dt1ax7bmi";
const CLOUDINARY_API_KEY = "838472429967893";
const CLOUDINARY_API_SECRET = "PLjx2vga35Hbi8aEixSxyv1fwwg";

interface LaunchProjectData {
  fullName: string;
  email: string;
  vision: string;
  companyName: string;
  countryCode: string;
  phoneNumber: string;
  projectType: string;
  currency: string;
  budgetRange: string;
  customBudget: string;
  callDate: string;
  callTime: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function readTextField(formData: FormData, keys: string[]): string {
  for (const key of keys) {
    const raw = formData.get(key);
    if (typeof raw === "string" && raw.trim()) {
      return raw.trim();
    }
  }
  return "";
}

function requireNonEmpty(value: string, field: string): string {
  if (!value) {
    throw new Error(`Missing required field: ${field}.`);
  }
  return value;
}

function validateAndExtract(formData: FormData): LaunchProjectData {
  // Keep frontend unchanged: support common aliases used in existing multi-step form.
  const fullName = requireNonEmpty(readTextField(formData, ["fullName", "name"]), "fullName");
  const email = requireNonEmpty(readTextField(formData, ["email"]), "email");
  const vision = requireNonEmpty(readTextField(formData, ["vision", "description"]), "vision");

  if (!EMAIL_REGEX.test(email)) {
    throw new Error("Invalid email format.");
  }

  return {
    fullName,
    email,
    vision,
    companyName: readTextField(formData, ["companyName", "company"]),
    countryCode: readTextField(formData, ["countryCode", "phoneCountry"]),
    phoneNumber: readTextField(formData, ["phoneNumber"]),
    projectType: readTextField(formData, ["projectType"]),
    currency: readTextField(formData, ["currency", "budgetCurrency"]),
    budgetRange: readTextField(formData, ["budgetRange", "budget"]),
    customBudget: readTextField(formData, ["customBudget"]),
    callDate: readTextField(formData, ["callDate", "meetingDate"]),
    callTime: readTextField(formData, ["callTime", "meetingTime"]),
  };
}

function buildFormattedText(data: LaunchProjectData, imageUrl: string): string {
  const phone = `${data.countryCode || ""} ${data.phoneNumber || "Not provided"}`.trim();

  return `
Name: ${data.fullName}
Email: ${data.email}
Company: ${data.companyName || "Not provided"}
Phone: ${phone}
Project Type: ${data.projectType || "Not provided"}
Currency: ${data.currency || "Not provided"}
Budget Range: ${data.budgetRange || "Not provided"}
Custom Budget: ${data.customBudget || "Not provided"}
Call Date: ${data.callDate || "Not provided"}
Call Time: ${data.callTime || "Not provided"}

Vision:
${data.vision}

Image URL:
${imageUrl || "Not provided"}
`.trim();
}

function createCloudinarySignature(timestamp: number): string {
  // Cloudinary signature is SHA1 of sorted params (excluding file/signature) + API secret.
  const payload = `timestamp=${timestamp}${CLOUDINARY_API_SECRET}`;
  return createHash("sha1").update(payload).digest("hex");
}

async function uploadImageToCloudinary(file: File): Promise<string> {
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = createCloudinarySignature(timestamp);

  const cloudinaryForm = new FormData();
  cloudinaryForm.set("file", file);
  cloudinaryForm.set("api_key", CLOUDINARY_API_KEY);
  cloudinaryForm.set("timestamp", String(timestamp));
  cloudinaryForm.set("signature", signature);

  const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
  const response = await fetch(uploadUrl, {
    method: "POST",
    body: cloudinaryForm,
    redirect: "manual",
    cache: "no-store",
  });

  // Cloudinary is a normal API for uploads; we require a usable secure_url.
  const json = (await response.json().catch(() => null)) as
    | { secure_url?: string; error?: { message?: string } }
    | null;

  const secureUrl = json?.secure_url?.trim();
  if (!secureUrl) {
    const reason = json?.error?.message || "Cloudinary upload failed.";
    throw new Error(reason);
  }

  return secureUrl;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const data = validateAndExtract(formData);

    const maybeFile = formData.get("image") || formData.get("projectImage");
    let imageUrl = "Not provided";

    if (maybeFile instanceof File && maybeFile.size > 0) {
      imageUrl = await uploadImageToCloudinary(maybeFile);
    }

    const formattedText = buildFormattedText(data, imageUrl);

    // Google Forms is not a reliable API: it may return 302/400 for accepted writes,
    // and does not provide dependable confirmation. We treat this as fire-and-forget.
    // Success here means validated + sent (not confirmed inserted).
    const googleBody = new URLSearchParams({
      "entry.820073641": formattedText,
    });

    const googleResponse = await fetch(GOOGLE_FORM_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: googleBody.toString(),
      redirect: "manual",
      cache: "no-store",
    });

    return NextResponse.json({
      success: true,
      message: "Launch project request validated and sent.",
      debug: {
        sent: true,
        googleStatus: googleResponse.status,
        googleRedirected: googleResponse.redirected,
        googleType: googleResponse.type,
      },
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to process launch project submission.";

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 400 }
    );
  }
}
