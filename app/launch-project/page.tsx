"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Calendar as CalendarIcon, Clock, Check } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { submitLaunchProject } from "@/lib/api";

const projectTypes = ["Web Development", "DevOps & Automation", "AI / Machine Learning", "Mobile App", "Cybersecurity", "Product Design", "Other"];
const budgetRangesByCurrency = {
  USD: ["5,000 - 15,000", "15,000 - 30,000"],
  INR: ["5,000 - 15,000", "15,000 - 30,000"],
} as const;
const phoneCountryOptions = [
  { code: "US", label: "US (+1)" },
  { code: "UK", label: "UK (+44)" },
  { code: "IN", label: "India (+91)" },
];
const timeSlots = ["09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM"];
const NAME_REGEX = /^[A-Za-z\s.'-]+$/;
const COMPANY_REGEX = /^[A-Za-z\s&.'-]+$/;
const GMAIL_REGEX = /^[A-Za-z0-9._%+-]+@gmail\.com$/i;
const PHONE_REGEX = /^[0-9+\-\s()]{6,20}$/;

const LaunchProject = () => {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    phoneCountry: "US",
    phoneNumber: "",
    projectType: "",
    projectTypeOther: "",
    budget: "",
    budgetCurrency: "USD",
    customBudget: "",
    description: "",
    meetingDate: undefined as Date | undefined,
    meetingTime: "",
    projectImage: null as File | null,
  });
  const [submitted, setSubmitted] = useState(false);
  const [submissionMessage, setSubmissionMessage] = useState(
    "Project request validated and sent. We'll review your details and get back within 24 hours."
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({ name: "", email: "", company: "", phoneNumber: "", description: "", projectTypeOther: "", budget: "" });

  const steps = ["Your Info", "Project Details", "Schedule a Call"];
  const progress = ((step + 1) / steps.length) * 100;

  const update = (key: string, value: string | Date | File | null | undefined) => setForm((prev) => ({ ...prev, [key]: value }));

  const validateStep0 = (name: string, email: string, company: string, phoneNumber: string) => {
    const errors = { name: "", email: "", company: "", phoneNumber: "", description: "", projectTypeOther: "", budget: "" };
    if (!name.trim()) {
      errors.name = "Full name is required.";
    } else if (!NAME_REGEX.test(name.trim())) {
      errors.name = "Use letters only for full name.";
    }

    if (!email.trim()) {
      errors.email = "Gmail address is required.";
    } else if (!GMAIL_REGEX.test(email.trim())) {
      errors.email = "Enter a valid Gmail address.";
    }

    if (company.trim() && !COMPANY_REGEX.test(company.trim())) {
      errors.company = "Company name should contain letters only.";
    }

    if (phoneNumber.trim() && !PHONE_REGEX.test(phoneNumber.trim())) {
      errors.phoneNumber = "Enter a valid phone number.";
    }

    return errors;
  };

  const validateStep1 = (projectType: string, projectTypeOther: string, budget: string, customBudget: string) => {
    const errors = { projectTypeOther: "", budget: "" };
    if (projectType === "Other" && !projectTypeOther.trim()) {
      errors.projectTypeOther = "Please specify your project type.";
    }
    if (!budget && !customBudget.trim()) {
      errors.budget = "Select a budget range or enter a custom budget.";
    }
    return errors;
  };

  const validateStep3 = (description: string) => {
    if (description.trim().length < 10) {
      return "Description must be at least 10 characters.";
    }
    return "";
  };

  const validateCurrentStepAndSetErrors = () => {
    if (step === 0) {
      const errors = validateStep0(form.name, form.email, form.company, form.phoneNumber);
      setFieldErrors(errors);
      return !errors.name && !errors.email && !errors.company && !errors.phoneNumber;
    }

    if (step === 1) {
      const errors = validateStep1(form.projectType, form.projectTypeOther, form.budget, form.customBudget);
      setFieldErrors((prev) => ({ ...prev, projectTypeOther: errors.projectTypeOther, budget: errors.budget }));
      return !errors.projectTypeOther && !errors.budget;
    }

    if (step === 2) {
      const descriptionError = validateStep3(form.description);
      setFieldErrors((prev) => ({ ...prev, description: descriptionError }));
      return !descriptionError;
    }

    return true;
  };

  const canNext = () => {
    if (step === 0) {
      const errors = validateStep0(form.name, form.email, form.company, form.phoneNumber);
      return !!form.name && !!form.email && !errors.name && !errors.email && !errors.company && !errors.phoneNumber;
    }
    if (step === 1) {
      const errors = validateStep1(form.projectType, form.projectTypeOther, form.budget, form.customBudget);
      return !!form.projectType && !errors.projectTypeOther && !errors.budget;
    }
    if (step === 2) return form.description.trim().length > 10;
    return true;
  };

  const handleSubmit = async () => {
    if (!validateCurrentStepAndSetErrors()) return;
    setIsSubmitting(true);
    setSubmitError("");
    try {
      const finalDescription =
        form.projectType === "Other" && form.projectTypeOther.trim()
          ? `Project Type Details: ${form.projectTypeOther.trim()}\n\n${form.description}`
          : form.description;

      const result = await submitLaunchProject({
        name: form.name,
        email: form.email,
        company: form.company,
        phoneCountry: form.phoneCountry,
        phoneNumber: form.phoneNumber,
        projectType: form.projectType === "Other" ? "Other" : form.projectType,
        budget: form.customBudget.trim()
          ? `Custom (${form.budgetCurrency}): ${form.customBudget.trim()}`
          : form.budget,
        budgetCurrency: form.budgetCurrency,
        customBudget: form.customBudget,
        description: finalDescription,
        meetingDate: form.meetingDate ? format(form.meetingDate, "yyyy-MM-dd") : "",
        meetingTime: form.meetingTime,
        projectImage: form.projectImage,
      });
      setSubmissionMessage(
        result.message ||
          "Project request validated and sent. We'll review your details and get back within 24 hours."
      );
      setSubmitted(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Submission failed.";
      setSubmitError(message);
      console.error("Project submission failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center glass rounded-2xl p-12 max-w-md mx-6">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
            <Check className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-3">Request Sent</h2>
          <p className="text-muted-foreground text-sm mb-6">{submissionMessage}</p>
          <Link href="/" className="text-primary text-sm font-medium hover:underline">
            Back to Home
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="pt-16 pb-20 container mx-auto px-6 max-w-2xl">
        <div className="mb-10">
          <div className="flex justify-between text-xs text-muted-foreground mb-3">
            {steps.map((s, i) => (
              <span key={s} className={i <= step ? "text-primary font-medium" : ""}>
                {s}
              </span>
            ))}
          </div>
          <Progress value={progress} className="h-1 bg-border" />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25 }}
            className="glass rounded-2xl p-8 md:p-10"
          >
            {step === 0 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-foreground">Tell us about you</h2>
                <p className="text-muted-foreground text-sm">Let's start with the basics.</p>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-muted-foreground mb-1.5 block">Full Name *</label>
                    <input
                      value={form.name}
                      onChange={(e) => {
                        update("name", e.target.value);
                        const errors = validateStep0(e.target.value, form.email, form.company, form.phoneNumber);
                        setFieldErrors((prev) => ({ ...prev, name: errors.name }));
                      }}
                      className="w-full bg-background/50 border border-border rounded-lg px-4 py-3 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none transition-all"
                      placeholder="John Doe"
                    />
                    {fieldErrors.name && <p className="text-xs text-red-500 mt-1">{fieldErrors.name}</p>}
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-1.5 block">Gmail Address *</label>
                    <input
                      value={form.email}
                      onChange={(e) => {
                        update("email", e.target.value);
                        const errors = validateStep0(form.name, e.target.value, form.company, form.phoneNumber);
                        setFieldErrors((prev) => ({ ...prev, email: errors.email }));
                      }}
                      type="email"
                      className="w-full bg-background/50 border border-border rounded-lg px-4 py-3 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none transition-all"
                      placeholder="john@gmail.com"
                    />
                    {fieldErrors.email && <p className="text-xs text-red-500 mt-1">{fieldErrors.email}</p>}
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-1.5 block">Company Name</label>
                    <input
                      value={form.company}
                      onChange={(e) => {
                        update("company", e.target.value);
                        const errors = validateStep0(form.name, form.email, e.target.value, form.phoneNumber);
                        setFieldErrors((prev) => ({ ...prev, company: errors.company }));
                      }}
                      className="w-full bg-background/50 border border-border rounded-lg px-4 py-3 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none transition-all"
                      placeholder="Acme Inc."
                    />
                    {fieldErrors.company && <p className="text-xs text-red-500 mt-1">{fieldErrors.company}</p>}
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-1.5 block">Contact Number (optional)</label>
                    <div className="grid grid-cols-[150px_1fr] gap-2">
                      <select
                        value={form.phoneCountry}
                        onChange={(e) => update("phoneCountry", e.target.value)}
                        className="bg-background/50 border border-border rounded-lg px-3 py-3 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none transition-all"
                      >
                        {phoneCountryOptions.map((option) => (
                          <option key={option.code} value={option.code}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <input
                        value={form.phoneNumber}
                        onChange={(e) => {
                          update("phoneNumber", e.target.value);
                          const errors = validateStep0(form.name, form.email, form.company, e.target.value);
                          setFieldErrors((prev) => ({ ...prev, phoneNumber: errors.phoneNumber }));
                        }}
                        className="w-full bg-background/50 border border-border rounded-lg px-4 py-3 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none transition-all"
                        placeholder="Phone number"
                      />
                    </div>
                    {fieldErrors.phoneNumber && <p className="text-xs text-red-500 mt-1">{fieldErrors.phoneNumber}</p>}
                  </div>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-foreground">Project Details</h2>
                <p className="text-muted-foreground text-sm">What are you looking to build?</p>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Project Type *</label>
                  <div className="grid grid-cols-2 gap-2">
                    {projectTypes.map((t) => (
                      <button
                        type="button"
                        key={t}
                        onClick={() => {
                          update("projectType", t);
                          if (t !== "Other") update("projectTypeOther", "");
                          const errors = validateStep1(t, t === "Other" ? form.projectTypeOther : "", form.budget, form.customBudget);
                          setFieldErrors((prev) => ({ ...prev, projectTypeOther: errors.projectTypeOther }));
                        }}
                        className={`btn-tag justify-start text-left text-sm px-4 py-3 rounded-lg ${form.projectType === t ? "border-primary bg-primary/20 text-foreground" : "text-muted-foreground"}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                  {form.projectType === "Other" && (
                    <div className="mt-3">
                      <input
                        value={form.projectTypeOther}
                        onChange={(e) => {
                          update("projectTypeOther", e.target.value);
                          const errors = validateStep1(form.projectType, e.target.value, form.budget, form.customBudget);
                          setFieldErrors((prev) => ({ ...prev, projectTypeOther: errors.projectTypeOther }));
                        }}
                        className="w-full bg-background/50 border border-border rounded-lg px-4 py-3 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none transition-all"
                        placeholder="Please specify your project type"
                      />
                      {fieldErrors.projectTypeOther && <p className="text-xs text-red-500 mt-1">{fieldErrors.projectTypeOther}</p>}
                    </div>
                  )}
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm text-muted-foreground block">Budget Range *</label>
                    <div className="inline-flex rounded-lg border border-border overflow-hidden">
                      {(["USD", "INR"] as const).map((currency) => (
                        <button
                          key={currency}
                          type="button"
                          onClick={() => {
                            update("budgetCurrency", currency);
                            update("budget", "");
                          }}
                          className={`btn-tag px-3 py-1.5 text-xs ${form.budgetCurrency === currency ? "bg-primary/20 text-primary border-primary/40" : "text-muted-foreground"}`}
                        >
                          {currency}
                        </button>
                      ))}
                    </div>
                  </div>
                  <select
                    value={form.budget}
                    onChange={(e) => {
                      update("budget", e.target.value);
                      const errors = validateStep1(form.projectType, form.projectTypeOther, e.target.value, form.customBudget);
                      setFieldErrors((prev) => ({ ...prev, budget: errors.budget }));
                    }}
                    className="w-full bg-background/50 border border-border rounded-lg px-4 py-3 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none transition-all"
                  >
                    <option value="">Select budget range</option>
                    {budgetRangesByCurrency[form.budgetCurrency as keyof typeof budgetRangesByCurrency].map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                  <div className="mt-3">
                    <label className="text-xs text-muted-foreground mb-1.5 block">Custom Budget ({form.budgetCurrency})</label>
                    <input
                      value={form.customBudget}
                      onChange={(e) => {
                        update("customBudget", e.target.value);
                        const errors = validateStep1(form.projectType, form.projectTypeOther, form.budget, e.target.value);
                        setFieldErrors((prev) => ({ ...prev, budget: errors.budget }));
                      }}
                      className="w-full bg-background/50 border border-border rounded-lg px-4 py-3 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none transition-all"
                      placeholder={form.budgetCurrency === "INR" ? "e.g. 2500000" : "e.g. 25000"}
                    />
                    {fieldErrors.budget && <p className="text-xs text-red-500 mt-1">{fieldErrors.budget}</p>}
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-foreground">Schedule a Call</h2>
                <p className="text-muted-foreground text-sm">Pick a date and time for a discovery call (optional).</p>
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1">
                    <label className="text-sm text-muted-foreground mb-2 block flex items-center gap-2">
                      <CalendarIcon className="w-3.5 h-3.5" /> Select Date
                    </label>
                    <Calendar
                      mode="single"
                      selected={form.meetingDate}
                      onSelect={(d) => update("meetingDate", d)}
                      disabled={(date) => date < new Date()}
                      className="p-3 pointer-events-auto rounded-lg border border-border bg-background/50"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-sm text-muted-foreground mb-2 block flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5" /> Select Time
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {timeSlots.map((t) => (
                        <button
                          type="button"
                          key={t}
                          onClick={() => update("meetingTime", t)}
                          className={`btn-tag text-sm px-3 py-2.5 rounded-lg ${form.meetingTime === t ? "border-primary bg-primary/20 text-foreground" : "text-muted-foreground"}`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                    {form.meetingDate && form.meetingTime && (
                      <p className="mt-4 text-xs text-primary">
                        {format(form.meetingDate, "MMMM d, yyyy")} at {form.meetingTime}
                      </p>
                    )}
                  </div>
                </div>
                <div className="pt-2">
                  <h3 className="text-lg font-semibold text-foreground mb-2">Describe Your Vision *</h3>
                  <p className="text-muted-foreground text-sm mb-3">Tell us what you want to achieve.</p>
                  <textarea
                    value={form.description}
                    onChange={(e) => {
                      update("description", e.target.value);
                      setFieldErrors((prev) => ({ ...prev, description: validateStep3(e.target.value) }));
                    }}
                    rows={6}
                    className="w-full bg-background/50 border border-border rounded-lg px-4 py-3 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none transition-all resize-none"
                    placeholder="Describe your project goals, target audience, key features, timeline expectations..."
                  />
                  <div className="mt-4">
                    <label className="text-sm text-muted-foreground mb-1.5 block">Project Image (optional)</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => update("projectImage", e.target.files?.[0] || null)}
                      className="w-full bg-background/50 border border-border rounded-lg px-4 py-3 text-sm text-foreground file:mr-3 file:px-3 file:py-1.5 file:rounded file:border-0 file:bg-primary/20 file:text-primary"
                    />
                  </div>
                  {fieldErrors.description && <p className="text-xs text-red-500 mt-2">{fieldErrors.description}</p>}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {submitError && (
          <p className="mt-6 text-sm font-medium text-red-500">{submitError}</p>
        )}

        <div className="flex justify-between mt-8">
          <button
            type="button"
            onClick={() => setStep((s) => s - 1)}
            disabled={step === 0 || isSubmitting}
            className="btn-ghost text-sm disabled:opacity-30"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          {step < steps.length - 1 ? (
            <button
              type="button"
              onClick={() => {
                if (!validateCurrentStepAndSetErrors()) return;
                setStep((s) => s + 1);
              }}
              disabled={!canNext() || isSubmitting}
              className="btn-primary text-sm disabled:opacity-40"
            >
              Next <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canNext() || isSubmitting}
              className="btn-primary text-sm disabled:opacity-40"
            >
              {isSubmitting ? "Submitting..." : "Submit Project"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LaunchProject;
