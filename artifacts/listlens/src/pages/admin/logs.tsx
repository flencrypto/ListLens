import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const SESSION_KEY = "admin_api_key";

interface AiJobLog {
  id: number;
  jobType: string | null;
  userId: string | null;
  promptTokens: number | null;
  completionTokens: number | null;
  estimatedCostPence: number | null;
  model: string | null;
  createdAt: string;
}

interface Aggregates {
  totalRows: number;
  totalCostPence: number;
  totalCostGBP: number;
  avgPromptTokens: number;
  avgCompletionTokens: number;
  byJobType: { jobType: string | null; jobCount: number; totalCostPence: number }[];
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface ApiResponse {
  data: AiJobLog[];
  pagination: Pagination;
  aggregates: Aggregates;
}

function fmt(n: number | null | undefined): string {
  if (n == null) return "—";
  return n.toLocaleString();
}

function fmtGBP(pence: number): string {
  return `£${(pence / 100).toFixed(4)}`;
}

function fmtDate(s: string): string {
  return new Date(s).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function KeyPrompt({ onKey }: { onKey: (k: string) => void }) {
  const [val, setVal] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (val.trim()) onKey(val.trim());
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm brand-card p-8 space-y-5">
        <div>
          <p className="text-cyan-300 text-xs font-mono-hud tracking-[0.2em] uppercase mb-2">
            Mr.FLENS · Admin
          </p>
          <h1 className="text-xl font-bold text-white">Admin Access</h1>
          <p className="text-zinc-400 text-sm mt-1">
            Enter your admin API key to continue.
          </p>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <input
            type="password"
            autoFocus
            placeholder="ADMIN_API_KEY"
            value={val}
            onChange={(e) => setVal(e.target.value)}
            className="w-full rounded-md bg-zinc-900 border border-zinc-700 text-white text-sm px-3 py-2 focus:outline-none focus:border-cyan-700"
          />
          <Button
            type="submit"
            disabled={!val.trim()}
            className="w-full bg-cyan-700 hover:bg-cyan-600 text-white border-0"
          >
            Unlock
          </Button>
        </form>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="brand-card p-4 flex flex-col gap-1">
      <p className="text-xs text-zinc-500 uppercase tracking-wider">{label}</p>
      <p className="text-white text-xl font-bold">{value}</p>
      {sub && <p className="text-zinc-500 text-xs">{sub}</p>}
    </div>
  );
}

export default function AdminLogsPage() {
  const [apiKey, setApiKey] = useState<string>(() => {
    return sessionStorage.getItem(SESSION_KEY) ?? "";
  });
  const [authError, setAuthError] = useState(false);

  const [jobType, setJobType] = useState("");
  const [userId, setUserId] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);
  const limit = 50;

  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = useCallback(
    async (key: string, pg: number) => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        params.set("limit", String(limit));
        params.set("page", String(pg));
        if (jobType) params.set("jobType", jobType);
        if (userId) params.set("userId", userId);
        if (from) params.set("from", from);
        if (to) params.set("to", `${to}T23:59:59`);

        const res = await fetch(`/api/admin/ai-job-logs?${params}`, {
          headers: { "x-admin-key": key },
        });

        if (res.status === 401) {
          setAuthError(true);
          sessionStorage.removeItem(SESSION_KEY);
          setApiKey("");
          return;
        }
        if (!res.ok) {
          const body = (await res.json().catch(() => ({}))) as { error?: string };
          setError(body.error ?? `Error ${res.status}`);
          return;
        }

        const json = (await res.json()) as ApiResponse;
        setData(json);
        setAuthError(false);
      } catch {
        setError("Network error — could not reach the API.");
      } finally {
        setLoading(false);
      }
    },
    [jobType, userId, from, to],
  );

  useEffect(() => {
    if (!apiKey) return;
    fetchLogs(apiKey, page);
  }, [apiKey, page, fetchLogs]);

  function handleKeyProvided(k: string) {
    sessionStorage.setItem(SESSION_KEY, k);
    setApiKey(k);
    setPage(1);
  }

  function handleFilter(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    fetchLogs(apiKey, 1);
  }

  function clearFilters() {
    setJobType("");
    setUserId("");
    setFrom("");
    setTo("");
    setPage(1);
  }

  function signOut() {
    sessionStorage.removeItem(SESSION_KEY);
    setApiKey("");
    setData(null);
  }

  if (!apiKey || authError) {
    return (
      <div className="space-y-0">
        {authError && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-red-950 border border-red-700 text-red-300 text-sm px-4 py-2 rounded-lg shadow-lg">
            Invalid key — try again.
          </div>
        )}
        <KeyPrompt onKey={handleKeyProvided} />
      </div>
    );
  }

  const agg = data?.aggregates;
  const pagination = data?.pagination;
  const rows = data?.data ?? [];

  const totalPages = pagination?.totalPages ?? 1;
  const currentPage = pagination?.page ?? 1;

  return (
    <div className="min-h-screen bg-zinc-950">
      <header className="border-b border-zinc-800 bg-zinc-950 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <p className="text-cyan-300 text-xs font-mono-hud tracking-[0.2em] uppercase">
              Mr.FLENS
            </p>
            <span className="text-zinc-700">/</span>
            <p className="text-white text-sm font-semibold">Admin · AI Job Logs</p>
          </div>
          <button
            onClick={signOut}
            className="text-xs text-zinc-500 hover:text-red-400 transition-colors"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Summary stats */}
        {agg && (
          <section className="space-y-3">
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Summary{" "}
              {(jobType || userId || from || to) && (
                <span className="text-cyan-500 normal-case font-normal">
                  (filtered)
                </span>
              )}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatCard label="Total jobs" value={fmt(agg.totalRows)} />
              <StatCard
                label="Total cost"
                value={fmtGBP(agg.totalCostPence)}
                sub={`${agg.totalCostPence}p`}
              />
              <StatCard
                label="Avg prompt tokens"
                value={fmt(agg.avgPromptTokens)}
              />
              <StatCard
                label="Avg completion tokens"
                value={fmt(agg.avgCompletionTokens)}
              />
            </div>

            {agg.byJobType.length > 0 && (
              <div className="brand-card p-4">
                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-3">
                  Cost by job type
                </p>
                <div className="flex flex-wrap gap-2">
                  {agg.byJobType.map((jt) => (
                    <div
                      key={jt.jobType ?? "unknown"}
                      className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2"
                    >
                      <Badge variant="secondary" className="text-xs shrink-0">
                        {jt.jobType ?? "unknown"}
                      </Badge>
                      <span className="text-white text-sm font-medium">
                        {jt.jobCount} jobs
                      </span>
                      <span className="text-zinc-500 text-xs">
                        {fmtGBP(jt.totalCostPence)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* Filters */}
        <section className="brand-card p-4">
          <form onSubmit={handleFilter} className="space-y-4">
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Filters
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs text-zinc-400 mb-1">
                  Job type
                </label>
                <input
                  type="text"
                  placeholder="e.g. studio_analyse"
                  value={jobType}
                  onChange={(e) => setJobType(e.target.value)}
                  className="w-full rounded-md bg-zinc-900 border border-zinc-700 text-white text-sm px-3 py-2 focus:outline-none focus:border-cyan-700"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">
                  User ID
                </label>
                <input
                  type="text"
                  placeholder="user_…"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className="w-full rounded-md bg-zinc-900 border border-zinc-700 text-white text-sm px-3 py-2 focus:outline-none focus:border-cyan-700"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">From</label>
                <input
                  type="date"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="w-full rounded-md bg-zinc-900 border border-zinc-700 text-white text-sm px-3 py-2 focus:outline-none focus:border-cyan-700"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">To</label>
                <input
                  type="date"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="w-full rounded-md bg-zinc-900 border border-zinc-700 text-white text-sm px-3 py-2 focus:outline-none focus:border-cyan-700"
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                type="submit"
                size="sm"
                className="bg-cyan-700 hover:bg-cyan-600 text-white border-0"
                disabled={loading}
              >
                {loading ? "Loading…" : "Apply filters"}
              </Button>
              {(jobType || userId || from || to) && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  Clear filters
                </button>
              )}
            </div>
          </form>
        </section>

        {/* Error state */}
        {error && (
          <div className="rounded-lg border border-red-900/50 bg-red-950/20 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* Logs table */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Logs
              {pagination && (
                <span className="text-zinc-600 normal-case font-normal ml-2">
                  ({pagination.total.toLocaleString()} total)
                </span>
              )}
            </p>
            {loading && (
              <span className="text-xs text-zinc-500 animate-pulse">
                Fetching…
              </span>
            )}
          </div>

          {rows.length === 0 && !loading ? (
            <div className="brand-card p-8 text-center text-zinc-500 text-sm">
              No logs found for the current filters.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-zinc-800">
              <table className="w-full text-sm text-left">
                <thead className="bg-zinc-900 text-zinc-400 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3">Job type</th>
                    <th className="px-4 py-3">User ID</th>
                    <th className="px-4 py-3">Model</th>
                    <th className="px-4 py-3 text-right">Prompt tk</th>
                    <th className="px-4 py-3 text-right">Comp tk</th>
                    <th className="px-4 py-3 text-right">Cost (p)</th>
                    <th className="px-4 py-3">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {rows.map((row) => (
                    <tr
                      key={row.id}
                      className="bg-zinc-950 hover:bg-zinc-900 transition-colors"
                    >
                      <td className="px-4 py-3 text-zinc-500 font-mono text-xs">
                        {row.id}
                      </td>
                      <td className="px-4 py-3">
                        {row.jobType ? (
                          <Badge variant="secondary" className="text-xs">
                            {row.jobType}
                          </Badge>
                        ) : (
                          <span className="text-zinc-600">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-zinc-400 font-mono text-xs max-w-[140px] truncate">
                        {row.userId ?? <span className="text-zinc-600">—</span>}
                      </td>
                      <td className="px-4 py-3 text-zinc-400 text-xs">
                        {row.model ?? <span className="text-zinc-600">—</span>}
                      </td>
                      <td className="px-4 py-3 text-right text-zinc-300">
                        {fmt(row.promptTokens)}
                      </td>
                      <td className="px-4 py-3 text-right text-zinc-300">
                        {fmt(row.completionTokens)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {row.estimatedCostPence != null ? (
                          <span className="text-emerald-400 font-medium">
                            {row.estimatedCostPence}p
                          </span>
                        ) : (
                          <span className="text-zinc-600">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-zinc-500 text-xs whitespace-nowrap">
                        {fmtDate(row.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-1">
              <p className="text-xs text-zinc-500">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={currentPage <= 1 || loading}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={currentPage >= totalPages || loading}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
