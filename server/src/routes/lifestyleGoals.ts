import { Router } from "express";
import db from "../db";

const router = Router();

// Simple, transparent rule-of-thumb math — no external dependency, easy to explain in an interview.
// Suggests a target income assuming a 20% savings rate on top of covering the target lifestyle cost.
const ASSUMED_SAVINGS_RATE = 0.20;

router.get("/", (_req, res) => {
  const rows = db.prepare("SELECT * FROM lifestyle_goals ORDER BY id DESC").all();
  res.json(rows);
});

router.post("/", (req, res) => {
  const { name, target_monthly_cost, current_monthly_income } = req.body;
  if (!name || target_monthly_cost === undefined || current_monthly_income === undefined) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const requiredIncome = target_monthly_cost / (1 - ASSUMED_SAVINGS_RATE);
  const gap = requiredIncome - current_monthly_income;

  const stmt = db.prepare(
    `INSERT INTO lifestyle_goals (name, target_monthly_cost, current_monthly_income) VALUES (?, ?, ?)`
  );
  const info = stmt.run(name, target_monthly_cost, current_monthly_income);

  res.status(201).json({
    id: info.lastInsertRowid,
    requiredMonthlyIncome: Math.round(requiredIncome),
    monthlyGap: Math.round(gap),
    assumedSavingsRate: ASSUMED_SAVINGS_RATE,
  });
});

export default router;
