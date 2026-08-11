import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { api } from "../api/client";
import Card from "../components/Card";
import { formatCurrency, formatDate } from "../lib/format";

interface Scenario {
  id: number;
  name: string;
  created_at: string;
}

const inputClass =
  "w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500";
const labelClass = "mb-1 block text-xs font-medium text-slate-400";

export default function ScenarioSimulator() {
  const [form, setForm] = useState({
    name: "",
    monthly_income: "",
    monthly_expenses: "",
    one_time_future_expense: "",
    future_expense_month: "",
    invest_instead_amount: "",
    horizon_months: "12",
  });
  const [result, setResult] = useState<any>(null);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [loadingList, setLoadingList] = useState(true);

  async function refreshList() {
    setScenarios(await api.getScenarios());
    setLoadingList(false);
  }

  useEffect(() => {
    refreshList();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      name: form.name,
      monthly_income: parseFloat(form.monthly_income) || 0,
      monthly_expenses: parseFloat(form.monthly_expenses) || 0,
      one_time_future_expense: parseFloat(form.one_time_future_expense) || 0,
      future_expense_month: parseInt(form.future_expense_month) || 0,
      invest_instead_amount: parseFloat(form.invest_instead_amount) || 0,
      horizon_months: parseInt(form.horizon_months) || 12,
    };
    const res = await api.createScenario(payload);
    setResult(res);
    refreshList();
  }

  async function handleView(id: number) {
    const res = await api.getScenario(id);
    setResult(res);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Scenario Simulator</h1>
        <p className="mt-1 text-sm text-slate-400">
          Model a future expense, or see an illustrative range if that money were invested instead.
        </p>
      </div>

      <Card title="What-if Simulator">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={labelClass}>Scenario name</label>
            <input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div>
            <label className={labelClass}>Monthly income</label>
            <input className={inputClass} type="number" value={form.monthly_income} onChange={(e) => setForm({ ...form, monthly_income: e.target.value })} required />
          </div>
          <div>
            <label className={labelClass}>Monthly expenses</label>
            <input className={inputClass} type="number" value={form.monthly_expenses} onChange={(e) => setForm({ ...form, monthly_expenses: e.target.value })} required />
          </div>
          <div>
            <label className={labelClass}>One-time future expense (e.g. a laptop, a trip)</label>
            <input className={inputClass} type="number" value={form.one_time_future_expense} onChange={(e) => setForm({ ...form, one_time_future_expense: e.target.value })} />
          </div>
          <div>
            <label className={labelClass}>Months from now that expense happens</label>
            <input className={inputClass} type="number" value={form.future_expense_month} onChange={(e) => setForm({ ...form, future_expense_month: e.target.value })} />
          </div>
          <div>
            <label className={labelClass}>Monthly amount to hypothetically invest instead</label>
            <input className={inputClass} type="number" value={form.invest_instead_amount} onChange={(e) => setForm({ ...form, invest_instead_amount: e.target.value })} />
          </div>
          <div>
            <label className={labelClass}>Horizon (months)</label>
            <input className={inputClass} type="number" value={form.horizon_months} onChange={(e) => setForm({ ...form, horizon_months: e.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <button type="submit" className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-600">
              Run simulation
            </button>
          </div>
        </form>
      </Card>

      {result && (
        <Card title="Projection">
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={result.projection}>
              <XAxis dataKey="month" stroke="#64748b" label={{ value: "Month", position: "insideBottom", offset: -5, fill: "#64748b" }} />
              <YAxis stroke="#64748b" />
              <Tooltip
                contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8 }}
                formatter={(v: number) => formatCurrency(v)}
              />
              <Legend />
              <Line type="monotone" dataKey="cashBalance" stroke="#4c6fff" name="Cash balance" />
              <Line type="monotone" dataKey="investedExpected" stroke="#06d6a0" name="Invested (expected)" />
              <Line type="monotone" dataKey="investedBest" stroke="#06d6a0" strokeDasharray="4 4" name="Invested (best case)" />
              <Line type="monotone" dataKey="investedWorst" stroke="#ff6b6b" strokeDasharray="4 4" name="Invested (worst case)" />
            </LineChart>
          </ResponsiveContainer>
          <p className="mt-3 text-xs text-slate-500">
            {result.assumptions.note} Assumed {(result.assumptions.assumedAnnualReturn * 100).toFixed(0)}% avg annual return,{" "}
            {(result.assumptions.assumedAnnualVolatility * 100).toFixed(0)}% volatility.
          </p>
        </Card>
      )}

      <Card title="Past scenarios">
        {loadingList ? (
          <p className="text-sm text-slate-500">Loading…</p>
        ) : scenarios.length === 0 ? (
          <p className="text-sm text-slate-500">No saved scenarios yet — run one above.</p>
        ) : (
          <div className="divide-y divide-slate-800">
            {scenarios.map((s) => (
              <div key={s.id} className="flex items-center justify-between py-2.5 text-sm">
                <span className="text-slate-300">
                  {s.name} <span className="text-slate-500">— {formatDate(s.created_at)}</span>
                </span>
                <button
                  onClick={() => handleView(s.id)}
                  className="rounded-md border border-slate-700 px-2.5 py-1 text-xs font-medium text-slate-300 transition-colors hover:border-brand-500 hover:text-brand-400"
                >
                  View
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
