export interface LaunchProjectPayload {
  name: string;
  email: string;
  company?: string;
  phoneCountry?: string;
  phoneNumber?: string;
  projectType: string;
  budget: string;
  budgetCurrency?: string;
  customBudget?: string;
  description: string;
  meetingDate?: string;
  meetingTime?: string;
  projectImage?: File | null;
}

export interface LaunchProjectResponse {
  message: string;
  id: number;
  emailSent?: boolean;
  warnings?: string[];
}

export interface ContactPayload {
  name: string;
  email: string;
  company?: string;
  phone?: string;
  message: string;
}

export interface MarqueeLogoItem {
  name: string;
  src: string;
}

interface StoredLead {
  id: number;
  name: string;
  email: string;
  company: string;
  phoneCountry: string;
  phoneNumber: string;
  projectType: string;
  budget: string;
  budgetCurrency: string;
  customBudget: string;
  description: string;
  meetingDate: string;
  meetingTime: string;
  imageDataUrl: string;
  createdAt: string;
}

const NAME_REGEX = /^[A-Za-z\s.'-]+$/;
const COMPANY_REGEX = /^[A-Za-z\s&.'-]+$/;
const GMAIL_REGEX = /^[A-Za-z0-9._%+-]+@gmail\.com$/i;

const LEADS_KEY = "NexviaTech_launch_leads";

// Frontend-only fallback: persistence and notifications are simulated in localStorage.
// In production, real email delivery and secure storage require a trusted backend.
const assertBrowser = () => {
  if (typeof window === "undefined") {
    throw new Error("This action must run in the browser.");
  }
};

const safeParse = <T,>(value: string | null): T[] => {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
};

const readStore = <T,>(key: string): T[] => {
  assertBrowser();
  return safeParse<T>(window.localStorage.getItem(key));
};

const writeStore = <T,>(key: string, items: T[]) => {
  assertBrowser();
  window.localStorage.setItem(key, JSON.stringify(items));
};

const parseImageFile = async (file?: File | null): Promise<string> => {
  if (!file) return "";

  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
    reader.onerror = () => reject(new Error("Image processing failed"));
    reader.readAsDataURL(file);
  });
};


interface GoogleFormLaunchData {
  email: string;
  fullName: string;
  companyName: string;
  countryCode: string;
  phoneNumber: string;
  projectType: string;
  currency: string;
  budgetRange: string;
  customBudget: string;
  callDate: string;
  callTime: string;
  vision: string;
}

const PHONE_COUNTRY_TO_DIAL_CODE: Record<string, string> = {
  US: "+1",
  UK: "+44",
  IN: "+91",
};

const normalizeProjectTypeForGoogleForm = (projectType: string): string => {
  const trimmed = projectType.trim();

  if (trimmed.startsWith("Other:")) return "Other";

  const mapped: Record<string, string> = {
    "AI & Machine Learning": "AI / Machine Learning",
    "AI / Machine Learning": "AI / Machine Learning",
    "DevOps & Cloud": "DevOps & Automation",
    "DevOps Automation": "DevOps & Automation",
    "Web Development": "Web Development",
    "Mobile App": "Mobile App",
    "Cybersecurity": "Cybersecurity",
    "Product Design": "Product Design",
    Other: "Other",
    "Data Analytics": "Other",
  };

  return mapped[trimmed] || "Other";
};

const normalizeBudgetRangeForGoogleForm = (budget: string, customBudget: string): "5,000 - 15,000" | "15,000 - 30,000" | "Custom" => {
  if (customBudget.trim()) return "Custom";

  const normalized = budget.trim();

  const mapToFirst = new Set(["$5,000 - $15,000", "5,000 - 15,000"]);
  const mapToSecond = new Set(["$15,000 - $30,000", "15,000 - 30,000"]);

  if (mapToFirst.has(normalized)) return "5,000 - 15,000";
  if (mapToSecond.has(normalized)) return "15,000 - 30,000";
  return "Custom";
};

export async function submitToGoogleForm(data: GoogleFormLaunchData): Promise<void> {
  const response = await fetch("/api/submit", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fullName: data.fullName,
      email: data.email,
      companyName: data.companyName,
      countryCode: data.countryCode,
      phoneNumber: data.phoneNumber,
      projectType: data.projectType,
      currency: data.currency,
      budgetRange: data.budgetRange,
      customBudget: data.customBudget,
      callDate: data.callDate,
      callTime: data.callTime,
      vision: data.vision,
    }),
  });

  const fallbackMessage = `Google Form submission failed with status ${response.status}.`;

  let payload: { success?: boolean; accepted?: boolean; message?: string; error?: string } | null = null;
  try {
    payload = (await response.json()) as {
      success?: boolean;
      accepted?: boolean;
      message?: string;
      error?: string;
    };
  } catch {
    payload = null;
  }

  if (response.status !== 200 || !payload?.success || payload.accepted !== true) {
    throw new Error(payload?.error || payload?.message || fallbackMessage);
  }
}

const validateLaunchPayload = (payload: LaunchProjectPayload): string[] => {
  const errors: string[] = [];

  if (!payload.name?.trim()) {
    errors.push("name is required");
  } else if (!NAME_REGEX.test(payload.name.trim())) {
    errors.push("name must contain letters only");
  }

  if (!payload.email?.trim()) {
    errors.push("email is required");
  } else if (!GMAIL_REGEX.test(payload.email.trim())) {
    errors.push("email must be a valid Gmail address");
  }

  if (payload.company?.trim() && !COMPANY_REGEX.test(payload.company.trim())) {
    errors.push("company must contain letters only");
  }

  if (!payload.projectType?.trim()) {
    errors.push("projectType is required");
  }

  if (!payload.budget?.trim()) {
    errors.push("budget is required");
  }

  if ((payload.description || "").trim().length < 10) {
    errors.push("description must be at least 10 characters");
  }

  return errors;
};

