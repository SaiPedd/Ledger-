# Ledger

A student-focused personal finance visualizer + "what-if" scenario simulator.
Built to be modular and low-maintenance: no external APIs, no bank linking (yet),
just manual entry + illustrative simulations using fixed assumptions.

## Structure
```
server/   Express + TypeScript API, SQLite database (file-based, zero setup)
client/   React + TypeScript frontend (Vite + Tailwind CSS), charts via recharts
```

## Running it locally

### 1. Backend
```bash
cd server
npm install
npm run dev
```
Runs on http://localhost:4000

### 2. Frontend
In a new terminal:
```bash
cd client
npm install
npm run dev
```
Runs on http://localhost:5173 (Vite will print the exact URL) and proxies
`/api` requests to the backend automatically.

## What's built so far (v2)
- **Dashboard** — manually log transactions, see spend-by-category pie chart
- **Scenario Simulator** — "what if" projections: add a future expense, see
  cash balance over time, and an illustrative best/worst-case range if that
  money were invested instead. Past scenarios are saved and can be reopened.
- **Lifestyle Goal Calculator** — input a target monthly cost of living, get
  a rough required income back
- **Debt Payoff Calculator** — track your debts and compare avalanche
  (highest APR first) vs. snowball (smallest balance first) payoff
  strategies: months to debt-free, total interest paid, and a balance-over-time
  chart for both
- **Learn** — static educational content (credit, budgeting, investing basics)

## Important framing
The scenario simulator and debt payoff calculator use **fixed assumptions /
the numbers you enter** (not live market or lender data) so there's nothing
external to break or maintain. All projections are clearly labeled as
illustrative, not predictions or personalized financial advice — this is
intentional scope, not a missing feature, since real personalized
financial/investment advice is a regulated space outside what a student
project should claim to do.

## Natural next steps (pick whichever sounds fun)
- CSV import for transactions (bank export → auto-categorize)
- Budget goals: set a monthly cap per category, get warned when close
- A basic auth layer if you want to deploy this somewhere real
- Swap SQLite for Postgres if you ever want multi-user / cloud deployment
- Monte Carlo simulation for the scenario simulator instead of a fixed
  best/worst multiplier

## Why this stack
- **TypeScript end-to-end** — matches your resume skills, one language across
  frontend/backend
- **SQLite** — a single file, no server process to install or maintain
- **No external financial APIs** — genuinely low-maintenance, nothing to break
  if a free API tier changes or goes away
- **Tailwind CSS** — fast, consistent UI without hand-rolling a design system
