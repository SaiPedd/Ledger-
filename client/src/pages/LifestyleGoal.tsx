import { useEffect, useState } from "react";
import { api } from "../api/client";
import Card from "../components/Card";
import StatPill from "../components/StatPill";
import { formatCurrency, formatDate } from "../lib/format";

interface Goal {
  id: number;
  name: string;
  target_monthly_cost: number;
  current_monthly_income: number;
  created_at: string;
}

const inputClass =
  "w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500";
const labelClass = "mb-1 block text-xs font-medium text-slate-400";

export default function LifestyleGoal() {
  const [form, setForm] = useState({
    name: "",
    target_monthly_cost: "",
    current_monthly_income: "",
  });
  const [result, setResult] = useState<any>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loadingList, setLoadingList] = useState(true);

  async function refreshList() {
    setGoals(await api.getLifestyleGoals());
    setLoadingList(false);
  }

  useEffect(() => {
    refreshList();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await api.createLifestyleGoal({
      name: form.name,
      target_monthly_cost: parseFloat(form.target_monthly_cost) || 0,
      current_monthly_income: parseFloat(form.current_monthly_income) || 0,
    });
    setResult(res);
    refreshList();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Lifestyle Goal Calculator</h1>
        <p className="mt-1 text-sm text-slate-400">
          Describe the lifestyle you want, and see roughly what income gets you there.
        </p>
      </div>

      <Card title="Set a goal">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={labelClass}>Goal name (e.g. "Post-grad apartment in the city")</label>
            <input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div>
            <label className={labelClass}>Target monthly cost of that lifestyle</label>
            <input className={inputClass} type="number" value={form.target_monthly_cost} onChange={(e) => setForm({ ...form, target_monthly_cost: e.target.value })} required />
          </div>
          <div>
            <label className={labelClass}>Your current monthly income</label>
            <input className={inputClass} type="number" value={form.current_monthly_income} onChange={(e) => setForm({ ...form, current_monthly_income: e.target.value })} required />
          </div>
          <div className="sm:col-span-2">
            <button type="submit" className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-600">
              Calculate
            </button>
          </div>
        </form>
      </Card>

      {result && (
        <Card title="Result">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <StatPill label="Required monthly income" value={formatCurrency(result.requiredMonthlyIncome)} />
            <StatPill
              label={result.monthlyGap > 0 ? "Gap — you'd need" : "Surplus"}
              value={formatCurrency(Math.abs(result.monthlyGap))}
              tone={result.monthlyGap > 0 ? "bad" : "good"}
            />
          </div>
          <p className="mt-3 text-xs text-slate-500">
            Assumes a {(result.assumedSavingsRate * 100).toFixed(0)}% savings rate — simple rule-of-thumb math, not personalized financial advice.
          </p>
        </Card>
      )}

      <Card title="Past goals">
        {loadingList ? (
          <p className="text-sm text-slate-500">Loading…</p>
        ) : goals.length === 0 ? (
          <p className="text-sm text-slate-500">No saved goals yet — calculate one above.</p>
        ) : (
          <div className="divide-y divide-slate-800">
            {goals.map((g) => (
              <div key={g.id} className="flex items-center justify-between py-2.5 text-sm">
                <span className="text-slate-300">
                  {g.name} <span className="text-slate-500">— {formatDate(g.created_at)}</span>
                </span>
                <span className="text-slate-400">{formatCurrency(g.target_monthly_cost)}/mo target</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
