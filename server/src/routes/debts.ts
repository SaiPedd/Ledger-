import { Router } from "express";
import db from "../db";

const router = Router();

// Cap any simulation at 50 years — if a debt isn't cleared by then, the
// payment plan isn't actually covering it (flagged as payoffImpossible),
// not an infinite loop.
const MAX_MONTHS = 600;
const PAID_OFF_EPSILON = 0.01;

interface DebtRow {
  id: number;
  name: string;
  balance: number;
  apr: number; // e.g. 0.22 for 22%
  minimum_payment: number;
}

interface StrategyResult {
  monthsToPayoff: number | null;
  totalInterestPaid: number;
  payoffOrder: string[];
  balanceOverTime: { month: number; totalBalance: number }[];
  payoffImpossible: boolean;
}

/**
 * Simulates payoff month-by-month using a constant total monthly budget
 * (sum of all minimums + any extra payment). As each debt is cleared, its
 * minimum is redirected — not saved — onto the next target debt, in the
 * order the chosen strategy prioritizes (avalanche = highest APR first,
 * snowball = smallest balance first). This is the standard debt-payoff
 * "cascade" method.
 */
function simulate(
  debts: DebtRow[],
  extraMonthlyPayment: number,
  strategy: "avalanche" | "snowball"
): StrategyResult {
  const order = [...debts].sort((a, b) =>
    strategy === "avalanche" ? b.apr - a.apr : a.balance - b.balance
  );

  const remaining = new Map(debts.map((d) => [d.id, d.balance]));
  const totalBudget =
    debts.reduce((sum, d) => sum + d.minimum_payment, 0) + extraMonthlyPayment;

  let totalInterestPaid = 0;
  const paidOffIds = new Set<number>();
  const balanceOverTime: { month: number; totalBalance: number }[] = [];
  let month = 0;
  let payoffImpossible = false;

  while (true) {
    const totalRemaining = [...remaining.values()].reduce((a, b) => a + Math.max(b, 0), 0);
    if (totalRemaining <= 0) break;
    if (month >= MAX_MONTHS) {
      payoffImpossible = true;
      break;
    }
    month++;

    // 1. Accrue interest on every still-active debt.
    for (const d of debts) {
      const bal = remaining.get(d.id)!;
      if (bal <= 0) continue;
      const interest = bal * (d.apr / 12);
      totalInterestPaid += interest;
      remaining.set(d.id, bal + interest);
    }

    // 2. Pay each active debt's minimum; track what's left of the fixed budget.
    let leftover = totalBudget;
    for (const d of debts) {
      const bal = remaining.get(d.id)!;
      if (bal <= 0) continue;
      const payment = Math.min(d.minimum_payment, bal);
      remaining.set(d.id, bal - payment);
      leftover -= payment;
    }

    // 3. Cascade whatever's left (extra payment + freed-up minimums) onto
    //    the target debt(s), in strategy order.
    for (const d of order) {
      if (leftover <= 0) break;
      const bal = remaining.get(d.id)!;
      if (bal <= 0) continue;
      const payment = Math.min(leftover, bal);
      remaining.set(d.id, bal - payment);
      leftover -= payment;
    }

    // 4. Clamp near-zero balances and record payoff order.
    for (const d of order) {
      const bal = remaining.get(d.id)!;
      if (bal > 0 && bal < PAID_OFF_EPSILON) remaining.set(d.id, 0);
      if (remaining.get(d.id) === 0 && !paidOffIds.has(d.id)) paidOffIds.add(d.id);
    }

    balanceOverTime.push({
      month,
      totalBalance: Math.round(
        [...remaining.values()].reduce((a, b) => a + Math.max(b, 0), 0)
      ),
    });
  }

  const payoffOrder = order
    .filter((d) => paidOffIds.has(d.id))
    .map((d) => d.name);

  return {
    monthsToPayoff: payoffImpossible ? null : month,
    totalInterestPaid: Math.round(totalInterestPaid),
    payoffOrder,
    balanceOverTime,
    payoffImpossible,
  };
}

// GET /api/debts — list debts
router.get("/", (_req, res) => {
  const rows = db.prepare("SELECT * FROM debts ORDER BY id DESC").all();
  res.json(rows);
});

// POST /api/debts — add a debt
router.post("/", (req, res) => {
  const { name, balance, apr, minimum_payment } = req.body;
  if (!name || balance === undefined || apr === undefined || minimum_payment === undefined) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  const stmt = db.prepare(
    `INSERT INTO debts (name, balance, apr, minimum_payment) VALUES (?, ?, ?, ?)`
  );
  const info = stmt.run(name, balance, apr, minimum_payment);
  res.status(201).json({ id: info.lastInsertRowid });
});

// DELETE /api/debts/:id
router.delete("/:id", (req, res) => {
  db.prepare("DELETE FROM debts WHERE id = ?").run(req.params.id);
  res.status(204).send();
});

// POST /api/debts/payoff-plan — compare avalanche vs. snowball for current debts
router.post("/payoff-plan", (req, res) => {
  const { extraMonthlyPayment = 0 } = req.body;
  const debts = db.prepare("SELECT * FROM debts").all() as DebtRow[];

  if (debts.length === 0) {
    return res.status(400).json({ error: "Add at least one debt first" });
  }

  res.json({
    avalanche: simulate(debts, extraMonthlyPayment, "avalanche"),
    snowball: simulate(debts, extraMonthlyPayment, "snowball"),
    note: "Illustrative amortization based on your entered balances/APRs — not a lender's actual payoff quote or personalized advice.",
  });
});

export default router;
