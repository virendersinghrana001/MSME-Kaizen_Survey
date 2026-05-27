
import { useEffect, useState } from "react";
import { toast, Toaster } from "sonner";
import * as XLSX from "xlsx";
import { Download, LogOut, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { supabase, type SurveyResponse } from "@/lib/supabase";
import ecoLogo from "@/assets/ecosapienz-logo.png";


export default function AdminPageRoute() {
  return <AdminPage />;
}

function AdminPage() {
  const [session, setSession] = useState<Awaited<
    ReturnType<typeof supabase.auth.getSession>
  >["data"]["session"]>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setChecking(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </main>
    );
  }

  return session ? <Dashboard /> : <LoginCard />;
}

function LoginCard() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) toast.error(error.message);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <Toaster position="top-right" richColors />
      <Card className="w-full max-w-sm">
        <CardHeader className="items-center text-center">
          <img src={ecoLogo} alt="EcoSapienz" className="mb-3 h-12 w-auto" />
          <CardTitle>Admin sign in</CardTitle>
          <CardDescription>Programme team only.</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}

function Dashboard() {
  const [rows, setRows] = useState<SurveyResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from("kaizen_survey_responses")
      .select("*")
      .order("created_at", { ascending: false });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setRows((data ?? []) as SurveyResponse[]);
  };

  useEffect(() => {
    load();
  }, []);

  const exportCsv = () => {
    if (!rows.length) return toast.info("Nothing to export yet.");
    const ws = XLSX.utils.json_to_sheet(rows);
    const csv = XLSX.utils.sheet_to_csv(ws);
    downloadBlob(new Blob([csv], { type: "text/csv;charset=utf-8" }), "csv");
  };

  const exportXlsx = () => {
    if (!rows.length) return toast.info("Nothing to export yet.");
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, "Responses");
    const buf = XLSX.write(wb, { type: "array", bookType: "xlsx" });
    downloadBlob(
      new Blob([buf], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }),
      "xlsx",
    );
  };

  const downloadBlob = (blob: Blob, ext: "csv" | "xlsx") => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kaizen-survey-responses-${new Date().toISOString().slice(0, 10)}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const avg = (key: keyof SurveyResponse) => {
    const nums = rows.map((r) => r[key] as number).filter((n) => typeof n === "number");
    if (!nums.length) return "–";
    return (nums.reduce((s, n) => s + n, 0) / nums.length).toFixed(2);
  };

  return (
    <main className="min-h-screen bg-muted/30">
      <Toaster position="top-right" richColors />
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4">
          <div className="flex items-center gap-3">
            <img src={ecoLogo} alt="EcoSapienz" className="h-10 w-auto" />
            <div>
              <h1 className="text-xl font-semibold">Kaizen Survey · Responses</h1>
              <p className="text-xs text-muted-foreground">EVOLVE Programme · Admin dashboard</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={load} disabled={loading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={exportCsv}>
              <Download className="mr-2 h-4 w-4" /> CSV
            </Button>
            <Button size="sm" onClick={exportXlsx}>
              <Download className="mr-2 h-4 w-4" /> Excel
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => supabase.auth.signOut()}
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl space-y-6 px-4 py-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Total responses" value={rows.length.toString()} />
          <Stat label="Avg content rating" value={avg("rating_content")} />
          <Stat label="Avg facilitator" value={avg("rating_facilitator")} />
          <Stat label="Avg NPS (0–10)" value={avg("overall_nps")} />
        </div>

        {error && (
          <Card className="border-destructive">
            <CardContent className="py-4 text-sm text-destructive">
              {error}
              <div className="mt-1 text-xs text-muted-foreground">
                Make sure the table and admin role are set up in Supabase (see the SQL below).
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Responses</CardTitle>
            <CardDescription>Newest first. Use the export buttons to download.</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="text-right">Content</TableHead>
                  <TableHead className="text-right">Facilitator</TableHead>
                  <TableHead className="text-right">NPS</TableHead>
                  <TableHead>Top defect</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                      {new Date(r.created_at).toLocaleString()}
                    </TableCell>
                    <TableCell className="font-medium">{r.full_name}</TableCell>
                    <TableCell>{r.company}</TableCell>
                    <TableCell className="text-xs">{r.email}</TableCell>
                    <TableCell className="text-right">{r.rating_content}</TableCell>
                    <TableCell className="text-right">{r.rating_facilitator}</TableCell>
                    <TableCell className="text-right">{r.overall_nps}</TableCell>
                    <TableCell className="max-w-[280px] truncate text-xs">
                      {r.top_defect ?? "-"}
                    </TableCell>
                  </TableRow>
                ))}
                {!rows.length && !loading && (
                  <TableRow>
                    <TableCell colSpan={8} className="py-12 text-center text-sm text-muted-foreground">
                      No responses yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="py-4">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="mt-1 text-2xl font-semibold">{value}</p>
      </CardContent>
    </Card>
  );
}
