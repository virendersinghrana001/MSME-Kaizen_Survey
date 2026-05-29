import { createClient } from "@supabase/supabase-js";

// External Supabase project (shared with Astro Voyage Launch)
const SUPABASE_URL = "https://wgltvbdpqhfngtwmsxou.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_l3LYxBVjlVdtNzzRRg6zoA_QLOA-ch0";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storage: typeof window !== "undefined" ? window.localStorage : undefined,
    storageKey: "kaizen-survey-auth",
  },
});

export type SurveyResponse = {
  id: string;
  created_at: string;
  // Participant
  full_name: string;
  email: string;
  company: string;
  role: string | null;
  msme_size: string | null;
  industry: string | null;
  // Session feedback (1-5) — removed from form; kept nullable for legacy rows
  rating_content: number | null;
  rating_facilitator: number | null;
  rating_pace: number | null;
  rating_relevance: number | null;
  rating_materials: number | null;
  overall_nps: number | null;
  // Learning outcomes
  understood_kaizen: number;
  understood_dmaic: number;
  understood_gemba: number;
  understood_5s: number;
  understood_pokayoke: number;
  confidence_to_apply: number;
  key_takeaway: string | null;
  opportunities: string | null;
  // Action commitments — removed from form; kept nullable for legacy rows
  top_defect: string | null;
  root_cause_hypothesis: string | null;
  plan_30_days: string | null;
  plan_60_days: string | null;
  plan_90_days: string | null;
  expected_annual_savings_inr: number | null;
  additional_comments: string | null;
};
