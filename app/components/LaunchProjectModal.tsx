import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import MagnetButton from "./MagnetButton";
import { submitLaunchProject } from "@/lib/api";

interface LaunchProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const budgetRanges = ["5,000 - 15,000", "15,000 - 30,000", "Custom"];
const projectTypes = ["Web Development", "DevOps & Automation", "AI / Machine Learning", "Mobile App", "Cybersecurity", "Product Design", "Other"];
const NAME_REGEX = /^[A-Za-z\s.'-]+$/;
const GMAIL_REGEX = /^[A-Za-z0-9._%+-]+@gmail\.com$/i;

const LaunchProjectModal = ({ open, onOpenChange }: LaunchProjectModalProps) => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [fieldErrors, setFieldErrors] = useState({ name: "", email: "", description: "" });
  const [form, setForm] = useState({
    name: "",
    email: "",
    projectType: "",
    budget: "",
    description: "",
  });

  const update = (field: string, value: string) => setForm((p) => ({ ...p, [field]: value }));

  const validateStep1 = (name: string, email: string) => {
    const errors = { name: "", email: "", description: "" };
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

    return errors;
  };

  const validateStep3 = (description: string) => (description.trim().length < 10 ? "Description must be at least 10 characters." : "");

  const validateCurrentStepAndSetErrors = () => {
    if (step === 1) {
      const errors = validateStep1(form.name, form.email);
      setFieldErrors(errors);
      return !errors.name && !errors.email;
    }

    if (step === 3) {
      const descriptionError = validateStep3(form.description);
      setFieldErrors((prev) => ({ ...prev, description: descriptionError }));
      return !descriptionError;
    }

    return true;
  };

  const step1Errors = validateStep1(form.name, form.email);
  const canNext =
    step === 1
      ? !!form.name.trim() && !!form.email.trim() && !step1Errors.name && !step1Errors.email
      : step === 2
        ? !!form.projectType && !!form.budget
        : true;

  const handleSubmit = async () => {
    if (!validateCurrentStepAndSetErrors()) return;
    setIsSubmitting(true);
    setSubmitStatus(null);
    try {
      const result = await submitLaunchProject({
        name: form.name,
        email: form.email,
        projectType: form.projectType,
        budget: form.budget,
        description: form.description,
      });
      setSubmitStatus({
        type: "success",
        message:
          result.message ||
          "Project request validated and sent to our intake form.",
      });
      setStep(1);
      setForm({ name: "", email: "", projectType: "", budget: "", description: "" });
      onOpenChange(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Project submission failed";
      setSubmitStatus({ type: "error", message });
      console.error("Project submission failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const reset = () => {
    setStep(1);
    setSubmitStatus(null);
    setFieldErrors({ name: "", email: "", description: "" });
    setForm({ name: "", email: "", projectType: "", budget: "", description: "" });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) reset();
        onOpenChange(v);
      }}
    >
      <DialogContent className="glass-strong border-border sm:max-w-lg p-0 overflow-hidden">
        <div className="flex gap-1 px-6 pt-6">
          {[1, 2, 3].map((s) => (
            <div key={s} className={`h-1 flex-1 rounded-full transition-colors duration-300 ${s <= step ? "bg-primary" : "bg-muted"}`} />
          ))}
        </div>

        <div className="px-6 pb-6 pt-4">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-xl font-bold text-foreground">
              {step === 1 && "Tell us about you"}
              {step === 2 && "Project details"}
              {step === 3 && "Describe your vision"}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm">
              {step === 1 && "We'll use this to get in touch."}
              {step === 2 && "Help us understand the scope."}
              {step === 3 && "The more detail, the better."}
            </DialogDescription>
          </DialogHeader>

          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-muted-foreground text-xs uppercase tracking-wider">Full Name</Label>
                <Input
                  value={form.name}
                  onChange={(e) => {
                    update("name", e.target.value);
                    const errors = validateStep1(e.target.value, form.email);
                    setFieldErrors((prev) => ({ ...prev, name: errors.name }));
                  }}
                  placeholder="John Doe"
                  className="bg-muted/30 border-border focus:border-primary focus:ring-primary/20 placeholder:text-muted-foreground/50"
                  maxLength={100}
                />
                {fieldErrors.name && <p className="text-xs text-red-500">{fieldErrors.name}</p>}
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground text-xs uppercase tracking-wider">Gmail Address</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => {
                    update("email", e.target.value);
                    const errors = validateStep1(form.name, e.target.value);
                    setFieldErrors((prev) => ({ ...prev, email: errors.email }));
                  }}
                  placeholder="john@gmail.com"
                  className="bg-muted/30 border-border focus:border-primary focus:ring-primary/20 placeholder:text-muted-foreground/50"
                  maxLength={255}
                />
                {fieldErrors.email && <p className="text-xs text-red-500">{fieldErrors.email}</p>}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-muted-foreground text-xs uppercase tracking-wider">Project Type</Label>
                <Select value={form.projectType} onValueChange={(v) => update("projectType", v)}>
                  <SelectTrigger className="bg-muted/30 border-border focus:border-primary focus:ring-primary/20">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent className="glass-strong border-border">
                    {projectTypes.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground text-xs uppercase tracking-wider">Budget Range</Label>
                <Select value={form.budget} onValueChange={(v) => update("budget", v)}>
                  <SelectTrigger className="bg-muted/30 border-border focus:border-primary focus:ring-primary/20">
                    <SelectValue placeholder="Select budget" />
                  </SelectTrigger>
                  <SelectContent className="glass-strong border-border">
                    {budgetRanges.map((b) => (
                      <SelectItem key={b} value={b}>
                        {b}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-2">
              <Label className="text-muted-foreground text-xs uppercase tracking-wider">Project Description</Label>
              <textarea
                value={form.description}
                onChange={(e) => {
                  update("description", e.target.value);
                  setFieldErrors((prev) => ({ ...prev, description: validateStep3(e.target.value) }));
                }}
                placeholder="Tell us about your project goals, timeline, and any specific requirements..."
                rows={5}
                maxLength={1000}
                className="flex w-full rounded-md border border-border bg-muted/30 px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary resize-none"
              />
              {fieldErrors.description && <p className="text-xs text-red-500">{fieldErrors.description}</p>}
            </div>
          )}

          {submitStatus && (
            <p
              className={`mt-4 text-sm ${submitStatus.type === "success" ? "text-green-500" : "text-red-500"}`}
            >
              {submitStatus.message}
            </p>
          )}

          <div className="flex items-center justify-between mt-8">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                disabled={isSubmitting}
                className="btn-ghost text-sm disabled:opacity-40"
              >
                Back
              </button>
            ) : (
              <div />
            )}
            {step < 3 ? (
              <MagnetButton
                onClick={() => {
                  if (!validateCurrentStepAndSetErrors()) return;
                  if (canNext) {
                    setStep(step + 1);
                  }
                }}
                className={`btn-primary text-sm ${!canNext ? "opacity-40 cursor-not-allowed" : ""}`}
              >
                Continue
              </MagnetButton>
            ) : (
              <MagnetButton onClick={handleSubmit} className="btn-primary text-sm">
                {isSubmitting ? "Submitting..." : "Submit Project"}
              </MagnetButton>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LaunchProjectModal;