const validateContactPayload = (payload: ContactPayload): string[] => {
  const errors: string[] = [];

  if (!payload.name?.trim()) {
    errors.push("name is required");
  } else if (!NAME_REGEX.test(payload.name.trim())) {
    errors.push("name must contain letters only");
  }

  if (!payload.email?.trim()) {
    errors.push("email is required");
  } else if (!GMAIL_REGEX.test(payload.email.trim())) {
    errors.push("email must be a valid Gmail address");
  }

  if ((payload.message || "").trim().length < 5) {
    errors.push("message must be at least 5 characters");
  }

  return errors;
};

export async function submitLaunchProject(payload: LaunchProjectPayload): Promise<LaunchProjectResponse> {
  const validationErrors = validateLaunchPayload(payload);
  if (validationErrors.length > 0) {
    throw new Error(`Invalid form input: ${validationErrors.join(", ")}`);
  }

  const leads = readStore<StoredLead>(LEADS_KEY);
  const id = (leads[0]?.id || 0) + 1;
  const imageDataUrl = await parseImageFile(payload.projectImage);

  const lead: StoredLead = {
    id,
    name: payload.name.trim(),
    email: payload.email.trim(),
    company: payload.company?.trim() || "",
    phoneCountry: payload.phoneCountry?.trim() || "",
    phoneNumber: payload.phoneNumber?.trim() || "",
    projectType: payload.projectType.trim(),
    budget: payload.budget.trim(),
    budgetCurrency: payload.budgetCurrency?.trim() || "",
    customBudget: payload.customBudget?.trim() || "",
    description: payload.description.trim(),
    meetingDate: payload.meetingDate?.trim() || "",
    meetingTime: payload.meetingTime?.trim() || "",
    imageDataUrl,
    createdAt: new Date().toISOString(),
  };

  writeStore<StoredLead>(LEADS_KEY, [lead, ...leads]);

  // Launch Project now uses multipart/form-data and a dedicated backend route
  // that stores ALL details into one Google Form paragraph field.
  const launchForm = new FormData();
  launchForm.set("fullName", lead.name);
  launchForm.set("email", lead.email);
  launchForm.set("vision", lead.description);
  launchForm.set("companyName", lead.company || "");
  launchForm.set(
    "countryCode",
    PHONE_COUNTRY_TO_DIAL_CODE[lead.phoneCountry] || lead.phoneCountry || ""
  );
  launchForm.set("phoneNumber", lead.phoneNumber || "");
  launchForm.set("projectType", normalizeProjectTypeForGoogleForm(lead.projectType));
  launchForm.set("currency", lead.budgetCurrency === "INR" ? "INR" : "USD");
  launchForm.set("budgetRange", normalizeBudgetRangeForGoogleForm(lead.budget, lead.customBudget));
  launchForm.set("customBudget", lead.customBudget || "");
  launchForm.set("callDate", lead.meetingDate || "");
  launchForm.set("callTime", lead.meetingTime || "");

  if (payload.projectImage && payload.projectImage.size > 0) {
    launchForm.set("image", payload.projectImage);
  }

  const launchResponse = await fetch("/api/launch-project", {
    method: "POST",
    body: launchForm,
  });

  const fallbackMessage = `Launch project submission failed with status ${launchResponse.status}.`;
  let launchPayload: { success?: boolean; message?: string; error?: string } | null = null;
  try {
    launchPayload = (await launchResponse.json()) as {
      success?: boolean;
      message?: string;
      error?: string;
    };
  } catch {
    launchPayload = null;
  }

  if (launchResponse.status !== 200 || !launchPayload?.success) {
    throw new Error(launchPayload?.error || launchPayload?.message || fallbackMessage);
  }

  return {
    message:
      launchPayload.message ||
      "Project request validated and sent to our intake form. We will review and follow up soon.",
    id,
    emailSent: true,
    warnings: [],
  };
}

export async function submitContactMessage(payload: ContactPayload) {
  const validationErrors = validateContactPayload(payload);
  if (validationErrors.length > 0) {
    throw new Error(`Invalid contact input: ${validationErrors.join(", ")}`);
  }
  const response = await fetch("/api/contact", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fullName: payload.name.trim(),
      email: payload.email.trim(),
      message: payload.message.trim(),
    }),
  });

  const fallbackMessage = `Contact submission failed with status ${response.status}.`;
  let responsePayload: { success?: boolean; message?: string; error?: string } | null = null;

  try {
    responsePayload = (await response.json()) as {
      success?: boolean;
      message?: string;
      error?: string;
    };
  } catch {
    responsePayload = null;
  }

  if (response.status !== 200 || !responsePayload?.success) {
    throw new Error(responsePayload?.error || responsePayload?.message || fallbackMessage);
  }

  return {
    message:
      responsePayload.message ||
      "Message validated and sent to our intake form.",
    id: Date.now(),
    emailSent: true,
  };
}

export async function fetchMarqueeLogos(): Promise<MarqueeLogoItem[]> {
  return [
    { name: "Aws", src: "/logo/aws.svg" },
    { name: "Ibm", src: "/logo/ibm.svg" },
    { name: "Nvidia", src: "/logo/nvidia.svg" },
    { name: "Openai", src: "/logo/openai.svg" },
    { name: "Stripe", src: "/logo/stripe.svg" },
    { name: "Yello", src: "/logo/yello.svg" },
  ];
}
