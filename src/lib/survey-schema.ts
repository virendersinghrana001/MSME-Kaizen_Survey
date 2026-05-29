import { z } from "zod";

const rating = z.coerce.number().int().min(1).max(5);

export const surveySchema = z.object({
  full_name: z.string().trim().min(1, "Required").max(120),
  email: z.string().trim().email().max(255),
  company: z.string().trim().min(1, "Required").max(160),
  industry: z.string().trim().max(120).optional().or(z.literal("")),

  understood_kaizen: rating,
  understood_dmaic: rating,
  understood_gemba: rating,
  understood_5s: rating,
  understood_pokayoke: rating,
  confidence_to_apply: rating,
  key_takeaway: z.string().trim().max(1000).optional().or(z.literal("")),

  opportunities: z.string().trim().max(2000).optional().or(z.literal("")),
});

export type SurveyInput = z.infer<typeof surveySchema>;
