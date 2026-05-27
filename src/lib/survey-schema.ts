import { z } from "zod";

const rating = z.coerce.number().int().min(1).max(5);
const nps = z.coerce.number().int().min(0).max(10);

export const surveySchema = z.object({
  full_name: z.string().trim().min(1, "Required").max(120),
  email: z.string().trim().email().max(255),
  company: z.string().trim().min(1, "Required").max(160),
  role: z.string().trim().max(120).optional().or(z.literal("")),
  msme_size: z.enum(["Micro", "Small", "Medium", "Large"]).optional().or(z.literal("")),
  industry: z.string().trim().max(120).optional().or(z.literal("")),

  rating_content: rating,
  rating_facilitator: rating,
  rating_pace: rating,
  rating_relevance: rating,
  rating_materials: rating,
  overall_nps: nps,

  understood_kaizen: rating,
  understood_dmaic: rating,
  understood_gemba: rating,
  understood_5s: rating,
  understood_pokayoke: rating,
  confidence_to_apply: rating,
  key_takeaway: z.string().trim().max(1000).optional().or(z.literal("")),

  top_defect: z.string().trim().max(300).optional().or(z.literal("")),
  root_cause_hypothesis: z.string().trim().max(500).optional().or(z.literal("")),
  plan_30_days: z.string().trim().max(800).optional().or(z.literal("")),
  plan_60_days: z.string().trim().max(800).optional().or(z.literal("")),
  plan_90_days: z.string().trim().max(800).optional().or(z.literal("")),
  expected_annual_savings_inr: z
    .union([z.coerce.number().min(0).max(100000000), z.literal("")])
    .optional(),
  additional_comments: z.string().trim().max(1000).optional().or(z.literal("")),
});

export type SurveyInput = z.infer<typeof surveySchema>;
