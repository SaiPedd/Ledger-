import { Router } from "express";
import db from "../db";

const router = Router();

/**
 * IMPORTANT: This is an educational/illustrative simulation, not financial advice.
 * It uses fixed, widely-cited historical averages for a broad stock market index
 * (roughly ~10% average annual return, ~18% annual volatility) so the app has
 * zero external API dependency — no live market data to keep alive or break.
 * These constants are clearly surfaced to the user, not hidden.
 */
const ASSUMED_ANNUAL_RETURN = 0.10;
const ASSUMED_ANNUAL_VOLATILITY = 0.18;

function monthlyProjection(scenario: {
  monthly_income: number;
  monthly_expenses: number;
  one_time_future_expense: number;
  future_expense_month: number;
  invest_instead_amount: number;
  horizon_months: number;
}) {
  const {
    monthly_income,
    monthly_expenses,
    one_time_future_expense,
    future_expense_month,
    invest_instead_amount,
    horizon_months,
  } = scenario;

  const monthlyReturn = ASSUMED_ANNUAL_RETURN / 12;
  const monthlyVol = ASSUMED_ANNUAL_VOLATILITY / Math.sqrt(12);

  let cashBalance = 0;
  let investedBalance = 0;
  const months = [];

  for (let m = 1; m <= horizon_months; m++) {
    const netCashFlow = monthly_income - monthly_expenses - invest_instead_amount;
    cashBalance += netCashFlow;

    if (m === future_expense_month && one_time_future_expense > 0) {
      cashBalance -= one_time_future_expense;
    }

    // Illustrative best/worst/expected case for the "invested instead" portion
    investedBalance =
      (investedBalance + invest_instead_amount) * (1 + monthlyReturn);

    months.push({
      month: m,
      cashBalance: Math.round(cashBalance),
      investedExpected: Math.round(investedBalance),
      investedBest: Math.round(investedBalance * (1 + monthlyVol * 1.5)),
      investedWorst: Math.round(investedBalance * (1 - monthlyVol * 1.5)),
    });
  }

  return months;
}

function assumptionsPayload() {
  return {
    note: "Illustrative only, based on fixed historical averages — not a prediction or personalized advice.",
    assumedAnnualReturn: ASSUMED_ANNUAL_RETURN,
    assumedAnnualVolatility: ASSUMED_ANNUAL_VOLATILITY,
  };
}

// GET /api/scenarios — list saved scenarios
router.get("/", (_req, res) => {
  const rows = db.prepare("SELECT * FROM scenarios ORDER BY id DESC").all();
  res.json(rows);
});

// GET /api/scenarios/:id — recompute and return a past scenario's projection
router.get("/:id", (req, res) => {
  const scenario = db.prepare("SELECT * FROM scenarios WHERE id = ?").get(req.params.id) as any;
  if (!scenario) return res.status(404).json({ error: "Scenario not found" });

  const projection = monthlyProjection(scenario);
  res.json({
    id: scenario.id,
    projection,
    assumptions: assumptionsPayload(),
  });
});

// POST /api/scenarios — create + immediately return its projection
router.post("/", (req, res) => {
  const {
    name,
    monthly_income,
    monthly_expenses,
    one_time_future_expense = 0,
    future_expense_month = 0,
    invest_instead_amount = 0,
    horizon_months = 12,
  } = req.body;

  if (!name || monthly_income === undefined || monthly_expenses === undefined) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const stmt = db.prepare(
    `INSERT INTO scenarios
      (name, monthly_income, monthly_expenses, one_time_future_expense, future_expense_month, invest_instead_amount, horizon_months)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  );
  const info = stmt.run(
    name,
    monthly_income,
    monthly_expenses,
    one_time_future_expense,
    future_expense_month,
    invest_instead_amount,
    horizon_months
  );

  const projection = monthlyProjection({
    monthly_income,
    monthly_expenses,
    one_time_future_expense,
    future_expense_month,
    invest_instead_amount,
    horizon_months,
  });

  res.status(201).json({
    id: info.lastInsertRowid,
    projection,
    assumptions: assumptionsPayload(),
  });
});

export default router;
