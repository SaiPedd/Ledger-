import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Trash2 } from "lucide-react";
import { api } from "../api/client";
import Card from "../components/Card";
import { formatCurrency, formatDate } from "../lib/format";

interface Transaction {
  id: number;
  description: string;
  amount: number;
  category: string;
  date: string;
}

interface CategorySummary {
  category: string;
  total: number;
  count: number;
}

const CATEGORIES = ["Food", "Rent", "Transport", "Subscriptions", "Entertainment", "Income", "Other"];
const COLORS = ["#4c6fff", "#ff6b6b", "#ffd166", "#06d6a0", "#c77dff", "#f77f00"];

const inputClass =
  "w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500";
const labelClass = "mb-1 block text-xs font-medium text-slate-400";

export default function Dashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<CategorySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    description: "",
    amount: "",
    category: "Food",
    date: new Date().toISOString().slice(0, 10),
  });

  async function refresh() {
    const [tx, sum] = await Promise.all([api.getTransactions(), api.getSpendByCategory()]);
    setTransactions(tx);
    setSummary(sum);
    setLoading(false);
  }

  useEffect(() => {
    refresh();
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    await api.addTransaction({
      description: form.description,
      amount: parseFloat(form.amount),
      category: form.category,
      date: form.date,
    });
    setForm({ ...form, description: "", amount: "" });
    refresh();
  }

  async function handleDelete(id: number) {
    await api.deleteTransaction(id);
    refresh();
  }

  const chartData = summary.map((s) => ({ name: s.category, value: Math.abs(s.total) }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-400">Log transactions and see where your money's going.</p>
      </div>

      <Card title="Add a transaction">
        <form onSubmit={handleAdd} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={labelClass}>Description</label>
            <input
              className={inputClass}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              required
            />
          </div>
          <div>
            <label className={labelClass}>Amount (negative = expense, positive = income)</label>
            <input
              className={inputClass}
              type="number"
              step="0.01"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              required
            />
          </div>
          <div>
            <label className={labelClass}>Category</label>
            <select
              className={inputClass}
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Date</label>
            <input
              className={inputClass}
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
          </div>
          <div className="sm:col-span-2">
            <button
              type="submit"
              className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-600"
            >
              Add transaction
            </button>
          </div>
        </form>
      </Card>

      <Card title="Where your money's going">
        {loading ? (
          <p className="text-sm text-slate-500">Loading…</p>
        ) : chartData.length === 0 ? (
          <p className="text-sm text-slate-500">Add a few expenses to see your breakdown.</p>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={chartData} dataKey="value" nameKey="name" outerRadius={90} label>
                {chartData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v: number) => formatCurrency(v)} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </Card>

      <Card title="Recent transactions">
        {loading ? (
          <p className="text-sm text-slate-500">Loading…</p>
        ) : transactions.length === 0 ? (
          <p className="text-sm text-slate-500">No transactions yet — add your first one above.</p>
        ) : (
          <div className="divide-y divide-slate-800">
            {transactions.map((t) => (
              <div key={t.id} className="flex items-center justify-between py-2.5 text-sm">
                <span className="text-slate-300">
                  <span className="text-slate-500">{formatDate(t.date)}</span> — {t.description}{" "}
                  <span className="text-slate-500">({t.category})</span>
                </span>
                <span className="flex items-center gap-3">
                  <span className={t.amount < 0 ? "text-rose-400" : "text-emerald-400"}>
                    {formatCurrency(t.amount)}
                  </span>
                  <button
                    onClick={() => handleDelete(t.id)}
                    className="text-slate-500 transition-colors hover:text-rose-400"
                    aria-label="Delete transaction"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
