import { Link } from "react-router-dom";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast, Toaster } from "sonner";
import { CheckCircle2, ClipboardList } from "lucide-react";
import ecoLogo from "@/assets/ecosapienz-logo.png";


import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { supabase } from "@/lib/supabase";
import { surveySchema, type SurveyInput } from "@/lib/survey-schema";

export default function SurveyPageRoute() {
  return <SurveyPage />;
}

const RATING_LABELS = ["1 – Poor", "2", "3", "4", "5 – Excellent"];

function RatingRow({
  label,
  name,
  value,
  onChange,
  error,
}: {
  label: string;
  name: string;
  value: number | undefined;
  onChange: (v: number) => void;
  error?: string;
}) {
  return (
    <div className="grid grid-cols-1 gap-2 py-2 sm:grid-cols-[1fr_auto] sm:items-center">
      <Label htmlFor={name} className="text-sm">
        {label}
      </Label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            type="button"
            key={n}
            aria-label={`${label} – ${RATING_LABELS[n - 1]}`}
            onClick={() => onChange(n)}
            className={`h-9 w-9 rounded-md border text-sm font-medium transition ${
              value === n
                ? "border-primary bg-primary text-primary-foreground"
                : "border-input bg-background hover:bg-accent"
            }`}
          >
            {n}
          </button>
        ))}
      </div>
      {error && <p className="col-span-full text-xs text-destructive">{error}</p>}
    </div>
  );
}

