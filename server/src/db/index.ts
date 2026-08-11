import Database from "better-sqlite3";
import path from "path";

// Single SQLite file — zero setup, zero maintenance.
// Swap this file path for a real Postgres connection later if you ever deploy for real.
const db = new Database(path.join(__dirname, "../../data.sqlite"));

db.pragma("journal_mode = WAL");

// --- Schema ---
// Kept deliberately small and modular: each table maps to one feature area,
// so adding a new feature later means adding a new table, not touching these.

db.exec(`
  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    description TEXT NOT NULL,
    amount REAL NOT NULL,          -- negative = expense, positive = income
    category TEXT NOT NULL,
    date TEXT NOT NULL,            -- ISO date string
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS scenarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    monthly_income REAL NOT NULL,
    monthly_expenses REAL NOT NULL,
    one_time_future_expense REAL DEFAULT 0,
    future_expense_month INTEGER DEFAULT 0,  -- months from now
    invest_instead_amount REAL DEFAULT 0,     -- monthly amount hypothetically invested
    horizon_months INTEGER NOT NULL DEFAULT 12,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS lifestyle_goals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    target_monthly_cost REAL NOT NULL,
    current_monthly_income REAL NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS debts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    balance REAL NOT NULL,
    apr REAL NOT NULL,               -- annual percentage rate, e.g. 0.22 for 22%
    minimum_payment REAL NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

export default db;
