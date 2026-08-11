import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Trash2 } from "lucide-react";
import { api } from "../api/client";
import Card from "../components/Card";
import StatPill from "../components/StatPill";
import { formatCurrency } from "../lib/format";

interface Debt {
  id: number;
  name: string;
  balance: number;
  apr: number;
  minimum_payment: number;
}

interface StrategyResult {
  monthsToPayoff: number | null;
  totalInterestPaid: number;
  payoffOrder: string[];
  balanceOverTime: { month: number; totalBalance: number }[];
  payoffImpossible: boolean;
}

interface PayoffPlan {
  avalanche: StrategyResult;
  snowball: StrategyResult;
  note: string;
}

const inputClass =
  "w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500";
const labelClass = "mb-1 block text-xs font-medium text-slate-400";

function StrategyCard({ title, result }: { title: string; result: StrategyResult }) {
  return (
    <Card title={title}>
      {result.payoffImpossible ? (
        <p className="text-sm text-rose-400">
          Not paid off within 50 years at this payment level — your budget isn't covering the interest.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <StatPill
              label="Debt-free in"
              value={`${result.monthsToPayoff} mo`}
            />
            <StatPill label="Total interest paid" value={formatCurrency(result.totalInterestPaid)} />
          </div>
          <div className="mt-4">
            <div className="mb-1 text-xs font-medium text-slate-400">Payoff order</div>
            <ol className="list-inside list-decimal text-sm text-slate-300">
              {result.payoffOrder.map((name) => (
                <li key={name}>{name}</li>
              ))}
            </ol>
          </div>
        </>
      )}
    </Card>
  );
}

export default function DebtPayoff() {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", balance: "", apr: "", minimum_payment: "" });
  const [extraPayment, setExtraPayment] = useState("0");
  const [plan, setPlan] = useState<PayoffPlan | null>(null);
  const [planError, setPlanError] = useState<string | null>(null);

  async function refresh() {
    setDebts(await api.getDebts());
    setLoading(false);
  }

  useEffect(() => {
    refresh();
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    await api.addDebt({
      name: form.name,
      balance: parseFloat(form.balance),
      apr: (parseFloat(form.apr) || 0) / 100,
      minimum_payment: parseFloat(form.minimum_payment),
    });
    setForm({ name: "", balance: "", apr: "", minimum_payment: "" });
    setPlan(null);
    refresh();
  }

  async function handleDelete(id: number) {
    await api.deleteDebt(id);
    setPlan(null);
    refresh();
  }

  async function handleCalculate() {
    setPlanError(null);
    try {
      const res = await api.getPayoffPlan({ extraMonthlyPayment: parseFloat(extraPayment) || 0 });
      setPlan(res);
    } catch {
      setPlanError("Add at least one debt before calculating a payoff plan.");
    }
  }

  const chartData = plan
    ? plan.avalanche.balanceOverTime.map((row, i) => ({
        month: row.month,
        avalanche: row.totalBalance,
        snowball: plan.snowball.balanceOverTime[i]?.totalBalance ?? 0,
      }))
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Debt Payoff Calculator</h1>
        <p className="mt-1 text-sm text-slate-400">
          Compare avalanche (highest APR first) vs. snowball (smallest balance first) payoff strategies.
        </p>
      </div>

      <Card title="Add a debt">
        <form onSubmit={handleAdd} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={labelClass}>Name (e.g. "Chase Sapphire", "Federal loan")</label>
            <input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div>
            <label className={labelClass}>Current balance</label>
            <input className={inputClass} type="number" step="0.01" value={form.balance} onChange={(e) => setForm({ ...form, balance: e.target.value })} required />
          </div>
          <div>
            <label className={labelClass}>APR (%)</label>
            <input className={inputClass} type="number" step="0.01" value={form.apr} onChange={(e) => setForm({ ...form, apr: e.target.value })} required />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Minimum monthly payment</label>
            <input className={inputClass} type="number" step="0.01" value={form.minimum_payment} onChange={(e) => setForm({ ...form, minimum_payment: e.target.value })} required />
          </div>
          <div className="sm:col-span-2">
            <button type="submit" className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-600">
              Add debt
            </button>
          </div>
        </form>
      </Card>

      <Card title="Your debts">
        {loading ? (
          <p className="text-sm text-slate-500">Loading…</p>
        ) : debts.length === 0 ? (
          <p className="text-sm text-slate-500">No debts added yet — add one above.</p>
        ) : (
          <div className="divide-y divide-slate-800">
            {debts.map((d) => (
              <div key={d.id} className="flex items-center justify-between py-2.5 text-sm">
                <span className="text-slate-300">
                  {d.name}{" "}
                  <span className="text-slate-500">
                    — {formatCurrency(d.balance)} @ {(d.apr * 100).toFixed(1)}%, {formatCurrency(d.minimum_payment)}/mo min
                  </span>
                </span>
                <button
                  onClick={() => handleDelete(d.id)}
                  className="text-slate-500 transition-colors hover:text-rose-400"
                  aria-label="Delete debt"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="mt-5 flex flex-wrap items-end gap-4 border-t border-slate-800 pt-5">
          <div>
            <label className={labelClass}>Extra monthly payment (on top of minimums)</label>
            <input
              className={`${inputClass} w-48`}
              type="number"
              step="0.01"
              value={extraPayment}
              onChange={(e) => setExtraPayment(e.target.value)}
            />
          </div>
          <button
            onClick={handleCalculate}
            disabled={debts.length === 0}
            className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Calculate payoff plan
          </button>
        </div>
        {planError && <p className="mt-2 text-sm text-rose-400">{planError}</p>}
      </Card>

      {plan && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <StrategyCard title="Avalanche (highest APR first)" result={plan.avalanche} />
            <StrategyCard title="Snowball (smallest balance first)" result={plan.snowball} />
          </div>

          <Card title="Total balance over time">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <XAxis dataKey="month" stroke="#64748b" label={{ value: "Month", position: "insideBottom", offset: -5, fill: "#64748b" }} />
                <YAxis stroke="#64748b" />
                <Tooltip
                  contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8 }}
                  formatter={(v: number) => formatCurrency(v)}
                />
                <Legend />
                <Line type="monotone" dataKey="avalanche" stroke="#4c6fff" name="Avalanche" dot={false} />
                <Line type="monotone" dataKey="snowball" stroke="#ffd166" name="Snowball" dot={false} />
              </LineChart>
            </ResponsiveContainer>
            <p className="mt-3 text-xs text-slate-500">{plan.note}</p>
          </Card>
        </>
      )}
    </div>
  );
}