function SurveyPage() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<SurveyInput>({
    resolver: zodResolver(surveySchema),
    defaultValues: {
      full_name: "",
      email: "",
      company: "",
      industry: "",
      understood_kaizen: undefined as unknown as number,
      understood_dmaic: undefined as unknown as number,
      understood_gemba: undefined as unknown as number,
      understood_5s: undefined as unknown as number,
      understood_pokayoke: undefined as unknown as number,
      confidence_to_apply: undefined as unknown as number,
      key_takeaway: "",
      top_defect: "",
      root_cause_hypothesis: "",
      plan_30_days: "",
      plan_60_days: "",
      plan_90_days: "",
      expected_annual_savings_inr: "" as unknown as number,
      additional_comments: "",
    },
  });

  const { register, handleSubmit, watch, setValue, formState } = form;
  const errors = formState.errors;

  const onSubmit = async (data: SurveyInput) => {
    setSubmitting(true);
    const payload = {
      ...data,
      industry: data.industry || null,
      key_takeaway: data.key_takeaway || null,
      top_defect: data.top_defect || null,
      root_cause_hypothesis: data.root_cause_hypothesis || null,
      plan_30_days: data.plan_30_days || null,
      plan_60_days: data.plan_60_days || null,
      plan_90_days: data.plan_90_days || null,
      additional_comments: data.additional_comments || null,
      expected_annual_savings_inr:
        data.expected_annual_savings_inr === ("" as unknown as number) ||
        data.expected_annual_savings_inr === undefined
          ? null
          : Number(data.expected_annual_savings_inr),
    };
    const { error } = await supabase.from("kaizen_survey_responses").insert(payload);
    setSubmitting(false);
    if (error) {
      console.error(error);
      toast.error("Could not submit response. Please try again.");
      return;
    }
    setSubmitted(true);
    toast.success("Thank you - your response was recorded.");
  };

  if (submitted) {
    return (
      <main className="min-h-screen bg-muted/30">
        <Toaster position="top-right" richColors />
        <div className="mx-auto flex min-h-screen max-w-2xl items-center px-4 py-16">
          <Card className="w-full">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <CheckCircle2 className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-2xl">Thank you</CardTitle>
              <CardDescription>
                Your feedback on the Pune MSME Kaizen session has been recorded. The EVOLVE
                programme team will use it to refine future sessions.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button onClick={() => window.location.reload()}>Submit another response</Button>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-muted/30">
      <Toaster position="top-right" richColors />

      <header className="border-b bg-background">
        <div className="mx-auto max-w-3xl px-4 py-8">
          <div className="text-xs font-semibold uppercase tracking-wider text-primary">
            EVOLVE Programme · Kaizen · Lean Six Sigma
          </div>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Post-Session Survey
          </h1>
          <p className="mt-2 text-base text-muted-foreground">
            <span className="font-medium text-foreground">
              How a Pune MSME Cut Defects with Kaizen
            </span>
            . Share your feedback so we can sharpen the next session and help you turn learning
            into shop-floor results.
          </p>
        </div>
      </header>




      <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
          {/* Participant info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ClipboardList className="h-5 w-5" /> Participant information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <Label htmlFor="full_name">Full name *</Label>
                <Input id="full_name" {...register("full_name")} />
                {errors.full_name && (
                  <p className="mt-1 text-xs text-destructive">{errors.full_name.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input id="email" type="email" {...register("email")} />
                {errors.email && (
                  <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="company">Company *</Label>
                <Input id="company" {...register("company")} />
                {errors.company && (
                  <p className="mt-1 text-xs text-destructive">{errors.company.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="industry">Industry</Label>
                <Input id="industry" placeholder="e.g. Auto components" {...register("industry")} />
              </div>
            </CardContent>
          </Card>

          {/* Learning outcomes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Learning outcomes</CardTitle>
              <CardDescription>
                Which of these do you feel would be most relevant for your company?
              </CardDescription>
            </CardHeader>
            <CardContent>
              {[
                ["understood_kaizen", "Kaizen mindset"],
                ["understood_dmaic", "DMAIC (Define · Measure · Analyse · Improve · Control)"],
                ["understood_gemba", "Gemba walk"],
                ["understood_5s", "5S workstation organisation"],
                ["understood_pokayoke", "Poka-Yoke (mistake-proofing)"],
                ["confidence_to_apply", "Confidence to apply this on my shop floor"],
              ].map(([name, label]) => (
                <RatingRow
                  key={name}
                  name={name}
                  label={label}
                  value={watch(name as keyof SurveyInput) as number | undefined}
                  onChange={(v) =>
                    setValue(name as keyof SurveyInput, v as never, { shouldValidate: true })
                  }
                  error={errors[name as keyof SurveyInput]?.message as string | undefined}
                />
              ))}
              <Separator className="my-4" />
              <div>
                <Label htmlFor="key_takeaway">Your single biggest takeaway</Label>
                <Textarea
                  id="key_takeaway"
                  rows={3}
                  placeholder="In your own words…"
                  {...register("key_takeaway")}
                />
              </div>
            </CardContent>
          </Card>

          {/* Action commitments */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Action commitments</CardTitle>
              <CardDescription>
                Turn learning into outcomes - sketch what you'll tackle when you're back at the
                plant.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="top_defect">Top defect / waste you'll attack first</Label>
                <Input
                  id="top_defect"
                  placeholder="e.g. dimensional variation on Op-30 turning"
                  {...register("top_defect")}
                />
              </div>
              <div>
                <Label htmlFor="root_cause_hypothesis">Root-cause hypothesis</Label>
                <Textarea
                  id="root_cause_hypothesis"
                  rows={2}
                  placeholder="e.g. tool-life cycle not tracked; gauge calibration drift"
                  {...register("root_cause_hypothesis")}
                />
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <Label htmlFor="plan_30_days">30-day plan</Label>
                  <Textarea id="plan_30_days" rows={3} {...register("plan_30_days")} />
                </div>
                <div>
                  <Label htmlFor="plan_60_days">60-day plan</Label>
                  <Textarea id="plan_60_days" rows={3} {...register("plan_60_days")} />
                </div>
                <div>
                  <Label htmlFor="plan_90_days">90-day plan</Label>
                  <Textarea id="plan_90_days" rows={3} {...register("plan_90_days")} />
                </div>
              </div>
              <div>
                <Label htmlFor="expected_annual_savings_inr">
                  Expected annual savings (INR)
                </Label>
                <Input
                  id="expected_annual_savings_inr"
                  type="number"
                  min={0}
                  placeholder="e.g. 2800000"
                  {...register("expected_annual_savings_inr")}
                />
              </div>
              <div>
                <Label htmlFor="additional_comments">Anything else?</Label>
                <Textarea id="additional_comments" rows={3} {...register("additional_comments")} />
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col items-center gap-3 pb-6 sm:flex-row sm:justify-between">
            <p className="text-xs text-muted-foreground">
              Your responses are stored securely and used only by the EVOLVE programme team.
            </p>
            <Button type="submit" size="lg" disabled={submitting}>
              {submitting ? "Submitting…" : "Submit response"}
            </Button>
          </div>
        </form>

        <p className="pb-2 text-center text-xs text-muted-foreground">
          Programme team?{" "}
          <Link to="/admin" className="font-medium text-primary hover:underline">
            Admin dashboard
          </Link>
        </p>
      </div>

      <footer className="relative mt-8 overflow-hidden border-t bg-gradient-to-b from-background to-secondary/40">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 left-1/2 h-56 w-[36rem] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl"
        />
        <div className="relative mx-auto flex max-w-3xl flex-col items-center px-4 py-12 text-center">
          <div className="rounded-2xl bg-white px-6 py-4 shadow-xl ring-1 ring-border">
            <img
              src={ecoLogo}
              alt="EcoSapienz - Empowering Sustainable Growth"
              className="h-16 w-auto sm:h-20"
            />
          </div>
          <p className="mt-5 text-sm font-medium text-foreground">
            Thank you for growing with EcoSapienz.
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Empowering Sustainable Growth · Kaizen · Lean Six Sigma · EVOLVE Programme
          </p>
          <p className="mt-4 text-[11px] text-muted-foreground">
            © {new Date().getFullYear()} EcoSapienz. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}

