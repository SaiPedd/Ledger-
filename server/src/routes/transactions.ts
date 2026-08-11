import { Router } from "express";
import db from "../db";

const router = Router();

// GET /api/transactions — list all, most recent first
router.get("/", (_req, res) => {
  const rows = db
    .prepare("SELECT * FROM transactions ORDER BY date DESC, id DESC")
    .all();
  res.json(rows);
});

// POST /api/transactions — add one
router.post("/", (req, res) => {
  const { description, amount, category, date } = req.body;
  if (!description || amount === undefined || !category || !date) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  const stmt = db.prepare(
    `INSERT INTO transactions (description, amount, category, date) VALUES (?, ?, ?, ?)`
  );
  const info = stmt.run(description, amount, category, date);
  res.status(201).json({ id: info.lastInsertRowid });
});

// DELETE /api/transactions/:id
router.delete("/:id", (req, res) => {
  db.prepare("DELETE FROM transactions WHERE id = ?").run(req.params.id);
  res.status(204).send();
});

// GET /api/transactions/summary — spend by category, useful for the "where is my money going" view
router.get("/summary/by-category", (_req, res) => {
  const rows = db
    .prepare(
      `SELECT category, SUM(amount) as total, COUNT(*) as count
       FROM transactions
       WHERE amount < 0
       GROUP BY category
       ORDER BY total ASC`
    )
    .all();
  res.json(rows);
});

export default router;
